import React, { useState } from 'react';
import { Lock, ShieldAlert, ArrowRight, Sparkles } from 'lucide-react';
import { OneAgentPayGatewayModal } from '../payment/NagorikPayModal';
import { SubscriptionStatusInfo } from '../../types';
import { OFFICIAL_TWO_PLANS } from '../../utils/pricingPlans';

interface PlanLockOverlayProps {
  subStatus: SubscriptionStatusInfo | null;
  onPaymentSubmitted: () => void;
  onGoToBilling: () => void;
}

export const PlanLockOverlay: React.FC<PlanLockOverlayProps> = ({
  subStatus,
  onPaymentSubmitted,
  onGoToBilling
}) => {
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<'plan_starter' | 'plan_pro'>(
    subStatus?.subscription?.plan_id === 'plan_pro' ? 'plan_pro' : 'plan_starter'
  );

  const activePlan =
    OFFICIAL_TWO_PLANS.find((p) => p.id === selectedPlanId) || OFFICIAL_TWO_PLANS[0];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-5 sm:p-6 space-y-5 text-neutral-900 dark:text-neutral-100">
        {/* Header */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              <Lock className="w-3 h-3" />
              Subscription Expired
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-neutral-900 dark:text-white mt-0.5">
              Activate Your Plan to Continue
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
              Your trial or membership has ended. Select a plan below and complete instant payment via{' '}
              <strong className="text-neutral-800 dark:text-neutral-200">
                pay.oneagentbd.online
              </strong>
              .
            </p>
          </div>
        </div>

        {/* 2 Plan Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {OFFICIAL_TWO_PLANS.map((plan) => {
            const isSelected = plan.id === selectedPlanId;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id as 'plan_starter' | 'plan_pro')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-violet-50/70 dark:bg-violet-950/30 border-[#7F22FE] ring-1 ring-[#7F22FE]/30'
                    : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 hover:border-[#7F22FE]/40'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7F22FE] block">
                  {plan.id === 'plan_pro' ? '10 AI Agents' : '3 AI Agents'}
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-neutral-900 dark:text-white block mt-0.5">
                  {plan.name}
                </span>
                <div className="mt-1.5 flex items-baseline gap-1">
                  <span className="text-xl font-extrabold text-[#7F22FE]">
                    {plan.price.toLocaleString()} TK
                  </span>
                  <span className="text-[10px] text-neutral-500 font-semibold">/ month</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => setIsGatewayOpen(true)}
            className="w-full py-3 px-4 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white font-bold text-xs shadow-md shadow-[#7F22FE]/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>
              Pay {activePlan.price.toLocaleString()} TK via pay.oneagentbd.online
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onGoToBilling}
            className="w-full py-2 px-3 text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#7F22FE]" />
            <span>Customize Duration (2M, 3M, 6M, 1Y, 2Y, 3Y, 6Y) in Billing</span>
          </button>
        </div>
      </div>

      {/* pay.oneagentbd.online Official Gateway Modal */}
      <OneAgentPayGatewayModal
        isOpen={isGatewayOpen}
        onClose={() => setIsGatewayOpen(false)}
        selectedPlan={activePlan}
        onSuccess={() => {
          setIsGatewayOpen(false);
          onPaymentSubmitted();
        }}
      />
    </div>
  );
};
