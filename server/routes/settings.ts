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

  const savedKey =
    (user.llm_api_key && user.llm_api_key.trim()) ||
    (user.role === 'admin' ? ((db.getSettings() as any)?.default_llm_api_key || '').trim() : '');

  return res.json({
    llm_provider: user.llm_provider || 'gemini',
    llm_api_key: savedKey,
    system_prompt: user.system_prompt,
    has_custom_key: Boolean(savedKey),
    masked_key: savedKey ? `••••••••${savedKey.slice(-4)}` : null,
    default_env_gemini_active: Boolean(process.env.GEMINI_API_KEY)
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
    updates.llm_api_key = llm_api_key.trim();
  }

  const updated = db.updateProfile(user.id, updates);

  if (user.role === 'admin' && updates.llm_api_key !== undefined) {
    db.updateSettings({ default_llm_api_key: updates.llm_api_key } as any);
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
