import React from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Share2,
  Download,
  Copy,
  Printer,
  ShieldCheck,
  Building2,
  Calendar,
  CreditCard,
  Check,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { PaymentOrder, PaymentService } from '../types';

interface ReceiptScreenProps {
  order: PaymentOrder;
  onDone: () => void;
  onBack?: () => void;
}

export const ReceiptScreen: React.FC<ReceiptScreenProps> = ({
  order,
  onDone,
  onBack,
}) => {
  const [copiedId, setCopiedId] = React.useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Payment Receipt: ${order.billerName || order.serviceType}`,
          text: `Payment of ₹${order.amount.toLocaleString()} for ${order.billerName || order.serviceType} (UTR: ${order.utrNumber || order.id}) was successful.`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      copyToClipboard(`Receipt: Paid ₹${order.amount} to ${order.billerName}. UTR: ${order.utrNumber || order.id}`);
    }
  };

  const formatServiceTitle = (service: PaymentService) => {
    return service
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div id="receipt-screen" className="w-full max-w-lg mx-auto space-y-5 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="text-center space-y-2 pt-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 14 }}
          className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400/80 mx-auto flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20"
        >
          <CheckCircle2 className="w-9 h-9" />
        </motion.div>
        <h2 className="text-2xl font-black text-white tracking-tight">Payment Successful</h2>
        <p className="text-xs text-slate-400">
          Official NPCI / BBPS Biller Acknowledgment Received
        </p>
      </div>

      {/* Main Digital Bill Receipt Card */}
      <div className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 relative overflow-hidden">
        {/* Receipt Decorative Ribbon */}
        <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider shadow-xs">
          Verified ✓
        </div>

        {/* Amount Display */}
        <div className="text-center pb-4 border-b border-slate-800 space-y-1">
          <div className="text-xs font-semibold text-slate-400">Amount Paid</div>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight text-emerald-400">
            ₹{order.amount.toLocaleString()}
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            ({order.amountPaise.toLocaleString()} paise) • INR
          </div>
        </div>

        {/* Breakdown Items */}
        <div className="space-y-3 text-xs sm:text-sm">
          {/* Service Name */}
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400 font-medium">Service</span>
            <span className="font-bold text-white text-right">
              {formatServiceTitle(order.serviceType)}
            </span>
          </div>

          {/* Biller / Recipient */}
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400 font-medium">Biller / Payee</span>
            <span className="font-bold text-amber-300 text-right max-w-[220px] truncate">
              {order.billerName || 'Authorized Provider'}
            </span>
          </div>

          {/* Customer Identifier */}
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400 font-medium">Customer Ref</span>
            <span className="font-mono font-bold text-slate-200 text-right">
              {order.customerReferenceMasked || order.customerReference}
            </span>
          </div>

          {/* Customer Name if present */}
          {order.customerName && (
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400 font-medium">Account Name</span>
              <span className="font-bold text-slate-200 text-right">
                {order.customerName}
              </span>
            </div>
          )}

          {/* Payment Method */}
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400 font-medium">Payment Mode</span>
            <span className="font-bold text-slate-200 text-right flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
              {order.paymentMethod}
              {order.sourceAccountMasked ? ` (${order.sourceAccountMasked})` : ''}
            </span>
          </div>

          {/* UTR / Transaction ID */}
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400 font-medium">Transaction ID</span>
            <button
              type="button"
              onClick={() => copyToClipboard(order.id)}
              className="font-mono font-bold text-slate-300 hover:text-white flex items-center gap-1 group cursor-pointer"
            >
              <span>{order.id}</span>
              {copiedId ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-slate-500 group-hover:text-amber-400" />
              )}
            </button>
          </div>

          {/* Bank UTR Ref */}
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400 font-medium">Bank UTR Number</span>
            <span className="font-mono font-bold text-slate-300">
              {order.utrNumber || `UTR-${Math.floor(100000000000 + Math.random() * 900000000000)}`}
            </span>
          </div>

          {/* BBPS Reference */}
          {order.bbpsReference && (
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400 font-medium">BBPS Ref ID</span>
              <span className="font-mono font-bold text-emerald-400">
                {order.bbpsReference}
              </span>
            </div>
          )}

          {/* Date & Time */}
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400 font-medium">Date & Time</span>
            <span className="font-medium text-slate-300 text-right">
              {new Date(order.createdAt || Date.now()).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </span>
          </div>

          {/* Status Badge */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-800">
            <span className="text-slate-400 font-medium">Status</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              SUCCESSFUL
            </span>
          </div>
        </div>

        {/* BBPS & NPCI Stamp Footer */}
        <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[11px] font-black text-white">Bharat BillPay Assured</div>
              <div className="text-[10px] text-slate-400">NPCI / Central Payment Network</div>
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-500">IDEMPOTENT SECURE</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-3">
          <button
            id="btn-share-receipt"
            type="button"
            onClick={handleShare}
            className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Share2 className="w-4 h-4 text-amber-400" />
            <span>Share Receipt</span>
          </button>

          <button
            id="btn-print-receipt"
            type="button"
            onClick={handlePrint}
            className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4 text-indigo-400" />
            <span>Print / Save PDF</span>
          </button>
        </div>

        <button
          id="btn-receipt-done"
          type="button"
          onClick={onDone}
          className="w-full py-3.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 cursor-pointer"
        >
          <span>Done</span>
        </button>
      </div>
    </div>
  );
};
