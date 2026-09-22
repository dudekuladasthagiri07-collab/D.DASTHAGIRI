import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import {
  Search,
  Bell,
  HelpCircle,
  Eye,
  EyeOff,
  Plus,
  Gift,
  Smartphone,
  Building2,
  Wallet,
  Scale,
  TrendingUp,
  Award,
  Zap,
  Tv,
  ZapOff,
  Droplet,
  Flame,
  Wifi,
  Disc,
  Truck,
  Receipt,
  ShieldCheck,
  GraduationCap,
  Grid,
  DollarSign,
  Briefcase,
  BookOpen,
  HeartPulse,
  Bike,
  Car,
  Shield,
  Tag,
  Sparkles,
  Ticket,
  ChevronRight,
  X,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Send,
  Download,
  Share2,
  Copy,
  Clock,
  User,
  Sliders,
  Percent,
  Trash2,
  FileCheck,
  FileText,
  QrCode,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Activity,
  GripVertical,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  LayoutGrid,
  Layers,
  Lock,
  Unlock,
  ExternalLink,
  Globe,
  Check,
  FileSearch,
  CheckCheck
} from 'lucide-react';
import { UserProfile, DocumentItem, BankAccount, ConnectedPortal, ActivityLog, NotificationItem, PaymentService } from '../types';
import { BankLogo } from './BankLogo';
import { PortalsWidget } from './dashboard/PortalsWidget';
import { TransfersWidget } from './dashboard/TransfersWidget';
import { InvestmentsWidget } from './dashboard/InvestmentsWidget';
import { BillsWidget } from './dashboard/BillsWidget';
import { LoansWidget } from './dashboard/LoansWidget';
import { InsuranceWidget } from './dashboard/InsuranceWidget';
import { RewardsWidget } from './dashboard/RewardsWidget';
import { BankAccountsWidget } from './dashboard/BankAccountsWidget';

interface Props {
  user: UserProfile;
  documents: DocumentItem[];
  banks: BankAccount[];
  portals: ConnectedPortal[];
  activities: ActivityLog[];
  notifications?: NotificationItem[];
  setActiveTab: (tab: string) => void;
  onOpenAuthModal: () => void;
  onOpenProfileModal: () => void;
  onOpenQrScanner: () => void;
  onOpenActivityLogs: () => void;
  onOpenNotifications?: () => void;
  onOpenHelpSupport?: () => void;
  onOpenBankingOps: (tab: 'balance' | 'send' | 'receive' | 'self_transfer') => void;
  onOpenBillService?: (service: PaymentService) => void;
  onNavigateAutopay?: (subtab?: 'active' | 'setup' | 'upcoming' | 'history') => void;
  onUpdateDocuments?: (docs: DocumentItem[]) => void;
  onLogActivity?: (title: string, desc: string, type: 'auth' | 'security' | 'document' | 'bank' | 'portal') => void;
  isPrivacyMode?: boolean;
  onTogglePrivacyMode?: () => void;
  isOffline?: boolean;
}

