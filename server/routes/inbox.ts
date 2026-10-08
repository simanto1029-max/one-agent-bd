import { Router, Request, Response } from 'express';
import { db, Message } from '../db/database.js';
import { getAuthenticatedUser } from './auth.js';
import { handleInboundWebhook, sendManualMetaMessage } from '../services/metaService.js';
import { getUserSubscriptionStatus } from '../services/subscriptionService.js';
import { summarizeConversation } from '../services/aiService.js';
import { prepareOutboundVoiceForMeta } from '../services/audioDownloader.js';

export const inboxRouter = Router();

// GET /api/inbox/messages
inboxRouter.get('/messages', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { channel_id, platform, customer_id, search, category } = req.query;
  let messages = db.getMessages(user.id);
  const userOrders = db.getOrders(user.id);
  const profile = db.getProfileById(user.id);
  const pausedList = profile?.automation_settings?.paused_customers || [];
  const blockedList = profile?.automation_settings?.blocked_customers || [];

  if (channel_id) {
    messages = messages.filter((m) => m.channel_id === channel_id);
  }
  if (platform) {
    messages = messages.filter((m) => m.platform === platform);
  }
  if (customer_id) {
    messages = messages.filter((m) => m.customer_id === customer_id);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    messages = messages.filter(
      (m) =>
        m.message_text.toLowerCase().includes(q) ||
        (m.customer_name && m.customer_name.toLowerCase().includes(q)) ||
        m.customer_id.toLowerCase().includes(q)
    );
  }

  // Group by customer conversation
  const conversationsMap = new Map<string, {
    customerId: string;
    customerName: string;
    customerAvatar?: string;
    platform: 'whatsapp' | 'messenger' | 'instagram';
    channelId?: string;
    lastMessage: Message;
    messages: Message[];
    unreadCount: number;
    orderCategory: 'orders' | 'delivered' | 'new_customer';
    totalOrdersCount: number;
    latestOrderId?: string;
    latestOrderStatus?: string;
    isAiPaused: boolean;
    isBlocked: boolean;
    requiresHumanAttention: boolean;
    attentionReason?: string;
  }>();

  for (const msg of messages) {
    const key = `${msg.platform}_${msg.customer_id}`;
    if (!conversationsMap.has(key)) {
      // Cross-match orders for this customer
      const matchingOrders = userOrders.filter((o) => {
        const cleanMsgId = msg.customer_id.replace(/\D/g, '');
        const cleanOrderPhone = o.customer_phone ? o.customer_phone.replace(/\D/g, '') : '';
        const phoneMatch = cleanOrderPhone.length >= 8 && cleanMsgId.length >= 8 &&
          (cleanMsgId.includes(cleanOrderPhone) || cleanOrderPhone.includes(cleanMsgId));
        const nameMatch = Boolean(o.customer_name && msg.customer_name &&
          o.customer_name.toLowerCase().trim() === msg.customer_name.toLowerCase().trim());
        return phoneMatch || nameMatch || o.customer_id === msg.customer_id;
      });

      let orderCategory: 'orders' | 'delivered' | 'new_customer' = 'new_customer';
      let latestOrderId: string | undefined;
      let latestOrderStatus: string | undefined;

      if (matchingOrders.length > 0) {
        matchingOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const latest = matchingOrders[0];
        latestOrderId = latest.id;
        latestOrderStatus = latest.status;

        if (latest.status === 'delivered') {
          orderCategory = 'delivered';
        } else {
          orderCategory = 'orders';
        }
      }

      const isAiPaused = pausedList.includes(msg.customer_id) || pausedList.includes(key);
      const isBlocked = blockedList.includes(msg.customer_id) || blockedList.includes(key);

      conversationsMap.set(key, {
        customerId: msg.customer_id,
        customerName: msg.customer_name || msg.customer_id,
        customerAvatar: msg.customer_avatar,
        platform: msg.platform,
        channelId: msg.channel_id,
        lastMessage: msg,
        messages: [],
        unreadCount: 0,
        orderCategory,
        totalOrdersCount: matchingOrders.length,
        latestOrderId,
        latestOrderStatus,
        isAiPaused,
        isBlocked,
        requiresHumanAttention: Boolean(msg.requires_human_attention),
        attentionReason: msg.attention_reason
      });
    }
    const conv = conversationsMap.get(key)!;
    conv.messages.push(msg);
    conv.lastMessage = msg;
    if (msg.requires_human_attention) {
      conv.requiresHumanAttention = true;
      if (msg.attention_reason) {
        conv.attentionReason = msg.attention_reason;
      }
    }
    if (msg.customer_avatar && !conv.customerAvatar) {
      conv.customerAvatar = msg.customer_avatar;
    }
    if (msg.customer_name && conv.customerName === conv.customerId) {
      conv.customerName = msg.customer_name;
    }
  }

  let conversations = Array.from(conversationsMap.values()).sort(
    (a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
  );

  const categoryCounts = {
    all: conversations.length,
    orders: conversations.filter((c) => c.orderCategory === 'orders').length,
    delivered: conversations.filter((c) => c.orderCategory === 'delivered').length,
    new_customer: conversations.filter((c) => c.orderCategory === 'new_customer').length
  };

  if (category && category !== 'all') {
    conversations = conversations.filter((c) => c.orderCategory === category);
  }

  return res.json({
    conversations,
    allMessages: messages,
    categoryCounts
  });
});

