import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Edit2,
  Check,
  X,
  CheckCircle2,
  Trash2,
  Globe,
  PhoneCall,
  Users,
  Truck,
  FileText,
  Sliders,
  Shield,
  Zap,
  Sparkles,
  MessageSquare,
  BadgePercent,
  Layers
} from 'lucide-react';
import { api } from '../../api';
import { Plan, PlanFeaturesConfig } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';

export const AdminPlans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingPlan, setIsDeletingPlan] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form state for Create / Edit
  const [formName, setFormName] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formBadge, setFormBadge] = useState('');
  const [formPrice, setFormPrice] = useState<number>(2499);
  const [formCurrency, setFormCurrency] = useState('BDT');
  const [formDurationDays, setFormDurationDays] = useState<number>(30);
  const [formTrialDays, setFormTrialDays] = useState<number>(2);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formWhatsappCredits, setFormWhatsappCredits] = useState<number>(2500);
  const [formMaxChannels, setFormMaxChannels] = useState<number>(3);

  // System module toggles
  const [formFeatWebsiteStores, setFormFeatWebsiteStores] = useState(false);
  const [formFeatCallRequests, setFormFeatCallRequests] = useState(true);
  const [formFeatCourierDispatch, setFormFeatCourierDispatch] = useState(true);
  const [formFeatCsvExport, setFormFeatCsvExport] = useState(true);
  const [formFeatVipBroadcast, setFormFeatVipBroadcast] = useState(true);

  // Item-by-item custom features list
  const [formFeatures, setFormFeatures] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await api.getPlans(true);
      if (Array.isArray(data) && data.length > 0) {
        setPlans(data);
        try {
          localStorage.setItem('oneagent_custom_plans', JSON.stringify(data));
        } catch {}
      }
    } catch (err: any) {
      console.error('Failed to load plans:', err);
      try {
        const cached = localStorage.getItem('oneagent_custom_plans');
        if (cached) setPlans(JSON.parse(cached));
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormName('');
    setFormSubtitle('Grow Your E-Commerce Business');
    setFormBadge('');
    setFormPrice(2499);
    setFormCurrency('BDT');
    setFormDurationDays(30);
    setFormTrialDays(2);
    setFormIsActive(true);
    setFormWhatsappCredits(2500);
    setFormMaxChannels(3);
    setFormFeatWebsiteStores(false);
    setFormFeatCallRequests(true);
    setFormFeatCourierDispatch(true);
    setFormFeatCsvExport(true);
    setFormFeatVipBroadcast(true);
    setFormFeatures([
      'Facebook Messenger: 100% Unlimited Conversations',
      'Instagram DM: 100% Unlimited Conversations',
      'WhatsApp: 2,500 Messages & Replies Included',
      'Bangla Voice Note AI Listening & Photo Recognition',
      '1-Click Courier Booking (Steadfast, Pathao & RedX)',
      'Autonomous AI Sales Closer Persona',
      'Unified Omnichannel Team Inbox'
    ]);
    setNewFeatureText('');
    setSuccessMsg(null);
    setErrorMsg(null);
    setShowCreateModal(true);
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setFormName(plan.name || '');
    setFormSubtitle(plan.subtitle || '');
    setFormBadge(plan.badge || '');
    setFormPrice(plan.price || 0);
    setFormCurrency(plan.currency || 'BDT');
    setFormDurationDays(plan.duration_days || 30);
    setFormTrialDays(plan.trial_days || 0);
    setFormIsActive(plan.is_active !== undefined ? plan.is_active : true);

    const cfg = plan.feature_config || {};
    setFormWhatsappCredits(cfg.whatsapp_credits || (plan.price >= 8000 ? 15000 : plan.price >= 4000 ? 6500 : 2500));
    setFormMaxChannels(cfg.max_channels || (plan.price >= 8000 ? 99 : plan.price >= 4000 ? 10 : 3));
    setFormFeatWebsiteStores(Boolean(cfg.website_stores));
    setFormFeatCallRequests(cfg.call_requests !== undefined ? Boolean(cfg.call_requests) : true);
    setFormFeatCourierDispatch(cfg.courier_dispatch !== undefined ? Boolean(cfg.courier_dispatch) : true);
    setFormFeatCsvExport(cfg.csv_export !== undefined ? Boolean(cfg.csv_export) : true);
    setFormFeatVipBroadcast(cfg.vip_broadcast !== undefined ? Boolean(cfg.vip_broadcast) : true);

    setFormFeatures(Array.isArray(plan.features) && plan.features.length > 0 ? [...plan.features] : [
      'Facebook Messenger: 100% Unlimited Conversations',
      'Instagram DM: 100% Unlimited Conversations',
      `${(cfg.whatsapp_credits || 2500).toLocaleString()} WhatsApp Messages Included`
    ]);
    setNewFeatureText('');
    setSuccessMsg(null);
    setErrorMsg(null);
    setShowCreateModal(true);
  };

  // Add individual custom feature bullet
  const handleAddFeatureItem = () => {
    const trimmed = newFeatureText.trim();
    if (!trimmed) return;
    setFormFeatures((prev) => [...prev, trimmed]);
    setNewFeatureText('');
  };

  // Remove individual feature item
  const handleRemoveFeatureItem = (index: number) => {
    setFormFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  // Update existing feature item
  const handleUpdateFeatureItem = (index: number, val: string) => {
    setFormFeatures((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorMsg('Plan name is required.');
      return;
    }

    try {
      setSavingPlan(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const planPayload: Partial<Plan> = {
        name: formName.trim(),
        price: Number(formPrice),
        currency: formCurrency.trim() || 'BDT',
        duration_days: Number(formDurationDays) || 30,
        trial_days: Number(formTrialDays) || 0,
        is_active: formIsActive,
        subtitle: formSubtitle.trim() || undefined,
        badge: formBadge.trim() || undefined,
        features: formFeatures.filter((f) => f.trim().length > 0),
        feature_config: {
          website_stores: formFeatWebsiteStores,
          call_requests: formFeatCallRequests,
          courier_dispatch: formFeatCourierDispatch,
          csv_export: formFeatCsvExport,
          vip_broadcast: formFeatVipBroadcast,
          max_channels: Number(formMaxChannels) || 3,
          whatsapp_credits: Number(formWhatsappCredits) || 2500
        }
      };

      if (editingPlan) {
        // Update existing plan
        const updated = await api.updatePlan(editingPlan.id, planPayload);
        setSuccessMsg(`Plan "${formName}" updated successfully! Price: ৳${Number(formPrice).toLocaleString()} • All changes are live on website and billing.`);
      } else {
        // Create new plan
        const created = await api.createPlan(planPayload as any);
        setSuccessMsg(`New Plan "${formName}" created successfully! Available for checkout and billing.`);
      }

      setShowCreateModal(false);
      setEditingPlan(null);
      await loadPlans();
    } catch (err: any) {
      console.error('Failed to save plan:', err);
      setErrorMsg(err?.message || 'Failed to save plan. Please check inputs and retry.');
    } finally {
      setSavingPlan(false);
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
      setSuccessMsg(`Plan "${planToDelete.name}" deleted successfully.`);
      setPlanToDelete(null);
      await loadPlans();
    } catch (err: any) {
      console.error('Failed to delete plan:', err);
      setErrorMsg(err?.message || 'Failed to delete plan.');
    } finally {
      setIsDeletingPlan(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-purple-500/20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Plans & Pricing Manager
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-100 dark:bg-purple-950/70 text-[#7C3AED] dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              {plans.length} Configured Plans
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create and customize subscription tiers item-by-item: Name, Price, Days, WhatsApp Messages quota, and feature bullets. Updates apply immediately to the website and user billing.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-purple-500/20 hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Custom Plan</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-xs font-bold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <span className="font-semibold">{errorMsg}</span>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-xs font-bold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan) => {
          const cfg = plan.feature_config || {};
          const waCredits = cfg.whatsapp_credits || (plan.price >= 8000 ? 15000 : plan.price >= 4000 ? 6500 : 2500);

          return (
            <div
              key={plan.id}
              className={`p-6 rounded-3xl bg-white dark:bg-[#120B2E] border transition-all flex flex-col justify-between ${
                plan.badge?.toLowerCase().includes('popular') || plan.id === 'plan_pro'
                  ? 'border-[#7C3AED]/70 shadow-lg shadow-purple-500/10 dark:border-purple-500/40 ring-1 ring-[#7C3AED]/20'
                  : 'border-slate-200/90 dark:border-purple-500/20 shadow-xs'
              }`}
            >
              <div className="space-y-4">
                {/* Header row: Live status and Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                      plan.is_active
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${plan.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {plan.is_active ? 'Live on Site' : 'Draft / Hidden'}
                  </span>

                  {plan.badge && (
                    <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                      {plan.badge}
                    </span>
                  )}
                </div>

                {/* Plan Name & Subtitle */}
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 line-clamp-2">
                    {plan.subtitle || 'Customized automated sales package'}
                  </p>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#1A123B] border border-slate-200/80 dark:border-purple-500/20">
                  <span className="text-xs font-bold text-slate-500">৳</span>
                  <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                    {plan.price.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {plan.currency} / {plan.duration_days} days
                  </span>
                </div>

                {/* Key Quota Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/70 dark:border-purple-800/60">
                    <span className="block text-[10px] font-bold text-[#7C3AED] dark:text-purple-300">
                      WhatsApp Quota:
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {waCredits.toLocaleString()} Msgs
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      Trial &amp; Channels:
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {plan.trial_days}d trial • {cfg.max_channels || 3} ch
                    </span>
                  </div>
                </div>

                {/* Feature Permissions Chips */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    System Modules:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        cfg.website_stores
                          ? 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 line-through'
                      }`}
                    >
                      Store Sync
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Courier 1-Click
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      Unlimited FB/IG
                    </span>
                  </div>
                </div>

                {/* Item-by-item Features Preview */}
                <div className="pt-2 border-t border-slate-100 dark:border-purple-500/15 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <span>Configured Features ({plan.features?.length || 0}):</span>
                  </div>
                  <ul className="space-y-1 max-h-36 overflow-y-auto pr-1 text-xs text-slate-600 dark:text-slate-300 scrollbar-thin">
                    {(plan.features || []).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-[11px] leading-tight">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-purple-500/15 mt-4">
                <button
                  type="button"
                  onClick={() => openEditModal(plan)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1A123B] dark:hover:bg-[#251A4E] text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>Edit Plan &amp; Features</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePromptDeletePlan(plan.id, plan.name)}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Delete Plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comprehensive Item-by-Item Plan Editor Modal (Create / Edit) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#120B2E] w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-purple-500/30 shadow-2xl p-6 sm:p-7 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-purple-500/15">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-[#7C3AED] flex items-center justify-center font-bold">
                  {editingPlan ? <Edit2 className="w-4 h-4" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">
                    {editingPlan ? `Edit Plan: ${editingPlan.name}` : 'Create New Pricing Plan'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Customize every parameter, resource quota, and feature bullet point.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingPlan(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#1A123B] dark:hover:bg-[#251A4E] text-slate-500 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-5">
              {/* Row 1: Plan Name & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Advance AI Plan, VIP Business, etc."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-purple-500/20 bg-slate-50 dark:bg-[#1A123B] text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Badge / Tagline Ribbon
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="e.g. ⭐ Most Popular, Starter Growth, Agency Power"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-purple-500/20 bg-slate-50 dark:bg-[#1A123B] text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subtitle Description
                </label>
                <input
                  type="text"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="e.g. Grow Your E-Commerce Business"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-purple-500/20 bg-slate-50 dark:bg-[#1A123B] text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* Row 2: Price, Currency, Duration, Trial */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#160E36] border border-slate-200/80 dark:border-purple-500/20">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Price (BDT) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1A123B] text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Currency
                  </label>
                  <input
                    type="text"
                    required
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1A123B] text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formDurationDays}
                    onChange={(e) => setFormDurationDays(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1A123B] text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Trial (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formTrialDays}
                    onChange={(e) => setFormTrialDays(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1A123B] text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              {/* Row 3: Quotas & Resource Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-purple-50/50 dark:bg-[#180F3D] border border-purple-200/60 dark:border-purple-500/20">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    💬 Included WhatsApp Messages Quota
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formWhatsappCredits}
                    onChange={(e) => setFormWhatsappCredits(Number(e.target.value))}
                    placeholder="e.g. 2500, 6500, 15000"
                    className="w-full text-xs p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-[#1A123B] text-slate-900 dark:text-white font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                    System messages included. No foreign card needed for user.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    🔗 Max Connected Channels Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={formMaxChannels}
                    onChange={(e) => setFormMaxChannels(Number(e.target.value))}
                    placeholder="e.g. 3, 10, 99"
                    className="w-full text-xs p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-[#1A123B] text-slate-900 dark:text-white font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                    Combined Facebook Pages, Instagram Accounts &amp; WhatsApp numbers.
                  </span>
                </div>
              </div>

              {/* Row 4: System Feature Modules Toggles */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-[#160E36] border border-slate-200/80 dark:border-purple-500/20">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-2">
                  System Modules &amp; Permissions
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formFeatWebsiteStores}
                      onChange={(e) => setFormFeatWebsiteStores(e.target.checked)}
                      className="rounded text-[#7C3AED] focus:ring-purple-500 w-4 h-4"
                    />
                    <span>🌐 Website &amp; Store Sync (Shopify / Woo)</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formFeatCourierDispatch}
                      onChange={(e) => setFormFeatCourierDispatch(e.target.checked)}
                      className="rounded text-[#7C3AED] focus:ring-purple-500 w-4 h-4"
                    />
                    <span>🚚 1-Click Courier Dispatch (Steadfast, Pathao)</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formFeatCallRequests}
                      onChange={(e) => setFormFeatCallRequests(e.target.checked)}
                      className="rounded text-[#7C3AED] focus:ring-purple-500 w-4 h-4"
                    />
                    <span>📞 Human Call Requests Queue</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formFeatVipBroadcast}
                      onChange={(e) => setFormFeatVipBroadcast(e.target.checked)}
                      className="rounded text-[#7C3AED] focus:ring-purple-500 w-4 h-4"
                    />
                    <span>📢 VIP Broadcast &amp; Follow-Up CRM</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formFeatCsvExport}
                      onChange={(e) => setFormFeatCsvExport(e.target.checked)}
                      className="rounded text-[#7C3AED] focus:ring-purple-500 w-4 h-4"
                    />
                    <span>📄 Order &amp; Customer CSV Export</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                      ✓ Active &amp; Visible on Public Website
                    </span>
                  </label>
                </div>
              </div>

              {/* Row 5: Item-by-Item Features Builder */}
              <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-[#180F3D] border border-slate-200 dark:border-purple-500/25">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 block">
                      Custom Feature Bullets (Item-by-Item)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Add, edit, or delete any bullet point to customize what customers see.
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-purple-950 text-slate-700 dark:text-purple-300">
                    {formFeatures.length} Bullets
                  </span>
                </div>

                {/* Features input list */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {formFeatures.map((feat, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-5 text-center text-xs font-bold text-slate-400">
                        {index + 1}.
                      </span>
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => handleUpdateFeatureItem(index, e.target.value)}
                        className="flex-1 text-xs p-2 rounded-xl border border-slate-200 dark:border-purple-500/20 bg-slate-50 dark:bg-[#1A123B] text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeatureItem(index)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title="Remove Feature"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new feature input */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-purple-500/15">
                  <input
                    type="text"
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeatureItem();
                      }
                    }}
                    placeholder="Type new feature bullet point and press Enter or Add..."
                    className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-purple-500/20 bg-slate-50 dark:bg-[#1A123B] text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeatureItem}
                    className="px-3.5 py-2.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-[#7C3AED] dark:text-purple-300 text-xs font-bold hover:bg-purple-200 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-purple-500/15">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingPlan(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1A123B] dark:hover:bg-[#251A4E] text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPlan}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-500/25 disabled:opacity-50"
                >
                  {savingPlan ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{editingPlan ? 'Save Changes & Publish' : 'Create & Publish Plan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {planToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Delete Pricing Plan"
          message={`Are you sure you want to permanently delete "${planToDelete.name}"? This action cannot be undone.`}
          confirmText="Yes, Delete Plan"
          confirmVariant="danger"
          isLoading={isDeletingPlan}
          onConfirm={handleConfirmDeletePlan}
          onCancel={() => setPlanToDelete(null)}
        />
      )}
    </div>
  );
};
