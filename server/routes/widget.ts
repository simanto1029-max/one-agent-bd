import { Router, Request, Response } from 'express';
import { db, Message, Order } from '../db/database.js';
import { getAuthenticatedUser } from './auth.js';
import { GoogleGenAI } from '@google/genai';
import { getUserSubscriptionStatus } from '../services/subscriptionService.js';
import { getCandidateGeminiKeys, CANDIDATE_MODELS } from '../services/aiService.js';
import { detectAudioMimeTypeFromBuffer } from '../services/audioDownloader.js';

export const widgetRouter = Router();

export interface WidgetConfig {
  user_id: string;
  enabled: boolean;
  bot_name: string;
  business_name: string;
  primary_color: string;
  position: 'bottom-right' | 'bottom-left';
  welcome_message: string;
  quick_prompts: string[];
  helpline_phone?: string;
  enable_order_tracking: boolean;
  updated_at: string;
}

const defaultConfigs: Record<string, WidgetConfig> = {};

// Track visitors who asked for a coupon code and are awaiting their business review/revenue answer
const pendingCouponVisitors = new Map<string, number>();

export function handleSaasCouponFlow(
  rawText: string,
  history: any[],
  visitorId: string,
  lang: 'bn' | 'en'
): string | null {
  const clean = (rawText || '').trim();
  if (!clean) return null;
  const q = clean.toLowerCase();

  // Check if recent bot message in history asked for business review / monthly revenue
  const historyList = Array.isArray(history) ? history : [];
  const lastBotMessages = historyList
    .filter((h: any) => h && (h.sender === 'bot' || h.sender === 'ai'))
    .slice(-2)
    .map((h: any) => String(h.text || '').toLowerCase());

  const askedInHistory = lastBotMessages.some(
    (msg) =>
      msg.includes('বিজনেস রিভিউ') ||
      msg.includes('মাসিক রেভিনিউ') ||
      msg.includes('business review') ||
      msg.includes('monthly revenue') ||
      msg.includes('sales revenue')
  );

  const pendingSince = pendingCouponVisitors.get(visitorId);
  const isPendingInMemory = Boolean(pendingSince && Date.now() - pendingSince < 30 * 60 * 1000);

  const isAskingForCoupon =
    q.includes('coupon') ||
    q.includes('cupon') ||
    q.includes('copon') ||
    q.includes('promo') ||
    q.includes('discount') ||
    q.includes('কুপন') ||
    q.includes('ডিসকাউন্ট') ||
    q.includes('প্রোমো') ||
    q.includes('ছাড়') ||
    q.includes('ছাড়') ||
    ((q.includes('code') || q.includes('কোড')) &&
      (q.includes('daw') ||
        q.includes('dao') ||
        q.includes('den') ||
        q.includes('chai') ||
        q.includes('cai') ||
        q.includes('give') ||
        q.includes('want') ||
        q.includes('need') ||
        q.includes('দাও') ||
        q.includes('দেন') ||
        q.includes('চাই') ||
        q.includes('লাগবে')));

  // Step 2: If the AI already asked for business review/revenue and the user is now answering
  if ((isPendingInMemory || askedInHistory) && !isAskingForCoupon) {
    pendingCouponVisitors.delete(visitorId);

    const nowMs = Date.now();
    const expiresAtMs = nowMs + 45 * 60 * 1000; // Strictly 45 minutes
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `OA15-${randomSuffix}`;

    db.createCoupon({
      id: `cpn_ai_${nowMs}_${randomSuffix.toLowerCase()}`,
      code,
      discount_type: 'percentage',
      discount_value: 15,
      min_amount: 0,
      max_uses: 1,
      used_count: 0,
      is_active: true,
      expires_at: new Date(expiresAtMs).toISOString(),
      created_at: new Date(nowMs).toISOString(),
      updated_at: new Date(nowMs).toISOString()
    });

    const expiryTimeBD = new Date(expiresAtMs).toLocaleTimeString('en-US', {
      timeZone: 'Asia/Dhaka',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return lang === 'en'
      ? `Thank you for sharing! 🎉 I have automatically generated a special **15% OFF** coupon code for you:\n\n🎟️ Coupon Code: **${code}**\n⏳ Valid Duration: **45 Minutes**\n🕒 Works Until: **${expiryTimeBD}** (BD Time)\n\n⚠️ Note: Whether you use this coupon code or not, it will automatically expire after 45 minutes (after ${expiryTimeBD}) and will no longer work. Click "Buy Plan Now" on your preferred plan to apply it right away!`
      : `ধন্যবাদ! 🎉 আপনার জন্য আমি অটোমেটিক একটি স্পেশাল **১৫% ডিসকাউন্ট কুপন কোড** তৈরি করে দিয়েছি:\n\n🎟️ কুপন কোড: **${code}**\n⏳ কতক্ষণ কাজ করবে: **৪৫ মিনিট**\n🕒 কয়টা পর্যন্ত কাজ করবে: **আজ ${expiryTimeBD} পর্যন্ত**\n\n⚠️ বিঃদ্রঃ আপনি এই কুপন কোডটি ব্যবহার করুন বা না করুন, ঠিক ৪৫ মিনিট পর (${expiryTimeBD}-এর পরে) এই কুপন কোডটি অটোমেটিক বন্ধ হয়ে যাবে এবং আর কাজ করবে না। তাই এখনই প্ল্যান সিলেক্ট করে "Buy Plan Now" বাটনে ক্লিক করে কোডটি ব্যবহার করুন!`;
  }

  // Step 1: User requests a coupon / discount code -> Ask for their business review / monthly revenue first
  if (isAskingForCoupon) {
    pendingCouponVisitors.set(visitorId, Date.now());
    return lang === 'en'
      ? 'Sure! I can automatically generate a special discount coupon code for you right away. 🎁 Before I create it, could you please tell me what your business review / monthly sales revenue is?'
      : 'অবশ্যই! আমি আপনাকে একটি স্পেশাল ডিসকাউন্ট কুপন কোড তৈরি করে দিচ্ছি। 🎁 তার আগে অনুগ্রহ করে বলুন—আপনার বিজনেস রিভিউ বা মাসিক সেলস/রেভিনিউ কত?';
  }

  return null;
}

// Detect whether user input is Bangla / Banglish ('bn') vs pure English ('en')
export function detectLanguageMode(text: string): 'bn' | 'en' {
  if (!text || !text.trim()) return 'bn';
  const clean = text.trim();

  // 1. Check for Bengali Unicode characters
  if (/[\u0980-\u09FF]/.test(clean)) {
    return 'bn';
  }

  // 2. Check for common Banglish words (whole word or clear substring boundaries)
  const lower = clean.toLowerCase();
  const banglishWords = [
    'ami', 'amar', 'amader', 'apni', 'apnar', 'apnader', 'tumi', 'tomar', 'tomader',
    'koto', 'kivabe', 'ki', 'keno', 'kothay', 'kokhon', 'kon', 'konta', 'kemon',
    'ache', 'ase', 'asen', 'achhe', 'nai', 'nei', 'hobe', 'hoy', 'hocche',
    'korbo', 'korte', 'kori', 'korben', 'koren', 'korle', 'kore', 'kora',
    'cai', 'chai', 'chacchi', 'lagbe', 'dorkar', 'pabo', 'pawa', 'jabe',
    'dam', 'daam', 'taka', 'tk', 'bhalo', 'valo', 'bhai', 'vai', 'vaia', 'bhaiya',
    'apu', 'dada', 'dost', 'salam', 'assalamu', 'walaikum', 'dhonnobad', 'shukriya',
    'bolen', 'bolun', 'bolbo', 'dekhan', 'pathan', 'pathabo', 'pathate',
    'kinte', 'kinbo', 'nebo', 'nibo', 'nite', 'niye', 'debo', 'dibo', 'dite',
    'daw', 'dao', 'den', 'din', 'jeno', 'pare', 'pari', 'parbo', 'parben',
    'sune', 'shune', 'bujhe', 'bujhte', 'uttor', 'kথা', 'kotha', 'bolle',
    'bangla', 'banglay', 'banglish', 'banglaish', 'somporke', 'shomporke',
    'bistarito', 'jonno', 'theke', 'jekono', 'vabe', 'bhabe', 'sobgula', 'shob',
    'mashe', 'mash', 'din', 'bochor', 'kom', 'beshi', 'koto taka', 'plan er',
    'kivabe kaj', 'free trail', 'bkash', 'nagad', 'rocket', 'upay', 'delivari',
    'chobi', 'pic', 'voice', 'kisu', 'kichu', 'ektu', 'ar', 'ebong', 'ba', 'tobe',
    'jodi', 'tahole', 'karon', 'mane', 'oivabe', 'evabe', 'jevabe', 'ekhane', 'oikhane'
  ];

  const tokens = lower.split(/[^a-z0-9]+/).filter(Boolean);
  for (const token of tokens) {
    if (banglishWords.includes(token)) {
      return 'bn';
    }
  }

  // Check multi-word Banglish phrases
  for (const phrase of ['dam koto', 'kivabe add', 'plan ki', 'free trail', 'website a', 'website e', 'kaj kore']) {
    if (lower.includes(phrase)) {
      return 'bn';
    }
  }

  return 'en';
}

export const ONE_AGENT_SAAS_KNOWLEDGE = `
OFFICIAL KNOWLEDGE BASE — ONE AGENT BD (Official Domain: oneagentbd.online)
One Agent BD is Bangladesh's #1 All-in-One Omnichannel AI Sales, Auto-Reply & Order Automation SaaS Platform for E-Commerce, F-Commerce, and Website Businesses.

CRITICAL ON-WEBSITE CONTEXT RULE (MUST OBEY):
- The user chatting with you is ALREADY on the official One Agent BD website (oneagentbd.online)!
- NEVER tell the user "বিস্তারিত জানতে আমাদের ওয়েবসাইট ভিজিট করুন" or "Visit our website (oneagentbd.com / oneagentbd.online) for details".
- Never use "oneagentbd.com" — our official domain is "oneagentbd.online" and our payment gateway is "pay.oneagentbd.online".
- Instead of telling them to visit the website, give the full details directly in your chat reply, or guide them to the "Pricing" section or the "Start 2 Days Free Trial" / "Get Started" buttons right here on this page!

1. SUPPORTED CHANNELS & INTEGRATIONS:
   - Facebook Page & Messenger: 24/7 Instant AI Auto-Reply to inbox messages and post comments via Official Meta Graph API (100% safe, 0% ban risk).
   - Instagram Business: Automated DM replies, Story mention replies, and comment-to-DM automation.
   - WhatsApp Business Cloud API: Official Meta WhatsApp Cloud API integration for instant customer support and order taking.
   - Website AI Chatbot Widget (1-Line Script): Easily embed a live multimodal AI chatbot on any website (Shopify, WordPress/WooCommerce, Custom HTML/React/Next.js, Wix) by copying 1 line of script code from the "Website AI Chatbot" tab in the dashboard. Also supports connecting custom domains and 1-Click AI Storefronts!

2. MULTIMODAL AI CAPABILITIES (TEXT + VOICE + PICTURE):
   - Multilingual Intelligence: Understands Bangla (বাংলা), Banglish (Romanized Bangla), and English effortlessly.
     * When a user asks in Bangla or Banglish, the AI replies in natural, polite Bangla (বাংলা).
     * When a user asks in English, the AI replies in clear, professional English.
   - Voice Message Understanding (🎤): Customers can record or send voice notes directly in chat. The AI listens to the audio, transcribes/understands the spoken question, and replies with full details.
   - Picture / Screenshot Recognition (🖼️): Customers can send product photos, payment screenshots, or website screenshots. The AI visually analyzes the image and provides accurate answers, product prices, or troubleshooting steps.

3. PRICING PLANS & 2-DAY FREE TRIAL (ONLY 2 OFFICIAL PLANS):
   - 2-Day Free Trial: Every merchant can activate a 2-Day Free Trial with 1 click from the Pricing section or Billing dashboard (no credit card required), OR purchase any plan directly anytime.
   - Plan 1 — Starter AI Plan: 1,250 TK / Month (৳1,250 BDT)
     * 1 AI Agent Workspace
     * WhatsApp, Facebook Messenger & Instagram Auto-Reply
     * Website AI Chatbot Widget & Website Store Integration included!
     * Up to 50 Products in AI Catalog
     * Autonomous Order Extraction (auto-saves customer Name, Phone, Address & Items to Orders Hub)
     * 1-Click Courier Booking (Steadfast, Pathao & RedX)
   - Plan 2 — Pro Business Plan (Most Popular): 1,950 TK / Month (৳1,950 BDT)
     * 3 AI Agent Workspaces
     * Everything in Starter AI Plan + Unlimited Product Catalog
     * Built-in Voice Note AI & Image/Screenshot Recognition
     * 1-Click Custom Website Storefront + Shopify & WooCommerce Live Sync
     * Human Call Request Escalation & Priority 24/7 Support
   - Custom Plan Durations: Users can switch between 1 Month, 2 Months, 3 Months, 6 Months, 1 Year (12M), 2 Years, 3 Years, or 6 Years right on the pricing table.

4. PAYMENT & COUPON CODE SYSTEM:
   - Payment Gateway: Official automated checkout via pay.oneagentbd.online supporting bKash, Nagad, Rocket, and Upay. Enter the Transaction ID (TrxID) for instant automated plan activation.
   - Coupon / Promo Codes: During checkout, users can click "Have a Coupon / Promo Code?" and apply promo codes created by the Admin for instant percentage (%) or fixed (TK) discounts.

5. HOW TO ADD THE AI CHATBOT TO A USER'S WEBSITE:
   - Step 1: Sign in to One Agent BD Dashboard -> Click "Website AI Chatbot" in the menu.
   - Step 2: Customize your Bot Name, Brand Color, Welcome Message, and Helpline Phone.
   - Step 3: Click "Copy Script Code" to copy the 1-line <script> tag and paste it before </body> on your WordPress, Shopify, Wix, or custom HTML/React website.
`;

export function sanitizeWebsiteBotReply(text: string): string {
  if (!text) return text;
  let cleaned = text
    // Always replace any .com domain typo with .online
    .replace(/oneagentbd\.com/gi, 'oneagentbd.online')
    // Remove sentences telling the user (who is already on the website) to visit the website
    .replace(/বিস্তারিত জানতে আমাদের ওয়েবসাইট\s*(\([^)]*\))?\s*ভিজিট করুন[।.!]*/gi, '')
    .replace(/বিস্তারিত জানতে আমাদের ওয়েবসাইট\s*(\([^)]*\))?\s*ভিজিট করুন[।.!]*/gi, '')
    .replace(/আমাদের ওয়েবসাইট\s*(\([^)]*\))?\s*ভিজিট করুন[।.!]*/gi, '')
    .replace(/আমাদের ওয়েবসাইট\s*(\([^)]*\))?\s*ভিজিট করুন[।.!]*/gi, '')
    .replace(/for more details,?\s*visit our website\s*(\([^)]*\))?[.,!]*/gi, '')
    .replace(/visit our website\s*(\([^)]*\))?\s*(for more details|to learn more)?[.,!]*/gi, '')
    .trim();

  return cleaned || text.replace(/oneagentbd\.com/gi, 'oneagentbd.online');
}

