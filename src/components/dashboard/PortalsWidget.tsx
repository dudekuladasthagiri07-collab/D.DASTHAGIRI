import React from 'react';
import { motion } from 'motion/react';
import { Globe, Plus, ExternalLink, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';
import { ConnectedPortal } from '../../types';
import { WidgetHeader } from './WidgetHeader';

interface Props {
  portals: ConnectedPortal[];
  orderIndex: number;
  totalWidgets: number;
  isReorderMode?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onHide?: () => void;
  setActiveTab: (tab: string) => void;
  gridStaggerVariants: any;
  itemEntryVariants: any;
}

export const PortalsWidget: React.FC<Props> = ({
  portals,
  orderIndex,
  totalWidgets,
  isReorderMode,
  onMoveUp,
  onMoveDown,
  onHide,
  setActiveTab,
  gridStaggerVariants,
  itemEntryVariants,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-sm space-y-4">
      <WidgetHeader
        title={`Connected Portals & Govt Services (${portals.length})`}
        category="Direct OAuth & API Bridges with Official Server Verification"
        badge="GOVT AUTHENTICATED"
        badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
        icon={<Globe className="w-4 h-4" />}
        orderIndex={orderIndex}
        totalWidgets={totalWidgets}
        widgetId="portals"
        isReorderMode={isReorderMode}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onHide={onHide}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('portals')}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Manage Portals
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('portals')}
            className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> Connect Portal
          </button>
        </div>
      </WidgetHeader>

      {/* Portals Grid */}
      <motion.div
        variants={gridStaggerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5"
      >
        {portals.map((portal) => (
          <motion.div
            key={portal.id}
            variants={itemEntryVariants}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('portals')}
            className="p-4 rounded-2xl border bg-slate-50/80 hover:bg-indigo-50/40 border-slate-200 hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between space-y-3 group shadow-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform text-indigo-600">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {portal.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 truncate">
                    {portal.category.toUpperCase()} • Official Server
                  </p>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded text-[9px] font-black shrink-0 ${
                portal.category === 'Government'
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {portal.category === 'Government' ? 'GOVT' : 'OFFICIAL'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>0% Safe Risk</span>
              </div>
              <span className="text-indigo-600 font-bold text-[11px] flex items-center gap-1 group-hover:underline">
                Launch Portal →
              </span>
            </div>
          </motion.div>
        ))}

        {/* Connect New Portal Slot */}
        <motion.div
          variants={itemEntryVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('portals')}
          className="p-4 rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50/80 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 min-h-[110px] group"
        >
          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-xs text-indigo-950 group-hover:text-indigo-700">Connect New Portal</span>
            <p className="text-[10px] text-indigo-600/80">Link EPFO, UIDAI, GST, or State Services</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
