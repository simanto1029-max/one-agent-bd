import React, { useState, useEffect, useRef } from 'react';
import { Check, Lock, Calendar, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { Plan } from '../../types';
import {
  OFFICIAL_THREE_PLANS,
  PLAN_DURATION_OPTIONS,
  PlanDurationOption,
  calculateCustomPlanPrice,
  buildCustomizedPlan
} from '../../utils/pricingPlans';

interface PricingTableProps {
  onSelectPlan: (plan: Plan, action?: 'buy' | 'trial') => void;
}

export const PricingTable: React.FC<PricingTableProps> = ({ onSelectPlan }) => {
  const rootRef = useRef<HTMLElement>(null);

  // Available duration options for landing page selector (1 Month to 2 Years)
  const durations: PlanDurationOption[] = [
    PLAN_DURATION_OPTIONS[0], // 1 Month (0% off)
    PLAN_DURATION_OPTIONS[2], // 3 Months (5% off)
    PLAN_DURATION_OPTIONS[3], // 6 Months (10% off)
    PLAN_DURATION_OPTIONS[4], // 1 Year (15% off)
    PLAN_DURATION_OPTIONS[5] || {
      id: '2y',
      label: '2 Years',
      shortLabel: '2Y',
      type: 'yearly',
      months: 24,
      days: 730,
      discountPercent: 20,
      badge: 'Save 20%'
    }
  ];

  const [selectedDuration, setSelectedDuration] = useState<PlanDurationOption>(durations[0]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          root.classList.add('in');
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const handleSelect = (planType: 'trial' | 'starter' | 'pro') => {
    if (planType === 'trial') {
      const trialPlan = OFFICIAL_THREE_PLANS[0];
      onSelectPlan(trialPlan, 'trial');
    } else if (planType === 'starter') {
      const baseStarter = OFFICIAL_THREE_PLANS[1];
      const customized = buildCustomizedPlan(baseStarter, selectedDuration);
      onSelectPlan(customized, 'buy');
    } else {
      const basePro = OFFICIAL_THREE_PLANS[2];
      const customized = buildCustomizedPlan(basePro, selectedDuration);
      onSelectPlan(customized, 'buy');
    }
  };

  // Pricing calculations based on selected duration
  const starterBasePrice = 1250;
  const proBasePrice = 1950;

  const starterTotalPrice = calculateCustomPlanPrice(starterBasePrice, selectedDuration);
  const starterMonthlyEffective = Math.round(starterTotalPrice / selectedDuration.months);

  const proTotalPrice = calculateCustomPlanPrice(proBasePrice, selectedDuration);
  const proMonthlyEffective = Math.round(proTotalPrice / selectedDuration.months);

  return (
    <section
      ref={rootRef}
      id="pricing"
      className="relative py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-[#FAF8FF] to-[#F5F0FF] dark:from-[#090518] dark:via-[#100A28] dark:to-[#090518] text-slate-900 dark:text-white transition-colors overflow-hidden scroll-mt-24"
    >
      {/* Background ambient radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[360px] opacity-60 dark:opacity-40"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(124, 58, 237, 0.15) 0%, transparent 70%)'
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase bg-purple-100/80 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300 border border-purple-200/80 dark:border-purple-500/30 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#7C3AED] dark:text-purple-400" />
            <span>Transparent Pricing Plans</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Simple plans that grow with your business
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Start small with a 2-day free trial, then pick a plan that fits your growth. Every plan includes autonomous AI replies and 0% ban risk.
          </p>

          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Facebook &amp; Instagram: <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Unlimited</span> • Official Meta Cloud API
          </div>
        </div>

        {/* INTERACTIVE BILLING DURATION SELECTOR TABS (Works on Desktop & Phone) */}
        <div className="mt-8 mb-10 flex flex-col items-center justify-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-[#7C3AED] dark:text-purple-400" />
            <span>Select Billing Duration:</span>
          </div>

          <div className="inline-flex p-1.5 rounded-2xl bg-white dark:bg-[#160F35] border border-purple-200/80 dark:border-purple-500/30 shadow-md flex-wrap justify-center gap-1">
            {durations.map((dur) => {
              const isSelected = selectedDuration.id === dur.id;
              return (
                <button
                  key={dur.id}
                  type="button"
                  onClick={() => setSelectedDuration(dur)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#7C3AED] text-white shadow-sm scale-[1.02]'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-purple-950/40'
                  }`}
                >
                  <span>{dur.label}</span>
                  {dur.discountPercent > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40'
                      }`}
                    >
                      Save {dur.discountPercent}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {selectedDuration.discountPercent > 0 && (
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span>✓ You are saving {selectedDuration.discountPercent}% with {selectedDuration.label} billing!</span>
            </div>
          )}
        </div>

        {/* 3 PRICING CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          
          {/* 1. BASIC TRIAL CARD */}
          <div className="flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#160F35] border border-slate-200 dark:border-purple-500/20 shadow-md hover:shadow-xl transition-all relative">
            <div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Basic</h3>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-purple-900/40 text-slate-700 dark:text-purple-300 border border-slate-200 dark:border-purple-500/30">
                  2 Days Free
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                  ৳0
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  / 2 days free trial
                </span>
              </div>

              <p className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                Build One Business Agent &amp; test all core features with zero advance payment.
              </p>

              <button
                type="button"
                onClick={() => handleSelect('trial')}
                className="mt-6 w-full py-3 px-4 rounded-xl font-bold text-sm bg-slate-100 dark:bg-[#251852] hover:bg-slate-200 dark:hover:bg-[#32206B] text-slate-900 dark:text-white border border-slate-300 dark:border-purple-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <span>Start 2-Day Free Trial</span>
                <ArrowRight className="w-4 h-4 text-[#7C3AED] dark:text-purple-400" />
              </button>

              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-purple-500/15">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-purple-300/60 mb-3">
                  Included Features
                </div>
                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Facebook Unlimited Conversations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Instagram Unlimited Conversations</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-400 dark:text-slate-500">
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>WhatsApp Unlimited (Locked in 2-Day Trial)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>1 Autonomous AI Sales Agent</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Bangla Voice Note &amp; Product Photo AI</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Auto Post Comment &amp; Instant Inbox DM</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>1-Click Steadfast &amp; Pathao Courier Booking</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 2. STARTER AI PLAN (MOST POPULAR) */}
          <div className="flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#1D1245] border-2 border-[#7C3AED] dark:border-[#A855F7] shadow-xl hover:shadow-2xl transition-all relative transform md:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#7C3AED] to-[#C026D3] text-white shadow-md">
              Most Popular
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Starter AI Plan</h3>
                {selectedDuration.discountPercent > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    {selectedDuration.discountPercent}% OFF
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                  ৳{starterMonthlyEffective.toLocaleString('en-US')}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  / month
                </span>
              </div>

              {selectedDuration.months > 1 && (
                <div className="mt-1 text-xs font-bold text-[#7C3AED] dark:text-purple-300">
                  Billed ৳{starterTotalPrice.toLocaleString('en-US')} for {selectedDuration.label}
                </div>
              )}

              <p className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                Manage your fast-growing Facebook, Instagram &amp; WhatsApp business 24/7.
              </p>

              <button
                type="button"
                onClick={() => handleSelect('starter')}
                className="mt-6 w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>Choose Starter AI Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-6 pt-5 border-t border-purple-100 dark:border-purple-500/20">
                <div className="text-[11px] font-black uppercase tracking-wider text-[#7C3AED] dark:text-purple-300 mb-3">
                  Everything in Basic, plus:
                </div>
                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><b>24/7 Active AI Sales &amp; Auto-Reply Agent</b> (Up to 3 Channels)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><b>WhatsApp Cloud API</b>, Messenger &amp; Instagram Full Sync</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><b>AI Auto Customer Fraud &amp; Courier Delivery Ratio Check</b></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>1-Click Steadfast, Pathao &amp; RedX Courier Dispatch</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>AI Auto Delivery Tracking &amp; Customer Live Status Update</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>VIP Customer Retargeting &amp; Smart Follow-Up Message</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Unlimited Product Catalog &amp; Unlimited Conversations (0 TK Fee)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 3. PRO BUSINESS PLAN */}
          <div className="flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#160F35] border border-slate-200 dark:border-purple-500/20 shadow-md hover:shadow-xl transition-all relative">
            <div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Pro Business Plan</h3>
                {selectedDuration.discountPercent > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    {selectedDuration.discountPercent}% OFF
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                  ৳{proMonthlyEffective.toLocaleString('en-US')}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  / month
                </span>
              </div>

              {selectedDuration.months > 1 && (
                <div className="mt-1 text-xs font-bold text-[#7C3AED] dark:text-purple-300">
                  Billed ৳{proTotalPrice.toLocaleString('en-US')} for {selectedDuration.label}
                </div>
              )}

              <p className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                Full-scale multi-brand automation with Accounts ERP &amp; Store Sync.
              </p>

              <button
                type="button"
                onClick={() => handleSelect('pro')}
                className="mt-6 w-full py-3 px-4 rounded-xl font-bold text-sm bg-slate-900 dark:bg-[#7C3AED] hover:bg-slate-800 dark:hover:bg-[#6D28D9] text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>Choose Pro Business Plan</span>
                <ArrowRight className="w-4 h-4 text-purple-300" />
              </button>

              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-purple-500/15">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-purple-300/60 mb-3">
                  Everything in Starter, plus:
                </div>
                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><b>Connect up to 10 Channels</b> (Multi-Page &amp; Numbers)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><b>Accounts, Stock &amp; Profit ERP</b> (Sales, Purchase, Due &amp; Cashbook)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><b>Website, WooCommerce &amp; Shopify Store Sync</b> + Live Chat Widget</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>AI Appointments &amp; Google Calendar Auto-Slot Booking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>VIP Customer Retargeting Message &amp; AI Email Marketing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Customer Callback Queue, Human Handover &amp; CSV/Text Export</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>3 Autonomous AI Sales Agents &amp; 24/7 VIP Priority Support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
