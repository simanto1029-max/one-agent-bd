import React from 'react';
import { Shield, LayoutDashboard, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { UserProfile, SubscriptionStatusInfo } from '../../types';

interface NavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  currentUser: UserProfile | null;
  subStatus: SubscriptionStatusInfo | null;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onGoToDashboard: () => void;
  onGoToAdmin: () => void;
  onGoToLanding?: () => void;
  onGoToDemo?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDark,
  onToggleTheme,
  currentUser,
  onOpenAuth,
  onGoToDashboard,
  onGoToAdmin,
  onGoToLanding,
  onGoToDemo
}) => {
  const scrollToSection = (sectionId?: string) => {
    if (typeof window === 'undefined') return;

    if (onGoToLanding) {
      onGoToLanding();
      // Allow slight delay if view was not landing
      setTimeout(() => {
        if (!sectionId) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
      return;
    }

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
      {/* Spacer so page content starts cleanly below the floating navbar */}
      <div className="h-20 sm:h-22 shrink-0" aria-hidden="true" />

      {/* Floating Header: elevated position, 10px corner radius, taller height, subtle soft shadow */}
      <div className="fixed top-2 sm:top-2.5 left-0 right-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none">
        <header className="pointer-events-auto w-full max-w-6xl rounded-[10px] bg-white/90 dark:bg-[#0D0826]/90 backdrop-blur-xl border border-slate-200/90 dark:border-purple-500/25 shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] px-4 sm:px-7 py-3.5 sm:py-4 flex items-center justify-between gap-4 transition-all">
          
          {/* Brand Wordmark (Clean typography, logo removed as requested) */}
          <button
            type="button"
            onClick={() => {
              if (onGoToLanding) {
                onGoToLanding();
              } else {
                scrollToSection();
              }
            }}
            className="group focus:outline-hidden shrink-0 cursor-pointer text-left flex items-center"
          >
            <span className="font-black text-xl sm:text-2xl tracking-tight text-slate-900 dark:text-white leading-none whitespace-nowrap">
              One Agent <span className="text-[#7C3AED] dark:text-[#A855F7]">BD</span>
            </span>
          </button>

          {/* Navigation Links: Demo, Features, Pricing */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => {
                if (onGoToDemo) {
                  onGoToDemo();
                } else if (typeof window !== 'undefined') {
                  window.location.href = '/demo';
                }
              }}
              className="text-slate-600 dark:text-slate-300 hover:text-[#7C3AED] dark:hover:text-white transition-colors cursor-pointer"
            >
              Demo
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="text-slate-600 dark:text-slate-300 hover:text-[#7C3AED] dark:hover:text-white transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('pricing')}
              className="text-slate-600 dark:text-slate-300 hover:text-[#7C3AED] dark:hover:text-white transition-colors cursor-pointer"
            >
              Pricing
            </button>
          </nav>

          {/* Right Actions - Theme toggle, Sign In & Register button */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

            {currentUser ? (
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {currentUser.role === 'admin' && (
                  <button
                    onClick={onGoToAdmin}
                    className="hidden sm:flex px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 border border-slate-200 dark:border-white/15 text-slate-800 dark:text-white text-xs font-bold items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>Admin</span>
                  </button>
                )}
                <button
                  onClick={onGoToDashboard}
                  className="px-5 sm:px-6 py-2.5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-600/25 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                  <span>Dashboard</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="hidden sm:inline-flex px-3 py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-[#7C3AED] dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-5 sm:px-6 py-2.5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>Register</span>
                  <ArrowRight className="w-3.5 h-3.5 hidden sm:inline shrink-0" />
                </button>
              </div>
            )}
          </div>
        </header>
      </div>
    </>
  );
};
