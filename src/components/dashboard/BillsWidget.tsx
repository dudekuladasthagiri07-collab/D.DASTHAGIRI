import React from 'react';
import { motion } from 'motion/react';
import {
  Zap,
  Smartphone,
  Tv,
  ZapOff,
  Droplet,
  Flame,
  Wifi,
  Disc,
  Truck,
  Receipt,
  Grid,
  Shield,
  GraduationCap
} from 'lucide-react';
import { WidgetHeader } from './WidgetHeader';
import { PaymentService } from '../../types';

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
  onOpenBillService?: (service: PaymentService) => void;
  gridStaggerVariants: any;
  itemEntryVariants: any;
}

export const BillsWidget: React.FC<Props> = ({
  orderIndex,
  totalWidgets,
  isReorderMode,
  onMoveUp,
  onMoveDown,
  onHide,
  handleOpenServiceModal,
  onOpenBillService,
  gridStaggerVariants,
  itemEntryVariants,
}) => {
  const BILL_SERVICES: { title: string; icon: any; serviceType: PaymentService; label: string; placeholder: string }[] = [
    { title: 'Electricity Bill', icon: ZapOff, serviceType: 'ELECTRICITY', label: 'Consumer Number (CA Number)', placeholder: 'e.g. 1029384756' },
    { title: 'Mobile Recharge', icon: Smartphone, serviceType: 'MOBILE_RECHARGE', label: 'Mobile Number', placeholder: 'Enter 10-digit mobile number' },
    { title: 'FASTag Toll Recharge', icon: Truck, serviceType: 'FASTAG', label: 'Vehicle Registration Number', placeholder: 'e.g. KA01AB1234' },
    { title: 'DTH / Cable TV', icon: Tv, serviceType: 'DTH_CABLE', label: 'Subscriber ID / Smart Card No', placeholder: 'Enter DTH subscriber ID' },
    { title: 'Water Bill', icon: Droplet, serviceType: 'WATER', label: 'Water Board Consumer ID', placeholder: 'Enter Consumer ID' },
    { title: 'Piped Gas (PNG)', icon: Flame, serviceType: 'PIPED_GAS', label: 'BPCL / IGL BP Number', placeholder: 'Enter Business Partner ID' },
    { title: 'Broadband / Wi-Fi', icon: Wifi, serviceType: 'BROADBAND', label: 'Broadband Account Number', placeholder: 'e.g. Airtel / JioFiber ID' },
    { title: 'LPG Cylinder', icon: Disc, serviceType: 'LPG', label: 'LPG Consumer ID (17-digit)', placeholder: 'e.g. Indane / HP / Bharat' },
    { title: 'Loan EMI Payment', icon: Receipt, serviceType: 'LOAN_EMI', label: 'Loan Account Number (LAN)', placeholder: 'e.g. HDFC-LN-99214' },
    { title: 'Insurance Premium', icon: Shield, serviceType: 'INSURANCE', label: 'Policy Number', placeholder: 'Enter Policy Number' },
    { title: 'Education / Fees', icon: GraduationCap, serviceType: 'EDUCATION_FEE', label: 'Student Roll / Fee Code', placeholder: 'Enter Student ID' },
    { title: 'All BBPS Services', icon: Grid, serviceType: 'ELECTRICITY', label: 'Consumer / Account ID', placeholder: 'Enter details' },
  ];

  const handleItemClick = (item: typeof BILL_SERVICES[0]) => {
    if (onOpenBillService) {
      onOpenBillService(item.serviceType);
    } else {
      handleOpenServiceModal(
        item.title,
        'Utility Bill',
        `Instant 24x7 clearing for ${item.title}. BBPS assured.`,
        item.label,
        item.placeholder
      );
    }
  };

  return (
    <div id="bills-widget" className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-sm space-y-4">
      <WidgetHeader
        title="Recharge & Bill Payments"
        category="Bharat Bill Payment System (BBPS) Verified 24x7 Instant Utility Clearing"
        badge="BBPS VERIFIED"
        badgeColor="bg-purple-50 text-[#6A1BFF] border-purple-200"
        icon={<Zap className="w-4 h-4" />}
        orderIndex={orderIndex}
        totalWidgets={totalWidgets}
        widgetId="bills"
        isReorderMode={isReorderMode}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onHide={onHide}
      />

      <motion.div
        variants={gridStaggerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
      >
        {BILL_SERVICES.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={idx}
              type="button"
              variants={itemEntryVariants}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleItemClick(item)}
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer shadow-xs"
            >
              <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#6A1BFF] shadow-xs group-hover:scale-110 group-hover:bg-[#6A1BFF] group-hover:text-white transition-all">
                <Icon className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xs text-slate-800 group-hover:text-[#6A1BFF] line-clamp-1">
                {item.title}
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
};

