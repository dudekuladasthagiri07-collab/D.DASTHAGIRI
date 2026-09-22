import React from 'react';
import { LogOut, ShieldAlert, CheckCircle2, Lock, ArrowRight, X } from 'lucide-react';
import { UserProfile } from '../types';

interface Props {
  user: UserProfile;
  onConfirmLogout: () => void;
  onClose: () => void;
}

export const LogoutModal: React.FC<Props> = ({ user, onConfirmLogout, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white">
        
        {/* Top Decorative Header */}
        <div className="p-6 bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 border-b border-slate-800 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <LogOut className="w-8 h-8 animate-pulse" />
          </div>

          <h3 className="font-extrabold text-lg text-white">Confirm Account Logout</h3>
          <p className="text-xs text-slate-400 mt-1">
            Are you sure you want to end your current active session on DocPay?
          </p>
        </div>

        {/* User Card */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-emerald-500 border-2 border-emerald-400 shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-white">{user.name}</h4>
              <p className="text-xs text-slate-400 font-mono">{user.phone}</p>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mt-0.5">
                <CheckCircle2 className="w-3 h-3" /> Biometric & OTP Verified
              </span>
            </div>
          </div>

          {/* Security Alert Note */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
            <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div className="space-y-0.5">
              <p className="font-bold text-amber-200">Session Lock Protection</p>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Logging out will lock your local Docpay Verified vault, bank transaction tokens, and biometric session. You can re-authenticate anytime with your 4-digit PIN.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-all"
            >
              Cancel & Stay
            </button>

            <button
              onClick={onConfirmLogout}
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Yes, Log Out</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
