import { GoogleGenAI } from '@google/genai';
import { db, Message, Product } from '../db/database.js';
import { cleanAudioMimeType, convertToWav } from './audioDownloader.js';

function getCandidateGeminiKeys(customApiKey?: string): string[] {
  const adminProfile = db.getProfileById('usr_admin_001');
  const defaultSystemKey = ((db.getSettings() as any)?.default_llm_api_key || '').trim();
  return Array.from(
    new Set(
      [
        customApiKey?.trim(),
        defaultSystemKey,
        adminProfile?.llm_api_key?.trim(),
        process.env.GEMINI_API_KEY?.trim(),
        process.env.VITE_GEMINI_API_KEY?.trim(),
        process.env.GOOGLE_API_KEY?.trim()
      ].filter((k): k is string => Boolean(k && k.length > 10 && !k.startsWith('sk-')))
    )
  );
}

function getGeminiClients(customApiKey?: string): GoogleGenAI[] {
  const candidateKeys = getCandidateGeminiKeys(customApiKey);

  if (candidateKeys.length === 0) {
    return [
      new GoogleGenAI({
        apiKey: '',
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      })
    ];
  }

  return candidateKeys.map(
    (apiKey) =>
      new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      })
  );
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Gemini request timed out after ${ms}ms`)), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export function formatCleanChatMessage(raw: string): string {
  if (!raw) return '';
  let text = raw
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/।।+/g, '।')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text;
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
  overrideApiKey?: string;
}

export interface GenerateReplyResult {
  replyText: string;
  transcript?: string;
  isVoice?: boolean;
  attachedImageUrl?: string;
  attachedProductName?: string;
  attachedProductPrice?: number;
}

// Supported Gemini models in priority order (includes gemini-2.5-flash for user AIzaSy keys + gemini-3.6-flash)
const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-3.6-flash',
  'gemini-3.8-flash',
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
  const clients = getGeminiClients(customApiKey);

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
3. Formulate a polite, helpful, well-formatted customer service response in natural Bangla (বাংলা ভাষায়). Answer the customer's question directly using the Business Knowledge Base and Catalog above. Do not use ** markdown asterisks. Never repeat or echo the customer's question.

Previous Conversation History:
${recentHistory || '(No previous messages)'}

OUTPUT FORMAT:
TRANSCRIPT: <Accurate transcription of what the customer spoke>
REPLY: <Polite, helpful customer reply in Bangla (বাংলায়)>`;

  for (const ai of clients.slice(0, 2)) {
    for (const modelName of CANDIDATE_MODELS.slice(0, 2)) {
      try {
        const response = await withTimeout(
          ai.models.generateContent({
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
            ],
            config: {
              thinkingConfig: { thinkingBudget: 0 }
            }
          }),
          5500
        );

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

        return { replyText: formatCleanChatMessage(replyText), transcript };
      } catch (err: any) {
        console.warn(`[AI Service] Audio model ${modelName} error:`, err?.message || err);
      }
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
  const clients = getGeminiClients(customApiKey);

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
4. Reply in clear, polite, well-formatted natural Bangla (বাংলা ভাষায়). Do not use ** markdown asterisks.

Recent Conversation History:
${recentHistory || '(No previous messages)'}

Customer Question: "${customerText || 'এটার দাম কত এবং বিস্তারিত জানাবেন?'}"
Assistant Reply (in Bangla):`;

  for (const ai of clients.slice(0, 2)) {
    for (const modelName of CANDIDATE_MODELS.slice(0, 2)) {
      try {
        const response = await withTimeout(
          ai.models.generateContent({
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
            ],
            config: {
              thinkingConfig: { thinkingBudget: 0 }
            }
          }),
          5500
        );

        const reply = response.text?.trim();
        if (reply) return formatCleanChatMessage(reply);
      } catch (err: any) {
        console.warn(`[AI Service] Multimodal Image model ${modelName} error:`, err?.message || err);
      }
    }
  }

  return null;
}

// Call Google Gemini or OpenAI API for Text with Fast Fallback Loop (avoids Vercel timeouts during 503 spikes)
async function callGemini(fullPrompt: string, customApiKey?: string, systemInstruction?: string): Promise<string | null> {
  const trimmedKey =
    customApiKey?.trim() ||
    ((db.getSettings() as any)?.default_llm_api_key || '').trim() ||
    db.getProfileById('usr_admin_001')?.llm_api_key?.trim() ||
    '';

  // If the merchant provided an OpenAI API key (starts with sk- and not sk-ant-), call OpenAI directly
  if (trimmedKey.startsWith('sk-') && !trimmedKey.startsWith('sk-ant-')) {
    try {
      const openAiRes = await withTimeout(
        fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${trimmedKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
              { role: 'user', content: fullPrompt }
            ],
            temperature: 0.35
          })
        }),
        6000
      );
      if (openAiRes.ok) {
        const json: any = await openAiRes.json();
        const text = json?.choices?.[0]?.message?.content?.trim();
        if (text) return formatCleanChatMessage(text);
      }
    } catch (err: any) {
      console.warn('[AI Service] OpenAI call warning:', err?.message || err);
    }
  }

  const clients = getGeminiClients(trimmedKey);
  let consecutive503 = 0;

  for (const ai of clients.slice(0, 2)) {
    for (const modelName of CANDIDATE_MODELS) {
      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model: modelName,
            contents: fullPrompt,
            config: {
              ...(systemInstruction ? { systemInstruction } : {}),
              thinkingConfig: { thinkingBudget: 0 },
              temperature: 0.35
            }
          }),
          5500
        );

        const reply = response.text?.trim();
        if (reply) return formatCleanChatMessage(reply);
      } catch (err: any) {
        const msg = String(err?.message || err || '');
        console.warn(`[AI Service] Model ${modelName} failed for text:`, msg.slice(0, 120));
        if (err?.status === 503 || msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE')) {
          consecutive503++;
          // If 2 models in a row return 503 UNAVAILABLE, fail fast so the local knowledge engine answers immediately (<1.5s)
          if (consecutive503 >= 2) {
            return null;
          }
        }
      }
    }
  }

  return null;
}

// Intelligent Bangla Knowledge-Base Engine when LLM calls experience temporary 503 overload
function buildSmartBanglaFallbackFromPrompt(
  incomingMessage: string,
  systemPrompt: string,
  businessName: string,
  products: Product[],
  matchedProduct?: Product
): string {
  const q = (incomingMessage || '').toLowerCase().trim();

  // 1. Specific matched product from merchant catalog
  if (matchedProduct) {
    return `আসসালামু আলাইকুম! আমাদের "${matchedProduct.name}" এখন স্টকে আছে।\n\n💰 মূল্য: ৳${matchedProduct.price} ${matchedProduct.currency}\n📋 বিবরণ: ${matchedProduct.description}\n\nঅর্ডার কনফার্ম করতে আপনার নাম, সম্পূর্ণ ঠিকানা এবং মোবাইল নাম্বারটি লিখে পাঠান।`;
  }

  const isOneAgentSaaS =
    systemPrompt.includes('Starter AI Plan') ||
    systemPrompt.includes('1,250') ||
    systemPrompt.includes('১,২৫০') ||
    businessName.toLowerCase().includes('one agent');

  // 2. Specialized, accurate, well-formatted Knowledge Engine for One Agent BD SaaS inquiries
  if (isOneAgentSaaS) {
    // 2A. 1 Year / 12 Months pricing
    const isYearly =
      q.includes('1 bochor') ||
      q.includes('1 year') ||
      q.includes('12 month') ||
      q.includes('12 mas') ||
      q.includes('এক বছর') ||
      q.includes('১ বছর') ||
      q.includes('১২ মাস') ||
      q.includes('yearly') ||
      q.includes('annual') ||
      q.includes('bochorer') ||
      q.includes('bochor') ||
      q.includes('বছর');

    const isSixMonths =
      q.includes('6 mas') || q.includes('6 month') || q.includes('৬ মাস') || q.includes('ছয় মাস');

    const isThreeMonths =
      q.includes('3 mas') || q.includes('3 month') || q.includes('৩ মাস') || q.includes('তিন মাস');

    const isTwoMonths =
      q.includes('2 mas') || q.includes('2 month') || q.includes('২ মাস') || q.includes('দুই মাস');

    if (isYearly) {
      return `আমাদের ১ বছরের (১২ মাসের) সাবস্ক্রিপশন প্ল্যানের বিস্তারিত খরচ নিচে দেওয়া হলো:\n\n📦 ১) Starter AI Plan (১ বছর / ১২ মাস):\n• মোট খরচ: ৳১৫,০০০ টাকা (মাসিক ৳১,২৫০ হিসেবে)\n• সুবিধা: ১টি AI এজেন্ট, Facebook, Instagram, WhatsApp ও Website অটো-রিপ্লাই, ৫০টি প্রোডাক্ট ক্যাটালগ, অটো কমেন্ট রিপ্লাই ও কুরিয়ার বুকিং।\n\n🚀 ২) Pro Business Plan (১ বছর / ১২ মাস):\n• মোট খরচ: ৳২৩,৪০০ টাকা (মাসিক ৳১,৯৫০ হিসেবে)\n• সুবিধা: ৩টি AI এজেন্ট, ভয়েস মেসেজ ও ছবি চেনা (Voice & Image AI), আনলিমিটেড প্রোডাক্ট ও স্টোর কানেকশন এবং ২৪/৭ ভিআইপি সাপোর্ট।\n\n🎁 চাইলে প্রথমে আমাদের ওয়েবসাইট (https://www.oneagentbd.online) থেকে ২ দিনের ফ্রি ট্রায়াল নিয়ে টেস্ট করে দেখতে পারেন! আপনি কোন প্ল্যানটি নিতে চাচ্ছেন?`;
    }

    if (isSixMonths) {
      return `আমাদের ৬ মাসের সাবস্ক্রিপশন প্ল্যানের খরচ:\n\n📦 ১) Starter AI Plan (৬ মাস): ৳৭,৫০০ টাকা (৳১,২৫০/মাস)\n🚀 ২) Pro Business Plan (৬ মাস): ৳১১,৭০০ টাকা (৳১,৯৫০/মাস)\n\nচেকআউটের সময় প্রোমো/কুপন কোড ব্যবহারের সুবিধা আছে এবং শুরুতে ২ দিনের ফ্রি ট্রায়াল নিয়ে সব ফিচার টেস্ট করে দেখতে পারেন!`;
    }

    if (isThreeMonths) {
      return `আমাদের ৩ মাসের সাবস্ক্রিপশন প্ল্যানের খরচ:\n\n📦 ১) Starter AI Plan (৩ মাস): ৳৩,৭৫০ টাকা (৳১,২৫০/মাস)\n🚀 ২) Pro Business Plan (৩ মাস): ৳৫,৮৫০ টাকা (৳১,৯৫০/মাস)\n\nআপনি চাইলে এখনই https://www.oneagentbd.online ওয়েবসাইটে গিয়ে ২ দিনের ফ্রি ট্রায়াল চালু করতে পারেন অথবা সরাসরি যেকোনো প্ল্যান অ্যাক্টিভ করতে পারেন!`;
    }

    if (isTwoMonths) {
      return `আমাদের ২ মাসের সাবস্ক্রিপশন প্ল্যানের খরচ:\n\n📦 ১) Starter AI Plan (২ মাস): ৳২,৫০০ টাকা (৳১,২৫০/মাস)\n🚀 ২) Pro Business Plan (২ মাস): ৳৩,৯০০ টাকা (৳১,৯৫০/মাস)\n\nসাথে থাকছে ২ দিনের ফ্রি ট্রায়াল সুবিধা! শুরু করতে ভিজিট করুন: https://www.oneagentbd.online`;
    }

    // 2B. Voice & Photo recognition inquiry
    if (
      q.includes('voice') ||
      q.includes('audio') ||
      q.includes('chobi') ||
      q.includes('photo') ||
      q.includes('image') ||
      q.includes('picture') ||
      q.includes('ভয়েস') ||
      q.includes('অডিও') ||
      q.includes('ছবি')
    ) {
      return `জ্বী! আমাদের AI ভয়েস মেসেজ এবং প্রোডাক্টের ছবি দুটোই বুঝতে পারে:\n\n🎤 ১) ভয়েস মেসেজ রিপ্লাই (Voice AI): কাস্টমার টাইপ না করে বাংলা বা বাংলিশে ভয়েস মেসেজ পাঠালে AI তা শুনে সাথে সাথে সঠিক উত্তর দেয়।\n📸 ২) ছবি দেখে প্রোডাক্ট চেনা (Visual Photo Search): কাস্টমার কোনো প্রোডাক্টের ছবি বা স্ক্রিনশট পাঠালে AI ক্যাটালগ থেকে ছবিটি চিনে দাম ও বিবরণ জানিয়ে দেয়!\n\n২ দিনের ফ্রি ট্রায়াল নিয়ে এখনই টেস্ট করে দেখুন: https://www.oneagentbd.online`;
    }

    // 2C. Comment reply inquiry
    if (q.includes('comment') || q.includes('কমেন্ট') || q.includes('পোস্ট')) {
      return `জ্বী! আপনার ফেসবুক পেজ বা ইনস্টাগ্রামের পোস্টে কেউ "Price please", "দাম কত?" বা যেকোনো কমেন্ট করলে আমাদের AI সাথে সাথে:\n\n✅ ১) ওই কমেন্টের নিচে সুন্দরভাবে রিপ্লাই দেয়।\n📩 ২) এবং কাস্টমারের মেসেঞ্জার ইনবক্সে (DM-এ) প্রোডাক্টের দাম ও বিস্তারিত মেসেজ পাঠিয়ে দেয়!\n\nফলে একটিও কাস্টমার মিস হয় না।`;
    }

    // 2D. Courier & Order taking inquiry
    if (
      q.includes('courier') ||
      q.includes('steadfast') ||
      q.includes('pathao') ||
      q.includes('redx') ||
      q.includes('কুরিয়ার') ||
      q.includes('পার্সেল') ||
      (q.includes('order') && !q.includes('kivabe kinbo'))
    ) {
      return `আমাদের অটো অর্ডার ও কুরিয়ার বুকিং যেভাবে কাজ করে:\n\n🛍️ ১) অটো অর্ডার গ্রহণ: চ্যাটের ভেতরেই কাস্টমারের নাম, মোবাইল নাম্বার এবং ঠিকানা নিয়ে AI নিজেই অর্ডার কনফার্ম করে ড্যাশবোর্ডের "Orders & Courier" লিস্টে সেভ করে রাখে।\n🚚 ২) ১-ক্লিকে কুরিয়ার বুকিং: অর্ডার আসার পর ড্যাশবোর্ড থেকে মাত্র ১ ক্লিকে Steadfast, Pathao বা RedX কুরিয়ারে পার্সেল বুকিং করতে পারবেন—আলাদা করে কপি-পেস্ট করতে হবে না!`;
    }

    // 2E. Website / WooCommerce / Shopify integration
    if (
      q.includes('website') ||
      q.includes('wordpress') ||
      q.includes('woocommerce') ||
      q.includes('shopify') ||
      q.includes('ওয়েবসাইট') ||
      q.includes('ওয়েবসাইট')
    ) {
      return `জ্বী! আমাদের উভয় প্ল্যানেই (৳১,২৫০ এবং ৳১,৯৫০) ওয়েবসাইট ও ই-কমার্স স্টোর কানেক্ট করার সুবিধা আছে:\n\n🌐 ১) আপনার WordPress/WooCommerce, Shopify বা কাস্টম ওয়েবসাইটের প্রোডাক্ট ও অর্ডার লাইভ সিঙ্ক করতে পারবেন।\n💬 ২) ড্যাশবোর্ড থেকে মাত্র ১ লাইনের Script কোড কপি করে আপনার ওয়েবসাইটে লাইভ AI চ্যাটবট বসাতে পারবেন!`;
    }

    // 2F. Ban risk / Meta official API / Message limit
    if (
      q.includes('ban') ||
      q.includes('risk') ||
      q.includes('limit') ||
      q.includes('official') ||
      q.includes('ব্যান') ||
      q.includes('ঝুঁকি') ||
      q.includes('সমস্যা হবে') ||
      q.includes('লিমিট')
    ) {
      return `আপনার পেজ ১০০% নিরাপদ থাকবে! 🛡️\n\n• আমরা মেটার ১০০% অফিশিয়াল Cloud & Graph API ব্যবহার করি, তাই আপনার ফেসবুক পেজ বা হোয়াটসঅ্যাপ নাম্বার ব্যান বা রেস্ট্রিক্টেড হওয়ার ০% ঝুঁকিও নেই।\n• এবং আমাদের উভয় প্ল্যানেই আনলিমিটেড মেসেজ রিপ্লাই (প্রতি মেসেজে আলাদা কোনো টাকা কাটে না)!`;
    }

    // 2G. Payment / bKash / Nagad / Discount / Coupon inquiry
    if (
      q.includes('bkash') ||
      q.includes('nagad') ||
      q.includes('rocket') ||
      q.includes('payment') ||
      q.includes('pay') ||
      q.includes('coupon') ||
      q.includes('discount') ||
      q.includes('বিকাশ') ||
      q.includes('নগদ') ||
      q.includes('পেমেন্ট') ||
      q.includes('ডিসকাউন্ট') ||
      q.includes('কুপন') ||
      q.includes('ছাড়')
    ) {
      return `আমাদের পেমেন্ট করার নিয়ম একদম সহজ:\n\n💳 ১) আমাদের ওয়েবসাইট (https://www.oneagentbd.online)-এ লগইন করে "Billing & Plan" মেনুতে যান।\n📲 ২) বিকাশ (bKash), নগদ (Nagad), রকেট (Rocket) বা উপায় (Upay)-এর মাধ্যমে পেমেন্ট করে Transaction ID (TrxID) দিলেই প্ল্যান সাথে সাথে অ্যাক্টিভ হয়ে যাবে।\n🎟️ ৩) পেমেন্টের সময় Coupon Code বক্সে প্রোমো কোড ব্যবহার করে ডিসকাউন্টও পেতে পারেন!`;
    }

    // 2H. Free trial inquiry
    if (q.includes('trial') || q.includes('trail') || q.includes('free') || q.includes('ট্রায়াল') || q.includes('ফ্রি')) {
      return `জ্বী! আমাদের ওয়েবসাইটে নতুন অ্যাকাউন্ট খুললেই পাচ্ছেন ২ দিনের (৪৮ ঘণ্টা) সম্পূর্ণ ফ্রি ট্রায়াল—কোনো ক্রেডিট কার্ড বা অগ্রিম পেমেন্ট লাগবে না।\n\n✅ কীভাবে চালু করবেন:\n১) ভিজিট করুন: https://www.oneagentbd.online\n২) "Get Started / Sign Up" বাটনে ক্লিক করে অ্যাকাউন্ট খুলুন।\n৩) মাত্র ১ ক্লিকে আপনার ফেসবুক পেজ কানেক্ট করে অটো-রিপ্লাই টেস্ট করুন!`;
    }

    // 2I. Setup / Connect / How it works inquiry
    if (
      q.includes('connect') ||
      q.includes('setup') ||
      q.includes('kivabe') ||
      q.includes('কিভাবে') ||
      q.includes('কানেক্ট') ||
      q.includes('সেটআপ') ||
      q.includes('কাজ করে')
    ) {
      return `আমাদের প্ল্যাটফর্মে পেজ কানেক্ট ও AI সেটআপ করা একদম সহজ (মাত্র ২ মিনিটের কাজ):\n\n১) https://www.oneagentbd.online ওয়েবসাইটে লগইন করে ড্যাশবোর্ডে যান।\n২) "AI Agent & Channels" মেনু থেকে "Connect with Facebook" বাটনে ১ ক্লিক করে আপনার পেজ কানেক্ট করুন।\n৩) আপনার প্রোডাক্ট বা বিজনেসের তথ্য লিখে Save করলেই AI ২৪/৭ অটো রিপ্লাই শুরু করবে!\n\nপ্রয়োজনে আমাদের সাপোর্ট টিম (+8801601705804) আপনাকে ফ্রিতে পুরো সেটআপ করে দেবে।`;
    }

    // 2J. General pricing / plan inquiry
    if (
      q.includes('price') ||
      q.includes('dam') ||
      q.includes('koto') ||
      q.includes('plan') ||
      q.includes('package') ||
      q.includes('taka') ||
      q.includes('starter') ||
      q.includes('pro') ||
      q.includes('দাম') ||
      q.includes('কত') ||
      q.includes('প্ল্যান') ||
      q.includes('প্যাকেজ') ||
      q.includes('খরচ') ||
      q.includes('চার্জ')
    ) {
      return `আমাদের ২ দিনের ফ্রি ট্রায়ালসহ ২টি অফিশিয়াল সাবস্ক্রিপশন প্ল্যান রয়েছে:\n\n📦 ১) Starter AI Plan — ৳১,২৫০ টাকা/মাস (১ বছর নিলে ৳১৫,০০০ টাকা):\n• ১টি AI এজেন্ট (২৪/৭ অটো-রিপ্লাই)\n• Facebook, Instagram, WhatsApp ও Website চ্যাটবট\n• ৫০টি প্রোডাক্ট ক্যাটালগ, অটো কমেন্ট রিপ্লাই ও কুরিয়ার বুকিং\n\n🚀 ২) Pro Business Plan — ৳১,৯৫০ টাকা/মাস (১ বছর নিলে ৳২৩,৪০০ টাকা):\n• ৩টি AI এজেন্ট ও ভয়েস মেসেজ (Voice AI) রিপ্লাই\n• আনলিমিটেড প্রোডাক্ট ক্যাটালগ ও ছবি দেখে প্রোডাক্ট চেনা\n• সর্বোচ্চ ১০টি চ্যানেল ও ২৪/৭ ভিআইপি সাপোর্ট\n\n🎁 শুরুতে ২ দিনের সম্পূর্ণ ফ্রি ট্রায়াল নিতে ভিজিট করুন: https://www.oneagentbd.online`;
    }

    // 2K. Features / Services inquiry
    if (
      q.includes('service') ||
      q.includes('feature') ||
      q.includes('ki ki') ||
      q.includes('সার্ভিস') ||
      q.includes('ফিচার') ||
      q.includes('কি কি') ||
      q.includes('বিস্তারিত') ||
      q.includes('details')
    ) {
      return `One Agent BD-এর প্রধান ফিচারসমূহ:\n\n✅ ২৪/৭ অটো মেসেজ ও কমেন্ট রিপ্লাই (Facebook, Instagram, WhatsApp ও Website)\n✅ ভয়েস মেসেজ শুনে ও প্রোডাক্টের ছবি দেখে সঠিক দাম ও বিবরণ জানানো\n✅ কাস্টমারের নাম, ঠিকানা ও ফোন নাম্বার নিয়ে অটোমেটিক অর্ডার বুকিং\n✅ ১-ক্লিকে Steadfast, Pathao ও RedX কুরিয়ারে পার্সেল এন্ট্রি\n✅ মেটার অফিশিয়াল API (পেজ ব্যান হওয়ার ০% ঝুঁকি, আনলিমিটেড মেসেজ)\n\nআমাদের প্ল্যান শুরু মাত্র ৳১,২৫০/মাস থেকে (সাথে ২ দিনের ফ্রি ট্রায়াল)। বিস্তারিত জানতে বা শুরু করতে ভিজিট করুন: https://www.oneagentbd.online`;
    }

    // 2L. Contact / Support inquiry
    if (
      q.includes('number') ||
      q.includes('phone') ||
      q.includes('call') ||
      q.includes('contact') ||
      q.includes('support') ||
      q.includes('নাম্বার') ||
      q.includes('ফোন') ||
      q.includes('কল') ||
      q.includes('যোগাযোগ') ||
      q.includes('কথা বলতে')
    ) {
      return `আমাদের সাপোর্ট টিমের সাথে যোগাযোগের মাধ্যম (প্রতিদিন সকাল ৯টা – রাত ১১টা):\n\n📞 হোয়াটসঅ্যাপ ও হেল্পলাইন: +8801601705804\n📧 ইমেইল: support.oneagentbd@gmail.com\n🌐 ওয়েবসাইট: https://www.oneagentbd.online\n\nআপনার ফোন নাম্বারটি এখানে দিলেও আমাদের প্রতিনিধি আপনাকে কল করে সাহায্য করবেন!`;
    }

    // Default SaaS greeting / overview
    return `আসসালামু আলাইকুম! ${businessName}-এ আপনাকে স্বাগতম। 👋\n\nআমরা Facebook Page, Instagram, WhatsApp এবং Website-এর জন্য ২৪/৭ অটোমেটিক AI মেসেজ রিপ্লাই, ভয়েস ও ছবির উত্তর, কমেন্ট অটো-রিপ্লাই এবং অটো অর্ডার ও কুরিয়ার বুকিং সার্ভিস দিয়ে থাকি।\n\n💎 আমাদের প্ল্যানসমূহ:\n• Starter AI Plan: ৳১,২৫০/মাস (১ বছর ৳১৫,০০০)\n• Pro Business Plan: ৳১,৯৫০/মাস (১ বছর ৳২৩,৪০০)\n🎁 সাথে থাকছে ২ দিনের সম্পূর্ণ ফ্রি ট্রায়াল!\n\nআপনার যেকোনো প্রশ্ন থাকলে জানাতে পারেন!`;
  }

  // 3. General Merchant Knowledge-Base Parser (for any Merchant's custom systemPrompt + Product Catalog)
  const cleanLines = Array.from(
    new Set(
      (systemPrompt || '')
        .split('\n')
        .map((l) => l.trim())
        .filter(
          (l) =>
            l.length > 3 &&
            !l.startsWith('===') &&
            !l.startsWith('---') &&
            !l.toLowerCase().startsWith('you are') &&
            !l.startsWith('আপনি "') &&
            !l.toLowerCase().includes('mandatory') &&
            !l.includes('আবশ্যিক নিয়মাবলী') &&
            !l.includes('সর্বদা সুন্দর')
        )
    )
  );

  const findMerchantLines = (keywords: string[]): string | null => {
    const matched: string[] = [];
    for (const line of cleanLines) {
      const lower = line.toLowerCase();
      if (keywords.some((kw) => lower.includes(kw))) {
        matched.push(line);
      }
      if (matched.length >= 4) break;
    }
    return matched.length > 0 ? matched.join('\n') : null;
  };

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
    const kbDelivery = findMerchantLines(['ডেলিভারি', 'delivery', 'ঢাকার ভেতরে', 'ঢাকার বাইরে', 'কুরিয়ার', 'courier']);
    if (kbDelivery) {
      return `আমাদের ডেলিভারি সংক্রান্ত তথ্য:\n\n${kbDelivery}\n\nঅর্ডার করতে আপনার নাম, ঠিকানা ও ফোন নাম্বার দিন।`;
    }
    return `আমাদের ডেলিভারি চার্জ ঢাকার ভেতরে ৳৬০ (২৪-৪৮ ঘণ্টা) এবং ঢাকার বাইরে সারাদেশে ৳১২০ (২-৩ দিন)। সারাদেশে ক্যাশ অন ডেলিভারি (COD) সুবিধা রয়েছে! অর্ডার করতে আপনার নাম, ঠিকানা ও ফোন নাম্বার দিন।`;
  }

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
    const kbPay = findMerchantLines(['বিকাশ', 'নগদ', 'পেমেন্ট', 'bkash', 'nagad', 'payment', 'ক্যাশ অন ডেলিভারি']);
    if (kbPay) {
      return `আমাদের পেমেন্ট পদ্ধতি:\n\n${kbPay}`;
    }
    return `আমরা ক্যাশ অন ডেলিভারি (COD), বিকাশ এবং নগদ পেমেন্ট গ্রহণ করি। অর্ডার কনফার্ম করতে আপনার নাম, ঠিকানা ও মোবাইল নাম্বার দিন।`;
  }

  if (
    q.includes('order') ||
    q.includes('buy') ||
    q.includes('confirm') ||
    q.includes('অর্ডার') ||
    q.includes('কিনব') ||
    q.includes('নিতে চাই') ||
    q.includes('নিবো')
  ) {
    return `অর্ডার কনফার্ম করতে অনুগ্রহ করে নিচের তথ্যগুলো লিখে পাঠান:\n• আপনার নাম:\n• সম্পূর্ণ ডেলিভারি ঠিকানা:\n• সচল মোবাইল নাম্বার (১১ ডিজিট):`;
  }

  if (products.length > 0) {
    const topList = products
      .slice(0, 5)
      .map((p) => `• ${p.name} — ৳${p.price} (${p.description.slice(0, 60)})`)
      .join('\n');
    return `আসসালামু আলাইকুম! ${businessName}-এ আপনাকে স্বাগতম।\n\nআমাদের প্রোডাক্ট ও মূল্য তালিকা:\n${topList}\n\nআপনি কোন প্রোডাক্টটি নিতে চান বা বিস্তারিত জানতে চান?`;
  }

  const kbOverview = findMerchantLines(['৳', 'টাকা', 'price', 'দাম', 'সার্ভিস', 'প্যাকেজ']);
  if (kbOverview) {
    return `আসসালামু আলাইকুম! ${businessName}-এ আপনাকে স্বাগতম।\n\n${kbOverview}\n\nআপনি কোনটি নিতে চাচ্ছেন বা বিস্তারিত জানতে চান?`;
  }

  return `আসসালামু আলাইকুম! ${businessName}-এ আপনাকে স্বাগতম। আমাদের সার্ভিস, প্রোডাক্টের দাম বা অর্ডার করার নিয়ম সম্পর্কে যেকোনো প্রশ্ন করুন, আমি সাথে সাথে উত্তর দিচ্ছি!`;
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
  const languageDirective = `CRITICAL MANDATORY LANGUAGE & FORMATTING RULES (অবশ্যই পালনীয়):
- কাস্টমার বাংলা (Bangla script), বাংলিশ (Banglish - ইংরেজি অক্ষরে বাংলা লেখা যেমন: "1 bochorer jonno koto", "dam koto", "ki ki service ache", "order korbo kivabe", "hello") অথবা যেভাবেই প্রশ্ন করুক না কেন, সর্বদা পরিষ্কার, মার্জিত ও প্রাকৃতিক বাংলা ভাষায় (Bengali script: বাংলায়) উত্তর দেবেন।
- কাস্টমার ঠিক যে প্রশ্নটি করেছে, সরাসরি সেই প্রশ্নের সঠিক উত্তর আগে দেবেন। অপ্রাসঙ্গিক কথা বা অন্য টপিক টেনে আনবেন না।
- যদি মাসিক প্ল্যান বা প্যাকেজের দাম দেওয়া থাকে (যেমন Starter ৳১,২৫০/মাস ও Pro ৳১,৯৫০/মাস) এবং কাস্টমার ২ মাস, ৩ মাস, ৬ মাস বা ১ বছরের (১২ মাসের) খরচ জানতে চায়, তবে মাসের সংখ্যা দিয়ে গুণ করে সঠিক মোট খরচটি (যেমন ১ বছরে Starter প্ল্যান: ১,২৫০ × ১২ = ৳১৫,০০০ টাকা এবং Pro প্ল্যান: ১,৯৫০ × ১২ = ৳২৩,৪০০ টাকা) পরিষ্কারভাবে হিসাব করে জানাবেন।
- মেসেজ ফরম্যাট (Message Formatting): মেসেঞ্জার ও হোয়াটসঅ্যাপে পড়ার সুবিধার জন্য উত্তরটি সুন্দর লাইন ব্রেক (নতুন লাইন) এবং বুলেট পয়েন্ট (• বা ✅) দিয়ে সাজিয়ে লিখবেন। কখনোই এক প্যারাগ্রাফে সব গাদাগাদি করে লিখবেন না এবং কখনোই ** বা # চিহ্ন ব্যবহার করবেন না।`;

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

  const systemInstruction = `You are the official, warm, and highly intelligent Customer Support & Sales AI Representative for "${businessName}".
Always follow the merchant's Business Knowledge Base and Product Catalog strictly.
Reply in clean, well-formatted Bangla (বাংলা স্ক্রিপ্টে) with proper line breaks and bullet points (•) when listing prices or features. Never output raw markdown asterisks (**).`;

  const fullPrompt = `System Instructions & Business Knowledge Base (Merchant Details):
${systemPrompt}

Language & Formatting Instructions:
${languageDirective}

Merchant Product Catalog:
${catalogContext}

${orderGuidance}
${productPhotoDirective}

Recent Conversation History:
${recentHistory || '(No previous messages)'}

Customer's Exact Question:
"${params.incomingMessage}"

Write a direct, accurate, well-formatted Bangla reply that directly answers the customer's question above:`;

  const effectiveApiKey =
    (params.overrideApiKey && params.overrideApiKey.trim()) ||
    (profile?.llm_api_key && profile.llm_api_key.trim()) ||
    ((db.getSettings() as any)?.default_llm_api_key || '').trim() ||
    undefined;

  const geminiReply = await callGemini(fullPrompt, effectiveApiKey, systemInstruction);
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