// POST /api/inbox/reply - Manual agent reply (supports text, image, video, and voice note)
inboxRouter.post('/reply', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const subStatus = getUserSubscriptionStatus(user.id);
  if (subStatus.isGated) {
    return res.status(403).json({ error: 'Subscription expired. Please renew to send messages.' });
  }

  const {
    customerId,
    customerName,
    platform,
    channelId,
    messageText,
    imageBase64,
    imageMimeType,
    videoBase64,
    videoMimeType,
    audioBase64,
    audioMimeType
  } = req.body;

  const hasText = Boolean(messageText && String(messageText).trim());
  const hasImage = Boolean(imageBase64);
  const hasVideo = Boolean(videoBase64);
  const hasVoice = Boolean(audioBase64);

  if (!customerId || !platform || (!hasText && !hasImage && !hasVideo && !hasVoice)) {
    return res.status(400).json({
      error: 'customerId, platform, and at least one of messageText, image, video, or voice are required'
    });
  }

  const fallbackText = hasText
    ? String(messageText).trim()
    : hasVoice
    ? '🎙️ Voice Message'
    : hasVideo
    ? '🎬 Sent a Video'
    : hasImage
    ? '📷 Sent a Photo'
    : '';

  // If voice note is sent, ensure it is normalized & encoded to universal MP3 (audio/mpeg)
  let normalizedAudioBase64 = hasVoice ? String(audioBase64).replace(/^data:[^;]+;base64,/, '') : undefined;
  let normalizedAudioMime = hasVoice ? audioMimeType || 'audio/mpeg' : undefined;
  if (hasVoice && normalizedAudioBase64) {
    try {
      const rawBuf = Buffer.from(normalizedAudioBase64, 'base64');
      const prepared = await prepareOutboundVoiceForMeta(rawBuf, normalizedAudioMime, platform);
      normalizedAudioBase64 = prepared.buffer.toString('base64');
      normalizedAudioMime = prepared.mimeType;
    } catch (e) {
      console.warn('[Inbox Reply] Voice normalization warning:', e);
    }
  }

  // Dispatch to real connected Meta channel if available
  const userChannels = db.getChannels(user.id);
  const activeChannel =
    (channelId ? userChannels.find((c) => c.id === channelId) : undefined) ||
    userChannels.find((c) => c.platform === platform && c.is_active);

  if (activeChannel) {
    await sendManualMetaMessage(activeChannel, customerId, {
      text: hasText ? String(messageText).trim() : undefined,
      imageBase64,
      imageMimeType,
      videoBase64,
      videoMimeType,
      audioBase64: normalizedAudioBase64,
      audioMimeType: normalizedAudioMime
    });
  }

  const outbound: Message = db.createMessage({
    id: `msg_${Date.now()}_agent_${Math.random().toString(36).substring(2, 6)}`,
    user_id: user.id,
    channel_id: activeChannel?.id || channelId,
    platform,
    customer_id: customerId,
    customer_name: customerName,
    direction: 'outbound',
    message_text: fallbackText,
    has_image: hasImage,
    image_base64: hasImage ? String(imageBase64) : undefined,
    image_mime_type: hasImage ? imageMimeType || 'image/jpeg' : undefined,
    has_video: hasVideo,
    video_base64: hasVideo ? String(videoBase64) : undefined,
    video_mime_type: hasVideo ? videoMimeType || 'video/mp4' : undefined,
    has_voice: hasVoice,
    audio_base64: hasVoice ? normalizedAudioBase64 : undefined,
    audio_mime_type: hasVoice ? normalizedAudioMime || 'audio/mpeg' : undefined,
    is_ai_reply: false,
    status: 'sent',
    created_at: new Date().toISOString()
  });

  return res.status(201).json(outbound);
});

