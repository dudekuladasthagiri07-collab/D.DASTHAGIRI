import React from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  Wallet,
  Smartphone,
  CreditCard,
  Plus,
  CheckCircle2,
  Star,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { BankAccount, PaymentCard, UpiProfile, WalletData, PaymentMethodOption } from '../../types';
import { BankLogo } from '../BankLogo';

interface Props {
  banks: BankAccount[];
  cards: PaymentCard[];
  upiProfile: UpiProfile;
  wallet: WalletData;
  selectedMethodId: string;
  onSelectMethod: (method: PaymentMethodOption) => void;
  onOpenAddBank: () => void;
  onOpenAddCard: () => void;
  isPrivacyMode?: boolean;
}

export const PaymentMethodSelector: React.FC<Props> = ({
  banks,
  cards,
  upiProfile,
  wallet,
  selectedMethodId,
  onSelectMethod,
  onOpenAddBank,
  onOpenAddCard,
  isPrivacyMode = false,
}) => {
  const primaryBank = banks.find((b) => b.isPrimary) || banks[0];
  const otherBanks = banks.filter((b) => b.id !== primaryBank?.id);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Compile options list
  const primaryBankOption: PaymentMethodOption | null = primaryBank
    ? {
        id: `bank-${primaryBank.id}`,
        type: 'primary_bank',
        title: primaryBank.bankName,
        subtitle: `${primaryBank.accountType} account • IFSC ${primaryBank.ifscCode}`,
        maskedInfo: primaryBank.accountNumberMasked,
        badge: 'Primary Bank',
        isPrimary: true,
        bankId: primaryBank.id,
      }
    : null;

  const otherBankOptions: PaymentMethodOption[] = otherBanks.map((b) => ({
    id: `bank-${b.id}`,
    type: 'linked_bank',
    title: b.bankName,
    subtitle: `${b.accountType} account • IFSC ${b.ifscCode}`,
    maskedInfo: b.accountNumberMasked,
    isPrimary: false,
    bankId: b.id,
  }));

  const upiOption: PaymentMethodOption = {
    id: 'upi-primary',
    type: 'upi',
    title: 'UPI / VPA',
    subtitle: 'Direct bank-to-bank settlement via NPCI',
    maskedInfo: upiProfile.primaryVpa,
    vpa: upiProfile.primaryVpa,
    badge: 'Instant UPI',
  };

  const walletOption: PaymentMethodOption = {
    id: 'wallet-docpay',
    type: 'wallet',
    title: 'DocPay Wallet',
    subtitle: `1-Tap checkout • Fast payment`,
    maskedInfo: isPrivacyMode ? '₹••••' : formatCurrency(wallet.balance),
    balance: wallet.balance,
    badge: '1-Tap Fast',
  };

  const cardOptions: PaymentMethodOption[] = cards.map((c) => ({
    id: `card-${c.id}`,
    type: 'card',
    title: `Saved ${c.cardNetwork} card`,
    subtitle: `${c.cardCategory.toUpperCase()} • Expires ${c.expiryMonth}/${c.expiryYear}`,
    maskedInfo: c.cardNumberMasked,
    cardId: c.id,
    badge: c.isDefault ? 'Default Card' : undefined,
  }));

  return (
    <div className="space-y-4">
      {/* Category 1: Bank Accounts */}
      <div className="space-y-2.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
          Bank Accounts
        </span>

        {/* Primary Bank */}
        {primaryBankOption && (
          <div
            onClick={() => onSelectMethod(primaryBankOption)}
            className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
              selectedMethodId === primaryBankOption.id
                ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-white hover:bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <BankLogo bankName={primaryBank.bankName} ifscCode={primaryBank.ifscCode} size="md" />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-slate-900">
                    {primaryBankOption.title}
                  </h4>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white shadow-xs">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    Primary
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-mono">
                  <span>Account: {primaryBankOption.maskedInfo}</span>
                </div>
              </div>
            </div>

            {/* Radio indicator */}
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedMethodId === primaryBankOption.id
                  ? 'border-blue-600 bg-blue-600 shadow-sm'
                  : 'border-slate-300 group-hover:border-slate-400'
              }`}
            >
              {selectedMethodId === primaryBankOption.id && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
          </div>
        )}

        {/* Other Linked Banks */}
        {otherBankOptions.map((opt) => (
          <div
            key={opt.id}
            onClick={() => onSelectMethod(opt)}
            className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
              selectedMethodId === opt.id
                ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-white hover:bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <BankLogo bankName={opt.title} size="md" />
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">{opt.title}</h4>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-mono">
                  <span>Account: {opt.maskedInfo}</span>
                </div>
              </div>
            </div>

            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedMethodId === opt.id
                  ? 'border-blue-600 bg-blue-600 shadow-sm'
                  : 'border-slate-300 group-hover:border-slate-400'
              }`}
            >
              {selectedMethodId === opt.id && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Category 2: UPI & Wallet */}
      <div className="space-y-2.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
          UPI & Digital Wallet
        </span>

        {/* UPI Option */}
        <div
          onClick={() => onSelectMethod(upiOption)}
          className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
            selectedMethodId === upiOption.id
              ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-white hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-slate-900">{upiOption.title}</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {upiOption.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono font-bold mt-0.5 text-blue-700">
                {upiOption.maskedInfo}
              </p>
            </div>
          </div>

          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              selectedMethodId === upiOption.id
                ? 'border-blue-600 bg-blue-600 shadow-sm'
                : 'border-slate-300 group-hover:border-slate-400'
            }`}
          >
            {selectedMethodId === upiOption.id && (
              <div className="w-2 h-2 rounded-full bg-white" />
            )}
          </div>
        </div>

        {/* DocPay Wallet Option */}
        <div
          onClick={() => onSelectMethod(walletOption)}
          className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
            selectedMethodId === walletOption.id
              ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-white hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-slate-900">{walletOption.title}</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  {walletOption.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Available: <span className="font-mono font-bold text-slate-800">{walletOption.maskedInfo}</span>
              </p>
            </div>
          </div>

          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              selectedMethodId === walletOption.id
                ? 'border-blue-600 bg-blue-600 shadow-sm'
                : 'border-slate-300 group-hover:border-slate-400'
            }`}
          >
            {selectedMethodId === walletOption.id && (
              <div className="w-2 h-2 rounded-full bg-white" />
            )}
          </div>
        </div>
      </div>

      {/* Category 3: Saved Cards */}
      <div className="space-y-2.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
          Saved Cards
        </span>

        {cardOptions.map((cardOpt) => (
          <div
            key={cardOpt.id}
            onClick={() => onSelectMethod(cardOpt)}
            className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
              selectedMethodId === cardOpt.id
                ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-white hover:bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">{cardOpt.title}</h4>
                <p className="text-xs text-slate-500 font-mono font-bold mt-0.5">
                  {cardOpt.maskedInfo}
                </p>
              </div>
            </div>

            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedMethodId === cardOpt.id
                  ? 'border-blue-600 bg-blue-600 shadow-sm'
                  : 'border-slate-300 group-hover:border-slate-400'
              }`}
            >
              {selectedMethodId === cardOpt.id && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Actions Grid */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={onOpenAddBank}
          className="p-3 bg-slate-50 hover:bg-blue-50/70 border border-dashed border-slate-300 hover:border-blue-400 text-slate-700 hover:text-blue-700 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>+ Add Bank Account</span>
        </button>

        <button
          type="button"
          onClick={onOpenAddCard}
          className="p-3 bg-slate-50 hover:bg-blue-50/70 border border-dashed border-slate-300 hover:border-blue-400 text-slate-700 hover:text-blue-700 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <CreditCard className="w-4 h-4 text-blue-600" />
          <span>+ Add Card</span>
        </button>
      </div>
    </div>
  );
};
