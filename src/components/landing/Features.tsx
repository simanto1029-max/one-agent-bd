import React from 'react';
import {
  Zap,
  MessageCircle,
  ShoppingBag,
  Truck,
  Globe,
  BarChart3,
  Headphones,
  Image as ImageIcon,
  ShieldCheck
} from 'lucide-react';

interface FeatureCardItem {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  title: string;
  description: string;
}

export const Features: React.FC = () => {
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
      title: '1-Click Steadfast, Pathao & RedX',
      description: 'Send confirmed orders directly to Steadfast, Pathao, or RedX courier in one click with live consignment tracking.'
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
      className="py-14 sm:py-18 bg-white dark:bg-[#0B0720] border-t border-slate-100 dark:border-purple-500/15 transition-colors"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold tracking-[0.14em] uppercase text-[#7F22FE] dark:text-purple-400 block mb-2">
            AGENT INTELLIGENCE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Everything Your Business Needs to Automate Sales
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Built specifically for e-commerce and F-commerce brands to handle chats, orders, fraud checks, and accounting automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {agentIntelligence.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-[#140D2E]/90 rounded-2xl p-5 border border-slate-200/80 dark:border-purple-500/20 hover:border-[#7F22FE]/40 dark:hover:border-purple-400/45 transition-all duration-200 flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#1F1545] flex items-center justify-center shrink-0 mt-0.5 border border-slate-200/60 dark:border-purple-500/20">
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
