import { Plan } from '../types';

export interface PlanDurationOption {
  id: string;
  label: string;
  shortLabel: string;
  type: 'monthly' | 'yearly';
  months: number;
  days: number;
  badge?: string;
}

export const PLAN_DURATION_OPTIONS: PlanDurationOption[] = [
  {
    id: '1m',
    label: '1 Month',
    shortLabel: '1M',
    type: 'monthly',
    months: 1,
    days: 30
  },
  {
    id: '2m',
    label: '2 Months',
    shortLabel: '2M',
    type: 'monthly',
    months: 2,
    days: 60
  },
  {
    id: '3m',
    label: '3 Months',
    shortLabel: '3M',
    type: 'monthly',
    months: 3,
    days: 90,
    badge: 'Popular'
  },
  {
    id: '6m',
    label: '6 Months',
    shortLabel: '6M',
    type: 'monthly',
    months: 6,
    days: 180
  },
  {
    id: '12m',
    label: '12 Months',
    shortLabel: '12M',
    type: 'monthly',
    months: 12,
    days: 365
  },
  {
    id: '1y',
    label: '1 Year',
    shortLabel: '1Y',
    type: 'yearly',
    months: 12,
    days: 365,
    badge: 'Best Value'
  },
  {
    id: '2y',
    label: '2 Years',
    shortLabel: '2Y',
    type: 'yearly',
    months: 24,
    days: 730
  },
  {
    id: '3y',
    label: '3 Years',
    shortLabel: '3Y',
    type: 'yearly',
    months: 36,
    days: 1095
  },
  {
    id: '6y',
    label: '6 Years',
    shortLabel: '6Y',
    type: 'yearly',
    months: 72,
    days: 2190
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
      '1 Autonomous AI Sales Agent (24/7 Active)',
      'Add Website, WooCommerce & Shopify Store Sync',
      'Website AI Chatbot Widget Included',
      'WhatsApp, Messenger & Instagram Auto-Reply',
      'Unlimited Customer Conversations (0 TK per-msg fee)',
      'Product Catalog & Photo Search (Up to 50 items)',
      'Autonomous Order Booking & Orders Hub',
      'Steadfast & Pathao 1-Click Courier Dispatch',
      'Unified Live Inbox & Human Call Requests',
      '2-Day Full Access Free Trial'
    ],
    feature_config: {
      website_stores: true,
      call_requests: true,
      vip_broadcast: false,
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
      '3 Autonomous AI Sales & Support Agents',
      'Everything in 1,250 TK Starter Plan Included',
      'Unlimited Website, Shopify & WooCommerce Stores',
      'Voice Note AI (Audio Message Transcription & Reply)',
      'Unlimited Product Catalog & Visual Photo Search',
      'Up to 10 Connected Social & Web Channels',
      'VIP Customer Broadcast & Tagging',
      'Google Sheets Live Sync & CSV Order Export',
      'High-Speed Priority AI Response Engine',
      'Dedicated Priority Onboarding & 24/7 VIP Support'
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
    feature: 'Autonomous AI Agents',
    starterValue: '1 AI Agent',
    proValue: '3 AI Agents'
  },
  {
    category: 'Core AI & Channels',
    feature: 'Website & Store Integration (Add Website)',
    starterValue: true,
    proValue: true
  },
  {
    category: 'Core AI & Channels',
    feature: 'Website AI Live Chat Widget',
    starterValue: true,
    proValue: true
  },
  {
    category: 'Core AI & Channels',
    feature: 'Connected Meta & WhatsApp Channels',
    starterValue: 'Up to 3 Channels',
    proValue: 'Up to 10 Channels'
  },
  {
    category: 'Core AI & Channels',
    feature: 'WhatsApp, Messenger & Instagram Auto-Reply',
    starterValue: true,
    proValue: true
  },
  {
    category: 'AI Intelligence & Media',
    feature: 'Voice Note AI (Audio Transcription)',
    starterValue: false,
    proValue: true
  },
  {
    category: 'AI Intelligence & Media',
    feature: 'Product Catalog & Visual Image Recognition',
    starterValue: 'Up to 50 Products',
    proValue: 'Unlimited Products'
  },
  {
    category: 'Orders, Store & Logistics',
    feature: 'Autonomous Chat Order Confirmation & Hub',
    starterValue: true,
    proValue: true
  },
  {
    category: 'Orders, Store & Logistics',
    feature: 'Steadfast & Pathao 1-Click Courier Booking',
    starterValue: true,
    proValue: true
  },
  {
    category: 'Orders, Store & Logistics',
    feature: 'CSV Lead Export & VIP Customer Broadcast',
    starterValue: false,
    proValue: true
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

export function calculateCustomPlanPrice(basePrice: number, months: number): number {
  return basePrice * months;
}

export function buildCustomizedPlan(basePlan: Plan, duration: PlanDurationOption): Plan {
  const totalPrice = basePlan.price * duration.months;
  return {
    ...basePlan,
    price: totalPrice,
    duration_days: duration.days,
    name: `${basePlan.name} (${duration.label})`
  };
}