// POST /api/inbox/summarize - AI Conversation Summary & Stage Analysis
inboxRouter.post('/summarize', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { customerId, customerName, platform } = req.body;
  if (!customerId || !platform) {
    return res.status(400).json({ error: 'customerId and platform are required' });
  }

  const allUserMessages = db.getMessages(user.id);
  const convMessages = allUserMessages.filter(
    (m) => m.platform === platform && m.customer_id === customerId
  );

  if (convMessages.length === 0) {
    return res.status(404).json({ error: 'No messages found for this conversation' });
  }

  // Find matching orders for this customer
  const userOrders = db.getOrders(user.id);
  const matchingOrders = userOrders.filter((o) => {
    const cleanMsgId = String(customerId).replace(/\D/g, '');
    const cleanOrderPhone = o.customer_phone ? o.customer_phone.replace(/\D/g, '') : '';
    const phoneMatch =
      cleanOrderPhone.length >= 8 &&
      cleanMsgId.length >= 8 &&
      (cleanMsgId.includes(cleanOrderPhone) || cleanOrderPhone.includes(cleanMsgId));
    const nameMatch = Boolean(
      o.customer_name &&
        customerName &&
        o.customer_name.toLowerCase().trim() === String(customerName).toLowerCase().trim()
    );
    return phoneMatch || nameMatch;
  });

  matchingOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const latestOrder = matchingOrders[0];

  const summaryResult = await summarizeConversation({
    userId: user.id,
    customerId,
    customerName: customerName || convMessages[convMessages.length - 1]?.customer_name || customerId,
    platform,
    messages: convMessages,
    latestOrderId: latestOrder?.id,
    latestOrderStatus: latestOrder?.status,
    orderPhone: latestOrder?.customer_phone,
    orderAddress: latestOrder?.customer_address,
    orderProductSummary: latestOrder?.product_summary
  });

  return res.json(summaryResult);
});

// POST /api/inbox/simulate-inbound - Simulate incoming message to test AI reply in inbox
inboxRouter.post('/simulate-inbound', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const subStatus = getUserSubscriptionStatus(user.id);
  if (subStatus.isGated) {
    return res.status(403).json({ error: 'Subscription expired. AI replies are disabled until plan is renewed.' });
  }

  const {
    platform,
    customerId,
    customerName,
    messageText,
    channelId,
    audioBase64,
    audioMimeType,
    imageBase64,
    imageMimeType,
    imageUrl,
    overrideSystemPrompt
  } = req.body;

  if (!platform || (!messageText && !audioBase64 && !imageBase64 && !imageUrl)) {
    return res.status(400).json({ error: 'platform and either messageText, audio, or image are required' });
  }

  // Find or pick channel belonging to this user
  let channel = channelId ? db.getChannelById(channelId) : undefined;
  if (!channel || channel.user_id !== user.id) {
    channel = db.getChannels(user.id).find((c) => c.platform === platform && c.is_active);
  }

  const defaultIdentifier =
    platform === 'whatsapp'
      ? `sim_wa_${user.id}`
      : platform === 'messenger'
      ? `sim_fb_${user.id}`
      : `sim_ig_${user.id}`;

  const defaultCustomerId =
    platform === 'whatsapp'
      ? '+88017' + Math.floor(10000000 + Math.random() * 90000000)
      : platform === 'messenger'
      ? 'psid_' + Math.floor(1000000000 + Math.random() * 9000000000)
      : 'igsid_' + Math.floor(1000000000 + Math.random() * 9000000000);

  const identifier = channel?.identifier || defaultIdentifier;

  const result = await handleInboundWebhook({
    platform,
    identifier,
    customerId: customerId || defaultCustomerId,
    customerName: customerName || 'Interested Customer',
    messageText: messageText ? messageText.trim() : (audioBase64 ? '🎙️ [Voice Message]' : (imageBase64 || imageUrl) ? '📷 [Product Photo Inquiry]' : ''),
    audioBase64,
    audioMimeType,
    imageBase64,
    imageMimeType,
    imageUrl,
    userId: user.id,
    overrideSystemPrompt
  });

  return res.json({
    success: true,
    ...result
  });
});

