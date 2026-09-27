import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { getAuthenticatedUser } from './auth.js';
import { runSubscriptionExpiryCheck } from '../services/subscriptionService.js';

export const adminRouter = Router();

// Middleware: verify admin role
function requireAdmin(req: Request, res: Response, next: Function) {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Administrator privileges required.' });
  }
  next();
}

adminRouter.use(requireAdmin);

// GET /api/admin/metrics - Overview dashboard data
adminRouter.get('/metrics', (req: Request, res: Response) => {
  runSubscriptionExpiryCheck();
  const profiles = db.getProfiles();
  const subs = db.getSubscriptions();
  const payments = db.getPayments();
  const messages = db.getAllMessages();
  const channels = db.getChannels();

  const totalUsers = profiles.length;
  const activeSubs = subs.filter((s) => s.status === 'active').length;
  const trialUsers = subs.filter((s) => s.status === 'trialing').length;
  const expiredUsers = subs.filter((s) => s.status === 'expired').length;

  const totalRevenue = payments
    .filter((p) => p.status === 'approved')
    .reduce((acc, p) => acc + Number(p.amount), 0);

  const pendingPaymentsCount = payments.filter((p) => p.status === 'pending').length;
  const totalMessages = messages.length;
  const aiRepliesCount = messages.filter((m) => m.is_ai_reply).length;

  // Platform distribution
  const waChannels = channels.filter((c) => c.platform === 'whatsapp').length;
  const fbChannels = channels.filter((c) => c.platform === 'messenger').length;

  // Recent activity stream
  const recentPayments = payments.slice(0, 5).map((p) => {
    const user = db.getProfileById(p.user_id);
    return {
      id: p.id,
      type: 'payment',
      title: `${p.method.toUpperCase()} Tk ${p.amount}`,
      user: user?.email || p.user_id,
      status: p.status,
      date: p.submitted_at
    };
  });

  return res.json({
    metrics: {
      totalUsers,
      activeSubs,
      trialUsers,
      expiredUsers,
      totalRevenue,
      pendingPaymentsCount,
      totalMessages,
      aiRepliesCount,
      channelsCount: {
        total: channels.length,
        whatsapp: waChannels,
        messenger: fbChannels
      }
    },
    recentPayments,
    settings: db.getSettings()
  });
});

// GET /api/admin/users - Users management list
adminRouter.get('/users', (req: Request, res: Response) => {
  runSubscriptionExpiryCheck();
  const profiles = db.getProfiles();
  const usersWithDetails = profiles.map((p) => {
    const sub = db.getSubscriptionByUserId(p.id);
    const plan = sub ? db.getPlanById(sub.plan_id) : null;
    const channels = db.getChannels(p.id);
    const messages = db.getMessages(p.id);

    return {
      ...p,
      subscription: sub
        ? {
            status: sub.status,
            planName: plan?.name || 'Standard',
            endDate: sub.end_date
          }
        : null,
      channelsCount: channels.length,
      messagesCount: messages.length
    };
  });

  return res.json(usersWithDetails);
});

// POST /api/admin/users/:id/suspend - Suspend or reactivate user
adminRouter.post('/users/:id/suspend', (req: Request, res: Response) => {
  const profile = db.getProfileById(req.params.id);
  if (!profile) {
    return res.status(404).json({ error: 'User not found' });
  }

  const updated = db.updateProfile(req.params.id, {
    is_suspended: !profile.is_suspended
  });

  return res.json({
    success: true,
    user: updated,
    message: updated?.is_suspended ? 'User account suspended' : 'User account reactivated'
  });
});

// POST /api/admin/users/:id/role - Promote/demote role
adminRouter.post('/users/:id/role', (req: Request, res: Response) => {
  const { role } = req.body;
  if (role !== 'admin' && role !== 'user') {
    return res.status(400).json({ error: 'Role must be user or admin' });
  }

  const updated = db.updateProfile(req.params.id, { role });
  return res.json({
    success: true,
    user: updated,
    message: `User role changed to ${role}`
  });
});

// GET /api/admin/settings - System settings & cron status
adminRouter.get('/settings', (req: Request, res: Response) => {
  return res.json(db.getSettings());
});

