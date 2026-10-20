import React, { useState, useEffect, useRef } from 'react';
import { Plan } from '../../types';
import {
  OFFICIAL_THREE_PLANS,
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
  const durations: PlanDurationOption[] = [
    PLAN_DURATION_OPTIONS[0], // 1 Month
    PLAN_DURATION_OPTIONS[2] || { id: '3m', label: '3 Months', shortLabel: '3M', type: 'monthly' as const, months: 3, days: 90, discountPercent: 5, badge: 'Save 5%' },
    PLAN_DURATION_OPTIONS[3] || { id: '6m', label: '6 Months', shortLabel: '6M', type: 'monthly' as const, months: 6, days: 180, discountPercent: 10, badge: 'Save 10%' },
    PLAN_DURATION_OPTIONS[4] || { id: '1y', label: '1 Year (12 Months)', shortLabel: '1Y', type: 'yearly' as const, months: 12, days: 365, discountPercent: 15, badge: 'Save 15%' },
    PLAN_DURATION_OPTIONS[5] || { id: '2y', label: '2 Years (24 Months)', shortLabel: '2Y', type: 'yearly' as const, months: 24, days: 730, discountPercent: 20, badge: 'Save 20%' }
  ];

  const [selectedDuration, setSelectedDuration] = useState<PlanDurationOption>(durations[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  const handleSelect = (planType: 'trial' | 'starter' | 'pro') => {
    if (planType === 'trial') {
      const trialPlan = OFFICIAL_THREE_PLANS[0];
      onSelectPlan(trialPlan, 'trial');
    } else if (planType === 'starter') {
      const baseStarter = OFFICIAL_THREE_PLANS[1];
      const customized = buildCustomizedPlan(baseStarter, selectedDuration);
      onSelectPlan(customized, 'buy');
    } else {
      const basePro = OFFICIAL_THREE_PLANS[2];
      const customized = buildCustomizedPlan(basePro, selectedDuration);
      onSelectPlan(customized, 'buy');
    }
  };

  // Pricing calculations
  const starterBasePrice = 1250;
  const proBasePrice = 1950;

  const starterTotalPrice = calculateCustomPlanPrice(starterBasePrice, selectedDuration);
  const starterMonthlyEffective = Math.round(starterTotalPrice / selectedDuration.months);

  const proTotalPrice = calculateCustomPlanPrice(proBasePrice, selectedDuration);
  const proMonthlyEffective = Math.round(proTotalPrice / selectedDuration.months);

  // Features list matching HTML exactly
  const basicFeatures = [
    { text: 'Facebook Unlimited conversations', lock: false },
    { text: 'Instagram Unlimited conversations', lock: false },
    { text: 'WhatsApp Unlimited conversations (Locked in 2-day trial)', lock: true },
    { text: '1 AI business agent', lock: false },
    { text: 'Bangla voice note & photo AI', lock: false },
    { text: 'Auto comment & inbox reply', lock: false },
    { text: '1-Click courier booking (Steadfast & Pathao)', lock: false },
    { text: 'Unified team inbox', lock: false },
    { text: 'Standard AI reply speed', lock: false }
  ];

  const starterFeatures = [
    { text: '24/7 Active AI Sales & Auto-Reply Agent (Up to 3 Channels)', lock: false },
    { text: '1-Click Steadfast, Pathao & RedX Courier Dispatch', lock: false },
    { text: 'AI Auto Customer Fraud & Courier Delivery Ratio Check', lock: false },
    { text: 'AI Auto Delivery Tracking & Customer Live Status Update', lock: false },
    { text: 'VIP Customer Retargeting & Smart Follow-Up Message', lock: false },
    { text: 'WhatsApp, Facebook Messenger & Instagram Auto-Reply', lock: false },
    { text: 'Voice Note AI Listening & Product Photo Recognition', lock: false },
    { text: 'Auto Post Comment Reply + Direct Inbox (DM) Automation', lock: false },
    { text: 'Unlimited Product Catalog & Autonomous Chat Order Capture', lock: false },
    { text: 'Unlimited Customer Conversations (0 TK per-msg fee)', lock: false }
  ];

  const proFeatures = [
    { text: 'Everything in Starter Plan + Connect up to 10 Channels', lock: false },
    { text: 'Accounts, Stock & Profit ERP (Sales, Purchase, Due & Cashbook)', lock: false },
    { text: 'AI Appointments & Google Calendar Auto-Slot Booking', lock: false },
    { text: 'Website, WooCommerce & Shopify Store Sync + Live Chat Widget', lock: false },
    { text: 'AI Auto Delivery Tracking & Customer Live Status Update', lock: false },
    { text: 'VIP Customer Retargeting Message & AI Email Marketing', lock: false },
    { text: '1-Click Steadfast, Pathao & RedX Courier Dispatch', lock: false },
    { text: 'AI Auto Customer Fraud & Courier Delivery Ratio Check', lock: false },
    { text: 'Customer Callback Queue, Human Handover & CSV/Text Export', lock: false },
    { text: '3 Autonomous AI Sales Agents & 24/7 VIP Priority Support', lock: false }
  ];

  const CK_ICON = (
    <svg className="ck" viewBox="0 0 18 18">
      <circle cx="9" cy="9" r="9" />
      <path d="M5.2 9.3l2.5 2.5 5-5.2" />
    </svg>
  );

  const LK_ICON = (
    <svg viewBox="0 0 18 18" fill="none" stroke="#a2aabf" strokeWidth="1.6" strokeLinecap="round">
      <rect x="4" y="8" width="10" height="7" rx="2" />
      <path d="M6.5 8V6a2.5 2.5 0 015 0v2" />
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
          max-width: 720px;
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
          font-size: 12px;
          color: #8b94ad;
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
          padding: 8px 12px 8px 16px;
          border-radius: 999px;
          background: #fff;
          border: 1px solid rgba(124, 58, 237, 0.2);
          box-shadow: 0 10px 26px -14px rgba(76, 29, 149, 0.4);
          font-size: 12.5px;
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
          padding: 5px 12px;
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
          width: 270px;
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
          padding: 9px 14px;
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
          max-width: 1120px;
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
          padding: 28px 26px 26px;
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
          font-size: 20px;
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
          margin-top: 16px;
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
          font-size: 11.5px;
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
          color: var(--ink);
          background: #f1f3f8;
          border: 1px solid rgba(14, 22, 41, 0.08);
        }
        .dark .pr .b-light {
          color: #fff;
          background: #251B4D;
          border-color: rgba(168, 85, 247, 0.25);
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
        .pr li.lock {
          color: #a2aabf;
          text-decoration: line-through;
        }
        .dark .pr li.lock {
          color: #64748b;
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
            max-width: 460px;
          }
          .pr .pop {
            order: -1;
            margin-top: 14px;
          }
        }
      `}</style>

      {/* Head section */}
      <div className="head">
        <span className="badge">Pricing</span>
        <h2>Simple plans that grow with your business</h2>
        <p>
          Start small, then add channels and automation as you need them. Every plan includes autonomous AI replies.
        </p>
        <small>
          Facebook &amp; Instagram conversations: 100% Unlimited &bull; WhatsApp Cloud API: Direct Meta billing
        </small>
      </div>

      {/* Billing Duration Dropdown Selector matching exact HTML pill */}
      <div className="bill">
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
            <span>Billing Duration:</span>
            <b>{selectedDuration.label}</b>
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
      </div>

      {/* Grid of 3 Cards */}
      <div className="grid" id="grid">
        
        {/* 1. BASIC TRIAL CARD */}
        <article
          className="card"
          onMouseMove={handleCardMouseMove}
        >
          <div className="spot" />
          <div className="top">
            <h3>Basic</h3>
            <span className="free">2 Days Free</span>
          </div>
          <div className="price">
            <strong>&#2547;0</strong>
            <em>/ 2 days</em>
          </div>
          <div className="sub">Build One Business Agent</div>
          <button
            type="button"
            onClick={() => handleSelect('trial')}
            className="btn b-light"
          >
            Start 2-day free trial
          </button>
          <div className="fl">FEATURES</div>
          <ul>
            {basicFeatures.map((f, k) => (
              <li
                key={k}
                className={f.lock ? 'lock' : ''}
              >
                {f.lock ? LK_ICON : CK_ICON}
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        </article>

        {/* 2. STARTER AI PLAN CARD (POPULAR) */}
        <article
          className="card pop"
          onMouseMove={handleCardMouseMove}
        >
          <div className="spot" />
          <span className="tag">Most popular</span>
          <div className="top">
            <h3>Starter AI Plan</h3>
          </div>
          <div className="price">
            <strong>&#2547;{starterMonthlyEffective.toLocaleString('en-US')}</strong>
            <em>/ month</em>
          </div>
          <div className="sub">Manage Multiple Business</div>
          {selectedDuration.months > 1 && (
            <div className="total-billed">
              Billed &#2547;{starterTotalPrice.toLocaleString('en-US')} for {selectedDuration.label}
            </div>
          )}
          <button
            type="button"
            onClick={() => handleSelect('starter')}
            className="btn b-violet"
          >
            Choose Starter AI Plan
          </button>
          <div className="fl">FEATURES</div>
          <ul>
            {starterFeatures.map((f, k) => (
              <li
                key={k}
                className={f.lock ? 'lock' : ''}
              >
                {f.lock ? LK_ICON : CK_ICON}
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        </article>

        {/* 3. PRO BUSINESS PLAN CARD */}
        <article
          className="card"
          onMouseMove={handleCardMouseMove}
        >
          <div className="spot" />
          <div className="top">
            <h3>Pro Business Plan</h3>
          </div>
          <div className="price">
            <strong>&#2547;{proMonthlyEffective.toLocaleString('en-US')}</strong>
            <em>/ month</em>
          </div>
          <div className="sub">Scale Your Client Base</div>
          {selectedDuration.months > 1 && (
            <div className="total-billed">
              Billed &#2547;{proTotalPrice.toLocaleString('en-US')} for {selectedDuration.label}
            </div>
          )}
          <button
            type="button"
            onClick={() => handleSelect('pro')}
            className="btn b-dark"
          >
            Choose Pro Business Plan
          </button>
          <div className="fl">FEATURES</div>
          <ul>
            {proFeatures.map((f, k) => (
              <li
                key={k}
                className={f.lock ? 'lock' : ''}
              >
                {f.lock ? LK_ICON : CK_ICON}
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        </article>

      </div>
    </section>
  );
};
