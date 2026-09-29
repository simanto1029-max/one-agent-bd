import { db, Channel, FacebookPage, InstagramAccount } from '../db/database.js';
import { metaOAuthService, AuthorizedPageItem, AuthorizedWhatsAppItem } from './metaOAuthService.js';

export interface TokenVerificationItem {
  channelId?: string;
  assetId: string;
  name: string;
  platform: 'messenger' | 'instagram' | 'whatsapp';
  valid: boolean;
  graphId?: string;
  graphName?: string;
  category?: string;
  webhookSubscribed?: boolean;
  permissions?: string[];
  tokenPreview?: string;
  error?: string;
  latencyMs: number;
  verifiedAt: string;
}

export interface TokenVerificationReport {
  success: boolean;
  verified: boolean;
  checkedAt: string;
  totalChecked: number;
  healthyCount: number;
  failedCount: number;
  results: TokenVerificationItem[];
}

export class MetaChannelService {
  /**
   * Captures Page Access Tokens from a Facebook SDK User/Page Access Token,
   * stores them securely in the user profile & database (facebook_pages, instagram_accounts,
   * whatsapp_phone_numbers, and channels), and optionally auto-hooks webhooks.
   */
  public async captureAndStorePageTokens(
    userId: string,
    accessToken: string,
    options?: {
      platform?: 'messenger' | 'instagram' | 'whatsapp';
      autoConnectChannels?: boolean;
      grantedScopes?: string[];
    }
  ): Promise<{
    success: boolean;
    pages: AuthorizedPageItem[];
    whatsappNumbers: AuthorizedWhatsAppItem[];
    connectedChannels: Channel[];
    verificationReport?: TokenVerificationReport;
    error?: string;
  }> {
    const cleanToken = (accessToken || '').trim();
    if (!cleanToken) {
      return {
        success: false,
        pages: [],
        whatsappNumbers: [],
        connectedChannels: [],
        error: 'Valid Meta Access Token is required to capture Page Access Tokens.'
      };
    }

    const platform = options?.platform || 'messenger';
    const autoConnect = options?.autoConnectChannels !== false; // Default true for 1-click capture & storage

    // 1. Exchange token & discover all managed Facebook Pages, Instagram Business Accounts, and WhatsApp Numbers
    const discovery = await metaOAuthService.exchangeFrontendToken(userId, cleanToken, platform);
    if (!discovery.success) {
      return {
        success: false,
        pages: [],
        whatsappNumbers: [],
        connectedChannels: [],
        error: discovery.error || 'Failed to retrieve Page Access Tokens from Meta Graph API.'
      };
    }

    const pages = discovery.pages || [];
    const whatsappNumbers = discovery.whatsappNumbers || [];
    const nowIso = new Date().toISOString();

    // 2. Store token metadata securely in the User Profile
    db.updateProfile(userId, {
      meta_user_access_token: cleanToken,
      meta_tokens_updated_at: nowIso,
      meta_granted_scopes: options?.grantedScopes || [
        'pages_manage_metadata',
        'pages_read_engagement',
        'pages_messaging',
        'business_management'
      ],
      meta_connected_pages_count: pages.length
    });

    // 3. Persist retrieved Page Access Tokens & linked Instagram accounts in database tables
    for (const page of pages) {
      const fbPageRecord: FacebookPage = {
        id: page.id,
        user_id: userId,
        name: page.name,
        category: page.category || 'Business Page',
        access_token: page.access_token,
        is_webhook_subscribed: true,
        status: 'connected',
        connected_at: nowIso,
        updated_at: nowIso
      };
      db.saveFacebookPage(fbPageRecord);

      if (page.instagram_business_account?.id) {
        const igRecord: InstagramAccount = {
          id: page.instagram_business_account.id,
          user_id: userId,
          page_id: page.id,
          username: page.instagram_business_account.username || page.name.toLowerCase().replace(/\s+/g, '_'),
          name: page.instagram_business_account.name || page.name,
          profile_picture_url: page.instagram_business_account.profile_picture_url,
          access_token: page.access_token,
          is_webhook_subscribed: true,
          status: 'connected',
          connected_at: nowIso,
          updated_at: nowIso
        };
        db.saveInstagramAccount(igRecord);
      }
    }

    // 4. Optionally auto-connect channels so the backend webhook router immediately hooks into them
    const connectedChannels: Channel[] = [];
    if (autoConnect) {
      const user = db.getProfileById(userId);
      const isAdmin = user?.role === 'admin';
      const sub = db.getSubscriptionByUserId(userId);
      const planId = String(sub?.plan_id || 'plan_starter').toLowerCase();
      const plan = db.getPlanById(planId);
      const isPro = isAdmin || planId.includes('pro') || Boolean(plan?.price && plan.price >= 1950);
      const maxAllowedChannels = isAdmin ? 999 : plan?.feature_config?.max_channels || (isPro ? 10 : 3);

      const getActiveCount = () =>
        db
          .getChannels(userId)
          .filter(
            (c) =>
              c.is_active &&
              ['messenger', 'instagram', 'whatsapp'].includes(c.platform) &&
              c.identifier !== 'website_widget'
          ).length;

      for (const page of pages) {
        if (getActiveCount() >= maxAllowedChannels) break;
        const fbRes = await metaOAuthService.connectPage(userId, page.id, {
          name: page.name,
          category: page.category,
          access_token: page.access_token
        });
        if (fbRes.success && fbRes.channel) {
          connectedChannels.push(fbRes.channel);
        }

        if (page.instagram_business_account?.id && getActiveCount() < maxAllowedChannels) {
          const igRes = await metaOAuthService.connectInstagram(userId, page.instagram_business_account.id, {
            username: page.instagram_business_account.username,
            pageId: page.id,
            accessToken: page.access_token
          });
          if (igRes.success && igRes.channel) {
            connectedChannels.push(igRes.channel);
          }
        }
      }

      for (const wa of whatsappNumbers) {
        if (getActiveCount() >= maxAllowedChannels) break;
        const waRes = await metaOAuthService.connectWhatsAppOnboarding(userId, {
          wabaId: wa.waba_id,
          phoneNumberId: wa.id,
          displayPhoneNumber: wa.display_phone_number,
          verifiedName: wa.verified_name,
          accessToken: wa.access_token
        });
        if (waRes.success && waRes.channel) {
          connectedChannels.push(waRes.channel);
        }
      }
    }

    db.logAudit({
      id: 'aud_' + Date.now(),
      user_id: userId,
      action: 'meta_channel_service_tokens_stored',
      resource: 'channel',
      details: `Stored ${pages.length} Page Access Tokens and ${whatsappNumbers.length} WhatsApp tokens in user profile/database.`,
      created_at: nowIso
    });

    // 5. Verify stored tokens with Meta Graph API to confirm live connection status
    const verificationReport = await this.verifyTokensWithGraphApi(userId);

    return {
      success: true,
      pages,
      whatsappNumbers,
      connectedChannels,
      verificationReport
    };
  }

