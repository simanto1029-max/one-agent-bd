import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Can the AI understand Bangla, Banglish, Voice Messages, and Product Screenshots?',
      a: 'Yes! Whether your customers message in Bangla, Banglish, English, send voice notes, or share a product screenshot, our AI understands it instantly, matches the exact product from your catalog, and replies naturally within seconds.'
    },
    {
      q: 'How does the AI confirm orders, check for fraud customers, and track delivery?',
      a: 'While chatting with a buyer, the AI collects their Name, 11-Digit Mobile Number, and Full Delivery Address, saves the order into your Orders Hub, automatically runs a courier delivery ratio & fraud check, and sends live delivery tracking updates to the customer.'
    },
    {
      q: 'Is my Facebook Page, Instagram, or WhatsApp account 100% safe from bans?',
      a: 'Yes, 100% safe. One Agent BD connects strictly through the Official Meta Graph API and WhatsApp Cloud API with 0% risk of account restriction.'
    },
    {
      q: 'Will the AI reply to Facebook & Instagram comments and message them in Inbox?',
      a: 'Yes! When a customer comments on your posts or reels, the AI immediately replies to their comment publicly and sends the product details and price directly into their Messenger or Instagram DM.'
    },
    {
      q: 'What is the difference between Starter Plan (1,250 TK) and Pro Plan (1,950 TK)?',
      a: 'Starter Plan includes 24/7 AI Auto-Reply, 1-Click Steadfast/Pathao/RedX Courier Dispatch, AI Auto Customer Fraud Check, Auto Delivery Tracking, and VIP Customer Retargeting for up to 3 channels. Pro Plan unlocks Accounts & Stock ERP, AI Appointments, Website/WooCommerce/Shopify Store Sync, Call Request Queue, and up to 10 channels.'
    },
    {
      q: 'How does the 2-Day Free Trial and payment activation work?',
      a: 'You get a 2-day free trial right after signing up. Anytime you are ready, you can pay via bKash, Nagad, Rocket, or Upay through our automated gateway for instant activation.'
    }
  ];

  return (
    <section
      id="faq"
      className="py-14 sm:py-20 bg-white dark:bg-[#0B0720] border-t border-slate-100 dark:border-purple-500/15 transition-colors"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-9 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-violet-50 dark:bg-[#19103C] border border-violet-200/80 dark:border-purple-500/30 mb-2.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#7F22FE] dark:text-purple-400" />
            <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#7F22FE] dark:text-purple-300">
              FAQ
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Everything you need to know about setting up One Agent BD for your business.
          </p>
        </div>

        <div className="space-y-3.5 sm:space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl bg-white dark:bg-[#140D2E]/95 border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-[#7F22FE] dark:border-purple-400/70 shadow-[0_16px_40px_-12px_rgba(127,34,254,0.16)]'
                    : 'border-slate-200/90 dark:border-purple-500/20 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.07)] hover:border-violet-300 dark:hover:border-purple-400/40'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full px-5 py-4 sm:px-7 sm:py-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <span
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-extrabold flex items-center justify-center shrink-0 transition-colors ${
                        isOpen
                          ? 'bg-gradient-to-br from-[#7F22FE] to-[#9333EA] text-white shadow-sm shadow-purple-500/30'
                          : 'bg-violet-50 dark:bg-[#1F1547] text-[#7F22FE] dark:text-purple-300 border border-violet-200/60 dark:border-purple-500/25'
                      }`}
                    >
                      0{idx + 1}
                    </span>
                    <span className="font-bold text-sm sm:text-base lg:text-[17px] text-slate-900 dark:text-white leading-snug">
                      {faq.q}
                    </span>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                      isOpen
                        ? 'bg-violet-100 dark:bg-purple-900/50 text-[#7F22FE] dark:text-purple-300 rotate-180'
                        : 'bg-slate-100 dark:bg-[#1D1442] text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </button>
                <div
                  className={`grid transition-all duration-250 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 pt-3 sm:px-7 sm:pb-6 sm:pt-3.5 sm:pl-[72px] text-xs sm:text-sm lg:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-purple-500/15">
                      {faq.a}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
