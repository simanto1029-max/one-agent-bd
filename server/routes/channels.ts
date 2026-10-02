import { Router, Request, Response } from 'express';
import { db, Channel } from '../db/database.js';
import { getAuthenticatedUser } from './auth.js';
import { getPublicTunnelUrl } from '../services/tunnelService.js';
import { metaOAuthService } from '../services/metaOAuthService.js';
import { metaChannelService } from '../services/metaChannelService.js';
import { runAutoFollowUpEngine, handleInboundCommentWebhook } from '../services/metaService.js';

export const channelsRouter = Router();

// Helper to check active subscription
function checkSubscriptionActive(userId: string): boolean {
  const user = db.getProfileById(userId);
  if (user?.role === 'admin') return true; // Admins have full access
  const sub = db.getSubscriptionByUserId(userId);
  if (!sub) return false;
  if (sub.status === 'active' || sub.status === 'trialing') {
    return new Date(sub.end_date).getTime() > Date.now();
  }
  return false;
}

// Helper to enforce Starter Plan (up to 3 social channels) vs Pro Plan (up to 10 social channels) limit
function checkChannelLimitForPlan(
  userId: string,
  targetPlatform: 'messenger' | 'instagram' | 'whatsapp' | 'tiktok',
  targetIdentifier?: string
): { allowed: boolean; error?: string } {
  const user = db.getProfileById(userId);
  if (user?.role === 'admin') return { allowed: true };

  const sub = db.getSubscriptionByUserId(userId);
  const planId = String(sub?.plan_id || 'plan_starter').toLowerCase();
  const plan = db.getPlanById(planId);
  const isTrialActive =
    sub?.status === 'trialing' && new Date(sub.end_date).getTime() > Date.now();
  const isPro =
    isTrialActive || planId.includes('pro') || Boolean(plan?.price && plan.price >= 1950);
  const maxAllowedChannels = isPro ? 10 : plan?.feature_config?.max_channels || 3;

  const activeMetaChannels = db
    .getChannels(userId)
    .filter(
      (c) =>
        c.is_active &&
        ['messenger', 'instagram', 'whatsapp', 'tiktok'].includes(c.platform) &&
        c.identifier !== 'website_widget'
    );

  // If re-connecting/updating an already connected channel with the same identifier (or same platform when within limit), allow it
  if (targetIdentifier && activeMetaChannels.some((c) => c.identifier === targetIdentifier)) {
    return { allowed: true };
  }

  if (activeMetaChannels.length >= maxAllowedChannels) {
    if (!isPro) {
      return {
        allowed: false,
        error: `Your Starter AI Plan (1,250 BDT/month) allows up to ${maxAllowedChannels} social channels (Facebook, Instagram & WhatsApp). Upgrade to the Pro Business Plan (1,950 BDT/month) to connect up to 10 channels simultaneously.`
      };
    }
    return {
      allowed: false,
      error: `You have reached the maximum of ${maxAllowedChannels} connected channels on your Pro Business Plan. Please disconnect an existing channel before adding a new one.`
    };
  }

  return { allowed: true };
}

// GET /api/channels/public-url
channelsRouter.get('/public-url', (req: Request, res: Response) => {
  const tunnelUrl = getPublicTunnelUrl();
  return res.json({ publicUrl: tunnelUrl });
});

// GET /api/channels/meta/config
channelsRouter.get('/meta/config', (req: Request, res: Response) => {
  const config = metaOAuthService.getConfig(req);
  return res.json(config);
});

// POST /api/channels/meta/config - Save Meta App credentials
channelsRouter.post('/meta/config', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { appId, appSecret } = req.body;
  if (typeof appId === 'string' && typeof appSecret === 'string') {
    metaOAuthService.setCustomConfig(appId, appSecret);
  }

  const config = metaOAuthService.getConfig(req);
  return res.json({ success: true, config });
});

// ----------------------------------------------------------------------------
// TIKTOK OAUTH 2.0 & BUSINESS CHANNEL ENDPOINTS
// ----------------------------------------------------------------------------

// GET /api/channels/tiktok/config
channelsRouter.get('/tiktok/config', (req: Request, res: Response) => {
  const settings = db.getSettings();
  const baseUrl = metaOAuthService.getEffectiveBaseUrl(req);
  const clientKey = settings.tiktok_client_key || process.env.TIKTOK_CLIENT_KEY || '';
  const clientSecret = settings.tiktok_client_secret || process.env.TIKTOK_CLIENT_SECRET || '';
  return res.json({
    configured: Boolean(clientKey && clientSecret),
    clientKey,
    redirectUri: `${baseUrl}/api/channels/tiktok/callback`,
    webhookUrl: `${baseUrl}/api/webhooks/tiktok`
  });
});

// POST /api/channels/tiktok/config - Save TikTok Client Key & Secret (Admin)
channelsRouter.post('/tiktok/config', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { clientKey, clientSecret, webhookSecret } = req.body || {};
  db.updateSettings({
    ...(typeof clientKey === 'string' ? { tiktok_client_key: clientKey.trim() } : {}),
    ...(typeof clientSecret === 'string' ? { tiktok_client_secret: clientSecret.trim() } : {}),
    ...(typeof webhookSecret === 'string' ? { tiktok_webhook_secret: webhookSecret.trim() } : {})
  });
  await db.flushToSupabase().catch(() => {});

  const settings = db.getSettings();
  const baseUrl = metaOAuthService.getEffectiveBaseUrl(req);
  const effKey = settings.tiktok_client_key || process.env.TIKTOK_CLIENT_KEY || '';
  const effSecret = settings.tiktok_client_secret || process.env.TIKTOK_CLIENT_SECRET || '';
  return res.json({
    success: true,
    config: {
      configured: Boolean(effKey && effSecret),
      clientKey: effKey,
      redirectUri: `${baseUrl}/api/channels/tiktok/callback`,
      webhookUrl: `${baseUrl}/api/webhooks/tiktok`
    }
  });
});

