import { GoogleGenAI } from '@google/genai';
import { db, Message, Product } from '../db/database.js';
import { cleanAudioMimeType, convertToWav } from './audioDownloader.js';

function getGeminiClient(customApiKey?: string): GoogleGenAI {
  const adminProfile = db.getProfileById('usr_admin_001');
  const apiKey =
    (customApiKey && customApiKey.trim()) ||
    (adminProfile?.llm_api_key && adminProfile.llm_api_key.trim()) ||
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    '';
  return new GoogleGenAI({ apiKey });
}

export interface GenerateReplyParams {
  userId: string;
  incomingMessage: string;
  customerName?: string;
  customerId: string;
  platform: 'whatsapp' | 'messenger' | 'instagram';
  channelName?: string;
  history?: Message[];
  audioBase64?: string;
  audioMimeType?: string;
  imageBase64?: string;
  imageMimeType?: string;
  imageUrl?: string;
  overrideSystemPrompt?: string;
}

export interface GenerateReplyResult {
  replyText: string;
  transcript?: string;
  isVoice?: boolean;
  attachedImageUrl?: string;
  attachedProductName?: string;
  attachedProductPrice?: number;
}

// Supported Gemini models in priority order
const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-flash-latest'
];

// Call Google Gemini Multimodal API with Audio Input
async function callGeminiWithAudio(
  audioBase64: string,
  audioMimeType: string,
  systemPrompt: string,
  businessName: string,
  recentHistory: string,
  catalogContext: string,
  customApiKey?: string
): Promise<{ replyText: string; transcript?: string } | null> {
  const ai = getGeminiClient(customApiKey);

  let normalizedBase64 = audioBase64;
  let normalizedMime = 'audio/wav';

  try {
    const rawBuffer = Buffer.from(audioBase64, 'base64');
    const isWav = rawBuffer.subarray(0, 4).toString('latin1') === 'RIFF';
    if (!isWav || audioMimeType !== 'audio/wav') {
      const converted = await convertToWav(rawBuffer);
      normalizedBase64 = converted.base64;
      normalizedMime = 'audio/wav';
    }
  } catch (err: any) {
    console.warn('[AI Service] Audio conversion warning, using original:', err?.message || err);
    normalizedMime = cleanAudioMimeType(audioMimeType);
  }

  const promptText = `System Instructions & Business Knowledge Base:
${systemPrompt}

You are the official customer service AI assistant for ${businessName}.
The customer sent a voice note / audio message.

Merchant Product Catalog & Pricing:
${catalogContext}

TASK:
1. Listen carefully to the voice note (may be in Bangla, Banglish, or English).
2. Transcribe accurately what the customer said in the audio.
3. Formulate a polite, helpful, concise customer service response in natural Bangla (বাংলা ভাষায়). Answer the customer's question directly using the Business Knowledge Base and Catalog above in 1-3 clear Bangla sentences. Never repeat or echo the customer's question.

Previous Conversation History:
${recentHistory || '(No previous messages)'}

OUTPUT FORMAT:
TRANSCRIPT: <Accurate transcription of what the customer spoke>
REPLY: <Polite, helpful customer reply in Bangla (বাংলায়)>`;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: normalizedMime,
                  data: normalizedBase64
                }
              },
              {
                text: promptText
              }
            ]
          }
        ]
      });

      const rawText = response.text?.trim();
      if (!rawText) continue;

      const transcriptMatch = rawText.match(/TRANSCRIPT:\s*([\s\S]*?)(?=(REPLY:|$))/i);
      const replyMatch = rawText.match(/REPLY:\s*([\s\S]*)/i);

      let transcript = transcriptMatch ? transcriptMatch[1].trim() : undefined;
      let replyText = replyMatch ? replyMatch[1].trim() : rawText;

      if (replyText.startsWith('REPLY:')) {
        replyText = replyText.substring(6).trim();
      }
      if (transcript && (transcript.toLowerCase().includes('silent') || transcript.includes('unclear'))) {
        transcript = 'অস্পষ্ট ভয়েস মেসেজ';
      }

      return { replyText, transcript };
    } catch (err: any) {
      console.warn(`[AI Service] Audio model ${modelName} error:`, err?.message || err);
    }
  }

  return null;
}

