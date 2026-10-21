import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { getAuthenticatedUser } from './auth.js';

export const settingsRouter = Router();

// GET /api/settings/public - Public branding & system settings (logo_url, site_name, promo_video_url, etc.)
settingsRouter.get('/public', (_req: Request, res: Response) => {
  const s = db.getSettings();
  return res.json({
    site_name: s.site_name || 'One Agent BD',
    site_tagline: s.site_tagline || 'AI Sales Platform',
    logo_url: s.logo_url || '',
    promo_video_url: s.promo_video_url || 'https://www.youtube.com/watch?v=aircAruvnKk',
    promo_video_thumbnail:
      s.promo_video_thumbnail ||
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85',
    support_email: s.support_email || 'support@oneagentbd.online',
    bkash_number: s.bkash_number || '',
    nagad_number: s.nagad_number || ''
  });
});

// PUT /api/settings/promo-video - Dedicated endpoint for updating landing page promo video & thumbnail
settingsRouter.put('/promo-video', async (req: Request, res: Response) => {
  const current = db.getSettings();
  const { promo_video_url, promo_video_thumbnail } = req.body;

  const updated = db.updateSettings({
    promo_video_url:
      promo_video_url !== undefined ? String(promo_video_url).trim() : current.promo_video_url,
    promo_video_thumbnail:
      promo_video_thumbnail !== undefined
        ? String(promo_video_thumbnail).trim()
        : current.promo_video_thumbnail
  });

  await db.flushToSupabase().catch(() => {});

  return res.json({
    success: true,
    promo_video_url: updated.promo_video_url,
    promo_video_thumbnail: updated.promo_video_thumbnail,
    settings: updated,
    message: 'Promo video & thumbnail saved successfully'
  });
});

// GET /api/settings/reviews - Public list of approved customer reviews
settingsRouter.get('/reviews', (_req: Request, res: Response) => {
  return res.json({
    reviews: db.getApprovedReviews()
  });
});

// GET /api/settings/notifications - Active broadcast announcements for merchant dashboards
settingsRouter.get('/notifications', (_req: Request, res: Response) => {
  return res.json({
    notifications: db.getActiveNotifications()
  });
});

// POST /api/settings/reviews - Public endpoint for users to submit a review (pending admin approval)
settingsRouter.post('/reviews', (req: Request, res: Response) => {
  const { name, role, business, rating, review_text, avatar_url } = req.body;
  const cleanName = String(name || '').trim();
  const cleanText = String(review_text || '').trim();
  if (!cleanName || !cleanText) {
    return res.status(400).json({ error: 'Name and review text are required.' });
  }

  const numericRating = Math.min(5, Math.max(1, Number(rating) || 5));
  const created = db.createReview({
    id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: cleanName,
    role: String(role || 'Merchant').trim() || 'Merchant',
    business: String(business || 'Verified Store').trim() || 'Verified Store',
    avatar_url: String(avatar_url || '').trim(),
    rating: numericRating,
    review_text: cleanText,
    status: 'pending',
    created_at: new Date().toISOString()
  });

  return res.status(201).json({
    success: true,
    review: created,
    message: 'Your review has been submitted and is pending admin approval.'
  });
});

// GET /api/settings/llm
settingsRouter.get('/llm', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const sysSettings = db.getSettings() as any;
  const rawUserKey = (user.llm_api_key || '').trim();
  const rawSysKey = user.role === 'admin' ? (sysSettings?.default_llm_api_key || '').trim() : '';
  const cleanUserKey = rawUserKey.startsWith('sk-proj-wJiInvQ') ? '' : rawUserKey;
  const cleanSysKey = rawSysKey.startsWith('sk-proj-wJiInvQ') ? '' : rawSysKey;
  const savedKey = cleanUserKey || cleanSysKey;

  const savedPrompt =
    (user.system_prompt &&
      !user.system_prompt.includes('You are an executive AI assistant for One Agent BD') &&
      !user.system_prompt.includes('Subscription Plan: All-in-One Plan 1,450 BDT/month') &&
      !user.system_prompt.includes('Subscription Plans: Standard Plan 899 BDT/month')
      ? user.system_prompt
      : '') ||
    (user.role === 'admin' && sysSettings?.default_system_prompt ? sysSettings.default_system_prompt : user.system_prompt);

  return res.json({
    llm_provider: user.llm_provider || 'gemini',
    llm_api_key: savedKey,
    system_prompt: savedPrompt,
    has_custom_key: Boolean(savedKey),
    masked_key: savedKey ? `••••••••${savedKey.slice(-4)}` : null,
    default_env_gemini_active: Boolean(process.env.GEMINI_API_KEY || cleanSysKey)
  });
});

