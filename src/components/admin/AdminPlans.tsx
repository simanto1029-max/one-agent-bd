import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Edit2, Check, X, CheckCircle2, Trash2, Globe, PhoneCall, Users, Truck, FileText, Sliders, Shield } from 'lucide-react';
import { api } from '../../api';
import { Plan, PlanFeaturesConfig } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';

export const AdminPlans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingPlan, setIsDeletingPlan] = useState(false);

  // Edit fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(1450);
  const [currency, setCurrency] = useState('BDT');
  const [durationDays, setDurationDays] = useState<number>(30);
  const [trialDays, setTrialDays] = useState<number>(2);
  const [isActive, setIsActive] = useState(true);

  // Feature Config toggles
  const [featWebsiteStores, setFeatWebsiteStores] = useState(false);
  const [featCallRequests, setFeatCallRequests] = useState(true);
  const [featCourierDispatch, setFeatCourierDispatch] = useState(true);
  const [featCsvExport, setFeatCsvExport] = useState(true);
  const [featMaxChannels, setFeatMaxChannels] = useState(2);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await api.getPlans();
      setPlans(data);
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (plan: Plan) => {
    setEditingId(plan.id);
    setName(plan.name);
    setPrice(plan.price);
    setCurrency(plan.currency);
    setDurationDays(plan.duration_days);
    setTrialDays(plan.trial_days);
    setIsActive(plan.is_active);

    const cfg = plan.feature_config || {};
    const isPro = plan.id.includes('pro') || plan.name.toLowerCase().includes('pro');
    setFeatWebsiteStores(cfg.website_stores !== undefined ? Boolean(cfg.website_stores) : isPro);
    setFeatCallRequests(cfg.call_requests !== undefined ? Boolean(cfg.call_requests) : true);
    setFeatCourierDispatch(cfg.courier_dispatch !== undefined ? Boolean(cfg.courier_dispatch) : true);
    setFeatCsvExport(cfg.csv_export !== undefined ? Boolean(cfg.csv_export) : true);
    setFeatMaxChannels(cfg.max_channels || (isPro ? 8 : 2));
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (planId: string) => {
    try {
      await api.updatePlan(planId, {
        name,
        price: Number(price),
        currency,
        duration_days: Number(durationDays),
        trial_days: Number(trialDays),
        is_active: isActive,
        feature_config: {
          website_stores: featWebsiteStores,
          call_requests: featCallRequests,
          courier_dispatch: featCourierDispatch,
          csv_export: featCsvExport,
          max_channels: Number(featMaxChannels)
        }
      });
      setEditingId(null);
      await loadPlans();
    } catch (err) {
      console.error('Failed to update plan:', err);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createPlan({
        name,
        price: Number(price),
        currency,
        duration_days: Number(durationDays),
        trial_days: Number(trialDays),
        is_active: isActive,
        features: [
          'WhatsApp Cloud API Integration',
          'Facebook Messenger Auto-Reply',
          featWebsiteStores ? 'Website & Store Integrations (Shopify/Woo)' : '',
          'Unified Omnichannel Inbox',
          'Priority Customer Support'
        ].filter(Boolean),
        feature_config: {
          website_stores: featWebsiteStores,
          call_requests: featCallRequests,
          courier_dispatch: featCourierDispatch,
          csv_export: featCsvExport,
          max_channels: Number(featMaxChannels)
        }
      });
      setShowCreateModal(false);
      setName('');
      await loadPlans();
    } catch (err) {
      console.error('Failed to create plan:', err);
    }
  };

  const handlePromptDeletePlan = (planId: string, planName: string) => {
    setPlanToDelete({ id: planId, name: planName });
  };

  const handleConfirmDeletePlan = async () => {
    if (!planToDelete) return;
    try {
      setIsDeletingPlan(true);
      await api.deletePlan(planToDelete.id);
      setPlanToDelete(null);
      await loadPlans();
    } catch (err) {
      console.error('Failed to delete plan:', err);
    } finally {
      setIsDeletingPlan(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            Plans & Dynamic Pricing
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Configure subscription tiers, price (BDT), duration, and free trial days. Updates apply immediately to the public marketing site.
          </p>
        </div>

        <button
          onClick={() => {
            setName('');
            setPrice(1499);
            setCurrency('BDT');
            setDurationDays(30);
            setTrialDays(3);
            setIsActive(true);
            setShowCreateModal(true);
          }}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isEditing = editingId === plan.id;

          return (
            <div
              key={plan.id}
              className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between"
            >
              {isEditing ? (
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-500">Plan Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500">Price</label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full text-xs p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500">Currency</label>
                      <input
                        type="text"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500">Duration (Days)</label>
                      <input
                        type="number"
                        value={durationDays}
                        onChange={(e) => setDurationDays(Number(e.target.value))}
                        className="w-full text-xs p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500">Free Trial (Days)</label>
                      <input
                        type="number"
                        value={trialDays}
                        onChange={(e) => setTrialDays(Number(e.target.value))}
                        className="w-full text-xs p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id={`active-${plan.id}`}
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <label htmlFor={`active-${plan.id}`} className="text-xs text-neutral-700 dark:text-neutral-300">
                      Active on Marketing Page
                    </label>
                  </div>

                  {/* Plan Feature Access Control (Admin Config) */}
                  <div className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-2.5">
                    <span className="block text-[11px] font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                      Feature Access & Permissions
                    </span>

                    <label className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={featWebsiteStores}
                        onChange={(e) => setFeatWebsiteStores(e.target.checked)}
                        className="rounded text-violet-600"
                      />
                      <span>🌐 Website & Stores (Shopify / WooCommerce)</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={featCallRequests}
                        onChange={(e) => setFeatCallRequests(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <span>📞 Human Call Requests Queue</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={featCourierDispatch}
                        onChange={(e) => setFeatCourierDispatch(e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span>🚚 Courier 1-Click Delivery Dispatch</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={featCsvExport}
                        onChange={(e) => setFeatCsvExport(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span>📄 Order Export (.TXT & .CSV)</span>
                    </label>

                    <div className="pt-1 flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                        Max Channels Limit:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={featMaxChannels}
                        onChange={(e) => setFeatMaxChannels(Number(e.target.value))}
                        className="w-16 text-xs p-1 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 font-mono text-center"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        plan.is_active
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                      }`}
                    >
                      {plan.is_active ? 'Live on Site' : 'Hidden'}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">ID: {plan.id}</span>
                  </div>

                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-black text-neutral-900 dark:text-white font-mono">
                      {plan.price}
                    </span>
                    <span className="text-xs text-neutral-500 font-bold">
                      {plan.currency} / {plan.duration_days} days
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-800 pt-3">
                    <div className="flex justify-between">
                      <span>Configured Trial:</span>
                      <strong className="text-neutral-900 dark:text-white">{plan.trial_days} days free</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Billing Cycle:</span>
                      <strong className="text-neutral-900 dark:text-white">{plan.duration_days} days</strong>
                    </div>
                  </div>

                  {/* Feature Permissions Summary Badges */}
                  <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Plan Feature Permissions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                        plan.feature_config?.website_stores
                          ? 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                      }`}>
                        🌐 Stores: {plan.feature_config?.website_stores ? 'PRO Unlocked' : 'Locked (Pro only)'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        📞 Call Queue: Active
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        🌟 VIP Broadcast: Active
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        🚚 Courier: 1-Click
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        Max Channels: {plan.feature_config?.max_channels || 2}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => handleSaveEdit(plan.id)}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs font-semibold cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(plan)}
                      className="flex-1 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit Plan
                    </button>
                    <button
                      onClick={() => handlePromptDeletePlan(plan.id, plan.name)}
                      className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-md p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                Create New Pricing Plan
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pro Agency"
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Currency
                  </label>
                  <input
                    type="text"
                    required
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    required
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Trial Period (Days)
                  </label>
                  <input
                    type="number"
                    required
                    value={trialDays}
                    onChange={(e) => setTrialDays(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Feature Permissions for New Plan */}
              <div className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 space-y-2">
                <span className="block text-[11px] font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                  Feature Permissions
                </span>

                <label className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featWebsiteStores}
                    onChange={(e) => setFeatWebsiteStores(e.target.checked)}
                    className="rounded text-violet-600"
                  />
                  <span>🌐 Website & Stores (Shopify / WooCommerce)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featCallRequests}
                    onChange={(e) => setFeatCallRequests(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>📞 Human Call Requests Queue</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featCourierDispatch}
                    onChange={(e) => setFeatCourierDispatch(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>🚚 Courier 1-Click Delivery Dispatch</span>
                </label>

                <div className="pt-1 flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                    Max Channels:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={featMaxChannels}
                    onChange={(e) => setFeatMaxChannels(Number(e.target.value))}
                    className="w-16 text-xs p-1 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 font-mono text-center"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Plan Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(planToDelete)}
        onClose={() => setPlanToDelete(null)}
        onConfirm={handleConfirmDeletePlan}
        title="Delete Pricing Plan?"
        message={`Are you sure you want to permanently remove the "${planToDelete?.name}" plan? Users will no longer be able to select this plan.`}
        confirmText="Yes, Delete Plan"
        cancelText="Keep Plan"
        isDestructive={true}
        isLoading={isDeletingPlan}
      />
    </div>
  );
};
