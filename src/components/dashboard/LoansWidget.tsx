import React from 'react';
import { motion } from 'motion/react';
import { DollarSign, Award, Briefcase, BookOpen } from 'lucide-react';
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

export const LoansWidget: React.FC<Props> = ({
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
        title="Loans & Credit Services"
        category="Instant Paperless Approval with 0% Processing Fee Offers"
        badge="PRE-APPROVED OFFERS"
        badgeColor="bg-blue-50 text-blue-700 border-blue-200"
        icon={<DollarSign className="w-4 h-4" />}
        orderIndex={orderIndex}
        totalWidgets={totalWidgets}
        widgetId="loans"
        isReorderMode={isReorderMode}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onHide={onHide}
      />

      <motion.div
        variants={gridStaggerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5"
      >
        {/* Personal Loan */}
        <motion.div
          variants={itemEntryVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenServiceModal('Personal Loan up to ₹10 Lakh', 'Credit', 'Get instant disbursal within 2 minutes directly into your verified bank account.', 'Required Loan Amount (₹)', '100000', 'INSTANT 2-MIN')}
          className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600">Personal Loan</h4>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-100 text-blue-800">₹10 Lakh</span>
              </div>
              <p className="text-[11px] text-slate-500">Interest from 10.49% • 2-Min Approval</p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">Apply →</span>
        </motion.div>

        {/* Gold Loan */}
        <motion.div
          variants={itemEntryVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenServiceModal('Gold Loan @ Doorstep', 'Credit', 'Doorstep gold evaluation and instant cash credit @ 0.79% per month.', 'Gold Weight in Grams', '25', '0.79% / MONTH')}
          className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-amber-50/50 border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-amber-700">Gold Loan</h4>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-900">Doorstep</span>
              </div>
              <p className="text-[11px] text-slate-500">Lowest 0.79% monthly interest</p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-700 group-hover:translate-x-1 transition-transform">Apply →</span>
        </motion.div>

        {/* Experian Credit Score */}
        <motion.div
          variants={itemEntryVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenServiceModal('Free Credit Score Check', 'Credit', 'View detailed CIBIL & Experian score breakdown with zero impact on your rating.', 'PAN Number', 'ABCDE1234F', '782 EXCELLENT')}
          className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-purple-50/50 border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#6A1BFF] text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#6A1BFF]">Credit Score</h4>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800">Score 782</span>
              </div>
              <p className="text-[11px] text-slate-500">Updated monthly • 100% Free</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#6A1BFF] group-hover:translate-x-1 transition-transform">Check →</span>
        </motion.div>

        {/* Loan Against Mutual Funds */}
        <motion.div
          variants={itemEntryVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenServiceModal('Loan Against Mutual Funds (LAMF)', 'Credit', 'Get instant cash line up to ₹25 Lakh without selling your MF portfolio.', 'PAN Linked with Portfolio', 'ABCDE1234F', 'UP TO ₹25 LAKH')}
          className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/50 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-700">Loan Against MF</h4>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800">8.9% p.a.</span>
              </div>
              <p className="text-[11px] text-slate-500">Keep SIPs active & get credit</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">Apply →</span>
        </motion.div>

        {/* Business Loan MSME */}
        <motion.div
          variants={itemEntryVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenServiceModal('MSME Business Loan', 'Credit', 'Collateral-free working capital loan for merchants and businesses up to ₹50 Lakh.', 'GSTIN / Udyam Number', '27ABCDE1234F1Z5', 'COLLATERAL FREE')}
          className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/50 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600">Business Loan</h4>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-indigo-100 text-indigo-800">MSME</span>
              </div>
              <p className="text-[11px] text-slate-500">Working capital up to ₹50 Lakh</p>
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">Apply →</span>
        </motion.div>

        {/* Education Loan */}
        <motion.div
          variants={itemEntryVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenServiceModal('Global Education Loan', 'Credit', 'Fund domestic or international university degrees with customized tax benefits.', 'Admission / College Name', 'e.g. IIT / Stanford', '100% FUNDING')}
          className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-purple-50/50 border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-purple-600">Education Loan</h4>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-100 text-purple-800">Global</span>
              </div>
              <p className="text-[11px] text-slate-500">100% course & living cover</p>
            </div>
          </div>
          <span className="text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">Apply →</span>
        </motion.div>
      </motion.div>
    </div>
  );
};
