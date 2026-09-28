import React, { useState } from 'react';
import { Mail, HeartHandshake } from 'lucide-react';
import { LegalModal } from '../common/LegalModal';
import { BrandLogo } from '../common/BrandLogo';

interface FooterProps {
  onOpenAuth: () => void;
}

const FACEBOOK_URL = 'https://www.facebook.com/OneAgentBD';
const WHATSAPP_URL = 'https://wa.me/8801601705804';
const EMAIL_URL = 'mailto:support.oneagentbd@gmail.com';

export const Footer: React.FC<FooterProps> = () => {
  const resolveUrlLegalTab = (): { open: boolean; tab: 'privacy' | 'terms' } => {
    if (typeof window === 'undefined') return { open: false, tab: 'privacy' };
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const params = new URLSearchParams(window.location.search);
    const legalParam = (params.get('legal') || '').toLowerCase();

    if (path.includes('terms') || hash.includes('terms') || legalParam === 'terms') {
      return { open: true, tab: 'terms' };
    }
    if (
      path.includes('privacy') ||
      path.includes('data-deletion') ||
      hash.includes('privacy') ||
      legalParam === 'privacy'
    ) {
      return { open: true, tab: 'privacy' };
    }
    return { open: false, tab: 'privacy' };
  };

  const [legalModalOpen, setLegalModalOpen] = useState<boolean>(() => resolveUrlLegalTab().open);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms'>(() => resolveUrlLegalTab().tab);

  React.useEffect(() => {
    const syncFromUrl = () => {
      const state = resolveUrlLegalTab();
      if (state.open) {
        setLegalTab(state.tab);
        setLegalModalOpen(true);
      }
    };
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    window.addEventListener('hashchange', syncFromUrl);
    return () => {
      window.removeEventListener('popstate', syncFromUrl);
      window.removeEventListener('hashchange', syncFromUrl);
    };
  }, []);

  const openLegal = (tab: 'privacy' | 'terms') => {
    setLegalTab(tab);
    setLegalModalOpen(true);
    try {
      window.history.pushState({}, '', tab === 'terms' ? '/terms' : '/privacy');
    } catch {}
  };

  const closeLegal = () => {
    setLegalModalOpen(false);
    try {
      if (window.location.pathname.includes('privacy') || window.location.pathname.includes('terms')) {
        window.history.pushState({}, '', '/');
      }
    } catch {}
  };

  return (
    <footer className="bg-white dark:bg-[#080518] py-12 sm:py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Single ChatMakky-Style Rounded Card Aligned Full-Width with Header */}
        <div className="w-full rounded-[28px] bg-slate-50/90 dark:bg-[#110C24] border border-slate-200/80 dark:border-white/[0.07] p-7 sm:p-10 lg:p-12 shadow-xl shadow-purple-950/5">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
            {/* Column 1: Brand + Tagline + FOLLOW US Horizontal Logo Circles */}
            <div className="max-w-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <BrandLogo size="md" />
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                  One Agent <span className="text-[#7C3AED]">BD</span>
                </span>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Simple AI support for chats, leads, and sales.
              </p>

              <div className="pt-1 space-y-3">
                <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  FOLLOW US
                </span>

                {/* Horizontal Circular Icons Only (No Text) */}
                <div className="flex items-center gap-2.5">
                  <a
                    href={FACEBOOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook Page"
                    title="Facebook Page"
                    className="w-10 h-10 rounded-full bg-[#1877F2] hover:bg-[#166FE5] text-white flex items-center justify-center shadow-sm hover:scale-105 transition-all"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  </a>

                  <a
                    href={EMAIL_URL}
                    aria-label="Email Support"
                    title="Email Support"
                    className="w-10 h-10 rounded-full bg-[#1DA1F2] hover:bg-[#0D8ECF] text-white flex items-center justify-center shadow-sm hover:scale-105 transition-all"
                  >
                    <Mail className="w-4 h-4" />
                  </a>

                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp Support"
                    title="WhatsApp Support"
                    className="w-10 h-10 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white flex items-center justify-center shadow-sm hover:scale-105 transition-all"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 2c-5.516 0-9.999 4.486-9.999 10.001 0 1.766.461 3.489 1.338 5.012L2 22l5.118-1.341c1.477.805 3.141 1.23 4.911 1.23h.004c5.515 0 9.998-4.486 9.998-10.001 0-2.672-1.04-5.184-2.928-7.073C17.214 3.04 14.703 2 12.031 2zm5.826 14.12c-.244.687-1.425 1.314-1.976 1.397-.505.075-1.144.107-1.846-.116-.426-.135-.974-.316-1.678-.62-2.953-1.275-4.881-4.249-5.029-4.446-.147-.197-1.2-1.596-1.2-3.045 0-1.449.759-2.161 1.029-2.456.27-.295.589-.369.785-.369.196 0 .392.002.564.01.181.009.424-.069.663.507.245.59.834 2.039.908 2.186.074.147.123.319.025.516-.098.197-.147.319-.295.491-.147.172-.31.384-.442.516-.147.147-.301.307-.129.602.172.295.763 1.259 1.639 2.04 1.126 1.004 2.075 1.315 2.37 1.462.295.147.466.123.638-.074.172-.197.736-.86.933-1.155.196-.295.392-.246.662-.147.27.098 1.718.81 2.012.958.295.147.491.221.565.344.073.123.073.712-.171 1.399z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Column 2: PRODUCT */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                PRODUCT
              </h4>
              <ul className="space-y-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                <li>
                  <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                    Channels
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: COMPANY & LEGAL */}
            <div className="space-y-7">
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  COMPANY
                </h4>
                <ul className="space-y-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <li>
                    <button
                      type="button"
                      onClick={() => openLegal('privacy')}
                      className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      Privacy policy
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => openLegal('terms')}
                      className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      Terms of service
                    </button>
                  </li>
                  <li>
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      Contact
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  LEGAL
                </h4>
                <ul className="space-y-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <li>
                    <button
                      type="button"
                      onClick={() => openLegal('privacy')}
                      className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      Privacy policy
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => openLegal('terms')}
                      className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      Terms of service
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Column 4: ChatMakky-Style Right Inner Boxed Card (Horizontal Logos Only, No Text Links) */}
            <div className="w-full sm:w-auto lg:min-w-[280px]">
              <div className="rounded-2xl bg-white dark:bg-[#15102C] border border-slate-200/90 dark:border-white/[0.08] p-5 space-y-4">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08]">
                  OFFICIAL SUPPORT
                </span>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-[#25184E] text-[#7C3AED] dark:text-purple-400 flex items-center justify-center shrink-0">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                      One Agent BD
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Official support in Bangladesh
                    </p>
                  </div>
                </div>

                {/* Horizontal Circular Icons Only (Exact ChatMakky Style) */}
                <div className="flex items-center gap-2.5 pt-1">
                  <a
                    href={FACEBOOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook Page"
                    title="Facebook Page"
                    className="w-9 h-9 rounded-full bg-[#1877F2] hover:bg-[#166FE5] text-white flex items-center justify-center shadow-xs hover:scale-105 transition-all"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  </a>

                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp Support"
                    title="WhatsApp Support"
                    className="w-9 h-9 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white flex items-center justify-center shadow-xs hover:scale-105 transition-all"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 2c-5.516 0-9.999 4.486-9.999 10.001 0 1.766.461 3.489 1.338 5.012L2 22l5.118-1.341c1.477.805 3.141 1.23 4.911 1.23h.004c5.515 0 9.998-4.486 9.998-10.001 0-2.672-1.04-5.184-2.928-7.073C17.214 3.04 14.703 2 12.031 2zm5.826 14.12c-.244.687-1.425 1.314-1.976 1.397-.505.075-1.144.107-1.846-.116-.426-.135-.974-.316-1.678-.62-2.953-1.275-4.881-4.249-5.029-4.446-.147-.197-1.2-1.596-1.2-3.045 0-1.449.759-2.161 1.029-2.456.27-.295.589-.369.785-.369.196 0 .392.002.564.01.181.009.424-.069.663.507.245.59.834 2.039.908 2.186.074.147.123.319.025.516-.098.197-.147.319-.295.491-.147.172-.31.384-.442.516-.147.147-.301.307-.129.602.172.295.763 1.259 1.639 2.04 1.126 1.004 2.075 1.315 2.37 1.462.295.147.466.123.638-.074.172-.197.736-.86.933-1.155.196-.295.392-.246.662-.147.27.098 1.718.81 2.012.958.295.147.491.221.565.344.073.123.073.712-.171 1.399z" />
                    </svg>
                  </a>

                  <a
                    href={EMAIL_URL}
                    aria-label="Email Support"
                    title="Email Support"
                    className="w-9 h-9 rounded-full bg-[#1DA1F2] hover:bg-[#0D8ECF] text-white flex items-center justify-center shadow-xs hover:scale-105 transition-all"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Divider & Copyright inside the Card */}
          <div className="mt-10 pt-6 border-t border-slate-200/80 dark:border-white/[0.06] text-center text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} One Agent BD. All rights reserved.
          </div>
        </div>
      </div>

      <LegalModal
        isOpen={legalModalOpen}
        onClose={closeLegal}
        defaultTab={legalTab}
      />
    </footer>
  );
};