// POST /api/inbox/customer-control - Pause/Resume AI or Block/Unblock a specific customer
inboxRouter.post('/customer-control', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { customerId, platform, action, value } = req.body || {};
  if (!customerId || !action) {
    return res.status(400).json({ error: 'customerId and action are required' });
  }

  const profile = db.getProfileById(user.id);
  const currentSettings = profile?.automation_settings || {
    auto_comment_reply_enabled: true,
    public_comment_reply_template: '',
    send_private_inbox_on_comment: true,
    auto_followup_enabled: true,
    followup_delay_minutes: 45,
    followup_message_template: ''
  };

  const key = platform ? `${platform}_${customerId}` : String(customerId);
  let paused = Array.from(new Set(currentSettings.paused_customers || []));
  let blocked = Array.from(new Set(currentSettings.blocked_customers || []));

  if (action === 'pause_ai') {
    const shouldPause = value !== undefined ? Boolean(value) : true;
    if (shouldPause) {
      if (!paused.includes(customerId)) paused.push(customerId);
      if (!paused.includes(key)) paused.push(key);
    } else {
      paused = paused.filter((id) => id !== customerId && id !== key);
    }
  } else if (action === 'resume_ai') {
    paused = paused.filter((id) => id !== customerId && id !== key);
  } else if (action === 'block' || action === 'block_customer') {
    const shouldBlock = value !== undefined ? Boolean(value) : true;
    if (shouldBlock) {
      if (!blocked.includes(customerId)) blocked.push(customerId);
      if (!blocked.includes(key)) blocked.push(key);
    } else {
      blocked = blocked.filter((id) => id !== customerId && id !== key);
    }
  } else if (action === 'unblock') {
    blocked = blocked.filter((id) => id !== customerId && id !== key);
  }

  const updatedSettings = {
    ...currentSettings,
    paused_customers: paused,
    blocked_customers: blocked
  };

  db.updateProfile(user.id, { automation_settings: updatedSettings });

  return res.json({
    success: true,
    customerId,
    isAiPaused: paused.includes(customerId) || paused.includes(key),
    isBlocked: blocked.includes(customerId) || blocked.includes(key),
    paused_customers: paused,
    blocked_customers: blocked
  });
});

// Helper to compute WhatsApp & VIP Broadcast Quota per 24 hours
function computeWhatsAppBroadcastQuota(userId: string) {
  const profile = db.getProfileById(userId);
  const autoSettings = profile?.automation_settings;
  const dailyLimit = Math.max(1, Number(autoSettings?.daily_whatsapp_vip_limit) || 50);
  const perCustomerDailyLimit = Math.max(1, Number(autoSettings?.per_customer_daily_limit) || 1);
  const enforce24hWindow =
    autoSettings?.enforce_whatsapp_24h_window !== undefined
      ? Boolean(autoSettings.enforce_whatsapp_24h_window)
      : true;

  const nowMs = Date.now();
  const window24hMs = 24 * 60 * 60 * 1000;
  const allMessages = db.getMessages(userId);

  const recentBroadcasts = allMessages.filter(
    (m) =>
      m.direction === 'outbound' &&
      m.id.includes('_bcast_') &&
      nowMs - new Date(m.created_at).getTime() <= window24hMs
  );

  const usedToday = recentBroadcasts.length;
  const remainingToday = Math.max(0, dailyLimit - usedToday);
  const isLimitReached = remainingToday <= 0;

  const customerCountMap = new Map<string, number>();
  let oldestBroadcastMs = nowMs;
  for (const b of recentBroadcasts) {
    const key = `${b.platform}_${b.customer_id}`;
    customerCountMap.set(key, (customerCountMap.get(key) || 0) + 1);
    customerCountMap.set(b.customer_id, (customerCountMap.get(b.customer_id) || 0) + 1);
    const t = new Date(b.created_at).getTime();
    if (t < oldestBroadcastMs) oldestBroadcastMs = t;
  }

  const messagedCustomerIdsToday = Array.from(customerCountMap.entries())
    .filter(([, count]) => count >= perCustomerDailyLimit)
    .map(([id]) => id);

  const nextResetAt =
    recentBroadcasts.length > 0
      ? new Date(oldestBroadcastMs + window24hMs).toISOString()
      : new Date(nowMs + window24hMs).toISOString();

  return {
    dailyLimit,
    perCustomerDailyLimit,
    enforce24hWindow,
    usedToday,
    remainingToday,
    isLimitReached,
    messagedCustomerIdsToday,
    nextResetAt,
    customerCountMap
  };
}

