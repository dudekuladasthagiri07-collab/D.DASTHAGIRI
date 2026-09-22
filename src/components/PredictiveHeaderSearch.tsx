import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search,
  X,
  Sparkles,
  CreditCard,
  Send,
  QrCode,
  Scan,
  Zap,
  Smartphone,
  Shield,
  GraduationCap,
  Car,
  Landmark,
  FileText,
  Clock,
  History,
  Building2,
  Tv,
  Droplets,
  Flame,
  Wifi,
  Disc,
  Receipt,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { BankAccount, ConnectedPortal, PaymentService } from '../types';

export interface PredictiveSearchResult {
  id: string;
  category: 'Widgets' | 'Recent Transactions' | 'Connected Portals';
  name: string;
  description: string;
  metadata?: string;
  iconName?: string;
  icon?: string;
  score?: number;
  data?: any;
  actionType: 'navigate_tab' | 'open_banking' | 'open_bill_service' | 'open_scanner' | 'open_activity_logs' | 'open_portal';
  targetParam?: string;
}

interface PredictiveHeaderSearchProps {
  onNavigateTab: (tab: string) => void;
  onOpenBankingOps?: (tab: 'balance' | 'send' | 'receive' | 'self_transfer') => void;
  onOpenBillService?: (service: PaymentService) => void;
  onOpenQrScanner?: () => void;
  onOpenActivityLogs?: () => void;
  portals?: ConnectedPortal[];
  banks?: BankAccount[];
}

