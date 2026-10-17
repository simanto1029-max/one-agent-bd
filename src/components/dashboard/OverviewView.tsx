import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Truck,
  Bot,
  Smartphone,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Plus,
  RefreshCw,
  MessageSquare,
  Users,
  Store,
  Layers,
  ChevronRight,
  Filter,
  Eye,
  Calendar,
  AlertTriangle,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import {
  UserProfile,
  SubscriptionStatusInfo,
  Channel,
  OrderMetrics,
  Order,
  Agent
} from '../../types';
import { api } from '../../api';
import { FacebookLogo, InstagramLogo, WhatsAppLogo } from '../common/BrandLogos';

interface OverviewViewProps {
  user: UserProfile;
  subStatus: SubscriptionStatusInfo | null;
  channels: Channel[];
  totalMessagesCount: number;
  aiRepliesCount: number;
  onNavigate: (tab: string) => void;
  onOpenWebhookTester?: () => void;
  onOpenTour?: (step?: number) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  user,
  subStatus,
  channels,
  totalMessagesCount,
  aiRepliesCount,
  onNavigate
}) => {
  const [orderMetrics, setOrderMetrics] = useState<OrderMetrics | null>(null);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [agentsList, setAgentsList] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'today' | '7d' | '30d' | 'all'>('7d');
  const [selectedBusinessFilter, setSelectedBusinessFilter] = useState<string>('all');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersRes, agentsRes] = await Promise.all([
        api.getOrders().catch(() => ({ orders: [], metrics: null })),
        api.getAgents().catch(() => ({ agents: [] }))
      ]);

      if (ordersRes.orders) {
        setOrdersList(ordersRes.orders);
      }
      if (ordersRes.metrics) {
        setOrderMetrics(ordersRes.metrics);
      }
      if (agentsRes.agents) {
        setAgentsList(agentsRes.agents);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders
  const filteredOrders = ordersList.filter((o) => {
    if (selectedBusinessFilter !== 'all') {
      const matchAgent = agentsList.find((a) => a.id === selectedBusinessFilter);
      if (matchAgent && matchAgent.assigned_channels) {
        if (o.channel_id && !matchAgent.assigned_channels.includes(o.channel_id)) {
          return false;
        }
      }
    }
    return true;
  });

  // Calculate real sales KPIs
  const totalRevenue = filteredOrders.reduce(
    (sum, o) => (o.status !== 'cancelled' ? sum + (o.total_amount || 0) : sum),
    0
  );

  const confirmedCount = filteredOrders.filter(
    (o) => o.status === 'confirmed' || o.status === 'processing'
  ).length;

  const shippedCount = filteredOrders.filter((o) => o.status === 'shipped').length;
  const deliveredCount = filteredOrders.filter((o) => o.status === 'delivered').length;
  const pendingCount = filteredOrders.filter((o) => !o.status || o.status === 'processing').length;
  const cancelledCount = filteredOrders.filter((o) => o.status === 'cancelled').length;

  // AI-captured orders
  const aiOrders = filteredOrders.filter((o) => o.order_source === 'ai_detected' || !o.order_source);
  const aiRevenue = aiOrders.reduce(
    (sum, o) => (o.status !== 'cancelled' ? sum + (o.total_amount || 0) : sum),
    0
  );

  // Conversion rate (AI closed orders vs total inquiries)
  const totalInquiries = Math.max(totalMessagesCount > 0 ? Math.round(totalMessagesCount / 3) : 12, filteredOrders.length);
  const conversionRate = totalInquiries > 0 ? Math.min(Math.round((filteredOrders.length / totalInquiries) * 100), 100) : 32;

  // Average Order Value
  const nonCancelledOrders = filteredOrders.filter((o) => o.status !== 'cancelled');
  const avgOrderValue =
    nonCancelledOrders.length > 0 ? Math.round(totalRevenue / nonCancelledOrders.length) : 0;

  // Suspicious orders
  const suspiciousOrders = filteredOrders.filter((o) => o.is_suspicious);

  const isProPlan = subStatus?.isProPlan;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-6xl mx-auto">
      {/* Top Welcome & Business Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#120B2E] border border-slate-200/80 dark:border-purple-500/20 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Autonomous Sales Operation Center
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {user.full_name || 'Merchant'} E-Commerce Command Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time sales revenue, parcel bookings, multi-business AI agents, and order conversions.
          </p>
        </div>

        {/* Business Brand Filter + Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {agentsList.length > 1 && (
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#1A123B] border border-slate-200 dark:border-purple-500/20">
              <Store className="w-3.5 h-3.5 text-[#7C3AED] ml-2" />
              <select
                value={selectedBusinessFilter}
                onChange={(e) => setSelectedBusinessFilter(e.target.value)}
                className="text-xs font-bold bg-transparent text-slate-800 dark:text-slate-200 pr-3 py-1 cursor-pointer focus:outline-none"
              >
                <option value="all">All Businesses &amp; Pages</option>
                {agentsList.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.business_name} ({ag.name})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={() => onNavigate('orders')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white text-xs font-bold shadow-sm shadow-purple-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('agents')}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#191138] hover:bg-slate-200 dark:hover:bg-[#251A4F] text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-purple-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>AI Agents ({agentsList.length})</span>
          </button>
        </div>
      </div>

      {/* 4 PRIMARY SALES & REVENUE KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Gross Sales (BDT) */}
        <div
          onClick={() => onNavigate('orders')}
          className="p-5 rounded-3xl bg-white dark:bg-[#120B2E] border border-slate-200/80 dark:border-purple-500/20 shadow-xs hover:border-[#7C3AED]/50 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Total Business Sales
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm">
              ৳
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
              ৳ {totalRevenue.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>AOV: ৳ {avgOrderValue.toLocaleString()} / order</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-purple-500/10 flex items-center justify-between">
            <span>{filteredOrders.length} total customer orders</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#7C3AED] transition-colors" />
          </div>
        </div>

        {/* Card 2: Confirmed & Booked Orders */}
        <div
          onClick={() => onNavigate('orders')}
          className="p-5 rounded-3xl bg-white dark:bg-[#120B2E] border border-slate-200/80 dark:border-purple-500/20 shadow-xs hover:border-[#7C3AED]/50 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Confirmed Orders
            </span>
            <div className="w-9 h-9 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
              {confirmedCount + deliveredCount + shippedCount}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#7C3AED] dark:text-purple-300 font-bold mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{deliveredCount} Delivered · {shippedCount} in Transit</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-purple-500/10 flex items-center justify-between">
            <span>{pendingCount} pending confirmation</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#7C3AED] transition-colors" />
          </div>
        </div>

        {/* Card 3: AI Autonomous Order Share */}
        <div
          onClick={() => onNavigate('agents')}
          className="p-5 rounded-3xl bg-white dark:bg-[#120B2E] border border-slate-200/80 dark:border-purple-500/20 shadow-xs hover:border-[#7C3AED]/50 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              AI Autonomous Sales
            </span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
              ৳ {aiRevenue.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold mt-1">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{conversionRate}% Inquiries Converted</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-purple-500/10 flex items-center justify-between">
            <span>Closed with 0 human shift cost</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#7C3AED] transition-colors" />
          </div>
        </div>

        {/* Card 4: Connected Channels & Agents */}
        <div
          onClick={() => onNavigate('channels')}
          className="p-5 rounded-3xl bg-white dark:bg-[#120B2E] border border-slate-200/80 dark:border-purple-500/20 shadow-xs hover:border-[#7C3AED]/50 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Active Sales Channels
            </span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
              {channels.filter((c) => c.is_active).length} / {channels.length || 0}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-1">
              <Store className="w-3.5 h-3.5" />
              <span>{agentsList.length} AI Business Agents</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-purple-500/10 flex items-center justify-between">
            <span>WhatsApp, FB &amp; Instagram</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#7C3AED] transition-colors" />
          </div>
        </div>
      </div>

      {/* QUICK OPERATIONS BAR (1-Click Courier, Add Product, Test AI Agent, View Inbox) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => onNavigate('delivery-courier')}
          className="p-4 rounded-2xl bg-white dark:bg-[#120B2E] border border-slate-200/80 dark:border-purple-500/20 hover:border-[#7C3AED]/40 shadow-xs text-left transition-all cursor-pointer flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight">
              Courier Dispatch
            </span>
            <span className="text-[11px] text-slate-400">Steadfast &amp; Pathao</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('products')}
          className="p-4 rounded-2xl bg-white dark:bg-[#120B2E] border border-slate-200/80 dark:border-purple-500/20 hover:border-[#7C3AED]/40 shadow-xs text-left transition-all cursor-pointer flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight">
              Product Catalog
            </span>
            <span className="text-[11px] text-slate-400">Inventory &amp; Pricing</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('agents')}
          className="p-4 rounded-2xl bg-white dark:bg-[#120B2E] border border-slate-200/80 dark:border-purple-500/20 hover:border-[#7C3AED]/40 shadow-xs text-left transition-all cursor-pointer flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight">
              Train AI Agents
            </span>
            <span className="text-[11px] text-slate-400">Multi-Business Rules</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('inbox')}
          className="p-4 rounded-2xl bg-white dark:bg-[#120B2E] border border-slate-200/80 dark:border-purple-500/20 hover:border-[#7C3AED]/40 shadow-xs text-left transition-all cursor-pointer flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight">
              Live Omnichannel Inbox
            </span>
            <span className="text-[11px] text-slate-400">WhatsApp &amp; DM Chats</span>
          </div>
        </button>
      </div>

      {/* SUSPICIOUS / FRAUD RISK BANNER (If any fake orders detected) */}
      {suspiciousOrders.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Fraud Alert:</strong> {suspiciousOrders.length} order(s) flagged for risky phone numbers or incomplete addresses. Review before dispatching to Steadfast.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('orders')}
            className="font-bold underline text-amber-700 dark:text-amber-300 hover:text-amber-900 cursor-pointer shrink-0"
          >
            Review Risky Orders
          </button>
        </div>
      )}

      {/* RECENT SALES & ORDERS STREAM */}
      <div className="bg-white dark:bg-[#120B2E] rounded-3xl border border-slate-200/80 dark:border-purple-500/20 shadow-xs overflow-hidden">
        {/* Table Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-purple-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#7C3AED]" />
              <span>Live Sales &amp; Customer Orders Feed</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Orders automatically confirmed by AI from Facebook, WhatsApp, and Instagram.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadDashboardData}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1A123B] transition-colors cursor-pointer"
              title="Refresh Orders"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#7C3AED]' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('orders')}
              className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-[#7C3AED] dark:text-purple-300 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({filteredOrders.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-purple-400 mx-auto" />
            <p className="text-xs">No orders recorded yet. When customers place orders in chat, they will show up here automatically.</p>
            <button
              type="button"
              onClick={() => onNavigate('orders')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#7C3AED] text-white hover:bg-[#6D28D9] cursor-pointer"
            >
              Add First Order
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 dark:bg-[#18103A] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-purple-500/10 font-bold">
                <tr>
                  <th className="py-3 px-4">Order ID &amp; Time</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Channel / Agent</th>
                  <th className="py-3 px-4 text-right">Amount (BDT)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-purple-500/10">
                {filteredOrders.slice(0, 6).map((order) => {
                  const ch = channels.find((c) => c.id === order.channel_id);
                  const isDelivered = order.status === 'delivered';
                  const isShipped = order.status === 'shipped';
                  const isCancelled = order.status === 'cancelled';

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-[#18103A]/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        <div className="font-bold text-slate-900 dark:text-white">
                          #{order.id.slice(-6).toUpperCase()}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Today'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900 dark:text-white">
                          {order.customer_name || 'Valued Buyer'}
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {order.customer_phone || 'Phone not provided'}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-[200px] truncate text-slate-700 dark:text-slate-300">
                        {order.items || order.product_summary || 'Order Items'}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {order.platform === 'whatsapp' ? (
                            <WhatsAppLogo className="w-3.5 h-3.5" />
                          ) : order.platform === 'messenger' ? (
                            <FacebookLogo className="w-3.5 h-3.5" />
                          ) : (
                            <InstagramLogo className="w-3.5 h-3.5" />
                          )}
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                            {ch?.name || (order.platform === 'whatsapp' ? 'WhatsApp' : 'Facebook')}
                          </span>
                        </div>
                        {order.order_source === 'ai_detected' && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>AI Closed</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                        ৳ {(order.total_amount || 0).toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isDelivered
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : isShipped
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : isCancelled
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              : 'bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          }`}
                        >
                          {order.status || 'Confirmed'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onNavigate('delivery-courier')}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-[#7C3AED] hover:text-white transition-colors cursor-pointer"
                        >
                          Courier
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MULTI-AGENT / MULTI-BUSINESS SALES PERFORMANCE BREAKDOWN */}
      {agentsList.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#120B2E] border border-slate-200/80 dark:border-purple-500/20 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-[#7C3AED]" />
                <span>Multi-Business AI Agent Performance Breakdown</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Sales generated and customer inquiries handled per business brand.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('agents')}
              className="text-xs font-bold text-[#7C3AED] dark:text-purple-300 hover:underline cursor-pointer"
            >
              Manage Agents &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {agentsList.map((agent) => {
              const assignedChannels = channels.filter(
                (c) => (agent.assigned_channels || []).includes(c.id) || c.agent_id === agent.id
              );
              const agentOrders = ordersList.filter(
                (o) => o.channel_id && assignedChannels.some((ac) => ac.id === o.channel_id)
              );
              const agentSales = agentOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

              return (
                <div
                  key={agent.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-[#18103A] border border-slate-200/70 dark:border-purple-500/15 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={agent.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'}
                        alt={agent.name}
                        className="w-8 h-8 rounded-xl object-cover"
                      />
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">
                          {agent.business_name}
                        </span>
                        <span className="block text-[10px] text-slate-400 truncate">
                          Agent: {agent.name}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-[#7C3AED] dark:text-purple-300">
                      {assignedChannels.length} Channels
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/50 dark:border-purple-500/10">
                    <span className="text-slate-500 dark:text-slate-400">Captured Sales:</span>
                    <span className="font-extrabold text-slate-900 dark:text-white tabular-nums">
                      ৳ {agentSales.toLocaleString()} ({agentOrders.length} orders)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
