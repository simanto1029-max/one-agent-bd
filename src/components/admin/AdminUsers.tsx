import React, { useState, useEffect } from 'react';
import {
  Search,
  Shield,
  User,
  RefreshCw,
  Plus,
  Zap,
  Calendar,
  CalendarPlus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Filter,
  Check
} from 'lucide-react';
import { api } from '../../api';
import { UserProfile, Subscription } from '../../types';

interface ExtendedUser extends UserProfile {
  subscription?: Subscription & {
    plan_id?: string;
    planName?: string;
    endDate?: string;
    startDate?: string;
  };
  channelsCount?: number;
  messagesCount?: number;
  whatsappUsage?: {
    used: number;
    quota: number;
    remaining: number;
  };
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'trialing' | 'expired' | 'suspended'>('all');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Credit adjustment modal
  const [adjustingUser, setAdjustingUser] = useState<ExtendedUser | null>(null);
  const [creditAmountInput, setCreditAmountInput] = useState('1000');
  const [adjustingLoading, setAdjustingLoading] = useState(false);

  // Subscription duration extension modal
  const [extendingUser, setExtendingUser] = useState<ExtendedUser | null>(null);
  const [extendingLoading, setExtendingLoading] = useState(false);
  const [durationMode, setDurationMode] = useState<'preset' | 'custom_days' | 'custom_date'>('preset');
  const [selectedPresetDays, setSelectedPresetDays] = useState<number>(30);
  const [customDaysInput, setCustomDaysInput] = useState<string>('30');
  const [customDateInput, setCustomDateInput] = useState<string>('');
  const [targetStatus, setTargetStatus] = useState<'active' | 'trialing'>('active');
  const [targetPlanId, setTargetPlanId] = useState<string>('plan_pro');
  const [autoReactivateChannels, setAutoReactivateChannels] = useState<boolean>(true);
  const [adminNote, setAdminNote] = useState<string>('');