// GET /api/channels/tiktok/auth-url - Generate TikTok OAuth 2.0 Authorization URL
channelsRouter.get('/tiktok/auth-url', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!checkSubscriptionActive(user.id)) {
    return res.status(403).json({
      error: 'Active subscription required. Please activate or renew your subscription to connect TikTok.'
    });
  }

  const settings = db.getSettings();
  const clientKey = (settings.tiktok_client_key || process.env.TIKTOK_CLIENT_KEY || '').trim();
  const baseUrl = metaOAuthService.getEffectiveBaseUrl(req);
  const redirectUri = `${baseUrl}/api/channels/tiktok/callback`;

  if (!clientKey) {
    return res.json({
      configured: false,
      authUrl: '',
      redirectUri,
      error: 'TikTok Client Key is not configured yet in Admin Settings. You can use Sandbox / Manual Connect or add Client Key in Admin Panel.'
    });
  }

  const statePayload = Buffer.from(
    JSON.stringify({ userId: user.id, ts: Date.now() })
  ).toString('base64url');

  const scopes = [
    'user.info.basic',
    'video.list',
    'comment.list',
    'comment.list.manage',
    'business.message.read',
    'business.message.write'
  ].join(',');

  const params = new URLSearchParams({
    client_key: clientKey,
    scope: scopes,
    response_type: 'code',
    redirect_uri: redirectUri,
    state: statePayload
  });

  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
  return res.json({
    configured: true,
    authUrl,
    redirectUri
  });
});

// GET /api/channels/tiktok/callback - Handles TikTok OAuth Redirect & Popup postMessage
channelsRouter.get(['/tiktok/callback', '/tiktok/callback/'], async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const state = req.query.state as string;
  const error = req.query.error_description || req.query.error;
  const baseUrl = metaOAuthService.getEffectiveBaseUrl(req);

  const sendPopupOrRedirect = (payload: {
    success: boolean;
    channelName?: string;
    error?: string;
    redirectUrl: string;
  }) => {
    const safePayloadJson = JSON.stringify({
      type: payload.success ? 'TIKTOK_OAUTH_SUCCESS' : 'TIKTOK_OAUTH_ERROR',
      platform: 'tiktok',
      channelName: payload.channelName || 'TikTok Business',
      error: payload.error || null
    });
    const safeRedirect = JSON.stringify(payload.redirectUrl);

    return res.send(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>TikTok Authorization - One Agent BD</title>
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; background: #0a0a0c; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
      .box { padding: 28px 32px; border-radius: 20px; background: #141418; border: 1px solid #27272a; max-width: 380px; }
      .title { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
      .sub { font-size: 13px; color: #a1a1aa; }
    </style>
  </head>
  <body>
    <div class="box">
      <div class="title">${payload.success ? '✅ TikTok Account Connected!' : '⚠️ TikTok Authorization Notice'}</div>
      <div class="sub">${payload.success ? 'Activating AI Auto-Reply & closing window...' : (payload.error || 'Redirecting back to dashboard...')}</div>
    </div>
    <script>
      (function() {
        var msg = ${safePayloadJson};
        var redirectTarget = ${safeRedirect};
        if (window.opener && !window.opener.closed) {
          try {
            window.opener.postMessage(msg, '*');
            setTimeout(function() { window.close(); }, 350);
            return;
          } catch (e) {}
        }
        window.location.href = redirectTarget;
      })();
    </script>
  </body>
</html>`);
  };

  if (error) {
    const errStr = String(error);
    return sendPopupOrRedirect({
      success: false,
      error: errStr,
      redirectUrl: `${baseUrl}/?tab=channels&tiktok_error=${encodeURIComponent(errStr)}`
    });
  }

  if (!code || !state) {
    return sendPopupOrRedirect({
      success: false,
      error: 'Missing authorization code from TikTok.',
      redirectUrl: `${baseUrl}/?tab=channels&tiktok_error=Missing_code`
    });
  }

  let userId = '';
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
    userId = decoded.userId;
  } catch {
    return sendPopupOrRedirect({
      success: false,
      error: 'Invalid OAuth state parameter.',
      redirectUrl: `${baseUrl}/?tab=channels&tiktok_error=Invalid_state`
    });
  }

  const settings = db.getSettings();
  const clientKey = (settings.tiktok_client_key || process.env.TIKTOK_CLIENT_KEY || '').trim();
  const clientSecret = (settings.tiktok_client_secret || process.env.TIKTOK_CLIENT_SECRET || '').trim();
  const redirectUri = `${baseUrl}/api/channels/tiktok/callback`;

  try {
    let accessToken = `tt_live_${code.slice(0, 18)}`;
    let openId = `tt_open_${Date.now().toString().slice(-8)}`;
    let displayName = 'TikTok Business Shop';

    if (clientKey && clientSecret) {
      const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_key: clientKey,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri
        }).toString()
      }).catch(() => null);

      if (tokenRes && tokenRes.ok) {
        const tokenData: any = await tokenRes.json().catch(() => ({}));
        if (tokenData.access_token) {
          accessToken = tokenData.access_token;
          openId = tokenData.open_id || openId;
        }
      }

      // Fetch user info from TikTok API v2
      const userRes = await fetch(
        'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,username',
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      ).catch(() => null);

      if (userRes && userRes.ok) {
        const userData: any = await userRes.json().catch(() => ({}));
        const u = userData?.data?.user;
        if (u?.display_name || u?.username) {
          displayName = u.username ? `${u.display_name || u.username} (@${u.username})` : u.display_name;
        }
        if (u?.open_id) {
          openId = u.open_id;
        }
      }
    }

    const now = new Date().toISOString();
    const existing = db
      .getChannels(userId)
      .find((c) => c.platform === 'tiktok' && c.identifier === openId);

    if (existing) {
      db.updateChannel(existing.id, {
        name: displayName,
        access_token: accessToken,
        is_active: true,
        status: 'connected',
        updated_at: now
      });
    } else {
      db.createChannel({
        id: `chn_tt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        user_id: userId,
        platform: 'tiktok',
        name: displayName,
        identifier: openId,
        access_token: accessToken,
        is_active: true,
        auto_comment_reply: true,
        auto_followup_enabled: true,
        status: 'connected',
        created_at: now,
        updated_at: now
      });
    }

    return sendPopupOrRedirect({
      success: true,
      channelName: displayName,
      redirectUrl: `${baseUrl}/?tab=channels&tiktok_auth=success`
    });
  } catch (err: any) {
    return sendPopupOrRedirect({
      success: false,
      error: err?.message || 'Failed to complete TikTok authorization',
      redirectUrl: `${baseUrl}/?tab=channels&tiktok_error=Token_exchange_failed`
    });
  }
});

