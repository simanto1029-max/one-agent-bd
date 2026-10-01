import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Lock,
  Check,
  Sparkles,
  Zap,
  Crown,
  Tag,
  ChevronDown
} from 'lucide-react';
import { CountdownTimer } from '../common/CountdownTimer';
import {
  OneAgentPayGatewayModal,
  GatewayBrandLogo,
  METHOD_THEMES,
  PaymentMethodKey
} from '../payment/NagorikPayModal';
import { api } from '../../api';
import { SubscriptionStatusInfo, Payment, Plan } from '../../types';
import {
  PLAN_DURATION_OPTIONS,
  OFFICIAL_PLANS,
  calculateCustomPlanPrice,
  calculateOriginalPlanPrice
} from '../../utils/pricingPlans';

interface BillingViewProps {
  subStatus: SubscriptionStatusInfo | null;
  initialSelectedPlan?: Plan | null;
  onRefresh: () => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  subStatus,
  initialSelectedPlan,
  onRefresh
}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<Plan[]>(OFFICIAL_PLANS);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(OFFICIAL_PLANS[0]);
  const [durationMode, setDurationMode] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedDurationId, setSelectedDurationId] = useState<string>('1m');
  const [expandedPlanIds, setExpandedPlanIds] = useState<Record<string, boolean>>({});
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [preselectedMethod, setPreselectedMethod] = useState<PaymentMethodKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [activatingTrial, setActivatingTrial] = useState<string | null>(null);
  const [paymentNotification, setPaymentNotification] = useState<{
    type: 'success' | 'cancelled';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadBillingData();

    const params = new URLSearchParams(window.location.search);
    const paymentResult = params.get('payment_result');
    const tranId = params.get('tran_id');

    if (paymentResult === 'success') {
      setPaymentNotification({
        type: 'success',
        message: `Payment verified (${tranId || 'Confirmed'}). Your subscription plan is now active.`
      });
      onRefresh();
      window.history.replaceState({}, '', window.location.pathname);
    } else if (paymentResult === 'cancelled') {
      setPaymentNotification({
        type: 'cancelled',
        message: 'Payment session was cancelled. You can restart checkout anytime below.'
      });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      const [myPayments, availablePlans] = await Promise.all([
        api.getMyPayments().catch(() => []),
        api.getPlans().catch(() => [])
      ]);
      setPayments(myPayments);

      const active = availablePlans.filter((p) => p.is_active);
      let merged = OFFICIAL_PLANS;
      if (active.length >= 2) {
        const starter =
          active.find((p) => p.price === 1250 || p.id === 'plan_starter') || OFFICIAL_PLANS[0];
        const pro =
          active.find((p) => p.price === 1950 || p.id === 'plan_pro') || OFFICIAL_PLANS[1];
        merged = [
          { ...OFFICIAL_PLANS[0], ...starter, price: 1250, features: OFFICIAL_PLANS[0].features },
          { ...OFFICIAL_PLANS[1], ...pro, price: 1950, features: OFFICIAL_PLANS[1].features }
        ];
      }
      setPlans(merged);

      if (initialSelectedPlan) {
        const matchedPlan =
          merged.find(
            (p) =>
              p.id === initialSelectedPlan.id ||
              (initialSelectedPlan.id?.includes('pro') && p.id === 'plan_pro')
          ) || merged[0];
        setSelectedPlan(matchedPlan);

        if (initialSelectedPlan.duration_days && initialSelectedPlan.duration_days > 2) {
          const matchedDuration = PLAN_DURATION_OPTIONS.find(
            (d) => d.days === initialSelectedPlan.duration_days
          );
          if (matchedDuration) {
            setDurationMode(matchedDuration.type);
            setSelectedDurationId(matchedDuration.id);
          }
        }
      } else {
        setSelectedPlan(merged[0]);
      }
    } catch (err) {
      console.error('Failed to load billing history:', err);
      setPlans(OFFICIAL_PLANS);
    } finally {
      setLoading(false);
    }
  };

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

  const handleOpenGatewayForPlan = (plan: Plan, method?: PaymentMethodKey | null) => {
    setSelectedPlan(plan);
    setPreselectedMethod(method || null);
    setIsGatewayModalOpen(true);
  };

  const handleStartFreeTrial = async (plan: Plan) => {
    try {
      setActivatingTrial(plan.id);
      const res = await api.startFreeTrial(plan.id);
      setPaymentNotification({
        type: 'success',
        message: res.message || `2-Day Free Trial activated for ${plan.name}!`
      });
      onRefresh();
    } catch (err: any) {
      setPaymentNotification({
        type: 'cancelled',
        message: err.message || 'Could not activate free trial.'
      });
    } finally {
      setActivatingTrial(null);
    }
  };

  const isTrial = subStatus?.subscription?.status === 'trialing';
  const isActive = subStatus?.subscription?.status === 'active';
  const isPending = subStatus?.subscription?.status === 'pending_approval';
  const isExpired = subStatus?.isExpired;
  const endDate = subStatus?.subscription?.end_date;

  const selectedCustomAmount = selectedPlan
    ? calculateCustomPlanPrice(selectedPlan.price, activeDuration.months)
    : 1250;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Payment Callback Notification */}
      {paymentNotification && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            paymentNotification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/70 text-emerald-900 dark:text-emerald-200'
              : 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/70 text-amber-900 dark:text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            {paymentNotification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            )}
            <span>{paymentNotification.message}</span>
          </div>
          <button
            onClick={() => setPaymentNotification(null)}
            className="text-xs font-bold underline opacity-75 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Compact Subscription Status Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                isActive && !isExpired
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : isTrial && !isExpired
                  ? 'bg-violet-50 dark:bg-violet-950/60 text-[#7C3AED] dark:text-violet-300 border border-violet-200 dark:border-violet-800'
                  : isPending
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isActive && !isExpired
                    ? 'bg-emerald-500'
                    : isTrial && !isExpired
                    ? 'bg-[#7C3AED] animate-pulse'
                    : isPending
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-rose-500'
                }`}
              />
              {isActive && !isExpired
                ? 'Active Subscription'
                : isTrial && !isExpired
                ? '2-Day Free Trial Active'
                : isPending
                ? 'Verification Pending'
                : 'Subscription Expired'}
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {subStatus?.planName || 'Starter AI Plan'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isExpired
              ? 'Your access is currently paused. Activate a plan or start a 2-day free trial below.'
              : 'All AI auto-reply channels, website integration, and courier tools are active.'}
          </p>
        </div>

        {endDate && !isExpired && (
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="text-[11px] font-semibold text-slate-400">Time Remaining:</span>
            <CountdownTimer
              targetDate={endDate}
              serverTime={subStatus?.serverTime}
              onExpire={onRefresh}
              variant="badge"
            />
          </div>
        )}
      </div>

      {/* Main Pricing Section */}
      <div className="p-6 sm:p-8 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#7F22FE] dark:text-purple-400 block">
            PRICING PLANS
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
            Choose Your Perfect Plan
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Select your preferred plan and duration below. Promo & coupon codes are supported at checkout.
          </p>
        </div>

        {/* Duration Pill Switcher */}
        <div className="flex flex-col items-center gap-3.5">
          <div className="inline-flex items-center p-1.5 rounded-full bg-white dark:bg-slate-800 border border-violet-100 dark:border-slate-700 shadow-sm">
            <button
              type="button"
              onClick={() => handleModeChange('monthly')}
              className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                durationMode === 'monthly'
                  ? 'bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#9333EA] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <span>Monthly</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  durationMode === 'monthly'
                    ? 'bg-white/20 text-white'
                    : 'bg-purple-100 dark:bg-purple-950 text-[#7C3AED] dark:text-purple-300'
                }`}
              >
                Up to 15% OFF
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('yearly')}
              className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                durationMode === 'yearly'
                  ? 'bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#9333EA] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <span>Yearly (1Y – 6Y)</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  durationMode === 'yearly'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#DCFCE7] text-[#15803D]'
                }`}
              >
                15% – 30% OFF
              </span>
            </button>
          </div>

          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-2xl sm:rounded-full bg-white/90 dark:bg-slate-800/90 border border-violet-200/70 dark:border-slate-700 shadow-2xs">
            {filteredDurations.map((opt) => {
              const isSelected = opt.id === selectedDurationId;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedDurationId(opt.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#7C3AED] text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <span>{opt.label}</span>
                  {opt.discountPercent > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isSelected
                          ? 'bg-emerald-400 text-slate-950'
                          : 'bg-[#DCFCE7] dark:bg-emerald-950 text-[#15803D] dark:text-emerald-400'
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

        {/* 2 Narrow Centered Selectable Plan Cards Grid with See More Toggle */}
        <div className="max-w-[680px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 items-start justify-center">
          {plans.map((plan) => {
            const isPro = plan.price >= 1950 || plan.id.includes('pro');
            const isSelected = selectedPlan?.id === plan.id;
            const originalPrice = calculateOriginalPlanPrice(plan.price, activeDuration.months);
            const totalPrice = calculateCustomPlanPrice(plan.price, activeDuration.months);
            const savedAmount = Math.max(0, originalPrice - totalPrice);
            const displayFeatures = plan.features.filter(
              (feat) => !feat.toLowerCase().includes('free trial')
            );
            const halfIndex = Math.ceil(displayFeatures.length / 2);
            const firstHalfFeatures = displayFeatures.slice(0, halfIndex);
            const secondHalfFeatures = displayFeatures.slice(halfIndex);
            const isExpanded = Boolean(expandedPlanIds[plan.id]);

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`w-full max-w-[330px] mx-auto relative rounded-[24px] p-5 transition-all flex flex-col justify-between cursor-pointer ${
                  isPro
                    ? 'bg-gradient-to-b from-white via-[#FBF9FF] to-[#F3EAFF] dark:from-[#1C1145] dark:via-[#150C35] dark:to-[#11092B] border-2 border-[#7F22FE] shadow-[0_16px_44px_-10px_rgba(127,34,254,0.34)] ring-1 ring-fuchsia-500/20'
                    : isSelected
                    ? 'bg-white dark:bg-[#120B2B] border-2 border-[#7C3AED] ring-4 ring-[#7C3AED]/10 shadow-xl shadow-purple-500/10'
                    : 'bg-white/95 dark:bg-[#120B2B]/95 border border-violet-200/90 dark:border-purple-500/25 hover:border-[#7C3AED]/50 shadow-lg shadow-purple-950/5'
                }`}
              >
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
                  <div className="flex items-start justify-between gap-2.5 mb-3.5 pt-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-[#0F172A] dark:text-white">
                          {plan.name}
                        </h3>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-[#7C3AED] dark:text-purple-300 text-[10px] font-extrabold">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {isPro
                          ? 'All new Pro features, ERP, Courier, Auto Fraud Check & 10 Channels'
                          : 'Essential AI Auto-Reply & Order Capture for up to 3 Channels'}
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

                  <div className="mb-4 pb-3.5 border-b border-violet-100 dark:border-purple-500/15">
                    <div className="flex flex-wrap items-baseline gap-1.5">
                      <span className="text-2xl sm:text-[28px] font-black tracking-tight text-[#0F172A] dark:text-white">
                        TK {totalPrice.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
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

                  {/* First Half Features */}
                  <ul className="space-y-2">
                    {firstHalfFeatures.map((feat, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-slate-200"
                      >
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isPro
                              ? 'bg-[#7F22FE]/15 text-[#7F22FE] dark:bg-purple-500/25 dark:text-purple-300'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="leading-snug font-medium">{feat}</span>
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
                            {secondHalfFeatures.map((feat, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-slate-200"
                              >
                                <div
                                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                    isPro
                                      ? 'bg-[#7F22FE]/15 text-[#7F22FE] dark:bg-purple-500/25 dark:text-purple-300'
                                      : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                  }`}
                                >
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </div>
                                <span className="leading-snug font-medium">{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedPlanIds((prev) => ({
                            ...prev,
                            [plan.id]: !prev[plan.id]
                          }));
                        }}
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

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenGatewayForPlan(plan, null);
                    }}
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
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compact Payment History Table */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Payment & Verification History
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Record of your bKash, Nagad, Rocket, Upay & Bank activations
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Auto-Verified</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-slate-400 bg-neutral-50/50 dark:bg-neutral-800/40 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Gateway</th>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    No payment transactions recorded yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(p.created_at || p.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      {(() => {
                        const m = (p.payment_method || p.method || 'bkash').toLowerCase();
                        const theme = METHOD_THEMES[m] || METHOD_THEMES.bkash;
                        return (
                          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl border bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800">
                            <GatewayBrandLogo methodId={m} size="xs" />
                            <span className={`text-xs font-black ${theme.accentText}`}>
                              {theme.name}
                            </span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {p.transaction_id || p.transaction_reference}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      <span>TK {Number(p.amount).toLocaleString()}</span>
                      {p.coupon_code && (
                        <span className="ml-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {p.coupon_code}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'approved'
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : p.status === 'pending'
                            ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {p.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                        {p.status === 'pending' && <Clock className="w-3 h-3" />}
                        {p.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        <span className="capitalize">{p.status}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Gateway Modal with Coupon Code Support */}
      <OneAgentPayGatewayModal
        isOpen={isGatewayModalOpen}
        onClose={() => {
          setIsGatewayModalOpen(false);
          setPreselectedMethod(null);
        }}
        plan={selectedPlan}
        customAmount={selectedCustomAmount}
        durationDays={activeDuration.days}
        durationLabel={activeDuration.label}
        initialMethod={preselectedMethod}
        onSuccess={() => {
          loadBillingData();
          onRefresh();
        }}
      />
    </div>
  );
};
