import { Plan } from '../types';

export interface PlanDurationOption {
  id: string;
  label: string;
  shortLabel: string;
  type: 'monthly' | 'yearly';
  months: number;
  days: number;
  discountPercent: number;
  badge?: string;
}

export const PLAN_DURATION_OPTIONS: PlanDurationOption[] = [
  {
    id: '1m',
    label: '1 Month',
    shortLabel: '1M',
    type: 'monthly',
    months: 1,
    days: 30,
    discountPercent: 0
  },
  {
    id: '2m',
    label: '2 Months',
    shortLabel: '2M',
    type: 'monthly',
    months: 2,
    days: 60,
    discountPercent: 3,
    badge: '3% OFF'
  },
  {
    id: '3m',
    label: '3 Months',
    shortLabel: '3M',
    type: 'monthly',
    months: 3,
    days: 90,
    discountPercent: 5,
    badge: '5% OFF'
  },
  {
    id: '6m',
    label: '6 Months',
    shortLabel: '6M',
    type: 'monthly',
    months: 6,
    days: 180,
    discountPercent: 10,
    badge: '10% OFF'
  },
  {
    id: '12m',
    label: '1 Year (12M)',
    shortLabel: '1Y',
    type: 'monthly',
    months: 12,
    days: 365,
    discountPercent: 15,
    badge: '15% OFF'
  },
  {
    id: '1y',
    label: '1 Year',
    shortLabel: '1Y',
    type: 'yearly',
    months: 12,
    days: 365,
    discountPercent: 15,
    badge: '15% OFF'
  },
  {
    id: '2y',
    label: '2 Years',
    shortLabel: '2Y',
    type: 'yearly',
    months: 24,
    days: 730,
    discountPercent: 20,
    badge: '20% OFF'
  },
  {
    id: '3y',
    label: '3 Years',
    shortLabel: '3Y',
    type: 'yearly',
    months: 36,
    days: 1095,
    discountPercent: 25,
    badge: '25% OFF'
  },
  {
    id: '6y',
    label: '6 Years',
    shortLabel: '6Y',
    type: 'yearly',
    months: 72,
    days: 2190,
    discountPercent: 30,
    badge: '30% OFF'
  }
];

export const OFFICIAL_TWO_PLANS: Plan[] = [
  {
    id: 'plan_starter',
    name: 'Starter AI Plan',
    price: 1250,
    currency: 'BDT',
    duration_days: 30,
    trial_days: 2,
    is_active: true,
    features: [
      'All Core SaaS Features Included (24/7 Active AI Agent)',
      'WhatsApp, Facebook Messenger, Instagram & Website Auto-Reply',
      'Voice Note AI (Audio Listening) & Product Picture Recognition AI',
      'Auto Post Comment Reply + Direct Inbox (DM) Automation',
      'Connect up to 3 Social Channels + 1 Website Live Chat Widget',
      'Add Website, WooCommerce & Shopify Store Sync (1 Store)',
      'Unlimited Product Catalog & Visual Photo Search',
      'Autonomous Chat Order Booking, Orders Hub & Call Requests',
      'Steadfast, Pathao & RedX 1-Click Courier Dispatch',
      'Unlimited Customer Conversations (0 TK per-msg fee)'
    ],
    feature_config: {
      website_stores: true,
      call_requests: true,
      vip_broadcast: true,
      courier_dispatch: true,
      csv_export: true,
      max_channels: 3
    },
    created_at: '',
    updated_at: ''
  },
  {
    id: 'plan_pro',
    name: 'Pro Business Plan',
    price: 1950,
    currency: 'BDT',
    duration_days: 30,
    trial_days: 2,
    is_active: true,
    features: [
      'Everything in 1,250 TK Starter Plan Included (100% All Features)',
      'Connect up to 10 Social & Web Channels (Multi-Page & Multi-Number)',
      '3 Autonomous AI Sales & Support Agents (Run Multiple Brands)',
      'Unlimited Website, Shopify & WooCommerce Multi-Store Sync',
      'Smart Auto Follow-Up & VIP Customer Retargeting Broadcast',
      'High-Speed Priority AI Engine for High-Traffic Pages',
      'Google Sheets Live Sync, Advanced Analytics & CSV Lead Export',
      'Custom Brand AI Persona & Multi-Page Order Routing',
      'Dedicated Account Manager & Free 1-on-1 Setup Onboarding',
      '24/7 VIP Priority WhatsApp & Phone Support'
    ],
    feature_config: {
      website_stores: true,
      call_requests: true,
      vip_broadcast: true,
      courier_dispatch: true,
      csv_export: true,
      max_channels: 10
    },
    created_at: '',
    updated_at: ''
  }
];

export interface PlanComparisonRow {
  category: string;
  feature: string;
  starterValue: string | boolean;
  proValue: string | boolean;
}