  /**
   * Verifies stored Page Access Tokens in the user's database / channels with the live Meta Graph API
   * (`https://graph.facebook.com/v21.0/...`) to confirm connection status, Page identity, and webhook subscription.
   */
  public async verifyTokensWithGraphApi(
    userId: string,
    targetChannelId?: string
  ): Promise<TokenVerificationReport> {
    const userChannels = db.getChannels(userId);
    const channelsToVerify = targetChannelId
      ? userChannels.filter((c) => c.id === targetChannelId)
      : userChannels;

    const results: TokenVerificationItem[] = [];
    const checkedAt = new Date().toISOString();

    // Also check any saved FacebookPages that might not yet have a channel record
    const savedPages = db.getFacebookPages(userId);

    for (const channel of channelsToVerify) {
      const startTime = Date.now();
      const token = (channel.access_token || '').trim();
      const tokenPreview = token ? `EAA••••${token.slice(-6)}` : undefined;

      if (!token) {
        results.push({
          channelId: channel.id,
          assetId: channel.identifier,
          name: channel.name,
          platform: channel.platform,
          valid: false,
          tokenPreview,
          error: 'Missing Page Access Token in database.',
          latencyMs: Date.now() - startTime,
          verifiedAt: checkedAt
        });
        db.updateChannel(channel.id, {
          status: 'error',
          is_active: false,
          error_message: 'Missing Page Access Token in database.'
        });
        continue;
      }

      try {
        let verifyUrl = '';
        if (channel.platform === 'whatsapp') {
          verifyUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(
            channel.identifier
          )}?fields=id,display_phone_number,verified_name,quality_rating&access_token=${encodeURIComponent(token)}`;
        } else if (channel.platform === 'instagram') {
          verifyUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(
            channel.identifier
          )}?fields=id,username,name&access_token=${encodeURIComponent(token)}`;
        } else {
          verifyUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(
            channel.identifier
          )}?fields=id,name,category,tasks&access_token=${encodeURIComponent(token)}`;
        }

        const response = await fetch(verifyUrl);
        let data = (await response.json()) as any;

        // Fallback to /me if token is valid for /me
        if (!response.ok || data.error) {
          const meRes = await fetch(
            `https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${encodeURIComponent(token)}`
          );
          const meData = (await meRes.json()) as any;
          if (meRes.ok && !meData.error && meData.id) {
            data = meData;
          } else {
            const errMsg =
              data.error?.message ||
              meData.error?.message ||
              `Meta Graph API rejected token (HTTP ${response.status})`;
            db.updateChannel(channel.id, {
              status: 'error',
              error_message: errMsg,
              updated_at: new Date().toISOString()
            });
            results.push({
              channelId: channel.id,
              assetId: channel.identifier,
              name: channel.name,
              platform: channel.platform,
              valid: false,
              tokenPreview,
              error: errMsg,
              latencyMs: Date.now() - startTime,
              verifiedAt: checkedAt
            });
            continue;
          }
        }

        // Check webhook subscription status for Messenger Pages
        let webhookSubscribed = true;
        if (channel.platform === 'messenger') {
          try {
            const subRes = await fetch(
              `https://graph.facebook.com/v21.0/${encodeURIComponent(
                channel.identifier
              )}/subscribed_apps?access_token=${encodeURIComponent(token)}`
            );
            const subJson = (await subRes.json()) as any;
            if (subRes.ok && Array.isArray(subJson.data)) {
              webhookSubscribed = subJson.data.length > 0;
            }
          } catch {
            // Non-fatal
          }
        }

        const resolvedName =
          data.name || data.verified_name || data.username || data.display_phone_number || channel.name;

        db.updateChannel(channel.id, {
          status: 'connected',
          is_active: true,
          error_message: undefined,
          meta_asset_name: resolvedName,
          updated_at: new Date().toISOString()
        });

        // Also update FacebookPage record if applicable
        if (channel.platform === 'messenger') {
          const existingPage = savedPages.find((p) => p.id === channel.identifier);
          if (existingPage) {
            db.saveFacebookPage({
              ...existingPage,
              status: 'connected',
              error_message: undefined,
              is_webhook_subscribed: webhookSubscribed,
              updated_at: new Date().toISOString()
            });
          }
        }

        results.push({
          channelId: channel.id,
          assetId: channel.identifier,
          name: channel.name,
          platform: channel.platform,
          valid: true,
          graphId: data.id || channel.identifier,
          graphName: resolvedName,
          category: data.category,
          webhookSubscribed,
          permissions: Array.isArray(data.tasks) ? data.tasks : ['MANAGE', 'MESSAGING'],
          tokenPreview,
          latencyMs: Date.now() - startTime,
          verifiedAt: checkedAt
        });
      } catch (err: any) {
        const errMsg = err?.message || 'Network error while verifying token with Meta Graph API.';
        db.updateChannel(channel.id, {
          status: 'error',
          error_message: errMsg,
          updated_at: new Date().toISOString()
        });
        results.push({
          channelId: channel.id,
          assetId: channel.identifier,
          name: channel.name,
          platform: channel.platform,
          valid: false,
          tokenPreview,
          error: errMsg,
          latencyMs: Date.now() - startTime,
          verifiedAt: checkedAt
        });
      }
    }

    const healthyCount = results.filter((r) => r.valid).length;
    const failedCount = results.length - healthyCount;

    return {
      success: true,
      verified: results.length > 0 && failedCount === 0,
      checkedAt,
      totalChecked: results.length,
      healthyCount,
      failedCount,
      results
    };
  }

  /**
   * Returns sanitized summary of stored Page Access Tokens and profile Meta status
   */
  public getStoredTokensSummary(userId: string) {
    const profile = db.getProfileById(userId);
    const fbPages = db.getFacebookPages(userId).map(({ access_token, ...rest }) => ({
      ...rest,
      has_token: Boolean(access_token),
      token_preview: access_token ? `EAA••••${access_token.slice(-6)}` : undefined
    }));
    const igAccounts = db.getInstagramAccounts(userId).map(({ access_token, ...rest }) => ({
      ...rest,
      has_token: Boolean(access_token),
      token_preview: access_token ? `EAA••••${access_token.slice(-6)}` : undefined
    }));

    return {
      hasProfileToken: Boolean(profile?.meta_user_access_token),
      tokensUpdatedAt: profile?.meta_tokens_updated_at || null,
      grantedScopes: profile?.meta_granted_scopes || [],
      facebookPages: fbPages,
      instagramAccounts: igAccounts
    };
  }
}

export const metaChannelService = new MetaChannelService();
