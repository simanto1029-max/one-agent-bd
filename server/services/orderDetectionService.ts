import { db, Order } from '../db/database.js';
import { GoogleGenAI } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    geminiClient = new GoogleGenAI({ apiKey: apiKey || '' });
  }
  return geminiClient;
}

export interface OrderDetectionParams {
  userId: string;
  customerId: string;
  customerName?: string;
  platform: 'whatsapp' | 'messenger' | 'instagram';
  channelId?: string;
  messageText: string;
  recentHistory?: string;
  aiReplyText?: string;
  isSimulation?: boolean;
}

/**
 * Check if the text or conversation contains clear indicators of an order being confirmed or placed
 */
export function hasOrderSignals(text: string, aiReply?: string, userId?: string): boolean {
  const combined = `${text} ${aiReply || ''}`.toLowerCase();
  
  // Explicit Bangladeshi phone pattern
  const hasPhone = /(?:\+?8801|01)[3-9]\d{8}/.test(text);
  
  // Standard and merchant custom confirmation keywords
  let orderKeywords = [
    'order', 'confirm', 'confirmed', 'delivery', 'deliver',
    'address', 'thikana', 'pathan', 'pathiye din', 'cash on delivery',
    'cod', 'bkash', 'nagad', 'trx', 'trxid', 'transaction',
    'taka pathiyechi', 'nite chai', 'nib', 'package', 'plan order',
    'booked', 'send it', 'confirm korlam', 'buy', 'purchase'
  ];

  if (userId) {
    try {
      const userSettings = db.getOrderSettings(userId);
      if (userSettings && Array.isArray(userSettings.trigger_keywords)) {
        orderKeywords = Array.from(new Set([...orderKeywords, ...userSettings.trigger_keywords.map(k => k.toLowerCase().trim()).filter(Boolean)]));
      }
    } catch {
      // ignore
    }
  }

  const matchCount = orderKeywords.filter(k => combined.includes(k)).length;

  // If there's a phone number and at least one order keyword, or at least two order keywords
  return (hasPhone && matchCount >= 1) || matchCount >= 2;
}

/**
 * Heuristic extractor for Bangladeshi phone, address, and common items
 */
function heuristicExtract(text: string, defaultName: string, customerId: string): Partial<Order> {
  // Extract phone
  const phoneMatch = text.match(/(?:\+?8801|01)[3-9]\d{8}/);
  const phone = phoneMatch ? phoneMatch[0] : (customerId.startsWith('+8801') || customerId.startsWith('01') ? customerId : undefined);

  // Extract payment method
  let payment_method: Order['payment_method'] = 'unspecified';
  let payment_status: Order['payment_status'] = 'pending';
  const lower = text.toLowerCase();
  
  if (lower.includes('bkash')) {
    payment_method = 'bkash';
  } else if (lower.includes('nagad')) {
    payment_method = 'nagad';
  } else if (lower.includes('cod') || lower.includes('cash on delivery') || lower.includes('cash')) {
    payment_method = 'cod';
  }

  if (lower.includes('trx') || lower.includes('paid') || lower.includes('sent') || lower.includes('pathiyechi')) {
    payment_status = 'paid';
  }

  // Extract amount
  let total_amount = 1450; // default standard plan price
  const amountMatch = text.match(/(\d{3,5})\s*(?:taka|tk|bdt)/i) || text.match(/(?:tk|bdt|taka)\s*(\d{3,5})/i);
  if (amountMatch) {
    const val = parseInt(amountMatch[1], 10);
    if (!isNaN(val) && val > 50) {
      total_amount = val;
    }
  }

  // Extract address hints (e.g. Dhaka, Chittagong, Dhanmondi, Mirpur, Uttara, etc.)
  let address = '';
  const addressMatch = text.match(/(?:address|thikana|location|delivery address)[\s:]*([^\n,]+(?:,[^\n,]+)*)/i);
  if (addressMatch && addressMatch[1].trim().length > 3) {
    address = addressMatch[1].trim();
  }

  // Extract item name
  let items = 'Standard AI Automation Service & Setup';
  if (lower.includes('shirt') || lower.includes('polo') || lower.includes('t-shirt')) {
    items = 'Cotton Polo Shirt';
  } else if (lower.includes('premium') || lower.includes('pro')) {
    items = 'All-in-One Annual Subscription Plan';
    total_amount = 14500;
  } else if (lower.includes('standard') || total_amount === 1450) {
    items = 'One Agent BD All-in-One Plan (Monthly)';
  }

  return {
    customer_name: defaultName || 'Customer',
    customer_phone: phone,
    customer_address: address || 'Details shared in conversation',
    items,
    quantity: 1,
    total_amount,
    currency: 'BDT',
    payment_method,
    payment_status,
    notes: 'Order captured automatically by One Agent BD AI assistant.'
  };
}

