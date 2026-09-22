import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, CheckCircle2, Lock, Sparkles, UserCheck, ArrowRight } from 'lucide-react';
import { DocPayLogoIcon } from './DocPayLogo';

interface Props {
  userName?: string;
  onComplete: () => void;
}

export const AuthTransitionOverlay: React.FC<Props> = ({ userName = 'User', onComplete }) => {
  const [phase, setPhase] = useState<'authenticating' | 'decrypting' | 'ready'>('authenticating');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setPhase('decrypting');
    }, 700);

    const timer2 = setTimeout(() => {
      setPhase('ready');
    }, 1400);

    const timer3 = setTimeout(() => {
      onComplete();
    }, 2100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl text-slate-100 overflow-hidden"
    >
      {/* Background Animated Motion Rays & Ambient Lighting */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-amber-500/20 via-yellow-400/10 to-amber-600/20 blur-3xl pointer-events-none"
      />

      {/* Floating Sparkle Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 600),
              opacity: 0.2,
              scale: 0.5,
            }}
            animate={{
              y: ['-20px', '20px', '-20px'],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b]"
          />
        ))}
      </div>

      <div className="relative z-10 max-w-sm w-full p-8 text-center space-y-6">
        
        {/* Animated Central Icon Container */}
        <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
          
          {/* Rotating Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-amber-400/50"
          />

          {/* Pulse Ring */}
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-2 rounded-full bg-amber-500/15 border border-amber-400/30"
          />

          {/* Inner Badge */}
          <motion.div
            initial={{ scale: 0.5, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 text-slate-950 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.5)] z-10"
          >
            {phase === 'ready' ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <CheckCircle2 className="w-10 h-10 text-slate-950 stroke-[2.5]" />
              </motion.div>
            ) : (
              <DocPayLogoIcon className="w-12 h-12 shrink-0 drop-shadow-lg" />
            )}
          </motion.div>
        </div>

        {/* Text Details & Status Steps */}
        <div className="space-y-2">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-black text-white gold-shine-text tracking-tight"
          >
            {phase === 'ready' ? `Welcome, ${userName}!` : 'Authenticating Security Vault'}
          </motion.h3>

          <AnimatePresence mode="wait">
            <motion.p
              key={phase}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-amber-300/90 font-mono font-bold flex items-center justify-center gap-1.5"
            >
              {phase === 'authenticating' && (
                <>
                  <Lock className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                  <span>Verifying 256-Bit Biometric Credentials...</span>
                </>
              )}
              {phase === 'decrypting' && (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-300" />
                  <span>Decrypting NPCI Digital Vault & Accounts...</span>
                </>
              )}
              {phase === 'ready' && (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Access Granted • Opening Home Dashboard...</span>
                </>
              )}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-900 border border-amber-500/30 h-2 rounded-full overflow-hidden p-0.5">
          <motion.div
            initial={{ width: '10%' }}
            animate={{
              width: phase === 'authenticating' ? '40%' : phase === 'decrypting' ? '75%' : '100%',
            }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="h-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-400 rounded-full shadow-[0_0_10px_#f59e0b]"
          />
        </div>

        <p className="text-[10px] text-slate-300 uppercase tracking-widest font-mono">
          DocPay Cyber Security Level 4 • Active Session
        </p>
      </div>
    </motion.div>
  );
};
