import React, { useState, useEffect, useMemo } from 'react';
import {
  Repeat,
  Calendar,
  BellRing,
  Zap,
  CreditCard,
  Plus,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Search,
  Check,
  Edit2,
  Trash2,
  ShieldCheck,
  DollarSign,
  ChevronRight,
  ArrowRight,
  X,
  Bell,
  Smartphone,
  Mail,
  ToggleLeft,
  ToggleRight,
  Tv,
  Wifi,
  Flame,
  HeartPulse,
  Sparkles,
} from 'lucide-react';
import { RecurringBill, BankAccount } from '../types';
import { INITIAL_RECURRING_BILLS } from '../mock/initialData';

interface Props {
  bankAccounts?: BankAccount[];
  isPrivacyMode?: boolean;
  onPayBillNow?: (bill: RecurringBill) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Utilities: Flame,
  Entertainment: Tv,
  Health: HeartPulse,
  Services: Wifi,
};

export const RecurringBillManager: React.FC<Props> = ({
  bankAccounts = [],
  isPrivacyMode = false,
  onPayBillNow,
}) => {
  // Persistence in Local Storage
  const [bills, setBills] = useState<RecurringBill[]>(() => {
    try {
      const saved = localStorage.getItem('docpay_recurring_bills');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_RECURRING_BILLS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [autoPayFilter, setAutoPayFilter] = useState<'all' | 'enabled' | 'disabled'>('all');

  // Modal State
  const [selectedBillForEdit, setSelectedBillForEdit] = useState<RecurringBill | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<RecurringBill>>({
    billerName: '',
    category: 'Utilities',
    amount: 1000,
    dueDate: '2026-08-25',
    billingCycle: 'Monthly',
    isAutoPayEnabled: true,
    autoPayBankName: 'HDFC Bank',
    reminderDaysBefore: 3,
    reminderChannel: 'Push & SMS',
    upiIdOrConsumerNo: '',
  });

  // Save to Local Storage on change
  useEffect(() => {
    try {
      localStorage.setItem('docpay_recurring_bills', JSON.stringify(bills));
    } catch {
      // ignore
    }
  }, [bills]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Quick Auto-Pay Toggle Handler
  const handleToggleAutoPay = (id: string) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const newState = !b.isAutoPayEnabled;
          showToast(
            newState
              ? `⚡ Auto-Pay ENABLED for ${b.billerName}. Next bill will be debited automatically.`
              : `⏸️ Auto-Pay DISABLED for ${b.billerName}. Manual approval required.`
          );
          return { ...b, isAutoPayEnabled: newState };
        }
        return b;
      })
    );
  };

  // Pay Now Handler
  const handleMarkAsPaid = (bill: RecurringBill) => {
    setBills((prev) =>
      prev.map((b) =>
        b.id === bill.id
          ? { ...b, status: 'Paid', lastPaidDate: new Date().toISOString().split('T')[0] }
          : b
      )
    );
    showToast(`✅ Payment of ₹${bill.amount.toLocaleString()} to ${bill.billerName} marked as completed!`);
    if (onPayBillNow) {
      onPayBillNow(bill);
    }
  };

  // Add / Edit Bill Form Submit
  const handleSaveBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.billerName || !formData.amount) return;

    if (selectedBillForEdit) {
      // Update
      setBills((prev) =>
        prev.map((b) =>
          b.id === selectedBillForEdit.id
            ? ({
                ...b,
                ...formData,
              } as RecurringBill)
            : b
        )
      );
      showToast(`✨ Settings updated for ${formData.billerName}`);
    } else {
      // Create new
      const newBill: RecurringBill = {
        id: `rec-${Date.now()}`,
        billerName: formData.billerName || 'New Biller',
        category: formData.category || 'Utilities',
        amount: Number(formData.amount) || 500,
        dueDate: formData.dueDate || '2026-08-30',
        billingCycle: (formData.billingCycle as any) || 'Monthly',
        isAutoPayEnabled: formData.isAutoPayEnabled ?? true,
        autoPayBankName: formData.autoPayBankName || 'HDFC Bank',
        reminderDaysBefore: formData.reminderDaysBefore ?? 3,
        reminderChannel: (formData.reminderChannel as any) || 'Push & SMS',
        status: 'Upcoming',
        upiIdOrConsumerNo: formData.upiIdOrConsumerNo || 'bill.pay@upi',
      };
      setBills((prev) => [newBill, ...prev]);
      showToast(`🎉 New recurring subscription ${newBill.billerName} added successfully!`);
    }

    setIsModalOpen(false);
    setSelectedBillForEdit(null);
  };

  const handleOpenEditModal = (bill: RecurringBill) => {
    setSelectedBillForEdit(bill);
    setFormData(bill);
    setIsModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setSelectedBillForEdit(null);
    setFormData({
      billerName: '',
      category: 'Utilities',
      amount: 1200,
      dueDate: '2026-08-28',
      billingCycle: 'Monthly',
      isAutoPayEnabled: true,
      autoPayBankName: bankAccounts[0]?.bankName || 'HDFC Bank',
      reminderDaysBefore: 3,
      reminderChannel: 'Push & SMS',
      upiIdOrConsumerNo: '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteBill = (id: string, name: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
    showToast(`🗑️ Subscription for ${name} removed.`);
  };

  // Computed Stats
  const { totalMonthlyCommitment, autoPayCount, upcomingCount } = useMemo(() => {
    const total = bills.reduce((acc, b) => acc + (b.amount || 0), 0);
    const autoPay = bills.filter((b) => b.isAutoPayEnabled).length;
    const upcoming = bills.filter((b) => b.status === 'Upcoming').length;
    return {
      totalMonthlyCommitment: total,
      autoPayCount: autoPay,
      upcomingCount: upcoming,
    };
  }, [bills]);

  // Filtered List
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const matchesSearch =
        b.billerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.upiIdOrConsumerNo && b.upiIdOrConsumerNo.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = categoryFilter === 'all' || b.category === categoryFilter;
      const matchesAuto =
        autoPayFilter === 'all' ||
        (autoPayFilter === 'enabled' && b.isAutoPayEnabled) ||
        (autoPayFilter === 'disabled' && !b.isAutoPayEnabled);

      return matchesSearch && matchesCat && matchesAuto;
    });
  }, [bills, searchQuery, categoryFilter, autoPayFilter]);

  // Helper calculation for due days countdown
  const getDueCountdownText = (dueDateStr: string) => {
    try {
      const today = new Date('2026-08-09');
      const due = new Date(dueDateStr);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return { label: `Overdue by ${Math.abs(diffDays)} days`, color: 'text-red-600 bg-red-50 border-red-200' };
      if (diffDays === 0) return { label: 'Due Today!', color: 'text-amber-700 bg-amber-50 border-amber-300 font-extrabold animate-pulse' };
      if (diffDays === 1) return { label: 'Due Tomorrow', color: 'text-amber-600 bg-amber-50 border-amber-200' };
      return { label: `Due in ${diffDays} days`, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
    } catch {
      return { label: `Due ${dueDateStr}`, color: 'text-slate-600 bg-slate-100 border-slate-200' };
    }
  };

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

      {/* RECURRING BILLS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Monthly Outflow */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white p-5 rounded-3xl border border-indigo-800/60 shadow-xl relative overflow-hidden">
          <div className="absolute right-3 top-3 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5 text-indigo-400" /> Monthly Commitment
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              {bills.length} Active Bills
            </span>
          </div>
          <div className={`text-2xl font-black font-mono tracking-tight text-white ${isPrivacyMode ? 'filter blur-sm select-none' : ''}`}>
            ₹{totalMonthlyCommitment.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Total automated & scheduled recurring payments per month
          </p>
        </div>

        {/* Auto-Pay Coverage */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Auto-Pay Mandates
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
              {Math.round((autoPayCount / (bills.length || 1)) * 100)}% Automated
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {autoPayCount} / {bills.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Subscriptions linked to direct bank auto-debit
          </p>
        </div>

        {/* Reminders & Alerts */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <BellRing className="w-3.5 h-3.5 text-purple-600" /> Smart Reminders
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
              Active Push & SMS
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {upcomingCount} Upcoming
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Custom alerts trigger 1-7 days prior to due dates
          </p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search biller, category, UPI ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Filters & Add Button */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Utilities">Utilities</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Health">Health</option>
              <option value="Services">Services</option>
            </select>

            {/* Auto-Pay Filter */}
            <select
              value={autoPayFilter}
              onChange={(e) => setAutoPayFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="all">All Auto-Pay</option>
              <option value="enabled">Auto-Pay Enabled</option>
              <option value="disabled">Auto-Pay Disabled</option>
            </select>

            {/* Add Bill Button */}
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Subscription
            </button>
          </div>
        </div>

        {/* BILL CARDS GRID */}
        {filteredBills.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Repeat className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-extrabold text-slate-700 text-sm">No recurring bills found</h4>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {filteredBills.map((bill) => {
              const CategoryIcon = CATEGORY_ICONS[bill.category] || Repeat;
              const dueInfo = getDueCountdownText(bill.dueDate);

              return (
                <div
                  key={bill.id}
                  className={`bg-white border rounded-3xl p-5 transition-all shadow-xs hover:shadow-md relative flex flex-col justify-between ${
                    bill.isAutoPayEnabled
                      ? 'border-indigo-200/80 hover:border-indigo-400'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Top Row: Icon, Biller Name, Due Badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-indigo-600 shadow-2xs">
                          <CategoryIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm leading-tight">
                            {bill.billerName}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {bill.category}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {bill.billingCycle}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Due Date Countdown Tag */}
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border ${dueInfo.color}`}>
                        {dueInfo.label}
                      </span>
                    </div>

                    {/* Middle Details Box */}
                    <div className="bg-slate-50 border border-slate-150 rounded-2xl p-3.5 my-3 space-y-2">
                      {/* Amount & Bank */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">Monthly Amount:</span>
                        <span className={`font-mono font-black text-slate-900 text-base ${isPrivacyMode ? 'filter blur-sm select-none' : ''}`}>
                          ₹{bill.amount.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Due Date */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> Next Due Date:
                        </span>
                        <span className="font-bold text-slate-800">{bill.dueDate}</span>
                      </div>

                      {/* Auto-Pay Account */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" /> Auto-Pay Account:
                        </span>
                        <span className="font-bold text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-100 text-[11px]">
                          {bill.autoPayBankName || 'HDFC Bank'}
                        </span>
                      </div>

                      {/* Reminder Channel */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 flex items-center gap-1">
                          <BellRing className="w-3.5 h-3.5 text-purple-500" /> Reminder:
                        </span>
                        <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 text-[10px]">
                          {bill.reminderDaysBefore} days before ({bill.reminderChannel})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Controls Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Auto-Pay Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleAutoPay(bill.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        bill.isAutoPayEnabled
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                          : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {bill.isAutoPayEnabled ? (
                        <>
                          <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
                          <span>Auto-Pay ON</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Auto-Pay OFF</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      {/* Mark Paid Button */}
                      {bill.status !== 'Paid' && (
                        <button
                          onClick={() => handleMarkAsPaid(bill)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Pay Now
                        </button>
                      )}

                      {/* Configure Button */}
                      <button
                        onClick={() => handleOpenEditModal(bill)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer"
                        title="Configure Settings"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteBill(bill.id, bill.billerName)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all cursor-pointer"
                        title="Remove Subscription"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE / EDIT SUBSCRIPTION & AUTO-PAY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Repeat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {selectedBillForEdit ? 'Configure Subscription Settings' : 'Add Recurring Bill / Subscription'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Set due dates, reminder channels, and automated bank auto-pay
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBill} className="space-y-4">
              {/* Biller Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Biller / Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TSSPDCL, Netflix, Fiber"
                    value={formData.billerName || ''}
                    onChange={(e) => setFormData({ ...formData, billerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category || 'Utilities'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Utilities">Utilities (Electricity, Water, Wifi)</option>
                    <option value="Entertainment">Entertainment (Netflix, Spotify)</option>
                    <option value="Health">Health & Insurance</option>
                    <option value="Services">Services & Subscriptions</option>
                  </select>
                </div>
              </div>

              {/* Amount & Billing Cycle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bill Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Billing Cycle</label>
                  <select
                    value={formData.billingCycle || 'Monthly'}
                    onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>

              {/* Next Due Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Next Payment Due Date</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate || '2026-08-25'}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* AUTO-PAY SETTINGS BOX */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-600 fill-emerald-500" />
                    <span className="text-xs font-extrabold text-emerald-950">
                      Automated Bank Auto-Pay Mandate
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    id="autoPayToggle"
                    checked={formData.isAutoPayEnabled ?? true}
                    onChange={(e) => setFormData({ ...formData, isAutoPayEnabled: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>

                {formData.isAutoPayEnabled && (
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                      Source Bank Account for Auto-Debit
                    </label>
                    <select
                      value={formData.autoPayBankName || 'HDFC Bank'}
                      onChange={(e) => setFormData({ ...formData, autoPayBankName: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-emerald-950 focus:outline-none"
                    >
                      {bankAccounts.length > 0 ? (
                        bankAccounts.map((acc) => (
                          <option key={acc.id} value={acc.bankName}>
                            {acc.bankName} (Acc •••• {acc.accountNumber.slice(-4)})
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="HDFC Bank">HDFC Bank (Acc •••• 1042)</option>
                          <option value="State Bank of India (SBI)">State Bank of India (Acc •••• 8819)</option>
                          <option value="ICICI Bank">ICICI Bank (Acc •••• 3310)</option>
                        </>
                      )}
                    </select>
                  </div>
                )}
              </div>

              {/* REMINDER PREFERENCES BOX */}
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-purple-950 font-extrabold text-xs">
                  <BellRing className="w-4 h-4 text-purple-600" />
                  <span>Push & Notification Reminder Preferences</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-purple-900 mb-1">
                      Remind Me Before Due Date
                    </label>
                    <select
                      value={formData.reminderDaysBefore ?? 3}
                      onChange={(e) => setFormData({ ...formData, reminderDaysBefore: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded-xl text-xs font-medium text-purple-950 focus:outline-none"
                    >
                      <option value={1}>1 Day Before</option>
                      <option value={2}>2 Days Before</option>
                      <option value={3}>3 Days Before</option>
                      <option value={5}>5 Days Before</option>
                      <option value={7}>7 Days Before</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-purple-900 mb-1">
                      Notification Channel
                    </label>
                    <select
                      value={formData.reminderChannel || 'Push & SMS'}
                      onChange={(e) => setFormData({ ...formData, reminderChannel: e.target.value as any })}
                      className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded-xl text-xs font-medium text-purple-950 focus:outline-none"
                    >
                      <option value="Push & SMS">Push & SMS Alert</option>
                      <option value="Push Only">App Push Only</option>
                      <option value="Email & Push">Email & Push</option>
                      <option value="Off">Disable Reminders</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Consumer / UPI ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Consumer Number / Biller UPI ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 108429104 or biller@icici"
                  value={formData.upiIdOrConsumerNo || ''}
                  onChange={(e) => setFormData({ ...formData, upiIdOrConsumerNo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Save Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
