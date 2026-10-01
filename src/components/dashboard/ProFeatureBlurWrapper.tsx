import React from 'react';
import { Crown, Lock, ArrowRight, Check, Sparkles } from 'lucide-react';

interface ProFeatureBlurWrapperProps {
  isProPlan: boolean;
  featureTitle: string;
  featureSubtitleBn: string;
  highlights: string[];
  onUpgradeToPro: () => void;
  children: React.ReactNode;
}

export const ProFeatureBlurWrapper: React.FC<ProFeatureBlurWrapperProps> = ({
  isProPlan,
  featureTitle,
  featureSubtitleBn,
  highlights,
  onUpgradeToPro,
  children
}) => {
  if (isProPlan) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full min-h-[580px] rounded-3xl overflow-hidden">
      {/* Blurred Preview of the Real Pro Feature Interface */}
      <div
        aria-hidden="true"
        className="w-full filter blur-[5px] opacity-60 pointer-events-none select-none max-h-[660px] overflow-hidden transition-all"
      >
        {children}
      </div>

      {/* Subtle Brand Gradient Vignette Overlay */}
      <div className="absolute inset-0 z-20 flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-white/40 via-[#F5EFFF]/70 to-white/85 dark:from-[#0B0720]/50 dark:via-[#120A30]/75 dark:to-[#0B0720]/90 backdrop-blur-[2px]">
        <div className="w-full max-w-md rounded-[26px] p-6 sm:p-7 bg-white/95 dark:bg-[#150D36]/95 border-2 border-[#7F22FE]/80 shadow-[0_20px_60px_-15px_rgba(127,34,254,0.38)] text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
          {/* Top Brand Crown + Lock Icon */}
          <div className="relative mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7F22FE] via-[#9333EA] to-[#DB2777] text-white flex items-center justify-center shadow-lg shadow-[#7F22FE]/30">
            <Crown className="w-7 h-7" />
            <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-md">
              <Lock className="w-3 h-3" />
            </span>
          </div>

          {/* Title & Bangla Description */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 border border-purple-300/60 dark:border-purple-500/30 text-[#7F22FE] dark:text-purple-300 text-[10px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Pro Business Plan Exclusive</span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {featureTitle}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {featureSubtitleBn}
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="p-3.5 rounded-2xl bg-[#F8F5FF] dark:bg-[#1D1347]/80 border border-violet-200/80 dark:border-purple-500/25 text-left space-y-2">
            {highlights.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <div className="w-4 h-4 rounded-full bg-[#7F22FE]/15 dark:bg-purple-500/25 text-[#7F22FE] dark:text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Upgrade CTA */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={onUpgradeToPro}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-[#7F22FE] via-[#9333EA] to-[#C026D3] hover:from-[#6D28D9] hover:to-[#A21CAF] text-white font-extrabold text-xs shadow-[0_8px_25px_rgba(127,34,254,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Crown className="w-4 h-4" />
              <span>Upgrade to Pro Plan (1,950 TK/mo) to Unlock</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Starter Plan মেম্বারদের জন্য প্রিভিউ মোড চালু আছে • ব্যবহারের জন্য Pro Plan অ্যাক্টিভ করুন
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
