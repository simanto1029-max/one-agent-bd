import React, { useState, useEffect, useRef } from 'react';
import { LegalModal } from '../common/LegalModal';

interface FooterProps {
  onOpenAuth: () => void;
}

const FACEBOOK_URL = 'https://www.facebook.com/OneAgentBD';
const WHATSAPP_URL = 'https://wa.me/8801601705804';
const EMAIL_URL = 'mailto:support.oneagentbd@gmail.com';

export const Footer: React.FC<FooterProps> = ({ onOpenAuth }) => {
  const rootRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);

  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms'>('privacy');

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Build letter spans for One Agent BD
    if (wordRef.current) {
      const text = 'One Agent BD';
      let html = '';
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        html +=
          c === ' '
            ? `<span class="sp" style="--k:${i}">&nbsp;</span>`
            : `<span style="--k:${i}" aria-hidden="true">${c}</span>`;
      }
      wordRef.current.innerHTML = html;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          root.classList.add('in');
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(root);

    return () => observer.disconnect();
  }, []);

  const openLegal = (tab: 'privacy' | 'terms') => {
    setLegalTab(tab);
    setLegalModalOpen(true);
  };

  return (
    <footer ref={rootRef} className="ft" id="ft">
      <style>{`
        .ft {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          background: #fff;
          color: #0e1629;
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          padding: clamp(40px, 5vw, 72px) clamp(14px, 4vw, 56px) clamp(18px, 2.5vw, 30px);
          transform: translateZ(0);
          transition: background 0.3s ease, color 0.3s ease;
        }
        .dark .ft {
          background: #080417;
          color: #f8fafc;
        }
        .ft a {
          color: inherit;
          text-decoration: none;
        }
        .ft .beams {
          position: absolute;
          inset: 0 0 auto 0;
          height: 60%;
          z-index: -3;
          pointer-events: none;
          background: repeating-linear-gradient(90deg, rgba(124, 58, 237, 0.05) 0 clamp(60px, 8vw, 130px), transparent 0 clamp(72px, 9.4vw, 152px));
          -webkit-mask-image: linear-gradient(180deg, #000, transparent);
          mask-image: linear-gradient(180deg, #000, transparent);
        }
        .dark .ft .beams {
          background: repeating-linear-gradient(90deg, rgba(168, 85, 247, 0.08) 0 clamp(60px, 8vw, 130px), transparent 0 clamp(72px, 9.4vw, 152px));
        }
        .ft .glow {
          position: absolute;
          inset: 0 0 auto 0;
          height: 70%;
          z-index: -2;
          pointer-events: none;
          background: linear-gradient(90deg, rgba(124, 58, 237, 0.22), rgba(168, 85, 247, 0.08) 45%, transparent 72%);
          -webkit-mask-image: linear-gradient(180deg, transparent, #000 65%, transparent);
          mask-image: linear-gradient(180deg, transparent, #000 65%, transparent);
          animation: driftFt 9s ease-in-out infinite alternate;
        }
        .dark .ft .glow {
          background: linear-gradient(90deg, rgba(168, 85, 247, 0.28), rgba(124, 58, 237, 0.15) 45%, transparent 72%);
        }
        @keyframes driftFt {
          from { transform: translateX(-6%); opacity: 0.7; }
          to { transform: translateX(10%); opacity: 1; }
        }
        .ft::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: -240px;
          width: min(1000px, 130vw);
          aspect-ratio: 1.5;
          transform: translateX(-50%);
          background: radial-gradient(closest-side, rgba(124, 58, 237, 0.14), transparent);
          z-index: -1;
        }
        .dark .ft::after {
          background: radial-gradient(closest-side, rgba(168, 85, 247, 0.2), transparent);
        }
        .ft .wrap {
          max-width: 1240px;
          margin: 0 auto;
        }
        .ft .box {
          position: relative;
          border-radius: 34px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(124, 58, 237, 0.14);
          box-shadow: 0 50px 100px -56px rgba(91, 33, 182, 0.5);
          -webkit-backdrop-filter: blur(8px);
          backdrop-filter: blur(8px);
          padding: clamp(24px, 3.6vw, 48px) clamp(20px, 3.6vw, 52px) 0;
          overflow: hidden;
          transition: background 0.3s, border-color 0.3s;
        }
        .dark .ft .box {
          background: rgba(18, 12, 42, 0.88);
          border-color: rgba(168, 85, 247, 0.25);
          box-shadow: 0 50px 100px -56px rgba(0, 0, 0, 0.75);
        }
        .ft .spot {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(380px circle at var(--mx, 70%) var(--my, 0%), rgba(124, 58, 237, 0.09), transparent 70%);
        }
        .ft .grid {
          position: relative;
          display: grid;
          grid-template-columns: 1.3fr 0.6fr 0.6fr 0.6fr 1.15fr;
          gap: clamp(22px, 3vw, 44px);
          align-items: start;
        }
        .ft .lead {
          font-size: clamp(20px, 2vw, 26px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.25;
          max-width: 300px;
          color: #0e1629;
        }
        .ft .follow {
          margin-top: 26px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.12em;
          color: #97a0b8;
        }
        .ft .soc {
          display: flex;
          gap: 10px;
          margin-top: 14px;
        }
        .ft .soc a {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #fff;
          box-shadow: 0 12px 22px -10px rgba(14, 22, 41, 0.45);
          transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s;
        }
        .ft .soc a svg {
          width: 20px;
          height: 20px;
          fill: currentColor;
        }
        .ft .soc a:hover {
          transform: translateY(-5px) scale(1.06);
          box-shadow: 0 18px 28px -10px rgba(14, 22, 41, 0.5);
        }
        .ft .fb { background: #1877f2; }
        .ft .wa { background: #25d366; }
        .ft .em { background: #38a8f5; }
        .ft .col h4 {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.12em;
          color: #97a0b8;
          margin-bottom: 18px;
        }
        .ft .col ul {
          list-style: none;
          display: grid;
          gap: 13px;
          padding: 0;
          margin: 0;
        }
        .ft .col a {
          position: relative;
          display: inline-block;
          font-size: 14.5px;
          font-weight: 600;
          color: #2a3652;
          transition: color 0.25s, transform 0.25s;
        }
        .ft .col a::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -3px;
          height: 2px;
          border-radius: 2px;
          background: linear-gradient(90deg, #7c3aed, #c026d3);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .ft .col a:hover {
          color: #7c3aed;
          transform: translateX(3px);
        }
        .ft .col a:hover::after {
          transform: scaleX(1);
        }
        .ft .sup {
          position: relative;
          padding: 22px;
          border-radius: 24px;
          background: #fff;
          border: 1px solid rgba(124, 58, 237, 0.22);
          box-shadow: 0 10px 30px -15px rgba(91, 33, 182, 0.25);
        }
        .ft .live {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 0.06em;
          color: #6d28d9;
          background: rgba(124, 58, 237, 0.08);
          border: 1px solid rgba(124, 58, 237, 0.22);
        }
        .ft .live i {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 10px #10b981;
          animation: pingFt 2.4s ease-in-out infinite;
        }
        @keyframes pingFt {
          50% { opacity: 0.35; transform: scale(0.7); }
        }
        .ft .sup h5 {
          margin-top: 14px;
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #0e1629;
        }
        .ft .sup p {
          margin-top: 3px;
          font-size: 13.5px;
          color: #5a6781;
        }
        .ft .cta {
          position: relative;
          overflow: hidden;
          display: flex;
          justify-content: center;
          margin-top: 18px;
          padding: 13px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          background: linear-gradient(135deg, #8b3dff, #6d28d9);
          box-shadow: 0 18px 34px -12px rgba(109, 40, 217, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.35);
          transition: transform 0.3s;
          cursor: pointer;
        }
        .ft .cta:hover {
          transform: translateY(-3px);
        }
        .ft .cta::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 46px;
          left: -70px;
          background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.6), transparent);
          transform: skewX(-20deg);
          animation: shineFt 4s ease-in-out 2.6s infinite;
        }
        @keyframes shineFt {
          0% { left: -70px; }
          40%, 100% { left: 125%; }
        }
        .ft .bar {
          position: relative;
          margin-top: clamp(26px, 3.6vw, 44px);
          padding: 18px 0;
          border-top: 1px solid rgba(14, 22, 41, 0.08);
          text-align: center;
          font-size: 13.5px;
          color: #5a6781;
        }
        .ft .word {
          margin: 0 -8px;
          text-align: center;
          white-space: nowrap;
          line-height: 0.86;
          font-weight: 800;
          letter-spacing: -0.055em;
          font-size: min(11.4vw, 150px);
          user-select: none;
          overflow: hidden;
          padding: 0.02em 0 0;
          height: 0.74em;
          -webkit-mask-image: linear-gradient(180deg, #000 38%, transparent 96%);
          mask-image: linear-gradient(180deg, #000 38%, transparent 96%);
        }
        .ft .word span {
          display: inline-block;
          background: linear-gradient(180deg, #8236f1, #b98bff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          transform: translateY(105%);
          opacity: 0;
        }
        .ft .word .sp {
          width: 0.26em;
        }
        .ft.in .word span {
          animation: letterFt 1s cubic-bezier(0.2, 0.9, 0.2, 1) forwards;
          animation-delay: calc(0.3s + var(--k) * 0.06s);
        }
        @keyframes letterFt {
          to { transform: none; opacity: 1; }
        }
        .ft .fade {
          opacity: 0;
          transform: translateY(16px);
        }
        .ft.in .fade {
          animation: upFt 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          animation-delay: calc(var(--d) * 1s);
        }
        @keyframes upFt {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
        .ft.in .box {
          animation: popFt 1s ease backwards;
        }
        @keyframes popFt {
          from { opacity: 0; transform: scale(0.975); }
        }
        @media (max-width: 1020px) {
          .ft .grid { grid-template-columns: repeat(3, 1fr); }
          .ft .brand, .ft .sup { grid-column: 1 / -1; }
          .ft .sup { max-width: 420px; }
        }
        @media (max-width: 520px) {
          .ft .grid { grid-template-columns: 1fr 1fr; gap: 26px 16px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ft.in *, .ft .glow, .ft .sup::before, .ft .cta::after, .ft .live i {
            animation-duration: 0.01s !important;
            animation-delay: 0s !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>

      <div className="beams"></div>
      <div className="glow"></div>

      <div className="wrap">
        <div
          ref={boxRef}
          className="box"
          id="box"
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
            e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
          }}
        >
          <div className="spot"></div>
          <div className="grid">
            <div className="brand fade" style={{ '--d': 0.1 } as React.CSSProperties}>
              <p className="lead">Simple AI support for chats, leads, and sales.</p>
              <div className="follow">FOLLOW US</div>
              <div className="soc">
                <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="fb" aria-label="Facebook">
                  <svg viewBox="0 0 24 24">
                    <path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z" />
                  </svg>
                </a>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="wa" aria-label="WhatsApp">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 3a9 9 0 00-7.8 13.5L3 21l4.6-1.2A9 9 0 1012 3zm0 1.7a7.3 7.3 0 11-3.8 13.6l-.3-.2-2.7.7.7-2.6-.2-.3A7.3 7.3 0 0112 4.700zM8.900 7.800c-.2 0-.5.100-.7.400-.3.300-.9.900-.9 2.100s.9 2.400 1 2.600c.1.200 1.800 2.800 4.400 3.800 2.200.9 2.600.700 3.100.600.500 0 1.500-.600 1.700-1.200.2-.600.200-1.100.1-1.200-.1-.1-.2-.2-.5-.3l-1.600-.8c-.2-.1-.4-.1-.5.100l-.7.900c-.1.200-.3.200-.5.100-.3-.1-1-.4-1.900-1.200-.7-.6-1.200-1.400-1.300-1.600-.1-.2 0-.4.100-.5l.4-.4.200-.4c.1-.1 0-.3 0-.4l-.7-1.700c-.2-.4-.4-.4-.5-.4z" />
                  </svg>
                </a>
                <a href={EMAIL_URL} className="em" aria-label="Email">
                  <svg viewBox="0 0 24 24">
                    <path d="M4 5.500h16A1.500 1.500 0 0121.500 7v10a1.500 1.500 0 01-1.500 1.500H4A1.500 1.500 0 012.500 17V7A1.500 1.500 0 014 5.500zm.6 1.700l7.400 5.300 7.400-5.300zm14.900 1.800l-7.100 5.100a.7.7 0 01-.8 0L4.500 9v8h15z" />
                  </svg>
                </a>
              </div>
            </div>

            <nav className="col fade" style={{ '--d': 0.18 } as React.CSSProperties} aria-label="Product">
              <h4>PRODUCT</h4>
              <ul>
                <li>
                  <a href="#channels">Channels</a>
                </li>
                <li>
                  <a href="#features">Features</a>
                </li>
                <li>
                  <a href="#pricing">Pricing</a>
                </li>
              </ul>
            </nav>

            <nav className="col fade" style={{ '--d': 0.26 } as React.CSSProperties} aria-label="Company">
              <h4>COMPANY</h4>
              <ul>
                <li>
                  <a href="#reviews">Reviews</a>
                </li>
                <li>
                  <a href="#faq">FAQ</a>
                </li>
                <li>
                  <a href={EMAIL_URL}>Contact</a>
                </li>
              </ul>
            </nav>

            <nav className="col fade" style={{ '--d': 0.34 } as React.CSSProperties} aria-label="Legal">
              <h4>LEGAL</h4>
              <ul>
                <li>
                  <button
                    type="button"
                    onClick={() => openLegal('privacy')}
                    className="cursor-pointer text-left font-semibold text-[#2a3652] hover:text-[#7c3aed]"
                  >
                    Privacy policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openLegal('terms')}
                    className="cursor-pointer text-left font-semibold text-[#2a3652] hover:text-[#7c3aed]"
                  >
                    Terms of service
                  </button>
                </li>
              </ul>
            </nav>

            <div className="sup fade" style={{ '--d': 0.42 } as React.CSSProperties}>
              <span className="live">
                <i></i>OFFICIAL SUPPORT
              </span>
              <h5>One Agent BD</h5>
              <p>Official support in Bangladesh</p>
              <button
                type="button"
                onClick={onOpenAuth}
                className="cta w-full"
              >
                Start 2-day free trial
              </button>
            </div>
          </div>
          <div className="bar fade" style={{ '--d': 0.55 } as React.CSSProperties}>
            &copy; 2026 One Agent BD. All rights reserved.
          </div>
        </div>

        <div ref={wordRef} className="word" id="word" aria-label="One Agent BD"></div>
      </div>

      {/* Legal Privacy & Terms Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalTab}
      />
    </footer>
  );
};