export const PredictiveHeaderSearch: React.FC<PredictiveHeaderSearchProps> = ({
  onNavigateTab,
  onOpenBankingOps,
  onOpenBillService,
  onOpenQrScanner,
  onOpenActivityLogs,
  portals = [],
  banks = [],
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('docpay_header_recent_searches');
      return saved ? JSON.parse(saved) : ['Balance', 'Electricity Bill', 'FASTag', 'Amazon Payment', 'SBI'];
    } catch {
      return ['Balance', 'Electricity Bill', 'FASTag', 'Amazon Payment', 'SBI'];
    }
  });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== term.toLowerCase());
      const updated = [term.trim(), ...filtered].slice(0, 6);
      try {
        localStorage.setItem('docpay_header_recent_searches', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem('docpay_header_recent_searches');
    } catch (e) {
      console.error(e);
    }
  };

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Static/dynamic dataset
  const allWidgets: PredictiveSearchResult[] = useMemo(() => [
    {
      id: 'w-balance',
      category: 'Widgets',
      name: 'Balance',
      description: 'Check your bank account balance instantly with PIN/Biometrics',
      metadata: 'Banking • 24x7 Real-time',
      icon: '💰',
      actionType: 'open_banking',
      targetParam: 'balance',
    },
    {
      id: 'w-send',
      category: 'Widgets',
      name: 'Send Money',
      description: 'Transfer money securely via UPI, IMPS, NEFT or Bank Account',
      metadata: 'UPI Transfer • Instant 0% fee',
      icon: '💸',
      actionType: 'open_banking',
      targetParam: 'send',
    },
    {
      id: 'w-receive',
      category: 'Widgets',
      name: 'Receive Money',
      description: 'Receive money, display dynamic QR code and share UPI ID',
      metadata: 'QR Code • UPI ID Sharing',
      icon: '📥',
      actionType: 'open_banking',
      targetParam: 'receive',
    },
    {
      id: 'w-scan-pay',
      category: 'Widgets',
      name: 'Scan & Pay',
      description: 'Scan BharatQR, UPI QR or merchant barcode to pay instantly',
      metadata: 'Camera QR Scanner • NPCI verified',
      icon: '📱',
      actionType: 'open_scanner',
    },
    {
      id: 'w-bills',
      category: 'Widgets',
      name: 'Bill Payments',
      description: 'Pay electricity, water, gas, broadband and municipal taxes via BBPS',
      metadata: 'BBPS Bharat Connect • Auto fetch',
      icon: '🧾',
      actionType: 'open_bill_service',
      targetParam: 'ELECTRICITY',
    },
    {
      id: 'w-recharge',
      category: 'Widgets',
      name: 'Recharge',
      description: 'Mobile recharge, DTH satellite and FASTag toll top-up',
      metadata: 'Jio, Airtel, Vi, BSNL • 5G Plans',
      icon: '🔋',
      actionType: 'navigate_tab',
      targetParam: 'recharge',
    },
    {
      id: 'w-insurance',
      category: 'Widgets',
      name: 'Insurance',
      description: 'Pay LIC, vehicle, health and life insurance premium policies',
      metadata: 'LIC, HDFC Life, ICICI Lombard',
      icon: '🛡️',
      actionType: 'open_bill_service',
      targetParam: 'INSURANCE',
    },
    {
      id: 'w-education',
      category: 'Widgets',
      name: 'Education Fee',
      description: 'Pay university tuition, school and college education fees',
      metadata: 'Schools, Colleges, Institutions',
      icon: '🎓',
      actionType: 'open_bill_service',
      targetParam: 'EDUCATION_FEE',
    },
    {
      id: 'w-fastag',
      category: 'Widgets',
      name: 'FASTag Toll Recharge',
      description: 'Recharge NETC FASTag toll wallet for highway travel',
      metadata: 'ICICI, Paytm, SBI, HDFC FASTag',
      icon: '🚗',
      actionType: 'open_bill_service',
      targetParam: 'FASTAG',
    },
    {
      id: 'w-autopay',
      category: 'Widgets',
      name: 'Autopay & Mandates',
      description: 'Manage active e-mandates, recurring SIPs and bill autopay',
      metadata: 'NPCI e-Mandate • Automated',
      icon: '🔄',
      actionType: 'navigate_tab',
      targetParam: 'autopay',
    },
    {
      id: 'w-documents',
      category: 'Widgets',
      name: 'Documents Vault',
      description: 'Encrypted storage for Aadhaar, PAN, Voter ID and Marksheets',
      metadata: 'Govt DigiLocker & Docpay Verified',
      icon: '📁',
      actionType: 'navigate_tab',
      targetParam: 'documents',
    },
    {
      id: 'w-banks',
      category: 'Widgets',
      name: 'Bank Accounts',
      description: 'Manage linked bank accounts, set primary account, delink or view status',
      metadata: 'HDFC, SBI, ICICI, Axis Bank',
      icon: '🏦',
      actionType: 'navigate_tab',
      targetParam: 'banks',
    },
  ], []);

  const allTransactions: PredictiveSearchResult[] = useMemo(() => [
    {
      id: 'tx-1',
      category: 'Recent Transactions',
      name: 'Amazon Payment',
      description: 'Wireless Headphones & Electronics Order',
      metadata: '₹3,499 • Today • TXN89123 • Success • Shopping',
      icon: '🛒',
      actionType: 'open_activity_logs',
    },
    {
      id: 'tx-2',
      category: 'Recent Transactions',
      name: 'Electricity Bill',
      description: 'BESCOM / TSSPDCL Monthly Power Bill Payment',
      metadata: '₹1,250 • Yesterday • TXN78421 • Success • Utilities',
      icon: '⚡',
      actionType: 'open_bill_service',
      targetParam: 'ELECTRICITY',
    },
    {
      id: 'tx-3',
      category: 'Recent Transactions',
      name: 'Mobile Recharge',
      description: 'Jio 5G Unlimited 84-Day Plan Recharge',
      metadata: '₹299 • 18 Aug • TXN55672 • Success • Mobile Recharge',
      icon: '📱',
      actionType: 'navigate_tab',
      targetParam: 'recharge',
    },
    {
      id: 'tx-4',
      category: 'Recent Transactions',
      name: 'SBI Transfer',
      description: 'Self-transfer to State Bank of India account',
      metadata: '₹5,000 • 17 Aug • TXN44521 • Success • Banking',
      icon: '🏦',
      actionType: 'open_banking',
      targetParam: 'self_transfer',
    },
    {
      id: 'tx-5',
      category: 'Recent Transactions',
      name: 'FASTag Recharge',
      description: 'ICICI Bank NETC FASTag Toll Balance Topup',
      metadata: '₹500 • 16 Aug • TXN33781 • Success • Toll',
      icon: '🚗',
      actionType: 'open_bill_service',
      targetParam: 'FASTAG',
    },
    {
      id: 'tx-6',
      category: 'Recent Transactions',
      name: 'Airtel Broadband & Fiber',
      description: 'Fiber Unlimited Auto-pay Monthly Bill',
      metadata: '₹999 • 15 Aug • TXN22910 • Success • Broadband',
      icon: '🌐',
      actionType: 'open_bill_service',
      targetParam: 'BROADBAND',
    },
    {
      id: 'tx-7',
      category: 'Recent Transactions',
      name: 'Apollo Pharmacy',
      description: 'Monthly health supplements & medicines',
      metadata: '₹640 • 14 Aug • TXN11092 • Success • Health',
      icon: '💊',
      actionType: 'open_activity_logs',
    },
    {
      id: 'tx-8',
      category: 'Recent Transactions',
      name: 'LIC Premium Payment',
      description: 'Life Insurance Corporation Jeevan Anand Policy',
      metadata: '₹6,500 • 12 Aug • TXN99412 • Success • Insurance',
      icon: '🛡️',
      actionType: 'open_bill_service',
      targetParam: 'INSURANCE',
    },
  ], []);

  const allPortals: PredictiveSearchResult[] = useMemo(() => {
    // Base portals list requested by prompt
    const base: PredictiveSearchResult[] = [
      {
        id: 'p-sbi',
        category: 'Connected Portals',
        name: 'SBI',
        description: 'State Bank of India YONO & Net Banking',
        metadata: 'Banking • Government Verified • Real-time Sync',
        icon: '🏦',
        actionType: 'navigate_tab',
        targetParam: 'banks',
      },
      {
        id: 'p-gpay',
        category: 'Connected Portals',
        name: 'Google Pay',
        description: 'UPI payment portal and merchant transactions',
        metadata: 'Payments • UPI Central Gateway',
        icon: '💳',
        actionType: 'open_banking',
        targetParam: 'send',
      },
      {
        id: 'p-phonepe',
        category: 'Connected Portals',
        name: 'PhonePe',
        description: 'UPI payment portal & QR scan engine',
        metadata: 'Payments • Merchant QR Network',
        icon: '📲',
        actionType: 'open_banking',
        targetParam: 'receive',
      },
      {
        id: 'p-electricity',
        category: 'Connected Portals',
        name: 'Electricity Board',
        description: 'BESCOM / TSSPDCL Electricity bill payment gateway',
        metadata: 'Utilities • State Power Grid • 24x7 Clearing',
        icon: '⚡',
        actionType: 'open_bill_service',
        targetParam: 'ELECTRICITY',
      },
      {
        id: 'p-water',
        category: 'Connected Portals',
        name: 'Water Board',
        description: 'BWSSB / HMWSSB Municipal Water Bill clearing',
        metadata: 'Utilities • Municipal Water Board',
        icon: '💧',
        actionType: 'open_bill_service',
        targetParam: 'WATER',
      },
      {
        id: 'p-lpg',
        category: 'Connected Portals',
        name: 'LPG Portal',
        description: 'Indane / HP / Bharat Gas Cylinder Booking & Subsidy',
        metadata: 'Utilities • Ministry of Petroleum',
        icon: '🔥',
        actionType: 'open_bill_service',
        targetParam: 'LPG',
      },
      {
        id: 'p-fastag-portal',
        category: 'Connected Portals',
        name: 'FASTag',
        description: 'National Electronic Toll Collection (NETC) Portal',
        metadata: 'Recharge • IHMCL Highway Tolls',
        icon: '🚗',
        actionType: 'open_bill_service',
        targetParam: 'FASTAG',
      },
      {
        id: 'p-broadband',
        category: 'Connected Portals',
        name: 'Broadband',
        description: 'Airtel, JioFiber, ACT & BSNL WiFi and broadband payment',
        metadata: 'Internet • High Speed Fiber',
        icon: '🌐',
        actionType: 'open_bill_service',
        targetParam: 'BROADBAND',
      },
      {
        id: 'p-uidai',
        category: 'Connected Portals',
        name: 'UIDAI Aadhaar Official Portal',
        description: 'Unique Identification Authority of India (myaadhaar.uidai.gov.in)',
        metadata: 'Government • Biometric & Demographic Vault',
        icon: '🏛️',
        actionType: 'navigate_tab',
        targetParam: 'documents',
      },
      {
        id: 'p-incometax',
        category: 'Connected Portals',
        name: 'Income Tax e-Filing Portal',
        description: 'Official Income Tax Department e-Filing & PAN Verification',
        metadata: 'Government • PAN-Aadhaar Compliance',
        icon: '📄',
        actionType: 'navigate_tab',
        targetParam: 'documents',
      },
      {
        id: 'p-digilocker',
        category: 'Connected Portals',
        name: 'DigiLocker Government Cloud',
        description: 'Encrypted Government & Academic Document Vault',
        metadata: 'Government • Verified Documents Repository',
        icon: '🔒',
        actionType: 'navigate_tab',
        targetParam: 'documents',
      },
    ];

    // Merge in dynamically connected portals if passed
    portals.forEach((p) => {
      if (!base.some((b) => b.name.toLowerCase() === p.name.toLowerCase())) {
        base.push({
          id: p.id,
          category: 'Connected Portals',
          name: p.name,
          description: p.description,
          metadata: `${p.category.toUpperCase()} • ${p.status === 'active' ? 'Active' : 'Warning'}`,
          icon: p.category === 'government' ? '🏛️' : p.category === 'unsafe' ? '⚠️' : '💼',
          actionType: 'navigate_tab',
          targetParam: 'documents',
        });
      }
    });

    return base;
  }, [portals]);

  // Relevance ranking algorithm
  const calculateScore = (item: PredictiveSearchResult, q: string): number => {
    const nameLower = item.name.toLowerCase();
    const descLower = item.description.toLowerCase();
    const metaLower = (item.metadata || '').toLowerCase();
    const qLower = q.toLowerCase();

    let score = 0;
    if (nameLower === qLower) score += 100;
    else if (nameLower.startsWith(qLower)) score += 60;
    else if (nameLower.includes(qLower)) score += 40;

    if (descLower.includes(qLower)) score += 20;
    if (metaLower.includes(qLower)) score += 15;

    return score;
  };

  // Debounced search results grouped by category
  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        widgets: [],
        transactions: [],
        portals: [],
        flatList: [],
      };
    }

    const filterCategory = (items: PredictiveSearchResult[]) => {
      return items
        .map((item) => ({
          ...item,
          score: calculateScore(item, q),
        }))
        .filter((item) => {
          const searchable = `${item.name} ${item.description} ${item.metadata || ''} ${item.id}`.toLowerCase();
          return searchable.includes(q);
        })
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 5);
    };

    const widgets = filterCategory(allWidgets);
    const transactions = filterCategory(allTransactions);
    const portalsList = filterCategory(allPortals);

    const flatList = [...widgets, ...transactions, ...portalsList];

    return {
      widgets,
      transactions,
      portals: portalsList,
      flatList,
    };
  }, [query, allWidgets, allTransactions, allPortals]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  // Action selection handler
  const handleSelectResult = useCallback((item: PredictiveSearchResult) => {
    saveRecentSearch(item.name);
    setIsOpen(false);
    setQuery('');

    if (item.actionType === 'navigate_tab' && item.targetParam) {
      onNavigateTab(item.targetParam);
    } else if (item.actionType === 'open_banking' && onOpenBankingOps) {
      onOpenBankingOps(item.targetParam as any || 'balance');
    } else if (item.actionType === 'open_bill_service' && onOpenBillService && item.targetParam) {
      onOpenBillService(item.targetParam as PaymentService);
    } else if (item.actionType === 'open_scanner' && onOpenQrScanner) {
      onOpenQrScanner();
    } else if (item.actionType === 'open_activity_logs' && onOpenActivityLogs) {
      onOpenActivityLogs();
    } else {
      // Fallback
      if (item.category === 'Connected Portals') {
        onNavigateTab('documents');
      } else {
        onNavigateTab('dashboard');
      }
    }
  }, [onNavigateTab, onOpenBankingOps, onOpenBillService, onOpenQrScanner, onOpenActivityLogs]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const list = filteredGroups.flatList;

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!list.length) return;
      setSelectedIndex((prev) => (prev + 1) % list.length);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!list.length) return;
      setSelectedIndex((prev) => (prev <= 0 ? list.length - 1 : prev - 1));
      return;
    }

    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < list.length) {
        e.preventDefault();
        handleSelectResult(list[selectedIndex]);
      } else if (query.trim() && list.length > 0) {
        e.preventDefault();
        handleSelectResult(list[0]);
      }
    }
  };

  // Safe Highlight text helper
  const renderHighlighted = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark
              key={i}
              className="bg-amber-400/30 text-amber-200 font-bold px-0.5 rounded-sm"
            >
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  const hasResults = filteredGroups.flatList.length > 0;
  const isQueryActive = query.trim().length > 0;

  return (
    <div
      ref={wrapperRef}
      id="predictive-header-search-wrapper"
      className="relative w-full max-w-xl mx-auto z-40"
    >
      {/* Input container */}
      <div className="relative w-full group">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 flex items-center justify-center pointer-events-none group-focus-within:scale-110 group-focus-within:text-amber-300 transition-all">
          <Search className="w-4 h-4" />
        </span>

        <input
          ref={inputRef}
          id="header-predictive-search-input"
          type="search"
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search widgets, transactions, portals..."
          aria-label="Search widgets, transactions, portals"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          className="w-full h-10 pl-10 pr-24 bg-slate-900/90 hover:bg-slate-900 focus:bg-slate-950 text-white placeholder-slate-400 text-xs sm:text-sm rounded-xl border border-slate-700 focus:border-amber-400/80 focus:outline-none focus:ring-2 focus:ring-amber-400/20 shadow-inner transition-all"
        />

        {/* Shortcut and Clear Button Controls */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {query ? (
            <button
              id="btn-clear-predictive-search"
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span
              className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400 select-none"
              title="Press Ctrl+K or Cmd+K to search"
            >
              Ctrl K
            </span>
          )}
        </div>
      </div>

      {/* Dropdown Results Box */}
      {isOpen && (
        <div
          ref={dropdownRef}
          id="header-predictive-search-results"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/90 rounded-2xl shadow-2xl shadow-slate-950/80 max-h-[480px] overflow-y-auto z-50 text-white animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-800/60"
        >
          {isQueryActive ? (
            hasResults ? (
              <div className="p-2 space-y-3">
                {/* 1. Dashboard Widgets Group */}
                {filteredGroups.widgets.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center justify-between">
                      <span>Dashboard Widgets</span>
                      <span className="text-slate-400 font-mono text-[9px]">
                        {filteredGroups.widgets.length} found
                      </span>
                    </div>
                    {filteredGroups.widgets.map((item) => {
                      const itemIndex = filteredGroups.flatList.findIndex((x) => x.id === item.id);
                      const isSelected = itemIndex === selectedIndex;

                      return (
                        <div
                          key={item.id}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleSelectResult(item)}
                          className={`p-2.5 rounded-xl cursor-pointer flex items-center gap-3 transition-all ${
                            isSelected
                              ? 'bg-amber-400/20 text-white border border-amber-400/40 translate-x-0.5'
                              : 'hover:bg-slate-800/80 text-slate-200 border border-transparent'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-base shrink-0">
                            {item.icon || '💰'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{renderHighlighted(item.name, query)}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-normal">
                                Widget
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              {renderHighlighted(item.description, query)}
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 2. Recent Transactions Group */}
                {filteredGroups.transactions.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                      <span>Recent Transactions</span>
                      <span className="text-slate-400 font-mono text-[9px]">
                        {filteredGroups.transactions.length} found
                      </span>
                    </div>
                    {filteredGroups.transactions.map((item) => {
                      const itemIndex = filteredGroups.flatList.findIndex((x) => x.id === item.id);
                      const isSelected = itemIndex === selectedIndex;

                      return (
                        <div
                          key={item.id}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleSelectResult(item)}
                          className={`p-2.5 rounded-xl cursor-pointer flex items-center gap-3 transition-all ${
                            isSelected
                              ? 'bg-emerald-500/20 text-white border border-emerald-500/40 translate-x-0.5'
                              : 'hover:bg-slate-800/80 text-slate-200 border border-transparent'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-base shrink-0">
                            {item.icon || '⚡'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{renderHighlighted(item.name, query)}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-normal">
                                Transaction
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              {renderHighlighted(item.metadata || item.description, query)}
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 3. Connected Portals Group */}
                {filteredGroups.portals.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-sky-400 flex items-center justify-between">
                      <span>Connected Portals</span>
                      <span className="text-slate-400 font-mono text-[9px]">
                        {filteredGroups.portals.length} found
                      </span>
                    </div>
                    {filteredGroups.portals.map((item) => {
                      const itemIndex = filteredGroups.flatList.findIndex((x) => x.id === item.id);
                      const isSelected = itemIndex === selectedIndex;

                      return (
                        <div
                          key={item.id}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleSelectResult(item)}
                          className={`p-2.5 rounded-xl cursor-pointer flex items-center gap-3 transition-all ${
                            isSelected
                              ? 'bg-sky-500/20 text-white border border-sky-500/40 translate-x-0.5'
                              : 'hover:bg-slate-800/80 text-slate-200 border border-transparent'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-base shrink-0">
                            {item.icon || '🏛️'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{renderHighlighted(item.name, query)}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-normal">
                                Portal
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              {renderHighlighted(item.description, query)}
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* No results state */
              <div className="p-8 text-center space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto text-amber-400/80" />
                <div className="text-sm font-bold text-white">No results found</div>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  We couldn't find any widgets, transactions, or portals matching "{query}".
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-amber-300 font-bold rounded-lg border border-slate-700 cursor-pointer"
                  >
                    Clear Filter
                  </button>
                </div>
              </div>
            )
          ) : (
            /* Empty input state: suggestions & recent history */
            <div className="p-3 space-y-3">
              {recentSearches.length > 0 && (
                <div className="space-y-1.5">
                  <div className="px-2 flex items-center justify-between text-[10px] font-extrabold uppercase text-slate-400">
                    <span className="flex items-center gap-1">
                      <History className="w-3 h-3 text-amber-400" /> Recent Searches
                    </span>
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      className="text-[10px] text-slate-400 hover:text-amber-300 lowercase cursor-pointer"
                    >
                      clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-2">
                    {recentSearches.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setQuery(item);
                          inputRef.current?.focus();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700/80 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Search className="w-2.5 h-2.5 text-slate-400" />
                        <span>{item}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick suggestions */}
              <div className="space-y-1 pt-1">
                <div className="px-2 text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Popular Actions
                </div>
                <div className="grid grid-cols-2 gap-1.5 px-1">
                  {allWidgets.slice(0, 4).map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => handleSelectResult(w)}
                      className="p-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 text-left border border-slate-800 hover:border-amber-400/40 transition-all flex items-center gap-2 cursor-pointer group"
                    >
                      <span className="text-base shrink-0">{w.icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                          {w.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {w.metadata?.split('•')[0] || 'Widget'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Accessible footer note */}
          <div className="px-3 py-2 bg-slate-950/80 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Use ↑ ↓ to navigate, Enter to select, Esc to close</span>
            <span className="font-mono text-amber-400/80">Docpay Real-time Match</span>
          </div>
        </div>
      )}
    </div>
  );
};
