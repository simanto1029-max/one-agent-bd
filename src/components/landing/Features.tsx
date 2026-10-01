import React, { useState } from 'react';
import {
  Zap,
  MessageCircle,
  ShoppingBag,
  Truck,
  Globe,
  BarChart3,
  Headphones,
  Image as ImageIcon,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Sparkles,
  Volume2
} from 'lucide-react';

interface FeatureCardItem {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  title: string;
  description: string;
}

type PreviewTabId = 'inbox' | 'fraud' | 'courier' | 'erp';

export const Features: React.FC = () => {
  const [activePreviewTab, setActivePreviewTab] = useState<PreviewTabId>('inbox');

  const previewTabs: { id: PreviewTabId; label: string; icon: React.ElementType; badge: string }[] = [
    { id: 'inbox', label: 'Live Unified Inbox', icon: MessageCircle, badge: 'Voice + Photo AI' },
    { id: 'fraud', label: 'AI Auto Fraud Check', icon: ShieldCheck, badge: 'Courier Ratio' },
    { id: 'courier', label: '1-Click Courier & Tracking', icon: Truck, badge: 'Steadfast • Pathao • RedX' },
    { id: 'erp', label: 'Accounts & Profit ERP', icon: BarChart3, badge: 'Stock & Cashbook' }
  ];

  const agentIntelligence: FeatureCardItem[] = [
    {
      id: 'omnichannel-auto-reply',
      icon: Zap,
      iconColor: 'text-[#7F22FE]',
      title: '24/7 Human-Like Auto-Reply',
      description: 'Instant, natural replies in Bangla, Banglish, and English across WhatsApp, Facebook Messenger, Instagram & Website.'
    },
    {
      id: 'voice-intelligence',
      icon: Headphones,
      iconColor: 'text-blue-600 dark:text-blue-400',
      title: 'Voice Note Understanding & Replies',
      description: 'Listens to customer voice messages in Bengali and English and responds automatically with accurate text or voice.'
    },
    {
      id: 'image-recognition',
      icon: ImageIcon,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      title: 'Product Photo Recognition & Catalog',
      description: 'Analyzes product screenshots sent by buyers in chat and instantly quotes the exact price, stock, and details.'
    },
    {
      id: 'comment-to-dm',
      icon: MessageCircle,
      iconColor: 'text-purple-600 dark:text-purple-400',
      title: 'Auto Comment Reply + Inbox DM',
      description: 'Replies to Facebook & Instagram post comments publicly and sends product details straight to the buyer’s inbox.'
    },
    {
      id: 'autonomous-order-booking',
      icon: ShoppingBag,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      title: 'Autonomous Chat Order Capture',
      description: 'Collects customer name, 11-digit mobile number, and full delivery address in chat to confirm orders automatically.'
    },
    {
      id: 'auto-fraud-check',
      icon: ShieldCheck,
      iconColor: 'text-rose-600 dark:text-rose-400',
      title: 'AI Auto Customer Fraud Check',
      description: 'Automatically verifies customer courier delivery and return history upon order confirmation to prevent fake COD orders.'
    },
    {
      id: 'one-click-courier',
      icon: Truck,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      title: '1-Click Courier & Auto Delivery Tracking',
      description: 'Dispatch orders to Steadfast, Pathao & RedX in 1 click, while AI tracks live parcel status and updates customers automatically.'
    },
    {
      id: 'business-erp',
      icon: BarChart3,
      iconColor: 'text-amber-600 dark:text-amber-400',
      title: 'Accounts, Stock & Profit ERP',
      description: 'Manage daily sales, purchases, live inventory stock, customer dues (baki), cashbook, and net profit in one place.'
    },
    {
      id: 'website-store-sync',
      icon: Globe,
      iconColor: 'text-teal-600 dark:text-teal-400',
      title: 'Website Store Sync & Chat Widget',
      description: 'Sync WooCommerce, Shopify, or custom websites and embed our 1-line AI live chat widget on your store.'
    }
  ];

  return (
    <section
      id="features"
      className="py-14 sm:py-20 bg-white dark:bg-[#0B0720] border-t border-slate-100 dark:border-purple-500/15 transition-colors"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-9 sm:mb-11">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-violet-50 dark:bg-[#19103C] border border-violet-200/80 dark:border-purple-500/30 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#7F22FE] dark:text-purple-400" />
            <span className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-[#7F22FE] dark:text-purple-300">
              AGENT INTELLIGENCE
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Everything Your Business Needs to Automate Sales
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Built specifically for e-commerce and F-commerce brands to handle chats, orders, fraud checks, and accounting automatically.
          </p>
        </div>

        {/* 3. INTERACTIVE DASHBOARD PREVIEW TABS */}
        <div className="mb-12 sm:mb-14">
          {/* Tab Switcher Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-5">
            {previewTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activePreviewTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePreviewTab(tab.id)}
                  className={`px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer border ${
                    isActive
                      ? 'bg-gradient-to-r from-[#7F22FE] via-[#9333EA] to-[#C026D3] text-white border-transparent shadow-[0_10px_25px_-6px_rgba(127,34,254,0.42)]'
                      : 'bg-slate-50 dark:bg-[#150E32] text-slate-700 dark:text-slate-300 border-slate-200/85 dark:border-purple-500/20 hover:border-[#7F22FE]/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span>{tab.label}</span>
                  <span
                    className={`hidden md:inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-violet-100 dark:bg-purple-950/80 text-[#7F22FE] dark:text-purple-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Interactive Preview Window */}
          <div className="relative rounded-[26px] p-4 sm:p-6 lg:p-7 bg-gradient-to-b from-[#FAF8FF] via-white to-[#F5F0FF] dark:from-[#160E36] dark:via-[#120B2B] dark:to-[#0E0822] border border-violet-200/90 dark:border-purple-500/25 shadow-[0_22px_55px_-14px_rgba(127,34,254,0.16),0_8px_24px_-8px_rgba(15,23,42,0.06)]">
            {activePreviewTab === 'inbox' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-center">
                <div className="lg:col-span-5 space-y-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-500/25">
                    ● WhatsApp • Messenger • Instagram
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                    Understands Bangla Voice Notes &amp; Product Screenshots Instantly
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300/85 leading-relaxed">
                    When a buyer sends a voice message or product photo, the AI checks your live catalog stock, quotes the exact price, and captures their Name, Phone &amp; Address automatically.
                  </p>
                </div>

                <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#19103C] border border-violet-100 dark:border-purple-500/20 p-4 sm:p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-purple-500/15">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7F22FE] to-[#DB2777] text-white text-xs font-extrabold flex items-center justify-center">
                        RA
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                          Rafiul Alam • Facebook Messenger
                        </p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          ● AI Agent Active (Replies in 1.4s)
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-violet-100 dark:bg-purple-950 text-[#7F22FE] dark:text-purple-300 text-[10px] font-extrabold">
                      Order Captured
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-xs bg-slate-100 dark:bg-[#231750] p-3 text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-[#7F22FE] dark:text-purple-300 mb-1">
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Voice Note (0:07) — Transcribed by AI:</span>
                      </div>
                      <p className="text-[11px]">
                        "ভাইয়া এই ব্ল্যাক পাঞ্জাবিটার L সাইজ হবে? মিরপুর ১০-এ পাঠাতে পারবেন?"
                      </p>
                    </div>

                    <div className="max-w-[88%] ml-auto rounded-2xl rounded-tr-xs bg-gradient-to-r from-[#7F22FE] to-[#9333EA] p-3 text-white shadow-sm">
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-purple-200 mb-1">
                        <Bot className="w-3 h-3" />
                        <span>One Agent BD • Auto-Replied</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        জি ভাইয়া! প্রিমিয়াম ব্ল্যাক পাঞ্জাবিটির L সাইজ স্টকে আছে। দাম ১,৪৫০ টাকা এবং ঢাকার ভেতর ডেলিভারি চার্জ ৬০ টাকা। অর্ডার কনফার্ম করতে আপনার নাম, পূর্ণ ঠিকানা ও মোবাইল নাম্বারটি দিন।
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'fraud' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-center">
                <div className="lg:col-span-5 space-y-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 text-[10px] font-extrabold border border-rose-500/25">
                    ● Zero Manual Checking Required
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                    Automatic Customer Courier Fraud &amp; Delivery Ratio Check
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300/85 leading-relaxed">
                    As soon as an order is confirmed, AI checks the customer’s mobile number across Steadfast, Pathao &amp; RedX history and flags high-risk return buyers automatically.
                  </p>
                </div>

                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="rounded-2xl bg-white dark:bg-[#19103C] border border-emerald-500/35 p-4 shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>95.6% Delivery Ratio</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">01712-XXXXXX</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                      Verified Safe COD Customer
                    </h4>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                      <p>• Steadfast: 14 Delivered / 0 Returned</p>
                      <p>• Pathao: 8 Delivered / 1 Returned</p>
                    </div>
                    <div className="pt-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                      ✓ Safe for Cash on Delivery Dispatch
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white dark:bg-[#19103C] border border-rose-500/40 p-4 shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 text-[10px] font-extrabold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>22.0% High Risk Alert</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">01988-XXXXXX</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                      Frequent Parcel Returner Detected
                    </h4>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                      <p>• Steadfast: 2 Delivered / 7 Returned</p>
                      <p>• RedX: 0 Delivered / 2 Returned</p>
                    </div>
                    <div className="pt-1 text-[10px] font-extrabold text-rose-600 dark:text-rose-400">
                      ⚠ AI Recommendation: Take Delivery Charge in Advance
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'courier' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-center">
                <div className="lg:col-span-5 space-y-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold border border-indigo-500/25">
                    ● Steadfast • Pathao • RedX
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                    1-Click Courier Dispatch &amp; Auto Live Customer Delivery Tracking
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300/85 leading-relaxed">
                    Send orders to Steadfast, Pathao, or RedX in one click. Whenever the courier updates parcel status, AI automatically notifies the buyer in chat.
                  </p>
                </div>

                <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#19103C] border border-violet-100 dark:border-purple-500/20 p-4 sm:p-5 space-y-3 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-purple-500/15">
                    <div>
                      <span className="text-[10px] font-extrabold text-[#7F22FE] dark:text-purple-300 uppercase">
                        Consignment ID: #SF-894210
                      </span>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        Steadfast Courier • COD TK 1,510
                      </h4>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold">
                      ● Out for Delivery (Auto-Notified Customer)
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-violet-50/70 dark:bg-[#22164D] border border-violet-200/70 dark:border-purple-500/20 text-xs text-slate-700 dark:text-slate-200">
                    <span className="font-extrabold text-[#7F22FE] dark:text-purple-300 block mb-1">
                      Auto-Sent to Customer Inbox:
                    </span>
                    "প্রিয় গ্রাহক, আপনার অর্ডারটি (#SF-894210) Steadfast কুরিয়ারের ডেলিভারি ম্যান নিয়ে বের হয়েছেন। আজকের মধ্যেই ডেলিভারি পাবেন ইনশাআল্লাহ!"
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'erp' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-center">
                <div className="lg:col-span-5 space-y-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold border border-amber-500/25">
                    ● Complete Business ERP
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                    Daily Sales, Purchases, Stock Ledger, Customer Due &amp; Net Profit
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300/85 leading-relaxed">
                    Every confirmed order automatically updates your stock quantity, calculates product cost vs selling price, tracks customer dues (baki), and shows real-time net profit.
                  </p>
                </div>

                <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#19103C] border border-violet-100 dark:border-purple-500/20 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Today's Sales</span>
                    <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                      TK 48,500
                    </p>
                    <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                      +34 Confirmed Orders
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#19103C] border border-violet-100 dark:border-purple-500/20 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Net Profit</span>
                    <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                      TK 16,420
                    </p>
                    <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400">
                      After Courier &amp; Ad Spend
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white dark:bg-[#19103C] border border-violet-100 dark:border-purple-500/20 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Inventory Sync</span>
                    <p className="text-lg sm:text-xl font-black text-[#7F22FE] dark:text-purple-300 mt-1">
                      100% Auto
                    </p>
                    <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                      Live Stock &amp; Due Ledger
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 9 Core Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {agentIntelligence.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-[#140D2E]/90 rounded-2xl p-5 border border-slate-200/85 dark:border-purple-500/20 hover:border-[#7F22FE]/45 dark:hover:border-purple-400/45 shadow-[0_10px_28px_-12px_rgba(15,23,42,0.07)] hover:shadow-[0_18px_38px_-12px_rgba(127,34,254,0.16)] hover:-translate-y-0.5 transition-all duration-200 flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-50/70 dark:bg-[#1F1545] flex items-center justify-center shrink-0 mt-0.5 border border-violet-200/60 dark:border-purple-500/20">
                  <Icon className={`w-5 h-5 ${item.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-300/80 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
