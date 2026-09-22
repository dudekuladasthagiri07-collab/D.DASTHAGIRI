import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  ArrowLeft,
  X,
  Mic,
  MicOff,
  Clock,
  Sparkles,
  Trash2,
  Building2,
  Zap,
  Send,
  Wallet,
  QrCode,
  ShieldCheck,
  FileText,
  Smartphone,
  Receipt,
  CreditCard,
  Layers,
  Lock,
  Gift,
  HelpCircle,
  CheckCircle2,
  History,
  ArrowUpRight,
  TrendingUp,
  Landmark,
  Tv,
  Droplets,
  Flame,
  Wifi,
  Car,
  GraduationCap,
  ShieldAlert,
  ChevronRight,
  UserCheck,
  Percent,
} from 'lucide-react';
import { BankAccount, ConnectedPortal, PaymentService, UserProfile } from '../types';
import { BankLogo } from './BankLogo';

export interface SearchResultItem {
  id: string;
  category: 'transfers' | 'banks' | 'bills' | 'documents' | 'investments' | 'loans' | 'settings';
  categoryLabel: string;
  title: string;
  subtitle: string;
  badge?: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  actionType: 'navigate_tab' | 'open_banking' | 'open_bill_service' | 'open_scanner' | 'open_activity_logs' | 'open_modal';
  targetTab?: string;
  bankingTab?: 'balance' | 'send' | 'receive' | 'self_transfer';
  billService?: PaymentService;
  modalTarget?: string;
  tags: string[];
}

interface SearchModuleProps {
  user: UserProfile;
  banks: BankAccount[];
  portals: ConnectedPortal[];
  onBack: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenBankingOps?: (tab: 'balance' | 'send' | 'receive' | 'self_transfer') => void;
  onOpenBillService?: (service: PaymentService) => void;
  onOpenQrScanner?: () => void;
  onOpenActivityLogs?: () => void;
  onOpenNotifications?: () => void;
  onOpenHelpSupport?: () => void;
  onOpenProfileModal?: () => void;
}