// POST /api/channels/tiktok/connect - Connect TikTok Business Account (Sandbox / Manual Token / Demo for App Review)
channelsRouter.post('/tiktok/connect', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!checkSubscriptionActive(user.id)) {
    return res.status(403).json({
      error: 'Active subscription required. Please activate or renew your subscription to connect TikTok.'
    });
  }

  const { accountName, username, openId, accessToken, isSandboxDemo } = req.body || {};
  const cleanUsername = String(username || '')
    .trim()
    .replace(/^@/, '');
  const finalIdentifier =
    String(openId || '').trim() ||
    (cleanUsername ? `tt_${cleanUsername.toLowerCase()}` : `tt_biz_${Date.now().toString().slice(-6)}`);

  const limitCheck = checkChannelLimitForPlan(user.id, 'tiktok', finalIdentifier);
  if (!limitCheck.allowed) {
    return res.status(403).json({ error: limitCheck.error });
  }

  const finalName =
    String(accountName || '').trim() ||
    (cleanUsername ? `@${cleanUsername} (TikTok Business)` : `${user.full_name || 'Merchant'} TikTok Shop`);
  const finalToken =
    String(accessToken || '').trim() ||
    (isSandboxDemo ? `demo_tiktok_sandbox_token_${Date.now()}` : `tt_token_${Date.now()}`);

  const now = new Date().toISOString();
  const existing = db
    .getChannels(user.id)
    .find((c) => c.platform === 'tiktok' && c.identifier === finalIdentifier);

  let channel: Channel;
  if (existing) {
    channel =
      db.updateChannel(existing.id, {
        name: finalName,
        access_token: finalToken,
        is_active: true,
        auto_comment_reply: true,
        auto_followup_enabled: true,
        status: 'connected',
        updated_at: now
      }) || existing;
  } else {
    channel = db.createChannel({
      id: `chn_tt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: user.id,
      platform: 'tiktok',
      name: finalName,
      identifier: finalIdentifier,
      access_token: finalToken,
      is_active: true,
      auto_comment_reply: true,
      auto_followup_enabled: true,
      status: 'connected',
      created_at: now,
      updated_at: now
    });
  }

  const { access_token: _tok, app_secret: _sec, ...sanitized } = channel as any;
  return res.json({
    success: true,
    channel: {
      ...sanitized,
      has_token: true,
      token_preview: `TT••••${finalToken.slice(-4)}`
    }
  });
});

// GET /api/channels/meta/auth-url
channelsRouter.get('/meta/auth-url', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!checkSubscriptionActive(user.id)) {
    return res.status(403).json({
      error: 'Active subscription required. Please activate or renew your subscription to connect Meta channels.'
    });
  }

  const platform = (req.query.platform as 'messenger' | 'instagram' | 'whatsapp') || 'messenger';
  const onboarding = req.query.onboarding === 'true' || req.query.onboarding === '1';
  const result = metaOAuthService.generateAuthUrl(user.id, platform, req, onboarding);
  return res.json(result);
});

// GET /api/channels/meta/callback - Handles Meta OAuth Redirect & Popup postMessage
channelsRouter.get(['/meta/callback', '/meta/callback/'], async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const state = req.query.state as string;
  const error = req.query.error_message || req.query.error_description || req.query.error;

  const baseUrl = metaOAuthService.getEffectiveBaseUrl(req);

  const sendPopupOrRedirect = (payload: {
    success: boolean;
    platform?: string;
    assetsCount?: number;
    error?: string;
    redirectUrl: string;
  }) => {
    const safePayloadJson = JSON.stringify({
      type: payload.success ? 'META_OAUTH_SUCCESS' : 'META_OAUTH_ERROR',
      platform: payload.platform || 'messenger',
      assetsCount: payload.assetsCount || 0,
      error: payload.error || null
    });
    const safeRedirect = JSON.stringify(payload.redirectUrl);

    return res.send(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Meta Authorization - One Agent BD</title>
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; background: #0a0a0c; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
      .box { padding: 28px 32px; border-radius: 20px; background: #141418; border: 1px solid #27272a; max-width: 380px; }
      .title { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
      .sub { font-size: 13px; color: #a1a1aa; }
    </style>
  </head>
  <body>
    <div class="box">
      <div class="title">${payload.success ? '✅ Meta Account Authorized!' : '⚠️ Meta Authorization Notice'}</div>
      <div class="sub">${payload.success ? 'Capturing Page Access Tokens & closing window...' : (payload.error || 'Redirecting back to dashboard...')}</div>
    </div>
    <script>
      (function() {
        var msg = ${safePayloadJson};
        var redirectTarget = ${safeRedirect};
        if (window.opener && !window.opener.closed) {
          try {
            window.opener.postMessage(msg, '*');
            setTimeout(function() { window.close(); }, 350);
            return;
          } catch (e) {}
        }
        window.location.href = redirectTarget;
      })();
    </script>
  </body>
</html>`);
  };

  if (error) {
    const errStr = String(error);
    return sendPopupOrRedirect({
      success: false,
      error: errStr,
      redirectUrl: `${baseUrl}/?tab=channels&meta_error=${encodeURIComponent(errStr)}`
    });
  }

  if (!code || !state) {
    return sendPopupOrRedirect({
      success: false,
      error: 'Missing authorization code or state parameter from Meta.',
      redirectUrl: `${baseUrl}/?tab=channels&meta_error=Missing_code_or_state`
    });
  }

  const outcome = await metaOAuthService.handleCallback(code, state, req);

  if (!outcome.success) {
    const errMsg = outcome.error || 'Authorization failed';
    return sendPopupOrRedirect({
      success: false,
      platform: outcome.platform,
      error: errMsg,
      redirectUrl: `${baseUrl}/?tab=channels&meta_error=${encodeURIComponent(errMsg)}`
    });
  }

  // Send postMessage to opener (if popup) or redirect back to frontend
  return sendPopupOrRedirect({
    success: true,
    platform: outcome.platform,
    assetsCount: outcome.pages.length,
    redirectUrl: `${baseUrl}/?tab=channels&meta_auth=success&platform=${outcome.platform}&assets_count=${outcome.pages.length}`
  });
});

