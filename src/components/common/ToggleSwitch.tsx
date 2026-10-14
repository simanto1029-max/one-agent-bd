import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'purple' | 'emerald' | 'blue' | 'pink';
  label?: string;
  labelPosition?: 'left' | 'right';
  description?: string;
  id?: string;
  className?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  color = 'purple',
  label,
  labelPosition = 'right',
  description,
  id,
  className = ''
}) => {
  const switchId = id || (label ? `toggle-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined);

  // Color variants
  const activeColorClasses = {
    purple: 'bg-gradient-to-r from-[#7F22FE] to-[#9333EA] shadow-purple-500/30',
    emerald: 'bg-emerald-500 shadow-emerald-500/30',
    blue: 'bg-[#1877F2] shadow-blue-500/30',
    pink: 'bg-gradient-to-r from-pink-500 to-rose-500 shadow-pink-500/30'
  }[color];

  // Size variants
  const sizeConfig = {
    sm: {
      track: 'w-7 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-3',
      baseTranslate: 'translate-x-0.5'
    },
    md: {
      track: 'w-9 h-5',
      thumb: 'w-4 h-4',
      translate: 'translate-x-4',
      baseTranslate: 'translate-x-0.5'
    },
    lg: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
      baseTranslate: 'translate-x-0.5'
    }
  }[size];

  const handleToggle = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-2 select-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      onClick={handleToggle}
    >
      {label && labelPosition === 'left' && (
        <div className="flex flex-col text-right">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </span>
          {description && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {description}
            </span>
          )}
        </div>
      )}

      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleToggle}
        className={`relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7F22FE] focus-visible:ring-offset-2 ${sizeConfig.track} ${
          checked
            ? `${activeColorClasses} shadow-sm`
            : 'bg-slate-200 dark:bg-slate-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block rounded-full bg-white shadow-md transform ring-0 transition duration-200 ease-in-out ${sizeConfig.thumb} ${
            checked ? sizeConfig.translate : sizeConfig.baseTranslate
          }`}
        />
      </button>

      {label && labelPosition === 'right' && (
        <div className="flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </span>
          {description && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
