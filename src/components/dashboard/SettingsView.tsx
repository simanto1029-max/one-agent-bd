import React, { useState, useEffect } from 'react';
import {
  Bot,
  Key,
  Sparkles,
  Check,
  Send,
  Wand2,
  ShoppingBag,
  Briefcase,
  Stethoscope,
  UtensilsCrossed,
  Info,
  Truck,
  MessageSquare,
  Eye,
  EyeOff
} from 'lucide-react';
import { api } from '../../api';
import { AutomationSettings } from '../../types';
import { DeliverySettingsSection } from './DeliverySettingsSection';

interface SettingsViewProps {
  onRefreshUser: () => void;
}

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

  // Easy Knowledge Base Builder state
  const [showBuilder, setShowBuilder] = useState(false);
  const [kbBusinessName, setKbBusinessName] = useState('One Agent BD');
  const [kbServices, setKbServices] = useState(
    'Facebook, Instagram & WhatsApp 24/7 AI Automation, Voice Note AI, E-commerce Chatbot, Website Store Integration & Order Management. Plans: Starter AI Plan (1,250 TK/month) and Pro Business Plan (1,950 TK/month) with a 2-day free trial.'
  );
  const [kbDelivery, setKbDelivery] = useState(
    'Digital services activate immediately. Physical parcel delivery: Inside Dhaka 60 TK (24-48 hours), Outside Dhaka 120 TK (2-3 days). Cash on Delivery (COD) available.'
  );
  const [kbPayment, setKbPayment] = useState(
    'bKash, Nagad, Rocket & Upay via pay.oneagentbd.online (01711-223344) and Cash on Delivery (COD).'
  );
  const [kbOrderRule, setKbOrderRule] = useState(
    'To confirm an order, please share your full name, complete delivery address, 11-digit mobile number, and selected product or plan.'
  );
  const [kbHelpline, setKbHelpline] = useState(
    'Daily support from 9:00 AM to 11:00 PM. Helpline: 01811-998877.'
  );

  // Test simulation
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [testing, setTesting] = useState(false);

  // Smart Sales Booster & Automation Settings
  const [autoSettings, setAutoSettings] = useState<AutomationSettings | null>(null);
  const [upsellEnabled, setUpsellEnabled] = useState(true);
  const [upsellOfferText, setUpsellOfferText] = useState(
    '২টি প্রোডাক্ট একসাথে অর্ডার করলে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি অথবা ১০০ টাকা স্পেশাল ডিসকাউন্ট!'
  );
  const [autoPaymentVerify, setAutoPaymentVerify] = useState(true);
  const [autoTrackingReply, setAutoTrackingReply] = useState(true);
  const [savingAutoBooster, setSavingAutoBooster] = useState(false);
  const [savedAutoBooster, setSavedAutoBooster] = useState(false);

  const buildKnowledgeBasePromptText = () => {
    return `You are the official Customer Service & Sales AI Assistant for "${kbBusinessName || 'Our Business'}".

Business Knowledge Base:
1. Products & Services:
   ${kbServices}

2. Delivery & Fees:
   ${kbDelivery}

3. Payment Methods & Discounts:
   ${kbPayment}

4. Order Process:
   ${kbOrderRule}

5. Helpline & Support Hours:
   ${kbHelpline}

SMART REASONING & SHORT REPLY RULES:
- সবসময় সংক্ষিপ্ত ও টু-দ্য-পয়েন্ট উত্তর দেবেন (সর্বোচ্চ ২ থেকে ৩ বাক্যে / ২-৪ লাইনের মধ্যে)। কখনোই বিশাল বড় প্যারাগ্রাফ বা অপ্রয়োজনীয় লম্বা লিস্ট পাঠিয়ে কাস্টমারকে বিরক্ত করবেন না।
- কাস্টমার ঘুরিয়ে বা নতুন যেভাবেই প্রশ্ন করুক, বিজনেস ডিটেইলস বুঝে সরাসরি শুধুমাত্র সেই প্রশ্নটুকুরই আন্তরিক ও স্বাভাবিক বাংলায় উত্তর দেবেন।`;
  };

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
        incomingPrompt.includes('Subscription Plans: Standard Plan 899 BDT/month')
      ) {
        if (localBackupPrompt && !localBackupPrompt.includes('Standard Plan 899 BDT/month')) {
          setSystemPrompt(localBackupPrompt);
        } else {
          const defaultBuilt = buildKnowledgeBasePromptText();
          setSystemPrompt(defaultBuilt);
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
        // Auto-sync local backup key to backend
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
    setKbDelivery(deliveryText);
    const updated = systemPrompt
      ? `${systemPrompt}\n\n[DELIVERY RATES]:\n${deliveryText}`
      : `[DELIVERY RATES]:\n${deliveryText}`;
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

  const handleGenerateKnowledgeBase = async () => {
    const generated = buildKnowledgeBasePromptText();
    setSystemPrompt(generated);
    localStorage.setItem('oneagentbd_saved_system_prompt', generated);
    setShowBuilder(false);
    try {
      await api.updateLLMSettings({
        llm_provider: provider,
        llm_api_key: apiKey.trim() || undefined,
        system_prompt: generated
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
      onRefreshUser();
    } catch (e) {
      console.error('Failed to auto-save generated knowledge base:', e);
    }
  };

  const runLiveTestQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    try {
      setTesting(true);
      setTestOutput('');

      const activePromptToUse =
        systemPrompt &&
        !systemPrompt.includes('You are a warm, professional customer support AI agent for our business.')
          ? systemPrompt
          : buildKnowledgeBasePromptText();

      await api
        .updateLLMSettings({
          llm_provider: provider,
          llm_api_key: apiKey.trim() || undefined,
          system_prompt: activePromptToUse
        })
        .catch(() => {});

      const res = await api.simulateInboundMessage({
        platform: 'whatsapp',
        customerName: 'Test Buyer',
        messageText: queryText.trim(),
        overrideSystemPrompt: activePromptToUse
      });

      if (res.aiReplyMessage?.message_text) {
        setTestOutput(res.aiReplyMessage.message_text);
      } else if (res.reason) {
        setTestOutput(`System Note: ${res.reason}`);
      } else {
        setTestOutput('Message processed and logged to the Unified Inbox.');
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
      label: 'One Agent BD (Full SaaS Knowledge Base)',
      icon: Briefcase,
      prompt: `আপনি "One Agent BD" (https://www.oneagentbd.online)-এর অফিসিয়াল কাস্টমার সাপোর্ট ও সেলস AI প্রতিনিধি।

Business Knowledge Base (আমাদের সম্পূর্ণ সার্ভিস ও নিয়মাবলী):
১. আমরা কী সার্ভিস দেই:
   - Facebook Page, Instagram, WhatsApp এবং Website-এর জন্য ২৪/৭ স্বয়ংক্রিয় AI মেসেজ রিপ্লাই, পোস্টের কমেন্ট অটো-রিপ্লাই + ইনবক্সে মেসেজ পাঠানো এবং অটোমেটিক অর্ডার ম্যানেজমেন্ট।
   - ভয়েস মেসেজ ও ছবি চেনা (Voice & Image AI): কাস্টমার বাংলা বা বাংলিশে ভয়েস মেসেজ পাঠালে AI তা শুনে উত্তর দেয় এবং প্রোডাক্টের ছবি বা স্ক্রিনশট পাঠালে ছবি দেখে দাম ও বিবরণ বলে দেয়।
   - কুরিয়ার বুকিং: কাস্টমারের নাম, ঠিকানা ও মোবাইল নাম্বার নিয়ে অটো অর্ডার এন্ট্রি করে এবং ১-ক্লিকে Steadfast, Pathao ও RedX কুরিয়ারে পার্সেল বুকিং করা যায়।
   - ওয়েবসাইট ইন্টিগ্রেশন: WordPress/WooCommerce, Shopify বা যেকোনো ওয়েবসাইটে মাত্র ১ লাইনের Script কোড কপি করে লাইভ AI চ্যাটবট যুক্ত করা যায়।

২. আমাদের প্ল্যান ও মূল্য তালিকা (২ দিনের ফ্রি ট্রায়ালসহ):
   - ফ্রি ট্রায়াল: নতুন অ্যাকাউন্ট খুললেই ২ দিনের (৪৮ ঘণ্টা) সম্পূর্ণ ফ্রি ট্রায়াল (কোনো অগ্রিম পেমেন্ট লাগবে না)।
   - Starter AI Plan — ৳১,২৫০ টাকা/মাস (২ মাস ৳২,৫০০ | ৩ মাস ৳৩,৭৫০ | ৬ মাস ৳৭,৫০০ | ১ বছর ৳১৫,০০০ টাকা): ১টি AI এজেন্ট, Facebook, Instagram, WhatsApp ও Website অটো-রিপ্লাই, ৫০টি প্রোডাক্ট ক্যাটালগ, অটো কমেন্ট রিপ্লাই ও কুরিয়ার বুকিং।
   - Pro Business Plan — ৳১,৯৫০ টাকা/মাস (২ মাস ৳৩,৯০০ | ৩ মাস ৳৫,৮৫০ | ৬ মাস ৳১১,৭০০ | ১ বছর ৳২৩,৪০০ টাকা): ৩টি AI এজেন্ট, ভয়েস মেসেজ ও ছবি চেনা (Voice & Image AI), আনলিমিটেড প্রোডাক্ট ক্যাটালগ, মাল্টি-স্টোর সিঙ্ক এবং ২৪/৭ ভিআইপি সাপোর্ট।

৩. কুপন কোড, ডিসকাউন্ট ও পেমেন্ট নিয়ম:
   - পেমেন্ট মাধ্যম: আমাদের ওয়েবসাইটে লগইন করে বিকাশ (bKash), নগদ (Nagad), রকেট (Rocket) বা উপায় (Upay)-এর মাধ্যমে পেমেন্ট করে Transaction ID (TrxID) দিলেই প্ল্যান সাথে সাথে অটো-অ্যাক্টিভ হয়ে যায়।
   - কুপন কোড ও ছাড়: চেকআউট করার সময় Coupon Code বক্সে প্রোমো কোড (যেমন WELCOME10 দিয়ে ১০% ডিসকাউন্ট অথবা SAVE250 দিয়ে ৳২৫০ ছাড়) ব্যবহার করা যায়। এছাড়া ওয়েবসাইটের লাইভ চ্যাটবট থেকে ১৫% ইনস্ট্যান্ট ডিসকাউন্ট কুপনও নেওয়া যায়।

৪. পেজের নিরাপত্তা ও সেটআপ:
   - মেটার ১০০% অফিসিয়াল Cloud ও Graph API ব্যবহৃত হয়, তাই পেজ বা নাম্বার ব্যান হওয়ার ০% ঝুঁকিও নেই এবং আনলিমিটেড মেসেজ রিপ্লাই ফ্রি।
   - কোডিং ছাড়াই মাত্র ২ মিনিটে "Connect with Facebook" বাটনে ১ ক্লিক করে পেজ কানেক্ট করা যায়।

৫. সাপোর্ট ও যোগাযোগ (সকাল ৯টা – রাত ১১টা):
   - হোয়াটসঅ্যাপ ও হেল্পলাইন: +8801601705804
   - ইমেইল: support.oneagentbd@gmail.com
   - ওয়েবসাইট: https://www.oneagentbd.online

SMART REASONING & SHORT REPLY RULES:
- সর্বদা সংক্ষিপ্ত ও টু-দ্য-পয়েন্ট উত্তর দেবেন (সর্বোচ্চ ২ থেকে ৩ বাক্যে / ২-৪ লাইনের মধ্যে)। কখনোই বিশাল বড় প্যারাগ্রাফ বা অপ্রয়োজনীয় লম্বা লিস্ট লিখবেন না।
- কাস্টমার যেটুকু প্রশ্ন করেছে (যেমন ১ বছরের দাম, কুপন কোড বা ভয়েস মেসেজ), শুধুমাত্র সেটুকুরই সরাসরি ও সুন্দর বাংলায় উত্তর দেবেন।`
    },
    {
      label: 'E-Commerce & Clothing Shop',
      icon: ShoppingBag,
      prompt: `You are the smart Customer Care AI Assistant for "Dhaka Style Trend" Fashion & Gadget Store.

Store Knowledge Base:
1. Products & Prices: Premium T-Shirt (490 TK), Polo Shirt (750 TK), Denim Jeans (990 TK), Sneakers (1,450 TK), Smartwatch (2,450 TK), Wireless Earbuds (1,650 TK). All sizes (M, L, XL, XXL) in stock.
2. Delivery Charges & Time: Inside Dhaka 60 TK (24-48 hours), Outside Dhaka 120 TK (2-3 days). Cash on Delivery (COD) available nationwide.
3. Order Process: Share product name/size, full name, complete delivery address, and 11-digit mobile number.
4. Payment: Cash on Delivery, bKash & Nagad Merchant: 01712-345678.
5. Return Policy: Easy 7-day size exchange policy.

MANDATORY RULES:
- Reply in natural Bangla script whenever a customer writes in Bangla or Banglish, and in English when they write in English.`
    },
    {
      label: 'IT Firm & Digital Agency',
      icon: Briefcase,
      prompt: `You are the AI Customer Support Consultant for "NexTech Digital Agency".

Services & Pricing:
1. Custom Website & E-Commerce Development: Starting from 15,000 TK.
2. Facebook & Google Ads Campaign Management: Starting from 5,000 TK/month.
3. WhatsApp & Social Media AI Automation Bot: Starting from 1,250 TK/month.
4. Payment Methods: Bank Transfer, bKash & Nagad Merchant Account.
5. Free Consultation: Share your name and phone number to schedule a call or Zoom meeting.

MANDATORY RULES:
- Reply in natural Bangla script to Bangla/Banglish inquiries and in English to English inquiries.`
    },
    {
      label: 'Restaurant & Food Delivery',
      icon: UtensilsCrossed,
      prompt: `You are the Food Ordering AI Assistant for "Spice Box Restaurant".

Menu & Pricing:
1. Kacchi Biryani Platter: 320 TK, Fried Chicken (4 pcs): 240 TK, Set Menu (Rice + Chicken + Vegetable): 180 TK, Beef Burger: 220 TK.
2. Delivery Areas & Fee: Dhanmondi, Mohammadpur, Lalmatia, Uttara & Mirpur. Delivery charge 40 TK (30-45 minutes).
3. Payment: Cash on Delivery and bKash Payment (01811-222333).
4. Order Process: Send food item name, quantity, full address, and mobile number.

MANDATORY RULES:
- Reply in natural Bangla script to Bangla/Banglish inquiries and in English to English inquiries.`
    },
    {
      label: 'Medical & Appointment Clinic',
      icon: Stethoscope,
      prompt: `You are the Medical Appointment AI Assistant for "CarePlus Diagnostic & Consultation Center".

Doctor Schedule & Consultation Fees:
1. Dr. M. A. Rahman (Medicine Specialist): Sun-Thu, 5:00 PM - 8:00 PM. Fee: 1,000 TK.
2. Dr. Faria Tasnim (Gynecology Specialist): Sat, Mon & Wed, 6:00 PM - 9:00 PM. Fee: 1,200 TK.
3. Appointment Booking: Share patient name, age, mobile number, and preferred date for instant confirmation.
4. Location: House 12, Road 4, Dhanmondi, Dhaka. Helpline: 01911-334455.

MANDATORY RULES:
- Reply in natural Bangla script to Bangla/Banglish inquiries and in English to English inquiries.`
    }
  ];

  const sampleTestQueries = [
    'coupon code আছে কি ভাই কোনো?',
    'ভাই আমার কাপড়ের পেজ আছে একা মেসেজ সামলাতে পারি না, কোন প্ল্যানটা ভালো হবে?',
    'কোডিং ছাড়া কি নিজেই সেটআপ করতে পারব?',
    '১ বছরের জন্য নিলে কত টাকা পড়বে?'
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200 max-w-4xl">
      {/* Title & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Settings & Integrations
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Configure your AI automated persona, business knowledge base, and courier delivery services.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveSection('ai')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSection === 'ai'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-[#7F22FE]" />
            <span>AI Persona & Prompts</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('delivery')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSection === 'delivery'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-[#7F22FE]" />
            <span>Delivery Apps & Courier</span>
          </button>
        </div>
      </div>

      {activeSection === 'delivery' ? (
        <DeliverySettingsSection onSyncDeliveryToAI={handleSyncDeliveryToAI} />
      ) : (
        <>
          <form onSubmit={handleSave} className="space-y-5">
            {/* Provider Selection & API Key */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#7F22FE]" />
                LLM Provider & Key
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setProvider('gemini')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    provider === 'gemini'
                      ? 'border-[#7F22FE] bg-[#7F22FE]/5 ring-1 ring-[#7F22FE]/20'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <span className="font-bold text-xs sm:text-sm block text-neutral-900 dark:text-white">
                    Google Gemini
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    gemini-2.5-flash (Multilingual & Voice Ready)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setProvider('openai')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    provider === 'openai'
                      ? 'border-[#7F22FE] bg-[#7F22FE]/5 ring-1 ring-[#7F22FE]/20'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800'
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
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800'
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
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#7F22FE]" />
                    Custom {provider.toUpperCase()} API Key (Optional)
                  </span>
                  {(hasCustomKey || apiKey.trim().length > 8) && (
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      API Key Saved & Active ({apiKey.trim() ? `••••${apiKey.trim().slice(-4)}` : maskedKey})
                    </span>
                  )}
                </label>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      id="settings-llm-api-key"
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Paste your Gemini (AIza...) or OpenAI (sk-...) API key here"
                      className="w-full text-xs pl-3 pr-9 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7F22FE]"
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

            {/* Custom System Prompt Textbox & Knowledge Base Builder */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#7F22FE]" />
                    Business Knowledge Base & System Prompt
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Configure your business details, pricing, and delivery rules for automated AI replies.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowBuilder(!showBuilder)}
                  className="px-3 py-1.5 rounded-xl bg-[#7F22FE]/10 text-[#7F22FE] border border-[#7F22FE]/20 text-xs font-bold flex items-center gap-1.5 hover:bg-[#7F22FE]/20 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>{showBuilder ? 'Hide Prompt Builder' : 'Open Knowledge Base Builder'}</span>
                </button>
              </div>

              {/* Interactive Knowledge Base Builder Drawer */}
              {showBuilder && (
                <div className="p-4 rounded-xl bg-[#7F22FE]/5 border border-[#7F22FE]/20 space-y-3.5">
                  <div className="flex items-center gap-2 text-[#7F22FE] font-bold text-xs">
                    <Info className="w-4 h-4" />
                    <span>Fill in your business details below and click "Generate & Save Knowledge Base":</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                        Business / Page Name:
                      </label>
                      <input
                        type="text"
                        value={kbBusinessName}
                        onChange={(e) => setKbBusinessName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                        Payment Methods & Details:
                      </label>
                      <input
                        type="text"
                        value={kbPayment}
                        onChange={(e) => setKbPayment(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                      Products / Services List & Pricing:
                    </label>
                    <textarea
                      rows={2}
                      value={kbServices}
                      onChange={(e) => setKbServices(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                        Delivery Fees & Time:
                      </label>
                      <input
                        type="text"
                        value={kbDelivery}
                        onChange={(e) => setKbDelivery(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                        Helpline & Support Hours:
                      </label>
                      <input
                        type="text"
                        value={kbHelpline}
                        onChange={(e) => setKbHelpline(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                      How Customers Place Orders:
                    </label>
                    <input
                      type="text"
                      value={kbOrderRule}
                      onChange={(e) => setKbOrderRule(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleGenerateKnowledgeBase}
                      className="px-4 py-2 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate & Save Knowledge Base</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Prompt Presets */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                  Ready-Made Business Presets (Click to load & auto-save)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {presets.map((p, idx) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyPreset(p.prompt)}
                        className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-neutral-100 hover:bg-[#7F22FE]/10 hover:text-[#7F22FE] dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Icon className="w-3.5 h-3.5 text-[#7F22FE]" />
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Active System Prompt (Core AI Directives & Business Details):
                </label>
                <textarea
                  id="settings-system-prompt"
                  rows={8}
                  required
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Enter your business details, pricing, delivery charges, and AI instructions..."
                  className="w-full p-3.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-[#7F22FE]"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-neutral-400">
                  {systemPrompt.length} characters • Multilingual Auto-Reply Active
                </span>
                <button
                  id="save-ai-settings-btn"
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white font-bold text-xs shadow-sm shadow-[#7F22FE]/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {saving ? (
                    'Saving...'
                  ) : savedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved Successfully</span>
                    </>
                  ) : (
                    'Save AI Configuration'
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Smart Sales Booster & Business Automation Controls */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#7F22FE]" />
                  <span>Smart Sales Booster, Payment Verify & Parcel Tracking AI</span>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  কাস্টমারের অর্ডার ভ্যালু বাড়ানো, বিকাশ/নগদ TrxID অটো ভেরিফাই এবং পার্সেল ট্র্যাকিং অটো-রিপ্লাই নিয়ন্ত্রণ করুন
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
                    Smart Upselling & Combo AI
                  </span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    কাস্টমার ১টি প্রোডাক্ট চাইলে AI কম্বো অফার সাজেস্ট করে অর্ডার ভ্যালু বাড়াবে
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
                    চ্যাটে TrxID বা স্ক্রিনশট দিলে অটোমেটিক অর্ডার Paid ও TrxID সেভ করবে
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
                    "অর্ডার কবে পাবো?" জিজ্ঞেস করলে লাইভ কুরিয়ার ও অর্ডার স্ট্যাটাস জানাবে
                  </span>
                </div>
              </label>
            </div>

            {upsellEnabled && (
              <div className="text-xs">
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Smart Upsell / Combo Offer Message (AI কাস্টমারকে যে অফারটি বলবে):
                </label>
                <input
                  type="text"
                  value={upsellOfferText}
                  onChange={(e) => setUpsellOfferText(e.target.value)}
                  placeholder="যেমন: ২টি প্রোডাক্ট একসাথে অর্ডার করলে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Interactive Prompt Simulator Box */}
          <div className="p-5 rounded-2xl bg-neutral-50/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-3.5">
            <div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#7F22FE]" />
                Test Your Persona & Knowledge Base Live
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Type a sample customer question below to preview how your AI agent responds using your saved business details.
              </p>
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
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 hover:border-[#7F22FE] hover:text-[#7F22FE] transition-colors cursor-pointer flex items-center gap-1"
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
                placeholder="Type a test customer message (e.g., What is your delivery charge?)"
                className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7F22FE]"
              />
              <button
                id="test-prompt-send-btn"
                type="submit"
                disabled={testing || !testInput.trim()}
                className="px-4 py-2 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] disabled:opacity-50 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testing ? 'Testing...' : 'Test'}</span>
              </button>
            </form>

            {testOutput && (
              <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-800 border border-[#7F22FE]/30 dark:border-[#7F22FE]/40 text-xs text-neutral-800 dark:text-neutral-100 leading-relaxed shadow-xs">
                <span className="font-bold text-[#7F22FE] dark:text-purple-400 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Auto-Reply Result:</span>
                </span>
                <p className="whitespace-pre-wrap font-medium">{testOutput}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