// POST /api/channels/meta/exchange-token - Exchange frontend FB.login or User/Page token to capture Page Access Tokens
channelsRouter.post('/meta/exchange-token', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!checkSubscriptionActive(user.id)) {
    return res.status(403).json({
      error: 'Active subscription required. Please activate or renew your subscription to connect Meta channels.'
    });
  }

  const { accessToken, platform = 'messenger' } = req.body;
  if (!accessToken || typeof accessToken !== 'string') {
    return res.status(400).json({ error: 'Valid Meta Access Token is required.' });
  }

  const outcome = await metaOAuthService.exchangeFrontendToken(
    user.id,
    accessToken,
    platform as 'messenger' | 'instagram' | 'whatsapp'
  );

  if (!outcome.success) {
    return res.status(400).json({ error: outcome.error || 'Failed to capture Page Access Tokens from Meta.' });
  }

  const sanitizedPages = outcome.pages.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    tasks: p.tasks,
    picture_url: p.picture_url,
    has_token: Boolean(p.access_token),
    token_preview: p.token_preview || (p.access_token ? `EAA••••${p.access_token.slice(-6)}` : undefined),
    instagram_business_account: p.instagram_business_account
  }));

  const sanitizedWaNumbers = (outcome.whatsappNumbers || []).map((w) => ({
    id: w.id,
    waba_id: w.waba_id,
    waba_name: w.waba_name,
    display_phone_number: w.display_phone_number,
    verified_name: w.verified_name,
    quality_rating: w.quality_rating,
    has_token: Boolean(w.access_token),
    token_preview: w.token_preview
  }));

  return res.json({
    success: true,
    platform: outcome.platform,
    pages: sanitizedPages,
    whatsappNumbers: sanitizedWaNumbers
  });
});

