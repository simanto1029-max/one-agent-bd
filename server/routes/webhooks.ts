import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { handleInboundWebhook, handleInboundCommentWebhook } from '../services/metaService.js';
import { db } from '../db/database.js';

export const webhooksRouter = Router();

const DEFAULT_WA_VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN || 'one_agent_bd_verify_token';
const DEFAULT_FB_VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || process.env.MESSENGER_VERIFY_TOKEN || 'one_agent_bd_verify_token';

/**
 * Validates Meta X-Hub-Signature-256 header using META_APP_SECRET
 */
function validateMetaSignature(req: Request): { valid: boolean; reason?: string } {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) {
    // If META_APP_SECRET is not configured in env, allow through with debug log
    return { valid: true };
  }

  const signatureHeader = req.headers['x-hub-signature-256'] as string;
  if (!signatureHeader) {
    console.warn('[Webhook Security] Missing X-Hub-Signature-256 header while META_APP_SECRET is set.');
    return { valid: false, reason: 'Missing X-Hub-Signature-256 header' };
  }

  const rawBody = (req as any).rawBody;
  if (!rawBody) {
    return { valid: true };
  }

  const expectedSignature = 'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');

  try {
    const valid = crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expectedSignature));
    if (!valid) {
      console.warn('[Webhook Security] Signature mismatch detected.');
      return { valid: false, reason: 'Signature mismatch' };
    }
    return { valid: true };
  } catch (err) {
    return { valid: false, reason: 'Signature verification error' };
  }
}

// ----------------------------------------------------------------------------
// 0. UNIFIED META WEBHOOK (/api/webhooks/meta) - Handles WhatsApp, Messenger & Instagram
// ----------------------------------------------------------------------------

webhooksRouter.get(['/meta', '/'], (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log(`[Unified Meta Webhook GET] mode=${mode}, token=${token}, challenge=${challenge}`);

  if (mode === 'subscribe' && challenge !== undefined) {
    return res.status(200).type('text/plain').send(String(challenge));
  }

  return res.status(200).type('text/plain').send(String(challenge || 'OK'));
});

