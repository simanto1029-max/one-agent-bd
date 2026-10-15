import React, { useState, useEffect } from 'react';
import {
  Globe,
  Copy,
  Check,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Sliders,
  CheckCircle2,
  Zap,
  Lock,
  PackageCheck
} from 'lucide-react';
import { api } from '../../api';
import { UserProfile } from '../../types';
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

  const agentId = currentUser?.id || 'usr_demo_1';
  const serverOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://oneagentbd.online';
  const embedSnippet = `<script src="${serverOrigin}/api/widget/embed.js" data-agent-id="${agentId}" defer></script>`;

  useEffect(() => {
    loadConfig();
  }, [currentUser]);

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
      }
    } catch (err) {
      console.error('Failed to load widget config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
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
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
            Website AI Chatbot Agent
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Embed your autonomous AI sales assistant on any website (Shopify, WordPress, Wix, or Custom HTML) in 30 seconds.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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

      {/* Main Grid: Code + Settings on Left, Live Appearance Preview on Right */}
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
              <div className="flex flex-wrap gap-1.5 text-xs">
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white leading-relaxed resize-none"
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

        {/* Right Column: Live Appearance Preview & System Status (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-violet-600" />
                <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                  Live Widget Appearance Preview
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>

            {/* Visual Preview Box */}
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-850/60 border border-neutral-200/80 dark:border-neutral-700/80 min-h-[260px] flex flex-col justify-end relative overflow-hidden">
              <div className="absolute top-3 left-3 text-[10px] text-neutral-400 font-mono">
                Placement: {position === 'bottom-right' ? 'Bottom Right' : 'Bottom Left'}
              </div>

              {/* Floating Widget Bubble & Greeting Callout */}
              <div className={`flex flex-col ${position === 'bottom-left' ? 'items-start' : 'items-end'} space-y-2.5`}>
                {/* Greeting Bubble Preview */}
                <div className="max-w-[280px] p-3 rounded-2xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs shadow-lg border border-neutral-200/70 dark:border-neutral-700 relative">
                  <div className="font-bold text-[11px] text-violet-600 dark:text-violet-400 mb-0.5">
                    {botName}
                  </div>
                  <div className="text-[11px] leading-relaxed line-clamp-3">
                    {welcomeMessage}
                  </div>
                  <div
                    className={`absolute -bottom-1 ${position === 'bottom-left' ? 'left-4' : 'right-4'} w-2.5 h-2.5 bg-white dark:bg-neutral-800 rotate-45 border-r border-b border-neutral-200/70 dark:border-neutral-700`}
                  />
                </div>

                {/* Floating Action Button */}
                <div
                  style={{ backgroundColor: primaryColor }}
                  className="w-12 h-12 rounded-full shadow-xl flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform"
                >
                  <BrandLogo size="sm" className="w-6 h-6 brightness-0 invert" />
                </div>
              </div>
            </div>

            {/* Feature Highlights Card */}
            <div className="space-y-2.5 pt-2">
              <h4 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                Autonomous Capabilities
              </h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2.5 text-xs text-neutral-600 dark:text-neutral-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Instant Order Confirmation:</strong> Customers can order directly inside the chat window.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-neutral-600 dark:text-neutral-400">
                  <PackageCheck className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                  <span><strong>Live Parcel Tracking:</strong> Automated status tracking synced with Steadfast/Pathao.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-neutral-600 dark:text-neutral-400">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>Bangla & Voice Ready:</strong> Recognizes voice notes, Bangla, Banglish, and images.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-neutral-600 dark:text-neutral-400">
                  <Lock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span><strong>Enterprise Security:</strong> SSL encrypted, zero cross-site leakage, CORS protected.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
