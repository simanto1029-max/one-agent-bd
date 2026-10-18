import React, { useEffect, useRef } from 'react';

interface CostComparisonProps {
  onStartTrial?: () => void;
}

export const CostComparison: React.FC<CostComparisonProps> = ({ onStartTrial }) => {
  const rootRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const count = () => {
      const els = root.querySelectorAll('[data-to]');
      els.forEach((el, i) => {
        const to = +(el.getAttribute('data-to') || '0');
        const t0 = performance.now() + 700 + i * 150;
        const dur = 1500;
        const step = (n: number) => {
          const p = Math.min(Math.max((n - t0) / dur, 0), 1);
          el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toString();
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    };

    const start = () => {
      root.classList.add('in');
      count();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          start();
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(root);

    // 3D tilt interaction
    const fr = frameRef.current;
    const v = fr?.parentElement;
    if (v && fr && window.matchMedia('(hover:hover)').matches) {
      const handlePointerMove = (e: PointerEvent) => {
        const r = fr.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        fr.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
      };
      const handlePointerLeave = () => {
        fr.style.transform = '';
      };
      v.addEventListener('pointermove', handlePointerMove as any);
      v.addEventListener('pointerleave', handlePointerLeave);
      return () => {
        v.removeEventListener('pointermove', handlePointerMove as any);
        v.removeEventListener('pointerleave', handlePointerLeave);
        observer.disconnect();
      };
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={rootRef} className="why" id="why">
      <style>{`
        .why {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          display: flex;
          align-items: center;
          padding: clamp(32px, 4vw, 56px) clamp(20px, 5vw, 72px);
          background: linear-gradient(180deg, #fff 0, #fbf9ff 55%, #fff 100%);
          color: #0e1629;
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        }
        .why::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background: linear-gradient(90deg, transparent calc(25% - 1px), rgba(14,22,41,.045) 25%, transparent calc(25% + 1px), transparent calc(50% - 1px), rgba(14,22,41,.045) 50%, transparent calc(50% + 1px), transparent calc(75% - 1px), rgba(14,22,41,.045) 75%, transparent calc(75% + 1px));
        }
        .why::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          opacity: 0.035;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
        }
        .why .amb {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          z-index: -1;
          pointer-events: none;
        }
        .why .a1 {
          width: 560px;
          height: 560px;
          right: -120px;
          top: 8%;
          background: rgba(124, 58, 237, 0.2);
          animation: driftWhy 14s ease-in-out infinite;
        }
        .why .a2 {
          width: 420px;
          height: 420px;
          left: -140px;
          bottom: -60px;
          background: rgba(99, 102, 241, 0.14);
          animation: driftWhy 18s ease-in-out infinite reverse;
        }
        @keyframes driftWhy {
          50% { transform: translate(40px, -30px) scale(1.08); }
        }
        .why .inner {
          width: 100%;
          max-width: 1360px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(24px, 4vw, 64px);
          align-items: stretch;
        }
        .why .copy {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
        }
        .why .badge {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          color: #6d28d9;
          background: rgba(124, 58, 237, 0.07);
          border: 1px solid rgba(124, 58, 237, 0.22);
          box-shadow: 0 6px 20px -8px rgba(124, 58, 237, 0.3), inset 0 1px 0 #fff;
        }
        .why .badge i, .why .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 10px #10b981;
          animation: ping 2.4s ease-in-out infinite;
        }
        .why h2 {
          font-size: clamp(28px, 3.3vw, 50px);
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: -0.035em;
          margin: 14px 0 12px;
          color: #0e1629;
        }
        .why .strike {
          position: relative;
          display: inline-block;
          color: #ff2a5f;
          white-space: nowrap;
        }
        .why .strike::after {
          content: "";
          position: absolute;
          left: -2%;
          right: -2%;
          top: 56%;
          height: 0.09em;
          border-radius: 6px;
          background: #ff2a5f;
          box-shadow: 0 0 18px rgba(255, 42, 95, 0.6);
          transform: scaleX(0);
          transform-origin: left;
        }
        .why .save {
          position: absolute;
          right: -4%;
          top: -0.52em;
          font-size: 0.2em;
          font-weight: 800;
          letter-spacing: 0;
          color: #fff;
          background: linear-gradient(135deg, #10b981, #059669);
          padding: 0.5em 0.9em;
          border-radius: 999px;
          box-shadow: 0 10px 22px -6px rgba(5, 150, 105, 0.6);
          transform: rotate(-7deg) scale(0);
          opacity: 0;
        }
        .why .lead {
          max-width: 520px;
          font-size: clamp(14.5px, 1.2vw, 16.5px);
          line-height: 1.6;
          color: #4a5872;
          font-weight: 500;
        }
        .why .lead b {
          color: #0e1629;
          font-weight: 700;
        }
        .why .btn {
          position: relative;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          margin-top: 18px;
          padding: 12px 24px;
          border-radius: 999px;
          font: 700 15px/1 inherit;
          color: #fff;
          text-decoration: none;
          background: linear-gradient(135deg, #8b3dff, #5b3df0);
          box-shadow: 0 22px 40px -14px rgba(91, 61, 240, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.4);
          transition: translate 0.25s, box-shadow 0.25s;
          cursor: pointer;
        }
        .why .btn:hover {
          translate: 0 -3px;
          box-shadow: 0 28px 50px -14px rgba(91, 61, 240, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }
        .why .btn::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 60px;
          left: -80px;
          background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.55), transparent);
          transform: skewX(-20deg);
          animation: shineWhy 3.6s ease-in-out 2.5s infinite;
        }
        @keyframes shineWhy {
          0% { left: -80px; }
          45%, 100% { left: 120%; }
        }
        .why .stats {
          display: flex;
          margin-top: 22px;
          padding-top: 16px;
          border-top: 1px solid rgba(14, 22, 41, 0.1);
          max-width: 640px;
        }
        .why .stat {
          padding: 0 clamp(18px, 3vw, 40px);
          border-left: 1px solid rgba(14, 22, 41, 0.1);
        }
        .why .stat:first-child {
          padding-left: 0;
          border-left: 0;
        }
        .why .stat strong {
          display: block;
          font-size: clamp(22px, 2.3vw, 30px);
          line-height: 1;
          font-weight: 800;
          letter-spacing: -0.03em;
          background: linear-gradient(180deg, #5b21b6, #a855f7);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .why .stat span {
          display: block;
          margin-top: 6px;
          font-size: 12.5px;
          color: #4a5872;
          font-weight: 600;
        }
        .why .visual {
          position: relative;
          perspective: 1200px;
          display: flex;
        }
        .why .visual::before {
          content: "";
          position: absolute;
          inset: 7% -5% -6% 9%;
          border-radius: 44px;
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.55), rgba(99, 102, 241, 0.25));
          z-index: 0;
          transform: rotate(3deg);
        }
        .why .visual::after {
          content: "";
          position: absolute;
          inset: -4% 9% 7% -5%;
          border-radius: 44px;
          border: 1px solid rgba(124, 58, 237, 0.3);
          z-index: 0;
          transform: rotate(-2.5deg);
        }
        .why .frame {
          position: relative;
          z-index: 1;
          flex: 1;
          display: flex;
          padding: 14px;
          border-radius: 36px;
          background: linear-gradient(160deg, #fff, #f4eeff);
          border: 1px solid rgba(124, 58, 237, 0.25);
          box-shadow: 0 60px 100px -40px rgba(60, 20, 140, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.9) inset;
          transform-style: preserve-3d;
          transition: transform 0.3s ease-out;
        }
        .why .photo {
          position: relative;
          overflow: hidden;
          border-radius: 26px;
          flex: 1;
          min-height: 230px;
        }
        .why .photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 68% 35%;
          display: block;
          transform: scale(1.18);
        }
        .why .photo::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 50%, rgba(40, 16, 100, 0.35));
        }
        .why .chip {
          position: absolute;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 18px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.9);
          -webkit-backdrop-filter: blur(16px);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(124, 58, 237, 0.2);
          box-shadow: 0 26px 50px -16px rgba(60, 20, 140, 0.55);
          font-size: 14px;
          font-weight: 800;
          opacity: 0;
        }
        .why .chip small {
          display: block;
          margin-top: 2px;
          font-size: 12.5px;
          font-weight: 600;
          color: #4a5872;
        }
        .why .ic {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          color: #fff;
          font-size: 20px;
          background: linear-gradient(135deg, #8b3dff, #5b6cf0);
          box-shadow: 0 8px 18px -6px rgba(91, 61, 240, 0.7);
        }
        .why .c1 { left: -9%; bottom: 10%; }
        .why .c2 { right: -6%; top: 8%; }
        .why .rv {
          opacity: 0;
          transform: translateY(26px);
        }
        .why.in .rv {
          animation: upWhy 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
          animation-delay: calc(var(--d, 0) * 1s);
        }
        .why.in .strike::after {
          animation: crossWhy 0.75s cubic-bezier(0.7, 0, 0.2, 1) 1.1s forwards;
        }
        .why.in .save {
          animation: tagWhy 0.6s cubic-bezier(0.2, 1.5, 0.3, 1) 1.8s forwards;
        }
        .why.in .photo {
          animation: wipeWhy 1.3s cubic-bezier(0.7, 0, 0.2, 1) 0.2s both;
        }
        .why.in .photo img {
          animation: zoomWhy 2s cubic-bezier(0.2, 0.7, 0.2, 1) 0.2s forwards;
        }
        .why.in .frame {
          animation: slideWhy 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
        }
        .why.in .visual::before {
          animation: plateWhy 1.4s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s backwards;
        }
        .why.in .chip {
          animation: popWhy 0.7s cubic-bezier(0.2, 1.3, 0.3, 1) forwards, floatWhy 5s ease-in-out infinite;
          animation-delay: calc(1.4s + var(--d) * 1s), calc(2.3s + var(--d) * 1s);
        }
        @keyframes upWhy {
          from { opacity: 0; transform: translateY(26px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes crossWhy {
          to { transform: scaleX(1); }
        }
        @keyframes tagWhy {
          to { transform: rotate(-7deg) scale(1); opacity: 1; }
        }
        @keyframes wipeWhy {
          from { clip-path: inset(0 100% 0 0 round 26px); }
          to { clip-path: inset(0 0 0 0 round 26px); }
        }
        @keyframes zoomWhy {
          to { transform: scale(1); }
        }
        @keyframes slideWhy {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes plateWhy {
          from { opacity: 0; transform: rotate(12deg) translate(40px, 40px); }
        }
        @keyframes popWhy {
          from { opacity: 0; transform: scale(0.7) translateY(16px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes floatWhy {
          0%, 100% { translate: 0 0; }
          50% { translate: 0 -9px; }
        }
        @media (max-width: 900px) {
          .why .inner { grid-template-columns: 1fr; }
          .why .c1 { left: 2%; }
          .why .c2 { right: 2%; }
          .why .visual { max-width: 620px; margin: 0 auto; width: 100%; }
          .why .frame { display: block; }
          .why .photo { aspect-ratio: 900/623; min-height: 0; }
        }
        @media (max-width: 520px) {
          .why .stats { max-width: none; }
          .why .stat { padding: 0 14px; }
          .why .chip { padding: 10px 13px; font-size: 13px; }
          .why .chip small { display: none; }
          .why .btn { width: 100%; justify-content: center; }
          .why .save { right: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .why.in *, .why .amb, .why .btn::after {
            animation-duration: 0.01s !important;
            animation-delay: 0s !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>

      <div className="amb a1"></div>
      <div className="amb a2"></div>

      <div className="inner">
        <div className="copy">
          <span className="badge rv" style={{ '--d': 0 } as React.CSSProperties}>
            <i></i>24/7 autonomous AI moderator
          </span>
          <h2 className="rv" style={{ '--d': 0.1 } as React.CSSProperties}>
            Why Pay{' '}
            <span className="strike">
              20,000 TK
              <span className="save">Save 90%</span>
            </span>{' '}
            for a Moderator?
          </h2>
          <p className="lead rv" style={{ '--d': 0.25 } as React.CSSProperties}>
            Replace slow human shifts with <b>24/7 autonomous AI</b>. Cut <b>90%</b> of your operating expense while replying <b>10x faster</b>.
          </p>
          <button
            type="button"
            onClick={onStartTrial}
            className="btn rv cursor-pointer"
            style={{ '--d': 0.4 } as React.CSSProperties}
          >
            Replace your moderator today
          </button>
          <div className="stats">
            <div className="stat rv" style={{ '--d': 0.55 } as React.CSSProperties}>
              <strong>
                <span data-to="90">0</span>%
              </strong>
              <span>Lower operating cost</span>
            </div>
            <div className="stat rv" style={{ '--d': 0.65 } as React.CSSProperties}>
              <strong>
                <span data-to="10">0</span>x
              </strong>
              <span>Faster replies</span>
            </div>
            <div className="stat rv" style={{ '--d': 0.75 } as React.CSSProperties}>
              <strong>24/7</strong>
              <span>Always online</span>
            </div>
          </div>
        </div>

        <div className="visual rv" style={{ '--d': 0.15 } as React.CSSProperties}>
          <div className="chip c2" style={{ '--d': 0 } as React.CSSProperties}>
            <span className="dot"></span>
            <div>
              Online 24/7<small>No shifts, no breaks</small>
            </div>
          </div>
          <div ref={frameRef} className="frame" id="frame">
            <div className="photo">
              <img
                alt="Customer support moderator"
                src="https://as1.ftcdn.net/v2/jpg/06/27/40/15/360_F_627401533_DlCrKgnWzhy3vlnwQKZjeDEkTnofF8bk.jpg"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80';
                }}
              />
            </div>
          </div>
          <div className="chip c1" style={{ '--d': 0.25 } as React.CSSProperties}>
            <div className="ic">&#10003;</div>
            <div>
              Order confirmed<small>Replied in 0.8s</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
