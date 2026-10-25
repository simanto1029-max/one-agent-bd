import React, { useState, useEffect } from 'react';
import {
  Bot,
  Key,
  Sparkles,
  Check,
  Send,
  ShoppingBag,
  Briefcase,
  UtensilsCrossed,
  Truck,
  MessageSquare,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  X,
  Zap,
  CreditCard,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Store,
  Layers,
  Smartphone,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Sliders
} from 'lucide-react';
import { api } from '../../api';
import { AutomationSettings, Agent, Channel } from '../../types';
import { DeliverySettingsSection } from './DeliverySettingsSection';
import { FacebookLogo, InstagramLogo, WhatsAppLogo } from '../common/BrandLogos';

interface SettingsViewProps {
  onRefreshUser: () => void;
}

const DEFAULT_BUSINESS_DETAILS = `ব্যবসায়িক তথ্য ও প্রোডাক্ট বিবরণ:
• প্রতিষ্ঠানের নাম: Trendly BD
• প্রোডাক্ট ও সার্ভিস: প্রিমিয়াম কোয়ালিটির মেন্স ও উইমেন্স ফ্যাশন পোশাক (টি-শার্ট, শার্ট, পাঞ্জাবি ও ড্রেস)।
• প্রোডাক্টের দাম: টি-শার্ট ৪৯০-৭৫০ টাকা, পাঞ্জাবি ১,২০০-২,৫০০ টাকা।
• ডেলিভারি চার্জ ও সময়: ঢাকার ভেতরে ৬০ টাকা (২৪-৪৮ ঘণ্টা), ঢাকার বাইরে ১২০ টাকা (২-৩ দিন)।
• পেমেন্ট সুবিধা: ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে মূল্য পরিশোধ), এবং বিকাশ ও নগদ পেমেন্ট।
• অর্ডার করার নিয়ম: পছন্দের পণ্যের নাম/সাইজ, সম্পূর্ণ ডেলিভারি ঠিকানা এবং সচল মোবাইল নাম্বার দিন।
• কাস্টমার সাপোর্ট: সকাল ৯টা থেকে রাত ১১টা পর্যন্ত সরাসরি ইনবক্সে।`;

