import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Can the AI understand Bangla, Banglish, Voice Messages, and Product Screenshots?',
      a: 'Yes! Whether your customers message in Bangla, Banglish, English, send voice notes, or share a product screenshot, our AI understands it instantly, matches the exact product from your catalog, and replies naturally within seconds.'
    },
    {
      q: 'How does the AI confirm orders and check for fraud customers?',
      a: 'While chatting with a buyer, the AI collects their Name, 11-Digit Mobile Number, and Full Delivery Address, saves the order into your Orders Hub, and automatically runs a courier delivery ratio check to alert you about high-risk COD buyers.'
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
      a: 'Starter Plan includes 24/7 AI Auto-Reply, Voice & Photo Recognition, Product Catalog, and Chat Order Capture for up to 3 channels. Pro Plan unlocks Accounts & Stock ERP, 1-Click Steadfast/Pathao/RedX Courier Dispatch, AI Auto Fraud Check, Appointments, Broadcasts, and up to 10 channels.'
    },
    {
      q: 'How does the 2-Day Free Trial and payment activation work?',
      a: 'You get a 2-day free trial right after signing up. Anytime you are ready, you can pay via bKash, Nagad, Rocket, or Upay through our automated gateway for instant activation.'
    }
  ];

  return (
    <section
      id="faq"
      className="py-14 sm:py-16 bg-white dark:bg-[#0B0720] border-t border-slate-100 dark:border-purple-500/15 transition-colors"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#7F22FE] dark:text-purple-400 block mb-1.5">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-white dark:bg-[#140D2E]/90 border border-slate-200/80 dark:border-purple-500/20 overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 cursor-pointer"
                >
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-[#7F22FE] dark:text-purple-400' : ''
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-200 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 pb-3.5 pt-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-purple-500/15">
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