function getSaasBilingualFallback(
  question: string,
  lang: 'bn' | 'en',
  hasImage: boolean,
  hasAudio: boolean
): string {
  const q = (question || '').toLowerCase();

  // If image was uploaded and Gemini fallback triggered
  if (hasImage && (!q || q.length < 3)) {
    return lang === 'en'
      ? 'I have received and analyzed your image! With One Agent BD, our Multimodal AI recognizes product photos, payment screenshots, and website setups automatically. We offer two plans: Starter AI Plan (1,250 TK/month) and Pro Business Plan (1,950 TK/month), plus a 2-Day Free Trial. How can I help you with this image?'
      : 'আমি আপনার পাঠানো ছবিটি পেয়েছি এবং বিশ্লেষণ করেছি! 📸 One Agent BD-এর মাল্টিমোডাল AI প্রোডাক্টের ছবি, পেমেন্ট স্ক্রিনশট এবং ওয়েবসাইট সেটআপ স্বয়ংক্রিয়ভাবে বুঝতে পারে। আমাদের ২টি প্ল্যান রয়েছে: Starter AI Plan (৳১,২৫০/মাস) এবং Pro Business Plan (৳১,৯৫০/মাস), সাথে ২ দিনের ফ্রি ট্রায়াল। এই ছবিটি সম্পর্কে আপনার কোনো বিশেষ প্রশ্ন থাকলে জানান!';
  }

  // If voice note was sent and Gemini fallback triggered
  if (hasAudio && (!q || q.length < 3)) {
    return lang === 'en'
      ? 'I have listened to your voice message! 🎤 One Agent BD supports real-time Voice AI on WhatsApp, Messenger, Instagram, and Website Chatbots. You can start with our 2-Day Free Trial, or choose our Starter AI Plan (1,250 TK/mo) or Pro Business Plan (1,950 TK/mo). Let me know what details you need!'
      : 'আমি আপনার ভয়েস মেসেজটি মনোযোগ দিয়ে শুনেছি! 🎤 One Agent BD-এর মাধ্যমে আপনার ওয়েবসাইট, WhatsApp, Messenger এবং Instagram-এ কাস্টমাররা ভয়েস মেসেজ বা ছবি পাঠালে AI তা শুনে ও বুঝে সাথে সাথে উত্তর দেয়। আমাদের প্ল্যান ৳১,২৫০/মাস এবং ৳১,৯৫০/মাস (সাথে ২ দিনের ফ্রি ট্রায়াল)। আর কী জানতে চান বলুন!';
  }

  // Pricing & Plans
  if (
    q.includes('price') ||
    q.includes('cost') ||
    q.includes('plan') ||
    q.includes('package') ||
    q.includes('dam') ||
    q.includes('koto') ||
    q.includes('taka') ||
    q.includes('tk') ||
    q.includes('1250') ||
    q.includes('1950') ||
    q.includes('দাম') ||
    q.includes('কত') ||
    q.includes('প্ল্যান') ||
    q.includes('প্যাকেজ')
  ) {
    return lang === 'en'
      ? 'One Agent BD offers 2 transparent plans plus a 2-Day Free Trial:\n1) Starter AI Plan — 1,250 TK/month (Includes WhatsApp, Messenger, Instagram & Website AI Chatbot, 50 Products, Auto Order & Courier Booking).\n2) Pro Business Plan — 1,950 TK/month (Includes 3 AI Agents, Voice & Image AI Recognition, Unlimited Products, Multi-Store Sync & Priority 24/7 Support).\nYou can also apply a Coupon Code at checkout!'
      : 'One Agent BD-তে ২ দিনের ফ্রি ট্রায়াল সহ ২টি অফিসিয়াল প্ল্যান রয়েছে:\n১) Starter AI Plan — ৳১,২৫০/মাস (WhatsApp, Messenger, Instagram এবং Website AI Chatbot, ৫০টি প্রোডাক্ট ক্যাটালগ, অটো অর্ডার ও কুরিয়ার বুকিং)।\n২) Pro Business Plan — ৳১,৯৫০/মাস (৩টি AI এজেন্ট, ভয়েস ও ছবির AI রিকগনিশন, আনলিমিটেড প্রোডাক্ট এবং মাল্টি-স্টোর সিঙ্ক)।\nপেমেন্ট করার সময় কুপন কোড (Coupon Code) ব্যবহারের সুবিধাও রয়েছে!';
  }

  // Website AI Chatbot integration
  if (
    q.includes('website') ||
    q.includes('widget') ||
    q.includes('embed') ||
    q.includes('script') ||
    q.includes('shopify') ||
    q.includes('wordpress') ||
    q.includes('add') ||
    q.includes('ওয়েবসাইট') ||
    q.includes('ওয়েবসাইট')
  ) {
    return lang === 'en'
      ? 'Adding the One Agent BD AI Chatbot to your website takes just 60 seconds! Both our 1,250 TK and 1,950 TK plans include Website AI Integration. Simply go to Dashboard -> "Website AI Chatbot", customize your brand color & welcome message, copy the 1-line <script> tag, and paste it before </body> on your WordPress, Shopify, Wix, or custom website!'
      : 'আমাদের ১,২৫০ টাকা এবং ১,৯৫০ টাকা—উভয় প্ল্যানেই ওয়েবসাইট যুক্ত করার সুবিধা রয়েছে! ড্যাশবোর্ডের "Website AI Chatbot" অপশনে গিয়ে আপনার ব্র্যান্ড কালার ও নাম সেট করে মাত্র ১ লাইনের Script কোডটি কপি করে আপনার WordPress, Shopify বা যেকোনো ওয়েবসাইটে বসিয়ে দিলেই ঠিক এই চ্যাটবটটির মতোই আপনার ওয়েবসাইটেও AI চ্যাটবট চালু হয়ে যাবে!';
  }

  // Free Trial
  if (
    q.includes('trial') ||
    q.includes('trail') ||
    q.includes('free') ||
    q.includes('test') ||
    q.includes('ট্রায়াল') ||
    q.includes('ফ্রি')
  ) {
    return lang === 'en'
      ? 'Yes! You can activate a 2-Day Free Trial right from our Pricing section with 1 click—no credit card required. You can test WhatsApp, Messenger, Instagram, and Website AI Auto-Reply for 2 full days, or purchase a direct plan anytime!'
      : 'জ্বী! আমাদের প্রাইসিং সেকশন থেকে আপনি ১-ক্লিকে ২ দিনের ফ্রি ট্রায়াল (2 Days Free Trial) চালু করতে পারবেন অথবা সরাসরি যেকোনো প্ল্যান কিনতে পারবেন। ট্রায়ালে সব ফিচার সম্পূর্ণ ফ্রিতে টেস্ট করার সুযোগ থাকছে!';
  }

  // Voice & Picture / Image capabilities
  if (
    q.includes('voice') ||
    q.includes('audio') ||
    q.includes('picture') ||
    q.includes('image') ||
    q.includes('photo') ||
    q.includes('chobi') ||
    q.includes('ভয়েস') ||
    q.includes('ছবি') ||
    q.includes('অডিও')
  ) {
    return lang === 'en'
      ? 'Yes! Our AI Chatbot supports both Voice Messages (🎤) and Picture/Screenshot uploads (🖼️). Customers can speak or send photos in Bangla, Banglish, or English, and our AI listens to the audio and analyzes the image to reply with accurate details!'
      : 'জ্বী! আমাদের AI চ্যাটবটে কাস্টমাররা সরাসরি ভয়েস মেসেজ (🎤) এবং ছবি/স্ক্রিনশট (🖼️) পাঠাতে পারবেন। আমাদের AI ভয়েস শুনে এবং ছবি দেখে বাংলা, বাংলিশ বা ইংরেজিতে নির্ভুলভাবে বিস্তারিত উত্তর দিতে সক্ষম!';
  }

  // Payment & Coupon
  if (
    q.includes('payment') ||
    q.includes('pay') ||
    q.includes('bkash') ||
    q.includes('nagad') ||
    q.includes('coupon') ||
    q.includes('discount') ||
    q.includes('পেমেন্ট') ||
    q.includes('বিকাশ') ||
    q.includes('নগদ') ||
    q.includes('কুপন')
  ) {
    return lang === 'en'
      ? 'You can pay securely via bKash, Nagad, Rocket, or Upay through our official gateway (pay.oneagentbd.online). Simply enter your Transaction ID (TrxID) for instant activation, and if you have a Promo/Coupon Code, you can apply it at checkout for an instant discount!'
      : 'আমাদের অফিসিয়াল পেমেন্ট গেটওয়ে (pay.oneagentbd.online)-এর মাধ্যমে বিকাশ, নগদ বা রকেটে পেমেন্ট করে TrxID দিলেই প্ল্যান সাথে সাথে অ্যাক্টিভ হয়ে যাবে! এছাড়া পেমেন্টের সময় Coupon Code ব্যবহার করে ইনস্ট্যান্ট ডিসকাউন্ট পাবেন।';
  }

  // Courier & Order automation
  if (
    q.includes('order') ||
    q.includes('courier') ||
    q.includes('steadfast') ||
    q.includes('pathao') ||
    q.includes('redx') ||
    q.includes('অর্ডার') ||
    q.includes('কুরিয়ার')
  ) {
    return lang === 'en'
      ? 'When a customer shares their name, phone number, and address in chat, One Agent BD automatically extracts the order into your Orders Hub and lets you book parcels to Steadfast, Pathao, or RedX with 1 click!'
      : 'কাস্টমার চ্যাটে নাম, মোবাইল নাম্বার এবং ঠিকানা দিলেই আমাদের AI স্বয়ংক্রিয়ভাবে অর্ডার কনফার্ম করে ড্যাশবোর্ডের Orders Hub-এ সেভ করে ফেলে এবং ১-ক্লিকে Steadfast, Pathao বা RedX কুরিয়ারে পার্সেল বুক করা যায়!';
  }

  // Default comprehensive SaaS overview
  return lang === 'en'
    ? 'Welcome to One Agent BD! 🌟 We provide 24/7 AI Auto-Reply & Order Automation for WhatsApp, Facebook Messenger, Instagram, and Websites. Our Starter AI Plan is 1,250 TK/mo, Pro Business Plan is 1,950 TK/mo, and we offer a 2-Day Free Trial. You can ask me anything in English, Bangla, or Banglish—or send a voice note (🎤) or picture (🖼️)!'
    : 'আসসালামু আলাইকুম! 🌟 One Agent BD-তে আপনাকে স্বাগতম। আমাদের প্ল্যাটফর্মের মাধ্যমে আপনার Facebook, Instagram, WhatsApp এবং Website-এ ২৪/৭ অটোমেটিক AI রিপ্লাই ও অর্ডার কনফার্মেশন চালু করতে পারবেন। আমাদের প্ল্যান ৳১,২৫০/মাস এবং ৳১,৯৫০/মাস (সাথে ২ দিনের ফ্রি ট্রায়াল)। আপনি টেক্সট, ভয়েস (🎤) অথবা ছবি (🖼️) পাঠিয়ে যেকোনো প্রশ্ন করতে পারেন!';
}

