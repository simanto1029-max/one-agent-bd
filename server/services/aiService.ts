import { GoogleGenAI } from '@google/genai';
import { db, Message, Product, InteractiveMessageConfig, InteractiveOptionItem } from '../db/database.js';
import { cleanAudioMimeType, convertToWav, detectAudioMimeTypeFromBuffer, mp4ToAdtsAac } from './audioDownloader.js';
import { buildAppointmentAIContext } from './appointmentService.js';

function isDeadSeedKey(key?: string): boolean {
  return Boolean(key && key.trim().startsWith('sk-proj-wJiInvQ'));
}

export function getCandidateGeminiKeys(customApiKey?: string): string[] {
  const defaultSystemKey = ((db.getSettings() as any)?.default_llm_api_key || '').trim();
  const allProfiles = db.getProfiles() || [];
  const adminKeys = allProfiles
    .filter((p) => p.role === 'admin' && p.llm_api_key?.trim() && !isDeadSeedKey(p.llm_api_key))
    .map((p) => p.llm_api_key!.trim());
  const anyProfileKeys = allProfiles
    .filter((p) => p.llm_api_key?.trim() && !isDeadSeedKey(p.llm_api_key))
    .map((p) => p.llm_api_key!.trim());

  return Array.from(
    new Set(
      [
        customApiKey?.trim(),
        ...adminKeys,
        ...anyProfileKeys,
        defaultSystemKey,
        process.env.GEMINI_API_KEY?.trim(),
        process.env.VITE_GEMINI_API_KEY?.trim(),
        process.env.GOOGLE_API_KEY?.trim()
      ].filter((k): k is string => Boolean(k && k.length > 10 && !k.startsWith('sk-') && !k.startsWith('gsk_')))
    )
  );
}

function getGeminiClients(customApiKey?: string): GoogleGenAI[] {
  const candidateKeys = getCandidateGeminiKeys(customApiKey);

  if (candidateKeys.length === 0) {
    // On Vercel Serverless, an empty API key cannot use AI Studio's internal container proxy
    if (process.env.VERCEL === '1' || process.env.VERCEL === 'true') {
      return [];
    }
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

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
function toBengaliNumber(n: number): string {
  return String(n)
    .split('')
    .map((ch) => (ch >= '0' && ch <= '9' ? BENGALI_DIGITS[Number(ch)] : ch))
    .join('');
}

export function formatCleanChatMessage(raw: string): string {
  if (!raw) return '';
  let text = raw
    .replace(/\r\n/g, '\n')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/।।+/g, '।')
    // Ensure a space after Bengali Dari or punctuation when followed directly by a word character
    .replace(/([।?!])(?=[^\s।?!\n"”')\]])/gu, '$1 ')
    // If inline serial numbers like "১. ... ২. ..." or "1) ... 2) ..." appear on the same line, break them onto new lines
    .replace(/([^\n])\s+([১-৯0-9][.)]\s+)/gu, '$1\n$2')
    .trim();

  const isBanglaText = /[\u0980-\u09FF]/.test(text);

  const splitDenseParagraph = (para: string): string[] => {
    const trimmed = para.trim();
    if (!trimmed) return [];
    // Do not split bullet/numbered points
    if (/^[•\-–—*০-৯0-9]+[.)]?\s/.test(trimmed)) {
      return [trimmed];
    }

    // Check if a sentence/paragraph combines two or more priced plans/items with "এবং" or "and" without serial numbers
    const sentences = trimmed
      .split(/(?<=[।?!])\s+/u)
      .map((s) => s.trim())
      .filter(Boolean);

    const expandedSentences: string[] = [];
    for (const s of sentences) {
      const hasMultiplePricesOrPlans =
        /(টাকা|৳|tk|bdt|প্ল্যান|plan)/i.test(s) &&
        /\s+(?:এবং|ও|আর|and)\s+/i.test(s);

      if (hasMultiplePricesOrPlans) {
        const parts = s
          .replace(/[।.]$/, '')
          .split(/\s+(?:এবং|and)\s+/i)
          .map((p) => p.trim())
          .filter(Boolean);

        if (
          parts.length >= 2 &&
          parts.every((p) => /(টাকা|৳|tk|bdt|প্ল্যান|plan|প্রোডাক্ট|সার্ভিস)/i.test(p))
        ) {
          parts[0] = parts[0].replace(/^(আমাদের\s+)(রয়েছে\s+|আছে\s+)?/i, '').trim();
          expandedSentences.push(
            isBanglaText ? 'আমাদের প্ল্যান ও বিস্তারিত নিচে দেওয়া হলো:' : 'Here are the details:'
          );
          parts.forEach((p, idx) => {
            const num = isBanglaText ? `${toBengaliNumber(idx + 1)}.` : `${idx + 1}.`;
            expandedSentences.push(`${num} ${p}`);
          });
          continue;
        }
      }
      expandedSentences.push(s);
    }

    if (expandedSentences.some((x) => /^[০-৯0-9]+\.\s/.test(x))) {
      return expandedSentences;
    }

    if (sentences.length <= 1) {
      return [trimmed];
    }
    if (sentences.length === 2) {
      // If the second sentence is a question or the paragraph is long, put empty line between them
      if (sentences[1].endsWith('?') || trimmed.length > 85) {
        return [sentences[0], sentences[1]];
      }
      return [trimmed];
    }
    if (sentences.length === 3) {
      if (sentences[2].endsWith('?')) {
        return [sentences[0], sentences[1], sentences[2]];
      }
      return [sentences[0], `${sentences[1]} ${sentences[2]}`];
    }
    // 4+ sentences: keep readable paragraphs and separate closing question
    const lastSentence = sentences[sentences.length - 1];
    const isLastQuestion = lastSentence.endsWith('?');
    const bodySentences = isLastQuestion ? sentences.slice(0, -1) : sentences;

    const mid = Math.ceil(bodySentences.length / 2);
    const para1 = bodySentences.slice(0, mid).join(' ');
    const para2 = bodySentences.slice(mid).join(' ');
    return [para1, para2, ...(isLastQuestion ? [lastSentence] : [])].filter(Boolean);
  };

  const rawLines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const expandedLines: string[] = [];
  for (const line of rawLines) {
    expandedLines.push(...splitDenseParagraph(line));
  }

  // Convert unordered bullets (•, -, *) into clean serial numbers (১., ২., ৩. or 1., 2., 3.)
  let serialCounter = 0;
  const serializedLines = expandedLines.map((line) => {
    if (/^[•\-–—*]\s+/.test(line)) {
      serialCounter += 1;
      const cleanBody = line.replace(/^[•\-–—*]\s+/, '').trim();
      const prefix = isBanglaText ? `${toBengaliNumber(serialCounter)}.` : `${serialCounter}.`;
      return `${prefix} ${cleanBody}`;
    } else if (/^[০-৯0-9]+[.)]\s+/.test(line)) {
      serialCounter += 1;
      const cleanBody = line.replace(/^[০-৯0-9]+[.)]\s+/, '').trim();
      const prefix = isBanglaText ? `${toBengaliNumber(serialCounter)}.` : `${serialCounter}.`;
      return `${prefix} ${cleanBody}`;
    } else {
      serialCounter = 0;
      return line;
    }
  });

  // Always put 1 empty line (\n\n) between every paragraph AND between 1., 2., 3. serial items!
  if (serializedLines.length > 1) {
    text = serializedLines.join('\n\n');
  } else if (serializedLines.length === 1) {
    text = serializedLines[0];
  }

  return text.replace(/\n{3,}/g, '\n\n').trim();
}

export function getShortGreetingOrSmallTalkReply(
  incomingMessage: string,
  businessName = 'One Agent BD',
  lang: 'bn' | 'en' = 'bn'
): string | null {
  if (!incomingMessage) return null;
  const raw = incomingMessage.trim();
  if (raw.length > 55) return null;

  const lower = raw.toLowerCase();

  // If the message contains any real business/product/price/order question words, it's NOT just a greeting
  const questionKeywords = [
    'price', 'plan', 'cost', 'fee', 'subscription', 'trial', 'free', 'order', 'buy', 'delivery',
    'charge', 'courier', 'bkash', 'nagad', 'payment', 'coupon', 'discount', 'website', 'whatsapp',
    'messenger', 'page', 'ban', 'limit', 'voice', 'photo', 'image', 'product', 'service', 'feature',
    'details', 'koto', 'dam', 'daam', 'kivabe', 'ki ki', 'ki ase', 'ki ache', 'taka', 'tk', 'bdt',
    'দাম', 'কত', 'প্ল্যান', 'প্যাকেজ', 'ট্রায়াল', 'ফ্রি', 'অর্ডার', 'কিনব', 'নিতে', 'ডেলিভারি', 'চার্জ',
    'কুরিয়ার', 'বিকাশ', 'নগদ', 'পেমেন্ট', 'কুপন', 'ডিসকাউন্ট', 'ছাড়', 'ওয়েবসাইট', 'ব্যান', 'লিমিট',
    'ভয়েস', 'ছবি', 'প্রোডাক্ট', 'সার্ভিস', 'ফিচার', 'বিস্তারিত', 'কী কী', 'কি কি', 'কীভাবে', 'কিভাবে', 'টাকা'
  ];
  if (questionKeywords.some((kw) => lower.includes(kw))) {
    return null;
  }

  // Strip punctuation, emojis, and polite address words to inspect the core greeting
  const stripped = lower
    .replace(/[.,?!।'"\-_*~`()[\]{}]/g, ' ')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ' ')
    .replace(/\b(vai|vaia|bhaiya|bhai|apu|sir|boss|bro|dear|ভাইয়া|ভাইয়া|ভাই|আপু|স্যার|বস)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!stripped) return null;

  // 1. Salam / Assalamu Alaikum variations
  const salamPatterns = [
    'আসসালামু আলাইকুম',
    'আসসালামুয়ালাইকুম',
    'আসসালামু ওয়ালাইকুম',
    'সালাম',
    'স্লামালাইকুম',
    'আসসালামু',
    'assalamu alaikum',
    'assalamualaikum',
    'as salamu alaikum',
    'as-salamu alaykum',
    'salam',
    'slm',
    'assalam'
  ];
  if (salamPatterns.some((p) => stripped === p || stripped.startsWith(p))) {
    return lang === 'en' && !/[\u0980-\u09FF]/.test(raw) && !lower.includes('vai')
      ? `Wa Alaikum Assalam! Welcome to ${businessName}. 😊\n\nHow can I help you today?`
      : `ওয়ালাইকুম আসসালাম! ${businessName}-এ আপনাকে স্বাগতম। 😊\n\nবলুন, আপনাকে কীভাবে সাহায্য করতে পারি?`;
  }

  // 2. How are you / Kemon achen variations
  const howAreYouPatterns = [
    'কেমন আছেন',
    'কেমন আছো',
    'কি খবর',
    'কী খবর',
    'kemon achen',
    'kemon asen',
    'kmn achen',
    'kmn asen',
    'ki khobor',
    'how are you',
    'how r u'
  ];
  if (howAreYouPatterns.some((p) => stripped === p || stripped.includes(p))) {
    return lang === 'en' && stripped.includes('how')
      ? `Alhamdulillah, we are doing great! Hope you are doing well too. 😊\n\nHow can I help you today?`
      : `আলহামদুলিল্লাহ, ভালো আছি! আশা করি আপনিও ভালো আছেন। 😊\n\nবলুন, আজ আপনাকে কীভাবে সাহায্য করতে পারি?`;
  }

  // 3. Hello / Hi / Hey / Keu achen variations
  const helloPatterns = [
    'হ্যালো',
    'হাই',
    'হেলো',
    'হে',
    'কেউ আছেন',
    'আছেন',
    'hello',
    'hi',
    'hey',
    'hlw',
    'hlo',
    'keu achen',
    'keu asen'
  ];
  if (helloPatterns.some((p) => stripped === p)) {
    return lang === 'en' && /^[a-z\s]+$/i.test(stripped) && !stripped.includes('keu')
      ? `Hello! Welcome to ${businessName}. 😊\n\nHow can I help you today?`
      : `আসসালামু আলাইকুম! ${businessName}-এ আপনাকে স্বাগতম। 😊\n\nবলুন, আপনাকে কীভাবে সাহায্য করতে পারি?`;
  }

  // 4. Short polite address only (e.g., "ভাইয়া", "আপু")
  if (/^(ভাইয়া|ভাইয়া|ভাই|আপু|স্যার|vai|vaia|bhaiya|bhai|apu|sir)$/i.test(raw.replace(/[.,?!।]/g, '').trim())) {
    return `আসসালামু আলাইকুম! জ্বী বলুন, আপনাকে কীভাবে সাহায্য করতে পারি? 😊`;
  }

  // 5. Thanks / Ok
  const thanksPatterns = ['ধন্যবাদ', 'থ্যাংক ইউ', 'থ্যাংকস', 'ওকে', 'আচ্ছা', 'ঠিক আছে', 'thanks', 'thank you', 'tnx', 'ty', 'ok', 'okay'];
  if (thanksPatterns.some((p) => stripped === p)) {
    return lang === 'en' && /^[a-z\s]+$/i.test(stripped)
      ? `You're most welcome! 😊\n\nLet me know if you have any other questions.`
      : `আপনাকেও অসংখ্য ধন্যবাদ! 😊\n\nআপনার আর কোনো বিষয়ে জানার থাকলে নিঃসংকোচে বলতে পারেন।`;
  }

  return null;
}

export function ensureConversationalFollowUp(
  replyText: string,
  customerQuery: string,
  isOneAgentSaaS: boolean,
  hasProducts = false
): string {
  const formatted = formatCleanChatMessage(replyText);
  if (!formatted) return formatted;

  // If it already ends with a question mark (or question mark + emoji), it already has a follow-up question
  if (/\?\s*(?:[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}])?\s*$/u.test(formatted)) {
    return formatted;
  }

  // Do not append a follow-up if the reply is already asking for order details (name, address, phone)
  if (
    formatted.includes('নাম, ঠিকানা') ||
    formatted.includes('নাম, সম্পূর্ণ ঠিকানা') ||
    formatted.includes('মোবাইল নাম্বারটি দিন') ||
    formatted.includes('মোবাইল নাম্বার দিন') ||
    formatted.includes('স্পষ্ট বোঝা যায়নি')
  ) {
    return formatted;
  }

  const q = (customerQuery || '').toLowerCase();
  const isEnglish = /^[a-z0-9\s.,?!'"-]+$/i.test(formatted) && !/[\u0980-\u09FF]/.test(formatted);

  if (isEnglish) {
    const enFollowUp =
      q.includes('price') || q.includes('plan') || q.includes('cost')
        ? 'Would you like to start with our 2-Day Free Trial first, or activate a plan right away?'
        : 'Which platform (Facebook Page, WhatsApp, or Website) are you looking to automate first?';
    return `${formatted}\n\n${enFollowUp}`;
  }

  if (isOneAgentSaaS) {
    if (q.includes('price') || q.includes('dam') || q.includes('koto') || q.includes('plan') || q.includes('দাম') || q.includes('কত') || q.includes('প্ল্যান') || q.includes('প্যাকেজ') || q.includes('টাকা')) {
      return `${formatted}\n\nআপনি কি প্রথমে আমাদের ২ দিনের ফ্রি ট্রায়াল দিয়ে টেস্ট করে দেখতে চান, নাকি সরাসরি কোনো প্ল্যান অ্যাক্টিভ করবেন?`;
    }
    if (q.includes('trial') || q.includes('free') || q.includes('ট্রায়াল') || q.includes('ফ্রি')) {
      return `${formatted}\n\nআপনি কি আপনার ফেসবুক পেজ নাকি ওয়েবসাইটে ট্রায়ালটি কানেক্ট করতে চাচ্ছেন?`;
    }
    if (q.includes('coupon') || q.includes('discount') || q.includes('কুপন') || q.includes('ডিসকাউন্ট') || q.includes('ছাড়')) {
      return `${formatted}\n\nআপনি কোন প্ল্যানটি (Starter নাকি Pro) নেওয়ার কথা ভাবছেন?`;
    }
    return `${formatted}\n\nআপনার বিজনেস বা ফেসবুক পেজটি মূলত কোন ধরনের প্রোডাক্ট বা সার্ভিস নিয়ে কাজ করে?`;
  }

  if (hasProducts) {
    return `${formatted}\n\nআপনি কি এটি অর্ডার করতে চান, নাকি অন্য কোনো প্রোডাক্ট সম্পর্কে জানতে চাচ্ছেন?`;
  }

  return `${formatted}\n\nএই বিষয়ে আপনার কি আর কোনো প্রশ্ন আছে, নাকি অর্ডার করার নিয়মটি জানিয়ে দেবো?`;
}

export const UNCLEAR_VOICE_REPLY = `ভাইয়া/আপু, আপনার ভয়েস মেসেজটি স্পষ্ট বোঝা যায়নি।\n\nঅনুগ্রহ করে আরেকবার একটু পরিষ্কারভাবে ভয়েস দিন অথবা টেক্সটে লিখে জানান, আপনি ঠিক কোন বিষয়ে জানতে চাচ্ছেন? 😊`;

export function isUnclearVoiceText(str?: string): boolean {
  if (!str) return true;
  const cleaned = str
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/[.,?!।'"\-_*~`]/g, '')
    .trim();
  if (cleaned.length < 2) return true;

  const lower = str.toLowerCase().trim();
  return (
    lower.includes('[unclear]') ||
    lower.includes('unclear_audio') ||
    lower === 'unclear' ||
    lower.includes('silent') ||
    lower.includes('silence') ||
    lower.includes('inaudible') ||
    lower.includes('unintelligible') ||
    lower.includes('no speech') ||
    lower.includes('background noise') ||
    lower.includes('only noise') ||
    lower.includes('cannot understand') ||
    lower.includes('could not understand') ||
    lower.includes('not clear') ||
    lower.includes('audio is unclear') ||
    lower.includes('অস্পষ্ট') ||
    lower.includes('বোঝা যাচ্ছে না') ||
    lower.includes('বোঝা যায়নি') ||
    lower.includes('শোনা যাচ্ছে না') ||
    lower.includes('শোনা যায়নি') ||
    lower.includes('কোনো কথা শোনা')
  );
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
  interactiveOptions?: InteractiveMessageConfig;
}

export function extractCatalogItemsForInteractiveMenu(
  merchantProducts: Product[],
  systemPrompt: string,
  isOneAgentSaaS: boolean
): InteractiveOptionItem[] {
  // Never generate e-commerce product buttons/lists for One Agent BD SaaS itself
  if (isOneAgentSaaS) {
    return [];
  }

  const items: InteractiveOptionItem[] = [];

  // 1. Add real products from merchant's Products & Store catalog
  for (const prod of merchantProducts) {
    items.push({
      id: prod.id,
      title: prod.name,
      description: `৳${prod.price} ${prod.currency || 'BDT'}${
        prod.stock_status === 'out_of_stock' ? ' (স্টক আউট)' : ''
      }`,
      price: prod.price
    });
  }

  // 2. Also parse any product-price lines written inside the merchant's System Prompt / Knowledge Base
  // e.g., "কাঠবাদাম - ১৫০০৳" or "- আজওয়া খেজুর: ১৩০০ টাকা/কেজি"
  if (items.length === 0 && systemPrompt) {
    const lines = systemPrompt.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].replace(/^[•\-–—*০-৯0-9.)\s]+/, '').trim();
      if (!line || line.length > 90) continue;
      // Match patterns like "কাঠবাদাম - ১৫০০৳" or "আজওয়া খেজুর: ১৩০০ টাকা"
      const m = line.match(
        /^([^:–\-—]{2,45})\s*[:\-–—]\s*(?:৳\s*)?([০-৯0-9,]{2,7})\s*(?:৳|টাকা|taka|tk|bdt)?([^\n]*)$/i
      );
      if (m) {
        const title = m[1].trim();
        const rawPrice = m[2].trim();
        const unitSuffix = (m[3] || '').trim();
        // Skip phone numbers, delivery charges, or SaaS plans
        if (/phone|helpline|support|delivery|dhaka|plan|starter|pro|নাম্বার|হেল্পলাইন|সময়|ডেলিভারি|ঢাকা|প্ল্যান/i.test(title)) {
          continue;
        }
        if (!items.some((x) => x.title.toLowerCase() === title.toLowerCase())) {
          items.push({
            id: `kb_item_${items.length + 1}`,
            title,
            description: `${rawPrice}৳${unitSuffix ? ` ${unitSuffix}` : ''}`
          });
        }
      }
    }
  }

  return items.slice(0, 10);
}