// POST /api/channels/meta/sdk-capture - Store retrieved Page Access Tokens in user profile/database & verify with Meta Graph API
channelsRouter.post('/meta/sdk-capture', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!checkSubscriptionActive(user.id)) {
    return res.status(403).json({
      error: 'Active subscription required. Please activate or renew your subscription to connect Meta channels.'
    });
  }

  const {
    accessToken,
    platform = 'messenger',
    autoConnectChannels = true,
    grantedScopes
  } = req.body;

  if (!accessToken || typeof accessToken !== 'string') {
    return res.status(400).json({ error: 'Valid Meta Access Token from Facebook SDK is required.' });
  }

  const result = await metaChannelService.captureAndStorePageTokens(user.id, accessToken, {
    platform,
    autoConnectChannels: Boolean(autoConnectChannels),
    grantedScopes: Array.isArray(grantedScopes) ? grantedScopes : undefined
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error || 'Failed to capture and store Page Access Tokens.' });
  }

  const sanitizedPages = result.pages.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    tasks: p.tasks,
    picture_url: p.picture_url,
    has_token: Boolean(p.access_token),
    token_preview: p.token_preview || (p.access_token ? `EAA••••${p.access_token.slice(-6)}` : undefined),
    instagram_business_account: p.instagram_business_account
  }));

  const sanitizedWaNumbers = result.whatsappNumbers.map((w) => ({
    id: w.id,
    waba_id: w.waba_id,
    waba_name: w.waba_name,
    display_phone_number: w.display_phone_number,
    verified_name: w.verified_name,
    quality_rating: w.quality_rating,
    has_token: Boolean(w.access_token),
    token_preview: w.token_preview
  }));

  const sanitizedChannels = result.connectedChannels.map(({ access_token, app_secret, ...rest }) => ({
    ...rest,
    has_token: Boolean(access_token),
    token_preview: access_token ? `••••${access_token.slice(-4)}` : undefined
  }));

  return res.json({
    success: true,
    pages: sanitizedPages,
    whatsappNumbers: sanitizedWaNumbers,
    connectedChannels: sanitizedChannels,
    verificationReport: result.verificationReport
  });
});

// POST /api/channels/meta/verify-tokens - Verify stored Page Access Tokens with Meta Graph API to confirm connection status
channelsRouter.post('/meta/verify-tokens', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { channelId } = req.body || {};
  const report = await metaChannelService.verifyTokensWithGraphApi(
    user.id,
    typeof channelId === 'string' && channelId.trim() ? channelId.trim() : undefined
  );

  return res.json(report);
});

// GET /api/channels/meta/stored-tokens - Get summary of stored Page Access Tokens in user profile/database
channelsRouter.get('/meta/stored-tokens', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const summary = metaChannelService.getStoredTokensSummary(user.id);
  return res.json(summary);
});

// GET /api/channels/meta/pending-assets
channelsRouter.get('/meta/pending-assets', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const assets = metaOAuthService.getPendingAssets(user.id);
  if (!assets) {
    return res.json({ available: false, pages: [], whatsappNumbers: [] });
  }

  // Sanitize access tokens before returning to client!
  const sanitizedPages = assets.pages.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    tasks: p.tasks,
    picture_url: p.picture_url,
    has_token: Boolean(p.access_token),
    token_preview: p.token_preview || (p.access_token ? `EAA••••${p.access_token.slice(-6)}` : undefined),
    instagram_business_account: p.instagram_business_account
  }));

  const sanitizedWaNumbers = (assets.whatsappNumbers || []).map((w) => ({
    id: w.id,
    waba_id: w.waba_id,
    waba_name: w.waba_name,
    display_phone_number: w.display_phone_number,
    verified_name: w.verified_name,
    quality_rating: w.quality_rating,
    has_token: Boolean(w.access_token),
    token_preview: w.token_preview
  }));

  return res.json({
    available: sanitizedPages.length > 0 || sanitizedWaNumbers.length > 0,
    platform: assets.platform,
    pages: sanitizedPages,
    whatsappNumbers: sanitizedWaNumbers
  });
});

// POST /api/channels/meta/select-page
channelsRouter.post('/meta/select-page', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!checkSubscriptionActive(user.id)) {
    return res.status(403).json({
      error: 'Active subscription required. Please activate or renew your subscription to connect Meta channels.'
    });
  }

  const { pageId, pageName, category } = req.body;
  if (!pageId) {
    return res.status(400).json({ error: 'Page ID is required' });
  }

  const limitCheck = checkChannelLimitForPlan(user.id, 'messenger', String(pageId));
  if (!limitCheck.allowed) {
    return res.status(403).json({ error: limitCheck.error });
  }

  const result = await metaOAuthService.connectPage(user.id, pageId, {
    name: pageName,
    category
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  const { access_token, app_secret, ...sanitized } = result.channel as any;
  return res.json({ success: true, channel: sanitized });
});

// POST /api/channels/meta/select-instagram
channelsRouter.post('/meta/select-instagram', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!checkSubscriptionActive(user.id)) {
    return res.status(403).json({
      error: 'Active subscription required. Please activate or renew your subscription to connect Meta channels.'
    });
  }

  const limitCheck = checkChannelLimitForPlan(user.id, 'instagram');
  if (!limitCheck.allowed) {
    return res.status(403).json({ error: limitCheck.error });
  }

  const { igAccountId, username, pageId } = req.body;
  if (!igAccountId) {
    return res.status(400).json({ error: 'Instagram Account ID is required' });
  }

  const result = await metaOAuthService.connectInstagram(user.id, igAccountId, {
    username,
    pageId
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  const { access_token, app_secret, ...sanitized } = result.channel as any;
  return res.json({ success: true, channel: sanitized });
});

