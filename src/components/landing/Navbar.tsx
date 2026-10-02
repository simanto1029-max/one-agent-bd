import React from 'react';
import { Shield, LayoutDashboard, Clock, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { CountdownTimer } from '../common/CountdownTimer';
import { BrandLogo } from '../common/BrandLogo';
import { UserProfile, SubscriptionStatusInfo } from '../../types';

interface NavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  currentUser: UserProfile | null;
  subStatus: SubscriptionStatusInfo | null;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onGoToDashboard: () => void;
  onGoToAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDark,
  onToggleTheme,
  currentUser,
  subStatus,
  onOpenAuth,
  onGoToDashboard,
  onGoToAdmin
}) => {
  const scrollToSection = (sectionId?: string) => {
    if (typeof window === 'undefined') return;
    if (window.location.href.includes('#')) {
      try {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch {}
    }
    if (!sectionId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="h-16 sm:h-[68px] shrink-0" aria-hidden="true" />
      <header className="fixed top-0 left-0 right-0 z-40 w-full backdrop-blur-xl bg-white/95 dark:bg-[#0B0720]/90 border-b border-slate-200/80 dark:border-purple-500/15 shadow-2xs transition-colors">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 sm:h-[68px] flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => scrollToSection()}
            className="flex items-center gap-2 sm:gap-2.5 group focus:outline-hidden shrink-0 cursor-pointer"
          >
            <BrandLogo size="md" />
            <span className="font-black text-lg sm:text-2xl tracking-tight text-slate-900 dark:text-white leading-none whitespace-nowrap">
              One Agent{' '}
              <span className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] bg-clip-text text-transparent">
                BD
              </span>
            </span>
          </button>

          {/* Navigation Links (Desktop Only — Mobile Menu Removed for Clean Mobile Header) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="hover:text-[#8B5CF6] dark:hover:text-white transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('pricing')}
              className="hover:text-[#8B5CF6] dark:hover:text-white transition-colors cursor-pointer"
            >
              Pricing
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('faq')}
              className="hover:text-[#8B5CF6] dark:hover:text-white transition-colors cursor-pointer"
            >
              FAQ
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

            {currentUser && subStatus && (
              <div className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-full bg-violet-50 dark:bg-[#150E30] border border-violet-200 dark:border-purple-500/30 text-xs font-semibold text-[#673DE6] dark:text-purple-200 whitespace-nowrap">
                <Clock className="w-3.5 h-3.5 text-[#8B5CF6]" />
                {subStatus.subscription?.status === 'trialing' && subStatus.subscription?.end_date ? (
                  <span className="flex items-center gap-1">
                    <span>Trial:</span>
                    <CountdownTimer targetDate={subStatus.subscription.end_date} />
                  </span>
                ) : subStatus.subscription?.status === 'active' && subStatus.subscription?.end_date ? (
                  <span className="flex items-center gap-1">
                    <span>Active:</span>
                    <CountdownTimer targetDate={subStatus.subscription.end_date} />
                  </span>
                ) : (
                  <span>Expired</span>
                )}
              </div>
            )}

            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                {currentUser.role === 'admin' && (
                  <button
                    onClick={onGoToAdmin}
                    className="hidden sm:flex px-4 py-2 rounded-full bg-slate-100 dark:bg-[#150E30] hover:bg-slate-200 dark:hover:bg-[#1E1442] border border-slate-200 dark:border-white/15 text-slate-800 dark:text-white text-xs font-bold items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    <span>Admin</span>
                  </button>
                )}
                <button
                  onClick={onGoToDashboard}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white text-xs sm:text-sm font-bold border border-purple-300/30 shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_26px_rgba(168,85,247,0.6)] flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                  <span>Dashboard</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="hidden sm:inline-flex px-5 py-2 rounded-full bg-slate-100/80 dark:bg-[#150E30] hover:bg-slate-200/70 dark:hover:bg-[#1E1442] border border-slate-200/90 dark:border-white/15 hover:border-purple-400/50 text-xs sm:text-sm font-bold text-slate-800 dark:text-white transition-all cursor-pointer whitespace-nowrap"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white text-xs sm:text-sm font-bold border border-purple-300/30 shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_26px_rgba(168,85,247,0.6)] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span className="sm:hidden">Get Started</span>
                  <span className="hidden sm:inline">Get Started Free</span>
                  <ArrowRight className="w-3.5 h-3.5 hidden sm:inline shrink-0" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
