import tls from 'tls';
import { GoogleGenAI } from '@google/genai';
import {
  db,
  EmailSmtpSettings,
  EmailSubscriber,
  EmailCampaign
} from '../db/database.js';

function getGeminiClient(userId?: string): GoogleGenAI {
  const userProfile = userId ? db.getProfileById(userId) : undefined;
  const sysSettings = db.getSettings() as any;
  const adminKey = db
    .getProfiles()
    .find((p) => p.role === 'admin' && p.llm_api_key?.trim())
    ?.llm_api_key?.trim();
  const apiKey =
    (userProfile?.llm_api_key && userProfile.llm_api_key.trim()) ||
    (sysSettings?.default_llm_api_key && sysSettings.default_llm_api_key.trim()) ||
    adminKey ||
    process.env.GEMINI_API_KEY ||
    '';
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });
}

// 43-byte 1x1 transparent GIF buffer for email open tracking
export const TRANSPARENT_GIF_BUFFER = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export function buildTrackedEmailHtml(params: {
  businessName: string;
  subject: string;
  preheader?: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  campaignId: string;
  recipientEmail: string;
  recipientName?: string;
  baseUrl: string;
}): string {
  const {
    businessName,
    subject,
    preheader,
    bodyHtml,
    ctaText,
    ctaUrl,
    campaignId,
    recipientEmail,
    recipientName,
    baseUrl
  } = params;

  const cleanBase = baseUrl.replace(/\/+$/, '');
  const openPixelUrl = `${cleanBase}/api/email-campaigns/track/open/${encodeURIComponent(
    campaignId
  )}?e=${encodeURIComponent(recipientEmail)}`;

  const trackedCtaUrl = ctaUrl
    ? `${cleanBase}/api/email-campaigns/track/click/${encodeURIComponent(
        campaignId
      )}?e=${encodeURIComponent(recipientEmail)}&url=${encodeURIComponent(ctaUrl)}`
    : '';

  const personalizedBody = bodyHtml
    .replace(/\{customer_name\}|\{name\}/gi, recipientName || 'Valued Customer')
    .replace(/\r?\n/g, '<br/>');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#F8F7FC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1E293B;">
  ${
    preheader
      ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>`
      : ''
  }
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F7FC;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#FFFFFF;border-radius:16px;border:1px solid #E2E8F0;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#7C3AED,#9333EA);padding:24px 32px;color:#FFFFFF;">
              <div style="font-size:18px;font-weight:800;letter-spacing:-0.02em;">${businessName}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;font-size:15px;line-height:1.65;color:#334155;">
              ${personalizedBody}
              ${
                trackedCtaUrl && ctaText
                  ? `<div style="margin-top:28px;margin-bottom:12px;">
                      <a href="${trackedCtaUrl}" style="display:inline-block;background-color:#7C3AED;color:#FFFFFF;font-weight:700;font-size:14px;text-decoration:none;padding:12px 26px;border-radius:10px;">
                        ${ctaText} &rarr;
                      </a>
                    </div>`
                  : ''
              }
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px;background-color:#F8FAFC;border-top:1px solid #E2E8F0;font-size:12px;color:#64748B;">
              Sent by <strong>${businessName}</strong>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <img src="${openPixelUrl}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />
</body>
</html>`;
}

/**
 * Native TLS SMTP client for port 465 (Gmail App Password & Custom SSL SMTP)
 */
async function sendViaNativeTlsSmtp(params: {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  html: string;
}): Promise<{ sent: boolean; error?: string }> {
  return new Promise((resolve) => {
    const timeoutMs = 10000;
    let settled = false;
    const finish = (res: { sent: boolean; error?: string }) => {
      if (settled) return;
      settled = true;
      resolve(res);
    };

    const socket = tls.connect(
      {
        host: params.host,
        port: params.port || 465,
        rejectUnauthorized: false
      },
      () => {
        // Connected
      }
    );

    socket.setTimeout(timeoutMs, () => {
      socket.destroy();
      finish({ sent: false, error: 'SMTP connection timed out' });
    });

    socket.on('error', (err) => {
      finish({ sent: false, error: err.message });
    });

    let step = 0;
    let buffer = '';

    const sendLine = (line: string) => {
      socket.write(line + '\r\n');
    };

    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8');
      if (!buffer.endsWith('\r\n')) return;
      const lines = buffer.trim().split('\r\n');
      const lastLine = lines[lines.length - 1] || '';
      // Wait if multi-line response continues (e.g., "250-...")
      if (/^\d{3}-/.test(lastLine)) return;
      buffer = '';

      const code = parseInt(lastLine.slice(0, 3), 10);
      if (code >= 400) {
        socket.end();
        finish({ sent: false, error: `SMTP Error (${code}): ${lastLine}` });
        return;
      }

      if (step === 0 && code === 220) {
        step = 1;
        sendLine(`EHLO oneagentbd.online`);
      } else if (step === 1 && code === 250) {
        step = 2;
        sendLine(`AUTH LOGIN`);
      } else if (step === 2 && code === 334) {
        step = 3;
        sendLine(Buffer.from(params.user, 'utf8').toString('base64'));
      } else if (step === 3 && code === 334) {
        step = 4;
        sendLine(Buffer.from(params.pass, 'utf8').toString('base64'));
      } else if (step === 4 && code === 235) {
        step = 5;
        sendLine(`MAIL FROM:<${params.fromEmail}>`);
      } else if (step === 5 && code === 250) {
        step = 6;
        sendLine(`RCPT TO:<${params.toEmail}>`);
      } else if (step === 6 && code === 250) {
        step = 7;
        sendLine(`DATA`);
      } else if (step === 7 && code === 354) {
        step = 8;
        const encodedSubject = `=?UTF-8?B?${Buffer.from(params.subject, 'utf8').toString('base64')}?=`;
        const encodedFromName = `=?UTF-8?B?${Buffer.from(params.fromName, 'utf8').toString('base64')}?=`;
        const mimeMsg = [
          `From: "${encodedFromName}" <${params.fromEmail}>`,
          `To: <${params.toEmail}>`,
          `Subject: ${encodedSubject}`,
          `MIME-Version: 1.0`,
          `Content-Type: text/html; charset=UTF-8`,
          `Content-Transfer-Encoding: base64`,
          ``,
          Buffer.from(params.html, 'utf8')
            .toString('base64')
            .replace(/(.{76})/g, '$1\r\n'),
          `.`
        ].join('\r\n');
        sendLine(mimeMsg);
      } else if (step === 8 && code === 250) {
        step = 9;
        sendLine(`QUIT`);
        socket.end();
        finish({ sent: true });
      }
    });
  });
}

