import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { HowItWorksSteps } from './HowItWorksSteps';

interface HeroProps {
  onStartTrial: () => void;
  onExploreDemo: () => void;
  onOpenLogin?: () => void;
  onOpenSignup?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onStartTrial
}) => {
  return (
    <section className="relative pt-4 pb-10 sm:pt-8 sm:pb-14 bg-white dark:bg-gradient-to-br dark:from-[#0B0720] dark:via-[#130B32] dark:to-[#090518] overflow-hidden transition-colors">
      {/* Ambient Radial Glows */}
      <div className="absolute -top-24 -left-24 w-[320px] sm:w-[560px] h-[280px] sm:h-[420px] bg-[#7F22FE]/8 dark:bg-[#5B21B6]/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-10 -right-24 w-[300px] sm:w-[500px] h-[260px] sm:h-[400px] bg-purple-400/8 dark:bg-[#9333EA]/22 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Centered Hero Copy & CTAs */}
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#7F22FE]/10 dark:bg-[#1E1242]/90 border border-[#7F22FE]/25 dark:border-purple-500/35 text-[11px] sm:text-xs font-semibold text-[#7F22FE] dark:text-purple-200 mb-4 sm:mb-5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="tracking-wide">Build once, deploy to every channel</span>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] uppercase tracking-wider rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30">
              Meta Official Cloud API
            </span>
          </div>

          <h1 className="text-[30px] sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.14]">
            One AI Agent.{' '}
            <span className="bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#C026D3] bg-clip-text text-transparent">
              Every Channel.
            </span>
          </h1>

          <p className="mt-3 sm:mt-4 text-xs sm:text-base lg:text-lg text-slate-600 dark:text-slate-300/90 max-w-2xl mx-auto leading-relaxed font-normal px-1">
            Build and deploy autonomous AI agents across WhatsApp, Facebook Messenger, Instagram Direct, and your Website. Instant product photo search, voice note audio replies, automatic order booking, and fraud check in one dashboard.
          </p>

          {/* Supported Channels — Separate Compact Cards with Prominent Sleek Shadow, Zero Outer Card */}
          <div className="mt-3 sm:mt-3.5 mb-3 sm:mb-3.5 flex items-center justify-center gap-2 sm:gap-3">
            {/* 1. Facebook */}
            <div
              title="Facebook Messenger"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white dark:bg-[#181138] border border-slate-200/90 dark:border-purple-500/25 shadow-[0_4px_14px_rgba(0,0,0,0.07)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.45)] hover:border-[#1877F2]/70 dark:hover:border-[#1877F2]/70 hover:shadow-[0_6px_20px_rgba(24,119,242,0.25)] hover:-translate-y-0.5 transition-all flex items-center justify-center cursor-pointer shrink-0"
            >
              <svg className="w-5.5 h-5.5 sm:w-6 sm:h-6" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" fill="#1877F2" />
                <path
                  d="M27.5 24.5L28.2 19.8H23.8V16.8C23.8 15.5 24.4 14.3 26.4 14.3H28.4V10.4C27.3 10.2 26.2 10.1 25.1 10.1C21.8 10.1 19.6 12.1 19.6 15.8V19.8H15.6V24.5H19.6V35.7H23.8V24.5H27.5Z"
                  fill="white"
                />
              </svg>
            </div>

            {/* 2. Instagram */}
            <div
              title="Instagram Direct"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white dark:bg-[#181138] border border-slate-200/90 dark:border-purple-500/25 shadow-[0_4px_14px_rgba(0,0,0,0.07)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.45)] hover:border-[#E1306C]/70 dark:hover:border-[#E1306C]/70 hover:shadow-[0_6px_20px_rgba(225,48,108,0.25)] hover:-translate-y-0.5 transition-all flex items-center justify-center cursor-pointer shrink-0"
            >
              <svg className="w-5.5 h-5.5 sm:w-6 sm:h-6" viewBox="0 0 48 48" fill="none">
                <defs>
                  <radialGradient id="heroIgGrad" cx="0.2" cy="1" r="1">
                    <stop offset="0%" stopColor="#FFDD55" />
                    <stop offset="30%" stopColor="#FF543E" />
                    <stop offset="60%" stopColor="#C837AB" />
                    <stop offset="100%" stopColor="#4158D0" />
                  </radialGradient>
                </defs>
                <rect width="44" height="44" x="2" y="2" rx="13" fill="url(#heroIgGrad)" />
                <rect x="11.5" y="11.5" width="25" height="25" rx="7.5" stroke="white" strokeWidth="2.8" fill="none" />
                <circle cx="24" cy="24" r="5.8" stroke="white" strokeWidth="2.8" fill="none" />
                <circle cx="31.2" cy="16.8" r="1.6" fill="white" />
              </svg>
            </div>

            {/* 3. WhatsApp */}
            <div
              title="WhatsApp Cloud API"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white dark:bg-[#181138] border border-slate-200/90 dark:border-purple-500/25 shadow-[0_4px_14px_rgba(0,0,0,0.07)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.45)] hover:border-[#25D366]/70 dark:hover:border-[#25D366]/70 hover:shadow-[0_6px_20px_rgba(37,211,102,0.25)] hover:-translate-y-0.5 transition-all flex items-center justify-center cursor-pointer shrink-0"
            >
              <svg className="w-5.5 h-5.5 sm:w-6 sm:h-6" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" fill="#25D366" />
                <path
                  d="M33.4 14.6C30.9 12.1 27.6 10.7 24.1 10.7C16.9 10.7 11 16.6 11 23.8C11 26.1 11.6 28.3 12.8 30.3L10.7 37.3L17.8 35.4C19.7 36.4 21.9 37 24.1 37C31.3 37 37.2 31.1 37.2 23.9C37.2 20.4 35.8 17.1 33.4 14.6ZM24.1 34.8C22.2 34.8 20.3 34.2 18.6 33.2L18.2 33L14 34.1L15.1 30.1L14.8 29.6C13.7 27.9 13.1 25.9 13.1 23.8C13.1 17.8 18 12.9 24.1 12.9C27 12.9 29.7 14 31.7 16C33.7 18 34.8 20.7 34.8 23.8C34.8 29.9 29.9 34.8 24.1 34.8ZM30 26.6C29.7 26.4 28 25.6 27.7 25.5C27.4 25.4 27.2 25.3 26.9 25.7C26.7 26 26.1 26.7 25.9 26.9C25.7 27.2 25.5 27.2 25.1 27C24.8 26.9 23.8 26.5 22.5 25.4C21.5 24.5 20.9 23.4 20.7 23C20.5 22.6 20.7 22.5 20.9 22.3C21 22.1 21.3 21.8 21.5 21.6C21.7 21.3 21.7 21.2 21.9 20.9C22 20.6 21.9 20.4 21.8 20.2C21.7 20.1 21.1 18.5 20.8 17.8C20.5 17.2 20.3 17.2 20.1 17.2C19.9 17.2 19.6 17.2 19.3 17.2C19 17.2 18.6 17.3 18.3 17.7C18 18.1 17 19.1 17 21.1C17 23.2 18.4 25.1 18.6 25.4C18.8 25.7 21.4 29.9 25.3 31.8C26.2 32.2 27 32.5 27.5 32.7C28.4 33 29.3 33 29.9 32.9C30.7 32.8 32.1 31.9 32.4 31C32.8 30.1 32.8 29.4 32.7 29.2C32.5 29.1 32.3 29 32 28.8L30 26.6Z"
                  fill="white"
                />
              </svg>
            </div>

            {/* 4. Website */}
            <div
              title="Website Live Chat"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white dark:bg-[#181138] border border-slate-200/90 dark:border-purple-500/25 shadow-[0_4px_14px_rgba(0,0,0,0.07)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.45)] hover:border-[#7C3AED]/70 dark:hover:border-[#7C3AED]/70 hover:shadow-[0_6px_20px_rgba(124,58,237,0.25)] hover:-translate-y-0.5 transition-all flex items-center justify-center cursor-pointer shrink-0"
            >
              <svg className="w-5.5 h-5.5 sm:w-6 sm:h-6" viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient id="heroWebGrad" x1="0" y1="0" x2="48" y2="48">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#9333EA" />
                  </linearGradient>
                </defs>
                <rect width="44" height="44" x="2" y="2" rx="13" fill="url(#heroWebGrad)" />
                <circle cx="24" cy="24" r="12" stroke="white" strokeWidth="2.4" fill="none" />
                <path
                  d="M12 24H36M24 12C26.8 15.7 28.2 19.8 28.2 24C28.2 28.2 26.8 32.3 24 36C21.2 32.3 19.8 28.2 19.8 24C19.8 19.8 21.2 15.7 24 12Z"
                  stroke="white"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Primary CTAs */}
          <div className="mt-3.5 sm:mt-4.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <button
              id="hero-start-trial-btn"
              onClick={onStartTrial}
              className="w-full sm:w-auto px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl sm:rounded-full bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:from-[#6D28D9] hover:via-[#7C3AED] hover:to-[#9333EA] text-white font-bold text-sm sm:text-base border border-purple-300/30 shadow-[0_10px_28px_rgba(127,34,254,0.38)] hover:shadow-[0_14px_34px_rgba(168,85,247,0.55)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>Start 2-Day Free Trial</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl sm:rounded-full bg-slate-100/90 dark:bg-[#150E30]/90 hover:bg-slate-200/80 dark:hover:bg-[#1E1442] text-slate-900 dark:text-white font-bold text-sm sm:text-base border border-slate-200 dark:border-purple-400/25 hover:border-[#8B5CF6]/60 shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-[#7F22FE] dark:text-purple-400" />
              <span>Explore AI Features</span>
            </button>
          </div>

          {/* Trust Badges */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200/80 dark:border-purple-500/15 flex flex-wrap items-center justify-center gap-y-2 gap-x-4 sm:gap-x-6 text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>2-Day Free Trial (No Advance Payment)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#7F22FE] dark:text-purple-400 shrink-0" />
              <span>100% Free Done-For-You Page Setup</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Unlimited Replies (0 TK Per Message)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#7F22FE] dark:text-purple-400 shrink-0" />
              <span>Official Meta API • 0% Ban Risk</span>
            </div>
          </div>
        </div>

        {/* Premium "How it works" 3-Step Section (White brand background, purple accent #7c3aed, glass cards) */}
        <div className="mt-4 sm:mt-6 -mx-4 sm:-mx-6 lg:-mx-8">
          <HowItWorksSteps />
        </div>
      </div>
    </section>
  );
};
