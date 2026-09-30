import { db, Channel, Message, Order, CallRequest } from '../db/database.js';
import { generateAIReply } from './aiService.js';
import { getUserSubscriptionStatus } from './subscriptionService.js';
import {
  downloadMessengerAudio,
  downloadMessengerImage,
  downloadWhatsAppAudio,
  downloadWhatsAppImage,
  prepareOutboundVoiceForMeta
} from './audioDownloader.js';
import { detectAndRecordOrder, detectAndRecordPaymentUpdate } from './orderDetectionService.js';

/**
 * Extract a valid Bangladesh mobile number (supports both English 0-9 and Bangla ০-৯ digits).
 */
export function extractBdPhoneNumber(raw?: string): string | null {
  if (!raw) return null;
  const banglaDigits = '০১২৩৪৫৬৭৮৯';
  let normalized = '';
  for (const ch of raw) {
    const idx = banglaDigits.indexOf(ch);
    normalized += idx !== -1 ? String(idx) : ch;
  }
  // Remove spaces or hyphens between digits so "01712-345678" or "+88 01712 345678" matches cleanly
  const compact = normalized.replace(/(\d)[\s\-–.]+(?=\d)/g, '$1');
  const match = compact.match(/(?:\+?88)?(01[3-9]\d{8})\b/);
  return match ? match[1] : null;
}

/**
 * Detect whether a customer message is asking to speak with a human or over a phone call (Bangla, Banglish, English).
 */
export function detectHumanCallIntent(raw?: string): boolean {
  if (!raw) return false;
  const lower = raw.toLowerCase();
  return (
    lower.includes('kotha bolte chai') ||
    lower.includes('kotha bolte cai') ||
    lower.includes('call a kotha') ||
    lower.includes('call e kotha') ||
    lower.includes('human contact') ||
    lower.includes('call me') ||
    lower.includes('call koren') ||
    lower.includes('call diben') ||
    lower.includes('call din') ||
    lower.includes('call dao') ||
    lower.includes('phone a kotha') ||
    lower.includes('phone e kotha') ||
    lower.includes('phone koren') ||
    lower.includes('phone diben') ||
    lower.includes('phone din') ||
    lower.includes('apnader number') ||
    lower.includes('live agent') ||
    lower.includes('manush er sathe') ||
    lower.includes('helpline') ||
    lower.includes('kotha bolbo') ||
    lower.includes('কথা বলতে চাই') ||
    lower.includes('কথা বলবো') ||
    lower.includes('কল দিন') ||
    lower.includes('কল করেন') ||
    lower.includes('কল দিবেন') ||
    lower.includes('কল করুন') ||
    lower.includes('ফোনে কথা') ||
    lower.includes('ফোন দিন') ||
    lower.includes('ফোন করেন') ||
    lower.includes('আপনাদের নাম্বার') ||
    lower.includes('সরাসরি কথা') ||
    lower.includes('প্রতিনিধির সাথে')
  );
}

export interface InboundWebhookEvent {
  platform: 'whatsapp' | 'messenger' | 'instagram';
  identifier: string; // phone_number_id, page_id, or ig_account_id
  customerId: string; // sender phone, PSID, or IGSID
  customerName?: string;
  messageText: string;
  messageId?: string; // mid or wamid for deduplication
  audioUrl?: string;
  audioMediaId?: string;
  audioMimeType?: string;
  audioBase64?: string;
  imageUrl?: string;
  imageMediaId?: string;
  imageBase64?: string;
  imageMimeType?: string;
  rawPayload?: any;
  userId?: string;
  overrideSystemPrompt?: string;
}

// In-memory deduplication cache (stores message ID -> timestamp)
const processedMessageIds = new Map<string, number>();

// In-memory sequential queue per customer to ensure messages are answered in order
const customerQueues = new Map<string, Promise<any>>();

// Prune old message IDs every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - 15 * 60 * 1000;
  for (const [id, time] of processedMessageIds.entries()) {
    if (time < cutoff) {
      processedMessageIds.delete(id);
    }
  }
}, 5 * 60 * 1000);

export async function handleInboundWebhook(event: InboundWebhookEvent): Promise<{
  received: boolean;
  inboundMessage?: Message;
  aiReplyMessage?: Message;
  reason?: string;
}> {
  // Deduplication check
  const mid = event.messageId || event.rawPayload?.mid || event.rawPayload?.id;
  if (mid) {
    if (processedMessageIds.has(mid)) {
      console.log(`[Meta Service] Skipping duplicate webhook message: ${mid}`);
      return { received: true, reason: 'Duplicate message ignored' };
    }
    processedMessageIds.set(mid, Date.now());
  }

  // Queue processing per customer to preserve strict conversation order
  const currentQueue = customerQueues.get(event.customerId) || Promise.resolve();
  const nextTask = currentQueue.then(async () => {
    return processSingleInboundEvent(event);
  }).catch((err) => {
    console.error(`[Meta Service] Error processing queued message for ${event.customerId}:`, err);
    return { received: true, reason: 'Queue processing error' };
  });

  customerQueues.set(event.customerId, nextTask);
  return nextTask;
}

