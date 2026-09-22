import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Sparkles, Gift, ChevronRight } from 'lucide-react';
import { WidgetHeader } from './WidgetHeader';

interface Props {
  orderIndex: number;
  totalWidgets: number;
  isReorderMode?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onHide?: () => void;
  handleOpenServiceModal: (
    title: string,
    category: string,
    description: string,
    fieldLabel?: string,
    fieldPlaceholder?: string,
    badgeText?: string
  ) => void;
  gridStaggerVariants: any;
  itemEntryVariants: any;
}

export const InvestmentsWidget: React.FC<Props> = ({
  orderIndex,
  totalWidgets,
  isReorderMode,
  onMoveUp,
  onMoveDown,
  onHide,
  handleOpenServiceModal,
  gridStaggerVariants,
  itemEntryVariants,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-sm space-y-4">
      <WidgetHeader
        title="Investments & Wealth"
        category="Micro-Savings, 24K Gold, Demat Stocks & High-Yield Mutual Funds"
        badge="HIGH RETURN PLANS"
        badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
        icon={<TrendingUp className="w-4 h-4" />}
        orderIndex={orderIndex}
        totalWidgets={totalWidgets}
        widgetId="investments"
        isReorderMode={isReorderMode}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onHide={onHide}
      />

      <motion.div
        variants={gridStaggerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Daily Savings */}
        <motion.div
          variants={itemEntryVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenServiceModal('Daily Savings', 'Investment', 'Start automated micro-savings from ₹10/day into liquid funds earning up to 8.5% p.a.', 'Daily Auto-Debit Amount (₹)', '10', '8.5% RETURN')}
          className="p-4 rounded-[22px] bg-gradient-to-br from-purple-50 to-indigo-50/50 border border-purple-200/80 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-[#6A1BFF] text-white shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
              8.5% p.a.
            </span>
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-sm group-hover:text-[#6A1BFF]">Daily Savings</h4>
            <p className="text-xs text-slate-500">Save from ₹10/day • Daily interest</p>
          </div>
          <div className="pt-2 border-t border-purple-100 text-[11px] font-bold text-[#6A1BFF] flex items-center justify-between">
            <span>Start SIP</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Gold Savings */}
        <motion.div
          variants={itemEntryVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenServiceModal('Gold Savings', 'Investment', 'Buy 24K 99.9% Pure Digital Gold backed by MMTC-PAMP with zero locker charges.', 'Gold Investment Amount (₹)', '100', '12.4% 1-YR')}
          className="p-4 rounded-[22px] bg-gradient-to-br from-amber-50 to-amber-100/40 border border-amber-200/80 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-black shadow-xs">
              <Gift className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-900">
              12.4% Return
            </span>
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-sm group-hover:text-amber-700">Gold Savings</h4>
            <p className="text-xs text-slate-500">24K 99.9% Pure • Sell anytime</p>
          </div>
          <div className="pt-2 border-t border-amber-200/60 text-[11px] font-bold text-amber-800 flex items-center justify-between">
            <span>Buy Gold</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Share Market */}
        <motion.div
          variants={itemEntryVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenServiceModal('Share Market', 'Investment', 'Zero brokerage stock trading & ETF investment portal linked with Demat.', 'PAN Number for Demat', 'ABCDE1234F', '0% BROKERAGE')}
          className="p-4 rounded-[22px] bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200/80 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
              Zero Brokerage
            </span>
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-sm group-hover:text-blue-600">Share Market</h4>
            <p className="text-xs text-slate-500">Free Demat A/c • Top Stocks</p>
          </div>
          <div className="pt-2 border-t border-blue-100 text-[11px] font-bold text-blue-600 flex items-center justify-between">
            <span>Open Account</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Mutual Funds */}
        <motion.div
          variants={itemEntryVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenServiceModal('Mutual Funds', 'Investment', 'Top performing index, ELSS tax saving, and flexi-cap mutual funds starting at ₹100/mo.', 'Monthly SIP Amount (₹)', '500', 'TAX SAVER 80C')}
          className="p-4 rounded-[22px] bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/80 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
              Tax Saver
            </span>
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-sm group-hover:text-emerald-700">Mutual Funds</h4>
            <p className="text-xs text-slate-500">Expert portfolios • ₹100 SIP</p>
          </div>
          <div className="pt-2 border-t border-emerald-100 text-[11px] font-bold text-emerald-700 flex items-center justify-between">
            <span>Explore Funds</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
