import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, User, ChevronLeft, ChevronRight, Star } from 'lucide-react';
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
    n: 'Tanvir Ahmed',
    r: 'Founder, StyleVerse Fashion · Dhanmondi, Dhaka',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    t: '“আমরা রাত ২টা-৩টার দিকে প্রচুর কাস্টমার ইনবক্স পেতাম এবং সকালে ঘুম থেকে উঠে দেখতাম কাস্টমার অন্য পেজে চলে গেছে। One Agent BD চালু করার পর থেকে মাঝরাতেও ২ সেকেন্ডে প্রডাক্টের ছবি ও সাইজ দিয়ে ক্যাশ অন ডেলিভারি অর্ডার কনফার্ম করে দিচ্ছে। আমাদের মান্থলি সেলস প্রায় ৪৫% বৃদ্ধি পেয়েছে!”'
  },
  {
    n: 'Nusrat Jahan Mim',
    r: "Owner, Mim's Hijab & Abaya · Uttara, Dhaka",
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
    t: '“ফেইসবুক ও ইনস্টাগ্রাম পেইজে প্রতিদিন শত শত মেসেজের রিপ্লাই দিতে গিয়ে আমার পুরো দিন চলে যেত। এখন কাস্টমার ভয়েস মেসেজ পাঠালে এআই খাঁটি বাংলায় সঠিক সাইজ ও ফেব্রিক ডিটেইলস বুঝিয়ে দেয়। Steadfast কুরিয়ারেও এক ক্লিকে পার্সেল এন্ট্রি হয়ে যায়।”'
  },
  {
    n: 'Imran Hossain Rony',
    r: 'Managing Director, TechGadget BD · Motijheel, Dhaka',
    img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80',
    t: '“বুস্টেড পোস্টের কমেন্টে কাস্টমাররা দাম জানতে চাইলে সাথে সাথে এআই ইনবক্সে ডিএম পাঠায়। সবচেয়ে বড় সুবিধা হলো ফেক অর্ডার ও কুরিয়ার ডেলিভারি সাকসেস রেশিও স্বয়ংক্রিয়ভাবে চেক করে দেয়, যার কারণে আমাদের রিটার্ন পার্সেল রেট ৩৫% থেকে নেমে ৬%-এ এসেছে।”'
  },
  {
    n: 'Sultana Razia',
    r: 'Co-Founder, Glow Aura Skincare · Banani, Dhaka',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
    t: '“প্রোডাক্টের ছবি পাঠালে এআই ইমেজ সার্চ করে ক্যাটালগ থেকে স্কিন টাইপ অনুযায়ী সিরাম ও ময়েশ্চারাইজার সাজেস্ট করে। কাস্টমার মনেই করে না যে এটা কোনো রোবট, একদম মানুষের মতো নম্রভাবে ‘আপনি’ সম্বোধন করে অর্ডার কনফার্ম করে নেয়।”'
  },
  {
    n: 'Kazi Farhan Ishrak',
    r: 'CEO, Chittagong Leather Crafts · GEC Circle, Chattogram',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
    t: '“আমরা ঢাকা ও চট্টগ্রামের বাইরে সারাদেশে লেদার শুজ ও ওয়ালেট বিক্রি করি। পাঠাও এবং রেডএক্স কুরিয়ার ইন্টিগ্রেশন এত স্মুথ যে এআই অর্ডার নেওয়ার পর সরাসরি কুরিয়ার ট্র্যাকিং কোড কাস্টমারকে পাঠিয়ে দেয়। কাজের স্পিড আর একিউরেসি দেখে আমরা মুগ্ধ।”'
  },
  {
    n: 'Mahmudul Hasan Rahat',
    r: 'Proprietor, Deshi Organic Food · Zindabazar, Sylhet',
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    t: '“মধুর খাঁটিত্ব আর ঘি নিয়ে কাস্টমারদের শত শত প্রশ্ন থাকে। আমি ট্রেনিং ডাটাতে আমাদের বৈশিষ্ট্যগুলো লিখে দিয়েছি, এখন এআই ঠিক আমার মতোই বিস্তারিত বুঝিয়ে অর্ডার নেয়। হোয়াটসঅ্যাপ ক্লাউড এপিআই দিয়ে কোনো ব্যান বা রেস্ট্রিকশনের ভয় ছাড়াই নিরাপদে চলছে।”'
  },
  {
    n: 'Afsana Haque Chowdhury',
    r: 'Managing Partner, BabyLand BD · Mirpur DOHS, Dhaka',
    img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80',
    t: '“মেটা বিজ্ঞাপনে প্রতিদিন শত শত লিড আসত। আগে ৩-৪ জন মডারেটর রেখেও অর্ধেকের বেশি কাস্টমারকে সময়মতো উত্তর দেওয়া যেত না। One Agent BD আসার পর কোনো লিড মিস হয় না, স্বয়ংক্রিয়ভাবে অ্যাড্রেস ও ফোন নম্বর ভেরিফাই করে অর্ডার শিট তৈরি করে দেয়।”'
  },
  {
    n: 'Engr. Mahfuzur Rahman',
    r: 'Founder, SneakerStreet Bangladesh · Chawkbazar, Rajshahi',
    img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&auto=format&fit=crop&q=80',
    t: '“আমাদের স্টোরের সাইজ ও কালার ভ্যারিয়েন্ট স্টক প্রতিনিয়ত পরিবর্তন হয়। এআই রিয়েল-টাইম ইনভেন্টরি চেক করে উত্তর দেয়, যার কারণে আউট-অফ-স্টক প্রোডাক্টের ভুল অর্ডার পড়ার কোনো চান্স থাকে না। মাসে কমপক্ষে ৩০,০০০ টাকা ওভারহেড খরচ বেঁচে গেছে।”'
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
        r: `${role.trim() || 'Business Owner'} · ${business.trim() || 'Bangladesh'}`,
        img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
        t: `“${reviewText.trim()}”`
      };
      setReviews((prev) => [newRev, ...prev]);
      setCur(0);
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
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 40) {
          if (dx < 0) handleNext();
          else handlePrev();
        }
        touchStartX.current = null;
      }}
    >
      <style>{`
        .rv {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          padding: clamp(36px, 4.5vw, 64px) clamp(16px, 5vw, 72px) clamp(30px, 4vw, 48px);
          background: linear-gradient(180deg, #fff, #faf8ff 50%, #f5f0ff);
          color: #0e1629;
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          scroll-margin-top: 6rem;
          transform: translateZ(0);
          transition: background 0.3s, color 0.3s;
        }
        .dark .rv {
          background: linear-gradient(180deg, #090518 0%, #100A28 50%, #090518 100%);
          color: #f1f5f9;
        }
        .rv::before {
          content: "";
          position: absolute;
          left: 50%;
          top: 48%;
          width: min(980px, 120vw);
          aspect-ratio: 1.6;
          transform: translate(-50%, -50%);
          background: radial-gradient(closest-side, rgba(124, 58, 237, 0.12), transparent);
          z-index: -1;
        }
        .rv::after {
          content: "\\201C";
          position: absolute;
          right: 4%;
          top: -60px;
          z-index: -1;
          font: 800 clamp(160px, 20vw, 300px)/1 Georgia, serif;
          color: rgba(124, 58, 237, 0.05);
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
        .dark .rv .badge {
          color: #c084fc;
          background: rgba(124, 58, 237, 0.18);
          border-color: rgba(168, 85, 247, 0.35);
        }
        .rv .badge i {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 10px #10b981;
        }
        .rv h2 {
          font-size: clamp(24px, 3vw, 38px);
          font-weight: 800;
          letter-spacing: -0.035em;
          line-height: 1.08;
          margin-top: 12px;
          color: #0e1629;
        }
        .dark .rv h2 {
          color: #ffffff;
        }
        .rv h2 span {
          background: linear-gradient(90deg, #7c3aed, #c026d3);
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
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 999px;
          font: 700 13px inherit;
          color: #fff;
          background: linear-gradient(135deg, #7c3aed, #9333ea);
          box-shadow: 0 8px 20px -6px rgba(124, 58, 237, 0.5);
          cursor: pointer;
          border: 0;
          transition: transform 0.2s;
        }
        .rv .write:hover {
          transform: translateY(-2px);
        }
        .rv .arrow {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          cursor: pointer;
          background: #fff;
          border: 1px solid rgba(14, 22, 41, 0.12);
          box-shadow: 0 4px 12px -2px rgba(60, 20, 140, 0.15);
          transition: all 0.2s;
        }
        .dark .rv .arrow {
          background: #1b1242;
          border-color: rgba(168, 85, 247, 0.3);
        }
        .rv .arrow:hover {
          background: #7c3aed;
          border-color: transparent;
        }
        .rv .arrow svg {
          width: 18px;
          height: 18px;
          stroke: #2a3652;
          transition: stroke 0.2s;
        }
        .dark .rv .arrow svg {
          stroke: #e2e8f0;
        }
        .rv .arrow:hover svg {
          stroke: #fff;
        }
        .rv .stage {
          position: relative;
          max-width: 1240px;
          height: clamp(280px, 26vw, 310px);
          margin: clamp(20px, 2.6vw, 30px) auto 0;
          perspective: 1400px;
          touch-action: pan-y;
          user-select: none;
        }
        .rv .card {
          position: absolute;
          left: 50%;
          top: 0;
          width: min(520px, 88vw);
          padding: 22px 26px 20px;
          border-radius: 26px;
          background: #fff;
          border: 1px solid rgba(124, 58, 237, 0.14);
          box-shadow: 0 20px 50px -20px rgba(60, 20, 140, 0.25);
          transform: translateX(calc(-50% + var(--o) * 66%)) scale(calc(1 - var(--ao) * 0.14)) rotateY(calc(var(--o) * -9deg));
          opacity: calc(1 - var(--ao) * 0.5);
          z-index: calc(5 - var(--ao));
          transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.5s;
          cursor: pointer;
          overflow: hidden;
        }
        .dark .rv .card {
          background: #160F35;
          border-color: rgba(168, 85, 247, 0.25);
          box-shadow: 0 20px 50px -20px rgba(0, 0, 0, 0.6);
        }
        .rv .card.on {
          cursor: default;
          border: 2px solid #7c3aed;
          box-shadow: 0 24px 60px -20px rgba(124, 58, 237, 0.4);
        }
        .dark .rv .card.on {
          border-color: #a855f7;
          box-shadow: 0 24px 60px -20px rgba(168, 85, 247, 0.5);
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
        .rv .ver {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #047857;
          background: #ecfdf5;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .dark .rv .ver {
          color: #34d399;
          background: rgba(6, 78, 59, 0.4);
          border-color: rgba(16, 185, 129, 0.4);
        }
        .rv .q {
          margin-top: 14px;
          font-size: clamp(13.5px, 1.2vw, 15px);
          line-height: 1.65;
          font-weight: 500;
          color: #1d2842;
          min-height: 6.2em;
        }
        .dark .rv .q {
          color: #e2e8f0;
        }
        .rv .who {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid rgba(14, 22, 41, 0.09);
        }
        .dark .rv .who {
          border-top-color: rgba(168, 85, 247, 0.2);
        }
        .rv .who img {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          object-fit: cover;
          border: 2px solid #7c3aed;
        }
        .rv .who b {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 15px;
          letter-spacing: -0.015em;
          color: #0e1629;
        }
        .dark .rv .who b {
          color: #ffffff;
        }
        .rv .who small {
          display: block;
          margin-top: 2px;
          font-size: 12px;
          color: #56637d;
          font-weight: 500;
        }
        .dark .rv .who small {
          color: #94a3b8;
        }
        .rv .nav {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: clamp(12px, 1.8vw, 20px);
        }
        .rv .dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #cbd5e1;
          transition: all 0.3s;
          cursor: pointer;
        }
        .dark .rv .dot {
          background: #332067;
        }
        .rv .dot.active {
          width: 24px;
          background: #7c3aed;
        }
        .dark .rv .dot.active {
          background: #a855f7;
        }
      `}</style>

      <div className="top">
        <div>
          <span className="badge">
            <i></i>
            Real Merchant Experiences
          </span>
          <h2>
            Trusted by <span>500+ Bangladeshi</span> E-Commerce &amp; F-Commerce Brands
          </h2>
        </div>

        <div className="ctrl">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="write"
          >
            <Plus className="w-4 h-4" />
            <span>Write a Review</span>
          </button>

          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous review"
            className="arrow"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next review"
            className="arrow"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className="stage">
        {reviews.map((r, i) => {
          let o = i - cur;
          if (o > N / 2) o -= N;
          if (o < -N / 2) o += N;
          const ao = Math.abs(o);
          const on = o === 0;

          return (
            <div
              key={r.n + i}
              className={`card${on ? ' on' : ''}`}
              style={{ '--o': o, '--ao': ao } as React.CSSProperties}
              onClick={() => {
                if (!on) setCur(i);
              }}
            >
              <div className="rh">
                <div className="stars">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="ver">
                  <span>✓ Verified Business</span>
                </span>
              </div>

              <p className="q">{r.t}</p>

              <div className="who">
                <img src={r.img} alt={r.n} loading="lazy" />
                <div>
                  <b>{r.n}</b>
                  <small>{r.r}</small>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="nav">
        {reviews.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setCur(i)}
            className={`dot${cur === i ? ' active' : ''}`}
          />
        ))}
      </div>

      {/* Write Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-[#160F35] border border-slate-200 dark:border-purple-500/30 shadow-2xl text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-purple-500/20">
              <h3 className="text-lg font-bold">Write a Merchant Review</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWriteReview} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asif Mahmud"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-500/30 bg-slate-50 dark:bg-[#100A28] text-xs outline-hidden focus:border-[#7C3AED]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Founder"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-500/30 bg-slate-50 dark:bg-[#100A28] text-xs outline-hidden focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                    Business &amp; City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dhaka, BD"
                    value={business}
                    onChange={(e) => setBusiness(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-500/30 bg-slate-50 dark:bg-[#100A28] text-xs outline-hidden focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                  Your Honest Feedback
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share how One Agent BD helped your sales, replies or courier..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-500/30 bg-slate-50 dark:bg-[#100A28] text-xs outline-hidden focus:border-[#7C3AED]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-xs"
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