// PUT /api/settings/llm
settingsRouter.put('/llm', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { llm_provider, llm_api_key, clear_api_key, system_prompt } = req.body;
  const updates: any = {};

  if (llm_provider) updates.llm_provider = llm_provider;
  if (system_prompt !== undefined) updates.system_prompt = system_prompt;

  if (clear_api_key === true) {
    updates.llm_api_key = '';
  } else if (typeof llm_api_key === 'string' && llm_api_key.trim().length > 0) {
    const trimmed = llm_api_key.trim();
    updates.llm_api_key = trimmed.startsWith('sk-proj-wJiInvQ') ? '' : trimmed;
  }

  const updated = db.updateProfile(user.id, updates);

  if (user.role === 'admin') {
    const settingsPatch: Record<string, any> = {};
    if (updates.llm_api_key !== undefined) {
      settingsPatch.default_llm_api_key = updates.llm_api_key;
    }
    if (updates.system_prompt !== undefined) {
      settingsPatch.default_system_prompt = updates.system_prompt;
    }
    if (Object.keys(settingsPatch).length > 0) {
      db.updateSettings(settingsPatch as any);
    }

    // Keep all admin profiles in sync so any connected channel under an admin account uses the same key & prompt
    for (const prof of db.getProfiles()) {
      if (prof.role === 'admin' && prof.id !== user.id) {
        db.updateProfile(prof.id, updates);
      }
    }
  }

  await db.flushToSupabase().catch(() => {});

  const effectiveKey =
    (updated?.llm_api_key && updated.llm_api_key.trim()) ||
    (user.role === 'admin' ? ((db.getSettings() as any)?.default_llm_api_key || '').trim() : '');

  return res.json({
    message: 'AI settings updated successfully',
    llm_provider: updated?.llm_provider || 'gemini',
    llm_api_key: effectiveKey,
    system_prompt: updated?.system_prompt || '',
    has_custom_key: Boolean(effectiveKey),
    masked_key: effectiveKey ? `••••••••${effectiveKey.slice(-4)}` : null
  });
});

