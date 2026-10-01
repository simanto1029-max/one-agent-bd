import React from 'react';
import {
  ArrowRight,
  Bot,
  Globe,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Truck,
  Zap,
  Clock,
  ShoppingBag,
  CreditCard,
  Calendar
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
  const partnerBadges = [
    {
      name: 'Meta Official API',
      tag: 'Verified Graph API',
      dotColor: 'bg-blue-500',
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      icon: Globe
    },
    {
      name: 'WhatsApp Cloud API',
      tag: '0% Ban Protection',
      dotColor: 'bg-emerald-500',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      icon: Zap
    },
    {
      name: 'Steadfast Courier',
      tag: '1-Click Dispatch & Ratio',
      dotColor: 'bg-teal-500',
      iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
      icon: Truck
    },
    {
      name: 'Pathao Courier',
      tag: 'Auto Booking & Tracking',
      dotColor: 'bg-rose-500',
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      icon: Truck
    },
    {
      name: 'RedX Logistics',
      tag: 'Live Parcel Status',
      dotColor: 'bg-red-500',
      iconBg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      icon: ShieldCheck
    },
    {
      name: 'WooCommerce Store',
      tag: 'Real-Time Order Sync',
      dotColor: 'bg-purple-500',
      iconBg: 'bg-purple-500/10 text-[#7F22FE] dark:text-purple-400 border-purple-500/20',
      icon: ShoppingBag
    },
    {
      name: 'Shopify Store',
      tag: 'Catalog & Webhook Sync',
      dotColor: 'bg-emerald-500',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      icon: ShoppingBag
    },
    {
      name: 'bKash & Nagad Gateway',
      tag: 'Instant Activation',
      dotColor: 'bg-pink-500',
      iconBg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
      icon: CreditCard
    },
    {
      name: 'Google Calendar AI',
      tag: 'Auto Slot Booking',
      dotColor: 'bg-indigo-500',
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      icon: Calendar
    }
  ];

  const roiStats = [
    {
      value: '< 2 Sec',
      label: 'Instant Bangla & Voice Reply',
      subtext: 'Replies to texts, voice notes & product photos automatically',
      icon: Zap,
      color: 'text-[#7F22FE] dark:text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20'
    },
    {
      value: '100% Auto',
      label: 'Customer Fraud & Ratio Check',
      subtext: 'Verifies Steadfast, Pathao & RedX delivery history on every order',
      icon: ShieldCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      value: '0 TK',
      label: 'Per-Message Extra Cost',
      subtext: 'Unlimited customer conversations & auto order confirmations',
      icon: Sparkles,
      color: 'text-fuchsia-600 dark:text-fuchsia-400',
      bg: 'bg-fuchsia-500/10 border-fuchsia-500/20'
    },
    {
      value: '24/7 Live',
      label: 'Night & Holiday Order Capture',
      subtext: 'Never lose late-night Facebook, Instagram or WhatsApp buyers',
      icon: Clock,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20'
    }
  ];

  const channels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      badge: 'Official Cloud API',
      badgeClass:
        'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
      iconBg: 'bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white shadow-lg shadow-emerald-500/25',
      accentBorder: 'hover:border-emerald-500/45',
      description:
        '0% ban risk with Official Meta Cloud API. Listens to Bangla voice notes & confirms COD orders in chat.',
      metrics: 'Voice Note + Auto Order',
      svg: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M12.031 2c-5.516 0-9.999 4.486-9.999 10.001 0 1.766.461 3.489 1.338 5.012L2 22l5.118-1.341c1.477.805 3.141 1.23 4.911 1.23h.004c5.515 0 9.998-4.486 9.998-10.001 0-2.672-1.04-5.184-2.928-7.073C17.214 3.04 14.703 2 12.031 2zm5.826 14.12c-.244.687-1.425 1.314-1.976 1.397-.505.075-1.144.107-1.846-.116-.426-.135-.974-.316-1.678-.62-2.953-1.275-4.881-4.249-5.029-4.446-.147-.197-1.2-1.596-1.2-3.045 0-1.449.759-2.161 1.029-2.456.27-.295.589-.369.785-.369.196 0 .392.002.564.01.181.009.424-.069.663.507.245.59.834 2.039.908 2.186.074.147.123.319.025.516-.098.197-.147.319-.295.491-.147.172-.31.384-.442.516-.147.147-.301.307-.129.602.172.295.763 1.259 1.639 2.04 1.126 1.004 2.075 1.315 2.37 1.462.295.147.466.123.638-.074.172-.197.736-.86.933-1.155.196-.295.392-.246.662-.147.27.098 1.718.81 2.012.958.295.147.491.221.565.344.073.123.073.712-.171 1.399z" />
        </svg>
      )
    },
    {
      id: 'messenger',
      name: 'Facebook Messenger',
      badge: 'Comment + Inbox DM',
      badgeClass:
        'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25',
      iconBg: 'bg-gradient-to-br from-[#00B2FF] to-[#006AFF] text-white shadow-lg shadow-blue-500/25',
      accentBorder: 'hover:border-blue-500/45',
      description:
        'Replies to Facebook post comments publicly and sends product price & details straight to Messenger.',
      metrics: 'Auto Comment-to-DM',
      svg: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.13.26.35.27.57l.05 1.78c.04.57.61.94 1.13.71l1.98-.87c.17-.08.36-.1.55-.06.91.25 1.87.38 2.88.38 5.64 0 10-4.13 10-9.7C22 6.13 17.64 2 12 2zm5.89 7.58-2.93 4.67c-.47.74-1.47.92-2.17.4l-2.33-1.75a.6.6 0 0 0-.72 0l-3.15 2.39c-.42.32-.97-.18-.69-.63l2.93-4.67c.47-.74 1.47-.92 2.17-.4l2.33 1.75a.6.6 0 0 0 .72 0l3.15-2.39c.42-.32.97.18.69.63z" />
        </svg>
      )
    },
    {
      id: 'instagram',
      name: 'Instagram Direct',
      badge: 'DM, Story & Reels',
      badgeClass:
        'bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/25',
      iconBg: 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white shadow-lg shadow-pink-500/25',
      accentBorder: 'hover:border-pink-500/45',
      description:
        'Recognizes product screenshots sent in DMs, replies to Story mentions & Reels comments automatically.',
      metrics: 'Photo Search + Instant DM',
      svg: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      )
    },
    {
      id: 'website',
      name: 'Website AI Widget',
      badge: '1-Line Store Sync',
      badgeClass:
        'bg-purple-500/10 text-[#7F22FE] dark:text-purple-300 border-purple-500/25',
      iconBg: 'bg-gradient-to-br from-[#7F22FE] via-[#9333EA] to-[#C026D3] text-white shadow-lg shadow-purple-500/25',
      accentBorder: 'hover:border-[#7F22FE]/55',
      description:
        'Embed our live AI chat widget on WordPress, WooCommerce, Shopify, or custom websites in 1 click.',
      metrics: 'Store Sync + Live Chat',
      svg: <Globe className="w-6 h-6" />
    }
  ];

  const loopedPartners = [...partnerBadges, ...partnerBadges];

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
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200/80 dark:border-purple-500/15 flex flex-wrap items-center justify-center gap-y-2 gap-x-4 sm:gap-x-6 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>2-Day Free Trial (No Card Needed)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Meta Official Cloud API</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#7F22FE] dark:text-purple-400 shrink-0" />
              <span>Instant bKash &amp; Nagad Gateway</span>
            </div>
          </div>
        </div>

        {/* 1. AUTO-SCROLLING OFFICIAL INTEGRATION & COURIER PARTNER MARQUEE */}
        <div className="mt-9 sm:mt-11">
          <p className="text-center text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500 mb-3.5">
            SEAMLESSLY INTEGRATED WITH OFFICIAL PLATFORMS &amp; COURIERS
          </p>
          <div className="relative w-full overflow-hidden py-2">
            {/* Soft Left & Right Fade Edges */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-20 bg-gradient-to-r from-white dark:from-[#0B0720] to-transparent z-10"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-20 bg-gradient-to-l from-white dark:from-[#0B0720] to-transparent z-10"
            />

            <div className="animate-partner-marquee gap-3.5 sm:gap-4">
              {loopedPartners.map((partner, idx) => {
                const Icon = partner.icon;
                return (
                  <div
                    key={`${partner.name}_${idx}`}
                    className="shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#150E32]/90 border border-slate-200/85 dark:border-purple-500/20 shadow-[0_8px_20px_-8px_rgba(15,23,42,0.08)] hover:border-[#7F22FE]/45 transition-all"
                  >
                    <div
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${partner.iconBg}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                          {partner.name}
                        </span>
                        <span className={`w-1.5 h-1.5 rounded-full ${partner.dotColor} shrink-0`} />
                      </div>
                      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {partner.tag}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. LIVE ROI & PERFORMANCE METRICS STRIP */}
        <div className="mt-7 sm:mt-9 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {roiStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-white to-violet-50/35 dark:from-[#160E36] dark:to-[#110B29] border border-violet-200/75 dark:border-purple-500/20 shadow-[0_12px_30px_-12px_rgba(124,58,237,0.12)] flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xl sm:text-2xl lg:text-[26px] font-black tracking-tight bg-gradient-to-r from-[#7F22FE] via-[#9333EA] to-[#DB2777] bg-clip-text text-transparent">
                    {stat.value}
                  </span>
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${stat.bg}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                    {stat.label}
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed hidden sm:block">
                    {stat.subtext}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Premium Omnichannel Architecture Hub (#channels) */}
        <div id="channels" className="mt-10 sm:mt-14 scroll-mt-20">
          <div className="relative rounded-[28px] sm:rounded-[32px] p-5 sm:p-8 lg:p-10 bg-gradient-to-b from-[#FAF8FF] via-white to-[#F6F2FF] dark:from-[#150D34] dark:via-[#110A2A] dark:to-[#0E0823] border border-violet-200/90 dark:border-purple-500/25 shadow-[0_24px_60px_-15px_rgba(127,34,254,0.12),0_10px_30px_-10px_rgba(15,23,42,0.06)] overflow-hidden">
            {/* Subtle Top Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[180px] bg-gradient-to-r from-[#7F22FE]/15 via-[#9333EA]/15 to-[#DB2777]/15 blur-3xl"
            />

            {/* Header + Central AI Engine Pill */}
            <div className="relative z-10 text-center max-w-4xl mx-auto mb-7 sm:mb-9">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white dark:bg-[#1D1244] border border-violet-200/90 dark:border-purple-500/30 shadow-2xs mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#7F22FE] dark:text-purple-400" />
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#7F22FE] dark:text-purple-300">
                  OMNICHANNEL AI ARCHITECTURE
                </span>
              </div>

              <h2 className="text-[17px] sm:text-2xl md:text-3xl lg:text-[32px] font-black text-slate-900 dark:text-white tracking-tight leading-tight whitespace-nowrap">
                Connect Every Channel to{' '}
                <span className="bg-gradient-to-r from-[#7F22FE] via-[#9333EA] to-[#DB2777] bg-clip-text text-transparent">
                  One Smart AI Agent
                </span>
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300/85 max-w-2xl mx-auto leading-relaxed">
                No need to switch between different apps. Customers message you anywhere—your AI agent replies in 2 seconds, verifies fraud ratio, and books orders 24/7.
              </p>
            </div>

            {/* 4 Premium Elevated Channel Cards */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {channels.map((ch) => (
                <div
                  key={ch.id}
                  className={`group relative rounded-2xl p-5 bg-white dark:bg-[#170F36]/95 border border-violet-100 dark:border-purple-500/20 ${ch.accentBorder} shadow-[0_14px_34px_-12px_rgba(15,23,42,0.08),0_4px_12px_-4px_rgba(124,58,237,0.06)] hover:shadow-[0_20px_44px_-12px_rgba(127,34,254,0.2)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between`}
                >
                  <div>
                    {/* Top Row: Brand Icon + Status Pill */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div
                        className={`w-12 h-12 rounded-2xl ${ch.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}
                      >
                        {ch.svg}
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${ch.badgeClass} whitespace-nowrap`}
                      >
                        ● {ch.badge}
                      </span>
                    </div>

                    {/* Channel Title & Description */}
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {ch.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-300/80 leading-relaxed">
                      {ch.description}
                    </p>
                  </div>

                  {/* Bottom Capability Tag */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-purple-500/15 flex items-center justify-between text-[11px] font-bold text-[#7F22FE] dark:text-purple-300">
                    <span>{ch.metrics}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider">
                      24/7 Active
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Unified Workflow Strip */}
            <div className="relative z-10 mt-6 sm:mt-7 pt-5 border-t border-violet-200/60 dark:border-purple-500/20 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs">
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1B1140] border border-violet-200/80 dark:border-purple-500/25 text-slate-700 dark:text-slate-200 font-bold shadow-2xs">
                <Zap className="w-3.5 h-3.5 text-[#7F22FE] dark:text-purple-400 shrink-0" />
                <span>2-Second Bangla &amp; Voice Reply</span>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1B1140] border border-violet-200/80 dark:border-purple-500/25 text-slate-700 dark:text-slate-200 font-bold shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>AI Auto Customer Fraud Check</span>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1B1140] border border-violet-200/80 dark:border-purple-500/25 text-slate-700 dark:text-slate-200 font-bold shadow-2xs">
                <Truck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>1-Click Steadfast, Pathao &amp; RedX + Auto Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