export function buildInteractiveConversationEnvelope(params: {
  incomingMessage: string;
  aiReplyText: string;
  businessName: string;
  merchantProducts: Product[];
  matchedProduct?: Product;
  systemPrompt: string;
  isOneAgentSaaS: boolean;
}): { replyText: string; interactiveOptions?: InteractiveMessageConfig } {
  const {
    incomingMessage,
    aiReplyText,
    businessName,
    merchantProducts,
    matchedProduct,
    systemPrompt,
    isOneAgentSaaS
  } = params;

  // CRITICAL: Never show e-commerce interactive buttons (অর্ডার করুন, আরও দেখুন, হোম পেজ) for One Agent BD SaaS!
  if (isOneAgentSaaS) {
    return {
      replyText: aiReplyText,
      interactiveOptions: undefined
    };
  }

  const catalogItems = extractCatalogItemsForInteractiveMenu(
    merchantProducts,
    systemPrompt,
    isOneAgentSaaS
  );

  // Only enable interactive e-commerce buttons when the merchant actually has e-commerce products
  if (catalogItems.length === 0) {
    return {
      replyText: aiReplyText,
      interactiveOptions: undefined
    };
  }

  const q = (incomingMessage || '').trim();
  const qLower = q.toLowerCase();

  // Check if customer tapped or typed one of the extracted KB items directly
  const matchedCatalogItem =
    !matchedProduct && catalogItems.length > 0
      ? catalogItems.find(
          (item) =>
            qLower === item.title.toLowerCase() ||
            (item.title.length >= 3 && qLower.includes(item.title.toLowerCase()))
        )
      : undefined;

  // 1. Did the customer click "🏠 হোম পেজ" / "Main Menu"?
  const isHomeMenuIntent =
    qLower === 'হোম পেজ' ||
    qLower === 'home' ||
    qLower === 'home page' ||
    qLower === 'main menu' ||
    qLower === 'মেনু';

  if (isHomeMenuIntent) {
    const listPreview =
      catalogItems.length > 0
        ? '\n\nআমাদের প্রোডাক্ট ও মূল্য তালিকা:\n\n' +
          catalogItems
            .slice(0, 6)
            .map((it, idx) => `${toBengaliNumber(idx + 1)}. ${it.title} — ${it.description}`)
            .join('\n\n')
        : '';

    return {
      replyText: `আসসালামু আলাইকুম! ${businessName}-এ আপনাকে স্বাগতম। 🌟${listPreview}\n\nনিচের বাটন থেকে আপনার পছন্দের অপশনটি বেছে নিন:`,
      interactiveOptions: {
        type: 'list',
        listButtonLabel: 'পছন্দ করুন',
        listButtonTitle: 'পছন্দ করুন',
        listSectionTitle: 'পছন্দ করুন',
        footerText: `${businessName} AI Assistant`,
        items: catalogItems,
        listItems: catalogItems,
        buttons: [
          {
            id: 'btn_order_now',
            label: 'Order Now',
            payload: 'অর্ডার করতে চাই',
            icon: 'order'
          },
          {
            id: 'btn_see_more',
            label: 'আরও দেখুন',
            payload: 'আরও দেখুন',
            icon: 'back'
          }
        ]
      }
    };
  }

  // 2. Did the customer click "Order Now" or say "order korte cay" / "অর্ডার করতে চাই" (without giving phone + address yet)?
  const hasPhoneInMsg = /(?:\+?88)?01[3-9]\d{8}/.test(q);
  const isOrderFormIntent =
    !hasPhoneInMsg &&
    (qLower === 'order now' ||
      qLower === 'অর্ডার করতে চাই' ||
      qLower === 'অর্ডার ফর্ম দিন' ||
      qLower === 'অর্ডার করুন' ||
      qLower.includes('order korte cay') ||
      qLower.includes('order korte chai') ||
      qLower.includes('order korbo') ||
      qLower.includes('অর্ডার করতে চাই') ||
      qLower.includes('অর্ডার করবো') ||
      qLower.includes('অর্ডার নিবো'));

  if (isOrderFormIntent) {
    const selectedProdHint = matchedProduct
      ? ` (${matchedProduct.name} - ৳${matchedProduct.price})`
      : matchedCatalogItem
      ? ` (${matchedCatalogItem.title} - ${matchedCatalogItem.description})`
      : '';

    const orderFormReply = `আপনার অর্ডারটি${selectedProdHint} সম্পন্ন করতে দয়া করে নিচের তথ্যগুলো দিন:\n\n১. নাম\n\n২. মোবাইল নম্বর\n\n৩. ডেলিভারি ঠিকানা\n\n৪. প্রোডাক্টের নাম ও পরিমাণ`;

    return {
      replyText: orderFormReply,
      interactiveOptions: {
        type: 'order_card',
        orderCardText: 'Tap Order Now, or type your order details here — either works.',
        orderButtonLabel: 'Order Now',
        listButtonLabel: 'পছন্দ করুন',
        listButtonTitle: 'পছন্দ করুন',
        listSectionTitle: 'পছন্দ করুন',
        footerText: `${businessName} AI Assistant`,
        items: catalogItems,
        listItems: catalogItems,
        buttons: [
          {
            id: 'btn_order_now',
            label: 'Order Now',
            payload: 'অর্ডার ফর্ম দিন',
            icon: 'order'
          },
          {
            id: 'btn_see_more',
            label: 'আরও দেখুন',
            payload: 'আরও দেখুন',
            icon: 'back'
          },
          {
            id: 'btn_home',
            label: 'হোম পেজ',
            payload: 'হোম পেজ',
            icon: 'home'
          }
        ]
      }
    };
  }

  // 3. Did the customer click "আরও দেখুন" / "পছন্দ করুন" or ask for the product/price list?
  const isSeeMoreOrCatalogListIntent =
    qLower === 'আরও দেখুন' ||
    qLower === '↩️ আরও দেখুন' ||
    qLower === 'পছন্দ করুন' ||
    qLower === 'সব প্রোডাক্ট' ||
    ((qLower.includes('দাম কত') ||
      qLower.includes('dam koto') ||
      qLower.includes('price') ||
      qLower.includes('কি কি আছে') ||
      qLower.includes('ki ki ache') ||
      qLower.includes('তালিকা') ||
      qLower.includes('list')) &&
      !matchedProduct &&
      !matchedCatalogItem &&
      catalogItems.length > 0);

  if (isSeeMoreOrCatalogListIntent && catalogItems.length > 0) {
    const formattedList = catalogItems
      .map((it, idx) => `${toBengaliNumber(idx + 1)}. ${it.title} — ${it.description}`)
      .join('\n\n');

    const listMessageText = `আমাদের প্রোডাক্ট ও মূল্য তালিকা নিচে দেওয়া হলো:\n\n${formattedList}\n\nনিচের "পছন্দ করুন" বাটনে ক্লিক করে আপনার পছন্দের প্রোডাক্টটি বেছে নিন:`;

    return {
      replyText: listMessageText,
      interactiveOptions: {
        type: 'list',
        listButtonLabel: 'পছন্দ করুন',
        listButtonTitle: 'পছন্দ করুন',
        listSectionTitle: 'পছন্দ করুন',
        footerText: `${businessName} AI Assistant`,
        items: catalogItems,
        listItems: catalogItems,
        buttons: [
          {
            id: 'btn_order_now',
            label: 'Order Now',
            payload: 'অর্ডার করতে চাই',
            icon: 'order'
          },
          {
            id: 'btn_home',
            label: 'হোম পেজ',
            payload: 'হোম পেজ',
            icon: 'home'
          }
        ]
      }
    };
  }

  // 4. Did the customer select/ask about a SPECIFIC product (either from Products & Store or from "পছন্দ করুন" list)?
  if (matchedProduct || matchedCatalogItem) {
    const prodTitle = matchedProduct ? matchedProduct.name : matchedCatalogItem!.title;
    const prodPriceText = matchedProduct
      ? `${matchedProduct.price}৳`
      : matchedCatalogItem!.description || '';

    const isDirectSelectionTap =
      qLower === prodTitle.toLowerCase() || q.length <= prodTitle.length + 6;
    const finalReply = isDirectSelectionTap
      ? matchedProduct
        ? `${matchedProduct.name}-এর দাম ${matchedProduct.price}৳।${
            matchedProduct.description ? `\n${matchedProduct.description}` : ''
          }`
        : `${prodTitle}-এর দাম ${prodPriceText}।`
      : aiReplyText;

    return {
      replyText: finalReply,
      interactiveOptions: {
        type: 'buttons',
        listButtonLabel: 'পছন্দ করুন',
        listButtonTitle: 'পছন্দ করুন',
        listSectionTitle: 'পছন্দ করুন',
        footerText: `${businessName} AI Assistant`,
        items: catalogItems.length > 1 ? catalogItems : undefined,
        listItems: catalogItems.length > 1 ? catalogItems : undefined,
        buttons: [
          {
            id: 'btn_order_item',
            label: 'Order Now',
            payload: `${prodTitle} অর্ডার করতে চাই`,
            icon: 'order'
          },
          {
            id: 'btn_see_more',
            label: 'আরও দেখুন',
            payload: 'আরও দেখুন',
            icon: 'back'
          },
          {
            id: 'btn_home',
            label: 'হোম পেজ',
            payload: 'হোম পেজ',
            icon: 'home'
          }
        ]
      }
    };
  }

  // 5. Default for E-Commerce merchant AI reply: include product list & buttons
  return {
    replyText: aiReplyText,
    interactiveOptions: {
      type: 'list',
      listButtonLabel: 'পছন্দ করুন',
      listButtonTitle: 'পছন্দ করুন',
      listSectionTitle: 'পছন্দ করুন',
      footerText: `${businessName} AI Assistant`,
      items: catalogItems,
      listItems: catalogItems,
      buttons: [
        {
          id: 'btn_order_now',
          label: 'Order Now',
          payload: 'অর্ডার করতে চাই',
          icon: 'order'
        },
        {
          id: 'btn_see_more',
          label: 'আরও দেখুন',
          payload: 'আরও দেখুন',
          icon: 'back'
        },
        {
          id: 'btn_home',
          label: 'হোম পেজ',
          payload: 'হোম পেজ',
          icon: 'home'
        }
      ]
    }
  };
}

// Supported Gemini models in priority order (gemini-3-flash-preview natively supports audio/mp4, audio/aac, audio/ogg, audio/wav)
export const CANDIDATE_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3.8-flash',
  'gemini-2.5-flash',
  'gemini-3.1-flash-lite-preview',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest'
];

