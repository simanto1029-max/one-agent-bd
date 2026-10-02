import React from 'react';
import { motion } from 'motion/react';
import {
  Zap,
  MessageCircle,
  Truck,
  BarChart3,
  Headphones,
  Image as ImageIcon,
  ShieldCheck,
  Sparkles,
  Megaphone,
  Check,
  ArrowRight,
  ArrowDown
} from 'lucide-react';

interface FlowNodeItem {
  step: string;
  tag: string;
  icon: React.ElementType;
  iconStyle: string;
  title: string;
  subtitle: string;
  pillText: string;
  pillStyle: string;
  cardStyle?: string;
  connectorLabel?: string;
  connectorColor?: string;
}

export const Features: React.FC = () => {
  const rowOneNodes: FlowNodeItem[] = [
    {
      step: 'NODE 01 • INBOX AI',
      tag: '< 2s',
      icon: Zap,
      iconStyle: 'bg-[#7F22FE]/10 text-[#7F22FE] dark:text-purple-300 border border-[#7F22FE]/20',
      title: '24/7 Smart Reply',
      subtitle: 'Bangla • Banglish • EN',
      pillText: 'WhatsApp, FB & IG Auto-Reply',
      pillStyle:
        'bg-purple-50/90 dark:bg-purple-950/60 border-purple-200/70 dark:border-purple-800/50 text-[#7F22FE] dark:text-purple-300',
      connectorLabel: 'Audio AI',
      connectorColor: 'from-[#7F22FE] to-blue-500'
    },
    {
      step: 'NODE 02 • VOICE AI',
      tag: 'Voice',
      icon: Headphones,
      iconStyle: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      title: 'Bangla Voice AI',
      subtitle: 'Listens & Replies Fast',
      pillText: 'Decodes Buyer Voice Notes',
      pillStyle:
        'bg-blue-50/90 dark:bg-blue-950/50 border-blue-200/70 dark:border-blue-800/50 text-blue-700 dark:text-blue-300',
      connectorLabel: 'Vision AI',
      connectorColor: 'from-blue-500 to-pink-500'
    },
    {
      step: 'NODE 03 • PHOTO AI',
      tag: 'Vision',
      icon: ImageIcon,
      iconStyle: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20',
      title: 'Photo Recognition',
      subtitle: 'Detects Product Image',
      pillText: 'Matches Screenshot & Stock',
      pillStyle:
        'bg-pink-50/90 dark:bg-pink-950/50 border-pink-200/70 dark:border-pink-800/50 text-pink-700 dark:text-pink-300',
      connectorLabel: 'Auto DM',
      connectorColor: 'from-pink-500 to-indigo-500'
    },
    {
      step: 'NODE 04 • COMMENT DM',
      tag: 'Posts',
      icon: MessageCircle,
      iconStyle: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
      title: 'Comment to Inbox',
      subtitle: 'FB Posts & IG Reels',
      pillText: 'Public Reply + Instant DM',
      pillStyle:
        'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-200/70 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300'
    }
  ];

  const rowTwoNodes: FlowNodeItem[] = [
    {
      step: 'NODE 05 • FRAUD SHIELD',
      tag: '100% Safe',
      icon: ShieldCheck,
      iconStyle: 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25',
      title: 'Fake Order Block',
      subtitle: 'Courier Ratio Check',
      pillText: 'Blocks High-Return Buyers',
      pillStyle:
        'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300',
      cardStyle:
        'bg-gradient-to-b from-emerald-50/90 to-white dark:from-emerald-950/35 dark:to-[#170F36] border-2 border-emerald-500/45 shadow-[0_14px_32px_-10px_rgba(16,185,129,0.2)]',
      connectorLabel: '1-Click',
      connectorColor: 'from-emerald-500 to-[#7F22FE]'
    },
    {
      step: 'NODE 06 • COURIER & TRACK',
      tag: 'Live Sync',
      icon: Truck,
      iconStyle:
        'bg-gradient-to-br from-[#7F22FE] to-[#DB2777] text-white shadow-md shadow-purple-500/30',
      title: 'Courier & Tracking',
      subtitle: 'Steadfast • Pathao • RedX',
      pillText: 'AI Tracks & Updates Buyer',
      pillStyle:
        'bg-purple-500/10 border-purple-500/30 text-[#7F22FE] dark:text-purple-200',
      cardStyle:
        'bg-gradient-to-b from-white via-[#FAF7FF] to-[#F3EAFF] dark:from-[#1F124B] dark:via-[#180E3A] dark:to-[#130A2E] border-2 border-[#7F22FE] shadow-[0_16px_36px_-10px_rgba(127,34,254,0.26)]',
      connectorLabel: 'Retarget',
      connectorColor: 'from-[#7F22FE] to-amber-500'
    },
    {
      step: 'NODE 07 • VIP RETARGET',
      tag: '3x Sales',
      icon: Megaphone,
      iconStyle: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25',
      title: 'VIP Offer & Promo',
      subtitle: 'Discounts & New Stock',
      pillText: 'Send Offer & New Arrival DM',
      pillStyle:
        'bg-amber-50/90 dark:bg-amber-950/50 border-amber-200/70 dark:border-amber-800/50 text-amber-700 dark:text-amber-300',
      connectorLabel: 'Full ERP',
      connectorColor: 'from-amber-500 to-teal-500'
    },
    {
      step: 'NODE 08 • ERP & WEB SYNC',
      tag: 'Auto ERP',
      icon: BarChart3,
      iconStyle: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20',
      title: 'Stock, Profit & Web',
      subtitle: 'POS + WooCommerce',
      pillText: 'Live Inventory & Net Profit',
      pillStyle:
        'bg-teal-50/90 dark:bg-teal-950/50 border-teal-200/70 dark:border-teal-800/50 text-teal-700 dark:text-teal-300'
    }
  ];

  const renderFlowRow = (nodes: FlowNodeItem[]) => (
    <div className="relative z-10 flex flex-col lg:flex-row items-stretch justify-between gap-2.5 lg:gap-0">
      {nodes.map((node, index) => {
        const Icon = node.icon;
        return (
          <React.Fragment key={node.step}>
            {/* Compact Premium Flowchart Box */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
              className={`flex-1 rounded-2xl p-3.5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 ${
                node.cardStyle
                  ? node.cardStyle
                  : 'bg-white dark:bg-[#170F36] border border-slate-200/90 dark:border-purple-500/25 shadow-[0_12px_28px_-10px_rgba(15,23,42,0.08)] hover:border-[#7F22FE]/50'
              }`}
            >
              <div>
                {/* Top Micro Header */}
                <div className="flex items-center justify-between gap-1.5 mb-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-purple-950/80 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-purple-300">
                    {node.step}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#7F22FE]/10 dark:bg-purple-500/20 text-[#7F22FE] dark:text-purple-200 text-[8px] font-black uppercase">
                    {node.tag}
                  </span>
                </div>

                {/* Compact Icon + Title + 3-Word Subtitle */}
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl ${node.iconStyle} flex items-center justify-center shrink-0`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-[13px] font-black text-slate-900 dark:text-white leading-tight truncate">
                      {node.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-400 font-semibold truncate">
                      {node.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Single Crisp Bottom Action Pill */}
              <div className="pt-2 border-t border-slate-100 dark:border-purple-500/15">
                <div
                  className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-[10px] font-extrabold ${node.pillStyle}`}
                >
                  <Check className="w-3 h-3 stroke-[3] shrink-0" />
                  <span className="truncate">{node.pillText}</span>
                </div>
              </div>
            </motion.div>

            {/* Flowchart Connector Arrow between boxes */}
            {node.connectorLabel && (
              <div className="shrink-0 lg:w-11 flex flex-col lg:flex-row items-center justify-center py-0.5 lg:py-0">
                <div className="hidden lg:flex items-center w-full justify-center relative">
                  <div
                    className={`h-[2px] w-full bg-gradient-to-r ${
                      node.connectorColor || 'from-[#7F22FE] to-indigo-500'
                    }`}
                  />
                  <span className="absolute -top-4 px-1.5 py-0.2 rounded-full bg-slate-900 dark:bg-purple-900 text-white text-[7px] font-black tracking-wide shadow-xs whitespace-nowrap">
                    {node.connectorLabel}
                  </span>
                  <ArrowRight className="w-3 h-3 text-[#7F22FE] dark:text-purple-400 -ml-1 shrink-0" />
                </div>

                {/* Mobile Vertical Connector */}
                <div className="lg:hidden flex flex-col items-center">
                  <div className="w-[2px] h-2.5 bg-[#7F22FE]/60" />
                  <span className="px-2 py-0.5 rounded-full bg-[#7F22FE] text-white text-[8px] font-black">
                    {node.connectorLabel}
                  </span>
                  <div className="w-[2px] h-2.5 bg-[#7F22FE]/60" />
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <section
      id="features"
      className="py-12 sm:py-16 bg-white dark:bg-[#0B0720] border-t border-slate-100 dark:border-purple-500/15 transition-colors relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Minimalist $100K Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#7F22FE]/10 dark:bg-[#19103C] border border-[#7F22FE]/25 dark:border-purple-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#7F22FE] dark:text-purple-400" />
            <span className="text-[10px] sm:text-[11px] font-extrabold tracking-[0.15em] uppercase text-[#7F22FE] dark:text-purple-300">
              8-ENGINE AUTOMATION FLOWCHART
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Everything Needed to{' '}
            <span className="bg-gradient-to-r from-[#7F22FE] via-[#9333EA] to-[#DB2777] bg-clip-text text-transparent">
              Automate Sales
            </span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            From customer message to courier tracking &amp; VIP retargeting — 100% automated.
          </p>
        </div>

        {/* $100K Connected Flowchart Canvas Box */}
        <div className="relative rounded-[32px] p-4 sm:p-6 lg:p-7 bg-slate-50/85 dark:bg-[#110A2A]/95 border border-slate-200/90 dark:border-purple-500/25 shadow-[0_25px_70px_-20px_rgba(124,58,237,0.16)] overflow-hidden">
          {/* Architectural Dot-Matrix Grid */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(139,92,246,0.22)_1px,transparent_1px)] [background-size:18px_18px] opacity-60"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[180px] bg-gradient-to-r from-violet-600/15 via-fuchsia-500/15 to-emerald-500/15 blur-3xl"
          />

          {/* Stage 1 Pill Header */}
          <div className="relative z-10 flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white dark:bg-[#19103C] border border-slate-200/80 dark:border-purple-500/30 text-[9px] font-black uppercase tracking-wider text-[#7F22FE] dark:text-purple-300 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7F22FE] animate-ping" />
              STAGE 01 • AI INBOX, VOICE &amp; PHOTO ENGINE
            </span>
            <span className="hidden sm:inline-block text-[10px] font-bold text-slate-400 dark:text-purple-300/70">
              Instant Response • 0 TK / Msg
            </span>
          </div>

          {/* FLOWCHART ROW 1 (4 Compact Connected Nodes) */}
          {renderFlowRow(rowOneNodes)}

          {/* Central Pipeline Bridge between Stage 1 & Stage 2 */}
          <div className="relative z-10 my-3.5 sm:my-4 flex items-center justify-center">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-purple-500/25 to-transparent" />
            <div className="mx-3 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#7F22FE] to-[#DB2777] text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-purple-500/25">
              <ArrowDown className="w-3 h-3 stroke-[3]" />
              <span>AI Confirms Order &amp; Triggers Fulfillment</span>
              <ArrowDown className="w-3 h-3 stroke-[3]" />
            </div>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-purple-500/25 to-transparent" />
          </div>

          {/* Stage 2 Pill Header */}
          <div className="relative z-10 flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white dark:bg-[#19103C] border border-slate-200/80 dark:border-purple-500/30 text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              STAGE 02 • FRAUD CHECK, COURIER TRACKING, VIP RETARGET &amp; ERP
            </span>
            <span className="hidden sm:inline-block text-[10px] font-bold text-slate-400 dark:text-purple-300/70">
              100% Automated Dispatch &amp; Growth
            </span>
          </div>

          {/* FLOWCHART ROW 2 (4 Compact Connected Nodes) */}
          {renderFlowRow(rowTwoNodes)}
        </div>
      </div>
    </section>
  );
};

