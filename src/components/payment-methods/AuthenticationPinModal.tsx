import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, Fingerprint, X, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  actionDescription?: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const AuthenticationPinModal: React.FC<Props> = ({
  isOpen,
  title = 'Verify UPI PIN',
  subtitle = 'Enter your 4-digit UPI PIN to authenticate this action',
  actionDescription,
  onSuccess,
  onClose,
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isBiometricActive, setIsBiometricActive] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError('');
      if (nextPin.length === 4) {
        setTimeout(() => {
          setPin('');
          onSuccess();
        }, 300);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleBiometricAuth = () => {
    setIsBiometricActive(true);
    setTimeout(() => {
      setIsBiometricActive(false);
      onSuccess();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          title="Cancel"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">{subtitle}</p>
          {actionDescription && (
            <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200/70 text-blue-900 text-xs font-semibold">
              {actionDescription}
            </div>
          )}
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center items-center gap-3.5 my-6">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                pin.length > idx
                  ? 'bg-blue-600 scale-110 shadow-sm shadow-blue-500/50'
                  : 'border-2 border-slate-300 bg-slate-100'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold justify-center mb-4">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-12 rounded-2xl bg-slate-50 hover:bg-blue-50 active:bg-blue-100 border border-slate-200 hover:border-blue-300 text-slate-800 hover:text-blue-700 font-black text-lg transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-xs"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleBiometricAuth}
            className="h-12 rounded-2xl bg-slate-50 hover:bg-emerald-50 active:bg-emerald-100 border border-slate-200 text-emerald-600 font-bold transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-xs"
            title="Use Biometrics"
          >
            <Fingerprint className={`w-6 h-6 ${isBiometricActive ? 'animate-pulse text-emerald-500' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-12 rounded-2xl bg-slate-50 hover:bg-blue-50 active:bg-blue-100 border border-slate-200 hover:border-blue-300 text-slate-800 hover:text-blue-700 font-black text-lg transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-xs"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-12 rounded-2xl bg-slate-50 hover:bg-rose-50 active:bg-rose-100 border border-slate-200 text-slate-600 hover:text-rose-600 font-bold text-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-xs"
          >
            Clear
          </button>
        </div>

        {/* Security watermark */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-100">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>NPCI 256-BIT ENCRYPTED UPI PIN</span>
        </div>
      </motion.div>
    </div>
  );
};
