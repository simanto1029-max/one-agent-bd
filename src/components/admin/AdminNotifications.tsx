import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Sparkles,
  AlertTriangle,
  Wrench,
  Plus,
  Trash2,
  CheckCircle2,
  Eye,
  Power
} from 'lucide-react';
import { api } from '../../api';
import { AdminNotification } from '../../types';
import { notifyBroadcastsUpdated } from '../dashboard/MerchantBroadcastBanner';

const QUICK_TEMPLATES: {
  label: string;
  title: string;
  message: string;
  type: AdminNotification['type'];
  action_label: string;
  action_tab: string;
}[] = [
  {
    label: 'Special Discount / Offer',
    title: 'Special Discount Offer is Live!',
    message:
      'Upgrade to any Pro or Starter plan today and enjoy an exclusive limited-time discount on your subscription!',
    type: 'promo',
    action_label: 'Upgrade Plan',
    action_tab: 'billing'
  },
  {
    label: 'Billing / Renewal Reminder',
    title: 'Subscription Renewal Reminder',
    message:
      'Please renew your subscription plan before expiration to keep your 24/7 AI Auto-Reply and Order Automation running smoothly.',
    type: 'warning',
    action_label: 'Check Billing',
    action_tab: 'billing'
  },
  {
    label: 'New Feature Update',
    title: 'New Platform Features Released!',
    message:
      'Faster 1-click courier booking and automatic bKash/Nagad payment verification are now live on your merchant dashboard.',
    type: 'info',
    action_label: '',
    action_tab: ''
  },
  {
    label: 'Scheduled Maintenance',
    title: 'Scheduled Server Maintenance Notice',
    message:
      'Our servers will undergo scheduled maintenance tonight from 3:00 AM to 3:30 AM for system upgrades. We apologize for any brief inconvenience.',
    type: 'maintenance',
    action_label: '',
    action_tab: ''
  }
];