function getWidgetConfig(userId: string): WidgetConfig {
  if (userId === 'saas_official') {
    const adminCustom = defaultConfigs['usr_admin_1'];
    const sysSettings = db.getSettings();
    return {
      user_id: 'saas_official',
      enabled: adminCustom ? adminCustom.enabled : true,
      bot_name: adminCustom?.bot_name || `${sysSettings.site_name || 'One Agent BD'} AI`,
      business_name: adminCustom?.business_name || `${sysSettings.site_name || 'One Agent BD'} Official`,
      primary_color: adminCustom?.primary_color || '#7F22FE',
      position: adminCustom?.position || 'bottom-right',
      welcome_message:
        adminCustom?.welcome_message ||
        'আসসালামু আলাইকুম! 👋 Welcome to One Agent BD! আমাদের SaaS প্ল্যান (৳1,250 ও ৳1,950), 2-Day Free Trial, বা ওয়েবসাইট/সোশ্যাল মিডিয়া AI অটোমেশন সম্পর্কে বাংলা, বাংলিশ বা English-এ প্রশ্ন করুন। চাইলে ভয়েস (🎤) বা ছবিও (🖼️) পাঠাতে পারেন!',
      quick_prompts: adminCustom?.quick_prompts?.length
        ? adminCustom.quick_prompts
        : [
            '💎 প্ল্যানগুলোর দাম ও বিস্তারিত কী কী? (Plans & Pricing)',
            '🌐 আমার ওয়েবসাইটে AI চ্যাটবট কীভাবে অ্যাড করব?',
            '🎁 2 Days Free Trial কীভাবে চালু করব?',
            '🚀 How does WhatsApp, Messenger & Website AI work?'
          ],
      helpline_phone: adminCustom?.helpline_phone || sysSettings.bkash_number || '01811-998877',
      enable_order_tracking: true,
      updated_at: adminCustom?.updated_at || new Date().toISOString()
    };
  }

  if (defaultConfigs[userId]) {
    return defaultConfigs[userId];
  }
  const user = db.getProfileById(userId);
  const sysSettings = db.getSettings();

  const cfg: WidgetConfig = {
    user_id: userId,
    enabled: true,
    bot_name: 'AI Sales Assistant',
    business_name: sysSettings.site_name || user?.full_name || 'One Agent BD Shop',
    primary_color: '#7F22FE',
    position: 'bottom-right',
    welcome_message:
      'Welcome! 🌟 আসসালামু আলাইকুম! How can I assist you today? Feel free to ask in Bangla, Banglish, or English—or send a voice note or photo!',
    quick_prompts: [
      '🛍️ প্রোডাক্টের দাম ও বিস্তারিত জানতে চাই',
      '📦 আমি একটি অর্ডার করতে চাই',
      '🚚 Delivery charges & timeline',
      '📞 Contact customer support'
    ],
    helpline_phone: '01811-998877',
    enable_order_tracking: true,
    updated_at: new Date().toISOString()
  };
  defaultConfigs[userId] = cfg;
  return cfg;
}

