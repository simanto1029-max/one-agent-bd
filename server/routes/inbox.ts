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
        isBlocked
      });
    }
    const conv = conversationsMap.get(key)!;
    conv.messages.push(msg);
    conv.lastMessage = msg;
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
    return res.status(400).json({ error: 'customerId and action (pause_ai | block_customer) are required' });
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
    const shouldPause = value !== undefined ? Boolean(value) : !(paused.includes(customerId) || paused.includes(key));
    if (shouldPause) {
      if (!paused.includes(customerId)) paused.push(customerId);
      if (!paused.includes(key)) paused.push(key);
    } else {
      paused = paused.filter((id) => id !== customerId && id !== key);
    }
  } else if (action === 'block_customer') {
    const shouldBlock = value !== undefined ? Boolean(value) : !(blocked.includes(customerId) || blocked.includes(key));
    if (shouldBlock) {
      if (!blocked.includes(customerId)) blocked.push(customerId);
      if (!blocked.includes(key)) blocked.push(key);
    } else {
      blocked = blocked.filter((id) => id !== customerId && id !== key);
    }
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

// POST /api/inbox/broadcast-segment - Send targeted offer/follow-up broadcast to a customer segment
inboxRouter.post('/broadcast-segment', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { segment = 'unordered', platformFilter = 'all', messageTemplate } = req.body || {};
  if (!messageTemplate || !String(messageTemplate).trim()) {
    return res.status(400).json({ error: 'Broadcast message text is required' });
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
    if (platformFilter !== 'all' && msg.platform !== platformFilter) continue;

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
        customerName: msg.customer_name || 'প্রিয় গ্রাহক',
        platform: msg.platform,
        channelId: msg.channel_id,
        hasOrdered: matchingOrders.length > 0,
        isVip
      });
    }
  }

  const targets = Array.from(customerMap.values()).filter((c) => {
    if (segment === 'unordered') return !c.hasOrdered;
    if (segment === 'buyers') return c.hasOrdered;
    if (segment === 'vip') return c.isVip;
    return true; // 'all'
  });

  let sentCount = 0;
  for (const target of targets) {
    const personalizedText = String(messageTemplate)
      .replace(/\{customer_name\}/gi, target.customerName || 'প্রিয় গ্রাহক')
      .trim();

    const activeChannel =
      (target.channelId ? userChannels.find((ch) => ch.id === target.channelId) : undefined) ||
      userChannels.find((ch) => ch.platform === target.platform && ch.is_active);

    if (activeChannel) {
      try {
        await sendManualMetaMessage(activeChannel, target.customerId, {
          text: personalizedText
        });
      } catch (e) {
        console.warn(`[Broadcast Segment] Meta delivery warning for ${target.customerId}:`, e);
      }
    }

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

  return res.json({
    success: true,
    sentCount,
    segment,
    message: `সফলভাবে ${sentCount} জন কাস্টমারের ইনবক্সে অফার মেসেজ পাঠানো হয়েছে!`
  });
});