// Stage 1: Zero-Bias Audio Transcription (so unclear/noisy voice notes NEVER trigger hallucinated/random business answers!)
async function callGeminiWithAudio(
  audioBase64: string,
  audioMimeType: string,
  _systemPrompt: string,
  _businessName: string,
  _recentHistory: string,
  _catalogContext: string,
  customApiKey?: string
): Promise<{ replyText: string; transcript?: string } | null> {
  const clients = getGeminiClients(customApiKey);

  let normalizedBase64 = audioBase64;
  let normalizedMime = cleanAudioMimeType(audioMimeType);
  let rawBuffer: Buffer = Buffer.from(audioBase64, 'base64');

  // Reject empty or corrupted tiny audio clips (< 350 bytes) immediately
  if (!rawBuffer || rawBuffer.length < 350) {
    return { replyText: UNCLEAR_VOICE_REPLY, transcript: 'অস্পষ্ট ভয়েস মেসেজ' };
  }

  try {
    // Detect actual binary format from magic bytes first
    const detectedMime = detectAudioMimeTypeFromBuffer(rawBuffer, normalizedMime);
    normalizedMime = detectedMime;
    const isWav = rawBuffer.subarray(0, 4).toString('latin1') === 'RIFF';
    if (!isWav) {
      const converted = await convertToWav(rawBuffer, normalizedMime);
      normalizedBase64 = converted.base64;
      normalizedMime = converted.mimeType;
      rawBuffer = converted.buffer;
    } else {
      normalizedMime = 'audio/wav';
    }
  } catch (err: any) {
    console.warn('[AI Service] Audio conversion warning, using detected MIME:', err?.message || err);
  }

  // Also prepare an ADTS AAC fallback if normalizedMime is still audio/mp4
  let adtsBase64: string | null = null;
  if (normalizedMime === 'audio/mp4') {
    const adtsBuf = mp4ToAdtsAac(Buffer.from(audioBase64, 'base64'));
    if (adtsBuf && adtsBuf.length > 16) {
      adtsBase64 = adtsBuf.toString('base64');
    }
  }

  // Pure Zero-Context Transcription Prompt:
  // By NOT including the business knowledge base or product catalog here, the model cannot hallucinate
  // a fake business question when the user sends an unclear, noisy, mumbled, or silent voice note!
  const promptText = `Listen carefully to this audio recording sent by a customer.
Your ONLY task is to transcribe the exact spoken words in Bangla (বাংলা) or English.

CRITICAL ANTI-HALLUCINATION RULES:
1. Do NOT answer any question. Output ONLY the exact transcript of what the person said, or [UNCLEAR].
2. If the audio is silent, very faint, only background noise, wind/static, coughing, breathing, music, mumbled, or if you cannot clearly hear and understand meaningful spoken words with high confidence, you MUST output strictly:
TRANSCRIPT: [UNCLEAR]
3. Never guess, invent, or hallucinate words that are not clearly spoken in the audio.

OUTPUT FORMAT:
TRANSCRIPT: <exact spoken words in Bangla/English, OR [UNCLEAR]>`;

  const parseAudioResponse = (rawText: string): { replyText: string; transcript?: string; isUnclear?: boolean } => {
    const transcriptMatch = rawText.match(/TRANSCRIPT:\s*([\s\S]*?)(?=(REPLY:|$))/i);
    const replyMatch = rawText.match(/REPLY:\s*([\s\S]*)/i);

    let transcript = (transcriptMatch ? transcriptMatch[1] : rawText)
      .replace(/^TRANSCRIPT:\s*/i, '')
      .trim();

    if (isUnclearVoiceText(transcript) || (replyMatch && isUnclearVoiceText(replyMatch[1]))) {
      return {
        replyText: UNCLEAR_VOICE_REPLY,
        transcript: 'অস্পষ্ট ভয়েস মেসেজ',
        isUnclear: true
      };
    }

    // Always return empty replyText so Stage 2 (generateAIReply's Human Conversational Engine)
    // answers the verified transcript using the full Business Knowledge Base + follow-up question!
    return { replyText: '', transcript };
  };

  // 1. Try Groq Whisper or OpenAI Whisper transcription if the merchant provided a gsk_ or sk- key
  const allProfiles = db.getProfiles() || [];
  const adminKey = allProfiles.find((p) => p.role === 'admin' && p.llm_api_key?.trim() && !isDeadSeedKey(p.llm_api_key))?.llm_api_key?.trim() || '';
  const anyKey = allProfiles.find((p) => p.llm_api_key?.trim() && !isDeadSeedKey(p.llm_api_key))?.llm_api_key?.trim() || '';
  const trimmedCustomKey =
    (customApiKey && !isDeadSeedKey(customApiKey) ? customApiKey.trim() : '') ||
    ((db.getSettings() as any)?.default_llm_api_key || '').trim() ||
    adminKey ||
    anyKey ||
    '';

  if (trimmedCustomKey.startsWith('gsk_') || (trimmedCustomKey.startsWith('sk-') && !trimmedCustomKey.startsWith('sk-or-') && !trimmedCustomKey.startsWith('sk-ant-'))) {
    try {
      const isGroq = trimmedCustomKey.startsWith('gsk_');
      const whisperEndpoint = isGroq
        ? 'https://api.groq.com/openai/v1/audio/transcriptions'
        : 'https://api.openai.com/v1/audio/transcriptions';
      const whisperModel = isGroq ? 'whisper-large-v3-turbo' : 'whisper-1';
      const ext = normalizedMime.includes('wav')
        ? 'wav'
        : normalizedMime.includes('ogg')
          ? 'ogg'
          : normalizedMime.includes('mp3')
            ? 'mp3'
            : 'm4a';
      const formData = new FormData();
      const audioBlob = new Blob([new Uint8Array(Buffer.from(audioBase64, 'base64'))], {
        type: normalizedMime === 'audio/aac' ? 'audio/mp4' : normalizedMime
      });
      formData.append('file', audioBlob, `voice.${ext}`);
      formData.append('model', whisperModel);
      const whisperRes = await withTimeout(
        fetch(whisperEndpoint, {
          method: 'POST',
          headers: { Authorization: `Bearer ${trimmedCustomKey}` },
          body: formData
        }),
        12000
      );
      if (whisperRes.ok) {
        const wJson: any = await whisperRes.json();
        const wText = String(wJson?.text || '').trim();
        if (wText && !isUnclearVoiceText(wText)) {
          console.log(`[AI Service] Whisper transcribed voice note: "${wText}"`);
          return { replyText: '', transcript: wText };
        }
      }
    } catch (wErr: any) {
      console.warn('[AI Service] Whisper transcription warning:', wErr?.message || wErr);
    }
  }

  // 2. Try Multimodal Audio Transcription across Gemini candidate models via @google/genai SDK
  for (const ai of clients.slice(0, 3)) {
    for (const modelName of CANDIDATE_MODELS) {
      // gemini-3.8-flash prefers audio/aac over raw audio/mp4 container
      const mimeToSend =
        modelName.includes('3.8') && normalizedMime === 'audio/mp4' && adtsBase64
          ? 'audio/aac'
          : normalizedMime;
      const dataToSend =
        modelName.includes('3.8') && normalizedMime === 'audio/mp4' && adtsBase64
          ? adtsBase64
          : normalizedBase64;

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
                      mimeType: mimeToSend,
                      data: dataToSend
                    }
                  },
                  {
                    text: promptText
                  }
                ]
              }
            ],
            config: {
              temperature: 0.1
            }
          }),
          14000
        );

        const rawText = response.text?.trim();
        if (!rawText) continue;
        const parsed = parseAudioResponse(rawText);
        if (parsed.isUnclear) {
          return { replyText: UNCLEAR_VOICE_REPLY, transcript: 'অস্পষ্ট ভয়েস মেসেজ' };
        }
        if (parsed.replyText || parsed.transcript) {
          return parsed;
        }
      } catch (err: any) {
        console.warn(`[AI Service] Audio model ${modelName} (${mimeToSend}) error:`, err?.message || err);
      }
    }

    // 3. Dedicated Audio Transcription fallback via gemini-3.5-transcribe
    try {
      const transcribeRes = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.5-transcribe',
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
                  text: 'Transcribe the spoken words in this customer voice message accurately. If the audio is silent, background noise only, or unintelligible, output ONLY [UNCLEAR]. Do not guess or invent words.'
                }
              ]
            }
          ]
        }),
        12000
      );

      const parts = (transcribeRes.candidates?.[0]?.content?.parts || []) as any[];
      let transcriptText = '';
      for (const part of parts) {
        if (part?.audioTranscription?.text) {
          transcriptText += part.audioTranscription.text + ' ';
        } else if (part?.text) {
          transcriptText += part.text + ' ';
        }
      }
      transcriptText = (transcriptText || transcribeRes.text || '').trim();
      if (transcriptText) {
        if (isUnclearVoiceText(transcriptText)) {
          return { replyText: UNCLEAR_VOICE_REPLY, transcript: 'অস্পষ্ট ভয়েস মেসেজ' };
        }
        console.log(`[AI Service] gemini-3.5-transcribe succeeded: "${transcriptText}"`);
        return { replyText: '', transcript: transcriptText };
      }
    } catch (transErr: any) {
      console.warn('[AI Service] gemini-3.5-transcribe warning:', transErr?.message || transErr);
    }
  }

  // 4. Direct REST API fallback to generativelanguage.googleapis.com for AIzaSy keys
  const directKeys = getCandidateGeminiKeys(customApiKey).filter((k) => k.startsWith('AIza'));
  for (const key of directKeys.slice(0, 2)) {
    for (const restModel of ['gemini-3-flash-preview', 'gemini-3.5-transcribe', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-latest']) {
      try {
        const isTranscribeModel = restModel === 'gemini-3.5-transcribe';
        const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/${restModel}:generateContent?key=${encodeURIComponent(key)}`;
        const restRes = await withTimeout(
          fetch(restUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
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
                      text: isTranscribeModel
                        ? 'Transcribe the spoken words accurately. If silent, background noise, or unintelligible, output ONLY [UNCLEAR].'
                        : promptText
                    }
                  ]
                }
              ],
              ...(isTranscribeModel ? {} : { generationConfig: { temperature: 0.1 } })
            })
          }),
          14000
        );
        if (restRes.ok) {
          const data: any = await restRes.json();
          const parts = data?.candidates?.[0]?.content?.parts || [];
          const audioTrans = parts
            .map((p: any) => p?.audioTranscription?.text || '')
            .join(' ')
            .trim();
          if (audioTrans) {
            if (isUnclearVoiceText(audioTrans)) {
              return { replyText: UNCLEAR_VOICE_REPLY, transcript: 'অস্পষ্ট ভয়েস মেসেজ' };
            }
            return { replyText: '', transcript: audioTrans };
          }
          const rawText = parts
            .map((p: any) => p?.text || '')
            .join('')
            .trim();
          if (rawText) {
            const parsed = parseAudioResponse(rawText);
            if (parsed.isUnclear) {
              return { replyText: UNCLEAR_VOICE_REPLY, transcript: 'অস্পষ্ট ভয়েস মেসেজ' };
            }
            return parsed;
          }
        }
      } catch (restErr: any) {
        console.warn(`[AI Service] Direct Audio REST ${restModel} warning:`, restErr?.message || restErr);
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
  const cleanMime = (imageMimeType || 'image/jpeg').split(';')[0].trim().toLowerCase();

  const promptText = `System Instructions & Business Knowledge Base:
${systemPrompt}

You are a warm, smart, human-like Customer Service & Sales Executive for ${businessName}.
The customer sent an image/photo along with the text: "${customerText || 'এই প্রোডাক্টটির দাম কত এবং বিস্তারিত জানাবেন?'}"

Merchant Product Catalog & Price List:
${catalogContext}

TASK:
1. Examine the image sent by the customer carefully.
2. Identify what is shown in the image (product from catalog, bKash/Nagad payment screenshot/slip, or general inquiry) and match it with the Business Knowledge Base and Merchant Product Catalog.
3. If the image is a bKash, Nagad, or Bank payment screenshot, clearly mention the Transaction ID (TrxID) and Paid Amount (৳) visible in the image and confirm that their payment has been received and verified!
4. Reply naturally like a real human in concise Bangla (বাংলা ভাষায় — ২ থেকে ৩ বাক্যে).
5. Put an empty line (\\n\\n) between your main answer and your closing follow-up question!
6. End with 1 smart, relevant follow-up question in a new paragraph (যেমন: কাস্টমার কি এটি অর্ডার করতে চান নাকি অন্য কোনো সাইজ/কালার খুঁজছেন?). Do not use ** markdown asterisks.

Recent Conversation History:
${recentHistory || '(No previous messages)'}

Customer Question: "${customerText || 'এটার দাম কত এবং বিস্তারিত জানাবেন?'}"
Assistant Reply (in concise Bangla with paragraph spacing and a follow-up question):`;

  for (const ai of clients.slice(0, 3)) {
    for (const modelName of CANDIDATE_MODELS) {
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
                      mimeType: cleanMime,
                      data: imageBase64
                    }
                  },
                  {
                    text: promptText
                  }
                ]
              }
            ]
          }),
          14000
        );

        const reply = response.text?.trim();
        if (reply) return formatCleanChatMessage(reply);
      } catch (err: any) {
        console.warn(`[AI Service] Multimodal Image model ${modelName} error:`, err?.message || err);
      }
    }
  }

  // Direct REST API fallback for Image
  const directKeys = getCandidateGeminiKeys(customApiKey).filter((k) => k.startsWith('AIza'));
  for (const key of directKeys.slice(0, 2)) {
    for (const restModel of ['gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-latest']) {
      try {
        const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/${restModel}:generateContent?key=${encodeURIComponent(key)}`;
        const restRes = await withTimeout(
          fetch(restUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      inlineData: {
                        mimeType: cleanMime,
                        data: imageBase64
                      }
                    },
                    { text: promptText }
                  ]
                }
              ],
              generationConfig: { temperature: 0.35 }
            })
          }),
          14000
        );
        if (restRes.ok) {
          const data: any = await restRes.json();
          const reply = data?.candidates?.[0]?.content?.parts
            ?.map((p: any) => p?.text || '')
            .join('')
            .trim();
          if (reply) return formatCleanChatMessage(reply);
        }
      } catch (restErr: any) {
        console.warn(`[AI Service] Direct Image REST ${restModel} warning:`, restErr?.message || restErr);
      }
    }
  }

  return null;
}

