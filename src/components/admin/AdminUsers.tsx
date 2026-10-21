import React, { useState, useEffect } from 'react';
import { Search, Shield, User, RefreshCw, MessageSquare, Plus, Zap } from 'lucide-react';
import { api } from '../../api';
import { UserProfile, Subscription } from '../../types';

interface ExtendedUser extends UserProfile {
  subscription?: Subscription;
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
  const [adjustingUser, setAdjustingUser] = useState<ExtendedUser | null>(null);
  const [creditAmountInput, setCreditAmountInput] = useState('1000');
  const [adjustingLoading, setAdjustingLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminUsers();
      setUsers(data as any);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      await api.updateUserStatus(userId);
      await loadUsers();
    } catch {
      // ignore
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await api.updateUserRole(userId, newRole);
      await loadUsers();
    } catch {
      // ignore
    }
  };

  const handleSaveCredits = async () => {
    if (!adjustingUser) return;
    const num = parseInt(creditAmountInput, 10);
    if (isNaN(num) || num <= 0) return;

    try {
      setAdjustingLoading(true);
      const res = await fetch(`/api/admin/users/${adjustingUser.id}/adjust-credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creditsToAdd: num })
      });
      if (res.ok) {
        setAdjustingUser(null);
        await loadUsers();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAdjustingLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.full_name && u.full_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            User Accounts, Roles &amp; Message Credits
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Manage registered merchants, WhatsApp message credit quotas, and staff permissions.
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

      {/* Search Input */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email or name..."
          className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Subscription</th>
                <th className="py-3 px-4">WhatsApp Credits</th>
                <th className="py-3 px-4">Expiry</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const sub = u.subscription as any;
                  const rawEnd = sub?.endDate || sub?.end_date || sub?.current_period_end || sub?.trial_ends_at;
                  const expiryDate = rawEnd ? new Date(rawEnd).toLocaleDateString() : 'N/A';
                  const isAccountActive = !u.is_suspended;
                  const waUsage = u.whatsappUsage || { used: 0, quota: 2500, remaining: 2500 };
                  const percentUsed = Math.min(100, Math.round((waUsage.used / Math.max(1, waUsage.quota)) * 100));

                  return (
                    <tr key={u.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-neutral-900 dark:text-white">
                          {u.full_name || 'Merchant'}
                        </div>
                        <div className="text-neutral-400 font-mono text-[11px]">{u.email}</div>
                      </td>

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

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase ${
                              sub?.status === 'active'
                                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                                : sub?.status === 'trialing'
                                ? 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                            }`}
                          >
                            {sub?.status || 'No Sub'}
                          </span>
                          {sub?.planName && (
                            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                              ({sub.planName})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* WhatsApp Credits Quota Column */}
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

                      <td className="py-3.5 px-4 text-neutral-500 font-mono text-[11px]">
                        {expiryDate}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleRole(u.id, u.role)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                          title="Change user / admin role"
                        >
                          {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            isAccountActive
                              ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50'
                              : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                          }`}
                        >
                          {isAccountActive ? 'Suspend' : 'Activate'}
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
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
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
