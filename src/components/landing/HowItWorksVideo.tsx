import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../../api';

const DEFAULT_VIDEO_URL = 'https://www.youtube.com/watch?v=aircAruvnKk';
const DEFAULT_THUMBNAIL_URL =
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85';

export const PROMO_VIDEO_UPDATED_EVENT = 'oneagentbd-video-updated';

export function notifyPromoVideoUpdated(videoUrl: string, thumbnailUrl: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(PROMO_VIDEO_UPDATED_EVENT, {
        detail: { videoUrl, thumbnailUrl }
      })
    );
  }
}

function getEmbedUrl(rawUrl: string): { type: 'iframe' | 'video'; src: string } {
  const url = (rawUrl || '').trim();
  if (!url) {
    return { type: 'iframe', src: 'https://www.youtube.com/embed/aircAruvnKk?autoplay=1&rel=0' };
  }

  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,15})/
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'iframe',
      src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`
    };
  }

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'iframe',
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`
    };
  }

  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url) || url.startsWith('data:video/')) {
    return { type: 'video', src: url };
  }

  return { type: 'iframe', src: url };
}

interface HowItWorksVideoProps {
  onStartTrial?: () => void;
}

export const HowItWorksVideo: React.FC<HowItWorksVideoProps> = ({ onStartTrial }) => {
  const [videoUrl, setVideoUrl] = useState<string>(DEFAULT_VIDEO_URL);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(DEFAULT_THUMBNAIL_URL);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    api
      .getPublicSettings()
      .then((data) => {
        if (!mounted) return;
        if (data?.promo_video_url) setVideoUrl(data.promo_video_url);
        if (data?.promo_video_thumbnail) setThumbnailUrl(data.promo_video_thumbnail);
      })
      .catch(() => {});

    const handleUpdate = (e: Event) => {
      const custom = e as CustomEvent<{ videoUrl?: string; thumbnailUrl?: string }>;
      if (custom.detail?.videoUrl !== undefined) {
        setVideoUrl(custom.detail.videoUrl || DEFAULT_VIDEO_URL);
        setIsPlaying(false);
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

  return (
    <section
      id="how-it-works"
      className="py-8 sm:py-12 bg-white dark:bg-[#0B0720] border-t border-slate-100 dark:border-purple-500/15 relative overflow-hidden transition-colors"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Compact Minimal Header */}
        <div className="text-center mb-5 sm:mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#7F22FE]/10 dark:bg-purple-500/15 border border-[#7F22FE]/25 text-[#7F22FE] dark:text-purple-300 text-[10px] font-extrabold uppercase tracking-[0.15em] mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>60-SECOND LIVE DEMO</span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            See How{' '}
            <span className="bg-gradient-to-r from-[#7F22FE] via-[#9333EA] to-[#DB2777] bg-clip-text text-transparent">
              One Agent BD
            </span>{' '}
            Works
          </h2>
        </div>

        {/* Compact Centered Video Card */}
        <div className="max-w-3xl mx-auto rounded-[24px] p-2.5 sm:p-3.5 bg-slate-50/90 dark:bg-[#120B2E] border border-slate-200/90 dark:border-purple-500/25 shadow-[0_20px_50px_-15px_rgba(124,58,237,0.18)]">
          {/* Sleek Video Player */}
          <div className="relative aspect-[16/8.2] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/60 dark:border-purple-500/20 group">
            {!isPlaying ? (
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                className="w-full h-full relative block text-left cursor-pointer focus:outline-hidden"
                aria-label="Play how our AI works video"
              >
                <img
                  src={thumbnailUrl || DEFAULT_THUMBNAIL_URL}
                  alt="How One Agent BD AI Works"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = DEFAULT_THUMBNAIL_URL;
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-slate-950/15 transition-opacity group-hover:via-slate-950/40" />

                {/* Top Corner Live Pill */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-md border border-white/15 flex items-center gap-1.5 text-[10px] font-bold text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>AI Live Demo</span>
                </div>

                {/* Center Play Trigger */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-14 h-14 rounded-full bg-[#7F22FE]/45 animate-ping" />
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-[#7F22FE] to-[#DB2777] text-white flex items-center justify-center shadow-[0_0_30px_rgba(127,34,254,0.7)] border-2 border-white/40 group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
                    </div>
                  </div>
                  <span className="mt-2.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-extrabold text-white">
                    Watch 60s Demo
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

          {/* Compact Bottom 3-Step Flowchart Bar */}
          <div className="mt-2.5 pt-2 px-1 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#19103C] border border-slate-200/80 dark:border-purple-500/25 text-[10px] font-extrabold text-slate-700 dark:text-purple-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#7F22FE] dark:text-purple-400" />
                1. Connect Page
              </span>
              <ArrowRight className="w-3 h-3 text-slate-400 hidden sm:block" />
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#19103C] border border-slate-200/80 dark:border-purple-500/25 text-[10px] font-extrabold text-slate-700 dark:text-purple-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#7F22FE] dark:text-purple-400" />
                2. AI Auto-Replies
              </span>
              <ArrowRight className="w-3 h-3 text-slate-400 hidden sm:block" />
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#19103C] border border-slate-200/80 dark:border-purple-500/25 text-[10px] font-extrabold text-slate-700 dark:text-purple-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                3. 1-Click Courier
              </span>
            </div>

            {onStartTrial && (
              <button
                type="button"
                onClick={onStartTrial}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#7F22FE] to-[#C026D3] hover:from-[#6D28D9] hover:to-[#A21CAF] text-white text-[11px] font-extrabold shadow-xs inline-flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
