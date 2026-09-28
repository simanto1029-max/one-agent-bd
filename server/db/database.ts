import fs from 'fs';
import os from 'os';
import path from 'path';

export interface OrderConfirmationSettings {
  enabled: boolean;
  instructions: string; // Merchant custom guidelines for AI
  required_fields: {
    customer_name: boolean;
    customer_phone: boolean;
    customer_address: boolean;
    items_detail: boolean;
    trx_id: boolean;
  };
  trigger_keywords: string[];
  auto_reply_confirmation: boolean;
  confirmation_message_template: string;
}

export interface AutomationSettings {
  auto_comment_reply_enabled: boolean;
  public_comment_reply_template: string;
  send_private_inbox_on_comment: boolean;
  auto_followup_enabled: boolean;
  followup_delay_minutes: number;
  followup_message_template: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'user' | 'admin';
  password?: string;
  recovery_otp?: string;
  recovery_otp_expires?: string;
  is_suspended: boolean;
  llm_provider: 'gemini' | 'openai' | 'anthropic';
  llm_api_key?: string;
  system_prompt: string;
  order_settings?: OrderConfirmationSettings;
  automation_settings?: AutomationSettings;
  meta_user_access_token?: string;
  meta_tokens_updated_at?: string;
  meta_granted_scopes?: string[];
  meta_connected_pages_count?: number;
  created_at: string;
  updated_at: string;
}

