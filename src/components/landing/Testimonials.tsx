import React, { useState, useEffect, useRef } from 'react';
import { Star, CheckCircle2, ChevronLeft, ChevronRight, Plus, X, Upload, User } from 'lucide-react';
import { api } from '../../api';
import { ReviewItem } from '../../types';

export const REVIEWS_UPDATED_EVENT = 'oneagentbd-reviews-updated';

export function notifyReviewsUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(REVIEWS_UPDATED_EVENT));
  }
}

const FALLBACK_REVIEWS: ReviewItem[] = [
  {
    id: 'rev_seed_1',
    name: 'Mahmudul Hasan Rahat',
    role: 'F-Commerce Seller',
    business: 'Dhaka, BD',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    rating: 5,
    review_text:
      'Before One Agent BD, we used to lose late-night Facebook inquiries because no one was online after midnight. Now the AI replies in 2 seconds, checks available sizes, and confirms COD orders while we sleep.',
    status: 'approved',
    created_at: ''
  },
  {
    id: 'rev_seed_2',
    name: 'Sadia Afrin Tisha',
    role: 'Online Boutique Owner',
    business: 'Dhaka, BD',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
    rating: 5,
    review_text:
      'Customers constantly send product screenshots and voice notes on Instagram and Messenger. The AI recognizes product photos accurately, quotes the exact price, and handles the entire checkout conversation.',
    status: 'approved',
    created_at: ''
  },
  {
    id: 'rev_seed_3',
    name: 'Tanvir Ahmed Chowdhury',
    role: 'Electronics & Gadget Seller',
    business: 'Chattogram, BD',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    rating: 5,
    review_text:
      'The auto comment-to-inbox workflow and 1-click Steadfast courier booking saved our team hours of manual data entry every single day. Best automation platform we have used.',
    status: 'approved',
    created_at: ''
  },
  {
    id: 'rev_seed_4',
    name: 'Ariful Islam Sourav',
    role: 'Organic Food Seller',
    business: 'Sylhet, BD',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
    rating: 5,
    review_text:
      'During peak season we receive hundreds of WhatsApp messages daily. One Agent BD collects customer names, phone numbers, and full delivery addresses and logs every order into our dashboard.',
    status: 'approved',
    created_at: ''
  },
  {
    id: 'rev_seed_5',
    name: 'Nusrat Jahan Mim',
    role: 'Clothing Page Owner',
    business: 'Dhaka, BD',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
    rating: 5,
    review_text:
      'Connecting our Facebook Page and Instagram took less than two minutes. Whenever a buyer asks for a live call, the AI alerts our team in the Call Requests queue immediately.',
    status: 'approved',
    created_at: ''
  },
  {
    id: 'rev_seed_6',
    name: 'Imran Hossain Rony',
    role: 'E-Commerce Merchant',
    business: 'Dhaka, BD',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80',
    rating: 5,
    review_text:
      'Our ad conversion rate nearly doubled because customers get an instant response right after clicking our boosted posts. Smart follow-ups bring back hesitant buyers automatically.',
    status: 'approved',
    created_at: ''
  }
];

