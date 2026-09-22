import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  Star,
  Trash2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  QrCode,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertTriangle,
  Plus,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { BankAccount, UserProfile } from '../../types';
import { BankLogo } from '../BankLogo';
import { AuthenticationPinModal } from './AuthenticationPinModal';

interface Props {
  banks: BankAccount[];
  user?: UserProfile;
  isPrivacyMode?: boolean;
  onUpdateBanks: React.Dispatch<React.SetStateAction<BankAccount[]>>;
  onOpenLinkBankWizard: () => void;
  onOpenBankScanner?: (bankId?: string) => void;
  onOpenBankingOps?: (tab: 'balance' | 'send' | 'receive' | 'self_transfer') => void;
  onLogActivity?: (title: string, desc: string, type: 'bank' | 'auth' | 'security' | 'document' | 'portal') => void;
  onTriggerNotification?: (notif: any) => void;
}

export const BankAccountsSection: React.FC<Props> = ({
  banks,
  user,
  isPrivacyMode = false,
  onUpdateBanks,
  onOpenLinkBankWizard,
  onOpenBankScanner,
  onOpenBankingOps,
  onLogActivity,
  onTriggerNotification,
}) => {
  // Expanded card tracking (by bank ID)
  const [expandedBankIds, setExpandedBankIds] = useState<Record<string, boolean>>({
    [banks.find((b) => b.isPrimary)?.id || banks[0]?.id || '']: true,
  });

  // Authentication state for unmasking full details
  const [isAuthenticatedUnmasked, setIsAuthenticatedUnmasked] = useState<boolean>(false);
  const [showUnmaskAuthModal, setShowUnmaskAuthModal] = useState<boolean>(false);

  // Set Primary flow state
  const [bankToMakePrimary, setBankToMakePrimary] = useState<BankAccount | null>(null);
  const [showPrimaryConfirmDialog, setShowPrimaryConfirmDialog] = useState<boolean>(false);
  const [showPrimaryAuthModal, setShowPrimaryAuthModal] = useState<boolean>(false);

  // Remove Bank flow state
  const [bankToRemove, setBankToRemove] = useState<BankAccount | null>(null);
  const [showRemovePrimaryWarning, setShowRemovePrimaryWarning] = useState<boolean>(false);
  const [showRemoveConfirmDialog, setShowRemoveConfirmDialog] = useState<boolean>(false);
  const [showRemoveAuthModal, setShowRemoveAuthModal] = useState<boolean>(false);

  const primaryBank = banks.find((b) => b.isPrimary) || banks[0];

  const toggleExpand = (bankId: string) => {
    setExpandedBankIds((prev) => ({
      ...prev,
      [bankId]: !prev[bankId],
    }));
  };

  // Set Primary: Step 1 - Trigger Confirmation
  const handleInitiateSetPrimary = (bank: BankAccount) => {
    setBankToMakePrimary(bank);
    setShowPrimaryConfirmDialog(true);
  };

  // Set Primary: Step 2 - User Confirmed -> Prompt Authenticate
  const handleConfirmPrimaryDialog = () => {
    setShowPrimaryConfirmDialog(false);
    setShowPrimaryAuthModal(true);
  };

  // Set Primary: Step 3 - Authenticated -> Apply change
  const handlePrimaryAuthSuccess = () => {
    setShowPrimaryAuthModal(false);
    if (!bankToMakePrimary) return;

    const newPrimaryName = bankToMakePrimary.bankName;
    const oldPrimaryName = primaryBank ? primaryBank.bankName : '';

    onUpdateBanks((prev) =>
      prev.map((b) => ({
        ...b,
        isPrimary: b.id === bankToMakePrimary.id,
      }))
    );

    if (onLogActivity) {
      onLogActivity(
        'Primary Bank Changed',
        `${newPrimaryName} is now your primary payment bank. Former primary: ${oldPrimaryName}`,
        'bank'
      );
    }

    if (onTriggerNotification) {
      onTriggerNotification({
        title: 'Primary Bank Updated',
        message: `${newPrimaryName} has been designated as your primary bank for direct payments & UPI transactions.`,
        type: 'bank',
        status: 'success',
        actionLabel: 'View Banks',
        actionTab: 'banks',
      });
    }

    setBankToMakePrimary(null);
  };

  // Remove Bank: Step 1 - Check if Primary
  const handleInitiateRemoveBank = (bank: BankAccount) => {
    setBankToRemove(bank);
    if (bank.isPrimary) {
      // Primary bank cannot be removed directly!
      setShowRemovePrimaryWarning(true);
    } else {
      setShowRemoveConfirmDialog(true);
    }
  };

  // Remove Bank: Step 2 - User Confirmed -> Prompt Authenticate
  const handleConfirmRemoveDialog = () => {
    setShowRemoveConfirmDialog(false);
    setShowRemoveAuthModal(true);
  };

  // Remove Bank: Step 3 - Authenticated -> Delete Bank
  const handleRemoveAuthSuccess = () => {
    setShowRemoveAuthModal(false);
    if (!bankToRemove) return;

    const removedName = bankToRemove.bankName;
    const removedLast4 = bankToRemove.accountNumberMasked;

    onUpdateBanks((prev) => prev.filter((b) => b.id !== bankToRemove.id));

    if (onLogActivity) {
      onLogActivity(
        'Bank Account Removed',
        `Unlinked ${removedName} (${removedLast4}) following verified user authentication`,
        'bank'
      );
    }

    if (onTriggerNotification) {
      onTriggerNotification({
        title: 'Bank Account Unlinked',
        message: `${removedName} has been successfully disconnected from your DocPay UPI profile.`,
        type: 'bank',
        status: 'info',
      });
    }

    setBankToRemove(null);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 sm:p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Linked Bank Accounts ({banks.length})
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                NPCI 24x7 Direct Account Mapper • Primary Account Routing
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mask / Unmask Authenticate Toggle */}
          <button
            type="button"
            onClick={() => {
              if (isAuthenticatedUnmasked) {
                setIsAuthenticatedUnmasked(false);
              } else {
                setShowUnmaskAuthModal(true);
              }
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              isAuthenticatedUnmasked
                ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Authenticate to view unmasked details"
          >
            {isAuthenticatedUnmasked ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Mask Data</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-slate-600" />
                <span>Authenticate to Unmask</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenLinkBankWizard}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Bank Account</span>
          </button>
        </div>
      </div>

      {/* Linked Bank Cards List */}
      <div className="space-y-4">
        {banks.map((bank, index) => {
          const isExpanded = !!expandedBankIds[bank.id];
          const displayAccountNo = isAuthenticatedUnmasked && bank.fullAccountNumber
            ? bank.fullAccountNumber
            : bank.accountNumberMasked || '•••• 4521';
          const displayUpiNumber = isAuthenticatedUnmasked && user?.phone
            ? user.phone
            : bank.upiNumber || '98XXXXXX21';

          return (
            <motion.div
              key={bank.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08, ease: 'easeOut' }}
              className={`bg-white border rounded-3xl transition-all shadow-sm overflow-hidden ${
                bank.isPrimary
                  ? 'border-blue-400 ring-2 ring-blue-500/20 shadow-blue-50/50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Card Header Section */}
              <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <BankLogo bankName={bank.bankName} ifscCode={bank.ifscCode} size="lg" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-base text-slate-900">
                          {bank.bankName}
                        </h3>
                        {bank.isPrimary && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-600 text-white shadow-xs">
                            <Star className="w-3 h-3 fill-current" />
                            Primary Bank
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          {bank.status || 'Linked'}
                        </span>
                      </div>

                      {/* Top Masked Summary Grid */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500 font-medium">
                        <div>
                          <span>Account: </span>
                          <span className="font-mono font-bold text-slate-800">
                            {displayAccountNo}
                          </span>
                        </div>
                        <div>
                          <span>UPI Number: </span>
                          <span className="font-mono font-bold text-slate-800">
                            {displayUpiNumber}
                          </span>
                        </div>
                        <div>
                          <span>VPA: </span>
                          <span className="font-mono font-bold text-blue-700">
                            {bank.vpa || bank.upiId || 'dasthagiri@upi'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Action Row */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => toggleExpand(bank.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {!bank.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleInitiateSetPrimary(bank)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Star className="w-3.5 h-3.5" />
                        <span>Set as Primary</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleInitiateRemoveBank(bank)}
                      className="p-1.5 sm:px-2.5 sm:py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                      title="Remove Bank"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Remove Bank</span>
                    </button>
                  </div>
                </div>

                {/* Expandable Details Accordion */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-5 pt-5 border-t border-slate-100 space-y-4"
                    >
                      {/* Detailed Information Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Account Type</p>
                          <p className="font-extrabold text-slate-800 capitalize mt-0.5">
                            {bank.accountType} Account
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">IFSC Code</p>
                          <p className="font-mono font-bold text-blue-700 mt-0.5">
                            {bank.ifscCode}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Branch Location</p>
                          <p className="font-bold text-slate-800 mt-0.5 truncate" title={bank.branchName}>
                            {bank.branchName || 'Bengaluru Main Branch'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Available Balance</p>
                          <p
                            className={`font-mono font-extrabold text-emerald-700 mt-0.5 ${
                              isPrivacyMode ? 'blur-sm select-none' : ''
                            }`}
                          >
                            {bank.balance || '₹1,24,580.00'}
                          </p>
                        </div>
                      </div>

                      {/* Bank Operations Quick Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-2">
                          {onOpenBankingOps && (
                            <button
                              type="button"
                              onClick={() => onOpenBankingOps('balance')}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                              <span>Check Balance</span>
                            </button>
                          )}

                          {onOpenBankScanner && (
                            <button
                              type="button"
                              onClick={() => onOpenBankScanner(bank.id)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5 text-slate-700" />
                              <span>Bank Passbook QR</span>
                            </button>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-400 font-mono">
                          Linked Date: {bank.linkedDate || '2026-01-20'} • NPCI Token: {bank.verificationCode || 'VER-NPCI-9921'}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* 2. SET PRIMARY CONFIRMATION MODAL */}
      {/* ============================================================ */}
      {showPrimaryConfirmDialog && bankToMakePrimary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
              <Star className="w-6 h-6 fill-current" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                Make {bankToMakePrimary.bankName} your primary bank?
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Money sent to your mobile or UPI ID will be deposited into this account. All auto-pay mandates and payments will default to this bank.
              </p>
            </div>

            {primaryBank && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Primary:</span>
                  <span className="font-bold text-slate-800">{primaryBank.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">New Primary:</span>
                  <span className="font-black text-blue-600">{bankToMakePrimary.bankName}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowPrimaryConfirmDialog(false);
                  setBankToMakePrimary(null);
                }}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPrimaryDialog}
                className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. PRIMARY BANK REMOVAL SAFEGUARD WARNING */}
      {/* ============================================================ */}
      {showRemovePrimaryWarning && bankToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-slate-900">
                Cannot Remove Primary Bank
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-amber-900">
                “This is your primary bank. Select another linked bank as primary before removing it.”
              </p>
              <p className="text-xs text-slate-500">
                This rule prevents your DocPay account from having no primary bank for receiving funds and settling mandates.
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setShowRemovePrimaryWarning(false);
                  setBankToRemove(null);
                }}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Okay, Understood
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. NON-PRIMARY BANK REMOVAL CONFIRMATION */}
      {/* ============================================================ */}
      {showRemoveConfirmDialog && bankToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                Remove {bankToRemove.bankName}?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Account {bankToRemove.accountNumberMasked} will be disconnected from DocPay UPI. You will need to re-verify it to link again.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowRemoveConfirmDialog(false);
                  setBankToRemove(null);
                }}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemoveDialog}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Remove
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Auth Modal for Set Primary */}
      <AuthenticationPinModal
        isOpen={showPrimaryAuthModal}
        title="Authenticate Primary Bank"
        subtitle={`Verify your 4-digit UPI PIN to make ${bankToMakePrimary?.bankName} your primary bank`}
        actionDescription={`Designating ${bankToMakePrimary?.bankName} (${bankToMakePrimary?.accountNumberMasked}) as Primary`}
        onSuccess={handlePrimaryAuthSuccess}
        onClose={() => {
          setShowPrimaryAuthModal(false);
          setBankToMakePrimary(null);
        }}
      />

      {/* Auth Modal for Removing Bank */}
      <AuthenticationPinModal
        isOpen={showRemoveAuthModal}
        title="Authenticate Bank Removal"
        subtitle={`Enter UPI PIN to remove ${bankToRemove?.bankName}`}
        actionDescription={`Disconnecting ${bankToRemove?.bankName} (${bankToRemove?.accountNumberMasked})`}
        onSuccess={handleRemoveAuthSuccess}
        onClose={() => {
          setShowRemoveAuthModal(false);
          setBankToRemove(null);
        }}
      />

      {/* Auth Modal for Unmasking Details */}
      <AuthenticationPinModal
        isOpen={showUnmaskAuthModal}
        title="Authenticate to Unmask"
        subtitle="Enter your 4-digit UPI PIN or use Biometrics to unmask your full account numbers and mobile credentials"
        onSuccess={() => {
          setShowUnmaskAuthModal(false);
          setIsAuthenticatedUnmasked(true);
        }}
        onClose={() => setShowUnmaskAuthModal(false)}
      />
    </div>
  );
};
