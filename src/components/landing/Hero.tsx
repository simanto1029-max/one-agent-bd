import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Truck,
  Zap,
  Mic,
  Image as ImageIcon,
  MessageSquare,
  Megaphone
} from 'lucide-react';

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
    <section className="relative pt-8 pb-12 sm:pt-14 sm:pb-20 bg-white dark:bg-gradient-to-br dark:from-[#0B0720] dark:via-[#130B32] dark:to-[#090518] overflow-hidden transition-colors">
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

          <p className="mt-3.5 sm:mt-5 text-xs sm:text-base lg:text-lg text-slate-600 dark:text-slate-300/90 max-w-2xl mx-auto leading-relaxed font-normal px-1">
            Build and deploy autonomous AI agents across WhatsApp, Facebook Messenger, Instagram Direct, and your Website. Instant product photo search, voice note audio replies, automatic order booking, and fraud check in one dashboard.
          </p>

          {/* Supported Channels Visual Card Showcase */}
          <div className="mt-6 sm:mt-7 p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-50/90 dark:bg-[#140D32]/90 border border-slate-200/90 dark:border-purple-500/25 shadow-[0_12px_40px_-10px_rgba(124,58,237,0.18)] backdrop-blur-md">
            <div className="flex items-center justify-between gap-2 px-1 mb-2.5 sm:mb-3">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-600 dark:text-purple-300">
                <Sparkles className="w-3.5 h-3.5 text-[#7F22FE] dark:text-purple-400" />
                <span>Connected Omnichannel AI Channels</span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-500/10 dark:bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>24/7 AI Live Auto-Sync</span>
              </span>
            </div>

            {/* 5 Channel Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
              {/* 1. Facebook Messenger */}
              <div className="group relative p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white dark:bg-[#1B123D] border border-slate-200/80 dark:border-purple-500/20 hover:border-[#1877F2]/60 dark:hover:border-[#1877F2]/60 hover:shadow-md hover:shadow-[#1877F2]/10 transition-all flex items-center gap-2.5 text-left">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1877F2]/10 dark:bg-[#1877F2]/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="22" fill="#1877F2" />
                    <path
                      d="M27.5 24.5L28.2 19.8H23.8V16.8C23.8 15.5 24.4 14.3 26.4 14.3H28.4V10.4C27.3 10.2 26.2 10.1 25.1 10.1C21.8 10.1 19.6 12.1 19.6 15.8V19.8H15.6V24.5H19.6V35.7H23.8V24.5H27.5Z"
                      fill="white"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">Facebook</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">Messenger &amp; Page</div>
                </div>
              </div>

              {/* 2. Instagram Direct */}
              <div className="group relative p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white dark:bg-[#1B123D] border border-slate-200/80 dark:border-purple-500/20 hover:border-[#E1306C]/60 dark:hover:border-[#E1306C]/60 hover:shadow-md hover:shadow-[#E1306C]/10 transition-all flex items-center gap-2.5 text-left">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#E1306C]/10 dark:bg-[#E1306C]/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 48 48" fill="none">
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
                <div className="min-w-0 flex-1">
                  <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">Instagram</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">DMs &amp; Stories</div>
                </div>
              </div>

              {/* 3. WhatsApp Cloud API */}
              <div className="group relative p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white dark:bg-[#1B123D] border border-slate-200/80 dark:border-purple-500/20 hover:border-[#25D366]/60 dark:hover:border-[#25D366]/60 hover:shadow-md hover:shadow-[#25D366]/10 transition-all flex items-center gap-2.5 text-left">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#25D366]/10 dark:bg-[#25D366]/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="22" fill="#25D366" />
                    <path
                      d="M33.4 14.6C30.9 12.1 27.6 10.7 24.1 10.7C16.9 10.7 11 16.6 11 23.8C11 26.1 11.6 28.3 12.8 30.3L10.7 37.3L17.8 35.4C19.7 36.4 21.9 37 24.1 37C31.3 37 37.2 31.1 37.2 23.9C37.2 20.4 35.8 17.1 33.4 14.6ZM24.1 34.8C22.2 34.8 20.3 34.2 18.6 33.2L18.2 33L14 34.1L15.1 30.1L14.8 29.6C13.7 27.9 13.1 25.9 13.1 23.8C13.1 17.8 18 12.9 24.1 12.9C27 12.9 29.7 14 31.7 16C33.7 18 34.8 20.7 34.8 23.8C34.8 29.9 29.9 34.8 24.1 34.8ZM30 26.6C29.7 26.4 28 25.6 27.7 25.5C27.4 25.4 27.2 25.3 26.9 25.7C26.7 26 26.1 26.7 25.9 26.9C25.7 27.2 25.5 27.2 25.1 27C24.8 26.9 23.8 26.5 22.5 25.4C21.5 24.5 20.9 23.4 20.7 23C20.5 22.6 20.7 22.5 20.9 22.3C21 22.1 21.3 21.8 21.5 21.6C21.7 21.3 21.7 21.2 21.9 20.9C22 20.6 21.9 20.4 21.8 20.2C21.7 20.1 21.1 18.5 20.8 17.8C20.5 17.2 20.3 17.2 20.1 17.2C19.9 17.2 19.6 17.2 19.3 17.2C19 17.2 18.6 17.3 18.3 17.7C18 18.1 17 19.1 17 21.1C17 23.2 18.4 25.1 18.6 25.4C18.8 25.7 21.4 29.9 25.3 31.8C26.2 32.2 27 32.5 27.5 32.7C28.4 33 29.3 33 29.9 32.9C30.7 32.8 32.1 31.9 32.4 31C32.8 30.1 32.8 29.4 32.7 29.2C32.5 29.1 32.3 29 32 28.8L30 26.6Z"
                      fill="white"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">WhatsApp</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">Official Cloud API</div>
                </div>
              </div>

              {/* 4. Website Live Chat */}
              <div className="group relative p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white dark:bg-[#1B123D] border border-slate-200/80 dark:border-purple-500/20 hover:border-[#7C3AED]/60 dark:hover:border-[#7C3AED]/60 hover:shadow-md hover:shadow-[#7C3AED]/10 transition-all flex items-center gap-2.5 text-left">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#7C3AED]/10 dark:bg-[#7C3AED]/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 48 48" fill="none">
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
                <div className="min-w-0 flex-1">
                  <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">Website</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">Live Chat Widget</div>
                </div>
              </div>

              {/* 5. Email AI Broadcast */}
              <div className="col-span-2 sm:col-span-1 group relative p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white dark:bg-[#1B123D] border border-slate-200/80 dark:border-purple-500/20 hover:border-[#0284C7]/60 dark:hover:border-[#0284C7]/60 hover:shadow-md hover:shadow-[#0284C7]/10 transition-all flex items-center gap-2.5 text-left">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0284C7]/10 dark:bg-[#0284C7]/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 48 48" fill="none">
                    <defs>
                      <linearGradient id="heroEmailGrad" x1="0" y1="0" x2="48" y2="48">
                        <stop offset="0%" stopColor="#0284C7" />
                        <stop offset="100%" stopColor="#0EA5E9" />
                      </linearGradient>
                    </defs>
                    <rect width="44" height="44" x="2" y="2" rx="13" fill="url(#heroEmailGrad)" />
                    <rect x="11" y="14" width="26" height="19" rx="3.5" stroke="white" strokeWidth="2.4" fill="none" />
                    <path d="M12 16L24 25L36 16" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">Email</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">AI Broadcast &amp; News</div>
                </div>
              </div>
            </div>
          </div>

          {/* Primary CTAs */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
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

        {/* =====================================================================
            $100K ENTERPRISE VISUAL FLOWCHART BOX (Replaces Marquee & Channels)
           ===================================================================== */}
        <div id="channels" className="mt-12 sm:mt-16 scroll-mt-20">
          {/* Minimalist Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-7">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#7F22FE]/10 dark:bg-purple-500/15 border border-[#7F22FE]/25 text-[#7F22FE] dark:text-purple-300 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.16em] mb-2.5">
              <span className="w-2 h-2 rounded-full bg-[#7F22FE] animate-ping" />
              <span>AUTONOMOUS AI WORKFLOW</span>
            </div>
            <h2 className="text-xl sm:text-3xl md:text-[34px] font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Why Pay <span className="line-through text-rose-500/85 decoration-2">10,000 TK</span> for a Moderator?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
              From customer message to live parcel tracking &amp; VIP retargeting — 100% automated.
            </p>
          </div>

          {/* Flowchart Canvas Box */}
          <div className="relative rounded-[32px] p-5 sm:p-7 lg:p-9 bg-slate-50/75 dark:bg-[#110A2A]/90 border border-slate-200/90 dark:border-purple-500/25 shadow-[0_30px_80px_-20px_rgba(124,58,237,0.18),0_10px_30px_-10px_rgba(15,23,42,0.07)] overflow-hidden">
            {/* Engineered Dot-Matrix Background Grid */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(#cbd5e1_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(rgba(139,92,246,0.22)_1.2px,transparent_1.2px)] [background-size:20px_20px] opacity-70"
            />
            {/* Ambient Center Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[560px] h-[220px] bg-gradient-to-r from-[#7F22FE]/15 via-fuchsia-500/15 to-emerald-500/15 blur-3xl rounded-full"
            />

            {/* 4-Node Visual Flowchart Row */}
            <div className="relative z-10 flex flex-col lg:flex-row items-stretch justify-between gap-2 lg:gap-0">
              {/* NODE 01: Buyer Messages */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="flex-1 bg-white dark:bg-[#170F36] rounded-2xl p-4 border border-slate-200/90 dark:border-purple-500/25 shadow-[0_14px_34px_-10px_rgba(15,23,42,0.1)] flex flex-col justify-between hover:border-[#7F22FE]/50 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-purple-950/80 text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-purple-300">
                      STEP 01 • CHANNELS
                    </span>
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  </div>

                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                        Buyer Messages
                      </h3>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        WhatsApp • FB • IG • Web
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 pt-2.5 border-t border-slate-100 dark:border-purple-500/15">
                  <span className="px-2 py-0.5 rounded-md bg-violet-50 dark:bg-purple-950/60 text-[#7F22FE] dark:text-purple-300 text-[10px] font-bold flex items-center gap-1">
                    <Mic className="w-2.5 h-2.5" /> Voice Note
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-300 text-[10px] font-bold flex items-center gap-1">
                    <ImageIcon className="w-2.5 h-2.5" /> Photo
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                    Bangla
                  </span>
                </div>
              </motion.div>

              {/* FLOW CONNECTOR 1 */}
              <div className="shrink-0 lg:w-12 flex flex-col lg:flex-row items-center justify-center py-0.5 lg:py-0">
                <div className="hidden lg:flex items-center w-full justify-center relative">
                  <div className="h-[2px] w-full bg-gradient-to-r from-blue-500/40 via-[#7F22FE] to-[#7F22FE]" />
                  <span className="absolute -top-5 px-2 py-0.5 rounded-full bg-[#7F22FE] text-white text-[8px] font-black tracking-wide shadow-sm whitespace-nowrap">
                    &lt; 2 Sec
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#7F22FE] -ml-1.5 shrink-0" />
                </div>
                <div className="lg:hidden flex flex-col items-center">
                  <div className="w-[2px] h-3.5 bg-gradient-to-b from-blue-500 to-[#7F22FE]" />
                  <span className="px-2.5 py-0.5 rounded-full bg-[#7F22FE] text-white text-[9px] font-black">
                    ⚡ Instant &lt; 2 Sec
                  </span>
                  <div className="w-[2px] h-3.5 bg-[#7F22FE]" />
                </div>
              </div>

              {/* NODE 02: Central AI Brain Hub */}
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="flex-[1.25] bg-gradient-to-b from-white via-[#FBF9FF] to-[#F3EAFF] dark:from-[#1F124B] dark:via-[#180E3A] dark:to-[#130A30] rounded-2xl p-4 border-2 border-[#7F22FE] shadow-[0_20px_50px_-10px_rgba(127,34,254,0.35)] flex flex-col justify-between relative"
              >
                <div className="absolute -top-2.5 right-3 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#7F22FE] to-[#DB2777] text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                  AI Smart Closer
                </div>

                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7F22FE] to-[#DB2777] text-white flex items-center justify-center shadow-md shadow-[#7F22FE]/30 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#7F22FE] dark:text-purple-300 block">
                      STEP 02 • CORE ENGINE
                    </span>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                      One Agent AI Brain
                    </h3>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] font-bold">
                  <div className="px-2.5 py-1.5 rounded-xl bg-white/95 dark:bg-[#120A2E]/90 border border-violet-200/70 dark:border-purple-500/25 flex items-center justify-between gap-2 text-slate-800 dark:text-slate-100">
                    <span className="flex items-center gap-1.5 truncate">
                      <Check className="w-3.5 h-3.5 text-[#7F22FE] stroke-[3] shrink-0" />
                      <span className="truncate">Auto Reply &amp; Order Confirm</span>
                    </span>
                    <span className="text-[9px] font-extrabold text-[#7F22FE] dark:text-purple-300 shrink-0">24/7</span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-xl bg-white/95 dark:bg-[#120A2E]/90 border border-violet-200/70 dark:border-purple-500/25 flex items-center justify-between gap-2 text-slate-800 dark:text-slate-100">
                    <span className="flex items-center gap-1.5 truncate">
                      <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3] shrink-0" />
                      <span className="truncate">Fake Order Fraud Ratio Check</span>
                    </span>
                    <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0">AUTO</span>
                  </div>
                </div>
              </motion.div>

              {/* FLOW CONNECTOR 2 */}
              <div className="shrink-0 lg:w-12 flex flex-col lg:flex-row items-center justify-center py-0.5 lg:py-0">
                <div className="hidden lg:flex items-center w-full justify-center relative">
                  <div className="h-[2px] w-full bg-gradient-to-r from-[#7F22FE] to-indigo-500" />
                  <span className="absolute -top-5 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[8px] font-black tracking-wide shadow-sm whitespace-nowrap">
                    1-Click
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-600 -ml-1.5 shrink-0" />
                </div>
                <div className="lg:hidden flex flex-col items-center">
                  <div className="w-[2px] h-3.5 bg-[#7F22FE]" />
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-black">
                    1-Click Dispatch
                  </span>
                  <div className="w-[2px] h-3.5 bg-indigo-600" />
                </div>
              </div>

              {/* NODE 03: Courier Dispatch + AI Auto Order Tracking */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex-[1.15] bg-white dark:bg-[#170F36] rounded-2xl p-4 border border-slate-200/90 dark:border-purple-500/25 shadow-[0_14px_34px_-10px_rgba(15,23,42,0.1)] flex flex-col justify-between hover:border-indigo-500/50 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-purple-950/80 text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-purple-300">
                      STEP 03 • COURIER &amp; TRACKING
                    </span>
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  </div>

                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                        Courier &amp; Live Track
                      </h3>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        Steadfast • Pathao • RedX
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-purple-500/15">
                  <div className="px-2.5 py-1.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/70 dark:border-indigo-800/50 flex items-center gap-1.5 text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300">
                    <Check className="w-3 h-3 stroke-[3] shrink-0" />
                    <span className="truncate">AI Tracks Parcel &amp; Updates Buyer</span>
                  </div>
                </div>
              </motion.div>

              {/* FLOW CONNECTOR 3 */}
              <div className="shrink-0 lg:w-12 flex flex-col lg:flex-row items-center justify-center py-0.5 lg:py-0">
                <div className="hidden lg:flex items-center w-full justify-center relative">
                  <div className="h-[2px] w-full bg-gradient-to-r from-indigo-500 to-emerald-500" />
                  <span className="absolute -top-5 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[8px] font-black tracking-wide shadow-sm whitespace-nowrap">
                    Retarget
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600 -ml-1.5 shrink-0" />
                </div>
                <div className="lg:hidden flex flex-col items-center">
                  <div className="w-[2px] h-3.5 bg-indigo-600" />
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black">
                    VIP Retarget
                  </span>
                  <div className="w-[2px] h-3.5 bg-emerald-600" />
                </div>
              </div>

              {/* NODE 04: VIP Retargeting, Discounts & New Product Offers */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="flex-[1.15] bg-gradient-to-b from-emerald-50/90 to-white dark:from-emerald-950/35 dark:to-[#170F36] rounded-2xl p-4 border-2 border-emerald-500/40 shadow-[0_14px_34px_-10px_rgba(16,185,129,0.18)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-[9px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      STEP 04 • VIP RETARGET
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-white text-[8px] font-black uppercase">
                      3x Sales
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0">
                      <Megaphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                        VIP Offer &amp; Retarget
                      </h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                        Discounts &amp; New Products
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40">
                  <div className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                    <Check className="w-3 h-3 stroke-[3] shrink-0" />
                    <span className="truncate">Send Promo &amp; New Arrival DM</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sleek Bottom Dock Bar (3 Crisp Pills — Zero Clutter) */}
            <div className="relative z-10 mt-6 pt-5 border-t border-slate-200/80 dark:border-purple-500/20 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
              <div className="px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-800/50 text-rose-600 dark:text-rose-300 text-[11px] font-bold flex items-center gap-1.5">
                <span className="line-through opacity-85">Human Moderator: 10,000 TK/mo</span>
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-extrabold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>One Agent BD: 1,250 TK/mo (0 TK / Msg)</span>
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-violet-100/80 dark:bg-purple-950/80 border border-violet-200 dark:border-purple-500/30 text-[#7F22FE] dark:text-purple-200 text-[11px] font-extrabold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#7F22FE] dark:text-purple-300 shrink-0" />
                <span>100% Free Team Setup + 2-Day Trial</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