// PUT /api/admin/settings - Update system settings
adminRouter.put('/settings', (req: Request, res: Response) => {
  const current = db.getSettings();
  const {
    site_name,
    site_tagline,
    logo_url,
    promo_video_url,
    promo_video_thumbnail,
    bkash_number,
    nagad_number,
    support_email,
    meta_description,
    meta_app_id,
    meta_app_secret,
    meta_verify_token
  } = req.body;

  const updated = db.updateSettings({
    site_name: site_name !== undefined ? site_name : current.site_name,
    site_tagline: site_tagline !== undefined ? site_tagline : current.site_tagline,
    logo_url: logo_url !== undefined ? logo_url : current.logo_url,
    promo_video_url: promo_video_url !== undefined ? promo_video_url : current.promo_video_url,
    promo_video_thumbnail:
      promo_video_thumbnail !== undefined ? promo_video_thumbnail : current.promo_video_thumbnail,
    bkash_number: bkash_number !== undefined ? bkash_number : current.bkash_number,
    nagad_number: nagad_number !== undefined ? nagad_number : current.nagad_number,
    support_email: support_email !== undefined ? support_email : current.support_email,
    meta_description: meta_description !== undefined ? meta_description : current.meta_description,
    meta_app_id: meta_app_id !== undefined ? meta_app_id.trim() : current.meta_app_id,
    meta_app_secret: meta_app_secret !== undefined ? meta_app_secret.trim() : current.meta_app_secret,
    meta_verify_token: meta_verify_token !== undefined ? meta_verify_token.trim() : current.meta_verify_token
  });

  return res.json({
    success: true,
    settings: updated,
    message: 'System settings saved successfully'
  });
});

// POST /api/admin/cron/run-expiry - Manually trigger subscription expiry cron check
adminRouter.post('/cron/run-expiry', (req: Request, res: Response) => {
  const result = runSubscriptionExpiryCheck();
  return res.json({
    success: true,
    ...result,
    message: `Subscription check completed: ${result.expiredCount} expired subscriptions updated.`
  });
});

// POST /api/admin/security/credentials - Update admin email & password securely
adminRouter.post('/security/credentials', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }

  const { newEmail, newPassword } = req.body;
  if (!newEmail && !newPassword) {
    return res.status(400).json({ error: 'Provide a new email or new password.' });
  }

  if (newPassword && newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const updates: any = {};
  if (newEmail) {
    const cleanEmail = newEmail.trim().toLowerCase();
    const existing = db.getProfileByEmail(cleanEmail);
    if (existing && existing.id !== user.id) {
      return res.status(400).json({ error: 'Email is already used by another user.' });
    }
    updates.email = cleanEmail;
  }
  if (newPassword) {
    updates.password = newPassword;
  }

  const updated = db.updateProfile(user.id, updates);

  return res.json({
    success: true,
    message: 'Admin credentials successfully updated! Please use your new login credentials next time.',
    user: updated
  });
});

// GET /api/admin/coupons - List all coupon codes
adminRouter.get('/coupons', (_req: Request, res: Response) => {
  return res.json(db.getCoupons());
});

// GET /api/admin/reviews - List all reviews (approved + pending)
adminRouter.get('/reviews', (_req: Request, res: Response) => {
  return res.json({
    reviews: db.getAllReviews()
  });
});

// POST /api/admin/reviews/:id/approve - Accept/Approve a review to display on website
adminRouter.post('/reviews/:id/approve', (req: Request, res: Response) => {
  const updated = db.updateReviewStatus(req.params.id, 'approved');
  if (!updated) {
    return res.status(404).json({ error: 'Review not found' });
  }
  return res.json({
    success: true,
    review: updated,
    message: 'Review approved and published on the website.'
  });
});

// DELETE /api/admin/reviews/:id - Remove/Delete any review from website
adminRouter.delete('/reviews/:id', (req: Request, res: Response) => {
  const deleted = db.deleteReview(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Review not found' });
  }
  return res.json({
    success: true,
    id: req.params.id,
    message: 'Review removed successfully.'
  });
});

