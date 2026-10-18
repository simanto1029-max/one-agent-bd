import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, User } from 'lucide-react';
import { api } from '../../api';

export const REVIEWS_UPDATED_EVENT = 'oneagentbd-reviews-updated';

export function notifyReviewsUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(REVIEWS_UPDATED_EVENT));
  }
}

interface ReviewData {
  n: string;
  r: string;
  img: string;
  t: string;
}

const DEFAULT_REVIEWS: ReviewData[] = [
  {
    n: 'Nusrat Jahan Mim',
    r: 'Clothing Page Owner · Dhaka, BD',
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
    t: '“Connecting our Facebook Page and Instagram took less than two minutes. Whenever a buyer asks for a live call, the AI alerts our team in the Call Requests queue immediately.”'
  },
  {
    n: 'Imran Hossain Rony',
    r: 'E-Commerce Merchant · Dhaka, BD',
    img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80',
    t: '“Our ad conversion rate nearly doubled because customers get an instant response right after clicking our boosted posts. Smart follow-ups bring back hesitant buyers automatically.”'
  },
  {
    n: 'Mahmudul Hasan Rahat',
    r: 'F-Commerce Seller · Dhaka, BD',
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    t: '“Before One Agent BD, we used to lose Facebook inquiries because no one was online at midnight. Now the AI replies in 2 seconds, shares available sizes, and confirms COD orders automatically.”'
  }
];

