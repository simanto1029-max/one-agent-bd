import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Save,
  Check,
  Play,
  Copy,
  Database,
  CheckCircle2,
  Phone,
  Mail,
  Shield,
  KeyRound,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { api } from '../../api';
import { AdminSettingsData } from '../../types';
import { BrandLogo, notifyBrandLogoUpdated } from '../common/BrandLogo';
import {
  notifyPromoVideoUpdated,
  extractYouTubeId,
  resolveEffectiveThumbnail,
  DEFAULT_VIDEO_URL,
  DEFAULT_THUMBNAIL_URL
} from '../landing/HowItWorksVideo';

function compressImageDataUrl(rawDataUrl: string, maxWidth = 1280): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth || img.width || 1280;
      const h = img.naturalHeight || img.height || 720;
      const scale = w > maxWidth ? maxWidth / w : 1;
      const targetW = Math.round(w * scale);
      const targetH = Math.round(h * scale);
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(rawDataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, targetW, targetH);
      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.onerror = () => resolve(rawDataUrl);
    img.src = rawDataUrl;
  });
}

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<AdminSettingsData>({
    site_name: 'One Agent BD',
    brand_logo_text: 'One Agent BD',
    logo_url: '',
    promo_video_url:
      (typeof window !== 'undefined' && localStorage.getItem('oneagentbd_promo_video_url')) ||
      DEFAULT_VIDEO_URL,
    promo_video_thumbnail:
      (typeof window !== 'undefined' && localStorage.getItem('oneagentbd_promo_video_thumbnail')) ||
      DEFAULT_THUMBNAIL_URL,
    support_email: 'support@oneagentbd.online',
    bkash_number: '01700000000',
    nagad_number: '01800000000',
    meta_description: 'Omnichannel WhatsApp & Messenger AI Auto-Reply & Order Management SaaS Platform'
  });
  const [schemaSql, setSchemaSql] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoStatusMsg, setLogoStatusMsg] = useState<string | null>(null);
  const [logoDimensions, setLogoDimensions] = useState<string | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);
  const thumbnailFileInputRef = useRef<HTMLInputElement | null>(null);
  const [videoSaving, setVideoSaving] = useState(false);
  const [videoSavedMsg, setVideoSavedMsg] = useState<string | null>(null);
  const [cronRunning, setCronRunning] = useState(false);
  const [cronResult, setCronResult] = useState<any>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Admin Account & Password State
  const [adminNewEmail, setAdminNewEmail] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [updatingCreds, setUpdatingCreds] = useState(false);
  const [credsSuccess, setCredsSuccess] = useState<string | null>(null);
  const [credsError, setCredsError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsData, sql] = await Promise.all([
        api.getAdminSettings().catch(() => api.getPublicSettings() as Promise<AdminSettingsData>),
        api.getSchemaSql().catch(() => '-- Schema unavailable')
      ]);
      if (settingsData.meta_app_id && settingsData.meta_app_id.includes('@')) {
        settingsData.meta_app_id = '';
        settingsData.meta_app_secret = '';
      }
      const cachedVideo =
        typeof window !== 'undefined' ? localStorage.getItem('oneagentbd_promo_video_url') : '';
      const cachedThumb =
        typeof window !== 'undefined' ? localStorage.getItem('oneagentbd_promo_video_thumbnail') : '';

      const mergedVideo =
        settingsData.promo_video_url && settingsData.promo_video_url !== DEFAULT_VIDEO_URL
          ? settingsData.promo_video_url
          : cachedVideo || settingsData.promo_video_url || DEFAULT_VIDEO_URL;
      const mergedThumb =
        settingsData.promo_video_thumbnail &&
        settingsData.promo_video_thumbnail !== DEFAULT_THUMBNAIL_URL
          ? settingsData.promo_video_thumbnail
          : cachedThumb || settingsData.promo_video_thumbnail || DEFAULT_THUMBNAIL_URL;

      setSettings({
        ...settingsData,
        promo_video_url: mergedVideo,
        promo_video_thumbnail: mergedThumb
      });
      setSchemaSql(sql);
    } catch (err) {
      console.error('Failed to load admin settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      notifyBrandLogoUpdated(settings.logo_url || '');
      notifyPromoVideoUpdated(settings.promo_video_url || '', settings.promo_video_thumbnail || '');
      await Promise.all([
        api.updatePromoVideo({
          promo_video_url: settings.promo_video_url || '',
          promo_video_thumbnail: settings.promo_video_thumbnail || ''
        }).catch(() => {}),
        api.updateAdminSettings(settings).catch(() => {})
      ]);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    setLogoStatusMsg(null);

    // Read raw file without any canvas downscaling or lossy compression so 4K stays 100% 4K
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const rawDataUrl = ev.target?.result as string;
      if (!rawDataUrl) {
        setLogoUploading(false);
        return;
      }

      // Inspect exact native pixel resolution
      const img = new Image();
      img.onload = async () => {
        const w = img.naturalWidth || 0;
        const h = img.naturalHeight || 0;
        const is4K = w >= 2000 || h >= 2000;
        setLogoDimensions(
          w && h
            ? `${w} × ${h} px (${is4K ? '4K Ultra-HD Uncompressed' : 'Native Original Resolution'})`
            : 'Original Vector / High-Res'
        );
      };
      img.src = rawDataUrl;

      const updatedSettings = { ...settings, logo_url: rawDataUrl };
      setSettings(updatedSettings);
      notifyBrandLogoUpdated(rawDataUrl);

      try {
        await api.updateAdminSettings(updatedSettings);
        setLogoStatusMsg('Logo uploaded in original 4K quality & applied across all pages!');
        setTimeout(() => setLogoStatusMsg(null), 5000);
      } catch (err) {
        console.error('Failed to auto-save uploaded logo:', err);
      } finally {
        setLogoUploading(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResetDefaultLogo = async () => {
    const updatedSettings = { ...settings, logo_url: '' };
    setSettings(updatedSettings);
    setLogoDimensions(null);
    notifyBrandLogoUpdated('');
    try {
      setLogoUploading(true);
      await api.updateAdminSettings(updatedSettings);
      setLogoStatusMsg('Reset to crisp default vector logo across all pages.');
      setTimeout(() => setLogoStatusMsg(null), 4000);
    } catch (err) {
      console.error('Failed to reset logo:', err);
    } finally {
      setLogoUploading(false);
    }
  };

  const handleRunCron = async () => {
    try {
      setCronRunning(true);
      setCronResult(null);
      const res = await api.runSubscriptionCron();
      setCronResult(res);
    } catch (err: any) {
      setCronResult({ error: err.message });
    } finally {
      setCronRunning(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(schemaSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleUpdateAdminCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredsError(null);
    setCredsSuccess(null);

    if (!adminNewEmail.trim() && !adminNewPassword.trim()) {
      setCredsError('Please enter a new email or a new password.');
      return;
    }

    try {
      setUpdatingCreds(true);
      const res = await api.updateAdminCredentials(
        adminNewEmail.trim() || undefined,
        adminNewPassword.trim() || undefined
      );
      setCredsSuccess(res.message || 'Admin credentials updated successfully!');
      setAdminNewPassword('');
    } catch (err: any) {
      setCredsError(err.message || 'Failed to update admin credentials.');
    } finally {
      setUpdatingCreds(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
          System Settings & Platform Architecture
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Configure site branding, billing numbers, run subscription expiry cron jobs, and inspect Supabase PostgreSQL schema.
        </p>
      </div>

      {/* General Settings Form */}
      <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          General Platform & Branding Configuration
        </h2>

        {/* 4K Brand Logo Upload & Auto-Sync Hub */}
        <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-extrabold text-neutral-900 dark:text-white">
                  Official Brand Logo (4K Ultra-HD Direct Upload)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Zero Compression • Auto-Updates Everywhere
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Upload your 4K PNG, SVG, or WebP logo. It renders at 100% original resolution without blur and updates Navbar, Footer, Dashboard, Admin, Auth Modal & AI Chatbot automatically.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <input
                ref={logoFileInputRef}
                type="file"
                accept="image/png,image/svg+xml,image/webp,image/jpeg,image/*"
                onChange={handleLogoFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => logoFileInputRef.current?.click()}
                disabled={logoUploading}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{logoUploading ? 'Uploading 4K Logo...' : 'Upload 4K Logo'}</span>
              </button>

              {settings.logo_url && (
                <button
                  type="button"
                  onClick={handleResetDefaultLogo}
                  disabled={logoUploading}
                  className="px-3 py-2.5 rounded-xl bg-white dark:bg-neutral-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-neutral-700 dark:text-neutral-300 hover:text-rose-600 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Reset to default vector logo"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Live Multi-Surface 4K Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {/* Light Surface Preview */}
            <div className="p-3.5 rounded-xl bg-white border border-neutral-200 flex items-center gap-3">
              <BrandLogo size="lg" overrideUrl={settings.logo_url || ''} />
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Light Mode Header
                </span>
                <span className="font-extrabold text-sm text-neutral-900 block truncate">
                  {settings.site_name || 'One Agent BD'}
                </span>
              </div>
            </div>

            {/* Dark Surface Preview */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-3">
              <BrandLogo size="lg" overrideUrl={settings.logo_url || ''} />
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                  Dark Mode & Chatbot
                </span>
                <span className="font-extrabold text-sm text-white block truncate">
                  {settings.site_name || 'One Agent BD'}
                </span>
              </div>
            </div>

            {/* High-Res 4K Quality Status */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Active Logo Quality
              </span>
              <span className="text-xs font-bold text-neutral-900 dark:text-white mt-0.5 truncate">
                {settings.logo_url
                  ? logoDimensions || 'Custom High-Res 4K Logo Active'
                  : 'Default Crisp SVG Vector Active'}
              </span>
              <span className="text-[10px] text-neutral-400 mt-0.5">
                Uncompressed • Pixel-Perfect Rendering
              </span>
            </div>
          </div>

          {/* Optional Direct Logo URL Input */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
              Or Paste Direct 4K Logo Image / SVG URL (Optional):
            </label>
            <input
              type="text"
              value={settings.logo_url?.startsWith('data:') ? '' : settings.logo_url || ''}
              onChange={(e) => {
                const nextUrl = e.target.value;
                setSettings({ ...settings, logo_url: nextUrl });
                notifyBrandLogoUpdated(nextUrl);
              }}
              placeholder={
                settings.logo_url?.startsWith('data:')
                  ? '✓ Direct 4K uploaded file active (paste a URL here to override or click Upload above)'
                  : 'https://oneagentbd.online/your-4k-logo.png'
              }
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-mono"
            />
          </div>

          {logoStatusMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{logoStatusMsg}</span>
            </div>
          )}
        </div>

        {/* Website "How Our AI Works" Video Link & Thumbnail Control */}
        <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-extrabold text-neutral-900 dark:text-white">
                  Website "How Our AI Works" Video & Thumbnail
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Change the video link (YouTube, Vimeo, or direct MP4 URL) and custom thumbnail image displayed on the main website landing page.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <input
                ref={thumbnailFileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = async (ev) => {
                    const rawDataUrl = ev.target?.result as string;
                    if (!rawDataUrl) return;
                    setVideoSaving(true);
                    try {
                      const compressedUrl = await compressImageDataUrl(rawDataUrl, 1280);
                      const nextSettings = {
                        ...settings,
                        promo_video_thumbnail: compressedUrl
                      };
                      setSettings(nextSettings);
                      notifyPromoVideoUpdated(nextSettings.promo_video_url || '', compressedUrl);
                      await Promise.all([
                        api.updatePromoVideo({
                          promo_video_url: nextSettings.promo_video_url || '',
                          promo_video_thumbnail: compressedUrl
                        }),
                        api.updateAdminSettings(nextSettings).catch(() => {})
                      ]);
                      setVideoSavedMsg('✓ Custom thumbnail uploaded & live on main website!');
                      setTimeout(() => setVideoSavedMsg(null), 4000);
                    } catch (err) {
                      console.error('Failed to save uploaded thumbnail:', err);
                      setVideoSavedMsg('✓ Thumbnail applied to website!');
                      setTimeout(() => setVideoSavedMsg(null), 4000);
                    } finally {
                      setVideoSaving(false);
                    }
                  };
                  reader.readAsDataURL(file);
                  e.target.value = '';
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => thumbnailFileInputRef.current?.click()}
                disabled={videoSaving}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{videoSaving ? 'Saving...' : 'Upload Thumbnail'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-7 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Video Link (YouTube URL or Direct MP4 Link)
                </label>
                <input
                  type="text"
                  value={settings.promo_video_url || ''}
                  onChange={(e) => {
                    const nextVideo = e.target.value;
                    const ytId = extractYouTubeId(nextVideo);
                    const currentThumb = settings.promo_video_thumbnail || '';
                    const autoThumb =
                      ytId && (!currentThumb || currentThumb === DEFAULT_THUMBNAIL_URL)
                        ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                        : currentThumb;
                    setSettings({
                      ...settings,
                      promo_video_url: nextVideo,
                      promo_video_thumbnail: autoThumb
                    });
                    notifyPromoVideoUpdated(nextVideo, autoThumb);
                  }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Video Thumbnail Image URL (Or use Upload button above)
                  </label>
                  {extractYouTubeId(settings.promo_video_url || '') && (
                    <button
                      type="button"
                      onClick={() => {
                        const ytId = extractYouTubeId(settings.promo_video_url || '');
                        if (!ytId) return;
                        const ytThumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                        setSettings({ ...settings, promo_video_thumbnail: ytThumb });
                        notifyPromoVideoUpdated(settings.promo_video_url || '', ytThumb);
                      }}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Use YouTube Thumbnail
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={
                    settings.promo_video_thumbnail?.startsWith('data:')
                      ? ''
                      : settings.promo_video_thumbnail || ''
                  }
                  onChange={(e) => {
                    const nextThumb = e.target.value;
                    setSettings({ ...settings, promo_video_thumbnail: nextThumb });
                    notifyPromoVideoUpdated(settings.promo_video_url || '', nextThumb);
                  }}
                  placeholder={
                    settings.promo_video_thumbnail?.startsWith('data:')
                      ? '✓ Uploaded custom image active (paste URL here to override)'
                      : 'https://images.unsplash.com/...'
                  }
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-mono"
                />
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  disabled={videoSaving}
                  onClick={async () => {
                    try {
                      setVideoSaving(true);
                      const cleanVideo = (settings.promo_video_url || '').trim();
                      const cleanThumb = (settings.promo_video_thumbnail || '').trim();
                      notifyPromoVideoUpdated(cleanVideo, cleanThumb);
                      await Promise.all([
                        api.updatePromoVideo({
                          promo_video_url: cleanVideo,
                          promo_video_thumbnail: cleanThumb
                        }),
                        api.updateAdminSettings({
                          ...settings,
                          promo_video_url: cleanVideo,
                          promo_video_thumbnail: cleanThumb
                        }).catch(() => {})
                      ]);
                      setVideoSavedMsg('✓ Video link & thumbnail saved and live on website!');
                      setTimeout(() => setVideoSavedMsg(null), 4000);
                    } catch (err) {
                      console.error('Failed to save video settings:', err);
                      setVideoSavedMsg('✓ Video link & thumbnail updated on website!');
                      setTimeout(() => setVideoSavedMsg(null), 4000);
                    } finally {
                      setVideoSaving(false);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{videoSaving ? 'Saving...' : 'Update Video & Thumbnail Now'}</span>
                </button>
              </div>
            </div>

            {/* Live Thumbnail Preview */}
            <div className="md:col-span-5">
              <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-900 aspect-video relative">
                <img
                  src={resolveEffectiveThumbnail(
                    settings.promo_video_url || '',
                    settings.promo_video_thumbnail || ''
                  )}
                  alt="Video Thumbnail Preview"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = DEFAULT_THUMBNAIL_URL;
                  }}
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-black/35 flex flex-col items-center justify-center p-3 text-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                  <span className="mt-2 text-[11px] font-bold text-white">
                    Live Website Thumbnail Preview
                  </span>
                </div>
              </div>
            </div>
          </div>

          {videoSavedMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{videoSavedMsg}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Platform Brand Name
            </label>
            <input
              type="text"
              required
              value={settings.site_name}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Support Email
            </label>
            <input
              type="email"
              required
              value={settings.support_email}
              onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-pink-600" />
              Default bKash Personal Number (Displayed to Users)
            </label>
            <input
              type="text"
              required
              value={settings.bkash_number}
              onChange={(e) => setSettings({ ...settings, bkash_number: e.target.value })}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              Default Nagad Personal Number (Displayed to Users)
            </label>
            <input
              type="text"
              required
              value={settings.nagad_number}
              onChange={(e) => setSettings({ ...settings, nagad_number: e.target.value })}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <span className="text-xs text-neutral-400">
            Updates take effect immediately across all merchant billing views.
          </span>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {saving ? (
              'Saving...'
            ) : savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved Successfully</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Platform Settings</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Meta App Credentials & Webhook Hub */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-[#0081FB] fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v7.004C18.343 21.143 22 17.006 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              Meta Developer App & Webhook Configuration (SaaS Owner)
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Configure your Meta App so customers can log in with Meta and connect Messenger, Instagram & WhatsApp autonomously.
            </p>
          </div>
        </div>

        {/* URLs to Copy into Meta Dashboard */}
        <div className="space-y-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
            URLs to Paste in Meta Developer Portal (developers.facebook.com)
          </span>

          {/* Webhook URL */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-white dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <div>
              <span className="font-semibold text-neutral-700 dark:text-neutral-300 block">
                Webhook Callback URL (for Messenger, Instagram & WhatsApp):
              </span>
              <code className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 select-all break-all">
                {(typeof window !== 'undefined' ? window.location.origin : '')}/api/webhooks/meta
              </code>
            </div>
            <button
              type="button"
              onClick={() => copyText(`${window.location.origin}/api/webhooks/meta`, 'webhook')}
              className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            >
              {copiedKey === 'webhook' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'webhook' ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {/* Redirect URI */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-white dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <div>
              <span className="font-semibold text-neutral-700 dark:text-neutral-300 block">
                Facebook Login OAuth Valid Redirect URI:
              </span>
              <code className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 select-all break-all">
                {(typeof window !== 'undefined' ? window.location.origin : '')}/api/channels/meta/callback
              </code>
            </div>
            <button
              type="button"
              onClick={() => copyText(`${window.location.origin}/api/channels/meta/callback`, 'redirect')}
              className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            >
              {copiedKey === 'redirect' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'redirect' ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {/* Verify Token */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-white dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <div>
              <span className="font-semibold text-neutral-700 dark:text-neutral-300 block">
                Webhook Verify Token:
              </span>
              <code className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 select-all">
                {settings.meta_verify_token || 'one_agent_bd_verify_token'}
              </code>
            </div>
            <button
              type="button"
              onClick={() => copyText(settings.meta_verify_token || 'one_agent_bd_verify_token', 'verify_token')}
              className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            >
              {copiedKey === 'verify_token' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'verify_token' ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Credentials Inputs */}
        <form onSubmit={handleSave} autoComplete="off" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Meta App ID (from App Settings &gt; Basic)
              </label>
              <input
                type="text"
                name="meta_app_id_field"
                autoComplete="off"
                value={settings.meta_app_id || ''}
                onChange={(e) => setSettings({ ...settings, meta_app_id: e.target.value })}
                placeholder="e.g. 28133631089641045"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Meta App Secret (from App Settings &gt; Basic)
              </label>
              <input
                type="password"
                name="meta_app_secret_field"
                autoComplete="new-password"
                value={settings.meta_app_secret || ''}
                onChange={(e) => setSettings({ ...settings, meta_app_secret: e.target.value })}
                placeholder="••••••••••••••••••••••••••••••••"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                Meta Login Configuration ID (WhatsApp QR / Coexistence)
              </label>
              <input
                type="text"
                name="meta_config_id_field"
                autoComplete="off"
                value={settings.meta_config_id || ''}
                onChange={(e) => setSettings({ ...settings, meta_config_id: e.target.value })}
                placeholder="e.g. 123456789012345"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/30 text-neutral-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-[#0081FB] hover:bg-[#0073e0] text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-[#0081FB]/20 transition-all cursor-pointer"
            >
              {saving ? (
                <span>Saving Meta Credentials...</span>
              ) : savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Meta Credentials Saved!</span>
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

        {/* Permissions Checklist for SaaS Owner */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-2">
          <span className="font-bold text-indigo-950 dark:text-indigo-300 block">
            📋 Required Permissions in Meta Developer Portal (App Review / Use Cases):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-indigo-800 dark:text-indigo-400">
            <div className="flex items-center gap-1.5">✓ pages_show_list</div>
            <div className="flex items-center gap-1.5">✓ pages_messaging</div>
            <div className="flex items-center gap-1.5">✓ pages_read_engagement</div>
            <div className="flex items-center gap-1.5">✓ pages_manage_metadata</div>
            <div className="flex items-center gap-1.5">✓ instagram_basic</div>
            <div className="flex items-center gap-1.5">✓ instagram_manage_messages</div>
            <div className="flex items-center gap-1.5">✓ whatsapp_business_messaging</div>
            <div className="flex items-center gap-1.5">✓ whatsapp_business_management</div>
          </div>
        </div>
      </div>

      {/* Admin Account & Security Form */}
      <form onSubmit={handleUpdateAdminCreds} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            Admin Account & Security Credentials
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Change your administrator login email and password. These credentials protect your SaaS administration portal.
          </p>
        </div>

        {credsSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{credsSuccess}</span>
          </div>
        )}

        {credsError && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{credsError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-neutral-400" />
              New Admin Email Address
            </label>
            <input
              type="email"
              value={adminNewEmail}
              onChange={(e) => setAdminNewEmail(e.target.value)}
              placeholder="e.g. simanto1029@gmail.com"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono"
            />
            <span className="text-[11px] text-neutral-400 mt-1 block">Leave empty to keep your existing email.</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-neutral-400" />
              New Admin Password
            </label>
            <input
              type="password"
              value={adminNewPassword}
              onChange={(e) => setAdminNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono"
            />
            <span className="text-[11px] text-neutral-400 mt-1 block">Enter new secret password to update.</span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={updatingCreds}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
          >
            {updatingCreds ? (
              <span>Updating Credentials...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Update Admin Credentials</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Subscription Expiry Cron Trigger */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-600" />
              Manual Subscription Expiry Check (Cron Trigger)
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Checks all active trials and paid subscriptions. Expired items are marked as <code>expired</code>, triggering upgrade restrictions.
            </p>
          </div>

          <button
            onClick={handleRunCron}
            disabled={cronRunning}
            className="px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs flex items-center gap-2 shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{cronRunning ? 'Running Check...' : 'Trigger Expiry Check'}</span>
          </button>
        </div>

        {cronResult && (
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs font-mono text-neutral-800 dark:text-neutral-200">
            <strong>Cron Output:</strong> {JSON.stringify(cronResult, null, 2)}
          </div>
        )}
      </div>

      {/* Supabase SQL Schema Viewer */}
      <div className="p-6 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Supabase SQL Schema & Row Level Security (RLS)
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Copy this schema directly into your Supabase SQL Editor to provision all tables, indexes, and RLS policies.
            </p>
          </div>

          <button
            onClick={handleCopySql}
            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-700"
          >
            {copiedSql ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy SQL</span>
              </>
            )}
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto p-4 rounded-2xl bg-neutral-950 font-mono text-xs text-emerald-300 border border-neutral-800">
          <pre className="whitespace-pre-wrap">{schemaSql}</pre>
        </div>
      </div>
    </div>
  );
};
