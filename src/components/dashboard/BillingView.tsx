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
  OFFICIAL_THREE_PLANS,
  calculateCustomPlanPrice,
  calculateOriginalPlanPrice,
  normalizeToThreePlans
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
  const [plans, setPlans] = useState<Plan[]>(OFFICIAL_THREE_PLANS);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(OFFICIAL_THREE_PLANS[1]);
  const [durationMode, setDurationMode] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedDurationId, setSelectedDurationId] = useState<string>('1m');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedPlanIds, setExpandedPlanIds] = useState<Record<string, boolean>>({});
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [preselectedMethod, setPreselectedMethod] = useState<PaymentMethodKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [activatingTrial, setActivatingTrial] = useState<string | null>(null);
  const [paymentNotification, setPaymentNotification] = useState<{
    type: 'success' | 'cancelled';
    message: string;
  } | null>(null);

  // Starter to Pro Upgrade Quote State
  const [upgradeQuote, setUpgradeQuote] = useState<{
    canUpgrade: boolean;
    currentPlanId: string;
    currentPlanName: string;
    targetPlanId: string;
    targetPlanName: string;
    daysRemaining: number;
    currentPlanPrice: number;
    targetPlanPrice: number;
    flatDifference: number;
    proratedDifference: number;
    unusedStarterCredit: number;
    renewWithCreditPrice: number;
    upgradeEndDate: string;
  } | null>(null);
  const [upgradeMode, setUpgradeMode] = useState<boolean>(false);
  const [upgradeCustomAmount, setUpgradeCustomAmount] = useState<number | null>(null);
  const [upgradeCustomDurationDays, setUpgradeCustomDurationDays] = useState<number | undefined>(undefined);
  const [upgradeCustomLabel, setUpgradeCustomLabel] = useState<string | undefined>(undefined);

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
      const merged = active.length >= 2 ? normalizeToThreePlans(active) : OFFICIAL_THREE_PLANS;
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

      // Fetch upgrade quote if on Starter plan
      if (subStatus && (!subStatus.isProPlan || subStatus.planId === 'plan_starter') && !subStatus.isExpired) {
        api.getUpgradeQuote('plan_pro')
          .then((quote) => setUpgradeQuote(quote))
          .catch((err) => console.warn('Could not fetch upgrade quote:', err));
      }
    } catch (err) {
      console.error('Failed to load billing history:', err);
      setPlans(OFFICIAL_THREE_PLANS);
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
    setUpgradeMode(false);
    setUpgradeCustomAmount(null);
    setUpgradeCustomDurationDays(undefined);
    setUpgradeCustomLabel(undefined);
    setIsGatewayModalOpen(true);
  };

  const handleUpgradeWithDifference = (amount: number, label: string, durationDays: number = 0) => {
    const proPlan = plans.find((p) => p.id === 'plan_pro' || p.price >= 1950) || plans[1] || plans[0];
    setSelectedPlan(proPlan);
    setUpgradeMode(true);
    setUpgradeCustomAmount(amount);
    setUpgradeCustomDurationDays(durationDays);
    setUpgradeCustomLabel(label);
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

      {/* Starter to Pro Upgrade Card (Baki Fee / Difference Upgrade) */}
      {(!subStatus?.isProPlan || subStatus?.planId === 'plan_starter' || subStatus?.planName?.toLowerCase().includes('starter')) && !isExpired && isActive && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-xl shadow-purple-600/20 relative overflow-hidden border border-purple-400/30 animate-in fade-in duration-300">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-black tracking-wide border border-white/25">
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>বাকি ফি (Price Difference) দিয়ে সরাসরি Pro Plan-এ Upgrade</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                Starter থেকে Pro-তে Upgrade করুন — মাত্র ৳{upgradeQuote ? upgradeQuote.flatDifference : 700} টাকা বাকি ফি দিয়ে!
              </h3>
              <p className="text-xs sm:text-sm text-purple-100 leading-relaxed">
                আপনি যেকোনো সময় Starter প্ল্যান থেকে Pro প্ল্যানে আপগ্রেড করতে পারবেন। পুরো প্ল্যানের টাকা দিতে হবে না — শুধুমাত্র দুই প্ল্যানের পার্থক্যের <strong>বাকি ফি (৳{upgradeQuote ? upgradeQuote.flatDifference : 700})</strong> প্রদান করলেই সাথে সাথে ১০টি চ্যানেল, কুরিয়ার বাল্ক অটোমেশন ও সমস্ত Pro সুবিধা আপনার বর্তমান মেয়াদের জন্য আনলক হয়ে যাবে।
              </p>
              {upgradeQuote && upgradeQuote.daysRemaining > 0 && (
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-purple-200 font-medium">
                  <span>📅 বর্তমান মেয়াদ বাকি: <strong>{upgradeQuote.daysRemaining} দিন</strong></span>
                  <span>•</span>
                  <span>🚀 Pro আনলক: <strong>১০টি চ্যানেল + ফুল অটোমেশন</strong></span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() =>
                  handleUpgradeWithDifference(
                    upgradeQuote ? upgradeQuote.flatDifference : 700,
                    `Pro Upgrade (বাকি ফি: ৳${upgradeQuote ? upgradeQuote.flatDifference : 700})`,
                    0 // 0 means upgrade current active billing cycle
                  )
                }
                className="px-5 py-3 rounded-xl bg-white text-purple-900 hover:bg-purple-50 text-xs sm:text-sm font-black transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap className="w-4 h-4 text-purple-600" />
                <span>বাকি ফি দিয়ে Upgrade করুন (৳{upgradeQuote ? upgradeQuote.flatDifference : 700})</span>
                <ArrowRight className="w-4 h-4 text-purple-600" />
              </button>

              {upgradeQuote && upgradeQuote.proratedDifference < upgradeQuote.flatDifference && (
                <button
                  type="button"
                  onClick={() =>
                    handleUpgradeWithDifference(
                      upgradeQuote.proratedDifference,
                      `Pro Upgrade (Prorated: ৳${upgradeQuote.proratedDifference})`,
                      0
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>অবশিষ্ট {upgradeQuote.daysRemaining} দিনের জন্য ৳{upgradeQuote.proratedDifference} দিয়ে Upgrade</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Pricing Section */}
      <div className="p-4 sm:p-6 md:p-8 rounded-[24px] sm:rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#7C3AED] dark:text-purple-400 block">
            PRICING PLANS
          </span>

          <h2 className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            We believe One Agent BD should be accessible to all companies, no matter the size.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            <strong className="text-slate-800 dark:text-slate-200">Facebook &amp; Instagram:</strong> 100% Unlimited AI auto-replies with 0 Meta fee.
            <br />
            <strong className="text-slate-800 dark:text-slate-200">WhatsApp Cloud API:</strong> Official Meta conversation fees are billed directly to your Meta Business Manager card at Meta&apos;s exact official cost with 0% markup.
          </p>
        </div>

        {/* Single Sleek Duration Dropdown Selector */}
        <div className="flex justify-center">
          <div className="relative inline-block">
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="pl-3.5 pr-3 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-xs hover:border-[#7C3AED]/60 transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-[#7C3AED] dark:text-purple-400 shrink-0" />
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
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-60 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.22)] p-1.5 z-30">
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
                          : 'text-slate-700 dark:text-slate-200 hover:bg-violet-50 dark:hover:bg-slate-700/60'
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

        {/* 3 Selectable Plan Cards Grid (LazyChat Style) */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => {
            const isTrial = plan.id === 'plan_trial' || plan.price === 0;
            const isPopular = plan.id === 'plan_starter' || plan.badge === 'Popular';
            const isPro = plan.id === 'plan_pro' || plan.price >= 1950;
            const isSelected = selectedPlan?.id === plan.id;

            const originalPrice = isTrial
              ? 0
              : calculateOriginalPlanPrice(plan.price, activeDuration.months);
            const totalPrice = isTrial
              ? 0
              : calculateCustomPlanPrice(plan.price, activeDuration.months);
            const savedAmount = Math.max(0, originalPrice - totalPrice);

            const isCurrentTrialActive = Boolean(subStatus?.isTrialActive && isTrial);
            const isCurrentPaidPlan = Boolean(
              !subStatus?.isExpired &&
              subStatus?.subscription?.status === 'active' &&
              ((isPro && subStatus?.isProPlan) || (!isPro && !isTrial && !subStatus?.isProPlan))
            );

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`relative rounded-3xl p-6 sm:p-7 transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                  isPopular
                    ? 'bg-white dark:bg-[#110B29] border-2 border-[#7C3AED] shadow-[0_0_40px_rgba(124,58,237,0.22)] ring-1 ring-[#7C3AED]/30'
                    : 'bg-white dark:bg-[#0D0822] border border-slate-200/90 dark:border-purple-500/20 shadow-xs hover:border-[#7C3AED]/40'
                }`}
              >
                <div>
                  {/* Top Badge & Header */}
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

                  {/* Price */}
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
                        Save ৳{savedAmount.toLocaleString()} with {activeDuration.label}
                      </div>
                    )}
                  </div>

                  {/* Subtitle */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-6">
                    {plan.subtitle ||
                      (isTrial
                        ? 'Growing teams up to 03 users (Testing full automation).'
                        : isPopular
                        ? 'Growing teams up to 05 users.'
                        : 'Growing teams up to 10 users & high volume.')}
                  </p>

                  {/* CTA Button directly below price */}
                  <div className="mb-6">
                    {isTrial ? (
                      <button
                        type="button"
                        disabled={isCurrentTrialActive || isCurrentPaidPlan}
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            setActivatingTrial(plan.id);
                            await api.startFreeTrial(plan.id);
                            onRefresh();
                          } catch (err: any) {
                            alert(err.message || 'Trial activation error');
                          } finally {
                            setActivatingTrial(null);
                          }
                        }}
                        className="w-full py-3.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-[#1A1238] dark:hover:bg-[#251A4E] dark:text-white border border-slate-200 dark:border-purple-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {activatingTrial === plan.id ? (
                          <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                        ) : isCurrentTrialActive ? (
                          <span>✓ Active 2-Day Trial</span>
                        ) : isCurrentPaidPlan ? (
                          <span>Active Paid Plan</span>
                        ) : (
                          <span>Start 2-day free trial</span>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const targetPlan = {
                            ...plan,
                            price: totalPrice,
                            duration_days: activeDuration.days,
                            name: `${plan.name} (${activeDuration.label})`
                          };
                          handleOpenGatewayForPlan(targetPlan, null);
                        }}
                        className={`w-full py-3.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                          isPopular
                            ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg shadow-purple-600/30'
                            : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-[#0F172A] dark:hover:bg-slate-100 shadow-md'
                        }`}
                      >
                        <span>
                          {isCurrentPaidPlan
                            ? `Renew ${plan.name} (৳${totalPrice.toLocaleString()})`
                            : `Choose ${plan.name} (৳${totalPrice.toLocaleString()})`}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Divider & FEATURES Header */}
                  <div className="pt-2 pb-3 border-t border-slate-100 dark:border-purple-500/15">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      FEATURES
                    </span>
                  </div>

                  {/* Feature list */}
                  <ul className="space-y-3 pb-2">
                    {plan.features.map((feature, i) => {
                      const isLockedWA = isTrial && feature.toLowerCase().includes('whatsapp');
                      return (
                        <li
                          key={i}
                          className={`flex items-start gap-2.5 text-xs leading-relaxed ${
                            isLockedWA
                              ? 'text-slate-400 dark:text-slate-500'
                              : 'text-slate-700 dark:text-slate-200 font-medium'
                          }`}
                        >
                          <div className="shrink-0 mt-0.5">
                            {isLockedWA ? (
                              <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center">
                                <Lock className="w-2.5 h-2.5" />
                              </div>
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-[#E5F9F1] dark:bg-emerald-950/60 text-[#10B981] dark:text-emerald-400 flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
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
              </div>
            );
          })}
          </div>
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
          setUpgradeMode(false);
          setUpgradeCustomAmount(null);
          setUpgradeCustomDurationDays(undefined);
          setUpgradeCustomLabel(undefined);
        }}
        plan={selectedPlan}
        customAmount={upgradeMode && upgradeCustomAmount ? upgradeCustomAmount : selectedCustomAmount}
        durationDays={upgradeMode && upgradeCustomDurationDays !== undefined ? upgradeCustomDurationDays : activeDuration.days}
        durationLabel={upgradeMode && upgradeCustomLabel ? upgradeCustomLabel : activeDuration.label}
        initialMethod={preselectedMethod}
        onSuccess={() => {
          loadBillingData();
          onRefresh();
        }}
      />
    </div>
  );
};