// GET /api/widget/config?agentId=...
widgetRouter.get('/config', (req: Request, res: Response) => {
  const agentId = (req.query.agentId as string) || (req.headers['x-user-id'] as string) || 'saas_official';
  const config = getWidgetConfig(agentId);

  if (agentId !== 'saas_official') {
    const subStatus = getUserSubscriptionStatus(agentId);
    if (subStatus.isGated) {
      return res.json({
        success: true,
        config: {
          ...config,
          enabled: false,
          welcome_message: 'The AI Chatbot subscription for this store is currently inactive or expired.'
        },
        isGated: true
      });
    }
  }

  return res.json({
    success: true,
    config
  });
});

// POST /api/widget/settings
widgetRouter.post('/settings', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const {
    bot_name,
    business_name,
    primary_color,
    position,
    welcome_message,
    quick_prompts,
    helpline_phone,
    enable_order_tracking,
    enabled
  } = req.body;

  const current = getWidgetConfig(user.id);
  const updated: WidgetConfig = {
    ...current,
    bot_name: bot_name?.trim() || current.bot_name,
    business_name: business_name?.trim() || current.business_name,
    primary_color: primary_color?.trim() || current.primary_color,
    position: position === 'bottom-left' ? 'bottom-left' : 'bottom-right',
    welcome_message: welcome_message?.trim() || current.welcome_message,
    quick_prompts: Array.isArray(quick_prompts) ? quick_prompts : current.quick_prompts,
    helpline_phone: helpline_phone?.trim() || current.helpline_phone,
    enable_order_tracking:
      enable_order_tracking !== undefined ? Boolean(enable_order_tracking) : current.enable_order_tracking,
    enabled: enabled !== undefined ? Boolean(enabled) : current.enabled,
    updated_at: new Date().toISOString()
  };

  defaultConfigs[user.id] = updated;
  return res.json({
    success: true,
    message: 'Website AI Chatbot settings saved successfully!',
    config: updated
  });
});