export interface PlanFeaturesConfig {
  website_stores?: boolean;
  call_requests?: boolean;
  vip_broadcast?: boolean;
  courier_dispatch?: boolean;
  csv_export?: boolean;
  max_channels?: number;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration_days: number;
  trial_days: number;
  is_active: boolean;
  features: string[];
  feature_config?: PlanFeaturesConfig;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'trialing' | 'active' | 'expired' | 'pending_approval';
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  coupon_code?: string;
  discount_amount?: number;
  duration_days?: number;
  duration_label?: string;
  method: 'bkash' | 'nagad' | 'rocket' | 'upay' | 'bank' | 'manual' | 'stripe';
  transaction_reference: string;
  sender_number?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_amount?: number;
  max_uses?: number;
  used_count: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Channel {
  id: string;
  user_id: string;
  platform: 'whatsapp' | 'messenger' | 'instagram';
  name: string;
  identifier: string; // phone_number_id, page_id, or instagram_account_id
  access_token: string;
  app_secret?: string;
  is_active: boolean;
  auto_comment_reply?: boolean;
  auto_followup_enabled?: boolean;
  status?: 'not_connected' | 'connecting' | 'connected' | 'error';
  error_message?: string;
  last_webhook_at?: string;
  last_message_at?: string;
  meta_asset_name?: string;
  meta_asset_id?: string;
  meta_business_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  website?: string;
  meta_business_id?: string;
  created_at: string;
  updated_at: string;
}

export interface FacebookPage {
  id: string; // page_id
  user_id: string;
  name: string;
  category?: string;
  access_token?: string;
  is_webhook_subscribed: boolean;
  status: 'connected' | 'error' | 'not_connected';
  error_message?: string;
  connected_at: string;
  updated_at: string;
}

export interface InstagramAccount {
  id: string; // ig_account_id
  user_id: string;
  page_id?: string;
  username: string;
  name?: string;
  profile_picture_url?: string;
  access_token?: string;
  is_webhook_subscribed: boolean;
  status: 'connected' | 'error' | 'not_connected';
  error_message?: string;
  connected_at: string;
  updated_at: string;
}

export interface WhatsAppBusinessAccount {
  id: string; // waba_id
  user_id: string;
  name: string;
  currency?: string;
  timezone?: string;
  status: 'connected' | 'error' | 'not_connected';
  error_message?: string;
  connected_at: string;
  updated_at: string;
}

export interface WhatsAppPhoneNumber {
  id: string; // phone_number_id
  user_id: string;
  waba_id: string;
  display_phone_number: string;
  verified_name?: string;
  quality_rating?: string;
  code_verification_status?: string;
  status: 'connected' | 'error' | 'not_connected';
  connected_at: string;
  updated_at: string;
}

export interface WebhookEventLog {
  id: string;
  platform: 'whatsapp' | 'messenger' | 'instagram';
  event_type: string;
  identifier?: string;
  sender_id?: string;
  status: 'processed' | 'ignored' | 'error' | 'signature_mismatch';
  message_id?: string;
  error_message?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  resource_id?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export interface Message {
  id: string;
  user_id: string;
  channel_id?: string;
  platform: 'whatsapp' | 'messenger' | 'instagram';
  customer_id: string;
  customer_name?: string;
  direction: 'inbound' | 'outbound';
  message_text: string;
  is_ai_reply: boolean;
  status: string;
  raw_payload?: any;
  has_voice?: boolean;
  audio_url?: string;
  audio_base64?: string;
  audio_mime_type?: string;
  transcription?: string;
  has_image?: boolean;
  image_url?: string;
  image_base64?: string;
  image_mime_type?: string;
  created_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  price: number;
  currency: string;
  category: string;
  description: string;
  image_url: string;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  keywords?: string[];
  created_at: string;
  updated_at: string;
}

export interface StoreIntegration {
  id: string;
  user_id: string;
  platform: 'shopify' | 'woocommerce' | 'custom_website';
  store_name: string;
  store_url: string;
  api_key?: string;
  webhook_secret?: string;
  is_active: boolean;
  synced_orders_count: number;
  total_revenue_synced: number;
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CallRequest {
  id: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  customer_id?: string;
  platform: 'whatsapp' | 'messenger' | 'instagram' | 'website';
  message_excerpt: string;
  status: 'pending' | 'called' | 'converted_to_order' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone?: string;
  customer_address?: string;
  platform: 'whatsapp' | 'messenger' | 'instagram' | 'shopify' | 'woocommerce' | 'custom_website';
  channel_id?: string;
  items: string;
  quantity: number;
  total_amount: number;
  currency: string;
  payment_method: 'cod' | 'bkash' | 'nagad' | 'bank' | 'unspecified';
  payment_status: 'pending' | 'paid';
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  order_source: 'ai_detected' | 'manual' | 'website';
  source_details?: {
    platform?: 'shopify' | 'woocommerce' | 'custom_website';
    store_id?: string;
    store_name?: string;
    external_order_id?: string;
    store_url?: string;
  };
  is_vip?: boolean;
  courier_provider?: string;
  tracking_number?: string;
  consignment_id?: string;
  dispatched_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewItem {
  id: string;
  name: string;
  role: string;
  business: string;
  avatar_url?: string;
  rating: number;
  review_text: string;
  status: 'approved' | 'pending';
  created_at: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'promo' | 'warning' | 'maintenance';
  action_label?: string;
  action_tab?: string;
  is_active: boolean;
  created_at: string;
}

export interface SystemSettings {
  site_name: string;
  site_tagline: string;
  logo_url: string;
  promo_video_url?: string;
  promo_video_thumbnail?: string;
  bkash_number: string;
  nagad_number: string;
  support_email: string;
  meta_description: string;
  meta_app_id?: string;
  meta_app_secret?: string;
  meta_verify_token?: string;
  cron_last_run: string;
  cron_status: string;
}

interface DatabaseSchema {
  profiles: Profile[];
  plans: Plan[];
  subscriptions: Subscription[];
  payments: Payment[];
  channels: Channel[];
  messages: Message[];
  orders: Order[];
  products?: Product[];
  stores?: StoreIntegration[];
  call_requests?: CallRequest[];
  businesses?: Business[];
  facebook_pages?: FacebookPage[];
  instagram_accounts?: InstagramAccount[];
  whatsapp_business_accounts?: WhatsAppBusinessAccount[];
  whatsapp_phone_numbers?: WhatsAppPhoneNumber[];
  webhook_events?: WebhookEventLog[];
  audit_logs?: AuditLog[];
  coupons?: Coupon[];
  reviews?: ReviewItem[];
  notifications?: AdminNotification[];
  settings: SystemSettings;
}

const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL ? path.join(os.tmpdir(), 'oneagentbd_data') : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const BUNDLED_DB_FILE = path.join(process.cwd(), 'data', 'db.json');

export const defaultSeedReviews: ReviewItem[] = [
  {
    id: 'rev_seed_1',
    name: 'Mahmudul Hasan Rahat',
    role: 'F-Commerce Seller',
    business: 'Dhaka, BD',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    rating: 5,
    review_text:
      'Before One Agent BD, we used to lose late-night Facebook inquiries because no one was online after midnight. Now the AI replies in 2 seconds, checks available sizes, and confirms COD orders while we sleep.',
    status: 'approved',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString()
  },
  {
    id: 'rev_seed_2',
    name: 'Sadia Afrin Tisha',
    role: 'Online Boutique Owner',
    business: 'Dhaka, BD',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
    rating: 5,
    review_text:
      'Customers constantly send product screenshots and voice notes on Instagram and Messenger. The AI recognizes product photos accurately, quotes the exact price, and handles the entire checkout conversation.',
    status: 'approved',
    created_at: new Date(Date.now() - 9 * 86400000).toISOString()
  },
  {
    id: 'rev_seed_3',
    name: 'Tanvir Ahmed Chowdhury',
    role: 'Electronics & Gadget Seller',
    business: 'Chattogram, BD',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    rating: 5,
    review_text:
      'The auto comment-to-inbox workflow and 1-click Steadfast courier booking saved our team hours of manual data entry every single day. Best automation platform we have used.',
    status: 'approved',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'rev_seed_4',
    name: 'Ariful Islam Sourav',
    role: 'Organic Food Seller',
    business: 'Sylhet, BD',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
    rating: 5,
    review_text:
      'During peak season we receive hundreds of WhatsApp messages daily. One Agent BD collects customer names, phone numbers, and full delivery addresses and logs every order into our dashboard.',
    status: 'approved',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'rev_seed_5',
    name: 'Nusrat Jahan Mim',
    role: 'Clothing Page Owner',
    business: 'Dhaka, BD',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
    rating: 5,
    review_text:
      'Connecting our Facebook Page and Instagram took less than two minutes. Whenever a buyer asks for a live call, the AI alerts our team in the Call Requests queue immediately.',
    status: 'approved',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'rev_seed_6',
    name: 'Imran Hossain Rony',
    role: 'E-Commerce Merchant',
    business: 'Dhaka, BD',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80',
    rating: 5,
    review_text:
      'Our ad conversion rate nearly doubled because customers get an instant response right after clicking our boosted posts. Smart follow-ups bring back hesitant buyers automatically.',
    status: 'approved',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

export const defaultSeedProducts: Product[] = [
  {
    id: 'prod_001',
    user_id: 'usr_demo_002',
    name: 'Premium Semi-Drop Cotton Panjabi',
    price: 1850,
    currency: 'BDT',
    category: "Men's Fashion",
    description: '100% fine spun combed cotton with minimalist contrast neck embroidery and customized metallic snap buttons. Breathable, anti-wrinkle, tailored slim fit. Available sizes: 38, 40, 42, 44.',
    image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    stock_status: 'in_stock',
    keywords: ['panjabi', 'punjabi', 'panzabi', 'cotton panjabi', 'eid panjabi', 'পাঞ্জাবি', 'পাঞ্জাবী', 'পোশাক', 'শার্ট'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod_002',
    user_id: 'usr_demo_002',
    name: 'Ultra AMOLED Smartwatch Series 9 (Bluetooth Calling)',
    price: 2450,
    currency: 'BDT',
    category: 'Electronics & Gadgets',
    description: '2.02-inch HD AMOLED screen with always-on display, direct HD microphone Bluetooth calling, continuous heart-rate / SpO2 / sleep health monitoring, 100+ sports modes, 7-day battery life, and IP68 waterproof rating. 6-month replacement warranty included.',
    image_url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80',
    stock_status: 'in_stock',
    keywords: ['smartwatch', 'smart watch', 'watch', 'ghori', 'smart ghori', 'হাত ঘড়ি', 'ঘড়ি', 'স্মার্ট ওয়াচ'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod_003',
    user_id: 'usr_demo_002',
    name: 'Handcrafted Full-Grain Genuine Leather Wallet',
    price: 950,
    currency: 'BDT',
    category: 'Accessories',
    description: 'Crafted from 100% genuine vegetable-tanned cowhide leather. Features 8 dedicated credit/debit card slots, dual full-length cash compartments, hidden ID window, and built-in military grade RFID theft blocking protection. Delivered in premium gift box packaging.',
    image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
    stock_status: 'in_stock',
    keywords: ['wallet', 'leather wallet', 'money bag', 'bag', 'মানিব্যাগ', 'লেদার ওয়ালেট', 'ওয়ালেট', 'পার্স'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod_004',
    user_id: 'usr_demo_002',
    name: 'Pro Wireless ANC Noise-Cancelling Earbuds (Deep Bass)',
    price: 1650,
    currency: 'BDT',
    category: 'Audio & Tech',
    description: 'True Wireless Stereo (TWS) with Active Noise Cancellation (ANC) up to 35dB, transparent ambient mode, ultra-low 45ms gaming latency, 13mm composite titanium drivers for rich punchy bass, 32-hour playback with magnetic USB-C charging case.',
    image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    stock_status: 'in_stock',
    keywords: ['earbuds', 'headphone', 'airpods', 'earphone', 'wireless earbuds', 'ইয়ারবাড', 'হেডফোন', 'ব্লুটুথ'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod_005',
    user_id: 'usr_demo_002',
    name: 'Urban Breathable Cushion Running Sneakers',
    price: 2200,
    currency: 'BDT',
    category: 'Footwear',
    description: 'Engineered fly-knit aerodynamic mesh upper with dual-density memory foam insole and slip-resistant rubber tread sole. Feather-light ergonomic design for all-day running, walking, or gym workouts. Available sizes: 40, 41, 42, 43, 44.',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    stock_status: 'in_stock',
    keywords: ['sneaker', 'shoes', 'shoe', 'juta', 'keds', 'স্নিকার্স', 'জুতা', 'কেডস'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Initial seed data
const initialData: DatabaseSchema = {
  businesses: [],
  facebook_pages: [],
  instagram_accounts: [],
  whatsapp_business_accounts: [],
  whatsapp_phone_numbers: [],
  webhook_events: [],
  audit_logs: [],
  products: defaultSeedProducts,
  profiles: [
    {
      id: 'usr_admin_001',
      email: process.env.ADMIN_EMAIL || 'admin@oneagentbd.online',
      full_name: 'Super Admin',
      role: 'admin',
      password: process.env.ADMIN_PASSWORD || 'Admin@OneAgentBD2026',
      is_suspended: false,
      llm_provider: 'gemini',
      system_prompt: 'You are an executive AI assistant for One Agent BD. Respond with concise, accurate information.',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'usr_demo_002',
      email: 'simanto1029@gmail.com',
      full_name: 'Simanto Rahman',
      role: 'admin',
      password: 'Admin@Simanto1029',
      is_suspended: false,
      llm_provider: 'gemini',
      system_prompt: `You are the responsible, polite, and efficient Customer Service AI assistant for One Agent BD.

Business Knowledge Base:
1. Services & Solutions:
   - Facebook Page and WhatsApp 24/7 AI Automation (automated text and voice responses).
   - E-commerce chatbot setup and autonomous order management.
   - Meta Cloud API integration and technical onboarding support.
   - Subscription Plan: All-in-One Plan 1,450 BDT/month (30 days) with 2-day free trial.
2. Payment & Delivery:
   - bKash and Nagad numbers: 01711-223344 (Send Money / Payment).
   - Digital services are activated immediately or within 24 hours.
   - Delivery fee for physical products: Inside Dhaka 60 BDT (24-48 hours), Outside Dhaka 120 BDT (2-3 days). Cash on Delivery available.
3. Order & Booking:
   - When a customer provides their name, phone number, and address, our AI agent logs their order.
4. Support & Hours:
   - Daily support from 9:00 AM to 11:00 PM. Helpline: 01811-998877.

MANDATORY RULES:
- Respond politely and directly in 1-2 concise English sentences.
- Never repeat or echo the customer's question.
- Provide clear prices and exact details directly based on the business knowledge.`,
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  plans: [
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
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      feature_config: {
        website_stores: true,
        call_requests: true,
        vip_broadcast: false,
        courier_dispatch: true,
        csv_export: false,
        max_channels: 3
      }
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
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      feature_config: {
        website_stores: true,
        call_requests: true,
        vip_broadcast: true,
        courier_dispatch: true,
        csv_export: true,
        max_channels: 10
      }
    }
  ],
  subscriptions: [
    {
      id: 'sub_demo_001',
      user_id: 'usr_demo_002',
      plan_id: 'plan_starter',
      status: 'trialing',
      start_date: new Date(Date.now() - 12 * 3600000).toISOString(),
      end_date: new Date(Date.now() + 36 * 3600000).toISOString(), // 1.5 days remaining
      created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'sub_admin_001',
      user_id: 'usr_admin_001',
      plan_id: 'plan_pro',
      status: 'active',
      start_date: new Date(Date.now() - 30 * 86400000).toISOString(),
      end_date: new Date(Date.now() + 365 * 86400000).toISOString(),
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  payments: [],
  coupons: [
    {
      id: 'cpn_welcome10',
      code: 'WELCOME10',
      discount_type: 'percentage',
      discount_value: 10,
      used_count: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'cpn_save250',
      code: 'SAVE250',
      discount_type: 'fixed',
      discount_value: 250,
      used_count: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  channels: [],
  messages: [],
  orders: [],
  settings: {
    site_name: 'One Agent BD',
    site_tagline: 'WhatsApp & Messenger AI Auto-Reply & Order Management',
    logo_url: '/logo.svg',
    promo_video_url: 'https://www.youtube.com/watch?v=aircAruvnKk',
    promo_video_thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85',
    bkash_number: '+8801700123456',
    nagad_number: '+8801800123456',
    support_email: 'support@oneagentbd.online',
    meta_description: 'Automate WhatsApp and Messenger customer inquiries and order confirmations with fine-tuned AI agents, unified inbox, and instant billing.',
    cron_last_run: new Date().toISOString(),
    cron_status: 'Healthy (Running hourly checks)'
  }
};

export const DEFAULT_ORDER_SETTINGS: OrderConfirmationSettings = {
  enabled: true,
  instructions: 'When a customer provides their name, 11-digit phone number, full delivery address (district, area), and confirms with "order confirm", "send it", or "cash on delivery", treat the order as confirmed. If any required detail is missing, politely ask the customer for it.',
  required_fields: {
    customer_name: true,
    customer_phone: true,
    customer_address: true,
    items_detail: true,
    trx_id: false
  },
  trigger_keywords: [
    'order confirm', 'confirm', 'send it', 'delivery', 'address', 'cash on delivery', 'cod', 'bkash sent', 'paid'
  ],
  auto_reply_confirmation: true,
  confirmation_message_template: 'Thank you {customer_name}! Your order for {items} has been successfully received. Order ID: #{order_id}. Total Bill: BDT {total_amount}. Our delivery team will contact you shortly.'
};

class Database {
  private data: DatabaseSchema;
  private isDirty: boolean = false;
  private lastSupabaseSyncAt: number = 0;
  private pendingFlushPromise: Promise<void> | null = null;
  private useNumericPayloadSchema: boolean = false;

  constructor() {
    this.data = this.loadData();
  }

  private getSupabaseConfig(): { url: string; key: string } | null {
    const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
    const key = (
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      ''
    ).trim();
    if (!url || !key) return null;
    return { url, key };
  }

  private normalizeSchema(parsed: any): DatabaseSchema {
    if (!parsed.orders) {
      parsed.orders = [];
    } else {
      parsed.orders = parsed.orders.filter(
        (o: Order) => !o.id.startsWith('ord_1726518491') && !o.id.startsWith('ord_1726518492')
      );
    }
    if (parsed.channels) {
      parsed.channels = parsed.channels.filter(
        (c: Channel) =>
          c.id !== 'chn_wa_001' &&
          c.id !== 'chn_fb_002' &&
          c.id !== 'chn_me_1789553189985_lrft' &&
          c.id !== 'chn_wh_1789555400609_26an' &&
          c.id !== 'chn_in_1789983618031_f34e'
      );
    }
    if (parsed.messages) {
      parsed.messages = parsed.messages.filter(
        (m: Message) => !['msg_001', 'msg_002', 'msg_003', 'msg_004'].includes(m.id)
      );
    }
    if (parsed.payments) {
      parsed.payments = parsed.payments.filter((p: Payment) => p.id !== 'pay_demo_001');
    }
    if (parsed.settings) {
      parsed.settings.site_name = parsed.settings.site_name || 'One Agent BD';
    } else {
      parsed.settings = initialData.settings;
    }
    if (!parsed.plans || parsed.plans.length === 0) {
      parsed.plans = initialData.plans;
    }
    if (!parsed.businesses) parsed.businesses = [];
    if (!parsed.facebook_pages) parsed.facebook_pages = [];
    if (!parsed.instagram_accounts) parsed.instagram_accounts = [];
    if (!parsed.whatsapp_business_accounts) parsed.whatsapp_business_accounts = [];
    if (!parsed.whatsapp_phone_numbers) parsed.whatsapp_phone_numbers = [];
    if (!parsed.webhook_events) parsed.webhook_events = [];
    if (!parsed.audit_logs) parsed.audit_logs = [];
    if (!parsed.coupons) parsed.coupons = initialData.coupons || [];
    if (!parsed.reviews) parsed.reviews = defaultSeedReviews;
    if (!parsed.products || parsed.products.length === 0) parsed.products = defaultSeedProducts;
    if (!parsed.subscriptions) parsed.subscriptions = initialData.subscriptions;
    if (parsed.profiles) {
      const seenEmails = new Set<string>();
      const uniqueProfiles: Profile[] = [];
      parsed.profiles.forEach((p: Profile) => {
        p.email = (p.email || '').trim().toLowerCase();
        if (!p.email || seenEmails.has(p.email)) {
          return;
        }
        seenEmails.add(p.email);
        if (p.id === 'usr_admin_001') {
          if (process.env.ADMIN_EMAIL) p.email = process.env.ADMIN_EMAIL.trim().toLowerCase();
          if (!p.password) p.password = process.env.ADMIN_PASSWORD || 'Admin@OneAgentBD2026';
          p.role = 'admin';
        }
        if (p.email === 'simanto1029@gmail.com') {
          p.role = 'admin';
          if (!p.password) p.password = 'Admin@Simanto1029';
        }
        if (
          !p.system_prompt ||
          p.system_prompt.includes('You are a warm, professional customer support AI agent for our business.')
        ) {
          p.system_prompt = `আপনি "${p.full_name || 'One Agent BD'}"-এর অফিসিয়াল কাস্টমার সার্ভিস ও সেলস AI অ্যাসিস্ট্যান্ট।

Business Knowledge Base (ব্যবসায়িক তথ্য):
1. সার্ভিস ও প্রোডাক্ট:
   - WhatsApp, Facebook Messenger ও Instagram 24/7 AI অটো-রিপ্লাই, ভয়েস মেসেজ ট্রান্সক্রিপশন এবং ই-কমার্স অর্ডার অটোমেশন।
   - আমাদের ২টি প্ল্যান: Starter AI Plan (৳১,২৫০/মাস) এবং Pro Business Plan (৳১,৯৫০/মাস), সাথে ২ দিনের ফ্রি ট্রায়াল।
2. ডেলিভারি ও চার্জ:
   - ডিজিটাল সার্ভিস তাৎক্ষণিক অ্যাক্টিভ হয়। ফিজিক্যাল পার্সেল ডেলিভারি: ঢাকার ভেতরে ৳৬০ (২৪-৪৮ ঘণ্টা), ঢাকার বাইরে সারাদেশে ৳১২০ (২-৩ দিন)। ক্যাশ অন ডেলিভারি (COD) সুবিধা আছে।
3. পেমেন্ট পদ্ধতি:
   - বিকাশ, নগদ, রকেট এবং ক্যাশ অন ডেলিভারি (COD)। মার্চেন্ট নাম্বার: 01711-223344।
4. অর্ডার করার নিয়ম:
   - অর্ডার কনফার্ম করতে কাস্টমারের নাম, সম্পূর্ণ ঠিকানা এবং ১১ ডিজিটের মোবাইল নাম্বার প্রয়োজন।
5. সাপোর্ট ও হেল্পলাইন:
   - প্রতিদিন সকাল ৯টা থেকে রাত ১১টা পর্যন্ত। হেল্পলাইন: 01811-998877।

MANDATORY LANGUAGE & REPLY RULES:
- কাস্টমার বাংলা (Bangla) বা বাংলিশ (Banglish - ইংরেজি অক্ষরে বাংলা লেখা) যেভাবেই প্রশ্ন করুক না কেন, সর্বদা সুন্দর, মার্জিত ও প্রাকৃতিক বাংলা ভাষায় (বাংলা স্ক্রিপ্টে) উত্তর দিন।
- উত্তর সংক্ষিপ্ত, স্পষ্ট এবং ১-৩ বাক্যের মধ্যে রাখুন।`;
        }
        uniqueProfiles.push(p);
      });
      parsed.profiles = uniqueProfiles;
    } else {
      parsed.profiles = initialData.profiles;
    }
    return parsed as DatabaseSchema;
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const sourceFile = fs.existsSync(DB_FILE)
        ? DB_FILE
        : fs.existsSync(BUNDLED_DB_FILE)
          ? BUNDLED_DB_FILE
          : null;

      if (sourceFile) {
        const content = fs.readFileSync(sourceFile, 'utf-8');
        const parsed = this.normalizeSchema(JSON.parse(content));
        this.saveData(parsed);
        return parsed;
      }
    } catch (err) {
      console.warn('Error reading db.json, falling back to initial seed:', err);
    }
    this.saveData(initialData);
    return initialData;
  }

  private saveData(data: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving db.json:', err);
    }
  }

  private persist(): void {
    this.saveData(this.data);
    this.isDirty = true;
    if (this.getSupabaseConfig()) {
      this.pendingFlushPromise = this.pushToSupabase().catch((err) => {
        console.warn('[Supabase Sync] Background push warning:', err?.message || err);
      });
    }
  }

  private getSupabaseHeaders(key: string, extra: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      apikey: key,
      ...extra
    };
    // Legacy JWT keys start with 'eyJ' and require Authorization: Bearer <jwt>
    // New Supabase keys (sb_secret_... / sb_publishable_...) use the 'apikey' header which Supabase Gateway exchanges for a JWT
    if (key.startsWith('eyJ')) {
      headers.Authorization = `Bearer ${key}`;
    }
    return headers;
  }

  private async pushToSupabase(): Promise<void> {
    const cfg = this.getSupabaseConfig();
    if (!cfg) return;
    this.isDirty = false;
    const headers = this.getSupabaseHeaders(cfg.key, {
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal'
    });
    const nowIso = new Date().toISOString();

    const tryPost = async (bodyObj: Record<string, any>) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      try {
        return await fetch(`${cfg.url}/rest/v1/app_state`, {
          method: 'POST',
          headers,
          body: JSON.stringify(bodyObj),
          signal: controller.signal
        });
      } finally {
        clearTimeout(timer);
      }
    };

    if (this.useNumericPayloadSchema) {
      const res = await tryPost({ id: 1, payload: this.data, updated_at: nowIso });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Supabase upsert HTTP ${res.status}: ${errText}`);
      }
      this.lastSupabaseSyncAt = Date.now();
      return;
    }

    const response = await tryPost({
      id: 'main',
      state_data: this.data,
      updated_at: nowIso
    });
    if (!response.ok) {
      // Fallback for (id INT PRIMARY KEY, payload JSONB) table schema
      const fallbackRes = await tryPost({
        id: 1,
        payload: this.data,
        updated_at: nowIso
      });
      if (fallbackRes.ok) {
        this.useNumericPayloadSchema = true;
        this.lastSupabaseSyncAt = Date.now();
        return;
      }
      const errText = await fallbackRes.text().catch(() => '');
      throw new Error(`Supabase upsert HTTP ${fallbackRes.status}: ${errText}`);
    }
    this.lastSupabaseSyncAt = Date.now();
  }

  public async syncFromSupabase(force = false): Promise<void> {
    const cfg = this.getSupabaseConfig();
    if (!cfg) return;
    // Avoid redundant fetches within 2 seconds if no writes occurred
    if (!force && !IS_VERCEL && Date.now() - this.lastSupabaseSyncAt < 2000) {
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(`${cfg.url}/rest/v1/app_state?select=*&limit=1`, {
        method: 'GET',
        headers: this.getSupabaseHeaders(cfg.key, {
          Accept: 'application/json'
        }),
        signal: controller.signal
      });
      if (!response.ok) return;
      const rows = await response.json();
      if (Array.isArray(rows) && rows.length > 0 && rows[0]) {
        const row = rows[0];
        if ('payload' in row || typeof row.id === 'number') {
          this.useNumericPayloadSchema = true;
        }
        const rawState = row.state_data || row.payload;
        if (rawState && typeof rawState === 'object') {
          this.data = this.normalizeSchema(rawState);
          this.saveData(this.data);
          this.lastSupabaseSyncAt = Date.now();
        }
      } else if (Array.isArray(rows) && rows.length === 0) {
        // First time initialization in Supabase: seed current data
        await this.pushToSupabase();
      }
    } catch (err: any) {
      console.warn('[Supabase Sync] Pull warning:', err?.message || err);
    } finally {
      clearTimeout(timer);
    }
  }

  public async flushToSupabase(): Promise<void> {
    if (this.pendingFlushPromise) {
      await this.pendingFlushPromise;
      this.pendingFlushPromise = null;
    }
    if (this.isDirty) {
      await this.pushToSupabase().catch((err) => {
        console.warn('[Supabase Sync] Flush warning:', err?.message || err);
      });
    }
  }

  // --- Profiles ---
  getProfiles(): Profile[] {
    return this.data.profiles;
  }

  getProfileById(id: string): Profile | undefined {
    return this.data.profiles.find((p) => p.id === id);
  }

  getProfileByEmail(email: string): Profile | undefined {
    const clean = (email || '').trim().toLowerCase();
    if (!clean) return undefined;
    return this.data.profiles.find((p) => p.email.trim().toLowerCase() === clean);
  }

  createProfile(profile: Profile): Profile {
    const cleanEmail = (profile.email || '').trim().toLowerCase();
    if (this.getProfileByEmail(cleanEmail)) {
      throw new Error(
        'এই ইমেইল অ্যাড্রেস দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট খোলা হয়েছে! একটি ইমেইল দিয়ে একবারের বেশি অ্যাকাউন্ট খোলা যাবে না। অনুগ্রহ করে Sign In করুন।'
      );
    }
    const normalizedProfile: Profile = {
      ...profile,
      email: cleanEmail
    };
    this.data.profiles.push(normalizedProfile);
    this.persist();
    return normalizedProfile;
  }

  updateProfile(id: string, updates: Partial<Profile>): Profile | undefined {
    const idx = this.data.profiles.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    this.data.profiles[idx] = {
      ...this.data.profiles[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.persist();
    return this.data.profiles[idx];
  }

  // --- Plans ---
  getPlans(): Plan[] {
    return this.data.plans;
  }

  getActivePlans(): Plan[] {
    return this.data.plans.filter((p) => p.is_active);
  }

  getPlanById(id: string): Plan | undefined {
    return this.data.plans.find((p) => p.id === id);
  }

  createPlan(plan: Plan): Plan {
    this.data.plans.push(plan);
    this.persist();
    return plan;
  }

  updatePlan(id: string, updates: Partial<Plan>): Plan | undefined {
    const idx = this.data.plans.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    this.data.plans[idx] = {
      ...this.data.plans[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.persist();
    return this.data.plans[idx];
  }

  deletePlan(id: string): boolean {
    const idx = this.data.plans.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.data.plans.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Subscriptions ---
  getSubscriptions(): Subscription[] {
    return this.data.subscriptions;
  }

  getSubscriptionByUserId(userId: string): Subscription | undefined {
    return this.data.subscriptions.find((s) => s.user_id === userId);
  }

  createSubscription(sub: Subscription): Subscription {
    // Remove previous sub if any
    this.data.subscriptions = this.data.subscriptions.filter((s) => s.user_id !== sub.user_id);
    this.data.subscriptions.push(sub);
    this.persist();
    return sub;
  }

  updateSubscription(id: string, updates: Partial<Subscription>): Subscription | undefined {
    const idx = this.data.subscriptions.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    this.data.subscriptions[idx] = {
      ...this.data.subscriptions[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.persist();
    return this.data.subscriptions[idx];
  }

  // --- Payments ---
  getPayments(): Payment[] {
    return this.data.payments;
  }

  getPaymentsByUserId(userId: string): Payment[] {
    return this.data.payments.filter((p) => p.user_id === userId);
  }

  getPaymentById(id: string): Payment | undefined {
    return this.data.payments.find((p) => p.id === id);
  }

  createPayment(payment: Payment): Payment {
    this.data.payments.unshift(payment);
    this.persist();
    return payment;
  }

  updatePayment(id: string, updates: Partial<Payment>): Payment | undefined {
    const idx = this.data.payments.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    this.data.payments[idx] = {
      ...this.data.payments[idx],
      ...updates
    };
    this.persist();
    return this.data.payments[idx];
  }

  // --- Channels ---
  getChannels(userId?: string): Channel[] {
    if (userId) {
      return this.data.channels.filter((c) => c.user_id === userId);
    }
    return this.data.channels;
  }

  getChannelById(id: string): Channel | undefined {
    return this.data.channels.find((c) => c.id === id);
  }

  getChannelByIdentifier(platform: 'whatsapp' | 'messenger' | 'instagram', identifier: string): Channel | undefined {
    const cleanId = String(identifier || '').trim().toLowerCase();
    if (!cleanId) return undefined;

    // 1. Exact match with active channel
    const exact = this.data.channels.find(
      (c) => c.platform === platform && c.identifier.trim().toLowerCase() === cleanId && c.is_active
    );
    if (exact) return exact;

    // 2. Flexible matching (ignoring "page_", "+", or whitespace)
    const flexible = this.data.channels.find((c) => {
      if (c.platform !== platform || !c.is_active) return false;
      const cId = c.identifier.trim().toLowerCase();
      return (
        cId === cleanId ||
        cId.replace(/^page_/, '') === cleanId.replace(/^page_/, '') ||
        cId.replace(/^\+/, '') === cleanId.replace(/^\+/, '')
      );
    });
    if (flexible) return flexible;

    // 3. Resilient single-channel fallback: If the merchant has configured 1 active channel for this platform,
    // match it so incoming webhooks are not discarded due to minor Meta identifier variances
    const platformChannels = this.data.channels.filter((c) => c.platform === platform && c.is_active);
    if (platformChannels.length === 1) {
      console.log(`[Database] Resilient fallback matched incoming ${platform} (${identifier}) to configured channel ${platformChannels[0].identifier}`);
      return platformChannels[0];
    }

    return undefined;
  }

  createChannel(channel: Channel): Channel {
    this.data.channels.push(channel);
    this.persist();
    return channel;
  }

  updateChannel(id: string, updates: Partial<Channel>): Channel | undefined {
    const idx = this.data.channels.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.data.channels[idx] = {
      ...this.data.channels[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.persist();
    return this.data.channels[idx];
  }

  deleteChannel(id: string, userId: string): boolean {
    const idx = this.data.channels.findIndex((c) => c.id === id && c.user_id === userId);
    if (idx === -1) return false;
    this.data.channels.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Multi-Tenant Businesses ---
  getBusinesses(userId?: string): Business[] {
    const bizList = this.data.businesses || [];
    if (userId) {
      return bizList.filter((b) => b.user_id === userId);
    }
    return bizList;
  }

  createBusiness(biz: Business): Business {
    if (!this.data.businesses) this.data.businesses = [];
    this.data.businesses.push(biz);
    this.persist();
    return biz;
  }

  // --- Facebook Pages Assets ---
  getFacebookPages(userId?: string): FacebookPage[] {
    const list = this.data.facebook_pages || [];
    if (userId) {
      return list.filter((p) => p.user_id === userId);
    }
    return list;
  }

  saveFacebookPage(page: FacebookPage): FacebookPage {
    if (!this.data.facebook_pages) this.data.facebook_pages = [];
    const idx = this.data.facebook_pages.findIndex((p) => p.id === page.id && p.user_id === page.user_id);
    if (idx >= 0) {
      this.data.facebook_pages[idx] = {
        ...this.data.facebook_pages[idx],
        ...page,
        updated_at: new Date().toISOString()
      };
    } else {
      this.data.facebook_pages.push(page);
    }
    this.persist();
    return page;
  }

  deleteFacebookPage(pageId: string, userId: string): boolean {
    if (!this.data.facebook_pages) return false;
    const idx = this.data.facebook_pages.findIndex((p) => p.id === pageId && p.user_id === userId);
    if (idx === -1) return false;
    this.data.facebook_pages.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Instagram Accounts Assets ---
  getInstagramAccounts(userId?: string): InstagramAccount[] {
    const list = this.data.instagram_accounts || [];
    if (userId) {
      return list.filter((a) => a.user_id === userId);
    }
    return list;
  }

  saveInstagramAccount(account: InstagramAccount): InstagramAccount {
    if (!this.data.instagram_accounts) this.data.instagram_accounts = [];
    const idx = this.data.instagram_accounts.findIndex((a) => a.id === account.id && a.user_id === account.user_id);
    if (idx >= 0) {
      this.data.instagram_accounts[idx] = {
        ...this.data.instagram_accounts[idx],
        ...account,
        updated_at: new Date().toISOString()
      };
    } else {
      this.data.instagram_accounts.push(account);
    }
    this.persist();
    return account;
  }

  // --- WhatsApp Business Accounts & Phone Numbers ---
  getWhatsAppAccounts(userId?: string): WhatsAppBusinessAccount[] {
    const list = this.data.whatsapp_business_accounts || [];
    if (userId) {
      return list.filter((w) => w.user_id === userId);
    }
    return list;
  }

  saveWhatsAppAccount(waba: WhatsAppBusinessAccount): WhatsAppBusinessAccount {
    if (!this.data.whatsapp_business_accounts) this.data.whatsapp_business_accounts = [];
    const idx = this.data.whatsapp_business_accounts.findIndex((w) => w.id === waba.id && w.user_id === waba.user_id);
    if (idx >= 0) {
      this.data.whatsapp_business_accounts[idx] = {
        ...this.data.whatsapp_business_accounts[idx],
        ...waba,
        updated_at: new Date().toISOString()
      };
    } else {
      this.data.whatsapp_business_accounts.push(waba);
    }
    this.persist();
    return waba;
  }

  getWhatsAppPhoneNumbers(userId?: string): WhatsAppPhoneNumber[] {
    const list = this.data.whatsapp_phone_numbers || [];
    if (userId) {
      return list.filter((p) => p.user_id === userId);
    }
    return list;
  }

  saveWhatsAppPhoneNumber(phone: WhatsAppPhoneNumber): WhatsAppPhoneNumber {
    if (!this.data.whatsapp_phone_numbers) this.data.whatsapp_phone_numbers = [];
    const idx = this.data.whatsapp_phone_numbers.findIndex((p) => p.id === phone.id && p.user_id === phone.user_id);
    if (idx >= 0) {
      this.data.whatsapp_phone_numbers[idx] = {
        ...this.data.whatsapp_phone_numbers[idx],
        ...phone,
        updated_at: new Date().toISOString()
      };
    } else {
      this.data.whatsapp_phone_numbers.push(phone);
    }
    this.persist();
    return phone;
  }

  // --- Webhook Events Logging ---
  logWebhookEvent(event: WebhookEventLog): WebhookEventLog {
    if (!this.data.webhook_events) this.data.webhook_events = [];
    this.data.webhook_events.unshift(event);
    if (this.data.webhook_events.length > 200) {
      this.data.webhook_events = this.data.webhook_events.slice(0, 200);
    }
    this.persist();
    return event;
  }

  getWebhookEvents(limit = 50): WebhookEventLog[] {
    const list = this.data.webhook_events || [];
    return list.slice(0, limit);
  }

  // --- Audit Logs ---
  logAudit(log: AuditLog): AuditLog {
    if (!this.data.audit_logs) this.data.audit_logs = [];
    this.data.audit_logs.unshift(log);
    if (this.data.audit_logs.length > 200) {
      this.data.audit_logs = this.data.audit_logs.slice(0, 200);
    }
    this.persist();
    return log;
  }

  getAuditLogs(userId?: string, limit = 50): AuditLog[] {
    const list = this.data.audit_logs || [];
    if (userId) {
      return list.filter((l) => l.user_id === userId).slice(0, limit);
    }
    return list.slice(0, limit);
  }

  // --- Messages ---
  getMessages(userId: string, channelId?: string): Message[] {
    let msgs = this.data.messages.filter((m) => m.user_id === userId);
    if (channelId) {
      msgs = msgs.filter((m) => m.channel_id === channelId);
    }
    return msgs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  getAllMessages(): Message[] {
    return this.data.messages;
  }

  createMessage(msg: Message): Message {
    this.data.messages.push(msg);
    this.persist();
    return msg;
  }

  updateMessage(updatedMsg: Message): Message {
    const idx = this.data.messages.findIndex(m => m.id === updatedMsg.id);
    if (idx !== -1) {
      this.data.messages[idx] = updatedMsg;
      this.persist();
    }
    return updatedMsg;
  }

  // --- Orders ---
  getOrders(userId?: string): Order[] {
    const all = this.data.orders || [];
    const filtered = userId ? all.filter((o) => o.user_id === userId) : all;
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getOrderById(id: string): Order | undefined {
    return (this.data.orders || []).find((o) => o.id === id);
  }

  getOrdersByCustomerId(customerId: string): Order[] {
    return (this.data.orders || []).filter((o) => o.customer_id === customerId);
  }

  createOrder(order: Order): Order {
    if (!this.data.orders) {
      this.data.orders = [];
    }
    this.data.orders.unshift(order);
    this.persist();
    return order;
  }

  updateOrder(id: string, updates: Partial<Order>): Order | undefined {
    if (!this.data.orders) return undefined;
    const idx = this.data.orders.findIndex((o) => o.id === id);
    if (idx === -1) return undefined;
    this.data.orders[idx] = {
      ...this.data.orders[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.persist();
    return this.data.orders[idx];
  }

  deleteOrder(id: string): boolean {
    if (!this.data.orders) return false;
    const idx = this.data.orders.findIndex((o) => o.id === id);
    if (idx === -1) return false;
    this.data.orders.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Order Confirmation Settings ---
  getOrderSettings(userId: string): OrderConfirmationSettings {
    const profile = this.getProfileById(userId);
    if (profile && profile.order_settings) {
      return {
        ...DEFAULT_ORDER_SETTINGS,
        ...profile.order_settings,
        required_fields: {
          ...DEFAULT_ORDER_SETTINGS.required_fields,
          ...(profile.order_settings.required_fields || {})
        }
      };
    }
    return { ...DEFAULT_ORDER_SETTINGS };
  }

  updateOrderSettings(userId: string, updates: Partial<OrderConfirmationSettings>): OrderConfirmationSettings {
    const profile = this.getProfileById(userId);
    if (!profile) return { ...DEFAULT_ORDER_SETTINGS };
    const current = profile.order_settings || { ...DEFAULT_ORDER_SETTINGS };
    const updated: OrderConfirmationSettings = {
      ...current,
      ...updates,
      required_fields: {
        ...current.required_fields,
        ...(updates.required_fields || {})
      }
    };
    this.updateProfile(userId, { order_settings: updated });
    return updated;
  }

  // --- Store Integrations (Shopify, WooCommerce, Custom Website) ---
  getStores(userId?: string): StoreIntegration[] {
    const all = this.data.stores || [];
    const filtered = userId ? all.filter((s) => s.user_id === userId) : all;
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getStoreById(id: string): StoreIntegration | undefined {
    return (this.data.stores || []).find((s) => s.id === id);
  }

  createStore(store: StoreIntegration): StoreIntegration {
    if (!this.data.stores) {
      this.data.stores = [];
    }
    this.data.stores.unshift(store);
    this.persist();
    return store;
  }

  updateStore(id: string, updates: Partial<StoreIntegration>): StoreIntegration | undefined {
    if (!this.data.stores) return undefined;
    const idx = this.data.stores.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    this.data.stores[idx] = {
      ...this.data.stores[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.persist();
    return this.data.stores[idx];
  }

  deleteStore(id: string): boolean {
    if (!this.data.stores) return false;
    const idx = this.data.stores.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.data.stores.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Call Requests (Human Handover Queue) ---
  getCallRequests(userId?: string): CallRequest[] {
    const all = this.data.call_requests || [];
    const filtered = userId ? all.filter((c) => c.user_id === userId) : all;
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getCallRequestById(id: string): CallRequest | undefined {
    return (this.data.call_requests || []).find((c) => c.id === id);
  }

  createCallRequest(req: CallRequest): CallRequest {
    if (!this.data.call_requests) {
      this.data.call_requests = [];
    }
    this.data.call_requests.unshift(req);
    this.persist();
    return req;
  }

  updateCallRequest(id: string, updates: Partial<CallRequest>): CallRequest | undefined {
    if (!this.data.call_requests) return undefined;
    const idx = this.data.call_requests.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.data.call_requests[idx] = {
      ...this.data.call_requests[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.persist();
    return this.data.call_requests[idx];
  }

  deleteCallRequest(id: string): boolean {
    if (!this.data.call_requests) return false;
    const idx = this.data.call_requests.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.data.call_requests.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Products Catalog ---
  getProducts(userId?: string): Product[] {
    const list = this.data.products || [];
    if (userId) {
      return list.filter((p) => p.user_id === userId);
    }
    return list;
  }

  getProductById(id: string): Product | undefined {
    return (this.data.products || []).find((p) => p.id === id);
  }

  createProduct(product: Product): Product {
    if (!this.data.products) this.data.products = [];
    this.data.products.unshift(product);
    this.persist();
    return product;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    if (!this.data.products) return undefined;
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    this.data.products[idx] = {
      ...this.data.products[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.persist();
    return this.data.products[idx];
  }

  deleteProduct(id: string): boolean {
    if (!this.data.products) return false;
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.data.products.splice(idx, 1);
    this.persist();
    return true;
  }

  findProductForQuery(arg1: string, arg2?: string): Product | undefined {
    // In case params are passed as (userId, query) or (query, userId)
    let userId = arg1;
    let query = arg2 || '';
    if (arg1 && arg1.length > 20 && !arg2) {
      query = arg1;
      userId = '';
    } else if (arg2 && arg1 && arg1.includes(' ') && !arg2.includes(' ')) {
      query = arg1;
      userId = arg2;
    }

    const prods = this.getProducts(userId);
    if (!prods || prods.length === 0) return undefined;
    const q = (query || '').toLowerCase().trim();
    if (!q) return undefined;

    // Never match a product on pure greetings
    const pureGreetings = ['hello', 'hi', 'hey', 'hlw', 'salam', 'assalamu alaikum', 'হ্যালো', 'হাই', 'সালাম', 'আসসালামু আলাইকুম'];
    if (pureGreetings.includes(q)) {
      return undefined;
    }

    // 1. Direct match on keywords
    for (const prod of prods) {
      if (prod.keywords?.some((k) => k.trim().length >= 3 && q.includes(k.trim().toLowerCase()))) {
        return prod;
      }
    }

    // 2. Direct match on name words
    for (const prod of prods) {
      const words = prod.name.toLowerCase().split(/\s+/);
      if (words.some((w) => w.length > 3 && q.includes(w))) {
        return prod;
      }
    }

    // 3. Match on category
    for (const prod of prods) {
      if (prod.category && prod.category.trim().length >= 3 && q.includes(prod.category.toLowerCase())) {
        return prod;
      }
    }

    return undefined;
  }

  // --- Settings ---
  getSettings(): SystemSettings {
    return this.data.settings;
  }

  updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    this.data.settings = {
      ...this.data.settings,
      ...updates
    };
    this.persist();
    return this.data.settings;
  }

  // --- Coupons ---
  getCoupons(): Coupon[] {
    if (!this.data.coupons) this.data.coupons = [];
    const now = Date.now();
    let changed = false;
    for (const c of this.data.coupons) {
      if (c.is_active && c.expires_at && new Date(c.expires_at).getTime() <= now) {
        c.is_active = false;
        c.updated_at = new Date().toISOString();
        changed = true;
      }
    }
    if (changed) {
      this.persist();
    }
    return this.data.coupons;
  }

  getCouponById(id: string): Coupon | undefined {
    return this.getCoupons().find((c) => c.id === id);
  }

  getCouponByCode(code: string): Coupon | undefined {
    const clean = String(code || '').trim().toUpperCase();
    if (!clean) return undefined;
    return this.getCoupons().find((c) => c.code.toUpperCase() === clean);
  }

  createCoupon(coupon: Coupon): Coupon {
    if (!this.data.coupons) this.data.coupons = [];
    this.data.coupons.unshift(coupon);
    this.persist();
    return coupon;
  }

  updateCoupon(id: string, updates: Partial<Coupon>): Coupon | undefined {
    if (!this.data.coupons) this.data.coupons = [];
    const idx = this.data.coupons.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.data.coupons[idx] = {
      ...this.data.coupons[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.persist();
    return this.data.coupons[idx];
  }

  deleteCoupon(id: string): boolean {
    if (!this.data.coupons) return false;
    const idx = this.data.coupons.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.data.coupons.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Reviews ---
  getAllReviews(): ReviewItem[] {
    if (!this.data.reviews) {
      this.data.reviews = [...defaultSeedReviews];
      this.persist();
    } else {
      // Ensure any older seeded reviews with placeholder brand names are updated to authentic categories
      let migrated = false;
      for (const rev of this.data.reviews) {
        const seedMatch = defaultSeedReviews.find((s) => s.id === rev.id);
        if (seedMatch && (rev.business !== seedMatch.business || rev.role !== seedMatch.role)) {
          rev.role = seedMatch.role;
          rev.business = seedMatch.business;
          migrated = true;
        }
      }
      if (migrated) {
        this.persist();
      }
    }
    return this.data.reviews;
  }

  getApprovedReviews(): ReviewItem[] {
    return this.getAllReviews().filter((r) => r.status === 'approved');
  }

  createReview(review: ReviewItem): ReviewItem {
    if (!this.data.reviews) {
      this.data.reviews = [...defaultSeedReviews];
    }
    this.data.reviews.unshift(review);
    this.persist();
    return review;
  }

  updateReviewStatus(id: string, status: 'approved' | 'pending'): ReviewItem | undefined {
    const reviews = this.getAllReviews();
    const idx = reviews.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    reviews[idx].status = status;
    this.persist();
    return reviews[idx];
  }

  deleteReview(id: string): boolean {
    const reviews = this.getAllReviews();
    const idx = reviews.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    reviews.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Admin Broadcast Notifications ---
  getNotifications(): AdminNotification[] {
    if (!this.data.notifications) {
      this.data.notifications = [];
      this.persist();
    }
    return this.data.notifications;
  }

  getActiveNotifications(): AdminNotification[] {
    return this.getNotifications().filter((n) => n.is_active);
  }

  createNotification(notification: AdminNotification): AdminNotification {
    if (!this.data.notifications) {
      this.data.notifications = [];
    }
    this.data.notifications.unshift(notification);
    this.persist();
    return notification;
  }

  updateNotification(id: string, updates: Partial<AdminNotification>): AdminNotification | undefined {
    const list = this.getNotifications();
    const idx = list.findIndex((n) => n.id === id);
    if (idx === -1) return undefined;
    list[idx] = { ...list[idx], ...updates };
    this.persist();
    return list[idx];
  }

  deleteNotification(id: string): boolean {
    const list = this.getNotifications();
    const idx = list.findIndex((n) => n.id === id);
    if (idx === -1) return false;
    list.splice(idx, 1);
    this.persist();
    return true;
  }
}

export const db = new Database();
