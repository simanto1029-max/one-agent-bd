import React from 'react';
import {
  Zap,
  MessageCircle,
  Repeat,
  ShoppingBag,
  Truck,
  Megaphone,
  Share2,
  Globe,
  BarChart3,
  UserCheck,
  Headphones,
  Volume2,
  Image as ImageIcon,
  Search,
  PhoneForwarded,
  FileSpreadsheet,
  Receipt,
  Bot
} from 'lucide-react';

interface FeatureCardItem {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  title: string;
  description: string;
}

export const Features: React.FC = () => {
  const automationAndWorkflow: FeatureCardItem[] = [
    {
      id: 'auto-message-reply',
      icon: Zap,
      iconColor: 'text-orange-500',
      title: 'Automatic message reply',
      description: 'Instant 24/7 replies to every incoming message across WhatsApp, Messenger, Instagram & Web.'
    },
    {
      id: 'comment-automation',
      icon: MessageCircle,
      iconColor: 'text-violet-500',
      title: 'Comment automation',
      description: 'Reply to Facebook Page post comments automatically and send a private inbox message.'
    },
    {
      id: 'follow-up',
      icon: Repeat,
      iconColor: 'text-blue-500',
      title: 'Follow up',
      description: 'Automatically check in with unreplied leads after your chosen delay so sales never go cold.'
    },
    {
      id: 'order-booking',
      icon: ShoppingBag,
      iconColor: 'text-emerald-600',
      title: 'Autonomous order booking',
      description: 'Collects customer name, 11-digit phone number, and delivery address directly in chat.'
    },
    {
      id: 'courier-dispatch',
      icon: Truck,
      iconColor: 'text-indigo-500',
      title: 'Steadfast & Pathao courier',
      description: 'Send confirmed orders to Steadfast, Pathao, or RedX courier with a single click.'
    },
    {
      id: 'broadcast',
      icon: Megaphone,
      iconColor: 'text-amber-500',
      title: 'Broadcast',
      description: 'Send targeted promotional offers and updates to your saved customer contacts in bulk.'
    },
    {
      id: 'one-click-channels',
      icon: Share2,
      iconColor: 'text-sky-500',
      title: '1-Click channel connection',
      description: 'Connect Facebook Page, Instagram, and WhatsApp Business without manual token setup.'
    },
    {
      id: 'web-store-widget',
      icon: Globe,
      iconColor: 'text-teal-500',
      title: 'Website store & chat widget',
      description: 'Built-in online product storefront and embeddable AI live chat widget for any website.'
    },
    {
      id: 'analytics-tracking',
      icon: BarChart3,
      iconColor: 'text-purple-600',
      title: 'Analytics & lead management',
      description: 'Track conversations, AI replies, confirmed orders, and organized customer leads in one place.'
    }
  ];

  const agentIntelligence: FeatureCardItem[] = [
    {
      id: 'human-like-messaging',
      icon: UserCheck,
      iconColor: 'text-indigo-900 dark:text-indigo-300',
      title: 'Human-like messaging',
      description: 'Natural replies in Bangla, Banglish, and English that sound like a real person, not a script.'
    },
    {
      id: 'voice-understanding',
      icon: Headphones,
      iconColor: 'text-slate-600 dark:text-slate-300',
      title: 'Voice understanding',
      description: 'Listens to and understands customer voice messages in Bengali and English automatically.'
    },
    {
      id: 'voice-replies',
      icon: Volume2,
      iconColor: 'text-blue-500',
      title: 'Voice replies',
      description: 'Sends natural spoken audio responses back to customers in chat, not just text.'
    },
    {
      id: 'image-sending',
      icon: ImageIcon,
      iconColor: 'text-emerald-500',
      title: 'Image sending',
      description: 'Shares product photos with accurate price and stock details as part of the conversation.'
    },
    {
      id: 'image-analysis',
      icon: Search,
      iconColor: 'text-sky-500',
      title: 'Image analysis',
      description: 'Reads and understands product screenshots or images that customers send in chat.'
    },
    {
      id: 'human-handoff',
      icon: PhoneForwarded,
      iconColor: 'text-amber-500',
      title: 'Human handoff & call requests',
      description: 'Pauses AI and alerts your team when a customer asks for a human or requests a phone call.'
    },
    {
      id: 'sheets-csv-sync',
      icon: FileSpreadsheet,
      iconColor: 'text-emerald-600',
      title: 'Google Sheets & CSV export',
      description: 'Logs confirmed order details and verified customer leads for instant CSV & Sheets export.'
    },
    {
      id: 'invoicing-trxid',
      icon: Receipt,
      iconColor: 'text-rose-500',
      title: 'Order invoicing & TrxID check',
      description: 'Generates instant order confirmation summaries and records bKash/Nagad Transaction IDs.'
    },
    {
      id: 'custom-persona',
      icon: Bot,
      iconColor: 'text-violet-600',
      title: 'Custom business training',
      description: 'Train your AI with custom delivery charges, return policies, and product catalog in seconds.'
    }
  ];

  const renderCardGrid = (items: FeatureCardItem[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className="bg-white dark:bg-[#140D2E]/90 rounded-2xl p-5 sm:p-6 border border-slate-100 dark:border-purple-500/20 shadow-[0_2px_12px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_24px_rgba(127,34,254,0.07)] dark:hover:border-purple-400/45 transition-all duration-200 flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-[#f3effb] dark:bg-[#1F1545] flex items-center justify-center shrink-0 mt-0.5 border border-transparent dark:border-purple-500/20">
              <Icon className={`w-5 h-5 ${item.iconColor}`} />
            </div>
            <div className="min-w-0">
              <h3 className="text-[15px] sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                {item.title}
              </h3>
              <p className="mt-1.5 text-xs sm:text-[13.5px] text-slate-500 dark:text-slate-300/80 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <section
      id="features"
      className="py-12 sm:py-16 bg-gradient-to-br from-[#f8f6ff] via-[#f3effb]/70 to-[#faf8ff] dark:from-[#0B0720] dark:via-[#120A30] dark:to-[#0A061C] border-t border-slate-200/60 dark:border-purple-500/15 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* 1. AUTOMATION & WORKFLOW */}
        <div>
          <h2 className="text-xs sm:text-sm font-extrabold tracking-[0.14em] uppercase text-[#c066ff] dark:text-[#c084fc] mb-5">
            AUTOMATION & WORKFLOW
          </h2>
          {renderCardGrid(automationAndWorkflow)}
        </div>

        {/* 2. AGENT INTELLIGENCE */}
        <div>
          <h2 className="text-xs sm:text-sm font-extrabold tracking-[0.14em] uppercase text-[#c066ff] dark:text-[#c084fc] mb-5">
            AGENT INTELLIGENCE
          </h2>
          {renderCardGrid(agentIntelligence)}
        </div>
      </div>
    </section>
  );
};