// POST /api/widget/chat - Handles multimodal (Text + Voice + Image) chat from the Website AI Chatbot
widgetRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const {
      agentId,
      visitorId,
      message,
      customerName,
      imageBase64,
      imageMimeType,
      audioBase64,
      audioMimeType,
      audioTranscript,
      history
    } = req.body;

    const targetUserId = agentId || (req.headers['x-user-id'] as string) || 'saas_official';
    const isSaasOfficial = targetUserId === 'saas_official';

    // Verify merchant's subscription status if not official SaaS bot
    if (!isSaasOfficial) {
      const subStatus = getUserSubscriptionStatus(targetUserId);
      if (subStatus.isGated) {
        return res.status(403).json({
          success: false,
          error: 'Subscription expired or inactive. AI Chatbot is disabled.',
          isGated: true,
          reply: 'The AI Chatbot subscription for this store is currently inactive or expired.'
        });
      }
    }

    const hasImage = Boolean(imageBase64 && typeof imageBase64 === 'string');
    const hasAudio = Boolean(audioBase64 && typeof audioBase64 === 'string');
    const rawText = (typeof message === 'string' ? message.trim() : '') || (typeof audioTranscript === 'string' ? audioTranscript.trim() : '');

    if (!rawText && !hasImage && !hasAudio) {
      return res.status(400).json({ error: 'Please provide a text message, voice recording, or image.' });
    }

    const detectedLang = detectLanguageMode(rawText);
    const cleanVisitorId = (visitorId || `web_vis_${Date.now()}`).trim();
    const config = getWidgetConfig(targetUserId);
    const effectiveOwnerId = isSaasOfficial ? 'usr_admin_001' : targetUserId;

    // Save inbound message to merchant/admin inbox
    let channelId = 'chn_website_default';
    const cleanCustomerName = customerName?.trim() || (isSaasOfficial ? 'SaaS Website Visitor' : 'Website Visitor');
    {
      const userChannels = db.getChannels(effectiveOwnerId);
      const webChannel = userChannels.find((c) => c.identifier === 'website_widget');
      if (webChannel) channelId = webChannel.id;

      const attachmentNote = [
        hasAudio ? '[🎤 Voice Message]' : '',
        hasImage ? '[🖼️ Image Attached]' : '',
        rawText
      ]
        .filter(Boolean)
        .join(' ');

      const inboundMsg: Message = {
        id: `msg_web_in_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        user_id: effectiveOwnerId,
        channel_id: channelId,
        platform: 'whatsapp',
        customer_id: cleanVisitorId,
        customer_name: cleanCustomerName,
        direction: 'inbound',
        message_text: attachmentNote || '[Media Attachment]',
        is_ai_reply: false,
        status: 'received',
        created_at: new Date().toISOString()
      };
      db.createMessage(inboundMsg);
    }

    // Build context for Gemini (links saas_official to Admin profile & live Admin settings)
    const profile =
      db.getProfileById(effectiveOwnerId) ||
      (isSaasOfficial ? db.getProfiles().find((p) => p.role === 'admin') : undefined);
    if (!isSaasOfficial) {
      const sub = db.getSubscriptionByUserId(effectiveOwnerId);
      const isExpired = !sub || (sub.status !== 'active' && sub.status !== 'trialing') || new Date(sub.end_date) <= new Date();
      if (isExpired) {
        return res.json({
          reply:
            detectedLang === 'bn'
              ? 'দুঃখিত, এই স্টোরের AI চ্যাট সাপোর্ট সাময়িকভাবে বন্ধ রয়েছে। অনুগ্রহ করে সরাসরি স্টোরের ফোন নাম্বারে যোগাযোগ করুন।'
              : 'Sorry, AI chat support for this store is currently paused. Please contact the store directly.'
        });
      }
    }
    const sysSettings = db.getSettings() as any;
    const candidateKeys = getCandidateGeminiKeys(profile?.llm_api_key);
    const apiKey = candidateKeys[0] || process.env.GEMINI_API_KEY;
    const activePlans = db.getPlans().filter((p) => p.is_active);
    const livePlansContext =
      activePlans.length > 0
        ? `\nLIVE ADMIN PRICING PLANS & SYSTEM SETTINGS:\n` +
          activePlans
            .map(
              (p) =>
                `- ${p.name}: ৳${p.price}/month (${p.currency}) — Max Channels: ${p.feature_config?.max_channels || 3}, AI Replies: Unlimited (0 TK per-msg fee) — Features: ${(p.features || []).join(', ')}`
            )
            .join('\n') +
          `\n- Official Support Email: ${sysSettings.support_email || 'support@oneagentbd.online'}` +
          (sysSettings.bkash_number ? `\n- Official bKash Number: ${sysSettings.bkash_number}` : '') +
          (sysSettings.nagad_number ? `\n- Official Nagad Number: ${sysSettings.nagad_number}` : '')
        : '';

    // Fetch product catalog (for Admin or Merchant)
    const merchantProducts = db.getProducts(effectiveOwnerId);
    const catalogContext =
      merchantProducts.length > 0
        ? `\nPRODUCT / SERVICE CATALOG:\n` +
          merchantProducts
            .map(
              (p) =>
                `- ${p.name}: ৳${p.price} ${p.currency} (${
                  p.stock_status === 'out_of_stock'
                    ? 'Out of Stock'
                    : p.stock_status === 'low_stock'
                    ? 'Low Stock'
                    : 'In Stock'
                }) — ${p.description || ''}`
            )
            .join('\n')
        : '';

    const adminCustomPrompt = profile?.system_prompt ? `\nADMIN / OWNER CUSTOM TRAINING INSTRUCTIONS:\n${profile.system_prompt}\n` : '';

    const baseKnowledge = isSaasOfficial
      ? `${ONE_AGENT_SAAS_KNOWLEDGE}\n${livePlansContext}${adminCustomPrompt}${catalogContext}`
      : `${profile?.system_prompt || `You are the official AI Sales & Support Assistant for "${config.business_name}".`}\n${catalogContext}\n\n${ONE_AGENT_SAAS_KNOWLEDGE}`;

    const recentHistoryText = Array.isArray(history)
      ? history
          .slice(-6)
          .map((h: any) => `${h.sender === 'user' ? 'Visitor' : 'AI Assistant'}: ${h.text || ''}`)
          .join('\n')
      : '';

    const languageDirective = `
CRITICAL LANGUAGE MATCHING RULE (MUST FOLLOW STRICTLY):
1. If the user's message (or spoken audio) is in Bangla (বাংলা) OR Banglish (Bengali written in English/Latin alphabet, such as "apnader plan er dam koto", "free trial kivabe nibo", "website a kivabe add korbo", "vai details bolen"), you MUST reply in natural, polite, and clear Bangla script (বাংলা ভাষায় উত্তর দিন).
2. If the user's message (or spoken audio) is in pure English (such as "What are your pricing plans?", "How do I add the chatbot to my website?", "Tell me about the 2-day free trial"), you MUST reply in clear, natural, and professional English.
3. Detected language hint for current text input: ${
      rawText
        ? detectedLang === 'bn'
          ? 'BANGLA / BANGLISH -> Reply in BANGLA (বাংলা স্ক্রিপ্টে)'
          : 'ENGLISH -> Reply in ENGLISH'
        : 'Listen to the attached voice audio or inspect the image and reply in the language used by the user (default to Bangla + English summary if image-only).'
    }
`;

    let aiReplyText = '';

    // 0. Check if user is requesting a coupon code or answering the AI's business review/revenue question for a 45-min auto coupon
    if (isSaasOfficial && rawText) {
      const couponFlowReply = handleSaasCouponFlow(rawText, history || [], cleanVisitorId, detectedLang);
      if (couponFlowReply) {
        aiReplyText = couponFlowReply;
      }
    }

    if (!aiReplyText && apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const parts: any[] = [];

        // Attach Image inlineData if present
        if (hasImage && imageBase64) {
          const cleanB64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
          parts.push({
            inlineData: {
              data: cleanB64,
              mimeType: imageMimeType || 'image/jpeg'
            }
          });
        }

        // Attach Voice Audio inlineData if present
        if (hasAudio && audioBase64) {
          const cleanAudioB64 = audioBase64.includes(',') ? audioBase64.split(',')[1] : audioBase64;
          const detectedAudioMime = detectAudioMimeTypeFromBuffer(
            Buffer.from(cleanAudioB64, 'base64'),
            audioMimeType || 'audio/webm'
          );
          parts.push({
            inlineData: {
              data: cleanAudioB64,
              mimeType: detectedAudioMime
            }
          });
        }

        const promptText = `${baseKnowledge}

${languageDirective}

IMPORTANT REMINDER:
- The visitor is ALREADY on our website (oneagentbd.online). Do NOT say "বিস্তারিত জানতে আমাদের ওয়েবসাইট ভিজিট করুন" or "Visit our website". Answer directly in this chat or tell them to check the Pricing section right on this page!
- Official domain is oneagentbd.online (never say oneagentbd.com).

${recentHistoryText ? `Recent Conversation History:\n${recentHistoryText}\n` : ''}
${hasImage ? 'The visitor has attached an image/screenshot. Carefully inspect the image and answer their question or explain what is shown in relation to One Agent BD / the store.\n' : ''}
${hasAudio ? 'The visitor has sent a voice message. Listen carefully to the spoken audio and answer their question concisely in 2-3 short sentences.\n' : ''}
Visitor Message: "${rawText || (hasAudio ? '[Voice Message Attached - Please listen and reply concisely]' : '[Image Attached - Please analyze and reply concisely]')}"

Provide a SHORT, helpful, accurate, and friendly response (2-3 concise sentences max) following the CRITICAL LANGUAGE MATCHING RULE above:`;

        parts.push({ text: promptText });

        for (const model of CANDIDATE_MODELS) {
          try {
            const response = await ai.models.generateContent({
              model,
              contents: parts.length === 1 ? promptText : { parts }
            });
            if (response.text?.trim()) {
              aiReplyText = sanitizeWebsiteBotReply(response.text.trim());
              break;
            }
          } catch (mErr: any) {
            // Try next model
          }
        }
      } catch (geminiErr: any) {
        console.warn('Gemini multimodal widget fallback:', geminiErr.message);
      }
    }

    // Intelligent Bilingual Fallback if Gemini is unavailable
    if (!aiReplyText) {
      if (isSaasOfficial) {
        aiReplyText = getSaasBilingualFallback(rawText, detectedLang, hasImage, hasAudio);
      } else {
        const q = rawText.toLowerCase();
        if (
          q.includes('plan') ||
          q.includes('saas') ||
          q.includes('one agent') ||
          q.includes('1250') ||
          q.includes('1950') ||
          q.includes('website') ||
          q.includes('trial')
        ) {
          aiReplyText = getSaasBilingualFallback(rawText, detectedLang, hasImage, hasAudio);
        } else if (hasImage) {
          aiReplyText =
            detectedLang === 'en'
              ? `Thank you for sending the image! 📸 At ${config.business_name}, we have received your photo. Would you like to know the price, stock availability, or place an order for this item?`
              : `আপনার পাঠানো ছবিটি আমরা পেয়েছি! 📸 ${config.business_name}-এ আপনাকে স্বাগতম। আপনি কি এই প্রোডাক্টটির দাম, স্টক নাকি অর্ডার করার নিয়ম জানতে চাচ্ছেন?`;
        } else if (hasAudio) {
          aiReplyText =
            detectedLang === 'en'
              ? `Thank you for your voice message! 🎤 We have received your audio at ${config.business_name}. Please let us know if you'd like to check product prices or confirm an order!`
              : `আপনার ভয়েস মেসেজটি আমরা শুনেছি! 🎤 ${config.business_name}-এ আপনাকে স্বাগতম। প্রোডাক্টের দাম বা অর্ডার কনফার্ম করতে আপনার নাম, ঠিকানা ও মোবাইল নাম্বারটি জানান!`;
        } else if (
          q.includes('offer') ||
          q.includes('price') ||
          q.includes('cost') ||
          q.includes('dam') ||
          q.includes('koto') ||
          q.includes('দাম') ||
          q.includes('কত')
        ) {
          const prodList =
            merchantProducts.length > 0
              ? merchantProducts
                  .slice(0, 3)
                  .map((p) => `${p.name} (৳${p.price})`)
                  .join(', ')
              : '';
          aiReplyText =
            detectedLang === 'en'
              ? `Welcome to ${config.business_name}! 🌟 ${prodList ? `Our popular items include: ${prodList}. ` : ''}Which product's price and details would you like to know?`
              : `আসসালামু আলাইকুম! 🌟 ${config.business_name}-এ আপনাকে স্বাগতম। ${prodList ? `আমাদের জনপ্রিয় প্রোডাক্টসমূহ: ${prodList}। ` : ''}আপনি কোন প্রোডাক্ট বা সার্ভিসের দাম জানতে চাচ্ছেন?`;
        } else if (
          q.includes('order') ||
          q.includes('buy') ||
          q.includes('purchase') ||
          q.includes('অর্ডার') ||
          q.includes('কিনব')
        ) {
          aiReplyText =
            detectedLang === 'en'
              ? `To confirm your order with ${config.business_name}, please share your Full Name, Delivery Address, and Mobile Number. We will book your order right away!`
              : `অর্ডার কনফার্ম করতে অনুগ্রহ করে আপনার পূর্ণ নাম, সম্পূর্ণ ডেলিভারি ঠিকানা এবং সচল মোবাইল নাম্বারটি লিখে পাঠান। আমরা এখনি আপনার অর্ডার বুক করে নিচ্ছি!`;
        } else if (
          q.includes('delivery') ||
          q.includes('charge') ||
          q.includes('shipping') ||
          q.includes('ডেলিভারি') ||
          q.includes('চার্জ')
        ) {
          aiReplyText =
            detectedLang === 'en'
              ? `Our delivery charges: Inside Dhaka 60 TK (1-2 days) and Outside Dhaka nationwide 120 TK (2-3 days). Cash on Delivery (COD) is available! 🚚`
              : `আমাদের ডেলিভারি চার্জ: ঢাকার ভেতরে ৳৬০ (১-২ দিন) এবং ঢাকার বাইরে সারাদেশে ৳১২০ (২-৩ দিন)। ক্যাশ অন ডেলিভারি (COD) সুবিধা রয়েছে! 🚚`;
        } else {
          aiReplyText = getSaasBilingualFallback(rawText, detectedLang, hasImage, hasAudio);
        }
      }
    }

    // Save outbound AI message to merchant/admin inbox
    let createdOrder: Order | null = null;
    {
      const outboundMsg: Message = {
        id: `msg_web_out_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        user_id: effectiveOwnerId,
        channel_id: channelId,
        platform: 'whatsapp',
        customer_id: cleanVisitorId,
        customer_name: cleanCustomerName,
        direction: 'outbound',
        message_text: aiReplyText,
        is_ai_reply: true,
        status: 'sent',
        created_at: new Date().toISOString()
      };
      db.createMessage(outboundMsg);

      // Autonomous Order Detection from visitor chat
      const phoneMatch = rawText.match(/(01[3-9]\d{8})/);
      if (
        phoneMatch &&
        (rawText.toLowerCase().includes('order') ||
          rawText.includes('অর্ডার') ||
          rawText.includes('ঠিকানা') ||
          rawText.includes('রোড') ||
          rawText.includes('বাসা') ||
          rawText.toLowerCase().includes('address') ||
          rawText.toLowerCase().includes('dhaka'))
      ) {
        const extractedPhone = phoneMatch[1];
        createdOrder = {
          id: `ord_web_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          user_id: effectiveOwnerId,
          customer_id: cleanVisitorId,
          customer_name: cleanCustomerName,
          customer_phone: extractedPhone,
          customer_address: rawText,
          platform: 'custom_website',
          channel_id: channelId,
          items: 'Website Catalog Order',
          quantity: 1,
          total_amount: 1450,
          currency: 'BDT',
          status: 'confirmed',
          payment_status: 'pending',
          payment_method: 'cod',
          order_source: 'website',
          notes: 'Placed via Website AI Chatbot Widget',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        db.createOrder(createdOrder);
      }
    }

    return res.json({
      success: true,
      reply: aiReplyText,
      detectedLanguage: detectedLang,
      conversationId: cleanVisitorId,
      timestamp: new Date().toISOString(),
      orderCreated: Boolean(createdOrder),
      order: createdOrder
    });
  } catch (err: any) {
    console.error('Widget chat error:', err);
    return res.status(500).json({ error: err.message || 'Widget chat processing error' });
  }
});