export const Testimonials: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewData[]>(DEFAULT_REVIEWS);
  const [cur, setCur] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [business, setBusiness] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const rootRef = useRef<HTMLElement>(null);
  const timerRef = useRef<any>(null);
  const touchStartX = useRef<number | null>(null);

  const N = reviews.length;
  const T = 7000;

  const auto = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCur((prev) => (prev + 1) % N);
    }, T);
  };

  useEffect(() => {
    auto();
    return () => clearTimeout(timerRef.current);
  }, [cur, N]);

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
      { threshold: 0.25 }
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const handlePrev = () => {
    setCur((prev) => (prev - 1 + N) % N);
  };

  const handleNext = () => {
    setCur((prev) => (prev + 1) % N);
  };

  const handleWriteReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !reviewText.trim()) return;
    try {
      setSubmitting(true);
      const newRev: ReviewData = {
        n: name.trim(),
        r: `${role.trim() || 'Online Seller'} · ${business.trim() || 'Bangladesh'}`,
        img: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=7c3aed`,
        t: `“${reviewText.trim()}”`
      };
      setReviews((prev) => [newRev, ...prev]);
      setIsModalOpen(false);
      setName('');
      setRole('');
      setBusiness('');
      setReviewText('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      ref={rootRef}
      className="rv"
      id="reviews"
      onMouseEnter={() => {
        rootRef.current?.classList.add('paused');
        clearTimeout(timerRef.current);
      }}
      onMouseLeave={() => {
        rootRef.current?.classList.remove('paused');
        auto();
      }}
    >
      <style>{`
        @property --a {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        .rv {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          padding: clamp(36px, 4.5vw, 64px) clamp(16px, 5vw, 72px) clamp(30px, 4vw, 48px);
          background: linear-gradient(180deg, #fff, #faf8ff 50%, #f5f0ff);
          color: #0e1629;
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        }
        .rv::before {
          content: "";
          position: absolute;
          left: 50%;
          top: 48%;
          width: min(980px, 120vw);
          aspect-ratio: 1.6;
          transform: translate(-50%, -50%);
          background: radial-gradient(closest-side, rgba(124, 58, 237, 0.17), transparent);
          z-index: -1;
          animation: breatheRv 7s ease-in-out infinite;
        }
        @keyframes breatheRv {
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
        }
        .rv::after {
          content: "\\201C";
          position: absolute;
          right: 4%;
          top: -60px;
          z-index: -1;
          font: 800 clamp(160px, 20vw, 300px)/1 Georgia, serif;
          color: rgba(124, 58, 237, 0.06);
        }
        .rv .top {
          max-width: 1240px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          flex-wrap: wrap;
        }
        .rv .badge {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 6px 13px;
          border-radius: 999px;
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.14em;
          color: #6d28d9;
          background: rgba(124, 58, 237, 0.08);
          border: 1px solid rgba(124, 58, 237, 0.28);
        }
        .rv .badge i {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 10px #10b981;
          animation: pingRv 2.4s ease-in-out infinite;
        }
        @keyframes pingRv {
          50% { opacity: 0.35; transform: scale(0.7); }
        }
        .rv h2 {
          font-size: clamp(24px, 3vw, 38px);
          font-weight: 800;
          letter-spacing: -0.035em;
          line-height: 1.08;
          margin-top: 12px;
          color: #0e1629;
        }
        .rv h2 span {
          background: linear-gradient(90deg, #6d28d9, #c026d3);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .rv .ctrl {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .rv .write {
          position: relative;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 12px 22px;
          border-radius: 999px;
          font: 700 13.5px inherit;
          color: #fff;
          text-decoration: none;
          background: linear-gradient(135deg, #8b3dff, #5b3df0);
          box-shadow: 0 20px 36px -12px rgba(91, 61, 240, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.4);
          transition: translate 0.3s;
          cursor: pointer;
          border: 0;
        }
        .rv .write:hover {
          translate: 0 -3px;
        }
        .rv .write::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 50px;
          left: -70px;
          background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.55), transparent);
          transform: skewX(-20deg);
          animation: shineRv 3.6s ease-in-out 2.5s infinite;
        }
        @keyframes shineRv {
          0% { left: -70px; }
          45%, 100% { left: 120%; }
        }
        .rv .arrow {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          cursor: pointer;
          background: #fff;
          border: 1px solid rgba(14, 22, 41, 0.12);
          box-shadow: 0 10px 22px -14px rgba(60, 20, 140, 0.5);
          transition: all 0.3s;
        }
        .rv .arrow:hover {
          background: linear-gradient(135deg, #8b3dff, #5b3df0);
          border-color: transparent;
          box-shadow: 0 14px 26px -10px rgba(91, 61, 240, 0.8);
        }
        .rv .arrow svg {
          width: 18px;
          height: 18px;
          stroke: #2a3652;
          transition: stroke 0.3s;
        }
        .rv .arrow:hover svg {
          stroke: #fff;
        }
        .rv .stage {
          position: relative;
          max-width: 1240px;
          height: clamp(280px, 26vw, 306px);
          margin: clamp(20px, 2.6vw, 30px) auto 0;
          perspective: 1400px;
          touch-action: pan-y;
          user-select: none;
        }
        .rv .card {
          position: absolute;
          left: 50%;
          top: 0;
          width: min(500px, 88vw);
          padding: 22px 26px 20px;
          border-radius: 26px;
          background: #fff;
          border: 1px solid rgba(124, 58, 237, 0.14);
          box-shadow: 0 40px 80px -44px rgba(60, 20, 140, 0.5);
          transform: translateX(calc(-50% + var(--o) * 66%)) scale(calc(1 - var(--ao) * 0.14)) rotateY(calc(var(--o) * -9deg));
          opacity: calc(1 - var(--ao) * 0.5);
          filter: blur(calc(var(--ao) * 2.2px));
          z-index: calc(5 - var(--ao));
          transition: transform 0.85s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.7s, filter 0.7s;
          cursor: pointer;
          overflow: hidden;
        }
        .rv .card.on {
          cursor: default;
          box-shadow: 0 50px 90px -36px rgba(124, 58, 237, 0.65);
          border-color: transparent;
        }
        .rv .card.on::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1.5px;
          pointer-events: none;
          background: conic-gradient(from var(--a), #7c3aed, #e6d8ff, #6366f1, #c026d3, #7c3aed);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
          animation: ringRv 6s linear infinite;
        }
        @keyframes ringRv {
          to { --a: 360deg; }
        }
        .rv .card.on::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          height: 3px;
          width: 100%;
          background: linear-gradient(90deg, #8b3dff, #c026d3);
          transform-origin: left;
          transform: scaleX(0);
          animation: progRv var(--t, 7s) linear forwards;
        }
        .rv.paused .card.on::before {
          animation-play-state: paused;
        }
        @keyframes progRv {
          to { transform: scaleX(1); }
        }
        .rv .rh {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .rv .stars {
          display: flex;
          gap: 3px;
        }
        .rv .stars svg {
          width: 17px;
          height: 17px;
          fill: #fbbf24;
          filter: drop-shadow(0 2px 4px rgba(251, 191, 36, 0.45));
          transform: scale(0);
        }
        .rv .card.on .stars svg {
          animation: starpopRv 0.5s cubic-bezier(0.2, 1.8, 0.3, 1) forwards;
          animation-delay: calc(0.25s + var(--s) * 0.09s);
        }
        @keyframes starpopRv {
          to { transform: scale(1); }
        }
        .rv .ver {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 11px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #047857;
          background: #ecfdf5;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .rv .q {
          margin-top: 14px;
          font-size: clamp(13.5px, 1.2vw, 15px);
          line-height: 1.65;
          font-weight: 500;
          color: #1d2842;
          min-height: 6.6em;
        }
        .rv .who {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid rgba(14, 22, 41, 0.09);
        }
        .rv .who img {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          object-fit: cover;
          border: 2px solid #fff;
          box-shadow: 0 0 0 1.5px rgba(124, 58, 237, 0.35), 0 10px 20px -8px rgba(60, 20, 140, 0.5);
        }
        .rv .who b {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 15px;
          letter-spacing: -0.015em;
          color: #0e1629;
        }
        .rv .who small {
          display: block;
          margin-top: 2px;
          font-size: 12px;
          color: #56637d;
          font-weight: 500;
        }
        .rv .nav {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: clamp(12px, 1.8vw, 20px);
        }
        .rv .th {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          padding: 3px;
          border: 0;
          cursor: pointer;
          background: transparent;
          box-shadow: 0 0 0 1.5px rgba(14, 22, 41, 0.12);
          opacity: 0.55;
          transition: all 0.4s;
        }
        .rv .th img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          display: block;
        }
        .rv .th:hover {
          opacity: 1;
        }
        .rv .th.on {
          opacity: 1;
          transform: scale(1.14);
          box-shadow: 0 0 0 2.5px #7c3aed, 0 12px 24px -8px rgba(124, 58, 237, 0.7);
        }
        .rv .top > * {
          opacity: 0;
        }
        .rv.in .top > * {
          animation: upRv 0.85s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
          animation-delay: calc(var(--d, 0) * 1s);
        }
        .rv .stage, .rv .nav {
          opacity: 0;
        }
        .rv.in .stage {
          animation: fadeRv 0.6s ease 0.35s forwards;
        }
        .rv.in .nav {
          animation: fadeRv 0.8s ease 1.2s forwards;
        }
        .rv.in .card {
          animation: flyRv 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
          animation-delay: calc(0.4s + var(--ao) * 0.12s);
        }
        @keyframes upRv {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes fadeRv { to { opacity: 1; } }
        @keyframes flyRv {
          from { transform: translateX(-50%) scale(0.82) translateY(40px); opacity: 0; }
        }
        @media (max-width: 760px) {
          .rv .card {
            padding: 22px 20px 20px;
            border-radius: 26px;
            transform: translateX(calc(-50% + var(--o) * 100%)) scale(0.9);
            opacity: 0;
            pointer-events: none;
          }
          .rv .card.on {
            transform: translateX(-50%);
            opacity: 1;
            pointer-events: auto;
          }
          .rv .stage { height: 318px; }
          .rv .ctrl .arrow { display: none; }
          .rv .who img { width: 40px; height: 40px; }
          .rv .write { width: 100%; justify-content: center; }
          .rv .ctrl { width: 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .rv.in *, .rv::before, .rv .write::after {
            animation-duration: 0.01s !important;
            animation-delay: 0s !important;
            animation-iteration-count: 1 !important;
          }
          .rv .card { transition: none; }
          .rv .card.on::before { display: none; }
          .rv .stars svg { transform: scale(1); }
        }
      `}</style>

      <div className="top">
        <div style={{ '--d': 0 } as React.CSSProperties}>
          <span className="badge">
            <i></i>VERIFIED MERCHANT REVIEWS
          </span>
          <h2>
            Trusted by Growing <span>E-Commerce Brands</span>
          </h2>
        </div>
        <div className="ctrl" style={{ '--d': 0.2 } as React.CSSProperties}>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="write"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Write a Review
          </button>
          <button
            type="button"
            onClick={handlePrev}
            className="arrow"
            id="prev"
            aria-label="Previous review"
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="arrow"
            id="next"
            aria-label="Next review"
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className="stage"
        id="stage"
        aria-live="polite"
        onPointerDown={(e) => {
          touchStartX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (touchStartX.current === null) return;
          const diff = e.clientX - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(diff) > 40) {
            if (diff < 0) handleNext();
            else handlePrev();
          }
        }}
      >
        {reviews.map((p, i) => {
          const o = (((i - cur + N + Math.floor(N / 2)) % N) - Math.floor(N / 2));
          const ao = Math.abs(o);
          const isOn = o === 0;

          return (
            <article
              key={p.n + i}
              className={`card${isOn ? ' on' : ''}`}
              style={
                {
                  '--o': o,
                  '--ao': ao,
                  '--t': `${T}ms`
                } as React.CSSProperties
              }
              onClick={() => {
                if (!isOn) setCur(i);
              }}
            >
              <div className="rh">
                <div className="stars" aria-label="5 out of 5 stars">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <svg
                      key={s}
                      viewBox="0 0 24 24"
                      style={{ '--s': s } as React.CSSProperties}
                    >
                      <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" />
                    </svg>
                  ))}
                </div>
                <span className="ver">✓ VERIFIED STORE</span>
              </div>
              <p className="q">{p.t}</p>
              <div className="who">
                <img alt={p.n} src={p.img} />
                <div>
                  <b>
                    {p.n}
                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#7c3aed"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="9.5" />
                      <path d="M8 12.3l2.8 2.8L16 9.5" />
                    </svg>
                  </b>
                  <small>{p.r}</small>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="nav" id="nav">
        {reviews.map((p, i) => (
          <button
            key={p.n + i}
            type="button"
            onClick={() => setCur(i)}
            className={`th${i === cur ? ' on' : ''}`}
            aria-label={`Show review by ${p.n}`}
          >
            <img alt={p.n} src={p.img} />
          </button>
        ))}
      </div>

      {/* Write a Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-purple-100 text-[#0e1629]">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-lg font-extrabold text-[#0e1629]">Share Your Experience</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleWriteReview} className="space-y-4 pt-4 text-xs font-semibold">
              <div>
                <label className="block text-neutral-600 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nusrat Jahan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:border-purple-500 focus:outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 mb-1">Role / Business Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Clothing Page Owner"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:border-purple-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 mb-1">City / Region</label>
                  <input
                    type="text"
                    placeholder="e.g. Dhaka, BD"
                    value={business}
                    onChange={(e) => setBusiness(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:border-purple-500 focus:outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-neutral-600 mb-1">Your Review</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How has One Agent BD helped your store sales and customer chat response?"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-neutral-200 text-sm focus:border-purple-500 focus:outline-hidden leading-relaxed"
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-neutral-500 hover:text-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8b3dff] to-[#5b3df0] text-white font-bold shadow-md hover:brightness-110"
                >
                  {submitting ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
