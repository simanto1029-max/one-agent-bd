import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Truck,
  MessageSquare,
  Search,
  Bot
} from 'lucide-react';

interface Scenario {
  id: string;
  channel: 'whatsapp' | 'messenger' | 'instagram' | 'website';
  channelLabel: string;
  badgeColor: string;
  badgeBg: string;
  userQuery: string;
  userType: 'text' | 'voice' | 'photo';
  aiProcessStep: string;
  aiResponse: string;
  speed: string;
  actionTaken: string;
  actionIcon: React.ReactNode;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'whatsapp-voice',
    channel: 'whatsapp',
    channelLabel: 'WhatsApp Cloud API',
    badgeColor: 'text-[#25D366]',
    badgeBg: 'bg-[#25D366]/10 border-[#25D366]/30',
    userQuery: 'ভাইয়া, ব্ল্যাক কালার XL সাইজ কি আজকেই ডেলিভারি হবে?',
    userType: 'voice',
    aiProcessStep: 'Bangla Audio Transcribed • Stock Verified: 2 items in hub',
    aiResponse:
      'জী ভাইয়া! প্রিমিয়াম পোলো শার্ট (ব্ল্যাক XL) স্টকে আছে, প্রাইস ৮৫০ টাকা। আজ ৩টার মধ্যে কনফার্ম করলে আজকেই স্টেডফাস্ট কুরিয়ারে হস্তান্তর হবে। আপনার ডেলিভারি ঠিকানা দিন?',
    speed: '0.9s',
    actionTaken: 'Courier Auto-Dispatch Pre-Check',
    actionIcon: <Truck className="w-3.5 h-3.5 text-emerald-500" />
  },
  {
    id: 'messenger-photo',
    channel: 'messenger',
    channelLabel: 'Facebook Messenger',
    badgeColor: 'text-[#0084FF]',
    badgeBg: 'bg-[#0084FF]/10 border-[#0084FF]/30',
    userQuery: 'এই ব্যাগটার প্রাইস কত? কালেকশন দেখতে চাই। [📸 Photo Sent]',
    userType: 'photo',
    aiProcessStep: 'AI Vision Embeddings Match: #BG-884 (99.8% Confidence)',
    aiResponse:
      'আপু এটি আমাদের জেনুইন লেদার অফিস ব্যাগ (কোড: #BG-884)। রেগুলার প্রাইস ২৯৫০ টাকা, বর্তমান অফার প্রাইস ২৪৫০ টাকা। ক্যাশ অন ডেলিভারিতে অর্ডার করতে নিচে আপনার ফোন নম্বর ও পূর্ণ ঠিকানা দিন।',
    speed: '1.1s',
    actionTaken: 'Catalog Matched • Price Locked',
    actionIcon: <Search className="w-3.5 h-3.5 text-blue-500" />
  },
  {
    id: 'instagram-checkout',
    channel: 'instagram',
    channelLabel: 'Instagram Direct',
    badgeColor: 'text-[#E1306C]',
    badgeBg: 'bg-[#E1306C]/10 border-[#E1306C]/30',
    userQuery: 'শার্ট ২টা কনফার্ম করেন - তানভীর, ধানমন্ডি ৮/এ, ফোন 01711223344',
    userType: 'text',
    aiProcessStep: 'NLP Address Extracted • Fraud Check: 98% Delivery Success',
    aiResponse:
      'ধন্যবাদ তানভীর ভাই! আপনার অর্ডার সফলভাবে বুক করা হয়েছে। অর্ডার আইডি: #OD-88219। স্টেডফাস্ট ট্র্যাকিং লিঙ্ক আপনার মোবাইলে এসএমএস করা হয়েছে।',
    speed: '1.2s',
    actionTaken: 'Automated Order Booked & Invoiced',
    actionIcon: <CheckCircle2 className="w-3.5 h-3.5 text-[#E1306C]" />
  },
  {
    id: 'website-tracking',
    channel: 'website',
    channelLabel: 'Website Live Chat',
    badgeColor: 'text-[#7C3AED]',
    badgeBg: 'bg-[#7C3AED]/10 border-[#7C3AED]/30',
    userQuery: 'আমার পার্সেল এখন কোন হাব-এ আছে? ফোন ০১৮xxxxxxxx',
    userType: 'text',
    aiProcessStep: 'Live Courier API Polling • Steadfast Hub Status Synced',
    aiResponse:
      'আপনার পার্সেল #ST-99411 আজ সকাল ১০:১৫ মিনিটে ধানমন্ডি হাব থেকে রাইডারের কাছে হ্যান্ডওভার হয়েছে। আজ বিকাল ৫টার মধ্যে পৌঁছাবে ইনশাআল্লাহ।',
    speed: '0.7s',
    actionTaken: 'Instant Live Tracking Shared',
    actionIcon: <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
  }
];

