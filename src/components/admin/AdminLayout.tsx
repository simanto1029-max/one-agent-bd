import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  CheckCircle2,
  Settings,
  ArrowLeft,
  Star,
  Megaphone
} from 'lucide-react';
import { AdminHeader } from './AdminHeader';
import { AdminOverview } from './AdminOverview';
import { AdminUsers } from './AdminUsers';
import { AdminPlans } from './AdminPlans';
import { AdminPayments } from './AdminPayments';
import { AdminReviews } from './AdminReviews';
import { AdminNotifications } from './AdminNotifications';
import { AdminSettings } from './AdminSettings';
import { api } from '../../api';
import { UserProfile, AdminOverviewStats } from '../../types';

interface AdminLayoutProps {
  user: UserProfile;
  isDark: boolean;
  onToggleTheme: () => void;
  onGoToDashboard: () => void;
  onSwitchRole?: (role: 'admin' | 'user') => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  user,
  isDark,
  onToggleTheme,
  onGoToDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'plans' | 'payments' | 'reviews' | 'notifications' | 'settings'>('overview');
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [pendingReviewsCount, setPendingReviewsCount] = useState<number>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [data, reviewsData] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminReviews().catch(() => ({ reviews: [] }))
      ]);
      setStats(data);
      if (Array.isArray(reviewsData?.reviews)) {
        setPendingReviewsCount(
          reviewsData.reviews.filter((r: any) => r.status === 'pending').length
        );
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users & Roles', icon: Users },
    { id: 'plans', label: 'Plans & Pricing', icon: CreditCard },
    {
      id: 'payments',
      label: 'Payments & Coupons',
      icon: CheckCircle2,
      badge: stats?.pendingPaymentsCount && stats.pendingPaymentsCount > 0 ? stats.pendingPaymentsCount : undefined
    },
    {
      id: 'reviews',
      label: 'Customer Reviews',
      icon: Star,
      badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined
    },
    {
      id: 'notifications',
      label: 'Broadcast Notices',
      icon: Megaphone
    },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors flex flex-col relative">
      <AdminHeader
        user={user}
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        onGoToDashboard={onGoToDashboard}
        onRefreshAll={loadStats}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
      />

      {/* Mobile Collapsible Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-15 bottom-0 z-30 flex flex-col">
          <div
            className="fixed inset-0 top-15 bg-black/50 backdrop-blur-2xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 max-h-[calc(100vh-64px)] overflow-y-auto bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-2xl p-3 space-y-2 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between px-2 pt-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                Admin Portal Menu
              </span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[11px] font-bold text-indigo-600 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive ? 'bg-white text-indigo-700' : 'bg-amber-500 text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onGoToDashboard();
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Open Dashboard</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 flex flex-col md:flex-row gap-6 sm:gap-8">
        {/* Desktop Sidebar Nav */}
        <aside className="hidden md:block w-64 shrink-0 space-y-2">
          <div className="p-3 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white text-indigo-700' : 'bg-amber-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={onGoToDashboard}
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Open Dashboard</span>
          </button>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 min-w-0">
          {activeTab === 'overview' && (
            <AdminOverview stats={stats} onNavigate={(tab) => setActiveTab(tab as any)} />
          )}
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'plans' && <AdminPlans />}
          {activeTab === 'payments' && <AdminPayments />}
          {activeTab === 'reviews' && <AdminReviews onReviewsChanged={loadStats} />}
          {activeTab === 'notifications' && <AdminNotifications />}
          {activeTab === 'settings' && <AdminSettings />}
        </main>
      </div>
    </div>
  );
};
