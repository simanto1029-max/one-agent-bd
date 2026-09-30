export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'user' | 'admin';
  is_suspended: boolean;
  llm_provider: 'gemini' | 'openai' | 'anthropic';
  llm_api_key?: string;
  system_prompt: string;
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

export interface SubscriptionStatusInfo {
  subscription?: {
    id: string;
    user_id: string;
    plan_id: string;
    status: 'trialing' | 'active' | 'expired' | 'pending_approval';
    start_date: string;
    end_date: string;
  };
  planId?: string;
  planName: string;
  price: number;
  currency: string;
  isProPlan?: boolean;
  canAccessStores?: boolean;
  featureConfig?: PlanFeaturesConfig;
  daysRemaining: number;
  hoursRemaining: number;
  msRemaining?: number;
  serverTime?: string;
  isExpired: boolean;
  isGated: boolean;
  canAccessDashboard: boolean;
}

export interface Payment {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  coupon_code?: string;
  discount_amount?: number;
  method: 'bkash' | 'nagad' | 'rocket' | 'upay' | 'bank' | 'manual' | 'stripe' | string;
  payment_method?: string;
  transaction_reference: string;
  transaction_id?: string;
  sender_number?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  submitted_at: string;
  created_at?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  user_email?: string;
  user_name?: string;
  plan_name?: string;
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
  access_token?: string;
  app_secret?: string;
  auto_comment_reply?: boolean;
  auto_followup_enabled?: boolean;
  is_active: boolean;
  status?: 'not_connected' | 'connecting' | 'connected' | 'error';
  error_message?: string;
  last_webhook_at?: string;
  last_message_at?: string;
  meta_asset_name?: string;
  meta_asset_id?: string;
  meta_business_id?: string;
  has_token?: boolean;
  token_preview?: string;
  created_at: string;
  updated_at: string;
}

export interface MetaConfig {
  configured: boolean;
  appId: string;
  redirectUri: string;
  webhookVerifyTokenConfigured: boolean;
  webhookUrlWhatsApp: string;
  webhookUrlMessenger: string;
  webhookUrlInstagram: string;
}

export interface AuthorizedPageAsset {
  id: string;
  name: string;
  category?: string;
  tasks?: string[];
  instagram_business_account?: {
    id: string;
    username: string;
    name?: string;
    profile_picture_url?: string;
  };
}

export interface PendingMetaAssetsResponse {
  available: boolean;
  platform?: 'messenger' | 'instagram' | 'whatsapp';
  pages: AuthorizedPageAsset[];
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
  has_voice?: boolean;
  audio_url?: string;
  audio_base64?: string;
  audio_mime_type?: string;
  transcription?: string;
  has_image?: boolean;
  image_url?: string;
  image_base64?: string;
  image_mime_type?: string;
  has_video?: boolean;
  video_base64?: string;
  video_mime_type?: string;
  created_at: string;
}

export interface Conversation {
  customerId: string;
  customerName: string;
  platform: 'whatsapp' | 'messenger' | 'instagram';
  channelId?: string;
  lastMessage: Message;
  messages: Message[];
  unreadCount: number;
  orderCategory?: 'orders' | 'delivered' | 'new_customer';
  totalOrdersCount?: number;
  latestOrderId?: string;
  latestOrderStatus?: string;
  isAiPaused?: boolean;
  isBlocked?: boolean;
}

export interface ConversationSummaryResult {
  customerName: string;
  customerId: string;
  platform: 'whatsapp' | 'messenger' | 'instagram';
  stageKey: 'new_inquiry' | 'discussion' | 'awaiting_order_details' | 'order_confirmed' | 'delivered';
  stageStep: 1 | 2 | 3 | 4;
  stageLabel: string;
  stageDescription: string;
  summaryText: string;
  keyPoints: string[];
  customerIntent: string;
  extractedPhone?: string;
  extractedAddress?: string;
  nextAction: string;
  stats: {
    totalMessages: number;
    customerMessages: number;
    aiReplies: number;
    humanReplies: number;
    hasVoice: boolean;
    hasImage: boolean;
    orderId?: string;
    orderStatus?: string;
  };
  generatedAt: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  price: number;
  buying_price?: number;
  currency: string;
  category: string;
  description: string;
  image_url: string;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  keywords?: string[];
  created_at: string;
  updated_at: string;
}

export interface ContactLead {
  customerId: string;
  customerName: string;
  platform: 'whatsapp' | 'messenger' | 'instagram';
  channelId?: string;
  totalMessages: number;
  lastContactDate: string;
  lastMessage: string;
  hasOrdered?: boolean;
  totalOrders?: number;
  totalSpent?: number;
  isVip?: boolean;
  isBlocked?: boolean;
  isAiPaused?: boolean;
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
}

export interface AdminMetrics {
  totalUsers: number;
  activeSubs: number;
  trialUsers: number;
  expiredUsers: number;
  totalRevenue: number;
  pendingPaymentsCount: number;
  totalMessages: number;
  aiRepliesCount: number;
  channelsCount: {
    total: number;
    whatsapp: number;
    messenger: number;
    instagram?: number;
  };
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'trialing' | 'active' | 'expired' | 'pending_approval';
  start_date: string;
  end_date: string;
  trial_ends_at?: string;
  current_period_end?: string;
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
  site_tagline?: string;
  brand_logo_text?: string;
  logo_url?: string;
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
  cron_last_run?: string;
  cron_status?: string;
}

export type Contact = ContactLead;
export type AdminOverviewStats = AdminMetrics;
export type AdminSettingsData = SystemSettings;

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
  created_at: string;
  updated_at: string;
}

export interface OrderMetrics {
  totalRevenue: number;
  confirmedCount: number;
  processingCount: number;
  deliveredCount: number;
  cancelledCount: number;
  websiteOrdersCount?: number;
  manualAiOrdersCount?: number;
  vipCustomersCount?: number;
  websiteRevenue?: number;
}

export interface OrderConfirmationSettings {
  enabled: boolean;
  instructions: string;
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
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'rescheduled';
  booking_source: 'ai_chat' | 'manual' | 'website';
  notes?: string;
  location?: string;
  google_calendar_synced?: boolean;
  google_calendar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentStats {
  totalBookings: number;
  todayBookings: number;
  upcomingBookings: number;
  aiBookedCount: number;
  completedCount: number;
  cancelledCount: number;
}

export interface SlotAvailabilityInfo {
  date: string;
  dayOfWeek: string;
  isDayOpen: boolean;
  allSlots: string[];
  bookedSlots: string[];
  availableSlots: string[];
  appointmentsOnDate: Appointment[];
}

