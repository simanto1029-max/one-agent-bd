import React, { useState, useEffect } from 'react';
import {
  Globe,
  Bot,
  Copy,
  Check,
  Code2,
  Sparkles,
  Send,
  MessageSquare,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  ChevronRight,
  Palette,
  Sliders,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Store,
  Zap,
  Lock,
  Package,
  Mic,
  Square,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { api } from '../../api';
import { UserProfile, Product } from '../../types';
import { BrandLogo } from '../common/BrandLogo';

interface WebsiteWidgetViewProps {
  currentUser: UserProfile | null;
  onNavigateToInbox?: () => void;
}

export const WebsiteWidgetView: React.FC<WebsiteWidgetViewProps> = ({ currentUser, onNavigateToInbox }) => {
  const [activeGuideTab, setActiveGuideTab] = useState<'shopify' | 'wordpress' | 'html' | 'wix'>('shopify');
  const [copiedCode, setCopiedCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Widget settings
  const [botName, setBotName] = useState('Maya AI Sales Assistant');
  const [businessName, setBusinessName] = useState(currentUser?.business_name || 'My Online Shop');
  const [primaryColor, setPrimaryColor] = useState('#7F22FE');
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right');
  const [welcomeMessage, setWelcomeMessage] = useState('Hello! 🌟 Welcome to our store. How can I help you today? Feel free to ask about products, pricing, or place an order!');
  const [helplinePhone, setHelplinePhone] = useState('01811-998877');
  const [enableOrderTracking, setEnableOrderTracking] = useState(true);

  // Real store catalog products
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);

  // Live Simulation state
  const [isWidgetOpen, setIsWidgetOpen] = useState(true);
  const [simMessages, setSimMessages] = useState<
    Array<{ sender: 'user' | 'bot'; text: string; time: string; imageUrl?: string; isVoice?: boolean }>
  >([
    {
      sender: 'bot',
      text: 'Hello! 🌟 Welcome to our store. How can I help you today? Feel free to ask in Bangla, Banglish, or English—or send a voice note or photo!',
      time: 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [lastOrderDetected, setLastOrderDetected] = useState<any>(null);
  const [simImageB64, setSimImageB64] = useState<string | null>(null);
  const [simImageMime, setSimImageMime] = useState<string | null>(null);
  const [isSimRecording, setIsSimRecording] = useState(false);
  const simRecorderRef = React.useRef<MediaRecorder | null>(null);
  const simChunksRef = React.useRef<Blob[]>([]);
  const simFileRef = React.useRef<HTMLInputElement | null>(null);

  const agentId = currentUser?.id || 'usr_demo_1';
  const serverOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://oneagentbd.online';
  const embedSnippet = `<script src="${serverOrigin}/api/widget/embed.js" data-agent-id="${agentId}" defer></script>`;

  useEffect(() => {
    loadConfig();
    loadCatalogProducts();
  }, [currentUser]);

  const loadCatalogProducts = async () => {
    try {
      const res = await api.getProducts();
      if (res && res.products && Array.isArray(res.products)) {
        setCatalogProducts(res.products);
      }
    } catch {
      // Keep smart storefront feature cards if products endpoint is not populated yet
    }
  };

  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await api.getWidgetConfig(agentId);
      if (res.success && res.config) {
        setBotName(res.config.bot_name || 'Maya AI Sales Assistant');
        setBusinessName(res.config.business_name || currentUser?.business_name || 'My Online Shop');
        setPrimaryColor(res.config.primary_color || '#7F22FE');
        setPosition(res.config.position || 'bottom-right');
        setWelcomeMessage(res.config.welcome_message || welcomeMessage);
        setHelplinePhone(res.config.helpline_phone || '01811-998877');
        setEnableOrderTracking(res.config.enable_order_tracking !== false);

        // Update initial bot message in preview
        setSimMessages([
          {
            sender: 'bot',
            text: res.config.welcome_message || welcomeMessage,
            time: 'Just now'
          }
        ]);
      }
    } catch (err) {
      console.warn('Failed to load widget config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(embedSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.updateWidgetConfig({
        bot_name: botName,
        business_name: businessName,
        primary_color: primaryColor,
        position,
        welcome_message: welcomeMessage,
        helpline_phone: helplinePhone,
        enable_order_tracking: enableOrderTracking
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save widget settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSendSimMessage = async (
    customText?: string,
    audioBase64?: string,
    audioMimeType?: string
  ) => {
    const textToSend = (customText !== undefined ? customText : chatInput).trim();
    const imgB64 = simImageB64;
    const imgMime = simImageMime;
    if ((!textToSend && !imgB64 && !audioBase64) || isAiThinking) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSimMessages((prev) => [
      ...prev,
      {
        sender: 'user',
        text: textToSend || (audioBase64 ? '🎤 Voice Message' : ''),
        time: userTime,
        imageUrl: imgB64 || undefined,
        isVoice: Boolean(audioBase64)
      }
    ]);
    setChatInput('');
    setSimImageB64(null);
    setSimImageMime(null);
    setIsAiThinking(true);

    try {
      const res = await api.sendWidgetChat({
        agentId,
        visitorId: `demo_vis_${Date.now()}`,
        message: textToSend,
        customerName: 'Demo Website Visitor',
        imageBase64: imgB64 || undefined,
        imageMimeType: imgMime || undefined,
        audioBase64: audioBase64 || undefined,
        audioMimeType: audioMimeType || undefined
      });

      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setSimMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: res.reply || 'Thank you for your message! Our assistant will get back to you shortly.',
          time: botTime
        }
      ]);

      if (res.orderCreated && res.order) {
        setLastOrderDetected(res.order);
      }
    } catch (err: any) {
      setSimMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Hello! Our team has received your message and will provide full assistance shortly.',
          time: 'Just now'
        }
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleToggleSimVoice = async () => {
    if (isSimRecording && simRecorderRef.current) {
      setIsSimRecording(false);
      simRecorderRef.current.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      simChunksRef.current = [];
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) simChunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(simChunksRef.current, { type: rec.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          handleSendSimMessage(chatInput, reader.result as string, blob.type || 'audio/webm');
        };
        reader.readAsDataURL(blob);
      };
      simRecorderRef.current = rec;
      rec.start();
      setIsSimRecording(true);
    } catch {
      setSimMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Please allow microphone access in your browser to test voice notes.',
          time: 'Just now'
        }
      ]);
    }
  };

  const handleResetSim = () => {
    setSimMessages([
      {
        sender: 'bot',
        text: welcomeMessage,
        time: 'Just now'
      }
    ]);
    setLastOrderDetected(null);
  };

  const colorPresets = [
    { label: 'One Purple', hex: '#7F22FE' },
    { label: 'WhatsApp Green', hex: '#10B981' },
    { label: 'Messenger Blue', hex: '#2563EB' },
    { label: 'Ruby Rose', hex: '#E11D48' },
    { label: 'Amber Gold', hex: '#D97706' },
    { label: 'Dark Slate', hex: '#1E293B' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              SaaS Website Addon
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              Live & Active
            </span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
            Website AI Chatbot Agent
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Integrate our AI chatbot onto any website (Shopify, WooCommerce, WordPress, Custom Site) in 1 line of code. Automatically interact with visitors and send captured orders straight to your Orders Hub!
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToInbox && (
            <button
              onClick={onNavigateToInbox}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-violet-600" />
              View Website Inbox
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Code + Settings on Left, Interactive Simulator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Embed Code & Customizer (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1-Click Embed Snippet Card */}
          <div className="p-5 rounded-3xl bg-neutral-900 text-white shadow-xl border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-600/30 text-violet-400 flex items-center justify-center font-mono text-sm font-bold">
                  &lt;/&gt;
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Your Website 1-Line Embed Script</h3>
                  <p className="text-[11px] text-neutral-400">Copy and paste this script tag anywhere before the &lt;/body&gt; tag on your website.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-violet-600/30 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Script Code'}</span>
              </button>
            </div>

            {/* Code Box */}
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-violet-300 break-all select-all flex items-center justify-between gap-2">
              <code>{embedSnippet}</code>
            </div>

            {/* Platform Guides */}
            <div className="pt-2 border-t border-neutral-800 space-y-2.5">
              <div className="text-xs font-semibold text-neutral-300">Quick Installation Guides:</div>
              <div className="flex gap-1.5 text-xs">
                {(['shopify', 'wordpress', 'html', 'wix'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveGuideTab(tab)}
                    className={`px-3 py-1.5 rounded-xl capitalize font-bold transition-colors cursor-pointer ${
                      activeGuideTab === tab
                        ? 'bg-violet-600 text-white'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {tab === 'html' ? 'Custom HTML/React' : tab}
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-neutral-800/60 text-xs text-neutral-300 leading-relaxed">
                {activeGuideTab === 'shopify' && (
                  <div>
                    <strong>Shopify Installation:</strong> Go to Shopify Admin &rarr; <strong>Online Store</strong> &rarr; <strong>Themes</strong> &rarr; Click <strong>... (Actions)</strong> &rarr; <strong>Edit code</strong>. Open <code>theme.liquid</code>, scroll to bottom, paste the code right above <code>&lt;/body&gt;</code>, and click <strong>Save</strong>. Done!
                  </div>
                )}
                {activeGuideTab === 'wordpress' && (
                  <div>
                    <strong>WordPress / WooCommerce Installation:</strong> Install the free plugin <em>"Insert Headers and Footers"</em> (or <em>WPCode</em>). Go to Settings &rarr; Insert Headers and Footers &rarr; Paste into the <strong>Scripts in Footer</strong> box &rarr; Click <strong>Save</strong>.
                  </div>
                )}
                {activeGuideTab === 'html' && (
                  <div>
                    <strong>HTML / React / Next.js:</strong> Add the script tag to your public <code>index.html</code> right before <code>&lt;/body&gt;</code>. In Next.js, use <code>&lt;Script src="..." /&gt;</code> in your root layout.
                  </div>
                )}
                {activeGuideTab === 'wix' && (
                  <div>
                    <strong>Wix / Squarespace:</strong> Go to Settings &rarr; Custom Code &rarr; Add Custom Code &rarr; Paste script code, choose placement <em>"Body - end"</em> &rarr; Click <strong>Apply</strong>.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customizer Settings Form */}
          <form onSubmit={handleSaveSettings} className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-violet-600" />
                <h3 className="font-bold text-neutral-900 dark:text-white">Customize Website Chatbot</h3>
              </div>
              <span className="text-xs text-neutral-400">Updates reflect instantly</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  AI Agent Name:
                </label>
                <input
                  type="text"
                  value={botName}
                  onChange={e => setBotName(e.target.value)}
                  placeholder="e.g. Maya AI Assistant"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Store / Business Title:
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="e.g. BD Fashion House"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Chatbot Theme Color:
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {colorPresets.map(preset => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setPrimaryColor(preset.hex)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      primaryColor.toLowerCase() === preset.hex.toLowerCase()
                        ? 'border-neutral-900 dark:border-white ring-2 ring-violet-500/30'
                        : 'border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: preset.hex }} />
                    <span className="text-neutral-700 dark:text-neutral-300">{preset.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-neutral-200"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="w-32 px-3 py-2 text-xs font-mono rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Welcome Message:
              </label>
              <textarea
                rows={3}
                value={welcomeMessage}
                onChange={e => setWelcomeMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Widget Position:
                </label>
                <select
                  value={position}
                  onChange={e => setPosition(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white"
                >
                  <option value="bottom-right">Bottom Right (Recommended)</option>
                  <option value="bottom-left">Bottom Left</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Helpline Phone:
                </label>
                <input
                  type="text"
                  value={helplinePhone}
                  onChange={e => setHelplinePhone(e.target.value)}
                  placeholder="e.g. 01811-998877"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {saveSuccess ? (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Website Chatbot Settings Saved!
                </span>
              ) : (
                <div />
              )}

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-violet-600/20 cursor-pointer disabled:opacity-50"
              >
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Website Mockup & Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-3xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                  Live Interactive Website Preview
                </span>
              </div>
              <button
                onClick={handleResetSim}
                className="text-[11px] text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 flex items-center gap-1 cursor-pointer"
                title="Reset simulation chat"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Chat
              </button>
            </div>

            {/* Mock Website Container */}
            <div className="relative w-full h-[580px] rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 overflow-hidden shadow-inner flex flex-col justify-between">
              {/* Fake Website Header */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-[11px] text-neutral-600 dark:text-neutral-300 font-mono">
                    <Lock className="w-3 h-3 text-emerald-500" />
                    <span className="truncate max-w-[140px] sm:max-w-[200px]">
                      https://{(businessName || 'store').toLowerCase().replace(/[^a-z0-9]/g, '')}.com
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Preview
                </div>
              </div>

              {/* Realistic Store Mockup Background */}
              <div className="p-4 space-y-3.5 overflow-hidden flex-1 select-none">
                {/* Store Top Nav */}
                <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs">
                      <Store className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-extrabold text-xs text-neutral-900 dark:text-white truncate max-w-[140px]">
                      {businessName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-neutral-500 dark:text-neutral-400">
                    <span className="hidden sm:inline hover:text-neutral-900 dark:hover:text-white">Catalog</span>
                    <span className="hidden sm:inline hover:text-neutral-900 dark:hover:text-white">Track Order</span>
                    <div className="w-6 h-6 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                      <ShoppingBag className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                {/* Hero Banner */}
                <div className="rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-850 to-neutral-900 text-white p-4 relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 rounded-full bg-violet-500/20 blur-2xl pointer-events-none" />
                  <div className="relative z-10 space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-semibold text-violet-200">
                      <Sparkles className="w-3 h-3 text-violet-400" />
                      <span>AI Shopping Assistant Active</span>
                    </div>
                    <div className="text-sm font-black text-white leading-tight">
                      Welcome to {businessName}
                    </div>
                    <div className="text-[11px] text-neutral-300 leading-snug max-w-[280px]">
                      Instant stock inquiries, fast ordering & 24/7 autonomous support right in your chat.
                    </div>
                    <div className="flex items-center gap-2 pt-1 text-[9px] text-neutral-400">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> Nationwide Courier
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> Cash on Delivery
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Store Showcase or Smart Feature Cards */}
                {catalogProducts.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                      <span className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-violet-500" />
                        Featured In-Stock Products
                      </span>
                      <span className="text-[10px] text-neutral-400 font-normal">
                        Click to ask AI
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {catalogProducts.slice(0, 2).map((prod) => (
                        <div
                          key={prod.id || prod.name}
                          onClick={() => {
                            setIsWidgetOpen(true);
                            handleSendSimMessage(`What is the price of ${prod.name}?`);
                          }}
                          className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700 hover:border-violet-500 transition-all cursor-pointer group"
                        >
                          {prod.image_url ? (
                            <img
                              src={prod.image_url}
                              alt={prod.name}
                              className="w-full h-16 object-cover rounded-lg mb-1.5 group-hover:scale-[1.02] transition-transform"
                            />
                          ) : (
                            <div className="w-full h-16 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-neutral-400 mb-1.5">
                              <ShoppingBag className="w-5 h-5" />
                            </div>
                          )}
                          <div className="text-[11px] font-bold text-neutral-900 dark:text-white truncate">
                            {prod.name}
                          </div>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                              ৳{Number(prod.price).toLocaleString()} BDT
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-medium">
                              In Stock
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/70 dark:border-neutral-700/70 space-y-1">
                      <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div className="text-[11px] font-bold text-neutral-900 dark:text-white">
                        AI Instant Checkout
                      </div>
                      <div className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">
                        Orders are captured directly in the chat and forwarded to Orders Hub.
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/70 dark:border-neutral-700/70 space-y-1">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="text-[11px] font-bold text-neutral-900 dark:text-white">
                        Courier Integration
                      </div>
                      <div className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">
                        Syncs customer address & phone with Steadfast or Pathao automatically.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating Widget Mockup (Matches ChatMakky dark chatbox & compact button) */}
              <div className={`absolute bottom-3 ${position === 'bottom-left' ? 'left-3' : 'right-3'} z-20 flex flex-col items-end`}>
                {isWidgetOpen ? (
                  <div className="w-[295px] sm:w-[315px] h-[410px] rounded-[18px] bg-[#050507] border border-white/10 shadow-2xl flex flex-col overflow-hidden mb-2 animate-in zoom-in-95 duration-150">
                    {/* Minimal Dark Header */}
                    <div className="px-3 py-2.5 bg-[#0B0B0F] border-b border-white/10 text-neutral-200 flex items-center justify-center text-[11px] font-semibold">
                      {businessName || 'One Agent BD'}
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-3 overflow-y-auto bg-[#050507] space-y-3 text-xs">
                      {simMessages.map((msg, idx) =>
                        msg.sender === 'bot' ? (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center p-1 shrink-0 mt-0.5">
                              <BrandLogo size="xs" className="w-full h-full" />
                            </div>
                            <div className="bg-[#1C1D22] text-white px-3.5 py-2.5 rounded-2xl max-w-[82%] leading-relaxed whitespace-pre-line border border-white/5">
                              {msg.text}
                            </div>
                          </div>
                        ) : (
                          <div key={idx} className="flex flex-col items-end">
                            <div className="bg-[#2B3FD6] text-white px-3.5 py-2 rounded-2xl max-w-[82%] leading-relaxed whitespace-pre-line">
                              {msg.imageUrl && (
                                <img
                                  src={msg.imageUrl}
                                  alt="Preview"
                                  className="max-w-full max-h-28 rounded-lg object-cover mb-1.5"
                                />
                              )}
                              {msg.text}
                            </div>
                          </div>
                        )
                      )}

                      {isAiThinking && (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center p-1 shrink-0">
                            <BrandLogo size="xs" className="w-full h-full" />
                          </div>
                          <div className="bg-[#1C1D22] text-neutral-300 px-3 py-2 rounded-2xl text-[11px] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-ping" />
                            <span>Thinking...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {simImageB64 && (
                      <div className="mx-2.5 mb-1 px-2.5 py-1.5 rounded-xl bg-[#1C1D22] border border-white/10 flex items-center justify-between text-[10px] text-neutral-200">
                        <span className="truncate">🖼️ Image ready to send</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSimImageB64(null);
                            setSimImageMime(null);
                          }}
                          className="text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Pill Chat Input + Powered by Footer */}
                    <div className="px-2.5 pt-1 pb-2 bg-[#050507]">
                      <div className="bg-[#1C1D22] border border-white/10 rounded-full pl-3 pr-1.5 py-1 flex items-center gap-2">
                        <input
                          ref={simFileRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              setSimImageB64(ev.target?.result as string);
                              setSimImageMime(file.type || 'image/jpeg');
                            };
                            reader.readAsDataURL(file);
                            e.target.value = '';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => simFileRef.current?.click()}
                          title="Upload Image"
                          className="text-neutral-300 hover:text-white shrink-0 cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleToggleSimVoice}
                          title={isSimRecording ? 'Stop & Send Voice' : 'Record Voice'}
                          className={`shrink-0 cursor-pointer ${
                            isSimRecording
                              ? 'text-rose-500 animate-pulse'
                              : 'text-neutral-300 hover:text-white'
                          }`}
                        >
                          {isSimRecording ? <Square className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                        </button>
                        <input
                          type="text"
                          value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSendSimMessage()}
                          placeholder="Type a message..."
                          className="flex-1 min-w-0 bg-transparent text-xs text-white placeholder-neutral-400 outline-none"
                        />
                        <button
                          onClick={() => handleSendSimMessage()}
                          disabled={(!chatInput.trim() && !simImageB64) || isAiThinking}
                          className="w-7 h-7 rounded-full bg-[#2538B8] text-white flex items-center justify-center disabled:opacity-40 cursor-pointer shrink-0"
                        >
                          <Send className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-center mt-1.5 text-[10px] text-neutral-400">
                        Powered by One Agent BD
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsWidgetOpen(true)}
                    className="relative mb-2.5 bg-[#1C1D21] text-white px-3.5 py-2 rounded-xl shadow-lg text-xs font-medium cursor-pointer"
                  >
                    Hey, Need help?
                    <div className="absolute -bottom-1 right-4 w-2.5 h-2.5 bg-[#1C1D21] rotate-45" />
                  </div>
                )}

                {/* Compact Circular Toggle Button */}
                <button
                  onClick={() => setIsWidgetOpen(!isWidgetOpen)}
                  className={`w-12 h-12 rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-all cursor-pointer ${
                    isWidgetOpen
                      ? 'bg-[#2B3FD6] text-white'
                      : 'bg-white text-neutral-900 border border-neutral-100'
                  }`}
                >
                  {isWidgetOpen ? (
                    <span className="text-xl leading-none font-light">&times;</span>
                  ) : (
                    <BrandLogo size="sm" className="w-7 h-7" />
                  )}
                </button>
              </div>
            </div>

            {/* Live Order Created Alert (if test captured order) */}
            {lastOrderDetected && (
              <div className="mt-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5 animate-in slide-in-from-bottom-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div className="text-xs text-neutral-800 dark:text-neutral-200 leading-snug">
                  <strong>Autonomous Order Extracted!</strong>
                  <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                    Order for <strong>{lastOrderDetected.customer_phone}</strong> ({lastOrderDetected.items}) automatically saved to your <strong>Orders Hub</strong>!
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
