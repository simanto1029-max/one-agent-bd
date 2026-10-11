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
  upsell_enabled?: boolean;
  upsell_offer_text?: string;
  auto_payment_verify_enabled?: boolean;
  auto_tracking_reply_enabled?: boolean;
  paused_customers?: string[];
  blocked_customers?: string[];
  daily_ad_spend_bdt?: number;
  avg_product_cost_percent?: number;
  return_courier_loss_per_order?: number;
  daily_whatsapp_vip_limit?: number;
  per_customer_daily_limit?: number;
  enforce_whatsapp_24h_window?: boolean;
}

export interface AppointmentBookingSettings {
  enabled: boolean;
  business_type: string;
  slot_duration_minutes: number;
  available_days: string[];
  start_time: string;
  end_time: string;
  available_slots: string[];
  services_offered: string[];
  location_address: string;
  auto_confirm_booking: boolean;
  google_calendar_auto_sync: boolean;
  confirmation_note: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  platform: 'whatsapp' | 'messenger' | 'instagram' | 'website' | 'manual';
  channel_id?: string;
  service_name: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // e.g., "04:00 PM"
  duration_minutes: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'rescheduled';
  booking_source: 'ai_chat' | 'manual' | 'website';
  notes?: string;
  location?: string;
  google_calendar_synced?: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailSmtpSettings {
  provider: 'gmail' | 'custom_smtp' | 'resend_api' | 'brevo_api';
  sender_name: string;
  sender_email: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass?: string;
  api_key?: string;
  reply_to?: string;
  is_configured: boolean;
}

export interface EmailSubscriber {
  id: string;
  user_id: string;
  email: string;
  name: string;
  phone?: string;
  tags: string[];
  source: 'manual' | 'csv_import' | 'chat_extracted' | 'order';
  status: 'subscribed' | 'unsubscribed';
  created_at: string;
}

export interface EmailCampaignRecipientLog {
  email: string;
  name?: string;
  sent_at: string;
  opened: boolean;
  opened_at?: string;
  open_count: number;
  clicked: boolean;
  clicked_at?: string;
  click_count: number;
}

export interface EmailCampaign {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  preheader?: string;
  body_html: string;
  cta_text?: string;
  cta_url?: string;
  audience_filter: 'all' | 'vip' | 'custom';
  status: 'sent' | 'draft' | 'sending';
  total_recipients: number;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  delivery_mode: 'live_smtp' | 'simulated';
  recipients: EmailCampaignRecipientLog[];
  created_at: string;
  sent_at?: string;
}

export interface AutoCourierDispatchSettings {
  enabled: boolean;
  scheduled_times: string[]; // 24-hour format: ["10:00", "23:00"]
  default_courier: string; // 'steadfast' | 'pathao' | 'redx' | 'paperfly' | 'ecourier'
  fraud_check_enabled: boolean;
  risk_rules: {
    min_address_length: number;
    require_valid_phone: boolean;
    flag_duplicate_phones: boolean;
    max_cod_amount_auto: number;
    flag_unspecified_items: boolean;
  };
  last_run_at?: string;
  last_run_summary?: {
    timestamp: string;
    total_scanned: number;
    dispatched_count: number;
    suspicious_count: number;
    courier: string;
    mode: string;
  };
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
  appointment_settings?: AppointmentBookingSettings;
  email_smtp_settings?: EmailSmtpSettings;
  courier_settings?: Record<string, any>;
  auto_courier_settings?: AutoCourierDispatchSettings;
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

export interface InteractiveOptionItem {
  id: string;
  title: string;
  description?: string;
  price?: number;
}

export interface InteractiveMessageButton {
  id: string;
  label: string;
  payload: string;
  icon?: 'order' | 'back' | 'home' | 'list' | 'call';
}

export interface InteractiveMessageConfig {
  type: 'list' | 'buttons' | 'order_card';
  listButtonLabel?: string;
  listButtonTitle?: string;
  listSectionTitle?: string;
  footerText?: string;
  orderCardText?: string;
  orderButtonLabel?: string;
  items?: InteractiveOptionItem[];
  listItems?: InteractiveOptionItem[];
  buttons?: InteractiveMessageButton[];
}

export interface Message {
  id: string;
  user_id: string;
  channel_id?: string;
  platform: 'whatsapp' | 'messenger' | 'instagram';
  customer_id: string;
  customer_name?: string;
  customer_avatar?: string;
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
  attached_images?: string[];
  attached_products?: any[];
  has_video?: boolean;
  video_base64?: string;
  video_mime_type?: string;
  interactive_options?: InteractiveMessageConfig;
  requires_human_attention?: boolean;
  attention_reason?: string;
  created_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  price: number;
  buying_price?: number;
  stock_quantity?: number;
  sold_count?: number;
  currency: string;
  category: string;
  description: string;
  image_url: string;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  keywords?: string[];
  created_at: string;
  updated_at: string;
}

export interface PurchaseRecord {
  id: string;
  user_id: string;
  supplier_name: string;
  supplier_phone?: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  paid_amount: number;
  due_amount: number;
  payment_method: 'cash' | 'bkash' | 'nagad' | 'bank';
  notes?: string;
  created_at: string;
}

export interface DueRecord {
  id: string;
  user_id: string;
  party_type: 'customer' | 'supplier';
  party_name: string;
  party_phone?: string;
  reference_type: 'order' | 'purchase' | 'manual';
  reference_id?: string;
  description: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  status: 'unpaid' | 'partial' | 'settled';
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface AccountTransaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  category: string;
  title: string;
  amount: number;
  payment_method: 'cash' | 'bkash' | 'nagad' | 'bank';
  reference_id?: string;
  notes?: string;
  created_at: string;
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
  advance_paid_amount?: number;
  payment_trx_id?: string;
  buying_cost?: number;
  notes?: string;
  product_summary?: string;
  courier_name?: string;
  courier_consignment_id?: string;
  courier_tracking_code?: string;
  courier_status?: string;
  is_suspicious?: boolean;
  suspicious_reason?: string;
  suspicious_detected_at?: string;
  manual_review_status?: 'pending_review' | 'approved' | 'rejected';
  auto_dispatch_skipped?: boolean;
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
  meta_config_id?: string;
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
  appointments?: Appointment[];
  email_subscribers?: EmailSubscriber[];
  email_campaigns?: EmailCampaign[];
  purchases?: PurchaseRecord[];
  dues?: DueRecord[];
  account_transactions?: AccountTransaction[];
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

export const defaultSeedProducts: Product[] = [];

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
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z'
    },
    {
      id: 'usr_demo_002',
      email: 'simanto1029@gmail.com',
      full_name: 'Simanto Rahman',
      role: 'admin',
      password: 'Admin@Simanto1029',
      is_suspended: false,
      llm_provider: 'gemini',
      system_prompt: `You are the official Customer Service & Sales AI Assistant for "One Agent BD".

Business Knowledge Base:
1. Services & Products:
   - 24/7 AI Auto-Reply for WhatsApp, Facebook Messenger, Instagram & Websites, Voice Message Transcription, and E-Commerce Order Automation.
   - 2 Official Plans: Starter AI Plan (1,250 BDT/month) and Pro Business Plan (1,950 BDT/month), plus a 2-Day Free Trial.
2. Payment & Support:
   - bKash, Nagad & Rocket automated gateway (pay.oneagentbd.online). Helpline: +8801601705804.

MANDATORY LANGUAGE & SERIAL LIST REPLY RULES:
- Reply in the same language the customer uses (if the customer asks in Bangla, Banglish, or Bangla voice note, reply in natural Bangla; if they ask in English, reply in clear English).
- Whenever the customer asks about plans, prices, products, what is available ("ki ki ase"), features, or details, always reply in a clean serial numbered list (১., ২., ৩. in Bangla or 1., 2., 3. in English) on separate lines.`,
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z'
    },
    {
      id: 'usr_reviewer_003',
      email: 'reviewer@oneagentbd.online',
      full_name: 'Meta App Reviewer',
      role: 'user',
      password: 'ReviewerPass2026!',
      is_suspended: false,
      llm_provider: 'gemini',
      system_prompt: 'You are the official Customer Service AI Assistant for One Agent BD.',
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z'
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
        '24/7 Active AI Sales & Auto-Reply Agent (Up to 3 Channels)',
        '1-Click Steadfast, Pathao & RedX Courier Dispatch',
        'AI Auto Customer Fraud & Courier Delivery Ratio Check',
        'AI Auto Delivery Tracking & Customer Live Status Update',
        'VIP Customer Retargeting & Smart Follow-Up Message',
        'WhatsApp, Facebook Messenger & Instagram Auto-Reply',
        'Voice Note AI Listening & Product Photo Recognition',
        'Auto Post Comment Reply + Direct Inbox (DM) Automation',
        'Unlimited Product Catalog & Autonomous Chat Order Capture',
        'Unlimited Customer Conversations (0 TK per-msg fee)'
      ],
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      feature_config: {
        website_stores: false,
        call_requests: false,
        vip_broadcast: true,
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
        'Everything in Starter Plan + Connect up to 10 Channels',
        'Accounts, Stock & Profit ERP (Sales, Purchase, Due & Cashbook)',
        'AI Appointments & Google Calendar Auto-Slot Booking',
        'Website, WooCommerce & Shopify Store Sync + Live Chat Widget',
        'AI Auto Delivery Tracking & Customer Live Status Update',
        'VIP Customer Retargeting Message & AI Email Marketing',
        '1-Click Steadfast, Pathao & RedX Courier Dispatch',
        'AI Auto Customer Fraud & Courier Delivery Ratio Check',
        'Customer Callback Queue, Human Handover & CSV/Text Export',
        '3 Autonomous AI Sales Agents & 24/7 VIP Priority Support'
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
    },
    {
      id: 'sub_reviewer_001',
      user_id: 'usr_reviewer_003',
      plan_id: 'plan_pro',
      status: 'active',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 365 * 86400000).toISOString(),
      created_at: new Date().toISOString(),
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
    meta_app_id: '1668233901609132',
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

export const DEFAULT_AUTO_COURIER_SETTINGS: AutoCourierDispatchSettings = {
  enabled: true,
  scheduled_times: ['10:00', '23:00'],
  default_courier: 'steadfast',
  fraud_check_enabled: true,
  risk_rules: {
    min_address_length: 12,
    require_valid_phone: true,
    flag_duplicate_phones: true,
    max_cod_amount_auto: 5000,
    flag_unspecified_items: true
  }
};

export const DEFAULT_AUTOMATION_SETTINGS: AutomationSettings = {
  auto_comment_reply_enabled: true,
  public_comment_reply_template:
    'Thank you {customer_name}! ❤️ We have sent a detailed reply and product information to your Inbox (Messenger/DM). Please check your inbox! 📩',
  send_private_inbox_on_comment: true,
  auto_followup_enabled: true,
  followup_delay_minutes: 45,
  followup_message_template:
    'Hello {customer_name}! 😊 You messaged our page earlier. Do you have any questions about our products or ordering? To confirm your order, simply reply with your Name, Full Address, and Phone Number—our AI will book your order right away! ❤️',
  upsell_enabled: true,
  upsell_offer_text:
    'Order any 2 items together to enjoy FREE delivery or a special 100 BDT discount!',
  auto_payment_verify_enabled: true,
  auto_tracking_reply_enabled: true,
  paused_customers: [],
  blocked_customers: [],
  daily_ad_spend_bdt: 500,
  avg_product_cost_percent: 55,
  return_courier_loss_per_order: 130
};

export const DEFAULT_APPOINTMENT_SETTINGS: AppointmentBookingSettings = {
  enabled: true,
  business_type: 'General Consultation & Service Booking',
  slot_duration_minutes: 30,
  available_days: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
  start_time: '10:00 AM',
  end_time: '08:00 PM',
  available_slots: [
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
    '06:00 PM',
    '07:00 PM',
    '08:00 PM'
  ],
  services_offered: [
    'General Consultation',
    'Product Demo & Live Walkthrough',
    'Service Appointment / Visit',
    'VIP 1-on-1 Session'
  ],
  location_address: 'Online Google Meet / Main Office Branch, Dhaka',
  auto_confirm_booking: true,
  google_calendar_auto_sync: true,
  confirmation_note: 'Please arrive or join 5 minutes before your scheduled appointment slot.'
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
      if (!parsed.settings.meta_app_id || parsed.settings.meta_app_id === '28133631089641045') {
        parsed.settings.meta_app_id = '1668233901609132';
      }
    } else {
      parsed.settings = initialData.settings;
    }
    if (!parsed.plans || parsed.plans.length === 0) {
      parsed.plans = initialData.plans;
    } else {
      parsed.plans = parsed.plans.map((p: Plan) => {
        if (p.id === 'plan_starter' || p.price === 1250) {
          return {
            ...p,
            price: 1250,
            trial_days: 2,
            features: initialData.plans[0].features,
            feature_config: initialData.plans[0].feature_config
          };
        }
        if (p.id === 'plan_pro' || p.price === 1950) {
          return {
            ...p,
            price: 1950,
            trial_days: 2,
            features: initialData.plans[1].features,
            feature_config: initialData.plans[1].feature_config
          };
        }
        return p;
      });
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
    if (!parsed.appointments) parsed.appointments = [];
    if (!parsed.email_subscribers) parsed.email_subscribers = [];
    if (!parsed.email_campaigns) parsed.email_campaigns = [];
    if (!parsed.products || parsed.products.length === 0) {
      const nowIso = new Date().toISOString();
      const defaultSeedItems: Product[] = [
        {
          id: 'prod_seed_cargo_01',
          user_id: 'usr_demo_002',
          name: 'Cargo Jogger Pant (Olive Green)',
          price: 1150,
          currency: 'BDT',
          category: 'Pants',
          description: 'Heavyweight stretchable cotton twill fabric with 6 utility pockets, elastic jogger ankles, and adjustable waist drawstrings. Available sizes: 30, 32, 34, 36.',
          image_url: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=600&auto=format&fit=crop&q=80',
          stock_status: 'in_stock',
          keywords: ['cargo', 'jogger', 'pant', 'olive', 'green', 'কার্গো', 'প্যান্ট', 'কটন'],
          created_at: nowIso,
          updated_at: nowIso
        },
        {
          id: 'prod_seed_denim_02',
          user_id: 'usr_demo_002',
          name: 'Slim Fit Denim Jeans (Deep Blue)',
          price: 1250,
          currency: 'BDT',
          category: 'Pants',
          description: 'Premium stretch denim with dark blue wash, reinforced stitching, and brass rivets. Soft and comfortable for everyday wear. Sizes: 30, 32, 34, 36.',
          image_url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
          stock_status: 'in_stock',
          keywords: ['denim', 'jeans', 'pant', 'blue', 'ডেনিম', 'জিন্স', 'প্যান্ট', 'স্লিম'],
          created_at: nowIso,
          updated_at: nowIso
        },
        {
          id: 'prod_seed_shirt_03',
          user_id: 'usr_demo_002',
          name: 'Casual Oxford Cotton Shirt (Sky Blue)',
          price: 850,
          currency: 'BDT',
          category: 'Shirts',
          description: '100% combed breathable cotton Oxford shirt with button-down collar and curved hem. Perfect for all seasons. Sizes: M, L, XL, XXL.',
          image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
          stock_status: 'in_stock',
          keywords: ['shirt', 'oxford', 'cotton', 'blue', 'শার্ট', 'কটন', 'ফুল হাতা'],
          created_at: nowIso,
          updated_at: nowIso
        },
        {
          id: 'prod_seed_watch_04',
          user_id: 'usr_demo_002',
          name: 'Smart Calling Watch (Series 9 Metallic Black)',
          price: 2450,
          currency: 'BDT',
          category: 'Watches',
          description: '1.99 inch HD AMOLED screen with Bluetooth call support, heart rate and blood oxygen monitoring, 100+ sports modes, and 5-day battery backup. IP68 water resistant.',
          image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
          stock_status: 'in_stock',
          keywords: ['watch', 'smartwatch', 'smart', 'calling', 'ঘড়ি', 'ঘড়ি', 'স্মার্টওয়াচ'],
          created_at: nowIso,
          updated_at: nowIso
        }
      ];
      // Also copy to usr_admin_001
      const adminItems = defaultSeedItems.map((p) => ({
        ...p,
        id: p.id.replace('prod_seed_', 'prod_admin_'),
        user_id: 'usr_admin_001'
      }));
      parsed.products = [...defaultSeedItems, ...adminItems];
    } else {
      // Fix any mismatched seed image URLs in existing database records
      parsed.products.forEach((p: Product) => {
        if (p.name.includes('Denim Jeans') && (p.image_url?.includes('photo-1542272604') || p.image_url?.includes('523275335684'))) {
          p.image_url = 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80';
        } else if (p.name.includes('Cargo Jogger') && (p.image_url?.includes('photo-1624378439575') || p.image_url?.includes('542272604'))) {
          p.image_url = 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=600&auto=format&fit=crop&q=80';
        }
      });
      parsed.products = parsed.products.filter(
        (p: Product) => !['prod_001', 'prod_002', 'prod_003', 'prod_004', 'prod_005'].includes(p.id)
      );
    }
    if (Array.isArray(parsed.messages)) {
      parsed.messages.forEach((m: Message) => {
        if (m.user_id === 'usr_admin_001' || m.user_id === 'usr_admin_1') {
          delete m.interactive_options;
        }
      });
    }
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
        // Strip old revoked demo OpenAI key so it never blocks Gemini or overwrites user settings
        if (p.llm_api_key && p.llm_api_key.trim().startsWith('sk-proj-wJiInvQ')) {
          delete p.llm_api_key;
        }
        if (
          !p.system_prompt ||
          p.system_prompt.includes('You are a warm, professional customer support AI agent for our business.') ||
          p.system_prompt.includes('Subscription Plan: All-in-One Plan 1,450 BDT/month') ||
          p.system_prompt.includes('Subscription Plans: Standard Plan 899 BDT/month') ||
          p.system_prompt.includes('Business Knowledge Base (ব্যবসায়িক তথ্য):')
        ) {
          p.system_prompt = `You are the official Customer Service & Sales AI Assistant for "${p.full_name || 'One Agent BD'}".

Business Knowledge Base:
1. Services & Products:
   - 24/7 AI Auto-Reply for WhatsApp, Facebook Messenger, Instagram & Websites, Voice Message Transcription, and E-Commerce Order Automation.
   - 2 Official Plans: Starter AI Plan (1,250 BDT/month) and Pro Business Plan (1,950 BDT/month), plus a 2-Day Free Trial.
2. Delivery & Charges:
   - Digital services activate instantly. Physical parcel delivery: Inside Dhaka 60 BDT (24-48 hours), Outside Dhaka nationwide 120 BDT (2-3 days). Cash on Delivery (COD) available.
3. Payment Methods:
   - bKash, Nagad, Rocket, and Cash on Delivery (COD). Merchant Number: 01711-223344.
4. How to Order:
   - To confirm an order, we require the customer's Full Name, Complete Delivery Address, and 11-digit Phone Number.
5. Support & Helpline:
   - Open daily from 9:00 AM to 11:00 PM. Helpline: 01811-998877.

MANDATORY LANGUAGE & SERIAL LIST REPLY RULES:
- If the customer writes in Bangla or Banglish, reply in natural, polite Bangla script. If the customer writes in English, reply in clear English.
- Whenever the customer asks about plans, prices, products, what is available ("ki ki ase"), features, or details, always format them as a clean serial numbered list (১., ২., ৩. in Bangla or 1., 2., 3. in English) on separate lines.`;
        }
        if (p.system_prompt) {
          p.system_prompt = p.system_prompt
            .replace(/Never send long paragraphs or unnecessary lists\./gi, '')
            .replace(/Keep replies concise, clear, and within 1-3 sentences\./gi, 'Whenever the customer asks about plans, prices, products, what is available ("ki ki ase"), or details, format them as a clean serial numbered list (১., ২., ৩. in Bangla or 1., 2., 3. in English) on separate lines.')
            .replace(/Always keep replies concise and to the point \(maximum 2 to 3 sentences\)\./gi, 'Whenever the customer asks about plans, prices, products, what is available ("ki ki ase"), or details, format them as a clean serial numbered list (১., ২., ৩. in Bangla or 1., 2., 3. in English) on separate lines.')
            .replace(/in 2-3 concise sentences\./gi, 'using a clean serial numbered list (১., ২., ৩.) when listing plans, prices, products, or details.');
        }
        if (p.automation_settings) {
          if (
            p.automation_settings.public_comment_reply_template &&
            p.automation_settings.public_comment_reply_template.includes('আপনার কমেন্টের বিস্তারিত উত্তর')
          ) {
            p.automation_settings.public_comment_reply_template =
              'Thank you {customer_name}! ❤️ We have sent a detailed reply and product information to your Inbox (Messenger/DM). Please check your inbox! 📩';
          }
          if (
            p.automation_settings.followup_message_template &&
            p.automation_settings.followup_message_template.includes('আপনি কিছুক্ষণ আগে আমাদের পেজে মেসেজ দিয়েছিলেন')
          ) {
            p.automation_settings.followup_message_template =
              'Hello {customer_name}! 😊 You messaged our page earlier. Do you have any questions about our products or ordering? To confirm your order, simply reply with your Name, Full Address, and Phone Number—our AI will book your order right away! ❤️';
          }
          if (
            p.automation_settings.upsell_offer_text &&
            p.automation_settings.upsell_offer_text.includes('২টি প্রোডাক্ট একসাথে অর্ডার করলে')
          ) {
            p.automation_settings.upsell_offer_text =
              'Order any 2 items together to enjoy FREE delivery or a special 100 BDT discount!';
          }
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

  private lastLocalWriteAt: number = 0;

  private persist(): void {
    this.lastLocalWriteAt = Date.now();
    (this.data as any)._lastUpdatedAt = this.lastLocalWriteAt;
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

  private buildCompactCloudSnapshot(): DatabaseSchema {
    const snapshot: any = {
      ...this.data,
      _lastUpdatedAt: this.lastLocalWriteAt || (this.data as any)._lastUpdatedAt || Date.now()
    };
    if (Array.isArray(this.data.messages) && this.data.messages.length > 0) {
      // Strip large base64 blobs from older messages so cloud JSONB sync stays fast & lightweight
      const cutoffIdx = Math.max(0, this.data.messages.length - 5);
      snapshot.messages = this.data.messages.map((m, idx) => {
        if (idx < cutoffIdx && (m.audio_base64 || m.image_base64)) {
          const { audio_base64, image_base64, ...rest } = m;
          return rest;
        }
        return m;
      });
    }
    return snapshot;
  }

  private async pushToSupabase(): Promise<void> {
    const cfg = this.getSupabaseConfig();
    if (!cfg) return;
    this.isDirty = false;
    const upsertHeaders = this.getSupabaseHeaders(cfg.key, {
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal'
    });
    const patchHeaders = this.getSupabaseHeaders(cfg.key, {
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    });
    const nowIso = new Date().toISOString();
    const snapshot = this.buildCompactCloudSnapshot();

    const tryRequest = async (urlPath: string, method: string, hdrs: Record<string, string>, bodyObj: Record<string, any>) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      try {
        return await fetch(`${cfg.url}${urlPath}`, {
          method,
          headers: hdrs,
          body: JSON.stringify(bodyObj),
          signal: controller.signal
        });
      } finally {
        clearTimeout(timer);
      }
    };

    // Also mirror state backup into system_settings (present in all schema versions)
    tryRequest('/rest/v1/system_settings?on_conflict=key', 'POST', upsertHeaders, {
      key: 'app_state_backup',
      value: snapshot,
      updated_at: nowIso
    }).catch(() => {});

    if (this.useNumericPayloadSchema) {
      let res = await tryRequest('/rest/v1/app_state?on_conflict=id', 'POST', upsertHeaders, {
        id: 1,
        payload: snapshot,
        updated_at: nowIso
      });
      if (!res.ok) {
        res = await tryRequest('/rest/v1/app_state?id=eq.1', 'PATCH', patchHeaders, {
          payload: snapshot,
          updated_at: nowIso
        });
      }
      if (res.ok) {
        this.lastSupabaseSyncAt = Date.now();
        return;
      }
    }

    let response = await tryRequest('/rest/v1/app_state?on_conflict=id', 'POST', upsertHeaders, {
      id: 'main',
      state_data: snapshot,
      updated_at: nowIso
    });
    if (!response.ok) {
      response = await tryRequest('/rest/v1/app_state?id=eq.main', 'PATCH', patchHeaders, {
        state_data: snapshot,
        updated_at: nowIso
      });
    }
    if (response.ok) {
      this.lastSupabaseSyncAt = Date.now();
      return;
    }

    // Fallback for (id INT PRIMARY KEY, payload JSONB) table schema
    let fallbackRes = await tryRequest('/rest/v1/app_state?on_conflict=id', 'POST', upsertHeaders, {
      id: 1,
      payload: snapshot,
      updated_at: nowIso
    });
    if (!fallbackRes.ok) {
      fallbackRes = await tryRequest('/rest/v1/app_state?id=eq.1', 'PATCH', patchHeaders, {
        payload: snapshot,
        updated_at: nowIso
      });
    }
    if (fallbackRes.ok) {
      this.useNumericPayloadSchema = true;
      this.lastSupabaseSyncAt = Date.now();
      return;
    }
  }

  private mergeLocalNewerProfiles(incoming: DatabaseSchema): DatabaseSchema {
    if (!this.data?.profiles || !incoming?.profiles) return incoming;
    const localMap = new Map<string, Profile>();
    for (const p of this.data.profiles) {
      localMap.set(p.id, p);
    }

    const hasInMemoryWrites = this.lastLocalWriteAt > 0;

    incoming.profiles = incoming.profiles.map((remoteProf) => {
      const localProf = localMap.get(remoteProf.id);
      if (!localProf) return remoteProf;

      const cleanLocalKey =
        localProf.llm_api_key && !localProf.llm_api_key.trim().startsWith('sk-proj-wJiInvQ')
          ? localProf.llm_api_key.trim()
          : '';
      const cleanRemoteKey =
        remoteProf.llm_api_key && !remoteProf.llm_api_key.trim().startsWith('sk-proj-wJiInvQ')
          ? remoteProf.llm_api_key.trim()
          : '';

      if (hasInMemoryWrites) {
        const localTime = localProf.updated_at ? new Date(localProf.updated_at).getTime() : 0;
        const remoteTime = remoteProf.updated_at ? new Date(remoteProf.updated_at).getTime() : 0;
        if (localTime >= remoteTime) {
          return {
            ...remoteProf,
            ...localProf,
            llm_api_key: cleanLocalKey || cleanRemoteKey,
            system_prompt: localProf.system_prompt || remoteProf.system_prompt,
            llm_provider: localProf.llm_provider || remoteProf.llm_provider
          };
        }
      }

      // On cold start (hasInMemoryWrites === false), remote Supabase profile is authoritative;
      // only fall back to cleanLocalKey if remote has no key at all.
      return {
        ...remoteProf,
        llm_api_key: cleanRemoteKey || cleanLocalKey
      };
    });

    if (hasInMemoryWrites && this.data?.settings) {
      incoming.settings = {
        ...(incoming.settings || {}),
        ...this.data.settings
      };
    } else if ((this.data.settings as any)?.default_llm_api_key && !(incoming.settings as any)?.default_llm_api_key) {
      const localSysKey = String((this.data.settings as any).default_llm_api_key).trim();
      if (!localSysKey.startsWith('sk-proj-wJiInvQ')) {
        (incoming.settings as any).default_llm_api_key = localSysKey;
      }
    }

    return incoming;
  }

  public async syncFromSupabase(force = false): Promise<void> {
    const cfg = this.getSupabaseConfig();
    if (!cfg) return;
    // Never overwrite recent local writes within 10 seconds
    if (!force && this.lastLocalWriteAt > 0 && Date.now() - this.lastLocalWriteAt < 10000) {
      return;
    }
    if (!force && !IS_VERCEL && Date.now() - this.lastSupabaseSyncAt < 2000) {
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      let rawState: any = null;
      const response = await fetch(`${cfg.url}/rest/v1/app_state?select=*&order=updated_at.desc&limit=1`, {
        method: 'GET',
        headers: this.getSupabaseHeaders(cfg.key, {
          Accept: 'application/json'
        }),
        signal: controller.signal
      });
      if (response.ok) {
        const rows = await response.json();
        if (Array.isArray(rows) && rows.length > 0 && rows[0]) {
          const row = rows[0];
          if ('payload' in row || typeof row.id === 'number') {
            this.useNumericPayloadSchema = true;
          }
          rawState = row.state_data || row.payload;
        } else if (Array.isArray(rows) && rows.length === 0) {
          await this.pushToSupabase();
          return;
        }
      }

      // Fallback to system_settings backup if app_state was unavailable
      if (!rawState) {
        const sysRes = await fetch(
          `${cfg.url}/rest/v1/system_settings?key=eq.app_state_backup&select=*&limit=1`,
          {
            method: 'GET',
            headers: this.getSupabaseHeaders(cfg.key, { Accept: 'application/json' }),
            signal: controller.signal
          }
        );
        if (sysRes.ok) {
          const sysRows = await sysRes.json();
          if (Array.isArray(sysRows) && sysRows.length > 0 && sysRows[0]?.value) {
            rawState = sysRows[0].value;
          }
        }
      }

      if (rawState && typeof rawState === 'object') {
        const remoteTs = Number(rawState._lastUpdatedAt || 0);
        if (this.lastLocalWriteAt > 0 && (!remoteTs || this.lastLocalWriteAt >= remoteTs)) {
          // Local in-memory state is newer than cloud state; push local state to cloud instead
          await this.pushToSupabase();
          return;
        }
        const normalized = this.normalizeSchema(rawState);
        this.data = this.mergeLocalNewerProfiles(normalized);
        this.saveData(this.data);
        this.lastSupabaseSyncAt = Date.now();
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
        'An account with this email address already exists! Only one account is allowed per email. Please Sign In.'
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

    // 2. Flexible matching (ignoring "page_", "+", or whitespace, or matching phone digits in channel identifier/name)
    const digitsOnly = cleanId.replace(/\D/g, '');
    const flexible = this.data.channels.find((c) => {
      if (c.platform !== platform || !c.is_active) return false;
      const cId = c.identifier.trim().toLowerCase();
      if (
        cId === cleanId ||
        cId.replace(/^page_/, '') === cleanId.replace(/^page_/, '') ||
        cId.replace(/^\+/, '') === cleanId.replace(/^\+/, '')
      ) {
        return true;
      }
      if (platform === 'whatsapp' && digitsOnly.length >= 10) {
        const cDigits = cId.replace(/\D/g, '');
        const nameDigits = (c.name || '').replace(/\D/g, '');
        const tail10 = digitsOnly.slice(-10);
        if (
          (cDigits.length >= 10 && cDigits.slice(-10) === tail10) ||
          (nameDigits.length >= 10 && nameDigits.slice(-10) === tail10)
        ) {
          return true;
        }
      }
      return false;
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
    this.deductStockForOrder(order);
    this.persist();
    return order;
  }

  deductStockForOrder(order: Order): void {
    try {
      if (order.status === 'cancelled') return;
      const qtyToDeduct = Math.max(1, Number(order.quantity) || 1);
      const userProducts = this.getProducts(order.user_id);
      const itemsLower = (order.items || '').toLowerCase();
      if (!itemsLower || userProducts.length === 0) return;

      for (const prod of userProducts) {
        const nameLower = prod.name.toLowerCase();
        const wordMatch = nameLower
          .split(/\s+/)
          .filter((w) => w.length >= 4)
          .some((w) => itemsLower.includes(w));
        const kwMatch = prod.keywords?.some(
          (k) => k.trim().length >= 3 && itemsLower.includes(k.trim().toLowerCase())
        );

        if (itemsLower.includes(nameLower) || wordMatch || kwMatch) {
          const currentStock =
            prod.stock_quantity !== undefined
              ? Number(prod.stock_quantity)
              : prod.stock_status === 'out_of_stock'
              ? 0
              : prod.stock_status === 'low_stock'
              ? 5
              : 25;
          const nextStock = Math.max(0, currentStock - qtyToDeduct);
          const nextStatus: Product['stock_status'] =
            nextStock <= 0 ? 'out_of_stock' : nextStock <= 5 ? 'low_stock' : 'in_stock';

          this.updateProduct(prod.id, {
            stock_quantity: nextStock,
            sold_count: (prod.sold_count || 0) + qtyToDeduct,
            stock_status: nextStatus
          });
          break;
        }
      }
    } catch (err) {
      console.warn('[Auto Stock Deduction] Warning:', err);
    }
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

  // --- Automation Settings (Comment Reply, Follow-up, Upsell, Tracking, P&L) ---
  getAutomationSettings(userId: string): AutomationSettings {
    const profile = this.getProfileById(userId);
    if (profile && profile.automation_settings) {
      return {
        ...DEFAULT_AUTOMATION_SETTINGS,
        ...profile.automation_settings
      };
    }
    return { ...DEFAULT_AUTOMATION_SETTINGS };
  }

  updateAutomationSettings(
    userId: string,
    updates: Partial<AutomationSettings>
  ): AutomationSettings {
    const profile = this.getProfileById(userId);
    if (!profile) return { ...DEFAULT_AUTOMATION_SETTINGS };
    const current = profile.automation_settings || { ...DEFAULT_AUTOMATION_SETTINGS };
    const updated: AutomationSettings = {
      ...current,
      ...updates
    };
    this.updateProfile(userId, { automation_settings: updated });
    return updated;
  }

  // --- Auto Courier Dispatch & Fraud Screening Settings ---
  getAutoCourierSettings(userId: string): AutoCourierDispatchSettings {
    const profile = this.getProfileById(userId);
    if (profile && profile.auto_courier_settings) {
      return {
        ...DEFAULT_AUTO_COURIER_SETTINGS,
        ...profile.auto_courier_settings,
        risk_rules: {
          ...DEFAULT_AUTO_COURIER_SETTINGS.risk_rules,
          ...(profile.auto_courier_settings.risk_rules || {})
        }
      };
    }
    return { ...DEFAULT_AUTO_COURIER_SETTINGS };
  }

  updateAutoCourierSettings(
    userId: string,
    updates: Partial<AutoCourierDispatchSettings>
  ): AutoCourierDispatchSettings {
    const profile = this.getProfileById(userId);
    if (!profile) return { ...DEFAULT_AUTO_COURIER_SETTINGS };
    const current = profile.auto_courier_settings || { ...DEFAULT_AUTO_COURIER_SETTINGS };
    const updated: AutoCourierDispatchSettings = {
      ...current,
      ...updates,
      risk_rules: {
        ...current.risk_rules,
        ...(updates.risk_rules || {})
      }
    };
    this.updateProfile(userId, { auto_courier_settings: updated });
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

    // 0. If customer is asking for the catalog / all products / what items exist, NEVER lock to a single product!
    // But ONLY if they are NOT asking an attribute question like 'ki ki size' or 'ki ki color'!
    const isAskingAboutAttribute =
      q.includes('size') ||
      q.includes('সাইজ') ||
      q.includes('color') ||
      q.includes('colour') ||
      q.includes('কালার') ||
      q.includes('রং') ||
      q.includes('dam') ||
      q.includes('দাম') ||
      q.includes('price');

    const isAskingForCatalog =
      !isAskingAboutAttribute &&
      (q.includes('ki ki product') ||
        q.includes('k i ki product') ||
        q.includes('ki ki item') ||
        q.includes('k i ki item') ||
        q.includes('ki ki collection') ||
        q.includes('ki ki dress') ||
        q.includes('all product') ||
        q.includes('shob product') ||
        q.includes('sob product') ||
        q.includes('সব প্রোডাক্ট') ||
        q.includes('সব আইটেম') ||
        q.includes('catalog') ||
        q.includes('catalogue') ||
        q.includes('ক্যাটালগ') ||
        q.includes('পণ্য তালিকা') ||
        q.includes('কালেকশন') ||
        q.includes('collection') ||
        q === 'ki ki ase' ||
        q === 'ki ki ache' ||
        q === 'কী কী আছে' ||
        q === 'কি কি আছে');

    if (isAskingForCatalog) {
      return undefined;
    }

    // Helper: Levenshtein distance for fuzzy matching typos (e.g. shiet -> shirt)
    const getLevenshteinDistance = (a: string, b: string): number => {
      if (a === b) return 0;
      if (!a.length) return b.length;
      if (!b.length) return a.length;
      const matrix: number[][] = [];
      for (let i = 0; i <= b.length; i++) matrix[i] = [i];
      for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          if (b.charAt(i - 1) === a.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }
      return matrix[b.length][a.length];
    };

    // Dictionary of Banglish & phonetic variants + typos
    const BANGLISH_SYNONYMS: Record<string, string> = {
      // Shirt variants & typos
      shiet: 'shirt',
      shart: 'shirt',
      shrt: 'shirt',
      sirt: 'shirt',
      sart: 'shirt',
      sarht: 'shirt',
      shirte: 'shirt',
      shirtt: 'shirt',
      shite: 'shirt',
      tshirt: 'shirt',
      tishirt: 'shirt',
      't-shirt': 'shirt',
      সার্ট: 'শার্ট',
      সার্টের: 'শার্ট',
      সার্টটি: 'শার্ট',
      শার্টের: 'শার্ট',
      শার্টটি: 'শার্ট',
      পোলো: 'shirt',
      polo: 'shirt',
      oxford: 'shirt',
      গেঞ্জি: 'shirt',
      genji: 'shirt',
      ganji: 'shirt',

      // Pant variants & typos
      pent: 'pant',
      pents: 'pant',
      pants: 'pant',
      pantt: 'pant',
      pnt: 'pant',
      প্যান্ট: 'pant',
      প্যান্টস: 'pant',
      প্যান্টের: 'pant',
      প্যান্টটি: 'pant',
      jeans: 'pant',
      jean: 'pant',
      জিন্স: 'pant',
      জিন্সের: 'pant',
      জিন্সটি: 'pant',
      cargo: 'pant',
      কার্গো: 'pant',
      jogger: 'pant',
      joggers: 'pant',
      জগার: 'pant',
      জগার্স: 'pant',
      trouser: 'pant',
      trousers: 'pant',
      ট্রাউজার: 'pant',
      denim: 'pant',
      ডেনিম: 'pant',

      // Watch variants & typos
      watc: 'watch',
      wtch: 'watch',
      watches: 'watch',
      woch: 'watch',
      smartwatch: 'watch',
      স্মার্টওয়াচ: 'watch',
      স্মার্টওয়াচ: 'watch',
      ঘড়ি: 'watch',
      ঘড়ি: 'watch',
      ঘড়ির: 'watch',
      ঘড়ির: 'watch',
      ghori: 'watch',

      // Panjabi
      panjabi: 'panjabi',
      punjabi: 'panjabi',
      পাঞ্জাবি: 'panjabi',
      পাঞ্জাবী: 'panjabi'
    };

    // Check query tokens and normalized tokens
    const rawTokens = q.split(/[\s\-_,./()]+/).filter((t) => t.length >= 2);
    const normalizedTokens = rawTokens.map((t) => BANGLISH_SYNONYMS[t] || t);

    // Garment type indicators in query (expanded for Banglish & phonetic typos like shiet, shart, pent)
    const queryMentionsShirt =
      q.includes('shirt') ||
      q.includes('shiet') ||
      q.includes('shart') ||
      q.includes('sirt') ||
      q.includes('sarht') ||
      q.includes('sart') ||
      q.includes('শার্ট') ||
      q.includes('সার্ট') ||
      q.includes('tshirt') ||
      q.includes('t-shirt') ||
      q.includes('oxford') ||
      q.includes('polo') ||
      q.includes('গেঞ্জি') ||
      q.includes('পোলো') ||
      normalizedTokens.includes('shirt') ||
      rawTokens.some((t) => t.length >= 4 && getLevenshteinDistance(t, 'shirt') <= 1);

    const queryMentionsPant =
      q.includes('pant') ||
      q.includes('pent') ||
      q.includes('pants') ||
      q.includes('pents') ||
      q.includes('প্যান্ট') ||
      q.includes('জিন্স') ||
      q.includes('jeans') ||
      q.includes('cargo') ||
      q.includes('কার্গো') ||
      q.includes('jogger') ||
      q.includes('জগার') ||
      q.includes('denim') ||
      q.includes('ডেনিম') ||
      q.includes('trouser') ||
      normalizedTokens.includes('pant') ||
      rawTokens.some((t) => t.length >= 4 && getLevenshteinDistance(t, 'pant') <= 1);

    const queryMentionsWatch =
      q.includes('watch') ||
      q.includes('watc') ||
      q.includes('ঘড়ি') ||
      q.includes('ঘড়ি') ||
      q.includes('স্মার্ট') ||
      q.includes('smartwatch') ||
      q.includes('calling') ||
      normalizedTokens.includes('watch') ||
      rawTokens.some((t) => t.length >= 4 && getLevenshteinDistance(t, 'watch') <= 1);

    const queryMentionsPanjabi =
      q.includes('panjabi') ||
      q.includes('punjabi') ||
      q.includes('পাঞ্জাবি') ||
      q.includes('পাঞ্জাবী') ||
      normalizedTokens.includes('panjabi');

    let bestProduct: Product | undefined = undefined;
    let highestScore = 0;

    for (const prod of prods) {
      let score = 0;
      const pName = prod.name.toLowerCase().trim();
      const pCategory = (prod.category || '').toLowerCase().trim();
      const pKeywords = (prod.keywords || []).map((k) => k.toLowerCase().trim());

      // 1. Exact full name match in query
      if (q.includes(pName)) {
        score += 150;
      } else if (pName.length >= 4 && pName.includes(q)) {
        score += 80;
      }

      // 2. Significant Name words match (with synonym & fuzzy tolerance)
      const nameWords = pName.split(/[\s\-_,./()]+/).filter((w) => w.length >= 3);
      for (const nw of nameWords) {
        if (rawTokens.includes(nw) || normalizedTokens.includes(nw)) {
          if (['shirt', 'pant', 'pants', 'jeans', 'watch', 'panjabi', 'cargo', 'jogger', 'oxford'].includes(nw)) {
            score += 50;
          } else {
            score += 25;
          }
        } else if (nw.length >= 4 && q.includes(nw)) {
          score += 15;
        } else if (nw.length >= 4) {
          // Check fuzzy match against query tokens (distance <= 1)
          const fuzzyMatch = rawTokens.some((rt) => rt.length >= 4 && getLevenshteinDistance(rt, nw) <= 1);
          if (fuzzyMatch) {
            score += 35;
          }
        }
      }

      // 3. Keywords match (with synonym support)
      for (const kw of pKeywords) {
        if (kw.length >= 2 && (rawTokens.includes(kw) || normalizedTokens.includes(kw) || q.includes(kw))) {
          if (['শার্ট', 'প্যান্ট', 'জিন্স', 'কার্গো', 'ঘড়ি', 'ঘড়ি', 'panjabi', 'shirt', 'pant', 'jeans', 'watch'].includes(kw)) {
            score += 45;
          } else if (['কটন', 'cotton', 'blue', 'green', 'black', 'white'].includes(kw)) {
            score += 10; // generic fabric/color
          } else {
            score += 20;
          }
        } else if (kw.length >= 4) {
          const fuzzyKw = rawTokens.some((rt) => rt.length >= 4 && getLevenshteinDistance(rt, kw) <= 1);
          if (fuzzyKw) {
            score += 30;
          }
        }
      }

      // 4. Category match
      if (pCategory && (rawTokens.includes(pCategory) || normalizedTokens.includes(pCategory) || q.includes(pCategory))) {
        score += 25;
      }

      // 5. Description words match
      const descWords = (prod.description || '').toLowerCase().split(/[\s\-_,./()]+/).filter((w) => w.length >= 4);
      for (const dw of descWords) {
        if (rawTokens.includes(dw) || normalizedTokens.includes(dw)) {
          score += 5;
        }
      }

      // 6. Garment type INTENT BOOST & CONFLICT PENALTY
      // If customer asks for SHIRT (even with typo shiet/shart/sirt):
      if (queryMentionsShirt) {
        if (pCategory === 'shirts' || pName.includes('shirt') || pName.includes('oxford')) {
          score += 120; // Massive boost for shirt products
        } else {
          score -= 200; // Strong elimination for pants, watches, etc.
        }
      }

      // If customer asks for PANT / JEANS / CARGO (including pent):
      if (queryMentionsPant) {
        if (pCategory === 'pants' || pName.includes('pant') || pName.includes('jeans') || pName.includes('cargo') || pName.includes('jogger')) {
          score += 120;
          // Specific sub-type bonus:
          if (q.includes('cargo') && pName.includes('cargo')) score += 40;
          if (q.includes('jeans') && pName.includes('jeans')) score += 40;
          if (q.includes('jogger') && pName.includes('jogger')) score += 30;
        } else {
          score -= 200; // Strong elimination for shirts, watches
        }
      }

      // If customer asks for WATCH:
      if (queryMentionsWatch) {
        if (pCategory === 'watches' || pName.includes('watch') || pName.includes('স্মার্ট')) {
          score += 120;
        } else {
          score -= 200;
        }
      }

      // If customer asks for PANJABI:
      if (queryMentionsPanjabi) {
        if (pCategory.includes('panjabi') || pName.includes('panjabi') || pName.includes('পাঞ্জাবি')) {
          score += 120;
        } else {
          score -= 200;
        }
      }

      if (score > highestScore && score >= 20) {
        highestScore = score;
        bestProduct = prod;
      }
    }

    if (bestProduct) {
      return bestProduct;
    }

    // 7. If customer is asking for "this product's pic" / "ay product ar pic" / "chobi" / "pic"
    // and there is only 1 product in the catalog, return it!
    const isGenericProductInquiry =
      q.includes('ay product') ||
      q.includes('ei product') ||
      q.includes('ai product') ||
      q.includes('eitar') ||
      q.includes('aitar') ||
      q.includes('aita') ||
      q.includes('eta') ||
      q.includes('এই প্রোডাক্ট') ||
      q.includes('এটার') ||
      q.includes('ছবি') ||
      q.includes('পিক') ||
      q.includes('pic') ||
      q.includes('photo') ||
      q.includes('picture');

    if (isGenericProductInquiry && prods.length === 1) {
      return prods[0];
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

  // --- Appointments & Calendar Booking Automation ---
  getAppointments(userId?: string): Appointment[] {
    if (!this.data.appointments) {
      this.data.appointments = [];
    }
    const filtered = userId
      ? this.data.appointments.filter((a) => a.user_id === userId)
      : this.data.appointments;
    return filtered.sort((a, b) => {
      const dateCmp = a.appointment_date.localeCompare(b.appointment_date);
      if (dateCmp !== 0) return dateCmp;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  getAppointmentById(id: string): Appointment | undefined {
    return (this.data.appointments || []).find((a) => a.id === id);
  }

  createAppointment(appointment: Appointment): Appointment {
    if (!this.data.appointments) {
      this.data.appointments = [];
    }
    this.data.appointments.unshift(appointment);
    this.persist();
    return appointment;
  }

  updateAppointment(id: string, updates: Partial<Appointment>): Appointment | undefined {
    if (!this.data.appointments) return undefined;
    const idx = this.data.appointments.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;
    this.data.appointments[idx] = {
      ...this.data.appointments[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.persist();
    return this.data.appointments[idx];
  }

  deleteAppointment(id: string): boolean {
    if (!this.data.appointments) return false;
    const idx = this.data.appointments.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    this.data.appointments.splice(idx, 1);
    this.persist();
    return true;
  }

  getAppointmentSettings(userId: string): AppointmentBookingSettings {
    const profile = this.getProfileById(userId);
    if (profile && profile.appointment_settings) {
      return {
        ...DEFAULT_APPOINTMENT_SETTINGS,
        ...profile.appointment_settings
      };
    }
    return { ...DEFAULT_APPOINTMENT_SETTINGS };
  }

  updateAppointmentSettings(
    userId: string,
    updates: Partial<AppointmentBookingSettings>
  ): AppointmentBookingSettings {
    const profile = this.getProfileById(userId);
    if (!profile) return { ...DEFAULT_APPOINTMENT_SETTINGS };
    const current = profile.appointment_settings || { ...DEFAULT_APPOINTMENT_SETTINGS };
    const updated: AppointmentBookingSettings = {
      ...current,
      ...updates
    };
    this.updateProfile(userId, { appointment_settings: updated });
    return updated;
  }

  // --- Email Marketing & Campaign Hub ---
  getEmailSmtpSettings(userId: string): EmailSmtpSettings {
    const profile = this.getProfileById(userId);
    const defaultSettings: EmailSmtpSettings = {
      provider: 'gmail',
      sender_name: profile?.full_name || 'One Agent BD Store',
      sender_email: profile?.email || '',
      smtp_host: 'smtp.gmail.com',
      smtp_port: 465,
      smtp_user: profile?.email || '',
      smtp_pass: '',
      api_key: '',
      reply_to: profile?.email || '',
      is_configured: false
    };
    if (profile && profile.email_smtp_settings) {
      return {
        ...defaultSettings,
        ...profile.email_smtp_settings
      };
    }
    return defaultSettings;
  }

  updateEmailSmtpSettings(userId: string, updates: Partial<EmailSmtpSettings>): EmailSmtpSettings {
    const current = this.getEmailSmtpSettings(userId);
    const merged: EmailSmtpSettings = {
      ...current,
      ...updates
    };
    merged.is_configured = Boolean(
      (merged.provider === 'gmail' || merged.provider === 'custom_smtp')
        ? merged.smtp_host && merged.smtp_user && merged.smtp_pass
        : merged.api_key && merged.sender_email
    );
    this.updateProfile(userId, { email_smtp_settings: merged });
    return merged;
  }

  getEmailSubscribers(userId: string): EmailSubscriber[] {
    if (!this.data.email_subscribers) {
      this.data.email_subscribers = [];
    }
    return this.data.email_subscribers
      .filter((s) => s.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  saveEmailSubscriber(sub: EmailSubscriber): EmailSubscriber {
    if (!this.data.email_subscribers) {
      this.data.email_subscribers = [];
    }
    const cleanEmail = sub.email.trim().toLowerCase();
    const existingIdx = this.data.email_subscribers.findIndex(
      (s) => s.user_id === sub.user_id && s.email.toLowerCase() === cleanEmail
    );
    if (existingIdx >= 0) {
      this.data.email_subscribers[existingIdx] = {
        ...this.data.email_subscribers[existingIdx],
        ...sub,
        email: cleanEmail
      };
      this.persist();
      return this.data.email_subscribers[existingIdx];
    }
    const created = { ...sub, email: cleanEmail };
    this.data.email_subscribers.unshift(created);
    this.persist();
    return created;
  }

  deleteEmailSubscriber(id: string, userId: string): boolean {
    if (!this.data.email_subscribers) return false;
    const idx = this.data.email_subscribers.findIndex((s) => s.id === id && s.user_id === userId);
    if (idx === -1) return false;
    this.data.email_subscribers.splice(idx, 1);
    this.persist();
    return true;
  }

  getEmailCampaigns(userId?: string): EmailCampaign[] {
    if (!this.data.email_campaigns) {
      this.data.email_campaigns = [];
    }
    const list = userId
      ? this.data.email_campaigns.filter((c) => c.user_id === userId)
      : this.data.email_campaigns;
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getEmailCampaignById(id: string): EmailCampaign | undefined {
    return (this.data.email_campaigns || []).find((c) => c.id === id);
  }

  createEmailCampaign(campaign: EmailCampaign): EmailCampaign {
    if (!this.data.email_campaigns) {
      this.data.email_campaigns = [];
    }
    this.data.email_campaigns.unshift(campaign);
    this.persist();
    return campaign;
  }

  updateEmailCampaign(id: string, updates: Partial<EmailCampaign>): EmailCampaign | undefined {
    if (!this.data.email_campaigns) return undefined;
    const idx = this.data.email_campaigns.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.data.email_campaigns[idx] = {
      ...this.data.email_campaigns[idx],
      ...updates
    };
    this.persist();
    return this.data.email_campaigns[idx];
  }

  deleteEmailCampaign(id: string, userId: string): boolean {
    if (!this.data.email_campaigns) return false;
    const idx = this.data.email_campaigns.findIndex((c) => c.id === id && c.user_id === userId);
    if (idx === -1) return false;
    this.data.email_campaigns.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Business ERP: Purchases, Dues & Accounts Cashbook ---
  getPurchases(userId: string): PurchaseRecord[] {
    if (!this.data.purchases) {
      this.data.purchases = [];
    }
    return this.data.purchases
      .filter((p) => p.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  createPurchase(purchase: PurchaseRecord): PurchaseRecord {
    if (!this.data.purchases) {
      this.data.purchases = [];
    }
    this.data.purchases.unshift(purchase);
    this.persist();
    return purchase;
  }

  deletePurchase(id: string, userId: string): boolean {
    if (!this.data.purchases) return false;
    const idx = this.data.purchases.findIndex((p) => p.id === id && p.user_id === userId);
    if (idx === -1) return false;
    this.data.purchases.splice(idx, 1);
    this.persist();
    return true;
  }

  getDueRecords(userId: string): DueRecord[] {
    if (!this.data.dues) {
      this.data.dues = [];
    }
    return this.data.dues
      .filter((d) => d.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  createDueRecord(due: DueRecord): DueRecord {
    if (!this.data.dues) {
      this.data.dues = [];
    }
    this.data.dues.unshift(due);
    this.persist();
    return due;
  }

  updateDueRecord(id: string, userId: string, updates: Partial<DueRecord>): DueRecord | undefined {
    if (!this.data.dues) return undefined;
    const idx = this.data.dues.findIndex((d) => d.id === id && d.user_id === userId);
    if (idx === -1) return undefined;
    this.data.dues[idx] = {
      ...this.data.dues[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.persist();
    return this.data.dues[idx];
  }

  deleteDueRecord(id: string, userId: string): boolean {
    if (!this.data.dues) return false;
    const idx = this.data.dues.findIndex((d) => d.id === id && d.user_id === userId);
    if (idx === -1) return false;
    this.data.dues.splice(idx, 1);
    this.persist();
    return true;
  }

  getAccountTransactions(userId: string): AccountTransaction[] {
    if (!this.data.account_transactions) {
      this.data.account_transactions = [];
    }
    return this.data.account_transactions
      .filter((t) => t.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  createAccountTransaction(tx: AccountTransaction): AccountTransaction {
    if (!this.data.account_transactions) {
      this.data.account_transactions = [];
    }
    this.data.account_transactions.unshift(tx);
    this.persist();
    return tx;
  }

  deleteAccountTransaction(id: string, userId: string): boolean {
    if (!this.data.account_transactions) return false;
    const idx = this.data.account_transactions.findIndex((t) => t.id === id && t.user_id === userId);
    if (idx === -1) return false;
    this.data.account_transactions.splice(idx, 1);
    this.persist();
    return true;
  }
}

export const db = new Database();
