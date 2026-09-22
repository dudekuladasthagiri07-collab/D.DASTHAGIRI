import React from 'react';
import { motion } from 'motion/react';
import { Building2, Plus, Scale } from 'lucide-react';
import { BankAccount } from '../../types';
import { BankLogo } from '../BankLogo';
import { WidgetHeader } from './WidgetHeader';

interface Props {
  banks: BankAccount[];
  orderIndex: number;
  totalWidgets: number;
  isReorderMode?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onHide?: () => void;
  onOpenBankingOps: (tab: 'balance' | 'send' | 'receive' | 'self_transfer') => void;
  setActiveTab: (tab: string) => void;
  gridStaggerVariants: any;
  itemEntryVariants: any;
}

export const BankAccountsWidget: React.FC<Props> = ({
  banks,
  orderIndex,
  totalWidgets,
  isReorderMode,
  onMoveUp,
  onMoveDown,
  onHide,
  onOpenBankingOps,
  setActiveTab,
  gridStaggerVariants,
  itemEntryVariants,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-sm space-y-4">
      <WidgetHeader
        title={`Linked Bank Accounts (${banks.length})`}
        category="NPCI 24x7 Real-Time Direct UPI & Balance Check"
        badge="NPCI VERIFIED"
        badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
        icon={<Building2 className="w-4 h-4" />}
        orderIndex={orderIndex}
        totalWidgets={totalWidgets}
        widgetId="bank_accounts"
        isReorderMode={isReorderMode}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onHide={onHide}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenBankingOps('balance')}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Scale className="w-3.5 h-3.5" /> Check Balance
          </button>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                const event = new CustomEvent('open_link_bank_wizard');
                window.dispatchEvent(event);
              }
              setActiveTab('banks');
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> Add Bank
          </button>
        </div>
      </WidgetHeader>

      {/* Bank Cards Staggered Grid */}
      <motion.div
        variants={gridStaggerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5"
      >
        {banks.map((bank) => (
          <motion.div
            key={bank.id}
            variants={itemEntryVariants}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpenBankingOps('balance')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between space-y-3 group ${
              bank.isPrimary
                ? 'bg-gradient-to-br from-indigo-50/90 via-purple-50/40 to-white border-indigo-300 ring-2 ring-indigo-500/15 shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <BankLogo bankName={bank.bankName} ifscCode={bank.ifscCode} size="md" />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {bank.bankName}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {bank.accountNumberMasked} • {bank.accountType.toUpperCase()}
                  </p>
                </div>
              </div>

              {bank.isPrimary ? (
                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-indigo-600 text-white shadow-xs">
                  Primary
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-200/80 text-slate-600">
                  Linked
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
              <div className="text-[11px] font-mono text-slate-500">
                IFSC: <span className="font-semibold text-slate-700">{bank.ifscCode}</span>
              </div>
              <span className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] flex items-center gap-1 group-hover:underline">
                <Scale className="w-3 h-3" /> View Balance →
              </span>
            </div>
          </motion.div>
        ))}

        {/* Add Bank Quick Slot */}
        <motion.div
          variants={itemEntryVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (typeof window !== 'undefined') {
              const event = new CustomEvent('open_link_bank_wizard');
              window.dispatchEvent(event);
            }
            setActiveTab('banks');
          }}
          className="p-4 rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50/80 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 min-h-[110px] group"
        >
          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-xs text-indigo-900 group-hover:text-indigo-700">Link Another Bank</span>
            <p className="text-[10px] text-indigo-500/80">Support for 140+ Indian banks</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
