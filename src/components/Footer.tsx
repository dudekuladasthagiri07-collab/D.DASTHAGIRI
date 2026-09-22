import React from 'react';
import { Mail, Lock, LogOut } from 'lucide-react';
import { DocPayLogo } from './DocPayLogo';

interface Props {
  onOpenAuthModal?: () => void;
  onOpenLogoutModal?: () => void;
}

export const Footer: React.FC<Props> = ({ onOpenAuthModal, onOpenLogoutModal }) => {
  return (
    <footer className="mt-12 bg-slate-100 border-t border-slate-200 text-slate-500 text-xs py-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <DocPayLogo variant="light" iconSize="w-8 h-8" textSize="text-base" />
          <div className="border-l border-slate-300 pl-3">
            <p className="font-bold text-slate-800">Unified Verification Portal</p>
            <p className="text-[11px] text-slate-500">Secure Access to Banking & Government Services</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1 text-slate-600">
            <Mail className="w-3.5 h-3.5 text-indigo-600" /> Support: support@docpay.com
          </span>
          <span className="flex items-center gap-1 text-slate-600">
            <Lock className="w-3.5 h-3.5 text-emerald-600" /> 256-Bit TLS Encrypted
          </span>
          {onOpenLogoutModal && (
            <button
              onClick={onOpenLogoutModal}
              className="flex items-center gap-1 text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Log Out
            </button>
          )}
        </div>

        <div className="text-[11px] text-slate-500 text-center md:text-right">
          <p>© 2026 DocPay System. All rights reserved.</p>
          <p className="text-[10px] text-slate-400">Educational Simulation Engine</p>
        </div>

      </div>
    </footer>
  );
};
