import { GoogleGenAI } from '@google/genai';
import { db, Message, Product } from '../db/database.js';
import { cleanAudioMimeType, convertToWav, detectAudioMimeTypeFromBuffer, mp4ToAdtsAac } from './audioDownloader.js';

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
    .replace(/\r\n/g, '\n')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/।।+/g, '।')
    // Ensure a space after Bengali Dari or punctuation when followed directly by a word character
    .replace(/([।?!])(?=[^\s।?!\n"”')\]])/gu, '$1 ')
    .trim();

  const splitDenseParagraph = (para: string): string[] => {
    const trimmed = para.trim();
    if (!trimmed) return [];
    // Do not split bullet points
    if (/^[•\-–—*০-৯0-9]+[.)]?\s/.test(trimmed)) {
      return [trimmed];
    }
    const sentences = trimmed
      .split(/(?<=[।?!])\s+/u)
      .map((s) => s.trim())
      .filter(Boolean);

    if (sentences.length <= 1) {
      return [trimmed];
    }
    if (sentences.length === 2) {
      // If the second sentence is a question or the paragraph is long, put empty line between them
      if (sentences[1].endsWith('?') || trimmed.length > 95) {
        return [sentences[0], sentences[1]];
      }
      return [trimmed];
    }
    if (sentences.length === 3) {
      if (sentences[2].endsWith('?')) {
        return [`${sentences[0]} ${sentences[1]}`, sentences[2]];
      }
      return [sentences[0], `${sentences[1]} ${sentences[2]}`];
    }
    // 4+ sentences: group body into 2 clean paragraphs and keep the closing question separate
    const lastSentence = sentences[sentences.length - 1];
    const bodySentences = sentences.slice(0, -1);
    const mid = Math.ceil(bodySentences.length / 2);
    const para1 = bodySentences.slice(0, mid).join(' ');
    const para2 = bodySentences.slice(mid).join(' ');
    return [para1, para2, lastSentence].filter(Boolean);
  };

  const rawLines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const expandedLines: string[] = [];
  for (const line of rawLines) {
    expandedLines.push(...splitDenseParagraph(line));
  }

  if (expandedLines.length > 1) {
    const rebuilt: string[] = [];
    for (let i = 0; i < expandedLines.length; i++) {
      const curr = expandedLines[i];
      const prev = i > 0 ? expandedLines[i - 1] : '';
      const isCurrBullet = /^[•\-–—*০-৯0-9]+[.)]?\s/.test(curr);
      const isPrevBullet = /^[•\-–—*০-৯0-9]+[.)]?\s/.test(prev);

      if (i === 0) {
        rebuilt.push(curr);
      } else if (isCurrBullet && isPrevBullet) {
        rebuilt.push('\n' + curr);
      } else {
        rebuilt.push('\n\n' + curr);
      }
    }
    text = rebuilt.join('');
  } else if (expandedLines.length === 1) {
    text = expandedLines[0];
  }

  return text.replace(/\n{3,}/g, '\n\n').trim();
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
2. Identify what is shown in the image (product from catalog, screenshot, payment slip, or general inquiry) and match it with the Business Knowledge Base and Merchant Product Catalog.
3. Reply naturally like a real human in concise Bangla (বাংলা ভাষায় — ২ থেকে ৩ বাক্যে).
4. Put an empty line (\\n\\n) between your main answer and your closing follow-up question!
5. End with 1 smart, relevant follow-up question in a new paragraph (যেমন: কাস্টমার কি এটি অর্ডার করতে চান নাকি অন্য কোনো সাইজ/কালার খুঁজছেন?). Do not use ** markdown asterisks.

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
      return `জ্বী ভাইয়া, আমাদের ১ বছরের (১২ মাসের) জন্য Starter AI Plan ৳১৫,০০০ টাকা এবং Pro Business Plan ৳২৩,৪০০ টাকা।\n\nচেকআউটের সময় কুপন কোড (WELCOME10) ব্যবহার করলে আপনি সাথে সাথে ১০% ডিসকাউন্টও পাবেন!\n\nআপনি কি প্রথমে ২ দিনের ফ্রি ট্রায়াল নিয়ে টেস্ট করে দেখতে চান, নাকি সরাসরি কোনো প্ল্যান অ্যাক্টিভ করতে চাচ্ছেন?`;
    }

    if (isSixMonths) {
      return `আমাদের ৬ মাসের জন্য Starter AI Plan ৳৭,৫০০ টাকা এবং Pro Business Plan ৳১১,৭০০ টাকা।\n\nআপনি চাইলে শুরুতে ২ দিনের ফ্রি ট্রায়াল নিয়ে টেস্ট করতে পারেন অথবা চেকআউটে কুপন ডিসকাউন্ট ব্যবহার করতে পারেন!\n\nআপনি কোন প্ল্যানটি নেওয়ার কথা ভাবছেন?`;
    }

    if (isThreeMonths) {
      return `আমাদের ৩ মাসের জন্য Starter AI Plan ৳৩,৭৫০ টাকা এবং Pro Business Plan ৳৫,৮৫০ টাকা।\n\nআপনি কি প্রথমে আমাদের ২ দিনের ফ্রি ট্রায়াল দিয়ে সব ফিচার যাচাই করে দেখতে চান?`;
    }

    if (isTwoMonths) {
      return `আমাদের ২ মাসের জন্য Starter AI Plan ৳২,৫০০ টাকা এবং Pro Business Plan ৳৩,৯০০ টাকা।\n\nআপনার বিজনেস বা পেজের জন্য কোন প্ল্যানটি অ্যাক্টিভ করতে চাচ্ছেন?`;
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
      return `জ্বী, অবশ্যই! আমাদের AI কাস্টমারের পাঠানো বাংলা বা বাংলিশ ভয়েস মেসেজ শুনে এবং প্রোডাক্টের ছবি দেখে সাথে সাথে সঠিক দাম ও উত্তর দিতে পারে।\n\nআপনি কি আপনার ফেসবুক পেজে এটি ২ দিনের ফ্রি ট্রায়াল দিয়ে টেস্ট করে দেখতে চান?`;
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
      q.includes('pay') ||
      q.includes('বিকাশ') ||
      q.includes('নগদ') ||
      q.includes('রকেট') ||
      q.includes('পেমেন্ট')
    ) {
      return `আমাদের ওয়েবসাইট (https://www.oneagentbd.online)-এর Billing মেনু থেকে বিকাশ, নগদ, রকেট বা উপায়-এ পেমেন্ট করে TrxID দিলেই প্ল্যান সাথে সাথে অটো অ্যাক্টিভ হয়ে যাবে।\n\nআপনি কোন প্ল্যানটি অ্যাক্টিভ করতে চাচ্ছেন?`;
    }

    // 2H. Free trial inquiry
    if (q.includes('trial') || q.includes('trail') || q.includes('free') || q.includes('ট্রায়াল') || q.includes('ফ্রি')) {
      return `জ্বী! আমাদের ওয়েবসাইটে (https://www.oneagentbd.online) নতুন অ্যাকাউন্ট খুললেই কোনো অগ্রিম পেমেন্ট ছাড়া ২ দিনের সম্পূর্ণ ফ্রি ট্রায়াল পাবেন।\n\nআপনি কি আজই ট্রায়ালটি চালু করে আপনার পেজে টেস্ট করে দেখতে চান?`;
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
      return `মাত্র ২ মিনিটেই সেটআপ করা যায়! https://www.oneagentbd.online ওয়েবসাইটে লগইন করে "Connect with Facebook"-এ ১ ক্লিক করে পেজ কানেক্ট ও বিজনেস ডিটেইলস সেভ করলেই অটো রিপ্লাই শুরু হবে।\n\nসেটআপ করতে আপনার কি কোনো সাহায্য প্রয়োজন?`;
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
      return `আমাদের ২টি প্ল্যান রয়েছে:\n• Starter AI Plan: ৳১,২৫০/মাস (১টি এজেন্ট, সব চ্যানেল ও কুরিয়ার বুকিং)\n• Pro Business Plan: ৳১,৯৫০/মাস (৩টি এজেন্ট, ভয়েস ও ছবির রিপ্লাইসহ আনলিমিটেড)\n\nআপনি কি প্রথমে ২ দিনের ফ্রি ট্রায়াল দিয়ে শুরু করতে চান, নাকি সরাসরি কোনো প্ল্যান নিবেন?`;
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
      return `আমরা Facebook, Instagram, WhatsApp ও Website-এ ২৪/৭ অটো মেসেজ ও কমেন্ট রিপ্লাই, ভয়েস ও ছবির উত্তর এবং অটো অর্ডার ও কুরিয়ার বুকিং সার্ভিস দিই।\n\nআমাদের প্ল্যান শুরু মাত্র ৳১,২৫০/মাস থেকে (সাথে ২ দিনের ফ্রি ট্রায়াল)।\n\nআপনার বিজনেস বা পেজটি মূলত কোন ধরনের প্রোডাক্ট বা সার্ভিস নিয়ে কাজ করে?`;
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
      return `আমাদের হেল্পলাইন ও হোয়াটসঅ্যাপ নাম্বার: +8801601705804 (সকাল ৯টা – রাত ১১টা) এবং ওয়েবসাইট: https://www.oneagentbd.online।\n\nআপনি চাইলে আপনার মোবাইল নাম্বারটি এখানে দিতে পারেন, আমাদের প্রতিনিধি সরাসরি কল করে সাহায্য করবে!`;
    }

    // Default SaaS greeting / overview
    return `আসসালামু আলাইকুম! ${businessName}-এ স্বাগতম। আমরা Facebook, Instagram, WhatsApp ও Website-এ ২৪/৭ স্মার্ট AI অটো-রিপ্লাই ও অর্ডার অটোমেশন সার্ভিস দিয়ে থাকি।\n\nআমাদের প্ল্যান শুরু ৳১,২৫০/মাস থেকে এবং সাথে ২ দিনের ফ্রি ট্রায়াল সুবিধা রয়েছে।\n\nআপনি কি আপনার ফেসবুক পেজ বা ওয়েবসাইটের জন্য অটোমেশন সম্পর্কে জানতে চাচ্ছেন?`;
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

  // Resolve the best custom system_prompt (if admin channel, also check default_system_prompt or other admin profiles)
  const defaultSavedPrompt = ((db.getSettings() as any)?.default_system_prompt || '').trim();
  const adminCustomPrompt =
    profile?.role === 'admin'
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
    `You are the polite, helpful customer service AI agent for ${businessName}.`;

  // Sanitize any legacy "English only" instructions inside saved prompts so Bangla replies always work
  const systemPrompt = rawSystemPrompt
    .replace(/in 1-2 clear English sentences/gi, 'in clear, natural Bangla (বাংলা)')
    .replace(/in 1-2 clear, courteous English sentences/gi, 'in clear, courteous Bangla (বাংলা)')
    .replace(/in 1-2 polite, clear English sentences/gi, 'in polite, clear Bangla (বাংলা)')
    .replace(/in 1-2 informative, concise English sentences/gi, 'in informative, natural Bangla (বাংলা)')
    .replace(/in clear, friendly English/gi, 'in clear, friendly Bangla (বাংলা)')
    .replace(/in 1-2 concise English sentences/gi, 'in natural Bangla (বাংলা)')
    .replace(/Respond politely and directly in 1-2 concise English sentences\./gi, 'কাস্টমারের প্রশ্নের অর্থ বুঝে সর্বদা সুন্দর ও স্বাভাবিক বাংলায় উত্তর দিন।');

  const isOneAgentSaaS =
    businessName.toLowerCase().includes('one agent') ||
    systemPrompt.includes('Starter AI Plan') ||
    systemPrompt.includes('oneagentbd.online') ||
    profile?.role === 'admin';

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

  // 3. Intelligent Human-like Conversation, Paragraph Spacing & Context-Aware Follow-Up Question
  const languageDirective = `CRITICAL HUMAN CONVERSATION, SPACING & FOLLOW-UP QUESTION RULES (অবশ্যই পালনীয়):
১. মানুষের মতো ন্যাচারাল কথোপকথন (Talk Like a Real Human / ChatGPT Style):
   - রোবটের মতো মুখস্থ বা একঘেয়ে উত্তর না দিয়ে একজন বুদ্ধিমান ও আন্তরিক মানুষের মতো কথা বলবেন।
   - উত্তর সংক্ষিপ্ত ও টু-দ্য-পয়েন্ট রাখবেন (সর্বোচ্চ ২ থেকে ৩টি ছোট বাক্য), যাতে কাস্টমার এক নজরেই পড়ে বুঝতে পারে।
২. প্যারাগ্রাফ ও লাইন স্পেসিং (MANDATORY PARAGRAPH SPACING — টেক্সট বুঝে ফাঁকা জায়গা রাখা):
   - কখনোই সব কথা একসাথে গাদাগাদি করে এক প্যারাগ্রাফে লিখবেন না!
   - মূল উত্তর দেওয়ার পর অবশ্যই একটি খালি লাইন (Double Newline / \\n\\n) ফাঁকা রেখে পরবর্তী লাইন বা প্রশ্ন লিখবেন, যাতে মেসেজটি দেখতে পরিষ্কার ও সুন্দর লাগে।
৩. উত্তর বুঝে শেষে ১টি প্রাসঙ্গিক প্রশ্ন করা (MANDATORY SMART FOLLOW-UP QUESTION):
   - ChatGPT বা একজন দক্ষ সেলস এক্সিকিউটিভের মতো কাস্টমারের প্রশ্নের উত্তর দেওয়ার পর, সেই উত্তরের সাথে মিল রেখে সবশেষে নতুন প্যারাগ্রাফে কাস্টমারকে ১টি সুন্দর ও প্রাসঙ্গিক প্রশ্ন (Follow-up Question) করবেন যাতে কনভারসেশন চলতে থাকে!
   - উদাহরণ ১ (সার্ভিস জানতে চাইলে):
     "জ্বী, অবশ্যই! আমরা Facebook, WhatsApp, Instagram ও Website-এর জন্য ২৪/৭ স্মার্ট AI অটো-রিপ্লাই এবং অর্ডার অটোমেশন সার্ভিস দিয়ে থাকি। আমাদের প্ল্যান মাত্র ৳১,২৫০/মাস থেকে শুরু (সাথে ২ দিনের ফ্রি ট্রায়াল)।

     আপনার বিজনেস বা পেজটি মূলত কোন ধরনের প্রোডাক্ট বা সার্ভিস নিয়ে কাজ করে?"
   - উদাহরণ ২ (দাম বা মেয়াদ জানতে চাইলে):
     "জ্বী ভাইয়া, ১ বছরের জন্য আমাদের Starter AI Plan ৳১৫,০০০ টাকা এবং Pro Business Plan ৳২৩,৪০০ টাকা। চেকআউটের সময় কুপন কোড ব্যবহার করলে ডিসকাউন্টও পাবেন!

     আপনি কি প্রথমে আমাদের ২ দিনের ফ্রি ট্রায়াল দিয়ে টেস্ট করে দেখতে চান, নাকি সরাসরি কোনো প্ল্যান অ্যাক্টিভ করবেন?"
৪. পরিষ্কার ফরম্যাট (Clean Formatting):
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

  const systemInstruction = `You are a warm, intelligent, human-like Customer Support & Sales Executive for "${businessName}" (conversational like ChatGPT).
