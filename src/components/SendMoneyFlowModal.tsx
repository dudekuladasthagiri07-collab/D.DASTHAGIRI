import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  User,
  Phone,
  Search,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowLeft,
  Star,
  Clock,
  ShieldCheck,
  Copy,
  Check,
  Building2,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  RefreshCw,
  Share2,
  FileText
} from 'lucide-react';
import { BankAccount, BankTransaction, UserProfile } from '../types';
import { BankLogo } from './BankLogo';
import { lookupBankRegisteredName } from '../utils/bankLookup';

interface SendMoneyFlowModalProps {
  banks: BankAccount[];
  user: UserProfile;
  initialRecipient?: {
    name?: string;
    phoneOrUpi?: string;
    bankName?: string;
  };
  initialBankId?: string;
  onUpdateBanks: (banks: BankAccount[]) => void;
  onAddTransaction: (tx: BankTransaction) => void;
  onClose: () => void;
  onLogActivity: (
    title: string,
    description: string,
    type: 'auth' | 'security' | 'document' | 'bank' | 'portal'
  ) => void;
}

export interface ContactItem {
  id: string;
  name: string;
  phone: string;
  upiId: string;
  bankName: string;
  initials: string;
  avatarBg: string;
  recentAmount?: string;
  isFavorite?: boolean;
}

const DEFAULT_CONTACTS: ContactItem[] = [
  {
    id: 'c-giri',
    name: 'Giri',
    phone: '9390240130',
    upiId: '9390240130@sbi',
    bankName: 'State Bank of India',
    initials: 'G',
    avatarBg: 'bg-emerald-600',
    recentAmount: '₹2,500',
    isFavorite: true,
  },
  {
    id: 'c1',
    name: 'Ramesh Kumar',
    phone: '9876543210',
    upiId: 'ramesh.k@okicici',
    bankName: 'ICICI Bank',
    initials: 'RK',
    avatarBg: 'bg-indigo-600',
    recentAmount: '₹1,200',
    isFavorite: true,
  },
  {
    id: 'c2',
    name: 'Priya Sharma',
    phone: '9812345678',
    upiId: 'priyasharma@sbi',
    bankName: 'State Bank of India',
    initials: 'PS',
    avatarBg: 'bg-emerald-600',
    recentAmount: '₹3,500',
    isFavorite: true,
  },
  {
    id: 'c3',
    name: 'Rahul Verma',
    phone: '9765432109',
    upiId: 'rahul.verma@hdfcbank',
    bankName: 'HDFC Bank',
    initials: 'RV',
    avatarBg: 'bg-blue-600',
    recentAmount: '₹500',
    isFavorite: false,
  },
  {
    id: 'c4',
    name: 'Ananya Patel',
    phone: '9654321098',
    upiId: 'ananya@paytm',
    bankName: 'Paytm Bank',
    initials: 'AP',
    avatarBg: 'bg-purple-600',
    recentAmount: '₹2,100',
    isFavorite: true,
  },
  {
    id: 'c5',
    name: 'Suresh Kumar (Landlord)',
    phone: '9432109876',
    upiId: 'suresh.rent@ybl',
    bankName: 'Yes Bank',
    initials: 'SK',
    avatarBg: 'bg-amber-600',
    recentAmount: '₹15,000',
    isFavorite: true,
  },
  {
    id: 'c6',
    name: 'Rajesh Gupta (Groceries)',
    phone: '9321098765',
    upiId: 'rajesh.kirana@okaxis',
    bankName: 'Axis Bank',
    initials: 'RG',
    avatarBg: 'bg-rose-600',
    recentAmount: '₹850',
    isFavorite: false,
  },
  {
    id: 'c7',
    name: 'Vikram Singh',
    phone: '9543210987',
    upiId: 'vikram.s@barodampay',
    bankName: 'Bank of Baroda',
    initials: 'VS',
    avatarBg: 'bg-teal-600',
    recentAmount: '₹4,000',
    isFavorite: false,
  },
  {
    id: 'c8',
    name: 'Sneha Reddy',
    phone: '9845012345',
    upiId: 'sneha.reddy@okicici',
    bankName: 'Kotak Mahindra Bank',
    initials: 'SR',
    avatarBg: 'bg-cyan-600',
    recentAmount: '₹750',
    isFavorite: true,
  },
];

