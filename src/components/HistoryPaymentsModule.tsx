import React, { useState } from 'react';
import {
  History,
  ReceiptText,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Share2,
  X,
  CreditCard,
  Building2,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Send,
  DownloadCloud,
  QrCode,
  Sparkles,
  FileText,
  FileDown,
  Printer,
  Mail,
  Calendar,
  Eye,
  EyeOff,
  Check,
  FileSpreadsheet,
  Repeat,
  Zap,
} from 'lucide-react';
import { BankTransaction, ActivityLog, BankAccount, UserProfile } from '../types';
import { DocPayLogo } from './DocPayLogo';
import { AutopayManagementModule } from './AutopayManagementModule';

interface Props {
  transactions: BankTransaction[];
  activities: ActivityLog[];
  banks: BankAccount[];
  user: UserProfile;
  onOpenBankingOps: (tab: 'balance' | 'send' | 'receive' | 'self_transfer') => void;
  onOpenQrScanner?: () => void;
  onLogActivity: (title: string, desc: string, type: 'auth' | 'security' | 'document' | 'bank' | 'portal') => void;
  isPrivacyMode?: boolean;
  onTogglePrivacyMode?: () => void;
}

export const HistoryPaymentsModule: React.FC<Props> = ({
  transactions,
  activities,
  banks,
  user,
  onOpenBankingOps,
  onOpenQrScanner,
  onLogActivity,
  isPrivacyMode = false,
  onTogglePrivacyMode,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'send' | 'receive' | 'self_transfer'>('all');
  const [frequencyFilter, setFrequencyFilter] = useState<'all' | 'recurring' | 'one_time'>('all');
  const [selectedTx, setSelectedTx] = useState<BankTransaction | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [activeTabSection, setActiveTabSection] = useState<'payments' | 'recurring' | 'statements' | 'audit_logs'>('payments');

  // Monthly Statements State
  const [selectedMonth, setSelectedMonth] = useState<string>('August 2026');
  const [selectedBankForStatement, setSelectedBankForStatement] = useState<string>('all');
  const [showStatementModal, setShowStatementModal] = useState<boolean>(false);
  const [statementModalData, setStatementModalData] = useState<{
    monthName: string;
    year: number;
    startDate: string;
    endDate: string;
    openingBalance: number;
    totalDebits: number;
    totalCredits: number;
    closingBalance: number;
    bankName: string;
    accountNo: string;
    txList: BankTransaction[];
  } | null>(null);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [statementToast, setStatementToast] = useState<string>('');

  const showToastMsg = (msg: string) => {
    setStatementToast(msg);
    setTimeout(() => setStatementToast(''), 3500);
  };

  // Predefined Monthly List
  const monthlyList = [
    {
      id: 'aug-2026',
      monthName: 'August',
      year: 2026,
      period: '01 Aug 2026 - 31 Aug 2026',
      openingBalance: 145000,
      generatedDate: '01 Aug 2026',
      txCount: transactions.length,
      status: 'Ready',
    },
    {
      id: 'jul-2026',
      monthName: 'July',
      year: 2026,
      period: '01 Jul 2026 - 31 Jul 2026',
      openingBalance: 128500,
      generatedDate: '01 Aug 2026',
      txCount: 18,
      status: 'Verified',
    },
    {
      id: 'jun-2026',
      monthName: 'June',
      year: 2026,
      period: '01 Jun 2026 - 30 Jun 2026',
      openingBalance: 110200,
      generatedDate: '01 Jul 2026',
      txCount: 22,
      status: 'Verified',
    },
    {
      id: 'may-2026',
      monthName: 'May',
      year: 2026,
      period: '01 May 2026 - 31 May 2026',
      openingBalance: 98400,
      generatedDate: '01 Jun 2026',
      txCount: 15,
      status: 'Verified',
    },
    {
      id: 'apr-2026',
      monthName: 'April',
      year: 2026,
      period: '01 Apr 2026 - 30 Apr 2026',
      openingBalance: 87500,
      generatedDate: '01 May 2026',
      txCount: 19,
      status: 'Verified',
    },
    {
      id: 'mar-2026',
      monthName: 'March',
      year: 2026,
      period: '01 Mar 2026 - 31 Mar 2026',
      openingBalance: 76000,
      generatedDate: '01 Apr 2026',
      txCount: 12,
      status: 'Verified',
    },
  ];

  // Open Detailed Statement Viewer Modal
  const handleOpenStatementModal = (m: (typeof monthlyList)[0]) => {
    const selectedBankObj = banks.find((b) => b.id === selectedBankForStatement);
    const bankName = selectedBankObj ? selectedBankObj.bankName : 'All Linked Accounts (Combined)';
    const accountNo = selectedBankObj ? selectedBankObj.accountNumberMasked : 'Multi-Account Consolidated';

    // Filter transactions for statement or use existing list
    const monthTx = transactions.length > 0 ? transactions : [];
    const totalDebits = monthTx
      .filter((t) => t.type === 'send' || t.type === 'self_transfer')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalCredits = monthTx
      .filter((t) => t.type === 'receive')
      .reduce((sum, t) => sum + t.amount, 0);

    const closingBalance = m.openingBalance + totalCredits - totalDebits;

    setStatementModalData({
      monthName: `${m.monthName} ${m.year}`,
      year: m.year,
      startDate: m.period.split(' - ')[0],
      endDate: m.period.split(' - ')[1],
      openingBalance: m.openingBalance,
      totalDebits,
      totalCredits,
      closingBalance,
      bankName,
      accountNo,
      txList: monthTx,
    });
    setShowStatementModal(true);

    onLogActivity(
      'Viewed Monthly Statement',
      `Opened official PDF summary statement for ${m.monthName} ${m.year}`,
      'bank'
    );
  };

  // Download PDF simulation helper
  const handleDownloadPdfStatement = (monthName: string) => {
    setIsGeneratingPdf(true);
    setTimeout(() => {
      setIsGeneratingPdf(false);
      showToastMsg(`PDF Statement for ${monthName} downloaded to device!`);
      onLogActivity(
        'Downloaded Monthly Statement PDF',
        `Downloaded PDF statement file for ${monthName}`,
        'document'
      );
    }, 1200);
  };

  // Email Statement simulation helper
  const handleEmailStatement = (monthName: string) => {
    showToastMsg(`Official e-Statement for ${monthName} sent to ${user.email || 'your email'}`);
    onLogActivity(
      'Emailed Monthly Statement',
      `Dispatched encrypted PDF statement for ${monthName} to ${user.email}`,
      'bank'
    );
  };

  // Calculate totals
  const totalSent = transactions
    .filter((t) => t.type === 'send' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReceived = transactions
    .filter((t) => t.type === 'receive' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSelfTransfer = transactions
    .filter((t) => t.type === 'self_transfer' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const completedCount = transactions.filter((t) => t.status === 'completed').length;

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const isRecurringTx = Boolean(
      tx.isRecurring ||
      /bill|electricity|broadband|auto-pay|subscription|monthly|recharge|tsspdcl|airtel/i.test(`${tx.note} ${tx.recipientName}`)
    );
    const matchesFrequency =
      frequencyFilter === 'all' ||
      (frequencyFilter === 'recurring' && isRecurringTx) ||
      (frequencyFilter === 'one_time' && !isRecurringTx);

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (tx.recipientName && tx.recipientName.toLowerCase().includes(query)) ||
      (tx.recipientUpiOrPhone && tx.recipientUpiOrPhone.toLowerCase().includes(query)) ||
      (tx.utrNumber && tx.utrNumber.toLowerCase().includes(query)) ||
      (tx.fromBankName && tx.fromBankName.toLowerCase().includes(query)) ||
      (tx.toBankName && tx.toBankName.toLowerCase().includes(query)) ||
      (tx.note && tx.note.toLowerCase().includes(query)) ||
      (tx.category && tx.category.toLowerCase().includes(query));
    return matchesType && matchesFrequency && matchesSearch;
  });

  const handleOpenReceipt = (tx: BankTransaction) => {
    setSelectedTx(tx);
    setShowReceiptModal(true);
    onLogActivity(
      'Payment Receipt Viewed',
      `Viewed transaction receipt UTR ${tx.utrNumber} for ₹${tx.amount.toLocaleString('en-IN')}`,
      'bank'
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl text-white flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              <History className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white">Payment & Audit History</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500 text-white uppercase tracking-wider">
                  UTR Verified
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Complete record of all instant bank transfers, UPI payouts, self-transfers, and security audit logs.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onTogglePrivacyMode && (
            <button
              onClick={onTogglePrivacyMode}
              className={`px-3.5 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer border shadow-sm ${
                isPrivacyMode
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-amber-500/20 ring-2 ring-amber-300/50'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Toggle Privacy Blur Mode"
            >
              {isPrivacyMode ? <EyeOff className="w-4 h-4 text-slate-950" /> : <Eye className="w-4 h-4 text-slate-400" />}
              <span>{isPrivacyMode ? 'Privacy: ON' : 'Privacy Mode'}</span>
            </button>
          )}

          {onOpenQrScanner && (
            <button
              id="payments-module-scan-pay"
              onClick={onOpenQrScanner}
              className="px-4 py-2.5 bg-gradient-to-r from-[#6A1BFF] via-[#7B2CBF] to-[#8E24AA] hover:from-purple-600 hover:to-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer ring-2 ring-purple-400/50 hover:scale-105"
            >
              <QrCode className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Scan & Pay</span>
            </button>
          )}
          <button
            onClick={() => onOpenBankingOps('send')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" /> Send Money
          </button>
          <button
            onClick={() => onOpenBankingOps('receive')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <DownloadCloud className="w-4 h-4" /> Receive Money
          </button>
          <button
            onClick={() => onOpenBankingOps('self_transfer')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-indigo-400" /> Self Transfer
          </button>
        </div>
      </div>

      {/* TOTAL PAYMENTS OVERVIEW SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Payments Sent */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Payments Sent</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl font-black font-mono text-slate-900 transition-all duration-300 ${isPrivacyMode ? 'filter blur-md select-none opacity-80 hover:blur-none hover:opacity-100 cursor-pointer' : ''}`}>
            ₹{totalSent.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <span className="font-bold text-rose-600">
              {transactions.filter((t) => t.type === 'send').length} Outgoing
            </span>
            <span>• Bank & UPI Payments</span>
          </div>
        </div>

        {/* Total Payments Received */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Money Received</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl font-black font-mono text-emerald-600 transition-all duration-300 ${isPrivacyMode ? 'filter blur-md select-none opacity-80 hover:blur-none hover:opacity-100 cursor-pointer' : ''}`}>
            ₹{totalReceived.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <span className="font-bold text-emerald-600">
              {transactions.filter((t) => t.type === 'receive').length} Incoming
            </span>
            <span>• Credited to primary bank</span>
          </div>
        </div>

        {/* Total Self Transfers */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Self Bank Transfers</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl font-black font-mono text-indigo-600 transition-all duration-300 ${isPrivacyMode ? 'filter blur-md select-none opacity-80 hover:blur-none hover:opacity-100 cursor-pointer' : ''}`}>
            ₹{totalSelfTransfer.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <span className="font-bold text-indigo-600">
              {transactions.filter((t) => t.type === 'self_transfer').length} Internal
            </span>
            <span>• Account-to-account</span>
          </div>
        </div>

        {/* Total Transaction Volume */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Completed Transfers</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black font-mono text-slate-900">
            {completedCount} / {transactions.length}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>100% RBI & NPCI Verified UTR</span>
          </div>
        </div>

      </div>

      {/* SECTION NAVIGATION TABS: Total Payment History vs Monthly Statements vs Security Audit Logs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm flex flex-col sm:flex-row items-center gap-2">
        <button
          onClick={() => setActiveTabSection('payments')}
          className={`w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTabSection === 'payments'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ReceiptText className="w-4 h-4" /> Transactions ({transactions.length})
        </button>

        <button
          onClick={() => setActiveTabSection('recurring')}
          className={`w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTabSection === 'recurring'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Repeat className="w-4 h-4 text-purple-400" /> Recurring Bill Manager
        </button>

        <button
          onClick={() => setActiveTabSection('statements')}
          className={`w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTabSection === 'statements'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-300" /> Monthly Statements & PDF
        </button>

        <button
          onClick={() => setActiveTabSection('audit_logs')}
          className={`w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTabSection === 'audit_logs'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" /> Security Audit Logs ({activities.length})
        </button>
      </div>

      {/* TOAST ALERT NOTIFICATION FOR STATEMENTS */}
      {statementToast && (
        <div className="p-3 bg-indigo-900 text-white rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg border border-indigo-700 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span>{statementToast}</span>
          </div>
          <button onClick={() => setStatementToast('')} className="p-1 hover:text-amber-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {activeTabSection === 'payments' ? (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            
            {/* SEARCH & TYPE FILTER BAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by recipient, UTR, bank, or note..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Type & Frequency Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1 border-t border-slate-100">
              {/* Primary Type Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {(['all', 'send', 'receive', 'self_transfer'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer ${
                      typeFilter === t
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {t === 'all'
                      ? 'All Types'
                      : t === 'send'
                      ? 'Sent (Out)'
                      : t === 'receive'
                      ? 'Received (In)'
                      : 'Self Transfer'}
                  </button>
                ))}
              </div>

              {/* Recurring vs One-Time Frequency Filter */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => setFrequencyFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    frequencyFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All Frequencies
                </button>
                <button
                  onClick={() => setFrequencyFilter('recurring')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                    frequencyFilter === 'recurring'
                      ? 'bg-purple-600 text-white shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Repeat className="w-2.5 h-2.5" />
                  Recurring Bills
                </button>
                <button
                  onClick={() => setFrequencyFilter('one_time')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                    frequencyFilter === 'one_time'
                      ? 'bg-slate-800 text-white shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <CreditCard className="w-2.5 h-2.5" />
                  One-Time
                </button>
              </div>
            </div>
          </div>

          {/* TRANSACTIONS LIST IN VERTICAL SERIES FORMAT */}
          <div className="relative space-y-4 pt-1">
            {/* Vertical Series Connector Line */}
            {filteredTransactions.length > 1 && (
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-indigo-200 pointer-events-none hidden sm:block" />
            )}

            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl space-y-2">
                <ReceiptText className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-500">No payment transactions found matching filter.</p>
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const isSend = tx.type === 'send';
                const isReceive = tx.type === 'receive';
                const isSelf = tx.type === 'self_transfer';
                const isRecurringTx = Boolean(
                  tx.isRecurring ||
                  /bill|electricity|broadband|auto-pay|subscription|monthly|recharge|tsspdcl|airtel/i.test(`${tx.note} ${tx.recipientName}`)
                );

                return (
                  <div
                    key={tx.id}
                    onClick={() => handleOpenReceipt(tx)}
                    className="p-4 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-2xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-2xs relative z-10"
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                          isReceive
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                            : isSend
                            ? 'bg-rose-100 text-rose-700 border-rose-300'
                            : 'bg-indigo-100 text-indigo-700 border-indigo-300'
                        }`}
                      >
                          {isReceive ? (
                            <ArrowDownLeft className="w-5 h-5" />
                          ) : isSend ? (
                            <ArrowUpRight className="w-5 h-5" />
                          ) : (
                            <RefreshCw className="w-5 h-5" />
                          )}
                        </div>

                      {/* Main Details */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">
                            {isSelf
                              ? `Self Transfer: ${tx.fromBankName} ➔ ${tx.toBankName}`
                              : isSend
                              ? `Paid to ${tx.recipientName || 'UPI User'}`
                              : `Received from ${tx.recipientName || 'Sender'}`}
                          </h4>

                          {/* Status Badge */}
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              tx.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : tx.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {tx.status}
                          </span>

                          {/* Recurring vs One-time Badge */}
                          {isRecurringTx ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-100 text-purple-800 border border-purple-300/80 flex items-center gap-1 shadow-2xs">
                              <Repeat className="w-2.5 h-2.5 text-purple-600" />
                              {tx.recurringInterval || 'Monthly'} Bill / Subscription
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-200/80 text-slate-700 border border-slate-300/60 flex items-center gap-1">
                              <CreditCard className="w-2.5 h-2.5 text-slate-500" />
                              One-Time
                            </span>
                          )}

                          {/* Category Tag */}
                          {tx.category && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-100/70 text-indigo-700 border border-indigo-200">
                              {tx.category}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-mono font-semibold text-slate-600">{tx.utrNumber}</span>
                          <span>•</span>
                          <span>{tx.timestamp}</span>
                          {tx.note && (
                            <>
                              <span>•</span>
                              <span className="italic text-slate-600">"{tx.note}"</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Amount & Receipt Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-0 border-slate-200 pt-2 sm:pt-0">
                      <div className="text-right">
                        <div
                          className={`text-base font-black font-mono transition-all duration-300 ${
                            isReceive
                              ? 'text-emerald-600'
                              : isSend
                              ? 'text-slate-900'
                              : 'text-indigo-600'
                          } ${
                            isPrivacyMode
                              ? 'filter blur-sm select-none opacity-80 hover:blur-none hover:opacity-100 cursor-pointer'
                              : ''
                          }`}
                        >
                          {isReceive ? '+' : isSend ? '-' : ''}₹{tx.amount.toLocaleString('en-IN')}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">Click to view e-Receipt</p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenReceipt(tx);
                        }}
                        className="px-3 py-1.5 bg-white border border-slate-300 hover:border-indigo-400 text-slate-700 hover:text-indigo-600 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1 transition-all"
                      >
                        <ReceiptText className="w-3.5 h-3.5" /> Receipt
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      ) : activeTabSection === 'recurring' ? (
        /* ========================================================================= */
        /* AUTOPAY MANAGEMENT SYSTEM SECTION                                         */
        /* ========================================================================= */
        <div className="space-y-6">
          <AutopayManagementModule
            bankAccounts={banks}
            user={user}
            isPrivacyMode={isPrivacyMode}
            onLogActivity={onLogActivity}
          />
        </div>
      ) : activeTabSection === 'statements' ? (
        /* ========================================================================= */
        /* MONTHLY STATEMENTS & PDF DOWNLOAD SECTION                                */
        /* ========================================================================= */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl text-white shadow-md border border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base text-white">Monthly Bank & UPI e-Statements</h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500 text-slate-950 uppercase">
                  Official PDF
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Download passbook statements with official NPCI & RBI compliance timestamps for audit or tax filing.
              </p>
            </div>

            {/* Bank Selector Filter */}
            <div className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-xl border border-slate-700/80 shrink-0">
              <Building2 className="w-4 h-4 text-amber-300" />
              <select
                value={selectedBankForStatement}
                onChange={(e) => setSelectedBankForStatement(e.target.value)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-white">All Linked Accounts (Combined)</option>
                {banks.map((b) => (
                  <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                    {b.bankName} ({b.accountNumberMasked})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Summary Bar for Latest Month */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-slate-500">Statement Owner</span>
              <p className="text-xs font-black text-slate-900">{user.name}</p>
              <p className="text-[10px] text-slate-500 font-mono">{user.phone}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-slate-500">Selected Account</span>
              <p className="text-xs font-black text-indigo-700">
                {selectedBankForStatement === 'all'
                  ? 'Consolidated All Banks'
                  : banks.find((b) => b.id === selectedBankForStatement)?.bankName}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">Format: Encrypted PDF / Print-Ready</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-slate-500">Verification Seal</span>
              <p className="text-xs font-black text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> RBI NPCI Certified
              </p>
              <p className="text-[10px] text-slate-500">SHA-256 Digital Signature</p>
            </div>
          </div>

          {/* Monthly Statements Grid / List */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" /> Available Monthly Statements (Past 6 Months)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {monthlyList.map((m) => {
                return (
                  <div
                    key={m.id}
                    className="p-5 bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl shadow-2xs hover:shadow-md transition-all space-y-4 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="font-extrabold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                            {m.monthName} {m.year} e-Statement
                          </h5>
                          <p className="text-[11px] text-slate-500 font-mono">{m.period}</p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" /> {m.status}
                      </span>
                    </div>

                    {/* Stats Pill */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">Opening Balance</span>
                        <span className="font-mono font-bold text-slate-800">₹{m.openingBalance.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">Total Activity</span>
                        <span className="font-mono font-bold text-indigo-600">{m.txCount} Transactions</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">File Type</span>
                        <span className="font-mono font-bold text-slate-700">Official PDF</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleOpenStatementModal(m)}
                        className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Statement
                      </button>

                      <button
                        onClick={() => handleDownloadPdfStatement(`${m.monthName} ${m.year}`)}
                        disabled={isGeneratingPdf}
                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 flex items-center justify-center gap-1 transition-all cursor-pointer"
                        title="Download PDF"
                      >
                        <FileDown className="w-3.5 h-3.5 text-indigo-600" /> PDF
                      </button>

                      <button
                        onClick={() => handleEmailStatement(`${m.monthName} ${m.year}`)}
                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 flex items-center justify-center gap-1 transition-all cursor-pointer"
                        title="Email to registered mail"
                      >
                        <Mail className="w-3.5 h-3.5 text-indigo-600" /> Email
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ) : (
        /* AUDIT ACTIVITY TIMELINE SECTION */
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-indigo-600">
              <History className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-800">System & Security Activity Audit Log</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Real-time Biometric & Bank Log</span>
          </div>

          <div className="space-y-3">
            {activities.map((log) => (
              <div key={log.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span
                    className={`font-mono font-bold uppercase px-2 py-0.5 rounded text-[10px] ${
                      log.status === 'success'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.status === 'danger'
                        ? 'bg-rose-100 text-rose-800'
                        : log.status === 'warning'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {log.type}
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">{log.timestamp}</span>
                </div>

                <h4 className="font-bold text-slate-800 text-xs">{log.title}</h4>
                <p className="text-xs text-slate-600">{log.description}</p>

                {log.ipAddress && (
                  <div className="pt-1.5 border-t border-slate-200/60 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                    <span>IP: {log.ipAddress}</span>
                    <span>Device: {log.device}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAILED MONTHLY STATEMENT PDF VIEWER MODAL                               */}
      {/* ========================================================================= */}
      {showStatementModal && statementModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="bg-white border border-slate-300 rounded-3xl max-w-2xl w-full p-6 relative text-slate-900 shadow-2xl space-y-6 my-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header Actions Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    Monthly Passbook Statement — {statementModalData.monthName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Period: {statementModalData.startDate} to {statementModalData.endDate}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowStatementModal(false)}
                className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official Passbook Statement Document View */}
            <div id="printable-statement-document" className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-5 font-sans relative shadow-inner">
              
              {/* Document Official Watermark Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <DocPayLogo variant="light" iconSize="w-8 h-8" textSize="text-xl" />
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-900 text-amber-300 uppercase">
                      Banking e-Statement
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                    NPCI Unified Payments Interface & Reserve Bank System Token
                  </p>
                </div>

                <div className="text-left sm:text-right font-mono text-[11px] text-slate-600 space-y-0.5">
                  <p>Issue Date: <strong>09 Aug 2026</strong></p>
                  <p>Document Ref: <strong>DOC-STMT-2026-8841</strong></p>
                  <p className="text-emerald-700 font-bold">✓ Digitally Signed</p>
                </div>
              </div>

              {/* Customer Account Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white border border-slate-200 rounded-xl text-xs">
                <div className="space-y-1">
                  <p className="text-slate-500 font-bold text-[10px] uppercase">Account Holder</p>
                  <p className="font-extrabold text-slate-900 text-sm">{user.name}</p>
                  <p className="text-slate-600 font-mono">{user.phone}</p>
                  <p className="text-slate-600">{user.email}</p>
                  <p className="text-slate-500 text-[10px]">{user.address}</p>
                </div>

                <div className="space-y-1 sm:text-right">
                  <p className="text-slate-500 font-bold text-[10px] uppercase">Bank Account Details</p>
                  <p className="font-extrabold text-indigo-900 text-sm">{statementModalData.bankName}</p>
                  <p className="text-slate-700 font-mono font-bold">A/C: {statementModalData.accountNo}</p>
                  <p className="text-slate-600 font-mono">IFSC: HDFC0001019</p>
                  <p className="text-slate-500 text-[10px]">Branch: Indiranagar Main, Bengaluru</p>
                </div>
              </div>

              {/* Statement Summary Totals Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center p-3 bg-indigo-900 text-white rounded-xl shadow-xs font-mono">
                <div className="p-2 border-r border-indigo-800">
                  <span className="text-[10px] text-indigo-200 uppercase font-bold block">Opening Balance</span>
                  <span className="text-xs font-extrabold text-white">₹{statementModalData.openingBalance.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-2 border-r border-indigo-800">
                  <span className="text-[10px] text-rose-300 uppercase font-bold block">Total Debits (-)</span>
                  <span className="text-xs font-extrabold text-rose-300">₹{statementModalData.totalDebits.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-2 border-r border-indigo-800">
                  <span className="text-[10px] text-emerald-300 uppercase font-bold block">Total Credits (+)</span>
                  <span className="text-xs font-extrabold text-emerald-300">₹{statementModalData.totalCredits.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-2">
                  <span className="text-[10px] text-amber-300 uppercase font-bold block">Closing Balance</span>
                  <span className="text-xs font-extrabold text-amber-300">₹{statementModalData.closingBalance.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Itemized Transactions Table */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Itemized Transaction Breakdown ({statementModalData.txList.length} Entries)
                </h5>

                <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="p-2.5">Date & Ref</th>
                        <th className="p-2.5">Particulars / Payee</th>
                        <th className="p-2.5 text-center">Type</th>
                        <th className="p-2.5 text-right">Debit (₹)</th>
                        <th className="p-2.5 text-right">Credit (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {statementModalData.txList.map((tx) => {
                        const isOut = tx.type === 'send' || tx.type === 'self_transfer';
                        return (
                          <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-2.5 text-slate-600">
                              <div>{tx.timestamp}</div>
                              <div className="text-[9px] text-slate-400">UTR: {tx.utrNumber}</div>
                            </td>
                            <td className="p-2.5 font-sans font-medium text-slate-800">
                              {tx.recipientName || tx.note || (tx.type === 'self_transfer' ? 'Self Bank Transfer' : 'Bank Transfer')}
                            </td>
                            <td className="p-2.5 text-center">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                  isOut ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {isOut ? 'DR' : 'CR'}
                              </span>
                            </td>
                            <td className="p-2.5 text-right font-bold text-rose-600">
                              {isOut ? `₹${tx.amount.toLocaleString('en-IN')}` : '-'}
                            </td>
                            <td className="p-2.5 text-right font-bold text-emerald-600">
                              {!isOut ? `₹${tx.amount.toLocaleString('en-IN')}` : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Legal & Security Footer */}
              <div className="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">
                  This is a computer-generated bank passbook statement and does not require a physical signature.
                </p>
                <p className="text-slate-400 font-mono">
                  DocPay India Financial Technologies • Regulated by Reserve Bank of India (RBI Guidelines 2026)
                </p>
              </div>

            </div>

            {/* Modal Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleDownloadPdfStatement(statementModalData.monthName)}
                disabled={isGeneratingPdf}
                className="w-full sm:flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-amber-300" />
                <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Official PDF Statement'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>

              <button
                type="button"
                onClick={() => handleEmailStatement(statementModalData.monthName)}
                className="w-full sm:w-auto py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4 text-indigo-600" />
                <span>Email PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* TRANSACTION RECEIPT MODAL */}
      {showReceiptModal && selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 relative text-slate-800 shadow-2xl space-y-5">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-indigo-600">
                <ReceiptText className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-800">Bank Payment e-Receipt</h3>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Content */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 font-sans relative">
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-300">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-black text-slate-900">Payment Completed</h4>
                <p className="text-2xl font-black font-mono text-emerald-600">
                  ₹{selectedTx.amount.toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">UTR: {selectedTx.utrNumber}</p>
              </div>

              {/* Details Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span className="font-medium text-slate-500">Transaction Type:</span>
                  <span className="font-bold uppercase text-slate-800">{selectedTx.type.replace('_', ' ')}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span className="font-medium text-slate-500">From Source Bank:</span>
                  <span className="font-bold text-slate-800">{selectedTx.fromBankName || 'HDFC Bank'}</span>
                </div>

                {selectedTx.toBankName && (
                  <div className="flex justify-between text-slate-600">
                    <span className="font-medium text-slate-500">Destination Account:</span>
                    <span className="font-bold text-slate-800">{selectedTx.toBankName}</span>
                  </div>
                )}

                {selectedTx.recipientName && (
                  <div className="flex justify-between text-slate-600">
                    <span className="font-medium text-slate-500">Beneficiary Name:</span>
                    <span className="font-bold text-slate-800">{selectedTx.recipientName}</span>
                  </div>
                )}

                {selectedTx.recipientUpiOrPhone && (
                  <div className="flex justify-between text-slate-600">
                    <span className="font-medium text-slate-500">Beneficiary UPI / Phone:</span>
                    <span className="font-mono text-slate-800">{selectedTx.recipientUpiOrPhone}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span className="font-medium text-slate-500">Date & Timestamp:</span>
                  <span className="font-mono text-slate-800">{selectedTx.timestamp}</span>
                </div>

                {selectedTx.note && (
                  <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200/80">
                    <span className="font-medium text-slate-500">Note:</span>
                    <span className="font-medium text-slate-800 italic">{selectedTx.note}</span>
                  </div>
                )}
              </div>

              {/* Security Seal Footer */}
              <div className="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Docpay RBI NPCI Encrypted Banking Receipt Token</span>
              </div>
            </div>

            {/* Modal Footer Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  alert(`e-Receipt UTR ${selectedTx.utrNumber} saved to device downloads.`);
                  setShowReceiptModal(false);
                }}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" /> Save Receipt PDF
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* FLOATING SCAN BUTTON WITHIN PAYMENTS MODULE */}
      {onOpenQrScanner && (
        <button
          id="payments-floating-fab-scan"
          onClick={onOpenQrScanner}
          className="fixed bottom-20 right-4 sm:right-6 z-30 group flex items-center gap-2 px-4 py-3.5 rounded-full bg-gradient-to-r from-[#6A1BFF] via-[#7B2CBF] to-[#8E24AA] text-white font-extrabold text-xs shadow-2xl shadow-purple-900/60 ring-4 ring-purple-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Floating Payment QR Scanner"
        >
          <div className="relative">
            <QrCode className="w-5 h-5 text-amber-300 animate-pulse group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="tracking-tight text-white font-extrabold hidden sm:inline">Scan & Pay</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-400 text-slate-950 uppercase">
            UPI
          </span>
        </button>
      )}

    </div>
  );
};