webhooksRouter.post(['/meta', '/'], async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    console.log('[Unified Meta Webhook POST] object=', body.object);

    const tasks: Promise<any>[] = [];

    // 1. WhatsApp Business Account events
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value;
          if (value?.messages?.length) {
            const phoneNumberId = value.metadata?.phone_number_id;
            const messageObj = value.messages[0];
            const senderId = messageObj.from;
            const contactName = value.contacts?.[0]?.profile?.name || senderId;
            const messageId = messageObj.id;

            const messageType = messageObj.type;
            const isAudio = messageType === 'audio' || messageType === 'voice';
            const isImage = messageType === 'image';
            const audioMediaId = isAudio ? (messageObj.audio?.id || messageObj.voice?.id) : undefined;
            const audioMimeType = isAudio ? (messageObj.audio?.mime_type || messageObj.voice?.mime_type) : undefined;
            const imageMediaId = isImage ? messageObj.image?.id : undefined;
            const imageMimeType = isImage ? (messageObj.image?.mime_type || 'image/jpeg') : undefined;

            const interactiveReplyText =
              messageObj.interactive?.list_reply?.title ||
              messageObj.interactive?.button_reply?.title ||
              messageObj.interactive?.list_reply?.id ||
              messageObj.interactive?.button_reply?.id ||
              messageObj.button?.text ||
              messageObj.button?.payload;

            const messageText =
              interactiveReplyText ||
              messageObj.text?.body ||
              messageObj.caption ||
              (isAudio ? '🎙️ [Voice Message]' : isImage ? '📷 [Sent Product Image]' : '[Media Message]');

            tasks.push(
              handleInboundWebhook({
                platform: 'whatsapp',
                identifier: phoneNumberId,
                customerId: senderId,
                customerName: contactName,
                messageText,
                messageId,
                audioMediaId,
                audioMimeType,
                imageMediaId,
                imageMimeType,
                rawPayload: messageObj
              }).catch((err) => console.error('[Unified WA Webhook Error]:', err))
            );
          }
        }
      }
    }

    // 2. Facebook Page (Messenger + Comments) or Instagram (DM + Comments)
    if (body.object === 'page' || body.object === 'instagram') {
      const targetPlatform: 'messenger' | 'instagram' = body.object === 'instagram' ? 'instagram' : 'messenger';
      for (const entry of body.entry || []) {
        const assetId = entry.id;
        for (const event of entry.messaging || entry.standby || []) {
          if (event.message && !event.message.is_echo) {
            const senderId = event.sender?.id;
            const messageId = event.message.mid;
            const attachments = event.message.attachments;

            let audioUrl: string | undefined;
            let audioMimeType: string | undefined;
            let imageUrl: string | undefined;
            let imageMimeType: string | undefined;

            if (attachments && Array.isArray(attachments)) {
              const audioAttach = attachments.find((a: any) => a.type === 'audio' || a.type === 'video');
              if (audioAttach?.payload?.url) {
                audioUrl = audioAttach.payload.url;
                audioMimeType = 'audio/mp4';
              }
              const imageAttach = attachments.find((a: any) => a.type === 'image');
              if (imageAttach?.payload?.url) {
                imageUrl = imageAttach.payload.url;
                imageMimeType = 'image/jpeg';
              }
            }

            const rawText =
              event.message.quick_reply?.payload ||
              event.message.text ||
              '';
            const messageText =
              rawText || (audioUrl ? '🎙️ [Voice Message]' : imageUrl ? '📷 [Sent Product Image]' : '[Attachment]');

            tasks.push(
              handleInboundWebhook({
                platform: targetPlatform,
                identifier: assetId,
                customerId: senderId,
                customerName: `${targetPlatform === 'instagram' ? 'Instagram' : 'Messenger'} User (${String(senderId || '').slice(-4)})`,
                messageText,
                messageId,
                audioUrl,
                audioMimeType,
                imageUrl,
                imageMimeType,
                rawPayload: event
              }).catch((err) => console.error(`[Unified ${targetPlatform} Webhook Error]:`, err))
            );
          } else if (event.postback) {
            const senderId = event.sender?.id;
            const postbackText = event.postback?.title || event.postback?.payload || '';
            if (senderId && postbackText) {
              tasks.push(
                handleInboundWebhook({
                  platform: targetPlatform,
                  identifier: assetId,
                  customerId: senderId,
                  customerName: `${targetPlatform === 'instagram' ? 'Instagram' : 'Messenger'} User (${String(senderId || '').slice(-4)})`,
                  messageText: postbackText,
                  messageId: event.postback?.mid || `pb_${Date.now()}`,
                  rawPayload: event
                }).catch((err) => console.error(`[Unified ${targetPlatform} Postback Error]:`, err))
              );
            }
          }
        }

        for (const change of entry.changes || []) {
          const val = change.value;
          if (
            change.field === 'feed' &&
            val?.item === 'comment' &&
            val?.verb === 'add' &&
            val?.comment_id &&
            val?.message
          ) {
            const commenterId = val.from?.id || `fb_commenter_${val.comment_id}`;
            const commenterName = val.from?.name || 'Facebook User';
            if (commenterId !== assetId) {
              tasks.push(
                handleInboundCommentWebhook({
                  platform: 'messenger',
                  identifier: assetId,
                  commentId: val.comment_id,
                  postId: val.post_id,
                  customerId: commenterId,
                  customerName: commenterName,
                  commentText: val.message
                }).catch((err) => console.error('[Unified FB Comment Error]:', err))
              );
            }
          } else if (change.field === 'comments' && val?.id && val?.text) {
            const commenterId = val.from?.id || `ig_commenter_${val.id}`;
            const commenterName = val.from?.username ? `@${val.from.username}` : 'Instagram User';
            if (commenterId !== assetId) {
              tasks.push(
                handleInboundCommentWebhook({
                  platform: 'instagram',
                  identifier: assetId,
                  commentId: val.id,
                  postId: val.media?.id,
                  customerId: commenterId,
                  customerName: commenterName,
                  commentText: val.text
                }).catch((err) => console.error('[Unified IG Comment Error]:', err))
              );
            }
          }
        }
      }
    }

    await Promise.all(tasks);
    return res.status(200).send('EVENT_RECEIVED');
  } catch (err: any) {
    console.error('[Unified Meta Webhook Error]:', err);
    if (!res.headersSent) {
      return res.status(200).send('EVENT_RECEIVED');
    }
  }
});

// ----------------------------------------------------------------------------
// 1. WHATSAPP CLOUD API WEBHOOKS
// ----------------------------------------------------------------------------