async function processSingleInboundEvent(event: InboundWebhookEvent): Promise<{
  received: boolean;
  inboundMessage?: Message;
  aiReplyMessage?: Message;
  order?: Order;
  reason?: string;
}> {
  // 1. Find matching channel (or create virtual simulation channel for the user)
  let channel = db.getChannelByIdentifier(event.platform, event.identifier);
  let isVirtualSimChannel = false;

  if (event.userId && (!channel || channel.user_id !== event.userId)) {
    const userChannels = db.getChannels(event.userId);
    const existingForPlatform = userChannels.find((c) => c.platform === event.platform && c.is_active);
    if (existingForPlatform) {
      channel = existingForPlatform;
    } else {
      const userProfile = db.getProfileById(event.userId);
      isVirtualSimChannel = true;
      channel = {
        id: `chn_sim_${event.platform}_${event.userId}`,
        user_id: event.userId,
        platform: event.platform,
        name: userProfile?.full_name || 'One Agent BD',
        identifier: event.identifier || `sim_${event.platform}_${event.userId}`,
        access_token: 'demo_sim_token',
        is_active: true,
        status: 'connected',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }

  if (!channel) {
    console.warn(`No active channel found for ${event.platform} identifier: ${event.identifier}`);
    return { received: true, reason: 'No active channel mapped' };
  }

  // 2. Check user profile and subscription status
  const profile = db.getProfileById(channel.user_id);
  if (!profile || profile.is_suspended) {
    return { received: true, reason: 'Account suspended or not found' };
  }

  const subStatus = getUserSubscriptionStatus(channel.user_id);
  if (subStatus.isGated) {
    console.warn(`User ${channel.user_id} subscription is gated/expired. AI Auto-Reply skipped.`);
    return { received: true, reason: 'Subscription expired or unpaid' };
  }

  // 3. Process voice audio if present
  let audioBase64 = event.audioBase64;
  let audioMimeType = event.audioMimeType || 'audio/ogg';

  // Download Messenger audio if direct URL was supplied
  if (!audioBase64 && event.audioUrl) {
    const downloaded = await downloadMessengerAudio(event.audioUrl);
    if (downloaded) {
      audioBase64 = downloaded.base64;
      audioMimeType = downloaded.mimeType;
    }
  }

  // Download WhatsApp audio if mediaId was supplied
  if (!audioBase64 && event.audioMediaId && channel.access_token) {
    const downloaded = await downloadWhatsAppAudio(event.audioMediaId, channel.access_token);
    if (downloaded) {
      audioBase64 = downloaded.base64;
      audioMimeType = downloaded.mimeType;
    }
  }

  // Download WhatsApp image if imageMediaId was supplied
  let imageBase64 = event.imageBase64;
  let imageMimeType = event.imageMimeType || 'image/jpeg';
  if (!imageBase64 && event.imageMediaId && channel.access_token) {
    const downloadedImg = await downloadWhatsAppImage(event.imageMediaId, channel.access_token);
    if (downloadedImg) {
      imageBase64 = downloadedImg.base64;
      imageMimeType = downloadedImg.mimeType;
    }
  }

  // Download Messenger / Instagram image if direct imageUrl was supplied
  if (!imageBase64 && event.imageUrl) {
    const downloadedImg = await downloadMessengerImage(event.imageUrl);
    if (downloadedImg) {
      imageBase64 = downloadedImg.base64;
      imageMimeType = downloadedImg.mimeType;
    }
  }

  const hasVoice = Boolean(audioBase64 || event.audioUrl || event.audioMediaId);
  const hasImage = Boolean(imageBase64 || event.imageUrl || event.imageMediaId);

  // 4. Log inbound message
  const inbound: Message = db.createMessage({
    id: `msg_${Date.now()}_in_${Math.random().toString(36).substring(2, 6)}`,
    user_id: channel.user_id,
    channel_id: channel.id,
    platform: event.platform,
    customer_id: event.customerId,
    customer_name: event.customerName || (event.platform === 'whatsapp' ? event.customerId : 'Messenger User'),
    direction: 'inbound',
    message_text: event.messageText || (hasVoice ? '🎙️ [Voice Message]' : hasImage ? '📷 [Sent Product Image]' : ''),
    has_voice: hasVoice,
    audio_base64: audioBase64 ? audioBase64.slice(0, 400000) : undefined,
    audio_mime_type: audioMimeType,
    audio_url: event.audioUrl,
    has_image: hasImage,
    image_url: event.imageUrl,
    image_base64: event.imageBase64 ? event.imageBase64.slice(0, 500000) : undefined,
    image_mime_type: event.imageMimeType,
    is_ai_reply: false,
    status: 'delivered',
    raw_payload: event.rawPayload,
    created_at: new Date().toISOString()
  });

  // Update channel activity timestamps if real channel
  if (!isVirtualSimChannel) {
    db.updateChannel(channel.id, {
      last_webhook_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
      status: 'connected',
      error_message: undefined
    });
  }

  // Record webhook event log
  db.logWebhookEvent({
    id: 'wh_' + Date.now(),
    platform: event.platform,
    event_type: 'message',
    identifier: event.identifier,
    sender_id: event.customerId,
    status: 'processed',
    message_id: event.messageId,
    created_at: new Date().toISOString()
  });

  // 4.8. Check if this customer is Blocked (Fake Order / Spammer Blacklist) or Paused for Human Handover
  const autoSettings = db.getAutomationSettings(channel.user_id) as any;
  const blockedList: string[] = Array.isArray(autoSettings?.blocked_customers) ? autoSettings.blocked_customers : [];
  const pausedList: string[] = Array.isArray(autoSettings?.paused_customers) ? autoSettings.paused_customers : [];

  if (blockedList.includes(event.customerId)) {
    console.log(`[Spam/Fraud Shield] Skipping AI auto-reply for blocked customer ${event.customerId}`);
    return {
      received: true,
      inboundMessage: inbound,
      reason: 'Customer is blocked in Fraud/Spam Blacklist'
    };
  }

  if (pausedList.includes(event.customerId)) {
    console.log(`[Human Handover] AI auto-reply paused for customer ${event.customerId} — awaiting human agent reply`);
    return {
      received: true,
      inboundMessage: inbound,
      reason: 'AI paused for human handover on this conversation'
    };
  }

  // 5. Fetch recent conversation history with this customer for context
  const allUserMessages = db.getMessages(channel.user_id);
  const conversationHistory = allUserMessages
    .filter((m) => m.customer_id === event.customerId && m.id !== inbound.id)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  // 6. Generate single AI reply (transcribes, handles product images & catalog queries)
  let aiReplyText = '';
  let attachedImageUrl: string | undefined = undefined;

  try {
    const aiResult = await generateAIReply({
      userId: channel.user_id,
      incomingMessage: event.messageText,
      customerId: event.customerId,
      customerName: event.customerName,
      platform: event.platform,
      channelName: channel.name,
      history: conversationHistory,
      audioBase64,
      audioMimeType,
      imageBase64,
      imageMimeType,
      imageUrl: event.imageUrl,
      overrideSystemPrompt: event.overrideSystemPrompt
    });

    aiReplyText = aiResult.replyText;
    attachedImageUrl = aiResult.attachedImageUrl;

    // If voice was transcribed, update inbound message with the actual words spoken
    if (aiResult.transcript) {
      inbound.transcription = aiResult.transcript;
      inbound.message_text = `🎙️ Voice Message: "${aiResult.transcript}"`;
      db.updateMessage(inbound);
    }
  } catch (err) {
    console.error('Error generating AI reply:', err);
    aiReplyText = hasVoice
      ? 'আপনার ভয়েস মেসেজটি পেয়েছি, তবে শব্দটি স্পষ্ট বোঝা যায়নি। অনুগ্রহ করে আপনার প্রশ্নটি লিখে জানাবেন?'
      : `আসসালামু আলাইকুম! ${channel.name}-এ আপনাকে স্বাগতম। আপনাকে কীভাবে সাহায্য করতে পারি?`;
  }

  // 6.5. Smart Call Request & Phone Number Resolution BEFORE sending reply to Meta
  // This ensures that if a Messenger/Instagram customer asks for a phone call without giving their number,
  // the AI automatically asks for their phone number in chat—and when they reply with their number,
  // it immediately updates the "Pending in chat" call request with the real phone number!
  try {
    const rawCustomerText = inbound.transcription || event.messageText || inbound.message_text || '';
    const wantsHumanCall = detectHumanCallIntent(rawCustomerText);
    const phoneInCurrentMsg = extractBdPhoneNumber(rawCustomerText);

    // Search history & previous orders for any phone number this customer already shared
    let phoneFromHistory: string | null = null;
    for (let i = conversationHistory.length - 1; i >= 0; i--) {
      const found = extractBdPhoneNumber(conversationHistory[i].message_text);
      if (found) {
        phoneFromHistory = found;
        break;
      }
    }
    if (!phoneFromHistory) {
      const prevOrderWithPhone = db
        .getOrders(channel.user_id)
        .find((o) => o.customer_id === event.customerId && extractBdPhoneNumber(o.customer_phone));
      if (prevOrderWithPhone) {
        phoneFromHistory = extractBdPhoneNumber(prevOrderWithPhone.customer_phone);
      }
    }

    const whatsappSenderPhone = extractBdPhoneNumber(event.customerId);
    const resolvedPhone = phoneInCurrentMsg || phoneFromHistory || whatsappSenderPhone || 'Pending in chat';

    const userCallRequests = db.getCallRequests(channel.user_id);
    const pendingPhoneCallReq = userCallRequests.find(
      (c) =>
        c.customer_id === event.customerId &&
        (c.customer_phone === 'Pending in chat' || !extractBdPhoneNumber(c.customer_phone))
    );

    if (pendingPhoneCallReq && phoneInCurrentMsg) {
      // Customer just replied with their mobile number for an existing "Pending in chat" call request!
      db.updateCallRequest(pendingPhoneCallReq.id, {
        customer_phone: phoneInCurrentMsg,
        status: 'pending',
        notes: `Customer shared phone number (${phoneInCurrentMsg}) in ${event.platform} chat — Ready to call!`
      });
      console.log(
        `[Call Request Updated] Customer ${pendingPhoneCallReq.customer_name} provided phone ${phoneInCurrentMsg}`
      );

      // If the message is primarily providing the phone number, make sure AI confirms callback clearly
      if (rawCustomerText.trim().length <= 35 && !aiReplyText.includes(phoneInCurrentMsg)) {
        aiReplyText = `ধন্যবাদ! আপনার মোবাইল নাম্বারটি (${phoneInCurrentMsg}) আমাদের কল লিস্টে যুক্ত করা হয়েছে। 📞\n\nআমাদের একজন প্রতিনিধি খুব শীঘ্রই আপনাকে কল করবেন।`;
      }
    } else if (wantsHumanCall) {
      const existingActiveCall = userCallRequests.find(
        (c) => c.customer_id === event.customerId && (c.status === 'pending' || c.customer_phone === 'Pending in chat')
      );

      if (existingActiveCall) {
        if (
          resolvedPhone !== 'Pending in chat' &&
          (existingActiveCall.customer_phone === 'Pending in chat' || !extractBdPhoneNumber(existingActiveCall.customer_phone))
        ) {
          db.updateCallRequest(existingActiveCall.id, {
            customer_phone: resolvedPhone,
            status: 'pending',
            notes: `Customer requested callback — Phone: ${resolvedPhone}`
          });
        }
      } else {
        const newCallReq: CallRequest = {
          id: `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          user_id: channel.user_id,
          customer_name: inbound.customer_name || 'Valued Customer',
          customer_phone: resolvedPhone,
          customer_id: event.customerId,
          platform: event.platform,
          message_excerpt: rawCustomerText.slice(0, 150),
          status: 'pending',
          notes:
            resolvedPhone === 'Pending in chat'
              ? 'AI asked customer for mobile number in chat (auto-updates when customer replies)'
              : 'Customer requested human phone contact in live chat',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        db.createCallRequest(newCallReq);
        console.log(
          `[Call Request Logged] Customer ${newCallReq.customer_name} (${newCallReq.customer_phone}) queued for callback`
        );
      }

      // If customer is on Messenger/Instagram and we STILL don't have their phone number, ensure AI asks for their number!
      if (resolvedPhone === 'Pending in chat') {
        const alreadyAskingNumber =
          aiReplyText.includes('নাম্বার') ||
          aiReplyText.toLowerCase().includes('number') ||
          aiReplyText.includes('ফোন');
        if (!alreadyAskingNumber) {
          aiReplyText = `অবশ্যই! আমাদের প্রতিনিধি আপনার সাথে ফোনে কথা বলবেন। 📞\n\nঅনুগ্রহ করে এখানে আপনার সচল মোবাইল বা WhatsApp নাম্বারটি লিখে দিন, নাম্বারটি পেলেই আমরা আপনাকে কল করছি।`;
        }
      }
    }
  } catch (callErr) {
    console.warn('[Call Request Engine] Error processing call request:', callErr);
  }

  // 7. Send message to Meta Graph API
  await sendMetaMessage(channel, event.customerId, aiReplyText, attachedImageUrl);

  // 8. Log outbound AI reply message
  const outbound: Message = db.createMessage({
    id: `msg_${Date.now()}_out_${Math.random().toString(36).substring(2, 6)}`,
    user_id: channel.user_id,
    channel_id: channel.id,
    platform: event.platform,
    customer_id: event.customerId,
    customer_name: inbound.customer_name,
    direction: 'outbound',
    message_text: aiReplyText,
    is_ai_reply: true,
    has_image: Boolean(attachedImageUrl),
    image_url: attachedImageUrl,
    status: 'sent',
    created_at: new Date().toISOString()
  });

  // 9. Check if customer placed or confirmed an order and save to Orders Hub list
  let detectedOrder: Order | undefined = undefined;
  try {
    const rawCustomerText = inbound.transcription || event.messageText || inbound.message_text;
    const orderResult = await detectAndRecordOrder({
      userId: channel.user_id,
      customerId: event.customerId,
      customerName: inbound.customer_name,
      platform: event.platform,
      channelId: channel.id,
      messageText: rawCustomerText,
      recentHistory: conversationHistory.slice(-4).map(m => `${m.direction}: ${m.message_text}`).join('\n'),
      aiReplyText
    });
    if (orderResult) {
      detectedOrder = orderResult;
      console.log(`[Order Confirmed] Order #${detectedOrder.id} logged for merchant ${channel.user_id}`);
    } else if (autoSettings?.auto_payment_verify_enabled !== false) {
      const paymentUpdatedOrder = detectAndRecordPaymentUpdate({
        userId: channel.user_id,
        customerId: event.customerId,
        customerName: inbound.customer_name,
        platform: event.platform,
        messageText: rawCustomerText,
        aiReplyText,
        hasImage
      });
      if (paymentUpdatedOrder) {
        detectedOrder = paymentUpdatedOrder;
        console.log(`[Auto Payment Verified] Order #${paymentUpdatedOrder.id} marked PAID (TrxID: ${paymentUpdatedOrder.payment_trx_id})`);
      }
    }
  } catch (orderErr) {
    console.warn('[Order Engine] Error during order recording:', orderErr);
  }

  return {
    received: true,
    inboundMessage: inbound,
    aiReplyMessage: outbound,
    order: detectedOrder
  };
}

async function sendMetaMessage(
  channel: Channel,
  recipientId: string,
  text: string,
  imageUrl?: string
): Promise<{ ok: boolean; outsideWindow?: boolean; error?: string }> {
  // If token is demo/simulated, don't make outbound network call
  if (!channel.access_token || channel.access_token.includes('demo') || channel.access_token.startsWith('sim_')) {
    console.log(`[Meta Simulation] Outbound ${channel.platform} message sent to ${recipientId}: "${text}" ${imageUrl ? `[Image: ${imageUrl}]` : ''}`);
    return { ok: true };
  }

  try {
    if (channel.platform === 'whatsapp') {
      const url = `https://graph.facebook.com/v21.0/${channel.identifier}/messages`;
      const bodyPayload: any = imageUrl
        ? {
            messaging_product: 'whatsapp',
            to: recipientId,
            type: 'image',
            image: { link: imageUrl, caption: text }
          }
        : {
            messaging_product: 'whatsapp',
            to: recipientId,
            type: 'text',
            text: { body: text }
          };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${channel.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyPayload)
      });
      if (!res.ok) {
        const err: any = await res.json().catch(() => ({}));
        console.error('[WhatsApp Outbound Error]', err);
        const errMsg = err?.error?.message || 'WhatsApp delivery error';
        const isOutsideWindow =
          err?.error?.code === 131047 ||
          errMsg.toLowerCase().includes('24 hour') ||
          errMsg.toLowerCase().includes('re-engagement');
        return { ok: false, outsideWindow: isOutsideWindow, error: errMsg };
      }
      return { ok: true };
    } else if (channel.platform === 'messenger' || channel.platform === 'instagram') {
      const url = `https://graph.facebook.com/v21.0/me/messages?access_token=${encodeURIComponent(channel.access_token)}`;
      const isCommentLead = recipientId.startsWith('commenter_');
      const recipientObj = isCommentLead
        ? { comment_id: recipientId.replace(/^commenter_/, '') }
        : { id: recipientId };

      if (imageUrl && !isCommentLead) {
        // 1. Send image attachment
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: recipientObj,
            message: {
              attachment: {
                type: 'image',
                payload: { url: imageUrl, is_reusable: true }
              }
            }
          })
        }).catch((err) => console.error(`[${channel.platform} Outbound Image Error]`, err));
      }

      // 2. Send text message with details
      if (text) {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: recipientObj,
            ...(isCommentLead ? {} : { messaging_type: 'RESPONSE' }),
            message: { text }
          })
        });
        if (res.ok) {
          console.log(`[${channel.platform} Outbound Success] Sent reply to ${recipientId}`);
          return { ok: true };
        }

        const err: any = await res.json().catch(() => ({}));
        const errCode = err?.error?.code;
        const errSubcode = err?.error?.error_subcode;
        const errMsg: string = err?.error?.message || '';
        const isOutside24h =
          errCode === 10 ||
          errSubcode === 2018278 ||
          errSubcode === 2534022 ||
          errMsg.toLowerCase().includes('outside of allowed window');

        // Automatic fallback for leads outside the 24-hour window (up to 7 days with HUMAN_AGENT or update tags)
        if (!isCommentLead && isOutside24h) {
          const fallbackTags =
            channel.platform === 'messenger'
              ? ['HUMAN_AGENT', 'POST_PURCHASE_UPDATE', 'ACCOUNT_UPDATE']
              : ['HUMAN_AGENT'];

          for (const tag of fallbackTags) {
            const retryRes = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                recipient: { id: recipientId },
                messaging_type: 'MESSAGE_TAG',
                tag,
                message: { text }
              })
            });
            if (retryRes.ok) {
              console.log(
                `[${channel.platform} Outbound Success via ${tag}] Sent message to ${recipientId} outside 24h window`
              );
              return { ok: true };
            }
          }
          console.warn(
            `[${channel.platform} Outbound Outside Window] Customer ${recipientId} is outside Meta's messaging window:`,
            JSON.stringify(err)
          );
          return { ok: false, outsideWindow: true, error: errMsg || 'Outside Meta 24h/7d window' };
        }

        console.error(`[${channel.platform} Outbound Error]`, JSON.stringify(err));
        return { ok: false, outsideWindow: false, error: errMsg || 'Meta API error' };
      }
      return { ok: true };
    }
    return { ok: true };
  } catch (err: any) {
    console.error('Failed to send message via Meta Graph API:', err);
    return { ok: false, error: err?.message || 'Network error' };
  }
}

