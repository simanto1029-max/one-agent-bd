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
  Sparkles
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
              setError('আপনার ফেসবুক অ্যাকাউন্টে কোনো পেজ বা বিজনেস অ্যাকাউন্ট পাওয়া যায়নি। পেজ সিলেক্ট করে আবার চেষ্টা করুন।');
            }
          })
          .catch((err: any) => {
            setError(err.message || 'পেজের তালিকা লোড করা যায়নি।');
          })
          .finally(() => {
            setLoading(false);
          });
      } else if (data.type === 'META_OAUTH_ERROR') {
        setLoading(false);
        setError(data.error || 'লগইন সম্পন্ন হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
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
      setError(err.message || 'WhatsApp পপ-আপ ওপেন করতে সমস্যা হয়েছে।');
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
                    setError('কোনো পেজ পাওয়া যায়নি। ফেসবুক লগইনের সময় অন্তত একটি পেজ সিলেক্ট করুন।');
                  }
                })
                .catch((err: any) => {
                  setError(err.message || 'অ্যাকাউন্ট কানেক্ট করতে সমস্যা হয়েছে।');
                })
                .finally(() => {
                  setLoading(false);
                });
            } else {
              setLoading(false);
              setError('লগইন বাতিল করা হয়েছে।');
            }
          },
          { scope: scopes }
        );
        return;
      }

      setLoading(false);
      setError('সার্ভারে এখনো Meta App ID যুক্ত করা হয়নি। অ্যাডমিন প্যানেল থেকে Meta App Setup সম্পন্ন করুন।');
    } catch (err: any) {
      setError(err.message || 'লগইন শুরু করতে সমস্যা হয়েছে।');
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
      if (!targetPage) throw new Error(' অনুগ্রহ করে একটি পেজ বা অ্যাকাউন্ট সিলেক্ট করুন।');

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
      setError(err.message || 'অ্যাকাউন্ট কানেক্ট করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const getPlatformInfo = () => {
    switch (platform) {
      case 'messenger':
        return {
          title: 'Connect Facebook Page',
          subtitle: 'আপনার ফেসবুক অ্যাকাউন্টে লগইন করে যে পেজে AI অটো-রিপ্লাই চালু করতে চান সেটি সিলেক্ট করুন। বাকি সব সেটআপ একা একাই হয়ে যাবে।',
          btnLabel: 'Continue with Facebook',
          btnClass: 'bg-[#1877F2] hover:bg-[#166fe5] shadow-[#1877F2]/25',
          icon: Facebook,
          color: 'text-[#1877F2]',
          bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
        };
      case 'instagram':
        return {
          title: 'Connect Instagram Account',
          subtitle: 'আপনার অ্যাকাউন্টে লগইন করে যে ইনস্টাগ্রাম বিজনেস প্রোফাইলে AI অটো-রিপ্লাই চালু করতে চান সেটি সিলেক্ট করুন।',
          btnLabel: 'Continue with Instagram (via Meta)',
          btnClass: 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 shadow-pink-500/20',
          icon: Instagram,
          color: 'text-pink-600',
          bgColor: 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800'
        };
      case 'whatsapp':
        return {
          title: 'Connect WhatsApp Business',
          subtitle: 'আপনার মেটা বিজনেস অ্যাকাউন্টে লগইন করে আপনার WhatsApp নাম্বারটি সিলেক্ট করুন।',
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
      <div className="relative w-full max-w-md p-6 sm:p-7 bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100">
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

        {/* STEP 1: Single Button Login */}
        {step === 'auth' && (
          <div className="space-y-4">
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
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2.5">
                <p className="text-[11px] text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
                  <strong>নতুন বা অন্য WhatsApp নাম্বার যুক্ত করার নিয়ম:</strong><br />
                  ১) প্রথমে নিচের <strong>WhatsApp Manager ↗</strong> বাটনে গিয়ে আপনার নাম্বারটি মেটা বিজনেসে যুক্ত করুন।<br />
                  ২) এরপর <strong>Switch / Select Business &amp; Number</strong> বাটনে ক্লিক করে পপ-আপে <em>&ldquo;Edit previous settings&rdquo;</em> থেকে নাম্বারটি সিলেক্ট করুন:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="https://business.facebook.com/wa/manage/phone-numbers/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center"
                  >
                    <Smartphone className="w-3.5 h-3.5 shrink-0" />
                    <span>১. WhatsApp Manager-এ নাম্বার অ্যাড করুন ↗</span>
                  </a>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleWhatsAppEmbeddedSignup}
                    className="py-2 px-3 rounded-xl bg-white dark:bg-neutral-800 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold hover:bg-emerald-50 transition-all cursor-pointer"
                  >
                    ২. Re-Select Number
                  </button>
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-800 text-center">
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#7F22FE] shrink-0" />
                <span>১০০% অটোমেটিক কানেকশন — শুধু অ্যাকাউন্ট ও পেজ সিলেক্ট করুন</span>
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: Just Select Account / Page */}
        {step === 'select' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                আপনার পেজ / অ্যাকাউন্ট সিলেক্ট করুন:
              </div>
              <button
                type="button"
                onClick={handleSingleClickMetaLogin}
                className="text-[11px] font-bold text-[#7F22FE] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>অন্য অ্যাকাউন্ট / রিফ্রেশ</span>
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
                          <span>একই সাথে যুক্ত Instagram (@{p.instagram_business_account?.username}) কানেক্ট করুন</span>
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
                  তালিকায় আপনার কাঙ্ক্ষিত নাম্বারটি নেই? প্রথমে <strong>Meta WhatsApp Manager ↗</strong>-এ গিয়ে নাম্বার যুক্ত করুন, তারপর <strong>Re-Select / Switch Account</strong> বাটনে ক্লিক করে পপ-আপে <em>&ldquo;Edit previous settings&rdquo;</em> সিলেক্ট করুন:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="https://business.facebook.com/wa/manage/phone-numbers/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center"
                  >
                    <Smartphone className="w-3.5 h-3.5 shrink-0" />
                    <span>১. Meta WhatsApp Manager (+ Add Number) ↗</span>
                  </a>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleWhatsAppEmbeddedSignup}
                    className="py-2 px-3 rounded-xl bg-white dark:bg-neutral-800 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold hover:bg-emerald-50 transition-all cursor-pointer"
                  >
                    ২. Re-Select Number
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