export async function dispatchSingleEmail(params: {
  smtpSettings: EmailSmtpSettings;
  toEmail: string;
  toName?: string;
  subject: string;
  html: string;
}): Promise<{ delivered: boolean; mode: 'live_smtp' | 'simulated'; error?: string }> {
  const { smtpSettings, toEmail, toName, subject, html } = params;

  if (!smtpSettings.is_configured) {
    return { delivered: true, mode: 'simulated' };
  }

  try {
    if (smtpSettings.provider === 'resend_api' && smtpSettings.api_key) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${smtpSettings.api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${smtpSettings.sender_name} <${smtpSettings.sender_email}>`,
          to: [toEmail],
          subject,
          html
        })
      });
      if (res.ok) {
        return { delivered: true, mode: 'live_smtp' };
      }
      const errJson: any = await res.json().catch(() => ({}));
      return {
        delivered: false,
        mode: 'live_smtp',
        error: errJson?.message || `Resend HTTP ${res.status}`
      };
    }

    if (smtpSettings.provider === 'brevo_api' && smtpSettings.api_key) {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': smtpSettings.api_key,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: smtpSettings.sender_name,
            email: smtpSettings.sender_email
          },
          to: [{ email: toEmail, name: toName || toEmail }],
          subject,
          htmlContent: html
        })
      });
      if (res.ok) {
        return { delivered: true, mode: 'live_smtp' };
      }
      const errJson: any = await res.json().catch(() => ({}));
      return {
        delivered: false,
        mode: 'live_smtp',
        error: errJson?.message || `Brevo HTTP ${res.status}`
      };
    }

    if (
      (smtpSettings.provider === 'gmail' || smtpSettings.provider === 'custom_smtp') &&
      smtpSettings.smtp_host &&
      smtpSettings.smtp_user &&
      smtpSettings.smtp_pass
    ) {
      const smtpRes = await sendViaNativeTlsSmtp({
        host: smtpSettings.smtp_host,
        port: Number(smtpSettings.smtp_port) || 465,
        user: smtpSettings.smtp_user,
        pass: smtpSettings.smtp_pass,
        fromName: smtpSettings.sender_name || 'One Agent BD Store',
        fromEmail: smtpSettings.sender_email || smtpSettings.smtp_user,
        toEmail,
        subject,
        html
      });
      return {
        delivered: smtpRes.sent,
        mode: 'live_smtp',
        error: smtpRes.error
      };
    }
  } catch (err: any) {
    return {
      delivered: false,
      mode: 'live_smtp',
      error: err.message
    };
  }

  return { delivered: true, mode: 'simulated' };
}

export function syncSubscribersFromChatsAndOrders(userId: string): {
  addedCount: number;
  totalSubscribers: number;
} {
  const existing = db.getEmailSubscribers(userId);
  const existingSet = new Set(existing.map((s) => s.email.toLowerCase()));
  let addedCount = 0;

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  // 1. Scan customer chat messages
  const messages = db.getMessages(userId);
  for (const msg of messages) {
    if (msg.direction !== 'inbound' || !msg.message_text) continue;
    const matches = msg.message_text.match(emailRegex);
    if (matches) {
      for (const rawEmail of matches) {
        const cleanEmail = rawEmail.trim().toLowerCase();
        if (!existingSet.has(cleanEmail)) {
          existingSet.add(cleanEmail);
          addedCount++;
          db.saveEmailSubscriber({
            id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            user_id: userId,
            email: cleanEmail,
            name: msg.customer_name || 'Chat Lead',
            tags: ['chat-lead', msg.platform],
            source: 'chat_extracted',
            status: 'subscribed',
            created_at: new Date().toISOString()
          });
        }
      }
    }
  }

  // 2. Scan appointments for customer_email
  const appointments = db.getAppointments(userId);
  for (const apt of appointments) {
    if (apt.customer_email && emailRegex.test(apt.customer_email)) {
      const cleanEmail = apt.customer_email.trim().toLowerCase();
      if (!existingSet.has(cleanEmail)) {
        existingSet.add(cleanEmail);
        addedCount++;
        db.saveEmailSubscriber({
          id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          user_id: userId,
          email: cleanEmail,
          name: apt.customer_name || 'Appointment Client',
          phone: apt.customer_phone,
          tags: ['appointment', 'vip'],
          source: 'order',
          status: 'subscribed',
          created_at: new Date().toISOString()
        });
      }
    }
  }

  return {
    addedCount,
    totalSubscribers: db.getEmailSubscribers(userId).length
  };
}

export async function generateMarketingEmailWithAI(params: {
  userId: string;
  businessName: string;
  topicPrompt: string;
  language?: 'en' | 'bn';
}): Promise<{
  subject: string;
  preheader: string;
  body_html: string;
  cta_text: string;
}> {
  const { userId, businessName, topicPrompt, language = 'en' } = params;

  try {
    const ai = getGeminiClient(userId);
    const prompt = `You are an expert Email Marketing Copywriter for "${businessName}".
Write a high-converting promotional email based on this merchant request:
"${topicPrompt}"

Language preference: ${
      language === 'bn'
        ? 'Natural Bangla (বাংলা) mixed with clean English product terms'
        : 'Clean, persuasive, professional English'
    }

Use "{customer_name}" as the greeting placeholder.
Return ONLY valid JSON with these exact keys:
{
  "subject": "<Catchy email subject line>",
  "preheader": "<Short 1-sentence preview text>",
  "body_html": "<3 short, well-spaced paragraphs separated by \\n\\n>",
  "cta_text": "<Action button label, e.g. Claim 25% Discount Now>"
}`;

    for (const modelName of ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-2.5-flash-lite']) {
      try {
        const res = await ai.models.generateContent({
          model: modelName,
          contents: prompt
        });
        if (res.text?.trim()) {
          const clean = res.text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(clean);
          if (parsed && parsed.subject && parsed.body_html) {
            return {
              subject: parsed.subject,
              preheader: parsed.preheader || `Special update from ${businessName}`,
              body_html: parsed.body_html,
              cta_text: parsed.cta_text || 'Explore Offer Now'
            };
          }
        }
      } catch {
        // try next model
      }
    }
  } catch (err) {
    console.warn('[Email AI Copywriter] Fallback to template:', err);
  }

  return {
    subject: `Exclusive Offer from ${businessName}: ${topicPrompt.slice(0, 50)}`,
    preheader: `Limited-time special offer curated for you by ${businessName}.`,
    body_html: `Hello {customer_name},\n\nWe are excited to share our latest update from ${businessName}: ${topicPrompt}.\n\nClick the button below to claim your offer or reply directly to this email if you have any questions!`,
    cta_text: 'Claim Offer Now'
  };
}

export function computeEmailAnalytics(campaigns: EmailCampaign[]) {
  let totalSent = 0;
  let totalOpened = 0;
  let totalClicked = 0;

  for (const c of campaigns) {
    totalSent += c.sent_count || 0;
    totalOpened += c.opened_count || 0;
    totalClicked += c.clicked_count || 0;
  }

  const openRate = totalSent > 0 ? Number(((totalOpened / totalSent) * 100).toFixed(1)) : 0;
  const clickRate = totalSent > 0 ? Number(((totalClicked / totalSent) * 100).toFixed(1)) : 0;

  return {
    totalCampaigns: campaigns.length,
    totalSent,
    totalOpened,
    totalClicked,
    openRate,
    clickRate
  };
}
