import React, { useState } from 'react';
import { ChevronDown, HelpCircle, CheckCircle2 } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      tag: 'Voice & Photo AI',
      q: 'Can the AI understand Bangla, Banglish, Voice Notes & Product Photos?',
      a: 'Yes! Customers can message in Bangla, Banglish, or English, send voice notes, or share product screenshots—the AI matches your catalog and replies in under 2 seconds.'
    },
    {
      tag: 'Courier & Fraud',
      q: 'How does AI order booking, fraud ratio check & live tracking work?',
      a: 'The AI collects the buyer’s Name, Phone & Address in chat, checks their courier delivery ratio to block fake orders, dispatches to Steadfast/Pathao/RedX in 1 click, and sends live tracking updates.'
    },
    {
      tag: '0% Ban Risk',
      q: 'Is my Facebook Page, Instagram, or WhatsApp 100% safe from bans?',
      a: '100% safe. One Agent BD uses the Official Meta Graph API and WhatsApp Cloud API with zero ban risk and unlimited free replies (0 TK per message).'
    },
    {
      tag: 'Comment + DM',
      q: 'Does the AI reply to Facebook & Instagram comments and send Inbox DMs?',
      a: 'Yes! Whenever someone comments on your post or reel, the AI replies publicly and immediately sends the product price & order details into their Inbox.'
    },
    {
      tag: 'Plans & VIP',
      q: 'What is included in Starter (1,250 TK) vs Pro Plan (1,950 TK)?',
      a: 'Starter includes 24/7 AI Reply, 1-Click Courier, Fraud Check, Live Tracking & VIP Retargeting (3 channels). Pro unlocks Full Stock & Profit ERP, Website Sync, Appointments & 10 channels.'
    },
    {
      tag: 'Free Setup',
      q: 'Do I get a 2-Day Free Trial and free technical setup?',
      a: 'Yes! Sign up for an instant 2-Day Free Trial with no advance payment. Plus, our team sets up your Facebook Page, WhatsApp & catalog 100% free.'
    }
  ];

  return (
    <section
      id="faq"
      className="py-10 sm:py-14 bg-white dark:bg-[#0B0720] border-t border-slate-100 dark:border-purple-500/15 transition-colors"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-9 sm:mb-11">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#7F22FE]/10 dark:bg-[#19103C] border border-[#7F22FE]/25 dark:border-purple-500/30 mb-2.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#7F22FE] dark:text-purple-400" />
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#7F22FE] dark:text-purple-300">
              QUICK ANSWERS
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-[#7F22FE] via-[#9333EA] to-[#DB2777] bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Everything you need to know in 30 seconds.
          </p>
        </div>

        {/* $100K Architectural FAQ Canvas Box */}
        <div className="relative rounded-[32px] p-3.5 sm:p-6 bg-slate-50/75 dark:bg-[#110A2A]/90 border border-slate-200/90 dark:border-purple-500/25 shadow-[0_25px_70px_-20px_rgba(124,58,237,0.15)] overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(139,92,246,0.2)_1px,transparent_1px)] [background-size:20px_20px] opacity-55"
          />

          <div className="relative z-10 space-y-2.5 sm:space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl bg-white dark:bg-[#160E35]/95 border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'border-2 border-[#7F22FE] shadow-[0_16px_38px_-12px_rgba(127,34,254,0.22)]'
                      : 'border-slate-200/90 dark:border-purple-500/20 shadow-2xs hover:border-[#7F22FE]/45'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full px-4 py-3.5 sm:px-6 sm:py-4 text-left flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-black flex items-center justify-center shrink-0 transition-colors ${
                          isOpen
                            ? 'bg-gradient-to-br from-[#7F22FE] to-[#DB2777] text-white shadow-sm shadow-purple-500/30'
                            : 'bg-violet-50 dark:bg-[#1F1547] text-[#7F22FE] dark:text-purple-300 border border-violet-200/60 dark:border-purple-500/25'
                        }`}
                      >
                        0{idx + 1}
                      </span>
                      <span className="font-extrabold text-xs sm:text-[15px] text-slate-900 dark:text-white leading-snug">
                        {faq.q}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full bg-violet-50 dark:bg-purple-950/70 border border-violet-200/70 dark:border-purple-500/25 text-[#7F22FE] dark:text-purple-300 text-[10px] font-extrabold">
                        {faq.tag}
                      </span>
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                          isOpen
                            ? 'bg-[#7F22FE] text-white rotate-180'
                            : 'bg-slate-100 dark:bg-[#1D1442] text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </button>

                  <div
                    className={`grid transition-all duration-250 ease-in-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 pb-4 pt-2.5 sm:px-6 sm:pb-5 sm:pl-[64px] text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-purple-500/15 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5 hidden sm:block" />
                        <span>{faq.a}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
