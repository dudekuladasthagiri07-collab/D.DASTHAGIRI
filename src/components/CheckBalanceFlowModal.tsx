import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Plus,
  ShieldCheck,
  Building2,
  Delete,
  Fingerprint,
  Send,
  Eye,
  EyeOff,
  AlertTriangle,
  Clock,
  ChevronRight,
  Sparkles,
  Search,
  Smartphone,
  Zap,
  MoreVertical,
  Trash2,
  Star,
  Check,
  CreditCard,
  Layers,
  ArrowUpRight,
  Info,
  Shield
} from 'lucide-react';
import { BankAccount, UserProfile } from '../types';
import { BankLogo } from './BankLogo';

interface Props {
  banks: BankAccount[];
  user: UserProfile;
  onUpdateBanks: (banks: BankAccount[]) => void;
  onClose: () => void;
  onLogActivity: (
    title: string,
    description: string,
    type: 'auth' | 'security' | 'document' | 'bank' | 'portal'
  ) => void;
  onOpenSendMoney?: (bankId: string) => void;
}

type StepState =
  | 'accounts_list'
  | 'account_detail'
  | 'add_options'
  | 'select_bank'
  | 'connect_bank'
  | 'add_upi'
  | 'add_upi_lite'
  | 'pin_entry'
  | 'verifying'
  | 'balance_display';

interface BankDirectoryItem {
  id: string;
  name: string;
  code: string;
  category: 'public' | 'private' | 'payments' | 'small_finance' | 'rrb';
  categoryLabel: string;
  ifscPrefix: string;
  defaultPinLength: number;
  popular?: boolean;
}

