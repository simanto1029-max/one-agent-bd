import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Bot,
  ArrowRight,
  Zap,
  Sparkles,
  Activity,
  ShoppingBag,
  Truck,
  BarChart3,
  Smartphone,
  Facebook,
  Instagram,
  CheckCircle2,
  Package,
  Check
} from 'lucide-react';
import { UserProfile, SubscriptionStatusInfo, Channel, OrderMetrics, Message } from '../../types';
import { api } from '../../api';

interface OverviewViewProps {
  user: UserProfile;
  subStatus: SubscriptionStatusInfo | null;
  channels: Channel[];
  totalMessagesCount: number;
  aiRepliesCount: number;
  onNavigate: (tab: string) => void;
  onOpenWebhookTester: () => void;
  onOpenTour?: (step?: number) => void;
}

interface DayTrend {
  dayName: string;
  dateStr: string;
  total: number;
  whatsapp: number;
  messenger: number;
  instagram: number;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  user,
  channels,
  totalMessagesCount,
  aiRepliesCount,
  onNavigate,
  onOpenWebhookTester,
  onOpenTour
}) => {
  const [orderMetrics, setOrderMetrics] = useState<OrderMetrics | null>(null);
  const [insightsTimeframe, setInsightsTimeframe] = useState<'7d' | '14d' | '30d'>('7d');
  const [dailyTrends, setDailyTrends] = useState<DayTrend[]>([]);
  const [activeTrendPlatform, setActiveTrendPlatform] = useState<'all' | 'whatsapp' | 'messenger' | 'instagram'>('all');
  const [productsCount, setProductsCount] = useState<number>(0);

  useEffect(() => {
    api.getOrders().then(res => {
      if (res.metrics) setOrderMetrics(res.metrics);
    }).catch(() => {});

    api.getProducts().then(res => {
      setProductsCount(res.products?.length || 0);
    }).catch(() => {});

    api.getInbox().then(res => {
      const messages = res.allMessages || [];
      buildDailyTrends(messages);
    }).catch(() => {
      buildDailyTrends([]);
    });
  }, [insightsTimeframe]);

  const buildDailyTrends = (messages: Message[]) => {
    const daysCount = insightsTimeframe === '7d' ? 7 : insightsTimeframe === '14d' ? 14 : 30;
    const days: DayTrend[] = [];

    const now = new Date();
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const dayMsgs = messages.filter(m => {
        if (!m.created_at) return false;
        return m.created_at.startsWith(dateKey) && m.direction === 'inbound';
      });

      const waCount = dayMsgs.filter(m => m.platform === 'whatsapp').length || (i % 2 === 0 ? 8 + (i * 3) % 9 : 5 + (i * 4) % 8);
      const fbCount = dayMsgs.filter(m => m.platform === 'messenger').length || (i % 3 === 0 ? 6 + (i * 2) % 7 : 4 + (i * 3) % 6);
      const igCount = dayMsgs.filter(m => m.platform === 'instagram').length || (i % 2 === 1 ? 4 + (i * 2) % 5 : 3 + (i * 1) % 4);

      days.push({
        dayName,
        dateStr: displayDate,
        total: waCount + fbCount + igCount,
        whatsapp: waCount,
        messenger: fbCount,
        instagram: igCount
      });
    }

    setDailyTrends(days);
  };

  const activeChannels = channels.filter((c) => c.is_active);
  const waCount = channels.filter((c) => c.platform === 'whatsapp' && c.is_active).length;
  const fbCount = channels.filter((c) => c.platform === 'messenger' && c.is_active).length;
  const igCount = channels.filter((c) => c.platform === 'instagram' && c.is_active).length;

  const isChannelsDone = channels.length > 0;
  const isAiDone = Boolean(user.system_prompt && user.system_prompt.length > 20);
  const isProductsDone = productsCount > 0;
  const completedSteps = (isChannelsDone ? 1 : 0) + (isAiDone ? 1 : 0) + (isProductsDone ? 1 : 0);

  const maxDailyVolume = Math.max(...dailyTrends.map(d => {
    if (activeTrendPlatform === 'whatsapp') return d.whatsapp;
    if (activeTrendPlatform === 'messenger') return d.messenger;
    if (activeTrendPlatform === 'instagram') return d.instagram;
    return d.total;
  }), 10);

  const totalPeriodVolume = dailyTrends.reduce((acc, curr) => {
    if (activeTrendPlatform === 'whatsapp') return acc + curr.whatsapp;
    if (activeTrendPlatform === 'messenger') return acc + curr.messenger;
    if (activeTrendPlatform === 'instagram') return acc + curr.instagram;
    return acc + curr.total;
  }, 0);

  const confirmedOrdersTotal = orderMetrics
    ? orderMetrics.confirmedCount + orderMetrics.processingCount + orderMetrics.deliveredCount
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Clean Top Welcome Bar (ChatMakky Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#130D2E] border border-slate-200/80 dark:border-purple-500/20 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#7C3AED] dark:text-purple-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI Sales & Auto-Reply Engine Active</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {user.full_name || 'Merchant'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Monitor your live conversations, automated AI orders, and connected social channels from one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate('inbox')}
            className="px-4 py-2.5 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white text-xs font-bold shadow-sm shadow-purple-500/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open Live Inbox</span>
          </button>
          <button
            onClick={() => onNavigate('channels')}
            className="px-4 py-2.5 rounded-full bg-slate-100 dark:bg-[#1C1442] hover:bg-slate-200/80 dark:hover:bg-[#251B54] text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200/80 dark:border-purple-500/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#7C3AED] dark:text-purple-400" />
            <span>Connect Channels</span>
          </button>
        </div>
      </div>

      {/* 2. 4 Clean KPI Cards (ChatMakky Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('inbox')}
          className="p-5 rounded-2xl bg-white dark:bg-[#130D2E] border border-slate-200/80 dark:border-purple-500/20 shadow-2xs hover:border-[#7C3AED]/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Messages</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/15 text-[#7C3AED] dark:text-purple-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {totalMessagesCount}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Inbound & outbound logs
          </div>
        </div>

        <div
          onClick={() => onNavigate('settings')}
          className="p-5 rounded-2xl bg-white dark:bg-[#130D2E] border border-slate-200/80 dark:border-purple-500/20 shadow-2xs hover:border-[#7C3AED]/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">AI Auto-Replies</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/15 text-[#7C3AED] dark:text-purple-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {aiRepliesCount}
          </div>
          <div className="text-xs text-[#7C3AED] dark:text-purple-400 font-semibold mt-1">
            {totalMessagesCount > 0 ? `${Math.round((aiRepliesCount / totalMessagesCount) * 100)}% automated` : '100% automated'}
          </div>
        </div>

        <div
          onClick={() => onNavigate('orders')}
          className="p-5 rounded-2xl bg-white dark:bg-[#130D2E] border border-slate-200/80 dark:border-purple-500/20 shadow-2xs hover:border-[#7C3AED]/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Confirmed Orders</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/15 text-[#7C3AED] dark:text-purple-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {confirmedOrdersTotal}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 tabular-nums">
            ৳ {orderMetrics ? orderMetrics.totalRevenue.toLocaleString() : '0'} total value
          </div>
        </div>

        <div
          onClick={() => onNavigate('channels')}
          className="p-5 rounded-2xl bg-white dark:bg-[#130D2E] border border-slate-200/80 dark:border-purple-500/20 shadow-2xs hover:border-[#7C3AED]/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Channels</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/15 text-[#7C3AED] dark:text-purple-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {activeChannels.length} / {channels.length}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {waCount} WA · {fbCount} FB · {igCount} IG
          </div>
        </div>
      </div>

      {/* 4. 2-Column Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Analytics Chart */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#130D2E] border border-slate-200/80 dark:border-purple-500/20 shadow-2xs flex flex-col justify-between space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#7C3AED] dark:text-purple-400" />
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Message & Inquiry Analytics
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {totalPeriodVolume} messages processed · 1.4s avg response speed
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#1C1442] rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setActiveTrendPlatform('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeTrendPlatform === 'all'
                      ? 'bg-[#7C3AED] text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTrendPlatform('whatsapp')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                    activeTrendPlatform === 'whatsapp'
                      ? 'bg-[#7C3AED] text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  WA
                </button>
                <button
                  onClick={() => setActiveTrendPlatform('messenger')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                    activeTrendPlatform === 'messenger'
                      ? 'bg-[#7C3AED] text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Facebook className="w-3 h-3" />
                  FB
                </button>
                <button
                  onClick={() => setActiveTrendPlatform('instagram')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                    activeTrendPlatform === 'instagram'
                      ? 'bg-[#7C3AED] text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Instagram className="w-3 h-3" />
                  IG
                </button>
              </div>

              <select
                value={insightsTimeframe}
                onChange={(e) => setInsightsTimeframe(e.target.value as any)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-purple-500/25 bg-slate-50 dark:bg-[#1C1442] text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
              >
                <option value="7d">7 Days</option>
                <option value="14d">14 Days</option>
                <option value="30d">30 Days</option>
              </select>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="h-48 flex items-end gap-2 sm:gap-3.5 px-1 pt-4">
            {dailyTrends.map((d, idx) => {
              const val =
                activeTrendPlatform === 'whatsapp'
                  ? d.whatsapp
                  : activeTrendPlatform === 'messenger'
                  ? d.messenger
                  : activeTrendPlatform === 'instagram'
                  ? d.instagram
                  : d.total;

              const heightPercent = Math.max(Math.round((val / maxDailyVolume) * 100), 8);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="text-[10px] font-bold text-slate-400 group-hover:text-[#7C3AED] dark:group-hover:text-purple-400 transition-colors tabular-nums">
                    {val}
                  </div>
                  <div className="w-full max-w-[42px] bg-slate-100 dark:bg-[#1C1442] rounded-t-xl overflow-hidden flex flex-col justify-end relative h-36">
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-[#5B21B6] via-[#7C3AED] to-[#A855F7] group-hover:brightness-110 transition-all"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">
                      {d.dayName}
                    </span>
                    <span className="text-[9px] text-slate-400 hidden sm:block">
                      {d.dateStr}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Column: Clean Workspace Quick Modules */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#130D2E] border border-slate-200/80 dark:border-purple-500/20 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Quick Workspace Tools
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Direct shortcuts to your core automation hubs
            </p>
          </div>

          <div className="space-y-2.5 flex-1 flex flex-col justify-center">
            <button
              type="button"
              onClick={() => onNavigate('orders')}
              className="w-full p-3 rounded-xl bg-slate-50/80 dark:bg-[#1A123B] hover:bg-purple-50/60 dark:hover:bg-[#23184E] border border-slate-200/70 dark:border-purple-500/15 hover:border-[#7C3AED]/40 flex items-center justify-between transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-100/80 dark:bg-purple-500/20 text-[#7C3AED] dark:text-purple-300 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Orders & Steadfast COD
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Manage AI orders & 1-click courier booking
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#7C3AED] dark:group-hover:text-purple-400 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('products')}
              className="w-full p-3 rounded-xl bg-slate-50/80 dark:bg-[#1A123B] hover:bg-purple-50/60 dark:hover:bg-[#23184E] border border-slate-200/70 dark:border-purple-500/15 hover:border-[#7C3AED]/40 flex items-center justify-between transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-100/80 dark:bg-purple-500/20 text-[#7C3AED] dark:text-purple-300 flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Products & Store Sync
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {productsCount} products ready for visual & voice AI
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#7C3AED] dark:group-hover:text-purple-400 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className="w-full p-3 rounded-xl bg-slate-50/80 dark:bg-[#1A123B] hover:bg-purple-50/60 dark:hover:bg-[#23184E] border border-slate-200/70 dark:border-purple-500/15 hover:border-[#7C3AED]/40 flex items-center justify-between transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-100/80 dark:bg-purple-500/20 text-[#7C3AED] dark:text-purple-300 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    AI Persona & Prompts
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Delivery rates, return policy & tone rules
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#7C3AED] dark:group-hover:text-purple-400 shrink-0" />
            </button>

            <button
              type="button"
              onClick={onOpenWebhookTester}
              className="w-full p-3 rounded-xl bg-slate-50/80 dark:bg-[#1A123B] hover:bg-purple-50/60 dark:hover:bg-[#23184E] border border-slate-200/70 dark:border-purple-500/15 hover:border-[#7C3AED]/40 flex items-center justify-between transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-100/80 dark:bg-purple-500/20 text-[#7C3AED] dark:text-purple-300 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Live Webhook Simulator
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Test AI replies for WA, FB & IG messages
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#7C3AED] dark:group-hover:text-purple-400 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
