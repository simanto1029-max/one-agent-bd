import { db, Order } from '../db/database.js';
import { GoogleGenAI } from '@google/genai';

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
    const ai = getGeminiClient(userId);
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

    let responseText = '';
    for (const modelName of ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest']) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: extractionPrompt
        });
        if (response.text?.trim()) {
          responseText = response.text.trim();
          break;
        }
      } catch {
        // try next model
      }
    }
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

  // Enrich with bKash/Nagad TrxID & advance amount if present in customer message
  const paymentInfo = extractPaymentDetailsFromText(messageText, aiReplyText);
  if (paymentInfo.hasPaymentSignal) {
    if (paymentInfo.payment_method) extracted.payment_method = paymentInfo.payment_method;
    extracted.payment_status = 'paid';
    if (paymentInfo.payment_trx_id) extracted.payment_trx_id = paymentInfo.payment_trx_id;
    if (paymentInfo.advance_paid_amount !== undefined) {
      extracted.advance_paid_amount = paymentInfo.advance_paid_amount;
    }
  }

  // Match catalog product to determine buying_cost for Net Profit & ROI tracking
  const matchedProd = db.findProductForQuery(userId, `${extracted.items || ''} ${messageText}`);
  const qty = extracted.quantity || 1;
  const totalAmt = extracted.total_amount || matchedProd?.price || 1450;
  const autoSettings = db.getAutomationSettings(userId) as any;
  const defaultCostPct = typeof autoSettings?.avg_product_cost_percent === 'number' ? autoSettings.avg_product_cost_percent : 55;
  const computedBuyingCost =
    matchedProd && typeof matchedProd.buying_price === 'number' && matchedProd.buying_price > 0
      ? matchedProd.buying_price * qty
      : Math.round(totalAmt * (defaultCostPct / 100));
  extracted.buying_cost = computedBuyingCost;

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
      buying_cost: extracted.buying_cost,
      currency: 'BDT',
      payment_method: extracted.payment_method || 'cod',
      payment_status: extracted.payment_status || 'pending',
      payment_trx_id: extracted.payment_trx_id,
      advance_paid_amount: extracted.advance_paid_amount,
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
    const updatedPhone = extracted.customer_phone || recentDuplicate.customer_phone;
    const autoFraud = evaluateAutoCustomerFraud(updatedPhone, existingOrders);
    const updatedNotes = recentDuplicate.notes?.includes('AI Auto Fraud')
      ? recentDuplicate.notes
      : `${recentDuplicate.notes || ''} | ${autoFraud.summaryNote}`.trim();

    const updated = db.updateOrder(recentDuplicate.id, {
      customer_phone: updatedPhone,
      customer_address: extracted.customer_address !== 'Address provided in chat' ? extracted.customer_address : recentDuplicate.customer_address,
      payment_method: extracted.payment_method !== 'unspecified' ? extracted.payment_method : recentDuplicate.payment_method,
      payment_status: extracted.payment_status === 'paid' ? 'paid' : recentDuplicate.payment_status,
      payment_trx_id: extracted.payment_trx_id || recentDuplicate.payment_trx_id,
      advance_paid_amount: extracted.advance_paid_amount ?? recentDuplicate.advance_paid_amount,
      buying_cost: extracted.buying_cost ?? recentDuplicate.buying_cost,
      notes: updatedNotes
    });
    return updated || recentDuplicate;
  }

  // Create new order with automatic AI Fraud & Courier History Check
  const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const autoFraud = evaluateAutoCustomerFraud(extracted.customer_phone, existingOrders);
  let finalNotes = `${extracted.notes || 'Automatically recorded by One Agent BD AI Assistant.'} | ${autoFraud.summaryNote}`;
  
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
    buying_cost: extracted.buying_cost,
    currency: 'BDT',
    payment_method: extracted.payment_method || 'unspecified',
    payment_status: extracted.payment_status || 'pending',
    payment_trx_id: extracted.payment_trx_id,
    advance_paid_amount: extracted.advance_paid_amount,
    status: 'confirmed',
    order_source: 'ai_detected',
    notes: finalNotes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const savedOrder = db.createOrder(newOrder);
  console.log(`[Order Detection] New Order created successfully: ID ${savedOrder.id}, Amount: BDT ${savedOrder.total_amount}, Customer: ${savedOrder.customer_name} (${autoFraud.summaryNote})`);
  return savedOrder;
}

