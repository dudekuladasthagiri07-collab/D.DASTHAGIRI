import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Building2,
  Building,
  Smartphone,
  ShieldCheck,
  Zap,
  ChevronRight,
  Star,
  Landmark,
  CheckCircle2,
  Info,
  Layers,
  ArrowUpRight,
  Sparkles,
  Lock,
  Globe
} from 'lucide-react';
import { Bank } from '../types';
import { BANK_DATA } from '../mock/initialData';
import { BankLogo } from './BankLogo';

export type BankCategoryFilter =
  | 'all'
  | 'Public Sector'
  | 'Private'
  | 'Payments Bank'
  | 'Small Finance Bank'
  | 'Regional Rural Bank'
  | 'popular';

interface BankSearchScreenProps {
  banksList?: Bank[];
  onSelectBank: (bank: Bank) => void;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  selectedBankId?: string;
  allowClose?: boolean;
  className?: string;
}

export const BankSearchScreen: React.FC<BankSearchScreenProps> = ({
  banksList = BANK_DATA,
  onSelectBank,
  onClose,
  title = 'Select Your Bank',
  subtitle = 'Search and link any Indian Scheduled Commercial, Private, or Payments Bank via UPI / NPCI',
  selectedBankId,
  allowClose = true,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BankCategoryFilter>('all');

  // Normalize category for tag display
  const getNormalizedCategory = (bank: Bank): 'Public Sector' | 'Private' | 'Payments Bank' | string => {
    if (bank.categoryTag) return bank.categoryTag;
    const cat = (bank.category || '').toLowerCase();
    if (cat.includes('public')) return 'Public Sector';
    if (cat.includes('private')) return 'Private';
    if (cat.includes('payment')) return 'Payments Bank';
    if (cat.includes('small')) return 'Small Finance Bank';
    if (cat.includes('rural') || cat.includes('rrb')) return 'Regional Rural Bank';
    return bank.categoryLabel || 'Public Sector';
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = {
      all: banksList.length,
      'Public Sector': 0,
      'Private': 0,
      'Payments Bank': 0,
      'Small Finance Bank': 0,
      'Regional Rural Bank': 0,
      popular: 0,
    };

    banksList.forEach((b) => {
      if (b.popular) counts.popular++;
      const norm = getNormalizedCategory(b);
      if (norm === 'Public Sector') counts['Public Sector']++;
      else if (norm === 'Private') counts['Private']++;
      else if (norm === 'Payments Bank') counts['Payments Bank']++;
      else if (norm === 'Small Finance Bank') counts['Small Finance Bank']++;
      else if (norm === 'Regional Rural Bank') counts['Regional Rural Bank']++;
    });

    return counts;
  }, [banksList]);

  // Filtered banks
  const filteredBanks = useMemo(() => {
    return banksList.filter((b) => {
      const normCat = getNormalizedCategory(b);

      // Category matching
      if (selectedCategory === 'popular') {
        if (!b.popular) return false;
      } else if (selectedCategory !== 'all') {
        if (normCat !== selectedCategory) return false;
      }

      // Search query matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = b.name.toLowerCase().includes(q);
        const matchesCode = b.code.toLowerCase().includes(q);
        const matchesIfsc = (b.defaultIfsc || b.ifscPrefix || '').toLowerCase().includes(q);
        const matchesBranch = (b.defaultBranch || '').toLowerCase().includes(q);
        const matchesHq = (b.headquarters || '').toLowerCase().includes(q);
        const matchesTag = normCat.toLowerCase().includes(q);
        const matchesHandles = b.upiHandles?.some((h) => h.toLowerCase().includes(q));

        return matchesName || matchesCode || matchesIfsc || matchesBranch || matchesHq || matchesTag || matchesHandles;
      }

      return true;
    });
  }, [banksList, searchQuery, selectedCategory]);

  // Tag Badge Renderer
  const renderCategoryBadge = (normCat: string) => {
    switch (normCat) {
      case 'Public Sector':
        return (
          <span
            id="tag-public-sector"
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-blue-500/15 text-blue-300 border border-blue-400/30 shadow-xs"
          >
            <Landmark className="w-3 h-3 text-blue-400" />
            Public Sector
          </span>
        );
      case 'Private':
        return (
          <span
            id="tag-private"
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-purple-500/15 text-purple-300 border border-purple-400/30 shadow-xs"
          >
            <Building className="w-3 h-3 text-purple-400" />
            Private
          </span>
        );
      case 'Payments Bank':
        return (
          <span
            id="tag-payments-bank"
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-amber-500/15 text-amber-300 border border-amber-400/30 shadow-xs"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            Payments Bank
          </span>
        );
      case 'Small Finance Bank':
        return (
          <span
            id="tag-small-finance"
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-teal-500/15 text-teal-300 border border-teal-400/30 shadow-xs"
          >
            <Building2 className="w-3 h-3 text-teal-400" />
            Small Finance
          </span>
        );
      default:
        return (
          <span
            id="tag-regional-rural"
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 shadow-xs"
          >
            <Layers className="w-3 h-3 text-emerald-400" />
            Regional Rural
          </span>
        );
    }
  };

  return (
    <div id="bank-search-screen" className={`w-full max-w-2xl mx-auto space-y-4 ${className}`}>
      {/* Header Bar */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">{title}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xl">{subtitle}</p>
        </div>
        {allowClose && onClose && (
          <button
            id="btn-close-bank-search"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700/60"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
        <input
          id="input-bank-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Bank Name (HDFC, SBI, ICICI, Axis, Kotak...), IFSC code, or City..."
          className="w-full pl-10 pr-10 py-3 bg-slate-900/90 border-2 border-slate-700/80 focus:border-amber-400/90 rounded-2xl text-white text-xs sm:text-sm placeholder-slate-400 focus:outline-none transition-all shadow-inner"
          autoFocus
        />
        {searchQuery && (
          <button
            id="btn-clear-bank-search"
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-3 text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Filter Chips with Count Badges */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
        {[
          { id: 'all', label: 'All Banks', count: categoryCounts.all },
          { id: 'popular', label: '⭐ Popular', count: categoryCounts.popular },
          { id: 'Public Sector', label: '🏛️ Public Sector', count: categoryCounts['Public Sector'], highlightColor: 'blue' },
          { id: 'Private', label: '🏢 Private', count: categoryCounts['Private'], highlightColor: 'purple' },
          { id: 'Payments Bank', label: '📱 Payments Bank', count: categoryCounts['Payments Bank'], highlightColor: 'amber' },
        ].map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              id={`tab-category-${tab.id.replace(/\s+/g, '-').toLowerCase()}`}
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id as BankCategoryFilter)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-400/40'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700/90 border border-slate-700/60'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900/60 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fast Shortcuts for Major Private Banks */}
      {selectedCategory === 'all' && !searchQuery && (
        <div className="p-3 bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 rounded-2xl border border-indigo-500/20 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            Top Private Banks:
          </span>
          {['HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'IndusInd Bank'].map((bName) => (
            <button
              key={bName}
              type="button"
              onClick={() => setSearchQuery(bName)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800/90 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-700/80 transition-all cursor-pointer"
            >
              {bName}
            </button>
          ))}
        </div>
      )}

      {/* Banks List Display */}
      <div id="bank-list-container" className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
        <AnimatePresence>
          {filteredBanks.length > 0 ? (
            filteredBanks.map((bank, index) => {
              const normCat = getNormalizedCategory(bank);
              const isSelected = selectedBankId === bank.id;

              return (
                <motion.div
                  key={bank.id}
                  id={`bank-card-${bank.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: Math.min(index * 0.02, 0.2) }}
                  onClick={() => onSelectBank(bank)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer group relative flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/20'
                      : normCat === 'Private'
                      ? 'bg-slate-900/80 hover:bg-purple-950/40 border-slate-800 hover:border-purple-500/60'
                      : normCat === 'Public Sector'
                      ? 'bg-slate-900/80 hover:bg-blue-950/40 border-slate-800 hover:border-blue-500/60'
                      : 'bg-slate-900/80 hover:bg-amber-950/40 border-slate-800 hover:border-amber-500/60'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <BankLogo bankName={bank.name} ifscCode={bank.defaultIfsc || bank.ifscPrefix} size="md" />
                      {bank.popular && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[9px] font-black shadow-xs">
                          ★
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors truncate">
                          {bank.name}
                        </h4>
                        {/* Explicit Category Tag */}
                        {renderCategoryBadge(normCat)}
                      </div>

                      {/* Branch & IFSC Details */}
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono flex-wrap">
                        <span>IFSC: {bank.defaultIfsc || bank.ifscPrefix}</span>
                        {bank.defaultBranch && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[240px] text-slate-300 font-sans">
                              {bank.defaultBranch}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Metadata row: UPI Pin & UPI handles */}
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          UPI Enabled ({bank.defaultPinLength || 6}-Digit PIN)
                        </span>
                        {bank.upiHandles && bank.upiHandles.length > 0 && (
                          <span className="text-slate-500 font-mono">
                            Handles: {bank.upiHandles.slice(0, 2).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 group-hover:bg-amber-400 text-slate-300 group-hover:text-slate-950 border border-slate-700/80 group-hover:border-amber-300 transition-all flex items-center gap-1 shadow-xs"
                    >
                      <span>Select</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="py-10 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
              <Building2 className="w-8 h-8 mx-auto text-slate-600 mb-1" />
              <p className="text-sm font-semibold text-slate-300">
                No institutions found matching "{searchQuery}"
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching for HDFC, ICICI, SBI, Axis, Kotak, or clear the category filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                Reset Search & Filters
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer info banner */}
      <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl flex items-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="text-[11px]">
          All listed institutions support NPCI UPI 2.0, Aadhaar OTP authentication, and automated account linking.
        </span>
      </div>
    </div>
  );
};
