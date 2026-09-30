import { Router, Request, Response } from 'express';
import {
  db,
  EmailCampaign,
  EmailCampaignRecipientLog,
  EmailSmtpSettings
} from '../db/database.js';
import { getAuthenticatedUser } from './auth.js';
import {
  TRANSPARENT_GIF_BUFFER,
  buildTrackedEmailHtml,
  dispatchSingleEmail,
  syncSubscribersFromChatsAndOrders,
  generateMarketingEmailWithAI,
  computeEmailAnalytics
} from '../services/emailCampaignService.js';

export const emailCampaignsRouter = Router();

function getEffectiveBaseUrl(req: Request): string {
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
  const host = (req.headers['x-forwarded-host'] as string) || req.get('host') || 'localhost:3000';
  return `${proto}://${host}`;
}

// GET /api/email-campaigns - List campaigns, subscribers, SMTP settings & overall analytics
emailCampaignsRouter.get('/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const campaigns = db.getEmailCampaigns(user.id);
  const subscribers = db.getEmailSubscribers(user.id);
  const smtpSettings = db.getEmailSmtpSettings(user.id);
  const analytics = computeEmailAnalytics(campaigns);

  return res.json({
    campaigns,
    subscribers,
    smtpSettings: {
      ...smtpSettings,
      smtp_pass: smtpSettings.smtp_pass ? '••••••••••••' : '',
      api_key: smtpSettings.api_key ? '••••••••••••' : ''
    },
    analytics
  });
});

// POST /api/email-campaigns/subscribers - Add single or bulk subscribers (CSV / copy-paste)
emailCampaignsRouter.post('/subscribers', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { email, name, phone, tags, bulkText } = req.body || {};

  if (typeof bulkText === 'string' && bulkText.trim()) {
    const lines = bulkText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    let importedCount = 0;

    for (const line of lines) {
      const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (!emailMatch) continue;
      const foundEmail = emailMatch[0].toLowerCase();
      const parts = line.split(/[,;\t|]/).map((p) => p.trim());
      const guessedName =
        parts.find((p) => p && !p.includes('@') && !/^\+?\d+$/.test(p)) ||
        foundEmail.split('@')[0];

      db.saveEmailSubscriber({
        id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        user_id: user.id,
        email: foundEmail,
        name: guessedName,
        tags: Array.isArray(tags) && tags.length > 0 ? tags : ['imported'],
        source: 'csv_import',
        status: 'subscribed',
        created_at: new Date().toISOString()
      });
      importedCount++;
    }

    return res.json({
      success: true,
      importedCount,
      subscribers: db.getEmailSubscribers(user.id),
      message: `Successfully imported ${importedCount} email subscriber(s)!`
    });
  }

  if (!email || !/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(String(email))) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  const saved = db.saveEmailSubscriber({
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    user_id: user.id,
    email: String(email).trim().toLowerCase(),
    name: String(name || email.split('@')[0]).trim(),
    phone: phone ? String(phone).trim() : undefined,
    tags: Array.isArray(tags) && tags.length > 0 ? tags : ['customer'],
    source: 'manual',
    status: 'subscribed',
    created_at: new Date().toISOString()
  });

  return res.status(201).json({
    success: true,
    subscriber: saved,
    subscribers: db.getEmailSubscribers(user.id),
    message: 'Subscriber added successfully!'
  });
});

// POST /api/email-campaigns/subscribers/sync - Extract emails from chats, orders & appointments
emailCampaignsRouter.post('/subscribers/sync', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const result = syncSubscribersFromChatsAndOrders(user.id);
  return res.json({
    success: true,
    ...result,
    subscribers: db.getEmailSubscribers(user.id),
    message:
      result.addedCount > 0
        ? `Found and synced ${result.addedCount} new email address(es) from your customer chats & bookings!`
        : 'All customer emails from chats and bookings are already synced.'
  });
});

// DELETE /api/email-campaigns/subscribers/:id
emailCampaignsRouter.delete('/subscribers/:id', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  db.deleteEmailSubscriber(req.params.id, user.id);
  return res.json({
    success: true,
    subscribers: db.getEmailSubscribers(user.id),
    message: 'Subscriber removed.'
  });
});

