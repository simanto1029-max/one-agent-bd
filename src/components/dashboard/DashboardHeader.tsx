import React from 'react';
import { Shield, Globe, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { UserProfile, SubscriptionStatusInfo } from '../../types';

interface DashboardHeaderProps {
  user: UserProfile;
  subStatus: SubscriptionStatusInfo | null;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenWebhookTester?: () => void;
  onOpenTour?: () => void;
  onGoToLanding: () => void;
  onGoToAdmin: () => void;
  onLogout: () => void;
  onTimerExpire?: () => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  activeTabLabel?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  subStatus,
  isDark,
  onToggleTheme,
  onOpenTour,
  onGoToLanding,
  onGoToAdmin,
  onLogout,
  isMobileMenuOpen = false,
  onToggleMobileMenu,
  isSidebarCollapsed = false,
  onToggleSidebar,
  activeTabLabel
}) => {
  const creditsRemaining = subStatus?.whatsappCreditsRemaining ?? 2088;
  const creditsTotal = subStatus?.whatsappCreditsTotal ?? 2500;
  const creditsUsed = subStatus?.whatsappCreditsUsed ?? 412;
  const isLowCredits = creditsRemaining <= 200;
  return (
    <>
      <div className="h-14 sm:h-16 shrink-0" aria-hidden="true" />
      <header className="fixed top-0 left-0 right-0 z-40 w-full h-14 sm:h-16 bg-white/95 dark:bg-[#0F0A24]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-purple-500/15 transition-colors">
        <div className="h-full px-3 sm:px-6 flex items-center justify-between gap-2">
          {/* Left: Mobile Menu Toggle + Desktop Sidebar Collapse + Brand Logo + Current Section */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
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
              className="flex items-center gap-1.5 cursor-pointer group shrink-0"
              title="One Agent BD Workspace"
            >
              <span className="font-black text-[15px] sm:text-lg tracking-tight text-slate-900 dark:text-white whitespace-nowrap leading-none">
                One Agent <span className="text-[#7C3AED] dark:text-[#A78BFA]">BD</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2.5 pl-4 border-l border-slate-200 dark:border-purple-500/20 min-w-0">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Workspace</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                {activeTabLabel || 'Dashboard'}
              </span>
            </div>
          </div>

          {/* Right: Clean Actions (Never overlaps Brand Name on Mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Live WhatsApp AI Credit Quota Pill */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold transition-all ${
                isLowCredits
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                  : 'bg-purple-50 dark:bg-purple-950/60 border-purple-200/80 dark:border-purple-800/40 text-purple-900 dark:text-purple-200'
              }`}
              title={`WhatsApp Monthly Credits: ${creditsUsed.toLocaleString()} used of ${creditsTotal.toLocaleString()} (${creditsRemaining.toLocaleString()} remaining). Facebook & Instagram are 100% UNLIMITED.`}
            >
              <span className="flex h-2 w-2 relative">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isLowCredits ? 'bg-rose-400' : 'bg-emerald-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isLowCredits ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                />
              </span>
              <span className="font-mono text-[11px] font-black">
                {creditsRemaining.toLocaleString()}
              </span>
              <span className="hidden sm:inline text-[10px] text-slate-400 font-medium">
                / {creditsTotal.toLocaleString()} WA
              </span>
            </div>

            {/* A to Z Interactive Tour Guide Button */}
            {onOpenTour && (
              <button
                type="button"
                onClick={onOpenTour}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/60 dark:to-indigo-950/60 hover:from-purple-100 hover:to-indigo-100 text-[#7C3AED] dark:text-purple-300 border border-purple-200/80 dark:border-purple-500/30 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title="Restart A to Z Interactive Dashboard Tour"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span className="hidden sm:inline">Tour Guide</span>
              </button>
            )}

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
                className="flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                title="Return to Admin Portal"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

            {/* User Profile + Logout */}
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-200 dark:border-purple-500/20">
              <div className="hidden sm:flex w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#9333EA] text-white text-xs font-bold items-center justify-center shadow-xs shrink-0">
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
                className="p-2 text-slate-500 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 rounded-xl hover:bg-slate-100 dark:hover:bg-[#191138] transition-colors cursor-pointer"
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
