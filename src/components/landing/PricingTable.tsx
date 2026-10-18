import React, { useEffect, useRef } from 'react';
import { Plan } from '../../types';
import { OFFICIAL_THREE_PLANS } from '../../utils/pricingPlans';

interface PricingTableProps {
  onSelectPlan: (plan: Plan, action?: 'buy' | 'trial') => void;
}

export const PricingTable: React.FC<PricingTableProps> = ({ onSelectPlan }) => {
  const rootRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const PLANS = [
    {
      id: 'basic_trial',
      n: 'Basic',
      tag: '2 Days Free',
      p: 0,
      u: '/ 2 days',
      s: 'Build One Business Agent',
      b: 'Start 2-day free trial',
      c: 'b-light',
      isTrial: true,
      f: [
        'Facebook Unlimited conversations',
        'Instagram Unlimited conversations',
        '!WhatsApp Unlimited conversations (Locked in 2-day trial)',
        '1 AI business agent',
        'Bangla voice note & photo AI',
        'Auto comment & inbox reply',
        '1-Click courier booking (Steadfast & Pathao)',
        'Unified team inbox',
        'Standard AI reply speed'
      ]
    },
    {
      id: 'starter_plan',
      n: 'Starter AI Plan',
      pop: 1,
      p: 1250,
      u: '/ month',
      s: 'Manage Multiple Business',
      b: 'Choose Starter AI Plan',
      c: 'b-violet',
      isTrial: false,
      f: [
        '24/7 Active AI Sales & Auto-Reply Agent (Up to 3 Channels)',
        '1-Click Steadfast, Pathao & RedX Courier Dispatch',
        'AI Auto Customer Fraud & Courier Delivery Ratio Check',
        'AI Auto Delivery Tracking & Customer Live Status Update',
        'VIP Customer Retargeting & Smart Follow-Up Message',
        'WhatsApp, Facebook Messenger & Instagram Auto-Reply',
        'Voice Note AI Listening & Product Photo Recognition',
        'Auto Post Comment Reply + Direct Inbox (DM) Automation',
        'Unlimited Product Catalog & Autonomous Chat Order Capture',
        'Unlimited Customer Conversations (0 TK per-msg fee)'
      ]
    },
    {
      id: 'pro_plan',
      n: 'Pro Business Plan',
      p: 1950,
      u: '/ month',
      s: 'Scale Your Client Base',
      b: 'Choose Pro Business Plan',
      c: 'b-dark',
      isTrial: false,
      f: [
        'Everything in Starter Plan + Connect up to 10 Channels',
        'Accounts, Stock & Profit ERP (Sales, Purchase, Due & Cashbook)',
        'AI Appointments & Google Calendar Auto-Slot Booking',
        'Website, WooCommerce & Shopify Store Sync + Live Chat Widget',
        'AI Auto Delivery Tracking & Customer Live Status Update',
        'VIP Customer Retargeting Message & AI Email Marketing',
        '1-Click Steadfast, Pathao & RedX Courier Dispatch',
        'AI Auto Customer Fraud & Courier Delivery Ratio Check',
        'Customer Callback Queue, Human Handover & CSV/Text Export',
        '3 Autonomous AI Sales Agents & 24/7 VIP Priority Support'
      ]
    }
  ];

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const count = () => {
      const els = root.querySelectorAll('[data-to]');
      els.forEach((el, i) => {
        const to = +(el.getAttribute('data-to') || '0');
        const t0 = performance.now() + 700 + i * 140;
        const d = 1500;
        const s = (n: number) => {
          const p = Math.min(Math.max((n - t0) / d, 0), 1);
          el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString('en-US');
          if (p < 1) requestAnimationFrame(s);
        };
        requestAnimationFrame(s);
      });
    };

    const go = () => {
      root.classList.add('in');
      count();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          go();
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(root);

    return () => observer.disconnect();
  }, []);

  const handleSelect = (p: (typeof PLANS)[0]) => {
    const matched =
      OFFICIAL_THREE_PLANS.find(
        (pl) =>
          pl.name.toLowerCase().includes(p.n.toLowerCase().split(' ')[0]) ||
          (p.isTrial && (pl.trial_days > 0 || pl.price === 0))
      ) || OFFICIAL_THREE_PLANS[0];

    onSelectPlan(matched, p.isTrial ? 'trial' : 'buy');
  };

  return (
    <section ref={rootRef} className="pr" id="pricing">
      <style>{`
        @property --a {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        .pr {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          padding: clamp(48px, 6vw, 90px) clamp(16px, 4vw, 56px);
          background: linear-gradient(180deg, #fff, #faf8ff 40%, #f6f2ff);
          color: #0e1629;
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
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
        .pr h2 {
          font-size: clamp(28px, 3.6vw, 46px);
          font-weight: 800;
          letter-spacing: -0.035em;
          line-height: 1.1;
          margin: 16px 0 12px;
          color: #0e1629;
        }
        .pr .head p {
          font-size: clamp(14px, 1.3vw, 16px);
          line-height: 1.65;
          color: #5a6781;
        }
        .pr .head small {
          display: block;
          margin-top: 10px;
          font-size: 12px;
          color: #8b94ad;
        }
        .pr .bill {
          display: flex;
          justify-content: center;
          margin: 26px 0 42px;
        }
        .pr .bill div {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px 8px 16px;
          border-radius: 999px;
          background: #fff;
          border: 1px solid rgba(124, 58, 237, 0.2);
          box-shadow: 0 10px 26px -14px rgba(76, 29, 149, 0.4);
          font-size: 12.5px;
          font-weight: 600;
          color: #5a6781;
        }
        .pr .bill b {
          padding: 5px 12px;
          border-radius: 999px;
          color: #fff;
          font-size: 12px;
          background: linear-gradient(135deg, #8b3dff, #6d28d9);
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
          opacity: 0;
          transform: translateY(46px) scale(0.97);
          transition: box-shadow 0.35s, translate 0.35s;
        }
        .pr .card:hover {
          translate: 0 -8px;
          box-shadow: 0 44px 80px -34px rgba(91, 33, 182, 0.5);
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
          animation: spinPr 5s linear infinite;
        }
        @keyframes spinPr {
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
          animation: shinePr 3s ease-in-out 2s infinite;
        }
        @keyframes shinePr {
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
        }
        .pr .free {
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          color: #475069;
          background: #eef0f6;
        }
        .pr .price {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-top: 16px;
          font-weight: 800;
          letter-spacing: -0.04em;
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
        .pr .sub {
          margin-top: 8px;
          font-size: 13px;
          color: #5a6781;
          font-weight: 500;
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
          text-decoration: none;
          transition: transform 0.25s, box-shadow 0.25s;
          cursor: pointer;
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
          color: #0e1629;
          background: #f1f3f8;
          border: 1px solid rgba(14, 22, 41, 0.08);
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
        .pr .fl {
          margin: 22px 0 14px;
          padding-top: 16px;
          border-top: 1px solid rgba(14, 22, 41, 0.08);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: #97a0b8;
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
          opacity: 0;
          transform: translateX(-12px);
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
          stroke-dashoffset: 14;
        }
        .pr.in .head > *, .pr.in .bill {
          animation: upPr 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) both;
          animation-delay: calc(var(--d, 0) * 1s);
        }
        .pr .head > *, .pr .bill {
          opacity: 0;
        }
        .pr.in .head > *, .pr.in .bill {
          opacity: 1;
        }
        .pr.in .card {
          animation: risePr 0.95s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          animation-delay: calc(0.45s + var(--i) * 0.14s);
        }
        .pr.in li {
          animation: slidePr 0.55s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          animation-delay: calc(0.9s + var(--i) * 0.14s + var(--k) * 0.06s);
        }
        .pr.in .ck path {
          animation: tickPr 0.5s ease forwards;
          animation-delay: calc(1s + var(--i) * 0.14s + var(--k) * 0.06s);
        }
        .pr.in .pop {
          animation: risePr 0.95s cubic-bezier(0.2, 0.8, 0.2, 1) forwards, glowPr 4s ease-in-out 2s infinite;
          animation-delay: calc(0.45s + var(--i) * 0.14s), 2s;
        }
        @keyframes upPr {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes risePr {
          to { opacity: 1; transform: none; }
        }
        @keyframes slidePr {
          to { opacity: 1; transform: none; }
        }
        @keyframes tickPr {
          to { stroke-dashoffset: 0; }
        }
        @keyframes glowPr {
          50% { box-shadow: 0 44px 110px -30px rgba(124, 58, 237, 0.9); }
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
        @media (prefers-reduced-motion: reduce) {
          .pr.in * {
            animation-duration: 0.01s !important;
            animation-delay: 0s !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>

      <div className="head">
        <span className="badge" style={{ '--d': 0 } as React.CSSProperties}>
          Pricing
        </span>
        <h2 style={{ '--d': 0.1 } as React.CSSProperties}>Simple plans that grow with your business</h2>
        <p style={{ '--d': 0.2 } as React.CSSProperties}>
          Start small, then add channels and automation as you need them. Every plan includes autonomous AI replies.
        </p>
        <small style={{ '--d': 0.3 } as React.CSSProperties}>
          Facebook &amp; Instagram conversations: 100% Unlimited • WhatsApp Cloud API: Direct Meta billing
        </small>
      </div>

      <div className="bill" style={{ '--d': 0.4 } as React.CSSProperties}>
        <div>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="5" width="18" height="16" rx="3" />
            <path d="M8 3v4M16 3v4M3 10h18" />
          </svg>
          Billing Duration: <b>1 Month</b>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b94ad" strokeWidth="2.4" strokeLinecap="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      <div ref={gridRef} className="grid" id="grid">
        {PLANS.map((P, i) => (
          <article
            key={P.id}
            className={`card${P.pop ? ' pop' : ''}`}
            style={{ '--i': i } as React.CSSProperties}
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
            }}
          >
            <div className="spot"></div>
            {P.pop && <span className="tag">Most popular</span>}
            <div className="top">
              <h3>{P.n}</h3>
              {P.tag && <span className="free">{P.tag}</span>}
            </div>
            <div className="price">
              <strong>
                &#2547;<span data-to={P.p}>0</span>
              </strong>
              <em>{P.u}</em>
            </div>
            <div className="sub">{P.s}</div>
            <button
              type="button"
              onClick={() => handleSelect(P)}
              className={`btn ${P.c} w-full`}
            >
              {P.b}
            </button>
            <div className="fl">FEATURES</div>
            <ul>
              {P.f.map((t, k) => {
                const l = t[0] === '!';
                return (
                  <li
                    key={k}
                    className={l ? 'lock' : ''}
                    style={{ '--k': k } as React.CSSProperties}
                  >
                    {l ? (
                      <svg viewBox="0 0 18 18" fill="none" stroke="#a2aabf" strokeWidth="1.6" strokeLinecap="round">
                        <rect x="4" y="8" width="10" height="7" rx="2" />
                        <path d="M6.5 8V6a2.5 2.5 0 015 0v2" />
                      </svg>
                    ) : (
                      <svg className="ck" viewBox="0 0 18 18">
                        <circle cx="9" cy="9" r="9" />
                        <path d="M5.2 9.3l2.5 2.5 5-5.2" />
                      </svg>
                    )}
                    <span>{l ? t.slice(1) : t}</span>
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
};
