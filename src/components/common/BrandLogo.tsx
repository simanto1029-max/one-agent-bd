import React, { useState, useEffect } from 'react';
import { api } from '../../api';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withBg?: boolean;
  overrideUrl?: string;
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-9 h-9',
  lg: 'w-11 h-11',
  xl: 'w-14 h-14'
};

const STORAGE_KEY = 'oneagentbd_custom_logo_url';
const EVENT_NAME = 'oneagentbd-logo-updated';

let globalCustomLogoUrl: string =
  typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) || '' : '';
let hasFetchedInitialLogo = false;
let isFetchingInitialLogo = false;

function syncFavicon(logoUrl: string) {
  if (typeof document === 'undefined') return;
  const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
  if (link) {
    link.href = logoUrl || '/logo.svg';
  }
}

export function notifyBrandLogoUpdated(newLogoUrl: string) {
  globalCustomLogoUrl = newLogoUrl || '';
  if (typeof window !== 'undefined') {
    if (globalCustomLogoUrl) {
      try {
        localStorage.setItem(STORAGE_KEY, globalCustomLogoUrl);
      } catch {
        // Ignore quota exceeded if huge 4K raw base64 exceeds localStorage, memory + server still hold it
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    syncFavicon(globalCustomLogoUrl);
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, { detail: { logoUrl: globalCustomLogoUrl } })
    );
  }
}

export function getActiveBrandLogoUrl(): string {
  return globalCustomLogoUrl;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
  withBg = false,
  overrideUrl
}) => {
  const uid = React.useId().replace(/:/g, '');
  const [customLogoUrl, setCustomLogoUrl] = useState<string>(globalCustomLogoUrl);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ logoUrl: string }>;
      setImgError(false);
      setCustomLogoUrl(customEvent.detail?.logoUrl ?? globalCustomLogoUrl);
    };

    window.addEventListener(EVENT_NAME, handleUpdate);

    if (!hasFetchedInitialLogo && !isFetchingInitialLogo) {
      isFetchingInitialLogo = true;
      api
        .getPublicSettings()
        .then((data) => {
          hasFetchedInitialLogo = true;
          isFetchingInitialLogo = false;
          const serverLogo = data?.logo_url || '';
          if (serverLogo !== globalCustomLogoUrl) {
            notifyBrandLogoUpdated(serverLogo);
          } else if (serverLogo) {
            syncFavicon(serverLogo);
          }
        })
        .catch(() => {
          isFetchingInitialLogo = false;
        });
    }

    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
    };
  }, []);

  const activeUrl = overrideUrl !== undefined ? overrideUrl : customLogoUrl;

  if (activeUrl && !imgError) {
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 select-none overflow-hidden ${
          withBg
            ? 'rounded-xl bg-white dark:bg-slate-900 shadow-2xs p-0.5'
            : ''
        } ${SIZE_CLASSES[size]} ${className}`}
      >
        <img
          src={activeUrl}
          alt="One Agent BD Logo"
          decoding="sync"
          loading="eager"
          draggable={false}
          onError={() => setImgError(true)}
          className="w-full h-full object-contain select-none"
        />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 select-none ${
        withBg
          ? 'rounded-xl bg-white dark:bg-slate-900 border border-violet-200/70 dark:border-violet-800/60 shadow-2xs p-0.5'
          : ''
      } ${SIZE_CLASSES[size]} ${className}`}
    >
      <svg
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="geometricPrecision"
        className="w-full h-full"
      >
        <defs>
          <linearGradient
            id={`topGrad_${uid}`}
            x1="256"
            y1="56"
            x2="256"
            y2="248"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="55%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>

          <linearGradient
            id={`leftGrad_${uid}`}
            x1="96"
            y1="240"
            x2="376"
            y2="430"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#9333EA" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>

          <linearGradient
            id={`rightGrad_${uid}`}
            x1="416"
            y1="240"
            x2="128"
            y2="430"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#9333EA" />
            <stop offset="45%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
        </defs>

        {/* 1. Top Rounded Diamond */}
        <path
          d="M 256 72 C 266 72, 276 80, 284 92 L 320 152 C 328 164, 325 180, 315 190 L 271 228 C 261 238, 251 238, 241 228 L 197 190 C 187 180, 184 164, 192 152 L 228 92 C 236 80, 246 72, 256 72 Z"
          stroke={`url(#topGrad_${uid})`}
          strokeWidth="42"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* 2. Under-passing Diagonal & Right Loop */}
        <path
          d="M 274 350 L 318 394 C 344 420, 386 417, 402 384 C 415 355, 397 307, 376 276 C 355 245, 315 245, 286 271"
          stroke={`url(#leftGrad_${uid})`}
          strokeWidth="42"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* 3. Left Loop & Over-crossing Center Ribbon */}
        <path
          d="M 238 314 L 220 296 C 194 271, 156 245, 130 276 C 110 307, 97 355, 110 384 C 126 417, 168 420, 194 394 L 292 296 C 318 271, 348 256, 371 276"
          stroke={`url(#rightGrad_${uid})`}
          strokeWidth="42"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
};
