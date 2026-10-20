import React, { useState, useEffect, useRef } from 'react';

export const FAQ: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const rootRef = useRef<HTMLElement>(null);

  const FAQ_LIST = [
    {
      q: 'Can the AI understand Bangla, Banglish, Voice Notes & Product Photos?',
      pill: 'Voice & Photo AI',
      a: 'Yes. The AI replies in <b>Bangla, Banglish and English</b>, listens to customer voice notes and recognises product photos, so customers can order the same way they already chat with you.'
    },
    {
      q: 'How does AI order booking, fraud ratio check & live tracking work?',
      pill: 'Courier & Fraud',
      a: "When a customer confirms, the AI captures the order right inside the chat and <b>checks the customer's courier delivery ratio</b> to flag risky orders. You can dispatch to Steadfast, Pathao or RedX in one click, and the AI then tracks the parcel and sends live status updates to the customer automatically."
    },
    {
      q: 'Is my Facebook Page, Instagram, or WhatsApp 100% safe from bans?',
      pill: '0% Ban Risk',
      a: "One Agent BD connects through the <b>official Meta APIs</b> (Facebook, Instagram and WhatsApp Cloud API) instead of unofficial tools or scraping, so your accounts stay within Meta's rules."
    },
    {
      q: 'Does the AI reply to Facebook & Instagram comments and send Inbox DMs?',
      pill: 'Comment + DM',
      a: 'Yes. The AI replies to <b>post comments</b> and moves interested buyers into a <b>direct inbox (DM)</b> conversation automatically, so no lead gets lost in the comment section.'
    },
    {
      q: 'What is included in Starter (1,250 TK) vs Pro Plan (1,950 TK)?',
      pill: 'Plans & VIP',
      a: '<b>Starter (1,250 TK/month)</b> gives you a 24/7 AI sales agent for up to 3 channels, courier dispatch, fraud check, delivery tracking, VIP retargeting, voice and photo AI, comment and DM automation, plus unlimited catalog and conversations. <b>Pro (1,950 TK/month)</b> adds up to 10 channels, Accounts, Stock &amp; Profit ERP, Google Calendar appointments, website / WooCommerce / Shopify sync with a live chat widget, AI email marketing, human handover, 3 AI sales agents and VIP priority support.'
    },
    {
      q: 'Do I get a 2-Day Free Trial and free technical setup?',
      pill: 'Free Setup',
      a: 'Yes. Start with the <b>2-day free trial</b> on the Basic plan with one AI business agent, and our team helps you with the technical setup at no cost. WhatsApp conversations unlock when you move to a paid plan.'
    }
  ];

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          root.classList.add('in');
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={rootRef} className="faq" id="faq">
      <style>{`
        .faq {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          padding: clamp(48px, 6vw, 88px) clamp(14px, 4vw, 40px);
          background: linear-gradient(180deg, #f6f2ff, #fbf9ff 45%, #fff);
          color: #0e1629;
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          scroll-margin-top: 6rem;
          transform: translateZ(0);
          transition: background 0.3s, color 0.3s;
        }
        .dark .faq {
          background: linear-gradient(180deg, #090518 0%, #100A28 50%, #090518 100%);
          color: #f8fafc;
        }
        .faq::before {
          content: "";
          position: absolute;
          left: 50%;
          top: -140px;
          width: min(820px, 120vw);
          aspect-ratio: 1;
          transform: translateX(-50%);
          background: radial-gradient(closest-side, rgba(124, 58, 237, 0.16), transparent);
          z-index: -1;
        }
        .faq .head {
          text-align: center;
          max-width: 680px;
          margin: 0 auto;
        }
        .faq .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 15px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          color: #7c3aed;
          background: rgba(124, 58, 237, 0.08);
          border: 1px solid rgba(124, 58, 237, 0.3);
          box-shadow: 0 8px 20px -10px rgba(124, 58, 237, 0.5);
        }
        .dark .faq .badge {
          color: #c084fc;
          background: rgba(124, 58, 237, 0.2);
          border-color: rgba(168, 85, 247, 0.35);
        }
        .faq h2 {
          font-size: clamp(28px, 3.8vw, 46px);
          font-weight: 800;
          letter-spacing: -0.035em;
          line-height: 1.1;
          margin: 16px 0 10px;
          color: #0e1629;
        }
        .dark .faq h2 {
          color: #ffffff;
        }
        .faq h2 span {
          background: linear-gradient(90deg, #7c3aed, #c026d3 85%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .faq .head p {
          font-size: clamp(14px, 1.3vw, 16px);
          color: #5a6781;
        }
        .dark .faq .head p {
          color: #94a3b8;
        }
        .faq .wrap {
          position: relative;
          max-width: 780px;
          margin: clamp(28px, 4vw, 46px) auto 0;
          padding: clamp(12px, 2vw, 20px);
          border-radius: 32px;
          background: rgba(255, 255, 255, 0.65);
          border: 1px solid rgba(124, 58, 237, 0.14);
          box-shadow: 0 50px 90px -50px rgba(91, 33, 182, 0.35);
          backdrop-filter: blur(6px);
        }
        .dark .faq .wrap {
          background: rgba(22, 15, 53, 0.7);
          border-color: rgba(168, 85, 247, 0.25);
          box-shadow: 0 50px 90px -50px rgba(0, 0, 0, 0.7);
        }
        .faq .wrap::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          z-index: -1;
          background-image: radial-gradient(rgba(124, 58, 237, 0.16) 1px, transparent 1px);
          background-size: 16px 16px;
          -webkit-mask-image: linear-gradient(#000, transparent 85%);
          mask-image: linear-gradient(#000, transparent 85%);
        }
        .faq .list {
          display: grid;
          gap: 10px;
        }
        .faq .item {
          position: relative;
          border-radius: 18px;
          background: #fff;
          border: 1px solid rgba(14, 22, 41, 0.08);
          box-shadow: 0 10px 24px -18px rgba(60, 20, 140, 0.4);
          opacity: 0;
          transform: translateY(30px);
          transition: box-shadow 0.3s, translate 0.3s, border-color 0.3s, background 0.3s;
        }
        .dark .faq .item {
          background: #160F35;
          border-color: rgba(168, 85, 247, 0.2);
          box-shadow: 0 10px 24px -18px rgba(0, 0, 0, 0.6);
        }
        .faq .item:hover {
          translate: 0 -2px;
          box-shadow: 0 18px 36px -16px rgba(91, 33, 182, 0.4);
          border-color: rgba(124, 58, 237, 0.3);
        }
        .dark .faq .item:hover {
          border-color: rgba(168, 85, 247, 0.4);
        }
        .faq .item.open {
          border-color: #7c3aed;
          box-shadow: 0 10px 28px -12px rgba(124, 58, 237, 0.35);
        }
        .dark .faq .item.open {
          border-color: #a855f7;
          box-shadow: 0 10px 28px -12px rgba(168, 85, 247, 0.5);
        }
        .faq .q {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          background: none;
          border: 0;
          cursor: pointer;
          text-align: left;
          font: inherit;
          color: inherit;
          border-radius: 18px;
        }
        .faq .q:focus-visible {
          outline: 2px solid #7c3aed;
          outline-offset: 2px;
        }
        .faq .num {
          flex: none;
          width: 34px;
          height: 34px;
          border-radius: 11px;
          display: grid;
          place-items: center;
          font-size: 12px;
          font-weight: 800;
          color: #7c3aed;
          background: #f1eaff;
          border: 1px solid rgba(124, 58, 237, 0.2);
          transition: all 0.35s;
        }
        .dark .faq .num {
          color: #c084fc;
          background: #23164d;
          border-color: rgba(168, 85, 247, 0.3);
        }
        .faq .item.open .num {
          color: #fff;
          background: linear-gradient(135deg, #8b3dff, #5b3df0);
          border-color: transparent;
          box-shadow: 0 8px 18px -6px rgba(91, 61, 240, 0.7);
        }
        .faq .qt {
          flex: 1;
          font-size: clamp(13px, 1.3vw, 14.5px);
          font-weight: 700;
          line-height: 1.4;
          color: #0e1629;
        }
        .dark .faq .qt {
          color: #ffffff;
        }
        .faq .pill {
          flex: none;
          padding: 4px 11px;
          border-radius: 999px;
          font-size: 10.5px;
          font-weight: 700;
          color: #7c3aed;
          background: #f5efff;
          border: 1px solid rgba(124, 58, 237, 0.22);
          white-space: nowrap;
        }
        .dark .faq .pill {
          color: #c084fc;
          background: #23164d;
          border-color: rgba(168, 85, 247, 0.3);
        }
        .faq .chev {
          flex: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #eef0f6;
          transition: all 0.35s;
        }
        .dark .faq .chev {
          background: #23164d;
        }
        .faq .chev svg {
          width: 14px;
          height: 14px;
          stroke: #64708a;
          transition: transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), stroke 0.3s;
        }
        .dark .faq .chev svg {
          stroke: #cbd5e1;
        }
        .faq .item.open .chev {
          background: #7c3aed;
        }
        .faq .item.open .chev svg {
          transform: rotate(180deg);
          stroke: #fff;
        }
        .faq .ai {
          color: #4b5870;
          font-size: clamp(13px, 1.15vw, 14px);
          line-height: 1.65;
        }
        .dark .faq .ai {
          color: #cbd5e1;
        }
        .faq .a {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .faq .item.open .a {
          grid-template-rows: 1fr;
        }
        .faq .a > div {
          overflow: hidden;
        }
        .faq .a p {
          padding: 0 18px 20px 66px;
          font-size: 13.5px;
          line-height: 1.75;
          color: #5a6781;
          opacity: 0;
          transform: translateY(-6px);
          transition: opacity 0.4s 0.1s, transform 0.4s 0.1s;
        }
        .faq .a b {
          color: #0e1629;
        }
        .faq .item.open .a p {
          opacity: 1;
          transform: none;
        }
        .faq .head > * {
          opacity: 0;
        }
        .faq.in .head > * {
          animation: upFaq 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) both;
          animation-delay: calc(var(--d, 0) * 1s);
          opacity: 1;
        }
        .faq.in .wrap {
          animation: fadeFaq 1s ease 0.2s backwards;
        }
        .faq.in .item {
          animation: riseFaq 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          animation-delay: calc(0.45s + var(--i) * 0.09s);
        }
        @keyframes upFaq {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes fadeFaq {
          from { opacity: 0; transform: scale(0.97); }
        }
        @keyframes riseFaq {
          to { opacity: 1; transform: none; }
        }
        @media (max-width: 560px) {
          .faq .pill { display: none; }
          .faq .a p { padding-left: 18px; }
          .faq .q { gap: 11px; padding: 14px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .faq.in *, .faq .item.open::before {
            animation-duration: 0.01s !important;
            animation-delay: 0s !important;
            animation-iteration-count: 1 !important;
          }
          .faq .a, .faq .a p { transition: none; }
        }
      `}</style>

      <div className="head">
        <span className="badge" style={{ '--d': 0 } as React.CSSProperties}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="12" cy="12" r="9.5" />
            <path d="M9.5 9.3a2.6 2.6 0 015 .8c0 1.7-2.5 2.2-2.5 3.7M12 17.3v.1" />
          </svg>
          QUICK ANSWERS
        </span>
        <h2 style={{ '--d': 0.1 } as React.CSSProperties}>
          Frequently Asked <span>Questions</span>
        </h2>
        <p style={{ '--d': 0.2 } as React.CSSProperties}>Everything you need to know in 30 seconds.</p>
      </div>

      <div className="wrap">
        <div className="list" id="list">
          {FAQ_LIST.map((f, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className={`item${isOpen ? ' open' : ''}`}
                style={{ '--i': i } as React.CSSProperties}
              >
                <button
                  type="button"
                  className="q"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                >
                  <span className="num">0{i + 1}</span>
                  <span className="qt">{f.q}</span>
                  <span className="pill">{f.pill}</span>
                  <span className="chev">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </button>
                <div className="a">
                  <div>
                    <p dangerouslySetInnerHTML={{ __html: f.a }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
