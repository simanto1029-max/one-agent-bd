import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { db } from '../db/database.js';
import {
  getCandidateGeminiKeys,
  CANDIDATE_MODELS,
  formatCleanChatMessage,
  ensureConversationalFollowUp
} from '../services/aiService.js';
import {
  detectLanguageMode,
  ONE_AGENT_SAAS_KNOWLEDGE,
  sanitizeWebsiteBotReply,
  handleSaasCouponFlow
} from './widget.js';

export const aiChatRouter = Router();

function getGeminiClient(): GoogleGenAI | null {
  const keys = getCandidateGeminiKeys();
  const apiKey = keys[0] || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });
}

function getSaasIntelligentFallback(question: string, lang: 'bn' | 'en'): string {
  const q = question.toLowerCase();

  // Pricing & Packages
  if (
    q.includes('price') ||
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
    q.includes('rate') ||
    q.includes('package') ||
    q.includes('dam') ||
    q.includes('koto') ||
    q.includes('taka') ||
    q.includes('pricing') ||
    q.includes('plan') ||
    q.includes('দাম') ||
    q.includes('কত') ||
    q.includes('প্ল্যান') ||
    q.includes('প্যাকেজ') ||
    q.includes('ফি') ||
    q.includes('সাবস্ক্রিপশন')
  ) {
    return lang === 'en'
      ? 'We have 2 official plans plus a 2-Day Free Trial:\n• Starter AI Plan — 1,250 TK/month (Includes all SaaS features: WhatsApp, Messenger, Instagram & Website AI Chatbot, Voice & Image AI, up to 3 Channels, 1 Website Store & Courier Dispatch)\n• Pro Business Plan — 1,950 TK/month (Connect up to 10 Channels, 3 AI Agents, Unlimited Multi-Store Sync, VIP Broadcast & Priority Support)\n\nPlus, enjoy 15% OFF on 1-Year subscriptions and 20% OFF on 2-Year subscriptions!'
      : 'আমাদের ২ দিনের ফ্রি ট্রায়াল সহ ২টি অফিসিয়াল প্ল্যান রয়েছে:\n• Starter AI Plan — ৳১,২৫০/মাস (সব SaaS ফিচার: WhatsApp, Messenger, Instagram ও Website AI Chatbot, ভয়েস ও ছবির AI, ৩টি চ্যানেল ও কুরিয়ার বুকিং)\n• Pro Business Plan — ৳১,৯৫০/মাস (১০টি পর্যন্ত চ্যানেল কানেকশন, ৩টি AI এজেন্ট, আনলিমিটেড ওয়েবসাইট স্টোর ও VIP ব্রডকাস্ট)\n\nএছাড়া ১ বছরের সাবস্ক্রিপশনে ১৫% ডিসকাউন্ট এবং ২ বছরের সাবস্ক্রিপশনে ২০% ডিসকাউন্ট পাবেন!';
  }

  // Free Trial
  if (q.includes('trial') || q.includes('trail') || q.includes('free') || q.includes('2 day') || q.includes('test') || q.includes('ট্রায়াল') || q.includes('ফ্রি')) {
    return lang === 'en'
      ? 'Yes! You can activate a 2-Day Free Trial with 1 click right from our Pricing section, or buy a direct plan anytime. During the trial, you can test WhatsApp, Messenger, Instagram, and Website AI Auto-Reply for free!'
      : 'জ্বী! আমাদের প্রাইসিং সেকশন থেকে আপনি ১-ক্লিকে ২ দিনের ফ্রি ট্রায়াল চালু করতে পারবেন অথবা সরাসরি যেকোনো প্ল্যান কিনতে পারবেন। ট্রায়াল চলাকালীন সব চ্যানেলে অটো-রিপ্লাই সম্পূর্ণ ফ্রিতে টেস্ট করতে পারবেন।';
  }

  // Voice & Picture AI
  if (q.includes('voice') || q.includes('audio') || q.includes('picture') || q.includes('image') || q.includes('photo') || q.includes('ভয়েস') || q.includes('অডিও') || q.includes('ছবি')) {
    return lang === 'en'
      ? 'Our AI Chatbot understands both Voice Messages (🎤) and Pictures/Screenshots (🖼️)! Customers can speak or send photos in Bangla, Banglish, or English, and our AI replies accurately right away.'
      : 'আমাদের AI চ্যাটবট ভয়েস মেসেজ (🎤) এবং ছবি/স্ক্রিনশট (🖼️) দুটোই বুঝতে পারে! কাস্টমার ভয়েস বা ছবি পাঠালে AI তা শুনে ও দেখে সাথে সাথে বাংলা বা ইংরেজিতে সঠিক উত্তর দেয়।';
  }

  // Website / WhatsApp / Messenger connection
  if (
    q.includes('website') ||
    q.includes('whatsapp') ||
    q.includes('messenger') ||
    q.includes('meta') ||
    q.includes('connect') ||
    q.includes('facebook') ||
    q.includes('page') ||
    q.includes('হোয়াটসঅ্যাপ') ||
    q.includes('মেসেঞ্জার') ||
    q.includes('ফেসবুক') ||
    q.includes('ওয়েবসাইট')
  ) {
    return lang === 'en'
      ? 'We use Official Meta Graph API & WhatsApp Cloud API (100% safe, 0% ban risk), plus a 1-Line Embed Script to add the AI Chatbot to any website (WordPress, Shopify, Wix, or Custom HTML/React) in under 2 minutes!'
      : 'আমরা অফিসিয়াল Meta Graph API এবং WhatsApp Cloud API ব্যবহার করি (১০০% নিরাপদ), এবং মাত্র ১ লাইনের স্ক্রিপ্ট কোড কপি করে আপনার যেকোনো ওয়েবসাইটে (WordPress, Shopify, Custom Site) AI চ্যাটবট যুক্ত করতে পারবেন!';
  }

  // Order & Courier
  if (q.includes('order') || q.includes('courier') || q.includes('booking') || q.includes('অর্ডার') || q.includes('কুরিয়ার')) {
    return lang === 'en'
      ? 'When a customer shares their name, address, and phone number in chat, the AI automatically confirms the order into your Orders Hub and lets you book Steadfast, Pathao, or RedX courier with 1 click!'
      : 'কাস্টমার চ্যাটে নাম, ঠিকানা ও ফোন নাম্বার দিলেই AI স্বয়ংক্রিয়ভাবে অর্ডার কনফার্ম করে Orders Hub-এ সেভ করে এবং ১-ক্লিকে Steadfast, Pathao বা RedX কুরিয়ারে পার্সেল বুক করা যায়!';
  }

  // Payment
  if (q.includes('bkash') || q.includes('nagad') || q.includes('payment') || q.includes('coupon') || q.includes('বিকাশ') || q.includes('নগদ') || q.includes('পেমেন্ট')) {
    return lang === 'en'
      ? 'You can pay via bKash, Nagad, Rocket, or Upay through our official gateway (pay.oneagentbd.online) with instant TrxID verification, and apply Coupon Codes for discounts!'
      : 'আমাদের অফিসিয়াল পেমেন্ট গেটওয়ে pay.oneagentbd.online-এর মাধ্যমে বিকাশ, নগদ বা রকেট দিয়ে পেমেন্ট করে TrxID দিলেই সাবস্ক্রিপশন সাথে সাথে অটো-অ্যাক্টিভ হয়ে যাবে! সাথে কুপন কোড ডিসকাউন্ট সুবিধাও রয়েছে।';
  }

  // Default fallback
  return lang === 'en'
    ? 'Welcome to One Agent BD! 🌟 We provide 24/7 AI Auto-Reply & Order Management for WhatsApp, Facebook Messenger, Instagram, and Websites. Our plans are 1,250 TK/month and 1,950 TK/month with a 2-Day Free Trial. Ask me anything in English, Bangla, or Banglish!'
    : 'আসসালামু আলাইকুম! One Agent BD হলো বাংলাদেশের ২৪/৭ WhatsApp, Facebook Messenger, Instagram ও Website AI অটো-রিপ্লাই এবং অর্ডার ম্যানেজমেন্ট প্ল্যাটফর্ম। আমাদের প্ল্যান ৳১,২৫০/মাস এবং ৳১,৯৫০/মাস (সাথে ২ দিনের ফ্রি ট্রায়াল)। আপনার যেকোনো প্রশ্ন বাংলায়, বাংলিশে বা ইংরেজিতে করতে পারেন!';
}

