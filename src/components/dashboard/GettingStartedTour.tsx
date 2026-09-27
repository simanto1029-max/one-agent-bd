import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Bot,
  Package,
  X,
  ChevronRight,
  Play,
  Check,
  ExternalLink,
  MessageSquare,
  Truck,
  CreditCard,
  RefreshCw,
  Zap,
  Globe,
  Facebook,
  Instagram,
  ShoppingBag,
  HelpCircle,
  CheckCheck
} from 'lucide-react';
import { Channel, UserProfile, Product } from '../../types';
import { api } from '../../api';

interface GettingStartedTourProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  channels: Channel[];
  onNavigate: (tab: string) => void;
  onRefreshData: () => Promise<void> | void;
  onOpenWebhookTester: () => void;
  initialStep?: number;
}

export const GettingStartedTour: React.FC<GettingStartedTourProps> = ({
  isOpen,
  onClose,
  currentUser,
  channels,
  onNavigate,
  onRefreshData,
  onOpenWebhookTester,
  initialStep = 1
}) => {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [productsCount, setProductsCount] = useState<number>(0);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [seedingProducts, setSeedingProducts] = useState<boolean>(false);
  const [seedSuccess, setSeedSuccess] = useState<boolean>(false);

  // Step 2 Quick AI Config
  const [storeName, setStoreName] = useState<string>(currentUser.full_name || 'My Fashion Store');
  const [aiTone, setAiTone] = useState<'friendly_bangla' | 'professional_bangla' | 'english'>('friendly_bangla');
  const [deliveryRates, setDeliveryRates] = useState<string>('Inside Dhaka 60 BDT (1-2 days), Outside Dhaka 120 BDT (2-3 days). Cash on Delivery available.');
  const [paymentInfo, setPaymentInfo] = useState<string>('bKash & Nagad (Personal/Merchant): 01700-000000. Cash on delivery accepted.');
  const [savingAI, setSavingAI] = useState<boolean>(false);
  const [aiSavedSuccess, setAiSavedSuccess] = useState<boolean>(false);

  // Check product count on mount & step change
  useEffect(() => {
    if (isOpen) {
      loadProductsCount();
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (initialStep) {
      setCurrentStep(initialStep);
    }
  }, [initialStep]);

  const loadProductsCount = async () => {
    try {
      setLoadingProducts(true);
      const res = await api.getProducts();
      setProductsCount(res.products?.length || 0);
    } catch (e) {
      console.error('Failed to load products count:', e);
    } finally {
      setLoadingProducts(false);
    }
  };

  if (!isOpen) return null;

  // Real-time completion states
  const isChannelsDone = channels.length > 0;
  const isAiDone = Boolean(currentUser.system_prompt && currentUser.system_prompt.length > 20) || aiSavedSuccess;
  const isProductsDone = productsCount > 0 || seedSuccess;

  const completedStepsCount = (isChannelsDone ? 1 : 0) + (isAiDone ? 1 : 0) + (isProductsDone ? 1 : 0);
  const progressPercent = Math.round((completedStepsCount / 3) * 100);

  // Handlers
  const handleSaveAIQuick = async () => {
    setSavingAI(true);
    setAiSavedSuccess(false);
    try {
      const tonePrompt =
        aiTone === 'friendly_bangla'
          ? 'Reply warmly and naturally in Bangla or Banglish with polite greetings. Be concise, helpful, and courteous.'
          : aiTone === 'professional_bangla'
          ? 'Maintain a formal, professional corporate Bengali tone. Provide structured, accurate responses.'
          : 'Respond in clean, polite, and persuasive English.';

      const newPrompt = `You are the official AI Sales & Customer Support Agent for "${storeName}".
Tone & Language: ${tonePrompt}

[BUSINESS KNOWLEDGE & POLICIES]:
- Business Name: ${storeName}
- Delivery Rates: ${deliveryRates}
- Payment Information: ${paymentInfo}
- Order Capture Rule: Always politely ask the customer for their Full Name, Delivery Address, and Active Phone Number to confirm an order.
- Always check product prices and catalog details before confirming.`;

      await api.updateLLMSettings({
        system_prompt: newPrompt
      });

      setAiSavedSuccess(true);
      await onRefreshData();
      setTimeout(() => setAiSavedSuccess(false), 3500);
    } catch (err: any) {
      alert('Failed to save AI configuration: ' + (err.message || 'Error'));
    } finally {
      setSavingAI(false);
    }
  };

  const handleSeedSampleProducts = async () => {
    setSeedingProducts(true);
    setSeedSuccess(false);
    try {
      await api.seedSampleProducts();
      setSeedSuccess(true);
      await loadProductsCount();
      await onRefreshData();
      setTimeout(() => setSeedSuccess(false), 3500);
    } catch (err: any) {
      alert('Could not seed sample products: ' + (err.message || 'Error'));
    } finally {
      setSeedingProducts(false);
    }
  };

  const handleFinishTour = () => {
    if (currentUser?.id) {
      localStorage.setItem(`oneagentbd_tour_completed_${currentUser.id}`, 'true');
    }
    localStorage.setItem('oneagentbd_tour_completed', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="getting-started-tour-modal"
        className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header with Progress Bar */}
        <div className="p-5 sm:p-6 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7F22FE] to-indigo-600 flex items-center justify-center text-white shadow-md shadow-[#7F22FE]/25">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                    Getting Started Guide
                  </h2>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#7F22FE]/10 text-[#7F22FE] border border-[#7F22FE]/20">
                    A to Z Automation
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Complete these 3 essential steps to automate your business 100%
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-xl hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Close tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Tabs Bar */}
          <div className="mt-5 grid grid-cols-4 gap-2">
            {[
              { step: 1, title: 'Channels', isDone: isChannelsDone, icon: Smartphone },
              { step: 2, title: 'AI Persona', isDone: isAiDone, icon: Bot },
              { step: 3, title: 'Products', isDone: isProductsDone, icon: Package },
              { step: 4, title: 'Live Launch', isDone: completedStepsCount === 3, icon: Zap }
            ].map((s) => {
              const Icon = s.icon;
              const isActive = currentStep === s.step;
              return (
                <button
                  key={s.step}
                  onClick={() => setCurrentStep(s.step)}
                  className={`p-2 rounded-xl text-left transition-all border cursor-pointer relative ${
                    isActive
                      ? 'bg-[#7F22FE] text-white border-[#7F22FE] shadow-sm shadow-[#7F22FE]/25'
                      : s.isDone
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-white dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700/80 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : s.isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'}`} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Step {s.step}
                      </span>
                    </div>
                    {s.isDone && (
                      <Check className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
                    )}
                  </div>
                  <div className={`text-xs font-bold truncate ${isActive ? 'text-white' : ''}`}>
                    {s.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Overall Progress Tracker */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
            <span>Progress: {completedStepsCount} of 3 core steps completed</span>
            <span className="font-bold text-[#7F22FE]">{progressPercent}% Ready</span>
          </div>
          <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#7F22FE] to-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            />
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: CONNECT CHANNELS */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-1">
                    <Smartphone className="w-3.5 h-3.5" />
                    Step 1 of 3: Channels Integration
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Connect Meta (WhatsApp, Messenger, Instagram) & Website
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                    গ্রাহকদের সব মেসেজ যেন অটোমেটিক আপনার প্ল্যাটফর্মে আসে এবং এআই চব্বিশ ঘণ্টা রিপ্লাই দিতে পারে, সেজন্য আপনার ফেসবুক পেজ, ইনস্টাগ্রাম বা হোয়াটসঅ্যাপ কানেক্ট করুন।
                  </p>
                </div>
                {isChannelsDone && (
                  <span className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Connected
                  </span>
                )}
              </div>

              {/* Connected Channels Status */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  {
                    name: 'Facebook',
                    icon: Facebook,
                    connected: channels.some((c) => c.platform === 'messenger'),
                    color: 'text-blue-600',
                    bg: 'bg-blue-50 dark:bg-blue-950/40'
                  },
                  {
                    name: 'Instagram',
                    icon: Instagram,
                    connected: channels.some((c) => c.platform === 'instagram'),
                    color: 'text-pink-600',
                    bg: 'bg-pink-50 dark:bg-pink-950/40'
                  },
                  {
                    name: 'WhatsApp',
                    icon: Smartphone,
                    connected: channels.some((c) => c.platform === 'whatsapp'),
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-50 dark:bg-emerald-950/40'
                  },
                  {
                    name: 'Website Widget',
                    icon: Globe,
                    connected: true,
                    color: 'text-[#7F22FE]',
                    bg: 'bg-purple-50 dark:bg-purple-950/40'
                  }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        item.connected
                          ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                          : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl ${item.bg} ${item.color} flex items-center justify-center mx-auto mb-1.5`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        {item.name}
                      </div>
                      <div className="text-[10px] mt-0.5">
                        {item.connected ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> Ready
                          </span>
                        ) : (
                          <span className="text-neutral-400">Not Linked</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Cards */}
              <div className="p-4 rounded-2xl bg-[#7F22FE]/5 dark:bg-[#7F22FE]/10 border border-[#7F22FE]/20 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#7F22FE]" />
                      Connect Your Official Channels
                    </h4>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
                      আপনার অফিসিয়াল ফেসবুক পেজ, ইনস্টাগ্রাম বা হোয়াটসঅ্যাপ কানেক্ট করতে <strong>Channels Hub</strong>-এ যান। সেখানে আপনি মেটা অফিসিয়াল লগইন অথবা সরাসরি পেজ এক্সেস টোকেন দিয়ে লাইভ চ্যানেল অ্যাক্টিভেট করতে পারবেন।
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      onNavigate('channels');
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Go to Channels Hub</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DEFINE AI PERSONALITY & POLICIES */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 text-xs font-semibold mb-1">
                    <Bot className="w-3.5 h-3.5" />
                    Step 2 of 3: AI Persona & Knowledge
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Define Your Store AI Persona & Delivery Rules
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                    আপনার এআই এজেন্ট কীভাবে গ্রাহকদের সাথে কথা বলবে, ডেলিভারি চার্জ কত (ঢাকার ভেতরে/বাইরে), এবং কোন নাম্বারে পেমেন্ট নিবে তা এখানে সেট করুন।
                  </p>
                </div>
                {isAiDone && (
                  <span className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Configured
                  </span>
                )}
              </div>

              {/* Quick Config In-Modal Form */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/80 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Store / Brand Name (দোকান বা ব্র্যান্ডের নাম)
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. Trendy Men BD"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-[#7F22FE]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      AI Conversation Tone (কথা বলার ধরণ)
                    </label>
                    <select
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-[#7F22FE]"
                    >
                      <option value="friendly_bangla">Friendly & Polite Bangla (বাংলা / বাংলিশ)</option>
                      <option value="professional_bangla">Professional Corporate Bangla (মার্জিত)</option>
                      <option value="english">Standard English (Global Tone)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Payment Methods & Numbers (পেমেন্ট নিয়ম)
                    </label>
                    <input
                      type="text"
                      value={paymentInfo}
                      onChange={(e) => setPaymentInfo(e.target.value)}
                      placeholder="bKash/Nagad: 017XX-XXXXXX, Cash on delivery"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-[#7F22FE]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Delivery Rates & Timeline (কুরিয়ার ও ডেলিভারি চার্জ)
                  </label>
                  <input
                    type="text"
                    value={deliveryRates}
                    onChange={(e) => setDeliveryRates(e.target.value)}
                    placeholder="Inside Dhaka 60 BDT, Outside Dhaka 120 BDT. Cash on Delivery."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-[#7F22FE]"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-neutral-200 dark:border-neutral-700/60">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveAIQuick}
                      disabled={savingAI}
                      className="px-4 py-2 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {savingAI ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>{savingAI ? 'Saving...' : 'Save & Calibrate AI'}</span>
                    </button>

                    {aiSavedSuccess && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> AI Calibrated Successfully!
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      onNavigate('settings');
                      onClose();
                    }}
                    className="text-xs text-[#7F22FE] hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Open Advanced Persona Settings</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SET UP PRODUCTS & CATALOG */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-1">
                    <Package className="w-3.5 h-3.5" />
                    Step 3 of 3: Products & Inventory
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Add Your Store Products & Pricing
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                    কাস্টমার যখন কোনো পণ্যের দাম বা ছবি জানতে চাইবে, এআই আপনার ক্যাটালগ দেখে নিখুঁত দাম বলবে এবং অর্ডার গ্রহণ করবে।
                  </p>
                </div>
                {isProductsDone && (
                  <span className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {productsCount} Products Active
                  </span>
                )}
              </div>

              {/* Status Box */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-white">
                      Current Catalog Status
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {loadingProducts ? (
                        'Checking products...'
                      ) : productsCount > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {productsCount} items registered and ready for AI pitching
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          No products found. Add products or load demo items below!
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={loadProductsCount}
                  className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  title="Refresh count"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingProducts ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="p-4 rounded-2xl bg-[#7F22FE]/5 dark:bg-[#7F22FE]/10 border border-[#7F22FE]/20 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white">
                  <Sparkles className="w-3.5 h-3.5 text-[#7F22FE]" />
                  <span>Choose How to Set Up Your Products</span>
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  আপনি এখনই ১-ক্লিকে ৩টি প্রি-কনফিগার্ড ডেমো প্রোডাক্ট (যেমন: ব্যাকপ্যাক, স্মার্টওয়াচ, সানগ্লাস) যুক্ত করে টেস্টিং শুরু করতে পারেন, অথবা আপনার নিজস্ব পণ্যের ছবি ও দাম যুক্ত করতে <strong>Products & Catalog</strong>-এ যেতে পারেন।
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={handleSeedSampleProducts}
                    disabled={seedingProducts}
                    className="px-4 py-2 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {seedingProducts ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>{seedingProducts ? 'Loading Items...' : '1-Click Load 3 Sample Products'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('products');
                      onClose();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Open Products Catalog</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  {seedSuccess && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Sample Products Added!
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CELEBRATION & LIVE LAUNCH */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-200 text-center py-2">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-[#7F22FE] text-white flex items-center justify-center mx-auto shadow-xl shadow-[#7F22FE]/20">
                <CheckCheck className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-black text-neutral-900 dark:text-white">
                  Congratulations! Your Business is Automation Ready! 🎉
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mt-2 leading-relaxed">
                  আপনার চ্যানেল, এআই পারসোনা এবং প্রোডাক্ট ক্যাটালগ সফলভাবে সেটআপ করা হয়েছে। এখন আপনার এআই এজেন্ট ২৪/৭ গ্রাহকদের সাথে চ্যাট করতে এবং অর্ডার কনফার্ম করতে প্রস্তুত।
                </p>
              </div>

              {/* Checklist Review */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-lg mx-auto">
                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs ${isChannelsDone ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-neutral-200 text-neutral-500'}`}>
                    {isChannelsDone ? <Check className="w-4 h-4" /> : '1'}
                  </div>
                  <div>
                    <div className="text-xs font-bold">Channels Connected</div>
                    <div className="text-[10px] text-neutral-400">Ready for incoming msgs</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs ${isAiDone ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-neutral-200 text-neutral-500'}`}>
                    {isAiDone ? <Check className="w-4 h-4" /> : '2'}
                  </div>
                  <div>
                    <div className="text-xs font-bold">AI Calibrated</div>
                    <div className="text-[10px] text-neutral-400">Rules & tone defined</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs ${isProductsDone ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-neutral-200 text-neutral-500'}`}>
                    {isProductsDone ? <Check className="w-4 h-4" /> : '3'}
                  </div>
                  <div>
                    <div className="text-xs font-bold">Products Ready</div>
                    <div className="text-[10px] text-neutral-400">Ready for instant orders</div>
                  </div>
                </div>
              </div>

              {/* Recommended Next Actions */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 max-w-lg mx-auto space-y-2 text-left">
                <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#7F22FE]" />
                  <span>Next Recommended Steps:</span>
                </div>
                <ul className="text-xs text-neutral-600 dark:text-neutral-300 space-y-1.5 list-disc list-inside">
                  <li><strong>Webhook Simulator</strong> দিয়ে গ্রাহকের মতো মেসেজ পাঠিয়ে এআই রিপ্লাই পরীক্ষা করুন।</li>
                  <li><strong>Delivery & Courier</strong> মেনুতে Steadfast বা Pathao API কী বসিয়ে অটো-কুরিয়ার এন্ট্রি চালু করুন।</li>
                  <li><strong>Orders Hub</strong>-এ এসে কনফার্ম হওয়া প্রতিটি অর্ডারের ট্র্যাকিং দেখুন।</li>
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    onOpenWebhookTester();
                    handleFinishTour();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>Test in Webhook Simulator</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('inbox');
                    handleFinishTour();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold transition-all border border-neutral-200 dark:border-neutral-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Open Unified Inbox</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80 flex items-center justify-between">
          <div>
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                className="px-3.5 py-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Step</span>
              </button>
            ) : (
              <button
                onClick={handleFinishTour}
                className="px-3.5 py-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs font-medium cursor-pointer"
              >
                Skip Guide for Now
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}
                className="px-4 py-2 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleFinishTour}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>Finish & Go to Workspace</span>
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Also export a Dashboard Quick Setup Checklist Banner for OverviewView
interface SetupChecklistBannerProps {
  channelsCount: number;
  hasSystemPrompt: boolean;
  productsCount: number;
  onOpenTour: (step?: number) => void;
  onNavigate: (tab: string) => void;
}

export const SetupChecklistBanner: React.FC<SetupChecklistBannerProps> = ({
  channelsCount,
  hasSystemPrompt,
  productsCount,
  onOpenTour,
  onNavigate
}) => {
  const isChannelsDone = channelsCount > 0;
  const isAiDone = hasSystemPrompt;
  const isProductsDone = productsCount > 0;

  const completed = (isChannelsDone ? 1 : 0) + (isAiDone ? 1 : 0) + (isProductsDone ? 1 : 0);
  const percentage = Math.round((completed / 3) * 100);

  // If all completed, can display a compact celebration or subtle widget
  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7F22FE] animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-[#7F22FE]">
              Merchant Onboarding Progress
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              {completed} of 3 Done ({percentage}%)
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
            {completed === 3
              ? '🎉 Store Automation Fully Calibrated & Active!'
              : 'Complete your essential store setup to automate customer orders'}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xl">
            {completed === 3
              ? 'Your channels, AI persona, and product catalog are all configured. Ready to reply to customers and log orders.'
              : 'Follow our guided interactive tour to link Meta channels, customize AI instructions, and load your products.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onOpenTour(1)}
            className="px-4 py-2.5 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white text-xs font-bold transition-all shadow-md shadow-[#7F22FE]/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{completed === 3 ? 'Review Setup Guide' : 'Open Guided Tour'}</span>
          </button>
        </div>
      </div>

      {/* 3 Step Interactive Progress Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
        {/* Step 1 */}
        <div
          onClick={() => (isChannelsDone ? onNavigate('channels') : onOpenTour(1))}
          className={`p-3 rounded-2xl border transition-all cursor-pointer group ${
            isChannelsDone
              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
              : 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700/80 hover:border-[#7F22FE]/40'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-[#7F22FE]" /> Step 1: Channels
            </span>
            {isChannelsDone ? (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <Check className="w-3 h-3" /> Ready
              </span>
            ) : (
              <span className="text-[10px] font-bold text-[#7F22FE] group-hover:underline">
                Setup &rarr;
              </span>
            )}
          </div>
          <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
            {isChannelsDone ? `${channelsCount} Channel(s) Linked` : 'Connect Meta & Website'}
          </div>
        </div>

        {/* Step 2 */}
        <div
          onClick={() => (isAiDone ? onNavigate('settings') : onOpenTour(2))}
          className={`p-3 rounded-2xl border transition-all cursor-pointer group ${
            isAiDone
              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
              : 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700/80 hover:border-[#7F22FE]/40'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <Bot className="w-3 h-3 text-[#7F22FE]" /> Step 2: AI Persona
            </span>
            {isAiDone ? (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <Check className="w-3 h-3" /> Active
              </span>
            ) : (
              <span className="text-[10px] font-bold text-[#7F22FE] group-hover:underline">
                Setup &rarr;
              </span>
            )}
          </div>
          <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
            {isAiDone ? 'Brand Knowledge Saved' : 'Set Tone & Delivery Rates'}
          </div>
        </div>

        {/* Step 3 */}
        <div
          onClick={() => (isProductsDone ? onNavigate('products') : onOpenTour(3))}
          className={`p-3 rounded-2xl border transition-all cursor-pointer group ${
            isProductsDone
              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
              : 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700/80 hover:border-[#7F22FE]/40'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <Package className="w-3 h-3 text-[#7F22FE]" /> Step 3: Products
            </span>
            {isProductsDone ? (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <Check className="w-3 h-3" /> {productsCount} Items
              </span>
            ) : (
              <span className="text-[10px] font-bold text-[#7F22FE] group-hover:underline">
                Setup &rarr;
              </span>
            )}
          </div>
          <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
            {isProductsDone ? 'Catalog Synced to AI' : 'Add Store Products & Prices'}
          </div>
        </div>
      </div>
    </div>
  );
};
