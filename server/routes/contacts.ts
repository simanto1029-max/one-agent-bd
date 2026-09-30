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

  const contactsMap = new Map<string, {
    customerId: string;
    customerName: string;
    platform: 'whatsapp' | 'messenger' | 'instagram';
    channelId?: string;
    totalMessages: number;
    lastContactDate: string;
    lastMessage: string;
    hasOrdered: boolean;
    totalOrders: number;
    totalSpent: number;
    isVip: boolean;
    isBlocked: boolean;
    isAiPaused: boolean;
  }>();

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

      contactsMap.set(key, {
        customerId: msg.customer_id,
        customerName: msg.customer_name || msg.customer_id,
        platform: msg.platform,
        channelId: msg.channel_id,
        totalMessages: 0,
        lastContactDate: msg.created_at,
        lastMessage: msg.message_text,
        hasOrdered: validOrders.length > 0,
        totalOrders: validOrders.length,
        totalSpent,
        isVip,
        isBlocked: blockedList.includes(msg.customer_id) || blockedList.includes(key),
        isAiPaused: pausedList.includes(msg.customer_id) || pausedList.includes(key)
      });
    }

    const contact = contactsMap.get(key)!;
    contact.totalMessages += 1;
    if (new Date(msg.created_at).getTime() > new Date(contact.lastContactDate).getTime()) {
      contact.lastContactDate = msg.created_at;
      contact.lastMessage = msg.message_text;
    }
  }

  const contacts = Array.from(contactsMap.values()).sort(
    (a, b) => new Date(b.lastContactDate).getTime() - new Date(a.lastContactDate).getTime()
  );

  return res.json(contacts);
});
