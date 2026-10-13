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
  Key,
  Copy,
  ExternalLink,
  ShieldAlert
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
  const [waMode, setWaMode] = useState<'embedded' | 'direct'>('direct');
  const [detecting, setDetecting] = useState<boolean>(false);
  const [detectSuccess, setDetectSuccess] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Direct WhatsApp Connect form state
  const [directPhoneNumberId, setDirectPhoneNumberId] = useState('');
  const [directDisplayNumber, setDirectDisplayNumber] = useState('');
  const [directVerifiedName, setDirectVerifiedName] = useState('');
  const [directWabaId, setDirectWabaId] = useState('');
  const [directAccessToken, setDirectAccessToken] = useState('');

  // Direct Facebook Messenger Connect form state
  const [fbMode, setFbMode] = useState<'oauth' | 'direct'>('oauth');
  const [directPageId, setDirectPageId] = useState('');
  const [directPageName, setDirectPageName] = useState('');
  const [directPageToken, setDirectPageToken] = useState('');
  const [directPageSecret, setDirectPageSecret] = useState('');

  // Direct Instagram Connect form state
  const [igMode, setIgMode] = useState<'oauth' | 'direct'>('oauth');
  const [directIgId, setDirectIgId] = useState('');
  const [directIgUsername, setDirectIgUsername] = useState('');
  const [directIgToken, setDirectIgToken] = useState('');

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
              const phoneId =
                data.data?.phone_number_id ||
                data.data?.phoneNumberId ||
                data.data?.phone_numbers?.[0]?.id;
              const wabaId = data.data?.waba_id || data.data?.wabaId;
              capturedWaDataRef.current = {
                phone_number_id: phoneId ? String(phoneId) : undefined,
                waba_id: wabaId ? String(wabaId) : undefined
              };
            } else if (data.event === 'CANCEL') {
              setLoading(false);
            } else if (data.event === 'ERROR') {
              setLoading(false);
              setError(data.data?.error_message || 'WhatsApp Embedded Signup encounter an issue in Meta.');
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
          xfbml: true,
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
          xfbml: true,
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

      // Validate Configuration ID requirement for Meta WhatsApp Embedded Signup
      if (!metaConfigId) {
        setLoading(false);
        setError(
          'Meta Login Configuration ID (config_id) প্রয়োজন! Meta WhatsApp Embedded Signup চালানোর জন্য Meta Developer Portal (Facebook Login for Business > Configurations) এ একটি Configuration তৈরি করে সেটির ID অ্যাডমিন সেটিংসে সংরক্ষণ করা বাধ্যতামূলক। আপনি চাইলে পাশের ট্যাবে গিয়ে সরাসরি Phone Number ID দিয়ে কোনো কনফিগারেশন ছাড়াই কানেক্ট করতে পারেন।'
        );
        setShowWaHelp(true);
        return;
      }

      // Ensure Facebook JavaScript SDK is loaded
      if (!window.FB && metaAppId) {
        initFacebookJsSdk(metaAppId);
        // Wait a brief moment for script initialization
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      // Strategy A: If Facebook JavaScript SDK is loaded, use official FB.login with config_id
      if (window.FB && metaAppId) {
        const loginOptions: any = {
          config_id: metaConfigId,
          response_type: 'code',
          override_default_response_type: true,
          extras: {
            feature: 'whatsapp_embedded_signup',
            featureType: 'whatsapp_business_app_onboarding',
            sessionInfoVersion: '3',
            setup: {}
          }
        };

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
                setError(
                  'Meta Embedded Signup পপআপ সম্পন্ন হয়নি। নিশ্চিত করুন যে আপনার ব্রাউজারে লগইন করা Facebook অ্যাকাউন্টটি Meta App এর Admin/Developer রোলে আছে এবং Allowed Domains এ সাইটের ডোমেইন যোগ করা হয়েছে।'
                );
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

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDetectWhatsApp = async () => {
    const token = directAccessToken.trim();
    const phoneId = directPhoneNumberId.trim();
    if (!token && !phoneId) {
      setError('যাচাই করার জন্য Access Token অথবা Phone Number ID প্রবেশ করান।');
      return;
    }

    try {
      setDetecting(true);
      setError(null);
      setDetectSuccess(null);
      const res = await api.detectWhatsAppFromToken({
        accessToken: token || undefined,
        phoneNumberId: phoneId || undefined
      });

      if (res.phoneNumberId) {
        setDirectPhoneNumberId(res.phoneNumberId);
        if (res.displayPhoneNumber) setDirectDisplayNumber(res.displayPhoneNumber);
        if (res.verifiedName) setDirectVerifiedName(res.verifiedName);
        setDetectSuccess(`Meta Graph API থেকে তথ্য লোড হয়েছে: ${res.verifiedName || res.displayPhoneNumber} (ভেরিফাইড ✓)`);
      } else if (res.numbers && res.numbers.length > 0) {
        const first = res.numbers[0];
        setDirectPhoneNumberId(first.id);
        if (first.display_phone_number) setDirectDisplayNumber(first.display_phone_number);
        if (first.verified_name) setDirectVerifiedName(first.verified_name);
        if (first.waba_id) setDirectWabaId(first.waba_id);
        setDetectSuccess(`Meta Graph API থেকে ${res.numbers.length}টি ফোন নম্বর পাওয়া গেছে! ফিল্ডে স্বয়ংক্রিয়ভাবে বসানো হয়েছে: ${first.verified_name || first.display_phone_number} ✓`);
      } else {
        setError('কোনো ফোন নম্বর তথ্য পাওয়া যায়নি। দয়া করে Phone Number ID সরাসরি ইনপুট করুন।');
      }
    } catch (err: any) {
      setError(err.message || 'Meta Graph API যাচাই করতে সমস্যা হয়েছে।');
    } finally {
      setDetecting(false);
    }
  };

  // Direct Facebook Messenger Page Connection Handler
  const handleDirectFacebookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = directPageId.trim();
    const cleanToken = directPageToken.trim();
    if (!cleanId) {
      setError('Facebook Page ID দেওয়া আবশ্যক।');
      return;
    }
    if (!cleanToken) {
      setError('Facebook Page Access Token দেওয়া আবশ্যক। Meta Developer Portal > Messenger > API Setup থেকে টোকেন কপি করুন।');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.addChannel({
        platform: 'messenger',
        identifier: cleanId,
        name: directPageName.trim() || 'Facebook Page',
        access_token: cleanToken,
        app_secret: directPageSecret.trim() || undefined
      });

      if (res) {
        onSuccess(res as Channel);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Facebook Page চ্যানেল সংযোগ করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  // Direct Instagram Connection Handler
  const handleDirectInstagramSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = directIgId.trim();
    const cleanToken = directIgToken.trim();
    if (!cleanId) {
      setError('Instagram Account ID বা Page ID দেওয়া আবশ্যক।');
      return;
    }
    if (!cleanToken) {
      setError('Instagram Access Token দেওয়া আবশ্যক।');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.addChannel({
        platform: 'instagram',
        identifier: cleanId,
        name: directIgUsername.trim() || 'Instagram Account',
        access_token: cleanToken
      });

      if (res) {
        onSuccess(res as Channel);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Instagram চ্যানেল সংযোগ করতে সমস্যা হয়েছে।');
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
                {/* 2-Option Segmented Tab: Direct Cloud API (Recommended) vs Embedded Signup (BSPs) */}
                <div className="flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
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
                    <span>WhatsApp Cloud API (সরাসরি কানেক্ট)</span>
                  </button>
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
                    <span>Embedded Signup (BSPs Only)</span>
                  </button>
                </div>

                {waMode === 'direct' ? (
                  /* DIRECT PHONE NUMBER ID & CLOUD API FORM (100% Guaranteed Solution for App Owners) */
                  <form onSubmit={handleDirectWhatsAppSubmit} className="space-y-3.5 text-left animate-in fade-in duration-150">
                    {/* Owner Resolution Banner */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-neutral-700 dark:text-neutral-300 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Owner Direct Connection (কোনো BSP অনুমোদনের প্রয়োজন নেই)</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                        মেটা সাধারণ ডেভেলপার অ্যাপে Embedded Signup ব্লক করে রাখে (BSP error)। কিন্তু আপনি Meta App-এর Owner হিসেবে নিচের ফর্মে আপনার <strong>Phone Number ID</strong> এবং <strong>Access Token</strong> বসিয়ে দিলে ১ সেকেন্ডে ১০০% কানেক্ট হয়ে যাবে!
                      </p>
                    </div>

                    {/* Direct link to Meta Developer Console */}
                    <a
                      href={`https://developers.facebook.com/apps/${metaAppId || '1668233901609132'}/whatsapp-business/wa-dev-console/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold transition-all flex items-center justify-between cursor-pointer border border-neutral-300/80 dark:border-neutral-700"
                    >
                      <span className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-[#7F22FE]" />
                        <span>Meta Developer Console &gt; WhatsApp API Setup খুলুন</span>
                      </span>
                      <span className="text-[11px] text-neutral-500 font-mono">App #{metaAppId || '1668233901609132'} ↗</span>
                    </a>

                    {/* Access Token Input with 1-Click Auto-Detect Button */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                          Permanent Access Token / Temporary Token
                        </label>
                        <button
                          type="button"
                          disabled={detecting || !directAccessToken.trim()}
                          onClick={handleDetectWhatsApp}
                          className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                        >
                          {detecting ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>যাচাই হচ্ছে...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 text-emerald-500" />
                              <span>টোকেন দিয়ে নম্বর অটো-ফিল করুন</span>
                            </>
                          )}
                        </button>
                      </div>
                      <input
                        type="password"
                        value={directAccessToken}
                        onChange={(e) => setDirectAccessToken(e.target.value)}
                        placeholder="EAA... (Meta API Setup পেজের Access Token কপি করে পেস্ট করুন)"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {detectSuccess && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-[11px] leading-tight">{detectSuccess}</span>
                      </div>
                    )}

                    {/* Phone Number ID */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                        Phone Number ID <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={directPhoneNumberId}
                        onChange={(e) => setDirectPhoneNumberId(e.target.value)}
                        placeholder="যেমন: 108375822394829 (Meta WhatsApp API Setup পেজে 'Phone number ID' দেওয়া আছে)"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Display Number & Verified Name */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                          WhatsApp নম্বর (+880...)
                        </label>
                        <input
                          type="text"
                          value={directDisplayNumber}
                          onChange={(e) => setDirectDisplayNumber(e.target.value)}
                          placeholder="+88017XXXXXXXX"
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

                    {/* WABA ID */}
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        WABA ID (WhatsApp Business Account ID - ঐচ্ছিক)
                      </label>
                      <input
                        type="text"
                        value={directWabaId}
                        onChange={(e) => setDirectWabaId(e.target.value)}
                        placeholder="যেমন: 102837482947291 (API Setup পেজের WABA ID)"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Webhook Configuration Quick Copy Box */}
                    <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-neutral-800 dark:text-neutral-200 block text-[11px]">
                          Meta Developer Portal &gt; WhatsApp &gt; Configuration-এ বসানোর জন্য Webhook তথ্য:
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <div className="min-w-0 font-mono text-[11px] truncate text-emerald-700 dark:text-emerald-400 font-semibold">
                          https://www.oneagentbd.online/api/webhooks/whatsapp
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyText('https://www.oneagentbd.online/api/webhooks/whatsapp', 'wa_wh')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shrink-0 cursor-pointer transition-colors"
                        >
                          {copiedKey === 'wa_wh' ? 'Copied ✓' : 'Copy URL'}
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <span className="text-[11px] text-neutral-600 dark:text-neutral-300">
                          Verify Token: <strong className="font-mono text-neutral-900 dark:text-white font-bold">oneagentbd_wa_secret</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyText('oneagentbd_wa_secret', 'wa_vt')}
                          className="px-2.5 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 text-[11px] font-bold shrink-0 cursor-pointer transition-colors"
                        >
                          {copiedKey === 'wa_vt' ? 'Copied ✓' : 'Copy Token'}
                        </button>
                      </div>
                      <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[10.5px] text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
                        ⚠️ <strong>সবচেয়ে জরুরি ধাপ:</strong> মেটা পোর্টালে Webhook ভেরিফাই করার পর নিচে <strong>Webhook fields</strong> সেকশনে <strong>Manage</strong> বাটনে ক্লিক করে <strong>messages</strong> ফিল্ডে অবশ্যই <strong>Subscribe</strong> করবেন। এটি না করলে টেস্ট নাম্বারে আসা মেসেজ বা কাস্টমার রিপ্লাই মেটা পাঠাবে না!
                      </div>
                    </div>

                    {/* Submit Button */}
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
                          <span>WhatsApp চ্যানেল যুক্ত করুন (Connect Now)</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* EMBEDDED SIGNUP TAB (With Clear BSP Error Warning) */
                  <div className="space-y-4 text-center animate-in fade-in duration-150">
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-left space-y-2">
                      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>'Embedded signup is only available for BSPs or TPs' এরর সতর্কতা</span>
                      </div>
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        মেটার নিজস্ব পলিসি অনুযায়ী সাধারণ Facebook Login পপআপ দিয়ে WhatsApp অনবোর্ডিং শুধুমাত্র সার্টিফাইড Business Solution Provider (BSP) পার্টনারদের জন্য অনুমোদিত।
                        সাধারণ Meta App দিয়ে এটি ওপেন করলে মেটা 'It looks like this app isn't available' ডায়ালগ দেখায়।
                      </p>
                      <button
                        type="button"
                        onClick={() => setWaMode('direct')}
                        className="text-xs font-bold text-emerald-700 dark:text-emerald-300 underline cursor-pointer"
                      >
                        👉 সরাসরি কানেক্ট ট্যাবে যান (১০০% কোনো এরর ছাড়া কাজ করবে)
                      </button>
                    </div>

                    {/* Primary Embedded Signup Button */}
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleWhatsAppEmbeddedSignup}
                      className="w-full py-3.5 px-5 rounded-2xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Opening Meta Embedded Signup...</span>
                        </>
                      ) : (
                        <>
                          <Smartphone className="w-4 h-4" />
                          <span>তবুও Meta Embedded Signup পপআপ খুলুন</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : platform === 'messenger' ? (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* 2-Option Segmented Tab: 1-Click OAuth vs Direct Page ID */}
                <div className="flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setFbMode('oauth');
                      setError(null);
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      fbMode === 'oauth'
                        ? 'bg-white dark:bg-neutral-700 text-[#1877F2] dark:text-blue-400 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Meta 1-Click Login</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFbMode('direct');
                      setError(null);
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      fbMode === 'direct'
                        ? 'bg-white dark:bg-neutral-700 text-[#1877F2] dark:text-blue-400 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                    }`}
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Page ID ও Token দিয়ে কানেক্ট</span>
                  </button>
                </div>

                {fbMode === 'oauth' ? (
                  <div className="space-y-4 animate-in fade-in duration-150">
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
                        <span>১-ক্লিকে ফেসবুক লগইন করে পেজ সিলেক্ট করুন</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  /* DIRECT FACEBOOK PAGE ID & TOKEN FORM */
                  <form onSubmit={handleDirectFacebookSubmit} className="space-y-3.5 text-left animate-in fade-in duration-150">
                    <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-neutral-700 dark:text-neutral-300 space-y-1.5">
                      <p className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-[#1877F2]" />
                        <span>ইনস্ট্যান্ট পেজ কানেকশন (পপআপ ছাড়া)</span>
                      </p>
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        আপনার Facebook Page ID এবং Meta Developer Portal থেকে প্রাপ্ত Page Access Token এখানে পেস্ট করে সরাসরি কানেক্ট করুন। আমাদের সিস্টেম পেজটিকে স্বয়ংক্রিয়ভাবে Webhooks এ সাবস্ক্রাইব করে দেবে।
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                        Facebook Page ID (পেজ আইডি) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={directPageId}
                        onChange={(e) => setDirectPageId(e.target.value)}
                        placeholder="যেমন: 104857291048592"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
                      />
                      <p className="text-[10px] text-neutral-400 mt-1">
                        পেজ আইডি পাবেন: ফেসবুক পেজে গিয়ে <strong>About &gt; Page Transparency</strong> অথবা Meta Business Suite এ।
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                        Page Access Token (পেজ এক্সেস টোকেন) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={directPageToken}
                        onChange={(e) => setDirectPageToken(e.target.value)}
                        placeholder="EAA..."
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
                      />
                      <p className="text-[10px] text-neutral-400 mt-1">
                        টোকেন পাবেন: <strong>developers.facebook.com &gt; Messenger &gt; API Setup &gt; Generate Token</strong> এ।
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                          পেজের নাম (ঐচ্ছিক)
                        </label>
                        <input
                          type="text"
                          value={directPageName}
                          onChange={(e) => setDirectPageName(e.target.value)}
                          placeholder="যেমন: Trendly Fashion"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                          App Secret (ঐচ্ছিক)
                        </label>
                        <input
                          type="password"
                          value={directPageSecret}
                          onChange={(e) => setDirectPageSecret(e.target.value)}
                          placeholder="খালি রাখলেও চলবে"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !directPageId.trim() || !directPageToken.trim()}
                      className="w-full py-3.5 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs shadow-md shadow-[#1877F2]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Connecting Facebook Page...</span>
                        </>
                      ) : (
                        <>
                          <Facebook className="w-4 h-4 fill-current" />
                          <span>Facebook Page কানেক্ট করুন</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              /* INSTAGRAM SEGMENTED TAB & DIRECT FORM */
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setIgMode('oauth');
                      setError(null);
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      igMode === 'oauth'
                        ? 'bg-white dark:bg-neutral-700 text-pink-600 dark:text-pink-400 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Meta 1-Click Login</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIgMode('direct');
                      setError(null);
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      igMode === 'direct'
                        ? 'bg-white dark:bg-neutral-700 text-pink-600 dark:text-pink-400 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                    }`}
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Instagram ID দিয়ে কানেক্ট</span>
                  </button>
                </div>

                {igMode === 'oauth' ? (
                  <div className="space-y-4 animate-in fade-in duration-150">
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
                        <span>১-ক্লিকে ইনস্টাগ্রাম প্রফেশনাল অ্যাকাউন্ট সিলেক্ট করুন</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleDirectInstagramSubmit} className="space-y-3.5 text-left animate-in fade-in duration-150">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                        Instagram Business Account ID বা Page ID <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={directIgId}
                        onChange={(e) => setDirectIgId(e.target.value)}
                        placeholder="যেমন: 17841400293847529"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                        Instagram Access Token <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={directIgToken}
                        onChange={(e) => setDirectIgToken(e.target.value)}
                        placeholder="EAA..."
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Instagram Username (ঐচ্ছিক)
                      </label>
                      <input
                        type="text"
                        value={directIgUsername}
                        onChange={(e) => setDirectIgUsername(e.target.value)}
                        placeholder="@username"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !directIgId.trim() || !directIgToken.trim()}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-pink-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Connecting Instagram...</span>
                        </>
                      ) : (
                        <>
                          <Instagram className="w-4 h-4" />
                          <span>Instagram অ্যাকাউন্ট কানেক্ট করুন</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
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