// GET /api/inbox/broadcast-quota - Get WhatsApp & VIP Broadcast Limit Status
inboxRouter.get('/broadcast-quota', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const quota = computeWhatsAppBroadcastQuota(user.id);
  return res.json({
    dailyLimit: quota.dailyLimit,
    perCustomerDailyLimit: quota.perCustomerDailyLimit,
    enforce24hWindow: quota.enforce24hWindow,
    usedToday: quota.usedToday,
    remainingToday: quota.remainingToday,
    isLimitReached: quota.isLimitReached,
    messagedCustomerIdsToday: quota.messagedCustomerIdsToday,
    nextResetAt: quota.nextResetAt
  });
});

// PUT /api/inbox/broadcast-quota - Configure WhatsApp Daily VIP Broadcast Limit Rules
inboxRouter.put('/broadcast-quota', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { dailyLimit, perCustomerDailyLimit, enforce24hWindow } = req.body || {};
  const current = db.getAutomationSettings(user.id);
  const updated = db.updateAutomationSettings(user.id, {
    ...current,
    daily_whatsapp_vip_limit:
      dailyLimit !== undefined ? Math.min(1000, Math.max(1, Number(dailyLimit) || 50)) : current.daily_whatsapp_vip_limit,
    per_customer_daily_limit:
      perCustomerDailyLimit !== undefined
        ? Math.min(2, Math.max(1, Number(perCustomerDailyLimit) || 1))
        : current.per_customer_daily_limit,
    enforce_whatsapp_24h_window:
      enforce24hWindow !== undefined ? Boolean(enforce24hWindow) : current.enforce_whatsapp_24h_window
  });

  const quota = computeWhatsAppBroadcastQuota(user.id);
  return res.json({
    success: true,
    settings: updated,
    quota: {
      dailyLimit: quota.dailyLimit,
      perCustomerDailyLimit: quota.perCustomerDailyLimit,
      enforce24hWindow: quota.enforce24hWindow,
      usedToday: quota.usedToday,
      remainingToday: quota.remainingToday,
      isLimitReached: quota.isLimitReached,
      messagedCustomerIdsToday: quota.messagedCustomerIdsToday,
      nextResetAt: quota.nextResetAt
    },
    message: `WhatsApp VIP messaging limit updated to ${quota.dailyLimit} messages per 24 hours.`
  });
});

