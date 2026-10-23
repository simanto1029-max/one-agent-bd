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
  isTrialActive?: boolean;
  canConnectWhatsApp?: boolean;
  whatsappCreditsTotal: number;
  whatsappCreditsUsed: number;
  whatsappCreditsRemaining: number;
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
      plan_id: 'plan_pro',
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

  // During free trial, ensure user is assigned plan_pro with full pro features unlocked
  if (sub.status === 'trialing' && sub.plan_id !== 'plan_pro') {
    sub =
      db.updateSubscription(sub.id, {
        plan_id: 'plan_pro',
        updated_at: now.toISOString()
      }) || sub;
  }

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

    // Pause all channels immediately when trial or subscription ends without payment
    const userChannels = db.getChannels(userId);
    for (const ch of userChannels) {
      if (ch.is_active) {
        db.updateChannel(ch.id, { is_active: false });
      }
    }
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
  const isTrialActive = !isExpired && sub.status === 'trialing';
  const isPaidProPlan =
    planId.includes('pro') ||
    (plan.name || '').toLowerCase().includes('pro') ||
    Number(plan.price) >= 1950;

  // During the 2-Day Free Trial (status === 'trialing' and not expired), unlock ALL features so the user can test everything.
  // When on an active Starter Plan (status === 'active' and plan_starter), isProPlan is false so Pro features are locked & blurred.
  const isProPlan = isAdmin || isTrialActive || isPaidProPlan;

  const featureConfig = isProPlan
    ? {
        website_stores: true,
        call_requests: true,
        vip_broadcast: true,
        courier_dispatch: true,
        csv_export: true,
        max_channels: 10
      }
    : (plan as any).feature_config || {
        website_stores: false,
        call_requests: false,
        vip_broadcast: false,
        courier_dispatch: true,
        csv_export: false,
        max_channels: 3
      };
  const canAccessStores = !isExpired && isProPlan;

  // Calculate WhatsApp Message Credits Usage
  const userMessages = db.getMessages(userId);
  const waUsedCount = userMessages.filter(
    (m) => m.platform === 'whatsapp' && (m.is_ai_reply || m.direction === 'outbound' || (m as any).sender_type === 'bot' || (m as any).sender_type === 'user')
  ).length;

  let baseQuota = (plan as any)?.feature_config?.whatsapp_credits || (plan as any)?.whatsapp_credits;
  if (!baseQuota) {
    if (planId === 'plan_enterprise' || Number(plan.price) >= 8000) {
      baseQuota = 15000;
    } else if (planId === 'plan_pro' || Number(plan.price) >= 4000) {
      baseQuota = 6500;
    } else if (isTrialActive) {
      baseQuota = 100;
    } else {
      baseQuota = 2500;
    }
  }

  const profileCustomCredits = (profile as any)?.custom_whatsapp_credits;
  const whatsappCreditsTotal = typeof profileCustomCredits === 'number' ? profileCustomCredits : baseQuota;
  const whatsappCreditsUsed = waUsedCount;
  const whatsappCreditsRemaining = Math.max(0, whatsappCreditsTotal - whatsappCreditsUsed);

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
    canAccessDashboard,
    isTrialActive,
    canConnectWhatsApp: isAdmin || (!isTrialActive && !isExpired),
    whatsappCreditsTotal,
    whatsappCreditsUsed,
    whatsappCreditsRemaining
  };
}

export function activateSubscription(userId: string, planId: string, durationDays: number): Subscription {
  const plan = db.getPlanById(planId);
  const now = new Date();
  const currentSub = db.getSubscriptionByUserId(userId);
  let baseDate = now;

  // If current subscription is still active and in the future, extend from current end date
  if (currentSub && currentSub.status === 'active' && new Date(currentSub.end_date) > now) {
    baseDate = new Date(currentSub.end_date);
  }

  // If durationDays === 0, it means the user paid the difference/prorated fee to upgrade their CURRENT active cycle to Pro
  let newEndDate: string;
  if (durationDays === 0 && currentSub && currentSub.status === 'active' && new Date(currentSub.end_date) > now) {
    newEndDate = currentSub.end_date;
  } else {
    const days = durationDays || (plan ? plan.duration_days : 30);
    newEndDate = new Date(baseDate.getTime() + days * 86400000).toISOString();
  }

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
  // Re-activate user's channels up to the plan limit, unpausing them after payment
  const userChannels = db.getChannels(userId);
  let activeCount = 0;
  for (const ch of userChannels) {
    if (activeCount < maxAllowedChannels && (ch.status === 'connected' || ch.access_token)) {
      db.updateChannel(ch.id, { is_active: true, status: 'connected' });
      activeCount++;
    } else if (activeCount >= maxAllowedChannels) {
      db.updateChannel(ch.id, { is_active: false });
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
    const profile = db.getProfileById(sub.user_id);
    if (profile?.role === 'admin') continue; // Admins never expire

    if ((sub.status === 'trialing' || sub.status === 'active') && new Date(sub.end_date) < now) {
      db.updateSubscription(sub.id, { status: 'expired' });
      expiredCount++;

      // Pause all channels for this user immediately when trial or subscription ends
      const userChannels = db.getChannels(sub.user_id);
      for (const ch of userChannels) {
        if (ch.is_active) {
          db.updateChannel(ch.id, { is_active: false });
        }
      }
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
