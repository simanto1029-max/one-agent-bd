import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  Sparkles,
  ArrowRight,
  Loader2,
  Zap,
  Crown,
  Clock,
  ChevronDown,
  ShieldCheck
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
  const [durationMode, setDurationMode] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedDurationId, setSelectedDurationId] = useState<string>('1m');
  const [expandedPlanIds, setExpandedPlanIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadPlans();
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
  const filteredDurations = PLAN_DURATION_OPTIONS.filter((d) => d.type === durationMode);

  const handleModeChange = (mode: 'monthly' | 'yearly') => {
    setDurationMode(mode);
    if (mode === 'monthly' && !selectedDurationId.endsWith('m')) {
      setSelectedDurationId('1m');
    } else if (mode === 'yearly' && !selectedDurationId.endsWith('y')) {
      setSelectedDurationId('1y');
    }
  };

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
        {/* Top Heading */}
        <div className="text-center max-w-xl mx-auto mb-7">
          <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#7F22FE] dark:text-purple-400 block mb-2">
            PRICING PLANS
          </span>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0F172A] dark:text-white mb-2">
            Choose Your Perfect Plan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Start with our core AI agent or unlock the full Pro Business suite with ERP, 1-click courier dispatch, and auto fraud protection.
          </p>
        </div>

        {/* Pill Billing Cycle Switcher */}
        <div className="flex flex-col items-center gap-3 mb-9">
          <div className="inline-flex items-center p-1 rounded-full bg-white dark:bg-[#150D34] border border-violet-200/80 dark:border-purple-500/25 shadow-sm">
            <button
              type="button"
              onClick={() => handleModeChange('monthly')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                durationMode === 'monthly'
                  ? 'bg-gradient-to-r from-[#7F22FE] to-[#9333EA] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Monthly</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  durationMode === 'monthly'
                    ? 'bg-white/20 text-white'
                    : 'bg-purple-100 dark:bg-purple-950 text-[#7F22FE] dark:text-purple-300'
                }`}
              >
                Up to 15% OFF
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('yearly')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                durationMode === 'yearly'
                  ? 'bg-gradient-to-r from-[#7F22FE] to-[#9333EA] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Yearly (1Y – 6Y)</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  durationMode === 'yearly'
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                }`}
              >
                15% – 30% OFF
              </span>
            </button>
          </div>

          {/* Duration Pills */}
          <div className="inline-flex flex-wrap items-center justify-center gap-1 p-1 rounded-2xl sm:rounded-full bg-white/90 dark:bg-[#130C30] border border-violet-200/70 dark:border-purple-500/20 shadow-2xs">
            {filteredDurations.map((opt) => {
              const isSelected = opt.id === selectedDurationId;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedDurationId(opt.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#7F22FE] text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-violet-50/70 dark:hover:bg-purple-950/40'
                  }`}
                >
                  <span>{opt.label}</span>
                  {opt.discountPercent > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-tight ${
                        isSelected
                          ? 'bg-emerald-400 text-slate-950'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {opt.discountPercent}% OFF
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-14">
            <Loader2 className="w-7 h-7 animate-spin text-[#7F22FE]" />
          </div>
        ) : (
          <>
            {/* Compact Centered 2-Card Grid (Narrower Width & Centered with Premium Ambient Shadow) */}
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
                        <span>Most Popular • Full Pro Suite</span>
                      </div>
                    ) : (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-100 dark:bg-[#1E1445] border border-violet-200 dark:border-purple-500/30 text-slate-700 dark:text-purple-200 text-[10px] font-bold tracking-wide whitespace-nowrap">
                        <span>Core AI Automation</span>
                      </div>
                    )}

                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2.5 mb-3.5 pt-1">
                        <div>
                          <h3 className="text-base sm:text-lg font-black text-[#0F172A] dark:text-white">
                            {plan.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            {isPro
                              ? 'Full ERP, Website Store Sync, Appointments & up to 10 Channels'
                              : 'AI Auto-Reply, Courier Dispatch, Auto Fraud Check & 3 Channels'}
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
                            <>
                              <span className="text-xs font-bold text-rose-500 line-through">
                                TK {originalPrice.toLocaleString()}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold">
                                Save TK {savedAmount.toLocaleString()}
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                          {activeDuration.months === 1
                            ? `Base rate ${plan.price.toLocaleString()} TK/mo • ${activeDuration.days} Days access`
                            : `Effective ${Math.round(totalPrice / activeDuration.months).toLocaleString()} TK/mo • ${activeDuration.discountPercent}% OFF (${activeDuration.days} Days)`}
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

            {/* Free Done-For-You Setup & Risk-Free Guarantee Strip */}
            <div className="max-w-[680px] mx-auto mt-6 p-4 rounded-2xl bg-gradient-to-r from-violet-50/90 via-purple-50/80 to-fuchsia-50/90 dark:from-[#160E36] dark:via-[#1B1142] dark:to-[#160E36] border border-violet-200/80 dark:border-purple-500/30 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#7F22FE] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#7F22FE]/25">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                    100% Free &ldquo;Done-For-You&rdquo; Page &amp; Catalog Setup Included
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                    Don&apos;t worry about technical setup—our team configures your Facebook Page, WhatsApp, product catalog &amp; courier APIs for free.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 text-[10px] font-extrabold uppercase tracking-wider shrink-0">
                Free Setup + 2-Day Trial
              </span>
            </div>

            {/* Why Merchants Switch to One Agent BD (Comparison vs Regular Chatbots & Moderators) */}
            <div className="max-w-3xl mx-auto mt-10 rounded-[24px] bg-white dark:bg-[#120B2B]/95 border border-slate-200/90 dark:border-purple-500/25 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.1)] overflow-hidden">
              <div className="px-5 py-4 bg-slate-50/90 dark:bg-[#18103A] border-b border-slate-200/80 dark:border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7F22FE] dark:text-purple-400">
                    WHY MERCHANTS CHOOSE US
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    One Agent BD vs. Ordinary Chatbots &amp; Human Moderators
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 text-[#7F22FE] dark:text-purple-300 text-[10px] font-extrabold border border-purple-500/20 w-fit">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Save 8,500+ TK Every Month
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-purple-500/15 text-xs">
                {[
                  {
                    feature: '24/7 Bangla, Banglish, Voice Note & Product Photo Reply',
                    others: 'Text-only or robotic replies',
                    ours: 'Included (Instant < 2 sec)'
                  },
                  {
                    feature: '1-Click Steadfast, Pathao & RedX Courier Booking',
                    others: 'Manual copy-paste to courier portal',
                    ours: '1-Click Auto Dispatch & Live Tracking'
                  },
                  {
                    feature: 'Customer Fake Order & Courier Delivery Ratio Check',
                    others: 'Not available (High parcel return loss)',
                    ours: '100% Auto Fraud Shield Included'
                  },
                  {
                    feature: 'VIP Customer & Unordered Lead Retargeting',
                    others: 'No CRM or lead recovery',
                    ours: '1-Click Safe Retargeting Included'
                  },
                  {
                    feature: 'Message Limit & Per-Reply Extra Charges',
                    others: 'Extra fee after 1,000–2,000 messages',
                    ours: 'Unlimited Replies (0 TK Extra)'
                  },
                  {
                    feature: 'Monthly Cost for Your Business',
                    others: 'Moderator: 8,000–12,000 TK/mo',
                    ours: 'Starts at only 1,250 TK/mo'
                  }
                ].map((row, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 sm:px-5 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center"
                  >
                    <div className="sm:col-span-6 font-bold text-slate-800 dark:text-slate-100 text-[11px] sm:text-xs">
                      {row.feature}
                    </div>
                    <div className="sm:col-span-3 text-[11px] text-slate-400 dark:text-slate-500 line-through sm:no-underline">
                      ✕ {row.others}
                    </div>
                    <div className="sm:col-span-3 flex items-center gap-1.5 font-extrabold text-[11px] text-emerald-600 dark:text-emerald-400">
                      <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-500 shrink-0" />
                      <span>{row.ours}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
