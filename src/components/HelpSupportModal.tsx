import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Clock,
  PhoneCall,
  MessageSquare,
  ShieldAlert,
  Search,
  ArrowRight,
  Send,
  Sparkles
} from 'lucide-react';
import { UserProfile, BankAccount } from '../types';

interface Props {
  user: UserProfile;
  banks: BankAccount[];
  onClose: () => void;
  onLogActivity: (
    title: string,
    description: string,
    type: 'auth' | 'security' | 'document' | 'bank' | 'portal'
  ) => void;
}

export const HelpSupportModal: React.FC<Props> = ({
  user,
  banks,
  onClose,
  onLogActivity,
}) => {
  const [activeTab, setActiveTab] = useState<'refund' | 'status' | 'faq' | 'contact'>('refund');
  
  // Refund Form State
  const [utrNumber, setUtrNumber] = useState('');
  const [wrongRecipient, setWrongRecipient] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [selectedBank, setSelectedBank] = useState(banks[0]?.bankName || 'HDFC Bank');
  const [disputeReason, setDisputeReason] = useState('Paid to wrong UPI ID / Phone');
  const [refundStatus, setRefundStatus] = useState<null | 'submitting' | 'submitted'>(null);
  const [ticketId, setTicketId] = useState('');

  // Sample Filed Tickets
  const [filedTickets, setFiledTickets] = useState([
    {
      id: 'DISP-892014',
      utr: 'UTR608021820491',
      recipient: 'suresh.mistake@upi',
      amount: '₹2,500.00',
      date: '2026-08-04',
      status: 'In Progress (NPCI Review)',
      step: 2,
    }
  ]);

  const handleFileRefundDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber || !amountPaid || !wrongRecipient) {
      alert('Please fill in all transaction details');
      return;
    }

    setRefundStatus('submitting');
    setTimeout(() => {
      const genId = `DISP-${Math.floor(100000 + Math.random() * 900000)}`;
      setTicketId(genId);
      setFiledTickets((prev) => [
        {
          id: genId,
          utr: utrNumber,
          recipient: wrongRecipient,
          amount: `₹${parseFloat(amountPaid).toLocaleString('en-IN')}.00`,
          date: new Date().toISOString().split('T')[0],
          status: 'Submitted & Sent to Recipient Bank',
          step: 1,
        },
        ...prev
      ]);
      setRefundStatus('submitted');
      onLogActivity(
        'Wrong Payment Refund Raised',
        `Dispute ticket ${genId} filed for UTR ${utrNumber} (Amount: ₹${amountPaid})`,
        'bank'
      );
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <RotateCcw className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">Wrong Payment Refund & Helpline</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  NPCI 24x7 Guarantee
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Paid money to the wrong person or untrusted merchant? Instant dispute reversal.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('refund')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'refund'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <RotateCcw className="w-4 h-4" /> Request Refund
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'status'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-4 h-4" /> Claim Tracker ({filedTickets.length})
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'faq'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <HelpCircle className="w-4 h-4" /> RBI Rules & FAQs
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* TAB 1: FILE REFUND DISPUTE */}
          {activeTab === 'refund' && (
            <div className="space-y-5">
              
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-emerald-300">RBI & NPCI Wrong Pay Reversal Policy</p>
                  <p className="text-slate-300 leading-relaxed">
                    If money was transferred to an incorrect UPI ID / Bank Account by mistake, as per RBI guidelines,
                    your bank initiates auto-hold with the recipient bank within 24 to 48 hours.
                  </p>
                </div>
              </div>

              {refundStatus === 'submitted' ? (
                <div className="py-8 text-center space-y-4 bg-slate-950/60 border border-emerald-500/40 rounded-2xl p-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-white">Refund Dispute Ticket Created!</h4>
                    <p className="text-xs font-mono text-emerald-400 mt-1">Ticket Reference: {ticketId}</p>
                  </div>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    We have dispatched an official lock notice to the recipient bank for UTR <span className="font-mono text-amber-300">{utrNumber}</span>.
                    You can track your refund progress under "Claim Tracker".
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => setRefundStatus(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
                    >
                      File Another Dispute
                    </button>
                    <button
                      onClick={() => setActiveTab('status')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
                    >
                      View Claim Tracker
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFileRefundDispute} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        12-Digit UTR / Transaction Ref No. *
                      </label>
                      <input
                        type="text"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        placeholder="e.g. UTR608051430912"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Amount Paid (₹) *
                      </label>
                      <input
                        type="number"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        placeholder="e.g. 2500"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Wrong Recipient UPI ID or Mobile Number *
                      </label>
                      <input
                        type="text"
                        value={wrongRecipient}
                        onChange={(e) => setWrongRecipient(e.target.value)}
                        placeholder="e.g. wrongperson@okicici or 9876543210"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Debited Bank Account *
                      </label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        {banks.map((b) => (
                          <option key={b.id} value={b.bankName}>
                            {b.bankName} ({b.accountNumberMasked})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Reason for Dispute / Refund *
                    </label>
                    <select
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Paid to wrong UPI ID / Phone">Paid to wrong UPI ID or mistyped number</option>
                      <option value="Double Debit Error">Amount debited twice for same transaction</option>
                      <option value="Money Deducted but Merchant Failed">Money deducted but merchant payment failed</option>
                      <option value="Fraudulent QR Scan Request">Scammed by fake merchant QR code</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={refundStatus === 'submitting'}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all"
                  >
                    {refundStatus === 'submitting' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Filing Legal Dispute with Recipient Bank...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Wrong Payment Refund Claim</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* 24x7 Emergency Hotline Bar */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">24x7 Banking Ombudsman Helpline</span>
                    <span className="text-slate-400 text-[11px]">Direct toll-free escalation: 1800-120-1907 / 1800-425-0000</span>
                  </div>
                </div>
                <a
                  href="tel:18001201907"
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shrink-0"
                >
                  Call Toll-Free
                </a>
              </div>

            </div>
          )}

          {/* TAB 2: CLAIM TRACKER */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-200">Active Refund Dispute Cases</h4>
              {filedTickets.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No dispute cases filed yet.</p>
              ) : (
                filedTickets.map((t) => (
                  <div key={t.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">{t.id}</span>
                        <h5 className="font-bold text-sm text-white">{t.amount} Refund Claim</h5>
                        <p className="text-[11px] text-slate-400 font-mono">UTR: {t.utr} • To: {t.recipient}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                        {t.status}
                      </span>
                    </div>

                    {/* Timeline Progress */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Dispute Filed</span>
                        <span>Bank Notice</span>
                        <span>NPCI Review</span>
                        <span>Refund Credit</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${t.step * 25 + 25}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: FAQS */}
          {activeTab === 'faq' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <h5 className="font-bold text-amber-400">What happens if I send money to the wrong UPI ID?</h5>
                <p className="text-slate-300 leading-relaxed">
                  As per RBI guidelines issued in 2024, the remitter bank informs the destination bank immediately upon dispute filing. The destination bank freezes the transferred amount in the recipient's account pending verification.
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <h5 className="font-bold text-amber-400">How long does the refund process take?</h5>
                <p className="text-slate-300 leading-relaxed">
                  Standard UPI refund resolution takes between 24 hours to 3 business days depending on whether the recipient consents or if an automated hold was placed.
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <h5 className="font-bold text-amber-400">Can I report fake QR code scams?</h5>
                <p className="text-slate-300 leading-relaxed">
                  Yes! Use the dispute form and select "Fraudulent QR Scan Request". Our system will auto-report the scammer's VPA to the National Cyber Crime Reporting Portal (1930).
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400">Protected by RBI Ombudsman Framework</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl"
          >
            Close Support
          </button>
        </div>

      </div>
    </div>
  );
};