/**
 * Detects if an order has been confirmed in the conversation, extracts structured order info,
 * and saves it into the database.
 */
export async function detectAndRecordOrder(params: OrderDetectionParams): Promise<Order | null> {
  const { userId, customerId, customerName, platform, channelId, messageText, recentHistory, aiReplyText, isSimulation } = params;

  // Retrieve merchant-specific order confirmation rules
  const orderSettings = db.getOrderSettings(userId);
  if (!orderSettings.enabled) {
    console.log(`[Order Detection] Order detection is disabled in merchant settings for user ${userId}`);
    return null;
  }

  if (!hasOrderSignals(messageText, aiReplyText, userId)) {
    return null;
  }

  console.log(`[Order Detection] Order signals detected in message from customer ${customerId} (${customerName})`);

  let extracted: Partial<Order> | null = null;

  // Try LLM structured parsing via Gemini
  try {
    const ai = getGeminiClient();
    const reqFieldsList = [
      orderSettings.required_fields.customer_name ? 'Customer full name' : null,
      orderSettings.required_fields.customer_phone ? 'Bangladeshi mobile phone number (11-digit)' : null,
      orderSettings.required_fields.customer_address ? 'Delivery address with district/area' : null,
      orderSettings.required_fields.items_detail ? 'Product or service items' : null,
      orderSettings.required_fields.trx_id ? 'bKash/Nagad Transaction ID / Proof of payment' : null
    ].filter(Boolean).join(', ');

    const extractionPrompt = `You are a specialized Bangladeshi e-commerce and business order confirmation extractor.
Analyze the customer message, previous conversation, and assistant reply.

MERCHANT'S CUSTOM CONFIRMATION INSTRUCTIONS & RULES:
"${orderSettings.instructions}"

REQUIRED INFORMATION TO CONFIRM ORDER:
${reqFieldsList || 'General confirmation with contact and item details'}

Customer message:
"${messageText}"

Previous History:
${recentHistory || '(none)'}

Assistant Reply:
"${aiReplyText || ''}"

Follow the merchant's instructions strictly. If the customer satisfies the merchant's criteria and is placing/confirming an order, output a JSON object with these EXACT fields:
{
  "is_order": true,
  "customer_name": "<Customer full name if mentioned, otherwise '${customerName || 'Customer'}'>",
  "customer_phone": "<Extracted Bangladeshi phone number, e.g. 017xxxxxxxx>",
  "customer_address": "<Delivery or service address if given>",
  "items": "<Clear description of product/service ordered with size/variant if any>",
  "quantity": <number, default 1>,
  "total_amount": <number in BDT, e.g. 1450 or 650>,
  "payment_method": "<'cod' | 'bkash' | 'nagad' | 'bank' | 'unspecified'>",
  "payment_status": "<'pending' | 'paid'>",
  "notes": "<Brief note indicating how confirmation criteria were met>"
}

If the required criteria are NOT yet met (e.g. customer hasn't provided address/phone, or this is just a regular price inquiry/greeting), reply ONLY with:
{"is_order": false}

Respond ONLY with valid JSON, no markdown formatting.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: extractionPrompt
    });

    const responseText = response.text?.trim() || '';
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    if (parsed && parsed.is_order) {
      extracted = {
        customer_name: parsed.customer_name || customerName || 'Customer',
        customer_phone: parsed.customer_phone || (customerId.startsWith('+8801') || customerId.startsWith('01') ? customerId : undefined),
        customer_address: parsed.customer_address || 'Address provided in chat',
        items: parsed.items || 'Standard Product/Service Order',
        quantity: typeof parsed.quantity === 'number' ? parsed.quantity : 1,
        total_amount: typeof parsed.total_amount === 'number' ? parsed.total_amount : 1450,
        currency: 'BDT',
        payment_method: ['cod', 'bkash', 'nagad', 'bank'].includes(parsed.payment_method) ? parsed.payment_method : 'unspecified',
        payment_status: parsed.payment_status === 'paid' ? 'paid' : 'pending',
        notes: parsed.notes || 'AI confirmed order based on merchant instructions.'
      };
      console.log(`[Order Detection] Gemini extracted order: ${extracted.items} for BDT ${extracted.total_amount}`);
    }
  } catch (err: any) {
    console.warn('[Order Detection] Gemini extraction failed, falling back to heuristic parsing:', err?.message || err);
  }

  // Fallback to heuristic extractor if LLM didn't return an order but strong signals existed
  if (!extracted) {
    extracted = heuristicExtract(messageText, customerName || 'Customer', customerId);
  }

  // If this is just a simulation preview for testing settings
  if (isSimulation) {
    const simOrder: Order = {
      id: `sim_${Date.now()}`,
      user_id: userId,
      customer_id: customerId,
      customer_name: extracted.customer_name || customerName || 'Customer',
      customer_phone: extracted.customer_phone || '017XXXXXXXX',
      customer_address: extracted.customer_address || 'Customer provided address',
      platform,
      channel_id: channelId,
      items: extracted.items || 'Detected Product/Service',
      quantity: extracted.quantity || 1,
      total_amount: extracted.total_amount || 1450,
      currency: 'BDT',
      payment_method: extracted.payment_method || 'cod',
      payment_status: extracted.payment_status || 'pending',
      status: 'confirmed',
      order_source: 'ai_detected',
      notes: extracted.notes || 'Simulation test order matching your AI instructions.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return simOrder;
  }

  // Check if an order was recently created for this customer in the past 10 minutes with the same items
  // to avoid duplicate orders on rapid back-and-forth messages
  const existingOrders = db.getOrders(userId);
  const tenMinsAgo = Date.now() - 10 * 60000;
  const recentDuplicate = existingOrders.find(
    o => o.customer_id === customerId &&
         new Date(o.created_at).getTime() > tenMinsAgo &&
         o.items.toLowerCase() === (extracted?.items || '').toLowerCase()
  );

  if (recentDuplicate) {
    // Update existing order with newly available info (e.g. address or phone or notes)
    console.log(`[Order Detection] Updating recent existing order ${recentDuplicate.id} with new information`);
    const updated = db.updateOrder(recentDuplicate.id, {
      customer_phone: extracted.customer_phone || recentDuplicate.customer_phone,
      customer_address: extracted.customer_address !== 'Address provided in chat' ? extracted.customer_address : recentDuplicate.customer_address,
      payment_method: extracted.payment_method !== 'unspecified' ? extracted.payment_method : recentDuplicate.payment_method,
      payment_status: extracted.payment_status === 'paid' ? 'paid' : recentDuplicate.payment_status
    });
    return updated || recentDuplicate;
  }

  // Create new order
  const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  let finalNotes = extracted.notes || 'Automatically recorded by One Agent BD AI Assistant.';
  
  if (orderSettings.auto_reply_confirmation && orderSettings.confirmation_message_template) {
    const confirmationSlip = orderSettings.confirmation_message_template
      .replace(/{customer_name}/g, extracted.customer_name || 'Customer')
      .replace(/{items}/g, extracted.items || 'Order')
      .replace(/{order_id}/g, orderId)
      .replace(/{total_amount}/g, String(extracted.total_amount || 0));
    finalNotes = `${finalNotes} | Confirmation Slip: "${confirmationSlip}"`;
  }

  const newOrder: Order = {
    id: orderId,
    user_id: userId,
    customer_id: customerId,
    customer_name: extracted.customer_name || customerName || 'Customer',
    customer_phone: extracted.customer_phone,
    customer_address: extracted.customer_address || 'To be confirmed',
    platform,
    channel_id: channelId,
    items: extracted.items || 'Service Order',
    quantity: extracted.quantity || 1,
    total_amount: extracted.total_amount || 1450,
    currency: 'BDT',
    payment_method: extracted.payment_method || 'unspecified',
    payment_status: extracted.payment_status || 'pending',
    status: 'confirmed',
    order_source: 'ai_detected',
    notes: finalNotes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const savedOrder = db.createOrder(newOrder);
  console.log(`[Order Detection] New Order created successfully: ID ${savedOrder.id}, Amount: BDT ${savedOrder.total_amount}, Customer: ${savedOrder.customer_name}`);
  return savedOrder;
}