  useEffect(() => {
    loadUsers();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminUsers();
      setUsers(data as any);
    } catch (err: any) {
      console.error('Failed to load admin users:', err);
      showToast(err?.message || 'Failed to load user accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const res = await api.updateUserStatus(userId);
      showToast(res.message || 'Account status updated');
      await loadUsers();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update user status', 'error');
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await api.updateUserRole(userId, newRole);
      showToast(res.message || `User role updated to ${newRole}`);
      await loadUsers();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update user role', 'error');
    }
  };

  const handleSaveCredits = async () => {
    if (!adjustingUser) return;
    const num = parseInt(creditAmountInput, 10);
    if (isNaN(num) || num <= 0) {
      showToast('Please enter a valid credit amount', 'error');
      return;
    }

    try {
      setAdjustingLoading(true);
      const res = await api.adjustUserCredits(adjustingUser.id, { creditsToAdd: num });
      showToast(res.message || `Added ${num} WhatsApp credits`);
      setAdjustingUser(null);
      await loadUsers();
    } catch (err: any) {
      showToast(err?.message || 'Failed to adjust message credits', 'error');
    } finally {
      setAdjustingLoading(false);
    }
  };

  const openExtendModal = (user: ExtendedUser) => {
    setExtendingUser(user);
    const sub = user.subscription as any;
    const isCurrentlyTrialing = sub?.status === 'trialing';
    setTargetStatus(isCurrentlyTrialing ? 'active' : (sub?.status === 'expired' ? 'active' : (sub?.status || 'active')));
    setTargetPlanId(sub?.plan_id || 'plan_pro');
    setDurationMode('preset');
    setSelectedPresetDays(30);
    setCustomDaysInput('30');
    setAdminNote('');
    setAutoReactivateChannels(true);

    // Default custom date input to 30 days from now
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setCustomDateInput(d.toISOString().split('T')[0]);
  };

  const calculateTargetExpiryDate = (): Date => {
    if (!extendingUser) return new Date();
    const now = new Date();
    const sub = extendingUser.subscription as any;
    const rawEnd = sub?.endDate || sub?.end_date;
    const existingEnd = rawEnd ? new Date(rawEnd) : now;
    const isFutureActive = existingEnd.getTime() > now.getTime();

    if (durationMode === 'custom_date' && customDateInput) {
      const customD = new Date(customDateInput);
      if (!isNaN(customD.getTime())) return customD;
    }

    const days = durationMode === 'custom_days'
      ? Math.max(1, parseInt(customDaysInput, 10) || 1)
      : selectedPresetDays;

    const base = isFutureActive ? existingEnd : now;
    return new Date(base.getTime() + days * 86400000);
  };

  const handleSaveSubscriptionExtension = async () => {
    if (!extendingUser) return;

    try {
      setExtendingLoading(true);

      let payload: {
        daysToAdd?: number;
        customEndDate?: string;
        status?: 'active' | 'trialing';
        planId?: string;
        reactivateChannels?: boolean;
        adminNote?: string;
      } = {
        status: targetStatus,
        planId: targetPlanId,
        reactivateChannels: autoReactivateChannels,
        adminNote: adminNote.trim() || undefined
      };

      if (durationMode === 'custom_date' && customDateInput) {
        payload.customEndDate = new Date(customDateInput).toISOString();
      } else {
        const days = durationMode === 'custom_days'
          ? Math.max(1, parseInt(customDaysInput, 10) || 1)
          : selectedPresetDays;
        payload.daysToAdd = days;
      }

      const res = await api.extendUserSubscription(extendingUser.id, payload);
      showToast(res.message || 'Subscription extended successfully!');
      setExtendingUser(null);
      await loadUsers();
    } catch (err: any) {
      console.error('Error extending subscription:', err);
      showToast(err?.message || 'Failed to extend subscription', 'error');
    } finally {
      setExtendingLoading(false);
    }
  };

  // Helper stats
  const counts = {
    all: users.length,
    active: users.filter((u) => u.subscription?.status === 'active').length,
    trialing: users.filter((u) => u.subscription?.status === 'trialing').length,
    expired: users.filter((u) => {
      const sub = u.subscription as any;
      if (!sub) return true;
      if (sub.status === 'expired') return true;
      const rawEnd = sub?.endDate || sub?.end_date;
      return rawEnd ? new Date(rawEnd).getTime() <= Date.now() : true;
    }).length,
    suspended: users.filter((u) => u.is_suspended).length
  };

  const filtered = users.filter((u) => {
    const sub = u.subscription as any;
    const rawEnd = sub?.endDate || sub?.end_date;
    const isExpired = !sub || sub.status === 'expired' || (rawEnd && new Date(rawEnd).getTime() <= Date.now());

    if (filterTab === 'active' && sub?.status !== 'active') return false;
    if (filterTab === 'trialing' && sub?.status !== 'trialing') return false;
    if (filterTab === 'expired' && !isExpired) return false;
    if (filterTab === 'suspended' && !u.is_suspended) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold transition-all border ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/90 dark:text-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/90 dark:text-rose-200 dark:border-rose-800'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <span>User Accounts &amp; Subscription Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold">
              Admin Access
            </span>
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Reactivate expired trials, extend subscription duration, manage message quotas, and control merchant accounts.
          </p>
        </div>

        <button
          onClick={loadUsers}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
            }`}
          >
            All Merchants ({counts.all})
          </button>
          <button
            onClick={() => setFilterTab('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            Active ({counts.active})
          </button>
          <button
            onClick={() => setFilterTab('trialing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'trialing'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
            }`}
          >
            Trialing ({counts.trialing})
          </button>
          <button
            onClick={() => setFilterTab('expired')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'expired'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
            }`}
          >
            Expired / Due ({counts.expired})
          </button>
          <button
            onClick={() => setFilterTab('suspended')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'suspended'
                ? 'bg-neutral-700 text-white shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200'
            }`}
          >
            Suspended ({counts.suspended})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email, name or phone..."
            className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Subscription Plan</th>
                <th className="py-3 px-4">WhatsApp Credits</th>
                <th className="py-3 px-4">Expiry &amp; Duration</th>
                <th className="py-3 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    <p className="font-semibold">No users matching current filters.</p>
                    <p className="text-[11px] mt-1 text-neutral-500">Try clearing the search or changing status tab.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const sub = u.subscription as any;
                  const rawEnd = sub?.endDate || sub?.end_date;
                  const isAccountActive = !u.is_suspended;
                  const waUsage = u.whatsappUsage || { used: 0, quota: 2500, remaining: 2500 };
                  const percentUsed = Math.min(100, Math.round((waUsage.used / Math.max(1, waUsage.quota)) * 100));

                  const nowTime = Date.now();
                  const endTime = rawEnd ? new Date(rawEnd).getTime() : 0;
                  const isExpired = !sub || sub.status === 'expired' || (endTime > 0 && endTime <= nowTime);
                  const isTrial = sub?.status === 'trialing' && !isExpired;

                  let relativeExpiryText = 'No active period';
                  if (endTime > 0) {
                    const diffDays = Math.round((endTime - nowTime) / (86400000));
                    if (diffDays > 0) {
                      relativeExpiryText = `${diffDays} days left`;
                    } else if (diffDays === 0) {
                      relativeExpiryText = 'Expires today';
                    } else {
                      relativeExpiryText = `Expired ${Math.abs(diffDays)} days ago`;
                    }
                  }