// 1. Hero Live Chat Trained on One Agent BD SaaS
aiChatRouter.post('/hero-query', async (req: Request, res: Response) => {
  try {
    const { message, platform = 'whatsapp', history = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const trimmedMsg = message.trim();
    const lang = detectLanguageMode(trimmedMsg);

    const couponReply = handleSaasCouponFlow(trimmedMsg, history, 'hero_visitor', lang);
    if (couponReply) {
      return res.json({ reply: couponReply, source: 'coupon-generator', detectedLanguage: lang });
    }

    try {
      const formattedHistory = Array.isArray(history)
        ? history
            .slice(-4)
            .map((h: any) => `${h.sender === 'customer' ? 'User' : 'One Agent BD AI'}: ${h.text}`)
            .join('\n')
        : '';

      const languageInstruction =
        lang === 'en'
          ? 'CRITICAL LANGUAGE RULE: The visitor asked in English. Reply in clear, natural, and concise English (2-3 sentences).'
          : 'CRITICAL LANGUAGE RULE: কাস্টমার বাংলা (Bangla) অথবা বাংলিশ (Banglish) এ প্রশ্ন করেছে। সর্বদা সুন্দর, মার্জিত ও প্রাকৃতিক বাংলা ভাষায় (বাংলা স্ক্রিপ্টে) ২-৩ বাক্যে উত্তর দিন।';

      const fullPrompt = `${ONE_AGENT_SAAS_KNOWLEDGE}

Channel UI: ${platform === 'whatsapp' ? 'WhatsApp Business' : 'Facebook Messenger'}
${languageInstruction}
CRITICAL REMINDER & CONVERSATION STYLE:
1. The visitor is ALREADY on our website (oneagentbd.online). Never tell them to visit our website ("বিস্তারিত জানতে আমাদের ওয়েবসাইট ভিজিট করুন"). Answer directly in this chat!
2. Talk naturally like a real human (conversational like ChatGPT).
3. Put an empty line (\\n\\n) between your main answer and your closing follow-up question!
4. Always end your reply with 1 smart, context-aware follow-up question based on what the visitor asked!

Previous conversation:
${formattedHistory || '(No previous messages)'}

Visitor asks: "${trimmedMsg}"

Generate a direct, helpful, human-like response (with \\n\\n paragraph spacing and 1 closing follow-up question):`;

      const ai = getGeminiClient();
      if (ai) {
        for (const model of CANDIDATE_MODELS) {
          try {
            const response = await ai.models.generateContent({
              model,
              contents: fullPrompt
            });

            const reply = response.text?.trim();
            if (reply) {
              return res.json({
                reply: ensureConversationalFollowUp(sanitizeWebsiteBotReply(reply), trimmedMsg, true, false),
                source: 'gemini',
                detectedLanguage: lang
              });
            }
          } catch (modelErr: any) {
            console.warn(`[Hero AI Chat] Model ${model} failed:`, modelErr?.message || modelErr);
          }
        }
      }

      // Built-in Zero-Key Cloud LLM Fallback
      const cloudRes = await fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openai',
          messages: [{ role: 'user', content: fullPrompt }],
          temperature: 0.35
        })
      });
      if (cloudRes.ok) {
        const cloudJson: any = await cloudRes.json();
        const cReply = cloudJson?.choices?.[0]?.message?.content?.trim();
        if (cReply) {
          return res.json({
            reply: ensureConversationalFollowUp(sanitizeWebsiteBotReply(cReply), trimmedMsg, true, false),
            source: 'cloud-llm',
            detectedLanguage: lang
          });
        }
      }
    } catch (geminiErr) {
      console.warn('[Hero AI Chat] Gemini API error, using knowledge matcher:', geminiErr);
    }

    const fallbackReply = ensureConversationalFollowUp(getSaasIntelligentFallback(trimmedMsg, lang), trimmedMsg, true, false);
    return res.json({ reply: fallbackReply, source: 'knowledge-base', detectedLanguage: lang });
  } catch (err: any) {
    console.error('[Hero AI Chat] Internal error:', err);
    return res.status(500).json({
      reply: 'আসসালামু আলাইকুম! One Agent BD-এর মাধ্যমে আপনার WhatsApp, Messenger, Instagram ও Website-এ ২৪/৭ AI অটো-রিপ্লাই চালু করুন। আমাদের প্ল্যান শুরু মাত্র ৳১,২৫০/মাস থেকে!',
      error: err.message
    });
  }
});

