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
            onClick={() => setActiveTab('privacy')}
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
            onClick={() => setActiveTab('terms')}
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
                  Effective Date: September 2026
                </span>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white mt-1">
                  Privacy Policy for One Agent BD
                </h3>
                <p className="mt-2">
                  At <strong>One Agent BD</strong> (accessible from oneagentbd.online), we respect your privacy and are committed to protecting the personal data of our merchants and their end customers. This Privacy Policy explains how our autonomous AI assistant platform collects, processes, and protects your information.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-violet-500" />
                  1. Information We Collect
                </h4>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li><strong>Merchant Account Details:</strong> Full name, email address, password hashes, and selected subscription tier.</li>
                  <li><strong>Meta Platform Credentials:</strong> Official WhatsApp Cloud API Phone Number IDs, Facebook Page Access Tokens, and Webhook verification tokens.</li>
                  <li><strong>E-Commerce & Store Data:</strong> Shopify store URLs, WooCommerce REST API keys, and custom website webhook secrets for order synchronization.</li>
                  <li><strong>Customer Inquiries & Orders:</strong> Customer phone numbers, names, delivery addresses, and conversation messages processed strictly to provide automated replies and order fulfillment.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-white">
                  2. Meta Cloud API & Platform Policy Compliance
                </h4>
                <p>
                  One Agent BD integrates strictly with official Meta Graph APIs for WhatsApp Business and Facebook Messenger. We adhere 100% to Meta's Commercial Terms and Data Processing Addendum. We never employ unauthorized web scrapers or unofficial WhatsApp automation tools, ensuring 0% account ban risk.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-white">
                  3. Autonomous Order Extraction & Customer Privacy
                </h4>
                <p>
                  When your end customers message your WhatsApp number or Facebook Page, our AI engine extracts delivery details (name, phone, address, items) to populate your Orders Hub. This data is exclusively owned by you (the merchant). We never sell, rent, or monetize merchant customer records or leads to any third parties or advertisers.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-white">
                  4. Third-Party Integrations & Couriers
                </h4>
                <p>
                  When you dispatch an order using our 1-click courier feature (e.g., Steadfast, Pathao, RedX, Paperfly) or sync with Shopify/WooCommerce, only the minimum necessary parcel delivery details are forwarded to facilitate fulfillment.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900/60 text-violet-900 dark:text-violet-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  5. Contact Us & Data Inquiries
                </div>
                <p className="text-[11px]">
                  For any privacy inquiries, data deletion requests, or compliance questions, please contact our Data Protection Officer at:
                </p>
                <div className="font-mono font-bold text-xs mt-1 text-violet-700 dark:text-violet-300">
                  Email: support.oneagentbd@gmail.com | WhatsApp: 01601705804
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                  Effective Date: September 2026
                </span>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white mt-1">
                  Terms & Conditions of Service
                </h3>
                <p className="mt-2">
                  Welcome to <strong>One Agent BD</strong>. By signing up, accessing, or using our autonomous AI auto-reply and order confirmation software, you agree to be bound by these Terms & Conditions.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  1. Service Provision & 2-Day Free Trial
                </h4>
                <p>
                  All new merchants receive a 2-Day Free Trial upon registration with no credit card required. During the trial, you have full access to our WhatsApp & Facebook Messenger automation and AI orders hub. After the trial period expires, your account requires an active Standard or Pro Business subscription.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-white">
                  2. Subscription Plans & Payments (bKash & Nagad)
                </h4>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li><strong>All-in-One Plan:</strong> 1,450 BDT / 30 days for WhatsApp Cloud API, Facebook Messenger, Instagram, Website Chatbot, Voice AI, Order Hub, and Courier Booking with unlimited AI auto-replies.</li>
                  <li><strong>All-in-One Annual Plan:</strong> 14,500 BDT / 365 days (2 months free discount included) with priority high-speed inference and dedicated support.</li>
                  <li><strong>Payment Verification:</strong> Merchants transfer payment via bKash or Nagad Send Money to our official verified number and submit their 10-digit Transaction ID (TrxID) in the Billing tab for verification.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-white">
                  3. Website & E-Commerce Integrations
                </h4>
                <p>
                  Connecting Shopify, WordPress / WooCommerce, or custom websites is an exclusive Pro Business Plan feature. Merchants must provide valid credentials or webhook endpoints. One Agent BD is not responsible for store downtime or external third-party API changes.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-white">
                  4. Acceptable Use & Anti-Spam Guidelines
                </h4>
                <p>
                  You agree not to use One Agent BD to send unsolicited bulk marketing spam, fraudulent schemes, or content violating Meta Platform Policies. Any merchant account found engaging in illegal activities will be suspended immediately without refund.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900/60 text-violet-900 dark:text-violet-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  5. Customer Support & Disputes
                </div>
                <p className="text-[11px]">
                  Our support team operates daily from 9:00 AM to 11:00 PM (BST). For any billing assistance or dispute resolution, contact us at:
                </p>
                <div className="font-mono font-bold text-xs mt-1 text-violet-700 dark:text-violet-300">
                  Email: support.oneagentbd@gmail.com | WhatsApp: 01601705804
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