// GET /api/widget/embed.js - Serves client embed script for SaaS users' websites (with Text + Voice + Image support!)
widgetRouter.get('/embed.js', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'public, max-age=60');

  const origin = `${req.protocol}://${req.get('host')}`;
  const customLogoUrl = db.getSettings()?.logo_url || '';

  const scriptCode = `
(function() {
  if (window.__ONE_AGENT_WIDGET_LOADED__) return;
  window.__ONE_AGENT_WIDGET_LOADED__ = true;

  var currentScript = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var agentId = (currentScript && currentScript.getAttribute('data-agent-id')) || 'saas_official';
  var serverOrigin = '${origin}';
  var activeLogoSrc = ${JSON.stringify(customLogoUrl)} || (serverOrigin + '/logo.svg');
  var visitorId = localStorage.getItem('oneagent_visitor_id') || ('vis_' + Math.random().toString(36).substring(2, 10));
  localStorage.setItem('oneagent_visitor_id', visitorId);

  var widgetConfig = {
    bot_name: 'One Agent BD AI',
    business_name: 'One Agent BD',
    primary_color: '#7F22FE',
    position: 'bottom-right',
    welcome_message: 'Welcome! 🌟 Ask anything in Bangla, Banglish, or English—or send a voice note or photo!',
    quick_prompts: ['💎 Plans & Pricing', '🌐 Website AI Setup', '🎁 2-Day Free Trial']
  };

  function fetchConfig(cb) {
    fetch(serverOrigin + '/api/widget/config?agentId=' + encodeURIComponent(agentId))
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data && data.config) {
          widgetConfig = Object.assign(widgetConfig, data.config);
        }
        cb();
      })
      .catch(function() { cb(); });
  }

  function injectWidget() {
    if (widgetConfig.enabled === false) return;
    var isRight = widgetConfig.position !== 'bottom-left';

    var container = document.createElement('div');
    container.id = 'oneagent-widget-container';
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style[isRight ? 'right' : 'left'] = '20px';
    container.style.zIndex = '999999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = isRight ? 'flex-end' : 'flex-start';
    container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

    // Tooltip: "Hey, Need help?"
    var tooltip = document.createElement('div');
    tooltip.id = 'oneagent-widget-tooltip';
    tooltip.style.position = 'relative';
    tooltip.style.marginBottom = '12px';
    tooltip.style.backgroundColor = '#1C1D21';
    tooltip.style.color = '#ffffff';
    tooltip.style.padding = '10px 28px 10px 16px';
    tooltip.style.borderRadius = '14px';
    tooltip.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
    tooltip.style.fontSize = '13px';
    tooltip.style.fontWeight = '500';
    tooltip.style.cursor = 'pointer';
    tooltip.innerHTML = '<span>Hey, Need help?</span><button id="oneagent-tooltip-close" style="position:absolute;top:5px;right:8px;background:none;border:none;color:#9ca3af;cursor:pointer;font-size:14px;line-height:1;">&times;</button><div style="position:absolute;bottom:-5px;right:20px;width:10px;height:10px;background:#1C1D21;transform:rotate(45deg);"></div>';

    // Compact Circular Button
    var bubble = document.createElement('button');
    bubble.id = 'oneagent-widget-bubble';
    bubble.style.width = '56px';
    bubble.style.height = '56px';
    bubble.style.borderRadius = '28px';
    bubble.style.backgroundColor = '#ffffff';
    bubble.style.color = '#ffffff';
    bubble.style.border = '1px solid #f3f4f6';
    bubble.style.boxShadow = '0 8px 28px rgba(0,0,0,0.22)';
    bubble.style.cursor = 'pointer';
    bubble.style.display = 'flex';
    bubble.style.alignItems = 'center';
    bubble.style.justifyContent = 'center';
    bubble.style.transition = 'transform 0.2s, background-color 0.2s';
    var logoImgHtml = '<img src="' + activeLogoSrc + '" style="width: 32px; height: 32px; object-fit: contain;" alt="AI" />';
    var closeIconHtml = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
    bubble.innerHTML = logoImgHtml;

    // Dark Chat Window
    var box = document.createElement('div');
    box.id = 'oneagent-chat-box';
    box.style.display = 'none';
    box.style.width = '350px';
    box.style.maxWidth = 'calc(100vw - 32px)';
    box.style.height = '480px';
    box.style.maxHeight = 'calc(100vh - 110px)';
    box.style.backgroundColor = '#050507';
    box.style.borderRadius = '18px';
    box.style.boxShadow = '0 24px 60px rgba(0,0,0,0.55)';
    box.style.border = '1px solid rgba(255,255,255,0.1)';
    box.style.flexDirection = 'column';
    box.style.overflow = 'hidden';
    box.style.marginBottom = '12px';

    box.innerHTML = [
      '<div style="padding: 12px 16px; background: #0B0B0F; border-bottom: 1px solid rgba(255,255,255,0.08); color: #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600;">',
      '  ' + (widgetConfig.business_name || 'One Agent BD'),
      '</div>',
      '<div id="oneagent-messages-container" style="flex: 1; padding: 16px; overflow-y: auto; background: #050507; display: flex; flex-direction: column; gap: 14px; font-size: 13.5px;">',
      '  <div style="display: flex; align-items: flex-start; gap: 10px;">',
      '    <div style="width: 32px; height: 32px; border-radius: 16px; background: #ffffff; display: flex; align-items: center; justify-content: center; padding: 5px; flex-shrink: 0;"><img src="' + activeLogoSrc + '" style="width: 100%; height: 100%; object-fit: contain;" /></div>',
      '    <div style="background: #1C1D22; color: #ffffff; padding: 10px 16px; border-radius: 16px; max-width: 80%; line-height: 1.5; border: 1px solid rgba(255,255,255,0.05);">Hey, how could I help you?</div>',
      '  </div>',
      '</div>',
      '<div id="oneagent-media-preview" style="display: none; margin: 0 12px 6px 12px; padding: 8px 12px; border-radius: 12px; background: #1C1D22; border: 1px solid rgba(255,255,255,0.1); align-items: center; justify-content: space-between; font-size: 11px; color: #e5e7eb;"></div>',
      '<div style="padding: 4px 12px 10px 12px; background: #050507;">',
      '  <div style="background: #1C1D22; border: 1px solid rgba(255,255,255,0.1); border-radius: 9999px; padding: 6px 6px 6px 14px; display: flex; gap: 10px; align-items: center;">',
      '    <input id="oneagent-image-input" type="file" accept="image/*" style="display: none;" />',
      '    <button id="oneagent-img-btn" title="Upload Picture" style="background: none; border: none; color: #d1d5db; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg></button>',
      '    <button id="oneagent-mic-btn" title="Send Voice Message" style="background: none; border: none; color: #d1d5db; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/></svg></button>',
      '    <input id="oneagent-chat-input" type="text" placeholder="Type a message..." style="flex: 1; min-width: 0; background: transparent; border: none; color: #ffffff; font-size: 13px; outline: none;" />',
      '    <button id="oneagent-send-btn" style="width: 32px; height: 32px; border-radius: 16px; background: #2538B8; color: #ffffff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">',
      '      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>',
      '    </button>',
      '  </div>',
      '  <div style="text-align: center; margin-top: 8px; font-size: 11px; color: #9ca3af;">Powered by One Agent BD</div>',
      '</div>'
    ].join('');

    container.appendChild(box);
    container.appendChild(tooltip);
    container.appendChild(bubble);
    document.body.appendChild(container);

    var msgContainer = document.getElementById('oneagent-messages-container');
    var input = document.getElementById('oneagent-chat-input');
    var sendBtn = document.getElementById('oneagent-send-btn');
    var imgBtn = document.getElementById('oneagent-img-btn');
    var imgInput = document.getElementById('oneagent-image-input');
    var micBtn = document.getElementById('oneagent-mic-btn');
    var previewBar = document.getElementById('oneagent-media-preview');
    var tooltipClose = document.getElementById('oneagent-tooltip-close');

    var pendingImageBase64 = null;
    var pendingImageMime = null;
    var mediaRecorder = null;
    var audioChunks = [];
    var isRecording = false;

    if (tooltipClose) {
      tooltipClose.onclick = function(e) {
        e.stopPropagation();
        tooltip.style.display = 'none';
      };
    }

    tooltip.onclick = function() {
      toggleChat();
    };

    function toggleChat() {
      var isOpen = box.style.display === 'flex';
      if (isOpen) {
        box.style.display = 'none';
        bubble.style.backgroundColor = '#ffffff';
        bubble.innerHTML = logoImgHtml;
      } else {
        box.style.display = 'flex';
        tooltip.style.display = 'none';
        bubble.style.backgroundColor = '#2B3FD6';
        bubble.innerHTML = closeIconHtml;
        input.focus();
      }
    }

    bubble.onclick = toggleChat;

    imgBtn.onclick = function() { imgInput.click(); };
    imgInput.onchange = function(e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        pendingImageBase64 = ev.target.result;
        pendingImageMime = file.type || 'image/jpeg';
        previewBar.style.display = 'flex';
        previewBar.innerHTML = '<span>🖼️ Image ready to send (' + file.name.slice(0, 18) + ')</span><button id="oneagent-clear-media" style="border:none;background:none;color:#ef4444;cursor:pointer;font-weight:bold;">✕</button>';
        document.getElementById('oneagent-clear-media').onclick = function() {
          pendingImageBase64 = null;
          pendingImageMime = null;
          previewBar.style.display = 'none';
        };
      };
      reader.readAsDataURL(file);
    };

    micBtn.onclick = function() {
      if (isRecording && mediaRecorder) {
        mediaRecorder.stop();
        isRecording = false;
        micBtn.style.background = '#f3f4f6';
        micBtn.innerText = '🎤';
        return;
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        appendMessage('Microphone access is not supported in this browser.', false);
        return;
      }
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
        audioChunks = [];
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = function(e) {
          if (e.data.size > 0) audioChunks.push(e.data);
        };
        mediaRecorder.onstop = function() {
          stream.getTracks().forEach(function(t) { t.stop(); });
          var blob = new Blob(audioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
          var reader = new FileReader();
          reader.onloadend = function() {
            sendUserMessage(input.value || '', null, null, reader.result, blob.type || 'audio/webm');
          };
          reader.readAsDataURL(blob);
        };
        mediaRecorder.start();
        isRecording = true;
        micBtn.style.background = '#fee2e2';
        micBtn.innerText = '⏹️';
      }).catch(function() {
        appendMessage('Please allow microphone permission to send voice messages.', false);
      });
    };

    function appendMessage(text, isUser, imgSrc, isVoice) {
      var rowEl = document.createElement('div');
      rowEl.style.display = 'flex';
      rowEl.style.alignItems = 'flex-start';
      rowEl.style.gap = '10px';
      rowEl.style.alignSelf = isUser ? 'flex-end' : 'flex-start';
      rowEl.style.maxWidth = '85%';

      if (!isUser) {
        var av = document.createElement('div');
        av.style.width = '32px';
        av.style.height = '32px';
        av.style.borderRadius = '16px';
        av.style.background = '#ffffff';
        av.style.display = 'flex';
        av.style.alignItems = 'center';
        av.style.justifyContent = 'center';
        av.style.padding = '5px';
        av.style.flexShrink = '0';
        av.innerHTML = '<img src="' + activeLogoSrc + '" style="width: 100%; height: 100%; object-fit: contain;" />';
        rowEl.appendChild(av);
      }

      var bubbleEl = document.createElement('div');
      bubbleEl.style.padding = '10px 16px';
      bubbleEl.style.borderRadius = '16px';
      bubbleEl.style.lineHeight = '1.5';
      bubbleEl.style.fontSize = '13.5px';
      bubbleEl.style.whiteSpace = 'pre-line';

      if (isUser) {
        bubbleEl.style.backgroundColor = '#2B3FD6';
        bubbleEl.style.color = '#ffffff';
      } else {
        bubbleEl.style.backgroundColor = '#1C1D22';
        bubbleEl.style.color = '#ffffff';
        bubbleEl.style.border = '1px solid rgba(255,255,255,0.05)';
      }

      if (imgSrc) {
        var img = document.createElement('img');
        img.src = imgSrc;
        img.style.maxWidth = '100%';
        img.style.borderRadius = '10px';
        img.style.marginBottom = text ? '6px' : '0';
        bubbleEl.appendChild(img);
      }
      if (isVoice) {
        var vBadge = document.createElement('div');
        vBadge.style.fontSize = '11px';
        vBadge.style.fontWeight = '700';
        vBadge.style.marginBottom = text ? '4px' : '0';
        vBadge.innerText = '🎤 Voice Message Sent';
        bubbleEl.appendChild(vBadge);
      }
      if (text) {
        var span = document.createElement('div');
        span.innerText = text;
        bubbleEl.appendChild(span);
      }
      rowEl.appendChild(bubbleEl);
      msgContainer.appendChild(rowEl);
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }

    function sendUserMessage(text, customImgB64, customImgMime, audioB64, audioMime) {
      var clean = (text !== undefined ? text : input.value || '').trim();
      var imgToSend = customImgB64 || pendingImageBase64;
      var imgMimeToSend = customImgMime || pendingImageMime;

      if (!clean && !imgToSend && !audioB64) return;
      input.value = '';
      pendingImageBase64 = null;
      pendingImageMime = null;
      previewBar.style.display = 'none';
      if (promptsContainer) promptsContainer.style.display = 'none';

      appendMessage(clean, true, imgToSend, Boolean(audioB64));

      var typingEl = document.createElement('div');
      typingEl.style.alignSelf = 'flex-start';
      typingEl.style.fontSize = '11px';
      typingEl.style.color = '#6b7280';
      typingEl.innerText = 'One Agent AI is analyzing & typing...';
      msgContainer.appendChild(typingEl);
      msgContainer.scrollTop = msgContainer.scrollHeight;

      fetch(serverOrigin + '/api/widget/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agentId,
          visitorId: visitorId,
          message: clean,
          imageBase64: imgToSend || undefined,
          imageMimeType: imgMimeToSend || undefined,
          audioBase64: audioB64 || undefined,
          audioMimeType: audioMime || undefined
        })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        typingEl.remove();
        appendMessage(data.reply || 'Thank you! How else can I help you?', false);
      })
      .catch(function() {
        typingEl.remove();
        appendMessage('Connection error. Please try again.', false);
      });
    }

    sendBtn.onclick = function() { sendUserMessage(); };
    input.onkeydown = function(e) {
      if (e.key === 'Enter') sendUserMessage();
    };
  }

  fetchConfig(function() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectWidget);
    } else {
      injectWidget();
    }
  });
})();
`;

  return res.send(scriptCode);
});
