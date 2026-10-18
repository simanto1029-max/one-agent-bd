import React, { useEffect, useRef } from 'react';

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
        <svg viewBox="0 0 48 48" className="w-9 h-9 sm:w-10 sm:h-10">
          <circle cx="24" cy="24" r="22" fill="#1877f2" />
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
        <svg viewBox="0 0 48 48" className="w-9 h-9 sm:w-10 sm:h-10">
          <defs>
            <radialGradient id="igLandingGrad2" cx="0.2" cy="1" r="1">
              <stop offset="0" stopColor="#FFDD55" />
              <stop offset="0.3" stopColor="#FF543E" />
              <stop offset="0.6" stopColor="#C837AB" />
              <stop offset="1" stopColor="#4158D0" />
            </radialGradient>
          </defs>
          <rect width="44" height="44" x="2" y="2" rx="13" fill="url(#igLandingGrad2)" />
          <rect x="11.5" y="11.5" width="25" height="25" rx="7" fill="none" stroke="#fff" strokeWidth="2.8" />
          <circle cx="24" cy="24" r="5.5" fill="none" stroke="#fff" strokeWidth="2.8" />
          <circle cx="31.2" cy="16.8" r="1.6" fill="#fff" />
        </svg>
      )
    },
    {
      name: 'WhatsApp',
      icon: (
        <svg viewBox="0 0 48 48" className="w-9 h-9 sm:w-10 sm:h-10">
          <circle cx="24" cy="24" r="22" fill="#25d366" />
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
        <svg viewBox="0 0 48 48" className="w-9 h-9 sm:w-10 sm:h-10">
          <circle cx="24" cy="24" r="22" fill="#21759b" />
          <circle cx="24" cy="24" r="18" fill="none" stroke="#fff" strokeWidth="2.4" />
          <text x="24" y="32" textAnchor="middle" fontFamily="Georgia,serif" fontWeight="700" fontSize="24" fill="#fff">
            W
          </text>
        </svg>
      )
    },
    {
      name: 'Shopify',
      icon: (
        <svg viewBox="0 0 48 48" className="w-9 h-9 sm:w-10 sm:h-10">
          <rect width="44" height="44" x="2" y="2" rx="13" fill="#95bf47" />
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
        <svg viewBox="0 0 48 48" className="w-9 h-9 sm:w-10 sm:h-10">
          <rect width="44" height="44" x="2" y="2" rx="13" fill="#2a2147" />
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
      const o = orb.getBoundingClientRect();
      const tx = o.left + o.width / 2 - s.left;
      const y0 = o.top + o.height - s.top - 2;

      svg.setAttribute('viewBox', `0 0 ${s.width} ${s.height}`);

      let html = `<defs><linearGradient id="landingLinesLg" gradientUnits="userSpaceOnUse" x1="0" y1="${y0}" x2="0" y2="${s.height}">
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

    // Sparks creation
    const ow = orbRef.current?.parentElement;
    if (ow && ow.querySelectorAll('.spark').length === 0) {
      for (let k = 0; k < 16; k++) {
        const a = Math.random() * 6.283;
        const rd = 70 + Math.random() * 80;
        const sp = document.createElement('i');
        sp.className = 'spark';
        sp.style.cssText = `--x:${(Math.cos(a) * rd).toFixed(0)}px;--y:${(Math.sin(a) * rd - 20).toFixed(
          0
        )}px;--d:${(3 + Math.random() * 3).toFixed(1)}s;--dl:${(1.5 + Math.random() * 3).toFixed(1)}s`;
        ow.appendChild(sp);
      }
    }

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
      }, 120);
    };

    window.addEventListener('resize', handleResize);

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
      { threshold: 0.15 }
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
        .oa {
          position: relative;
          overflow: hidden;
          padding: clamp(36px, 4vw, 56px) 16px clamp(30px, 3.5vw, 48px);
          isolation: isolate;
          background: #080614;
          color: #fff;
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          border-radius: 32px;
          margin: 18px 0;
          border: 1px solid rgba(124, 58, 237, 0.22);
          box-shadow: 0 20px 60px -20px rgba(0, 0, 0, 0.7);
        }
        .oa::before {
          content: "";
          position: absolute;
          left: 50%;
          top: clamp(80px, 9vw, 120px);
          width: min(900px, 120vw);
          aspect-ratio: 1;
          transform: translate(-50%, -50%);
          background: radial-gradient(closest-side, rgba(124, 58, 237, 0.38), rgba(124, 58, 237, 0.08) 55%, transparent);
          z-index: -1;
          filter: blur(14px);
        }
        .oa::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          opacity: 0.08;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
        }
        .gridbg {
          position: absolute;
          inset: 0;
          z-index: -1;
          background-image: radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px);
          background-size: 28px 28px;
          -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 25%, #000, transparent 75%);
          mask-image: radial-gradient(ellipse 70% 60% at 50% 25%, #000, transparent 75%);
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
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #d8c4ff;
          background: rgba(124, 58, 237, 0.22);
          border: 1px solid rgba(168, 85, 247, 0.45);
          box-shadow: 0 0 24px rgba(124, 58, 237, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }
        .oa h2 {
          font-size: clamp(26px, 3.4vw, 42px);
          font-weight: 800;
          letter-spacing: -0.025em;
          margin: 14px 0 8px;
          background: linear-gradient(180deg, #fff 40%, #c4a8ff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .oa .sub {
          max-width: 660px;
          margin: 0 auto;
          color: #a5a5c0;
          font-size: clamp(13px, 1.4vw, 15px);
          line-height: 1.6;
        }
        .oa .orb-wrap {
          position: relative;
          display: flex;
          justify-content: center;
          margin-top: clamp(18px, 2.5vw, 28px);
        }
        .oa .orb {
          position: relative;
          width: clamp(58px, 6.5vw, 76px);
          aspect-ratio: 1;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: radial-gradient(circle at 50% 30%, #302066, #160e3a 60%, #0a061c);
          box-shadow: 0 0 0 1px rgba(168, 85, 247, 0.6) inset, 0 0 30px rgba(124, 58, 237, 0.45) inset, 0 0 70px 14px rgba(124, 58, 237, 0.75), 0 0 140px 40px rgba(124, 58, 237, 0.35);
          perspective: 300px;
        }
        .oa .orb .logo {
          width: 58%;
          height: 58%;
          object-fit: contain;
          filter: drop-shadow(0 0 12px rgba(168, 85, 247, 0.95));
          transform-style: preserve-3d;
        }
        .oa .orb .ring {
          position: absolute;
          inset: -14px;
          border-radius: 50%;
          border: 1px solid rgba(168, 85, 247, 0.45);
          opacity: 0;
        }
        .oa .orb::before {
          content: "";
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, transparent 0, #d6b8ff 18%, transparent 40%, #7c3aed 65%, transparent 85%);
          -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px));
          mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px));
          animation: spin 5s linear infinite;
        }
        .oa .spark {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #e4d2ff;
          box-shadow: 0 0 8px #a855f7;
          opacity: 0;
        }
        .oa.in .spark {
          animation: drift var(--d) ease-in-out var(--dl) infinite;
        }
        @keyframes drift {
          0% { opacity: 0; transform: translate(0, 0) scale(0.5); }
          30% { opacity: 0.95; }
          100% { opacity: 0; transform: translate(var(--x), var(--y)) scale(1); }
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
          stroke: url(#landingLinesLg);
          stroke-width: 1.5;
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
        }
        .oa .pulse {
          stroke: #d6b8ff;
          stroke-width: 2.5;
          stroke-dasharray: 0.08 0.92;
          stroke-dashoffset: 0;
          opacity: 0;
          filter: drop-shadow(0 0 6px #a855f7) drop-shadow(0 0 12px #7c3aed);
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
          border: 1px solid rgba(168, 85, 247, 0.32);
          backdrop-filter: blur(8px);
          opacity: 0;
          transform: translateY(24px) scale(0.94);
          transition: border-color 0.3s, box-shadow 0.3s;
          position: relative;
          overflow: hidden;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.015));
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16), 0 24px 44px -22px rgba(0, 0, 0, 0.9);
        }
        .oa .box::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          pointer-events: none;
          background: linear-gradient(160deg, rgba(214, 184, 255, 0.8), rgba(124, 58, 237, 0.15) 40%, rgba(124, 58, 237, 0.45));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
        }
        .oa .box::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s;
          background: radial-gradient(160px circle at var(--mx, 50%) var(--my, 0%), rgba(168, 85, 247, 0.35), transparent 65%);
        }
        .oa .box:hover {
          border-color: rgba(168, 85, 247, 0.85);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 0 46px -6px rgba(124, 58, 237, 0.7);
        }
        .oa .box:hover::before {
          opacity: 1;
        }
        .oa .ico {
          width: clamp(34px, 4vw, 44px);
          aspect-ratio: 1;
          border-radius: 16px;
          display: grid;
          place-items: center;
          margin-bottom: 2px;
        }
        .oa .box span {
          font-size: clamp(10px, 1.4vw, 13px);
          font-weight: 700;
          color: #f0f0fa;
          letter-spacing: -0.01em;
        }
        .oa .box small {
          font-size: clamp(8.5px, 1.1vw, 11px);
          font-weight: 700;
          color: #34d399;
          margin-top: -2px;
          letter-spacing: 0.02em;
        }
        .oa .live {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 6.5px;
          height: 6.5px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 10px #34d399;
          animation: ping 2.4s ease-in-out infinite;
        }
        .oa .node {
          fill: #efe4ff;
          opacity: 0;
          filter: drop-shadow(0 0 6px #a855f7);
        }
        .oa.in .node {
          animation: fadeIn 0.5s forwards;
          animation-delay: calc(2.2s + var(--i) * 0.08s);
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
          color: #d1cbe5;
          padding: 7px 16px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(124, 58, 237, 0.28);
          box-shadow: 0 4px 16px -6px rgba(124, 58, 237, 0.3);
        }
        .oa .foot span::before {
          content: "\\2713";
          color: #a855f7;
          font-weight: 800;
          margin-right: 8px;
        }
        .oa.in .foot {
          animation: up 0.8s ease 3s both;
        }
        .oa.in .badge, .oa.in h2, .oa.in .sub {
          animation: up 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) both;
        }
        .oa.in h2 { animation-delay: 0.1s; }
        .oa.in .sub { animation-delay: 0.2s; }
        .oa.in .orb {
          animation: pop 1s cubic-bezier(0.2, 1.2, 0.3, 1) 0.3s both, breathe 3.6s ease-in-out 1.3s infinite;
        }
        .oa.in .orb .ring { animation: ring 3.6s ease-out 1.3s infinite; }
        .oa.in .orb .logo { animation: flip 7s cubic-bezier(0.6, 0, 0.3, 1) 1.6s infinite; }
        .oa.in .base {
          animation: draw 1.3s cubic-bezier(0.6, 0, 0.2, 1) forwards;
          animation-delay: calc(1.1s + var(--i) * 0.08s);
        }
        .oa.in .pulse {
          animation: fadeIn 0.4s 2.5s forwards, travel 3.2s linear infinite;
          animation-delay: 2.5s, calc(2.5s + var(--i) * 0.35s);
        }
        .oa.in .box {
          animation: rise 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards, float 5s ease-in-out infinite;
          animation-delay: calc(1.9s + var(--i) * 0.1s), calc(2.9s + var(--i) * 0.3s);
        }
        .oa.in .ico {
          animation: glow 3.2s ease-in-out infinite;
          animation-delay: calc(3.4s + var(--i) * 0.35s);
        }
        @keyframes up {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes pop {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes breathe {
          50% { box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.15) inset, 0 0 85px 20px rgba(124, 58, 237, 0.85), 0 0 170px 55px rgba(124, 58, 237, 0.4); }
        }
        @keyframes ring {
          0% { opacity: 0.7; transform: scale(0.9); }
          100% { opacity: 0; transform: scale(1.9); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes flip { 0%, 55% { transform: rotateY(0); } 100% { transform: rotateY(360deg); } }
        @keyframes draw { to { stroke-dashoffset: 0; } }
        @keyframes fadeIn { to { opacity: 1; } }
        @keyframes travel { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -1; } }
        @keyframes rise { to { opacity: 1; transform: none; } }
        @keyframes float { 0%, 100% { translate: 0 0; } 50% { translate: 0 -6px; } }
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.5)); }
          50% { filter: drop-shadow(0 4px 16px rgba(124, 58, 237, 0.85)); }
        }
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

      <div className="gridbg"></div>
      <div className="wrap">
        <span className="badge">Omnichannel Integration</span>
        <h2>Connect every channel in one click</h2>
        <p className="sub">
          One Agent BD links your social pages, online store and website, then replies to customers and confirms orders automatically.
        </p>

        <div className="orb-wrap">
          <div ref={orbRef} className="orb">
            <div className="ring"></div>
            {/* High-fidelity connected infinity nodes glyph matching Screenshot 2 */}
            <svg className="logo" viewBox="0 0 64 64" fill="none">
              <defs>
                <linearGradient id="orbInfinityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="50%" stopColor="#818CF8" />
                  <stop offset="100%" stopColor="#C084FC" />
                </linearGradient>
                <filter id="orbGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <circle cx="32" cy="18" r="4.5" fill="#38BDF8" filter="url(#orbGlow)" />
              <circle cx="21" cy="42" r="4.5" fill="#818CF8" filter="url(#orbGlow)" />
              <circle cx="43" cy="42" r="4.5" fill="#C084FC" filter="url(#orbGlow)" />
              <path
                d="M32 18 C32 26 21 34 21 42 C21 48 29 48 32 42 C35 36 43 28 43 42 C43 48 35 48 32 42"
                stroke="url(#orbInfinityGrad)"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#orbGlow)"
              />
            </svg>
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
                onPointerMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
                  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
                }}
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
