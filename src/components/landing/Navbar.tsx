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
      <div className="h-16 sm:h-[72px] shrink-0" aria-hidden="true" />
      <header className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-xl bg-[#090C15]/95 dark:bg-[#06080F]/95 border-b border-white/10 shadow-sm transition-colors text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-4">
          {/* Brand Logo - LazyChat style clean branding */}
          <button
            type="button"
            onClick={() => scrollToSection()}
            className="flex items-center gap-2.5 sm:gap-3 group focus:outline-hidden shrink-0 cursor-pointer"
          >
            <BrandLogo size="md" />
            <span className="font-bold text-lg sm:text-xl tracking-tight text-white leading-none whitespace-nowrap">
              One Agent <span className="text-[#8B5CF6]">BD</span>
            </span>
          </button>

          {/* Navigation Links - Exact LazyChat: Solutions, Features, Pricing, Learn */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-[14px] font-medium text-slate-300">
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Solutions
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('pricing')}
              className="text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Pricing
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('faq')}
              className="text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Learn
            </button>
          </nav>

          {/* Right Actions - LazyChat style: Book a live demo / Dashboard */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

            {currentUser ? (
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {currentUser.role === 'admin' && (
                  <button
                    onClick={onGoToAdmin}
                    className="hidden sm:flex px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    <span>Admin</span>
                  </button>
                )}
                <button
                  onClick={onGoToDashboard}
                  className="px-5 sm:px-6 py-2.5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                  <span>Dashboard</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="hidden sm:inline-flex px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  Sign In
                </button>
                {/* LazyChat's Signature "Book a live demo" Pill Button */}
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-5 sm:px-6 py-2.5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>Book a live demo</span>
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
