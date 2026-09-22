import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard,
  Building2,
  Wallet,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Lock,
  RefreshCw,
  X,
  FileText,
  Download,
  Share2,
  Sparkles,
  Fingerprint,
  Phone,
  UserCheck,
} from 'lucide-react';
import {
  BankAccount,
  PaymentCard,
  UpiProfile,
  WalletData,
  PaymentMethodOption,
  UserProfile,
} from '../../types';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { AddCardModal } from './AddCardModal';
import { lookupBankRegisteredName } from '../../utils/bankLookup';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  banks: BankAccount[];
  cards: PaymentCard[];
  upiProfile: UpiProfile;
  wallet: WalletData;
  user?: UserProfile;
  initialPayee?: { name: string; phoneOrUpi: string; bankName?: string };
  onUpdateWallet: React.Dispatch<React.SetStateAction<WalletData>>;
  onUpdateCards: React.Dispatch<React.SetStateAction<PaymentCard[]>>;
  onOpenAddBank: () => void;
  onLogActivity?: (title: string, desc: string, type: 'bank' | 'auth' | 'security' | 'document' | 'portal') => void;
  onTriggerNotification?: (notif: any) => void;
}

type PaymentStep =
  | 'select_method'
  | 'enter_amount'
  | 'review'
  | 'authenticate'
  | 'processing'
  | 'result';

