import React from 'react';
import {
  FileText,
  LayoutDashboard,
  QrCode,
  History,
  Bell,
} from 'lucide-react';
import { NotificationItem } from '../types';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQrScanner: () => void;
  notifications?: NotificationItem[];
  onOpenNotifications?: () => void;
}

export const BottomNav: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onOpenQrScanner,
  notifications = [],
  onOpenNotifications,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const tabs = [
    {
      id: 'dashboard',
      label: 'Home',
      shortLabel: 'Home',
      icon: LayoutDashboard,
      badge: null,
      type: 'tab',
    },
    {
      id: 'documents',
      label: 'Documents',
      shortLabel: 'Docs',
      icon: FileText,
      badge: null,
      type: 'tab',
    },
    {
      id: 'scan_pay',
      label: 'Scan & Pay',
      shortLabel: 'Scan & Pay',
      icon: QrCode,
      badge: null,
      type: 'action', // Central Payment Scanner
    },
    {
      id: 'alerts',
      label: 'Alerts',
      shortLabel: 'Alerts',
      icon: Bell,
      badge: unreadCount > 0 ? (unreadCount > 9 ? '9+' : String(unreadCount)) : null,
      type: 'tab',
    },
    {
      id: 'history',
      label: 'History',
      shortLabel: 'History',
      icon: History,
      badge: null,
      type: 'tab',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-t border-amber-500/30 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto px-1 sm:px-4 lg:px-8">
        <nav className="flex items-center justify-between gap-1.5 py-1.5 sm:py-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            if (tab.type === 'action') {
              // Prominent Center "Scan & Pay" Payment Scanner Floating Action Button (Gold & White Shine)
              return (
                <button
                  key={tab.id}
                  id="bottom-nav-scan-pay"
                  onClick={onOpenQrScanner}
                  className="flex-shrink-0 -mt-7 flex flex-col items-center justify-center cursor-pointer group px-1 z-20 relative"
                  title="Open Payment QR Scanner"
                >
                  {/* Outer Floating Pulsing Gold Glow Ring */}
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 opacity-70 blur-md group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />

                  {/* Main Gold Shine Floating FAB Button */}
                  <div className="relative w-15 h-15 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-2xl shadow-amber-500/50 ring-4 ring-black group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-slate-950 font-black group-hover:rotate-6 transition-transform duration-300" />
                    
                    {/* Live White Shine Scanner Laser Overlay Line */}
                    <div className="absolute inset-x-2 h-0.5 bg-white shadow-[0_0_10px_#ffffff] animate-scan-line pointer-events-none opacity-90" />
                    
                    {/* Floating Gold Tier Badge */}
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[8px] font-black rounded-full bg-white text-slate-950 shadow-md border border-amber-400 animate-bounce">
                      GOLD
                    </span>
                  </div>

                  <span className="text-[10px] sm:text-xs font-black gold-shine-text mt-1 tracking-tight drop-shadow-md group-hover:text-amber-300 transition-colors">
                    Scan & Pay
                  </span>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                id={`bottom-nav-${tab.id}`}
                onClick={() => {
                  if (tab.id === 'alerts' && onOpenNotifications) {
                    onOpenNotifications();
                  } else {
                    setActiveTab(tab.id);
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex-1 min-w-[56px] sm:min-w-0 flex flex-col items-center justify-center gap-1 py-1.5 px-1 sm:px-2 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 scale-105'
                    : 'text-slate-400 hover:text-amber-300 hover:bg-zinc-900 font-medium'
                }`}
              >
                <div className="relative shrink-0">
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  {tab.badge && !isActive && (
                    <span className="absolute -top-1.5 -right-2 px-1 py-0.2 text-[8px] font-black rounded-full bg-amber-400 text-slate-950 animate-bounce">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[9px] sm:text-[11px] truncate tracking-tight text-center">
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
