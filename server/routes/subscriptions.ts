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

// POST /api/subscriptions/switch-plan - Switch plan for testing or demo upgrade
subscriptionsRouter.post('/switch-plan', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
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
      plan_id: targetPlanId,
      status: isTrialSwitch ? 'trialing' : 'active',
      start_date: now.toISOString(),
      end_date: futureEnd
    });
  } else {
    db.createSubscription({
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: user.id,
      plan_id: targetPlanId,
      status: isTrialSwitch ? 'trialing' : 'active',
      start_date: now.toISOString(),
      end_date: futureEnd,
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    });
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

  const { planId } = req.body;
  const targetPlanId = planId && String(planId).includes('pro') ? 'plan_pro' : 'plan_starter';
  const plan = db.getPlanById(targetPlanId) || db.getPlans()[0];

  const currentSub = db.getSubscriptionByUserId(user.id);
  const now = new Date();

  if (currentSub) {
    const existingEnd = new Date(currentSub.end_date);
    const isAlreadyExpired = currentSub.status === 'expired' || now > existingEnd;

    if (isAlreadyExpired) {
      const status = getUserSubscriptionStatus(user.id);
      return res.status(400).json({
        error: 'Your 2-day free trial has already ended. Please purchase a subscription plan to continue service.',
        status
      });
    }

    const trialEnd =
      currentSub.status === 'trialing' && existingEnd > now
        ? currentSub.end_date
        : new Date(now.getTime() + 2 * 86400000).toISOString();

    db.updateSubscription(currentSub.id, {
      plan_id: targetPlanId,
      status: 'trialing',
      end_date: trialEnd
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