type FlowStep = 'recipient' | 'amount' | 'pin' | 'processing' | 'success';

export const SendMoneyFlowModal: React.FC<SendMoneyFlowModalProps> = ({
  banks,
  user,
  initialRecipient,
  initialBankId,
  onUpdateBanks,
  onAddTransaction,
  onClose,
  onLogActivity,
}) => {
  // Navigation Steps
  const [currentStep, setCurrentStep] = useState<FlowStep>(
    initialRecipient?.phoneOrUpi ? 'amount' : 'recipient'
  );

  // Recipient Selection State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites' | 'recent'>('all');
  const [selectedRecipient, setSelectedRecipient] = useState<{
    name: string;
    phoneOrUpi: string;
    bankName: string;
    initials: string;
    avatarBg: string;
  }>(() => {
    if (initialRecipient) {
      return {
        name: initialRecipient.name || 'Recipient Account',
        phoneOrUpi: initialRecipient.phoneOrUpi || '',
        bankName: initialRecipient.bankName || 'Verified Bank Account',
        initials: (initialRecipient.name || 'RA').slice(0, 2).toUpperCase(),
        avatarBg: 'bg-emerald-600',
      };
    }
    return {
      name: '',
      phoneOrUpi: '',
      bankName: '',
      initials: '',
      avatarBg: 'bg-emerald-600',
    };
  });

  // Direct Input State for new UPI ID / Mobile
  const [manualInput, setManualInput] = useState('');
  const [manualName, setManualName] = useState('');
  const [isManualInputMode, setIsManualInputMode] = useState(false);

  // Amount & Bank Selection State
  const [selectedBankId, setSelectedBankId] = useState<string>(() => {
    if (initialBankId && banks.some((b) => b.id === initialBankId)) {
      return initialBankId;
    }
    const primary = banks.find((b) => b.isPrimary);
    return primary ? primary.id : banks[0]?.id || '';
  });
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [amountError, setAmountError] = useState<string>('');

  // PIN & Security State
  const [pin, setPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [attemptsRemaining, setAttemptsRemaining] = useState<number>(3);
  const [isLockedOut, setIsLockedOut] = useState<boolean>(false);
  const [lockoutTimer, setLockoutTimer] = useState<number>(0);

  // Completed Transaction State
  const [completedTx, setCompletedTx] = useState<BankTransaction | null>(null);
  const [copiedUtr, setCopiedUtr] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Timer Ref for cleanup
  const processingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (processingTimerRef.current) clearTimeout(processingTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setShowToast(null), 3000);
  };

  // Lockout Countdown
  useEffect(() => {
    if (lockoutTimer > 0) {
      const t = setTimeout(() => setLockoutTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(t);
    } else if (isLockedOut) {
      setIsLockedOut(false);
      setAttemptsRemaining(3);
      setPinError('');
    }
  }, [lockoutTimer, isLockedOut]);

  // Filtered Contacts
  const filteredContacts = useMemo(() => {
    return DEFAULT_CONTACTS.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        c.upiId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.bankName.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (activeFilter === 'favorites') return c.isFavorite;
      if (activeFilter === 'recent') return Boolean(c.recentAmount);
      return true;
    });
  }, [searchQuery, activeFilter]);

  // Selected Bank Object
  const selectedBank = useMemo(() => {
    return banks.find((b) => b.id === selectedBankId) || banks[0];
  }, [banks, selectedBankId]);

  const availableBalance = selectedBank?.rawBalanceNumber ?? 25000;

  // Handle Contact Pick
  const handleSelectContact = (c: ContactItem) => {
    setSelectedRecipient({
      name: c.name,
      phoneOrUpi: c.upiId || c.phone,
      bankName: c.bankName,
      initials: c.initials,
      avatarBg: c.avatarBg,
    });
    setAmountError('');
    setCurrentStep('amount');
  };

  // Handle Manual UPI / Mobile submit
  const handleProceedManualRecipient = () => {
    const trimmed = manualInput.trim();
    if (!trimmed) {
      setAmountError('Please enter a valid UPI ID or 10-digit mobile number');
      return;
    }
    const bankLookup = lookupBankRegisteredName(trimmed);
    const nameToUse = manualName.trim() || (bankLookup ? bankLookup.bankRegisteredName : (trimmed.includes('@') ? trimmed.split('@')[0] : `User ${trimmed.slice(-4)}`));
    const bankNameToUse = bankLookup ? bankLookup.bankName : (trimmed.includes('@') ? 'UPI Verified Account' : 'Direct Mobile Transfer');

    setSelectedRecipient({
      name: nameToUse,
      phoneOrUpi: trimmed,
      bankName: bankNameToUse,
      initials: nameToUse.slice(0, 2).toUpperCase(),
      avatarBg: 'bg-emerald-600',
    });
    setAmountError('');
    setCurrentStep('amount');
  };

  // Quick Amount Chips
  const handleAddQuickAmount = (val: number) => {
    const current = parseFloat(amount) || 0;
    const nextVal = current + val;
    setAmount(nextVal.toString());
    setAmountError('');
  };

  // Validate & Proceed to PIN
  const handleProceedToPin = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setAmountError('Please enter a valid transfer amount');
      return;
    }

    if (numericAmount > availableBalance) {
      setAmountError(
        `Insufficient funds in ${selectedBank?.bankName || 'bank'}. Available balance: ₹${availableBalance.toLocaleString('en-IN')}`
      );
      return;
    }

    if (numericAmount > 100000) {
      setAmountError('Maximum UPI single transaction limit is ₹1,00,000 as per NPCI guidelines.');
      return;
    }

    setAmountError('');
    setPin('');
    setPinError('');
    setCurrentStep('pin');
  };

  // Virtual Keypad / Physical Keypad Input for PIN
  const handleKeypadPress = (digit: string) => {
    if (isLockedOut) return;
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setPinError('');
      if (nextPin.length === 4) {
        verifyPinAndExecute(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    if (isLockedOut) return;
    setPin((prev) => prev.slice(0, -1));
    setPinError('');
  };

  // Listen to physical keyboard on PIN step
  useEffect(() => {
    if (currentStep !== 'pin') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeypadPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, pin, isLockedOut]);

  // Verify PIN & Finalize Transaction
  const verifyPinAndExecute = (enteredPin: string) => {
    const validPin = user.pin || '1907';
    const isCorrect = enteredPin === validPin || enteredPin === '1907' || enteredPin === '1234';

    if (!isCorrect) {
      const remaining = attemptsRemaining - 1;
      setAttemptsRemaining(remaining);
      setPin('');

      if (remaining <= 0) {
        setIsLockedOut(true);
        setLockoutTimer(30);
        setPinError('Too many incorrect attempts. Security lockout active for 30 seconds.');
      } else {
        setPinError(`Incorrect UPI PIN. ${remaining} attempt${remaining > 1 ? 's' : ''} left.`);
      }
      return;
    }

    // Step 4: Show Processing State
    setCurrentStep('processing');

    processingTimerRef.current = setTimeout(() => {
      const numAmount = parseFloat(amount);
      const newBal = availableBalance - numAmount;

      // Update source bank balance
      const updatedBanks = banks.map((b) =>
        b.id === selectedBankId
          ? {
              ...b,
              rawBalanceNumber: newBal,
              balance: `₹${newBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            }
          : b
      );
      onUpdateBanks(updatedBanks);

      // Create new transaction
      const generatedUtr = `UPI${Date.now().toString().slice(-12)}`;
      const newTx: BankTransaction = {
        id: `tx-${Date.now()}`,
        type: 'send',
        fromBankId: selectedBank.id,
        fromBankName: selectedBank.bankName,
        recipientName: selectedRecipient.name || 'Recipient Account',
        recipientUpiOrPhone: selectedRecipient.phoneOrUpi,
        amount: numAmount,
        timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        status: 'completed',
        utrNumber: generatedUtr,
        note: note.trim() || 'Direct UPI Transfer',
      };

      onAddTransaction(newTx);
      setCompletedTx(newTx);
      setCurrentStep('success');

      onLogActivity(
        'UPI Money Transfer Completed',
        `Transferred ₹${numAmount.toLocaleString('en-IN')} to ${selectedRecipient.name} (${selectedRecipient.phoneOrUpi}) from ${selectedBank.bankName}. UTR: ${generatedUtr}`,
        'bank'
      );
    }, 1400);
  };

  const handleCopyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(true);
    triggerToast('UTR Reference ID copied to clipboard');
    setTimeout(() => setCopiedUtr(false), 2000);
  };

  const handleResetForAnotherTransfer = () => {
    setAmount('');
    setNote('');
    setPin('');
    setPinError('');
    setCompletedTx(null);
    setCurrentStep('recipient');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-[0_0_60px_rgba(16,185,129,0.2)] overflow-hidden text-slate-100 my-auto flex flex-col max-h-[92vh]">
        
        {/* Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{showToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3">
            {currentStep !== 'recipient' && currentStep !== 'processing' && currentStep !== 'success' && (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 'amount') setCurrentStep('recipient');
                  if (currentStep === 'pin') setCurrentStep('amount');
                }}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
              <Send className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white">
                  {currentStep === 'recipient' && 'Send Money via UPI'}
                  {currentStep === 'amount' && 'Enter Transfer Amount'}
                  {currentStep === 'pin' && 'Enter UPI PIN'}
                  {currentStep === 'processing' && 'Processing Transfer'}
                  {currentStep === 'success' && 'Transfer Successful'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Instant 0% Fee
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {currentStep === 'recipient' && 'Step 1 of 3: Select recipient or contact'}
                {currentStep === 'amount' && 'Step 2 of 3: Specify amount & debit account'}
                {currentStep === 'pin' && 'Step 3 of 3: Secure NPCI 4-digit PIN'}
                {currentStep === 'processing' && 'NPCI Bank Gateway Switch in progress'}
                {currentStep === 'success' && 'Transaction completed successfully'}
              </p>
            </div>
          </div>

          {currentStep !== 'processing' && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">

          {/* STEP 1: RECIPIENT SELECTION */}
          {currentStep === 'recipient' && (
            <div className="space-y-4">
              {/* Direct UPI ID or Phone Input Toggle Banner */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400" />
                    New Transfer to UPI ID / Mobile
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsManualInputMode(!isManualInputMode)}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                  >
                    {isManualInputMode ? 'Hide Direct Entry' : '+ Enter Manually'}
                  </button>
                </div>

                {isManualInputMode && (
                  <div className="pt-2 space-y-2.5">
                    <input
                      type="text"
                      placeholder="e.g. 9390240130 or 9876543210 or user@sbi"
                      value={manualInput}
                      onChange={(e) => {
                        setManualInput(e.target.value);
                        setAmountError('');
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                    />

                    {/* Real-time Bank Directory Match preview for manualInput */}
                    {(() => {
                      const lookup = lookupBankRegisteredName(manualInput.trim());
                      if (!lookup) return null;
                      return (
                        <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-xl flex items-center justify-between animate-in fade-in duration-200">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs">
                              {lookup.bankRegisteredName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-bold text-emerald-400 uppercase">
                                  Name as per Bank
                                </span>
                                <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" />
                              </div>
                              <p className="text-xs font-black text-white">{lookup.bankRegisteredName}</p>
                              <p className="text-[10px] text-slate-400">{lookup.bankName} • {lookup.phone}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                            Auto-Resolved
                          </span>
                        </div>
                      );
                    })()}

                    <input
                      type="text"
                      placeholder="Recipient Name (optional - auto-fetched if in directory)"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={handleProceedManualRecipient}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Continue to Amount</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Contacts Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by name, phone (e.g. 9390240130), or UPI ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Live search match from NPCI bank directory if query typed */}
              {(() => {
                if (!searchQuery.trim() || searchQuery.trim().length < 3) return null;
                const lookup = lookupBankRegisteredName(searchQuery.trim());
                if (!lookup) return null;
                return (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 font-black text-xs flex items-center justify-center border border-emerald-500/30">
                        {lookup.bankRegisteredName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] uppercase font-bold text-emerald-400">
                            Bank-Registered Name
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                            NPCI Verified ✓
                          </span>
                        </div>
                        <p className="font-extrabold text-xs text-white">{lookup.bankRegisteredName}</p>
                        <p className="text-[10px] text-slate-400">{lookup.bankName} • {lookup.phone}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRecipient({
                          name: lookup.bankRegisteredName,
                          phoneOrUpi: lookup.phone,
                          bankName: lookup.bankName,
                          initials: lookup.bankRegisteredName.slice(0, 2).toUpperCase(),
                          avatarBg: 'bg-emerald-600',
                        });
                        setCurrentStep('amount');
                      }}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Pay Now
                    </button>
                  </div>
                );
              })()}

              {/* Filter Pills */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  All ({DEFAULT_CONTACTS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('favorites')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeFilter === 'favorites'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  Favorites
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('recent')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeFilter === 'recent'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Recent Transfers
                </button>
              </div>

              {/* Contacts List */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {filteredContacts.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 space-y-2">
                    <User className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-xs">No contacts match your query.</p>
                    <button
                      type="button"
                      onClick={() => setIsManualInputMode(true)}
                      className="text-xs font-bold text-emerald-400 underline cursor-pointer"
                    >
                      Enter UPI ID or Phone manually
                    </button>
                  </div>
                ) : (
                  filteredContacts.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectContact(c)}
                      className="w-full p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl flex items-center justify-between text-left transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl ${c.avatarBg} flex items-center justify-center text-white font-black text-xs shadow-md shrink-0`}
                        >
                          {c.initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors">
                              {c.name}
                            </h4>
                            {c.isFavorite && (
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">{c.upiId || c.phone}</p>
                          <p className="text-[10px] text-slate-500">{c.bankName}</p>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        {c.recentAmount && (
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">Recent</span>
                            <span className="text-xs font-bold text-emerald-400 font-mono">
                              {c.recentAmount}
                            </span>
                          </div>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* STEP 2: AMOUNT & DEBIT BANK SELECTION */}
          {currentStep === 'amount' && (
            <div className="space-y-5">
              {/* Recipient Card */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl ${selectedRecipient.avatarBg} flex items-center justify-center text-white font-black text-xs shadow-md shrink-0`}
                  >
                    {selectedRecipient.initials || 'RA'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-black text-white">{selectedRecipient.name}</h4>
                      <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400" title="NPCI Verified">
                        <CheckCircle2 className="w-3 h-3" />
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{selectedRecipient.phoneOrUpi}</p>
                    <p className="text-[10px] text-slate-500">{selectedRecipient.bankName}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep('recipient')}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-400 transition-all cursor-pointer"
                >
                  Change
                </button>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Transfer Amount (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-emerald-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    autoFocus
                    placeholder="0"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setAmountError('');
                    }}
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-950 border-2 border-slate-800 focus:border-emerald-400 rounded-2xl text-2xl font-black text-white placeholder-slate-600 focus:outline-none font-mono"
                  />
                </div>

                {/* Quick Amount Chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[100, 500, 1000, 2000, 5000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleAddQuickAmount(val)}
                      className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[11px] font-bold text-slate-300 transition-all cursor-pointer"
                    >
                      +₹{val.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sender Bank Registration Info */}
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-2xl flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Sender Details (as per Bank Directory)
                  </span>
                  <p className="font-extrabold text-white text-xs">
                    {user.name || 'DUDEKULA DASTHAGIRI'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Linked Mobile: <strong className="text-emerald-400 font-mono">+91 9390240130</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    NPCI Active
                  </span>
                </div>
              </div>

              {/* Debit Bank Account Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Debit From Account</label>
                  <span className="text-[11px] text-slate-400">
                    Avail: <strong className="text-emerald-400 font-mono">₹{availableBalance.toLocaleString('en-IN')}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {banks.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setSelectedBankId(b.id);
                        setAmountError('');
                      }}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        selectedBankId === b.id
                          ? 'bg-slate-950 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-400/40'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <BankLogo bankName={b.bankName} ifscCode={b.ifscCode} size="sm" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-white">{b.bankName}</h4>
                            {b.isPrimary && (
                              <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase bg-amber-500/20 text-amber-300">
                                Primary
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {b.accountNumberMasked} • {b.accountType.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Balance</span>
                        <span className="text-xs font-extrabold text-white font-mono">
                          ₹{(b.rawBalanceNumber || 25000).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Note / Remarks */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Add a Note / Purpose (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dinner split, Rent, Shopping"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={50}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {['Dinner', 'Rent', 'Groceries', 'Gift', 'Bill Split'].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setNote(suggestion)}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-medium text-slate-300 transition-colors cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Banner */}
              {amountError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-300 text-xs animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{amountError}</span>
                </div>
              )}

              {/* Encrypted Transfer Trust Pill */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>NPCI 256-Bit Encrypted Transfer Switch</span>
                </div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                  Zero Fees
                </span>
              </div>

              {/* Proceed Button */}
              <button
                type="button"
                onClick={handleProceedToPin}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer ring-2 ring-emerald-300/40"
              >
                <span>Proceed to Pay {amount ? `₹${parseFloat(amount).toLocaleString('en-IN')}` : ''}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 3: SECURE PIN CONFIRMATION */}
          {currentStep === 'pin' && (
            <div className="space-y-6 py-2">
              {/* Payment Summary Header */}
              <div className="text-center space-y-1">
                <p className="text-xs text-slate-400">Paying to</p>
                <h3 className="text-lg font-black text-white">{selectedRecipient.name}</h3>
                <p className="text-2xl font-black text-emerald-400 font-mono">
                  ₹{parseFloat(amount || '0').toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-slate-400">
                  from {selectedBank?.bankName} ({selectedBank?.accountNumberMasked})
                </p>
              </div>

              {/* PIN Dots Display */}
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="flex items-center gap-3">
                  {[0, 1, 2, 3].map((index) => {
                    const isFilled = pin.length > index;
                    return (
                      <div
                        key={index}
                        className={`w-4 h-4 rounded-full border-2 transition-all ${
                          isFilled
                            ? 'bg-emerald-400 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.8)] scale-110'
                            : 'border-slate-700 bg-slate-950'
                        }`}
                      />
                    );
                  })}
                </div>

                <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>Enter 4-digit UPI Security PIN (Default: 1907 or 1234)</span>
                </p>
              </div>

              {/* Error / Lockout Banner */}
              {pinError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{pinError}</span>
                  {isLockedOut && <span className="font-mono font-bold">({lockoutTimer}s)</span>}
                </div>
              )}

              {/* Virtual Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    disabled={isLockedOut}
                    onClick={() => handleKeypadPress(digit)}
                    className="py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-lg font-bold text-white transition-all active:scale-95 cursor-pointer disabled:opacity-40"
                  >
                    {digit}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setPin('')}
                  disabled={isLockedOut || pin.length === 0}
                  className="py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-400 transition-all cursor-pointer disabled:opacity-40"
                >
                  Clear
                </button>

                <button
                  type="button"
                  disabled={isLockedOut}
                  onClick={() => handleKeypadPress('0')}
                  className="py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-lg font-bold text-white transition-all active:scale-95 cursor-pointer disabled:opacity-40"
                >
                  0
                </button>

                <button
                  type="button"
                  disabled={isLockedOut || pin.length === 0}
                  onClick={handleBackspace}
                  className="py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-amber-400 transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center"
                  title="Backspace"
                >
                  ⌫
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PROCESSING SWITCH ANIMATION */}
          {currentStep === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-5 text-center">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-400/20" />
                <div className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Send className="w-8 h-8 text-emerald-400 animate-pulse" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-white">Connecting with NPCI Gateway</h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  Debiting {selectedBank?.bankName} and initiating real-time settlement to {selectedRecipient.name}...
                </p>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Encrypted Banking Tunnel Active</span>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS / RECEIPT SCREEN */}
          {currentStep === 'success' && completedTx && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-5 py-2"
            >
              {/* Success Badge */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-xl font-black text-white">Transfer Successful</h3>
                <p className="text-3xl font-black text-emerald-400 font-mono">
                  ₹{completedTx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-slate-300">
                  Paid to <strong className="text-white font-bold">{completedTx.recipientName}</strong>
                </p>
              </div>

              {/* Receipt Details Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Recipient UPI / Phone</span>
                  <span className="font-bold text-white font-mono">{completedTx.recipientUpiOrPhone}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Debited Account</span>
                  <span className="font-bold text-white">
                    {completedTx.fromBankName} ({selectedBank?.accountNumberMasked})
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Transaction Date & Time</span>
                  <span className="font-medium text-slate-300">{completedTx.timestamp}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">UPI Ref / UTR Number</span>
                  <div className="flex items-center gap-1.5 font-mono text-amber-300 font-bold">
                    <span>{completedTx.utrNumber}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyUtr(completedTx.utrNumber)}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy UTR"
                    >
                      {copiedUtr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {completedTx.note && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">Note</span>
                    <span className="font-medium text-slate-300 italic">"{completedTx.note}"</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleResetForAnotherTransfer}
                  className="py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  <span>Send Another</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerToast('Receipt downloaded and saved to vault');
                    setTimeout(onClose, 800);
                  }}
                  className="py-3 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Done</span>
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};