export const SettingsView: React.FC<SettingsViewProps> = ({ onRefreshUser }) => {
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'anthropic'>('gemini');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('oneagentbd_saved_api_key') || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [keySavedBanner, setKeySavedBanner] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState<'ai' | 'delivery' | 'credits' | 'instant'>('ai');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Multi-Business Agent Training Scoping State
  const [agentsList, setAgentsList] = useState<Agent[]>([]);
  const [channelsList, setChannelsList] = useState<Channel[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('default');
  const [agentKnowledgeBase, setAgentKnowledgeBase] = useState('');
  const [agentPrompt, setAgentPrompt] = useState('');
  const [agentTone, setAgentTone] = useState<'sales_closer' | 'friendly' | 'urgent' | 'professional'>('sales_closer');
  const [agentLanguage, setAgentLanguage] = useState<'bangla' | 'english' | 'banglish'>('bangla');
  const [agentDhakaDelivery, setAgentDhakaDelivery] = useState<number>(60);
  const [agentOutsideDelivery, setAgentOutsideDelivery] = useState<number>(120);
  const [savingAgent, setSavingAgent] = useState(false);
  const [savedAgentSuccess, setSavedAgentSuccess] = useState(false);

  // Instant FAQ & Cost-Saver Rules State
  const [instantRules, setInstantRules] = useState<any[]>([]);
  const [costSaverActive, setCostSaverActive] = useState(true);
  const [rulesTriggeredCount, setRulesTriggeredCount] = useState(0);
  const [savingInstantRules, setSavingInstantRules] = useState(false);
  const [savedInstantSuccess, setSavedInstantSuccess] = useState(false);
  const [newRuleKeyword, setNewRuleKeyword] = useState('');
  const [newRuleReply, setNewRuleReply] = useState('');
  const [newRuleName, setNewRuleName] = useState('');
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);

  // Credits & Quota Usage State
  const [creditsData, setCreditsData] = useState<any>(null);
  const [loadingCredits, setLoadingCredits] = useState(false);

  // Smart Sales Booster & Automation Settings
  const [autoSettings, setAutoSettings] = useState<AutomationSettings | null>(null);
  const [upsellEnabled, setUpsellEnabled] = useState(true);
  const [upsellOfferText, setUpsellOfferText] = useState(
    'যেকোনো ২টি প্রোডাক্ট একসাথে অর্ডার করলেই ডেলিভারি সম্পূর্ণ ফ্রি!'
  );
  const [autoPaymentVerify, setAutoPaymentVerify] = useState(true);
  const [autoTrackingReply, setAutoTrackingReply] = useState(true);
  const [savingAutoBooster, setSavingAutoBooster] = useState(false);
  const [savedAutoBooster, setSavedAutoBooster] = useState(false);

  const populateAgentForm = (agent: Agent) => {
    setAgentKnowledgeBase(agent.knowledge_base || '');
    setAgentPrompt(agent.system_prompt || '');
    setAgentTone(agent.tone || 'sales_closer');
    setAgentLanguage(agent.language || 'bangla');
    setAgentDhakaDelivery(agent.delivery_charge_inside_dhaka ?? 60);
    setAgentOutsideDelivery(agent.delivery_charge_outside_dhaka ?? 120);
  };

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgentId(agentId);
    if (agentId === 'default') {
      return;
    }
    const target = agentsList.find((a) => a.id === agentId);
    if (target) {
      populateAgentForm(target);
    }
  };

  const handleSaveAgentTraining = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const currentAgent = agentsList.find((a) => a.id === selectedAgentId);
    if (!currentAgent) return;

    try {
      setSavingAgent(true);
      await api.updateAgent(currentAgent.id, {
        knowledge_base: agentKnowledgeBase.trim(),
        system_prompt: agentPrompt.trim(),
        tone: agentTone,
        language: agentLanguage,
        delivery_charge_inside_dhaka: Number(agentDhakaDelivery) || 60,
        delivery_charge_outside_dhaka: Number(agentOutsideDelivery) || 120
      });

      setAgentsList((prev) =>
        prev.map((a) =>
          a.id === currentAgent.id
            ? {
                ...a,
                knowledge_base: agentKnowledgeBase.trim(),
                system_prompt: agentPrompt.trim(),
                tone: agentTone,
                language: agentLanguage,
                delivery_charge_inside_dhaka: Number(agentDhakaDelivery) || 60,
                delivery_charge_outside_dhaka: Number(agentOutsideDelivery) || 120
              }
            : a
        )
      );

      // Also mirror to user global prompt if this is the only agent
      if (agentsList.length <= 1) {
        api.updateLLMSettings({
          system_prompt: `${agentKnowledgeBase}\n\n${agentPrompt}`
        }).catch(() => {});
      }

      setSavedAgentSuccess(true);
      setTimeout(() => setSavedAgentSuccess(false), 3500);
      onRefreshUser();
    } catch (err: any) {
      console.error('Failed to save agent training:', err);
    } finally {
      setSavingAgent(false);
    }
  };

  const loadAgentsAndChannels = async () => {
    try {
      const [agentsRes, chsRes] = await Promise.all([
        api.getAgents().catch(() => ({ agents: [] })),
        api.getChannels().catch(() => [])
      ]);
      const list = agentsRes.agents || [];
      setAgentsList(list);
      setChannelsList(chsRes || []);

      const targetId = localStorage.getItem('oneagentbd_target_agent_id');
      if (targetId) {
        localStorage.removeItem('oneagentbd_target_agent_id');
        setActiveSection('ai');
        const found = list.find((a: Agent) => a.id === targetId);
        if (found) {
          setSelectedAgentId(found.id);
          populateAgentForm(found);
        }
      } else if (list.length > 0) {
        // Default to first agent so training is instantly active
        setSelectedAgentId(list[0].id);
        populateAgentForm(list[0]);
      }
    } catch (err) {
      console.warn('Could not load agents in settings:', err);
    }
  };

  const loadInstantRules = async () => {
    try {
      const res = await api.getInstantRules();
      if (res?.rules) {
        setInstantRules(res.rules);
        setCostSaverActive(res.cost_saver_active ?? true);
        setRulesTriggeredCount(res.triggered_count ?? 48);
      }
    } catch (e) {
      console.warn('Could not load instant rules:', e);
    }
  };

  const loadCredits = async () => {
    try {
      setLoadingCredits(true);
      const res = await api.getCreditsUsage();
      if (res) {
        setCreditsData(res);
      }
    } catch (e) {
      console.warn('Could not load credits data:', e);
    } finally {
      setLoadingCredits(false);
    }
  };

  useEffect(() => {
    loadSettings();
    loadAgentsAndChannels();
    loadInstantRules();
    loadCredits();
    api
      .getAutomationSettings()
      .then((res) => {
        if (res.settings) {
          setAutoSettings(res.settings);
          setUpsellEnabled(res.settings.upsell_enabled ?? true);
          if (res.settings.upsell_offer_text) setUpsellOfferText(res.settings.upsell_offer_text);
          setAutoPaymentVerify(res.settings.auto_payment_verify_enabled ?? true);
          setAutoTrackingReply(res.settings.auto_tracking_reply_enabled ?? true);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveInstantRules = async (rulesToSave = instantRules, activeFlag = costSaverActive) => {
    try {
      setSavingInstantRules(true);
      const res = await api.updateInstantRules({
        rules: rulesToSave,
        cost_saver_active: activeFlag
      });
      if (res?.rules) {
        setInstantRules(res.rules);
      }
      setSavedInstantSuccess(true);
      setTimeout(() => setSavedInstantSuccess(false), 2500);
    } catch (e) {
      console.error('Failed to save instant rules:', e);
    } finally {
      setSavingInstantRules(false);
    }
  };

  const handleToggleRuleActive = (ruleId: string) => {
    const updated = instantRules.map((r) =>
      r.id === ruleId ? { ...r, is_active: !r.is_active } : r
    );
    setInstantRules(updated);
    handleSaveInstantRules(updated);
  };

  const handleDeleteRule = (ruleId: string) => {
    const updated = instantRules.filter((r) => r.id !== ruleId);
    setInstantRules(updated);
    handleSaveInstantRules(updated);
  };

  const handleAddCustomRule = () => {
    if (!newRuleKeyword.trim() || !newRuleReply.trim()) return;
    const keywords = newRuleKeyword
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    const newRule = {
      id: `rule_${Date.now()}`,
      name: newRuleName.trim() || keywords[0] || 'Custom Instant Rule',
      keywords,
      reply_text: newRuleReply.trim(),
      is_active: true,
      category: 'custom'
    };
    const updated = [...instantRules, newRule];
    setInstantRules(updated);
    setNewRuleKeyword('');
    setNewRuleReply('');
    setNewRuleName('');
    setShowAddRuleModal(false);
    handleSaveInstantRules(updated);
  };

  const handleSaveAutoBooster = async () => {
    try {
      setSavingAutoBooster(true);
      const res = await api.updateAutomationSettings({
        ...(autoSettings || {}),
        upsell_enabled: upsellEnabled,
        upsell_offer_text: upsellOfferText,
        auto_payment_verify_enabled: autoPaymentVerify,
        auto_tracking_reply_enabled: autoTrackingReply
      });
      if (res.settings) setAutoSettings(res.settings);
      setSavedAutoBooster(true);
      setTimeout(() => setSavedAutoBooster(false), 3000);
    } catch (e) {
      console.error('Failed to save automation booster:', e);
    } finally {
      setSavingAutoBooster(false);
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getLLMSettings();
      const rawLocalKey = (localStorage.getItem('oneagentbd_saved_api_key') || '').trim();
      if (rawLocalKey.startsWith('sk-proj-wJiInvQ')) {
        localStorage.removeItem('oneagentbd_saved_api_key');
      }
      const localBackupKey = rawLocalKey.startsWith('sk-proj-wJiInvQ') ? '' : rawLocalKey;
      const localBackupPrompt = (localStorage.getItem('oneagentbd_saved_system_prompt') || '').trim();

      setProvider(data.llm_provider || 'gemini');

      const incomingPrompt = data.system_prompt || '';
      if (
        !incomingPrompt.trim() ||
        incomingPrompt.includes('You are a warm, professional customer support AI agent for our business.') ||
        incomingPrompt.includes('Subscription Plans: Standard Plan 899 BDT/month') ||
        incomingPrompt.includes('Starter AI Plan (1,250 TK/month)')
      ) {
        if (localBackupPrompt && !localBackupPrompt.includes('Standard Plan 899 BDT/month') && !localBackupPrompt.includes('Starter AI Plan (1,250 TK/month)')) {
          setSystemPrompt(localBackupPrompt);
        } else {
          setSystemPrompt(DEFAULT_BUSINESS_DETAILS);
        }
      } else {
        setSystemPrompt(incomingPrompt);
        localStorage.setItem('oneagentbd_saved_system_prompt', incomingPrompt);
      }

      const rawIncomingKey = (data.llm_api_key || '').trim();
      const incomingKey = rawIncomingKey.startsWith('sk-proj-wJiInvQ') ? '' : rawIncomingKey;
      if (incomingKey) {
        setApiKey(incomingKey);
        setHasCustomKey(true);
        setMaskedKey(`••••••••${incomingKey.slice(-4)}`);
        localStorage.setItem('oneagentbd_saved_api_key', incomingKey);
      } else if (localBackupKey) {
        setApiKey(localBackupKey);
        setHasCustomKey(true);
        setMaskedKey(`••••••••${localBackupKey.slice(-4)}`);
        api
          .updateLLMSettings({
            llm_provider: data.llm_provider || 'gemini',
            llm_api_key: localBackupKey,
            system_prompt: localBackupPrompt || incomingPrompt || undefined
          })
          .catch(() => {});
      } else {
        setMaskedKey(data.masked_key);
        setHasCustomKey(data.has_custom_key);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncDeliveryToAI = async (deliveryText: string) => {
    const updated = systemPrompt
      ? `${systemPrompt}\n\n• ডেলিভারি রেট ও সময়:\n${deliveryText}`
      : `• ডেলিভারি রেট ও সময়:\n${deliveryText}`;
    setSystemPrompt(updated);
    localStorage.setItem('oneagentbd_saved_system_prompt', updated);
    try {
      await api.updateLLMSettings({
        llm_provider: provider,
        llm_api_key: apiKey.trim() || undefined,
        system_prompt: updated
      });
      onRefreshUser();
    } catch (e) {
      console.error('Failed to auto-sync delivery to AI prompt:', e);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const cleanKey = apiKey.trim();
      if (cleanKey) {
        localStorage.setItem('oneagentbd_saved_api_key', cleanKey);
      }
      if (systemPrompt.trim()) {
        localStorage.setItem('oneagentbd_saved_system_prompt', systemPrompt);
      }

      const res = await api.updateLLMSettings({
        llm_provider: provider,
        llm_api_key: cleanKey || undefined,
        system_prompt: systemPrompt
      });

      const savedKey = (res?.llm_api_key || cleanKey || '').trim();
      if (savedKey) {
        setApiKey(savedKey);
        setHasCustomKey(true);
        setMaskedKey(`••••••••${savedKey.slice(-4)}`);
        setKeySavedBanner(true);
        setTimeout(() => setKeySavedBanner(false), 3500);
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      onRefreshUser();
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleApplyPreset = async (presetText: string) => {
    if (selectedAgentId !== 'default') {
      setAgentKnowledgeBase(presetText);
      const currentAgent = agentsList.find((a) => a.id === selectedAgentId);
      if (currentAgent) {
        try {
          await api.updateAgent(currentAgent.id, {
            knowledge_base: presetText
          });
          setSavedAgentSuccess(true);
          setTimeout(() => setSavedAgentSuccess(false), 2500);
        } catch (e) {
          console.error('Auto-save preset to agent error:', e);
        }
      }
    } else {
      setSystemPrompt(presetText);
      localStorage.setItem('oneagentbd_saved_system_prompt', presetText);
      try {
        await api.updateLLMSettings({
          llm_provider: provider,
          llm_api_key: apiKey.trim() || undefined,
          system_prompt: presetText
        });
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      } catch (e) {
        console.error('Auto-save preset error:', e);
      }
    }
  };

  const presets = [
    {
      label: '👗 ফ্যাশন ও পোশাক',
      icon: ShoppingBag,
      prompt: `ব্যবসায়িক তথ্য ও প্রোডাক্ট বিবরণ:
• প্রতিষ্ঠানের নাম: Trendly Fashion
• প্রোডাক্ট ক্যাটাগরি: প্রিমিয়াম কোয়ালিটির মেন্স ও উইমেন্স পোশাক।
• প্রোডাক্ট তালিকা ও দাম:
  ১. সুতি সেমি-লং পাঞ্জাবি — ১,২০০ থেকে ২,৫০০ টাকা (সাইজ: ৩৮, ৪০, ৪২, ৪৪)
  ২. প্রিমিয়াম কটন টি-শার্ট — ৪৯০ থেকে ৭৫০ টাকা (সাইজ: M, L, XL)
  ৩. পোলো শার্ট — ৬৫০ থেকে ৮৫০ টাকা
  ৪. ডেনিম জিন্স প্যান্ট — ৯৯০ থেকে ১,৪৫০ টাকা
• ডেলিভারি চার্জ ও সময়:
  - ঢাকার ভেতরে: ৬০ টাকা (২৪–৪৮ ঘণ্টায় হোম ডেলিভারি)
  - ঢাকার বাইরে সারাদেশে: ১২০ টাকা (২–৩ দিনে হোম ডেলিভারি)
• পেমেন্ট সুবিধা: ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে মূল্য পরিশোধ), এবং বিকাশ ও নগদ পেমেন্ট।
• অর্ডার করার নিয়ম: পছন্দের পণ্যের নাম/সাইজ, আপনার নাম, সম্পূর্ণ ডেলিভারি ঠিকানা এবং সচল মোবাইল নাম্বার দিন।
• রিটার্ন ও এক্সচেঞ্জ: ডেলিভারিম্যানের সামনে চেক করে নিতে পারবেন এবং ৭ দিনের মধ্যে সাইজ পরিবর্তন সুবিধা রয়েছে।
• অফিস/শপ: আমাদের শপ মূলত অনলাইনভিত্তিক এবং সমগ্র বাংলাদেশে হোম ডেলিভারি দেওয়া হয়।`
    },
    {
      label: '📱 গ্যাজেট ও ইলেকট্রনিক্স',
      icon: Briefcase,
      prompt: `ব্যবসায়িক তথ্য ও প্রোডাক্ট বিবরণ:
• প্রতিষ্ঠানের নাম: Gadget Hub BD
• প্রোডাক্ট ক্যাটাগরি: অরিজিনাল মোবাইল গ্যাজেটস, স্মার্টওয়াচ ও এক্সেসরিজ।
• প্রোডাক্ট ও মূল্য তালিকা:
  ১. ওয়্যারলেস এয়ারবাডস — ১,২৫০ থেকে ২,৪৫০ টাকা (Official Warranty)
  ২. স্মার্টওয়াচ — ১,৮৫০ থেকে ৩,৯৫০ টাকা (AMOLED Display, Bluetooth Calling)
  ৩. ফাস্ট চার্জার ও পাওয়ার ব্যাংক — ৬৫০ থেকে ১,৯৫০ টাকা
• ডেলিভারি নিয়ম:
  - ঢাকার ভেতরে: ৬০ টাকা (২৪ ঘণ্টার মধ্যে এক্সপ্রেস ডেলিভারি)
  - ঢাকার বাইরে সারাদেশে: ১২০ টাকা (২–৩ দিনে ক্যাশ অন ডেলিভারি)
• ওয়ারেন্টি ও গ্যারান্টি: প্রতিটি গ্যাজেটে অফিশিয়াল রিপ্লেসমেন্ট ওয়ারেন্টি রয়েছে।
• পেমেন্ট: ক্যাশ অন ডেলিভারি, বিকাশ ও নগদ।
• অর্ডার করতে: পণ্যের নাম, ডেলিভারি ঠিকানা ও ফোন নাম্বার লিখে ইনবক্সে পাঠান।`
    },
    {
      label: '🍔 রেস্টুরেন্ট ও ফুড',
      icon: UtensilsCrossed,
      prompt: `ব্যবসায়িক তথ্য ও খাবার মেনু:
• রেস্টুরেন্টের নাম: Spice Kitchen Restaurant
• স্পেশাল মেনু ও দাম:
  ১. কাচ্চি বিরিয়ানি প্ল্যাটার — ৩২০ টাকা (বোরহানি ও সালাদসহ)
  ২. ক্রিস্পি ফ্রাইড চিকেন (৪ পিস) — ২৪০ টাকা
  ৩. বিফ চিজ বার্গার — ২২০ টাকা
  ৪. সেট মেনু (ফ্রাইড রাইস + চিকেন ফ্রাই + ভেজিটেবল) — ১৮০ টাকা
• ডেলিভারি এরিয়া ও চার্জ: ধানমন্ডি, মোহাম্মদপুর, লালমাটিয়া ও মিরপুর এলাকায় মাত্র ৩০–৪৫ মিনিটে খাবার পৌঁছে দেওয়া হয়। ডেলিভারি চার্জ ৪০ টাকা।
• পেমেন্ট মাধ্যম: ক্যাশ অন ডেলিভারি এবং বিকাশ পেমেন্ট।
• অর্ডার করার নিয়ম: খাবারের আইটেম, পরিমাণ, সম্পূর্ণ ডেলিভারি ঠিকানা ও ফোন নাম্বার দিন।`
    },
    {
      label: '📦 জেনারেল ই-কমার্স',
      icon: ShoppingBag,
      prompt: `ব্যবসায়িক তথ্য ও পলিসি:
• প্রতিষ্ঠানের নাম: Trendly BD
• সেবা ও পণ্য: দৈনন্দিন প্রয়োজনীয় সেরা কোয়ালিটির লাইফস্টাইল পণ্য ও কসমেটিকস।
• ডেলিভারি চার্জ: ঢাকার ভেতরে ৬০ টাকা, ঢাকার বাইরে ১২০ টাকা।
• পেমেন্ট পদ্ধতি: ক্যাশ অন ডেলিভারি (হোম ডেলিভারি) এবং বিকাশ/নগদ পেমেন্ট।
• অফার: যেকোনো ২টি প্রোডাক্ট একসাথে অর্ডার করলে ফ্রি ডেলিভারি!
• অর্ডার কনফার্ম করতে: আপনার নাম, সম্পূর্ণ ঠিকানা ও মোবাইল নাম্বারটি চ্যাটে লিখে পাঠান।`
    },
    {
      label: '💼 সার্ভিস ও এজেন্সি',
      icon: Briefcase,
      prompt: `ব্যবসায়িক তথ্য ও সার্ভিস বিবরণ:
• প্রতিষ্ঠানের নাম: NexTech Digital Solutions
• সার্ভিস ও ফি:
  ১. ফেসবুক পেজ ও হোয়াটসঅ্যাপ AI চ্যাটবট অটোমেশন — ১,২৫০ টাকা/মাস থেকে
  ২. কাস্টম ওয়েবসাইট ও ই-কমার্স ডেভেলপমেন্ট — ১৫,০০০ টাকা থেকে
  ৩. ফেসবুক ও গুগল অ্যাডস ক্যাম্পেইন ম্যানেজমেন্ট — ৫,০০০ টাকা/মাস
• পেমেন্ট মাধ্যম: ব্যাংক ট্রান্সফার, বিকাশ ও নগদ মার্চেন্ট।
• ফ্রি কনসাল্টেশন: আপনার প্রজেক্ট বা বিজনেস বিস্তারিত জানিয়ে নাম ও মোবাইল নাম্বার দিন, আমাদের টিম আপনার সাথে যোগাযোগ করবে।`
    }
  ];

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-neutral-500">
        লোডিং সেটিংস...
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200 max-w-4xl">
      {/* Title & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>AI নলেজ বেস ও সেটিংস</span>
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            আপনার ব্যবসার বিবরণ সহজে লিখে রাখুন—এআই নিজে থেকেই ChatGPT ও Gemini-র মতো কাস্টমারদের উত্তর দেবে।
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 sm:flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 w-full sm:w-auto gap-1">
          <button
            type="button"
            onClick={() => setActiveSection('credits')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSection === 'credits'
                ? 'bg-white dark:bg-neutral-900 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>AI Credits & Quota</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('instant')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSection === 'instant'
                ? 'bg-white dark:bg-neutral-900 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Cost-Saver & Instant FAQ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('ai')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSection === 'ai'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-[#7F22FE] shrink-0" />
            <span>AI Knowledge Base</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('delivery')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSection === 'delivery'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-[#7F22FE] shrink-0" />
            <span>Delivery & Courier</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: AI CREDITS & USAGE */}
      {activeSection === 'credits' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Top Quota Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
                <span className="text-xs font-bold">WhatsApp Monthly Quota</span>
                <Zap className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-neutral-900 dark:text-white">
                {(creditsData?.whatsapp?.total_quota ?? 2500).toLocaleString()}
                <span className="text-xs font-normal text-neutral-400 ml-1">replies</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Active Plan: <strong className="text-purple-600">{creditsData?.plan?.name || 'Advance AI Plan'}</strong>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
                <span className="text-xs font-bold">WhatsApp Replies Used</span>
                <MessageSquare className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {(creditsData?.whatsapp?.used ?? 412).toLocaleString()}
                <span className="text-xs font-normal text-neutral-400 ml-1">used</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 mt-2 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.round(((creditsData?.whatsapp?.used ?? 412) / (creditsData?.whatsapp?.total_quota ?? 2500)) * 100))}%`
                  }}
                />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
                <span className="text-xs font-bold">Available WhatsApp Balance</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {(creditsData?.whatsapp?.remaining ?? 2088).toLocaleString()}
                <span className="text-xs font-normal text-neutral-400 ml-1">remaining</span>
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                100% Ready for customer chats
              </p>
            </div>
          </div>

          {/* Managed Gateway & Free Channels Policy Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/5 via-violet-500/10 to-indigo-500/5 border border-purple-200/80 dark:border-purple-800/40 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-neutral-900 dark:text-white">
                  Zero Foreign Card Hassle (100% Platform Managed Gateway)
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5 leading-relaxed">
                  আপনাকে মেটাকে কোনো ডলার বা ডুয়েল কারেন্সি ক্রেডিট কার্ড দিতে হয় না। ওয়ান এজেন্ট বিডি কেন্দ্রীয় মেটা ক্লাউড এপিআই গেটওয়ের মাধ্যমে সকল হোয়াটসঅ্যাপ মেসেজের খরচ বহন করে। আপনি কেবল বিকাশে বা নগদে লোকাল পেমেন্ট করবেন।
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-purple-200/60 dark:border-purple-800/30">
              <div className="p-3 rounded-xl bg-white/80 dark:bg-neutral-900/80 border border-purple-100 dark:border-purple-900/40">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600">Facebook Messenger</span>
                <div className="text-base font-black text-neutral-900 dark:text-white mt-0.5">100% Unlimited</div>
                <p className="text-[10px] text-neutral-400">মেটা থেকে মেসেঞ্জারে কোনো ফি কাটা হয় না, সম্পূর্ণ ফ্রি।</p>
              </div>

              <div className="p-3 rounded-xl bg-white/80 dark:bg-neutral-900/80 border border-purple-100 dark:border-purple-900/40">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600">Instagram Direct DM</span>
                <div className="text-base font-black text-neutral-900 dark:text-white mt-0.5">100% Unlimited</div>
                <p className="text-[10px] text-neutral-400">ইনস্টাগ্রাম মেসেজও সম্পূর্ণ আনলিমিটেড ও ফ্রি।</p>
              </div>

              <div className="p-3 rounded-xl bg-white/80 dark:bg-neutral-900/80 border border-purple-100 dark:border-purple-900/40">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Cost-Saver Instant Rules</span>
                <div className="text-base font-black text-emerald-600 mt-0.5">
                  {rulesTriggeredCount.toLocaleString()} Saved
                </div>
                <p className="text-[10px] text-neutral-400">ডেলিভারি ও পেমেন্ট রুল ইনস্ট্যান্ট ট্রিপল-সেভ করে।</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: INSTANT FAQ & COST-SAVER RULES */}
      {activeSection === 'instant' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Smart AI Token & Quota Saver</span>
              </span>
              <h2 className="text-base font-black text-neutral-900 dark:text-white mt-0.5">
                কাস্টম ডেলিভারি ও ইনস্ট্যান্ট রিপ্লাই রুলস
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-xl leading-relaxed">
                কাস্টমার যখন &ldquo;ডেলিভারি চার্জ কত?&rdquo;, &ldquo;ডেলিভারি কত দিন লাগবে?&rdquo;, বা &ldquo;বিকাশ নম্বর দিন&rdquo; জাতীয় প্রশ্ন করবে—এআই টোকেন খরচ না করে এই রুল থেকে চোখের পলকে নির্ভুল রিপ্লাই চলে যাবে। এতে আপনার হোয়াটসঅ্যাপ কোটা এবং এআই কস্ট ১০০% সুরক্ষিত থাকবে!
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const nextActive = !costSaverActive;
                  setCostSaverActive(nextActive);
                  handleSaveInstantRules(instantRules, nextActive);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  costSaverActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${costSaverActive ? 'bg-white animate-pulse' : 'bg-neutral-400'}`} />
                <span>{costSaverActive ? 'Cost Saver Active' : 'Cost Saver Paused'}</span>
              </button>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                ⚡ {rulesTriggeredCount} বার ইনস্ট্যান্ট রিপ্লাই হয়েছে
              </span>
            </div>
          </div>

          {/* Quick Delivery Setup Box */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-neutral-900 dark:text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-purple-600" />
                  <span>কুইক ডেলিভারি চার্জ সেটিংস (সারা বাংলাদেশ)</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  এখানে চার্জ পরিবর্তন করলে ইনস্ট্যান্ট রিপ্লাই ও এআই স্বয়ংক্রিয়ভাবে নতুন রেট বলবে।
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-1">
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">ঢাকা সিটির ভিতরে</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-400">BDT</span>
                  <input
                    type="number"
                    defaultValue="80"
                    id="inside-dhaka-charge-input"
                    className="w-full px-3 py-1.5 text-sm font-black rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                  />
                </div>
                <span className="text-[10px] text-neutral-400 block">সময়: ২৪–৪৮ ঘণ্টা</span>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-1">
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">ঢাকার বাইরে (সারা বাংলাদেশ)</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-400">BDT</span>
                  <input
                    type="number"
                    defaultValue="150"
                    id="outside-dhaka-charge-input"
                    className="w-full px-3 py-1.5 text-sm font-black rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                  />
                </div>
                <span className="text-[10px] text-neutral-400 block">সময়: ২–৩ কার্যদিবস</span>
              </div>
            </div>
          </div>

          {/* Instant Rules List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400">
                সক্রিয় ইনস্ট্যান্ট রিপ্লাই রুলস ({instantRules.length})
              </h3>
              <button
                type="button"
                onClick={() => setShowAddRuleModal(true)}
                className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ নতুন রুল যোগ করুন</span>
              </button>
            </div>

            {instantRules.map((rule) => (
              <div
                key={rule.id}
                className={`p-4 rounded-2xl border transition-all ${
                  rule.is_active
                    ? 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-xs'
                    : 'bg-neutral-50/60 dark:bg-neutral-900/40 border-neutral-200/50 dark:border-neutral-800/50 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-neutral-100 dark:border-neutral-800/60">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-neutral-900 dark:text-white">
                      {rule.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      {rule.category || 'custom'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleRuleActive(rule.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                        rule.is_active
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                          : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                      }`}
                    >
                      {rule.is_active ? 'Active' : 'Disabled'}
                    </button>
                    {rule.category === 'custom' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg cursor-pointer"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[11px] font-semibold text-neutral-400 block mb-1">
                      ট্রিগার কি-ওয়ার্ডসমূহ (কাস্টমার এই শব্দগুলো লিখলে সক্রিয় হবে):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {rule.keywords?.map((kw: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono text-[11px]"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-neutral-400 block mb-1">
                      ইনস্ট্যান্ট অটো-রিপ্লাই মেসেজ:
                    </span>
                    <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200 font-medium leading-relaxed">
                      {rule.reply_text}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Rule Modal */}
          {showAddRuleModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-neutral-900 dark:text-white">
                    নতুন ইনস্ট্যান্ট রিপ্লাই রুল যোগ করুন
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddRuleModal(false)}
                    className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      রুলের নাম / বিষয়
                    </label>
                    <input
                      type="text"
                      value={newRuleName}
                      onChange={(e) => setNewRuleName(e.target.value)}
                      placeholder="e.g. ফ্যাব্রিক বা সাইজ চার্ট রুল"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      ট্রিগার কি-ওয়ার্ডসমূহ (কমা দিয়ে লিখুন)
                    </label>
                    <input
                      type="text"
                      value={newRuleKeyword}
                      onChange={(e) => setNewRuleKeyword(e.target.value)}
                      placeholder="e.g. size, সাইজ, কত সাইজ, চার্ট"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      ইনস্ট্যান্ট রিপ্লাই টেক্সট
                    </label>
                    <textarea
                      rows={3}
                      value={newRuleReply}
                      onChange={(e) => setNewRuleReply(e.target.value)}
                      placeholder="কাস্টমারকে তাৎক্ষণিক যে উত্তর পাঠানো হবে..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddRuleModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCustomRule}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                  >
                    রুল সংরক্ষণ করুন
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: DELIVERY & COURIER */}
      {activeSection === 'delivery' && (
        <DeliverySettingsSection onSyncDeliveryToAI={handleSyncDeliveryToAI} />
      )}

      {/* SECTION 4: AI KNOWLEDGE BASE */}
      {activeSection === 'ai' && (
        <>
          {/* MULTI-BUSINESS AGENT TRAINING ARCHITECTURE */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
            {/* Top Selector Bar: Select which business / agent to train */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED]">
                    <Bot className="w-4 h-4" />
                  </span>
                  <h2 className="text-sm sm:text-base font-extrabold text-neutral-900 dark:text-white">
                    Select Business AI Agent to Train
                  </h2>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Select which business agent you want to train. Each business maintains its own isolated persona, knowledge base, delivery rates, and reply rules.
                </p>
              </div>

              {agentsList.length > 0 && (
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={selectedAgentId}
                    onChange={(e) => handleSelectAgent(e.target.value)}
                    className="px-3 py-2 text-xs font-bold rounded-xl border border-purple-200 dark:border-purple-500/30 bg-purple-50/50 dark:bg-[#1A123B] text-slate-900 dark:text-white focus:outline-none focus:border-[#7C3AED] cursor-pointer"
                  >
                    {agentsList.map((ag) => (
                      <option key={ag.id} value={ag.id}>
                        🤖 {ag.name} ({ag.business_name})
                      </option>
                    ))}
                    <option value="default">🌐 Default Global Prompt (Fallback)</option>
                  </select>
                </div>
              )}
            </div>

            {/* When a specific business agent is selected */}
            {selectedAgentId !== 'default' && (() => {
              const currentAgent = agentsList.find((a) => a.id === selectedAgentId);
              if (!currentAgent) return null;

              const assignedChs = channelsList.filter(
                (c) =>
                  (currentAgent.assigned_channels || []).includes(c.id) ||
                  c.agent_id === currentAgent.id
              );

              return (
                <form onSubmit={handleSaveAgentTraining} className="space-y-5">
                  {/* Active Business & Assigned Channels Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50/80 via-white to-indigo-50/60 dark:from-[#1A123B] dark:via-[#140D30] dark:to-[#18103A] border border-purple-200/80 dark:border-purple-500/25 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={currentAgent.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80'}
                          alt={currentAgent.name}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-[#7C3AED] shadow-xs shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                              {currentAgent.name}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                              Active Agent
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            <Store className="w-3.5 h-3.5 text-[#7C3AED]" />
                            <span className="font-semibold">{currentAgent.business_name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/40">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>100% Channel Isolated Auto-Reply</span>
                      </div>
                    </div>

                    {/* Assigned Channels Chips */}
                    <div className="pt-2 border-t border-purple-100 dark:border-purple-500/15 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-[#7C3AED]" />
                        <span>Connected Channels ({assignedChs.length}):</span>
                      </span>

                      {assignedChs.length === 0 ? (
                        <span className="text-xs text-amber-600 dark:text-amber-400 italic">
                          No channels assigned yet. Head to "AI Business Agents" to assign WhatsApp or Facebook Pages.
                        </span>
                      ) : (
                        assignedChs.map((c) => (
                          <span
                            key={c.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-white dark:bg-[#201548] border border-slate-200/80 dark:border-purple-500/25 text-slate-800 dark:text-slate-200 shadow-2xs"
                          >
                            {c.platform === 'whatsapp' ? (
                              <WhatsAppLogo className="w-3.5 h-3.5 shrink-0" />
                            ) : c.platform === 'messenger' ? (
                              <FacebookLogo className="w-3.5 h-3.5 shrink-0" />
                            ) : (
                              <InstagramLogo className="w-3.5 h-3.5 shrink-0" />
                            )}
                            <span>{c.name}</span>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Tone, Language & Delivery Charges Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                        Conversation Tone
                      </label>
                      <select
                        value={agentTone}
                        onChange={(e) => setAgentTone(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      >
                        <option value="sales_closer">🔥 Sales Closer (COD Order Focus)</option>
                        <option value="friendly">😊 Warm &amp; Friendly</option>
                        <option value="urgent">⚡ Fast &amp; Urgent</option>
                        <option value="professional">💼 Professional</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                        Response Language
                      </label>
                      <select
                        value={agentLanguage}
                        onChange={(e) => setAgentLanguage(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      >
                        <option value="bangla">বাংলা (Natural Bengali)</option>
                        <option value="english">English (Corporate)</option>
                        <option value="banglish">Banglish (Dynamic)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                        Inside Dhaka Delivery (৳)
                      </label>
                      <input
                        type="number"
                        value={agentDhakaDelivery}
                        onChange={(e) => setAgentDhakaDelivery(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                        Outside Dhaka Delivery (৳)
                      </label>
                      <input
                        type="number"
                        value={agentOutsideDelivery}
                        onChange={(e) => setAgentOutsideDelivery(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Quick Business Templates Chips */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                      দ্রুত ব্যবসার বিবরণী টেমপ্লেট নির্বাচন করুন (Quick Templates):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {presets.map((p, idx) => {
                        const Icon = p.icon;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleApplyPreset(p.prompt)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-neutral-100 hover:bg-[#7F22FE]/10 hover:text-[#7F22FE] hover:border-[#7F22FE]/30 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-transparent transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Icon className="w-3.5 h-3.5 text-[#7F22FE]" />
                            <span>{p.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Business Knowledge Base Textarea */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        {currentAgent.business_name} - Business Knowledge Base (পণ্য ও সার্ভিস তথ্য)
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {agentKnowledgeBase.length} characters
                      </span>
                    </div>
                    <textarea
                      rows={8}
                      required
                      value={agentKnowledgeBase}
                      onChange={(e) => setAgentKnowledgeBase(e.target.value)}
                      placeholder="আপনার এই ব্যবসার প্রোডাক্ট তালিকা, দাম, ওয়ারেন্টি, ডেলিভারি নিয়ম ও পেমেন্ট নম্বর এখানে লিখে দিন..."
                      className="w-full p-4 text-xs sm:text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/60 text-neutral-900 dark:text-white leading-relaxed focus:outline-none focus:border-[#7C3AED] font-mono"
                    />
                  </div>

                  {/* Custom System / Closing Prompt */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5">
                      Custom AI Closing &amp; Order Capture Prompt (অর্ডার কনফার্ম করার নিয়ম)
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={agentPrompt}
                      onChange={(e) => setAgentPrompt(e.target.value)}
                      placeholder="কাস্টমারের সাথে কীভাবে কথা বলে ডেলিভারি ঠিকানা ও ফোন নাম্বার সংগ্রহ করে অর্ডার কনফার্ম করতে হবে..."
                      className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/60 text-neutral-900 dark:text-white leading-relaxed focus:outline-none focus:border-[#7C3AED] font-mono"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Changes apply instantly to all customer conversations on {currentAgent.business_name}'s channels.
                    </div>

                    <button
                      type="submit"
                      disabled={savingAgent}
                      className="px-6 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {savingAgent ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Saving Training...</span>
                        </>
                      ) : savedAgentSuccess ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Training Saved &amp; Isolated!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Save Training for {currentAgent.name}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              );
            })()}

            {/* When Default Global Prompt is selected */}
            {selectedAgentId === 'default' && (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
                  This default prompt serves as the fallback knowledge base for any unassigned incoming channel messages.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Default Business Details &amp; Prompt:
                  </label>
                  <textarea
                    id="settings-system-prompt"
                    rows={10}
                    required
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className="w-full p-4 text-xs sm:text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/60 text-neutral-900 dark:text-white leading-relaxed font-mono"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {saving ? 'Saving...' : savedSuccess ? 'Saved!' : 'Save Default Prompt'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Smart Sales Booster & Business Automation Controls */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#7F22FE]" />
                  <span>Smart Sales Booster & Auto Tracking AI</span>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  অর্ডার বাড়ানোর কম্বো অফার, বিকাশ/নগদ অটো ভেরিফাই ও ২৪/৭ লাইভ পার্সেল ট্র্যাকিং
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveAutoBooster}
                disabled={savingAutoBooster}
                className="px-4 py-2 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                {savingAutoBooster ? (
                  'Saving...'
                ) : savedAutoBooster ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Booster Saved!</span>
                  </>
                ) : (
                  'Save Booster Settings'
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={upsellEnabled}
                  onChange={(e) => setUpsellEnabled(e.target.checked)}
                  className="mt-0.5 accent-[#7F22FE]"
                />
                <div>
                  <span className="font-bold text-neutral-900 dark:text-white block">
                    Smart Upselling & Combo
                  </span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    কাস্টমার ১টি প্রোডাক্টের কথা বললে স্বয়ংক্রিয়ভাবে কম্বো অফার অফার করবে
                  </span>
                </div>
              </label>

              <label className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoPaymentVerify}
                  onChange={(e) => setAutoPaymentVerify(e.target.checked)}
                  className="mt-0.5 accent-[#7F22FE]"
                />
                <div>
                  <span className="font-bold text-neutral-900 dark:text-white block">
                    bKash/Nagad Auto-Verify
                  </span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    চ্যাটে TrxID বা পেমেন্ট স্ক্রিনশট পেলেই স্বয়ংক্রিয়ভাবে অর্ডার Paid করবে
                  </span>
                </div>
              </label>

              <label className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoTrackingReply}
                  onChange={(e) => setAutoTrackingReply(e.target.checked)}
                  className="mt-0.5 accent-[#7F22FE]"
                />
                <div>
                  <span className="font-bold text-neutral-900 dark:text-white block">
                    24/7 Parcel Tracking Bot
                  </span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    কাস্টমার পার্সেল কোথায় জানতে চাইলে কুরিয়ার ও অর্ডারের লাইভ স্ট্যাটাস জানাবে
                  </span>
                </div>
              </label>
            </div>

            {upsellEnabled && (
              <div className="text-xs">
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Smart Upsell / Combo Offer Message:
                </label>
                <input
                  type="text"
                  value={upsellOfferText}
                  onChange={(e) => setUpsellOfferText(e.target.value)}
                  placeholder="যেমন: যেকোনো ২টি প্রোডাক্ট একসাথে নিলে ডেলিভারি ফ্রি!"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Clean Collapsible Advanced Settings (AI Model & Custom API Key - ঐচ্ছিক) */}
          <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#7F22FE]" />
                <span className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white">
                  Advanced: Custom AI Model & API Key (ঐচ্ছিক সেটিংস)
                </span>
                {(hasCustomKey || apiKey.trim().length > 8) && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                    Custom Key Active
                  </span>
                )}
              </div>
              {showAdvanced ? (
                <ChevronUp className="w-4 h-4 text-neutral-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              )}
            </button>

            {showAdvanced && (
              <div className="p-5 border-t border-neutral-200 dark:border-neutral-800 space-y-4 bg-neutral-50/40 dark:bg-neutral-900/40">
                <p className="text-xs text-neutral-500">
                  বাই ডিফল্ট আমাদের বিল্ট-ইন হাই-স্পিড মডেল স্বয়ংক্রিয়ভাবে চালু থাকে। আপনি চাইলে নিজের ব্যক্তিগত Gemini, OpenAI বা Anthropic API কি ব্যবহার করতে পারেন।
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setProvider('gemini')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      provider === 'gemini'
                        ? 'border-[#7F22FE] bg-[#7F22FE]/5 ring-1 ring-[#7F22FE]/20'
                        : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="font-bold text-xs sm:text-sm block text-neutral-900 dark:text-white">
                      Google Gemini
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      gemini-3.8-flash (Recommended)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProvider('openai')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      provider === 'openai'
                        ? 'border-[#7F22FE] bg-[#7F22FE]/5 ring-1 ring-[#7F22FE]/20'
                        : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="font-bold text-xs sm:text-sm block text-neutral-900 dark:text-white">
                      OpenAI
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      GPT-4o / GPT-4o-mini
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProvider('anthropic')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      provider === 'anthropic'
                        ? 'border-[#7F22FE] bg-[#7F22FE]/5 ring-1 ring-[#7F22FE]/20'
                        : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="font-bold text-xs sm:text-sm block text-neutral-900 dark:text-white">
                      Anthropic
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Claude 3.5 Sonnet
                    </span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Custom {provider.toUpperCase()} API Key:
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <input
                        id="settings-llm-api-key"
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Paste your Gemini (AIza...) or OpenAI (sk-...) API key here"
                        className="w-full text-xs pl-3 pr-9 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7F22FE]"
                      />
                      {apiKey && (
                        <button
                          type="button"
                          onClick={() => setShowApiKey((prev) => !prev)}
                          title={showApiKey ? 'Hide API Key' : 'Show API Key'}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSave()}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                    >
                      {saving ? (
                        'Saving...'
                      ) : keySavedBanner ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Key Saved!</span>
                        </>
                      ) : (
                        <>
                          <Key className="w-3.5 h-3.5" />
                          <span>Save API Key</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
