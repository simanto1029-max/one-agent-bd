import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Bot,
  MessageCircle,
  Instagram,
  Globe,
  Send,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  CheckCheck,
  Wifi,
  BatteryMedium,
  Zap,
  Package
} from 'lucide-react';
import { api } from '../../api';

interface HeroProps {
  onStartTrial: () => void;
  onExploreDemo: () => void;
  onOpenLogin?: () => void;
  onOpenSignup?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onStartTrial,
  onExploreDemo,
  onOpenLogin,
  onOpenSignup
}) => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'messenger' | 'instagram' | 'website'>('whatsapp');
  const [inputMsg, setInputMsg] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'customer' | 'ai'; text: string; time: string }>>([
    {
      sender: 'customer',
      text: 'Hi! What channels and features does your AI agent support?',
      time: '10:30 AM'
    },
    {
      sender: 'ai',
      text: 'Hello! One Agent BD provides 24/7 autonomous AI replies across WhatsApp Business, Facebook Messenger, Instagram Direct, and your own Website Chatbot! It automatically captures customer orders, verifies bKash/Nagad transactions, answers inquiries instantly, and syncs everything to your Unified Inbox.',
      time: '10:30 AM'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Auto-scroll refs
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = (smooth = true) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
    chatMessagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'nearest'
    });
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [chatMessages, isTyping]);

  const sendQuestion = async (text: string) => {
    const userText = text.trim();
    if (!userText || isTyping) return;

    setInputMsg('');
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Instantly append user message
    setChatMessages((prev) => [...prev, { sender: 'customer', text: userText, time: timeNow }]);
    setIsTyping(true);

    setTimeout(() => scrollToBottom(true), 50);

    try {
      // 2. Fetch intelligent AI reply from backend
      const res = await api.queryHeroChat(userText, activeTab, chatMessages);
      const aiReply = res?.reply || 'Our AI agent provides 24/7 automated replies for WhatsApp, Messenger, Instagram, and Website with instant order booking and payment verification. Start your 2-Day Free Trial today!';

      setChatMessages((prev) => [...prev, { sender: 'ai', text: aiReply, time: timeNow }]);
    } catch (err) {
      console.warn('Hero chat query failed, using responsive fallback:', err);
      const lower = userText.toLowerCase();
      let fallback = '';

      if (lower.includes('price') || lower.includes('cost') || lower.includes('package') || lower.includes('dam') || lower.includes('taka')) {
        fallback = 'One Agent BD offers affordable plans with a 2-Day Free Trial! It includes unlimited AI auto-replies, official WhatsApp Cloud API, Facebook Messenger, Instagram Direct, Voice AI, and the Orders Hub. Check the Pricing section for plan details!';
      } else if (lower.includes('trial') || lower.includes('free')) {
        fallback = 'You get a full 2-day free trial right after registration—no credit card or upfront payment needed! Test live WhatsApp and Messenger connections risk-free.';
      } else if (lower.includes('voice') || lower.includes('audio')) {
        fallback = 'Our platform includes a specialized Voice AI Engine! When customers send voice notes on WhatsApp or Facebook, our AI listens, transcribes, understands, and replies automatically.';
      } else if (lower.includes('bkash') || lower.includes('nagad') || lower.includes('payment')) {
        fallback = 'We support bKash & Nagad Send Money. Choose your preferred plan, send payment to our merchant number, and submit your 10-character TrxID for instant activation!';
      } else if (lower.includes('order') || lower.includes('booking') || lower.includes('courier')) {
        fallback = 'When customers provide their product details, phone, and delivery address in chat, AI extracts the order directly into the Orders Hub and lets you dispatch to couriers in 1 click.';
      } else if (lower.includes('whatsapp') || lower.includes('messenger') || lower.includes('instagram') || lower.includes('website') || lower.includes('meta') || lower.includes('ban')) {
        fallback = 'We strictly use official Meta WhatsApp Cloud API and Facebook Graph API, ensuring 100% security with 0% risk of account ban.';
      } else {
        fallback = 'One Agent BD is your 24/7 autonomous AI customer support and commerce platform. Enjoy unlimited features with an instant 2-day free trial!';
      }

      setChatMessages((prev) => [...prev, { sender: 'ai', text: fallback, time: timeNow }]);
    } finally {
      setIsTyping(false);
      setTimeout(() => scrollToBottom(true), 100);
    }
  };

  const handleSendSimulated = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuestion(inputMsg);
  };

  const sampleQuestions = [
    { label: '📦 How does AI Order Detection work?', text: 'How does the AI automatically extract customer name, phone, items, and address from messages?' },
    { label: '💳 Pricing & Free Trial Details', text: 'What is included in the subscription packages and how do I use the 2-day free trial?' },
    { label: '🎙️ How does Voice AI work?', text: 'Can the AI understand and respond to customer voice audio messages?' },
    { label: '⚡ Official Meta Cloud API', text: 'How do you connect official WhatsApp Cloud API and Messenger with 0% ban risk?' }
  ];

  return (
    <section className="relative pt-8 pb-14 sm:pt-14 sm:pb-20 bg-white dark:bg-gradient-to-br dark:from-[#0B0720] dark:via-[#130B32] dark:to-[#090518] overflow-hidden transition-colors">
      {/* ChatMakky Ambient Radial Glows */}
      <div className="absolute -top-24 -left-24 w-[420px] sm:w-[600px] h-[340px] sm:h-[460px] bg-[#7F22FE]/8 dark:bg-[#5B21B6]/30 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-10 -right-24 w-[380px] sm:w-[540px] h-[300px] sm:h-[420px] bg-purple-400/8 dark:bg-[#9333EA]/22 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Responsive Copy & CTAs */}
          <div className="lg:col-span-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7F22FE]/10 dark:bg-[#1E1242]/90 border border-[#7F22FE]/25 dark:border-purple-500/35 text-[11px] sm:text-xs font-semibold text-[#7F22FE] dark:text-purple-200 mb-5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="tracking-wide">Build once, deploy to every channel</span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] uppercase tracking-wider rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30">
                Meta Official Cloud API
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.12]">
              One AI Agent.{' '}
              <span className="bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#C084FC] bg-clip-text text-transparent">
                Every Channel.
              </span>
            </h1>

            <p className="mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg text-neutral-600 dark:text-slate-300/90 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Build and deploy autonomous AI agents across WhatsApp, Facebook Messenger, Instagram Direct, and your Website. Instant product photo search, voice note audio replies, automatic order booking, and human handoff in one neat dashboard.
            </p>

            {/* ChatMakky Style Premium Pill CTAs */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4">
              <button
                id="hero-start-trial-btn"
                onClick={onStartTrial}
                className="w-full sm:w-auto px-7 py-3.5 sm:px-8 sm:py-4 rounded-full bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:from-[#6D28D9] hover:via-[#7C3AED] hover:to-[#9333EA] text-white font-bold text-sm sm:text-base border border-purple-300/30 shadow-[0_0_28px_rgba(139,92,246,0.45)] hover:shadow-[0_0_36px_rgba(168,85,247,0.65)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>Start 2-Day Free Trial</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <a
                href="#features"
                className="w-full sm:w-auto px-7 py-3.5 sm:px-8 sm:py-4 rounded-full bg-slate-100/80 dark:bg-[#150E30]/90 hover:bg-slate-200/70 dark:hover:bg-[#1E1442] text-neutral-900 dark:text-white font-bold text-sm sm:text-base border border-neutral-300/90 dark:border-purple-400/25 hover:border-[#8B5CF6]/60 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-[#8B5CF6] dark:text-purple-400" />
                <span>Explore AI Features</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="mt-7 sm:mt-8 pt-5 sm:pt-6 border-t border-neutral-200/80 dark:border-purple-500/15 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-4 sm:gap-x-6 text-[11px] sm:text-xs text-neutral-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>2-Day Free Trial (No Card Needed)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Meta Official Cloud API</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8B5CF6] dark:text-purple-400" />
                <span>Transparent Plans (bKash & Nagad)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Premium Light Smartphone Simulator (Pure White & #7F22FE) with Animated Floating Badges */}
          <div className="lg:col-span-6 flex justify-center relative">
            
            {/* Floating Live Badge 1: 0.8s Latency */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="hidden sm:flex absolute -top-3 -left-4 z-20 items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 shadow-xl border border-neutral-200/80 dark:border-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 fill-current" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 block font-normal">Sub-second Speed</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px]">0.8s Response</span>
              </div>
            </motion.div>

            {/* Floating Live Badge 2: Auto Order Booking */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="hidden sm:flex absolute -bottom-3 -right-3 z-20 items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 shadow-xl border border-neutral-200/80 dark:border-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200"
            >
              <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-[#7F22FE] flex items-center justify-center">
                <Package className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 block font-normal">Auto Booking</span>
                <span className="text-[#7F22FE] font-extrabold text-[11px]">COD Verified</span>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-full max-w-[390px] sm:max-w-[420px] rounded-[2.4rem] sm:rounded-[2.8rem] bg-white dark:bg-neutral-900 p-3 sm:p-4 shadow-2xl shadow-[#7F22FE]/10 border border-neutral-200 dark:border-neutral-750 ring-1 ring-neutral-200/70 dark:ring-neutral-800 transition-all"
            >
              
              {/* Smartphone Top Notch & Status Bar */}
              <div className="px-4 pt-1.5 pb-2.5 flex items-center justify-between text-[11px] text-neutral-500 select-none">
                <span className="font-bold text-neutral-900 tracking-tight">9:41</span>
                {/* Dynamic Island Pill */}
                <div className="w-20 h-4 bg-neutral-900 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-neutral-700" />
                </div>
                <div className="flex items-center gap-1 text-neutral-700">
                  <Wifi className="w-3 h-3" />
                  <BatteryMedium className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* App Screen Container */}
              <div className="rounded-[1.7rem] sm:rounded-[2rem] bg-white overflow-hidden border border-neutral-200 flex flex-col shadow-inner">
                
                {/* Chat App Header */}
                <div className="p-3 bg-white border-b border-neutral-150 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-[#7F22FE] flex items-center justify-center text-white text-xs font-bold shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-neutral-900 tracking-tight">One Agent BD</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          AI Verified
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Meta 24/7 AI Active
                      </span>
                    </div>
                  </div>

                  {/* Channel Switcher Tabs */}
                  <div className="flex items-center p-0.5 rounded-lg bg-neutral-100 border border-neutral-200">
                    <button
                      type="button"
                      onClick={() => setActiveTab('whatsapp')}
                      className={`px-1.5 py-1 rounded-md text-[9px] font-bold flex items-center gap-0.5 transition-all cursor-pointer ${
                        activeTab === 'whatsapp'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                      title="WhatsApp Business"
                    >
                      <MessageCircle className="w-2.5 h-2.5" />
                      WA
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('messenger')}
                      className={`px-1.5 py-1 rounded-md text-[9px] font-bold flex items-center gap-0.5 transition-all cursor-pointer ${
                        activeTab === 'messenger'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                      title="Facebook Messenger"
                    >
                      <MessageCircle className="w-2.5 h-2.5" />
                      FB
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('instagram')}
                      className={`px-1.5 py-1 rounded-md text-[9px] font-bold flex items-center gap-0.5 transition-all cursor-pointer ${
                        activeTab === 'instagram'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xs'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                      title="Instagram Direct"
                    >
                      <Instagram className="w-2.5 h-2.5" />
                      IG
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('website')}
                      className={`px-1.5 py-1 rounded-md text-[9px] font-bold flex items-center gap-0.5 transition-all cursor-pointer ${
                        activeTab === 'website'
                          ? 'bg-[#7F22FE] text-white shadow-xs'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                      title="Website Chatbot"
                    >
                      <Globe className="w-2.5 h-2.5" />
                      Web
                    </button>
                  </div>
                </div>

                {/* Chat Message Scroll Viewport */}
                <div
                  ref={chatContainerRef}
                  className="h-[250px] sm:h-[280px] overflow-y-auto p-3 space-y-2.5 bg-neutral-50/50 scroll-smooth"
                >
                  {chatMessages.map((msg, i) => {
                    const isCustomer = msg.sender === 'customer';
                    return (
                      <div
                        key={i}
                        className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[88%] p-3 rounded-2xl text-[11px] sm:text-xs leading-relaxed ${
                            isCustomer
                              ? 'bg-[#7F22FE] text-white rounded-tr-xs shadow-xs'
                              : 'bg-white text-neutral-900 border border-neutral-200/90 rounded-tl-xs shadow-xs'
                          }`}
                        >
                          {!isCustomer && (
                            <div className="flex items-center gap-1 text-[9px] font-bold text-[#7F22FE] mb-1">
                              <Bot className="w-3 h-3" />
                              <span>Autonomous Agent</span>
                            </div>
                          )}
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${isCustomer ? 'text-white/80' : 'text-neutral-400'}`}>
                            <span>{msg.time}</span>
                            {isCustomer && <CheckCheck className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing Bubble */}
                  {isTyping && (
                    <div className="flex items-center gap-1.5 p-2.5 rounded-2xl bg-white border border-neutral-200 w-fit text-neutral-600 text-[11px] shadow-xs">
                      <Bot className="w-3.5 h-3.5 text-[#7F22FE]" />
                      <span className="text-[10px] text-neutral-500 mr-1">AI replying</span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7F22FE] animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7F22FE] animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7F22FE] animate-bounce" />
                      </span>
                    </div>
                  )}

                  <div ref={chatMessagesEndRef} />
                </div>

                {/* Quick Test Chips */}
                <div className="px-2.5 py-2 bg-white border-t border-neutral-200">
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-neutral-500 mb-1.5 px-1">
                    <Sparkles className="w-3 h-3 text-[#7F22FE]" />
                    <span>Quick test prompts:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {sampleQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => sendQuestion(q.text)}
                        disabled={isTyping}
                        className="text-left text-[10px] px-2.5 py-1.5 rounded-lg bg-neutral-50 hover:bg-[#7F22FE]/10 text-neutral-700 hover:text-[#7F22FE] border border-neutral-200 hover:border-[#7F22FE]/30 transition-all disabled:opacity-50 cursor-pointer truncate font-medium"
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Smartphone Chat Input Bar */}
                <div className="p-2 sm:p-2.5 bg-white border-t border-neutral-200">
                  <form onSubmit={handleSendSimulated} className="flex items-center gap-1.5">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMsg}
                      onChange={(e) => setInputMsg(e.target.value)}
                      placeholder="Type a question to test live AI..."
                      disabled={isTyping}
                      className="flex-1 bg-neutral-100 text-neutral-900 placeholder-neutral-400 text-xs rounded-full px-3.5 py-2 border border-neutral-200 focus:border-[#7F22FE] focus:outline-hidden disabled:opacity-50 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!inputMsg.trim() || isTyping}
                      className="w-8 h-8 rounded-full bg-[#7F22FE] hover:bg-[#6c1ce0] disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm active:scale-95"
                      title="Send"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                  <div className="mt-1.5 text-center text-[9px] text-neutral-500">
                    Live AI Engine • WhatsApp, Messenger, Instagram & Website
                  </div>
                </div>

              </div>
            </motion.div>
          </div>

        </div>

        {/* ChatMakky Signature: AI Providers & Intelligence Engine Bar */}
        <div className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-neutral-150 dark:border-neutral-800 text-center">
          <p className="text-[11px] sm:text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-4 sm:mb-5">
            Powered by enterprise intelligence & official Meta Cloud API
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60 shadow-2xs hover:border-[#7F22FE]/40 hover:-translate-y-0.5 transition-all duration-200 cursor-default">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>OpenAI ChatGPT</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60 shadow-2xs hover:border-[#7F22FE]/40 hover:-translate-y-0.5 transition-all duration-200 cursor-default">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Anthropic Claude</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60 shadow-2xs hover:border-[#7F22FE]/40 hover:-translate-y-0.5 transition-all duration-200 cursor-default">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Google Gemini 2.5</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60 shadow-2xs hover:border-[#7F22FE]/40 hover:-translate-y-0.5 transition-all duration-200 cursor-default">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span>DeepSeek R1</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60 shadow-2xs hover:border-[#7F22FE]/40 hover:-translate-y-0.5 transition-all duration-200 cursor-default">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span>Groq LPU Engine</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60 shadow-2xs hover:border-[#7F22FE]/40 hover:-translate-y-0.5 transition-all duration-200 cursor-default">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>ElevenLabs Voice AI</span>
            </div>
          </div>
        </div>

        {/* Omnichannel Channels Section (#channels) */}
        <div id="channels" className="mt-10 sm:mt-14 scroll-mt-16">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
            <span className="text-[11px] sm:text-xs font-bold text-[#7F22FE] uppercase tracking-wider block mb-1.5">
              Omnichannel Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Connect every channel to one smart agent
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              No need to switch between different apps. Customers reach you anywhere, AI answers instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 hover:border-[#7F22FE]/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center group">
              <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">WhatsApp Business</h3>
              <p className="text-[11px] text-neutral-500 mt-1">Official Meta Cloud API with 0% risk of account ban</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 hover:border-[#7F22FE]/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center group">
              <div className="w-10 h-10 mx-auto rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Facebook Messenger</h3>
              <p className="text-[11px] text-neutral-500 mt-1">Direct page inbox replies & automated comments</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 hover:border-[#7F22FE]/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center group">
              <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Instagram className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Instagram Direct</h3>
              <p className="text-[11px] text-neutral-500 mt-1">DM replies, Story & Reels automated inquiries</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 hover:border-[#7F22FE]/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center group">
              <div className="w-10 h-10 mx-auto rounded-xl bg-purple-100 dark:bg-purple-950/60 text-[#7F22FE] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Website AI Widget</h3>
              <p className="text-[11px] text-neutral-500 mt-1">1-line embeddable chatbot on your store or website</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
