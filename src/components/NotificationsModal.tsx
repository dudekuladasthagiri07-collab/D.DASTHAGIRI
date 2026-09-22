import React, { useState } from 'react';
import {
  Bell,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  X,
  Check,
  Building2,
  FileCheck,
  KeyRound,
  Clock,
  XCircle,
  Volume2,
  VolumeX,
  Trash2,
  Filter,
  ExternalLink,
  Sparkles,
  Zap,
} from 'lucide-react';
import { NotificationItem } from '../types';
import { isNotificationSoundEnabled, setNotificationSoundEnabled, playNotificationChime } from '../utils/soundEffects';

interface Props {
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onDismissNotification: (id: string) => void;
  onDismissAllNotifications: () => void;
  onTriggerTestEvent?: (eventType: 'otp_success' | 'doc_upload' | 'bank_pending' | 'bank_success' | 'bank_failed' | 'security_alert') => void;
  onNavigateTab?: (tab: string) => void;
  onClose: () => void;
}

export const NotificationsModal: React.FC<Props> = ({
  notifications,
  onMarkAllRead,
  onDismissNotification,
  onDismissAllNotifications,
  onTriggerTestEvent,
  onNavigateTab,
  onClose,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'otp' | 'document' | 'bank' | 'security' | 'unread'>('all');
  const [soundOn, setSoundOn] = useState<boolean>(() => isNotificationSoundEnabled());
  const [showSimulators, setShowSimulators] = useState(true);

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setNotificationSoundEnabled(next);
    if (next) {
      playNotificationChime('success');
    }
  };

  // Filter count calculations
  const totalCount = notifications.length;
  const unreadCount = notifications.filter((n) => !n.read).length;
  const otpCount = notifications.filter((n) => n.type === 'otp' || n.category === 'otp').length;
  const docCount = notifications.filter((n) => n.type === 'document' || n.category === 'document').length;
  const bankCount = notifications.filter((n) => n.type === 'bank' || n.category === 'bank').length;
  const securityCount = notifications.filter((n) => n.type === 'security' || n.type === 'alert' || n.category === 'security').length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'otp') return n.type === 'otp' || n.category === 'otp';
    if (activeFilter === 'document') return n.type === 'document' || n.category === 'document';
    if (activeFilter === 'bank') return n.type === 'bank' || n.category === 'bank';
    if (activeFilter === 'security') return n.type === 'security' || n.type === 'alert' || n.category === 'security';
    return true;
  });

  const renderIcon = (n: NotificationItem) => {
    if (n.type === 'security' || n.status === 'warning') {
      return <ShieldAlert className="w-4 h-4 text-rose-500" />;
    }
    if (n.type === 'otp') {
      return <KeyRound className="w-4 h-4 text-emerald-500" />;
    }
    if (n.type === 'document') {
      return <FileCheck className="w-4 h-4 text-blue-500" />;
    }
    if (n.type === 'bank') {
      if (n.status === 'pending') {
        return <Clock className="w-4 h-4 text-amber-500 animate-spin" />;
      }
      if (n.status === 'failed') {
        return <XCircle className="w-4 h-4 text-rose-500" />;
      }
      return <Building2 className="w-4 h-4 text-emerald-500" />;
    }
    if (n.type === 'alert') {
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    }
    return <CheckCircle2 className="w-4 h-4 text-cyan-500" />;
  };

  const getCategoryBadge = (n: NotificationItem) => {
    if (n.type === 'security' || n.status === 'warning') {
      return { text: 'SECURITY ALERT', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    }
    if (n.type === 'otp') {
      return { text: 'OTP VERIFIED', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    if (n.type === 'document') {
      return { text: 'DOCUMENT VAULT', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
    if (n.type === 'bank') {
      if (n.status === 'pending') {
        return { text: 'BANK LINK PENDING', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      }
      if (n.status === 'failed') {
        return { text: 'BANK LINK FAILED', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      }
      return { text: 'BANK LINKED', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    if (n.type === 'alert') {
      return { text: 'ALERT NOTICE', color: 'bg-amber-50 text-amber-800 border-amber-200' };
    }
    return { text: 'NOTIFICATION', color: 'bg-slate-100 text-slate-700 border-slate-200' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-5 sm:p-6 relative text-slate-800 shadow-2xl space-y-4 max-h-[88vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">Notifications & Alerts</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 shadow-xs">
                    {unreadCount} NEW
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Real-time updates for OTP, KYC documents, bank linking & security alerts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio chime toggle */}
            <button
              id="btn-toggle-notification-sound"
              onClick={handleToggleSound}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                soundOn
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}
              title={soundOn ? 'Notification sounds enabled (Click to mute)' : 'Notification sounds muted (Click to enable)'}
              aria-label={soundOn ? 'Mute notification sound' : 'Unmute notification sound'}
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Close modal */}
            <button
              id="btn-close-notification-modal"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
              title="Close Notifications"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Simulation / Test Event Trigger Bar */}
        {onTriggerTestEvent && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl shrink-0 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Test Event Triggers:
              </span>
              <button
                onClick={() => setShowSimulators((prev) => !prev)}
                className="text-[10px] text-slate-500 hover:text-slate-800 underline"
              >
                {showSimulators ? 'Hide Triggers' : 'Show Triggers'}
              </button>
            </div>

            {showSimulators && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px]">
                <button
                  id="trigger-otp-success-btn"
                  onClick={() => onTriggerTestEvent('otp_success')}
                  className="px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <KeyRound className="w-3 h-3 text-emerald-600" />
                  OTP Verified
                </button>

                <button
                  id="trigger-doc-upload-btn"
                  onClick={() => onTriggerTestEvent('doc_upload')}
                  className="px-2 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <FileCheck className="w-3 h-3 text-blue-600" />
                  Doc Uploaded
                </button>

                <button
                  id="trigger-bank-pending-btn"
                  onClick={() => onTriggerTestEvent('bank_pending')}
                  className="px-2 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Clock className="w-3 h-3 text-amber-600" />
                  Bank: Pending
                </button>

                <button
                  id="trigger-bank-success-btn"
                  onClick={() => onTriggerTestEvent('bank_success')}
                  className="px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Building2 className="w-3 h-3 text-emerald-600" />
                  Bank: Linked
                </button>

                <button
                  id="trigger-bank-failed-btn"
                  onClick={() => onTriggerTestEvent('bank_failed')}
                  className="px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <XCircle className="w-3 h-3 text-rose-600" />
                  Bank: Failed
                </button>

                <button
                  id="trigger-security-alert-btn"
                  onClick={() => onTriggerTestEvent('security_alert')}
                  className="px-2 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-950 border border-rose-300 font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <ShieldAlert className="w-3 h-3 text-rose-600" />
                  Security Alert
                </button>
              </div>
            )}
          </div>
        )}

        {/* Filter Pills & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'unread'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setActiveFilter('otp')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'otp'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              OTP ({otpCount})
            </button>
            <button
              onClick={() => setActiveFilter('document')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'document'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              Docs ({docCount})
            </button>
            <button
              onClick={() => setActiveFilter('bank')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'bank'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              Banks ({bankCount})
            </button>
            <button
              onClick={() => setActiveFilter('security')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'security'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              Security ({securityCount})
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {unreadCount > 0 && (
              <button
                id="btn-mark-all-read"
                onClick={onMarkAllRead}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Check className="w-3.5 h-3.5" /> Mark All Read
              </button>
            )}
            {totalCount > 0 && (
              <button
                id="btn-clear-all-notifications"
                onClick={onDismissAllNotifications}
                className="text-[11px] text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto space-y-2.5 pr-1 text-xs flex-1 divide-y divide-slate-100">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center space-y-2 my-auto">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Bell className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-700">No Notifications Here</h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                {activeFilter === 'unread'
                  ? 'You are all caught up! No unread security alerts or updates.'
                  : 'No notifications found for this category. Use the test triggers above to simulate events.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const badge = getCategoryBadge(n);
              return (
                <div
                  key={n.id}
                  className={`pt-2.5 first:pt-0 p-3 rounded-2xl border transition-all space-y-2 relative group ${
                    !n.read
                      ? 'bg-amber-50/70 border-amber-200/80 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="p-1.5 rounded-lg bg-white shadow-xs border border-slate-100">
                        {renderIcon(n)}
                      </div>
                      <span className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-md border ${badge.color}`}>
                        {badge.text}
                      </span>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {n.timestamp}
                      </span>
                      {/* Individual Dismiss Button */}
                      <button
                        id={`btn-dismiss-item-${n.id}`}
                        onClick={() => onDismissNotification(n.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                        title="Dismiss this notification"
                        aria-label="Dismiss notification"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-900 leading-snug">
                      {n.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                  </div>

                  {/* Optional Action Button */}
                  {(n.actionLabel || n.actionTab) && onNavigateTab && (
                    <div className="pt-1 flex items-center justify-between">
                      <button
                        onClick={() => {
                          if (n.actionTab) {
                            onNavigateTab(n.actionTab);
                            onClose();
                          }
                        }}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        <span>{n.actionLabel || `Open ${n.actionTab}`}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>{totalCount} total • {unreadCount} unread</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
