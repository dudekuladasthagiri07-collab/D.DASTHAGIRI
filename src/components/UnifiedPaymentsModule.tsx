import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smartphone,
  Tv,
  Car,
  Zap,
  Droplets,
  Flame,
  Wifi,
  Cylinder,
  Landmark,
  Shield,
  GraduationCap,
  Send,
  QrCode,
  Scan,
  CreditCard,
  Search,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  SlidersHorizontal,
  X,
  History,
  Activity
} from 'lucide-react';
import { PaymentService, ServiceGroupCategory, BankAccount, LinkedAccount } from '../types';
import { UNIFIED_SERVICES } from '../data/billersData';

interface UnifiedPaymentsModuleProps {
  onOpenService: (service: PaymentService) => void;
  onOpenCheckBalance?: () => void;
  onOpenRecentTransactions?: () => void;
  onOpenAdminOps?: () => void;
  linkedAccounts?: (BankAccount | LinkedAccount)[];
}

export const UnifiedPaymentsModule: React.FC<UnifiedPaymentsModuleProps> = ({
  onOpenService,
  onOpenCheckBalance,
  onOpenRecentTransactions,
  onOpenAdminOps,
  linkedAccounts = [],
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: string[] = ['All', 'Recharge', 'Bills', 'Financial Payments', 'UPI'];

  // Filter services by category and query
  const filteredServices = useMemo(() => {
    return UNIFIED_SERVICES.filter((srv) => {
      if (selectedCategory !== 'All' && srv.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          srv.name.toLowerCase().includes(q) ||
          srv.description.toLowerCase().includes(q) ||
          srv.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  // Group by category for visual organization when viewing All
  const groupedServices = useMemo(() => {
    const groups: Record<ServiceGroupCategory, typeof UNIFIED_SERVICES> = {
      Recharge: [],
      Bills: [],
      'Financial Payments': [],
      UPI: [],
    };

    filteredServices.forEach((s) => {
      if (groups[s.category]) {
        groups[s.category].push(s);
      }
    });

    return groups;
  }, [filteredServices]);

  // Dynamic icon helper
  const renderIcon = (iconName: string, serviceId: PaymentService) => {
    const baseClass = 'w-5 h-5';
    switch (serviceId) {
      case 'MOBILE_RECHARGE':
        return <Smartphone className={`${baseClass} text-sky-400`} />;
      case 'DTH_CABLE':
        return <Tv className={`${baseClass} text-purple-400`} />;
      case 'FASTAG':
        return <Car className={`${baseClass} text-emerald-400`} />;
      case 'ELECTRICITY':
        return <Zap className={`${baseClass} text-amber-400`} />;
      case 'WATER':
        return <Droplets className={`${baseClass} text-blue-400`} />;
      case 'PIPED_GAS':
        return <Flame className={`${baseClass} text-orange-400`} />;
      case 'BROADBAND':
        return <Wifi className={`${baseClass} text-cyan-400`} />;
      case 'LPG':
        return <Flame className={`${baseClass} text-rose-400`} />;
      case 'LOAN_EMI':
        return <Landmark className={`${baseClass} text-indigo-400`} />;
      case 'INSURANCE':
        return <Shield className={`${baseClass} text-red-400`} />;
      case 'EDUCATION_FEE':
        return <GraduationCap className={`${baseClass} text-yellow-400`} />;
      case 'SEND_MONEY':
        return <Send className={`${baseClass} text-teal-400`} />;
      case 'RECEIVE_MONEY':
        return <QrCode className={`${baseClass} text-violet-400`} />;
      case 'SCAN_AND_PAY':
        return <Scan className={`${baseClass} text-amber-300`} />;
      default:
        return <CreditCard className={`${baseClass} text-slate-300`} />;
    }
  };

  return (
    <div id="unified-payments-module" className="space-y-6">
      {/* Top Header Banner with Check Balance CTA */}
      <div className="p-5 rounded-3xl bg-linear-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Unified Payments & BBPS
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                <CheckCircle2 className="w-3 h-3" />
                NPCI Verified
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Payments, Recharges & Utility Bills
            </h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Pay all 14 authorized services through an integrated, idempotent transaction engine powered by BBPS Bharat Connect.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onOpenCheckBalance && (
              <button
                id="btn-unified-check-balance"
                type="button"
                onClick={onOpenCheckBalance}
                className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all flex items-center gap-2 shadow-md shadow-amber-400/20 cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                <span>Check Balance</span>
              </button>
            )}

            {onOpenAdminOps && (
              <button
                id="btn-unified-admin-ops"
                type="button"
                onClick={onOpenAdminOps}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Operations & Reconciliation Dashboard"
              >
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Operations</span>
              </button>
            )}
          </div>
        </div>

        {/* Search bar & Category filter chips */}
        <div className="space-y-3 pt-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              id="input-search-payments"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search electricity, water, gas, FASTag, broadband, mobile recharge or UPI..."
              className="w-full pl-10 pr-10 py-3 bg-slate-950/90 border border-slate-700/80 focus:border-amber-400 rounded-2xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  id={`filter-cat-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-400/30'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Service Sections */}
      {selectedCategory === 'All' && !searchQuery ? (
        <div className="space-y-6">
          {/* 1. UPI & Money Transfers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-4 rounded-full bg-teal-400" />
                <h3 className="font-extrabold text-base text-white tracking-tight">
                  UPI & Instant Transfers
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Zero Fee • Real-time</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {groupedServices.UPI.map((srv) => (
                <div
                  key={srv.id}
                  id={`card-service-${srv.id.toLowerCase()}`}
                  onClick={() => onOpenService(srv.id)}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-400/80 transition-all cursor-pointer group flex items-start justify-between shadow-xs hover:shadow-md"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                      {renderIcon(srv.iconName, srv.id)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-white group-hover:text-teal-300 transition-colors">
                        {srv.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                        {srv.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all shrink-0 ml-1 mt-1" />
                </div>
              ))}
            </div>
          </div>

          {/* 2. Recharge Services */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-4 rounded-full bg-sky-400" />
                <h3 className="font-extrabold text-base text-white tracking-tight">
                  Recharge & Toll
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Instant Plan Fetch</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {groupedServices.Recharge.map((srv) => (
                <div
                  key={srv.id}
                  id={`card-service-${srv.id.toLowerCase()}`}
                  onClick={() => onOpenService(srv.id)}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-400/80 transition-all cursor-pointer group flex items-start justify-between shadow-xs hover:shadow-md"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                      {renderIcon(srv.iconName, srv.id)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-extrabold text-sm text-white group-hover:text-sky-300 transition-colors">
                          {srv.name}
                        </h4>
                        {srv.badge && (
                          <span className="px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            {srv.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                        {srv.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all shrink-0 ml-1 mt-1" />
                </div>
              ))}
            </div>
          </div>

          {/* 3. Utility Bills */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-4 rounded-full bg-amber-400" />
                <h3 className="font-extrabold text-base text-white tracking-tight">
                  Utility Bills (BBPS)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">All India Boards</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {groupedServices.Bills.map((srv) => (
                <div
                  key={srv.id}
                  id={`card-service-${srv.id.toLowerCase()}`}
                  onClick={() => onOpenService(srv.id)}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-400/80 transition-all cursor-pointer group flex items-start justify-between shadow-xs hover:shadow-md"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                      {renderIcon(srv.iconName, srv.id)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors">
                          {srv.name}
                        </h4>
                        {srv.badge && (
                          <span className="px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {srv.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                        {srv.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0 ml-1 mt-1" />
                </div>
              ))}
            </div>
          </div>

          {/* 4. Financial Payments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-4 rounded-full bg-indigo-400" />
                <h3 className="font-extrabold text-base text-white tracking-tight">
                  Financial & Education Payments
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Banks, Insurers & Institutions</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {groupedServices['Financial Payments'].map((srv) => (
                <div
                  key={srv.id}
                  id={`card-service-${srv.id.toLowerCase()}`}
                  onClick={() => onOpenService(srv.id)}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-400/80 transition-all cursor-pointer group flex items-start justify-between shadow-xs hover:shadow-md"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                      {renderIcon(srv.iconName, srv.id)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-white group-hover:text-indigo-300 transition-colors">
                        {srv.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                        {srv.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0 ml-1 mt-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Filtered Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredServices.length > 0 ? (
            filteredServices.map((srv) => (
              <div
                key={srv.id}
                id={`card-service-${srv.id.toLowerCase()}`}
                onClick={() => onOpenService(srv.id)}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-400/80 transition-all cursor-pointer group flex items-start justify-between shadow-xs hover:shadow-md"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    {renderIcon(srv.iconName, srv.id)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors">
                        {srv.name}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold border border-slate-700">
                        {srv.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {srv.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0 ml-1 mt-1" />
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-600 mb-1" />
              <p className="text-sm font-semibold text-slate-300">
                No payment services found for "{searchQuery}"
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="px-3 py-1.5 bg-slate-800 text-amber-300 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      )}

      {/* Security & Compliance Footer */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-white text-xs">
              Direct Provider Reconciliation & Dual-Factor Verification
            </div>
            <div className="text-[11px] text-slate-400">
              Transactions are authenticated through NPCI Central switch and authorized biller gateways with unique UTR tracking.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-[10px] text-slate-500">BBPS CERTIFIED</span>
        </div>
      </div>
    </div>
  );
};