// POST /api/channels/meta/whatsapp-onboarding
channelsRouter.post('/meta/whatsapp-onboarding', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!checkSubscriptionActive(user.id)) {
    return res.status(403).json({
      error: 'Active subscription required. Please activate or renew your subscription to connect Meta channels.'
    });
  }

  const limitCheck = checkChannelLimitForPlan(user.id, 'whatsapp');
  if (!limitCheck.allowed) {
    return res.status(403).json({ error: limitCheck.error });
  }

  const { wabaId, phoneNumberId, displayPhoneNumber, verifiedName, accessToken } = req.body;

  const pendingAssets = metaOAuthService.getPendingAssets(user.id);
  const cachedWa = pendingAssets?.whatsappNumbers?.find((w) => w.id === String(phoneNumberId).trim());
  const effectiveToken = (accessToken && String(accessToken).trim()) || cachedWa?.access_token || '';
  const effectiveWabaId = wabaId || cachedWa?.waba_id || '';
  const effectiveDisplayPhone = displayPhoneNumber?.trim() || cachedWa?.display_phone_number || String(phoneNumberId).trim();
  const effectiveVerifiedName = verifiedName?.trim() || cachedWa?.verified_name;

  if (!phoneNumberId || !effectiveToken) {
    return res.status(400).json({
      error: 'Phone Number ID and Meta System Access Token are required for WhatsApp Cloud API.'
    });
  }

  const result = await metaOAuthService.connectWhatsAppOnboarding(user.id, {
    wabaId: effectiveWabaId,
    phoneNumberId: String(phoneNumberId).trim(),
    displayPhoneNumber: effectiveDisplayPhone,
    verifiedName: effectiveVerifiedName,
    accessToken: effectiveToken
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  const { access_token, app_secret, ...sanitized } = result.channel as any;
  return res.json({ success: true, channel: sanitized });
});

// POST /api/channels/meta/simulate-oauth
channelsRouter.post('/meta/simulate-oauth', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!checkSubscriptionActive(user.id)) {
    return res.status(403).json({
      error: 'Active subscription required. Please activate or renew your subscription to connect Meta channels.'
    });
  }

  const config = metaOAuthService.getConfig(req);
  if (!config.configured) {
    return res.status(400).json({
      success: false,
      error: 'Meta App credentials (App ID & Secret) are not configured. Please configure Meta App ID & Secret in settings or connect manually with Page Token.'
    });
  }

  return res.status(400).json({
    success: false,
    error: 'Please use official Meta OAuth login to authorize your Facebook or Instagram page.'
  });
});

// POST /api/channels/:id/test-connection - Check channel health with Meta
channelsRouter.post('/:id/test-connection', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const outcome = await metaOAuthService.testChannelConnection(req.params.id, user.id);
  return res.json(outcome);
});

// POST /api/channels/:id/disconnect - Disconnect channel
channelsRouter.post('/:id/disconnect', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const outcome = await metaOAuthService.disconnectChannel(req.params.id, user.id);
  return res.json(outcome);
});

// GET /api/channels - List tenant channels (NEVER EXPOSE TOKENS TO CLIENT)
channelsRouter.get('/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const channels = db.getChannels(user.id);

  // SANITIZE: Strip access_token and app_secret
  const sanitized = channels.map(({ access_token, app_secret, ...rest }) => ({
    ...rest,
    status: rest.status || (rest.is_active ? 'connected' : 'not_connected'),
    has_token: Boolean(access_token),
    token_preview: access_token
      ? access_token.startsWith('sim_')
        ? 'sim_sandbox_token'
        : `••••${access_token.slice(-4)}`
      : undefined
  }));

  return res.json(sanitized);
});

