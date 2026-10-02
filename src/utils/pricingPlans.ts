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
    badge: 'Save 3%'
  },
  {
    id: '3m',
    label: '3 Months',
    shortLabel: '3M',
    type: 'monthly',
    months: 3,
    days: 90,
    discountPercent: 5,
    badge: 'Save 5%'
  },
  {
    id: '6m',
    label: '6 Months',
    shortLabel: '6M',
    type: 'monthly',
    months: 6,
    days: 180,
    discountPercent: 10,
    badge: 'Save 10%'
  },
  {
    id: '1y',
    label: '1 Year',
    shortLabel: '1Y',
    type: 'yearly',
    months: 12,
    days: 365,
    discountPercent: 15,
    badge: 'Save 15%'
  },
  {
    id: '2y',
    label: '2 Years',
    shortLabel: '2Y',
    type: 'yearly',
    months: 24,
    days: 730,
    discountPercent: 20,
    badge: 'Save 20%'
  },
  {
    id: '3y',
    label: '3 Years',
    shortLabel: '3Y',
    type: 'yearly',
    months: 36,
    days: 1095,
    discountPercent: 25,
    badge: 'Save 25%'
  },
  {
    id: '6y',
    label: '6 Years',
    shortLabel: '6Y',
    type: 'yearly',
    months: 72,
    days: 2190,
    discountPercent: 30,
    badge: 'Save 30%'
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
      '24/7 AI Auto-Reply (Up to 3 Channels)',
      'Bangla Voice Note & Photo AI',
      'Auto Comment Reply + Inbox DM',
      '1-Click Steadfast, Pathao & RedX',
      'AI Live Parcel Tracking Update',
      'Fake Order & Courier Ratio Check',
      'VIP Customer Offer & Retarget DM',
      'Unlimited Chats (0 TK / Message)'
    ],
    feature_config: {
      website_stores: false,
      call_requests: false,
      vip_broadcast: true,
      courier_dispatch: true,
      csv_export: false,
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
      'Everything in Starter (Up to 10 Channels)',
      'Accounts, Stock & Profit ERP',
      'Website & WooCommerce Live Sync',
      'AI Appointments & Calendar Booking',
      '1-Click Courier & Live Order Track',
      'Fake Order Shield & Fraud Check',
      'VIP Retargeting & Email Marketing',
      '3 AI Agents + 24/7 VIP Support'
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


