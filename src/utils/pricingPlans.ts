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
    label: '1 Year (12 Months)',
    shortLabel: '1Y',
    type: 'yearly',
    months: 12,
    days: 365,
    discountPercent: 15,
    badge: 'Save 15%'
  },
  {
    id: '2y',
    label: '2 Years (24 Months)',
    shortLabel: '2Y',
    type: 'yearly',
    months: 24,
    days: 730,
    discountPercent: 20,
    badge: 'Save 20%'
  }
];

export const OFFICIAL_THREE_PLANS: Plan[] = [
  {
    id: 'plan_starter',
    name: 'Advance AI Plan',
    price: 2499,
    currency: 'BDT',
    duration_days: 30,
    trial_days: 2,
    is_active: true,
    subtitle: 'Grow Your E-Commerce Business',
    badge: 'Starter Growth',
    features: [
      'Facebook Messenger: 100% Unlimited Conversations',
      'Instagram DM: 100% Unlimited Conversations',
      'WhatsApp: 2,500 Messages & Replies Included',
      '250 Comment Auto-Replies & Instant Inbox DM',
      '500 Instant FAQ & Delivery Charge Auto-Replies',
      '100 Products Catalog & Auto Order Capture',
      'Bangla Voice Note AI Listening & Photo Recognition',
      '1-Click Courier Booking (Steadfast, Pathao & RedX)',
      'VIP Customer Retargeting & Smart Follow-Up',
      'System Message Credits (No user card needed!)'
    ],
    feature_config: {
      website_stores: false,
      call_requests: true,
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
    name: 'Business AI Plan',
    price: 4499,
    currency: 'BDT',
    duration_days: 30,
    trial_days: 2,
    is_active: true,
    subtitle: 'Scale Multichannel Operations',
    badge: 'Most Popular',
    features: [
      'Facebook Messenger: 100% Unlimited Conversations',
      'Instagram DM: 100% Unlimited Conversations',
      'WhatsApp: 6,500 Messages & Replies Included',
      '1,000 Comment Auto-Replies & Instant Inbox DM',
      '1,500 Instant FAQ & Custom Business Rules',
      'Unlimited Products Catalog & Auto Order Capture',
      'Everything in Advance Plan +',
      'Accounts, Stock & Profit ERP (Sales, Due, Cashbook)',
      'Website Live Chat & WooCommerce/Shopify Store Sync',
      'AI Delivery Tracking & Courier Fraud Intelligence Check',
      'Up to 10 Connected Channels & Multi-Agent Collaboration',
      'System Message Credits (No user card needed!)'
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
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise Agency Plan',
    price: 8999,
    currency: 'BDT',
    duration_days: 30,
    trial_days: 2,
    is_active: true,
    subtitle: 'Mega Volume & Agency Automation',
    badge: 'Maximum Power',
    features: [
      'Facebook Messenger: 100% Unlimited Conversations',
      'Instagram DM: 100% Unlimited Conversations',
      'WhatsApp: 15,000 Messages & Replies Included',
      'Unlimited Comment Auto-Replies & Instant Inbox DM',
      'Unlimited Instant FAQ & Custom Business Knowledge Base',
      'Unlimited Products Catalog & Multi-Store Management',
      'Everything in Business Plan +',
      'Connect Unlimited Channels (Multi-Page & Multi-Number)',
      'Dedicated VIP Account Manager (24/7 Priority WhatsApp)',
      'Team Collaboration & Multi-Staff Handover Queue',
      'Custom AI Sales Closer Persona & Webhook Integrations',
      'System Message Credits (No user card needed!)'
    ],
    feature_config: {
      website_stores: true,
      call_requests: true,
      vip_broadcast: true,
      courier_dispatch: true,
      csv_export: true,
      max_channels: 99
    },
    created_at: '',
    updated_at: ''
  }
];

export const TRIAL_PLAN: Plan = {
  id: 'plan_trial',
  name: 'Basic Free Trial',
  price: 0,
  currency: 'BDT',
  duration_days: 2,
  trial_days: 2,
  is_active: true,
  subtitle: 'Test 100% Risk-Free For 2 Days',
  badge: 'Free Trial',
  features: [
    'Facebook Unlimited Conversations',
    'Instagram Unlimited Conversations',
    '100 Test WhatsApp AI Replies Included',
    '1 AI Business Agent',
    'Bangla Voice Note & Photo AI',
    'Auto Comment & Inbox DM Reply',
    '1-Click Courier Booking (Steadfast & Pathao)',
    'Unified Team Inbox',
    'Standard AI Reply Speed'
  ],
  feature_config: {
    website_stores: true,
    call_requests: true,
    vip_broadcast: false,
    courier_dispatch: true,
    csv_export: false,
    max_channels: 2
  },
  created_at: '',
  updated_at: ''
};

export const OFFICIAL_ALL_PLANS: Plan[] = [TRIAL_PLAN, ...OFFICIAL_THREE_PLANS];
export const OFFICIAL_TWO_PLANS: Plan[] = OFFICIAL_THREE_PLANS;

export interface PlanComparisonRow {
  category: string;
  feature: string;
  starterValue: string | boolean;
  proValue: string | boolean;
  enterpriseValue?: string | boolean;
}

export const PLAN_COMPARISON_ROWS: PlanComparisonRow[] = [
  {
    category: 'Core AI & Channels',
    feature: 'Base Monthly Rate',
    starterValue: '2,499 TK / month',
    proValue: '4,499 TK / month',
    enterpriseValue: '8,999 TK / month'
  },
  {
    category: 'Core AI & Channels',
    feature: 'WhatsApp Messages Included',
    starterValue: '2,500 Messages',
    proValue: '6,500 Messages',
    enterpriseValue: '15,000 Messages'
  },
  {
    category: 'Core AI & Channels',
    feature: 'Facebook & Instagram Conversations',
    starterValue: '100% Unlimited',
    proValue: '100% Unlimited',
    enterpriseValue: '100% Unlimited'
  },
  {
    category: 'Core AI & Channels',
    feature: 'Foreign Credit Card Required for Meta',
    starterValue: 'No (Covered by One Agent BD)',
    proValue: 'No (Covered by One Agent BD)',
    enterpriseValue: 'No (Covered by One Agent BD)'
  },
  {
    category: 'Core AI & Channels',
    feature: 'Autonomous AI Agents',
    starterValue: '1 AI Agent',
    proValue: '3 AI Agents (Multi-Brand)',
    enterpriseValue: 'Unlimited AI Agents'
  },
  {
    category: 'Core AI & Channels',
    feature: 'Connected Meta & WhatsApp Channels',
    starterValue: 'Up to 3 Channels',
    proValue: 'Up to 10 Channels',
    enterpriseValue: 'Unlimited Channels'
  },
  {
    category: 'Core AI & Channels',
    feature: 'Website, WooCommerce & Shopify Store Sync',
    starterValue: false,
    proValue: true,
    enterpriseValue: true
  },
  {
    category: 'ERP & Finance',
    feature: 'Accounts, Stock & Profit Due ERP',
    starterValue: false,
    proValue: true,
    enterpriseValue: true
  },
  {
    category: 'AI Intelligence & Media',
    feature: 'Voice Note AI & Product Image Recognition AI',
    starterValue: true,
    proValue: true,
    enterpriseValue: true
  },
  {
    category: 'Courier & Logistics',
    feature: '1-Click Steadfast, Pathao & RedX Booking',
    starterValue: true,
    proValue: true,
    enterpriseValue: true
  },
  {
    category: 'VIP Support',
    feature: 'Dedicated VIP Account Manager Hotline',
    starterValue: false,
    proValue: false,
    enterpriseValue: '24/7 WhatsApp Hotline'
  }
];

export function normalizeToThreePlans(list: Plan[]): Plan[] {
  if (!list || list.length === 0) return OFFICIAL_THREE_PLANS;
  const activePlans = list.filter((p) => p.is_active);
  if (activePlans.length >= 3) return activePlans;
  const starter = list.find((p) => p.id === 'plan_starter' || p.price === 2499) || OFFICIAL_THREE_PLANS[0];
  const pro = list.find((p) => p.id === 'plan_pro' || p.price === 4499) || OFFICIAL_THREE_PLANS[1];
  const enterprise = list.find((p) => p.id === 'plan_enterprise' || p.price === 8999) || OFFICIAL_THREE_PLANS[2];
  return [starter, pro, enterprise];
}

export function getDurationDiscountPercent(months: number): number {
  if (months >= 24) return 20;
  if (months >= 12) return 15;
  if (months >= 6) return 10;
  if (months >= 3) return 5;
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
  const totalPrice = calculateCustomPlanPrice(basePlan.price, duration);
  return {
    ...basePlan,
    price: totalPrice,
    duration_days: duration.days,
    name: `${basePlan.name} (${duration.label})`
  };
}
