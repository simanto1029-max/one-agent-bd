import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  ArrowRight,
  Loader2,
  Zap,
  Crown,
  Clock,
  ChevronDown,
  Calendar
} from 'lucide-react';
import { api } from '../../api';
import { Plan } from '../../types';
import {
  PLAN_DURATION_OPTIONS,
  OFFICIAL_PLANS,
  calculateCustomPlanPrice,
  calculateOriginalPlanPrice
} from '../../utils/pricingPlans';

interface PricingTableProps {
  onSelectPlan: (plan: Plan, action?: 'buy' | 'trial') => void;
}

export const PricingTable: React.FC<PricingTableProps> = ({ onSelectPlan }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDurationId, setSelectedDurationId] = useState<string>('1m');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedPlanIds, setExpandedPlanIds] = useState<Record<string, boolean>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await api.getPlans();
      const activePlans = data.filter((p) => p.is_active);
      if (activePlans.length >= 2) {
        const starter =
          activePlans.find((p) => p.price === 1250 || p.id === 'plan_starter') || OFFICIAL_PLANS[0];
        const pro =
          activePlans.find((p) => p.price === 1950 || p.id === 'plan_pro') || OFFICIAL_PLANS[1];
        setPlans([
          { ...OFFICIAL_PLANS[0], ...starter, price: 1250, features: OFFICIAL_PLANS[0].features },
          { ...OFFICIAL_PLANS[1], ...pro, price: 1950, features: OFFICIAL_PLANS[1].features }
        ]);
      } else {
        setPlans(OFFICIAL_PLANS);
      }
    } catch (err) {
      console.error('Failed to fetch plans:', err);
      setPlans(OFFICIAL_PLANS);
    } finally {
      setLoading(false);
    }
  };

  const displayPlans = plans.length === 2 ? plans : OFFICIAL_PLANS;
  const activeDuration =
    PLAN_DURATION_OPTIONS.find((d) => d.id === selectedDurationId) || PLAN_DURATION_OPTIONS[0];

  const toggleExpandFeatures = (planId: string) => {
    setExpandedPlanIds((prev) => ({
      ...prev,
      [planId]: !prev[planId]
    }));
  };

  return (
    <section
      id="pricing"
      className="py-14 sm:py-18 bg-white dark:bg-[#0B0720] border-t border-slate-100 dark:border-purple-500/15 relative overflow-hidden transition-colors"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Clean Minimal Header */}
        <div className="text-center max-w-lg mx-auto mb-6">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#7F22FE] dark:text-purple-400 block mb-1.5">
            PRICING PLANS
          </span>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0F172A] dark:text-white mb-1.5">
            Choose Your Perfect Plan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            2-Day Free Trial • Zero Per-Message Fee • Cancel Anytime
          </p>
        </div>

        {/* Single Sleek Duration Dropdown Selector */}
        <div className="flex justify-center mb-9">
          <div ref={dropdownRef} className="relative inline-block">
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="pl-3.5 pr-3 py-2 rounded-full bg-white dark:bg-[#150D34] border border-slate-200/90 dark:border-purple-500/30 shadow-xs hover:border-[#7F22FE]/60 transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#7F22FE] dark:text-purple-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Billing Duration:
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#7F22FE] text-white text-xs font-extrabold flex items-center gap-1.5">
                <span>{activeDuration.label}</span>
                {activeDuration.discountPercent > 0 && (
                  <span className="text-[10px] text-purple-100 font-bold">
                    • Save {activeDuration.discountPercent}%
                  </span>
                )}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-500 dark:text-purple-300 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Clean Dropdown List */}
            {dropdownOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-60 rounded-2xl bg-white dark:bg-[#160E36] border border-slate-200/90 dark:border-purple-500/30 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.22)] p-1.5 z-30">
                {PLAN_DURATION_OPTIONS.map((opt) => {
                  const isSelected = opt.id === selectedDurationId;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedDurationId(opt.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#7F22FE] text-white'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-violet-50 dark:hover:bg-purple-950/60'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {opt.discountPercent > 0 ? (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          Save {opt.discountPercent}%
                        </span>
                      ) : (
                        <span
                          className={`text-[10px] font-semibold ${
                            isSelected ? 'text-purple-200' : 'text-slate-400'
                          }`}
                        >
                          Standard
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-14">
            <Loader2 className="w-7 h-7 animate-spin text-[#7F22FE]" />
          </div>
        ) : (
          <>
            {/* Compact Centered 2-Card Grid */}
            <div className="max-w-[680px] mx-auto relative">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-4 rounded-[36px] bg-gradient-to-r from-violet-500/12 via-purple-500/15 to-fuchsia-500/12 blur-2xl -z-10"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start justify-center">
              {displayPlans.map((plan, index) => {
                const isPro = plan.price >= 1950 || plan.id.includes('pro');
                const originalPrice = calculateOriginalPlanPrice(plan.price, activeDuration.months);
                const totalPrice = calculateCustomPlanPrice(plan.price, activeDuration.months);
                const savedAmount = Math.max(0, originalPrice - totalPrice);

                const halfIndex = Math.ceil(plan.features.length / 2);
                const firstHalfFeatures = plan.features.slice(0, halfIndex);
                const secondHalfFeatures = plan.features.slice(halfIndex);
                const isExpanded = Boolean(expandedPlanIds[plan.id]);

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.08 }}
                    className={`w-full sm:max-w-[330px] mx-auto relative rounded-[24px] p-5 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 ${
                      isPro
                        ? 'bg-gradient-to-b from-white via-[#FBF9FF] to-[#F3EAFF] dark:from-[#1C1145] dark:via-[#150C35] dark:to-[#11092B] border-2 border-[#7F22FE] shadow-[0_28px_70px_-10px_rgba(127,34,254,0.38),0_16px_36px_-8px_rgba(219,39,119,0.24),0_4px_16px_rgba(15,23,42,0.08)] hover:shadow-[0_34px_80px_-10px_rgba(127,34,254,0.48),0_18px_40px_-8px_rgba(219,39,119,0.3)] ring-1 ring-fuchsia-500/20'
                        : 'bg-white dark:bg-[#120B2B]/95 border border-violet-200/95 dark:border-purple-500/25 shadow-[0_24px_60px_-12px_rgba(15,23,42,0.16),0_14px_32px_-8px_rgba(124,58,237,0.18),0_4px_14px_rgba(15,23,42,0.06)] hover:shadow-[0_30px_70px_-12px_rgba(124,58,237,0.28)] dark:shadow-[0_24px_60px_-12px_rgba(124,58,237,0.32)]'
                    }`}
                  >
                    {/* Top Floating Pill Badge */}
                    {isPro ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-gradient-to-r from-[#7F22FE] via-[#9333EA] to-[#DB2777] text-white text-[10px] font-extrabold tracking-wide shadow-md flex items-center gap-1 whitespace-nowrap">
                        <Crown className="w-3 h-3" />
                        <span>Most Popular</span>
                      </div>
                    ) : (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-100 dark:bg-[#1E1445] border border-violet-200 dark:border-purple-500/30 text-slate-700 dark:text-purple-200 text-[10px] font-bold tracking-wide whitespace-nowrap">
                        <span>Starter Suite</span>
                      </div>
                    )}

                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between gap-2.5 mb-3.5 pt-1">
                        <div>
                          <h3 className="text-base sm:text-lg font-black text-[#0F172A] dark:text-white leading-tight">
                            {plan.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                            {isPro
                              ? 'Up to 10 Channels • Full ERP & Web'
                              : 'Up to 3 Channels • Full AI & Courier'}
                          </p>
                        </div>

                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isPro
                              ? 'bg-gradient-to-br from-[#7F22FE] to-[#DB2777] text-white shadow-md shadow-purple-500/25'
                              : 'bg-purple-100 dark:bg-purple-950/70 text-[#7F22FE] dark:text-purple-300'
                          }`}
                        >
                          {isPro ? <Crown className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                        </div>
                      </div>

                      {/* Price Display */}
                      <div className="mb-4 pb-3.5 border-b border-violet-100 dark:border-purple-500/15">
                        <div className="flex flex-wrap items-baseline gap-1.5">
                          <span className="text-2xl sm:text-[28px] font-black tracking-tight text-[#0F172A] dark:text-white">
                            TK {totalPrice.toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            /{activeDuration.months === 1 ? 'mo' : activeDuration.shortLabel}
                          </span>
                          {savedAmount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold">
                              Save TK {savedAmount.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-400 font-semibold mt-0.5">
                          {activeDuration.days} Days Access • Unlimited 0 TK/Msg
                        </p>
                      </div>

                      {/* First Half Features Always Visible */}
                      <ul className="space-y-2">
                        {firstHalfFeatures.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-slate-200">
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                isPro
                                  ? 'bg-[#7F22FE]/15 text-[#7F22FE] dark:bg-purple-500/25 dark:text-purple-300'
                                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                            <span className="leading-snug font-medium">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Second Half Features Smooth Accordion */}
                      {secondHalfFeatures.length > 0 && (
                        <>
                          <div
                            className={`grid transition-all duration-300 ease-in-out ${
                              isExpanded
                                ? 'grid-rows-[1fr] opacity-100 mt-2'
                                : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
                            }`}
                          >
                            <div className="overflow-hidden">
                              <ul className="space-y-2 pt-0.5">
                                {secondHalfFeatures.map((feature, i) => (
                                  <li key={i} className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-slate-200">
                                    <div
                                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                        isPro
                                          ? 'bg-[#7F22FE]/15 text-[#7F22FE] dark:bg-purple-500/25 dark:text-purple-300'
                                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                      }`}
                                    >
                                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    </div>
                                    <span className="leading-snug font-medium">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleExpandFeatures(plan.id)}
                            className="mt-3 mb-4 w-full py-1.5 px-3 rounded-xl bg-violet-50/80 dark:bg-purple-950/40 hover:bg-violet-100 dark:hover:bg-purple-900/50 text-[#7F22FE] dark:text-purple-300 text-[11px] font-extrabold flex items-center justify-center gap-1.5 border border-violet-200/60 dark:border-purple-500/20 transition-all cursor-pointer"
                          >
                            <span>
                              {isExpanded
                                ? 'Show Less Features'
                                : `See More Features (+${secondHalfFeatures.length})`}
                            </span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform duration-300 ${
                                isExpanded ? 'rotate-180' : 'rotate-0'
                              }`}
                            />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          onSelectPlan(
                            {
                              ...plan,
                              price: totalPrice,
                              duration_days: activeDuration.days,
                              name: `${plan.name} (${activeDuration.label})`
                            },
                            'buy'
                          )
                        }
                        className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isPro
                            ? 'bg-gradient-to-r from-[#7F22FE] via-[#9333EA] to-[#C026D3] hover:from-[#6D28D9] hover:to-[#A21CAF] text-white shadow-[0_6px_20px_rgba(127,34,254,0.38)]'
                            : 'bg-[#1E1442] dark:bg-purple-950/90 hover:bg-[#7F22FE] dark:hover:bg-[#7F22FE] text-white border border-purple-500/30 shadow-sm'
                        }`}
                      >
                        <span>
                          Buy {isPro ? 'Pro Plan' : 'Starter Plan'} — TK {totalPrice.toLocaleString()}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onSelectPlan(
                            {
                              ...plan,
                              price: plan.price,
                              duration_days: 2,
                              trial_days: 2
                            },
                            'trial'
                          )
                        }
                        className="w-full py-2 px-3 rounded-xl bg-violet-50/70 dark:bg-[#1A103C] hover:bg-violet-100/80 dark:hover:bg-[#23164F] text-[#7F22FE] dark:text-purple-300 border border-violet-200/70 dark:border-purple-500/25 font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Clock className="w-3 h-3" />
                        <span>Start 2 Days Free Trial</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
