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
  Megaphone
} from 'lucide-react';
import { api } from '../../api';
import { Contact } from '../../types';

export const ContactsView: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'whatsapp' | 'messenger' | 'instagram'>('all');
  const [segmentFilter, setSegmentFilter] = useState<'all' | 'unordered' | 'ordered' | 'vip' | 'paused_blocked'>('all');
  const [loading, setLoading] = useState(true);

  // Smart Broadcast & Retargeting State
  const [showBroadcastBox, setShowBroadcastBox] = useState(false);
  const [broadcastSegment, setBroadcastSegment] = useState<'all' | 'unordered' | 'vip' | 'ordered'>('unordered');
  const [broadcastPlatform, setBroadcastPlatform] = useState<'all' | 'whatsapp' | 'messenger' | 'instagram'>('all');
  const [broadcastText, setBroadcastText] = useState(
    'আসসালামু আলাইকুম! আপনি আমাদের পেজে প্রোডাক্টের দাম জানতে চেয়েছিলেন। আজ অর্ডার কনফার্ম করলেই পাচ্ছেন স্পেশাল ডিসকাউন্ট ও দ্রুত হোম ডেলিভারি! অর্ডার করতে আপনার নাম, ঠিকানা ও মোবাইল নাম্বারটি লিখে পাঠান। 🎁'
  );
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await api.getContacts();
      setContacts(data);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoading(false);
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
      setStatusToast(
        action === 'pause_ai'
          ? 'AI Auto-Reply paused for this customer (Human Mode active).'
          : action === 'resume_ai'
          ? 'AI Auto-Reply resumed for this customer.'
          : action === 'block'
          ? 'Customer added to Fraud/Spam Blacklist.'
          : 'Customer removed from Blacklist.'
      );
      setTimeout(() => setStatusToast(null), 3500);
    } catch (err: any) {
      console.error('Customer control error:', err);
    }
  };

  const handleSendSegmentBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    try {
      setSendingBroadcast(true);
      const res = await api.sendSegmentBroadcast({
        segment: broadcastSegment,
        platform: broadcastPlatform,
        messageText: broadcastText.trim()
      });
      setStatusToast(
        `✅ Retargeting Broadcast sent to ${res.sentCount} customer(s) in "${broadcastSegment.toUpperCase()}" segment!`
      );
      setTimeout(() => setStatusToast(null), 5000);
      setShowBroadcastBox(false);
      loadContacts();
    } catch (err: any) {
      setStatusToast(`⚠️ ${err?.message || 'Failed to send broadcast'}`);
      setTimeout(() => setStatusToast(null), 4000);
    } finally {
      setSendingBroadcast(false);
    }
  };

  const unorderedCount = contacts.filter((c) => !c.hasOrdered && !c.isBlocked).length;
  const orderedCount = contacts.filter((c) => c.hasOrdered).length;
  const vipCount = contacts.filter((c) => c.isVip).length;
  const pausedOrBlockedCount = contacts.filter((c) => c.isAiPaused || c.isBlocked).length;

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
            Customer Leads & Smart Retargeting CRM
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Auto-segmented leads (Pending Retargeting, Ordered, VIP Repeat Buyers) with 1-Click Broadcast & Spam Shield.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowBroadcastBox(!showBroadcastBox)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-purple-500/25 transition-all cursor-pointer"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>1-Click Retargeting Broadcast</span>
          </button>

          <button
            onClick={loadContacts}
            className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {statusToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between">
          <span>{statusToast}</span>
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
                  1-Click Smart Retargeting & Offer Broadcast
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  যারা দাম জিজ্ঞেস করে অর্ডার করেনি কিংবা আপনার পুরাতন VIP কাস্টমারদের ১ ক্লিকে অফার মেসেজ পাঠান
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setBroadcastSegment('unordered');
                  setBroadcastText(
                    'আসসালামু আলাইকুম! আপনি আমাদের পেজে প্রোডাক্টের দাম জানতে চেয়েছিলেন। আজ অর্ডার কনফার্ম করলেই পাচ্ছেন স্পেশাল ডিসকাউন্ট ও ফ্রি ডেলিভারি অফার! অর্ডার করতে আপনার নাম, ঠিকানা ও মোবাইল নাম্বারটি লিখে পাঠান। 🎁'
                  );
                }}
                className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[11px] font-bold cursor-pointer"
              >
                Template: অর্ডার না করা কাস্টমার (Retargeting)
              </button>
              <button
                type="button"
                onClick={() => {
                  setBroadcastSegment('vip');
                  setBroadcastText(
                    'আসসালামু আলাইকুম! আমাদের নিয়মিত VIP কাস্টমার হিসেবে আপনার জন্য নতুন কালেকশনে থাকছে বিশেষ ১৫% ছাড়! নতুন প্রোডাক্টগুলোর ছবি দেখতে রিপ্লাই করুন। 🌟'
                  );
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[11px] font-bold cursor-pointer"
              >
                Template: VIP কাস্টমার অফার
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
                <option value="unordered">
                  🎯 Retargeting Leads — যারা মেসেজ দিয়েছে কিন্তু অর্ডার করেনি ({unorderedCount})
                </option>
                <option value="vip">👑 VIP Repeat Buyers — একাধিকবার বা বড় অর্ডার করেছে ({vipCount})</option>
                <option value="ordered">🛍️ All Ordered Customers — যারা আগে অর্ডার করেছে ({orderedCount})</option>
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
                <option value="messenger">Facebook Messenger Only</option>
                <option value="whatsapp">WhatsApp Only</option>
                <option value="instagram">Instagram Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Promotional / Retargeting Message (Bangla or English)
            </label>
            <textarea
              rows={3}
              required
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              className="w-full p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            />
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
              disabled={sendingBroadcast}
              className="px-5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sendingBroadcast ? 'Sending Broadcast...' : 'Send Campaign Now'}</span>
            </button>
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
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Identifier / Phone</th>
                <th className="py-3 px-4">Messages</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-right">AI & Spam Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    No customer contacts found in this segment.
                  </td>
                </tr>
              ) : (
                filtered.map((c, idx) => (
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

                    <td className="py-3.5 px-4">
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
                    </td>

                    <td className="py-3.5 px-4 font-mono text-neutral-600 dark:text-neutral-400">
                      {c.customerId}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-neutral-700 dark:text-neutral-300">
                        <MessageSquare className="w-3 h-3 text-neutral-400" />
                        {c.totalMessages}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-neutral-500 dark:text-neutral-400">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {c.lastContactDate
                          ? new Date(c.lastContactDate).toLocaleString([], {
                              dateStyle: 'short',
                              timeStyle: 'short'
                            })
                          : 'Recent'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