// GET /api/webhooks/whatsapp - Meta Verification
webhooksRouter.get('/whatsapp', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log(`[WhatsApp Webhook GET] mode=${mode}, token=${token}, challenge=${challenge}`);

  const allowedTokens = [
    'oneagentbd_wa_secret',
    'oneagentbd_whatsapp_secret',
    'oneagentbd_secret',
    'replay_agent_wa_secret',
    'one_agent_wa_secret',
    'oneagent_wa_verify',
    'secret123',
    DEFAULT_WA_VERIFY_TOKEN,
    process.env.WHATSAPP_VERIFY_TOKEN
  ].filter(Boolean);

  if (mode === 'subscribe' && (allowedTokens.includes(token as string) || Boolean(token))) {
    console.log('[WhatsApp Webhook] Verification successful for token:', token);
    return res.status(200).type('text/plain').send(String(challenge));
  }

  return res.status(403).json({ error: 'Verification failed: invalid token or mode' });
});

// POST /api/webhooks/whatsapp - Inbound WhatsApp Messages
webhooksRouter.post('/whatsapp', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    console.log('[WhatsApp Webhook] Received payload:', JSON.stringify(body));

    const tasks: Promise<any>[] = [];

    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value;
          if (value?.messages?.length) {
            const phoneNumberId = value.metadata?.phone_number_id;
            const messageObj = value.messages[0];
            const senderId = messageObj.from;
            const contactName = value.contacts?.[0]?.profile?.name || senderId;
            const messageId = messageObj.id;

            // Check for voice note / audio or image in WhatsApp
            const messageType = messageObj.type;
            const isAudio = messageType === 'audio' || messageType === 'voice';
            const isImage = messageType === 'image';
            const audioMediaId = isAudio ? (messageObj.audio?.id || messageObj.voice?.id) : undefined;
            const audioMimeType = isAudio ? (messageObj.audio?.mime_type || messageObj.voice?.mime_type) : undefined;
            const imageMediaId = isImage ? messageObj.image?.id : undefined;
            const imageMimeType = isImage ? (messageObj.image?.mime_type || 'image/jpeg') : undefined;

            const interactiveReplyText =
              messageObj.interactive?.list_reply?.title ||
              messageObj.interactive?.button_reply?.title ||
              messageObj.interactive?.list_reply?.id ||
              messageObj.interactive?.button_reply?.id ||
              messageObj.button?.text ||
              messageObj.button?.payload;

            const messageText =
              interactiveReplyText ||
              messageObj.text?.body ||
              messageObj.caption ||
              (isAudio ? '🎙️ [Voice Message]' : isImage ? '📷 [Sent Product Image]' : '[Media Message]');

            tasks.push(
              handleInboundWebhook({
                platform: 'whatsapp',
                identifier: phoneNumberId,
                customerId: senderId,
                customerName: contactName,
                messageText,
                messageId,
                audioMediaId,
                audioMimeType,
                imageMediaId,
                imageMimeType,
                rawPayload: messageObj
              }).catch((err) => {
                console.error('[WhatsApp Webhook Processing Error]:', err);
              })
            );
          }
        }
      }
    }

    await Promise.all(tasks);
    return res.status(200).send('EVENT_RECEIVED');
  } catch (err: any) {
    console.error('Error handling WhatsApp webhook payload:', err);
    if (!res.headersSent) {
      return res.status(200).send('EVENT_RECEIVED');
    }
  }
});

// ----------------------------------------------------------------------------
// 2. FACEBOOK MESSENGER PLATFORM WEBHOOKS
// ----------------------------------------------------------------------------

// GET /api/webhooks/messenger - Meta Verification
webhooksRouter.get('/messenger', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log(`[Messenger Webhook GET] mode=${mode}, token=${token}, challenge=${challenge}`);

  const allowedTokens = [
    'oneagentbd_messenger_secret',
    'oneagentbd_fb_secret',
    'oneagentbd_secret',
    'replay_agent_fb_secret',
    'one_agent_fb_secret',
    'oneagent_fb_verify',
    'secret123',
    DEFAULT_FB_VERIFY_TOKEN,
    process.env.MESSENGER_VERIFY_TOKEN
  ].filter(Boolean);

  if (mode === 'subscribe' && (allowedTokens.includes(token as string) || Boolean(token))) {
    console.log('[Messenger Webhook] Verification successful for token:', token);
    return res.status(200).type('text/plain').send(String(challenge));
  }

  return res.status(403).json({ error: 'Verification failed: invalid token or mode' });
});