export async function sendManualMetaMessage(
  channel: Channel,
  recipientId: string,
  payload: {
    text?: string;
    imageBase64?: string;
    imageMimeType?: string;
    videoBase64?: string;
    videoMimeType?: string;
    audioBase64?: string;
    audioMimeType?: string;
  }
): Promise<{ ok: boolean; outsideWindow?: boolean; error?: string }> {
  if (!channel.access_token || channel.access_token.includes('demo') || channel.access_token.startsWith('sim_')) {
    console.log(
      `[Meta Manual Simulation] Outbound ${channel.platform} reply to ${recipientId}: text="${payload.text || ''}" media=${Boolean(
        payload.imageBase64 || payload.videoBase64 || payload.audioBase64
      )}`
    );
    return { ok: true };
  }

  try {
    const hasMedia = Boolean(payload.imageBase64 || payload.videoBase64 || payload.audioBase64);
    const mediaType: 'image' | 'video' | 'audio' | null = payload.imageBase64
      ? 'image'
      : payload.videoBase64
      ? 'video'
      : payload.audioBase64
      ? 'audio'
      : null;
    const rawBase64 = payload.imageBase64 || payload.videoBase64 || payload.audioBase64 || '';
    const mimeType =
      payload.imageMimeType ||
      payload.videoMimeType ||
      payload.audioMimeType ||
      (mediaType === 'image' ? 'image/jpeg' : mediaType === 'video' ? 'video/mp4' : 'audio/ogg');

    if (channel.platform === 'whatsapp') {
      const msgUrl = `https://graph.facebook.com/v21.0/${channel.identifier}/messages`;

      if (hasMedia && mediaType && rawBase64) {
        const mediaUploadUrl = `https://graph.facebook.com/v21.0/${channel.identifier}/media`;
        const cleanBase64 = rawBase64.replace(/^data:[^;]+;base64,/, '');
        let buffer: Buffer = Buffer.from(cleanBase64, 'base64');
        let finalMime = mimeType.split(';')[0];
        let ext = finalMime.split('/')[1] || (mediaType === 'image' ? 'jpg' : mediaType === 'video' ? 'mp4' : 'mp3');

        if (mediaType === 'audio') {
          const preparedVoice = await prepareOutboundVoiceForMeta(buffer, mimeType, 'whatsapp');
          buffer = preparedVoice.buffer;
          finalMime = preparedVoice.mimeType;
          ext = preparedVoice.ext;
        }

        const form = new FormData();
        form.append('messaging_product', 'whatsapp');
        form.append('type', finalMime);
        form.append('file', new Blob([buffer], { type: finalMime }), `voice_message.${ext}`);

        const uploadRes = await fetch(mediaUploadUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${channel.access_token}`
          },
          body: form
        });

        const uploadData: any = await uploadRes.json().catch(() => ({}));
        if (uploadRes.ok && uploadData?.id) {
          const mediaObj: any = { id: uploadData.id };
          if (payload.text && (mediaType === 'image' || mediaType === 'video')) {
            mediaObj.caption = payload.text;
          }
          await fetch(msgUrl, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${channel.access_token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: recipientId,
              type: mediaType,
              [mediaType]: mediaObj
            })
          });
          if (mediaType === 'audio' && payload.text) {
            return await sendMetaMessage(channel, recipientId, payload.text);
          }
          return { ok: true };
        } else {
          console.error('[WhatsApp Media Upload Error]', uploadData);
        }
      }

      if (payload.text) {
        return await sendMetaMessage(channel, recipientId, payload.text);
      }
      return { ok: true };
    } else if (channel.platform === 'messenger' || channel.platform === 'instagram') {
      const url = `https://graph.facebook.com/v21.0/me/messages?access_token=${encodeURIComponent(channel.access_token)}`;

      if (hasMedia && mediaType && rawBase64) {
        const cleanBase64 = rawBase64.replace(/^data:[^;]+;base64,/, '');
        let buffer: Buffer = Buffer.from(cleanBase64, 'base64');
        let finalMime = mimeType.split(';')[0];
        let ext = finalMime.split('/')[1] || (mediaType === 'image' ? 'jpg' : mediaType === 'video' ? 'mp4' : 'mp3');

        if (mediaType === 'audio') {
          const preparedVoice = await prepareOutboundVoiceForMeta(buffer, mimeType, channel.platform);
          buffer = preparedVoice.buffer;
          finalMime = preparedVoice.mimeType;
          ext = preparedVoice.ext;
        }

        const form = new FormData();
        form.append('recipient', JSON.stringify({ id: recipientId }));
        form.append(
          'message',
          JSON.stringify({
            attachment: {
              type: mediaType,
              payload: { is_reusable: true }
            }
          })
        );
        form.append('filedata', new Blob([buffer], { type: finalMime }), `voice_message.${ext}`);

        const uploadRes = await fetch(url, {
          method: 'POST',
          body: form
        });
        if (!uploadRes.ok) {
          const errJson = await uploadRes.json().catch(() => ({}));
          console.error(`[${channel.platform} Media Upload Error]`, JSON.stringify(errJson));
        } else {
          console.log(`[${channel.platform} Media Sent] Delivered ${mediaType} (${finalMime}, ${buffer.length} bytes) to ${recipientId}`);
        }
      }

      if (payload.text) {
        return await sendMetaMessage(channel, recipientId, payload.text);
      }
      return { ok: true };
    }
    return { ok: true };
  } catch (err: any) {
    console.error('Failed to send manual media/voice via Meta Graph API:', err);
    return { ok: false, error: err?.message || 'Network error' };
  }
}

// ----------------------------------------------------------------------------
// FACEBOOK PAGE & INSTAGRAM COMMENT AUTO-REPLY + PRIVATE INBOX DM
// ----------------------------------------------------------------------------
export interface InboundCommentEvent {
  platform: 'messenger' | 'instagram';
  identifier: string; // page_id or ig_account_id
  commentId: string;
  postId?: string;
  customerId: string;
  customerName?: string;
  commentText: string;
  userId?: string;
}

export async function handleInboundCommentWebhook(event: InboundCommentEvent): Promise<{
  handled: boolean;
  publicReply?: string;
  privateInboxReply?: string;
  reason?: string;
}> {
  if (!event.commentId || !event.commentText?.trim()) {
    return { handled: false, reason: 'Empty comment or missing commentId' };
  }

  // Deduplicate comment ID
  const dedupKey = `comment_${event.commentId}`;
  if (processedMessageIds.has(dedupKey)) {
    return { handled: true, reason: 'Duplicate comment ignored' };
  }
  processedMessageIds.set(dedupKey, Date.now());

  // Ignore self-comments made by the Page/Instagram account itself
  if (event.customerId && event.customerId === event.identifier) {
    return { handled: false, reason: 'Ignored self-comment from page' };
  }

  let channel = db.getChannelByIdentifier(event.platform, event.identifier);
  if (!channel && event.userId) {
    channel = db.getChannels(event.userId).find((c) => c.platform === event.platform && c.is_active);
    if (!channel) {
      const userProfile = db.getProfileById(event.userId);
      channel = {
        id: `sim_ch_${event.platform}_${event.userId}`,
        user_id: event.userId,
        platform: event.platform,
        name: userProfile?.full_name || 'One Agent BD',
        identifier: event.identifier || `sim_${event.platform}_${event.userId}`,
        access_token: 'demo_sim_token',
        is_active: true,
        auto_comment_reply: true,
        auto_followup_enabled: true,
        status: 'connected',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }

  if (!channel || !channel.is_active) {
    return { handled: false, reason: 'No active channel mapped for comment' };
  }

  // Check if auto_comment_reply is enabled (default true)
  if (channel.auto_comment_reply === false) {
    return { handled: false, reason: 'Auto comment reply is paused for this channel' };
  }

  const profile = db.getProfileById(channel.user_id);
  if (!profile || profile.is_suspended) {
    return { handled: false, reason: 'User profile suspended' };
  }

  if (profile.automation_settings?.auto_comment_reply_enabled === false) {
    return { handled: false, reason: 'Auto comment reply is disabled in automation settings' };
  }

  const subStatus = getUserSubscriptionStatus(channel.user_id);
  if (subStatus.isGated) {
    return { handled: false, reason: 'Subscription expired' };
  }

  const commenterName = event.customerName || 'সম্মানিত গ্রাহক';

  // 1. Log customer's comment in Unified Inbox so merchant sees it
  const inboundCommentMsg = db.createMessage({
    id: `msg_${Date.now()}_cm_in_${Math.random().toString(36).substring(2, 6)}`,
    user_id: channel.user_id,
    channel_id: channel.id,
    platform: event.platform,
    customer_id: event.customerId || `commenter_${event.commentId}`,
    customer_name: commenterName,
    direction: 'inbound',
    message_text: `💬 [Post Comment]: "${event.commentText}"`,
    is_ai_reply: false,
    status: 'delivered',
    raw_payload: { is_comment: true, comment_id: event.commentId, post_id: event.postId },
    created_at: new Date().toISOString()
  });

  // 2. Generate smart AI response for the Private Inbox DM (with product details & photo)
  let privateDmReply = '';
  let attachedImageUrl: string | undefined;
  try {
    const aiResult = await generateAIReply({
      userId: channel.user_id,
      incomingMessage: event.commentText,
      customerId: inboundCommentMsg.customer_id,
      customerName: commenterName,
      platform: event.platform,
      channelName: channel.name,
      history: []
    });
    privateDmReply = aiResult.replyText;
    attachedImageUrl = aiResult.attachedImageUrl;
  } catch {
    privateDmReply = `আসসালামু আলাইকুম ${commenterName}! আমাদের পোস্টে কমেন্ট করার জন্য ধন্যবাদ। আপনার কাঙ্ক্ষিত প্রোডাক্ট বা সেবা সম্পর্কে বিস্তারিত জানতে এখানে রিপ্লাই দিন।`;
  }

  // 3. Craft short, polite Public Comment Reply under the post
  const customCommentTemplate = profile.automation_settings?.public_comment_reply_template?.trim();
  const publicCommentReply = customCommentTemplate
    ? customCommentTemplate.replace(/\{customer_name\}/g, commenterName)
    : `ধন্যবাদ ${commenterName}! ❤️ আপনার কমেন্টের বিস্তারিত উত্তর ও প্রোডাক্টের তথ্য আপনার ইনবক্সে (Messenger/DM-এ) পাঠিয়ে দেওয়া হয়েছে। অনুগ্রহ করে আপনার ইনবক্স চেক করুন! 📩`;

  // 4. Send Public Comment Reply & Private Inbox DM via Meta Graph API (if real token)
  if (channel.access_token && !channel.access_token.includes('demo') && !channel.access_token.startsWith('sim_')) {
    try {
      // 4A. Public reply to the comment on the post
      const publicReplyUrl =
        event.platform === 'instagram'
          ? `https://graph.facebook.com/v21.0/${encodeURIComponent(event.commentId)}/replies?access_token=${encodeURIComponent(channel.access_token)}`
          : `https://graph.facebook.com/v21.0/${encodeURIComponent(event.commentId)}/comments?access_token=${encodeURIComponent(channel.access_token)}`;

      await fetch(publicReplyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: publicCommentReply })
      }).catch((e) => console.warn('[Comment Auto-Reply] Public reply warning:', e));

      // 4B. Private Reply directly to the commenter's Messenger / Instagram Inbox
      const privateReplyUrl = `https://graph.facebook.com/v21.0/me/messages?access_token=${encodeURIComponent(channel.access_token)}`;
      const dmRes = await fetch(privateReplyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { comment_id: event.commentId },
          message: { text: privateDmReply }
        })
      });

      // Fallback to recipient.id if comment_id private reply already used or user already messaged
      if (!dmRes.ok && event.customerId) {
        await sendMetaMessage(channel, event.customerId, privateDmReply, attachedImageUrl);
      } else if (attachedImageUrl && event.customerId) {
        await sendMetaMessage(channel, event.customerId, '', attachedImageUrl);
      }
    } catch (err) {
      console.error('[Comment Auto-Reply] Graph API error:', err);
    }
  }

  // 5. Log AI's Public + Private Inbox Reply in Unified Inbox
  db.createMessage({
    id: `msg_${Date.now()}_cm_out_${Math.random().toString(36).substring(2, 6)}`,
    user_id: channel.user_id,
    channel_id: channel.id,
    platform: event.platform,
    customer_id: inboundCommentMsg.customer_id,
    customer_name: commenterName,
    direction: 'outbound',
    message_text: `💬 [Public Comment Reply]: "${publicCommentReply}"\n\n📩 [Sent to Customer Inbox]: ${privateDmReply}`,
    is_ai_reply: true,
    has_image: Boolean(attachedImageUrl),
    image_url: attachedImageUrl,
    status: 'sent',
    raw_payload: { is_comment_reply: true, comment_id: event.commentId },
    created_at: new Date().toISOString()
  });

  db.logWebhookEvent({
    id: 'wh_cm_' + Date.now(),
    platform: event.platform,
    event_type: 'comment_auto_reply',
    identifier: event.identifier,
    sender_id: event.customerId,
    status: 'processed',
    message_id: event.commentId,
    created_at: new Date().toISOString()
  });

  return {
    handled: true,
    publicReply: publicCommentReply,
    privateInboxReply: privateDmReply
  };
}

