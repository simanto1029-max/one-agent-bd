import React, { useEffect, useRef } from 'react';
import { BrandLogo } from '../common/BrandLogo';

export const IntegrationSection: React.FC = () => {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const boxesRef = useRef<(HTMLDivElement | null)[]>([]);

  const channels = [
    {
      name: 'Facebook',
      icon: (
        <svg viewBox="0 0 48 48" className="w-8 h-8 sm:w-9 sm:h-9">
          <circle cx="24" cy="24" r="24" fill="#1877f2" />
          <path
            fill="#fff"
            d="M26.5 38V26h4l.7-4.7h-4.7v-3c0-1.4.5-2.3 2.4-2.3h2.4V11.9c-.4-.1-1.9-.2-3.5-.2-3.6 0-6 2.2-6 6.2v3.4h-4V26h4v12z"
          />
        </svg>
      )
    },
    {
      name: 'Instagram',
      icon: (
        <svg viewBox="0 0 48 48" className="w-8 h-8 sm:w-9 sm:h-9">
          <defs>
            <radialGradient id="igLandingGradLight" cx="0.2" cy="1" r="1">
              <stop offset="0%" stopColor="#FFDD55" />
              <stop offset="0.35" stopColor="#FF543E" />
              <stop offset="0.6" stopColor="#C837AB" />
              <stop offset="1" stopColor="#4158D0" />
            </radialGradient>
          </defs>
          <rect width="44" height="44" x="2" y="2" rx="13" fill="url(#igLandingGradLight)" />
          <rect x="11.5" y="11.5" width="25" height="25" rx="7" fill="none" stroke="#fff" strokeWidth="2.8" />
          <circle cx="24" cy="24" r="5.5" fill="none" stroke="#fff" strokeWidth="2.8" />
          <circle cx="31.2" cy="16.8" r="1.6" fill="#fff" />
        </svg>
      )
    },
    {
      name: 'WhatsApp',
      icon: (
        <svg viewBox="0 0 48 48" className="w-8 h-8 sm:w-9 sm:h-9">
          <circle cx="24" cy="24" r="24" fill="#25d366" />
          <path
            d="M33.4 14.6C30.9 12.1 27.6 10.7 24.1 10.7C16.9 10.7 11 16.6 11 23.8C11 26.1 11.6 28.3 12.8 30.3L10.7 37.3L17.8 35.4C19.7 36.4 21.9 37 24.1 37C31.3 37 37.2 31.1 37.2 23.9C37.2 20.4 35.8 17.1 33.4 14.6ZM24.1 34.8C22.2 34.8 20.3 34.2 18.6 33.2L18.2 33L14 34.1L15.1 30.1L14.8 29.6C13.7 27.9 13.1 25.9 13.1 23.8C13.1 17.8 18 12.9 24.1 12.9C27 12.9 29.7 14 31.7 16C33.7 18 34.8 20.7 34.8 23.8C34.8 29.9 29.9 34.8 24.1 34.8ZM30 26.6C29.7 26.4 28 25.6 27.7 25.5C27.4 25.4 27.2 25.3 26.9 25.7C26.7 26 26.1 26.7 25.9 26.9C25.7 27.2 25.5 27.2 25.1 27C24.8 26.9 23.8 26.5 22.5 25.4C21.5 24.5 20.9 23.4 20.7 23C20.5 22.6 20.7 22.5 20.9 22.3C21 22.1 21.3 21.8 21.5 21.6C21.7 21.3 21.7 21.2 21.9 20.9C22 20.6 21.9 20.4 21.8 20.2C21.7 20.1 21.1 18.5 20.8 17.8C20.5 17.2 20.3 17.2 20.1 17.2C19.9 17.2 19.6 17.2 19.3 17.2C19 17.2 18.6 17.3 18.3 17.7C18 18.1 17 19.1 17 21.1C17 23.2 18.4 25.1 18.6 25.4C18.8 25.7 21.4 29.9 25.3 31.8C26.2 32.2 27 32.5 27.5 32.7C28.4 33 29.3 33 29.9 32.9C30.7 32.8 32.1 31.9 32.4 31C32.8 30.1 32.8 29.4 32.7 29.2C32.5 29.1 32.3 29 32 28.8L30 26.6Z"
            fill="white"
          />
        </svg>
      )
    },
    {
      name: 'WordPress',
      icon: (
        <svg viewBox="0 0 48 48" className="w-8 h-8 sm:w-9 sm:h-9">
          <circle cx="24" cy="24" r="24" fill="#21759b" />
          <circle cx="24" cy="24" r="19" fill="none" stroke="#fff" strokeWidth="2.4" />
          <text x="24" y="32" textAnchor="middle" fontFamily="Georgia,serif" fontWeight="700" fontSize="24" fill="#fff">
            W
          </text>
        </svg>
      )
    },
    {
      name: 'Shopify',
      icon: (
        <svg viewBox="0 0 48 48" className="w-8 h-8 sm:w-9 sm:h-9">
          <rect width="48" height="48" rx="13" fill="#95bf47" />
          <path fill="#fff" d="M15 17h18l1.6 17.5a2.5 2.5 0 0 1-2.5 2.7H15.9a2.5 2.5 0 0 1-2.5-2.7z" />
          <path fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" d="M19 20v-3a5 5 0 0 1 10 0v3" />
          <text x="24" y="33" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="14" fill="#5e8e3e">
            S
          </text>
        </svg>
      )
    },
    {
      name: 'Website',
      icon: (
        <svg viewBox="0 0 48 48" className="w-8 h-8 sm:w-9 sm:h-9">
          <rect width="48" height="48" rx="13" fill="#2a2147" />
          <g fill="none" stroke="#c4a1ff" strokeWidth="2.6" strokeLinecap="round">
            <circle cx="24" cy="24" r="12" />
            <ellipse cx="24" cy="24" rx="5.5" ry="12" />
            <path d="M12 24h24M14 18h20M14 30h20" />
          </g>
        </svg>
      )
    }
  ];

  useEffect(() => {
    let built = false;

    const build = () => {
      if (!stageRef.current || !orbRef.current || !svgRef.current) return;
      const stage = stageRef.current;
      const orb = orbRef.current;
      const svg = svgRef.current;

      const s = stage.getBoundingClientRect();
      if (s.width === 0) return;
      const o = orb.getBoundingClientRect();
      const tx = o.left + o.width / 2 - s.left;
      const y0 = o.top + o.height - s.top - 2;

      svg.setAttribute('viewBox', `0 0 ${s.width} ${s.height}`);

      let html = `<defs><linearGradient id="landingLinesLgWhite" gradientUnits="userSpaceOnUse" x1="0" y1="${y0}" x2="0" y2="${s.height}">
        <stop offset="0" stop-color="#c4a1ff" stop-opacity=".95"/>
        <stop offset="1" stop-color="#7c3aed" stop-opacity=".5"/>
      </linearGradient></defs>`;

      boxesRef.current.forEach((b, i) => {
        if (!b) return;
        const r = b.getBoundingClientRect();
        const bx = r.left + r.width / 2 - s.left;
        const by = r.top - s.top + 1;
        const k = (by - y0) * 0.6;
        const d = `M${tx} ${y0} C${tx} ${y0 + k} ${bx} ${by - k} ${bx} ${by}`;
        html += `<path class="base" pathLength="1" style="--i:${i}" d="${d}"/>
          <path class="pulse" pathLength="1" style="--i:${i}" d="${d}"/>
          <circle class="node" style="--i:${i}" cx="${bx}" cy="${by}" r="3.5"/>`;
      });

      svg.innerHTML = html;
      built = true;
    };

    const init = () => {
      build();
      if (rootRef.current) {
        rootRef.current.classList.add('in');
      }
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(init);
    } else {
      init();
    }

    let resizeTimer: any;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (built) build();
      }, 150);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          build();
          if (rootRef.current) {
            rootRef.current.classList.add('in');
          }
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (rootRef.current) {
      observer.observe(rootRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={rootRef} className="oa" id="channels">
      <style>{`
        /* ===== LIGHT & DARK THEME ADAPTIVE STYLING ===== */
        .oa {
          position: relative;
          overflow: hidden;
          padding: clamp(32px, 4vw, 54px) 16px clamp(28px, 3.5vw, 46px);
          isolation: isolate;
          background: #ffffff;
          color: #0e1629;
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          border-radius: 28px;
          margin: 16px 0;
          border: 1px solid rgba(124, 58, 237, 0.12);
          box-shadow: 0 10px 30px -10px rgba(91, 33, 182, 0.08);
          content-visibility: auto;
          contain-intrinsic-size: 520px;
          transform: translateZ(0);
          transition: background 0.3s, color 0.3s, border-color 0.3s;
        }
        .dark .oa {
          background: #10092B;
          color: #f8fafc;
          border-color: rgba(168, 85, 247, 0.25);
          box-shadow: 0 16px 40px -15px rgba(0, 0, 0, 0.6);
        }
        .gridbg-light {
          position: absolute;
          inset: 0;
          z-index: -1;
          background-image: radial-gradient(rgba(124, 58, 237, 0.08) 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
        }
        .dark .gridbg-light {
          background-image: radial-gradient(rgba(168, 85, 247, 0.15) 1px, transparent 1px);
        }
        .oa .wrap {
          position: relative;
          max-width: 1040px;
          margin: 0 auto;
          text-align: center;
        }
        .oa .badge {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #6d28d9;
          background: rgba(124, 58, 237, 0.08);
          border: 1px solid rgba(124, 58, 237, 0.25);
          box-shadow: 0 2px 8px rgba(124, 58, 237, 0.08);
        }
        .dark .oa .badge {
          color: #c084fc;
          background: rgba(124, 58, 237, 0.2);
          border-color: rgba(168, 85, 247, 0.35);
        }
        .oa h2 {
          font-size: clamp(26px, 3.4vw, 42px);
          font-weight: 800;
          letter-spacing: -0.025em;
          margin: 14px 0 8px;
          color: #0f0a24;
        }
        .dark .oa h2 {
          color: #ffffff;
        }
        .oa .sub {
          max-width: 660px;
          margin: 0 auto;
          color: #5b5873;
          font-size: clamp(13px, 1.4vw, 15px);
          line-height: 1.6;
          font-weight: 500;
        }
        .dark .oa .sub {
          color: #94a3b8;
        }
        .oa .orb-wrap {
          position: relative;
          display: flex;
          justify-content: center;
          margin-top: clamp(18px, 2.5vw, 28px);
        }
        .oa .orb {
          position: relative;
          width: clamp(62px, 7vw, 80px);
          aspect-ratio: 1;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 50% 30%, #ffffff, #f7f3ff 65%, #ede4ff);
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.22), 0 0 0 1px rgba(124, 58, 237, 0.25) inset;
          transform: translateZ(0);
        }
        .oa .orb .ring {
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          border: 1.5px solid rgba(124, 58, 237, 0.35);
          opacity: 0;
          pointer-events: none;
        }
        .oa .stage {
          position: relative;
        }
        .oa .spacer {
          height: clamp(48px, 5.5vw, 68px);
        }
        .oa svg.lines {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: visible;
          pointer-events: none;
        }
        .oa .base, .oa .pulse {
          fill: none;
          stroke-linecap: round;
        }
        .oa .base {
          stroke: url(#landingLinesLgWhite);
          stroke-width: 1.5;
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
        }
        .oa .pulse {
          stroke: #7c3aed;
          stroke-width: 2.5;
          stroke-dasharray: 0.08 0.92;
          stroke-dashoffset: 0;
          opacity: 0;
        }
        .oa .grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: clamp(8px, 1.6vw, 18px);
          position: relative;
        }
        .oa .box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 14px 6px 12px;
          border-radius: 18px;
          background: #ffffff;
          border: 1px solid rgba(124, 58, 237, 0.16);
          box-shadow: 0 4px 16px -4px rgba(76, 29, 149, 0.1);
          opacity: 0;
          transform: translateY(20px);
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s, background 0.3s;
          position: relative;
          will-change: transform;
        }
        .dark .oa .box {
          background: #180F3B;
          border-color: rgba(168, 85, 247, 0.22);
          box-shadow: 0 4px 16px -4px rgba(0, 0, 0, 0.4);
        }
        .oa .box:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px -6px rgba(124, 58, 237, 0.25);
          border-color: rgba(124, 58, 237, 0.5);
        }
        .dark .oa .box:hover {
          box-shadow: 0 12px 28px -6px rgba(168, 85, 247, 0.4);
          border-color: rgba(168, 85, 247, 0.6);
        }
        .oa .ico {
          width: clamp(34px, 4vw, 44px);
          aspect-ratio: 1;
          border-radius: 14px;
          display: grid;
          place-items: center;
          margin-bottom: 2px;
          box-shadow: 0 4px 10px -2px rgba(30, 20, 70, 0.15);
        }
        .oa .box span {
          font-size: clamp(10px, 1.4vw, 13px);
          font-weight: 700;
          color: #1b1533;
          letter-spacing: -0.01em;
        }
        .dark .oa .box span {
          color: #f8fafc;
        }
        .oa .box small {
          font-size: clamp(8.5px, 1.1vw, 11px);
          font-weight: 700;
          color: #059669;
          margin-top: -2px;
          letter-spacing: 0.02em;
        }
        .dark .oa .box small {
          color: #34d399;
        }
        .oa .live {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 6px rgba(16, 185, 129, 0.7);
        }
        .oa .node {
          fill: #7c3aed;
          stroke: #fff;
          stroke-width: 2;
          opacity: 0;
        }
        .oa.in .node {
          animation: fadeIn 0.4s forwards;
          animation-delay: calc(1.8s + var(--i) * 0.06s);
        }
        .oa .foot {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
          margin-top: clamp(20px, 2.4vw, 30px);
          opacity: 0;
        }
        .oa .foot span {
          font-size: 12px;
          font-weight: 600;
          color: #4b4766;
          padding: 7px 16px;
          border-radius: 999px;
          background: #faf8ff;
          border: 1px solid rgba(124, 58, 237, 0.18);
          box-shadow: 0 2px 8px -2px rgba(76, 29, 149, 0.12);
        }
        .dark .oa .foot span {
          color: #cbd5e1;
          background: #180F3B;
          border-color: rgba(168, 85, 247, 0.25);
        }
        .oa .foot span::before {
          content: "\\2713";
          color: #7c3aed;
          font-weight: 800;
          margin-right: 8px;
        }
        .dark .oa .foot span::before {
          color: #c084fc;
        }
        .oa.in .foot {
          animation: up 0.6s ease 2.2s both;
        }
        .oa.in .badge, .oa.in h2, .oa.in .sub {
          animation: up 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both;
        }
        .oa.in h2 { animation-delay: 0.08s; }
        .oa.in .sub { animation-delay: 0.16s; }
        .oa.in .orb {
          animation: pop 0.7s cubic-bezier(0.2, 1.2, 0.3, 1) 0.2s both;
        }
        .oa.in .orb .ring { animation: ring 3.5s ease-out 1.2s infinite; }
        .oa.in .base {
          animation: draw 1.1s cubic-bezier(0.6, 0, 0.2, 1) forwards;
          animation-delay: calc(0.9s + var(--i) * 0.06s);
        }
        .oa.in .pulse {
          animation: fadeIn 0.3s 2s forwards, travel 3.5s linear infinite;
          animation-delay: 2s, calc(2s + var(--i) * 0.3s);
        }
        .oa.in .box {
          animation: rise 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          animation-delay: calc(1.5s + var(--i) * 0.08s);
        }
        @keyframes up {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes pop {
          from { opacity: 0; transform: scale(0.6); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes ring {
          0% { opacity: 0.6; transform: scale(0.95); }
          100% { opacity: 0; transform: scale(1.6); }
        }
        @keyframes draw { to { stroke-dashoffset: 0; } }
        @keyframes fadeIn { to { opacity: 1; } }
        @keyframes travel { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -1; } }
        @keyframes rise { to { opacity: 1; transform: none; } }
        @media (max-width: 640px) {
          .oa .grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }
          .oa .live { top: 6px; right: 6px; }
          .oa .box { border-radius: 14px; padding: 10px 4px 8px; }
          .oa .ico { border-radius: 12px; }
        }
        @media (max-width: 400px) {
          .oa .grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .oa.in * {
            animation-duration: 0.01s !important;
            animation-delay: 0s !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>

      <div className="gridbg-light"></div>
      <div className="wrap">
        <span className="badge">Omnichannel Integration</span>
        <h2>Connect every channel in one click</h2>
        <p className="sub">
          One Agent BD links your social pages, online store and website, then replies to customers and confirms orders automatically.
        </p>

        <div className="orb-wrap">
          <div ref={orbRef} className="orb">
            <div className="ring"></div>
            {/* Exact One Agent BD official brand logo from the user's file */}
            <BrandLogo size="md" className="w-[62%] h-[62%]" />
          </div>
        </div>

        <div ref={stageRef} className="stage" id="stage">
          <svg ref={svgRef} className="lines" aria-hidden="true"></svg>
          <div className="spacer"></div>
          <div className="grid" id="grid">
            {channels.map((ch, i) => (
              <div
                key={ch.name}
                ref={(el) => (boxesRef.current[i] = el)}
                className="box"
                style={{ '--i': i } as React.CSSProperties}
              >
                <div className="ico">{ch.icon}</div>
                <span>{ch.name}</span>
                <i className="live"></i>
                <small>Connected</small>
              </div>
            ))}
          </div>
          <div className="foot">
            <span>Official Meta API</span>
            <span>1-click webhook sync</span>
            <span>Bangla and English replies</span>
          </div>
        </div>
      </div>
    </section>
  );
};
