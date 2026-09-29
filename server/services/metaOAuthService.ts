import { Request } from 'express';
import crypto from 'crypto';
import { db, Channel, FacebookPage, InstagramAccount, WhatsAppBusinessAccount, WhatsAppPhoneNumber } from '../db/database';

export interface MetaConfig {
  configured: boolean;
  appId: string;
  redirectUri: string;
  webhookVerifyTokenConfigured: boolean;
  webhookUrlWhatsApp: string;
  webhookUrlMessenger: string;
  webhookUrlInstagram: string;
}

export interface AuthorizedPageItem {
  id: string; // page_id
  name: string;
  category?: string;
  access_token: string;
  token_preview?: string;
  tasks?: string[];
  picture_url?: string;
  instagram_business_account?: {
    id: string;
    username: string;
    name?: string;
    profile_picture_url?: string;
  };
}

export interface AuthorizedWhatsAppItem {
  id: string; // phone_number_id
  waba_id: string;
  waba_name: string;
  display_phone_number: string;
  verified_name?: string;
  quality_rating?: string;
  access_token: string;
  token_preview?: string;
}

// In-memory cache for temporary OAuth session assets (held during asset selection step)
const pendingAuthCache = new Map<
  string,
  {
    userId: string;
    platform: 'messenger' | 'instagram' | 'whatsapp';
    pages: AuthorizedPageItem[];
    whatsappNumbers?: AuthorizedWhatsAppItem[];
    wabaInfo?: any;
    expiresAt: number;
  }
>();

export class MetaOAuthService {
  private customAppId: string = '';
  private customAppSecret: string = '';

  public setCustomConfig(appId: string, appSecret: string) {
    this.customAppId = appId.trim();
    this.customAppSecret = appSecret.trim();
    db.updateSettings({
      meta_app_id: this.customAppId,
      meta_app_secret: this.customAppSecret
    });
  }

  private getAppId(): string {
    const settings = db.getSettings();
    return this.customAppId || settings?.meta_app_id || process.env.META_APP_ID || process.env.VITE_META_APP_ID || '';
  }

  private getAppSecret(): string {
    const settings = db.getSettings();
    return this.customAppSecret || settings?.meta_app_secret || process.env.META_APP_SECRET || '';
  }

  private getConfigId(): string {
    const settings = db.getSettings();
    return (settings?.meta_config_id || process.env.META_CONFIG_ID || '').trim();
  }

  private getVerifyToken(): string {
    const settings = db.getSettings();
    return (
      settings?.meta_verify_token ||
      process.env.META_WEBHOOK_VERIFY_TOKEN ||
      process.env.WHATSAPP_VERIFY_TOKEN ||
      process.env.MESSENGER_VERIFY_TOKEN ||
      'one_agent_bd_verify_token'
    );
  }

  public getEffectiveBaseUrl(req: Request): string {
    const rawHost = ((req.headers['x-forwarded-host'] as string) || req.headers.host || '').split(',')[0].trim();
    const rawProto = ((req.headers['x-forwarded-proto'] as string) || req.protocol || 'https').split(',')[0].trim();
    if (rawHost && !rawHost.includes('localhost') && !rawHost.includes('.vercel.app')) {
      return `${rawProto}://${rawHost}`;
    }
    if (process.env.APP_URL) {
      return process.env.APP_URL.replace(/\/+$/, '');
    }
    if (rawHost) {
      return `${rawProto}://${rawHost}`;
    }
    return 'https://www.oneagentbd.online';
  }

  public getRedirectUri(req: Request): string {
    const rawHost = ((req.headers['x-forwarded-host'] as string) || req.headers.host || '').split(',')[0].trim();
    if (rawHost && !rawHost.includes('localhost') && !rawHost.includes('.vercel.app')) {
      const rawProto = ((req.headers['x-forwarded-proto'] as string) || req.protocol || 'https').split(',')[0].trim();
      return `${rawProto}://${rawHost}/api/channels/meta/callback`;
    }
    if (process.env.META_REDIRECT_URI) {
      return process.env.META_REDIRECT_URI;
    }
    const baseUrl = this.getEffectiveBaseUrl(req);
    return `${baseUrl}/api/channels/meta/callback`;
  }