// Call Google Gemini, OpenAI, or Groq API for Text with Reliable Multi-Model Fallback
async function callGemini(fullPrompt: string, customApiKey?: string, systemInstruction?: string): Promise<string | null> {
  const allProfiles = db.getProfiles() || [];
  const adminKey = allProfiles.find((p) => p.role === 'admin' && p.llm_api_key?.trim() && !isDeadSeedKey(p.llm_api_key))?.llm_api_key?.trim() || '';
  const anyKey = allProfiles.find((p) => p.llm_api_key?.trim() && !isDeadSeedKey(p.llm_api_key))?.llm_api_key?.trim() || '';

  const trimmedKey =
    (customApiKey && !isDeadSeedKey(customApiKey) ? customApiKey.trim() : '') ||
    ((db.getSettings() as any)?.default_llm_api_key || '').trim() ||
    adminKey ||
    anyKey ||
    '';

  // 1. If the merchant provided a Groq API key (starts with gsk_)
  if (trimmedKey.startsWith('gsk_')) {
    try {
      const groqRes = await withTimeout(
        fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${trimmedKey}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
              { role: 'user', content: fullPrompt }
            ],
            temperature: 0.4
          })
        }),
        12000
      );
      if (groqRes.ok) {
        const json: any = await groqRes.json();
        const text = json?.choices?.[0]?.message?.content?.trim();
        if (text) return formatCleanChatMessage(text);
      }
    } catch (err: any) {
      console.warn('[AI Service] Groq call warning:', err?.message || err);
    }
  }

  // 2. If the merchant provided an OpenAI API key (starts with sk- and not sk-ant-)
  if (trimmedKey.startsWith('sk-') && !trimmedKey.startsWith('sk-ant-') && !isDeadSeedKey(trimmedKey)) {
    try {
      const isOpenRouter = trimmedKey.startsWith('sk-or-');
      const endpoint = isOpenRouter
        ? 'https://openrouter.ai/api/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';
      const openAiRes = await withTimeout(
        fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${trimmedKey}`
          },
          body: JSON.stringify({
            model: isOpenRouter ? 'google/gemini-2.5-flash' : 'gpt-4o-mini',
            messages: [
              ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
              { role: 'user', content: fullPrompt }
            ],
            temperature: 0.4
          })
        }),
        12000
      );
      if (openAiRes.ok) {
        const json: any = await openAiRes.json();
        const text = json?.choices?.[0]?.message?.content?.trim();
        if (text) return formatCleanChatMessage(text);
      }
    } catch (err: any) {
      console.warn('[AI Service] OpenAI/OpenRouter call warning:', err?.message || err);
    }
  }

  // 3. Call Google Gemini via @google/genai SDK across candidate keys and models
  const clients = getGeminiClients(trimmedKey);

  for (const ai of clients.slice(0, 3)) {
    for (const modelName of CANDIDATE_MODELS) {
      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model: modelName,
            contents: fullPrompt,
            config: {
              ...(systemInstruction ? { systemInstruction } : {}),
              temperature: 0.4
            }
          }),
          14000
        );

        const reply = response.text?.trim();
        if (reply) return formatCleanChatMessage(reply);
      } catch (err: any) {
        const msg = String(err?.message || err || '');
        console.warn(`[AI Service] Model ${modelName} failed for text:`, msg.slice(0, 160));
      }
    }
  }

  // 4. Direct REST API fallback to generativelanguage.googleapis.com for AIzaSy keys
  const directKeys = getCandidateGeminiKeys(trimmedKey).filter((k) => k.startsWith('AIza'));
  for (const key of directKeys.slice(0, 2)) {
    for (const restModel of ['gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-latest']) {
      try {
        const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/${restModel}:generateContent?key=${encodeURIComponent(key)}`;
        const restRes = await withTimeout(
          fetch(restUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...(systemInstruction
                ? { systemInstruction: { parts: [{ text: systemInstruction }] } }
                : {}),
              contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
              generationConfig: { temperature: 0.4 }
            })
          }),
          12000
        );
        if (restRes.ok) {
          const data: any = await restRes.json();
          const text = data?.candidates?.[0]?.content?.parts
            ?.map((p: any) => p?.text || '')
            .join('')
            .trim();
          if (text) return formatCleanChatMessage(text);
        }
      } catch (restErr: any) {
        console.warn(`[AI Service] Direct REST ${restModel} warning:`, restErr?.message || restErr);
      }
    }
  }

  // 5. Built-in Zero-Key Cloud LLM Engine (ensures real AI reasoning on Vercel even if no API key is set or Gemini quota is exceeded)
  try {
    const cloudRes = await withTimeout(
      fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openai',
          messages: [
            ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
            { role: 'user', content: fullPrompt }
          ],
          temperature: 0.35
        })
      }),
      12000
    );
    if (cloudRes.ok) {
      const cloudJson: any = await cloudRes.json();
      const cloudText = cloudJson?.choices?.[0]?.message?.content?.trim();
      if (cloudText && cloudText.length > 5) {
        return formatCleanChatMessage(cloudText);
      }
    }
  } catch (cloudErr: any) {
    console.warn('[AI Service] Built-in Cloud LLM warning:', cloudErr?.message || cloudErr);
  }

  return null;
}

// Universal Bilingual (English + Banglish + বাংলা) Knowledge-Base Engine for One Agent BD & Any Subscribed Merchant
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
    return `আসসালামু আলাইকুম! আমাদের "${matchedProduct.name}" এখন স্টকে আছে।\n\n💰 মূল্য: ৳${matchedProduct.price} ${matchedProduct.currency}\n📋 বিবরণ: ${matchedProduct.description}\n\nআপনি কি এটি অর্ডার করতে চান? অর্ডার কনফার্ম করতে আপনার নাম, সম্পূর্ণ ঠিকানা এবং মোবাইল নাম্বারটি লিখে পাঠান।`;
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
      q.includes('one year') ||
      q.includes('per year') ||
      q.includes('every year') ||
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
      q.includes('6 mas') || q.includes('6 month') || q.includes('six month') || q.includes('৬ মাস') || q.includes('ছয় মাস');

    const isThreeMonths =
      q.includes('3 mas') || q.includes('3 month') || q.includes('three month') || q.includes('৩ মাস') || q.includes('তিন মাস');

    const isTwoMonths =
      q.includes('2 mas') || q.includes('2 month') || q.includes('two month') || q.includes('২ মাস') || q.includes('দুই মাস');

    if (isYearly) {
      return `জ্বী ভাইয়া, আমাদের ১ বছরের (১২ মাসের) সাবস্ক্রিপশনে সরাসরি ১৫% ডিসকাউন্ট দেওয়া হচ্ছে:\n\n১. Starter AI Plan — ৳১২,৭৫০ টাকা/বছর (মূল দাম ৳১৫,০০০)\n\n২. Pro Business Plan — ৳১৯,৮৯০ টাকা/বছর (মূল দাম ৳২৩,৪০০)\n\n৩. ২ বছরের প্ল্যান — সরাসরি ২০% ডিসকাউন্ট (Starter ৳২৪,০০০ এবং Pro ৳৩৭,৪৪০)\n\nআপনি কি প্রথমে ২ দিনের ফ্রি ট্রায়াল নিয়ে টেস্ট করে দেখতে চান, নাকি সরাসরি কোনো প্ল্যান অ্যাক্টিভ করতে চাচ্ছেন?`;
    }

    if (isSixMonths) {
      return `আমাদের ৬ মাসের সাবস্ক্রিপশনে সরাসরি ১০% ডিসকাউন্ট রয়েছে:\n\n১. Starter AI Plan — ৳৬,৭৫০ টাকা (মূল দাম ৳৭,৫০০)\n\n২. Pro Business Plan — ৳১০,৫৩০ টাকা (মূল দাম ৳১১,৭০০)\n\nআপনি কোন প্ল্যানটি নেওয়ার কথা ভাবছেন?`;
    }

    if (isThreeMonths) {
      return `আমাদের ৩ মাসের সাবস্ক্রিপশন প্ল্যান দুটি নিচে দেওয়া হলো:\n\n১. Starter AI Plan — ৳৩,৭৫০ টাকা (৩ মাস)\n\n২. Pro Business Plan — ৳৫,৮৫০ টাকা (৩ মাস)\n\nআপনি কি প্রথমে আমাদের ২ দিনের ফ্রি ট্রায়াল দিয়ে সব ফিচার যাচাই করে দেখতে চান?`;
    }

    if (isTwoMonths) {
      return `আমাদের ২ মাসের সাবস্ক্রিপশন প্ল্যান দুটি নিচে দেওয়া হলো:\n\n১. Starter AI Plan — ৳২,৫০০ টাকা (২ মাস)\n\n২. Pro Business Plan — ৳৩,৯০০ টাকা (২ মাস)\n\nআপনার বিজনেস বা পেজের জন্য কোন প্ল্যানটি অ্যাক্টিভ করতে চাচ্ছেন?`;
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
      return `জ্বী, অবশ্যই! আমাদের AI কাস্টমারের পাঠানো বাংলা, বাংলিশ বা ইংরেজি ভয়েস মেসেজ শুনে এবং প্রোডাক্টের ছবি দেখে সাথে সাথে সঠিক দাম ও উত্তর দিতে পারে।\n\nআপনি কি আপনার ফেসবুক পেজে এটি ২ দিনের ফ্রি ট্রায়াল দিয়ে টেস্ট করে দেখতে চান?`;
    }

    // 2C. Comment reply inquiry
    if (q.includes('comment') || q.includes('কমেন্ট') || q.includes('পোস্ট')) {
      return `জ্বী! আপনার পেজের পোস্টে কেউ কমেন্ট করলে AI সাথে সাথে কমেন্টের রিপ্লাই দেয় এবং কাস্টমারের ইনবক্সে (DM-এ) প্রোডাক্টের দাম ও বিস্তারিত পাঠিয়ে দেয়।\n\nআপনার ফেসবুক পেজটি কি মূলত ই-কমার্স বা প্রোডাক্ট সেলিং পেজ?`;
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
      return `চ্যাটের ভেতরেই কাস্টমারের নাম, ঠিকানা ও মোবাইল নাম্বার নিয়ে AI অটোমেটিক অর্ডার বুক করে নেয়।\n\nএরপর ড্যাশবোর্ড থেকে মাত্র ১ ক্লিকে Steadfast, Pathao বা RedX কুরিয়ারে পার্সেল এন্ট্রি করতে পারবেন!\n\nআপনি বর্তমানে কোন কুরিয়ার সার্ভিসটি বেশি ব্যবহার করেন?`;
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
      return `জ্বী! আমাদের উভয় প্ল্যানেই আপনার WordPress/WooCommerce, Shopify বা কাস্টম ওয়েবসাইটের প্রোডাক্ট সিঙ্ক এবং ১ ক্লিকে লাইভ ওয়েবসাইট চ্যাটবট যুক্ত করতে পারবেন।\n\nআপনার ওয়েবসাইটটি কি WordPress নাকি কাস্টম কোডে তৈরি?`;
    }

    // 2F. Ban risk / Meta official API / Message limit
    if (
      q.includes('ban') ||
      q.includes('risk') ||
      q.includes('limit') ||
      q.includes('official') ||
      q.includes('safe') ||
      q.includes('ব্যান') ||
      q.includes('ঝুঁকি') ||
      q.includes('সমস্যা হবে') ||
      q.includes('লিমিট')
    ) {
      return `আপনার পেজ ১০০% নিরাপদ থাকবে! আমরা মেটার অফিশিয়াল API ব্যবহার করি তাই ব্যান হওয়ার কোনো ঝুঁকি নেই এবং উভয় প্ল্যানেই আনলিমিটেড মেসেজ রিপ্লাই পাবেন।\n\nআপনি কি আপনার ফেসবুক পেজ নাকি হোয়াটসঅ্যাপ কানেক্ট করতে চাচ্ছেন?`;
    }

    // 2G-1. Dedicated Coupon / Promo Code / Discount / Offer inquiry
    if (
      q.includes('coupon') ||
      q.includes('cupon') ||
      q.includes('copon') ||
      q.includes('promo') ||
      q.includes('discount') ||
      q.includes('offer') ||
      q.includes('kom') ||
      q.includes('কুপন') ||
      q.includes('ডিসকাউন্ট') ||
      q.includes('প্রোমো') ||
      q.includes('ছাড়') ||
      q.includes('ছাড়') ||
      q.includes('অফার') ||
      q.includes('কমানো')
    ) {
      return `জ্বী ভাইয়া, অবশ্যই আছে! আমাদের ওয়েবসাইটে চেকআউটের সময় কুপন কোড WELCOME10 দিলে ১০% ছাড় এবং SAVE250 দিলে ৳২৫০ ডিসকাউন্ট পাবেন।\n\nআপনি কোন প্ল্যানটি (Starter নাকি Pro) নেওয়ার কথা ভাবছেন? জানালে আমি ডিসকাউন্টসহ হিসাবটি বলে দিচ্ছি!`;
    }

    // 2G-2. Payment / bKash / Nagad inquiry
    if (
      q.includes('bkash') ||
      q.includes('nagad') ||
      q.includes('rocket') ||
      q.includes('upay') ||
      q.includes('payment') ||
      (q.includes('pay') && !q.includes('how much')) ||
      q.includes('বিকাশ') ||
      q.includes('নগদ') ||
      q.includes('রকেট') ||
      q.includes('পেমেন্ট')
    ) {
      return `আমাদের ওয়েবসাইট (https://www.oneagentbd.online)-এর Billing মেনু থেকে বিকাশ, নগদ, রকেট বা উপায়-এ পেমেন্ট করে TrxID দিলেই প্ল্যান সাথে সাথে অটো অ্যাক্টিভ হয়ে যাবে।\n\nআপনি কোন প্ল্যানটি অ্যাক্টিভ করতে চাচ্ছেন?`;
    }

    // 2H. Free trial inquiry
    if (q.includes('trial') || q.includes('trail') || q.includes('free') || q.includes('demo') || q.includes('ট্রায়াল') || q.includes('ফ্রি')) {
      return `জ্বী! আমাদের ওয়েবসাইটে (https://www.oneagentbd.online) নতুন অ্যাকাউন্ট খুললেই কোনো অগ্রিম পেমেন্ট ছাড়া ২ দিনের সম্পূর্ণ ফ্রি ট্রায়াল পাবেন।\n\nআপনি কি আজই ট্রায়ালটি চালু করে আপনার পেজে টেস্ট করে দেখতে চান?`;
    }

    // 2I. Setup / Connect / How it works inquiry
    if (
      q.includes('connect') ||
      q.includes('setup') ||
      q.includes('how it works') ||
      q.includes('how does it work') ||
      q.includes('kivabe') ||
      q.includes('কিভাবে') ||
      q.includes('কানেক্ট') ||
      q.includes('সেটআপ') ||
      q.includes('কাজ করে')
    ) {
      return `মাত্র ২ মিনিটেই সেটআপ করা যায়! https://www.oneagentbd.online ওয়েবসাইটে লগইন করে "Connect with Facebook"-এ ১ ক্লিক করে পেজ কানেক্ট ও বিজনেস ডিটেইলস সেভ করলেই অটো রিপ্লাই শুরু হবে।\n\nসেটআপ করতে আপনার কি কোনো সাহায্য প্রয়োজন?`;
    }

    // 2J. General pricing / monthly subscription fee / plan inquiry (English + Banglish + বাংলা)
    if (
      q.includes('price') ||
      q.includes('pricing') ||
      q.includes('cost') ||
      q.includes('fee') ||
      q.includes('fees') ||
      q.includes('subscription') ||
      q.includes('subscriptions') ||
      q.includes('how much') ||
      q.includes('every month') ||
      q.includes('per month') ||
      q.includes('monthly') ||
      q.includes('month') ||
      q.includes('charge') ||
      q.includes('charges') ||
      q.includes('rate') ||
      q.includes('dam') ||
      q.includes('daam') ||
      q.includes('koto') ||
      q.includes('plan') ||
      q.includes('package') ||
      q.includes('taka') ||
      q.includes('tk') ||
      q.includes('bdt') ||
      q.includes('mashe') ||
      q.includes('mash') ||
      q.includes('starter') ||
      q.includes('pro') ||
      q.includes('দাম') ||
      q.includes('মূল্য') ||
      q.includes('কত') ||
      q.includes('প্ল্যান') ||
      q.includes('প্যাকেজ') ||
      q.includes('খরচ') ||
      q.includes('চার্জ') ||
      q.includes('ফি') ||
      q.includes('সাবস্ক্রিপশন') ||
      q.includes('মাসিক') ||
      q.includes('মাসে')
    ) {
      return `আমাদের ২টি সাবস্ক্রিপশন প্ল্যান রয়েছে:\n\n১. Starter AI Plan — ১,২৫০ টাকা/মাস (১টি AI এজেন্ট, WhatsApp, Messenger, Instagram ও Website অটো-রিপ্লাই, ভয়েস ও ছবির AI এবং কুরিয়ার বুকিং)\n\n২. Pro Business Plan — ১,৯৫০ টাকা/মাস (৩টি AI এজেন্ট, ১০টি পর্যন্ত চ্যানেল, আনলিমিটেড ওয়েবসাইট স্টোর ও VIP ব্রডকাস্ট)\n\n৩. ফ্রি ট্রায়াল — ওয়েবসাইটে অ্যাকাউন্ট খুলেই ২ দিনের সম্পূর্ণ ফ্রি ট্রায়াল\n\nআপনি কি ১ নম্বর (Starter) নাকি ২ নম্বর (Pro) প্ল্যানটি নিতে চাচ্ছেন?`;
    }

    // 2K. Features / Services / "ki ki ase" / details inquiry
    if (
      q.includes('service') ||
      q.includes('feature') ||
      q.includes('what do you do') ||
      q.includes('ki ki') ||
      q.includes('ki ase') ||
      q.includes('ki ache') ||
      q.includes('সার্ভিস') ||
      q.includes('ফিচার') ||
      q.includes('কি কি') ||
      q.includes('কী কী') ||
      q.includes('বিস্তারিত') ||
      q.includes('details')
    ) {
      return `আমাদের প্ল্যাটফর্মের প্রধান সার্ভিস ও সুবিধাসমূহ নিচে দেওয়া হলো:\n\n১. ২৪/৭ অটো মেসেজ ও কমেন্ট রিপ্লাই (Facebook, Instagram, WhatsApp ও Website)\n\n২. ভয়েস মেসেজ শুনে ও প্রোডাক্টের ছবি দেখে সাথে সাথে সঠিক উত্তর প্রদান\n\n৩. চ্যাটের ভেতরেই অটো অর্ডার গ্রহণ এবং ১-ক্লিকে Steadfast, Pathao ও RedX কুরিয়ার বুকিং\n\n৪. প্ল্যান মূল্য: Starter Plan ১,২৫০ টাকা/মাস এবং Pro Plan ১,৯৫০ টাকা/মাস (সাথে ২ দিনের ফ্রি ট্রায়াল)\n\nআপনার বিজনেস বা পেজটি মূলত কোন ধরনের প্রোডাক্ট বা সার্ভিস নিয়ে কাজ করে?`;
    }

    // 2L. Contact / Support inquiry
    if (
      q.includes('number') ||
      q.includes('phone') ||
      q.includes('call') ||
      q.includes('contact') ||
      q.includes('support') ||
      q.includes('helpline') ||
      q.includes('নাম্বার') ||
      q.includes('ফোন') ||
      q.includes('কল') ||
      q.includes('যোগাযোগ') ||
      q.includes('কথা বলতে')
    ) {
      return `আমাদের হেল্পলাইন ও হোয়াটসঅ্যাপ নাম্বার: +8801601705804 (সকাল ৯টা – রাত ১১টা) এবং ওয়েবসাইট: https://www.oneagentbd.online।\n\nআপনি চাইলে আপনার মোবাইল নাম্বারটি এখানে দিতে পারেন, আমাদের প্রতিনিধি সরাসরি কল করে সাহায্য করবে!`;
    }
  }

  // 3. Universal Dynamic Merchant Knowledge-Base Parser & Bilingual Semantic Matcher
  // Works for ANY subscribed merchant who trains the AI with their own business details (in Bangla, Banglish, or English)
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
            !l.startsWith('[ONE AGENT BD COMPLETE') &&
            !l.toLowerCase().startsWith('you are') &&
            !l.startsWith('আপনি "') &&
            !l.toLowerCase().includes('mandatory') &&
            !l.includes('আবশ্যিক নিয়মাবলী') &&
            !l.includes('সর্বদা সুন্দর')
        )
    )
  );

  const findMerchantLines = (keywords: string[], maxLines = 4): string | null => {
    const matched: string[] = [];
    for (const line of cleanLines) {
      const lower = line.toLowerCase();
      if (keywords.some((kw) => lower.includes(kw))) {
        matched.push(line);
      }
      if (matched.length >= maxLines) break;
    }
    return matched.length > 0 ? matched.join('\n') : null;
  };

  // 3A. Dynamic token & bilingual synonym scoring against the merchant's custom systemPrompt
  const BILINGUAL_CONCEPT_GROUPS: string[][] = [
    ['price', 'pricing', 'cost', 'fee', 'fees', 'subscription', 'subscriptions', 'how much', 'monthly', 'every month', 'per month', 'rate', 'charge', 'plan', 'package', 'dam', 'daam', 'koto', 'taka', 'tk', 'bdt', 'দাম', 'মূল্য', 'কত', 'টাকা', 'ফি', 'চার্জ', 'প্ল্যান', 'প্যাকেজ', 'মাসিক', 'মাসে', 'খরচ', '৳'],
    ['delivery', 'shipping', 'courier', 'cod', 'cash on delivery', 'dhaka', 'outside dhaka', 'inside dhaka', 'home delivery', 'parcel', 'delivari', 'ডেলিভারি', 'কুরিয়ার', 'পাঠানো', 'ঢাকা', 'ঢাকার ভেতরে', 'ঢাকার বাইরে', 'ক্যাশ অন', 'হোম ডেলিভারি'],
    ['bkash', 'nagad', 'rocket', 'upay', 'payment', 'pay', 'bank', 'card', 'advance', 'বিকাশ', 'নগদ', 'রকেট', 'উপায়', 'পেমেন্ট', 'অ্যাডভান্স', 'ব্যাংক'],
    ['return', 'refund', 'exchange', 'replace', 'warranty', 'guarantee', 'policy', 'রিটার্ন', 'রিফান্ড', 'চেঞ্জ', 'পরিবর্তন', 'ওয়ারেন্টি', 'গ্যারান্টি', 'ফেরত'],
    ['size', 'color', 'colour', 'fabric', 'material', 'quality', 'stock', 'available', 'original', 'authentic', 'সাইজ', 'কালার', 'রঙ', 'কাপড়', 'কোয়ালিটি', 'স্টক', 'অরিজিনাল'],
    ['address', 'location', 'where', 'shop', 'store', 'showroom', 'office', 'branch', 'kothay', 'thikana', 'ঠিকানা', 'লোকেশন', 'কোথায়', 'শোরুম', 'অফিস', 'দোকান'],
    ['phone', 'number', 'call', 'contact', 'whatsapp', 'helpline', 'support', 'নাম্বার', 'ফোন', 'কল', 'যোগাযোগ', 'হেল্পলাইন', 'সাপোর্ট'],
    ['discount', 'offer', 'coupon', 'promo', 'less', 'kom', 'কুপন', 'ডিসকাউন্ট', 'অফার', 'ছাড়', 'ছাড়']
  ];

  // Expand query tokens with matching bilingual concepts
  const expandedSearchTerms = new Set<string>();
  const queryWords = q
    .split(/[^a-z0-9\u0980-\u09FF]+/i)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2 && !['how', 'what', 'the', 'for', 'and', 'are', 'you', 'can', 'please', 'tell', 'about'].includes(w));

  for (const w of queryWords) {
    expandedSearchTerms.add(w);
  }
  for (const group of BILINGUAL_CONCEPT_GROUPS) {
    if (group.some((term) => q.includes(term))) {
      for (const syn of group) {
        expandedSearchTerms.add(syn);
      }
    }
  }

  if (expandedSearchTerms.size > 0 && cleanLines.length > 0) {
    const scoredLines = cleanLines
      .map((line) => {
        const lower = line.toLowerCase();
        let score = 0;
        for (const w of queryWords) {
          if (lower.includes(w)) score += 3;
        }
        for (const syn of expandedSearchTerms) {
          if (lower.includes(syn)) score += 1;
        }
        return { line, score };
      })
      .filter((item) => item.score >= 2)
      .sort((a, b) => b.score - a.score);

    if (scoredLines.length > 0) {
      const topFacts = scoredLines
        .slice(0, 4)
        .map((item, idx) => {
          const clean = item.line.replace(/^[•\-–—*০-৯0-9]+[.)]?\s*/, '').trim();
          return `${toBengaliNumber(idx + 1)}. ${clean}`;
        })
        .join('\n');
      return `আপনার প্রশ্নের বিস্তারিত তথ্য নিচে দেওয়া হলো:\n\n${topFacts}\n\nআপনি কি এই বিষয়ে আরও কিছু জানতে চান, নাকি অর্ডার কনফার্ম করতে চাচ্ছেন?`;
    }
  }

  if (
    q.includes('delivery') ||
    q.includes('shipping') ||
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
      const serializedDelivery = kbDelivery
        .split('\n')
        .map((l, idx) => `${toBengaliNumber(idx + 1)}. ${l.replace(/^[•\-–—*০-৯0-9]+[.)]?\s*/, '').trim()}`)
        .join('\n');
      return `আমাদের ডেলিভারি সংক্রান্ত তথ্য নিচে দেওয়া হলো:\n\n${serializedDelivery}\n\nআপনি কি আজই অর্ডারটি কনফার্ম করতে চান?`;
    }
    return `আমাদের ডেলিভারি চার্জ ও নিয়ম নিচে দেওয়া হলো:\n\n১. ঢাকার ভেতরে: ৳৬০ টাকা (২৪–৪৮ ঘণ্টা)\n২. ঢাকার বাইরে সারাদেশে: ৳১২০ টাকা (২–৩ দিন)\n৩. পেমেন্ট সুবিধা: সারাদেশে ক্যাশ অন ডেলিভারি (COD) রয়েছে\n\nঅর্ডার করতে আপনার নাম, ঠিকানা ও ফোন নাম্বার দিন।`;
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
      const serializedPay = kbPay
        .split('\n')
        .map((l, idx) => `${toBengaliNumber(idx + 1)}. ${l.replace(/^[•\-–—*০-৯0-9]+[.)]?\s*/, '').trim()}`)
        .join('\n');
      return `আমাদের পেমেন্ট পদ্ধতি নিচে দেওয়া হলো:\n\n${serializedPay}\n\nআপনি কোন পদ্ধতিতে পেমেন্ট করতে চাচ্ছেন?`;
    }
    return `আমাদের পেমেন্ট পদ্ধতি নিচে দেওয়া হলো:\n\n১. ক্যাশ অন ডেলিভারি (প্রোডাক্ট হাতে পেয়ে পেমেন্ট)\n২. বিকাশ (bKash) পেমেন্ট\n৩. নগদ (Nagad) পেমেন্ট\n\nঅর্ডার কনফার্ম করতে আপনার নাম, ঠিকানা ও মোবাইল নাম্বার দিন।`;
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
    return `অর্ডার কনফার্ম করতে অনুগ্রহ করে নিচের তথ্যগুলো লিখে পাঠান:\n\n১. আপনার নাম\n২. সম্পূর্ণ ডেলিভারি ঠিকানা\n৩. সচল মোবাইল নাম্বার (১১ ডিজিট)\n৪. প্রোডাক্টের নাম ও পরিমাণ`;
  }

  if (products.length > 0) {
    const topList = products
      .slice(0, 5)
      .map((p, idx) => `${toBengaliNumber(idx + 1)}. ${p.name} — ৳${p.price} (${p.description.slice(0, 60)})`)
      .join('\n');
    return `আসসালামু আলাইকুম! ${businessName}-এ আপনাকে স্বাগতম।\n\nআমাদের প্রোডাক্ট ও মূল্য তালিকা:\n\n${topList}\n\nআপনি কোন প্রোডাক্টটি নিতে চান বা বিস্তারিত জানতে চান?`;
  }

  const kbOverview = findMerchantLines(['৳', 'টাকা', 'price', 'দাম', 'সার্ভিস', 'প্যাকেজ']);
  if (kbOverview) {
    return `আসসালামু আলাইকুম! ${businessName}-এ আপনাকে স্বাগতম।\n\n${kbOverview}\n\nআপনি কোনটি নিতে চাচ্ছেন বা বিস্তারিত জানতে চান?`;
  }

  if (isOneAgentSaaS) {
    return `আসসালামু আলাইকুম! ${businessName}-এ স্বাগতম। আমরা Facebook, Instagram, WhatsApp ও Website-এ ২৪/৭ স্মার্ট AI অটো-রিপ্লাই ও অর্ডার অটোমেশন সার্ভিস দিয়ে থাকি।\n\nআমাদের প্ল্যান শুরু ৳১,২৫০/মাস থেকে এবং সাথে ২ দিনের ফ্রি ট্রায়াল সুবিধা রয়েছে।\n\nআপনি কি আপনার ফেসবুক পেজ বা ওয়েবসাইটের জন্য অটোমেশন সম্পর্কে জানতে চাচ্ছেন?`;
  }

  return `আসসালামু আলাইকুম! ${businessName}-এ আপনাকে স্বাগতম।\n\nআমাদের সার্ভিস, প্রোডাক্টের দাম বা অর্ডার করার নিয়ম সম্পর্কে যেকোনো প্রশ্ন করুন, আমি সাথে সাথে উত্তর দিচ্ছি!`;
}

