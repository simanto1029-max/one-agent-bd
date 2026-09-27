import React from 'react';
import { Clock, Zap, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { CountdownTimer } from '../common/CountdownTimer';
import { SubscriptionStatusInfo } from '../../types';

interface TrialCountdownBannerProps {
  subStatus: SubscriptionStatusInfo | null;
  onUpgradeClick: () => void;
  onExpired: () => void;
}

export const TrialCountdownBanner: React.FC<TrialCountdownBannerProps> = ({
  subStatus,
  onUpgradeClick,
  onExpired
}) => {
  if (!subStatus || !subStatus.subscription) return null;

  const status = subStatus.subscription.status;
  const endDate = subStatus.subscription.end_date;

  if (status === 'expired' || subStatus.isExpired) {
    return null; // PlanLockOverlay will take care of full lock
  }

  if (status === 'pending_approval') {
    return (
      <div className="mb-6 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Clock className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <span className="font-bold text-sm block">
              Payment Verification in Progress
            </span>
            <span className="text-xs text-blue-700 dark:text-blue-300">
              Your bKash / Nagad payment was received and is awaiting admin approval. Your 30-day plan will activate immediately upon verification.
            </span>
          </div>
        </div>
        <button
          onClick={onUpgradeClick}
          className="shrink-0 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer"
        >
          View Billing
        </button>
      </div>
    );
  }

  if (status === 'active') {
    return (
      <div className="mb-6 px-4 py-3 rounded-2xl bg-violet-50/80 dark:bg-violet-950/30 border border-violet-200/80 dark:border-violet-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs transition-all">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-extrabold text-violet-900 dark:text-violet-200">
              {subStatus.planName || 'Standard'} Plan (30 Days Active):
            </span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 font-bold border border-violet-200 dark:border-violet-700">
              <Clock className="w-3 h-3" />
              <CountdownTimer targetDate={endDate} serverTime={subStatus.serverTime} onExpire={onExpired} />
              <span className="text-[10px] uppercase font-semibold">remaining</span>
            </div>
          </div>
        </div>
        <button
          onClick={onUpgradeClick}
          className="shrink-0 text-xs font-semibold text-violet-700 dark:text-violet-300 hover:text-violet-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
        >
          <span>Manage Plan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // status === 'trialing'
  return (
    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-md shadow-violet-600/20 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white shrink-0 border border-white/20">
          <Zap className="w-5 h-5 fill-current text-amber-300" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-extrabold text-sm tracking-tight">
              2-Day Free Trial Active
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 backdrop-blur-xs text-white text-xs font-bold border border-white/20">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <CountdownTimer targetDate={endDate} serverTime={subStatus.serverTime} onExpire={onExpired} />
              <span className="text-[10px] uppercase font-semibold opacity-90">left</span>
            </div>
          </div>
          <p className="text-xs text-violet-100 mt-0.5">
            Full AI auto-reply access enabled for WhatsApp & Messenger. When trial expires in 2 days, your plan automatically locks until activated.
          </p>
        </div>
      </div>

      <button
        id="trial-banner-upgrade-btn"
        onClick={onUpgradeClick}
        className="w-full md:w-auto shrink-0 px-4 py-2 rounded-xl bg-white text-violet-700 hover:bg-neutral-100 font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
      >
        <span>Upgrade to 30 Days</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