export const Dashboard: React.FC<Props> = ({
  user,
  documents,
  banks,
  portals,
  activities,
  notifications = [],
  setActiveTab,
  onOpenAuthModal,
  onOpenProfileModal,
  onOpenQrScanner,
  onOpenActivityLogs,
  onOpenNotifications,
  onOpenHelpSupport,
  onOpenBankingOps,
  onOpenBillService,
  onNavigateAutopay,
  onUpdateDocuments,
  onLogActivity,
  isPrivacyMode = false,
  onTogglePrivacyMode,
  isOffline = false,
}) => {
  // Wallet State
  const [walletBalance, setWalletBalance] = useState<number>(2450);
  const [showWalletBalance, setShowWalletBalance] = useState<boolean>(true);

  // Floating Quick Actions Speed-Dial State
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState<boolean>(false);

  // Voice Activation & Waveform Visualizer State
  const [isVoiceOverlayOpen, setIsVoiceOverlayOpen] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [voiceFeedback, setVoiceFeedback] = useState<string>('Listening for command... Speak clearly or tap a command below.');
  const [isSpeechAudioEnabled, setIsSpeechAudioEnabled] = useState<boolean>(true);
  const [waveHeights, setWaveHeights] = useState<number[]>([15, 35, 65, 85, 50, 30, 70, 95, 75, 40, 20, 60, 80, 35, 90, 55, 25, 65, 80, 35]);

  // Dynamic waveform heights generation
  useEffect(() => {
    let interval: any;
    if (isVoiceOverlayOpen && isListening) {
      interval = setInterval(() => {
        setWaveHeights((prev) =>
          prev.map(() => Math.floor(Math.random() * 80) + 15)
        );
      }, 100);
    } else {
      setWaveHeights([12, 18, 22, 18, 12, 18, 22, 28, 18, 12, 18, 22, 18, 12, 18, 12, 18, 22, 18, 12]);
    }
    return () => clearInterval(interval);
  }, [isVoiceOverlayOpen, isListening]);

  // Speech Synthesis Speak Helper
  const speakVoiceResponse = (text: string) => {
    if (isSpeechAudioEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Voice Command Intent Handler
  const processVoiceCommand = (rawText: string) => {
    const text = rawText.toLowerCase().trim();
    if (!text) return;

    if (text.includes('balance') || text.includes('how much money') || text.includes('check balance') || text.includes('account balance')) {
      setVoiceFeedback('✨ Recognized: Check Balance');
      speakVoiceResponse('Checking your primary bank balance');
      addRecentSearch('Voice: Check Balance');
      setTimeout(() => {
        setIsVoiceOverlayOpen(false);
        onOpenBankingOps('balance');
      }, 1300);
    } else if (text.includes('transaction') || text.includes('recent transactions') || text.includes('statement') || text.includes('activity') || text.includes('history') || text.includes('passbook')) {
      setVoiceFeedback('✨ Recognized: Recent Transactions');
      speakVoiceResponse('Opening recent bank transactions and activity history');
      addRecentSearch('Voice: Recent Transactions');
      setTimeout(() => {
        setIsVoiceOverlayOpen(false);
        onOpenActivityLogs();
      }, 1300);
    } else if (text.includes('send') || text.includes('pay') || text.includes('transfer') || text.includes('send money')) {
      setVoiceFeedback('✨ Recognized: Send Money');
      speakVoiceResponse('Opening instant UPI money transfer modal');
      addRecentSearch('Voice: Send Money');
      setTimeout(() => {
        setIsVoiceOverlayOpen(false);
        onOpenBankingOps('send');
      }, 1300);
    } else if (text.includes('scan') || text.includes('qr')) {
      setVoiceFeedback('✨ Recognized: Scan QR Code');
      speakVoiceResponse('Opening camera QR scanner');
      addRecentSearch('Voice: Scan QR');
      setTimeout(() => {
        setIsVoiceOverlayOpen(false);
        onOpenQrScanner();
      }, 1300);
    } else if (text.includes('autopay') || text.includes('mandate') || text.includes('recurring')) {
      setVoiceFeedback('✨ Recognized: Autopay Mandates');
      speakVoiceResponse('Navigating to your active Autopay mandates');
      addRecentSearch('Voice: Autopay');
      setTimeout(() => {
        setIsVoiceOverlayOpen(false);
        if (onNavigateAutopay) onNavigateAutopay('active');
        else setActiveTab('autopay');
      }, 1300);
    } else if (text.includes('document') || text.includes('vault') || text.includes('aadhaar') || text.includes('pan') || text.includes('certificate')) {
      setVoiceFeedback('✨ Recognized: Open Document Vault');
      speakVoiceResponse('Opening your verified document vault');
      addRecentSearch('Voice: Document Vault');
      setTimeout(() => {
        setIsVoiceOverlayOpen(false);
        setActiveTab('documents');
      }, 1300);
    } else {
      setVoiceFeedback(`Listening... Recognized: "${rawText}". Try saying "Check Balance" or "Recent Transactions".`);
    }
  };

  // Web Speech API Listener logic
  useEffect(() => {
    let recognition: any = null;

    if (isVoiceOverlayOpen) {
      setIsListening(true);
      setVoiceTranscript('');
      setVoiceFeedback('Listening... Speak "Check Balance", "Recent Transactions", or "Send Money"');

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            let current = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              current += event.results[i][0].transcript;
            }
            if (current) {
              setVoiceTranscript(current);
              processVoiceCommand(current);
            }
          };

          recognition.onerror = (e: any) => {
            console.log('Speech recognition note:', e?.error);
          };

          recognition.onend = () => {
            if (isVoiceOverlayOpen) {
              try { recognition.start(); } catch (err) {}
            }
          };

          recognition.start();
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      setIsListening(false);
    }

    return () => {
      if (recognition) {
        try { recognition.stop(); } catch (e) {}
      }
    };
  }, [isVoiceOverlayOpen]);

  const handleSimulateCommand = (transcript: string) => {
    setVoiceTranscript(transcript);
    processVoiceCommand(transcript);
  };

  // Search Query & Focus & Recent Searches State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('docpay_recent_searches');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return ['Autopay', 'HDFC Bank Transaction', 'Electricity Bill', 'Aadhaar Vault', 'Send Money', '24K Digital Gold'];
  });

  const addRecentSearch = (term: string) => {
    if (!term || !term.trim()) return;
    const cleanTerm = term.trim();
    setRecentSearches((prev) => {
      const filtered = prev.filter((t) => t.toLowerCase() !== cleanTerm.toLowerCase());
      const updated = [cleanTerm, ...filtered].slice(0, 10);
      try {
        localStorage.setItem('docpay_recent_searches', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((t) => t.toLowerCase() !== term.toLowerCase());
      try {
        localStorage.setItem('docpay_recent_searches', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('docpay_recent_searches');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectSearchTerm = (term: string) => {
    setSearchQuery(term);
    addRecentSearch(term);
  };

  // Helper to resolve specific task / module navigation from search query
  const navigateToTaskFromSearch = (term: string) => {
    const lower = term.toLowerCase();
    addRecentSearch(term);
    setIsSearchFocused(false);
    setSearchQuery('');

    if (lower.includes('autopay') || lower.includes('mandate') || lower.includes('recurring')) {
      if (lower.includes('setup') || lower.includes('set up') || lower.includes('create')) {
        if (onNavigateAutopay) onNavigateAutopay('setup');
        else setActiveTab('autopay');
      } else if (lower.includes('upcoming')) {
        if (onNavigateAutopay) onNavigateAutopay('upcoming');
        else setActiveTab('autopay');
      } else if (lower.includes('history')) {
        if (onNavigateAutopay) onNavigateAutopay('history');
        else setActiveTab('autopay');
      } else {
        if (onNavigateAutopay) onNavigateAutopay('active');
        else setActiveTab('autopay');
      }
    } else if (
      lower.includes('hdfc') ||
      lower.includes('sbi') ||
      lower.includes('icici') ||
      lower.includes('bank') ||
      lower.includes('balance') ||
      lower.includes('statement') ||
      lower.includes('passbook')
    ) {
      if (lower.includes('balance')) {
        onOpenBankingOps('balance');
      } else {
        setActiveTab('banks');
      }
    } else if (lower.includes('send') || lower.includes('transfer') || lower.includes('pay money') || lower.includes('upi transfer')) {
      onOpenBankingOps('send');
    } else if (lower.includes('scan') || lower.includes('qr')) {
      onOpenQrScanner();
    } else if (
      lower.includes('aadhaar') ||
      lower.includes('pan') ||
      lower.includes('vault') ||
      lower.includes('document') ||
      lower.includes('docpay') ||
      lower.includes('doc pay') ||
      lower.includes('certificate')
    ) {
      setActiveTab('documents');
    } else if (lower.includes('portal') || lower.includes('income tax') || lower.includes('epfo') || lower.includes('passport')) {
      setActiveTab('portals');
    } else if (
      lower.includes('recharge') ||
      lower.includes('electricity') ||
      lower.includes('dth') ||
      lower.includes('bill') ||
      lower.includes('broadband') ||
      lower.includes('water') ||
      lower.includes('gas')
    ) {
      setActiveTab('recharge');
    } else if (lower.includes('loan') || lower.includes('credit') || lower.includes('cibil') || lower.includes('emi') || lower.includes('score')) {
      setActiveTab('loans');
    } else if (lower.includes('gold') || lower.includes('invest') || lower.includes('sip') || lower.includes('mutual') || lower.includes('share')) {
      setActiveTab('investments');
    } else if (lower.includes('insurance') || lower.includes('health') || lower.includes('term life') || lower.includes('motor') || lower.includes('policy')) {
      setActiveTab('insurance');
    } else if (lower.includes('reward') || lower.includes('cashback') || lower.includes('offer') || lower.includes('coupon') || lower.includes('refer')) {
      if (lower.includes('refer')) {
        setActiveTab('refer');
      } else {
        setActiveTab('rewards');
      }
    } else if (lower.includes('history') || lower.includes('transactions') || lower.includes('activity')) {
      onOpenActivityLogs();
    } else {
      // General search filter
      setSearchQuery(term);
      setIsSearchFocused(true);
    }
  };

  const getSearchTermIcon = (term: string) => {
    const lower = term.toLowerCase();
    if (lower.includes('autopay') || lower.includes('mandate')) return <Zap className="w-3.5 h-3.5 text-amber-400" />;
    if (lower.includes('bank') || lower.includes('hdfc') || lower.includes('sbi') || lower.includes('icici')) return <Building2 className="w-3.5 h-3.5 text-indigo-400" />;
    if (lower.includes('send') || lower.includes('transfer')) return <Send className="w-3.5 h-3.5 text-emerald-400" />;
    if (lower.includes('balance') || lower.includes('wallet')) return <Wallet className="w-3.5 h-3.5 text-amber-300" />;
    if (lower.includes('aadhaar') || lower.includes('pan') || lower.includes('doc') || lower.includes('vault')) return <FileCheck className="w-3.5 h-3.5 text-emerald-400" />;
    if (lower.includes('recharge') || lower.includes('bill') || lower.includes('electricity')) return <Receipt className="w-3.5 h-3.5 text-purple-400" />;
    if (lower.includes('loan') || lower.includes('credit')) return <DollarSign className="w-3.5 h-3.5 text-emerald-400" />;
    if (lower.includes('gold') || lower.includes('invest')) return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
    if (lower.includes('insurance')) return <Shield className="w-3.5 h-3.5 text-blue-400" />;
    if (lower.includes('reward') || lower.includes('cashback') || lower.includes('refer')) return <Gift className="w-3.5 h-3.5 text-rose-400" />;
    if (lower.includes('qr') || lower.includes('scan')) return <QrCode className="w-3.5 h-3.5 text-cyan-400" />;
    return <Clock className="w-3.5 h-3.5 text-slate-400" />;
  };

  // Framer Motion Stagger Children Variants for Bank Cards & Document Items
  const staggerContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05,
      },
    },
  };

  const slideUpItemVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
      },
    },
  };

  // Unread notification count
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Generic Interactive Feature Modal state
  const [activeModalItem, setActiveModalItem] = useState<{
    title: string;
    category: string;
    description: string;
    fields?: { label: string; placeholder: string; type?: string }[];
    actionButtonText?: string;
    badgeText?: string;
  } | null>(null);

  const [modalInputValue, setModalInputValue] = useState<string>('');
  const [modalAmountValue, setModalAmountValue] = useState<string>('500');
  const [modalSuccessMessage, setModalSuccessMessage] = useState<string | null>(null);
  const [scratchCardRevealed, setScratchCardRevealed] = useState<boolean>(false);

  // Quick Action Handler for Service Modals
  const handleOpenServiceModal = (
    title: string,
    category: string,
    description: string,
    fieldLabel: string = 'Consumer ID / Number',
    fieldPlaceholder: string = 'e.g. 1029384756',
    badgeText?: string
  ) => {
    setActiveModalItem({
      title,
      category,
      description,
      fields: [{ label: fieldLabel, placeholder: fieldPlaceholder }],
      actionButtonText: `Proceed to Pay / Apply`,
      badgeText
    });
    setModalInputValue('');
    setModalAmountValue('500');
    setModalSuccessMessage(null);
    setScratchCardRevealed(false);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeModalItem?.category === 'Scratch Card') {
      setScratchCardRevealed(true);
      return;
    }
    setModalSuccessMessage(`Success! Request for ${activeModalItem?.title} processed successfully with UTR ${Math.floor(100000000000 + Math.random() * 900000000000)}.`);
    setTimeout(() => {
      setActiveModalItem(null);
      setModalSuccessMessage(null);
    }, 2200);
  };

  // Add Wallet Money handler
  const handleAddWalletMoney = () => {
    const amount = prompt('Enter amount to add to Wallet (₹):', '500');
    if (amount && !isNaN(Number(amount))) {
      const num = Number(amount);
      setWalletBalance((prev) => prev + num);
      alert(`₹${num.toLocaleString('en-IN')} added to your Wallet successfully via primary bank!`);
    }
  };

  // Master Orchestration Variants for Smooth, Modern Card Cascade
  const dashboardContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.085,
        delayChildren: 0.05,
      },
    },
  };

  const sectionCardVariants = {
    hidden: { 
      opacity: 0, 
      y: 32, 
      scale: 0.985 
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 24,
        stiffness: 220,
        mass: 0.85,
      },
    },
  };

  const gridStaggerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.035,
        delayChildren: 0.08,
      },
    },
  };

  const itemEntryVariants = {
    hidden: { opacity: 0, y: 14, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 22,
        stiffness: 280,
      },
    },
  };

  return (
    <motion.div
      variants={dashboardContainerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-7xl mx-auto text-slate-800"
    >
      
      {/* 0. TOP HEADER & PURPLE GRADIENT CARD CONTAINER */}
      <motion.div
        key="hero_header"
        variants={sectionCardVariants}
        className="bg-gradient-to-br from-[#6A1BFF] via-[#7B2CBF] to-[#8E24AA] rounded-[24px] p-5 sm:p-6 text-white shadow-xl relative overflow-hidden space-y-5"
      >
        {/* Subtle background ambient accents */}
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* TOP BAR: Profile Photo, Greeting, Notifications & Help icons */}
        <div className="flex items-center justify-between gap-3 relative z-10">
          
          {/* Top-Left Circular Profile Photo & Greeting */}
          <div className="flex items-center gap-3">
            <div
              onClick={onOpenProfileModal}
              className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full p-0.5 bg-gradient-to-tr from-amber-300 via-white to-amber-400 shadow-md cursor-pointer group shrink-0 transition-transform active:scale-95"
              title="Click to view & edit profile"
            >
              <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center font-bold text-lg text-white">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#6A1BFF] rounded-full" />
            </div>

            <div
              onClick={onOpenProfileModal}
              className="cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black tracking-wider uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  Verified UPI Account
                </span>
                <span className="text-[10px] text-purple-200 font-mono font-bold hidden sm:inline">
                  {banks[0]?.bankName || 'Primary Bank'} •••• {banks[0]?.accountNumber ? banks[0].accountNumber.slice(-4) : '9810'}
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white flex items-center gap-1.5 leading-tight group-hover:text-amber-200 transition-colors">
                {user.name}
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              </h2>
            </div>
          </div>

          {/* Top-Right: Notification & Help icons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Notification Icon */}
            <button
              onClick={onOpenNotifications || onOpenActivityLogs}
              className="relative p-2.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 transition-all cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-white" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center border-2 border-[#6A1BFF] animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Help (?) Icon */}
            <button
              onClick={onOpenHelpSupport}
              className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 transition-all cursor-pointer text-white"
              title="Help & Support"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* QUICK FINANCIAL OVERVIEW & FAST ACTIONS SUB-BANNER */}
        <div className="relative z-10 pt-1 border-t border-white/15 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          {/* Primary Account & Wallet Balance Quick Glance */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-3.5 py-2.5 border border-white/15">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] text-purple-200 font-bold uppercase tracking-wider">
                <span>Docpay Wallet</span>
                <button
                  type="button"
                  onClick={() => setShowWalletBalance(!showWalletBalance)}
                  className="text-purple-200 hover:text-white transition-colors"
                  title={showWalletBalance ? 'Hide balance' : 'Show balance'}
                >
                  {showWalletBalance && !isPrivacyMode ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
              <div className="text-sm sm:text-base font-black text-white font-mono flex items-center gap-2">
                <span>
                  {showWalletBalance && !isPrivacyMode ? `₹${walletBalance.toLocaleString('en-IN')}` : '₹••••••'}
                </span>
                <button
                  type="button"
                  onClick={handleAddWalletMoney}
                  className="px-2 py-0.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black uppercase tracking-wider transition-transform active:scale-95 shadow-xs cursor-pointer"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => onOpenBankingOps('balance')}
              className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all active:scale-95 cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5 text-amber-300" />
              <span>Check Balance</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenBankingOps('send')}
              className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all active:scale-95 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-emerald-300" />
              <span>Send Money</span>
            </button>
            <button
              type="button"
              onClick={onOpenQrScanner}
              className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all active:scale-95 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-cyan-300" />
              <span>Scan QR</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 1. MONEY TRANSFERS (PROMINENT AT THE VERY TOP) */}
      <motion.div key="transfers" variants={sectionCardVariants}>
        <TransfersWidget
          orderIndex={0}
          totalWidgets={8}
          onOpenBankingOps={onOpenBankingOps}
          handleAddWalletMoney={handleAddWalletMoney}
          gridStaggerVariants={gridStaggerVariants}
          itemEntryVariants={itemEntryVariants}
          setActiveTab={setActiveTab}
        />
      </motion.div>

      {/* 2. CONNECTED PORTALS & OFFICIAL SERVICES */}
      <motion.div key="portals" variants={sectionCardVariants}>
        <PortalsWidget
          portals={portals}
          orderIndex={1}
          totalWidgets={8}
          setActiveTab={setActiveTab}
          gridStaggerVariants={gridStaggerVariants}
          itemEntryVariants={itemEntryVariants}
        />
      </motion.div>

      {/* 3. RECHARGE & BILL PAYMENTS */}
      <motion.div key="bills" variants={sectionCardVariants}>
        <BillsWidget
          orderIndex={2}
          totalWidgets={8}
          handleOpenServiceModal={handleOpenServiceModal}
          onOpenBillService={onOpenBillService}
          gridStaggerVariants={gridStaggerVariants}
          itemEntryVariants={itemEntryVariants}
        />
      </motion.div>

      {/* 4. INVESTMENTS & WEALTH */}
      <motion.div key="investments" variants={sectionCardVariants}>
        <InvestmentsWidget
          orderIndex={3}
          totalWidgets={8}
          handleOpenServiceModal={handleOpenServiceModal}
          gridStaggerVariants={gridStaggerVariants}
          itemEntryVariants={itemEntryVariants}
        />
      </motion.div>

      {/* 5. LOANS & CREDIT SERVICES */}
      <motion.div key="loans" variants={sectionCardVariants}>
        <LoansWidget
          orderIndex={4}
          totalWidgets={8}
          handleOpenServiceModal={handleOpenServiceModal}
          gridStaggerVariants={gridStaggerVariants}
          itemEntryVariants={itemEntryVariants}
        />
      </motion.div>

      {/* 6. INSURANCE PROTECTION */}
      <motion.div key="insurance" variants={sectionCardVariants}>
        <InsuranceWidget
          orderIndex={5}
          totalWidgets={8}
          handleOpenServiceModal={handleOpenServiceModal}
          gridStaggerVariants={gridStaggerVariants}
          itemEntryVariants={itemEntryVariants}
        />
      </motion.div>

      {/* 7. OFFERS & REWARDS */}
      <motion.div key="rewards" variants={sectionCardVariants}>
        <RewardsWidget
          orderIndex={6}
          totalWidgets={8}
          handleOpenServiceModal={handleOpenServiceModal}
          gridStaggerVariants={gridStaggerVariants}
          itemEntryVariants={itemEntryVariants}
        />
      </motion.div>

      {/* 8. LINKED BANK ACCOUNTS & NPCI 24x7 BALANCE CHECK */}
      <motion.div key="bank_accounts" variants={sectionCardVariants}>
        <BankAccountsWidget
          banks={banks}
          orderIndex={7}
          totalWidgets={8}
          onOpenBankingOps={onOpenBankingOps}
          setActiveTab={setActiveTab}
          gridStaggerVariants={gridStaggerVariants}
          itemEntryVariants={itemEntryVariants}
        />
      </motion.div>











      {/* INTERACTIVE FEATURE POPUP MODAL */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-[24px] max-w-md w-full p-6 relative text-slate-800 shadow-2xl space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#6A1BFF]/10 text-[#6A1BFF]">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{activeModalItem.title}</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">{activeModalItem.category}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            {activeModalItem.category === 'Scratch Card' && scratchCardRevealed ? (
              <div className="text-center py-6 space-y-3 bg-gradient-to-br from-amber-50 to-amber-100/60 p-6 rounded-2xl border border-amber-300 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center mx-auto shadow-lg animate-bounce">
                  <Gift className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black text-slate-900">You Won ₹101 Cash Back!</h4>
                <p className="text-xs text-slate-600">
                  Direct cash reward credited to your primary bank account ({banks[0]?.bankName || 'HDFC Bank'}).
                </p>
                <p className="text-[10px] font-mono font-bold text-emerald-600">UTR: {Math.floor(100000000000 + Math.random() * 900000000000)}</p>
                <button
                  onClick={() => setActiveModalItem(null)}
                  className="w-full py-2.5 bg-[#6A1BFF] hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md transition-all mt-2"
                >
                  Done
                </button>
              </div>
            ) : modalSuccessMessage ? (
              <div className="text-center py-6 space-y-2 bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
                <p className="text-xs font-extrabold text-emerald-900">{modalSuccessMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleModalSubmit} className="space-y-4 text-xs">
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {activeModalItem.description}
                </p>

                {activeModalItem.fields?.map((field, idx) => (
                  <div key={idx} className="space-y-1">
                    <label className="font-bold text-slate-700">{field.label}</label>
                    <input
                      type="text"
                      required
                      value={modalInputValue}
                      onChange={(e) => setModalInputValue(e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#6A1BFF] focus:ring-1 focus:ring-[#6A1BFF]"
                    />
                  </div>
                ))}

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Amount / Value (₹)</label>
                  <input
                    type="number"
                    required
                    value={modalAmountValue}
                    onChange={(e) => setModalAmountValue(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-[#6A1BFF] focus:ring-1 focus:ring-[#6A1BFF]"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-[#6A1BFF] to-[#8E24AA] text-white font-black rounded-xl text-xs shadow-md transition-all hover:brightness-110 cursor-pointer"
                  >
                    {activeModalItem.category === 'Scratch Card' ? 'Scratch Now' : 'Proceed via Secure UPI'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModalItem(null)}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}



      {/* VOICE ACTIVATION OVERLAY WITH AUDIO WAVEFORM ANIMATION */}
      <AnimatePresence>
        {isVoiceOverlayOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-2xl text-white"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-400/70 rounded-[32px] p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.35)] overflow-hidden space-y-6 text-center"
            >
              {/* Concentric Pulsing Sound Rings */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
                <div className="w-80 h-80 rounded-full bg-amber-500/10 animate-ping absolute duration-1000"></div>
                <div className="w-96 h-96 rounded-full bg-purple-500/10 animate-pulse absolute"></div>
              </div>

              {/* Header bar inside Voice Overlay */}
              <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
                    <Mic className="w-5 h-5 animate-bounce" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-black text-base text-white tracking-tight flex items-center gap-1.5">
                      <span>DocPay Voice Assistant</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-400 text-slate-950 uppercase tracking-wide">
                        AI Active
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">Say a command or tap a shortcut below</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSpeechAudioEnabled(!isSpeechAudioEnabled)}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      isSpeechAudioEnabled
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                    title={isSpeechAudioEnabled ? 'Voice Responses Enabled' : 'Voice Responses Muted'}
                  >
                    {isSpeechAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsVoiceOverlayOpen(false)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Central Dynamic Audio Waveform Visualizer */}
              <div className="relative z-10 py-4 space-y-4">
                {/* Visual Microphone Pulse Core */}
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500 via-purple-600 to-indigo-600 blur-xl opacity-60 animate-pulse"></div>
                  <button
                    onClick={() => setIsListening(!isListening)}
                    className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all transform active:scale-95 cursor-pointer ${
                      isListening
                        ? 'bg-gradient-to-tr from-amber-400 via-amber-300 to-purple-500 text-slate-950 ring-4 ring-amber-400/50 shadow-[0_0_30px_rgba(245,158,11,0.6)]'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {isListening ? (
                      <Mic className="w-10 h-10 animate-pulse text-slate-950" />
                    ) : (
                      <MicOff className="w-10 h-10 text-slate-500" />
                    )}
                  </button>
                </div>

                {/* Animated Waveform Equalizer Bars */}
                <div className="flex items-center justify-center gap-1.5 h-16 px-4">
                  {waveHeights.map((h, i) => {
                    const colors = [
                      'from-amber-400 to-amber-300',
                      'from-purple-500 to-indigo-500',
                      'from-cyan-400 to-blue-500',
                      'from-emerald-400 to-teal-400',
                    ];
                    const grad = colors[i % colors.length];
                    return (
                      <motion.div
                        key={i}
                        animate={{ height: isListening ? `${h}%` : '15%' }}
                        transition={{ duration: 0.1, ease: 'easeOut' }}
                        className={`w-1.5 sm:w-2 rounded-full bg-gradient-to-t ${grad} shadow-sm`}
                      />
                    );
                  })}
                </div>

                {/* Live Transcript Display Box */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1 font-mono text-xs max-w-md mx-auto">
                  <div className="flex justify-between items-center text-[10px] text-amber-300 uppercase tracking-wider font-extrabold">
                    <span className="flex items-center gap-1">
                      <Radio className="w-3 h-3 text-rose-500 animate-ping" />
                      {isListening ? 'Listening Live...' : 'Paused'}
                    </span>
                    <span>Speech Input</span>
                  </div>
                  <p className="text-white font-medium text-xs sm:text-sm min-h-[24px] flex items-center justify-center italic">
                    {voiceTranscript ? `"${voiceTranscript}"` : 'Say "Check Balance" or "Recent Transactions"...'}
                  </p>
                </div>

                {/* AI Status / Feedback Notice */}
                <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs font-semibold">
                  {voiceFeedback}
                </div>
              </div>

              {/* Quick Voice Command Suggestion Chips / Simulator */}
              <div className="relative z-10 space-y-2 border-t border-white/10 pt-4">
                <p className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider text-left">
                  Try Common Voice Commands:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleSimulateCommand('Check Balance')}
                    className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-amber-400 hover:text-slate-950 border border-amber-400/30 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm group"
                  >
                    <Wallet className="w-3.5 h-3.5 text-amber-400 group-hover:text-slate-950" />
                    <span>Check Balance</span>
                  </button>
                  <button
                    onClick={() => handleSimulateCommand('Recent Transactions')}
                    className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-indigo-500 hover:text-white border border-indigo-400/30 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm group"
                  >
                    <Activity className="w-3.5 h-3.5 text-indigo-400 group-hover:text-white" />
                    <span>Recent Activity</span>
                  </button>
                  <button
                    onClick={() => handleSimulateCommand('Send Money')}
                    className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-emerald-500 hover:text-white border border-emerald-400/30 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm group"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
                    <span>Send Money</span>
                  </button>
                  <button
                    onClick={() => handleSimulateCommand('Scan QR Code')}
                    className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-amber-400 hover:text-slate-950 border border-amber-400/30 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm group"
                  >
                    <QrCode className="w-3.5 h-3.5 text-amber-300 group-hover:text-slate-950" />
                    <span>Scan QR</span>
                  </button>
                  <button
                    onClick={() => handleSimulateCommand('Autopay Mandates')}
                    className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-400/30 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm group"
                  >
                    <Zap className="w-3.5 h-3.5 text-cyan-400 group-hover:text-slate-950" />
                    <span>Autopay</span>
                  </button>
                  <button
                    onClick={() => handleSimulateCommand('Open Document Vault')}
                    className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-purple-600 hover:text-white border border-purple-400/30 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm group"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-purple-400 group-hover:text-white" />
                    <span>Vault Docs</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