// Call Google Gemini Multimodal API with Customer Image Input
async function callGeminiWithImage(
  imageBase64: string,
  imageMimeType: string,
  customerText: string,
  systemPrompt: string,
  businessName: string,
  catalogContext: string,
  recentHistory: string,
  customApiKey?: string
): Promise<string | null> {
  const ai = getGeminiClient(customApiKey);

  const promptText = `System Instructions & Business Knowledge Base:
${systemPrompt}

You are the customer service AI assistant for ${businessName}.
The customer sent an image/photo of a product they are asking about along with the text: "${customerText || 'এই প্রোডাক্টটির দাম কত এবং বিস্তারিত জানাবেন?'}"

Merchant Product Catalog & Price List:
${catalogContext}

TASK:
1. Examine the image sent by the customer.
2. Identify which product from the Merchant Product Catalog matches this item (or describe its category and key features).
3. Provide the exact price in BDT and specifications according to the catalog and business knowledge base.
4. Reply in clear, polite, natural Bangla (বাংলা ভাষায়, ১-৩ বাক্যে). Do not echo robotic prefixes.

Recent Conversation History:
${recentHistory || '(No previous messages)'}

Customer Question: "${customerText || 'এটার দাম কত এবং বিস্তারিত জানাবেন?'}"
Assistant Reply (in Bangla):`;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: imageMimeType || 'image/jpeg',
                  data: imageBase64
                }
              },
              {
                text: promptText
              }
            ]
          }
        ]
      });

      const reply = response.text?.trim();
      if (reply) return reply;
    } catch (err: any) {
      console.warn(`[AI Service] Multimodal Image model ${modelName} error:`, err?.message || err);
    }
  }

  return null;
}

// Call Google Gemini API for Text with Fallback Loop
async function callGemini(fullPrompt: string, customApiKey?: string): Promise<string | null> {
  const ai = getGeminiClient(customApiKey);

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: fullPrompt
      });

      const reply = response.text?.trim();
      if (reply) return reply;
    } catch (err: any) {
      console.warn(`[AI Service] Model ${modelName} failed for text:`, err?.message || err);
    }
  }

  return null;
}