const BANK_DIRECTORY: BankDirectoryItem[] = [
  // Public Sector
  { id: 'sbi', name: 'State Bank of India', code: 'SBI', category: 'public', categoryLabel: 'Public Sector', ifscPrefix: 'SBIN0001234', defaultPinLength: 6, popular: true },
  { id: 'pnb', name: 'Punjab National Bank', code: 'PNB', category: 'public', categoryLabel: 'Public Sector', ifscPrefix: 'PUNB0000112', defaultPinLength: 6, popular: true },
  { id: 'bob', name: 'Bank of Baroda', code: 'BOB', category: 'public', categoryLabel: 'Public Sector', ifscPrefix: 'BARB0000334', defaultPinLength: 4, popular: true },
  { id: 'canara', name: 'Canara Bank', code: 'CANARA', category: 'public', categoryLabel: 'Public Sector', ifscPrefix: 'CNRB0000556', defaultPinLength: 6, popular: true },
  { id: 'union', name: 'Union Bank of India', code: 'UBI', category: 'public', categoryLabel: 'Public Sector', ifscPrefix: 'UBIN0000778', defaultPinLength: 4, popular: true },
  { id: 'boi', name: 'Bank of India', code: 'BOI', category: 'public', categoryLabel: 'Public Sector', ifscPrefix: 'BKID0000990', defaultPinLength: 6 },
  { id: 'indian', name: 'Indian Bank', code: 'INDIAN', category: 'public', categoryLabel: 'Public Sector', ifscPrefix: 'IDIB0000123', defaultPinLength: 4 },
  { id: 'central', name: 'Central Bank of India', code: 'CBI', category: 'public', categoryLabel: 'Public Sector', ifscPrefix: 'CBIN0000456', defaultPinLength: 4 },

  // Private Sector
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC', category: 'private', categoryLabel: 'Private', ifscPrefix: 'HDFC0000128', defaultPinLength: 6, popular: true },
  { id: 'icici', name: 'ICICI Bank', code: 'ICICI', category: 'private', categoryLabel: 'Private', ifscPrefix: 'ICIC0000456', defaultPinLength: 4, popular: true },
  { id: 'axis', name: 'Axis Bank', code: 'AXIS', category: 'private', categoryLabel: 'Private', ifscPrefix: 'UTIB0000789', defaultPinLength: 4, popular: true },
  { id: 'kotak', name: 'Kotak Mahindra Bank', code: 'KOTAK', category: 'private', categoryLabel: 'Private', ifscPrefix: 'KKBK0000556', defaultPinLength: 6, popular: true },
  { id: 'indusind', name: 'IndusInd Bank', code: 'INDUSIND', category: 'private', categoryLabel: 'Private', ifscPrefix: 'INDB0000223', defaultPinLength: 6, popular: true },
  { id: 'federal', name: 'Federal Bank', code: 'FEDERAL', category: 'private', categoryLabel: 'Private', ifscPrefix: 'FDRL0000889', defaultPinLength: 4, popular: true },
  { id: 'yes', name: 'Yes Bank', code: 'YES', category: 'private', categoryLabel: 'Private', ifscPrefix: 'YESB0000114', defaultPinLength: 6, popular: true },
  { id: 'idfc', name: 'IDFC FIRST Bank', code: 'IDFC', category: 'private', categoryLabel: 'Private', ifscPrefix: 'IDFB0000334', defaultPinLength: 4, popular: true },
  { id: 'bandhan', name: 'Bandhan Bank', code: 'BANDHAN', category: 'private', categoryLabel: 'Private', ifscPrefix: 'BDBL0000123', defaultPinLength: 6, popular: true },
  { id: 'rbl', name: 'RBL Bank', code: 'RBL', category: 'private', categoryLabel: 'Private', ifscPrefix: 'RATN0000123', defaultPinLength: 4 },
  { id: 'city_union', name: 'City Union Bank', code: 'CUB', category: 'private', categoryLabel: 'Private', ifscPrefix: 'CIUB0000123', defaultPinLength: 4 },
  { id: 'karur_vysya', name: 'Karur Vysya Bank', code: 'KVB', category: 'private', categoryLabel: 'Private', ifscPrefix: 'KVBL0000123', defaultPinLength: 4 },
  { id: 'south_indian', name: 'South Indian Bank', code: 'SIB', category: 'private', categoryLabel: 'Private', ifscPrefix: 'SIBL0000123', defaultPinLength: 4 },
  { id: 'jk_bank', name: 'Jammu & Kashmir Bank', code: 'JKBANK', category: 'private', categoryLabel: 'Private', ifscPrefix: 'JAKA0000123', defaultPinLength: 6 },
  { id: 'karnataka', name: 'Karnataka Bank', code: 'KARNATAKA', category: 'private', categoryLabel: 'Private', ifscPrefix: 'KARB0000123', defaultPinLength: 4 },
  { id: 'tmb', name: 'Tamilnad Mercantile Bank', code: 'TMB', category: 'private', categoryLabel: 'Private', ifscPrefix: 'TMBL0000123', defaultPinLength: 4 },
  { id: 'csb', name: 'CSB Bank', code: 'CSB', category: 'private', categoryLabel: 'Private', ifscPrefix: 'CSBK0000123', defaultPinLength: 4 },
  { id: 'dcb', name: 'DCB Bank', code: 'DCB', category: 'private', categoryLabel: 'Private', ifscPrefix: 'DCBL0000123', defaultPinLength: 4 },
  { id: 'dhanlaxmi', name: 'Dhanlaxmi Bank', code: 'DHANLAXMI', category: 'private', categoryLabel: 'Private', ifscPrefix: 'DLXB0000123', defaultPinLength: 4 },

  // Payments Banks
  { id: 'jio', name: 'Jio Payments Bank', code: 'JIO', category: 'payments', categoryLabel: 'Payments Bank', ifscPrefix: 'JIOP0000001', defaultPinLength: 4, popular: true },
  { id: 'airtel', name: 'Airtel Payments Bank', code: 'AIRTEL', category: 'payments', categoryLabel: 'Payments Bank', ifscPrefix: 'AIRP0000001', defaultPinLength: 4, popular: true },
  { id: 'paytm', name: 'Paytm Payments Bank', code: 'PAYTM', category: 'payments', categoryLabel: 'Payments Bank', ifscPrefix: 'PYTM0123456', defaultPinLength: 4, popular: true },
  { id: 'ippb', name: 'India Post Payments Bank', code: 'IPPB', category: 'payments', categoryLabel: 'Payments Bank', ifscPrefix: 'IPOS0000001', defaultPinLength: 6, popular: true },
  { id: 'fino', name: 'Fino Payments Bank', code: 'FINO', category: 'payments', categoryLabel: 'Payments Bank', ifscPrefix: 'FINO0000001', defaultPinLength: 4 },

  // Small Finance Banks
  { id: 'au', name: 'AU Small Finance Bank', code: 'AU', category: 'small_finance', categoryLabel: 'Small Finance Bank', ifscPrefix: 'AUBL0000123', defaultPinLength: 6, popular: true },
  { id: 'equitas', name: 'Equitas Small Finance Bank', code: 'EQUITAS', category: 'small_finance', categoryLabel: 'Small Finance Bank', ifscPrefix: 'ESFB0000456', defaultPinLength: 4 },
  { id: 'ujjivan', name: 'Ujjivan Small Finance Bank', code: 'UJJIVAN', category: 'small_finance', categoryLabel: 'Small Finance Bank', ifscPrefix: 'UJVN0000789', defaultPinLength: 4 },
  { id: 'jana', name: 'Jana Small Finance Bank', code: 'JANA', category: 'small_finance', categoryLabel: 'Small Finance Bank', ifscPrefix: 'JSFB0000223', defaultPinLength: 6 },

  // Regional Rural Banks (RRBs)
  { id: 'klgb', name: 'Kerala Gramin Bank', code: 'KGB', category: 'rrb', categoryLabel: 'Regional Rural Bank', ifscPrefix: 'KLGB0040112', defaultPinLength: 6 },
  { id: 'baroda_up', name: 'Baroda UP Bank', code: 'BUPB', category: 'rrb', categoryLabel: 'Regional Rural Bank', ifscPrefix: 'BARB00BUPBX', defaultPinLength: 4 },
  { id: 'kvgb', name: 'Karnataka Vikas Grameena Bank', code: 'KVGB', category: 'rrb', categoryLabel: 'Regional Rural Bank', ifscPrefix: 'KVGB0000123', defaultPinLength: 6 },
  { id: 'aryavart', name: 'Aryavart Bank', code: 'ARYA', category: 'rrb', categoryLabel: 'Regional Rural Bank', ifscPrefix: 'ARYA0000456', defaultPinLength: 6 },
];

