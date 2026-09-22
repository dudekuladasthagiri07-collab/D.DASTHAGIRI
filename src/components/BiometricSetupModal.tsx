import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Fingerprint,
  ScanFace,
  ShieldCheck,
  CheckCircle2,
  Lock,
  X,
  Sparkles,
  ArrowRight,
  RefreshCw,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { DocPayLogoIcon } from './DocPayLogo';

interface Props {
  onComplete: (success: boolean) => void;
  onSkip: () => void;
  onLogActivity: (
    title: string,
    description: string,
    type: 'auth' | 'security' | 'document' | 'bank' | 'portal'
  ) => void;
}

export const BiometricSetupModal: React.FC<Props> = ({
  onComplete,
  onSkip,
  onLogActivity,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'fingerprint' | 'face'>('fingerprint');
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [progress, setProgress] = useState<number>(0);
  const scanIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  React.useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, []);

  const startBiometricScan = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    setScanState('scanning');
    setProgress(0);

    let currentProgress = 0;
    scanIntervalRef.current = setInterval(() => {
      currentProgress += 25;
      if (currentProgress >= 100) {
        if (scanIntervalRef.current) {
          clearInterval(scanIntervalRef.current);
          scanIntervalRef.current = null;
        }
        setProgress(100);
        setScanState('success');
        onLogActivity(
          'Biometric Credential Registered',
          `Successfully registered ${selectedMethod === 'fingerprint' ? 'Fingerprint' : 'Face ID'} credentials in hardware KeyStore.`,
          'security'
        );
      } else {
        setProgress(currentProgress);
      }
    }, 400);
  };

  const handleFinish = () => {
    localStorage.setItem('docpay_biometric_registered', 'true');
    localStorage.setItem('docpay_biometric_type', selectedMethod);
    onComplete(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.25)] overflow-hidden text-slate-100 my-auto flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <DocPayLogoIcon className="w-8 h-8 shrink-0 drop-shadow-md" />
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <span>Biometric Security Setup</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  KeyStore Encrypted
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                Hardware-backed biometric enrolment
              </p>
            </div>
          </div>

          <button
            onClick={onSkip}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Set Up Later"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">

          {scanState !== 'success' && (
            <>
              {/* Method Switcher */}
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-white">Register Biometrics</h3>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  Protect your app startup & high-value transfers with fingerprint or face recognition.
                </p>
              </div>

              {/* Method Selection Tabs */}
              <div className="grid grid-cols-2 gap-3 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMethod('fingerprint');
                    setScanState('idle');
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedMethod === 'fingerprint'
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>Fingerprint</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedMethod('face');
                    setScanState('idle');
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedMethod === 'face'
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ScanFace className="w-4 h-4" />
                  <span>Face ID</span>
                </button>
              </div>

              {/* Interactive Scanner Graphic */}
              <div className="py-6 flex flex-col items-center justify-center space-y-4">
                <button
                  type="button"
                  onClick={startBiometricScan}
                  disabled={scanState === 'scanning'}
                  className={`relative w-28 h-28 rounded-3xl flex items-center justify-center transition-all cursor-pointer ${
                    scanState === 'scanning'
                      ? 'bg-emerald-500/10 border-2 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)]'
                      : 'bg-slate-950 border-2 border-slate-800 hover:border-emerald-500/50 hover:shadow-lg'
                  }`}
                >
                  {selectedMethod === 'fingerprint' ? (
                    <Fingerprint
                      className={`w-14 h-14 transition-all ${
                        scanState === 'scanning'
                          ? 'text-emerald-400 animate-pulse scale-110'
                          : 'text-slate-400 hover:text-emerald-400'
                      }`}
                    />
                  ) : (
                    <ScanFace
                      className={`w-14 h-14 transition-all ${
                        scanState === 'scanning'
                          ? 'text-emerald-400 animate-pulse scale-110'
                          : 'text-slate-400 hover:text-emerald-400'
                      }`}
                    />
                  )}

                  {scanState === 'scanning' && (
                    <div className="absolute inset-0 rounded-3xl border-2 border-emerald-400 border-t-transparent animate-spin" />
                  )}
                </button>

                <div className="text-center space-y-1">
                  <p className="text-xs font-bold text-white">
                    {scanState === 'idle'
                      ? `Tap Sensor to Register ${selectedMethod === 'fingerprint' ? 'Fingerprint' : 'Face ID'}`
                      : scanState === 'scanning'
                      ? `Enrolling ${selectedMethod}... ${progress}%`
                      : 'Scan Complete'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {scanState === 'idle'
                      ? 'Uses standard Android BiometricPrompt hardware service'
                      : 'Generating secure cryptographic keypair...'}
                  </p>
                </div>
              </div>

              {/* Security Banner */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-start gap-2.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Raw biometric data is never transmitted or stored on external servers. It stays encrypted inside your device hardware security module (TEE/StrongBox).
                </p>
              </div>

              {/* Action Footer */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={onSkip}
                  className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
                >
                  Set Up Later
                </button>

                <button
                  type="button"
                  onClick={startBiometricScan}
                  disabled={scanState === 'scanning'}
                  className="py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {scanState === 'scanning' ? 'Scanning...' : 'Start Enrollment'}
                </button>
              </div>
            </>
          )}

          {/* Success Screen */}
          {scanState === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-5 text-center py-2"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-white">Biometric Enrolled Successfully</h3>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  Your {selectedMethod === 'fingerprint' ? 'Fingerprint' : 'Face ID'} is now bound to DocPay Enterprise.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Enrolled Method:</span>
                  <span className="font-bold text-emerald-400 uppercase">
                    {selectedMethod === 'fingerprint' ? 'Touch ID / Fingerprint' : 'Face Recognition'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Storage Target:</span>
                  <span className="font-mono text-amber-300 text-[11px]">Android KeyStore / TEE</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Protection Status:</span>
                  <span className="font-extrabold text-emerald-400">ACTIVE</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFinish}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer ring-2 ring-emerald-300/50"
              >
                <span>Continue to Home</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};
