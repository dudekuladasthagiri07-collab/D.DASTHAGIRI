import React from 'react';
import { motion } from 'motion/react';
import { Gift, Tag, Sparkles, Award } from 'lucide-react';
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

export const RewardsWidget: React.FC<Props> = ({
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
        title="Offers & Rewards"
        category="Earn Direct Bank Cashbacks, Merchant Coupons & Scratch Cards"
        badge="EARN CASHBACK"
        badgeColor="bg-amber-50 text-amber-900 border-amber-200"
        icon={<Gift className="w-4 h-4" />}
        orderIndex={orderIndex}
        totalWidgets={totalWidgets}
        widgetId="rewards"
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
        {/* Cashback Offers */}
        <motion.button
          type="button"
          variants={itemEntryVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenServiceModal('Cashback Offers', 'Rewards', 'Get up to ₹500 flat cashback on electricity, food orders, and flight ticket bookings.', 'Promo / Coupon Code', 'WELCOME500', 'UP TO ₹500')}
          className="p-4 rounded-[22px] bg-gradient-to-br from-purple-50 to-indigo-50/50 border border-purple-200/80 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer space-y-2 text-left group"
        >
          <div className="p-2.5 rounded-xl bg-[#6A1BFF] text-white font-black w-fit">
            <Gift className="w-5 h-5" />
          </div>
          <h4 className="font-black text-slate-900 text-sm group-hover:text-[#6A1BFF]">Cashback Offers</h4>
          <p className="text-[11px] text-slate-500">Up to ₹500 on BBPS Bills & Food</p>
        </motion.button>

        {/* Coupons */}
        <motion.button
          type="button"
          variants={itemEntryVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenServiceModal('Brand Partner Coupons', 'Rewards', 'Exclusive partner coupons for Swiggy, Zomato, Amazon, Myntra, and MakeMyTrip.', 'Brand / Partner Name', 'e.g. Swiggy / Amazon', 'FLAT 50% OFF')}
          className="p-4 rounded-[22px] bg-gradient-to-br from-amber-50 to-amber-100/40 border border-amber-200/80 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer space-y-2 text-left group"
        >
          <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-black w-fit">
            <Tag className="w-5 h-5" />
          </div>
          <h4 className="font-black text-slate-900 text-sm group-hover:text-amber-700">Brand Coupons</h4>
          <p className="text-[11px] text-slate-500">Flat 50% off on Swiggy & Amazon</p>
        </motion.button>

        {/* Scratch Cards */}
        <motion.button
          type="button"
          variants={itemEntryVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenServiceModal('Scratch Card', 'Scratch Card', 'Scratch below to reveal your secret mystery reward!', 'Secret Scratch Code', 'TAP TO REVEAL')}
          className="p-4 rounded-[22px] bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/80 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer space-y-2 text-left group relative"
        >
          <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white font-black w-fit">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <h4 className="font-black text-slate-900 text-sm group-hover:text-emerald-700">Scratch Cards</h4>
          <p className="text-[11px] text-slate-500">2 Unscratched Cards available</p>
        </motion.button>

        {/* Reward Points */}
        <motion.button
          type="button"
          variants={itemEntryVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenServiceModal('Redeem Reward Points', 'Rewards', 'You have 1,450 DocCoins equal to ₹145 direct cash credit into your bank.', 'Coins to Redeem', '1450', '1,450 COINS')}
          className="p-4 rounded-[22px] bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200/80 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer space-y-2 text-left group"
        >
          <div className="p-2.5 rounded-xl bg-blue-600 text-white font-black w-fit">
            <Award className="w-5 h-5" />
          </div>
          <h4 className="font-black text-slate-900 text-sm group-hover:text-blue-700">Reward Points</h4>
          <p className="text-[11px] text-slate-500">1,450 Coins • Redeem for ₹145</p>
        </motion.button>
      </motion.div>
    </div>
  );
};
