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
  ChevronUp
} from 'lucide-react';
import { api } from '../../api';
import { AutomationSettings } from '../../types';
import { DeliverySettingsSection } from './DeliverySettingsSection';

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
  const [activeSection, setActiveSection] = useState<'ai' | 'delivery'>('ai');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Test simulation
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [testing, setTesting] = useState(false);

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

  useEffect(() => {
    loadSettings();
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
  };

  const runLiveTestQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    try {
      setTesting(true);
      setTestOutput('');

      const activePromptToUse = systemPrompt.trim() || DEFAULT_BUSINESS_DETAILS;

      await api
        .updateLLMSettings({
          llm_provider: provider,
          llm_api_key: apiKey.trim() || undefined,
          system_prompt: activePromptToUse
        })
        .catch(() => {});

      const res = await api.simulateInboundMessage({
        platform: 'messenger',
        customerName: 'Test Customer',
        messageText: queryText.trim(),
        overrideSystemPrompt: activePromptToUse
      });

      if (res.aiReplyMessage?.message_text) {
        setTestOutput(res.aiReplyMessage.message_text);
      } else if (res.reason) {
        setTestOutput(`System Note: ${res.reason}`);
      } else {
        setTestOutput('Message processed successfully.');
      }
    } catch (err: any) {
      setTestOutput(`Error: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  const handleTestPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    await runLiveTestQuery(testInput);
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

  const sampleTestQueries = [
    'কেমন আছেন?',
    'আপনাদের ডেলিভারি চার্জ কত?',
    'আপনাদের ট্রাস্ট করব কীভাবে?',
    'কী কী প্রোডাক্ট আছে আপনাদের?',
    'অর্ডার করতে কী কী লাগবে?'
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
        <div className="grid grid-cols-2 sm:flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 w-full sm:w-auto">
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
            <span>Business Knowledge Base</span>
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

      {activeSection === 'delivery' ? (
        <DeliverySettingsSection onSyncDeliveryToAI={handleSyncDeliveryToAI} />
      ) : (
        <>
          {/* Main Clean Card: Business Details & AI Training */}
          <form onSubmit={handleSave} className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800/60">
              <div>
                <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#7F22FE]" />
                  <span>Business Knowledge Base (ব্যবসার বিবরণ)</span>
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                  আপনার ব্যবসা, প্রোডাক্ট, দাম, ডেলিভারি নিয়ম বা অফার এখানে সহজ ভাষায় লিখে দিন। এআই নিজে থেকেই এটি শিখে সাবলীলভাবে উত্তর দেবে।
                </p>
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>AI Trained & Ready</span>
              </div>
            </div>

            {/* Quick Template Chips */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                দ্রুত টেমপ্লেট বেছে নিন (Quick Business Templates):
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

            {/* Clean, Spacious Textarea */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                আপনার ব্যবসার তথ্য (এখানে লিখুন বা পেস্ট করুন):
              </label>
              <textarea
                id="settings-system-prompt"
                rows={11}
                required
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="যেমন:
• আমাদের পেজের নাম: Trendly
• আমরা কী বিক্রি করি: প্রিমিয়াম কোয়ালিটির টি-শার্ট ও পাঞ্জাবি
• দাম: টি-শার্ট ৪৯০-৭৫০ টাকা, পাঞ্জাবি ১,২০০-২,৫০০ টাকা
• ডেলিভারি চার্জ: ঢাকার ভেতরে ৬০ টাকা (২৪-৪৮ ঘণ্টা), ঢাকার বাইরে ১২০ টাকা (২-৩ দিন)
• পেমেন্ট: ক্যাশ অন ডেলিভারি, বিকাশ ও নগদ
• অর্ডার করার নিয়ম: পণ্যের নাম/সাইজ, সম্পূর্ণ ঠিকানা ও মোবাইল নাম্বার দিন"
                className="w-full p-4 text-xs sm:text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/60 text-neutral-900 dark:text-white leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-[#7F22FE] focus:bg-white dark:focus:bg-neutral-800 transition-all font-mono"
              />
            </div>

            {/* Save Button Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <span className="text-xs text-neutral-400">
                {systemPrompt.length} characters • Powered by ChatGPT & Gemini Intelligence
              </span>
              <button
                id="save-ai-settings-btn"
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white font-bold text-xs shadow-md shadow-[#7F22FE]/20 transition-all flex items-center justify-center gap-2 cursor-pointer self-stretch sm:self-auto"
              >
                {saving ? (
                  'Saving Details...'
                ) : savedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Business Details Saved!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Save Business Details (সেভ করুন)</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Interactive Prompt Simulator Box */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#7F22FE]" />
                  <span>Test Your AI Agent Live (লাইভ টেস্ট)</span>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  নিচে যেকোনো প্রশ্ন টাইপ করে অথবা নিচের কুইক বাটনে ক্লিক করে টেস্ট করুন আপনার এআই কীভাবে উত্তর দেয়।
                </p>
              </div>
            </div>

            {/* Quick Sample Test Chips */}
            <div className="flex flex-wrap gap-1.5">
              {sampleTestQueries.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTestInput(q);
                    runLiveTestQuery(q);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-[#7F22FE]/10 hover:text-[#7F22FE] dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3 h-3 text-[#7F22FE]" />
                  <span>{q}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleTestPrompt} className="flex gap-2">
              <input
                id="test-prompt-input"
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="এখানে একটি প্রশ্ন লিখুন (যেমন: ডেলিভারি চার্জ কত? বা আপনাদের ট্রাস্ট করব কীভাবে?)"
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7F22FE]"
              />
              <button
                id="test-prompt-send-btn"
                type="submit"
                disabled={testing || !testInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] disabled:opacity-50 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testing ? 'Thinking...' : 'Test Reply'}</span>
              </button>
            </form>

            {testing && (
              <div className="p-3.5 rounded-xl bg-[#7F22FE]/5 border border-[#7F22FE]/20 text-xs text-neutral-700 dark:text-neutral-200 flex items-center justify-between shadow-xs animate-in fade-in duration-150">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7F22FE] animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7F22FE] animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7F22FE] animate-bounce" />
                  </span>
                  <span className="font-semibold text-[#7F22FE] dark:text-purple-400">
                    AI Agent is typing naturally...
                  </span>
                </div>
              </div>
            )}

            {!testing && testOutput && (
              <div className="p-4 rounded-xl bg-[#7F22FE]/5 border border-[#7F22FE]/20 text-xs sm:text-sm text-neutral-800 dark:text-neutral-100 leading-relaxed shadow-xs">
                <span className="font-bold text-[#7F22FE] dark:text-purple-400 flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Agent Reply:</span>
                </span>
                <p className="whitespace-pre-wrap font-medium">{testOutput}</p>
              </div>
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