// ----------------------------------------------------------------------------
// SMART AUTO FOLLOW-UP MESSAGE ENGINE (WITHIN META 24-HOUR WINDOW)
// ----------------------------------------------------------------------------
export async function runAutoFollowUpEngine(options?: {
  userId?: string;
  forceImmediate?: boolean;
}): Promise<{
  checkedConversations: number;
  followUpsSent: number;
  details: Array<{ customerName: string; platform: string; followUpText: string }>;
}> {
  const details: Array<{ customerName: string; platform: string; followUpText: string }> = [];
  let checkedConversations = 0;

  const allProfiles = options?.userId
    ? [db.getProfileById(options.userId)].filter(Boolean)
    : db.getProfiles();

  const now = Date.now();
  // Minimum idle time before auto follow-up:
  // In scheduled background mode: 45 minutes idle (and < 23 hours for Meta 24h policy).
  // In manual "Send Follow-up Now" trigger (forceImmediate): 1 minute idle (and < 24 hours).
  const minIdleMs = options?.forceImmediate ? 60 * 1000 : 45 * 60 * 1000;
  const maxWindowMs = 23.5 * 60 * 60 * 1000;

  for (const profile of allProfiles) {
    if (!profile || profile.is_suspended) continue;
    if (profile.automation_settings?.auto_followup_enabled === false && !options?.forceImmediate) {
      continue;
    }
    const subStatus = getUserSubscriptionStatus(profile.id);
    if (subStatus.isGated) continue;

    const customDelayMins = profile.automation_settings?.followup_delay_minutes || 45;
    const minIdleMs = options?.forceImmediate ? 10 * 1000 : customDelayMins * 60 * 1000;

    const activeChannels = db
      .getChannels(profile.id)
      .filter((c) => c.is_active && c.auto_followup_enabled !== false);

    const userMessages = db.getMessages(profile.id);
    const userOrders = db.getOrders(profile.id);

    // Group messages by customer_id + platform
    const grouped = new Map<string, Message[]>();
    for (const m of userMessages) {
      const key = `${m.platform}::${m.customer_id}`;
      const list = grouped.get(key) || [];
      list.push(m);
      grouped.set(key, list);
    }

    for (const [, msgs] of grouped.entries()) {
      if (msgs.length === 0) continue;
      checkedConversations++;

      const sorted = msgs.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      const lastMsg = sorted[sorted.length - 1];
      const lastInbound = [...sorted].reverse().find((m) => m.direction === 'inbound');
      if (!lastInbound) continue;

      let channel = activeChannels.find(
        (c) => c.id === lastMsg.channel_id || c.platform === lastMsg.platform
      );
      if (!channel && options?.forceImmediate) {
        channel = {
          id: lastMsg.channel_id || `sim_ch_${lastMsg.platform}_${profile.id}`,
          user_id: profile.id,
          platform: lastMsg.platform,
          name: profile.full_name || 'One Agent BD',
          identifier: `sim_${lastMsg.platform}_${profile.id}`,
          access_token: 'demo_sim_token',
          is_active: true,
          auto_comment_reply: true,
          auto_followup_enabled: true,
          status: 'connected',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      if (!channel) continue;

      // Check time since last message
      const lastActivityTime = new Date(lastMsg.created_at).getTime();
      const lastInboundTime = new Date(lastInbound.created_at).getTime();
      const idleMs = now - lastActivityTime;
      const sinceInboundMs = now - lastInboundTime;

      if (idleMs < minIdleMs || sinceInboundMs > maxWindowMs) {
        continue;
      }

      // Skip if we already sent an auto follow-up after their last inbound message
      const alreadyFollowedUp = sorted.some(
        (m) =>
          m.direction === 'outbound' &&
          new Date(m.created_at).getTime() > lastInboundTime &&
          m.raw_payload?.is_followup === true
      );
      if (alreadyFollowedUp) continue;

      // Skip if customer already placed an order recently
      const hasOrdered = userOrders.some(
        (o) =>
          o.customer_id === lastInbound.customer_id &&
          now - new Date(o.created_at).getTime() < 48 * 60 * 60 * 1000
      );
      if (hasOrdered) continue;

      const customerName = lastInbound.customer_name || 'সম্মানিত গ্রাহক';

      // Generate contextual polite follow-up message
      const customFollowUpTemplate = profile.automation_settings?.followup_message_template?.trim();
      const followUpText = customFollowUpTemplate
        ? customFollowUpTemplate.replace(/\{customer_name\}/g, customerName)
        : `আসসালামু আলাইকুম ${customerName}! 😊 আপনি কিছুক্ষণ আগে আমাদের পেজে মেসেজ দিয়েছিলেন। আপনার কি প্রোডাক্ট বা অর্ডার সম্পর্কে আর কোনো তথ্য জানার আছে? অর্ডার কনফার্ম করতে চাইলে আপনার নাম, সম্পূর্ণ ঠিকানা এবং মোবাইল নাম্বারটি লিখে পাঠিয়ে দিন—আমাদের AI এখনই আপনার অর্ডারটি বুক করে নেবে! ❤️`;

      await sendMetaMessage(channel, lastInbound.customer_id, followUpText);

      db.createMessage({
        id: `msg_${Date.now()}_fw_${Math.random().toString(36).substring(2, 6)}`,
        user_id: profile.id,
        channel_id: channel.id,
        platform: channel.platform,
        customer_id: lastInbound.customer_id,
        customer_name: customerName,
        direction: 'outbound',
        message_text: `⏰ [Auto Follow-up]: ${followUpText}`,
        is_ai_reply: true,
        status: 'sent',
        raw_payload: { is_followup: true },
        created_at: new Date().toISOString()
      });

      details.push({
        customerName,
        platform: channel.platform,
        followUpText
      });
    }
  }

  return {
    checkedConversations,
    followUpsSent: details.length,
    details
  };
}

