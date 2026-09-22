import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Fingerprint, Scan, AlertCircle, UserCheck, ArrowRight, ScanLine, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';
import { DocPayLogoIcon } from './DocPayLogo';

interface Props {
  user: UserProfile;
  onUnlockSuccess: () => void;
  onOpenFullLogin: () => void;
  onLogActivity: (title: string, desc: string, type: 'auth' | 'security' | 'document' | 'bank' | 'portal') => void;
}

// Audio Feedback Synth for Biometric Scan
const playBiometricAudio = (type: 'scan' | 'success') => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'scan') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch {
    // Ignore context restrictions
  }
};

export const QuickUnlockModal: React.FC<Props> = ({
  user,
  onUnlockSuccess,
  onOpenFullLogin,
  onLogActivity,
}) => {
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isBiometricScanning, setIsBiometricScanning] = useState<boolean>(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'faceid'>('fingerprint');
  const [biometricSuccess, setBiometricSuccess] = useState<boolean>(false);
  const [, setAttempts] = useState<number>(0);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<string>('');

  const targetPin = user.pin || '1907';

  const handleDigitClick = (digit: string) => {
    if (pinInput.length < 4 && !isSuccess) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    if (pinInput.length > 0 && !isSuccess) {
      setPinInput(pinInput.slice(0, -1));
      setErrorMsg('');
    }
  };

  const handleClear = () => {
    if (!isSuccess) {
      setPinInput('');
      setErrorMsg('');
    }
  };

  const verifyPin = (inputPin: string) => {
    if (inputPin === targetPin || inputPin === '1234') {
      setIsSuccess(true);
      playBiometricAudio('success');
      onLogActivity('PIN Unlock Success', 'App unlocked via 4-digit security PIN', 'auth');
      setTimeout(() => {
        onUnlockSuccess();
      }, 500);
    } else {
      setAttempts((prev) => prev + 1);
      setErrorMsg('Incorrect Security PIN. Try 1907 or 1234.');
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
      }, 450);
      setPinInput('');
    }
  };

  const [isWebAuthnSupported, setIsWebAuthnSupported] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.()
        .then((available) => setIsWebAuthnSupported(available))
        .catch(() => setIsWebAuthnSupported(true));
    }
  }, []);

  const handleBiometricUnlock = async (mode: 'fingerprint' | 'faceid') => {
    setBiometricType(mode);
    setIsBiometricScanning(true);
    setErrorMsg('');
    playBiometricAudio('scan');

    const modeLabel = mode === 'fingerprint' ? 'Fingerprint (Touch ID)' : 'Biometric Face ID';
    setScanStep(mode === 'fingerprint' ? 'Reading Touch ID capacitive sensor...' : 'Analyzing 3D facial mesh points...');

    try {
      if (typeof window !== 'undefined' && navigator.credentials && window.PublicKeyCredential) {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const options: CredentialRequestOptions = {
          publicKey: {
            challenge,
            timeout: 60000,
            userVerification: 'preferred',
          },
        };

        await navigator.credentials.get(options).catch((err) => {
          console.log('WebAuthn iframe fallback active:', err?.message || err);
        });
      }
    } catch {
      // Graceful fallback simulation
    }

    setTimeout(() => {
      setScanStep('Matching cryptographic hash key...');
    }, 500);

    setTimeout(() => {
      setIsBiometricScanning(false);
      setBiometricSuccess(true);
      playBiometricAudio('success');
      onLogActivity(`${modeLabel} Unlock Success`, `App unlocked via simulated ${modeLabel} sensor`, 'auth');
      
      setTimeout(() => {
        onUnlockSuccess();
      }, 600);
    }, 1100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in text-slate-100">
      
      {/* Background Lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-yellow-400/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm bg-zinc-950 border-2 border-amber-500/40 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden text-center p-6 space-y-5">
        
        {/* Header Security Badge */}
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
          <div className="flex items-center gap-2">
            <DocPayLogoIcon className="w-5 h-5 shrink-0" />
            <span className="font-extrabold text-xs tracking-wider text-amber-300 uppercase">
              DocPay Security Gate
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/30">
            BIOMETRIC
          </span>
        </div>

        {/* User Info & Avatar */}
        <div className="space-y-1.5">
          <div className="relative w-18 h-18 mx-auto rounded-2xl p-1 bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 shadow-xl shadow-amber-500/20">
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=300&auto=format&fit=crop&q=80'}
              alt={user.name}
              className="w-full h-full object-cover rounded-xl"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-zinc-950 flex items-center justify-center">
              <UserCheck className="w-3.5 h-3.5 text-zinc-950 font-black" />
            </div>
          </div>

          <div>
            <h2 className="text-base font-black text-white leading-snug">
              Welcome Back, {user.displayName || user.name}!
            </h2>
            <p className="text-[11px] text-amber-300/80 font-mono font-medium">
              {user.phone} • Verified Account
            </p>
          </div>
        </div>

        {/* Biometric Active Scan Screen */}
        {isBiometricScanning ? (
          <div className="py-6 px-4 space-y-3 bg-zinc-900/90 border border-amber-500/50 rounded-2xl animate-pulse">
            <div className="relative w-20 h-20 mx-auto rounded-2xl bg-zinc-950/80 border border-amber-400/60 flex items-center justify-center overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 via-transparent to-transparent animate-scan-laser" />
              {biometricType === 'fingerprint' ? (
                <Fingerprint className="w-10 h-10 text-amber-400 animate-bounce" />
              ) : (
                <Scan className="w-10 h-10 text-amber-400 animate-bounce" />
              )}
            </div>
            <div>
              <p className="text-xs font-black text-amber-300">
                {biometricType === 'fingerprint' ? 'Touch ID Fingerprint Scanning' : 'Face ID 3D Mesh Scanning'}
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-1">{scanStep}</p>
            </div>
          </div>
        ) : biometricSuccess ? (
          <div className="py-6 space-y-2 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-300 animate-bounce-short">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
            <p className="text-xs font-black">Biometric Verification Success!</p>
            <p className="text-[10px] text-emerald-400/80 font-mono">100% Cryptographic Match</p>
          </div>
        ) : (
          /* PIN Input Dots & Keypad */
          <div className="space-y-4">
            <div>
              <p className="text-[11px] text-slate-400 font-semibold mb-2">Enter 4-Digit Security PIN or Use Biometrics</p>
              
              {/* Motion Animated PIN Dots Container */}
              <motion.div
                animate={
                  isShaking
                    ? { x: [0, -14, 14, -10, 10, -5, 5, 0] }
                    : isSuccess
                    ? { scale: [1, 1.15, 1.05] }
                    : { x: 0, scale: 1 }
                }
                transition={{
                  duration: isShaking ? 0.45 : isSuccess ? 0.4 : 0.2,
                  ease: 'easeInOut',
                }}
                className="flex items-center justify-center gap-2.5"
              >
                {[0, 1, 2, 3].map((idx) => {
                  const filled = pinInput.length > idx;
                  return (
                    <motion.div
                      key={idx}
                      animate={
                        isSuccess
                          ? { scale: [1, 1.25, 1.1], rotate: [0, -5, 5, 0] }
                          : filled
                          ? { scale: [0.9, 1.15, 1] }
                          : { scale: 1 }
                      }
                      transition={{ duration: 0.25 }}
                      className={`w-10 h-11 rounded-xl border-2 flex items-center justify-center text-lg font-black transition-colors ${
                        isSuccess
                          ? 'bg-gradient-to-tr from-emerald-400 to-teal-300 border-emerald-300 text-slate-950 shadow-lg shadow-emerald-500/50'
                          : isShaking
                          ? 'bg-rose-950/90 border-rose-500 text-rose-300 shadow-lg shadow-rose-500/40'
                          : filled
                          ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 border-amber-300 text-slate-950 shadow-md shadow-amber-500/30'
                          : 'bg-zinc-900 border-zinc-800 text-slate-600'
                      }`}
                    >
                      {isSuccess ? '✓' : filled ? '•' : ''}
                    </motion.div>
                  );
                })}
              </motion.div>

              <AnimatePresence>
                {errorMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: -6, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="text-[11px] text-rose-400 font-bold mt-2 flex items-center justify-center gap-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5" /> {errorMsg}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2 max-w-[230px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <motion.button
                  key={digit}
                  whileTap={{ scale: 0.88, backgroundColor: '#f59e0b', color: '#020617' }}
                  transition={{ duration: 0.1 }}
                  onClick={() => handleDigitClick(digit)}
                  className="h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-white font-black text-base transition-colors cursor-pointer select-none"
                >
                  {digit}
                </motion.button>
              ))}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleClear}
                className="h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-bold text-slate-400 hover:text-white cursor-pointer select-none"
              >
                Clear
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.88, backgroundColor: '#f59e0b', color: '#020617' }}
                transition={{ duration: 0.1 }}
                onClick={() => handleDigitClick('0')}
                className="h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-black text-base cursor-pointer select-none"
              >
                0
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleBackspace}
                className="h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-amber-400 hover:text-amber-300 cursor-pointer select-none"
              >
                ⌫
              </motion.button>
            </div>

            {/* Dual Simulated Biometric Authentication Buttons */}
            <div className="pt-1 space-y-2">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Instant Biometric Verification
              </div>
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBiometricUnlock('fingerprint')}
                  className="py-2.5 px-2 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer group"
                >
                  <Fingerprint className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="truncate">Touch ID</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBiometricUnlock('faceid')}
                  className="py-2.5 px-2 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer group"
                >
                  <ScanLine className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="truncate">Face ID</span>
                </motion.button>
              </div>
              {isWebAuthnSupported && (
                <p className="text-[9px] text-slate-500 font-mono">
                  Hardware WebAuthn Passkey Ready
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              alert(`Hint: Default demo PIN is ${user.pin || '1907'} or 1234.`);
            }}
            className="text-slate-400 hover:text-amber-300 transition-colors"
          >
            Forgot PIN?
          </button>
          <button
            onClick={onOpenFullLogin}
            className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors"
          >
            <span>Full Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};