export async function generateAIReply(params: GenerateReplyParams): Promise<GenerateReplyResult> {
  const profile = (params as any).profile || db.getProfileById(params.userId);
  const businessName = params.channelName || profile?.full_name || 'One Agent BD';

  const isAdminOrOfficialSaaS =
    profile?.role === 'admin' ||
    params.userId === 'usr_admin_1' ||
    params.userId === 'usr_admin_001' ||
    params.userId === 'saas_official' ||
    businessName.toLowerCase().includes('one agent');

  // Resolve the best custom system_prompt (ONLY use global SaaS default_system_prompt for Admin / Official One Agent BD channels!)
  const defaultSavedPrompt = isAdminOrOfficialSaaS
    ? ((db.getSettings() as any)?.default_system_prompt || '').trim()
    : '';
  const adminCustomPrompt = isAdminOrOfficialSaaS
    ? db
        .getProfiles()
        .find(
          (p) =>
            p.role === 'admin' &&
            p.system_prompt &&
            !p.system_prompt.includes('You are an executive AI assistant for One Agent BD') &&
            !p.system_prompt.includes('Subscription Plan: All-in-One Plan 1,450 BDT/month')
        )?.system_prompt || ''
    : '';

  const rawSystemPrompt =
    (params.overrideSystemPrompt && params.overrideSystemPrompt.trim()) ||
    (profile?.system_prompt &&
      !profile.system_prompt.includes('You are an executive AI assistant for One Agent BD') &&
      !profile.system_prompt.includes('Subscription Plan: All-in-One Plan 1,450 BDT/month')
      ? profile.system_prompt.trim()
      : '') ||
    defaultSavedPrompt ||
    adminCustomPrompt ||
    (profile?.system_prompt && profile.system_prompt.trim()) ||
    `আপনি "${businessName}"-এর অফিসিয়াল কাস্টমার সার্ভিস ও সেলস AI অ্যাসিস্ট্যান্ট। কাস্টমারের প্রশ্নের অর্থ বুঝে আন্তরিক ও স্বাভাবিক বাংলায় উত্তর দিন।`;

  // Sanitize any legacy "English only" or "no lists / 1-3 sentences" instructions inside saved prompts so Bangla serial lists always work
  let systemPrompt = rawSystemPrompt
    .replace(/in 1-2 clear English sentences/gi, 'in clear, natural Bangla (বাংলা)')
    .replace(/in 1-2 clear, courteous English sentences/gi, 'in clear, courteous Bangla (বাংলা)')
    .replace(/in 1-2 polite, clear English sentences/gi, 'in polite, clear Bangla (বাংলা)')
    .replace(/in 1-2 informative, concise English sentences/gi, 'in informative, natural Bangla (বাংলা)')
    .replace(/in clear, friendly English/gi, 'in clear, friendly Bangla (বাংলা)')
    .replace(/in 1-2 concise English sentences/gi, 'in natural Bangla (বাংলা)')
    .replace(/Respond politely and directly in 1-2 concise English sentences\./gi, 'কাস্টমারের প্রশ্নের অর্থ বুঝে সর্বদা সুন্দর ও স্বাভাবিক বাংলায় উত্তর দিন।')
    .replace(/Never send long paragraphs or unnecessary lists\./gi, 'কাস্টমার যখন প্ল্যান, দাম, কী কী আছে বা বিস্তারিত জানতে চাইবে, তখন অবশ্যই ১., ২., ৩. সিরিয়াল নাম্বার দিয়ে পরিষ্কার লিস্ট আকারে উত্তর দিন।')
    .replace(/Always keep replies concise and to the point \(maximum 2 to 3 sentences\)\./gi, 'কাস্টমার প্ল্যান, দাম, প্রোডাক্ট বা বিস্তারিত জানতে চাইলে কখনোই এক প্যারাগ্রাফে হিজিবিজি করে লিখবেন না; নিচে নিচে সিরিয়াল নাম্বার (১., ২., ৩.) দিয়ে সাজিয়ে লিখবেন।')
    .replace(/Keep replies concise, clear, and within 1-3 sentences\./gi, 'কাস্টমার প্ল্যান, দাম, প্রোডাক্ট বা বিস্তারিত জানতে চাইলে নিচে নিচে সিরিয়াল নাম্বার (১., ২., ৩.) দিয়ে পরিষ্কার লিস্ট আকারে উত্তর দেবেন।')
    .replace(/in 2-3 concise sentences\./gi, 'using clean serial numbered lists (১., ২., ৩.) when sharing plans, prices, or details.');

  // If this is a subscribed merchant (NOT One Agent BD Admin), strip any accidental SaaS boilerplate from old signup defaults
  if (!isAdminOrOfficialSaaS) {
    systemPrompt = systemPrompt
      .replace(/-\s*WhatsApp,\s*Facebook Messenger ও Instagram 24\/7 AI অটো-রিপ্লাই[^\n]*\n?/gi, '')
      .replace(/-\s*স্টার্টার প্ল্যান:\s*৳১,২৫০\/মাস[^\n]*\n?/gi, '')
      .replace(/ডিজিটাল সার্ভিস তাৎক্ষণিক অ্যাক্টিভ হয়।\s*/gi, '');
  }

  const isOneAgentSaaS = isAdminOrOfficialSaaS;

  // If this is One Agent BD's official business or admin channel, enrich with complete SaaS details & live coupons
  const activeCoupons = (db.getCoupons() || []).filter((c) => c.is_active);
  const couponSummary =
    activeCoupons.length > 0
      ? activeCoupons
          .slice(0, 4)
          .map(
            (c) =>
              `${c.code} (${c.discount_type === 'percentage' ? `${c.discount_value}% ছাড়` : `৳${c.discount_value} ছাড়`})`
          )
          .join(', ')
      : 'WELCOME10 (১০% ডিসকাউন্ট), SAVE250 (৳২৫০ ডিসকাউন্ট)';

  const oneAgentExtendedKnowledge = isOneAgentSaaS
    ? `
[ONE AGENT BD COMPLETE SAAS KNOWLEDGE BASE — FOR ANSWERING ANY UNSCRIPTED QUESTION]:
- প্ল্যাটফর্মের কাজ: One Agent BD হলো বাংলাদেশের অল-ইন-ওয়ান AI Sales, Auto-Reply ও Order Management SaaS প্ল্যাটফর্ম। এটি Facebook Page, Instagram, WhatsApp এবং Website-এ ২৪/৭ মানুষের মতো স্মার্টভাবে কাস্টমারদের মেসেজ ও কমেন্টের উত্তর দেয় এবং অর্ডার কনফার্ম করে।
- কাদের জন্য উপযুক্ত: যেকোনো F-Commerce বা E-Commerce পেজ (কাপড়, ফ্যাশন, গ্যাজেট, কসমেটিকস, খাবার/রেস্টুরেন্ট, আইটি সার্ভিস, ক্লিনিক বা যেকোনো অনলাইন বিজনেস) যারা একা মেসেজ সামলাতে হিমশিম খাচ্ছেন বা রাত-দিন ২৪ ঘণ্টা সেলস বাড়াতে চান। কোডিং বা টেকনিক্যাল কোনো জ্ঞানেরই প্রয়োজন নেই—মাত্র ২ মিনিটে ১ ক্লিকেই সেটআপ করা যায়।
- ২টি অফিসিয়াল প্ল্যান ও দাম:
  ১) Starter AI Plan — ৳১,২৫০ টাকা/মাস (২ মাস ৳২,৫০০ | ৩ মাস ৳৩,৭৫০ | ৬ মাস ৳৭,৫০০ | ১ বছর/১২ মাস ৳১৫,০০০ টাকা):
     • ১টি AI এজেন্ট, Facebook, Instagram, WhatsApp ও Website চ্যাটবট, ৫০টি প্রোডাক্ট ক্যাটালগ, অটো কমেন্ট রিপ্লাই, অটো অর্ডার গ্রহণ এবং ১-ক্লিকে Steadfast, Pathao ও RedX কুরিয়ার বুকিং।
  ২) Pro Business Plan — ৳১,৯৫০ টাকা/মাস (২ মাস ৳৩,৯০০ | ৩ মাস ৳৫,৮৫০ | ৬ মাস ৳১১,৭০০ | ১ বছর/১২ মাস ৳২৩,৪০০ টাকা):
     • ৩টি AI এজেন্ট, ভয়েস মেসেজ শুনে উত্তর (Voice AI), কাস্টমারের পাঠানো প্রোডাক্টের ছবি দেখে দাম ও বিবরণ বলা (Image Recognition AI), আনলিমিটেড প্রোডাক্ট ক্যাটালগ ও ওয়েবসাইট/Shopify/WooCommerce সিঙ্ক এবং ২৪/৭ ভিআইপি সাপোর্ট।
- ফ্রি ট্রায়াল: যেকোনো নতুন ইউজার ওয়েবসাইটে (https://www.oneagentbd.online) অ্যাকাউন্ট খুলেই ২ দিনের (৪৮ ঘণ্টা) সম্পূর্ণ ফ্রি ট্রায়াল নিয়ে সব ফিচার টেস্ট করতে পারবেন (কোনো অগ্রিম পেমেন্ট লাগবে না)।
- কুপন কোড ও ডিসকাউন্ট (Coupon & Discount Policy): কাস্টমার কুপন কোড বা ডিসকাউন্ট চাইলে জানাবেন যে চেকআউটের সময় প্রোমো কোড বক্সে কুপন কোড ব্যবহার করে ডিসকাউন্ট নেওয়া যায়। বর্তমানে সচল কুপন কোডসমূহ: ${couponSummary}। এছাড়া ওয়েবসাইটের লাইভ চ্যাটবট থেকে বিজনেস রিভিউ/মাসিক সেলস জানিয়ে ১৫% ইনস্ট্যান্ট কুপন কোড জেনারেট করা যায় কিংবা বড় প্যাকেজে স্পেশাল ছাড়ের জন্য সাপোর্টে (+8801601705804) কথা বলা যাবে।
- নিরাপত্তা ও মেসেজ লিমিট: মেটার ১০০% অফিসিয়াল Graph ও Cloud API ব্যবহার করা হয়, তাই পেজ বা আইডি ব্যান হওয়ার ০% ঝুঁকিও নেই। উভয় প্ল্যানেই আনলিমিটেড মেসেজ রিপ্লাই (প্রতি মেসেজে আলাদা কোনো চার্জ নেই)।
- পেমেন্ট ও সাপোর্ট: বিকাশ, নগদ, রকেট ও উপায় (pay.oneagentbd.online)-এর মাধ্যমে পেমেন্ট করে TrxID দিলেই প্ল্যান সাথে সাথে অটোমেটিক অ্যাক্টিভ হয়। সাপোর্ট ও হেল্পলাইন (সকাল ৯টা – রাত ১১টা): +8801601705804 (WhatsApp/Call), ইমেইল: support.oneagentbd@gmail.com, ওয়েবসাইট: https://www.oneagentbd.online।`
    : '';

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

  // Build context history (up to last 8 messages for multi-turn conversation memory)
  const recentHistory = (params.history || [])
    .filter((m) => m.message_text && !m.message_text.startsWith('[Attachment]'))
    .slice(-8)
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

  const combinedSystemPrompt = `${systemPrompt}${oneAgentExtendedKnowledge ? `\n${oneAgentExtendedKnowledge}` : ''}`;

  const effectiveApiKey =
    (params.overrideApiKey && !isDeadSeedKey(params.overrideApiKey) ? params.overrideApiKey.trim() : '') ||
    (profile?.llm_api_key && !isDeadSeedKey(profile.llm_api_key) ? profile.llm_api_key.trim() : '') ||
    ((db.getSettings() as any)?.default_llm_api_key || '').trim() ||
    undefined;

  let voiceTranscript: string | undefined = undefined;
  const isVoicePlaceholderText =
    params.incomingMessage?.includes('[Voice Message]') ||
    params.incomingMessage?.includes('Voice Message');

  // 1. If customer sent a voice note / audio
  if (params.audioBase64 || isVoicePlaceholderText) {
    if (!params.audioBase64) {
      // Voice note attachment could not be downloaded or was empty — never guess a random answer!
      return {
        replyText: UNCLEAR_VOICE_REPLY,
        transcript: 'অস্পষ্ট ভয়েস মেসেজ',
        isVoice: true
      };
    }

    console.log(`[AI Service] Processing voice note for customer ${params.customerId}`);
    const voiceResult = await callGeminiWithAudio(
      params.audioBase64,
      params.audioMimeType || 'audio/ogg',
      combinedSystemPrompt,
      businessName,
      recentHistory,
      catalogContext,
      effectiveApiKey
    );

    if (voiceResult && voiceResult.replyText) {
      return {
        replyText: voiceResult.replyText,
        transcript: voiceResult.transcript,
        isVoice: true
      };
    }

    if (voiceResult && voiceResult.transcript && !isUnclearVoiceText(voiceResult.transcript)) {
      // Audio was clearly transcribed; pass verified transcript to Text Reasoning Engine below!
      voiceTranscript = voiceResult.transcript;
      params.incomingMessage = voiceResult.transcript;
      if (merchantProducts.length > 0) {
        matchedProduct = db.findProductForQuery(params.userId, voiceResult.transcript);
      }
    } else {
      // If the voice note could not be understood or transcribed, never guess or send an irrelevant ("ulta palta") reply!
      return {
        replyText: UNCLEAR_VOICE_REPLY,
        transcript: 'অস্পষ্ট ভয়েস মেসেজ',
        isVoice: true
      };
    }
  }

  // 2. If customer sent an image / photo
  if (params.imageBase64) {
    console.log(`[AI Service] Processing customer image inquiry for customer ${params.customerId}`);
    const imageReply = await callGeminiWithImage(
      params.imageBase64,
      params.imageMimeType || 'image/jpeg',
      params.incomingMessage,
      combinedSystemPrompt,
      businessName,
      catalogContext,
      recentHistory,
      effectiveApiKey
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
        replyText: `ধন্যবাদ! আপনার পাঠানো ছবিটি আমাদের "${matchedProduct.name}"-এর সাথে মিলেছে (মূল্য: ৳${matchedProduct.price})।\n\nআপনি কি এটি অর্ডার করতে চান? অর্ডার করতে আপনার নাম, ঠিকানা ও মোবাইল নাম্বারটি দিন!`,
        isVoice: false,
        attachedImageUrl: matchedProduct.image_url,
        attachedProductName: matchedProduct.name,
        attachedProductPrice: matchedProduct.price
      };
    }

    return {
      replyText: `ছবিটি পাঠানোর জন্য ধন্যবাদ! প্রোডাক্টটি আমাদের স্টকে আছে।\n\nআপনি কি এটি অর্ডার করতে চাচ্ছেন নাকি এর দাম ও বিস্তারিত জানতে চান?`,
      isVoice: false
    };
  }

  // 3. Intelligent Human-like Conversation, Smart Short vs. Detailed Replies & 1-Line Spacing Between Serial Items
  const shortGreetingReply = getShortGreetingOrSmallTalkReply(params.incomingMessage, businessName, 'bn');
  if (shortGreetingReply && !params.imageBase64) {
    const greetingEnvelope = buildInteractiveConversationEnvelope({
      incomingMessage: params.incomingMessage,
      aiReplyText: shortGreetingReply,
      businessName,
      merchantProducts,
      matchedProduct,
      systemPrompt: combinedSystemPrompt,
      isOneAgentSaaS
    });
    return {
      replyText: greetingEnvelope.replyText,
      interactiveOptions: greetingEnvelope.interactiveOptions,
      transcript: voiceTranscript,
      isVoice: Boolean(voiceTranscript || params.audioBase64)
    };
  }

  const languageDirective = `CRITICAL SMART REPLY LENGTH, SERIAL LIST FORMATTING & SPACING RULES (অবশ্যই পালনীয়):
১. ছোট প্রশ্নের ছোট উত্তর এবং বিস্তারিত প্রশ্নের বিস্তারিত উত্তর (SMART QUESTION-SIZE MATCHING):
   - কাস্টমার যদি সালাম দেয় ("আসসালামু আলাইকুম", "হ্যালো", "হাই"), কুশল জিজ্ঞেস করে ("কেমন আছেন?"), অথবা কোনো ছোট এক কথার প্রশ্ন করে (যেমন: "পেজ ব্যান হবে না তো?", "ফ্রি ট্রায়াল আছে?", "বিকাশ করা যাবে?") — তবে কখনোই অযথা বড় লিস্ট বা সব ফিচার লিখে মেসেজ বড় করবেন না! ছোট প্রশ্নের উত্তর ১–২ লাইনে সংক্ষেপে দেবেন এবং শেষে ১টি ছোট প্রশ্ন করবেন।
   - উদাহরণ (সালাম দিলে):
     "ওয়ালাইকুম আসসালাম! আমাদের পেজে স্বাগতম। 😊

     বলুন, আপনাকে কীভাবে সাহায্য করতে পারি?"
   - উদাহরণ (ছোট প্রশ্ন করলে — যেমন "পেজ ব্যান হওয়ার ঝুঁকি আছে?"):
     "না ভাইয়া, আপনার পেজ ১০০% নিরাপদ থাকবে! আমরা মেটার অফিশিয়াল API ব্যবহার করি তাই ব্যান হওয়ার কোনো ঝুঁকিই নেই।

     আপনি কি আপনার ফেসবুক পেজে এটি কানেক্ট করতে চাচ্ছেন?"

২. বিস্তারিত বা লিস্ট জাতীয় প্রশ্নে ১ লাইন করে ফাঁকা রেখে সিরিয়াল লিস্ট (SERIAL LIST WITH EMPTY LINE BETWEEN 1., 2., 3.):
   - কাস্টমার যখনই প্ল্যান, দাম, কী কী আছে (ki ki ase), প্রোডাক্ট লিস্ট, সার্ভিস বা বিস্তারিত (details) জানতে চাইবে—তখন সিরিয়াল নাম্বার (১., ২., ৩. অথবা ইংরেজিতে 1., 2., 3.) দিয়ে সাজিয়ে লিখবেন।
   - বিশেষ নিয়ম: ১. এর লেখা শেষ হলে নিচে অবশ্যই ১ লাইন ফাঁকা (\\n\\n) রেখে ২. লিখবেন, আবার ১ লাইন ফাঁকা (\\n\\n) রেখে ৩. লিখবেন!
   - উদাহরণ ১ (প্ল্যান বা দাম জানতে চাইলে — যেমন "Apnader plan nite cai" বা "দাম কত?"):
     "আমাদের ২টি সাবস্ক্রিপশন প্ল্যান রয়েছে:

     ১. স্টার্টার প্ল্যান (Starter AI Plan) — ১,২৫০ টাকা/মাস (১টি AI এজেন্ট, অটো মেসেজ ও কমেন্ট রিপ্লাই, কুরিয়ার বুকিং)

     ২. প্রো বিজনেস প্ল্যান (Pro Business Plan) — ১,৯৫০ টাকা/মাস (৩টি AI এজেন্ট, ভয়েস ও ছবির রিপ্লাই, আনলিমিটেড প্রোডাক্ট ও ভিআইপি সাপোর্ট)

     ৩. ফ্রি ট্রায়াল — ওয়েবসাইটে অ্যাকাউন্ট খুলেই ২ দিনের সম্পূর্ণ ফ্রি ট্রায়াল

     আপনি কি ১ নম্বর (স্টার্টার) নাকি ২ নম্বর (প্রো) প্ল্যানটি নিতে চাচ্ছেন?"
   - উদাহরণ ২ (ই-কমার্স বিজনেসের ক্ষেত্রে কাস্টমার "কী কী প্রোডাক্ট আছে", "দাম কত" বা "ডিটেইলস" জানতে চাইলে):
     "আমাদের প্রোডাক্ট ও বিস্তারিত নিচে দেওয়া হলো:

     ১. প্রিমিয়াম কটন টি-শার্ট — ৪৯০ টাকা (সাইজ: M, L, XL, ১০০% কটন)

     ২. পোলো শার্ট — ৭৫০ টাকা (কালার: নেভি ব্লু, ব্ল্যাক ও হোয়াইট)

     ৩. ডেলিভারি চার্জ — ঢাকার ভেতরে ৬০ টাকা এবং ঢাকার বাইরে ১২০ টাকা

     আপনি কোন প্রোডাক্টটি অর্ডার করতে চাচ্ছেন?"

৩. পরিষ্কার ফরম্যাট (Clean Formatting):
   - সর্বদা সহজ ও স্বাভাবিক বাংলা ভাষায় (বাংলা স্ক্রিপ্টে) উত্তর দেবেন। কখনোই ** বা # চিহ্ন ব্যবহার করবেন না।`;

  const orderSettings = db.getOrderSettings(params.userId);
  let orderGuidance =
    'ORDER CONFIRMATION: কাস্টমার অর্ডার করতে চাইলে বা নাম, ঠিকানা ও মোবাইল নাম্বার দিলে সংক্ষেপে অর্ডারটি কনফার্ম করুন।';
  if (orderSettings && orderSettings.enabled && orderSettings.instructions) {
    orderGuidance = `ORDER CONFIRMATION CRITERIA:\n${orderSettings.instructions}\nCollect name, 11-digit mobile number, and address to finalize order.`;
  }

  let productPhotoDirective = '';
  if (matchedProduct && (isAskingForImage || isAskingForDetails)) {
    productPhotoDirective = `PRODUCT PICTURE & DETAILS DIRECTIVE: কাস্টমার "${matchedProduct.name}"-এর ছবি বা বিস্তারিত জানতে চেয়েছেন। সংক্ষেপে জানান যে প্রোডাক্টটির ছবি পাঠানো হয়েছে এবং এর দাম ৳${matchedProduct.price} ${matchedProduct.currency}, এরপর নতুন প্যারাগ্রাফে জিজ্ঞেস করুন তিনি এটি অর্ডার করতে চান কিনা।`;
  }

  const isAskingForHumanCall =
    incomingLower.includes('kotha bolte chai') ||
    incomingLower.includes('kotha bolte cai') ||
    incomingLower.includes('call a kotha') ||
    incomingLower.includes('call koren') ||
    incomingLower.includes('call din') ||
    incomingLower.includes('call diben') ||
    incomingLower.includes('phone a kotha') ||
    incomingLower.includes('কথা বলতে চাই') ||
    incomingLower.includes('কল দিন') ||
    incomingLower.includes('কল করেন') ||
    incomingLower.includes('ফোনে কথা');

  const humanCallDirective = isAskingForHumanCall
    ? `HUMAN PHONE CALL DIRECTIVE: কাস্টমার সরাসরি ফোনে কথা বলতে বা কল দিতে বলেছেন। যদি কাস্টমারের ১১ ডিজিটের মোবাইল নাম্বার চ্যাটে দেওয়া না থাকে (বিশেষ করে Messenger বা Instagram-এ), তবে অবশ্যই আন্তরিকভাবে তাকে তার সচল মোবাইল বা WhatsApp নাম্বারটি চ্যাটে লিখে দিতে বলুন যাতে আমাদের প্রতিনিধি সাথে সাথে তাকে কল করতে পারেন।`
    : '';

  // 3B. Live Order & Parcel Tracking Bot + Smart Upsell & Combo Offer Directives
  const autoSettings = db.getAutomationSettings(params.userId) as any;
  const isTrackingQuery =
    incomingLower.includes('order status') ||
    incomingLower.includes('parcel') ||
    incomingLower.includes('courier') ||
    incomingLower.includes('tracking') ||
    incomingLower.includes('kobe pabo') ||
    incomingLower.includes('kothay') ||
    incomingLower.includes('অর্ডার স্ট্যাটাস') ||
    incomingLower.includes('পার্সেল') ||
    incomingLower.includes('কুরিয়ার') ||
    incomingLower.includes('কবে পাবো') ||
    incomingLower.includes('ডেলিভারি আপডেট') ||
    incomingLower.includes('অর্ডার কবে');

  let liveTrackingDirective = '';
  let deterministicTrackingReply = '';
  if (autoSettings?.auto_tracking_reply_enabled !== false) {
    const userOrders = db.getOrders(params.userId) || [];
    const phoneInQueryMatch = (params.incomingMessage || '').match(/(?:\+?88)?(01[3-9]\d{8})/);
    const phoneInQuery = phoneInQueryMatch ? phoneInQueryMatch[1] : null;
    const customerLatestOrder = userOrders.find(
      (o) =>
        o.customer_id === params.customerId ||
        (phoneInQuery && o.customer_phone && o.customer_phone.includes(phoneInQuery)) ||
        (params.customerName &&
          o.customer_name &&
          o.customer_name.toLowerCase().trim() === params.customerName.toLowerCase().trim())
    );

    if (customerLatestOrder) {
      const statusBanglaMap: Record<string, string> = {
        confirmed: 'অর্ডার কনফার্মড (প্যাকেজিংয়ের জন্য প্রস্তুত)',
        processing: 'প্রসেসিং চলছে (কুরিয়ারে হ্যান্ডওভারের প্রস্তুতি চলছে)',
        shipped: 'কুরিয়ারে পাঠানো হয়েছে (On the Way / In Transit)',
        delivered: 'সফলভাবে ডেলিভারি সম্পন্ন হয়েছে',
        cancelled: 'অর্ডারটি বাতিল (Cancelled) করা হয়েছে'
      };
      const stLabel = statusBanglaMap[customerLatestOrder.status] || customerLatestOrder.status;
      const courierInfo = customerLatestOrder.courier_name
        ? `কুরিয়ার: ${customerLatestOrder.courier_name}${customerLatestOrder.courier_consignment_id ? ` (Tracking/Consignment ID: ${customerLatestOrder.courier_consignment_id})` : ''}`
        : 'কুরিয়ার বুকিং প্রক্রিয়াধীন';
      const payInfo =
        customerLatestOrder.payment_status === 'paid'
          ? `পেমেন্ট স্ট্যাটাস: পরিশোধিত (Paid${customerLatestOrder.payment_trx_id ? ` - TrxID: ${customerLatestOrder.payment_trx_id}` : ''})`
          : `পেমেন্ট স্ট্যাটাস: ক্যাশ অন ডেলিভারি (বাকি: ৳${customerLatestOrder.total_amount - (customerLatestOrder.advance_paid_amount || 0)})`;

      liveTrackingDirective = `LIVE ORDER & PARCEL TRACKING DATA FOR THIS CUSTOMER:
- Order ID: #${customerLatestOrder.id.slice(-6).toUpperCase()}
- Ordered Item: ${customerLatestOrder.items} (৳${customerLatestOrder.total_amount})
- Current Status: ${stLabel}
- Courier & Tracking Info: ${courierInfo}
- Payment Info: ${payInfo}
If the customer is asking about their order, parcel, delivery date, or tracking status, give them this exact live update in Bangla!`;

      if (isTrackingQuery) {
        deterministicTrackingReply = `আপনার অর্ডার (#${customerLatestOrder.id.slice(-6).toUpperCase()} — ${customerLatestOrder.items})-এর বর্তমান অবস্থা:\n• স্ট্যাটাস: ${stLabel}\n• ${courierInfo}\n• ${payInfo}\n\nআপনার অর্ডার সংক্রান্ত আর কোনো তথ্য দিয়ে সাহায্য করতে পারি কি?`;
      }
    } else if (isTrackingQuery) {
      liveTrackingDirective = `LIVE ORDER TRACKING NOTE: কাস্টমার তার অর্ডারের আপডেট জানতে চেয়েছেন, কিন্তু এই চ্যাট আইডিতে এখনো কোনো অর্ডার পাওয়া যায়নি। তাকে বিনীতভাবে অর্ডার করার সময় ব্যবহৃত ১১ ডিজিটের মোবাইল নাম্বারটি দিতে বলুন যাতে সাথে সাথে পার্সেল স্ট্যাটাস চেক করে জানানো যায়।`;
    }
  }

  let smartUpsellDirective = '';
  if (autoSettings?.upsell_enabled && autoSettings?.upsell_offer_text) {
    smartUpsellDirective = `SMART UPSELL & COMBO OFFER DIRECTIVE: কাস্টমার যখন প্রোডাক্টের দাম জানতে চায় বা ১টি প্রোডাক্ট অর্ডার করতে চায়, তখন উত্তরের সাথে প্রাসঙ্গিকভাবে আমাদের এই স্পেশাল কম্বো অফারটি সংক্ষেপে উল্লেখ করবেন: "${autoSettings.upsell_offer_text}"`;
  }

  const appointmentBookingContext = buildAppointmentAIContext(params.userId, params.incomingMessage || '');

  if (deterministicTrackingReply && isTrackingQuery) {
    return {
      replyText: deterministicTrackingReply,
      transcript: voiceTranscript,
      isVoice: Boolean(voiceTranscript || params.audioBase64)
    };
  }

  const systemInstruction = `You are a warm, intelligent Customer Support & Sales Executive for "${businessName}".
CRITICAL FORMATTING RULES FOR MOBILE CHAT:
1. SHORT QUESTION = SHORT REPLY: If the customer just says a greeting ("আসসালামু আলাইকুম", "হ্যালো", "Hi") or asks a simple single question, reply in 1-2 short, natural lines + 1 short follow-up question. Do NOT dump a long list of features when the customer did not ask for details!
2. DETAILED / LIST QUESTION = SERIAL NUMBERED LIST WITH EMPTY LINES: Whenever the customer asks about plans, prices, products, features, what is available ("ki ki ase"), or details — format the items/plans/details as a clean numbered serial list (১., ২., ৩. in Bangla, or 1., 2., 3. in English), and put 1 empty line (\\n\\n) after 1., 1 empty line (\\n\\n) after 2., and 1 empty line (\\n\\n) after 3.
3. Always end your reply with 1 short, natural follow-up question in Bangla based on what the customer asked.
4. Never output markdown asterisks (**).`;

  const fullPrompt = `System Instructions & Business Knowledge Base (Merchant Details):
${combinedSystemPrompt}

Smart Reply Length, Serial List Formatting & Paragraph Spacing Rules:
${languageDirective}

Merchant Product Catalog:
${catalogContext}

${orderGuidance}
${productPhotoDirective}
${humanCallDirective}
${liveTrackingDirective}
${smartUpsellDirective}
${appointmentBookingContext}

Recent Conversation History:
${recentHistory || '(No previous messages)'}

Customer's Exact Question:
"${params.incomingMessage}"

Write a clean, mobile-friendly Bangla reply (if it is a greeting or short question, reply briefly in 1-2 lines; if the customer is asking for plans, products, "ki ki ase", or details, use serial numbers ১., ২., ৩. with 1 empty line \\n\\n between each numbered point, and end with 1 short follow-up question):`;

  // Check if customer clicked an interactive button/menu shortcut that can be answered deterministically & instantaneously
  const earlyInteractiveCheck = buildInteractiveConversationEnvelope({
    incomingMessage: params.incomingMessage,
    aiReplyText: '',
    businessName,
    merchantProducts,
    matchedProduct,
    systemPrompt: combinedSystemPrompt,
    isOneAgentSaaS
  });

  const qNormalized = (params.incomingMessage || '').trim().toLowerCase();
  const isDirectInteractiveCommand =
    qNormalized === 'হোম পেজ' ||
    qNormalized === 'home' ||
    qNormalized === 'আরও দেখুন' ||
    qNormalized === '↩️ আরও দেখুন' ||
    qNormalized === 'পছন্দ করুন' ||
    qNormalized === 'order now' ||
    qNormalized === 'অর্ডার করতে চাই' ||
    qNormalized === 'অর্ডার ফর্ম দিন' ||
    qNormalized === '🛒 অর্ডার করুন' ||
    qNormalized.includes('order korte cay') ||
    qNormalized.includes('order korte chai');

  if (isDirectInteractiveCommand && earlyInteractiveCheck.replyText) {
    return {
      replyText: earlyInteractiveCheck.replyText,
      interactiveOptions: earlyInteractiveCheck.interactiveOptions,
      transcript: voiceTranscript,
      isVoice: Boolean(voiceTranscript || params.audioBase64),
      attachedImageUrl: matchedProduct?.image_url,
      attachedProductName: matchedProduct?.name,
      attachedProductPrice: matchedProduct?.price
    };
  }

  const geminiReply = await callGemini(fullPrompt, effectiveApiKey, systemInstruction);
  const shouldAttachImage = Boolean(matchedProduct?.image_url && (isAskingForImage || isAskingForDetails));

  if (geminiReply) {
    const cleanReply = ensureConversationalFollowUp(
      geminiReply,
      params.incomingMessage,
      isOneAgentSaaS,
      merchantProducts.length > 0
    );
    const interactiveEnvelope = buildInteractiveConversationEnvelope({
      incomingMessage: params.incomingMessage,
      aiReplyText: cleanReply,
      businessName,
      merchantProducts,
      matchedProduct,
      systemPrompt: combinedSystemPrompt,
      isOneAgentSaaS
    });

    return {
      replyText: interactiveEnvelope.replyText,
      interactiveOptions: interactiveEnvelope.interactiveOptions,
      transcript: voiceTranscript,
      isVoice: Boolean(voiceTranscript || params.audioBase64),
      attachedImageUrl: shouldAttachImage ? matchedProduct?.image_url : undefined,
      attachedProductName: matchedProduct?.name,
      attachedProductPrice: matchedProduct?.price
    };
  }

  // 4. Smart Knowledge-Aware Bangla Fallback (uses user's systemPrompt + catalog)
  const smartBanglaReply = buildSmartBanglaFallbackFromPrompt(
    params.incomingMessage,
    combinedSystemPrompt,
    businessName,
    merchantProducts,
    matchedProduct
  );

  const fallbackWithFollowUp = ensureConversationalFollowUp(
    smartBanglaReply,
    params.incomingMessage,
    isOneAgentSaaS,
    merchantProducts.length > 0
  );

  const fallbackEnvelope = buildInteractiveConversationEnvelope({
    incomingMessage: params.incomingMessage,
    aiReplyText: fallbackWithFollowUp,
    businessName,
    merchantProducts,
    matchedProduct,
    systemPrompt: combinedSystemPrompt,
    isOneAgentSaaS
  });

  return {
    replyText: fallbackEnvelope.replyText,
    interactiveOptions: fallbackEnvelope.interactiveOptions,
    transcript: voiceTranscript,
    isVoice: Boolean(voiceTranscript || params.audioBase64),
    attachedImageUrl: shouldAttachImage ? matchedProduct?.image_url : undefined,
    attachedProductName: matchedProduct?.name,
    attachedProductPrice: matchedProduct?.price
  };
}