// GET /api/settings/instant-rules - Fetch merchant's Instant FAQ & Cost-Saver Rules
settingsRouter.get('/instant-rules', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const profile = db.getProfileById(user.id);
  const defaultRules = [
    {
      id: 'rule_delivery',
      name: 'ডেলিভারি চার্জ ও সময় (সারা বাংলাদেশ)',
      keywords: ['delivery', 'ডেলিভারি', 'চার্জ', 'ডেলিভারি চার্জ', 'খরচ', 'khoroch', 'delivery fee', 'koto tk', 'কত টাকা', 'কতো', 'delivery koto'],
      reply_text: 'আমাদের ডেলিভারি চার্জ: ঢাকা সিটির ভিতরে মাত্র ৳৮০, এবং ঢাকার বাইরে সারাদেশে ৳১৫০। ২-৩ কার্যদিবসের মধ্যে দ্রুততম হোম ডেলিভারি পৌঁছে যাবে ইনশাআল্লাহ।',
      is_active: true,
      category: 'delivery'
    },
    {
      id: 'rule_payment',
      name: 'পেমেন্ট ও বিকাশ/নগদ মার্চেন্ট নাম্বার',
      keywords: ['bkash', 'বিকাশ', 'nagad', 'নগদ', 'payment', 'পেমেন্ট', 'টাকা পাঠাবো', 'advance', 'অগ্রিম'],
      reply_text: 'আপনি ক্যাশ অন ডেলিভারিতে সম্পূর্ণ নিশ্চিন্তে প্রোডাক্ট হাতে পেয়ে মূল্য পরিশোধ করতে পারবেন। অথবা আমাদের bKash/Nagad মার্চেন্ট নম্বরে অগ্রিম পে করতে পারেন।',
      is_active: true,
      category: 'payment'
    },
    {
      id: 'rule_order',
      name: 'কিভাবে অর্ডার করব / অর্ডার কনফার্মেশন',
      keywords: ['order', 'অর্ডার', 'order confirm', 'কিভাবে অর্ডার', 'kivabe order', 'বুকিং'],
      reply_text: 'অর্ডার করতে আপনার পছন্দের প্রোডাক্টের নাম/সাইজ, সম্পূর্ণ ডেলিভারি ঠিকানা এবং একটি সচল মোবাইল নাম্বার পাঠিয়ে দিন। আমাদের প্রতিনিধি দ্রুত কনফার্ম করে নিবেন।',
      is_active: true,
      category: 'order'
    },
    {
      id: 'rule_location',
      name: 'শোরুম / শপ লোকেশন ও রিটার্ন পলিসি',
      keywords: ['showroom', 'শোরুম', 'দোকান', 'shop', 'ঠিকানা', 'location', 'কোথায়', 'return', 'রিটার্ন'],
      reply_text: 'আমরা সারা বাংলাদেশে দ্রুততম হোম ডেলিভারি সার্ভিস দিয়ে থাকি। প্রোডাক্ট হাতে পেয়ে দেখে চেক করে মূল্য পরিশোধ করতে পারবেন। কোনো সমস্যা হলে সাথে সাথে এক্সচেঞ্জ বা রিটার্ন সুবিধা রয়েছে।',
      is_active: true,
      category: 'policy'
    }
  ];

  const savedRules = (profile as any)?.instant_faq_rules || defaultRules;
  const costSaverActive = (profile as any)?.instant_rules_active !== false;
  const triggeredCount = (profile as any)?.instant_rules_triggered_count || 48;

  return res.json({
    rules: savedRules,
    cost_saver_active: costSaverActive,
    triggered_count: triggeredCount
  });
});

// PUT /api/settings/instant-rules - Save merchant's Instant FAQ & Cost-Saver Rules
settingsRouter.put('/instant-rules', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { rules, cost_saver_active } = req.body;
  const updates: any = {};
  if (Array.isArray(rules)) updates.instant_faq_rules = rules;
  if (typeof cost_saver_active === 'boolean') updates.instant_rules_active = cost_saver_active;

  db.updateProfile(user.id, updates);
  await db.flushToSupabase().catch(() => {});

  return res.json({
    success: true,
    message: 'Instant FAQ & Cost-Saver Rules updated successfully',
    rules: updates.instant_faq_rules,
    cost_saver_active: updates.instant_rules_active
  });
});

// GET /api/settings/credits - Full WhatsApp & Multichannel Quota / Ledger Calculation
settingsRouter.get('/credits', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { getUserSubscriptionStatus } = await import('../services/subscriptionService.js');
  const subStatus = getUserSubscriptionStatus(user.id);
  const profile = db.getProfileById(user.id);
  const allMessages = db.getMessages(user.id);

  const waMessages = allMessages.filter(m => m.platform === 'whatsapp');
  const fbMessages = allMessages.filter(m => m.platform === 'messenger' || (m.platform as any) === 'facebook');
  const igMessages = allMessages.filter(m => m.platform === 'instagram');
  const instantRulesTriggered = (profile as any)?.instant_rules_triggered_count || 48;

  return res.json({
    whatsapp: {
      total_quota: subStatus.whatsappCreditsTotal,
      used: subStatus.whatsappCreditsUsed,
      remaining: subStatus.whatsappCreditsRemaining,
      percent_used: Math.min(100, Math.round((subStatus.whatsappCreditsUsed / Math.max(1, subStatus.whatsappCreditsTotal)) * 100))
    },
    facebook: {
      is_unlimited: true,
      total_sent: fbMessages.length
    },
    instagram: {
      is_unlimited: true,
      total_sent: igMessages.length
    },
    instant_rules: {
      triggered_count: instantRulesTriggered,
      credits_saved: instantRulesTriggered,
      estimated_savings_bdt: Math.round(instantRulesTriggered * 1.5)
    },
    plan: {
      id: subStatus.planId,
      name: subStatus.planName,
      price: subStatus.price,
      days_remaining: subStatus.daysRemaining,
      is_trial: subStatus.isTrialActive,
      is_expired: subStatus.isExpired
    }
  });
});