export const SearchModule: React.FC<SearchModuleProps> = ({
  user,
  banks = [],
  portals = [],
  onBack,
  onNavigateTab,
  onOpenBankingOps,
  onOpenBillService,
  onOpenQrScanner,
  onOpenActivityLogs,
  onOpenNotifications,
  onOpenHelpSupport,
  onOpenProfileModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Recent Searches from localStorage
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('docpay_global_recent_searches');
      return saved
        ? JSON.parse(saved)
        : ['Check Balance', 'Send Money', 'Autopay Mandates', 'Electricity Bill', '24K Digital Gold', 'HDFC Bank'];
    } catch {
      return ['Check Balance', 'Send Money', 'Autopay Mandates', 'Electricity Bill', '24K Digital Gold', 'HDFC Bank'];
    }
  });

  // Autofocus input on page mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcut Esc to go back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  const addRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const clean = term.trim();
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('docpay_global_recent_searches', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== term);
      try {
        localStorage.setItem('docpay_global_recent_searches', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const clearAllRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('docpay_global_recent_searches');
    } catch (e) {}
  };

  // Voice Search handler using Web Speech API (with fallback simulation)
  const handleToggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN';

        recognition.onstart = () => {
          setIsListening(true);
          setSpeechError(null);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setSearchQuery(transcript);
          addRecentSearch(transcript);
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
          setSpeechError('Voice error. Try typing or speaking again.');
          setTimeout(() => setSpeechError(null), 3000);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch (err) {
        fallbackVoiceSimulation();
      }
    } else {
      fallbackVoiceSimulation();
    }
  };

  const fallbackVoiceSimulation = () => {
    setIsListening(true);
    setSpeechError('Listening for voice commands...');
    const simulatedQueries = ['Send Money', 'Electricity Bill', 'Check Balance', 'Autopay', '24K Gold'];
    const randomQuery = simulatedQueries[Math.floor(Math.random() * simulatedQueries.length)];
    setTimeout(() => {
      setSearchQuery(randomQuery);
      addRecentSearch(randomQuery);
      setIsListening(false);
      setSpeechError(null);
    }, 1800);
  };

  // Complete searchable catalog
  const allSearchItems: SearchResultItem[] = useMemo(() => {
    const staticItems: SearchResultItem[] = [
      // Transfers & Quick Actions
      {
        id: 'action-send-money',
        category: 'transfers',
        categoryLabel: 'Transfers & UPI',
        title: 'Send Money',
        subtitle: 'Instant 0% fee UPI transfer to any mobile, UPI ID, or Bank A/C',
        badge: 'Instant 24x7',
        icon: Send,
        iconBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
        iconColor: 'text-emerald-400',
        actionType: 'open_banking',
        bankingTab: 'send',
        tags: ['send', 'transfer', 'upi', 'pay', 'money', 'contact', 'mobile', 'account'],
      },
      {
        id: 'action-check-balance',
        category: 'transfers',
        categoryLabel: 'Transfers & UPI',
        title: 'Check Bank Balance',
        subtitle: 'View real-time balance for linked accounts via secure UPI PIN',
        badge: 'Secure PIN',
        icon: Wallet,
        iconBg: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
        iconColor: 'text-amber-400',
        actionType: 'open_banking',
        bankingTab: 'balance',
        tags: ['balance', 'check', 'bank', 'account', 'statement', 'money', 'passbook', 'funds'],
      },
      {
        id: 'action-scan-qr',
        category: 'transfers',
        categoryLabel: 'Transfers & UPI',
        title: 'Scan & Pay QR',
        subtitle: 'Scan any BharatQR, UPI QR code, merchant or gallery image',
        badge: 'Camera Scanner',
        icon: QrCode,
        iconBg: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400',
        iconColor: 'text-indigo-400',
        actionType: 'open_scanner',
        tags: ['scan', 'qr', 'camera', 'barcode', 'merchant', 'pay', 'shop'],
      },
      {
        id: 'action-self-transfer',
        category: 'transfers',
        categoryLabel: 'Transfers & UPI',
        title: 'Self Account Transfer',
        subtitle: 'Move funds between your linked HDFC, SBI, or ICICI accounts with zero fees',
        badge: 'Self-Transfer',
        icon: Building2,
        iconBg: 'bg-purple-500/20 border-purple-500/40 text-purple-400',
        iconColor: 'text-purple-400',
        actionType: 'open_banking',
        bankingTab: 'self_transfer',
        tags: ['self', 'transfer', 'internal', 'switch', 'bank', 'between', 'accounts'],
      },
      {
        id: 'action-autopay',
        category: 'transfers',
        categoryLabel: 'Transfers & UPI',
        title: 'Autopay & Mandates',
        subtitle: 'NPCI compliant automated recurring debit mandates & subscriptions',
        badge: 'NPCI Verified',
        icon: Zap,
        iconBg: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
        iconColor: 'text-amber-400',
        actionType: 'navigate_tab',
        targetTab: 'autopay',
        tags: ['autopay', 'mandate', 'recurring', 'subscription', 'auto', 'debit', 'sip', 'emí'],
      },
      {
        id: 'action-payment-history',
        category: 'transfers',
        categoryLabel: 'Transfers & UPI',
        title: 'Transaction History & Receipts',
        subtitle: 'Browse all past debit/credit payments with UTR, filters & statement downloads',
        badge: 'All Transactions',
        icon: History,
        iconBg: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
        iconColor: 'text-blue-400',
        actionType: 'navigate_tab',
        targetTab: 'history',
        tags: ['history', 'transactions', 'receipt', 'utr', 'passbook', 'statement', 'records'],
      },

      // Utility Bills & Recharges
      {
        id: 'bill-mobile-recharge',
        category: 'bills',
        categoryLabel: 'Bills & Recharges',
        title: 'Mobile Recharge',
        subtitle: 'Jio, Airtel, Vi, and BSNL prepaid/postpaid packs with 5G unlimited offers',
        badge: 'Instant Topup',
        icon: Smartphone,
        iconBg: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400',
        iconColor: 'text-indigo-400',
        actionType: 'navigate_tab',
        targetTab: 'recharge',
        tags: ['mobile', 'recharge', 'prepaid', 'postpaid', 'jio', 'airtel', 'vi', 'bsnl', 'data', 'topup'],
      },
      {
        id: 'bill-electricity',
        category: 'bills',
        categoryLabel: 'Bills & Recharges',
        title: 'Electricity Bill',
        subtitle: 'Pay state electricity boards (Tata Power, Adani, BESCOM, MSEDCL, UPPCL)',
        badge: 'BBPS Bharat Connect',
        icon: Zap,
        iconBg: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
        iconColor: 'text-amber-400',
        actionType: 'open_bill_service',
        billService: 'ELECTRICITY',
        tags: ['electricity', 'power', 'light', 'current', 'bill', 'bijli', 'bescom', 'tata', 'adani'],
      },
      {
        id: 'bill-fastag',
        category: 'bills',
        categoryLabel: 'Bills & Recharges',
        title: 'FASTag Toll Recharge',
        subtitle: 'Instant toll balance top-up for NHAI highway toll plazas (ICICI, SBI, Paytm)',
        badge: 'National Highway',
        icon: Car,
        iconBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
        iconColor: 'text-emerald-400',
        actionType: 'open_bill_service',
        billService: 'FASTAG',
        tags: ['fastag', 'toll', 'car', 'vehicle', 'highway', 'nhai', 'netc', 'recharge'],
      },
      {
        id: 'bill-dth',
        category: 'bills',
        categoryLabel: 'Bills & Recharges',
        title: 'DTH Satellite TV',
        subtitle: 'Tata Play, Airtel Digital TV, Dish TV, and Sun Direct instant recharge',
        badge: 'Instant Activation',
        icon: Tv,
        iconBg: 'bg-rose-500/20 border-rose-500/40 text-rose-400',
        iconColor: 'text-rose-400',
        actionType: 'open_bill_service',
        billService: 'DTH_CABLE',
        tags: ['dth', 'tv', 'tata play', 'airtel dth', 'dish tv', 'sun direct', 'channel'],
      },
      {
        id: 'bill-piped-gas',
        category: 'bills',
        categoryLabel: 'Bills & Recharges',
        title: 'Piped Gas & LPG Cylinder',
        subtitle: 'Indane, Bharat Gas, HP Gas booking and IGL/MGL piped gas bill payments',
        badge: 'LPG / PNG',
        icon: Flame,
        iconBg: 'bg-orange-500/20 border-orange-500/40 text-orange-400',
        iconColor: 'text-orange-400',
        actionType: 'open_bill_service',
        billService: 'PIPED_GAS',
        tags: ['gas', 'cylinder', 'lpg', 'indane', 'hp gas', 'bharat gas', 'igl', 'mgl', 'png'],
      },
      {
        id: 'bill-water',
        category: 'bills',
        categoryLabel: 'Bills & Recharges',
        title: 'Water Utility Bill',
        subtitle: 'Municipal corporation water supply bill settlement with 100% cashback coupons',
        badge: 'Municipal Board',
        icon: Droplets,
        iconBg: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400',
        iconColor: 'text-cyan-400',
        actionType: 'open_bill_service',
        billService: 'WATER',
        tags: ['water', 'pani', 'jal', 'board', 'municipal', 'utility'],
      },
      {
        id: 'bill-broadband',
        category: 'bills',
        categoryLabel: 'Bills & Recharges',
        title: 'Broadband & Landline',
        subtitle: 'JioFiber, Airtel Xstream, ACT Fibernet, and BSNL FTTH internet bills',
        badge: 'Fiber Internet',
        icon: Wifi,
        iconBg: 'bg-purple-500/20 border-purple-500/40 text-purple-400',
        iconColor: 'text-purple-400',
        actionType: 'open_bill_service',
        billService: 'BROADBAND',
        tags: ['broadband', 'wifi', 'internet', 'fiber', 'jiofiber', 'airtel', 'act', 'landline'],
      },
      {
        id: 'bill-credit-card',
        category: 'bills',
        categoryLabel: 'Bills & Recharges',
        title: 'Credit Card Bill Payment',
        subtitle: 'Pay Visa, Mastercard, RuPay & Amex card balances instantly via BBPS/UPI',
        badge: 'Instant Settlement',
        icon: CreditCard,
        iconBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
        iconColor: 'text-emerald-400',
        actionType: 'open_banking',
        bankingTab: 'send',
        tags: ['credit card', 'card bill', 'visa', 'mastercard', 'rupay', 'bill', 'due'],
      },
      {
        id: 'bill-education',
        category: 'bills',
        categoryLabel: 'Bills & Recharges',
        title: 'Education Tuition Fees',
        subtitle: 'Pay school, college, tuition and university academic fees directly',
        badge: 'Education Fee',
        icon: GraduationCap,
        iconBg: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400',
        iconColor: 'text-yellow-400',
        actionType: 'open_bill_service',
        billService: 'EDUCATION_FEE',
        tags: ['education', 'fees', 'school', 'college', 'tuition', 'university', 'student'],
      },

      // Portals & Documents
      {
        id: 'doc-aadhaar',
        category: 'documents',
        categoryLabel: 'Portals & Documents',
        title: 'Aadhaar Card Vault',
        subtitle: 'Verified UIDAI National Identity Document with biometric lock & masking',
        badge: 'UIDAI Verified',
        icon: FileText,
        iconBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
        iconColor: 'text-emerald-400',
        actionType: 'navigate_tab',
        targetTab: 'documents',
        tags: ['aadhaar', 'uidai', 'national id', 'card', 'identity', 'document', 'kyc', 'vault'],
      },
      {
        id: 'doc-pan',
        category: 'documents',
        categoryLabel: 'Portals & Documents',
        title: 'PAN Tax Document',
        subtitle: 'Income Tax Department Permanent Account Number linked to NSDL/UTI',
        badge: 'ITD Verified',
        icon: FileText,
        iconBg: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
        iconColor: 'text-blue-400',
        actionType: 'navigate_tab',
        targetTab: 'documents',
        tags: ['pan', 'tax', 'income tax', 'nsdl', 'uti', 'pan card', 'document'],
      },
      {
        id: 'doc-digilocker',
        category: 'documents',
        categoryLabel: 'Portals & Documents',
        title: 'DigiLocker Connected Portal',
        subtitle: 'Sync government issued certificates, driving license, and RC book',
        badge: 'Govt Cloud',
        icon: Layers,
        iconBg: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400',
        iconColor: 'text-indigo-400',
        actionType: 'navigate_tab',
        targetTab: 'documents',
        tags: ['digilocker', 'portal', 'gov', 'driving license', 'rc', 'marksheet', 'sync'],
      },

      // Investments & Wealth
      {
        id: 'inv-gold',
        category: 'investments',
        categoryLabel: 'Investments & Gold',
        title: '24K 99.9% Digital Gold',
        subtitle: 'Buy, sell or start daily ₹10 Gold SIP stored in secure Brink’s vaults',
        badge: '99.9% Pure',
        icon: Sparkles,
        iconBg: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
        iconColor: 'text-amber-400',
        actionType: 'navigate_tab',
        targetTab: 'dashboard',
        tags: ['gold', '24k', 'digital gold', 'silver', 'investment', 'sip', 'wealth', 'savings'],
      },
      {
        id: 'inv-mutual-funds',
        category: 'investments',
        categoryLabel: 'Investments & Gold',
        title: 'Direct Mutual Funds & SIP',
        subtitle: 'Zero commission index funds, flexi cap, and tax-saving ELSS plans',
        badge: '0% Commission',
        icon: TrendingUp,
        iconBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
        iconColor: 'text-emerald-400',
        actionType: 'navigate_tab',
        targetTab: 'dashboard',
        tags: ['mutual fund', 'sip', 'nifty', 'stocks', 'elss', 'tax saving', 'funds'],
      },
      {
        id: 'inv-fixed-deposits',
        category: 'investments',
        categoryLabel: 'Investments & Gold',
        title: 'High-Yield Fixed Deposits',
        subtitle: 'Earn up to 8.6% p.a. guaranteed returns with DICGC ₹5 Lakh RBI insurance',
        badge: 'Up to 8.6% p.a.',
        icon: Landmark,
        iconBg: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
        iconColor: 'text-blue-400',
        actionType: 'navigate_tab',
        targetTab: 'dashboard',
        tags: ['fd', 'fixed deposit', 'interest', 'savings', 'rbi', 'dicgc', 'deposit'],
      },

      // Loans & Insurance
      {
        id: 'loan-instant',
        category: 'loans',
        categoryLabel: 'Loans & Insurance',
        title: 'Instant Personal Loan',
        subtitle: 'Pre-approved loan limit up to ₹5,00,000 with 100% paperless disbursement',
        badge: 'Instant Approval',
        icon: Percent,
        iconBg: 'bg-purple-500/20 border-purple-500/40 text-purple-400',
        iconColor: 'text-purple-400',
        actionType: 'navigate_tab',
        targetTab: 'dashboard',
        tags: ['loan', 'personal loan', 'credit', 'emi', 'borrow', 'money', 'instant loan'],
      },
      {
        id: 'loan-cibil',
        category: 'loans',
        categoryLabel: 'Loans & Insurance',
        title: 'Free CIBIL Credit Score',
        subtitle: 'Check your live Experian / CIBIL score with free monthly credit monitoring',
        badge: 'Free Report',
        icon: UserCheck,
        iconBg: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400',
        iconColor: 'text-cyan-400',
        actionType: 'navigate_tab',
        targetTab: 'dashboard',
        tags: ['cibil', 'credit score', 'experian', 'report', 'rating', 'score'],
      },
      {
        id: 'ins-health-motor',
        category: 'loans',
        categoryLabel: 'Loans & Insurance',
        title: 'Health & Motor Vehicle Insurance',
        subtitle: 'Comprehensive 1 Crore cashless health policy & zero-dep bike/car insurance',
        badge: 'IRDAI Regulated',
        icon: ShieldCheck,
        iconBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
        iconColor: 'text-emerald-400',
        actionType: 'open_bill_service',
        billService: 'INSURANCE',
        tags: ['insurance', 'health', 'car insurance', 'bike insurance', 'lic', 'term life', 'policy'],
      },

      // Settings & Security
      {
        id: 'set-security-fraud',
        category: 'settings',
        categoryLabel: 'Settings & Security',
        title: 'Fraud Protection & Security Vault',
        subtitle: 'View security health, active IP sessions, phishing shield & token logs',
        badge: '256-bit AES',
        icon: ShieldAlert,
        iconBg: 'bg-rose-500/20 border-rose-500/40 text-rose-400',
        iconColor: 'text-rose-400',
        actionType: 'navigate_tab',
        targetTab: 'security',
        tags: ['security', 'fraud', 'biometrics', 'lock', 'pin', 'sessions', 'device', 'alert'],
      },
      {
        id: 'set-refer-earn',
        category: 'settings',
        categoryLabel: 'Settings & Security',
        title: 'Refer & Earn ₹200',
        subtitle: 'Invite friends to DocPay and get ₹200 direct bank cashback per referral',
        badge: '₹200 Reward',
        icon: Gift,
        iconBg: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
        iconColor: 'text-amber-400',
        actionType: 'navigate_tab',
        targetTab: 'refer',
        tags: ['refer', 'earn', 'cashback', 'reward', 'invite', 'bonus', 'friends'],
      },
      {
        id: 'set-help-support',
        category: 'settings',
        categoryLabel: 'Settings & Security',
        title: 'Help, Support & Dispute Resolution',
        subtitle: '24x7 NPCI dispute manager, FAQs, live chat and customer support',
        badge: '24x7 Support',
        icon: HelpCircle,
        iconBg: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400',
        iconColor: 'text-indigo-400',
        actionType: 'open_modal',
        modalTarget: 'help',
        tags: ['help', 'support', 'dispute', 'faq', 'complaint', 'customer care', 'contact'],
      },
      {
        id: 'set-profile-settings',
        category: 'settings',
        categoryLabel: 'Settings & Security',
        title: 'Profile, KYC & App Permissions',
        subtitle: 'Manage user identity, linked phone, UPI ID, biometrics and permissions',
        badge: 'Verified KYC',
        icon: UserCheck,
        iconBg: 'bg-slate-700/40 border-slate-600 text-slate-200',
        iconColor: 'text-slate-200',
        actionType: 'open_modal',
        modalTarget: 'profile',
        tags: ['profile', 'kyc', 'settings', 'permissions', 'phone', 'email', 'name', 'account'],
      },
    ];

    // Dynamically add Linked Bank Accounts
    const bankItems: SearchResultItem[] = banks.map((b) => ({
      id: `bank-${b.id}`,
      category: 'banks',
      categoryLabel: 'Bank Accounts & Statements',
      title: `${b.bankName} (${b.accountNumberMasked})`,
      subtitle: `IFSC: ${b.ifscCode} • ${b.accountType.toUpperCase()} • ${b.isPrimary ? 'Primary Account' : 'Linked Account'}`,
      badge: b.isPrimary ? 'Primary' : 'Linked',
      icon: Building2,
      iconBg: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
      iconColor: 'text-blue-400',
      actionType: 'open_banking',
      bankingTab: 'balance',
      tags: [b.bankName.toLowerCase(), b.ifscCode.toLowerCase(), 'bank', 'account', 'statement', 'balance', 'passbook'],
    }));

    // Dynamically add Connected Portals
    const portalItems: SearchResultItem[] = portals.map((p) => ({
      id: `portal-${p.id}`,
      category: 'documents',
      categoryLabel: 'Portals & Documents',
      title: p.portalName,
      subtitle: `${p.category.toUpperCase()} Portal • ${p.scope} • Auto-Sync Active`,
      badge: p.category === 'government' ? 'Govt Portal' : 'Connected',
      icon: Layers,
      iconBg: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400',
      iconColor: 'text-indigo-400',
      actionType: 'navigate_tab',
      targetTab: 'portals',
      tags: [p.portalName.toLowerCase(), p.category.toLowerCase(), p.scope.toLowerCase(), 'portal', 'connected'],
    }));

    return [...staticItems, ...bankItems, ...portalItems];
  }, [banks, portals]);

  // Filtered Results based on query and activeCategory
  const filteredResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return allSearchItems.filter((item) => {
      // Category filter
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }

      if (!q) return true;

      // Match in title, subtitle, category label, or tags
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSubtitle = item.subtitle.toLowerCase().includes(q);
      const matchCategory = item.categoryLabel.toLowerCase().includes(q);
      const matchTags = item.tags.some((tag) => tag.toLowerCase().includes(q));

      return matchTitle || matchSubtitle || matchCategory || matchTags;
    });
  }, [allSearchItems, searchQuery, activeCategory]);

  // Group results by category for clean visual hierarchy
  const groupedResults: Record<string, SearchResultItem[]> = useMemo(() => {
    const groups: Record<string, SearchResultItem[]> = {};
    filteredResults.forEach((item) => {
      if (!groups[item.categoryLabel]) {
        groups[item.categoryLabel] = [];
      }
      groups[item.categoryLabel].push(item);
    });
    return groups;
  }, [filteredResults]);

  // Action Click Handler
  const handleItemClick = (item: SearchResultItem) => {
    addRecentSearch(item.title);

    if (item.actionType === 'open_banking' && onOpenBankingOps) {
      onOpenBankingOps(item.bankingTab || 'balance');
      onBack();
    } else if (item.actionType === 'open_bill_service' && onOpenBillService) {
      if (item.billService) {
        onOpenBillService(item.billService);
      }
      onBack();
    } else if (item.actionType === 'open_scanner' && onOpenQrScanner) {
      onOpenQrScanner();
      onBack();
    } else if (item.actionType === 'open_activity_logs' && onOpenActivityLogs) {
      onOpenActivityLogs();
      onBack();
    } else if (item.actionType === 'open_modal') {
      if (item.modalTarget === 'help' && onOpenHelpSupport) {
        onOpenHelpSupport();
      } else if (item.modalTarget === 'profile' && onOpenProfileModal) {
        onOpenProfileModal();
      }
      onBack();
    } else if (item.actionType === 'navigate_tab' && item.targetTab) {
      onNavigateTab(item.targetTab);
      onBack();
    }
  };

  const handleSelectRecentSearch = (term: string) => {
    setSearchQuery(term);
    addRecentSearch(term);
  };

  const categories = [
    { id: 'all', label: 'All Services', icon: Sparkles },
    { id: 'transfers', label: 'Transfers & UPI', icon: Send },
    { id: 'banks', label: 'Bank Accounts', icon: Building2 },
    { id: 'bills', label: 'Bills & Recharges', icon: Receipt },
    { id: 'documents', label: 'Portals & Vault', icon: FileText },
    { id: 'investments', label: 'Gold & Wealth', icon: TrendingUp },
    { id: 'loans', label: 'Loans & Credit', icon: Percent },
    { id: 'settings', label: 'Settings & Security', icon: Lock },
  ];

  return (
    <div
      id="full-page-search-screen"
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col animate-fade-in relative z-50 pb-20"
    >
      {/* TOP SEARCH STICKY HEADER */}
      <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-xl border-b border-amber-500/30 px-4 sm:px-6 lg:px-8 py-3.5 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          
          {/* Back Button */}
          <button
            id="btn-search-page-back"
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0 shadow-md group active:scale-95"
            title="Go back (Esc)"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          {/* Primary High-Gloss Search Input */}
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-amber-400 group-focus-within:text-amber-300 group-focus-within:scale-110 transition-all pointer-events-none" />
            
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  addRecentSearch(searchQuery.trim());
                }
              }}
              placeholder="Search by name, UPI ID, mobile, electricity bill, gold, bank, or documents..."
              className="w-full bg-slate-900/90 border-2 border-amber-400/60 focus:border-amber-300 text-white placeholder-slate-400 text-sm sm:text-base rounded-2xl pl-12 pr-24 py-3.5 focus:outline-none focus:ring-4 focus:ring-amber-400/20 shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all font-medium"
            />

            {/* Right Controls inside Input */}
            <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
              {/* Voice Search Button */}
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`p-2 rounded-xl transition-all cursor-pointer font-bold text-xs flex items-center gap-1 shadow-sm ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse ring-2 ring-red-400'
                    : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 hover:scale-105 active:scale-95'
                }`}
                title="Voice Search (Click to speak)"
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span className="hidden sm:inline font-black text-[11px]">Listening...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-slate-950" />
                    <span className="hidden sm:inline font-black text-[11px]">Voice</span>
                  </>
                )}
              </button>

              {/* Clear Input Button */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Clear text"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Close Button on Desktop */}
          <button
            onClick={onBack}
            className="hidden sm:flex px-3.5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer shrink-0 items-center gap-1"
          >
            <span>Close</span>
            <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-slate-800 text-slate-400">Esc</span>
          </button>
        </div>

        {/* Speech Recognition Status / Error Notice */}
        {speechError && (
          <div className="max-w-4xl mx-auto mt-2 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {speechError}
            </span>
          </div>
        )}

        {/* Category Horizontal Filter Bar */}
        <div className="max-w-4xl mx-auto mt-3.5 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/20 scale-102'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800 hover:border-amber-500/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SEARCH CONTENT BODY */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* RECENT SEARCHES & TRENDING SHORTCUTS (Shown when no search term or always on top) */}
        {!searchQuery && (
          <>
            {/* RECENT SEARCHES SECTION */}
            {recentSearches.length > 0 && (
              <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-4 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Recent Searches
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      {recentSearches.length} saved
                    </span>
                  </div>
                  <button
                    onClick={clearAllRecentSearches}
                    className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear History
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {recentSearches.map((term, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectRecentSearch(term)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-400/20 border border-slate-700 hover:border-amber-400 text-white hover:text-amber-200 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all group shadow-sm active:scale-95"
                    >
                      <Search className="w-3 h-3 text-amber-400 group-hover:scale-110 transition-transform" />
                      <span>{term}</span>
                      <button
                        onClick={(e) => removeRecentSearch(e, term)}
                        className="p-0.5 text-slate-400 hover:text-rose-400 rounded-full hover:bg-slate-700 transition-colors ml-0.5"
                        title="Remove from history"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* POPULAR SHORTCUTS */}
            <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-purple-950/40 border border-indigo-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-indigo-300 tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> Frequent Tasks & Trending Shortcuts
                </span>
                <span className="text-[10px] text-indigo-200/70 font-mono">1-Tap Direct Trigger</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { label: 'Check Balance', icon: Wallet, color: 'text-amber-400', action: () => onOpenBankingOps && onOpenBankingOps('balance') },
                  { label: 'Send Money', icon: Send, color: 'text-emerald-400', action: () => onOpenBankingOps && onOpenBankingOps('send') },
                  { label: 'Scan QR', icon: QrCode, color: 'text-indigo-400', action: () => onOpenQrScanner && onOpenQrScanner() },
                  { label: 'Autopay Mandates', icon: Zap, color: 'text-yellow-400', action: () => onNavigateTab('autopay') },
                  { label: 'Electricity Bill', icon: Zap, color: 'text-amber-400', action: () => onOpenBillService && onOpenBillService('ELECTRICITY') },
                  { label: '24K Digital Gold', icon: Sparkles, color: 'text-amber-300', action: () => onNavigateTab('dashboard') },
                  { label: 'Mobile Recharge', icon: Smartphone, color: 'text-indigo-400', action: () => onNavigateTab('recharge') },
                  { label: 'Aadhaar Vault', icon: FileText, color: 'text-blue-400', action: () => onNavigateTab('documents') },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        addRecentSearch(item.label);
                        item.action();
                        onBack();
                      }}
                      className="p-3 rounded-xl bg-slate-900/90 hover:bg-indigo-900/40 border border-slate-800 hover:border-indigo-400/50 text-left transition-all cursor-pointer flex items-center gap-2.5 group active:scale-95 shadow-sm"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center shrink-0">
                        <Icon className={`w-4 h-4 ${item.color} group-hover:scale-110 transition-transform`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white group-hover:text-amber-300 truncate">{item.label}</p>
                        <p className="text-[10px] text-slate-400 truncate">Quick Open →</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* SEARCH RESULTS FEED */}
        {filteredResults.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-amber-400" />
                {searchQuery ? `Results for "${searchQuery}"` : 'All Available Services & Portals'}
              </span>
              <span className="text-xs font-mono text-slate-400 font-bold">
                {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'}
              </span>
            </div>

            {(Object.entries(groupedResults) as [string, SearchResultItem[]][]).map(([categoryName, items]) => (
              <div key={categoryName} className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">{categoryName}</h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-bold">
                    {items.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className="p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-400/60 shadow-md hover:shadow-xl transition-all cursor-pointer flex items-center justify-between gap-3 group active:scale-98"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${item.iconBg}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-amber-300 transition-colors truncate">
                                {item.title}
                              </h4>
                              {item.badge && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 whitespace-nowrap shrink-0">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1 text-slate-500 group-hover:text-amber-300 transition-colors">
                          <span className="hidden xs:inline text-[10px] font-bold uppercase">Open</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* EMPTY NO RESULTS STATE */
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400">
              <Search className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-white">No results found for "{searchQuery}"</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Check for spelling mistakes or try searching with generic terms like <strong>"Electricity"</strong>, <strong>"Autopay"</strong>, <strong>"Balance"</strong>, or <strong>"Gold"</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {['Check Balance', 'Send Money', 'Electricity', 'Autopay', 'Recharge', 'Aadhaar'].map((suggest, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => setSearchQuery(suggest)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-400/20 border border-slate-700 hover:border-amber-400 text-xs font-bold text-slate-200 hover:text-amber-300 transition-all cursor-pointer"
                >
                  Search "{suggest}"
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
