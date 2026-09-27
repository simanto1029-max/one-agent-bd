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
  Tag
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
  calculateCustomPlanPrice
} from '../../utils/pricingPlans';

interface BillingViewProps {
  subStatus: SubscriptionStatusInfo | null;
  onRefresh: () => void;
}

export const BillingView: React.FC<BillingViewProps> = ({ subStatus, onRefresh }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<Plan[]>(OFFICIAL_PLANS);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(OFFICIAL_PLANS[0]);
  const [durationMode, setDurationMode] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedDurationId, setSelectedDurationId] = useState<string>('1m');
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
      if (active.length >= 2) {
        const starter =
          active.find((p) => p.price === 1250 || p.id === 'plan_starter') || OFFICIAL_PLANS[0];
        const pro =
          active.find((p) => p.price === 1950 || p.id === 'plan_pro') || OFFICIAL_PLANS[1];
        const merged = [
          { ...OFFICIAL_PLANS[0], ...starter, price: 1250, features: OFFICIAL_PLANS[0].features },
          { ...OFFICIAL_PLANS[1], ...pro, price: 1950, features: OFFICIAL_PLANS[1].features }
        ];
        setPlans(merged);
        setSelectedPlan(merged[0]);
      } else {
        setPlans(OFFICIAL_PLANS);
        setSelectedPlan(OFFICIAL_PLANS[0]);
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

      {/* Main Pricing Section matching Screenshot Design */}
      <div className="p-6 sm:p-8 rounded-[28px] bg-gradient-to-b from-[#EDE7FE] via-[#F4F0FF] to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-violet-200/70 dark:border-slate-800 shadow-xs space-y-8">
        {/* Header & Pill Switcher */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/90 dark:bg-slate-800 border border-violet-200/80 dark:border-slate-700 text-[#7C3AED] dark:text-violet-300 text-xs font-semibold shadow-2xs">
            <span>Simple & Transparent Pricing</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
            Choose Your Perfect Plan
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Select your preferred plan and duration below. Promo & coupon codes are supported at checkout.
          </p>
        </div>

        {/* Duration Pill Switcher */}
        <div className="flex flex-col items-center gap-3">
          <div className="inline-flex items-center p-1.5 rounded-full bg-white dark:bg-slate-800 border border-violet-100 dark:border-slate-700 shadow-sm">
            <button
              type="button"
              onClick={() => handleModeChange('monthly')}
              className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                durationMode === 'monthly'
                  ? 'bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#9333EA] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Monthly
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
              <span>Yearly</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  durationMode === 'yearly'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#DCFCE7] text-[#15803D]'
                }`}
              >
                Custom
              </span>
            </button>
          </div>

          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-full bg-white/85 dark:bg-slate-800/90 border border-violet-200/70 dark:border-slate-700 shadow-2xs">
            {filteredDurations.map((opt) => {
              const isSelected = opt.id === selectedDurationId;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedDurationId(opt.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#7C3AED] text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2 Interactive Selectable Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
          {plans.map((plan) => {
            const isPro = plan.price >= 1950 || plan.id.includes('pro');
            const isSelected = selectedPlan?.id === plan.id;
            const totalPrice = calculateCustomPlanPrice(plan.price, activeDuration.months);
            const displayFeatures = plan.features.filter(
              (feat) => !feat.toLowerCase().includes('free trial')
            );

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`relative rounded-[24px] p-6 sm:p-7 transition-all flex flex-col justify-between bg-white dark:bg-slate-900 cursor-pointer ${
                  isSelected
                    ? 'border-2 border-[#7C3AED] ring-4 ring-[#7C3AED]/10 shadow-xl shadow-purple-500/10'
                    : 'border border-slate-200/90 dark:border-slate-800 hover:border-[#7C3AED]/50 shadow-lg shadow-slate-900/5'
                }`}
              >
                {isPro && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#9333EA] text-white text-[11px] font-bold tracking-wide shadow-md flex items-center gap-1 whitespace-nowrap">
                    <Sparkles className="w-3 h-3" />
                    <span>Most Popular</span>
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-extrabold text-[#0F172A] dark:text-white">
                          {plan.name}
                        </h3>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-[#7C3AED] dark:text-purple-300 text-[10px] font-extrabold">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {isPro
                          ? 'Ideal for growing businesses & multi-channel stores'
                          : 'Perfect for getting started with AI sales automation'}
                      </p>
                    </div>

                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-gradient-to-br from-[#7C3AED] to-[#9333EA] text-white shadow-sm'
                          : 'bg-[#F3E8FF] dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300'
                      }`}
                    >
                      {isPro ? <Crown className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                    </div>
                  </div>

                  <div className="mb-5 pb-5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
                        TK {totalPrice.toLocaleString()}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        /{activeDuration.months === 1 ? 'mo' : activeDuration.shortLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                      {activeDuration.months === 1
                        ? `Base rate ${plan.price.toLocaleString()} TK/month • ${activeDuration.days} Days access`
                        : `${plan.price.toLocaleString()} TK/mo × ${activeDuration.months} months (${activeDuration.days} Days)`}
                    </p>
                  </div>

                  <ul className="space-y-2.5 mb-6">
                    {displayFeatures.map((feat, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300"
                      >
                        <div className="w-5 h-5 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                        </div>
                        <span className="leading-snug font-medium">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenGatewayForPlan(plan, null);
                    }}
                    className="w-full py-3.5 px-5 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white shadow-[0_6px_20px_rgba(124,58,237,0.3)] hover:shadow-[0_8px_25px_rgba(124,58,237,0.45)]"
                  >
                    <span>Buy Plan Now — TK {totalPrice.toLocaleString()}</span>
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