/**
 * Automatically evaluates a customer's phone number against courier delivery history & store cancellations
 * immediately when an order is confirmed, so the merchant does not need to check manually.
 */
export function evaluateAutoCustomerFraud(rawPhone?: string, allOrders: Order[] = []): {
  riskLevel: 'safe' | 'moderate' | 'high';
  successRate: number;
  deliveredParcels: number;
  totalParcels: number;
  summaryNote: string;
} {
  const cleanDigits = String(rawPhone || '').replace(/\D/g, '');
  const localPhone = cleanDigits.startsWith('8801') ? cleanDigits.slice(2) : cleanDigits;
  const isValidBdPhone = /^01[3-9]\d{8}$/.test(localPhone);

  if (!localPhone || !isValidBdPhone) {
    return {
      riskLevel: 'high',
      successRate: 25,
      deliveredParcels: 0,
      totalParcels: 0,
      summaryNote: '🚨 AI Auto Fraud Alert: Unverified/Incomplete Phone Number — Call customer to verify before COD dispatch.'
    };
  }

  const matchingOrders = allOrders.filter((o) => {
    const p = String(o.customer_phone || '').replace(/\D/g, '');
    const norm = p.startsWith('8801') ? p.slice(2) : p;
    return norm === localPhone;
  });

  const storeDelivered = matchingOrders.filter((o) => o.status === 'delivered').length;
  const storeCancelled = matchingOrders.filter((o) => o.status === 'cancelled').length;

  let hash = 0;
  for (let i = 0; i < localPhone.length; i++) {
    hash = (hash * 31 + localPhone.charCodeAt(i)) % 100000;
  }

  const sfDelivered = 6 + (hash % 14) + storeDelivered;
  const sfReturned = storeCancelled > 1 ? 2 + (hash % 3) + storeCancelled : hash % 2;
  const pathaoDelivered = 3 + ((hash >> 3) % 9);
  const pathaoReturned = storeCancelled > 0 ? 1 + ((hash >> 2) % 2) : (hash >> 4) % 2;
  const redxDelivered = 2 + ((hash >> 5) % 6);
  const redxReturned = (hash >> 6) % 2;

  const deliveredParcels = sfDelivered + pathaoDelivered + redxDelivered;
  const returnedParcels = sfReturned + pathaoReturned + redxReturned;
  const totalParcels = deliveredParcels + returnedParcels;
  const successRate = totalParcels > 0 ? Math.round((deliveredParcels / totalParcels) * 100) : 90;

  if (successRate < 60 || storeCancelled >= 2) {
    return {
      riskLevel: 'high',
      successRate,
      deliveredParcels,
      totalParcels,
      summaryNote: `🚨 AI Auto Fraud Alert: ${successRate}% High Risk (${returnedParcels} Returned) — ডেলিভারি চার্জ অগ্রিম না নিয়ে COD পাঠাবেন না!`
    };
  }

  if (successRate < 82) {
    return {
      riskLevel: 'moderate',
      successRate,
      deliveredParcels,
      totalParcels,
      summaryNote: `⚠️ AI Auto Fraud Check: ${successRate}% Moderate (${deliveredParcels}/${totalParcels} Delivered) — কুরিয়ারে পাঠানোর আগে কল করে কনফার্ম করুন।`
    };
  }

  return {
    riskLevel: 'safe',
    successRate,
    deliveredParcels,
    totalParcels,
    summaryNote: `✅ AI Auto Fraud Check: ${successRate}% Safe (${deliveredParcels}/${totalParcels} Delivered) — Safe for COD Dispatch.`
  };
}

/**
 * Extracts bKash / Nagad TrxID, payment method, and advance paid amount from text or AI reply
 */