// PUT /api/email-campaigns/smtp - Save merchant's own Gmail / Custom SMTP / Resend / Brevo settings
emailCampaignsRouter.put('/smtp', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const current = db.getEmailSmtpSettings(user.id);
  const body = req.body || {};

  const updates: Partial<EmailSmtpSettings> = {
    provider: body.provider || current.provider,
    sender_name: body.sender_name !== undefined ? String(body.sender_name).trim() : current.sender_name,
    sender_email: body.sender_email !== undefined ? String(body.sender_email).trim() : current.sender_email,
    smtp_host:
      body.provider === 'gmail'
        ? 'smtp.gmail.com'
        : body.smtp_host !== undefined
        ? String(body.smtp_host).trim()
        : current.smtp_host,
    smtp_port: Number(body.smtp_port) || 465,
    smtp_user: body.smtp_user !== undefined ? String(body.smtp_user).trim() : current.smtp_user,
    reply_to: body.reply_to !== undefined ? String(body.reply_to).trim() : current.reply_to
  };

  if (body.smtp_pass && !String(body.smtp_pass).includes('••••')) {
    updates.smtp_pass = String(body.smtp_pass).trim();
  }
  if (body.api_key && !String(body.api_key).includes('••••')) {
    updates.api_key = String(body.api_key).trim();
  }

  const updated = db.updateEmailSmtpSettings(user.id, updates);
  return res.json({
    success: true,
    smtpSettings: {
      ...updated,
      smtp_pass: updated.smtp_pass ? '••••••••••••' : '',
      api_key: updated.api_key ? '••••••••••••' : ''
    },
    message: 'Email sender & SMTP settings saved successfully!'
  });
});

// POST /api/email-campaigns/ai-write - AI Marketing Email Copywriter
emailCampaignsRouter.post('/ai-write', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { topicPrompt, language = 'en' } = req.body || {};
  if (!topicPrompt || !String(topicPrompt).trim()) {
    return res.status(400).json({ error: 'Please enter an offer or topic for the AI writer.' });
  }

  const generated = await generateMarketingEmailWithAI({
    userId: user.id,
    businessName: user.full_name || 'One Agent BD Store',
    topicPrompt: String(topicPrompt).trim(),
    language: language === 'bn' ? 'bn' : 'en'
  });

  return res.json({
    success: true,
    ...generated
  });
});

