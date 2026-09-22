import React, { useState, useEffect, useMemo } from 'react';
import {
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  RefreshCw,
  Zap,
  CreditCard,
  Wallet,
  Building,
  ShieldCheck,
  Calendar,
  X,
  User,
  Phone,
  Tag,
  Tv,
  Info,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Printer,
  Heart,
  Edit2,
  Trash2,
  Plus,
  Radio,
  Share2,
  Check,
  Lock,
  ArrowLeft,
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserProfile,
  BankAccount,
  MobileContact,
  RechargePlan,
  MobileRechargeLog
} from '../types';
import { SAVED_CONTACTS, RECHARGE_PLANS, INITIAL_RECHARGE_LOGS } from '../data/rechargeData';
import { generateRechargeReceiptPDF, exportRechargeLogsCSV } from '../utils/rechargePdfGenerator';

interface Props {
  user: UserProfile;
  banks: BankAccount[];
  onLogActivity: (
    title: string,
    description: string,
    type: 'auth' | 'security' | 'document' | 'bank' | 'portal'
  ) => void;
  onNavigateHome?: () => void;
}

interface FavoriteItem {
  id: string;
  label: string;
  mobile: string;
  operator: 'Jio' | 'Airtel' | 'Vi' | 'BSNL';
  circle: string;
  type: 'prepaid' | 'postpaid';
}

interface RecentRechargeItem {
  id: string;
  mobile: string;
  operator: 'Jio' | 'Airtel' | 'Vi' | 'BSNL';
  circle: string;
  lastAmount: number;
  lastDate: string;
}

const CIRCLES_LIST = [
  'Andhra Pradesh & Telangana',
  'Karnataka',
  'Tamil Nadu & Chennai',
  'Maharashtra & Goa',
  'Delhi NCR',
  'Kerala',
  'Gujarat',
  'Uttar Pradesh (East)',
  'Uttar Pradesh (West)',
  'West Bengal & Kolkata',
  'Bihar & Jharkhand',
  'Rajasthan',
  'Punjab',
  'Mumbai',
  'Madhya Pradesh & Chhattisgarh',
  'Assam & North East',
  'Haryana',
  'Himachal Pradesh',
  'Odisha',
  'Jammu & Kashmir'
];