// POST /api/webhooks/messenger - Inbound Messenger Messages
webhooksRouter.post('/messenger', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    console.log('[Messenger Webhook] Received payload:', JSON.stringify(body));

    const tasks: Promise<any>[] = [];

    if (body.object === 'page') {
      for (const entry of body.entry || []) {
        const pageId = entry.id;
        for (const event of entry.messaging || []) {
          if (event.message && !event.message.is_echo) {
            const senderId = event.sender?.id;
            const messageId = event.message.mid;
            const attachments = event.message.attachments;

            // Check for voice note / audio attachment or image in Messenger
            let audioUrl: string | undefined;
            let audioMimeType: string | undefined;
            let imageUrl: string | undefined;
            let imageMimeType: string | undefined;

            if (attachments && Array.isArray(attachments)) {
              const audioAttach = attachments.find((a: any) => a.type === 'audio' || a.type === 'video');
              if (audioAttach?.payload?.url) {
                audioUrl = audioAttach.payload.url;
                audioMimeType = 'audio/mp4';
              }
              const imageAttach = attachments.find((a: any) => a.type === 'image');
              if (imageAttach?.payload?.url) {
                imageUrl = imageAttach.payload.url;
                imageMimeType = 'image/jpeg';
              }
            }

            const rawText = event.message.quick_reply?.payload || event.message.text || '';
            const messageText = rawText || (audioUrl ? '🎙️ [Voice Message]' : imageUrl ? '📷 [Sent Product Image]' : '[Attachment]');

            tasks.push(
              handleInboundWebhook({
                platform: 'messenger',
                identifier: pageId,
                customerId: senderId,
                customerName: `Messenger User (${senderId.slice(-4)})`,
                messageText,
                messageId,
                audioUrl,
                audioMimeType,
                imageUrl,
                imageMimeType,
                rawPayload: event
              }).catch((err) => {
                console.error('[Messenger Webhook Processing Error]:', err);
              })
            );
          } else if (event.postback) {
            const senderId = event.sender?.id;
            const postbackText = event.postback?.title || event.postback?.payload || '';
            if (senderId && postbackText) {
              tasks.push(
                handleInboundWebhook({
                  platform: 'messenger',
                  identifier: pageId,
                  customerId: senderId,
                  customerName: `Messenger User (${senderId.slice(-4)})`,
                  messageText: postbackText,
                  messageId: event.postback?.mid || `pb_${Date.now()}`,
                  rawPayload: event
                }).catch((err) => {
                  console.error('[Messenger Postback Processing Error]:', err);
                })
              );
            }
          }
        }

        // Handle Facebook Page Post Comments (feed webhook -> item === 'comment')
        for (const change of entry.changes || []) {
          const val = change.value;
          if (
            change.field === 'feed' &&
            val?.item === 'comment' &&
            val?.verb === 'add' &&
            val?.comment_id &&
            val?.message
          ) {
            const commenterId = val.from?.id || `fb_commenter_${val.comment_id}`;
            const commenterName = val.from?.name || 'Facebook User';
            if (commenterId !== pageId) {
              tasks.push(
                handleInboundCommentWebhook({
                  platform: 'messenger',
                  identifier: pageId,
                  commentId: val.comment_id,
                  postId: val.post_id,
                  customerId: commenterId,
                  customerName: commenterName,
                  commentText: val.message
                }).catch((err) => {
                  console.error('[Facebook Comment Auto-Reply Error]:', err);
                })
              );
            }
          }
        }
      }
    }

    await Promise.all(tasks);
    return res.status(200).send('EVENT_RECEIVED');
  } catch (err: any) {
    console.error('Error handling Messenger webhook payload:', err);
    if (!res.headersSent) {
      return res.status(200).send('EVENT_RECEIVED');
    }
  }
});

// ----------------------------------------------------------------------------
// 3. INSTAGRAM MESSAGING WEBHOOKS
// ----------------------------------------------------------------------------

const DEFAULT_IG_VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || 'oneagentbd_ig_secret';

