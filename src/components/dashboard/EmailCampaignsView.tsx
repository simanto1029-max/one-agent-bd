import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Sparkles,
  Users,
  BarChart3,
  Eye,
  MousePointerClick,
  Plus,
  Trash2,
  RefreshCw,
  Settings,
  CheckCircle2,
  Upload,
  Search,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  X,
  ArrowRight,
  Zap,
  Globe,
  FileText
} from 'lucide-react';
import { api } from '../../api';
import {
  EmailCampaign,
  EmailSubscriber,
  EmailSmtpSettings,
  EmailAnalyticsSummary
} from '../../types';

export const EmailCampaignsView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'campaigns' | 'compose' | 'subscribers' | 'smtp'>('campaigns');
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [subscribers, setSubscribers] = useState<EmailSubscriber[]>([]);
  const [smtpSettings, setSmtpSettings] = useState<EmailSmtpSettings>({
    provider: 'gmail',
    sender_name: 'One Agent BD Store',
    sender_email: '',
    smtp_host: 'smtp.gmail.com',
    smtp_port: 465,
    smtp_user: '',
    smtp_pass: '',
    api_key: '',
    reply_to: '',
    is_configured: false
  });
  const [analytics, setAnalytics] = useState<EmailAnalyticsSummary>({
    totalCampaigns: 0,
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    openRate: 0,
    clickRate: 0
  });

  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Compose & AI Copywriter State
  const [aiTopicPrompt, setAiTopicPrompt] = useState('Eid Special 30% Discount on All Premium Collections + Free Delivery');
  const [aiLanguage, setAiLanguage] = useState<'en' | 'bn'>('en');
  const [generatingAi, setGeneratingAi] = useState(false);

  const [campaignName, setCampaignName] = useState('');
  const [subject, setSubject] = useState('');
  const [preheader, setPreheader] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [ctaText, setCtaText] = useState('Shop Now');
  const [ctaUrl, setCtaUrl] = useState('https://www.oneagentbd.online');
  const [audienceFilter, setAudienceFilter] = useState<'all' | 'vip' | 'custom'>('all');
  const [customEmails, setCustomEmails] = useState('');
  const [sendingCampaign, setSendingCampaign] = useState(false);

  // Subscribers State
  const [newSubEmail, setNewSubEmail] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubTag, setNewSubTag] = useState('customer');
  const [bulkImportText, setBulkImportText] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [syncingSubs, setSyncingSubs] = useState(false);
  const [subSearch, setSubSearch] = useState('');

  // SMTP Save State
  const [savingSmtp, setSavingSmtp] = useState(false);

  // Selected Campaign Details Modal (Recipient Open & Click Logs)
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [copiedPixel, setCopiedPixel] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getEmailCampaignsHub();
      setCampaigns(data.campaigns || []);
      setSubscribers(data.subscribers || []);
      if (data.smtpSettings) {
        setSmtpSettings(data.smtpSettings);
      }
      if (data.analytics) {
        setAnalytics(data.analytics);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load Email Marketing hub', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateWithAI = async () => {
    if (!aiTopicPrompt.trim()) {
      showToast('Please enter a campaign offer or topic first.', 'error');
      return;
    }
    try {
      setGeneratingAi(true);
      const res = await api.generateMarketingEmailAI({
        topicPrompt: aiTopicPrompt,
        language: aiLanguage
      });
      setSubject(res.subject || '');
      setPreheader(res.preheader || '');
      setBodyHtml(res.body_html || '');
      if (res.cta_text) setCtaText(res.cta_text);
      if (!campaignName.trim()) {
        setCampaignName(res.subject || aiTopicPrompt.slice(0, 50));
      }
      showToast('AI generated your marketing email copy!');
    } catch (err: any) {
      showToast(err.message || 'Failed to generate email copy with AI', 'error');
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !bodyHtml.trim()) {
      showToast('Please enter an email subject and body before sending.', 'error');
      return;
    }
    try {
      setSendingCampaign(true);
      const res = await api.createAndSendEmailCampaign({
        name: campaignName.trim() || subject.trim(),
        subject: subject.trim(),
        preheader: preheader.trim(),
        body_html: bodyHtml.trim(),
        cta_text: ctaText.trim(),
        cta_url: ctaUrl.trim(),
        audience_filter: audienceFilter,
        custom_emails: audienceFilter === 'custom' ? customEmails : undefined
      });
      showToast(res.message || 'Email campaign broadcast sent!');
      await loadData();
      setActiveSubTab('campaigns');
      setCampaignName('');
      setSubject('');
      setPreheader('');
      setBodyHtml('');
    } catch (err: any) {
      showToast(err.message || 'Failed to send email campaign', 'error');
    } finally {
      setSendingCampaign(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      const res = await api.deleteEmailCampaign(id);
      setCampaigns(res.campaigns || []);
      if (res.analytics) setAnalytics(res.analytics);
      if (selectedCampaign?.id === id) setSelectedCampaign(null);
      showToast('Campaign deleted.');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete campaign', 'error');
    }
  };

  const handleAddSingleSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubEmail.trim()) return;
    try {
      const res = await api.addEmailSubscribers({
        email: newSubEmail.trim(),
        name: newSubName.trim() || undefined,
        tags: [newSubTag]
      });
      setSubscribers(res.subscribers || []);
      setNewSubEmail('');
      setNewSubName('');
      showToast(res.message || 'Subscriber added!');
    } catch (err: any) {
      showToast(err.message || 'Failed to add subscriber', 'error');
    }
  };

  const handleBulkImportSubscribers = async () => {
    if (!bulkImportText.trim()) return;
    try {
      const res = await api.addEmailSubscribers({
        bulkText: bulkImportText,
        tags: ['imported']
      });
      setSubscribers(res.subscribers || []);
      setBulkImportText('');
      setShowBulkModal(false);
      showToast(res.message || 'Subscribers imported!');
    } catch (err: any) {
      showToast(err.message || 'Bulk import failed', 'error');
    }
  };

  const handleSyncSubscribersFromChats = async () => {
    try {
      setSyncingSubs(true);
      const res = await api.syncEmailSubscribers();
      setSubscribers(res.subscribers || []);
      showToast(res.message || 'Synced customer emails!');
    } catch (err: any) {
      showToast(err.message || 'Failed to sync emails', 'error');
    } finally {
      setSyncingSubs(false);
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    try {
      const res = await api.deleteEmailSubscriber(id);
      setSubscribers(res.subscribers || []);
      showToast('Subscriber removed.');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete subscriber', 'error');
    }
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSmtp(true);
      const res = await api.updateEmailSmtpSettings(smtpSettings);
      if (res.smtpSettings) setSmtpSettings(res.smtpSettings);
      showToast(res.message || 'Sender & SMTP settings saved!');
    } catch (err: any) {
      showToast(err.message || 'Failed to save SMTP settings', 'error');
    } finally {
      setSavingSmtp(false);
    }
  };

  const filteredSubscribers = subscribers.filter(
    (s) =>
      s.email.toLowerCase().includes(subSearch.toLowerCase()) ||
      (s.name && s.name.toLowerCase().includes(subSearch.toLowerCase())) ||
      s.tags.some((t) => t.toLowerCase().includes(subSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold transition-all ${
            toastMsg.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Email Marketing & AI Broadcast Hub
                </h2>
                <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                  Open & Click Tracking
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Write promotional emails with AI, broadcast to customers in 1-click, and track real-time Open & Link Click rates.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveSubTab('compose')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Create AI Email Campaign
          </button>
          <button
            type="button"
            onClick={handleSyncSubscribersFromChats}
            disabled={syncingSubs}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncingSubs ? 'animate-spin' : ''}`} />
            Sync Emails from Chats
          </button>
        </div>
      </div>

      {/* Real-time Email Analytics KPI Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Emails Sent
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {analytics.totalSent}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              across {analytics.totalCampaigns} campaigns
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Emails Opened (Pixel)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {analytics.openRate}%
            </span>
            <span className="text-xs font-semibold text-slate-500">
              ({analytics.totalOpened} opened)
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Link Clicks (CTR)
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">
              {analytics.clickRate}%
            </span>
            <span className="text-xs font-semibold text-slate-500">
              ({analytics.totalClicked} clicked)
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Email Subscribers
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {subscribers.length}
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              Active list
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('campaigns')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'campaigns'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Sent Campaigns & Open/Click Reports ({campaigns.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('compose')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'compose'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          AI Email Writer & Broadcast
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('subscribers')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'subscribers'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Users className="w-4 h-4" />
          Subscriber List ({subscribers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('smtp')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'smtp'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Settings className="w-4 h-4" />
          Connect Your Email (Gmail / SMTP)
          {smtpSettings.is_configured && (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          )}
        </button>
      </div>

      {/* TAB 1: CAMPAIGNS & OPEN/CLICK ANALYTICS */}
      {activeSubTab === 'campaigns' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Campaign Broadcast History & Live Tracking
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every email automatically embeds an invisible 1x1 Open Tracking Pixel and Click Redirect Tracker.
              </p>
            </div>
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Stats
            </button>
          </div>

          {campaigns.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800">No Email Campaigns Sent Yet</h4>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Use our AI Email Copywriter to generate an offer email in seconds and broadcast it to your customers with real-time Open & Click tracking.
              </p>
              <button
                type="button"
                onClick={() => setActiveSubTab('compose')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Launch First AI Campaign
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {campaigns.map((camp) => {
                const sent = Math.max(1, camp.sent_count || camp.total_recipients || 1);
                const openPct = Math.min(100, Math.round(((camp.opened_count || 0) / sent) * 100));
                const clickPct = Math.min(100, Math.round(((camp.clicked_count || 0) / sent) * 100));

                return (
                  <div
                    key={camp.id}
                    className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                  >
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm sm:text-base font-bold text-slate-900">
                          {camp.name || camp.subject}
                        </span>
                        <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Sent to {camp.sent_count} recipients
                        </span>
                        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-slate-100 text-slate-600">
                          {camp.delivery_mode === 'live_smtp' ? 'Live SMTP' : 'Tracked Broadcast'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        Subject: <span className="text-slate-800">{camp.subject}</span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Sent on {new Date(camp.sent_at || camp.created_at).toLocaleString()}
                      </p>
                    </div>

                    {/* Open & Click Metrics Bars */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-center">
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70 min-w-[130px]">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-emerald-600" /> Opened
                          </span>
                          <span className="text-emerald-700">{openPct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${openPct}%` }}
                          />
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {camp.opened_count || 0} of {camp.sent_count} opened
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70 min-w-[130px]">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-500 flex items-center gap-1">
                            <MousePointerClick className="w-3.5 h-3.5 text-blue-600" /> Clicked
                          </span>
                          <span className="text-blue-700">{clickPct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${clickPct}%` }}
                          />
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {camp.clicked_count || 0} of {camp.sent_count} clicked
                        </div>
                      </div>

                      <div className="col-span-2 sm:col-span-1 flex flex-wrap items-center gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedCampaign(camp)}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        >
                          Recipient Report
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCampaign(camp.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMPOSE & AI EMAIL WRITER */}
      {activeSubTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: AI Copywriter + Form */}
          <div className="lg:col-span-7 space-y-5">
            {/* AI Copywriter Box */}
            <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50/60 rounded-2xl border border-purple-200/80 p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      AI Marketing Email Copywriter
                    </h3>
                    <p className="text-xs text-slate-500">
                      Tell AI your offer or announcement and it will write the subject, body & CTA button.
                    </p>
                  </div>
                </div>

                <select
                  value={aiLanguage}
                  onChange={(e) => setAiLanguage(e.target.value as 'en' | 'bn')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-purple-200 text-slate-700"
                >
                  <option value="en">Write in English</option>
                  <option value="bn">Write in Bengali</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={aiTopicPrompt}
                  onChange={(e) => setAiTopicPrompt(e.target.value)}
                  placeholder="e.g., 30% Eid Discount on all items, or Weekend Dental Checkup Offer..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={handleGenerateWithAI}
                  disabled={generatingAi}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Sparkles className={`w-4 h-4 ${generatingAi ? 'animate-spin' : ''}`} />
                  {generatingAi ? 'Writing Copy...' : 'Generate with AI'}
                </button>
              </div>
            </div>

            {/* Campaign Editor Form */}
            <form
              onSubmit={handleSendCampaign}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4"
            >
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Campaign Details & Audience
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Campaign Internal Name
                  </label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="e.g., Weekend Promo Blast"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Audience
                  </label>
                  <select
                    value={audienceFilter}
                    onChange={(e) => setAudienceFilter(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">All Active Subscribers ({subscribers.length})</option>
                    <option value="vip">
                      VIP Customers Only (
                      {subscribers.filter((s) => s.tags.some((t) => t.toLowerCase().includes('vip'))).length}
                      )
                    </option>
                    <option value="custom">Paste Custom Recipient Emails</option>
                  </select>
                </div>
              </div>

              {audienceFilter === 'custom' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Paste Recipient Emails (comma or newline separated)
                  </label>
                  <textarea
                    rows={2}
                    value={customEmails}
                    onChange={(e) => setCustomEmails(e.target.value)}
                    placeholder="customer1@gmail.com, customer2@yahoo.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Subject Line *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Exclusive 30% Off Just for You!"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preview Text (Preheader)
                </label>
                <input
                  type="text"
                  value={preheader}
                  onChange={(e) => setPreheader(e.target.value)}
                  placeholder="Short summary shown in inbox preview..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Email Message Body *
                  </label>
                  <span className="text-[11px] text-purple-600 font-semibold">
                    Tip: Use {'{customer_name}'} for auto-personalization
                  </span>
                </div>
                <textarea
                  rows={6}
                  required
                  value={bodyHtml}
                  onChange={(e) => setBodyHtml(e.target.value)}
                  placeholder="Hello {customer_name}, we have a special offer waiting for you..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    CTA Button Text (Tracked Link)
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="Claim Offer Now"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    CTA Destination URL (Click Tracked)
                  </label>
                  <input
                    type="url"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    placeholder="https://yourwebsite.com/offer"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Open Tracking Pixel & Click Redirect URL automatically injected</span>
                </div>

                <button
                  type="submit"
                  disabled={sendingCampaign}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {sendingCampaign ? 'Broadcasting...' : 'Send Broadcast Now'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Branded Email Preview */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs sticky top-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Live Customer Inbox Preview
                </span>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  1x1 Pixel Active
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3">
                <div className="text-xs space-y-1 border-b border-slate-200/80 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-400">From:</span>
                    <span className="font-semibold text-slate-800">
                      {smtpSettings.sender_name || 'One Agent BD Store'}{' '}
                      {smtpSettings.sender_email ? `<${smtpSettings.sender_email}>` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-400">Subject:</span>
                    <span className="font-bold text-slate-900">
                      {subject || 'Your email subject will appear here...'}
                    </span>
                  </div>
                  {preheader && (
                    <div className="text-[11px] text-slate-500 italic">{preheader}</div>
                  )}
                </div>

                {/* Simulated Email Card */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3.5 text-white font-extrabold text-sm">
                    {smtpSettings.sender_name || 'One Agent BD Store'}
                  </div>
                  <div className="p-5 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <div
                      className="whitespace-pre-line"
                      dangerouslySetInnerHTML={{
                        __html: (
                          bodyHtml ||
                          'Hello <strong>Valued Customer</strong>,\n\nUse the AI Email Copywriter or type your promotional message to preview how it will look on mobile and desktop inboxes.'
                        ).replace(/\{customer_name\}|\{name\}/gi, 'Tanvir Hasan')
                      }}
                    />
                    {ctaText && (
                      <div className="pt-2">
                        <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-purple-600 text-white font-bold text-xs">
                          {ctaText} <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Sent by {smtpSettings.sender_name || 'One Agent BD Store'}</span>
                    <span>Tracked via One Agent BD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SUBSCRIBERS CRM & BULK IMPORT */}
      {activeSubTab === 'subscribers' && (
        <div className="space-y-5">
          {/* Add Subscriber Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <form
              onSubmit={handleAddSingleSubscriber}
              className="grid grid-cols-1 sm:grid-cols-4 gap-3 flex-1"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer Email *
                </label>
                <input
                  type="email"
                  required
                  value={newSubEmail}
                  onChange={(e) => setNewSubEmail(e.target.value)}
                  placeholder="customer@gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="Rahim Uddin"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Segment Tag
                </label>
                <select
                  value={newSubTag}
                  onChange={(e) => setNewSubTag(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white"
                >
                  <option value="customer">Regular Customer</option>
                  <option value="vip">VIP Customer</option>
                  <option value="lead">Chat Lead</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Subscriber
                </button>
              </div>
            </form>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowBulkModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Bulk CSV / Paste Import
              </button>
            </div>
          </div>

          {/* Subscribers Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Subscribed Customer Emails ({filteredSubscribers.length})
              </h3>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                  placeholder="Search email, name or tag..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-[11px] font-bold uppercase text-slate-400 border-b border-slate-100">
                    <th className="py-3 px-4">Subscriber</th>
                    <th className="py-3 px-4">Segment Tags</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4">Added Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {filteredSubscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{sub.name}</div>
                        <div className="text-xs text-slate-500">{sub.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {sub.tags.map((t, i) => (
                            <span
                              key={i}
                              className={`px-2 py-0.5 text-[11px] font-bold rounded-md ${
                                t.toLowerCase().includes('vip')
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-purple-50 text-purple-700 border border-purple-200'
                              }`}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500 capitalize">
                        {sub.source.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteSubscriber(sub.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CONNECT YOUR OWN EMAIL (GMAIL APP PASSWORD / CUSTOM SMTP / RESEND / BREVO) */}
      {activeSubTab === 'smtp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleSaveSmtp}
            className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Connect Your Own Business Email (Multi-Tenant)
                </h3>
                <p className="text-xs text-slate-500">
                  Send campaigns directly from your own Gmail or domain email so customers see your brand name.
                </p>
              </div>
              <span
                className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                  smtpSettings.is_configured
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {smtpSettings.is_configured ? 'SMTP Connected' : 'Pending SMTP Configuration'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'gmail', label: 'Gmail App Password' },
                { id: 'custom_smtp', label: 'Custom Domain SMTP' },
                { id: 'resend', label: 'Resend API' },
                { id: 'brevo', label: 'Brevo Email API' }
              ].map((prov) => (
                <button
                  key={prov.id}
                  type="button"
                  onClick={() =>
                    setSmtpSettings((prev) => ({
                      ...prev,
                      provider: prov.id as any,
                      smtp_host: prov.id === 'gmail' ? 'smtp.gmail.com' : prev.smtp_host
                    }))
                  }
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    smtpSettings.provider === prov.id
                      ? 'bg-purple-50 border-purple-500 text-purple-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {prov.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sender Brand Name
                </label>
                <input
                  type="text"
                  value={smtpSettings.sender_name}
                  onChange={(e) =>
                    setSmtpSettings({ ...smtpSettings, sender_name: e.target.value })
                  }
                  placeholder="Your Business Name"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sender Email Address
                </label>
                <input
                  type="email"
                  value={smtpSettings.sender_email}
                  onChange={(e) =>
                    setSmtpSettings({
                      ...smtpSettings,
                      sender_email: e.target.value,
                      smtp_user:
                        smtpSettings.provider === 'gmail'
                          ? e.target.value
                          : smtpSettings.smtp_user
                    })
                  }
                  placeholder="store@gmail.com or info@yourdomain.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm"
                />
              </div>
            </div>

            {(smtpSettings.provider === 'gmail' || smtpSettings.provider === 'custom_smtp') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {smtpSettings.provider === 'custom_smtp' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={smtpSettings.smtp_host || ''}
                        onChange={(e) =>
                          setSmtpSettings({ ...smtpSettings, smtp_host: e.target.value })
                        }
                        placeholder="mail.yourdomain.com"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        SMTP SSL Port
                      </label>
                      <input
                        type="number"
                        value={smtpSettings.smtp_port || 465}
                        onChange={(e) =>
                          setSmtpSettings({
                            ...smtpSettings,
                            smtp_port: Number(e.target.value) || 465
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    SMTP Username / Gmail Address
                  </label>
                  <input
                    type="text"
                    value={smtpSettings.smtp_user || ''}
                    onChange={(e) =>
                      setSmtpSettings({ ...smtpSettings, smtp_user: e.target.value })
                    }
                    placeholder="yourname@gmail.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {smtpSettings.provider === 'gmail'
                      ? '16-Digit Gmail App Password'
                      : 'SMTP Password'}
                  </label>
                  <input
                    type="password"
                    value={smtpSettings.smtp_pass || ''}
                    onChange={(e) =>
                      setSmtpSettings({ ...smtpSettings, smtp_pass: e.target.value })
                    }
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm"
                  />
                </div>
              </div>
            )}

            {(smtpSettings.provider === 'resend' || smtpSettings.provider === 'brevo') && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {smtpSettings.provider === 'resend' ? 'Resend API Key' : 'Brevo v3 API Key'}
                </label>
                <input
                  type="password"
                  value={smtpSettings.api_key || ''}
                  onChange={(e) =>
                    setSmtpSettings({ ...smtpSettings, api_key: e.target.value })
                  }
                  placeholder="re_123456789... or xkeysib-..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm"
                />
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingSmtp}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {savingSmtp ? 'Saving...' : 'Save Email Sender Settings'}
              </button>
            </div>
          </form>

          <div className="lg:col-span-5 bg-slate-50 rounded-2xl border border-slate-200/90 p-5 space-y-4">
            <h4 className="text-sm font-extrabold text-slate-900">
              How Open & Click Tracking Works Automatically
            </h4>
            <ul className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <strong className="text-slate-900">1x1 Invisible Tracking Pixel:</strong> Every outgoing email contains a unique transparent GIF pixel URL. As soon as a customer opens the email in Gmail, Yahoo, or Outlook, the open count and timestamp are logged in real time.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <strong className="text-slate-900">Smart Click Redirect Wrapper:</strong> Your CTA button link is wrapped with a high-speed 302 redirect tracker so you can see exactly which recipient clicked your offer link.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <strong className="text-slate-900">Easy Gmail App Password Setup:</strong> Go to your Google Account &rarr; Security &rarr; 2-Step Verification &rarr; App Passwords, generate a 16-letter code, and paste it here to send up to 500 free emails/day from your own Gmail!
                </div>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Bulk CSV / Copy-Paste Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Bulk Import Email Subscribers
              </h3>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Paste one subscriber per line in the format: <code>email@example.com, Full Name</code>
            </p>
            <textarea
              rows={6}
              value={bulkImportText}
              onChange={(e) => setBulkImportText(e.target.value)}
              placeholder={`rahim@gmail.com, Rahim Uddin\nsadia.islam@yahoo.com, Sadia Islam\ntanvir@outlook.com, Tanvir Hasan`}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkImportSubscribers}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white"
              >
                Import Subscribers
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recipient Open & Click Tracking Log Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedCampaign.name} — Recipient Tracking Log
                </h3>
                <p className="text-xs text-slate-500">
                  Subject: {selectedCampaign.subject}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCampaign(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-600 font-medium">
                Live Open Tracking Pixel URL (embedded in HTML):
              </span>
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/api/email-campaigns/track/open/${selectedCampaign.id}?e=customer@example.com`;
                  navigator.clipboard.writeText(url);
                  setCopiedPixel(true);
                  setTimeout(() => setCopiedPixel(false), 2000);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold text-purple-700 hover:bg-purple-50 cursor-pointer"
              >
                {copiedPixel ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedPixel ? 'Copied Pixel URL' : 'Copy Open Pixel URL'}
              </button>
            </div>

            <div className="overflow-y-auto flex-1 border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold uppercase text-slate-400 border-b border-slate-100">
                    <th className="py-2.5 px-4">Recipient</th>
                    <th className="py-2.5 px-4">Open Status</th>
                    <th className="py-2.5 px-4">Link Click Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {(selectedCampaign.recipients || []).map((rec, i) => (
                    <tr key={i}>
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-slate-800">{rec.name || 'Customer'}</div>
                        <div className="text-slate-500">{rec.email}</div>
                      </td>
                      <td className="py-2.5 px-4">
                        {rec.opened ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold">
                            <Eye className="w-3 h-3" /> Opened ({rec.open_count}x)
                          </span>
                        ) : (
                          <span className="text-slate-400">Not opened yet</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        {rec.clicked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold">
                            <MousePointerClick className="w-3 h-3" /> Clicked ({rec.click_count}x)
                          </span>
                        ) : (
                          <span className="text-slate-400">No clicks yet</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