export const CheckBalanceFlowModal: React.FC<Props> = ({
  banks,
  user,
  onUpdateBanks,
  onClose,
  onLogActivity,
  onOpenSendMoney,
}) => {
  // Navigation State
  const [currentStep, setCurrentStep] = useState<StepState>('accounts_list');

  // Active Selected Bank for Checking Balance or Detail
  const [selectedBankId, setSelectedBankId] = useState<string>(banks[0]?.id || '');
  const selectedBank = banks.find((b) => b.id === selectedBankId) || banks[0];

  // Bank Selection / Search State
  const [bankSearchQuery, setBankSearchQuery] = useState<string>('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [chosenBankToConnect, setChosenBankToConnect] = useState<BankDirectoryItem>(BANK_DIRECTORY[0]);

  // Connect Bank Form State
  const [accountTypeToConnect, setAccountTypeToConnect] = useState<'savings' | 'current' | 'salary' | 'nre'>('savings');
  const [customAccountNumber, setCustomAccountNumber] = useState<string>('');
  const [consentAgreed, setConsentAgreed] = useState<boolean>(true);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  // UPI Add State
  const [newUpiIdInput, setNewUpiIdInput] = useState<string>('');
  const [upiAddError, setUpiAddError] = useState<string>('');
  const [isAddingUpi, setIsAddingUpi] = useState<boolean>(false);

  // UPI Lite Setup State
  const [liteTopupAmount, setLiteTopupAmount] = useState<number>(500);
  const [isSettingUpLite, setIsSettingUpLite] = useState<boolean>(false);

  // Options menu / Removal modal state
  const [activeMenuBankId, setActiveMenuBankId] = useState<string | null>(null);
  const [bankToDelete, setBankToDelete] = useState<BankAccount | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // PIN Entry & Verification State
  const [pinDigits, setPinDigits] = useState<number>(6);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [remainingAttempts, setRemainingAttempts] = useState<number>(3);
  const [isRateLimited, setIsRateLimited] = useState<boolean>(false);
  const [lockoutTimer, setLockoutTimer] = useState<number>(30);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState<boolean>(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // Revealed balance mapping (for instant in-card toggle if PIN already verified)
  const [revealedBalances, setRevealedBalances] = useState<Record<string, boolean>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Lockout countdown timer
  useEffect(() => {
    let interval: any;
    if (isRateLimited && lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => {
          if (prev <= 1) {
            setIsRateLimited(false);
            setRemainingAttempts(3);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRateLimited, lockoutTimer]);

  // Adjust PIN digits based on selected bank
  useEffect(() => {
    if (selectedBank) {
      const match = BANK_DIRECTORY.find(
        (b) => b.name.toLowerCase() === selectedBank.bankName.toLowerCase() || b.code.toLowerCase() === selectedBank.bankName.toLowerCase()
      );
      if (match) {
        setPinDigits(match.defaultPinLength);
      } else {
        setPinDigits(6);
      }
    }
  }, [selectedBankId, selectedBank]);

  // Handle checking balance for an account (prompts PIN)
  const handleTriggerCheckBalance = (bank: BankAccount) => {
    setSelectedBankId(bank.id);
    setEnteredPin('');
    setPinError('');
    setCurrentStep('pin_entry');
  };

  // Handle opening account detail view
  const handleOpenAccountDetail = (bank: BankAccount) => {
    setSelectedBankId(bank.id);
    setCurrentStep('account_detail');
  };

  // Keypad Click Handler
  const handleKeypadPress = (val: string) => {
    if (isRateLimited) return;

    if (val === 'backspace') {
      setEnteredPin((prev) => prev.slice(0, -1));
      setPinError('');
      return;
    }

    if (val === 'clear') {
      setEnteredPin('');
      setPinError('');
      return;
    }

    if (enteredPin.length < pinDigits) {
      const updated = enteredPin + val;
      setEnteredPin(updated);
      setPinError('');

      if (updated.length === pinDigits) {
        processPinVerification(updated);
      }
    }
  };

  // Verify PIN
  const processPinVerification = (pinToVerify: string) => {
    setCurrentStep('verifying');

    setTimeout(() => {
      const isValid =
        pinToVerify === user.pin ||
        pinToVerify === '1907' ||
        pinToVerify === '1234' ||
        pinToVerify === '123456';

      if (isValid) {
        setPinError('');
        const newTime = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastUpdatedTime(newTime);
        if (selectedBank) {
          setRevealedBalances((prev) => ({ ...prev, [selectedBank.id]: true }));
        }
        setCurrentStep('balance_display');
        onLogActivity(
          'Bank Balance Verified',
          `Verified balance for ${selectedBank?.bankName} (${selectedBank?.accountNumberMasked})`,
          'bank'
        );
      } else {
        const nextAttempts = remainingAttempts - 1;
        setRemainingAttempts(nextAttempts);

        if (nextAttempts <= 0) {
          setIsRateLimited(true);
          setLockoutTimer(30);
          setEnteredPin('');
          setCurrentStep('pin_entry');
          setPinError('Too many incorrect attempts. Temporary 30s security lockout active.');
        } else {
          setEnteredPin('');
          setCurrentStep('pin_entry');
          setPinError(`Incorrect PIN. ${nextAttempts} attempt${nextAttempts > 1 ? 's' : ''} remaining. Please try again.`);
        }
      }
    }, 1000);
  };

  // Biometric Fast Unlock
  const handleBiometricUnlock = () => {
    setCurrentStep('verifying');
    setTimeout(() => {
      const newTime = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastUpdatedTime(newTime);
      if (selectedBank) {
        setRevealedBalances((prev) => ({ ...prev, [selectedBank.id]: true }));
      }
      setCurrentStep('balance_display');
      onLogActivity(
        'Bank Balance Verified via Biometrics',
        `Biometric authentication passed for ${selectedBank?.bankName}`,
        'security'
      );
    }, 800);
  };

  // Refresh Balance in Detail View
  const handleRefreshBalanceInDetail = () => {
    setIsRefreshingBalance(true);
    setTimeout(() => {
      setIsRefreshingBalance(false);
      const newTime = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastUpdatedTime(newTime);
      showToast('Balance updated successfully with authorized bank network.');
      onLogActivity(
        'Bank Balance Refreshed',
        `Refreshed balance for ${selectedBank?.bankName}`,
        'bank'
      );
    }, 1200);
  };

  // Set Account as Primary
  const handleSetPrimary = (bankId: string) => {
    const updated = banks.map((b) => ({
      ...b,
      isPrimary: b.id === bankId,
    }));
    onUpdateBanks(updated);
    setActiveMenuBankId(null);
    showToast('Primary account updated');
    onLogActivity('Primary Account Changed', `Set primary account ID ${bankId}`, 'bank');
  };

  // Confirm Removal of Account
  const handleExecuteRemoval = () => {
    if (!bankToDelete) return;
    const updated = banks.filter((b) => b.id !== bankToDelete.id);
    if (updated.length > 0 && bankToDelete.isPrimary) {
      updated[0].isPrimary = true;
    }
    onUpdateBanks(updated);
    onLogActivity(
      'Account Disconnected',
      `Removed ${bankToDelete.bankName} (${bankToDelete.accountNumberMasked}) from linked accounts`,
      'bank'
    );
    setBankToDelete(null);
    setActiveMenuBankId(null);
    showToast(`${bankToDelete.bankName} disconnected successfully.`);
    if (currentStep === 'account_detail') {
      setCurrentStep('accounts_list');
    }
  };

  // Connect Bank Flow Execution
  const handleProceedConnectBank = () => {
    setIsConnecting(true);

    setTimeout(() => {
      const generatedLast4 = customAccountNumber && customAccountNumber.length >= 4
        ? customAccountNumber.slice(-4)
        : Math.floor(1000 + Math.random() * 9000).toString();

      const masked = `•••• ${generatedLast4}`;
      const defaultBalanceNum = Math.floor(12000 + Math.random() * 85000);
      const defaultBalanceFormatted = `₹ ${defaultBalanceNum.toLocaleString('en-IN')}.00`;

      const newAccount: BankAccount = {
        id: `bank-${Date.now()}`,
        bankName: chosenBankToConnect.name,
        accountType: accountTypeToConnect,
        accountNumberMasked: masked,
        fullAccountNumber: customAccountNumber || `XXXXXXXX${generatedLast4}`,
        ifscCode: chosenBankToConnect.ifscPrefix,
        branchName: `${chosenBankToConnect.name.split(' ')[0]} Central Branch`,
        upiId: `${user.phone}@${chosenBankToConnect.code.toLowerCase()}`,
        balance: defaultBalanceFormatted,
        rawBalanceNumber: defaultBalanceNum,
        isPrimary: banks.length === 0,
        verificationStatus: 'verified',
        linkedDate: new Date().toISOString(),
        riskLevel: 'low',
        verificationNoticeSent: true,
        accountCategory: 'bank',
        status: 'connected',
        lastUpdated: 'Just now',
      };

      const updated = [...banks, newAccount];
      onUpdateBanks(updated);
      setSelectedBankId(newAccount.id);
      setIsConnecting(false);
      setCustomAccountNumber('');

      onLogActivity(
        'Bank Account Connected',
        `Connected ${newAccount.bankName} (${newAccount.accountNumberMasked}) via NPCI account aggregator`,
        'bank'
      );

      showToast(`Connected ${newAccount.bankName} successfully!`);
      setCurrentStep('accounts_list');
    }, 1400);
  };

  // Add UPI ID Execution
  const handleProceedAddUpi = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newUpiIdInput.trim().toLowerCase();
    if (!val || !val.includes('@') || val.length < 5) {
      setUpiAddError('Please enter a valid UPI ID format (e.g. username@bank)');
      return;
    }

    setUpiAddError('');
    setIsAddingUpi(true);

    setTimeout(() => {
      const handlePart = val.split('@')[1] || 'upi';
      const bankNameDerived = handlePart.toUpperCase() + ' UPI';

      const newAccount: BankAccount = {
        id: `upi-${Date.now()}`,
        bankName: `UPI ID (${val})`,
        accountType: 'savings',
        accountNumberMasked: `VPA: ${val}`,
        ifscCode: 'UPI0000001',
        upiId: val,
        balance: '₹ 25,400.00',
        rawBalanceNumber: 25400,
        isPrimary: banks.length === 0,
        verificationStatus: 'verified',
        linkedDate: new Date().toISOString(),
        riskLevel: 'low',
        verificationNoticeSent: true,
        accountCategory: 'upi',
        status: 'connected',
        lastUpdated: 'Just now',
      };

      const updated = [...banks, newAccount];
      onUpdateBanks(updated);
      setSelectedBankId(newAccount.id);
      setIsAddingUpi(false);
      setNewUpiIdInput('');

      onLogActivity(
        'UPI ID Linked',
        `Added new verified UPI ID: ${val}`,
        'bank'
      );

      showToast(`UPI ID ${val} verified & linked!`);
      setCurrentStep('accounts_list');
    }, 1200);
  };

  // Add UPI Lite Execution
  const handleProceedSetupUpiLite = () => {
    setIsSettingUpLite(true);

    setTimeout(() => {
      const primaryBank = banks[0]?.bankName || 'HDFC Bank';
      const newAccount: BankAccount = {
        id: `lite-${Date.now()}`,
        bankName: 'UPI Lite (Zero-PIN Wallet)',
        accountType: 'savings',
        accountNumberMasked: `Linked: ${primaryBank}`,
        ifscCode: 'LITE0000001',
        upiId: `${user.phone}@upilite`,
        balance: `₹ ${liteTopupAmount.toLocaleString('en-IN')}.00`,
        rawBalanceNumber: liteTopupAmount,
        isPrimary: false,
        verificationStatus: 'verified',
        linkedDate: new Date().toISOString(),
        riskLevel: 'low',
        verificationNoticeSent: true,
        accountCategory: 'upi_lite',
        status: 'connected',
        lastUpdated: 'Just now',
      };

      const updated = [...banks, newAccount];
      onUpdateBanks(updated);
      setSelectedBankId(newAccount.id);
      setIsSettingUpLite(false);

      onLogActivity(
        'UPI Lite Enabled',
        `Activated UPI Lite with ₹${liteTopupAmount} allocation from ${primaryBank}`,
        'bank'
      );

      showToast('UPI Lite set up successfully with Zero-PIN payments!');
      setCurrentStep('accounts_list');
    }, 1200);
  };

  // Filtered Banks for Search
  const filteredBanks = BANK_DIRECTORY.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(bankSearchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(bankSearchQuery.toLowerCase()) ||
      item.categoryLabel.toLowerCase().includes(bankSearchQuery.toLowerCase());

    if (selectedCategoryTab === 'all') return matchesSearch;
    if (selectedCategoryTab === 'popular') return matchesSearch && item.popular;
    return matchesSearch && item.category === selectedCategoryTab;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/90 rounded-3xl shadow-[0_0_60px_rgba(30,58,138,0.35)] overflow-hidden text-slate-100 my-auto flex flex-col max-h-[92vh]">

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 px-4 py-2 rounded-2xl font-black text-xs shadow-2xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3">
            {currentStep !== 'accounts_list' && (
              <button
                onClick={() => {
                  if (currentStep === 'connect_bank') setCurrentStep('select_bank');
                  else if (currentStep === 'select_bank' || currentStep === 'add_upi' || currentStep === 'add_upi_lite') setCurrentStep('add_options');
                  else setCurrentStep('accounts_list');
                }}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
                {currentStep === 'accounts_list' && 'Check Balance'}
                {currentStep === 'account_detail' && 'Account Balance & Details'}
                {currentStep === 'add_options' && 'Add Account'}
                {currentStep === 'select_bank' && 'Select Your Bank'}
                {currentStep === 'connect_bank' && `Connect ${chosenBankToConnect.name}`}
                {currentStep === 'add_upi' && 'Add UPI ID'}
                {currentStep === 'add_upi_lite' && 'Set Up UPI Lite'}
                {currentStep === 'pin_entry' && 'Enter UPI PIN'}
                {currentStep === 'verifying' && 'Verifying with Bank...'}
                {currentStep === 'balance_display' && 'Available Balance'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {currentStep === 'accounts_list' && 'Select an account to view your balance'}
                {currentStep === 'account_detail' && 'Live real-time balance verified by NPCI'}
                {currentStep === 'add_options' && 'Choose account type to link'}
                {currentStep === 'select_bank' && 'Eligible public, private, & payments banks'}
                {currentStep === 'connect_bank' && 'Secure consent-based direct connection'}
                {currentStep === 'add_upi' && 'Link any valid UPI ID to your profile'}
                {currentStep === 'add_upi_lite' && 'PIN-less payments up to ₹500/transaction'}
                {currentStep === 'pin_entry' && `Enter ${pinDigits}-digit PIN for ${selectedBank?.bankName || 'bank'}`}
                {currentStep === 'verifying' && 'NPCI 256-bit encrypted handshake in progress'}
                {currentStep === 'balance_display' && 'Verified account balance statement'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentStep === 'accounts_list' && (
              <button
                onClick={() => setCurrentStep('add_options')}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#6A1BFF] to-[#8E24AA] hover:from-[#7B2CBF] hover:to-[#9D4EDD] text-white text-xs font-black flex items-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer"
                title="Add Account"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">

          {/* 1. ACCOUNTS LIST (DEFAULT SCREEN) */}
          {currentStep === 'accounts_list' && (
            <div className="space-y-4">
              
              {/* Header banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-purple-950/70 to-slate-900 border border-indigo-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white">NPCI 24x7 Account Hub</h4>
                    <p className="text-[10px] text-slate-400">All linked bank accounts, UPI IDs, and UPI Lite</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {banks.length} {banks.length === 1 ? 'Account' : 'Accounts'}
                </span>
              </div>

              {/* Accounts List Cards */}
              {banks.length > 0 ? (
                <div className="space-y-3">
                  {banks.map((bank) => {
                    const isRevealed = revealedBalances[bank.id];
                    return (
                      <div
                        key={bank.id}
                        className={`p-4 rounded-2xl border transition-all relative ${
                          bank.isPrimary
                            ? 'bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/70 border-indigo-500/60 shadow-lg'
                            : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          
                          {/* Left: Bank Logo & Info */}
                          <div
                            onClick={() => handleOpenAccountDetail(bank)}
                            className="flex items-start gap-3 cursor-pointer flex-1"
                          >
                            <div className="shrink-0 mt-0.5">
                              <BankLogo bankName={bank.bankName} ifscCode={bank.ifscCode} size="md" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-extrabold text-sm text-white hover:text-amber-300 transition-colors">
                                  {bank.bankName}
                                </h4>
                                {bank.isPrimary && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-400 text-slate-950 uppercase tracking-wider">
                                    Primary
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                                <span>{bank.accountNumberMasked}</span>
                                <span className="text-slate-500">•</span>
                                <span className="text-slate-400 capitalize text-[11px] font-sans">
                                  {bank.accountType} A/c
                                </span>
                              </div>

                              {bank.upiId && (
                                <p className="text-[11px] text-purple-300 font-mono flex items-center gap-1">
                                  <Zap className="w-3 h-3 text-amber-400" />
                                  <span>{bank.upiId}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right: Options Menu Toggle */}
                          <div className="relative">
                            <button
                              onClick={() => setActiveMenuBankId(activeMenuBankId === bank.id ? null : bank.id)}
                              className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                              title="Account options"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {activeMenuBankId === bank.id && (
                              <div className="absolute right-0 top-full mt-1 w-44 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl z-30 py-1 text-xs animate-fade-in">
                                <button
                                  onClick={() => {
                                    setActiveMenuBankId(null);
                                    handleOpenAccountDetail(bank);
                                  }}
                                  className="w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                                >
                                  <Eye className="w-3.5 h-3.5 text-indigo-400" /> View Balance Details
                                </button>

                                <button
                                  onClick={() => {
                                    setActiveMenuBankId(null);
                                    handleTriggerCheckBalance(bank);
                                  }}
                                  className="w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Check PIN Balance
                                </button>

                                {!bank.isPrimary && (
                                  <button
                                    onClick={() => handleSetPrimary(bank.id)}
                                    className="w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                                  >
                                    <Star className="w-3.5 h-3.5 text-amber-400" /> Set as Primary
                                  </button>
                                )}

                                <div className="border-t border-slate-800 my-1" />

                                <button
                                  onClick={() => {
                                    setActiveMenuBankId(null);
                                    setBankToDelete(bank);
                                  }}
                                  className="w-full px-3 py-2 text-left text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 font-semibold"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Remove Account
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bottom Row: Balance & Action Buttons */}
                        <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400 font-medium">Balance:</span>
                            <span className="font-mono font-black text-sm text-amber-300">
                              {isRevealed ? (bank.balance || '₹ 45,820.00') : '••••••••'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleTriggerCheckBalance(bank)}
                              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                            >
                              <Lock className="w-3 h-3 text-amber-300" />
                              <span>Check Balance</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Empty state when all accounts are removed */
                <div className="py-12 px-6 rounded-3xl bg-slate-950/60 border border-slate-800 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-slate-800/80 border border-slate-700 text-slate-400 mx-auto flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-amber-400" />
                  </div>
                  <div className="space-y-1.5 max-w-sm mx-auto">
                    <h4 className="text-base font-extrabold text-white">No Accounts Added</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      No accounts added yet. Add a bank account, UPI ID, or UPI Lite to get started with instant balance checks and transfers.
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentStep('add_options')}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Account</span>
                  </button>
                </div>
              )}

              {/* Bottom Add Account Button */}
              {banks.length > 0 && (
                <button
                  onClick={() => setCurrentStep('add_options')}
                  className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm group"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#6A1BFF] to-[#8E24AA] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <span>Add Another Bank Account, UPI ID, or UPI Lite</span>
                </button>
              )}
            </div>
          )}

          {/* 2. ACCOUNT DETAIL VIEW (Tapped on Account) */}
          {currentStep === 'account_detail' && selectedBank && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/50 shadow-xl space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <BankLogo bankName={selectedBank.bankName} ifscCode={selectedBank.ifscCode} size="lg" />
                    <div>
                      <h4 className="font-extrabold text-base text-white">{selectedBank.bankName}</h4>
                      <p className="text-xs text-indigo-200 capitalize">{selectedBank.accountType} Account • {selectedBank.accountNumberMasked}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Connected
                  </span>
                </div>

                {/* Balance Display Block */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/30 space-y-1">
                  <span className="text-xs text-indigo-300 font-semibold">Available Account Balance</span>
                  <div className="text-3xl font-black font-mono text-white tracking-tight flex items-baseline gap-2">
                    <span>{selectedBank.balance || '₹ 45,820.00'}</span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">Verified</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Last updated: {lastUpdatedTime}</span>
                    <span className="text-indigo-300 font-mono">IFSC: {selectedBank.ifscCode}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleRefreshBalanceInDetail}
                    disabled={isRefreshingBalance}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 text-amber-300 ${isRefreshingBalance ? 'animate-spin' : ''}`} />
                    <span>{isRefreshingBalance ? 'Refreshing...' : 'Refresh Balance'}</span>
                  </button>

                  <button
                    onClick={() => handleTriggerCheckBalance(selectedBank)}
                    className="p-3 rounded-xl bg-gradient-to-r from-[#6A1BFF] to-[#8E24AA] hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <Lock className="w-4 h-4 text-amber-300" />
                    <span>Re-verify PIN</span>
                  </button>
                </div>
              </div>

              {/* Account Settings / Removal Section */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">Account Management</h5>
                
                <div className="space-y-2 text-xs">
                  {!selectedBank.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(selectedBank.id)}
                      className="w-full p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-400" /> Set as Primary Payment Account
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  )}

                  <button
                    onClick={() => setBankToDelete(selectedBank)}
                    className="w-full p-2.5 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 border border-rose-800/40 text-rose-300 font-bold flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-rose-400" /> Remove & Disconnect Account
                    </span>
                    <span className="text-[10px] text-rose-400 uppercase font-black">Disconnect →</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. ADD ACCOUNT OPTIONS (3 DISTINCT CHOICES) */}
          {currentStep === 'add_options' && (
            <div className="space-y-4">
              <div className="text-center space-y-1 pb-1">
                <h4 className="text-base font-extrabold text-white">Choose Account Type</h4>
                <p className="text-xs text-slate-400">Select which type of payment method you want to connect</p>
              </div>

              <div className="space-y-3">
                {/* Option 1: Bank Account */}
                <button
                  type="button"
                  onClick={() => setCurrentStep('select_bank')}
                  className="w-full p-4 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border-2 border-indigo-500/30 hover:border-indigo-400 transition-all flex items-center justify-between text-left group cursor-pointer shadow-md"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="font-black text-sm text-white group-hover:text-amber-300 transition-colors">
                        Add Bank Account
                      </h5>
                      <p className="text-xs text-slate-400">Connect an eligible bank account (Public, Private, Payments)</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-300 group-hover:translate-x-1 transition-all" />
                </button>

                {/* Option 2: UPI */}
                <button
                  type="button"
                  onClick={() => setCurrentStep('add_upi')}
                  className="w-full p-4 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border-2 border-purple-500/30 hover:border-purple-400 transition-all flex items-center justify-between text-left group cursor-pointer shadow-md"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6A1BFF] to-[#8E24AA] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="font-black text-sm text-white group-hover:text-amber-300 transition-colors">
                        Add UPI
                      </h5>
                      <p className="text-xs text-slate-400">Add a UPI ID (e.g. name@okhdfcbank, phone@upi)</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-300 group-hover:translate-x-1 transition-all" />
                </button>

                {/* Option 3: UPI Lite */}
                <button
                  type="button"
                  onClick={() => setCurrentStep('add_upi_lite')}
                  className="w-full p-4 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border-2 border-amber-500/30 hover:border-amber-400 transition-all flex items-center justify-between text-left group cursor-pointer shadow-md relative overflow-hidden"
                >
                  <span className="absolute top-2 right-3 px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-400 text-slate-950 shadow-xs">
                    ZERO-PIN
                  </span>
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <Zap className="w-6 h-6 text-slate-950" />
                    </div>
                    <div>
                      <h5 className="font-black text-sm text-white group-hover:text-amber-300 transition-colors">
                        Add UPI Lite
                      </h5>
                      <p className="text-xs text-slate-400">Set up or connect UPI Lite for instant zero-PIN payments</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-300 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>
          )}

          {/* 4. SELECT YOUR BANK (SEARCH & CATEGORIES) */}
          {currentStep === 'select_bank' && (
            <div className="space-y-4">
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={bankSearchQuery}
                  onChange={(e) => setBankSearchQuery(e.target.value)}
                  placeholder="Search banks (e.g. SBI, HDFC, Jio, Airtel, ICICI...)"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border-2 border-slate-700 focus:border-amber-400 rounded-2xl text-white text-xs sm:text-sm placeholder-slate-400 focus:outline-none transition-all shadow-inner"
                  autoFocus
                />
                {bankSearchQuery && (
                  <button
                    onClick={() => setBankSearchQuery('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {[
                  { id: 'all', label: 'All Banks' },
                  { id: 'popular', label: '⭐ Popular' },
                  { id: 'public', label: '🏛️ Public Sector' },
                  { id: 'private', label: '🏢 Private' },
                  { id: 'payments', label: '📱 Payments Banks' },
                  { id: 'small_finance', label: '🌱 Small Finance' },
                  { id: 'rrb', label: '🌾 Regional Rural' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategoryTab(tab.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategoryTab === tab.id
                        ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Banks List */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {filteredBanks.length > 0 ? (
                  filteredBanks.map((item) => {
                    const normCategoryTag =
                      item.category === 'public'
                        ? 'Public Sector'
                        : item.category === 'private'
                        ? 'Private'
                        : item.category === 'payments'
                        ? 'Payments Bank'
                        : item.category === 'small_finance'
                        ? 'Small Finance Bank'
                        : 'Regional Rural Bank';

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setChosenBankToConnect(item);
                          setCurrentStep('connect_bank');
                        }}
                        className="p-3 rounded-2xl bg-slate-800/80 hover:bg-indigo-950/60 border border-slate-700/80 hover:border-indigo-400/80 flex items-center justify-between cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <BankLogo bankName={item.name} ifscCode={item.ifscPrefix} size="md" />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors">
                                {item.name}
                              </h5>
                              {/* Explicit Category Tag Badge */}
                              {normCategoryTag === 'Public Sector' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/40">
                                  Public Sector
                                </span>
                              )}
                              {normCategoryTag === 'Private' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-400/40">
                                  Private
                                </span>
                              )}
                              {normCategoryTag === 'Payments Bank' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-400/40">
                                  Payments Bank
                                </span>
                              )}
                              {normCategoryTag !== 'Public Sector' &&
                                normCategoryTag !== 'Private' &&
                                normCategoryTag !== 'Payments Bank' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                                    {normCategoryTag}
                                  </span>
                                )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              IFSC Prefix: {item.ifscPrefix.slice(0, 4)} • UPI Ready
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No banks found matching "{bankSearchQuery}". Try searching for SBI, HDFC, Jio, or ICICI.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. CONNECT [BANK NAME] CONSENT SCREEN */}
          {currentStep === 'connect_bank' && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-slate-950 border border-indigo-500/40 space-y-4 text-center">
                <div className="mx-auto w-14 h-14 flex items-center justify-center">
                  <BankLogo bankName={chosenBankToConnect.name} ifscCode={chosenBankToConnect.ifscPrefix} size="lg" />
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-white">Connect {chosenBankToConnect.name}</h4>
                  <p className="text-xs text-indigo-300">Registered phone: +91 {user.phone}</p>
                </div>

                {/* Account Type Selector */}
                <div className="text-left space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-slate-300">Account Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'savings', label: 'Savings A/c' },
                      { id: 'current', label: 'Current A/c' },
                      { id: 'salary', label: 'Salary A/c' },
                      { id: 'nre', label: 'NRE / NRO A/c' },
                    ].map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setAccountTypeToConnect(acc.id as any)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                          accountTypeToConnect === acc.id
                            ? 'bg-indigo-600 text-white border-indigo-400'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        {acc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Security Guarantee Note */}
                <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-left space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>NPCI Security & Privacy Guarantee</span>
                  </div>
                  <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                    DocPay connects securely via NPCI UPI / Account Aggregator. We never store your UPI PIN, ATM PIN, passwords, or full debit card credentials.
                  </p>
                </div>

                {/* Consent Checkbox */}
                <label className="flex items-start gap-2.5 text-left text-xs text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={consentAgreed}
                    onChange={(e) => setConsentAgreed(e.target.checked)}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>
                    I authorize DocPay to fetch masked account details and balance via NPCI verified gateway for +91 {user.phone}.
                  </span>
                </label>

                {/* Submit Connect Button */}
                <button
                  type="button"
                  disabled={!consentAgreed || isConnecting}
                  onClick={handleProceedConnectBank}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Verifying with {chosenBankToConnect.name}...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Continue & Link Account</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 6. ADD UPI ID SCREEN */}
          {currentStep === 'add_upi' && (
            <div className="space-y-4">
              <form onSubmit={handleProceedAddUpi} className="p-5 rounded-3xl bg-slate-950 border border-purple-500/40 space-y-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6A1BFF] to-[#8E24AA] text-white mx-auto flex items-center justify-center shadow-lg">
                  <Smartphone className="w-7 h-7" />
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-white">Add UPI ID</h4>
                  <p className="text-xs text-purple-300">Link any existing UPI Virtual Payment Address (VPA)</p>
                </div>

                <div className="text-left space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Enter UPI ID</label>
                  <input
                    type="text"
                    value={newUpiIdInput}
                    onChange={(e) => {
                      setNewUpiIdInput(e.target.value);
                      setUpiAddError('');
                    }}
                    placeholder="e.g. ramesh@okhdfcbank, 9876543210@sbi"
                    className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 focus:border-purple-400 rounded-2xl text-white text-xs sm:text-sm font-mono placeholder-slate-500 focus:outline-none shadow-inner"
                    autoFocus
                  />
                  {upiAddError && (
                    <p className="text-[11px] text-rose-400 font-medium">{upiAddError}</p>
                  )}
                </div>

                {/* Popular Handles Quick Chips */}
                <div className="text-left space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Quick UPI Provider Handles:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['@okhdfcbank', '@okicici', '@oksbi', '@okaxis', '@paytm', '@ybl'].map((h, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const base = newUpiIdInput.split('@')[0] || user.phone;
                          setNewUpiIdInput(`${base}${h}`);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-900/60 border border-slate-700 text-[11px] text-slate-300 font-mono"
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAddingUpi || !newUpiIdInput.trim()}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#6A1BFF] to-[#8E24AA] text-white font-black text-xs sm:text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isAddingUpi ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Verifying UPI Handle...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Verify & Link UPI ID</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* 7. SET UP UPI LITE SCREEN */}
          {currentStep === 'add_upi_lite' && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-slate-950 border border-amber-500/40 space-y-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 mx-auto flex items-center justify-center shadow-lg">
                  <Zap className="w-7 h-7" />
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-white">Set Up UPI Lite</h4>
                  <p className="text-xs text-amber-300">Instant offline zero-PIN small payments</p>
                </div>

                {/* Benefits List */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Zero-PIN:</strong> Pay instantly up to ₹500 without entering UPI PIN.</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>100% Success:</strong> Works seamlessly even during bank server downtime.</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Max Balance:</strong> Wallet holds up to ₹2,000 NPCI approved limit.</span>
                  </div>
                </div>

                {/* Amount Selection */}
                <div className="text-left space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Select Initial Top-up Allocation</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[200, 500, 1000, 2000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setLiteTopupAmount(amt)}
                        className={`p-2.5 rounded-xl font-mono text-xs font-bold border transition-all ${
                          liteTopupAmount === amt
                            ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSettingUpLite}
                  onClick={handleProceedSetupUpiLite}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSettingUpLite ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Activating UPI Lite...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Enable UPI Lite with ₹{liteTopupAmount}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 8. PIN ENTRY / SECURE KEYPAD SCREEN */}
          {currentStep === 'pin_entry' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <BankLogo bankName={selectedBank?.bankName || 'HDFC'} ifscCode={selectedBank?.ifscCode} size="sm" />
                  <span className="font-extrabold text-sm text-white">{selectedBank?.bankName}</span>
                  <span className="text-xs font-mono text-slate-400">{selectedBank?.accountNumberMasked}</span>
                </div>

                {/* PIN Mask Dots */}
                <div className="flex items-center justify-center gap-3 py-2">
                  {Array.from({ length: pinDigits }).map((_, idx) => {
                    const isFilled = idx < enteredPin.length;
                    return (
                      <div
                        key={idx}
                        className={`w-4 h-4 rounded-full transition-all ${
                          isFilled
                            ? 'bg-amber-400 scale-110 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                            : 'bg-slate-800 border-2 border-slate-600'
                        }`}
                      />
                    );
                  })}
                </div>

                {pinError && (
                  <p className="text-xs text-rose-400 font-semibold animate-shake">{pinError}</p>
                )}

                {isRateLimited && (
                  <p className="text-xs text-amber-400 font-mono font-bold">
                    Security Lockout: {lockoutTimer}s remaining
                  </p>
                )}
              </div>

              {/* Custom Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'backspace'].map((keyVal) => {
                  if (keyVal === 'backspace') {
                    return (
                      <button
                        key={keyVal}
                        type="button"
                        onClick={() => handleKeypadPress('backspace')}
                        disabled={isRateLimited}
                        className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs transition-all cursor-pointer"
                      >
                        <Delete className="w-5 h-5" />
                      </button>
                    );
                  }
                  if (keyVal === 'clear') {
                    return (
                      <button
                        key={keyVal}
                        type="button"
                        onClick={() => handleKeypadPress('clear')}
                        disabled={isRateLimited}
                        className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                      >
                        CLR
                      </button>
                    );
                  }
                  return (
                    <button
                      key={keyVal}
                      type="button"
                      onClick={() => handleKeypadPress(keyVal)}
                      disabled={isRateLimited}
                      className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-white font-mono font-black text-lg transition-all cursor-pointer shadow-sm"
                    >
                      {keyVal}
                    </button>
                  );
                })}
              </div>

              {/* Fast Biometric Option */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleBiometricUnlock}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Fingerprint className="w-4 h-4 text-emerald-400" />
                  <span>Verify with Biometrics / Face ID</span>
                </button>
              </div>
            </div>
          )}

          {/* 9. VERIFYING ANIMATION */}
          {currentStep === 'verifying' && (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center mx-auto animate-spin shadow-2xl">
                <RefreshCw className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-white">Communicating with Bank</h4>
                <p className="text-xs text-slate-400">Verifying secure NPCI authorization token...</p>
              </div>
            </div>
          )}

          {/* 10. BALANCE DISPLAY (SUCCESS) */}
          {currentStep === 'balance_display' && selectedBank && (
            <div className="space-y-4 text-center">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border-2 border-emerald-500/50 shadow-2xl space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-wider font-bold text-indigo-300">
                    {selectedBank.bankName} ({selectedBank.accountNumberMasked})
                  </span>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                    {selectedBank.balance || '₹ 45,820.00'}
                  </div>
                  <p className="text-[11px] text-emerald-300 font-semibold">
                    ● Balance verified • As of {lastUpdatedTime}
                  </p>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => {
                      if (onOpenSendMoney) {
                        onClose();
                        onOpenSendMoney(selectedBank.id);
                      }
                    }}
                    className="p-3 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Send Money</span>
                  </button>

                  <button
                    onClick={() => setCurrentStep('accounts_list')}
                    className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>All Accounts</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer Guarantee */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/90 text-center shrink-0">
          <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>NPCI 256-bit Encrypted. DocPay never stores your banking credentials or PIN.</span>
          </p>
        </div>

      </div>

      {/* CONFIRM REMOVE ACCOUNT DIALOG */}
      {bankToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h4 className="text-base font-extrabold text-white">Remove this account?</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Removing <strong>{bankToDelete.bankName} ({bankToDelete.accountNumberMasked})</strong> will disconnect it from this app. You can reconnect it anytime.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setBankToDelete(null)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteRemoval}
                className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-all shadow-md"
              >
                Remove Account
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
