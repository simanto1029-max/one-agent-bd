import React, { useState, useEffect } from 'react';
import {
  Play,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Shield,
  Clock,
  Zap,
  MessageSquare,
  ShoppingCart,
  Truck,
  Star,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { UserProfile, SubscriptionStatusInfo } from '../../types';
import { api } from '../../api';
import {
  DEFAULT_VIDEO_URL,
  DEFAULT_THUMBNAIL_URL,
  PROMO_VIDEO_UPDATED_EVENT
} from './HowItWorksVideo';

// Helper to resolve embed video url (YouTube, Vimeo, Loom, MP4, etc.)
function getEmbedUrl(rawUrl: string): { type: 'iframe' | 'video'; src: string } {
  const url = (rawUrl || '').trim();
  if (!url) {
    return {
      type: 'iframe',
      src: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&modestbranding=1'
    };
  }

  // YouTube standard watch URL
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'iframe',
      src: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1&showinfo=0`
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'iframe',
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&title=0&byline=0&portrait=0`
    };
  }

  // Loom
  const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (loomMatch && loomMatch[1]) {
    return {
      type: 'iframe',
      src: `https://www.loom.com/embed/${loomMatch[1]}?autoplay=1`
    };
  }

  // Direct MP4 / WebM
  if (url.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
    return { type: 'video', src: url };
  }

  return { type: 'iframe', src: url };
}

function resolveEffectiveThumbnail(videoUrl: string, explicitThumb: string): string {
  if (explicitThumb && explicitThumb !== DEFAULT_THUMBNAIL_URL) {
    return explicitThumb;
  }
  const ytMatch = videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
  }
  return DEFAULT_THUMBNAIL_URL;
}

interface LiveDemoPageProps {
  isDark: boolean;
  onToggleTheme: () => void;
  currentUser: UserProfile | null;
  subStatus: SubscriptionStatusInfo | null;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onGoToLanding: () => void;
  onGoToDashboard: () => void;
  onGoToAdmin: () => void;
}

