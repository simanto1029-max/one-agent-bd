import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { getAuthenticatedUser } from './auth.js';

export const contactsRouter = Router();

// GET /api/contacts
contactsRouter.get('/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const messages = db.getMessages(user.id);
  const userOrders = db.getOrders(user.id);
  const profile = db.getProfileById(user.id);
  const pausedList = profile?.automation_settings?.paused_customers || [];
  const blockedList = profile?.automation_settings?.blocked_customers || [];
  const nowMs = Date.now();
  const window24hMs = 24 * 60 * 60 * 1000;

  const allCustomerMeta = db.getAllCustomerMetadata(user.id);
  const metaMap = new Map<string, any>(allCustomerMeta.map((m) => [m.customer_id, m]));

  const contactsMap = new Map<
    string,
    {
      customerId: string;
      customerName: string;
      customerAvatar?: string;
      customerPhone?: string;
      customerAddress?: string;
      tags?: string[];
      notes?: string;
      platform: 'whatsapp' | 'messenger' | 'instagram';
      channelId?: string;
      totalMessages: number;
      lastContactDate: string;
      lastInboundDate?: string;
      lastMessage: string;
      hasOrdered: boolean;
      totalOrders: number;
      totalSpent: number;
      isVip: boolean;
      isBlocked: boolean;
      isAiPaused: boolean;
      within24hWindow: boolean;
      vipBroadcastSentToday: number;
      lastBroadcastAt?: string;
    }
  >();

  for (const msg of messages) {
    const key = `${msg.platform}_${msg.customer_id}`;
    if (!contactsMap.has(key)) {
      const matchingOrders = userOrders.filter((o) => {
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

      const validOrders = matchingOrders.filter((o) => o.status !== 'cancelled');
      const totalSpent = validOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
      const isVip = validOrders.some((o) => o.is_vip) || validOrders.length >= 2 || totalSpent >= 3000;
      const custMeta = metaMap.get(msg.customer_id) || metaMap.get(key);

      const resolvedName = custMeta?.customer_name || msg.customer_name || msg.customer_id;
      const resolvedPhone = custMeta?.customer_phone || matchingOrders[0]?.customer_phone;
      const resolvedAddress = custMeta?.customer_address || matchingOrders[0]?.customer_address;
      const resolvedTags = custMeta?.tags && custMeta.tags.length > 0 
        ? custMeta.tags 
        : isVip 
        ? ['VIP Client'] 
        : validOrders.length > 0 
        ? ['Top Client'] 
        : ['Prospect'];

      contactsMap.set(key, {
        customerId: msg.customer_id,
        customerName: resolvedName,
        customerAvatar: msg.customer_avatar,
        customerPhone: resolvedPhone,
        customerAddress: resolvedAddress,
        tags: resolvedTags,
        notes: custMeta?.notes || '',
        platform: msg.platform,
        channelId: msg.channel_id,
        totalMessages: 0,
        lastContactDate: msg.created_at,
        lastInboundDate: msg.direction === 'inbound' ? msg.created_at : undefined,
        lastMessage: msg.message_text,
        hasOrdered: validOrders.length > 0,
        totalOrders: validOrders.length,
        totalSpent,
        isVip,
        isBlocked: blockedList.includes(msg.customer_id) || blockedList.includes(key),
        isAiPaused: pausedList.includes(msg.customer_id) || pausedList.includes(key),
        within24hWindow: false,
        vipBroadcastSentToday: 0
      });
    }

    const contact = contactsMap.get(key)!;
    contact.totalMessages += 1;

    const msgTime = new Date(msg.created_at).getTime();
    if (msgTime > new Date(contact.lastContactDate).getTime()) {
      contact.lastContactDate = msg.created_at;
      contact.lastMessage = msg.message_text;
    }

    if (msg.direction === 'inbound') {
      if (!contact.lastInboundDate || msgTime > new Date(contact.lastInboundDate).getTime()) {
        contact.lastInboundDate = msg.created_at;
      }
    }

    if (msg.direction === 'outbound' && msg.id.includes('_bcast_') && nowMs - msgTime <= window24hMs) {
      contact.vipBroadcastSentToday += 1;
      if (!contact.lastBroadcastAt || msgTime > new Date(contact.lastBroadcastAt).getTime()) {
        contact.lastBroadcastAt = msg.created_at;
      }
    }
  }

  for (const contact of contactsMap.values()) {
    const refDate = contact.lastInboundDate || contact.lastContactDate;
    contact.within24hWindow = Boolean(
      refDate && nowMs - new Date(refDate).getTime() <= window24hMs
    );
  }

  const contacts = Array.from(contactsMap.values()).sort(
    (a, b) => new Date(b.lastContactDate).getTime() - new Date(a.lastContactDate).getTime()
  );

  return res.json(contacts);
});