export const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<AdminNotification['type']>('promo');
  const [actionLabel, setActionLabel] = useState('');
  const [actionTab, setActionTab] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminNotifications();
      if (Array.isArray(res?.notifications)) {
        setNotifications(res.notifications);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = (tpl: (typeof QUICK_TEMPLATES)[0]) => {
    setTitle(tpl.title);
    setMessage(tpl.message);
    setType(tpl.type);
    setActionLabel(tpl.action_label);
    setActionTab(tpl.action_tab);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    try {
      setSubmitting(true);
      setFeedback(null);
      const res = await api.createAdminNotification({
        title: title.trim(),
        message: message.trim(),
        type,
        action_label: actionLabel.trim(),
        action_tab: actionTab,
        is_active: true
      });
      if (res?.notification) {
        setNotifications((prev) => [res.notification, ...prev]);
        setTitle('');
        setMessage('');
        setActionLabel('');
        setActionTab('');
        setFeedback('Broadcast alert published! All merchants will now see it on their dashboard.');
        notifyBroadcastsUpdated();
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (item: AdminNotification) => {
    try {
      const res = await api.updateAdminNotification(item.id, {
        is_active: !item.is_active
      });
      if (res?.notification) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? res.notification : n))
        );
        notifyBroadcastsUpdated();
      }
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAdminNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      notifyBroadcastsUpdated();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-neutral-900 dark:text-white">
              Merchant Broadcast Notifications
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Send instant announcements, discount offers, billing reminders, or maintenance alerts directly to all merchant dashboards.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-2 rounded-xl border border-indigo-200/60 dark:border-indigo-800/50 self-start sm:self-center">
          <span>Active Broadcasts: {notifications.filter((n) => n.is_active).length}</span>
        </div>
      </div>

      {/* Create New Broadcast Form */}
      <form
        onSubmit={handleCreate}
        className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>Create New Dashboard Broadcast</span>
          </h3>

          {/* 1-Click Quick Templates */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-neutral-400 mr-1">
              Quick Templates:
            </span>
            {QUICK_TEMPLATES.map((tpl) => (
              <button
                key={tpl.label}
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-neutral-700 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {feedback && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Headline / Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Special 20% Discount Offer is Live!"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Banner Style / Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AdminNotification['type'])}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
            >
              <option value="promo">Promo / Offer (Purple Gradient)</option>
              <option value="info">General Update / Info (Soft Purple)</option>
              <option value="warning">Billing / Reminder (Amber Alert)</option>
              <option value="maintenance">System Maintenance (Rose Alert)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
            Broadcast Message *
          </label>
          <textarea
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write the announcement message that merchants will see at the top of their dashboard..."
            required
            className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Action Button Label (Optional)
            </label>
            <input
              type="text"
              value={actionLabel}
              onChange={(e) => setActionLabel(e.target.value)}
              placeholder="e.g., Upgrade Now / View Billing"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Action Button Target Tab (Optional)
            </label>
            <select
              value={actionTab}
              onChange={(e) => setActionTab(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
            >
              <option value="">No Button Action</option>
              <option value="billing">Billing & Plans Tab</option>
              <option value="channels">Connected Channels Tab</option>
              <option value="orders">Orders Hub Tab</option>
              <option value="products">Products Catalog Tab</option>
              <option value="settings">AI Persona & Training Tab</option>
            </select>
          </div>
        </div>

        {/* Live Preview */}
        {(title.trim() || message.trim()) && (
          <div className="pt-2 space-y-1.5">
            <span className="text-[11px] font-bold text-neutral-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>Live Merchant Dashboard Preview:</span>
            </span>
            <div
              className={`rounded-2xl border px-4 py-3 flex items-center justify-between gap-3 ${
                type === 'promo'
                  ? 'bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#6366F1] text-white border-purple-400/30'
                  : type === 'warning'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-950 dark:text-amber-100 border-amber-300'
                  : type === 'maintenance'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-950 dark:text-rose-100 border-rose-300'
                  : 'bg-purple-50 dark:bg-[#191138] text-slate-900 dark:text-white border-purple-200'
              }`}
            >
              <div className="min-w-0">
                <div className="text-xs font-extrabold">{title || 'Notification Title'}</div>
                <div className="text-xs opacity-90 mt-0.5">{message || 'Notification message...'}</div>
              </div>
              {actionLabel && actionTab && (
                <span className="px-3 py-1.5 rounded-xl bg-white text-[#7C3AED] text-xs font-extrabold shrink-0">
                  {actionLabel} →
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Megaphone className="w-4 h-4" />
            <span>{submitting ? 'Publishing...' : 'Broadcast to All Merchants'}</span>
          </button>
        </div>
      </form>

      {/* Existing Broadcasts List */}
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-4">
        <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
          Broadcast History & Active Alerts ({notifications.length})
        </h3>

        {loading ? (
          <div className="py-8 text-center text-xs text-neutral-400">
            Loading broadcast notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-10 text-center space-y-2 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
            <Megaphone className="w-7 h-7 text-neutral-400 mx-auto" />
            <p className="text-xs font-bold text-neutral-600 dark:text-neutral-300">
              No broadcast notifications created yet
            </p>
            <p className="text-[11px] text-neutral-400">
              Use the form or quick templates above to send an announcement to all merchant dashboards.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => {
              const Icon =
                item.type === 'promo'
                  ? Sparkles
                  : item.type === 'warning'
                  ? AlertTriangle
                  : item.type === 'maintenance'
                  ? Wrench
                  : Megaphone;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    item.is_active
                      ? 'bg-neutral-50/80 dark:bg-neutral-800/50 border-indigo-200 dark:border-indigo-500/30'
                      : 'bg-neutral-50/40 dark:bg-neutral-900/40 border-neutral-200/70 dark:border-neutral-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-extrabold text-neutral-900 dark:text-white">
                          {item.title}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.is_active
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                          }`}
                        >
                          {item.is_active ? 'LIVE ON DASHBOARD' : 'PAUSED'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                        {item.message}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                        <span>{new Date(item.created_at).toLocaleString()}</span>
                        {item.action_label && (
                          <span className="text-indigo-500 font-semibold">
                            CTA: {item.action_label} ({item.action_tab})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        item.is_active
                          ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 hover:bg-amber-200/70'
                          : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200/70'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{item.is_active ? 'Pause' : 'Activate'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors cursor-pointer"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
