import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  Check,
  X,
  Tag,
  Plus,
  Trash2,
  Copy,
  Percent,
  Banknote,
  Power
} from 'lucide-react';
import { api } from '../../api';
import { Payment, Coupon } from '../../types';

export const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Coupon Creator Form State
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [minAmount, setMinAmount] = useState<number>(0);
  const [maxUses, setMaxUses] = useState<number>(0);
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [couponSubmitting, setCouponSubmitting] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const applyExpiryPreset = (hours: number | null) => {
    if (!hours) {
      setExpiresAt('');
      return;
    }
    const target = new Date(Date.now() + hours * 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    const localIso = `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}T${pad(
      target.getHours()
    )}:${pad(target.getMinutes())}`;
    setExpiresAt(localIso);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsData, couponsData] = await Promise.all([
        api.getAdminPayments().catch(() => []),
        api.getAdminCoupons().catch(() => [])
      ]);
      setPayments(paymentsData);
      setCoupons(couponsData);
    } catch (err) {
      console.error('Failed to load admin payments & coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (!clean) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    if (discountValue <= 0) {
      setCouponError('Discount value must be greater than 0.');
      return;
    }
    if (discountType === 'percentage' && discountValue > 100) {
      setCouponError('Percentage discount cannot exceed 100%.');
      return;
    }
    if (expiresAt) {
      const expTime = new Date(expiresAt).getTime();
      if (isNaN(expTime) || expTime <= Date.now()) {
        setCouponError('Expiry date & time must be in the future.');
        return;
      }
    }

    try {
      setCouponSubmitting(true);
      setCouponError(null);
      await api.createAdminCoupon({
        code: clean,
        discount_type: discountType,
        discount_value: Number(discountValue),
        min_amount: Number(minAmount) || 0,
        max_uses: Number(maxUses) || 0,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        is_active: true
      });
      setCouponCode('');
      setDiscountValue(20);
      setMinAmount(0);
      setMaxUses(0);
      setExpiresAt('');
      setShowCouponModal(false);
      await loadData();
    } catch (err: any) {
      setCouponError(err.message || 'Failed to create coupon.');
    } finally {
      setCouponSubmitting(false);
    }
  };

  const handleToggleCoupon = async (coupon: Coupon) => {
    try {
      await api.updateAdminCoupon(coupon.id, { is_active: !coupon.is_active });
      await loadData();
    } catch (err) {
      console.error('Failed to toggle coupon:', err);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      await api.deleteAdminCoupon(id);
      await loadData();
    } catch (err) {
      console.error('Failed to delete coupon:', err);
    }
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  const handleApprove = async (paymentId: string) => {
    try {
      setProcessingId(paymentId);
      await api.approvePayment(paymentId);
      await loadData();
    } catch (err) {
      console.error('Failed to approve payment:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (paymentId: string) => {
    try {
      setProcessingId(paymentId);
      await api.rejectPayment(paymentId, 'Rejected by administrator');
      await loadData();
    } catch (err) {
      console.error('Failed to reject payment:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = payments.filter((p) => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const txId = (p.transaction_id || p.transaction_reference || '').toLowerCase();
      return (
        txId.includes(q) ||
        (p.sender_number && p.sender_number.includes(q)) ||
        (p.coupon_code && p.coupon_code.toLowerCase().includes(q)) ||
        p.user_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = payments.filter((p) => p.status === 'pending').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-2.5">
            <span>Payments & Coupon Codes</span>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold">
                {pendingCount} Pending
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Create custom discount coupon codes for checkout and manage bKash/Nagad payment verifications.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setCouponError(null);
              setShowCouponModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#673DE6] hover:bg-[#572FD6] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Coupon Code</span>
          </button>

          <button
            type="button"
            onClick={loadData}
            className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* COUPON CODES MANAGEMENT SECTION */}
      <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-[#673DE6] dark:text-violet-400 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-neutral-900 dark:text-white">
                Active Promo & Coupon Codes ({coupons.length})
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Customers can apply these coupon codes during plan checkout to receive instant discounts.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setCouponError(null);
              setShowCouponModal(true);
            }}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/50 dark:hover:bg-violet-900/60 text-[#673DE6] dark:text-violet-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Coupon</span>
          </button>
        </div>

        {coupons.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400">
            No coupon codes created yet. Click "Create Coupon Code" to make your first discount code.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {coupons.map((cpn) => (
              <div
                key={cpn.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                  cpn.is_active
                    ? 'border-violet-200/80 dark:border-violet-800/50 bg-violet-50/25 dark:bg-violet-950/15'
                    : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/30 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-extrabold text-xs tracking-wider text-neutral-900 dark:text-white">
                        {cpn.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCoupon(cpn.code)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                        title="Copy coupon code"
                      >
                        {copiedCode === cpn.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-base font-extrabold text-[#673DE6] dark:text-violet-400">
                        {cpn.discount_type === 'percentage'
                          ? `${cpn.discount_value}% OFF`
                          : `TK ${cpn.discount_value.toLocaleString()} OFF`}
                      </span>
                      {cpn.min_amount && cpn.min_amount > 0 ? (
                        <span className="text-[10px] text-neutral-500">
                          (Min {cpn.min_amount.toLocaleString()} TK)
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-500">(All Plans)</span>
                      )}
                    </div>
                    {cpn.expires_at ? (
                      <div
                        className={`mt-1.5 flex items-center gap-1 text-[10px] font-bold ${
                          new Date(cpn.expires_at).getTime() <= Date.now()
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>
                          {new Date(cpn.expires_at).getTime() <= Date.now()
                            ? `Expired (${new Date(cpn.expires_at).toLocaleString([], {
                                dateStyle: 'short',
                                timeStyle: 'short'
                              })})`
                            : `Expires: ${new Date(cpn.expires_at).toLocaleString([], {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })}`}
                        </span>
                      </div>
                    ) : (
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-neutral-400">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>No Expiry Date (Lifetime)</span>
                      </div>
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      cpn.expires_at && new Date(cpn.expires_at).getTime() <= Date.now()
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        : cpn.is_active
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                    }`}
                  >
                    {cpn.expires_at && new Date(cpn.expires_at).getTime() <= Date.now()
                      ? 'Expired'
                      : cpn.is_active
                      ? 'Active'
                      : 'Disabled'}
                  </span>
                </div>

                <div className="pt-2.5 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
                  <span>
                    Used: <strong className="text-neutral-800 dark:text-neutral-200">{cpn.used_count}</strong>
                    {cpn.max_uses && cpn.max_uses > 0 ? ` / ${cpn.max_uses}` : ' (Unlimited)'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleCoupon(cpn)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                        cpn.is_active
                          ? 'bg-neutral-200/70 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{cpn.is_active ? 'Disable' : 'Enable'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCoupon(cpn.id)}
                      className="p-1 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete coupon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter and Search Bar for Payments */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search TrxID, coupon, sender..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#673DE6]"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            All ({payments.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              filterStatus === 'pending'
                ? 'bg-amber-500 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              filterStatus === 'approved'
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Approved
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('rejected')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              filterStatus === 'rejected'
                ? 'bg-rose-600 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Submitted Date</th>
                <th className="py-3 px-4">Method & Sender</th>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Amount & Coupon</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    No transactions matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isProcessing = processingId === p.id;
                  const isPending = p.status === 'pending';
                  const methodLabel = p.payment_method || (p.method === 'nagad' ? 'Nagad' : 'bKash');
                  const txId = p.transaction_id || p.transaction_reference;

                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30">
                      <td className="py-3.5 px-4 text-neutral-500">
                        {new Date(p.created_at || p.submitted_at).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            methodLabel.toLowerCase() === 'bkash'
                              ? 'bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {methodLabel}
                        </span>
                        {p.sender_number && (
                          <div className="text-[11px] text-neutral-400 mt-0.5">
                            From: {p.sender_number}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">
                        {txId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-neutral-900 dark:text-white">
                          TK {Number(p.amount).toLocaleString()}
                        </div>
                        {p.coupon_code && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded mt-0.5">
                            <Tag className="w-2.5 h-2.5" />
                            {p.coupon_code}
                            {p.discount_amount ? ` (-TK ${p.discount_amount})` : ''}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            p.status === 'approved'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : p.status === 'pending'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {p.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                          {p.status === 'pending' && <Clock className="w-3 h-3" />}
                          {p.status === 'rejected' && <XCircle className="w-3 h-3" />}
                          <span className="capitalize">{p.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleApprove(p.id)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(p.id)}
                              disabled={isProcessing}
                              className="px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold cursor-pointer transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-neutral-400">
                            Processed ({p.status})
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE COUPON MODAL */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-md p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950 text-[#673DE6] flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                    Create Custom Coupon Code
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Set custom promo code & discount for plan checkout
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCouponModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Coupon Code Name *
                </label>
                <input
                  type="text"
                  required
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. EID25, SAVE500, VIP30"
                  className="w-full px-3.5 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:normal-case placeholder:font-normal focus:outline-hidden focus:border-[#673DE6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Discount Type *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDiscountType('percentage')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      discountType === 'percentage'
                        ? 'border-[#673DE6] bg-violet-50/70 dark:bg-violet-950/50 text-[#673DE6] dark:text-violet-300'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5" />
                    <span>Percentage (%)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('fixed')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      discountType === 'fixed'
                        ? 'border-[#673DE6] bg-violet-50/70 dark:bg-violet-950/50 text-[#673DE6] dark:text-violet-300'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    <span>Fixed Amount (TK)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    {discountType === 'percentage' ? 'Discount (%)' : 'Discount Amount (TK)'} *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={discountType === 'percentage' ? 100 : 100000}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Min Plan Amount (TK)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={minAmount}
                    onChange={(e) => setMinAmount(Number(e.target.value))}
                    placeholder="0 for any"
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Maximum Total Uses (0 = Unlimited)
                </label>
                <input
                  type="number"
                  min={0}
                  value={maxUses}
                  onChange={(e) => setMaxUses(Number(e.target.value))}
                  placeholder="0 for unlimited uses"
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Expiry Date & Time (Optional)
                  </label>
                  {expiresAt && (
                    <button
                      type="button"
                      onClick={() => setExpiresAt('')}
                      className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer"
                    >
                      Clear (No Expiry)
                    </button>
                  )}
                </div>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#673DE6]"
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-neutral-400 mr-0.5">Quick set:</span>
                  {[
                    { label: 'No Expiry', hours: null },
                    { label: '1 Hour', hours: 1 },
                    { label: '24 Hours', hours: 24 },
                    { label: '3 Days', hours: 72 },
                    { label: '7 Days', hours: 168 },
                    { label: '30 Days', hours: 720 }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyExpiryPreset(preset.hours)}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold bg-neutral-100 hover:bg-violet-100 dark:bg-neutral-800 dark:hover:bg-violet-950/60 text-neutral-600 hover:text-[#673DE6] dark:text-neutral-300 dark:hover:text-violet-300 transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {couponError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-300 font-medium">
                  {couponError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={couponSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#673DE6] hover:bg-[#572FD6] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {couponSubmitting ? 'Creating...' : 'Save Coupon Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
