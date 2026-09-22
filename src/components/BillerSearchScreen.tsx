import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Building2,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Zap,
  Droplets,
  Flame,
  Wifi,
  Tv,
  Car,
  Landmark,
  Shield,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { Biller, PaymentService, ServiceGroupCategory } from '../types';
import { ALL_BILLERS_DATABASE } from '../data/billersData';

interface BillerSearchScreenProps {
  serviceType: PaymentService;
  onSelectBiller: (biller: Biller) => void;
  onBack?: () => void;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const BillerSearchScreen: React.FC<BillerSearchScreenProps> = ({
  serviceType,
  onSelectBiller,
  onBack,
  title,
  subtitle,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('All States');

  // Filter billers matching serviceType
  const serviceBillers = useMemo(() => {
    return ALL_BILLERS_DATABASE.filter((b) => b.serviceType === serviceType);
  }, [serviceType]);

  // Extract unique available states for this service type
  const availableStates = useMemo(() => {
    const states = new Set<string>();
    serviceBillers.forEach((b) => {
      if (b.state) states.add(b.state);
    });
    return ['All States', ...Array.from(states).sort()];
  }, [serviceBillers]);

  // Filter billers based on query and state
  const filteredBillers = useMemo(() => {
    return serviceBillers.filter((b) => {
      // State filter
      if (selectedState !== 'All States' && b.state !== selectedState) {
        return false;
      }

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = b.name.toLowerCase().includes(q);
        const matchesCode = b.code.toLowerCase().includes(q);
        const matchesCity = b.city?.toLowerCase().includes(q) || false;
        const matchesState = b.state?.toLowerCase().includes(q) || false;
        const matchesDesc = b.description?.toLowerCase().includes(q) || false;

        return matchesName || matchesCode || matchesCity || matchesState || matchesDesc;
      }

      return true;
    });
  }, [serviceBillers, searchQuery, selectedState]);

  // Dynamic Service Icon
  const getServiceIcon = () => {
    switch (serviceType) {
      case 'ELECTRICITY':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'WATER':
        return <Droplets className="w-4 h-4 text-blue-400" />;
      case 'PIPED_GAS':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'BROADBAND':
        return <Wifi className="w-4 h-4 text-cyan-400" />;
      case 'DTH_CABLE':
        return <Tv className="w-4 h-4 text-purple-400" />;
      case 'FASTAG':
        return <Car className="w-4 h-4 text-emerald-400" />;
      case 'LOAN_EMI':
        return <Landmark className="w-4 h-4 text-indigo-400" />;
      case 'INSURANCE':
        return <Shield className="w-4 h-4 text-rose-400" />;
      case 'EDUCATION_FEE':
        return <GraduationCap className="w-4 h-4 text-yellow-400" />;
      default:
        return <Building2 className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div id="biller-search-screen" className={`w-full max-w-2xl mx-auto space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              {getServiceIcon()}
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {title || 'Select Biller / Provider'}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {subtitle || 'Select from authorized BBPS / Bharat Connect registered service providers'}
          </p>
        </div>
        {onBack && (
          <button
            id="btn-back-biller-search"
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700"
            title="Go Back"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
        <input
          id="input-biller-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${serviceType.replace(/_/g, ' ').toLowerCase()} provider, state or city...`}
          className="w-full pl-10 pr-10 py-3 bg-slate-900/90 border-2 border-slate-700 focus:border-amber-400 rounded-2xl text-white text-xs sm:text-sm placeholder-slate-400 focus:outline-none transition-all shadow-inner"
          autoFocus
        />
        {searchQuery && (
          <button
            id="btn-clear-biller-search"
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-3 text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* State Filter Chips (if states exist for this service) */}
      {availableStates.length > 2 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 shrink-0 mr-1">
            <Filter className="w-3 h-3 text-amber-400" />
            <span>State:</span>
          </div>
          {availableStates.map((st) => {
            const isSelected = selectedState === st;
            return (
              <button
                key={st}
                id={`chip-state-${st.replace(/\s+/g, '-').toLowerCase()}`}
                type="button"
                onClick={() => setSelectedState(st)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-400/30'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {st}
              </button>
            );
          })}
        </div>
      )}

      {/* Billers List */}
      <div id="billers-list-container" className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
        <AnimatePresence>
          {filteredBillers.length > 0 ? (
            filteredBillers.map((biller, idx) => (
              <motion.div
                key={biller.id}
                id={`biller-item-${biller.id}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: Math.min(idx * 0.02, 0.2) }}
                onClick={() => onSelectBiller(biller)}
                className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-400/70 transition-all cursor-pointer group flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center shrink-0 text-amber-300 group-hover:scale-105 transition-transform shadow-xs">
                    {getServiceIcon()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors truncate">
                        {biller.name}
                      </h4>
                      {biller.bbpsEnabled && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                          BBPS
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 flex-wrap">
                      {biller.state && (
                        <span className="flex items-center gap-1 text-slate-300">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {biller.state} {biller.city ? `(${biller.city})` : ''}
                        </span>
                      )}
                      <span className="text-slate-500">•</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        Req: {biller.identifierLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 group-hover:bg-amber-400 text-slate-300 group-hover:text-slate-950 border border-slate-700 group-hover:border-amber-300 transition-all flex items-center gap-1"
                  >
                    <span>Proceed</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
              <Building2 className="w-8 h-8 mx-auto text-slate-600 mb-1" />
              <p className="text-sm font-semibold text-slate-300">
                No billers found for "{searchQuery}"
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Check the provider spelling or switch state filter to 'All States'.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedState('All States');
                }}
                className="mt-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* BBPS Assurance */}
      <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center gap-2.5 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="text-[11px] leading-snug">
          Connected through Bharat BillPay (NPCI/RBI Bharat Connect). Payments are instantly settled with official biller acknowledgment and instant SMS/email confirmation.
        </span>
      </div>
    </div>
  );
};