export const PLAN_COMPARISON_ROWS: PlanComparisonRow[] = [
  {
    category: 'Core AI & Channels',
    feature: 'Base Monthly Rate',
    starterValue: '1,250 TK / month',
    proValue: '1,950 TK / month'
  },
  {
    category: 'Core AI & Channels',
    feature: '1 Year Subscription (15% Discount)',
    starterValue: '12,750 TK / year (Save 2,250 TK)',
    proValue: '19,890 TK / year (Save 3,510 TK)'
  },
  {
    category: 'Core AI & Channels',
    feature: '2 Years Subscription (20% Discount)',
    starterValue: '24,000 TK / 2 yrs (Save 6,000 TK)',
    proValue: '37,440 TK / 2 yrs (Save 9,360 TK)'
  },
  {
    category: 'Core AI & Channels',
    feature: 'Autonomous AI Agents',
    starterValue: '1 AI Agent (All Features)',
    proValue: '3 AI Agents (Multi-Brand)'
  },
  {
    category: 'Core AI & Channels',
    feature: 'Connected Meta & WhatsApp Channels',
    starterValue: 'Up to 3 Channels + Website',
    proValue: 'Up to 10 Channels (Multi-Page)'
  },
  {
    category: 'Core AI & Channels',
    feature: 'Website, WooCommerce & Shopify Store Sync',
    starterValue: '1 Connected Store',
    proValue: 'Unlimited Stores'
  },
  {
    category: 'AI Intelligence & Media',
    feature: 'Voice Note AI & Product Image Recognition AI',
    starterValue: true,
    proValue: true
  },
  {
    category: 'AI Intelligence & Media',
    feature: 'Auto Comment Reply + Direct Inbox DM',
    starterValue: true,
    proValue: true
  },
  {
    category: 'AI Intelligence & Media',
    feature: 'Product Catalog & Visual Photo Search',
    starterValue: 'Unlimited Products',
    proValue: 'Unlimited Products'
  },
  {
    category: 'Orders, Store & Logistics',
    feature: 'Autonomous Chat Order Confirmation & Courier Booking',
    starterValue: true,
    proValue: true
  },
  {
    category: 'Orders, Store & Logistics',
    feature: 'Multi-Page Routing, Priority AI Queue & 24/7 VIP Support',
    starterValue: 'Standard Support',
    proValue: 'VIP Priority + Dedicated Onboarding'
  }
];

export function normalizeToTwoPlans(apiPlans: Plan[]): Plan[] {
  const starterFromApi = apiPlans.find((p) => p.price === 1250 || p.id === 'plan_starter');
  const proFromApi = apiPlans.find((p) => p.price === 1950 || p.id === 'plan_pro');

  return [
    starterFromApi
      ? {
          ...OFFICIAL_TWO_PLANS[0],
          ...starterFromApi,
          price: 1250,
          features: OFFICIAL_TWO_PLANS[0].features,
          feature_config: OFFICIAL_TWO_PLANS[0].feature_config
        }
      : OFFICIAL_TWO_PLANS[0],
    proFromApi
      ? {
          ...OFFICIAL_TWO_PLANS[1],
          ...proFromApi,
          price: 1950,
          features: OFFICIAL_TWO_PLANS[1].features,
          feature_config: OFFICIAL_TWO_PLANS[1].feature_config
        }
      : OFFICIAL_TWO_PLANS[1]
  ];
}

export const OFFICIAL_PLANS: Plan[] = OFFICIAL_TWO_PLANS;

export function getDurationDiscountPercent(months: number): number {
  if (months >= 72) return 30;
  if (months >= 36) return 25;
  if (months >= 24) return 20;
  if (months >= 12) return 15;
  if (months >= 6) return 10;
  if (months >= 3) return 5;
  if (months >= 2) return 3;
  return 0;
}

export function calculateOriginalPlanPrice(
  basePrice: number,
  durationOrMonths: number | PlanDurationOption
): number {
  const months = typeof durationOrMonths === 'number' ? durationOrMonths : durationOrMonths.months;
  return basePrice * months;
}

export function calculateCustomPlanPrice(
  basePrice: number,
  durationOrMonths: number | PlanDurationOption
): number {
  const months = typeof durationOrMonths === 'number' ? durationOrMonths : durationOrMonths.months;
  const original = basePrice * months;
  const discountPercent =
    typeof durationOrMonths === 'object' && durationOrMonths.discountPercent !== undefined
      ? durationOrMonths.discountPercent
      : getDurationDiscountPercent(months);
  if (discountPercent <= 0) return original;
  return Math.round((original * (100 - discountPercent)) / 100);
}

export function buildCustomizedPlan(basePlan: Plan, duration: PlanDurationOption): Plan {
  const totalPrice = calculateCustomPlanPrice(basePlan.price, duration.months);
  return {
    ...basePlan,
    price: totalPrice,
    duration_days: duration.days,
    name: `${basePlan.name} (${duration.label})`
  };
}


