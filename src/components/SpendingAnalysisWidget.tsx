import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  PieChart as PieChartIcon,
  Utensils,
  Car,
  Zap,
  ShoppingBag,
  Film,
  HeartPulse,
  Briefcase,
  Layers,
  TrendingDown,
  ChevronRight,
  Sparkles,
  Info,
  BellRing,
  AlertTriangle,
  Sliders,
  X,
  CheckCircle2,
  Bell,
  ShieldAlert,
  ArrowUpRight,
  RotateCcw,
} from 'lucide-react';
import { BankTransaction } from '../types';

interface Props {
  transactions: BankTransaction[];
  isPrivacyMode?: boolean;
}

export interface CategoryExpense {
  category: string;
  amount: number;
  color: string;
  icon: React.ElementType;
  count: number;
  percentage: number;
  limit: number;
  isExceeded: boolean;
  excessAmount: number;
}

export interface PushNotificationAlert {
  id: string;
  category: string;
  spent: number;
  limit: number;
  excess: number;
  timestamp: string;
}

const CATEGORY_COLORS: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  Food: { color: '#F59E0B', bg: 'bg-amber-500/10 text-amber-500', icon: Utensils },
  Travel: { color: '#38BDF8', bg: 'bg-sky-500/10 text-sky-400', icon: Car },
  Utilities: { color: '#EC4899', bg: 'bg-pink-500/10 text-pink-400', icon: Zap },
  Shopping: { color: '#8B5CF6', bg: 'bg-purple-500/10 text-purple-400', icon: ShoppingBag },
  Entertainment: { color: '#10B981', bg: 'bg-emerald-500/10 text-emerald-400', icon: Film },
  Health: { color: '#EF4444', bg: 'bg-red-500/10 text-red-400', icon: HeartPulse },
  Services: { color: '#6366F1', bg: 'bg-indigo-500/10 text-indigo-400', icon: Briefcase },
  Other: { color: '#64748B', bg: 'bg-slate-500/10 text-slate-400', icon: Layers },
};

const DEFAULT_CATEGORY_LIMITS: Record<string, number> = {
  Food: 2000,
  Travel: 1000,
  Utilities: 2000,
  Shopping: 3000,
  Entertainment: 800,
  Health: 1500,
  Services: 3000,
  Other: 1000,
};

