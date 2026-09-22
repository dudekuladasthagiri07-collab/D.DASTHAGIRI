import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  Plus,
  RefreshCw,
  History,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Settings2,
  Sparkles,
  Building2,
  X,
  CreditCard,
} from 'lucide-react';
import { WalletData, BankAccount, UserProfile } from '../../types';
import { AuthenticationPinModal } from './AuthenticationPinModal';

interface Props {
  wallet: WalletData;
  banks: BankAccount[];
  user?: UserProfile;
  isPrivacyMode?: boolean;
  onUpdateWallet: React.Dispatch<React.SetStateAction<WalletData>>;
  onLogActivity?: (title: string, desc: string, type: 'bank' | 'auth' | 'security' | 'document' | 'portal') => void;
  onTriggerNotification?: (notif: any) => void;
}

export const DocpayWalletSection: React.FC<Props> = ({
  wallet,
  banks,
  user,
  isPrivacyMode = false,
  onUpdateWallet,
  onLogActivity,
  onTriggerNotification,
}) => {
  const [showAddMoneyModal, setShowAddMoneyModal] = useState<boolean>(false);
  const [showAutoAddConfigModal, setShowAutoAddConfigModal] = useState<boolean>(false);
  const [addAmount, setAddAmount] = useState<string>('1000');
  const [selectedSourceBankId, setSelectedSourceBankId] = useState<string>(
    banks.find((b) => b.isPrimary)?.id || banks[0]?.id || ''
  );
  const [showAuthPinModal, setShowAuthPinModal] = useState<boolean>(false);
  const [topupSuccessNotice, setTopupSuccessNotice] = useState<string | null>(null);

  // Auto-add settings
  const [isAutoAddEnabled, setIsAutoAddEnabled] = useState<boolean>(wallet.isAutoAddEnabled);
  const [threshold, setThreshold] = useState<number>(wallet.autoAddThreshold || 1000);
  const [autoAmount, setAutoAmount] = useState<number>(wallet.autoAddAmount || 2000);

  const primaryBank = banks.find((b) => b.id === (wallet.linkedSourceBankId || banks[0]?.id)) || banks[0];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const handleQuickAddChip = (amount: number) => {
    setAddAmount(String(amount));
  };

  const handleInitiateTopup = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(addAmount);
    if (isNaN(num) || num <= 0) return;
    setShowAddMoneyModal(false);
    setShowAuthPinModal(true);
  };

  const handleTopupAuthSuccess = () => {
    setShowAuthPinModal(false);
    const num = parseFloat(addAmount);
    if (isNaN(num) || num <= 0) return;

    const sourceBank = banks.find((b) => b.id === selectedSourceBankId) || primaryBank;
    const refId = `WAL-ADD-${Math.floor(100000 + Math.random() * 900000)}`;

    onUpdateWallet((prev) => ({
      ...prev,
      balance: prev.balance + num,
      history: [
        {
          id: `wtx-${Date.now()}`,
          type: 'credit',
          amount: num,
          title: `Added from ${sourceBank?.bankName || 'Bank Account'}`,
          description: `Instant top-up via UPI • ${sourceBank?.accountNumberMasked || '•••• 4521'}`,
          timestamp: 'Just now',
          status: 'success',
          refId,
        },
        ...prev.history,
      ],
    }));

    if (onLogActivity) {
      onLogActivity(
        'DocPay Wallet Top-up',
        `Credited ${formatCurrency(num)} from ${sourceBank?.bankName} (Ref: ${refId})`,
        'bank'
      );
    }

    if (onTriggerNotification) {
      onTriggerNotification({
        title: 'Wallet Balance Updated',
        message: `${formatCurrency(num)} added successfully. New balance: ${formatCurrency(wallet.balance + num)}`,
        type: 'bank',
        status: 'success',
        actionLabel: 'View Wallet',
        actionTab: 'banks',
      });
    }

    setTopupSuccessNotice(`Successfully added ${formatCurrency(num)} to your DocPay Wallet!`);
    setTimeout(() => setTopupSuccessNotice(null), 3500);
  };

  const handleSaveAutoAddConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWallet((prev) => ({
      ...prev,
      isAutoAddEnabled,
      autoAddThreshold: threshold,
      autoAddAmount: autoAmount,
    }));

    if (onLogActivity) {
      onLogActivity(
        'Wallet Auto-Add Updated',
        `Auto-top-up is ${isAutoAddEnabled ? 'enabled' : 'disabled'}. Adds ${formatCurrency(autoAmount)} when balance < ${formatCurrency(threshold)}`,
        'bank'
      );
    }

    setShowAutoAddConfigModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Wallet Active Balance Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-blue-300">
                <Wallet className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono uppercase tracking-widest text-blue-200">
                DocPay Digital Wallet
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                1-Tap Fast Checkout
              </span>
            </div>

            <div>
              <p className="text-xs text-slate-300 font-medium">Active Balance</p>
              <h2
                className={`text-3xl sm:text-4xl font-mono font-black tracking-tight text-white mt-1 ${
                  isPrivacyMode ? 'blur-sm select-none' : ''
                }`}
              >
                {formatCurrency(wallet.balance)}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-blue-200/80 pt-1">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>RBI PPI Compliant</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Zero Failure Guarantee</span>
              </div>
            </div>
          </div>

          {/* Wallet Hero Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAddMoneyModal(true)}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-blue-400/40"
            >
              <Plus className="w-4 h-4" />
              <span>Add Money</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAutoAddConfigModal(true)}
              className={`px-4 py-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                wallet.isAutoAddEnabled
                  ? 'bg-white/15 hover:bg-white/20 text-white border-white/30'
                  : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
              }`}
            >
              <RefreshCw className="w-4 h-4 text-blue-300" />
              <span>Auto-add Money: {wallet.isAutoAddEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Topup success alert */}
      {topupSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{topupSuccessNotice}</span>
        </div>
      )}

      {/* Auto-Add Rule Banner */}
      <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-slate-900">Auto-add Money Mandate</h4>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  wallet.isAutoAddEnabled
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {wallet.isAutoAddEnabled ? 'Active' : 'Disabled'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {wallet.isAutoAddEnabled
                ? `When balance drops below ${formatCurrency(wallet.autoAddThreshold)}, auto-add ${formatCurrency(wallet.autoAddAmount)} from ${primaryBank?.bankName || 'Primary Bank'}.`
                : 'Turn on auto-add so your transit and fast payments never fail due to low wallet balance.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAutoAddConfigModal(true)}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Configure</span>
        </button>
      </div>

      {/* Wallet History Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-extrabold text-slate-900">Wallet History</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {wallet.history.length} Recent Transactions
          </span>
        </div>

        {wallet.history.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-medium">
            No wallet transactions yet. Top-up money or pay using wallet to see activity.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {wallet.history.map((tx) => (
              <div
                key={tx.id}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      tx.type === 'credit'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-rose-50 text-rose-600 border-rose-200'
                    }`}
                  >
                    {tx.type === 'credit' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs sm:text-sm text-slate-900">
                      {tx.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-md">
                      {tx.description}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                      <span>{tx.timestamp}</span>
                      <span>•</span>
                      <span>Ref: {tx.refId}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`font-mono font-extrabold text-sm ${
                      tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {tx.type === 'credit' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </div>
                  <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5">
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-5"
          >
            <button
              onClick={() => setShowAddMoneyModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="font-black text-lg text-slate-900">Add Money to Wallet</h3>
              <p className="text-xs text-slate-500">
                Instant top-up via your linked bank accounts or UPI.
              </p>
            </div>

            <form onSubmit={handleInitiateTopup} className="space-y-4">
              {/* Amount input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enter Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    placeholder="1000"
                    min="10"
                    max="50000"
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Quick Add Chips */}
                <div className="flex items-center gap-2 mt-2.5">
                  {[500, 1000, 2000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleQuickAddChip(amt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        addAmount === String(amt)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source Bank Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Source Bank
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {banks.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedSourceBankId(b.id)}
                      className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        selectedSourceBankId === b.id
                          ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <div>
                          <span className="font-extrabold text-xs text-slate-900 block">
                            {b.bankName}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {b.accountNumberMasked}
                          </span>
                        </div>
                      </div>
                      {b.isPrimary && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-600 text-white">
                          Primary
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!addAmount || parseFloat(addAmount) <= 0}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Proceed to Add ₹{addAmount || '0'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Auto-Add Configuration Modal */}
      {showAutoAddConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative space-y-5"
          >
            <button
              onClick={() => setShowAutoAddConfigModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="font-black text-lg text-slate-900">Auto-add Settings</h3>
              <p className="text-xs text-slate-500">
                Automatically recharge wallet to prevent transaction drops.
              </p>
            </div>

            <form onSubmit={handleSaveAutoAddConfig} className="space-y-4">
              {/* Toggle Switch */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="font-extrabold text-xs text-slate-900 block">
                    Enable Auto-top-up
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Uses NPCI e-Mandate from primary bank
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAutoAddEnabled((prev) => !prev)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    isAutoAddEnabled ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      isAutoAddEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {isAutoAddEnabled && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      When Balance Falls Below (₹)
                    </label>
                    <input
                      type="number"
                      value={threshold}
                      onChange={(e) => setThreshold(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Auto-add Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={autoAmount}
                      onChange={(e) => setAutoAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Save Settings
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Topup Authentication Modal */}
      <AuthenticationPinModal
        isOpen={showAuthPinModal}
        title="Authorize Wallet Top-up"
        subtitle={`Enter UPI PIN to debit ₹${addAmount} from ${primaryBank?.bankName}`}
        actionDescription={`Crediting ${formatCurrency(parseFloat(addAmount) || 0)} to DocPay Wallet`}
        onSuccess={handleTopupAuthSuccess}
        onClose={() => setShowAuthPinModal(false)}
      />
    </div>
  );
};
