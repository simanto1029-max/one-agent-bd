import React, { useState } from 'react';
import { Shield, LayoutDashboard, Clock, ArrowRight, Menu, X } from 'lucide-react';
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
            One Agent <span className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] bg-clip-text text-transparent">BD</span>
          </span>
        </button>

        {/* Navigation Links (Desktop) */}
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
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
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
                className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-full bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white text-xs sm:text-sm font-bold border border-purple-300/30 shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_26px_rgba(168,85,247,0.6)] flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
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
                className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-full bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white text-xs sm:text-sm font-bold border border-purple-300/30 shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_26px_rgba(168,85,247,0.6)] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <span className="sm:hidden">Get Started</span>
                <span className="hidden sm:inline">Get Started Free</span>
                <ArrowRight className="w-3.5 h-3.5 hidden sm:inline shrink-0" />
              </button>
            </div>
          )}

          {/* Mobile Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setMobileNavOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className={`md:hidden p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
              mobileNavOpen
                ? 'bg-[#673DE6] text-white border-[#673DE6]'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsible Mobile Dropdown Menu */}
      {mobileNavOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3.5 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-3 gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMobileNavOpen(false);
                scrollToSection('features');
              }}
              className="text-left px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-[#673DE6] cursor-pointer"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileNavOpen(false);
                scrollToSection('pricing');
              }}
              className="text-left px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-[#673DE6] cursor-pointer"
            >
              Pricing & Plans
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileNavOpen(false);
                scrollToSection('faq');
              }}
              className="text-left px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-[#673DE6] cursor-pointer"
            >
              FAQ
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            {currentUser ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileNavOpen(false);
                    onGoToDashboard();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#673DE6] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Open Dashboard</span>
                </button>
                {currentUser.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileNavOpen(false);
                      onGoToAdmin();
                    }}
                    className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#673DE6]" />
                    <span>Admin</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileNavOpen(false);
                    onOpenAuth('login');
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileNavOpen(false);
                    onOpenAuth('signup');
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#673DE6] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Start 2-Day Free Trial</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
      </header>
    </>
  );
};
