import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  Lock,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Key,
  Sparkles,
  Phone,
  Camera,
  X,
  QrCode,
  ArrowRightLeft,
  Search,
  Check,
  CreditCard,
  Send,
  RefreshCw,
  Fingerprint,
  MapPin,
  UserCheck
} from 'lucide-react';
import { BankAccount, UserProfile } from '../types';
import { FaceAuthSimulator } from './FaceAuthSimulator';
import { BankScannerModal } from './BankScannerModal';
import { ALL_INDIAN_BANKS, getBranchFromIfsc, fetchAccountsByAadhaarOrMobile } from '../data/indianBanks';
import { BankLogo } from './BankLogo';

interface Props {
  banks: BankAccount[];
  user: UserProfile;
  onUpdateBanks: (banks: BankAccount[]) => void;
  onInitiateRemoveBank: (bank: BankAccount) => void;
  onOpenBankingOps?: (tab: 'balance' | 'send' | 'receive' | 'self_transfer') => void;
  onLogActivity: (
    title: string,
    description: string,
    type: 'auth' | 'security' | 'document' | 'bank' | 'portal'
  ) => void;
  isPrivacyMode?: boolean;
  onTriggerNotification?: (params: {
    title: string;
    message: string;
    type: 'otp' | 'security' | 'verification' | 'alert' | 'bank' | 'document';
    status?: 'success' | 'pending' | 'failed' | 'warning' | 'info';
    category?: 'otp' | 'document' | 'bank' | 'security' | 'system';
    actionLabel?: string;
    actionTab?: string;
  }) => void;
}

