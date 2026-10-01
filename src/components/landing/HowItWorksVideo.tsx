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
      className="py-16 sm:py-20 bg-white dark:bg-[#0B0720] border-t border-slate-200/70 dark:border-purple-500/15 relative overflow-hidden transition-colors"
    >
      <div
        className="hidden dark:block pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[280px] rounded-full bg-purple-600/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 sm:gap-8 lg:gap-12 items-center">
          {/* Left Side: Clean, Balanced English Copy (Matches Video Height) */}
          <div className="flex flex-col justify-center space-y-4 sm:space-y-5 text-center lg:text-left">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#7C3AED] dark:text-[#A78BFA] block">
              HOW OUR AI WORKS
            </span>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              See How Our{' '}
              <span className="bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#C084FC] bg-clip-text text-transparent">
                AI Sales Agent
              </span>{' '}
              Automates Your Store 24/7
            </h2>

            {onStartTrial && (
              <div className="pt-1 sm:pt-2">
                <button
                  type="button"
                  onClick={onStartTrial}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl sm:rounded-full bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#6366F1] hover:from-[#6D28D9] hover:to-[#4F46E5] text-white text-sm font-bold shadow-lg shadow-purple-500/25 inline-flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <span>Start 2-Day Free Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Right Side: Equal-Width 16:9 Interactive Video Card */}
          <div className="w-full">
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 dark:bg-[#130D2E] border border-slate-200/90 dark:border-purple-500/25 shadow-xl shadow-purple-500/10 aspect-video group">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10 transition-opacity group-hover:via-black/40" />

                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <div className="relative flex items-center justify-center">
                      <span className="absolute w-16 h-16 rounded-full bg-[#7C3AED]/40 animate-ping" />
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white flex items-center justify-center shadow-xl shadow-purple-600/50 border border-white/30 group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-0.5" />
                      </div>
                    </div>
                    <span className="mt-3.5 text-sm sm:text-base font-bold text-white tracking-tight">
                      Watch How It Works
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
          </div>
        </div>
      </div>
    </section>
  );
};