export interface SummarizeConversationParams {
  userId: string;
  customerId: string;
  customerName: string;
  platform: 'whatsapp' | 'messenger' | 'instagram';
  messages: Message[];
  latestOrderId?: string;
  latestOrderStatus?: string;
  orderPhone?: string;
  orderAddress?: string;
  orderProductSummary?: string;
}

export interface SummarizeConversationResult {
  customerName: string;
  customerId: string;
  platform: 'whatsapp' | 'messenger' | 'instagram';
  stageKey: 'new_inquiry' | 'discussion' | 'awaiting_order_details' | 'order_confirmed' | 'delivered';
  stageStep: 1 | 2 | 3 | 4;
  stageLabel: string;
  stageDescription: string;
  summaryText: string;
  keyPoints: string[];
  customerIntent: string;
  extractedPhone?: string;
  extractedAddress?: string;
  nextAction: string;
  stats: {
    totalMessages: number;
    customerMessages: number;
    aiReplies: number;
    humanReplies: number;
    hasVoice: boolean;
    hasImage: boolean;
    orderId?: string;
    orderStatus?: string;
  };
  generatedAt: string;
}

export async function summarizeConversation(
  params: SummarizeConversationParams
): Promise<SummarizeConversationResult> {
  const { userId, customerId, customerName, platform, messages } = params;
  const profile = db.getProfileById(userId);
  const effectiveApiKey =
    (profile?.llm_api_key && !isDeadSeedKey(profile.llm_api_key) ? profile.llm_api_key.trim() : '') ||
    ((db.getSettings() as any)?.default_llm_api_key || '').trim() ||
    undefined;

  const inboundMessages = messages.filter((m) => m.direction === 'inbound');
  const outboundMessages = messages.filter((m) => m.direction === 'outbound');
  const aiRepliesCount = outboundMessages.filter((m) => m.is_ai_reply).length;
  const humanRepliesCount = outboundMessages.filter((m) => !m.is_ai_reply).length;
  const hasVoice = messages.some((m) => Boolean(m.has_voice || m.audio_base64 || m.transcription));
  const hasImage = messages.some((m) => Boolean(m.has_image || m.image_url || m.image_base64));

  const allCustomerText = inboundMessages
    .map((m) => m.transcription || m.message_text || '')
    .join(' \n ');
  const allConvoText = messages
    .map((m) => `${m.direction === 'inbound' ? 'কাস্টমার' : m.is_ai_reply ? 'AI' : 'এজেন্ট'}: ${m.transcription || m.message_text || ''}`)
    .join('\n');

  // Extract phone number from conversation or customerId or order
  const phoneMatch =
    allCustomerText.match(/(?:\+?88)?(01[3-9]\d{8})/) ||
    customerId.match(/(?:\+?88)?(01[3-9]\d{8})/);
  const extractedPhone = params.orderPhone || (phoneMatch ? phoneMatch[1] : undefined);

  // Extract possible address if mentioned
  let extractedAddress = params.orderAddress;
  if (!extractedAddress) {
    for (const msg of inboundMessages) {
      const txt = (msg.transcription || msg.message_text || '').trim();
      if (
        /(ঠিকানা|address|রোড|বাসা|হাউজ|থানা|জেলা|ঢাকা|চট্টগ্রাম|সিলেট|রাজশাহী|খুলনা|বরিশাল|রংপুর|ময়মনসিংহ|মিরপুর|উত্তরা|ধানমন্ডি|গুলশান|বনানী|গাজীপুর|নারায়ণগঞ্জ)/i.test(
          txt
        ) &&
        txt.length >= 10
      ) {
        extractedAddress = txt.slice(0, 120);
      }
    }
  }

  // Detect Customer Intent / Topic
  const lowerCustomer = allCustomerText.toLowerCase();
  let customerIntent = params.orderProductSummary || '';
  if (!customerIntent) {
    const userProducts = db.getProducts(userId) || [];
    for (const p of userProducts) {
      if (lowerCustomer.includes(p.name.toLowerCase())) {
        customerIntent = `${p.name} (৳${p.price})`;
        break;
      }
    }
  }
  if (!customerIntent) {
    if (/starter|pro|plan|সাবস্ক্রিপশন|প্ল্যান|প্যাকেজ|ট্রায়াল|trial/i.test(allCustomerText)) {
      customerIntent = 'সাবস্ক্রিপশন প্ল্যান ও অটো-রিপ্লাই সার্ভিস';
    } else if (/price|dam|koto|দাম|কত|মূল্য|টাকা/i.test(allCustomerText)) {
      customerIntent = 'প্রোডাক্টের দাম ও বিস্তারিত তথ্য';
    } else if (/delivery|courier|ডেলিভারি|কুরিয়ার|পাঠানো/i.test(allCustomerText)) {
      customerIntent = 'ডেলিভারি চার্জ ও সময়সীমা';
    } else if (/order|কিনব|অর্ডার|নিতে চাই|নিবো/i.test(allCustomerText)) {
      customerIntent = 'প্রোডাক্ট অর্ডার কনফার্মেশন';
    } else if (hasImage) {
      customerIntent = 'ছবি পাঠিয়ে প্রোডাক্টের দাম ও স্টক জিজ্ঞাসা';
    } else if (hasVoice) {
      customerIntent = 'ভয়েস মেসেজে প্রোডাক্ট/সার্ভিস সম্পর্কে জিজ্ঞাসা';
    } else {
      const lastCustMsg = inboundMessages[inboundMessages.length - 1];
      const preview = (lastCustMsg?.transcription || lastCustMsg?.message_text || 'সাধারণ জিজ্ঞাসা').slice(0, 65);
      customerIntent = preview;
    }
  }

  // Determine exact Stage (1 to 4)
  let stageKey: SummarizeConversationResult['stageKey'] = 'new_inquiry';
  let stageStep: 1 | 2 | 3 | 4 = 1;
  let stageLabel = 'প্রাথমিক জিজ্ঞাসা (New Inquiry)';
  let stageDescription = 'কাস্টমার সবেমাত্র মেসেজ দিয়েছেন, প্রাথমিক কথোপকথন শুরু হয়েছে।';
  let nextAction = 'কাস্টমারের প্রশ্নের উত্তর দিয়ে তাকে অর্ডারের জন্য উৎসাহিত করুন।';

  const hasOrderIntent =
    /অর্ডার|order|কিনব|নিতে চাই|নিবো|কনফার্ম|confirm|পাঠান|ডেলিভারি দিন|লাগবে/i.test(allCustomerText) ||
    Boolean(extractedPhone && extractedAddress);

  const isAskingPriceOrDetails =
    /price|dam|koto|দাম|কত|মূল্য|টাকা|বিস্তারিত|details|সাইজ|কালার|ডেলিভারি|কুপন|ডিসকাউন্ট|প্ল্যান/i.test(
      allCustomerText
    ) || inboundMessages.length >= 2;

  if (params.latestOrderStatus === 'delivered') {
    stageKey = 'delivered';
    stageStep = 4;
    stageLabel = 'ডেলিভারি সম্পন্ন (Order Delivered)';
    stageDescription = `কাস্টমারের অর্ডারটি (${params.latestOrderId || 'Confirmed'}) সফলভাবে ডেলিভারি সম্পন্ন হয়েছে।`;
    nextAction = 'কাস্টমারের কাছে প্রোডাক্টের রিভিউ বা ফিডব্যাক চাইতে পারেন এবং নতুন অফার জানাতে পারেন।';
  } else if (params.latestOrderId || (extractedPhone && extractedAddress && hasOrderIntent)) {
    stageKey = 'order_confirmed';
    stageStep = 4;
    stageLabel = 'অর্ডার কনফার্মড (Order Confirmed)';
    stageDescription = params.latestOrderId
      ? `এই কাস্টমারের অর্ডার কনফার্ম হয়েছে (Order ID: ${params.latestOrderId}, Status: ${params.latestOrderStatus || 'pending'})।`
      : 'কাস্টমার অর্ডার কনফার্ম করার জন্য প্রয়োজনীয় তথ্য (ফোন নাম্বার ও ঠিকানা) প্রদান করেছেন।';
    nextAction = 'অর্ডার ড্যাশবোর্ড থেকে কুরিয়ারে (Steadfast/Pathao/RedX) পার্সেলটি বুকিং ও ডিসপ্যাচ করুন।';
  } else if (hasOrderIntent) {
    stageKey = 'awaiting_order_details';
    stageStep = 3;
    stageLabel = 'অর্ডার করতে আগ্রহী — তথ্যের অপেক্ষায় (High Intent)';
    const missing: string[] = [];
    if (!extractedPhone) missing.push('মোবাইল নাম্বার');
    if (!extractedAddress) missing.push('ডেলিভারি ঠিকানা');
    stageDescription =
      missing.length > 0
        ? `কাস্টমার প্রোডাক্ট/সার্ভিসটি নিতে আগ্রহী, তবে অর্ডার সম্পন্ন করার জন্য এখনো ${missing.join(' ও ')} দেওয়া বাকি আছে।`
        : 'কাস্টমার অর্ডার করার চূড়ান্ত পর্যায়ে রয়েছেন।';
    nextAction =
      missing.length > 0
        ? `কাস্টমারের কাছ থেকে ${missing.join(' এবং ')} চেয়ে অর্ডারটি কনফার্ম করে নিন।`
        : 'কাস্টমারের সাথে কথা বলে অর্ডারটি ফাইনাল করুন।';
  } else if (isAskingPriceOrDetails) {
    stageKey = 'discussion';
    stageStep = 2;
    stageLabel = 'দাম ও বিস্তারিত আলোচনা চলছে (Active Discussion)';
    stageDescription = 'কাস্টমার প্রোডাক্ট/সার্ভিসের দাম, ফিচার বা ডেলিভারি নিয়ম সম্পর্কে বিস্তারিত জানতে চেয়েছেন এবং AI উত্তর দিয়েছে।';
    nextAction = 'কাস্টমারকে ফলো-আপ মেসেজ পাঠান অথবা বিশেষ কোনো ছাড়/অফার জানিয়ে অর্ডার কনফার্ম করতে বলুন।';
  }

  // Build deterministic key points from actual conversation messages
  const buildDeterministicKeyPoints = (): string[] => {
    const pts: string[] = [];
    const recentInbound = inboundMessages.slice(-4);
    const recentOutbound = outboundMessages.slice(-3);

    if (recentInbound.length > 0) {
      const custQuestions = recentInbound
        .map((m) => (m.transcription ? `ভয়েস: "${m.transcription}"` : `"${m.message_text.slice(0, 90)}"`))
        .join(', ');
      pts.push(`কাস্টমার জানতে চেয়েছেন: ${custQuestions}`);
    }

    if (recentOutbound.length > 0) {
      const lastReply = recentOutbound[recentOutbound.length - 1];
      const cleanReply = lastReply.message_text.replace(/\s+/g, ' ').slice(0, 130);
      pts.push(
        `${lastReply.is_ai_reply ? 'AI অটো-রিপ্লাই' : 'এজেন্ট'} উত্তর দিয়েছে: "${cleanReply}${lastReply.message_text.length > 130 ? '...' : ''}"`
      );
    }

    pts.push(`বর্তমান অবস্থা: ${stageLabel} — ${stageDescription}`);
    return pts;
  };

  let summaryText = '';
  let keyPoints = buildDeterministicKeyPoints();

  // Call LLM to generate a rich, natural Bangla summary of the conversation
  try {
    const recentTranscript = messages
      .slice(-14)
      .map((m) => {
        const sender = m.direction === 'inbound' ? `Customer (${customerName})` : m.is_ai_reply ? 'AI Agent' : 'Human Agent';
        const content = m.transcription ? `[Voice Note: ${m.transcription}]` : m.message_text;
        return `${sender}: ${content}`;
      })
      .join('\n');

    const prompt = `নিচের কাস্টমার চ্যাট কনভারসেশনটি মনোযোগ দিয়ে পড়ুন এবং বাংলায় সংক্ষিপ্ত সামারি (Summary) তৈরি করুন।

কাস্টমারের নাম: ${customerName} (${platform})
মোট মেসেজ: ${messages.length}টি
অর্ডার স্ট্যাটাস: ${params.latestOrderId ? `অর্ডার কনফার্মড (${params.latestOrderStatus})` : 'এখনো অর্ডার এন্ট্রি হয়নি'}
শনাক্তকৃত পর্যায় (Stage): ${stageLabel}

চ্যাট হিস্ট্রি:
${recentTranscript}

নিচের ফরম্যাটে শুধুমাত্র বাংলায় পরিষ্কারভাবে উত্তর দিন (কোনো ** বা অতিরিক্ত মার্কডাউন চিহ্ন দেবেন না):
SUMMARY: (২-৩ বাক্যে কাস্টমারের সাথে শুরু থেকে শেষ পর্যন্ত কী কী কথা হয়েছে এবং কাস্টমার কী চাচ্ছেন তার সারসংক্ষেপ লিখুন)
POINT_1: (কাস্টমার প্রধানত কী জিজ্ঞেস করেছেন বা কী চেয়েছেন)
POINT_2: (AI বা এজেন্ট তাকে কী তথ্য বা সমাধান দিয়েছে)
POINT_3: (কনভারসেশনটি এখন কোন পর্যায়ে আছে এবং কী বাকি আছে)
NEXT_STEP: (মার্চেন্টের এখন পরবর্তী করণীয় কী - ১ বাক্যে)`;

    const aiRaw = await callGemini(
      prompt,
      effectiveApiKey,
      'You are an expert e-commerce & SaaS CRM conversation analyst. Always respond in clean, natural Bangla (বাংলা).'
    );

    if (aiRaw) {
      const sumMatch = aiRaw.match(/SUMMARY:\s*([\s\S]*?)(?=(POINT_1:|POINT_2:|NEXT_STEP:|$))/i);
      const p1Match = aiRaw.match(/POINT_1:\s*([^\n]+)/i);
      const p2Match = aiRaw.match(/POINT_2:\s*([^\n]+)/i);
      const p3Match = aiRaw.match(/POINT_3:\s*([^\n]+)/i);
      const nextMatch = aiRaw.match(/NEXT_STEP:\s*([^\n]+)/i);

      if (sumMatch && sumMatch[1].trim().length > 10) {
        summaryText = sumMatch[1].replace(/\n+/g, ' ').trim();
      } else {
        summaryText = aiRaw
          .replace(/(SUMMARY:|POINT_1:|POINT_2:|POINT_3:|NEXT_STEP:)/gi, '')
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean)
          .slice(0, 2)
          .join(' ');
      }

      const extractedPts = [p1Match?.[1]?.trim(), p2Match?.[1]?.trim(), p3Match?.[1]?.trim()].filter(
        (x): x is string => Boolean(x && x.length > 4)
      );
      if (extractedPts.length >= 2) {
        keyPoints = extractedPts;
      }
      if (nextMatch?.[1]?.trim() && nextMatch[1].trim().length > 5) {
        nextAction = nextMatch[1].trim();
      }
    }
  } catch (err: any) {
    console.warn('[AI Service] Conversation summarize LLM fallback:', err?.message || err);
  }

  if (!summaryText) {
    const firstMsg = inboundMessages[0]?.transcription || inboundMessages[0]?.message_text || '';
    const lastMsg = inboundMessages[inboundMessages.length - 1]?.transcription || inboundMessages[inboundMessages.length - 1]?.message_text || '';
    summaryText =
      inboundMessages.length > 1 && firstMsg !== lastMsg
        ? `${customerName} মূলত "${customerIntent}" বিষয়ে কথা বলেছেন। শুরুতে তিনি "${firstMsg.slice(0, 60)}" জানতে চেয়েছিলেন এবং সর্বশেষ "${lastMsg.slice(0, 70)}" লিখেছেন। আমাদের AI এজেন্ট তার প্রতিটি প্রশ্নের তাৎক্ষণিক উত্তর দিয়েছে এবং কনভারসেশনটি এখন "${stageLabel}" পর্যায়ে রয়েছে।`
        : `${customerName} চ্যাটে "${(lastMsg || firstMsg || customerIntent).slice(0, 80)}" বিষয়ে মেসেজ দিয়েছেন এবং AI স্বয়ংক্রিয়ভাবে উত্তর প্রদান করেছে। বর্তমানে চ্যাটটি "${stageLabel}" পর্যায়ে আছে।`;
  }

  return {
    customerName,
    customerId,
    platform,
    stageKey,
    stageStep,
    stageLabel,
    stageDescription,
    summaryText,
    keyPoints,
    customerIntent,
    extractedPhone,
    extractedAddress,
    nextAction,
    stats: {
      totalMessages: messages.length,
      customerMessages: inboundMessages.length,
      aiReplies: aiRepliesCount,
      humanReplies: humanRepliesCount,
      hasVoice,
      hasImage,
      orderId: params.latestOrderId,
      orderStatus: params.latestOrderStatus
    },
    generatedAt: new Date().toISOString()
  };
}

