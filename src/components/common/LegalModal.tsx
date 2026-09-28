import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Mail, Lock, CheckCircle2, Globe, Scale } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'privacy' | 'terms';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'privacy'
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(defaultTab);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab, isOpen]);

  const handleSwitchTab = (tab: 'privacy' | 'terms') => {
    setActiveTab(tab);
    try {
      window.history.replaceState({}, '', tab === 'terms' ? '/terms' : '/privacy');
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[85vh] rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-neutral-900 dark:text-white">
                One Agent BD Legal & Compliance
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Official Privacy Policy and Terms of Service • Contact: support.oneagentbd@gmail.com
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <button
            onClick={() => handleSwitchTab('privacy')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'privacy'
                ? 'border-violet-600 text-violet-600 dark:text-violet-400 bg-white dark:bg-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Privacy Policy
          </button>
          <button
            onClick={() => handleSwitchTab('terms')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'terms'
                ? 'border-violet-600 text-violet-600 dark:text-violet-400 bg-white dark:bg-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Terms & Conditions
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
          {activeTab === 'privacy' ? (
            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                  Effective Date: September 2026 • Meta Platform Compliant
                </span>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white mt-1">
                  Privacy Policy for One Agent BD
                </h3>
                <p className="mt-2">
                  At <strong>One Agent BD</strong> (accessible at <strong>https://www.oneagentbd.online</strong>), we respect your privacy and are committed to protecting the personal and business data of our registered merchants and their end customers. This Privacy Policy explains how our multi-tenant SaaS AI automation platform collects, processes, stores, and protects information across WhatsApp Business, Facebook Messenger, Instagram, and Website channels.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-violet-500" />
                  1. Information We Collect
                </h4>
                <ul className="list-disc list-inside space-y-1.5 pl-1">
                  <li><strong>Merchant Account Information:</strong> Full name, business name, email address, encrypted password credentials, subscription plan status, and mobile wallet payment verification records (bKash, Nagad, Rocket, Upay Transaction IDs).</li>
                  <li><strong>Meta Platform Data (via Official OAuth & Graph API):</strong> When a merchant connects their business assets, we receive Facebook Page IDs, Page Access Tokens, Instagram Professional Account IDs, WhatsApp Business Account (WABA) IDs, Phone Number IDs, and webhook subscription metadata.</li>
                  <li><strong>Omnichannel Customer Conversations & Media:</strong> Incoming text messages, voice notes/audio clips (for Voice AI transcription), product images/screenshots (for Visual Product Search), and public post comments (for Comment-to-Inbox automation) sent by end customers to connected merchant channels.</li>
                  <li><strong>E-Commerce, Catalog & Order Fulfillment Data:</strong> Merchant product catalogs, Shopify/WooCommerce store URLs and API keys, website live chat widget interactions, and customer order details (name, phone number, delivery address, ordered items, and COD/payment status).</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-white">
                  2. How We Use Meta Platform Data & Limited Use Compliance
                </h4>
                <p>
                  One Agent BD integrates strictly with official Meta Graph APIs (Facebook Messenger, Instagram Graph API, and WhatsApp Cloud API) in full compliance with the <strong>Meta Platform Terms</strong> and <strong>Developer Policies</strong>:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li><strong>Sole Purpose:</strong> Meta Platform Data is processed strictly to deliver automated AI customer support, voice note transcription, visual product matching, comment auto-replies, smart follow-ups within Meta's 24-hour messaging window, and order logging for the specific merchant who authorized the channel.</li>
                  <li><strong>No Sale or Unauthorized Sharing:</strong> We <strong>never</strong> sell, rent, license, or transfer Meta Platform Data or end-customer contact records to third-party advertisers, data brokers, or other merchants.</li>
                  <li><strong>Strict Multi-Tenant Isolation:</strong> Each merchant's channels, inbox conversations, contacts, and orders are logically isolated and accessible only to that authenticated merchant.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-white">
                  3. AI Processing (Text, Voice Note AI & Visual Photo Search)
                </h4>
                <p>
                  To generate instant replies in Bengali, English, or Banglish, customer inquiry context, voice notes, and product images are securely transmitted via encrypted HTTPS to our AI inference engine along with the merchant's custom System Prompt and Product Catalog. Customer data is never used to train public third-party foundation models.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-white">
                  4. Third-Party E-Commerce & Courier Integrations
                </h4>
                <p>
                  When a merchant uses our 1-Click Courier Dispatch feature (Steadfast, Pathao, RedX, Paperfly) or syncs orders with WooCommerce, Shopify, or custom websites, only the required delivery details (recipient name, phone number, delivery address, and collectable COD amount) are transmitted to the selected courier or store API upon the merchant's explicit configuration.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-white">
                  5. Data Security & Retention
                </h4>
                <p>
                  All API communications, access tokens, and webhook payloads are transmitted over SSL/TLS (HTTPS) and verified using cryptographic signatures (<code>X-Hub-Signature-256</code>). Data is retained only for as long as the merchant maintains an active account or as required to provide the service.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  6. User Data Deletion Instructions (Meta Platform Compliance)
                </h4>
                <p>
                  Users and merchants have full control over their data and can revoke access or permanently delete all stored Meta Platform Data at any time through any of the following methods:
                </p>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li><strong>Instant Dashboard Deletion:</strong> Log in to your One Agent BD Dashboard $\rightarrow$ go to the <strong>Channels</strong> tab $\rightarrow$ click <strong>Delete / Disconnect</strong> next to your Facebook Page, Instagram, or WhatsApp channel to immediately remove tokens and stop webhook processing.</li>
                  <li><strong>Via Facebook / Meta Settings:</strong> Go to your Facebook Account <strong>Settings & Privacy $\rightarrow$ Settings $\rightarrow$ Security and Login $\rightarrow$ Business Integrations</strong> (or <em>Apps and Websites</em>), select <strong>One Agent BD</strong>, and click <strong>Remove</strong>.</li>
                  <li><strong>Direct Data Deletion Request:</strong> Send an email to <strong>support.oneagentbd@gmail.com</strong> or message our official WhatsApp at <strong>+8801601705804</strong> with the subject <em>"Data Deletion Request"</em> and your registered email or Page/WABA ID. We permanently purge all associated profiles, tokens, messages, and order logs within <strong>24 to 48 hours</strong> and send confirmation.</li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900/60 text-violet-900 dark:text-violet-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  7. Contact Us & Data Protection Officer
                </div>
                <p className="text-[11px]">
                  For any privacy inquiries, GDPR/Meta compliance questions, or data deletion requests, please contact us at:
                </p>
                <div className="font-mono font-bold text-xs mt-1 text-violet-700 dark:text-violet-300">
                  Email: support.oneagentbd@gmail.com | WhatsApp: +8801601705804 | Website: https://www.oneagentbd.online
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                  Effective Date: September 2026 • Official SaaS Agreement
                </span>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white mt-1">
                  Terms & Conditions of Service
                </h3>
                <p className="mt-2">
                  Welcome to <strong>One Agent BD</strong> (<strong>https://www.oneagentbd.online</strong>). By creating an account, connecting your social channels, or using our autonomous AI sales, inbox, and order management platform, you agree to comply with and be bound by these Terms & Conditions.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  1. Scope of Service & 2-Day Free Trial
                </h4>
                <p>
                  One Agent BD provides an AI-powered omnichannel customer support and e-commerce order automation platform for WhatsApp Cloud API, Facebook Messenger, Instagram Business, and Website Live Chat. Every new merchant is eligible for a <strong>2-Day (48-Hour) Free Trial</strong> with no credit card required. Once the trial period or active subscription expires, automated AI replies and dashboard tools pause until a plan is renewed.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-white">
                  2. Subscription Plans & Billing (bKash, Nagad, Rocket & Upay)
                </h4>
                <ul className="list-disc list-inside space-y-1.5 pl-1">
                  <li><strong>Starter AI Plan (1,250 BDT / 30 Days):</strong> Includes 1 Autonomous AI Sales Agent (24/7 active), WhatsApp, Messenger & Instagram Auto-Reply, Website AI Chatbot Widget, WooCommerce & Shopify Store Sync, Product Catalog & Photo Search (up to 50 items), Autonomous Order Booking, Steadfast & Pathao 1-Click Courier Dispatch, Unified Live Inbox, Human Call Requests, and Unlimited Customer Conversations (0 TK per-message fee).</li>
                  <li><strong>Pro Business Plan (1,950 BDT / 30 Days):</strong> Includes 3 Autonomous AI Sales & Support Agents, everything in the Starter Plan, Unlimited Website/Shopify/WooCommerce Stores, Voice Note AI (Audio Message Transcription & Reply), Unlimited Product Catalog & Visual Photo Search, up to 10 Connected Channels, VIP Customer Broadcast & Tagging, CSV Order Export, and 24/7 Priority Support.</li>
                  <li><strong>Payment & Verification:</strong> Subscription payments are made via bKash, Nagad, Rocket, or Upay to our official merchant numbers displayed in the Billing section. Merchants submit their Sender Number and Transaction ID (TrxID) for instant/admin verification. Submitting fake or altered TrxIDs will result in immediate account suspension.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-white">
                  3. Meta Platform Policy & 24-Hour Messaging Window Compliance
                </h4>
                <p>
                  Merchants connecting Facebook Pages, Instagram Professional Accounts, or WhatsApp Business numbers must hold valid administrative rights to those assets. You agree to strictly follow <strong>Meta's Commercial Terms</strong>, <strong>WhatsApp Business Messaging Policy</strong>, and <strong>Messenger/Instagram Platform Policies</strong>, including respecting the standard 24-hour customer service messaging window.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-white">
                  4. AI Accuracy, E-Commerce Stores & Courier Dispatch
                </h4>
                <p>
                  AI responses and automated order extractions are generated based on the System Prompt, Business Knowledge Base, and Product Catalog configured by the merchant. Merchants are responsible for keeping product prices, stock statuses, and courier API credentials (Steadfast, Pathao, RedX, Paperfly, Shopify, WooCommerce) accurate. One Agent BD is not liable for third-party courier delays or external API outages.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-white">
                  5. Acceptable Use & Anti-Spam Policy
                </h4>
                <p>
                  You may not use One Agent BD to send illegal, abusive, deceptive, or unsolicited bulk spam messages, or to sell prohibited goods. Accounts violating Bangladeshi law or Meta Platform Policies will be terminated immediately without refund.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-white">
                  6. Refund & Cancellation Policy
                </h4>
                <p>
                  Because we provide a 2-Day Free Trial to test all features prior to purchase, subscription fees for activated 30-day cycles are generally non-refundable once approved, except in cases of verified duplicate billing reported within 24 hours. Merchants may cancel or choose not to renew their subscription at any time without penalty.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900/60 text-violet-900 dark:text-violet-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  7. Customer Support & Contact Information
                </div>
                <p className="text-[11px]">
                  Our support team operates daily from 9:00 AM to 11:00 PM (BST). For technical support, billing help, or legal inquiries, contact us at:
                </p>
                <div className="font-mono font-bold text-xs mt-1 text-violet-700 dark:text-violet-300">
                  Email: support.oneagentbd@gmail.com | WhatsApp: +8801601705804 | Website: https://www.oneagentbd.online
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <Globe className="w-3.5 h-3.5" />
            <span>One Agent BD • Official Policy</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