// POST /api/admin/coupons - Create a new coupon code
adminRouter.post('/coupons', (req: Request, res: Response) => {
  const { code, discount_type, discount_value, min_amount, max_uses, is_active, expires_at } = req.body;
  const cleanCode = String(code || '').trim().toUpperCase();

  if (!cleanCode) {
    return res.status(400).json({ error: 'Coupon code is required.' });
  }
  if (discount_value === undefined || Number(discount_value) <= 0) {
    return res.status(400).json({ error: 'Discount value must be greater than 0.' });
  }

  const existing = db.getCouponByCode(cleanCode);
  if (existing) {
    return res.status(400).json({ error: `Coupon code "${cleanCode}" already exists.` });
  }

  let parsedExpiresAt: string | undefined = undefined;
  if (expires_at && String(expires_at).trim()) {
    const dt = new Date(expires_at);
    if (!isNaN(dt.getTime())) {
      parsedExpiresAt = dt.toISOString();
    }
  }

  const now = new Date().toISOString();
  const coupon = db.createCoupon({
    id: `cpn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    code: cleanCode,
    discount_type: discount_type === 'fixed' ? 'fixed' : 'percentage',
    discount_value: Number(discount_value),
    min_amount: min_amount ? Number(min_amount) : 0,
    max_uses: max_uses ? Number(max_uses) : 0,
    used_count: 0,
    is_active: is_active !== undefined ? Boolean(is_active) : true,
    expires_at: parsedExpiresAt,
    created_at: now,
    updated_at: now
  });

  return res.status(201).json(coupon);
});

// PUT /api/admin/coupons/:id - Update coupon code
adminRouter.put('/coupons/:id', (req: Request, res: Response) => {
  const { code, discount_type, discount_value, min_amount, max_uses, is_active, expires_at } = req.body;
  const updates: any = {};

  if (code !== undefined) updates.code = String(code).trim().toUpperCase();
  if (discount_type !== undefined) updates.discount_type = discount_type === 'fixed' ? 'fixed' : 'percentage';
  if (discount_value !== undefined) updates.discount_value = Number(discount_value);
  if (min_amount !== undefined) updates.min_amount = Number(min_amount);
  if (max_uses !== undefined) updates.max_uses = Number(max_uses);
  if (is_active !== undefined) updates.is_active = Boolean(is_active);
  if (expires_at !== undefined) {
    if (!expires_at || !String(expires_at).trim()) {
      updates.expires_at = undefined;
    } else {
      const dt = new Date(expires_at);
      if (!isNaN(dt.getTime())) {
        updates.expires_at = dt.toISOString();
      }
    }
  }

  const updated = db.updateCoupon(req.params.id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Coupon not found.' });
  }

  return res.json(updated);
});

// DELETE /api/admin/coupons/:id - Delete coupon code
adminRouter.delete('/coupons/:id', (req: Request, res: Response) => {
  const deleted = db.deleteCoupon(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Coupon not found.' });
  }
  return res.json({ success: true, id: req.params.id });
});

// GET /api/admin/notifications - List all admin broadcast notifications
adminRouter.get('/notifications', (_req: Request, res: Response) => {
  return res.json({
    notifications: db.getNotifications()
  });
});

// POST /api/admin/notifications - Create a new broadcast notification for merchant dashboards
adminRouter.post('/notifications', (req: Request, res: Response) => {
  const { title, message, type, action_label, action_tab, is_active } = req.body;
  const cleanTitle = String(title || '').trim();
  const cleanMessage = String(message || '').trim();

  if (!cleanTitle || !cleanMessage) {
    return res.status(400).json({ error: 'Notification title and message are required.' });
  }

  const validTypes = ['info', 'promo', 'warning', 'maintenance'];
  const safeType = validTypes.includes(type) ? type : 'info';

  const created = db.createNotification({
    id: `ntf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: cleanTitle,
    message: cleanMessage,
    type: safeType,
    action_label: String(action_label || '').trim(),
    action_tab: String(action_tab || '').trim(),
    is_active: is_active !== undefined ? Boolean(is_active) : true,
    created_at: new Date().toISOString()
  });

  return res.status(201).json({
    success: true,
    notification: created,
    message: 'Broadcast notification published to merchant dashboards.'
  });
});

// PATCH /api/admin/notifications/:id - Toggle active status or update notification
adminRouter.patch('/notifications/:id', (req: Request, res: Response) => {
  const { title, message, type, action_label, action_tab, is_active } = req.body;
  const updates: any = {};

  if (title !== undefined) updates.title = String(title).trim();
  if (message !== undefined) updates.message = String(message).trim();
  if (type !== undefined) updates.type = type;
  if (action_label !== undefined) updates.action_label = String(action_label).trim();
  if (action_tab !== undefined) updates.action_tab = String(action_tab).trim();
  if (is_active !== undefined) updates.is_active = Boolean(is_active);

  const updated = db.updateNotification(req.params.id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Notification not found.' });
  }

  return res.json({
    success: true,
    notification: updated
  });
});

// DELETE /api/admin/notifications/:id - Remove a broadcast notification
adminRouter.delete('/notifications/:id', (req: Request, res: Response) => {
  const deleted = db.deleteNotification(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Notification not found.' });
  }

  return res.json({
    success: true,
    id: req.params.id
  });
});




