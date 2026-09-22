import React, { useState } from 'react';
import { motion } from 'motion/react';
import { QrCode, Copy, Check, Share2, Download, Printer, X, ShieldCheck, Sparkles } from 'lucide-react';
import { UpiProfile, UserProfile } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  upiProfile: UpiProfile;
  user?: UserProfile;
}

export const UpiQrModal: React.FC<Props> = ({ isOpen, onClose, upiProfile, user }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [shared, setShared] = useState<boolean>(false);

  if (!isOpen) return null;

  const displayName = user?.name || 'DUDEKULA DASTHAGIRI';
  const vpa = upiProfile.primaryVpa || 'dasthagiri@upi';
  const qrString = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(displayName)}&mc=0000&mode=02&purpose=00`;

  const handleCopyVpa = () => {
    navigator.clipboard?.writeText(vpa);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Pay ${displayName} via UPI`,
          text: `Scan & pay ${displayName} using UPI ID: ${vpa}`,
          url: window.location.href,
        })
        .catch(() => {});
    }
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1.5 mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>NPCI Unified QR • All UPI Apps Accepted</span>
          </div>
          <h3 className="text-lg font-black text-slate-900">{displayName}</h3>
          <p className="text-xs text-slate-500 font-mono flex items-center justify-center gap-1">
            <span>UPI ID:</span>
            <span className="font-bold text-blue-700">{vpa}</span>
          </p>
        </div>

        {/* QR Code Container */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-blue-50/70 via-slate-50 to-white border-2 border-dashed border-blue-200 flex flex-col items-center justify-center relative shadow-inner mb-5">
          {/* Simulated High-Res SVG QR Code */}
          <div className="w-52 h-52 bg-white p-3 rounded-2xl border border-slate-200 shadow-md flex items-center justify-center relative group">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full text-slate-900"
              fill="currentColor"
            >
              {/* Corner squares (Standard QR markers) */}
              <rect x="15" y="15" width="45" height="45" rx="6" fill="#0B132B" />
              <rect x="23" y="23" width="29" height="29" rx="3" fill="#ffffff" />
              <rect x="30" y="30" width="15" height="15" rx="2" fill="#2563EB" />

              <rect x="140" y="15" width="45" height="45" rx="6" fill="#0B132B" />
              <rect x="148" y="23" width="29" height="29" rx="3" fill="#ffffff" />
              <rect x="155" y="30" width="15" height="15" rx="2" fill="#2563EB" />

              <rect x="15" y="140" width="45" height="45" rx="6" fill="#0B132B" />
              <rect x="23" y="148" width="29" height="29" rx="3" fill="#ffffff" />
              <rect x="30" y="155" width="15" height="15" rx="2" fill="#2563EB" />

              {/* Data matrix dots */}
              <rect x="70" y="20" width="10" height="10" rx="1.5" fill="#0F172A" />
              <rect x="90" y="20" width="10" height="10" rx="1.5" fill="#0F172A" />
              <rect x="110" y="20" width="10" height="10" rx="1.5" fill="#0F172A" />
              <rect x="70" y="40" width="10" height="10" rx="1.5" fill="#2563EB" />
              <rect x="100" y="40" width="10" height="10" rx="1.5" fill="#0F172A" />
              <rect x="120" y="40" width="10" height="10" rx="1.5" fill="#0F172A" />

              <rect x="20" y="70" width="10" height="10" rx="1.5" fill="#0F172A" />
              <rect x="40" y="70" width="10" height="10" rx="1.5" fill="#2563EB" />
              <rect x="70" y="70" width="10" height="10" rx="1.5" fill="#0F172A" />
              <rect x="110" y="70" width="10" height="10" rx="1.5" fill="#2563EB" />
              <rect x="140" y="70" width="10" height="10" rx="1.5" fill="#0F172A" />
              <rect x="160" y="70" width="10" height="10" rx="1.5" fill="#0F172A" />

              {/* Center UPI Shield Logo */}
              <circle cx="100" cy="100" r="22" fill="#ffffff" stroke="#E2E8F0" strokeWidth="2" />
              <circle cx="100" cy="100" r="17" fill="#1E3A8A" />
              <path d="M93 100 L98 105 L108 94" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

              {/* Bottom data elements */}
              <rect x="70" y="110" width="10" height="10" rx="1.5" fill="#0F172A" />
              <rect x="120" y="110" width="10" height="10" rx="1.5" fill="#0F172A" />
              <rect x="80" y="130" width="10" height="10" rx="1.5" fill="#2563EB" />
              <rect x="100" y="130" width="10" height="10" rx="1.5" fill="#0F172A" />
              <rect x="130" y="130" width="10" height="10" rx="1.5" fill="#0F172A" />
              <rect x="160" y="130" width="10" height="10" rx="1.5" fill="#2563EB" />

              <rect x="70" y="150" width="10" height="10" rx="1.5" fill="#0F172A" />
              <rect x="100" y="150" width="10" height="10" rx="1.5" fill="#0F172A" />
              <rect x="130" y="150" width="10" height="10" rx="1.5" fill="#0F172A" />
              <rect x="80" y="170" width="10" height="10" rx="1.5" fill="#0F172A" />
              <rect x="110" y="170" width="10" height="10" rx="1.5" fill="#2563EB" />
              <rect x="150" y="170" width="10" height="10" rx="1.5" fill="#0F172A" />
            </svg>
          </div>

          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Scan with PhonePe, Paytm, GPay, BHIM</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleCopyVpa}
            className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'VPA Copied!' : 'Copy UPI ID'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            {shared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{shared ? 'Link Shared!' : 'Share QR'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
