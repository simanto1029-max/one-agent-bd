import { db, Subscription } from '../db/database.js';

export interface SubscriptionStatusInfo {
  subscription?: Subscription;
  planId: string;
  planName: string;
  price: number;
  currency: string;
  isProPlan: boolean;
  canAccessStores: boolean;
  featureConfig?: any;
  daysRemaining: number;
  hoursRemaining: number;
  msRemaining: number;
  serverTime: string;
  isExpired: boolean;
  isGated: boolean;
  canAccessDashboard: boolean;
}

export function getUserSubscriptionStatus(userId: string): SubscriptionStatusInfo {
  let sub = db.getSubscriptionByUserId(userId);
  const now = new Date();

  // If user has no subscription, create a trial based on default active plan
  if (!sub) {
    const plans = db.getActivePlans();
    const defaultPlan = plans[0] || db.getPlans()[0];
    const trialDays = defaultPlan ? defaultPlan.trial_days : 2;

    const startDate = now.toISOString();
    const endDate = new Date(now.getTime() + trialDays * 86400000).toISOString();

    sub = db.createSubscription({
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      plan_id: defaultPlan ? defaultPlan.id : 'plan_starter',
      status: 'trialing',
      start_date: startDate,
      end_date: endDate,
      created_at: startDate,
      updated_at: startDate
    });
  }

  // Check if expired
  const profile = db.getProfileById(userId);
  const isAdmin = profile?.role === 'admin';
  let endDate = new Date(sub.end_date);
  let isPastEnd = now.getTime() >= endDate.getTime();

  // Ensure Admin accounts never expire so official SaaS channels stay 24/7 active
  if (isAdmin && isPastEnd) {
    const newAdminEnd = new Date(now.getTime() + 365 * 86400000).toISOString();
    sub =
      db.updateSubscription(sub.id, {
        status: 'active',
        end_date: newAdminEnd
      }) || sub;
    endDate = new Date(sub.end_date);
    isPastEnd = false;
  } else if (isPastEnd && (sub.status === 'trialing' || sub.status === 'active')) {
    sub = db.updateSubscription(sub.id, {
      status: 'expired'
    }) || sub;
  }

  const plan = db.getPlanById(sub.plan_id) || {
    name: 'Starter AI Plan',
    price: 1250,
    currency: 'BDT',
    trial_days: 2,
    duration_days: 30,
    feature_config: {
      website_stores: true,
      call_requests: true,
      vip_broadcast: true,
      courier_dispatch: true,
      csv_export: true,
      max_channels: 3
    }
  };

  const msRemaining = Math.max(0, endDate.getTime() - now.getTime());
  const hoursRemaining = Math.floor(msRemaining / (1000 * 60 * 60));
  const daysRemaining = Math.floor(hoursRemaining / 24);

  const isExpired = !isAdmin && (sub.status === 'expired' || isPastEnd);
  const isGated = isExpired;
  const canAccessDashboard = !isGated;

  const planId = sub.plan_id || 'plan_starter';
  const isProPlan = planId.includes('pro') || (plan.name || '').toLowerCase().includes('pro') || isAdmin;
  const featureConfig = (plan as any).feature_config || {
    website_stores: true,
    call_requests: true,
    vip_broadcast: true,
    courier_dispatch: true,
    csv_export: true,
    max_channels: isProPlan ? 10 : 3
  };
  const canAccessStores = !isExpired && featureConfig?.website_stores !== false;

  return {
    subscription: sub,
    planId,
    planName: plan.name,
    price: plan.price,
    currency: plan.currency,
    isProPlan,
    canAccessStores,
    featureConfig,
    daysRemaining,
    hoursRemaining,
    msRemaining,
    serverTime: now.toISOString(),
    isExpired,
    isGated,
    canAccessDashboard
  };
}

export function activateSubscription(userId: string, planId: string, durationDays: number): Subscription {
  const plan = db.getPlanById(planId);
  const days = durationDays || (plan ? plan.duration_days : 30);
  const now = new Date();

  const currentSub = db.getSubscriptionByUserId(userId);
  let baseDate = now;

  // If current subscription is still active and in the future, extend from current end date
  if (currentSub && currentSub.status === 'active' && new Date(currentSub.end_date) > now) {
    baseDate = new Date(currentSub.end_date);
  }

  const newEndDate = new Date(baseDate.getTime() + days * 86400000).toISOString();

  // Enforce channel limit for plan: Starter (1,250 TK) allows up to 3 active Meta channels; Pro (1,950 TK) allows up to 10
  const isPro = String(planId).toLowerCase().includes('pro') || (plan?.price && plan.price >= 1950);
  const maxAllowedChannels = plan?.feature_config?.max_channels || (isPro ? 10 : 3);
  const activeMetaChannels = db
    .getChannels(userId)
    .filter(
      (c) =>
        c.is_active &&
        ['messenger', 'instagram', 'whatsapp'].includes(c.platform) &&
        c.identifier !== 'website_widget'
    );
  if (activeMetaChannels.length > maxAllowedChannels) {
    for (let i = maxAllowedChannels; i < activeMetaChannels.length; i++) {
      db.updateChannel(activeMetaChannels[i].id, {
        is_active: false,
        status: 'not_connected'
      });
    }
  }

  if (currentSub) {
    const updated = db.updateSubscription(currentSub.id, {
      plan_id: planId,
      status: 'active',
      start_date: now.toISOString(),
      end_date: newEndDate
    });
    return updated || currentSub;
  }

  return db.createSubscription({
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id: userId,
    plan_id: planId,
    status: 'active',
    start_date: now.toISOString(),
    end_date: newEndDate,
    created_at: now.toISOString(),
    updated_at: now.toISOString()
  });
}

export function runSubscriptionExpiryCheck(): { expiredCount: number; checkedCount: number } {
  const allSubs = db.getSubscriptions();
  const now = new Date();
  let expiredCount = 0;

  for (const sub of allSubs) {
    if ((sub.status === 'trialing' || sub.status === 'active') && new Date(sub.end_date) < now) {
      db.updateSubscription(sub.id, { status: 'expired' });
      expiredCount++;
    }
  }

  db.updateSettings({
    cron_last_run: now.toISOString(),
    cron_status: `Active (Last check expired ${expiredCount} subscriptions at ${now.toLocaleTimeString()})`
  });

  return {
    expiredCount,
    checkedCount: allSubs.length
  };
}
