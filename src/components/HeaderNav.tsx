import React, { useState, useEffect } from 'react';
import {
  Search,
  ShieldCheck,
  Bell,
  QrCode,
  History,
  HelpCircle,
  User,
  LogOut,
  LogIn,
  MoreVertical,
  Smartphone,
  Zap,
  LayoutDashboard,
  FileText,
  Building2,
  Layers,
  ShieldAlert,
  Sparkles,
  Eye,
  EyeOff,
  Wifi,
  WifiOff,
  RefreshCw,
  Settings,
  Plus,
  Trash2,
  Check,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { UserProfile, NotificationItem, BankAccount, ConnectedPortal, PaymentService } from '../types';
import { DocPayLogo } from './DocPayLogo';
import { BankLogo } from './BankLogo';
import { OfflineStatusToast } from './OfflineStatusToast';

interface Props {
  user: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: NotificationItem[];
  banks?: BankAccount[];
  setBanks?: React.Dispatch<React.SetStateAction<BankAccount[]>>;
  portals?: ConnectedPortal[];
  onOpenSearch?: () => void;
  onOpenBankingOps?: (tab: 'balance' | 'send' | 'receive' | 'self_transfer') => void;
  onOpenBillService?: (service: PaymentService) => void;
  onOpenNotifications: () => void;
  onOpenAuthModal: () => void;
  onOpenProfileModal: () => void;
  onOpenHelpSupport: () => void;
  onOpenQrScanner: () => void;
  onOpenActivityLogs: () => void;
  onOpenLogoutModal: () => void;
  govtCount: number;
  privateCount: number;
  unsafeCount: number;
  isPrivacyMode?: boolean;
  onTogglePrivacyMode?: () => void;
  isOffline?: boolean;
  onToggleSimulatedOffline?: () => void;
}

export const HeaderNav: React.FC<Props> = ({
  user,
  activeTab,
  setActiveTab,
  notifications,
  banks = [],
  setBanks,
  portals = [],
  onOpenSearch,
  onOpenBankingOps,
  onOpenBillService,
  onOpenNotifications,
  onOpenAuthModal,
  onOpenProfileModal,
  onOpenHelpSupport,
  onOpenQrScanner,
  onOpenActivityLogs,
  onOpenLogoutModal,
  govtCount,
  privateCount,
  unsafeCount,
  isPrivacyMode = false,
  onTogglePrivacyMode,
  isOffline: externalOffline,
  onToggleSimulatedOffline,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showBankManagementPopover, setShowBankManagementPopover] = useState(false);
  const [showGlobalSettingsPopover, setShowGlobalSettingsPopover] = useState(false);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const [internalOffline, setInternalOffline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [internalSimulatedOffline, setInternalSimulatedOffline] = useState<boolean>(false);
  const [showOfflineToast, setShowOfflineToast] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setInternalOffline(false);
    const handleOffline = () => setInternalOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const effectiveOffline =
    externalOffline !== undefined
      ? externalOffline
      : internalOffline || internalSimulatedOffline;

  // Automatically show toast when going offline
  useEffect(() => {
    if (effectiveOffline) {
      setShowOfflineToast(true);
    }
  }, [effectiveOffline]);

  const handleToggleOfflineSimulation = () => {
    if (onToggleSimulatedOffline) {
      onToggleSimulatedOffline();
    } else {
      setInternalSimulatedOffline((prev) => !prev);
    }
  };

  const handleRetryConnection = () => {
    if (internalSimulatedOffline) {
      setInternalSimulatedOffline(false);
    } else if (onToggleSimulatedOffline && externalOffline) {
      onToggleSimulatedOffline();
    } else {
      setInternalOffline(!navigator.onLine);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const primaryBank = banks.find((b) => b.isPrimary) || banks[0];

  const handleSetPrimaryBank = (bankId: string) => {
    if (setBanks) {
      setBanks((prev) =>
        prev.map((b) => ({
          ...b,
          isPrimary: b.id === bankId,
        }))
      );
    }
  };

  const handleUnlinkBank = (bankId: string) => {
    if (setBanks) {
      setBanks((prev) => prev.filter((b) => b.id !== bankId));
    }
  };

  const handleTriggerLinkWizard = () => {
    setShowBankManagementPopover(false);
    setActiveTab('banks');
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('open_link_bank_wizard');
      window.dispatchEvent(event);
    }
  };

  return (
    <header className="bg-slate-950/95 backdrop-blur-xl border-b border-amber-500/30 text-white sticky top-0 z-30 shadow-2xl">
      {/* VISUAL OFFLINE BANNER */}
      {effectiveOffline && (
        <div
          id="offline-status-banner"
          className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white px-4 py-2 text-xs sm:text-sm font-bold shadow-xl border-b border-red-400/40 animate-fadeIn"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 animate-pulse border border-white/30">
                <WifiOff className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="text-left">
                <span className="font-extrabold uppercase tracking-wider text-amber-200 mr-2 bg-slate-950/40 px-1.5 py-0.5 rounded text-[10px]">
                  Connection Lost
                </span>
                <span className="text-white/95">
                  You are currently offline. Banking & payment actions are paused to prevent errors.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowOfflineToast(true)}
                id="btn-banner-view-limits"
                className="px-3 py-1 bg-black/40 hover:bg-black/60 active:scale-95 text-amber-200 hover:text-amber-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-amber-300/30 shadow-xs"
                title="View which features are limited while offline"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                <span>Limited Features</span>
              </button>

              <button
                onClick={handleRetryConnection}
                id="btn-banner-retry-connection"
                className="px-3 py-1 bg-white/20 hover:bg-white/30 active:scale-95 text-white rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border border-white/30"
                title="Check connection status"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP MAIN NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Side: Profile Badge & Logo / Brand */}
          <div className="flex items-center gap-3">
            {/* LEFT SIDE PROFILE BADGE */}
            <div
              id="user-profile-badge-left"
              onClick={onOpenProfileModal}
              className="flex items-center gap-2 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 rounded-full border border-amber-500/40 cursor-pointer transition-all shrink-0 shadow-md hover:border-amber-400 group"
              title="Click to view full profile details & settings"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 border-2 border-amber-200 flex items-center justify-center text-[11px] font-black text-slate-950 shrink-0 shadow-sm">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <div className="text-left hidden xs:block pr-1">
                <p className="text-xs font-extrabold text-white leading-tight line-clamp-1 group-hover:text-amber-300 transition-colors">{user.name}</p>
                <p className="text-[9px] text-amber-400 font-mono font-bold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-pulse" /> Gold Tier
                </p>
              </div>
            </div>

            {/* Logo & Brand - Interlocking D+P Highlight Logo */}
            <DocPayLogo
              onClick={() => setActiveTab('dashboard')}
              showText={true}
              iconSize="w-9 h-9"
              textSize="text-xl"
              className="px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 transition-all shadow-xs"
            />
          </div>

          {/* Center Search Symbol Button - Tapping opens dedicated full-page search */}
          <div className="flex-1 flex justify-center max-w-xs sm:max-w-sm mx-2">
            <button
              id="btn-header-search-symbol"
              onClick={() => {
                if (onOpenSearch) onOpenSearch();
                else setActiveTab('search');
              }}
              className="w-full max-w-[280px] px-3.5 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-amber-500/40 hover:border-amber-300 text-amber-300 hover:text-white transition-all cursor-pointer flex items-center justify-between shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] group active:scale-95"
              title="Search Services, Bills & Transfers (Tap to open search page • Ctrl+K)"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-amber-400/15 group-hover:bg-amber-400/25 border border-amber-400/40 flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4 text-amber-400 group-hover:text-amber-300 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xs font-bold text-slate-300 group-hover:text-white truncate">
                  Search DocPay...
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  ⌘K
                </span>
              </div>
            </button>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">

            {/* Pulsing Offline/Online Network Status Dot */}
            {effectiveOffline ? (
              <button
                id="header-offline-status-dot-btn"
                onClick={() => setShowOfflineToast((prev) => !prev)}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-rose-950/90 hover:bg-rose-900/90 border border-rose-500/70 text-rose-300 text-xs font-black transition-all cursor-pointer shadow-lg shadow-rose-950/60 group animate-fadeIn"
                title="Offline Mode Active — Click to view limited features"
              >
                <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-80" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                </span>
                <span className="text-[11px] font-black tracking-tight text-rose-200 group-hover:text-white">
                  Offline
                </span>
                <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.5 rounded-full bg-rose-500/25 text-rose-300 font-mono font-bold border border-rose-500/30">
                  Limited
                </span>
              </button>
            ) : (
              <button
                id="header-online-status-dot-btn"
                onClick={handleToggleOfflineSimulation}
                className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all cursor-pointer group shadow-xs"
                title="Network Connected — Click to simulate Offline mode"
              >
                <span className="relative flex h-2 w-2 items-center justify-center">
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                </span>
                <span className="text-[11px] font-bold text-emerald-400/90 group-hover:text-emerald-200">
                  Online
                </span>
              </button>
            )}
            
            {/* Bell Notifications Button */}
            <button
              id="header-notification-bell-btn"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-amber-400 border border-slate-700 hover:border-amber-500/40 transition-all cursor-pointer shadow-xs group"
              title={`View Notifications (${unreadNotificationsCount} unread)`}
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:rotate-6 text-slate-200 group-hover:text-amber-300" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 flex items-center justify-center text-[10px] font-black rounded-full bg-amber-400 text-slate-950 shadow-md border-2 border-slate-950 animate-bounce">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* THREE DOTS MORE MENU */}
            <div className="relative">
              <button
                id="header-three-dots-btn"
                onClick={() => setShowMoreMenu((prev) => !prev)}
                className={`p-2 rounded-xl transition-all border flex items-center justify-center cursor-pointer ${
                  showMoreMenu
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-2 ring-indigo-400/50'
                    : 'bg-indigo-800/80 hover:bg-indigo-800 text-indigo-100 hover:text-white border-indigo-700'
                }`}
                title="More Options"
              >
                <MoreVertical className="w-5 h-5 text-indigo-100" />
              </button>

              {showMoreMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMoreMenu(false)}
                  />

                  <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 text-white animate-fadeIn space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Quick Options Menu
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">
                        Verified Session
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 max-h-[70vh] overflow-y-auto pr-1 no-scrollbar">
                      <button
                        id="menu-offline-toggle-btn"
                        onClick={handleToggleOfflineSimulation}
                        className={`w-full p-2.5 rounded-xl border transition-all flex items-center gap-3 text-left group shadow-sm cursor-pointer ${
                          effectiveOffline
                            ? 'bg-red-950/80 border-red-500/50 text-red-200'
                            : 'bg-slate-950/90 hover:bg-slate-800 border-slate-800 text-slate-200'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${
                            effectiveOffline
                              ? 'bg-red-500/20 text-red-400 border-red-500/40'
                              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          }`}
                        >
                          {effectiveOffline ? (
                            <WifiOff className="w-5 h-5 text-red-400 animate-pulse" />
                          ) : (
                            <Wifi className="w-5 h-5 text-emerald-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white flex items-center justify-between">
                            <span>Network Connection</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                effectiveOffline
                                  ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                                  : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                              }`}
                            >
                              {effectiveOffline ? 'OFFLINE' : 'ONLINE'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-normal truncate">
                            {effectiveOffline
                              ? 'Click to restore online connection'
                              : 'Click to test offline mode & protections'}
                          </p>
                        </div>
                      </button>

                      <button
                        id="menu-cyber-security-btn"
                        onClick={() => {
                          setShowMoreMenu(false);
                          setActiveTab('fraud');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-full p-2.5 rounded-xl border transition-all flex items-center gap-3 text-left group shadow-sm ${
                          activeTab === 'fraud'
                            ? 'bg-rose-950/90 border-rose-500 text-white ring-1 ring-rose-400/50'
                            : 'bg-slate-950/90 hover:bg-rose-950/50 border-rose-500/30 text-slate-200 hover:text-white'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 border border-rose-500/40 group-hover:scale-105 transition-transform shrink-0">
                          <ShieldAlert className="w-5 h-5 text-rose-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white flex items-center justify-between">
                            <span>Cyber Security & Fraud</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold">Shield</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-normal truncate">
                            Fraud helpline 1930 & safety tools
                          </p>
                        </div>
                      </button>

                      <div className="my-1 border-t border-slate-800" />

                      <button
                        id="menu-help-support-btn"
                        onClick={() => {
                          setShowMoreMenu(false);
                          onOpenHelpSupport();
                        }}
                        className="w-full p-2.5 rounded-xl bg-slate-950/90 hover:bg-emerald-950/60 border border-emerald-500/30 text-slate-200 hover:text-white transition-all flex items-center gap-3 text-left group shadow-sm"
                      >
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/40 group-hover:scale-105 transition-transform shrink-0">
                          <HelpCircle className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white flex items-center justify-between">
                            <span>Help & Refund Support</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">24x7</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-normal truncate">
                            Wrong payment refund & support
                          </p>
                        </div>
                      </button>

                      <button
                        id="menu-notifications-btn"
                        onClick={() => {
                          setShowMoreMenu(false);
                          onOpenNotifications();
                        }}
                        className="w-full p-2.5 rounded-xl bg-slate-950/90 hover:bg-amber-950/60 border border-amber-500/30 text-slate-200 hover:text-white transition-all flex items-center gap-3 text-left group shadow-sm"
                      >
                        <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/40 group-hover:scale-105 transition-transform shrink-0">
                          <Bell className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white flex items-center justify-between">
                            <span>Notifications & Alerts</span>
                            {unreadNotificationsCount > 0 ? (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-mono font-black">
                                {unreadNotificationsCount} NEW
                              </span>
                            ) : (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                                Live
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-normal truncate">
                            OTP, bank updates, documents & security
                          </p>
                        </div>
                      </button>

                      <button
                        id="menu-activity-logs-btn"
                        onClick={() => {
                          setShowMoreMenu(false);
                          onOpenActivityLogs();
                        }}
                        className="w-full p-2.5 rounded-xl bg-slate-950/90 hover:bg-indigo-950/60 border border-indigo-500/30 text-slate-200 hover:text-white transition-all flex items-center gap-3 text-left group shadow-sm"
                      >
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/40 group-hover:scale-105 transition-transform shrink-0">
                          <History className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white flex items-center justify-between">
                            <span>Activity Logs</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">Audit</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-normal truncate">
                            View account history & security audit
                          </p>
                        </div>
                      </button>

                      {user.isLoggedIn ? (
                        <button
                          id="menu-logout-btn"
                          onClick={() => {
                            setShowMoreMenu(false);
                            onOpenLogoutModal();
                          }}
                          className="w-full p-2.5 rounded-xl bg-slate-950/90 hover:bg-rose-950/60 border border-rose-500/30 text-slate-200 hover:text-white transition-all flex items-center gap-3 text-left group shadow-sm"
                        >
                          <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 border border-rose-500/40 group-hover:scale-105 transition-transform shrink-0">
                            <LogOut className="w-5 h-5 text-rose-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-white flex items-center justify-between">
                              <span>Log Out</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">Session</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-normal truncate">
                              End current active session
                            </p>
                          </div>
                        </button>
                      ) : (
                        <button
                          id="menu-login-btn"
                          onClick={() => {
                            setShowMoreMenu(false);
                            onOpenAuthModal();
                          }}
                          className="w-full p-2.5 rounded-xl bg-slate-950/90 hover:bg-indigo-950/60 border border-indigo-500/30 text-slate-200 hover:text-white transition-all flex items-center gap-3 text-left group shadow-sm"
                        >
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/40 group-hover:scale-105 transition-transform shrink-0">
                            <LogIn className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-white flex items-center justify-between">
                              <span>Log In</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">Auth</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-normal truncate">
                              Authenticate and unlock portal
                            </p>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Floating Offline Limitation Toast */}
      <OfflineStatusToast
        isOpen={showOfflineToast && effectiveOffline}
        onClose={() => setShowOfflineToast(false)}
        onRetryConnection={handleRetryConnection}
        isSimulatedOffline={internalSimulatedOffline || Boolean(onToggleSimulatedOffline && externalOffline)}
      />

    </header>
  );
};



