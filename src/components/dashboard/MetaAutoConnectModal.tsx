import React, { useState, useEffect, useRef } from 'react';
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
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Key
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
  const [metaConfigId, setMetaConfigId] = useState<string>('');
  const [showWaHelp, setShowWaHelp] = useState<boolean>(false);
  const [waMode, setWaMode] = useState<'embedded' | 'direct'>('embedded');

  // Direct WhatsApp Connect form state
  const [directPhoneNumberId, setDirectPhoneNumberId] = useState('');
  const [directDisplayNumber, setDirectDisplayNumber] = useState('');
  const [directVerifiedName, setDirectVerifiedName] = useState('');
  const [directWabaId, setDirectWabaId] = useState('');
  const [directAccessToken, setDirectAccessToken] = useState('');

  const capturedWaDataRef = useRef<{ phone_number_id?: string; waba_id?: string }>({});

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    capturedWaDataRef.current = {};

    api
      .getMetaConfig()
      .then((cfg: any) => {
        if (cfg.appId) {
          setMetaAppId(cfg.appId);
          initFacebookJsSdk(cfg.appId);
        }
        if (cfg.configId) {
          setMetaConfigId(cfg.configId);
        }
      })
      .catch(() => {});

    // Check if user already authorized and has pending assets to select
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

  // Listen for official Meta sessionInfoListener & OAuth popup postMessage
  useEffect(() => {
    if (!isOpen) return;

    const handleWindowMessage = (event: MessageEvent) => {
      // 1. Official Meta WhatsApp Embedded Signup sessionInfoListener
      if (
        event.origin &&
        (event.origin.includes('facebook.com') || event.origin.includes('meta.com'))
      ) {
        try {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          if (data?.type === 'WA_EMBEDDED_SIGNUP') {
            if (data.event === 'FINISH') {
              const phoneId = data.data?.phone_number_id;
              const wabaId = data.data?.waba_id;
              capturedWaDataRef.current = {
                phone_number_id: phoneId,
                waba_id: wabaId
              };
            }
          }
        } catch (_e) {}
      }

      // 2. OAuth Popup callback handler
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
            } else if (platform !== 'whatsapp' && assets.pages && assets.pages.length > 0) {
              setSelectedAssetId(assets.pages[0].id);
              setStep('select');
            } else if (platform === 'whatsapp') {
              setError('ফেসবুক লগইন সফল হয়েছে, কিন্তু এই ফেসবুক অ্যাকাউন্টে কোনো সক্রিয় WhatsApp Business অ্যাকাউন্ট বা ফোন নম্বর পাওয়া যায়নি। আপনি নিচের ফর্মে সরাসরি Phone Number ID দিয়ে অথবা Meta Developer Portal থেকে WABA সেটআপ করে সহজেই কানেক্ট করতে পারেন।');
              setWaMode('direct');
            } else {
              setError('Meta অ্যাকাউন্ট লগইন সফল হয়েছে, কিন্তু কোনো ফেসবুক পেজ পাওয়া যায়নি। অনুগ্রহ করে একটি পেজ তৈরি করে আবার চেষ্টা করুন।');
            }
          })
          .catch((err: any) => {
            setError(err.message || 'Failed to load assets list.');
          })
          .finally(() => {
            setLoading(false);
          });
      } else if (data.type === 'META_OAUTH_ERROR') {
        setLoading(false);
        setError(data.error || 'Login was not completed. Please try again.');
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
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

  // Official Meta WhatsApp Embedded Signup (1-Click flow)
  const handleWhatsAppEmbeddedSignup = async () => {
    try {
      setLoading(true);
      setError(null);

      // Strategy A: If Facebook JavaScript SDK is loaded, use FB.login with standard business login scopes
      if (window.FB && metaAppId) {
        const loginOptions: any = {
          response_type: 'code',
          override_default_response_type: true
        };

        if (metaConfigId) {
          loginOptions.config_id = metaConfigId;
        } else {
          loginOptions.scope =
            'whatsapp_business_management,whatsapp_business_messaging,business_management';
        }

        window.FB.login(
          (response: any) => {
            if (response?.authResponse?.code || response?.authResponse?.accessToken) {
              const code = response.authResponse?.code;
              const accessToken = response.authResponse?.accessToken;
              const wabaId = capturedWaDataRef.current.waba_id;
              const phoneNumberId = capturedWaDataRef.current.phone_number_id;

              api
                .whatsappEmbeddedSignup({
                  code,
                  accessToken,
                  wabaId,
                  phoneNumberId
                })
                .then((res) => {
                  if (res.channel) {
                    onSuccess(res.channel);
                    onClose();
                  } else if (res.whatsappNumbers && res.whatsappNumbers.length > 0) {
                    setWhatsappNumbers(res.whatsappNumbers);
                    setSelectedAssetId(res.whatsappNumbers[0].id);
                    setStep('select');
                  } else {
                    setError('WhatsApp number verified. Please select your number to confirm.');
                  }
                })
                .catch((err: any) => {
                  setError(err.message || 'Failed to complete WhatsApp Embedded Signup.');
                })
                .finally(() => {
                  setLoading(false);
                });
            } else {
              setLoading(false);
              if (response?.status !== 'connected') {
                // If cancelled or closed
              }
            }
          },
          loginOptions
        );
        return;
      }

      // Strategy B: Fallback to Server-Side Meta OAuth Dialog Popup
      const res = await api.getMetaAuthUrl('whatsapp', true);
      if (res.authUrl) {
        const width = 640;
        const height = 750;
        const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
        const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);

        const popup = window.open(
          res.authUrl,
          'oneagentbd_meta_wa_embedded_signup',
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
      setError('Meta App ID is not configured on the server yet. Please configure Meta App ID in Admin settings.');
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to open WhatsApp Embedded Signup.');
    }
  };

  // Direct Phone Number ID WhatsApp Connection Handler
  const handleDirectWhatsAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhoneId = directPhoneNumberId.trim();
    if (!cleanPhoneId) {
      setError('Phone Number ID বা Business Phone Number দেওয়া আবশ্যক।');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.autoConnectWhatsApp({
        phoneNumberId: cleanPhoneId,
        displayPhoneNumber: directDisplayNumber.trim() || cleanPhoneId,
        verifiedName: directVerifiedName.trim() || undefined,
        wabaId: directWabaId.trim() || undefined,
        accessToken: directAccessToken.trim() || undefined
      });

      if (res.channel) {
        onSuccess(res.channel);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'WhatsApp চ্যানেল সংযোগ করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  // Facebook Messenger & Instagram 1-Click Login Handler
  const handleSingleClickMetaLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      if (platform === 'whatsapp') {
        return handleWhatsAppEmbeddedSignup();
      }

      // 1. Try official OAuth dialog popup
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

      // 2. FB JS SDK fallback
      if (window.FB && metaAppId) {
        let scopes = 'pages_manage_metadata,pages_read_engagement,pages_messaging,business_management,pages_show_list';
        if (platform === 'instagram') {
          scopes = 'pages_manage_metadata,pages_read_engagement,pages_messaging,business_management,pages_show_list,instagram_basic,instagram_manage_messages';
        }

        window.FB.login(
          (response: any) => {
            if (response?.authResponse?.accessToken) {
              api
                .exchangeMetaToken(response.authResponse.accessToken, platform)
                .then((outcome) => {
                  setPages(outcome.pages || []);
                  setWhatsappNumbers(outcome.whatsappNumbers || []);
                  if (outcome.pages && outcome.pages.length > 0) {
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

  // Confirm selected Asset (Page or WhatsApp Number)
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
          subtitle: 'Log in with Facebook and select the Page where you want to activate AI Auto-Reply.',
          btnLabel: 'Continue with Facebook',
          btnClass: 'bg-[#1877F2] hover:bg-[#166fe5] shadow-[#1877F2]/25',
          icon: Facebook,
          color: 'text-[#1877F2]',
          bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
        };
      case 'instagram':
        return {
          title: 'Connect Instagram Account',
          subtitle: 'Log in with Facebook and select the Instagram Business profile to activate AI Auto-Reply.',
          btnLabel: 'Continue with Instagram (via Meta)',
          btnClass: 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 shadow-pink-500/20',
          icon: Instagram,
          color: 'text-pink-600',
          bgColor: 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800'
        };
      case 'whatsapp':
        return {
          title: 'Connect WhatsApp Business',
          subtitle: 'Official Meta WhatsApp Embedded Signup. Connect your existing number in 1-Click with Zero Data Loss.',
          btnLabel: 'Connect WhatsApp (Meta Embedded Signup)',
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

        {/* STEP 1: 1-Click Embedded Signup */}
        {step === 'auth' && (
          <div className="space-y-4">
            {platform === 'whatsapp' ? (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* 2-Option Segmented Tab: 1-Click Embedded vs Direct Phone ID */}
                <div className="flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setWaMode('embedded');
                      setError(null);
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      waMode === 'embedded'
                        ? 'bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Meta 1-Click Signup</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWaMode('direct');
                      setError(null);
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      waMode === 'direct'
                        ? 'bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                    }`}
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Phone Number ID দিয়ে কানেক্ট</span>
                  </button>
                </div>

                {waMode === 'embedded' ? (
                  <div className="space-y-4 text-center animate-in fade-in duration-150">
                    {/* Official Meta Tech Provider & Zero Data Loss Guarantee */}
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left space-y-2.5">
                      <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>100% Zero Data Loss Guarantee</span>
                      </div>
                      <ul className="text-xs text-neutral-600 dark:text-neutral-300 space-y-1.5 leading-relaxed">
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold shrink-0">✓</span>
                          <span>আপনার ফোনের বর্তমান WhatsApp চ্যাট বা কাস্টমার ডেটা হারাবে না।</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold shrink-0">✓</span>
                          <span>অফিসিয়াল Meta Embedded Signup পপআপে ১-ক্লিকে নম্বর নির্বাচন ও OTP ভেরিফাই হবে।</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold shrink-0">✓</span>
                          <span>AI Agent সঙ্গে সঙ্গে সক্রিয় হয়ে ২৪/৭ মেসেজ ও ভয়েস রিপ্লাই শুরু করবে।</span>
                        </li>
                      </ul>
                    </div>

                    {/* Primary Embedded Signup Button */}
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleWhatsAppEmbeddedSignup}
                      className="w-full py-4 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Opening Meta Embedded Signup...</span>
                        </>
                      ) : (
                        <>
                          <Smartphone className="w-5 h-5" />
                          <span>Connect WhatsApp (Meta Embedded Signup)</span>
                        </>
                      )}
                    </button>

                    {/* Helpful Troubleshooting Guide for Registration & PIN */}
                    <div className="pt-2 text-left">
                      <button
                        type="button"
                        onClick={() => setShowWaHelp(!showWaHelp)}
                        className="w-full flex items-center justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 py-1.5 px-2 rounded-lg transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>নম্বর যোগ বা রেজিস্ট্রেশন/পিন দিতে সমস্যা হলে সমাধান দেখুন</span>
                        </span>
                        {showWaHelp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {showWaHelp && (
                        <div className="mt-2.5 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-300 space-y-2.5 animate-in fade-in duration-150 leading-relaxed">
                          <div className="space-y-1">
                            <p className="font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-1.5">
                              <Key className="w-3 h-3 text-amber-500" />
                              <span>১. পাসওয়ার্ড নিচ্ছে না / পিন এরর দিচ্ছে কেন?</span>
                            </p>
                            <p className="text-neutral-600 dark:text-neutral-400 pl-4.5">
                              Meta রেজিস্ট্রেশনের সময় কোনো টেক্সট পাসওয়ার্ড চায় না। এখানে <strong>শুধুমাত্র ৬টি সংখ্যার পিন</strong> (যেমন: <code className="bg-neutral-200 dark:bg-neutral-800 px-1 py-0.5 rounded text-neutral-800 dark:text-neutral-200">123456</code>) দিতে হবে। অক্ষরের পাসওয়ার্ড দিলে Meta এরর দেয়।
                            </p>
                          </div>

                          <div className="space-y-1">
                            <p className="font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-1.5">
                              <AlertCircle className="w-3 h-3 text-rose-500" />
                              <span>২. নম্বরটি আগের অ্যাকাউন্টে থাকলে কি করবেন?</span>
                            </p>
                            <p className="text-neutral-600 dark:text-neutral-400 pl-4.5">
                              আগের Meta Business Suite (<strong>business.facebook.com</strong>) এ ঢুকে <strong>WhatsApp Manager &gt; Phone numbers</strong> থেকে নম্বরটি Delete করে রিলিজ করতে হবে। শুধু Meta App ডিলিট করলেই নম্বর রিলিজ হয় না।
                            </p>
                          </div>

                          <div className="space-y-1">
                            <p className="font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-1.5">
                              <Smartphone className="w-3 h-3 text-emerald-500" />
                              <span>৩. ফোনে স্বাভাবিক WhatsApp চালু থাকলে:</span>
                            </p>
                            <p className="text-neutral-600 dark:text-neutral-400 pl-4.5">
                              মোবাইলের সাধারণ WhatsApp বা WhatsApp Business অ্যাপ থেকে নম্বরটি Delete Account করতে হবে, কারণ ক্লাউড API এবং মোবাইল অ্যাপ একই নম্বরে একসাথে সচল থাকতে পারে না।
                            </p>
                          </div>

                          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300">
                            <strong>রেজিস্ট্রেশন না করলে কি হবে?</strong> নম্বর রেজিস্টার না হলে WhatsApp Cloud API থেকে কোনো মেসেজ আদান-প্রদান করা যায় না। তাই ৬ ডিজিট পিন দিয়ে রেজিস্ট্রেশন সম্পন্ন করা বাধ্যতামূলক।
                          </div>
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Powered by Official Meta WhatsApp Business Cloud API
                    </p>
                  </div>
                ) : (
                  /* DIRECT PHONE NUMBER ID FORM */
                  <form onSubmit={handleDirectWhatsAppSubmit} className="space-y-3.5 text-left animate-in fade-in duration-150">
                    <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-600 dark:text-neutral-300 space-y-1.5">
                      <p className="font-bold text-neutral-800 dark:text-white flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-emerald-600" />
                        <span>সরাসরি Phone Number ID দিয়ে ইনস্ট্যান্ট কানেক্ট</span>
                      </p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                        Meta Developer Portal (<strong>developers.facebook.com</strong>) এ <strong>WhatsApp &gt; API Setup</strong> পেজে গিয়ে আপনার <strong>Phone number ID</strong> কপি করে এখানে বসান। কোনো পপআপ বা পিন ঝামেলা ছাড়াই সরাসরি চ্যানেল যুক্ত হয়ে যাবে।
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                        Phone Number ID অথবা Business Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={directPhoneNumberId}
                        onChange={(e) => setDirectPhoneNumberId(e.target.value)}
                        placeholder="যেমন: 108375822394829 অথবা 88017XXXXXXXX"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                          Display Number (ঐচ্ছিক)
                        </label>
                        <input
                          type="text"
                          value={directDisplayNumber}
                          onChange={(e) => setDirectDisplayNumber(e.target.value)}
                          placeholder="+880 17XXXXXXXX"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                          Business Name (ঐচ্ছিক)
                        </label>
                        <input
                          type="text"
                          value={directVerifiedName}
                          onChange={(e) => setDirectVerifiedName(e.target.value)}
                          placeholder="ব্যবসার নাম"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        WABA ID (WhatsApp Business Account ID - ঐচ্ছিক)
                      </label>
                      <input
                        type="text"
                        value={directWabaId}
                        onChange={(e) => setDirectWabaId(e.target.value)}
                        placeholder="যেমন: 102837482947291"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Permanent Access Token (ঐচ্ছিক - খালি রাখলে সিস্টেম টোকেন কাজ করবে)
                      </label>
                      <input
                        type="password"
                        value={directAccessToken}
                        onChange={(e) => setDirectAccessToken(e.target.value)}
                        placeholder="EAAB... (খালি রাখলেও চলবে)"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !directPhoneNumberId.trim()}
                      className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Connecting WhatsApp Channel...</span>
                        </>
                      ) : (
                        <>
                          <Smartphone className="w-4 h-4" />
                          <span>WhatsApp চ্যানেল সংযুক্ত করুন</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
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

                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-800 text-center">
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#7F22FE] shrink-0" />
                    <span>100% Automatic Connection — Instant Page &amp; Channel Setup</span>
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 2: Selection (if multiple assets found) */}
        {step === 'select' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                {platform === 'whatsapp' ? 'Select WhatsApp Business Number:' : 'Select your Page / Account:'}
              </div>
              <button
                type="button"
                onClick={platform === 'whatsapp' ? handleWhatsAppEmbeddedSignup : handleSingleClickMetaLogin}
                className="text-[11px] font-bold text-[#7F22FE] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Switch / Reconnect</span>
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

            <button
              type="button"
              disabled={loading || !selectedAssetId}
              onClick={handleConfirmSelection}
              className={`w-full py-3.5 px-5 rounded-2xl text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                platform === 'whatsapp'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                  : 'bg-[#7F22FE] hover:bg-[#6c1ce0] shadow-[#7F22FE]/25'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span>Activate AI Agent on Selected {platform === 'whatsapp' ? 'Number' : 'Page'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
