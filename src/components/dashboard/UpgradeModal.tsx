import React, { useState } from 'react';
import { Lock, Sparkles, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SubscriptionStatusInfo } from '../../types';

interface UpgradeModalProps {
  subStatus: SubscriptionStatusInfo | null;
  onGoToBilling: () => void;
  onContinueReview: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  subStatus,
  onGoToBilling,
  onContinueReview
}) => {
  // If subscription is active or trialing, don't block
  if (!subStatus?.isExpired) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg p-6 sm:p-8 bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto mb-5">
          <Lock className="w-7 h-7" />
        </div>

        <h2 className="text-2xl font-black tracking-tight mb-2">
          Your Free Trial Has Expired
        </h2>

        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-md mx-auto mb-6">
          Your trial period has concluded, but <strong>all your channels, conversation logs, and custom AI persona prompt remain completely safe and intact</strong>. Upgrade to an active plan to continue automated WhatsApp and Messenger auto-replies.
        </p>

        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 text-left text-xs space-y-2 mb-6">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Channels and configurations preserved safely</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Instant activation upon bKash / Nagad payment verification</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onContinueReview}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Review Data in Read-Only Mode
          </button>
          <button
            id="upgrade-modal-pay-btn"
            onClick={onGoToBilling}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Upgrade via bKash / Nagad</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
