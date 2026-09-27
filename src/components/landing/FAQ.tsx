import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Can the AI understand Bangla, Banglish, Voice Messages, and Product Screenshots?',
      a: 'Yes! Whether your customers message in Bangla, Banglish (e.g., "bhai eitar dam koto?"), English, send voice notes, or share a screenshot of a product from your Facebook/Instagram post, our AI understands it instantly, matches the exact product from your catalog, and replies naturally within 2 seconds.'
    },
    {
      q: 'How does the AI confirm orders and book Steadfast / Courier parcels?',
      a: 'While chatting with a buyer, the AI collects their Name, Mobile Number, Full Delivery Address, and Product Variant/Quantity, calculates the exact delivery fee (Inside Dhaka or Outside Dhaka), and saves the confirmed order directly into your Orders Hub—ready for 1-click Steadfast COD courier booking.'
    },
    {
      q: 'Is my Facebook Page, Instagram, or WhatsApp account 100% safe from bans?',
      a: 'Yes, 100% safe. One Agent BD connects strictly through the Official Meta Graph API and WhatsApp Cloud API. Because we never use unofficial browser scripts or spam tools, there is 0% risk of your Facebook Page, ad account, or WhatsApp number ever being restricted.'
    },
    {
      q: 'Will the AI reply to Facebook & Instagram comments and message them in Inbox automatically?',
      a: 'Yes! When a customer comments "Price?", "দাম কত?", or "Inbox" on your posts or reels, the AI immediately replies to their comment publicly and sends the product details and price directly into their Messenger or Instagram DM to convert the lead into an order.'
    },
    {
      q: 'Do I need any coding knowledge or a separate AI API key to use this?',
      a: 'No coding or external API key is required! Our platform comes with a built-in, high-speed AI engine ready out of the box. Simply connect your Facebook Page, Instagram, or WhatsApp in 1 click, add your products or store rules, and your AI sales agent goes live in under 2 minutes.'
    },
    {
      q: 'Can I or my team reply manually or take over a live chat anytime?',
      a: 'Of course! You can monitor every WhatsApp, Messenger, and Instagram chat from our Unified Inbox and reply manually whenever you want. Plus, if a customer asks to speak to a human on the phone, the AI logs their number in your Human Call Requests queue automatically.'
    },
    {
      q: 'How does the 2-Day Free Trial work? Do I need to pay anything upfront?',
      a: 'You get full access to all features for 2 days completely free as soon as you sign up—no advance payment required. You can connect your page, test live AI replies, voice & image recognition, and order automation before purchasing a subscription plan.'
    },
    {
      q: 'How do I pay for a plan, and how fast is my subscription activated?',
      a: 'You can pay easily using bKash, Nagad, Rocket, Upay, or Bank Transfer through our official payment gateway in the Billing section. Once you submit your Transaction ID (TrxID), the system verifies your payment and activates your plan instantly.'
    }
  ];

  return (
    <section
      id="faq"
      className="py-12 sm:py-16 bg-white dark:bg-gradient-to-b dark:from-[#0B0720] dark:to-[#09051A] border-t border-neutral-150 dark:border-purple-500/15 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7F22FE] dark:text-purple-400">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight mt-1.5">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-slate-400">
            Clear answers to the top questions every online business owner asks before getting started.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white dark:bg-[#140D2E]/90 border border-neutral-200/80 dark:border-purple-500/20 overflow-hidden shadow-2xs hover:border-[#7F22FE]/40 dark:hover:border-purple-400/45 transition-all duration-200"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-[#7F22FE] dark:text-purple-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs sm:text-sm text-neutral-600 dark:text-slate-300 leading-relaxed border-t border-neutral-100 dark:border-purple-500/15 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