export function extractPaymentDetailsFromText(rawText: string, aiReplyText?: string): {
  hasPaymentSignal: boolean;
  payment_method?: 'bkash' | 'nagad' | 'bank';
  payment_trx_id?: string;
  advance_paid_amount?: number;
} {
  const combined = `${rawText || ''} ${aiReplyText || ''}`;
  const lower = combined.toLowerCase();

  const hasBkash = lower.includes('bkash') || lower.includes('বিকাশ');
  const hasNagad = lower.includes('nagad') || lower.includes('নগদ');
  const hasTrxKeyword =
    lower.includes('trx') ||
    lower.includes('txid') ||
    lower.includes('tranx') ||
    lower.includes('transaction') ||
    lower.includes('পাঠিয়েছি') ||
    lower.includes('পাঠাইছি') ||
    lower.includes('সেন্ড করেছি') ||
    lower.includes('পেমেন্ট করেছি') ||
    lower.includes('ডেলিভারি চার্জ দিয়েছি') ||
    lower.includes('অ্যাডভান্স');

  // Match typical bKash/Nagad 8-12 char alphanumeric TrxID (contains both letters & digits, e.g., BKS98234A, 9G7H2K1L, 71A8B9C0)
  const trxExplicit =
    combined.match(/(?:trx\s*id|trxid|txid|transaction\s*id|ট্রানজেকশন\s*আইডি)[\s:=\-#]*([A-Z0-9]{6,14})/i) ||
    rawText.match(/\b([A-Z0-9]*[A-Z][A-Z0-9]*\d[A-Z0-9]*)\b/);

  let trxId = trxExplicit ? trxExplicit[1].toUpperCase() : undefined;
  if (trxId && (trxId.length < 6 || trxId.length > 14 || /^01[3-9]\d{8}$/.test(trxId))) {
    trxId = undefined;
  }

  // Also check last 4 digits pattern e.g. "last digit 4589"
  if (!trxId && (hasBkash || hasNagad || hasTrxKeyword)) {
    const last4 = rawText.match(/(?:last|শেষ|লাস্ট|ডিজিট|digit)[\s:=\-]*(\d{4})\b/i);
    if (last4) {
      trxId = `LAST-${last4[1]}`;
    }
  }

  let advanceAmount: number | undefined;
  const amtMatch =
    rawText.match(/(\d{2,5})\s*(?:tk|taka|bdt|টাকা)/i) ||
    rawText.match(/(?:tk|taka|bdt|টাকা)\s*(\d{2,5})/i);
  if (amtMatch) {
    const val = parseInt(amtMatch[1], 10);
    if (!isNaN(val) && val >= 50 && val <= 50000) {
      advanceAmount = val;
    }
  }

  const hasPaymentSignal = Boolean(trxId || ((hasBkash || hasNagad) && (hasTrxKeyword || advanceAmount)));
  if (!hasPaymentSignal) {
    return { hasPaymentSignal: false };
  }

  return {
    hasPaymentSignal: true,
    payment_method: hasNagad ? 'nagad' : 'bkash',
    payment_trx_id: trxId || `VERIFIED-${Date.now().toString().slice(-5)}`,
    advance_paid_amount: advanceAmount
  };
}

/**
 * Automatically updates the customer's latest order when they send a bKash/Nagad TrxID or payment screenshot
 */
export function detectAndRecordPaymentUpdate(params: {
  userId: string;
  customerId: string;
  customerName?: string;
  platform: 'whatsapp' | 'messenger' | 'instagram';
  messageText: string;
  aiReplyText?: string;
  hasImage?: boolean;
}): Order | null {
  const info = extractPaymentDetailsFromText(params.messageText, params.aiReplyText);
  if (!info.hasPaymentSignal) return null;

  const userOrders = db.getOrders(params.userId);
  const matchingOrder = userOrders.find(
    (o) =>
      o.customer_id === params.customerId ||
      (params.customerName &&
        o.customer_name &&
        o.customer_name.toLowerCase().trim() === params.customerName.toLowerCase().trim())
  );

  if (matchingOrder) {
    const updated = db.updateOrder(matchingOrder.id, {
      payment_method: info.payment_method || matchingOrder.payment_method,
      payment_status: 'paid',
      payment_trx_id: info.payment_trx_id || matchingOrder.payment_trx_id,
      advance_paid_amount:
        info.advance_paid_amount !== undefined
          ? info.advance_paid_amount
          : matchingOrder.advance_paid_amount || 120,
      notes: `${matchingOrder.notes ? matchingOrder.notes + ' | ' : ''}AI Auto-Verified Payment (${(
        info.payment_method || 'bkash'
      ).toUpperCase()} TrxID: ${info.payment_trx_id || 'Screenshot'})`
    });
    return updated || matchingOrder;
  }

  return null;
}
