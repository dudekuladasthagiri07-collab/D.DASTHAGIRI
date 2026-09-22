import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  WifiOff,
  Wifi,
  AlertTriangle,
  CheckCircle2,
  X,
  RefreshCw,
  ShieldCheck,
  ZapOff,
  FileText,
  PhoneCall,
  History,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRetryConnection: () => void;
  isSimulatedOffline?: boolean;
}

export const OfflineStatusToast: React.FC<Props> = ({
  isOpen,
  onClose,
  onRetryConnection,
  isSimulatedOffline,
}) => {
  const [showDetailedList, setShowDetailedList] = useState(true);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        id="offline-limitation-toast"
        className="fixed top-20 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] bg-slate-900/98 backdrop-blur-xl border-2 border-rose-500/80 rounded-2xl shadow-[0_10px_40px_rgba(244,63,94,0.3)] text-white p-4 overflow-hidden"
      >
        {/* Top ambient glow strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 animate-pulse" />

        {/* Header Row */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60" />
              <WifiOff className="w-4 h-4 text-rose-400 relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-white tracking-tight">Offline Mode Active</h4>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse mr-1" />
                  Limited Access
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Network connection is unavailable. Safe offline sandbox enabled.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            id="btn-close-offline-toast"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toggleable Details Accordion */}
        <div className="mt-3 bg-slate-950/80 rounded-xl p-3 border border-slate-800 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Feature Availability Matrix
            </span>
            <button
              onClick={() => setShowDetailedList(!showDetailedList)}
              className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center gap-0.5 cursor-pointer font-semibold"
            >
              {showDetailedList ? 'Collapse' : 'Expand'}
              {showDetailedList ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {showDetailedList && (
            <div className="space-y-2.5 pt-1 text-[11px] animate-fadeIn">
              {/* Temporarily Disabled */}
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400 mb-1 flex items-center gap-1">
                  <ZapOff className="w-3 h-3" />
                  Temporarily Paused (Requires Network):
                </p>
                <ul className="space-y-1 text-slate-300 pl-1.5">
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                    <span>Live UPI & Bank Money Transfers</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                    <span>Mobile & DTH Recharge Orders</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                    <span>Live NPCI Bank Balance Refresh</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                    <span>New Loan & Insurance Applications</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                    <span>Sponsored Ads Video Verification & Rewards</span>
                  </li>
                </ul>
              </div>

              {/* Working Offline */}
              <div className="pt-1.5 border-t border-slate-800">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Still Available Offline (Cached Safe Mode):
                </p>
                <ul className="space-y-1 text-slate-300 pl-1.5">
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>DocPay ID Cards & Offline QR Vault</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>Saved Passbook & Transaction History</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>Direct Cyber Fraud Helpline (Dial 1930)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>Local Biometric & PIN Unlock</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls Footer */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            onClick={onRetryConnection}
            id="btn-retry-connection-toast"
            className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isSimulatedOffline ? 'Restore Connection' : 'Retry Connection'}</span>
          </button>
          
          <button
            onClick={onClose}
            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Got It
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