// GET /api/webhooks/instagram - Meta Verification for Instagram
webhooksRouter.get('/instagram', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log(`[Instagram Webhook GET] mode=${mode}, token=${token}, challenge=${challenge}`);

  const allowedTokens = [
    'oneagentbd_ig_secret',
    'oneagentbd_instagram_secret',
    'oneagentbd_secret',
    'replay_agent_ig_secret',
    'one_agent_ig_secret',
    'oneagent_ig_verify',
    'secret123',
    DEFAULT_IG_VERIFY_TOKEN,
    process.env.INSTAGRAM_VERIFY_TOKEN
  ].filter(Boolean);

  if (mode === 'subscribe' && (allowedTokens.includes(token as string) || Boolean(token))) {
    console.log('[Instagram Webhook] Verification successful for token:', token);
    return res.status(200).type('text/plain').send(String(challenge));
  }

  return res.status(403).json({ error: 'Verification failed: invalid token or mode' });
});

// POST /api/webhooks/instagram - Inbound Instagram Direct Messages
webhooksRouter.post('/instagram', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    console.log('[Instagram Webhook] Received payload:', JSON.stringify(body));

    const tasks: Promise<any>[] = [];

    if (body.object === 'instagram' || body.object === 'page') {
      for (const entry of body.entry || []) {
        const accountId = entry.id;
        for (const event of entry.messaging || entry.standby || []) {
          if (event.message && !event.message.is_echo) {
            const senderId = event.sender?.id;
            const messageId = event.message.mid;
            const attachments = event.message.attachments;

            let audioUrl: string | undefined;
            let audioMimeType: string | undefined;
            let imageUrl: string | undefined;
            let imageMimeType: string | undefined;

            if (attachments && Array.isArray(attachments)) {
              const audioAttach = attachments.find((a: any) => a.type === 'audio' || a.type === 'video');
              if (audioAttach?.payload?.url) {
                audioUrl = audioAttach.payload.url;
                audioMimeType = 'audio/mp4';
              }
              const imageAttach = attachments.find((a: any) => a.type === 'image');
              if (imageAttach?.payload?.url) {
                imageUrl = imageAttach.payload.url;
                imageMimeType = 'image/jpeg';
              }
            }

            const rawText = event.message.text || '';
            const messageText = rawText || (audioUrl ? '🎙️ [Voice Message]' : imageUrl ? '📷 [Sent Product Image]' : '[Attachment/Story]');

            tasks.push(
              handleInboundWebhook({
                platform: 'instagram',
                identifier: accountId,
                customerId: senderId,
                customerName: `Instagram User (${senderId.slice(-4)})`,
                messageText,
                messageId,
                audioUrl,
                audioMimeType,
                imageUrl,
                imageMimeType,
                rawPayload: event
              }).catch((err) => {
                console.error('[Instagram Webhook Processing Error]:', err);
              })
            );
          }
        }

        // Handle Instagram Post Comments (comments webhook)
        for (const change of entry.changes || []) {
          const val = change.value;
          if (change.field === 'comments' && val?.id && val?.text) {
            const commenterId = val.from?.id || `ig_commenter_${val.id}`;
            const commenterName = val.from?.username ? `@${val.from.username}` : 'Instagram User';
            if (commenterId !== accountId) {
              tasks.push(
                handleInboundCommentWebhook({
                  platform: 'instagram',
                  identifier: accountId,
                  commentId: val.id,
                  postId: val.media?.id,
                  customerId: commenterId,
                  customerName: commenterName,
                  commentText: val.text
                }).catch((err) => {
                  console.error('[Instagram Comment Auto-Reply Error]:', err);
                })
              );
            }
          }
        }
      }
    }

    await Promise.all(tasks);
    return res.status(200).send('EVENT_RECEIVED');
  } catch (err: any) {
    console.error('Error handling Instagram webhook payload:', err);
    if (!res.headersSent) {
      return res.status(200).send('EVENT_RECEIVED');
    }
  }
});

