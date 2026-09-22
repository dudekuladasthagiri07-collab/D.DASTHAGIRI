import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Camera,
  Bell,
  Fingerprint,
  Image,
  MapPin,
  Mic,
  X,
  CheckCircle2,
  AlertTriangle,
  Settings,
  ChevronRight,
  Info,
  RefreshCw,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { AppPermissionSettings, PermissionStatus } from '../types';

interface Props {
  permissions: AppPermissionSettings;
  onUpdatePermissions: (updated: AppPermissionSettings) => void;
  onClose: () => void;
  onLogActivity: (
    title: string,
    description: string,
    type: 'auth' | 'security' | 'document' | 'bank' | 'portal'
  ) => void;
}

export const PermissionsCenterModal: React.FC<Props> = ({
  permissions,
  onUpdatePermissions,
  onClose,
  onLogActivity,
}) => {
  const [activeManagePermission, setActiveManagePermission] = useState<keyof AppPermissionSettings | null>(null);
  const [showSystemSettingsToast, setShowSystemSettingsToast] = useState(false);

  // Toggle permission status helper
  const handleTogglePermission = (key: keyof AppPermissionSettings, newStatus: PermissionStatus) => {
    const updated = { ...permissions, [key]: newStatus };
    onUpdatePermissions(updated);
    localStorage.setItem('docpay_app_permissions', JSON.stringify(updated));

    const statusLabel = newStatus === 'allowed' ? 'Allowed / Enabled' : 'Denied / Disabled';
    onLogActivity(
      `Permission Center Updated`,
      `Updated ${key} status to ${statusLabel}`,
      'security'
    );
    setActiveManagePermission(null);
  };

  const handleSimulateOpenSystemSettings = () => {
    setShowSystemSettingsToast(true);
    setTimeout(() => setShowSystemSettingsToast(false), 4000);
  };

  const permissionList: {
    key: keyof AppPermissionSettings;
    title: string;
    description: string;
    icon: any;
    allowedLabel: string;
    deniedLabel: string;
  }[] = [
    {
      key: 'camera',
      title: 'Camera',
      description: 'Used for scanning QR codes, uploading identity documents & live face capture.',
      icon: Camera,
      allowedLabel: 'Allowed',
      deniedLabel: 'Denied',
    },
    {
      key: 'notifications',
      title: 'Notifications',
      description: 'Used for payment alerts, autopay reminders & critical security login warnings.',
      icon: Bell,
      allowedLabel: 'Allowed',
      deniedLabel: 'Denied',
    },
    {
      key: 'biometrics',
      title: 'Biometrics',
      description: 'Fingerprint & Face ID authentication for fast, secure app unlock & payment signoff.',
      icon: Fingerprint,
      allowedLabel: 'Enabled',
      deniedLabel: 'Disabled',
    },
    {
      key: 'photosMedia',
      title: 'Photos/Media',
      description: 'Used for uploading document images from gallery and saving downloaded PDFs.',
      icon: Image,
      allowedLabel: 'Allowed',
      deniedLabel: 'Denied',
    },
    {
      key: 'location',
      title: 'Location',
      description: 'Required only when geofenced fraud prevention or ATM locator is activated.',
      icon: MapPin,
      allowedLabel: 'Allowed',
      deniedLabel: 'Denied',
    },
    {
      key: 'microphone',
      title: 'Microphone',
      description: 'Requested only when using hands-free voice assistant features.',
      icon: Mic,
      allowedLabel: 'Allowed',
      deniedLabel: 'Denied',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-100 flex flex-col max-h-[90vh]">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>Permissions & Privacy Center</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Manage hardware permissions & data privacy rules for DocPay
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* System Settings Toast Banner */}
        <AnimatePresence>
          {showSystemSettingsToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="m-4 p-3 rounded-2xl bg-indigo-950 border border-indigo-500/50 text-indigo-200 text-xs font-bold flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-300 animate-spin" />
                <span>Redirecting to Android OS Settings → Apps → DocPay → Permissions...</span>
              </div>
              <button
                onClick={() => setShowSystemSettingsToast(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Permission Center Table Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">

          {/* Privacy Guarantee Info Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h4 className="font-bold text-white">Android System Permission Rule</h4>
              <p className="text-slate-400 leading-relaxed">
                Permissions are requested individually as required. If a permission is revoked, the feature will prompt you at the moment it is accessed.
              </p>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
            
            {/* Table Header */}
            <div className="grid grid-cols-12 px-4 py-3 bg-slate-900 border-b border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-400">
              <div className="col-span-5">Permission</div>
              <div className="col-span-4 text-center">Status</div>
              <div className="col-span-3 text-right">Action</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-800/70">
              {permissionList.map((item) => {
                const isAllowed = permissions[item.key] === 'allowed';
                const IconComponent = item.icon;

                return (
                  <div
                    key={item.key}
                    className="grid grid-cols-12 px-4 py-3.5 items-center hover:bg-slate-900/50 transition-colors text-xs"
                  >
                    {/* Permission Name & Icon */}
                    <div className="col-span-5 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center shrink-0">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">{item.title}</h5>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{item.description}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="col-span-4 flex justify-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${
                          isAllowed
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isAllowed ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>{item.allowedLabel}</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3 text-slate-400" />
                            <span>{item.deniedLabel}</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Manage Button */}
                    <div className="col-span-3 text-right">
                      <button
                        type="button"
                        onClick={() => setActiveManagePermission(item.key)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 text-[11px] font-extrabold transition-all cursor-pointer"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick System Settings Action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSimulateOpenSystemSettings}
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-amber-400" />
              <span>Open Android Application System Settings</span>
            </button>
          </div>

        </div>
      </div>

      {/* Manage Specific Permission Sub-Modal */}
      <AnimatePresence>
        {activeManagePermission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl text-slate-100 space-y-4"
            >
              {(() => {
                const item = permissionList.find((p) => p.key === activeManagePermission);
                if (!item) return null;

                const isAllowed = permissions[item.key] === 'allowed';
                const IconComp = item.icon;

                return (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-amber-400 flex items-center justify-center">
                          <IconComp className="w-5 h-5" />
                        </div>
                        <h4 className="font-extrabold text-sm text-white">Manage {item.title}</h4>
                      </div>
                      <button
                        onClick={() => setActiveManagePermission(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                      {item.description}
                    </p>

                    <div className="space-y-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleTogglePermission(item.key, 'allowed')}
                        className={`w-full py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          isAllowed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Grant / Allow Permission</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTogglePermission(item.key, 'denied')}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          !isAllowed
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 cursor-default'
                            : 'bg-rose-950/60 hover:bg-rose-900 text-rose-200 border border-rose-500/40'
                        }`}
                      >
                        <X className="w-4 h-4" />
                        <span>Revoke / Deny Permission</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleSimulateOpenSystemSettings();
                          setActiveManagePermission(null);
                        }}
                        className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
                      >
                        Open System App Settings
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