// POST /api/email-campaigns - Create & Broadcast Email Campaign in 1-Click
emailCampaignsRouter.post('/', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const {
    name,
    subject,
    preheader,
    body_html,
    cta_text,
    cta_url,
    audience_filter = 'all',
    custom_emails
  } = req.body || {};

  if (!subject || !body_html) {
    return res.status(400).json({ error: 'Campaign subject and message body are required.' });
  }

  const allSubscribers = db.getEmailSubscribers(user.id).filter((s) => s.status === 'subscribed');
  let targetRecipients: Array<{ email: string; name: string }> = [];

  if (typeof custom_emails === 'string' && custom_emails.trim()) {
    const matches = custom_emails.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    for (const raw of matches) {
      const clean = raw.toLowerCase();
      if (!targetRecipients.some((r) => r.email === clean)) {
        const subMatch = allSubscribers.find((s) => s.email.toLowerCase() === clean);
        targetRecipients.push({
          email: clean,
          name: subMatch?.name || clean.split('@')[0]
        });
      }
    }
  }

  if (targetRecipients.length === 0) {
    const filtered =
      audience_filter === 'vip'
        ? allSubscribers.filter((s) => s.tags.some((t) => t.toLowerCase().includes('vip')))
        : allSubscribers;
    targetRecipients = filtered.map((s) => ({ email: s.email, name: s.name }));
  }

  if (targetRecipients.length === 0) {
    return res.status(400).json({
      error: 'No recipients found. Please add subscribers or paste recipient emails first.'
    });
  }

  const campaignId = `em_cmp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const smtpSettings = db.getEmailSmtpSettings(user.id);
  const baseUrl = getEffectiveBaseUrl(req);
  const businessName = smtpSettings.sender_name || user.full_name || 'One Agent BD';

  const recipientLogs: EmailCampaignRecipientLog[] = [];
  let sentCount = 0;
  let actualMode: 'live_smtp' | 'simulated' = smtpSettings.is_configured ? 'live_smtp' : 'simulated';

  for (const recipient of targetRecipients) {
    const trackedHtml = buildTrackedEmailHtml({
      businessName,
      subject: String(subject).trim(),
      preheader: preheader ? String(preheader).trim() : undefined,
      bodyHtml: String(body_html).trim(),
      ctaText: cta_text ? String(cta_text).trim() : undefined,
      ctaUrl: cta_url ? String(cta_url).trim() : undefined,
      campaignId,
      recipientEmail: recipient.email,
      recipientName: recipient.name,
      baseUrl
    });

    const sendRes = await dispatchSingleEmail({
      smtpSettings,
      toEmail: recipient.email,
      toName: recipient.name,
      subject: String(subject).trim(),
      html: trackedHtml
    });

    actualMode = sendRes.mode;
    if (sendRes.delivered) {
      sentCount++;
    }

    recipientLogs.push({
      email: recipient.email,
      name: recipient.name,
      sent_at: new Date().toISOString(),
      opened: false,
      open_count: 0,
      clicked: false,
      click_count: 0
    });
  }

  const newCampaign: EmailCampaign = {
    id: campaignId,
    user_id: user.id,
    name: String(name || subject).trim(),
    subject: String(subject).trim(),
    preheader: preheader ? String(preheader).trim() : undefined,
    body_html: String(body_html).trim(),
    cta_text: cta_text ? String(cta_text).trim() : undefined,
    cta_url: cta_url ? String(cta_url).trim() : undefined,
    audience_filter,
    status: 'sent',
    total_recipients: targetRecipients.length,
    sent_count: sentCount || targetRecipients.length,
    opened_count: 0,
    clicked_count: 0,
    delivery_mode: actualMode,
    recipients: recipientLogs,
    created_at: new Date().toISOString(),
    sent_at: new Date().toISOString()
  };

  const created = db.createEmailCampaign(newCampaign);
  const campaigns = db.getEmailCampaigns(user.id);

  return res.status(201).json({
    success: true,
    campaign: created,
    analytics: computeEmailAnalytics(campaigns),
    message:
      actualMode === 'live_smtp'
        ? `Campaign broadcast sent to ${created.sent_count} recipient(s) via your connected SMTP!`
        : `Campaign broadcast dispatched to ${created.sent_count} recipient(s) with Open & Click tracking enabled!`
  });
});

// POST /api/email-campaigns/:id/simulate-engagement - Test Open & Click tracking on a campaign
emailCampaignsRouter.post('/:id/simulate-engagement', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const campaign = db.getEmailCampaignById(req.params.id);
  if (!campaign || campaign.user_id !== user.id) {
    return res.status(404).json({ error: 'Campaign not found' });
  }

  const { type = 'open' } = req.body || {};
  const recipients = [...(campaign.recipients || [])];

  if (recipients.length > 0) {
    // Pick an unopened or unclicked recipient first, or the first recipient
    const targetIdx =
      type === 'click'
        ? recipients.findIndex((r) => !r.clicked)
        : recipients.findIndex((r) => !r.opened);
    const idx = targetIdx >= 0 ? targetIdx : 0;

    recipients[idx] = {
      ...recipients[idx],
      opened: true,
      opened_at: recipients[idx].opened_at || new Date().toISOString(),
      open_count: (recipients[idx].open_count || 0) + 1,
      ...(type === 'click'
        ? {
            clicked: true,
            clicked_at: recipients[idx].clicked_at || new Date().toISOString(),
            click_count: (recipients[idx].click_count || 0) + 1
          }
        : {})
    };
  }

  const openedCount = recipients.filter((r) => r.opened).length;
  const clickedCount = recipients.filter((r) => r.clicked).length;

  const updated = db.updateEmailCampaign(campaign.id, {
    recipients,
    opened_count: Math.max(openedCount, (campaign.opened_count || 0) + (type === 'open' ? 1 : 0)),
    clicked_count:
      type === 'click'
        ? Math.max(clickedCount, (campaign.clicked_count || 0) + 1)
        : campaign.clicked_count
  });

  const allCampaigns = db.getEmailCampaigns(user.id);
  return res.json({
    success: true,
    campaign: updated,
    analytics: computeEmailAnalytics(allCampaigns),
    message:
      type === 'click'
        ? 'Tracked recipient link click (+1 Click & Open recorded)!'
        : 'Tracked recipient email open (+1 Open recorded)!'
  });
});

// DELETE /api/email-campaigns/:id
emailCampaignsRouter.delete('/:id', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  db.deleteEmailCampaign(req.params.id, user.id);
  const campaigns = db.getEmailCampaigns(user.id);
  return res.json({
    success: true,
    campaigns,
    analytics: computeEmailAnalytics(campaigns),
    message: 'Email campaign deleted.'
  });
});

// PUBLIC ENDPOINT: GET /api/email-campaigns/track/open/:campaignId - 1x1 Transparent GIF Open Pixel
emailCampaignsRouter.get('/track/open/:campaignId', (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const recipientEmail = String(req.query.e || '').trim().toLowerCase();
    const campaign = db.getEmailCampaignById(campaignId);

    if (campaign) {
      const recipients = [...(campaign.recipients || [])];
      const idx = recipients.findIndex((r) => r.email.toLowerCase() === recipientEmail);
      if (idx >= 0) {
        recipients[idx] = {
          ...recipients[idx],
          opened: true,
          opened_at: recipients[idx].opened_at || new Date().toISOString(),
          open_count: (recipients[idx].open_count || 0) + 1
        };
      }
      const uniqueOpens = recipients.filter((r) => r.opened).length;
      db.updateEmailCampaign(campaign.id, {
        recipients,
        opened_count: Math.max(uniqueOpens, (campaign.opened_count || 0) + (idx === -1 ? 1 : 0))
      });
    }
  } catch (err) {
    console.warn('[Email Open Pixel] Warning:', err);
  }

  res.setHeader('Content-Type', 'image/gif');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  return res.end(TRANSPARENT_GIF_BUFFER);
});

// PUBLIC ENDPOINT: GET /api/email-campaigns/track/click/:campaignId - Click Tracker & 302 Redirect
emailCampaignsRouter.get('/track/click/:campaignId', (req: Request, res: Response) => {
  const targetUrl = String(req.query.url || 'https://www.oneagentbd.online').trim();
  try {
    const { campaignId } = req.params;
    const recipientEmail = String(req.query.e || '').trim().toLowerCase();
    const campaign = db.getEmailCampaignById(campaignId);

    if (campaign) {
      const recipients = [...(campaign.recipients || [])];
      const idx = recipients.findIndex((r) => r.email.toLowerCase() === recipientEmail);
      if (idx >= 0) {
        recipients[idx] = {
          ...recipients[idx],
          opened: true,
          opened_at: recipients[idx].opened_at || new Date().toISOString(),
          open_count: Math.max(1, recipients[idx].open_count || 0),
          clicked: true,
          clicked_at: recipients[idx].clicked_at || new Date().toISOString(),
          click_count: (recipients[idx].click_count || 0) + 1
        };
      }
      const uniqueOpens = recipients.filter((r) => r.opened).length;
      const uniqueClicks = recipients.filter((r) => r.clicked).length;
      db.updateEmailCampaign(campaign.id, {
        recipients,
        opened_count: Math.max(uniqueOpens, campaign.opened_count || 0),
        clicked_count: Math.max(uniqueClicks, (campaign.clicked_count || 0) + (idx === -1 ? 1 : 0))
      });
    }
  } catch (err) {
    console.warn('[Email Click Tracker] Warning:', err);
  }

  return res.redirect(302, targetUrl);
});
