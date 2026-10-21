import React, { useState, useEffect, useRef } from 'react';
import { Plan } from '../../types';
import {
  OFFICIAL_THREE_PLANS,
  TRIAL_PLAN,
  PLAN_DURATION_OPTIONS,
  PlanDurationOption,
  calculateCustomPlanPrice,
  buildCustomizedPlan
} from '../../utils/pricingPlans';

interface PricingTableProps {
  onSelectPlan: (plan: Plan, action?: 'buy' | 'trial') => void;
}

export const PricingTable: React.FC<PricingTableProps> = ({ onSelectPlan }) => {
  const rootRef = useRef<HTMLElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Billing duration options matching user request (Month & Year selection)
  const durations: PlanDurationOption[] = PLAN_DURATION_OPTIONS;

  const [selectedDuration, setSelectedDuration] = useState<PlanDurationOption>(durations[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [priceMode, setPriceMode] = useState<'package' | 'monthly'>('package');

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ensure motion classes are active on mount
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.classList.add('in');
  }, []);

  // Card mouse spot effect (matching HTML exactly)
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  const handleSelect = (planType: 'trial' | 'advance' | 'business' | 'enterprise') => {
    if (planType === 'trial') {
      onSelectPlan(TRIAL_PLAN, 'trial');
    } else if (planType === 'advance') {
      const basePlan = OFFICIAL_THREE_PLANS[0];
      const customized = buildCustomizedPlan(basePlan, selectedDuration);
      onSelectPlan(customized, 'buy');
    } else if (planType === 'business') {
      const basePlan = OFFICIAL_THREE_PLANS[1];
      const customized = buildCustomizedPlan(basePlan, selectedDuration);
      onSelectPlan(customized, 'buy');
    } else {
      const basePlan = OFFICIAL_THREE_PLANS[2];
      const customized = buildCustomizedPlan(basePlan, selectedDuration);
      onSelectPlan(customized, 'buy');
    }
  };

  // Base plan prices
  const advanceBasePrice = 2499;
  const businessBasePrice = 4499;
  const enterpriseBasePrice = 8999;

  // Total and effective monthly prices for selected duration
  const advanceTotal = calculateCustomPlanPrice(advanceBasePrice, selectedDuration);
  const advanceMonthlyEffective = Math.round(advanceTotal / selectedDuration.months);

  const businessTotal = calculateCustomPlanPrice(businessBasePrice, selectedDuration);
  const businessMonthlyEffective = Math.round(businessTotal / selectedDuration.months);

  const enterpriseTotal = calculateCustomPlanPrice(enterpriseBasePrice, selectedDuration);
  const enterpriseMonthlyEffective = Math.round(enterpriseTotal / selectedDuration.months);

  const CK_ICON = (
    <svg className="ck" viewBox="0 0 18 18">
      <circle cx="9" cy="9" r="9" />
      <path d="M5.2 9.3l2.5 2.5 5-5.2" />
    </svg>
  );

  return (
    <section ref={rootRef} className="pr in" id="pricing">
      <style>{`
        @property --a {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        .pr {
          --ink: #0e1629;
          --muted: #5a6781;
          --violet: #7c3aed;
          position: relative;
          overflow: hidden;
          isolation: isolate;
          padding: clamp(48px, 6vw, 90px) clamp(16px, 4vw, 56px);
          background: linear-gradient(180deg, #fff, #faf8ff 40%, #f6f2ff);
          color: var(--ink);
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
          scroll-margin-top: 5rem;
          transition: background 0.3s, color 0.3s;
        }
        .dark .pr {
          --ink: #f8fafc;
          --muted: #94a3b8;
          background: linear-gradient(180deg, #090518, #100A28 40%, #090518);
        }
        .pr::before {
          content: "";
          position: absolute;
          left: 50%;
          top: -120px;
          width: min(900px, 120vw);
          aspect-ratio: 1;
          transform: translateX(-50%);
          background: radial-gradient(closest-side, rgba(124, 58, 237, 0.16), transparent);
          z-index: -1;
        }
        .dark .pr::before {
          background: radial-gradient(closest-side, rgba(168, 85, 247, 0.22), transparent);
        }
        .pr::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background-image: radial-gradient(rgba(124, 58, 237, 0.13) 1px, transparent 1px);
          background-size: 28px 28px;
          -webkit-mask-image: radial-gradient(ellipse 60% 45% at 50% 20%, #000, transparent 80%);
          mask-image: radial-gradient(ellipse 60% 45% at 50% 20%, #000, transparent 80%);
        }
        .dark .pr::after {
          background-image: radial-gradient(rgba(168, 85, 247, 0.16) 1px, transparent 1px);
        }
        .pr .head {
          text-align: center;
          max-width: 760px;
          margin: 0 auto;
        }
        .pr .badge {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 12.5px;
          font-weight: 700;
          color: #6d28d9;
          background: rgba(124, 58, 237, 0.07);
          border: 1px solid rgba(124, 58, 237, 0.22);
        }
        .dark .pr .badge {
          color: #c084fc;
          background: rgba(124, 58, 237, 0.2);
          border-color: rgba(168, 85, 247, 0.35);
        }
        .pr h2 {
          font-size: clamp(28px, 3.6vw, 46px);
          font-weight: 800;
          letter-spacing: -0.035em;
          line-height: 1.1;
          margin: 16px 0 12px;
          color: inherit;
        }
        .pr .head p {
          font-size: clamp(14px, 1.3vw, 16px);
          line-height: 1.65;
          color: var(--muted);
        }
        .pr .head small {
          display: block;
          margin-top: 10px;
          font-size: 12.5px;
          color: #7c3aed;
          font-weight: 700;
        }
        .dark .pr .head small {
          color: #a78bfa;
        }
        .pr .bill {
          position: relative;
          display: flex;
          justify-content: center;
          margin: 26px 0 42px;
          z-index: 30;
        }
        .pr .bill-wrapper {
          position: relative;
          display: inline-block;
        }
        .pr .bill-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 9px 16px;
          border-radius: 999px;
          background: #fff;
          border: 1px solid rgba(124, 58, 237, 0.25);
          box-shadow: 0 10px 26px -14px rgba(76, 29, 149, 0.4);
          font-size: 13px;
          font-weight: 600;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.2s;
          user-select: none;
        }
        .dark .pr .bill-btn {
          background: #170E38;
          border-color: rgba(168, 85, 247, 0.35);
          color: #cbd5e1;
          box-shadow: 0 10px 26px -14px rgba(0, 0, 0, 0.6);
        }
        .pr .bill-btn:hover {
          border-color: #7c3aed;
          transform: translateY(-1px);
        }
        .pr .bill-btn b {
          padding: 5px 14px;
          border-radius: 999px;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          background: linear-gradient(135deg, #8b3dff, #6d28d9);
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }
        .pr .dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          width: 280px;
          background: #ffffff;
          border: 1px solid rgba(124, 58, 237, 0.22);
          border-radius: 18px;
          box-shadow: 0 20px 50px -15px rgba(60, 20, 140, 0.35);
          padding: 8px;
          z-index: 60;
        }
        .dark .pr .dropdown-menu {
          background: #150D33;
          border-color: rgba(168, 85, 247, 0.35);
          box-shadow: 0 20px 50px -15px rgba(0, 0, 0, 0.85);
        }
        .pr .dropdown-item {
          width: 100%;
          padding: 10px 14px;
          border-radius: 12px;
          text-align: left;
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: transparent;
          border: 0;
          cursor: pointer;
          transition: all 0.15s;
        }
        .dark .pr .dropdown-item {
          color: #f1f5f9;
        }
        .pr .dropdown-item:hover {
          background: #f5f0ff;
          color: #7c3aed;
        }
        .dark .pr .dropdown-item:hover {
          background: #251652;
          color: #c084fc;
        }
        .pr .dropdown-item.active {
          background: #7c3aed;
          color: #ffffff;
        }
        .pr .grid {
          max-width: 1160px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(16px, 2vw, 28px);
          align-items: stretch;
        }
        .pr .card {
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 30px 26px 26px;
          border-radius: 30px;
          background: #fff;
          border: 1px solid rgba(14, 22, 41, 0.08);
          box-shadow: 0 30px 60px -36px rgba(60, 20, 140, 0.35);
          transition: box-shadow 0.35s, translate 0.35s, transform 0.35s, background 0.3s;
        }
        .dark .pr .card {
          background: #140D30;
          border-color: rgba(168, 85, 247, 0.2);
          box-shadow: 0 30px 60px -36px rgba(0, 0, 0, 0.6);
        }
        .pr .card:hover {
          translate: 0 -8px;
          box-shadow: 0 44px 80px -34px rgba(91, 33, 182, 0.5);
        }
        .dark .pr .card:hover {
          box-shadow: 0 44px 80px -34px rgba(168, 85, 247, 0.4);
        }
        .pr .spot {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s;
          background: radial-gradient(240px circle at var(--mx, 50%) var(--my, 0%), rgba(124, 58, 237, 0.12), transparent 70%);
        }
        .pr .card:hover .spot {
          opacity: 1;
        }
        .pr .pop {
          background: linear-gradient(180deg, #fff, #fbf8ff);
          box-shadow: 0 40px 90px -34px rgba(124, 58, 237, 0.65);
          z-index: 1;
        }
        .dark .pr .pop {
          background: linear-gradient(180deg, #1A1040, #140C32);
          box-shadow: 0 40px 90px -34px rgba(0, 0, 0, 0.8);
        }
        .pr .pop::before {
          content: "";
          position: absolute;
          inset: -1.5px;
          border-radius: 31px;
          padding: 2px;
          pointer-events: none;
          background: conic-gradient(from var(--a), #7c3aed, #d8c2ff, #6366f1, #a855f7, #7c3aed);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
          animation: spin 5s linear infinite;
        }
        @keyframes spin {
          to { --a: 360deg; }
        }
        .pr .tag {
          position: absolute;
          left: 50%;
          top: 0;
          translate: -50% -50%;
          padding: 6px 16px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 800;
          color: #fff;
          background: linear-gradient(135deg, #8b3dff, #5b3df0);
          box-shadow: 0 10px 22px -6px rgba(91, 61, 240, 0.7);
          overflow: hidden;
          white-space: nowrap;
          z-index: 2;
        }
        .pr .tag::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 30px;
          left: -40px;
          background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.7), transparent);
          transform: skewX(-20deg);
          animation: shine 3s ease-in-out 2s infinite;
        }
        @keyframes shine {
          0% { left: -40px; }
          50%, 100% { left: 130%; }
        }
        .pr .top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .pr .top h3 {
          font-size: 21px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: inherit;
        }
        .pr .free {
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          color: #475069;
          background: #eef0f6;
        }
        .dark .pr .free {
          background: #251B4D;
          color: #cbd5e1;
        }
        .pr .price {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-top: 14px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: inherit;
        }
        .pr .price strong {
          font-size: clamp(38px, 4vw, 48px);
          line-height: 1;
        }
        .pr .price em {
          font-style: normal;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0;
          color: #8b94ad;
        }
        .dark .pr .price em {
          color: #94a3b8;
        }
        .pr .sub {
          margin-top: 8px;
          font-size: 13px;
          color: var(--muted);
          font-weight: 500;
        }
        .pr .total-billed {
          margin-top: 6px;
          font-size: 12px;
          font-weight: 700;
          color: #7c3aed;
        }
        .dark .pr .total-billed {
          color: #c084fc;
        }
        .pr .btn {
          position: relative;
          overflow: hidden;
          display: block;
          margin-top: 20px;
          padding: 14px;
          border-radius: 14px;
          text-align: center;
          font: 700 14px inherit;
          font-family: inherit;
          text-decoration: none;
          transition: transform 0.25s, box-shadow 0.25s;
          cursor: pointer;
          border: 0;
          width: 100%;
          outline: none;
        }
        .pr .btn:hover {
          transform: translateY(-2px);
        }
        .pr .btn::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 50px;
          left: -70px;
          background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.5), transparent);
          transform: skewX(-20deg);
        }
        .pr .btn:hover::after {
          left: 120%;
          transition: left 0.7s;
        }
        .pr .b-light {
          color: #fff;
          background: linear-gradient(135deg, #4f46e5, #4338ca);
          box-shadow: 0 14px 28px -10px rgba(79, 70, 229, 0.5);
        }
        .pr .b-violet {
          color: #fff;
          background: linear-gradient(135deg, #8b3dff, #6d28d9);
          box-shadow: 0 18px 34px -12px rgba(109, 40, 217, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.35);
        }
        .pr .b-dark {
          color: #fff;
          background: linear-gradient(135deg, #1a2540, #0b1121);
          box-shadow: 0 18px 34px -12px rgba(11, 17, 33, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12);
        }
        .dark .pr .b-dark {
          background: linear-gradient(135deg, #7c3aed, #4c1d95);
        }
        .pr .fl {
          margin: 22px 0 14px;
          padding-top: 16px;
          border-top: 1px solid rgba(14, 22, 41, 0.08);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: #97a0b8;
        }
        .dark .pr .fl {
          border-top-color: rgba(168, 85, 247, 0.18);
          color: #a78bfa;
        }
        .pr ul {
          list-style: none;
          display: grid;
          gap: 12px;
          padding: 0;
          margin: 0;
        }
        .pr li {
          display: flex;
          gap: 11px;
          align-items: flex-start;
          font-size: 13px;
          line-height: 1.5;
          font-weight: 500;
          color: #2a3652;
          transition: transform 0.3s, opacity 0.3s;
        }
        .dark .pr li {
          color: #cbd5e1;
        }
        .pr li svg {
          flex: none;
          width: 18px;
          height: 18px;
          margin-top: 1px;
        }
        .pr .ck circle {
          fill: rgba(16, 185, 129, 0.14);
        }
        .pr .ck path {
          fill: none;
          stroke: #10b981;
          stroke-width: 2.2;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 14;
          stroke-dashoffset: 0;
        }
        @media (min-width: 901px) {
          .pr .pop {
            margin-top: -14px;
            margin-bottom: -14px;
            padding-top: 34px;
          }
        }
        @media (max-width: 900px) {
          .pr .grid {
            grid-template-columns: 1fr;
            max-width: 480px;
          }
          .pr .pop {
            order: -1;
            margin-top: 14px;
          }
        }
      `}</style>

      {/* Head section */}
      <div className="head">
        <span className="badge">Transparent Credit Pricing</span>
        <h2>Flexible packages for every business size. Start small, scale big.</h2>
        <p>
          Every plan includes <strong>100% Unlimited Facebook &amp; Instagram</strong> conversations. WhatsApp replies are covered by our built-in system credits—<strong>no foreign card required</strong>!
        </p>
        <small>
          Meta Cloud API direct connection &bull; 0% foreign card hassle &bull; 100% Autonomous AI Sales Agent
        </small>
      </div>

      {/* Billing Duration Dropdown Selector & Price Display Mode Switcher */}
      <div className="bill">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xl mx-auto">
          {/* Duration Dropdown Pill */}
          <div ref={dropdownRef} className="bill-wrapper">
            <button
              type="button"
              className="bill-btn"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              aria-expanded={isDropdownOpen}
              aria-label="Select billing duration"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="5" width="18" height="16" rx="3" />
                <path d="M8 3v4M16 3v4M3 10h18" />
              </svg>
              <span>Duration:</span>
              <b>{selectedDuration.label}</b>
              {selectedDuration.discountPercent > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Save {selectedDuration.discountPercent}%
                </span>
              )}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8b94ad"
                strokeWidth="2.4"
                strokeLinecap="round"
                style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {/* Interactive Dropdown Menu for Month / Year selection */}
            {isDropdownOpen && (
              <div className="dropdown-menu">
                {durations.map((dur) => (
                  <button
                    key={dur.id}
                    type="button"
                    className={`dropdown-item ${selectedDuration.id === dur.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedDuration(dur);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <span>{dur.label}</span>
                    {dur.discountPercent > 0 && (
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontWeight: 800,
                          backgroundColor: selectedDuration.id === dur.id ? 'rgba(255,255,255,0.25)' : '#dcfce7',
                          color: selectedDuration.id === dur.id ? '#ffffff' : '#15803d'
                        }}
                      >
                        Save {dur.discountPercent}%
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price View Mode Switcher */}
          <div className="inline-flex items-center p-1 rounded-full bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 text-xs font-bold">
            <button
              type="button"
              onClick={() => setPriceMode('package')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                priceMode === 'package'
                  ? 'bg-[#7c3aed] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-purple-600'
              }`}
            >
              📦 Total Package Price
            </button>
            <button
              type="button"
              onClick={() => setPriceMode('monthly')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                priceMode === 'monthly'
                  ? 'bg-[#7c3aed] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-purple-600'
              }`}
            >
              🗓️ Monthly Equivalent
            </button>
          </div>
        </div>
      </div>

      {/* Grid of 3 Main Paid Plans matching user request */}
      <div className="grid" id="grid">
        
        {/* 1. ADVANCE AI PLAN (৳2,499) */}
        <article
          className="card"
          onMouseMove={handleCardMouseMove}
        >
          <div className="spot" />
          <div className="top">
            <h3>Advance</h3>
            <span className="free">2,500 WA Messages</span>
          </div>

          <div className="price">
            {priceMode === 'package' ? (
              <>
                <strong>&#2547;{advanceTotal.toLocaleString('en-US')}</strong>
                <em>{selectedDuration.months === 1 ? '/ 30 days' : ` / ${selectedDuration.label}`}</em>
                {selectedDuration.discountPercent > 0 && (
                  <del className="text-xs text-slate-400 font-bold ml-1.5">
                    &#2547;{(advanceBasePrice * selectedDuration.months).toLocaleString('en-US')}
                  </del>
                )}
              </>
            ) : (
              <>
                <strong>&#2547;{selectedDuration.months === 1 ? advanceBasePrice.toLocaleString('en-US') : advanceMonthlyEffective.toLocaleString('en-US')}</strong>
                <em>/ month</em>
                {selectedDuration.discountPercent > 0 && (
                  <del className="text-xs text-slate-400 font-bold ml-1.5">&#2547;{advanceBasePrice.toLocaleString('en-US')}</del>
                )}
              </>
            )}
          </div>

          <div className="sub">Grow Your E-Commerce Business</div>
          {selectedDuration.months > 1 && (
            <div className="total-billed">
              {priceMode === 'package'
                ? `৳${advanceMonthlyEffective.toLocaleString('en-US')}/mo equivalent • Save ${selectedDuration.discountPercent}% (৳${(advanceBasePrice * selectedDuration.months - advanceTotal).toLocaleString('en-US')} saved)`
                : `Billed ৳${advanceTotal.toLocaleString('en-US')} for ${selectedDuration.label} • Save ${selectedDuration.discountPercent}%`}
            </div>
          )}

          <button
            type="button"
            onClick={() => handleSelect('advance')}
            className="btn b-light"
          >
            Choose Advance Plan
          </button>
          
          <div className="fl">INCLUDED FEATURES</div>
          <ul>
            {OFFICIAL_THREE_PLANS[0].features.map((f, k) => (
              <li key={k}>
                {CK_ICON}
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </article>

        {/* 2. BUSINESS AI PLAN (৳4,499) - MOST POPULAR */}
        <article
          className="card pop"
          onMouseMove={handleCardMouseMove}
        >
          <div className="spot" />
          <span className="tag">⭐ Most Popular</span>
          <div className="top">
            <h3>Business</h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              6,500 WA Messages
            </span>
          </div>

          <div className="price">
            {priceMode === 'package' ? (
              <>
                <strong>&#2547;{businessTotal.toLocaleString('en-US')}</strong>
                <em>{selectedDuration.months === 1 ? '/ 30 days' : ` / ${selectedDuration.label}`}</em>
                {selectedDuration.discountPercent > 0 && (
                  <del className="text-xs text-slate-400 font-bold ml-1.5">
                    &#2547;{(businessBasePrice * selectedDuration.months).toLocaleString('en-US')}
                  </del>
                )}
              </>
            ) : (
              <>
                <strong>&#2547;{selectedDuration.months === 1 ? businessBasePrice.toLocaleString('en-US') : businessMonthlyEffective.toLocaleString('en-US')}</strong>
                <em>/ month</em>
                {selectedDuration.discountPercent > 0 && (
                  <del className="text-xs text-slate-400 font-bold ml-1.5">&#2547;{businessBasePrice.toLocaleString('en-US')}</del>
                )}
              </>
            )}
          </div>

          <div className="sub">Scale Multichannel Operations</div>
          {selectedDuration.months > 1 && (
            <div className="total-billed">
              {priceMode === 'package'
                ? `৳${businessMonthlyEffective.toLocaleString('en-US')}/mo equivalent • Save ${selectedDuration.discountPercent}% (৳${(businessBasePrice * selectedDuration.months - businessTotal).toLocaleString('en-US')} saved)`
                : `Billed ৳${businessTotal.toLocaleString('en-US')} for ${selectedDuration.label} • Save ${selectedDuration.discountPercent}%`}
            </div>
          )}

          <button
            type="button"
            onClick={() => handleSelect('business')}
            className="btn b-violet"
          >
            Choose Business Plan
          </button>

          <div className="fl">INCLUDED FEATURES</div>
          <ul>
            {OFFICIAL_THREE_PLANS[1].features.map((f, k) => (
              <li key={k}>
                {CK_ICON}
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </article>

        {/* 3. ENTERPRISE AGENCY PLAN (৳8,999) */}
        <article
          className="card"
          onMouseMove={handleCardMouseMove}
        >
          <div className="spot" />
          <div className="top">
            <h3>Enterprise</h3>
            <span className="free">15,000 WA Messages</span>
          </div>

          <div className="price">
            {priceMode === 'package' ? (
              <>
                <strong>&#2547;{enterpriseTotal.toLocaleString('en-US')}</strong>
                <em>{selectedDuration.months === 1 ? '/ 30 days' : ` / ${selectedDuration.label}`}</em>
                {selectedDuration.discountPercent > 0 && (
                  <del className="text-xs text-slate-400 font-bold ml-1.5">
                    &#2547;{(enterpriseBasePrice * selectedDuration.months).toLocaleString('en-US')}
                  </del>
                )}
              </>
            ) : (
              <>
                <strong>&#2547;{selectedDuration.months === 1 ? enterpriseBasePrice.toLocaleString('en-US') : enterpriseMonthlyEffective.toLocaleString('en-US')}</strong>
                <em>/ month</em>
                {selectedDuration.discountPercent > 0 && (
                  <del className="text-xs text-slate-400 font-bold ml-1.5">&#2547;{enterpriseBasePrice.toLocaleString('en-US')}</del>
                )}
              </>
            )}
          </div>

          <div className="sub">Mega Volume &amp; Agency Automation</div>
          {selectedDuration.months > 1 && (
            <div className="total-billed">
              {priceMode === 'package'
                ? `৳${enterpriseMonthlyEffective.toLocaleString('en-US')}/mo equivalent • Save ${selectedDuration.discountPercent}% (৳${(enterpriseBasePrice * selectedDuration.months - enterpriseTotal).toLocaleString('en-US')} saved)`
                : `Billed ৳${enterpriseTotal.toLocaleString('en-US')} for ${selectedDuration.label} • Save ${selectedDuration.discountPercent}%`}
            </div>
          )}

          <button
            type="button"
            onClick={() => handleSelect('enterprise')}
            className="btn b-dark"
          >
            Choose Enterprise Plan
          </button>


          <div className="fl">INCLUDED FEATURES</div>
          <ul>
            {OFFICIAL_THREE_PLANS[2].features.map((f, k) => (
              <li key={k}>
                {CK_ICON}
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </article>

      </div>

      {/* Free Trial Banner below cards */}
      <div className="max-w-3xl mx-auto mt-12 p-5 rounded-2xl bg-white dark:bg-[#150E36] border border-purple-200 dark:border-purple-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>🚀 Want to test everything risk-free first?</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              2 Days Free Trial
            </span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Experience autonomous sales AI, 100 test WhatsApp replies, and unlimited Facebook &amp; Instagram with 0 credit card needed.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSelect('trial')}
          className="px-5 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900 border border-purple-200 dark:border-purple-800 font-bold text-xs shrink-0 cursor-pointer transition-colors"
        >
          Start 2-Day Free Trial &rarr;
        </button>
      </div>

    </section>
  );
};
