import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  Smartphone,
  Facebook,
  Instagram,
  Calendar,
  MessageSquare,
  Send,
  Sparkles,
  Crown,
  ShoppingBag,
  PauseCircle,
  PlayCircle,
  Ban,
  CheckCircle2,
  Megaphone,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Sliders,
  X
} from 'lucide-react';
import { api } from '../../api';
import { Contact, WhatsAppBroadcastQuota } from '../../types';

export const ContactsView: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'whatsapp' | 'messenger' | 'instagram'>('all');
  const [segmentFilter, setSegmentFilter] = useState<'all' | 'unordered' | 'ordered' | 'vip' | 'paused_blocked'>('all');
  const [loading, setLoading] = useState(true);

  // WhatsApp Official Rules & Daily VIP Messaging Limit State
  const [quota, setQuota] = useState<WhatsAppBroadcastQuota>({
    dailyLimit: 50,
    perCustomerDailyLimit: 1,
    enforce24hWindow: true,
    usedToday: 0,
    remainingToday: 50,
    isLimitReached: false,
    messagedCustomerIdsToday: [],
    nextResetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  });
  const [updatingLimit, setUpdatingLimit] = useState(false);
  const [limitAlertModal, setLimitAlertModal] = useState<{
    title: string;
    message: string;
    usedToday: number;
    dailyLimit: number;
  } | null>(null);

  // Smart Broadcast & Retargeting State
  const [showBroadcastBox, setShowBroadcastBox] = useState(false);
  const [broadcastSegment, setBroadcastSegment] = useState<'all' | 'unordered' | 'vip' | 'ordered'>('vip');
  const [broadcastPlatform, setBroadcastPlatform] = useState<'all' | 'whatsapp' | 'messenger' | 'instagram'>('all');
  const [broadcastText, setBroadcastText] = useState(
    'Hello {customer_name}! As one of our valued VIP customers, enjoy an exclusive 15% discount on our latest collection! Reply with your Name, Address & Phone Number to claim your VIP offer today. 🌟'
  );
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [sendingSingleVipId, setSendingSingleVipId] = useState<string | null>(null);
  const [statusToast, setStatusToast] = useState<{ text: string; isError?: boolean } | null>(null);

  useEffect(() => {
    loadContactsAndQuota();
  }, []);

  const loadContactsAndQuota = async () => {
    try {
      setLoading(true);
      const [contactsData, quotaData] = await Promise.all([
        api.getContacts(),
        api.getBroadcastQuota().catch(() => null)
      ]);
      setContacts(contactsData);
      if (quotaData) {
        setQuota(quotaData);
      }
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDailyLimit = async (newLimit: number) => {
    try {
      setUpdatingLimit(true);
      const res = await api.updateBroadcastQuota({ dailyLimit: newLimit });
      if (res.quota) {
        setQuota(res.quota);
      }
      setStatusToast({
        text: `WhatsApp daily VIP & broadcast limit set to ${newLimit} messages per 24 hours.`
      });
      setTimeout(() => setStatusToast(null), 4000);
    } catch (err: any) {
      setStatusToast({
        text: err?.message || 'Failed to update daily WhatsApp limit',
        isError: true
      });
      setTimeout(() => setStatusToast(null), 4000);
    } finally {
      setUpdatingLimit(false);
    }
  };

  const handleCustomerAction = async (
    customerId: string,
    action: 'pause_ai' | 'resume_ai' | 'block' | 'unblock'
  ) => {
    try {
      await api.toggleCustomerControl(customerId, action);
      setContacts((prev) =>
        prev.map((c) => {
          if (c.customerId !== customerId) return c;
          if (action === 'pause_ai') return { ...c, isAiPaused: true };
          if (action === 'resume_ai') return { ...c, isAiPaused: false };
          if (action === 'block') return { ...c, isBlocked: true };
          if (action === 'unblock') return { ...c, isBlocked: false };
          return c;
        })
      );
      setStatusToast({
        text:
          action === 'pause_ai'
            ? 'AI Auto-Reply paused for this customer (Human Mode active).'
            : action === 'resume_ai'
            ? 'AI Auto-Reply resumed for this customer.'
            : action === 'block'
            ? 'Customer added to Fraud/Spam Blacklist.'
            : 'Customer removed from Blacklist.'
      });
      setTimeout(() => setStatusToast(null), 3500);
    } catch (err: any) {
      console.error('Customer control error:', err);
    }
  };

  const handleSendSegmentBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    // Frontend check before sending
    if (quota.isLimitReached || quota.remainingToday <= 0) {
      setLimitAlertModal({
        title: 'Daily WhatsApp & VIP Messaging Limit Reached!',
        message: `You have used all ${quota.usedToday} of ${quota.dailyLimit} allowed promotional messages in the last 24 hours. According to WhatsApp Business anti-ban rules, further VIP broadcasts are locked until your 24-hour quota resets.`,
        usedToday: quota.usedToday,
        dailyLimit: quota.dailyLimit
      });
      return;
    }

    try {
      setSendingBroadcast(true);
      const res = await api.sendSegmentBroadcast({
        segment: broadcastSegment,
        platform: broadcastPlatform,
        messageText: broadcastText.trim()
      });
      if (res.quota) {
        setQuota(res.quota);
      }
      setStatusToast({
        text:
          res.message ||
          `Broadcast sent to ${res.sentCount} customer(s) in "${broadcastSegment.toUpperCase()}" segment!`
      });
      setTimeout(() => setStatusToast(null), 5500);
      setShowBroadcastBox(false);
      await loadContactsAndQuota();

      if (res.quota?.isLimitReached) {
        setLimitAlertModal({
          title: 'Daily WhatsApp & VIP Messaging Limit Now Reached!',
          message: `Your broadcast was delivered to ${res.sentCount} customer(s), and you have now reached 100% of your daily WhatsApp limit (${res.quota.usedToday}/${res.quota.dailyLimit}). Additional promotional messages are paused for 24 hours to protect your WhatsApp Business number.`,
          usedToday: res.quota.usedToday,
          dailyLimit: res.quota.dailyLimit
        });
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to send broadcast';
      setStatusToast({ text: errMsg, isError: true });
      setTimeout(() => setStatusToast(null), 5000);
      await loadContactsAndQuota();
      if (
        errMsg.toLowerCase().includes('limit reached') ||
        errMsg.toLowerCase().includes('quota') ||
        errMsg.toLowerCase().includes('24 hours')
      ) {
        setLimitAlertModal({
          title: 'WhatsApp VIP Messaging Limit Reached!',
          message: errMsg,
          usedToday: quota.usedToday,
          dailyLimit: quota.dailyLimit
        });
      }
    } finally {
      setSendingBroadcast(false);
    }
  };

  const handleSendSingleVipMessage = async (contact: Contact) => {
    const key = `${contact.platform}_${contact.customerId}`;
    const alreadySentToThisVip =
      (contact.vipBroadcastSentToday || 0) >= quota.perCustomerDailyLimit ||
      quota.messagedCustomerIdsToday.includes(key) ||
      quota.messagedCustomerIdsToday.includes(contact.customerId);

    if (quota.isLimitReached || quota.remainingToday <= 0) {
      setLimitAlertModal({
        title: 'Daily WhatsApp & VIP Messaging Limit Reached!',
        message: `You have reached your daily limit of ${quota.dailyLimit}/${quota.dailyLimit} VIP promotional messages for the last 24 hours. According to WhatsApp Business rules, please wait for the 24-hour window reset or increase your tier limit if your account is verified.`,
        usedToday: quota.usedToday,
        dailyLimit: quota.dailyLimit
      });
      return;
    }

    if (alreadySentToThisVip) {
      setLimitAlertModal({
        title: 'Per-Customer 24-Hour WhatsApp Limit Reached!',
        message: `${contact.customerName || 'This VIP customer'} has already received ${quota.perCustomerDailyLimit} promotional VIP message in the last 24 hours. According to WhatsApp Anti-Spam rules, you cannot send another promotional message to the same customer within 24 hours.`,
        usedToday: quota.usedToday,
        dailyLimit: quota.dailyLimit
      });
      return;
    }

    try {
      setSendingSingleVipId(key);
      const res = await api.sendSegmentBroadcast({
        segment: 'vip',
        platform: contact.platform,
        targetCustomerId: contact.customerId,
        messageText: `Hello ${contact.customerName || 'Valued VIP'}! 👑 As one of our top VIP customers, enjoy an exclusive 15% discount on your next order! Reply to claim your VIP offer today.`
      });
      if (res.quota) {
        setQuota(res.quota);
      }
      setStatusToast({
        text: `VIP offer sent to ${contact.customerName}! (${res.quota?.remainingToday ?? quota.remainingToday - 1} daily WhatsApp quota remaining)`
      });
      setTimeout(() => setStatusToast(null), 4500);
      await loadContactsAndQuota();
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to send VIP message';
      setStatusToast({ text: errMsg, isError: true });
      setTimeout(() => setStatusToast(null), 4500);
      setLimitAlertModal({
        title: 'WhatsApp VIP Messaging Limit Reached!',
        message: errMsg,
        usedToday: quota.usedToday,
        dailyLimit: quota.dailyLimit
      });
    } finally {
      setSendingSingleVipId(null);
    }
  };

  const unorderedCount = contacts.filter((c) => !c.hasOrdered && !c.isBlocked).length;
  const orderedCount = contacts.filter((c) => c.hasOrdered).length;
  const vipCount = contacts.filter((c) => c.isVip).length;
  const pausedOrBlockedCount = contacts.filter((c) => c.isAiPaused || c.isBlocked).length;

  const usagePercent = Math.min(
    100,
    Math.round((quota.usedToday / Math.max(1, quota.dailyLimit)) * 100)
  );

  const filtered = contacts.filter((c) => {
    if (platformFilter !== 'all' && c.platform !== platformFilter) return false;
    if (segmentFilter === 'unordered' && (c.hasOrdered || c.isBlocked)) return false;
    if (segmentFilter === 'ordered' && !c.hasOrdered) return false;
    if (segmentFilter === 'vip' && !c.isVip) return false;
    if (segmentFilter === 'paused_blocked' && !c.isAiPaused && !c.isBlocked) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        (c.customerName && c.customerName.toLowerCase().includes(q)) ||
        (c.customerId && c.customerId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            Customer Leads & VIP Retargeting CRM
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Auto-segmented leads & VIP Repeat Buyers with Official WhatsApp Anti-Ban Messaging Limits.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowBroadcastBox(!showBroadcastBox)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
              quota.isLimitReached
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20'
                : 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white shadow-purple-500/25'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>
              {quota.isLimitReached
                ? 'VIP Broadcast (Daily Limit Reached)'
                : '1-Click VIP & Retargeting Broadcast'}
            </span>
          </button>

          <button
            onClick={loadContactsAndQuota}
            className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Prominent Limit Reached Banner (Shown whenever daily WhatsApp limit is exhausted) */}
      {quota.isLimitReached && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-300 dark:border-rose-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-rose-900 dark:text-rose-200">
                Daily WhatsApp & VIP Messaging Limit Reached ({quota.usedToday} / {quota.dailyLimit} Used)
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                According to official WhatsApp Business anti-ban rules, your daily promotional message quota is full. Outbound VIP broadcasts are locked until the 24-hour window resets ({new Date(quota.nextResetAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-extrabold">
              0 Remaining Today
            </span>
          </div>
        </div>
      )}

      {/* WhatsApp Official Rules & Daily VIP Messaging Quota Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                quota.isLimitReached
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
                  WhatsApp Official VIP Messaging Limit & Anti-Ban Shield
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                    quota.isLimitReached
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'
                  }`}
                >
                  {quota.isLimitReached
                    ? 'LIMIT REACHED (LOCKED)'
                    : `${quota.remainingToday} Messages Remaining Today`}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/80">
                  Max {quota.perCustomerDailyLimit} Promo / 24h per VIP
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Enforces Meta&apos;s 24-hour customer window &amp; daily tier cap so your WhatsApp Business number is never flagged or restricted.
              </p>
            </div>
          </div>

          {/* Configurable Daily Limit Tier Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-bold text-neutral-600 dark:text-neutral-300 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              Safe Daily Limit:
            </label>
            <select
              value={
                [2, 10, 25, 50, 100, 250, 1000].includes(quota.dailyLimit)
                  ? quota.dailyLimit
                  : 50
              }
              disabled={updatingLimit}
              onChange={(e) => handleUpdateDailyLimit(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white cursor-pointer"
            >
              <option value={2}>2 Messages / 24h (Quick Limit Test)</option>
              <option value={10}>10 Messages / 24h (New Number Warmup — 100% Safe)</option>
              <option value={25}>25 Messages / 24h (Starter Store — 100% Safe)</option>
              <option value={50}>50 Messages / 24h (Recommended Anti-Ban Default)</option>
              <option value={100}>100 Messages / 24h (Active Store Safe Limit)</option>
              <option value={250}>250 Messages / 24h (Meta Unverified Official Max)</option>
              <option value={1000}>1,000 Messages / 24h (Meta Verified Business Only)</option>
            </select>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-neutral-600 dark:text-neutral-300">
              24-Hour VIP & Broadcast Usage: {quota.usedToday} / {quota.dailyLimit} messages sent ({usagePercent}%)
            </span>
            <span
              className={
                quota.isLimitReached
                  ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                  : 'text-emerald-600 dark:text-emerald-400'
              }
            >
              {quota.isLimitReached
                ? '🚫 Daily Limit Exhausted — Resets in 24h'
                : `✓ ${quota.remainingToday} Available Today`}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                quota.isLimitReached
                  ? 'bg-rose-600'
                  : usagePercent >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>
      </div>

      {statusToast && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between ${
            statusToast.isError
              ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300'
              : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300'
          }`}
        >
          <span>{statusToast.text}</span>
          <button onClick={() => setStatusToast(null)} className="text-xs underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* 1-Click Smart Broadcast & Retargeting Campaign Drawer */}
      {showBroadcastBox && (
        <form
          onSubmit={handleSendSegmentBroadcast}
          className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/90 via-white to-indigo-50/70 dark:from-[#18113A] dark:via-[#130D2E] dark:to-[#1C1444] border border-purple-200 dark:border-purple-500/30 shadow-md space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-neutral-900 dark:text-white">
                  1-Click VIP Customer & Smart Retargeting Broadcast
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Protected by WhatsApp Business rules ({quota.remainingToday} of {quota.dailyLimit} daily messages remaining today)
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setBroadcastSegment('vip');
                  setBroadcastText(
                    'Hello {customer_name}! As one of our valued VIP customers, enjoy an exclusive 15% discount on our new arrival collection! Reply to view the latest catalog. 🌟'
                  );
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[11px] font-bold cursor-pointer"
              >
                Template: VIP Customer Offer
              </button>
              <button
                type="button"
                onClick={() => {
                  setBroadcastSegment('unordered');
                  setBroadcastText(
                    'Hello {customer_name}! You recently inquired about our products. Confirm your order today to get an exclusive discount and fast delivery! Reply with your Name, Address & Phone Number to place your order. 🎁'
                  );
                }}
                className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[11px] font-bold cursor-pointer"
              >
                Template: Unordered Leads (Retargeting)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Target Customer Segment
              </label>
              <select
                value={broadcastSegment}
                onChange={(e) => setBroadcastSegment(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-semibold"
              >
                <option value="vip">👑 VIP Repeat Buyers — Multiple or high-value orders ({vipCount})</option>
                <option value="unordered">
                  🎯 Retargeting Leads — Messaged but did not order yet ({unorderedCount})
                </option>
                <option value="ordered">🛍️ All Ordered Customers — Customers with past orders ({orderedCount})</option>
                <option value="all">📢 All Active Leads ({contacts.length})</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Channel Filter
              </label>
              <select
                value={broadcastPlatform}
                onChange={(e) => setBroadcastPlatform(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-semibold"
              >
                <option value="all">All Connected Channels (WhatsApp, Messenger & IG)</option>
                <option value="whatsapp">WhatsApp Only (24h Rule & Tier Cap Active)</option>
                <option value="messenger">Facebook Messenger Only</option>
                <option value="instagram">Instagram Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Promotional / VIP Offer Message (Bangla or English)
            </label>
            <textarea
              rows={3}
              required
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              className="w-full p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>
                WhatsApp Rule: Max {quota.perCustomerDailyLimit} promotional message per VIP customer every 24 hours ({quota.remainingToday} daily quota left).
              </span>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBroadcastBox(false)}
                className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sendingBroadcast || quota.isLimitReached}
                className={`px-5 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-60 ${
                  quota.isLimitReached
                    ? 'bg-rose-600 cursor-not-allowed'
                    : 'bg-[#7C3AED] hover:bg-[#6D28D9]'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {quota.isLimitReached
                    ? 'Daily WhatsApp Limit Reached'
                    : sendingBroadcast
                    ? 'Sending VIP Broadcast...'
                    : 'Send Campaign Now'}
                </span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Segment Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSegmentFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            segmentFilter === 'all'
              ? 'bg-[#7C3AED] text-white shadow-xs'
              : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300'
          }`}
        >
          All Leads ({contacts.length})
        </button>
        <button
          onClick={() => setSegmentFilter('vip')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            segmentFilter === 'vip'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          <Crown className="w-3.5 h-3.5" />
          <span>VIP Repeat Buyers ({vipCount})</span>
        </button>
        <button
          onClick={() => setSegmentFilter('unordered')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            segmentFilter === 'unordered'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-amber-600 dark:text-amber-400'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Asked Price / Not Ordered Yet ({unorderedCount})</span>
        </button>
        <button
          onClick={() => setSegmentFilter('ordered')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            segmentFilter === 'ordered'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-blue-600 dark:text-blue-400'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Ordered Customers ({orderedCount})</span>
        </button>
        <button
          onClick={() => setSegmentFilter('paused_blocked')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            segmentFilter === 'paused_blocked'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-rose-600 dark:text-rose-400'
          }`}
        >
          <Ban className="w-3.5 h-3.5" />
          <span>AI Paused / Blocked ({pausedOrBlockedCount})</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search leads by name or phone/PSID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setPlatformFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              platformFilter === 'all'
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            All Channels
          </button>
          <button
            onClick={() => setPlatformFilter('whatsapp')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              platformFilter === 'whatsapp'
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            WhatsApp
          </button>
          <button
            onClick={() => setPlatformFilter('messenger')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              platformFilter === 'messenger'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            <Facebook className="w-3 h-3" />
            Messenger
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Customer Lead</th>
                <th className="py-3 px-4">CRM Segment & Spend</th>
                <th className="py-3 px-4">Channel & 24h Window</th>
                <th className="py-3 px-4">Identifier / Phone</th>
                <th className="py-3 px-4">VIP Daily Quota Status</th>
                <th className="py-3 px-4 text-right">VIP Message & AI Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    No customer contacts found in this segment.
                  </td>
                </tr>
              ) : (
                filtered.map((c, idx) => {
                  const key = `${c.platform}_${c.customerId}`;
                  const customerSentCount = c.vipBroadcastSentToday || 0;
                  const isCustomerLimitReached =
                    customerSentCount >= quota.perCustomerDailyLimit ||
                    quota.messagedCustomerIdsToday.includes(key) ||
                    quota.messagedCustomerIdsToday.includes(c.customerId);

                  return (
                    <tr
                      key={`${c.platform}_${c.customerId}_${idx}`}
                      className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                          <span>{c.customerName || 'Anonymous Customer'}</span>
                          {c.isVip && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 inline-flex items-center gap-1">
                              <Crown className="w-2.5 h-2.5" /> VIP
                            </span>
                          )}
                          {c.isAiPaused && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400">
                              Human Mode (AI Paused)
                            </span>
                          )}
                          {c.isBlocked && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400">
                              Blocked
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          {c.totalMessages} messages • Last active{' '}
                          {c.lastContactDate
                            ? new Date(c.lastContactDate).toLocaleString([], {
                                dateStyle: 'short',
                                timeStyle: 'short'
                              })
                            : 'Recent'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {c.hasOrdered ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Ordered ({c.totalOrders || 1})
                            </span>
                            <div className="text-[11px] text-neutral-500">
                              Spent: ৳ {(c.totalSpent || 0).toLocaleString()}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[11px] font-semibold">
                            Pending Lead (No Order Yet)
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 space-y-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            c.platform === 'whatsapp'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : c.platform === 'instagram'
                              ? 'bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300'
                              : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                          }`}
                        >
                          {c.platform === 'whatsapp' ? (
                            <Smartphone className="w-3 h-3" />
                          ) : c.platform === 'instagram' ? (
                            <Instagram className="w-3 h-3" />
                          ) : (
                            <Facebook className="w-3 h-3" />
                          )}
                          {c.platform === 'whatsapp'
                            ? 'WhatsApp'
                            : c.platform === 'instagram'
                            ? 'Instagram'
                            : 'Messenger'}
                        </span>
                        <div className="text-[10px]">
                          {c.within24hWindow ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              ● Inside 24h Window
                            </span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">
                              ● 24h Window Expired
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-neutral-600 dark:text-neutral-400">
                        {c.customerId}
                      </td>

                      <td className="py-3.5 px-4">
                        {quota.isLimitReached ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[11px] font-bold border border-rose-200">
                            <AlertTriangle className="w-3 h-3" /> Daily Quota Full ({quota.usedToday}/{quota.dailyLimit})
                          </span>
                        ) : isCustomerLimitReached ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[11px] font-bold border border-amber-200">
                            <Clock className="w-3 h-3" /> Limit Reached ({customerSentCount}/{quota.perCustomerDailyLimit} Today)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Ready ({customerSentCount}/{quota.perCustomerDailyLimit} Today)
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {c.isVip && (
                            <button
                              type="button"
                              onClick={() => handleSendSingleVipMessage(c)}
                              disabled={sendingSingleVipId === key}
                              title={
                                quota.isLimitReached || isCustomerLimitReached
                                  ? 'WhatsApp VIP messaging limit reached for today'
                                  : 'Send 1-Click VIP Offer Message'
                              }
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                quota.isLimitReached || isCustomerLimitReached
                                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200'
                                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-2xs'
                              }`}
                            >
                              <Crown className="w-3 h-3" />
                              <span>
                                {sendingSingleVipId === key
                                  ? 'Sending...'
                                  : quota.isLimitReached || isCustomerLimitReached
                                  ? 'Limit Reached'
                                  : 'Send VIP Offer'}
                              </span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleCustomerAction(c.customerId, c.isAiPaused ? 'resume_ai' : 'pause_ai')
                            }
                            title={
                              c.isAiPaused
                                ? 'Resume AI Auto-Reply for this customer'
                                : 'Pause AI Auto-Reply (Human Handover)'
                            }
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                              c.isAiPaused
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                                : 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 hover:bg-purple-100'
                            }`}
                          >
                            {c.isAiPaused ? (
                              <>
                                <PlayCircle className="w-3.5 h-3.5" />
                                <span>Resume AI</span>
                              </>
                            ) : (
                              <>
                                <PauseCircle className="w-3.5 h-3.5" />
                                <span>Pause AI</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleCustomerAction(c.customerId, c.isBlocked ? 'unblock' : 'block')
                            }
                            title={
                              c.isBlocked
                                ? 'Unblock customer'
                                : 'Block Fake Order / Spammer from triggering AI'
                            }
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                              c.isBlocked
                                ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100'
                            }`}
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>{c.isBlocked ? 'Unblock' : 'Block'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* WhatsApp Limit Reached Popup Modal */}
      {limitAlertModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-rose-200 dark:border-rose-800 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    WhatsApp Official Anti-Ban Rule
                  </span>
                  <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
                    {limitAlertModal.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLimitAlertModal(null)}
                className="p-1.5 rounded-xl text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {limitAlertModal.message}
            </p>

            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-rose-900 dark:text-rose-200">
                <span>Daily VIP Broadcast Quota Used:</span>
                <span>
                  {limitAlertModal.usedToday} / {limitAlertModal.dailyLimit} Messages
                </span>
              </div>
              <div className="text-[11px] text-rose-700 dark:text-rose-300">
                • Max {quota.perCustomerDailyLimit} promotional message per VIP customer every 24 hours.
                <br />• Quota automatically resets 24 hours after your broadcast.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setLimitAlertModal(null)}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-extrabold cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
