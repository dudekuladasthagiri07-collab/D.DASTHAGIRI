import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  Smartphone,
  Wallet,
  CreditCard,
  QrCode,
  Send,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import {
  BankAccount,
  PaymentCard,
  UpiProfile,
  WalletData,
  UserProfile,
} from '../../types';
import { BankAccountsSection } from './BankAccountsSection';
import { UpiVpaSection } from './UpiVpaSection';
import { DocpayWalletSection } from './DocpayWalletSection';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { PaymentFlowModal } from './PaymentFlowModal';
import { UpiQrModal } from './UpiQrModal';
import { AddCardModal } from './AddCardModal';
import { UpiContactsPaySection } from './UpiContactsPaySection';

interface Props {
  banks: BankAccount[];
  cards: PaymentCard[];
  upiProfile: UpiProfile;
  wallet: WalletData;
  user?: UserProfile;
  isPrivacyMode?: boolean;
  onUpdateBanks: React.Dispatch<React.SetStateAction<BankAccount[]>>;
  onUpdateCards: React.Dispatch<React.SetStateAction<PaymentCard[]>>;
  onUpdateUpiProfile: React.Dispatch<React.SetStateAction<UpiProfile>>;
  onUpdateWallet: React.Dispatch<React.SetStateAction<WalletData>>;
  onOpenLinkBankWizard: () => void;
  onOpenBankScanner?: (bankId?: string) => void;
  onOpenBankingOps?: (tab: 'balance' | 'send' | 'receive' | 'self_transfer') => void;
  onLogActivity?: (title: string, desc: string, type: 'bank' | 'auth' | 'security' | 'document' | 'portal') => void;
  onTriggerNotification?: (notif: any) => void;
}

type ActiveTab = 'banks' | 'contacts_pay' | 'upi' | 'wallet' | 'cards' | 'quick_pay';

