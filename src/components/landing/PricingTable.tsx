import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Lock,
  Loader2,
  ChevronDown,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '../../api';
import { Plan } from '../../types';
import {
  PLAN_DURATION_OPTIONS,
  OFFICIAL_THREE_PLANS,
  calculateCustomPlanPrice,
  calculateOriginalPlanPrice,
  normalizeToThreePlans
} from '../../utils/pricingPlans';

interface PricingTableProps {
  onSelectPlan: (plan: Plan, action?: 'buy' | 'trial') => void;
}

export const PricingTable: React.FC<PricingTableProps> = ({ onSelectPlan }) => {
  const [plans, setPlans] = useState<Plan[]>(OFFICIAL_THREE_PLANS);
  const [loading, setLoading] = useState(true);
  const [selectedDurationId, setSelectedDurationId] = useState<string>('1m');
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
        setPlans(normalizeToThreePlans(activePlans));
      } else {
        setPlans(OFFICIAL_THREE_PLANS);
      }
    } catch (err) {
      console.error('Failed to fetch plans:', err);
      setPlans(OFFICIAL_THREE_PLANS);
    } finally {
      setLoading(false);
    }
  };

  const displayPlans = plans.length >= 3 ? plans.slice(0, 3) : OFFICIAL_THREE_PLANS;
  const activeDuration =
    PLAN_DURATION_OPTIONS.find((d) => d.id === selectedDurationId) || PLAN_DURATION_OPTIONS[0];

  return (
    <section
      id="pricing"
      className="py-16 sm:py-24 bg-[#FAFAFC] dark:bg-[#070415] border-t border-slate-200/70 dark:border-purple-500/15 relative overflow-hidden transition-colors"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#7C3AED]/10 via-purple-600/5 to-transparent blur-3xl pointer-events-none -z-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* LazyChat Style Top Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-500/30 text-[#7C3AED] dark:text-purple-300 text-[11px] font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PRICING PLANS</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            We believe One Agent BD should be accessible to all companies, no matter the size.
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            <strong className="text-slate-900 dark:text-slate-200">Facebook &amp; Instagram:</strong> 100% Unlimited AI auto-replies with 0 Meta fee.
            <br className="hidden sm:inline" />{' '}
            <strong className="text-slate-900 dark:text-slate-200">WhatsApp Cloud API:</strong> Official Meta conversation fees are billed directly to your Meta Business Manager card at Meta&apos;s exact official cost with 0% markup.
          </p>
        </div>

        {/* Single Sleek Duration Dropdown Selector */}
        <div className="flex justify-center mb-10 sm:mb-12">
          <div ref={dropdownRef} className="relative inline-block">
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="pl-4 pr-3.5 py-2.5 rounded-full bg-white dark:bg-[#120B2E] border border-slate-200/90 dark:border-purple-500/30 shadow-xs hover:border-[#7C3AED]/60 transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#7C3AED] dark:text-purple-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Billing Duration:
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#7C3AED] text-white text-xs font-extrabold flex items-center gap-1.5">
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

            {dropdownOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 rounded-2xl bg-white dark:bg-[#150D36] border border-slate-200/90 dark:border-purple-500/30 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.25)] p-2 z-30">
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
                          ? 'bg-[#7C3AED] text-white'
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
                          Regular
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
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
          </div>
        ) : (
          /* 3 LazyChat-Style Cards in Horizontal Responsive Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7 items-stretch">
            {displayPlans.map((plan, index) => {
              const isTrial = plan.id === 'plan_trial' || plan.price === 0;
              const isPopular = plan.id === 'plan_starter' || plan.badge === 'Popular';
              const isPro = plan.id === 'plan_pro' || plan.price >= 1950;

              const originalPrice = isTrial
                ? 0
                : calculateOriginalPlanPrice(plan.price, activeDuration.months);
              const totalPrice = isTrial
                ? 0
                : calculateCustomPlanPrice(plan.price, activeDuration.months);
              const savedAmount = Math.max(0, originalPrice - totalPrice);

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
                    isPopular
                      ? 'bg-white dark:bg-[#110B29] border-2 border-[#7C3AED] shadow-[0_0_45px_rgba(124,58,237,0.22)] ring-1 ring-[#7C3AED]/30'
                      : 'bg-white dark:bg-[#0D0822] border border-slate-200/90 dark:border-purple-500/20 shadow-xs hover:border-[#7C3AED]/40'
                  }`}
                >
                  {/* Top Section */}
                  <div>
                    {/* Plan Header & Popular Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {plan.name}
                      </span>

                      {isPopular && (
                        <span className="px-3 py-1 rounded-full bg-[#7C3AED] text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                          Popular
                        </span>
                      )}
                      {isTrial && (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-purple-950/70 text-slate-700 dark:text-purple-300 text-[10px] font-bold border border-slate-200 dark:border-purple-500/20">
                          2 Days Free
                        </span>
                      )}
                      {isPro && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold border border-amber-500/20">
                          Advanced
                        </span>
                      )}
                    </div>

                    {/* Massive Bold Price */}
                    <div className="mb-2">
                      <div className="flex items-baseline gap-1">
                        <span className="font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white leading-none">
                          ৳
                        </span>
                        <span className="font-black text-4xl sm:text-5xl tracking-tight text-slate-900 dark:text-white leading-none">
                          {isTrial ? '0' : totalPrice.toLocaleString()}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">
                          {isTrial
                            ? 'for 2 days'
                            : activeDuration.months === 1
                            ? 'per month'
                            : `for ${activeDuration.label}`}
                        </span>
                      </div>

                      {savedAmount > 0 && !isTrial && (
                        <div className="mt-1.5 inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                          Save ৳{savedAmount.toLocaleString()} with {activeDuration.label} billing
                        </div>
                      )}
                    </div>

                    {/* Subtitle like Growing teams */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-6">
                      {plan.subtitle ||
                        (isTrial
                          ? 'Growing teams up to 03 users (Testing full automation).'
                          : isPopular
                          ? 'Growing teams up to 05 users.'
                          : 'Growing teams up to 10 users & high volume.')}
                    </p>

                    {/* Prominent CTA Button directly below price (LazyChat style) */}
                    <button
                      type="button"
                      onClick={() =>
                        onSelectPlan(
                          {
                            ...plan,
                            price: isTrial ? 0 : totalPrice,
                            duration_days: isTrial ? 2 : activeDuration.days,
                            trial_days: 2,
                            name: isTrial ? plan.name : `${plan.name} (${activeDuration.label})`
                          },
                          isTrial ? 'trial' : 'buy'
                        )
                      }
                      className={`w-full py-3.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                        isPopular
                          ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg shadow-purple-600/30'
                          : isPro
                          ? 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-[#0F172A] dark:hover:bg-slate-100 shadow-md'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-[#1A1238] dark:hover:bg-[#251A4E] dark:text-white border border-slate-200 dark:border-purple-500/25'
                      }`}
                    >
                      <span>
                        {isTrial
                          ? 'Start 2-day free trial'
                          : isPopular
                          ? 'Choose Standard Plan'
                          : 'Choose Pro Plan'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Divider & FEATURES Header */}
                    <div className="pt-7 pb-3">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                        FEATURES
                      </span>
                    </div>

                    {/* Large Feature List with Circles */}
                    <ul className="space-y-3.5 pb-2">
                      {plan.features.map((feature, i) => {
                        const isLockedWA =
                          isTrial && feature.toLowerCase().includes('whatsapp');
                        return (
                          <li
                            key={i}
                            className={`flex items-start gap-3 text-xs leading-relaxed ${
                              isLockedWA
                                ? 'text-slate-400 dark:text-slate-500'
                                : 'text-slate-700 dark:text-slate-200 font-medium'
                            }`}
                          >
                            <div className="shrink-0 mt-0.5">
                              {isLockedWA ? (
                                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center">
                                  <Lock className="w-3 h-3" />
                                </div>
                              ) : (
                                <CheckCircle2
                                  className={`w-5 h-5 ${
                                    isPopular
                                      ? 'text-[#7C3AED]'
                                      : isPro
                                      ? 'text-purple-400 dark:text-purple-300'
                                      : 'text-slate-400 dark:text-slate-400'
                                  }`}
                                />
                              )}
                            </div>
                            <span className={isLockedWA ? 'line-through decoration-slate-400/60' : ''}>
                              {feature}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
