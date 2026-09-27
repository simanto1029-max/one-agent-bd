import React, { useState, useEffect, useCallback } from 'react';
import { Facebook, RefreshCw, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../../api';

declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

export const REQUIRED_META_PERMISSIONS = [
  'pages_manage_metadata',
  'pages_read_engagement',
  'pages_messaging',
  'business_management'
] as const;

export interface MetaLoginButtonProps {
  appId?: string;
  platform?: 'messenger' | 'instagram' | 'whatsapp';
  autoConnectChannels?: boolean;
  label?: string;
  compact?: boolean;
  showScopesBadge?: boolean;
  onTokensCaptured?: (data: {
    pages: any[];
    whatsappNumbers: any[];
    connectedChannels: any[];
    verificationReport?: any;
  }) => void;
  onFallbackPopupRequest?: () => void;
  onError?: (errorMessage: string) => void;
}

export const MetaLoginButton: React.FC<MetaLoginButtonProps> = ({
  appId,
  platform = 'messenger',
  autoConnectChannels = true,
  label = 'Continue with Facebook (Meta SDK)',
  compact = false,
  showScopesBadge = true,
  onTokensCaptured,
  onFallbackPopupRequest,
  onError
}) => {
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusStep, setStatusStep] = useState<string | null>(null);
  const [resolvedAppId, setResolvedAppId] = useState<string>(appId || '');

  useEffect(() => {
    if (appId) {
      setResolvedAppId(appId);
    } else {
      api
        .getMetaConfig()
        .then((cfg) => {
          if (cfg.appId) {
            setResolvedAppId(cfg.appId);
          }
        })
        .catch(() => {
          // ignore
        });
    }
  }, [appId]);

  const initFacebookSdk = useCallback((targetAppId: string) => {
    if (!targetAppId) return;

    if (window.FB) {
      try {
        window.FB.init({
          appId: targetAppId,
          cookie: true,
          xfbml: false,
          version: 'v21.0'
        });
        setSdkReady(true);
      } catch {
        // Ignore re-init error
      }
      return;
    }

    window.fbAsyncInit = function () {
      if (window.FB) {
        window.FB.init({
          appId: targetAppId,
          cookie: true,
          xfbml: false,
          version: 'v21.0'
        });
        setSdkReady(true);
      }
    };

    const existingScript = document.getElementById('facebook-jssdk');
    if (!existingScript) {
      const js = document.createElement('script');
      js.id = 'facebook-jssdk';
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      js.async = true;
      js.defer = true;
      js.crossOrigin = 'anonymous';
      js.onerror = () => {
        setSdkReady(false);
      };
      document.body.appendChild(js);
    }
  }, []);

  useEffect(() => {
    if (resolvedAppId) {
      initFacebookSdk(resolvedAppId);
    }
  }, [resolvedAppId, initFacebookSdk]);

  const targetPlatform: 'messenger' | 'instagram' | 'whatsapp' =
    platform === 'instagram' || platform === 'whatsapp' ? platform : 'messenger';

  const buildScopeString = () => {
    const baseScopes: string[] = [
      ...REQUIRED_META_PERMISSIONS,
      'pages_show_list'
    ];
    if (targetPlatform === 'instagram') {
      baseScopes.push('instagram_basic', 'instagram_manage_messages');
    } else if (targetPlatform === 'whatsapp') {
      baseScopes.push('whatsapp_business_management', 'whatsapp_business_messaging');
    }
    return Array.from(new Set(baseScopes)).join(',');
  };

  const handleSdkTokenCapture = async (accessToken: string, grantedScopesStr?: string) => {
    try {
      setStatusStep('Storing & verifying Page Access Tokens...');
      const grantedScopes = grantedScopesStr
        ? grantedScopesStr.split(',').map((s) => s.trim()).filter(Boolean)
        : [...REQUIRED_META_PERMISSIONS];

      const result = await api.captureMetaSdkTokens(accessToken, {
        platform: targetPlatform,
        autoConnectChannels,
        grantedScopes
      });

      setLoading(false);
      setStatusStep(null);

      if (onTokensCaptured) {
        onTokensCaptured({
          pages: result.pages || [],
          whatsappNumbers: result.whatsappNumbers || [],
          connectedChannels: result.connectedChannels || [],
          verificationReport: result.verificationReport
        });
      }
    } catch (err: any) {
      setLoading(false);
      setStatusStep(null);
      if (onError) {
        onError(err?.message || 'Failed to capture and verify Page Access Tokens.');
      }
    }
  };

  const handleLoginClick = async () => {
    if (!resolvedAppId) {
      if (onFallbackPopupRequest) {
        onFallbackPopupRequest();
        return;
      }
      if (onError) {
        onError('Meta App ID is not configured yet. Please save your Meta App ID & Secret in Meta App Setup or use Token Auto-Capture.');
      }
      return;
    }

    setLoading(true);
    setStatusStep('Initiating Facebook SDK Login...');

    const scopeString = buildScopeString();

    if (window.FB) {
      try {
        window.FB.init({
          appId: resolvedAppId,
          cookie: true,
          xfbml: false,
          version: 'v21.0'
        });

        window.FB.login(
          (response) => {
            if (response?.authResponse?.accessToken) {
              handleSdkTokenCapture(
                response.authResponse.accessToken,
                response.authResponse.grantedScopes
              );
            } else {
              setLoading(false);
              setStatusStep(null);
              if (onError) {
                onError('Facebook Login was cancelled or required permissions were not granted.');
              }
            }
          },
          {
            scope: scopeString,
            return_scopes: true,
            enable_profile_selector: true
          }
        );
        return;
      } catch {
        // Fallback to OAuth popup if FB.login fails inside iframe or HTTP context
      }
    }

    // Fallback to server-side OAuth Popup dialog if JS SDK is blocked by browser privacy settings
    try {
      const authData = await api.getMetaAuthUrl(targetPlatform);
      if (authData.isConfigured && authData.authUrl) {
        const width = 620;
        const height = 720;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        window.open(
          authData.authUrl,
          'meta_oauth_popup',
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=yes`
        );
        setLoading(false);
        setStatusStep(null);
      } else {
        setLoading(false);
        setStatusStep(null);
        if (onFallbackPopupRequest) {
          onFallbackPopupRequest();
        } else if (onError) {
          onError('Meta App ID & Secret are not configured yet.');
        }
      }
    } catch (err: any) {
      setLoading(false);
      setStatusStep(null);
      if (onError) {
        onError(err?.message || 'Failed to initiate Meta Login flow.');
      }
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleLoginClick}
        disabled={loading}
        className={`${
          compact ? 'py-2.5 px-4 text-xs' : 'w-full py-3.5 px-5 text-sm'
        } rounded-xl bg-[#1877F2] hover:bg-[#166fe5] disabled:opacity-60 text-white font-bold shadow-md shadow-[#1877F2]/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer`}
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
            <span>{statusStep || 'Connecting to Meta...'}</span>
          </>
        ) : (
          <>
            <Facebook className="w-4 h-4 fill-current shrink-0" />
            <span>{label}</span>
            {sdkReady && (
              <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-semibold">
                SDK Ready
              </span>
            )}
          </>
        )}
      </button>

      {showScopesBadge && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mr-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            Permissions:
          </span>
          {REQUIRED_META_PERMISSIONS.map((perm) => (
            <span
              key={perm}
              className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/70 flex items-center gap-1"
            >
              <CheckCircle2 className="w-2.5 h-2.5 text-blue-500" />
              {perm}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