// POST /api/inbox/broadcast-segment - Send targeted offer/follow-up broadcast to a customer segment or single VIP
inboxRouter.post('/broadcast-segment', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const {
    segment = 'unordered',
    platformFilter,
    platform,
    messageTemplate,
    messageText,
    targetCustomerId
  } = req.body || {};
  const finalPlatformFilter = platformFilter || platform || 'all';
  const finalMessage = String(messageText || messageTemplate || '').trim();

  if (!finalMessage) {
    return res.status(400).json({ error: 'Broadcast message text is required' });
  }

  // 1. Check Official WhatsApp Daily Broadcast Quota First
  const quotaBefore = computeWhatsAppBroadcastQuota(user.id);
  if (quotaBefore.isLimitReached || quotaBefore.remainingToday <= 0) {
    return res.status(429).json({
      success: false,
      limitReached: true,
      reason: 'daily_quota_exceeded',
      usedToday: quotaBefore.usedToday,
      dailyLimit: quotaBefore.dailyLimit,
      remainingToday: 0,
      nextResetAt: quotaBefore.nextResetAt,
      error: `Daily WhatsApp & VIP Messaging Limit Reached (${quotaBefore.usedToday}/${quotaBefore.dailyLimit} sent in 24h). According to WhatsApp Business anti-ban rules, you cannot send more promotional messages until the 24-hour quota resets.`
    });
  }

  const allMessages = db.getMessages(user.id);
  const userOrders = db.getOrders(user.id);
  const userChannels = db.getChannels(user.id);
  const profile = db.getProfileById(user.id);
  const blockedList = profile?.automation_settings?.blocked_customers || [];

  // Group unique customers
  const customerMap = new Map<
    string,
    {
      customerId: string;
      customerName: string;
      platform: 'whatsapp' | 'messenger' | 'instagram';
      channelId?: string;
      hasOrdered: boolean;
      isVip: boolean;
    }
  >();

  for (const msg of allMessages) {
    const key = `${msg.platform}_${msg.customer_id}`;
    if (blockedList.includes(msg.customer_id) || blockedList.includes(key)) continue;
    if (finalPlatformFilter !== 'all' && msg.platform !== finalPlatformFilter) continue;

    if (!customerMap.has(key)) {
      const matchingOrders = userOrders.filter((o) => {
        if (o.status === 'cancelled') return false;
        const cleanMsgId = msg.customer_id.replace(/\D/g, '');
        const cleanOrderPhone = o.customer_phone ? o.customer_phone.replace(/\D/g, '') : '';
        const phoneMatch =
          cleanOrderPhone.length >= 8 &&
          cleanMsgId.length >= 8 &&
          (cleanMsgId.includes(cleanOrderPhone) || cleanOrderPhone.includes(cleanMsgId));
        const nameMatch = Boolean(
          o.customer_name &&
            msg.customer_name &&
            o.customer_name.toLowerCase().trim() === msg.customer_name.toLowerCase().trim()
        );
        return o.customer_id === msg.customer_id || phoneMatch || nameMatch;
      });

      const totalSpent = matchingOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
      const isVip = matchingOrders.some((o) => o.is_vip) || matchingOrders.length >= 2 || totalSpent >= 3000;

      customerMap.set(key, {
        customerId: msg.customer_id,
        customerName: msg.customer_name || 'Valued Customer',
        platform: msg.platform,
        channelId: msg.channel_id,
        hasOrdered: matchingOrders.length > 0,
        isVip
      });
    } else {
      const existing = customerMap.get(key)!;
      if (msg.channel_id) existing.channelId = msg.channel_id;
      if (msg.customer_name && msg.customer_name !== 'Customer') {
        existing.customerName = msg.customer_name;
      }
    }
  }

  const rawTargets = Array.from(customerMap.values()).filter((c) => {
    if (targetCustomerId) {
      return c.customerId === targetCustomerId || `${c.platform}_${c.customerId}` === targetCustomerId;
    }
    if (segment === 'unordered') return !c.hasOrdered;
    if (segment === 'buyers' || segment === 'ordered') return c.hasOrdered;
    if (segment === 'vip') return c.isVip;
    return true; // 'all'
  });

  if (rawTargets.length === 0) {
    return res.status(400).json({
      error: 'No eligible customers found in this segment.'
    });
  }

  // 2. Enforce Per-Customer 24h Cooldown Rule (Max N promo messages per customer per 24h)
  let skippedCooldownCount = 0;
  const cooldownFilteredTargets = rawTargets.filter((c) => {
    const key = `${c.platform}_${c.customerId}`;
    const sentToCustomerToday = quotaBefore.customerCountMap.get(key) || 0;
    if (sentToCustomerToday >= quotaBefore.perCustomerDailyLimit) {
      skippedCooldownCount++;
      return false;
    }
    return true;
  });

  if (cooldownFilteredTargets.length === 0 && skippedCooldownCount > 0) {
    return res.status(429).json({
      success: false,
      limitReached: true,
      reason: 'customer_cooldown_reached',
      usedToday: quotaBefore.usedToday,
      dailyLimit: quotaBefore.dailyLimit,
      remainingToday: quotaBefore.remainingToday,
      skippedCooldownCount,
      nextResetAt: quotaBefore.nextResetAt,
      error:
        targetCustomerId
          ? `WhatsApp Rule Limit Reached: This VIP customer has already received ${quotaBefore.perCustomerDailyLimit} promotional message(s) in the last 24 hours. Please wait 24 hours before messaging them again.`
          : `WhatsApp Anti-Spam Limit Reached: All ${skippedCooldownCount} customer(s) in this segment have already received their daily promotional message within the last 24 hours.`
    });
  }

  // 3. Cap batch to remaining daily WhatsApp quota
  const targets = cooldownFilteredTargets.slice(0, quotaBefore.remainingToday);
  const cappedByDailyLimitCount = Math.max(0, cooldownFilteredTargets.length - targets.length);

  let sentCount = 0;
  let outsideWindowCount = 0;

  for (const target of targets) {
    const personalizedText = finalMessage
      .replace(/\{customer_name\}/gi, target.customerName || 'Valued Customer')
      .trim();

    // Always prefer an active, non-demo connected channel for the target platform
    const activeChannel =
      (target.channelId
        ? userChannels.find(
            (ch) => ch.id === target.channelId && ch.is_active && !ch.access_token?.includes('demo')
          )
        : undefined) ||
      userChannels.find(
        (ch) => ch.platform === target.platform && ch.is_active && !ch.access_token?.includes('demo')
      ) ||
      (target.channelId ? userChannels.find((ch) => ch.id === target.channelId && ch.is_active) : undefined) ||
      userChannels.find((ch) => ch.platform === target.platform && ch.is_active);

    let deliveryResult: { ok: boolean; outsideWindow?: boolean; error?: string } = { ok: true };
    if (activeChannel) {
      try {
        deliveryResult = await sendManualMetaMessage(activeChannel, target.customerId, {
          text: personalizedText
        });
        // Small pacing delay (120ms) to avoid Meta Graph API burst rate limits
        if (targets.length > 1) {
          await new Promise((resolve) => setTimeout(resolve, 120));
        }
      } catch (e) {
        console.warn(`[Broadcast Segment] Meta delivery warning for ${target.customerId}:`, e);
        deliveryResult = { ok: false };
      }
    }

    if (deliveryResult.outsideWindow) {
      outsideWindowCount++;
    }

    if (deliveryResult.ok) {
      db.createMessage({
        id: `msg_${Date.now()}_bcast_${Math.random().toString(36).substring(2, 6)}`,
        user_id: user.id,
        channel_id: activeChannel?.id || target.channelId,
        platform: target.platform,
        customer_id: target.customerId,
        customer_name: target.customerName,
        direction: 'outbound',
        message_text: personalizedText,
        is_ai_reply: false,
        status: 'sent',
        created_at: new Date().toISOString()
      });
      sentCount++;
    }
  }

  const quotaAfter = computeWhatsAppBroadcastQuota(user.id);

  let summaryMessage = `Successfully sent VIP/Offer broadcast message to ${sentCount} customer(s)! (${quotaAfter.remainingToday} of ${quotaAfter.dailyLimit} daily WhatsApp quota remaining)`;
  if (quotaAfter.isLimitReached) {
    summaryMessage = `Sent to ${sentCount} customer(s) — Daily WhatsApp Limit (${quotaAfter.usedToday}/${quotaAfter.dailyLimit}) is now REACHED! Further broadcasts are locked for 24 hours.`;
  } else if (skippedCooldownCount > 0) {
    summaryMessage = `Sent to ${sentCount} customer(s)! (${skippedCooldownCount} customer(s) skipped because they already received today's broadcast within 24h)`;
  } else if (outsideWindowCount > 0) {
    summaryMessage = `Delivered to ${sentCount} active customer(s)! (${outsideWindowCount} skipped by Meta 24-hour messaging window rule)`;
  }

  return res.json({
    success: true,
    sentCount,
    outsideWindowCount,
    skippedCooldownCount,
    cappedByDailyLimitCount,
    totalTargeted: rawTargets.length,
    segment,
    quota: {
      dailyLimit: quotaAfter.dailyLimit,
      perCustomerDailyLimit: quotaAfter.perCustomerDailyLimit,
      enforce24hWindow: quotaAfter.enforce24hWindow,
      usedToday: quotaAfter.usedToday,
      remainingToday: quotaAfter.remainingToday,
      isLimitReached: quotaAfter.isLimitReached,
      messagedCustomerIdsToday: quotaAfter.messagedCustomerIdsToday,
      nextResetAt: quotaAfter.nextResetAt
    },
    message: summaryMessage
  });
});
