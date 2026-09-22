import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  X,
  Building2,
  FileCheck,
  KeyRound,
  Clock,
  ExternalLink,
  Trash2,
  Info,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { InAppToast, NotificationItem } from '../types';

interface Props {
  toasts: InAppToast[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
  onSelectNotification?: (notification: NotificationItem) => void;
}

export const ToastNotificationStack: React.FC<Props> = ({
  toasts,
  onDismiss,
  onDismissAll,
  onSelectNotification,
}) => {
  return (
    <div
      id="in-app-toast-stack"
      className="fixed top-3 right-3 sm:top-5 sm:right-5 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100vw-1.5rem)] pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex justify-end pointer-events-auto pr-1"
        >
          <button
            id="btn-dismiss-all-toasts"
            onClick={onDismissAll}
            className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-md backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Trash2 className="w-3 h-3 text-slate-400" />
            Dismiss All ({toasts.length})
          </button>
        </motion.div>
      )}

      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <SingleToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => onDismiss(toast.id)}
            onClick={() => onSelectNotification && onSelectNotification(toast.notification)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface SingleToastProps {
  toast: InAppToast;
  onDismiss: () => void;
  onClick: () => void;
}

const SingleToastItem: React.FC<SingleToastProps> = ({ toast, onDismiss, onClick }) => {
  const { notification, durationMs = 6000 } = toast;
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  // Auto-dismiss countdown timer
  useEffect(() => {
    if (isPaused) return;

    const intervalTime = 50;
    const step = (intervalTime / durationMs) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPaused, durationMs, onDismiss]);

  // Determine styling based on type and status
  const getBadgeAndColor = () => {
    const type = notification.type;
    const status = notification.status;

    if (type === 'security' || status === 'warning') {
      return {
        bg: 'bg-gradient-to-r from-rose-950/95 via-slate-900/95 to-slate-950/95',
        border: 'border-rose-500/60 shadow-[0_4px_25px_rgba(244,63,94,0.25)]',
        badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        badgeText: 'SECURITY ALERT',
        icon: <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 animate-pulse" />,
        progressColor: 'bg-rose-500',
      };
    }

    if (type === 'otp') {
      return {
        bg: 'bg-gradient-to-r from-emerald-950/95 via-slate-900/95 to-slate-950/95',
        border: 'border-emerald-500/60 shadow-[0_4px_25px_rgba(16,185,129,0.25)]',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        badgeText: 'OTP VERIFIED',
        icon: <KeyRound className="w-5 h-5 text-emerald-400 shrink-0" />,
        progressColor: 'bg-emerald-500',
      };
    }

    if (type === 'document') {
      return {
        bg: 'bg-gradient-to-r from-blue-950/95 via-slate-900/95 to-slate-950/95',
        border: 'border-blue-500/60 shadow-[0_4px_25px_rgba(59,130,246,0.25)]',
        badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        badgeText: 'DOCUMENT VAULT',
        icon: <FileCheck className="w-5 h-5 text-blue-400 shrink-0" />,
        progressColor: 'bg-blue-500',
      };
    }

    if (type === 'bank') {
      if (status === 'pending') {
        return {
          bg: 'bg-gradient-to-r from-amber-950/95 via-slate-900/95 to-slate-950/95',
          border: 'border-amber-500/60 shadow-[0_4px_25px_rgba(245,158,11,0.25)]',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          badgeText: 'BANK LINK PENDING',
          icon: <Clock className="w-5 h-5 text-amber-400 shrink-0 animate-spin" />,
          progressColor: 'bg-amber-500',
        };
      }
      if (status === 'failed') {
        return {
          bg: 'bg-gradient-to-r from-rose-950/95 via-slate-900/95 to-slate-950/95',
          border: 'border-rose-500/60 shadow-[0_4px_25px_rgba(244,63,94,0.25)]',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          badgeText: 'BANK LINK FAILED',
          icon: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
          progressColor: 'bg-rose-500',
        };
      }
      return {
        bg: 'bg-gradient-to-r from-emerald-950/95 via-slate-900/95 to-slate-950/95',
        border: 'border-emerald-500/60 shadow-[0_4px_25px_rgba(16,185,129,0.25)]',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        badgeText: 'BANK LINKED',
        icon: <Building2 className="w-5 h-5 text-emerald-400 shrink-0" />,
        progressColor: 'bg-emerald-500',
      };
    }

    if (type === 'alert') {
      return {
        bg: 'bg-gradient-to-r from-amber-950/95 via-slate-900/95 to-slate-950/95',
        border: 'border-amber-500/60 shadow-[0_4px_25px_rgba(245,158,11,0.25)]',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        badgeText: 'SECURITY NOTICE',
        icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
        progressColor: 'bg-amber-500',
      };
    }

    // Default
    return {
      bg: 'bg-gradient-to-r from-slate-900/95 via-slate-900/95 to-slate-950/95',
      border: 'border-slate-700 shadow-xl',
      badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
      badgeText: 'NOTIFICATION',
      icon: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
      progressColor: 'bg-cyan-500',
    };
  };

  const style = getBadgeAndColor();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.92, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto relative rounded-2xl border backdrop-blur-xl ${style.bg} ${style.border} text-white p-3.5 sm:p-4 shadow-2xl overflow-hidden group`}
      role="alert"
    >
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 shadow-inner shrink-0 mt-0.5">
          {style.icon}
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-full border ${style.badgeBg}`}
            >
              {style.badgeText}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {notification.timestamp || 'Just now'}
            </span>
          </div>

          <h4
            onClick={onClick}
            className="text-xs sm:text-sm font-bold text-white tracking-tight leading-snug cursor-pointer hover:text-amber-300 transition-colors line-clamp-1"
          >
            {notification.title}
          </h4>

          <p
            onClick={onClick}
            className="text-[11px] sm:text-xs text-slate-300 mt-1 leading-relaxed cursor-pointer hover:text-slate-100 transition-colors line-clamp-2"
          >
            {notification.message}
          </p>

          {notification.actionLabel && (
            <div className="mt-2.5 flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>{notification.actionLabel}</span>
                <ExternalLink className="w-3 h-3 text-slate-300" />
              </button>
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          id={`btn-dismiss-toast-${notification.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          title="Dismiss notification"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Auto-Dismiss Countdown Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900/70">
        <div
          className={`h-full transition-all ease-linear ${style.progressColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
};
