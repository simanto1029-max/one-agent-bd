import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { getAuthenticatedUser } from './auth.js';
import { getUserSubscriptionStatus } from '../services/subscriptionService.js';

export const subscriptionsRouter = Router();

// GET /api/subscriptions/current
subscriptionsRouter.get('/current', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const status = getUserSubscriptionStatus(user.id);
  return res.json(status);
});

// GET /api/subscriptions/upgrade-quote - Calculate proration and remaining fee to upgrade from Starter to Pro
subscriptionsRouter.get('/upgrade-quote', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const status = getUserSubscriptionStatus(user.id);
  const currentPlanId = status.planId || 'plan_starter';
  const targetPlanId = (req.query.targetPlanId as string) || 'plan_pro';

  const currentPlan = db.getPlanById(currentPlanId) || { id: 'plan_starter', price: 1250, name: 'Starter AI Plan' };
  const targetPlan = db.getPlanById(targetPlanId) || { id: 'plan_pro', price: 1950, name: 'Pro Business Plan' };

  const currentSub = db.getSubscriptionByUserId(user.id);
  const now = new Date();
  let daysRemaining = status.daysRemaining || 0;
  if (currentSub?.end_date) {
    const end = new Date(currentSub.end_date);
    daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  const isCurrentStarter =
    currentPlanId === 'plan_starter' ||
    ((!status.isProPlan || status.planName?.toLowerCase().includes('starter')) && !status.isExpired);
  const baseStarterPrice = currentPlan.price || 1250;
  const baseProPrice = targetPlan.price || 1950;
  const flatDifference = Math.max(0, baseProPrice - baseStarterPrice); // 700 BDT flat monthly difference

  // Prorated difference based on remaining days of the current 30-day billing cycle:
  // e.g. If 20 days remaining out of 30: (20 / 30) * 700 = ~467 BDT
  const proratedDifference =
    daysRemaining > 0 && daysRemaining < 30
      ? Math.max(150, Math.round((daysRemaining / 30) * flatDifference))
      : flatDifference;

  // Unused credit if renewing for a brand-new full 30-day month from today:
  const unusedStarterCredit =
    daysRemaining > 0 ? Math.round((Math.min(30, daysRemaining) / 30) * baseStarterPrice) : 0;
  const renewWithCreditPrice = Math.max(flatDifference, baseProPrice - unusedStarterCredit);

  return res.json({
    canUpgrade: isCurrentStarter,
    currentPlanId,
    currentPlanName: currentPlan.name,
    targetPlanId: targetPlan.id || 'plan_pro',
    targetPlanName: targetPlan.name || 'Pro Business Plan',
    daysRemaining,
    currentPlanPrice: baseStarterPrice,
    targetPlanPrice: baseProPrice,
    flatDifference, // 700 BDT (Upgrades current cycle to Pro)
    proratedDifference, // Prorated remaining days difference
    unusedStarterCredit,
    renewWithCreditPrice, // Full month Pro with credit deducted
    upgradeEndDate: currentSub?.end_date || new Date(now.getTime() + 30 * 86400000).toISOString()
  });
});

// GET /api/subscriptions/all - Admin only
subscriptionsRouter.get('/all', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  const subs = db.getSubscriptions().map((s) => {
    const profile = db.getProfileById(s.user_id);
    const plan = db.getPlanById(s.plan_id);
    return {
      ...s,
      user_email: profile?.email,
      user_name: profile?.full_name,
      plan_name: plan?.name,
      price: plan?.price,
      currency: plan?.currency
    };
  });

  return res.json(subs);
});

// POST /api/subscriptions/switch-plan - Switch plan for testing or demo upgrade (Admin only)
subscriptionsRouter.post('/switch-plan', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const profile = db.getProfileById(user.id);
  if (profile?.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied: Only administrators can use the demo plan switcher. Please purchase an official subscription plan.'
    });
  }

  const { planId } = req.body;
  const isTrialSwitch = planId === 'trial' || planId === 'free_trial';
  const targetPlanId =
    planId === 'plan_pro' || planId === 'plan_pro_yearly' ? 'plan_pro' : 'plan_starter';
  const plan = db.getPlanById(targetPlanId);

  const currentSub = db.getSubscriptionByUserId(user.id);
  const now = new Date();
  const futureEnd = new Date(
    now.getTime() + (isTrialSwitch ? 2 : 30) * 86400000
  ).toISOString();

  if (currentSub) {
    db.updateSubscription(currentSub.id, {
      plan_id: isTrialSwitch ? 'plan_pro' : targetPlanId,
      status: isTrialSwitch ? 'trialing' : 'active',
      start_date: now.toISOString(),
      end_date: futureEnd,
      ...(isTrialSwitch
        ? { demo_plan_override: undefined }
        : { demo_plan_override: targetPlanId })
    } as any);
  } else {
    db.createSubscription({
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: user.id,
      plan_id: isTrialSwitch ? 'plan_pro' : targetPlanId,
      status: isTrialSwitch ? 'trialing' : 'active',
      start_date: now.toISOString(),
      end_date: futureEnd,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      ...(isTrialSwitch
        ? { demo_plan_override: undefined }
        : { demo_plan_override: targetPlanId })
    } as any);
  }

  const status = getUserSubscriptionStatus(user.id);
  return res.json({
    status,
    message: isTrialSwitch
      ? '2-Day Free Trial activated (All features unlocked)!'
      : `Plan successfully switched to ${plan ? plan.name : targetPlanId}!`
  });
});

// POST /api/subscriptions/start-trial - Activate 2-Day Free Trial for selected plan (All features unlocked during 2-day trial)
subscriptionsRouter.post('/start-trial', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const targetPlanId = 'plan_pro'; // Full Pro features unlocked during trial
  const plan = db.getPlanById('plan_pro') || db.getPlans()[0];

  const currentSub = db.getSubscriptionByUserId(user.id);
  const now = new Date();

  if (currentSub) {
    const existingEnd = new Date(currentSub.end_date);
    const isAlreadyExpired = currentSub.status === 'expired' || now >= existingEnd;

    if (isAlreadyExpired) {
      const status = getUserSubscriptionStatus(user.id);
      return res.status(400).json({
        error: 'Your 2-day free trial has already ended. Please purchase a subscription plan to continue service.',
        status
      });
    }

    // If currently trialing and not expired, keep the existing end date strictly
    const status = getUserSubscriptionStatus(user.id);
    return res.json({
      status,
      message: `Your 2-day free trial is currently active until ${new Date(currentSub.end_date).toLocaleString()}.`
    });
  } else {
    const trialEnd = new Date(now.getTime() + 2 * 86400000).toISOString();
    db.createSubscription({
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: user.id,
      plan_id: targetPlanId,
      status: 'trialing',
      start_date: now.toISOString(),
      end_date: trialEnd,
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    });
  }

  const status = getUserSubscriptionStatus(user.id);
  return res.json({
    status,
    message: `2-Day Free Trial active for ${plan ? plan.name : 'your plan'}! All features are unlocked.`
  });
});


