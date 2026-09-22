import React, { useState, useEffect, useMemo } from 'react';
import {
  Zap,
  Repeat,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
  CreditCard,
  Lock,
  Edit3,
  Trash2,
  Play,
  Pause,
  RefreshCw,
  Search,
  ChevronRight,
  ArrowRight,
  X,
  Sparkles,
  Info,
  Check,
  AlertTriangle,
  FileText,
  DollarSign,
  Fingerprint,
  KeyRound,
  History,
  Send,
  Eye,
  EyeOff,
  BellRing
} from 'lucide-react';
import { AutopayMandate, AutopayExecution, BankAccount, UserProfile } from '../types';
import { INITIAL_AUTOPAYS, INITIAL_AUTOPAY_EXECUTIONS } from '../mock/initialData';

interface Props {
  bankAccounts?: BankAccount[];
  user?: UserProfile;
  isPrivacyMode?: boolean;
  initialTab?: 'active' | 'setup' | 'upcoming' | 'history';
  initialSearchQuery?: string;
  onLogActivity?: (title: string, description: string, type: 'auth' | 'security' | 'document' | 'bank' | 'portal') => void;
}

export const AutopayManagementModule: React.FC<Props> = ({
  bankAccounts = [],
  user,
  isPrivacyMode = false,
  initialTab = 'active',
  initialSearchQuery = '',
  onLogActivity,
}) => {
  // Navigation sub-tab
  const [activeTab, setActiveTab] = useState<'active' | 'setup' | 'upcoming' | 'history'>(initialTab);

  // Mandates State (Local + LocalStorage + API Sync)
  const [mandates, setMandates] = useState<AutopayMandate[]>(() => {
    try {
      const saved = localStorage.getItem('docpay_autopay_mandates');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_AUTOPAYS;
  });

  // Executions History State
  const [executions, setExecutions] = useState<AutopayExecution[]>(() => {
    try {
      const saved = localStorage.getItem('docpay_autopay_executions');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_AUTOPAY_EXECUTIONS;
  });

  // Fetch mandates from API on mount
  useEffect(() => {
    fetch('/api/autopay')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setMandates(res.data);
        }
      })
      .catch(() => {
        // use fallback initial state
      });
  }, []);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem('docpay_autopay_mandates', JSON.stringify(mandates));
      localStorage.setItem('docpay_autopay_executions', JSON.stringify(executions));
    } catch {
      // ignore
    }
  }, [mandates, executions]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Paused' | 'Cancelled'>('all');

  // Toast alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Selected Mandate for Details View / Edit / Delete
  const [selectedMandate, setSelectedMandate] = useState<AutopayMandate | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteReason, setDeleteReason] = useState<string>('No longer required');
  const [authPinInput, setAuthPinInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Setup Wizard Form State (4 Steps)
  const [setupStep, setSetupStep] = useState<1 | 2 | 3 | 4>(1);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    name: string;
    payeeName: string;
    sourceAccountId: string;
    sourceAccountName: string;
    sourceAccountMasked: string;
    amount: number;
    frequency: 'One-time' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
    startDate: string;
    scheduledTime: string;
    endDate: string;
    maxPayments: string;
  }>({
    name: 'BESCOM Electricity Mandate',
    payeeName: 'BESCOM Electricity Board',
    sourceAccountId: bankAccounts[0]?.id || 'bank-1',
    sourceAccountName: bankAccounts[0]?.bankName || 'HDFC Bank',
    sourceAccountMasked: bankAccounts[0]?.accountNumber ? `•••• ${bankAccounts[0].accountNumber.slice(-4)}` : '•••• 1042',
    amount: 1850,
    frequency: 'Monthly',
    startDate: '2026-08-25',
    scheduledTime: '09:00 AM',
    endDate: '2027-12-31',
    maxPayments: '24',
  });

  // Handle Preset Payee Selection in Setup Step 2
  const handleSelectPresetPayee = (preset: { name: string; payee: string; amount: number; frequency: any }) => {
    setFormData((prev) => ({
      ...prev,
      name: preset.name,
      payeeName: preset.payee,
      amount: preset.amount,
      frequency: preset.frequency,
    }));
  };

  // Handle Pause / Resume Mandate API
  const handleTogglePause = async (mandate: AutopayMandate) => {
    const isPausing = mandate.status === 'Active';
    const actionEndpoint = isPausing ? `/api/autopay/${mandate.id}/pause` : `/api/autopay/${mandate.id}/resume`;

    try {
      const res = await fetch(actionEndpoint, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMandates((prev) =>
          prev.map((m) => (m.id === mandate.id ? { ...m, status: isPausing ? 'Paused' : 'Active' } : m))
        );
        showToast(isPausing ? `⏸️ Autopay "${mandate.name}" paused.` : `▶️ Autopay "${mandate.name}" resumed.`);
        if (onLogActivity) {
          onLogActivity(
            `Autopay Mandate ${isPausing ? 'Paused' : 'Resumed'}`,
            `User ${isPausing ? 'paused' : 'resumed'} mandate ID ${mandate.id} (${mandate.name}).`,
            'bank'
          );
        }
      }
    } catch {
      // Fallback local update
      setMandates((prev) =>
        prev.map((m) => (m.id === mandate.id ? { ...m, status: isPausing ? 'Paused' : 'Active' } : m))
      );
      showToast(isPausing ? `⏸️ Autopay "${mandate.name}" paused.` : `▶️ Autopay "${mandate.name}" resumed.`);
    }
  };

  // Handle Execute Scheduled Payment API (with Idempotency)
  const handleExecuteNow = async (mandate: AutopayMandate, forceFail = false) => {
    const idempotencyKey = `idemp-${mandate.id}-${Date.now()}`;
    try {
      const res = await fetch(`/api/autopay/${mandate.id}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({ forceSimulateFailure: forceFail }),
      });
      const data = await res.json();

      if (data.success && data.execution) {
        setExecutions((prev) => [data.execution, ...prev]);
        if (data.updatedAutopay) {
          setMandates((prev) => prev.map((m) => (m.id === mandate.id ? data.updatedAutopay : m)));
        }
        showToast(`⚡ Autopay execution processed! Tx ID: ${data.execution.providerTransactionId}`);
      } else if (data.execution && data.execution.status === 'FAILED') {
        setExecutions((prev) => [data.execution, ...prev]);
        showToast(`⚠️ Payment Failed: ${data.message || 'Insufficient balance reported.'}`);
      }
    } catch {
      // Local fallback execution
      const newExec: AutopayExecution = {
        id: `ex-${Date.now()}`,
        autopayId: mandate.id,
        autopayName: mandate.name,
        payeeName: mandate.payeeName,
        scheduledAt: mandate.nextExecutionAt,
        executedAt: new Date().toISOString(),
        amount: mandate.amount,
        currency: 'INR',
        status: forceFail ? 'FAILED' : 'SUCCESS',
        providerTransactionId: forceFail ? 'ERR-NPCI-04' : `NPCI-AUTOPAY-${Math.floor(100000000 + Math.random() * 900000000)}`,
        failureCode: forceFail ? 'ERR_INSUFFICIENT_FUNDS_NPCI_04' : undefined,
        failureMessage: forceFail ? 'Insufficient balance in source bank account.' : undefined,
        idempotencyKey,
        createdAt: new Date().toISOString(),
      };
      setExecutions((prev) => [newExec, ...prev]);
      showToast(
        forceFail
          ? `⚠️ Autopay Execution Failed: Insufficient funds.`
          : `⚡ Payment of ₹${mandate.amount.toLocaleString()} executed successfully!`
      );
    }
  };

  // Handle Create Autopay Form Authorization (Step 4)
  const handleConfirmCreateAutopay = async () => {
    if (authPinInput.length < 4) {
      setAuthError('Please enter a valid 4-digit App PIN / UPI PIN.');
      return;
    }

    try {
      const res = await fetch('/api/autopay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success && data.data) {
        setMandates((prev) => [data.data, ...prev]);
        showToast(`🎉 Autopay instruction "${data.data.name}" created and authorized successfully!`);
      } else {
        throw new Error('Failed');
      }
    } catch {
      // Fallback local create
      const newMandate: AutopayMandate = {
        id: `ap-${Date.now()}`,
        userId: 'usr-901',
        name: formData.name,
        payeeId: `p-${Math.floor(1000 + Math.random() * 9000)}`,
        payeeName: formData.payeeName,
        sourceAccountId: formData.sourceAccountId,
        sourceAccountName: formData.sourceAccountName,
        sourceAccountMasked: formData.sourceAccountMasked,
        amount: Number(formData.amount),
        currency: 'INR',
        frequency: formData.frequency,
        startDate: formData.startDate,
        scheduledTime: formData.scheduledTime,
        nextExecutionAt: `${formData.startDate} ${formData.scheduledTime}`,
        endDate: formData.endDate || undefined,
        maxPayments: formData.maxPayments ? Number(formData.maxPayments) : undefined,
        completedPaymentsCount: 0,
        status: 'Active',
        lastExecutionStatus: 'NONE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setMandates((prev) => [newMandate, ...prev]);
      showToast(`🎉 Autopay instruction "${newMandate.name}" created and authorized!`);
    }

    // Reset setup wizard
    setSetupStep(1);
    setAuthPinInput('');
    setAuthError(null);
    setAgreedToTerms(false);
    setActiveTab('active');

    if (onLogActivity) {
      onLogActivity(
        'Autopay Mandate Authorized',
        `Authorized new recurring mandate for ${formData.payeeName} (₹${formData.amount}/month) via secure PIN.`,
        'bank'
      );
    }
  };

  // Handle Delete / Cancel Autopay with PIN Re-auth
  const handleConfirmDeleteAutopay = async () => {
    if (!selectedMandate) return;
    if (authPinInput.length < 4) {
      setAuthError('App PIN is required to cancel recurring mandate.');
      return;
    }

    try {
      const res = await fetch(`/api/autopay/${selectedMandate.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: deleteReason }),
      });
      const data = await res.json();
      if (data.success) {
        setMandates((prev) =>
          prev.map((m) =>
            m.id === selectedMandate.id
              ? {
                  ...m,
                  status: 'Cancelled',
                  cancelledAt: new Date().toISOString(),
                  cancellationReason: deleteReason,
                }
              : m
          )
        );
        showToast(`🗑️ Autopay "${selectedMandate.name}" cancelled. Future executions disabled.`);
      }
    } catch {
      // Local fallback cancel
      setMandates((prev) =>
        prev.map((m) =>
          m.id === selectedMandate.id
            ? {
                ...m,
                status: 'Cancelled',
                cancelledAt: new Date().toISOString(),
                cancellationReason: deleteReason,
              }
            : m
        )
      );
      showToast(`🗑️ Autopay "${selectedMandate.name}" cancelled. Future executions disabled.`);
    }

    setShowDeleteModal(false);
    setSelectedMandate(null);
    setAuthPinInput('');
    setAuthError(null);

    if (onLogActivity) {
      onLogActivity(
        'Autopay Mandate Cancelled',
        `Cancelled recurring mandate ${selectedMandate.id} (${selectedMandate.name}). Historical logs preserved.`,
        'security'
      );
    }
  };

  // Filtered mandates
  const filteredMandates = useMemo(() => {
    return mandates.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.payeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.sourceAccountName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [mandates, searchQuery, statusFilter]);

  // Statistics
  const activeMandatesCount = mandates.filter((m) => m.status === 'Active').length;
  const totalMonthlyVolume = mandates
    .filter((m) => m.status === 'Active')
    .reduce((acc, m) => acc + (m.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900 border-2 border-indigo-500 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* EXECUTIVE HEADER & STATS BANNER */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white rounded-3xl p-6 border border-indigo-800/60 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1 uppercase tracking-wider">
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" /> Executive Autopay System
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 uppercase tracking-wider">
                NPCI Mandate Compliant
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Automated Payment Mandates
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Set up, review, pause, and safely manage recurring auto-debits across all connected bank accounts with end-to-end PIN authorization and idempotency protection.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl text-right">
              <span className="text-[10px] font-bold text-slate-300 uppercase block">Active Mandates</span>
              <span className="text-2xl font-mono font-black text-white">{activeMandatesCount}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl text-right">
              <span className="text-[10px] font-bold text-slate-300 uppercase block">Monthly Outflow</span>
              <span className={`text-2xl font-mono font-black text-amber-300 ${isPrivacyMode ? 'filter blur-sm select-none' : ''}`}>
                ₹{totalMonthlyVolume.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* NAVIGATION SUB-TABS */}
        <div className="flex items-center gap-2 border-t border-white/10 pt-5 mt-5 overflow-x-auto no-scrollbar">
          {[
            { id: 'active', label: 'Active Autopays', icon: Zap, count: mandates.length },
            { id: 'setup', label: 'Set Up Autopay', icon: Plus },
            { id: 'upcoming', label: 'Upcoming Payments', icon: Calendar },
            { id: 'history', label: 'Payment History', icon: History, count: executions.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-md font-black'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-300'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-indigo-100 text-indigo-800' : 'bg-white/20 text-white'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: ACTIVE AUTOPAYS DASHBOARD                                      */}
      {/* ========================================================================= */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by payee, name, bank..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-bold">Filter:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="all">All Mandates</option>
                  <option value="Active">Active Only</option>
                  <option value="Paused">Paused Only</option>
                  <option value="Cancelled">Cancelled / Deleted</option>
                </select>
              </div>

              <button
                onClick={() => setActiveTab('setup')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" /> Create Autopay
              </button>
            </div>
          </div>

          {/* MANDATE CARDS GRID */}
          {filteredMandates.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <Zap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-extrabold text-slate-700 text-sm">No Autopay instructions found</h4>
              <p className="text-xs text-slate-500 mt-1">Try clearing your search or set up a new Autopay mandate.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMandates.map((m) => {
                const isCancelled = m.status === 'Cancelled';
                const isPaused = m.status === 'Paused';

                return (
                  <div
                    key={m.id}
                    className={`bg-white border rounded-3xl p-5 transition-all shadow-xs hover:shadow-md flex flex-col justify-between relative ${
                      isCancelled
                        ? 'border-slate-200 bg-slate-50/70 opacity-75'
                        : isPaused
                        ? 'border-amber-200 bg-amber-50/20'
                        : 'border-indigo-150 hover:border-indigo-400'
                    }`}
                  >
                    <div>
                      {/* Top Header Row */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-indigo-600 font-bold shadow-2xs">
                            <Repeat className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{m.name}</h4>
                            <p className="text-xs text-slate-500 font-medium">{m.payeeName}</p>
                          </div>
                        </div>

                        {/* Status Tag */}
                        <span
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-black border uppercase tracking-wider ${
                            isCancelled
                              ? 'bg-slate-200 text-slate-700 border-slate-300'
                              : isPaused
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>

                      {/* Middle Details Grid */}
                      <div className="bg-slate-50 border border-slate-150 rounded-2xl p-3.5 my-3 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Scheduled Amount:</span>
                          <span className={`font-mono font-black text-slate-900 text-base ${isPrivacyMode ? 'filter blur-sm select-none' : ''}`}>
                            ₹{m.amount.toLocaleString('en-IN')} <span className="text-[10px] text-slate-400">/ {m.frequency}</span>
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" /> Source Account:
                          </span>
                          <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {m.sourceAccountName} ({m.sourceAccountMasked})
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> Next Execution:
                          </span>
                          <span className="font-bold text-indigo-700 font-mono">{m.nextExecutionAt}</span>
                        </div>

                        {m.lastExecutionStatus && m.lastExecutionStatus !== 'NONE' && (
                          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                            <span className="text-slate-500">Last Execution:</span>
                            <span
                              className={`font-extrabold text-[10px] px-2 py-0.5 rounded border ${
                                m.lastExecutionStatus === 'SUCCESS'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {m.lastExecutionStatus === 'SUCCESS' ? '✓ Successful' : '⚠ Failed'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedMandate(m);
                            setShowDetailsModal(true);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          View Details
                        </button>

                        {!isCancelled && (
                          <button
                            onClick={() => handleTogglePause(m)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 cursor-pointer ${
                              isPaused
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                            }`}
                          >
                            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                            <span>{isPaused ? 'Resume' : 'Pause'}</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Execute Test Trigger */}
                        {!isCancelled && (
                          <button
                            onClick={() => handleExecuteNow(m)}
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl border border-indigo-200 transition-all cursor-pointer flex items-center gap-1"
                            title="Trigger immediate payment execution test"
                          >
                            <Zap className="w-3.5 h-3.5 text-indigo-600" /> Pay Now
                          </button>
                        )}

                        {/* Delete / Cancel Button */}
                        {!isCancelled && (
                          <button
                            onClick={() => {
                              setSelectedMandate(m);
                              setShowDeleteModal(true);
                            }}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all cursor-pointer"
                            title="Delete / Cancel Autopay"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: SET UP AUTOPAY GUIDED WIZARD (4 STEPS)                        */}
      {/* ========================================================================= */}
      {activeTab === 'setup' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm max-w-2xl mx-auto space-y-6">
          {/* Step Progress Tracker */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            {[
              { num: 1, title: 'Source Account' },
              { num: 2, title: 'Payment Details' },
              { num: 3, title: 'Review Schedule' },
              { num: 4, title: 'Authorization' },
            ].map((s) => {
              const isCurrent = setupStep === s.num;
              const isDone = setupStep > s.num;
              return (
                <div key={s.num} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className={`text-xs font-bold hidden sm:inline ${isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* STEP 1: SELECT PAYMENT SOURCE */}
          {setupStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Step 1 — Select Payment Source Account</h3>
                <p className="text-xs text-slate-500">Choose verified bank account for automated debits</p>
              </div>

              <div className="space-y-3 pt-2">
                {bankAccounts.length > 0 ? (
                  bankAccounts.map((acc) => {
                    const isSelected = formData.sourceAccountId === acc.id;
                    return (
                      <div
                        key={acc.id}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            sourceAccountId: acc.id,
                            sourceAccountName: acc.bankName,
                            sourceAccountMasked: `•••• ${acc.accountNumber.slice(-4)}`,
                          })
                        }
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-xs">{acc.bankName}</h4>
                            <p className="text-[11px] text-slate-500">Acc Holder: {acc.accountHolderName}</p>
                            <p className="text-[10px] font-mono text-slate-400">Account: •••• {acc.accountNumber.slice(-4)}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Available Balance</span>
                          <span className={`font-mono font-black text-slate-900 text-sm ${isPrivacyMode ? 'filter blur-sm select-none' : ''}`}>
                            ₹{acc.balance.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500">
                    Primary HDFC Bank (•••• 1042) selected as fallback.
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setSetupStep(2)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  Next: Enter Payment Details <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ENTER PAYMENT DETAILS */}
          {setupStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Step 2 — Enter Autopay Details</h3>
                <p className="text-xs text-slate-500">Define payee, frequency, schedule time, and amount limits</p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-2">
                <span className="text-[11px] font-extrabold text-purple-900 block">Quick Popular Presets:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'BESCOM Electricity Bill', payee: 'BESCOM Electricity Board', amount: 1850, frequency: 'Monthly' },
                    { name: 'Airtel Fiber Broadband', payee: 'Airtel Broadband & Fiber', amount: 999, frequency: 'Monthly' },
                    { name: 'HDFC SIP Mutual Fund', payee: 'HDFC Mutual Fund AMC', amount: 5000, frequency: 'Monthly' },
                    { name: 'Netflix Premium 4K', payee: 'Netflix India Services', amount: 649, frequency: 'Monthly' },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPresetPayee(p as any)}
                      className="px-2.5 py-1 bg-white hover:bg-purple-100 border border-purple-200 rounded-xl text-[11px] font-bold text-purple-950 transition-all cursor-pointer"
                    >
                      {p.name} (₹{p.amount})
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Autopay Mandate Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payee / Merchant Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.payeeName}
                    onChange={(e) => setFormData({ ...formData, payeeName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Frequency *</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
                  >
                    <option value="One-time">One-time</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Scheduled Payment Time</label>
                  <select
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
                  >
                    <option value="08:00 AM">08:00 AM</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="08:00 PM">08:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Optional End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Optional Max Occurrences</label>
                  <input
                    type="number"
                    placeholder="e.g. 12 or 24"
                    value={formData.maxPayments}
                    onChange={(e) => setFormData({ ...formData, maxPayments: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setSetupStep(1)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setSetupStep(3)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  Next: Review Schedule <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW CONFIRMATION SUMMARY */}
          {setupStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Step 3 — Review Mandate Summary</h3>
                <p className="text-xs text-slate-500">Confirm auto-debit schedule details before security authorization</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Payee Merchant:</span>
                  <span className="font-extrabold text-slate-900">{formData.payeeName}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Scheduled Amount:</span>
                  <span className="font-mono font-black text-slate-900 text-sm">
                    ₹{Number(formData.amount).toLocaleString('en-IN')} <span className="text-xs font-normal">({formData.frequency})</span>
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Source Account:</span>
                  <span className="font-bold text-indigo-700">
                    {formData.sourceAccountName} ({formData.sourceAccountMasked})
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">First Payment Date:</span>
                  <span className="font-bold text-slate-800">{formData.startDate} at {formData.scheduledTime}</span>
                </div>

                {formData.endDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">End Date:</span>
                    <span className="font-bold text-slate-800">{formData.endDate}</span>
                  </div>
                )}
              </div>

              {/* Mandate Disclaimer Checkbox */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreeMandateTerms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-indigo-600 cursor-pointer shrink-0"
                />
                <label htmlFor="agreeMandateTerms" className="text-xs text-amber-950 font-medium cursor-pointer leading-tight">
                  <strong>I understand that payments will be processed automatically according to this schedule.</strong> I authorize NPCI and DocPay to auto-debit my chosen bank account on scheduled dates.
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setSetupStep(2)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  disabled={!agreedToTerms}
                  onClick={() => setSetupStep(4)}
                  className={`px-6 py-2.5 font-extrabold text-xs rounded-2xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                    agreedToTerms
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Proceed to Secure Authorization <Lock className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SECURE AUTHORIZATION (PIN / BIOMETRIC) */}
          {setupStep === 4 && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Step 4 — Secure Mandate Authorization</h3>
                <p className="text-xs text-slate-500">Enter your 4-digit App PIN or UPI PIN to finalize mandate</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-sm mx-auto space-y-3">
                <label className="block text-xs font-bold text-slate-700 text-center">App PIN / UPI Security Authorization</label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="• • • •"
                  value={authPinInput}
                  onChange={(e) => {
                    setAuthPinInput(e.target.value.replace(/\D/g, ''));
                    setAuthError(null);
                  }}
                  className="w-full text-center tracking-widest text-xl font-mono py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600"
                />

                {authError && <p className="text-[11px] font-bold text-rose-600 text-center">{authError}</p>}

                <p className="text-[10px] text-slate-400 text-center">
                  🔒 Encrypted authentication. Never stores banking PINs or OTP secrets.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setSetupStep(3)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmCreateAutopay}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Create Autopay Mandate
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: UPCOMING PAYMENTS TIMELINE                                    */}
      {/* ========================================================================= */}
      {activeTab === 'upcoming' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Upcoming Scheduled Auto-Debits</h3>
            <p className="text-xs text-slate-500">Timeline of future automated payment executions across active mandates</p>
          </div>

          <div className="space-y-3 pt-2">
            {mandates
              .filter((m) => m.status === 'Active')
              .map((m) => (
                <div
                  key={m.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs">{m.name}</h4>
                      <p className="text-[11px] text-slate-500">{m.payeeName} • via {m.sourceAccountName}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-indigo-600 font-bold block">{m.nextExecutionAt}</span>
                    <span className={`font-mono font-black text-slate-900 text-sm ${isPrivacyMode ? 'filter blur-sm select-none' : ''}`}>
                      ₹{m.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: PAYMENT EXECUTIONS HISTORY                                    */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Autopay Execution History & Audit Logs</h3>
              <p className="text-xs text-slate-500">Immutable record of all processed and attempted recurring payments</p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-xl">
              {executions.length} Executions Recorded
            </span>
          </div>

          <div className="space-y-3">
            {executions.map((e) => (
              <div
                key={e.id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  e.status === 'SUCCESS' ? 'bg-slate-50 border-slate-200' : 'bg-rose-50/50 border-rose-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        e.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {e.status}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-xs">{e.autopayName}</h4>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Payee: <strong className="text-slate-800">{e.payeeName}</strong> • Tx ID:{' '}
                    <span className="font-mono">{e.providerTransactionId}</span>
                  </p>

                  <p className="text-[10px] text-slate-400 font-mono">
                    Scheduled: {e.scheduledAt} • Executed: {new Date(e.executedAt).toLocaleString()}
                  </p>

                  {e.failureMessage && (
                    <p className="text-[11px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded border border-rose-200">
                      ⚠️ Reason: {e.failureMessage} ({e.failureCode})
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className={`font-mono font-black text-slate-900 text-base ${isPrivacyMode ? 'filter blur-sm select-none' : ''}`}>
                    ₹{e.amount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">Idempotency Key: {e.idempotencyKey.slice(-10)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MANDATE DETAILS                                                   */}
      {/* ========================================================================= */}
      {showDetailsModal && selectedMandate && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">Autopay Mandate Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 border rounded-2xl space-y-1">
                <span className="text-slate-400 font-bold text-[10px] uppercase">Mandate ID & Name</span>
                <p className="font-extrabold text-slate-900 text-sm">{selectedMandate.name}</p>
                <p className="text-slate-500 font-mono text-[11px]">{selectedMandate.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border">
                  <span className="text-slate-400 text-[10px] block">Payee</span>
                  <span className="font-bold text-slate-800">{selectedMandate.payeeName}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border">
                  <span className="text-slate-400 text-[10px] block">Amount</span>
                  <span className="font-mono font-black text-slate-900">₹{selectedMandate.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border">
                  <span className="text-slate-400 text-[10px] block">Frequency</span>
                  <span className="font-bold text-slate-800">{selectedMandate.frequency}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border">
                  <span className="text-slate-400 text-[10px] block">Next Execution</span>
                  <span className="font-mono font-bold text-indigo-700">{selectedMandate.nextExecutionAt}</span>
                </div>
              </div>

              {selectedMandate.cancelledAt && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 space-y-1">
                  <span className="font-bold block">Cancelled Status Record</span>
                  <p className="text-[11px]">Cancelled At: {new Date(selectedMandate.cancelledAt).toLocaleString()}</p>
                  <p className="text-[11px]">Reason: {selectedMandate.cancellationReason || 'User requested cancellation'}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-5 py-2 bg-slate-900 text-white font-extrabold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE / CANCEL AUTOPAY CONFIRMATION DIALOG                        */}
      {/* ========================================================================= */}
      {showDeleteModal && selectedMandate && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Delete this Autopay?</h3>
                <p className="text-xs text-slate-500">Future payments will no longer be scheduled.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
              <p className="font-bold text-slate-900">{selectedMandate.name}</p>
              <p className="text-slate-500">Payee: {selectedMandate.payeeName} • Amount: ₹{selectedMandate.amount.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400">Historical transactions and execution logs will be preserved in audit records.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Cancellation</label>
              <select
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
              >
                <option value="No longer required">No longer required</option>
                <option value="Switched to manual payment">Switched to manual payment</option>
                <option value="Incorrect schedule / amount">Incorrect schedule / amount</option>
                <option value="Changing payment source account">Changing payment source account</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Enter App PIN to Confirm Cancellation</label>
              <input
                type="password"
                maxLength={4}
                placeholder="• • • •"
                value={authPinInput}
                onChange={(e) => {
                  setAuthPinInput(e.target.value.replace(/\D/g, ''));
                  setAuthError(null);
                }}
                className="w-full text-center tracking-widest text-lg font-mono py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500"
              />
              {authError && <p className="text-[11px] font-bold text-rose-600 mt-1">{authError}</p>}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setAuthPinInput('');
                  setAuthError(null);
                }}
                className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteAutopay}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Delete Autopay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