export const MultiChannelEngineVisualization: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance scenario every 4.5 seconds unless user pauses/hovers
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SCENARIOS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const activeScenario = SCENARIOS[activeIndex];

  return (
    <div
      className="mt-8 mb-12 sm:mt-12 sm:mb-16"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Visual Headline */}
      <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#7F22FE]/10 dark:bg-purple-500/15 border border-[#7F22FE]/25 text-[#7F22FE] dark:text-purple-300 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] mb-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>MULTI-CHANNEL NEURAL ENGINE</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
          How All 4 Channels Connect to{' '}
          <span className="bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#C026D3] bg-clip-text text-transparent">
            One AI Core
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
          Zero human lag. Instant Bangla understanding, real-time photo search, and automated order booking across every conversation.
        </p>
      </div>

      {/* Main Interactive Neural Canvas */}
      <div className="relative rounded-[32px] p-4 sm:p-7 lg:p-9 bg-white dark:bg-[#0D0826] border border-slate-200/90 dark:border-purple-500/30 shadow-[0_20px_60px_-15px_rgba(124,58,237,0.14)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.55)] overflow-hidden transition-colors">
        {/* Background Ambient Glow & Dot Matrix */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(#e2e8f0_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(rgba(147,51,234,0.18)_1.2px,transparent_1.2px)] [background-size:20px_20px] opacity-75"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[520px] h-[300px] bg-gradient-to-r from-[#7C3AED]/12 via-[#9333EA]/12 to-[#C026D3]/12 blur-3xl rounded-full"
        />

        {/* Channels Selector Ribbon */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          {SCENARIOS.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`group px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-[#1E1346] dark:text-white border-purple-500/60 shadow-md shadow-purple-500/20 scale-105'
                    : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-[#7C3AED]/50 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                {/* Channel Icon Dot */}
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    item.channel === 'whatsapp'
                      ? 'bg-[#25D366]'
                      : item.channel === 'messenger'
                      ? 'bg-[#0084FF]'
                      : item.channel === 'instagram'
                      ? 'bg-[#E1306C]'
                      : 'bg-[#7C3AED]'
                  } ${isActive ? 'animate-pulse' : ''}`}
                />
                <span>{item.channelLabel}</span>
                {isActive && (
                  <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full bg-[#7C3AED] text-white text-[9px] font-black uppercase">
                    Live
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Architectural Grid: 3 Columns (Inputs -> Central AI Engine -> Outputs) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          
          {/* Column 1: Incoming Buyer Action (Left 4 Cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl p-4 sm:p-5 bg-slate-50/80 dark:bg-[#150E34] border border-slate-200/90 dark:border-purple-500/25 shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-purple-950/80 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-purple-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>STEP 1 • INCOMING STREAM</span>
                </span>
                <span className="text-[11px] font-bold text-slate-400">Buyer Query</span>
              </div>

              {/* Active Channel Pill */}
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold border mb-3 ${activeScenario.badgeBg} ${activeScenario.badgeColor}`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span>{activeScenario.channelLabel}</span>
              </div>

              {/* Simulated Customer Message Bubble */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#1B1242] border border-slate-200 dark:border-purple-500/20 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-medium leading-relaxed relative">
                <p className="font-semibold text-slate-900 dark:text-white">
                  &ldquo;{activeScenario.userQuery}&rdquo;
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-white/5 pt-2">
                  <span>Input Type: {activeScenario.userType.toUpperCase()}</span>
                  <span className="text-emerald-500 font-bold">Encrypted via Meta</span>
                </div>
              </div>
            </div>

            {/* Ingestion Beam Indicator */}
            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-purple-500/15 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
              <span className="flex items-center gap-1.5 text-[#7C3AED] dark:text-purple-400 font-bold">
                <Zap className="w-3.5 h-3.5 animate-bounce" /> Streaming to AI Core
              </span>
              <ArrowRight className="w-4 h-4 text-[#7C3AED] dark:text-purple-400 lg:hidden" />
            </div>
          </div>

          {/* Column 2: Central AI Hub - One Agent BD Neural Core (Middle 4 Cols) */}
          <div className="lg:col-span-4 rounded-2xl p-5 bg-gradient-to-b from-[#7C3AED]/10 via-[#9333EA]/10 to-[#C026D3]/10 dark:from-[#20134F] dark:to-[#170C3B] border-2 border-[#7C3AED]/40 dark:border-purple-500/40 shadow-[0_10px_35px_rgba(124,58,237,0.25)] flex flex-col items-center justify-between relative overflow-hidden text-center">
            
            {/* Concentric Rotating Hologram Rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="absolute w-48 h-48 border border-dashed border-[#7C3AED]/30 dark:border-purple-400/30 rounded-full pointer-events-none"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute w-36 h-36 border border-dashed border-[#C026D3]/30 dark:border-fuchsia-400/30 rounded-full pointer-events-none"
            />

            <div className="relative z-10 w-full">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#7C3AED] text-white text-[10px] font-black uppercase tracking-wider mb-3 shadow-sm">
                <Cpu className="w-3 h-3" />
                <span>ONE AGENT BD • AI CORE</span>
              </div>

              {/* Glowing Neural Nexus Icon */}
              <div className="relative my-2 flex items-center justify-center">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-[#7C3AED] via-[#9333EA] to-[#C026D3] p-0.5 shadow-[0_0_30px_rgba(124,58,237,0.6)]">
                  <div className="w-full h-full rounded-[14px] bg-slate-950 flex flex-col items-center justify-center text-white">
                    <Bot className="w-7 h-7 sm:w-8 sm:h-8 text-purple-300 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Engine Status Specs */}
              <div className="mt-2 space-y-1">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Autonomous Decision Matrix
                </h3>
                <p className="text-[11px] text-[#7C3AED] dark:text-purple-300 font-extrabold flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {activeScenario.speed} Execution Latency
                </p>
              </div>
            </div>

            {/* Neural Context Processing Box */}
            <div className="relative z-10 w-full mt-3 p-3 rounded-xl bg-white/90 dark:bg-black/40 border border-slate-200/90 dark:border-purple-400/25 text-left text-[11px] space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                <span>Active Context</span>
                <span className="text-emerald-500 font-black">99.8% Match</span>
              </div>
              <p className="text-slate-700 dark:text-slate-200 font-semibold line-clamp-2">
                {activeScenario.aiProcessStep}
              </p>
            </div>
          </div>

          {/* Column 3: Instant Execution & Resolution (Right 4 Cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl p-4 sm:p-5 bg-slate-50/80 dark:bg-[#150E34] border border-slate-200/90 dark:border-purple-500/25 shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>STEP 3 • ACTION RESOLVED</span>
                </span>
                <span className="text-[11px] font-extrabold text-purple-600 dark:text-purple-400">
                  {activeScenario.speed}
                </span>
              </div>

              {/* Action Category Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#1E1346] border border-slate-200 dark:border-purple-500/20 text-xs font-bold text-slate-800 dark:text-slate-200 mb-3">
                {activeScenario.actionIcon}
                <span>{activeScenario.actionTaken}</span>
              </div>

              {/* AI Sent Response */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#1B1242] border border-slate-200 dark:border-purple-500/20 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-medium leading-relaxed">
                <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-extrabold text-[#7C3AED] dark:text-purple-300 uppercase">
                  <Bot className="w-3 h-3" />
                  <span>One Agent Reply</span>
                </div>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                  {activeScenario.aiResponse}
                </p>
              </div>
            </div>

            {/* Zero Human Delay Metric Footer */}
            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-purple-500/15 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                ✓ 0 TK Moderator Cost
              </span>
              <span className="text-slate-400">Automated Pipeline</span>
            </div>
          </div>
        </div>

        {/* Bottom Real-time Telemetry Bar */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-200/80 dark:border-purple-500/20 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
            <p className="text-base sm:text-xl font-black text-slate-900 dark:text-white">0.8s - 1.2s</p>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold">Average Response Time</p>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
            <p className="text-base sm:text-xl font-black text-[#7C3AED] dark:text-purple-400">100% Meta Official</p>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold">Cloud API • 0% Ban Risk</p>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
            <p className="text-base sm:text-xl font-black text-emerald-600 dark:text-emerald-400">0 TK / Msg</p>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold">Unlimited Free Replies</p>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
            <p className="text-base sm:text-xl font-black text-rose-500">Save 10,000+ TK</p>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold">Every Month on Salary</p>
          </div>
        </div>
      </div>
    </div>
  );
};