export const PaymentFlowModal: React.FC<Props> = ({
  isOpen,
  onClose,
  banks,
  cards,
  upiProfile,
  wallet,
  user,
  initialPayee,
  onUpdateWallet,
  onUpdateCards,
  onOpenAddBank,
  onLogActivity,
  onTriggerNotification,
}) => {
  const [currentStep, setCurrentStep] = useState<PaymentStep>(initialPayee ? 'enter_amount' : 'select_method');
  const [selectedMethodId, setSelectedMethodId] = useState<string>(
    banks.find((b) => b.isPrimary) ? `bank-${banks.find((b) => b.isPrimary)!.id}` : 'upi-primary'
  );
  const [selectedMethodObj, setSelectedMethodObj] = useState<PaymentMethodOption | null>(null);

  // Form State
  const [payeeName, setPayeeName] = useState<string>(initialPayee?.name || 'Ramesh General Store');
  const [payeeUpiId, setPayeeUpiId] = useState<string>(initialPayee?.phoneOrUpi || 'rameshstore@upi');
  const [payeeBankName, setPayeeBankName] = useState<string>(initialPayee?.bankName || 'UPI Central Switch');
  const [isPayeeResolvedFromBank, setIsPayeeResolvedFromBank] = useState<boolean>(true);
  const [amount, setAmount] = useState<string>('500');
  const [note, setNote] = useState<string>('Groceries and supplies');

  // Sync initial payee when changed or opened
  useEffect(() => {
    if (initialPayee) {
      setPayeeName(initialPayee.name);
      setPayeeUpiId(initialPayee.phoneOrUpi);
      if (initialPayee.bankName) setPayeeBankName(initialPayee.bankName);
      setIsPayeeResolvedFromBank(true);
      setCurrentStep('enter_amount');
    }
  }, [initialPayee, isOpen]);

  // Handle phone or UPI typing in enter_amount step
  const handlePayeeInputChange = (val: string) => {
    setPayeeUpiId(val);
    const lookup = lookupBankRegisteredName(val);
    if (lookup) {
      setPayeeName(lookup.bankRegisteredName);
      setPayeeBankName(lookup.bankName);
      setIsPayeeResolvedFromBank(true);
    } else {
      setIsPayeeResolvedFromBank(false);
    }
  };

  // PIN / Auth State
  const [pin, setPin] = useState<string>('');
  const [processingStatus, setProcessingStatus] = useState<string>('Connecting to NPCI gateway...');
  const [isSuccess, setIsSuccess] = useState<boolean>(true);
  const [utrNumber, setUtrNumber] = useState<string>('');

  // Add Card Submodal
  const [showAddCardModal, setShowAddCardModal] = useState<boolean>(false);

  if (!isOpen) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const primaryBank = banks.find((b) => b.isPrimary) || banks[0];

  // Resolve active payment method
  const getActiveMethodInfo = (): { title: string; subtitle: string; masked: string; type: string } => {
    if (selectedMethodObj) {
      return {
        title: selectedMethodObj.title,
        subtitle: selectedMethodObj.subtitle,
        masked: selectedMethodObj.maskedInfo,
        type: selectedMethodObj.type,
      };
    }
    if (selectedMethodId === 'wallet-docpay') {
      return {
        title: 'DocPay Wallet',
        subtitle: '1-Tap Fast Checkout',
        masked: formatCurrency(wallet.balance),
        type: 'wallet',
      };
    }
    if (selectedMethodId === 'upi-primary') {
      return {
        title: 'UPI / VPA',
        subtitle: 'Direct bank settlement',
        masked: upiProfile.primaryVpa,
        type: 'upi',
      };
    }
    const foundBank = banks.find((b) => `bank-${b.id}` === selectedMethodId);
    if (foundBank) {
      return {
        title: foundBank.bankName,
        subtitle: `${foundBank.accountType} account`,
        masked: foundBank.accountNumberMasked,
        type: foundBank.isPrimary ? 'primary_bank' : 'linked_bank',
      };
    }
    const foundCard = cards.find((c) => `card-${c.id}` === selectedMethodId);
    if (foundCard) {
      return {
        title: `Saved ${foundCard.cardNetwork} card`,
        subtitle: `${foundCard.cardCategory.toUpperCase()}`,
        masked: foundCard.cardNumberMasked,
        type: 'card',
      };
    }
    return {
      title: primaryBank ? primaryBank.bankName : 'Primary Bank',
      subtitle: 'Default payment account',
      masked: primaryBank ? primaryBank.accountNumberMasked : '•••• 4521',
      type: 'primary_bank',
    };
  };

  const activeMethod = getActiveMethodInfo();

  // Keypad actions
  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        setTimeout(() => {
          startProcessing();
        }, 300);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const startProcessing = () => {
    setCurrentStep('processing');
    setProcessingStatus('Connecting to NPCI switch...');

    setTimeout(() => {
      setProcessingStatus('Validating 256-bit encryption...');
    }, 900);

    setTimeout(() => {
      setProcessingStatus('Securing bank authorization...');
    }, 1800);

    setTimeout(() => {
      const generatedUtr = `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}`;
      setUtrNumber(generatedUtr);
      setIsSuccess(true);
      setCurrentStep('result');

      const numAmount = parseFloat(amount) || 500;

      // If wallet was used, deduct from wallet
      if (selectedMethodId === 'wallet-docpay') {
        onUpdateWallet((prev) => ({
          ...prev,
          balance: Math.max(0, prev.balance - numAmount),
          history: [
            {
              id: `wtx-${Date.now()}`,
              type: 'debit',
              amount: numAmount,
              title: `Paid to ${payeeName}`,
              description: `${note || 'Direct payment'} • UTR ${generatedUtr}`,
              timestamp: 'Just now',
              status: 'success',
              refId: generatedUtr,
            },
            ...prev.history,
          ],
        }));
      }

      if (onLogActivity) {
        onLogActivity(
          'Payment Completed',
          `Sent ${formatCurrency(numAmount)} to ${payeeName} (${payeeUpiId}) using ${activeMethod.title} • UTR: ${generatedUtr}`,
          'bank'
        );
      }

      if (onTriggerNotification) {
        onTriggerNotification({
          title: 'Payment Successful',
          message: `${formatCurrency(numAmount)} paid to ${payeeName}. Ref: ${generatedUtr}`,
          type: 'bank',
          status: 'success',
        });
      }
    }, 2800);
  };

  const handleResetFlow = () => {
    setCurrentStep('select_method');
    setPin('');
    setAmount('500');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl relative max-h-[92vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          title="Close Flow"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Indicator Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
            <span className="text-blue-600 font-extrabold uppercase tracking-wider">
              NPCI Fast Checkout
            </span>
            <span>
              Step {currentStep === 'select_method' ? '1' : currentStep === 'enter_amount' ? '2' : currentStep === 'review' ? '3' : currentStep === 'authenticate' ? '4' : currentStep === 'processing' ? '5' : '6'} of 6
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
              style={{
                width:
                  currentStep === 'select_method'
                    ? '16%'
                    : currentStep === 'enter_amount'
                    ? '33%'
                    : currentStep === 'review'
                    ? '50%'
                    : currentStep === 'authenticate'
                    ? '66%'
                    : currentStep === 'processing'
                    ? '83%'
                    : '100%',
              }}
            />
          </div>
        </div>

        {/* ============================================================ */}
        {/* STEP 1: SELECT PAYMENT METHOD */}
        {/* ============================================================ */}
        {currentStep === 'select_method' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-black text-slate-900">Select Payment Method</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose your source bank account, UPI ID, DocPay Wallet, or tokenized card.
              </p>
            </div>

            <PaymentMethodSelector
              banks={banks}
              cards={cards}
              upiProfile={upiProfile}
              wallet={wallet}
              selectedMethodId={selectedMethodId}
              onSelectMethod={(opt) => {
                setSelectedMethodId(opt.id);
                setSelectedMethodObj(opt);
              }}
              onOpenAddBank={() => {
                onClose();
                onOpenAddBank();
              }}
              onOpenAddCard={() => setShowAddCardModal(true)}
            />

            <button
              type="button"
              onClick={() => setCurrentStep('enter_amount')}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Continue to Enter Amount</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: ENTER AMOUNT */}
        {/* ============================================================ */}
        {currentStep === 'enter_amount' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-black text-slate-900">Enter Payment Amount</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Paying via <strong className="text-blue-700">{activeMethod.title}</strong> ({activeMethod.masked})
              </p>
            </div>

            {/* Recipient Input with Bank-Registered Name Lookup */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">
                  Recipient Phone Number or UPI ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={payeeUpiId}
                    onChange={(e) => handlePayeeInputChange(e.target.value)}
                    placeholder="Type 10-digit mobile (e.g. 9390240130) or UPI ID"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Resolved Bank-Registered Name Card */}
              <div className="p-3 bg-white rounded-xl border border-blue-100 shadow-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">
                      Name as per Bank Records
                    </span>
                    <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-black flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      NPCI Verified
                    </span>
                  </div>
                  <h4 className="font-black text-sm text-slate-900 mt-0.5">{payeeName}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {payeeBankName} • {payeeUpiId}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-black text-xs flex items-center justify-center border border-blue-200">
                  {payeeName.slice(0, 2).toUpperCase()}
                </div>
              </div>

              {/* Sender Details Notice */}
              <div className="px-3 py-2 bg-slate-100/80 rounded-xl border border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Sender's Bank-Registered Info:</span>
                <span className="font-bold text-slate-800">
                  {user?.name || 'DUDEKULA DASTHAGIRI'} • +91 9390240130
                </span>
              </div>
            </div>

            {/* Amount input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="500"
                  min="1"
                  max="100000"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-2xl font-mono font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Quick Preset Chips */}
              <div className="flex items-center gap-2 mt-2">
                {[100, 500, 1000, 2000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(String(preset))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      amount === String(preset)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Note input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Add a Note / Purpose
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Groceries & essentials"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep('select_method')}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!amount || parseFloat(amount) <= 0}
                onClick={() => setCurrentStep('review')}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Review Payment Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: REVIEW PAYMENT */}
        {/* ============================================================ */}
        {currentStep === 'review' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-black text-slate-900">Review Payment</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Please verify all payment details before authorizing bank transfer.
              </p>
            </div>

            {/* Breakdown Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3.5 text-xs">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-slate-500">Payee (as per Bank)</span>
                <div className="text-right">
                  <span className="font-extrabold text-slate-900 block flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                    {payeeName}
                  </span>
                  <span className="font-mono text-[11px] text-blue-700">{payeeUpiId}</span>
                  <span className="text-[10px] text-slate-400 block">{payeeBankName}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-slate-500">Sender's Bank Account</span>
                <div className="text-right">
                  <span className="font-extrabold text-slate-900 block">{activeMethod.title}</span>
                  <span className="font-mono text-[11px] text-slate-500">{activeMethod.masked}</span>
                  <span className="text-[10px] text-slate-400 block">
                    Linked to +91 9390240130 ({user?.name || 'DUDEKULA DASTHAGIRI'})
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Convenience / Platform Fee</span>
                <span className="font-bold text-emerald-600">₹0.00 (FREE)</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Purpose Note</span>
                <span className="font-medium text-slate-700">{note || 'Direct payment'}</span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-sm">
                <span className="font-black text-slate-800">Total Payable</span>
                <span className="font-mono font-black text-xl text-blue-700">
                  {formatCurrency(parseFloat(amount) || 0)}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-[11px] text-blue-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>NPCI 256-bit secure tunnel • Instant settlement guarantee</span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep('enter_amount')}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep('authenticate')}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Lock className="w-4 h-4" />
                <span>Authorize & Pay {formatCurrency(parseFloat(amount) || 0)}</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 4: AUTHENTICATION / PIN KEYPAD */}
        {/* ============================================================ */}
        {currentStep === 'authenticate' && (
          <div className="space-y-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">Enter UPI PIN</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Debiting {formatCurrency(parseFloat(amount) || 0)} from {activeMethod.title}
              </p>
            </div>

            {/* PIN Dots */}
            <div className="flex justify-center items-center gap-3.5 my-4">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    pin.length > idx
                      ? 'bg-blue-600 scale-110 shadow-sm shadow-blue-500/50'
                      : 'border-2 border-slate-300 bg-slate-100'
                  }`}
                />
              ))}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeyPress(digit)}
                  className="h-12 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-800 hover:text-blue-700 font-black text-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-xs"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={startProcessing}
                className="h-12 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-emerald-600 font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-xs"
                title="Use Biometrics"
              >
                <Fingerprint className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                className="h-12 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-800 hover:text-blue-700 font-black text-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-xs"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="h-12 rounded-2xl bg-slate-50 hover:bg-rose-50 border border-slate-200 text-slate-600 hover:text-rose-600 font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-xs"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 5: PROCESSING */}
        {/* ============================================================ */}
        {currentStep === 'processing' && (
          <div className="py-12 text-center space-y-5">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
              <div className="absolute inset-3 rounded-full bg-blue-50 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">Processing Payment...</h3>
              <p className="text-xs font-mono font-bold text-blue-600 mt-1 animate-pulse">
                {processingStatus}
              </p>
            </div>

            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Please do not press back or close this window while NPCI settles the transaction.
            </p>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 6: SUCCESS OR FAILURE SCREEN */}
        {/* ============================================================ */}
        {currentStep === 'result' && isSuccess && (
          <div className="space-y-6 text-center">
            {/* Success Icon Badge */}
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900">Payment Successful!</h3>
              <p className="text-3xl font-mono font-black text-emerald-600 mt-1">
                {formatCurrency(parseFloat(amount) || 500)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Paid to <strong className="text-slate-800">{payeeName}</strong> ({payeeUpiId})
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2 text-left font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">UTR Reference No:</span>
                <span className="font-bold text-slate-900">{utrNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Debited From:</span>
                <span className="font-bold text-blue-700">{activeMethod.title} ({activeMethod.masked})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-bold text-slate-900">{new Date().toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-emerald-600">COMPLETED ✓</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetFlow}
                className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Pay Again
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Add Card Submodal */}
        <AddCardModal
          isOpen={showAddCardModal}
          onClose={() => setShowAddCardModal(false)}
          onAddCard={(newCard) => {
            onUpdateCards((prev) => [newCard, ...prev]);
            setSelectedMethodId(`card-${newCard.id}`);
          }}
        />
      </motion.div>
    </div>
  );
};