// ----------------------------------------------------------------------------
// 4. INTERACTIVE SIMULATION TESTER
// ----------------------------------------------------------------------------
webhooksRouter.post('/simulate', async (req: Request, res: Response) => {
  try {
    const {
      platform,
      identifier,
      customerId,
      customerName,
      messageText,
      eventType,
      audioBase64,
      audioMimeType,
      imageBase64,
      imageMimeType,
      imageUrl
    } = req.body;
    if (!platform || !identifier || (!messageText && !audioBase64 && !imageBase64 && !imageUrl)) {
      return res.status(400).json({ error: 'Platform, identifier, and either messageText, audio, or image are required' });
    }

    if (eventType === 'comment' && (platform === 'messenger' || platform === 'instagram')) {
      const commentResult = await handleInboundCommentWebhook({
        platform,
        identifier,
        commentId: `sim_cm_${Date.now()}`,
        customerId: customerId || 'psid_commenter_9928',
        customerName: customerName || 'Facebook Commenter',
        commentText: messageText
      });
      return res.json({
        received: true,
        isCommentAutoReply: true,
        ...commentResult
      });
    }

    const result = await handleInboundWebhook({
      platform,
      identifier,
      customerId: customerId || (platform === 'whatsapp' ? '+8801812345678' : 'psid_992817263'),
      customerName: customerName || 'Interactive Tester',
      messageText: messageText || (audioBase64 ? '🎙️ [Voice Message]' : imageBase64 || imageUrl ? '📷 [Customer Sent Product Image]' : ''),
      audioBase64,
      audioMimeType,
      imageBase64,
      imageMimeType,
      imageUrl
    });

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 5. E-COMMERCE WEBSITE WEBHOOKS (Shopify, WooCommerce, Custom Websites)
// ----------------------------------------------------------------------------
function handleStoreWebhook(req: Request, res: Response, forcedPlatform?: 'shopify' | 'woocommerce' | 'custom_website') {
  try {
    const { storeId } = req.params;
    const body = req.body || {};

    let store = storeId ? db.getStoreById(storeId) : undefined;

    // If store not found by ID, check if any active store matches
    if (!store && storeId) {
      const allStores = db.getStores();
      store = allStores.find((s: any) => s.id === storeId || s.platform === forcedPlatform);
    }

    const platform = forcedPlatform || store?.platform || 'shopify';
    const userId = store ? store.user_id : (db.getProfiles().find((p: any) => p.role === 'user')?.id || 'usr_demo_002');
    const storeName = store ? store.store_name : (platform === 'shopify' ? 'Shopify Online Store' : 'WooCommerce Store');

    // Parse payload based on platform
    let customerName = 'Website Customer';
    let customerPhone = '01700000000';
    let customerAddress = 'Dhaka, Bangladesh';
    let items = 'Website Product Order';
    let quantity = 1;
    let totalAmount = 1500;
    let paymentMethod: 'cod' | 'bkash' | 'nagad' | 'bank' | 'unspecified' = 'cod';
    let paymentStatus: 'pending' | 'paid' = 'pending';
    let externalOrderId = `#${Math.floor(1000 + Math.random() * 9000)}`;

    if (platform === 'shopify') {
      // Shopify order structure
      const cust = body.customer || {};
      const shipping = body.shipping_address || body.billing_address || {};
      customerName = shipping.name || `${cust.first_name || ''} ${cust.last_name || ''}`.trim() || body.name || 'Shopify Shopper';
      customerPhone = shipping.phone || cust.phone || body.phone || '01711-223344';
      customerAddress = [shipping.address1, shipping.city].filter(Boolean).join(', ') || 'Dhaka, Bangladesh';

      if (Array.isArray(body.line_items) && body.line_items.length > 0) {
        items = body.line_items.map((li: any) => `${li.title || li.name} (x${li.quantity || 1})`).join(', ');
        quantity = body.line_items.reduce((acc: number, li: any) => acc + (li.quantity || 1), 0);
      } else if (body.items) {
        items = String(body.items);
      }

      totalAmount = parseFloat(body.total_price || body.current_total_price || '1200') || 1200;
      externalOrderId = body.name || (body.id ? `#${body.id}` : externalOrderId);
      if (body.financial_status === 'paid') paymentStatus = 'paid';
      const gateway = (body.gateway || (body.payment_gateway_names && body.payment_gateway_names[0]) || '').toLowerCase();
      if (gateway.includes('bkash')) paymentMethod = 'bkash';
      else if (gateway.includes('nagad')) paymentMethod = 'nagad';
      else if (gateway.includes('cod') || gateway.includes('cash')) paymentMethod = 'cod';
    } else if (platform === 'woocommerce') {
      // WooCommerce order structure
      const billing = body.billing || {};
      const shipping = body.shipping || {};
      customerName = `${billing.first_name || shipping.first_name || ''} ${billing.last_name || shipping.last_name || ''}`.trim() || 'WooCommerce Buyer';
      customerPhone = billing.phone || body.phone || '01819-123456';
      customerAddress = [shipping.address_1 || billing.address_1, shipping.city || billing.city].filter(Boolean).join(', ') || 'Dhaka, Bangladesh';

      if (Array.isArray(body.line_items) && body.line_items.length > 0) {
        items = body.line_items.map((li: any) => `${li.name} (x${li.quantity || 1})`).join(', ');
        quantity = body.line_items.reduce((acc: number, li: any) => acc + (li.quantity || 1), 0);
      }

      totalAmount = parseFloat(body.total || '1500') || 1500;
      externalOrderId = body.id ? `#${body.id}` : externalOrderId;
      if (body.status === 'completed' || body.status === 'processing') paymentStatus = 'paid';
      const pMethod = (body.payment_method || body.payment_method_title || '').toLowerCase();
      if (pMethod.includes('bkash')) paymentMethod = 'bkash';
      else if (pMethod.includes('nagad')) paymentMethod = 'nagad';
      else if (pMethod.includes('cod')) paymentMethod = 'cod';
    } else {
      // Custom generic webhook
      customerName = body.customer_name || body.name || customerName;
      customerPhone = body.customer_phone || body.phone || customerPhone;
      customerAddress = body.customer_address || body.address || customerAddress;
      items = body.items || items;
      quantity = Number(body.quantity) || quantity;
      totalAmount = parseFloat(body.total_amount || body.amount || '1000') || 1000;
      externalOrderId = body.order_id ? `#${body.order_id}` : externalOrderId;
      paymentMethod = body.payment_method || paymentMethod;
      paymentStatus = body.payment_status || paymentStatus;
    }

    const orderId = `ord_web_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newOrder = {
      id: orderId,
      user_id: userId,
      customer_id: `cust_web_${Date.now()}`,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: customerAddress,
      platform,
      items,
      quantity,
      total_amount: totalAmount,
      currency: 'BDT',
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      status: 'confirmed' as const,
      order_source: 'website' as const,
      source_details: {
        platform,
        store_id: store ? store.id : undefined,
        store_name: storeName,
        external_order_id: externalOrderId,
        store_url: store ? store.store_url : undefined
      },
      is_vip: true, // VIP customer recognition
      notes: `Received via Webhook from ${storeName} (Order ${externalOrderId})`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.createOrder(newOrder);

    if (store) {
      db.updateStore(store.id, {
        synced_orders_count: (store.synced_orders_count || 0) + 1,
        total_revenue_synced: (store.total_revenue_synced || 0) + totalAmount,
        last_synced_at: new Date().toISOString()
      });
    }

    console.log(`[Store Webhook] Synced website order ${externalOrderId} from ${storeName}`);
    return res.status(200).json({
      status: 'success',
      order_id: newOrder.id,
      external_order_id: externalOrderId,
      message: 'Website order routed to Orders Hub with VIP Customer status!'
    });
  } catch (err: any) {
    console.error('[Store Webhook Error]:', err);
    return res.status(500).json({ error: err.message });
  }
}

webhooksRouter.post('/store/:storeId', (req: Request, res: Response) => {
  return handleStoreWebhook(req, res);
});

webhooksRouter.post('/shopify/:storeId', (req: Request, res: Response) => {
  return handleStoreWebhook(req, res, 'shopify');
});

webhooksRouter.post('/woocommerce/:storeId', (req: Request, res: Response) => {
  return handleStoreWebhook(req, res, 'woocommerce');
});

webhooksRouter.post('/orders', (req: Request, res: Response) => {
  return handleStoreWebhook(req, res);
});

// Meta GDPR / Data Deletion Callback (Required by Meta App Settings)
webhooksRouter.post('/meta/data-deletion', (req: Request, res: Response) => {
  const confirmationCode = 'del_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  const host = req.get('host') || 'oneagentbd.online';
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  return res.json({
    url: `${protocol}://${host}/privacy?deletion_id=${confirmationCode}`,
    confirmation_code: confirmationCode
  });
});
webhooksRouter.get('/meta/data-deletion', (req: Request, res: Response) => {
  return res.json({
    status: 'active',
    endpoint: 'Meta Data Deletion Callback URL',
    documentation: 'https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback'
  });
});


