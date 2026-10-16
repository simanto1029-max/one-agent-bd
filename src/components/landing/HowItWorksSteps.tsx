import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Settings,
  BookOpen,
  Sliders,
  Store,
  Layers,
  Zap,
  MousePointer
} from 'lucide-react';

// ============================================================================
// ALL TEXT CONTENT IN ONE SINGLE CONSTANT
// ============================================================================
export const CONTENT = {
  orbSparkleAria: "AI Central Core Hub",
  steps: {
    step1: {
      badge: "STEP 01",
      title: "Social Platforms Integration",
      description: "Connect WhatsApp, Facebook Page, and Instagram DM in seconds with official Cloud APIs.",
      inputPlaceholder: "Enter Page ID or WhatsApp Business Number...",
      buttonText: "Integrate",
      platforms: [
        { name: "WhatsApp", color: "#25D366", label: "WhatsApp" },
        { name: "Facebook", color: "#1877F2", label: "Facebook" },
        { name: "Instagram", color: "#E1306C", label: "Instagram" }
      ],
      connectedStatus: "Official Meta API • Instant Sync"
    },
    step2: {
      badge: "STEP 02",
      title: "Website Integration",
      description: "Seamless 1-click webhook sync with your custom eCommerce storefront or CMS catalog.",
      chips: [
        { label: "Shopify Built Site", type: "shopify", platform: "Shopify" },
        { label: "WooCommerce Built Site", type: "woo", platform: "WooCommerce" }
      ],
      syncText: "Catalog & Courier Webhook Synced",
      dotsCount: 9
    },
    step3: {
      badge: "STEP 03",
      title: "AI Instruction",
      description: "Customize your AI's voice, sales scripts, delivery rules, and product knowledge bank in Bangla & English.",
      cards: [
        {
          id: "settings",
          title: "AI Settings",
          subtitle: "Tone & Voice Configuration",
          icon: "sliders",
          tags: ["Polite Bangla (আপনি)", "Instant 0.8s Reply", "Strict Anti-Hallucination"]
        },
        {
          id: "instructions",
          title: "AI Instructions",
          subtitle: "Sales Script & COD Policy",
          icon: "settings",
          tags: ["Prompt: Confirm size & COD", "Auto-calculate Steadfast fee", "Fraud Detection: 99%"]
        },
        {
          id: "knowledge",
          title: "AI Knowledge Base",
          subtitle: "Product Catalog & Memory",
          icon: "book",
          tags: ["1,420 Live SKUs Synced", "Real-Time Stock Updates", "FAQ Memory Enabled"]
        }
      ]
    }
  }
} as const;

// Clean SVGs for Social Platforms
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const ShopifyIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#95BF47] fill-current">
    <path d="M19.3 6.4c-.1-.3-.3-.4-.5-.4-.2 0-1.7.1-1.7.1s-1.1-1.1-1.3-1.3c-.2-.2-.6-.3-.9-.2l-.8.2c-.3-.8-.7-1.7-1.4-2.4-.9-1-2.1-1.5-3.3-1.4-.3 0-.6.1-.9.2-.5.3-.9.7-1.2 1.3-.8 1.4-.9 3.2-.5 4.8l-3.3 1c-.3.1-.5.3-.6.6 0 .1-.5 3.8-1 7.6-.7 5.5-1.4 11-1.4 11.2 0 .4.3.7.7.7.1 0 10.5-.3 10.5-.3s3.9 4 4.1 4.2c.2.2.5.3.8.1.3-.1 6.5-18.7 6.6-19.1.1-.3 0-.6-.2-.8l-4.4-6.4zm-6.7-3.7c.9 0 1.7.5 2.2 1.2.6.8.9 1.8 1.1 2.8l-4.7 1.5c-.3-1.4-.2-2.8.5-4 .2-.4.5-.9.9-1.5zm-1.8 2c.2-.3.4-.6.7-.8l3.9 11.9-4.6-1.4s0-9.7 0-9.7zm-2.8 2.2l2.3-.7s0 9.2 0 9.2l-2.3-.7V6.9z" />
  </svg>
);

const WooIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#96588A] fill-current">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.4 14.5c-2.3 0-3.6-1.5-3.6-3.8 0-2.4 1.5-4.2 3.8-4.2 2 0 3.3 1.2 3.3 3.1 0 .6-.1 1.2-.4 1.6l-3.8.4c.1 1.2.7 1.8 1.8 1.8.8 0 1.5-.3 2-1l.9 1c-.8 1-1.9 1.1-4 1.1zm.1-5.7c-1.1 0-1.8.8-1.9 1.9l2.5-.3c.2-.9-.1-1.6-.6-1.6zm6.8 5.7c-1.9 0-3.2-1.2-3.2-3.1 0-.6.1-1.2.4-1.6l3.8-.4c-.1-1.2-.7-1.8-1.8-1.8-.8 0-1.5.3-2 1l-.9-1c.8-1 1.9-1.1 4-1.1 2.3 0 3.6 1.5 3.6 3.8 0 2.4-1.5 4.2-3.9 4.2z" />
  </svg>
);

export const HowItWorksSteps: React.FC = () => {
  // Active dot in the 9-dots loop animation
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % CONTENT.steps.step2.dotsCount);
    }, 450);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="how-it-works-steps"
      className="relative w-full bg-white text-slate-800 pt-0 pb-10 sm:pb-14 px-3 sm:px-6 lg:px-8 font-sans select-none"
    >
      {/* 100% Pure Seamless White Background - No ambient blurry glow divs or dark/purple band shadows */}
      <div className="relative max-w-7xl mx-auto">
        {/* ===================================================================
            CENTER: BIG GLOWING PURPLE ORB WITH BEAUTIFUL WHITE AI SPARKLE LOGO
            & 3 PURPLE CONNECTOR LINES DRAWING DOWN
           =================================================================== */}
        <div className="relative flex flex-col items-center">
          {/* Glowing Purple Orb Container */}
          <div className="relative z-20 flex items-center justify-center">
            {/* Subtle Aura tightly focused on the orb */}
            <motion.div
              animate={{
                scale: [1, 1.16, 1],
                opacity: [0.55, 0.85, 0.55]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-r from-[#7c3aed]/35 via-purple-500/30 to-[#9333ea]/35 blur-xl pointer-events-none"
            />

            {/* Orb Spring-In Animation with High-End Glowing AI Sparkle Logo */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.15
              }}
              className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full p-[2.5px] bg-gradient-to-b from-purple-200 via-[#7c3aed] to-[#581c87] shadow-[0_10px_32px_rgba(124,58,237,0.38),0_4px_16px_rgba(124,58,237,0.2)] flex items-center justify-center cursor-pointer group hover:scale-105 transition-transform"
            >
              {/* Inner 3D Sphere with Radial Depth */}
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#8b5cf6] via-[#7c3aed] to-[#6d28d9] flex items-center justify-center shadow-inner relative overflow-hidden">
                {/* Specular Highlight Sheen */}
                <div className="absolute top-1 left-2 w-6 h-3 bg-white/40 rounded-full blur-[1px] transform -rotate-12 pointer-events-none" />

                {/* White AI Sparkle Icon in Center */}
                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-white drop-shadow-[0_0_12px_rgba(255,255,255,0.95)] animate-pulse" />
              </div>
            </motion.div>
          </div>

          {/* SVG Connector Lines Container (Desktop: 3 branched connector lines) */}
          <div className="relative w-full max-w-5xl h-16 sm:h-20 hidden md:block z-10 pointer-events-none -mt-2">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 1000 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Purple Connector Gradient for White Background */}
                <linearGradient id="connectorGradientWhite" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="50%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#9333ea" />
                </linearGradient>

                {/* Light Pulse Glow Filter */}
                <filter id="pulseGlowLight" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Line 1: Left Branch to Card 1 */}
              <motion.path
                d="M 500 8 C 500 42, 166 34, 166 98"
                stroke="url(#connectorGradientWhite)"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.9 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.35, ease: "easeInOut" }}
              />

              {/* Line 2: Center Branch to Card 2 */}
              <motion.path
                d="M 500 8 L 500 98"
                stroke="url(#connectorGradientWhite)"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.9 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.35, ease: "easeInOut" }}
              />

              {/* Line 3: Right Branch to Card 3 */}
              <motion.path
                d="M 500 8 C 500 42, 833 34, 833 98"
                stroke="url(#connectorGradientWhite)"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.9 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.35, ease: "easeInOut" }}
              />

              {/* Traveling Light Pulses along the 3 connector paths */}
              {/* Pulse 1: Left */}
              <motion.circle
                r="4"
                fill="#7c3aed"
                filter="url(#pulseGlowLight)"
                animate={{
                  cx: [500, 360, 240, 166],
                  cy: [8, 36, 58, 98],
                  opacity: [0, 1, 1, 0]
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  repeatDelay: 0.4,
                  ease: "easeInOut"
                }}
              />

              {/* Pulse 2: Center */}
              <motion.circle
                r="4"
                fill="#7c3aed"
                filter="url(#pulseGlowLight)"
                animate={{
                  cx: [500, 500],
                  cy: [8, 98],
                  opacity: [0, 1, 1, 0]
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  repeatDelay: 0.6,
                  ease: "easeInOut"
                }}
              />

              {/* Pulse 3: Right */}
              <motion.circle
                r="4"
                fill="#7c3aed"
                filter="url(#pulseGlowLight)"
                animate={{
                  cx: [500, 640, 760, 833],
                  cy: [8, 36, 58, 98],
                  opacity: [0, 1, 1, 0]
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  repeatDelay: 0.4,
                  ease: "easeInOut"
                }}
              />
            </svg>
          </div>

          {/* Mobile Connector Line: Vertical drop with traveling pulse */}
          <div className="relative w-full h-8 md:hidden flex justify-center items-center my-2 pointer-events-none">
            <div className="w-[2px] h-full bg-gradient-to-b from-[#7c3aed] to-purple-300 relative overflow-hidden rounded-full">
              <motion.div
                animate={{ y: [-10, 35] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-full h-3 bg-[#7c3aed] blur-[0.5px]"
              />
            </div>
          </div>

          {/* ===================================================================
              3 GLASS CARDS GRID (PREMIUM ULTRA-DETAILED DESIGN)
             =================================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-7 w-full mt-1 lg:mt-0">
            {/* ---------------------------------------------------------------
                CARD 1: "Social Platforms Integration"
               --------------------------------------------------------------- */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
              whileHover={{ y: -5 }}
              className="group relative rounded-3xl p-5 sm:p-6 bg-white/95 backdrop-blur-xl border border-slate-200/90 hover:border-[#7c3aed]/40 transition-all duration-300 shadow-[0_8px_25px_-5px_rgba(124,58,237,0.08),0_4px_16px_-4px_rgba(15,23,42,0.05)] hover:shadow-[0_18px_36px_-5px_rgba(124,58,237,0.16)] flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Step Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase bg-[#7c3aed]/10 border border-[#7c3aed]/25 text-[#7c3aed]">
                    {CONTENT.steps.step1.badge}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Live Ready</span>
                  </div>
                </div>

                {/* Card Title & Description */}
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mb-1.5 group-hover:text-[#7c3aed] transition-colors">
                  {CONTENT.steps.step1.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed mb-4">
                  {CONTENT.steps.step1.description}
                </p>

                {/* Stacked Glass Layers with Gentle Floating Animation */}
                <div className="relative py-2 sm:py-3 flex items-center justify-center">
                  {/* Bottom Stack Layer (Lowest depth) */}
                  <div className="absolute w-[88%] h-24 rounded-2xl bg-slate-50 border border-slate-200/60 -bottom-2 scale-90 translate-y-3 pointer-events-none shadow-sm" />

                  {/* Middle Stack Layer (Subtle depth) */}
                  <div className="absolute w-[94%] h-24 rounded-2xl bg-slate-100/80 border border-purple-200/50 -bottom-1 scale-95 translate-y-1.5 pointer-events-none shadow-sm" />

                  {/* Top Active Interactive Floating Layer */}
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 4.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative w-full rounded-2xl p-3.5 sm:p-4 bg-white border border-slate-200/90 shadow-[0_8px_20px_-5px_rgba(15,23,42,0.08)]"
                  >
                    {/* Social Platform Icons Row */}
                    <div className="flex items-center justify-center gap-2 sm:gap-2.5 mb-3">
                      {CONTENT.steps.step1.platforms.map((p) => (
                        <div
                          key={p.name}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
                        >
                          <div
                            className="w-5 h-5 rounded-lg flex items-center justify-center text-white shrink-0"
                            style={{ backgroundColor: p.color }}
                          >
                            {p.name === 'WhatsApp' && <WhatsAppIcon />}
                            {p.name === 'Facebook' && <FacebookIcon />}
                            {p.name === 'Instagram' && <InstagramIcon />}
                          </div>
                          <span className="text-[11px] font-semibold text-slate-700 hidden xs:inline">{p.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Channel Input Field & Integrate Button */}
                    <div className="space-y-2">
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value="https://facebook.com/your-store-page"
                          placeholder={CONTENT.steps.step1.inputPlaceholder}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono tracking-tight focus:outline-none cursor-default select-none pr-8 truncate"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500" />
                      </div>

                      {/* Integrate Button with Purple Gradient & Glow */}
                      <button
                        type="button"
                        className="w-full py-2 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#7c3aed] to-[#9333ea] hover:from-[#6d28d9] hover:to-[#7e22ce] shadow-[0_4px_14px_rgba(124,58,237,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{CONTENT.steps.step1.buttonText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Footer Indicator */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {CONTENT.steps.step1.connectedStatus}
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">0s Delay</span>
              </div>
            </motion.div>

            {/* ---------------------------------------------------------------
                CARD 2: "Website Integration"
               --------------------------------------------------------------- */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
              whileHover={{ y: -5 }}
              className="group relative rounded-3xl p-5 sm:p-6 bg-white/95 backdrop-blur-xl border border-slate-200/90 hover:border-[#7c3aed]/40 transition-all duration-300 shadow-[0_8px_25px_-5px_rgba(124,58,237,0.08),0_4px_16px_-4px_rgba(15,23,42,0.05)] hover:shadow-[0_18px_36px_-5px_rgba(124,58,237,0.16)] flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Step Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase bg-[#7c3aed]/10 border border-[#7c3aed]/25 text-[#7c3aed]">
                    {CONTENT.steps.step2.badge}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-[#7c3aed] font-semibold">
                    <Store className="w-3.5 h-3.5 text-[#7c3aed]" />
                    <span>eCom Direct</span>
                  </div>
                </div>

                {/* Card Title & Description */}
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mb-1.5 group-hover:text-[#7c3aed] transition-colors">
                  {CONTENT.steps.step2.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed mb-4">
                  {CONTENT.steps.step2.description}
                </p>

                {/* Pipeline Sync Box with 9 Dots Lighting Up */}
                <div className="rounded-2xl p-3 bg-slate-50/90 border border-slate-200/90 mb-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                      Live Sync Pipeline
                    </span>
                    <span className="text-[10px] font-mono text-[#7c3aed] font-bold">
                      {(activeDot + 1) * 11}% Synced
                    </span>
                  </div>

                  {/* 9 Dots Lighting Up One by One in a Loop */}
                  <div className="flex items-center justify-between px-1 py-1">
                    {Array.from({ length: CONTENT.steps.step2.dotsCount }).map((_, index) => {
                      const isActive = index === activeDot;
                      const isPast = index < activeDot;
                      return (
                        <div key={index} className="flex items-center flex-1 justify-center relative">
                          <motion.div
                            animate={{
                              scale: isActive ? 1.4 : 1,
                              backgroundColor: isActive
                                ? '#7c3aed'
                                : isPast
                                ? '#9333ea'
                                : '#e2e8f0',
                              boxShadow: isActive
                                ? '0 0 10px rgba(124, 58, 237, 0.7)'
                                : 'none'
                            }}
                            transition={{ duration: 0.2 }}
                            className="w-2.5 h-2.5 rounded-full"
                          />
                          {index < CONTENT.steps.step2.dotsCount - 1 && (
                            <div
                              className={`h-[1.5px] w-full transition-colors duration-200 ${
                                isPast ? 'bg-[#7c3aed]/40' : 'bg-slate-200'
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Chips Container with Floating Animated Cursors */}
                <div className="relative py-2 sm:py-3 flex flex-col items-center gap-2.5">
                  {/* Floating Cursor 1 (Drifting towards Shopify chip) */}
                  <motion.div
                    animate={{
                      x: [-6, 6, -3, -6],
                      y: [-4, 4, -2, -4]
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute top-1 left-3 sm:left-5 z-20 pointer-events-none flex items-center gap-1"
                  >
                    <MousePointer className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900 fill-slate-900 drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)] transform -rotate-12" />
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-600 text-white shadow-sm">
                      Sync
                    </span>
                  </motion.div>

                  {/* Floating Cursor 2 (Drifting towards WooCommerce chip) */}
                  <motion.div
                    animate={{
                      x: [6, -6, 3, 6],
                      y: [3, -5, 2, 3]
                    }}
                    transition={{
                      duration: 4.2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute bottom-1 right-3 sm:right-5 z-20 pointer-events-none flex items-center gap-1"
                  >
                    <MousePointer className="w-4 h-4 sm:w-5 sm:h-5 text-[#7c3aed] fill-[#7c3aed] drop-shadow-[0_2px_6px_rgba(124,58,237,0.3)] transform -rotate-45" />
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#7c3aed] text-white shadow-sm">
                      Click
                    </span>
                  </motion.div>

                  {/* Chip 1: Shopify Built Site */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative w-full max-w-[270px] px-3.5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-500/50 transition-all flex items-center justify-between shadow-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#95BF47]/15 border border-[#95BF47]/30 flex items-center justify-center">
                        <ShopifyIcon />
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        {CONTENT.steps.step2.chips[0].label}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      Active
                    </span>
                  </motion.div>

                  {/* Chip 2: WooCommerce Built Site */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative w-full max-w-[270px] px-3.5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-purple-500/50 transition-all flex items-center justify-between shadow-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#96588A]/15 border border-[#96588A]/30 flex items-center justify-center">
                        <WooIcon />
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        {CONTENT.steps.step2.chips[1].label}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                      Auto-Link
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* Footer Indicator */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#7c3aed]" />
                  {CONTENT.steps.step2.syncText}
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">1-Click</span>
              </div>
            </motion.div>

            {/* ---------------------------------------------------------------
                CARD 3: "AI Instruction" (PREMIUM PURE WHITE CRISP CARDS)
               --------------------------------------------------------------- */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.45, ease: "easeOut" }}
              whileHover={{ y: -5 }}
              className="group relative rounded-3xl p-5 sm:p-6 bg-white/95 backdrop-blur-xl border border-slate-200/90 hover:border-[#7c3aed]/40 transition-all duration-300 shadow-[0_8px_25px_-5px_rgba(124,58,237,0.08),0_4px_16px_-4px_rgba(15,23,42,0.05)] hover:shadow-[0_18px_36px_-5px_rgba(124,58,237,0.16)] flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Step Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase bg-[#7c3aed]/10 border border-[#7c3aed]/25 text-[#7c3aed]">
                    {CONTENT.steps.step3.badge}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-[#7c3aed] font-semibold">
                    <Layers className="w-3.5 h-3.5 text-[#7c3aed]" />
                    <span>Adaptive Brain</span>
                  </div>
                </div>

                {/* Card Title & Description */}
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mb-1.5 group-hover:text-[#7c3aed] transition-colors">
                  {CONTENT.steps.step3.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed mb-4">
                  {CONTENT.steps.step3.description}
                </p>

                {/* 3 Clean, Crisp Pure White Sub-Cards with Ample Breathing Room */}
                <div className="space-y-2.5">
                  {/* Sub-Card 1: AI Settings (Pure White, Crisp Border) */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="w-full rounded-2xl p-3 bg-white border border-slate-200 hover:border-[#7c3aed]/50 shadow-xs hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/25 flex items-center justify-center">
                          <Sliders className="w-3.5 h-3.5 text-[#7c3aed]" />
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                          {CONTENT.steps.step3.cards[0].title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md font-semibold">
                        Tone &amp; Speed
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pl-8">
                      {CONTENT.steps.step3.cards[0].tags.slice(0, 2).map((t, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-slate-700 font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </motion.div>

                  {/* Sub-Card 2: AI Instructions (Pure White, Accent Ring) */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="w-full rounded-2xl p-3 bg-white border border-slate-200 hover:border-purple-400 shadow-xs hover:shadow-md transition-all cursor-pointer relative"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                          <Settings className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                          {CONTENT.steps.step3.cards[1].title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
                        99% Accuracy
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pl-8">
                      {CONTENT.steps.step3.cards[1].tags.slice(0, 2).map((t, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50/60 border border-purple-100 text-purple-800 font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </motion.div>

                  {/* Sub-Card 3: AI Knowledge Base (Pure White, Sync Badge) */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="w-full rounded-2xl p-3 bg-white border border-slate-200 hover:border-[#7c3aed]/50 shadow-xs hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center">
                          <BookOpen className="w-3.5 h-3.5 text-cyan-600" />
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                          {CONTENT.steps.step3.cards[2].title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-md font-semibold">
                        1.4K SKUs Synced
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pl-8">
                      {CONTENT.steps.step3.cards[2].tags.slice(0, 2).map((t, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-slate-700 font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Footer Indicator */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Self-Learning Auto Retrain
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Bangla + Eng</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
