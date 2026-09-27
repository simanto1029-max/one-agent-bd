import React from 'react';
import { RefreshCw, LayoutDashboard, Menu, X } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { BrandLogo } from '../common/BrandLogo';
import { UserProfile } from '../../types';

interface AdminHeaderProps {
  user: UserProfile;
  isDark: boolean;
  onToggleTheme: () => void;
  onGoToDashboard: () => void;
  onRefreshAll: () => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  user,
  isDark,
  onToggleTheme,
  onGoToDashboard,
  onRefreshAll,
  isMobileMenuOpen = false,
  onToggleMobileMenu
}) => {
  return (
    <>
      <div className="h-15 sm:h-16 shrink-0" aria-hidden="true" />
      <header className="fixed top-0 left-0 right-0 z-40 w-full bg-neutral-900/95 backdrop-blur-xl border-b border-neutral-800 text-white shadow-2xs">
      <div className="px-3 sm:px-6 lg:px-8 h-15 sm:h-16 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className={`md:hidden px-2.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                isMobileMenuOpen
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-neutral-800 text-neutral-100 border-neutral-700 hover:bg-neutral-700'
              }`}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <span>Menu</span>
            </button>
          )}

          <div className="flex items-center gap-2.5 min-w-0">
            <BrandLogo size="sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight truncate">
                  One Agent <span className="text-violet-400">BD</span>
                </span>
                <span className="hidden xs:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Admin
                </span>
              </div>
              <span className="block text-[10px] text-neutral-400 truncate">
                Super Admin Portal
              </span>
            </div>
          </div>

          <button
            id="admin-to-merchant-app-btn"
            onClick={onGoToDashboard}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-neutral-300 hover:text-white px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-colors cursor-pointer"
            title="Switch to Merchant Dashboard"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-violet-400" />
            <span>Open Dashboard</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={onRefreshAll}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <div className="hidden md:block px-3 py-1 rounded-xl bg-indigo-950/60 border border-indigo-800/80 text-indigo-300 text-xs font-semibold">
            {user.email}
          </div>

          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </div>
      </div>
      </header>
    </>
  );
};