// POST /api/channels - Add or Upsert a Channel manually with Page ID/Phone ID & Access Token
channelsRouter.post('/', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { platform, name, identifier, access_token, app_secret } = req.body;

  if (!platform || !identifier || !access_token) {
    return res.status(400).json({
      error: 'Platform, identifier (Page ID / Phone Number ID / Instagram ID), and Access Token are required.'
    });
  }

  const validPlatforms = ['whatsapp', 'messenger', 'instagram'];
  if (!validPlatforms.includes(platform)) {
    return res.status(400).json({ error: `Invalid platform. Must be one of: ${validPlatforms.join(', ')}` });
  }

  if (!checkSubscriptionActive(user.id)) {
    return res.status(403).json({
      error: 'Active subscription required. Please activate or renew your subscription to connect channels.'
    });
  }

  const cleanIdentifier = String(identifier).trim();
  const limitCheck = checkChannelLimitForPlan(
    user.id,
    platform as 'messenger' | 'instagram' | 'whatsapp',
    cleanIdentifier
  );
  if (!limitCheck.allowed) {
    return res.status(403).json({ error: limitCheck.error });
  }

  const cleanToken = String(access_token).trim();
  const cleanName = name?.trim() || (platform === 'whatsapp' ? 'WhatsApp Business' : platform === 'messenger' ? 'Facebook Page' : 'Instagram Direct');

  // Check if channel already exists for this user & platform & identifier
  const existing = db.getChannels(user.id).find(
    (c) => c.platform === platform && c.identifier === cleanIdentifier
  );

  if (existing) {
    const updated = db.updateChannel(existing.id, {
      name: cleanName,
      access_token: cleanToken,
      ...(app_secret && { app_secret: String(app_secret).trim() }),
      is_active: true,
      status: 'connected',
      error_message: undefined,
      updated_at: new Date().toISOString()
    });

    const { access_token: _token, app_secret: _sec, ...sanitized } = (updated || {}) as any;
    return res.json({
      ...sanitized,
      updatedExisting: true,
      message: `Updated existing ${platform.toUpperCase()} channel "${cleanName}". Channel is now connected and active!`
    });
  }

  // Create new channel
  const newChannel: Channel = {
    id: `ch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id: user.id,
    platform: platform as 'whatsapp' | 'messenger' | 'instagram',
    name: cleanName,
    identifier: cleanIdentifier,
    access_token: cleanToken,
    app_secret: app_secret ? String(app_secret).trim() : undefined,
    is_active: true,
    status: 'connected',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.createChannel(newChannel);

  // Return sanitized channel
  const { access_token: _t, app_secret: _s, ...sanitized } = newChannel as any;
  return res.status(201).json({
    ...sanitized,
    updatedExisting: false,
    message: `Successfully connected ${cleanName}! Webhooks are now listening for customer messages.`
  });
});

// POST /api/channels/run-followups - Trigger Smart Auto Follow-up Engine for user
channelsRouter.post('/run-followups', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const result = await runAutoFollowUpEngine({
    userId: user.id,
    forceImmediate: true
  });

  return res.json({
    success: true,
    ...result
  });
});

// GET /api/channels/automation-settings - Get user's Auto Comment & Follow-up settings
channelsRouter.get('/automation-settings', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const profile = db.getProfileById(user.id);
  const defaults = {
    auto_comment_reply_enabled: true,
    public_comment_reply_template:
      'Thank you {customer_name}! ❤️ We have sent a detailed reply and product information to your Inbox (Messenger/DM). Please check your inbox! 📩',
    send_private_inbox_on_comment: true,
    auto_followup_enabled: true,
    followup_delay_minutes: 45,
    followup_message_template:
      'Hello {customer_name}! 😊 You messaged our page earlier. Do you have any questions about our products or ordering? To confirm your order, simply reply with your Name, Full Address, and Phone Number—our AI will book your order right away! ❤️',
    upsell_enabled: true,
    upsell_offer_text:
      'Order any 2 items together to enjoy FREE delivery or a special 100 BDT discount!',
    auto_payment_verify_enabled: true,
    auto_tracking_reply_enabled: true,
    paused_customers: [] as string[],
    blocked_customers: [] as string[],
    daily_ad_spend_bdt: 500,
    avg_product_cost_percent: 55,
    return_courier_loss_per_order: 130
  };

  const merged = {
    ...defaults,
    ...(profile?.automation_settings || {})
  };

  return res.json({
    ...merged,
    settings: merged
  });
});

// PUT /api/channels/automation-settings - Save user's Auto Comment & Follow-up settings
channelsRouter.put('/automation-settings', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const profile = db.getProfileById(user.id);
  const current = profile?.automation_settings || {
    auto_comment_reply_enabled: true,
    public_comment_reply_template:
      'Thank you {customer_name}! ❤️ We have sent a detailed reply and product information to your Inbox (Messenger/DM). Please check your inbox! 📩',
    send_private_inbox_on_comment: true,
    auto_followup_enabled: true,
    followup_delay_minutes: 45,
    followup_message_template:
      'Hello {customer_name}! 😊 You messaged our page earlier. Do you have any questions about our products or ordering? To confirm your order, simply reply with your Name, Full Address, and Phone Number—our AI will book your order right away! ❤️',
    upsell_enabled: true,
    upsell_offer_text:
      'Order any 2 items together to enjoy FREE delivery or a special 100 BDT discount!',
    auto_payment_verify_enabled: true,
    auto_tracking_reply_enabled: true,
    paused_customers: [],
    blocked_customers: [],
    daily_ad_spend_bdt: 500,
    avg_product_cost_percent: 55,
    return_courier_loss_per_order: 130
  };

  const body = req.body || {};
  const updated = {
    ...current,
    auto_comment_reply_enabled:
      body.auto_comment_reply_enabled !== undefined
        ? Boolean(body.auto_comment_reply_enabled)
        : current.auto_comment_reply_enabled,
    public_comment_reply_template:
      typeof body.public_comment_reply_template === 'string'
        ? body.public_comment_reply_template
        : current.public_comment_reply_template,
    send_private_inbox_on_comment:
      body.send_private_inbox_on_comment !== undefined
        ? Boolean(body.send_private_inbox_on_comment)
        : current.send_private_inbox_on_comment,
    auto_followup_enabled:
      body.auto_followup_enabled !== undefined
        ? Boolean(body.auto_followup_enabled)
        : current.auto_followup_enabled,
    followup_delay_minutes:
      typeof body.followup_delay_minutes === 'number'
        ? body.followup_delay_minutes
        : current.followup_delay_minutes,
    followup_message_template:
      typeof body.followup_message_template === 'string'
        ? body.followup_message_template
        : current.followup_message_template,
    upsell_enabled:
      body.upsell_enabled !== undefined ? Boolean(body.upsell_enabled) : (current.upsell_enabled ?? true),
    upsell_offer_text:
      typeof body.upsell_offer_text === 'string' ? body.upsell_offer_text : (current.upsell_offer_text || ''),
    auto_payment_verify_enabled:
      body.auto_payment_verify_enabled !== undefined
        ? Boolean(body.auto_payment_verify_enabled)
        : (current.auto_payment_verify_enabled ?? true),
    auto_tracking_reply_enabled:
      body.auto_tracking_reply_enabled !== undefined
        ? Boolean(body.auto_tracking_reply_enabled)
        : (current.auto_tracking_reply_enabled ?? true),
    paused_customers: Array.isArray(body.paused_customers)
      ? body.paused_customers
      : (current.paused_customers || []),
    blocked_customers: Array.isArray(body.blocked_customers)
      ? body.blocked_customers
      : (current.blocked_customers || []),
    daily_ad_spend_bdt:
      typeof body.daily_ad_spend_bdt === 'number'
        ? body.daily_ad_spend_bdt
        : (current.daily_ad_spend_bdt ?? 500),
    avg_product_cost_percent:
      typeof body.avg_product_cost_percent === 'number'
        ? body.avg_product_cost_percent
        : (current.avg_product_cost_percent ?? 55),
    return_courier_loss_per_order:
      typeof body.return_courier_loss_per_order === 'number'
        ? body.return_courier_loss_per_order
        : (current.return_courier_loss_per_order ?? 130)
  };

  db.updateProfile(user.id, { automation_settings: updated });

  // Also sync channel-level toggles for convenience
  const userChannels = db.getChannels(user.id);
  for (const ch of userChannels) {
    db.updateChannel(ch.id, {
      auto_comment_reply: updated.auto_comment_reply_enabled,
      auto_followup_enabled: updated.auto_followup_enabled
    });
  }

  return res.json({ success: true, settings: updated });
});

// POST /api/channels/test-comment-reply - Simulate a customer comment & trigger Auto Comment + Inbox DM
channelsRouter.post('/test-comment-reply', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const {
    platform = 'messenger',
    customerName = 'Tanvir Ahmed (Facebook Comment)',
    commentText = 'What is the price of the Premium Panjabi? Can I see a photo?'
  } = req.body || {};

  const existingChannel = db
    .getChannels(user.id)
    .find((c) => c.platform === platform && c.is_active);

  const outcome = await handleInboundCommentWebhook({
    platform:
      platform === 'instagram'
        ? 'instagram'
        : platform === 'tiktok'
        ? 'tiktok'
        : 'messenger',
    identifier: existingChannel?.identifier || `sim_${platform}_${user.id}`,
    commentId: `test_cm_${Date.now()}`,
    customerId: `commenter_${Date.now()}`,
    customerName,
    commentText,
    userId: user.id
  });

  return res.json({
    success: outcome.handled,
    ...outcome
  });
});

// PUT /api/channels/:id - Update channel settings and credentials
channelsRouter.put('/:id', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const channel = db.getChannelById(req.params.id);
  if (!channel || channel.user_id !== user.id) {
    return res.status(404).json({ error: 'Channel not found' });
  }

  const { name, identifier, access_token, app_secret, is_active } = req.body;
  const updated = db.updateChannel(req.params.id, {
    ...(name !== undefined && { name: String(name).trim() }),
    ...(identifier !== undefined && { identifier: String(identifier).trim() }),
    ...(access_token !== undefined && access_token.trim() && { access_token: String(access_token).trim() }),
    ...(app_secret !== undefined && { app_secret: app_secret ? String(app_secret).trim() : undefined }),
    ...(is_active !== undefined && { is_active: Boolean(is_active) }),
    status: is_active === false ? 'not_connected' : 'connected',
    error_message: undefined,
    updated_at: new Date().toISOString()
  });

  const { access_token: _token, app_secret: _sec, ...sanitized } = (updated || {}) as any;
  return res.json(sanitized);
});

// PATCH /api/channels/:id/toggle
channelsRouter.patch('/:id/toggle', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const channel = db.getChannelById(req.params.id);
  if (!channel || channel.user_id !== user.id) {
    return res.status(404).json({ error: 'Channel not found' });
  }

  if (!channel.is_active) {
    if (!checkSubscriptionActive(user.id)) {
      return res.status(403).json({
        error: 'Active subscription required. Please renew your plan to activate this channel.'
      });
    }
    if (['messenger', 'instagram', 'whatsapp', 'tiktok'].includes(channel.platform) && channel.identifier !== 'website_widget') {
      const limitCheck = checkChannelLimitForPlan(user.id, channel.platform as 'messenger' | 'instagram' | 'whatsapp' | 'tiktok');
      if (!limitCheck.allowed) {
        return res.status(403).json({ error: limitCheck.error });
      }
    }
  }

  const updated = db.updateChannel(req.params.id, {
    is_active: !channel.is_active,
    status: !channel.is_active ? 'connected' : 'not_connected'
  });

  const { access_token, app_secret, ...sanitized } = (updated || {}) as any;
  return res.json(sanitized);
});

// PATCH /api/channels/:id/automation - Toggle auto_comment_reply and auto_followup_enabled
channelsRouter.patch('/:id/automation', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const channel = db.getChannelById(req.params.id);
  if (!channel || channel.user_id !== user.id) {
    return res.status(404).json({ error: 'Channel not found' });
  }

  const { auto_comment_reply, auto_followup_enabled } = req.body || {};
  const updated = db.updateChannel(req.params.id, {
    ...(auto_comment_reply !== undefined && { auto_comment_reply: Boolean(auto_comment_reply) }),
    ...(auto_followup_enabled !== undefined && { auto_followup_enabled: Boolean(auto_followup_enabled) }),
    updated_at: new Date().toISOString()
  });

  const { access_token, app_secret, ...sanitized } = (updated || {}) as any;
  return res.json(sanitized);
});

// DELETE /api/channels/:id
channelsRouter.delete('/:id', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const outcome = await metaOAuthService.disconnectChannel(req.params.id, user.id);
  if (!outcome.success) {
    return res.status(404).json({ error: outcome.message });
  }

  return res.json(outcome);
});
