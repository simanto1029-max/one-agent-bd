import React from 'react';
import { Users, CreditCard, Clock, DollarSign, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { AdminOverviewStats } from '../../types';

interface AdminOverviewProps {
  stats: AdminOverviewStats | null;
  onNavigate: (tab: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ stats, onNavigate }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
          Platform Executive Overview
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          High-level metrics across user growth, active plans, pending revenue verifications, and platform usage.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-white">
            {stats?.totalUsers ?? 0}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Registered merchant accounts
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Subscriptions</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {stats?.activeSubs ?? 0}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {stats?.trialUsers ?? 0} currently on free trial
          </div>
        </div>

        <div
          onClick={() => onNavigate('payments')}
          className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs hover:border-amber-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Payments</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 flex items-center justify-between">
            <span>{stats?.pendingPaymentsCount ?? 0}</span>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Awaiting 1-click verification
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-white font-mono">
            {(stats?.totalRevenue ?? 0).toLocaleString()} <span className="text-sm font-sans font-bold text-neutral-400">BDT</span>
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Verified manual payments
          </div>
        </div>
      </div>

      {/* Quick Action Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-600" />
              Pending Payment Approvals ({stats?.pendingPaymentsCount ?? 0})
            </h3>
            <button
              onClick={() => onNavigate('payments')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1 cursor-pointer"
            >
              Open Queue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Merchants who submitted bKash and Nagad transaction IDs require review. Approve them with a single click to instantly unlock full access and set their expiry date.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/20 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Dynamic Plans & Pricing
            </h3>
            <button
              onClick={() => onNavigate('plans')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
            >
              Manage Plans <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Modify subscription costs, trial durations, or plan names. Changes automatically update the live public landing page pricing table without redeployment.
          </p>
        </div>
      </div>
    </div>
  );
};
