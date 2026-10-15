import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  Lock,
  Loader2,
  ChevronDown,
  Calendar
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
      className="py-16 sm:py-24 bg-[#F8F9FE] dark:bg-[#09061A] border-t border-slate-200/70 dark:border-purple-500/15 relative overflow-hidden transition-colors"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* ChatMakky Style Clean Centered Headline */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2">
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
            Start small, then add channels and automation as you need them. Every plan includes autonomous AI replies.
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500">
            Facebook &amp; Instagram conversations: 100% Unlimited • WhatsApp Cloud API: Direct Meta billing
          </p>
        </div>

        {/* Clean Duration Selector Pill */}
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
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
          </div>
        ) : (
          /* Exact ChatMakky 3-Card Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7 items-stretch">
            {displayPlans.map((plan, index) => {
              const isTrial = plan.id === 'plan_trial' || plan.price === 0;
              const isPopular = plan.id === 'plan_starter' || plan.badge === 'Most popular' || plan.name.toLowerCase().includes('advanced');
              const isAgency = plan.id === 'plan_pro' || plan.price >= 1950;

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
                  className={`relative rounded-[28px] p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                    isPopular
                      ? 'bg-white dark:bg-[#120B2E] border-2 border-[#7C3AED] shadow-[0_12px_45px_rgba(124,58,237,0.20)] dark:shadow-[0_12px_45px_rgba(124,58,237,0.30)] ring-1 ring-[#7C3AED]/20'
                      : 'bg-white dark:bg-[#10092B] border border-slate-200/90 dark:border-purple-500/20 shadow-xs hover:border-[#7C3AED]/35'
                  }`}
                >
                  {/* Floating Pill Badge for Popular Plan */}
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#6366F1] to-[#7C3AED] text-white text-[11px] font-bold shadow-md shadow-indigo-500/25 whitespace-nowrap">
                      Most popular
                    </div>
                  )}

                  {/* Top Header & Price */}
                  <div>
                    {/* Title */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                        {plan.name}
                      </h3>
                      {isTrial && (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-purple-950/70 text-slate-700 dark:text-purple-300 text-[10px] font-bold border border-slate-200 dark:border-purple-500/20">
                          2 Days Free
                        </span>
                      )}
                    </div>

                    {/* Price in BDT */}
                    <div className="flex items-baseline mt-3">
                      <span className="font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white leading-none">
                        ৳
                      </span>
                      <span className="font-black text-4xl sm:text-5xl tracking-tight text-slate-900 dark:text-white leading-none">
                        {isTrial ? '0' : totalPrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-400 font-medium ml-1.5">
                        {isTrial ? '/ 2 days' : '/ month'}
                      </span>
                    </div>

                    {savedAmount > 0 && !isTrial && (
                      <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        • Save ৳{savedAmount.toLocaleString()} ({activeDuration.label} billing)
                      </div>
                    )}

                    {/* Subtitle */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                      {plan.subtitle}
                    </p>

                    {/* CTA Button placed right below price/subtitle (LazyChat Style) */}
                    <div className="mt-5 mb-5">
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
                        className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold transition-all text-center cursor-pointer shadow-xs ${
                          isPopular
                            ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-md shadow-purple-600/25'
                            : isTrial
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-[#1A1238] dark:hover:bg-[#251A4E] dark:text-white border border-slate-200 dark:border-purple-500/25'
                            : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-[#0F172A] dark:hover:bg-slate-100'
                        }`}
                      >
                        {isTrial ? 'Start 2-day free trial' : `Choose ${plan.name}`}
                      </button>
                    </div>

                    {/* FEATURES Divider */}
                    <div className="pt-3 pb-3 border-t border-slate-100 dark:border-purple-500/15">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                        FEATURES
                      </span>
                    </div>

                    {/* Feature List (Exact ChatMakky Mint Checkmark & Clean Single Point) */}
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => {
                        const isLockedWA = isTrial && feature.toLowerCase().includes('whatsapp');
                        return (
                          <li
                            key={i}
                            className={`flex items-start gap-2.5 text-xs sm:text-[13px] leading-relaxed ${
                              isLockedWA
                                ? 'text-slate-400 dark:text-slate-500'
                                : 'text-slate-700 dark:text-slate-200 font-medium'
                            }`}
                          >
                            <div className="shrink-0 mt-0.5">
                              {isLockedWA ? (
                                <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                                  <Lock className="w-2.5 h-2.5" />
                                </div>
                              ) : (
                                <div className="w-4 h-4 rounded-full bg-[#E5F9F1] dark:bg-emerald-950/60 text-[#10B981] dark:text-emerald-400 flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </div>
                              )}
                            </div>
                            <span className={isLockedWA ? 'line-through decoration-slate-400/50' : ''}>
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
