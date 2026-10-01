import React from 'react';
import { Sparkles, Clock, Shield, Globe, Activity, LogOut, Menu, X } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { CountdownTimer } from '../common/CountdownTimer';
import { BrandLogo } from '../common/BrandLogo';
import { UserProfile, SubscriptionStatusInfo } from '../../types';

interface DashboardHeaderProps {
  user: UserProfile;
  subStatus: SubscriptionStatusInfo | null;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenWebhookTester: () => void;
  onOpenTour?: () => void;
  onGoToLanding: () => void;
  onGoToAdmin: () => void;
  onLogout: () => void;
  onTimerExpire?: () => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
  activeTabLabel?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  subStatus,
  isDark,
  onToggleTheme,
  onOpenWebhookTester,
  onOpenTour,
  onGoToLanding,
  onGoToAdmin,
  onLogout,
  onTimerExpire,
  isMobileMenuOpen = false,
  onToggleMobileMenu,
  activeTabLabel
}) => {
  const isTrialing = subStatus?.subscription?.status === 'trialing';
  const isActive = subStatus?.subscription?.status === 'active';
  const isPending = subStatus?.subscription?.status === 'pending_approval';
  const endDate = subStatus?.subscription?.end_date;

  return (
    <>
      <div className="h-16 shrink-0" aria-hidden="true" />
      <header className="fixed top-0 left-0 right-0 z-40 w-full h-16 bg-white/95 dark:bg-[#0F0A24]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-purple-500/15 transition-colors">
        <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-3">
          {/* Left: Brand Logo + Mobile Menu + Current Section */}
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            {onToggleMobileMenu && (
              <button
                type="button"
                onClick={onToggleMobileMenu}
                aria-label="Toggle dashboard menu"
                className={`md:hidden p-2 rounded-xl border text-xs font-bold flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  isMobileMenuOpen
                    ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
                    : 'bg-slate-100 dark:bg-[#191138] text-slate-800 dark:text-slate-100 border-slate-200 dark:border-purple-500/20'
                }`}
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            )}

            <div
              onClick={onGoToLanding}
              className="flex items-center gap-2.5 cursor-pointer group shrink-0"
              title="Back to Main Website"
            >
              <BrandLogo size="sm" />
              <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                One Agent <span className="text-[#7C3AED] dark:text-[#A78BFA]">BD</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2.5 pl-4 border-l border-slate-200 dark:border-purple-500/20">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Workspace</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                {activeTabLabel || 'Dashboard'}
              </span>
            </div>
          </div>

          {/* Right: Clean Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Website Link */}
            <button
              onClick={onGoToLanding}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#191138] transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Website</span>
            </button>

            {/* Admin Portal Switch */}
            {user.role === 'admin' && (
              <button
                onClick={onGoToAdmin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
                title="Return to Admin Portal"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

            {/* User Profile + Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-purple-500/20">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#9333EA] text-white text-xs font-bold flex items-center justify-center shadow-xs shrink-0">
                {(user.full_name || user.email || 'M').charAt(0).toUpperCase()}
              </div>
              <div className="hidden xl:block text-left max-w-[130px]">
                <span className="block text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
                  {user.full_name || 'Merchant'}
                </span>
                <span className="block text-[10px] text-slate-400 truncate leading-tight">
                  {user.email}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-slate-100 dark:hover:bg-[#191138] transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
