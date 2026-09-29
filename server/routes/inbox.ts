import { Router, Request, Response } from 'express';
import { db, Message } from '../db/database.js';
import { getAuthenticatedUser } from './auth.js';
import { handleInboundWebhook } from '../services/metaService.js';
import { getUserSubscriptionStatus } from '../services/subscriptionService.js';
import { summarizeConversation } from '../services/aiService.js';

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
        return phoneMatch || nameMatch;
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
        latestOrderStatus
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

// POST /api/inbox/reply - Manual agent reply
inboxRouter.post('/reply', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const subStatus = getUserSubscriptionStatus(user.id);
  if (subStatus.isGated) {
    return res.status(403).json({ error: 'Subscription expired. Please renew to send messages.' });
  }

  const { customerId, customerName, platform, channelId, messageText } = req.body;
  if (!customerId || !platform || !messageText) {
    return res.status(400).json({ error: 'customerId, platform, and messageText are required' });
  }

  const outbound: Message = db.createMessage({
    id: `msg_${Date.now()}_agent_${Math.random().toString(36).substring(2, 6)}`,
    user_id: user.id,
    channel_id: channelId,
    platform,
    customer_id: customerId,
    customer_name: customerName,
    direction: 'outbound',
    message_text: messageText.trim(),
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
