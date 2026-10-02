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
  Plus
} from 'lucide-react';
import { api } from '../../api';
import { Channel, UserProfile } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import { MetaAutoConnectModal } from './MetaAutoConnectModal';

interface ChannelsViewProps {
  channels: Channel[];
  currentUser?: UserProfile | null;
  onRefresh: () => void;
  onOpenWebhookTester?: () => void;
  onNavigate?: (tab: string) => void;
}

export const ChannelsView: React.FC<ChannelsViewProps> = ({
  channels,
  currentUser,
  onRefresh,
  onOpenWebhookTester,
  onNavigate
}) => {
  const isAdmin = currentUser?.role === 'admin';

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
  const [testingComment, setTestingComment] = useState(false);
  const [testCommentText, setTestCommentText] = useState('What is the price of the Premium Panjabi? Can I see a photo?');
  const [commentTestResult, setCommentTestResult] = useState<{
    publicReply: string;
    privateInboxReply: string;
  } | null>(null);

  // Admin-only Meta App Setup state
  const [publicTunnelUrl, setPublicTunnelUrl] = useState<string | null>(null);
  const [metaConfig, setMetaConfig] = useState<{
    configured: boolean;
    appId?: string;
    redirectUri?: string;
  } | null>(null);
  const [metaAppIdInput, setMetaAppIdInput] = useState('');
  const [metaAppSecretInput, setMetaAppSecretInput] = useState('');
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
    if (urlParams.get('meta_auth') === 'success') {
      const plat = (urlParams.get('platform') as 'messenger' | 'instagram' | 'whatsapp') || 'messenger';
      setAutoConnectPlatform(plat);
      setIsAutoConnectModalOpen(true);
      setSuccessMessage('Meta account verified! Please select your Page to complete connection.');
    } else if (urlParams.get('meta_error')) {
      setError(`Meta login error: ${decodeURIComponent(urlParams.get('meta_error') || '')}`);
    }

    // Listen for Popup postMessage from Meta OAuth callback
    const handlePopupMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'META_OAUTH_SUCCESS') {
        const plat = (data.platform as 'messenger' | 'instagram' | 'whatsapp') || 'messenger';
        setAutoConnectPlatform(plat);
        setIsAutoConnectModalOpen(true);
      } else if (data.type === 'META_OAUTH_ERROR') {
        setError(data.error || 'Meta login was not completed.');
      }
    };

    window.addEventListener('message', handlePopupMessage);
    return () => window.removeEventListener('message', handlePopupMessage);
  }, [isAdmin]);

  const effectiveOrigin = publicTunnelUrl || window.location.origin;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Single-Click Connect Handler for each of the 3 horizontal boxes
  const handleConnectClick = (targetPlatform: 'messenger' | 'instagram' | 'whatsapp') => {
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

  // Toggle Comment Auto-Reply or Auto Follow-up on a connected channel
  const handleToggleAutomation = async (
    channel: Channel,
    field: 'auto_comment_reply' | 'auto_followup_enabled'
  ) => {
    try {
      const currentVal = channel[field] !== false; // default true
      await api.updateChannelAutomation(channel.id, {
        [field]: !currentVal
      });
      onRefresh();
    } catch (err: any) {
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

  // 1-Click Test Comment Auto-Reply
  const handleTestCommentReply = async () => {
    try {
      setTestingComment(true);
      setError(null);
      setCommentTestResult(null);
      const res = await api.testCommentAutoReply({
        platform: 'messenger',
        customerName: 'Tanvir Ahmed',
        commentText: testCommentText.trim() || 'What is the price?'
      });
      if (res.publicReply && res.privateInboxReply) {
        setCommentTestResult({
          publicReply: res.publicReply,
          privateInboxReply: res.privateInboxReply
        });
        setSuccessMessage('Public comment reply and private Inbox DM generated (and saved to Unified Inbox)!');
      } else {
        setError(res.reason || 'Auto comment reply test did not complete.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to test comment reply.');
    } finally {
      setTestingComment(false);
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
        appSecret: metaAppSecretInput.trim()
      });
      setMetaConfig(res.config);
      setSuccessMessage('Meta App ID & Secret saved! Users can now connect with 1-Click.');
    } catch (err: any) {
      setError(err.message || 'Failed to save Meta configuration.');
    } finally {
      setSavingMetaConfig(false);
    }
  };

  const facebookChannels = channels.filter((c) => c.platform === 'messenger');
  const instagramChannels = channels.filter((c) => c.platform === 'instagram');
  const whatsappChannels = channels.filter((c) => c.platform === 'whatsapp');

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

        {/* Admin-Only Controls (Hidden from normal users) */}
        {isAdmin && (
          <div className="flex items-center gap-2 shrink-0">
            {onOpenWebhookTester && (
              <button
                type="button"
                onClick={onOpenWebhookTester}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#7F22FE] bg-[#7F22FE]/10 hover:bg-[#7F22FE]/20 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Webhook Simulator</span>
              </button>
            )}

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
          </div>
        )}
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

      {/* VIEW 1: 3 HORIZONTAL CHANNEL BOXES (FACEBOOK, INSTAGRAM, WHATSAPP) */}
      {viewMode === 'channels' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* BOX 1: FACEBOOK */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 shadow-xs p-6 flex flex-col justify-between">
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between pb-5 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center shadow-md shadow-[#1877F2]/25 shrink-0">
                    <Facebook className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white leading-tight">
                      Facebook
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Messenger &amp; Page Comments
                    </p>
                  </div>
                </div>

                {facebookChannels.length > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Connected ({facebookChannels.length})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    Not Connected
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="py-5 space-y-3">
                {facebookChannels.length > 0 ? (
                  <div className="space-y-2.5">
                    {facebookChannels.map((fbCh) => {
                      const commentOn = fbCh.auto_comment_reply !== false;
                      const followUpOn = fbCh.auto_followup_enabled !== false;
                      return (
                        <div
                          key={fbCh.id}
                          className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/70 space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                                {fbCh.name}
                              </h4>
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                AI Auto-Reply Active
                              </span>
                              {testResult[fbCh.id] && (
                                <p
                                  className={`text-[11px] mt-0.5 font-semibold ${
                                    testResult[fbCh.id].success ? 'text-emerald-600' : 'text-rose-600'
                                  }`}
                                >
                                  {testResult[fbCh.id].message}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleTestChannel(fbCh.id)}
                                disabled={testingChannelId === fbCh.id}
                                className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                                title="Verify connection"
                              >
                                <RefreshCw
                                  className={`w-4 h-4 ${
                                    testingChannelId === fbCh.id ? 'animate-spin text-[#7F22FE]' : ''
                                  }`}
                                />
                              </button>
                              <button
                                type="button"
                                onClick={() => setChannelToDelete({ id: fbCh.id, name: fbCh.name })}
                                className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Disconnect page"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* 1-Click Auto Comment & Follow-up Toggles (ON by default) */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60">
                            <button
                              type="button"
                              onClick={() => handleToggleAutomation(fbCh, 'auto_comment_reply')}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                commentOn
                                  ? 'bg-blue-100/80 dark:bg-blue-950/70 text-[#1877F2] dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                  : 'bg-neutral-200/70 dark:bg-neutral-700 text-neutral-500'
                              }`}
                            >
                              <span>💬 Auto Comment + Inbox: {commentOn ? 'ON' : 'OFF'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleAutomation(fbCh, 'auto_followup_enabled')}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                followUpOn
                                  ? 'bg-purple-100/80 dark:bg-purple-950/70 text-[#7F22FE] dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                  : 'bg-neutral-200/70 dark:bg-neutral-700 text-neutral-500'
                              }`}
                            >
                              <span>⏰ Auto Follow-up: {followUpOn ? 'ON' : 'OFF'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      Connect your Facebook Page. Our AI will automatically reply to all messages and comments and confirm customer orders 24/7.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-[#1877F2] dark:text-blue-300">
                        ✓ Post Comment Auto-Reply + Inbox
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-[#7F22FE] dark:text-purple-300">
                        ✓ Auto Follow-up Message
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Single Action Button */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
              <button
                type="button"
                onClick={() => handleConnectClick('messenger')}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-sm font-bold shadow-md shadow-[#1877F2]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {facebookChannels.length > 0 ? (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Connect Another Page</span>
                  </>
                ) : (
                  <>
                    <Facebook className="w-4 h-4 fill-current" />
                    <span>Connect Facebook</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* BOX 2: INSTAGRAM */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 shadow-xs p-6 flex flex-col justify-between">
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between pb-5 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-pink-500/20 shrink-0">
                    <Instagram className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white leading-tight">
                      Instagram
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Direct Messages &amp; Stories
                    </p>
                  </div>
                </div>

                {instagramChannels.length > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Connected ({instagramChannels.length})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    Not Connected
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="py-5 space-y-3">
                {instagramChannels.length > 0 ? (
                  <div className="space-y-2.5">
                    {instagramChannels.map((igCh) => {
                      const commentOn = igCh.auto_comment_reply !== false;
                      const followUpOn = igCh.auto_followup_enabled !== false;
                      return (
                        <div
                          key={igCh.id}
                          className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/70 space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                                {igCh.name}
                              </h4>
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-pink-600 dark:text-pink-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                                AI Auto-Reply Active
                              </span>
                              {testResult[igCh.id] && (
                                <p
                                  className={`text-[11px] mt-0.5 font-semibold ${
                                    testResult[igCh.id].success ? 'text-emerald-600' : 'text-rose-600'
                                  }`}
                                >
                                  {testResult[igCh.id].message}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleTestChannel(igCh.id)}
                                disabled={testingChannelId === igCh.id}
                                className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                                title="Verify connection"
                              >
                                <RefreshCw
                                  className={`w-4 h-4 ${
                                    testingChannelId === igCh.id ? 'animate-spin text-[#7F22FE]' : ''
                                  }`}
                                />
                              </button>
                              <button
                                type="button"
                                onClick={() => setChannelToDelete({ id: igCh.id, name: igCh.name })}
                                className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Disconnect account"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60">
                            <button
                              type="button"
                              onClick={() => handleToggleAutomation(igCh, 'auto_comment_reply')}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                commentOn
                                  ? 'bg-pink-100/80 dark:bg-pink-950/70 text-pink-600 dark:text-pink-300 border border-pink-200 dark:border-pink-800'
                                  : 'bg-neutral-200/70 dark:bg-neutral-700 text-neutral-500'
                              }`}
                            >
                              <span>💬 Auto Comment + DM: {commentOn ? 'ON' : 'OFF'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleAutomation(igCh, 'auto_followup_enabled')}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                followUpOn
                                  ? 'bg-purple-100/80 dark:bg-purple-950/70 text-[#7F22FE] dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                  : 'bg-neutral-200/70 dark:bg-neutral-700 text-neutral-500'
                              }`}
                            >
                              <span>⏰ Auto Follow-up: {followUpOn ? 'ON' : 'OFF'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      Connect your Instagram Business account. Our AI will automatically handle DMs, post comments, and product photo requests.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-300">
                        ✓ Post Comment Auto-Reply + DM
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-[#7F22FE] dark:text-purple-300">
                        ✓ Auto Follow-up Message
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Single Action Button */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
              <button
                type="button"
                onClick={() => handleConnectClick('instagram')}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white text-sm font-bold shadow-md shadow-pink-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {instagramChannels.length > 0 ? (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Connect Another Account</span>
                  </>
                ) : (
                  <>
                    <Instagram className="w-4 h-4" />
                    <span>Connect Instagram</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* BOX 3: WHATSAPP */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 shadow-xs p-6 flex flex-col justify-between">
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between pb-5 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/25 shrink-0">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white leading-tight">
                      WhatsApp
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      WhatsApp Business API
                    </p>
                  </div>
                </div>

                {whatsappChannels.length > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Connected ({whatsappChannels.length})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    Not Connected
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="py-5 space-y-3">
                {whatsappChannels.length > 0 ? (
                  <div className="space-y-2.5">
                    {whatsappChannels.map((waCh) => {
                      const followUpOn = waCh.auto_followup_enabled !== false;
                      return (
                        <div
                          key={waCh.id}
                          className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/70 space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                                {waCh.name}
                              </h4>
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                AI Auto-Reply Active
                              </span>
                              {testResult[waCh.id] && (
                                <p
                                  className={`text-[11px] mt-0.5 font-semibold ${
                                    testResult[waCh.id].success ? 'text-emerald-600' : 'text-rose-600'
                                  }`}
                                >
                                  {testResult[waCh.id].message}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleTestChannel(waCh.id)}
                                disabled={testingChannelId === waCh.id}
                                className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                                title="Verify connection"
                              >
                                <RefreshCw
                                  className={`w-4 h-4 ${
                                    testingChannelId === waCh.id ? 'animate-spin text-[#7F22FE]' : ''
                                  }`}
                                />
                              </button>
                              <button
                                type="button"
                                onClick={() => setChannelToDelete({ id: waCh.id, name: waCh.name })}
                                className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Disconnect number"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60">
                            <button
                              type="button"
                              onClick={() => handleToggleAutomation(waCh, 'auto_followup_enabled')}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                followUpOn
                                  ? 'bg-emerald-100/80 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                  : 'bg-neutral-200/70 dark:bg-neutral-700 text-neutral-500'
                              }`}
                            >
                              <span>⏰ Auto Follow-up (24h Window): {followUpOn ? 'ON' : 'OFF'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      Connect your WhatsApp Business number. Voice messages, chats, and order confirmations will run automatically 24/7.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                        ✓ Voice &amp; Image AI Reply
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-[#7F22FE] dark:text-purple-300">
                        ✓ Auto Follow-up Message
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Single Action Button */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
              <button
                type="button"
                onClick={() => handleConnectClick('whatsapp')}
                className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {whatsappChannels.length > 0 ? (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Connect Another Number</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4" />
                    <span>Connect WhatsApp</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED SECTION: AUTO COMMENT REPLY & SMART AUTO FOLLOW-UP (ALWAYS VISIBLE) */}
      {viewMode === 'channels' && (
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#7F22FE]" />
                <span>Auto Comment Reply &amp; Smart Follow-up Automation</span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Configure automatic replies + private Inbox DMs for Facebook &amp; Instagram post comments and smart follow-up messages for undecided shoppers.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleSaveAutomationSettings()}
              disabled={savingAutomation}
              className="px-4 py-2.5 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white text-xs font-bold shadow-md shadow-[#7F22FE]/25 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
            >
              {savingAutomation ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Automation Settings</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CARD A: FACEBOOK & INSTAGRAM AUTO COMMENT REPLY + PRIVATE INBOX DM */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 shadow-xs p-4 sm:p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="pb-4 border-b border-neutral-100 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#1877F2] flex items-center justify-center shrink-0 font-bold text-base sm:text-lg">
                        💬
                      </div>
                      <h3 className="text-sm sm:text-base font-extrabold text-neutral-900 dark:text-white leading-snug">
                        Post Comment Auto-Reply + Inbox DM
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const next = !autoCommentEnabled;
                        setAutoCommentEnabled(next);
                        handleSaveAutomationSettings({ auto_comment_reply_enabled: next });
                      }}
                      className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                        autoCommentEnabled
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      {autoCommentEnabled ? '● Active (ON)' : '○ Disabled (OFF)'}
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    Auto-reply to Facebook Page &amp; Instagram Post comments and send price details directly to Inbox.
                  </p>
                </div>

                {/* How it works badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                    <div className="text-xs font-bold text-[#1877F2] dark:text-blue-300">
                      1. Public Comment Reply
                    </div>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                      Instantly replies under the customer&apos;s comment thanking them and asking them to check their inbox.
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50">
                    <div className="text-xs font-bold text-[#7F22FE] dark:text-purple-300">
                      2. Private Inbox Message (DM)
                    </div>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                      Simultaneously sends product pricing and photos directly to their Messenger/Instagram Inbox.
                    </p>
                  </div>
                </div>

                {/* Public Comment Template */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Public Comment Reply Template ({'{customer_name}'} auto-filled)
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7F22FE] cursor-pointer whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={sendPrivateInboxOnComment}
                        onChange={(e) => {
                          setSendPrivateInboxOnComment(e.target.checked);
                          handleSaveAutomationSettings({ send_private_inbox_on_comment: e.target.checked });
                        }}
                        className="rounded accent-[#7F22FE] shrink-0"
                      />
                      <span>Also send AI reply to Inbox</span>
                    </label>
                  </div>
                  <textarea
                    rows={3}
                    value={publicCommentTemplate}
                    onChange={(e) => setPublicCommentTemplate(e.target.value)}
                    className="w-full text-xs p-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-white focus:outline-none focus:border-[#7F22FE] leading-relaxed"
                  />
                </div>

                {/* 1-Click Live Comment Test Box */}
                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/70 space-y-2.5">
                  <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
                    <span>⚡ Live Test (Preview how AI responds when a customer comments)</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={testCommentText}
                      onChange={(e) => setTestCommentText(e.target.value)}
                      placeholder="Enter sample customer comment (e.g. What is the price?)"
                      className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleTestCommentReply}
                      disabled={testingComment}
                      className="px-4 py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold transition-all cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {testingComment ? 'Testing...' : 'Test Comment Reply'}
                    </button>
                  </div>

                  {commentTestResult && (
                    <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-emerald-200 dark:border-emerald-800/70 space-y-2 text-xs">
                      <div>
                        <span className="font-bold text-[#1877F2]">💬 Public Comment Reply: </span>
                        <span className="text-neutral-700 dark:text-neutral-300">
                          {commentTestResult.publicReply}
                        </span>
                      </div>
                      <div className="pt-1.5 border-t border-neutral-100 dark:border-neutral-800">
                        <span className="font-bold text-[#7F22FE]">📩 Private Inbox DM (AI): </span>
                        <span className="text-neutral-700 dark:text-neutral-300">
                          {commentTestResult.privateInboxReply}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CARD B: SMART AUTO FOLLOW-UP MESSAGE (WITHIN 24H META WINDOW) */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 shadow-xs p-4 sm:p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="pb-4 border-b border-neutral-100 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-[#7F22FE] flex items-center justify-center shrink-0 font-bold text-base sm:text-lg">
                        ⏰
                      </div>
                      <h3 className="text-sm sm:text-base font-extrabold text-neutral-900 dark:text-white leading-snug">
                        Smart Auto Follow-up Message
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const next = !autoFollowUpEnabled;
                        setAutoFollowUpEnabled(next);
                        handleSaveAutomationSettings({ auto_followup_enabled: next });
                      }}
                      className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                        autoFollowUpEnabled
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      {autoFollowUpEnabled ? '● Active (ON)' : '○ Disabled (OFF)'}
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    Automated reminder message for customers who inquired about price but haven&apos;t ordered yet.
                  </p>
                </div>

                {/* Follow-up Timing Selector */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Send automated follow-up if customer doesn&apos;t reply after: (Meta 24h Window Safe)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { mins: 30, label: 'After 30 Mins' },
                      { mins: 45, label: 'After 45 Mins' },
                      { mins: 120, label: 'After 2 Hours' },
                      { mins: 360, label: 'After 6 Hours' }
                    ].map((opt) => (
                      <button
                        key={opt.mins}
                        type="button"
                        onClick={() => {
                          setFollowUpDelayMinutes(opt.mins);
                          handleSaveAutomationSettings({ followup_delay_minutes: opt.mins });
                        }}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          followUpDelayMinutes === opt.mins
                            ? 'bg-[#7F22FE] border-[#7F22FE] text-white shadow-xs'
                            : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Follow-up Message Template */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Follow-up Message Template ({'{customer_name}'} auto-filled)
                  </label>
                  <textarea
                    rows={3}
                    value={followUpTemplate}
                    onChange={(e) => setFollowUpTemplate(e.target.value)}
                    className="w-full text-xs p-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-white focus:outline-none focus:border-[#7F22FE]"
                  />
                </div>

                {/* Action Box: Trigger Follow-up Check Now */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                      🔄 Automatically checked every 15 minutes in the background
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                      Customers who have already placed an order will never be messaged again.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={runningFollowUps}
                    onClick={handleRunFollowUps}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${runningFollowUps ? 'animate-spin' : ''}`} />
                    <span>{runningFollowUps ? 'Sending...' : 'Send Follow-ups Now'}</span>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  Meta App ID
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
                  Meta App Secret
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
    </div>
  );
};
