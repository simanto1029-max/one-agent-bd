import React, { useState, useEffect } from 'react';
import { Star, Check, Trash2, Clock, CheckCircle2, MessageSquareQuote } from 'lucide-react';
import { api } from '../../api';
import { ReviewItem } from '../../types';
import { notifyReviewsUpdated } from '../landing/Testimonials';

interface AdminReviewsProps {
  onReviewsChanged?: () => void;
}

export const AdminReviews: React.FC<AdminReviewsProps> = ({ onReviewsChanged }) => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [actionId, setActionId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminReviews();
      if (Array.isArray(res?.reviews)) {
        setReviews(res.reviews);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      setActionId(id);
      await api.approveAdminReview(id);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r))
      );
      notifyReviewsUpdated();
      if (onReviewsChanged) onReviewsChanged();
      setStatusMsg('Review accepted and published on the website!');
      setTimeout(() => setStatusMsg(null), 3500);
    } catch (err) {
      console.error('Failed to approve review:', err);
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setActionId(id);
      await api.deleteAdminReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      notifyReviewsUpdated();
      if (onReviewsChanged) onReviewsChanged();
      setStatusMsg('Review removed from the website.');
      setTimeout(() => setStatusMsg(null), 3500);
    } catch (err) {
      console.error('Failed to delete review:', err);
    } finally {
      setActionId(null);
    }
  };

  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const approvedCount = reviews.filter((r) => r.status === 'approved').length;

  const filteredReviews = reviews.filter((r) => {
    if (filter === 'pending') return r.status === 'pending';
    if (filter === 'approved') return r.status === 'approved';
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <MessageSquareQuote className="w-6 h-6 text-indigo-600" />
            <span>Customer Reviews Moderation</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Accept new reviews submitted by users on the website or remove existing reviews anytime.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            All ({reviews.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filter === 'pending'
                ? 'bg-amber-500 text-white'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('approved')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filter === 'approved'
                ? 'bg-emerald-600 text-white'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Published ({approvedCount})
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="p-10 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center text-sm text-neutral-500">
          Loading customer reviews...
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="p-10 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center text-sm text-neutral-500">
          No reviews found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((item) => {
            const isPending = item.status === 'pending';
            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl bg-white dark:bg-neutral-900 border shadow-2xs flex flex-col justify-between gap-4 ${
                  isPending
                    ? 'border-amber-300 dark:border-amber-700/70'
                    : 'border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < (item.rating || 5)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-neutral-300 dark:text-neutral-700'
                          }`}
                        />
                      ))}
                    </div>

                    <span
                      className={`text-[11px] font-bold flex items-center gap-1 ${
                        isPending
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isPending ? (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending Approval</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Live on Website</span>
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed">
                    "{item.review_text}"
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.avatar_url ? (
                      <img
                        src={item.avatar_url}
                        alt={item.name}
                        className="w-9 h-9 rounded-full object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {item.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {item.role} · {item.business}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isPending && (
                      <button
                        type="button"
                        disabled={actionId === item.id}
                        onClick={() => handleApprove(item.id)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={actionId === item.id}
                      onClick={() => handleDelete(item.id)}
                      className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-600 text-rose-600 dark:text-rose-300 hover:text-white border border-rose-200 dark:border-rose-800/70 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