  public getConfig(req: Request): MetaConfig {
    const appId = this.getAppId();
    const appSecret = this.getAppSecret();
    const baseUrl = this.getEffectiveBaseUrl(req);
    const redirectUri = this.getRedirectUri(req);

    return {
      configured: Boolean(appId && appSecret),
      appId,
      redirectUri,
      webhookVerifyTokenConfigured: Boolean(this.getVerifyToken()),
      webhookUrlWhatsApp: `${baseUrl}/api/webhooks/whatsapp`,
      webhookUrlMessenger: `${baseUrl}/api/webhooks/messenger`,
      webhookUrlInstagram: `${baseUrl}/api/webhooks/instagram`
    };
  }

  /**
   * Generates official Meta OAuth Authorization URL
   */
  public generateAuthUrl(
    userId: string,
    platform: 'messenger' | 'instagram' | 'whatsapp',
    req: Request,
    onboarding: boolean = false
  ): { authUrl: string; state: string; isConfigured: boolean } {
    const appId = this.getAppId();
    const appSecret = this.getAppSecret();
    const redirectUri = this.getRedirectUri(req);

    const nonce = crypto.randomBytes(16).toString('hex');
    const statePayload = JSON.stringify({ userId, platform, nonce, time: Date.now() });
    const state = Buffer.from(statePayload).toString('base64url');

    if (!appId || !appSecret) {
      // Return simulated link indicator if credentials are not configured yet
      return {
        authUrl: '',
        state,
        isConfigured: false
      };
    }

    let scopes = 'pages_manage_metadata,pages_read_engagement,pages_manage_engagement,pages_messaging,business_management,pages_show_list';
    if (platform === 'instagram') {
      scopes = 'pages_manage_metadata,pages_read_engagement,pages_manage_engagement,pages_messaging,business_management,pages_show_list,instagram_basic,instagram_manage_messages,instagram_manage_comments';
    } else if (platform === 'whatsapp') {
      scopes = 'pages_manage_metadata,pages_read_engagement,pages_messaging,business_management,whatsapp_business_management,whatsapp_business_messaging';
    }

    const configId = this.getConfigId();
    const configParam =
      platform === 'whatsapp' && onboarding && configId
        ? `&config_id=${encodeURIComponent(configId)}`
        : '';

    // Note: Do NOT force extras={"feature":"whatsapp_embedded_signup"} because Meta blocks non-BSP/TP apps with
    // "Embedded signup is only available for BSPs or TPs". Using auth_type=rerequest works for all Meta apps!
    const extrasParam = onboarding ? `${configParam}&auth_type=rerequest` : '';

    const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${encodeURIComponent(
      appId
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(
      scopes
    )}&response_type=code&state=${encodeURIComponent(state)}${extrasParam}`;

    return {
      authUrl,
      state,
      isConfigured: true
    };
  }

  /**
   * Handles official Meta OAuth Callback (code exchange, token upgrade, page retrieval)
   */
  public async handleCallback(
    code: string,
    stateString: string,
    req: Request
  ): Promise<{
    success: boolean;
    userId: string;
    platform: 'messenger' | 'instagram' | 'whatsapp';
    pages: AuthorizedPageItem[];
    error?: string;
  }> {
    const appId = this.getAppId();
    const appSecret = this.getAppSecret();
    const redirectUri = this.getRedirectUri(req);

    let stateData: { userId: string; platform: 'messenger' | 'instagram' | 'whatsapp' };
    try {
      stateData = JSON.parse(Buffer.from(stateString, 'base64url').toString('utf-8'));
    } catch (e) {
      return { success: false, userId: '', platform: 'messenger', pages: [], error: 'Invalid OAuth state parameter.' };
    }

    const { userId, platform } = stateData;

    try {
      // 1. Exchange short-lived authorization code for user access token
      const tokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${encodeURIComponent(
        appId
      )}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${encodeURIComponent(
        appSecret
      )}&code=${encodeURIComponent(code)}`;

      const tokenRes = await fetch(tokenUrl);
      const tokenJson = (await tokenRes.json()) as any;

      if (!tokenRes.ok || tokenJson.error) {
        const msg = tokenJson.error?.message || 'Failed to exchange Meta authorization code.';
        return { success: false, userId, platform, pages: [], error: msg };
      }

      const shortLivedToken = tokenJson.access_token;

      // 2. Exchange for long-lived user token (60 days)
      const longLivedUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(
        appId
      )}&client_secret=${encodeURIComponent(appSecret)}&fb_exchange_token=${encodeURIComponent(shortLivedToken)}`;

      const longLivedRes = await fetch(longLivedUrl);
      const longLivedJson = (await longLivedRes.json()) as any;
      const userToken = longLivedJson.access_token || shortLivedToken;

      // 3. Fetch user's managed Facebook Pages and linked Instagram accounts
      const { pages, whatsappNumbers } = await this.discoverAssetsFromToken(userToken);

      // Cache pending authorization for 15 minutes for asset selection
      pendingAuthCache.set(userId, {
        userId,
        platform,
        pages,
        whatsappNumbers,
        expiresAt: Date.now() + 15 * 60 * 1000
      });

      db.logAudit({
        id: 'aud_' + Date.now(),
        user_id: userId,
        action: 'meta_oauth_completed',
        resource: 'channel',
        details: `Authorized ${pages.length} Pages and ${whatsappNumbers.length} WhatsApp numbers via Meta OAuth for platform ${platform}`,
        created_at: new Date().toISOString()
      });

      return {
        success: true,
        userId,
        platform,
        pages
      };
    } catch (err: any) {
      return {
        success: false,
        userId,
        platform,
        pages: [],
        error: err?.message || 'An unexpected error occurred during Meta authorization.'
      };
    }
  }

  /**
   * Discovers Facebook Pages (with their permanent Page Access Tokens), linked Instagram Business Accounts,
   * and WhatsApp Business Phone Numbers from a User Access Token or direct Page Access Token.
   */
  public async discoverAssetsFromToken(rawToken: string): Promise<{
    pages: AuthorizedPageItem[];
    whatsappNumbers: AuthorizedWhatsAppItem[];
    error?: string;
  }> {
    const cleanToken = rawToken.trim();
    const appId = this.getAppId();
    const appSecret = this.getAppSecret();

    let effectiveUserToken = cleanToken;

    // Step 1: Attempt to upgrade to 60-day long-lived token if App ID & Secret are configured
    if (appId && appSecret) {
      try {
        const longLivedUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(
          appId
        )}&client_secret=${encodeURIComponent(appSecret)}&fb_exchange_token=${encodeURIComponent(cleanToken)}`;
        const llRes = await fetch(longLivedUrl);
        const llJson = (await llRes.json()) as any;
        if (llRes.ok && llJson.access_token) {
          effectiveUserToken = llJson.access_token;
        }
      } catch (_e) {
        // Ignore if token is already a Page token or cannot be exchanged
      }
    }

    const pages: AuthorizedPageItem[] = [];
    const whatsappNumbers: AuthorizedWhatsAppItem[] = [];

    // Step 2: Query /me/accounts to capture Page Access Tokens & linked Instagram Business Accounts
    try {
      const accountsUrl = `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,category,access_token,tasks,picture{url},instagram_business_account{id,username,name,profile_picture_url}&limit=100&access_token=${encodeURIComponent(
        effectiveUserToken
      )}`;
      const accountsRes = await fetch(accountsUrl);
      const accountsJson = (await accountsRes.json()) as any;

      if (accountsRes.ok && Array.isArray(accountsJson.data) && accountsJson.data.length > 0) {
        for (const p of accountsJson.data) {
          const pageToken = p.access_token || effectiveUserToken;
          pages.push({
            id: String(p.id),
            name: String(p.name || 'Facebook Page'),
            category: p.category || 'Business Page',
            access_token: pageToken,
            token_preview: pageToken ? `EAA••••${pageToken.slice(-6)}` : undefined,
            tasks: p.tasks,
            picture_url: p.picture?.data?.url,
            instagram_business_account: p.instagram_business_account
          });
        }
      } else {
        // Step 2B: Fallback — Check if the provided token is already a direct Page Access Token!
        const meUrl = `https://graph.facebook.com/v21.0/me?fields=id,name,category,picture{url},instagram_business_account{id,username,name,profile_picture_url}&access_token=${encodeURIComponent(
          effectiveUserToken
        )}`;
        const meRes = await fetch(meUrl);
        const meJson = (await meRes.json()) as any;

        if (meRes.ok && meJson.id && !meJson.error) {
          pages.push({
            id: String(meJson.id),
            name: String(meJson.name || 'Facebook Page'),
            category: meJson.category || 'Direct Page Token',
            access_token: effectiveUserToken,
            token_preview: `EAA••••${effectiveUserToken.slice(-6)}`,
            picture_url: meJson.picture?.data?.url,
            instagram_business_account: meJson.instagram_business_account
          });
        } else if (accountsJson?.error || meJson?.error) {
          return {
            pages: [],
            whatsappNumbers: [],
            error: accountsJson?.error?.message || meJson?.error?.message || 'Invalid Meta Access Token.'
          };
        }
      }
    } catch (err: any) {
      return {
        pages: [],
        whatsappNumbers: [],
        error: err?.message || 'Failed to query Meta Graph API.'
      };
    }

    // Step 3: Attempt to discover WhatsApp Business Accounts (WABA) and Phone Number IDs
    try {
      const bizUrl = `https://graph.facebook.com/v21.0/me/businesses?fields=id,name,owned_whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number,verified_name,quality_rating}}&access_token=${encodeURIComponent(
        effectiveUserToken
      )}`;
      const bizRes = await fetch(bizUrl);
      const bizJson = (await bizRes.json()) as any;

      if (bizRes.ok && Array.isArray(bizJson.data)) {
        for (const biz of bizJson.data) {
          const wabas = biz.owned_whatsapp_business_accounts?.data || [];
          for (const waba of wabas) {
            const phones = waba.phone_numbers?.data || [];
            for (const ph of phones) {
              whatsappNumbers.push({
                id: String(ph.id),
                waba_id: String(waba.id),
                waba_name: String(waba.name || biz.name || 'WhatsApp Business'),
                display_phone_number: String(ph.display_phone_number || ph.id),
                verified_name: ph.verified_name || waba.name,
                quality_rating: ph.quality_rating || 'GREEN',
                access_token: effectiveUserToken,
                token_preview: `EAA••••${effectiveUserToken.slice(-6)}`
              });
            }
          }
        }
      }
    } catch (_waErr) {
      // Non-fatal if WhatsApp scopes aren't granted on this token
    }

    return { pages, whatsappNumbers };
  }

  /**
   * Exchanges a frontend-captured Meta User/Page Access Token (from FB.login SDK or Graph API)
   * and caches all discovered Page Access Tokens for 1-click connection.
   */
  public async exchangeFrontendToken(
    userId: string,
    accessToken: string,
    platform: 'messenger' | 'instagram' | 'whatsapp'
  ): Promise<{
    success: boolean;
    platform: 'messenger' | 'instagram' | 'whatsapp';
    pages: AuthorizedPageItem[];
    whatsappNumbers: AuthorizedWhatsAppItem[];
    error?: string;
  }> {
    if (!accessToken || !accessToken.trim()) {
      return {
        success: false,
        platform,
        pages: [],
        whatsappNumbers: [],
        error: 'Access Token is required.'
      };
    }

    const { pages, whatsappNumbers, error } = await this.discoverAssetsFromToken(accessToken);

    if (error && pages.length === 0 && whatsappNumbers.length === 0) {
      return {
        success: false,
        platform,
        pages: [],
        whatsappNumbers: [],
        error
      };
    }

    pendingAuthCache.set(userId, {
      userId,
      platform,
      pages,
      whatsappNumbers,
      expiresAt: Date.now() + 15 * 60 * 1000
    });

    db.logAudit({
      id: 'aud_' + Date.now(),
      user_id: userId,
      action: 'meta_token_exchanged',
      resource: 'channel',
      details: `Captured ${pages.length} Page Access Tokens and ${whatsappNumbers.length} WhatsApp numbers via Meta Login flow`,
      created_at: new Date().toISOString()
    });

    return {
      success: true,
      platform,
      pages,
      whatsappNumbers
    };
  }

  /**
   * Retrieves currently authorized assets awaiting selection for the logged-in user
   */
  public getPendingAssets(userId: string): {
    platform: 'messenger' | 'instagram' | 'whatsapp';
    pages: AuthorizedPageItem[];
    whatsappNumbers: AuthorizedWhatsAppItem[];
  } | null {
    const cached = pendingAuthCache.get(userId);
    if (!cached || cached.expiresAt < Date.now()) {
      pendingAuthCache.delete(userId);
      return null;
    }
    return {
      platform: cached.platform,
      pages: cached.pages,
      whatsappNumbers: cached.whatsappNumbers || []
    };
  }

  /**
   * Connect a selected Facebook Page to the tenant
   */
  public async connectPage(
    userId: string,
    pageId: string,
    customPageData?: Partial<AuthorizedPageItem>
  ): Promise<{ success: boolean; channel?: Channel; error?: string }> {
    const cached = pendingAuthCache.get(userId);
    let targetPage = cached?.pages.find((p) => p.id === pageId);

    if (!targetPage && customPageData) {
      targetPage = {
        id: pageId,
        name: customPageData.name || 'Facebook Page',
        access_token: customPageData.access_token || '',
        category: customPageData.category
      };
    }

    if (!targetPage) {
      return {
        success: false,
        error: 'The requested Facebook Page was not found in your recent Meta authorization session. Please reconnect.'
      };
    }

    try {
      // 1. Subscribe Page to Webhook events via Meta Graph API
      if (targetPage.access_token && !targetPage.access_token.startsWith('sim_')) {
        try {
          const subUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(
            targetPage.id
          )}/subscribed_apps?subscribed_fields=messages,messaging_postbacks,message_deliveries,feed&access_token=${encodeURIComponent(
            targetPage.access_token
          )}`;
          const subRes = await fetch(subUrl, { method: 'POST' });
          const subJson = (await subRes.json()) as any;
          if (!subRes.ok) {
            console.warn('[MetaOAuth] Webhook subscription warning:', subJson);
          }
        } catch (subErr) {
          console.warn('[MetaOAuth] Failed to auto-subscribe webhooks with Meta Graph API:', subErr);
        }
      }

      // 2. Save Facebook Page asset record
      const fbPageRecord: FacebookPage = {
        id: targetPage.id,
        user_id: userId,
        name: targetPage.name,
        category: targetPage.category,
        access_token: targetPage.access_token,
        is_webhook_subscribed: true,
        status: 'connected',
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.saveFacebookPage(fbPageRecord);

      // 3. Upsert tenant channel
      const existingChannels = db.getChannels(userId);
      let channel = existingChannels.find((c) => c.platform === 'messenger' && c.identifier === targetPage!.id);

      if (channel) {
        channel = db.updateChannel(channel.id, {
          name: targetPage.name,
          identifier: targetPage.id,
          access_token: targetPage.access_token,
          is_active: true,
          auto_comment_reply: channel.auto_comment_reply ?? true,
          auto_followup_enabled: channel.auto_followup_enabled ?? true,
          status: 'connected',
          meta_asset_name: targetPage.name,
          meta_asset_id: targetPage.id,
          error_message: undefined
        });
      } else {
        channel = db.createChannel({
          id: 'chn_fb_' + Date.now(),
          user_id: userId,
          platform: 'messenger',
          name: targetPage.name,
          identifier: targetPage.id,
          access_token: targetPage.access_token,
          is_active: true,
          auto_comment_reply: true,
          auto_followup_enabled: true,
          status: 'connected',
          meta_asset_name: targetPage.name,
          meta_asset_id: targetPage.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      db.logAudit({
        id: 'aud_' + Date.now(),
        user_id: userId,
        action: 'channel_connected',
        resource: 'channel',
        resource_id: channel?.id,
        details: `Connected Facebook Page "${targetPage.name}" (${targetPage.id}) to One Agent BD`,
        created_at: new Date().toISOString()
      });

      return { success: true, channel };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to complete Facebook Page connection.' };
    }
  }

  /**
   * Connect a selected Instagram Account to the tenant
   */
  public async connectInstagram(
    userId: string,
    igAccountId: string,
    customData?: { username: string; pageId?: string; accessToken?: string }
  ): Promise<{ success: boolean; channel?: Channel; error?: string }> {
    const cached = pendingAuthCache.get(userId);
    let targetPage = cached?.pages.find(
      (p) =>
        p.instagram_business_account?.id === igAccountId ||
        (customData?.pageId && p.id === customData.pageId) ||
        p.id === igAccountId
    );
    let username = targetPage?.instagram_business_account?.username || customData?.username || 'Instagram Professional';
    let accessToken = targetPage?.access_token || customData?.accessToken || '';
    let pageId = targetPage?.id || customData?.pageId || '';

    if (!targetPage && !customData) {
      return {
        success: false,
        error: 'Instagram account not found in your recent Meta authorization. Please reconnect.'
      };
    }

    try {
      // 1. Subscribe to webhooks if real token
      if (accessToken && pageId && !accessToken.startsWith('sim_')) {
        try {
          const subUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(
            pageId
          )}/subscribed_apps?subscribed_fields=messages,messaging_postbacks,feed&access_token=${encodeURIComponent(
            accessToken
          )}`;
          await fetch(subUrl, { method: 'POST' });
        } catch (subErr) {
          console.warn('[MetaOAuth] Webhook subscription warning for Instagram:', subErr);
        }
      }

      // 2. Save Instagram Account asset record
      const igRecord: InstagramAccount = {
        id: igAccountId,
        user_id: userId,
        page_id: pageId,
        username,
        name: username,
        access_token: accessToken,
        is_webhook_subscribed: true,
        status: 'connected',
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.saveInstagramAccount(igRecord);

      // 3. Upsert channel
      const existingChannels = db.getChannels(userId);
      let channel = existingChannels.find((c) => c.platform === 'instagram' && c.identifier === igAccountId);

      if (channel) {
        channel = db.updateChannel(channel.id, {
          name: `@${username.replace(/^@/, '')}`,
          identifier: igAccountId,
          access_token: accessToken,
          is_active: true,
          auto_comment_reply: channel.auto_comment_reply ?? true,
          auto_followup_enabled: channel.auto_followup_enabled ?? true,
          status: 'connected',
          meta_asset_name: `@${username.replace(/^@/, '')}`,
          meta_asset_id: igAccountId,
          error_message: undefined
        });
      } else {
        channel = db.createChannel({
          id: 'chn_ig_' + Date.now(),
          user_id: userId,
          platform: 'instagram',
          name: `@${username.replace(/^@/, '')}`,
          identifier: igAccountId,
          access_token: accessToken,
          is_active: true,
          auto_comment_reply: true,
          auto_followup_enabled: true,
          status: 'connected',
          meta_asset_name: `@${username.replace(/^@/, '')}`,
          meta_asset_id: igAccountId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      db.logAudit({
        id: 'aud_' + Date.now(),
        user_id: userId,
        action: 'channel_connected',
        resource: 'channel',
        resource_id: channel?.id,
        details: `Connected Instagram Professional Account "@${username}" (${igAccountId})`,
        created_at: new Date().toISOString()
      });

      return { success: true, channel };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to connect Instagram account.' };
    }
  }

  /**
   * Connect WhatsApp Business via Official Onboarding / Embedded Signup
   */
  public async connectWhatsAppOnboarding(
    userId: string,
    data: {
      wabaId: string;
      phoneNumberId: string;
      displayPhoneNumber: string;
      verifiedName?: string;
      accessToken: string;
    }
  ): Promise<{ success: boolean; channel?: Channel; error?: string }> {
    const { wabaId, phoneNumberId, displayPhoneNumber, verifiedName, accessToken } = data;

    if (!phoneNumberId || !accessToken) {
      return { success: false, error: 'Phone Number ID and System Access Token are required.' };
    }

    try {
      // 1. Subscribe WABA to webhooks if not simulated
      if (wabaId && accessToken && !accessToken.startsWith('sim_')) {
        try {
          const subUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(
            wabaId
          )}/subscribed_apps?access_token=${encodeURIComponent(accessToken)}`;
          await fetch(subUrl, { method: 'POST' });
        } catch (subErr) {
          console.warn('[MetaOAuth] WhatsApp WABA webhook subscription warning:', subErr);
        }
      }

      // 2. Save WABA and Phone records
      if (wabaId) {
        const wabaRecord: WhatsAppBusinessAccount = {
          id: wabaId,
          user_id: userId,
          name: verifiedName || `WABA ${wabaId}`,
          status: 'connected',
          connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        db.saveWhatsAppAccount(wabaRecord);
      }

      const phoneRecord: WhatsAppPhoneNumber = {
        id: phoneNumberId,
        user_id: userId,
        waba_id: wabaId || '',
        display_phone_number: displayPhoneNumber,
        verified_name: verifiedName,
        quality_rating: 'GREEN',
        code_verification_status: 'VERIFIED',
        status: 'connected',
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.saveWhatsAppPhoneNumber(phoneRecord);

      // 3. Upsert channel
      const existingChannels = db.getChannels(userId);
      let channel = existingChannels.find((c) => c.platform === 'whatsapp' && c.identifier === phoneNumberId);

      const channelName = verifiedName ? `${verifiedName} (${displayPhoneNumber})` : `WhatsApp (${displayPhoneNumber})`;

      if (channel) {
        channel = db.updateChannel(channel.id, {
          name: channelName,
          identifier: phoneNumberId,
          access_token: accessToken,
          is_active: true,
          status: 'connected',
          meta_asset_name: channelName,
          meta_asset_id: phoneNumberId,
          meta_business_id: wabaId,
          error_message: undefined
        });
      } else {
        channel = db.createChannel({
          id: 'chn_wa_' + Date.now(),
          user_id: userId,
          platform: 'whatsapp',
          name: channelName,
          identifier: phoneNumberId,
          access_token: accessToken,
          is_active: true,
          status: 'connected',
          meta_asset_name: channelName,
          meta_asset_id: phoneNumberId,
          meta_business_id: wabaId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      db.logAudit({
        id: 'aud_' + Date.now(),
        user_id: userId,
        action: 'channel_connected',
        resource: 'channel',
        resource_id: channel?.id,
        details: `Connected WhatsApp Business Number "${displayPhoneNumber}" (${phoneNumberId})`,
        created_at: new Date().toISOString()
      });

      return { success: true, channel };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to complete WhatsApp onboarding.' };
    }
  }

  /**
   * Verifies health and validity of an existing connected channel with Meta Graph API
   */
  public async testChannelConnection(channelId: string, userId: string): Promise<{
    valid: boolean;
    status: 'connected' | 'error';
    message: string;
    details?: any;
  }> {
    const channel = db.getChannelById(channelId);
    if (!channel || channel.user_id !== userId) {
      return { valid: false, status: 'error', message: 'Channel not found or unauthorized.' };
    }

    if (!channel.access_token) {
      db.updateChannel(channel.id, { status: 'error', error_message: 'Access token is missing.' });
      return { valid: false, status: 'error', message: 'Channel has no access token configured.' };
    }

    // Simulation / Sandbox token check
    if (channel.access_token.startsWith('sim_')) {
      db.updateChannel(channel.id, { status: 'connected', error_message: undefined });
      return {
        valid: true,
        status: 'connected',
        message: 'Sandbox channel active. Webhook simulation is operational.'
      };
    }

    try {
      let testEndpoint = '';
      if (channel.platform === 'whatsapp') {
        testEndpoint = `https://graph.facebook.com/v21.0/${encodeURIComponent(
          channel.identifier
        )}?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status&access_token=${encodeURIComponent(
          channel.access_token
        )}`;
      } else {
        testEndpoint = `https://graph.facebook.com/v21.0/${encodeURIComponent(
          channel.identifier
        )}?fields=id,name&access_token=${encodeURIComponent(channel.access_token)}`;
      }

      const res = await fetch(testEndpoint);
      const json = (await res.json()) as any;

      if (!res.ok || json.error) {
        const errorMsg = json.error?.message || 'Meta API returned an error response.';
        db.updateChannel(channel.id, { status: 'error', error_message: errorMsg });
        return {
          valid: false,
          status: 'error',
          message: errorMsg,
          details: json.error
        };
      }

      db.updateChannel(channel.id, { status: 'connected', error_message: undefined });
      return {
        valid: true,
        status: 'connected',
        message: `Connection healthy! Meta confirmed asset "${json.name || json.verified_name || json.display_phone_number || channel.identifier}" is active.`,
        details: json
      };
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to contact Meta Graph API.';
      db.updateChannel(channel.id, { status: 'error', error_message: errorMsg });
      return { valid: false, status: 'error', message: errorMsg };
    }
  }

  /**
   * Disconnects a channel safely
   */
  public async disconnectChannel(channelId: string, userId: string): Promise<{ success: boolean; message: string }> {
    const channel = db.getChannelById(channelId);
    if (!channel || channel.user_id !== userId) {
      return { success: false, message: 'Channel not found or unauthorized.' };
    }

    // Try to unsubscribe webhook if real token
    if (channel.access_token && !channel.access_token.startsWith('sim_')) {
      try {
        const unsubUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(
          channel.identifier
        )}/subscribed_apps?access_token=${encodeURIComponent(channel.access_token)}`;
        await fetch(unsubUrl, { method: 'DELETE' });
      } catch (err) {
        console.warn('[MetaOAuth] Error unsubscribing app on disconnect:', err);
      }
    }

    db.deleteChannel(channel.id, userId);

    db.logAudit({
      id: 'aud_' + Date.now(),
      user_id: userId,
      action: 'channel_disconnected',
      resource: 'channel',
      resource_id: channel.id,
      details: `Disconnected ${channel.platform} channel "${channel.name}" (${channel.identifier})`,
      created_at: new Date().toISOString()
    });

    return { success: true, message: `Channel "${channel.name}" has been disconnected.` };
  }

  /**
   * OAuth validation - No mock/demo pages in production
   */
  public simulateOAuth(
    _userId: string,
    _platform: 'messenger' | 'instagram' | 'whatsapp'
  ): {
    success: boolean;
    pages: AuthorizedPageItem[];
    error?: string;
  } {
    return {
      success: false,
      pages: [],
      error: 'Meta App ID and Secret must be configured to connect Facebook/Instagram pages.'
    };
  }
}

export const metaOAuthService = new MetaOAuthService();