export const SpendingAnalysisWidget: React.FC<Props> = ({
  transactions,
  isPrivacyMode = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredSlice, setHoveredSlice] = useState<CategoryExpense | null>(null);
  const [timePeriod, setTimePeriod] = useState<'all' | 'august_2026'>('august_2026');

  // Budget Limits State
  const [categoryLimits, setCategoryLimits] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('docpay_category_limits');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_CATEGORY_LIMITS;
  });

  const [showLimitsModal, setShowLimitsModal] = useState<boolean>(false);
  const [activePushNotifications, setActivePushNotifications] = useState<PushNotificationAlert[]>([]);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<Set<string>>(new Set());
  const [toastBanner, setToastBanner] = useState<PushNotificationAlert | null>(null);
  const [editingLimits, setEditingLimits] = useState<Record<string, number>>({ ...categoryLimits });

  // Save limits to local storage
  const handleSaveLimits = () => {
    setCategoryLimits(editingLimits);
    try {
      localStorage.setItem('docpay_category_limits', JSON.stringify(editingLimits));
    } catch {
      // ignore
    }
    setShowLimitsModal(false);
  };

  const handleResetDefaultLimits = () => {
    setEditingLimits(DEFAULT_CATEGORY_LIMITS);
  };

  // Categorize transactions and compare with limits
  const { categoryData, totalExpense, outgoingCount, exceededCategories } = useMemo(() => {
    const outgoing = transactions.filter((t) => {
      if (t.type !== 'send' || t.status === 'failed') return false;
      if (timePeriod === 'august_2026') {
        return t.timestamp.includes('2026-08');
      }
      return true;
    });

    const categoryMap: Record<string, { amount: number; count: number }> = {};
    let total = 0;

    outgoing.forEach((tx) => {
      let cat = tx.category || 'Other';

      // Infer category if not explicit or 'Other'
      if (!tx.category || tx.category === 'Other') {
        const note = (tx.note || '').toLowerCase();
        const recipient = (tx.recipientName || '').toLowerCase();
        const combined = `${note} ${recipient}`;

        if (/food|swiggy|zomato|restaurant|cafe|dinner|lunch|sweets|gourmet|grocery/i.test(combined)) {
          cat = 'Food';
        } else if (/uber|ola|cab|travel|ride|flight|train|fuel|petrol|transport/i.test(combined)) {
          cat = 'Travel';
        } else if (/bill|electricity|tsspdcl|water|gas|recharge|mobile|wifi|broadband|utility|airtel/i.test(combined)) {
          cat = 'Utilities';
        } else if (/amazon|flipkart|shopping|store|apparel|clothes|electronics|headphones/i.test(combined)) {
          cat = 'Shopping';
        } else if (/movie|cinema|bookmyshow|bms|entertainment|netflix|game|hotstar/i.test(combined)) {
          cat = 'Entertainment';
        } else if (/pharmacy|health|apollo|doctor|hospital|medicine|clinic/i.test(combined)) {
          cat = 'Health';
        } else if (/consulting|service|fee|rent|payout/i.test(combined)) {
          cat = 'Services';
        }
      }

      if (!categoryMap[cat]) {
        categoryMap[cat] = { amount: 0, count: 0 };
      }
      categoryMap[cat].amount += tx.amount;
      categoryMap[cat].count += 1;
      total += tx.amount;
    });

    const exceededList: CategoryExpense[] = [];

    const list: CategoryExpense[] = Object.keys(categoryMap).map((catKey) => {
      const config = CATEGORY_COLORS[catKey] || CATEGORY_COLORS.Other;
      const amt = categoryMap[catKey].amount;
      const pct = total > 0 ? (amt / total) * 100 : 0;
      const limit = categoryLimits[catKey] ?? 2000;
      const isExceeded = amt > limit;
      const excessAmount = isExceeded ? amt - limit : 0;

      const catObj: CategoryExpense = {
        category: catKey,
        amount: amt,
        color: config.color,
        icon: config.icon,
        count: categoryMap[catKey].count,
        percentage: Math.round(pct * 10) / 10,
        limit,
        isExceeded,
        excessAmount,
      };

      if (isExceeded) {
        exceededList.push(catObj);
      }

      return catObj;
    });

    // Sort by amount descending
    list.sort((a, b) => b.amount - a.amount);

    return {
      categoryData: list,
      totalExpense: total,
      outgoingCount: outgoing.length,
      exceededCategories: exceededList,
    };
  }, [transactions, timePeriod, categoryLimits]);

  // Trigger Push Notifications when limit is breached
  useEffect(() => {
    if (exceededCategories.length > 0) {
      const newNotifications: PushNotificationAlert[] = exceededCategories.map((cat) => ({
        id: `notif-${cat.category}-${cat.amount}`,
        category: cat.category,
        spent: cat.amount,
        limit: cat.limit,
        excess: cat.excessAmount,
        timestamp: 'Just Now',
      }));

      setActivePushNotifications(newNotifications);

      // Trigger toast banner for the worst offender if not dismissed
      const firstUndismissed = newNotifications.find((n) => !dismissedNotificationIds.has(n.id));
      if (firstUndismissed) {
        setToastBanner(firstUndismissed);

        // Optional Web Browser Notification API call
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(`⚠️ DocPay Alert: ${firstUndismissed.category} Limit Exceeded!`, {
              body: `You spent ₹${firstUndismissed.spent.toLocaleString()} which exceeds your ₹${firstUndismissed.limit.toLocaleString()} monthly budget limit.`,
              icon: '/favicon.ico',
            });
          } catch {
            // ignore
          }
        }
      }
    } else {
      setActivePushNotifications([]);
      setToastBanner(null);
    }
  }, [exceededCategories, dismissedNotificationIds]);

  // SVG dimensions for D3 Chart
  const svgWidth = 260;
  const svgHeight = 260;
  const outerRadius = 105;
  const innerRadius = 68;

  // Generate D3 pie arcs
  const pieData = useMemo(() => {
    const pieGenerator = d3
      .pie<CategoryExpense>()
      .value((d) => d.amount)
      .sort(null)
      .padAngle(0.04);

    return pieGenerator(categoryData);
  }, [categoryData]);

  // Arc generators
  const arcGenerator = useMemo(() => {
    return d3
      .arc<d3.PieArcDatum<CategoryExpense>>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(6);
  }, []);

  const hoverArcGenerator = useMemo(() => {
    return d3
      .arc<d3.PieArcDatum<CategoryExpense>>()
      .innerRadius(innerRadius - 4)
      .outerRadius(outerRadius + 8)
      .cornerRadius(8);
  }, []);

  const activeDisplay = hoveredSlice || (selectedCategory ? categoryData.find((c) => c.category === selectedCategory) : null);

  const requestBrowserNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted' && toastBanner) {
          new Notification(`DocPay Push Notifications Activated`, {
            body: `You will now receive automatic push notifications when category spending exceeds your limit.`,
          });
        }
      });
    }
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-2xl transition-all relative">
      {/* TOP FLOATING PUSH NOTIFICATION TOAST BANNER */}
      {toastBanner && (
        <div className="mb-5 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="bg-gradient-to-r from-red-950/90 via-slate-900 to-amber-950/90 border-2 border-red-500/70 rounded-2xl p-4 shadow-2xl shadow-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
            {/* Ambient Red Glow Backing */}
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start sm:items-center gap-3.5 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0 animate-pulse text-red-400">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500 text-white uppercase tracking-wider flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Push Alert
                  </span>
                  <span className="text-xs font-bold text-red-300">
                    Category Spending Limit Exceeded
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-medium mt-1">
                  You spent <strong className="text-red-400 font-mono">₹{toastBanner.spent.toLocaleString()}</strong> in <span className="text-amber-300 font-bold">{toastBanner.category}</span>, exceeding your monthly limit of <strong className="text-slate-300 font-mono">₹{toastBanner.limit.toLocaleString()}</strong> by <span className="text-red-400 font-extrabold">+₹{toastBanner.excess.toLocaleString()}</span>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 relative z-10 self-end sm:self-center">
              <button
                onClick={() => {
                  setEditingLimits({ ...categoryLimits });
                  setShowLimitsModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" /> Adjust Limits
              </button>
              <button
                onClick={() => {
                  setDismissedNotificationIds((prev) => new Set(prev).add(toastBanner.id));
                  setToastBanner(null);
                }}
                className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Dismiss Push Notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            <PieChartIcon className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-white tracking-tight">
                Spending Analysis & Limit Monitor
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                D3 Powered
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time expense categorization and automated monthly limit breach detection
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Exceeded Warning Counter / Limits Settings Button */}
          <button
            onClick={() => {
              setEditingLimits({ ...categoryLimits });
              setShowLimitsModal(true);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              exceededCategories.length > 0
                ? 'bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30 animate-pulse'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {exceededCategories.length > 0 ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>{exceededCategories.length} Limit Breach{exceededCategories.length > 1 ? 'es' : ''}</span>
              </>
            ) : (
              <>
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>Set Monthly Limits</span>
              </>
            )}
          </button>

          {/* Time Period Filter Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setTimePeriod('august_2026')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                timePeriod === 'august_2026'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Aug 2026
            </button>
            <button
              onClick={() => setTimePeriod('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                timePeriod === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Outgoing
            </button>
          </div>
        </div>
      </div>

      {categoryData.length === 0 ? (
        <div className="py-10 text-center text-slate-500">
          <TrendingDown className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold">No outgoing expense transactions recorded.</p>
          <p className="text-xs text-slate-600 mt-1">Make payments to view categorized monthly pie chart insights.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: D3 Interactive Pie Chart */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative w-[260px] h-[260px] flex items-center justify-center">
              <svg
                width={svgWidth}
                height={svgHeight}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="overflow-visible"
              >
                <g transform={`translate(${svgWidth / 2}, ${svgHeight / 2})`}>
                  {pieData.map((slice, index) => {
                    const isSelected = selectedCategory === slice.data.category;
                    const isHovered = hoveredSlice?.category === slice.data.category;
                    const pathD = isHovered || isSelected ? hoverArcGenerator(slice) : arcGenerator(slice);

                    return (
                      <path
                        key={slice.data.category || index}
                        d={pathD || ''}
                        fill={slice.data.isExceeded ? '#EF4444' : slice.data.color}
                        className="transition-all duration-200 cursor-pointer"
                        style={{
                          filter: isHovered || isSelected ? `drop-shadow(0 0 10px ${slice.data.isExceeded ? '#EF4444' : slice.data.color}A0)` : 'none',
                          opacity: hoveredSlice || selectedCategory
                            ? isHovered || isSelected ? 1 : 0.45
                            : 0.9,
                        }}
                        onMouseEnter={() => setHoveredSlice(slice.data)}
                        onMouseLeave={() => setHoveredSlice(null)}
                        onClick={() =>
                          setSelectedCategory((prev) =>
                            prev === slice.data.category ? null : slice.data.category
                          )
                        }
                      />
                    );
                  })}
                </g>
              </svg>

              {/* Center Donut Ring Display */}
              <div
                className="absolute inset-0 m-auto w-[130px] h-[130px] rounded-full bg-slate-950/90 border border-slate-800 flex flex-col items-center justify-center text-center p-2 shadow-inner pointer-events-none"
              >
                {activeDisplay ? (
                  <>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: activeDisplay.isExceeded ? '#EF4444' : activeDisplay.color }}
                    >
                      {activeDisplay.category}
                    </span>
                    <span
                      className={`text-base font-black font-mono text-white tracking-tight mt-0.5 ${
                        isPrivacyMode ? 'filter blur-sm select-none opacity-80' : ''
                      }`}
                    >
                      ₹{activeDisplay.amount.toLocaleString('en-IN')}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold ${
                        activeDisplay.isExceeded ? 'text-red-400' : 'text-slate-400'
                      }`}
                    >
                      {activeDisplay.isExceeded
                        ? `⚠️ Exceeded Limit (₹${activeDisplay.limit.toLocaleString()})`
                        : `${Math.round((activeDisplay.amount / activeDisplay.limit) * 100)}% of Limit`}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Total Expenses
                    </span>
                    <span
                      className={`text-lg font-black font-mono text-amber-400 tracking-tight mt-0.5 ${
                        isPrivacyMode ? 'filter blur-sm select-none opacity-80' : ''
                      }`}
                    >
                      ₹{totalExpense.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {outgoingCount} Outgoing Payments
                    </span>
                  </>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-2 text-center flex items-center justify-center gap-1">
              <Info className="w-3 h-3 text-slate-500" />
              <span>Red slices indicate categories that have breached monthly limits</span>
            </p>
          </div>

          {/* Right Column: Category Breakdown Legend List */}
          <div className="lg:col-span-7 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1 mb-1">
              <span>Category ({categoryData.length})</span>
              <div className="flex items-center gap-3">
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-amber-400 hover:text-amber-300 text-[11px] font-bold underline cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
                <span>Spent / Monthly Limit</span>
              </div>
            </div>

            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
              {categoryData.map((item) => {
                const IconComponent = item.icon;
                const isSelected = selectedCategory === item.category;
                const isHovered = hoveredSlice?.category === item.category;
                const limitUsagePct = Math.round((item.amount / item.limit) * 100);

                return (
                  <div
                    key={item.category}
                    onClick={() =>
                      setSelectedCategory((prev) => (prev === item.category ? null : item.category))
                    }
                    onMouseEnter={() => setHoveredSlice(item)}
                    onMouseLeave={() => setHoveredSlice(null)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      item.isExceeded
                        ? 'bg-red-950/20 border-red-500/50 shadow-md ring-1 ring-red-500/30'
                        : isSelected || isHovered
                        ? 'bg-slate-800/90 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Left: Color dot, Icon & Label */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/10"
                        style={{
                          backgroundColor: item.isExceeded ? '#EF444420' : `${item.color}20`,
                          color: item.isExceeded ? '#EF4444' : item.color,
                        }}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-white truncate">
                            {item.category}
                          </span>
                          {item.isExceeded ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-red-500 text-white uppercase tracking-wider flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" /> EXCEEDED
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-500">
                              ({item.count} {item.count === 1 ? 'tx' : 'txns'})
                            </span>
                          )}
                        </div>

                        {/* Progress Bar against Limit */}
                        <div className="w-28 sm:w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5 relative">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.isExceeded ? 'bg-red-500' : ''
                            }`}
                            style={{
                              width: `${Math.min(limitUsagePct, 100)}%`,
                              backgroundColor: item.isExceeded ? '#EF4444' : item.color,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Limit Usage */}
                    <div className="text-right shrink-0">
                      <div
                        className={`font-mono font-black text-sm ${
                          item.isExceeded ? 'text-red-400' : 'text-white'
                        } ${isPrivacyMode ? 'filter blur-sm select-none opacity-80' : ''}`}
                      >
                        ₹{item.amount.toLocaleString('en-IN')}
                      </div>
                      <div
                        className={`text-[10px] font-extrabold ${
                          item.isExceeded ? 'text-red-400' : 'text-slate-400'
                        }`}
                      >
                        {item.isExceeded
                          ? `Over Limit by ₹${item.excessAmount.toLocaleString()}`
                          : `${limitUsagePct}% of ₹${item.limit.toLocaleString()} Limit`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY LIMITS MODAL */}
      {showLimitsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Monthly Category Spending Limits</h3>
                  <p className="text-xs text-slate-400">Set budget thresholds to trigger push notifications</p>
                </div>
              </div>
              <button
                onClick={() => setShowLimitsModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Limits Inputs */}
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
              {Object.keys(CATEGORY_COLORS).map((catKey) => {
                const config = CATEGORY_COLORS[catKey];
                const IconComp = config.icon;
                const currentVal = editingLimits[catKey] ?? 2000;
                const actualSpent = categoryData.find((c) => c.category === catKey)?.amount || 0;
                const isWillExceed = actualSpent > currentVal;

                return (
                  <div
                    key={catKey}
                    className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${config.color}20`, color: config.color }}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white block">{catKey}</span>
                        <span className="text-[10px] text-slate-400">
                          Spent: <strong className="text-slate-300 font-mono">₹{actualSpent.toLocaleString()}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isWillExceed && (
                        <span className="text-[10px] font-bold text-red-400 flex items-center gap-0.5">
                          <AlertTriangle className="w-3 h-3" /> Breach
                        </span>
                      )}
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-xs font-mono text-slate-400">₹</span>
                        <input
                          type="number"
                          value={currentVal}
                          onChange={(e) =>
                            setEditingLimits({
                              ...editingLimits,
                              [catKey]: Math.max(0, parseInt(e.target.value) || 0),
                            })
                          }
                          className="w-24 pl-6 pr-2 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-500 text-right"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-4 gap-2">
              <button
                type="button"
                onClick={handleResetDefaultLimits}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowLimitsModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveLimits}
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Save & Monitor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

