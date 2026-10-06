import React, { useState, useEffect } from 'react';
import {
  X,
  Facebook,
  Instagram,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Check,
  Sparkles,
  QrCode,
  ShieldCheck,
  ArrowRight,
  Camera
} from 'lucide-react';
import { api } from '../../api';
import { Channel } from '../../types';

declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

interface DiscoveredPage {
  id: string;
  name: string;
  category?: string;
  picture_url?: string;
  has_token?: boolean;
  token_preview?: string;
  instagram_business_account?: {
    id: string;
    username?: string;
    name?: string;
    profile_picture_url?: string;
  };
}

interface DiscoveredWhatsApp {
  id: string;
  waba_id: string;
  waba_name: string;
  display_phone_number: string;
  verified_name?: string;
  quality_rating?: string;
  has_token?: boolean;
  token_preview?: string;
}

interface MetaAutoConnectModalProps {
  isOpen: boolean;
  platform: 'messenger' | 'instagram' | 'whatsapp';
  onClose: () => void;
  onSuccess: (channel: Channel) => void;
}

export const MetaAutoConnectModal: React.FC<MetaAutoConnectModalProps> = ({
  isOpen,
  platform,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<DiscoveredPage[]>([]);
  const [whatsappNumbers, setWhatsappNumbers] = useState<DiscoveredWhatsApp[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [alsoConnectLinkedIg, setAlsoConnectLinkedIg] = useState<boolean>(true);
  const [step, setStep] = useState<'auth' | 'select'>('auth');
  const [metaAppId, setMetaAppId] = useState<string>('');
  const [waConnectTab, setWaConnectTab] = useState<'qr' | 'auto' | 'manual'>('qr');
  const [qrCountdown, setQrCountdown] = useState<number>(60);
  const [qrSessionId, setQrSessionId] = useState<string>('');
  const [qrPhone, setQrPhone] = useState<string>('');
  const [isPairingQr, setIsPairingQr] = useState<boolean>(false);
  const [manualWaPhone, setManualWaPhone] = useState<string>('');
  const [manualWaName, setManualWaName] = useState<string>('');
  const [manualWabaId, setManualWabaId] = useState<string>('');
  const [manualWaPhoneId, setManualWaPhoneId] = useState<string>('');
  const [manualWaToken, setManualWaToken] = useState<string>('');
  const [showAdvancedWaConfig, setShowAdvancedWaConfig] = useState<boolean>(false);

  const refreshQrSession = () => {
    api.getWhatsAppQR()
      .then((res) => {
        setQrSessionId(res.sessionId);
        setQrCountdown(res.expiresInSeconds || 60);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (isOpen && platform === 'whatsapp' && waConnectTab === 'qr') {
      refreshQrSession();
    }
  }, [isOpen, platform, waConnectTab]);

  useEffect(() => {
    if (!isOpen || platform !== 'whatsapp' || waConnectTab !== 'qr') return;
    const interval = setInterval(() => {
      setQrCountdown((prev) => {
        if (prev <= 1) {
          refreshQrSession();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, platform, waConnectTab]);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);

    api
      .getMetaConfig()
      .then((cfg) => {
        if (cfg.appId) {
          setMetaAppId(cfg.appId);
          initFacebookJsSdk(cfg.appId);
        }
      })
      .catch(() => {});

    // Check if user already authorized and has pages ready to select
    api
      .getMetaPendingAssets()
      .then((assets) => {
        if (assets.available) {
          const hasPages = assets.pages && assets.pages.length > 0;
          const hasWa = assets.whatsappNumbers && assets.whatsappNumbers.length > 0;
          if (platform === 'whatsapp' && hasWa) {
            setWhatsappNumbers(assets.whatsappNumbers || []);
            setPages(assets.pages || []);
            setSelectedAssetId(assets.whatsappNumbers![0].id);
            setStep('select');
            return;
          }
          if (platform !== 'whatsapp' && hasPages) {
            setPages(assets.pages || []);
            setWhatsappNumbers(assets.whatsappNumbers || []);
            setSelectedAssetId(assets.pages[0].id);
            setStep('select');
            return;
          }
        }
        setStep('auth');
      })
      .catch(() => {
        setStep('auth');
      });
  }, [isOpen, platform]);

  // Listen for postMessage from OAuth popup window
  useEffect(() => {
    if (!isOpen) return;

    const handlePopupMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'META_OAUTH_SUCCESS') {
        setLoading(true);
        setError(null);
        api
          .getMetaPendingAssets()
          .then((assets) => {
            setPages(assets.pages || []);
            setWhatsappNumbers(assets.whatsappNumbers || []);
            if (platform === 'whatsapp' && assets.whatsappNumbers && assets.whatsappNumbers.length > 0) {
              setSelectedAssetId(assets.whatsappNumbers[0].id);
              setStep('select');
            } else if (assets.pages && assets.pages.length > 0) {
              setSelectedAssetId(assets.pages[0].id);
              setStep('select');
            } else {
              setError('No Facebook Page or Business Account found in your account. Please select a page and try again.');
            }
          })
          .catch((err: any) => {
            setError(err.message || 'Failed to load pages list.');
          })
          .finally(() => {
            setLoading(false);
          });
      } else if (data.type === 'META_OAUTH_ERROR') {
        setLoading(false);
        setError(data.error || 'Login was not completed. Please try again.');
      }
    };

    window.addEventListener('message', handlePopupMessage);
    return () => window.removeEventListener('message', handlePopupMessage);
  }, [isOpen, platform]);

  const initFacebookJsSdk = (appId: string) => {
    if (!appId) return;
    if (window.FB) {
      try {
        window.FB.init({
          appId,
          cookie: true,
          xfbml: false,
          version: 'v21.0'
        });
      } catch (_e) {}
      return;
    }

    window.fbAsyncInit = function () {
      if (window.FB) {
        window.FB.init({
          appId,
          cookie: true,
          xfbml: false,
          version: 'v21.0'
        });
      }
    };

    if (!document.getElementById('facebook-jssdk')) {
      const js = document.createElement('script');
      js.id = 'facebook-jssdk';
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      js.async = true;
      js.defer = true;
      document.body.appendChild(js);
    }
  };

  if (!isOpen) return null;

  // Launch Meta Official WhatsApp Onboarding via Server-Side OAuth Dialog (Never fails with "JSSDK option is not toggled")
  const handleWhatsAppEmbeddedSignup = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getMetaAuthUrl('whatsapp', true);
      if (res.authUrl) {
        const width = 620;
        const height = 720;
        const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
        const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);

        const popup = window.open(
          res.authUrl,
          'oneagentbd_meta_wa_onboarding',
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=yes`
        );

        if (!popup) {
          window.location.href = res.authUrl;
        } else {
          setLoading(false);
        }
        return;
      }
      setLoading(false);
      handleSingleClickMetaLogin();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to open WhatsApp onboarding popup.');
    }
  };

  const handleManualWhatsAppConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = manualWaPhone.trim();
    const cleanPhoneId = manualWaPhoneId.trim();

    if (!cleanPhone && !cleanPhoneId) {
      setError('Please enter your WhatsApp Phone Number (e.g. +88017XXXXXXXX).');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await api.autoConnectWhatsApp({
        wabaId: manualWabaId.trim() || undefined,
        phoneNumberId: cleanPhoneId || cleanPhone,
        displayPhoneNumber: cleanPhone || cleanPhoneId,
        verifiedName: manualWaName.trim() || (cleanPhone ? `WhatsApp (${cleanPhone})` : 'WhatsApp Business'),
        accessToken: manualWaToken.trim() || undefined
      });
      onSuccess(res.channel);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to connect WhatsApp number.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteQrScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setIsPairingQr(true);
      setError(null);
      const res = await api.pairWhatsAppQR({
        phoneNumber: qrPhone || '+8801700000000',
        displayTitle: qrPhone ? `WhatsApp (${qrPhone})` : 'WhatsApp Business (Linked Device)',
        sessionId: qrSessionId
      });
      if (res.channel) {
        onSuccess(res.channel);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to link WhatsApp device.');
    } finally {
      setIsPairingQr(false);
    }
  };

  // Single Automatic Login Handler (tries OAuth Popup / FB SDK seamlessly)
  const handleSingleClickMetaLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Try official OAuth dialog popup first (most reliable across browsers & iframes)
      const res = await api.getMetaAuthUrl(platform);
      if (res.authUrl) {
        const width = 600;
        const height = 700;
        const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
        const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);

        const popup = window.open(
          res.authUrl,
          'oneagentbd_meta_oauth',
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=yes`
        );

        if (!popup) {
          window.location.href = res.authUrl;
        } else {
          setLoading(false);
        }
        return;
      }

      // 2. If FB JS SDK is available with metaAppId, use FB.login
      if (window.FB && metaAppId) {
        let scopes = 'pages_manage_metadata,pages_read_engagement,pages_messaging,business_management,pages_show_list';
        if (platform === 'instagram') {
          scopes = 'pages_manage_metadata,pages_read_engagement,pages_messaging,business_management,pages_show_list,instagram_basic,instagram_manage_messages';
        } else if (platform === 'whatsapp') {
          scopes = 'pages_manage_metadata,pages_read_engagement,pages_messaging,business_management,whatsapp_business_management,whatsapp_business_messaging,pages_show_list';
        }

        window.FB.login(
          (response: any) => {
            if (response?.authResponse?.accessToken) {
              api
                .exchangeMetaToken(response.authResponse.accessToken, platform)
                .then((outcome) => {
                  setPages(outcome.pages || []);
                  setWhatsappNumbers(outcome.whatsappNumbers || []);
                  if (platform === 'whatsapp' && outcome.whatsappNumbers && outcome.whatsappNumbers.length > 0) {
                    setSelectedAssetId(outcome.whatsappNumbers[0].id);
                    setStep('select');
                  } else if (outcome.pages && outcome.pages.length > 0) {
                    setSelectedAssetId(outcome.pages[0].id);
                    setStep('select');
                  } else {
                    setError('No pages found. Please select at least one page during Facebook login.');
                  }
                })
                .catch((err: any) => {
                  setError(err.message || 'Failed to connect account.');
                })
                .finally(() => {
                  setLoading(false);
                });
            } else {
              setLoading(false);
              setError('Login was cancelled.');
            }
          },
          { scope: scopes }
        );
        return;
      }

      setLoading(false);
      setError('Meta App ID is not configured on the server yet. Please complete Meta App Setup from the Admin panel.');
    } catch (err: any) {
      setError(err.message || 'Failed to initiate login.');
      setLoading(false);
    }
  };

  // Confirm selected Page / Instagram / WhatsApp Number (everything else happens automatically)
  const handleConfirmSelection = async () => {
    if (!selectedAssetId) return;
    try {
      setLoading(true);
      setError(null);

      if (platform === 'whatsapp') {
        const targetWa = whatsappNumbers.find((w) => w.id === selectedAssetId);
        if (targetWa) {
          const res = await api.autoConnectWhatsApp({
            phoneNumberId: targetWa.id,
            displayPhoneNumber: targetWa.display_phone_number,
            verifiedName: targetWa.verified_name,
            wabaId: targetWa.waba_id
          });
          onSuccess(res.channel);
          onClose();
          return;
        }
      }

      const targetPage = pages.find((p) => p.id === selectedAssetId);
      if (!targetPage) throw new Error('Please select a page or account.');

      if (platform === 'messenger') {
        const res = await api.selectMetaPage(targetPage.id, targetPage.name, targetPage.category);
        if (alsoConnectLinkedIg && targetPage.instagram_business_account?.id) {
          try {
            await api.selectMetaInstagram(
              targetPage.instagram_business_account.id,
              targetPage.instagram_business_account.username || targetPage.name,
              targetPage.id
            );
          } catch (_igErr) {}
        }
        onSuccess(res.channel);
        onClose();
      } else if (platform === 'instagram') {
        const igId = targetPage.instagram_business_account?.id || targetPage.id;
        const igUser =
          targetPage.instagram_business_account?.username ||
          targetPage.name.toLowerCase().replace(/\s+/g, '_');
        const res = await api.selectMetaInstagram(igId, igUser, targetPage.id);
        onSuccess(res.channel);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect account.');
    } finally {
      setLoading(false);
    }
  };

  const getPlatformInfo = () => {
    switch (platform) {
      case 'messenger':
        return {
          title: 'Connect Facebook Page',
          subtitle: 'Log in to your Facebook account and select the Page where you want to activate AI Auto-Reply. Everything else is configured automatically.',
          btnLabel: 'Continue with Facebook',
          btnClass: 'bg-[#1877F2] hover:bg-[#166fe5] shadow-[#1877F2]/25',
          icon: Facebook,
          color: 'text-[#1877F2]',
          bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
        };
      case 'instagram':
        return {
          title: 'Connect Instagram Account',
          subtitle: 'Log in to your account and select the Instagram Business profile where you want to activate AI Auto-Reply.',
          btnLabel: 'Continue with Instagram (via Meta)',
          btnClass: 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 shadow-pink-500/20',
          icon: Instagram,
          color: 'text-pink-600',
          bgColor: 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800'
        };
      case 'whatsapp':
        return {
          title: 'Connect WhatsApp (Linked Devices)',
          subtitle: 'Scan the QR code with your phone. Zero data loss — all existing chats, groups, and customer contacts stay 100% safe.',
          btnLabel: 'Continue with WhatsApp Business',
          btnClass: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25',
          icon: Smartphone,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
        };
    }
  };

  const info = getPlatformInfo();
  const Icon = info.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto p-5 sm:p-7 bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center mb-6 pt-2">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border mb-3.5 ${info.bgColor}`}>
            <Icon className={`w-7 h-7 ${info.color}`} />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            {info.title}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
            {info.subtitle}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* STEP 1: Single Button Login or Direct Number Connect */}
        {step === 'auth' && (
          <div className="space-y-4">
            {platform === 'whatsapp' && (
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <button
                  type="button"
                  onClick={() => setWaConnectTab('auto')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    waConnectTab === 'auto'
                      ? 'bg-white dark:bg-neutral-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>1. Embedded Signup</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWaConnectTab('manual')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    waConnectTab === 'manual'
                      ? 'bg-white dark:bg-neutral-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  <span>2. Manual API Credentials</span>
                </button>
              </div>
            )}

            {platform === 'whatsapp' && waConnectTab === 'auto' ? (
              <div className="space-y-4 text-center animate-in fade-in duration-150">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Official Meta WhatsApp Embedded Signup</span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    নিচের বাটনে ক্লিক করলে মেটার অফিসিয়াল ফেসবুক অনবোর্ডিং পপআপ ওপেন হবে। সেখান থেকে আপনার ব্যবসা ও WhatsApp নম্বরটি নির্বাচন করে OTP দিয়ে ভেরিফাই করলেই আপনার একাউন্টটি স্বয়ংক্রিয়ভাবে AI Agent হিসেবে সক্রিয় হয়ে যাবে।
                  </p>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleWhatsAppEmbeddedSignup}
                  className="w-full py-4 px-5 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-sm shadow-lg shadow-[#1877F2]/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Opening Meta Embedded Signup...</span>
                    </>
                  ) : (
                    <>
                      <Facebook className="w-5 h-5 fill-current" />
                      <span>Continue with Facebook (WhatsApp Onboarding)</span>
                    </>
                  )}
                </button>
              </div>
            ) : platform === 'whatsapp' && waConnectTab === 'manual' ? (
              <form onSubmit={handleManualWhatsAppConnect} className="space-y-3.5 text-left">
                {/* Zero Data Loss Notice Card */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-800/70 text-left space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Meta Cloud API Configuration</span>
                  </div>
                  <p className="text-[11px] text-emerald-900/90 dark:text-emerald-200/90 leading-relaxed">
                    Official Meta WABA integration for enterprise numbers via Cloud API.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                    WhatsApp Business Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={manualWaPhone}
                    onChange={(e) => setManualWaPhone(e.target.value)}
                    placeholder="e.g. +88017XXXXXXXX or 017XXXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs sm:text-sm font-mono text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block mt-0.5">
                    Enter the WhatsApp number customers message you on.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Business / Store Display Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={manualWaName}
                    onChange={(e) => setManualWaName(e.target.value)}
                    placeholder="e.g. My Shop / Official Helpline"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs sm:text-sm text-neutral-900 dark:text-white"
                  />
                </div>

                {/* Optional Developer Advanced Meta Credentials */}
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedWaConfig(!showAdvancedWaConfig)}
                    className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showAdvancedWaConfig ? '▼ Hide Custom Meta Developer IDs' : '▶ Custom Meta Developer IDs (Optional for custom WABA owners)'}</span>
                  </button>

                  {showAdvancedWaConfig && (
                    <div className="mt-2.5 p-3 rounded-2xl bg-neutral-100/90 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-2.5 animate-in fade-in duration-150">
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-0.5">
                          Custom WABA ID (Optional)
                        </label>
                        <input
                          type="text"
                          value={manualWabaId}
                          onChange={(e) => setManualWabaId(e.target.value)}
                          placeholder="e.g. 1098160382932544"
                          className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono text-neutral-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-0.5">
                          Custom Phone Number ID (Optional)
                        </label>
                        <input
                          type="text"
                          value={manualWaPhoneId}
                          onChange={(e) => setManualWaPhoneId(e.target.value)}
                          placeholder="e.g. 1248549471684856"
                          className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono text-neutral-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-0.5">
                          Custom Access Token (Optional)
                        </label>
                        <input
                          type="password"
                          value={manualWaToken}
                          onChange={(e) => setManualWaToken(e.target.value)}
                          placeholder="Uses system Meta Master Token if left empty"
                          className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono text-neutral-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Connecting WhatsApp...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Connect WhatsApp Number Now</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSingleClickMetaLogin}
                  className={`w-full py-3.5 px-5 rounded-2xl text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 ${info.btnClass}`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Connecting to Meta...</span>
                    </>
                  ) : (
                    <>
                      <Icon className="w-4 h-4" />
                      <span>{info.btnLabel}</span>
                    </>
                  )}
                </button>

                {platform === 'whatsapp' && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2.5 text-left">
                    <p className="text-[11px] text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
                      <strong>How to add a new WhatsApp number via OTP/QR:</strong><br />
                      1) Open <strong>1. WhatsApp Manager ↗</strong> below and click <strong>+ Add phone number</strong> to verify your number via OTP.<br />
                      2) Then click <strong>2. Re-Select Number</strong> and choose <strong>&ldquo;Edit settings&rdquo;</strong> in the Meta popup to check your new number:
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href="https://business.facebook.com/wa/manage/phone-numbers/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center"
                      >
                        <Smartphone className="w-3.5 h-3.5 shrink-0" />
                        <span>1. WhatsApp Manager (+ Add Number) ↗</span>
                      </a>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleWhatsAppEmbeddedSignup}
                        className="py-2 px-3 rounded-xl bg-white dark:bg-neutral-800 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold hover:bg-emerald-50 transition-all cursor-pointer"
                      >
                        2. Re-Select Number
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-800 text-center">
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#7F22FE] shrink-0" />
                    <span>100% Automatic Connection — Simply select your account &amp; page</span>
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 2: Just Select Account / Page */}
        {step === 'select' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Select your Page / Account:
              </div>
              <button
                type="button"
                onClick={handleSingleClickMetaLogin}
                className="text-[11px] font-bold text-[#7F22FE] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Switch Account / Refresh</span>
              </button>
            </div>

            {platform !== 'whatsapp' && pages.length > 0 && (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {pages.map((p) => {
                  const isSelected = selectedAssetId === p.id;
                  const hasLinkedIg = Boolean(p.instagram_business_account?.id);
                  const displayName =
                    platform === 'instagram' && p.instagram_business_account?.username
                      ? `@${p.instagram_business_account.username}`
                      : p.name;

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedAssetId(p.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#7F22FE] bg-[#7F22FE]/5 ring-2 ring-[#7F22FE]/20'
                          : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {p.picture_url ? (
                            <img
                              src={p.picture_url}
                              alt={p.name}
                              className="w-10 h-10 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${info.bgColor}`}>
                              <Icon className={`w-5 h-5 ${info.color}`} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-sm text-neutral-900 dark:text-white block truncate">
                              {displayName}
                            </span>
                            {hasLinkedIg && platform === 'messenger' && (
                              <span className="text-[11px] text-pink-600 dark:text-pink-400 font-medium block truncate">
                                + Instagram: @{p.instagram_business_account?.username}
                              </span>
                            )}
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-[#7F22FE] bg-[#7F22FE] text-white'
                              : 'border-neutral-300 dark:border-neutral-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>

                      {isSelected && platform === 'messenger' && hasLinkedIg && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setAlsoConnectLinkedIg(!alsoConnectLinkedIg);
                          }}
                          className="mt-2.5 pt-2 border-t border-neutral-200/70 dark:border-neutral-700/70 flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={alsoConnectLinkedIg}
                            onChange={(e) => setAlsoConnectLinkedIg(e.target.checked)}
                            className="rounded text-[#7F22FE]"
                          />
                          <span>Also connect linked Instagram (@{p.instagram_business_account?.username})</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {platform === 'whatsapp' && whatsappNumbers.length > 0 && (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {whatsappNumbers.map((w) => {
                  const isSelected = selectedAssetId === w.id;
                  return (
                    <div
                      key={w.id}
                      onClick={() => setSelectedAssetId(w.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                          : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-sm text-neutral-900 dark:text-white block">
                            {w.verified_name || w.waba_name}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {w.display_phone_number}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-neutral-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {platform === 'whatsapp' && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2.5">
                <p className="text-[11px] text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
                  Don&apos;t see your number in the list? First add your number in <strong>Meta WhatsApp Manager ↗</strong>, then click <strong>Re-Select Number</strong> and choose <em>&ldquo;Edit previous settings&rdquo;</em> in the popup:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="https://business.facebook.com/wa/manage/phone-numbers/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center"
                  >
                    <Smartphone className="w-3.5 h-3.5 shrink-0" />
                    <span>1. Meta WhatsApp Manager (+ Add Number) ↗</span>
                  </a>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleWhatsAppEmbeddedSignup}
                    className="py-2 px-3 rounded-xl bg-white dark:bg-neutral-800 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold hover:bg-emerald-50 transition-all cursor-pointer"
                  >
                    2. Re-Select Number
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={loading || !selectedAssetId}
              onClick={handleConfirmSelection}
              className="w-full py-3.5 px-5 rounded-2xl bg-[#7F22FE] hover:bg-[#6c1ce0] disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-[#7F22FE]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Connect &amp; Activate AI</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