export const BankModule: React.FC<Props> = ({
  banks,
  user,
  onUpdateBanks,
  onInitiateRemoveBank,
  onOpenBankingOps,
  onLogActivity,
  isPrivacyMode = false,
  onTriggerNotification,
}) => {
  const [showLinkWizard, setShowLinkWizard] = useState(false);
  const [linkMode, setLinkMode] = useState<'manual' | 'aadhaar_npci'>('aadhaar_npci');
  const [wizardStep, setWizardStep] = useState<
    'method_select' | 'bank_select' | 'mobile_otp' | 'face_scan' | 'pin' | 'complete'
  >('bank_select');

  // Bank Scanner Modal state
  const [showBankScanner, setShowBankScanner] = useState(false);
  const [selectedScannerBankId, setSelectedScannerBankId] = useState<string | undefined>(
    undefined
  );

  React.useEffect(() => {
    const handleOpenWizard = () => {
      setShowLinkWizard(true);
      setWizardStep('bank_select');
    };
    window.addEventListener('open_link_bank_wizard', handleOpenWizard);
    return () => window.removeEventListener('open_link_bank_wizard', handleOpenWizard);
  }, []);

  // Link bank wizard form state
  const [bankSearchQuery, setBankSearchQuery] = useState('');
  const [selectedBankObj, setSelectedBankObj] = useState(ALL_INDIAN_BANKS[0]);
  const [accountHolderName, setAccountHolderName] = useState(user.name);
  const [accountType, setAccountType] = useState<'savings' | 'current' | 'salary' | 'nre'>('savings');
  const [accountNumber, setAccountNumber] = useState('5010029810');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('5010029810');
  const [ifsc, setIfsc] = useState(ALL_INDIAN_BANKS[0].defaultIfsc);
  const [autoBranchName, setAutoBranchName] = useState(ALL_INDIAN_BANKS[0].defaultBranch);
  const [mobileOtpInput, setMobileOtpInput] = useState('');
  const [generatedOtp] = useState('772109');
  const [pinInput, setPinInput] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // Aadhaar NPCI Auto-Fetch State
  const [aadhaarInput, setAadhaarInput] = useState('5482 9102 3841');
  const [isFetchingAadhaarBanks, setIsFetchingAadhaarBanks] = useState(false);
  const [discoveredAadhaarBanks, setDiscoveredAadhaarBanks] = useState<BankAccount[] | null>(null);

  // Filtered Indian Banks
  const filteredIndianBanks = ALL_INDIAN_BANKS.filter((b) =>
    b.name.toLowerCase().includes(bankSearchQuery.toLowerCase()) ||
    b.category.toLowerCase().includes(bankSearchQuery.toLowerCase()) ||
    b.code.toLowerCase().includes(bankSearchQuery.toLowerCase())
  );

  // Update IFSC and Auto Branch
  const handleSelectBank = (bank: typeof ALL_INDIAN_BANKS[0]) => {
    setSelectedBankObj(bank);
    setIfsc(bank.defaultIfsc);
    setAutoBranchName(bank.defaultBranch);
  };

  const handleIfscChange = (code: string) => {
    const uppercaseCode = code.toUpperCase();
    setIfsc(uppercaseCode);
    const resolved = getBranchFromIfsc(uppercaseCode);
    setAutoBranchName(resolved.branchName);
  };

  const handleStartLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountNumber !== confirmAccountNumber) {
      alert('Account Numbers do not match! Please verify your inputs.');
      return;
    }
    setWizardStep('mobile_otp');
    if (onTriggerNotification) {
      onTriggerNotification({
        title: 'Bank Account Linking Pending',
        message: `Verification initiated with ${selectedBankObj.name} for account ending in ${accountNumber.slice(-4) || '8910'}. Waiting for NPCI mandate verification.`,
        type: 'bank',
        status: 'pending',
        actionLabel: 'Check Status',
        actionTab: 'banks',
      });
    }
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setWizardStep('face_scan');
  };

  const handleFaceSuccess = () => {
    setWizardStep('pin');
  };

  const handleSetPrimaryBank = (bankId: string) => {
    const updated = banks.map((b) => ({
      ...b,
      isPrimary: b.id === bankId,
    }));
    onUpdateBanks(updated);
    const target = banks.find((b) => b.id === bankId);
    if (target) {
      onLogActivity(
        'Primary Bank Changed',
        `Set ${target.bankName} as primary receiving bank account`,
        'bank'
      );
    }
  };

  // Fetch Aadhaar NPCI Bank Accounts
  const handleFetchAadhaarBanks = () => {
    setIsFetchingAadhaarBanks(true);
    setTimeout(() => {
      const results = fetchAccountsByAadhaarOrMobile(aadhaarInput || user.phone, user.name);
      setDiscoveredAadhaarBanks(results);
      setIsFetchingAadhaarBanks(false);
    }, 1000);
  };

  // Link a pre-discovered Aadhaar Bank
  const handleLinkDiscoveredBank = (discovered: BankAccount) => {
    // Check if already linked
    if (banks.some((b) => b.bankName === discovered.bankName || b.ifscCode === discovered.ifscCode)) {
      alert(`${discovered.bankName} is already linked to your profile!`);
      return;
    }

    onUpdateBanks([...banks, discovered]);
    onLogActivity(
      'NPCI Aadhaar Bank Linked',
      `Auto-linked ${discovered.bankName} (${discovered.accountNumberMasked}) via NPCI DBT Mapper`,
      'bank'
    );
    if (onTriggerNotification) {
      onTriggerNotification({
        title: 'Bank Account Linked Successfully',
        message: `${discovered.bankName} (${discovered.accountNumberMasked}) auto-linked via NPCI Aadhaar DBT Mapper.`,
        type: 'bank',
        status: 'success',
        actionLabel: 'Manage Banks',
        actionTab: 'banks',
      });
    }
    alert(`Successfully linked ${discovered.bankName}!`);
  };

  const handleCompleteLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput !== user.pin && pinInput !== '1907' && pinInput !== '1234') {
      if (onTriggerNotification) {
        onTriggerNotification({
          title: 'Bank Account Linking Failed',
          message: `Verification failed for ${selectedBankObj.name}: Authorization security PIN rejected.`,
          type: 'bank',
          status: 'failed',
          actionLabel: 'Retry Link',
          actionTab: 'banks',
        });
      }
      alert('Incorrect PIN. Please use your 4-digit security PIN');
      return;
    }

    const code = `VER-${selectedBankObj.name
      .substring(0, 4)
      .toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setVerificationCode(code);

    const last4 = accountNumber.slice(-4) || '8910';
    const newBank: BankAccount = {
      id: `bank-${Date.now()}`,
      bankName: selectedBankObj.name,
      accountType: accountType,
      accountNumberMasked: `•••• •••• ${last4}`,
      fullAccountNumber: accountNumber,
      ifscCode: ifsc,
      branchName: autoBranchName,
      upiId: `${user.name.toLowerCase().replace(/\s+/g, '')}@${selectedBankObj.code.toLowerCase()}`,
      balance: '₹25,000.00',
      rawBalanceNumber: 25000,
      isPrimary: banks.length === 0,
      verificationStatus: 'verified',
      verificationCode: code,
      linkedDate: new Date().toISOString().split('T')[0],
      riskLevel: 'low',
      verificationNoticeSent: true,
    };

    onUpdateBanks([...banks, newBank]);
    onLogActivity(
      'Bank Account Linked',
      `Linked ${selectedBankObj.name} (${autoBranchName}) with code ${code}`,
      'bank'
    );
    if (onTriggerNotification) {
      onTriggerNotification({
        title: 'Bank Account Linked Successfully',
        message: `${selectedBankObj.name} (•••• ${last4}) has been verified and linked for instant UPI transfers and DBT benefits.`,
        type: 'bank',
        status: 'success',
        actionLabel: 'Manage Banks',
        actionTab: 'banks',
      });
    }
    setWizardStep('complete');
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">
              Indian Bank Accounts & NPCI Mapper Hub
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Link any Indian bank account manually or auto-fetch all registered accounts using your Aadhaar NPCI mapper or mobile number.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenBankingOps && (
            <button
              onClick={() => onOpenBankingOps('balance')}
              className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all"
            >
              <CreditCard className="w-4 h-4 text-indigo-600" /> Check Balance & Transfers
            </button>
          )}

          <button
            id="open-bank-scanner-modal-btn"
            onClick={() => {
              setSelectedScannerBankId(undefined);
              setShowBankScanner(true);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <QrCode className="w-4 h-4" /> Bank QR & Scanner
          </button>

          <button
            id="link-new-bank-btn"
            onClick={() => {
              setShowLinkWizard(true);
              setWizardStep('bank_select');
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" /> Link Indian Bank Account
          </button>
        </div>
      </div>

      {/* Linked Banks List with Framer Motion Stagger Children */}
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.05,
            },
          },
        }}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {banks.map((bank) => (
          <motion.div
            key={bank.id}
            variants={{
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
            }}
            className={`bg-white border rounded-3xl p-6 relative flex flex-col justify-between transition-all shadow-sm ${
              bank.isPrimary
                ? 'border-indigo-300 ring-2 ring-indigo-500/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              {/* Top Bank Info */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <BankLogo bankName={bank.bankName} ifscCode={bank.ifscCode} size="lg" showBadgeText />
                  <div>
                    <h3 className="font-bold text-base text-slate-800">{bank.bankName}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-500 uppercase font-mono">
                        {bank.accountType} Account
                      </span>
                      {bank.isPrimary ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white shadow-xs">
                          Primary Bank
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetPrimaryBank(bank.id)}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all"
                        >
                          Set as Primary
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>

              {/* Account details box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 font-mono text-xs mb-4">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Account Number</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {bank.accountNumberMasked}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>IFSC Code</span>
                  <span className="text-indigo-700 font-semibold">{bank.ifscCode}</span>
                </div>
                {bank.branchName && (
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Branch Name</span>
                    <span className="text-slate-800 font-semibold line-clamp-1">{bank.branchName}</span>
                  </div>
                )}
                {bank.upiId && (
                  <div className="flex justify-between items-center text-slate-500">
                    <span>UPI ID</span>
                    <span className="text-slate-800 font-semibold">{bank.upiId}</span>
                  </div>
                )}
                {bank.balance && (
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Available Balance</span>
                    <span className={`text-emerald-700 font-bold text-sm transition-all duration-300 ${isPrivacyMode ? 'filter blur-sm select-none opacity-80 hover:blur-none hover:opacity-100 cursor-pointer' : ''}`}>
                      {bank.balance}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-slate-500 pt-1 border-t border-slate-200">
                  <span>Verification Token</span>
                  <span className="text-emerald-700 font-mono text-[11px]">
                    {bank.verificationCode}
                  </span>
                </div>
              </div>

              {/* Quick Operations Button */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => {
                    setSelectedScannerBankId(bank.id);
                    setShowBankScanner(true);
                  }}
                  className="py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <QrCode className="w-3.5 h-3.5 text-indigo-600" /> Passbook QR
                </button>

                {onOpenBankingOps && (
                  <button
                    onClick={() => onOpenBankingOps('balance')}
                    className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Check Balance
                  </button>
                )}
              </div>

              {/* Notice Banner */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong className="font-semibold text-amber-900">24-Hour Verification Active:</strong> Bank NPCI servers verify status seamlessly.
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-500">Linked on {bank.linkedDate}</span>

              <button
                id={`remove-bank-${bank.id}`}
                onClick={() => onInitiateRemoveBank(bank)}
                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Unlink Account
              </button>
            </div>
          </motion.div>
        ))}

        {/* Add New Bank Account Card */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 24, scale: 0.98 },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { type: 'spring', stiffness: 260, damping: 20 },
            },
          }}
          onClick={() => {
            setShowLinkWizard(true);
            setWizardStep('bank_select');
          }}
          className="bg-purple-50/40 hover:bg-purple-50 border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-xs min-h-[280px] group"
        >
          <div className="w-16 h-16 rounded-2xl bg-purple-100 group-hover:bg-[#6A1BFF] text-[#6A1BFF] group-hover:text-white flex items-center justify-center transition-all mb-3 shadow-md">
            <Plus className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900 group-hover:text-[#6A1BFF] transition-colors">
            Add New Bank Account
          </h3>
          <p className="text-xs text-slate-500 font-medium max-w-xs mt-1">
            Link any Indian Bank (SBI, HDFC, ICICI, Axis, Bank of Baroda) via Aadhaar NPCI or Mobile OTP.
          </p>
          <span className="mt-4 px-4 py-2 rounded-xl bg-[#6A1BFF] text-white font-black text-xs shadow-md group-hover:bg-purple-800 transition-colors flex items-center gap-1.5">
            <Building2 className="w-4 h-4" /> Link Account Now
          </span>
        </motion.div>
      </motion.div>

      {/* Bank Scanner Modal */}
      {showBankScanner && (
        <BankScannerModal
          banks={banks}
          selectedBankId={selectedScannerBankId}
          user={user}
          onUpdateBanks={onUpdateBanks}
          onClose={() => setShowBankScanner(false)}
          onLogActivity={onLogActivity}
        />
      )}

      {/* Link Bank Multi-Step Wizard Modal */}
      {showLinkWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto relative text-slate-800 shadow-2xl">
            <button
              onClick={() => setShowLinkWizard(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Step 1: Link Method Switcher & Form */}
            {wizardStep === 'bank_select' && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">Link Indian Bank Account</h3>
                  <p className="text-xs text-slate-500">
                    Connect via Aadhaar NPCI Auto-Fetch or manual bank account details
                  </p>
                </div>

                {/* Link Mode Selector */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                  <button
                    onClick={() => setLinkMode('aadhaar_npci')}
                    className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                      linkMode === 'aadhaar_npci'
                        ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Fingerprint className="w-4 h-4 text-emerald-600" /> Aadhaar NPCI Fetch
                  </button>

                  <button
                    onClick={() => setLinkMode('manual')}
                    className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                      linkMode === 'manual'
                        ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-indigo-600" /> Manual Bank Details
                  </button>
                </div>

                {/* AADHAAR NPCI AUTO-FETCH MODE */}
                {linkMode === 'aadhaar_npci' ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-emerald-900">
                        <UserCheck className="w-4 h-4 text-emerald-600" /> NPCI Direct Benefit & Bank Mapper
                      </div>
                      <p className="text-emerald-800">
                        Fetch all bank accounts linked with your Aadhaar number or mobile phone (<strong>{user.phone}</strong>) registered in the National Payments Vault.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        12-Digit Aadhaar / Mobile Number
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={aadhaarInput}
                          onChange={(e) => setAadhaarInput(e.target.value)}
                          placeholder="5482 9102 3841"
                          className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={handleFetchAadhaarBanks}
                          disabled={isFetchingAadhaarBanks}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
                        >
                          {isFetchingAadhaarBanks ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Search className="w-4 h-4" />
                          )}
                          Fetch NPCI Accounts
                        </button>
                      </div>
                    </div>

                    {/* Discovered Accounts List */}
                    {discoveredAadhaarBanks && (
                      <div className="space-y-3 pt-2">
                        <span className="text-xs font-bold text-slate-700 block">
                          Found {discoveredAadhaarBanks.length} Linked Bank Accounts in NPCI Vault:
                        </span>

                        {discoveredAadhaarBanks.map((acc) => {
                          const isAlreadyAdded = banks.some((b) => b.bankName === acc.bankName);
                          return (
                            <div
                              key={acc.id}
                              className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs gap-3"
                            >
                              <div className="flex items-center gap-3">
                                <BankLogo bankName={acc.bankName} ifscCode={acc.ifscCode} size="md" />
                                <div>
                                  <div className="font-bold text-slate-800">{acc.bankName}</div>
                                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                    {acc.accountNumberMasked} • {acc.ifscCode}
                                  </div>
                                  <div className="text-[10px] text-indigo-700 font-medium">
                                    {acc.branchName}
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleLinkDiscoveredBank(acc)}
                                disabled={isAlreadyAdded}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                                  isAlreadyAdded
                                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                                }`}
                              >
                                {isAlreadyAdded ? 'Already Linked' : '+ Link Account'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* MANUAL BANK DETAILS FORM */
                  <form onSubmit={handleStartLink} className="space-y-4">
                    {/* Bank Selection Search */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Search & Select Indian Bank
                      </label>
                      <div className="relative mb-2">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={bankSearchQuery}
                          onChange={(e) => setBankSearchQuery(e.target.value)}
                          placeholder="Search SBI, HDFC, ICICI, PNB, IPPB..."
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800"
                        />
                      </div>

                      {/* Bank Select Dropdown with Left Logo */}
                      <div className="flex items-center gap-3">
                        <BankLogo bankName={selectedBankObj.name} ifscCode={selectedBankObj.defaultIfsc} size="md" showBadgeText />
                        <select
                          value={selectedBankObj.id}
                          onChange={(e) => {
                            const b = ALL_INDIAN_BANKS.find((x) => x.id === e.target.value);
                            if (b) handleSelectBank(b);
                          }}
                          className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                        >
                          {filteredIndianBanks.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name} ({b.category}) - Code: {b.code}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Account Holder Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Account Holder Name (as per Bank Passbook)
                      </label>
                      <input
                        type="text"
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                        placeholder="Rajesh Kumar"
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium"
                      />
                    </div>

                    {/* Account Number & Confirm */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Account Number
                        </label>
                        <input
                          type="text"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder="5010029810"
                          required
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Confirm Account Number
                        </label>
                        <input
                          type="text"
                          value={confirmAccountNumber}
                          onChange={(e) => setConfirmAccountNumber(e.target.value)}
                          placeholder="5010029810"
                          required
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Account Type & IFSC */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Account Type
                        </label>
                        <select
                          value={accountType}
                          onChange={(e: any) => setAccountType(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                        >
                          <option value="savings">Savings Account</option>
                          <option value="current">Current Account</option>
                          <option value="salary">Salary Account</option>
                          <option value="nre">NRE / NRO Account</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          IFSC Code
                        </label>
                        <input
                          type="text"
                          value={ifsc}
                          onChange={(e) => handleIfscChange(e.target.value)}
                          placeholder="HDFC0001234"
                          required
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 uppercase"
                        />
                      </div>
                    </div>

                    {/* Auto-resolved Branch Name box */}
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs space-y-1">
                      <span className="text-indigo-800 font-semibold block flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Auto-Resolved Branch Details:
                      </span>
                      <span className="text-slate-800 font-bold block">{autoBranchName}</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-sm"
                    >
                      Proceed to Mobile OTP Verification
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Step 2: Mobile OTP */}
            {wizardStep === 'mobile_otp' && (
              <form onSubmit={handleOtpVerify} className="space-y-4">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <Phone className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">Mobile Bank OTP</h3>
                  <p className="text-xs text-slate-500">Step 2 of 4 • Mobile Number Match</p>
                </div>

                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs space-y-1">
                  <span className="text-indigo-800 font-semibold block">
                    💬 BANK OTP SENT TO {user.phone}
                  </span>
                  <span className="font-mono text-indigo-900 font-bold text-sm">
                    Use Code: {generatedOtp}
                  </span>
                </div>

                <input
                  type="text"
                  maxLength={6}
                  value={mobileOtpInput}
                  onChange={(e) => setMobileOtpInput(e.target.value)}
                  placeholder={generatedOtp}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 text-center font-mono text-xl text-indigo-900"
                />

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-sm"
                >
                  Verify OTP & Open Face Biometrics
                </button>
              </form>
            )}

            {/* Step 3: Facial Recognition */}
            {wizardStep === 'face_scan' && (
              <div>
                <p className="text-xs text-center text-slate-500 mb-2">
                  Step 3 of 4 • Facial Biometric Scan
                </p>
                <FaceAuthSimulator
                  onSuccess={handleFaceSuccess}
                  title="Bank Authorizer Face Match"
                  subtitle="Verifying live camera feed with Bank NPCI Vault"
                />
              </div>
            )}

            {/* Step 4: PIN Security */}
            {wizardStep === 'pin' && (
              <form onSubmit={handleCompleteLink} className="space-y-4">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">Enter 4-Digit Security PIN</h3>
                  <p className="text-xs text-slate-500">Step 4 of 4 • Final Authorization</p>
                </div>

                <input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="••••"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 text-center text-2xl font-mono text-emerald-800"
                />

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-sm"
                >
                  Authorize & Generate Verification Code
                </button>
              </form>
            )}

            {/* Complete Screen */}
            {wizardStep === 'complete' && (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 className="w-8 h-8 animate-bounce" />
                </div>
                <h3 className="font-bold text-lg text-slate-800">Bank Account Linked Successfully!</h3>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 font-mono">
                  <span className="text-slate-500 block">Generated Verification Code</span>
                  <span className="text-emerald-700 font-bold text-base">{verificationCode}</span>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                  ⚠️ <strong className="font-semibold">Notice:</strong> Bank NPCI server active.
                </div>

                <button
                  onClick={() => setShowLinkWizard(false)}
                  className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-xs"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