// Extract structured details from the user's System Prompt / Knowledge Base for intelligent Bangla fallback
function buildSmartBanglaFallbackFromPrompt(
  incomingMessage: string,
  systemPrompt: string,
  businessName: string,
  products: Product[],
  matchedProduct?: Product
): string {
  const q = (incomingMessage || '').toLowerCase().trim();

  // Extract sections from user's systemPrompt if available
  const cleanPromptLines = (systemPrompt || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(
      (l) =>
        l.length > 0 &&
        !l.toLowerCase().startsWith('you are') &&
        !l.toLowerCase().startsWith('mandatory rules') &&
        !l.toLowerCase().startsWith('- answer') &&
        !l.toLowerCase().startsWith('- reply') &&
        !l.toLowerCase().startsWith('- never repeat') &&
        !l.toLowerCase().startsWith('- do not') &&
        !l.toLowerCase().startsWith('- when known') &&
        !l.toLowerCase().startsWith('- state exact')
    );

  // Extract specific knowledge base lines if present
  const extractSection = (keywords: string[]): string | null => {
    const matchedLines: string[] = [];
    for (let i = 0; i < cleanPromptLines.length; i++) {
      const lineLower = cleanPromptLines[i].toLowerCase();
      if (keywords.some((kw) => lineLower.includes(kw))) {
        matchedLines.push(cleanPromptLines[i]);
        if (i + 1 < cleanPromptLines.length && !/^\d+\./.test(cleanPromptLines[i + 1])) {
          matchedLines.push(cleanPromptLines[i + 1]);
        }
      }
    }
    return matchedLines.length > 0 ? matchedLines.slice(0, 3).join(' ') : null;
  };

  // 1. Specific matched product from catalog
  if (matchedProduct) {
    return `আসসালামু আলাইকুম! আমাদের "${matchedProduct.name}" এখন স্টকে আছে।\n💰 মূল্য: ৳${matchedProduct.price} ${matchedProduct.currency}\n📋 বিবরণ: ${matchedProduct.description}\nঅর্ডার কনফার্ম করতে আপনার নাম, সম্পূর্ণ ঠিকানা এবং মোবাইল নাম্বারটি লিখে পাঠান।`;
  }

  // 2. Delivery / Courier inquiry (Bangla, Banglish, English)
  if (
    q.includes('delivery') ||
    q.includes('charge') ||
    q.includes('courier') ||
    q.includes('ডেলিভারি') ||
    q.includes('চার্জ') ||
    q.includes('কুরিয়ার') ||
    q.includes('পাঠানো') ||
    q.includes('dhaka') ||
    q.includes('ঢাকা') ||
    q.includes('koto din') ||
    q.includes('কত দিন')
  ) {
    const kbDelivery = extractSection(['delivery', 'ডেলিভারি', 'courier', 'dhaka', 'ঢাকা', 'parcel']);
    if (kbDelivery) {
      return `আমাদের ডেলিভারি ও কুরিয়ার তথ্য: ${kbDelivery}। অর্ডার করতে আপনার নাম, ঠিকানা ও ফোন নাম্বার দিন।`;
    }
    return `আমাদের ডেলিভারি চার্জ ঢাকার ভেতরে ৳৬০ (২৪-৪৮ ঘণ্টা) এবং ঢাকার বাইরে সারাদেশে ৳১২০ (২-৩ দিন)। ক্যাশ অন ডেলিভারি (COD) সুবিধা রয়েছে!`;
  }

  // 3. Payment / bKash / Nagad inquiry
  if (
    q.includes('bkash') ||
    q.includes('nagad') ||
    q.includes('payment') ||
    q.includes('pay') ||
    q.includes('বিকাশ') ||
    q.includes('নগদ') ||
    q.includes('পেমেন্ট') ||
    q.includes('টাকা পাঠাবো') ||
    q.includes('cod')
  ) {
    const kbPay = extractSection(['payment', 'bkash', 'nagad', 'বিকাশ', 'নগদ', 'পেমেন্ট', 'cod']);
    if (kbPay) {
      return `আমাদের পেমেন্ট পদ্ধতি: ${kbPay}। যেকোনো প্রয়োজনে আমাদের জানালে সাথে সাথে সাহায্য করা হবে।`;
    }
    return `আমরা ক্যাশ অন ডেলিভারি (COD), বিকাশ এবং নগদ পেমেন্ট গ্রহণ করি। অর্ডার কনফার্ম করতে আপনার নাম, ঠিকানা ও মোবাইল নাম্বার দিন।`;
  }

  // 4. Order / How to buy inquiry
  if (
    q.includes('order') ||
    q.includes('buy') ||
    q.includes('confirm') ||
    q.includes('অর্ডার') ||
    q.includes('কিনব') ||
    q.includes('নিতে চাই') ||
    q.includes('নিবো') ||
    q.includes('kivabe') ||
    q.includes('কিভাবে')
  ) {
    const kbOrder = extractSection(['order', 'অর্ডার', 'confirm', 'booking']);
    if (kbOrder) {
      return `অর্ডার করার নিয়ম: ${kbOrder}। আপনার নাম, সম্পূর্ণ ঠিকানা ও ১১ ডিজিটের মোবাইল নাম্বারটি দিন, আমরা এখনি অর্ডার বুক করে নিচ্ছি!`;
    }
    return `অর্ডার কনফার্ম করতে অনুগ্রহ করে আপনার সম্পূর্ণ নাম, ডেলিভারি ঠিকানা এবং সচল মোবাইল নাম্বারটি লিখে পাঠান।`;
  }

  // 5. Price / Services / Products / Details inquiry
  if (
    q.includes('price') ||
    q.includes('dam') ||
    q.includes('koto') ||
    q.includes('দাম') ||
    q.includes('কত') ||
    q.includes('প্রাইস') ||
    q.includes('service') ||
    q.includes('সার্ভিস') ||
    q.includes('product') ||
    q.includes('প্রোডাক্ট') ||
    q.includes('ki ki') ||
    q.includes('কি কি') ||
    q.includes('ache') ||
    q.includes('ase') ||
    q.includes('আছে') ||
    q.includes('details') ||
    q.includes('detail') ||
    q.includes('bistarito') ||
    q.includes('বিস্তারিত') ||
    q.includes('package') ||
    q.includes('প্যাকেজ') ||
    q.includes('plan') ||
    q.includes('প্ল্যান')
  ) {
    const kbServices = extractSection([
      'product',
      'service',
      'price',
      'plan',
      'menu',
      'সার্ভিস',
      'প্রোডাক্ট',
      'দাম',
      'প্যাকেজ'
    ]);
    if (kbServices) {
      return `জ্বী, আমাদের সার্ভিস ও প্রোডাক্টের বিবরণ: ${kbServices}। আপনি কোনটি নিতে চাচ্ছেন জানালে বিস্তারিত দিয়ে সাহায্য করতে পারি!`;
    }
    if (products.length > 0) {
      const topList = products
        .slice(0, 4)
        .map((p) => `• ${p.name}: ৳${p.price}`)
        .join('\n');
      return `আমাদের জনপ্রিয় প্রোডাক্ট ও মূল্য তালিকা:\n${topList}\nআপনি কোন প্রোডাক্টটি নিতে চান বা বিস্তারিত জানতে চান?`;
    }
  }

  // 6. Helpline / Phone / Support / Location inquiry
  if (
    q.includes('number') ||
    q.includes('phone') ||
    q.includes('call') ||
    q.includes('contact') ||
    q.includes('helpline') ||
    q.includes('address') ||
    q.includes('location') ||
    q.includes('নাম্বার') ||
    q.includes('ফোন') ||
    q.includes('কল') ||
    q.includes('ঠিকানা') ||
    q.includes('কথা বলতে') ||
    q.includes('যোগাযোগ')
  ) {
    const kbHelp = extractSection(['helpline', 'support', 'hour', 'phone', 'address', 'হেল্পলাইন', 'নাম্বার', 'ঠিকানা']);
    if (kbHelp) {
      return `আমাদের সাথে যোগাযোগের তথ্য: ${kbHelp}। এছাড়া এখানে মেসেজ করলেও আমরা তাৎক্ষণিক সাহায্য করছি।`;
    }
    return `আমাদের কাস্টমার সাপোর্ট প্রতিদিন সকাল ৯টা থেকে রাত ১১টা পর্যন্ত চালু আছে। আপনার ফোন নাম্বারটি দিন, আমাদের প্রতিনিধি আপনাকে কল করবে।`;
  }

  // 7. Greetings (hello, hi, salam, assalamu alaikum, hlw, kemon achen, etc.) or general inquiry
  const isOneAgentSaaS =
    systemPrompt.includes('Starter AI Plan') ||
    systemPrompt.includes('1,250') ||
    systemPrompt.includes('১,২৫০') ||
    businessName.toLowerCase().includes('one agent');

  if (isOneAgentSaaS) {
    return `আসসালামু আলাইকুম! ${businessName}-এ আপনাকে স্বাগতম। আমরা Facebook Page, Instagram, WhatsApp এবং Website-এর জন্য ২৪/৭ অটোমেটিক AI মেসেজ রিপ্লাই, ভয়েস ও ছবির উত্তর, কমেন্ট অটো-রিপ্লাই এবং অটো অর্ডার ও কুরিয়ার বুকিং সার্ভিস দিয়ে থাকি। আমাদের প্ল্যান (Starter ৳১,২৫০/মাস ও Pro ৳১,৯৫০/মাস) বা ২ দিনের ফ্রি ট্রায়াল সম্পর্কে জানতে চাইলে প্রশ্ন করতে পারেন!`;
  }

  const kbSummary = cleanPromptLines
    .filter(
      (l) =>
        !l.toLowerCase().includes('business knowledge base') &&
        !l.startsWith('আপনি ') &&
        !l.startsWith('===' ) &&
        !l.startsWith('---')
    )
    .slice(0, 2)
    .join(' ');

  if (kbSummary && kbSummary.length > 20) {
    return `আসসালামু আলাইকুম! ${businessName}-এ আপনাকে স্বাগতম। ${kbSummary} — আমাদের প্রোডাক্ট, সার্ভিস বা অর্ডারের বিষয়ে কীভাবে আপনাকে সাহায্য করতে পারি?`;
  }

  if (products.length > 0) {
    const sampleNames = products
      .slice(0, 3)
      .map((p) => `${p.name} (৳${p.price})`)
      .join(', ');
    return `আসসালামু আলাইকুম! ${businessName}-এ আপনাকে স্বাগতম। আমাদের কাছে রয়েছে ${sampleNames} সহ দারুণ সব কালেকশন। আপনি কোন প্রোডাক্টের দাম বা বিস্তারিত জানতে চাচ্ছেন?`;
  }

  return `আসসালামু আলাইকুম! ${businessName}-এ আপনাকে স্বাগতম। আমাদের সার্ভিস, প্রোডাক্টের দাম বা অর্ডার করার নিয়ম সম্পর্কে যেকোনো প্রশ্ন বাংলায় বা বাংলিশে করতে পারেন, আমি সাথে সাথে উত্তর দিচ্ছি!`;
}

export async function generateAIReply(params: GenerateReplyParams): Promise<GenerateReplyResult> {
  const profile = db.getProfileById(params.userId);
  const businessName = params.channelName || profile?.full_name || 'One Agent BD';

  // Use overrideSystemPrompt (if testing live in Settings) or user's saved system_prompt
  const rawSystemPrompt =
    (params.overrideSystemPrompt && params.overrideSystemPrompt.trim()) ||
    (profile?.system_prompt && profile.system_prompt.trim()) ||
    `You are the polite, helpful customer service AI agent for ${businessName}.`;

  // Sanitize any legacy "English only" instructions inside saved prompts so Bangla replies always work
  const systemPrompt = rawSystemPrompt
    .replace(/in 1-2 clear English sentences/gi, 'in 1-3 clear, polite Bangla (বাংলা) sentences')
    .replace(/in 1-2 clear, courteous English sentences/gi, 'in 1-3 clear, courteous Bangla (বাংলা) sentences')
    .replace(/in 1-2 polite, clear English sentences/gi, 'in 1-3 polite, clear Bangla (বাংলা) sentences')
    .replace(/in 1-2 informative, concise English sentences/gi, 'in 1-3 informative, concise Bangla (বাংলা) sentences')
    .replace(/in clear, friendly English/gi, 'in clear, friendly Bangla (বাংলা)')
    .replace(/in 1-2 concise English sentences/gi, 'in 1-3 concise Bangla (বাংলা) sentences');

  // Get merchant product catalog for context (strictly isolated per merchant)
  const merchantProducts = db.getProducts(params.userId) || [];

  const catalogContext =
    merchantProducts.length > 0
      ? merchantProducts
          .map(
            (p) =>
              `- ${p.name}: ${p.price} ${p.currency} (Category: ${p.category}, Status: ${p.stock_status}). Details: ${p.description}`
          )
          .join('\n')
      : `(কোনো আলাদা প্রোডাক্ট ক্যাটালগ যোগ করা হয়নি — উপরের Business Knowledge Base / System Instructions অনুযায়ী উত্তর দিন)`;

  // Build context history
  const recentHistory = (params.history || [])
    .filter((m) => m.message_text && !m.message_text.startsWith('[Attachment]'))
    .slice(-5)
    .map((m) => `${m.direction === 'inbound' ? 'Customer' : 'Assistant'}: ${m.message_text}`)
    .join('\n');

  // Check if customer asked for a product photo or image
  const incomingLower = (params.incomingMessage || '').toLowerCase();
  const isAskingForImage =
    incomingLower.includes('picture') ||
    incomingLower.includes('photo') ||
    incomingLower.includes('chobi') ||
    incomingLower.includes('dekhan') ||
    incomingLower.includes('image') ||
    incomingLower.includes('pic') ||
    incomingLower.includes('dekhte chai') ||
    incomingLower.includes('look like') ||
    incomingLower.includes('pic din') ||
    incomingLower.includes('ছবি') ||
    incomingLower.includes('পিক') ||
    incomingLower.includes('দেখান');

  const isAskingForDetails =
    incomingLower.includes('detail') ||
    incomingLower.includes('spec') ||
    incomingLower.includes('feature') ||
    incomingLower.includes('fabric') ||
    incomingLower.includes('material') ||
    incomingLower.includes('size') ||
    incomingLower.includes('color') ||
    incomingLower.includes('warranty') ||
    incomingLower.includes('kemon') ||
    incomingLower.includes('bistarito') ||
    incomingLower.includes('ki ki ache') ||
    incomingLower.includes('price') ||
    incomingLower.includes('dam') ||
    incomingLower.includes('cost') ||
    incomingLower.includes('দাম') ||
    incomingLower.includes('কত') ||
    incomingLower.includes('বিস্তারিত');

  // Attempt to match a specific product from merchant's own catalog
  let matchedProduct: Product | undefined = undefined;
  if (params.incomingMessage && merchantProducts.length > 0) {
    matchedProduct = db.findProductForQuery(params.userId, params.incomingMessage);
  }

  // 1. If customer sent a voice note / audio
  if (params.audioBase64) {
    console.log(`[AI Service] Processing voice note for customer ${params.customerId}`);
    const voiceResult = await callGeminiWithAudio(
      params.audioBase64,
      params.audioMimeType || 'audio/ogg',
      systemPrompt,
      businessName,
      recentHistory,
      catalogContext,
      profile?.llm_api_key
    );

    if (voiceResult && voiceResult.replyText) {
      return {
        replyText: voiceResult.replyText,
        transcript: voiceResult.transcript,
        isVoice: true
      };
    }

    return {
      replyText: `আসসালামু আলাইকুম! আপনার ভয়েস মেসেজটি আমরা পেয়েছি। ${businessName}-এর পক্ষ থেকে আপনাকে কীভাবে সাহায্য করতে পারি?`,
      transcript: 'ভয়েস মেসেজ রিসিভ হয়েছে',
      isVoice: true
    };
  }

  // 2. If customer sent an image / photo
  if (params.imageBase64) {
    console.log(`[AI Service] Processing customer image inquiry for customer ${params.customerId}`);
    const imageReply = await callGeminiWithImage(
      params.imageBase64,
      params.imageMimeType || 'image/jpeg',
      params.incomingMessage,
      systemPrompt,
      businessName,
      catalogContext,
      recentHistory,
      profile?.llm_api_key
    );

    if (imageReply) {
      return {
        replyText: imageReply,
        isVoice: false,
        attachedImageUrl: matchedProduct?.image_url,
        attachedProductName: matchedProduct?.name,
        attachedProductPrice: matchedProduct?.price
      };
    }

    if (matchedProduct) {
      return {
        replyText: `ধন্যবাদ! আপনার পাঠানো ছবিটি আমাদের "${matchedProduct.name}"-এর সাথে মিলেছে।\n• মূল্য: ৳${matchedProduct.price} ${matchedProduct.currency}\n• বিবরণ: ${matchedProduct.description}\nঅর্ডার করতে আপনার নাম, ঠিকানা ও মোবাইল নাম্বার দিন!`,
        isVoice: false,
        attachedImageUrl: matchedProduct.image_url,
        attachedProductName: matchedProduct.name,
        attachedProductPrice: matchedProduct.price
      };
    }

    return {
      replyText: `ছবিটি পাঠানোর জন্য ধন্যবাদ! প্রোডাক্টটি আমাদের স্টকে আছে এবং সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। অর্ডার করতে আপনার নাম, ঠিকানা ও ফোন নাম্বার দিন।`,
      isVoice: false
    };
  }

  // 3. Normal text message processing (Bangla + Banglish -> Bangla reply)
  const languageDirective = `CRITICAL MANDATORY LANGUAGE RULE (অবশ্যই পালনীয়):
- কাস্টমার বাংলা (Bangla script), বাংলিশ (Banglish - ইংরেজি অক্ষরে বাংলা লেখা যেমন: "dam koto", "ki ki service ache", "order korbo kivabe", "delivery charge koto", "hello", "hi") অথবা যেভাবেই প্রশ্ন করুক না কেন, সর্বদা পরিষ্কার, মার্জিত ও স্বাভাবিক বাংলা ভাষায় (Bengali script: বাংলায়) উত্তর দেবেন।
- ব্যবসায়িক তথ্য (Business Knowledge Base / System Instructions) এবং প্রোডাক্ট ক্যাটালগে যা দেওয়া আছে, ঠিক সেই তথ্য অনুযায়ী সঠিক দাম, ডেলিভারি চার্জ, পেমেন্ট নাম্বার ও নিয়ম জানাবেন।
- উত্তর সংক্ষিপ্ত, আন্তরিক এবং সরাসরি ১ থেকে ৩ বাক্যের মধ্যে রাখবেন।`;

  const orderSettings = db.getOrderSettings(params.userId);
  let orderGuidance =
    'ORDER CONFIRMATION: কাস্টমার অর্ডার করতে চাইলে বা নাম, ঠিকানা ও মোবাইল নাম্বার দিলে অর্ডারটি কনফার্ম করুন এবং ধন্যবাদ জানান।';
  if (orderSettings && orderSettings.enabled && orderSettings.instructions) {
    orderGuidance = `ORDER CONFIRMATION CRITERIA:\n${orderSettings.instructions}\nCollect name, 11-digit mobile number, and address to finalize order.`;
  }

  let productPhotoDirective = '';
  if (matchedProduct && (isAskingForImage || isAskingForDetails)) {
    productPhotoDirective = `PRODUCT PICTURE & DETAILS DIRECTIVE: কাস্টমার "${matchedProduct.name}"-এর ছবি বা বিস্তারিত জানতে চেয়েছেন। বাংলায় জানান যে আপনি প্রোডাক্টটির অফিসিয়াল ছবি যুক্ত করেছেন এবং এর মূল বিবরণ (${matchedProduct.description}) ও সঠিক দাম (৳${matchedProduct.price} ${matchedProduct.currency}) উল্লেখ করুন।`;
  }

  const fullPrompt = `System Instructions & Business Knowledge Base (Merchant Details):
${systemPrompt}

Language Instructions:
${languageDirective}

Merchant Product Catalog:
${catalogContext}

${orderGuidance}
${productPhotoDirective}

ABSOLUTE RULES:
1. কাস্টমার বাংলা বা বাংলিশ যেভাবেই প্রশ্ন করুক, সর্বদা বাংলা ভাষায় (in Bengali script) উত্তর দিন।
2. কাস্টমারের প্রশ্ন হুবহু রিপিট করবেন না, সরাসরি উত্তর দিন।
3. মার্চেন্টের দেওয়া Business Knowledge Base এবং Product Catalog-এর তথ্যের বাইরে কোনো ভুল তথ্য দেবেন না।

Recent Conversation History:
${recentHistory || '(No previous messages)'}

New Customer Message:
"${params.incomingMessage}"

Assistant Reply (in Bangla / বাংলায় উত্তর দিন):`;

  const geminiReply = await callGemini(fullPrompt, profile?.llm_api_key);
  const shouldAttachImage = Boolean(matchedProduct?.image_url && (isAskingForImage || isAskingForDetails));

  if (geminiReply) {
    return {
      replyText: geminiReply,
      isVoice: false,
      attachedImageUrl: shouldAttachImage ? matchedProduct?.image_url : undefined,
      attachedProductName: matchedProduct?.name,
      attachedProductPrice: matchedProduct?.price
    };
  }

  // 4. Smart Knowledge-Aware Bangla Fallback (uses user's systemPrompt + catalog)
  const smartBanglaReply = buildSmartBanglaFallbackFromPrompt(
    params.incomingMessage,
    systemPrompt,
    businessName,
    merchantProducts,
    matchedProduct
  );

  return {
    replyText: smartBanglaReply,
    isVoice: false,
    attachedImageUrl: shouldAttachImage ? matchedProduct?.image_url : undefined,
    attachedProductName: matchedProduct?.name,
    attachedProductPrice: matchedProduct?.price
  };
}
