import React from 'react';
import { motion } from 'motion/react';
import { Shield, HeartPulse, Bike, Car, ShieldCheck } from 'lucide-react';
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

export const InsuranceWidget: React.FC<Props> = ({
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
        title="Insurance Protection"
        category="100% Cashless Hospitalization & Instant Online Policy Issuance"
        badge="CASHLESS CLAIMS"
        badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
        icon={<Shield className="w-4 h-4" />}
        orderIndex={orderIndex}
        totalWidgets={totalWidgets}
        widgetId="insurance"
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
        {/* Health Insurance */}
        <motion.div
          variants={itemEntryVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenServiceModal('Health Insurance with ₹1 Crore Cover', 'Insurance', 'Comprehensive family health cover with 10,000+ cashless network hospitals.', 'Member Age / City Pincode', '560001', '₹1 CR COVER')}
          className="p-4 rounded-[22px] bg-gradient-to-br from-rose-50 to-pink-50/50 border border-rose-200/80 hover:border-rose-400 hover:shadow-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="p-2.5 rounded-xl bg-rose-600 text-white w-fit shadow-xs">
            <HeartPulse className="w-5 h-5" />
          </div>
          <h4 className="font-black text-slate-900 text-sm group-hover:text-rose-600">Health Insurance</h4>
          <p className="text-[11px] text-slate-500">₹1 Crore Cover from ₹490/mo</p>
        </motion.div>

        {/* Bike Insurance */}
        <motion.div
          variants={itemEntryVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenServiceModal('2-Wheeler Bike Insurance', 'Insurance', 'Instant policy renewal with zero inspection and roadside breakdown assistance.', 'Bike Registration Number', 'KA01EQ9921', 'FROM ₹499/YR')}
          className="p-4 rounded-[22px] bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200/80 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="p-2.5 rounded-xl bg-blue-600 text-white w-fit shadow-xs">
            <Bike className="w-5 h-5" />
          </div>
          <h4 className="font-black text-slate-900 text-sm group-hover:text-blue-600">Bike Insurance</h4>
          <p className="text-[11px] text-slate-500">Instant policy starting ₹499/yr</p>
        </motion.div>

        {/* Car Insurance */}
        <motion.div
          variants={itemEntryVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenServiceModal('Comprehensive Car Insurance', 'Insurance', 'Zero depreciation cover, 24x7 towing support & cash-free accident repair.', 'Car Registration Number', 'DL03CC8821', 'ZERO DEPRECIATION')}
          className="p-4 rounded-[22px] bg-gradient-to-br from-purple-50 to-indigo-50/50 border border-purple-200/80 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="p-2.5 rounded-xl bg-[#6A1BFF] text-white w-fit shadow-xs">
            <Car className="w-5 h-5" />
          </div>
          <h4 className="font-black text-slate-900 text-sm group-hover:text-[#6A1BFF]">Car Insurance</h4>
          <p className="text-[11px] text-slate-500">Up to 85% discount on OD cover</p>
        </motion.div>

        {/* Term Life Insurance */}
        <motion.div
          variants={itemEntryVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenServiceModal('₹1 Crore Term Life Cover', 'Insurance', 'Guaranteed life protection for your family with zero medical checkup required.', 'Monthly Income & Smoker Status', 'e.g. ₹50,000 / Non-Smoker', 'TAX EXEMPT 10(10D)')}
          className="p-4 rounded-[22px] bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/80 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white w-fit shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-black text-slate-900 text-sm group-hover:text-emerald-700">₹1 Cr Term Life</h4>
          <p className="text-[11px] text-slate-500">Protect family from ₹16/day</p>
        </motion.div>
      </motion.div>
    </div>
  );
};