                  const formattedDate = rawEnd
                    ? new Date(rawEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Not set';

                  return (
                    <tr key={u.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30 transition-colors">
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-neutral-900 dark:text-white">
                          {u.full_name || 'Merchant'}
                        </div>
                        <div className="text-neutral-400 font-mono text-[11px]">{u.email}</div>
                        {u.phone && <div className="text-neutral-500 text-[10px]">{u.phone}</div>}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            u.role === 'admin'
                              ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          {u.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {u.role}
                        </span>
                      </td>

                      {/* Account Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isAccountActive
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {isAccountActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      {/* Subscription Plan & Status */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase ${
                                isExpired
                                  ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                                  : isTrial
                                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                                  : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                              }`}
                            >
                              {isExpired ? 'EXPIRED' : isTrial ? 'TRIAL' : 'ACTIVE'}
                            </span>
                            <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-200">
                              {sub?.planName || 'Advance AI Pro'}
                            </span>
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            Channels: {u.channelsCount || 0} connected
                          </div>
                        </div>
                      </td>

                      {/* WhatsApp Credits Quota */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 min-w-[130px]">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {waUsage.used.toLocaleString()} / {waUsage.quota.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {waUsage.remaining.toLocaleString()} left
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                percentUsed > 90 ? 'bg-rose-500' : percentUsed > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${percentUsed}%` }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setAdjustingUser(u);
                              setCreditAmountInput('1000');
                            }}
                            className="text-[10px] text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            <span>Add Credits</span>
                          </button>
                        </div>
                      </td>

                      {/* Expiry Date & Quick Extend */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Clock className={`w-3.5 h-3.5 ${isExpired ? 'text-rose-500' : 'text-neutral-400'}`} />
                            <span
                              className={`font-mono text-[11px] font-bold ${
                                isExpired ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-800 dark:text-neutral-200'
                              }`}
                            >
                              {formattedDate}
                            </span>
                          </div>
                          <div
                            className={`text-[10px] font-medium ${
                              isExpired ? 'text-rose-500 font-bold' : 'text-neutral-500 dark:text-neutral-400'
                            }`}
                          >
                            {relativeExpiryText}
                          </div>
                          <button
                            type="button"
                            onClick={() => openExtendModal(u)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline cursor-pointer pt-0.5"
                          >
                            <CalendarPlus className="w-3 h-3" />
                            <span>{isExpired ? 'Reactivate & Extend' : 'Extend Duration'}</span>
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => openExtendModal(u)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 shadow-xs ${
                            isExpired
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
                              : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300'
                          }`}
                          title="Extend subscription or reactivate user"
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                          <span>{isExpired ? 'Reactivate' : 'Extend Time'}</span>
                        </button>

                        <button
                          onClick={() => handleToggleRole(u.id, u.role)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                          title="Change user / admin role"
                        >
                          {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                        </button>

                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                            isAccountActive
                              ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50'
                              : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                          }`}
                        >
                          {isAccountActive ? 'Suspend' : 'Unsuspend'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Extension & Reactivation Modal */}
      {extendingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#141A26] border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Title */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
                  <CalendarPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Extend Subscription &amp; Reactivate</span>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Set new validity duration or reactivate expired trial/subscription for this merchant.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setExtendingUser(null)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
              >
                ✕
              </button>
            </div>

            {/* User Details Banner */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-neutral-900 dark:text-white">
                  {extendingUser.full_name || 'Merchant'}
                </div>
                <div className="text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">
                  {extendingUser.email}
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                    extendingUser.subscription?.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : extendingUser.subscription?.status === 'trialing'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  Current: {extendingUser.subscription?.status || 'Expired'}
                </span>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  Plan: {extendingUser.subscription?.planName || 'Advance AI Pro'}
                </div>
              </div>
            </div>

            {/* Quick Presets Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                1. Select Time Duration to Add:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { days: 3, label: '+3 Days (Trial)', desc: 'Quick Demo' },
                  { days: 7, label: '+7 Days (1 Wk)', desc: '1 Week Test' },
                  { days: 15, label: '+15 Days', desc: 'Half Month' },
                  { days: 30, label: '+30 Days (1 Mo)', desc: 'Standard', popular: true },
                  { days: 60, label: '+60 Days (2 Mo)', desc: 'Bi-Monthly' },
                  { days: 90, label: '+90 Days (3 Mo)', desc: 'Quarterly' },
                  { days: 180, label: '+180 Days (6 Mo)', desc: 'Half Year' },
                  { days: 365, label: '+365 Days (1 Yr)', desc: 'Annual Full' }
                ].map((preset) => {
                  const isSelected = durationMode === 'preset' && selectedPresetDays === preset.days;
                  return (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() => {
                        setDurationMode('preset');
                        setSelectedPresetDays(preset.days);
                      }}
                      className={`relative p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {preset.popular && (
                        <span className="absolute -top-1.5 -right-1 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-indigo-600 text-white shadow-xs">
                          POPULAR
                        </span>
                      )}
                      <div className="font-extrabold text-xs">{preset.label}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">{preset.desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Or Custom Mode Switchers */}
              <div className="flex items-center gap-2 pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => setDurationMode('custom_days')}
                  className={`px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer ${
                    durationMode === 'custom_days'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                      : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100'
                  }`}
                >
                  Custom Number of Days
                </button>
                <button
                  type="button"
                  onClick={() => setDurationMode('custom_date')}
                  className={`px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer ${
                    durationMode === 'custom_date'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                      : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100'
                  }`}
                >
                  Pick Exact Expiry Date
                </button>
              </div>

              {/* Custom Days Input */}
              {durationMode === 'custom_days' && (
                <div className="pt-2 animate-in fade-in duration-150">
                  <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Enter Exact Number of Days to Add:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={3650}
                      value={customDaysInput}
                      onChange={(e) => setCustomDaysInput(e.target.value)}
                      placeholder="e.g. 10, 45, or 120"
                      className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-bold"
                    />
                    <span className="text-xs font-bold text-neutral-500">Days</span>
                  </div>
                </div>
              )}

              {/* Custom Date Input */}
              {durationMode === 'custom_date' && (
                <div className="pt-2 animate-in fade-in duration-150">
                  <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Choose Exact Expiry Date:
                  </label>
                  <input
                    type="date"
                    value={customDateInput}
                    onChange={(e) => setCustomDateInput(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-bold"
                  />
                </div>
              )}
            </div>

            {/* Target Status & Target Plan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  2. Account Status:
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-white font-semibold"
                >
                  <option value="active">Active (Paid / Full Active)</option>
                  <option value="trialing">Trialing (Free Trial Extended)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  3. Assigned Plan:
                </label>
                <select
                  value={targetPlanId}
                  onChange={(e) => setTargetPlanId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-white font-semibold"
                >
                  <option value="plan_pro">Pro AI Plan (Recommended - ৳1,950)</option>
                  <option value="plan_starter">Starter AI Plan (৳1,250)</option>
                  <option value="plan_enterprise">Enterprise / Custom AI</option>
                </select>
              </div>
            </div>

            {/* Reactivate Channels Checkbox */}
            <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 cursor-pointer">
              <input
                type="checkbox"
                checked={autoReactivateChannels}
                onChange={(e) => setAutoReactivateChannels(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-md border-neutral-300 focus:ring-indigo-500 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-extrabold text-neutral-900 dark:text-white">
                  Reactivate all paused channels automatically
                </span>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  If the merchant's WhatsApp, Messenger, or Instagram bot channels were paused upon expiry, unpause them immediately.
                </p>
              </div>
            </label>

            {/* Admin Note */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Admin Note / Reason (Optional):
              </label>
              <input
                type="text"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="e.g. Offline bKash payment confirmed, or Special customer loyalty extension"
                className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-white"
              />
            </div>

            {/* Projected Expiry Preview Card */}
            {(() => {
              const projected = calculateTargetExpiryDate();
              const dateStr = projected.toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });
              const diffDays = Math.max(0, Math.round((projected.getTime() - Date.now()) / 86400000));

              return (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/20 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-black text-emerald-700 dark:text-emerald-300">
                    <Sparkles className="w-4 h-4" />
                    <span>Projected New Validity:</span>
                  </div>
                  <div className="text-sm font-extrabold text-neutral-900 dark:text-white">
                    Expires on: {dateStr}
                  </div>
                  <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                    Will remain valid for <strong className="text-emerald-600 dark:text-emerald-400">{diffDays} days</strong> from today with status <span className="font-bold uppercase text-indigo-600 dark:text-indigo-400">{targetStatus}</span>.
                  </div>
                </div>
              );
            })()}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setExtendingUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={extendingLoading}
                onClick={handleSaveSubscriptionExtension}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {extendingLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm &amp; Extend Time</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credit Adjustment Modal */}
      {adjustingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#141A26] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <span>Add WhatsApp Message Credits</span>
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              User: <strong className="text-slate-800 dark:text-white">{adjustingUser.email}</strong>
              <br />
              Current Quota: <strong>{(adjustingUser.whatsappUsage?.quota || 2500).toLocaleString()}</strong> messages
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Additional Message Credits to Add:
              </label>
              <input
                type="number"
                value={creditAmountInput}
                onChange={(e) => setCreditAmountInput(e.target.value)}
                placeholder="e.g. 1000 or 2500"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-bold"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAdjustingUser(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={adjustingLoading}
                onClick={handleSaveCredits}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white"
              >
                {adjustingLoading ? 'Adding...' : 'Add Credits'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