export const PaymentMethodsModule: React.FC<Props> = ({
  banks,
  cards,
  upiProfile,
  wallet,
  user,
  isPrivacyMode = false,
  onUpdateBanks,
  onUpdateCards,
  onUpdateUpiProfile,
  onUpdateWallet,
  onOpenLinkBankWizard,
  onOpenBankScanner,
  onOpenBankingOps,
  onLogActivity,
  onTriggerNotification,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('banks');
  const [showPaymentFlowModal, setShowPaymentFlowModal] = useState<boolean>(false);
  const [selectedContactPayee, setSelectedContactPayee] = useState<{
    name: string;
    phoneOrUpi: string;
    bankName?: string;
  } | undefined>(undefined);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [showAddCardModal, setShowAddCardModal] = useState<boolean>(false);

  const primaryBank = banks.find((b) => b.isPrimary) || banks[0];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const handleRemoveCard = (cardId: string) => {
    const targetCard = cards.find((c) => c.id === cardId);
    onUpdateCards((prev) => prev.filter((c) => c.id !== cardId));
    if (onLogActivity && targetCard) {
      onLogActivity('Card Removed', `Removed ${targetCard.cardNumberMasked}`, 'bank');
    }
    if (onTriggerNotification && targetCard) {
      onTriggerNotification({
        title: 'Card Removed',
        message: `${targetCard.cardNumberMasked} has been deleted from your saved cards.`,
        type: 'bank',
        status: 'info',
      });
    }
  };

  const handleSetDefaultCard = (cardId: string) => {
    onUpdateCards((prev) =>
      prev.map((c) => ({
        ...c,
        isDefault: c.id === cardId,
      }))
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Module Master Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>NPCI Unified Payments • 256-Bit Encrypted</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">
                RBI Tokenization & Data Masking Compliant
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Payment Methods & Bank Accounts
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
              Manage your linked bank accounts, configure primary account routing, view UPI numbers & VPAs, manage DocPay Wallet, and tokenize debit/credit cards in a single PhonePe/Paytm-style hub.
            </p>
          </div>

          {/* Master Action Header Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setSelectedContactPayee(undefined);
                setShowPaymentFlowModal(true);
              }}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Send Money / Pay</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('contacts_pay')}
              className="px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-2xl border border-emerald-200 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Pay Contacts (Bank Name)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <QrCode className="w-4 h-4 text-slate-700" />
              <span>Receive / QR</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase text-slate-400">Primary Bank</p>
            <p className="font-extrabold text-slate-900 mt-0.5 truncate flex items-center gap-1">
              <Star className="w-3 h-3 text-blue-600 fill-current" />
              {primaryBank ? primaryBank.bankName : 'None'}
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase text-slate-400">UPI Number</p>
            <p className="font-mono font-bold text-slate-900 mt-0.5">
              {upiProfile.upiNumberMasked}
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase text-slate-400">DocPay Wallet</p>
            <p
              className={`font-mono font-black text-emerald-600 mt-0.5 ${
                isPrivacyMode ? 'blur-sm select-none' : ''
              }`}
            >
              {formatCurrency(wallet.balance)}
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase text-slate-400">Saved Cards</p>
            <p className="font-bold text-slate-900 mt-0.5">
              {cards.length} Tokenized
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('banks')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'banks'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Bank Accounts ({banks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contacts_pay')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'contacts_pay'
              ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Smartphone className="w-4 h-4 text-emerald-600" />
          <span>Pay Contacts & Phone (Bank Name)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upi')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'upi'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>UPI & VPAs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('wallet')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'wallet'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>DocPay Wallet</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cards')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'cards'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Saved Cards ({cards.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quick_pay')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'quick_pay'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Payment Methods Selector</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB CONTENT PANELS */}
      {/* ============================================================ */}

      {/* Tab 1: Bank Accounts */}
      {activeTab === 'banks' && (
        <BankAccountsSection
          banks={banks}
          user={user}
          isPrivacyMode={isPrivacyMode}
          onUpdateBanks={onUpdateBanks}
          onOpenLinkBankWizard={onOpenLinkBankWizard}
          onOpenBankScanner={onOpenBankScanner}
          onOpenBankingOps={onOpenBankingOps}
          onLogActivity={onLogActivity}
          onTriggerNotification={onTriggerNotification}
        />
      )}

      {/* Tab 2: Pay Contacts & Phone (Bank-Registered Name Lookup) */}
      {activeTab === 'contacts_pay' && (
        <UpiContactsPaySection
          user={user}
          banks={banks}
          onInitiatePayment={(recipient) => {
            setSelectedContactPayee({
              name: recipient.name,
              phoneOrUpi: recipient.phoneOrUpi,
              bankName: recipient.bankName,
            });
            setShowPaymentFlowModal(true);
          }}
        />
      )}

      {/* Tab 3: UPI & VPAs */}
      {activeTab === 'upi' && (
        <UpiVpaSection
          upiProfile={upiProfile}
          user={user}
          onUpdateUpiProfile={onUpdateUpiProfile}
          onLogActivity={onLogActivity}
          onTriggerNotification={onTriggerNotification}
        />
      )}

      {/* Tab 3: DocPay Wallet */}
      {activeTab === 'wallet' && (
        <DocpayWalletSection
          wallet={wallet}
          banks={banks}
          user={user}
          isPrivacyMode={isPrivacyMode}
          onUpdateWallet={onUpdateWallet}
          onLogActivity={onLogActivity}
          onTriggerNotification={onTriggerNotification}
        />
      )}

      {/* Tab 4: Saved Cards */}
      {activeTab === 'cards' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Saved Cards</h3>
              <p className="text-xs text-slate-500">
                Encrypted tokenization according to RBI card storage rules.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddCardModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Card</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className="p-5 rounded-3xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-blue-900 text-white shadow-xl relative overflow-hidden flex flex-col justify-between h-52"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded text-white/90">
                      {card.cardCategory.toUpperCase()} CARD
                    </span>
                    <h4 className="font-extrabold text-sm text-white/90 mt-1">{card.bankName}</h4>
                  </div>
                  <span className="text-base font-black italic tracking-wide text-amber-300">
                    {card.cardNetwork}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-lg font-mono font-bold tracking-widest">
                    •••• •••• •••• {card.last4}
                  </div>
                </div>

                <div className="flex justify-between items-end text-xs pt-3 border-t border-white/10">
                  <div>
                    <p className="text-[9px] text-white/50 uppercase">Card Holder</p>
                    <p className="font-bold truncate max-w-[160px]">{card.holderName}</p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <p className="text-[9px] text-white/50 uppercase">Expires</p>
                      <p className="font-mono font-bold">{card.expiryMonth}/{card.expiryYear}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCard(card.id)}
                      className="p-2 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 rounded-xl transition-all cursor-pointer ml-2"
                      title="Remove Card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Quick Payment Method Selector */}
      {activeTab === 'quick_pay' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">Payment Methods Hub</h3>
              <p className="text-xs text-slate-500">
                Interactive selector containing your Primary Bank, linked banks, UPI, DocPay Wallet, and saved cards.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPaymentFlowModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Launch 6-Step Payment Flow</span>
            </button>
          </div>

          <PaymentMethodSelector
            banks={banks}
            cards={cards}
            upiProfile={upiProfile}
            wallet={wallet}
            selectedMethodId={
              banks.find((b) => b.isPrimary)
                ? `bank-${banks.find((b) => b.isPrimary)!.id}`
                : 'upi-primary'
            }
            onSelectMethod={(method) => {
              // Open payment flow with chosen method
              setShowPaymentFlowModal(true);
            }}
            onOpenAddBank={onOpenLinkBankWizard}
            onOpenAddCard={() => setShowAddCardModal(true)}
            isPrivacyMode={isPrivacyMode}
          />
        </div>
      )}

      {/* Modals */}
      <PaymentFlowModal
        isOpen={showPaymentFlowModal}
        onClose={() => {
          setShowPaymentFlowModal(false);
          setSelectedContactPayee(undefined);
        }}
        initialPayee={selectedContactPayee}
        banks={banks}
        cards={cards}
        upiProfile={upiProfile}
        wallet={wallet}
        user={user}
        onUpdateWallet={onUpdateWallet}
        onUpdateCards={onUpdateCards}
        onOpenAddBank={onOpenLinkBankWizard}
        onLogActivity={onLogActivity}
        onTriggerNotification={onTriggerNotification}
      />

      <UpiQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        upiProfile={upiProfile}
        user={user}
      />

      <AddCardModal
        isOpen={showAddCardModal}
        onClose={() => setShowAddCardModal(false)}
        onAddCard={(newCard) => {
          onUpdateCards((prev) => [newCard, ...prev]);
        }}
      />
    </div>
  );
};
