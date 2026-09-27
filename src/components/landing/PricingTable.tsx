import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  Sparkles,
  ArrowRight,
  Loader2,
  Zap,
  Crown,
  Clock
} from 'lucide-react';
import { api } from '../../api';
import { Plan } from '../../types';
import {
  PLAN_DURATION_OPTIONS,
  OFFICIAL_PLANS,
  calculateCustomPlanPrice
} from '../../utils/pricingPlans';

interface PricingTableProps {
  onSelectPlan: (plan: Plan, action?: 'buy' | 'trial') => void;
}

export const PricingTable: React.FC<PricingTableProps> = ({ onSelectPlan }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [durationMode, setDurationMode] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedDurationId, setSelectedDurationId] = useState<string>('1m');

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

  return (
    <section
      id="pricing"
      className="py-16 sm:py-20 bg-gradient-to-b from-[#EDE7FE] via-[#F4F0FF] to-white dark:from-[#0C0722] dark:via-[#130C33] dark:to-[#0A061C] border-t border-violet-100 dark:border-purple-500/15 relative overflow-hidden transition-colors"
    >
      {/* Decorative soft ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[320px] bg-gradient-to-tr from-purple-300/30 via-pink-200/25 to-transparent dark:from-purple-900/20 dark:via-pink-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Badge & Heading matching screenshot */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/90 dark:bg-neutral-800 border border-violet-200/80 dark:border-neutral-700 text-[#7C3AED] dark:text-violet-400 text-xs font-semibold mb-3.5 shadow-2xs">
            <span>Simple & Transparent Pricing</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A] dark:text-white mb-3">
            Choose Your Perfect Plan
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 leading-relaxed max-w-xl mx-auto">
            Scale your business with our AI-powered automation tools. All plans include core features with no hidden fees.
          </p>
        </div>

        {/* Pill Billing Cycle Switcher matching screenshot */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <div className="inline-flex items-center p-1.5 rounded-full bg-white dark:bg-neutral-800 border border-violet-100 dark:border-neutral-700 shadow-sm">
            <button
              type="button"
              onClick={() => handleModeChange('monthly')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                durationMode === 'monthly'
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#DB2777] text-white shadow-xs'
                  : 'text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('yearly')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                durationMode === 'yearly'
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#DB2777] text-white shadow-xs'
                  : 'text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Yearly</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  durationMode === 'yearly'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#DCFCE7] text-[#15803D]'
                }`}
              >
                Custom Duration
              </span>
            </button>
          </div>

          {/* Duration Pills (1M, 2M, 3M, 6M, 12M or 1Y, 2Y, 3Y, 6Y) */}
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-full bg-white/85 dark:bg-neutral-900 border border-violet-200/70 dark:border-neutral-700 shadow-2xs">
            {filteredDurations.map((opt) => {
              const isSelected = opt.id === selectedDurationId;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedDurationId(opt.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0F172A] dark:bg-[#7C3AED] text-white shadow-2xs'
                      : 'text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-violet-50/70 dark:hover:bg-neutral-800'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-14">
            <Loader2 className="w-7 h-7 animate-spin text-[#7C3AED]" />
          </div>
        ) : (
          <>
            {/* 2 Cards Side-by-Side matching screenshot style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 w-full items-stretch">
              {displayPlans.map((plan, index) => {
                const isPro = plan.price >= 1950 || plan.id.includes('pro');
                const totalPrice = calculateCustomPlanPrice(plan.price, activeDuration.months);

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.08 }}
                    className={`relative rounded-[24px] p-6 sm:p-7 transition-all flex flex-col justify-between bg-white dark:bg-[#140D2E]/95 ${
                      isPro
                        ? 'border-2 border-[#8B5CF6] shadow-xl shadow-purple-500/15'
                        : 'border border-slate-200/90 dark:border-purple-500/20 shadow-lg shadow-slate-900/5'
                    }`}
                  >
                    {/* Top Center Floating Pill Badge for Most Popular Plan */}
                    {isPro && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white text-[11px] font-bold tracking-wide shadow-md flex items-center gap-1 whitespace-nowrap">
                        <Sparkles className="w-3 h-3" />
                        <span>Most Popular</span>
                      </div>
                    )}

                    <div>
                      {/* Card Header with Right Pastel Icon Box matching screenshot */}
                      <div className="flex items-start justify-between gap-3 mb-5">
                        <div>
                          <h3 className="text-lg sm:text-xl font-extrabold text-[#0F172A] dark:text-white">
                            {plan.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
                            {isPro
                              ? 'Ideal for growing businesses & multi-channel stores'
                              : 'Perfect for getting started with AI sales automation'}
                          </p>
                        </div>

                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                            isPro
                              ? 'bg-[#FCE7F3] dark:bg-pink-950/60 text-[#DB2777] dark:text-pink-400'
                              : 'bg-[#F3E8FF] dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-400'
                          }`}
                        >
                          {isPro ? <Crown className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                        </div>
                      </div>

                      {/* Price Display matching screenshot */}
                      <div className="mb-6 pb-5 border-b border-slate-100 dark:border-neutral-800">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
                            TK {totalPrice.toLocaleString()}
                          </span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                            /{activeDuration.months === 1 ? 'mo' : activeDuration.shortLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium mt-1.5">
                          {activeDuration.months === 1
                            ? `Base rate ${plan.price.toLocaleString()} TK/month • ${activeDuration.days} Days access`
                            : `${plan.price.toLocaleString()} TK/mo × ${activeDuration.months} months (${activeDuration.days} Days total)`}
                        </p>
                      </div>

                      {/* Feature Checklist with Mint Green Checkmarks matching screenshot */}
                      <ul className="space-y-3 mb-7">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-neutral-300">
                            <div className="w-5 h-5 rounded-full bg-[#DCFCE7] dark:bg-emerald-950 text-[#16A34A] dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-3 h-3 stroke-[2.5]" />
                            </div>
                            <span className="leading-snug font-medium">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Buttons: Direct Buy + 2 Days Free Trial */}
                    <div className="space-y-2.5 pt-2">
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
                        className="w-full py-3.5 px-5 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white border border-purple-300/30 shadow-[0_6px_20px_rgba(124,58,237,0.35)]"
                      >
                        <span>Buy Plan Now — TK {totalPrice.toLocaleString()}</span>
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
                        className="w-full py-2.5 px-4 rounded-full bg-violet-50/70 dark:bg-[#1A103C] hover:bg-violet-100/80 dark:hover:bg-[#23164F] text-[#7C3AED] dark:text-purple-300 border border-violet-200/70 dark:border-purple-500/30 font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Start 2 Days Free Trial</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom 2 Days Free Trial Banner Card */}
            <div className="w-full mt-7 p-5 sm:p-6 rounded-[24px] bg-white dark:bg-[#140D2E]/95 border border-violet-200/80 dark:border-purple-500/25 shadow-md shadow-violet-950/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5 text-center sm:text-left">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#DB2777] text-white flex items-center justify-center shrink-0 mx-auto sm:mx-0 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h4 className="text-sm sm:text-base font-extrabold text-[#0F172A] dark:text-white">
                      Want to test everything first? Try 2 Days Free Trial!
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#DCFCE7] dark:bg-emerald-950 text-[#15803D] dark:text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider">
                      2 Days Free
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                    Experience full AI auto-reply on WhatsApp, Messenger, Instagram & Website for 2 days free, or buy any direct plan above.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onSelectPlan(
                    {
                      ...displayPlans[0],
                      trial_days: 2
                    },
                    'trial'
                  )
                }
                className="px-5 py-2.5 rounded-full bg-[#0F172A] dark:bg-[#7C3AED] hover:bg-slate-800 dark:hover:bg-[#6D28D9] text-white text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer shadow-xs"
              >
                <span>Activate 2 Days Free Trial</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
