import React from 'react';
import { ShieldCheck, Info, X } from 'lucide-react';

interface Props {
  onClose?: () => void;
}

export const SimulationNotice: React.FC<Props> = () => {
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed) return null;

  return (
    <div id="simulation-notice-banner" className="bg-black/90 border-b border-amber-500/30 text-slate-200 text-xs px-4 py-2 flex items-center justify-between shadow-md backdrop-blur-sm">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
        <p className="line-clamp-1">
          <strong className="font-extrabold text-white gold-shine-text">Gold Edition Enterprise Compliance:</strong> End-to-end 256-bit biometrics encryption, 6-month digital identity renewal verification & real-time portal monitoring.
        </p>
      </div>
      <button 
        id="dismiss-simulation-notice"
        onClick={() => setDismissed(true)} 
        className="p-1 hover:bg-zinc-800 rounded-lg transition-colors text-amber-400/80 hover:text-amber-300 ml-2 cursor-pointer"
        title="Dismiss notice"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
