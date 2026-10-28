import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Facebook,
  Instagram,
  Trash2,
  Copy,
  Check,
  ShieldAlert,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  MessageSquare,
  Settings,
  Save,
  ShieldCheck,
  Plus,
  QrCode,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Info,
  Lock,
  ArrowRight,
  Bot,
  Globe,
  ShoppingBag,
  Store,
  TrendingUp,
  X
} from 'lucide-react';
import { api } from '../../api';
import { Channel, UserProfile, SubscriptionStatusInfo, Agent, StoreIntegration } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import { MetaAutoConnectModal } from './MetaAutoConnectModal';
import { FacebookLogo, InstagramLogo, WhatsAppLogo, MessengerLogo } from '../common/BrandLogos';
import { ToggleSwitch } from '../common/ToggleSwitch';

interface ChannelsViewProps {
  channels: Channel[];
  currentUser?: UserProfile | null;
  subStatus?: SubscriptionStatusInfo | null;
  onRefresh: () => void;
  onOpenWebhookTester?: () => void;
  onNavigate?: (tab: string) => void;
}

export const ChannelsView: React.FC<ChannelsViewProps> = ({
  channels,
  currentUser,
  subStatus,
  onRefresh,
  onOpenWebhookTester,
  onNavigate
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const isWhatsAppLockedInTrial =
    !isAdmin &&
    Boolean(
      subStatus?.isTrialActive ||
      subStatus?.subscription?.status === 'trialing' ||
      subStatus?.planId === 'plan_trial'
    );

  // View mode: 'channels' (3 horizontal cards) or 'admin_setup' (Admin-only Meta App ID & Secret setup)
  const [viewMode, setViewMode] = useState<'channels' | 'admin_setup'>('channels');

  // Auto-Connect Modal State
  const [isAutoConnectModalOpen, setIsAutoConnectModalOpen] = useState(false);
  const [autoConnectPlatform, setAutoConnectPlatform] = useState<'messenger' | 'instagram' | 'whatsapp'>('messenger');

  // Alerts & Feedback
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Channel testing & deletion
  const [testingChannelId, setTestingChannelId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ [id: string]: { success: boolean; message: string } }>({});
  const [channelToDelete, setChannelToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [runningFollowUps, setRunningFollowUps] = useState(false);

  // Auto Comment Reply & Smart Follow-up Settings State
  const [autoCommentEnabled, setAutoCommentEnabled] = useState(true);
  const [sendPrivateInboxOnComment, setSendPrivateInboxOnComment] = useState(true);
  const [publicCommentTemplate, setPublicCommentTemplate] = useState(
    'Thank you {customer_name}! ❤️ We have sent a detailed reply and product details to your Inbox (Messenger/DM). Please check your inbox! 📩'
  );
  const [autoFollowUpEnabled, setAutoFollowUpEnabled] = useState(true);
  const [followUpDelayMinutes, setFollowUpDelayMinutes] = useState(45);
  const [followUpTemplate, setFollowUpTemplate] = useState(
    'Hello {customer_name}! 😊 You messaged our page earlier. Do you have any questions about our products or ordering? To confirm your order, simply reply with your Name, Full Address, and Phone Number—our AI will book your order right away! ❤️'
  );
  const [savingAutomation, setSavingAutomation] = useState(false);

  // Optimistic local channels state so connected pages immediately display on screen
  const [localChannels, setLocalChannels] = useState<Channel[]>(channels);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);

  useEffect(() => {
    setLocalChannels(channels);
  }, [channels]);

  useEffect(() => {
    api.getAgents().then((res) => {
      if (res.agents) setAvailableAgents(res.agents);
    }).catch(() => {});
  }, []);

  // Website & Store connection state
  const [stores, setStores] = useState<StoreIntegration[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [showConnectStoreModal, setShowConnectStoreModal] = useState(false);
  const [storePlatform, setStorePlatform] = useState<'shopify' | 'woocommerce' | 'custom_website'>('woocommerce');
  const [storeName, setStoreName] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [storeApiKey, setStoreApiKey] = useState('');
  const [submittingStore, setSubmittingStore] = useState(false);
  const [testingStoreSyncId, setTestingStoreSyncId] = useState<string | null>(null);
  const [storeToDelete, setStoreToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingStore, setIsDeletingStore] = useState(false);

  const loadStores = async () => {
    try {
      setLoadingStores(true);
      const res = await api.getStores();
      if (res?.stores) {
        setStores(res.stores);
      }
    } catch (err) {
      console.error('Failed to load stores:', err);
    } finally {
      setLoadingStores(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const handleConnectStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      setError('Please provide a store name');
      return;
    }
    try {
      setSubmittingStore(true);
      setError(null);
      const res = await api.connectStore({
        platform: storePlatform,
        store_name: storeName.trim(),
        store_url: storeUrl.trim(),
        api_key: storeApiKey.trim()
      });
      setShowConnectStoreModal(false);
      setStoreName('');
      setStoreUrl('');
      setStoreApiKey('');
      setSuccessMessage(res.message || 'Website / Store connected successfully!');
      await loadStores();
    } catch (err: any) {
      setError(err?.message || 'Failed to connect store');
    } finally {
      setSubmittingStore(false);
    }
  };

  const handleTestStoreSync = async (storeId: string) => {
    try {
      setTestingStoreSyncId(storeId);
      setError(null);
      const res = await api.testStoreSync(storeId);
      setSuccessMessage(`Store Synced! New order captured: #${res.order?.id?.slice(-6).toUpperCase() || 'ORD'} (৳${res.order?.total_amount || 0})`);
      await loadStores();
      onRefresh();
    } catch (err: any) {
      setError(err?.message || 'Failed to sync store orders');
    } finally {
      setTestingStoreSyncId(null);
    }
  };

  const handleConfirmDeleteStore = async () => {
    if (!storeToDelete) return;
    try {
      setIsDeletingStore(true);
      await api.deleteStore(storeToDelete.id);
      setSuccessMessage(`Store "${storeToDelete.name}" disconnected.`);
      setStoreToDelete(null);
      await loadStores();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete store');
    } finally {
      setIsDeletingStore(false);
    }
  };

  const handleAssignAgentToChannel = async (channelId: string, agentId: string) => {
    try {
      const agent = availableAgents.find((a) => a.id === agentId);
      if (agent) {
        const currentAssigned = agent.assigned_channels || [];
        const nextChannels = currentAssigned.includes(channelId) ? currentAssigned : [...currentAssigned, channelId];
        await api.updateAgent(agent.id, { assigned_channels: nextChannels });
        setLocalChannels((prev) =>
          prev.map((c) =>
            c.id === channelId
              ? { ...c, agent_id: agent.id, agent_name: agent.name, business_name: agent.business_name }
              : c
          )
        );
        setSuccessMessage(`Assigned to AI Agent "${agent.name}" (${agent.business_name})!`);
      } else {
        // Unassign / default
        setLocalChannels((prev) =>
          prev.map((c) => (c.id === channelId ? { ...c, agent_id: undefined, agent_name: undefined } : c))
        );
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update channel agent.');
    }
  };

  // Admin-only Meta App Setup state
  const [publicTunnelUrl, setPublicTunnelUrl] = useState<string | null>(null);
  const [metaConfig, setMetaConfig] = useState<{
    configured: boolean;
    appId?: string;
    configId?: string;
    redirectUri?: string;
  } | null>(null);
  const [metaAppIdInput, setMetaAppIdInput] = useState('');
  const [metaAppSecretInput, setMetaAppSecretInput] = useState('');
  const [metaConfigIdInput, setMetaConfigIdInput] = useState('');
  const [savingMetaConfig, setSavingMetaConfig] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      api
        .getPublicUrl()
        .then((res) => {
          if (res.publicUrl) setPublicTunnelUrl(res.publicUrl);
        })
        .catch(() => {});
    }

    api
      .getMetaConfig()
      .then((cfg) => {
        setMetaConfig(cfg);
        if (cfg.appId) setMetaAppIdInput(cfg.appId);
        if (cfg.configId) setMetaConfigIdInput(cfg.configId);
      })
      .catch(() => {});

    api
      .getAutomationSettings()
      .then((settings) => {
        setAutoCommentEnabled(settings.auto_comment_reply_enabled !== false);
        setSendPrivateInboxOnComment(settings.send_private_inbox_on_comment !== false);
        if (settings.public_comment_reply_template) {
          setPublicCommentTemplate(settings.public_comment_reply_template);
        }
        setAutoFollowUpEnabled(settings.auto_followup_enabled !== false);
        if (settings.followup_delay_minutes) {
          setFollowUpDelayMinutes(settings.followup_delay_minutes);
        }
        if (settings.followup_message_template) {
          setFollowUpTemplate(settings.followup_message_template);
        }
      })
      .catch(() => {});

    // Check URL params if redirected from Meta OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const metaAuth = urlParams.get('meta_auth');
    const metaError = urlParams.get('meta_error');
    const metaPlatform = (urlParams.get('platform') as 'messenger' | 'instagram' | 'whatsapp') || 'messenger';

    if (metaAuth === 'success') {
      setAutoConnectPlatform(metaPlatform);
      setIsAutoConnectModalOpen(true);
      setSuccessMessage('Meta account verified! Please select your Page to complete connection.');
      // Clean query params from URL without reload
      try {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
      } catch (_e) {}
    } else if (metaError) {
      const decodedErr = decodeURIComponent(metaError);
      setError(decodedErr);
      setAutoConnectPlatform(metaPlatform);
      setIsAutoConnectModalOpen(true);
      try {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
      } catch (_e) {}
    }

    // Listen for Popup postMessage from Meta OAuth callback
    const handlePopupMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'META_OAUTH_SUCCESS') {
        const plat = (data.platform as 'messenger' | 'instagram' | 'whatsapp') || 'messenger';
        setAutoConnectPlatform(plat);
        setIsAutoConnectModalOpen(true);
        setSuccessMessage('Meta authorization successful! Please select your Page to activate AI.');
      } else if (data.type === 'META_OAUTH_ERROR') {
        const plat = (data.platform as 'messenger' | 'instagram' | 'whatsapp') || 'messenger';
        setAutoConnectPlatform(plat);
        setIsAutoConnectModalOpen(true);
        setError(data.error || 'Meta login was not completed.');
      }
    };

    // Cross-window / popup localStorage synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'oneagentbd_oauth_result' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data && typeof data === 'object') {
            const plat = (data.platform as 'messenger' | 'instagram' | 'whatsapp') || 'messenger';
            setAutoConnectPlatform(plat);
            setIsAutoConnectModalOpen(true);
            if (data.type === 'META_OAUTH_SUCCESS') {
              setSuccessMessage('Meta authorization successful! Please select your Page to activate AI.');
            } else if (data.type === 'META_OAUTH_ERROR') {
              setError(data.error || 'Meta authorization was not completed.');
            }
          }
          localStorage.removeItem('oneagentbd_oauth_result');
        } catch (_err) {}
      }
    };

    window.addEventListener('message', handlePopupMessage);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('message', handlePopupMessage);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAdmin]);

  const getEffectiveOrigin = () => {
    if (publicTunnelUrl) return publicTunnelUrl;
    if (typeof window !== 'undefined') {
      if (window.location.hostname === 'oneagentbd.online') {
        return 'https://www.oneagentbd.online';
      }
      return window.location.origin;
    }
    return 'https://www.oneagentbd.online';
  };
  const effectiveOrigin = getEffectiveOrigin();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Single-Click Connect Handler for each of the 3 horizontal boxes
  const handleConnectClick = (targetPlatform: 'messenger' | 'instagram' | 'whatsapp') => {
    if (targetPlatform === 'whatsapp' && isWhatsAppLockedInTrial) {
      if (onNavigate) {
        onNavigate('billing');
      }
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setAutoConnectPlatform(targetPlatform);
    setIsAutoConnectModalOpen(true);
  };

  // Verify Channel Connection Health with Meta Graph API
  const handleTestChannel = async (channelId: string) => {
    try {
      setTestingChannelId(channelId);
      const report = await api.verifyMetaTokens(channelId);
      const item = report.results?.[0];
      setTestResult((prev) => ({
        ...prev,
        [channelId]: {
          success: Boolean(item?.valid),
          message: item?.valid
            ? 'Connected & Graph API Verified ✓'
            : item?.error || 'Token verification failed'
        }
      }));
      onRefresh();
    } catch (err: any) {
      setTestResult((prev) => ({
        ...prev,
        [channelId]: { success: false, message: err.message || 'Connection check failed' }
      }));
    } finally {
      setTestingChannelId(null);
    }
  };

  // Confirm Disconnect Channel
  const handleConfirmDelete = async () => {
    if (!channelToDelete) return;
    try {
      setIsDeleting(true);
      await api.deleteChannel(channelToDelete.id);
      setSuccessMessage(`"${channelToDelete.name}" has been disconnected successfully.`);
      setChannelToDelete(null);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect channel.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 1-Click Toggle AI Agent Active/Pause on a connected channel (Instant optimistic update)
  const handleToggleChannelActive = async (channelId: string) => {
    try {
      setLocalChannels((prev) =>
        prev.map((c) => (c.id === channelId ? { ...c, is_active: !c.is_active } : c))
      );
      await api.toggleChannel(channelId);
      onRefresh();
    } catch (err: any) {
      setLocalChannels(channels);
      setError(err.message || 'Failed to toggle AI Auto-Reply on this channel.');
    }
  };

  // Toggle Comment Auto-Reply or Auto Follow-up on a connected channel
  const handleToggleAutomation = async (
    channel: Channel,
    field: 'auto_comment_reply' | 'auto_followup_enabled'
  ) => {
    try {
      const currentVal = channel[field] !== false; // default true
      const nextVal = !currentVal;
      setLocalChannels((prev) =>
        prev.map((c) => (c.id === channel.id ? { ...c, [field]: nextVal } : c))
      );
      await api.updateChannelAutomation(channel.id, {
        [field]: nextVal
      });
      onRefresh();
    } catch (err: any) {
      setLocalChannels(channels);
      setError(err.message || 'Failed to update automation settings.');
    }
  };

  // Trigger Smart Auto Follow-up Engine
  const handleRunFollowUps = async () => {
    try {
      setRunningFollowUps(true);
      setError(null);
      setSuccessMessage(null);
      const res = await api.runAutoFollowUps();
      if (res.followUpsSent > 0) {
        setSuccessMessage(
          `Successfully sent automated follow-up messages to ${res.followUpsSent} customer(s)!`
        );
      } else {
        setSuccessMessage(
          `Checked all conversations (${res.checkedConversations}) — no pending follow-ups right now. (Auto-checked every 15 minutes in the background)`
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send follow-up messages.');
    } finally {
      setRunningFollowUps(false);
    }
  };

  // Save Auto Comment & Follow-up Settings
  const handleSaveAutomationSettings = async (overrides?: {
    auto_comment_reply_enabled?: boolean;
    send_private_inbox_on_comment?: boolean;
    auto_followup_enabled?: boolean;
    followup_delay_minutes?: number;
  }) => {
    try {
      setSavingAutomation(true);
      setError(null);
      const payload = {
        auto_comment_reply_enabled:
          overrides?.auto_comment_reply_enabled !== undefined
            ? overrides.auto_comment_reply_enabled
            : autoCommentEnabled,
        public_comment_reply_template: publicCommentTemplate,
        send_private_inbox_on_comment:
          overrides?.send_private_inbox_on_comment !== undefined
            ? overrides.send_private_inbox_on_comment
            : sendPrivateInboxOnComment,
        auto_followup_enabled:
          overrides?.auto_followup_enabled !== undefined
            ? overrides.auto_followup_enabled
            : autoFollowUpEnabled,
        followup_delay_minutes:
          overrides?.followup_delay_minutes !== undefined
            ? overrides.followup_delay_minutes
            : followUpDelayMinutes,
        followup_message_template: followUpTemplate
      };
      await api.updateAutomationSettings(payload);
      setSuccessMessage('Auto Comment Reply and Follow-up settings saved successfully!');
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save settings.');
    } finally {
      setSavingAutomation(false);
    }
  };

  // Save Admin Meta App Credentials
  const handleSaveMetaConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingMetaConfig(true);
      setError(null);
      setSuccessMessage(null);
      const res = await api.updateMetaConfig({
        appId: metaAppIdInput.trim(),
        appSecret: metaAppSecretInput.trim(),
        configId: metaConfigIdInput.trim() || undefined
      });
      setMetaConfig(res.config);
      setSuccessMessage('Meta App ID, Secret & Embedded Signup Config saved! 1-Click login active.');
    } catch (err: any) {
      setError(err.message || 'Failed to save Meta configuration.');
    } finally {
      setSavingMetaConfig(false);
    }
  };

  const allChannels = localChannels.length > 0 ? localChannels : channels;
  const facebookChannels = allChannels.filter(
    (c) => c.platform === 'messenger' || (c.platform as any) === 'facebook'
  );
  const instagramChannels = allChannels.filter((c) => c.platform === 'instagram');
  const whatsappChannels = allChannels.filter((c) => c.platform === 'whatsapp');

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            {viewMode === 'admin_setup' ? 'Meta Master App Setup (Admin Only)' : 'Channels (Meta)'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {viewMode === 'admin_setup'
              ? 'Configure your SaaS platform Master Meta App ID & Secret once here.'
              : 'Connect any channel with 1-Click — simply select your account and page to activate AI Auto-Reply.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('agents')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[#7C3AED] dark:text-purple-300 hover:bg-purple-100 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>AI Agents Hub ({availableAgents.length})</span>
            </button>
          )}

          {/* Admin-Only Controls (Hidden from normal users) */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'admin_setup' ? 'channels' : 'admin_setup')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                viewMode === 'admin_setup'
                  ? 'bg-[#7F22FE] border-[#7F22FE] text-white shadow-md shadow-[#7F22FE]/20'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              {viewMode === 'admin_setup' ? (
                <>
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Channels</span>
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4 text-[#7F22FE]" />
                  <span>Admin: Meta App Setup</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Feedback Alerts */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-xs font-bold hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-xs font-bold hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* VIEW 1: 3 COMPACT CHANNEL BOXES (FACEBOOK, INSTAGRAM, WHATSAPP) */}
      {viewMode === 'channels' && (
        <div className="space-y-5 animate-fade-in">
          {/* Sleek Collapsible Troubleshoot & Webhook Quick Guide */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-purple-500/20 bg-white/70 dark:bg-[#120B2E]/70 backdrop-blur-sm overflow-hidden shadow-xs transition-all">
            <button
              type="button"
              onClick={() => setShowTroubleshoot(!showTroubleshoot)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-left cursor-pointer hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-[#7F22FE] dark:text-purple-300 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Troubleshooting &amp; Webhook Setup Guide
                  </span>
                  <span className="hidden sm:inline text-[11px] text-slate-400 dark:text-slate-500 ml-2">
                    Quick checklist if messages don&apos;t receive auto-replies
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7F22FE] dark:text-purple-400 shrink-0">
                <span>{showTroubleshoot ? 'Close' : 'View Guide'}</span>
                {showTroubleshoot ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {showTroubleshoot && (
              <div className="p-4 pt-2 border-t border-slate-200/60 dark:border-purple-500/15 space-y-3 text-xs text-slate-600 dark:text-slate-300 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#18103A] border border-slate-200/70 dark:border-purple-500/15 space-y-1">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[9px] font-black">1</span>
                      <span>Page / Number Connected?</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Ensure your Page ID &amp; Token are connected in the Facebook card below so the server can authorize replies.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#18103A] border border-slate-200/70 dark:border-purple-500/15 space-y-1">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[9px] font-black">2</span>
                      <span>Webhook Subscription</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      In Meta Developer Console &gt; Webhooks, ensure your Page is Subscribed to <code className="px-1 py-0.5 rounded bg-slate-200/70 dark:bg-purple-900/40 text-[10px]">messages</code>.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#18103A] border border-slate-200/70 dark:border-purple-500/15 space-y-1">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[9px] font-black">3</span>
                      <span>Testing in Dev Mode</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      While in Development mode, only accounts listed under <strong>App Roles &gt; Testers</strong> can receive test replies.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                  <div className="font-mono text-slate-700 dark:text-purple-200 truncate">
                    <strong>Webhook:</strong> {`${effectiveOrigin}/api/webhooks/messenger`} · <strong>Token:</strong> oneagentbd_messenger_secret
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(`${effectiveOrigin}/api/webhooks/messenger`, 'cb_quick')}
                    className="font-bold text-[#7F22FE] dark:text-purple-300 hover:underline shrink-0 cursor-pointer text-left sm:text-right"
                  >
                    {copiedText === 'cb_quick' ? 'Copied!' : 'Copy Webhook URL'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4 HIGH-DENSITY CHANNEL CARDS: WhatsApp, Website Store, Facebook & Instagram */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* BOX 1: FACEBOOK */}
            <div className="bg-white dark:bg-[#120B2E] rounded-2xl border border-slate-200/80 dark:border-purple-500/20 shadow-xs hover:border-[#1877F2]/40 transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between space-y-3.5">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-purple-500/15">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center shadow-xs shrink-0">
                      <FacebookLogo className="w-5 h-5 text-[#1877F2]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        Facebook
                      </h3>
                      <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">
                        Messenger &amp; Comments
                      </p>
                    </div>
                  </div>

                  {facebookChannels.length > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active ({facebookChannels.length})
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      Not Connected
                    </span>
                  )}
                </div>

                {/* Content */}
                {facebookChannels.length > 0 ? (
                  <div className="space-y-2">
                    {facebookChannels.map((fbCh) => {
                      const commentOn = fbCh.auto_comment_reply !== false;
                      const followUpOn = fbCh.auto_followup_enabled !== false;
                      const isAiActive = fbCh.is_active !== false;
                      return (
                        <div
                          key={fbCh.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-[#18103A] border border-slate-200/70 dark:border-purple-500/15 space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                {fbCh.name}
                              </h4>
                              <span className="text-[10px] text-slate-400 dark:text-slate-400">
                                ID: {fbCh.identifier}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleTestChannel(fbCh.id)}
                                disabled={testingChannelId === fbCh.id}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Verify connection"
                              >
                                <RefreshCw
                                  className={`w-3.5 h-3.5 ${
                                    testingChannelId === fbCh.id ? 'animate-spin text-[#7F22FE]' : ''
                                  }`}
                                />
                              </button>
                              <button
                                type="button"
                                onClick={() => setChannelToDelete({ id: fbCh.id, name: fbCh.name })}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Disconnect page"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {testResult[fbCh.id] && (
                            <p
                              className={`text-[10px] font-semibold p-1.5 rounded-lg ${
                                testResult[fbCh.id].success
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                              }`}
                            >
                              {testResult[fbCh.id].message}
                            </p>
                          )}

                          {/* 1-Click Interactive Switches */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-purple-500/10">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${isAiActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                <span>AI Auto-Reply</span>
                              </span>
                              <ToggleSwitch
                                size="sm"
                                color="blue"
                                checked={isAiActive}
                                onChange={() => handleToggleChannelActive(fbCh.id)}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                💬 Auto Comment + DM
                              </span>
                              <ToggleSwitch
                                size="sm"
                                color="blue"
                                checked={commentOn}
                                onChange={() => handleToggleAutomation(fbCh, 'auto_comment_reply')}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                ⏰ Smart Follow-up
                              </span>
                              <ToggleSwitch
                                size="sm"
                                color="purple"
                                checked={followUpOn}
                                onChange={() => handleToggleAutomation(fbCh, 'auto_followup_enabled')}
                              />
                            </div>

                            {/* Multi-Business Assigned AI Agent */}
                            <div className="pt-2 border-t border-slate-200/60 dark:border-purple-500/10 flex items-center justify-between gap-1.5">
                              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 shrink-0">
                                <Bot className="w-3 h-3 text-[#7C3AED]" />
                                <span>Agent:</span>
                              </span>
                              <select
                                value={fbCh.agent_id || ''}
                                onChange={(e) => handleAssignAgentToChannel(fbCh.id, e.target.value)}
                                className="text-[10px] font-bold px-2 py-1 rounded-lg border border-purple-200 dark:border-purple-500/25 bg-white dark:bg-[#1C1442] text-[#7C3AED] dark:text-purple-300 max-w-[150px] truncate cursor-pointer"
                              >
                                <option value="">Default AI Assistant</option>
                                {availableAgents.map((ag) => (
                                  <option key={ag.id} value={ag.id}>
                                    {ag.name} ({ag.business_name})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2 py-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Connect your Facebook Page. AI will automatically reply to customer messages, post comments, and book orders.
                    </p>
                    <div className="flex flex-wrap gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-[#1877F2]">✓ 24/7 Messenger AI</span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-[#7F22FE]">✓ Auto Comment &amp; DM</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleConnectClick('messenger')}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{facebookChannels.length > 0 ? 'Connect Another Page' : 'Connect Facebook'}</span>
                </button>
              </div>
            </div>

            {/* BOX 2: INSTAGRAM */}
            <div className="bg-white dark:bg-[#120B2E] rounded-2xl border border-slate-200/80 dark:border-purple-500/20 shadow-xs hover:border-pink-500/40 transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between space-y-3.5">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-purple-500/15">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/15 via-pink-500/15 to-purple-500/15 text-pink-600 flex items-center justify-center shadow-xs shrink-0">
                      <InstagramLogo className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        Instagram
                      </h3>
                      <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">
                        Direct Messages &amp; Stories
                      </p>
                    </div>
                  </div>

                  {instagramChannels.length > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active ({instagramChannels.length})
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      Not Connected
                    </span>
                  )}
                </div>

                {/* Content */}
                {instagramChannels.length > 0 ? (
                  <div className="space-y-2">
                    {instagramChannels.map((igCh) => {
                      const commentOn = igCh.auto_comment_reply !== false;
                      const followUpOn = igCh.auto_followup_enabled !== false;
                      const isAiActive = igCh.is_active !== false;
                      return (
                        <div
                          key={igCh.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-[#18103A] border border-slate-200/70 dark:border-purple-500/15 space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                {igCh.name}
                              </h4>
                              <span className="text-[10px] text-slate-400 dark:text-slate-400">
                                ID: {igCh.identifier}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleTestChannel(igCh.id)}
                                disabled={testingChannelId === igCh.id}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Verify connection"
                              >
                                <RefreshCw
                                  className={`w-3.5 h-3.5 ${
                                    testingChannelId === igCh.id ? 'animate-spin text-pink-600' : ''
                                  }`}
                                />
                              </button>
                              <button
                                type="button"
                                onClick={() => setChannelToDelete({ id: igCh.id, name: igCh.name })}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Disconnect account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {testResult[igCh.id] && (
                            <p
                              className={`text-[10px] font-semibold p-1.5 rounded-lg ${
                                testResult[igCh.id].success
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                              }`}
                            >
                              {testResult[igCh.id].message}
                            </p>
                          )}

                          {/* 1-Click Interactive Switches */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-purple-500/10">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${isAiActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                <span>AI Auto-Reply</span>
                              </span>
                              <ToggleSwitch
                                size="sm"
                                color="pink"
                                checked={isAiActive}
                                onChange={() => handleToggleChannelActive(igCh.id)}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                💬 Auto Comment + DM
                              </span>
                              <ToggleSwitch
                                size="sm"
                                color="pink"
                                checked={commentOn}
                                onChange={() => handleToggleAutomation(igCh, 'auto_comment_reply')}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                ⏰ Smart Follow-up
                              </span>
                              <ToggleSwitch
                                size="sm"
                                color="purple"
                                checked={followUpOn}
                                onChange={() => handleToggleAutomation(igCh, 'auto_followup_enabled')}
                              />
                            </div>

                            {/* Multi-Business Assigned AI Agent */}
                            <div className="pt-2 border-t border-slate-200/60 dark:border-purple-500/10 flex items-center justify-between gap-1.5">
                              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 shrink-0">
                                <Bot className="w-3 h-3 text-pink-600" />
                                <span>Agent:</span>
                              </span>
                              <select
                                value={igCh.agent_id || ''}
                                onChange={(e) => handleAssignAgentToChannel(igCh.id, e.target.value)}
                                className="text-[10px] font-bold px-2 py-1 rounded-lg border border-pink-200 dark:border-pink-500/25 bg-white dark:bg-[#1C1442] text-pink-600 dark:text-pink-300 max-w-[150px] truncate cursor-pointer"
                              >
                                <option value="">Default AI Assistant</option>
                                {availableAgents.map((ag) => (
                                  <option key={ag.id} value={ag.id}>
                                    {ag.name} ({ag.business_name})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2 py-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Connect your Instagram Business account to handle customer DMs, comment replies, and pricing automatically.
                    </p>
                    <div className="flex flex-wrap gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                      <span className="px-2 py-0.5 rounded-md bg-pink-50 dark:bg-pink-950/40 text-pink-600">✓ DM &amp; Story Mentions</span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-[#7F22FE]">✓ Auto Follow-up</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleConnectClick('instagram')}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{instagramChannels.length > 0 ? 'Connect Another Account' : 'Connect Instagram'}</span>
                </button>
              </div>
            </div>

            {/* BOX 3: WHATSAPP */}
            <div className="relative bg-white dark:bg-[#120B2E] rounded-2xl border border-slate-200/80 dark:border-purple-500/20 shadow-xs hover:border-emerald-500/40 transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between space-y-3.5 overflow-hidden">
              <div className={`space-y-3 flex-1 flex flex-col justify-between ${isWhatsAppLockedInTrial ? 'filter blur-[5px] opacity-35 pointer-events-none select-none transition-all' : ''}`}>
                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-purple-500/15">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-xs shrink-0">
                        <WhatsAppLogo className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          WhatsApp
                        </h3>
                        <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">
                          WhatsApp Business API
                        </p>
                      </div>
                    </div>

                    {whatsappChannels.length > 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active ({whatsappChannels.length})
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        Not Connected
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  {whatsappChannels.length > 0 ? (
                    <div className="space-y-2 mt-3">
                      {whatsappChannels.map((waCh) => {
                        const followUpOn = waCh.auto_followup_enabled !== false;
                        const isAiActive = waCh.is_active !== false;
                        return (
                          <div
                            key={waCh.id}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-[#18103A] border border-slate-200/70 dark:border-purple-500/15 space-y-2.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                  {waCh.name}
                                </h4>
                                <span className="text-[10px] text-slate-400 dark:text-slate-400">
                                  ID: {waCh.identifier}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleTestChannel(waCh.id)}
                                  disabled={testingChannelId === waCh.id}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="Verify connection"
                                >
                                  <RefreshCw
                                    className={`w-3.5 h-3.5 ${
                                      testingChannelId === waCh.id ? 'animate-spin text-emerald-600' : ''
                                    }`}
                                  />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setChannelToDelete({ id: waCh.id, name: waCh.name })}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                  title="Disconnect number"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {testResult[waCh.id] && (
                              <p
                                className={`text-[10px] font-semibold p-1.5 rounded-lg ${
                                  testResult[waCh.id].success
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                                }`}
                              >
                                {testResult[waCh.id].message}
                              </p>
                            )}

                            {/* 1-Click Interactive Switches */}
                            <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-purple-500/10">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                  <span className={`w-1.5 h-1.5 rounded-full ${isAiActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                  <span>AI Auto-Reply</span>
                                </span>
                                <ToggleSwitch
                                  size="sm"
                                  color="emerald"
                                  checked={isAiActive}
                                  onChange={() => handleToggleChannelActive(waCh.id)}
                                />
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                  ⏰ Auto Follow-up (24h)
                                </span>
                                <ToggleSwitch
                                  size="sm"
                                  color="emerald"
                                  checked={followUpOn}
                                  onChange={() => handleToggleAutomation(waCh, 'auto_followup_enabled')}
                                />
                              </div>

                              {/* Multi-Business Assigned AI Agent */}
                              <div className="pt-2 border-t border-slate-200/60 dark:border-purple-500/10 flex items-center justify-between gap-1.5">
                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 shrink-0">
                                  <Bot className="w-3 h-3 text-emerald-600" />
                                  <span>Agent:</span>
                                </span>
                                <select
                                  value={waCh.agent_id || ''}
                                  onChange={(e) => handleAssignAgentToChannel(waCh.id, e.target.value)}
                                  className="text-[10px] font-bold px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-500/25 bg-white dark:bg-[#1C1442] text-emerald-600 dark:text-emerald-400 max-w-[150px] truncate cursor-pointer"
                                >
                                  <option value="">Default AI Assistant</option>
                                  {availableAgents.map((ag) => (
                                    <option key={ag.id} value={ag.id}>
                                      {ag.name} ({ag.business_name})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-2 py-1 mt-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Connect your WhatsApp Business number. Voice messages, images, and order confirmations run 24/7.
                      </p>
                      <div className="flex flex-wrap gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">✓ Voice &amp; Image AI</span>
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-[#7F22FE]">✓ Auto Follow-up</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleConnectClick('whatsapp')}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{whatsappChannels.length > 0 ? 'Connect Another Number' : 'Connect WhatsApp'}</span>
                  </button>
                </div>
              </div>

              {/* Screenshot 2 Style Frosted Glass Blur Overlay for Free Trial Mode */}
              {isWhatsAppLockedInTrial && (
                <div className="absolute inset-0 z-20 backdrop-blur-md bg-white/75 dark:bg-[#0E0826]/85 p-5 flex flex-col items-center justify-center text-center space-y-3 border border-purple-500/25">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7C3AED]/20 to-emerald-500/20 border border-purple-500/30 flex items-center justify-center text-[#7C3AED] dark:text-purple-300 shadow-sm">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950/80 text-[#7C3AED] dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                      Standard &amp; Pro Plan Only
                    </span>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                      WhatsApp Cloud API is Locked in Free Trial
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[240px] mx-auto leading-relaxed">
                      During your 2-Day Free Trial, enjoy 100% unlimited Facebook &amp; Instagram AI replies for free. Upgrade to connect WhatsApp!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate('billing')}
                    className="w-full max-w-[210px] py-2 px-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-purple-600 hover:from-purple-700 hover:to-[#7C3AED] text-white text-xs font-bold shadow-md shadow-purple-600/25 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span>Upgrade to Unlock WhatsApp</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* BOX 4: WEBSITE & STORE INTEGRATION (WooCommerce, Shopify & Custom Website) */}
            <div className="bg-white dark:bg-[#120B2E] rounded-2xl border border-slate-200/80 dark:border-purple-500/20 shadow-xs hover:border-[#7F22FE]/40 transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between space-y-3.5">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-purple-500/15">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-[#7F22FE] dark:text-purple-400 flex items-center justify-center shadow-xs shrink-0">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        Website &amp; Store
                      </h3>
                      <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">
                        WooCommerce &amp; Shopify
                      </p>
                    </div>
                  </div>

                  {stores.length > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Connected ({stores.length})
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      Not Connected
                    </span>
                  )}
                </div>

                {/* Content */}
                {stores.length > 0 ? (
                  <div className="space-y-2 max-h-[290px] overflow-y-auto pr-0.5 scrollbar-thin">
                    {stores.map((st) => (
                      <div
                        key={st.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-[#18103A] border border-slate-200/70 dark:border-purple-500/15 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {st.store_name}
                            </h4>
                            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wider block">
                              {st.platform === 'woocommerce' ? 'WooCommerce' : st.platform === 'shopify' ? 'Shopify' : 'Custom Website'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleTestStoreSync(st.id)}
                              disabled={testingStoreSyncId === st.id}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Sync latest store orders"
                            >
                              <RefreshCw
                                className={`w-3.5 h-3.5 ${
                                  testingStoreSyncId === st.id ? 'animate-spin text-[#7F22FE]' : ''
                                }`}
                              />
                            </button>
                            <button
                              type="button"
                              onClick={() => setStoreToDelete({ id: st.id, name: st.store_name })}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Disconnect store"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="pt-1.5 border-t border-slate-200/60 dark:border-purple-500/10 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                          <span>Synced: <strong className="text-slate-700 dark:text-slate-200">{st.synced_orders_count || 0} orders</strong></span>
                          <button
                            type="button"
                            onClick={() => handleCopy(`${effectiveOrigin}/api/webhooks/stores/${st.id}/orders`, `webhook_${st.id}`)}
                            className="font-semibold text-[#7F22FE] dark:text-purple-400 hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Copy className="w-2.5 h-2.5" />
                            <span>{copiedText === `webhook_${st.id}` ? 'Copied URL!' : 'Copy Webhook'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 py-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Connect your WooCommerce, Shopify, or Custom Website. AI synchronizes catalog products and automatically captures online orders.
                    </p>
                    <div className="flex flex-wrap gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-[#7F22FE]">✓ WooCommerce &amp; Shopify</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">✓ Real-time Order Webhook</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowConnectStoreModal(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{stores.length > 0 ? 'Connect Another Website' : 'Connect Website / Store'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED SECTION: COMPACT AUTOMATION COMMAND CENTER */}
      {viewMode === 'channels' && (
        <div className="space-y-3 pt-1 animate-fade-in">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#7F22FE]" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Automation Command Center
              </h2>
            </div>

            <button
              type="button"
              onClick={() => handleSaveAutomationSettings()}
              disabled={savingAutomation}
              className="px-3.5 py-1.5 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {savingAutomation ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3 h-3" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* COMPACT CARD A: AUTO COMMENT REPLY & DIRECT INBOX DM */}
            <div className="bg-white dark:bg-[#120B2E] rounded-2xl border border-slate-200/80 dark:border-purple-500/20 shadow-xs p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-3">
                {/* Header with 1-Click Master Switch */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-purple-500/15">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">💬</span>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        Post Comment Auto-Reply + Inbox DM
                      </h3>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        Facebook &amp; Instagram post comments
                      </p>
                    </div>
                  </div>

                  <ToggleSwitch
                    size="md"
                    color="blue"
                    checked={autoCommentEnabled}
                    onChange={(next) => {
                      setAutoCommentEnabled(next);
                      handleSaveAutomationSettings({ auto_comment_reply_enabled: next });
                    }}
                  />
                </div>

                {/* Sub Toggle: Send Private Inbox Message */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#18103A] border border-slate-200/60 dark:border-purple-500/15">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Simultaneously send price/details to customer Inbox
                  </span>
                  <ToggleSwitch
                    size="sm"
                    color="purple"
                    checked={sendPrivateInboxOnComment}
                    onChange={(next) => {
                      setSendPrivateInboxOnComment(next);
                      handleSaveAutomationSettings({ send_private_inbox_on_comment: next });
                    }}
                  />
                </div>

                {/* Template Editor with 1-Click Variable Insert */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Public Comment Reply Template
                    </label>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400">Insert:</span>
                      <button
                        type="button"
                        onClick={() => setPublicCommentTemplate((prev) => `${prev} {customer_name}`)}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 dark:bg-purple-950/60 text-[#7F22FE] dark:text-purple-300 hover:bg-purple-100 cursor-pointer"
                      >
                        {'{customer_name}'}
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={publicCommentTemplate}
                    onChange={(e) => setPublicCommentTemplate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-purple-500/25 bg-slate-50/50 dark:bg-[#18103A]/60 text-slate-800 dark:text-white focus:outline-none focus:border-[#7F22FE] leading-relaxed resize-none"
                  />
                </div>
              </div>
            </div>

            {/* COMPACT CARD B: SMART AUTO FOLLOW-UP (META 24H SAFE) */}
            <div className="bg-white dark:bg-[#120B2E] rounded-2xl border border-slate-200/80 dark:border-purple-500/20 shadow-xs p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-3">
                {/* Header with 1-Click Master Switch */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-purple-500/15">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">⏰</span>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        Smart Auto Follow-up Engine
                      </h3>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        Sends reminders within Meta 24h Window
                      </p>
                    </div>
                  </div>

                  <ToggleSwitch
                    size="md"
                    color="purple"
                    checked={autoFollowUpEnabled}
                    onChange={(next) => {
                      setAutoFollowUpEnabled(next);
                      handleSaveAutomationSettings({ auto_followup_enabled: next });
                    }}
                  />
                </div>

                {/* Delay Selector Pills */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                    Follow-up Delay Interval
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { mins: 30, label: '30 Mins' },
                      { mins: 45, label: '45 Mins' },
                      { mins: 120, label: '2 Hours' },
                      { mins: 360, label: '6 Hours' }
                    ].map((opt) => (
                      <button
                        key={opt.mins}
                        type="button"
                        onClick={() => {
                          setFollowUpDelayMinutes(opt.mins);
                          handleSaveAutomationSettings({ followup_delay_minutes: opt.mins });
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                          followUpDelayMinutes === opt.mins
                            ? 'bg-[#7F22FE] border-[#7F22FE] text-white shadow-2xs'
                            : 'bg-slate-50 dark:bg-[#18103A] border-slate-200 dark:border-purple-500/20 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Follow-up Message Template */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Follow-up Message Template
                    </label>
                    <button
                      type="button"
                      onClick={() => setFollowUpTemplate((prev) => `${prev} {customer_name}`)}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 dark:bg-purple-950/60 text-[#7F22FE] dark:text-purple-300 hover:bg-purple-100 cursor-pointer"
                    >
                      {'{customer_name}'}
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={followUpTemplate}
                    onChange={(e) => setFollowUpTemplate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-purple-500/25 bg-slate-50/50 dark:bg-[#18103A]/60 text-slate-800 dark:text-white focus:outline-none focus:border-[#7F22FE] leading-relaxed resize-none"
                  />
                </div>

                {/* Compact Background & Run Now Row */}
                <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/40 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-emerald-800 dark:text-emerald-300 truncate">
                    <span>🔄 Background check every 15m</span>
                  </div>

                  <button
                    type="button"
                    disabled={runningFollowUps}
                    onClick={handleRunFollowUps}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${runningFollowUps ? 'animate-spin' : ''}`} />
                    <span>{runningFollowUps ? 'Sending...' : 'Check Now'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Navigation Bar when at least 1 channel is connected */}
      {viewMode === 'channels' && channels.length > 0 && (
        <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7F22FE]/10 text-[#7F22FE] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                AI Agent is active on {channels.length} connected channel(s)
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Go to Unified Inbox to view customer conversations or open AI Persona to train your AI on your business details.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              disabled={runningFollowUps}
              onClick={handleRunFollowUps}
              className="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${runningFollowUps ? 'animate-spin' : ''}`} />
              <span>{runningFollowUps ? 'Sending Follow-ups...' : 'Send Pending Follow-ups'}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('inbox')}
              className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-[#7F22FE]" />
              <span>Unified Inbox</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('settings')}
              className="px-4 py-2.5 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Train AI Agent</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: ADMIN-ONLY META MASTER APP SETUP (HIDDEN FROM NORMAL USERS) */}
      {isAdmin && viewMode === 'admin_setup' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-[#7F22FE]/15 to-purple-500/10 border border-amber-400/30 dark:border-amber-500/20">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>SaaS Owner Setup (Visible to Admin Only)</span>
            </div>
            <h2 className="text-lg font-black text-neutral-900 dark:text-white">
              Master Meta App ID &amp; Secret Configuration
            </h2>
            <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 mt-1 leading-relaxed">
              This page is completely hidden from regular users. Regular users only see the 3 cards with <strong>Connect Facebook / Connect Instagram / Connect WhatsApp</strong> buttons. Once you save your Meta App ID &amp; Secret here, 1-Click OAuth login will work automatically for all users.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#1877F2] font-bold text-xs flex items-center justify-center">
                1
              </div>
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">Create a Meta App</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Create a Business-type app on{' '}
                <a
                  href="https://developers.facebook.com/apps"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#7F22FE] font-bold hover:underline inline-flex items-center gap-0.5"
                >
                  developers.facebook.com <ExternalLink className="w-3 h-3" />
                </a>{' '}
                and copy the App ID and App Secret.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-[#7F22FE] font-bold text-xs flex items-center justify-center">
                2
              </div>
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">OAuth Redirect URI</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Add this URL under Facebook Login &gt; Settings &gt; Valid OAuth Redirect URIs:
              </p>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 font-mono text-[11px] text-neutral-800 dark:text-neutral-200 overflow-x-auto">
                <span className="truncate flex-1">{`${effectiveOrigin}/api/channels/meta/callback`}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(`${effectiveOrigin}/api/channels/meta/callback`, 'redirect_uri')}
                  className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                >
                  {copiedText === 'redirect_uri' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 font-bold text-xs flex items-center justify-center">
                3
              </div>
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">Webhook Callback URL</h4>
              <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 font-mono text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-neutral-500">Webhook URL:</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(`${effectiveOrigin}/api/webhooks/messenger`, 'cb_url')}
                    className="text-[#7F22FE] hover:underline text-[10px] font-bold cursor-pointer"
                  >
                    {copiedText === 'cb_url' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="text-neutral-800 dark:text-neutral-200 truncate">
                  {`${effectiveOrigin}/api/webhooks/messenger`}
                </div>
                <div className="text-[10px] text-neutral-500">
                  Verify Token: <strong className="text-neutral-800 dark:text-white">oneagentbd_messenger_secret</strong>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 font-bold text-xs flex items-center justify-center">
                4
              </div>
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">Page Webhook Subscribe</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Messenger &gt; Webhooks এ গিয়ে <strong>Select a Page</strong> থেকে আপনার ফেসবুক পেজটি <strong>Subscribe</strong> করুন এবং <code className="font-mono text-[10px] bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">messages</code> ফিল্ড টিক দিন।
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Save Meta App ID &amp; Secret
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Saving here immediately enables 1-Click Auto Connect for all users on the platform.
                </p>
              </div>
              {metaConfig?.configured ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                  Meta Active ✓
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
                  Not Configured
                </span>
              )}
            </div>

            <form onSubmit={handleSaveMetaConfig} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Meta App ID *
                </label>
                <input
                  type="text"
                  required
                  value={metaAppIdInput}
                  onChange={(e) => setMetaAppIdInput(e.target.value)}
                  placeholder="e.g. 109876543210987"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Meta App Secret *
                </label>
                <input
                  type="password"
                  required
                  value={metaAppSecretInput}
                  onChange={(e) => setMetaAppSecretInput(e.target.value)}
                  placeholder="e.g. 4a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  WhatsApp Embedded Signup Configuration ID (Optional / Auto-Fallback)
                </label>
                <input
                  type="text"
                  value={metaConfigIdInput}
                  onChange={(e) => setMetaConfigIdInput(e.target.value)}
                  placeholder="e.g. 1294819284710294 (Found in Facebook Login for Business > Configurations)"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono"
                />
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 block">
                  If left empty, system automatically uses direct official Meta WhatsApp Embedded Signup permissions.
                </span>
              </div>

              <div className="sm:col-span-2 flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={savingMetaConfig}
                  className="py-2.5 px-6 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-[#7F22FE]/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {savingMetaConfig ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Meta Credentials</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1-Click Automatic Connect & Page Selection Modal */}
      <MetaAutoConnectModal
        isOpen={isAutoConnectModalOpen}
        platform={autoConnectPlatform}
        onClose={() => {
          setIsAutoConnectModalOpen(false);
          if (window.location.search.includes('meta_auth')) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }}
        onSuccess={(connectedChannel) => {
          setSuccessMessage(
            `"${connectedChannel.name}" connected successfully and AI Auto-Reply is now active!`
          );
          setLocalChannels((prev) => {
            const exists = prev.some(
              (c) => c.id === connectedChannel.id || c.identifier === connectedChannel.identifier
            );
            if (exists) {
              return prev.map((c) =>
                c.id === connectedChannel.id || c.identifier === connectedChannel.identifier
                  ? { ...c, ...connectedChannel, is_active: true, status: 'connected' }
                  : c
              );
            }
            return [{ ...connectedChannel, is_active: true, status: 'connected' }, ...prev];
          });
          onRefresh();
        }}
      />

      {/* Disconnect Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(channelToDelete)}
        title="Disconnect Channel"
        message={`Are you sure you want to disconnect "${channelToDelete?.name}"?`}
        confirmText="Disconnect"
        cancelText="Cancel"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setChannelToDelete(null)}
      />

      {/* Disconnect Store Modal */}
      <ConfirmModal
        isOpen={Boolean(storeToDelete)}
        title="Disconnect Website Store"
        message={`Are you sure you want to disconnect "${storeToDelete?.name}"? Orders will no longer sync from this store.`}
        confirmText="Disconnect Store"
        cancelText="Cancel"
        isLoading={isDeletingStore}
        onConfirm={handleConfirmDeleteStore}
        onCancel={() => setStoreToDelete(null)}
      />

      {/* Connect Website / Store Modal */}
      {showConnectStoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#120B2E] border border-slate-200 dark:border-purple-500/25 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-purple-500/15">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-[#7F22FE] dark:text-purple-400 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Connect Website / Store
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sync products and capture real-time orders directly to One Agent BD
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConnectStoreModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-purple-950/40 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConnectStoreSubmit} className="space-y-4">
              {/* Platform Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Platform
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStorePlatform('woocommerce')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      storePlatform === 'woocommerce'
                        ? 'border-[#7F22FE] bg-purple-50 dark:bg-purple-950/60 text-[#7F22FE] dark:text-purple-300'
                        : 'border-slate-200 dark:border-purple-500/20 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#18103A]'
                    }`}
                  >
                    <span>WooCommerce</span>
                    <span className="text-[10px] font-normal opacity-75">WordPress</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStorePlatform('shopify')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      storePlatform === 'shopify'
                        ? 'border-[#7F22FE] bg-purple-50 dark:bg-purple-950/60 text-[#7F22FE] dark:text-purple-300'
                        : 'border-slate-200 dark:border-purple-500/20 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#18103A]'
                    }`}
                  >
                    <span>Shopify</span>
                    <span className="text-[10px] font-normal opacity-75">Cloud Store</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStorePlatform('custom_website')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      storePlatform === 'custom_website'
                        ? 'border-[#7F22FE] bg-purple-50 dark:bg-purple-950/60 text-[#7F22FE] dark:text-purple-300'
                        : 'border-slate-200 dark:border-purple-500/20 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#18103A]'
                    }`}
                  >
                    <span>Custom Web</span>
                    <span className="text-[10px] font-normal opacity-75">Webhook API</span>
                  </button>
                </div>
              </div>

              {/* Store Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Website / Store Name *
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Luxury Fashion BD"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-500/25 bg-slate-50 dark:bg-[#18103A] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7F22FE]"
                />
              </div>

              {/* Store URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Website Domain / Store URL
                </label>
                <input
                  type="url"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  placeholder="https://yourstore.com"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-500/25 bg-slate-50 dark:bg-[#18103A] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7F22FE]"
                />
              </div>

              {/* API Key (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  API Key / Secret Token (Optional)
                </label>
                <input
                  type="password"
                  value={storeApiKey}
                  onChange={(e) => setStoreApiKey(e.target.value)}
                  placeholder="Consumer Key or Webhook Secret"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-500/25 bg-slate-50 dark:bg-[#18103A] text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#7F22FE]"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Used to authenticate incoming order webhooks and synchronize inventory products automatically.
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                <div className="font-bold text-[#7F22FE] dark:text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>How Webhook Sync Works</span>
                </div>
                <p>
                  Once connected, One Agent BD creates an active Webhook listener for your website. When a buyer checks out on your website, the order instantly streams into All Orders!
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-purple-500/15">
                <button
                  type="button"
                  onClick={() => setShowConnectStoreModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingStore}
                  className="px-5 py-2.5 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white text-xs font-bold shadow-md shadow-[#7F22FE]/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submittingStore ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Connect Website</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