export const LiveDemoPage: React.FC<LiveDemoPageProps> = ({
  isDark,
  onToggleTheme,
  currentUser,
  subStatus,
  onOpenAuth,
  onGoToLanding,
  onGoToDashboard,
  onGoToAdmin
}) => {
  const [videoUrl, setVideoUrl] = useState<string>(DEFAULT_VIDEO_URL);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(DEFAULT_THUMBNAIL_URL);
  const [isPlaying, setIsPlaying] = useState<boolean>(true); // Auto-play when visiting dedicated demo page

  useEffect(() => {
    // Scroll to top upon landing on the demo page
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let mounted = true;
    api
      .getPublicSettings()
      .then((data) => {
        if (!mounted) return;
        const serverVideo = (data?.promo_video_url || '').trim();
        const serverThumb = (data?.promo_video_thumbnail || '').trim();

        if (serverVideo) setVideoUrl(serverVideo);
        if (serverThumb) setThumbnailUrl(serverThumb);
      })
      .catch(() => {});

    const handleUpdate = (e: Event) => {
      const custom = e as CustomEvent<{ videoUrl?: string; thumbnailUrl?: string }>;
      if (custom.detail?.videoUrl !== undefined) {
        setVideoUrl(custom.detail.videoUrl || DEFAULT_VIDEO_URL);
        setIsPlaying(true);
      }
      if (custom.detail?.thumbnailUrl !== undefined) {
        setThumbnailUrl(custom.detail.thumbnailUrl || DEFAULT_THUMBNAIL_URL);
      }
    };

    window.addEventListener(PROMO_VIDEO_UPDATED_EVENT, handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener(PROMO_VIDEO_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  const embedInfo = getEmbedUrl(videoUrl);
  const effectiveThumbnail = resolveEffectiveThumbnail(videoUrl, thumbnailUrl);

  const demoFeatures = [
    {
      icon: MessageSquare,
      title: '0.8s AI Auto-Reply in Bangla & English',
      description: 'Answers FAQs, prices, size guides, and delivery rules with polite natural Bangla (আপনি) tone 24/7.',
      badge: 'Meta Cloud API'
    },
    {
      icon: ShoppingCart,
      title: 'Real-time eCommerce Catalog Sync',
      description: 'Syncs Shopify, WooCommerce, and manual inventory instantly so AI never recommends out-of-stock items.',
      badge: 'Catalog Webhook'
    },
    {
      icon: Truck,
      title: '1-Click Automated Courier Dispatch',
      description: 'Extracts customer address and phone number, checks fraud blacklist, and creates Steadfast / Pathao parcels automatically.',
      badge: 'Courier API'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#080516] text-slate-900 dark:text-white transition-colors">
      {/* Floating Header */}
      <Navbar
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        currentUser={currentUser}
        subStatus={subStatus}
        onOpenAuth={onOpenAuth}
        onGoToDashboard={onGoToDashboard}
        onGoToAdmin={onGoToAdmin}
        onGoToLanding={onGoToLanding}
        onGoToDemo={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <main className="flex-1 pb-16 sm:pb-24">
        {/* Navigation Breadcrumb & Back to Home */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-2 pb-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onGoToLanding}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#7C3AED] dark:hover:text-purple-400 transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span>Home</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#7C3AED] dark:text-purple-300 font-bold">Live Demo</span>
            </div>
          </div>
        </div>

        {/* Hero Title Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center mt-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#7F22FE]/10 dark:bg-purple-500/15 border border-[#7F22FE]/25 text-[#7F22FE] dark:text-purple-300 text-xs font-extrabold uppercase tracking-widest mb-3 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>60-SECOND LIVE DEMO</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            See How{' '}
            <span className="bg-gradient-to-r from-[#7F22FE] via-[#9333EA] to-[#DB2777] bg-clip-text text-transparent">
              One Agent BD
            </span>{' '}
            Works
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium">
            Watch our full walkthrough to see how AI answers WhatsApp, Messenger & Instagram messages in 0.8s, takes customer orders, and books couriers automatically.
          </p>
        </div>

        {/* Video Player Showcase Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="relative rounded-3xl p-3 sm:p-5 bg-gradient-to-b from-slate-100 to-slate-50 dark:from-[#170e3b] dark:to-[#0f0927] border border-slate-200 dark:border-purple-500/30 shadow-[0_25px_60px_-15px_rgba(124,58,237,0.22)]">
            
            {/* Top Bar with Live Indicator & Window Controls */}
            <div className="flex items-center justify-between px-2 sm:px-3 pb-3 border-b border-slate-200/80 dark:border-purple-500/20 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] ml-2 hidden sm:inline">
                  oneagentbd.com/demo • 4K HD
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Interactive AI Demo</span>
              </div>
            </div>

            {/* Video Player Box */}
            <div className="mt-3 relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/60 dark:border-purple-500/30 group shadow-inner">
              {!isPlaying ? (
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="w-full h-full relative block text-left cursor-pointer focus:outline-hidden"
                  aria-label="Play how our AI works video"
                >
                  <img
                    src={effectiveThumbnail}
                    alt="How One Agent BD AI Works"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = DEFAULT_THUMBNAIL_URL;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-slate-950/20 transition-opacity group-hover:via-slate-950/45" />

                  {/* Center Play Button */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <div className="relative flex items-center justify-center">
                      <span className="absolute w-20 h-20 rounded-full bg-[#7F22FE]/40 animate-ping" />
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-[#7F22FE] to-[#DB2777] text-white flex items-center justify-center shadow-[0_0_40px_rgba(127,34,254,0.8)] border-2 border-white/50 group-hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1" />
                      </div>
                    </div>
                    <span className="mt-4 px-4 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-extrabold text-white shadow-lg">
                      Click to Play 60-Second Demo
                    </span>
                  </div>
                </button>
              ) : (
                <div className="w-full h-full bg-black">
                  {embedInfo.type === 'video' ? (
                    <video
                      src={embedInfo.src}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <iframe
                      src={embedInfo.src}
                      title="How One Agent BD AI Works"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  )}
                </div>
              )}
            </div>

            {/* Quick Timeline Highlights Bar */}
            <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-purple-500/20 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1a113f] border border-slate-200 dark:border-purple-500/30 text-xs font-bold text-slate-800 dark:text-purple-200 flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#7F22FE]" />
                  <span>0:00 - Meta Cloud Connect</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1a113f] border border-slate-200 dark:border-purple-500/30 text-xs font-bold text-slate-800 dark:text-purple-200 flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#7F22FE]" />
                  <span>0:20 - AI Auto Replies</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1a113f] border border-slate-200 dark:border-purple-500/30 text-xs font-bold text-slate-800 dark:text-purple-200 flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>0:45 - 1-Click Courier</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => onOpenAuth('signup')}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#7F22FE] to-[#C026D3] hover:from-[#6D28D9] hover:to-[#A21CAF] text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-600/30 inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 3 Core Highlights Demonstrated in the Video */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-14 sm:mt-18">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">
              What You Just Saw in the Demo
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Three core pillars that turn your social channels into 24/7 revenue-generating machines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {demoFeatures.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="rounded-2xl p-5 bg-white dark:bg-[#110A2E] border border-slate-200 dark:border-purple-500/25 shadow-xs hover:border-[#7C3AED]/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#7F22FE]/10 dark:bg-purple-500/20 border border-[#7F22FE]/25 flex items-center justify-center text-[#7F22FE] dark:text-purple-300">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-purple-950 border border-slate-200 dark:border-purple-800 text-slate-700 dark:text-purple-300">
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-purple-500/15 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Included in 14-day trial</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom High-Converting Action Card */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-14 sm:mt-18">
          <div className="rounded-3xl p-6 sm:p-10 bg-gradient-to-r from-[#7F22FE] via-[#8B5CF6] to-[#DB2777] text-white text-center shadow-xl shadow-purple-600/25 relative overflow-hidden">
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider mb-3">
                No Credit Card Required • Instant Setup
              </span>
              <h2 className="text-2xl sm:text-4xl font-black">
                Ready to Automate Your Customer Inquiries?
              </h2>
              <p className="mt-2 text-sm sm:text-base text-purple-100 max-w-xl mx-auto font-medium">
                Connect your Facebook page or WhatsApp in 60 seconds and let AI handle 1,000+ customer chats every day.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => onOpenAuth('signup')}
                  className="px-7 py-3 rounded-full bg-white hover:bg-slate-100 text-[#7C3AED] font-black text-sm shadow-lg transition-transform hover:scale-105 cursor-pointer flex items-center gap-2"
                >
                  <span>Register & Start Free Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onGoToLanding}
                  className="px-6 py-3 rounded-full bg-black/25 hover:bg-black/35 text-white font-bold text-sm border border-white/20 transition-all cursor-pointer"
                >
                  View All Features & Pricing
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer onOpenAuth={() => onOpenAuth('signup')} />
    </div>
  );
};
