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
  const contactsMap = new Map<string, {
    customerId: string;
    customerName: string;
    platform: 'whatsapp' | 'messenger' | 'instagram';
    channelId?: string;
    totalMessages: number;
    lastContactDate: string;
    lastMessage: string;
  }>();

  for (const msg of messages) {
    const key = `${msg.platform}_${msg.customer_id}`;
    if (!contactsMap.has(key)) {
      contactsMap.set(key, {
        customerId: msg.customer_id,
        customerName: msg.customer_name || msg.customer_id,
        platform: msg.platform,
        channelId: msg.channel_id,
        totalMessages: 0,
        lastContactDate: msg.created_at,
        lastMessage: msg.message_text
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