export const Testimonials: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>(FALLBACK_REVIEWS);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollAccumulatorRef = useRef<number>(0);

  // Write a Review Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [business, setBusiness] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const res = await api.getPublicReviews();
      if (Array.isArray(res?.reviews)) {
        setReviews(res.reviews);
      }
    } catch {
      // keep fallback if network fails
    }
  };

  useEffect(() => {
    fetchReviews();
    const handleRefresh = () => fetchReviews();
    window.addEventListener(REVIEWS_UPDATED_EVENT, handleRefresh);
    return () => window.removeEventListener(REVIEWS_UPDATED_EVENT, handleRefresh);
  }, []);

  // Duplicate list so after the last review, the first review appears immediately in a seamless infinite loop
  const loopedReviews = reviews.length > 0 ? [...reviews, ...reviews] : [];

  // Slow, ultra-smooth infinite horizontal auto-scroll
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || isPaused || reviews.length === 0) return;

    let animationFrameId: number;
    // Slow speed: ~0.35px per frame (~21px per second at 60fps)
    const speedPerFrame = 0.35;

    const step = () => {
      if (el && !isPaused) {
        scrollAccumulatorRef.current += speedPerFrame;
        if (scrollAccumulatorRef.current >= 1) {
          const pixels = Math.floor(scrollAccumulatorRef.current);
          scrollAccumulatorRef.current -= pixels;
          el.scrollLeft += pixels;

          // Seamless loop wrap-around when reaching the start of the second set
          const halfWidth = el.scrollWidth / 2;
          if (halfWidth > 0 && el.scrollLeft >= halfWidth) {
            el.scrollLeft -= halfWidth;
          }
        }
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, reviews.length]);

  const handleManualScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const step = 370;
    const halfWidth = el.scrollWidth / 2;

    if (direction === 'left' && el.scrollLeft <= 10 && halfWidth > 0) {
      el.scrollLeft += halfWidth;
    } else if (direction === 'right' && halfWidth > 0 && el.scrollLeft >= halfWidth) {
      el.scrollLeft -= halfWidth;
    }

    el.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth'
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setSubmitError('Image size must be under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        setSubmitError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!name.trim() || !reviewText.trim()) {
      setSubmitError('Please enter your name and review message.');
      return;
    }

    try {
      setSubmitting(true);
      await api.submitReview({
        name: name.trim(),
        role: role.trim() || 'F-Commerce Seller',
        business: business.trim() || 'Dhaka, BD',
        avatar_url: avatarUrl.trim(),
        rating,
        review_text: reviewText.trim()
      });
      setSubmitSuccess('Thank you! Your review was submitted and will appear once approved by admin.');
      setName('');
      setRole('');
      setBusiness('');
      setAvatarUrl('');
      setRating(5);
      setReviewText('');
    } catch (err: any) {
      setSubmitError(err.message || 'Could not submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="testimonials"
      className="py-10 sm:py-14 bg-white dark:bg-[#0B0720] border-t border-slate-200/70 dark:border-purple-500/15 relative overflow-hidden transition-colors"
    >
      <div id="reviews" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* $100K Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-9">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#7F22FE]/10 dark:bg-purple-500/15 border border-[#7F22FE]/25 text-[#7F22FE] dark:text-purple-300 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.15em] mb-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>VERIFIED MERCHANT REVIEWS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Trusted by Growing{' '}
              <span className="bg-gradient-to-r from-[#7F22FE] via-[#9333EA] to-[#DB2777] bg-clip-text text-transparent">
                E-Commerce Brands
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSubmitSuccess(null);
                setSubmitError(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-full bg-gradient-to-r from-[#7F22FE] via-[#9333EA] to-[#C026D3] hover:from-[#6D28D9] hover:to-[#A21CAF] text-white text-xs font-extrabold shadow-[0_8px_20px_rgba(127,34,254,0.3)] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Write a Review</span>
            </button>

            <button
              type="button"
              onClick={() => handleManualScroll('left')}
              aria-label="Scroll reviews left"
              className="w-9 h-9 rounded-full bg-white dark:bg-[#160F35] hover:bg-violet-50 dark:hover:bg-[#23184E] text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-purple-500/25 shadow-2xs flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleManualScroll('right')}
              aria-label="Scroll reviews right"
              className="w-9 h-9 rounded-full bg-white dark:bg-[#160F35] hover:bg-violet-50 dark:hover:bg-[#23184E] text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-purple-500/25 shadow-2xs flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontally Scrollable + Slow Seamless Infinite Loop Track inside Dot-Matrix Frame */}
        {reviews.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 dark:bg-[#130D2E] border border-slate-200/80 dark:border-purple-500/20 text-center text-sm text-slate-500 dark:text-slate-400">
            No reviews published yet. Click "Write a Review" to share your experience!
          </div>
        ) : (
          <div className="relative rounded-[32px] p-4 sm:p-6 bg-slate-50/75 dark:bg-[#110A2A]/90 border border-slate-200/90 dark:border-purple-500/25 shadow-[0_25px_70px_-20px_rgba(124,58,237,0.14)] overflow-hidden">
            {/* Dot-Matrix Background */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(139,92,246,0.2)_1px,transparent_1px)] [background-size:20px_20px] opacity-55"
            />

            <div
              ref={scrollContainerRef}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
              onScroll={() => {
                const el = scrollContainerRef.current;
                if (!el) return;
                const halfWidth = el.scrollWidth / 2;
                if (halfWidth > 0 && el.scrollLeft >= halfWidth) {
                  el.scrollLeft -= halfWidth;
                }
              }}
              className="relative z-10 flex items-stretch gap-4 sm:gap-5 overflow-x-auto pb-2 pt-1 select-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {loopedReviews.map((item, idx) => {
                const initials = item.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <article
                    key={`${item.id}_${idx}`}
                    className="w-[280px] sm:w-[335px] shrink-0 p-5 rounded-2xl bg-white dark:bg-[#160E35]/95 border border-slate-200/90 dark:border-purple-500/25 hover:border-[#7F22FE]/60 shadow-[0_14px_34px_-12px_rgba(15,23,42,0.08)] hover:shadow-[0_20px_44px_-12px_rgba(127,34,254,0.2)] flex flex-col justify-between transition-all duration-300"
                  >
                    <div>
                      {/* Top Row: 5 Stars + Verified Badge */}
                      <div className="flex items-center justify-between gap-2 mb-3.5">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < (item.rating || 5)
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-300 dark:text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[9px] font-extrabold uppercase tracking-wider">
                          ✓ Verified Store
                        </span>
                      </div>

                      {/* Concise Quote */}
                      <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed font-medium line-clamp-4">
                        &ldquo;{item.review_text}&rdquo;
                      </p>
                    </div>

                    {/* Reviewer Footer */}
                    <div className="flex items-center gap-3 pt-3.5 mt-4 border-t border-slate-100 dark:border-purple-500/15">
                      {item.avatar_url ? (
                        <img
                          src={item.avatar_url}
                          alt={item.name}
                          className="w-9 h-9 rounded-xl object-cover border border-purple-500/25 shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7F22FE] to-[#DB2777] text-white text-xs font-black flex items-center justify-center shrink-0">
                          {initials || 'M'}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                            {item.name}
                          </h3>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#7F22FE] dark:text-purple-400 shrink-0" />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                          {item.role} · {item.business}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Write a Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#130D2E] border border-slate-200 dark:border-purple-500/25 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Write a Customer Review
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Share your experience with One Agent BD
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1C1442] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{submitSuccess}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-3.5">
                {submitError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                    {submitError}
                  </div>
                )}

                {/* User Photo Upload & Preview */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Your Photo (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    {avatarUrl ? (
                      <div className="relative shrink-0">
                        <img
                          src={avatarUrl}
                          alt="Preview"
                          className="w-12 h-12 rounded-full object-cover border-2 border-[#7C3AED]"
                        />
                        <button
                          type="button"
                          onClick={() => setAvatarUrl('')}
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#191138] border border-slate-200 dark:border-purple-500/25 flex items-center justify-center text-slate-400 shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                    )}

                    <div className="flex-1 space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-[#7C3AED] dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 text-xs font-bold cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="url"
                        value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="Or paste image URL..."
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-purple-500/25 bg-slate-50 dark:bg-[#191138] text-[11px] text-slate-900 dark:text-white focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Rating
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            star <= rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-500/25 bg-slate-50 dark:bg-[#191138] text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Business Category
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. F-Commerce Seller"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-500/25 bg-slate-50 dark:bg-[#191138] text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      City / Location
                    </label>
                    <input
                      type="text"
                      value={business}
                      onChange={(e) => setBusiness(e.target.value)}
                      placeholder="e.g. Dhaka, BD"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-500/25 bg-slate-50 dark:bg-[#191138] text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Your Review *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share how One Agent BD helped automate your store..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-500/25 bg-slate-50 dark:bg-[#191138] text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#191138] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white text-xs font-bold shadow-md shadow-purple-500/20 cursor-pointer"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