// 2. Business Sandbox AI Simulator (For Visitors to Test THEIR OWN Business)
aiChatRouter.post('/business-sandbox', async (req: Request, res: Response) => {
  try {
    const {
      businessName = 'My Store',
      businessCategory = 'E-Commerce',
      products = 'Various products',
      deliveryRules = 'Inside Dhaka 60 BDT, Outside Dhaka 120 BDT',
      paymentRules = 'Cash on Delivery (COD) or bKash',
      customTone = 'Polite and helpful',
      message,
      platform = 'whatsapp',
      history = []
    } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const trimmedMsg = message.trim();
    const lang = detectLanguageMode(trimmedMsg);

    try {
      const formattedHistory = Array.isArray(history)
        ? history
            .slice(-4)
            .map((h: any) => `${h.sender === 'customer' ? 'Customer' : businessName + ' AI'}: ${h.text}`)
            .join('\n')
        : '';

      const systemPrompt = `You are the autonomous AI Sales & Customer Support Agent representing "${businessName}" (an online ${businessCategory} business).
You are answering a real customer inquiry on ${platform === 'whatsapp' ? 'WhatsApp' : 'Facebook Messenger'}.

Business Rules & Details configured by the store owner:
- Store Name: ${businessName}
- Category: ${businessCategory}
- Products & Prices: ${products}
- Delivery Guidelines & Fees: ${deliveryRules}
- Payment Methods: ${paymentRules}
- Desired Persona & Instructions: ${customTone}

RULES OF ENGAGEMENT:
1. Always adhere strictly to the store's products, prices, and delivery terms provided above.
2. If the customer is inquiring about price, size, or availability, provide exact details based on the catalog and prompt them politely to share delivery details if they want to order.
3. If the customer is providing their delivery address and phone number to place an order, celebrate their order, summarize the items, delivery charge, total price in BDT, and confirm that their order is booked!
4. Keep your answer concise (2-3 short sentences), put an empty line (\\n\\n) before your closing follow-up question, and always ask 1 relevant follow-up question!
5. CRITICAL LANGUAGE RULE: ${
        lang === 'en'
          ? 'The customer asked in English. Respond in clear, natural, and polite English.'
          : 'কাস্টমার বাংলা (Bangla) বা বাংলিশ (Banglish) এ প্রশ্ন করেছে। সর্বদা সুন্দর, মার্জিত ও প্রাকৃতিক বাংলা ভাষায় (বাংলা স্ক্রিপ্টে) উত্তর দিন।'
      }`;

      const fullPrompt = `${systemPrompt}

Chat History:
${formattedHistory || '(No previous messages)'}

Customer message: "${trimmedMsg}"

Respond directly as ${businessName}'s AI agent:`;

      let reply: string | undefined = undefined;

      const ai = getGeminiClient();
      if (ai) {
        for (const model of CANDIDATE_MODELS) {
          try {
            const response = await ai.models.generateContent({
              model,
              contents: fullPrompt
            });
            reply = response.text?.trim();
            if (reply) break;
          } catch (modelErr: any) {
            console.warn(`[Sandbox AI] Model ${model} failed:`, modelErr?.message || modelErr);
          }
        }
      }

      if (!reply) {
        const cloudRes = await fetch('https://text.pollinations.ai/openai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'openai',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: fullPrompt }
            ],
            temperature: 0.35
          })
        });
        if (cloudRes.ok) {
          const cloudJson: any = await cloudRes.json();
          reply = cloudJson?.choices?.[0]?.message?.content?.trim();
        }
      }

      let detectedOrder: any = null;
      const phoneMatch = trimmedMsg.match(/(?:(?:\+|00)88|01)?\d{9,11}/);
      const hasAddress = /mirpur|dhanmondi|gulshan|uttara|banani|chittagong|sylhet|khulna|rajshahi|barisal|rangpur|house|road|block|sector|dhaka|ঢাকা|মিরপুর|ধানমন্ডি|উত্তরা/i.test(trimmedMsg);

      if (phoneMatch || hasAddress || /confirm|order|buy|purchase|অর্ডার/i.test(trimmedMsg)) {
        detectedOrder = {
          detected: true,
          customerPhone: phoneMatch ? phoneMatch[0] : 'Identified in chat',
          addressSnippet: hasAddress ? 'Extracted from chat' : 'Mentioned by customer',
          paymentMethod: /cash|cod|ক্যাশ/i.test(trimmedMsg) ? 'Cash on Delivery' : 'Online / Mobile Banking',
          summary: `Automated order signal captured for ${businessName}`
        };
      }

      if (reply) {
        return res.json({
          reply: ensureConversationalFollowUp(formatCleanChatMessage(reply), trimmedMsg, false, true),
          detectedOrder,
          source: 'gemini'
        });
      }
    } catch (geminiErr) {
      console.warn('[Business Sandbox AI] Gemini error, falling back to local simulator:', geminiErr);
    }

    const lower = trimmedMsg.toLowerCase();
    let reply = '';
    let detectedOrder: any = null;

    if (lower.includes('price') || lower.includes('cost') || lower.includes('dam') || lower.includes('koto') || lower.includes('দাম') || lower.includes('কত')) {
      reply =
        lang === 'en'
          ? `Welcome to ${businessName}! Our products & pricing: ${products}. Delivery rules: ${deliveryRules}. Which item would you like to order?`
          : `আসসালামু আলাইকুম! ${businessName}-এ স্বাগতম। আমাদের প্রোডাক্ট ও মূল্য তালিকা: ${products}। ডেলিভারি নিয়ম: ${deliveryRules}। আপনি কোন প্রোডাক্টটি অর্ডার করতে চাচ্ছেন?`;
    } else if (lower.includes('delivery') || lower.includes('charge') || lower.includes('shipping') || lower.includes('ডেলিভারি')) {
      reply =
        lang === 'en'
          ? `Our delivery rules & charges: ${deliveryRules}. Share your full address and phone number to confirm an order!`
          : `আমাদের ডেলিভারি নিয়ম ও চার্জ: ${deliveryRules}। অর্ডার কনফার্ম করতে আপনার সম্পূর্ণ ঠিকানা ও মোবাইল নাম্বার দিন!`;
    } else if (lower.includes('order') || lower.includes('confirm') || lower.includes('01') || lower.includes('অর্ডার')) {
      reply =
        lang === 'en'
          ? `Thank you! Your order with ${businessName} has been booked! 🛍️\n• Delivery: ${deliveryRules}\n• Payment: ${paymentRules}\nOur team will contact you shortly.`
          : `ধন্যবাদ! ${businessName}-এ আপনার অর্ডারটি সফলভাবে এন্ট্রি হয়েছে। 🛍️\n• ডেলিভারি: ${deliveryRules}\n• পেমেন্ট: ${paymentRules}\nআমাদের প্রতিনিধি শীঘ্রই আপনার নাম্বারে যোগাযোগ করবেন!`;

      detectedOrder = {
        detected: true,
        customerPhone: trimmedMsg.match(/01\d{9}/)?.[0] || 'Captured from chat',
        addressSnippet: 'Captured from message',
        paymentMethod: paymentRules,
        summary: `Order automatically created in Orders Hub for ${businessName}`
      };
    } else {
      reply =
        lang === 'en'
          ? `Welcome to ${businessName}! Our products: ${products}. Delivery: ${deliveryRules}. How can I help you today?`
          : `আসসালামু আলাইকুম! ${businessName}-এ যোগাযোগ করার জন্য ধন্যবাদ। আমাদের প্রোডাক্টসমূহ: ${products}। ডেলিভারি: ${deliveryRules}। আপনাকে কীভাবে সাহায্য করতে পারি?`;
    }

    return res.json({
      reply,
      detectedOrder,
      source: 'sandbox-engine'
    });
  } catch (err: any) {
    console.error('[Business Sandbox AI] Error:', err);
    return res.status(500).json({
      reply: 'আসসালামু আলাইকুম! আপনার অর্ডারের বিষয়ে কীভাবে সাহায্য করতে পারি?',
      error: err.message
    });
  }
});