CRITICAL RULES:
1. Keep every reply concise (2-3 short sentences total).
2. Always separate your main answer and your closing follow-up question with an empty line (\\n\\n) so the text is never clumped together.
3. Always end your reply with 1 natural, context-aware follow-up question in Bangla based on what the customer asked, keeping the conversation flowing like a real human.
4. Never output markdown asterisks (**).`;

  const fullPrompt = `System Instructions & Business Knowledge Base (Merchant Details):
${combinedSystemPrompt}

Human Conversation, Paragraph Spacing & Follow-Up Question Rules:
${languageDirective}

Merchant Product Catalog:
${catalogContext}

${orderGuidance}
${productPhotoDirective}

Recent Conversation History:
${recentHistory || '(No previous messages)'}

Customer's Exact Question:
"${params.incomingMessage}"

Write a natural, human-like Bangla reply (with \\n\\n spacing between the direct answer and a smart closing follow-up question):`;

  const geminiReply = await callGemini(fullPrompt, effectiveApiKey, systemInstruction);
  const shouldAttachImage = Boolean(matchedProduct?.image_url && (isAskingForImage || isAskingForDetails));

  if (geminiReply) {
    return {
      replyText: ensureConversationalFollowUp(
        geminiReply,
        params.incomingMessage,
        isOneAgentSaaS,
        merchantProducts.length > 0
      ),
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

  return {
    replyText: ensureConversationalFollowUp(
      smartBanglaReply,
      params.incomingMessage,
      isOneAgentSaaS,
      merchantProducts.length > 0
    ),
    transcript: voiceTranscript,
    isVoice: Boolean(voiceTranscript || params.audioBase64),
    attachedImageUrl: shouldAttachImage ? matchedProduct?.image_url : undefined,
    attachedProductName: matchedProduct?.name,
    attachedProductPrice: matchedProduct?.price
  };
}