export const MobileRechargeModule: React.FC<Props> = ({
  user,
  banks,
  onLogActivity,
  onNavigateHome
}) => {
  // Navigation View Tab: 'new_recharge' vs 'history_log'
  const [activeModuleTab, setActiveModuleTab] = useState<'new_recharge' | 'history_log'>('new_recharge');

  // Logs State
  const [rechargeLogs, setRechargeLogs] = useState<MobileRechargeLog[]>(INITIAL_RECHARGE_LOGS);

  // --- RECHARGE FLOW FORM STATES ---
  const [mobileNumber, setMobileNumber] = useState<string>('9848022338');
  const [provider, setProvider] = useState<'Jio' | 'Airtel' | 'Vi' | 'BSNL'>('Airtel');
  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(true);
  const [circle, setCircle] = useState<string>('Andhra Pradesh & Telangana');
  const [rechargeType, setRechargeType] = useState<'prepaid' | 'postpaid'>('prepaid');

  // Category & Filter
  const [selectedCategory, setSelectedCategory] = useState<
    'popular' | 'offers' | 'monthly' | 'yearly' | 'unlimited' | 'data' | 'talktime' | 'sms' | 'annual' | 'entertainment' | 'roaming' | 'custom'
  >('offers');
  const [planSearchQuery, setPlanSearchQuery] = useState<string>('');
  const [customAmountInput, setCustomAmountInput] = useState<string>('');
  const [customAmountError, setCustomAmountError] = useState<string>('');

  // Selected Plan & Flow Screens
  const [selectedPlan, setSelectedPlan] = useState<RechargePlan | null>(null);
  const [currentStep, setCurrentStep] = useState<
    'form' | 'summary' | 'payment_select' | 'processing' | 'success' | 'pending' | 'failed'
  >('form');

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Linked Bank' | 'DocPay Wallet'>('UPI');
  const [selectedBankId, setSelectedBankId] = useState<string>(banks[0]?.id || '');
  const [upiVpa, setUpiVpa] = useState<string>(`${user.name.toLowerCase().replace(/\s+/g, '')}@docpay`);
  
  // Idempotency & Order tracking
  const [currentOrderId, setCurrentOrderId] = useState<string>('');
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');
  const [processingStage, setProcessingStage] = useState<number>(1);
  const [activeTransaction, setActiveTransaction] = useState<MobileRechargeLog | null>(null);

  // Recent & Favorite Numbers
  const [recentNumbers, setRecentNumbers] = useState<RecentRechargeItem[]>([
    { id: 'rec-1', mobile: '9848022338', operator: 'Airtel', circle: 'Andhra Pradesh & Telangana', lastAmount: 299, lastDate: '18 Aug 2026' },
    { id: 'rec-2', mobile: '8790123456', operator: 'Jio', circle: 'Karnataka', lastAmount: 349, lastDate: '10 Aug 2026' },
    { id: 'rec-3', mobile: '9440182736', operator: 'BSNL', circle: 'Andhra Pradesh & Telangana', lastAmount: 199, lastDate: '02 Aug 2026' },
  ]);

  const [favoriteNumbers, setFavoriteNumbers] = useState<FavoriteItem[]>([
    { id: 'fav-1', label: 'My Number', mobile: '9848022338', operator: 'Airtel', circle: 'Andhra Pradesh & Telangana', type: 'prepaid' },
    { id: 'fav-2', label: 'Dad (Father)', mobile: '9440182736', operator: 'Airtel', circle: 'Andhra Pradesh & Telangana', type: 'prepaid' },
    { id: 'fav-3', label: 'Mom (Mother)', mobile: '9885234109', operator: 'Vi', circle: 'Andhra Pradesh & Telangana', type: 'prepaid' },
  ]);

  // Favorite Modal
  const [showAddFavModal, setShowAddFavModal] = useState<boolean>(false);
  const [favLabelInput, setFavLabelInput] = useState<string>('');
  const [favMobileInput, setFavMobileInput] = useState<string>('');
  const [favOperatorInput, setFavOperatorInput] = useState<'Jio' | 'Airtel' | 'Vi' | 'BSNL'>('Airtel');

  // Receipt Modal State
  const [viewingReceiptLog, setViewingReceiptLog] = useState<MobileRechargeLog | null>(null);

  // History Filter
  const [historySearch, setHistorySearch] = useState<string>('');
  const [historyProviderFilter, setHistoryProviderFilter] = useState<string>('all');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('all');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>('all');

  // Mask Mobile Helper
  const maskMobile = (num: string): string => {
    if (!num || num.length < 10) return num;
    return `${num.slice(0, 2)}******${num.slice(8)}`;
  };

  // Auto-detect operator & circle from mobile number
  const handleMobileNumberChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(cleaned);

    if (cleaned.length >= 2) {
      const prefix = cleaned.slice(0, 2);
      setIsAutoDetected(true);
      if (['98', '99', '97', '96', '81', '76', '70'].includes(prefix)) {
        setProvider('Airtel');
      } else if (['89', '63', '83', '90', '79', '77'].includes(prefix)) {
        setProvider('Jio');
      } else if (['94', '95', '85', '93'].includes(prefix)) {
        setProvider('BSNL');
      } else if (['91', '88', '78', '92'].includes(prefix)) {
        setProvider('Vi');
      }
    }
  };

  // Validation
  const isMobileValid = useMemo(() => {
    return /^[6-9]\d{9}$/.test(mobileNumber);
  }, [mobileNumber]);

  // Plan Selection Handler
  const handleSelectPlan = (plan: RechargePlan) => {
    if (!isMobileValid) {
      alert('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9 first.');
      return;
    }
    setSelectedPlan(plan);
    // Generate order ID and idempotency key
    const orderId = `RCH-ORD-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const idempKey = `IDEMP-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setCurrentOrderId(orderId);
    setIdempotencyKey(idempKey);
    setCurrentStep('summary');
  };

  // Custom Amount Handler
  const handleApplyCustomAmount = () => {
    const amt = parseFloat(customAmountInput);
    if (isNaN(amt) || amt < 10 || amt > 10000) {
      setCustomAmountError('Amount must be between ₹10 and ₹10,000');
      return;
    }
    setCustomAmountError('');
    const customPlan: RechargePlan = {
      id: `custom-${Date.now()}`,
      provider: provider,
      category: 'talktime',
      amount: Math.round(amt),
      name: `₹${Math.round(amt)} Custom Top-up`,
      validityDays: 28,
      validityText: '28 Days (Standard)',
      dailyData: 'As per base plan',
      voiceCalling: `₹${(amt * 0.85).toFixed(2)} Talktime Value`,
      smsBenefits: 'Standard Rates',
      description: `Authorized instant denomination talktime voucher for ${provider} ${circle}.`,
    };
    handleSelectPlan(customPlan);
  };

  // Execute Payment Simulation (NPCI / BBPS Authorized Gateway Flow)
  const handleStartPayment = () => {
    if (!selectedPlan) return;
    setCurrentStep('processing');
    setProcessingStage(1);

    // Stage 1: Order verification & Idempotency check
    setTimeout(() => {
      setProcessingStage(2);
    }, 1200);

    // Stage 2: Payment Gateway & Bank Authorization
    setTimeout(() => {
      setProcessingStage(3);
    }, 2400);

    // Stage 3: Operator Gateway & BBPS Handshake
    setTimeout(() => {
      setProcessingStage(4);
    }, 3600);

    // Stage 4: Result Generation
    setTimeout(() => {
      const nowStr = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      const todayIso = new Date().toISOString().split('T')[0];
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + (selectedPlan.validityDays || 28));
      const expiryIso = expiry.toISOString().split('T')[0];

      const newTxnId = `BBPS-TXN-${Math.floor(100000000000 + Math.random() * 900000000000)}`;
      const newRefNo = `OPR-${provider.toUpperCase()}-${Math.floor(1000000 + Math.random() * 9000000)}`;

      const newLog: MobileRechargeLog = {
        id: currentOrderId,
        transactionId: newTxnId,
        mobileNumber: mobileNumber,
        contactName: favoriteNumbers.find(f => f.mobile === mobileNumber)?.label || `${provider} User`,
        networkProvider: provider,
        rechargeType: rechargeType,
        planCategory: selectedPlan.category.toUpperCase(),
        planName: selectedPlan.name,
        planAmount: selectedPlan.amount,
        validity: selectedPlan.validityText,
        validityDays: selectedPlan.validityDays,
        rechargeDate: nowStr,
        planStartDate: todayIso,
        planExpiryDate: expiryIso,
        paymentMethod: paymentMethod === 'Linked Bank' ? 'Net Banking' : paymentMethod === 'DocPay Wallet' ? 'Wallet' : 'UPI',
        paymentStatus: 'Success',
        rechargeStatus: 'Completed',
        referenceNumber: newRefNo,
        createdBy: user.name,
        createdOn: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        remarks: `Recharge successful via ${paymentMethod}. Idempotency Token: ${idempotencyKey.slice(0, 12)}...`,
      };

      setRechargeLogs(prev => [newLog, ...prev]);
      setActiveTransaction(newLog);

      // Add to recent numbers if not already there
      setRecentNumbers(prev => {
        const filtered = prev.filter(r => r.mobile !== mobileNumber);
        return [
          {
            id: `rec-${Date.now()}`,
            mobile: mobileNumber,
            operator: provider,
            circle: circle,
            lastAmount: selectedPlan.amount,
            lastDate: 'Just now',
          },
          ...filtered,
        ].slice(0, 5);
      });

      onLogActivity(
        'Mobile Recharge Successful',
        `Recharged ${maskMobile(mobileNumber)} (${provider} ${rechargeType}) with ₹${selectedPlan.amount}. Txn ID: ${newTxnId}`,
        'bank'
      );

      setCurrentStep('success');
    }, 4600);
  };

  // Add Favorite
  const handleSaveFavorite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(favMobileInput)) {
      alert('Enter a valid 10-digit mobile number');
      return;
    }
    const newFav: FavoriteItem = {
      id: `fav-${Date.now()}`,
      label: favLabelInput.trim() || 'Saved Number',
      mobile: favMobileInput,
      operator: favOperatorInput,
      circle: circle,
      type: 'prepaid',
    };
    setFavoriteNumbers(prev => [...prev, newFav]);
    setShowAddFavModal(false);
    setFavLabelInput('');
    setFavMobileInput('');
  };

  // Delete Favorite
  const handleDeleteFavorite = (id: string) => {
    setFavoriteNumbers(prev => prev.filter(f => f.id !== id));
  };

  // Delete Recent
  const handleDeleteRecent = (id: string) => {
    setRecentNumbers(prev => prev.filter(r => r.id !== id));
  };

  // Recharge Again Action
  const handleRechargeAgain = (mobile: string, op: 'Jio' | 'Airtel' | 'Vi' | 'BSNL') => {
    setMobileNumber(mobile);
    setProvider(op);
    setIsAutoDetected(false);
    setSelectedPlan(null);
    setCurrentStep('form');
    setActiveModuleTab('new_recharge');
  };

  // Filtered Plans
  const filteredPlans = useMemo(() => {
    return RECHARGE_PLANS.filter((p) => {
      if (p.provider !== provider) return false;
      
      // Category filter matching
      if (selectedCategory !== 'custom') {
        if (selectedCategory === 'yearly') {
          if (p.category !== 'yearly' && p.category !== 'annual') return false;
        } else if (selectedCategory === 'offers') {
          if (p.category !== 'offers' && !p.originalPrice && !p.offerTag) return false;
        } else if (selectedCategory === 'monthly') {
          if (p.category !== 'monthly') return false;
        } else if (selectedCategory === 'annual') {
          if (p.category !== 'yearly' && p.category !== 'annual') return false;
        } else {
          if (p.category !== selectedCategory) return false;
        }
      }

      if (planSearchQuery.trim()) {
        const q = planSearchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.amount.toString().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.ottBenefits && p.ottBenefits.toLowerCase().includes(q)) ||
          (p.offerTag && p.offerTag.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [provider, selectedCategory, planSearchQuery]);

  // Filtered Logs
  const filteredHistoryLogs = useMemo(() => {
    return rechargeLogs.filter((log) => {
      if (historySearch.trim()) {
        const q = historySearch.toLowerCase();
        const matchNum = log.mobileNumber.includes(q);
        const matchName = log.contactName && log.contactName.toLowerCase().includes(q);
        const matchTxn = log.transactionId.toLowerCase().includes(q);
        const matchRef = log.referenceNumber.toLowerCase().includes(q);
        if (!matchNum && !matchName && !matchTxn && !matchRef) return false;
      }
      if (historyProviderFilter !== 'all' && log.networkProvider.toLowerCase() !== historyProviderFilter.toLowerCase()) {
        return false;
      }
      if (historyTypeFilter !== 'all' && log.rechargeType !== historyTypeFilter) {
        return false;
      }
      if (historyStatusFilter !== 'all' && log.rechargeStatus.toLowerCase() !== historyStatusFilter.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [rechargeLogs, historySearch, historyProviderFilter, historyTypeFilter, historyStatusFilter]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-blue-700/50 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-500/30 shrink-0">
              <Smartphone className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Mobile Recharge
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-400/30 uppercase tracking-wider">
                  BBPS LIVE
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Recharge your mobile instantly across all Indian operators with verified plans
              </p>
            </div>
          </div>

          {/* Module Tab Switcher */}
          <div className="flex items-center bg-indigo-950/80 p-1.5 rounded-2xl border border-indigo-700/80 shrink-0">
            <button
              onClick={() => {
                setActiveModuleTab('new_recharge');
                setCurrentStep('form');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeModuleTab === 'new_recharge'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-indigo-200 hover:text-white hover:bg-indigo-900/50'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>New Recharge</span>
            </button>
            <button
              onClick={() => setActiveModuleTab('history_log')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeModuleTab === 'history_log'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-indigo-200 hover:text-white hover:bg-indigo-900/50'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Recharge History ({rechargeLogs.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- NEW RECHARGE FLOW --- */}
      {activeModuleTab === 'new_recharge' && (
        <>
          {/* STEP: FORM ENTRY (Number, Operator, Circle, Plans) */}
          {currentStep === 'form' && (
            <div className="space-y-6">
              
              {/* SECTION 1: MOBILE NUMBER & FAVORITES / RECENTS */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <span>Mobile Number</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter any 10-digit Indian mobile number to fetch active plans
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Input Box */}
                  <div className="lg:col-span-6 space-y-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Enter mobile number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 font-mono font-black text-base">
                        +91
                      </div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        value={mobileNumber}
                        onChange={(e) => handleMobileNumberChange(e.target.value)}
                        placeholder="Enter 10-digit mobile"
                        className={`w-full pl-15 pr-12 py-3.5 bg-slate-50 border ${
                          mobileNumber.length === 10
                            ? isMobileValid
                              ? 'border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/20'
                              : 'border-rose-500 bg-rose-50/20 ring-2 ring-rose-500/20'
                            : 'border-slate-300 focus:border-blue-600 focus:bg-white'
                        } rounded-2xl font-mono text-lg font-bold text-slate-900 transition-all outline-none`}
                      />
                      {mobileNumber.length === 10 && (
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                          {isMobileValid ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="w-6 h-6 text-rose-600" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Real-time Validation Helper */}
                    {mobileNumber.length > 0 && !isMobileValid && (
                      <p className="text-xs text-rose-600 font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Enter a valid 10-digit mobile number</span>
                      </p>
                    )}

                    {/* Auto-detected notification badge */}
                    {isMobileValid && (
                      <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                          <span className="text-xs font-bold text-blue-950">
                            Operator detected: <span className="font-extrabold text-blue-700">{provider}</span> ({circle})
                          </span>
                        </div>
                        <span className="text-[10px] font-black text-blue-600 uppercase bg-white px-2 py-0.5 rounded-lg border border-blue-200">
                          Auto Match
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: Quick Recent & Favorite Numbers */}
                  <div className="lg:col-span-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                        <span>Favorite Numbers</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAddFavModal(true)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Favorite</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {favoriteNumbers.map((fav) => (
                        <div
                          key={fav.id}
                          onClick={() => {
                            setMobileNumber(fav.mobile);
                            setProvider(fav.operator);
                            setCircle(fav.circle);
                            setRechargeType(fav.type);
                            setIsAutoDetected(false);
                          }}
                          className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                            mobileNumber === fav.mobile
                              ? 'bg-blue-50 border-blue-400 shadow-xs'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="font-bold text-xs text-slate-900 truncate">{fav.label}</div>
                            <div className="font-mono text-[11px] text-slate-500">
                              {maskMobile(fav.mobile)} • <span className="font-bold text-blue-600">{fav.operator}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFavorite(fav.id);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Recent Numbers */}
                    {recentNumbers.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                          Recent Recharges
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {recentNumbers.map((rec) => (
                            <div
                              key={rec.id}
                              onClick={() => {
                                setMobileNumber(rec.mobile);
                                setProvider(rec.operator);
                                setCircle(rec.circle);
                                setIsAutoDetected(false);
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                            >
                              <span className="font-mono font-bold text-slate-800">{maskMobile(rec.mobile)}</span>
                              <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100/60 px-1.5 py-0.2 rounded">
                                {rec.operator}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteRecent(rec.id);
                                }}
                                className="text-slate-400 hover:text-rose-500 ml-1"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 2 & 3: OPERATOR, CIRCLE & RECHARGE TYPE */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Select Operator */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Select Operator
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'Airtel', label: 'Airtel', color: '#e40000', tag: '5G Plus' },
                        { id: 'Jio', label: 'Jio', color: '#0072bc', tag: 'True 5G' },
                        { id: 'Vi', label: 'Vi', color: '#d0021b', tag: 'GIGAnet' },
                        { id: 'BSNL', label: 'BSNL', color: '#0084c8', tag: 'National' },
                      ].map((op) => {
                        const isSelected = provider === op.id;
                        return (
                          <button
                            key={op.id}
                            type="button"
                            onClick={() => {
                              setProvider(op.id as any);
                              setIsAutoDetected(false);
                            }}
                            className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                              isSelected
                                ? 'bg-slate-900 border-slate-950 text-white shadow-md ring-2 ring-blue-500/40'
                                : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            <span className="font-black text-sm">{op.label}</span>
                            <span className={`text-[9.5px] font-semibold ${isSelected ? 'text-blue-300' : 'text-slate-500'}`}>
                              {op.tag}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Select Circle / Region */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Select Circle / Region
                    </label>
                    <select
                      value={circle}
                      onChange={(e) => setCircle(e.target.value)}
                      className="w-full py-3.5 px-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                    >
                      {CIRCLES_LIST.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500">
                      Region determines specific talktime & promotional tariff applicability.
                    </p>
                  </div>

                  {/* Recharge Type (Prepaid vs Postpaid) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Recharge Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRechargeType('prepaid')}
                        className={`p-3.5 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                          rechargeType === 'prepaid'
                            ? 'bg-blue-600 border-blue-700 text-white shadow-md'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>Prepaid</span>
                        <span className={`text-[9.5px] ${rechargeType === 'prepaid' ? 'text-blue-100' : 'text-slate-500'}`}>
                          Instant Plans
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRechargeType('postpaid')}
                        className={`p-3.5 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                          rechargeType === 'postpaid'
                            ? 'bg-blue-600 border-blue-700 text-white shadow-md'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>Postpaid</span>
                        <span className={`text-[9.5px] ${rechargeType === 'postpaid' ? 'text-blue-100' : 'text-slate-500'}`}>
                          Bill Payment
                        </span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* SECTION 4: RECHARGE PLANS & CUSTOM AMOUNT */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      <span>Recharge Plans ({provider} • {circle})</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Live tariff vouchers with high-speed data, unlimited calls & bundled OTT subscriptions
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="relative min-w-[260px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={planSearchQuery}
                      onChange={(e) => setPlanSearchQuery(e.target.value)}
                      placeholder="Search plan amount, Hotstar..."
                      className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Plan Categories Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {[
                    { id: 'offers', label: '🔥 Offers & Deals', icon: Tag, highlight: true },
                    { id: 'monthly', label: '📅 Monthly Packs', icon: Calendar, highlight: false },
                    { id: 'yearly', label: '👑 Yearly (365 Days)', icon: ShieldCheck, highlight: false },
                    { id: 'popular', label: 'Recommended', icon: Sparkles, highlight: false },
                    { id: 'unlimited', label: 'Unlimited', icon: Zap, highlight: false },
                    { id: 'data', label: 'Data Booster', icon: Radio, highlight: false },
                    { id: 'talktime', label: 'Talktime', icon: Phone, highlight: false },
                    { id: 'sms', label: 'SMS Packs', icon: Smartphone, highlight: false },
                    { id: 'entertainment', label: 'OTT & Streaming', icon: Tv, highlight: false },
                    { id: 'annual', label: 'Validity Extension', icon: Clock, highlight: false },
                    { id: 'custom', label: 'Custom Amount', icon: CreditCard, highlight: false },
                  ].map((cat) => {
                    const Icon = cat.icon;
                    const isActive = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id as any)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                          isActive
                            ? 'bg-slate-900 text-white shadow-sm ring-2 ring-blue-500/20'
                            : cat.highlight
                            ? 'bg-amber-500/10 text-amber-700 border border-amber-300 hover:bg-amber-500/20'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Amount Form View */}
                {selectedCategory === 'custom' ? (
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 max-w-xl mx-auto text-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 mx-auto flex items-center justify-center font-bold">
                      ₹
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">Enter Custom Recharge Amount</h4>
                      <p className="text-xs text-slate-500">
                        Allow custom amount only when supported by {provider} tariff rules
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="relative max-w-xs mx-auto">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 font-bold text-lg">
                          ₹
                        </span>
                        <input
                          type="number"
                          value={customAmountInput}
                          onChange={(e) => {
                            setCustomAmountInput(e.target.value);
                            setCustomAmountError('');
                          }}
                          placeholder="e.g. 100"
                          className="w-full pl-9 pr-4 py-3 bg-white border border-slate-300 rounded-2xl font-mono text-xl font-black text-slate-900 text-center focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      {customAmountError && (
                        <p className="text-xs text-rose-600 font-bold">{customAmountError}</p>
                      )}
                    </div>

                    {/* Quick Talktime Badges */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Quick Denominations
                      </span>
                      <div className="flex justify-center flex-wrap gap-2">
                        {[10, 20, 50, 100, 500, 1000].map((denom) => (
                          <button
                            key={denom}
                            type="button"
                            onClick={() => setCustomAmountInput(denom.toString())}
                            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-400 rounded-xl text-xs font-bold text-slate-800 transition-all font-mono"
                          >
                            ₹{denom}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleApplyCustomAmount}
                      className="w-full max-w-xs mx-auto py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all"
                    >
                      Continue with Custom Amount
                    </button>
                  </div>
                ) : (
                  /* Standard Plans Grid */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    {filteredPlans.length > 0 ? (
                      filteredPlans.map((plan) => {
                        const getBadgeGradient = (badge?: string) => {
                          switch (badge) {
                            case 'Double Data':
                              return 'from-cyan-600 to-blue-600';
                            case '50% Off':
                            case 'Bumper Offer':
                              return 'from-rose-600 to-pink-600';
                            case 'Special Offer':
                              return 'from-amber-500 to-orange-600';
                            case 'Yearly Pack':
                              return 'from-emerald-600 to-teal-700';
                            case 'Monthly Pack':
                              return 'from-indigo-600 to-blue-700';
                            case 'Best Value':
                              return 'from-emerald-500 to-teal-600';
                            case 'Trending':
                              return 'from-fuchsia-600 to-pink-600';
                            case 'Super Saver':
                              return 'from-purple-600 to-indigo-600';
                            default:
                              return 'from-amber-500 to-orange-500';
                          }
                        };

                        return (
                          <div
                            key={plan.id}
                            className={`p-5 rounded-3xl transition-all flex flex-col justify-between relative group shadow-xs hover:shadow-md border ${
                              plan.category === 'offers' || plan.originalPrice
                                ? 'bg-gradient-to-br from-amber-50/40 via-white to-orange-50/30 border-amber-200 hover:border-amber-400'
                                : plan.category === 'yearly' || plan.category === 'annual'
                                ? 'bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/20 border-emerald-200 hover:border-emerald-400'
                                : plan.category === 'monthly'
                                ? 'bg-gradient-to-br from-indigo-50/30 via-white to-blue-50/20 border-indigo-200 hover:border-indigo-400'
                                : 'bg-gradient-to-br from-slate-50 to-blue-50/20 border-slate-200 hover:border-blue-400'
                            }`}
                          >
                            {plan.recommendedBadge && (
                              <span
                                className={`absolute top-4 right-4 bg-gradient-to-r ${getBadgeGradient(
                                  plan.recommendedBadge
                                )} text-white text-[9.5px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs`}
                              >
                                {plan.recommendedBadge}
                              </span>
                            )}

                            <div>
                              {/* Price, Strikethrough & Name */}
                              <div className="mb-2">
                                <div className="flex items-baseline gap-2 flex-wrap">
                                  <span className="text-2xl font-black text-slate-900 font-mono">
                                    ₹{plan.amount}
                                  </span>
                                  {plan.originalPrice && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs text-slate-400 line-through font-mono">
                                        ₹{plan.originalPrice}
                                      </span>
                                      <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-1.5 py-0.2 rounded font-mono">
                                        {plan.discountPercent || Math.round(((plan.originalPrice - plan.amount) / plan.originalPrice) * 100)}% OFF
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <span className="text-xs font-bold text-slate-800 block truncate mt-0.5">
                                  {plan.name}
                                </span>
                              </div>

                              {/* Special Offer Tag Banner */}
                              {plan.offerTag && (
                                <div className="mb-2.5 px-2.5 py-1 bg-amber-100/80 border border-amber-300/80 rounded-xl flex items-center gap-1.5 text-xs text-amber-900 font-bold">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span className="text-[11px] truncate">{plan.offerTag}</span>
                                </div>
                              )}

                              {/* Yearly Value Indicator */}
                              {(plan.category === 'yearly' || plan.category === 'annual' || plan.validityDays >= 300) && (
                                <div className="mb-2.5 px-2.5 py-1 bg-emerald-100/70 border border-emerald-300/70 rounded-xl flex items-center gap-1.5 text-xs text-emerald-900 font-bold">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                  <span className="text-[11px] truncate">
                                    Full Year 365D • ≈ ₹{(plan.amount / 365).toFixed(1)}/day only
                                  </span>
                                </div>
                              )}

                              {/* Monthly Pack Indicator */}
                              {plan.category === 'monthly' && (
                                <div className="mb-2.5 px-2.5 py-1 bg-indigo-100/70 border border-indigo-300/70 rounded-xl flex items-center gap-1.5 text-xs text-indigo-900 font-bold">
                                  <Calendar className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                                  <span className="text-[11px] truncate">
                                    Monthly Cycle • ₹{(plan.amount / (plan.validityDays || 28)).toFixed(1)}/day
                                  </span>
                                </div>
                              )}

                              {/* Benefit Box */}
                              <div className="grid grid-cols-2 gap-2 my-2.5 p-3 bg-white rounded-2xl border border-slate-100 text-xs shadow-2xs">
                                <div>
                                  <span className="text-[9px] text-slate-400 font-bold block uppercase">
                                    VALIDITY
                                  </span>
                                  <span className="font-bold text-indigo-950 font-mono text-[11.5px]">
                                    {plan.validityText}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 font-bold block uppercase">
                                    DATA BENEFIT
                                  </span>
                                  <span className="font-bold text-emerald-700 text-[11.5px] truncate block">
                                    {plan.dailyData}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 font-bold block uppercase">
                                    VOICE CALLS
                                  </span>
                                  <span className="font-bold text-slate-800 text-[11.5px]">
                                    {plan.voiceCalling}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 font-bold block uppercase">
                                    SMS
                                  </span>
                                  <span className="font-bold text-slate-800 text-[11.5px]">
                                    {plan.smsBenefits}
                                  </span>
                                </div>
                              </div>

                              {/* OTT Benefit */}
                              {plan.ottBenefits && (
                                <div className="p-2.5 bg-blue-50/90 border border-blue-200/70 rounded-xl mb-3 flex items-center gap-2 text-xs">
                                  <Tv className="w-4 h-4 text-blue-600 shrink-0" />
                                  <span className="font-bold text-blue-950 text-[11px] leading-tight truncate">
                                    {plan.ottBenefits}
                                  </span>
                                </div>
                              )}

                              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                                {plan.description}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSelectPlan(plan)}
                              className={`w-full py-2.5 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all ${
                                plan.category === 'offers' || plan.originalPrice
                                  ? 'bg-amber-600 hover:bg-amber-700'
                                  : plan.category === 'yearly' || plan.category === 'annual'
                                  ? 'bg-emerald-700 hover:bg-emerald-800'
                                  : plan.category === 'monthly'
                                  ? 'bg-indigo-600 hover:bg-indigo-700'
                                  : 'bg-blue-600 hover:bg-blue-700'
                              }`}
                            >
                              <span>Select Plan</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
                        <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="font-bold text-sm text-slate-700">No plans found in this category</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Try switching category tabs or clearing your search filter.
                        </p>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          )}

          {/* STEP: RECHARGE SUMMARY SCREEN */}
          {currentStep === 'summary' && selectedPlan && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl max-w-xl mx-auto p-6 border border-slate-200 shadow-lg space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep('form')}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Plans</span>
                </button>
                <span className="text-xs font-mono text-slate-400">Order: {currentOrderId}</span>
              </div>

              <div className="text-center space-y-1">
                <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center font-bold text-xl mb-2">
                  <Smartphone className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Recharge Summary</h3>
                <p className="text-xs text-slate-500">
                  Review your mobile recharge details before selecting payment method
                </p>
              </div>

              {/* Summary Details Card */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-3.5 text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">Mobile Number</span>
                  <span className="font-mono font-black text-slate-900 text-sm">
                    {maskMobile(mobileNumber)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">Operator & Circle</span>
                  <span className="font-bold text-blue-700">
                    {provider} • {circle}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">Plan</span>
                  <span className="font-bold text-slate-800 font-mono">₹{selectedPlan.amount}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">Validity</span>
                  <span className="font-bold text-emerald-700 font-mono">{selectedPlan.validityText}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">Data / Benefits</span>
                  <span className="font-bold text-slate-800 text-right">{selectedPlan.dailyData}, {selectedPlan.voiceCalling}</span>
                </div>

                {/* Amount Row */}
                <div className="pt-2 flex justify-between items-center font-black text-base text-slate-900">
                  <span>Amount</span>
                  <span className="font-mono text-xl text-blue-600">₹{selectedPlan.amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Proceed to Payment Method */}
              <button
                type="button"
                onClick={() => setCurrentStep('payment_select')}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Pay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP: SELECT PAYMENT METHOD */}
          {currentStep === 'payment_select' && selectedPlan && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl max-w-xl mx-auto p-6 border border-slate-200 shadow-lg space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep('summary')}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Summary</span>
                </button>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>256-Bit SSL Secured</span>
                </div>
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-xl font-black text-slate-900">Select Payment Method</h3>
                <p className="text-xs text-slate-500">
                  Pay ₹{selectedPlan.amount} for {maskMobile(mobileNumber)} ({provider})
                </p>
              </div>

              {/* Payment Methods Options */}
              <div className="space-y-3">
                {/* 1. UPI */}
                <div
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'UPI'
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-xs text-slate-900">UPI (NPCI Instant)</div>
                        <div className="text-[11px] text-slate-500 font-mono">{upiVpa}</div>
                      </div>
                    </div>
                    <Radio className={`w-5 h-5 ${paymentMethod === 'UPI' ? 'text-blue-600 fill-blue-600' : 'text-slate-300'}`} />
                  </div>
                </div>

                {/* 2. Linked Bank Account */}
                <div
                  onClick={() => setPaymentMethod('Linked Bank')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'Linked Bank'
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-xs text-slate-900">Linked Bank Account</div>
                        <div className="text-[11px] text-slate-500">Direct debit from authorized account</div>
                      </div>
                    </div>
                    <Radio className={`w-5 h-5 ${paymentMethod === 'Linked Bank' ? 'text-blue-600 fill-blue-600' : 'text-slate-300'}`} />
                  </div>

                  {paymentMethod === 'Linked Bank' && banks.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-blue-200/60">
                      <select
                        value={selectedBankId}
                        onChange={(e) => setSelectedBankId(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                      >
                        {banks.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.bankName} - {b.accountNumberMasked} (Balance: {b.balance})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* 3. DocPay Wallet */}
                <div
                  onClick={() => setPaymentMethod('DocPay Wallet')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'DocPay Wallet'
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-xs text-slate-900">DocPay Fast Wallet</div>
                        <div className="text-[11px] text-slate-500">Balance: ₹2,450.00 • Zero-PIN Instant</div>
                      </div>
                    </div>
                    <Radio className={`w-5 h-5 ${paymentMethod === 'DocPay Wallet' ? 'text-blue-600 fill-blue-600' : 'text-slate-300'}`} />
                  </div>
                </div>
              </div>

              {/* Pay Button with Idempotency Protection */}
              <button
                type="button"
                onClick={handleStartPayment}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Pay ₹{selectedPlan.amount} Securely</span>
              </button>
            </motion.div>
          )}

          {/* STEP: PROCESSING ANIMATION SCREEN */}
          {currentStep === 'processing' && selectedPlan && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl max-w-lg mx-auto p-8 border border-slate-200 shadow-xl space-y-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center relative">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">Processing Payment</h3>
                <p className="text-xs text-slate-500">
                  Connecting to {provider} BBPS Switch for mobile {maskMobile(mobileNumber)}
                </p>
              </div>

              {/* Progress Steps */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-left text-xs">
                <div className={`flex items-center gap-3 ${processingStage >= 1 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${processingStage >= 1 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {processingStage > 1 ? '✓' : '1'}
                  </div>
                  <span>Create recharge order & idempotency lock</span>
                </div>

                <div className={`flex items-center gap-3 ${processingStage >= 2 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${processingStage >= 2 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {processingStage > 2 ? '✓' : '2'}
                  </div>
                  <span>Authorized payment verification with {paymentMethod}</span>
                </div>

                <div className={`flex items-center gap-3 ${processingStage >= 3 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${processingStage >= 3 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {processingStage > 3 ? '✓' : '3'}
                  </div>
                  <span>Submit recharge request to {provider} switch</span>
                </div>

                <div className={`flex items-center gap-3 ${processingStage >= 4 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${processingStage >= 4 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {processingStage >= 4 ? '✓' : '4'}
                  </div>
                  <span>Receive provider confirmation & generate receipt</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">Please do not press back or refresh this page.</p>
            </motion.div>
          )}

          {/* STEP: SUCCESS SCREEN */}
          {currentStep === 'success' && activeTransaction && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl max-w-lg mx-auto p-8 border border-slate-200 shadow-xl space-y-6 text-center"
            >
              <div className="w-18 h-18 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center font-bold text-3xl shadow-lg shadow-emerald-500/20">
                ✓
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900">Recharge Successful ✓</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Your plan has been activated on your mobile number.
                </p>
              </div>

              {/* Summary Receipt Box */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl text-xs space-y-2.5 text-left font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Mobile:</span>
                  <span className="font-bold text-slate-900">{maskMobile(activeTransaction.mobileNumber)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Operator:</span>
                  <span className="font-bold text-blue-700">{activeTransaction.networkProvider}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Amount:</span>
                  <span className="font-bold text-slate-900 text-sm">₹{activeTransaction.planAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="font-bold text-indigo-900">{activeTransaction.transactionId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="text-slate-700">{activeTransaction.rechargeDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-emerald-700 uppercase">{activeTransaction.rechargeStatus}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep('form');
                    if (onNavigateHome) onNavigateHome();
                  }}
                  className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={() => generateRechargeReceiptPDF(activeTransaction)}
                  className="py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-2xl transition-all border border-blue-200 flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>View Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan(null);
                    setCurrentStep('form');
                  }}
                  className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl transition-all shadow-md"
                >
                  Recharge Again
                </button>
              </div>
            </motion.div>
          )}

        </>
      )}

      {/* --- RECHARGE HISTORY LOG VIEW --- */}
      {activeModuleTab === 'history_log' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Transactions → Mobile Recharge</span>
              </h3>
              <p className="text-xs text-slate-500">
                Audit log of completed, processing, and refunded recharges
              </p>
            </div>

            <button
              onClick={() => exportRechargeLogsCSV(filteredHistoryLogs)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-2xl text-xs font-bold transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search mobile, Txn ID..."
                className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={historyProviderFilter}
              onChange={(e) => setHistoryProviderFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
            >
              <option value="all">All Operators</option>
              <option value="airtel">Airtel</option>
              <option value="jio">Jio</option>
              <option value="vi">Vi</option>
              <option value="bsnl">BSNL</option>
            </select>

            <select
              value={historyTypeFilter}
              onChange={(e) => setHistoryTypeFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
            >
              <option value="all">All Types</option>
              <option value="prepaid">Prepaid</option>
              <option value="postpaid">Postpaid</option>
            </select>

            <select
              value={historyStatusFilter}
              onChange={(e) => setHistoryStatusFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Recharge Details</th>
                  <th className="p-3.5">Mobile</th>
                  <th className="p-3.5">Operator</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {filteredHistoryLogs.length > 0 ? (
                  filteredHistoryLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-all">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{log.planName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{log.transactionId}</div>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        {maskMobile(log.mobileNumber)}
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-blue-700">{log.networkProvider}</span>
                      </td>
                      <td className="p-3.5 font-mono font-black text-slate-900">
                        ₹{log.planAmount}
                      </td>
                      <td className="p-3.5 text-slate-600 font-mono text-[11px]">
                        {log.rechargeDate}
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{log.rechargeStatus}</span>
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => generateRechargeReceiptPDF(log)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                        >
                          Receipt
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRechargeAgain(log.mobileNumber, log.networkProvider)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs"
                        >
                          Recharge Again
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No mobile recharge transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ADD FAVORITE MODAL --- */}
      {showAddFavModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveFavorite}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 relative"
          >
            <button
              type="button"
              onClick={() => setShowAddFavModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">Save Favorite Number</h3>
              <p className="text-xs text-slate-500">Quick-pick trusted mobile numbers for repeat recharges</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nickname / Contact Name</label>
                <input
                  type="text"
                  required
                  value={favLabelInput}
                  onChange={(e) => setFavLabelInput(e.target.value)}
                  placeholder="e.g. Dad, Mom, Brother"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">10-Digit Mobile Number</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={favMobileInput}
                  onChange={(e) => setFavMobileInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 9848022338"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Operator</label>
                <select
                  value={favOperatorInput}
                  onChange={(e) => setFavOperatorInput(e.target.value as any)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  <option value="Airtel">Airtel</option>
                  <option value="Jio">Jio</option>
                  <option value="Vi">Vi</option>
                  <option value="BSNL">BSNL</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddFavModal(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl"
              >
                Save Number
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
