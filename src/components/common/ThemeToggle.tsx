import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle, className = '' }) => {
  return (
    <button
      id="theme-toggle-btn"
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={onToggle}
      className={`inline-flex items-center justify-center px-3.5 py-2 rounded-full border transition-all duration-200 cursor-pointer select-none shrink-0 ${
        isDark
          ? 'bg-[#150E30] border-white/15 hover:border-purple-400/50 text-purple-200 shadow-xs'
          : 'bg-slate-100/90 border-slate-200/90 hover:border-purple-400/50 text-slate-700 shadow-2xs'
      } ${className}`}
      title={isDark ? 'Black Theme চালু আছে — White করতে ক্লিক করুন' : 'White Theme চালু আছে — Black করতে ক্লিক করুন'}
      aria-label="Toggle between White and Black theme"
    >
      {isDark ? (
        <Moon className="w-4 h-4 text-purple-200" />
      ) : (
        <Sun className="w-4 h-4 text-amber-500" />
      )}
    </button>
  );
};
