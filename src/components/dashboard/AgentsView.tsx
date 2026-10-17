import React, { useState, useEffect } from 'react';
import {
  Bot,
  Plus,
  Sparkles,
  Smartphone,
  Facebook,
  Instagram,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Play,
  Send,
  Zap,
  Crown,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  Store,
  Layers,
  HelpCircle,
  X,
  Sliders,
  DollarSign,
  Truck,
  Check
} from 'lucide-react';
import { Agent, Channel, UserProfile, SubscriptionStatusInfo } from '../../types';
import { api } from '../../api';
import { ConfirmModal } from '../common/ConfirmModal';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { FacebookLogo, InstagramLogo, WhatsAppLogo } from '../common/BrandLogos';

interface AgentsViewProps {
  currentUser: UserProfile;
  subStatus: SubscriptionStatusInfo | null;
  channels: Channel[];
  onNavigate: (tab: string) => void;
  onRefreshChannels?: () => void;
}

export const AgentsView: React.FC<AgentsViewProps> = ({
  currentUser,
  subStatus,
  channels,
  onNavigate,
  onRefreshChannels
}) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<{
    total: number;
    maxAllowed: number;
    planName: string;
    isPro: boolean;
    canCreateMore: boolean;
  }>({
    total: 1,
    maxAllowed: 3,
    planName: 'Starter AI Plan',
    isPro: false,
    canCreateMore: true
  });

  // Modals & Drawers
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  const [activeTestingAgent, setActiveTestingAgent] = useState<Agent | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formBusiness, setFormBusiness] = useState('');
  const [formTone, setFormTone] = useState<'sales_closer' | 'friendly' | 'urgent' | 'professional'>('sales_closer');
  const [formLanguage, setFormLanguage] = useState<'bangla' | 'english' | 'banglish'>('bangla');
  const [formChannels, setFormChannels] = useState<string[]>([]);
  const [formPrompt, setFormPrompt] = useState('');
  const [formKnowledgeBase, setFormKnowledgeBase] = useState('');
  const [formDhakaDelivery, setFormDhakaDelivery] = useState<number>(60);
  const [formOutsideDelivery, setFormOutsideDelivery] = useState<number>(120);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Simulator chat state
  const [testInput, setTestInput] = useState('');
  const [testMessages, setTestMessages] = useState<{ role: 'customer' | 'agent'; text: string; time: string }[]>([]);
  const [testingInFlight, setTestingInFlight] = useState(false);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const res = await api.getAgents();
      setAgents(res.agents || []);
      if (res.meta) setMeta(res.meta);
    } catch (err: any) {
      console.error('Failed to load agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingAgent(null);
    setFormName('');
    setFormBusiness(currentUser.full_name || 'My New Business');
    setFormTone('sales_closer');
    setFormLanguage('bangla');
    setFormChannels([]);
    setFormPrompt(
      'You are the autonomous Customer Service & Sales AI Assistant. Reply politely in natural Bangla, answer product inquiries with accurate prices, and capture customer Full Name, Delivery Address, and Phone Number to confirm orders.'
    );
    setFormKnowledgeBase(
      'Business Products: Premium items with quality warranty.\nDelivery Charges: Inside Dhaka 60 BDT (24-48 hours), Outside Dhaka 120 BDT (2-3 days).\nPayment: Cash on Delivery (COD), bKash/Nagad.'
    );
    setFormDhakaDelivery(60);
    setFormOutsideDelivery(120);
    setErrorMsg(null);
    setShowCreateModal(true);
  };

  const openEditModal = (agent: Agent) => {
    setEditingAgent(agent);
    setFormName(agent.name);
    setFormBusiness(agent.business_name);
    setFormTone(agent.tone);
    setFormLanguage(agent.language);
    setFormChannels(agent.assigned_channels || []);
    setFormPrompt(agent.system_prompt);
    setFormKnowledgeBase(agent.knowledge_base);
    setFormDhakaDelivery(agent.delivery_charge_inside_dhaka ?? 60);
    setFormOutsideDelivery(agent.delivery_charge_outside_dhaka ?? 120);
    setErrorMsg(null);
    setShowCreateModal(true);
  };

  const handleToggleChannelAssignment = (chId: string) => {
    setFormChannels((prev) =>
      prev.includes(chId) ? prev.filter((id) => id !== chId) : [...prev, chId]
    );
  };

  const handleSaveAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formBusiness.trim()) {
      setErrorMsg('Please enter both Agent Name and Business / Brand Name.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      if (editingAgent) {
        await api.updateAgent(editingAgent.id, {
          name: formName.trim(),
          business_name: formBusiness.trim(),
          tone: formTone,
          language: formLanguage,
          assigned_channels: formChannels,
          system_prompt: formPrompt.trim(),
          knowledge_base: formKnowledgeBase.trim(),
          delivery_charge_inside_dhaka: Number(formDhakaDelivery) || 60,
          delivery_charge_outside_dhaka: Number(formOutsideDelivery) || 120
        });
        setSuccessMsg(`AI Agent "${formName}" updated successfully!`);
      } else {
        await api.createAgent({
          name: formName.trim(),
          business_name: formBusiness.trim(),
          tone: formTone,
          language: formLanguage,
          assigned_channels: formChannels,
          system_prompt: formPrompt.trim(),
          knowledge_base: formKnowledgeBase.trim(),
          delivery_charge_inside_dhaka: Number(formDhakaDelivery) || 60,
          delivery_charge_outside_dhaka: Number(formOutsideDelivery) || 120
        });
        setSuccessMsg(`New AI Agent "${formName}" created for "${formBusiness}"!`);
      }

      setShowCreateModal(false);
      await loadAgents();
      if (onRefreshChannels) onRefreshChannels();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save AI Agent.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (agent: Agent) => {
    try {
      const nextActive = !agent.is_active;
      await api.updateAgent(agent.id, { is_active: nextActive });
      setAgents((prev) =>
        prev.map((a) => (a.id === agent.id ? { ...a, is_active: nextActive } : a))
      );
    } catch (err: any) {
      console.error('Failed to toggle agent active status:', err);
    }
  };

  const handleDeleteAgent = async () => {
    if (!agentToDelete) return;
    try {
      await api.deleteAgent(agentToDelete.id);
      setAgentToDelete(null);
      await loadAgents();
      if (onRefreshChannels) onRefreshChannels();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete agent.');
    }
  };

  const openTestPlayground = (agent: Agent) => {
    setActiveTestingAgent(agent);
    setTestMessages([
      {
        role: 'agent',
        text: `আসসালামু আলাইকুম! আমি "${agent.business_name}"-এর এআই সেলস অ্যাসিস্ট্যান্ট ${agent.name}। আমাদের প্রোডাক্ট, ডেলিভারি বা অর্ডার সংক্রান্ত যেকোনো তথ্য জানতে জিজ্ঞেস করতে পারেন।`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setTestInput('');
  };

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim() || !activeTestingAgent || testingInFlight) return;

    const userText = testInput.trim();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTestMessages((prev) => [...prev, { role: 'customer', text: userText, time: nowTime }]);
    setTestInput('');
    setTestingInFlight(true);

    try {
      const res = await api.testAgentReply(activeTestingAgent.id, userText);
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setTestMessages((prev) => [
        ...prev,
        { role: 'agent', text: res.reply, time: replyTime }
      ]);
    } catch (err: any) {
      setTestMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          text: 'ধন্যবাদ আপনার মেসেজের জন্য! আমাদের প্রতিনিধি খুব শীঘ্রই যোগাযোগ করবেন।',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setTestingInFlight(false);
    }
  };

  const isProPlan = subStatus?.isProPlan;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-6xl mx-auto">
      {/* Top Header & Overview Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#120B2E] border border-slate-200/80 dark:border-purple-500/20 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300">
              <Bot className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-[#7C3AED] dark:text-purple-300 uppercase tracking-wider">
              Autonomous AI Agents Hub
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Multi-Business &amp; Multi-Agent Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Create independent AI sales agents for each of your businesses, Facebook Pages, Instagram accounts, and WhatsApp numbers. Each agent maintains its own persona, product knowledge base, and reply rules.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={openCreateModal}
            disabled={!meta.canCreateMore}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
              meta.canCreateMore
                ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white shadow-purple-500/25'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Create AI Agent</span>
          </button>

          {!isProPlan && (
            <button
              type="button"
              onClick={() => onNavigate('billing')}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Upgrade to Pro for 10 Agents & 10 Channels"
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Upgrade to Pro</span>
            </button>
          )}
        </div>
      </div>

      {/* Plan Quota & Limits Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-50/80 via-white to-indigo-50/60 dark:from-[#160E36] dark:via-[#110B29] dark:to-[#171038] border border-purple-200/70 dark:border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            {agents.length}/{meta.maxAllowed}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                {agents.length} of {meta.maxAllowed} AI Agents Active
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                {meta.planName}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isProPlan
                ? 'Your Pro Plan allows up to 10 autonomous agents assigned to different pages & numbers.'
                : 'Starter Plan supports 3 AI agents. Upgrade to Pro for 10 agents and multi-page routing.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('channels')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#1E1545] border border-slate-200 dark:border-purple-500/25 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Manage Channels ({channels.length})</span>
          </button>
        </div>
      </div>

      {/* Feedback Alerts */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-xs font-bold hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-xs font-bold hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Agents Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#7C3AED]" />
          <p className="text-xs">Loading AI Agents...</p>
        </div>
      ) : agents.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-[#120B2E] border border-dashed border-slate-300 dark:border-purple-500/30 text-center space-y-3">
          <Bot className="w-12 h-12 text-slate-300 dark:text-purple-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No AI Agents Created Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "Create AI Agent" to configure an autonomous sales representative for your Facebook Page or WhatsApp.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#7C3AED] text-white hover:bg-[#6D28D9] transition-colors cursor-pointer"
          >
            Create First Agent
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {agents.map((agent) => {
            const assignedChs = channels.filter((c) =>
              (agent.assigned_channels || []).includes(c.id) || c.agent_id === agent.id
            );

            return (
              <div
                key={agent.id}
                className={`p-5 rounded-2xl bg-white dark:bg-[#120B2E] border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-xs ${
                  agent.is_active
                    ? 'border-slate-200/80 dark:border-purple-500/20 hover:border-[#7C3AED]/40'
                    : 'border-slate-200 dark:border-slate-800 opacity-75'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Top Bar: Avatar, Name, Status Toggle */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={agent.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'}
                        alt={agent.name}
                        className="w-11 h-11 rounded-2xl object-cover border border-purple-200/80 dark:border-purple-500/30 shadow-xs shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                            {agent.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-medium truncate mt-0.5">
                          <Store className="w-3 h-3 text-[#7C3AED]" />
                          <span className="truncate">{agent.business_name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <ToggleSwitch
                        checked={agent.is_active}
                        onChange={() => handleToggleActive(agent)}
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* Badges: Tone, Language, Status */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                    <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                      {agent.tone === 'sales_closer'
                        ? '🔥 Sales Closer'
                        : agent.tone === 'friendly'
                        ? '😊 Friendly'
                        : agent.tone === 'urgent'
                        ? '⚡ Urgent / Stock Alert'
                        : '💼 Executive'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {agent.language === 'bangla' ? 'বাংলা (Bangla)' : agent.language === 'english' ? 'English' : 'Banglish'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                      COD Dhaka: ৳{agent.delivery_charge_inside_dhaka || 60}
                    </span>
                  </div>

                  {/* Assigned Channels List */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#18103A] border border-slate-200/60 dark:border-purple-500/15 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-[#7C3AED]" />
                        <span>Connected Channels:</span>
                      </span>
                      <span className="font-bold text-slate-800 dark:text-white">
                        {assignedChs.length} assigned
                      </span>
                    </div>

                    {assignedChs.length === 0 ? (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 italic">
                        No channel assigned yet. Edit this agent to attach Facebook or WhatsApp.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {assignedChs.map((c) => (
                          <span
                            key={c.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white dark:bg-[#201548] border border-slate-200/70 dark:border-purple-500/20 text-slate-800 dark:text-slate-200"
                          >
                            {c.platform === 'whatsapp' ? (
                              <WhatsAppLogo className="w-3 h-3" />
                            ) : c.platform === 'messenger' ? (
                              <FacebookLogo className="w-3 h-3" />
                            ) : (
                              <InstagramLogo className="w-3 h-3" />
                            )}
                            <span className="truncate max-w-[120px]">{c.name}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Knowledge Base Excerpt */}
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 italic bg-slate-50/50 dark:bg-[#150D32] p-2.5 rounded-xl border border-slate-100 dark:border-purple-500/10">
                    "{agent.knowledge_base}"
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-purple-500/15 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => openTestPlayground(agent)}
                    className="flex-1 py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-[#7C3AED] dark:text-purple-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Test Simulator</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(agent)}
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1A123B] transition-colors cursor-pointer"
                      title="Edit Agent & Knowledge Base"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {agents.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setAgentToDelete(agent)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete Agent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT AGENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#120B2E] rounded-3xl border border-slate-200/80 dark:border-purple-500/30 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-purple-500/15 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-[#7C3AED] flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    {editingAgent ? 'Edit AI Agent & Rules' : 'Create New AI Agent'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Configure persona, business knowledge, and assign to specific channels.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAgent} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Agent Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Gadget Pro Assistant"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-purple-500/25 bg-slate-50 dark:bg-[#1A123B] text-slate-900 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Business / Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formBusiness}
                    onChange={(e) => setFormBusiness(e.target.value)}
                    placeholder="e.g., TechWorld BD"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-purple-500/25 bg-slate-50 dark:bg-[#1A123B] text-slate-900 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              {/* Tone & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sales Persona &amp; Tone
                  </label>
                  <select
                    value={formTone}
                    onChange={(e) => setFormTone(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-purple-500/25 bg-slate-50 dark:bg-[#1A123B] text-slate-900 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option value="sales_closer">🔥 Sales Closer (Focus on closing COD orders)</option>
                    <option value="friendly">😊 Warm &amp; Friendly (Polite customer support)</option>
                    <option value="urgent">⚡ Fast &amp; Urgent (Highlights limited stock &amp; dispatch)</option>
                    <option value="professional">💼 Executive / Professional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Reply Language
                  </label>
                  <select
                    value={formLanguage}
                    onChange={(e) => setFormLanguage(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-purple-500/25 bg-slate-50 dark:bg-[#1A123B] text-slate-900 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option value="bangla">বাংলা (Natural polite Bengali script)</option>
                    <option value="english">English (Clear corporate English)</option>
                    <option value="banglish">Banglish / Dynamic matching</option>
                  </select>
                </div>
              </div>

              {/* Delivery Rates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-2xl bg-purple-50/50 dark:bg-[#18103A] border border-purple-200/50 dark:border-purple-500/15">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Inside Dhaka Delivery Charge (BDT)
                  </label>
                  <input
                    type="number"
                    value={formDhakaDelivery}
                    onChange={(e) => setFormDhakaDelivery(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-purple-500/25 bg-white dark:bg-[#120B2E] text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Outside Dhaka Delivery Charge (BDT)
                  </label>
                  <input
                    type="number"
                    value={formOutsideDelivery}
                    onChange={(e) => setFormOutsideDelivery(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-purple-500/25 bg-white dark:bg-[#120B2E] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Assign to Channels */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Assign to Channels (Pages, WhatsApp, Instagram)
                </label>
                <p className="text-[11px] text-slate-500">
                  Select which connected accounts this agent will autonomously manage.
                </p>

                {channels.length === 0 ? (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500">
                    No channels connected yet. You can create this agent now and connect channels from the Channels tab.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {channels.map((ch) => {
                      const isAssigned = formChannels.includes(ch.id);
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => handleToggleChannelAssignment(ch.id)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                            isAssigned
                              ? 'bg-purple-50 dark:bg-purple-950/60 border-[#7C3AED] text-purple-900 dark:text-purple-200'
                              : 'bg-white dark:bg-[#18103A] border-slate-200 dark:border-purple-500/20 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {ch.platform === 'whatsapp' ? (
                              <WhatsAppLogo className="w-4 h-4 shrink-0" />
                            ) : ch.platform === 'messenger' ? (
                              <FacebookLogo className="w-4 h-4 shrink-0" />
                            ) : (
                              <InstagramLogo className="w-4 h-4 shrink-0" />
                            )}
                            <span className="truncate">{ch.name}</span>
                          </div>
                          {isAssigned && <Check className="w-4 h-4 text-[#7C3AED] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Business Knowledge Base */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Business Knowledge Base &amp; Products Info
                </label>
                <textarea
                  rows={3}
                  value={formKnowledgeBase}
                  onChange={(e) => setFormKnowledgeBase(e.target.value)}
                  placeholder="Detail your product lines, pricing, sizes, warranties, cash on delivery terms, and bKash numbers here..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-purple-500/25 bg-slate-50 dark:bg-[#1A123B] text-slate-900 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              {/* System Prompt */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Custom AI Behavior &amp; Closing Prompt
                </label>
                <textarea
                  rows={3}
                  value={formPrompt}
                  onChange={(e) => setFormPrompt(e.target.value)}
                  placeholder="Instructions for how the AI handles customer queries, asks for delivery address, and confirms orders..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-purple-500/25 bg-slate-50 dark:bg-[#1A123B] text-slate-900 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-purple-500/15 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-sm shadow-purple-500/25 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving Agent...' : editingAgent ? 'Save Changes' : 'Create Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AGENT TEST SIMULATOR PLAYGROUND DRAWER */}
      {activeTestingAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#120B2E] rounded-3xl border border-slate-200/80 dark:border-purple-500/30 shadow-2xl overflow-hidden flex flex-col h-[600px] animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-purple-500/15 flex items-center justify-between bg-slate-50 dark:bg-[#18103A]">
              <div className="flex items-center gap-2.5">
                <img
                  src={activeTestingAgent.avatar_url}
                  alt={activeTestingAgent.name}
                  className="w-9 h-9 rounded-xl object-cover border border-purple-300 dark:border-purple-500/30"
                />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{activeTestingAgent.name}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Live Simulator · {activeTestingAgent.business_name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTestingAgent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-[#0E0824]">
              {testMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.role === 'customer' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'customer'
                        ? 'bg-[#7C3AED] text-white rounded-br-xs'
                        : 'bg-white dark:bg-[#1C1342] text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-purple-500/20 rounded-bl-xs shadow-2xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span
                      className={`block text-[9px] mt-1 text-right ${
                        msg.role === 'customer' ? 'text-purple-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}

              {testingInFlight && (
                <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-semibold p-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{activeTestingAgent.name} is typing reply...</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Pill Buttons */}
            <div className="px-3 py-2 bg-white dark:bg-[#150D35] border-t border-slate-100 dark:border-purple-500/10 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <button
                type="button"
                onClick={() => setTestInput('দাম কত? ডেলিভারি চার্জ কত?')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 text-slate-700 dark:text-slate-300 hover:text-purple-600 shrink-0 cursor-pointer"
              >
                "দাম ও ডেলিভারি কত?"
              </button>
              <button
                type="button"
                onClick={() => setTestInput('আমি ২টা অর্ডার করব। ক্যাশ অন ডেলিভারি আছে?')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 text-slate-700 dark:text-slate-300 hover:text-purple-600 shrink-0 cursor-pointer"
              >
                "ক্যাশ অন ডেলিভারি আছে?"
              </button>
              <button
                type="button"
                onClick={() => setTestInput('ঢাকার বাইরে কত দিনে পাব?')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 text-slate-700 dark:text-slate-300 hover:text-purple-600 shrink-0 cursor-pointer"
              >
                "ঢাকার বাইরে ডেলিভারি?"
              </button>
            </div>

            {/* Chat Input */}
            <form
              onSubmit={handleSendTestMessage}
              className="p-3 border-t border-slate-100 dark:border-purple-500/15 bg-white dark:bg-[#18103A] flex items-center gap-2"
            >
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Type customer message in Bangla / English..."
                className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-purple-500/25 bg-slate-50 dark:bg-[#120B2E] text-slate-900 dark:text-white focus:outline-none focus:border-[#7C3AED]"
              />
              <button
                type="submit"
                disabled={testingInFlight || !testInput.trim()}
                className="p-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {agentToDelete && (
        <ConfirmModal
          isOpen={Boolean(agentToDelete)}
          title="Delete AI Agent?"
          message={`Are you sure you want to delete "${agentToDelete.name}" for "${agentToDelete.business_name}"? Connected channels will become unassigned.`}
          confirmLabel="Delete Agent"
          cancelLabel="Keep Agent"
          isDestructive={true}
          onConfirm={handleDeleteAgent}
          onCancel={() => setAgentToDelete(null)}
        />
      )}
    </div>
  );
};
