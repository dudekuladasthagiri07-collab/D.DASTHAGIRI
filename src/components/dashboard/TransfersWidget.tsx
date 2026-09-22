import React from 'react';
import { motion } from 'motion/react';
import { Send, Smartphone, ArrowDownLeft, QrCode, Receipt, Scale, Zap } from 'lucide-react';
import { WidgetHeader } from './WidgetHeader';

interface Props {
  orderIndex: number;
  totalWidgets: number;
  isReorderMode?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onHide?: () => void;
  onOpenBankingOps: (tab: 'balance' | 'send' | 'receive' | 'self_transfer') => void;
  handleAddWalletMoney: () => void;
  gridStaggerVariants: any;
  itemEntryVariants: any;
  onOpenQrScanner?: () => void;
  setActiveTab?: (tab: string) => void;
}

export const TransfersWidget: React.FC<Props> = ({
  orderIndex,
  totalWidgets,
  isReorderMode,
  onMoveUp,
  onMoveDown,
  onHide,
  onOpenBankingOps,
  handleAddWalletMoney,
  gridStaggerVariants,
  itemEntryVariants,
  onOpenQrScanner,
  setActiveTab,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-sm space-y-4">
      <WidgetHeader
        title="Banking & UPI Services"
        category="NPCI 24x7 Instant Transfer, Balance Check & QR"
        badge="NPCI 24x7 INSTANT"
        icon={<Send className="w-4 h-4" />}
        orderIndex={orderIndex}
        totalWidgets={totalWidgets}
        widgetId="transfers"
        isReorderMode={isReorderMode}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onHide={onHide}
      />

      {/* Main Core Banking Features Grid */}
      <motion.div
        variants={gridStaggerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3"
      >
        {/* 1. Check Balance (Primary entry for all linked accounts) */}
        <motion.button
          type="button"
          variants={itemEntryVariants}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onOpenBankingOps('balance')}
          className="p-3 rounded-[20px] bg-gradient-to-b from-purple-50/90 to-white hover:from-purple-100/80 hover:to-purple-50 border border-purple-200/80 hover:border-purple-400 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer shadow-xs"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6A1BFF] to-[#8E24AA] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Scale className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-xs group-hover:text-[#6A1BFF] whitespace-nowrap">Check Balance</h4>
            <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap">View Accounts</p>
          </div>
        </motion.button>

        {/* 2. Mobile Recharge */}
        <motion.button
          type="button"
          variants={itemEntryVariants}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (setActiveTab) setActiveTab('recharge');
            else {
              const ev = new CustomEvent('open_recharge_flow');
              window.dispatchEvent(ev);
            }
          }}
          className="p-3 rounded-[20px] bg-gradient-to-b from-blue-50/90 to-white hover:from-blue-100/80 hover:to-blue-50 border border-blue-200/80 hover:border-blue-400 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer shadow-xs relative"
        >
          <span className="absolute -top-1.5 right-1 px-1.5 py-0.5 rounded-full text-[8.5px] font-black bg-blue-600 text-white shadow-xs">
            Instant
          </span>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Smartphone className="w-5 h-5 text-sky-200" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-xs group-hover:text-blue-600 whitespace-nowrap">Mobile Recharge</h4>
            <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap">Prepaid / Postpaid</p>
          </div>
        </motion.button>

        {/* 3. Send Money */}
        <motion.button
          type="button"
          variants={itemEntryVariants}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onOpenBankingOps('send')}
          className="p-3 rounded-[20px] bg-slate-50 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer shadow-xs"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6A1BFF] to-[#8E24AA] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-xs group-hover:text-[#6A1BFF] whitespace-nowrap">Send Money</h4>
            <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap">To Contact/A/C</p>
          </div>
        </motion.button>

        {/* 4. Receive Money */}
        <motion.button
          type="button"
          variants={itemEntryVariants}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onOpenBankingOps('receive')}
          className="p-3 rounded-[20px] bg-slate-50 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer shadow-xs"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6A1BFF] to-[#8E24AA] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <ArrowDownLeft className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-xs group-hover:text-[#6A1BFF] whitespace-nowrap">Receive Money</h4>
            <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap">My QR & UPI ID</p>
          </div>
        </motion.button>

        {/* 5. Scan & Pay */}
        <motion.button
          type="button"
          variants={itemEntryVariants}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (onOpenQrScanner) onOpenQrScanner();
            else {
              const ev = new CustomEvent('open_qr_scanner');
              window.dispatchEvent(ev);
            }
          }}
          className="p-3 rounded-[20px] bg-slate-50 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer shadow-xs"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6A1BFF] to-[#8E24AA] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <QrCode className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-xs group-hover:text-[#6A1BFF] whitespace-nowrap">Scan & Pay</h4>
            <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap">Any Bharat QR</p>
          </div>
        </motion.button>

        {/* 6. Transactions */}
        <motion.button
          type="button"
          variants={itemEntryVariants}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (setActiveTab) setActiveTab('history');
            else {
              onOpenBankingOps('send');
            }
          }}
          className="p-3 rounded-[20px] bg-slate-50 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer shadow-xs"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6A1BFF] to-[#8E24AA] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Receipt className="w-5 h-5 text-purple-200" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-xs group-hover:text-[#6A1BFF] whitespace-nowrap">Transactions</h4>
            <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap">History & Bills</p>
          </div>
        </motion.button>

        {/* 7. UPI */}
        <motion.button
          type="button"
          variants={itemEntryVariants}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onOpenBankingOps('balance')}
          className="p-3 rounded-[20px] bg-slate-50 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer shadow-xs relative"
        >
          <span className="absolute -top-1.5 right-1 px-1.5 py-0.5 rounded-full text-[8.5px] font-black bg-amber-400 text-slate-950 shadow-xs">
            Lite
          </span>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6A1BFF] to-[#8E24AA] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-xs group-hover:text-[#6A1BFF] whitespace-nowrap">UPI & Lite</h4>
            <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap">Zero-PIN Pay</p>
          </div>
        </motion.button>
      </motion.div>
    </div>
  );
};
