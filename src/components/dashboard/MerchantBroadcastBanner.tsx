import React, { useState, useEffect } from 'react';
import { Megaphone, Sparkles, AlertTriangle, Wrench, X, ArrowRight } from 'lucide-react';
import { api } from '../../api';
import { AdminNotification } from '../../types';

export const NOTIFICATIONS_UPDATED_EVENT = 'oneagentbd-notifications-updated';

export function notifyBroadcastsUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT));
  }
}

interface MerchantBroadcastBannerProps {
  onNavigateTab?: (tab: string) => void;
}

const DISMISSED_STORAGE_KEY = 'oneagentbd_dismissed_notices_v1';

export const MerchantBroadcastBanner: React.FC<MerchantBroadcastBannerProps> = ({
  onNavigateTab
}) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(DISMISSED_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const loadNotifications = async () => {
    try {
      const res = await api.getActiveNotifications();
      if (Array.isArray(res?.notifications)) {
        setNotifications(res.notifications);
      }
    } catch {
      // silent fallback
    }
  };

  useEffect(() => {
    loadNotifications();
    const handleRefresh = () => loadNotifications();
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleRefresh);
    return () => window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleRefresh);
  }, []);

  const handleDismiss = (id: string) => {
    const next = Array.from(new Set([...dismissedIds, id]));
    setDismissedIds(next);
    try {
      localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const visibleNotifications = notifications.filter(
    (n) => n.is_active && !dismissedIds.includes(n.id)
  );

  if (visibleNotifications.length === 0) return null;

  const getTheme = (type: AdminNotification['type']) => {
    switch (type) {
      case 'promo':
        return {
          container:
            'bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#6366F1] text-white border-purple-400/30 shadow-md shadow-purple-500/15',
          badge: 'bg-white/20 text-white border-white/25',
          button: 'bg-white text-[#7C3AED] hover:bg-purple-50',
          closeBtn: 'text-white/80 hover:text-white hover:bg-white/15',
          icon: Sparkles
        };
      case 'warning':
        return {
          container:
            'bg-amber-50 dark:bg-amber-950/60 text-amber-950 dark:text-amber-100 border-amber-300 dark:border-amber-500/40',
          badge: 'bg-amber-500 text-white border-amber-600',
          button: 'bg-amber-600 text-white hover:bg-amber-700',
          closeBtn: 'text-amber-700 dark:text-amber-300 hover:bg-amber-200/50 dark:hover:bg-amber-800/40',
          icon: AlertTriangle
        };
      case 'maintenance':
        return {
          container:
            'bg-rose-50 dark:bg-rose-950/60 text-rose-950 dark:text-rose-100 border-rose-300 dark:border-rose-500/40',
          badge: 'bg-rose-600 text-white border-rose-700',
          button: 'bg-rose-600 text-white hover:bg-rose-700',
          closeBtn: 'text-rose-700 dark:text-rose-300 hover:bg-rose-200/50 dark:hover:bg-rose-800/40',
          icon: Wrench
        };
      default:
        return {
          container:
            'bg-purple-50 dark:bg-[#191138] text-slate-900 dark:text-white border-purple-200 dark:border-purple-500/30',
          badge: 'bg-[#7C3AED] text-white border-purple-600',
          button: 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]',
          closeBtn: 'text-slate-500 dark:text-slate-300 hover:bg-purple-200/40 dark:hover:bg-white/10',
          icon: Megaphone
        };
    }
  };

  return (
    <div className="space-y-2.5 mb-5">
      {visibleNotifications.map((item) => {
        const theme = getTheme(item.type);
        const Icon = theme.icon;

        return (
          <div
            key={item.id}
            className={`relative rounded-2xl border px-4 py-3 sm:px-5 sm:py-3.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${theme.container}`}
          >
            <div className="flex items-start sm:items-center gap-3 min-w-0 pr-6 sm:pr-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${theme.badge}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm font-extrabold tracking-tight">
                    {item.title}
                  </span>
                </div>
                <p className="text-xs opacity-90 leading-relaxed mt-0.5 break-words">
                  {item.message}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {item.action_label && item.action_tab && onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab(item.action_tab!)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${theme.button}`}
                >
                  <span>{item.action_label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => handleDismiss(item.id)}
                title="Dismiss notice"
                aria-label="Dismiss notice"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${theme.closeBtn}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
