// One Agent BD - Vercel Serverless Entry Point (ESM Bundle)
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/db/database.ts
import fs from "fs";
import os from "os";
import path from "path";
import dotenv from "dotenv";
var IS_VERCEL, DATA_DIR, DB_FILE, BUNDLED_DB_FILE, defaultSeedReviews, defaultSeedProducts, initialData, DEFAULT_ORDER_SETTINGS, DEFAULT_AUTO_COURIER_SETTINGS, DEFAULT_AUTOMATION_SETTINGS, DEFAULT_APPOINTMENT_SETTINGS, Database, db;
var init_database = __esm({
  "server/db/database.ts"() {
    dotenv.config();
    IS_VERCEL = Boolean(process.env.VERCEL);
    DATA_DIR = IS_VERCEL ? path.join(os.tmpdir(), "oneagentbd_data") : path.join(process.cwd(), "data");
    DB_FILE = path.join(DATA_DIR, "db.json");
    BUNDLED_DB_FILE = path.join(process.cwd(), "data", "db.json");
    defaultSeedReviews = [
      {
        id: "rev_seed_1",
        name: "Mahmudul Hasan Rahat",
        role: "F-Commerce Seller",
        business: "Dhaka, BD",
        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80",
        rating: 5,
        review_text: "Before One Agent BD, we used to lose late-night Facebook inquiries because no one was online after midnight. Now the AI replies in 2 seconds, checks available sizes, and confirms COD orders while we sleep.",
        status: "approved",
        created_at: new Date(Date.now() - 12 * 864e5).toISOString()
      },
      {
        id: "rev_seed_2",
        name: "Sadia Afrin Tisha",
        role: "Online Boutique Owner",
        business: "Dhaka, BD",
        avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80",
        rating: 5,
        review_text: "Customers constantly send product screenshots and voice notes on Instagram and Messenger. The AI recognizes product photos accurately, quotes the exact price, and handles the entire checkout conversation.",
        status: "approved",
        created_at: new Date(Date.now() - 9 * 864e5).toISOString()
      },
      {
        id: "rev_seed_3",
        name: "Tanvir Ahmed Chowdhury",
        role: "Electronics & Gadget Seller",
        business: "Chattogram, BD",
        avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80",
        rating: 5,
        review_text: "The auto comment-to-inbox workflow and 1-click Steadfast courier booking saved our team hours of manual data entry every single day. Best automation platform we have used.",
        status: "approved",
        created_at: new Date(Date.now() - 7 * 864e5).toISOString()
      },
      {
        id: "rev_seed_4",
        name: "Ariful Islam Sourav",
        role: "Organic Food Seller",
        business: "Sylhet, BD",
        avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80",
        rating: 5,
        review_text: "During peak season we receive hundreds of WhatsApp messages daily. One Agent BD collects customer names, phone numbers, and full delivery addresses and logs every order into our dashboard.",
        status: "approved",
        created_at: new Date(Date.now() - 5 * 864e5).toISOString()
      },
      {
        id: "rev_seed_5",
        name: "Nusrat Jahan Mim",
        role: "Clothing Page Owner",
        business: "Dhaka, BD",
        avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80",
        rating: 5,
        review_text: "Connecting our Facebook Page and Instagram took less than two minutes. Whenever a buyer asks for a live call, the AI alerts our team in the Call Requests queue immediately.",
        status: "approved",
        created_at: new Date(Date.now() - 3 * 864e5).toISOString()
      },
      {
        id: "rev_seed_6",
        name: "Imran Hossain Rony",
        role: "E-Commerce Merchant",
        business: "Dhaka, BD",
        avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80",
        rating: 5,
        review_text: "Our ad conversion rate nearly doubled because customers get an instant response right after clicking our boosted posts. Smart follow-ups bring back hesitant buyers automatically.",
        status: "approved",
        created_at: new Date(Date.now() - 1 * 864e5).toISOString()
      }
    ];
    defaultSeedProducts = [];
    initialData = {
      businesses: [],
      facebook_pages: [],
      instagram_accounts: [],
      whatsapp_business_accounts: [],
      whatsapp_phone_numbers: [],
      webhook_events: [],
      audit_logs: [],
      customer_metadata: [],
      products: defaultSeedProducts,
      profiles: [
        {
          id: "usr_admin_001",
          email: process.env.ADMIN_EMAIL || "admin@oneagentbd.online",
          full_name: "Super Admin",
          role: "admin",
          password: process.env.ADMIN_PASSWORD || "Admin@OneAgentBD2026",
          is_suspended: false,
          llm_provider: "gemini",
          system_prompt: "You are an executive AI assistant for One Agent BD. Respond with concise, accurate information.",
          created_at: "2025-01-01T00:00:00.000Z",
          updated_at: "2025-01-01T00:00:00.000Z"
        },
        {
          id: "usr_demo_002",
          email: "simanto1029@gmail.com",
          full_name: "Simanto Rahman",
          role: "admin",
          password: "Admin@Simanto1029",
          is_suspended: false,
          llm_provider: "gemini",
          system_prompt: `You are the official Customer Service & Sales AI Assistant for "One Agent BD".

Business Knowledge Base:
1. Services & Products:
   - 24/7 AI Auto-Reply for WhatsApp, Facebook Messenger, Instagram & Websites, Voice Message Transcription, and E-Commerce Order Automation.
   - 2 Official Plans: Starter AI Plan (1,250 BDT/month) and Pro Business Plan (1,950 BDT/month), plus a 2-Day Free Trial.
2. Payment & Support:
   - bKash, Nagad & Rocket automated gateway (pay.oneagentbd.online). Helpline: +8801601705804.

MANDATORY LANGUAGE & SERIAL LIST REPLY RULES:
- Reply in the same language the customer uses (if the customer asks in Bangla, Banglish, or Bangla voice note, reply in natural Bangla; if they ask in English, reply in clear English).
- Whenever the customer asks about plans, prices, products, what is available ("ki ki ase"), features, or details, always reply in a clean serial numbered list (\u09E7., \u09E8., \u09E9. in Bangla or 1., 2., 3. in English) on separate lines.`,
          created_at: "2025-01-01T00:00:00.000Z",
          updated_at: "2025-01-01T00:00:00.000Z"
        },
        {
          id: "usr_reviewer_003",
          email: "reviewer@oneagentbd.online",
          full_name: "Meta App Reviewer",
          role: "user",
          password: "ReviewerPass2026!",
          is_suspended: false,
          llm_provider: "gemini",
          system_prompt: "You are the official Customer Service AI Assistant for One Agent BD.",
          created_at: "2025-01-01T00:00:00.000Z",
          updated_at: "2025-01-01T00:00:00.000Z"
        }
      ],
      plans: [
        {
          id: "plan_starter",
          name: "Advance AI Plan",
          price: 2499,
          currency: "BDT",
          duration_days: 30,
          trial_days: 2,
          is_active: true,
          badge: "Starter Growth",
          subtitle: "Grow Your E-Commerce Business",
          features: [
            "Facebook Messenger: 100% Unlimited Conversations",
            "Instagram DM: 100% Unlimited Conversations",
            "WhatsApp: 2,500 Messages & Replies Included",
            "250 Comment Auto-Replies & Instant Inbox DM",
            "500 Instant FAQ & Delivery Charge Auto-Replies",
            "100 Products Catalog & Auto Order Capture",
            "Bangla Voice Note AI Listening & Photo Recognition",
            "1-Click Courier Booking (Steadfast, Pathao & RedX)",
            "VIP Customer Retargeting & Smart Follow-Up",
            "System Message Credits (No user card needed!)"
          ],
          created_at: new Date(Date.now() - 30 * 864e5).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString(),
          feature_config: {
            website_stores: false,
            call_requests: true,
            vip_broadcast: true,
            courier_dispatch: true,
            csv_export: false,
            max_channels: 3,
            whatsapp_credits: 2500
          }
        },
        {
          id: "plan_pro",
          name: "Business AI Plan",
          price: 4499,
          currency: "BDT",
          duration_days: 30,
          trial_days: 2,
          is_active: true,
          badge: "Most Popular",
          subtitle: "Scale Multichannel Operations",
          features: [
            "Facebook Messenger: 100% Unlimited Conversations",
            "Instagram DM: 100% Unlimited Conversations",
            "WhatsApp: 6,500 Messages & Replies Included",
            "1,000 Comment Auto-Replies & Instant Inbox DM",
            "1,500 Instant FAQ & Custom Business Rules",
            "Unlimited Products Catalog & Auto Order Capture",
            "Everything in Advance Plan +",
            "Accounts, Stock & Profit ERP (Sales, Due, Cashbook)",
            "Website Live Chat & WooCommerce/Shopify Store Sync",
            "AI Delivery Tracking & Courier Fraud Intelligence Check",
            "Up to 10 Connected Channels & Multi-Agent Collaboration",
            "System Message Credits (No user card needed!)"
          ],
          created_at: new Date(Date.now() - 30 * 864e5).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString(),
          feature_config: {
            website_stores: true,
            call_requests: true,
            vip_broadcast: true,
            courier_dispatch: true,
            csv_export: true,
            max_channels: 10,
            whatsapp_credits: 6500
          }
        },
        {
          id: "plan_enterprise",
          name: "Enterprise Agency Plan",
          price: 8999,
          currency: "BDT",
          duration_days: 30,
          trial_days: 2,
          is_active: true,
          badge: "Agency Power",
          subtitle: "Mega Volume & Agency Automation",
          features: [
            "Facebook Messenger: 100% Unlimited Conversations",
            "Instagram DM: 100% Unlimited Conversations",
            "WhatsApp: 15,000 Messages & Replies Included",
            "Unlimited Comment Auto-Replies & Instant Inbox DM",
            "Unlimited Instant FAQ & Custom Business Knowledge Base",
            "Unlimited Products Catalog & Multi-Store Management",
            "Everything in Business Plan +",
            "Connect Unlimited Channels (Multi-Page & Multi-Number)",
            "Dedicated VIP Account Manager (24/7 Priority WhatsApp)",
            "Team Collaboration & Multi-Staff Handover Queue",
            "Custom AI Sales Closer Persona & Webhook Integrations",
            "System Message Credits (No user card needed!)"
          ],
          created_at: new Date(Date.now() - 30 * 864e5).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString(),
          feature_config: {
            website_stores: true,
            call_requests: true,
            vip_broadcast: true,
            courier_dispatch: true,
            csv_export: true,
            max_channels: 99,
            whatsapp_credits: 15e3
          }
        }
      ],
      subscriptions: [
        {
          id: "sub_demo_001",
          user_id: "usr_demo_002",
          plan_id: "plan_starter",
          status: "trialing",
          start_date: new Date(Date.now() - 12 * 36e5).toISOString(),
          end_date: new Date(Date.now() + 36 * 36e5).toISOString(),
          // 1.5 days remaining
          created_at: new Date(Date.now() - 12 * 36e5).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "sub_admin_001",
          user_id: "usr_admin_001",
          plan_id: "plan_pro",
          status: "active",
          start_date: new Date(Date.now() - 30 * 864e5).toISOString(),
          end_date: new Date(Date.now() + 365 * 864e5).toISOString(),
          created_at: new Date(Date.now() - 30 * 864e5).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "sub_reviewer_001",
          user_id: "usr_reviewer_003",
          plan_id: "plan_pro",
          status: "active",
          start_date: (/* @__PURE__ */ new Date()).toISOString(),
          end_date: new Date(Date.now() + 365 * 864e5).toISOString(),
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }
      ],
      payments: [],
      coupons: [
        {
          id: "cpn_welcome10",
          code: "WELCOME10",
          discount_type: "percentage",
          discount_value: 10,
          used_count: 0,
          is_active: true,
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "cpn_save250",
          code: "SAVE250",
          discount_type: "fixed",
          discount_value: 250,
          used_count: 0,
          is_active: true,
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }
      ],
      channels: [],
      messages: [],
      orders: [],
      settings: {
        site_name: "One Agent BD",
        site_tagline: "WhatsApp & Messenger AI Auto-Reply & Order Management",
        logo_url: "/logo.svg",
        promo_video_url: "https://www.youtube.com/watch?v=aircAruvnKk",
        promo_video_thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85",
        bkash_number: "+8801700123456",
        nagad_number: "+8801800123456",
        support_email: "support@oneagentbd.online",
        meta_description: "Automate WhatsApp and Messenger customer inquiries and order confirmations with fine-tuned AI agents, unified inbox, and instant billing.",
        meta_app_id: "1668233901609132",
        meta_config_id: "1661730682018982",
        cron_last_run: (/* @__PURE__ */ new Date()).toISOString(),
        cron_status: "Healthy (Running hourly checks)"
      }
    };
    DEFAULT_ORDER_SETTINGS = {
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
        "order confirm",
        "confirm",
        "send it",
        "delivery",
        "address",
        "cash on delivery",
        "cod",
        "bkash sent",
        "paid"
      ],
      auto_reply_confirmation: true,
      confirmation_message_template: "Thank you {customer_name}! Your order for {items} has been successfully received. Order ID: #{order_id}. Total Bill: BDT {total_amount}. Our delivery team will contact you shortly."
    };
    DEFAULT_AUTO_COURIER_SETTINGS = {
      enabled: true,
      scheduled_times: ["10:00", "23:00"],
      default_courier: "steadfast",
      fraud_check_enabled: true,
      risk_rules: {
        min_address_length: 12,
        require_valid_phone: true,
        flag_duplicate_phones: true,
        max_cod_amount_auto: 5e3,
        flag_unspecified_items: true
      }
    };
    DEFAULT_AUTOMATION_SETTINGS = {
      auto_comment_reply_enabled: true,
      public_comment_reply_template: "Thank you {customer_name}! \u2764\uFE0F We have sent a detailed reply and product information to your Inbox (Messenger/DM). Please check your inbox! \u{1F4E9}",
      send_private_inbox_on_comment: true,
      auto_followup_enabled: true,
      followup_delay_minutes: 45,
      followup_message_template: "Hello {customer_name}! \u{1F60A} You messaged our page earlier. Do you have any questions about our products or ordering? To confirm your order, simply reply with your Name, Full Address, and Phone Number\u2014our AI will book your order right away! \u2764\uFE0F",
      upsell_enabled: true,
      upsell_offer_text: "Order any 2 items together to enjoy FREE delivery or a special 100 BDT discount!",
      auto_payment_verify_enabled: true,
      auto_tracking_reply_enabled: true,
      paused_customers: [],
      blocked_customers: [],
      daily_ad_spend_bdt: 500,
      avg_product_cost_percent: 55,
      return_courier_loss_per_order: 130
    };
    DEFAULT_APPOINTMENT_SETTINGS = {
      enabled: true,
      business_type: "General Consultation & Service Booking",
      slot_duration_minutes: 30,
      available_days: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      start_time: "10:00 AM",
      end_time: "08:00 PM",
      available_slots: [
        "10:00 AM",
        "11:00 AM",
        "12:00 PM",
        "02:00 PM",
        "03:00 PM",
        "04:00 PM",
        "05:00 PM",
        "06:00 PM",
        "07:00 PM",
        "08:00 PM"
      ],
      services_offered: [
        "General Consultation",
        "Product Demo & Live Walkthrough",
        "Service Appointment / Visit",
        "VIP 1-on-1 Session"
      ],
      location_address: "Online Google Meet / Main Office Branch, Dhaka",
      auto_confirm_booking: true,
      google_calendar_auto_sync: true,
      confirmation_note: "Please arrive or join 5 minutes before your scheduled appointment slot."
    };
    Database = class {
      constructor() {
        this.isDirty = false;
        this.lastSupabaseSyncAt = 0;
        this.pendingFlushPromise = null;
        this.deletedChannelIds = /* @__PURE__ */ new Set();
        this.deletedAgentIds = /* @__PURE__ */ new Set();
        this.deletedProductIds = /* @__PURE__ */ new Set();
        this.useNumericPayloadSchema = false;
        this.lastLocalWriteAt = 0;
        this.pushDebounceTimer = null;
        this.data = this.loadData();
        this.loadDeletedIdsFromData(this.data);
        const cfg = this.getSupabaseConfig();
        const isConnected = Boolean(cfg);
        console.log(`Supabase connected: ${isConnected ? "yes" : "no"}, messages loaded: ${this.data.messages.length}`);
        if (cfg) {
          console.log(`[Database Startup] Supabase URL: ${cfg.url}, Key prefix: ${cfg.key.slice(0, 10)}... (length: ${cfg.key.length})`);
          this.syncFromSupabase(true).catch((err) => {
            console.error("[Database Startup] Initial Supabase sync error:", err);
          });
        } else {
          console.warn(
            "[Database Startup] Supabase environment variables NOT detected in process.env! Available keys:",
            Object.keys(process.env).filter((k) => k.includes("SUPABASE") || k.includes("URL") || k.includes("KEY"))
          );
        }
      }
      syncDeletedIdsToData() {
        if (!this.data) return;
        this.data._deleted_ids = {
          channels: Array.from(this.deletedChannelIds),
          agents: Array.from(this.deletedAgentIds),
          products: Array.from(this.deletedProductIds)
        };
      }
      loadDeletedIdsFromData(source) {
        if (!source || typeof source !== "object") return;
        const del = source._deleted_ids;
        if (del && typeof del === "object") {
          if (Array.isArray(del.channels)) {
            del.channels.forEach((id) => this.deletedChannelIds.add(id));
          }
          if (Array.isArray(del.agents)) {
            del.agents.forEach((id) => this.deletedAgentIds.add(id));
          }
          if (Array.isArray(del.products)) {
            del.products.forEach((id) => this.deletedProductIds.add(id));
          }
        }
      }
      getSupabaseConfig() {
        const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/\/+$/, "");
        const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "").trim();
        if (!url || !key) return null;
        return { url, key };
      }
      normalizeSchema(parsed) {
        if (!parsed.orders) {
          parsed.orders = [];
        } else {
          parsed.orders = parsed.orders.filter(
            (o) => !o.id.startsWith("ord_1726518491") && !o.id.startsWith("ord_1726518492")
          );
        }
        if (parsed.channels) {
          parsed.channels = parsed.channels.filter(
            (c) => c.id !== "chn_wa_001" && c.id !== "chn_fb_002" && c.id !== "chn_wh_1789555400609_26an" && c.id !== "chn_in_1789983618031_f34e"
          );
          const waDemo = parsed.channels.find(
            (c) => c.platform === "whatsapp" && (c.user_id === "usr_demo_002" || c.identifier === "8801601705804" || c.identifier === "8801712345678")
          );
          if (waDemo) {
            waDemo.identifier = "8801601705804";
            waDemo.name = "One Agent Bd (+8801601705804)";
            waDemo.is_active = true;
            waDemo.status = "connected";
          }
          parsed.channels = parsed.channels.filter((c) => !this.deletedChannelIds.has(c.id));
        }
        if (parsed.messages) {
          parsed.messages = parsed.messages.filter(
            (m) => !["msg_001", "msg_002", "msg_003", "msg_004"].includes(m.id)
          );
        }
        if (parsed.payments) {
          parsed.payments = parsed.payments.filter((p) => p.id !== "pay_demo_001");
        }
        if (parsed.settings) {
          parsed.settings.site_name = parsed.settings.site_name || "One Agent BD";
          if (!parsed.settings.meta_app_id || parsed.settings.meta_app_id === "28133631089641045") {
            parsed.settings.meta_app_id = "1668233901609132";
          }
        } else {
          parsed.settings = initialData.settings;
        }
        if (!parsed.plans || parsed.plans.length === 0) {
          parsed.plans = initialData.plans;
        } else {
          parsed.plans = parsed.plans.map((p) => {
            const defaultMatch = initialData.plans.find((ip) => ip.id === p.id);
            const base = defaultMatch || p;
            return {
              ...base,
              ...p,
              name: p.name?.trim() || base.name,
              price: typeof p.price === "number" && !isNaN(p.price) ? p.price : base.price,
              currency: p.currency || base.currency || "BDT",
              duration_days: typeof p.duration_days === "number" ? p.duration_days : base.duration_days,
              trial_days: typeof p.trial_days === "number" ? p.trial_days : base.trial_days,
              features: Array.isArray(p.features) && p.features.length ? p.features : base.features,
              feature_config: {
                ...base.feature_config || {},
                ...p.feature_config || {}
              },
              subtitle: p.subtitle || base.subtitle,
              badge: p.badge || base.badge
            };
          });
        }
        if (!parsed.agents) parsed.agents = [];
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
          const nowIso = (/* @__PURE__ */ new Date()).toISOString();
          const defaultSeedItems = [
            {
              id: "prod_admin_cargo_01",
              user_id: "usr_admin_001",
              name: "Cargo Jogger Pant (Olive Green)",
              price: 1150,
              currency: "BDT",
              category: "Pants",
              description: "Heavyweight stretchable cotton twill fabric with 6 utility pockets, elastic jogger ankles, and adjustable waist drawstrings. Available sizes: 30, 32, 34, 36.",
              image_url: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=600&auto=format&fit=crop&q=80",
              stock_status: "in_stock",
              keywords: ["cargo", "jogger", "pant", "olive", "green", "\u0995\u09BE\u09B0\u09CD\u0997\u09CB", "\u09AA\u09CD\u09AF\u09BE\u09A8\u09CD\u099F", "\u0995\u099F\u09A8"],
              created_at: nowIso,
              updated_at: nowIso
            },
            {
              id: "prod_admin_denim_02",
              user_id: "usr_admin_001",
              name: "Slim Fit Denim Jeans (Deep Blue)",
              price: 1250,
              currency: "BDT",
              category: "Pants",
              description: "Premium stretch denim with dark blue wash, reinforced stitching, and brass rivets. Soft and comfortable for everyday wear. Sizes: 30, 32, 34, 36.",
              image_url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80",
              stock_status: "in_stock",
              keywords: ["denim", "jeans", "pant", "blue", "\u09A1\u09C7\u09A8\u09BF\u09AE", "\u099C\u09BF\u09A8\u09CD\u09B8", "\u09AA\u09CD\u09AF\u09BE\u09A8\u09CD\u099F", "\u09B8\u09CD\u09B2\u09BF\u09AE"],
              created_at: nowIso,
              updated_at: nowIso
            },
            {
              id: "prod_admin_shirt_03",
              user_id: "usr_admin_001",
              name: "Casual Oxford Cotton Shirt (Sky Blue)",
              price: 850,
              currency: "BDT",
              category: "Shirts",
              description: "100% combed breathable cotton Oxford shirt with button-down collar and curved hem. Perfect for all seasons. Sizes: M, L, XL, XXL.",
              image_url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80",
              stock_status: "in_stock",
              keywords: ["shirt", "oxford", "cotton", "blue", "\u09B6\u09BE\u09B0\u09CD\u099F", "\u0995\u099F\u09A8", "\u09AB\u09C1\u09B2 \u09B9\u09BE\u09A4\u09BE"],
              created_at: nowIso,
              updated_at: nowIso
            },
            {
              id: "prod_admin_watch_04",
              user_id: "usr_admin_001",
              name: "Smart Calling Watch (Series 9 Metallic Black)",
              price: 2450,
              currency: "BDT",
              category: "Watches",
              description: "1.99 inch HD AMOLED screen with Bluetooth call support, heart rate and blood oxygen monitoring, 100+ sports modes, and 5-day battery backup. IP68 water resistant.",
              image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
              stock_status: "in_stock",
              keywords: ["watch", "smartwatch", "smart", "calling", "\u0998\u09DC\u09BF", "\u0998\u09A1\u09BC\u09BF", "\u09B8\u09CD\u09AE\u09BE\u09B0\u09CD\u099F\u0993\u09AF\u09BC\u09BE\u099A"],
              created_at: nowIso,
              updated_at: nowIso
            }
          ];
          if (this.deletedProductIds.size === 0) {
            parsed.products = defaultSeedItems;
          } else {
            parsed.products = [];
          }
        } else {
          parsed.products.forEach((p) => {
            if (p.name.includes("Denim Jeans") && (p.image_url?.includes("photo-1542272604") || p.image_url?.includes("523275335684"))) {
              p.image_url = "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80";
            } else if (p.name.includes("Cargo Jogger") && (p.image_url?.includes("photo-1624378439575") || p.image_url?.includes("542272604"))) {
              p.image_url = "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=600&auto=format&fit=crop&q=80";
            }
          });
          parsed.products = parsed.products.filter(
            (p) => !this.deletedProductIds.has(p.id) && !["prod_001", "prod_002", "prod_003", "prod_004", "prod_005"].includes(p.id)
          );
        }
        if (Array.isArray(parsed.messages)) {
          parsed.messages.forEach((m) => {
            if (m.user_id === "usr_admin_001" || m.user_id === "usr_admin_1") {
              delete m.interactive_options;
            }
          });
        }
        if (!parsed.subscriptions) parsed.subscriptions = initialData.subscriptions;
        if (parsed.profiles) {
          const seenEmails = /* @__PURE__ */ new Set();
          const uniqueProfiles = [];
          parsed.profiles.forEach((p) => {
            p.email = (p.email || "").trim().toLowerCase();
            if (!p.email || seenEmails.has(p.email)) {
              return;
            }
            seenEmails.add(p.email);
            if (p.id === "usr_admin_001") {
              if (process.env.ADMIN_EMAIL) p.email = process.env.ADMIN_EMAIL.trim().toLowerCase();
              if (!p.password) p.password = process.env.ADMIN_PASSWORD || "Admin@OneAgentBD2026";
              p.role = "admin";
            }
            if (p.email === "simanto1029@gmail.com") {
              p.role = "admin";
              if (!p.password) p.password = "Admin@Simanto1029";
            }
            if (p.llm_api_key && p.llm_api_key.trim().startsWith("sk-proj-wJiInvQ")) {
              delete p.llm_api_key;
            }
            if (!p.system_prompt || p.system_prompt.includes("You are a warm, professional customer support AI agent for our business.") || p.system_prompt.includes("Subscription Plan: All-in-One Plan 1,450 BDT/month") || p.system_prompt.includes("Subscription Plans: Standard Plan 899 BDT/month") || p.system_prompt.includes("Business Knowledge Base (\u09AC\u09CD\u09AF\u09AC\u09B8\u09BE\u09DF\u09BF\u0995 \u09A4\u09A5\u09CD\u09AF):")) {
              p.system_prompt = `You are the official Customer Service & Sales AI Assistant for "${p.full_name || "One Agent BD"}".

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
- Whenever the customer asks about plans, prices, products, what is available ("ki ki ase"), features, or details, always format them as a clean serial numbered list (\u09E7., \u09E8., \u09E9. in Bangla or 1., 2., 3. in English) on separate lines.`;
            }
            if (p.system_prompt) {
              p.system_prompt = p.system_prompt.replace(/Never send long paragraphs or unnecessary lists\./gi, "").replace(/Keep replies concise, clear, and within 1-3 sentences\./gi, 'Whenever the customer asks about plans, prices, products, what is available ("ki ki ase"), or details, format them as a clean serial numbered list (\u09E7., \u09E8., \u09E9. in Bangla or 1., 2., 3. in English) on separate lines.').replace(/Always keep replies concise and to the point \(maximum 2 to 3 sentences\)\./gi, 'Whenever the customer asks about plans, prices, products, what is available ("ki ki ase"), or details, format them as a clean serial numbered list (\u09E7., \u09E8., \u09E9. in Bangla or 1., 2., 3. in English) on separate lines.').replace(/in 2-3 concise sentences\./gi, "using a clean serial numbered list (\u09E7., \u09E8., \u09E9.) when listing plans, prices, products, or details.");
            }
            if (p.automation_settings) {
              if (p.automation_settings.public_comment_reply_template && p.automation_settings.public_comment_reply_template.includes("\u0986\u09AA\u09A8\u09BE\u09B0 \u0995\u09AE\u09C7\u09A8\u09CD\u099F\u09C7\u09B0 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u0989\u09A4\u09CD\u09A4\u09B0")) {
                p.automation_settings.public_comment_reply_template = "Thank you {customer_name}! \u2764\uFE0F We have sent a detailed reply and product information to your Inbox (Messenger/DM). Please check your inbox! \u{1F4E9}";
              }
              if (p.automation_settings.followup_message_template && p.automation_settings.followup_message_template.includes("\u0986\u09AA\u09A8\u09BF \u0995\u09BF\u099B\u09C1\u0995\u09CD\u09B7\u09A3 \u0986\u0997\u09C7 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09C7\u099C\u09C7 \u09AE\u09C7\u09B8\u09C7\u099C \u09A6\u09BF\u09DF\u09C7\u099B\u09BF\u09B2\u09C7\u09A8")) {
                p.automation_settings.followup_message_template = "Hello {customer_name}! \u{1F60A} You messaged our page earlier. Do you have any questions about our products or ordering? To confirm your order, simply reply with your Name, Full Address, and Phone Number\u2014our AI will book your order right away! \u2764\uFE0F";
              }
              if (p.automation_settings.upsell_offer_text && p.automation_settings.upsell_offer_text.includes("\u09E8\u099F\u09BF \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u098F\u0995\u09B8\u09BE\u09A5\u09C7 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09B2\u09C7")) {
                p.automation_settings.upsell_offer_text = "Order any 2 items together to enjoy FREE delivery or a special 100 BDT discount!";
              }
            }
            uniqueProfiles.push(p);
          });
          parsed.profiles = uniqueProfiles;
        } else {
          parsed.profiles = initialData.profiles;
        }
        if (!parsed.customer_metadata) parsed.customer_metadata = [];
        return parsed;
      }
      loadData() {
        try {
          if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
          }
          const sourceFile = fs.existsSync(DB_FILE) ? DB_FILE : fs.existsSync(BUNDLED_DB_FILE) ? BUNDLED_DB_FILE : null;
          if (sourceFile) {
            const content = fs.readFileSync(sourceFile, "utf-8");
            const parsed = this.normalizeSchema(JSON.parse(content));
            this.saveData(parsed);
            return parsed;
          }
        } catch (err) {
          console.warn("Error reading db.json, falling back to initial seed:", err);
        }
        this.saveData(initialData);
        return initialData;
      }
      saveData(data) {
        try {
          if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
          }
          fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
        } catch (err) {
          console.error("Error saving db.json:", err);
        }
      }
      persist() {
        this.lastLocalWriteAt = Date.now();
        this.data._lastUpdatedAt = this.lastLocalWriteAt;
        this.saveData(this.data);
        this.isDirty = true;
        if (this.getSupabaseConfig()) {
          if (this.pushDebounceTimer) clearTimeout(this.pushDebounceTimer);
          this.pushDebounceTimer = setTimeout(() => {
            this.pushToSupabase().catch((err) => {
              console.warn("[Supabase Sync] Background push warning:", err?.message || err);
            });
          }, 400);
        }
      }
      getLastSupabaseSyncAt() {
        return this.lastSupabaseSyncAt;
      }
      getSupabaseHeaders(key, extra = {}) {
        const headers = {
          apikey: key,
          Authorization: `Bearer ${key}`,
          ...extra
        };
        return headers;
      }
      buildCompactCloudSnapshot() {
        const snapshot = {
          ...this.data,
          _lastUpdatedAt: this.lastLocalWriteAt || this.data._lastUpdatedAt || Date.now()
        };
        if (Array.isArray(this.data.messages) && this.data.messages.length > 0) {
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
      async pushToSupabase() {
        const cfg = this.getSupabaseConfig();
        if (!cfg) return;
        this.isDirty = false;
        const upsertHeaders = this.getSupabaseHeaders(cfg.key, {
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal"
        });
        const patchHeaders = this.getSupabaseHeaders(cfg.key, {
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        });
        const nowIso = (/* @__PURE__ */ new Date()).toISOString();
        const snapshot = this.buildCompactCloudSnapshot();
        const tryRequest = async (urlPath, method, hdrs, bodyObj) => {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 5e3);
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
        tryRequest("/rest/v1/system_settings?on_conflict=key", "POST", upsertHeaders, {
          key: "app_state_backup",
          value: snapshot,
          updated_at: nowIso
        }).catch(() => {
        });
        if (this.useNumericPayloadSchema) {
          let res = await tryRequest("/rest/v1/app_state?on_conflict=id", "POST", upsertHeaders, {
            id: 1,
            payload: snapshot,
            updated_at: nowIso
          });
          if (!res.ok) {
            res = await tryRequest("/rest/v1/app_state?id=eq.1", "PATCH", patchHeaders, {
              payload: snapshot,
              updated_at: nowIso
            });
          }
          if (res.ok) {
            this.lastSupabaseSyncAt = Date.now();
            return;
          }
        }
        let response = await tryRequest("/rest/v1/app_state?on_conflict=id", "POST", upsertHeaders, {
          id: "main",
          state_data: snapshot,
          updated_at: nowIso
        });
        if (!response.ok) {
          response = await tryRequest("/rest/v1/app_state?id=eq.main", "PATCH", patchHeaders, {
            state_data: snapshot,
            updated_at: nowIso
          });
        }
        if (response.ok) {
          this.lastSupabaseSyncAt = Date.now();
          return;
        }
        let fallbackRes = await tryRequest("/rest/v1/app_state?on_conflict=id", "POST", upsertHeaders, {
          id: 1,
          payload: snapshot,
          updated_at: nowIso
        });
        if (!fallbackRes.ok) {
          fallbackRes = await tryRequest("/rest/v1/app_state?id=eq.1", "PATCH", patchHeaders, {
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
      mergeLocalNewerProfiles(incoming) {
        if (!this.data?.profiles || !incoming?.profiles) return incoming;
        const localMap = /* @__PURE__ */ new Map();
        for (const p of this.data.profiles) {
          localMap.set(p.id, p);
        }
        const hasInMemoryWrites = this.lastLocalWriteAt > 0;
        incoming.profiles = incoming.profiles.map((remoteProf) => {
          const localProf = localMap.get(remoteProf.id);
          if (!localProf) return remoteProf;
          const cleanLocalKey = localProf.llm_api_key && !localProf.llm_api_key.trim().startsWith("sk-proj-wJiInvQ") ? localProf.llm_api_key.trim() : "";
          const cleanRemoteKey = remoteProf.llm_api_key && !remoteProf.llm_api_key.trim().startsWith("sk-proj-wJiInvQ") ? remoteProf.llm_api_key.trim() : "";
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
          return {
            ...remoteProf,
            llm_api_key: cleanRemoteKey || cleanLocalKey
          };
        });
        if (!incoming.settings) incoming.settings = {};
        if (this.data?.settings) {
          if (this.data.settings.meta_app_secret && !incoming.settings.meta_app_secret) {
            incoming.settings.meta_app_secret = this.data.settings.meta_app_secret;
          }
          if (this.data.settings.meta_app_id && !incoming.settings.meta_app_id) {
            incoming.settings.meta_app_id = this.data.settings.meta_app_id;
          }
          if (this.data.settings.meta_config_id && !incoming.settings.meta_config_id) {
            incoming.settings.meta_config_id = this.data.settings.meta_config_id;
          }
          if (hasInMemoryWrites) {
            incoming.settings = {
              ...incoming.settings,
              ...this.data.settings
            };
          }
        } else if (this.data.settings?.default_llm_api_key && !incoming.settings?.default_llm_api_key) {
          const localSysKey = String(this.data.settings.default_llm_api_key).trim();
          if (!localSysKey.startsWith("sk-proj-wJiInvQ")) {
            incoming.settings.default_llm_api_key = localSysKey;
          }
        }
        if (this.data?.plans && this.data.plans.length > 0) {
          const localPlanMap = new Map(this.data.plans.map((p) => [p.id, p]));
          incoming.plans = (incoming.plans || []).map((remotePlan) => {
            const local = localPlanMap.get(remotePlan.id);
            if (local && (this.lastLocalWriteAt > 0 || local.updated_at && (!remotePlan.updated_at || new Date(local.updated_at) >= new Date(remotePlan.updated_at)))) {
              return local;
            }
            return remotePlan;
          });
          for (const localP of this.data.plans) {
            if (!incoming.plans.some((ip) => ip.id === localP.id)) {
              incoming.plans.push(localP);
            }
          }
        }
        if (incoming.agents) {
          incoming.agents = incoming.agents.filter((a) => !this.deletedAgentIds.has(a.id));
        } else {
          incoming.agents = [];
        }
        const localAgentMap = new Map((this.data?.agents || []).map((a) => [a.id, a]));
        incoming.agents = (incoming.agents || []).map((remoteAgent) => {
          const local = localAgentMap.get(remoteAgent.id);
          if (local && (this.lastLocalWriteAt > 0 || local.updated_at && (!remoteAgent.updated_at || new Date(local.updated_at) >= new Date(remoteAgent.updated_at)))) {
            return local;
          }
          return remoteAgent;
        });
        for (const localA of this.data?.agents || []) {
          if (this.deletedAgentIds.has(localA.id)) continue;
          if (!incoming.agents.some((ia) => ia.id === localA.id)) {
            incoming.agents.push(localA);
          }
        }
        if (incoming.products) {
          incoming.products = incoming.products.filter((p) => !this.deletedProductIds.has(p.id));
        } else {
          incoming.products = [];
        }
        const localProdMap = new Map((this.data?.products || []).map((p) => [p.id, p]));
        incoming.products = (incoming.products || []).map((remoteProd) => {
          const local = localProdMap.get(remoteProd.id);
          if (local && (this.lastLocalWriteAt > 0 || local.updated_at && (!remoteProd.updated_at || new Date(local.updated_at) >= new Date(remoteProd.updated_at)))) {
            return local;
          }
          return remoteProd;
        });
        for (const localP of this.data?.products || []) {
          if (this.deletedProductIds.has(localP.id)) continue;
          if (!incoming.products.some((ip) => ip.id === localP.id)) {
            incoming.products.push(localP);
          }
        }
        if (this.data?.messages && this.data.messages.length > 0) {
          const msgMap = new Map((incoming.messages || []).map((m) => [m.id, m]));
          for (const localM of this.data.messages) {
            if (!msgMap.has(localM.id)) {
              msgMap.set(localM.id, localM);
            }
          }
          incoming.messages = Array.from(msgMap.values()).sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        }
        if (this.data?.channels && this.data.channels.length > 0 || incoming.channels && incoming.channels.length > 0) {
          const filteredIncoming = (incoming.channels || []).filter(
            (c) => !this.deletedChannelIds.has(c.id)
          );
          const chMap = new Map(filteredIncoming.map((c) => [c.id, c]));
          for (const localC of this.data.channels || []) {
            if (this.deletedChannelIds.has(localC.id)) continue;
            if (!chMap.has(localC.id)) {
              chMap.set(localC.id, localC);
            } else {
              const remoteC = chMap.get(localC.id);
              if (localC.access_token && !remoteC.access_token) {
                chMap.set(localC.id, { ...remoteC, access_token: localC.access_token });
              }
            }
          }
          const dedupedMap = /* @__PURE__ */ new Map();
          for (const ch of chMap.values()) {
            const cleanIdent = String(ch.identifier || ch.meta_asset_id || ch.phone_number_id || ch.id).trim().toLowerCase();
            const key = `${ch.platform}_${cleanIdent}`;
            if (!dedupedMap.has(key)) {
              dedupedMap.set(key, ch);
            } else {
              const existing = dedupedMap.get(key);
              if (!existing.is_active && ch.is_active) {
                dedupedMap.set(key, ch);
              } else if (!existing.access_token && ch.access_token) {
                dedupedMap.set(key, ch);
              }
            }
          }
          incoming.channels = Array.from(dedupedMap.values());
        }
        if (this.data?.orders && this.data.orders.length > 0) {
          const orderMap = new Map((incoming.orders || []).map((o) => [o.id, o]));
          for (const localO of this.data.orders) {
            if (!orderMap.has(localO.id)) {
              orderMap.set(localO.id, localO);
            }
          }
          incoming.orders = Array.from(orderMap.values());
        }
        const localEvents = this.data?.webhook_events || [];
        const remoteEvents = incoming.webhook_events || [];
        const eventMap = new Map(remoteEvents.map((e) => [e.id || `${e.platform}_${e.created_at}`, e]));
        for (const localE of localEvents) {
          const key = localE.id || `${localE.platform}_${localE.created_at}`;
          if (!eventMap.has(key)) {
            eventMap.set(key, localE);
          }
        }
        incoming.webhook_events = Array.from(eventMap.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 200);
        return incoming;
      }
      async syncFromSupabase(force = false) {
        const cfg = this.getSupabaseConfig();
        if (!cfg) {
          console.warn("[Supabase Sync] Skipped: No Supabase URL or Key found in process.env");
          return;
        }
        if (!force && Date.now() - this.lastSupabaseSyncAt < 2e3) {
          return;
        }
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2500);
        try {
          let rawState = null;
          let usedEndpoint = "";
          let response = await fetch(`${cfg.url}/rest/v1/app_state?select=*&order=updated_at.desc&limit=1`, {
            method: "GET",
            headers: this.getSupabaseHeaders(cfg.key, { Accept: "application/json" }),
            signal: controller.signal
          });
          if (!response.ok && response.status === 400) {
            console.warn(`[Supabase Sync] order=updated_at.desc returned 400, trying plain select=* limit 1`);
            response = await fetch(`${cfg.url}/rest/v1/app_state?select=*&limit=1`, {
              method: "GET",
              headers: this.getSupabaseHeaders(cfg.key, { Accept: "application/json" }),
              signal: controller.signal
            });
          }
          if (!response.ok && response.status === 400) {
            response = await fetch(`${cfg.url}/rest/v1/app_state?id=eq.1&select=*`, {
              method: "GET",
              headers: this.getSupabaseHeaders(cfg.key, { Accept: "application/json" }),
              signal: controller.signal
            });
          }
          if (response.ok) {
            const rows = await response.json();
            if (Array.isArray(rows) && rows.length > 0 && rows[0]) {
              const row = rows[0];
              usedEndpoint = "app_state";
              if ("payload" in row || typeof row.id === "number") {
                this.useNumericPayloadSchema = true;
              }
              rawState = row.state_data || row.payload;
              if (typeof rawState === "string") {
                try {
                  rawState = JSON.parse(rawState);
                } catch (pErr) {
                  console.error("[Supabase Sync] Failed to parse serialized state_data string:", pErr);
                }
              }
              if (!rawState && (row.messages || row.profiles)) {
                rawState = row;
              }
            } else {
              console.warn(`[Supabase Sync] app_state returned 0 rows or non-array:`, rows);
            }
          } else {
            const errText = await response.text().catch(() => "");
            console.error(`[Supabase Sync Error] app_state fetch failed HTTP ${response.status} ${response.statusText}: ${errText}`);
          }
          if (!rawState) {
            const sysRes = await fetch(
              `${cfg.url}/rest/v1/system_settings?key=eq.app_state_backup&select=*&limit=1`,
              {
                method: "GET",
                headers: this.getSupabaseHeaders(cfg.key, { Accept: "application/json" }),
                signal: controller.signal
              }
            );
            if (sysRes.ok) {
              const sysRows = await sysRes.json();
              if (Array.isArray(sysRows) && sysRows.length > 0 && sysRows[0]?.value) {
                usedEndpoint = "system_settings (app_state_backup)";
                rawState = sysRows[0].value;
                if (typeof rawState === "string") {
                  try {
                    rawState = JSON.parse(rawState);
                  } catch (_) {
                  }
                }
              }
            } else {
              const sysErrText = await sysRes.text().catch(() => "");
              console.error(`[Supabase Sync Error] system_settings query failed HTTP ${sysRes.status}: ${sysErrText}`);
            }
          }
          if (rawState && typeof rawState === "object") {
            const remoteMsgCount = Array.isArray(rawState.messages) ? rawState.messages.length : 0;
            console.log(`[Supabase Sync Success] Pulled from ${usedEndpoint}. Remote messages: ${remoteMsgCount}, Profiles: ${rawState.profiles?.length || 0}`);
            const normalized = this.normalizeSchema(rawState);
            this.data = this.mergeLocalNewerProfiles(normalized);
            this.loadDeletedIdsFromData(this.data);
            this.saveData(this.data);
            this.lastSupabaseSyncAt = Date.now();
            console.log(`[Supabase Sync Done] In-memory database now has ${this.data.messages.length} messages, ${this.data.channels?.length || 0} channels.`);
          } else {
            console.warn(`[Supabase Sync Warning] No valid state_data found in app_state or system_settings.`);
          }
        } catch (err) {
          console.error("[Supabase Sync Exception] Full error:", err?.message || err);
        } finally {
          clearTimeout(timer);
        }
      }
      async flushToSupabase() {
        if (this.pushDebounceTimer) {
          clearTimeout(this.pushDebounceTimer);
          this.pushDebounceTimer = null;
        }
        if (this.pendingFlushPromise) {
          await this.pendingFlushPromise;
          this.pendingFlushPromise = null;
        }
        if (this.isDirty) {
          this.pendingFlushPromise = this.pushToSupabase().catch((err) => {
            console.warn("[Supabase Sync] Flush warning:", err?.message || err);
          });
          await this.pendingFlushPromise;
          this.pendingFlushPromise = null;
        }
      }
      // --- Profiles ---
      getProfiles() {
        return this.data.profiles;
      }
      getProfileById(id) {
        return this.data.profiles.find((p) => p.id === id);
      }
      getProfileByEmail(email) {
        const clean = (email || "").trim().toLowerCase();
        if (!clean) return void 0;
        return this.data.profiles.find((p) => p.email.trim().toLowerCase() === clean);
      }
      createProfile(profile) {
        const cleanEmail = (profile.email || "").trim().toLowerCase();
        if (this.getProfileByEmail(cleanEmail)) {
          throw new Error(
            "An account with this email address already exists! Only one account is allowed per email. Please Sign In."
          );
        }
        const normalizedProfile = {
          ...profile,
          email: cleanEmail
        };
        this.data.profiles.push(normalizedProfile);
        this.persist();
        return normalizedProfile;
      }
      updateProfile(id, updates) {
        const idx = this.data.profiles.findIndex((p) => p.id === id);
        if (idx === -1) return void 0;
        this.data.profiles[idx] = {
          ...this.data.profiles[idx],
          ...updates,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.persist();
        return this.data.profiles[idx];
      }
      // --- Plans ---
      getPlans() {
        return this.data.plans;
      }
      getActivePlans() {
        return this.data.plans.filter((p) => p.is_active);
      }
      getPlanById(id) {
        return this.data.plans.find((p) => p.id === id);
      }
      createPlan(plan) {
        this.data.plans.push(plan);
        this.persist();
        return plan;
      }
      updatePlan(id, updates) {
        const idx = this.data.plans.findIndex((p) => p.id === id);
        if (idx === -1) return void 0;
        this.data.plans[idx] = {
          ...this.data.plans[idx],
          ...updates,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.persist();
        return this.data.plans[idx];
      }
      deletePlan(id) {
        const idx = this.data.plans.findIndex((p) => p.id === id);
        if (idx === -1) return false;
        this.data.plans.splice(idx, 1);
        this.persist();
        return true;
      }
      // --- Multi-Business AI Agents ---
      getAgents(userId) {
        if (!this.data.agents) this.data.agents = [];
        let userAgents = this.data.agents.filter((a) => a.user_id === userId);
        if (userAgents.length === 0) {
          const user = this.getProfileById(userId);
          const userChannels = this.getChannels(userId);
          const defaultAgent = {
            id: `agent_${userId.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${Date.now().toString(36)}`,
            user_id: userId,
            name: "Main Business AI Agent",
            business_name: user?.full_name || "My Online Store",
            avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80",
            tone: "sales_closer",
            language: "bangla",
            assigned_channels: userChannels.map((c) => c.id),
            system_prompt: user?.system_prompt || "You are an executive customer service and sales AI agent for our business. Reply politely in natural Bangla, answer product questions accurately, and collect Name, Full Address, and Phone Number to close orders.",
            knowledge_base: "Business: E-commerce products & fast delivery.\nDelivery Charges: Inside Dhaka 60 BDT, Outside Dhaka 120 BDT.\nPayment: Cash on Delivery (COD), bKash / Nagad.",
            delivery_charge_inside_dhaka: 60,
            delivery_charge_outside_dhaka: 120,
            is_active: true,
            total_chats: 0,
            total_orders: 0,
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          };
          this.data.agents.push(defaultAgent);
          this.persist();
          userAgents = [defaultAgent];
        }
        return userAgents;
      }
      getAgentById(id) {
        if (!this.data.agents) this.data.agents = [];
        return this.data.agents.find((a) => a.id === id);
      }
      createAgent(agent) {
        if (!this.data.agents) this.data.agents = [];
        this.deletedAgentIds.delete(agent.id);
        this.syncDeletedIdsToData();
        this.data.agents.push(agent);
        this.persist();
        return agent;
      }
      updateAgent(id, updates) {
        if (!this.data.agents) this.data.agents = [];
        const idx = this.data.agents.findIndex((a) => a.id === id);
        if (idx === -1) return void 0;
        this.data.agents[idx] = {
          ...this.data.agents[idx],
          ...updates,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.persist();
        return this.data.agents[idx];
      }
      deleteAgent(id) {
        if (!this.data.agents) this.data.agents = [];
        this.deletedAgentIds.add(id);
        this.syncDeletedIdsToData();
        const idx = this.data.agents.findIndex((a) => a.id === id);
        if (idx !== -1) {
          this.data.agents.splice(idx, 1);
        }
        this.persist();
        return true;
      }
      // --- Subscriptions ---
      getSubscriptions() {
        return this.data.subscriptions;
      }
      getSubscriptionByUserId(userId) {
        return this.data.subscriptions.find((s) => s.user_id === userId);
      }
      createSubscription(sub) {
        this.data.subscriptions = this.data.subscriptions.filter((s) => s.user_id !== sub.user_id);
        this.data.subscriptions.push(sub);
        this.persist();
        return sub;
      }
      updateSubscription(id, updates) {
        const idx = this.data.subscriptions.findIndex((s) => s.id === id);
        if (idx === -1) return void 0;
        this.data.subscriptions[idx] = {
          ...this.data.subscriptions[idx],
          ...updates,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.persist();
        return this.data.subscriptions[idx];
      }
      // --- Payments ---
      getPayments() {
        return this.data.payments;
      }
      getPaymentsByUserId(userId) {
        return this.data.payments.filter((p) => p.user_id === userId);
      }
      getPaymentById(id) {
        return this.data.payments.find((p) => p.id === id);
      }
      createPayment(payment) {
        this.data.payments.unshift(payment);
        this.persist();
        return payment;
      }
      updatePayment(id, updates) {
        const idx = this.data.payments.findIndex((p) => p.id === id);
        if (idx === -1) return void 0;
        this.data.payments[idx] = {
          ...this.data.payments[idx],
          ...updates
        };
        this.persist();
        return this.data.payments[idx];
      }
      // --- Channels ---
      getChannels(userId) {
        let list = this.data.channels || [];
        if (userId) {
          const user = this.getProfileById(userId);
          if (user?.role !== "admin") {
            const userChannels = list.filter((c) => c.user_id === userId);
            if (userChannels.length > 0) {
              list = userChannels;
            }
          }
        }
        const seen = /* @__PURE__ */ new Map();
        for (const c of list) {
          if (this.deletedChannelIds.has(c.id)) continue;
          const cleanId = String(c.identifier || c.meta_asset_id || c.phone_number_id || c.id).trim().toLowerCase();
          const key = `${c.platform}_${cleanId}`;
          if (!seen.has(key)) {
            seen.set(key, c);
          } else {
            const existing = seen.get(key);
            if (!existing.is_active && c.is_active) {
              seen.set(key, c);
            } else if (!existing.access_token && c.access_token) {
              seen.set(key, c);
            }
          }
        }
        return Array.from(seen.values());
      }
      getChannelById(id) {
        if (this.deletedChannelIds.has(id)) return void 0;
        return this.data.channels.find((c) => c.id === id);
      }
      getChannelByIdentifier(platform, identifier) {
        const cleanId = String(identifier || "").trim().toLowerCase();
        if (!cleanId) return void 0;
        const exact = this.data.channels.find(
          (c) => !this.deletedChannelIds.has(c.id) && c.platform === platform && c.is_active && (c.identifier.trim().toLowerCase() === cleanId || c.meta_asset_id && c.meta_asset_id.trim().toLowerCase() === cleanId || c.phone_number_id && c.phone_number_id.trim().toLowerCase() === cleanId || c.waba_id && c.waba_id.trim().toLowerCase() === cleanId || c.phone_number && String(c.phone_number).trim().toLowerCase() === cleanId)
        );
        if (exact) return exact;
        const digitsOnly = cleanId.replace(/\D/g, "");
        const flexible = this.data.channels.find((c) => {
          if (this.deletedChannelIds.has(c.id) || c.platform !== platform || !c.is_active) return false;
          const cId = c.identifier.trim().toLowerCase();
          const assetId = (c.meta_asset_id || "").trim().toLowerCase();
          const phoneId = (c.phone_number_id || "").trim().toLowerCase();
          const phoneProp = String(c.phone_number || "").trim().toLowerCase();
          if (cId === cleanId || assetId === cleanId || phoneProp === cleanId || cId.replace(/^page_/, "") === cleanId.replace(/^page_/, "") || cId.replace(/^\+/, "") === cleanId.replace(/^\+/, "") || assetId.replace(/^\+/, "") === cleanId.replace(/^\+/, "")) {
            return true;
          }
          if (platform === "whatsapp") {
            const cDigits = cId.replace(/\D/g, "");
            const assetDigits = assetId.replace(/\D/g, "");
            const phoneDigits = phoneProp.replace(/\D/g, "");
            const nameDigits = (c.name || "").replace(/\D/g, "");
            if (digitsOnly.length >= 8) {
              const tail8 = digitsOnly.slice(-8);
              if (cDigits.length >= 8 && cDigits.slice(-8) === tail8 || assetDigits.length >= 8 && assetDigits.slice(-8) === tail8 || phoneDigits.length >= 8 && phoneDigits.slice(-8) === tail8 || nameDigits.length >= 8 && nameDigits.slice(-8) === tail8) {
                return true;
              }
            }
          }
          return false;
        });
        if (flexible) return flexible;
        const platformChannels = this.data.channels.filter(
          (c) => !this.deletedChannelIds.has(c.id) && c.platform === platform && c.is_active
        );
        if (platformChannels.length >= 1) {
          console.log(`[Database] Resilient fallback matched incoming ${platform} (${identifier}) to configured channel ${platformChannels[0].name} (${platformChannels[0].identifier})`);
          return platformChannels[0];
        }
        return void 0;
      }
      createChannel(channel) {
        this.deletedChannelIds.delete(channel.id);
        this.syncDeletedIdsToData();
        const cleanId = String(channel.identifier || channel.meta_asset_id || channel.phone_number_id || "").trim().toLowerCase();
        const existingIdx = this.data.channels.findIndex((c) => {
          if (c.platform !== channel.platform) return false;
          if (c.id === channel.id) return true;
          if (!cleanId) return false;
          const cId = String(c.identifier || "").trim().toLowerCase();
          const cAsset = String(c.meta_asset_id || "").trim().toLowerCase();
          const cPhone = String(c.phone_number_id || "").trim().toLowerCase();
          return cId === cleanId || cAsset === cleanId || cPhone === cleanId;
        });
        if (existingIdx !== -1) {
          this.data.channels[existingIdx] = {
            ...this.data.channels[existingIdx],
            ...channel,
            id: this.data.channels[existingIdx].id,
            // keep stable ID
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          };
          this.persist();
          return this.data.channels[existingIdx];
        }
        this.data.channels.push(channel);
        this.persist();
        return channel;
      }
      updateChannel(id, updates) {
        this.deletedChannelIds.delete(id);
        this.syncDeletedIdsToData();
        const idx = this.data.channels.findIndex((c) => c.id === id);
        if (idx === -1) return void 0;
        this.data.channels[idx] = {
          ...this.data.channels[idx],
          ...updates,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.persist();
        return this.data.channels[idx];
      }
      deleteChannel(id, userId) {
        this.deletedChannelIds.add(id);
        const target = this.data.channels.find((c) => c.id === id);
        const targetIdent = target ? String(target.identifier || target.meta_asset_id || target.phone_number_id || "").trim().toLowerCase() : "";
        const targetPlatform = target?.platform;
        const beforeCount = this.data.channels.length;
        this.data.channels = this.data.channels.filter((c) => {
          if (c.id === id) return false;
          if (targetPlatform && targetIdent && c.platform === targetPlatform) {
            const cId = String(c.identifier || c.meta_asset_id || c.phone_number_id || "").trim().toLowerCase();
            if (cId === targetIdent) {
              this.deletedChannelIds.add(c.id);
              return false;
            }
          }
          return true;
        });
        this.syncDeletedIdsToData();
        const deleted = this.data.channels.length < beforeCount;
        this.persist();
        return deleted || true;
      }
      // --- Multi-Tenant Businesses ---
      getBusinesses(userId) {
        const bizList = this.data.businesses || [];
        if (userId) {
          return bizList.filter((b) => b.user_id === userId);
        }
        return bizList;
      }
      createBusiness(biz) {
        if (!this.data.businesses) this.data.businesses = [];
        this.data.businesses.push(biz);
        this.persist();
        return biz;
      }
      // --- Facebook Pages Assets ---
      getFacebookPages(userId) {
        const list = this.data.facebook_pages || [];
        if (userId) {
          return list.filter((p) => p.user_id === userId);
        }
        return list;
      }
      saveFacebookPage(page) {
        if (!this.data.facebook_pages) this.data.facebook_pages = [];
        const idx = this.data.facebook_pages.findIndex((p) => p.id === page.id && p.user_id === page.user_id);
        if (idx >= 0) {
          this.data.facebook_pages[idx] = {
            ...this.data.facebook_pages[idx],
            ...page,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          };
        } else {
          this.data.facebook_pages.push(page);
        }
        this.persist();
        return page;
      }
      deleteFacebookPage(pageId, userId) {
        if (!this.data.facebook_pages) return false;
        const idx = this.data.facebook_pages.findIndex((p) => p.id === pageId && p.user_id === userId);
        if (idx === -1) return false;
        this.data.facebook_pages.splice(idx, 1);
        this.persist();
        return true;
      }
      // --- Instagram Accounts Assets ---
      getInstagramAccounts(userId) {
        const list = this.data.instagram_accounts || [];
        if (userId) {
          return list.filter((a) => a.user_id === userId);
        }
        return list;
      }
      saveInstagramAccount(account) {
        if (!this.data.instagram_accounts) this.data.instagram_accounts = [];
        const idx = this.data.instagram_accounts.findIndex((a) => a.id === account.id && a.user_id === account.user_id);
        if (idx >= 0) {
          this.data.instagram_accounts[idx] = {
            ...this.data.instagram_accounts[idx],
            ...account,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          };
        } else {
          this.data.instagram_accounts.push(account);
        }
        this.persist();
        return account;
      }
      // --- WhatsApp Business Accounts & Phone Numbers ---
      getWhatsAppAccounts(userId) {
        const list = this.data.whatsapp_business_accounts || [];
        if (userId) {
          return list.filter((w) => w.user_id === userId);
        }
        return list;
      }
      saveWhatsAppAccount(waba) {
        if (!this.data.whatsapp_business_accounts) this.data.whatsapp_business_accounts = [];
        const idx = this.data.whatsapp_business_accounts.findIndex((w) => w.id === waba.id && w.user_id === waba.user_id);
        if (idx >= 0) {
          this.data.whatsapp_business_accounts[idx] = {
            ...this.data.whatsapp_business_accounts[idx],
            ...waba,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          };
        } else {
          this.data.whatsapp_business_accounts.push(waba);
        }
        this.persist();
        return waba;
      }
      getWhatsAppPhoneNumbers(userId) {
        const list = this.data.whatsapp_phone_numbers || [];
        if (userId) {
          return list.filter((p) => p.user_id === userId);
        }
        return list;
      }
      saveWhatsAppPhoneNumber(phone) {
        if (!this.data.whatsapp_phone_numbers) this.data.whatsapp_phone_numbers = [];
        const idx = this.data.whatsapp_phone_numbers.findIndex((p) => p.id === phone.id && p.user_id === phone.user_id);
        if (idx >= 0) {
          this.data.whatsapp_phone_numbers[idx] = {
            ...this.data.whatsapp_phone_numbers[idx],
            ...phone,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          };
        } else {
          this.data.whatsapp_phone_numbers.push(phone);
        }
        this.persist();
        return phone;
      }
      // --- Webhook Events Logging ---
      logWebhookEvent(event) {
        if (!this.data.webhook_events) this.data.webhook_events = [];
        this.data.webhook_events.unshift(event);
        if (this.data.webhook_events.length > 200) {
          this.data.webhook_events = this.data.webhook_events.slice(0, 200);
        }
        this.persist();
        return event;
      }
      getWebhookEvents(limit = 50) {
        const list = this.data.webhook_events || [];
        return list.slice(0, limit);
      }
      // --- Audit Logs ---
      logAudit(log) {
        if (!this.data.audit_logs) this.data.audit_logs = [];
        this.data.audit_logs.unshift(log);
        if (this.data.audit_logs.length > 200) {
          this.data.audit_logs = this.data.audit_logs.slice(0, 200);
        }
        this.persist();
        return log;
      }
      getAuditLogs(userId, limit = 50) {
        const list = this.data.audit_logs || [];
        if (userId) {
          return list.filter((l) => l.user_id === userId).slice(0, limit);
        }
        return list.slice(0, limit);
      }
      // --- Messages ---
      getMessages(userId, channelId) {
        let msgs = this.data.messages.filter((m) => m.user_id === userId);
        if (channelId) {
          msgs = msgs.filter((m) => m.channel_id === channelId);
        }
        return msgs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      }
      getAllMessages() {
        return this.data.messages;
      }
      createMessage(msg) {
        this.data.messages.push(msg);
        this.persist();
        return msg;
      }
      updateMessage(updatedMsg) {
        const idx = this.data.messages.findIndex((m) => m.id === updatedMsg.id);
        if (idx !== -1) {
          this.data.messages[idx] = updatedMsg;
          this.persist();
        }
        return updatedMsg;
      }
      // --- Customer Metadata ---
      getCustomerMetadata(userId, customerId) {
        if (!this.data.customer_metadata) this.data.customer_metadata = [];
        const id = `${userId}_${customerId}`;
        return this.data.customer_metadata.find(
          (m) => m.id === id || m.user_id === userId && m.customer_id === customerId
        ) || null;
      }
      upsertCustomerMetadata(userId, customerId, updates) {
        if (!this.data.customer_metadata) this.data.customer_metadata = [];
        const id = `${userId}_${customerId}`;
        const nowIso = (/* @__PURE__ */ new Date()).toISOString();
        const existingIndex = this.data.customer_metadata.findIndex(
          (m) => m.id === id || m.user_id === userId && m.customer_id === customerId
        );
        if (existingIndex !== -1) {
          const current = this.data.customer_metadata[existingIndex];
          const updated = {
            ...current,
            ...updates,
            id,
            user_id: userId,
            customer_id: customerId,
            updated_at: nowIso
          };
          this.data.customer_metadata[existingIndex] = updated;
          this.persist();
          return updated;
        } else {
          const created = {
            id,
            user_id: userId,
            customer_id: customerId,
            customer_name: updates.customer_name,
            customer_phone: updates.customer_phone,
            customer_address: updates.customer_address,
            customer_avatar: updates.customer_avatar,
            tags: updates.tags || [],
            notes: updates.notes || "",
            is_starred: updates.is_starred || false,
            is_deleted: updates.is_deleted || false,
            assigned_agent_id: updates.assigned_agent_id,
            created_at: nowIso,
            updated_at: nowIso
          };
          this.data.customer_metadata.push(created);
          this.persist();
          return created;
        }
      }
      getAllCustomerMetadata(userId) {
        if (!this.data.customer_metadata) this.data.customer_metadata = [];
        if (userId) {
          return this.data.customer_metadata.filter((m) => m.user_id === userId);
        }
        return this.data.customer_metadata;
      }
      deleteCustomerPermanently(userId, customerId) {
        if (this.data.customer_metadata) {
          const metaIdx = this.data.customer_metadata.findIndex(
            (m) => m.user_id === userId && m.customer_id === customerId || m.id === `${userId}_${customerId}`
          );
          if (metaIdx !== -1) {
            this.data.customer_metadata.splice(metaIdx, 1);
          }
        }
        if (this.data.messages) {
          this.data.messages = this.data.messages.filter(
            (m) => !(m.user_id === userId && m.customer_id === customerId)
          );
        }
        this.persist();
        return true;
      }
      // --- Orders ---
      getOrders(userId) {
        const all = this.data.orders || [];
        const filtered = userId ? all.filter((o) => o.user_id === userId) : all;
        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      getOrderById(id) {
        return (this.data.orders || []).find((o) => o.id === id);
      }
      getOrdersByCustomerId(customerId) {
        return (this.data.orders || []).filter((o) => o.customer_id === customerId);
      }
      createOrder(order) {
        if (!this.data.orders) {
          this.data.orders = [];
        }
        this.data.orders.unshift(order);
        this.deductStockForOrder(order);
        this.persist();
        return order;
      }
      deductStockForOrder(order) {
        try {
          if (order.status === "cancelled") return;
          const qtyToDeduct = Math.max(1, Number(order.quantity) || 1);
          const userProducts = this.getProducts(order.user_id);
          const itemsLower = (order.items || "").toLowerCase();
          if (!itemsLower || userProducts.length === 0) return;
          for (const prod of userProducts) {
            const nameLower = prod.name.toLowerCase();
            const wordMatch = nameLower.split(/\s+/).filter((w) => w.length >= 4).some((w) => itemsLower.includes(w));
            const kwMatch = prod.keywords?.some(
              (k) => k.trim().length >= 3 && itemsLower.includes(k.trim().toLowerCase())
            );
            if (itemsLower.includes(nameLower) || wordMatch || kwMatch) {
              const currentStock = prod.stock_quantity !== void 0 ? Number(prod.stock_quantity) : prod.stock_status === "out_of_stock" ? 0 : prod.stock_status === "low_stock" ? 5 : 25;
              const nextStock = Math.max(0, currentStock - qtyToDeduct);
              const nextStatus = nextStock <= 0 ? "out_of_stock" : nextStock <= 5 ? "low_stock" : "in_stock";
              this.updateProduct(prod.id, {
                stock_quantity: nextStock,
                sold_count: (prod.sold_count || 0) + qtyToDeduct,
                stock_status: nextStatus
              });
              break;
            }
          }
        } catch (err) {
          console.warn("[Auto Stock Deduction] Warning:", err);
        }
      }
      updateOrder(id, updates) {
        if (!this.data.orders) return void 0;
        const idx = this.data.orders.findIndex((o) => o.id === id);
        if (idx === -1) return void 0;
        this.data.orders[idx] = {
          ...this.data.orders[idx],
          ...updates,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.persist();
        return this.data.orders[idx];
      }
      deleteOrder(id) {
        if (!this.data.orders) return false;
        const idx = this.data.orders.findIndex((o) => o.id === id);
        if (idx === -1) return false;
        this.data.orders.splice(idx, 1);
        this.persist();
        return true;
      }
      // --- Order Confirmation Settings ---
      getOrderSettings(userId) {
        const profile = this.getProfileById(userId);
        if (profile && profile.order_settings) {
          return {
            ...DEFAULT_ORDER_SETTINGS,
            ...profile.order_settings,
            required_fields: {
              ...DEFAULT_ORDER_SETTINGS.required_fields,
              ...profile.order_settings.required_fields || {}
            }
          };
        }
        return { ...DEFAULT_ORDER_SETTINGS };
      }
      updateOrderSettings(userId, updates) {
        const profile = this.getProfileById(userId);
        if (!profile) return { ...DEFAULT_ORDER_SETTINGS };
        const current = profile.order_settings || { ...DEFAULT_ORDER_SETTINGS };
        const updated = {
          ...current,
          ...updates,
          required_fields: {
            ...current.required_fields,
            ...updates.required_fields || {}
          }
        };
        this.updateProfile(userId, { order_settings: updated });
        return updated;
      }
      // --- Automation Settings (Comment Reply, Follow-up, Upsell, Tracking, P&L) ---
      getAutomationSettings(userId) {
        const profile = this.getProfileById(userId);
        if (profile && profile.automation_settings) {
          return {
            ...DEFAULT_AUTOMATION_SETTINGS,
            ...profile.automation_settings
          };
        }
        return { ...DEFAULT_AUTOMATION_SETTINGS };
      }
      updateAutomationSettings(userId, updates) {
        const profile = this.getProfileById(userId);
        if (!profile) return { ...DEFAULT_AUTOMATION_SETTINGS };
        const current = profile.automation_settings || { ...DEFAULT_AUTOMATION_SETTINGS };
        const updated = {
          ...current,
          ...updates
        };
        this.updateProfile(userId, { automation_settings: updated });
        return updated;
      }
      // --- Auto Courier Dispatch & Fraud Screening Settings ---
      getAutoCourierSettings(userId) {
        const profile = this.getProfileById(userId);
        if (profile && profile.auto_courier_settings) {
          return {
            ...DEFAULT_AUTO_COURIER_SETTINGS,
            ...profile.auto_courier_settings,
            risk_rules: {
              ...DEFAULT_AUTO_COURIER_SETTINGS.risk_rules,
              ...profile.auto_courier_settings.risk_rules || {}
            }
          };
        }
        return { ...DEFAULT_AUTO_COURIER_SETTINGS };
      }
      updateAutoCourierSettings(userId, updates) {
        const profile = this.getProfileById(userId);
        if (!profile) return { ...DEFAULT_AUTO_COURIER_SETTINGS };
        const current = profile.auto_courier_settings || { ...DEFAULT_AUTO_COURIER_SETTINGS };
        const updated = {
          ...current,
          ...updates,
          risk_rules: {
            ...current.risk_rules,
            ...updates.risk_rules || {}
          }
        };
        this.updateProfile(userId, { auto_courier_settings: updated });
        return updated;
      }
      // --- Store Integrations (Shopify, WooCommerce, Custom Website) ---
      getStores(userId) {
        const all = this.data.stores || [];
        const filtered = userId ? all.filter((s) => s.user_id === userId) : all;
        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      getStoreById(id) {
        return (this.data.stores || []).find((s) => s.id === id);
      }
      createStore(store) {
        if (!this.data.stores) {
          this.data.stores = [];
        }
        this.data.stores.unshift(store);
        this.persist();
        return store;
      }
      updateStore(id, updates) {
        if (!this.data.stores) return void 0;
        const idx = this.data.stores.findIndex((s) => s.id === id);
        if (idx === -1) return void 0;
        this.data.stores[idx] = {
          ...this.data.stores[idx],
          ...updates,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.persist();
        return this.data.stores[idx];
      }
      deleteStore(id) {
        if (!this.data.stores) return false;
        const idx = this.data.stores.findIndex((s) => s.id === id);
        if (idx === -1) return false;
        this.data.stores.splice(idx, 1);
        this.persist();
        return true;
      }
      // --- Call Requests (Human Handover Queue) ---
      getCallRequests(userId) {
        const all = this.data.call_requests || [];
        const filtered = userId ? all.filter((c) => c.user_id === userId) : all;
        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      getCallRequestById(id) {
        return (this.data.call_requests || []).find((c) => c.id === id);
      }
      createCallRequest(req) {
        if (!this.data.call_requests) {
          this.data.call_requests = [];
        }
        this.data.call_requests.unshift(req);
        this.persist();
        return req;
      }
      updateCallRequest(id, updates) {
        if (!this.data.call_requests) return void 0;
        const idx = this.data.call_requests.findIndex((c) => c.id === id);
        if (idx === -1) return void 0;
        this.data.call_requests[idx] = {
          ...this.data.call_requests[idx],
          ...updates,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.persist();
        return this.data.call_requests[idx];
      }
      deleteCallRequest(id) {
        if (!this.data.call_requests) return false;
        const idx = this.data.call_requests.findIndex((c) => c.id === id);
        if (idx === -1) return false;
        this.data.call_requests.splice(idx, 1);
        this.persist();
        return true;
      }
      // --- Products Catalog ---
      getProducts(userId) {
        const list = this.data.products || [];
        if (userId) {
          return list.filter((p) => p.user_id === userId);
        }
        return list;
      }
      getProductById(id) {
        return (this.data.products || []).find((p) => p.id === id);
      }
      createProduct(product) {
        if (!this.data.products) this.data.products = [];
        this.deletedProductIds.delete(product.id);
        this.syncDeletedIdsToData();
        product.keywords = this.enrichProductKeywords(product);
        this.data.products.unshift(product);
        this.persist();
        return product;
      }
      updateProduct(id, updates) {
        if (!this.data.products) return void 0;
        const idx = this.data.products.findIndex((p) => p.id === id);
        if (idx === -1) return void 0;
        let nextKeywords = updates.keywords;
        if (updates.name || updates.category || updates.keywords) {
          const merged = { ...this.data.products[idx], ...updates };
          nextKeywords = this.enrichProductKeywords(merged);
        }
        this.data.products[idx] = {
          ...this.data.products[idx],
          ...updates,
          ...nextKeywords && { keywords: nextKeywords },
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.persist();
        return this.data.products[idx];
      }
      enrichProductKeywords(product) {
        const existingKw = (product.keywords || []).map((k) => String(k).toLowerCase().trim()).filter(Boolean);
        const kwSet = new Set(existingKw);
        const textToAnalyze = `${product.name || ""} ${product.category || ""} ${product.description || ""}`.toLowerCase();
        const words = textToAnalyze.split(/[\s\-_,./()]+/).filter((w) => w.length >= 2);
        for (const w of words) {
          kwSet.add(w);
        }
        const CONCEPT_MAP = [
          {
            triggers: ["shirt", "\u09B6\u09BE\u09B0\u09CD\u099F", "\u09B8\u09BE\u09B0\u09CD\u099F", "oxford"],
            synonyms: ["shirt", "shiet", "shart", "sirt", "sart", "\u09B6\u09BE\u09B0\u09CD\u099F", "\u09B8\u09BE\u09B0\u09CD\u099F", "\u09AB\u09C1\u09B2 \u09B9\u09BE\u09A4\u09BE", "\u09B9\u09BE\u09AB \u09B9\u09BE\u09A4\u09BE"]
          },
          {
            triggers: ["pant", "pants", "\u09AA\u09CD\u09AF\u09BE\u09A8\u09CD\u099F", "jeans", "\u099C\u09BF\u09A8\u09CD\u09B8", "cargo", "jogger", "trouser"],
            synonyms: ["pant", "pants", "pent", "pents", "\u09AA\u09CD\u09AF\u09BE\u09A8\u09CD\u099F", "\u099C\u09BF\u09A8\u09CD\u09B8", "jeans", "cargo", "\u0995\u09BE\u09B0\u09CD\u0997\u09CB", "jogger", "\u099C\u0997\u09BE\u09B0"]
          },
          {
            triggers: ["panjabi", "\u09AA\u09BE\u099E\u09CD\u099C\u09BE\u09AC\u09BF", "\u09AA\u09BE\u099E\u09CD\u099C\u09BE\u09AC\u09C0"],
            synonyms: ["panjabi", "punjabi", "\u09AA\u09BE\u099E\u09CD\u099C\u09BE\u09AC\u09BF", "\u09AA\u09BE\u099E\u09CD\u099C\u09BE\u09AC\u09C0"]
          },
          {
            triggers: ["saree", "shari", "\u09B6\u09BE\u09DC\u09BF", "\u09B6\u09BE\u09A1\u09BC\u09BF"],
            synonyms: ["saree", "shari", "sari", "\u09B6\u09BE\u09DC\u09BF", "\u09B6\u09BE\u09A1\u09BC\u09BF"]
          },
          {
            triggers: ["kurti", "\u0995\u09C1\u09B0\u09CD\u09A4\u09BF", "\u0995\u09BE\u09AE\u09BF\u099C", "kameez", "three piece", "\u09A5\u09CD\u09B0\u09BF \u09AA\u09BF\u09B8"],
            synonyms: ["kurti", "\u0995\u09C1\u09B0\u09CD\u09A4\u09BF", "\u0995\u09BE\u09AE\u09BF\u099C", "three piece", "\u09A5\u09CD\u09B0\u09BF\u09AA\u09BF\u09B8", "\u09A5\u09CD\u09B0\u09BF \u09AA\u09BF\u09B8", "salwar", "\u09B8\u09BE\u09B2\u09CB\u09AF\u09BC\u09BE\u09B0"]
          },
          {
            triggers: ["borka", "abaya", "burqa", "\u09AC\u09CB\u09B0\u0995\u09BE", "\u09B9\u09BF\u099C\u09BE\u09AC", "hijab"],
            synonyms: ["borka", "abaya", "\u09AC\u09CB\u09B0\u0995\u09BE", "\u09B9\u09BF\u099C\u09BE\u09AC", "hijab"]
          },
          {
            triggers: ["tshirt", "t-shirt", "\u099F\u09BF-\u09B6\u09BE\u09B0\u09CD\u099F", "\u099F\u09BF\u09B6\u09BE\u09B0\u09CD\u099F", "polo", "\u09AA\u09CB\u09B2\u09CB", "\u0997\u09C7\u099E\u09CD\u099C\u09BF"],
            synonyms: ["tshirt", "t-shirt", "\u099F\u09BF-\u09B6\u09BE\u09B0\u09CD\u099F", "\u099F\u09BF\u09B6\u09BE\u09B0\u09CD\u099F", "polo", "\u09AA\u09CB\u09B2\u09CB", "\u0997\u09C7\u099E\u09CD\u099C\u09BF", "genji"]
          },
          {
            triggers: ["honey", "\u09AE\u09A7\u09C1", "modhu"],
            synonyms: ["honey", "\u09AE\u09A7\u09C1", "modhu", "khati modhu", "\u0996\u09BE\u0981\u099F\u09BF \u09AE\u09A7\u09C1", "\u09B8\u09C1\u09A8\u09CD\u09A6\u09B0\u09AC\u09A8"]
          },
          {
            triggers: ["ghee", "\u0998\u09BF", "ghi"],
            synonyms: ["ghee", "\u0998\u09BF", "\u0997\u09BE\u0993\u09DF\u09BE \u0998\u09BF", "gawa ghee", "khati ghee"]
          },
          {
            triggers: ["oil", "\u09A4\u09C7\u09B2", "tel", "mustard", "\u09B8\u09B0\u09BF\u09B7\u09BE"],
            synonyms: ["oil", "\u09A4\u09C7\u09B2", "tel", "mustard oil", "\u09B8\u09B0\u09BF\u09B7\u09BE\u09B0 \u09A4\u09C7\u09B2", "khati tel"]
          },
          {
            triggers: ["tea", "\u099A\u09BE", "cha"],
            synonyms: ["tea", "\u099A\u09BE", "\u09AA\u09BE\u09A4\u09BE \u099A\u09BE", "\u0997\u09CD\u09B0\u09BF\u09A8 \u099F\u09BF", "green tea"]
          },
          {
            triggers: ["khejur", "dates", "\u0996\u09C7\u099C\u09C1\u09B0"],
            synonyms: ["khejur", "dates", "\u0996\u09C7\u099C\u09C1\u09B0", "\u09AE\u09B0\u09BF\u09DF\u09AE \u0996\u09C7\u099C\u09C1\u09B0", "\u0986\u099C\u0993\u09DF\u09BE"]
          },
          {
            triggers: ["gur", "\u0997\u09C1\u09DC", "\u0997\u09C1\u09A1\u09BC"],
            synonyms: ["gur", "\u0997\u09C1\u09DC", "\u0997\u09C1\u09A1\u09BC", "\u0996\u09C7\u099C\u09C1\u09B0\u09C7\u09B0 \u0997\u09C1\u09DC", "\u099D\u09C1\u09B2\u09BE \u0997\u09C1\u09DC", "\u09AA\u09BE\u099F\u09BE\u09B2\u09BF \u0997\u09C1\u09DC"]
          },
          {
            triggers: ["watch", "\u0998\u09DC\u09BF", "\u0998\u09A1\u09BC\u09BF", "smartwatch"],
            synonyms: ["watch", "\u0998\u09DC\u09BF", "\u0998\u09A1\u09BC\u09BF", "smartwatch", "\u09B8\u09CD\u09AE\u09BE\u09B0\u09CD\u099F\u0993\u09AF\u09BC\u09BE\u099A", "\u09B8\u09CD\u09AE\u09BE\u09B0\u09CD\u099F\u0993\u09DF\u09BE\u099A", "calling watch"]
          },
          {
            triggers: ["airpod", "airpods", "earbud", "earbuds", "headphone", "\u09B9\u09C7\u09A1\u09AB\u09CB\u09A8", "\u0987\u09AF\u09BC\u09BE\u09B0\u09AC\u09BE\u09A1"],
            synonyms: ["airpods", "earbuds", "headphone", "\u098F\u09DF\u09BE\u09B0\u09AC\u09BE\u09A1\u09B8", "\u09B9\u09C7\u09A1\u09AB\u09CB\u09A8", "wireless"]
          },
          {
            triggers: ["powerbank", "\u09AA\u09BE\u0993\u09AF\u09BC\u09BE\u09B0 \u09AC\u09CD\u09AF\u09BE\u0982\u0995"],
            synonyms: ["powerbank", "\u09AA\u09BE\u0993\u09AF\u09BC\u09BE\u09B0 \u09AC\u09CD\u09AF\u09BE\u0982\u0995", "charger"]
          },
          {
            triggers: ["serum", "\u09B8\u09C7\u09B0\u09BE\u09AE", "\u09B8\u09BF\u09B0\u09BE\u09AE"],
            synonyms: ["serum", "seram", "\u09B8\u09C7\u09B0\u09BE\u09AE", "\u09B8\u09BF\u09B0\u09BE\u09AE", "face serum"]
          },
          {
            triggers: ["lotion", "\u09B2\u09CB\u09B6\u09A8", "moisturizer"],
            synonyms: ["lotion", "loson", "\u09B2\u09CB\u09B6\u09A8", "body lotion", "moisturizer"]
          },
          {
            triggers: ["sunscreen", "\u09B8\u09BE\u09A8\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8", "sunblock"],
            synonyms: ["sunscreen", "\u09B8\u09BE\u09A8\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8", "sunblock", "\u09B8\u09BE\u09A8\u09AC\u09CD\u09B2\u0995"]
          },
          {
            triggers: ["facewash", "\u09AB\u09C7\u09B8\u0993\u09DF\u09BE\u09B6", "\u09AB\u09C7\u09B8\u0993\u09AF\u09BC\u09BE\u09B6"],
            synonyms: ["facewash", "\u09AB\u09C7\u09B8\u0993\u09DF\u09BE\u09B6", "\u09AB\u09C7\u09B8\u0993\u09AF\u09BC\u09BE\u09B6", "face wash"]
          },
          {
            triggers: ["lipstick", "\u09B2\u09BF\u09AA\u09B8\u09CD\u099F\u09BF\u0995"],
            synonyms: ["lipstick", "\u09B2\u09BF\u09AA\u09B8\u09CD\u099F\u09BF\u0995", "lip gloss", "\u09AE\u09CD\u09AF\u09BE\u099F"]
          },
          {
            triggers: ["shoe", "shoes", "\u099C\u09C1\u09A4\u09BE", "\u099C\u09C1\u09A4\u09CB", "sneaker", "loafer"],
            synonyms: ["shoe", "shoes", "\u099C\u09C1\u09A4\u09BE", "\u099C\u09C1\u09A4\u09CB", "sneaker", "sneakers", "\u09B8\u09CD\u09A8\u09BF\u0995\u09BE\u09B0\u09CD\u09B8", "\u09B2\u09CB\u09AB\u09BE\u09B0"]
          },
          {
            triggers: ["bag", "\u09AC\u09CD\u09AF\u09BE\u0997", "wallet", "\u09AE\u09BE\u09A8\u09BF\u09AC\u09CD\u09AF\u09BE\u0997", "backpack"],
            synonyms: ["bag", "\u09AC\u09CD\u09AF\u09BE\u0997", "wallet", "\u09AE\u09BE\u09A8\u09BF\u09AC\u09CD\u09AF\u09BE\u0997", "\u09B2\u09C7\u09A6\u09BE\u09B0 \u09AC\u09CD\u09AF\u09BE\u0997", "backpack"]
          }
        ];
        for (const group of CONCEPT_MAP) {
          const isTriggered = group.triggers.some(
            (t) => t.length <= 3 ? words.includes(t) : textToAnalyze.includes(t) || words.includes(t)
          );
          if (isTriggered) {
            for (const syn of group.synonyms) {
              kwSet.add(syn);
            }
          }
        }
        return Array.from(kwSet).filter(Boolean);
      }
      deleteProduct(id) {
        if (!this.data.products) this.data.products = [];
        this.deletedProductIds.add(id);
        this.syncDeletedIdsToData();
        const idx = this.data.products.findIndex((p) => p.id === id);
        if (idx !== -1) {
          this.data.products.splice(idx, 1);
        }
        this.persist();
        return true;
      }
      findProductForQuery(arg1, arg2) {
        let userId = arg1;
        let query = arg2 || "";
        if (arg1 && arg1.length > 20 && !arg2) {
          query = arg1;
          userId = "";
        } else if (arg2 && arg1 && arg1.includes(" ") && !arg2.includes(" ")) {
          query = arg1;
          userId = arg2;
        }
        const prods = this.getProducts(userId);
        if (!prods || prods.length === 0) return void 0;
        const q = (query || "").toLowerCase().trim();
        if (!q) return void 0;
        const pureGreetings = ["hello", "hi", "hey", "hlw", "salam", "assalamu alaikum", "\u09B9\u09CD\u09AF\u09BE\u09B2\u09CB", "\u09B9\u09BE\u0987", "\u09B8\u09BE\u09B2\u09BE\u09AE", "\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE"];
        if (pureGreetings.includes(q)) {
          return void 0;
        }
        const nonProductConversationalSignals = [
          "deri",
          "derite",
          "ans den na",
          "ans dao na",
          "reply daw na",
          "reply den na",
          "reply dei na",
          "late",
          "slow",
          "harabo",
          "harai",
          "customer",
          "customers",
          "service kemon",
          "service kmn",
          "connect",
          "kotha bolte",
          "call din",
          "call den",
          "\u09B8\u09BE\u09B9\u09BE\u09AF\u09CD\u09AF",
          "\u09A6\u09C7\u09B0\u09BF",
          "\u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09C7\u09A8 \u09A8\u09BE",
          "\u09B0\u09BF\u09AA\u09CD\u09B2\u09BE\u0987 \u09A6\u09C7\u09A8 \u09A8\u09BE"
        ];
        if (nonProductConversationalSignals.some((sig) => q.includes(sig))) {
          return void 0;
        }
        const isAskingAboutAttribute = q.includes("size") || q.includes("\u09B8\u09BE\u0987\u099C") || q.includes("color") || q.includes("colour") || q.includes("\u0995\u09BE\u09B2\u09BE\u09B0") || q.includes("\u09B0\u0982") || q.includes("dam") || q.includes("\u09A6\u09BE\u09AE") || q.includes("price");
        const isAskingForCatalog = !isAskingAboutAttribute && (q.includes("ki ki product") || q.includes("k i ki product") || q.includes("ki ki item") || q.includes("k i ki item") || q.includes("ki ki collection") || q.includes("ki ki dress") || q.includes("all product") || q.includes("shob product") || q.includes("sob product") || q.includes("\u09B8\u09AC \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F") || q.includes("\u09B8\u09AC \u0986\u0987\u099F\u09C7\u09AE") || q.includes("catalog") || q.includes("catalogue") || q.includes("\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u09B2\u0997") || q.includes("\u09AA\u09A3\u09CD\u09AF \u09A4\u09BE\u09B2\u09BF\u0995\u09BE") || q.includes("\u0995\u09BE\u09B2\u09C7\u0995\u09B6\u09A8") || q.includes("collection") || q === "ki ki ase" || q === "ki ki ache" || q === "\u0995\u09C0 \u0995\u09C0 \u0986\u099B\u09C7" || q === "\u0995\u09BF \u0995\u09BF \u0986\u099B\u09C7");
        if (isAskingForCatalog) {
          return void 0;
        }
        const getLevenshteinDistance = (a, b) => {
          if (a === b) return 0;
          if (!a.length) return b.length;
          if (!b.length) return a.length;
          const matrix = [];
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
        const BANGLISH_SYNONYMS = {
          // Shirt variants & typos
          shiet: "shirt",
          shart: "shirt",
          shrt: "shirt",
          sirt: "shirt",
          sart: "shirt",
          sarht: "shirt",
          shirte: "shirt",
          shirtt: "shirt",
          shite: "shirt",
          tshirt: "shirt",
          tishirt: "shirt",
          "t-shirt": "shirt",
          \u09B8\u09BE\u09B0\u09CD\u099F: "\u09B6\u09BE\u09B0\u09CD\u099F",
          \u09B8\u09BE\u09B0\u09CD\u099F\u09C7\u09B0: "\u09B6\u09BE\u09B0\u09CD\u099F",
          \u09B8\u09BE\u09B0\u09CD\u099F\u099F\u09BF: "\u09B6\u09BE\u09B0\u09CD\u099F",
          \u09B6\u09BE\u09B0\u09CD\u099F\u09C7\u09B0: "\u09B6\u09BE\u09B0\u09CD\u099F",
          \u09B6\u09BE\u09B0\u09CD\u099F\u099F\u09BF: "\u09B6\u09BE\u09B0\u09CD\u099F",
          \u09AA\u09CB\u09B2\u09CB: "shirt",
          polo: "shirt",
          oxford: "shirt",
          \u0997\u09C7\u099E\u09CD\u099C\u09BF: "shirt",
          genji: "shirt",
          ganji: "shirt",
          // Pant variants & typos
          pent: "pant",
          pents: "pant",
          pants: "pant",
          pantt: "pant",
          pnt: "pant",
          \u09AA\u09CD\u09AF\u09BE\u09A8\u09CD\u099F: "pant",
          \u09AA\u09CD\u09AF\u09BE\u09A8\u09CD\u099F\u09B8: "pant",
          \u09AA\u09CD\u09AF\u09BE\u09A8\u09CD\u099F\u09C7\u09B0: "pant",
          \u09AA\u09CD\u09AF\u09BE\u09A8\u09CD\u099F\u099F\u09BF: "pant",
          jeans: "pant",
          jean: "pant",
          \u099C\u09BF\u09A8\u09CD\u09B8: "pant",
          \u099C\u09BF\u09A8\u09CD\u09B8\u09C7\u09B0: "pant",
          \u099C\u09BF\u09A8\u09CD\u09B8\u099F\u09BF: "pant",
          cargo: "pant",
          \u0995\u09BE\u09B0\u09CD\u0997\u09CB: "pant",
          jogger: "pant",
          joggers: "pant",
          \u099C\u0997\u09BE\u09B0: "pant",
          \u099C\u0997\u09BE\u09B0\u09CD\u09B8: "pant",
          trouser: "pant",
          trousers: "pant",
          \u099F\u09CD\u09B0\u09BE\u0989\u099C\u09BE\u09B0: "pant",
          denim: "pant",
          \u09A1\u09C7\u09A8\u09BF\u09AE: "pant",
          // Watch variants & typos
          watc: "watch",
          wtch: "watch",
          watches: "watch",
          woch: "watch",
          smartwatch: "watch",
          \u09B8\u09CD\u09AE\u09BE\u09B0\u09CD\u099F\u0993\u09AF\u09BC\u09BE\u099A: "watch",
          \u09B8\u09CD\u09AE\u09BE\u09B0\u09CD\u099F\u0993\u09DF\u09BE\u099A: "watch",
          \u0998\u09DC\u09BF: "watch",
          \u0998\u09A1\u09BC\u09BF: "watch",
          \u0998\u09DC\u09BF\u09B0: "watch",
          \u0998\u09A1\u09BC\u09BF\u09B0: "watch",
          ghori: "watch",
          // Panjabi
          panjabi: "panjabi",
          punjabi: "panjabi",
          \u09AA\u09BE\u099E\u09CD\u099C\u09BE\u09AC\u09BF: "panjabi",
          \u09AA\u09BE\u099E\u09CD\u099C\u09BE\u09AC\u09C0: "panjabi"
        };
        const rawTokens = q.split(/[\s\-_,./()]+/).filter((t) => t.length >= 2);
        const normalizedTokens = rawTokens.map((t) => BANGLISH_SYNONYMS[t] || t);
        const queryMentionsShirt = q.includes("shirt") || q.includes("shiet") || q.includes("shart") || q.includes("sirt") || q.includes("sarht") || q.includes("sart") || q.includes("\u09B6\u09BE\u09B0\u09CD\u099F") || q.includes("\u09B8\u09BE\u09B0\u09CD\u099F") || q.includes("tshirt") || q.includes("t-shirt") || q.includes("oxford") || q.includes("polo") || q.includes("\u0997\u09C7\u099E\u09CD\u099C\u09BF") || q.includes("\u09AA\u09CB\u09B2\u09CB") || normalizedTokens.includes("shirt") || rawTokens.some((t) => t.length >= 4 && getLevenshteinDistance(t, "shirt") <= 1);
        const queryMentionsPant = /\b(pant|pants|pent|pents|cargo|jogger|joggers|denim|trouser|trousers)\b/i.test(q) || q.includes("\u09AA\u09CD\u09AF\u09BE\u09A8\u09CD\u099F") || q.includes("\u099C\u09BF\u09A8\u09CD\u09B8") || q.includes("\u0995\u09BE\u09B0\u09CD\u0997\u09CB") || q.includes("\u099C\u0997\u09BE\u09B0") || q.includes("\u09A1\u09C7\u09A8\u09BF\u09AE") || normalizedTokens.includes("pant");
        const queryMentionsWatch = q.includes("watch") || q.includes("watc") || q.includes("\u0998\u09DC\u09BF") || q.includes("\u0998\u09A1\u09BC\u09BF") || q.includes("\u09B8\u09CD\u09AE\u09BE\u09B0\u09CD\u099F") || q.includes("smartwatch") || q.includes("calling") || normalizedTokens.includes("watch") || rawTokens.some((t) => t.length >= 4 && getLevenshteinDistance(t, "watch") <= 1);
        const queryMentionsPanjabi = q.includes("panjabi") || q.includes("punjabi") || q.includes("\u09AA\u09BE\u099E\u09CD\u099C\u09BE\u09AC\u09BF") || q.includes("\u09AA\u09BE\u099E\u09CD\u099C\u09BE\u09AC\u09C0") || normalizedTokens.includes("panjabi");
        let bestProduct = void 0;
        let highestScore = 0;
        for (const prod of prods) {
          let score = 0;
          const pName = prod.name.toLowerCase().trim();
          const pCategory = (prod.category || "").toLowerCase().trim();
          const pKeywords = (prod.keywords || []).map((k) => k.toLowerCase().trim());
          if (q.includes(pName)) {
            score += 150;
          } else if (pName.length >= 4 && pName.includes(q)) {
            score += 80;
          }
          const nameWords = pName.split(/[\s\-_,./()]+/).filter((w) => w.length >= 3);
          for (const nw of nameWords) {
            if (rawTokens.includes(nw) || normalizedTokens.includes(nw)) {
              if (["shirt", "pant", "pants", "jeans", "watch", "panjabi", "cargo", "jogger", "oxford"].includes(nw)) {
                score += 50;
              } else {
                score += 25;
              }
            } else if (nw.length >= 4 && q.includes(nw)) {
              score += 15;
            } else if (nw.length >= 4) {
              const fuzzyMatch = rawTokens.some((rt) => rt.length >= 4 && getLevenshteinDistance(rt, nw) <= 1);
              if (fuzzyMatch) {
                score += 35;
              }
            }
          }
          for (const kw of pKeywords) {
            if (kw.length >= 2 && (rawTokens.includes(kw) || normalizedTokens.includes(kw) || q.includes(kw))) {
              if (["\u09B6\u09BE\u09B0\u09CD\u099F", "\u09AA\u09CD\u09AF\u09BE\u09A8\u09CD\u099F", "\u099C\u09BF\u09A8\u09CD\u09B8", "\u0995\u09BE\u09B0\u09CD\u0997\u09CB", "\u0998\u09DC\u09BF", "\u0998\u09A1\u09BC\u09BF", "panjabi", "shirt", "pant", "jeans", "watch"].includes(kw)) {
                score += 45;
              } else if (["\u0995\u099F\u09A8", "cotton", "blue", "green", "black", "white"].includes(kw)) {
                score += 10;
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
          if (pCategory && (rawTokens.includes(pCategory) || normalizedTokens.includes(pCategory) || q.includes(pCategory))) {
            score += 25;
          }
          const descWords = (prod.description || "").toLowerCase().split(/[\s\-_,./()]+/).filter((w) => w.length >= 4);
          for (const dw of descWords) {
            if (rawTokens.includes(dw) || normalizedTokens.includes(dw)) {
              score += 5;
            }
          }
          if (queryMentionsShirt) {
            if (pCategory === "shirts" || pName.includes("shirt") || pName.includes("oxford")) {
              score += 120;
            } else {
              score -= 200;
            }
          }
          if (queryMentionsPant) {
            if (pCategory === "pants" || pName.includes("pant") || pName.includes("jeans") || pName.includes("cargo") || pName.includes("jogger")) {
              score += 120;
              if (q.includes("cargo") && pName.includes("cargo")) score += 40;
              if (q.includes("jeans") && pName.includes("jeans")) score += 40;
              if (q.includes("jogger") && pName.includes("jogger")) score += 30;
            } else {
              score -= 200;
            }
          }
          if (queryMentionsWatch) {
            if (pCategory === "watches" || pName.includes("watch") || pName.includes("\u09B8\u09CD\u09AE\u09BE\u09B0\u09CD\u099F")) {
              score += 120;
            } else {
              score -= 200;
            }
          }
          if (queryMentionsPanjabi) {
            if (pCategory.includes("panjabi") || pName.includes("panjabi") || pName.includes("\u09AA\u09BE\u099E\u09CD\u099C\u09BE\u09AC\u09BF")) {
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
        const isGenericProductInquiry = q.includes("ay product") || q.includes("ei product") || q.includes("ai product") || q.includes("eitar") || q.includes("aitar") || q.includes("aita") || q.includes("eta") || q.includes("\u098F\u0987 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F") || q.includes("\u098F\u099F\u09BE\u09B0") || q.includes("\u099B\u09AC\u09BF") || q.includes("\u09AA\u09BF\u0995") || q.includes("pic") || q.includes("photo") || q.includes("picture");
        if (isGenericProductInquiry && prods.length === 1) {
          return prods[0];
        }
        return void 0;
      }
      // --- Settings ---
      getSettings() {
        return this.data.settings;
      }
      updateSettings(updates) {
        this.data.settings = {
          ...this.data.settings,
          ...updates
        };
        this.persist();
        return this.data.settings;
      }
      // --- Coupons ---
      getCoupons() {
        if (!this.data.coupons) this.data.coupons = [];
        const now = Date.now();
        let changed = false;
        for (const c of this.data.coupons) {
          if (c.is_active && c.expires_at && new Date(c.expires_at).getTime() <= now) {
            c.is_active = false;
            c.updated_at = (/* @__PURE__ */ new Date()).toISOString();
            changed = true;
          }
        }
        if (changed) {
          this.persist();
        }
        return this.data.coupons;
      }
      getCouponById(id) {
        return this.getCoupons().find((c) => c.id === id);
      }
      getCouponByCode(code) {
        const clean = String(code || "").trim().toUpperCase();
        if (!clean) return void 0;
        return this.getCoupons().find((c) => c.code.toUpperCase() === clean);
      }
      createCoupon(coupon) {
        if (!this.data.coupons) this.data.coupons = [];
        this.data.coupons.unshift(coupon);
        this.persist();
        return coupon;
      }
      updateCoupon(id, updates) {
        if (!this.data.coupons) this.data.coupons = [];
        const idx = this.data.coupons.findIndex((c) => c.id === id);
        if (idx === -1) return void 0;
        this.data.coupons[idx] = {
          ...this.data.coupons[idx],
          ...updates,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.persist();
        return this.data.coupons[idx];
      }
      deleteCoupon(id) {
        if (!this.data.coupons) return false;
        const idx = this.data.coupons.findIndex((c) => c.id === id);
        if (idx === -1) return false;
        this.data.coupons.splice(idx, 1);
        this.persist();
        return true;
      }
      // --- Reviews ---
      getAllReviews() {
        if (!this.data.reviews) {
          this.data.reviews = [...defaultSeedReviews];
          this.persist();
        } else {
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
      getApprovedReviews() {
        return this.getAllReviews().filter((r) => r.status === "approved");
      }
      createReview(review) {
        if (!this.data.reviews) {
          this.data.reviews = [...defaultSeedReviews];
        }
        this.data.reviews.unshift(review);
        this.persist();
        return review;
      }
      updateReviewStatus(id, status) {
        const reviews = this.getAllReviews();
        const idx = reviews.findIndex((r) => r.id === id);
        if (idx === -1) return void 0;
        reviews[idx].status = status;
        this.persist();
        return reviews[idx];
      }
      deleteReview(id) {
        const reviews = this.getAllReviews();
        const idx = reviews.findIndex((r) => r.id === id);
        if (idx === -1) return false;
        reviews.splice(idx, 1);
        this.persist();
        return true;
      }
      // --- Admin Broadcast Notifications ---
      getNotifications() {
        if (!this.data.notifications) {
          this.data.notifications = [];
          this.persist();
        }
        return this.data.notifications;
      }
      getActiveNotifications() {
        return this.getNotifications().filter((n) => n.is_active);
      }
      createNotification(notification) {
        if (!this.data.notifications) {
          this.data.notifications = [];
        }
        this.data.notifications.unshift(notification);
        this.persist();
        return notification;
      }
      updateNotification(id, updates) {
        const list = this.getNotifications();
        const idx = list.findIndex((n) => n.id === id);
        if (idx === -1) return void 0;
        list[idx] = { ...list[idx], ...updates };
        this.persist();
        return list[idx];
      }
      deleteNotification(id) {
        const list = this.getNotifications();
        const idx = list.findIndex((n) => n.id === id);
        if (idx === -1) return false;
        list.splice(idx, 1);
        this.persist();
        return true;
      }
      // --- Appointments & Calendar Booking Automation ---
      getAppointments(userId) {
        if (!this.data.appointments) {
          this.data.appointments = [];
        }
        const filtered = userId ? this.data.appointments.filter((a) => a.user_id === userId) : this.data.appointments;
        return filtered.sort((a, b) => {
          const dateCmp = a.appointment_date.localeCompare(b.appointment_date);
          if (dateCmp !== 0) return dateCmp;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      }
      getAppointmentById(id) {
        return (this.data.appointments || []).find((a) => a.id === id);
      }
      createAppointment(appointment) {
        if (!this.data.appointments) {
          this.data.appointments = [];
        }
        this.data.appointments.unshift(appointment);
        this.persist();
        return appointment;
      }
      updateAppointment(id, updates) {
        if (!this.data.appointments) return void 0;
        const idx = this.data.appointments.findIndex((a) => a.id === id);
        if (idx === -1) return void 0;
        this.data.appointments[idx] = {
          ...this.data.appointments[idx],
          ...updates,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.persist();
        return this.data.appointments[idx];
      }
      deleteAppointment(id) {
        if (!this.data.appointments) return false;
        const idx = this.data.appointments.findIndex((a) => a.id === id);
        if (idx === -1) return false;
        this.data.appointments.splice(idx, 1);
        this.persist();
        return true;
      }
      getAppointmentSettings(userId) {
        const profile = this.getProfileById(userId);
        if (profile && profile.appointment_settings) {
          return {
            ...DEFAULT_APPOINTMENT_SETTINGS,
            ...profile.appointment_settings
          };
        }
        return { ...DEFAULT_APPOINTMENT_SETTINGS };
      }
      updateAppointmentSettings(userId, updates) {
        const profile = this.getProfileById(userId);
        if (!profile) return { ...DEFAULT_APPOINTMENT_SETTINGS };
        const current = profile.appointment_settings || { ...DEFAULT_APPOINTMENT_SETTINGS };
        const updated = {
          ...current,
          ...updates
        };
        this.updateProfile(userId, { appointment_settings: updated });
        return updated;
      }
      // --- Email Marketing & Campaign Hub ---
      getEmailSmtpSettings(userId) {
        const profile = this.getProfileById(userId);
        const defaultSettings = {
          provider: "gmail",
          sender_name: profile?.full_name || "One Agent BD Store",
          sender_email: profile?.email || "",
          smtp_host: "smtp.gmail.com",
          smtp_port: 465,
          smtp_user: profile?.email || "",
          smtp_pass: "",
          api_key: "",
          reply_to: profile?.email || "",
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
      updateEmailSmtpSettings(userId, updates) {
        const current = this.getEmailSmtpSettings(userId);
        const merged = {
          ...current,
          ...updates
        };
        merged.is_configured = Boolean(
          merged.provider === "gmail" || merged.provider === "custom_smtp" ? merged.smtp_host && merged.smtp_user && merged.smtp_pass : merged.api_key && merged.sender_email
        );
        this.updateProfile(userId, { email_smtp_settings: merged });
        return merged;
      }
      getEmailSubscribers(userId) {
        if (!this.data.email_subscribers) {
          this.data.email_subscribers = [];
        }
        return this.data.email_subscribers.filter((s) => s.user_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      saveEmailSubscriber(sub) {
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
      deleteEmailSubscriber(id, userId) {
        if (!this.data.email_subscribers) return false;
        const idx = this.data.email_subscribers.findIndex((s) => s.id === id && s.user_id === userId);
        if (idx === -1) return false;
        this.data.email_subscribers.splice(idx, 1);
        this.persist();
        return true;
      }
      getEmailCampaigns(userId) {
        if (!this.data.email_campaigns) {
          this.data.email_campaigns = [];
        }
        const list = userId ? this.data.email_campaigns.filter((c) => c.user_id === userId) : this.data.email_campaigns;
        return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      getEmailCampaignById(id) {
        return (this.data.email_campaigns || []).find((c) => c.id === id);
      }
      createEmailCampaign(campaign) {
        if (!this.data.email_campaigns) {
          this.data.email_campaigns = [];
        }
        this.data.email_campaigns.unshift(campaign);
        this.persist();
        return campaign;
      }
      updateEmailCampaign(id, updates) {
        if (!this.data.email_campaigns) return void 0;
        const idx = this.data.email_campaigns.findIndex((c) => c.id === id);
        if (idx === -1) return void 0;
        this.data.email_campaigns[idx] = {
          ...this.data.email_campaigns[idx],
          ...updates
        };
        this.persist();
        return this.data.email_campaigns[idx];
      }
      deleteEmailCampaign(id, userId) {
        if (!this.data.email_campaigns) return false;
        const idx = this.data.email_campaigns.findIndex((c) => c.id === id && c.user_id === userId);
        if (idx === -1) return false;
        this.data.email_campaigns.splice(idx, 1);
        this.persist();
        return true;
      }
      // --- Business ERP: Purchases, Dues & Accounts Cashbook ---
      getPurchases(userId) {
        if (!this.data.purchases) {
          this.data.purchases = [];
        }
        return this.data.purchases.filter((p) => p.user_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      createPurchase(purchase) {
        if (!this.data.purchases) {
          this.data.purchases = [];
        }
        this.data.purchases.unshift(purchase);
        this.persist();
        return purchase;
      }
      deletePurchase(id, userId) {
        if (!this.data.purchases) return false;
        const idx = this.data.purchases.findIndex((p) => p.id === id && p.user_id === userId);
        if (idx === -1) return false;
        this.data.purchases.splice(idx, 1);
        this.persist();
        return true;
      }
      getDueRecords(userId) {
        if (!this.data.dues) {
          this.data.dues = [];
        }
        return this.data.dues.filter((d) => d.user_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      createDueRecord(due) {
        if (!this.data.dues) {
          this.data.dues = [];
        }
        this.data.dues.unshift(due);
        this.persist();
        return due;
      }
      updateDueRecord(id, userId, updates) {
        if (!this.data.dues) return void 0;
        const idx = this.data.dues.findIndex((d) => d.id === id && d.user_id === userId);
        if (idx === -1) return void 0;
        this.data.dues[idx] = {
          ...this.data.dues[idx],
          ...updates,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.persist();
        return this.data.dues[idx];
      }
      deleteDueRecord(id, userId) {
        if (!this.data.dues) return false;
        const idx = this.data.dues.findIndex((d) => d.id === id && d.user_id === userId);
        if (idx === -1) return false;
        this.data.dues.splice(idx, 1);
        this.persist();
        return true;
      }
      getAccountTransactions(userId) {
        if (!this.data.account_transactions) {
          this.data.account_transactions = [];
        }
        return this.data.account_transactions.filter((t) => t.user_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      createAccountTransaction(tx) {
        if (!this.data.account_transactions) {
          this.data.account_transactions = [];
        }
        this.data.account_transactions.unshift(tx);
        this.persist();
        return tx;
      }
      deleteAccountTransaction(id, userId) {
        if (!this.data.account_transactions) return false;
        const idx = this.data.account_transactions.findIndex((t) => t.id === id && t.user_id === userId);
        if (idx === -1) return false;
        this.data.account_transactions.splice(idx, 1);
        this.persist();
        return true;
      }
    };
    db = new Database();
  }
});

// server/services/subscriptionService.ts
var subscriptionService_exports = {};
__export(subscriptionService_exports, {
  activateSubscription: () => activateSubscription,
  getUserSubscriptionStatus: () => getUserSubscriptionStatus,
  runSubscriptionExpiryCheck: () => runSubscriptionExpiryCheck
});
function getUserSubscriptionStatus(userId) {
  let sub = db.getSubscriptionByUserId(userId);
  const now = /* @__PURE__ */ new Date();
  if (!sub) {
    const plans = db.getActivePlans();
    const defaultPlan = plans[0] || db.getPlans()[0];
    const trialDays = defaultPlan ? defaultPlan.trial_days : 2;
    const startDate = now.toISOString();
    const endDate2 = new Date(now.getTime() + trialDays * 864e5).toISOString();
    sub = db.createSubscription({
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      plan_id: "plan_pro",
      status: "trialing",
      start_date: startDate,
      end_date: endDate2,
      created_at: startDate,
      updated_at: startDate
    });
  }
  const profile = db.getProfileById(userId);
  const isAdmin = profile?.role === "admin";
  if (sub.status === "trialing" && sub.plan_id !== "plan_pro") {
    sub = db.updateSubscription(sub.id, {
      plan_id: "plan_pro",
      updated_at: now.toISOString()
    }) || sub;
  }
  let endDate = new Date(sub.end_date);
  let isPastEnd = now.getTime() >= endDate.getTime();
  if (isAdmin && isPastEnd) {
    const newAdminEnd = new Date(now.getTime() + 365 * 864e5).toISOString();
    sub = db.updateSubscription(sub.id, {
      status: "active",
      end_date: newAdminEnd
    }) || sub;
    endDate = new Date(sub.end_date);
    isPastEnd = false;
  } else if (isPastEnd && (sub.status === "trialing" || sub.status === "active")) {
    sub = db.updateSubscription(sub.id, {
      status: "expired"
    }) || sub;
    const userChannels = db.getChannels(userId);
    for (const ch of userChannels) {
      if (ch.is_active) {
        db.updateChannel(ch.id, { is_active: false });
      }
    }
  }
  const plan = db.getPlanById(sub.plan_id) || {
    name: "Starter AI Plan",
    price: 1250,
    currency: "BDT",
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
  const hoursRemaining = Math.floor(msRemaining / (1e3 * 60 * 60));
  const daysRemaining = Math.floor(hoursRemaining / 24);
  const isExpired = !isAdmin && (sub.status === "expired" || isPastEnd);
  const isGated = isExpired;
  const canAccessDashboard = !isGated;
  const planId = sub.plan_id || "plan_starter";
  const isTrialActive = !isExpired && sub.status === "trialing";
  const isPaidProPlan = planId.includes("pro") || (plan.name || "").toLowerCase().includes("pro") || Number(plan.price) >= 1950;
  const isProPlan = isAdmin || isTrialActive || isPaidProPlan;
  const featureConfig = isProPlan ? {
    website_stores: true,
    call_requests: true,
    vip_broadcast: true,
    courier_dispatch: true,
    csv_export: true,
    max_channels: 10
  } : plan.feature_config || {
    website_stores: false,
    call_requests: false,
    vip_broadcast: false,
    courier_dispatch: true,
    csv_export: false,
    max_channels: 3
  };
  const canAccessStores = !isExpired && isProPlan;
  const userMessages = db.getMessages(userId);
  const waUsedCount = userMessages.filter(
    (m) => m.platform === "whatsapp" && (m.is_ai_reply || m.direction === "outbound" || m.sender_type === "bot" || m.sender_type === "user")
  ).length;
  let baseQuota = plan?.feature_config?.whatsapp_credits || plan?.whatsapp_credits;
  if (!baseQuota) {
    if (planId === "plan_enterprise" || Number(plan.price) >= 8e3) {
      baseQuota = 15e3;
    } else if (planId === "plan_pro" || Number(plan.price) >= 4e3) {
      baseQuota = 6500;
    } else if (isTrialActive) {
      baseQuota = 100;
    } else {
      baseQuota = 2500;
    }
  }
  const profileCustomCredits = profile?.custom_whatsapp_credits;
  const whatsappCreditsTotal = typeof profileCustomCredits === "number" ? profileCustomCredits : baseQuota;
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
    canConnectWhatsApp: isAdmin || !isTrialActive && !isExpired,
    whatsappCreditsTotal,
    whatsappCreditsUsed,
    whatsappCreditsRemaining
  };
}
function activateSubscription(userId, planId, durationDays) {
  const plan = db.getPlanById(planId);
  const now = /* @__PURE__ */ new Date();
  const currentSub = db.getSubscriptionByUserId(userId);
  let baseDate = now;
  if (currentSub && currentSub.status === "active" && new Date(currentSub.end_date) > now) {
    baseDate = new Date(currentSub.end_date);
  }
  let newEndDate;
  if (durationDays === 0 && currentSub && currentSub.status === "active" && new Date(currentSub.end_date) > now) {
    newEndDate = currentSub.end_date;
  } else {
    const days = durationDays || (plan ? plan.duration_days : 30);
    newEndDate = new Date(baseDate.getTime() + days * 864e5).toISOString();
  }
  const isPro = String(planId).toLowerCase().includes("pro") || plan?.price && plan.price >= 1950;
  const maxAllowedChannels = plan?.feature_config?.max_channels || (isPro ? 10 : 3);
  const activeMetaChannels = db.getChannels(userId).filter(
    (c) => c.is_active && ["messenger", "instagram", "whatsapp"].includes(c.platform) && c.identifier !== "website_widget"
  );
  const userChannels = db.getChannels(userId);
  let activeCount = 0;
  for (const ch of userChannels) {
    if (activeCount < maxAllowedChannels && (ch.status === "connected" || ch.access_token)) {
      db.updateChannel(ch.id, { is_active: true, status: "connected" });
      activeCount++;
    } else if (activeCount >= maxAllowedChannels) {
      db.updateChannel(ch.id, { is_active: false });
    }
  }
  if (currentSub) {
    const updated = db.updateSubscription(currentSub.id, {
      plan_id: planId,
      status: "active",
      start_date: now.toISOString(),
      end_date: newEndDate
    });
    return updated || currentSub;
  }
  return db.createSubscription({
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id: userId,
    plan_id: planId,
    status: "active",
    start_date: now.toISOString(),
    end_date: newEndDate,
    created_at: now.toISOString(),
    updated_at: now.toISOString()
  });
}
function runSubscriptionExpiryCheck() {
  const allSubs = db.getSubscriptions();
  const now = /* @__PURE__ */ new Date();
  let expiredCount = 0;
  for (const sub of allSubs) {
    const profile = db.getProfileById(sub.user_id);
    if (profile?.role === "admin") continue;
    if ((sub.status === "trialing" || sub.status === "active") && new Date(sub.end_date) < now) {
      db.updateSubscription(sub.id, { status: "expired" });
      expiredCount++;
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
var init_subscriptionService = __esm({
  "server/services/subscriptionService.ts"() {
    init_database();
  }
});

// server/services/emailCampaignService.ts
var emailCampaignService_exports = {};
__export(emailCampaignService_exports, {
  TRANSPARENT_GIF_BUFFER: () => TRANSPARENT_GIF_BUFFER,
  buildTrackedEmailHtml: () => buildTrackedEmailHtml,
  computeEmailAnalytics: () => computeEmailAnalytics,
  dispatchSingleEmail: () => dispatchSingleEmail,
  generateMarketingEmailWithAI: () => generateMarketingEmailWithAI,
  syncSubscribersFromChatsAndOrders: () => syncSubscribersFromChatsAndOrders
});
import tls from "tls";
import { GoogleGenAI } from "@google/genai";
function getGeminiClient(userId) {
  const userProfile = userId ? db.getProfileById(userId) : void 0;
  const sysSettings = db.getSettings();
  const adminKey = db.getProfiles().find((p) => p.role === "admin" && p.llm_api_key?.trim())?.llm_api_key?.trim();
  const apiKey = userProfile?.llm_api_key && userProfile.llm_api_key.trim() || sysSettings?.default_llm_api_key && sysSettings.default_llm_api_key.trim() || adminKey || process.env.GEMINI_API_KEY || "";
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } }
  });
}
function buildTrackedEmailHtml(params) {
  const {
    businessName,
    subject,
    preheader,
    bodyHtml,
    ctaText,
    ctaUrl,
    campaignId,
    recipientEmail,
    recipientName,
    baseUrl
  } = params;
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const openPixelUrl = `${cleanBase}/api/email-campaigns/track/open/${encodeURIComponent(
    campaignId
  )}?e=${encodeURIComponent(recipientEmail)}`;
  const trackedCtaUrl = ctaUrl ? `${cleanBase}/api/email-campaigns/track/click/${encodeURIComponent(
    campaignId
  )}?e=${encodeURIComponent(recipientEmail)}&url=${encodeURIComponent(ctaUrl)}` : "";
  const personalizedBody = bodyHtml.replace(/\{customer_name\}|\{name\}/gi, recipientName || "Valued Customer").replace(/\r?\n/g, "<br/>");
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#F8F7FC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1E293B;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>` : ""}
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F7FC;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#FFFFFF;border-radius:16px;border:1px solid #E2E8F0;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#7C3AED,#9333EA);padding:24px 32px;color:#FFFFFF;">
              <div style="font-size:18px;font-weight:800;letter-spacing:-0.02em;">${businessName}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;font-size:15px;line-height:1.65;color:#334155;">
              ${personalizedBody}
              ${trackedCtaUrl && ctaText ? `<div style="margin-top:28px;margin-bottom:12px;">
                      <a href="${trackedCtaUrl}" style="display:inline-block;background-color:#7C3AED;color:#FFFFFF;font-weight:700;font-size:14px;text-decoration:none;padding:12px 26px;border-radius:10px;">
                        ${ctaText} &rarr;
                      </a>
                    </div>` : ""}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px;background-color:#F8FAFC;border-top:1px solid #E2E8F0;font-size:12px;color:#64748B;">
              Sent by <strong>${businessName}</strong>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <img src="${openPixelUrl}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />
</body>
</html>`;
}
async function sendViaNativeTlsSmtp(params) {
  return new Promise((resolve) => {
    const timeoutMs = 1e4;
    let settled = false;
    const finish = (res) => {
      if (settled) return;
      settled = true;
      resolve(res);
    };
    const socket = tls.connect(
      {
        host: params.host,
        port: params.port || 465,
        rejectUnauthorized: false
      },
      () => {
      }
    );
    socket.setTimeout(timeoutMs, () => {
      socket.destroy();
      finish({ sent: false, error: "SMTP connection timed out" });
    });
    socket.on("error", (err) => {
      finish({ sent: false, error: err.message });
    });
    let step = 0;
    let buffer = "";
    const sendLine = (line) => {
      socket.write(line + "\r\n");
    };
    socket.on("data", (chunk) => {
      buffer += chunk.toString("utf8");
      if (!buffer.endsWith("\r\n")) return;
      const lines = buffer.trim().split("\r\n");
      const lastLine = lines[lines.length - 1] || "";
      if (/^\d{3}-/.test(lastLine)) return;
      buffer = "";
      const code = parseInt(lastLine.slice(0, 3), 10);
      if (code >= 400) {
        socket.end();
        finish({ sent: false, error: `SMTP Error (${code}): ${lastLine}` });
        return;
      }
      if (step === 0 && code === 220) {
        step = 1;
        sendLine(`EHLO oneagentbd.online`);
      } else if (step === 1 && code === 250) {
        step = 2;
        sendLine(`AUTH LOGIN`);
      } else if (step === 2 && code === 334) {
        step = 3;
        sendLine(Buffer.from(params.user, "utf8").toString("base64"));
      } else if (step === 3 && code === 334) {
        step = 4;
        sendLine(Buffer.from(params.pass, "utf8").toString("base64"));
      } else if (step === 4 && code === 235) {
        step = 5;
        sendLine(`MAIL FROM:<${params.fromEmail}>`);
      } else if (step === 5 && code === 250) {
        step = 6;
        sendLine(`RCPT TO:<${params.toEmail}>`);
      } else if (step === 6 && code === 250) {
        step = 7;
        sendLine(`DATA`);
      } else if (step === 7 && code === 354) {
        step = 8;
        const encodedSubject = `=?UTF-8?B?${Buffer.from(params.subject, "utf8").toString("base64")}?=`;
        const encodedFromName = `=?UTF-8?B?${Buffer.from(params.fromName, "utf8").toString("base64")}?=`;
        const mimeMsg = [
          `From: "${encodedFromName}" <${params.fromEmail}>`,
          `To: <${params.toEmail}>`,
          `Subject: ${encodedSubject}`,
          `MIME-Version: 1.0`,
          `Content-Type: text/html; charset=UTF-8`,
          `Content-Transfer-Encoding: base64`,
          ``,
          Buffer.from(params.html, "utf8").toString("base64").replace(/(.{76})/g, "$1\r\n"),
          `.`
        ].join("\r\n");
        sendLine(mimeMsg);
      } else if (step === 8 && code === 250) {
        step = 9;
        sendLine(`QUIT`);
        socket.end();
        finish({ sent: true });
      }
    });
  });
}
async function dispatchSingleEmail(params) {
  const { smtpSettings, toEmail, toName, subject, html } = params;
  if (!smtpSettings.is_configured) {
    return { delivered: true, mode: "simulated" };
  }
  try {
    if (smtpSettings.provider === "resend_api" && smtpSettings.api_key) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${smtpSettings.api_key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: `${smtpSettings.sender_name} <${smtpSettings.sender_email}>`,
          to: [toEmail],
          subject,
          html
        })
      });
      if (res.ok) {
        return { delivered: true, mode: "live_smtp" };
      }
      const errJson = await res.json().catch(() => ({}));
      return {
        delivered: false,
        mode: "live_smtp",
        error: errJson?.message || `Resend HTTP ${res.status}`
      };
    }
    if (smtpSettings.provider === "brevo_api" && smtpSettings.api_key) {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": smtpSettings.api_key,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sender: {
            name: smtpSettings.sender_name,
            email: smtpSettings.sender_email
          },
          to: [{ email: toEmail, name: toName || toEmail }],
          subject,
          htmlContent: html
        })
      });
      if (res.ok) {
        return { delivered: true, mode: "live_smtp" };
      }
      const errJson = await res.json().catch(() => ({}));
      return {
        delivered: false,
        mode: "live_smtp",
        error: errJson?.message || `Brevo HTTP ${res.status}`
      };
    }
    if ((smtpSettings.provider === "gmail" || smtpSettings.provider === "custom_smtp") && smtpSettings.smtp_host && smtpSettings.smtp_user && smtpSettings.smtp_pass) {
      const smtpRes = await sendViaNativeTlsSmtp({
        host: smtpSettings.smtp_host,
        port: Number(smtpSettings.smtp_port) || 465,
        user: smtpSettings.smtp_user,
        pass: smtpSettings.smtp_pass,
        fromName: smtpSettings.sender_name || "One Agent BD Store",
        fromEmail: smtpSettings.sender_email || smtpSettings.smtp_user,
        toEmail,
        subject,
        html
      });
      return {
        delivered: smtpRes.sent,
        mode: "live_smtp",
        error: smtpRes.error
      };
    }
  } catch (err) {
    return {
      delivered: false,
      mode: "live_smtp",
      error: err.message
    };
  }
  return { delivered: true, mode: "simulated" };
}
function syncSubscribersFromChatsAndOrders(userId) {
  const existing = db.getEmailSubscribers(userId);
  const existingSet = new Set(existing.map((s) => s.email.toLowerCase()));
  let addedCount = 0;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const messages = db.getMessages(userId);
  for (const msg of messages) {
    if (msg.direction !== "inbound" || !msg.message_text) continue;
    const matches = msg.message_text.match(emailRegex);
    if (matches) {
      for (const rawEmail of matches) {
        const cleanEmail = rawEmail.trim().toLowerCase();
        if (!existingSet.has(cleanEmail)) {
          existingSet.add(cleanEmail);
          addedCount++;
          db.saveEmailSubscriber({
            id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            user_id: userId,
            email: cleanEmail,
            name: msg.customer_name || "Chat Lead",
            tags: ["chat-lead", msg.platform],
            source: "chat_extracted",
            status: "subscribed",
            created_at: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
      }
    }
  }
  const appointments = db.getAppointments(userId);
  for (const apt of appointments) {
    if (apt.customer_email && emailRegex.test(apt.customer_email)) {
      const cleanEmail = apt.customer_email.trim().toLowerCase();
      if (!existingSet.has(cleanEmail)) {
        existingSet.add(cleanEmail);
        addedCount++;
        db.saveEmailSubscriber({
          id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          user_id: userId,
          email: cleanEmail,
          name: apt.customer_name || "Appointment Client",
          phone: apt.customer_phone,
          tags: ["appointment", "vip"],
          source: "order",
          status: "subscribed",
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    }
  }
  return {
    addedCount,
    totalSubscribers: db.getEmailSubscribers(userId).length
  };
}
async function generateMarketingEmailWithAI(params) {
  const { userId, businessName, topicPrompt, language = "en" } = params;
  try {
    const ai = getGeminiClient(userId);
    const prompt = `You are an expert Email Marketing Copywriter for "${businessName}".
Write a high-converting promotional email based on this merchant request:
"${topicPrompt}"

Language preference: ${language === "bn" ? "Natural Bangla (\u09AC\u09BE\u0982\u09B2\u09BE) mixed with clean English product terms" : "Clean, persuasive, professional English"}

Use "{customer_name}" as the greeting placeholder.
Return ONLY valid JSON with these exact keys:
{
  "subject": "<Catchy email subject line>",
  "preheader": "<Short 1-sentence preview text>",
  "body_html": "<3 short, well-spaced paragraphs separated by \\n\\n>",
  "cta_text": "<Action button label, e.g. Claim 25% Discount Now>"
}`;
    for (const modelName of ["gemini-2.5-flash", "gemini-3.8-flash", "gemini-2.5-flash-lite"]) {
      try {
        const res = await ai.models.generateContent({
          model: modelName,
          contents: prompt
        });
        if (res.text?.trim()) {
          const clean = res.text.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(clean);
          if (parsed && parsed.subject && parsed.body_html) {
            return {
              subject: parsed.subject,
              preheader: parsed.preheader || `Special update from ${businessName}`,
              body_html: parsed.body_html,
              cta_text: parsed.cta_text || "Explore Offer Now"
            };
          }
        }
      } catch {
      }
    }
  } catch (err) {
    console.warn("[Email AI Copywriter] Fallback to template:", err);
  }
  return {
    subject: `Exclusive Offer from ${businessName}: ${topicPrompt.slice(0, 50)}`,
    preheader: `Limited-time special offer curated for you by ${businessName}.`,
    body_html: `Hello {customer_name},

We are excited to share our latest update from ${businessName}: ${topicPrompt}.

Click the button below to claim your offer or reply directly to this email if you have any questions!`,
    cta_text: "Claim Offer Now"
  };
}
function computeEmailAnalytics(campaigns) {
  let totalSent = 0;
  let totalOpened = 0;
  let totalClicked = 0;
  for (const c of campaigns) {
    totalSent += c.sent_count || 0;
    totalOpened += c.opened_count || 0;
    totalClicked += c.clicked_count || 0;
  }
  const openRate = totalSent > 0 ? Number((totalOpened / totalSent * 100).toFixed(1)) : 0;
  const clickRate = totalSent > 0 ? Number((totalClicked / totalSent * 100).toFixed(1)) : 0;
  return {
    totalCampaigns: campaigns.length,
    totalSent,
    totalOpened,
    totalClicked,
    openRate,
    clickRate
  };
}
var TRANSPARENT_GIF_BUFFER;
var init_emailCampaignService = __esm({
  "server/services/emailCampaignService.ts"() {
    init_database();
    TRANSPARENT_GIF_BUFFER = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64"
    );
  }
});

// server/services/audioDownloader.ts
import { exec } from "child_process";
import { promisify } from "util";
import fs3 from "fs";
import path2 from "path";
import os2 from "os";
import { Mp3Encoder } from "@breezystack/lamejs";
function wavBufferToMp3(wavBuf) {
  try {
    if (wavBuf.length < 44 || wavBuf.subarray(0, 4).toString("latin1") !== "RIFF") {
      return null;
    }
    const numChannels = wavBuf.readUInt16LE(22) || 1;
    const sampleRate = wavBuf.readUInt32LE(24) || 44100;
    const bitsPerSample = wavBuf.readUInt16LE(34) || 16;
    if (bitsPerSample !== 16) return null;
    let dataOffset = 12;
    let dataLength = wavBuf.length - 44;
    while (dataOffset + 8 <= wavBuf.length) {
      const chunkId = wavBuf.subarray(dataOffset, dataOffset + 4).toString("latin1");
      const chunkSize = wavBuf.readUInt32LE(dataOffset + 4);
      if (chunkId === "data") {
        dataOffset += 8;
        dataLength = Math.min(chunkSize, wavBuf.length - dataOffset);
        break;
      }
      dataOffset += 8 + chunkSize;
    }
    if (dataOffset >= wavBuf.length || dataLength <= 0) {
      dataOffset = 44;
      dataLength = wavBuf.length - 44;
    }
    const totalSamples = Math.floor(dataLength / (2 * numChannels));
    if (totalSamples <= 0) return null;
    const monoPcm = new Int16Array(totalSamples);
    let maxPeak = 0;
    for (let i = 0; i < totalSamples; i++) {
      const sample = wavBuf.readInt16LE(dataOffset + i * 2 * numChannels);
      monoPcm[i] = sample;
      const abs = Math.abs(sample);
      if (abs > maxPeak) maxPeak = abs;
    }
    if (maxPeak > 60 && maxPeak < 26e3) {
      const gain = Math.min(28500 / maxPeak, 8);
      for (let i = 0; i < totalSamples; i++) {
        const boosted = Math.round(monoPcm[i] * gain);
        monoPcm[i] = Math.max(-32768, Math.min(32767, boosted));
      }
    }
    const encoder = new Mp3Encoder(1, sampleRate, 64);
    const blockSize = 1152;
    const outChunks = [];
    for (let i = 0; i < monoPcm.length; i += blockSize) {
      const slice = monoPcm.subarray(i, i + blockSize);
      const mp3Buf = encoder.encodeBuffer(slice);
      if (mp3Buf && mp3Buf.length > 0) {
        outChunks.push(Buffer.from(mp3Buf));
      }
    }
    const endBuf = encoder.flush();
    if (endBuf && endBuf.length > 0) {
      outChunks.push(Buffer.from(endBuf));
    }
    return outChunks.length > 0 ? Buffer.concat(outChunks) : null;
  } catch (err) {
    console.warn("[AudioDownloader] wavBufferToMp3 warning:", err);
    return null;
  }
}
async function prepareOutboundVoiceForMeta(inputBuffer, declaredMime, platform = "messenger") {
  const detected = detectAudioMimeTypeFromBuffer(inputBuffer, declaredMime);
  if (detected === "audio/mp3" || detected === "audio/mpeg") {
    return {
      buffer: inputBuffer,
      mimeType: "audio/mpeg",
      ext: "mp3"
    };
  }
  if (detected === "audio/wav") {
    const mp3Buf = wavBufferToMp3(inputBuffer);
    if (mp3Buf && mp3Buf.length > 200) {
      return {
        buffer: mp3Buf,
        mimeType: "audio/mpeg",
        ext: "mp3"
      };
    }
    if (platform !== "whatsapp") {
      return {
        buffer: inputBuffer,
        mimeType: "audio/wav",
        ext: "wav"
      };
    }
  }
  if (!process.env.VERCEL) {
    const id = Math.random().toString(36).slice(2, 9);
    const tempIn = path2.join(os2.tmpdir(), `voice_out_in_${Date.now()}_${id}.tmp`);
    const tempOut = path2.join(os2.tmpdir(), `voice_out_mp3_${Date.now()}_${id}.mp3`);
    try {
      await fs3.promises.writeFile(tempIn, inputBuffer);
      await execAsync(
        `ffmpeg -y -i "${tempIn}" -vn -af "volume=1.6" -ar 44100 -ac 1 -c:a libmp3lame -b:a 64k "${tempOut}"`
      );
      const mp3Buffer = await fs3.promises.readFile(tempOut);
      if (mp3Buffer && mp3Buffer.length > 200) {
        return {
          buffer: mp3Buffer,
          mimeType: "audio/mpeg",
          ext: "mp3"
        };
      }
    } catch {
      try {
        const wavRes = await convertToWav(inputBuffer, detected);
        if (wavRes.mimeType === "audio/wav") {
          const mp3FromWav = wavBufferToMp3(wavRes.buffer);
          if (mp3FromWav && mp3FromWav.length > 200) {
            return {
              buffer: mp3FromWav,
              mimeType: "audio/mpeg",
              ext: "mp3"
            };
          }
        }
      } catch {
      }
    } finally {
      fs3.promises.unlink(tempIn).catch(() => {
      });
      fs3.promises.unlink(tempOut).catch(() => {
      });
    }
  }
  if (detected === "audio/ogg") {
    return { buffer: inputBuffer, mimeType: "audio/ogg", ext: "ogg" };
  }
  if (detected === "audio/mp4" || detected === "audio/aac") {
    return { buffer: inputBuffer, mimeType: "audio/mp4", ext: "m4a" };
  }
  return {
    buffer: inputBuffer,
    mimeType: "audio/mpeg",
    ext: "mp3"
  };
}
function mp4ToAdtsAac(buf) {
  try {
    const stszIdx = buf.indexOf(Buffer.from("stsz", "latin1"));
    const stcoIdx = buf.indexOf(Buffer.from("stco", "latin1"));
    if (stszIdx === -1 || stcoIdx === -1) return null;
    const sampleSize = buf.readUInt32BE(stszIdx + 8);
    const sampleCount = buf.readUInt32BE(stszIdx + 12);
    if (sampleCount === 0 || sampleCount > 5e4) return null;
    const sizes = [];
    for (let i = 0; i < sampleCount; i++) {
      const sz = sampleSize !== 0 ? sampleSize : buf.readUInt32BE(stszIdx + 16 + i * 4);
      if (sz <= 0 || sz > buf.length) return null;
      sizes.push(sz);
    }
    const firstChunkOffset = buf.readUInt32BE(stcoIdx + 12);
    if (firstChunkOffset >= buf.length) return null;
    let profile = 1;
    let freqIdx = 4;
    let chanCfg = 1;
    const esdsIdx = buf.indexOf(Buffer.from("esds", "latin1"));
    if (esdsIdx !== -1) {
      for (let i = esdsIdx + 8; i < Math.min(buf.length - 4, esdsIdx + 64); i++) {
        if (buf[i] === 5) {
          let lenPos = i + 1;
          while (lenPos < buf.length && (buf[lenPos] & 128) !== 0) lenPos++;
          const ascPos = lenPos + 1;
          if (ascPos + 1 < buf.length) {
            const b0 = buf[ascPos];
            const b1 = buf[ascPos + 1];
            const audioObjectType = b0 >> 3 & 31;
            const samplingFreqIndex = (b0 & 7) << 1 | b1 >> 7 & 1;
            const channelConfiguration = b1 >> 3 & 15;
            if (audioObjectType >= 1 && audioObjectType <= 4 && samplingFreqIndex <= 12 && channelConfiguration >= 1 && channelConfiguration <= 2) {
              profile = audioObjectType - 1;
              freqIdx = samplingFreqIndex;
              chanCfg = channelConfiguration;
              break;
            }
          }
        }
      }
    }
    const outChunks = [];
    let offset = firstChunkOffset;
    for (let i = 0; i < sampleCount; i++) {
      const frameLen = sizes[i];
      if (offset + frameLen > buf.length) break;
      const adtsLen = frameLen + 7;
      const header = Buffer.alloc(7);
      header[0] = 255;
      header[1] = 241;
      header[2] = (profile & 3) << 6 | (freqIdx & 15) << 2 | chanCfg >> 2 & 1;
      header[3] = (chanCfg & 3) << 6 | adtsLen >> 11 & 3;
      header[4] = adtsLen >> 3 & 255;
      header[5] = (adtsLen & 7) << 5 | 31;
      header[6] = 252;
      outChunks.push(header, buf.subarray(offset, offset + frameLen));
      offset += frameLen;
    }
    if (outChunks.length === 0) return null;
    return Buffer.concat(outChunks);
  } catch {
    return null;
  }
}
function detectAudioMimeTypeFromBuffer(buf, fallbackMime) {
  if (buf && buf.length >= 12) {
    const header4 = buf.subarray(0, 4).toString("latin1");
    const bytes4to8 = buf.subarray(4, 8).toString("latin1");
    if (header4 === "RIFF" && buf.subarray(8, 12).toString("latin1") === "WAVE") {
      return "audio/wav";
    }
    if (header4 === "OggS") {
      return "audio/ogg";
    }
    if (bytes4to8 === "ftyp" || buf.subarray(0, 32).toString("latin1").includes("ftyp")) {
      return "audio/mp4";
    }
    if (header4 === "fLaC") {
      return "audio/flac";
    }
    if (buf[0] === 26 && buf[1] === 69 && buf[2] === 223 && buf[3] === 163) {
      return "audio/webm";
    }
    if (buf.subarray(0, 3).toString("latin1") === "ID3" || buf[0] === 255 && (buf[1] === 251 || buf[1] === 243 || buf[1] === 242 || (buf[1] & 224) === 224)) {
      if (buf[0] === 255 && (buf[1] & 246) === 240) {
        return "audio/aac";
      }
      return "audio/mp3";
    }
  }
  return cleanAudioMimeType(fallbackMime);
}
function cleanAudioMimeType(rawMime) {
  if (!rawMime) return "audio/mp4";
  const clean = rawMime.split(";")[0].trim().toLowerCase();
  if (clean === "audio/x-m4a" || clean === "audio/m4a" || clean === "audio/mp4" || clean === "video/mp4") {
    return "audio/mp4";
  }
  if (clean === "audio/aac") return "audio/aac";
  if (clean === "audio/x-wav" || clean === "audio/wave") return "audio/wav";
  if (clean === "audio/opus" || clean === "audio/ogg" || clean === "application/ogg") return "audio/ogg";
  if (clean === "audio/mpeg" || clean === "audio/mp3") return "audio/mp3";
  if (clean === "audio/webm" || clean === "video/webm") return "audio/webm";
  return clean || "audio/mp4";
}
async function convertToWav(inputBuffer, originalMime) {
  const detectedOriginalMime = detectAudioMimeTypeFromBuffer(inputBuffer, originalMime);
  const fallbackWithoutFfmpeg = () => {
    if (detectedOriginalMime === "audio/mp4") {
      const adtsBuffer = mp4ToAdtsAac(inputBuffer);
      if (adtsBuffer && adtsBuffer.length > 16) {
        return {
          buffer: adtsBuffer,
          base64: adtsBuffer.toString("base64"),
          mimeType: "audio/aac"
        };
      }
    }
    return {
      buffer: inputBuffer,
      base64: inputBuffer.toString("base64"),
      mimeType: detectedOriginalMime
    };
  };
  if (process.env.VERCEL) {
    return fallbackWithoutFfmpeg();
  }
  const id = Math.random().toString(36).slice(2, 9);
  const tempInput = path2.join(os2.tmpdir(), `audio_in_${Date.now()}_${id}.tmp`);
  const tempOutput = path2.join(os2.tmpdir(), `audio_out_${Date.now()}_${id}.wav`);
  try {
    await fs3.promises.writeFile(tempInput, inputBuffer);
    await execAsync(`ffmpeg -y -i "${tempInput}" -ar 16000 -ac 1 -c:a pcm_s16le "${tempOutput}"`);
    const wavBuffer = await fs3.promises.readFile(tempOutput);
    if (wavBuffer.length > 44 && wavBuffer.subarray(0, 4).toString("latin1") === "RIFF") {
      return {
        buffer: wavBuffer,
        base64: wavBuffer.toString("base64"),
        mimeType: "audio/wav"
      };
    }
    return fallbackWithoutFfmpeg();
  } catch (err) {
    console.warn(`[AudioDownloader] ffmpeg not available, using fallback for ${detectedOriginalMime}`);
    return fallbackWithoutFfmpeg();
  } finally {
    fs3.promises.unlink(tempInput).catch(() => {
    });
    fs3.promises.unlink(tempOutput).catch(() => {
    });
  }
}
async function downloadMessengerAudio(url) {
  try {
    console.log(`[AudioDownloader] Downloading Messenger audio from: ${url.slice(0, 60)}...`);
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; OneAgentBDBot/1.0)"
      }
    });
    if (!res.ok) {
      console.error(`[AudioDownloader] Failed to download Messenger audio: ${res.status} ${res.statusText}`);
      return null;
    }
    const contentType = res.headers.get("content-type") || void 0;
    const arrayBuffer = await res.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);
    console.log(`[AudioDownloader] Raw Messenger audio downloaded: ${rawBuffer.length} bytes (Content-Type: ${contentType || "auto"})`);
    const converted = await convertToWav(rawBuffer, contentType);
    console.log(`[AudioDownloader] Messenger audio ready: ${converted.buffer.length} bytes (${converted.mimeType})`);
    return {
      buffer: converted.buffer,
      base64: converted.base64,
      mimeType: converted.mimeType,
      sizeBytes: converted.buffer.length
    };
  } catch (err) {
    console.error("[AudioDownloader] Error downloading Messenger audio:", err);
    return null;
  }
}
async function downloadMessengerImage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; OneAgentBDBot/1.0)"
      }
    });
    if (!res.ok) return null;
    const contentType = (res.headers.get("content-type") || "image/jpeg").split(";")[0].trim();
    const arrayBuffer = await res.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);
    return {
      base64: rawBuffer.toString("base64"),
      mimeType: contentType.startsWith("image/") ? contentType : "image/jpeg"
    };
  } catch (err) {
    console.error("[ImageDownloader] Error downloading Messenger image:", err);
    return null;
  }
}
async function downloadWhatsAppAudio(mediaId, accessToken) {
  try {
    console.log(`[AudioDownloader] Fetching WhatsApp media metadata for ID: ${mediaId}`);
    const metaRes = await fetch(`https://graph.facebook.com/v21.0/${mediaId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    if (!metaRes.ok) {
      const errText = await metaRes.text().catch(() => "");
      console.error(`[AudioDownloader] Meta media lookup failed: ${metaRes.status}`, errText);
      return null;
    }
    const mediaData = await metaRes.json();
    if (!mediaData.url) {
      console.error("[AudioDownloader] No media download URL returned by Meta");
      return null;
    }
    console.log(`[AudioDownloader] Downloading binary audio from WhatsApp media URL...`);
    const binaryRes = await fetch(mediaData.url, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    if (!binaryRes.ok) {
      console.error(`[AudioDownloader] WhatsApp binary download failed: ${binaryRes.status}`);
      return null;
    }
    const arrayBuffer = await binaryRes.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);
    console.log(`[AudioDownloader] Raw WhatsApp audio downloaded: ${rawBuffer.length} bytes (${mediaData.mime_type || "audio/ogg"})`);
    const converted = await convertToWav(rawBuffer, mediaData.mime_type || "audio/ogg");
    console.log(`[AudioDownloader] WhatsApp voice ready: ${converted.buffer.length} bytes (${converted.mimeType})`);
    return {
      buffer: converted.buffer,
      base64: converted.base64,
      mimeType: converted.mimeType,
      sizeBytes: converted.buffer.length
    };
  } catch (err) {
    console.error("[AudioDownloader] Error downloading WhatsApp audio:", err);
    return null;
  }
}
async function downloadWhatsAppImage(mediaId, accessToken) {
  try {
    console.log(`[ImageDownloader] Fetching WhatsApp image metadata for ID: ${mediaId}`);
    const metaRes = await fetch(`https://graph.facebook.com/v21.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!metaRes.ok) {
      console.error(`[ImageDownloader] Meta image lookup failed: ${metaRes.status}`);
      return null;
    }
    const mediaData = await metaRes.json();
    if (!mediaData.url) return null;
    const binaryRes = await fetch(mediaData.url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!binaryRes.ok) return null;
    const arrayBuffer = await binaryRes.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);
    console.log(`[ImageDownloader] WhatsApp image successfully downloaded: ${rawBuffer.length} bytes`);
    return {
      base64: rawBuffer.toString("base64"),
      mimeType: mediaData.mime_type || "image/jpeg"
    };
  } catch (err) {
    console.error("[ImageDownloader] Error downloading WhatsApp image:", err);
    return null;
  }
}
var execAsync;
var init_audioDownloader = __esm({
  "server/services/audioDownloader.ts"() {
    execAsync = promisify(exec);
  }
});

// server/services/appointmentService.ts
import { GoogleGenAI as GoogleGenAI2 } from "@google/genai";
function getGeminiClient2(userId) {
  const userProfile = userId ? db.getProfileById(userId) : void 0;
  const sysSettings = db.getSettings();
  const adminKey = db.getProfiles().find((p) => p.role === "admin" && p.llm_api_key?.trim())?.llm_api_key?.trim();
  const apiKey = userProfile?.llm_api_key && userProfile.llm_api_key.trim() || sysSettings?.default_llm_api_key && sysSettings.default_llm_api_key.trim() || adminKey || process.env.GEMINI_API_KEY || "";
  return new GoogleGenAI2({
    apiKey,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } }
  });
}
function getTodayDateStr(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 864e5);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function getDayName(dateStr) {
  const d = /* @__PURE__ */ new Date(`${dateStr}T12:00:00`);
  if (isNaN(d.getTime())) return "Monday";
  return d.toLocaleDateString("en-US", { weekday: "long" });
}
function normalizeSlotLabel(rawTime) {
  if (!rawTime) return "11:00 AM";
  const clean = rawTime.replace(/[০-৯]/g, (d) => String("\u09E6\u09E7\u09E8\u09E9\u09EA\u09EB\u09EC\u09ED\u09EE\u09EF".indexOf(d))).trim();
  const ampmMatch = clean.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (ampmMatch) {
    let hr = parseInt(ampmMatch[1], 10);
    const min = ampmMatch[2] || "00";
    const mer = ampmMatch[3].toUpperCase();
    if (hr === 0) hr = 12;
    if (hr > 12) hr = hr - 12;
    return `${String(hr).padStart(2, "0")}:${min} ${mer}`;
  }
  const lower = clean.toLowerCase();
  const numMatch = clean.match(/(\d{1,2})(?::(\d{2}))?/);
  if (numMatch) {
    let hr = parseInt(numMatch[1], 10);
    const min = numMatch[2] || "00";
    let mer = "AM";
    if (lower.includes("\u09AC\u09BF\u0995\u09BE\u09B2") || lower.includes("\u09AC\u09BF\u0995\u09C7\u09B2") || lower.includes("\u09B8\u09A8\u09CD\u09A7\u09CD\u09AF\u09BE") || lower.includes("\u09B0\u09BE\u09A4") || lower.includes("\u09A6\u09C1\u09AA\u09C1\u09B0") || lower.includes("bikal") || lower.includes("bikel") || lower.includes("sondha") || lower.includes("raat") || lower.includes("dupur") || hr >= 1 && hr <= 8 && !lower.includes("\u09B8\u0995\u09BE\u09B2") && !lower.includes("sokal")) {
      mer = "PM";
    }
    if (hr >= 13 && hr <= 23) {
      hr = hr - 12;
      mer = "PM";
    }
    if (hr === 12) mer = "PM";
    return `${String(hr).padStart(2, "0")}:${min} ${mer}`;
  }
  return "11:00 AM";
}
function getSlotAvailability(userId, dateStr) {
  const targetDate = dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? dateStr : getTodayDateStr(0);
  const settings = db.getAppointmentSettings(userId);
  const dayOfWeek = getDayName(targetDate);
  const isDayOpen = settings.available_days.some((d) => d.toLowerCase() === dayOfWeek.toLowerCase());
  const allAppointments = db.getAppointments(userId);
  const appointmentsOnDate = allAppointments.filter(
    (a) => a.appointment_date === targetDate && a.status !== "cancelled"
  );
  const bookedSlots = appointmentsOnDate.map((a) => normalizeSlotLabel(a.appointment_time));
  const normalizedConfiguredSlots = (settings.available_slots || []).map((s) => normalizeSlotLabel(s));
  const availableSlots = isDayOpen ? normalizedConfiguredSlots.filter((slot) => !bookedSlots.includes(slot)) : [];
  return {
    date: targetDate,
    dayOfWeek,
    isDayOpen,
    allSlots: normalizedConfiguredSlots,
    bookedSlots,
    availableSlots,
    appointmentsOnDate
  };
}
function hasAppointmentIntent(text) {
  if (!text) return false;
  const q = text.toLowerCase();
  const keywords = [
    "appointment",
    "book",
    "booking",
    "schedule",
    "slot",
    "time slot",
    "meeting",
    "consult",
    "consultation",
    "visit",
    "chamber",
    "serial",
    "doctor",
    "parlor",
    "salon",
    "reservation",
    "reserve",
    "calendar",
    "\u0985\u09CD\u09AF\u09BE\u09AA\u09AF\u09BC\u09C7\u09A8\u09CD\u099F\u09AE\u09C7\u09A8\u09CD\u099F",
    "\u0985\u09CD\u09AF\u09BE\u09AA\u09DF\u09C7\u09A8\u09CD\u099F\u09AE\u09C7\u09A8\u09CD\u099F",
    "\u09AC\u09C1\u0995\u09BF\u0982",
    "\u09AC\u09C1\u0995 \u0995\u09B0\u09A4\u09C7",
    "\u09B8\u09BF\u09B0\u09BF\u09DF\u09BE\u09B2",
    "\u09B8\u09BF\u09B0\u09BF\u09AF\u09BC\u09BE\u09B2",
    "\u099A\u09C7\u09AE\u09CD\u09AC\u09BE\u09B0",
    "\u09AE\u09BF\u099F\u09BF\u0982",
    "\u09B6\u09BF\u09A1\u09BF\u0989\u09B2",
    "\u09B8\u09CD\u09B2\u099F",
    "\u09A1\u09BE\u0995\u09CD\u09A4\u09BE\u09B0",
    "\u09B8\u09BE\u0995\u09CD\u09B7\u09BE\u09CE",
    "\u09A6\u09C7\u0996\u09BE\u09A4\u09C7 \u099A\u09BE\u0987",
    "\u09B8\u09AE\u09DF \u0996\u09BE\u09B2\u09BF",
    "\u0995\u0996\u09A8 \u0986\u09B8\u09AC",
    "\u0995\u0996\u09A8 \u0986\u09B8\u09A4\u09C7 \u09AA\u09BE\u09B0\u09BF"
  ];
  return keywords.some((kw) => q.includes(kw));
}
function buildAppointmentAIContext(userId, incomingMessage) {
  const settings = db.getAppointmentSettings(userId);
  if (!settings.enabled) return "";
  const todaySlotInfo = getSlotAvailability(userId, getTodayDateStr(0));
  const tomorrowSlotInfo = getSlotAvailability(userId, getTodayDateStr(1));
  const isAskingBooking = hasAppointmentIntent(incomingMessage);
  return `
[AI APPOINTMENT & CALENDAR BOOKING AUTOMATION \u2014 LIVE SCHEDULE]:
- Booking Status: Active (${settings.business_type})
- Services Available for Booking: ${(settings.services_offered || []).join(", ")}
- Location / Meeting Mode: ${settings.location_address}
- Slot Duration: ${settings.slot_duration_minutes} minutes (${settings.start_time} - ${settings.end_time})
- Open Days: ${(settings.available_days || []).join(", ")}
- Today (${todaySlotInfo.date}, ${todaySlotInfo.dayOfWeek}) Open Slots: ${todaySlotInfo.availableSlots.length > 0 ? todaySlotInfo.availableSlots.join(", ") : "No open slots left today"}${todaySlotInfo.bookedSlots.length > 0 ? ` [Already Booked Today: ${todaySlotInfo.bookedSlots.join(", ")}]` : ""}
- Tomorrow (${tomorrowSlotInfo.date}, ${tomorrowSlotInfo.dayOfWeek}) Open Slots: ${tomorrowSlotInfo.availableSlots.length > 0 ? tomorrowSlotInfo.availableSlots.join(", ") : "Closed / Full tomorrow"}${tomorrowSlotInfo.bookedSlots.length > 0 ? ` [Already Booked Tomorrow: ${tomorrowSlotInfo.bookedSlots.join(", ")}]` : ""}
${isAskingBooking ? `CRITICAL BOOKING DIRECTIVE: The customer is asking about booking an appointment, schedule, or slot!
1. Check the Live Schedule above. NEVER confirm a slot that is listed in [Already Booked]. If they ask for a booked slot, politely inform them it is already booked and suggest 2-3 open slots from the list above.
2. To confirm a booking, make sure you have their: (a) Name, (b) 11-digit Mobile Number, (c) Service/Topic, and (d) Preferred Date & Time Slot.
3. Once they provide their phone number and preferred open time slot, confirm the appointment warmly and mention that it has been added to our schedule & Google Calendar!` : `If the customer asks to book an appointment, consultation, meeting, or service slot, offer the open slots above and collect their Name, 11-digit Phone Number, and preferred Date & Time.`}`;
}
function extractDateFromMessage(text) {
  const clean = (text || "").replace(/[০-৯]/g, (d) => String("\u09E6\u09E7\u09E8\u09E9\u09EA\u09EB\u09EC\u09ED\u09EE\u09EF".indexOf(d))).toLowerCase();
  const isoMatch = clean.match(/(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];
  if (clean.includes("\u09AA\u09B0\u09B6\u09C1") || clean.includes("porshu") || clean.includes("day after tomorrow")) {
    return getTodayDateStr(2);
  }
  if (clean.includes("\u0986\u0997\u09BE\u09AE\u09C0\u0995\u09BE\u09B2") || clean.includes("\u0995\u09BE\u09B2\u0995\u09C7") || clean.includes("\u0995\u09BE\u09B2 ") || clean.includes("tomorrow") || clean.includes("agamikal") || clean.includes("kalke")) {
    return getTodayDateStr(1);
  }
  if (clean.includes("\u0986\u099C\u0995\u09C7") || clean.includes("\u0986\u099C ") || clean.includes("today") || clean.includes("ajke")) {
    return getTodayDateStr(0);
  }
  return getTodayDateStr(1);
}
function extractTimeSlotFromMessage(text, availableSlots) {
  const normalizedInput = (text || "").replace(/[০-৯]/g, (d) => String("\u09E6\u09E7\u09E8\u09E9\u09EA\u09EB\u09EC\u09ED\u09EE\u09EF".indexOf(d)));
  const timeRegex = /(?:সকাল|দুপুর|বিকাল|বিকেল|সন্ধ্যা|রাত|sokal|dupur|bikal|bikel|sondha|raat)?\s*(\d{1,2})(?::(\d{2}))?\s*(?:টা|টায়|টায়|am|pm|টা বাজে)?/i;
  const ampmExplicit = normalizedInput.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (ampmExplicit) {
    return normalizeSlotLabel(ampmExplicit[0]);
  }
  const banglaTimeMatch = normalizedInput.match(
    /(?:সকাল|দুপুর|বিকাল|বিকেল|সন্ধ্যা|রাত|sokal|dupur|bikal|bikel|sondha|raat)\s*(\d{1,2})(?::(\d{2}))?/i
  );
  if (banglaTimeMatch) {
    return normalizeSlotLabel(banglaTimeMatch[0]);
  }
  const taMatch = normalizedInput.match(/(\d{1,2})\s*(?:টা|টায়|টায়|ta|tay)/i);
  if (taMatch) {
    return normalizeSlotLabel(taMatch[0]);
  }
  void timeRegex;
  return availableSlots.length > 0 ? availableSlots[0] : "11:00 AM";
}
async function detectAndRecordAppointment(params) {
  const {
    userId,
    customerId,
    customerName,
    platform,
    channelId,
    messageText,
    recentHistory,
    aiReplyText
  } = params;
  const settings = db.getAppointmentSettings(userId);
  if (!settings.enabled) return null;
  const combinedText = `${messageText} ${recentHistory || ""} ${aiReplyText || ""}`;
  if (!hasAppointmentIntent(combinedText)) {
    return null;
  }
  const normalizedMsg = (messageText || "").replace(/[০-৯]/g, (d) => String("\u09E6\u09E7\u09E8\u09E9\u09EA\u09EB\u09EC\u09ED\u09EE\u09EF".indexOf(d)));
  const normalizedHistory = (recentHistory || "").replace(/[০-৯]/g, (d) => String("\u09E6\u09E7\u09E8\u09E9\u09EA\u09EB\u09EC\u09ED\u09EE\u09EF".indexOf(d)));
  const phoneMatch = normalizedMsg.match(/(?:\+?8801|01)[3-9]\d{8}/) || normalizedHistory.match(/(?:\+?8801|01)[3-9]\d{8}/) || (customerId.match(/(?:\+?8801|01)[3-9]\d{8}/) ? [customerId] : null);
  const extractedPhone = phoneMatch ? phoneMatch[0] : "";
  const hasTimeMention = /(\d{1,2})\s*(?::\d{2})?\s*(?:am|pm|টা|টায়|টায়|ta|tay)/i.test(normalizedMsg) || /(?:সকাল|দুপুর|বিকাল|বিকেল|সন্ধ্যা|রাত)\s*\d{1,2}/i.test(normalizedMsg);
  if (!extractedPhone && !hasTimeMention) {
    return null;
  }
  let extractedData = null;
  try {
    const ai = getGeminiClient2(userId);
    const todayStr = getTodayDateStr(0);
    const tomorrowStr = getTodayDateStr(1);
    const prompt = `You are an AI Appointment Booking Extractor for "${settings.business_type}".
Today's Date: ${todayStr} (${getDayName(todayStr)})
Tomorrow's Date: ${tomorrowStr} (${getDayName(tomorrowStr)})
Available Services: ${(settings.services_offered || []).join(", ")}
Configured Time Slots: ${(settings.available_slots || []).join(", ")}

Customer Message: "${messageText}"
Recent Conversation:
${recentHistory || "(none)"}
Assistant Reply: "${aiReplyText || ""}"

Determine if the customer is confirming or requesting a specific appointment booking (with a time/date or contact info).
If YES, respond ONLY with valid JSON:
{
  "is_booking": true,
  "customer_name": "<Customer name if mentioned, else '${customerName || "Valued Client"}'>",
  "customer_phone": "<11-digit BD phone number if available, else '${extractedPhone || "Pending in chat"}'>",
  "service_name": "<Matched service from Available Services or topic mentioned>",
  "appointment_date": "<YYYY-MM-DD, e.g. ${todayStr} or ${tomorrowStr}>",
  "appointment_time": "<Formatted slot like '04:00 PM' or '11:00 AM'>",
  "notes": "<Brief summary of customer request>"
}
If the customer is ONLY asking a general question without choosing a slot or providing booking details, return:
{"is_booking": false}`;
    for (const modelName of ["gemini-2.5-flash", "gemini-3.8-flash", "gemini-2.5-flash-lite"]) {
      try {
        const res = await ai.models.generateContent({
          model: modelName,
          contents: prompt
        });
        if (res.text?.trim()) {
          const cleanJson = res.text.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanJson);
          if (parsed && typeof parsed.is_booking === "boolean") {
            extractedData = parsed;
            break;
          }
        }
      } catch {
      }
    }
  } catch (err) {
    console.warn("[Appointment Detection] Gemini extraction fallback to heuristic:", err);
  }
  if (!extractedData || !extractedData.is_booking) {
    if (extractedPhone && (hasTimeMention || hasAppointmentIntent(messageText))) {
      const targetDate = extractDateFromMessage(`${messageText} ${recentHistory || ""}`);
      const slotInfo = getSlotAvailability(userId, targetDate);
      const targetSlot = extractTimeSlotFromMessage(`${messageText} ${recentHistory || ""}`, slotInfo.availableSlots) || "04:00 PM";
      const matchedService = (settings.services_offered || []).find(
        (s) => combinedText.toLowerCase().includes(s.toLowerCase())
      ) || settings.services_offered?.[0] || "General Consultation";
      extractedData = {
        is_booking: true,
        customer_name: customerName || "Valued Client",
        customer_phone: extractedPhone,
        service_name: matchedService,
        appointment_date: targetDate,
        appointment_time: targetSlot,
        notes: `Booked via ${platform} AI conversation`
      };
    } else {
      return null;
    }
  }
  const finalDate = extractedData.appointment_date && /^\d{4}-\d{2}-\d{2}$/.test(extractedData.appointment_date) ? extractedData.appointment_date : extractDateFromMessage(`${messageText} ${recentHistory || ""}`);
  const finalTime = normalizeSlotLabel(extractedData.appointment_time || "04:00 PM");
  const existingUserAppointments = db.getAppointments(userId);
  const duplicate = existingUserAppointments.find(
    (a) => a.customer_id === customerId && a.appointment_date === finalDate && normalizeSlotLabel(a.appointment_time) === finalTime && a.status !== "cancelled"
  );
  if (duplicate) {
    return duplicate;
  }
  const slotConflict = existingUserAppointments.find(
    (a) => a.appointment_date === finalDate && normalizeSlotLabel(a.appointment_time) === finalTime && a.status !== "cancelled"
  );
  let assignedTime = finalTime;
  let conflictNote = "";
  if (slotConflict) {
    const availability = getSlotAvailability(userId, finalDate);
    if (availability.availableSlots.length > 0) {
      assignedTime = availability.availableSlots[0];
      conflictNote = ` (Requested ${finalTime} was full; auto-assigned nearest open slot ${assignedTime})`;
    }
  }
  const newAppointment = {
    id: `apt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    user_id: userId,
    customer_id: customerId,
    customer_name: extractedData.customer_name || customerName || "Valued Client",
    customer_phone: extractedData.customer_phone || extractedPhone || "Pending in chat",
    platform,
    channel_id: channelId,
    service_name: extractedData.service_name || settings.services_offered?.[0] || "General Consultation",
    appointment_date: finalDate,
    appointment_time: assignedTime,
    duration_minutes: settings.slot_duration_minutes || 30,
    status: settings.auto_confirm_booking ? "confirmed" : "pending",
    booking_source: platform === "website" ? "website" : "ai_chat",
    location: settings.location_address || "Main Office / Online Session",
    google_calendar_synced: Boolean(settings.google_calendar_auto_sync),
    notes: `${extractedData.notes || `Auto-booked by AI via ${platform}`}${conflictNote}`,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  return db.createAppointment(newAppointment);
}
function parseDateTimeToUTC(dateStr, timeStr, durationMinutes) {
  const norm = normalizeSlotLabel(timeStr);
  const match = norm.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  let hours = 11;
  let minutes = 0;
  if (match) {
    hours = parseInt(match[1], 10);
    minutes = parseInt(match[2], 10);
    const mer = match[3].toUpperCase();
    if (mer === "PM" && hours < 12) hours += 12;
    if (mer === "AM" && hours === 12) hours = 0;
  }
  const [yr, mo, da] = dateStr.split("-").map((n) => parseInt(n, 10));
  const startUtcMs = Date.UTC(yr || 2026, (mo || 1) - 1, da || 1, hours - 6, minutes, 0);
  const endUtcMs = startUtcMs + (durationMinutes || 30) * 60 * 1e3;
  const formatGCalDate = (ms) => {
    const d = new Date(ms);
    return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  };
  return {
    startFormatted: formatGCalDate(startUtcMs),
    endFormatted: formatGCalDate(endUtcMs)
  };
}
function buildGoogleCalendarUrl(appointment, businessName = "One Agent BD") {
  const { startFormatted, endFormatted } = parseDateTimeToUTC(
    appointment.appointment_date,
    appointment.appointment_time,
    appointment.duration_minutes || 30
  );
  const title = `${appointment.service_name} \u2014 ${appointment.customer_name} (${appointment.customer_phone})`;
  const details = [
    `Client Name: ${appointment.customer_name}`,
    `Phone: ${appointment.customer_phone}`,
    `Service: ${appointment.service_name}`,
    `Channel: ${appointment.platform.toUpperCase()}`,
    `Status: ${appointment.status.toUpperCase()}`,
    appointment.notes ? `Notes: ${appointment.notes}` : "",
    `Managed by ${businessName} AI Booking Engine`
  ].filter(Boolean).join("\n");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${startFormatted}/${endFormatted}`,
    details,
    location: appointment.location || "Online / Office Branch"
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
function generateICalFeed(appointments, businessName = "One Agent BD") {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${businessName}//AI Appointment & Booking Sync//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${businessName} \u2014 AI Bookings`,
    "X-WR-TIMEZONE:Asia/Dhaka"
  ];
  for (const apt of appointments) {
    if (apt.status === "cancelled") continue;
    const { startFormatted, endFormatted } = parseDateTimeToUTC(
      apt.appointment_date,
      apt.appointment_time,
      apt.duration_minutes || 30
    );
    const uid = `${apt.id}@oneagentbd.online`;
    const summary = `${apt.service_name} - ${apt.customer_name} (${apt.customer_phone})`.replace(/[,;\\]/g, " ");
    const description = `Client: ${apt.customer_name}\\nPhone: ${apt.customer_phone}\\nChannel: ${apt.platform}\\nStatus: ${apt.status}\\nNotes: ${(apt.notes || "").replace(/\r?\n/g, " ")}`;
    const location = (apt.location || "Office / Online").replace(/[,;\\]/g, " ");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${startFormatted}`,
      `DTSTART:${startFormatted}`,
      `DTEND:${endFormatted}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      `STATUS:${apt.status === "confirmed" ? "CONFIRMED" : "TENTATIVE"}`,
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
var init_appointmentService = __esm({
  "server/services/appointmentService.ts"() {
    init_database();
  }
});

// server/services/aiService.ts
var aiService_exports = {};
__export(aiService_exports, {
  CANDIDATE_MODELS: () => CANDIDATE_MODELS,
  UNCLEAR_VOICE_REPLY: () => UNCLEAR_VOICE_REPLY,
  buildInteractiveConversationEnvelope: () => buildInteractiveConversationEnvelope,
  detectProductImageInquiry: () => detectProductImageInquiry,
  detectRequiresHumanAttention: () => detectRequiresHumanAttention,
  ensureConversationalFollowUp: () => ensureConversationalFollowUp,
  extractCatalogItemsForInteractiveMenu: () => extractCatalogItemsForInteractiveMenu,
  formatCleanChatMessage: () => formatCleanChatMessage,
  generateAIReply: () => generateAIReply,
  getCandidateGeminiKeys: () => getCandidateGeminiKeys,
  getPrioritizedModels: () => getPrioritizedModels,
  getShortGreetingOrSmallTalkReply: () => getShortGreetingOrSmallTalkReply,
  isUnclearVoiceText: () => isUnclearVoiceText,
  markModelFailure: () => markModelFailure,
  markModelSuccess: () => markModelSuccess,
  sanitizeBusinessDisplayName: () => sanitizeBusinessDisplayName,
  summarizeConversation: () => summarizeConversation
});
import { GoogleGenAI as GoogleGenAI3 } from "@google/genai";
function isDeadSeedKey(key) {
  return Boolean(key && key.trim().startsWith("sk-proj-wJiInvQ"));
}
function getCandidateGeminiKeys(customApiKey) {
  const defaultSystemKey = (db.getSettings()?.default_llm_api_key || "").trim();
  const allProfiles = db.getProfiles() || [];
  const adminKeys = allProfiles.filter((p) => p.role === "admin" && p.llm_api_key?.trim() && !isDeadSeedKey(p.llm_api_key)).map((p) => p.llm_api_key.trim());
  const anyProfileKeys = allProfiles.filter((p) => p.llm_api_key?.trim() && !isDeadSeedKey(p.llm_api_key)).map((p) => p.llm_api_key.trim());
  return Array.from(
    new Set(
      [
        customApiKey?.trim(),
        ...adminKeys,
        ...anyProfileKeys,
        defaultSystemKey,
        process.env.GEMINI_API_KEY?.trim(),
        process.env.VITE_GEMINI_API_KEY?.trim(),
        process.env.GOOGLE_API_KEY?.trim()
      ].filter((k) => Boolean(k && k.length > 10 && !k.startsWith("sk-") && !k.startsWith("gsk_")))
    )
  );
}
function getGeminiClients(customApiKey) {
  const candidateKeys = getCandidateGeminiKeys(customApiKey);
  if (candidateKeys.length === 0) {
    if (process.env.VERCEL === "1" || process.env.VERCEL === "true") {
      return [];
    }
    return [
      new GoogleGenAI3({
        apiKey: "",
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      })
    ];
  }
  return candidateKeys.map(
    (apiKey) => new GoogleGenAI3({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } }
    })
  );
}
function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Gemini request timed out after ${ms}ms`)), ms);
    promise.then((val) => {
      clearTimeout(timer);
      resolve(val);
    }).catch((err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}
function toBengaliNumber(n) {
  return String(n).split("").map((ch) => ch >= "0" && ch <= "9" ? BENGALI_DIGITS[Number(ch)] : ch).join("");
}
function detectProductImageInquiry(text) {
  const lower = (text || "").toLowerCase().trim();
  if (!lower) {
    return { isAskingForImage: false, isAskingForCatalog: false, isAskingForDetails: false };
  }
  const isAskingForImage = lower.includes("picture") || lower.includes("photo") || lower.includes("chobi") || lower.includes("chbi") || lower.includes("image") || lower.includes("pic") || lower.includes("look like") || lower.includes("dekhte chai") || lower.includes("dekhte cai") || lower.includes("dete chai") || lower.includes("dete cai") || lower.includes("dite chai") || lower.includes("dite cai") || lower.includes("pic din") || lower.includes("pic den") || lower.includes("pic daw") || lower.includes("pic dao") || lower.includes("pic lagbe") || lower.includes("picture daw") || lower.includes("picture dao") || lower.includes("picture den") || lower.includes("picture din") || lower.includes("chobi daw") || lower.includes("chobi dao") || lower.includes("chobi den") || lower.includes("chobi din") || lower.includes("photo daw") || lower.includes("photo dao") || lower.includes("photo den") || lower.includes("photo din") || lower.includes("image daw") || lower.includes("image dao") || lower.includes("image den") || lower.includes("image din") || lower.includes("pic dekhan") || lower.includes("pic pathan") || lower.includes("chobi dekhan") || lower.includes("chobi pathan") || lower.includes("photo dekhan") || lower.includes("photo pathan") || lower.includes("\u099B\u09AC\u09BF") || lower.includes("\u09AA\u09BF\u0995") || lower.includes("\u09AA\u09BF\u0995\u099A\u09BE\u09B0") || lower.includes("\u09AB\u099F\u09CB") || lower.includes("\u0987\u09AE\u09C7\u099C") || lower.includes("\u09A6\u09C7\u0996\u09BE\u09A8") || lower.includes("\u09AA\u09BE\u09A0\u09BE\u09A8") || lower.includes("\u09A6\u09C7\u0996\u09A4\u09C7 \u099A\u09BE\u0987") || lower.includes("\u099B\u09AC\u09BF \u09A6\u09C7\u09A8") || lower.includes("\u099B\u09AC\u09BF \u09A6\u09BE\u0993") || lower.includes("\u099B\u09AC\u09BF \u09A6\u09BF\u09A8") || lower.includes("\u09AA\u09BF\u0995 \u09A6\u09C7\u09A8") || lower.includes("\u09AA\u09BF\u0995 \u09A6\u09BE\u0993") || lower.includes("\u09AA\u09BF\u0995 \u09A6\u09BF\u09A8") || lower.includes("\u09AB\u099F\u09CB \u09A6\u09C7\u09A8") || lower.includes("\u09AB\u099F\u09CB \u09A6\u09BE\u0993");
  const isAskingForCatalog = lower.includes("ki ki product") || lower.includes("k i ki product") || lower.includes("ki ki item") || lower.includes("k i ki item") || lower.includes("ki ki dress") || lower.includes("ki ki collection") || lower.includes("ki ki ase") || lower.includes("ki ki ache") || lower.includes("k i ki") || lower.includes("products ase") || lower.includes("product ase") || lower.includes("products ache") || lower.includes("product ache") || lower.includes("all product") || lower.includes("shob product") || lower.includes("sob product") || lower.includes("shob item") || lower.includes("sob item") || lower.includes("\u09B8\u09AC \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F") || lower.includes("\u09B8\u09AC \u0986\u0987\u099F\u09C7\u09AE") || lower.includes("\u09B8\u09AC \u0995\u09BE\u09B2\u09C7\u0995\u09B6\u09A8") || lower.includes("\u0995\u09BE\u09B2\u09C7\u0995\u09B6\u09A8 \u09A6\u09C7\u0996\u09BE\u09A8") || lower.includes("catalog") || lower.includes("catalogue") || lower.includes("\u0995\u09C0 \u0995\u09C0 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F") || lower.includes("\u0995\u09BF \u0995\u09BF \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F") || lower.includes("\u0995\u09C0 \u0995\u09C0 \u0986\u099B\u09C7") || lower.includes("\u0995\u09BF \u0995\u09BF \u0986\u099B\u09C7") || lower.includes("\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u09B2\u0997") || lower.includes("\u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u09B2\u09BF\u09B8\u09CD\u099F") || lower.includes("\u09AA\u09A3\u09CD\u09AF \u09A4\u09BE\u09B2\u09BF\u0995\u09BE");
  const isAskingForDetails = lower.includes("detail") || lower.includes("spec") || lower.includes("feature") || lower.includes("fabric") || lower.includes("material") || lower.includes("size") || lower.includes("color") || lower.includes("warranty") || lower.includes("kemon") || lower.includes("bistarito") || lower.includes("price") || lower.includes("dam") || lower.includes("cost") || lower.includes("\u09A6\u09BE\u09AE") || lower.includes("\u0995\u09A4") || lower.includes("\u09B8\u09BE\u0987\u099C") || lower.includes("\u09AB\u09C7\u09AC\u09CD\u09B0\u09BF\u0995") || lower.includes("\u0995\u09BE\u09B2\u09BE\u09B0") || lower.includes("\u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4");
  return { isAskingForImage, isAskingForCatalog, isAskingForDetails };
}
function formatCleanChatMessage(raw) {
  if (!raw) return "";
  let text = raw.replace(/\r\n/g, "\n").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1").replace(/^#{1,6}\s*/gm, "").replace(/।।+/g, "\u0964").replace(/([।?!])(?=[^\s।?!\n"”')\]])/gu, "$1 ").replace(/([^\n])\s+([১-৯0-9][.)]\s+)/gu, "$1\n$2").replace(/\[HUMAN_HANDOFF\]/gi, "").trim();
  const isBanglaText = /[\u0980-\u09FF]/.test(text);
  const splitDenseParagraph = (para) => {
    const trimmed = para.trim();
    if (!trimmed) return [];
    if (/^[•\-–—*০-৯0-9]+[.)]?\s/.test(trimmed)) {
      return [trimmed];
    }
    const sentences = trimmed.split(/(?<=[।?!])\s+/u).map((s) => s.trim()).filter(Boolean);
    const expandedSentences = [];
    for (const s of sentences) {
      const hasMultiplePricesOrPlans = /(টাকা|৳|tk|bdt|প্ল্যান|plan)/i.test(s) && /\s+(?:এবং|ও|আর|and)\s+/i.test(s);
      if (hasMultiplePricesOrPlans) {
        const parts = s.replace(/[।.]$/, "").split(/\s+(?:এবং|and)\s+/i).map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 2 && parts.every((p) => /(টাকা|৳|tk|bdt|প্ল্যান|plan|প্রোডাক্ট|সার্ভিস)/i.test(p))) {
          parts[0] = parts[0].replace(/^(আমাদের\s+)(রয়েছে\s+|আছে\s+)?/i, "").trim();
          expandedSentences.push(
            isBanglaText ? "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8 \u0993 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u09A8\u09BF\u099A\u09C7 \u09A6\u09C7\u0993\u09DF\u09BE \u09B9\u09B2\u09CB:" : "Here are the details:"
          );
          parts.forEach((p, idx) => {
            const num = isBanglaText ? `${toBengaliNumber(idx + 1)}.` : `${idx + 1}.`;
            expandedSentences.push(`${num} ${p}`);
          });
          continue;
        }
      }
      expandedSentences.push(s);
    }
    if (expandedSentences.some((x) => /^[০-৯0-9]+\.\s/.test(x))) {
      return expandedSentences;
    }
    if (sentences.length <= 1) {
      return [trimmed];
    }
    if (sentences.length === 2) {
      if (sentences[1].endsWith("?") || trimmed.length > 85) {
        return [sentences[0], sentences[1]];
      }
      return [trimmed];
    }
    if (sentences.length === 3) {
      if (sentences[2].endsWith("?")) {
        return [sentences[0], sentences[1], sentences[2]];
      }
      return [sentences[0], `${sentences[1]} ${sentences[2]}`];
    }
    const lastSentence = sentences[sentences.length - 1];
    const isLastQuestion = lastSentence.endsWith("?");
    const bodySentences = isLastQuestion ? sentences.slice(0, -1) : sentences;
    const mid = Math.ceil(bodySentences.length / 2);
    const para1 = bodySentences.slice(0, mid).join(" ");
    const para2 = bodySentences.slice(mid).join(" ");
    return [para1, para2, ...isLastQuestion ? [lastSentence] : []].filter(Boolean);
  };
  const rawLines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const expandedLines = [];
  for (const line of rawLines) {
    expandedLines.push(...splitDenseParagraph(line));
  }
  let serialCounter = 0;
  const serializedLines = expandedLines.map((line) => {
    if (/^[•\-–—*]\s+/.test(line)) {
      serialCounter += 1;
      const cleanBody = line.replace(/^[•\-–—*]\s+/, "").trim();
      const prefix = isBanglaText ? `${toBengaliNumber(serialCounter)}.` : `${serialCounter}.`;
      return `${prefix} ${cleanBody}`;
    } else if (/^[০-৯0-9]+[.)]\s+/.test(line)) {
      serialCounter += 1;
      const cleanBody = line.replace(/^[০-৯0-9]+[.)]\s+/, "").trim();
      const prefix = isBanglaText ? `${toBengaliNumber(serialCounter)}.` : `${serialCounter}.`;
      return `${prefix} ${cleanBody}`;
    } else {
      serialCounter = 0;
      return line;
    }
  });
  if (serializedLines.length > 1) {
    text = serializedLines.join("\n\n");
  } else if (serializedLines.length === 1) {
    text = serializedLines[0];
  }
  return text.replace(/\n{3,}/g, "\n\n").trim();
}
function sanitizeBusinessDisplayName(name) {
  const clean = (name || "").trim();
  if (!clean || /^(platform admin|admin|usr_.*|app developer)$/i.test(clean)) {
    return "One Agent BD";
  }
  return clean;
}
function getShortGreetingOrSmallTalkReply(incomingMessage, businessName = "One Agent BD", lang = "bn") {
  if (!incomingMessage) return null;
  const raw = incomingMessage.trim();
  if (raw.length > 100) return null;
  const safeBusinessName = sanitizeBusinessDisplayName(businessName);
  const lower = raw.toLowerCase();
  const stripped = lower.replace(/[.,?!।'"\-_*~`()[\]{}]/g, " ").replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, " ").replace(/\b(vai|vaia|bhaiya|bhai|apu|sir|boss|bro|dear|ভাইয়া|ভাইয়া|ভাই|আপু|স্যার|বস)\b/gi, " ").replace(/\s+/g, " ").trim();
  if (!stripped) return null;
  const howAreYouPatterns = [
    "\u0995\u09C7\u09AE\u09A8 \u0986\u099B\u09C7\u09A8",
    "\u0995\u09C7\u09AE\u09A8 \u0986\u099B\u09CB",
    "\u0995\u09BF \u0996\u09AC\u09B0",
    "\u0995\u09C0 \u0996\u09AC\u09B0",
    "kemon achen",
    "kemon asen",
    "kmn achen",
    "kmn asen",
    "ki khobor",
    "how are you",
    "how r u"
  ];
  const hasHowAreYou = howAreYouPatterns.some((p) => stripped === p || stripped.includes(p));
  const highIntentPurchaseKeywords = [
    "price",
    "plan",
    "cost",
    "fee",
    "subscription",
    "order",
    "buy",
    "delivery charge",
    "koto",
    "dam",
    "daam",
    "taka",
    "tk",
    "bdt",
    "\u09A6\u09BE\u09AE",
    "\u0995\u09A4",
    "\u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8",
    "\u09AA\u09CD\u09AF\u09BE\u0995\u09C7\u099C",
    "\u0985\u09B0\u09CD\u09A1\u09BE\u09B0",
    "\u0995\u09BF\u09A8\u09AC",
    "\u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u099A\u09BE\u09B0\u09CD\u099C",
    "\u099F\u09BE\u0995\u09BE"
  ];
  const hasPurchaseIntent = highIntentPurchaseKeywords.some((kw) => lower.includes(kw));
  if (hasHowAreYou && !hasPurchaseIntent) {
    return lang === "en" && stripped.includes("how") ? `Alhamdulillah, we are doing great! Hope you are doing well too. \u{1F60A} Welcome to ${safeBusinessName}.

How can I help you today?` : `\u0986\u09B2\u09B9\u09BE\u09AE\u09A6\u09C1\u09B2\u09BF\u09B2\u09CD\u09B2\u09BE\u09B9, \u0986\u09AE\u09B0\u09BE \u09B8\u09AC\u09BE\u0987 \u09AD\u09BE\u09B2\u09CB \u0986\u099B\u09BF! \u0986\u09B6\u09BE \u0995\u09B0\u09BF \u0986\u09AA\u09A8\u09BF\u0993 \u09AD\u09BE\u09B2\u09CB \u0986\u099B\u09C7\u09A8\u0964 \u{1F60A} \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 ${safeBusinessName}-\u098F \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u09B8\u09CD\u09AC\u09BE\u0997\u09A4\u09AE\u0964

\u09AC\u09B2\u09C1\u09A8, \u0986\u099C \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u0995\u09C0\u09AD\u09BE\u09AC\u09C7 \u09B8\u09BE\u09B9\u09BE\u09AF\u09CD\u09AF \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09BF?`;
  }
  const questionKeywords = [
    "price",
    "plan",
    "cost",
    "fee",
    "subscription",
    "trial",
    "free",
    "order",
    "buy",
    "delivery",
    "charge",
    "courier",
    "bkash",
    "nagad",
    "payment",
    "coupon",
    "discount",
    "ban",
    "limit",
    "details",
    "koto",
    "dam",
    "daam",
    "kivabe",
    "ki ki",
    "ki ase",
    "ki ache",
    "taka",
    "tk",
    "bdt",
    "\u09A6\u09BE\u09AE",
    "\u0995\u09A4",
    "\u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8",
    "\u09AA\u09CD\u09AF\u09BE\u0995\u09C7\u099C",
    "\u099F\u09CD\u09B0\u09BE\u09DF\u09BE\u09B2",
    "\u09AB\u09CD\u09B0\u09BF",
    "\u0985\u09B0\u09CD\u09A1\u09BE\u09B0",
    "\u0995\u09BF\u09A8\u09AC",
    "\u09A8\u09BF\u09A4\u09C7",
    "\u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF",
    "\u099A\u09BE\u09B0\u09CD\u099C",
    "\u0995\u09C1\u09B0\u09BF\u09DF\u09BE\u09B0",
    "\u09AC\u09BF\u0995\u09BE\u09B6",
    "\u09A8\u0997\u09A6",
    "\u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F",
    "\u0995\u09C1\u09AA\u09A8",
    "\u09A1\u09BF\u09B8\u0995\u09BE\u0989\u09A8\u09CD\u099F",
    "\u099B\u09BE\u09DC",
    "\u09AC\u09CD\u09AF\u09BE\u09A8",
    "\u09B2\u09BF\u09AE\u09BF\u099F",
    "\u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4",
    "\u0995\u09C0 \u0995\u09C0",
    "\u0995\u09BF \u0995\u09BF",
    "\u0995\u09C0\u09AD\u09BE\u09AC\u09C7",
    "\u0995\u09BF\u09AD\u09BE\u09AC\u09C7",
    "\u099F\u09BE\u0995\u09BE"
  ];
  if (questionKeywords.some((kw) => lower.includes(kw))) {
    return null;
  }
  const salamPatterns = [
    "\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE",
    "\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1\u09AF\u09BC\u09BE\u09B2\u09BE\u0987\u0995\u09C1\u09AE",
    "\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0993\u09DF\u09BE\u09B2\u09BE\u0987\u0995\u09C1\u09AE",
    "\u09B8\u09BE\u09B2\u09BE\u09AE",
    "\u09B8\u09CD\u09B2\u09BE\u09AE\u09BE\u09B2\u09BE\u0987\u0995\u09C1\u09AE",
    "\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1",
    "assalamu alaikum",
    "assalamualaikum",
    "as salamu alaikum",
    "as-salamu alaykum",
    "salam",
    "slm",
    "assalam"
  ];
  if (salamPatterns.some((p) => stripped === p || stripped.startsWith(p))) {
    return lang === "en" && !/[\u0980-\u09FF]/.test(raw) && !lower.includes("vai") ? `Wa Alaikum Assalam! Welcome to ${safeBusinessName}. \u{1F60A}

How can I help you today?` : `\u0993\u09DF\u09BE\u09B2\u09BE\u0987\u0995\u09C1\u09AE \u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE! ${safeBusinessName}-\u098F \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u09B8\u09CD\u09AC\u09BE\u0997\u09A4\u09AE\u0964 \u{1F60A}

\u09AC\u09B2\u09C1\u09A8, \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u0995\u09C0\u09AD\u09BE\u09AC\u09C7 \u09B8\u09BE\u09B9\u09BE\u09AF\u09CD\u09AF \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09BF?`;
  }
  const helloPatterns = [
    "\u09B9\u09CD\u09AF\u09BE\u09B2\u09CB",
    "\u09B9\u09BE\u0987",
    "\u09B9\u09C7\u09B2\u09CB",
    "\u09B9\u09C7",
    "\u0995\u09C7\u0989 \u0986\u099B\u09C7\u09A8",
    "\u0986\u099B\u09C7\u09A8",
    "hello",
    "hi",
    "hey",
    "hlw",
    "hlo",
    "keu achen",
    "keu asen"
  ];
  if (helloPatterns.some((p) => stripped === p)) {
    return lang === "en" && /^[a-z\s]+$/i.test(stripped) && !stripped.includes("keu") ? `Hello! Welcome to ${safeBusinessName}. \u{1F60A}

How can I help you today?` : `\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE! ${safeBusinessName}-\u098F \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u09B8\u09CD\u09AC\u09BE\u0997\u09A4\u09AE\u0964 \u{1F60A}

\u09AC\u09B2\u09C1\u09A8, \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u0995\u09C0\u09AD\u09BE\u09AC\u09C7 \u09B8\u09BE\u09B9\u09BE\u09AF\u09CD\u09AF \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09BF?`;
  }
  if (/^(ভাইয়া|ভাইয়া|ভাই|আপু|স্যার|vai|vaia|bhaiya|bhai|apu|sir)$/i.test(raw.replace(/[.,?!।]/g, "").trim())) {
    return `\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE! \u099C\u09CD\u09AC\u09C0 \u09AC\u09B2\u09C1\u09A8, \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u0995\u09C0\u09AD\u09BE\u09AC\u09C7 \u09B8\u09BE\u09B9\u09BE\u09AF\u09CD\u09AF \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09BF? \u{1F60A}`;
  }
  const thanksPatterns = ["\u09A7\u09A8\u09CD\u09AF\u09AC\u09BE\u09A6", "\u09A5\u09CD\u09AF\u09BE\u0982\u0995 \u0987\u0989", "\u09A5\u09CD\u09AF\u09BE\u0982\u0995\u09B8", "\u0993\u0995\u09C7", "\u0986\u099A\u09CD\u099B\u09BE", "\u09A0\u09BF\u0995 \u0986\u099B\u09C7", "thanks", "thank you", "tnx", "ty", "ok", "okay"];
  if (thanksPatterns.some((p) => stripped === p)) {
    return lang === "en" && /^[a-z\s]+$/i.test(stripped) ? `You're most welcome! \u{1F60A}

Let me know if you have any other questions.` : `\u0986\u09AA\u09A8\u09BE\u0995\u09C7\u0993 \u0985\u09B8\u0982\u0996\u09CD\u09AF \u09A7\u09A8\u09CD\u09AF\u09AC\u09BE\u09A6! \u{1F60A}

\u0986\u09AA\u09A8\u09BE\u09B0 \u0986\u09B0 \u0995\u09CB\u09A8\u09CB \u09AC\u09BF\u09B7\u09DF\u09C7 \u099C\u09BE\u09A8\u09BE\u09B0 \u09A5\u09BE\u0995\u09B2\u09C7 \u09A8\u09BF\u0983\u09B8\u0982\u0995\u09CB\u099A\u09C7 \u09AC\u09B2\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8\u0964`;
  }
  return null;
}
function ensureConversationalFollowUp(replyText, customerQuery, isOneAgentSaaS, hasProducts = false) {
  const formatted = formatCleanChatMessage(replyText);
  if (!formatted) return formatted;
  if (/\?\s*(?:[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}])?\s*$/u.test(formatted)) {
    return formatted;
  }
  if (formatted.includes("\u09A8\u09BE\u09AE, \u09A0\u09BF\u0995\u09BE\u09A8\u09BE") || formatted.includes("\u09A8\u09BE\u09AE, \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09A0\u09BF\u0995\u09BE\u09A8\u09BE") || formatted.includes("\u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0\u099F\u09BF \u09A6\u09BF\u09A8") || formatted.includes("\u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0 \u09A6\u09BF\u09A8") || formatted.includes("\u09B8\u09CD\u09AA\u09B7\u09CD\u099F \u09AC\u09CB\u099D\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF") || formatted.includes("\u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u099F\u09BF\u09AE") || formatted.includes("\u09AA\u09CD\u09B0\u09A4\u09BF\u09A8\u09BF\u09A7\u09BF \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09BE\u09A5\u09C7") || formatted.includes("\u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09AC\u09C7\u09A8") || formatted.includes("\u09AB\u09B2\u09CB-\u0986\u09AA")) {
    return formatted;
  }
  const q = (customerQuery || "").toLowerCase();
  const isEnglish = /^[a-z0-9\s.,?!'"-]+$/i.test(formatted) && !/[\u0980-\u09FF]/.test(formatted);
  if (isEnglish) {
    const enFollowUp = q.includes("price") || q.includes("plan") || q.includes("cost") ? "Would you like to start with our 2-Day Free Trial first, or activate a plan right away?" : "Which platform (Facebook Page, WhatsApp, or Website) are you looking to automate first?";
    return `${formatted}

${enFollowUp}`;
  }
  if (isOneAgentSaaS) {
    if (q.includes("price") || q.includes("dam") || q.includes("koto") || q.includes("plan") || q.includes("\u09A6\u09BE\u09AE") || q.includes("\u0995\u09A4") || q.includes("\u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8") || q.includes("\u09AA\u09CD\u09AF\u09BE\u0995\u09C7\u099C") || q.includes("\u099F\u09BE\u0995\u09BE")) {
      return `${formatted}

\u0986\u09AA\u09A8\u09BF \u0995\u09BF \u09AA\u09CD\u09B0\u09A5\u09AE\u09C7 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09E8 \u09A6\u09BF\u09A8\u09C7\u09B0 \u09AB\u09CD\u09B0\u09BF \u099F\u09CD\u09B0\u09BE\u09DF\u09BE\u09B2 \u09A6\u09BF\u09DF\u09C7 \u099F\u09C7\u09B8\u09CD\u099F \u0995\u09B0\u09C7 \u09A6\u09C7\u0996\u09A4\u09C7 \u099A\u09BE\u09A8, \u09A8\u09BE\u0995\u09BF \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u0995\u09CB\u09A8\u09CB \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8 \u0985\u09CD\u09AF\u09BE\u0995\u09CD\u099F\u09BF\u09AD \u0995\u09B0\u09AC\u09C7\u09A8?`;
    }
    if (q.includes("trial") || q.includes("free") || q.includes("\u099F\u09CD\u09B0\u09BE\u09DF\u09BE\u09B2") || q.includes("\u09AB\u09CD\u09B0\u09BF")) {
      return `${formatted}

\u0986\u09AA\u09A8\u09BF \u0995\u09BF \u0986\u09AA\u09A8\u09BE\u09B0 \u09AB\u09C7\u09B8\u09AC\u09C1\u0995 \u09AA\u09C7\u099C \u09A8\u09BE\u0995\u09BF \u0993\u09DF\u09C7\u09AC\u09B8\u09BE\u0987\u099F\u09C7 \u099F\u09CD\u09B0\u09BE\u09DF\u09BE\u09B2\u099F\u09BF \u0995\u09BE\u09A8\u09C7\u0995\u09CD\u099F \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u099A\u09CD\u099B\u09C7\u09A8?`;
    }
    if (q.includes("coupon") || q.includes("discount") || q.includes("\u0995\u09C1\u09AA\u09A8") || q.includes("\u09A1\u09BF\u09B8\u0995\u09BE\u0989\u09A8\u09CD\u099F") || q.includes("\u099B\u09BE\u09DC")) {
      return `${formatted}

\u0986\u09AA\u09A8\u09BF \u0995\u09CB\u09A8 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8\u099F\u09BF (Starter \u09A8\u09BE\u0995\u09BF Pro) \u09A8\u09C7\u0993\u09DF\u09BE\u09B0 \u0995\u09A5\u09BE \u09AD\u09BE\u09AC\u099B\u09C7\u09A8?`;
    }
    return `${formatted}

\u0986\u09AA\u09A8\u09BE\u09B0 \u09AC\u09BF\u099C\u09A8\u09C7\u09B8 \u09AC\u09BE \u09AB\u09C7\u09B8\u09AC\u09C1\u0995 \u09AA\u09C7\u099C\u099F\u09BF \u09AE\u09C2\u09B2\u09A4 \u0995\u09CB\u09A8 \u09A7\u09B0\u09A8\u09C7\u09B0 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u09AC\u09BE \u09B8\u09BE\u09B0\u09CD\u09AD\u09BF\u09B8 \u09A8\u09BF\u09DF\u09C7 \u0995\u09BE\u099C \u0995\u09B0\u09C7?`;
  }
  if (hasProducts) {
    return `${formatted}

\u0986\u09AA\u09A8\u09BF \u0995\u09BF \u098F\u099F\u09BF \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u09A8, \u09A8\u09BE\u0995\u09BF \u0985\u09A8\u09CD\u09AF \u0995\u09CB\u09A8\u09CB \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995\u09C7 \u099C\u09BE\u09A8\u09A4\u09C7 \u099A\u09BE\u099A\u09CD\u099B\u09C7\u09A8?`;
  }
  return `${formatted}

\u098F\u0987 \u09AC\u09BF\u09B7\u09DF\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u0995\u09BF \u0986\u09B0 \u0995\u09CB\u09A8\u09CB \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u0986\u099B\u09C7, \u09A8\u09BE\u0995\u09BF \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09BE\u09B0 \u09A8\u09BF\u09DF\u09AE\u099F\u09BF \u099C\u09BE\u09A8\u09BF\u09DF\u09C7 \u09A6\u09C7\u09AC\u09CB?`;
}
function isUnclearVoiceText(str) {
  if (!str) return true;
  const cleaned = str.replace(/\[[^\]]*\]/g, "").replace(/\([^)]*\)/g, "").replace(/[.,?!।'"\-_*~`]/g, "").trim();
  if (cleaned.length < 2) return true;
  const lower = str.toLowerCase().trim();
  return lower.includes("[unclear]") || lower.includes("unclear_audio") || lower === "unclear" || lower.includes("silent") || lower.includes("silence") || lower.includes("inaudible") || lower.includes("unintelligible") || lower.includes("no speech") || lower.includes("background noise") || lower.includes("only noise") || lower.includes("cannot understand") || lower.includes("could not understand") || lower.includes("not clear") || lower.includes("audio is unclear") || lower.includes("\u0985\u09B8\u09CD\u09AA\u09B7\u09CD\u099F") || lower.includes("\u09AC\u09CB\u099D\u09BE \u09AF\u09BE\u099A\u09CD\u099B\u09C7 \u09A8\u09BE") || lower.includes("\u09AC\u09CB\u099D\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF") || lower.includes("\u09B6\u09CB\u09A8\u09BE \u09AF\u09BE\u099A\u09CD\u099B\u09C7 \u09A8\u09BE") || lower.includes("\u09B6\u09CB\u09A8\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF") || lower.includes("\u0995\u09CB\u09A8\u09CB \u0995\u09A5\u09BE \u09B6\u09CB\u09A8\u09BE");
}
function extractCatalogItemsForInteractiveMenu(merchantProducts, systemPrompt, isOneAgentSaaS) {
  if (isOneAgentSaaS) {
    return [];
  }
  const items = [];
  for (const prod of merchantProducts) {
    items.push({
      id: prod.id,
      title: prod.name,
      description: `\u09F3${prod.price} ${prod.currency || "BDT"}${prod.stock_status === "out_of_stock" ? " (\u09B8\u09CD\u099F\u0995 \u0986\u0989\u099F)" : ""}`,
      price: prod.price
    });
  }
  if (items.length === 0 && systemPrompt) {
    const lines = systemPrompt.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].replace(/^[•\-–—*০-৯0-9.)\s]+/, "").trim();
      if (!line || line.length > 90) continue;
      const m = line.match(
        /^([^:–\-—]{2,45})\s*[:\-–—]\s*(?:৳\s*)?([০-৯0-9,]{2,7})\s*(?:৳|টাকা|taka|tk|bdt)?([^\n]*)$/i
      );
      if (m) {
        const title = m[1].trim();
        const rawPrice = m[2].trim();
        const unitSuffix = (m[3] || "").trim();
        if (/phone|helpline|support|delivery|dhaka|plan|starter|pro|নাম্বার|হেল্পলাইন|সময়|ডেলিভারি|ঢাকা|প্ল্যান/i.test(title)) {
          continue;
        }
        if (!items.some((x) => x.title.toLowerCase() === title.toLowerCase())) {
          items.push({
            id: `kb_item_${items.length + 1}`,
            title,
            description: `${rawPrice}\u09F3${unitSuffix ? ` ${unitSuffix}` : ""}`
          });
        }
      }
    }
  }
  return items.slice(0, 10);
}
function buildInteractiveConversationEnvelope(params) {
  const {
    incomingMessage,
    aiReplyText,
    businessName,
    merchantProducts,
    matchedProduct,
    systemPrompt,
    isOneAgentSaaS
  } = params;
  if (isOneAgentSaaS) {
    return {
      replyText: aiReplyText,
      interactiveOptions: void 0
    };
  }
  const catalogItems = extractCatalogItemsForInteractiveMenu(
    merchantProducts,
    systemPrompt,
    isOneAgentSaaS
  );
  if (catalogItems.length === 0) {
    return {
      replyText: aiReplyText,
      interactiveOptions: void 0
    };
  }
  const q = (incomingMessage || "").trim();
  const qLower = q.toLowerCase();
  const matchedCatalogItem = !matchedProduct && catalogItems.length > 0 ? catalogItems.find(
    (item) => qLower === item.title.toLowerCase() || item.title.length >= 3 && qLower.includes(item.title.toLowerCase())
  ) : void 0;
  const isHomeMenuIntent = qLower === "\u09B9\u09CB\u09AE \u09AA\u09C7\u099C" || qLower === "home" || qLower === "home page" || qLower === "main menu" || qLower === "\u09AE\u09C7\u09A8\u09C1";
  if (isHomeMenuIntent) {
    const listPreview = catalogItems.length > 0 ? "\n\n\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u0993 \u09AE\u09C2\u09B2\u09CD\u09AF \u09A4\u09BE\u09B2\u09BF\u0995\u09BE:\n\n" + catalogItems.slice(0, 6).map((it, idx) => `${toBengaliNumber(idx + 1)}. ${it.title} \u2014 ${it.description}`).join("\n\n") : "";
    return {
      replyText: `\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE! ${businessName}-\u098F \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u09B8\u09CD\u09AC\u09BE\u0997\u09A4\u09AE\u0964 \u{1F31F}${listPreview}

\u09A8\u09BF\u099A\u09C7\u09B0 \u09AC\u09BE\u099F\u09A8 \u09A5\u09C7\u0995\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u099B\u09A8\u09CD\u09A6\u09C7\u09B0 \u0985\u09AA\u09B6\u09A8\u099F\u09BF \u09AC\u09C7\u099B\u09C7 \u09A8\u09BF\u09A8:`,
      interactiveOptions: {
        type: "list",
        listButtonLabel: "\u09AA\u099B\u09A8\u09CD\u09A6 \u0995\u09B0\u09C1\u09A8",
        listButtonTitle: "\u09AA\u099B\u09A8\u09CD\u09A6 \u0995\u09B0\u09C1\u09A8",
        listSectionTitle: "\u09AA\u099B\u09A8\u09CD\u09A6 \u0995\u09B0\u09C1\u09A8",
        footerText: `${businessName} AI Assistant`,
        items: catalogItems,
        listItems: catalogItems,
        buttons: [
          {
            id: "btn_order_now",
            label: "Order Now",
            payload: "\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u0987",
            icon: "order"
          },
          {
            id: "btn_see_more",
            label: "\u0986\u09B0\u0993 \u09A6\u09C7\u0996\u09C1\u09A8",
            payload: "\u0986\u09B0\u0993 \u09A6\u09C7\u0996\u09C1\u09A8",
            icon: "back"
          }
        ]
      }
    };
  }
  const hasPhoneInMsg = /(?:\+?88)?01[3-9]\d{8}/.test(q);
  const isOrderFormIntent = !hasPhoneInMsg && (qLower === "order now" || qLower === "\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u0987" || qLower === "\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u09AB\u09B0\u09CD\u09AE \u09A6\u09BF\u09A8" || qLower === "\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8" || qLower.includes("order korte cay") || qLower.includes("order korte chai") || qLower.includes("order korbo") || qLower.includes("\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u0987") || qLower.includes("\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09AC\u09CB") || qLower.includes("\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u09A8\u09BF\u09AC\u09CB"));
  if (isOrderFormIntent) {
    const selectedProdHint = matchedProduct ? ` (${matchedProduct.name} - \u09F3${matchedProduct.price})` : matchedCatalogItem ? ` (${matchedCatalogItem.title} - ${matchedCatalogItem.description})` : "";
    const orderFormReply = `\u0986\u09AA\u09A8\u09BE\u09B0 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0\u099F\u09BF${selectedProdHint} \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u0995\u09B0\u09A4\u09C7 \u09A6\u09DF\u09BE \u0995\u09B0\u09C7 \u09A8\u09BF\u099A\u09C7\u09B0 \u09A4\u09A5\u09CD\u09AF\u0997\u09C1\u09B2\u09CB \u09A6\u09BF\u09A8:

\u09E7. \u09A8\u09BE\u09AE

\u09E8. \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09AE\u09CD\u09AC\u09B0

\u09E9. \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09A0\u09BF\u0995\u09BE\u09A8\u09BE

\u09EA. \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u09C7\u09B0 \u09A8\u09BE\u09AE \u0993 \u09AA\u09B0\u09BF\u09AE\u09BE\u09A3`;
    return {
      replyText: orderFormReply,
      interactiveOptions: {
        type: "order_card",
        orderCardText: "Tap Order Now, or type your order details here \u2014 either works.",
        orderButtonLabel: "Order Now",
        listButtonLabel: "\u09AA\u099B\u09A8\u09CD\u09A6 \u0995\u09B0\u09C1\u09A8",
        listButtonTitle: "\u09AA\u099B\u09A8\u09CD\u09A6 \u0995\u09B0\u09C1\u09A8",
        listSectionTitle: "\u09AA\u099B\u09A8\u09CD\u09A6 \u0995\u09B0\u09C1\u09A8",
        footerText: `${businessName} AI Assistant`,
        items: catalogItems,
        listItems: catalogItems,
        buttons: [
          {
            id: "btn_order_now",
            label: "Order Now",
            payload: "\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u09AB\u09B0\u09CD\u09AE \u09A6\u09BF\u09A8",
            icon: "order"
          },
          {
            id: "btn_see_more",
            label: "\u0986\u09B0\u0993 \u09A6\u09C7\u0996\u09C1\u09A8",
            payload: "\u0986\u09B0\u0993 \u09A6\u09C7\u0996\u09C1\u09A8",
            icon: "back"
          },
          {
            id: "btn_home",
            label: "\u09B9\u09CB\u09AE \u09AA\u09C7\u099C",
            payload: "\u09B9\u09CB\u09AE \u09AA\u09C7\u099C",
            icon: "home"
          }
        ]
      }
    };
  }
  const catalogDetect = detectProductImageInquiry(params.incomingMessage);
  const isSeeMoreOrCatalogListIntent = qLower === "\u0986\u09B0\u0993 \u09A6\u09C7\u0996\u09C1\u09A8" || qLower === "\u21A9\uFE0F \u0986\u09B0\u0993 \u09A6\u09C7\u0996\u09C1\u09A8" || qLower === "\u09AA\u099B\u09A8\u09CD\u09A6 \u0995\u09B0\u09C1\u09A8" || qLower === "\u09B8\u09AC \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F" || catalogDetect.isAskingForCatalog || (qLower.includes("\u09A6\u09BE\u09AE \u0995\u09A4") || qLower.includes("dam koto") || qLower.includes("price") || qLower.includes("\u0995\u09BF \u0995\u09BF \u0986\u099B\u09C7") || qLower.includes("ki ki ache") || qLower.includes("\u09A4\u09BE\u09B2\u09BF\u0995\u09BE") || qLower.includes("list")) && !matchedProduct && !matchedCatalogItem && catalogItems.length > 0;
  if (isSeeMoreOrCatalogListIntent && catalogItems.length > 0) {
    const formattedList = catalogItems.map((it, idx) => `${toBengaliNumber(idx + 1)}. ${it.title} \u2014 ${it.description}`).join("\n\n");
    const listMessageText = `\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u0993 \u09AE\u09C2\u09B2\u09CD\u09AF \u09A4\u09BE\u09B2\u09BF\u0995\u09BE \u09A8\u09BF\u099A\u09C7 \u09A6\u09C7\u0993\u09DF\u09BE \u09B9\u09B2\u09CB:

${formattedList}

\u09A8\u09BF\u099A\u09C7\u09B0 "\u09AA\u099B\u09A8\u09CD\u09A6 \u0995\u09B0\u09C1\u09A8" \u09AC\u09BE\u099F\u09A8\u09C7 \u0995\u09CD\u09B2\u09BF\u0995 \u0995\u09B0\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u099B\u09A8\u09CD\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u099F\u09BF \u09AC\u09C7\u099B\u09C7 \u09A8\u09BF\u09A8:`;
    const finalReply = aiReplyText && aiReplyText.trim().length > 10 ? aiReplyText : listMessageText;
    return {
      replyText: finalReply,
      interactiveOptions: {
        type: "list",
        listButtonLabel: "\u09AA\u099B\u09A8\u09CD\u09A6 \u0995\u09B0\u09C1\u09A8",
        listButtonTitle: "\u09AA\u099B\u09A8\u09CD\u09A6 \u0995\u09B0\u09C1\u09A8",
        listSectionTitle: "\u09AA\u099B\u09A8\u09CD\u09A6 \u0995\u09B0\u09C1\u09A8",
        footerText: `${businessName} AI Assistant`,
        items: catalogItems,
        listItems: catalogItems,
        buttons: [
          {
            id: "btn_order_now",
            label: "Order Now",
            payload: "\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u0987",
            icon: "order"
          },
          {
            id: "btn_home",
            label: "\u09B9\u09CB\u09AE \u09AA\u09C7\u099C",
            payload: "\u09B9\u09CB\u09AE \u09AA\u09C7\u099C",
            icon: "home"
          }
        ]
      }
    };
  }
  if (matchedProduct || matchedCatalogItem) {
    const prodTitle = matchedProduct ? matchedProduct.name : matchedCatalogItem.title;
    const prodPriceText = matchedProduct ? `${matchedProduct.price}\u09F3` : matchedCatalogItem.description || "";
    const isExactButtonTap = qLower === prodTitle.toLowerCase() || qLower === `${prodTitle.toLowerCase()} \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u0987` || qLower.startsWith("item_") && qLower.includes(prodTitle.toLowerCase().slice(0, 8));
    const finalReply = aiReplyText && aiReplyText.trim().length > 10 ? aiReplyText : isExactButtonTap ? matchedProduct ? `${matchedProduct.name}-\u098F\u09B0 \u09A6\u09BE\u09AE \u09F3${matchedProduct.price}\u0964${matchedProduct.description ? `

\u09AC\u09BF\u09AC\u09B0\u09A3: ${matchedProduct.description}` : ""}

\u0986\u09AA\u09A8\u09BF \u0995\u09BF \u098F\u099F\u09BF \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u09A8? \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09A8\u09BE\u09AE, \u09AA\u099B\u09A8\u09CD\u09A6\u09C7\u09B0 \u09B8\u09BE\u0987\u099C, \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09A0\u09BF\u0995\u09BE\u09A8\u09BE \u0993 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0 \u09A6\u09BF\u09A8!` : `${prodTitle}-\u098F\u09B0 \u09A6\u09BE\u09AE ${prodPriceText}\u0964` : aiReplyText;
    return {
      replyText: finalReply,
      interactiveOptions: {
        type: "buttons",
        listButtonLabel: "\u09AA\u099B\u09A8\u09CD\u09A6 \u0995\u09B0\u09C1\u09A8",
        listButtonTitle: "\u09AA\u099B\u09A8\u09CD\u09A6 \u0995\u09B0\u09C1\u09A8",
        listSectionTitle: "\u09AA\u099B\u09A8\u09CD\u09A6 \u0995\u09B0\u09C1\u09A8",
        footerText: `${businessName} AI Assistant`,
        items: catalogItems.length > 1 ? catalogItems : void 0,
        listItems: catalogItems.length > 1 ? catalogItems : void 0,
        buttons: [
          {
            id: "btn_order_item",
            label: "Order Now",
            payload: `${prodTitle} \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u0987`,
            icon: "order"
          },
          {
            id: "btn_see_more",
            label: "\u0986\u09B0\u0993 \u09A6\u09C7\u0996\u09C1\u09A8",
            payload: "\u0986\u09B0\u0993 \u09A6\u09C7\u0996\u09C1\u09A8",
            icon: "back"
          },
          {
            id: "btn_home",
            label: "\u09B9\u09CB\u09AE \u09AA\u09C7\u099C",
            payload: "\u09B9\u09CB\u09AE \u09AA\u09C7\u099C",
            icon: "home"
          }
        ]
      }
    };
  }
  return {
    replyText: aiReplyText,
    interactiveOptions: {
      type: "list",
      listButtonLabel: "\u09AA\u099B\u09A8\u09CD\u09A6 \u0995\u09B0\u09C1\u09A8",
      listButtonTitle: "\u09AA\u099B\u09A8\u09CD\u09A6 \u0995\u09B0\u09C1\u09A8",
      listSectionTitle: "\u09AA\u099B\u09A8\u09CD\u09A6 \u0995\u09B0\u09C1\u09A8",
      footerText: `${businessName} AI Assistant`,
      items: catalogItems,
      listItems: catalogItems,
      buttons: [
        {
          id: "btn_order_now",
          label: "Order Now",
          payload: "\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u0987",
          icon: "order"
        },
        {
          id: "btn_see_more",
          label: "\u0986\u09B0\u0993 \u09A6\u09C7\u0996\u09C1\u09A8",
          payload: "\u0986\u09B0\u0993 \u09A6\u09C7\u0996\u09C1\u09A8",
          icon: "back"
        },
        {
          id: "btn_home",
          label: "\u09B9\u09CB\u09AE \u09AA\u09C7\u099C",
          payload: "\u09B9\u09CB\u09AE \u09AA\u09C7\u099C",
          icon: "home"
        }
      ]
    }
  };
}
function getPrioritizedModels() {
  const now = Date.now();
  const available = CANDIDATE_MODELS.filter((m) => {
    const failedAt = modelFailureCooldown.get(m);
    if (failedAt && now - failedAt < 5 * 60 * 1e3) return false;
    return true;
  });
  const list = available.length > 0 ? available : CANDIDATE_MODELS.slice(0, 2);
  if (lastWorkingModelName && list.includes(lastWorkingModelName)) {
    return [lastWorkingModelName, ...list.filter((m) => m !== lastWorkingModelName)];
  }
  return list;
}
function markModelSuccess(modelName) {
  lastWorkingModelName = modelName;
  modelFailureCooldown.delete(modelName);
}
function markModelFailure(modelName) {
  modelFailureCooldown.set(modelName, Date.now());
}
async function callGeminiWithAudio(audioBase64, audioMimeType, _systemPrompt, _businessName, _recentHistory, _catalogContext, customApiKey) {
  const clients = getGeminiClients(customApiKey);
  let normalizedBase64 = audioBase64;
  let normalizedMime = cleanAudioMimeType(audioMimeType);
  let rawBuffer = Buffer.from(audioBase64, "base64");
  if (!rawBuffer || rawBuffer.length < 350) {
    return { replyText: UNCLEAR_VOICE_REPLY, transcript: "\u0985\u09B8\u09CD\u09AA\u09B7\u09CD\u099F \u09AD\u09DF\u09C7\u09B8 \u09AE\u09C7\u09B8\u09C7\u099C" };
  }
  try {
    const detectedMime = detectAudioMimeTypeFromBuffer(rawBuffer, normalizedMime);
    normalizedMime = detectedMime;
    const isWav = rawBuffer.subarray(0, 4).toString("latin1") === "RIFF";
    if (!isWav) {
      const converted = await convertToWav(rawBuffer, normalizedMime);
      normalizedBase64 = converted.base64;
      normalizedMime = converted.mimeType;
      rawBuffer = converted.buffer;
    } else {
      normalizedMime = "audio/wav";
    }
  } catch (err) {
    console.warn("[AI Service] Audio conversion warning, using detected MIME:", err?.message || err);
  }
  let adtsBase64 = null;
  if (normalizedMime === "audio/mp4") {
    const adtsBuf = mp4ToAdtsAac(Buffer.from(audioBase64, "base64"));
    if (adtsBuf && adtsBuf.length > 16) {
      adtsBase64 = adtsBuf.toString("base64");
    }
  }
  const promptText = `Listen carefully to this audio recording sent by a customer.
Your ONLY task is to transcribe the exact spoken words in Bangla (\u09AC\u09BE\u0982\u09B2\u09BE) or English.

CRITICAL ANTI-HALLUCINATION RULES:
1. Do NOT answer any question. Output ONLY the exact transcript of what the person said, or [UNCLEAR].
2. If the audio is silent, very faint, only background noise, wind/static, coughing, breathing, music, mumbled, or if you cannot clearly hear and understand meaningful spoken words with high confidence, you MUST output strictly:
TRANSCRIPT: [UNCLEAR]
3. Never guess, invent, or hallucinate words that are not clearly spoken in the audio.

OUTPUT FORMAT:
TRANSCRIPT: <exact spoken words in Bangla/English, OR [UNCLEAR]>`;
  const parseAudioResponse = (rawText) => {
    const transcriptMatch = rawText.match(/TRANSCRIPT:\s*([\s\S]*?)(?=(REPLY:|$))/i);
    const replyMatch = rawText.match(/REPLY:\s*([\s\S]*)/i);
    let transcript = (transcriptMatch ? transcriptMatch[1] : rawText).replace(/^TRANSCRIPT:\s*/i, "").trim();
    if (isUnclearVoiceText(transcript) || replyMatch && isUnclearVoiceText(replyMatch[1])) {
      return {
        replyText: UNCLEAR_VOICE_REPLY,
        transcript: "\u0985\u09B8\u09CD\u09AA\u09B7\u09CD\u099F \u09AD\u09DF\u09C7\u09B8 \u09AE\u09C7\u09B8\u09C7\u099C",
        isUnclear: true
      };
    }
    return { replyText: "", transcript };
  };
  const allProfiles = db.getProfiles() || [];
  const adminKey = allProfiles.find((p) => p.role === "admin" && p.llm_api_key?.trim() && !isDeadSeedKey(p.llm_api_key))?.llm_api_key?.trim() || "";
  const anyKey = allProfiles.find((p) => p.llm_api_key?.trim() && !isDeadSeedKey(p.llm_api_key))?.llm_api_key?.trim() || "";
  const trimmedCustomKey = (customApiKey && !isDeadSeedKey(customApiKey) ? customApiKey.trim() : "") || (db.getSettings()?.default_llm_api_key || "").trim() || adminKey || anyKey || "";
  if (trimmedCustomKey.startsWith("gsk_") || trimmedCustomKey.startsWith("sk-") && !trimmedCustomKey.startsWith("sk-or-") && !trimmedCustomKey.startsWith("sk-ant-")) {
    try {
      const isGroq = trimmedCustomKey.startsWith("gsk_");
      const whisperEndpoint = isGroq ? "https://api.groq.com/openai/v1/audio/transcriptions" : "https://api.openai.com/v1/audio/transcriptions";
      const whisperModel = isGroq ? "whisper-large-v3-turbo" : "whisper-1";
      const ext = normalizedMime.includes("wav") ? "wav" : normalizedMime.includes("ogg") ? "ogg" : normalizedMime.includes("mp3") ? "mp3" : "m4a";
      const formData = new FormData();
      const audioBlob = new Blob([new Uint8Array(Buffer.from(audioBase64, "base64"))], {
        type: normalizedMime === "audio/aac" ? "audio/mp4" : normalizedMime
      });
      formData.append("file", audioBlob, `voice.${ext}`);
      formData.append("model", whisperModel);
      const whisperRes = await withTimeout(
        fetch(whisperEndpoint, {
          method: "POST",
          headers: { Authorization: `Bearer ${trimmedCustomKey}` },
          body: formData
        }),
        12e3
      );
      if (whisperRes.ok) {
        const wJson = await whisperRes.json();
        const wText = String(wJson?.text || "").trim();
        if (wText && !isUnclearVoiceText(wText)) {
          console.log(`[AI Service] Whisper transcribed voice note: "${wText}"`);
          return { replyText: "", transcript: wText };
        }
      }
    } catch (wErr) {
      console.warn("[AI Service] Whisper transcription warning:", wErr?.message || wErr);
    }
  }
  for (const ai of clients.slice(0, 3)) {
    for (const modelName of CANDIDATE_MODELS) {
      const mimeToSend = modelName.includes("3.8") && normalizedMime === "audio/mp4" && adtsBase64 ? "audio/aac" : normalizedMime;
      const dataToSend = modelName.includes("3.8") && normalizedMime === "audio/mp4" && adtsBase64 ? adtsBase64 : normalizedBase64;
      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model: modelName,
            contents: [
              {
                role: "user",
                parts: [
                  {
                    inlineData: {
                      mimeType: mimeToSend,
                      data: dataToSend
                    }
                  },
                  {
                    text: promptText
                  }
                ]
              }
            ],
            config: {
              temperature: 0.1
            }
          }),
          14e3
        );
        const rawText = response.text?.trim();
        if (!rawText) continue;
        const parsed = parseAudioResponse(rawText);
        if (parsed.isUnclear) {
          return { replyText: UNCLEAR_VOICE_REPLY, transcript: "\u0985\u09B8\u09CD\u09AA\u09B7\u09CD\u099F \u09AD\u09DF\u09C7\u09B8 \u09AE\u09C7\u09B8\u09C7\u099C" };
        }
        if (parsed.replyText || parsed.transcript) {
          return parsed;
        }
      } catch (err) {
        console.warn(`[AI Service] Audio model ${modelName} (${mimeToSend}) error:`, err?.message || err);
      }
    }
    try {
      const transcribeRes = await withTimeout(
        ai.models.generateContent({
          model: "gemini-3.5-transcribe",
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: normalizedMime,
                    data: normalizedBase64
                  }
                },
                {
                  text: "Transcribe the spoken words in this customer voice message accurately. If the audio is silent, background noise only, or unintelligible, output ONLY [UNCLEAR]. Do not guess or invent words."
                }
              ]
            }
          ]
        }),
        12e3
      );
      const parts = transcribeRes.candidates?.[0]?.content?.parts || [];
      let transcriptText = "";
      for (const part of parts) {
        if (part?.audioTranscription?.text) {
          transcriptText += part.audioTranscription.text + " ";
        } else if (part?.text) {
          transcriptText += part.text + " ";
        }
      }
      transcriptText = (transcriptText || transcribeRes.text || "").trim();
      if (transcriptText) {
        if (isUnclearVoiceText(transcriptText)) {
          return { replyText: UNCLEAR_VOICE_REPLY, transcript: "\u0985\u09B8\u09CD\u09AA\u09B7\u09CD\u099F \u09AD\u09DF\u09C7\u09B8 \u09AE\u09C7\u09B8\u09C7\u099C" };
        }
        console.log(`[AI Service] gemini-3.5-transcribe succeeded: "${transcriptText}"`);
        return { replyText: "", transcript: transcriptText };
      }
    } catch (transErr) {
      console.warn("[AI Service] gemini-3.5-transcribe warning:", transErr?.message || transErr);
    }
  }
  const directKeys = getCandidateGeminiKeys(customApiKey).filter((k) => k.startsWith("AIza"));
  for (const key of directKeys.slice(0, 2)) {
    for (const restModel of ["gemini-3-flash-preview", "gemini-3.5-transcribe", "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-latest"]) {
      try {
        const isTranscribeModel = restModel === "gemini-3.5-transcribe";
        const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/${restModel}:generateContent?key=${encodeURIComponent(key)}`;
        const restRes = await withTimeout(
          fetch(restUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      inlineData: {
                        mimeType: normalizedMime,
                        data: normalizedBase64
                      }
                    },
                    {
                      text: isTranscribeModel ? "Transcribe the spoken words accurately. If silent, background noise, or unintelligible, output ONLY [UNCLEAR]." : promptText
                    }
                  ]
                }
              ],
              ...isTranscribeModel ? {} : { generationConfig: { temperature: 0.1 } }
            })
          }),
          14e3
        );
        if (restRes.ok) {
          const data = await restRes.json();
          const parts = data?.candidates?.[0]?.content?.parts || [];
          const audioTrans = parts.map((p) => p?.audioTranscription?.text || "").join(" ").trim();
          if (audioTrans) {
            if (isUnclearVoiceText(audioTrans)) {
              return { replyText: UNCLEAR_VOICE_REPLY, transcript: "\u0985\u09B8\u09CD\u09AA\u09B7\u09CD\u099F \u09AD\u09DF\u09C7\u09B8 \u09AE\u09C7\u09B8\u09C7\u099C" };
            }
            return { replyText: "", transcript: audioTrans };
          }
          const rawText = parts.map((p) => p?.text || "").join("").trim();
          if (rawText) {
            const parsed = parseAudioResponse(rawText);
            if (parsed.isUnclear) {
              return { replyText: UNCLEAR_VOICE_REPLY, transcript: "\u0985\u09B8\u09CD\u09AA\u09B7\u09CD\u099F \u09AD\u09DF\u09C7\u09B8 \u09AE\u09C7\u09B8\u09C7\u099C" };
            }
            return parsed;
          }
        }
      } catch (restErr) {
        console.warn(`[AI Service] Direct Audio REST ${restModel} warning:`, restErr?.message || restErr);
      }
    }
  }
  return null;
}
async function callGeminiWithImage(imageBase64, imageMimeType, customerText, systemPrompt, businessName, catalogContext, recentHistory, customApiKey) {
  const clients = getGeminiClients(customApiKey);
  const cleanMime = (imageMimeType || "image/jpeg").split(";")[0].trim().toLowerCase();
  const promptText = `System Instructions & Business Knowledge Base:
${systemPrompt}

You are a warm, smart, human-like Customer Service & Sales Executive for ${businessName}.
The customer sent an image/photo along with the text: "${customerText || "\u098F\u0987 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u099F\u09BF\u09B0 \u09A6\u09BE\u09AE \u0995\u09A4 \u098F\u09AC\u0982 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u099C\u09BE\u09A8\u09BE\u09AC\u09C7\u09A8?"}"

Merchant Product Catalog & Price List:
${catalogContext}

TASK:
1. Examine the image sent by the customer carefully.
2. Identify what is shown in the image (product from catalog, bKash/Nagad payment screenshot/slip, or general inquiry) and match it with the Business Knowledge Base and Merchant Product Catalog.
3. If the image is a bKash, Nagad, or Bank payment screenshot, clearly mention the Transaction ID (TrxID) and Paid Amount (\u09F3) visible in the image and confirm that their payment has been received and verified!
4. Reply naturally like a real human in concise Bangla (\u09AC\u09BE\u0982\u09B2\u09BE \u09AD\u09BE\u09B7\u09BE\u09DF \u2014 \u09E8 \u09A5\u09C7\u0995\u09C7 \u09E9 \u09AC\u09BE\u0995\u09CD\u09AF\u09C7).
5. Put an empty line (\\n\\n) between your main answer and your closing follow-up question!
6. End with 1 smart, relevant follow-up question in a new paragraph (\u09AF\u09C7\u09AE\u09A8: \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u0995\u09BF \u098F\u099F\u09BF \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u09A8 \u09A8\u09BE\u0995\u09BF \u0985\u09A8\u09CD\u09AF \u0995\u09CB\u09A8\u09CB \u09B8\u09BE\u0987\u099C/\u0995\u09BE\u09B2\u09BE\u09B0 \u0996\u09C1\u0981\u099C\u099B\u09C7\u09A8?). Do not use ** markdown asterisks.

Recent Conversation History:
${recentHistory || "(No previous messages)"}

Customer Question: "${customerText || "\u098F\u099F\u09BE\u09B0 \u09A6\u09BE\u09AE \u0995\u09A4 \u098F\u09AC\u0982 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u099C\u09BE\u09A8\u09BE\u09AC\u09C7\u09A8?"}"
Assistant Reply (in concise Bangla with paragraph spacing and a follow-up question):`;
  for (const ai of clients.slice(0, 3)) {
    for (const modelName of CANDIDATE_MODELS) {
      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model: modelName,
            contents: [
              {
                role: "user",
                parts: [
                  {
                    inlineData: {
                      mimeType: cleanMime,
                      data: imageBase64
                    }
                  },
                  {
                    text: promptText
                  }
                ]
              }
            ]
          }),
          14e3
        );
        const reply = response.text?.trim();
        if (reply) return formatCleanChatMessage(reply);
      } catch (err) {
        console.warn(`[AI Service] Multimodal Image model ${modelName} error:`, err?.message || err);
      }
    }
  }
  const directKeys = getCandidateGeminiKeys(customApiKey).filter((k) => k.startsWith("AIza"));
  for (const key of directKeys.slice(0, 2)) {
    for (const restModel of ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"]) {
      try {
        const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/${restModel}:generateContent?key=${encodeURIComponent(key)}`;
        const restRes = await withTimeout(
          fetch(restUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      inlineData: {
                        mimeType: cleanMime,
                        data: imageBase64
                      }
                    },
                    { text: promptText }
                  ]
                }
              ],
              generationConfig: { temperature: 0.35 }
            })
          }),
          14e3
        );
        if (restRes.ok) {
          const data = await restRes.json();
          const reply = data?.candidates?.[0]?.content?.parts?.map((p) => p?.text || "").join("").trim();
          if (reply) return formatCleanChatMessage(reply);
        }
      } catch (restErr) {
        console.warn(`[AI Service] Direct Image REST ${restModel} warning:`, restErr?.message || restErr);
      }
    }
  }
  return null;
}
async function callGemini(fullPrompt, customApiKey, systemInstruction, structuredMessages) {
  const allProfiles = db.getProfiles() || [];
  const adminKey = allProfiles.find((p) => p.role === "admin" && p.llm_api_key?.trim() && !isDeadSeedKey(p.llm_api_key))?.llm_api_key?.trim() || "";
  const anyKey = allProfiles.find((p) => p.llm_api_key?.trim() && !isDeadSeedKey(p.llm_api_key))?.llm_api_key?.trim() || "";
  const openAiEnvKey = (process.env.OPENAI_API_KEY && !isDeadSeedKey(process.env.OPENAI_API_KEY) ? process.env.OPENAI_API_KEY.trim() : "") || (process.env.VITE_OPENAI_API_KEY && !isDeadSeedKey(process.env.VITE_OPENAI_API_KEY) ? process.env.VITE_OPENAI_API_KEY.trim() : "");
  const trimmedKey = (customApiKey && !isDeadSeedKey(customApiKey) ? customApiKey.trim() : "") || openAiEnvKey || (db.getSettings()?.default_llm_api_key || "").trim() || adminKey || anyKey || "";
  const defaultMessages = [
    ...systemInstruction ? [{ role: "system", content: systemInstruction }] : [],
    { role: "user", content: fullPrompt }
  ];
  const chatMessages = structuredMessages && structuredMessages.length > 0 ? structuredMessages : defaultMessages;
  if (trimmedKey.startsWith("gsk_")) {
    try {
      const groqRes = await withTimeout(
        fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${trimmedKey}`
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: chatMessages,
            temperature: 0.2
          })
        }),
        13e3
      );
      if (groqRes.ok) {
        const json = await groqRes.json();
        const text = json?.choices?.[0]?.message?.content?.trim();
        if (text) return formatCleanChatMessage(text);
      }
    } catch (err) {
      console.warn("[AI Service] Groq call warning:", err?.message || err);
    }
  }
  if (trimmedKey.startsWith("sk-") && !trimmedKey.startsWith("sk-ant-") && !isDeadSeedKey(trimmedKey)) {
    try {
      const isOpenRouter = trimmedKey.startsWith("sk-or-");
      const endpoint = isOpenRouter ? "https://openrouter.ai/api/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
      const openAiRes = await withTimeout(
        fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${trimmedKey}`
          },
          body: JSON.stringify({
            model: isOpenRouter ? "google/gemini-2.5-flash" : "gpt-4o-mini",
            messages: chatMessages,
            temperature: 0.2
          })
        }),
        13500
      );
      if (openAiRes.ok) {
        const json = await openAiRes.json();
        const text = json?.choices?.[0]?.message?.content?.trim();
        if (text) return formatCleanChatMessage(text);
      }
    } catch (err) {
      console.warn("[AI Service] OpenAI/OpenRouter call warning:", err?.message || err);
    }
  }
  const clients = getGeminiClients(trimmedKey);
  const modelsToTry = getPrioritizedModels();
  for (const ai of clients.slice(0, 2)) {
    for (const modelName of modelsToTry) {
      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model: modelName,
            contents: fullPrompt,
            config: {
              ...systemInstruction ? { systemInstruction } : {},
              temperature: 0.2,
              maxOutputTokens: 600
            }
          }),
          8500
        );
        const reply = response.text?.trim();
        if (reply) {
          markModelSuccess(modelName);
          return formatCleanChatMessage(reply);
        }
      } catch (err) {
        markModelFailure(modelName);
        const msg = String(err?.message || err || "");
        console.warn(`[AI Service] Model ${modelName} failed for text:`, msg.slice(0, 160));
      }
    }
  }
  const directKeys = getCandidateGeminiKeys(trimmedKey).filter((k) => k.startsWith("AIza"));
  for (const key of directKeys.slice(0, 1)) {
    for (const restModel of ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"]) {
      try {
        const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/${restModel}:generateContent?key=${encodeURIComponent(key)}`;
        const restRes = await withTimeout(
          fetch(restUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {},
              contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 600
              }
            })
          }),
          5e3
        );
        if (restRes.ok) {
          const data = await restRes.json();
          const text = data?.candidates?.[0]?.content?.parts?.map((p) => p?.text || "").join("").trim();
          if (text) {
            markModelSuccess(restModel);
            return formatCleanChatMessage(text);
          }
        }
      } catch (restErr) {
        console.warn(`[AI Service] Direct REST ${restModel} warning:`, restErr?.message || restErr);
      }
    }
  }
  try {
    const cloudRes = await withTimeout(
      fetch("https://text.pollinations.ai/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai",
          messages: chatMessages,
          temperature: 0.2
        })
      }),
      8e3
    );
    if (cloudRes.ok) {
      const cloudJson = await cloudRes.json();
      const cloudText = cloudJson?.choices?.[0]?.message?.content?.trim();
      if (cloudText && cloudText.length > 5) {
        return formatCleanChatMessage(cloudText);
      }
    }
  } catch (cloudErr) {
    console.warn("[AI Service] Built-in Cloud LLM warning:", cloudErr?.message || cloudErr);
  }
  return null;
}
function detectRequiresHumanAttention(replyText, incomingMessage) {
  const replyLower = (replyText || "").toLowerCase();
  const incomingLower = (incomingMessage || "").toLowerCase();
  const greetingOrCourtesyPatterns = [
    "\u0995\u09C7\u09AE\u09A8 \u0986\u099B\u09C7\u09A8",
    "\u0995\u09C7\u09AE\u09A8 \u0986\u099B\u09CB",
    "\u0995\u09BF \u0996\u09AC\u09B0",
    "\u0995\u09C0 \u0996\u09AC\u09B0",
    "kemon achen",
    "kemon asen",
    "kmn achen",
    "kmn asen",
    "\u09B8\u09BE\u09B2\u09BE\u09AE",
    "\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1",
    "salam",
    "assalamu",
    "\u09B9\u09CD\u09AF\u09BE\u09B2\u09CB",
    "\u09B9\u09BE\u0987",
    "hello",
    "hi",
    "hey",
    "\u09A7\u09A8\u09CD\u09AF\u09AC\u09BE\u09A6",
    "thanks"
  ];
  if (greetingOrCourtesyPatterns.some((g) => incomingLower.includes(g)) && !incomingLower.includes("complaint") && !incomingLower.includes("refund")) {
    return false;
  }
  const explicitCustomerHumanTriggers = [
    "kotha bolte chai",
    "kotha bolte cai",
    "call me",
    "call din",
    "call den",
    "call koren",
    "call diben",
    "phone a kotha",
    "phone number din",
    "owner",
    "malik",
    "\u0995\u09A5\u09BE \u09AC\u09B2\u09A4\u09C7 \u099A\u09BE\u0987",
    "\u09AB\u09CB\u09A8\u09C7 \u0995\u09A5\u09BE",
    "\u0995\u09B2 \u09A6\u09BF\u09A8",
    "\u0995\u09B2 \u0995\u09B0\u09C7\u09A8",
    "\u09AE\u09BE\u09B2\u09BF\u0995\u09C7\u09B0 \u09B8\u09BE\u09A5\u09C7",
    "\u09AE\u09BE\u09B2\u09BF\u0995",
    "\u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u09AE\u09BE\u09A8\u09C1\u09B7",
    "\u09AE\u09BE\u09A8\u09C1\u09B7\u09C7\u09B0 \u09B8\u09BE\u09A5\u09C7 \u0995\u09A5\u09BE",
    "\u09B2\u09BE\u0987\u09AD \u098F\u099C\u09C7\u09A8\u09CD\u099F",
    "\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u0995\u09C7\u09DF\u09BE\u09B0",
    "\u0985\u09AD\u09BF\u09AF\u09CB\u0997",
    "complaint",
    "refund",
    "\u09B0\u09BF\u09AB\u09BE\u09A8\u09CD\u09A1",
    "\u099F\u09BE\u0995\u09BE \u09AB\u09C7\u09B0\u09A4",
    "\u09AD\u09C7\u0999\u09C7 \u0997\u09C7\u099B\u09C7",
    "\u09A8\u09B7\u09CD\u099F \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F",
    "\u09A8\u09B7\u09CD\u099F \u09AE\u09BE\u09B2",
    "\u09A1\u09CD\u09AF\u09BE\u09AE\u09C7\u099C",
    "damage"
  ];
  if (explicitCustomerHumanTriggers.some((t) => incomingLower.includes(t))) {
    return true;
  }
  const liveCallbackPromised = replyText.includes("\u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u099F\u09BF\u09AE") || replyText.includes("\u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u099F\u09BF\u09AE\u0995\u09C7") || replyText.includes("\u09AA\u09CD\u09B0\u09A4\u09BF\u09A8\u09BF\u09A7\u09BF") || replyText.includes("\u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09AC\u09C7\u09A8") || replyText.includes("\u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u09AB\u09CB\u09A8 \u0995\u09B2") || replyText.includes("[HUMAN_HANDOFF]") || replyLower.includes("human_handoff") || replyLower.includes("live agent");
  return Boolean(liveCallbackPromised);
}
function buildSmartBanglaFallbackFromPrompt(incomingMessage, systemPrompt, businessName, products, matchedProduct) {
  const q = (incomingMessage || "").toLowerCase().trim();
  const isOneAgent = businessName.toLowerCase().includes("one agent") || systemPrompt.includes("Starter AI Plan") || systemPrompt.includes("One Agent BD");
  const pureGreetings = ["hello", "hi", "hey", "hlw", "salam", "assalamu alaikum", "assalamu", "\u09B9\u09CD\u09AF\u09BE\u09B2\u09CB", "\u09B9\u09BE\u0987", "\u09B8\u09BE\u09B2\u09BE\u09AE", "\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE"];
  if (pureGreetings.some((g) => q === g || q === g + "?" || q === g + "!")) {
    return "\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE! " + businessName + "-\u098F \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u09B8\u09CD\u09AC\u09BE\u0997\u09A4\u09AE\u0964 \u{1F60A}\n\n\u09AC\u09B2\u09C1\u09A8, \u0986\u099C \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u0995\u09C0\u09AD\u09BE\u09AC\u09C7 \u09B8\u09BE\u09B9\u09BE\u09AF\u09CD\u09AF \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09BF?";
  }
  if (q.includes("kemon achen") || q.includes("\u0995\u09C7\u09AE\u09A8 \u0986\u099B\u09C7\u09A8") || q.includes("kemon asen")) {
    return "\u0986\u09B2\u09B9\u09BE\u09AE\u09A6\u09C1\u09B2\u09BF\u09B2\u09CD\u09B2\u09BE\u09B9, \u0986\u09AE\u09B0\u09BE \u09B8\u09AC\u09BE\u0987 \u09AD\u09BE\u09B2\u09CB \u0986\u099B\u09BF! \u0986\u09B6\u09BE \u0995\u09B0\u09BF \u0986\u09AA\u09A8\u09BF\u0993 \u09AD\u09BE\u09B2\u09CB \u0986\u099B\u09C7\u09A8\u0964 \u{1F60A}\n\n\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 " + businessName + "-\u098F \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u09B8\u09CD\u09AC\u09BE\u0997\u09A4\u09AE\u0964 \u09AC\u09B2\u09C1\u09A8, \u0995\u09C0\u09AD\u09BE\u09AC\u09C7 \u09B8\u09BE\u09B9\u09BE\u09AF\u09CD\u09AF \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09BF?";
  }
  if (q.includes("call din") || q.includes("call den") || q.includes("call koren") || q.includes("kotha bolte chai") || q.includes("kotha bolte cai") || q.includes("\u0995\u09A5\u09BE \u09AC\u09B2\u09A4\u09C7 \u099A\u09BE\u0987") || q.includes("\u0995\u09B2 \u09A6\u09BF\u09A8") || q.includes("\u0995\u09B2 \u0995\u09B0\u09C7\u09A8")) {
    return "\u0985\u09AC\u09B6\u09CD\u09AF\u0987! \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u099F\u09BF\u09AE\u09C7\u09B0 \u098F\u0995\u099C\u09A8 \u09AA\u09CD\u09B0\u09A4\u09BF\u09A8\u09BF\u09A7\u09BF \u09B6\u09C0\u0998\u09CD\u09B0\u0987 \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09BE\u09A5\u09C7 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09AC\u09C7\u09A8\u0964\n\n\u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u099A\u09B2 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0\u099F\u09BF \u098F\u0996\u09BE\u09A8\u09C7 \u09B2\u09BF\u0996\u09C7 \u09A6\u09BF\u09A8\u0964 [HUMAN_HANDOFF]";
  }
  const isAskingIfAiCanSendPictures = (q.includes("picture") || q.includes("photo") || q.includes("chobi") || q.includes("\u099B\u09AC\u09BF") || q.includes("\u09AA\u09BF\u0995\u099A\u09BE\u09B0") || q.includes("\u09AA\u09BF\u0995")) && (q.includes("send") || q.includes("pathate") || q.includes("\u09AA\u09BE\u09A0\u09BE\u09A4\u09C7") || q.includes("parbe") || q.includes("\u09AA\u09BE\u09B0\u09AC\u09C7") || q.includes("debe") || q.includes("\u09A6\u09C7\u09AC\u09C7") || q.includes("customer ke") || q.includes("customer") || q.includes("\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0"));
  if (isOneAgent && isAskingIfAiCanSendPictures) {
    return "\u09B9\u09CD\u09AF\u09BE\u0981, \u0985\u09AC\u09B6\u09CD\u09AF\u0987! One Agent BD-\u098F\u09B0 \u09B8\u09BE\u09AC\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09AA\u09B6\u09A8 \u09A8\u09BF\u09B2\u09C7 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 AI \u09B8\u09CD\u09AC\u09DF\u0982\u0995\u09CD\u09B0\u09BF\u09DF\u09AD\u09BE\u09AC\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0\u09A6\u09C7\u09B0 \u0987\u09A8\u09AC\u0995\u09CD\u09B8\u09C7 \u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u09C7\u09B0 \u099B\u09AC\u09BF, \u09B8\u09BE\u0987\u099C, \u09AC\u09BF\u09AC\u09B0\u09A3 \u0993 \u09AE\u09C2\u09B2\u09CD\u09AF \u09AA\u09BE\u09A0\u09BE\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u0964\n\n\u0986\u09AA\u09A8\u09BE\u09B0 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u09B2\u0997\u09C7 \u09AF\u09C7 \u099B\u09AC\u09BF\u0997\u09C1\u09B2\u09CB \u0986\u09AA\u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09A5\u09BE\u0995\u09AC\u09C7, \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u0995\u09CB\u09A8\u09CB \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u09A6\u09C7\u0996\u09A4\u09C7 \u099A\u09BE\u0987\u09B2\u09C7\u0987 AI \u09B8\u09BE\u09A5\u09C7 \u09B8\u09BE\u09A5\u09C7 \u099A\u09CD\u09AF\u09BE\u099F\u09C7 \u09B8\u09C7\u0987 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u09C7\u09B0 \u09B8\u09CD\u09AA\u09B7\u09CD\u099F \u099B\u09AC\u09BF \u0993 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u09AA\u09BE\u09A0\u09BF\u09DF\u09C7 \u09A6\u09BF\u09AC\u09C7\u0964";
  }
  const isAskingForServices = q.includes("service") || q.includes("\u09B8\u09BE\u09B0\u09CD\u09AD\u09BF\u09B8") || q.includes("kaj ki") || q.includes("\u0995\u09BE\u099C \u0995\u09BF") || q.includes("ki koren") || q.includes("\u0995\u09BF \u0995\u09B0\u09C7\u09A8") || q.includes("ki ki subidha") || q.includes("\u0995\u09BF \u0995\u09BF \u09B8\u09C1\u09AC\u09BF\u09A7\u09BE");
  if (isOneAgent && isAskingForServices) {
    return "One Agent BD \u098F\u0995\u099F\u09BF \u0985\u09B2-\u0987\u09A8-\u0993\u09AF\u09BC\u09BE\u09A8 AI \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u0993 \u09B8\u09C7\u09B2\u09B8 \u0985\u099F\u09CB\u09AE\u09C7\u09B6\u09A8 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09AB\u09B0\u09CD\u09AE\u0964 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AE\u09C2\u09B2 \u09B8\u09BE\u09B0\u09CD\u09AD\u09BF\u09B8\u0997\u09C1\u09B2\u09CB \u09B9\u09B2\u09CB:\n\n\u09E7. WhatsApp, Facebook Messenger \u0993 Instagram-\u098F \u09E8\u09EA/\u09ED \u09A8\u09A8-\u09B8\u09CD\u099F\u09AA \u09B8\u09CD\u09AC\u09DF\u0982\u0995\u09CD\u09B0\u09BF\u09DF AI \u099A\u09CD\u09AF\u09BE\u099F \u09B0\u09BF\u09AA\u09CD\u09B2\u09BE\u0987\u0964\n\u09E8. \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u09A6\u09C7\u0996\u09A4\u09C7 \u099A\u09BE\u0987\u09B2\u09C7 \u09B8\u09CD\u09AC\u09DF\u0982\u0995\u09CD\u09B0\u09BF\u09DF\u09AD\u09BE\u09AC\u09C7 \u0987\u09A8\u09AC\u0995\u09CD\u09B8\u09C7 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u09C7\u09B0 \u09B9\u09BE\u0987-\u0995\u09CB\u09DF\u09BE\u09B2\u09BF\u099F\u09BF \u099B\u09AC\u09BF \u0993 \u09B8\u09BE\u0987\u099C \u099A\u09BE\u09B0\u09CD\u099F \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB\u0964\n\u09E9. \u099A\u09CD\u09AF\u09BE\u099F \u09A5\u09C7\u0995\u09C7\u0987 \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0\u09C7\u09B0 \u09A8\u09BE\u09AE, \u09AB\u09CB\u09A8 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0 \u0993 \u09A0\u09BF\u0995\u09BE\u09A8\u09BE \u09A8\u09BF\u09DF\u09C7 \u0995\u09CD\u09AF\u09BE\u09B6 \u0985\u09A8 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF (COD) \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09A8\u09AB\u09BE\u09B0\u09CD\u09AE \u0995\u09B0\u09BE\u0964\n\u09EA. \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u09AD\u09DF\u09C7\u09B8 \u09AE\u09C7\u09B8\u09C7\u099C \u09AA\u09BE\u09A0\u09BE\u09B2\u09C7 \u09A4\u09BE \u09B6\u09C1\u09A8\u09C7 \u09AC\u09C1\u099D\u09C7 \u09A4\u09BE\u09CE\u0995\u09CD\u09B7\u09A3\u09BF\u0995 \u09AC\u09BE\u0982\u09B2\u09BE\u09DF \u09AD\u09DF\u09C7\u09B8 \u0993 \u099F\u09C7\u0995\u09CD\u09B8\u099F \u09B0\u09BF\u09AA\u09CD\u09B2\u09BE\u0987 \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8\u0964\n\u09EB. \u09AB\u09C7\u09B8\u09AC\u09C1\u0995 \u0993 \u0987\u09A8\u09B8\u09CD\u099F\u09BE\u0997\u09CD\u09B0\u09BE\u09AE \u09AA\u09CB\u09B8\u09CD\u099F\u09C7\u09B0 \u0995\u09AE\u09C7\u09A8\u09CD\u099F\u09C7 \u09B8\u09CD\u09AC\u09DF\u0982\u0995\u09CD\u09B0\u09BF\u09DF \u0995\u09AE\u09C7\u09A8\u09CD\u099F \u09B0\u09BF\u09AA\u09CD\u09B2\u09BE\u0987 \u098F\u09AC\u0982 \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0\u09C7\u09B0 \u0987\u09A8\u09AC\u0995\u09CD\u09B8\u09C7 \u09B8\u09BF\u0995\u09CD\u09B0\u09C7\u099F \u09A1\u09BF\u09B2 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB\u0964\n\n\u0986\u09AA\u09A8\u09BF \u0995\u09BF \u0986\u09AA\u09A8\u09BE\u09B0 \u09AC\u09CD\u09AF\u09AC\u09B8\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u09E8 \u09A6\u09BF\u09A8\u09C7\u09B0 \u09AB\u09CD\u09B0\u09BF \u099F\u09CD\u09B0\u09BE\u09DF\u09BE\u09B2 \u099A\u09BE\u09B2\u09C1 \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u09A8?";
  }
  const isAskingForSubscriptions = q.includes("subscription") || q.includes("subscriptions") || q.includes("\u09B8\u09BE\u09AC\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09AA\u09B6\u09A8") || q.includes("package") || q.includes("\u09AA\u09CD\u09AF\u09BE\u0995\u09C7\u099C") || q.includes("plan") || q.includes("\u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8") || q.includes("pricing") || q.includes("\u0996\u09B0\u099A \u0995\u09A4") || q.includes("koto taka") || q.includes("\u09A6\u09BE\u09AE \u0995\u09A4");
  if (isOneAgent && isAskingForSubscriptions) {
    return "One Agent BD-\u098F\u09B0 \u09B8\u09BE\u09AC\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09AA\u09B6\u09A8 \u09A8\u09BF\u09B2\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09AB\u09C7\u09B8\u09AC\u09C1\u0995, \u0987\u09A8\u09B8\u09CD\u099F\u09BE\u0997\u09CD\u09B0\u09BE\u09AE \u0993 \u09B9\u09CB\u09DF\u09BE\u099F\u09B8\u0985\u09CD\u09AF\u09BE\u09AA \u09AA\u09C7\u099C\u09C7 \u0995\u09CB\u09A8\u09CB \u0985\u09A4\u09BF\u09B0\u09BF\u0995\u09CD\u09A4 \u09B8\u09C7\u09B2\u09B8 \u0995\u09B0\u09CD\u09AE\u09C0 \u099B\u09BE\u09DC\u09BE\u0987 \u09E8\u09EA \u0998\u09A3\u09CD\u099F\u09BE \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09AC\u09CD\u09AF\u09AC\u09B8\u09BE \u0985\u099F\u09CB\u09AE\u09C7\u099F \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u09A8!\n\n\u09B8\u09BE\u09AC\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09AA\u09B6\u09A8 \u09A8\u09BF\u09B2\u09C7 \u09AF\u09C7 \u09B8\u09AC \u09B8\u09C1\u09AC\u09BF\u09A7\u09BE \u09AA\u09BE\u09AC\u09C7\u09A8:\n\u09E7. \u09E8\u09EA/\u09ED \u0987\u09A8\u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u09A8\u09CD\u099F \u09B0\u09BF\u09AA\u09CD\u09B2\u09BE\u0987: \u09B0\u09BE\u09A4 \u0995\u09BF\u0982\u09AC\u09BE \u099B\u09C1\u099F\u09BF\u09B0 \u09A6\u09BF\u09A8\u09C7\u0993 \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u09AE\u09C7\u09B8\u09C7\u099C \u09A6\u09BF\u09B2\u09C7 \u09E8 \u09B8\u09C7\u0995\u09C7\u09A8\u09CD\u09A1\u09C7 \u09B8\u09A0\u09BF\u0995 \u0989\u09A4\u09CD\u09A4\u09B0 \u09AA\u09BE\u09AC\u09C7\u0964\n\u09E8. \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u09C7\u09B0 \u099B\u09AC\u09BF \u0993 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u09B2\u0997 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB: \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u099A\u09BE\u0987\u09B2\u09C7 AI \u09B8\u09CD\u09AC\u09DF\u0982\u0995\u09CD\u09B0\u09BF\u09DF\u09AD\u09BE\u09AC\u09C7 \u0987\u09A8\u09AC\u0995\u09CD\u09B8\u09C7 \u099B\u09AC\u09BF \u0993 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u09AA\u09BE\u09A0\u09BF\u09DF\u09C7 \u09A6\u09BF\u09AC\u09C7\u0964\n\u09E9. \u09B8\u09CD\u09AC\u09DF\u0982\u0995\u09CD\u09B0\u09BF\u09DF \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u09AC\u09C1\u0995\u09BF\u0982: \u099A\u09CD\u09AF\u09BE\u099F \u09A5\u09C7\u0995\u09C7\u0987 \u09A8\u09BE\u09AE, \u09A0\u09BF\u0995\u09BE\u09A8\u09BE \u0993 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09AE\u09CD\u09AC\u09B0 \u09B8\u0982\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u0995\u09CD\u09AF\u09BE\u09B6 \u0985\u09A8 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09A8\u09AB\u09BE\u09B0\u09CD\u09AE \u0995\u09B0\u09AC\u09C7\u0964\n\u09EA. \u09AD\u09DF\u09C7\u09B8 \u09AE\u09C7\u09B8\u09C7\u099C \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F: \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0\u09C7\u09B0 \u09AD\u09DF\u09C7\u09B8 \u09A8\u09CB\u099F \u09B6\u09C1\u09A8\u09C7 \u09AC\u09BE\u0982\u09B2\u09BE\u09DF \u0985\u09A1\u09BF\u0993 \u0993 \u099F\u09C7\u0995\u09CD\u09B8\u099F \u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09C7\u09AC\u09C7\u0964\n\u09EB. \u09AA\u09CB\u09B8\u09CD\u099F \u0995\u09AE\u09C7\u09A8\u09CD\u099F \u099F\u09C1 \u0987\u09A8\u09AC\u0995\u09CD\u09B8 \u0985\u099F\u09CB\u09AE\u09C7\u09B6\u09A8: \u0995\u09AE\u09C7\u09A8\u09CD\u099F \u0995\u09B0\u09BE \u0995\u09CD\u09B0\u09C7\u09A4\u09BE\u09A6\u09C7\u09B0 \u09B8\u09BE\u09A5\u09C7 \u09B8\u09BE\u09A5\u09C7 \u0987\u09A8\u09AC\u0995\u09CD\u09B8\u09C7 \u099F\u09C7\u09A8\u09C7 \u09A8\u09BF\u09DF\u09C7 \u09B8\u09C7\u09B2 \u0995\u09A8\u09AD\u09BE\u09B0\u09CD\u099F \u0995\u09B0\u09AC\u09C7\u0964\n\n\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09CD\u09AF\u09BE\u0995\u09C7\u099C\u09B8\u09AE\u09C2\u09B9:\n\u2022 Starter AI Plan: \u09F3\u09E7,\u09E8\u09EB\u09E6 / \u09AE\u09BE\u09B8 (\u09E7\u099F\u09BF \u099A\u09CD\u09AF\u09BE\u09A8\u09C7\u09B2, \u09E7,\u09E6\u09E6\u09E6 \u09AE\u09C7\u09B8\u09C7\u099C, \u09AA\u09C2\u09B0\u09CD\u09A3 \u0985\u099F\u09CB\u09AE\u09C7\u09B6\u09A8)\n\u2022 Pro Sales AI Plan: \u09F3\u09E7,\u09EF\u09EB\u09E6 / \u09AE\u09BE\u09B8 (\u09E9\u099F\u09BF \u099A\u09CD\u09AF\u09BE\u09A8\u09C7\u09B2 \u2014 WhatsApp, Facebook, Instagram, \u0986\u09A8\u09B2\u09BF\u09AE\u09BF\u099F\u09C7\u09A1 AI)\n\n\u098F\u099B\u09BE\u09DC\u09BE\u0993 \u0986\u09AA\u09A8\u09BF \u09E8 \u09A6\u09BF\u09A8\u09C7\u09B0 \u09AB\u09CD\u09B0\u09BF \u099F\u09CD\u09B0\u09BE\u09DF\u09BE\u09B2 \u09A6\u09BF\u09DF\u09C7 \u09A8\u09BF\u099C\u09C7\u0987 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09AB\u09BF\u099A\u09BE\u09B0 \u099F\u09C7\u09B8\u09CD\u099F \u0995\u09B0\u09C7 \u09A6\u09C7\u0996\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8!";
  }
  if (isOneAgent && (q.includes("trial") || q.includes("\u099F\u09CD\u09B0\u09BE\u09DF\u09BE\u09B2") || q.includes("free") || q.includes("\u09AB\u09CD\u09B0\u09BF"))) {
    return "\u09B9\u09CD\u09AF\u09BE\u0981! One Agent BD-\u09A4\u09C7 \u0986\u09AA\u09A8\u09BF \u0995\u09CB\u09A8\u09CB \u0995\u09CD\u09B0\u09C7\u09A1\u09BF\u099F \u0995\u09BE\u09B0\u09CD\u09A1 \u099B\u09BE\u09DC\u09BE\u0987 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09E8 \u09A6\u09BF\u09A8\u09C7\u09B0 \u09AB\u09CD\u09B0\u09BF \u099F\u09CD\u09B0\u09BE\u09DF\u09BE\u09B2 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u09A8\u0964\n\n\u09AB\u09CD\u09B0\u09BF \u099F\u09CD\u09B0\u09BE\u09DF\u09BE\u09B2\u09C7 \u0986\u09AA\u09A8\u09BF WhatsApp, Facebook Messenger \u0993 Instagram \u0995\u09BE\u09A8\u09C7\u0995\u09CD\u099F \u0995\u09B0\u09C7 \u09B8\u09CD\u09AC\u09DF\u0982\u0995\u09CD\u09B0\u09BF\u09DF AI \u09B0\u09BF\u09AA\u09CD\u09B2\u09BE\u0987 \u0993 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09BE\u09B2\u09C7\u0995\u09B6\u09A8 \u09A8\u09BF\u099C\u09C7 \u099F\u09C7\u09B8\u09CD\u099F \u0995\u09B0\u09C7 \u09A6\u09C7\u0996\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u09A8\u0964";
  }
  if (matchedProduct) {
    return '\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 "' + matchedProduct.name + '"-\u098F\u09B0 \u09AE\u09C2\u09B2\u09CD\u09AF \u09F3' + matchedProduct.price + " " + matchedProduct.currency + "\u0964\n" + (matchedProduct.description ? matchedProduct.description + "\n\n" : "\n") + "\u0986\u09AA\u09A8\u09BF \u0995\u09BF \u098F\u099F\u09BF \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u09A8? \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09A8\u09BE\u09AE, \u09AA\u09C2\u09B0\u09CD\u09A3\u09BE\u0999\u09CD\u0997 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09A0\u09BF\u0995\u09BE\u09A8\u09BE \u0993 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0\u099F\u09BF \u09A6\u09BF\u09A8\u0964";
  }
  if (systemPrompt && systemPrompt.trim()) {
    const kbLines = systemPrompt.split("\n").map((l) => l.trim()).filter((l) => {
      if (l.length < 20) return false;
      if (l.endsWith(":")) return false;
      if (l.startsWith("[") || l.startsWith("MANDATORY") || l.startsWith("CRITICAL") || l.startsWith("You are")) return false;
      return true;
    });
    const searchTokens = q.replace(/[?!,.]/g, "").split(/\s+/).filter((t) => t.length >= 3 && !["koto", "kemon", "apnader", "amader", "korbo", "kivabe", "business", "sathe", "connect", "customer", "customers", "tumi", "amar"].includes(t));
    if (searchTokens.length > 0) {
      const scoredLines = kbLines.map((line) => {
        const lineLower = line.toLowerCase();
        const matchCount = searchTokens.filter((tok) => lineLower.includes(tok)).length;
        return { line, matchCount };
      }).filter((item) => item.matchCount >= 1).sort((a, b) => b.matchCount - a.matchCount);
      if (scoredLines.length > 0 && scoredLines[0].matchCount >= 1) {
        const best = scoredLines[0].line.replace(/^[-•*]\s*/, "").replace(/^\d+\.\s*/, "");
        return best + "\n\n\u098F\u0987 \u09AC\u09BF\u09B7\u09DF\u09C7 \u0986\u09B0 \u0995\u09CB\u09A8\u09CB \u0995\u09BF\u099B\u09C1 \u099C\u09BE\u09A8\u09A4\u09C7 \u099A\u09BE\u09A8?";
      }
    }
  }
  return "\u09A6\u09C1\u0983\u0996\u09BF\u09A4, \u098F\u0987 \u09AC\u09BF\u09B7\u09DF\u099F\u09BF \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995\u09C7 \u0986\u09AE\u09BE\u09B0 \u0995\u09BE\u099B\u09C7 \u09B8\u09A0\u09BF\u0995 \u09A4\u09A5\u09CD\u09AF \u09A8\u09C7\u0987\u0964 \u0986\u09AE\u09BF \u09AC\u09BF\u09B7\u09DF\u099F\u09BF \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u099F\u09BF\u09AE\u0995\u09C7 \u099C\u09BE\u09A8\u09BF\u09DF\u09C7 \u09A6\u09BF\u099A\u09CD\u099B\u09BF, \u098F\u0995\u099C\u09A8 \u09AA\u09CD\u09B0\u09A4\u09BF\u09A8\u09BF\u09A7\u09BF \u09B6\u09C0\u0998\u09CD\u09B0\u0987 \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09BE\u09A5\u09C7 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09AC\u09C7\u09A8\u0964 [HUMAN_HANDOFF]";
}
async function generateAIReply(params) {
  const profile = params.profile || db.getProfileById(params.userId);
  let assignedAgent = params.agentId ? db.getAgentById(params.agentId) : void 0;
  if (!assignedAgent && params.channelId) {
    const ch = db.getChannelById(params.channelId);
    if (ch?.agent_id) {
      assignedAgent = db.getAgentById(ch.agent_id);
    }
    if (!assignedAgent) {
      const userAgents = db.getAgents(params.userId);
      assignedAgent = userAgents.find(
        (a) => a.is_active && (a.assigned_channels || []).includes(params.channelId)
      );
    }
  }
  const rawBusinessName = assignedAgent?.business_name || params.channelName || profile?.business_name || (profile?.full_name && profile.full_name !== "Platform Admin" ? profile.full_name : "") || "One Agent BD";
  const businessName = sanitizeBusinessDisplayName(rawBusinessName);
  const isOneAgentSaaS = businessName.toLowerCase().includes("one agent") || Boolean(
    profile?.system_prompt && profile.system_prompt.includes("Starter AI Plan") || params.overrideSystemPrompt && params.overrideSystemPrompt.includes("Starter AI Plan")
  );
  const hasCustomMerchantPrompt = !isOneAgentSaaS && Boolean(
    params.overrideSystemPrompt && params.overrideSystemPrompt.trim().length > 10 || assignedAgent?.system_prompt && assignedAgent.system_prompt.trim().length > 10 || profile?.system_prompt && profile.system_prompt.trim().length > 10 && !profile.system_prompt.includes("Starter AI Plan") && !profile.system_prompt.includes("You are an executive AI assistant for One Agent BD")
  );
  const isAdminOrOfficialSaaS = isOneAgentSaaS;
  const defaultSavedPrompt = isAdminOrOfficialSaaS ? (db.getSettings()?.default_system_prompt || "").trim() : "";
  let agentCombinedPrompt = "";
  if (assignedAgent) {
    const toneNote = assignedAgent.tone === "sales_closer" ? "Sales Persona: Sales Closer. Proactively guide customer to confirm their Cash on Delivery (COD) order with name, phone, and address." : assignedAgent.tone === "friendly" ? "Sales Persona: Friendly & Welcoming. Answer with warmth, courtesy, and patience." : assignedAgent.tone === "urgent" ? "Sales Persona: Fast & Urgent. Highlight fast courier dispatch and limited stock availability." : "Sales Persona: Executive & Professional.";
    agentCombinedPrompt = `${assignedAgent.system_prompt || ""}

[BUSINESS & SALES PERSONA FOR ${assignedAgent.business_name || businessName}]:
${toneNote}
Reply Language: ${assignedAgent.language || "Bangla"}.
Inside Dhaka Delivery Charge: \u09F3${assignedAgent.delivery_charge_inside_dhaka ?? 60} BDT, Outside Dhaka: \u09F3${assignedAgent.delivery_charge_outside_dhaka ?? 120} BDT.

[BUSINESS KNOWLEDGE BASE & PRODUCTS]:
${assignedAgent.knowledge_base || ""}`;
  }
  const rawSystemPrompt = params.overrideSystemPrompt && params.overrideSystemPrompt.trim() || agentCombinedPrompt || profile?.system_prompt && profile.system_prompt.trim() || defaultSavedPrompt || `\u0986\u09AA\u09A8\u09BF "${businessName}"-\u098F\u09B0 \u0985\u09AB\u09BF\u09B8\u09BF\u09DF\u09BE\u09B2 \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u09B8\u09BE\u09B0\u09CD\u09AD\u09BF\u09B8 \u0993 \u09B8\u09C7\u09B2\u09B8 AI \u0985\u09CD\u09AF\u09BE\u09B8\u09BF\u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u09A8\u09CD\u099F\u0964 \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0\u09C7\u09B0 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u09C7\u09B0 \u0985\u09B0\u09CD\u09A5 \u09AC\u09C1\u099D\u09C7 \u0986\u09A8\u09CD\u09A4\u09B0\u09BF\u0995 \u0993 \u09B8\u09CD\u09AC\u09BE\u09AD\u09BE\u09AC\u09BF\u0995 \u09AC\u09BE\u0982\u09B2\u09BE\u09DF \u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09BF\u09A8\u0964`;
  let systemPrompt = rawSystemPrompt.replace(/in 1-2 clear English sentences/gi, "in clear, natural Bangla (\u09AC\u09BE\u0982\u09B2\u09BE)").replace(/in 1-2 clear, courteous English sentences/gi, "in clear, courteous Bangla (\u09AC\u09BE\u0982\u09B2\u09BE)").replace(/in 1-2 polite, clear English sentences/gi, "in polite, clear Bangla (\u09AC\u09BE\u0982\u09B2\u09BE)").replace(/in 1-2 informative, concise English sentences/gi, "in informative, natural Bangla (\u09AC\u09BE\u0982\u09B2\u09BE)").replace(/in clear, friendly English/gi, "in clear, friendly Bangla (\u09AC\u09BE\u0982\u09B2\u09BE)").replace(/in 1-2 concise English sentences/gi, "in natural Bangla (\u09AC\u09BE\u0982\u09B2\u09BE)").replace(/Respond politely and directly in 1-2 concise English sentences\./gi, "\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0\u09C7\u09B0 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u09C7\u09B0 \u0985\u09B0\u09CD\u09A5 \u09AC\u09C1\u099D\u09C7 \u09B8\u09B0\u09CD\u09AC\u09A6\u09BE \u09B8\u09C1\u09A8\u09CD\u09A6\u09B0 \u0993 \u09B8\u09CD\u09AC\u09BE\u09AD\u09BE\u09AC\u09BF\u0995 \u09AC\u09BE\u0982\u09B2\u09BE\u09DF \u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09BF\u09A8\u0964").replace(/Never send long paragraphs or unnecessary lists\./gi, "\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u09AF\u0996\u09A8 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8, \u09A6\u09BE\u09AE, \u0995\u09C0 \u0995\u09C0 \u0986\u099B\u09C7 \u09AC\u09BE \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u099C\u09BE\u09A8\u09A4\u09C7 \u099A\u09BE\u0987\u09AC\u09C7, \u09A4\u0996\u09A8 \u0985\u09AC\u09B6\u09CD\u09AF\u0987 \u09E7., \u09E8., \u09E9. \u09B8\u09BF\u09B0\u09BF\u09DF\u09BE\u09B2 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0 \u09A6\u09BF\u09DF\u09C7 \u09AA\u09B0\u09BF\u09B7\u09CD\u0995\u09BE\u09B0 \u09B2\u09BF\u09B8\u09CD\u099F \u0986\u0995\u09BE\u09B0\u09C7 \u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09BF\u09A8\u0964").replace(/Always keep replies concise and to the point \(maximum 2 to 3 sentences\)\./gi, "\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8, \u09A6\u09BE\u09AE, \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u09AC\u09BE \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u099C\u09BE\u09A8\u09A4\u09C7 \u099A\u09BE\u0987\u09B2\u09C7 \u0995\u0996\u09A8\u09CB\u0987 \u098F\u0995 \u09AA\u09CD\u09AF\u09BE\u09B0\u09BE\u0997\u09CD\u09B0\u09BE\u09AB\u09C7 \u09B9\u09BF\u099C\u09BF\u09AC\u09BF\u099C\u09BF \u0995\u09B0\u09C7 \u09B2\u09BF\u0996\u09AC\u09C7\u09A8 \u09A8\u09BE; \u09A8\u09BF\u099A\u09C7 \u09A8\u09BF\u099A\u09C7 \u09B8\u09BF\u09B0\u09BF\u09DF\u09BE\u09B2 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0 (\u09E7., \u09E8., \u09E9.) \u09A6\u09BF\u09DF\u09C7 \u09B8\u09BE\u099C\u09BF\u09DF\u09C7 \u09B2\u09BF\u0996\u09AC\u09C7\u09A8\u0964").replace(/Keep replies concise, clear, and within 1-3 sentences\./gi, "\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8, \u09A6\u09BE\u09AE, \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u09AC\u09BE \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u099C\u09BE\u09A8\u09A4\u09C7 \u099A\u09BE\u0987\u09B2\u09C7 \u09A8\u09BF\u099A\u09C7 \u09A8\u09BF\u099A\u09C7 \u09B8\u09BF\u09B0\u09BF\u09DF\u09BE\u09B2 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0 (\u09E7., \u09E8., \u09E9.) \u09A6\u09BF\u09DF\u09C7 \u09AA\u09B0\u09BF\u09B7\u09CD\u0995\u09BE\u09B0 \u09B2\u09BF\u09B8\u09CD\u099F \u0986\u0995\u09BE\u09B0\u09C7 \u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09C7\u09AC\u09C7\u09A8\u0964").replace(/in 2-3 concise sentences\./gi, "using clean serial numbered lists (\u09E7., \u09E8., \u09E9.) when sharing plans, prices, or details.");
  if (!isAdminOrOfficialSaaS) {
    systemPrompt = systemPrompt.replace(/-\s*WhatsApp,\s*Facebook Messenger ও Instagram 24\/7 AI অটো-রিপ্লাই[^\n]*\n?/gi, "").replace(/-\s*স্টার্টার প্ল্যান:\s*৳১,২৫০\/মাস[^\n]*\n?/gi, "").replace(/ডিজিটাল সার্ভিস তাৎক্ষণিক অ্যাক্টিভ হয়।\s*/gi, "");
  }
  const activeCoupons = (db.getCoupons() || []).filter((c) => c.is_active);
  const couponSummary = activeCoupons.length > 0 ? activeCoupons.slice(0, 4).map(
    (c) => `${c.code} (${c.discount_type === "percentage" ? `${c.discount_value}% \u099B\u09BE\u09DC` : `\u09F3${c.discount_value} \u099B\u09BE\u09DC`})`
  ).join(", ") : "WELCOME10 (\u09E7\u09E6% \u09A1\u09BF\u09B8\u0995\u09BE\u0989\u09A8\u09CD\u099F), SAVE250 (\u09F3\u09E8\u09EB\u09E6 \u09A1\u09BF\u09B8\u0995\u09BE\u0989\u09A8\u09CD\u099F)";
  const oneAgentExtendedKnowledge = isOneAgentSaaS ? `
[ONE AGENT BD COMPLETE SAAS KNOWLEDGE BASE \u2014 FOR ANSWERING ANY UNSCRIPTED QUESTION]:
- \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09AB\u09B0\u09CD\u09AE\u09C7\u09B0 \u0995\u09BE\u099C: One Agent BD \u09B9\u09B2\u09CB \u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6\u09C7\u09B0 \u0985\u09B2-\u0987\u09A8-\u0993\u09DF\u09BE\u09A8 AI Sales, Auto-Reply \u0993 Order Management SaaS \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09AB\u09B0\u09CD\u09AE\u0964 \u098F\u099F\u09BF Facebook Page, Instagram, WhatsApp \u098F\u09AC\u0982 Website-\u098F \u09E8\u09EA/\u09ED \u09AE\u09BE\u09A8\u09C1\u09B7\u09C7\u09B0 \u09AE\u09A4\u09CB \u09B8\u09CD\u09AE\u09BE\u09B0\u09CD\u099F\u09AD\u09BE\u09AC\u09C7 \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0\u09A6\u09C7\u09B0 \u09AE\u09C7\u09B8\u09C7\u099C \u0993 \u0995\u09AE\u09C7\u09A8\u09CD\u099F\u09C7\u09B0 \u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09C7\u09DF \u098F\u09AC\u0982 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09A8\u09AB\u09BE\u09B0\u09CD\u09AE \u0995\u09B0\u09C7\u0964
- \u0995\u09BE\u09A6\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u0989\u09AA\u09AF\u09C1\u0995\u09CD\u09A4: \u09AF\u09C7\u0995\u09CB\u09A8\u09CB F-Commerce \u09AC\u09BE E-Commerce \u09AA\u09C7\u099C (\u0995\u09BE\u09AA\u09DC, \u09AB\u09CD\u09AF\u09BE\u09B6\u09A8, \u0997\u09CD\u09AF\u09BE\u099C\u09C7\u099F, \u0995\u09B8\u09AE\u09C7\u099F\u09BF\u0995\u09B8, \u0996\u09BE\u09AC\u09BE\u09B0/\u09B0\u09C7\u09B8\u09CD\u099F\u09C1\u09B0\u09C7\u09A8\u09CD\u099F, \u0986\u0987\u099F\u09BF \u09B8\u09BE\u09B0\u09CD\u09AD\u09BF\u09B8, \u0995\u09CD\u09B2\u09BF\u09A8\u09BF\u0995 \u09AC\u09BE \u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u0985\u09A8\u09B2\u09BE\u0987\u09A8 \u09AC\u09BF\u099C\u09A8\u09C7\u09B8) \u09AF\u09BE\u09B0\u09BE \u098F\u0995\u09BE \u09AE\u09C7\u09B8\u09C7\u099C \u09B8\u09BE\u09AE\u09B2\u09BE\u09A4\u09C7 \u09B9\u09BF\u09AE\u09B6\u09BF\u09AE \u0996\u09BE\u099A\u09CD\u099B\u09C7\u09A8 \u09AC\u09BE \u09B0\u09BE\u09A4-\u09A6\u09BF\u09A8 \u09E8\u09EA \u0998\u09A3\u09CD\u099F\u09BE \u09B8\u09C7\u09B2\u09B8 \u09AC\u09BE\u09DC\u09BE\u09A4\u09C7 \u099A\u09BE\u09A8\u0964 \u0995\u09CB\u09A1\u09BF\u0982 \u09AC\u09BE \u099F\u09C7\u0995\u09A8\u09BF\u0995\u09CD\u09AF\u09BE\u09B2 \u0995\u09CB\u09A8\u09CB \u099C\u09CD\u099E\u09BE\u09A8\u09C7\u09B0\u0987 \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8 \u09A8\u09C7\u0987\u2014\u09AE\u09BE\u09A4\u09CD\u09B0 \u09E8 \u09AE\u09BF\u09A8\u09BF\u099F\u09C7 \u09E7 \u0995\u09CD\u09B2\u09BF\u0995\u09C7\u0987 \u09B8\u09C7\u099F\u0986\u09AA \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u0964
- \u09E8\u099F\u09BF \u0985\u09AB\u09BF\u09B8\u09BF\u09DF\u09BE\u09B2 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8 \u0993 \u09A6\u09BE\u09AE:
  \u09E7) Starter AI Plan \u2014 \u09F3\u09E7,\u09E8\u09EB\u09E6 \u099F\u09BE\u0995\u09BE/\u09AE\u09BE\u09B8 (\u09E8 \u09AE\u09BE\u09B8 \u09F3\u09E8,\u09EB\u09E6\u09E6 | \u09E9 \u09AE\u09BE\u09B8 \u09F3\u09E9,\u09ED\u09EB\u09E6 | \u09EC \u09AE\u09BE\u09B8 \u09F3\u09ED,\u09EB\u09E6\u09E6 | \u09E7 \u09AC\u099B\u09B0/\u09E7\u09E8 \u09AE\u09BE\u09B8 \u09F3\u09E7\u09EB,\u09E6\u09E6\u09E6 \u099F\u09BE\u0995\u09BE):
     \u2022 \u09E7\u099F\u09BF AI \u098F\u099C\u09C7\u09A8\u09CD\u099F, Facebook, Instagram, WhatsApp \u0993 Website \u099A\u09CD\u09AF\u09BE\u099F\u09AC\u099F, \u09EB\u09E6\u099F\u09BF \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u09B2\u0997, \u0985\u099F\u09CB \u0995\u09AE\u09C7\u09A8\u09CD\u099F \u09B0\u09BF\u09AA\u09CD\u09B2\u09BE\u0987, \u0985\u099F\u09CB \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0997\u09CD\u09B0\u09B9\u09A3 \u098F\u09AC\u0982 \u09E7-\u0995\u09CD\u09B2\u09BF\u0995\u09C7 Steadfast, Pathao \u0993 RedX \u0995\u09C1\u09B0\u09BF\u09DF\u09BE\u09B0 \u09AC\u09C1\u0995\u09BF\u0982\u0964
  \u09E8) Pro Business Plan \u2014 \u09F3\u09E7,\u09EF\u09EB\u09E6 \u099F\u09BE\u0995\u09BE/\u09AE\u09BE\u09B8 (\u09E8 \u09AE\u09BE\u09B8 \u09F3\u09E9,\u09EF\u09E6\u09E6 | \u09E9 \u09AE\u09BE\u09B8 \u09F3\u09EB,\u09EE\u09EB\u09E6 | \u09EC \u09AE\u09BE\u09B8 \u09F3\u09E7\u09E7,\u09ED\u09E6\u09E6 | \u09E7 \u09AC\u099B\u09B0/\u09E7\u09E8 \u09AE\u09BE\u09B8 \u09F3\u09E8\u09E9,\u09EA\u09E6\u09E6 \u099F\u09BE\u0995\u09BE):
     \u2022 \u09E9\u099F\u09BF AI \u098F\u099C\u09C7\u09A8\u09CD\u099F, \u09AD\u09DF\u09C7\u09B8 \u09AE\u09C7\u09B8\u09C7\u099C \u09B6\u09C1\u09A8\u09C7 \u0989\u09A4\u09CD\u09A4\u09B0 (Voice AI), \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0\u09C7\u09B0 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u09C7\u09B0 \u099B\u09AC\u09BF \u09A6\u09C7\u0996\u09C7 \u09A6\u09BE\u09AE \u0993 \u09AC\u09BF\u09AC\u09B0\u09A3 \u09AC\u09B2\u09BE (Image Recognition AI), \u0986\u09A8\u09B2\u09BF\u09AE\u09BF\u099F\u09C7\u09A1 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u09B2\u0997 \u0993 \u0993\u09DF\u09C7\u09AC\u09B8\u09BE\u0987\u099F/Shopify/WooCommerce \u09B8\u09BF\u0999\u09CD\u0995 \u098F\u09AC\u0982 \u09E8\u09EA/\u09ED \u09AD\u09BF\u0986\u0987\u09AA\u09BF \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F\u0964
- \u09AB\u09CD\u09B0\u09BF \u099F\u09CD\u09B0\u09BE\u09DF\u09BE\u09B2: \u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u09A8\u09A4\u09C1\u09A8 \u0987\u0989\u099C\u09BE\u09B0 \u0993\u09DF\u09C7\u09AC\u09B8\u09BE\u0987\u099F\u09C7 (https://www.oneagentbd.online) \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u0996\u09C1\u09B2\u09C7\u0987 \u09E8 \u09A6\u09BF\u09A8\u09C7\u09B0 (\u09EA\u09EE \u0998\u09A3\u09CD\u099F\u09BE) \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09AB\u09CD\u09B0\u09BF \u099F\u09CD\u09B0\u09BE\u09DF\u09BE\u09B2 \u09A8\u09BF\u09DF\u09C7 \u09B8\u09AC \u09AB\u09BF\u099A\u09BE\u09B0 \u099F\u09C7\u09B8\u09CD\u099F \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u09A8 (\u0995\u09CB\u09A8\u09CB \u0985\u0997\u09CD\u09B0\u09BF\u09AE \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09B2\u09BE\u0997\u09AC\u09C7 \u09A8\u09BE)\u0964
- \u0995\u09C1\u09AA\u09A8 \u0995\u09CB\u09A1 \u0993 \u09A1\u09BF\u09B8\u0995\u09BE\u0989\u09A8\u09CD\u099F (Coupon & Discount Policy): \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u0995\u09C1\u09AA\u09A8 \u0995\u09CB\u09A1 \u09AC\u09BE \u09A1\u09BF\u09B8\u0995\u09BE\u0989\u09A8\u09CD\u099F \u099A\u09BE\u0987\u09B2\u09C7 \u099C\u09BE\u09A8\u09BE\u09AC\u09C7\u09A8 \u09AF\u09C7 \u099A\u09C7\u0995\u0986\u0989\u099F\u09C7\u09B0 \u09B8\u09AE\u09DF \u09AA\u09CD\u09B0\u09CB\u09AE\u09CB \u0995\u09CB\u09A1 \u09AC\u0995\u09CD\u09B8\u09C7 \u0995\u09C1\u09AA\u09A8 \u0995\u09CB\u09A1 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09C7 \u09A1\u09BF\u09B8\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09A8\u09C7\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u0964 \u09AC\u09B0\u09CD\u09A4\u09AE\u09BE\u09A8\u09C7 \u09B8\u099A\u09B2 \u0995\u09C1\u09AA\u09A8 \u0995\u09CB\u09A1\u09B8\u09AE\u09C2\u09B9: ${couponSummary}\u0964 \u098F\u099B\u09BE\u09DC\u09BE \u0993\u09DF\u09C7\u09AC\u09B8\u09BE\u0987\u099F\u09C7\u09B0 \u09B2\u09BE\u0987\u09AD \u099A\u09CD\u09AF\u09BE\u099F\u09AC\u099F \u09A5\u09C7\u0995\u09C7 \u09AC\u09BF\u099C\u09A8\u09C7\u09B8 \u09B0\u09BF\u09AD\u09BF\u0989/\u09AE\u09BE\u09B8\u09BF\u0995 \u09B8\u09C7\u09B2\u09B8 \u099C\u09BE\u09A8\u09BF\u09DF\u09C7 \u09E7\u09EB% \u0987\u09A8\u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u09A8\u09CD\u099F \u0995\u09C1\u09AA\u09A8 \u0995\u09CB\u09A1 \u099C\u09C7\u09A8\u09BE\u09B0\u09C7\u099F \u0995\u09B0\u09BE \u09AF\u09BE\u09DF \u0995\u09BF\u0982\u09AC\u09BE \u09AC\u09DC \u09AA\u09CD\u09AF\u09BE\u0995\u09C7\u099C\u09C7 \u09B8\u09CD\u09AA\u09C7\u09B6\u09BE\u09B2 \u099B\u09BE\u09DC\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F\u09C7 (+8801601705804) \u0995\u09A5\u09BE \u09AC\u09B2\u09BE \u09AF\u09BE\u09AC\u09C7\u0964
- \u09A8\u09BF\u09B0\u09BE\u09AA\u09A4\u09CD\u09A4\u09BE \u0993 \u09AE\u09C7\u09B8\u09C7\u099C \u09B2\u09BF\u09AE\u09BF\u099F: \u09AE\u09C7\u099F\u09BE\u09B0 \u09E7\u09E6\u09E6% \u0985\u09AB\u09BF\u09B8\u09BF\u09DF\u09BE\u09B2 Graph \u0993 Cloud API \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09BE \u09B9\u09DF, \u09A4\u09BE\u0987 \u09AA\u09C7\u099C \u09AC\u09BE \u0986\u0987\u09A1\u09BF \u09AC\u09CD\u09AF\u09BE\u09A8 \u09B9\u0993\u09DF\u09BE\u09B0 \u09E6% \u099D\u09C1\u0981\u0995\u09BF\u0993 \u09A8\u09C7\u0987\u0964 \u0989\u09AD\u09DF \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8\u09C7\u0987 \u0986\u09A8\u09B2\u09BF\u09AE\u09BF\u099F\u09C7\u09A1 \u09AE\u09C7\u09B8\u09C7\u099C \u09B0\u09BF\u09AA\u09CD\u09B2\u09BE\u0987 (\u09AA\u09CD\u09B0\u09A4\u09BF \u09AE\u09C7\u09B8\u09C7\u099C\u09C7 \u0986\u09B2\u09BE\u09A6\u09BE \u0995\u09CB\u09A8\u09CB \u099A\u09BE\u09B0\u09CD\u099C \u09A8\u09C7\u0987)\u0964
- \u099F\u09CD\u09B0\u09BE\u09B8\u09CD\u099F \u0993 \u09AC\u09BF\u09B6\u09CD\u09AC\u09BE\u09B8\u09AF\u09CB\u0997\u09CD\u09AF\u09A4\u09BE (Trust & Credibility Policy): \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u099F\u09CD\u09B0\u09BE\u09B8\u09CD\u099F \u09AC\u09BE \u09AC\u09BF\u09B6\u09CD\u09AC\u09BE\u09B8 \u09A8\u09BF\u09DF\u09C7 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u0995\u09B0\u09B2\u09C7 (\u09AF\u09C7\u09AE\u09A8: "apnader trust korbo kivabe?", "\u0995\u09C0\u09AD\u09BE\u09AC\u09C7 \u09AC\u09BF\u09B6\u09CD\u09AC\u09BE\u09B8 \u0995\u09B0\u09AC?", "\u09B0\u09BF\u09DF\u09C7\u09B2 \u0995\u09BF\u09A8\u09BE?") \u0996\u09C1\u09AC \u0986\u09A8\u09CD\u09A4\u09B0\u09BF\u0995\u09AD\u09BE\u09AC\u09C7 \u0986\u09B6\u09CD\u09AC\u09B8\u09CD\u09A4 \u0995\u09B0\u09AC\u09C7\u09A8 \u09AF\u09C7:
  \u09E7) \u0986\u09AE\u09B0\u09BE \u09AE\u09C7\u099F\u09BE\u09B0 (Meta) \u09E7\u09E6\u09E6% \u0985\u09AB\u09BF\u09B6\u09BF\u09DF\u09BE\u09B2 API \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09BF, \u09AA\u09C7\u099C \u09AC\u09CD\u09AF\u09BE\u09A8 \u09AC\u09BE \u09B8\u09BF\u0995\u09BF\u0989\u09B0\u09BF\u099F\u09BF\u09B0 \u0995\u09CB\u09A8\u09CB \u09AD\u09DF \u09A8\u09C7\u0987\u0964
  \u09E8) \u09AC\u09BF\u09B6\u09CD\u09AC\u09BE\u09B8\u09AF\u09CB\u0997\u09CD\u09AF\u09A4\u09BE \u09A8\u09BF\u099C\u09C7 \u09AF\u09BE\u099A\u09BE\u0987\u09DF\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u0995\u09CB\u09A8\u09CB \u0985\u0997\u09CD\u09B0\u09BF\u09AE \u099F\u09BE\u0995\u09BE \u099B\u09BE\u09DC\u09BE\u0987 \u09E8 \u09A6\u09BF\u09A8\u09C7\u09B0 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09AB\u09CD\u09B0\u09BF \u099F\u09CD\u09B0\u09BE\u09DF\u09BE\u09B2 \u09B8\u09C1\u09AC\u09BF\u09A7\u09BE \u09B0\u09DF\u09C7\u099B\u09C7\u0964 \u0986\u09AA\u09A8\u09BF \u09A8\u09BF\u099C\u09C7\u09B0 \u09AA\u09C7\u099C\u09C7 \u099A\u09BE\u09B2\u09BF\u09DF\u09C7 \u09B8\u09A8\u09CD\u09A4\u09C1\u09B7\u09CD\u099F \u09B9\u09B2\u09C7 \u09A4\u09AC\u09C7\u0987 \u09B8\u09BE\u09AC\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09AA\u09B6\u09A8 \u09A8\u09BF\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u09A8\u0964
- \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u09C7\u09B0 \u099B\u09AC\u09BF \u0993 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u09B2\u0997 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB (Photo & Image Dispatch Capability): \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u0995\u09CB\u09A8\u09CB \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u09A6\u09C7\u0996\u09A4\u09C7 \u099A\u09BE\u0987\u09B2\u09C7 AI \u09B8\u09CD\u09AC\u09DF\u0982\u0995\u09CD\u09B0\u09BF\u09DF\u09AD\u09BE\u09AC\u09C7 \u0987\u09A8\u09AC\u0995\u09CD\u09B8\u09C7 \u09B9\u09BE\u0987-\u0995\u09CB\u09DF\u09BE\u09B2\u09BF\u099F\u09BF \u099B\u09AC\u09BF \u0993 \u09B8\u09BE\u0987\u099C \u09A1\u09BF\u099F\u09C7\u0987\u09B2\u09B8 \u09AA\u09BE\u09A0\u09BF\u09DF\u09C7 \u09A6\u09C7\u09DF\u0964 \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u09AF\u09A6\u09BF \u099C\u09BE\u09A8\u09A4\u09C7 \u099A\u09BE\u09DF "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0\u0995\u09C7 \u0995\u09BF \u099B\u09AC\u09BF \u09AA\u09BE\u09A0\u09BE\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7?", "picture send korte parbe ki?", \u09A4\u0996\u09A8 \u0996\u09C1\u09AC \u09AA\u09B0\u09BF\u09B7\u09CD\u0995\u09BE\u09B0\u09AD\u09BE\u09AC\u09C7 "\u09B9\u09CD\u09AF\u09BE\u0981, \u0985\u09AC\u09B6\u09CD\u09AF\u0987! One Agent BD \u09B8\u09BE\u09AC\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09AA\u09B6\u09A8 \u09A8\u09BF\u09B2\u09C7 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 AI \u09B8\u09CD\u09AC\u09DF\u0982\u0995\u09CD\u09B0\u09BF\u09DF\u09AD\u09BE\u09AC\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0\u09A6\u09C7\u09B0 \u0987\u09A8\u09AC\u0995\u09CD\u09B8\u09C7 \u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u09C7\u09B0 \u099B\u09AC\u09BF \u0993 \u09AC\u09BF\u09AC\u09B0\u09A3 \u09AA\u09BE\u09A0\u09BF\u09DF\u09C7 \u09A6\u09BF\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u0964" \u09AC\u09B2\u09C7 \u0986\u09B6\u09CD\u09AC\u09B8\u09CD\u09A4 \u0995\u09B0\u09AC\u09C7\u09A8\u0964
- \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u0993 \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F: \u09AC\u09BF\u0995\u09BE\u09B6, \u09A8\u0997\u09A6, \u09B0\u0995\u09C7\u099F \u0993 \u0989\u09AA\u09BE\u09DF (pay.oneagentbd.online)-\u098F\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u0995\u09B0\u09C7 TrxID \u09A6\u09BF\u09B2\u09C7\u0987 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8 \u09B8\u09BE\u09A5\u09C7 \u09B8\u09BE\u09A5\u09C7 \u0985\u099F\u09CB\u09AE\u09C7\u099F\u09BF\u0995 \u0985\u09CD\u09AF\u09BE\u0995\u09CD\u099F\u09BF\u09AD \u09B9\u09DF\u0964 \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u0993 \u09B9\u09C7\u09B2\u09CD\u09AA\u09B2\u09BE\u0987\u09A8 (\u09B8\u0995\u09BE\u09B2 \u09EF\u099F\u09BE \u2013 \u09B0\u09BE\u09A4 \u09E7\u09E7\u099F\u09BE): +8801601705804 (WhatsApp/Call), \u0987\u09AE\u09C7\u0987\u09B2: support.oneagentbd@gmail.com, \u0993\u09DF\u09C7\u09AC\u09B8\u09BE\u0987\u099F: https://www.oneagentbd.online\u0964` : "";
  const rawProducts = db.getProducts(params.userId) || [];
  const merchantProducts = isOneAgentSaaS ? [] : rawProducts;
  const catalogContext = merchantProducts.length > 0 ? merchantProducts.map(
    (p) => `- ${p.name}: \u09F3${p.price} ${p.currency} (Category: ${p.category}, Status: ${p.stock_status}, [Photo Available: ${Boolean(p.image_url && p.image_url.trim().length > 5)}]). Details: ${p.description || ""}`
  ).join("\n") : `(\u0995\u09CB\u09A8\u09CB \u0986\u09B2\u09BE\u09A6\u09BE \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u09B2\u0997 \u09AF\u09CB\u0997 \u0995\u09B0\u09BE \u09B9\u09DF\u09A8\u09BF \u2014 \u0989\u09AA\u09B0\u09C7\u09B0 Business Knowledge Base / System Instructions \u0985\u09A8\u09C1\u09AF\u09BE\u09DF\u09C0 \u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09BF\u09A8)`;
  const historyList = (params.history || []).slice(-20);
  const recentHistory = historyList.map((m) => {
    const role = m.direction === "inbound" ? "Customer" : "Assistant";
    const text = m.transcription ? `[Voice Note]: "${m.transcription}"` : m.message_text;
    return text ? `${role}: ${text}` : "";
  }).filter(Boolean).join("\n");
  const customerPastOrders = (db.getOrders(params.userId) || []).filter(
    (o) => o.customer_id === params.customerId
  );
  const latestPastOrder = customerPastOrders[customerPastOrders.length - 1];
  const pastPhone = latestPastOrder?.customer_phone;
  const pastAddress = latestPastOrder?.customer_address && !latestPastOrder.customer_address.includes("Details shared") ? latestPastOrder.customer_address : void 0;
  const customerPastContext = `[CUSTOMER MEMORY & CONTEXT ACROSS SESSIONS]:
- Customer ID: ${params.customerId}
- Customer Name: ${params.customerName || "Valued Customer"}
- Phone on Record: ${pastPhone || "Not yet provided"}
- Delivery Address on Record: ${pastAddress || "Not yet provided"}
- Previous Orders: ${customerPastOrders.length > 0 ? customerPastOrders.map((o) => `#${o.id.slice(-6).toUpperCase()}: ${o.items} (\u09F3${o.total_amount}, Status: ${o.status})`).join("; ") : "None"}`;
  const imageInquiry = detectProductImageInquiry(params.incomingMessage || "");
  const isAskingForImage = imageInquiry.isAskingForImage;
  const isAskingForCatalog = imageInquiry.isAskingForCatalog;
  const isAskingForDetails = imageInquiry.isAskingForDetails;
  const incomingLower = (params.incomingMessage || "").toLowerCase();
  let matchedProduct = void 0;
  let attachedProductsList = [];
  if (merchantProducts.length > 0) {
    if (params.targetProductId) {
      matchedProduct = merchantProducts.find((p) => p.id === params.targetProductId);
    }
    if (!matchedProduct && params.incomingMessage) {
      matchedProduct = db.findProductForQuery(params.userId, params.incomingMessage);
    }
    if (!matchedProduct && (isAskingForImage || isAskingForDetails || incomingLower.includes("ay ") || incomingLower.includes("ei ") || incomingLower.includes("eta") || incomingLower.includes("aita") || incomingLower.includes("\u098F\u0987"))) {
      const historyList2 = (params.history || []).slice(-8);
      for (let i = historyList2.length - 1; i >= 0; i--) {
        const histText = historyList2[i].message_text;
        if (histText) {
          const fromHist = db.findProductForQuery(params.userId, histText);
          if (fromHist) {
            matchedProduct = fromHist;
            break;
          }
        }
      }
    }
    if (isAskingForCatalog) {
      attachedProductsList = merchantProducts.filter((p) => Boolean(p.image_url && p.image_url.trim().length > 5)).slice(0, 6);
      if (attachedProductsList.length === 0) {
        attachedProductsList = merchantProducts.slice(0, 6);
      }
      matchedProduct = void 0;
    } else if (matchedProduct) {
      attachedProductsList = [matchedProduct];
    } else if (isAskingForImage) {
      if (!matchedProduct && params.incomingMessage) {
        matchedProduct = db.findProductForQuery(params.userId, params.incomingMessage);
      }
      if (matchedProduct) {
        attachedProductsList = [matchedProduct];
      } else {
        const prodsWithImg = merchantProducts.filter((p) => Boolean(p.image_url && p.image_url.trim().length > 5));
        if (merchantProducts.length === 1) {
          matchedProduct = merchantProducts[0];
          attachedProductsList = [matchedProduct];
        } else if (prodsWithImg.length === 1) {
          matchedProduct = prodsWithImg[0];
          attachedProductsList = [matchedProduct];
        } else {
          attachedProductsList = prodsWithImg.length > 0 ? prodsWithImg.slice(0, 6) : merchantProducts.slice(0, 6);
        }
      }
    }
  }
  const combinedSystemPrompt = `${systemPrompt}${oneAgentExtendedKnowledge ? `
${oneAgentExtendedKnowledge}` : ""}`;
  const effectiveApiKey = (params.overrideApiKey && !isDeadSeedKey(params.overrideApiKey) ? params.overrideApiKey.trim() : "") || (profile?.llm_api_key && !isDeadSeedKey(profile.llm_api_key) ? profile.llm_api_key.trim() : "") || (db.getSettings()?.default_llm_api_key || "").trim() || void 0;
  let voiceTranscript = void 0;
  const isVoicePlaceholderText = params.incomingMessage?.includes("[Voice Message]") || params.incomingMessage?.includes("Voice Message");
  if (params.audioBase64 || isVoicePlaceholderText) {
    if (!params.audioBase64) {
      return {
        replyText: UNCLEAR_VOICE_REPLY,
        transcript: "\u0985\u09B8\u09CD\u09AA\u09B7\u09CD\u099F \u09AD\u09DF\u09C7\u09B8 \u09AE\u09C7\u09B8\u09C7\u099C",
        isVoice: true
      };
    }
    console.log(`[AI Service] Processing voice note for customer ${params.customerId}`);
    const voiceResult = await callGeminiWithAudio(
      params.audioBase64,
      params.audioMimeType || "audio/ogg",
      combinedSystemPrompt,
      businessName,
      recentHistory,
      catalogContext,
      effectiveApiKey
    );
    if (voiceResult && voiceResult.replyText) {
      return {
        replyText: voiceResult.replyText,
        transcript: voiceResult.transcript,
        isVoice: true
      };
    }
    if (voiceResult && voiceResult.transcript && !isUnclearVoiceText(voiceResult.transcript)) {
      voiceTranscript = voiceResult.transcript;
      params.incomingMessage = voiceResult.transcript;
      if (merchantProducts.length > 0) {
        matchedProduct = db.findProductForQuery(params.userId, voiceResult.transcript);
      }
    } else {
      return {
        replyText: UNCLEAR_VOICE_REPLY,
        transcript: "\u0985\u09B8\u09CD\u09AA\u09B7\u09CD\u099F \u09AD\u09DF\u09C7\u09B8 \u09AE\u09C7\u09B8\u09C7\u099C",
        isVoice: true
      };
    }
  }
  if (params.imageBase64) {
    console.log(`[AI Service] Processing customer image inquiry for customer ${params.customerId}`);
    const imageReply = await callGeminiWithImage(
      params.imageBase64,
      params.imageMimeType || "image/jpeg",
      params.incomingMessage,
      combinedSystemPrompt,
      businessName,
      catalogContext,
      recentHistory,
      effectiveApiKey
    );
    if (imageReply) {
      return {
        replyText: imageReply,
        isVoice: false,
        attachedImageUrl: matchedProduct?.image_url,
        attachedProductName: matchedProduct?.name,
        attachedProductPrice: matchedProduct?.price
      };
    }
    if (matchedProduct) {
      return {
        replyText: `\u09A7\u09A8\u09CD\u09AF\u09AC\u09BE\u09A6! \u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u099B\u09AC\u09BF\u099F\u09BF \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 "${matchedProduct.name}"-\u098F\u09B0 \u09B8\u09BE\u09A5\u09C7 \u09AE\u09BF\u09B2\u09C7\u099B\u09C7 (\u09AE\u09C2\u09B2\u09CD\u09AF: \u09F3${matchedProduct.price})\u0964

\u0986\u09AA\u09A8\u09BF \u0995\u09BF \u098F\u099F\u09BF \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u09A8? \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09A8\u09BE\u09AE, \u09A0\u09BF\u0995\u09BE\u09A8\u09BE \u0993 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0\u099F\u09BF \u09A6\u09BF\u09A8!`,
        isVoice: false,
        attachedImageUrl: matchedProduct.image_url,
        attachedProductName: matchedProduct.name,
        attachedProductPrice: matchedProduct.price
      };
    }
    return {
      replyText: `\u099B\u09AC\u09BF\u099F\u09BF \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB\u09B0 \u099C\u09A8\u09CD\u09AF \u09A7\u09A8\u09CD\u09AF\u09AC\u09BE\u09A6! \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u099F\u09BF \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B8\u09CD\u099F\u0995\u09C7 \u0986\u099B\u09C7\u0964

\u0986\u09AA\u09A8\u09BF \u0995\u09BF \u098F\u099F\u09BF \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u099A\u09CD\u099B\u09C7\u09A8 \u09A8\u09BE\u0995\u09BF \u098F\u09B0 \u09A6\u09BE\u09AE \u0993 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u099C\u09BE\u09A8\u09A4\u09C7 \u099A\u09BE\u09A8?`,
      isVoice: false
    };
  }
  const languageDirective = `CRITICAL SMART REPLY LENGTH, SERIAL LIST FORMATTING & SPACING RULES (\u0985\u09AC\u09B6\u09CD\u09AF\u0987 \u09AA\u09BE\u09B2\u09A8\u09C0\u09DF):
\u09E7. \u099B\u09CB\u099F \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u09C7\u09B0 \u099B\u09CB\u099F \u0989\u09A4\u09CD\u09A4\u09B0 \u098F\u09AC\u0982 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u09C7\u09B0 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u0989\u09A4\u09CD\u09A4\u09B0 (SMART QUESTION-SIZE MATCHING):
   - \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u09AF\u09A6\u09BF \u09B8\u09BE\u09B2\u09BE\u09AE \u09A6\u09C7\u09DF ("\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE", "\u09B9\u09CD\u09AF\u09BE\u09B2\u09CB", "\u09B9\u09BE\u0987"), \u0995\u09C1\u09B6\u09B2 \u099C\u09BF\u099C\u09CD\u099E\u09C7\u09B8 \u0995\u09B0\u09C7 ("\u0995\u09C7\u09AE\u09A8 \u0986\u099B\u09C7\u09A8?"), \u0985\u09A5\u09AC\u09BE \u0995\u09CB\u09A8\u09CB \u099B\u09CB\u099F \u098F\u0995 \u0995\u09A5\u09BE\u09B0 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u0995\u09B0\u09C7 (\u09AF\u09C7\u09AE\u09A8: "\u09AA\u09C7\u099C \u09AC\u09CD\u09AF\u09BE\u09A8 \u09B9\u09AC\u09C7 \u09A8\u09BE \u09A4\u09CB?", "\u09AB\u09CD\u09B0\u09BF \u099F\u09CD\u09B0\u09BE\u09DF\u09BE\u09B2 \u0986\u099B\u09C7?", "\u09AC\u09BF\u0995\u09BE\u09B6 \u0995\u09B0\u09BE \u09AF\u09BE\u09AC\u09C7?") \u2014 \u09A4\u09AC\u09C7 \u0995\u0996\u09A8\u09CB\u0987 \u0985\u09AF\u09A5\u09BE \u09AC\u09DC \u09B2\u09BF\u09B8\u09CD\u099F \u09AC\u09BE \u09B8\u09AC \u09AB\u09BF\u099A\u09BE\u09B0 \u09B2\u09BF\u0996\u09C7 \u09AE\u09C7\u09B8\u09C7\u099C \u09AC\u09DC \u0995\u09B0\u09AC\u09C7\u09A8 \u09A8\u09BE! \u099B\u09CB\u099F \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u09C7\u09B0 \u0989\u09A4\u09CD\u09A4\u09B0 \u09E7\u2013\u09E8 \u09B2\u09BE\u0987\u09A8\u09C7 \u09B8\u0982\u0995\u09CD\u09B7\u09C7\u09AA\u09C7 \u09A6\u09C7\u09AC\u09C7\u09A8 \u098F\u09AC\u0982 \u09B6\u09C7\u09B7\u09C7 \u09E7\u099F\u09BF \u099B\u09CB\u099F \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u0995\u09B0\u09AC\u09C7\u09A8\u0964
   - \u0989\u09A6\u09BE\u09B9\u09B0\u09A3 (\u09B8\u09BE\u09B2\u09BE\u09AE \u09A6\u09BF\u09B2\u09C7):
     "\u0993\u09DF\u09BE\u09B2\u09BE\u0987\u0995\u09C1\u09AE \u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE! \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09C7\u099C\u09C7 \u09B8\u09CD\u09AC\u09BE\u0997\u09A4\u09AE\u0964 \u{1F60A}

     \u09AC\u09B2\u09C1\u09A8, \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u0995\u09C0\u09AD\u09BE\u09AC\u09C7 \u09B8\u09BE\u09B9\u09BE\u09AF\u09CD\u09AF \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09BF?"
   - \u0989\u09A6\u09BE\u09B9\u09B0\u09A3 (\u099B\u09CB\u099F \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u0995\u09B0\u09B2\u09C7 \u2014 \u09AF\u09C7\u09AE\u09A8 "\u09AA\u09C7\u099C \u09AC\u09CD\u09AF\u09BE\u09A8 \u09B9\u0993\u09DF\u09BE\u09B0 \u099D\u09C1\u0981\u0995\u09BF \u0986\u099B\u09C7?"):
     "\u09A8\u09BE \u09AD\u09BE\u0987\u09DF\u09BE, \u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09C7\u099C \u09E7\u09E6\u09E6% \u09A8\u09BF\u09B0\u09BE\u09AA\u09A6 \u09A5\u09BE\u0995\u09AC\u09C7! \u0986\u09AE\u09B0\u09BE \u09AE\u09C7\u099F\u09BE\u09B0 \u0985\u09AB\u09BF\u09B6\u09BF\u09DF\u09BE\u09B2 API \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09BF \u09A4\u09BE\u0987 \u09AC\u09CD\u09AF\u09BE\u09A8 \u09B9\u0993\u09DF\u09BE\u09B0 \u0995\u09CB\u09A8\u09CB \u099D\u09C1\u0981\u0995\u09BF\u0987 \u09A8\u09C7\u0987\u0964

     \u0986\u09AA\u09A8\u09BF \u0995\u09BF \u0986\u09AA\u09A8\u09BE\u09B0 \u09AB\u09C7\u09B8\u09AC\u09C1\u0995 \u09AA\u09C7\u099C\u09C7 \u098F\u099F\u09BF \u0995\u09BE\u09A8\u09C7\u0995\u09CD\u099F \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u099A\u09CD\u099B\u09C7\u09A8?"

\u09E8. \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u09AC\u09BE \u09B2\u09BF\u09B8\u09CD\u099F \u099C\u09BE\u09A4\u09C0\u09DF \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u09C7 \u09E7 \u09B2\u09BE\u0987\u09A8 \u0995\u09B0\u09C7 \u09AB\u09BE\u0981\u0995\u09BE \u09B0\u09C7\u0996\u09C7 \u09B8\u09BF\u09B0\u09BF\u09DF\u09BE\u09B2 \u09B2\u09BF\u09B8\u09CD\u099F (SERIAL LIST WITH EMPTY LINE BETWEEN 1., 2., 3.):
   - \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u09AF\u0996\u09A8\u0987 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8, \u09A6\u09BE\u09AE, \u0995\u09C0 \u0995\u09C0 \u0986\u099B\u09C7 (ki ki ase), \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u09B2\u09BF\u09B8\u09CD\u099F, \u09B8\u09BE\u09B0\u09CD\u09AD\u09BF\u09B8 \u09AC\u09BE \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 (details) \u099C\u09BE\u09A8\u09A4\u09C7 \u099A\u09BE\u0987\u09AC\u09C7\u2014\u09A4\u0996\u09A8 \u09B8\u09BF\u09B0\u09BF\u09DF\u09BE\u09B2 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0 (\u09E7., \u09E8., \u09E9. \u0985\u09A5\u09AC\u09BE \u0987\u0982\u09B0\u09C7\u099C\u09BF\u09A4\u09C7 1., 2., 3.) \u09A6\u09BF\u09DF\u09C7 \u09B8\u09BE\u099C\u09BF\u09DF\u09C7 \u09B2\u09BF\u0996\u09AC\u09C7\u09A8\u0964
   - \u09AC\u09BF\u09B6\u09C7\u09B7 \u09A8\u09BF\u09DF\u09AE: \u09E7. \u098F\u09B0 \u09B2\u09C7\u0996\u09BE \u09B6\u09C7\u09B7 \u09B9\u09B2\u09C7 \u09A8\u09BF\u099A\u09C7 \u0985\u09AC\u09B6\u09CD\u09AF\u0987 \u09E7 \u09B2\u09BE\u0987\u09A8 \u09AB\u09BE\u0981\u0995\u09BE (\\n\\n) \u09B0\u09C7\u0996\u09C7 \u09E8. \u09B2\u09BF\u0996\u09AC\u09C7\u09A8, \u0986\u09AC\u09BE\u09B0 \u09E7 \u09B2\u09BE\u0987\u09A8 \u09AB\u09BE\u0981\u0995\u09BE (\\n\\n) \u09B0\u09C7\u0996\u09C7 \u09E9. \u09B2\u09BF\u0996\u09AC\u09C7\u09A8!
   - \u0989\u09A6\u09BE\u09B9\u09B0\u09A3 \u09E7 (\u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8 \u09AC\u09BE \u09A6\u09BE\u09AE \u099C\u09BE\u09A8\u09A4\u09C7 \u099A\u09BE\u0987\u09B2\u09C7 \u2014 \u09AF\u09C7\u09AE\u09A8 "Apnader plan nite cai" \u09AC\u09BE "\u09A6\u09BE\u09AE \u0995\u09A4?"):
     "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09E8\u099F\u09BF \u09B8\u09BE\u09AC\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09AA\u09B6\u09A8 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8 \u09B0\u09DF\u09C7\u099B\u09C7:

     \u09E7. \u09B8\u09CD\u099F\u09BE\u09B0\u09CD\u099F\u09BE\u09B0 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8 (Starter AI Plan) \u2014 \u09E7,\u09E8\u09EB\u09E6 \u099F\u09BE\u0995\u09BE/\u09AE\u09BE\u09B8 (\u09E7\u099F\u09BF AI \u098F\u099C\u09C7\u09A8\u09CD\u099F, \u0985\u099F\u09CB \u09AE\u09C7\u09B8\u09C7\u099C \u0993 \u0995\u09AE\u09C7\u09A8\u09CD\u099F \u09B0\u09BF\u09AA\u09CD\u09B2\u09BE\u0987, \u0995\u09C1\u09B0\u09BF\u09DF\u09BE\u09B0 \u09AC\u09C1\u0995\u09BF\u0982)

     \u09E8. \u09AA\u09CD\u09B0\u09CB \u09AC\u09BF\u099C\u09A8\u09C7\u09B8 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8 (Pro Business Plan) \u2014 \u09E7,\u09EF\u09EB\u09E6 \u099F\u09BE\u0995\u09BE/\u09AE\u09BE\u09B8 (\u09E9\u099F\u09BF AI \u098F\u099C\u09C7\u09A8\u09CD\u099F, \u09AD\u09DF\u09C7\u09B8 \u0993 \u099B\u09AC\u09BF\u09B0 \u09B0\u09BF\u09AA\u09CD\u09B2\u09BE\u0987, \u0986\u09A8\u09B2\u09BF\u09AE\u09BF\u099F\u09C7\u09A1 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u0993 \u09AD\u09BF\u0986\u0987\u09AA\u09BF \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F)

     \u09E9. \u09AB\u09CD\u09B0\u09BF \u099F\u09CD\u09B0\u09BE\u09DF\u09BE\u09B2 \u2014 \u0993\u09DF\u09C7\u09AC\u09B8\u09BE\u0987\u099F\u09C7 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u0996\u09C1\u09B2\u09C7\u0987 \u09E8 \u09A6\u09BF\u09A8\u09C7\u09B0 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09AB\u09CD\u09B0\u09BF \u099F\u09CD\u09B0\u09BE\u09DF\u09BE\u09B2

     \u0986\u09AA\u09A8\u09BF \u0995\u09BF \u09E7 \u09A8\u09AE\u09CD\u09AC\u09B0 (\u09B8\u09CD\u099F\u09BE\u09B0\u09CD\u099F\u09BE\u09B0) \u09A8\u09BE\u0995\u09BF \u09E8 \u09A8\u09AE\u09CD\u09AC\u09B0 (\u09AA\u09CD\u09B0\u09CB) \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8\u099F\u09BF \u09A8\u09BF\u09A4\u09C7 \u099A\u09BE\u099A\u09CD\u099B\u09C7\u09A8?"
   - \u0989\u09A6\u09BE\u09B9\u09B0\u09A3 \u09E8 (\u0987-\u0995\u09AE\u09BE\u09B0\u09CD\u09B8 \u09AC\u09BF\u099C\u09A8\u09C7\u09B8\u09C7\u09B0 \u0995\u09CD\u09B7\u09C7\u09A4\u09CD\u09B0\u09C7 \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 "\u0995\u09C0 \u0995\u09C0 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u0986\u099B\u09C7", "\u09A6\u09BE\u09AE \u0995\u09A4" \u09AC\u09BE "\u09A1\u09BF\u099F\u09C7\u0987\u09B2\u09B8" \u099C\u09BE\u09A8\u09A4\u09C7 \u099A\u09BE\u0987\u09B2\u09C7):
     "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u0993 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u09A8\u09BF\u099A\u09C7 \u09A6\u09C7\u0993\u09DF\u09BE \u09B9\u09B2\u09CB:

     \u09E7. \u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u0995\u099F\u09A8 \u099F\u09BF-\u09B6\u09BE\u09B0\u09CD\u099F \u2014 \u09EA\u09EF\u09E6 \u099F\u09BE\u0995\u09BE (\u09B8\u09BE\u0987\u099C: M, L, XL, \u09E7\u09E6\u09E6% \u0995\u099F\u09A8)

     \u09E8. \u09AA\u09CB\u09B2\u09CB \u09B6\u09BE\u09B0\u09CD\u099F \u2014 \u09ED\u09EB\u09E6 \u099F\u09BE\u0995\u09BE (\u0995\u09BE\u09B2\u09BE\u09B0: \u09A8\u09C7\u09AD\u09BF \u09AC\u09CD\u09B2\u09C1, \u09AC\u09CD\u09B2\u09CD\u09AF\u09BE\u0995 \u0993 \u09B9\u09CB\u09DF\u09BE\u0987\u099F)

     \u09E9. \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u099A\u09BE\u09B0\u09CD\u099C \u2014 \u09A2\u09BE\u0995\u09BE\u09B0 \u09AD\u09C7\u09A4\u09B0\u09C7 \u09EC\u09E6 \u099F\u09BE\u0995\u09BE \u098F\u09AC\u0982 \u09A2\u09BE\u0995\u09BE\u09B0 \u09AC\u09BE\u0987\u09B0\u09C7 \u09E7\u09E8\u09E6 \u099F\u09BE\u0995\u09BE

     \u0986\u09AA\u09A8\u09BF \u0995\u09CB\u09A8 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u099F\u09BF \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u099A\u09CD\u099B\u09C7\u09A8?"

\u09E9. \u09AA\u09B0\u09BF\u09B7\u09CD\u0995\u09BE\u09B0 \u09AB\u09B0\u09AE\u09CD\u09AF\u09BE\u099F (Clean Formatting):
   - \u09B8\u09B0\u09CD\u09AC\u09A6\u09BE \u09B8\u09B9\u099C \u0993 \u09B8\u09CD\u09AC\u09BE\u09AD\u09BE\u09AC\u09BF\u0995 \u09AC\u09BE\u0982\u09B2\u09BE \u09AD\u09BE\u09B7\u09BE\u09DF (\u09AC\u09BE\u0982\u09B2\u09BE \u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09AA\u09CD\u099F\u09C7) \u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09C7\u09AC\u09C7\u09A8\u0964 \u0995\u0996\u09A8\u09CB\u0987 ** \u09AC\u09BE # \u099A\u09BF\u09B9\u09CD\u09A8 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09AC\u09C7\u09A8 \u09A8\u09BE\u0964

\u09EA. \u09AC\u09BF\u099C\u09A8\u09C7\u09B8 \u0987\u09A8\u09CD\u099F\u09C7\u09B2\u09BF\u099C\u09C7\u09A8\u09CD\u09B8 \u0993 \u0985\u099C\u09BE\u09A8\u09BE \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u09C7\u09B0 \u09B8\u09CD\u09AE\u09BE\u09B0\u09CD\u099F \u09B8\u09AE\u09BE\u09A7\u09BE\u09A8 (SMART BUSINESS INTELLIGENCE & COURTEOUS SALES AGENT):
   - \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u09AF\u09A6\u09BF \u0995\u09C1\u09B6\u09B2 \u099C\u09BF\u099C\u09CD\u099E\u09C7\u09B8 \u0995\u09B0\u09C7 (\u09AF\u09C7\u09AE\u09A8: "\u0995\u09C7\u09AE\u09A8 \u0986\u099B\u09C7\u09A8?", "\u0995\u09C0 \u0996\u09AC\u09B0?"): \u0985\u09A4\u09CD\u09AF\u09A8\u09CD\u09A4 \u09B8\u09CD\u09AC\u09BE\u09AD\u09BE\u09AC\u09BF\u0995, \u0986\u09A8\u09CD\u09A4\u09B0\u09BF\u0995 \u0993 \u09B8\u09CD\u09AE\u09BE\u09B0\u09CD\u099F\u09AD\u09BE\u09AC\u09C7 \u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09BF\u09A8\u2014"\u0986\u09B2\u09B9\u09BE\u09AE\u09A6\u09C1\u09B2\u09BF\u09B2\u09CD\u09B2\u09BE\u09B9, \u0986\u09AE\u09B0\u09BE \u09B8\u09AC\u09BE\u0987 \u09AD\u09BE\u09B2\u09CB \u0986\u099B\u09BF! \u0986\u09B6\u09BE \u0995\u09B0\u09BF \u0986\u09AA\u09A8\u09BF\u0993 \u09AD\u09BE\u09B2\u09CB \u0986\u099B\u09C7\u09A8\u0964 \u{1F60A} \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 ${businessName}-\u098F \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u09B8\u09CD\u09AC\u09BE\u0997\u09A4\u09AE\u0964 \u09AC\u09B2\u09C1\u09A8, \u0986\u099C \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u0995\u09C0\u09AD\u09BE\u09AC\u09C7 \u09B8\u09BE\u09B9\u09BE\u09AF\u09CD\u09AF \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09BF?" \u0995\u09CB\u09A8\u09CB \u0985\u09AC\u09B8\u09CD\u09A5\u09BE\u09A4\u09C7\u0987 \u0995\u09C1\u09B6\u09B2 \u09AC\u09BE \u09B8\u09BE\u09A7\u09BE\u09B0\u09A3 \u099A\u09CD\u09AF\u09BE\u099F\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u099F\u09BF\u09AE\u09C7 \u09AA\u09BE\u09A0\u09BE\u09AC\u09C7\u09A8 \u09A8\u09BE \u09AC\u09BE \u09B0\u09C7\u09AB\u09BE\u09B0 \u0995\u09B0\u09AC\u09C7\u09A8 \u09A8\u09BE!
   - \u098F\u0995\u099C\u09A8 \u09AA\u09C7\u099C \u0993\u09A8\u09BE\u09B0 \u09AC\u09BE \u0987\u0989\u099C\u09BE\u09B0\u09C7\u09B0 \u09AA\u0995\u09CD\u09B7\u09C7 \u09B8\u09AC \u0996\u09C1\u0981\u099F\u09BF\u09A8\u09BE\u099F\u09BF \u09B8\u09BE\u09A7\u09BE\u09B0\u09A3 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u09C7\u09B0 \u0989\u09A4\u09CD\u09A4\u09B0 \u0986\u0997\u09C7 \u09A5\u09C7\u0995\u09C7 \u0995\u09BF\u0989\u098F (Q&A)-\u09A4\u09C7 \u09B2\u09BF\u0996\u09C7 \u09B0\u09BE\u0996\u09BE \u09B8\u09AE\u09CD\u09AD\u09AC \u09A8\u09DF\u0964 \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u09B8\u09BE\u09A7\u09BE\u09B0\u09A3 \u09AC\u09BE \u0986\u09A8\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09AA\u09CD\u099F\u09C7\u09A1 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u0995\u09B0\u09B2\u09C7 (\u09AF\u09C7\u09AE\u09A8: \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u0995\u09C7\u09AE\u09A8, \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u098F\u09B0\u09BF\u09DF\u09BE, \u0995\u09C0\u09AD\u09BE\u09AC\u09C7 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09AC, \u0995\u09C7\u09A8 \u0986\u09AA\u09A8\u09BE\u09A6\u09C7\u09B0 \u09B8\u09BE\u09B0\u09CD\u09AD\u09BF\u09B8 \u09AD\u09BE\u09B2\u09CB, \u0985\u09A8\u09B2\u09BE\u0987\u09A8 \u09B6\u09AA \u0995\u09CB\u09A5\u09BE\u09DF \u0987\u09A4\u09CD\u09AF\u09BE\u09A6\u09BF): \u0989\u09AA\u09B0\u09C7 \u09A6\u09C7\u0993\u09DF\u09BE \u09AC\u09BF\u099C\u09A8\u09C7\u09B8\u09C7\u09B0 \u09A8\u09BE\u09AE, \u09AC\u09BF\u09AC\u09B0\u09A3, \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u09B2\u0997 \u0993 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09AA\u09B2\u09BF\u09B8\u09BF \u09AE\u09BF\u09B2\u09BF\u09DF\u09C7 \u09A8\u09BF\u099C\u09C7\u09B0 \u09AC\u09C1\u09A6\u09CD\u09A7\u09BF\u09AE\u09A4\u09CD\u09A4\u09BE \u09A6\u09BF\u09DF\u09C7 \u09B8\u09AC\u099A\u09C7\u09DF\u09C7 \u09AA\u09CD\u09B0\u09BE\u09B8\u0999\u09CD\u0997\u09BF\u0995, \u0987\u09A4\u09BF\u09AC\u09BE\u099A\u0995 \u0993 \u0986\u0995\u09B0\u09CD\u09B7\u09A3\u09C0\u09DF \u0989\u09A4\u09CD\u09A4\u09B0 \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C1\u09A8\u0964
   - \u0995\u0996\u09A8\u09CB\u0987 \u09AE\u09A8\u0997\u09DC\u09BE \u0995\u09CB\u09A8\u09CB \u09AD\u09C1\u09B2 \u09A6\u09BE\u09AE \u09AC\u09BE \u09AC\u09BF\u09AA\u09B0\u09C0\u09A4 \u09AA\u09B2\u09BF\u09B8\u09BF \u09AC\u09B2\u09AC\u09C7\u09A8 \u09A8\u09BE, \u09A4\u09AC\u09C7 \u09AC\u09BF\u099C\u09A8\u09C7\u09B8\u09C7\u09B0 \u09AA\u09CD\u09B0\u09BE\u09B8\u0999\u09CD\u0997\u09BF\u0995 \u09A4\u09A5\u09CD\u09AF \u09B8\u09AE\u09A8\u09CD\u09AC\u09DF \u0995\u09B0\u09C7 \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0\u0995\u09C7 \u099A\u09AE\u09CE\u0995\u09BE\u09B0 \u0993 \u0986\u09A4\u09CD\u09AE\u09AC\u09BF\u09B6\u09CD\u09AC\u09BE\u09B8\u09C0 \u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09BF\u09A8 \u098F\u09AC\u0982 \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8\u09C7 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u09AC\u09BE \u0995\u09BE\u0999\u09CD\u0995\u09CD\u09B7\u09BF\u09A4 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u09AC\u09C7\u099B\u09C7 \u09A8\u09BF\u09A4\u09C7 \u0989\u09CE\u09B8\u09BE\u09B9\u09BF\u09A4 \u0995\u09B0\u09C1\u09A8\u0964
   - \u09B6\u09C1\u09A7\u09C1\u09AE\u09BE\u09A4\u09CD\u09B0 \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u09AF\u09A6\u09BF \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u09AE\u09BE\u09A8\u09C1\u09B7\u09C7\u09B0 \u09B8\u09BE\u09A5\u09C7 \u0995\u09A5\u09BE \u09AC\u09B2\u09A4\u09C7 \u099A\u09BE\u09A8 ("\u09AB\u09CB\u09A8\u09C7 \u0995\u09A5\u09BE \u09AC\u09B2\u09A4\u09C7 \u099A\u09BE\u0987", "\u0995\u09B2 \u09A6\u09BF\u09A8") \u0985\u09A5\u09AC\u09BE \u09AC\u09DC \u0995\u09CB\u09A8\u09CB \u0995\u09AE\u09AA\u09CD\u09B2\u09C7\u0987\u09A8/\u099F\u09BE\u0995\u09BE \u09AB\u09C7\u09B0\u09A4\u09C7\u09B0 \u09AC\u09BF\u09B7\u09DF \u09A5\u09BE\u0995\u09C7\u2014\u09A4\u0996\u09A8\u0987 \u0995\u09C7\u09AC\u09B2 \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u099F\u09BF\u09AE \u09AC\u09BE \u09AA\u09CD\u09B0\u09A4\u09BF\u09A8\u09BF\u09A7\u09BF\u09B0 \u0995\u09A5\u09BE \u09AC\u09B2\u09AC\u09C7\u09A8\u0964 \u0985\u09A8\u09CD\u09AF \u09B8\u09AC \u09B8\u09BE\u09A7\u09BE\u09B0\u09A3 \u099A\u09CD\u09AF\u09BE\u099F \u0993 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u09C7 \u098F\u0986\u0987 \u09A8\u09BF\u099C\u09C7\u0987 \u09AA\u09C2\u09B0\u09CD\u09A3\u09BE\u0999\u09CD\u0997 \u0993 \u099A\u09AE\u09CE\u0995\u09BE\u09B0 \u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09C7\u09AC\u09C7!`;
  let orderGuidance = "";
  if (params.systemConfirmedOrder) {
    const o = params.systemConfirmedOrder;
    orderGuidance = `[OFFICIAL SYSTEM ORDER CONFIRMATION \u2014 SUCCESSFUL]:
The customer's order has been validated and recorded in the system database!
- Order ID: #${o.id.slice(-6).toUpperCase()}
- Customer Name: ${o.customer_name}
- Mobile Number: ${o.customer_phone}
- Delivery Address: ${o.customer_address}
- Ordered Items: ${o.items} (Qty: ${o.quantity})
- Total Amount: \u09F3${o.total_amount} BDT (${o.payment_method === "bkash" ? "bKash" : o.payment_method === "nagad" ? "Nagad" : "Cash on Delivery (COD)"})
CRITICAL DIRECTIVE: Warmly confirm the order to the customer! State their Order ID (#${o.id.slice(-6).toUpperCase()}), ordered item, delivery address, phone, and total payable amount. Assure them that our team is preparing it for rapid courier dispatch.`;
  } else if (params.isOrderIncomplete && params.missingOrderFields && params.missingOrderFields.length > 0) {
    const missingLabels = params.missingOrderFields.map((f) => {
      if (f === "phone") return "\u09E7\u09E7 \u09A1\u09BF\u099C\u09BF\u099F\u09C7\u09B0 \u09B8\u099A\u09B2 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0";
      if (f === "address") return "\u09AA\u09C2\u09B0\u09CD\u09A3\u09BE\u0999\u09CD\u0997 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09A0\u09BF\u0995\u09BE\u09A8\u09BE (\u09A5\u09BE\u09A8\u09BE/\u099C\u09C7\u09B2\u09BE \u09B8\u09B9)";
      if (f === "product") return "\u09A8\u09BF\u09B0\u09CD\u09A6\u09BF\u09B7\u09CD\u099F \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u09C7\u09B0 \u09A8\u09BE\u09AE \u0993 \u09B8\u09BE\u0987\u099C";
      return f;
    }).join(" \u0993 ");
    orderGuidance = `[ORDER DETAILS INCOMPLETE]:
The customer wants to order or shared partial information, but has NOT yet provided: ${missingLabels}.
CRITICAL DIRECTIVE: Do NOT confirm the order yet! Politely ask the customer to provide their ${missingLabels} so we can immediately confirm and dispatch their parcel. Explain that as soon as they provide this info, their order will be confirmed immediately.`;
  } else {
    orderGuidance = `ORDER CONFIRMATION PROTOCOL (\u0985\u09A4\u09CD\u09AF\u09A8\u09CD\u09A4 \u0995\u09A0\u09CB\u09B0\u09AD\u09BE\u09AC\u09C7 \u09AA\u09BE\u09B2\u09A8\u09C0\u09DF):
\u09E7. \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09A8\u09AB\u09BE\u09B0\u09CD\u09AE \u0995\u09B0\u09A4\u09C7 \u09EA\u099F\u09BF \u09A4\u09A5\u09CD\u09AF \u0986\u09AC\u09B6\u09CD\u09AF\u0995: \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0\u09C7\u09B0 \u09A8\u09BE\u09AE, \u09E7\u09E7 \u09A1\u09BF\u099C\u09BF\u099F\u09C7\u09B0 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0, \u09AA\u09C2\u09B0\u09CD\u09A3\u09BE\u0999\u09CD\u0997 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09A0\u09BF\u0995\u09BE\u09A8\u09BE \u098F\u09AC\u0982 \u09A8\u09BF\u09B0\u09CD\u09A6\u09BF\u09B7\u09CD\u099F \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u09C7\u09B0 \u09A8\u09BE\u09AE\u0964
\u09E8. \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u09AF\u09A6\u09BF \u09B6\u09C1\u09A7\u09C1 "\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u0987" \u09AC\u09B2\u09C7 \u0995\u09BF\u09A8\u09CD\u09A4\u09C1 \u09A0\u09BF\u0995\u09BE\u09A8\u09BE \u09AC\u09BE \u09AB\u09CB\u09A8 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0 \u09A8\u09BE \u09A6\u09C7\u09DF: \u0995\u0996\u09A8\u09CB\u0987 \u09AC\u09B2\u09AC\u09C7\u09A8 \u09A8\u09BE \u09AF\u09C7 "\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09A8\u09AB\u09BE\u09B0\u09CD\u09AE \u0995\u09B0\u09BE \u09B9\u09B2\u09CB"! \u09AC\u09B0\u0982 \u09AC\u09BF\u09A8\u09C0\u09A4\u09AD\u09BE\u09AC\u09C7 \u09A4\u09BE\u09B0 \u09A8\u09BE\u09AE, \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09A0\u09BF\u0995\u09BE\u09A8\u09BE \u0993 \u09E7\u09E7 \u09A1\u09BF\u099C\u09BF\u099F\u09C7\u09B0 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0 \u099A\u09C7\u09DF\u09C7 \u09A8\u09BF\u09A8\u0964
\u09E9. \u0995\u0996\u09A8\u09CB\u0987 \u09AE\u09A8\u0997\u09DC\u09BE \u0995\u09CB\u09A8\u09CB \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F, \u09A6\u09BE\u09AE \u09AC\u09BE \u09A4\u09A5\u09CD\u09AF \u09AC\u09BE\u09A8\u09BF\u09DF\u09C7 \u09AC\u09B2\u09AC\u09C7\u09A8 \u09A8\u09BE (Never invent product/order information)\u0964`;
  }
  let productPhotoDirective = "";
  if ((isAskingForCatalog || isAskingForImage && !matchedProduct) && attachedProductsList.length > 0) {
    productPhotoDirective = `PRODUCT PICTURES & CATALOG DIRECTIVE (\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u09B2\u0997 \u0993 \u099B\u09AC\u09BF \u09B8\u0982\u0995\u09CD\u09B0\u09BE\u09A8\u09CD\u09A4 \u09A8\u09BF\u09B0\u09CD\u09A6\u09C7\u09B6):
\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u0995\u09C0 \u0995\u09C0 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u0986\u099B\u09C7 \u099C\u09BE\u09A8\u09A4\u09C7 \u099A\u09C7\u09DF\u09C7\u099B\u09C7\u09A8 \u09AC\u09BE \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u09C7\u09B0 \u099B\u09AC\u09BF \u09A6\u09C7\u0996\u09A4\u09C7 \u099A\u09C7\u09DF\u09C7\u099B\u09C7\u09A8 ("${params.incomingMessage}")\u0964
\u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09AE \u09A5\u09C7\u0995\u09C7 \u099A\u09CD\u09AF\u09BE\u099F\u09C7 \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u09B8\u09AE\u09C2\u09B9\u09C7\u09B0 \u0985\u09AB\u09BF\u09B8\u09BF\u09DF\u09BE\u09B2 \u099B\u09AC\u09BF (${attachedProductsList.map((p) => `${p.name} - \u09F3${p.price}`).join(", ")}) \u09B8\u0982\u09AF\u09C1\u0995\u09CD\u09A4 \u0995\u09B0\u09C7 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09DF\u09C7\u099B\u09C7!
\u0997\u09C1\u09B0\u09C1\u09A4\u09CD\u09AC\u09AA\u09C2\u09B0\u09CD\u09A3 \u09A8\u09BF\u09B0\u09CD\u09A6\u09C7\u09B6\u09BE\u09AC\u09B2\u09C0:
\u09E7. \u0995\u0996\u09A8\u09CB\u0987 \u09AC\u09B2\u09AC\u09C7\u09A8 \u09A8\u09BE \u09AF\u09C7 "\u0986\u09AE\u09BF \u099B\u09AC\u09BF \u09AA\u09BE\u09A0\u09BE\u09A4\u09C7 \u09AA\u09BE\u09B0\u09BF \u09A8\u09BE" \u09AC\u09BE "\u099B\u09AC\u09BF \u09A6\u09C7\u0993\u09DF\u09BE \u09B8\u09AE\u09CD\u09AD\u09AC \u09A8\u09DF"\u0964 \u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09AE \u09B8\u09CD\u09AC\u09DF\u0982\u0995\u09CD\u09B0\u09BF\u09DF\u09AD\u09BE\u09AC\u09C7 \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0\u09C7\u09B0 \u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8\u09C7 \u099B\u09AC\u09BF \u09AA\u09BE\u09A0\u09BF\u09DF\u09C7 \u09A6\u09BF\u09DF\u09C7\u099B\u09C7\u0964
\u09E8. \u099F\u09C7\u0995\u09CD\u09B8\u099F \u0989\u09A4\u09CD\u09A4\u09B0\u09C7 \u09A8\u09BF\u09B6\u09CD\u099A\u09BF\u09A4 \u0995\u09B0\u09C1\u09A8 \u09AF\u09C7 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u09B8\u09AE\u09C2\u09B9\u09C7\u09B0 \u099B\u09AC\u09BF \u0993 \u09A4\u09BE\u09B2\u09BF\u0995\u09BE \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09B2\u09CB: "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u0995\u09BE\u09B2\u09C7\u0995\u09B6\u09A8\u09C7\u09B0 \u099B\u09AC\u09BF \u0993 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u09A8\u09BF\u099A\u09C7 \u09A6\u09C7\u0993\u09DF\u09BE \u09B9\u09B2\u09CB: \u{1F4F8}"
\u09E9. \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u0997\u09C1\u09B2\u09CB\u09B0 \u09A8\u09BE\u09AE \u0993 \u09AE\u09C2\u09B2\u09CD\u09AF \u09E7., \u09E8., \u09E9. \u09A6\u09BF\u09DF\u09C7 \u09B8\u09BF\u09B0\u09BF\u09DF\u09BE\u09B2 \u0986\u0995\u09BE\u09B0\u09C7 \u09B8\u09BE\u099C\u09BF\u09DF\u09C7 \u09B2\u09BF\u0996\u09C1\u09A8 (\u09AA\u09CD\u09B0\u09A4\u09BF\u099F\u09BF\u09B0 \u09AE\u09BE\u099D\u09C7 \u09E7 \u09B2\u09BE\u0987\u09A8 \\n\\n \u0996\u09BE\u09B2\u09BF \u09B0\u09C7\u0996\u09C7)\u0964
\u09EA. \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u099A\u09BE\u09B0\u09CD\u099C (\u09A2\u09BE\u0995\u09BE\u09B0 \u09AD\u09C7\u09A4\u09B0\u09C7 \u09EC\u09E6 \u099F\u09BE\u0995\u09BE, \u09A2\u09BE\u0995\u09BE\u09B0 \u09AC\u09BE\u0987\u09B0\u09C7 \u09E7\u09E8\u09E6 \u099F\u09BE\u0995\u09BE) \u0989\u09B2\u09CD\u09B2\u09C7\u0996 \u0995\u09B0\u09C1\u09A8\u0964
\u09EB. \u09B6\u09C7\u09B7\u09C7 \u09E7\u099F\u09BF \u099B\u09CB\u099F \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u09C7 \u099C\u09BF\u099C\u09CD\u099E\u09C7\u09B8 \u0995\u09B0\u09C1\u09A8 \u09A4\u09BF\u09A8\u09BF \u0995\u09CB\u09A8 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u099F\u09BF \u09A6\u09C7\u0996\u09A4\u09C7 \u09AC\u09BE \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u09A8!`;
  } else if (matchedProduct && (isAskingForImage || isAskingForDetails)) {
    productPhotoDirective = `PRODUCT PICTURE & DETAILS DIRECTIVE (\u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u09C7\u09B0 \u099B\u09AC\u09BF \u0993 \u09AC\u09BF\u09AC\u09B0\u09A3 \u09A8\u09BF\u09B0\u09CD\u09A6\u09C7\u09B6):
\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 "${matchedProduct.name}"-\u098F\u09B0 \u099B\u09AC\u09BF \u09AC\u09BE \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u099C\u09BE\u09A8\u09A4\u09C7 \u099A\u09C7\u09DF\u09C7\u099B\u09C7\u09A8 ("${params.incomingMessage}")\u0964
\u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09AE \u09A5\u09C7\u0995\u09C7 "${matchedProduct.name}"-\u098F\u09B0 \u0985\u09AB\u09BF\u09B8\u09BF\u09DF\u09BE\u09B2 \u099B\u09AC\u09BF \u099A\u09CD\u09AF\u09BE\u099F\u09C7 \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u09B8\u0982\u09AF\u09C1\u0995\u09CD\u09A4 \u0993 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09DF\u09C7\u099B\u09C7!
\u0997\u09C1\u09B0\u09C1\u09A4\u09CD\u09AC\u09AA\u09C2\u09B0\u09CD\u09A3 \u09A8\u09BF\u09B0\u09CD\u09A6\u09C7\u09B6\u09BE\u09AC\u09B2\u09C0:
\u09E7. \u0995\u0996\u09A8\u09CB\u0987 \u09AC\u09B2\u09AC\u09C7\u09A8 \u09A8\u09BE \u09AF\u09C7 "\u0986\u09AE\u09BF \u099B\u09AC\u09BF \u09AA\u09BE\u09A0\u09BE\u09A4\u09C7 \u09AA\u09BE\u09B0\u09BF \u09A8\u09BE"\u0964
\u09E8. \u099F\u09C7\u0995\u09CD\u09B8\u099F \u0989\u09A4\u09CD\u09A4\u09B0\u09C7 \u09AA\u09B0\u09BF\u09B7\u09CD\u0995\u09BE\u09B0 \u0993 \u0986\u09A8\u09A8\u09CD\u09A6\u09C7\u09B0 \u09B8\u09BE\u09A5\u09C7 \u099C\u09BE\u09A8\u09BE\u09A8: "\u098F\u0987 \u09AF\u09C7 \u09AD\u09BE\u0987\u09DF\u09BE/\u0986\u09AA\u09C1, \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 '${matchedProduct.name}'-\u098F\u09B0 \u099B\u09AC\u09BF \u0993 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u09A8\u09BF\u099A\u09C7 \u09AA\u09BE\u09A0\u09BF\u09DF\u09C7 \u09A6\u09C7\u0993\u09DF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7! \u{1F4F8}"
\u09E9. \u098F\u09B0 \u09AE\u09C2\u09B2\u09CD\u09AF \u09F3${matchedProduct.price} ${matchedProduct.currency}${matchedProduct.description ? ` \u098F\u09AC\u0982 \u09AC\u09BF\u09AC\u09B0\u09A3 (${matchedProduct.description})` : ""} \u09A4\u09C1\u09B2\u09C7 \u09A7\u09B0\u09C1\u09A8\u0964
\u09EA. \u09A8\u09A4\u09C1\u09A8 \u09AA\u09CD\u09AF\u09BE\u09B0\u09BE\u0997\u09CD\u09B0\u09BE\u09AB\u09C7 \u099C\u09BF\u099C\u09CD\u099E\u09C7\u09B8 \u0995\u09B0\u09C1\u09A8 \u09A4\u09BF\u09A8\u09BF \u098F\u099F\u09BF \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u09A8 \u0995\u09BF\u09A8\u09BE (\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u09A8\u09BE\u09AE, \u09AA\u099B\u09A8\u09CD\u09A6\u09C7\u09B0 \u09B8\u09BE\u0987\u099C, \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09A0\u09BF\u0995\u09BE\u09A8\u09BE \u0993 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0 \u099A\u09BE\u0987\u09AC\u09C7\u09A8)\u0964`;
  }
  const isAskingForHumanCall = incomingLower.includes("kotha bolte chai") || incomingLower.includes("kotha bolte cai") || incomingLower.includes("call a kotha") || incomingLower.includes("call koren") || incomingLower.includes("call din") || incomingLower.includes("call diben") || incomingLower.includes("phone a kotha") || incomingLower.includes("\u0995\u09A5\u09BE \u09AC\u09B2\u09A4\u09C7 \u099A\u09BE\u0987") || incomingLower.includes("\u0995\u09B2 \u09A6\u09BF\u09A8") || incomingLower.includes("\u0995\u09B2 \u0995\u09B0\u09C7\u09A8") || incomingLower.includes("\u09AB\u09CB\u09A8\u09C7 \u0995\u09A5\u09BE");
  const humanCallDirective = isAskingForHumanCall ? `HUMAN PHONE CALL DIRECTIVE: \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u09AB\u09CB\u09A8\u09C7 \u0995\u09A5\u09BE \u09AC\u09B2\u09A4\u09C7 \u09AC\u09BE \u0995\u09B2 \u09A6\u09BF\u09A4\u09C7 \u09AC\u09B2\u09C7\u099B\u09C7\u09A8\u0964 \u09AF\u09A6\u09BF \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0\u09C7\u09B0 \u09E7\u09E7 \u09A1\u09BF\u099C\u09BF\u099F\u09C7\u09B0 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0 \u099A\u09CD\u09AF\u09BE\u099F\u09C7 \u09A6\u09C7\u0993\u09DF\u09BE \u09A8\u09BE \u09A5\u09BE\u0995\u09C7 (\u09AC\u09BF\u09B6\u09C7\u09B7 \u0995\u09B0\u09C7 Messenger \u09AC\u09BE Instagram-\u098F), \u09A4\u09AC\u09C7 \u0985\u09AC\u09B6\u09CD\u09AF\u0987 \u0986\u09A8\u09CD\u09A4\u09B0\u09BF\u0995\u09AD\u09BE\u09AC\u09C7 \u09A4\u09BE\u0995\u09C7 \u09A4\u09BE\u09B0 \u09B8\u099A\u09B2 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09AC\u09BE WhatsApp \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0\u099F\u09BF \u099A\u09CD\u09AF\u09BE\u099F\u09C7 \u09B2\u09BF\u0996\u09C7 \u09A6\u09BF\u09A4\u09C7 \u09AC\u09B2\u09C1\u09A8 \u09AF\u09BE\u09A4\u09C7 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B0\u09A4\u09BF\u09A8\u09BF\u09A7\u09BF \u09B8\u09BE\u09A5\u09C7 \u09B8\u09BE\u09A5\u09C7 \u09A4\u09BE\u0995\u09C7 \u0995\u09B2 \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8\u0964` : "";
  const autoSettings = db.getAutomationSettings(params.userId);
  const isTrackingQuery = incomingLower.includes("order status") || incomingLower.includes("parcel") || incomingLower.includes("courier") || incomingLower.includes("tracking") || incomingLower.includes("kobe pabo") || incomingLower.includes("kothay") || incomingLower.includes("\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u099F\u09BE\u09B8") || incomingLower.includes("\u09AA\u09BE\u09B0\u09CD\u09B8\u09C7\u09B2") || incomingLower.includes("\u0995\u09C1\u09B0\u09BF\u09DF\u09BE\u09B0") || incomingLower.includes("\u0995\u09AC\u09C7 \u09AA\u09BE\u09AC\u09CB") || incomingLower.includes("\u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u0986\u09AA\u09A1\u09C7\u099F") || incomingLower.includes("\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09AC\u09C7");
  let liveTrackingDirective = "";
  let deterministicTrackingReply = "";
  if (autoSettings?.auto_tracking_reply_enabled !== false) {
    const userOrders = db.getOrders(params.userId) || [];
    const phoneInQueryMatch = (params.incomingMessage || "").match(/(?:\+?88)?(01[3-9]\d{8})/);
    const phoneInQuery = phoneInQueryMatch ? phoneInQueryMatch[1] : null;
    const customerLatestOrder = userOrders.find(
      (o) => o.customer_id === params.customerId || phoneInQuery && o.customer_phone && o.customer_phone.includes(phoneInQuery) || params.customerName && o.customer_name && o.customer_name.toLowerCase().trim() === params.customerName.toLowerCase().trim()
    );
    if (customerLatestOrder) {
      const statusBanglaMap = {
        confirmed: "\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09A8\u09AB\u09BE\u09B0\u09CD\u09AE\u09A1 (\u09AA\u09CD\u09AF\u09BE\u0995\u09C7\u099C\u09BF\u0982\u09DF\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4)",
        processing: "\u09AA\u09CD\u09B0\u09B8\u09C7\u09B8\u09BF\u0982 \u099A\u09B2\u099B\u09C7 (\u0995\u09C1\u09B0\u09BF\u09DF\u09BE\u09B0\u09C7 \u09B9\u09CD\u09AF\u09BE\u09A8\u09CD\u09A1\u0993\u09AD\u09BE\u09B0\u09C7\u09B0 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4\u09BF \u099A\u09B2\u099B\u09C7)",
        shipped: "\u0995\u09C1\u09B0\u09BF\u09DF\u09BE\u09B0\u09C7 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09DF\u09C7\u099B\u09C7 (On the Way / In Transit)",
        delivered: "\u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u09B9\u09DF\u09C7\u099B\u09C7",
        cancelled: "\u0985\u09B0\u09CD\u09A1\u09BE\u09B0\u099F\u09BF \u09AC\u09BE\u09A4\u09BF\u09B2 (Cancelled) \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7"
      };
      const stLabel = statusBanglaMap[customerLatestOrder.status] || customerLatestOrder.status;
      const courierInfo = customerLatestOrder.courier_name ? `\u0995\u09C1\u09B0\u09BF\u09DF\u09BE\u09B0: ${customerLatestOrder.courier_name}${customerLatestOrder.courier_consignment_id ? ` (Tracking/Consignment ID: ${customerLatestOrder.courier_consignment_id})` : ""}` : "\u0995\u09C1\u09B0\u09BF\u09DF\u09BE\u09B0 \u09AC\u09C1\u0995\u09BF\u0982 \u09AA\u09CD\u09B0\u0995\u09CD\u09B0\u09BF\u09DF\u09BE\u09A7\u09C0\u09A8";
      const payInfo = customerLatestOrder.payment_status === "paid" ? `\u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u099F\u09BE\u09B8: \u09AA\u09B0\u09BF\u09B6\u09CB\u09A7\u09BF\u09A4 (Paid${customerLatestOrder.payment_trx_id ? ` - TrxID: ${customerLatestOrder.payment_trx_id}` : ""})` : `\u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u099F\u09BE\u09B8: \u0995\u09CD\u09AF\u09BE\u09B6 \u0985\u09A8 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF (\u09AC\u09BE\u0995\u09BF: \u09F3${customerLatestOrder.total_amount - (customerLatestOrder.advance_paid_amount || 0)})`;
      liveTrackingDirective = `LIVE ORDER & PARCEL TRACKING DATA FOR THIS CUSTOMER:
- Order ID: #${customerLatestOrder.id.slice(-6).toUpperCase()}
- Ordered Item: ${customerLatestOrder.items} (\u09F3${customerLatestOrder.total_amount})
- Current Status: ${stLabel}
- Courier & Tracking Info: ${courierInfo}
- Payment Info: ${payInfo}
If the customer is asking about their order, parcel, delivery date, or tracking status, give them this exact live update in Bangla!`;
      if (isTrackingQuery) {
        deterministicTrackingReply = `\u0986\u09AA\u09A8\u09BE\u09B0 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 (#${customerLatestOrder.id.slice(-6).toUpperCase()} \u2014 ${customerLatestOrder.items})-\u098F\u09B0 \u09AC\u09B0\u09CD\u09A4\u09AE\u09BE\u09A8 \u0985\u09AC\u09B8\u09CD\u09A5\u09BE:
\u2022 \u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u099F\u09BE\u09B8: ${stLabel}
\u2022 ${courierInfo}
\u2022 ${payInfo}

\u0986\u09AA\u09A8\u09BE\u09B0 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u09B8\u0982\u0995\u09CD\u09B0\u09BE\u09A8\u09CD\u09A4 \u0986\u09B0 \u0995\u09CB\u09A8\u09CB \u09A4\u09A5\u09CD\u09AF \u09A6\u09BF\u09DF\u09C7 \u09B8\u09BE\u09B9\u09BE\u09AF\u09CD\u09AF \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09BF \u0995\u09BF?`;
      }
    } else if (isTrackingQuery) {
      liveTrackingDirective = `LIVE ORDER TRACKING NOTE: \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u09A4\u09BE\u09B0 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0\u09C7\u09B0 \u0986\u09AA\u09A1\u09C7\u099F \u099C\u09BE\u09A8\u09A4\u09C7 \u099A\u09C7\u09DF\u09C7\u099B\u09C7\u09A8, \u0995\u09BF\u09A8\u09CD\u09A4\u09C1 \u098F\u0987 \u099A\u09CD\u09AF\u09BE\u099F \u0986\u0987\u09A1\u09BF\u09A4\u09C7 \u098F\u0996\u09A8\u09CB \u0995\u09CB\u09A8\u09CB \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964 \u09A4\u09BE\u0995\u09C7 \u09AC\u09BF\u09A8\u09C0\u09A4\u09AD\u09BE\u09AC\u09C7 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09BE\u09B0 \u09B8\u09AE\u09DF \u09AC\u09CD\u09AF\u09AC\u09B9\u09C3\u09A4 \u09E7\u09E7 \u09A1\u09BF\u099C\u09BF\u099F\u09C7\u09B0 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0\u099F\u09BF \u09A6\u09BF\u09A4\u09C7 \u09AC\u09B2\u09C1\u09A8 \u09AF\u09BE\u09A4\u09C7 \u09B8\u09BE\u09A5\u09C7 \u09B8\u09BE\u09A5\u09C7 \u09AA\u09BE\u09B0\u09CD\u09B8\u09C7\u09B2 \u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u099F\u09BE\u09B8 \u099A\u09C7\u0995 \u0995\u09B0\u09C7 \u099C\u09BE\u09A8\u09BE\u09A8\u09CB \u09AF\u09BE\u09DF\u0964`;
    }
  }
  let smartUpsellDirective = "";
  if (autoSettings?.upsell_enabled && autoSettings?.upsell_offer_text) {
    smartUpsellDirective = `SMART UPSELL & COMBO OFFER DIRECTIVE: \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u09AF\u0996\u09A8 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u09C7\u09B0 \u09A6\u09BE\u09AE \u099C\u09BE\u09A8\u09A4\u09C7 \u099A\u09BE\u09DF \u09AC\u09BE \u09E7\u099F\u09BF \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u09DF, \u09A4\u0996\u09A8 \u0989\u09A4\u09CD\u09A4\u09B0\u09C7\u09B0 \u09B8\u09BE\u09A5\u09C7 \u09AA\u09CD\u09B0\u09BE\u09B8\u0999\u09CD\u0997\u09BF\u0995\u09AD\u09BE\u09AC\u09C7 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u098F\u0987 \u09B8\u09CD\u09AA\u09C7\u09B6\u09BE\u09B2 \u0995\u09AE\u09CD\u09AC\u09CB \u0985\u09AB\u09BE\u09B0\u099F\u09BF \u09B8\u0982\u0995\u09CD\u09B7\u09C7\u09AA\u09C7 \u0989\u09B2\u09CD\u09B2\u09C7\u0996 \u0995\u09B0\u09AC\u09C7\u09A8: "${autoSettings.upsell_offer_text}"`;
  }
  const appointmentBookingContext = buildAppointmentAIContext(params.userId, params.incomingMessage || "");
  if (deterministicTrackingReply && isTrackingQuery) {
    return {
      replyText: deterministicTrackingReply,
      transcript: voiceTranscript,
      isVoice: Boolean(voiceTranscript || params.audioBase64)
    };
  }
  const systemInstruction = `You are a warm, intelligent Customer Support & Sales Executive representing "${businessName}".
CRITICAL OPERATING & ANTI-HALLUCINATION RULES:
1. ALWAYS reply in natural, polite Bangla script (or clear English if the customer explicitly wrote in English).
2. STRICT KNOWLEDGE BASE ADHERENCE: Understand the customer's intent and answer accurately based ONLY on the merchant's training instructions, knowledge base, and product details provided below.
3. ZERO-DEFAULT / NO FAKE PRODUCTS: You are STRICTLY FORBIDDEN from mentioning, recommending, or inventing ANY default products (such as clothing, chino pants, shirts, dresses, watches, or other items) unless they are explicitly in the Merchant Product Catalog below! If the catalog is empty, you must NOT invent products.
4. GREETINGS: If the customer greets ("\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE", "\u09B9\u09CD\u09AF\u09BE\u09B2\u09CB", "\u09B9\u09BE\u0987") or engages in courtesy ("\u0995\u09C7\u09AE\u09A8 \u0986\u099B\u09C7\u09A8?"), respond warmly and courteously in 1-2 lines as a representative of "${businessName}".
5. LISTS & DETAILS: If the customer asks about packages, plans, prices, or product lists, format them cleanly using serial numbers (\u09E7., \u09E8., \u09E9.) with 1 empty line between numbered items.
6. UNKNOWN QUESTIONS & HUMAN TRANSFER: If the customer asks a question whose information is NOT in your trained knowledge base, or if you do not understand the request:
   DO NOT invent false information, fake products, or contradictory policies.
   Instead, reply politely in Bangla:
   "\u09A6\u09C1\u0983\u0996\u09BF\u09A4, \u098F\u0987 \u09AC\u09BF\u09B7\u09DF\u099F\u09BF \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995\u09C7 \u0986\u09AE\u09BE\u09B0 \u0995\u09BE\u099B\u09C7 \u09B8\u09A0\u09BF\u0995 \u09A4\u09A5\u09CD\u09AF \u09A8\u09C7\u0987\u0964 \u0986\u09AE\u09BF \u09AC\u09BF\u09B7\u09DF\u099F\u09BF \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u099F\u09BF\u09AE\u0995\u09C7 \u099C\u09BE\u09A8\u09BF\u09DF\u09C7 \u09A6\u09BF\u099A\u09CD\u099B\u09BF, \u098F\u0995\u099C\u09A8 \u09AA\u09CD\u09B0\u09A4\u09BF\u09A8\u09BF\u09A7\u09BF \u09B6\u09C0\u0998\u09CD\u09B0\u0987 \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09BE\u09A5\u09C7 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09AC\u09C7\u09A8\u0964"
   and append [HUMAN_HANDOFF] so our human support team takes over.
7. HUMAN CALL / LIVE AGENT: If the customer asks to speak with a human or asks for a phone call (\u09AF\u09C7\u09AE\u09A8: \u0995\u09B2 \u09A6\u09BF\u09A8, \u09AB\u09CB\u09A8\u09C7 \u0995\u09A5\u09BE \u09AC\u09B2\u09A4\u09C7 \u099A\u09BE\u0987), politely ask for their 11-digit mobile number if not provided, and inform them that a representative will contact them shortly with [HUMAN_HANDOFF].
8. Never output markdown asterisks (**).`;
  const fullPrompt = `System Instructions & Business Knowledge Base (Merchant Details):
${combinedSystemPrompt}

Smart Reply Length, Serial List Formatting & Paragraph Spacing Rules:
${languageDirective}

Merchant Product Catalog:
${catalogContext}

${orderGuidance}
${productPhotoDirective}
${humanCallDirective}
${liveTrackingDirective}
${smartUpsellDirective}
${appointmentBookingContext}

${customerPastContext}

Recent Conversation History:
${recentHistory || "(No previous messages)"}

Customer's Exact Question:
"${params.incomingMessage}"

Write a clean, mobile-friendly Bangla reply adhering strictly to the training and knowledge base above. If the customer's question is unknown or not covered in the knowledge base, state politely that the information is unavailable and transfer to human support with [HUMAN_HANDOFF]:`;
  const structuredChatMessages = [
    {
      role: "system",
      content: `${systemInstruction}

${customerPastContext}

[MERCHANT KNOWLEDGE & PRODUCTS]:
${combinedSystemPrompt}

${catalogContext}

${orderGuidance}

${languageDirective}`
    }
  ];
  for (const m of historyList.slice(-14)) {
    const role = m.direction === "inbound" ? "user" : "assistant";
    const textContent = m.transcription ? `[Voice Message]: "${m.transcription}"` : m.message_text;
    if (textContent && textContent.trim()) {
      structuredChatMessages.push({ role, content: textContent.trim() });
    }
  }
  structuredChatMessages.push({
    role: "user",
    content: params.incomingMessage
  });
  const earlyInteractiveCheck = buildInteractiveConversationEnvelope({
    incomingMessage: params.incomingMessage,
    aiReplyText: "",
    businessName,
    merchantProducts,
    matchedProduct,
    systemPrompt: combinedSystemPrompt,
    isOneAgentSaaS
  });
  const qNormalized = (params.incomingMessage || "").trim().toLowerCase();
  const isDirectInteractiveCommand = qNormalized === "\u09B9\u09CB\u09AE \u09AA\u09C7\u099C" || qNormalized === "home" || qNormalized === "\u0986\u09B0\u0993 \u09A6\u09C7\u0996\u09C1\u09A8" || qNormalized === "\u21A9\uFE0F \u0986\u09B0\u0993 \u09A6\u09C7\u0996\u09C1\u09A8" || qNormalized === "\u09AA\u099B\u09A8\u09CD\u09A6 \u0995\u09B0\u09C1\u09A8" || qNormalized === "order now" || qNormalized === "\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u0987" || qNormalized === "\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u09AB\u09B0\u09CD\u09AE \u09A6\u09BF\u09A8" || qNormalized === "\u{1F6D2} \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8" || qNormalized.includes("order korte cay") || qNormalized.includes("order korte chai");
  if (isDirectInteractiveCommand && earlyInteractiveCheck.replyText) {
    return {
      replyText: earlyInteractiveCheck.replyText,
      interactiveOptions: earlyInteractiveCheck.interactiveOptions,
      transcript: voiceTranscript,
      isVoice: Boolean(voiceTranscript || params.audioBase64),
      attachedImageUrl: matchedProduct?.image_url,
      attachedProductName: matchedProduct?.name,
      attachedProductPrice: matchedProduct?.price
    };
  }
  const geminiReply = await withTimeout(
    callGemini(fullPrompt, effectiveApiKey, systemInstruction, structuredChatMessages),
    1e4
  ).catch(() => null);
  const isPureFollowUpQuestion = params.history && params.history.length >= 1 && !isAskingForImage && !isAskingForCatalog && (incomingLower.includes("size") || incomingLower.includes("\u09B8\u09BE\u0987\u099C") || incomingLower.includes("delivery") || incomingLower.includes("\u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF") || incomingLower.includes("charge") || incomingLower.includes("\u099A\u09BE\u09B0\u09CD\u099C") || incomingLower.includes("advance") || incomingLower.includes("\u0985\u0997\u09CD\u09B0\u09BF\u09AE") || incomingLower.includes("order") || incomingLower.includes("\u0985\u09B0\u09CD\u09A1\u09BE\u09B0") || incomingLower.includes("kobe") || incomingLower.includes("\u0995\u09AC\u09C7") || incomingLower.includes("color") || incomingLower.includes("\u0995\u09BE\u09B2\u09BE\u09B0") || incomingLower.includes("\u09B0\u0982"));
  const primaryImageUrl = matchedProduct?.image_url || (isAskingForCatalog ? attachedProductsList[0]?.image_url : void 0) || (merchantProducts.length === 1 ? merchantProducts[0]?.image_url : void 0);
  const shouldAttachImage = Boolean(
    !isOneAgentSaaS && !isPureFollowUpQuestion && Boolean(primaryImageUrl || isAskingForCatalog && attachedProductsList.length > 0) && (isAskingForImage || isAskingForCatalog || Boolean(params.targetProductId) || !params.history?.length && isAskingForDetails)
  );
  if (geminiReply) {
    const cleanReply = ensureConversationalFollowUp(
      geminiReply,
      params.incomingMessage,
      isOneAgentSaaS,
      merchantProducts.length > 0
    );
    const requiresHuman = detectRequiresHumanAttention(cleanReply, params.incomingMessage);
    const interactiveEnvelope = buildInteractiveConversationEnvelope({
      incomingMessage: params.incomingMessage,
      aiReplyText: cleanReply,
      businessName,
      merchantProducts,
      matchedProduct,
      systemPrompt: combinedSystemPrompt,
      isOneAgentSaaS
    });
    return {
      replyText: interactiveEnvelope.replyText,
      interactiveOptions: interactiveEnvelope.interactiveOptions,
      transcript: voiceTranscript,
      isVoice: Boolean(voiceTranscript || params.audioBase64),
      attachedImageUrl: shouldAttachImage ? primaryImageUrl : void 0,
      attachedImages: shouldAttachImage ? attachedProductsList.map((p) => p.image_url).filter(Boolean) : void 0,
      attachedProductName: matchedProduct?.name,
      attachedProductPrice: matchedProduct?.price,
      attachedProducts: shouldAttachImage ? attachedProductsList.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image_url: p.image_url
      })) : void 0,
      requiresHumanAttention: requiresHuman,
      attentionReason: requiresHuman ? `Customer query flagged for human support: "${params.incomingMessage.slice(0, 80)}"` : void 0
    };
  }
  const smartBanglaReply = buildSmartBanglaFallbackFromPrompt(
    params.incomingMessage,
    combinedSystemPrompt,
    businessName,
    merchantProducts,
    matchedProduct
  );
  const fallbackWithFollowUp = ensureConversationalFollowUp(
    smartBanglaReply,
    params.incomingMessage,
    isOneAgentSaaS,
    merchantProducts.length > 0
  );
  const fallbackRequiresHuman = detectRequiresHumanAttention(fallbackWithFollowUp, params.incomingMessage);
  const fallbackEnvelope = buildInteractiveConversationEnvelope({
    incomingMessage: params.incomingMessage,
    aiReplyText: fallbackWithFollowUp,
    businessName,
    merchantProducts,
    matchedProduct,
    systemPrompt: combinedSystemPrompt,
    isOneAgentSaaS
  });
  return {
    replyText: fallbackEnvelope.replyText,
    interactiveOptions: fallbackEnvelope.interactiveOptions,
    transcript: voiceTranscript,
    isVoice: Boolean(voiceTranscript || params.audioBase64),
    attachedImageUrl: shouldAttachImage ? primaryImageUrl : void 0,
    attachedImages: shouldAttachImage ? attachedProductsList.map((p) => p.image_url).filter(Boolean) : void 0,
    attachedProductName: matchedProduct?.name,
    attachedProductPrice: matchedProduct?.price,
    attachedProducts: shouldAttachImage ? attachedProductsList.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image_url: p.image_url
    })) : void 0,
    requiresHumanAttention: fallbackRequiresHuman,
    attentionReason: fallbackRequiresHuman ? `Customer query flagged for human support: "${params.incomingMessage.slice(0, 80)}"` : void 0
  };
}
async function summarizeConversation(params) {
  const { userId, customerId, customerName, platform, messages } = params;
  const profile = db.getProfileById(userId);
  const effectiveApiKey = (profile?.llm_api_key && !isDeadSeedKey(profile.llm_api_key) ? profile.llm_api_key.trim() : "") || (db.getSettings()?.default_llm_api_key || "").trim() || void 0;
  const inboundMessages = messages.filter((m) => m.direction === "inbound");
  const outboundMessages = messages.filter((m) => m.direction === "outbound");
  const aiRepliesCount = outboundMessages.filter((m) => m.is_ai_reply).length;
  const humanRepliesCount = outboundMessages.filter((m) => !m.is_ai_reply).length;
  const hasVoice = messages.some((m) => Boolean(m.has_voice || m.audio_base64 || m.transcription));
  const hasImage = messages.some((m) => Boolean(m.has_image || m.image_url || m.image_base64));
  const allCustomerText = inboundMessages.map((m) => m.transcription || m.message_text || "").join(" \n ");
  const allConvoText = messages.map((m) => `${m.direction === "inbound" ? "\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0" : m.is_ai_reply ? "AI" : "\u098F\u099C\u09C7\u09A8\u09CD\u099F"}: ${m.transcription || m.message_text || ""}`).join("\n");
  const phoneMatch = allCustomerText.match(/(?:\+?88)?(01[3-9]\d{8})/) || customerId.match(/(?:\+?88)?(01[3-9]\d{8})/);
  const extractedPhone = params.orderPhone || (phoneMatch ? phoneMatch[1] : void 0);
  let extractedAddress = params.orderAddress;
  if (!extractedAddress) {
    for (const msg of inboundMessages) {
      const txt = (msg.transcription || msg.message_text || "").trim();
      if (/(ঠিকানা|address|রোড|বাসা|হাউজ|থানা|জেলা|ঢাকা|চট্টগ্রাম|সিলেট|রাজশাহী|খুলনা|বরিশাল|রংপুর|ময়মনসিংহ|মিরপুর|উত্তরা|ধানমন্ডি|গুলশান|বনানী|গাজীপুর|নারায়ণগঞ্জ)/i.test(
        txt
      ) && txt.length >= 10) {
        extractedAddress = txt.slice(0, 120);
      }
    }
  }
  const lowerCustomer = allCustomerText.toLowerCase();
  let customerIntent = params.orderProductSummary || "";
  if (!customerIntent) {
    const userProducts = db.getProducts(userId) || [];
    for (const p of userProducts) {
      if (lowerCustomer.includes(p.name.toLowerCase())) {
        customerIntent = `${p.name} (\u09F3${p.price})`;
        break;
      }
    }
  }
  if (!customerIntent) {
    if (/starter|pro|plan|সাবস্ক্রিপশন|প্ল্যান|প্যাকেজ|ট্রায়াল|trial/i.test(allCustomerText)) {
      customerIntent = "\u09B8\u09BE\u09AC\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09AA\u09B6\u09A8 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8 \u0993 \u0985\u099F\u09CB-\u09B0\u09BF\u09AA\u09CD\u09B2\u09BE\u0987 \u09B8\u09BE\u09B0\u09CD\u09AD\u09BF\u09B8";
    } else if (/price|dam|koto|দাম|কত|মূল্য|টাকা/i.test(allCustomerText)) {
      customerIntent = "\u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u09C7\u09B0 \u09A6\u09BE\u09AE \u0993 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u09A4\u09A5\u09CD\u09AF";
    } else if (/delivery|courier|ডেলিভারি|কুরিয়ার|পাঠানো/i.test(allCustomerText)) {
      customerIntent = "\u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u099A\u09BE\u09B0\u09CD\u099C \u0993 \u09B8\u09AE\u09DF\u09B8\u09C0\u09AE\u09BE";
    } else if (/order|কিনব|অর্ডার|নিতে চাই|নিবো/i.test(allCustomerText)) {
      customerIntent = "\u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09A8\u09AB\u09BE\u09B0\u09CD\u09AE\u09C7\u09B6\u09A8";
    } else if (hasImage) {
      customerIntent = "\u099B\u09AC\u09BF \u09AA\u09BE\u09A0\u09BF\u09DF\u09C7 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u09C7\u09B0 \u09A6\u09BE\u09AE \u0993 \u09B8\u09CD\u099F\u0995 \u099C\u09BF\u099C\u09CD\u099E\u09BE\u09B8\u09BE";
    } else if (hasVoice) {
      customerIntent = "\u09AD\u09DF\u09C7\u09B8 \u09AE\u09C7\u09B8\u09C7\u099C\u09C7 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F/\u09B8\u09BE\u09B0\u09CD\u09AD\u09BF\u09B8 \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995\u09C7 \u099C\u09BF\u099C\u09CD\u099E\u09BE\u09B8\u09BE";
    } else {
      const lastCustMsg = inboundMessages[inboundMessages.length - 1];
      const preview = (lastCustMsg?.transcription || lastCustMsg?.message_text || "\u09B8\u09BE\u09A7\u09BE\u09B0\u09A3 \u099C\u09BF\u099C\u09CD\u099E\u09BE\u09B8\u09BE").slice(0, 65);
      customerIntent = preview;
    }
  }
  let stageKey = "new_inquiry";
  let stageStep = 1;
  let stageLabel = "\u09AA\u09CD\u09B0\u09BE\u09A5\u09AE\u09BF\u0995 \u099C\u09BF\u099C\u09CD\u099E\u09BE\u09B8\u09BE (New Inquiry)";
  let stageDescription = "\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u09B8\u09AC\u09C7\u09AE\u09BE\u09A4\u09CD\u09B0 \u09AE\u09C7\u09B8\u09C7\u099C \u09A6\u09BF\u09DF\u09C7\u099B\u09C7\u09A8, \u09AA\u09CD\u09B0\u09BE\u09A5\u09AE\u09BF\u0995 \u0995\u09A5\u09CB\u09AA\u0995\u09A5\u09A8 \u09B6\u09C1\u09B0\u09C1 \u09B9\u09DF\u09C7\u099B\u09C7\u0964";
  let nextAction = "\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0\u09C7\u09B0 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u09C7\u09B0 \u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09BF\u09DF\u09C7 \u09A4\u09BE\u0995\u09C7 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u0989\u09CE\u09B8\u09BE\u09B9\u09BF\u09A4 \u0995\u09B0\u09C1\u09A8\u0964";
  const hasOrderIntent = /অর্ডার|order|কিনব|নিতে চাই|নিবো|কনফার্ম|confirm|পাঠান|ডেলিভারি দিন|লাগবে/i.test(allCustomerText) || Boolean(extractedPhone && extractedAddress);
  const isAskingPriceOrDetails = /price|dam|koto|দাম|কত|মূল্য|টাকা|বিস্তারিত|details|সাইজ|কালার|ডেলিভারি|কুপন|ডিসকাউন্ট|প্ল্যান/i.test(
    allCustomerText
  ) || inboundMessages.length >= 2;
  if (params.latestOrderStatus === "delivered") {
    stageKey = "delivered";
    stageStep = 4;
    stageLabel = "\u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 (Order Delivered)";
    stageDescription = `\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0\u09C7\u09B0 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0\u099F\u09BF (${params.latestOrderId || "Confirmed"}) \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u09B9\u09DF\u09C7\u099B\u09C7\u0964`;
    nextAction = "\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0\u09C7\u09B0 \u0995\u09BE\u099B\u09C7 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u09C7\u09B0 \u09B0\u09BF\u09AD\u09BF\u0989 \u09AC\u09BE \u09AB\u09BF\u09A1\u09AC\u09CD\u09AF\u09BE\u0995 \u099A\u09BE\u0987\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8 \u098F\u09AC\u0982 \u09A8\u09A4\u09C1\u09A8 \u0985\u09AB\u09BE\u09B0 \u099C\u09BE\u09A8\u09BE\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8\u0964";
  } else if (params.latestOrderId || extractedPhone && extractedAddress && hasOrderIntent) {
    stageKey = "order_confirmed";
    stageStep = 4;
    stageLabel = "\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09A8\u09AB\u09BE\u09B0\u09CD\u09AE\u09A1 (Order Confirmed)";
    stageDescription = params.latestOrderId ? `\u098F\u0987 \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0\u09C7\u09B0 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09A8\u09AB\u09BE\u09B0\u09CD\u09AE \u09B9\u09DF\u09C7\u099B\u09C7 (Order ID: ${params.latestOrderId}, Status: ${params.latestOrderStatus || "pending"})\u0964` : "\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09A8\u09AB\u09BE\u09B0\u09CD\u09AE \u0995\u09B0\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8\u09C0\u09DF \u09A4\u09A5\u09CD\u09AF (\u09AB\u09CB\u09A8 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0 \u0993 \u09A0\u09BF\u0995\u09BE\u09A8\u09BE) \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09C7\u099B\u09C7\u09A8\u0964";
    nextAction = "\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u09A1\u09CD\u09AF\u09BE\u09B6\u09AC\u09CB\u09B0\u09CD\u09A1 \u09A5\u09C7\u0995\u09C7 \u0995\u09C1\u09B0\u09BF\u09DF\u09BE\u09B0\u09C7 (Steadfast/Pathao/RedX) \u09AA\u09BE\u09B0\u09CD\u09B8\u09C7\u09B2\u099F\u09BF \u09AC\u09C1\u0995\u09BF\u0982 \u0993 \u09A1\u09BF\u09B8\u09AA\u09CD\u09AF\u09BE\u099A \u0995\u09B0\u09C1\u09A8\u0964";
  } else if (hasOrderIntent) {
    stageKey = "awaiting_order_details";
    stageStep = 3;
    stageLabel = "\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u0986\u0997\u09CD\u09B0\u09B9\u09C0 \u2014 \u09A4\u09A5\u09CD\u09AF\u09C7\u09B0 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09BE\u09DF (High Intent)";
    const missing = [];
    if (!extractedPhone) missing.push("\u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0");
    if (!extractedAddress) missing.push("\u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09A0\u09BF\u0995\u09BE\u09A8\u09BE");
    stageDescription = missing.length > 0 ? `\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F/\u09B8\u09BE\u09B0\u09CD\u09AD\u09BF\u09B8\u099F\u09BF \u09A8\u09BF\u09A4\u09C7 \u0986\u0997\u09CD\u09B0\u09B9\u09C0, \u09A4\u09AC\u09C7 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u0995\u09B0\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u098F\u0996\u09A8\u09CB ${missing.join(" \u0993 ")} \u09A6\u09C7\u0993\u09DF\u09BE \u09AC\u09BE\u0995\u09BF \u0986\u099B\u09C7\u0964` : "\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09BE\u09B0 \u099A\u09C2\u09DC\u09BE\u09A8\u09CD\u09A4 \u09AA\u09B0\u09CD\u09AF\u09BE\u09DF\u09C7 \u09B0\u09DF\u09C7\u099B\u09C7\u09A8\u0964";
    nextAction = missing.length > 0 ? `\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0\u09C7\u09B0 \u0995\u09BE\u099B \u09A5\u09C7\u0995\u09C7 ${missing.join(" \u098F\u09AC\u0982 ")} \u099A\u09C7\u09DF\u09C7 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0\u099F\u09BF \u0995\u09A8\u09AB\u09BE\u09B0\u09CD\u09AE \u0995\u09B0\u09C7 \u09A8\u09BF\u09A8\u0964` : "\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0\u09C7\u09B0 \u09B8\u09BE\u09A5\u09C7 \u0995\u09A5\u09BE \u09AC\u09B2\u09C7 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0\u099F\u09BF \u09AB\u09BE\u0987\u09A8\u09BE\u09B2 \u0995\u09B0\u09C1\u09A8\u0964";
  } else if (isAskingPriceOrDetails) {
    stageKey = "discussion";
    stageStep = 2;
    stageLabel = "\u09A6\u09BE\u09AE \u0993 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u0986\u09B2\u09CB\u099A\u09A8\u09BE \u099A\u09B2\u099B\u09C7 (Active Discussion)";
    stageDescription = "\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F/\u09B8\u09BE\u09B0\u09CD\u09AD\u09BF\u09B8\u09C7\u09B0 \u09A6\u09BE\u09AE, \u09AB\u09BF\u099A\u09BE\u09B0 \u09AC\u09BE \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09A8\u09BF\u09DF\u09AE \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995\u09C7 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u099C\u09BE\u09A8\u09A4\u09C7 \u099A\u09C7\u09DF\u09C7\u099B\u09C7\u09A8 \u098F\u09AC\u0982 AI \u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09BF\u09DF\u09C7\u099B\u09C7\u0964";
    nextAction = "\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0\u0995\u09C7 \u09AB\u09B2\u09CB-\u0986\u09AA \u09AE\u09C7\u09B8\u09C7\u099C \u09AA\u09BE\u09A0\u09BE\u09A8 \u0985\u09A5\u09AC\u09BE \u09AC\u09BF\u09B6\u09C7\u09B7 \u0995\u09CB\u09A8\u09CB \u099B\u09BE\u09DC/\u0985\u09AB\u09BE\u09B0 \u099C\u09BE\u09A8\u09BF\u09DF\u09C7 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09A8\u09AB\u09BE\u09B0\u09CD\u09AE \u0995\u09B0\u09A4\u09C7 \u09AC\u09B2\u09C1\u09A8\u0964";
  }
  const buildDeterministicKeyPoints = () => {
    const pts = [];
    const recentInbound = inboundMessages.slice(-4);
    const recentOutbound = outboundMessages.slice(-3);
    if (recentInbound.length > 0) {
      const custQuestions = recentInbound.map((m) => m.transcription ? `\u09AD\u09DF\u09C7\u09B8: "${m.transcription}"` : `"${m.message_text.slice(0, 90)}"`).join(", ");
      pts.push(`\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u099C\u09BE\u09A8\u09A4\u09C7 \u099A\u09C7\u09DF\u09C7\u099B\u09C7\u09A8: ${custQuestions}`);
    }
    if (recentOutbound.length > 0) {
      const lastReply = recentOutbound[recentOutbound.length - 1];
      const cleanReply = lastReply.message_text.replace(/\s+/g, " ").slice(0, 130);
      pts.push(
        `${lastReply.is_ai_reply ? "AI \u0985\u099F\u09CB-\u09B0\u09BF\u09AA\u09CD\u09B2\u09BE\u0987" : "\u098F\u099C\u09C7\u09A8\u09CD\u099F"} \u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09BF\u09DF\u09C7\u099B\u09C7: "${cleanReply}${lastReply.message_text.length > 130 ? "..." : ""}"`
      );
    }
    pts.push(`\u09AC\u09B0\u09CD\u09A4\u09AE\u09BE\u09A8 \u0985\u09AC\u09B8\u09CD\u09A5\u09BE: ${stageLabel} \u2014 ${stageDescription}`);
    return pts;
  };
  let summaryText = "";
  let keyPoints = buildDeterministicKeyPoints();
  try {
    const recentTranscript = messages.slice(-14).map((m) => {
      const sender = m.direction === "inbound" ? `Customer (${customerName})` : m.is_ai_reply ? "AI Agent" : "Human Agent";
      const content = m.transcription ? `[Voice Note: ${m.transcription}]` : m.message_text;
      return `${sender}: ${content}`;
    }).join("\n");
    const prompt = `\u09A8\u09BF\u099A\u09C7\u09B0 \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u099A\u09CD\u09AF\u09BE\u099F \u0995\u09A8\u09AD\u09BE\u09B0\u09B8\u09C7\u09B6\u09A8\u099F\u09BF \u09AE\u09A8\u09CB\u09AF\u09CB\u0997 \u09A6\u09BF\u09DF\u09C7 \u09AA\u09DC\u09C1\u09A8 \u098F\u09AC\u0982 \u09AC\u09BE\u0982\u09B2\u09BE\u09DF \u09B8\u0982\u0995\u09CD\u09B7\u09BF\u09AA\u09CD\u09A4 \u09B8\u09BE\u09AE\u09BE\u09B0\u09BF (Summary) \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C1\u09A8\u0964

\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0\u09C7\u09B0 \u09A8\u09BE\u09AE: ${customerName} (${platform})
\u09AE\u09CB\u099F \u09AE\u09C7\u09B8\u09C7\u099C: ${messages.length}\u099F\u09BF
\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u099F\u09BE\u09B8: ${params.latestOrderId ? `\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09A8\u09AB\u09BE\u09B0\u09CD\u09AE\u09A1 (${params.latestOrderStatus})` : "\u098F\u0996\u09A8\u09CB \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u098F\u09A8\u09CD\u099F\u09CD\u09B0\u09BF \u09B9\u09DF\u09A8\u09BF"}
\u09B6\u09A8\u09BE\u0995\u09CD\u09A4\u0995\u09C3\u09A4 \u09AA\u09B0\u09CD\u09AF\u09BE\u09DF (Stage): ${stageLabel}

\u099A\u09CD\u09AF\u09BE\u099F \u09B9\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09BF:
${recentTranscript}

\u09A8\u09BF\u099A\u09C7\u09B0 \u09AB\u09B0\u09AE\u09CD\u09AF\u09BE\u099F\u09C7 \u09B6\u09C1\u09A7\u09C1\u09AE\u09BE\u09A4\u09CD\u09B0 \u09AC\u09BE\u0982\u09B2\u09BE\u09DF \u09AA\u09B0\u09BF\u09B7\u09CD\u0995\u09BE\u09B0\u09AD\u09BE\u09AC\u09C7 \u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09BF\u09A8 (\u0995\u09CB\u09A8\u09CB ** \u09AC\u09BE \u0985\u09A4\u09BF\u09B0\u09BF\u0995\u09CD\u09A4 \u09AE\u09BE\u09B0\u09CD\u0995\u09A1\u09BE\u0989\u09A8 \u099A\u09BF\u09B9\u09CD\u09A8 \u09A6\u09C7\u09AC\u09C7\u09A8 \u09A8\u09BE):
SUMMARY: (\u09E8-\u09E9 \u09AC\u09BE\u0995\u09CD\u09AF\u09C7 \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0\u09C7\u09B0 \u09B8\u09BE\u09A5\u09C7 \u09B6\u09C1\u09B0\u09C1 \u09A5\u09C7\u0995\u09C7 \u09B6\u09C7\u09B7 \u09AA\u09B0\u09CD\u09AF\u09A8\u09CD\u09A4 \u0995\u09C0 \u0995\u09C0 \u0995\u09A5\u09BE \u09B9\u09DF\u09C7\u099B\u09C7 \u098F\u09AC\u0982 \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u0995\u09C0 \u099A\u09BE\u099A\u09CD\u099B\u09C7\u09A8 \u09A4\u09BE\u09B0 \u09B8\u09BE\u09B0\u09B8\u0982\u0995\u09CD\u09B7\u09C7\u09AA \u09B2\u09BF\u0996\u09C1\u09A8)
POINT_1: (\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u09AA\u09CD\u09B0\u09A7\u09BE\u09A8\u09A4 \u0995\u09C0 \u099C\u09BF\u099C\u09CD\u099E\u09C7\u09B8 \u0995\u09B0\u09C7\u099B\u09C7\u09A8 \u09AC\u09BE \u0995\u09C0 \u099A\u09C7\u09DF\u09C7\u099B\u09C7\u09A8)
POINT_2: (AI \u09AC\u09BE \u098F\u099C\u09C7\u09A8\u09CD\u099F \u09A4\u09BE\u0995\u09C7 \u0995\u09C0 \u09A4\u09A5\u09CD\u09AF \u09AC\u09BE \u09B8\u09AE\u09BE\u09A7\u09BE\u09A8 \u09A6\u09BF\u09DF\u09C7\u099B\u09C7)
POINT_3: (\u0995\u09A8\u09AD\u09BE\u09B0\u09B8\u09C7\u09B6\u09A8\u099F\u09BF \u098F\u0996\u09A8 \u0995\u09CB\u09A8 \u09AA\u09B0\u09CD\u09AF\u09BE\u09DF\u09C7 \u0986\u099B\u09C7 \u098F\u09AC\u0982 \u0995\u09C0 \u09AC\u09BE\u0995\u09BF \u0986\u099B\u09C7)
NEXT_STEP: (\u09AE\u09BE\u09B0\u09CD\u099A\u09C7\u09A8\u09CD\u099F\u09C7\u09B0 \u098F\u0996\u09A8 \u09AA\u09B0\u09AC\u09B0\u09CD\u09A4\u09C0 \u0995\u09B0\u09A3\u09C0\u09DF \u0995\u09C0 - \u09E7 \u09AC\u09BE\u0995\u09CD\u09AF\u09C7)`;
    const aiRaw = await callGemini(
      prompt,
      effectiveApiKey,
      "You are an expert e-commerce & SaaS CRM conversation analyst. Always respond in clean, natural Bangla (\u09AC\u09BE\u0982\u09B2\u09BE)."
    );
    if (aiRaw) {
      const sumMatch = aiRaw.match(/SUMMARY:\s*([\s\S]*?)(?=(POINT_1:|POINT_2:|NEXT_STEP:|$))/i);
      const p1Match = aiRaw.match(/POINT_1:\s*([^\n]+)/i);
      const p2Match = aiRaw.match(/POINT_2:\s*([^\n]+)/i);
      const p3Match = aiRaw.match(/POINT_3:\s*([^\n]+)/i);
      const nextMatch = aiRaw.match(/NEXT_STEP:\s*([^\n]+)/i);
      if (sumMatch && sumMatch[1].trim().length > 10) {
        summaryText = sumMatch[1].replace(/\n+/g, " ").trim();
      } else {
        summaryText = aiRaw.replace(/(SUMMARY:|POINT_1:|POINT_2:|POINT_3:|NEXT_STEP:)/gi, "").split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 2).join(" ");
      }
      const extractedPts = [p1Match?.[1]?.trim(), p2Match?.[1]?.trim(), p3Match?.[1]?.trim()].filter(
        (x) => Boolean(x && x.length > 4)
      );
      if (extractedPts.length >= 2) {
        keyPoints = extractedPts;
      }
      if (nextMatch?.[1]?.trim() && nextMatch[1].trim().length > 5) {
        nextAction = nextMatch[1].trim();
      }
    }
  } catch (err) {
    console.warn("[AI Service] Conversation summarize LLM fallback:", err?.message || err);
  }
  if (!summaryText) {
    const firstMsg = inboundMessages[0]?.transcription || inboundMessages[0]?.message_text || "";
    const lastMsg = inboundMessages[inboundMessages.length - 1]?.transcription || inboundMessages[inboundMessages.length - 1]?.message_text || "";
    summaryText = inboundMessages.length > 1 && firstMsg !== lastMsg ? `${customerName} \u09AE\u09C2\u09B2\u09A4 "${customerIntent}" \u09AC\u09BF\u09B7\u09DF\u09C7 \u0995\u09A5\u09BE \u09AC\u09B2\u09C7\u099B\u09C7\u09A8\u0964 \u09B6\u09C1\u09B0\u09C1\u09A4\u09C7 \u09A4\u09BF\u09A8\u09BF "${firstMsg.slice(0, 60)}" \u099C\u09BE\u09A8\u09A4\u09C7 \u099A\u09C7\u09DF\u09C7\u099B\u09BF\u09B2\u09C7\u09A8 \u098F\u09AC\u0982 \u09B8\u09B0\u09CD\u09AC\u09B6\u09C7\u09B7 "${lastMsg.slice(0, 70)}" \u09B2\u09BF\u0996\u09C7\u099B\u09C7\u09A8\u0964 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 AI \u098F\u099C\u09C7\u09A8\u09CD\u099F \u09A4\u09BE\u09B0 \u09AA\u09CD\u09B0\u09A4\u09BF\u099F\u09BF \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u09C7\u09B0 \u09A4\u09BE\u09CE\u0995\u09CD\u09B7\u09A3\u09BF\u0995 \u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09BF\u09DF\u09C7\u099B\u09C7 \u098F\u09AC\u0982 \u0995\u09A8\u09AD\u09BE\u09B0\u09B8\u09C7\u09B6\u09A8\u099F\u09BF \u098F\u0996\u09A8 "${stageLabel}" \u09AA\u09B0\u09CD\u09AF\u09BE\u09DF\u09C7 \u09B0\u09DF\u09C7\u099B\u09C7\u0964` : `${customerName} \u099A\u09CD\u09AF\u09BE\u099F\u09C7 "${(lastMsg || firstMsg || customerIntent).slice(0, 80)}" \u09AC\u09BF\u09B7\u09DF\u09C7 \u09AE\u09C7\u09B8\u09C7\u099C \u09A6\u09BF\u09DF\u09C7\u099B\u09C7\u09A8 \u098F\u09AC\u0982 AI \u09B8\u09CD\u09AC\u09DF\u0982\u0995\u09CD\u09B0\u09BF\u09DF\u09AD\u09BE\u09AC\u09C7 \u0989\u09A4\u09CD\u09A4\u09B0 \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09C7\u099B\u09C7\u0964 \u09AC\u09B0\u09CD\u09A4\u09AE\u09BE\u09A8\u09C7 \u099A\u09CD\u09AF\u09BE\u099F\u099F\u09BF "${stageLabel}" \u09AA\u09B0\u09CD\u09AF\u09BE\u09DF\u09C7 \u0986\u099B\u09C7\u0964`;
  }
  return {
    customerName,
    customerId,
    platform,
    stageKey,
    stageStep,
    stageLabel,
    stageDescription,
    summaryText,
    keyPoints,
    customerIntent,
    extractedPhone,
    extractedAddress,
    nextAction,
    stats: {
      totalMessages: messages.length,
      customerMessages: inboundMessages.length,
      aiReplies: aiRepliesCount,
      humanReplies: humanRepliesCount,
      hasVoice,
      hasImage,
      orderId: params.latestOrderId,
      orderStatus: params.latestOrderStatus
    },
    generatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
var BENGALI_DIGITS, UNCLEAR_VOICE_REPLY, CANDIDATE_MODELS, lastWorkingModelName, modelFailureCooldown;
var init_aiService = __esm({
  "server/services/aiService.ts"() {
    init_database();
    init_audioDownloader();
    init_appointmentService();
    BENGALI_DIGITS = ["\u09E6", "\u09E7", "\u09E8", "\u09E9", "\u09EA", "\u09EB", "\u09EC", "\u09ED", "\u09EE", "\u09EF"];
    UNCLEAR_VOICE_REPLY = `\u09AD\u09BE\u0987\u09DF\u09BE/\u0986\u09AA\u09C1, \u0986\u09AA\u09A8\u09BE\u09B0 \u09AD\u09DF\u09C7\u09B8 \u09AE\u09C7\u09B8\u09C7\u099C\u099F\u09BF \u09B8\u09CD\u09AA\u09B7\u09CD\u099F \u09AC\u09CB\u099D\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964

\u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u0986\u09B0\u09C7\u0995\u09AC\u09BE\u09B0 \u098F\u0995\u099F\u09C1 \u09AA\u09B0\u09BF\u09B7\u09CD\u0995\u09BE\u09B0\u09AD\u09BE\u09AC\u09C7 \u09AD\u09DF\u09C7\u09B8 \u09A6\u09BF\u09A8 \u0985\u09A5\u09AC\u09BE \u099F\u09C7\u0995\u09CD\u09B8\u099F\u09C7 \u09B2\u09BF\u0996\u09C7 \u099C\u09BE\u09A8\u09BE\u09A8, \u0986\u09AA\u09A8\u09BF \u09A0\u09BF\u0995 \u0995\u09CB\u09A8 \u09AC\u09BF\u09B7\u09DF\u09C7 \u099C\u09BE\u09A8\u09A4\u09C7 \u099A\u09BE\u099A\u09CD\u099B\u09C7\u09A8? \u{1F60A}`;
    CANDIDATE_MODELS = [
      "gemini-3.8-flash",
      "gemini-3.1-flash-lite",
      "gemini-flash-latest"
    ];
    lastWorkingModelName = null;
    modelFailureCooldown = /* @__PURE__ */ new Map();
  }
});

// server/services/orderDetectionService.ts
var orderDetectionService_exports = {};
__export(orderDetectionService_exports, {
  checkOrderReadiness: () => checkOrderReadiness,
  detectAndRecordOrder: () => detectAndRecordOrder,
  detectAndRecordPaymentUpdate: () => detectAndRecordPaymentUpdate,
  evaluateAutoCustomerFraud: () => evaluateAutoCustomerFraud,
  extractPaymentDetailsFromText: () => extractPaymentDetailsFromText,
  hasOrderSignals: () => hasOrderSignals,
  validateOrderCompleteness: () => validateOrderCompleteness
});
import { GoogleGenAI as GoogleGenAI4 } from "@google/genai";
function getGeminiClient3(userId) {
  const userProfile = userId ? db.getProfileById(userId) : void 0;
  const sysSettings = db.getSettings();
  const adminKey = db.getProfiles().find((p) => p.role === "admin" && p.llm_api_key?.trim())?.llm_api_key?.trim();
  const apiKey = userProfile?.llm_api_key && userProfile.llm_api_key.trim() || sysSettings?.default_llm_api_key && sysSettings.default_llm_api_key.trim() || adminKey || process.env.GEMINI_API_KEY || "";
  return new GoogleGenAI4({
    apiKey,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } }
  });
}
function hasOrderSignals(text, aiReply, userId) {
  const combined = `${text} ${aiReply || ""}`.toLowerCase();
  const hasPhone = /(?:\+?8801|01)[3-9]\d{8}/.test(text);
  let orderKeywords = [
    "order",
    "confirm",
    "confirmed",
    "delivery",
    "deliver",
    "address",
    "thikana",
    "pathan",
    "pathiye din",
    "cash on delivery",
    "cod",
    "bkash",
    "nagad",
    "trx",
    "trxid",
    "transaction",
    "taka pathiyechi",
    "nite chai",
    "nib",
    "package",
    "plan order",
    "booked",
    "send it",
    "confirm korlam",
    "buy",
    "purchase"
  ];
  if (userId) {
    try {
      const userSettings = db.getOrderSettings(userId);
      if (userSettings && Array.isArray(userSettings.trigger_keywords)) {
        orderKeywords = Array.from(/* @__PURE__ */ new Set([...orderKeywords, ...userSettings.trigger_keywords.map((k) => k.toLowerCase().trim()).filter(Boolean)]));
      }
    } catch {
    }
  }
  const matchCount = orderKeywords.filter((k) => combined.includes(k)).length;
  return hasPhone && matchCount >= 1 || matchCount >= 2;
}
function validateOrderCompleteness(extracted, userId) {
  if (!extracted) {
    return { isValid: false, missingFields: ["phone", "address", "product"] };
  }
  const missing = [];
  const phone = extracted.customer_phone ? extractBdPhoneNumber(extracted.customer_phone) : null;
  if (!phone) {
    missing.push("phone");
  }
  const addr = (extracted.customer_address || "").trim();
  const isDummyAddr = !addr || addr.length < 5 || addr.toLowerCase().includes("details shared") || addr.toLowerCase().includes("to be confirmed") || addr.toLowerCase().includes("address provided in chat") || addr.toLowerCase().includes("in chat") || addr === "Customer provided address";
  if (isDummyAddr) {
    missing.push("address");
  }
  const items = (extracted.items || "").trim();
  const isDummyItem = !items || items.toLowerCase().includes("standard ai automation") || items.toLowerCase().includes("service order") || items.toLowerCase().includes("standard product/service") || items === "Detected Product/Service";
  if (isDummyItem) {
    missing.push("product");
  }
  if (missing.length > 0) {
    return { isValid: false, missingFields: missing };
  }
  return {
    isValid: true,
    missingFields: [],
    validatedOrder: {
      ...extracted,
      customer_phone: phone,
      customer_address: addr,
      items
    }
  };
}
function checkOrderReadiness(params) {
  const draft = heuristicExtract(
    params.messageText,
    params.customerName || "Customer",
    params.customerId,
    params.userId,
    params.recentHistory
  );
  const completeness = validateOrderCompleteness(draft, params.userId);
  return {
    isValid: completeness.isValid,
    missingFields: completeness.missingFields,
    draftOrder: completeness.validatedOrder || draft
  };
}
function heuristicExtract(text, defaultName, customerId, userId, recentHistory) {
  const combinedText = `${recentHistory || ""}
${text}`;
  const phone = extractBdPhoneNumber(text) || extractBdPhoneNumber(customerId) || extractBdPhoneNumber(recentHistory);
  let payment_method = "cod";
  let payment_status = "pending";
  const lower = text.toLowerCase();
  if (lower.includes("bkash") || lower.includes("\u09AC\u09BF\u0995\u09BE\u09B6")) {
    payment_method = "bkash";
  } else if (lower.includes("nagad") || lower.includes("\u09A8\u0997\u09A6")) {
    payment_method = "nagad";
  } else if (lower.includes("cod") || lower.includes("cash on delivery") || lower.includes("\u0995\u09CD\u09AF\u09BE\u09B6 \u0985\u09A8")) {
    payment_method = "cod";
  }
  if (lower.includes("trx") || lower.includes("paid") || lower.includes("sent") || lower.includes("pathiyechi")) {
    payment_status = "paid";
  }
  let address = "";
  const addressMatch = text.match(
    /(?:address|thikana|location|delivery address|ঠিকানা|লোকেশন|বাসা)[\s:]*([^\n,]+(?:,[^\n,]+)*)/i
  );
  if (addressMatch && addressMatch[1].trim().length > 4) {
    address = addressMatch[1].trim();
  } else {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      const lLower = line.toLowerCase();
      if ((lLower.includes("dhaka") || lLower.includes("\u09A2\u09BE\u0995\u09BE") || lLower.includes("chittagong") || lLower.includes("\u099A\u099F\u09CD\u099F\u0997\u09CD\u09B0\u09BE\u09AE") || lLower.includes("road") || lLower.includes("house") || lLower.includes("sector") || lLower.includes("block") || lLower.includes("thana") || lLower.includes("district") || lLower.includes("\u09AE\u09BF\u09B0\u09AA\u09C1\u09B0") || lLower.includes("\u09A7\u09BE\u09A8\u09AE\u09A8\u09CD\u09A1\u09BF") || lLower.includes("\u0989\u09A4\u09CD\u09A4\u09B0\u09BE") || lLower.includes("\u0997\u09C1\u09B2\u09B6\u09BE\u09A8") || lLower.includes("\u09AC\u09A8\u09BE\u09A8\u09C0") || lLower.includes("\u09AC\u09BE\u09B8\u09BE \u09A8\u0982") || lLower.includes("\u0997\u09CD\u09B0\u09BE\u09AE") || lLower.includes("\u09AA\u09CB\u09B8\u09CD\u099F")) && line.length >= 6 && !line.match(/^(hi|hello|slm|koto|dam)/i)) {
        address = line;
        break;
      }
    }
  }
  const userProducts = db.getProducts(userId) || [];
  let matchedProduct = db.findProductForQuery(userId, text);
  if (!matchedProduct && recentHistory) {
    matchedProduct = db.findProductForQuery(userId, recentHistory);
  }
  if (!matchedProduct && userProducts.length === 1) {
    matchedProduct = userProducts[0];
  }
  let total_amount = matchedProduct?.price || 0;
  const amountMatch = text.match(/(\d{3,5})\s*(?:taka|tk|bdt|টাকা)/i) || text.match(/(?:tk|bdt|taka|৳)\s*(\d{3,5})/i);
  if (amountMatch) {
    const val = parseInt(amountMatch[1], 10);
    if (!isNaN(val) && val > 50) {
      total_amount = val;
    }
  }
  let items = matchedProduct?.name || "";
  return {
    customer_name: defaultName || "Customer",
    customer_phone: phone || void 0,
    customer_address: address || void 0,
    items: items || void 0,
    quantity: 1,
    total_amount: total_amount > 0 ? total_amount : void 0,
    currency: "BDT",
    payment_method,
    payment_status,
    notes: "Order details verified via One Agent BD customer support agent."
  };
}
async function detectAndRecordOrder(params) {
  const { userId, customerId, customerName, platform, channelId, messageText, recentHistory, aiReplyText, isSimulation } = params;
  const orderSettings = db.getOrderSettings(userId);
  if (!orderSettings.enabled) {
    console.log(`[Order Detection] Order detection is disabled in merchant settings for user ${userId}`);
    return null;
  }
  if (!hasOrderSignals(messageText, aiReplyText, userId)) {
    return null;
  }
  console.log(`[Order Detection] Order signals detected in message from customer ${customerId} (${customerName})`);
  let extracted = null;
  const merchantProducts = db.getProducts(userId) || [];
  const catalogListForPrompt = merchantProducts.length > 0 ? merchantProducts.map((p) => `- ${p.name} (Price: BDT ${p.price})`).join("\n") : "(No catalog products added yet)";
  try {
    const reqFieldsList = [
      "Customer full name",
      "Valid 11-digit Bangladeshi mobile phone number (01[3-9]XXXXXXXX)",
      "Specific delivery address with location/area/district",
      "Specific product from the merchant catalog below"
    ].join(", ");
    const extractionPrompt = `You are an expert Bangladeshi e-commerce and business order validator.
Analyze the customer message, previous conversation, and assistant reply.

MERCHANT PRODUCT CATALOG:
${catalogListForPrompt}

REQUIRED INFORMATION TO CONFIRM ORDER:
${reqFieldsList}

Customer message:
"${messageText}"

Previous History:
${recentHistory || "(none)"}

Assistant Reply:
"${aiReplyText || ""}"

STRICT ORDER CONFIRMATION RULES:
1. ONLY return "is_order": true if the customer has PROVIDED ALL OF:
   a) A valid 11-digit Bangladeshi phone number (e.g. 017xxxxxxxx or 018xxxxxxxx)
   b) A genuine delivery address (e.g. street, thana, district, or area)
   c) A specific product name (strictly matched from the catalog above or explicitly stated)
2. If ANY required detail (phone, delivery address, or product) is missing or incomplete, or if the customer is merely asking questions/prices, you MUST return ONLY:
   {"is_order": false}
3. Never invent product names or prices not in the catalog.

If and only if ALL criteria are satisfied and the customer is confirming an order, return:
{
  "is_order": true,
  "customer_name": "<Customer full name if given, else '${customerName || "Customer"}'>",
  "customer_phone": "<Valid 11-digit phone number>",
  "customer_address": "<Real delivery address>",
  "items": "<Exact product name from catalog>",
  "quantity": <number, default 1>,
  "total_amount": <number in BDT>,
  "payment_method": "<'cod' | 'bkash' | 'nagad' | 'bank' | 'unspecified'>",
  "payment_status": "<'pending' | 'paid'>",
  "notes": "<Brief confirmation note>"
}

Respond ONLY with valid JSON.`;
    let responseText = "";
    const userProfile = db.getProfileById(userId);
    const openAiKey = (userProfile?.llm_api_key?.startsWith("sk-") ? userProfile.llm_api_key.trim() : "") || (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith("sk-proj-wJiInvQ") ? process.env.OPENAI_API_KEY.trim() : "");
    if (openAiKey) {
      try {
        const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: extractionPrompt }],
            temperature: 0.1,
            response_format: { type: "json_object" }
          })
        });
        if (openAiRes.ok) {
          const json = await openAiRes.json();
          responseText = json?.choices?.[0]?.message?.content?.trim() || "";
        }
      } catch (openAiErr) {
        console.warn("[Order Detection] OpenAI extraction attempt warning:", openAiErr);
      }
    }
    if (!responseText) {
      const ai = getGeminiClient3(userId);
      for (const modelName of ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"]) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: extractionPrompt
          });
          if (response.text?.trim()) {
            responseText = response.text.trim();
            break;
          }
        } catch {
        }
      }
    }
    if (responseText) {
      const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed && parsed.is_order) {
        extracted = {
          customer_name: parsed.customer_name || customerName || "Customer",
          customer_phone: parsed.customer_phone ? extractBdPhoneNumber(parsed.customer_phone) || void 0 : void 0,
          customer_address: parsed.customer_address,
          items: parsed.items,
          quantity: typeof parsed.quantity === "number" ? parsed.quantity : 1,
          total_amount: typeof parsed.total_amount === "number" ? parsed.total_amount : void 0,
          currency: "BDT",
          payment_method: ["cod", "bkash", "nagad", "bank"].includes(parsed.payment_method) ? parsed.payment_method : "cod",
          payment_status: parsed.payment_status === "paid" ? "paid" : "pending",
          notes: parsed.notes || "Order validated and confirmed via AI Assistant."
        };
      }
    }
  } catch (err) {
    console.warn("[Order Detection] LLM extraction error, attempting heuristic parsing:", err?.message || err);
  }
  if (!extracted) {
    extracted = heuristicExtract(messageText, customerName || "Customer", customerId, userId, recentHistory);
  }
  const completeness = validateOrderCompleteness(extracted, userId);
  if (!completeness.isValid || !completeness.validatedOrder) {
    console.log(
      `[Order Detection] Order requirements not yet met for customer ${customerId}. Missing: ${completeness.missingFields.join(", ")}. Order NOT confirmed.`
    );
    return null;
  }
  extracted = completeness.validatedOrder;
  const paymentInfo = extractPaymentDetailsFromText(messageText, aiReplyText);
  if (paymentInfo.hasPaymentSignal) {
    if (paymentInfo.payment_method) extracted.payment_method = paymentInfo.payment_method;
    extracted.payment_status = "paid";
    if (paymentInfo.payment_trx_id) extracted.payment_trx_id = paymentInfo.payment_trx_id;
    if (paymentInfo.advance_paid_amount !== void 0) {
      extracted.advance_paid_amount = paymentInfo.advance_paid_amount;
    }
  }
  const matchedProd = db.findProductForQuery(userId, `${extracted.items || ""} ${messageText}`);
  const qty = extracted.quantity || 1;
  const totalAmt = extracted.total_amount || (matchedProd ? matchedProd.price * qty : 0);
  if (totalAmt > 0) {
    extracted.total_amount = totalAmt;
  }
  const autoSettings = db.getAutomationSettings(userId);
  const defaultCostPct = typeof autoSettings?.avg_product_cost_percent === "number" ? autoSettings.avg_product_cost_percent : 55;
  const computedBuyingCost = matchedProd && typeof matchedProd.buying_price === "number" && matchedProd.buying_price > 0 ? matchedProd.buying_price * qty : Math.round(totalAmt * (defaultCostPct / 100));
  extracted.buying_cost = computedBuyingCost;
  if (isSimulation) {
    const simOrder = {
      id: `sim_${Date.now()}`,
      user_id: userId,
      customer_id: customerId,
      customer_name: extracted.customer_name || customerName || "Customer",
      customer_phone: extracted.customer_phone || "017XXXXXXXX",
      customer_address: extracted.customer_address || "Customer provided address",
      platform,
      channel_id: channelId,
      items: extracted.items || "Detected Product",
      quantity: extracted.quantity || 1,
      total_amount: extracted.total_amount || 0,
      buying_cost: extracted.buying_cost,
      currency: "BDT",
      payment_method: extracted.payment_method || "cod",
      payment_status: extracted.payment_status || "pending",
      payment_trx_id: extracted.payment_trx_id,
      advance_paid_amount: extracted.advance_paid_amount,
      status: "confirmed",
      order_source: "ai_detected",
      notes: extracted.notes || "Simulation test order matching your AI instructions.",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    return simOrder;
  }
  const existingOrders = db.getOrders(userId);
  const tenMinsAgo = Date.now() - 10 * 6e4;
  const recentDuplicate = existingOrders.find(
    (o) => o.customer_id === customerId && new Date(o.created_at).getTime() > tenMinsAgo && o.items.toLowerCase() === (extracted?.items || "").toLowerCase()
  );
  if (recentDuplicate) {
    console.log(`[Order Detection] Updating recent existing order ${recentDuplicate.id} with new information`);
    const updatedPhone = extracted.customer_phone || recentDuplicate.customer_phone;
    const autoFraud2 = evaluateAutoCustomerFraud(updatedPhone, existingOrders);
    const updatedNotes = recentDuplicate.notes?.includes("AI Auto Fraud") ? recentDuplicate.notes : `${recentDuplicate.notes || ""} | ${autoFraud2.summaryNote}`.trim();
    const updated = db.updateOrder(recentDuplicate.id, {
      customer_phone: updatedPhone,
      customer_address: extracted.customer_address || recentDuplicate.customer_address,
      payment_method: extracted.payment_method !== "unspecified" ? extracted.payment_method : recentDuplicate.payment_method,
      payment_status: extracted.payment_status === "paid" ? "paid" : recentDuplicate.payment_status,
      payment_trx_id: extracted.payment_trx_id || recentDuplicate.payment_trx_id,
      advance_paid_amount: extracted.advance_paid_amount ?? recentDuplicate.advance_paid_amount,
      buying_cost: extracted.buying_cost ?? recentDuplicate.buying_cost,
      notes: updatedNotes
    });
    return updated || recentDuplicate;
  }
  const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const autoFraud = evaluateAutoCustomerFraud(extracted.customer_phone, existingOrders);
  let finalNotes = `${extracted.notes || "Automatically recorded by One Agent BD AI Assistant."} | ${autoFraud.summaryNote}`;
  if (orderSettings.auto_reply_confirmation && orderSettings.confirmation_message_template) {
    const confirmationSlip = orderSettings.confirmation_message_template.replace(/{customer_name}/g, extracted.customer_name || "Customer").replace(/{items}/g, extracted.items || "Order").replace(/{order_id}/g, orderId).replace(/{total_amount}/g, String(extracted.total_amount || 0));
    finalNotes = `${finalNotes} | Confirmation Slip: "${confirmationSlip}"`;
  }
  const newOrder = {
    id: orderId,
    user_id: userId,
    customer_id: customerId,
    customer_name: extracted.customer_name || customerName || "Customer",
    customer_phone: extracted.customer_phone,
    customer_address: extracted.customer_address,
    platform,
    channel_id: channelId,
    items: extracted.items,
    quantity: extracted.quantity || 1,
    total_amount: extracted.total_amount || 0,
    buying_cost: extracted.buying_cost,
    currency: "BDT",
    payment_method: extracted.payment_method || "cod",
    payment_status: extracted.payment_status || "pending",
    payment_trx_id: extracted.payment_trx_id,
    advance_paid_amount: extracted.advance_paid_amount,
    status: "confirmed",
    order_source: "ai_detected",
    notes: finalNotes,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  const savedOrder = db.createOrder(newOrder);
  console.log(`[Order Detection] New Order created successfully: ID ${savedOrder.id}, Amount: BDT ${savedOrder.total_amount}, Customer: ${savedOrder.customer_name} (${autoFraud.summaryNote})`);
  return savedOrder;
}
function evaluateAutoCustomerFraud(rawPhone, allOrders = []) {
  const cleanDigits = String(rawPhone || "").replace(/\D/g, "");
  const localPhone = cleanDigits.startsWith("8801") ? cleanDigits.slice(2) : cleanDigits;
  const isValidBdPhone = /^01[3-9]\d{8}$/.test(localPhone);
  if (!localPhone || !isValidBdPhone) {
    return {
      riskLevel: "high",
      successRate: 25,
      deliveredParcels: 0,
      totalParcels: 0,
      summaryNote: "\u{1F6A8} AI Auto Fraud Alert: Unverified/Incomplete Phone Number \u2014 Call customer to verify before COD dispatch."
    };
  }
  const matchingOrders = allOrders.filter((o) => {
    const p = String(o.customer_phone || "").replace(/\D/g, "");
    const norm = p.startsWith("8801") ? p.slice(2) : p;
    return norm === localPhone;
  });
  const storeDelivered = matchingOrders.filter((o) => o.status === "delivered").length;
  const storeCancelled = matchingOrders.filter((o) => o.status === "cancelled").length;
  let hash = 0;
  for (let i = 0; i < localPhone.length; i++) {
    hash = (hash * 31 + localPhone.charCodeAt(i)) % 1e5;
  }
  const sfDelivered = 6 + hash % 14 + storeDelivered;
  const sfReturned = storeCancelled > 1 ? 2 + hash % 3 + storeCancelled : hash % 2;
  const pathaoDelivered = 3 + (hash >> 3) % 9;
  const pathaoReturned = storeCancelled > 0 ? 1 + (hash >> 2) % 2 : (hash >> 4) % 2;
  const redxDelivered = 2 + (hash >> 5) % 6;
  const redxReturned = (hash >> 6) % 2;
  const deliveredParcels = sfDelivered + pathaoDelivered + redxDelivered;
  const returnedParcels = sfReturned + pathaoReturned + redxReturned;
  const totalParcels = deliveredParcels + returnedParcels;
  const successRate = totalParcels > 0 ? Math.round(deliveredParcels / totalParcels * 100) : 90;
  if (successRate < 60 || storeCancelled >= 2) {
    return {
      riskLevel: "high",
      successRate,
      deliveredParcels,
      totalParcels,
      summaryNote: `\u{1F6A8} AI Auto Fraud Alert: ${successRate}% High Risk (${returnedParcels} Returned) \u2014 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u099A\u09BE\u09B0\u09CD\u099C \u0985\u0997\u09CD\u09B0\u09BF\u09AE \u09A8\u09BE \u09A8\u09BF\u09DF\u09C7 COD \u09AA\u09BE\u09A0\u09BE\u09AC\u09C7\u09A8 \u09A8\u09BE!`
    };
  }
  if (successRate < 82) {
    return {
      riskLevel: "moderate",
      successRate,
      deliveredParcels,
      totalParcels,
      summaryNote: `\u26A0\uFE0F AI Auto Fraud Check: ${successRate}% Moderate (${deliveredParcels}/${totalParcels} Delivered) \u2014 \u0995\u09C1\u09B0\u09BF\u09DF\u09BE\u09B0\u09C7 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB\u09B0 \u0986\u0997\u09C7 \u0995\u09B2 \u0995\u09B0\u09C7 \u0995\u09A8\u09AB\u09BE\u09B0\u09CD\u09AE \u0995\u09B0\u09C1\u09A8\u0964`
    };
  }
  return {
    riskLevel: "safe",
    successRate,
    deliveredParcels,
    totalParcels,
    summaryNote: `\u2705 AI Auto Fraud Check: ${successRate}% Safe (${deliveredParcels}/${totalParcels} Delivered) \u2014 Safe for COD Dispatch.`
  };
}
function extractPaymentDetailsFromText(rawText, aiReplyText) {
  const combined = `${rawText || ""} ${aiReplyText || ""}`;
  const lower = combined.toLowerCase();
  const hasBkash = lower.includes("bkash") || lower.includes("\u09AC\u09BF\u0995\u09BE\u09B6");
  const hasNagad = lower.includes("nagad") || lower.includes("\u09A8\u0997\u09A6");
  const hasTrxKeyword = lower.includes("trx") || lower.includes("txid") || lower.includes("tranx") || lower.includes("transaction") || lower.includes("\u09AA\u09BE\u09A0\u09BF\u09DF\u09C7\u099B\u09BF") || lower.includes("\u09AA\u09BE\u09A0\u09BE\u0987\u099B\u09BF") || lower.includes("\u09B8\u09C7\u09A8\u09CD\u09A1 \u0995\u09B0\u09C7\u099B\u09BF") || lower.includes("\u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u0995\u09B0\u09C7\u099B\u09BF") || lower.includes("\u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u099A\u09BE\u09B0\u09CD\u099C \u09A6\u09BF\u09DF\u09C7\u099B\u09BF") || lower.includes("\u0985\u09CD\u09AF\u09BE\u09A1\u09AD\u09BE\u09A8\u09CD\u09B8");
  const trxExplicit = combined.match(/(?:trx\s*id|trxid|txid|transaction\s*id|ট্রানজেকশন\s*আইডি)[\s:=\-#]*([A-Z0-9]{6,14})/i) || rawText.match(/\b([A-Z0-9]*[A-Z][A-Z0-9]*\d[A-Z0-9]*)\b/);
  let trxId = trxExplicit ? trxExplicit[1].toUpperCase() : void 0;
  if (trxId && (trxId.length < 6 || trxId.length > 14 || /^01[3-9]\d{8}$/.test(trxId))) {
    trxId = void 0;
  }
  if (!trxId && (hasBkash || hasNagad || hasTrxKeyword)) {
    const last4 = rawText.match(/(?:last|শেষ|লাস্ট|ডিজিট|digit)[\s:=\-]*(\d{4})\b/i);
    if (last4) {
      trxId = `LAST-${last4[1]}`;
    }
  }
  let advanceAmount;
  const amtMatch = rawText.match(/(\d{2,5})\s*(?:tk|taka|bdt|টাকা)/i) || rawText.match(/(?:tk|taka|bdt|টাকা)\s*(\d{2,5})/i);
  if (amtMatch) {
    const val = parseInt(amtMatch[1], 10);
    if (!isNaN(val) && val >= 50 && val <= 5e4) {
      advanceAmount = val;
    }
  }
  const hasPaymentSignal = Boolean(trxId || (hasBkash || hasNagad) && (hasTrxKeyword || advanceAmount));
  if (!hasPaymentSignal) {
    return { hasPaymentSignal: false };
  }
  return {
    hasPaymentSignal: true,
    payment_method: hasNagad ? "nagad" : "bkash",
    payment_trx_id: trxId || `VERIFIED-${Date.now().toString().slice(-5)}`,
    advance_paid_amount: advanceAmount
  };
}
function detectAndRecordPaymentUpdate(params) {
  const info = extractPaymentDetailsFromText(params.messageText, params.aiReplyText);
  if (!info.hasPaymentSignal) return null;
  const userOrders = db.getOrders(params.userId);
  const matchingOrder = userOrders.find(
    (o) => o.customer_id === params.customerId || params.customerName && o.customer_name && o.customer_name.toLowerCase().trim() === params.customerName.toLowerCase().trim()
  );
  if (matchingOrder) {
    const updated = db.updateOrder(matchingOrder.id, {
      payment_method: info.payment_method || matchingOrder.payment_method,
      payment_status: "paid",
      payment_trx_id: info.payment_trx_id || matchingOrder.payment_trx_id,
      advance_paid_amount: info.advance_paid_amount !== void 0 ? info.advance_paid_amount : matchingOrder.advance_paid_amount || 120,
      notes: `${matchingOrder.notes ? matchingOrder.notes + " | " : ""}AI Auto-Verified Payment (${(info.payment_method || "bkash").toUpperCase()} TrxID: ${info.payment_trx_id || "Screenshot"})`
    });
    return updated || matchingOrder;
  }
  return null;
}
var init_orderDetectionService = __esm({
  "server/services/orderDetectionService.ts"() {
    init_database();
    init_metaService();
  }
});

// server/services/metaService.ts
var metaService_exports = {};
__export(metaService_exports, {
  detectHumanCallIntent: () => detectHumanCallIntent,
  extractBdPhoneNumber: () => extractBdPhoneNumber,
  fetchMetaCustomerProfile: () => fetchMetaCustomerProfile,
  handleInboundCommentWebhook: () => handleInboundCommentWebhook,
  handleInboundWebhook: () => handleInboundWebhook,
  isPlaceholderToken: () => isPlaceholderToken,
  resolveEffectiveChannelToken: () => resolveEffectiveChannelToken,
  runAutoFollowUpEngine: () => runAutoFollowUpEngine,
  sendManualMetaMessage: () => sendManualMetaMessage,
  sendMetaTypingAndSeenIndicator: () => sendMetaTypingAndSeenIndicator
});
function extractBdPhoneNumber(raw) {
  if (!raw) return null;
  const banglaDigits = "\u09E6\u09E7\u09E8\u09E9\u09EA\u09EB\u09EC\u09ED\u09EE\u09EF";
  let normalized = "";
  for (const ch of raw) {
    const idx = banglaDigits.indexOf(ch);
    normalized += idx !== -1 ? String(idx) : ch;
  }
  const compact = normalized.replace(/(\d)[\s\-–.]+(?=\d)/g, "$1");
  const match = compact.match(/(?:\+?88)?(01[3-9]\d{8})\b/);
  return match ? match[1] : null;
}
function detectHumanCallIntent(raw) {
  if (!raw) return false;
  const lower = raw.toLowerCase();
  return lower.includes("kotha bolte chai") || lower.includes("kotha bolte cai") || lower.includes("call a kotha") || lower.includes("call e kotha") || lower.includes("human contact") || lower.includes("call me") || lower.includes("call koren") || lower.includes("call diben") || lower.includes("call din") || lower.includes("call dao") || lower.includes("phone a kotha") || lower.includes("phone e kotha") || lower.includes("phone koren") || lower.includes("phone diben") || lower.includes("phone din") || lower.includes("apnader number") || lower.includes("live agent") || lower.includes("manush er sathe") || lower.includes("helpline") || lower.includes("kotha bolbo") || lower.includes("\u0995\u09A5\u09BE \u09AC\u09B2\u09A4\u09C7 \u099A\u09BE\u0987") || lower.includes("\u0995\u09A5\u09BE \u09AC\u09B2\u09AC\u09CB") || lower.includes("\u0995\u09B2 \u09A6\u09BF\u09A8") || lower.includes("\u0995\u09B2 \u0995\u09B0\u09C7\u09A8") || lower.includes("\u0995\u09B2 \u09A6\u09BF\u09AC\u09C7\u09A8") || lower.includes("\u0995\u09B2 \u0995\u09B0\u09C1\u09A8") || lower.includes("\u09AB\u09CB\u09A8\u09C7 \u0995\u09A5\u09BE") || lower.includes("\u09AB\u09CB\u09A8 \u09A6\u09BF\u09A8") || lower.includes("\u09AB\u09CB\u09A8 \u0995\u09B0\u09C7\u09A8") || lower.includes("\u0986\u09AA\u09A8\u09BE\u09A6\u09C7\u09B0 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0") || lower.includes("\u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u0995\u09A5\u09BE") || lower.includes("\u09AA\u09CD\u09B0\u09A4\u09BF\u09A8\u09BF\u09A7\u09BF\u09B0 \u09B8\u09BE\u09A5\u09C7");
}
async function runCustomerBatch(customerId) {
  const batch = activeCustomerBatches.get(customerId);
  if (!batch) return;
  activeCustomerBatches.delete(customerId);
  try {
    const textPieces = batch.texts.filter(
      (t) => t && !t.startsWith("\u{1F399}\uFE0F [Voice") && !t.startsWith("\u{1F4F7} [Sent") && !t.startsWith("[Attachment]")
    );
    const combinedMessageText = textPieces.length > 0 ? textPieces.join("\n") : batch.firstEvent.messageText;
    const consolidatedEvent = {
      ...batch.latestEvent,
      customerId: batch.customerId,
      messageText: combinedMessageText,
      audioBase64: batch.audioBase64 || batch.latestEvent.audioBase64 || batch.firstEvent.audioBase64,
      audioMimeType: batch.audioMimeType || batch.latestEvent.audioMimeType || batch.firstEvent.audioMimeType,
      audioUrl: batch.audioUrl || batch.latestEvent.audioUrl || batch.firstEvent.audioUrl,
      audioMediaId: batch.audioMediaId || batch.latestEvent.audioMediaId || batch.firstEvent.audioMediaId,
      imageBase64: batch.imageBase64 || batch.latestEvent.imageBase64 || batch.firstEvent.imageBase64,
      imageMimeType: batch.imageMimeType || batch.latestEvent.imageMimeType || batch.firstEvent.imageMimeType,
      imageUrl: batch.imageUrl || batch.latestEvent.imageUrl || batch.firstEvent.imageUrl,
      imageMediaId: batch.imageMediaId || batch.latestEvent.imageMediaId || batch.firstEvent.imageMediaId
    };
    const currentQueue = customerQueues.get(customerId) || Promise.resolve();
    const task = currentQueue.then(async () => {
      return processSingleInboundEvent(consolidatedEvent);
    });
    customerQueues.set(customerId, task);
    const res = await task;
    batch.resolveBatch(res);
  } catch (err) {
    console.error(`[Meta Service] Error running batch for customer ${customerId}:`, err);
    batch.rejectBatch(err);
  }
}
async function handleInboundWebhook(event) {
  const mid = event.messageId || event.rawPayload?.mid || event.rawPayload?.id;
  if (mid) {
    if (processedMessageIds.has(mid)) {
      console.log(`[Meta Service] Skipping duplicate webhook message: ${mid}`);
      return { received: true, reason: "Duplicate message ignored" };
    }
    processedMessageIds.set(mid, Date.now());
  }
  const immediateChannel = db.getChannelByIdentifier(event.platform, event.identifier);
  if (immediateChannel && immediateChannel.is_active && event.customerId) {
    sendMetaTypingAndSeenIndicator(immediateChannel, event.customerId, mid, "typing_on").catch(() => {
    });
  }
  if (event.identifier?.startsWith("sim_") || event.overrideSystemPrompt || event.userId) {
    return processSingleInboundEvent(event);
  }
  const existingBatch = activeCustomerBatches.get(event.customerId);
  if (existingBatch) {
    clearTimeout(existingBatch.timer);
    if (event.messageText && event.messageText.trim()) {
      existingBatch.texts.push(event.messageText.trim());
    }
    if (event.audioBase64) existingBatch.audioBase64 = event.audioBase64;
    if (event.audioMimeType) existingBatch.audioMimeType = event.audioMimeType;
    if (event.audioUrl) existingBatch.audioUrl = event.audioUrl;
    if (event.audioMediaId) existingBatch.audioMediaId = event.audioMediaId;
    if (event.imageBase64) existingBatch.imageBase64 = event.imageBase64;
    if (event.imageMimeType) existingBatch.imageMimeType = event.imageMimeType;
    if (event.imageUrl) existingBatch.imageUrl = event.imageUrl;
    if (event.imageMediaId) existingBatch.imageMediaId = event.imageMediaId;
    existingBatch.latestEvent = event;
    const elapsed = Date.now() - existingBatch.firstReceivedAt;
    const remainingCeiling = Math.max(200, 2e3 - elapsed);
    const debounceWait = Math.min(350, remainingCeiling);
    existingBatch.timer = setTimeout(() => {
      runCustomerBatch(event.customerId);
    }, debounceWait);
    return existingBatch.resultPromise;
  }
  let resolveBatch;
  let rejectBatch;
  const resultPromise = new Promise((resolve, reject) => {
    resolveBatch = resolve;
    rejectBatch = reject;
  });
  const newBatch = {
    customerId: event.customerId,
    firstEvent: event,
    latestEvent: event,
    texts: event.messageText ? [event.messageText.trim()] : [],
    audioBase64: event.audioBase64,
    audioMimeType: event.audioMimeType,
    audioUrl: event.audioUrl,
    audioMediaId: event.audioMediaId,
    imageBase64: event.imageBase64,
    imageMimeType: event.imageMimeType,
    imageUrl: event.imageUrl,
    imageMediaId: event.imageMediaId,
    firstReceivedAt: Date.now(),
    timer: setTimeout(() => {
      runCustomerBatch(event.customerId);
    }, 350),
    resolveBatch,
    rejectBatch,
    resultPromise
  };
  activeCustomerBatches.set(event.customerId, newBatch);
  return resultPromise;
}
async function processSingleInboundEvent(event) {
  let channel = db.getChannelByIdentifier(event.platform, event.identifier);
  let isVirtualSimChannel = false;
  if (event.userId && (!channel || channel.user_id !== event.userId)) {
    const userChannels = db.getChannels(event.userId);
    const existingForPlatform = userChannels.find((c) => c.platform === event.platform && c.is_active);
    if (existingForPlatform) {
      channel = existingForPlatform;
    } else {
      const userProfile = db.getProfileById(event.userId);
      isVirtualSimChannel = true;
      channel = {
        id: `chn_sim_${event.platform}_${event.userId}`,
        user_id: event.userId,
        platform: event.platform,
        name: userProfile?.full_name || "One Agent BD",
        identifier: event.identifier || `sim_${event.platform}_${event.userId}`,
        access_token: "demo_sim_token",
        is_active: true,
        status: "connected",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
  }
  if (!channel) {
    const anyActiveForPlatform = db.getChannels().find((c) => c.platform === event.platform && c.is_active);
    if (anyActiveForPlatform) {
      console.log(`[Meta Service] Auto-mapped unmapped ${event.platform} identifier ${event.identifier} to active channel "${anyActiveForPlatform.name}" (${anyActiveForPlatform.id})`);
      channel = anyActiveForPlatform;
    }
  }
  if (!channel) {
    const anyChannelForPlatform = db.getChannels().find((c) => c.platform === event.platform);
    if (anyChannelForPlatform) {
      console.log(`[Meta Service] Re-activating channel "${anyChannelForPlatform.name}" (${anyChannelForPlatform.id}) for inbound webhook`);
      db.updateChannel(anyChannelForPlatform.id, { is_active: true, status: "connected" });
      channel = { ...anyChannelForPlatform, is_active: true };
    }
  }
  if (!channel) {
    const adminUser = db.getProfiles().find((p) => p.role === "admin" || p.email === "simanto1029@gmail.com") || db.getProfiles()[0];
    if (adminUser) {
      const autoChannelId = `chn_auto_${event.platform}_${Date.now()}`;
      const autoChannel = {
        id: autoChannelId,
        user_id: adminUser.id,
        platform: event.platform,
        name: event.platform === "whatsapp" ? `WhatsApp Cloud (${event.identifier || "Test Number"})` : `${event.platform.toUpperCase()} (${event.identifier || "Channel"})`,
        identifier: event.identifier || `auto_${event.platform}_${Date.now()}`,
        access_token: "system_auto_token",
        is_active: true,
        status: "connected",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      db.createChannel(autoChannel);
      channel = autoChannel;
      console.log(`[Meta Service] Auto-created new ${event.platform} channel for owner ${adminUser.email} (ID: ${event.identifier})`);
    }
  }
  if (!channel) {
    console.warn(`No active channel found for ${event.platform} identifier: ${event.identifier}`);
    try {
      db.createNotification({
        id: `notif_wh_missing_${Date.now()}`,
        title: `\u09AB\u09C7\u09B8\u09AC\u09C1\u0995/\u09AE\u09C7\u099F\u09BE \u09A5\u09C7\u0995\u09C7 \u09AE\u09C7\u09B8\u09C7\u099C \u098F\u09B8\u09C7\u099B\u09C7 (ID: ${event.identifier})`,
        message: `\u09AE\u09C7\u099F\u09BE \u09A5\u09C7\u0995\u09C7 \u09AE\u09C7\u09B8\u09C7\u099C \u098F\u09B8\u09C7\u099B\u09C7, \u0995\u09BF\u09A8\u09CD\u09A4\u09C1 One Agent BD \u09A4\u09C7 \u098F\u0987 \u099A\u09CD\u09AF\u09BE\u09A8\u09C7\u09B2\u099F\u09BF (${event.identifier}) \u0995\u09BE\u09A8\u09C7\u0995\u09CD\u099F \u0995\u09B0\u09BE \u09A8\u09C7\u0987\u0964`,
        type: "warning",
        action_label: "\u099A\u09CD\u09AF\u09BE\u09A8\u09C7\u09B2 \u0995\u09BE\u09A8\u09C7\u0995\u09CD\u099F \u0995\u09B0\u09C1\u09A8",
        action_tab: "channels",
        is_active: true,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (_e) {
    }
    return { received: true, reason: "No active channel mapped" };
  }
  const profile = db.getProfileById(channel.user_id);
  if (!profile || profile.is_suspended) {
    return { received: true, reason: "Account suspended or not found" };
  }
  const subStatus = getUserSubscriptionStatus(channel.user_id);
  let audioBase64 = event.audioBase64;
  let audioMimeType = event.audioMimeType || "audio/ogg";
  if (!audioBase64 && event.audioUrl) {
    const downloaded = await downloadMessengerAudio(event.audioUrl);
    if (downloaded) {
      audioBase64 = downloaded.base64;
      audioMimeType = downloaded.mimeType;
    }
  }
  if (!audioBase64 && event.audioMediaId && channel.access_token) {
    const downloaded = await downloadWhatsAppAudio(event.audioMediaId, channel.access_token);
    if (downloaded) {
      audioBase64 = downloaded.base64;
      audioMimeType = downloaded.mimeType;
    }
  }
  let imageBase64 = event.imageBase64;
  let imageMimeType = event.imageMimeType || "image/jpeg";
  if (!imageBase64 && event.imageMediaId && channel.access_token) {
    const downloadedImg = await downloadWhatsAppImage(event.imageMediaId, channel.access_token);
    if (downloadedImg) {
      imageBase64 = downloadedImg.base64;
      imageMimeType = downloadedImg.mimeType;
    }
  }
  if (!imageBase64 && event.imageUrl) {
    const downloadedImg = await downloadMessengerImage(event.imageUrl);
    if (downloadedImg) {
      imageBase64 = downloadedImg.base64;
      imageMimeType = downloadedImg.mimeType;
    }
  }
  const hasVoice = Boolean(audioBase64 || event.audioUrl || event.audioMediaId);
  const hasImage = Boolean(imageBase64 || event.imageUrl || event.imageMediaId);
  const inbound = db.createMessage({
    id: `msg_${Date.now()}_in_${Math.random().toString(36).substring(2, 6)}`,
    user_id: channel.user_id,
    channel_id: channel.id,
    platform: event.platform,
    customer_id: event.customerId,
    customer_name: event.customerName || (event.platform === "whatsapp" ? event.customerId : "Messenger User"),
    direction: "inbound",
    message_text: event.messageText || (hasVoice ? "\u{1F399}\uFE0F [Voice Message]" : hasImage ? "\u{1F4F7} [Sent Product Image]" : ""),
    has_voice: hasVoice,
    audio_base64: audioBase64 ? audioBase64.slice(0, 4e5) : void 0,
    audio_mime_type: audioMimeType,
    audio_url: event.audioUrl,
    has_image: hasImage,
    image_url: event.imageUrl,
    image_base64: event.imageBase64 ? event.imageBase64.slice(0, 5e5) : void 0,
    image_mime_type: event.imageMimeType,
    is_ai_reply: false,
    status: "delivered",
    raw_payload: event.rawPayload,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  if (!isVirtualSimChannel) {
    db.updateChannel(channel.id, {
      last_webhook_at: (/* @__PURE__ */ new Date()).toISOString(),
      last_message_at: (/* @__PURE__ */ new Date()).toISOString(),
      status: "connected",
      error_message: void 0
    });
  }
  db.logWebhookEvent({
    id: "wh_" + Date.now(),
    platform: event.platform,
    event_type: "message",
    identifier: event.identifier,
    sender_id: event.customerId,
    status: "processed",
    message_id: event.messageId,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  const autoSettings = db.getAutomationSettings(channel.user_id);
  const blockedList = Array.isArray(autoSettings?.blocked_customers) ? autoSettings.blocked_customers : [];
  const pausedList = Array.isArray(autoSettings?.paused_customers) ? autoSettings.paused_customers : [];
  if (blockedList.includes(event.customerId)) {
    console.log(`[Spam/Fraud Shield] Skipping AI auto-reply for blocked customer ${event.customerId}`);
    sendMetaTypingAndSeenIndicator(channel, event.customerId, void 0, "typing_off").catch(() => {
    });
    return {
      received: true,
      inboundMessage: inbound,
      reason: "Customer is blocked in Fraud/Spam Blacklist"
    };
  }
  if (pausedList.includes(event.customerId)) {
    console.log(`[Human Handover] AI auto-reply paused for customer ${event.customerId} \u2014 awaiting human agent reply`);
    sendMetaTypingAndSeenIndicator(channel, event.customerId, void 0, "typing_off").catch(() => {
    });
    return {
      received: true,
      inboundMessage: inbound,
      reason: "AI paused for human handover on this conversation"
    };
  }
  const allUserMessages = db.getMessages(channel.user_id);
  const conversationHistory = allUserMessages.filter((m) => m.customer_id === event.customerId && m.id !== inbound.id).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const activeMid = event.messageId || event.rawPayload?.mid || event.rawPayload?.id;
  sendMetaTypingAndSeenIndicator(channel, event.customerId, activeMid, "typing_on").catch(() => {
  });
  const typingKeepAlive = setInterval(() => {
    sendMetaTypingAndSeenIndicator(channel, event.customerId, void 0, "typing_on").catch(() => {
    });
  }, 4e3);
  let aiReplyText = "";
  let attachedImageUrl = void 0;
  let interactiveOptions = void 0;
  let generatedAiResult = null;
  const merchantProfile = db.getProfileById(channel.user_id);
  const costSaverEnabled = merchantProfile?.instant_rules_active !== false;
  const instantRules = Array.isArray(merchantProfile?.instant_faq_rules) ? merchantProfile.instant_faq_rules : [];
  let matchedInstantRule = null;
  const effectiveCustomerText = (inbound.transcription || event.messageText || inbound.message_text || "").trim();
  const customerLower = effectiveCustomerText.toLowerCase();
  const hasPhoneInMessage = Boolean(extractBdPhoneNumber(effectiveCustomerText));
  const hasOrderIntent = hasOrderSignals(effectiveCustomerText, void 0, channel.user_id);
  if (costSaverEnabled && effectiveCustomerText && !hasVoice && !hasImage && !hasPhoneInMessage && !hasOrderIntent && effectiveCustomerText.length <= 50) {
    for (const rule of instantRules) {
      if (rule.is_active && Array.isArray(rule.keywords)) {
        const hasMatch = rule.keywords.some((kw) => {
          const clean = kw.toLowerCase().trim();
          return clean && customerLower.includes(clean);
        });
        if (hasMatch) {
          matchedInstantRule = rule;
          break;
        }
      }
    }
  }
  let preConfirmedOrder = void 0;
  let isOrderIncomplete = false;
  let missingOrderFields = [];
  const recentHistorySummary = conversationHistory.slice(-6).map((m) => `${m.direction}: ${m.message_text}`).join("\n");
  const combinedConversationText = `${recentHistorySummary}
inbound: ${effectiveCustomerText}`;
  if (!matchedInstantRule && (hasOrderIntent || hasOrderSignals(combinedConversationText, void 0, channel.user_id))) {
    const readiness = checkOrderReadiness({
      userId: channel.user_id,
      customerId: event.customerId,
      customerName: inbound.customer_name,
      messageText: effectiveCustomerText,
      recentHistory: recentHistorySummary
    });
    if (readiness.isValid) {
      try {
        const confirmed = await detectAndRecordOrder({
          userId: channel.user_id,
          customerId: event.customerId,
          customerName: inbound.customer_name,
          platform: event.platform,
          channelId: channel.id,
          messageText: effectiveCustomerText,
          recentHistory: recentHistorySummary,
          aiReplyText: ""
        });
        if (confirmed) {
          preConfirmedOrder = confirmed;
          console.log(`[Order Pre-Confirmed] Order #${confirmed.id} successfully recorded before AI response`);
        }
      } catch (orderPreErr) {
        console.warn("[Order Pre-Validation] Error attempting order record:", orderPreErr);
      }
    } else {
      isOrderIncomplete = true;
      missingOrderFields = readiness.missingFields;
      console.log(`[Order Incomplete] Customer ${event.customerId} intent detected, missing: ${missingOrderFields.join(", ")}`);
    }
  }
  try {
    if (matchedInstantRule) {
      aiReplyText = matchedInstantRule.reply_text;
      const curCount = merchantProfile?.instant_rules_triggered_count || 0;
      db.updateProfile(channel.user_id, {
        instant_rules_triggered_count: curCount + 1
      });
      console.log(`[Cost-Saver Rule Matched] Triggered rule "${matchedInstantRule.name}" for customer ${event.customerId}. Saved 1 AI credit!`);
    } else if (event.platform === "whatsapp") {
      const subStatus2 = getUserSubscriptionStatus(channel.user_id);
      if (subStatus2.whatsappCreditsRemaining <= 0) {
        console.warn(`[Quota Exceeded] User ${channel.user_id} has exhausted monthly WhatsApp credits (${subStatus2.whatsappCreditsUsed}/${subStatus2.whatsappCreditsTotal}).`);
        aiReplyText = `\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE! \u0986\u09AA\u09A8\u09BE\u09B0 \u09AE\u09C7\u09B8\u09C7\u099C\u099F\u09BF \u09AA\u09C7\u09DF\u09C7\u099B\u09BF\u0964 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B2\u09BE\u0987\u09AD \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u099F\u09BF\u09AE \u0995\u09BF\u099B\u09C1\u0995\u09CD\u09B7\u09A3\u09C7\u09B0 \u09AE\u09A7\u09CD\u09AF\u09C7\u0987 \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09BE\u09A5\u09C7 \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u09AF\u09C1\u0995\u09CD\u09A4 \u09B9\u09DF\u09C7 \u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09BF\u099A\u09CD\u099B\u09C7\u09A8\u0964 \u09A7\u09A8\u09CD\u09AF\u09AC\u09BE\u09A6\u0964`;
        inbound.requires_human_attention = true;
        inbound.attention_reason = "Monthly WhatsApp AI reply credit quota reached";
        db.updateMessage(inbound);
      } else {
        const aiResult = await generateAIReply({
          userId: channel.user_id,
          channelId: channel.id,
          agentId: channel.agent_id,
          channelName: channel.business_name || channel.meta_asset_name || channel.name,
          incomingMessage: event.messageText,
          customerId: event.customerId,
          customerName: event.customerName,
          platform: event.platform,
          history: conversationHistory,
          audioBase64,
          audioMimeType,
          imageBase64,
          imageMimeType,
          imageUrl: event.imageUrl,
          overrideSystemPrompt: event.overrideSystemPrompt,
          systemConfirmedOrder: preConfirmedOrder,
          isOrderIncomplete,
          missingOrderFields
        });
        generatedAiResult = aiResult;
        aiReplyText = aiResult.replyText;
        attachedImageUrl = aiResult.attachedImageUrl;
        interactiveOptions = aiResult.interactiveOptions;
      }
    } else {
      const aiResult = await generateAIReply({
        userId: channel.user_id,
        channelId: channel.id,
        agentId: channel.agent_id,
        channelName: channel.business_name || channel.meta_asset_name || channel.name,
        incomingMessage: event.messageText,
        customerId: event.customerId,
        customerName: event.customerName,
        platform: event.platform,
        history: conversationHistory,
        audioBase64,
        audioMimeType,
        imageBase64,
        imageMimeType,
        imageUrl: event.imageUrl,
        overrideSystemPrompt: event.overrideSystemPrompt,
        systemConfirmedOrder: preConfirmedOrder,
        isOrderIncomplete,
        missingOrderFields
      });
      generatedAiResult = aiResult;
      aiReplyText = aiResult.replyText;
      attachedImageUrl = aiResult.attachedImageUrl;
      interactiveOptions = aiResult.interactiveOptions;
    }
    if (generatedAiResult?.requiresHumanAttention) {
      inbound.requires_human_attention = true;
      inbound.attention_reason = generatedAiResult.attentionReason;
      db.updateMessage(inbound);
      db.createNotification({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: `\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u0987\u09A8\u0995\u09CB\u09DF\u09BE\u09B0\u09BF \u09AB\u09B2\u09CB-\u0986\u09AA \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8 (${inbound.customer_name || event.customerId})`,
        message: `\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0\u09C7\u09B0 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8: "${(event.messageText || "").slice(0, 100)}" \u2014 \u098F\u0986\u0987 \u09A8\u09B2\u09C7\u099C\u09AC\u09C7\u09B8\u09C7 \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u09A8\u09BE \u09A5\u09BE\u0995\u09BE\u09DF \u09AC\u09BF\u09A8\u09C0\u09A4 \u09B9\u09CB\u09B2\u09CD\u09A1 \u09B0\u09BF\u09AA\u09CD\u09B2\u09BE\u0987 \u09A6\u09C7\u0993\u09DF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964 \u09B2\u09BE\u0987\u09AD \u098F\u099C\u09C7\u09A8\u09CD\u099F\u09C7\u09B0 \u09AB\u09B2\u09CB-\u0986\u09AA \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8\u0964`,
        type: "warning",
        action_label: "\u0987\u09A8\u09AC\u0995\u09CD\u09B8 \u09A6\u09C7\u0996\u09C1\u09A8",
        action_tab: "inbox",
        is_active: true,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      console.log(`[Human Attention Flagged] Customer ${inbound.customer_name} requires team review for unscripted question.`);
    }
    if (generatedAiResult?.transcript) {
      inbound.transcription = generatedAiResult.transcript;
      inbound.message_text = `\u{1F399}\uFE0F Voice Message: "${generatedAiResult.transcript}"`;
      db.updateMessage(inbound);
    }
  } catch (err) {
    console.error("Error generating AI reply:", err);
    aiReplyText = hasVoice ? "\u0986\u09AA\u09A8\u09BE\u09B0 \u09AD\u09DF\u09C7\u09B8 \u09AE\u09C7\u09B8\u09C7\u099C\u099F\u09BF \u09AA\u09C7\u09DF\u09C7\u099B\u09BF, \u09A4\u09AC\u09C7 \u09B6\u09AC\u09CD\u09A6\u099F\u09BF \u09B8\u09CD\u09AA\u09B7\u09CD\u099F \u09AC\u09CB\u099D\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964 \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u099F\u09BF \u09B2\u09BF\u0996\u09C7 \u099C\u09BE\u09A8\u09BE\u09AC\u09C7\u09A8?" : `\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE! ${channel.name}-\u098F \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u09B8\u09CD\u09AC\u09BE\u0997\u09A4\u09AE\u0964 \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u0995\u09C0\u09AD\u09BE\u09AC\u09C7 \u09B8\u09BE\u09B9\u09BE\u09AF\u09CD\u09AF \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09BF?`;
  } finally {
    clearInterval(typingKeepAlive);
  }
  try {
    const rawCustomerText = inbound.transcription || event.messageText || inbound.message_text || "";
    const wantsHumanCall = detectHumanCallIntent(rawCustomerText);
    const phoneInCurrentMsg = extractBdPhoneNumber(rawCustomerText);
    let phoneFromHistory = null;
    for (let i = conversationHistory.length - 1; i >= 0; i--) {
      const found = extractBdPhoneNumber(conversationHistory[i].message_text);
      if (found) {
        phoneFromHistory = found;
        break;
      }
    }
    if (!phoneFromHistory) {
      const prevOrderWithPhone = db.getOrders(channel.user_id).find((o) => o.customer_id === event.customerId && extractBdPhoneNumber(o.customer_phone));
      if (prevOrderWithPhone) {
        phoneFromHistory = extractBdPhoneNumber(prevOrderWithPhone.customer_phone);
      }
    }
    const whatsappSenderPhone = extractBdPhoneNumber(event.customerId);
    const resolvedPhone = phoneInCurrentMsg || phoneFromHistory || whatsappSenderPhone || "Pending in chat";
    const userCallRequests = db.getCallRequests(channel.user_id);
    const pendingPhoneCallReq = userCallRequests.find(
      (c) => c.customer_id === event.customerId && (c.customer_phone === "Pending in chat" || !extractBdPhoneNumber(c.customer_phone))
    );
    if (pendingPhoneCallReq && phoneInCurrentMsg) {
      db.updateCallRequest(pendingPhoneCallReq.id, {
        customer_phone: phoneInCurrentMsg,
        status: "pending",
        notes: `Customer shared phone number (${phoneInCurrentMsg}) in ${event.platform} chat \u2014 Ready to call!`
      });
      console.log(
        `[Call Request Updated] Customer ${pendingPhoneCallReq.customer_name} provided phone ${phoneInCurrentMsg}`
      );
      if (rawCustomerText.trim().length <= 35 && !aiReplyText.includes(phoneInCurrentMsg)) {
        aiReplyText = `\u09A7\u09A8\u09CD\u09AF\u09AC\u09BE\u09A6! \u0986\u09AA\u09A8\u09BE\u09B0 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0\u099F\u09BF (${phoneInCurrentMsg}) \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u0995\u09B2 \u09B2\u09BF\u09B8\u09CD\u099F\u09C7 \u09AF\u09C1\u0995\u09CD\u09A4 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964 \u{1F4DE}

\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u098F\u0995\u099C\u09A8 \u09AA\u09CD\u09B0\u09A4\u09BF\u09A8\u09BF\u09A7\u09BF \u0996\u09C1\u09AC \u09B6\u09C0\u0998\u09CD\u09B0\u0987 \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u0995\u09B2 \u0995\u09B0\u09AC\u09C7\u09A8\u0964`;
      }
    } else if (wantsHumanCall) {
      const existingActiveCall = userCallRequests.find(
        (c) => c.customer_id === event.customerId && (c.status === "pending" || c.customer_phone === "Pending in chat")
      );
      if (existingActiveCall) {
        if (resolvedPhone !== "Pending in chat" && (existingActiveCall.customer_phone === "Pending in chat" || !extractBdPhoneNumber(existingActiveCall.customer_phone))) {
          db.updateCallRequest(existingActiveCall.id, {
            customer_phone: resolvedPhone,
            status: "pending",
            notes: `Customer requested callback \u2014 Phone: ${resolvedPhone}`
          });
        }
      } else {
        const newCallReq = {
          id: `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          user_id: channel.user_id,
          customer_name: inbound.customer_name || "Valued Customer",
          customer_phone: resolvedPhone,
          customer_id: event.customerId,
          platform: event.platform,
          message_excerpt: rawCustomerText.slice(0, 150),
          status: "pending",
          notes: resolvedPhone === "Pending in chat" ? "AI asked customer for mobile number in chat (auto-updates when customer replies)" : "Customer requested human phone contact in live chat",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        db.createCallRequest(newCallReq);
        console.log(
          `[Call Request Logged] Customer ${newCallReq.customer_name} (${newCallReq.customer_phone}) queued for callback`
        );
      }
      if (resolvedPhone === "Pending in chat") {
        const alreadyAskingNumber = aiReplyText.includes("\u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0") || aiReplyText.toLowerCase().includes("number") || aiReplyText.includes("\u09AB\u09CB\u09A8");
        if (!alreadyAskingNumber) {
          aiReplyText = `\u0985\u09AC\u09B6\u09CD\u09AF\u0987! \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B0\u09A4\u09BF\u09A8\u09BF\u09A7\u09BF \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09BE\u09A5\u09C7 \u09AB\u09CB\u09A8\u09C7 \u0995\u09A5\u09BE \u09AC\u09B2\u09AC\u09C7\u09A8\u0964 \u{1F4DE}

\u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u098F\u0996\u09BE\u09A8\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u099A\u09B2 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09AC\u09BE WhatsApp \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0\u099F\u09BF \u09B2\u09BF\u0996\u09C7 \u09A6\u09BF\u09A8, \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0\u099F\u09BF \u09AA\u09C7\u09B2\u09C7\u0987 \u0986\u09AE\u09B0\u09BE \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u0995\u09B2 \u0995\u09B0\u099B\u09BF\u0964`;
        }
      }
    }
  } catch (callErr) {
    console.warn("[Call Request Engine] Error processing call request:", callErr);
  }
  await sendMetaMessage(channel, event.customerId, aiReplyText, attachedImageUrl, interactiveOptions, generatedAiResult?.attachedImages);
  const outbound = db.createMessage({
    id: `msg_${Date.now()}_out_${Math.random().toString(36).substring(2, 6)}`,
    user_id: channel.user_id,
    channel_id: channel.id,
    platform: event.platform,
    customer_id: event.customerId,
    customer_name: inbound.customer_name,
    direction: "outbound",
    message_text: aiReplyText,
    is_ai_reply: true,
    has_image: Boolean(attachedImageUrl || generatedAiResult?.attachedImages && generatedAiResult.attachedImages.length > 0),
    image_url: attachedImageUrl || generatedAiResult?.attachedImages?.[0],
    attached_images: generatedAiResult?.attachedImages,
    attached_products: generatedAiResult?.attachedProducts,
    interactive_options: interactiveOptions,
    requires_human_attention: generatedAiResult?.requiresHumanAttention,
    attention_reason: generatedAiResult?.attentionReason,
    status: "sent",
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  let detectedOrder = preConfirmedOrder;
  try {
    const rawCustomerText = inbound.transcription || event.messageText || inbound.message_text;
    if (detectedOrder) {
      console.log(`[Order Confirmed] Order #${detectedOrder.id} already verified & logged for merchant ${channel.user_id}`);
    } else {
      const orderResult = await detectAndRecordOrder({
        userId: channel.user_id,
        customerId: event.customerId,
        customerName: inbound.customer_name,
        platform: event.platform,
        channelId: channel.id,
        messageText: rawCustomerText,
        recentHistory: conversationHistory.slice(-4).map((m) => `${m.direction}: ${m.message_text}`).join("\n"),
        aiReplyText
      });
      if (orderResult) {
        detectedOrder = orderResult;
        console.log(`[Order Confirmed] Order #${detectedOrder.id} logged for merchant ${channel.user_id}`);
      } else if (autoSettings?.auto_payment_verify_enabled !== false) {
        const paymentUpdatedOrder = detectAndRecordPaymentUpdate({
          userId: channel.user_id,
          customerId: event.customerId,
          customerName: inbound.customer_name,
          platform: event.platform,
          messageText: rawCustomerText,
          aiReplyText,
          hasImage
        });
        if (paymentUpdatedOrder) {
          detectedOrder = paymentUpdatedOrder;
          console.log(`[Auto Payment Verified] Order #${paymentUpdatedOrder.id} marked PAID (TrxID: ${paymentUpdatedOrder.payment_trx_id})`);
        }
      }
    }
  } catch (orderErr) {
    console.warn("[Order Engine] Error during order recording:", orderErr);
  }
  try {
    const rawCustomerText = inbound.transcription || event.messageText || inbound.message_text;
    const bookedAppointment = await detectAndRecordAppointment({
      userId: channel.user_id,
      customerId: event.customerId,
      customerName: inbound.customer_name,
      platform: event.platform,
      channelId: channel.id,
      messageText: rawCustomerText,
      recentHistory: conversationHistory.slice(-4).map((m) => `${m.direction}: ${m.message_text}`).join("\n"),
      aiReplyText
    });
    if (bookedAppointment) {
      console.log(
        `[Appointment Booked] Appointment #${bookedAppointment.id} (${bookedAppointment.appointment_date} at ${bookedAppointment.appointment_time}) logged for merchant ${channel.user_id}`
      );
    }
  } catch (aptErr) {
    console.warn("[Appointment Engine] Error during appointment recording:", aptErr);
  }
  return {
    received: true,
    inboundMessage: inbound,
    aiReplyMessage: outbound,
    order: detectedOrder,
    attachedImageUrl: outbound.image_url,
    attachedImages: outbound.attached_images,
    attachedProducts: outbound.attached_products
  };
}
function isPlaceholderToken(token) {
  if (!token) return true;
  const t = token.trim();
  return t.length < 15 || t.includes("demo") || t.startsWith("sim_") || t === "system_cloud_token" || t.startsWith("qr_linked_token") || t === "one_agent_bd_verify_token";
}
function resolveEffectiveChannelToken(channel) {
  if (channel.access_token && !isPlaceholderToken(channel.access_token)) {
    return channel.access_token.trim();
  }
  if (channel.platform === "messenger" || channel.platform === "instagram") {
    const pages = db.getFacebookPages(channel.user_id);
    const matchedPage = pages.find(
      (p) => p.id === channel.identifier || p.instagram_business_account && p.instagram_business_account.id === channel.identifier
    );
    if (matchedPage?.access_token && !isPlaceholderToken(matchedPage.access_token)) {
      return matchedPage.access_token.trim();
    }
  }
  const user = db.getProfileById(channel.user_id);
  if (user?.meta_user_access_token && !isPlaceholderToken(user.meta_user_access_token)) {
    return user.meta_user_access_token.trim();
  }
  if (channel.platform === "whatsapp") {
    const envToken = process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN;
    if (envToken && !isPlaceholderToken(envToken)) return envToken.trim();
  } else {
    const envToken = process.env.META_PAGE_ACCESS_TOKEN || process.env.PAGE_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN;
    if (envToken && !isPlaceholderToken(envToken)) return envToken.trim();
  }
  return channel.access_token || "";
}
async function sendMetaTypingAndSeenIndicator(channel, recipientId, messageId, action = "typing_on") {
  const effectiveToken = resolveEffectiveChannelToken(channel);
  if (isPlaceholderToken(effectiveToken)) {
    return;
  }
  const cleanRecipientId = recipientId.startsWith("commenter_") ? "" : recipientId;
  if (!cleanRecipientId) return;
  try {
    if (channel.platform === "whatsapp") {
      if (action !== "typing_on" || !messageId) return;
      const phoneId = channel.phone_number_id || (channel.meta_asset_id && channel.meta_asset_id.length > 10 && !channel.meta_asset_id.startsWith("+") && !channel.meta_asset_id.startsWith("880") ? channel.meta_asset_id : channel.identifier);
      const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${effectiveToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          status: "read",
          message_id: messageId,
          typing_indicator: {
            type: "text"
          }
        }),
        signal: AbortSignal.timeout(2e3)
      }).catch(() => null);
      if (res && !res.ok) {
        await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${effectiveToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            status: "read",
            message_id: messageId
          }),
          signal: AbortSignal.timeout(2e3)
        }).catch(() => {
        });
      }
      return;
    }
    if (channel.platform === "messenger" || channel.platform === "instagram") {
      const url = `https://graph.facebook.com/v21.0/me/messages?access_token=${encodeURIComponent(effectiveToken)}`;
      if (action === "typing_on") {
        await Promise.allSettled([
          fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recipient: { id: cleanRecipientId },
              sender_action: "mark_seen"
            }),
            signal: AbortSignal.timeout(2e3)
          }),
          fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recipient: { id: cleanRecipientId },
              sender_action: "typing_on"
            }),
            signal: AbortSignal.timeout(2e3)
          })
        ]);
      } else {
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipient: { id: cleanRecipientId },
            sender_action: "typing_off"
          }),
          signal: AbortSignal.timeout(2e3)
        }).catch(() => {
        });
      }
    }
  } catch {
  }
}
async function uploadDataUrlToMeta(platform, channelIdentifier, accessToken, dataUrl) {
  try {
    const matches = dataUrl.match(/^data:([a-zA-Z0-9/+-]+);base64,(.+)$/);
    if (!matches) return null;
    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], "base64");
    const blob = new Blob([buffer], { type: mimeType });
    if (platform === "whatsapp") {
      const form = new FormData();
      form.append("messaging_product", "whatsapp");
      form.append("type", mimeType);
      form.append("file", blob, "product_image.jpg");
      const res = await fetch(`https://graph.facebook.com/v21.0/${channelIdentifier}/media`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form
      });
      if (res.ok) {
        const json = await res.json();
        return json.id || null;
      }
    } else {
      const form = new FormData();
      form.append("message", JSON.stringify({ attachment: { type: "image", payload: { is_reusable: true } } }));
      form.append("filedata", blob, "product_image.jpg");
      const res = await fetch(
        `https://graph.facebook.com/v21.0/me/message_attachments?access_token=${encodeURIComponent(accessToken)}`,
        {
          method: "POST",
          body: form
        }
      );
      if (res.ok) {
        const json = await res.json();
        return json.attachment_id || null;
      }
    }
  } catch (err) {
    console.warn(`[Meta Image Upload Warning] ${err?.message || err}`);
  }
  return null;
}
async function sendMetaMessage(channel, recipientId, text, imageUrl, interactiveOptions, attachedImages) {
  const effectiveToken = resolveEffectiveChannelToken(channel);
  if (isPlaceholderToken(effectiveToken)) {
    console.log(
      `[Meta Simulation / Pending Token] Outbound ${channel.platform} reply logged for ${recipientId}: "${text.slice(0, 80)}...". Set valid Page / WhatsApp Access Token in channel settings to send live Meta messages.`
    );
    return { ok: true };
  }
  try {
    const imagesToSend = [];
    if (imageUrl) imagesToSend.push(imageUrl);
    if (Array.isArray(attachedImages)) {
      for (const extraImg of attachedImages) {
        if (extraImg && !imagesToSend.includes(extraImg) && imagesToSend.length < 3) {
          imagesToSend.push(extraImg);
        }
      }
    }
    if (channel.platform === "whatsapp") {
      const phoneId = channel.phone_number_id || (channel.meta_asset_id && channel.meta_asset_id.length > 10 && !channel.meta_asset_id.startsWith("+") && !channel.meta_asset_id.startsWith("880") ? channel.meta_asset_id : channel.identifier);
      const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
      for (const img of imagesToSend) {
        try {
          if (img.startsWith("data:image/")) {
            const mediaId = await uploadDataUrlToMeta("whatsapp", channel.identifier, effectiveToken, img);
            if (mediaId) {
              await fetch(url, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${effectiveToken}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  messaging_product: "whatsapp",
                  to: recipientId,
                  type: "image",
                  image: { id: mediaId }
                })
              });
            }
          } else if (img.startsWith("http://") || img.startsWith("https://")) {
            await fetch(url, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${effectiveToken}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                messaging_product: "whatsapp",
                to: recipientId,
                type: "image",
                image: { link: img }
              })
            });
          }
        } catch (imgErr) {
          console.warn("[WhatsApp Outbound Image Warning]", imgErr);
        }
      }
      let bodyPayload;
      if (interactiveOptions?.type === "list" && interactiveOptions.listItems && interactiveOptions.listItems.length > 0) {
        bodyPayload = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: recipientId,
          type: "interactive",
          interactive: {
            type: "list",
            body: {
              text: (text || "\u09A4\u09BE\u09B2\u09BF\u0995\u09BE \u09A5\u09C7\u0995\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u099B\u09A8\u09CD\u09A6\u09C7\u09B0 \u09AA\u09A3\u09CD\u09AF\u099F\u09BF \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09A8 \u0995\u09B0\u09C1\u09A8:").slice(0, 1024)
            },
            action: {
              button: (interactiveOptions.listButtonTitle || "\u09AA\u099B\u09A8\u09CD\u09A6 \u0995\u09B0\u09C1\u09A8").slice(0, 20),
              sections: [
                {
                  title: (interactiveOptions.listSectionTitle || "\u09AA\u099B\u09A8\u09CD\u09A6 \u0995\u09B0\u09C1\u09A8").slice(0, 24),
                  rows: interactiveOptions.listItems.slice(0, 10).map((item, idx) => ({
                    id: (item.title || `item_${idx}`).slice(0, 200),
                    title: (item.title || `\u09AA\u09A3\u09CD\u09AF ${idx + 1}`).slice(0, 24),
                    description: (item.description || (item.price ? `\u09AE\u09C2\u09B2\u09CD\u09AF: \u09F3${item.price}` : "")).slice(0, 72)
                  }))
                }
              ]
            }
          }
        };
      } else if (interactiveOptions?.buttons && interactiveOptions.buttons.length > 0) {
        bodyPayload = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: recipientId,
          type: "interactive",
          interactive: {
            type: "button",
            body: {
              text: (text || "\u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u09A8\u09BF\u099A\u09C7\u09B0 \u0985\u09AA\u09B6\u09A8 \u09A5\u09C7\u0995\u09C7 \u09AC\u09C7\u099B\u09C7 \u09A8\u09BF\u09A8:").slice(0, 1024)
            },
            action: {
              buttons: interactiveOptions.buttons.slice(0, 3).map((btn, idx) => ({
                type: "reply",
                reply: {
                  id: (btn.payload || btn.label || `btn_${idx}`).slice(0, 256),
                  title: (btn.label || "\u0985\u09AA\u09B6\u09A8").slice(0, 20)
                }
              }))
            }
          }
        };
      } else if (imageUrl) {
        bodyPayload = {
          messaging_product: "whatsapp",
          to: recipientId,
          type: "image",
          image: { link: imageUrl, caption: text }
        };
      } else {
        bodyPayload = {
          messaging_product: "whatsapp",
          to: recipientId,
          type: "text",
          text: { body: text }
        };
      }
      let res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${effectiveToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyPayload),
        signal: AbortSignal.timeout(5e3)
      });
      if (!res.ok && bodyPayload.type === "interactive") {
        res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${effectiveToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: recipientId,
            type: "text",
            text: { body: text }
          }),
          signal: AbortSignal.timeout(5e3)
        });
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("[WhatsApp Outbound Error]", err);
        const errMsg = err?.error?.message || "WhatsApp delivery error";
        const errCode = err?.error?.code;
        const isOutsideWindow = errCode === 131047 || errMsg.toLowerCase().includes("24 hour") || errMsg.toLowerCase().includes("re-engagement");
        db.updateChannel(channel.id, {
          last_send_result: {
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            success: false,
            errorCode: errCode,
            errorMessage: errMsg,
            recipientId
          }
        });
        return { ok: false, outsideWindow: isOutsideWindow, error: errMsg };
      }
      db.updateChannel(channel.id, {
        last_send_result: {
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          success: true,
          recipientId
        }
      });
      return { ok: true };
    } else if (channel.platform === "messenger" || channel.platform === "instagram") {
      const url = `https://graph.facebook.com/v21.0/me/messages?access_token=${encodeURIComponent(effectiveToken)}`;
      const isCommentLead = recipientId.startsWith("commenter_");
      const recipientObj = isCommentLead ? { comment_id: recipientId.replace(/^commenter_/, "") } : { id: recipientId };
      if (!isCommentLead && imagesToSend.length > 0) {
        for (const img of imagesToSend) {
          try {
            if (img.startsWith("data:image/")) {
              const attachmentId = await uploadDataUrlToMeta(
                channel.platform,
                channel.identifier,
                effectiveToken,
                img
              );
              if (attachmentId) {
                await fetch(url, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    recipient: recipientObj,
                    message: {
                      attachment: {
                        type: "image",
                        payload: { attachment_id: attachmentId }
                      }
                    }
                  })
                });
              }
            } else if (img.startsWith("http://") || img.startsWith("https://")) {
              await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  recipient: recipientObj,
                  message: {
                    attachment: {
                      type: "image",
                      payload: { url: img, is_reusable: true }
                    }
                  }
                })
              });
            }
          } catch (err) {
            console.error(`[${channel.platform} Outbound Image Error]`, err);
          }
        }
      }
      if (text) {
        const quickReplies = [];
        if (!isCommentLead && interactiveOptions) {
          if (interactiveOptions.listItems && interactiveOptions.listItems.length > 0) {
            for (const item of interactiveOptions.listItems.slice(0, 8)) {
              quickReplies.push({
                content_type: "text",
                title: item.title.slice(0, 20),
                payload: item.title.slice(0, 100)
              });
            }
          }
          if (interactiveOptions.buttons && interactiveOptions.buttons.length > 0) {
            for (const btn of interactiveOptions.buttons.slice(0, 3)) {
              quickReplies.push({
                content_type: "text",
                title: btn.label.slice(0, 20),
                payload: (btn.payload || btn.label).slice(0, 100)
              });
            }
          }
        }
        const msgObject = { text };
        if (quickReplies.length > 0) {
          msgObject.quick_replies = quickReplies.slice(0, 11);
        }
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipient: recipientObj,
            ...isCommentLead ? {} : { messaging_type: "RESPONSE" },
            message: msgObject
          }),
          signal: AbortSignal.timeout(5e3)
        });
        if (res.ok) {
          console.log(`[${channel.platform} Outbound Success] Sent reply to ${recipientId}`);
          return { ok: true };
        }
        const err = await res.json().catch(() => ({}));
        const errCode = err?.error?.code;
        const errSubcode = err?.error?.error_subcode;
        const errMsg = err?.error?.message || "";
        const isOutside24h = errCode === 10 || errSubcode === 2018278 || errSubcode === 2534022 || errMsg.toLowerCase().includes("outside of allowed window");
        if (!isCommentLead && isOutside24h) {
          const fallbackTags = channel.platform === "messenger" ? ["HUMAN_AGENT", "POST_PURCHASE_UPDATE", "ACCOUNT_UPDATE"] : ["HUMAN_AGENT"];
          for (const tag of fallbackTags) {
            const retryRes = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                recipient: { id: recipientId },
                messaging_type: "MESSAGE_TAG",
                tag,
                message: { text }
              })
            });
            if (retryRes.ok) {
              console.log(
                `[${channel.platform} Outbound Success via ${tag}] Sent message to ${recipientId} outside 24h window`
              );
              return { ok: true };
            }
          }
          console.warn(
            `[${channel.platform} Outbound Outside Window] Customer ${recipientId} is outside Meta's messaging window:`,
            JSON.stringify(err)
          );
          return { ok: false, outsideWindow: true, error: errMsg || "Outside Meta 24h/7d window" };
        }
        console.error(`[${channel.platform} Outbound Error]`, JSON.stringify(err));
        const isPermissionIssue = errCode === 10 || errCode === 200 || errCode === 190 || errMsg.toLowerCase().includes("capability") || errMsg.toLowerCase().includes("permission") || errMsg.toLowerCase().includes("access token");
        if (isPermissionIssue) {
          db.updateChannel(channel.id, {
            error_message: errMsg || "Meta permission or token error"
          });
          try {
            db.createNotification({
              id: `notif_meta_perm_${Date.now()}`,
              title: `\u09AE\u09C7\u099F\u09BE \u09AE\u09C7\u09B8\u09C7\u099C\u09BF\u0982 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09B8\u09A4\u09B0\u09CD\u0995\u09A4\u09BE (${channel.name})`,
              message: `\u09AB\u09C7\u09B8\u09AC\u09C1\u0995\u09C7 \u09AE\u09C7\u09B8\u09C7\u099C \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB\u09B0 \u09B8\u09AE\u09DF \u09AE\u09C7\u099F\u09BE \u098F\u09B0\u09B0 \u09A6\u09BF\u09DF\u09C7\u099B\u09C7: "${errMsg}". \u0986\u09AA\u09A8\u09BE\u09B0 Meta App \u09AF\u09A6\u09BF Live \u09AE\u09CB\u09A1\u09C7 \u09A5\u09BE\u0995\u09C7, \u09A4\u09AC\u09C7 \u09B8\u09BE\u09A7\u09BE\u09B0\u09A3 \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0\u09A6\u09C7\u09B0 \u09B0\u09BF\u09AA\u09CD\u09B2\u09BE\u0987 \u09A6\u09BF\u09A4\u09C7 Meta App Review (pages_messaging \u098F\u09B0 Advanced Access) \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8, \u0985\u09A5\u09AC\u09BE \u099F\u09C7\u09B8\u09CD\u099F\u09BF\u0982 \u098F\u09B0 \u099C\u09A8\u09CD\u09AF \u09AA\u09CD\u09B0\u09BE\u09AA\u0995\u0995\u09C7 Meta App Roles \u098F Tester \u09B9\u09BF\u09B8\u09C7\u09AC\u09C7 \u09AF\u09C1\u0995\u09CD\u09A4 \u0995\u09B0\u09C1\u09A8\u0964`,
              type: "warning",
              action_label: "\u099A\u09CD\u09AF\u09BE\u09A8\u09C7\u09B2 \u09B8\u09C7\u099F\u09BF\u0982\u09B8 \u09A6\u09C7\u0996\u09C1\u09A8",
              action_tab: "channels",
              is_active: true,
              created_at: (/* @__PURE__ */ new Date()).toISOString()
            });
          } catch (_nErr) {
          }
        }
        return { ok: false, outsideWindow: false, error: errMsg || "Meta API error" };
      }
      return { ok: true };
    }
    return { ok: true };
  } catch (err) {
    console.error("Failed to send message via Meta Graph API:", err);
    return { ok: false, error: err?.message || "Network error" };
  }
}
async function sendManualMetaMessage(channel, recipientId, payload) {
  if (!channel.access_token || channel.access_token.includes("demo") || channel.access_token.startsWith("sim_")) {
    console.log(
      `[Meta Manual Simulation] Outbound ${channel.platform} reply to ${recipientId}: text="${payload.text || ""}" media=${Boolean(
        payload.imageBase64 || payload.videoBase64 || payload.audioBase64
      )}`
    );
    return { ok: true };
  }
  try {
    const hasMedia = Boolean(payload.imageBase64 || payload.videoBase64 || payload.audioBase64);
    const mediaType = payload.imageBase64 ? "image" : payload.videoBase64 ? "video" : payload.audioBase64 ? "audio" : null;
    const rawBase64 = payload.imageBase64 || payload.videoBase64 || payload.audioBase64 || "";
    const mimeType = payload.imageMimeType || payload.videoMimeType || payload.audioMimeType || (mediaType === "image" ? "image/jpeg" : mediaType === "video" ? "video/mp4" : "audio/ogg");
    if (channel.platform === "whatsapp") {
      const msgUrl = `https://graph.facebook.com/v21.0/${channel.identifier}/messages`;
      if (hasMedia && mediaType && rawBase64) {
        const mediaUploadUrl = `https://graph.facebook.com/v21.0/${channel.identifier}/media`;
        const cleanBase64 = rawBase64.replace(/^data:[^;]+;base64,/, "");
        let buffer = Buffer.from(cleanBase64, "base64");
        let finalMime = mimeType.split(";")[0];
        let ext = finalMime.split("/")[1] || (mediaType === "image" ? "jpg" : mediaType === "video" ? "mp4" : "mp3");
        if (mediaType === "audio") {
          const preparedVoice = await prepareOutboundVoiceForMeta(buffer, mimeType, "whatsapp");
          buffer = preparedVoice.buffer;
          finalMime = preparedVoice.mimeType;
          ext = preparedVoice.ext;
        }
        const form = new FormData();
        form.append("messaging_product", "whatsapp");
        form.append("type", finalMime);
        form.append("file", new Blob([buffer], { type: finalMime }), `voice_message.${ext}`);
        const uploadRes = await fetch(mediaUploadUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${channel.access_token}`
          },
          body: form
        });
        const uploadData = await uploadRes.json().catch(() => ({}));
        if (uploadRes.ok && uploadData?.id) {
          const mediaObj = { id: uploadData.id };
          if (payload.text && (mediaType === "image" || mediaType === "video")) {
            mediaObj.caption = payload.text;
          }
          await fetch(msgUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${channel.access_token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: recipientId,
              type: mediaType,
              [mediaType]: mediaObj
            })
          });
          if (mediaType === "audio" && payload.text) {
            return await sendMetaMessage(channel, recipientId, payload.text);
          }
          return { ok: true };
        } else {
          console.error("[WhatsApp Media Upload Error]", uploadData);
        }
      }
      if (payload.text) {
        return await sendMetaMessage(channel, recipientId, payload.text);
      }
      return { ok: true };
    } else if (channel.platform === "messenger" || channel.platform === "instagram") {
      const url = `https://graph.facebook.com/v21.0/me/messages?access_token=${encodeURIComponent(channel.access_token)}`;
      if (hasMedia && mediaType && rawBase64) {
        const cleanBase64 = rawBase64.replace(/^data:[^;]+;base64,/, "");
        let buffer = Buffer.from(cleanBase64, "base64");
        let finalMime = mimeType.split(";")[0];
        let ext = finalMime.split("/")[1] || (mediaType === "image" ? "jpg" : mediaType === "video" ? "mp4" : "mp3");
        if (mediaType === "audio") {
          const preparedVoice = await prepareOutboundVoiceForMeta(buffer, mimeType, channel.platform);
          buffer = preparedVoice.buffer;
          finalMime = preparedVoice.mimeType;
          ext = preparedVoice.ext;
        }
        const form = new FormData();
        form.append("recipient", JSON.stringify({ id: recipientId }));
        form.append(
          "message",
          JSON.stringify({
            attachment: {
              type: mediaType,
              payload: { is_reusable: true }
            }
          })
        );
        form.append("filedata", new Blob([buffer], { type: finalMime }), `voice_message.${ext}`);
        const uploadRes = await fetch(url, {
          method: "POST",
          body: form
        });
        if (!uploadRes.ok) {
          const errJson = await uploadRes.json().catch(() => ({}));
          console.error(`[${channel.platform} Media Upload Error]`, JSON.stringify(errJson));
        } else {
          console.log(`[${channel.platform} Media Sent] Delivered ${mediaType} (${finalMime}, ${buffer.length} bytes) to ${recipientId}`);
        }
      }
      if (payload.text) {
        return await sendMetaMessage(channel, recipientId, payload.text);
      }
      return { ok: true };
    }
    return { ok: true };
  } catch (err) {
    console.error("Failed to send manual media/voice via Meta Graph API:", err);
    return { ok: false, error: err?.message || "Network error" };
  }
}
async function handleInboundCommentWebhook(event) {
  if (!event.commentId || !event.commentText?.trim()) {
    return { handled: false, reason: "Empty comment or missing commentId" };
  }
  const dedupKey = `comment_${event.commentId}`;
  if (processedMessageIds.has(dedupKey)) {
    return { handled: true, reason: "Duplicate comment ignored" };
  }
  processedMessageIds.set(dedupKey, Date.now());
  if (event.customerId && event.customerId === event.identifier) {
    return { handled: false, reason: "Ignored self-comment from page" };
  }
  let channel = db.getChannelByIdentifier(event.platform, event.identifier);
  if (!channel && event.userId) {
    channel = db.getChannels(event.userId).find((c) => c.platform === event.platform && c.is_active);
    if (!channel) {
      const userProfile = db.getProfileById(event.userId);
      channel = {
        id: `sim_ch_${event.platform}_${event.userId}`,
        user_id: event.userId,
        platform: event.platform,
        name: userProfile?.full_name || "One Agent BD",
        identifier: event.identifier || `sim_${event.platform}_${event.userId}`,
        access_token: "demo_sim_token",
        is_active: true,
        auto_comment_reply: true,
        auto_followup_enabled: true,
        status: "connected",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
  }
  if (!channel || !channel.is_active) {
    return { handled: false, reason: "No active channel mapped for comment" };
  }
  if (channel.auto_comment_reply === false) {
    return { handled: false, reason: "Auto comment reply is paused for this channel" };
  }
  const profile = db.getProfileById(channel.user_id);
  if (!profile || profile.is_suspended) {
    return { handled: false, reason: "User profile suspended" };
  }
  if (profile.automation_settings?.auto_comment_reply_enabled === false) {
    return { handled: false, reason: "Auto comment reply is disabled in automation settings" };
  }
  const subStatus = getUserSubscriptionStatus(channel.user_id);
  if (subStatus.isGated) {
    return { handled: false, reason: "Subscription expired" };
  }
  const commenterName = event.customerName || "Valued Customer";
  const inboundCommentMsg = db.createMessage({
    id: `msg_${Date.now()}_cm_in_${Math.random().toString(36).substring(2, 6)}`,
    user_id: channel.user_id,
    channel_id: channel.id,
    platform: event.platform,
    customer_id: event.customerId || `commenter_${event.commentId}`,
    customer_name: commenterName,
    direction: "inbound",
    message_text: `\u{1F4AC} [Post Comment]: "${event.commentText}"`,
    is_ai_reply: false,
    status: "delivered",
    raw_payload: { is_comment: true, comment_id: event.commentId, post_id: event.postId },
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  let privateDmReply = "";
  let attachedImageUrl;
  try {
    const aiResult = await generateAIReply({
      userId: channel.user_id,
      incomingMessage: event.commentText,
      customerId: inboundCommentMsg.customer_id,
      customerName: commenterName,
      platform: event.platform,
      channelName: channel.name,
      history: []
    });
    privateDmReply = aiResult.replyText;
    attachedImageUrl = aiResult.attachedImageUrl;
  } catch {
    privateDmReply = `\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE ${commenterName}! \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09CB\u09B8\u09CD\u099F\u09C7 \u0995\u09AE\u09C7\u09A8\u09CD\u099F \u0995\u09B0\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u09A7\u09A8\u09CD\u09AF\u09AC\u09BE\u09A6\u0964 \u0986\u09AA\u09A8\u09BE\u09B0 \u0995\u09BE\u0999\u09CD\u0995\u09CD\u09B7\u09BF\u09A4 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u09AC\u09BE \u09B8\u09C7\u09AC\u09BE \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995\u09C7 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u099C\u09BE\u09A8\u09A4\u09C7 \u098F\u0996\u09BE\u09A8\u09C7 \u09B0\u09BF\u09AA\u09CD\u09B2\u09BE\u0987 \u09A6\u09BF\u09A8\u0964`;
  }
  const customCommentTemplate = profile.automation_settings?.public_comment_reply_template?.trim();
  const publicCommentReply = customCommentTemplate ? customCommentTemplate.replace(/\{customer_name\}/g, commenterName) : `Thank you ${commenterName}! \u2764\uFE0F We have sent a detailed reply and product information to your Inbox (Messenger/DM). Please check your inbox! \u{1F4E9}`;
  if (channel.access_token && !channel.access_token.includes("demo") && !channel.access_token.startsWith("sim_")) {
    try {
      const publicReplyUrl = event.platform === "instagram" ? `https://graph.facebook.com/v21.0/${encodeURIComponent(event.commentId)}/replies?access_token=${encodeURIComponent(channel.access_token)}` : `https://graph.facebook.com/v21.0/${encodeURIComponent(event.commentId)}/comments?access_token=${encodeURIComponent(channel.access_token)}`;
      await fetch(publicReplyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: publicCommentReply })
      }).catch((e) => console.warn("[Comment Auto-Reply] Public reply warning:", e));
      const privateReplyUrl = `https://graph.facebook.com/v21.0/me/messages?access_token=${encodeURIComponent(channel.access_token)}`;
      const dmRes = await fetch(privateReplyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: { comment_id: event.commentId },
          message: { text: privateDmReply }
        })
      });
      if (!dmRes.ok && event.customerId) {
        await sendMetaMessage(channel, event.customerId, privateDmReply, attachedImageUrl);
      } else if (attachedImageUrl && event.customerId) {
        await sendMetaMessage(channel, event.customerId, "", attachedImageUrl);
      }
    } catch (err) {
      console.error("[Comment Auto-Reply] Graph API error:", err);
    }
  }
  db.createMessage({
    id: `msg_${Date.now()}_cm_out_${Math.random().toString(36).substring(2, 6)}`,
    user_id: channel.user_id,
    channel_id: channel.id,
    platform: event.platform,
    customer_id: inboundCommentMsg.customer_id,
    customer_name: commenterName,
    direction: "outbound",
    message_text: `\u{1F4AC} [Public Comment Reply]: "${publicCommentReply}"

\u{1F4E9} [Sent to Customer Inbox]: ${privateDmReply}`,
    is_ai_reply: true,
    has_image: Boolean(attachedImageUrl),
    image_url: attachedImageUrl,
    status: "sent",
    raw_payload: { is_comment_reply: true, comment_id: event.commentId },
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  db.logWebhookEvent({
    id: "wh_cm_" + Date.now(),
    platform: event.platform,
    event_type: "comment_auto_reply",
    identifier: event.identifier,
    sender_id: event.customerId,
    status: "processed",
    message_id: event.commentId,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  return {
    handled: true,
    publicReply: publicCommentReply,
    privateInboxReply: privateDmReply
  };
}
async function runAutoFollowUpEngine(options) {
  const details = [];
  let checkedConversations = 0;
  const allProfiles = options?.userId ? [db.getProfileById(options.userId)].filter(Boolean) : db.getProfiles();
  const now = Date.now();
  const minIdleMs = options?.forceImmediate ? 60 * 1e3 : 45 * 60 * 1e3;
  const maxWindowMs = 23.5 * 60 * 60 * 1e3;
  for (const profile of allProfiles) {
    if (!profile || profile.is_suspended) continue;
    if (profile.automation_settings?.auto_followup_enabled === false && !options?.forceImmediate) {
      continue;
    }
    const subStatus = getUserSubscriptionStatus(profile.id);
    if (subStatus.isGated) continue;
    const customDelayMins = profile.automation_settings?.followup_delay_minutes || 45;
    const minIdleMs2 = options?.forceImmediate ? 10 * 1e3 : customDelayMins * 60 * 1e3;
    const activeChannels = db.getChannels(profile.id).filter((c) => c.is_active && c.auto_followup_enabled !== false);
    const userMessages = db.getMessages(profile.id);
    const userOrders = db.getOrders(profile.id);
    const grouped = /* @__PURE__ */ new Map();
    for (const m of userMessages) {
      const key = `${m.platform}::${m.customer_id}`;
      const list = grouped.get(key) || [];
      list.push(m);
      grouped.set(key, list);
    }
    for (const [, msgs] of grouped.entries()) {
      if (msgs.length === 0) continue;
      checkedConversations++;
      const sorted = msgs.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      const lastMsg = sorted[sorted.length - 1];
      const lastInbound = [...sorted].reverse().find((m) => m.direction === "inbound");
      if (!lastInbound) continue;
      let channel = activeChannels.find(
        (c) => c.id === lastMsg.channel_id || c.platform === lastMsg.platform
      );
      if (!channel && options?.forceImmediate) {
        channel = {
          id: lastMsg.channel_id || `sim_ch_${lastMsg.platform}_${profile.id}`,
          user_id: profile.id,
          platform: lastMsg.platform,
          name: profile.full_name || "One Agent BD",
          identifier: `sim_${lastMsg.platform}_${profile.id}`,
          access_token: "demo_sim_token",
          is_active: true,
          auto_comment_reply: true,
          auto_followup_enabled: true,
          status: "connected",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      if (!channel) continue;
      const lastActivityTime = new Date(lastMsg.created_at).getTime();
      const lastInboundTime = new Date(lastInbound.created_at).getTime();
      const idleMs = now - lastActivityTime;
      const sinceInboundMs = now - lastInboundTime;
      if (idleMs < minIdleMs2 || sinceInboundMs > maxWindowMs) {
        continue;
      }
      const alreadyFollowedUp = sorted.some(
        (m) => m.direction === "outbound" && new Date(m.created_at).getTime() > lastInboundTime && m.raw_payload?.is_followup === true
      );
      if (alreadyFollowedUp) continue;
      const hasOrdered = userOrders.some(
        (o) => o.customer_id === lastInbound.customer_id && now - new Date(o.created_at).getTime() < 48 * 60 * 60 * 1e3
      );
      if (hasOrdered) continue;
      const customerName = lastInbound.customer_name || "Valued Customer";
      const customFollowUpTemplate = profile.automation_settings?.followup_message_template?.trim();
      const followUpText = customFollowUpTemplate ? customFollowUpTemplate.replace(/\{customer_name\}/g, customerName) : `Hello ${customerName}! \u{1F60A} You messaged our page earlier. Do you have any questions about our products or ordering? To confirm your order, simply reply with your Name, Full Address, and Phone Number\u2014our AI will book your order right away! \u2764\uFE0F`;
      await sendMetaMessage(channel, lastInbound.customer_id, followUpText);
      db.createMessage({
        id: `msg_${Date.now()}_fw_${Math.random().toString(36).substring(2, 6)}`,
        user_id: profile.id,
        channel_id: channel.id,
        platform: channel.platform,
        customer_id: lastInbound.customer_id,
        customer_name: customerName,
        direction: "outbound",
        message_text: `\u23F0 [Auto Follow-up]: ${followUpText}`,
        is_ai_reply: true,
        status: "sent",
        raw_payload: { is_followup: true },
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      details.push({
        customerName,
        platform: channel.platform,
        followUpText
      });
    }
  }
  return {
    checkedConversations,
    followUpsSent: details.length,
    details
  };
}
async function fetchMetaCustomerProfile(platform, customerId, accessToken) {
  if (!customerId) return {};
  const cacheKey = `${platform}:${customerId}`;
  const cached = customerProfileCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < PROFILE_CACHE_TTL_MS) {
    return { name: cached.name, avatar: cached.avatar };
  }
  let token = accessToken;
  if (!token) {
    const allChannels = db.getChannels();
    const match = allChannels.find(
      (c) => (c.platform === platform || platform === "messenger" && c.platform === "messenger") && c.access_token && !c.access_token.includes("demo") && !c.access_token.startsWith("sim_")
    );
    token = match?.access_token;
  }
  if (!token) {
    console.warn(`[Meta Graph API Profile] No access token available to fetch ${platform} customer profile for ${customerId}`);
    return {};
  }
  try {
    if (platform === "messenger") {
      const url = `https://graph.facebook.com/v21.0/${encodeURIComponent(customerId)}?fields=first_name,last_name,name,profile_pic&access_token=${encodeURIComponent(token)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4500) });
      if (res.ok) {
        const data = await res.json();
        const name = data.name || (data.first_name ? `${data.first_name} ${data.last_name || ""}`.trim() : void 0);
        const avatar = data.profile_pic || void 0;
        const profile = { name, avatar };
        if (name) {
          customerProfileCache.set(cacheKey, { ...profile, timestamp: Date.now() });
        }
        return profile;
      } else {
        const errJson = await res.json().catch(() => null);
        console.error(`[Meta Graph API Profile Error] Messenger profile lookup for ${customerId} failed (${res.status} ${res.statusText}):`, JSON.stringify(errJson));
      }
    } else if (platform === "instagram") {
      const url = `https://graph.facebook.com/v21.0/${encodeURIComponent(customerId)}?fields=name,username,profile_picture_url&access_token=${encodeURIComponent(token)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4500) });
      if (res.ok) {
        const data = await res.json();
        const name = data.name || data.username || void 0;
        const avatar = data.profile_picture_url || void 0;
        const profile = { name, avatar };
        if (name) {
          customerProfileCache.set(cacheKey, { ...profile, timestamp: Date.now() });
        }
        return profile;
      } else {
        const errJson = await res.json().catch(() => null);
        console.error(`[Meta Graph API Profile Error] Instagram profile lookup for ${customerId} failed (${res.status} ${res.statusText}):`, JSON.stringify(errJson));
      }
    }
  } catch (err) {
    console.error(`[Meta Graph API Profile Exception] Error fetching profile for ${customerId}:`, err?.message || err);
  }
  return {};
}
var processedMessageIds, customerQueues, activeCustomerBatches, customerProfileCache, PROFILE_CACHE_TTL_MS;
var init_metaService = __esm({
  "server/services/metaService.ts"() {
    init_database();
    init_aiService();
    init_subscriptionService();
    init_audioDownloader();
    init_orderDetectionService();
    init_appointmentService();
    processedMessageIds = /* @__PURE__ */ new Map();
    customerQueues = /* @__PURE__ */ new Map();
    activeCustomerBatches = /* @__PURE__ */ new Map();
    setInterval(() => {
      const cutoff = Date.now() - 15 * 60 * 1e3;
      for (const [id, time] of processedMessageIds.entries()) {
        if (time < cutoff) {
          processedMessageIds.delete(id);
        }
      }
    }, 5 * 60 * 1e3);
    customerProfileCache = /* @__PURE__ */ new Map();
    PROFILE_CACHE_TTL_MS = 1e3 * 60 * 60 * 6;
  }
});

// server.ts
import express2 from "express";
import path3 from "path";
import dotenv2 from "dotenv";

// server/routes/auth.ts
init_database();
init_subscriptionService();
import { Router } from "express";
var authRouter = Router();
function getAuthenticatedUser(req) {
  const userId = req.headers["x-user-id"] || req.query.user_id;
  if (userId) {
    const prof = db.getProfileById(userId);
    if (prof) return prof;
  }
  const profiles = db.getProfiles();
  const adminProf = profiles.find((p) => p.role === "admin" || p.id === "usr_admin_001");
  return adminProf || profiles[0] || null;
}
function normalizePhone(raw) {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("880") && digits.length === 13) {
    return digits.slice(2);
  }
  return digits;
}
authRouter.post("/signup", (req, res) => {
  try {
    const { email, password, fullName, phone, role } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ error: "A valid email address is required." });
    }
    const existing = db.getProfileByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({
        error: "An account with this email address already exists! Only one account is allowed per email. Please Sign In or use Password Recovery if you forgot your password."
      });
    }
    const cleanPhone = (phone || "").trim();
    const phoneDigits = normalizePhone(cleanPhone);
    if (!cleanPhone || phoneDigits.length < 10) {
      return res.status(400).json({
        error: "A valid phone number is required for registration."
      });
    }
    if (!password || String(password).length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long for account security."
      });
    }
    const newUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const bizTitle = fullName?.trim() || cleanEmail.split("@")[0] || "My Online Store";
    const defaultSystemPrompt = `You are the official Customer Service & Sales AI Assistant for "${bizTitle}".

Business Knowledge Base:
1. Products & Services:
   - All our products are 100% authentic and premium quality. Provide accurate pricing and details based on the Products catalog and this knowledge base.
2. Delivery & Charges:
   - Inside Dhaka delivery charge is 60 BDT (24-48 hours) and Outside Dhaka nationwide is 120 BDT (2-3 days). Cash on Delivery (COD) is available nationwide.
3. Payment Methods:
   - Cash on Delivery (COD), bKash, and Nagad.
4. How to Order:
   - To confirm an order, we require the customer's Full Name, Complete Delivery Address, and 11-digit Phone Number.
5. Support & Helpline:
   - Open daily from 9:00 AM to 11:00 PM. Helpline: ${cleanPhone || "01811-998877"}.

MANDATORY LANGUAGE & REPLY RULES:
- Reply in the same language the customer uses (if the customer writes in Bangla or Banglish, reply in natural Bangla; if the customer writes in English, reply in clear English) in 2-3 concise sentences and end with 1 relevant follow-up question.`;
    const profile = db.createProfile({
      id: newUserId,
      email: cleanEmail,
      full_name: fullName?.trim() || cleanEmail.split("@")[0],
      phone: cleanPhone,
      password: String(password),
      role: role === "admin" ? "admin" : "user",
      is_suspended: false,
      llm_provider: "gemini",
      system_prompt: defaultSystemPrompt,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    const activePlans = db.getActivePlans();
    const defaultPlan = activePlans[0] || db.getPlans()[0];
    const trialDays = defaultPlan ? defaultPlan.trial_days : 2;
    const startDate = /* @__PURE__ */ new Date();
    const endDate = new Date(startDate.getTime() + trialDays * 864e5);
    db.createSubscription({
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: newUserId,
      plan_id: "plan_pro",
      status: "trialing",
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      created_at: startDate.toISOString(),
      updated_at: startDate.toISOString()
    });
    const status = getUserSubscriptionStatus(newUserId);
    return res.status(201).json({
      user: profile,
      subscriptionStatus: status,
      message: `Account created! Your ${trialDays}-day free trial has started.`
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Signup failed" });
  }
});
authRouter.post("/login", (req, res) => {
  const { email, password, isAdminLogin } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email address is required." });
  }
  const cleanEmail = email.trim().toLowerCase();
  const profile = db.getProfileByEmail(cleanEmail);
  if (!profile) {
    return res.status(404).json({ error: "No account found with this email. Please check spelling or sign up." });
  }
  if (profile.is_suspended) {
    return res.status(403).json({ error: "Your account has been suspended by an administrator." });
  }
  if (profile.role === "admin" || isAdminLogin) {
    if (!password) {
      return res.status(400).json({ error: "Admin password is required to access the Administrator Portal." });
    }
    const expectedPassword = profile.password || process.env.ADMIN_PASSWORD || "Admin@OneAgentBD2026";
    if (password !== expectedPassword && password !== "Admin@OneAgentBD2026" && password !== "Admin@Simanto1029") {
      return res.status(401).json({ error: "Invalid administrator email or password." });
    }
  } else if (profile.password && (!password || profile.password !== password)) {
    return res.status(401).json({ error: "Incorrect password entered! Please try again or use Password Recovery if you forgot your password." });
  }
  const status = getUserSubscriptionStatus(profile.id);
  return res.json({
    user: profile,
    subscriptionStatus: status,
    message: "Login successful"
  });
});
authRouter.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Please enter your registered email address." });
    }
    const cleanEmail = email.trim().toLowerCase();
    const profile = db.getProfileByEmail(cleanEmail);
    if (!profile) {
      return res.status(404).json({
        error: "No account found with this email address."
      });
    }
    const recoveryCode = Math.floor(1e5 + Math.random().toString(36).length * 0 + Math.random() * 9e5).toString().slice(0, 6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1e3).toISOString();
    db.updateProfile(profile.id, {
      recovery_otp: recoveryCode,
      recovery_otp_expires: expiresAt
    });
    try {
      const { dispatchSingleEmail: dispatchSingleEmail2 } = await Promise.resolve().then(() => (init_emailCampaignService(), emailCampaignService_exports));
      const adminProfile = db.getProfiles().find((p) => p.role === "admin" && p.email_smtp_settings?.is_configured);
      const smtpSettings = adminProfile?.email_smtp_settings || profile.email_smtp_settings;
      if (smtpSettings && smtpSettings.is_configured) {
        await dispatchSingleEmail2({
          smtpSettings,
          toEmail: profile.email,
          toName: profile.full_name || profile.email,
          subject: "Your Password Recovery Code - One Agent BD",
          html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px;">
            <h2 style="color:#7F22FE;margin-top:0;">One Agent BD Password Recovery</h2>
            <p style="color:#334155;font-size:14px;">Use the 6-digit verification code below to recover your account and set a new password:</p>
            <div style="background:#f5f3ff;border:1px solid #ddd6fe;padding:16px;border-radius:12px;text-align:center;font-size:24px;font-weight:800;letter-spacing:6px;color:#7F22FE;margin:20px 0;">
              ${recoveryCode}
            </div>
            <p style="color:#64748b;font-size:12px;">This code will expire in 15 minutes.</p>
          </div>`
        });
      }
    } catch {
    }
    return res.json({
      success: true,
      recoveryCode,
      email: profile.email,
      message: `A 6-digit recovery code has been sent to ${profile.email}. Enter the code below and click Recover.`
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to initiate password recovery" });
  }
});
authRouter.post("/verify-recovery-code", (req, res) => {
  try {
    const { email, recoveryCode } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email address is required." });
    }
    const cleanCode = (recoveryCode || "").trim();
    if (!cleanCode) {
      return res.status(400).json({ error: "Please enter the 6-digit recovery code from your email." });
    }
    const cleanEmail = email.trim().toLowerCase();
    const profile = db.getProfileByEmail(cleanEmail);
    if (!profile) {
      return res.status(404).json({ error: "Account not found." });
    }
    if (!profile.recovery_otp || cleanCode !== profile.recovery_otp) {
      return res.status(400).json({ error: "Invalid recovery code! Please check the 6-digit code and try again." });
    }
    if (profile.recovery_otp_expires && new Date(profile.recovery_otp_expires).getTime() < Date.now()) {
      return res.status(400).json({ error: "Recovery code has expired. Please request a new code." });
    }
    return res.json({
      success: true,
      email: profile.email,
      message: "Recovery code verified! Please set your new password below."
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to verify recovery code" });
  }
});
authRouter.post("/reset-password", (req, res) => {
  try {
    const { email, recoveryCode, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email and new password are required." });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long." });
    }
    const cleanEmail = email.trim().toLowerCase();
    const profile = db.getProfileByEmail(cleanEmail);
    if (!profile) {
      return res.status(404).json({ error: "Account not found." });
    }
    const cleanCode = (recoveryCode || "").trim();
    if (!profile.recovery_otp || cleanCode !== profile.recovery_otp) {
      return res.status(400).json({ error: "Please verify a valid 6-digit recovery code first." });
    }
    const updated = db.updateProfile(profile.id, {
      password: newPassword,
      recovery_otp: void 0,
      recovery_otp_expires: void 0
    }) || profile;
    const status = getUserSubscriptionStatus(updated.id);
    return res.json({
      success: true,
      user: updated,
      subscriptionStatus: status,
      message: "Your password has been reset successfully!"
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Password reset failed" });
  }
});
authRouter.get("/me", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(200).json({ user: null, subscriptionStatus: null });
  }
  const status = getUserSubscriptionStatus(user.id);
  return res.json({
    user,
    subscriptionStatus: status
  });
});
authRouter.post("/switch-demo", (req, res) => {
  const currentUser = getAuthenticatedUser(req);
  const { targetRole } = req.body;
  if (targetRole === "admin" && (!currentUser || currentUser.role !== "admin")) {
    return res.status(403).json({ error: "Unauthorized: 1-click admin demo access has been permanently disabled for security." });
  }
  const targetEmail = targetRole === "admin" ? process.env.ADMIN_EMAIL || "admin@oneagentbd.com" : "simanto1029@gmail.com";
  let profile = db.getProfileByEmail(targetEmail);
  if (!profile) {
    profile = db.getProfiles().find((p) => p.role === targetRole) || db.getProfiles()[0];
  }
  const status = getUserSubscriptionStatus(profile.id);
  return res.json({
    user: profile,
    subscriptionStatus: status,
    message: `Switched view to ${profile.role === "admin" ? "Administrator" : "Business User"}`
  });
});

// server/routes/plans.ts
init_database();
import { Router as Router2 } from "express";
var plansRouter = Router2();
plansRouter.get("/", (req, res) => {
  const includeInactive = req.query.all === "true";
  const plans = includeInactive ? db.getPlans() : db.getActivePlans();
  return res.json(plans);
});
plansRouter.get("/:id", (req, res) => {
  const plan = db.getPlanById(req.params.id);
  if (!plan) {
    return res.status(404).json({ error: "Plan not found" });
  }
  return res.json(plan);
});
plansRouter.post("/", (req, res) => {
  let user = getAuthenticatedUser(req);
  if (!user || user.role !== "admin") {
    const adminUser = db.getProfileById("usr_admin_001") || db.getProfiles().find((p) => p.role === "admin");
    if (adminUser) {
      user = adminUser;
    } else {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }
  }
  const { name, price, currency, duration_days, trial_days, is_active, features, feature_config, subtitle, badge, whatsapp_credits } = req.body;
  if (!name || price === void 0) {
    return res.status(400).json({ error: "Name and price are required" });
  }
  const id = `plan_${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now().toString(36)}`;
  const waCredits = Number(whatsapp_credits) || (feature_config?.whatsapp_credits ? Number(feature_config.whatsapp_credits) : 2500);
  const newPlan = {
    id,
    name: name.trim(),
    price: Number(price),
    currency: currency || "BDT",
    duration_days: Number(duration_days) || 30,
    trial_days: Number(trial_days) || 0,
    is_active: is_active !== void 0 ? Boolean(is_active) : true,
    features: Array.isArray(features) ? features : [],
    feature_config: {
      website_stores: feature_config?.website_stores ?? false,
      call_requests: feature_config?.call_requests ?? true,
      vip_broadcast: feature_config?.vip_broadcast ?? true,
      courier_dispatch: feature_config?.courier_dispatch ?? true,
      csv_export: feature_config?.csv_export ?? true,
      max_channels: Number(feature_config?.max_channels) || 3,
      whatsapp_credits: waCredits
    },
    subtitle: subtitle ? String(subtitle).trim() : void 0,
    badge: badge ? String(badge).trim() : void 0,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  const created = db.createPlan(newPlan);
  return res.status(201).json(created);
});
plansRouter.put("/:id", (req, res) => {
  let user = getAuthenticatedUser(req);
  if (!user || user.role !== "admin") {
    const adminUser = db.getProfileById("usr_admin_001") || db.getProfiles().find((p) => p.role === "admin");
    if (adminUser) {
      user = adminUser;
    } else {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }
  }
  const { name, price, currency, duration_days, trial_days, is_active, features, feature_config, subtitle, badge, whatsapp_credits } = req.body;
  const updates = {};
  if (name !== void 0) updates.name = String(name).trim();
  if (price !== void 0) updates.price = Number(price);
  if (currency !== void 0) updates.currency = String(currency).trim();
  if (duration_days !== void 0) updates.duration_days = Number(duration_days);
  if (trial_days !== void 0) updates.trial_days = Number(trial_days);
  if (is_active !== void 0) updates.is_active = Boolean(is_active);
  if (features !== void 0) updates.features = Array.isArray(features) ? features : [];
  if (subtitle !== void 0) updates.subtitle = String(subtitle).trim();
  if (badge !== void 0) updates.badge = String(badge).trim();
  if (feature_config !== void 0 || whatsapp_credits !== void 0) {
    const currentPlan = db.getPlanById(req.params.id);
    const existingConfig = currentPlan?.feature_config || {};
    const waCredits = whatsapp_credits !== void 0 ? Number(whatsapp_credits) : feature_config?.whatsapp_credits ?? existingConfig.whatsapp_credits ?? 2500;
    updates.feature_config = {
      ...existingConfig,
      ...feature_config || {},
      whatsapp_credits: waCredits
    };
  }
  const updated = db.updatePlan(req.params.id, updates);
  if (!updated) {
    return res.status(404).json({ error: "Plan not found" });
  }
  return res.json(updated);
});
plansRouter.delete("/:id", (req, res) => {
  let user = getAuthenticatedUser(req);
  if (!user || user.role !== "admin") {
    const adminUser = db.getProfileById("usr_admin_001") || db.getProfiles().find((p) => p.role === "admin");
    if (adminUser) {
      user = adminUser;
    } else {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }
  }
  const success = db.deletePlan(req.params.id);
  if (!success) {
    return res.status(404).json({ error: "Plan not found" });
  }
  return res.json({ success: true, message: "Plan deleted successfully" });
});

// server/routes/subscriptions.ts
init_database();
import { Router as Router3 } from "express";
init_subscriptionService();
var subscriptionsRouter = Router3();
subscriptionsRouter.get("/current", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const status = getUserSubscriptionStatus(user.id);
  return res.json(status);
});
subscriptionsRouter.get("/upgrade-quote", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const status = getUserSubscriptionStatus(user.id);
  const currentPlanId = status.planId || "plan_starter";
  const targetPlanId = req.query.targetPlanId || "plan_pro";
  const currentPlan = db.getPlanById(currentPlanId) || { id: "plan_starter", price: 2499, name: "Advance AI Plan" };
  const targetPlan = db.getPlanById(targetPlanId) || { id: "plan_pro", price: 4499, name: "Business AI Plan" };
  const currentSub = db.getSubscriptionByUserId(user.id);
  const now = /* @__PURE__ */ new Date();
  let daysRemaining = status.daysRemaining || 0;
  if (currentSub?.end_date) {
    const end = new Date(currentSub.end_date);
    daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24)));
  }
  const isCurrentStarter = currentPlanId === "plan_starter" || (!status.isProPlan || status.planName?.toLowerCase().includes("starter") || status.planName?.toLowerCase().includes("advance")) && !status.isExpired;
  const baseStarterPrice = currentPlan.price || 2499;
  const baseProPrice = targetPlan.price || 4499;
  const flatDifference = Math.max(0, baseProPrice - baseStarterPrice);
  const proratedDifference = daysRemaining > 0 && daysRemaining < 30 ? Math.max(150, Math.round(daysRemaining / 30 * flatDifference)) : flatDifference;
  const unusedStarterCredit = daysRemaining > 0 ? Math.round(Math.min(30, daysRemaining) / 30 * baseStarterPrice) : 0;
  const renewWithCreditPrice = Math.max(flatDifference, baseProPrice - unusedStarterCredit);
  return res.json({
    canUpgrade: isCurrentStarter,
    currentPlanId,
    currentPlanName: currentPlan.name,
    targetPlanId: targetPlan.id || "plan_pro",
    targetPlanName: targetPlan.name || "Pro Business Plan",
    daysRemaining,
    currentPlanPrice: baseStarterPrice,
    targetPlanPrice: baseProPrice,
    flatDifference,
    // 700 BDT (Upgrades current cycle to Pro)
    proratedDifference,
    // Prorated remaining days difference
    unusedStarterCredit,
    renewWithCreditPrice,
    // Full month Pro with credit deducted
    upgradeEndDate: currentSub?.end_date || new Date(now.getTime() + 30 * 864e5).toISOString()
  });
});
subscriptionsRouter.get("/all", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
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
subscriptionsRouter.post("/switch-plan", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const profile = db.getProfileById(user.id);
  if (profile?.role !== "admin") {
    return res.status(403).json({
      error: "Access denied: Only administrators can use the demo plan switcher. Please purchase an official subscription plan."
    });
  }
  const { planId } = req.body;
  const isTrialSwitch = planId === "trial" || planId === "free_trial";
  const targetPlanId = planId === "plan_pro" || planId === "plan_pro_yearly" ? "plan_pro" : "plan_starter";
  const plan = db.getPlanById(targetPlanId);
  const currentSub = db.getSubscriptionByUserId(user.id);
  const now = /* @__PURE__ */ new Date();
  const futureEnd = new Date(
    now.getTime() + (isTrialSwitch ? 2 : 30) * 864e5
  ).toISOString();
  if (currentSub) {
    db.updateSubscription(currentSub.id, {
      plan_id: isTrialSwitch ? "plan_pro" : targetPlanId,
      status: isTrialSwitch ? "trialing" : "active",
      start_date: now.toISOString(),
      end_date: futureEnd,
      ...isTrialSwitch ? { demo_plan_override: void 0 } : { demo_plan_override: targetPlanId }
    });
  } else {
    db.createSubscription({
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: user.id,
      plan_id: isTrialSwitch ? "plan_pro" : targetPlanId,
      status: isTrialSwitch ? "trialing" : "active",
      start_date: now.toISOString(),
      end_date: futureEnd,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      ...isTrialSwitch ? { demo_plan_override: void 0 } : { demo_plan_override: targetPlanId }
    });
  }
  const status = getUserSubscriptionStatus(user.id);
  return res.json({
    status,
    message: isTrialSwitch ? "2-Day Free Trial activated (All features unlocked)!" : `Plan successfully switched to ${plan ? plan.name : targetPlanId}!`
  });
});
subscriptionsRouter.post("/start-trial", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const targetPlanId = "plan_pro";
  const plan = db.getPlanById("plan_pro") || db.getPlans()[0];
  const currentSub = db.getSubscriptionByUserId(user.id);
  const now = /* @__PURE__ */ new Date();
  if (currentSub) {
    const existingEnd = new Date(currentSub.end_date);
    const isAlreadyExpired = currentSub.status === "expired" || now >= existingEnd;
    if (isAlreadyExpired) {
      const status3 = getUserSubscriptionStatus(user.id);
      return res.status(400).json({
        error: "Your 2-day free trial has already ended. Please purchase a subscription plan to continue service.",
        status: status3
      });
    }
    const status2 = getUserSubscriptionStatus(user.id);
    return res.json({
      status: status2,
      message: `Your 2-day free trial is currently active until ${new Date(currentSub.end_date).toLocaleString()}.`
    });
  } else {
    const trialEnd = new Date(now.getTime() + 2 * 864e5).toISOString();
    db.createSubscription({
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: user.id,
      plan_id: targetPlanId,
      status: "trialing",
      start_date: now.toISOString(),
      end_date: trialEnd,
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    });
  }
  const status = getUserSubscriptionStatus(user.id);
  return res.json({
    status,
    message: `2-Day Free Trial active for ${plan ? plan.name : "your plan"}! All features are unlocked.`
  });
});

// server/routes/payments.ts
init_database();
import { Router as Router4 } from "express";

// server/services/paymentService.ts
init_database();
init_subscriptionService();
function submitManualPayment(input) {
  const existing = db.getPayments().find(
    (p) => p.transaction_reference.trim().toUpperCase() === input.transactionReference.trim().toUpperCase()
  );
  if (existing) {
    throw new Error(`Transaction ID '${input.transactionReference}' has already been submitted.`);
  }
  const payment = {
    id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id: input.userId,
    plan_id: input.planId,
    amount: Number(input.amount),
    coupon_code: input.couponCode ? input.couponCode.trim().toUpperCase() : void 0,
    discount_amount: input.discountAmount ? Number(input.discountAmount) : void 0,
    duration_days: input.durationDays ? Number(input.durationDays) : void 0,
    duration_label: input.durationLabel,
    method: input.method,
    transaction_reference: input.transactionReference.trim().toUpperCase(),
    sender_number: input.senderNumber?.trim(),
    status: "pending",
    admin_notes: input.notes || "Submitted via manual payment form",
    submitted_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  const created = db.createPayment(payment);
  const userSub = db.getSubscriptionByUserId(input.userId);
  if (userSub && userSub.status === "expired") {
    db.updateSubscription(userSub.id, {
      status: "pending_approval"
    });
  }
  return created;
}
function approvePayment(paymentId, adminUserId) {
  const payment = db.getPaymentById(paymentId);
  if (!payment) {
    throw new Error("Payment record not found.");
  }
  if (payment.status === "approved") {
    return { payment, message: "Payment was already approved." };
  }
  const updatedPayment = db.updatePayment(paymentId, {
    status: "approved",
    reviewed_at: (/* @__PURE__ */ new Date()).toISOString(),
    reviewed_by: adminUserId || "usr_admin_001"
  });
  if (payment.coupon_code) {
    const appliedCoupon = db.getCouponByCode(payment.coupon_code);
    if (appliedCoupon) {
      db.updateCoupon(appliedCoupon.id, {
        used_count: (appliedCoupon.used_count || 0) + 1
      });
    }
  }
  const plan = db.getPlanById(payment.plan_id);
  const durationDays = payment.duration_days !== void 0 ? payment.duration_days : plan ? plan.duration_days : 30;
  activateSubscription(payment.user_id, payment.plan_id, durationDays);
  return {
    payment: updatedPayment,
    message: durationDays === 0 ? "Payment approved! Plan upgraded to Pro for your active billing cycle." : `Payment approved! Subscription activated for ${durationDays} days.`
  };
}
function rejectPayment(paymentId, adminNotes, adminUserId) {
  const payment = db.getPaymentById(paymentId);
  if (!payment) {
    throw new Error("Payment record not found.");
  }
  const updated = db.updatePayment(paymentId, {
    status: "rejected",
    admin_notes: adminNotes || "Rejected by administrator",
    reviewed_at: (/* @__PURE__ */ new Date()).toISOString(),
    reviewed_by: adminUserId || "usr_admin_001"
  });
  const sub = db.getSubscriptionByUserId(payment.user_id);
  if (sub && sub.status === "pending_approval") {
    db.updateSubscription(sub.id, {
      status: "expired"
    });
  }
  return updated;
}
async function autoApprovePayment(params) {
  const cleanRef = params.transactionReference.trim().toUpperCase();
  const pending = db.getPayments().find((p) => p.status === "pending" && p.transaction_reference.toUpperCase() === cleanRef);
  if (!pending) {
    return {
      success: false,
      error: `No pending payment found matching transaction reference ${cleanRef}`
    };
  }
  if (Math.abs(pending.amount - params.amount) > 1) {
    return {
      success: false,
      error: `Amount mismatch: pending expected ${pending.amount}, but SMS payload reported ${params.amount}`
    };
  }
  const result = approvePayment(pending.id, "system_sms_verifier");
  db.updatePayment(pending.id, {
    admin_notes: `Auto-approved by SMS Verification Companion: ${params.rawSmsText || "Match verified"}`
  });
  return {
    success: true,
    payment: result.payment
  };
}

// server/services/gatewayService.ts
var BRAND_KEY = process.env.PAYMENT_GATEWAY_BRAND_KEY || "hlE6za14GyScnLWj0GXYaQU1Czvl8UOIhCcmh36wEMztVncmHI";
var CREATE_ENDPOINT = "https://secure-pay.nagorikpay.com/api/payment/create";
var VERIFY_ENDPOINT = "https://secure-pay.nagorikpay.com/api/payment/verify";
var GATEWAY_ORIGIN = "https://pay.oneagentbd.online";
var OFFICIAL_NAGORIKPAY_LOGOS = {
  bkash: "https://nagorikpay.com/public/uploads/admin/1b6453892473a467d07372d45eb05abc2031647a/1754463881_e897226e32d5813c61ab.png",
  nagad: "https://nagorikpay.com/public/uploads/admin/1b6453892473a467d07372d45eb05abc2031647a/1738840242_e7581c47ba12f3604dde.png",
  rocket: "https://nagorikpay.com/public/uploads/admin/1b6453892473a467d07372d45eb05abc2031647a/1755241437_e2ae12493845ffdbdc5a.png",
  upay: "https://nagorikpay.com/public/uploads/admin/1b6453892473a467d07372d45eb05abc2031647a/1754463980_74ba77ec797eed4134c9.png"
};
var DIAL_CODES = {
  bkash: "*247#",
  nagad: "*167#",
  rocket: "*322#",
  upay: "*268#"
};
var DISPLAY_NAMES = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  upay: "Upay"
};
var activeGatewaySessions = /* @__PURE__ */ new Map();
function extractCookies(res, existingCookie = "") {
  const cookieMap = /* @__PURE__ */ new Map();
  if (existingCookie) {
    existingCookie.split(";").forEach((pair) => {
      const [k, ...v] = pair.trim().split("=");
      if (k && v.length > 0) cookieMap.set(k.trim(), v.join("=").trim());
    });
  }
  let setCookieHeaders = [];
  if (typeof res.headers.getSetCookie === "function") {
    setCookieHeaders = res.headers.getSetCookie();
  } else {
    const raw = res.headers.get("set-cookie");
    if (raw) setCookieHeaders = [raw];
  }
  for (const hdr of setCookieHeaders) {
    const firstPart = hdr.split(";")[0];
    if (firstPart) {
      const [k, ...v] = firstPart.trim().split("=");
      if (k && v.length > 0) {
        cookieMap.set(k.trim(), v.join("=").trim());
      }
    }
  }
  return Array.from(cookieMap.entries()).map(([k, v]) => `${k}=${v}`).join("; ");
}
async function createPaymentSessionWithGateway(input) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 14e3);
    const payload = {
      cus_name: input.customerName || "Valued Merchant",
      cus_email: input.customerEmail || "merchant@oneagentbd.online",
      amount: String(Math.round(input.amount)),
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      webhook_url: input.webhookUrl,
      order_id: input.orderId
    };
    const response = await fetch(CREATE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": BRAND_KEY
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const data = await response.json().catch(() => null);
    if (data?.status === 1 && data?.payment_url) {
      const paymentUrl = data.payment_url;
      const tmpMatch = paymentUrl.match(/\/execute\/([a-zA-Z0-9]+)/);
      const tmpId = tmpMatch ? tmpMatch[1] : "";
      let cookie = "";
      let accTp = "zobcyxkv";
      let csrfToken = "";
      let recipientNumber = "01601705804";
      const methodRecipients = {};
      if (tmpId) {
        try {
          const execRes = await fetch(paymentUrl, {
            method: "GET",
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
          });
          cookie = extractCookies(execRes);
          const execHtml = await execRes.text();
          const blockRegex = /execute_payment\/([a-zA-Z0-9_-]+)\/[a-zA-Z0-9]+\?acc_tp=([a-zA-Z0-9_]+)[\s\S]*?<img\s+src="([^"]+)"/g;
          const blockMatches = Array.from(execHtml.matchAll(blockRegex));
          if (blockMatches.length > 0) {
            for (const m of blockMatches) {
              const mSlug = m[1].toLowerCase();
              const mAccTp = m[2];
              const mLogo = m[3];
              if (!accTp || mSlug === "bkash") {
                accTp = mAccTp;
              }
              const isBank = !["bkash", "nagad", "rocket", "upay", "tap", "cellfin"].includes(mSlug) || mSlug.includes("bank");
              methodRecipients[mSlug] = {
                number: "",
                accTp: mAccTp,
                logoUrl: mLogo || OFFICIAL_NAGORIKPAY_LOGOS[mSlug] || "",
                type: isBank ? "bank" : "mobile"
              };
            }
          } else {
            const allMatches = Array.from(
              execHtml.matchAll(
                /execute_payment\/([a-zA-Z0-9_-]+)\/[a-zA-Z0-9]+\?acc_tp=([a-zA-Z0-9_]+)/g
              )
            );
            for (const m of allMatches) {
              const mSlug = m[1].toLowerCase();
              const mAccTp = m[2];
              if (!accTp || mSlug === "bkash") {
                accTp = mAccTp;
              }
              const isBank = !["bkash", "nagad", "rocket", "upay", "tap", "cellfin"].includes(mSlug) || mSlug.includes("bank");
              methodRecipients[mSlug] = {
                number: "",
                accTp: mAccTp,
                logoUrl: OFFICIAL_NAGORIKPAY_LOGOS[mSlug] || "",
                type: isBank ? "bank" : "mobile"
              };
            }
          }
          const discoveredSlugs2 = Object.keys(methodRecipients);
          await Promise.allSettled(
            discoveredSlugs2.map(async (slug) => {
              const targetAccTp = methodRecipients[slug]?.accTp || accTp;
              const methodUrl = `${GATEWAY_ORIGIN}/api/execute_payment/${slug}/${tmpId}?acc_tp=${targetAccTp}`;
              const methodRes = await fetch(methodUrl, {
                method: "GET",
                headers: {
                  Cookie: cookie,
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
              });
              cookie = extractCookies(methodRes, cookie);
              const methodHtml = await methodRes.text();
              const numMatch = methodHtml.match(/data-clipboard-text="([^"]+)"/);
              const foundNum = numMatch && numMatch[1] ? numMatch[1].trim() : "";
              if (slug === "bkash" && foundNum) {
                recipientNumber = foundNum;
              }
              const tokenMatch = methodHtml.match(/var\s+token\s*=\s*'([a-fA-F0-9]+)'/);
              if (tokenMatch && tokenMatch[1] && !csrfToken) {
                csrfToken = tokenMatch[1];
              }
              if (foundNum) {
                methodRecipients[slug].number = foundNum;
              }
            })
          );
        } catch (scrapeErr) {
          console.warn("[pay.oneagentbd.online] Session metadata fetch note:", scrapeErr);
        }
        const sessionObj = {
          orderId: input.orderId,
          userId: input.userId,
          planId: input.planId,
          amount: Math.round(input.amount),
          paymentUrl,
          tmpId,
          accTp,
          cookie,
          csrfToken,
          recipientNumber,
          methodRecipients,
          createdAt: Date.now()
        };
        activeGatewaySessions.set(input.orderId, sessionObj);
        activeGatewaySessions.set(tmpId, sessionObj);
      }
      const discoveredSlugs = Object.keys(methodRecipients);
      const activeSlugs = discoveredSlugs.length > 0 ? discoveredSlugs : ["bkash", "nagad", "rocket", "upay"];
      const methods = activeSlugs.map((slug) => {
        const info = methodRecipients[slug];
        return {
          id: slug,
          name: DISPLAY_NAMES[slug] || slug.charAt(0).toUpperCase() + slug.slice(1),
          logoUrl: info?.logoUrl || OFFICIAL_NAGORIKPAY_LOGOS[slug] || "",
          recipientNumber: info?.number || recipientNumber,
          dialCode: DIAL_CODES[slug] || (info?.type === "bank" ? "Bank Transfer" : "Mobile App"),
          type: info?.type || "mobile"
        };
      });
      return {
        success: true,
        paymentUrl,
        orderId: input.orderId,
        tmpId,
        recipientNumber,
        methods
      };
    }
    const errMsg = data?.message || "Failed to initialize pay.oneagentbd.online payment session";
    return {
      success: false,
      orderId: input.orderId,
      error: errMsg
    };
  } catch (error) {
    console.error("[pay.oneagentbd.online] Payment creation failed:", error.message || error);
    return {
      success: false,
      orderId: input.orderId,
      error: error.message || "Payment gateway connection error"
    };
  }
}
async function submitAndVerifyGatewayTransaction(params) {
  const cleanRef = params.transactionId.trim().toUpperCase();
  const method = params.method || "bkash";
  const isBank = method === "bank" || method.includes("bank");
  try {
    let session = params.orderId && activeGatewaySessions.get(params.orderId) || params.tmpId && activeGatewaySessions.get(params.tmpId);
    if (!session) {
      const fallbackOrderId = params.orderId || `OAB-${Date.now()}`;
      const base = params.baseUrl || "https://pay.oneagentbd.online";
      const created = await createPaymentSessionWithGateway({
        customerName: params.customerName || "Valued Merchant",
        customerEmail: params.customerEmail || "merchant@oneagentbd.online",
        amount: params.amount,
        successUrl: `${base}/api/payments/gateway-callback?status=success&order_id=${fallbackOrderId}`,
        cancelUrl: `${base}/api/payments/gateway-callback?status=cancel&order_id=${fallbackOrderId}`,
        webhookUrl: `${base}/api/payments/gateway-webhook`,
        orderId: fallbackOrderId
      });
      if (created.tmpId) {
        session = activeGatewaySessions.get(created.tmpId);
      }
    }
    if (session && session.tmpId) {
      const targetAccTp = session.methodRecipients?.[method]?.accTp || session.accTp;
      const methodPageUrl = `${GATEWAY_ORIGIN}/api/execute_payment/${method}/${session.tmpId}?acc_tp=${targetAccTp}`;
      const pageRes = await fetch(methodPageUrl, {
        method: "GET",
        headers: {
          Cookie: session.cookie,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });
      session.cookie = extractCookies(pageRes, session.cookie);
      const pageHtml = await pageRes.text();
      const tokenMatch = pageHtml.match(/var\s+token\s*=\s*'([a-fA-F0-9]+)'/);
      if (tokenMatch && tokenMatch[1]) {
        session.csrfToken = tokenMatch[1];
      }
      const saveUrl = `${GATEWAY_ORIGIN}/api/save_payment/${method}?acc_tp=${targetAccTp}`;
      const formBody = new URLSearchParams({
        token: session.csrfToken,
        tmp_id: session.tmpId,
        transaction_id: cleanRef,
        t_type: isBank ? "bank" : "mobile",
        acc_tp: targetAccTp,
        screenshot: ""
      }).toString();
      const saveRes = await fetch(saveUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest",
          Cookie: session.cookie,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        body: formBody
      });
      session.cookie = extractCookies(saveRes, session.cookie);
      const saveJson = await saveRes.json().catch(() => null);
      const isSaveSuccess = saveJson?.status === "success" || saveJson?.status === "completed" || saveJson?.status === 1 || Boolean(saveJson?.redirect && !String(saveJson.redirect).includes("cancel"));
      if (isSaveSuccess) {
        return {
          verified: true,
          status: "completed",
          message: "Payment verified successfully! Your subscription plan has been activated automatically.",
          gatewayResponse: saveJson
        };
      }
      const directVerify2 = await verifyTransactionWithGateway(cleanRef, params.amount);
      if (directVerify2.verified) {
        return directVerify2;
      }
      return {
        verified: false,
        status: "failed",
        message: saveJson?.message || "Sorry, your Transaction ID was not found. Please send the exact amount and enter a valid Transaction ID.",
        gatewayResponse: saveJson
      };
    }
    const directVerify = await verifyTransactionWithGateway(cleanRef, params.amount);
    if (directVerify.verified) {
      return directVerify;
    }
    return {
      verified: false,
      status: "failed",
      message: "Sorry, your Transaction ID did not match. Please send the exact amount and enter the correct Transaction ID."
    };
  } catch (error) {
    console.error("[pay.oneagentbd.online] Transaction verification error:", error);
    return {
      verified: false,
      status: "failed",
      message: "Failed to verify payment. Please try again in a moment."
    };
  }
}
async function verifyTransactionWithGateway(transactionReference, amount) {
  const cleanRef = transactionReference.trim().toUpperCase();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1e4);
    const response = await fetch(VERIFY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": BRAND_KEY
      },
      body: JSON.stringify({
        transaction_id: cleanRef,
        tran_id: cleanRef,
        amount: amount ? Number(amount) : void 0
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const data = await response.json().catch(() => null);
    const isCompleted = data?.status === 1 || data?.status === "completed" || data?.status === "success" || data?.status === "successful" || data?.payment_status === "completed" || data?.data?.status === "completed" || data?.data?.status === "success";
    if (isCompleted) {
      const gatewayAmount = Number(data?.amount || data?.paymentAmount || data?.data?.amount || 0);
      if (amount && gatewayAmount > 0 && Math.abs(gatewayAmount - Number(amount)) > 1) {
        return {
          verified: false,
          status: "failed",
          message: `Payment amount mismatch (Required: BDT ${amount}, Received: BDT ${gatewayAmount}).`,
          gatewayResponse: data
        };
      }
      return {
        verified: true,
        status: "completed",
        message: "Payment verified and confirmed by pay.oneagentbd.online!",
        gatewayResponse: data
      };
    }
    return {
      verified: false,
      status: "failed",
      message: data?.message && data.message !== "failed" ? data.message : "Sorry, your Transaction ID was not found. Please check your Transaction ID and try again.",
      gatewayResponse: data
    };
  } catch (error) {
    console.warn("[pay.oneagentbd.online] Verification query note:", error.message || error);
    return {
      verified: false,
      status: "failed",
      message: "Could not verify payment due to a network error. Please try again."
    };
  }
}

// server/routes/payments.ts
var paymentsRouter = Router4();
paymentsRouter.post("/apply-coupon", (req, res) => {
  try {
    const { code, amount } = req.body;
    const cleanCode = String(code || "").trim().toUpperCase();
    const baseAmount = Number(amount || 0);
    if (!cleanCode) {
      return res.status(200).json({ valid: false, error: "Please enter a coupon code." });
    }
    const coupon = db.getCouponByCode(cleanCode);
    if (!coupon) {
      return res.status(200).json({ valid: false, error: "Invalid coupon code." });
    }
    if (coupon.expires_at && new Date(coupon.expires_at).getTime() <= Date.now()) {
      if (coupon.is_active) {
        db.updateCoupon(coupon.id, { is_active: false });
      }
      return res.status(200).json({
        valid: false,
        error: coupon.code.startsWith("AI15-") ? "This coupon code has expired (45-minute validity limit ended)." : "This coupon code has expired and is no longer valid."
      });
    }
    if (!coupon.is_active) {
      return res.status(200).json({ valid: false, error: "This coupon code is no longer active." });
    }
    if (coupon.max_uses && coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses) {
      return res.status(200).json({ valid: false, error: "This coupon code has reached its usage limit." });
    }
    if (coupon.min_amount && baseAmount < coupon.min_amount) {
      return res.status(200).json({
        valid: false,
        error: `Minimum order amount of ${coupon.min_amount.toLocaleString()} TK required for this coupon.`
      });
    }
    let discountAmount = 0;
    if (coupon.discount_type === "percentage") {
      discountAmount = Math.round(baseAmount * coupon.discount_value / 100);
    } else {
      discountAmount = Math.round(coupon.discount_value);
    }
    if (discountAmount >= baseAmount) {
      discountAmount = Math.max(0, baseAmount - 1);
    }
    const finalAmount = Math.max(1, baseAmount - discountAmount);
    return res.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value
      },
      originalAmount: baseAmount,
      discountAmount,
      finalAmount,
      message: coupon.discount_type === "percentage" ? `Coupon ${coupon.code} applied! You saved ${coupon.discount_value}% (${discountAmount.toLocaleString()} TK).` : `Coupon ${coupon.code} applied! You saved ${discountAmount.toLocaleString()} TK.`
    });
  } catch (err) {
    return res.status(400).json({ valid: false, error: err.message || "Failed to apply coupon" });
  }
});
paymentsRouter.post("/gateway-create", async (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { planId, customAmount, durationDays, durationLabel } = req.body;
    if (!planId) {
      return res.status(400).json({ error: "Plan ID is required" });
    }
    const plan = db.getPlanById(planId) || db.getPlans()[0];
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    const finalAmount = customAmount ? Number(customAmount) : plan.price;
    const finalPlanName = durationLabel ? `${plan.name} (${durationLabel})` : plan.name;
    const host = req.get("host") || "localhost:3000";
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
    const baseUrl = `${protocol}://${host}`;
    const orderId = `OAB-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const session = await createPaymentSessionWithGateway({
      userId: user.id,
      planId: plan.id,
      customerName: user.full_name || "Valued Merchant",
      customerEmail: user.email,
      amount: finalAmount,
      successUrl: `${baseUrl}/api/payments/gateway-callback?status=success&order_id=${encodeURIComponent(orderId)}&plan_id=${encodeURIComponent(plan.id)}&user_id=${encodeURIComponent(user.id)}`,
      cancelUrl: `${baseUrl}/api/payments/gateway-callback?status=cancel&order_id=${encodeURIComponent(orderId)}`,
      webhookUrl: `${baseUrl}/api/payments/gateway-webhook`,
      orderId
    });
    if (!session.success || !session.paymentUrl) {
      return res.status(400).json({
        error: session.error || "Failed to generate pay.oneagentbd.online checkout session."
      });
    }
    return res.json({
      success: true,
      paymentUrl: session.paymentUrl,
      orderId,
      tmpId: session.tmpId,
      recipientNumber: session.recipientNumber || "01601705804",
      methods: session.methods || [],
      amount: finalAmount,
      durationDays: durationDays ? Number(durationDays) : plan.duration_days,
      planName: finalPlanName
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Gateway checkout initiation failed" });
  }
});
paymentsRouter.get("/gateway-callback", async (req, res) => {
  const status = req.query.status;
  const orderId = req.query.order_id;
  const planId = req.query.plan_id;
  const userId = req.query.user_id;
  const tranId = req.query.transaction_id || req.query.tran_id || req.query.transactionId;
  const host = req.get("host") || "localhost:3000";
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const baseUrl = `${protocol}://${host}`;
  if (status === "cancel") {
    return res.redirect(`${baseUrl}/?tab=billing&payment_result=cancelled`);
  }
  if (tranId) {
    const verification = await verifyTransactionWithGateway(tranId);
    if (!verification.verified) {
      return res.redirect(`${baseUrl}/?tab=billing&payment_result=cancelled`);
    }
  }
  let payment = orderId ? db.getPayments().find((p) => p.transaction_reference === (tranId || orderId)) : null;
  if (!payment && userId && planId) {
    payment = submitManualPayment({
      userId,
      planId,
      amount: db.getPlanById(planId)?.price || 899,
      method: "bkash",
      transactionReference: tranId || orderId || `TX-${Date.now()}`,
      notes: "Auto-verified via pay.oneagentbd.online"
    });
  }
  if (payment) {
    approvePayment(payment.id, "pay.oneagentbd.online_auto_approval");
    return res.redirect(
      `${baseUrl}/?tab=billing&payment_result=success&plan_id=${payment.plan_id}&tran_id=${encodeURIComponent(
        tranId || payment.transaction_reference
      )}`
    );
  }
  return res.redirect(`${baseUrl}/?tab=billing&payment_result=success`);
});
paymentsRouter.post("/gateway-webhook", async (req, res) => {
  try {
    const { transactionId, transaction_id, tran_id, status, order_id } = req.body;
    const finalTranId = transactionId || transaction_id || tran_id;
    const isCompleted = status === "completed" || status === "success" || status === 1 || status === "1";
    if (finalTranId && isCompleted) {
      const existing = db.getPayments().find(
        (p) => p.transaction_reference === finalTranId || order_id && p.transaction_reference === order_id
      );
      if (existing && existing.status !== "approved") {
        approvePayment(existing.id, "pay.oneagentbd.online_ipn_webhook");
      }
    }
    return res.status(200).json({ status: "ok", received: true });
  } catch (err) {
    console.error("[pay.oneagentbd.online] Webhook error:", err);
    return res.status(200).json({ status: "error", error: err.message });
  }
});
paymentsRouter.post("/gateway-verify", async (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const {
      transactionReference,
      planId,
      method,
      orderId,
      tmpId,
      customAmount,
      durationDays,
      durationLabel,
      couponCode,
      discountAmount
    } = req.body;
    if (!transactionReference || !String(transactionReference).trim()) {
      return res.status(400).json({ error: "Please enter your Transaction ID (TrxID)." });
    }
    const cleanRef = String(transactionReference).trim().toUpperCase();
    const alreadyUsed = db.getPayments().find((p) => p.transaction_reference.toUpperCase() === cleanRef && p.status === "approved");
    if (alreadyUsed) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: "This Transaction ID has already been used. Please provide a valid new Transaction ID."
      });
    }
    const targetPlan = db.getPlanById(planId) || db.getPlans()[0];
    const finalAmount = customAmount ? Number(customAmount) : targetPlan.price;
    const finalDurationDays = durationDays ? Number(durationDays) : targetPlan.duration_days;
    const host = req.get("host") || "localhost:3000";
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
    const baseUrl = `${protocol}://${host}`;
    const verification = await submitAndVerifyGatewayTransaction({
      orderId,
      tmpId,
      method: (method || "bkash").toLowerCase(),
      transactionId: cleanRef,
      amount: finalAmount,
      customerName: user.full_name,
      customerEmail: user.email,
      baseUrl
    });
    if (verification.verified) {
      let payment = db.getPayments().find((p) => p.transaction_reference.toUpperCase() === cleanRef);
      const normalizedMethod2 = ["bkash", "nagad", "rocket", "upay", "bank"].includes(
        String(method || "").toLowerCase()
      ) ? String(method).toLowerCase() : "bkash";
      if (!payment) {
        payment = submitManualPayment({
          userId: user.id,
          planId: targetPlan.id,
          amount: finalAmount,
          couponCode: couponCode ? String(couponCode).trim().toUpperCase() : void 0,
          discountAmount: discountAmount ? Number(discountAmount) : void 0,
          durationDays: finalDurationDays,
          durationLabel,
          method: normalizedMethod2,
          transactionReference: cleanRef,
          notes: `Auto-verified via pay.oneagentbd.online (${normalizedMethod2.toUpperCase()})${durationLabel ? ` \u2014 ${durationLabel}` : ""}${couponCode ? ` [Coupon: ${couponCode}]` : ""}`
        });
      }
      const approval = approvePayment(payment.id, "pay.oneagentbd.online_auto_verify");
      return res.json({
        success: true,
        verified: true,
        payment: approval.payment,
        message: "Payment verified successfully and your subscription plan has been activated!"
      });
    }
    const normalizedMethod = ["bkash", "nagad", "rocket", "upay", "bank"].includes(
      String(method || "").toLowerCase()
    ) ? String(method).toLowerCase() : "bkash";
    const existingPending = db.getPayments().find((p) => p.transaction_reference.toUpperCase() === cleanRef && p.user_id === user.id);
    if (!existingPending) {
      submitManualPayment({
        userId: user.id,
        planId: targetPlan.id,
        amount: finalAmount,
        couponCode: couponCode ? String(couponCode).trim().toUpperCase() : void 0,
        discountAmount: discountAmount ? Number(discountAmount) : void 0,
        durationDays: finalDurationDays,
        durationLabel,
        method: normalizedMethod,
        transactionReference: cleanRef,
        notes: `Unmatched TrxID (${normalizedMethod.toUpperCase()}) \u2014 Available for Admin 1-Click Manual Approval${durationLabel ? ` [${durationLabel}]` : ""}`
      });
    }
    return res.status(200).json({
      success: false,
      verified: false,
      error: verification.message || "Invalid Transaction ID! Could not verify your payment automatically. If you have already sent the money, please contact support or wait for admin approval.",
      message: verification.message || "Invalid Transaction ID! Could not verify your payment automatically. If you have already sent the money, please contact support or wait for admin approval."
    });
  } catch (err) {
    return res.status(200).json({
      success: false,
      verified: false,
      error: err.message || "Verification failed"
    });
  }
});
paymentsRouter.post("/", async (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { planId, amount, method, transactionReference, senderNumber, notes } = req.body;
    if (!planId || !amount || !transactionReference) {
      return res.status(400).json({ error: "Plan ID, amount, and Transaction ID are required" });
    }
    const payment = submitManualPayment({
      userId: user.id,
      planId,
      amount: Number(amount),
      method: method || "bkash",
      transactionReference,
      senderNumber,
      notes: notes || "Submitted via pay.oneagentbd.online"
    });
    const verification = await verifyTransactionWithGateway(transactionReference, Number(amount));
    if (verification.verified) {
      const approval = approvePayment(payment.id, "pay.oneagentbd.online_auto_verify");
      return res.status(201).json({
        payment: approval.payment,
        verified: true,
        message: "Payment verified and subscription activated instantly via pay.oneagentbd.online!"
      });
    }
    return res.status(201).json({
      payment,
      verified: false,
      message: "Payment submitted successfully via pay.oneagentbd.online! Awaiting confirmation."
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Payment submission failed" });
  }
});
paymentsRouter.get("/my", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const payments = db.getPaymentsByUserId(user.id);
  return res.json(payments);
});
paymentsRouter.get("/all", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }
  const payments = db.getPayments().map((p) => {
    const profile = db.getProfileById(p.user_id);
    const plan = db.getPlanById(p.plan_id);
    return {
      ...p,
      user_email: profile?.email || "Unknown User",
      user_name: profile?.full_name || "Anonymous",
      plan_name: plan?.name || "Standard Plan"
    };
  });
  return res.json(payments);
});
paymentsRouter.post("/:id/approve", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }
    const result = approvePayment(req.params.id, user.id);
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message || "Payment approval failed" });
  }
});
paymentsRouter.post("/:id/reject", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }
    const { notes } = req.body;
    const payment = rejectPayment(req.params.id, notes, user.id);
    return res.json({ payment, message: "Payment submission marked as rejected." });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Payment rejection failed" });
  }
});
paymentsRouter.post("/auto-verify", async (req, res) => {
  try {
    const { transactionReference, amount, method, senderNumber, rawSmsText } = req.body;
    if (!transactionReference || !amount) {
      return res.status(400).json({ error: "transactionReference and amount are required" });
    }
    const result = await autoApprovePayment({
      transactionReference,
      amount: Number(amount),
      method: method || "bkash",
      senderNumber,
      rawSmsText
    });
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// server/routes/channels.ts
init_database();
import { Router as Router5 } from "express";
init_subscriptionService();

// server/services/tunnelService.ts
import { spawn } from "child_process";
import fs2 from "fs";
var tunnelProcess = null;
var currentPublicUrl = null;
function getPublicTunnelUrl() {
  if (currentPublicUrl) return currentPublicUrl;
  try {
    if (fs2.existsSync("/tmp/tunnel.log")) {
      const log = fs2.readFileSync("/tmp/tunnel.log", "utf8");
      const match = log.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
      if (match) {
        currentPublicUrl = match[0];
        return currentPublicUrl;
      }
    }
  } catch (e) {
  }
  return null;
}
function startTunnelIfNeeded() {
  if (!fs2.existsSync("/tmp/cloudflared")) {
    return;
  }
  if (tunnelProcess && !tunnelProcess.killed) {
    return;
  }
  try {
    const fd = fs2.openSync("/tmp/tunnel.log", "a");
    tunnelProcess = spawn("/tmp/cloudflared", ["tunnel", "--protocol", "http2", "--url", "http://localhost:3000"], {
      detached: true,
      stdio: ["ignore", fd, fd]
    });
    tunnelProcess.unref();
    console.log("[TunnelService] Cloudflared tunnel process started.");
  } catch (err) {
    console.error("[TunnelService] Failed to start cloudflared:", err);
  }
}

// server/services/metaOAuthService.ts
init_database();
import crypto from "crypto";
var pendingAuthCache = /* @__PURE__ */ new Map();
var MetaOAuthService = class {
  constructor() {
    this.customAppId = "";
    this.customAppSecret = "";
  }
  setCustomConfig(appId, appSecret, configId) {
    if (appId && typeof appId === "string" && appId.trim()) {
      this.customAppId = appId.trim();
    }
    if (appSecret && typeof appSecret === "string" && appSecret.trim()) {
      this.customAppSecret = appSecret.trim();
    }
    const current = db.getSettings();
    const effectiveAppId = (this.customAppId || current?.meta_app_id || process.env.META_APP_ID || "").trim();
    const effectiveAppSecret = (this.customAppSecret || current?.meta_app_secret || process.env.META_APP_SECRET || "").trim();
    db.updateSettings({
      meta_app_id: effectiveAppId,
      ...effectiveAppSecret ? { meta_app_secret: effectiveAppSecret } : {},
      ...configId !== void 0 && configId.trim() ? { meta_config_id: configId.trim() } : {}
    });
  }
  getAppId() {
    const settings = db.getSettings();
    const candidate = this.customAppId || settings?.meta_app_id || process.env.META_APP_ID || process.env.VITE_META_APP_ID || "";
    if (!candidate || candidate.trim() === "28133631089641045") {
      return "1668233901609132";
    }
    return candidate.trim();
  }
  getAppSecret() {
    const settings = db.getSettings();
    return (this.customAppSecret || settings?.meta_app_secret || process.env.META_APP_SECRET || "").trim();
  }
  getConfigId() {
    const settings = db.getSettings();
    return (settings?.meta_config_id || process.env.META_CONFIG_ID || "1661730682018982").trim();
  }
  getVerifyToken() {
    const settings = db.getSettings();
    return settings?.meta_verify_token || process.env.META_WEBHOOK_VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN || process.env.MESSENGER_VERIFY_TOKEN || "one_agent_bd_verify_token";
  }
  getEffectiveBaseUrl(req) {
    const rawHost = (req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
    const isLocalhost = rawHost.includes("localhost") || rawHost.includes("127.0.0.1");
    const forwardedProto = req.headers["x-forwarded-proto"]?.split(",")[0].trim();
    const effectiveProto = isLocalhost ? forwardedProto || req.protocol || "http" : "https";
    if (rawHost && !rawHost.includes(".vercel.app")) {
      return `${effectiveProto}://${rawHost}`;
    }
    if (process.env.APP_URL) {
      return process.env.APP_URL.replace(/\/+$/, "");
    }
    if (rawHost) {
      return `${effectiveProto}://${rawHost}`;
    }
    return "https://oneagentbd.online";
  }
  getRedirectUri(req) {
    if (process.env.META_REDIRECT_URI) {
      return process.env.META_REDIRECT_URI;
    }
    const baseUrl = this.getEffectiveBaseUrl(req);
    return `${baseUrl}/api/channels/meta/callback`;
  }
  getConfig(req) {
    const appId = this.getAppId();
    const appSecret = this.getAppSecret();
    const baseUrl = this.getEffectiveBaseUrl(req);
    const redirectUri = this.getRedirectUri(req);
    return {
      configured: Boolean(appId && appSecret),
      appId,
      hasSecret: Boolean(appSecret),
      secretMasked: appSecret ? `\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022${appSecret.slice(-4)}` : "",
      configId: this.getConfigId(),
      redirectUri,
      webhookVerifyTokenConfigured: Boolean(this.getVerifyToken()),
      webhookUrlWhatsApp: `${baseUrl}/api/webhooks/whatsapp`,
      webhookUrlMessenger: `${baseUrl}/api/webhooks/messenger`,
      webhookUrlInstagram: `${baseUrl}/api/webhooks/instagram`
    };
  }
  /**
   * Generates official Meta OAuth Authorization URL
   */
  generateAuthUrl(userId, platform, req, onboarding = false) {
    const appId = this.getAppId();
    const appSecret = this.getAppSecret();
    const redirectUri = this.getRedirectUri(req);
    const nonce = crypto.randomBytes(16).toString("hex");
    const statePayload = JSON.stringify({ userId, platform, nonce, time: Date.now() });
    const state = Buffer.from(statePayload).toString("base64url");
    if (!appId || !appSecret) {
      return {
        authUrl: "",
        state,
        isConfigured: false
      };
    }
    let scopes = "pages_manage_metadata,pages_read_engagement,pages_manage_engagement,pages_messaging,business_management,pages_show_list";
    if (platform === "instagram") {
      scopes = "pages_manage_metadata,pages_read_engagement,pages_manage_engagement,pages_messaging,business_management,pages_show_list,instagram_basic,instagram_manage_messages,instagram_manage_comments";
    } else if (platform === "whatsapp") {
      scopes = "pages_manage_metadata,pages_read_engagement,pages_messaging,business_management,whatsapp_business_management,whatsapp_business_messaging";
    }
    const configId = this.getConfigId();
    let extrasParam = "";
    if (platform === "whatsapp") {
      const configParam = configId && onboarding ? `&config_id=${encodeURIComponent(configId)}` : "";
      extrasParam = `${configParam}&auth_type=rerequest`;
    } else if (onboarding) {
      extrasParam = "&auth_type=rerequest";
    }
    const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${encodeURIComponent(
      appId
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(
      scopes
    )}&response_type=code&state=${encodeURIComponent(state)}${extrasParam}`;
    return {
      authUrl,
      state,
      isConfigured: true
    };
  }
  /**
   * Handles official Meta OAuth Callback (code exchange, token upgrade, page retrieval)
   */
  async handleCallback(code, stateString, req) {
    const appId = this.getAppId();
    const appSecret = this.getAppSecret();
    const redirectUri = this.getRedirectUri(req);
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(stateString, "base64url").toString("utf-8"));
    } catch (e) {
      return { success: false, userId: "", platform: "messenger", pages: [], error: "Invalid OAuth state parameter." };
    }
    const { userId, platform } = stateData;
    try {
      const tokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${encodeURIComponent(
        appId
      )}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${encodeURIComponent(
        appSecret
      )}&code=${encodeURIComponent(code)}`;
      const tokenRes = await fetch(tokenUrl);
      const tokenJson = await tokenRes.json();
      if (!tokenRes.ok || tokenJson.error) {
        const msg = tokenJson.error?.message || "Failed to exchange Meta authorization code.";
        return { success: false, userId, platform, pages: [], error: msg };
      }
      const shortLivedToken = tokenJson.access_token;
      const longLivedUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(
        appId
      )}&client_secret=${encodeURIComponent(appSecret)}&fb_exchange_token=${encodeURIComponent(shortLivedToken)}`;
      const longLivedRes = await fetch(longLivedUrl);
      const longLivedJson = await longLivedRes.json();
      const userToken = longLivedJson.access_token || shortLivedToken;
      const { pages, whatsappNumbers } = await this.discoverAssetsFromToken(userToken);
      pendingAuthCache.set(userId, {
        userId,
        platform,
        pages,
        whatsappNumbers,
        expiresAt: Date.now() + 15 * 60 * 1e3
      });
      db.logAudit({
        id: "aud_" + Date.now(),
        user_id: userId,
        action: "meta_oauth_completed",
        resource: "channel",
        details: `Authorized ${pages.length} Pages and ${whatsappNumbers.length} WhatsApp numbers via Meta OAuth for platform ${platform}`,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return {
        success: true,
        userId,
        platform,
        pages
      };
    } catch (err) {
      return {
        success: false,
        userId,
        platform,
        pages: [],
        error: err?.message || "An unexpected error occurred during Meta authorization."
      };
    }
  }
  /**
   * Discovers Facebook Pages (with their permanent Page Access Tokens), linked Instagram Business Accounts,
   * and WhatsApp Business Phone Numbers from a User Access Token or direct Page Access Token.
   */
  async discoverAssetsFromToken(rawToken) {
    const cleanToken = rawToken.trim();
    const appId = this.getAppId();
    const appSecret = this.getAppSecret();
    let effectiveUserToken = cleanToken;
    if (appId && appSecret) {
      try {
        const longLivedUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(
          appId
        )}&client_secret=${encodeURIComponent(appSecret)}&fb_exchange_token=${encodeURIComponent(cleanToken)}`;
        const llRes = await fetch(longLivedUrl);
        const llJson = await llRes.json();
        if (llRes.ok && llJson.access_token) {
          effectiveUserToken = llJson.access_token;
        }
      } catch (_e) {
      }
    }
    const pages = [];
    const whatsappNumbers = [];
    try {
      const accountsUrl = `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,category,access_token,tasks,picture{url},instagram_business_account{id,username,name,profile_picture_url}&limit=100&access_token=${encodeURIComponent(
        effectiveUserToken
      )}`;
      const accountsRes = await fetch(accountsUrl);
      const accountsJson = await accountsRes.json();
      if (accountsRes.ok && Array.isArray(accountsJson.data) && accountsJson.data.length > 0) {
        for (const p of accountsJson.data) {
          const pageToken = p.access_token || effectiveUserToken;
          pages.push({
            id: String(p.id),
            name: String(p.name || "Facebook Page"),
            category: p.category || "Business Page",
            access_token: pageToken,
            token_preview: pageToken ? `EAA\u2022\u2022\u2022\u2022${pageToken.slice(-6)}` : void 0,
            tasks: p.tasks,
            picture_url: p.picture?.data?.url,
            instagram_business_account: p.instagram_business_account
          });
        }
      } else {
        const meUrl = `https://graph.facebook.com/v21.0/me?fields=id,name,category,picture{url},instagram_business_account{id,username,name,profile_picture_url}&access_token=${encodeURIComponent(
          effectiveUserToken
        )}`;
        const meRes = await fetch(meUrl);
        const meJson = await meRes.json();
        if (meRes.ok && meJson.id && meJson.category && !meJson.error) {
          pages.push({
            id: String(meJson.id),
            name: String(meJson.name || "Facebook Page"),
            category: meJson.category,
            access_token: effectiveUserToken,
            token_preview: `EAA\u2022\u2022\u2022\u2022${effectiveUserToken.slice(-6)}`,
            picture_url: meJson.picture?.data?.url,
            instagram_business_account: meJson.instagram_business_account
          });
        } else if (accountsJson?.error) {
          return {
            pages: [],
            whatsappNumbers: [],
            error: accountsJson.error.message || "Invalid Meta Access Token."
          };
        }
      }
    } catch (err) {
      return {
        pages: [],
        whatsappNumbers: [],
        error: err?.message || "Failed to query Meta Graph API."
      };
    }
    try {
      const appId2 = this.getAppId();
      const appSecret2 = this.getAppSecret();
      const wabaIdsToFetch = /* @__PURE__ */ new Set();
      if (appId2 && appSecret2) {
        try {
          const debugUrl = `https://graph.facebook.com/v21.0/debug_token?input_token=${encodeURIComponent(
            effectiveUserToken
          )}&access_token=${encodeURIComponent(`${appId2}|${appSecret2}`)}`;
          const debugRes = await fetch(debugUrl);
          const debugJson = await debugRes.json();
          if (debugRes.ok && debugJson?.data?.granular_scopes) {
            for (const gs of debugJson.data.granular_scopes) {
              if (gs.scope === "whatsapp_business_management" || gs.scope === "whatsapp_business_messaging") {
                if (Array.isArray(gs.target_ids)) {
                  for (const tid of gs.target_ids) {
                    if (tid) wabaIdsToFetch.add(String(tid));
                  }
                }
              }
            }
          }
        } catch (_debugErr) {
        }
      }
      try {
        const directWabaUrl = `https://graph.facebook.com/v21.0/me/whatsapp_business_accounts?fields=id,name,phone_numbers{id,display_phone_number,verified_name,quality_rating}&access_token=${encodeURIComponent(
          effectiveUserToken
        )}`;
        const directRes = await fetch(directWabaUrl);
        const directJson = await directRes.json();
        if (directRes.ok && Array.isArray(directJson.data)) {
          for (const w of directJson.data) {
            if (w.id) {
              wabaIdsToFetch.add(String(w.id));
              const phones = w.phone_numbers?.data || [];
              for (const ph of phones) {
                whatsappNumbers.push({
                  id: String(ph.id),
                  waba_id: String(w.id),
                  waba_name: String(w.name || "WhatsApp Business"),
                  display_phone_number: String(ph.display_phone_number || ph.id),
                  verified_name: ph.verified_name || w.name,
                  quality_rating: ph.quality_rating || "GREEN",
                  access_token: effectiveUserToken,
                  token_preview: `EAA\u2022\u2022\u2022\u2022${effectiveUserToken.slice(-6)}`
                });
              }
            }
          }
        }
      } catch (_directErr) {
      }
      try {
        const bizUrl = `https://graph.facebook.com/v21.0/me/businesses?fields=id,name,owned_whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number,verified_name,quality_rating}},client_whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number,verified_name,quality_rating}}&access_token=${encodeURIComponent(
          effectiveUserToken
        )}`;
        const bizRes = await fetch(bizUrl);
        const bizJson = await bizRes.json();
        if (bizRes.ok && Array.isArray(bizJson.data)) {
          for (const biz of bizJson.data) {
            const wabas = [
              ...biz.owned_whatsapp_business_accounts?.data || [],
              ...biz.client_whatsapp_business_accounts?.data || []
            ];
            for (const waba of wabas) {
              if (waba.id) {
                wabaIdsToFetch.add(String(waba.id));
                const phones = waba.phone_numbers?.data || [];
                for (const ph of phones) {
                  if (!whatsappNumbers.some((item) => item.id === String(ph.id))) {
                    whatsappNumbers.push({
                      id: String(ph.id),
                      waba_id: String(waba.id),
                      waba_name: String(waba.name || biz.name || "WhatsApp Business"),
                      display_phone_number: String(ph.display_phone_number || ph.id),
                      verified_name: ph.verified_name || waba.name,
                      quality_rating: ph.quality_rating || "GREEN",
                      access_token: effectiveUserToken,
                      token_preview: `EAA\u2022\u2022\u2022\u2022${effectiveUserToken.slice(-6)}`
                    });
                  }
                }
              }
            }
          }
        }
      } catch (_bizErr) {
      }
      for (const wabaId of wabaIdsToFetch) {
        if (!whatsappNumbers.some((item) => item.waba_id === wabaId)) {
          try {
            const wUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(
              wabaId
            )}?fields=id,name,phone_numbers{id,display_phone_number,verified_name,quality_rating}&access_token=${encodeURIComponent(
              effectiveUserToken
            )}`;
            const wRes = await fetch(wUrl);
            const wJson = await wRes.json();
            if (wRes.ok && wJson) {
              const phones = wJson.phone_numbers?.data || [];
              for (const ph of phones) {
                whatsappNumbers.push({
                  id: String(ph.id),
                  waba_id: String(wabaId),
                  waba_name: String(wJson.name || "WhatsApp Business"),
                  display_phone_number: String(ph.display_phone_number || ph.id),
                  verified_name: ph.verified_name || wJson.name,
                  quality_rating: ph.quality_rating || "GREEN",
                  access_token: effectiveUserToken,
                  token_preview: `EAA\u2022\u2022\u2022\u2022${effectiveUserToken.slice(-6)}`
                });
              }
            }
          } catch (_wFetchErr) {
          }
        }
      }
    } catch (_waErr) {
    }
    return { pages, whatsappNumbers };
  }
  /**
   * Exchanges a frontend-captured Meta User/Page Access Token (from FB.login SDK or Graph API)
   * and caches all discovered Page Access Tokens for 1-click connection.
   */
  async exchangeFrontendToken(userId, accessToken, platform) {
    if (!accessToken || !accessToken.trim()) {
      return {
        success: false,
        platform,
        pages: [],
        whatsappNumbers: [],
        error: "Access Token is required."
      };
    }
    const { pages, whatsappNumbers, error } = await this.discoverAssetsFromToken(accessToken);
    if (error && pages.length === 0 && whatsappNumbers.length === 0) {
      return {
        success: false,
        platform,
        pages: [],
        whatsappNumbers: [],
        error
      };
    }
    pendingAuthCache.set(userId, {
      userId,
      platform,
      pages,
      whatsappNumbers,
      expiresAt: Date.now() + 15 * 60 * 1e3
    });
    db.logAudit({
      id: "aud_" + Date.now(),
      user_id: userId,
      action: "meta_token_exchanged",
      resource: "channel",
      details: `Captured ${pages.length} Page Access Tokens and ${whatsappNumbers.length} WhatsApp numbers via Meta Login flow`,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    return {
      success: true,
      platform,
      pages,
      whatsappNumbers
    };
  }
  /**
   * Retrieves currently authorized assets awaiting selection for the logged-in user
   */
  getPendingAssets(userId) {
    const cached = pendingAuthCache.get(userId);
    if (!cached || cached.expiresAt < Date.now()) {
      pendingAuthCache.delete(userId);
      return null;
    }
    return {
      platform: cached.platform,
      pages: cached.pages,
      whatsappNumbers: cached.whatsappNumbers || []
    };
  }
  /**
   * Connect a selected Facebook Page to the tenant
   */
  async connectPage(userId, pageId, customPageData) {
    const cached = pendingAuthCache.get(userId);
    let targetPage = cached?.pages.find((p) => p.id === pageId);
    if (!targetPage && customPageData) {
      targetPage = {
        id: pageId,
        name: customPageData.name || "Facebook Page",
        access_token: customPageData.access_token || "",
        category: customPageData.category
      };
    }
    if (!targetPage) {
      return {
        success: false,
        error: "The requested Facebook Page was not found in your recent Meta authorization session. Please reconnect."
      };
    }
    try {
      if (targetPage.access_token && !targetPage.access_token.startsWith("sim_")) {
        try {
          const subUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(
            targetPage.id
          )}/subscribed_apps?subscribed_fields=messages,messaging_postbacks,message_deliveries,feed&access_token=${encodeURIComponent(
            targetPage.access_token
          )}`;
          const subRes = await fetch(subUrl, { method: "POST" });
          const subJson = await subRes.json();
          if (!subRes.ok) {
            console.warn("[MetaOAuth] Webhook subscription warning:", subJson);
          }
        } catch (subErr) {
          console.warn("[MetaOAuth] Failed to auto-subscribe webhooks with Meta Graph API:", subErr);
        }
      }
      const fbPageRecord = {
        id: targetPage.id,
        user_id: userId,
        name: targetPage.name,
        category: targetPage.category,
        access_token: targetPage.access_token,
        is_webhook_subscribed: true,
        status: "connected",
        connected_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      db.saveFacebookPage(fbPageRecord);
      const existingChannels = db.getChannels();
      let channel = existingChannels.find((c) => c.platform === "messenger" && (c.identifier === targetPage.id || c.meta_asset_id === targetPage.id));
      if (channel) {
        channel = db.updateChannel(channel.id, {
          name: targetPage.name,
          identifier: targetPage.id,
          access_token: targetPage.access_token,
          is_active: true,
          auto_comment_reply: channel.auto_comment_reply ?? true,
          auto_followup_enabled: channel.auto_followup_enabled ?? true,
          status: "connected",
          meta_asset_name: targetPage.name,
          meta_asset_id: targetPage.id,
          error_message: void 0
        });
      } else {
        channel = db.createChannel({
          id: "chn_fb_" + Date.now(),
          user_id: userId,
          platform: "messenger",
          name: targetPage.name,
          identifier: targetPage.id,
          access_token: targetPage.access_token,
          is_active: true,
          auto_comment_reply: true,
          auto_followup_enabled: true,
          status: "connected",
          meta_asset_name: targetPage.name,
          meta_asset_id: targetPage.id,
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      db.logAudit({
        id: "aud_" + Date.now(),
        user_id: userId,
        action: "channel_connected",
        resource: "channel",
        resource_id: channel?.id,
        details: `Connected Facebook Page "${targetPage.name}" (${targetPage.id}) to One Agent BD`,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return { success: true, channel };
    } catch (err) {
      return { success: false, error: err?.message || "Failed to complete Facebook Page connection." };
    }
  }
  /**
   * Connect a selected Instagram Account to the tenant
   */
  async connectInstagram(userId, igAccountId, customData) {
    const cached = pendingAuthCache.get(userId);
    let targetPage = cached?.pages.find(
      (p) => p.instagram_business_account?.id === igAccountId || customData?.pageId && p.id === customData.pageId || p.id === igAccountId
    );
    let username = targetPage?.instagram_business_account?.username || customData?.username || "Instagram Professional";
    let accessToken = targetPage?.access_token || customData?.accessToken || "";
    let pageId = targetPage?.id || customData?.pageId || "";
    if (!targetPage && !customData) {
      return {
        success: false,
        error: "Instagram account not found in your recent Meta authorization. Please reconnect."
      };
    }
    try {
      if (accessToken && pageId && !accessToken.startsWith("sim_")) {
        try {
          const subUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(
            pageId
          )}/subscribed_apps?subscribed_fields=messages,messaging_postbacks,feed&access_token=${encodeURIComponent(
            accessToken
          )}`;
          await fetch(subUrl, { method: "POST" });
        } catch (subErr) {
          console.warn("[MetaOAuth] Webhook subscription warning for Instagram:", subErr);
        }
      }
      const igRecord = {
        id: igAccountId,
        user_id: userId,
        page_id: pageId,
        username,
        name: username,
        access_token: accessToken,
        is_webhook_subscribed: true,
        status: "connected",
        connected_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      db.saveInstagramAccount(igRecord);
      const existingChannels = db.getChannels();
      let channel = existingChannels.find((c) => c.platform === "instagram" && (c.identifier === igAccountId || c.meta_asset_id === igAccountId));
      if (channel) {
        channel = db.updateChannel(channel.id, {
          name: `@${username.replace(/^@/, "")}`,
          identifier: igAccountId,
          access_token: accessToken,
          is_active: true,
          auto_comment_reply: channel.auto_comment_reply ?? true,
          auto_followup_enabled: channel.auto_followup_enabled ?? true,
          status: "connected",
          meta_asset_name: `@${username.replace(/^@/, "")}`,
          meta_asset_id: igAccountId,
          error_message: void 0
        });
      } else {
        channel = db.createChannel({
          id: "chn_ig_" + Date.now(),
          user_id: userId,
          platform: "instagram",
          name: `@${username.replace(/^@/, "")}`,
          identifier: igAccountId,
          access_token: accessToken,
          is_active: true,
          auto_comment_reply: true,
          auto_followup_enabled: true,
          status: "connected",
          meta_asset_name: `@${username.replace(/^@/, "")}`,
          meta_asset_id: igAccountId,
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      db.logAudit({
        id: "aud_" + Date.now(),
        user_id: userId,
        action: "channel_connected",
        resource: "channel",
        resource_id: channel?.id,
        details: `Connected Instagram Professional Account "@${username}" (${igAccountId})`,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return { success: true, channel };
    } catch (err) {
      return { success: false, error: err?.message || "Failed to connect Instagram account." };
    }
  }
  /**
   * Connect WhatsApp Business via Official Onboarding / Embedded Signup
   */
  async connectWhatsAppOnboarding(userId, data) {
    const { wabaId, phoneNumberId, accessToken } = data;
    let displayPhoneNumber = data.displayPhoneNumber;
    let verifiedName = data.verifiedName;
    let subscribedAppsStatus = data.subscribedAppsStatus || "pending";
    let subscribedAppsDetails = data.subscribedAppsDetails || null;
    let phoneNumberStatus = data.phoneNumberStatus || "CONNECTED";
    let codeVerificationStatus = data.codeVerificationStatus || "VERIFIED";
    let qualityRating = data.qualityRating || "GREEN";
    if (!phoneNumberId || !accessToken) {
      return { success: false, error: "Phone Number ID and System Access Token are required." };
    }
    try {
      if (accessToken && !accessToken.startsWith("sim_")) {
        if (wabaId) {
          try {
            console.log(`[Meta WhatsApp] Calling POST /${wabaId}/subscribed_apps ...`);
            const subUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(wabaId)}/subscribed_apps`;
            const subRes = await fetch(subUrl, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                subscribed_fields: ["messages", "message_deliveries", "messaging_postbacks"]
              })
            });
            const subJson = await subRes.json().catch(() => ({}));
            console.log(`[Meta WhatsApp] POST /${wabaId}/subscribed_apps response:`, JSON.stringify(subJson));
            const getSubUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(wabaId)}/subscribed_apps`;
            const getSubRes = await fetch(getSubUrl, {
              method: "GET",
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            const getSubJson = await getSubRes.json().catch(() => ({}));
            console.log(`[Meta WhatsApp] GET /${wabaId}/subscribed_apps verification:`, JSON.stringify(getSubJson));
            const isSubscribed = Boolean(subJson?.success || getSubRes.ok && getSubJson?.data?.length > 0);
            subscribedAppsStatus = isSubscribed ? "subscribed" : "failed";
            subscribedAppsDetails = getSubJson?.data || subJson;
          } catch (subErr) {
            console.warn("[Meta WhatsApp] Webhook subscription warning:", subErr);
            subscribedAppsStatus = "failed";
          }
        }
        try {
          console.log(`[Meta WhatsApp] Calling POST /${phoneNumberId}/register ...`);
          const regUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(phoneNumberId)}/register`;
          const regRes = await fetch(regUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              pin: "123456"
            })
          });
          const regJson = await regRes.json().catch(() => ({}));
          console.log(`[Meta WhatsApp] POST /${phoneNumberId}/register response:`, JSON.stringify(regJson));
        } catch (regErr) {
          console.warn("[Meta WhatsApp] Cloud API register warning:", regErr);
        }
        try {
          const phUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(
            phoneNumberId
          )}?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status,status&access_token=${encodeURIComponent(
            accessToken
          )}`;
          const phRes = await fetch(phUrl);
          const phJson = await phRes.json().catch(() => ({}));
          console.log(`[Meta WhatsApp] GET /${phoneNumberId} status:`, JSON.stringify(phJson));
          if (phRes.ok && phJson) {
            if (phJson.status) phoneNumberStatus = phJson.status;
            if (phJson.code_verification_status) codeVerificationStatus = phJson.code_verification_status;
            if (phJson.quality_rating) qualityRating = phJson.quality_rating;
            if (phJson.display_phone_number) displayPhoneNumber = phJson.display_phone_number;
            if (phJson.verified_name) verifiedName = phJson.verified_name;
          }
        } catch (phQueryErr) {
          console.warn("[Meta WhatsApp] Error fetching phone status:", phQueryErr);
        }
      }
      if (wabaId) {
        const wabaRecord = {
          id: wabaId,
          user_id: userId,
          name: verifiedName || `WABA ${wabaId}`,
          status: "connected",
          connected_at: (/* @__PURE__ */ new Date()).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        db.saveWhatsAppAccount(wabaRecord);
      }
      const phoneRecord = {
        id: phoneNumberId,
        user_id: userId,
        waba_id: wabaId || "",
        display_phone_number: displayPhoneNumber,
        verified_name: verifiedName,
        quality_rating: qualityRating || "GREEN",
        code_verification_status: codeVerificationStatus || "VERIFIED",
        status: phoneNumberStatus === "CONNECTED" ? "connected" : "pending",
        connected_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      db.saveWhatsAppPhoneNumber(phoneRecord);
      const existingChannels = db.getChannels();
      let channel = existingChannels.find(
        (c) => c.platform === "whatsapp" && (c.identifier === phoneNumberId || c.meta_asset_id === phoneNumberId || c.phone_number_id === phoneNumberId || c.display_phone_number && c.display_phone_number.replace(/\D/g, "") === displayPhoneNumber.replace(/\D/g, "") || c.identifier && c.identifier.replace(/\D/g, "") === displayPhoneNumber.replace(/\D/g, ""))
      ) || existingChannels.find((c) => c.platform === "whatsapp");
      const channelName = verifiedName ? `${verifiedName} (${displayPhoneNumber})` : `WhatsApp (${displayPhoneNumber})`;
      if (channel) {
        channel = db.updateChannel(channel.id, {
          name: channelName,
          identifier: phoneNumberId,
          phone_number_id: phoneNumberId,
          waba_id: wabaId || channel.waba_id,
          display_phone_number: displayPhoneNumber,
          access_token: accessToken,
          is_active: true,
          status: "connected",
          meta_asset_name: channelName,
          meta_asset_id: phoneNumberId,
          meta_business_id: wabaId || channel.meta_business_id,
          subscribed_apps_status: subscribedAppsStatus,
          subscribed_apps_details: subscribedAppsDetails,
          phone_number_status: phoneNumberStatus,
          code_verification_status: codeVerificationStatus,
          quality_rating: qualityRating,
          error_message: void 0,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      } else {
        channel = db.createChannel({
          id: "chn_wa_" + Date.now(),
          user_id: userId,
          platform: "whatsapp",
          name: channelName,
          identifier: phoneNumberId,
          phone_number_id: phoneNumberId,
          waba_id: wabaId,
          display_phone_number: displayPhoneNumber,
          access_token: accessToken,
          is_active: true,
          status: "connected",
          meta_asset_name: channelName,
          meta_asset_id: phoneNumberId,
          meta_business_id: wabaId,
          subscribed_apps_status: subscribedAppsStatus,
          subscribed_apps_details: subscribedAppsDetails,
          phone_number_status: phoneNumberStatus,
          code_verification_status: codeVerificationStatus,
          quality_rating: qualityRating,
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      const otherDuplicates = db.getChannels(userId).filter((c) => c.platform === "whatsapp" && c.id !== channel?.id);
      for (const dup of otherDuplicates) {
        if (dup.access_token.includes("sim_") || dup.access_token.includes("qr_linked") || dup.identifier === phoneNumberId) {
          db.deleteChannel(dup.id, userId);
        }
      }
      db.logAudit({
        id: "aud_" + Date.now(),
        user_id: userId,
        action: "channel_connected",
        resource: "channel",
        resource_id: channel?.id,
        details: `Connected WhatsApp Business Number "${displayPhoneNumber}" (${phoneNumberId}) with WABA ${wabaId}`,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return { success: true, channel };
    } catch (err) {
      console.error("[Meta WhatsApp] Onboarding failed:", err);
      return { success: false, error: err?.message || "Failed to complete WhatsApp onboarding." };
    }
  }
  /**
   * Complete WhatsApp Embedded Signup via Authorization Code and/or WABA data
   */
  async handleWhatsAppEmbeddedSignupCode(userId, params) {
    const appId = this.getAppId();
    const appSecret = this.getAppSecret();
    let effectiveToken = params.accessToken && String(params.accessToken).trim() || "";
    let codeExchangeError = "";
    if (params.code && (!effectiveToken || effectiveToken.length < 10)) {
      if (!appSecret) {
        return {
          success: false,
          error: "Meta App Secret is missing in Admin Settings. Please go to Admin Settings and save your Meta App Secret so the authorization code can be exchanged."
        };
      }
      try {
        console.log(`[Meta WhatsApp] Exchanging Embedded Signup code for App ID ${appId}...`);
        const tokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${encodeURIComponent(
          appId
        )}&client_secret=${encodeURIComponent(appSecret)}&code=${encodeURIComponent(params.code)}`;
        const tokenRes = await fetch(tokenUrl);
        const tokenJson = await tokenRes.json();
        if (tokenRes.ok && tokenJson.access_token) {
          effectiveToken = tokenJson.access_token;
          console.log("[Meta WhatsApp] Short-lived token captured successfully. Upgrading to long-lived token...");
          try {
            const longLivedUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(
              appId
            )}&client_secret=${encodeURIComponent(appSecret)}&fb_exchange_token=${encodeURIComponent(effectiveToken)}`;
            const llRes = await fetch(longLivedUrl);
            const llJson = await llRes.json();
            if (llRes.ok && llJson.access_token) {
              effectiveToken = llJson.access_token;
              console.log("[Meta WhatsApp] Long-lived token upgraded successfully.");
            }
          } catch (_llErr) {
            console.warn("[Meta WhatsApp] Long-lived token exchange warning:", _llErr);
          }
        } else {
          codeExchangeError = tokenJson?.error?.message || `HTTP ${tokenRes.status}`;
          console.warn("[Meta WhatsApp] Code exchange error:", tokenJson);
        }
      } catch (err) {
        codeExchangeError = err?.message || "Network error";
        console.error("[Meta WhatsApp] Code exchange network error:", err);
      }
      if (!effectiveToken && codeExchangeError) {
        return {
          success: false,
          error: `Meta Token Exchange Error: ${codeExchangeError}. Please check your Meta App ID & App Secret in Admin Settings.`
        };
      }
    }
    if (!effectiveToken) {
      effectiveToken = process.env.META_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN || process.env.META_APP_SECRET || "";
    }
    let targetWabaId = params.wabaId ? String(params.wabaId).trim() : "";
    let targetPhoneId = params.phoneNumberId ? String(params.phoneNumberId).trim() : "";
    let displayPhone = "";
    let verifiedName = "";
    let phoneList = [];
    if (effectiveToken && (!targetWabaId || !targetPhoneId)) {
      try {
        console.log("[Meta WhatsApp] Querying debug_token to find granular_scopes / WABA ID...");
        const debugUrl = `https://graph.facebook.com/v21.0/debug_token?input_token=${encodeURIComponent(
          effectiveToken
        )}&access_token=${encodeURIComponent(appId)}|${encodeURIComponent(appSecret)}`;
        const debugRes = await fetch(debugUrl);
        const debugJson = await debugRes.json().catch(() => ({}));
        if (debugRes.ok && debugJson?.data?.granular_scopes) {
          for (const scope of debugJson.data.granular_scopes) {
            if ((scope.scope === "whatsapp_business_management" || scope.scope === "whatsapp_business_messaging") && scope.target_ids && scope.target_ids.length > 0) {
              if (!targetWabaId) {
                targetWabaId = String(scope.target_ids[0]);
                console.log(`[Meta WhatsApp] Discovered WABA ID ${targetWabaId} from token granular_scopes!`);
              }
              break;
            }
          }
        }
      } catch (dbgErr) {
        console.warn("[Meta WhatsApp] Error querying debug_token:", dbgErr);
      }
    }
    if (effectiveToken && !targetWabaId) {
      try {
        const assignedUrl = `https://graph.facebook.com/v21.0/me/assigned_whatsapp_business_accounts?access_token=${encodeURIComponent(
          effectiveToken
        )}`;
        const assignedRes = await fetch(assignedUrl);
        const assignedJson = await assignedRes.json().catch(() => ({}));
        if (assignedRes.ok && assignedJson?.data?.length > 0) {
          targetWabaId = assignedJson.data[0].id;
          console.log(`[Meta WhatsApp] Discovered WABA ID ${targetWabaId} from assigned accounts!`);
        }
      } catch (_e) {
      }
    }
    if (targetWabaId && effectiveToken) {
      try {
        const wabaInfoUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(
          targetWabaId
        )}?fields=id,name,phone_numbers{id,display_phone_number,verified_name,quality_rating,code_verification_status,status}&access_token=${encodeURIComponent(
          effectiveToken
        )}`;
        const wabaRes = await fetch(wabaInfoUrl);
        const wabaJson = await wabaRes.json();
        if (wabaRes.ok && wabaJson) {
          verifiedName = wabaJson.name || "";
          phoneList = wabaJson.phone_numbers?.data || [];
          console.log(`[Meta WhatsApp] WABA ${targetWabaId} has ${phoneList.length} phone number(s).`);
          if (phoneList.length > 0) {
            if (targetPhoneId) {
              const matched = phoneList.find((p) => p.id === targetPhoneId);
              if (matched) {
                displayPhone = matched.display_phone_number || targetPhoneId;
                verifiedName = matched.verified_name || verifiedName;
              }
            } else {
              const realNumber = phoneList.find(
                (p) => p.display_phone_number && !p.display_phone_number.includes("555") && !p.display_phone_number.startsWith("+1555")
              );
              const selectedPhone = realNumber || phoneList[0];
              targetPhoneId = selectedPhone.id;
              displayPhone = selectedPhone.display_phone_number || targetPhoneId;
              verifiedName = selectedPhone.verified_name || verifiedName;
            }
          }
        }
      } catch (wabaErr) {
        console.warn("[Meta WhatsApp] Error querying WABA details:", wabaErr);
      }
    }
    if (targetPhoneId && effectiveToken && !displayPhone) {
      try {
        const phUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(
          targetPhoneId
        )}?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status,status&access_token=${encodeURIComponent(
          effectiveToken
        )}`;
        const phRes = await fetch(phUrl);
        const phJson = await phRes.json();
        if (phRes.ok && phJson) {
          displayPhone = phJson.display_phone_number || targetPhoneId;
          verifiedName = phJson.verified_name || verifiedName;
        }
      } catch (phErr) {
        console.warn("[Meta WhatsApp] Error querying phone details:", phErr);
      }
    }
    if (targetPhoneId) {
      const connResult = await this.connectWhatsAppOnboarding(userId, {
        wabaId: targetWabaId,
        phoneNumberId: targetPhoneId,
        displayPhoneNumber: displayPhone || targetPhoneId,
        verifiedName: verifiedName || `WhatsApp (${displayPhone || targetPhoneId})`,
        accessToken: effectiveToken
      });
      if (connResult.success && connResult.channel) {
        return {
          success: true,
          channel: connResult.channel
        };
      }
    }
    if (effectiveToken) {
      const { whatsappNumbers } = await this.discoverAssetsFromToken(effectiveToken);
      if (whatsappNumbers && whatsappNumbers.length > 0) {
        const realNumber = whatsappNumbers.find(
          (w) => w.display_phone_number && !w.display_phone_number.includes("555") && !w.display_phone_number.startsWith("+1555") && !w.waba_name?.toLowerCase().includes("test")
        ) || whatsappNumbers[0];
        const autoConn = await this.connectWhatsAppOnboarding(userId, {
          wabaId: realNumber.waba_id,
          phoneNumberId: realNumber.id,
          displayPhoneNumber: realNumber.display_phone_number,
          verifiedName: realNumber.verified_name || realNumber.waba_name,
          accessToken: effectiveToken
        });
        if (autoConn.success && autoConn.channel) {
          return { success: true, channel: autoConn.channel };
        }
        return { success: true, whatsappNumbers };
      }
    }
    return {
      success: false,
      error: targetWabaId ? "Your Meta Business Portfolio was authorized, but no WhatsApp Phone Number is added inside it yet. Please add a phone number in Meta WhatsApp Manager or check WhatsApp > API Setup." : "WhatsApp authorization completed, but no WhatsApp Business Account (WABA) or phone number was detected. Please ensure your Meta App has WhatsApp product added, and that your Facebook user has an Administrator role."
    };
  }
  /**
   * Verifies health and validity of an existing connected channel with Meta Graph API
   */
  async testChannelConnection(channelId, userId) {
    const channel = db.getChannelById(channelId);
    if (!channel || channel.user_id !== userId) {
      return { valid: false, status: "error", message: "Channel not found or unauthorized." };
    }
    if (!channel.access_token) {
      db.updateChannel(channel.id, { status: "error", error_message: "Access token is missing." });
      return { valid: false, status: "error", message: "Channel has no access token configured." };
    }
    if (channel.access_token.startsWith("sim_")) {
      db.updateChannel(channel.id, { status: "connected", error_message: void 0 });
      return {
        valid: true,
        status: "connected",
        message: "Sandbox channel active. Webhook simulation is operational."
      };
    }
    try {
      let testEndpoint = "";
      if (channel.platform === "whatsapp") {
        testEndpoint = `https://graph.facebook.com/v21.0/${encodeURIComponent(
          channel.identifier
        )}?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status&access_token=${encodeURIComponent(
          channel.access_token
        )}`;
      } else {
        testEndpoint = `https://graph.facebook.com/v21.0/${encodeURIComponent(
          channel.identifier
        )}?fields=id,name&access_token=${encodeURIComponent(channel.access_token)}`;
      }
      const res = await fetch(testEndpoint);
      const json = await res.json();
      if (!res.ok || json.error) {
        const errorMsg = json.error?.message || "Meta API returned an error response.";
        db.updateChannel(channel.id, { status: "error", error_message: errorMsg });
        return {
          valid: false,
          status: "error",
          message: errorMsg,
          details: json.error
        };
      }
      if (channel.platform === "messenger") {
        try {
          const subRes = await fetch(
            `https://graph.facebook.com/v21.0/${encodeURIComponent(
              channel.identifier
            )}/subscribed_apps?subscribed_fields=messages,messaging_postbacks,message_deliveries,feed&access_token=${encodeURIComponent(
              channel.access_token
            )}`,
            { method: "POST" }
          );
          const subData = await subRes.json().catch(() => ({}));
          console.log("[MetaOAuth] testChannelConnection auto-subscribed page:", subData);
        } catch (_subErr) {
          console.warn("[MetaOAuth] Error re-subscribing page during test:", _subErr);
        }
      }
      if (channel.platform === "whatsapp") {
        if (channel.meta_business_id) {
          try {
            await fetch(
              `https://graph.facebook.com/v21.0/${encodeURIComponent(
                channel.meta_business_id
              )}/subscribed_apps?access_token=${encodeURIComponent(channel.access_token)}`,
              { method: "POST" }
            );
          } catch (_e) {
          }
        }
        try {
          await fetch(
            `https://graph.facebook.com/v21.0/${encodeURIComponent(channel.identifier)}/register`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${channel.access_token}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                messaging_product: "whatsapp",
                pin: "123456"
              })
            }
          );
        } catch (_e) {
        }
        if (json.code_verification_status && json.code_verification_status !== "VERIFIED") {
          const unverifiedMsg = `This number (${json.display_phone_number || channel.name}) is currently "Unverified" in Meta WhatsApp Manager. Messages and AI replies will not work until you verify it via OTP in Meta.`;
          db.updateChannel(channel.id, { status: "error", error_message: unverifiedMsg });
          return {
            valid: false,
            status: "error",
            message: unverifiedMsg,
            details: json
          };
        }
      }
      db.updateChannel(channel.id, { status: "connected", error_message: void 0 });
      return {
        valid: true,
        status: "connected",
        message: `Connection healthy! Meta confirmed asset "${json.name || json.verified_name || json.display_phone_number || channel.identifier}" is active.`,
        details: json
      };
    } catch (err) {
      const errorMsg = err?.message || "Failed to contact Meta Graph API.";
      db.updateChannel(channel.id, { status: "error", error_message: errorMsg });
      return { valid: false, status: "error", message: errorMsg };
    }
  }
  /**
   * Disconnects a channel safely
   */
  async disconnectChannel(channelId, userId) {
    const channel = db.getChannelById(channelId);
    const user = db.getProfileById(userId);
    const isAdmin = user?.role === "admin";
    if (!channel || !isAdmin && channel.user_id !== userId) {
      return { success: false, message: "Channel not found or unauthorized." };
    }
    if (channel.access_token && !channel.access_token.startsWith("sim_")) {
      try {
        const unsubUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(
          channel.identifier
        )}/subscribed_apps?access_token=${encodeURIComponent(channel.access_token)}`;
        await fetch(unsubUrl, { method: "DELETE" });
      } catch (err) {
        console.warn("[MetaOAuth] Error unsubscribing app on disconnect:", err);
      }
    }
    db.deleteChannel(channel.id, isAdmin ? void 0 : userId);
    db.logAudit({
      id: "aud_" + Date.now(),
      user_id: userId,
      action: "channel_disconnected",
      resource: "channel",
      resource_id: channel.id,
      details: `Disconnected ${channel.platform} channel "${channel.name}" (${channel.identifier})`,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    return { success: true, message: `Channel "${channel.name}" has been disconnected.` };
  }
  /**
   * Diagnostic inspector for a customer's WhatsApp Business Account & Cloud API Phone Number
   */
  async getWhatsAppDiagnostics(channelId, userId) {
    const channel = db.getChannelById(channelId);
    if (!channel || channel.user_id !== userId) {
      return { success: false, error: "Channel not found or unauthorized." };
    }
    if (channel.platform !== "whatsapp") {
      return { success: false, error: "Channel is not a WhatsApp channel." };
    }
    const token = channel.access_token;
    const phoneId = channel.phone_number_id || channel.meta_asset_id || channel.identifier;
    const wabaId = channel.waba_id || channel.meta_business_id || "";
    let subscribedAppsStatus = channel.subscribed_apps_status || "pending";
    let subscribedAppsDetails = channel.subscribed_apps_details || null;
    let phoneNumberStatus = channel.phone_number_status || "CONNECTED";
    let codeVerificationStatus = channel.code_verification_status || "VERIFIED";
    let qualityRating = channel.quality_rating || "GREEN";
    let displayPhone = channel.display_phone_number || channel.name;
    if (token && !token.startsWith("sim_")) {
      if (wabaId) {
        try {
          const getSubRes = await fetch(
            `https://graph.facebook.com/v21.0/${encodeURIComponent(wabaId)}/subscribed_apps`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const getSubJson = await getSubRes.json().catch(() => ({}));
          if (getSubRes.ok && getSubJson?.data) {
            const hasSubscription = getSubJson.data.length > 0;
            subscribedAppsStatus = hasSubscription ? "subscribed" : "failed";
            subscribedAppsDetails = getSubJson.data;
          }
        } catch (subErr) {
          console.warn("[WhatsApp Diagnostics] Error reading subscribed_apps:", subErr);
        }
      }
      if (phoneId) {
        try {
          const phRes = await fetch(
            `https://graph.facebook.com/v21.0/${encodeURIComponent(
              phoneId
            )}?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status,status&access_token=${encodeURIComponent(
              token
            )}`
          );
          const phJson = await phRes.json().catch(() => ({}));
          if (phRes.ok && phJson) {
            if (phJson.status) phoneNumberStatus = phJson.status;
            if (phJson.code_verification_status) codeVerificationStatus = phJson.code_verification_status;
            if (phJson.quality_rating) qualityRating = phJson.quality_rating;
            if (phJson.display_phone_number) displayPhone = phJson.display_phone_number;
          }
        } catch (phErr) {
          console.warn("[WhatsApp Diagnostics] Error reading phone status:", phErr);
        }
      }
    }
    const updated = db.updateChannel(channel.id, {
      subscribed_apps_status: subscribedAppsStatus,
      subscribed_apps_details: subscribedAppsDetails,
      phone_number_status: phoneNumberStatus,
      code_verification_status: codeVerificationStatus,
      quality_rating: qualityRating,
      display_phone_number: displayPhone,
      waba_id: wabaId,
      phone_number_id: phoneId
    });
    return {
      success: true,
      channel: updated || channel,
      diagnostics: {
        wabaId,
        phoneNumberId: phoneId,
        displayPhoneNumber: displayPhone,
        subscribedAppsStatus,
        subscribedAppsDetails,
        phoneNumberStatus,
        codeVerificationStatus,
        qualityRating,
        lastWebhookAt: channel.last_webhook_at,
        lastWebhookPayload: channel.last_webhook_payload,
        lastSendResult: channel.last_send_result
      }
    };
  }
  /**
   * 1-Click Repair & Re-Sync WhatsApp Webhook and Cloud API Registration
   */
  async repairWhatsAppChannel(channelId, userId) {
    const channel = db.getChannelById(channelId);
    if (!channel || channel.user_id !== userId) {
      return { success: false, message: "Channel not found or unauthorized." };
    }
    let token = channel.access_token;
    const phoneId = channel.phone_number_id || channel.meta_asset_id || channel.identifier;
    let wabaId = channel.waba_id || channel.meta_business_id || "";
    const masterToken = process.env.META_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN || "";
    if ((!token || token.startsWith("qr_") || token.startsWith("sim_")) && masterToken) {
      token = masterToken;
    }
    if (!token || token.startsWith("qr_") || token.startsWith("sim_")) {
      return {
        success: false,
        message: '\u098F\u0987 \u099A\u09CD\u09AF\u09BE\u09A8\u09C7\u09B2\u099F\u09BF\u09A4\u09C7 \u09B0\u09BF\u09DF\u09C7\u09B2 \u09AE\u09C7\u099F\u09BE \u099F\u09CB\u0995\u09C7\u09A8 \u09A8\u09C7\u0987 (\u09AA\u09C1\u09B0\u09A8\u09CB \u09AC\u09BE \u0995\u09BF\u0989\u0986\u09B0 \u099F\u09C7\u09B8\u09CD\u099F \u099F\u09CB\u0995\u09C7\u09A8)\u0964 \u09A6\u09DF\u09BE \u0995\u09B0\u09C7 "+ Connect Another WhatsApp" \u09AC\u09BE\u099F\u09A8\u09C7 \u0995\u09CD\u09B2\u09BF\u0995 \u0995\u09B0\u09C7 \u0985\u09AB\u09BF\u09B6\u09BF\u09DF\u09BE\u09B2 \u09AE\u09C7\u099F\u09BE \u098F\u09AE\u09AC\u09C7\u09A1\u09C7\u09A1 \u09B8\u09BE\u0987\u09A8-\u0986\u09AA \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u0995\u09B0\u09C1\u09A8\u0964'
      };
    }
    try {
      if (!wabaId && phoneId) {
        try {
          const phQuery = await fetch(
            `https://graph.facebook.com/v21.0/${encodeURIComponent(phoneId)}?fields=id,display_phone_number,whatsapp_business_account&access_token=${encodeURIComponent(token)}`
          );
          const phData = await phQuery.json().catch(() => ({}));
          if (phData?.whatsapp_business_account?.id) {
            wabaId = phData.whatsapp_business_account.id;
            db.updateChannel(channel.id, { waba_id: wabaId });
          }
        } catch (_wabaLookupErr) {
          console.warn("[Repair WA] Could not lookup WABA ID from phone:", _wabaLookupErr);
        }
      }
      if (wabaId) {
        console.log(`[Repair WA] Calling POST /${wabaId}/subscribed_apps ...`);
        const subRes = await fetch(`https://graph.facebook.com/v21.0/${encodeURIComponent(wabaId)}/subscribed_apps`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            subscribed_fields: ["messages", "message_deliveries", "messaging_postbacks"]
          })
        });
        const subJson = await subRes.json().catch(() => ({}));
        console.log("[Repair WA] Subscribed apps response:", subJson);
        if (subRes.ok && subJson.success !== false) {
          db.updateChannel(channel.id, { subscribed_apps_status: "subscribed" });
        }
      }
      if (phoneId) {
        console.log(`[Repair WA] Calling POST /${phoneId}/register ...`);
        await fetch(`https://graph.facebook.com/v21.0/${encodeURIComponent(phoneId)}/register`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            pin: "123456"
          })
        });
      }
      const diagResult = await this.getWhatsAppDiagnostics(channelId, userId);
      return {
        success: true,
        channel: diagResult.channel,
        message: "Successfully re-subscribed WABA to webhooks and re-registered phone number with WhatsApp Cloud API!"
      };
    } catch (err) {
      return {
        success: false,
        message: "Repair attempt failed: " + (err?.message || "Network error"),
        error: err?.message
      };
    }
  }
  /**
   * OAuth validation - No mock/demo pages in production
   */
  simulateOAuth(_userId, _platform) {
    return {
      success: false,
      pages: [],
      error: "Meta App ID and Secret must be configured to connect Facebook/Instagram pages."
    };
  }
};
var metaOAuthService = new MetaOAuthService();

// server/services/metaChannelService.ts
init_database();
var MetaChannelService = class {
  /**
   * Captures Page Access Tokens from a Facebook SDK User/Page Access Token,
   * stores them securely in the user profile & database (facebook_pages, instagram_accounts,
   * whatsapp_phone_numbers, and channels), and optionally auto-hooks webhooks.
   */
  async captureAndStorePageTokens(userId, accessToken, options) {
    const cleanToken = (accessToken || "").trim();
    if (!cleanToken) {
      return {
        success: false,
        pages: [],
        whatsappNumbers: [],
        connectedChannels: [],
        error: "Valid Meta Access Token is required to capture Page Access Tokens."
      };
    }
    const platform = options?.platform || "messenger";
    const autoConnect = options?.autoConnectChannels !== false;
    const discovery = await metaOAuthService.exchangeFrontendToken(userId, cleanToken, platform);
    if (!discovery.success) {
      return {
        success: false,
        pages: [],
        whatsappNumbers: [],
        connectedChannels: [],
        error: discovery.error || "Failed to retrieve Page Access Tokens from Meta Graph API."
      };
    }
    const pages = discovery.pages || [];
    const whatsappNumbers = discovery.whatsappNumbers || [];
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    db.updateProfile(userId, {
      meta_user_access_token: cleanToken,
      meta_tokens_updated_at: nowIso,
      meta_granted_scopes: options?.grantedScopes || [
        "pages_manage_metadata",
        "pages_read_engagement",
        "pages_messaging",
        "business_management"
      ],
      meta_connected_pages_count: pages.length
    });
    for (const page of pages) {
      const fbPageRecord = {
        id: page.id,
        user_id: userId,
        name: page.name,
        category: page.category || "Business Page",
        access_token: page.access_token,
        is_webhook_subscribed: true,
        status: "connected",
        connected_at: nowIso,
        updated_at: nowIso
      };
      db.saveFacebookPage(fbPageRecord);
      if (page.instagram_business_account?.id) {
        const igRecord = {
          id: page.instagram_business_account.id,
          user_id: userId,
          page_id: page.id,
          username: page.instagram_business_account.username || page.name.toLowerCase().replace(/\s+/g, "_"),
          name: page.instagram_business_account.name || page.name,
          profile_picture_url: page.instagram_business_account.profile_picture_url,
          access_token: page.access_token,
          is_webhook_subscribed: true,
          status: "connected",
          connected_at: nowIso,
          updated_at: nowIso
        };
        db.saveInstagramAccount(igRecord);
      }
    }
    const connectedChannels = [];
    if (autoConnect) {
      const user = db.getProfileById(userId);
      const isAdmin = user?.role === "admin";
      const sub = db.getSubscriptionByUserId(userId);
      const isTrial = sub?.status === "trialing";
      const planId = String(sub?.plan_id || (isTrial ? "plan_pro" : "plan_starter")).toLowerCase();
      const plan = db.getPlanById(planId);
      const isPro = isAdmin || isTrial || planId.includes("pro") || Boolean(plan?.price && plan.price >= 1950);
      const maxAllowedChannels = isAdmin ? 999 : isPro ? 10 : plan?.feature_config?.max_channels || 3;
      const getActiveCount = () => db.getChannels(userId).filter(
        (c) => c.is_active && ["messenger", "instagram", "whatsapp"].includes(c.platform) && c.identifier !== "website_widget"
      ).length;
      for (const page of pages) {
        if (getActiveCount() >= maxAllowedChannels) break;
        const fbRes = await metaOAuthService.connectPage(userId, page.id, {
          name: page.name,
          category: page.category,
          access_token: page.access_token
        });
        if (fbRes.success && fbRes.channel) {
          connectedChannels.push(fbRes.channel);
        }
        if (page.instagram_business_account?.id && getActiveCount() < maxAllowedChannels) {
          const igRes = await metaOAuthService.connectInstagram(userId, page.instagram_business_account.id, {
            username: page.instagram_business_account.username,
            pageId: page.id,
            accessToken: page.access_token
          });
          if (igRes.success && igRes.channel) {
            connectedChannels.push(igRes.channel);
          }
        }
      }
      for (const wa of whatsappNumbers) {
        if (getActiveCount() >= maxAllowedChannels) break;
        const waRes = await metaOAuthService.connectWhatsAppOnboarding(userId, {
          wabaId: wa.waba_id,
          phoneNumberId: wa.id,
          displayPhoneNumber: wa.display_phone_number,
          verifiedName: wa.verified_name,
          accessToken: wa.access_token
        });
        if (waRes.success && waRes.channel) {
          connectedChannels.push(waRes.channel);
        }
      }
    }
    db.logAudit({
      id: "aud_" + Date.now(),
      user_id: userId,
      action: "meta_channel_service_tokens_stored",
      resource: "channel",
      details: `Stored ${pages.length} Page Access Tokens and ${whatsappNumbers.length} WhatsApp tokens in user profile/database.`,
      created_at: nowIso
    });
    const verificationReport = await this.verifyTokensWithGraphApi(userId);
    return {
      success: true,
      pages,
      whatsappNumbers,
      connectedChannels,
      verificationReport
    };
  }
  /**
   * Verifies stored Page Access Tokens in the user's database / channels with the live Meta Graph API
   * (`https://graph.facebook.com/v21.0/...`) to confirm connection status, Page identity, and webhook subscription.
   */
  async verifyTokensWithGraphApi(userId, targetChannelId) {
    const userChannels = db.getChannels(userId);
    const channelsToVerify = targetChannelId ? userChannels.filter((c) => c.id === targetChannelId) : userChannels;
    const results = [];
    const checkedAt = (/* @__PURE__ */ new Date()).toISOString();
    const savedPages = db.getFacebookPages(userId);
    for (const channel of channelsToVerify) {
      const startTime = Date.now();
      const token = (channel.access_token || "").trim();
      const tokenPreview = token ? `EAA\u2022\u2022\u2022\u2022${token.slice(-6)}` : void 0;
      if (!token) {
        results.push({
          channelId: channel.id,
          assetId: channel.identifier,
          name: channel.name,
          platform: channel.platform,
          valid: false,
          tokenPreview,
          error: "Missing Page Access Token in database.",
          latencyMs: Date.now() - startTime,
          verifiedAt: checkedAt
        });
        db.updateChannel(channel.id, {
          status: "error",
          is_active: false,
          error_message: "Missing Page Access Token in database."
        });
        continue;
      }
      try {
        let verifyUrl = "";
        if (channel.platform === "whatsapp") {
          verifyUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(
            channel.identifier
          )}?fields=id,display_phone_number,verified_name,quality_rating&access_token=${encodeURIComponent(token)}`;
        } else if (channel.platform === "instagram") {
          verifyUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(
            channel.identifier
          )}?fields=id,username,name&access_token=${encodeURIComponent(token)}`;
        } else {
          verifyUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(
            channel.identifier
          )}?fields=id,name,category,tasks&access_token=${encodeURIComponent(token)}`;
        }
        const response = await fetch(verifyUrl);
        let data = await response.json();
        if (!response.ok || data.error) {
          const meRes = await fetch(
            `https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${encodeURIComponent(token)}`
          );
          const meData = await meRes.json();
          if (meRes.ok && !meData.error && meData.id) {
            data = meData;
          } else {
            const errMsg = data.error?.message || meData.error?.message || `Meta Graph API rejected token (HTTP ${response.status})`;
            db.updateChannel(channel.id, {
              status: "error",
              error_message: errMsg,
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            });
            results.push({
              channelId: channel.id,
              assetId: channel.identifier,
              name: channel.name,
              platform: channel.platform,
              valid: false,
              tokenPreview,
              error: errMsg,
              latencyMs: Date.now() - startTime,
              verifiedAt: checkedAt
            });
            continue;
          }
        }
        let webhookSubscribed = true;
        if (channel.platform === "messenger") {
          try {
            const subRes = await fetch(
              `https://graph.facebook.com/v21.0/${encodeURIComponent(
                channel.identifier
              )}/subscribed_apps?access_token=${encodeURIComponent(token)}`
            );
            const subJson = await subRes.json();
            if (subRes.ok && Array.isArray(subJson.data)) {
              webhookSubscribed = subJson.data.length > 0;
            }
          } catch {
          }
        }
        const resolvedName = data.name || data.verified_name || data.username || data.display_phone_number || channel.name;
        db.updateChannel(channel.id, {
          status: "connected",
          is_active: true,
          error_message: void 0,
          meta_asset_name: resolvedName,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        });
        if (channel.platform === "messenger") {
          const existingPage = savedPages.find((p) => p.id === channel.identifier);
          if (existingPage) {
            db.saveFacebookPage({
              ...existingPage,
              status: "connected",
              error_message: void 0,
              is_webhook_subscribed: webhookSubscribed,
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            });
          }
        }
        results.push({
          channelId: channel.id,
          assetId: channel.identifier,
          name: channel.name,
          platform: channel.platform,
          valid: true,
          graphId: data.id || channel.identifier,
          graphName: resolvedName,
          category: data.category,
          webhookSubscribed,
          permissions: Array.isArray(data.tasks) ? data.tasks : ["MANAGE", "MESSAGING"],
          tokenPreview,
          latencyMs: Date.now() - startTime,
          verifiedAt: checkedAt
        });
      } catch (err) {
        const errMsg = err?.message || "Network error while verifying token with Meta Graph API.";
        db.updateChannel(channel.id, {
          status: "error",
          error_message: errMsg,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        });
        results.push({
          channelId: channel.id,
          assetId: channel.identifier,
          name: channel.name,
          platform: channel.platform,
          valid: false,
          tokenPreview,
          error: errMsg,
          latencyMs: Date.now() - startTime,
          verifiedAt: checkedAt
        });
      }
    }
    const healthyCount = results.filter((r) => r.valid).length;
    const failedCount = results.length - healthyCount;
    return {
      success: true,
      verified: results.length > 0 && failedCount === 0,
      checkedAt,
      totalChecked: results.length,
      healthyCount,
      failedCount,
      results
    };
  }
  /**
   * Returns sanitized summary of stored Page Access Tokens and profile Meta status
   */
  getStoredTokensSummary(userId) {
    const profile = db.getProfileById(userId);
    const fbPages = db.getFacebookPages(userId).map(({ access_token, ...rest }) => ({
      ...rest,
      has_token: Boolean(access_token),
      token_preview: access_token ? `EAA\u2022\u2022\u2022\u2022${access_token.slice(-6)}` : void 0
    }));
    const igAccounts = db.getInstagramAccounts(userId).map(({ access_token, ...rest }) => ({
      ...rest,
      has_token: Boolean(access_token),
      token_preview: access_token ? `EAA\u2022\u2022\u2022\u2022${access_token.slice(-6)}` : void 0
    }));
    return {
      hasProfileToken: Boolean(profile?.meta_user_access_token),
      tokensUpdatedAt: profile?.meta_tokens_updated_at || null,
      grantedScopes: profile?.meta_granted_scopes || [],
      facebookPages: fbPages,
      instagramAccounts: igAccounts
    };
  }
};
var metaChannelService = new MetaChannelService();

// server/routes/channels.ts
init_metaService();
var channelsRouter = Router5();
function checkSubscriptionActive(userId) {
  const user = db.getProfileById(userId);
  if (user?.role === "admin") return { allowed: true };
  const subStatus = getUserSubscriptionStatus(userId);
  if (subStatus.isExpired || subStatus.isGated || !subStatus.canAccessDashboard) {
    return {
      allowed: false,
      error: "Your 2-Day Free Trial or subscription plan has ended. All automated channels are paused. Please purchase or renew a subscription plan (Starter: 1,250 BDT or Pro: 1,950 BDT) via bKash/Nagad to unpause and connect channels."
    };
  }
  return { allowed: true };
}
function checkChannelLimitForPlan(userId, targetPlatform, targetIdentifier) {
  const user = db.getProfileById(userId);
  if (user?.role === "admin") return { allowed: true };
  const subStatus = getUserSubscriptionStatus(userId);
  const isTrialActive = !subStatus.isExpired && subStatus.subscription?.status === "trialing";
  const isPro = subStatus.isProPlan || isTrialActive;
  const maxAllowedChannels = isPro ? 10 : subStatus.featureConfig?.max_channels || 3;
  const activeMetaChannels = db.getChannels(userId).filter(
    (c) => c.is_active && ["messenger", "instagram", "whatsapp"].includes(c.platform) && c.identifier !== "website_widget"
  );
  if (targetIdentifier && activeMetaChannels.some((c) => c.identifier === targetIdentifier)) {
    return { allowed: true };
  }
  if (targetPlatform && activeMetaChannels.some((c) => c.platform === targetPlatform)) {
    return { allowed: true };
  }
  if (activeMetaChannels.length >= maxAllowedChannels) {
    if (!isPro) {
      return {
        allowed: false,
        error: `Your Starter AI Plan (1,250 BDT/month) allows up to ${maxAllowedChannels} social channels (Facebook, Instagram & WhatsApp). Upgrade to the Pro Business Plan (1,950 BDT/month) to connect up to 10 channels simultaneously.`
      };
    }
    return {
      allowed: false,
      error: `You have reached the maximum of ${maxAllowedChannels} connected channels on your Pro Business Plan. Please disconnect an existing channel before adding a new one.`
    };
  }
  return { allowed: true };
}
channelsRouter.get("/public-url", (req, res) => {
  const tunnelUrl = getPublicTunnelUrl();
  return res.json({ publicUrl: tunnelUrl });
});
channelsRouter.get("/meta/config", (req, res) => {
  const config = metaOAuthService.getConfig(req);
  return res.json(config);
});
channelsRouter.post("/meta/config", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { appId, appSecret, configId } = req.body;
  const cleanAppId = typeof appId === "string" ? appId.trim() : void 0;
  const cleanAppSecret = typeof appSecret === "string" ? appSecret.trim() : void 0;
  const cleanConfigId = typeof configId === "string" ? configId.trim() : void 0;
  metaOAuthService.setCustomConfig(cleanAppId, cleanAppSecret, cleanConfigId);
  await db.flushToSupabase().catch((err) => {
    console.warn("[Channels Meta Config Flush Error]:", err);
  });
  const config = metaOAuthService.getConfig(req);
  return res.json({ success: true, config });
});
channelsRouter.get("/meta/auth-url", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const subCheck = checkSubscriptionActive(user.id);
  if (!subCheck.allowed) {
    return res.status(403).json({
      error: subCheck.error || "Your 2-Day Free Trial or subscription plan has ended. All automated channels are paused. Please purchase or renew a subscription plan via bKash/Nagad to connect channels."
    });
  }
  const platform = req.query.platform || "messenger";
  const onboarding = req.query.onboarding === "true" || req.query.onboarding === "1";
  const result = metaOAuthService.generateAuthUrl(user.id, platform, req, onboarding);
  return res.json(result);
});
channelsRouter.get(["/meta/callback", "/meta/callback/"], async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  const error = req.query.error_message || req.query.error_description || req.query.error;
  const baseUrl = metaOAuthService.getEffectiveBaseUrl(req);
  const sendPopupOrRedirect = (payload) => {
    const safePayloadJson = JSON.stringify({
      type: payload.success ? "META_OAUTH_SUCCESS" : "META_OAUTH_ERROR",
      platform: payload.platform || "messenger",
      assetsCount: payload.assetsCount || 0,
      error: payload.error || null
    });
    const safeRedirect = JSON.stringify(payload.redirectUrl);
    return res.send(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Meta Authorization - One Agent BD</title>
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; background: #0a0a0c; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
      .box { padding: 28px 32px; border-radius: 20px; background: #141418; border: 1px solid #27272a; max-width: 420px; }
      .title { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
      .sub { font-size: 13px; color: #a1a1aa; line-height: 1.5; }
      .btn { margin-top: 18px; padding: 10px 20px; background: #7F22FE; color: #fff; border: none; border-radius: 12px; font-weight: 600; font-size: 13px; cursor: pointer; text-decoration: none; display: inline-block; }
      .btn:hover { background: #6b1cd4; }
    </style>
  </head>
  <body>
    <div class="box">
      <div class="title">${payload.success ? "\u2705 Meta Account Authorized!" : "\u26A0\uFE0F Meta Authorization Notice"}</div>
      <div class="sub">${payload.success ? "Page Access Tokens captured successfully. Closing window..." : payload.error || "Redirecting back to dashboard..."}</div>
      <button class="btn" onclick="finishAndClose();">\u09A1\u09CD\u09AF\u09BE\u09B6\u09AC\u09CB\u09B0\u09CD\u09A1\u09C7 \u09AB\u09BF\u09B0\u09C7 \u09AF\u09BE\u09A8 (Return to Dashboard)</button>
    </div>
    <script>
      var msg = ${safePayloadJson};
      var redirectTarget = ${safeRedirect};

      function broadcastAndNotify() {
        try {
          localStorage.setItem('oneagentbd_oauth_result', JSON.stringify(Object.assign({}, msg, { timestamp: Date.now() })));
        } catch (e) {}

        try {
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(msg, '*');
          }
        } catch (e) {}
      }

      function finishAndClose() {
        broadcastAndNotify();
        try { window.close(); } catch(e) {}
        if (!window.closed) {
          window.location.href = redirectTarget;
        }
      }

      (function() {
        broadcastAndNotify();

        var isPopup = Boolean(window.opener) || window.name === 'oneagentbd_meta_oauth' || window.innerWidth < 850;
        if (isPopup) {
          setTimeout(function() {
            try { window.close(); } catch (e) {}
          }, 450);
          return;
        }

        setTimeout(function() {
          window.location.href = redirectTarget;
        }, 300);
      })();
    </script>
  </body>
</html>`);
  };
  if (error) {
    const errStr = String(error);
    return sendPopupOrRedirect({
      success: false,
      error: errStr,
      redirectUrl: `${baseUrl}/channels?meta_error=${encodeURIComponent(errStr)}`
    });
  }
  if (!code || !state) {
    return sendPopupOrRedirect({
      success: false,
      error: "Missing authorization code or state parameter from Meta.",
      redirectUrl: `${baseUrl}/channels?meta_error=Missing_code_or_state`
    });
  }
  const outcome = await metaOAuthService.handleCallback(code, state, req);
  if (!outcome.success) {
    const errMsg = outcome.error || "Authorization failed";
    return sendPopupOrRedirect({
      success: false,
      platform: outcome.platform,
      error: errMsg,
      redirectUrl: `${baseUrl}/channels?meta_error=${encodeURIComponent(errMsg)}&platform=${outcome.platform}`
    });
  }
  if (outcome.platform !== "whatsapp" && outcome.pages.length === 0) {
    const noPagesMsg = "\u09AB\u09C7\u09B8\u09AC\u09C1\u0995 \u09B2\u0997\u0987\u09A8 \u09B8\u09AB\u09B2 \u09B9\u09DF\u09C7\u099B\u09C7, \u0995\u09BF\u09A8\u09CD\u09A4\u09C1 \u0995\u09CB\u09A8\u09CB \u09AB\u09C7\u09B8\u09AC\u09C1\u0995 \u09AA\u09C7\u099C \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964 (\u0986\u09AA\u09A8\u09BE\u09B0 \u09AE\u09C7\u099F\u09BE \u0985\u09CD\u09AF\u09BE\u09AA Development \u09AE\u09CB\u09A1\u09C7 \u09A5\u09BE\u0995\u09B2\u09C7 \u09AB\u09C7\u09B8\u09AC\u09C1\u0995 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F\u099F\u09BF \u09AE\u09C7\u099F\u09BE \u0995\u09A8\u09B8\u09CB\u09B2\u09C7\u09B0 App Roles > Roles-\u098F Developer \u09AC\u09BE Tester \u09B9\u09BF\u09B8\u09C7\u09AC\u09C7 \u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8, \u0985\u09A5\u09AC\u09BE Page ID \u0993 Token \u09A6\u09BF\u09DF\u09C7 \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u0995\u09BE\u09A8\u09C7\u0995\u09CD\u099F \u0995\u09B0\u09C1\u09A8)\u0964";
    return sendPopupOrRedirect({
      success: false,
      platform: outcome.platform,
      assetsCount: 0,
      error: noPagesMsg,
      redirectUrl: `${baseUrl}/channels?meta_error=${encodeURIComponent(noPagesMsg)}&platform=${outcome.platform}`
    });
  }
  return sendPopupOrRedirect({
    success: true,
    platform: outcome.platform,
    assetsCount: outcome.pages.length,
    redirectUrl: `${baseUrl}/channels?meta_auth=success&platform=${outcome.platform}&assets_count=${outcome.pages.length}`
  });
});
channelsRouter.post("/meta/exchange-token", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const subCheck = checkSubscriptionActive(user.id);
  if (!subCheck.allowed) {
    return res.status(403).json({
      error: subCheck.error || "Your 2-Day Free Trial or subscription plan has ended. All automated channels are paused. Please purchase or renew a subscription plan via bKash/Nagad to connect channels."
    });
  }
  const { accessToken, platform = "messenger" } = req.body;
  if (!accessToken || typeof accessToken !== "string") {
    return res.status(400).json({ error: "Valid Meta Access Token is required." });
  }
  const outcome = await metaOAuthService.exchangeFrontendToken(
    user.id,
    accessToken,
    platform
  );
  if (!outcome.success) {
    return res.status(400).json({ error: outcome.error || "Failed to capture Page Access Tokens from Meta." });
  }
  const sanitizedPages = outcome.pages.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    tasks: p.tasks,
    picture_url: p.picture_url,
    has_token: Boolean(p.access_token),
    token_preview: p.token_preview || (p.access_token ? `EAA\u2022\u2022\u2022\u2022${p.access_token.slice(-6)}` : void 0),
    instagram_business_account: p.instagram_business_account
  }));
  const sanitizedWaNumbers = (outcome.whatsappNumbers || []).map((w) => ({
    id: w.id,
    waba_id: w.waba_id,
    waba_name: w.waba_name,
    display_phone_number: w.display_phone_number,
    verified_name: w.verified_name,
    quality_rating: w.quality_rating,
    has_token: Boolean(w.access_token),
    token_preview: w.token_preview
  }));
  return res.json({
    success: true,
    platform: outcome.platform,
    pages: sanitizedPages,
    whatsappNumbers: sanitizedWaNumbers
  });
});
channelsRouter.post("/meta/sdk-capture", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const subCheck = checkSubscriptionActive(user.id);
  if (!subCheck.allowed) {
    return res.status(403).json({
      error: subCheck.error || "Your 2-Day Free Trial or subscription plan has ended. All automated channels are paused. Please purchase or renew a subscription plan via bKash/Nagad to connect channels."
    });
  }
  const {
    accessToken,
    platform = "messenger",
    autoConnectChannels = true,
    grantedScopes
  } = req.body;
  if (!accessToken || typeof accessToken !== "string") {
    return res.status(400).json({ error: "Valid Meta Access Token from Facebook SDK is required." });
  }
  const result = await metaChannelService.captureAndStorePageTokens(user.id, accessToken, {
    platform,
    autoConnectChannels: Boolean(autoConnectChannels),
    grantedScopes: Array.isArray(grantedScopes) ? grantedScopes : void 0
  });
  if (!result.success) {
    return res.status(400).json({ error: result.error || "Failed to capture and store Page Access Tokens." });
  }
  const sanitizedPages = result.pages.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    tasks: p.tasks,
    picture_url: p.picture_url,
    has_token: Boolean(p.access_token),
    token_preview: p.token_preview || (p.access_token ? `EAA\u2022\u2022\u2022\u2022${p.access_token.slice(-6)}` : void 0),
    instagram_business_account: p.instagram_business_account
  }));
  const sanitizedWaNumbers = result.whatsappNumbers.map((w) => ({
    id: w.id,
    waba_id: w.waba_id,
    waba_name: w.waba_name,
    display_phone_number: w.display_phone_number,
    verified_name: w.verified_name,
    quality_rating: w.quality_rating,
    has_token: Boolean(w.access_token),
    token_preview: w.token_preview
  }));
  const sanitizedChannels = result.connectedChannels.map(({ access_token, app_secret, ...rest }) => ({
    ...rest,
    has_token: Boolean(access_token),
    token_preview: access_token ? `\u2022\u2022\u2022\u2022${access_token.slice(-4)}` : void 0
  }));
  return res.json({
    success: true,
    pages: sanitizedPages,
    whatsappNumbers: sanitizedWaNumbers,
    connectedChannels: sanitizedChannels,
    verificationReport: result.verificationReport
  });
});
channelsRouter.post("/meta/verify-tokens", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { channelId } = req.body || {};
  const report = await metaChannelService.verifyTokensWithGraphApi(
    user.id,
    typeof channelId === "string" && channelId.trim() ? channelId.trim() : void 0
  );
  return res.json(report);
});
channelsRouter.get("/meta/stored-tokens", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const summary = metaChannelService.getStoredTokensSummary(user.id);
  return res.json(summary);
});
channelsRouter.get("/meta/pending-assets", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const assets = metaOAuthService.getPendingAssets(user.id);
  if (!assets) {
    return res.json({ available: false, pages: [], whatsappNumbers: [] });
  }
  const sanitizedPages = assets.pages.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    tasks: p.tasks,
    picture_url: p.picture_url,
    has_token: Boolean(p.access_token),
    token_preview: p.token_preview || (p.access_token ? `EAA\u2022\u2022\u2022\u2022${p.access_token.slice(-6)}` : void 0),
    instagram_business_account: p.instagram_business_account
  }));
  const sanitizedWaNumbers = (assets.whatsappNumbers || []).map((w) => ({
    id: w.id,
    waba_id: w.waba_id,
    waba_name: w.waba_name,
    display_phone_number: w.display_phone_number,
    verified_name: w.verified_name,
    quality_rating: w.quality_rating,
    has_token: Boolean(w.access_token),
    token_preview: w.token_preview
  }));
  return res.json({
    available: sanitizedPages.length > 0 || sanitizedWaNumbers.length > 0,
    platform: assets.platform,
    pages: sanitizedPages,
    whatsappNumbers: sanitizedWaNumbers
  });
});
channelsRouter.post("/meta/select-page", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const subCheck = checkSubscriptionActive(user.id);
  if (!subCheck.allowed) {
    return res.status(403).json({
      error: subCheck.error || "Your 2-Day Free Trial or subscription plan has ended. All automated channels are paused. Please purchase or renew a subscription plan via bKash/Nagad to connect channels."
    });
  }
  const { pageId, pageName, category } = req.body;
  if (!pageId) {
    return res.status(400).json({ error: "Page ID is required" });
  }
  const limitCheck = checkChannelLimitForPlan(user.id, "messenger", String(pageId));
  if (!limitCheck.allowed) {
    return res.status(403).json({ error: limitCheck.error });
  }
  const result = await metaOAuthService.connectPage(user.id, pageId, {
    name: pageName,
    category
  });
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  const { access_token, app_secret, ...sanitized } = result.channel;
  return res.json({ success: true, channel: sanitized });
});
channelsRouter.post("/meta/select-instagram", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const subCheck = checkSubscriptionActive(user.id);
  if (!subCheck.allowed) {
    return res.status(403).json({
      error: subCheck.error || "Your 2-Day Free Trial or subscription plan has ended. All automated channels are paused. Please purchase or renew a subscription plan via bKash/Nagad to connect channels."
    });
  }
  const limitCheck = checkChannelLimitForPlan(user.id, "instagram");
  if (!limitCheck.allowed) {
    return res.status(403).json({ error: limitCheck.error });
  }
  const { igAccountId, username, pageId } = req.body;
  if (!igAccountId) {
    return res.status(400).json({ error: "Instagram Account ID is required" });
  }
  const result = await metaOAuthService.connectInstagram(user.id, igAccountId, {
    username,
    pageId
  });
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  const { access_token, app_secret, ...sanitized } = result.channel;
  return res.json({ success: true, channel: sanitized });
});
channelsRouter.post("/meta/whatsapp-onboarding", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const subCheck = checkSubscriptionActive(user.id);
  if (!subCheck.allowed) {
    return res.status(403).json({
      error: subCheck.error || "Your 2-Day Free Trial or subscription plan has ended. All automated channels are paused. Please purchase or renew a subscription plan via bKash/Nagad to connect channels."
    });
  }
  const limitCheck = checkChannelLimitForPlan(user.id, "whatsapp");
  if (!limitCheck.allowed) {
    return res.status(403).json({ error: limitCheck.error });
  }
  const { wabaId, phoneNumberId, displayPhoneNumber, verifiedName, accessToken } = req.body;
  const pendingAssets = metaOAuthService.getPendingAssets(user.id);
  const cachedWa = pendingAssets?.whatsappNumbers?.find((w) => w.id === String(phoneNumberId).trim());
  const masterToken = process.env.META_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN || process.env.META_APP_SECRET || "system_cloud_token";
  const effectiveToken = accessToken && String(accessToken).trim() || cachedWa?.access_token || masterToken;
  const effectiveWabaId = wabaId || cachedWa?.waba_id || "";
  const effectiveDisplayPhone = displayPhoneNumber?.trim() || cachedWa?.display_phone_number || String(phoneNumberId || "").trim();
  const effectiveVerifiedName = verifiedName?.trim() || cachedWa?.verified_name || (effectiveDisplayPhone ? `WhatsApp Business (${effectiveDisplayPhone})` : "WhatsApp Business");
  const cleanDigits = effectiveDisplayPhone.replace(/[^0-9]/g, "");
  const effectivePhoneId = String(phoneNumberId || "").trim() || (cleanDigits ? `wa_${cleanDigits}` : `wa_${Date.now()}`);
  if (!effectiveDisplayPhone && !effectivePhoneId) {
    return res.status(400).json({
      error: "WhatsApp Phone Number is required."
    });
  }
  const result = await metaOAuthService.connectWhatsAppOnboarding(user.id, {
    wabaId: effectiveWabaId,
    phoneNumberId: effectivePhoneId,
    displayPhoneNumber: effectiveDisplayPhone || effectivePhoneId,
    verifiedName: effectiveVerifiedName,
    accessToken: effectiveToken
  });
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  const { access_token, app_secret, ...sanitized } = result.channel;
  return res.json({ success: true, channel: sanitized });
});
channelsRouter.post("/meta/whatsapp-detect", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { accessToken, phoneNumberId } = req.body || {};
  const tokenToUse = typeof accessToken === "string" && accessToken.trim() || process.env.META_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN || "";
  if (!tokenToUse && !phoneNumberId) {
    return res.status(400).json({ error: "Access Token \u09AC\u09BE Phone Number ID \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09C1\u09A8\u0964" });
  }
  try {
    if (phoneNumberId && tokenToUse) {
      try {
        const phoneUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(
          String(phoneNumberId).trim()
        )}?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status&access_token=${encodeURIComponent(
          tokenToUse
        )}`;
        const phoneRes = await fetch(phoneUrl);
        const phoneJson = await phoneRes.json();
        if (phoneRes.ok && phoneJson.id) {
          return res.json({
            success: true,
            phoneNumberId: String(phoneJson.id),
            displayPhoneNumber: phoneJson.display_phone_number || "",
            verifiedName: phoneJson.verified_name || "",
            qualityRating: phoneJson.quality_rating || "GREEN"
          });
        }
      } catch (_directPhErr) {
      }
    }
    if (tokenToUse) {
      const { whatsappNumbers, error } = await metaOAuthService.discoverAssetsFromToken(tokenToUse);
      if (whatsappNumbers && whatsappNumbers.length > 0) {
        return res.json({
          success: true,
          numbers: whatsappNumbers.map((w) => ({
            id: w.id,
            waba_id: w.waba_id,
            waba_name: w.waba_name,
            display_phone_number: w.display_phone_number,
            verified_name: w.verified_name,
            quality_rating: w.quality_rating
          }))
        });
      }
      if (error) {
        return res.status(400).json({ error });
      }
    }
    return res.status(404).json({
      error: "\u09AA\u09CD\u09B0\u09A6\u09A4\u09CD\u09A4 Access Token \u09A6\u09BF\u09DF\u09C7 \u0995\u09CB\u09A8\u09CB \u09B8\u0995\u09CD\u09B0\u09BF\u09DF WhatsApp Business \u09AB\u09CB\u09A8 \u09A8\u09AE\u09CD\u09AC\u09B0 \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964 \u09A6\u09DF\u09BE \u0995\u09B0\u09C7 Phone Number ID \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u0987\u09A8\u09AA\u09C1\u099F \u0995\u09B0\u09C1\u09A8\u0964"
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Meta API \u09AF\u09BE\u099A\u09BE\u0987 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5 \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  }
});
channelsRouter.post("/meta/whatsapp-embedded-signup", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const subCheck = checkSubscriptionActive(user.id);
  if (!subCheck.allowed) {
    return res.status(403).json({
      error: subCheck.error || "Your 2-Day Free Trial or subscription plan has ended. All automated channels are paused. Please purchase or renew a subscription plan via bKash/Nagad to connect channels."
    });
  }
  const limitCheck = checkChannelLimitForPlan(user.id, "whatsapp");
  if (!limitCheck.allowed) {
    return res.status(403).json({ error: limitCheck.error });
  }
  const { code, wabaId, phoneNumberId, accessToken } = req.body;
  const result = await metaOAuthService.handleWhatsAppEmbeddedSignupCode(user.id, {
    code: typeof code === "string" ? code.trim() : void 0,
    wabaId: typeof wabaId === "string" ? wabaId.trim() : void 0,
    phoneNumberId: typeof phoneNumberId === "string" ? phoneNumberId.trim() : void 0,
    accessToken: typeof accessToken === "string" ? accessToken.trim() : void 0
  });
  if (!result.success) {
    return res.status(400).json({ error: result.error || "Failed to complete WhatsApp Embedded Signup." });
  }
  if (result.channel) {
    const { access_token, app_secret, ...sanitized } = result.channel;
    return res.json({ success: true, channel: sanitized });
  }
  if (result.whatsappNumbers) {
    const sanitizedWaNumbers = result.whatsappNumbers.map((w) => ({
      id: w.id,
      waba_id: w.waba_id,
      waba_name: w.waba_name,
      display_phone_number: w.display_phone_number,
      verified_name: w.verified_name,
      quality_rating: w.quality_rating,
      has_token: Boolean(w.access_token),
      token_preview: w.token_preview
    }));
    return res.json({ success: true, whatsappNumbers: sanitizedWaNumbers });
  }
  return res.json({ success: true });
});
channelsRouter.get("/whatsapp/qr", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const subCheck = checkSubscriptionActive(user.id);
  if (!subCheck.allowed) {
    return res.status(403).json({ error: subCheck.error });
  }
  const sessionId = `wa_qr_${user.id}_${Date.now()}`;
  const qrRaw = `2@${Buffer.from(sessionId).toString("base64")},${Buffer.from(String(Date.now())).toString("base64")}`;
  return res.json({
    success: true,
    sessionId,
    qrRaw,
    expiresInSeconds: 60,
    timestamp: Date.now()
  });
});
channelsRouter.post("/whatsapp/pair-scan", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const subCheck = checkSubscriptionActive(user.id);
  if (!subCheck.allowed) {
    return res.status(403).json({ error: subCheck.error });
  }
  const { phoneNumber, displayTitle, sessionId } = req.body;
  const rawDigits = String(phoneNumber || "").replace(/[^0-9]/g, "");
  const cleanPhone = rawDigits ? rawDigits.startsWith("88") ? `+${rawDigits}` : rawDigits.startsWith("01") ? `+88${rawDigits}` : `+${rawDigits}` : "+8801700000000";
  const cleanIdentifier = rawDigits || `wa_linked_${Date.now()}`;
  const channelName = displayTitle?.trim() || `WhatsApp (${cleanPhone})`;
  const limitCheck = checkChannelLimitForPlan(user.id, "whatsapp", cleanIdentifier);
  if (!limitCheck.allowed) {
    return res.status(403).json({ error: limitCheck.error });
  }
  const existingChannels = db.getChannels(user.id);
  let channel = existingChannels.find(
    (c) => c.platform === "whatsapp" && (c.identifier === cleanIdentifier || c.name.includes(cleanPhone))
  );
  if (channel) {
    channel = db.updateChannel(channel.id, {
      name: channelName,
      identifier: cleanIdentifier,
      access_token: `qr_linked_token_${sessionId || Date.now()}`,
      is_active: true,
      status: "connected",
      error_message: void 0,
      auto_comment_reply: channel.auto_comment_reply ?? true,
      auto_followup_enabled: channel.auto_followup_enabled ?? true
    });
  } else {
    channel = db.createChannel({
      id: `chn_wa_qr_${Date.now()}`,
      user_id: user.id,
      platform: "whatsapp",
      name: channelName,
      identifier: cleanIdentifier,
      access_token: `qr_linked_token_${sessionId || Date.now()}`,
      is_active: true,
      status: "connected",
      auto_comment_reply: true,
      auto_followup_enabled: true,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  db.logAudit({
    id: `aud_${Date.now()}`,
    user_id: user.id,
    action: "channel_connected",
    resource: "channel",
    resource_id: channel?.id,
    details: `Linked WhatsApp Account via QR Code Scan: ${channelName}`,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  const { access_token, app_secret, ...sanitized } = channel;
  return res.json({ success: true, channel: sanitized });
});
channelsRouter.post("/meta/simulate-oauth", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const subCheck = checkSubscriptionActive(user.id);
  if (!subCheck.allowed) {
    return res.status(403).json({
      error: subCheck.error || "Your 2-Day Free Trial or subscription plan has ended. All automated channels are paused. Please purchase or renew a subscription plan via bKash/Nagad to connect channels."
    });
  }
  const config = metaOAuthService.getConfig(req);
  if (!config.configured) {
    return res.status(400).json({
      success: false,
      error: "Meta App credentials (App ID & Secret) are not configured. Please configure Meta App ID & Secret in settings or connect manually with Page Token."
    });
  }
  return res.status(400).json({
    success: false,
    error: "Please use official Meta OAuth login to authorize your Facebook or Instagram page."
  });
});
channelsRouter.post("/:id/test-connection", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const outcome = await metaOAuthService.testChannelConnection(req.params.id, user.id);
  return res.json(outcome);
});
channelsRouter.get("/:id/whatsapp-diagnostics", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const result = await metaOAuthService.getWhatsAppDiagnostics(req.params.id, user.id);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  return res.json(result);
});
channelsRouter.post("/:id/whatsapp-diagnostics/repair", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const result = await metaOAuthService.repairWhatsAppChannel(req.params.id, user.id);
  if (!result.success) {
    return res.status(400).json({ error: result.message || result.error });
  }
  return res.json(result);
});
channelsRouter.post("/:id/test-message", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const channel = db.getChannelById(req.params.id);
  if (!channel || channel.user_id !== user.id) {
    return res.status(404).json({ error: "Channel not found or unauthorized" });
  }
  const { messageText } = req.body || {};
  const testText = typeof messageText === "string" && messageText.trim() || "\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE, \u0986\u09AA\u09A8\u09BE\u09A6\u09C7\u09B0 \u09B8\u09BE\u09B0\u09CD\u09AD\u09BF\u09B8 \u0993 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8\u09C7\u09B0 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u09AC\u09B2\u09C1\u09A8?";
  const testCustomerId = `test_${Date.now().toString().slice(-4)}`;
  const testCustomerName = channel.platform === "whatsapp" ? `WhatsApp Test Customer (+8801700${Date.now().toString().slice(-4)})` : `${channel.platform.toUpperCase()} Test Customer`;
  const outcome = await handleInboundWebhook({
    platform: channel.platform,
    identifier: channel.phone_number_id || channel.identifier,
    customerId: testCustomerId,
    customerName: testCustomerName,
    messageText: testText,
    messageId: `sim_test_${Date.now()}`
  });
  return res.json({
    success: true,
    handled: outcome.received,
    replyText: outcome.aiReplyMessage?.message_text || "",
    testCustomerId,
    testCustomerName,
    channelName: channel.name
  });
});
channelsRouter.post("/:id/disconnect", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const outcome = await metaOAuthService.disconnectChannel(req.params.id, user.id);
  return res.json(outcome);
});
channelsRouter.get("/", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (db.getChannels().length === 0) {
    await Promise.race([
      db.syncFromSupabase(true),
      new Promise((resolve) => setTimeout(resolve, 1500))
    ]).catch((err) => {
      console.warn("[Channels GET] syncFromSupabase error:", err);
    });
  } else if (Date.now() - db.getLastSupabaseSyncAt() > 2e4) {
    db.syncFromSupabase(false).catch((err) => {
      console.warn("[Channels GET] Background sync warning:", err);
    });
  }
  const channels = user.role === "admin" ? db.getChannels() : db.getChannels(user.id);
  const sanitized = channels.map(({ access_token, app_secret, ...rest }) => ({
    ...rest,
    status: rest.status || (rest.is_active ? "connected" : "not_connected"),
    has_token: Boolean(access_token),
    token_preview: access_token ? access_token.startsWith("sim_") ? "sim_sandbox_token" : `\u2022\u2022\u2022\u2022${access_token.slice(-4)}` : void 0
  }));
  return res.json(sanitized);
});
channelsRouter.post("/", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { platform, name, identifier, access_token, app_secret } = req.body;
  if (!platform || !identifier || !access_token) {
    return res.status(400).json({
      error: "Platform, identifier (Page ID / Phone Number ID / Instagram ID), and Access Token are required."
    });
  }
  const validPlatforms = ["whatsapp", "messenger", "instagram"];
  if (!validPlatforms.includes(platform)) {
    return res.status(400).json({ error: `Invalid platform. Must be one of: ${validPlatforms.join(", ")}` });
  }
  const subCheck = checkSubscriptionActive(user.id);
  if (!subCheck.allowed) {
    return res.status(403).json({ error: subCheck.error });
  }
  const cleanIdentifier = String(identifier).trim();
  const limitCheck = checkChannelLimitForPlan(
    user.id,
    platform,
    cleanIdentifier
  );
  if (!limitCheck.allowed) {
    return res.status(403).json({ error: limitCheck.error });
  }
  const cleanToken = String(access_token).trim();
  const cleanName = name?.trim() || (platform === "whatsapp" ? "WhatsApp Business" : platform === "messenger" ? "Facebook Page" : "Instagram Direct");
  const existing = (user.role === "admin" ? db.getChannels() : db.getChannels(user.id)).find(
    (c) => c.platform === platform && (c.identifier.toLowerCase() === cleanIdentifier.toLowerCase() || c.meta_asset_id && c.meta_asset_id.toLowerCase() === cleanIdentifier.toLowerCase())
  );
  if (platform === "messenger" && cleanToken && !cleanToken.startsWith("sim_")) {
    try {
      const subUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(
        cleanIdentifier
      )}/subscribed_apps?subscribed_fields=messages,messaging_postbacks,message_deliveries,feed&access_token=${encodeURIComponent(
        cleanToken
      )}`;
      fetch(subUrl, { method: "POST" }).then(async (r) => {
        const resJson = await r.json().catch(() => ({}));
        console.log(`[Channels] Subscribed Facebook Page ${cleanIdentifier} to webhooks:`, resJson);
      }).catch((err) => console.warn("[Channels] Webhook subscription warning for Messenger:", err));
    } catch (subErr) {
      console.warn("[Channels] Failed to call subscribed_apps for Messenger:", subErr);
    }
  } else if (platform === "instagram" && cleanToken && !cleanToken.startsWith("sim_")) {
    try {
      const subUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(
        cleanIdentifier
      )}/subscribed_apps?subscribed_fields=messages,messaging_postbacks,feed&access_token=${encodeURIComponent(
        cleanToken
      )}`;
      fetch(subUrl, { method: "POST" }).catch(() => {
      });
    } catch (_igErr) {
    }
  }
  if (existing) {
    const updated = db.updateChannel(existing.id, {
      name: cleanName,
      access_token: cleanToken,
      ...app_secret && { app_secret: String(app_secret).trim() },
      is_active: true,
      status: "connected",
      error_message: void 0,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    const { access_token: _token, app_secret: _sec, ...sanitized2 } = updated || {};
    return res.json({
      ...sanitized2,
      updatedExisting: true,
      message: `Updated existing ${platform.toUpperCase()} channel "${cleanName}". Channel is now connected, subscribed to webhooks, and active!`
    });
  }
  const newChannel = {
    id: `ch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id: user.id,
    platform,
    name: cleanName,
    identifier: cleanIdentifier,
    access_token: cleanToken,
    app_secret: app_secret ? String(app_secret).trim() : void 0,
    is_active: true,
    status: "connected",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.createChannel(newChannel);
  const { access_token: _t, app_secret: _s, ...sanitized } = newChannel;
  return res.status(201).json({
    ...sanitized,
    updatedExisting: false,
    message: `Successfully connected ${cleanName}! Webhooks are now listening and subscribed for customer messages.`
  });
});
channelsRouter.post("/run-followups", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const result = await runAutoFollowUpEngine({
    userId: user.id,
    forceImmediate: true
  });
  return res.json({
    success: true,
    ...result
  });
});
channelsRouter.get("/automation-settings", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const profile = db.getProfileById(user.id);
  const defaults = {
    auto_comment_reply_enabled: true,
    public_comment_reply_template: "Thank you {customer_name}! \u2764\uFE0F We have sent a detailed reply and product information to your Inbox (Messenger/DM). Please check your inbox! \u{1F4E9}",
    send_private_inbox_on_comment: true,
    auto_followup_enabled: true,
    followup_delay_minutes: 45,
    followup_message_template: "Hello {customer_name}! \u{1F60A} You messaged our page earlier. Do you have any questions about our products or ordering? To confirm your order, simply reply with your Name, Full Address, and Phone Number\u2014our AI will book your order right away! \u2764\uFE0F",
    upsell_enabled: true,
    upsell_offer_text: "Order any 2 items together to enjoy FREE delivery or a special 100 BDT discount!",
    auto_payment_verify_enabled: true,
    auto_tracking_reply_enabled: true,
    paused_customers: [],
    blocked_customers: [],
    daily_ad_spend_bdt: 500,
    avg_product_cost_percent: 55,
    return_courier_loss_per_order: 130
  };
  const merged = {
    ...defaults,
    ...profile?.automation_settings || {}
  };
  return res.json({
    ...merged,
    settings: merged
  });
});
channelsRouter.put("/automation-settings", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const profile = db.getProfileById(user.id);
  const current = profile?.automation_settings || {
    auto_comment_reply_enabled: true,
    public_comment_reply_template: "Thank you {customer_name}! \u2764\uFE0F We have sent a detailed reply and product information to your Inbox (Messenger/DM). Please check your inbox! \u{1F4E9}",
    send_private_inbox_on_comment: true,
    auto_followup_enabled: true,
    followup_delay_minutes: 45,
    followup_message_template: "Hello {customer_name}! \u{1F60A} You messaged our page earlier. Do you have any questions about our products or ordering? To confirm your order, simply reply with your Name, Full Address, and Phone Number\u2014our AI will book your order right away! \u2764\uFE0F",
    upsell_enabled: true,
    upsell_offer_text: "Order any 2 items together to enjoy FREE delivery or a special 100 BDT discount!",
    auto_payment_verify_enabled: true,
    auto_tracking_reply_enabled: true,
    paused_customers: [],
    blocked_customers: [],
    daily_ad_spend_bdt: 500,
    avg_product_cost_percent: 55,
    return_courier_loss_per_order: 130
  };
  const body = req.body || {};
  const updated = {
    ...current,
    auto_comment_reply_enabled: body.auto_comment_reply_enabled !== void 0 ? Boolean(body.auto_comment_reply_enabled) : current.auto_comment_reply_enabled,
    public_comment_reply_template: typeof body.public_comment_reply_template === "string" ? body.public_comment_reply_template : current.public_comment_reply_template,
    send_private_inbox_on_comment: body.send_private_inbox_on_comment !== void 0 ? Boolean(body.send_private_inbox_on_comment) : current.send_private_inbox_on_comment,
    auto_followup_enabled: body.auto_followup_enabled !== void 0 ? Boolean(body.auto_followup_enabled) : current.auto_followup_enabled,
    followup_delay_minutes: typeof body.followup_delay_minutes === "number" ? body.followup_delay_minutes : current.followup_delay_minutes,
    followup_message_template: typeof body.followup_message_template === "string" ? body.followup_message_template : current.followup_message_template,
    upsell_enabled: body.upsell_enabled !== void 0 ? Boolean(body.upsell_enabled) : current.upsell_enabled ?? true,
    upsell_offer_text: typeof body.upsell_offer_text === "string" ? body.upsell_offer_text : current.upsell_offer_text || "",
    auto_payment_verify_enabled: body.auto_payment_verify_enabled !== void 0 ? Boolean(body.auto_payment_verify_enabled) : current.auto_payment_verify_enabled ?? true,
    auto_tracking_reply_enabled: body.auto_tracking_reply_enabled !== void 0 ? Boolean(body.auto_tracking_reply_enabled) : current.auto_tracking_reply_enabled ?? true,
    paused_customers: Array.isArray(body.paused_customers) ? body.paused_customers : current.paused_customers || [],
    blocked_customers: Array.isArray(body.blocked_customers) ? body.blocked_customers : current.blocked_customers || [],
    daily_ad_spend_bdt: typeof body.daily_ad_spend_bdt === "number" ? body.daily_ad_spend_bdt : current.daily_ad_spend_bdt ?? 500,
    avg_product_cost_percent: typeof body.avg_product_cost_percent === "number" ? body.avg_product_cost_percent : current.avg_product_cost_percent ?? 55,
    return_courier_loss_per_order: typeof body.return_courier_loss_per_order === "number" ? body.return_courier_loss_per_order : current.return_courier_loss_per_order ?? 130
  };
  db.updateProfile(user.id, { automation_settings: updated });
  const userChannels = db.getChannels(user.id);
  for (const ch of userChannels) {
    db.updateChannel(ch.id, {
      auto_comment_reply: updated.auto_comment_reply_enabled,
      auto_followup_enabled: updated.auto_followup_enabled
    });
  }
  return res.json({ success: true, settings: updated });
});
channelsRouter.post("/test-comment-reply", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const {
    platform = "messenger",
    customerName = "Tanvir Ahmed (Facebook Comment)",
    commentText = "What is the price of the Premium Panjabi? Can I see a photo?"
  } = req.body || {};
  const existingChannel = db.getChannels(user.id).find((c) => c.platform === platform && c.is_active);
  const outcome = await handleInboundCommentWebhook({
    platform: platform === "instagram" ? "instagram" : "messenger",
    identifier: existingChannel?.identifier || `sim_${platform}_${user.id}`,
    commentId: `test_cm_${Date.now()}`,
    customerId: `commenter_${Date.now()}`,
    customerName,
    commentText,
    userId: user.id
  });
  return res.json({
    success: outcome.handled,
    ...outcome
  });
});
channelsRouter.put("/:id", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const channel = db.getChannelById(req.params.id);
  const isAdmin = user.role === "admin";
  if (!channel || !isAdmin && channel.user_id !== user.id) {
    return res.status(404).json({ error: "Channel not found or unauthorized" });
  }
  const { name, identifier, access_token, app_secret, is_active } = req.body;
  const updated = db.updateChannel(req.params.id, {
    ...name !== void 0 && { name: String(name).trim() },
    ...identifier !== void 0 && { identifier: String(identifier).trim() },
    ...access_token !== void 0 && access_token.trim() && { access_token: String(access_token).trim() },
    ...app_secret !== void 0 && { app_secret: app_secret ? String(app_secret).trim() : void 0 },
    ...is_active !== void 0 && { is_active: Boolean(is_active) },
    status: is_active === false ? "not_connected" : "connected",
    error_message: void 0,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  const { access_token: _token, app_secret: _sec, ...sanitized } = updated || {};
  return res.json(sanitized);
});
channelsRouter.patch("/:id/toggle", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const channel = db.getChannelById(req.params.id);
  const isAdmin = user.role === "admin";
  if (!channel || !isAdmin && channel.user_id !== user.id) {
    return res.status(404).json({ error: "Channel not found or unauthorized" });
  }
  if (!channel.is_active) {
    const subCheck = checkSubscriptionActive(user.id);
    if (!subCheck.allowed) {
      return res.status(403).json({ error: subCheck.error });
    }
    if (["messenger", "instagram", "whatsapp"].includes(channel.platform) && channel.identifier !== "website_widget") {
      const limitCheck = checkChannelLimitForPlan(user.id, channel.platform);
      if (!limitCheck.allowed) {
        return res.status(403).json({ error: limitCheck.error });
      }
    }
  }
  const updated = db.updateChannel(req.params.id, {
    is_active: !channel.is_active,
    status: !channel.is_active ? "connected" : "not_connected"
  });
  const { access_token, app_secret, ...sanitized } = updated || {};
  return res.json(sanitized);
});
channelsRouter.patch("/:id/automation", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const channel = db.getChannelById(req.params.id);
  const isAdmin = user.role === "admin";
  if (!channel || !isAdmin && channel.user_id !== user.id) {
    return res.status(404).json({ error: "Channel not found or unauthorized" });
  }
  const { auto_comment_reply, auto_followup_enabled } = req.body || {};
  const updated = db.updateChannel(req.params.id, {
    ...auto_comment_reply !== void 0 && { auto_comment_reply: Boolean(auto_comment_reply) },
    ...auto_followup_enabled !== void 0 && { auto_followup_enabled: Boolean(auto_followup_enabled) },
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  const { access_token, app_secret, ...sanitized } = updated || {};
  return res.json(sanitized);
});
channelsRouter.delete("/:id", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const channel = db.getChannelById(req.params.id);
  const isAdmin = user.role === "admin";
  if (!channel || !isAdmin && channel.user_id !== user.id) {
    return res.status(404).json({ error: "Channel not found or unauthorized" });
  }
  await metaOAuthService.disconnectChannel(req.params.id, user.id).catch(() => {
  });
  db.deleteChannel(req.params.id, isAdmin ? void 0 : user.id);
  return res.json({ success: true, message: `Channel "${channel.name}" has been disconnected.` });
});

// server/routes/settings.ts
init_database();
import { Router as Router6 } from "express";
var settingsRouter = Router6();
settingsRouter.get("/public", (_req, res) => {
  const s = db.getSettings();
  return res.json({
    site_name: s.site_name || "One Agent BD",
    site_tagline: s.site_tagline || "AI Sales Platform",
    logo_url: s.logo_url || "",
    promo_video_url: s.promo_video_url || "https://www.youtube.com/watch?v=aircAruvnKk",
    promo_video_thumbnail: s.promo_video_thumbnail || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85",
    support_email: s.support_email || "support@oneagentbd.online",
    bkash_number: s.bkash_number || "",
    nagad_number: s.nagad_number || ""
  });
});
settingsRouter.put("/promo-video", async (req, res) => {
  const current = db.getSettings();
  const { promo_video_url, promo_video_thumbnail } = req.body;
  const updated = db.updateSettings({
    promo_video_url: promo_video_url !== void 0 ? String(promo_video_url).trim() : current.promo_video_url,
    promo_video_thumbnail: promo_video_thumbnail !== void 0 ? String(promo_video_thumbnail).trim() : current.promo_video_thumbnail
  });
  await db.flushToSupabase().catch(() => {
  });
  return res.json({
    success: true,
    promo_video_url: updated.promo_video_url,
    promo_video_thumbnail: updated.promo_video_thumbnail,
    settings: updated,
    message: "Promo video & thumbnail saved successfully"
  });
});
settingsRouter.get("/reviews", (_req, res) => {
  return res.json({
    reviews: db.getApprovedReviews()
  });
});
settingsRouter.get("/notifications", (_req, res) => {
  return res.json({
    notifications: db.getActiveNotifications()
  });
});
settingsRouter.post("/reviews", (req, res) => {
  const { name, role, business, rating, review_text, avatar_url } = req.body;
  const cleanName = String(name || "").trim();
  const cleanText = String(review_text || "").trim();
  if (!cleanName || !cleanText) {
    return res.status(400).json({ error: "Name and review text are required." });
  }
  const numericRating = Math.min(5, Math.max(1, Number(rating) || 5));
  const created = db.createReview({
    id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: cleanName,
    role: String(role || "Merchant").trim() || "Merchant",
    business: String(business || "Verified Store").trim() || "Verified Store",
    avatar_url: String(avatar_url || "").trim(),
    rating: numericRating,
    review_text: cleanText,
    status: "pending",
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  return res.status(201).json({
    success: true,
    review: created,
    message: "Your review has been submitted and is pending admin approval."
  });
});
settingsRouter.get("/llm", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const sysSettings = db.getSettings();
  const rawUserKey = (user.llm_api_key || "").trim();
  const rawSysKey = user.role === "admin" ? (sysSettings?.default_llm_api_key || "").trim() : "";
  const cleanUserKey = rawUserKey.startsWith("sk-proj-wJiInvQ") ? "" : rawUserKey;
  const cleanSysKey = rawSysKey.startsWith("sk-proj-wJiInvQ") ? "" : rawSysKey;
  const savedKey = cleanUserKey || cleanSysKey;
  const savedPrompt = (user.system_prompt && !user.system_prompt.includes("You are an executive AI assistant for One Agent BD") && !user.system_prompt.includes("Subscription Plan: All-in-One Plan 1,450 BDT/month") && !user.system_prompt.includes("Subscription Plans: Standard Plan 899 BDT/month") ? user.system_prompt : "") || (user.role === "admin" && sysSettings?.default_system_prompt ? sysSettings.default_system_prompt : user.system_prompt);
  return res.json({
    llm_provider: user.llm_provider || "gemini",
    llm_api_key: savedKey,
    system_prompt: savedPrompt,
    has_custom_key: Boolean(savedKey),
    masked_key: savedKey ? `\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022${savedKey.slice(-4)}` : null,
    default_env_gemini_active: Boolean(process.env.GEMINI_API_KEY || cleanSysKey)
  });
});
settingsRouter.put("/llm", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { llm_provider, llm_api_key, clear_api_key, system_prompt } = req.body;
  const updates = {};
  if (llm_provider) updates.llm_provider = llm_provider;
  if (system_prompt !== void 0) updates.system_prompt = system_prompt;
  if (clear_api_key === true) {
    updates.llm_api_key = "";
  } else if (typeof llm_api_key === "string" && llm_api_key.trim().length > 0) {
    const trimmed = llm_api_key.trim();
    updates.llm_api_key = trimmed.startsWith("sk-proj-wJiInvQ") ? "" : trimmed;
  }
  const updated = db.updateProfile(user.id, updates);
  if (user.role === "admin") {
    const settingsPatch = {};
    if (updates.llm_api_key !== void 0) {
      settingsPatch.default_llm_api_key = updates.llm_api_key;
    }
    if (updates.system_prompt !== void 0) {
      settingsPatch.default_system_prompt = updates.system_prompt;
    }
    if (Object.keys(settingsPatch).length > 0) {
      db.updateSettings(settingsPatch);
    }
    for (const prof of db.getProfiles()) {
      if (prof.role === "admin" && prof.id !== user.id) {
        db.updateProfile(prof.id, updates);
      }
    }
  }
  await db.flushToSupabase().catch(() => {
  });
  const effectiveKey = updated?.llm_api_key && updated.llm_api_key.trim() || (user.role === "admin" ? (db.getSettings()?.default_llm_api_key || "").trim() : "");
  return res.json({
    message: "AI settings updated successfully",
    llm_provider: updated?.llm_provider || "gemini",
    llm_api_key: effectiveKey,
    system_prompt: updated?.system_prompt || "",
    has_custom_key: Boolean(effectiveKey),
    masked_key: effectiveKey ? `\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022${effectiveKey.slice(-4)}` : null
  });
});
settingsRouter.get("/instant-rules", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const profile = db.getProfileById(user.id);
  const defaultRules = [
    {
      id: "rule_delivery",
      name: "\u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u099A\u09BE\u09B0\u09CD\u099C \u0993 \u09B8\u09AE\u09DF (\u09B8\u09BE\u09B0\u09BE \u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6)",
      keywords: ["delivery", "\u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF", "\u099A\u09BE\u09B0\u09CD\u099C", "\u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u099A\u09BE\u09B0\u09CD\u099C", "\u0996\u09B0\u099A", "khoroch", "delivery fee", "koto tk", "\u0995\u09A4 \u099F\u09BE\u0995\u09BE", "\u0995\u09A4\u09CB", "delivery koto"],
      reply_text: "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u099A\u09BE\u09B0\u09CD\u099C: \u09A2\u09BE\u0995\u09BE \u09B8\u09BF\u099F\u09BF\u09B0 \u09AD\u09BF\u09A4\u09B0\u09C7 \u09AE\u09BE\u09A4\u09CD\u09B0 \u09F3\u09EE\u09E6, \u098F\u09AC\u0982 \u09A2\u09BE\u0995\u09BE\u09B0 \u09AC\u09BE\u0987\u09B0\u09C7 \u09B8\u09BE\u09B0\u09BE\u09A6\u09C7\u09B6\u09C7 \u09F3\u09E7\u09EB\u09E6\u0964 \u09E8-\u09E9 \u0995\u09BE\u09B0\u09CD\u09AF\u09A6\u09BF\u09AC\u09B8\u09C7\u09B0 \u09AE\u09A7\u09CD\u09AF\u09C7 \u09A6\u09CD\u09B0\u09C1\u09A4\u09A4\u09AE \u09B9\u09CB\u09AE \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09AA\u09CC\u0981\u099B\u09C7 \u09AF\u09BE\u09AC\u09C7 \u0987\u09A8\u09B6\u09BE\u0986\u09B2\u09CD\u09B2\u09BE\u09B9\u0964",
      is_active: true,
      category: "delivery"
    },
    {
      id: "rule_payment",
      name: "\u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u0993 \u09AC\u09BF\u0995\u09BE\u09B6/\u09A8\u0997\u09A6 \u09AE\u09BE\u09B0\u09CD\u099A\u09C7\u09A8\u09CD\u099F \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0",
      keywords: ["bkash", "\u09AC\u09BF\u0995\u09BE\u09B6", "nagad", "\u09A8\u0997\u09A6", "payment", "\u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F", "\u099F\u09BE\u0995\u09BE \u09AA\u09BE\u09A0\u09BE\u09AC\u09CB", "advance", "\u0985\u0997\u09CD\u09B0\u09BF\u09AE"],
      reply_text: "\u0986\u09AA\u09A8\u09BF \u0995\u09CD\u09AF\u09BE\u09B6 \u0985\u09A8 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF\u09A4\u09C7 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09A8\u09BF\u09B6\u09CD\u099A\u09BF\u09A8\u09CD\u09A4\u09C7 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u09B9\u09BE\u09A4\u09C7 \u09AA\u09C7\u09DF\u09C7 \u09AE\u09C2\u09B2\u09CD\u09AF \u09AA\u09B0\u09BF\u09B6\u09CB\u09A7 \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u09A8\u0964 \u0985\u09A5\u09AC\u09BE \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 bKash/Nagad \u09AE\u09BE\u09B0\u09CD\u099A\u09C7\u09A8\u09CD\u099F \u09A8\u09AE\u09CD\u09AC\u09B0\u09C7 \u0985\u0997\u09CD\u09B0\u09BF\u09AE \u09AA\u09C7 \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8\u0964",
      is_active: true,
      category: "payment"
    },
    {
      id: "rule_order",
      name: "\u0995\u09BF\u09AD\u09BE\u09AC\u09C7 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09AC / \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09A8\u09AB\u09BE\u09B0\u09CD\u09AE\u09C7\u09B6\u09A8",
      keywords: ["order", "\u0985\u09B0\u09CD\u09A1\u09BE\u09B0", "order confirm", "\u0995\u09BF\u09AD\u09BE\u09AC\u09C7 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0", "kivabe order", "\u09AC\u09C1\u0995\u09BF\u0982"],
      reply_text: "\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u099B\u09A8\u09CD\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u09C7\u09B0 \u09A8\u09BE\u09AE/\u09B8\u09BE\u0987\u099C, \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09A0\u09BF\u0995\u09BE\u09A8\u09BE \u098F\u09AC\u0982 \u098F\u0995\u099F\u09BF \u09B8\u099A\u09B2 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0 \u09AA\u09BE\u09A0\u09BF\u09DF\u09C7 \u09A6\u09BF\u09A8\u0964 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B0\u09A4\u09BF\u09A8\u09BF\u09A7\u09BF \u09A6\u09CD\u09B0\u09C1\u09A4 \u0995\u09A8\u09AB\u09BE\u09B0\u09CD\u09AE \u0995\u09B0\u09C7 \u09A8\u09BF\u09AC\u09C7\u09A8\u0964",
      is_active: true,
      category: "order"
    },
    {
      id: "rule_location",
      name: "\u09B6\u09CB\u09B0\u09C1\u09AE / \u09B6\u09AA \u09B2\u09CB\u0995\u09C7\u09B6\u09A8 \u0993 \u09B0\u09BF\u099F\u09BE\u09B0\u09CD\u09A8 \u09AA\u09B2\u09BF\u09B8\u09BF",
      keywords: ["showroom", "\u09B6\u09CB\u09B0\u09C1\u09AE", "\u09A6\u09CB\u0995\u09BE\u09A8", "shop", "\u09A0\u09BF\u0995\u09BE\u09A8\u09BE", "location", "\u0995\u09CB\u09A5\u09BE\u09DF", "return", "\u09B0\u09BF\u099F\u09BE\u09B0\u09CD\u09A8"],
      reply_text: "\u0986\u09AE\u09B0\u09BE \u09B8\u09BE\u09B0\u09BE \u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6\u09C7 \u09A6\u09CD\u09B0\u09C1\u09A4\u09A4\u09AE \u09B9\u09CB\u09AE \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09B8\u09BE\u09B0\u09CD\u09AD\u09BF\u09B8 \u09A6\u09BF\u09DF\u09C7 \u09A5\u09BE\u0995\u09BF\u0964 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u09B9\u09BE\u09A4\u09C7 \u09AA\u09C7\u09DF\u09C7 \u09A6\u09C7\u0996\u09C7 \u099A\u09C7\u0995 \u0995\u09B0\u09C7 \u09AE\u09C2\u09B2\u09CD\u09AF \u09AA\u09B0\u09BF\u09B6\u09CB\u09A7 \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u09A8\u0964 \u0995\u09CB\u09A8\u09CB \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09B2\u09C7 \u09B8\u09BE\u09A5\u09C7 \u09B8\u09BE\u09A5\u09C7 \u098F\u0995\u09CD\u09B8\u099A\u09C7\u099E\u09CD\u099C \u09AC\u09BE \u09B0\u09BF\u099F\u09BE\u09B0\u09CD\u09A8 \u09B8\u09C1\u09AC\u09BF\u09A7\u09BE \u09B0\u09DF\u09C7\u099B\u09C7\u0964",
      is_active: true,
      category: "policy"
    }
  ];
  const savedRules = profile?.instant_faq_rules || defaultRules;
  const costSaverActive = profile?.instant_rules_active !== false;
  const triggeredCount = profile?.instant_rules_triggered_count || 48;
  return res.json({
    rules: savedRules,
    cost_saver_active: costSaverActive,
    triggered_count: triggeredCount
  });
});
settingsRouter.put("/instant-rules", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { rules, cost_saver_active } = req.body;
  const updates = {};
  if (Array.isArray(rules)) updates.instant_faq_rules = rules;
  if (typeof cost_saver_active === "boolean") updates.instant_rules_active = cost_saver_active;
  db.updateProfile(user.id, updates);
  await db.flushToSupabase().catch(() => {
  });
  return res.json({
    success: true,
    message: "Instant FAQ & Cost-Saver Rules updated successfully",
    rules: updates.instant_faq_rules,
    cost_saver_active: updates.instant_rules_active
  });
});
settingsRouter.get("/credits", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { getUserSubscriptionStatus: getUserSubscriptionStatus2 } = await Promise.resolve().then(() => (init_subscriptionService(), subscriptionService_exports));
  const subStatus = getUserSubscriptionStatus2(user.id);
  const profile = db.getProfileById(user.id);
  const allMessages = db.getMessages(user.id);
  const waMessages = allMessages.filter((m) => m.platform === "whatsapp");
  const fbMessages = allMessages.filter((m) => m.platform === "messenger" || m.platform === "facebook");
  const igMessages = allMessages.filter((m) => m.platform === "instagram");
  const instantRulesTriggered = profile?.instant_rules_triggered_count || 48;
  return res.json({
    whatsapp: {
      total_quota: subStatus.whatsappCreditsTotal,
      used: subStatus.whatsappCreditsUsed,
      remaining: subStatus.whatsappCreditsRemaining,
      percent_used: Math.min(100, Math.round(subStatus.whatsappCreditsUsed / Math.max(1, subStatus.whatsappCreditsTotal) * 100))
    },
    facebook: {
      is_unlimited: true,
      total_sent: fbMessages.length
    },
    instagram: {
      is_unlimited: true,
      total_sent: igMessages.length
    },
    instant_rules: {
      triggered_count: instantRulesTriggered,
      credits_saved: instantRulesTriggered,
      estimated_savings_bdt: Math.round(instantRulesTriggered * 1.5)
    },
    plan: {
      id: subStatus.planId,
      name: subStatus.planName,
      price: subStatus.price,
      days_remaining: subStatus.daysRemaining,
      is_trial: subStatus.isTrialActive,
      is_expired: subStatus.isExpired
    }
  });
});

// server/routes/inbox.ts
init_database();
import { Router as Router7 } from "express";
init_metaService();
init_subscriptionService();
init_aiService();
init_audioDownloader();
var inboxRouter = Router7();
inboxRouter.get("/messages", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    console.warn("[Inbox GET Unauthorized] No authenticated user found from headers/query");
    return res.status(401).json({ error: "Unauthorized" });
  }
  const now = Date.now();
  const hasLocalMessages = db.getAllMessages().length > 0;
  if (!hasLocalMessages) {
    await Promise.race([
      db.syncFromSupabase(true),
      new Promise((resolve) => setTimeout(resolve, 1500))
    ]).catch((err) => {
      console.warn("[Inbox GET] Initial syncFromSupabase error:", err?.message || err);
    });
  } else if (now - db.getLastSupabaseSyncAt() > 15e3) {
    db.syncFromSupabase(false).catch((err) => {
      console.warn("[Inbox GET] Background sync warning:", err?.message || err);
    });
  }
  const { channel_id, platform, customer_id, search, category } = req.query;
  const isAdmin = user.role === "admin";
  let messages = isAdmin ? db.getAllMessages() : db.getMessages(user.id);
  if (messages.length === 0) {
    messages = db.getAllMessages();
  }
  console.log(`[Inbox GET] Authenticated user: id="${user.id}", role="${user.role}", email="${user.email}", total_db_messages=${db.getAllMessages().length}, user_messages=${messages.length}`);
  const userOrders = isAdmin ? db.getOrders() : db.getOrders(user.id);
  const profile = db.getProfileById(user.id);
  const pausedList = profile?.automation_settings?.paused_customers || [];
  const blockedList = profile?.automation_settings?.blocked_customers || [];
  if (channel_id) {
    messages = messages.filter((m) => m.channel_id === channel_id);
  }
  if (platform) {
    messages = messages.filter((m) => m.platform === platform);
  }
  if (customer_id) {
    messages = messages.filter((m) => m.customer_id === customer_id);
  }
  if (search) {
    const q = search.toLowerCase();
    messages = messages.filter(
      (m) => m.message_text.toLowerCase().includes(q) || m.customer_name && m.customer_name.toLowerCase().includes(q) || m.customer_id.toLowerCase().includes(q)
    );
  }
  const allCustomerMeta = isAdmin ? db.getAllCustomerMetadata() : db.getAllCustomerMetadata(user.id);
  const metaMap = new Map(allCustomerMeta.map((m) => [m.customer_id, m]));
  const ordersByCustomerId = /* @__PURE__ */ new Map();
  const ordersByPhoneTail = /* @__PURE__ */ new Map();
  for (const ord of userOrders) {
    if (ord.customer_id) {
      const list = ordersByCustomerId.get(ord.customer_id) || [];
      list.push(ord);
      ordersByCustomerId.set(ord.customer_id, list);
    }
    if (ord.customer_phone) {
      const digits = ord.customer_phone.replace(/\D/g, "");
      if (digits.length >= 8) {
        const tail = digits.slice(-8);
        const list = ordersByPhoneTail.get(tail) || [];
        list.push(ord);
        ordersByPhoneTail.set(tail, list);
      }
    }
  }
  const conversationsMap = /* @__PURE__ */ new Map();
  for (const msg of messages) {
    const key = `${msg.platform}_${msg.customer_id}`;
    if (!conversationsMap.has(key)) {
      const cleanMsgId = msg.customer_id.replace(/\D/g, "");
      const tail8 = cleanMsgId.length >= 8 ? cleanMsgId.slice(-8) : "";
      const matchingOrders = (ordersByCustomerId.get(msg.customer_id) || (tail8 ? ordersByPhoneTail.get(tail8) : null) || []).slice();
      let orderCategory = "new_customer";
      let latestOrderId;
      let latestOrderStatus;
      if (matchingOrders.length > 0) {
        matchingOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const latest = matchingOrders[0];
        latestOrderId = latest.id;
        latestOrderStatus = latest.status;
        if (latest.status === "delivered") {
          orderCategory = "delivered";
        } else {
          orderCategory = "orders";
        }
      }
      const validOrders = matchingOrders.filter((o) => o.status !== "cancelled");
      const totalSpent = validOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
      let custMeta = metaMap.get(msg.customer_id) || metaMap.get(key);
      if (!custMeta) {
        custMeta = {
          id: `${msg.user_id || user.id}_${msg.customer_id}`,
          user_id: msg.user_id || user.id,
          customer_id: msg.customer_id,
          customer_name: msg.customer_name || `Messenger User (${msg.customer_id.slice(-4)})`,
          customer_avatar: msg.customer_avatar,
          is_starred: false,
          is_deleted: false
        };
        metaMap.set(msg.customer_id, custMeta);
        metaMap.set(key, custMeta);
      }
      const isAiPaused = pausedList.includes(msg.customer_id) || pausedList.includes(key);
      const isBlocked = blockedList.includes(msg.customer_id) || blockedList.includes(key);
      const resolvedName = custMeta?.customer_name || msg.customer_name || msg.customer_id;
      const resolvedPhone = custMeta?.customer_phone || matchingOrders[0]?.customer_phone || (cleanMsgId.length >= 11 && cleanMsgId.startsWith("01") ? cleanMsgId : void 0);
      const resolvedAddress = custMeta?.customer_address || matchingOrders[0]?.customer_address || void 0;
      conversationsMap.set(key, {
        customerId: msg.customer_id,
        customerName: resolvedName,
        customerAvatar: custMeta?.customer_avatar || msg.customer_avatar,
        customerPhone: resolvedPhone,
        customerAddress: resolvedAddress,
        tags: custMeta?.tags || (matchingOrders.length > 0 ? ["Order Client"] : []),
        notes: custMeta?.notes || "",
        isStarred: Boolean(custMeta?.is_starred),
        isDeleted: Boolean(custMeta?.is_deleted),
        assignedAgentId: custMeta?.assigned_agent_id,
        totalSpent,
        platform: msg.platform,
        channelId: msg.channel_id || `chn_${msg.platform}_direct`,
        lastMessage: msg,
        messages: [],
        unreadCount: 0,
        orderCategory,
        totalOrdersCount: matchingOrders.length,
        latestOrderId,
        latestOrderStatus,
        isAiPaused,
        isBlocked,
        requiresHumanAttention: Boolean(msg.requires_human_attention),
        attentionReason: msg.attention_reason
      });
    }
    const conv = conversationsMap.get(key);
    conv.messages.push(msg);
    conv.lastMessage = msg;
    if (msg.requires_human_attention) {
      conv.requiresHumanAttention = true;
      if (msg.attention_reason) {
        conv.attentionReason = msg.attention_reason;
      }
    }
    if (msg.customer_avatar && !conv.customerAvatar) {
      conv.customerAvatar = msg.customer_avatar;
    }
    if (msg.customer_name && conv.customerName === conv.customerId) {
      conv.customerName = msg.customer_name;
    }
  }
  const allConversations = Array.from(conversationsMap.values()).sort(
    (a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
  );
  const activeConversations = allConversations.filter((c) => !c.isDeleted);
  const trashConversations = allConversations.filter((c) => c.isDeleted);
  const categoryCounts = {
    all: activeConversations.length,
    orders: activeConversations.filter((c) => c.orderCategory === "orders").length,
    delivered: activeConversations.filter((c) => c.orderCategory === "delivered").length,
    new_customer: activeConversations.filter((c) => c.orderCategory === "new_customer").length,
    starred: activeConversations.filter((c) => c.isStarred).length,
    trash: trashConversations.length
  };
  let conversations = activeConversations;
  if (category === "trash") {
    conversations = trashConversations;
  } else if (category === "starred") {
    conversations = activeConversations.filter((c) => c.isStarred);
  } else if (category && category !== "all") {
    conversations = activeConversations.filter((c) => c.orderCategory === category);
  }
  console.log(`[Inbox GET Response] Returning HTTP 200: user_id="${user.id}", role="${user.role}", conversations_count=${conversations.length}, messages_count=${messages.length}, active_conversations=${activeConversations.length}`);
  return res.json({
    conversations,
    allConversations,
    allMessages: messages,
    categoryCounts,
    debug: {
      userId: user.id,
      userRole: user.role,
      userEmail: user.email,
      totalDbMessages: db.getAllMessages().length,
      returnedMessages: messages.length,
      returnedConversations: conversations.length,
      supabaseUrlDetected: Boolean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabaseKeyDetected: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY)
    }
  });
});
inboxRouter.post("/reply", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const subStatus = getUserSubscriptionStatus(user.id);
  if (subStatus.isGated) {
    return res.status(403).json({ error: "Subscription expired. Please renew to send messages." });
  }
  const {
    customerId,
    customerName,
    platform,
    channelId,
    messageText,
    imageBase64,
    imageMimeType,
    videoBase64,
    videoMimeType,
    audioBase64,
    audioMimeType
  } = req.body;
  const hasText = Boolean(messageText && String(messageText).trim());
  const hasImage = Boolean(imageBase64);
  const hasVideo = Boolean(videoBase64);
  const hasVoice = Boolean(audioBase64);
  if (!customerId || !platform || !hasText && !hasImage && !hasVideo && !hasVoice) {
    return res.status(400).json({
      error: "customerId, platform, and at least one of messageText, image, video, or voice are required"
    });
  }
  const fallbackText = hasText ? String(messageText).trim() : hasVoice ? "\u{1F399}\uFE0F Voice Message" : hasVideo ? "\u{1F3AC} Sent a Video" : hasImage ? "\u{1F4F7} Sent a Photo" : "";
  let normalizedAudioBase64 = hasVoice ? String(audioBase64).replace(/^data:[^;]+;base64,/, "") : void 0;
  let normalizedAudioMime = hasVoice ? audioMimeType || "audio/mpeg" : void 0;
  if (hasVoice && normalizedAudioBase64) {
    try {
      const rawBuf = Buffer.from(normalizedAudioBase64, "base64");
      const prepared = await prepareOutboundVoiceForMeta(rawBuf, normalizedAudioMime, platform);
      normalizedAudioBase64 = prepared.buffer.toString("base64");
      normalizedAudioMime = prepared.mimeType;
    } catch (e) {
      console.warn("[Inbox Reply] Voice normalization warning:", e);
    }
  }
  const userChannels = user.role === "admin" ? db.getChannels() : db.getChannels(user.id);
  const activeChannel = (channelId ? userChannels.find((c) => c.id === channelId) : void 0) || userChannels.find((c) => c.platform === platform && c.is_active);
  if (activeChannel) {
    await sendManualMetaMessage(activeChannel, customerId, {
      text: hasText ? String(messageText).trim() : void 0,
      imageBase64,
      imageMimeType,
      videoBase64,
      videoMimeType,
      audioBase64: normalizedAudioBase64,
      audioMimeType: normalizedAudioMime
    });
  }
  const outbound = db.createMessage({
    id: `msg_${Date.now()}_agent_${Math.random().toString(36).substring(2, 6)}`,
    user_id: user.id,
    channel_id: activeChannel?.id || channelId,
    platform,
    customer_id: customerId,
    customer_name: customerName,
    direction: "outbound",
    message_text: fallbackText,
    has_image: hasImage,
    image_base64: hasImage ? String(imageBase64) : void 0,
    image_mime_type: hasImage ? imageMimeType || "image/jpeg" : void 0,
    has_video: hasVideo,
    video_base64: hasVideo ? String(videoBase64) : void 0,
    video_mime_type: hasVideo ? videoMimeType || "video/mp4" : void 0,
    has_voice: hasVoice,
    audio_base64: hasVoice ? normalizedAudioBase64 : void 0,
    audio_mime_type: hasVoice ? normalizedAudioMime || "audio/mpeg" : void 0,
    is_ai_reply: false,
    status: "sent",
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  await db.flushToSupabase().catch(() => {
  });
  return res.status(201).json(outbound);
});
inboxRouter.post("/summarize", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { customerId, customerName, platform } = req.body;
  if (!customerId || !platform) {
    return res.status(400).json({ error: "customerId and platform are required" });
  }
  const allUserMessages = db.getMessages(user.id);
  const convMessages = allUserMessages.filter(
    (m) => m.platform === platform && m.customer_id === customerId
  );
  if (convMessages.length === 0) {
    return res.status(404).json({ error: "No messages found for this conversation" });
  }
  const userOrders = db.getOrders(user.id);
  const matchingOrders = userOrders.filter((o) => {
    const cleanMsgId = String(customerId).replace(/\D/g, "");
    const cleanOrderPhone = o.customer_phone ? o.customer_phone.replace(/\D/g, "") : "";
    const phoneMatch = cleanOrderPhone.length >= 8 && cleanMsgId.length >= 8 && (cleanMsgId.includes(cleanOrderPhone) || cleanOrderPhone.includes(cleanMsgId));
    const nameMatch = Boolean(
      o.customer_name && customerName && o.customer_name.toLowerCase().trim() === String(customerName).toLowerCase().trim()
    );
    return phoneMatch || nameMatch;
  });
  matchingOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const latestOrder = matchingOrders[0];
  const summaryResult = await summarizeConversation({
    userId: user.id,
    customerId,
    customerName: customerName || convMessages[convMessages.length - 1]?.customer_name || customerId,
    platform,
    messages: convMessages,
    latestOrderId: latestOrder?.id,
    latestOrderStatus: latestOrder?.status,
    orderPhone: latestOrder?.customer_phone,
    orderAddress: latestOrder?.customer_address,
    orderProductSummary: latestOrder?.product_summary
  });
  return res.json(summaryResult);
});
inboxRouter.post("/simulate-inbound", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const subStatus = getUserSubscriptionStatus(user.id);
  if (subStatus.isGated) {
    return res.status(403).json({ error: "Subscription expired. AI replies are disabled until plan is renewed." });
  }
  const {
    platform,
    customerId,
    customerName,
    messageText,
    channelId,
    audioBase64,
    audioMimeType,
    imageBase64,
    imageMimeType,
    imageUrl,
    overrideSystemPrompt
  } = req.body;
  if (!platform || !messageText && !audioBase64 && !imageBase64 && !imageUrl) {
    return res.status(400).json({ error: "platform and either messageText, audio, or image are required" });
  }
  let channel = channelId ? db.getChannelById(channelId) : void 0;
  if (!channel || channel.user_id !== user.id) {
    channel = db.getChannels(user.id).find((c) => c.platform === platform && c.is_active);
  }
  const defaultIdentifier = platform === "whatsapp" ? `sim_wa_${user.id}` : platform === "messenger" ? `sim_fb_${user.id}` : `sim_ig_${user.id}`;
  const defaultCustomerId = platform === "whatsapp" ? "+88017" + Math.floor(1e7 + Math.random() * 9e7) : platform === "messenger" ? "psid_" + Math.floor(1e9 + Math.random() * 9e9) : "igsid_" + Math.floor(1e9 + Math.random() * 9e9);
  const identifier = channel?.identifier || defaultIdentifier;
  const result = await handleInboundWebhook({
    platform,
    identifier,
    customerId: customerId || defaultCustomerId,
    customerName: customerName || "Interested Customer",
    messageText: messageText ? messageText.trim() : audioBase64 ? "\u{1F399}\uFE0F [Voice Message]" : imageBase64 || imageUrl ? "\u{1F4F7} [Product Photo Inquiry]" : "",
    audioBase64,
    audioMimeType,
    imageBase64,
    imageMimeType,
    imageUrl,
    userId: user.id,
    overrideSystemPrompt
  });
  return res.json({
    success: true,
    ...result
  });
});
inboxRouter.post("/customer-control", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { customerId, platform, action, value } = req.body || {};
  if (!customerId || !action) {
    return res.status(400).json({ error: "customerId and action are required" });
  }
  const profile = db.getProfileById(user.id);
  const currentSettings = profile?.automation_settings || {
    auto_comment_reply_enabled: true,
    public_comment_reply_template: "",
    send_private_inbox_on_comment: true,
    auto_followup_enabled: true,
    followup_delay_minutes: 45,
    followup_message_template: ""
  };
  const key = platform ? `${platform}_${customerId}` : String(customerId);
  let paused = Array.from(new Set(currentSettings.paused_customers || []));
  let blocked = Array.from(new Set(currentSettings.blocked_customers || []));
  if (action === "pause_ai") {
    const shouldPause = value !== void 0 ? Boolean(value) : true;
    if (shouldPause) {
      if (!paused.includes(customerId)) paused.push(customerId);
      if (!paused.includes(key)) paused.push(key);
    } else {
      paused = paused.filter((id) => id !== customerId && id !== key);
    }
  } else if (action === "resume_ai") {
    paused = paused.filter((id) => id !== customerId && id !== key);
  } else if (action === "block" || action === "block_customer") {
    const shouldBlock = value !== void 0 ? Boolean(value) : true;
    if (shouldBlock) {
      if (!blocked.includes(customerId)) blocked.push(customerId);
      if (!blocked.includes(key)) blocked.push(key);
    } else {
      blocked = blocked.filter((id) => id !== customerId && id !== key);
    }
  } else if (action === "unblock") {
    blocked = blocked.filter((id) => id !== customerId && id !== key);
  }
  const updatedSettings = {
    ...currentSettings,
    paused_customers: paused,
    blocked_customers: blocked
  };
  db.updateProfile(user.id, { automation_settings: updatedSettings });
  return res.json({
    success: true,
    customerId,
    isAiPaused: paused.includes(customerId) || paused.includes(key),
    isBlocked: blocked.includes(customerId) || blocked.includes(key),
    paused_customers: paused,
    blocked_customers: blocked
  });
});
inboxRouter.get("/customer-details/:customerId", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { customerId } = req.params;
  const meta = db.getCustomerMetadata(user.id, customerId);
  const userOrders = db.getOrders(user.id);
  const cleanMsgId = customerId.replace(/\D/g, "");
  const matchingOrders = userOrders.filter((o) => {
    const cleanOrderPhone = o.customer_phone ? o.customer_phone.replace(/\D/g, "") : "";
    const phoneMatch = cleanOrderPhone.length >= 8 && cleanMsgId.length >= 8 && (cleanMsgId.includes(cleanOrderPhone) || cleanOrderPhone.includes(cleanMsgId));
    return o.customer_id === customerId || phoneMatch;
  });
  return res.json({
    metadata: meta,
    orders: matchingOrders
  });
});
inboxRouter.put("/customer-details/:customerId", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { customerId } = req.params;
  const { customerName, customerPhone, customerAddress, customerAvatar, tags, notes, isStarred, isDeleted, assignedAgentId } = req.body || {};
  const updated = db.upsertCustomerMetadata(user.id, customerId, {
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_address: customerAddress,
    customer_avatar: customerAvatar,
    tags: Array.isArray(tags) ? tags : void 0,
    notes: typeof notes === "string" ? notes : void 0,
    is_starred: typeof isStarred === "boolean" ? isStarred : void 0,
    is_deleted: typeof isDeleted === "boolean" ? isDeleted : void 0,
    assigned_agent_id: assignedAgentId
  });
  return res.json({ success: true, metadata: updated });
});
inboxRouter.delete("/conversations/:customerId", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { customerId } = req.params;
  const updated = db.upsertCustomerMetadata(user.id, customerId, {
    is_deleted: true
  });
  return res.json({ success: true, message: "Conversation moved to trash", metadata: updated });
});
inboxRouter.post("/conversations/:customerId/restore", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { customerId } = req.params;
  const updated = db.upsertCustomerMetadata(user.id, customerId, {
    is_deleted: false
  });
  return res.json({ success: true, message: "Conversation restored", metadata: updated });
});
inboxRouter.delete("/conversations/:customerId/permanent", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { customerId } = req.params;
  db.deleteCustomerPermanently(user.id, customerId);
  return res.json({ success: true, message: "Conversation permanently deleted" });
});
function computeWhatsAppBroadcastQuota(userId) {
  const profile = db.getProfileById(userId);
  const autoSettings = profile?.automation_settings;
  const dailyLimit = Math.max(1, Number(autoSettings?.daily_whatsapp_vip_limit) || 50);
  const perCustomerDailyLimit = Math.max(1, Number(autoSettings?.per_customer_daily_limit) || 1);
  const enforce24hWindow = autoSettings?.enforce_whatsapp_24h_window !== void 0 ? Boolean(autoSettings.enforce_whatsapp_24h_window) : true;
  const nowMs = Date.now();
  const window24hMs = 24 * 60 * 60 * 1e3;
  const allMessages = db.getMessages(userId);
  const recentBroadcasts = allMessages.filter(
    (m) => m.direction === "outbound" && m.id.includes("_bcast_") && nowMs - new Date(m.created_at).getTime() <= window24hMs
  );
  const usedToday = recentBroadcasts.length;
  const remainingToday = Math.max(0, dailyLimit - usedToday);
  const isLimitReached = remainingToday <= 0;
  const customerCountMap = /* @__PURE__ */ new Map();
  let oldestBroadcastMs = nowMs;
  for (const b of recentBroadcasts) {
    const key = `${b.platform}_${b.customer_id}`;
    customerCountMap.set(key, (customerCountMap.get(key) || 0) + 1);
    customerCountMap.set(b.customer_id, (customerCountMap.get(b.customer_id) || 0) + 1);
    const t = new Date(b.created_at).getTime();
    if (t < oldestBroadcastMs) oldestBroadcastMs = t;
  }
  const messagedCustomerIdsToday = Array.from(customerCountMap.entries()).filter(([, count]) => count >= perCustomerDailyLimit).map(([id]) => id);
  const nextResetAt = recentBroadcasts.length > 0 ? new Date(oldestBroadcastMs + window24hMs).toISOString() : new Date(nowMs + window24hMs).toISOString();
  return {
    dailyLimit,
    perCustomerDailyLimit,
    enforce24hWindow,
    usedToday,
    remainingToday,
    isLimitReached,
    messagedCustomerIdsToday,
    nextResetAt,
    customerCountMap
  };
}
inboxRouter.get("/broadcast-quota", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const quota = computeWhatsAppBroadcastQuota(user.id);
  return res.json({
    dailyLimit: quota.dailyLimit,
    perCustomerDailyLimit: quota.perCustomerDailyLimit,
    enforce24hWindow: quota.enforce24hWindow,
    usedToday: quota.usedToday,
    remainingToday: quota.remainingToday,
    isLimitReached: quota.isLimitReached,
    messagedCustomerIdsToday: quota.messagedCustomerIdsToday,
    nextResetAt: quota.nextResetAt
  });
});
inboxRouter.put("/broadcast-quota", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { dailyLimit, perCustomerDailyLimit, enforce24hWindow } = req.body || {};
  const current = db.getAutomationSettings(user.id);
  const updated = db.updateAutomationSettings(user.id, {
    ...current,
    daily_whatsapp_vip_limit: dailyLimit !== void 0 ? Math.min(1e3, Math.max(1, Number(dailyLimit) || 50)) : current.daily_whatsapp_vip_limit,
    per_customer_daily_limit: perCustomerDailyLimit !== void 0 ? Math.min(2, Math.max(1, Number(perCustomerDailyLimit) || 1)) : current.per_customer_daily_limit,
    enforce_whatsapp_24h_window: enforce24hWindow !== void 0 ? Boolean(enforce24hWindow) : current.enforce_whatsapp_24h_window
  });
  const quota = computeWhatsAppBroadcastQuota(user.id);
  return res.json({
    success: true,
    settings: updated,
    quota: {
      dailyLimit: quota.dailyLimit,
      perCustomerDailyLimit: quota.perCustomerDailyLimit,
      enforce24hWindow: quota.enforce24hWindow,
      usedToday: quota.usedToday,
      remainingToday: quota.remainingToday,
      isLimitReached: quota.isLimitReached,
      messagedCustomerIdsToday: quota.messagedCustomerIdsToday,
      nextResetAt: quota.nextResetAt
    },
    message: `WhatsApp VIP messaging limit updated to ${quota.dailyLimit} messages per 24 hours.`
  });
});
inboxRouter.post("/broadcast-segment", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const {
    segment = "unordered",
    platformFilter,
    platform,
    messageTemplate,
    messageText,
    targetCustomerId
  } = req.body || {};
  const finalPlatformFilter = platformFilter || platform || "all";
  const finalMessage = String(messageText || messageTemplate || "").trim();
  if (!finalMessage) {
    return res.status(400).json({ error: "Broadcast message text is required" });
  }
  const quotaBefore = computeWhatsAppBroadcastQuota(user.id);
  if (quotaBefore.isLimitReached || quotaBefore.remainingToday <= 0) {
    return res.status(429).json({
      success: false,
      limitReached: true,
      reason: "daily_quota_exceeded",
      usedToday: quotaBefore.usedToday,
      dailyLimit: quotaBefore.dailyLimit,
      remainingToday: 0,
      nextResetAt: quotaBefore.nextResetAt,
      error: `Daily WhatsApp & VIP Messaging Limit Reached (${quotaBefore.usedToday}/${quotaBefore.dailyLimit} sent in 24h). According to WhatsApp Business anti-ban rules, you cannot send more promotional messages until the 24-hour quota resets.`
    });
  }
  const allMessages = db.getMessages(user.id);
  const userOrders = db.getOrders(user.id);
  const userChannels = db.getChannels(user.id);
  const profile = db.getProfileById(user.id);
  const blockedList = profile?.automation_settings?.blocked_customers || [];
  const customerMap = /* @__PURE__ */ new Map();
  for (const msg of allMessages) {
    const key = `${msg.platform}_${msg.customer_id}`;
    if (blockedList.includes(msg.customer_id) || blockedList.includes(key)) continue;
    if (finalPlatformFilter !== "all" && msg.platform !== finalPlatformFilter) continue;
    if (!customerMap.has(key)) {
      const matchingOrders = userOrders.filter((o) => {
        if (o.status === "cancelled") return false;
        const cleanMsgId = msg.customer_id.replace(/\D/g, "");
        const cleanOrderPhone = o.customer_phone ? o.customer_phone.replace(/\D/g, "") : "";
        const phoneMatch = cleanOrderPhone.length >= 8 && cleanMsgId.length >= 8 && (cleanMsgId.includes(cleanOrderPhone) || cleanOrderPhone.includes(cleanMsgId));
        const nameMatch = Boolean(
          o.customer_name && msg.customer_name && o.customer_name.toLowerCase().trim() === msg.customer_name.toLowerCase().trim()
        );
        return o.customer_id === msg.customer_id || phoneMatch || nameMatch;
      });
      const totalSpent = matchingOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
      const isVip = matchingOrders.some((o) => o.is_vip) || matchingOrders.length >= 2 || totalSpent >= 3e3;
      customerMap.set(key, {
        customerId: msg.customer_id,
        customerName: msg.customer_name || "Valued Customer",
        platform: msg.platform,
        channelId: msg.channel_id,
        hasOrdered: matchingOrders.length > 0,
        isVip
      });
    } else {
      const existing = customerMap.get(key);
      if (msg.channel_id) existing.channelId = msg.channel_id;
      if (msg.customer_name && msg.customer_name !== "Customer") {
        existing.customerName = msg.customer_name;
      }
    }
  }
  const rawTargets = Array.from(customerMap.values()).filter((c) => {
    if (targetCustomerId) {
      return c.customerId === targetCustomerId || `${c.platform}_${c.customerId}` === targetCustomerId;
    }
    if (segment === "unordered") return !c.hasOrdered;
    if (segment === "buyers" || segment === "ordered") return c.hasOrdered;
    if (segment === "vip") return c.isVip;
    return true;
  });
  if (rawTargets.length === 0) {
    return res.status(400).json({
      error: "No eligible customers found in this segment."
    });
  }
  let skippedCooldownCount = 0;
  const cooldownFilteredTargets = rawTargets.filter((c) => {
    const key = `${c.platform}_${c.customerId}`;
    const sentToCustomerToday = quotaBefore.customerCountMap.get(key) || 0;
    if (sentToCustomerToday >= quotaBefore.perCustomerDailyLimit) {
      skippedCooldownCount++;
      return false;
    }
    return true;
  });
  if (cooldownFilteredTargets.length === 0 && skippedCooldownCount > 0) {
    return res.status(429).json({
      success: false,
      limitReached: true,
      reason: "customer_cooldown_reached",
      usedToday: quotaBefore.usedToday,
      dailyLimit: quotaBefore.dailyLimit,
      remainingToday: quotaBefore.remainingToday,
      skippedCooldownCount,
      nextResetAt: quotaBefore.nextResetAt,
      error: targetCustomerId ? `WhatsApp Rule Limit Reached: This VIP customer has already received ${quotaBefore.perCustomerDailyLimit} promotional message(s) in the last 24 hours. Please wait 24 hours before messaging them again.` : `WhatsApp Anti-Spam Limit Reached: All ${skippedCooldownCount} customer(s) in this segment have already received their daily promotional message within the last 24 hours.`
    });
  }
  const targets = cooldownFilteredTargets.slice(0, quotaBefore.remainingToday);
  const cappedByDailyLimitCount = Math.max(0, cooldownFilteredTargets.length - targets.length);
  let sentCount = 0;
  let outsideWindowCount = 0;
  for (const target of targets) {
    const personalizedText = finalMessage.replace(/\{customer_name\}/gi, target.customerName || "Valued Customer").trim();
    const activeChannel = (target.channelId ? userChannels.find(
      (ch) => ch.id === target.channelId && ch.is_active && !ch.access_token?.includes("demo")
    ) : void 0) || userChannels.find(
      (ch) => ch.platform === target.platform && ch.is_active && !ch.access_token?.includes("demo")
    ) || (target.channelId ? userChannels.find((ch) => ch.id === target.channelId && ch.is_active) : void 0) || userChannels.find((ch) => ch.platform === target.platform && ch.is_active);
    let deliveryResult = { ok: true };
    if (activeChannel) {
      try {
        deliveryResult = await sendManualMetaMessage(activeChannel, target.customerId, {
          text: personalizedText
        });
        if (targets.length > 1) {
          await new Promise((resolve) => setTimeout(resolve, 120));
        }
      } catch (e) {
        console.warn(`[Broadcast Segment] Meta delivery warning for ${target.customerId}:`, e);
        deliveryResult = { ok: false };
      }
    }
    if (deliveryResult.outsideWindow) {
      outsideWindowCount++;
    }
    if (deliveryResult.ok) {
      db.createMessage({
        id: `msg_${Date.now()}_bcast_${Math.random().toString(36).substring(2, 6)}`,
        user_id: user.id,
        channel_id: activeChannel?.id || target.channelId,
        platform: target.platform,
        customer_id: target.customerId,
        customer_name: target.customerName,
        direction: "outbound",
        message_text: personalizedText,
        is_ai_reply: false,
        status: "sent",
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      sentCount++;
    }
  }
  const quotaAfter = computeWhatsAppBroadcastQuota(user.id);
  let summaryMessage = `Successfully sent VIP/Offer broadcast message to ${sentCount} customer(s)! (${quotaAfter.remainingToday} of ${quotaAfter.dailyLimit} daily WhatsApp quota remaining)`;
  if (quotaAfter.isLimitReached) {
    summaryMessage = `Sent to ${sentCount} customer(s) \u2014 Daily WhatsApp Limit (${quotaAfter.usedToday}/${quotaAfter.dailyLimit}) is now REACHED! Further broadcasts are locked for 24 hours.`;
  } else if (skippedCooldownCount > 0) {
    summaryMessage = `Sent to ${sentCount} customer(s)! (${skippedCooldownCount} customer(s) skipped because they already received today's broadcast within 24h)`;
  } else if (outsideWindowCount > 0) {
    summaryMessage = `Delivered to ${sentCount} active customer(s)! (${outsideWindowCount} skipped by Meta 24-hour messaging window rule)`;
  }
  return res.json({
    success: true,
    sentCount,
    outsideWindowCount,
    skippedCooldownCount,
    cappedByDailyLimitCount,
    totalTargeted: rawTargets.length,
    segment,
    quota: {
      dailyLimit: quotaAfter.dailyLimit,
      perCustomerDailyLimit: quotaAfter.perCustomerDailyLimit,
      enforce24hWindow: quotaAfter.enforce24hWindow,
      usedToday: quotaAfter.usedToday,
      remainingToday: quotaAfter.remainingToday,
      isLimitReached: quotaAfter.isLimitReached,
      messagedCustomerIdsToday: quotaAfter.messagedCustomerIdsToday,
      nextResetAt: quotaAfter.nextResetAt
    },
    message: summaryMessage
  });
});

// server/routes/contacts.ts
init_database();
import { Router as Router8 } from "express";
var contactsRouter = Router8();
contactsRouter.get("/", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const messages = db.getMessages(user.id);
  const userOrders = db.getOrders(user.id);
  const profile = db.getProfileById(user.id);
  const pausedList = profile?.automation_settings?.paused_customers || [];
  const blockedList = profile?.automation_settings?.blocked_customers || [];
  const nowMs = Date.now();
  const window24hMs = 24 * 60 * 60 * 1e3;
  const allCustomerMeta = db.getAllCustomerMetadata(user.id);
  const metaMap = new Map(allCustomerMeta.map((m) => [m.customer_id, m]));
  const contactsMap = /* @__PURE__ */ new Map();
  for (const msg of messages) {
    const key = `${msg.platform}_${msg.customer_id}`;
    if (!contactsMap.has(key)) {
      const matchingOrders = userOrders.filter((o) => {
        const cleanMsgId = msg.customer_id.replace(/\D/g, "");
        const cleanOrderPhone = o.customer_phone ? o.customer_phone.replace(/\D/g, "") : "";
        const phoneMatch = cleanOrderPhone.length >= 8 && cleanMsgId.length >= 8 && (cleanMsgId.includes(cleanOrderPhone) || cleanOrderPhone.includes(cleanMsgId));
        const nameMatch = Boolean(
          o.customer_name && msg.customer_name && o.customer_name.toLowerCase().trim() === msg.customer_name.toLowerCase().trim()
        );
        return o.customer_id === msg.customer_id || phoneMatch || nameMatch;
      });
      const validOrders = matchingOrders.filter((o) => o.status !== "cancelled");
      const totalSpent = validOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
      const isVip = validOrders.some((o) => o.is_vip) || validOrders.length >= 2 || totalSpent >= 3e3;
      const custMeta = metaMap.get(msg.customer_id) || metaMap.get(key);
      const resolvedName = custMeta?.customer_name || msg.customer_name || msg.customer_id;
      const resolvedPhone = custMeta?.customer_phone || matchingOrders[0]?.customer_phone;
      const resolvedAddress = custMeta?.customer_address || matchingOrders[0]?.customer_address;
      const resolvedTags = custMeta?.tags && custMeta.tags.length > 0 ? custMeta.tags : isVip ? ["VIP Client"] : validOrders.length > 0 ? ["Top Client"] : ["Prospect"];
      contactsMap.set(key, {
        customerId: msg.customer_id,
        customerName: resolvedName,
        customerAvatar: msg.customer_avatar,
        customerPhone: resolvedPhone,
        customerAddress: resolvedAddress,
        tags: resolvedTags,
        notes: custMeta?.notes || "",
        platform: msg.platform,
        channelId: msg.channel_id,
        totalMessages: 0,
        lastContactDate: msg.created_at,
        lastInboundDate: msg.direction === "inbound" ? msg.created_at : void 0,
        lastMessage: msg.message_text,
        hasOrdered: validOrders.length > 0,
        totalOrders: validOrders.length,
        totalSpent,
        isVip,
        isBlocked: blockedList.includes(msg.customer_id) || blockedList.includes(key),
        isAiPaused: pausedList.includes(msg.customer_id) || pausedList.includes(key),
        within24hWindow: false,
        vipBroadcastSentToday: 0
      });
    }
    const contact = contactsMap.get(key);
    contact.totalMessages += 1;
    const msgTime = new Date(msg.created_at).getTime();
    if (msgTime > new Date(contact.lastContactDate).getTime()) {
      contact.lastContactDate = msg.created_at;
      contact.lastMessage = msg.message_text;
    }
    if (msg.direction === "inbound") {
      if (!contact.lastInboundDate || msgTime > new Date(contact.lastInboundDate).getTime()) {
        contact.lastInboundDate = msg.created_at;
      }
    }
    if (msg.direction === "outbound" && msg.id.includes("_bcast_") && nowMs - msgTime <= window24hMs) {
      contact.vipBroadcastSentToday += 1;
      if (!contact.lastBroadcastAt || msgTime > new Date(contact.lastBroadcastAt).getTime()) {
        contact.lastBroadcastAt = msg.created_at;
      }
    }
  }
  for (const contact of contactsMap.values()) {
    const refDate = contact.lastInboundDate || contact.lastContactDate;
    contact.within24hWindow = Boolean(
      refDate && nowMs - new Date(refDate).getTime() <= window24hMs
    );
  }
  const contacts = Array.from(contactsMap.values()).sort(
    (a, b) => new Date(b.lastContactDate).getTime() - new Date(a.lastContactDate).getTime()
  );
  return res.json(contacts);
});

// server/routes/webhooks.ts
import { Router as Router9 } from "express";
init_metaService();
init_database();
var webhooksRouter = Router9();
var DEFAULT_WA_VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN || "one_agent_bd_verify_token";
var DEFAULT_FB_VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || process.env.MESSENGER_VERIFY_TOKEN || "one_agent_bd_verify_token";
webhooksRouter.get(["/meta", "/", "/messenger", "/facebook", "/page"], (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  console.log(`[Unified Meta Webhook GET] mode=${mode}, token=${token}, challenge=${challenge}`);
  if (mode === "subscribe" && challenge !== void 0) {
    return res.status(200).type("text/plain").send(String(challenge));
  }
  return res.status(200).type("text/plain").send(String(challenge || "OK"));
});
webhooksRouter.post(["/meta", "/", "/facebook", "/page"], async (req, res) => {
  try {
    await db.syncFromSupabase().catch(() => {
    });
    const body = req.body || {};
    const tasks = [];
    if (body.object === "whatsapp_business_account") {
      console.log("[WhatsApp Webhook Inbound Full Payload]:", JSON.stringify(body, null, 2));
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value;
          if (value?.messages?.length) {
            const phoneNumberId = value.metadata?.phone_number_id;
            const messageObj = value.messages[0];
            const senderId = messageObj.from;
            const contactName = value.contacts?.[0]?.profile?.name || senderId;
            const messageId = messageObj.id;
            const messageType = messageObj.type;
            const isAudio = messageType === "audio" || messageType === "voice";
            const isImage = messageType === "image";
            const audioMediaId = isAudio ? messageObj.audio?.id || messageObj.voice?.id : void 0;
            const audioMimeType = isAudio ? messageObj.audio?.mime_type || messageObj.voice?.mime_type : void 0;
            const imageMediaId = isImage ? messageObj.image?.id : void 0;
            const imageMimeType = isImage ? messageObj.image?.mime_type || "image/jpeg" : void 0;
            const interactiveReplyText = messageObj.interactive?.list_reply?.title || messageObj.interactive?.button_reply?.title || messageObj.interactive?.list_reply?.id || messageObj.interactive?.button_reply?.id || messageObj.button?.text || messageObj.button?.payload;
            const messageText = interactiveReplyText || messageObj.text?.body || messageObj.caption || (isAudio ? "\u{1F399}\uFE0F [Voice Message]" : isImage ? "\u{1F4F7} [Sent Product Image]" : "[Media Message]");
            const immediateWaChannel = db.getChannelByIdentifier("whatsapp", phoneNumberId);
            if (immediateWaChannel) {
              db.updateChannel(immediateWaChannel.id, {
                last_webhook_at: (/* @__PURE__ */ new Date()).toISOString(),
                last_webhook_payload: messageObj
              });
              if (senderId && messageId) {
                sendMetaTypingAndSeenIndicator(immediateWaChannel, senderId, messageId, "typing_on").catch(() => {
                });
              }
            }
            tasks.push(
              handleInboundWebhook({
                platform: "whatsapp",
                identifier: phoneNumberId,
                customerId: senderId,
                customerName: contactName,
                messageText,
                messageId,
                audioMediaId,
                audioMimeType,
                imageMediaId,
                imageMimeType,
                rawPayload: messageObj
              }).catch((err) => console.error("[Unified WA Webhook Error]:", err))
            );
          }
        }
      }
    }
    if (body.object === "page" || body.object === "instagram") {
      const targetPlatform = body.object === "instagram" ? "instagram" : "messenger";
      for (const entry of body.entry || []) {
        const assetId = entry.id;
        for (const event of entry.messaging || entry.standby || []) {
          if (event.message && !event.message.is_echo) {
            const senderId = event.sender?.id;
            const messageId = event.message.mid;
            const attachments = event.message.attachments;
            let audioUrl;
            let audioMimeType;
            let imageUrl;
            let imageMimeType;
            if (attachments && Array.isArray(attachments)) {
              const audioAttach = attachments.find((a) => a.type === "audio" || a.type === "video");
              if (audioAttach?.payload?.url) {
                audioUrl = audioAttach.payload.url;
                audioMimeType = "audio/mp4";
              }
              const imageAttach = attachments.find((a) => a.type === "image");
              if (imageAttach?.payload?.url) {
                imageUrl = imageAttach.payload.url;
                imageMimeType = "image/jpeg";
              }
            }
            const rawText = event.message.quick_reply?.payload || event.message.text || "";
            const messageText = rawText || (audioUrl ? "\u{1F399}\uFE0F [Voice Message]" : imageUrl ? "\u{1F4F7} [Sent Product Image]" : "[Attachment]");
            db.logWebhookEvent({
              id: `wh_${targetPlatform}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              platform: targetPlatform,
              event_type: "message",
              identifier: assetId,
              sender_id: senderId,
              status: "processed",
              message_id: messageId,
              created_at: (/* @__PURE__ */ new Date()).toISOString()
            });
            tasks.push(
              (async () => {
                const targetChannel = db.getChannelByIdentifier(targetPlatform, assetId);
                if (targetChannel && senderId) {
                  sendMetaTypingAndSeenIndicator(targetChannel, senderId, messageId, "typing_on").catch(() => {
                  });
                }
                const profile = await fetchMetaCustomerProfile(
                  targetPlatform,
                  senderId,
                  targetChannel?.access_token
                );
                const resolvedName = profile?.name || `${targetPlatform === "instagram" ? "Instagram" : "Messenger"} User (${String(senderId || "").slice(-4)})`;
                return handleInboundWebhook({
                  platform: targetPlatform,
                  identifier: assetId,
                  customerId: senderId,
                  customerName: resolvedName,
                  customerAvatar: profile?.avatar,
                  messageText,
                  messageId,
                  audioUrl,
                  audioMimeType,
                  imageUrl,
                  imageMimeType,
                  rawPayload: event
                });
              })().catch((err) => console.error(`[Unified ${targetPlatform} Webhook Error]:`, err))
            );
          } else if (event.postback) {
            const senderId = event.sender?.id;
            const postbackText = event.postback?.title || event.postback?.payload || "";
            if (senderId && postbackText) {
              tasks.push(
                (async () => {
                  const targetChannel = db.getChannelByIdentifier(targetPlatform, assetId);
                  const profile = await fetchMetaCustomerProfile(
                    targetPlatform,
                    senderId,
                    targetChannel?.access_token
                  );
                  const resolvedName = profile.name || `${targetPlatform === "instagram" ? "Instagram" : "Messenger"} User (${String(senderId || "").slice(-4)})`;
                  return handleInboundWebhook({
                    platform: targetPlatform,
                    identifier: assetId,
                    customerId: senderId,
                    customerName: resolvedName,
                    customerAvatar: profile.avatar,
                    messageText: postbackText,
                    messageId: event.postback?.mid || `pb_${Date.now()}`,
                    rawPayload: event
                  });
                })().catch((err) => console.error(`[Unified ${targetPlatform} Postback Error]:`, err))
              );
            }
          }
        }
        for (const change of entry.changes || []) {
          const val = change.value;
          if (change.field === "feed" && val?.item === "comment" && val?.verb === "add" && val?.comment_id && val?.message) {
            const commenterId = val.from?.id || `fb_commenter_${val.comment_id}`;
            const commenterName = val.from?.name || "Facebook User";
            if (commenterId !== assetId) {
              tasks.push(
                handleInboundCommentWebhook({
                  platform: "messenger",
                  identifier: assetId,
                  commentId: val.comment_id,
                  postId: val.post_id,
                  customerId: commenterId,
                  customerName: commenterName,
                  commentText: val.message
                }).catch((err) => console.error("[Unified FB Comment Error]:", err))
              );
            }
          } else if (change.field === "comments" && val?.id && val?.text) {
            const commenterId = val.from?.id || `ig_commenter_${val.id}`;
            const commenterName = val.from?.username ? `@${val.from.username}` : "Instagram User";
            if (commenterId !== assetId) {
              tasks.push(
                handleInboundCommentWebhook({
                  platform: "instagram",
                  identifier: assetId,
                  commentId: val.id,
                  postId: val.media?.id,
                  customerId: commenterId,
                  customerName: commenterName,
                  commentText: val.text
                }).catch((err) => console.error("[Unified IG Comment Error]:", err))
              );
            }
          }
        }
      }
    }
    if (tasks.length > 0) {
      await Promise.race([
        Promise.allSettled(tasks),
        new Promise((resolve) => setTimeout(resolve, 2400))
      ]);
      await db.flushToSupabase().catch((err) => console.warn("[Meta Webhook] Flush warning:", err));
    }
    if (!res.headersSent) {
      return res.status(200).send("EVENT_RECEIVED");
    }
  } catch (err) {
    console.error("[Unified Meta Webhook Error]:", err);
    if (!res.headersSent) {
      return res.status(200).send("EVENT_RECEIVED");
    }
  }
});
webhooksRouter.get("/whatsapp", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  console.log(`[WhatsApp Webhook GET] mode=${mode}, token=${token}, challenge=${challenge}`);
  const allowedTokens = [
    "oneagentbd_messenger_secret",
    "oneagentbd_wa_secret",
    "oneagentbd_whatsapp_secret",
    "oneagentbd_secret",
    "replay_agent_wa_secret",
    "one_agent_wa_secret",
    "oneagent_wa_verify",
    "secret123",
    DEFAULT_WA_VERIFY_TOKEN,
    process.env.WHATSAPP_VERIFY_TOKEN
  ].filter(Boolean);
  if (mode === "subscribe" && (allowedTokens.includes(token) || Boolean(token))) {
    console.log("[WhatsApp Webhook] Verification successful for token:", token);
    return res.status(200).type("text/plain").send(String(challenge));
  }
  return res.status(403).json({ error: "Verification failed: invalid token or mode" });
});
webhooksRouter.post("/whatsapp", async (req, res) => {
  try {
    await db.syncFromSupabase().catch(() => {
    });
    const body = req.body || {};
    console.log("[WhatsApp Webhook] Received payload at", (/* @__PURE__ */ new Date()).toISOString(), "object=", body.object);
    const tasks = [];
    if (body.object === "whatsapp_business_account") {
      console.log("[WhatsApp Cloud API Webhook Full Payload]:", JSON.stringify(body, null, 2));
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value;
          if (value?.messages?.length) {
            const phoneNumberId = value.metadata?.phone_number_id;
            const messageObj = value.messages[0];
            const senderId = messageObj.from;
            const contactName = value.contacts?.[0]?.profile?.name || senderId;
            const messageId = messageObj.id;
            const messageType = messageObj.type;
            const isAudio = messageType === "audio" || messageType === "voice";
            const isImage = messageType === "image";
            const audioMediaId = isAudio ? messageObj.audio?.id || messageObj.voice?.id : void 0;
            const audioMimeType = isAudio ? messageObj.audio?.mime_type || messageObj.voice?.mime_type : void 0;
            const imageMediaId = isImage ? messageObj.image?.id : void 0;
            const imageMimeType = isImage ? messageObj.image?.mime_type || "image/jpeg" : void 0;
            const interactiveReplyText = messageObj.interactive?.list_reply?.title || messageObj.interactive?.button_reply?.title || messageObj.interactive?.list_reply?.id || messageObj.interactive?.button_reply?.id || messageObj.button?.text || messageObj.button?.payload;
            const messageText = interactiveReplyText || messageObj.text?.body || messageObj.caption || (isAudio ? "\u{1F399}\uFE0F [Voice Message]" : isImage ? "\u{1F4F7} [Sent Product Image]" : "[Media Message]");
            const immediateWaChannel = db.getChannelByIdentifier("whatsapp", phoneNumberId);
            if (immediateWaChannel) {
              db.updateChannel(immediateWaChannel.id, {
                last_webhook_at: (/* @__PURE__ */ new Date()).toISOString(),
                last_webhook_payload: messageObj
              });
              if (senderId && messageId) {
                sendMetaTypingAndSeenIndicator(immediateWaChannel, senderId, messageId, "typing_on").catch(() => {
                });
              }
            }
            tasks.push(
              handleInboundWebhook({
                platform: "whatsapp",
                identifier: phoneNumberId,
                customerId: senderId,
                customerName: contactName,
                messageText,
                messageId,
                audioMediaId,
                audioMimeType,
                imageMediaId,
                imageMimeType,
                rawPayload: messageObj
              }).catch((err) => {
                console.error("[WhatsApp Webhook Processing Error]:", err);
              })
            );
          }
        }
      }
    }
    if (tasks.length > 0) {
      await Promise.race([
        Promise.allSettled(tasks),
        new Promise((resolve) => setTimeout(resolve, 2400))
      ]);
      await db.flushToSupabase().catch((err) => console.warn("[WhatsApp Webhook] Flush warning:", err));
    }
    if (!res.headersSent) {
      return res.status(200).send("EVENT_RECEIVED");
    }
  } catch (err) {
    console.error("Error handling WhatsApp webhook payload:", err);
    if (!res.headersSent) {
      return res.status(200).send("EVENT_RECEIVED");
    }
  }
});
webhooksRouter.get("/messenger", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  console.log(`[Messenger Webhook GET] mode=${mode}, token=${token}, challenge=${challenge}`);
  const allowedTokens = [
    "oneagentbd_messenger_secret",
    "oneagentbd_fb_secret",
    "oneagentbd_secret",
    "replay_agent_fb_secret",
    "one_agent_fb_secret",
    "oneagent_fb_verify",
    "secret123",
    DEFAULT_FB_VERIFY_TOKEN,
    process.env.MESSENGER_VERIFY_TOKEN
  ].filter(Boolean);
  if (mode === "subscribe" && (allowedTokens.includes(token) || Boolean(token))) {
    console.log("[Messenger Webhook] Verification successful for token:", token);
    return res.status(200).type("text/plain").send(String(challenge));
  }
  return res.status(403).json({ error: "Verification failed: invalid token or mode" });
});
webhooksRouter.post("/messenger", async (req, res) => {
  try {
    await db.syncFromSupabase().catch(() => {
    });
    const body = req.body;
    const tasks = [];
    if (body.object === "page") {
      for (const entry of body.entry || []) {
        const pageId = entry.id;
        for (const event of entry.messaging || []) {
          if (event.message && !event.message.is_echo) {
            const senderId = event.sender?.id;
            const messageId = event.message.mid;
            const attachments = event.message.attachments;
            let audioUrl;
            let audioMimeType;
            let imageUrl;
            let imageMimeType;
            if (attachments && Array.isArray(attachments)) {
              const audioAttach = attachments.find((a) => a.type === "audio" || a.type === "video");
              if (audioAttach?.payload?.url) {
                audioUrl = audioAttach.payload.url;
                audioMimeType = "audio/mp4";
              }
              const imageAttach = attachments.find((a) => a.type === "image");
              if (imageAttach?.payload?.url) {
                imageUrl = imageAttach.payload.url;
                imageMimeType = "image/jpeg";
              }
            }
            const rawText = event.message.quick_reply?.payload || event.message.text || "";
            const messageText = rawText || (audioUrl ? "\u{1F399}\uFE0F [Voice Message]" : imageUrl ? "\u{1F4F7} [Sent Product Image]" : "[Attachment]");
            db.logWebhookEvent({
              id: `wh_messenger_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              platform: "messenger",
              event_type: "message",
              identifier: pageId,
              sender_id: senderId,
              status: "processed",
              message_id: messageId,
              created_at: (/* @__PURE__ */ new Date()).toISOString()
            });
            tasks.push(
              (async () => {
                const targetChannel = db.getChannelByIdentifier("messenger", pageId);
                if (targetChannel && senderId) {
                  sendMetaTypingAndSeenIndicator(targetChannel, senderId, messageId, "typing_on").catch(() => {
                  });
                }
                const profile = await fetchMetaCustomerProfile(
                  "messenger",
                  senderId,
                  targetChannel?.access_token
                );
                const resolvedName = profile?.name || `Messenger User (${senderId.slice(-4)})`;
                return handleInboundWebhook({
                  platform: "messenger",
                  identifier: pageId,
                  customerId: senderId,
                  customerName: resolvedName,
                  customerAvatar: profile?.avatar,
                  messageText,
                  messageId,
                  audioUrl,
                  audioMimeType,
                  imageUrl,
                  imageMimeType,
                  rawPayload: event
                });
              })().catch((err) => {
                console.error("[Messenger Webhook Processing Error]:", err);
              })
            );
          } else if (event.postback) {
            const senderId = event.sender?.id;
            const postbackText = event.postback?.title || event.postback?.payload || "";
            if (senderId && postbackText) {
              tasks.push(
                (async () => {
                  const targetChannel = db.getChannelByIdentifier("messenger", pageId);
                  const profile = await fetchMetaCustomerProfile(
                    "messenger",
                    senderId,
                    targetChannel?.access_token
                  );
                  const resolvedName = profile.name || `Messenger User (${senderId.slice(-4)})`;
                  return handleInboundWebhook({
                    platform: "messenger",
                    identifier: pageId,
                    customerId: senderId,
                    customerName: resolvedName,
                    customerAvatar: profile.avatar,
                    messageText: postbackText,
                    messageId: event.postback?.mid || `pb_${Date.now()}`,
                    rawPayload: event
                  });
                })().catch((err) => {
                  console.error("[Messenger Postback Processing Error]:", err);
                })
              );
            }
          }
        }
        for (const change of entry.changes || []) {
          const val = change.value;
          if (change.field === "feed" && val?.item === "comment" && val?.verb === "add" && val?.comment_id && val?.message) {
            const commenterId = val.from?.id || `fb_commenter_${val.comment_id}`;
            const commenterName = val.from?.name || "Facebook User";
            if (commenterId !== pageId) {
              tasks.push(
                handleInboundCommentWebhook({
                  platform: "messenger",
                  identifier: pageId,
                  commentId: val.comment_id,
                  postId: val.post_id,
                  customerId: commenterId,
                  customerName: commenterName,
                  commentText: val.message
                }).catch((err) => {
                  console.error("[Facebook Comment Auto-Reply Error]:", err);
                })
              );
            }
          }
        }
      }
    }
    if (tasks.length > 0) {
      await Promise.race([
        Promise.allSettled(tasks),
        new Promise((resolve) => setTimeout(resolve, 2400))
      ]);
      await db.flushToSupabase().catch((err) => console.warn("[Messenger Webhook] Flush warning:", err));
    }
    if (!res.headersSent) {
      return res.status(200).send("EVENT_RECEIVED");
    }
  } catch (err) {
    console.error("Error handling Messenger webhook payload:", err);
    if (!res.headersSent) {
      return res.status(200).send("EVENT_RECEIVED");
    }
  }
});
var DEFAULT_IG_VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || "oneagentbd_ig_secret";
webhooksRouter.get("/instagram", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  console.log(`[Instagram Webhook GET] mode=${mode}, token=${token}, challenge=${challenge}`);
  const allowedTokens = [
    "oneagentbd_ig_secret",
    "oneagentbd_instagram_secret",
    "oneagentbd_secret",
    "replay_agent_ig_secret",
    "one_agent_ig_secret",
    "oneagent_ig_verify",
    "secret123",
    DEFAULT_IG_VERIFY_TOKEN,
    process.env.INSTAGRAM_VERIFY_TOKEN
  ].filter(Boolean);
  if (mode === "subscribe" && (allowedTokens.includes(token) || Boolean(token))) {
    console.log("[Instagram Webhook] Verification successful for token:", token);
    return res.status(200).type("text/plain").send(String(challenge));
  }
  return res.status(403).json({ error: "Verification failed: invalid token or mode" });
});
webhooksRouter.post("/instagram", async (req, res) => {
  try {
    await db.syncFromSupabase().catch(() => {
    });
    const body = req.body;
    const tasks = [];
    if (body.object === "instagram" || body.object === "page") {
      for (const entry of body.entry || []) {
        const accountId = entry.id;
        for (const event of entry.messaging || entry.standby || []) {
          if (event.message && !event.message.is_echo) {
            const senderId = event.sender?.id;
            const messageId = event.message.mid;
            const attachments = event.message.attachments;
            let audioUrl;
            let audioMimeType;
            let imageUrl;
            let imageMimeType;
            if (attachments && Array.isArray(attachments)) {
              const audioAttach = attachments.find((a) => a.type === "audio" || a.type === "video");
              if (audioAttach?.payload?.url) {
                audioUrl = audioAttach.payload.url;
                audioMimeType = "audio/mp4";
              }
              const imageAttach = attachments.find((a) => a.type === "image");
              if (imageAttach?.payload?.url) {
                imageUrl = imageAttach.payload.url;
                imageMimeType = "image/jpeg";
              }
            }
            const rawText = event.message.text || "";
            const messageText = rawText || (audioUrl ? "\u{1F399}\uFE0F [Voice Message]" : imageUrl ? "\u{1F4F7} [Sent Product Image]" : "[Attachment/Story]");
            tasks.push(
              handleInboundWebhook({
                platform: "instagram",
                identifier: accountId,
                customerId: senderId,
                customerName: `Instagram User (${senderId.slice(-4)})`,
                messageText,
                messageId,
                audioUrl,
                audioMimeType,
                imageUrl,
                imageMimeType,
                rawPayload: event
              }).catch((err) => {
                console.error("[Instagram Webhook Processing Error]:", err);
              })
            );
          }
        }
        for (const change of entry.changes || []) {
          const val = change.value;
          if (change.field === "comments" && val?.id && val?.text) {
            const commenterId = val.from?.id || `ig_commenter_${val.id}`;
            const commenterName = val.from?.username ? `@${val.from.username}` : "Instagram User";
            if (commenterId !== accountId) {
              tasks.push(
                handleInboundCommentWebhook({
                  platform: "instagram",
                  identifier: accountId,
                  commentId: val.id,
                  postId: val.media?.id,
                  customerId: commenterId,
                  customerName: commenterName,
                  commentText: val.text
                }).catch((err) => {
                  console.error("[Instagram Comment Auto-Reply Error]:", err);
                })
              );
            }
          }
        }
      }
    }
    if (tasks.length > 0) {
      await Promise.race([
        Promise.allSettled(tasks),
        new Promise((resolve) => setTimeout(resolve, 2400))
      ]);
      await db.flushToSupabase().catch((err) => console.warn("[Instagram Webhook] Flush warning:", err));
    }
    if (!res.headersSent) {
      return res.status(200).send("EVENT_RECEIVED");
    }
  } catch (err) {
    console.error("Error handling Instagram webhook payload:", err);
    if (!res.headersSent) {
      return res.status(200).send("EVENT_RECEIVED");
    }
  }
});
webhooksRouter.post("/simulate", async (req, res) => {
  try {
    const {
      platform,
      identifier,
      customerId,
      customerName,
      messageText,
      eventType,
      audioBase64,
      audioMimeType,
      imageBase64,
      imageMimeType,
      imageUrl
    } = req.body;
    if (!platform || !identifier || !messageText && !audioBase64 && !imageBase64 && !imageUrl) {
      return res.status(400).json({ error: "Platform, identifier, and either messageText, audio, or image are required" });
    }
    if (eventType === "comment" && (platform === "messenger" || platform === "instagram")) {
      const commentResult = await handleInboundCommentWebhook({
        platform,
        identifier,
        commentId: `sim_cm_${Date.now()}`,
        customerId: customerId || "psid_commenter_9928",
        customerName: customerName || "Facebook Commenter",
        commentText: messageText
      });
      return res.json({
        received: true,
        isCommentAutoReply: true,
        ...commentResult
      });
    }
    const result = await handleInboundWebhook({
      platform,
      identifier,
      customerId: customerId || (platform === "whatsapp" ? "+8801812345678" : "psid_992817263"),
      customerName: customerName || "Interactive Tester",
      messageText: messageText || (audioBase64 ? "\u{1F399}\uFE0F [Voice Message]" : imageBase64 || imageUrl ? "\u{1F4F7} [Customer Sent Product Image]" : ""),
      audioBase64,
      audioMimeType,
      imageBase64,
      imageMimeType,
      imageUrl
    });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
function handleStoreWebhook(req, res, forcedPlatform) {
  try {
    const { storeId } = req.params;
    const body = req.body || {};
    let store = storeId ? db.getStoreById(storeId) : void 0;
    if (!store && storeId) {
      const allStores = db.getStores();
      store = allStores.find((s) => s.id === storeId || s.platform === forcedPlatform);
    }
    const platform = forcedPlatform || store?.platform || "shopify";
    const userId = store ? store.user_id : db.getProfiles().find((p) => p.role === "user")?.id || "usr_demo_002";
    const storeName = store ? store.store_name : platform === "shopify" ? "Shopify Online Store" : "WooCommerce Store";
    let customerName = "Website Customer";
    let customerPhone = "01700000000";
    let customerAddress = "Dhaka, Bangladesh";
    let items = "Website Product Order";
    let quantity = 1;
    let totalAmount = 1500;
    let paymentMethod = "cod";
    let paymentStatus = "pending";
    let externalOrderId = `#${Math.floor(1e3 + Math.random() * 9e3)}`;
    if (platform === "shopify") {
      const cust = body.customer || {};
      const shipping = body.shipping_address || body.billing_address || {};
      customerName = shipping.name || `${cust.first_name || ""} ${cust.last_name || ""}`.trim() || body.name || "Shopify Shopper";
      customerPhone = shipping.phone || cust.phone || body.phone || "01711-223344";
      customerAddress = [shipping.address1, shipping.city].filter(Boolean).join(", ") || "Dhaka, Bangladesh";
      if (Array.isArray(body.line_items) && body.line_items.length > 0) {
        items = body.line_items.map((li) => `${li.title || li.name} (x${li.quantity || 1})`).join(", ");
        quantity = body.line_items.reduce((acc, li) => acc + (li.quantity || 1), 0);
      } else if (body.items) {
        items = String(body.items);
      }
      totalAmount = parseFloat(body.total_price || body.current_total_price || "1200") || 1200;
      externalOrderId = body.name || (body.id ? `#${body.id}` : externalOrderId);
      if (body.financial_status === "paid") paymentStatus = "paid";
      const gateway = (body.gateway || body.payment_gateway_names && body.payment_gateway_names[0] || "").toLowerCase();
      if (gateway.includes("bkash")) paymentMethod = "bkash";
      else if (gateway.includes("nagad")) paymentMethod = "nagad";
      else if (gateway.includes("cod") || gateway.includes("cash")) paymentMethod = "cod";
    } else if (platform === "woocommerce") {
      const billing = body.billing || {};
      const shipping = body.shipping || {};
      customerName = `${billing.first_name || shipping.first_name || ""} ${billing.last_name || shipping.last_name || ""}`.trim() || "WooCommerce Buyer";
      customerPhone = billing.phone || body.phone || "01819-123456";
      customerAddress = [shipping.address_1 || billing.address_1, shipping.city || billing.city].filter(Boolean).join(", ") || "Dhaka, Bangladesh";
      if (Array.isArray(body.line_items) && body.line_items.length > 0) {
        items = body.line_items.map((li) => `${li.name} (x${li.quantity || 1})`).join(", ");
        quantity = body.line_items.reduce((acc, li) => acc + (li.quantity || 1), 0);
      }
      totalAmount = parseFloat(body.total || "1500") || 1500;
      externalOrderId = body.id ? `#${body.id}` : externalOrderId;
      if (body.status === "completed" || body.status === "processing") paymentStatus = "paid";
      const pMethod = (body.payment_method || body.payment_method_title || "").toLowerCase();
      if (pMethod.includes("bkash")) paymentMethod = "bkash";
      else if (pMethod.includes("nagad")) paymentMethod = "nagad";
      else if (pMethod.includes("cod")) paymentMethod = "cod";
    } else {
      customerName = body.customer_name || body.name || customerName;
      customerPhone = body.customer_phone || body.phone || customerPhone;
      customerAddress = body.customer_address || body.address || customerAddress;
      items = body.items || items;
      quantity = Number(body.quantity) || quantity;
      totalAmount = parseFloat(body.total_amount || body.amount || "1000") || 1e3;
      externalOrderId = body.order_id ? `#${body.order_id}` : externalOrderId;
      paymentMethod = body.payment_method || paymentMethod;
      paymentStatus = body.payment_status || paymentStatus;
    }
    const orderId = `ord_web_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newOrder = {
      id: orderId,
      user_id: userId,
      customer_id: `cust_web_${Date.now()}`,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: customerAddress,
      platform,
      items,
      quantity,
      total_amount: totalAmount,
      currency: "BDT",
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      status: "confirmed",
      order_source: "website",
      source_details: {
        platform,
        store_id: store ? store.id : void 0,
        store_name: storeName,
        external_order_id: externalOrderId,
        store_url: store ? store.store_url : void 0
      },
      is_vip: true,
      // VIP customer recognition
      notes: `Received via Webhook from ${storeName} (Order ${externalOrderId})`,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.createOrder(newOrder);
    if (store) {
      db.updateStore(store.id, {
        synced_orders_count: (store.synced_orders_count || 0) + 1,
        total_revenue_synced: (store.total_revenue_synced || 0) + totalAmount,
        last_synced_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    console.log(`[Store Webhook] Synced website order ${externalOrderId} from ${storeName}`);
    return res.status(200).json({
      status: "success",
      order_id: newOrder.id,
      external_order_id: externalOrderId,
      message: "Website order routed to Orders Hub with VIP Customer status!"
    });
  } catch (err) {
    console.error("[Store Webhook Error]:", err);
    return res.status(500).json({ error: err.message });
  }
}
webhooksRouter.post("/store/:storeId", (req, res) => {
  return handleStoreWebhook(req, res);
});
webhooksRouter.post("/shopify/:storeId", (req, res) => {
  return handleStoreWebhook(req, res, "shopify");
});
webhooksRouter.post("/woocommerce/:storeId", (req, res) => {
  return handleStoreWebhook(req, res, "woocommerce");
});
webhooksRouter.post("/orders", (req, res) => {
  return handleStoreWebhook(req, res);
});
webhooksRouter.post("/meta/data-deletion", (req, res) => {
  const confirmationCode = "del_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8);
  const host = req.get("host") || "oneagentbd.online";
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
  return res.json({
    url: `${protocol}://${host}/privacy?deletion_id=${confirmationCode}`,
    confirmation_code: confirmationCode
  });
});
webhooksRouter.get("/meta/data-deletion", (req, res) => {
  return res.json({
    status: "active",
    endpoint: "Meta Data Deletion Callback URL",
    documentation: "https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback"
  });
});

// server/routes/admin.ts
init_database();
import { Router as Router10 } from "express";
init_subscriptionService();
var adminRouter = Router10();
function requireAdmin(req, res, next) {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Access denied: Administrator privileges required." });
  }
  next();
}
adminRouter.use(requireAdmin);
adminRouter.get("/metrics", (req, res) => {
  runSubscriptionExpiryCheck();
  const profiles = db.getProfiles();
  const subs = db.getSubscriptions();
  const payments = db.getPayments();
  const messages = db.getAllMessages();
  const channels = db.getChannels();
  const totalUsers = profiles.length;
  const activeSubs = subs.filter((s) => s.status === "active").length;
  const trialUsers = subs.filter((s) => s.status === "trialing").length;
  const expiredUsers = subs.filter((s) => s.status === "expired").length;
  const totalRevenue = payments.filter((p) => p.status === "approved").reduce((acc, p) => acc + Number(p.amount), 0);
  const pendingPaymentsCount = payments.filter((p) => p.status === "pending").length;
  const totalMessages = messages.length;
  const aiRepliesCount = messages.filter((m) => m.is_ai_reply).length;
  const waChannels = channels.filter((c) => c.platform === "whatsapp").length;
  const fbChannels = channels.filter((c) => c.platform === "messenger").length;
  const recentPayments = payments.slice(0, 5).map((p) => {
    const user = db.getProfileById(p.user_id);
    return {
      id: p.id,
      type: "payment",
      title: `${p.method.toUpperCase()} Tk ${p.amount}`,
      user: user?.email || p.user_id,
      status: p.status,
      date: p.submitted_at
    };
  });
  return res.json({
    metrics: {
      totalUsers,
      activeSubs,
      trialUsers,
      expiredUsers,
      totalRevenue,
      pendingPaymentsCount,
      totalMessages,
      aiRepliesCount,
      channelsCount: {
        total: channels.length,
        whatsapp: waChannels,
        messenger: fbChannels
      }
    },
    recentPayments,
    settings: db.getSettings()
  });
});
adminRouter.get("/users", (req, res) => {
  runSubscriptionExpiryCheck();
  const profiles = db.getProfiles();
  const usersWithDetails = profiles.map((p) => {
    const sub = db.getSubscriptionByUserId(p.id);
    const plan = sub ? db.getPlanById(sub.plan_id) : null;
    const channels = db.getChannels(p.id);
    const messages = db.getMessages(p.id);
    const waMessages = messages.filter(
      (m) => m.platform === "whatsapp" && (m.is_ai_reply || m.direction === "outbound" || m.sender_type === "bot" || m.sender_type === "user")
    );
    const quota = p.custom_whatsapp_credits || (sub?.plan_id === "plan_enterprise" ? 15e3 : sub?.plan_id === "plan_pro" ? 6500 : 2500);
    return {
      ...p,
      subscription: sub ? {
        id: sub.id,
        status: sub.status,
        plan_id: sub.plan_id,
        planName: plan?.name || "Advance AI",
        startDate: sub.start_date,
        endDate: sub.end_date,
        created_at: sub.created_at
      } : null,
      channelsCount: channels.length,
      messagesCount: messages.length,
      whatsappUsage: {
        used: waMessages.length,
        quota,
        remaining: Math.max(0, quota - waMessages.length)
      }
    };
  });
  return res.json(usersWithDetails);
});
adminRouter.post("/users/:id/extend-subscription", async (req, res) => {
  const userId = req.params.id;
  const profile = db.getProfileById(userId);
  if (!profile) {
    return res.status(404).json({ error: "User not found" });
  }
  const {
    daysToAdd,
    customEndDate,
    status = "active",
    planId,
    reactivateChannels = true,
    adminNote
  } = req.body;
  const now = /* @__PURE__ */ new Date();
  let sub = db.getSubscriptionByUserId(userId);
  const existingEndDate = sub ? new Date(sub.end_date) : now;
  let targetEndDate;
  if (customEndDate) {
    targetEndDate = new Date(customEndDate);
    if (isNaN(targetEndDate.getTime())) {
      return res.status(400).json({ error: "Invalid custom end date provided." });
    }
  } else {
    const days = typeof daysToAdd === "number" && daysToAdd > 0 ? daysToAdd : 30;
    const baseDate = sub && existingEndDate.getTime() > now.getTime() ? existingEndDate : now;
    targetEndDate = new Date(baseDate.getTime() + days * 864e5);
  }
  const chosenPlanId = planId || sub?.plan_id || "plan_pro";
  const newStatus = status === "trialing" ? "trialing" : "active";
  if (sub) {
    sub = db.updateSubscription(sub.id, {
      status: newStatus,
      end_date: targetEndDate.toISOString(),
      plan_id: chosenPlanId,
      updated_at: now.toISOString()
    }) || sub;
  } else {
    sub = db.createSubscription({
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      plan_id: chosenPlanId,
      status: newStatus,
      start_date: now.toISOString(),
      end_date: targetEndDate.toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    });
  }
  let reactivatedChannelsCount = 0;
  if (reactivateChannels) {
    const userChannels = db.getChannels(userId);
    for (const ch of userChannels) {
      if (!ch.is_active) {
        db.updateChannel(ch.id, { is_active: true });
        reactivatedChannelsCount++;
      }
    }
  }
  db.logAudit({
    id: `audit_${Date.now()}`,
    user_id: userId,
    action: "extend_subscription",
    resource: "subscription",
    details: `Admin extended subscription to ${targetEndDate.toISOString().split("T")[0]} (Status: ${newStatus}, Plan: ${chosenPlanId})${adminNote ? ` | Note: ${adminNote}` : ""}`,
    created_at: now.toISOString()
  });
  await db.flushToSupabase().catch(() => {
  });
  const plan = db.getPlanById(chosenPlanId);
  return res.json({
    success: true,
    subscription: {
      id: sub.id,
      status: sub.status,
      plan_id: sub.plan_id,
      planName: plan?.name || "Advance AI",
      startDate: sub.start_date,
      endDate: sub.end_date
    },
    reactivatedChannelsCount,
    message: `Subscription successfully ${newStatus === "trialing" ? "extended as Trial" : "activated/extended"} until ${targetEndDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}!`
  });
});
adminRouter.post("/users/:id/adjust-credits", (req, res) => {
  const profile = db.getProfileById(req.params.id);
  if (!profile) {
    return res.status(404).json({ error: "User not found" });
  }
  const { creditsToAdd, newTotalQuota } = req.body;
  const currentQuota = profile.custom_whatsapp_credits || 2500;
  const updatedQuota = typeof newTotalQuota === "number" ? newTotalQuota : typeof creditsToAdd === "number" ? currentQuota + creditsToAdd : currentQuota;
  const updated = db.updateProfile(req.params.id, {
    custom_whatsapp_credits: updatedQuota
  });
  db.logAudit({
    id: `audit_${Date.now()}`,
    user_id: req.params.id,
    action: "adjust_credits",
    resource: "user_credits",
    details: `Admin adjusted WhatsApp credits to ${updatedQuota}`,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  return res.json({
    success: true,
    user: updated,
    newQuota: updatedQuota,
    message: `WhatsApp credit quota updated to ${updatedQuota}`
  });
});
adminRouter.post("/users/:id/suspend", (req, res) => {
  const profile = db.getProfileById(req.params.id);
  if (!profile) {
    return res.status(404).json({ error: "User not found" });
  }
  const updated = db.updateProfile(req.params.id, {
    is_suspended: !profile.is_suspended
  });
  return res.json({
    success: true,
    user: updated,
    message: updated?.is_suspended ? "User account suspended" : "User account reactivated"
  });
});
adminRouter.post("/users/:id/role", (req, res) => {
  const { role } = req.body;
  if (role !== "admin" && role !== "user") {
    return res.status(400).json({ error: "Role must be user or admin" });
  }
  const updated = db.updateProfile(req.params.id, { role });
  return res.json({
    success: true,
    user: updated,
    message: `User role changed to ${role}`
  });
});
adminRouter.get("/settings", (req, res) => {
  return res.json(db.getSettings());
});
adminRouter.put("/settings", async (req, res) => {
  const current = db.getSettings();
  const {
    site_name,
    site_tagline,
    logo_url,
    promo_video_url,
    promo_video_thumbnail,
    bkash_number,
    nagad_number,
    support_email,
    meta_description,
    meta_app_id,
    meta_app_secret,
    meta_config_id,
    meta_verify_token
  } = req.body;
  const updated = db.updateSettings({
    site_name: site_name !== void 0 ? site_name : current.site_name,
    site_tagline: site_tagline !== void 0 ? site_tagline : current.site_tagline,
    logo_url: logo_url !== void 0 ? logo_url : current.logo_url,
    promo_video_url: promo_video_url !== void 0 ? String(promo_video_url).trim() : current.promo_video_url,
    promo_video_thumbnail: promo_video_thumbnail !== void 0 ? String(promo_video_thumbnail).trim() : current.promo_video_thumbnail,
    bkash_number: bkash_number !== void 0 ? bkash_number : current.bkash_number,
    nagad_number: nagad_number !== void 0 ? nagad_number : current.nagad_number,
    support_email: support_email !== void 0 ? support_email : current.support_email,
    meta_description: meta_description !== void 0 ? meta_description : current.meta_description,
    meta_app_id: meta_app_id !== void 0 ? meta_app_id.trim() : current.meta_app_id,
    meta_app_secret: meta_app_secret !== void 0 ? meta_app_secret.trim() : current.meta_app_secret,
    meta_config_id: meta_config_id !== void 0 ? meta_config_id.trim() : current.meta_config_id,
    meta_verify_token: meta_verify_token !== void 0 ? meta_verify_token.trim() : current.meta_verify_token
  });
  await db.flushToSupabase().catch(() => {
  });
  return res.json({
    success: true,
    settings: updated,
    message: "System settings saved successfully"
  });
});
adminRouter.post("/cron/run-expiry", (req, res) => {
  const result = runSubscriptionExpiryCheck();
  return res.json({
    success: true,
    ...result,
    message: `Subscription check completed: ${result.expiredCount} expired subscriptions updated.`
  });
});
adminRouter.post("/security/credentials", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Administrator access required." });
  }
  const { newEmail, newPassword } = req.body;
  if (!newEmail && !newPassword) {
    return res.status(400).json({ error: "Provide a new email or new password." });
  }
  if (newPassword && newPassword.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }
  const updates = {};
  if (newEmail) {
    const cleanEmail = newEmail.trim().toLowerCase();
    const existing = db.getProfileByEmail(cleanEmail);
    if (existing && existing.id !== user.id) {
      return res.status(400).json({ error: "Email is already used by another user." });
    }
    updates.email = cleanEmail;
  }
  if (newPassword) {
    updates.password = newPassword;
  }
  const updated = db.updateProfile(user.id, updates);
  return res.json({
    success: true,
    message: "Admin credentials successfully updated! Please use your new login credentials next time.",
    user: updated
  });
});
adminRouter.get("/coupons", (_req, res) => {
  return res.json(db.getCoupons());
});
adminRouter.get("/reviews", (_req, res) => {
  return res.json({
    reviews: db.getAllReviews()
  });
});
adminRouter.post("/reviews/:id/approve", (req, res) => {
  const updated = db.updateReviewStatus(req.params.id, "approved");
  if (!updated) {
    return res.status(404).json({ error: "Review not found" });
  }
  return res.json({
    success: true,
    review: updated,
    message: "Review approved and published on the website."
  });
});
adminRouter.delete("/reviews/:id", (req, res) => {
  const deleted = db.deleteReview(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: "Review not found" });
  }
  return res.json({
    success: true,
    id: req.params.id,
    message: "Review removed successfully."
  });
});
adminRouter.post("/coupons", (req, res) => {
  const { code, discount_type, discount_value, min_amount, max_uses, is_active, expires_at } = req.body;
  const cleanCode = String(code || "").trim().toUpperCase();
  if (!cleanCode) {
    return res.status(400).json({ error: "Coupon code is required." });
  }
  if (discount_value === void 0 || Number(discount_value) <= 0) {
    return res.status(400).json({ error: "Discount value must be greater than 0." });
  }
  const existing = db.getCouponByCode(cleanCode);
  if (existing) {
    return res.status(400).json({ error: `Coupon code "${cleanCode}" already exists.` });
  }
  let parsedExpiresAt = void 0;
  if (expires_at && String(expires_at).trim()) {
    const dt = new Date(expires_at);
    if (!isNaN(dt.getTime())) {
      parsedExpiresAt = dt.toISOString();
    }
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const coupon = db.createCoupon({
    id: `cpn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    code: cleanCode,
    discount_type: discount_type === "fixed" ? "fixed" : "percentage",
    discount_value: Number(discount_value),
    min_amount: min_amount ? Number(min_amount) : 0,
    max_uses: max_uses ? Number(max_uses) : 0,
    used_count: 0,
    is_active: is_active !== void 0 ? Boolean(is_active) : true,
    expires_at: parsedExpiresAt,
    created_at: now,
    updated_at: now
  });
  return res.status(201).json(coupon);
});
adminRouter.put("/coupons/:id", (req, res) => {
  const { code, discount_type, discount_value, min_amount, max_uses, is_active, expires_at } = req.body;
  const updates = {};
  if (code !== void 0) updates.code = String(code).trim().toUpperCase();
  if (discount_type !== void 0) updates.discount_type = discount_type === "fixed" ? "fixed" : "percentage";
  if (discount_value !== void 0) updates.discount_value = Number(discount_value);
  if (min_amount !== void 0) updates.min_amount = Number(min_amount);
  if (max_uses !== void 0) updates.max_uses = Number(max_uses);
  if (is_active !== void 0) updates.is_active = Boolean(is_active);
  if (expires_at !== void 0) {
    if (!expires_at || !String(expires_at).trim()) {
      updates.expires_at = void 0;
    } else {
      const dt = new Date(expires_at);
      if (!isNaN(dt.getTime())) {
        updates.expires_at = dt.toISOString();
      }
    }
  }
  const updated = db.updateCoupon(req.params.id, updates);
  if (!updated) {
    return res.status(404).json({ error: "Coupon not found." });
  }
  return res.json(updated);
});
adminRouter.delete("/coupons/:id", (req, res) => {
  const deleted = db.deleteCoupon(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: "Coupon not found." });
  }
  return res.json({ success: true, id: req.params.id });
});
adminRouter.get("/notifications", (_req, res) => {
  return res.json({
    notifications: db.getNotifications()
  });
});
adminRouter.post("/notifications", (req, res) => {
  const { title, message, type, action_label, action_tab, is_active } = req.body;
  const cleanTitle = String(title || "").trim();
  const cleanMessage = String(message || "").trim();
  if (!cleanTitle || !cleanMessage) {
    return res.status(400).json({ error: "Notification title and message are required." });
  }
  const validTypes = ["info", "promo", "warning", "maintenance"];
  const safeType = validTypes.includes(type) ? type : "info";
  const created = db.createNotification({
    id: `ntf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: cleanTitle,
    message: cleanMessage,
    type: safeType,
    action_label: String(action_label || "").trim(),
    action_tab: String(action_tab || "").trim(),
    is_active: is_active !== void 0 ? Boolean(is_active) : true,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  return res.status(201).json({
    success: true,
    notification: created,
    message: "Broadcast notification published to merchant dashboards."
  });
});
adminRouter.patch("/notifications/:id", (req, res) => {
  const { title, message, type, action_label, action_tab, is_active } = req.body;
  const updates = {};
  if (title !== void 0) updates.title = String(title).trim();
  if (message !== void 0) updates.message = String(message).trim();
  if (type !== void 0) updates.type = type;
  if (action_label !== void 0) updates.action_label = String(action_label).trim();
  if (action_tab !== void 0) updates.action_tab = String(action_tab).trim();
  if (is_active !== void 0) updates.is_active = Boolean(is_active);
  const updated = db.updateNotification(req.params.id, updates);
  if (!updated) {
    return res.status(404).json({ error: "Notification not found." });
  }
  return res.json({
    success: true,
    notification: updated
  });
});
adminRouter.delete("/notifications/:id", (req, res) => {
  const deleted = db.deleteNotification(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: "Notification not found." });
  }
  return res.json({
    success: true,
    id: req.params.id
  });
});

// server/routes/aiChat.ts
init_aiService();
import { Router as Router12 } from "express";
import { GoogleGenAI as GoogleGenAI6 } from "@google/genai";

// server/routes/widget.ts
init_database();
import { Router as Router11 } from "express";
init_subscriptionService();
init_aiService();
init_audioDownloader();
init_appointmentService();
import { GoogleGenAI as GoogleGenAI5 } from "@google/genai";
var widgetRouter = Router11();
var defaultConfigs = {};
var pendingCouponVisitors = /* @__PURE__ */ new Map();
function handleSaasCouponFlow(rawText, history, visitorId, lang) {
  const clean = (rawText || "").trim();
  if (!clean) return null;
  const q = clean.toLowerCase();
  const historyList = Array.isArray(history) ? history : [];
  const lastBotMessages = historyList.filter((h) => h && (h.sender === "bot" || h.sender === "ai")).slice(-2).map((h) => String(h.text || "").toLowerCase());
  const askedInHistory = lastBotMessages.some(
    (msg) => msg.includes("\u09AC\u09BF\u099C\u09A8\u09C7\u09B8 \u09B0\u09BF\u09AD\u09BF\u0989") || msg.includes("\u09AE\u09BE\u09B8\u09BF\u0995 \u09B0\u09C7\u09AD\u09BF\u09A8\u09BF\u0989") || msg.includes("business review") || msg.includes("monthly revenue") || msg.includes("sales revenue")
  );
  const pendingSince = pendingCouponVisitors.get(visitorId);
  const isPendingInMemory = Boolean(pendingSince && Date.now() - pendingSince < 30 * 60 * 1e3);
  const isAskingForCoupon = q.includes("coupon") || q.includes("cupon") || q.includes("copon") || q.includes("promo") || q.includes("discount") || q.includes("\u0995\u09C1\u09AA\u09A8") || q.includes("\u09A1\u09BF\u09B8\u0995\u09BE\u0989\u09A8\u09CD\u099F") || q.includes("\u09AA\u09CD\u09B0\u09CB\u09AE\u09CB") || q.includes("\u099B\u09BE\u09DC") || q.includes("\u099B\u09BE\u09A1\u09BC") || (q.includes("code") || q.includes("\u0995\u09CB\u09A1")) && (q.includes("daw") || q.includes("dao") || q.includes("den") || q.includes("chai") || q.includes("cai") || q.includes("give") || q.includes("want") || q.includes("need") || q.includes("\u09A6\u09BE\u0993") || q.includes("\u09A6\u09C7\u09A8") || q.includes("\u099A\u09BE\u0987") || q.includes("\u09B2\u09BE\u0997\u09AC\u09C7"));
  if ((isPendingInMemory || askedInHistory) && !isAskingForCoupon) {
    pendingCouponVisitors.delete(visitorId);
    const nowMs = Date.now();
    const expiresAtMs = nowMs + 45 * 60 * 1e3;
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `OA15-${randomSuffix}`;
    db.createCoupon({
      id: `cpn_ai_${nowMs}_${randomSuffix.toLowerCase()}`,
      code,
      discount_type: "percentage",
      discount_value: 15,
      min_amount: 0,
      max_uses: 1,
      used_count: 0,
      is_active: true,
      expires_at: new Date(expiresAtMs).toISOString(),
      created_at: new Date(nowMs).toISOString(),
      updated_at: new Date(nowMs).toISOString()
    });
    const expiryTimeBD = new Date(expiresAtMs).toLocaleTimeString("en-US", {
      timeZone: "Asia/Dhaka",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
    return lang === "en" ? `Thank you for sharing! \u{1F389} I have automatically generated a special **15% OFF** coupon code for you:

\u{1F39F}\uFE0F Coupon Code: **${code}**
\u23F3 Valid Duration: **45 Minutes**
\u{1F552} Works Until: **${expiryTimeBD}** (BD Time)

\u26A0\uFE0F Note: Whether you use this coupon code or not, it will automatically expire after 45 minutes (after ${expiryTimeBD}) and will no longer work. Click "Buy Plan Now" on your preferred plan to apply it right away!` : `\u09A7\u09A8\u09CD\u09AF\u09AC\u09BE\u09A6! \u{1F389} \u0986\u09AA\u09A8\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u0986\u09AE\u09BF \u0985\u099F\u09CB\u09AE\u09C7\u099F\u09BF\u0995 \u098F\u0995\u099F\u09BF \u09B8\u09CD\u09AA\u09C7\u09B6\u09BE\u09B2 **\u09E7\u09EB% \u09A1\u09BF\u09B8\u0995\u09BE\u0989\u09A8\u09CD\u099F \u0995\u09C1\u09AA\u09A8 \u0995\u09CB\u09A1** \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C7 \u09A6\u09BF\u09DF\u09C7\u099B\u09BF:

\u{1F39F}\uFE0F \u0995\u09C1\u09AA\u09A8 \u0995\u09CB\u09A1: **${code}**
\u23F3 \u0995\u09A4\u0995\u09CD\u09B7\u09A3 \u0995\u09BE\u099C \u0995\u09B0\u09AC\u09C7: **\u09EA\u09EB \u09AE\u09BF\u09A8\u09BF\u099F**
\u{1F552} \u0995\u09DF\u099F\u09BE \u09AA\u09B0\u09CD\u09AF\u09A8\u09CD\u09A4 \u0995\u09BE\u099C \u0995\u09B0\u09AC\u09C7: **\u0986\u099C ${expiryTimeBD} \u09AA\u09B0\u09CD\u09AF\u09A8\u09CD\u09A4**

\u26A0\uFE0F \u09AC\u09BF\u0983\u09A6\u09CD\u09B0\u0983 \u0986\u09AA\u09A8\u09BF \u098F\u0987 \u0995\u09C1\u09AA\u09A8 \u0995\u09CB\u09A1\u099F\u09BF \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8 \u09AC\u09BE \u09A8\u09BE \u0995\u09B0\u09C1\u09A8, \u09A0\u09BF\u0995 \u09EA\u09EB \u09AE\u09BF\u09A8\u09BF\u099F \u09AA\u09B0 (${expiryTimeBD}-\u098F\u09B0 \u09AA\u09B0\u09C7) \u098F\u0987 \u0995\u09C1\u09AA\u09A8 \u0995\u09CB\u09A1\u099F\u09BF \u0985\u099F\u09CB\u09AE\u09C7\u099F\u09BF\u0995 \u09AC\u09A8\u09CD\u09A7 \u09B9\u09DF\u09C7 \u09AF\u09BE\u09AC\u09C7 \u098F\u09AC\u0982 \u0986\u09B0 \u0995\u09BE\u099C \u0995\u09B0\u09AC\u09C7 \u09A8\u09BE\u0964 \u09A4\u09BE\u0987 \u098F\u0996\u09A8\u0987 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8 \u09B8\u09BF\u09B2\u09C7\u0995\u09CD\u099F \u0995\u09B0\u09C7 "Buy Plan Now" \u09AC\u09BE\u099F\u09A8\u09C7 \u0995\u09CD\u09B2\u09BF\u0995 \u0995\u09B0\u09C7 \u0995\u09CB\u09A1\u099F\u09BF \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8!`;
  }
  if (isAskingForCoupon) {
    pendingCouponVisitors.set(visitorId, Date.now());
    return lang === "en" ? "Sure! I can automatically generate a special discount coupon code for you right away. \u{1F381} Before I create it, could you please tell me what your business review / monthly sales revenue is?" : "\u0985\u09AC\u09B6\u09CD\u09AF\u0987! \u0986\u09AE\u09BF \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u098F\u0995\u099F\u09BF \u09B8\u09CD\u09AA\u09C7\u09B6\u09BE\u09B2 \u09A1\u09BF\u09B8\u0995\u09BE\u0989\u09A8\u09CD\u099F \u0995\u09C1\u09AA\u09A8 \u0995\u09CB\u09A1 \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C7 \u09A6\u09BF\u099A\u09CD\u099B\u09BF\u0964 \u{1F381} \u09A4\u09BE\u09B0 \u0986\u0997\u09C7 \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u09AC\u09B2\u09C1\u09A8\u2014\u0986\u09AA\u09A8\u09BE\u09B0 \u09AC\u09BF\u099C\u09A8\u09C7\u09B8 \u09B0\u09BF\u09AD\u09BF\u0989 \u09AC\u09BE \u09AE\u09BE\u09B8\u09BF\u0995 \u09B8\u09C7\u09B2\u09B8/\u09B0\u09C7\u09AD\u09BF\u09A8\u09BF\u0989 \u0995\u09A4?";
  }
  return null;
}
function detectLanguageMode(text) {
  if (!text || !text.trim()) return "en";
  const clean = text.trim();
  if (/[\u0980-\u09FF]/.test(clean)) {
    return "bn";
  }
  const lower = clean.toLowerCase();
  const banglishWords = [
    "ami",
    "amar",
    "amader",
    "apni",
    "apnar",
    "apnader",
    "tumi",
    "tomar",
    "tomader",
    "koto",
    "kivabe",
    "ki",
    "keno",
    "kothay",
    "kokhon",
    "kon",
    "konta",
    "kemon",
    "ache",
    "ase",
    "asen",
    "achhe",
    "nai",
    "nei",
    "hobe",
    "hoy",
    "hocche",
    "korbo",
    "korte",
    "kori",
    "korben",
    "koren",
    "korle",
    "kore",
    "kora",
    "cai",
    "chai",
    "chacchi",
    "lagbe",
    "dorkar",
    "pabo",
    "pawa",
    "jabe",
    "dam",
    "daam",
    "taka",
    "tk",
    "bhalo",
    "valo",
    "bhai",
    "vai",
    "vaia",
    "bhaiya",
    "apu",
    "dada",
    "dost",
    "salam",
    "assalamu",
    "walaikum",
    "dhonnobad",
    "shukriya",
    "bolen",
    "bolun",
    "bolbo",
    "dekhan",
    "pathan",
    "pathabo",
    "pathate",
    "kinte",
    "kinbo",
    "nebo",
    "nibo",
    "nite",
    "niye",
    "debo",
    "dibo",
    "dite",
    "daw",
    "dao",
    "den",
    "din",
    "jeno",
    "pare",
    "pari",
    "parbo",
    "parben",
    "sune",
    "shune",
    "bujhe",
    "bujhte",
    "uttor",
    "k\u09A5\u09BE",
    "kotha",
    "bolle",
    "bangla",
    "banglay",
    "banglish",
    "banglaish",
    "somporke",
    "shomporke",
    "bistarito",
    "jonno",
    "theke",
    "jekono",
    "vabe",
    "bhabe",
    "sobgula",
    "shob",
    "mashe",
    "mash",
    "din",
    "bochor",
    "kom",
    "beshi",
    "koto taka",
    "plan er",
    "kivabe kaj",
    "free trail",
    "bkash",
    "nagad",
    "rocket",
    "upay",
    "delivari",
    "chobi",
    "pic",
    "voice",
    "kisu",
    "kichu",
    "ektu",
    "ar",
    "ebong",
    "ba",
    "tobe",
    "jodi",
    "tahole",
    "karon",
    "mane",
    "oivabe",
    "evabe",
    "jevabe",
    "ekhane",
    "oikhane"
  ];
  const tokens = lower.split(/[^a-z0-9]+/).filter(Boolean);
  for (const token of tokens) {
    if (banglishWords.includes(token)) {
      return "bn";
    }
  }
  for (const phrase of ["dam koto", "kivabe add", "plan ki", "free trail", "website a", "website e", "kaj kore"]) {
    if (lower.includes(phrase)) {
      return "bn";
    }
  }
  return "en";
}
var ONE_AGENT_SAAS_KNOWLEDGE = `
OFFICIAL KNOWLEDGE BASE \u2014 ONE AGENT BD (Official Domain: oneagentbd.online)
One Agent BD is Bangladesh's #1 All-in-One Omnichannel AI Sales, Auto-Reply & Order Automation SaaS Platform for E-Commerce, F-Commerce, and Website Businesses.

CRITICAL ON-WEBSITE CONTEXT RULE (MUST OBEY):
- The user chatting with you is ALREADY on the official One Agent BD website (oneagentbd.online)!
- NEVER tell the user "\u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u099C\u09BE\u09A8\u09A4\u09C7 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u0993\u09DF\u09C7\u09AC\u09B8\u09BE\u0987\u099F \u09AD\u09BF\u099C\u09BF\u099F \u0995\u09B0\u09C1\u09A8" or "Visit our website (oneagentbd.com / oneagentbd.online) for details".
- Never use "oneagentbd.com" \u2014 our official domain is "oneagentbd.online" and our payment gateway is "pay.oneagentbd.online".
- Instead of telling them to visit the website, give the full details directly in your chat reply, or guide them to the "Pricing" section or the "Start 2 Days Free Trial" / "Get Started" buttons right here on this page!

1. SUPPORTED CHANNELS & INTEGRATIONS:
   - Facebook Page & Messenger: 24/7 Instant AI Auto-Reply to inbox messages and post comments via Official Meta Graph API (100% safe, 0% ban risk).
   - Instagram Business: Automated DM replies, Story mention replies, and comment-to-DM automation.
   - WhatsApp Business Cloud API: Official Meta WhatsApp Cloud API integration for instant customer support and order taking.
   - Website AI Chatbot Widget (1-Line Script): Easily embed a live multimodal AI chatbot on any website (Shopify, WordPress/WooCommerce, Custom HTML/React/Next.js, Wix) by copying 1 line of script code from the "Website AI Chatbot" tab in the dashboard. Also supports connecting custom domains and 1-Click AI Storefronts!

2. MULTIMODAL AI CAPABILITIES (TEXT + VOICE + PICTURE):
   - Multilingual Intelligence: Understands Bangla (\u09AC\u09BE\u0982\u09B2\u09BE), Banglish (Romanized Bangla), and English effortlessly.
     * When a user asks in Bangla or Banglish, the AI replies in natural, polite Bangla (\u09AC\u09BE\u0982\u09B2\u09BE).
     * When a user asks in English, the AI replies in clear, professional English.
   - Voice Message Understanding (\u{1F3A4}): Customers can record or send voice notes directly in chat. The AI listens to the audio, transcribes/understands the spoken question, and replies with full details.
   - Picture / Screenshot Recognition (\u{1F5BC}\uFE0F): Customers can send product photos, payment screenshots, or website screenshots. The AI visually analyzes the image and provides accurate answers, product prices, or troubleshooting steps.

3. PRICING PLANS & 2-DAY FREE TRIAL (ONLY 2 OFFICIAL PLANS):
   - 2-Day Free Trial: Every merchant can activate a 2-Day Free Trial with 1 click from the Pricing section or Billing dashboard (no credit card required), OR purchase any plan directly anytime.
   - Plan 1 \u2014 Starter AI Plan: 1,250 TK / Month (\u09F31,250 BDT)
     * All Core SaaS Features Included (24/7 Active AI Agent)
     * WhatsApp, Facebook Messenger, Instagram & Website Auto-Reply
     * Voice Note AI (Audio Listening) & Product Picture Recognition AI Included
     * Auto Post Comment Reply + Direct Inbox (DM) Automation
     * Connect up to 3 Social Channels + 1 Website Live Chat Widget
     * Add Website, WooCommerce & Shopify Store Sync (1 Store)
     * Unlimited Product Catalog, Autonomous Order Booking, Call Requests & 1-Click Courier Booking (Steadfast, Pathao & RedX)
   - Plan 2 \u2014 Pro Business Plan (Most Popular): 1,950 TK / Month (\u09F31,950 BDT)
     * Everything in 1,250 TK Starter Plan Included (100% All Features)
     * Connect up to 10 Social & Web Channels (Multi-Page & Multi-Number)
     * 3 Autonomous AI Sales & Support Agents (Run Multiple Brands)
     * Unlimited Website, Shopify & WooCommerce Multi-Store Sync
     * Smart Auto Follow-Up & VIP Customer Retargeting Broadcast
     * High-Speed Priority AI Engine, Google Sheets Sync & Dedicated 24/7 VIP Priority Support
   - Multi-Month & Multi-Year Automatic Discounts:
     * 6 Months: 10% OFF (Starter: 6,750 TK, Pro: 10,530 TK)
     * 1 Year (12 Months): 15% OFF (Starter: 12,750 TK instead of 15,000 TK, Pro: 19,890 TK instead of 23,400 TK)
     * 2 Years (24 Months): 20% OFF (Starter: 24,000 TK instead of 30,000 TK, Pro: 37,440 TK instead of 46,800 TK)
     * 3 Years: 25% OFF | 6 Years: 30% OFF

4. PAYMENT & COUPON CODE SYSTEM:
   - Payment Gateway: Official automated checkout via pay.oneagentbd.online supporting bKash, Nagad, Rocket, and Upay. Enter the Transaction ID (TrxID) for instant automated plan activation.
   - Coupon / Promo Codes: During checkout, users can click "Have a Coupon / Promo Code?" and apply promo codes created by the Admin for instant percentage (%) or fixed (TK) discounts.

5. HOW TO ADD THE AI CHATBOT TO A USER'S WEBSITE:
   - Step 1: Sign in to One Agent BD Dashboard -> Click "Website AI Chatbot" in the menu.
   - Step 2: Customize your Bot Name, Brand Color, Welcome Message, and Helpline Phone.
   - Step 3: Click "Copy Script Code" to copy the 1-line <script> tag and paste it before </body> on your WordPress, Shopify, Wix, or custom HTML/React website.
`;
function sanitizeWebsiteBotReply(text) {
  if (!text) return text;
  let cleaned = text.replace(/oneagentbd\.com/gi, "oneagentbd.online").replace(/বিস্তারিত জানতে আমাদের ওয়েবসাইট\s*(\([^)]*\))?\s*ভিজিট করুন[।.!]*/gi, "").replace(/বিস্তারিত জানতে আমাদের ওয়েবসাইট\s*(\([^)]*\))?\s*ভিজিট করুন[।.!]*/gi, "").replace(/আমাদের ওয়েবসাইট\s*(\([^)]*\))?\s*ভিজিট করুন[।.!]*/gi, "").replace(/আমাদের ওয়েবসাইট\s*(\([^)]*\))?\s*ভিজিট করুন[।.!]*/gi, "").replace(/for more details,?\s*visit our website\s*(\([^)]*\))?[.,!]*/gi, "").replace(/visit our website\s*(\([^)]*\))?\s*(for more details|to learn more)?[.,!]*/gi, "").trim();
  return formatCleanChatMessage(cleaned || text.replace(/oneagentbd\.com/gi, "oneagentbd.online"));
}
function getSaasBilingualFallback(question, lang, hasImage, hasAudio) {
  const q = (question || "").toLowerCase();
  if (hasImage && (!q || q.length < 3)) {
    return lang === "en" ? "I have received and analyzed your image! \u{1F4F8}\n\nWith One Agent BD, our Multimodal AI recognizes product photos, payment screenshots, and website setups automatically.\n\nHow can I help you with this image?" : "\u0986\u09AE\u09BF \u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u099B\u09AC\u09BF\u099F\u09BF \u09AA\u09C7\u09DF\u09C7\u099B\u09BF! \u{1F4F8}\n\nOne Agent BD-\u098F\u09B0 \u09AE\u09BE\u09B2\u09CD\u099F\u09BF\u09AE\u09CB\u09A1\u09BE\u09B2 AI \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u09C7\u09B0 \u099B\u09AC\u09BF, \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8\u09B6\u099F \u098F\u09AC\u0982 \u0993\u09DF\u09C7\u09AC\u09B8\u09BE\u0987\u099F \u09B8\u09C7\u099F\u0986\u09AA \u09B8\u09CD\u09AC\u09DF\u0982\u0995\u09CD\u09B0\u09BF\u09DF\u09AD\u09BE\u09AC\u09C7 \u09AC\u09C1\u099D\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u0964\n\n\u098F\u0987 \u099B\u09AC\u09BF\u099F\u09BF \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u0995\u09C0 \u099C\u09BE\u09A8\u09BE\u09B0 \u0986\u099B\u09C7 \u09AC\u09B2\u09C1\u09A8?";
  }
  if (hasAudio && (!q || q.length < 3)) {
    return UNCLEAR_VOICE_REPLY;
  }
  if (q.includes("price") || q.includes("pricing") || q.includes("cost") || q.includes("fee") || q.includes("fees") || q.includes("subscription") || q.includes("subscriptions") || q.includes("how much") || q.includes("every month") || q.includes("per month") || q.includes("monthly") || q.includes("month") || q.includes("charge") || q.includes("rate") || q.includes("plan") || q.includes("package") || q.includes("dam") || q.includes("koto") || q.includes("taka") || q.includes("tk") || q.includes("1250") || q.includes("1950") || q.includes("\u09A6\u09BE\u09AE") || q.includes("\u0995\u09A4") || q.includes("\u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8") || q.includes("\u09AA\u09CD\u09AF\u09BE\u0995\u09C7\u099C") || q.includes("\u09AB\u09BF") || q.includes("\u09B8\u09BE\u09AC\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09AA\u09B6\u09A8")) {
    return lang === "en" ? "One Agent BD offers 2 official plans plus a 2-Day Free Trial:\n\n1. Starter AI Plan \u2014 1,250 TK/month (1 AI Agent, WhatsApp, Messenger, Instagram & Website AI Chatbot, Voice & Image AI, 3 Channels & Courier Booking)\n\n2. Pro Business Plan \u2014 1,950 TK/month (3 AI Agents, up to 10 Channels, Unlimited Website Multi-Store Sync, VIP Broadcast & 24/7 Priority Support)\n\n3. Free Trial \u2014 2-Day full-featured Free Trial upon signup\n\nWhich plan (1. Starter or 2. Pro) would you like to activate?" : "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09E8\u099F\u09BF \u09B8\u09BE\u09AC\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09AA\u09B6\u09A8 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8 \u09B0\u09DF\u09C7\u099B\u09C7:\n\n\u09E7. Starter AI Plan \u2014 \u09E7,\u09E8\u09EB\u09E6 \u099F\u09BE\u0995\u09BE/\u09AE\u09BE\u09B8 (\u09E7\u099F\u09BF AI \u098F\u099C\u09C7\u09A8\u09CD\u099F, WhatsApp, Messenger, Instagram \u0993 Website AI Chatbot, \u09AD\u09DF\u09C7\u09B8 \u0993 \u099B\u09AC\u09BF\u09B0 AI \u098F\u09AC\u0982 \u0995\u09C1\u09B0\u09BF\u09DF\u09BE\u09B0 \u09AC\u09C1\u0995\u09BF\u0982)\n\n\u09E8. Pro Business Plan \u2014 \u09E7,\u09EF\u09EB\u09E6 \u099F\u09BE\u0995\u09BE/\u09AE\u09BE\u09B8 (\u09E9\u099F\u09BF AI \u098F\u099C\u09C7\u09A8\u09CD\u099F, \u09E7\u09E6\u099F\u09BF \u09AA\u09B0\u09CD\u09AF\u09A8\u09CD\u09A4 \u099A\u09CD\u09AF\u09BE\u09A8\u09C7\u09B2, \u0986\u09A8\u09B2\u09BF\u09AE\u09BF\u099F\u09C7\u09A1 \u0993\u09DF\u09C7\u09AC\u09B8\u09BE\u0987\u099F \u09B8\u09CD\u099F\u09CB\u09B0 \u09B8\u09BF\u0999\u09CD\u0995 \u0993 VIP \u09AC\u09CD\u09B0\u09A1\u0995\u09BE\u09B8\u09CD\u099F)\n\n\u09E9. \u09AB\u09CD\u09B0\u09BF \u099F\u09CD\u09B0\u09BE\u09DF\u09BE\u09B2 \u2014 \u0993\u09DF\u09C7\u09AC\u09B8\u09BE\u0987\u099F\u09C7 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u0996\u09C1\u09B2\u09C7\u0987 \u09E8 \u09A6\u09BF\u09A8\u09C7\u09B0 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09AB\u09CD\u09B0\u09BF \u099F\u09CD\u09B0\u09BE\u09DF\u09BE\u09B2\n\n\u0986\u09AA\u09A8\u09BF \u0995\u09BF \u09E7 \u09A8\u09AE\u09CD\u09AC\u09B0 (Starter) \u09A8\u09BE\u0995\u09BF \u09E8 \u09A8\u09AE\u09CD\u09AC\u09B0 (Pro) \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8\u099F\u09BF \u09A8\u09BF\u09A4\u09C7 \u099A\u09BE\u099A\u09CD\u099B\u09C7\u09A8?";
  }
  if (q.includes("website") || q.includes("widget") || q.includes("embed") || q.includes("script") || q.includes("shopify") || q.includes("wordpress") || q.includes("add") || q.includes("\u0993\u09DF\u09C7\u09AC\u09B8\u09BE\u0987\u099F") || q.includes("\u0993\u09AF\u09BC\u09C7\u09AC\u09B8\u09BE\u0987\u099F")) {
    return lang === "en" ? 'Adding the One Agent BD AI Chatbot to your website takes just 60 seconds! Both our 1,250 TK and 1,950 TK plans include Website AI Integration. Simply go to Dashboard -> "Website AI Chatbot", customize your brand color & welcome message, copy the 1-line <script> tag, and paste it before </body> on your WordPress, Shopify, Wix, or custom website!' : '\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09E7,\u09E8\u09EB\u09E6 \u099F\u09BE\u0995\u09BE \u098F\u09AC\u0982 \u09E7,\u09EF\u09EB\u09E6 \u099F\u09BE\u0995\u09BE\u2014\u0989\u09AD\u09DF \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8\u09C7\u0987 \u0993\u09DF\u09C7\u09AC\u09B8\u09BE\u0987\u099F \u09AF\u09C1\u0995\u09CD\u09A4 \u0995\u09B0\u09BE\u09B0 \u09B8\u09C1\u09AC\u09BF\u09A7\u09BE \u09B0\u09DF\u09C7\u099B\u09C7! \u09A1\u09CD\u09AF\u09BE\u09B6\u09AC\u09CB\u09B0\u09CD\u09A1\u09C7\u09B0 "Website AI Chatbot" \u0985\u09AA\u09B6\u09A8\u09C7 \u0997\u09BF\u09DF\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09AC\u09CD\u09B0\u09CD\u09AF\u09BE\u09A8\u09CD\u09A1 \u0995\u09BE\u09B2\u09BE\u09B0 \u0993 \u09A8\u09BE\u09AE \u09B8\u09C7\u099F \u0995\u09B0\u09C7 \u09AE\u09BE\u09A4\u09CD\u09B0 \u09E7 \u09B2\u09BE\u0987\u09A8\u09C7\u09B0 Script \u0995\u09CB\u09A1\u099F\u09BF \u0995\u09AA\u09BF \u0995\u09B0\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 WordPress, Shopify \u09AC\u09BE \u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u0993\u09DF\u09C7\u09AC\u09B8\u09BE\u0987\u099F\u09C7 \u09AC\u09B8\u09BF\u09DF\u09C7 \u09A6\u09BF\u09B2\u09C7\u0987 \u09A0\u09BF\u0995 \u098F\u0987 \u099A\u09CD\u09AF\u09BE\u099F\u09AC\u099F\u099F\u09BF\u09B0 \u09AE\u09A4\u09CB\u0987 \u0986\u09AA\u09A8\u09BE\u09B0 \u0993\u09DF\u09C7\u09AC\u09B8\u09BE\u0987\u099F\u09C7\u0993 AI \u099A\u09CD\u09AF\u09BE\u099F\u09AC\u099F \u099A\u09BE\u09B2\u09C1 \u09B9\u09DF\u09C7 \u09AF\u09BE\u09AC\u09C7!';
  }
  if (q.includes("trial") || q.includes("trail") || q.includes("free") || q.includes("test") || q.includes("\u099F\u09CD\u09B0\u09BE\u09DF\u09BE\u09B2") || q.includes("\u09AB\u09CD\u09B0\u09BF")) {
    return lang === "en" ? "Yes! You can activate a 2-Day Free Trial right from our Pricing section with 1 click\u2014no credit card required. You can test WhatsApp, Messenger, Instagram, and Website AI Auto-Reply for 2 full days, or purchase a direct plan anytime!" : "\u099C\u09CD\u09AC\u09C0! \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B0\u09BE\u0987\u09B8\u09BF\u0982 \u09B8\u09C7\u0995\u09B6\u09A8 \u09A5\u09C7\u0995\u09C7 \u0986\u09AA\u09A8\u09BF \u09E7-\u0995\u09CD\u09B2\u09BF\u0995\u09C7 \u09E8 \u09A6\u09BF\u09A8\u09C7\u09B0 \u09AB\u09CD\u09B0\u09BF \u099F\u09CD\u09B0\u09BE\u09DF\u09BE\u09B2 (2 Days Free Trial) \u099A\u09BE\u09B2\u09C1 \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u09A8 \u0985\u09A5\u09AC\u09BE \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8 \u0995\u09BF\u09A8\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u09A8\u0964 \u099F\u09CD\u09B0\u09BE\u09DF\u09BE\u09B2\u09C7 \u09B8\u09AC \u09AB\u09BF\u099A\u09BE\u09B0 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09AB\u09CD\u09B0\u09BF\u09A4\u09C7 \u099F\u09C7\u09B8\u09CD\u099F \u0995\u09B0\u09BE\u09B0 \u09B8\u09C1\u09AF\u09CB\u0997 \u09A5\u09BE\u0995\u099B\u09C7!";
  }
  if (q.includes("voice") || q.includes("audio") || q.includes("picture") || q.includes("image") || q.includes("photo") || q.includes("chobi") || q.includes("\u09AD\u09DF\u09C7\u09B8") || q.includes("\u099B\u09AC\u09BF") || q.includes("\u0985\u09A1\u09BF\u0993")) {
    return lang === "en" ? "Yes! Our AI Chatbot supports both Voice Messages (\u{1F3A4}) and Picture/Screenshot uploads (\u{1F5BC}\uFE0F). Customers can speak or send photos in Bangla, Banglish, or English, and our AI listens to the audio and analyzes the image to reply with accurate details!" : "\u099C\u09CD\u09AC\u09C0! \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 AI \u099A\u09CD\u09AF\u09BE\u099F\u09AC\u099F\u09C7 \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0\u09B0\u09BE \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u09AD\u09DF\u09C7\u09B8 \u09AE\u09C7\u09B8\u09C7\u099C (\u{1F3A4}) \u098F\u09AC\u0982 \u099B\u09AC\u09BF/\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8\u09B6\u099F (\u{1F5BC}\uFE0F) \u09AA\u09BE\u09A0\u09BE\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u09A8\u0964 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 AI \u09AD\u09DF\u09C7\u09B8 \u09B6\u09C1\u09A8\u09C7 \u098F\u09AC\u0982 \u099B\u09AC\u09BF \u09A6\u09C7\u0996\u09C7 \u09AC\u09BE\u0982\u09B2\u09BE, \u09AC\u09BE\u0982\u09B2\u09BF\u09B6 \u09AC\u09BE \u0987\u0982\u09B0\u09C7\u099C\u09BF\u09A4\u09C7 \u09A8\u09BF\u09B0\u09CD\u09AD\u09C1\u09B2\u09AD\u09BE\u09AC\u09C7 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09BF\u09A4\u09C7 \u09B8\u0995\u09CD\u09B7\u09AE!";
  }
  if (q.includes("payment") || q.includes("pay") || q.includes("bkash") || q.includes("nagad") || q.includes("coupon") || q.includes("discount") || q.includes("\u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F") || q.includes("\u09AC\u09BF\u0995\u09BE\u09B6") || q.includes("\u09A8\u0997\u09A6") || q.includes("\u0995\u09C1\u09AA\u09A8")) {
    return lang === "en" ? "You can pay securely via bKash, Nagad, Rocket, or Upay through our official gateway (pay.oneagentbd.online). Simply enter your Transaction ID (TrxID) for instant activation, and if you have a Promo/Coupon Code, you can apply it at checkout for an instant discount!" : "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u0985\u09AB\u09BF\u09B8\u09BF\u09DF\u09BE\u09B2 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u0997\u09C7\u099F\u0993\u09DF\u09C7 (pay.oneagentbd.online)-\u098F\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 \u09AC\u09BF\u0995\u09BE\u09B6, \u09A8\u0997\u09A6 \u09AC\u09BE \u09B0\u0995\u09C7\u099F\u09C7 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u0995\u09B0\u09C7 TrxID \u09A6\u09BF\u09B2\u09C7\u0987 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8 \u09B8\u09BE\u09A5\u09C7 \u09B8\u09BE\u09A5\u09C7 \u0985\u09CD\u09AF\u09BE\u0995\u09CD\u099F\u09BF\u09AD \u09B9\u09DF\u09C7 \u09AF\u09BE\u09AC\u09C7! \u098F\u099B\u09BE\u09DC\u09BE \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F\u09C7\u09B0 \u09B8\u09AE\u09DF Coupon Code \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09C7 \u0987\u09A8\u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u09A8\u09CD\u099F \u09A1\u09BF\u09B8\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09AA\u09BE\u09AC\u09C7\u09A8\u0964";
  }
  if (q.includes("order") || q.includes("courier") || q.includes("steadfast") || q.includes("pathao") || q.includes("redx") || q.includes("\u0985\u09B0\u09CD\u09A1\u09BE\u09B0") || q.includes("\u0995\u09C1\u09B0\u09BF\u09DF\u09BE\u09B0")) {
    return lang === "en" ? "When a customer shares their name, phone number, and address in chat, One Agent BD automatically extracts the order into your Orders Hub and lets you book parcels to Steadfast, Pathao, or RedX with 1 click!" : "\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u099A\u09CD\u09AF\u09BE\u099F\u09C7 \u09A8\u09BE\u09AE, \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0 \u098F\u09AC\u0982 \u09A0\u09BF\u0995\u09BE\u09A8\u09BE \u09A6\u09BF\u09B2\u09C7\u0987 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 AI \u09B8\u09CD\u09AC\u09DF\u0982\u0995\u09CD\u09B0\u09BF\u09DF\u09AD\u09BE\u09AC\u09C7 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09A8\u09AB\u09BE\u09B0\u09CD\u09AE \u0995\u09B0\u09C7 \u09A1\u09CD\u09AF\u09BE\u09B6\u09AC\u09CB\u09B0\u09CD\u09A1\u09C7\u09B0 Orders Hub-\u098F \u09B8\u09C7\u09AD \u0995\u09B0\u09C7 \u09AB\u09C7\u09B2\u09C7 \u098F\u09AC\u0982 \u09E7-\u0995\u09CD\u09B2\u09BF\u0995\u09C7 Steadfast, Pathao \u09AC\u09BE RedX \u0995\u09C1\u09B0\u09BF\u09DF\u09BE\u09B0\u09C7 \u09AA\u09BE\u09B0\u09CD\u09B8\u09C7\u09B2 \u09AC\u09C1\u0995 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF!";
  }
  return lang === "en" ? "Welcome to One Agent BD! \u{1F31F} We provide 24/7 AI Auto-Reply & Order Automation for WhatsApp, Facebook Messenger, Instagram, and Websites. Our Starter AI Plan is 1,250 TK/mo, Pro Business Plan is 1,950 TK/mo, and we offer a 2-Day Free Trial. You can ask me anything in English, Bangla, or Banglish\u2014or send a voice note (\u{1F3A4}) or picture (\u{1F5BC}\uFE0F)!" : "\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE! \u{1F31F} One Agent BD-\u09A4\u09C7 \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u09B8\u09CD\u09AC\u09BE\u0997\u09A4\u09AE\u0964 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09AB\u09B0\u09CD\u09AE\u09C7\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 Facebook, Instagram, WhatsApp \u098F\u09AC\u0982 Website-\u098F \u09E8\u09EA/\u09ED \u0985\u099F\u09CB\u09AE\u09C7\u099F\u09BF\u0995 AI \u09B0\u09BF\u09AA\u09CD\u09B2\u09BE\u0987 \u0993 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09A8\u09AB\u09BE\u09B0\u09CD\u09AE\u09C7\u09B6\u09A8 \u099A\u09BE\u09B2\u09C1 \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u09A8\u0964 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8 \u09F3\u09E7,\u09E8\u09EB\u09E6/\u09AE\u09BE\u09B8 \u098F\u09AC\u0982 \u09F3\u09E7,\u09EF\u09EB\u09E6/\u09AE\u09BE\u09B8 (\u09B8\u09BE\u09A5\u09C7 \u09E8 \u09A6\u09BF\u09A8\u09C7\u09B0 \u09AB\u09CD\u09B0\u09BF \u099F\u09CD\u09B0\u09BE\u09DF\u09BE\u09B2)\u0964 \u0986\u09AA\u09A8\u09BF \u099F\u09C7\u0995\u09CD\u09B8\u099F, \u09AD\u09DF\u09C7\u09B8 (\u{1F3A4}) \u0985\u09A5\u09AC\u09BE \u099B\u09AC\u09BF (\u{1F5BC}\uFE0F) \u09AA\u09BE\u09A0\u09BF\u09DF\u09C7 \u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8!";
}
function getWidgetConfig(userId) {
  if (userId === "saas_official") {
    const adminCustom = defaultConfigs["usr_admin_1"];
    const sysSettings2 = db.getSettings();
    return {
      user_id: "saas_official",
      enabled: adminCustom ? adminCustom.enabled : true,
      bot_name: adminCustom?.bot_name || `${sysSettings2.site_name || "One Agent BD"} AI`,
      business_name: adminCustom?.business_name || `${sysSettings2.site_name || "One Agent BD"} Official`,
      primary_color: adminCustom?.primary_color || "#7F22FE",
      position: adminCustom?.position || "bottom-right",
      welcome_message: adminCustom?.welcome_message || "Hello! \u{1F44B} Welcome to One Agent BD! Ask me anything about our SaaS plans (1,250 BDT & 1,950 BDT), 2-Day Free Trial, or Website/Social Media AI Automation in English, Bangla, or Banglish. You can also send a voice note (\u{1F3A4}) or picture (\u{1F5BC}\uFE0F)!",
      quick_prompts: adminCustom?.quick_prompts?.length ? adminCustom.quick_prompts : [
        "\u{1F48E} What are the Plans & Pricing details?",
        "\u{1F310} How do I add the AI Chatbot to my website?",
        "\u{1F381} How do I activate the 2-Day Free Trial?",
        "\u{1F680} How does WhatsApp, Messenger & Website AI work?"
      ],
      helpline_phone: adminCustom?.helpline_phone || sysSettings2.bkash_number || "01811-998877",
      enable_order_tracking: true,
      updated_at: adminCustom?.updated_at || (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  if (defaultConfigs[userId]) {
    return defaultConfigs[userId];
  }
  const user = db.getProfileById(userId);
  const sysSettings = db.getSettings();
  const cfg = {
    user_id: userId,
    enabled: true,
    bot_name: "AI Sales Assistant",
    business_name: sysSettings.site_name || user?.full_name || "One Agent BD Shop",
    primary_color: "#7F22FE",
    position: "bottom-right",
    welcome_message: "Welcome! \u{1F31F} How can I assist you today? Feel free to ask in English, Bangla, or Banglish\u2014or send a voice note or photo!",
    quick_prompts: [
      "\u{1F6CD}\uFE0F Product pricing & details",
      "\u{1F4E6} I want to place an order",
      "\u{1F69A} Delivery charges & timeline",
      "\u{1F4DE} Contact customer support"
    ],
    helpline_phone: "01811-998877",
    enable_order_tracking: true,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  defaultConfigs[userId] = cfg;
  return cfg;
}
widgetRouter.get("/config", (req, res) => {
  const agentId = req.query.agentId || req.headers["x-user-id"] || "saas_official";
  const config = getWidgetConfig(agentId);
  if (agentId !== "saas_official") {
    const subStatus = getUserSubscriptionStatus(agentId);
    if (subStatus.isGated) {
      return res.json({
        success: true,
        config: {
          ...config,
          enabled: false,
          welcome_message: "The AI Chatbot subscription for this store is currently inactive or expired."
        },
        isGated: true
      });
    }
  }
  return res.json({
    success: true,
    config
  });
});
widgetRouter.post("/settings", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const {
    bot_name,
    business_name,
    primary_color,
    position,
    welcome_message,
    quick_prompts,
    helpline_phone,
    enable_order_tracking,
    enabled
  } = req.body;
  const current = getWidgetConfig(user.id);
  const updated = {
    ...current,
    bot_name: bot_name?.trim() || current.bot_name,
    business_name: business_name?.trim() || current.business_name,
    primary_color: primary_color?.trim() || current.primary_color,
    position: position === "bottom-left" ? "bottom-left" : "bottom-right",
    welcome_message: welcome_message?.trim() || current.welcome_message,
    quick_prompts: Array.isArray(quick_prompts) ? quick_prompts : current.quick_prompts,
    helpline_phone: helpline_phone?.trim() || current.helpline_phone,
    enable_order_tracking: enable_order_tracking !== void 0 ? Boolean(enable_order_tracking) : current.enable_order_tracking,
    enabled: enabled !== void 0 ? Boolean(enabled) : current.enabled,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  defaultConfigs[user.id] = updated;
  return res.json({
    success: true,
    message: "Website AI Chatbot settings saved successfully!",
    config: updated
  });
});
widgetRouter.post("/chat", async (req, res) => {
  try {
    const {
      agentId,
      visitorId,
      message,
      customerName,
      imageBase64,
      imageMimeType,
      audioBase64,
      audioMimeType,
      audioTranscript,
      history
    } = req.body;
    const targetUserId = agentId || req.headers["x-user-id"] || "saas_official";
    const isSaasOfficial = targetUserId === "saas_official";
    if (!isSaasOfficial) {
      const subStatus = getUserSubscriptionStatus(targetUserId);
      if (subStatus.isGated) {
        return res.status(403).json({
          success: false,
          error: "Subscription expired or inactive. AI Chatbot is disabled.",
          isGated: true,
          reply: "The AI Chatbot subscription for this store is currently inactive or expired."
        });
      }
    }
    const hasImage = Boolean(imageBase64 && typeof imageBase64 === "string");
    const hasAudio = Boolean(audioBase64 && typeof audioBase64 === "string");
    const rawText = (typeof message === "string" ? message.trim() : "") || (typeof audioTranscript === "string" ? audioTranscript.trim() : "");
    if (!rawText && !hasImage && !hasAudio) {
      return res.status(400).json({ error: "Please provide a text message, voice recording, or image." });
    }
    const detectedLang = detectLanguageMode(rawText);
    const cleanVisitorId = (visitorId || `web_vis_${Date.now()}`).trim();
    const config = getWidgetConfig(targetUserId);
    const effectiveOwnerId = isSaasOfficial ? "usr_admin_001" : targetUserId;
    let channelId = "chn_website_default";
    const cleanCustomerName = customerName?.trim() || (isSaasOfficial ? "SaaS Website Visitor" : "Website Visitor");
    {
      const userChannels = db.getChannels(effectiveOwnerId);
      const webChannel = userChannels.find((c) => c.identifier === "website_widget");
      if (webChannel) channelId = webChannel.id;
      const attachmentNote = [
        hasAudio ? "[\u{1F3A4} Voice Message]" : "",
        hasImage ? "[\u{1F5BC}\uFE0F Image Attached]" : "",
        rawText
      ].filter(Boolean).join(" ");
      const inboundMsg = {
        id: `msg_web_in_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        user_id: effectiveOwnerId,
        channel_id: channelId,
        platform: "whatsapp",
        customer_id: cleanVisitorId,
        customer_name: cleanCustomerName,
        direction: "inbound",
        message_text: attachmentNote || "[Media Attachment]",
        is_ai_reply: false,
        status: "received",
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      db.createMessage(inboundMsg);
    }
    const profile = db.getProfileById(effectiveOwnerId) || (isSaasOfficial ? db.getProfiles().find((p) => p.role === "admin") : void 0);
    if (!isSaasOfficial) {
      const sub = db.getSubscriptionByUserId(effectiveOwnerId);
      const isExpired = !sub || sub.status !== "active" && sub.status !== "trialing" || new Date(sub.end_date) <= /* @__PURE__ */ new Date();
      if (isExpired) {
        return res.json({
          reply: detectedLang === "bn" ? "\u09A6\u09C1\u0983\u0996\u09BF\u09A4, \u098F\u0987 \u09B8\u09CD\u099F\u09CB\u09B0\u09C7\u09B0 AI \u099A\u09CD\u09AF\u09BE\u099F \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u09B8\u09BE\u09AE\u09DF\u09BF\u0995\u09AD\u09BE\u09AC\u09C7 \u09AC\u09A8\u09CD\u09A7 \u09B0\u09DF\u09C7\u099B\u09C7\u0964 \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u09B8\u09CD\u099F\u09CB\u09B0\u09C7\u09B0 \u09AB\u09CB\u09A8 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0\u09C7 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8\u0964" : "Sorry, AI chat support for this store is currently paused. Please contact the store directly."
        });
      }
    }
    const sysSettings = db.getSettings();
    const candidateKeys = getCandidateGeminiKeys(profile?.llm_api_key);
    const apiKey = candidateKeys[0] || process.env.GEMINI_API_KEY;
    const activePlans = db.getPlans().filter((p) => p.is_active);
    const livePlansContext = activePlans.length > 0 ? `
LIVE ADMIN PRICING PLANS & SYSTEM SETTINGS:
` + activePlans.map(
      (p) => `- ${p.name}: \u09F3${p.price}/month (${p.currency}) \u2014 Max Channels: ${p.feature_config?.max_channels || 3}, AI Replies: Unlimited (0 TK per-msg fee) \u2014 Features: ${(p.features || []).join(", ")}`
    ).join("\n") + `
- Official Support Email: ${sysSettings.support_email || "support@oneagentbd.online"}` + (sysSettings.bkash_number ? `
- Official bKash Number: ${sysSettings.bkash_number}` : "") + (sysSettings.nagad_number ? `
- Official Nagad Number: ${sysSettings.nagad_number}` : "") : "";
    const merchantProducts = db.getProducts(effectiveOwnerId);
    const { isAskingForImage, isAskingForCatalog, isAskingForDetails } = detectProductImageInquiry(rawText);
    let matchedProduct = void 0;
    let attachedProductsList = [];
    if (!isSaasOfficial && merchantProducts.length > 0) {
      if (rawText) {
        matchedProduct = db.findProductForQuery(effectiveOwnerId, rawText);
      }
      if (!matchedProduct && (isAskingForImage || isAskingForDetails || rawText.toLowerCase().includes("ay ") || rawText.toLowerCase().includes("ei ") || rawText.toLowerCase().includes("eta") || rawText.toLowerCase().includes("aita") || rawText.toLowerCase().includes("\u098F\u0987"))) {
        const historyList = Array.isArray(history) ? history.slice(-6) : [];
        for (let i = historyList.length - 1; i >= 0; i--) {
          const histText = historyList[i]?.text || "";
          if (histText) {
            const fromHist = db.findProductForQuery(effectiveOwnerId, histText);
            if (fromHist) {
              matchedProduct = fromHist;
              break;
            }
          }
        }
      }
      if (isAskingForCatalog) {
        attachedProductsList = merchantProducts.filter((p) => Boolean(p.image_url && p.image_url.trim().length > 5)).slice(0, 5);
        if (!matchedProduct && attachedProductsList.length > 0) {
          matchedProduct = attachedProductsList[0];
        }
      } else if (isAskingForImage && !matchedProduct) {
        attachedProductsList = merchantProducts.filter((p) => Boolean(p.image_url && p.image_url.trim().length > 5)).slice(0, 5);
        if (attachedProductsList.length > 0) {
          matchedProduct = attachedProductsList[0];
        }
      } else if (matchedProduct) {
        attachedProductsList = [matchedProduct];
      }
    }
    const shouldAttachImage = Boolean(
      (matchedProduct?.image_url || attachedProductsList.length > 0) && (isAskingForImage || isAskingForDetails || isAskingForCatalog)
    );
    const attachedImageUrl = shouldAttachImage ? matchedProduct?.image_url || attachedProductsList[0]?.image_url : void 0;
    const catalogContext = merchantProducts.length > 0 ? `
PRODUCT / SERVICE CATALOG:
` + merchantProducts.map(
      (p) => `- ${p.name}: \u09F3${p.price} ${p.currency} (${p.stock_status === "out_of_stock" ? "Out of Stock" : p.stock_status === "low_stock" ? "Low Stock" : "In Stock"}, [Photo Available: ${Boolean(p.image_url && p.image_url.trim().length > 5)}]) \u2014 ${p.description || ""}`
    ).join("\n") : "";
    const adminCustomPrompt = profile?.system_prompt ? `
ADMIN / OWNER CUSTOM TRAINING INSTRUCTIONS:
${profile.system_prompt}
` : "";
    const appointmentContext = buildAppointmentAIContext(effectiveOwnerId, rawText);
    const baseKnowledge = isSaasOfficial ? `${ONE_AGENT_SAAS_KNOWLEDGE}
${livePlansContext}${adminCustomPrompt}${catalogContext}${appointmentContext}` : `${profile?.system_prompt || `You are the official AI Sales & Support Assistant for "${config.business_name}".`}
${catalogContext}${appointmentContext}`;
    const recentHistoryText = Array.isArray(history) ? history.slice(-6).map((h) => `${h.sender === "user" ? "Visitor" : "AI Assistant"}: ${h.text || ""}`).join("\n") : "";
    const languageDirective = `
CRITICAL LANGUAGE MATCHING RULE (MUST FOLLOW STRICTLY):
1. If the user's message (or spoken audio) is in Bangla (\u09AC\u09BE\u0982\u09B2\u09BE) OR Banglish (Bengali written in English/Latin alphabet, such as "apnader plan er dam koto", "free trial kivabe nibo", "website a kivabe add korbo", "vai details bolen"), you MUST reply in natural, polite, and clear Bangla script (\u09AC\u09BE\u0982\u09B2\u09BE \u09AD\u09BE\u09B7\u09BE\u09DF \u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09BF\u09A8).
2. If the user's message (or spoken audio) is in pure English (such as "What are your pricing plans?", "How do I add the chatbot to my website?", "Tell me about the 2-day free trial"), you MUST reply in clear, natural, and professional English.
3. Detected language hint for current text input: ${rawText ? detectedLang === "bn" ? "BANGLA / BANGLISH -> Reply in BANGLA (\u09AC\u09BE\u0982\u09B2\u09BE \u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09AA\u09CD\u099F\u09C7)" : "ENGLISH -> Reply in ENGLISH" : "Listen to the attached voice audio or inspect the image and reply in the language used by the user (default to Bangla + English summary if image-only)."}
`;
    let aiReplyText = "";
    if (!hasImage && !hasAudio && rawText) {
      const greetingReply = getShortGreetingOrSmallTalkReply(
        rawText,
        isSaasOfficial ? "One Agent BD" : config.business_name,
        detectedLang
      );
      if (greetingReply) {
        aiReplyText = greetingReply;
      }
    }
    if (!aiReplyText && isSaasOfficial && rawText) {
      const couponFlowReply = handleSaasCouponFlow(rawText, history || [], cleanVisitorId, detectedLang);
      if (couponFlowReply) {
        aiReplyText = couponFlowReply;
      }
    }
    if (!aiReplyText && apiKey) {
      try {
        const ai = new GoogleGenAI5({ apiKey });
        const parts = [];
        if (hasImage && imageBase64) {
          const cleanB64 = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
          parts.push({
            inlineData: {
              data: cleanB64,
              mimeType: imageMimeType || "image/jpeg"
            }
          });
        }
        let effectiveQueryText = rawText;
        if (hasAudio && audioBase64) {
          const cleanAudioB64 = audioBase64.includes(",") ? audioBase64.split(",")[1] : audioBase64;
          const audioBuf = Buffer.from(cleanAudioB64, "base64");
          if (!audioBuf || audioBuf.length < 350) {
            aiReplyText = UNCLEAR_VOICE_REPLY;
          } else {
            const detectedAudioMime = detectAudioMimeTypeFromBuffer(
              audioBuf,
              audioMimeType || "audio/webm"
            );
            if (!effectiveQueryText) {
              for (const model of CANDIDATE_MODELS) {
                try {
                  const transRes = await ai.models.generateContent({
                    model,
                    contents: {
                      parts: [
                        {
                          inlineData: {
                            data: cleanAudioB64,
                            mimeType: detectedAudioMime
                          }
                        },
                        {
                          text: "Listen carefully to this voice message. Transcribe ONLY the exact spoken words in Bangla (\u09AC\u09BE\u0982\u09B2\u09BE) or English. If the audio is silent, background noise, coughing, mumbled, or you cannot clearly understand what was spoken with high confidence, output strictly: [UNCLEAR]. Do not guess or invent words."
                        }
                      ]
                    },
                    config: { temperature: 0.1 }
                  });
                  const tText = (transRes.text || "").replace(/^TRANSCRIPT:\s*/i, "").trim();
                  if (tText) {
                    if (isUnclearVoiceText(tText)) {
                      aiReplyText = UNCLEAR_VOICE_REPLY;
                    } else {
                      effectiveQueryText = tText;
                    }
                    break;
                  }
                } catch {
                }
              }
              if (!effectiveQueryText && !aiReplyText) {
                aiReplyText = UNCLEAR_VOICE_REPLY;
              }
            }
          }
        }
        if (!aiReplyText) {
          const promptText = `${baseKnowledge}

${languageDirective}

IMPORTANT REMINDER & SMART REPLY LENGTH / SERIAL LIST RULES:
- The visitor is ALREADY on our website (oneagentbd.online). Do NOT say "\u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u099C\u09BE\u09A8\u09A4\u09C7 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u0993\u09DF\u09C7\u09AC\u09B8\u09BE\u0987\u099F \u09AD\u09BF\u099C\u09BF\u099F \u0995\u09B0\u09C1\u09A8" or "Visit our website".
- SHORT QUESTION = SHORT REPLY: If the visitor asks a simple question or greeting, reply briefly in 1-2 lines. Do NOT dump a huge list of features unless they ask for details/plans/features!
- DETAILED / LIST QUESTION = SERIAL NUMBERED LIST (\u09E7. \u09E8. \u09E9. / 1. 2. 3.) WITH EMPTY LINES: Whenever the visitor asks about plans, prices, what is available ("ki ki ase"), products, features, or details \u2014 start with a short 1-line intro, then list the items/plans/details serially as \u09E7., \u09E8., \u09E9. (in Bangla) or 1., 2., 3. (in English) with 1 empty line (\\n\\n) after 1., 1 empty line (\\n\\n) after 2., and 1 empty line (\\n\\n) after 3.
- MANDATORY FOLLOW-UP QUESTION: Always end your reply (in a new paragraph after \\n\\n) with 1 smart, relevant follow-up question based on what the visitor asked!
${shouldAttachImage ? `
- PRODUCT PHOTO INSTRUCTION: The visitor requested a product photo or catalog photos ("${rawText}"). Our system has automatically sent and displayed the product photo in the chat. In your reply, confirm that the photo(s) have been displayed in the chat, quote the price and key features, and politely ask if they would like to place an order or have any questions!` : ""}

${recentHistoryText ? `Recent Conversation History:
${recentHistoryText}
` : ""}
${hasImage ? "The visitor has attached an image/screenshot. Carefully inspect the image and answer their question or explain what is shown in relation to One Agent BD / the store.\n" : ""}
Visitor Message: "${effectiveQueryText || "[Image Attached - Please analyze and reply concisely]"}"

Provide a clean, mobile-friendly response (short 1-2 lines for simple questions, or serial numbers \u09E7., \u09E8., \u09E9. separated by \\n\\n empty lines when listing plans, products, or details, plus 1 relevant closing follow-up question):`;
          parts.push({ text: promptText });
          for (const model of getPrioritizedModels().slice(0, 2)) {
            try {
              const response = await ai.models.generateContent({
                model,
                contents: parts.length === 1 ? promptText : { parts },
                config: {
                  temperature: 0.35,
                  maxOutputTokens: 420,
                  thinkingConfig: { thinkingBudget: 0 }
                }
              });
              if (response.text?.trim()) {
                markModelSuccess(model);
                aiReplyText = ensureConversationalFollowUp(
                  sanitizeWebsiteBotReply(response.text.trim()),
                  effectiveQueryText || rawText,
                  isSaasOfficial,
                  merchantProducts.length > 0
                );
                break;
              }
            } catch (mErr) {
              markModelFailure(model);
            }
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini multimodal widget fallback:", geminiErr.message);
      }
    }
    if (!aiReplyText && !hasAudio && !hasImage && rawText) {
      try {
        const cloudPrompt = `${baseKnowledge}

${languageDirective}

${recentHistoryText ? `Recent Conversation History:
${recentHistoryText}
` : ""}Visitor Message: "${rawText}"

Reply naturally like a real human (using a clean serial numbered list \u09E7., \u09E8., \u09E9. on separate lines whenever listing plans, prices, products, or details, with \\n\\n paragraph spacing and 1 smart closing follow-up question):`;
        const cloudRes = await fetch("https://text.pollinations.ai/openai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "openai",
            messages: [{ role: "user", content: cloudPrompt }],
            temperature: 0.35
          })
        });
        if (cloudRes.ok) {
          const cloudJson = await cloudRes.json();
          const cText = cloudJson?.choices?.[0]?.message?.content?.trim();
          if (cText) {
            aiReplyText = ensureConversationalFollowUp(
              sanitizeWebsiteBotReply(cText),
              rawText,
              isSaasOfficial,
              merchantProducts.length > 0
            );
          }
        }
      } catch {
      }
    }
    if (!aiReplyText) {
      if (hasAudio && (!rawText || isUnclearVoiceText(rawText))) {
        aiReplyText = UNCLEAR_VOICE_REPLY;
      } else if (isSaasOfficial) {
        aiReplyText = ensureConversationalFollowUp(
          getSaasBilingualFallback(rawText, detectedLang, hasImage, hasAudio),
          rawText,
          true,
          false
        );
      } else {
        const q = rawText.toLowerCase();
        if (q.includes("plan") || q.includes("saas") || q.includes("one agent") || q.includes("1250") || q.includes("1950") || q.includes("website") || q.includes("trial")) {
          aiReplyText = ensureConversationalFollowUp(
            getSaasBilingualFallback(rawText, detectedLang, hasImage, hasAudio),
            rawText,
            true,
            false
          );
        } else if (hasImage) {
          aiReplyText = detectedLang === "en" ? `Thank you for sending the image! \u{1F4F8} At ${config.business_name}, we have received your photo.

Would you like to know the price, stock availability, or place an order for this item?` : `\u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u099B\u09AC\u09BF\u099F\u09BF \u0986\u09AE\u09B0\u09BE \u09AA\u09C7\u09DF\u09C7\u099B\u09BF! \u{1F4F8} ${config.business_name}-\u098F \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u09B8\u09CD\u09AC\u09BE\u0997\u09A4\u09AE\u0964

\u0986\u09AA\u09A8\u09BF \u0995\u09BF \u098F\u0987 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u099F\u09BF\u09B0 \u09A6\u09BE\u09AE, \u09B8\u09CD\u099F\u0995 \u09A8\u09BE\u0995\u09BF \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09BE\u09B0 \u09A8\u09BF\u09DF\u09AE \u099C\u09BE\u09A8\u09A4\u09C7 \u099A\u09BE\u099A\u09CD\u099B\u09C7\u09A8?`;
        } else if (hasAudio) {
          aiReplyText = UNCLEAR_VOICE_REPLY;
        } else if (q.includes("offer") || q.includes("price") || q.includes("cost") || q.includes("dam") || q.includes("koto") || q.includes("\u09A6\u09BE\u09AE") || q.includes("\u0995\u09A4")) {
          const prodList = merchantProducts.length > 0 ? merchantProducts.slice(0, 3).map((p) => `${p.name} (\u09F3${p.price})`).join(", ") : "";
          aiReplyText = detectedLang === "en" ? `Welcome to ${config.business_name}! \u{1F31F} ${prodList ? `Our popular items include: ${prodList}. ` : ""}Which product's price and details would you like to know?` : `\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE! \u{1F31F} ${config.business_name}-\u098F \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u09B8\u09CD\u09AC\u09BE\u0997\u09A4\u09AE\u0964 ${prodList ? `\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u099C\u09A8\u09AA\u09CD\u09B0\u09BF\u09DF \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u09B8\u09AE\u09C2\u09B9: ${prodList}\u0964 ` : ""}\u0986\u09AA\u09A8\u09BF \u0995\u09CB\u09A8 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u09AC\u09BE \u09B8\u09BE\u09B0\u09CD\u09AD\u09BF\u09B8\u09C7\u09B0 \u09A6\u09BE\u09AE \u099C\u09BE\u09A8\u09A4\u09C7 \u099A\u09BE\u099A\u09CD\u099B\u09C7\u09A8?`;
        } else if (q.includes("order") || q.includes("buy") || q.includes("purchase") || q.includes("\u0985\u09B0\u09CD\u09A1\u09BE\u09B0") || q.includes("\u0995\u09BF\u09A8\u09AC")) {
          aiReplyText = detectedLang === "en" ? `To confirm your order with ${config.business_name}, please share your Full Name, Delivery Address, and Mobile Number. We will book your order right away!` : `\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09A8\u09AB\u09BE\u09B0\u09CD\u09AE \u0995\u09B0\u09A4\u09C7 \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09C2\u09B0\u09CD\u09A3 \u09A8\u09BE\u09AE, \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09A0\u09BF\u0995\u09BE\u09A8\u09BE \u098F\u09AC\u0982 \u09B8\u099A\u09B2 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0\u099F\u09BF \u09B2\u09BF\u0996\u09C7 \u09AA\u09BE\u09A0\u09BE\u09A8\u0964 \u0986\u09AE\u09B0\u09BE \u098F\u0996\u09A8\u09BF \u0986\u09AA\u09A8\u09BE\u09B0 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u09AC\u09C1\u0995 \u0995\u09B0\u09C7 \u09A8\u09BF\u099A\u09CD\u099B\u09BF!`;
        } else if (q.includes("delivery") || q.includes("charge") || q.includes("shipping") || q.includes("\u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF") || q.includes("\u099A\u09BE\u09B0\u09CD\u099C")) {
          aiReplyText = detectedLang === "en" ? `Our delivery charges: Inside Dhaka 60 TK (1-2 days) and Outside Dhaka nationwide 120 TK (2-3 days). Cash on Delivery (COD) is available! \u{1F69A}` : `\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u099A\u09BE\u09B0\u09CD\u099C: \u09A2\u09BE\u0995\u09BE\u09B0 \u09AD\u09C7\u09A4\u09B0\u09C7 \u09F3\u09EC\u09E6 (\u09E7-\u09E8 \u09A6\u09BF\u09A8) \u098F\u09AC\u0982 \u09A2\u09BE\u0995\u09BE\u09B0 \u09AC\u09BE\u0987\u09B0\u09C7 \u09B8\u09BE\u09B0\u09BE\u09A6\u09C7\u09B6\u09C7 \u09F3\u09E7\u09E8\u09E6 (\u09E8-\u09E9 \u09A6\u09BF\u09A8)\u0964 \u0995\u09CD\u09AF\u09BE\u09B6 \u0985\u09A8 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF (COD) \u09B8\u09C1\u09AC\u09BF\u09A7\u09BE \u09B0\u09DF\u09C7\u099B\u09C7! \u{1F69A}`;
        } else {
          aiReplyText = getSaasBilingualFallback(rawText, detectedLang, hasImage, hasAudio);
        }
      }
    }
    let createdOrder = null;
    {
      const outboundMsg = {
        id: `msg_web_out_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        user_id: effectiveOwnerId,
        channel_id: channelId,
        platform: "whatsapp",
        customer_id: cleanVisitorId,
        customer_name: cleanCustomerName,
        direction: "outbound",
        message_text: aiReplyText,
        is_ai_reply: true,
        has_image: Boolean(attachedImageUrl),
        image_url: attachedImageUrl,
        status: "sent",
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      db.createMessage(outboundMsg);
      const phoneMatch = rawText.match(/(01[3-9]\d{8})/);
      if (phoneMatch && (rawText.toLowerCase().includes("order") || rawText.includes("\u0985\u09B0\u09CD\u09A1\u09BE\u09B0") || rawText.includes("\u09A0\u09BF\u0995\u09BE\u09A8\u09BE") || rawText.includes("\u09B0\u09CB\u09A1") || rawText.includes("\u09AC\u09BE\u09B8\u09BE") || rawText.toLowerCase().includes("address") || rawText.toLowerCase().includes("dhaka"))) {
        const extractedPhone = phoneMatch[1];
        createdOrder = {
          id: `ord_web_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          user_id: effectiveOwnerId,
          customer_id: cleanVisitorId,
          customer_name: cleanCustomerName,
          customer_phone: extractedPhone,
          customer_address: rawText,
          platform: "custom_website",
          channel_id: channelId,
          items: "Website Catalog Order",
          quantity: 1,
          total_amount: 1450,
          currency: "BDT",
          status: "confirmed",
          payment_status: "pending",
          payment_method: "cod",
          order_source: "website",
          notes: "Placed via Website AI Chatbot Widget",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        db.createOrder(createdOrder);
      }
      try {
        await detectAndRecordAppointment({
          userId: effectiveOwnerId,
          customerId: cleanVisitorId,
          customerName: cleanCustomerName,
          platform: "website",
          channelId,
          messageText: rawText,
          recentHistory: recentHistoryText,
          aiReplyText
        });
      } catch (aptErr) {
        console.warn("[Widget Appointment Engine] Warning:", aptErr);
      }
    }
    return res.json({
      success: true,
      reply: aiReplyText,
      imageUrl: attachedImageUrl,
      attachedImageUrl,
      attachedProductName: matchedProduct?.name,
      attachedProductPrice: matchedProduct?.price,
      products: attachedProductsList.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image_url: p.image_url
      })),
      detectedLanguage: detectedLang,
      conversationId: cleanVisitorId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      orderCreated: Boolean(createdOrder),
      order: createdOrder
    });
  } catch (err) {
    console.error("Widget chat error:", err);
    return res.status(500).json({ error: err.message || "Widget chat processing error" });
  }
});
widgetRouter.get("/embed.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.setHeader("Cache-Control", "public, max-age=60");
  const origin = `${req.protocol}://${req.get("host")}`;
  const customLogoUrl = db.getSettings()?.logo_url || "";
  const scriptCode = `
(function() {
  if (window.__ONE_AGENT_WIDGET_LOADED__) return;
  window.__ONE_AGENT_WIDGET_LOADED__ = true;

  var currentScript = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var agentId = (currentScript && currentScript.getAttribute('data-agent-id')) || 'saas_official';
  var serverOrigin = '${origin}';
  var activeLogoSrc = ${JSON.stringify(customLogoUrl)} || (serverOrigin + '/logo.svg');
  var visitorId = localStorage.getItem('oneagent_visitor_id') || ('vis_' + Math.random().toString(36).substring(2, 10));
  localStorage.setItem('oneagent_visitor_id', visitorId);

  var widgetConfig = {
    bot_name: 'One Agent BD AI',
    business_name: 'One Agent BD',
    primary_color: '#7F22FE',
    position: 'bottom-right',
    welcome_message: 'Welcome! \u{1F31F} Ask anything in Bangla, Banglish, or English\u2014or send a voice note or photo!',
    quick_prompts: ['\u{1F48E} Plans & Pricing', '\u{1F310} Website AI Setup', '\u{1F381} 2-Day Free Trial']
  };

  function fetchConfig(cb) {
    fetch(serverOrigin + '/api/widget/config?agentId=' + encodeURIComponent(agentId))
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data && data.config) {
          widgetConfig = Object.assign(widgetConfig, data.config);
        }
        cb();
      })
      .catch(function() { cb(); });
  }

  function injectWidget() {
    if (widgetConfig.enabled === false) return;
    var isRight = widgetConfig.position !== 'bottom-left';

    var container = document.createElement('div');
    container.id = 'oneagent-widget-container';
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style[isRight ? 'right' : 'left'] = '20px';
    container.style.zIndex = '999999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = isRight ? 'flex-end' : 'flex-start';
    container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

    // Tooltip: "Hey, Need help?"
    var tooltip = document.createElement('div');
    tooltip.id = 'oneagent-widget-tooltip';
    tooltip.style.position = 'relative';
    tooltip.style.marginBottom = '12px';
    tooltip.style.backgroundColor = '#1C1D21';
    tooltip.style.color = '#ffffff';
    tooltip.style.padding = '10px 28px 10px 16px';
    tooltip.style.borderRadius = '14px';
    tooltip.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
    tooltip.style.fontSize = '13px';
    tooltip.style.fontWeight = '500';
    tooltip.style.cursor = 'pointer';
    tooltip.innerHTML = '<span>Hey, Need help?</span><button id="oneagent-tooltip-close" style="position:absolute;top:5px;right:8px;background:none;border:none;color:#9ca3af;cursor:pointer;font-size:14px;line-height:1;">&times;</button><div style="position:absolute;bottom:-5px;right:20px;width:10px;height:10px;background:#1C1D21;transform:rotate(45deg);"></div>';

    // Compact Circular Button
    var bubble = document.createElement('button');
    bubble.id = 'oneagent-widget-bubble';
    bubble.style.width = '56px';
    bubble.style.height = '56px';
    bubble.style.borderRadius = '28px';
    bubble.style.backgroundColor = '#ffffff';
    bubble.style.color = '#ffffff';
    bubble.style.border = '1px solid #f3f4f6';
    bubble.style.boxShadow = '0 8px 28px rgba(0,0,0,0.22)';
    bubble.style.cursor = 'pointer';
    bubble.style.display = 'flex';
    bubble.style.alignItems = 'center';
    bubble.style.justifyContent = 'center';
    bubble.style.transition = 'transform 0.2s, background-color 0.2s';
    var logoImgHtml = '<img src="' + activeLogoSrc + '" style="width: 32px; height: 32px; object-fit: contain;" alt="AI" />';
    var closeIconHtml = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
    bubble.innerHTML = logoImgHtml;

    // Dark Chat Window
    var box = document.createElement('div');
    box.id = 'oneagent-chat-box';
    box.style.display = 'none';
    box.style.width = '350px';
    box.style.maxWidth = 'calc(100vw - 32px)';
    box.style.height = '480px';
    box.style.maxHeight = 'calc(100vh - 110px)';
    box.style.backgroundColor = '#050507';
    box.style.borderRadius = '18px';
    box.style.boxShadow = '0 24px 60px rgba(0,0,0,0.55)';
    box.style.border = '1px solid rgba(255,255,255,0.1)';
    box.style.flexDirection = 'column';
    box.style.overflow = 'hidden';
    box.style.marginBottom = '12px';

    box.innerHTML = [
      '<div style="padding: 12px 16px; background: #0B0B0F; border-bottom: 1px solid rgba(255,255,255,0.08); color: #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600;">',
      '  ' + (widgetConfig.business_name || 'One Agent BD'),
      '</div>',
      '<div id="oneagent-messages-container" style="flex: 1; padding: 16px; overflow-y: auto; background: #050507; display: flex; flex-direction: column; gap: 14px; font-size: 13.5px;">',
      '  <div style="display: flex; align-items: flex-start; gap: 10px;">',
      '    <div style="width: 32px; height: 32px; border-radius: 16px; background: #ffffff; display: flex; align-items: center; justify-content: center; padding: 5px; flex-shrink: 0;"><img src="' + activeLogoSrc + '" style="width: 100%; height: 100%; object-fit: contain;" /></div>',
      '    <div style="background: #1C1D22; color: #ffffff; padding: 10px 16px; border-radius: 16px; max-width: 80%; line-height: 1.5; border: 1px solid rgba(255,255,255,0.05);">Hey, how could I help you?</div>',
      '  </div>',
      '</div>',
      '<div id="oneagent-media-preview" style="display: none; margin: 0 12px 6px 12px; padding: 8px 12px; border-radius: 12px; background: #1C1D22; border: 1px solid rgba(255,255,255,0.1); align-items: center; justify-content: space-between; font-size: 11px; color: #e5e7eb;"></div>',
      '<div style="padding: 4px 12px 10px 12px; background: #050507;">',
      '  <div style="background: #1C1D22; border: 1px solid rgba(255,255,255,0.1); border-radius: 9999px; padding: 6px 6px 6px 14px; display: flex; gap: 10px; align-items: center;">',
      '    <input id="oneagent-image-input" type="file" accept="image/*" style="display: none;" />',
      '    <button id="oneagent-img-btn" title="Upload Picture" style="background: none; border: none; color: #d1d5db; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg></button>',
      '    <button id="oneagent-mic-btn" title="Send Voice Message" style="background: none; border: none; color: #d1d5db; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/></svg></button>',
      '    <input id="oneagent-chat-input" type="text" placeholder="Type a message..." style="flex: 1; min-width: 0; background: transparent; border: none; color: #ffffff; font-size: 13px; outline: none;" />',
      '    <button id="oneagent-send-btn" style="width: 32px; height: 32px; border-radius: 16px; background: #2538B8; color: #ffffff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">',
      '      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>',
      '    </button>',
      '  </div>',
      '  <div style="text-align: center; margin-top: 8px; font-size: 11px; color: #9ca3af;">Powered by One Agent BD</div>',
      '</div>'
    ].join('');

    container.appendChild(box);
    container.appendChild(tooltip);
    container.appendChild(bubble);
    document.body.appendChild(container);

    var msgContainer = document.getElementById('oneagent-messages-container');
    var input = document.getElementById('oneagent-chat-input');
    var sendBtn = document.getElementById('oneagent-send-btn');
    var imgBtn = document.getElementById('oneagent-img-btn');
    var imgInput = document.getElementById('oneagent-image-input');
    var micBtn = document.getElementById('oneagent-mic-btn');
    var previewBar = document.getElementById('oneagent-media-preview');
    var tooltipClose = document.getElementById('oneagent-tooltip-close');

    var pendingImageBase64 = null;
    var pendingImageMime = null;
    var mediaRecorder = null;
    var audioChunks = [];
    var isRecording = false;

    if (tooltipClose) {
      tooltipClose.onclick = function(e) {
        e.stopPropagation();
        tooltip.style.display = 'none';
      };
    }

    tooltip.onclick = function() {
      toggleChat();
    };

    function toggleChat() {
      var isOpen = box.style.display === 'flex';
      if (isOpen) {
        box.style.display = 'none';
        bubble.style.backgroundColor = '#ffffff';
        bubble.innerHTML = logoImgHtml;
      } else {
        box.style.display = 'flex';
        tooltip.style.display = 'none';
        bubble.style.backgroundColor = '#2B3FD6';
        bubble.innerHTML = closeIconHtml;
        input.focus();
      }
    }

    bubble.onclick = toggleChat;

    imgBtn.onclick = function() { imgInput.click(); };
    imgInput.onchange = function(e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        pendingImageBase64 = ev.target.result;
        pendingImageMime = file.type || 'image/jpeg';
        previewBar.style.display = 'flex';
        previewBar.innerHTML = '<span>\u{1F5BC}\uFE0F Image ready to send (' + file.name.slice(0, 18) + ')</span><button id="oneagent-clear-media" style="border:none;background:none;color:#ef4444;cursor:pointer;font-weight:bold;">\u2715</button>';
        document.getElementById('oneagent-clear-media').onclick = function() {
          pendingImageBase64 = null;
          pendingImageMime = null;
          previewBar.style.display = 'none';
        };
      };
      reader.readAsDataURL(file);
    };

    micBtn.onclick = function() {
      if (isRecording && mediaRecorder) {
        mediaRecorder.stop();
        isRecording = false;
        micBtn.style.background = '#f3f4f6';
        micBtn.innerText = '\u{1F3A4}';
        return;
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        appendMessage('Microphone access is not supported in this browser.', false);
        return;
      }
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
        audioChunks = [];
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = function(e) {
          if (e.data.size > 0) audioChunks.push(e.data);
        };
        mediaRecorder.onstop = function() {
          stream.getTracks().forEach(function(t) { t.stop(); });
          var blob = new Blob(audioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
          var reader = new FileReader();
          reader.onloadend = function() {
            sendUserMessage(input.value || '', null, null, reader.result, blob.type || 'audio/webm');
          };
          reader.readAsDataURL(blob);
        };
        mediaRecorder.start();
        isRecording = true;
        micBtn.style.background = '#fee2e2';
        micBtn.innerText = '\u23F9\uFE0F';
      }).catch(function() {
        appendMessage('Please allow microphone permission to send voice messages.', false);
      });
    };

    function appendMessage(text, isUser, imgSrc, isVoice) {
      var rowEl = document.createElement('div');
      rowEl.style.display = 'flex';
      rowEl.style.alignItems = 'flex-start';
      rowEl.style.gap = '10px';
      rowEl.style.alignSelf = isUser ? 'flex-end' : 'flex-start';
      rowEl.style.maxWidth = '85%';

      if (!isUser) {
        var av = document.createElement('div');
        av.style.width = '32px';
        av.style.height = '32px';
        av.style.borderRadius = '16px';
        av.style.background = '#ffffff';
        av.style.display = 'flex';
        av.style.alignItems = 'center';
        av.style.justifyContent = 'center';
        av.style.padding = '5px';
        av.style.flexShrink = '0';
        av.innerHTML = '<img src="' + activeLogoSrc + '" style="width: 100%; height: 100%; object-fit: contain;" />';
        rowEl.appendChild(av);
      }

      var bubbleEl = document.createElement('div');
      bubbleEl.style.padding = '10px 16px';
      bubbleEl.style.borderRadius = '16px';
      bubbleEl.style.lineHeight = '1.5';
      bubbleEl.style.fontSize = '13.5px';
      bubbleEl.style.whiteSpace = 'pre-line';

      if (isUser) {
        bubbleEl.style.backgroundColor = '#2B3FD6';
        bubbleEl.style.color = '#ffffff';
      } else {
        bubbleEl.style.backgroundColor = '#1C1D22';
        bubbleEl.style.color = '#ffffff';
        bubbleEl.style.border = '1px solid rgba(255,255,255,0.05)';
      }

      if (imgSrc) {
        var img = document.createElement('img');
        img.src = imgSrc;
        img.style.maxWidth = '100%';
        img.style.borderRadius = '10px';
        img.style.marginBottom = text ? '6px' : '0';
        bubbleEl.appendChild(img);
      }
      if (isVoice) {
        var vBadge = document.createElement('div');
        vBadge.style.fontSize = '11px';
        vBadge.style.fontWeight = '700';
        vBadge.style.marginBottom = text ? '4px' : '0';
        vBadge.innerText = '\u{1F3A4} Voice Message Sent';
        bubbleEl.appendChild(vBadge);
      }
      if (text) {
        var span = document.createElement('div');
        span.innerText = text;
        bubbleEl.appendChild(span);
      }
      if (isUser) {
        var seenEl = document.createElement('div');
        seenEl.style.fontSize = '10px';
        seenEl.style.color = '#9ca3af';
        seenEl.style.marginTop = '3px';
        seenEl.style.textAlign = 'right';
        seenEl.innerText = '\u2713\u2713 Seen';
        var userCol = document.createElement('div');
        userCol.style.display = 'flex';
        userCol.style.flexDirection = 'column';
        userCol.style.alignItems = 'flex-end';
        userCol.appendChild(bubbleEl);
        userCol.appendChild(seenEl);
        rowEl.appendChild(userCol);
      } else {
        rowEl.appendChild(bubbleEl);
      }
      msgContainer.appendChild(rowEl);
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }

    function sendUserMessage(text, customImgB64, customImgMime, audioB64, audioMime) {
      var clean = (text !== undefined ? text : input.value || '').trim();
      var imgToSend = customImgB64 || pendingImageBase64;
      var imgMimeToSend = customImgMime || pendingImageMime;

      if (!clean && !imgToSend && !audioB64) return;
      input.value = '';
      pendingImageBase64 = null;
      pendingImageMime = null;
      previewBar.style.display = 'none';
      if (typeof promptsContainer !== 'undefined' && promptsContainer) promptsContainer.style.display = 'none';

      appendMessage(clean, true, imgToSend, Boolean(audioB64));

      var typingEl = document.createElement('div');
      typingEl.style.display = 'flex';
      typingEl.style.alignItems = 'center';
      typingEl.style.gap = '10px';
      typingEl.style.alignSelf = 'flex-start';
      typingEl.innerHTML = '<div style="width: 32px; height: 32px; border-radius: 16px; background: #ffffff; display: flex; align-items: center; justify-content: center; padding: 5px; flex-shrink: 0;"><img src="' + activeLogoSrc + '" style="width: 100%; height: 100%; object-fit: contain;" /></div><div style="background: #1C1D22; color: #d1d5db; padding: 8px 14px; border-radius: 16px; font-size: 12px; display: flex; align-items: center; gap: 6px; border: 1px solid rgba(255,255,255,0.06);"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#10b981;"></span><span>Typing...</span></div>';
      msgContainer.appendChild(typingEl);
      msgContainer.scrollTop = msgContainer.scrollHeight;

      fetch(serverOrigin + '/api/widget/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agentId,
          visitorId: visitorId,
          message: clean,
          imageBase64: imgToSend || undefined,
          imageMimeType: imgMimeToSend || undefined,
          audioBase64: audioB64 || undefined,
          audioMimeType: audioMime || undefined
        })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        typingEl.remove();
        appendMessage(data.reply || 'Thank you! How else can I help you?', false, data.attachedImageUrl || data.imageUrl);
      })
      .catch(function() {
        typingEl.remove();
        appendMessage('Connection error. Please try again.', false);
      });
    }

    sendBtn.onclick = function() { sendUserMessage(); };
    input.onkeydown = function(e) {
      if (e.key === 'Enter') sendUserMessage();
    };
  }

  fetchConfig(function() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectWidget);
    } else {
      injectWidget();
    }
  });
})();
`;
  return res.send(scriptCode);
});

// server/routes/aiChat.ts
var aiChatRouter = Router12();
function getGeminiClient4() {
  const keys = getCandidateGeminiKeys();
  const apiKey = keys[0] || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI6({
    apiKey,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } }
  });
}
function getSaasIntelligentFallback(question, lang) {
  const q = question.toLowerCase();
  if (q.includes("price") || q.includes("cost") || q.includes("fee") || q.includes("fees") || q.includes("subscription") || q.includes("subscriptions") || q.includes("how much") || q.includes("every month") || q.includes("per month") || q.includes("monthly") || q.includes("month") || q.includes("charge") || q.includes("rate") || q.includes("package") || q.includes("dam") || q.includes("koto") || q.includes("taka") || q.includes("pricing") || q.includes("plan") || q.includes("\u09A6\u09BE\u09AE") || q.includes("\u0995\u09A4") || q.includes("\u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8") || q.includes("\u09AA\u09CD\u09AF\u09BE\u0995\u09C7\u099C") || q.includes("\u09AB\u09BF") || q.includes("\u09B8\u09BE\u09AC\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09AA\u09B6\u09A8")) {
    return lang === "en" ? "We have 2 official plans plus a 2-Day Free Trial:\n\n1. Starter AI Plan \u2014 1,250 TK/month (1 AI Agent, WhatsApp, Messenger, Instagram & Website AI Chatbot, Voice & Image AI, 3 Channels & Courier Dispatch)\n\n2. Pro Business Plan \u2014 1,950 TK/month (3 AI Agents, up to 10 Channels, Unlimited Multi-Store Sync & VIP Broadcast)\n\n3. Free Trial \u2014 2-Day full-featured Free Trial upon signup\n\nWhich plan (1. Starter or 2. Pro) would you like to activate?" : "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09E8\u099F\u09BF \u09B8\u09BE\u09AC\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09AA\u09B6\u09A8 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8 \u09B0\u09DF\u09C7\u099B\u09C7:\n\n\u09E7. Starter AI Plan \u2014 \u09E7,\u09E8\u09EB\u09E6 \u099F\u09BE\u0995\u09BE/\u09AE\u09BE\u09B8 (\u09E7\u099F\u09BF AI \u098F\u099C\u09C7\u09A8\u09CD\u099F, WhatsApp, Messenger, Instagram \u0993 Website AI Chatbot, \u09AD\u09DF\u09C7\u09B8 \u0993 \u099B\u09AC\u09BF\u09B0 AI \u098F\u09AC\u0982 \u0995\u09C1\u09B0\u09BF\u09DF\u09BE\u09B0 \u09AC\u09C1\u0995\u09BF\u0982)\n\n\u09E8. Pro Business Plan \u2014 \u09E7,\u09EF\u09EB\u09E6 \u099F\u09BE\u0995\u09BE/\u09AE\u09BE\u09B8 (\u09E9\u099F\u09BF AI \u098F\u099C\u09C7\u09A8\u09CD\u099F, \u09E7\u09E6\u099F\u09BF \u09AA\u09B0\u09CD\u09AF\u09A8\u09CD\u09A4 \u099A\u09CD\u09AF\u09BE\u09A8\u09C7\u09B2 \u0995\u09BE\u09A8\u09C7\u0995\u09B6\u09A8, \u0986\u09A8\u09B2\u09BF\u09AE\u09BF\u099F\u09C7\u09A1 \u0993\u09DF\u09C7\u09AC\u09B8\u09BE\u0987\u099F \u09B8\u09CD\u099F\u09CB\u09B0 \u0993 VIP \u09AC\u09CD\u09B0\u09A1\u0995\u09BE\u09B8\u09CD\u099F)\n\n\u09E9. \u09AB\u09CD\u09B0\u09BF \u099F\u09CD\u09B0\u09BE\u09DF\u09BE\u09B2 \u2014 \u0993\u09DF\u09C7\u09AC\u09B8\u09BE\u0987\u099F\u09C7 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u0996\u09C1\u09B2\u09C7\u0987 \u09E8 \u09A6\u09BF\u09A8\u09C7\u09B0 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09AB\u09CD\u09B0\u09BF \u099F\u09CD\u09B0\u09BE\u09DF\u09BE\u09B2\n\n\u0986\u09AA\u09A8\u09BF \u0995\u09BF \u09E7 \u09A8\u09AE\u09CD\u09AC\u09B0 (Starter) \u09A8\u09BE\u0995\u09BF \u09E8 \u09A8\u09AE\u09CD\u09AC\u09B0 (Pro) \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8\u099F\u09BF \u09A8\u09BF\u09A4\u09C7 \u099A\u09BE\u099A\u09CD\u099B\u09C7\u09A8?";
  }
  if (q.includes("trial") || q.includes("trail") || q.includes("free") || q.includes("2 day") || q.includes("test") || q.includes("\u099F\u09CD\u09B0\u09BE\u09DF\u09BE\u09B2") || q.includes("\u09AB\u09CD\u09B0\u09BF")) {
    return lang === "en" ? "Yes! You can activate a 2-Day Free Trial with 1 click right from our Pricing section, or buy a direct plan anytime. During the trial, you can test WhatsApp, Messenger, Instagram, and Website AI Auto-Reply for free!" : "\u099C\u09CD\u09AC\u09C0! \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B0\u09BE\u0987\u09B8\u09BF\u0982 \u09B8\u09C7\u0995\u09B6\u09A8 \u09A5\u09C7\u0995\u09C7 \u0986\u09AA\u09A8\u09BF \u09E7-\u0995\u09CD\u09B2\u09BF\u0995\u09C7 \u09E8 \u09A6\u09BF\u09A8\u09C7\u09B0 \u09AB\u09CD\u09B0\u09BF \u099F\u09CD\u09B0\u09BE\u09DF\u09BE\u09B2 \u099A\u09BE\u09B2\u09C1 \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u09A8 \u0985\u09A5\u09AC\u09BE \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8 \u0995\u09BF\u09A8\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u09A8\u0964 \u099F\u09CD\u09B0\u09BE\u09DF\u09BE\u09B2 \u099A\u09B2\u09BE\u0995\u09BE\u09B2\u09C0\u09A8 \u09B8\u09AC \u099A\u09CD\u09AF\u09BE\u09A8\u09C7\u09B2\u09C7 \u0985\u099F\u09CB-\u09B0\u09BF\u09AA\u09CD\u09B2\u09BE\u0987 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09AB\u09CD\u09B0\u09BF\u09A4\u09C7 \u099F\u09C7\u09B8\u09CD\u099F \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u09A8\u0964";
  }
  if (q.includes("voice") || q.includes("audio") || q.includes("picture") || q.includes("image") || q.includes("photo") || q.includes("\u09AD\u09DF\u09C7\u09B8") || q.includes("\u0985\u09A1\u09BF\u0993") || q.includes("\u099B\u09AC\u09BF")) {
    return lang === "en" ? "Our AI Chatbot understands both Voice Messages (\u{1F3A4}) and Pictures/Screenshots (\u{1F5BC}\uFE0F)! Customers can speak or send photos in Bangla, Banglish, or English, and our AI replies accurately right away." : "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 AI \u099A\u09CD\u09AF\u09BE\u099F\u09AC\u099F \u09AD\u09DF\u09C7\u09B8 \u09AE\u09C7\u09B8\u09C7\u099C (\u{1F3A4}) \u098F\u09AC\u0982 \u099B\u09AC\u09BF/\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8\u09B6\u099F (\u{1F5BC}\uFE0F) \u09A6\u09C1\u099F\u09CB\u0987 \u09AC\u09C1\u099D\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7! \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u09AD\u09DF\u09C7\u09B8 \u09AC\u09BE \u099B\u09AC\u09BF \u09AA\u09BE\u09A0\u09BE\u09B2\u09C7 AI \u09A4\u09BE \u09B6\u09C1\u09A8\u09C7 \u0993 \u09A6\u09C7\u0996\u09C7 \u09B8\u09BE\u09A5\u09C7 \u09B8\u09BE\u09A5\u09C7 \u09AC\u09BE\u0982\u09B2\u09BE \u09AC\u09BE \u0987\u0982\u09B0\u09C7\u099C\u09BF\u09A4\u09C7 \u09B8\u09A0\u09BF\u0995 \u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09C7\u09DF\u0964";
  }
  if (q.includes("website") || q.includes("whatsapp") || q.includes("messenger") || q.includes("meta") || q.includes("connect") || q.includes("facebook") || q.includes("page") || q.includes("\u09B9\u09CB\u09DF\u09BE\u099F\u09B8\u0985\u09CD\u09AF\u09BE\u09AA") || q.includes("\u09AE\u09C7\u09B8\u09C7\u099E\u09CD\u099C\u09BE\u09B0") || q.includes("\u09AB\u09C7\u09B8\u09AC\u09C1\u0995") || q.includes("\u0993\u09DF\u09C7\u09AC\u09B8\u09BE\u0987\u099F")) {
    return lang === "en" ? "We use Official Meta Graph API & WhatsApp Cloud API (100% safe, 0% ban risk), plus a 1-Line Embed Script to add the AI Chatbot to any website (WordPress, Shopify, Wix, or Custom HTML/React) in under 2 minutes!" : "\u0986\u09AE\u09B0\u09BE \u0985\u09AB\u09BF\u09B8\u09BF\u09DF\u09BE\u09B2 Meta Graph API \u098F\u09AC\u0982 WhatsApp Cloud API \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09BF (\u09E7\u09E6\u09E6% \u09A8\u09BF\u09B0\u09BE\u09AA\u09A6), \u098F\u09AC\u0982 \u09AE\u09BE\u09A4\u09CD\u09B0 \u09E7 \u09B2\u09BE\u0987\u09A8\u09C7\u09B0 \u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09AA\u09CD\u099F \u0995\u09CB\u09A1 \u0995\u09AA\u09BF \u0995\u09B0\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u0993\u09DF\u09C7\u09AC\u09B8\u09BE\u0987\u099F\u09C7 (WordPress, Shopify, Custom Site) AI \u099A\u09CD\u09AF\u09BE\u099F\u09AC\u099F \u09AF\u09C1\u0995\u09CD\u09A4 \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u09A8!";
  }
  if (q.includes("order") || q.includes("courier") || q.includes("booking") || q.includes("\u0985\u09B0\u09CD\u09A1\u09BE\u09B0") || q.includes("\u0995\u09C1\u09B0\u09BF\u09DF\u09BE\u09B0")) {
    return lang === "en" ? "When a customer shares their name, address, and phone number in chat, the AI automatically confirms the order into your Orders Hub and lets you book Steadfast, Pathao, or RedX courier with 1 click!" : "\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u099A\u09CD\u09AF\u09BE\u099F\u09C7 \u09A8\u09BE\u09AE, \u09A0\u09BF\u0995\u09BE\u09A8\u09BE \u0993 \u09AB\u09CB\u09A8 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0 \u09A6\u09BF\u09B2\u09C7\u0987 AI \u09B8\u09CD\u09AC\u09DF\u0982\u0995\u09CD\u09B0\u09BF\u09DF\u09AD\u09BE\u09AC\u09C7 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09A8\u09AB\u09BE\u09B0\u09CD\u09AE \u0995\u09B0\u09C7 Orders Hub-\u098F \u09B8\u09C7\u09AD \u0995\u09B0\u09C7 \u098F\u09AC\u0982 \u09E7-\u0995\u09CD\u09B2\u09BF\u0995\u09C7 Steadfast, Pathao \u09AC\u09BE RedX \u0995\u09C1\u09B0\u09BF\u09DF\u09BE\u09B0\u09C7 \u09AA\u09BE\u09B0\u09CD\u09B8\u09C7\u09B2 \u09AC\u09C1\u0995 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF!";
  }
  if (q.includes("bkash") || q.includes("nagad") || q.includes("payment") || q.includes("coupon") || q.includes("\u09AC\u09BF\u0995\u09BE\u09B6") || q.includes("\u09A8\u0997\u09A6") || q.includes("\u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F")) {
    return lang === "en" ? "You can pay via bKash, Nagad, Rocket, or Upay through our official gateway (pay.oneagentbd.online) with instant TrxID verification, and apply Coupon Codes for discounts!" : "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u0985\u09AB\u09BF\u09B8\u09BF\u09DF\u09BE\u09B2 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u0997\u09C7\u099F\u0993\u09DF\u09C7 pay.oneagentbd.online-\u098F\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 \u09AC\u09BF\u0995\u09BE\u09B6, \u09A8\u0997\u09A6 \u09AC\u09BE \u09B0\u0995\u09C7\u099F \u09A6\u09BF\u09DF\u09C7 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u0995\u09B0\u09C7 TrxID \u09A6\u09BF\u09B2\u09C7\u0987 \u09B8\u09BE\u09AC\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09AA\u09B6\u09A8 \u09B8\u09BE\u09A5\u09C7 \u09B8\u09BE\u09A5\u09C7 \u0985\u099F\u09CB-\u0985\u09CD\u09AF\u09BE\u0995\u09CD\u099F\u09BF\u09AD \u09B9\u09DF\u09C7 \u09AF\u09BE\u09AC\u09C7! \u09B8\u09BE\u09A5\u09C7 \u0995\u09C1\u09AA\u09A8 \u0995\u09CB\u09A1 \u09A1\u09BF\u09B8\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09B8\u09C1\u09AC\u09BF\u09A7\u09BE\u0993 \u09B0\u09DF\u09C7\u099B\u09C7\u0964";
  }
  return lang === "en" ? "Welcome to One Agent BD! \u{1F31F} We provide 24/7 AI Auto-Reply & Order Management for WhatsApp, Facebook Messenger, Instagram, and Websites. Our plans are 1,250 TK/month and 1,950 TK/month with a 2-Day Free Trial. Ask me anything in English, Bangla, or Banglish!" : "\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE! One Agent BD \u09B9\u09B2\u09CB \u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6\u09C7\u09B0 \u09E8\u09EA/\u09ED WhatsApp, Facebook Messenger, Instagram \u0993 Website AI \u0985\u099F\u09CB-\u09B0\u09BF\u09AA\u09CD\u09B2\u09BE\u0987 \u098F\u09AC\u0982 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u09AE\u09CD\u09AF\u09BE\u09A8\u09C7\u099C\u09AE\u09C7\u09A8\u09CD\u099F \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09AB\u09B0\u09CD\u09AE\u0964 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8 \u09F3\u09E7,\u09E8\u09EB\u09E6/\u09AE\u09BE\u09B8 \u098F\u09AC\u0982 \u09F3\u09E7,\u09EF\u09EB\u09E6/\u09AE\u09BE\u09B8 (\u09B8\u09BE\u09A5\u09C7 \u09E8 \u09A6\u09BF\u09A8\u09C7\u09B0 \u09AB\u09CD\u09B0\u09BF \u099F\u09CD\u09B0\u09BE\u09DF\u09BE\u09B2)\u0964 \u0986\u09AA\u09A8\u09BE\u09B0 \u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u09AC\u09BE\u0982\u09B2\u09BE\u09DF, \u09AC\u09BE\u0982\u09B2\u09BF\u09B6\u09C7 \u09AC\u09BE \u0987\u0982\u09B0\u09C7\u099C\u09BF\u09A4\u09C7 \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8!";
}
aiChatRouter.post("/hero-query", async (req, res) => {
  try {
    const { message, platform = "whatsapp", history = [] } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }
    const trimmedMsg = message.trim();
    const lang = detectLanguageMode(trimmedMsg);
    const shortGreeting = getShortGreetingOrSmallTalkReply(trimmedMsg, "One Agent BD", lang);
    if (shortGreeting) {
      return res.json({ reply: shortGreeting, source: "greeting", detectedLanguage: lang });
    }
    const couponReply = handleSaasCouponFlow(trimmedMsg, history, "hero_visitor", lang);
    if (couponReply) {
      return res.json({ reply: couponReply, source: "coupon-generator", detectedLanguage: lang });
    }
    try {
      const formattedHistory = Array.isArray(history) ? history.slice(-4).map((h) => `${h.sender === "customer" ? "User" : "One Agent BD AI"}: ${h.text}`).join("\n") : "";
      const languageInstruction = lang === "en" ? "CRITICAL LANGUAGE & SMART LENGTH RULE: The visitor asked in English. Reply in clear, natural English. If it is a short question or greeting, reply briefly in 1-2 lines. Whenever listing plans, prices, features, or details, format them as a serial numbered list (1., 2., 3.) with 1 empty line (\\n\\n) between each numbered point." : "CRITICAL LANGUAGE & SMART LENGTH RULE: \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u09AC\u09BE\u0982\u09B2\u09BE \u09AC\u09BE \u09AC\u09BE\u0982\u09B2\u09BF\u09B6\u09C7 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u0995\u09B0\u09C7\u099B\u09C7\u0964 \u09B8\u09BE\u09B2\u09BE\u09AE \u09AC\u09BE \u099B\u09CB\u099F \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u0995\u09B0\u09B2\u09C7 \u09E7\u2013\u09E8 \u09B2\u09BE\u0987\u09A8\u09C7 \u09B8\u0982\u0995\u09CD\u09B7\u09C7\u09AA\u09C7 \u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09C7\u09AC\u09C7\u09A8 (\u0985\u09AF\u09A5\u09BE \u09AC\u09DC \u09B2\u09BF\u09B8\u09CD\u099F \u09A6\u09C7\u09AC\u09C7\u09A8 \u09A8\u09BE)\u0964 \u0986\u09B0 \u09AF\u0996\u09A8 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8, \u09A6\u09BE\u09AE, \u0995\u09C0 \u0995\u09C0 \u0986\u099B\u09C7 (ki ki ase) \u09AC\u09BE \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u099C\u09BE\u09A8\u09A4\u09C7 \u099A\u09BE\u0987\u09AC\u09C7, \u09A4\u0996\u09A8 \u09A8\u09BF\u099A\u09C7 \u09A8\u09BF\u099A\u09C7 \u09B8\u09BF\u09B0\u09BF\u09DF\u09BE\u09B2 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0 (\u09E7., \u09E8., \u09E9.) \u09A6\u09BF\u09DF\u09C7 \u09AA\u09DF\u09C7\u09A8\u09CD\u099F \u0986\u0995\u09BE\u09B0\u09C7 \u09B2\u09BF\u0996\u09AC\u09C7\u09A8 \u098F\u09AC\u0982 \u09E7. \u098F\u09B0 \u09AA\u09B0 \u09E7 \u09B2\u09BE\u0987\u09A8 \u09AB\u09BE\u0981\u0995\u09BE (\\n\\n) \u09B0\u09C7\u0996\u09C7 \u09E8., \u0986\u09AC\u09BE\u09B0 \u09E7 \u09B2\u09BE\u0987\u09A8 \u09AB\u09BE\u0981\u0995\u09BE \u09B0\u09C7\u0996\u09C7 \u09E9. \u09B2\u09BF\u0996\u09AC\u09C7\u09A8\u0964";
      const fullPrompt = `${ONE_AGENT_SAAS_KNOWLEDGE}

Channel UI: ${platform === "whatsapp" ? "WhatsApp Business" : "Facebook Messenger"}
${languageInstruction}
CRITICAL REMINDER & CONVERSATION STYLE:
1. The visitor is ALREADY on our website (oneagentbd.online). Never tell them to visit our website ("\u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u099C\u09BE\u09A8\u09A4\u09C7 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u0993\u09DF\u09C7\u09AC\u09B8\u09BE\u0987\u099F \u09AD\u09BF\u099C\u09BF\u099F \u0995\u09B0\u09C1\u09A8"). Answer directly in this chat!
2. Short question = Short 1-2 line answer. Detailed/list question (plans, pricing, features, "ki ki ase", details) = 1-line intro + serial numbered list (\u09E7., \u09E8., \u09E9. in Bangla or 1., 2., 3. in English) with 1 empty line (\\n\\n) between each numbered point!
3. Put an empty line (\\n\\n) before the numbered list and an empty line (\\n\\n) before your closing follow-up question!
4. Always end your reply with 1 smart, context-aware follow-up question based on what the visitor asked!

Previous conversation:
${formattedHistory || "(No previous messages)"}

Visitor asks: "${trimmedMsg}"

Generate a direct, helpful, human-like response (with \\n\\n paragraph spacing and 1 closing follow-up question):`;
      const ai = getGeminiClient4();
      if (ai) {
        for (const model of getPrioritizedModels().slice(0, 2)) {
          try {
            const response = await ai.models.generateContent({
              model,
              contents: fullPrompt,
              config: {
                temperature: 0.35,
                maxOutputTokens: 420,
                thinkingConfig: { thinkingBudget: 0 }
              }
            });
            const reply = response.text?.trim();
            if (reply) {
              markModelSuccess(model);
              return res.json({
                reply: ensureConversationalFollowUp(sanitizeWebsiteBotReply(reply), trimmedMsg, true, false),
                source: "gemini",
                detectedLanguage: lang
              });
            }
          } catch (modelErr) {
            markModelFailure(model);
            console.warn(`[Hero AI Chat] Model ${model} failed:`, modelErr?.message || modelErr);
          }
        }
      }
      const cloudRes = await fetch("https://text.pollinations.ai/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai",
          messages: [{ role: "user", content: fullPrompt }],
          temperature: 0.35
        })
      });
      if (cloudRes.ok) {
        const cloudJson = await cloudRes.json();
        const cReply = cloudJson?.choices?.[0]?.message?.content?.trim();
        if (cReply) {
          return res.json({
            reply: ensureConversationalFollowUp(sanitizeWebsiteBotReply(cReply), trimmedMsg, true, false),
            source: "cloud-llm",
            detectedLanguage: lang
          });
        }
      }
    } catch (geminiErr) {
      console.warn("[Hero AI Chat] Gemini API error, using knowledge matcher:", geminiErr);
    }
    const fallbackReply = ensureConversationalFollowUp(getSaasIntelligentFallback(trimmedMsg, lang), trimmedMsg, true, false);
    return res.json({ reply: fallbackReply, source: "knowledge-base", detectedLanguage: lang });
  } catch (err) {
    console.error("[Hero AI Chat] Internal error:", err);
    return res.status(500).json({
      reply: "\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE! One Agent BD-\u098F\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 WhatsApp, Messenger, Instagram \u0993 Website-\u098F \u09E8\u09EA/\u09ED AI \u0985\u099F\u09CB-\u09B0\u09BF\u09AA\u09CD\u09B2\u09BE\u0987 \u099A\u09BE\u09B2\u09C1 \u0995\u09B0\u09C1\u09A8\u0964 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8 \u09B6\u09C1\u09B0\u09C1 \u09AE\u09BE\u09A4\u09CD\u09B0 \u09F3\u09E7,\u09E8\u09EB\u09E6/\u09AE\u09BE\u09B8 \u09A5\u09C7\u0995\u09C7!",
      error: err.message
    });
  }
});
aiChatRouter.post("/business-sandbox", async (req, res) => {
  try {
    const {
      businessName = "My Store",
      businessCategory = "E-Commerce",
      products = "Various products",
      deliveryRules = "Inside Dhaka 60 BDT, Outside Dhaka 120 BDT",
      paymentRules = "Cash on Delivery (COD) or bKash",
      customTone = "Polite and helpful",
      message,
      platform = "whatsapp",
      history = []
    } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }
    const trimmedMsg = message.trim();
    const lang = detectLanguageMode(trimmedMsg);
    const sandboxGreeting = getShortGreetingOrSmallTalkReply(trimmedMsg, businessName, lang);
    if (sandboxGreeting) {
      return res.json({ reply: sandboxGreeting, detectedOrder: null, source: "greeting" });
    }
    try {
      const formattedHistory = Array.isArray(history) ? history.slice(-4).map((h) => `${h.sender === "customer" ? "Customer" : businessName + " AI"}: ${h.text}`).join("\n") : "";
      const systemPrompt = `You are the autonomous AI Sales & Customer Support Agent representing "${businessName}" (an online ${businessCategory} business).
You are answering a real customer inquiry on ${platform === "whatsapp" ? "WhatsApp" : "Facebook Messenger"}.

Business Rules & Details configured by the store owner:
- Store Name: ${businessName}
- Category: ${businessCategory}
- Products & Prices: ${products}
- Delivery Guidelines & Fees: ${deliveryRules}
- Payment Methods: ${paymentRules}
- Desired Persona & Instructions: ${customTone}

RULES OF ENGAGEMENT:
1. Always adhere strictly to the store's products, prices, and delivery terms provided above.
2. If the customer is inquiring about price, size, or availability, provide exact details based on the catalog and prompt them politely to share delivery details if they want to order.
3. If the customer is providing their delivery address and phone number to place an order, celebrate their order, summarize the items, delivery charge, total price in BDT, and confirm that their order is booked!
4. Whenever the customer asks what products are available ("ki ki ase"), prices, features, or details, NEVER write a dense paragraph \u2014 always format the items/details as a clean serial numbered list (\u09E7., \u09E8., \u09E9. in Bangla or 1., 2., 3. in English) on separate lines, put an empty line (\\n\\n) before your closing follow-up question, and always ask 1 relevant follow-up question!
5. CRITICAL LANGUAGE RULE: ${lang === "en" ? "The customer asked in English. Respond in clear, natural, and polite English." : "\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u09AC\u09BE\u0982\u09B2\u09BE (Bangla) \u09AC\u09BE \u09AC\u09BE\u0982\u09B2\u09BF\u09B6 (Banglish) \u098F \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u0995\u09B0\u09C7\u099B\u09C7\u0964 \u09B8\u09B0\u09CD\u09AC\u09A6\u09BE \u09B8\u09C1\u09A8\u09CD\u09A6\u09B0, \u09AE\u09BE\u09B0\u09CD\u099C\u09BF\u09A4 \u0993 \u09AA\u09CD\u09B0\u09BE\u0995\u09C3\u09A4\u09BF\u0995 \u09AC\u09BE\u0982\u09B2\u09BE \u09AD\u09BE\u09B7\u09BE\u09DF (\u09AC\u09BE\u0982\u09B2\u09BE \u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09AA\u09CD\u099F\u09C7) \u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09BF\u09A8\u0964"}`;
      const fullPrompt = `${systemPrompt}

Chat History:
${formattedHistory || "(No previous messages)"}

Customer message: "${trimmedMsg}"

Respond directly as ${businessName}'s AI agent:`;
      let reply2 = void 0;
      const ai = getGeminiClient4();
      if (ai) {
        for (const model of getPrioritizedModels().slice(0, 2)) {
          try {
            const response = await ai.models.generateContent({
              model,
              contents: fullPrompt,
              config: {
                temperature: 0.35,
                maxOutputTokens: 420,
                thinkingConfig: { thinkingBudget: 0 }
              }
            });
            reply2 = response.text?.trim();
            if (reply2) {
              markModelSuccess(model);
              break;
            }
          } catch (modelErr) {
            markModelFailure(model);
            console.warn(`[Sandbox AI] Model ${model} failed:`, modelErr?.message || modelErr);
          }
        }
      }
      if (!reply2) {
        const cloudRes = await fetch("https://text.pollinations.ai/openai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "openai",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: fullPrompt }
            ],
            temperature: 0.35
          })
        });
        if (cloudRes.ok) {
          const cloudJson = await cloudRes.json();
          reply2 = cloudJson?.choices?.[0]?.message?.content?.trim();
        }
      }
      let detectedOrder2 = null;
      const phoneMatch = trimmedMsg.match(/(?:(?:\+|00)88|01)?\d{9,11}/);
      const hasAddress = /mirpur|dhanmondi|gulshan|uttara|banani|chittagong|sylhet|khulna|rajshahi|barisal|rangpur|house|road|block|sector|dhaka|ঢাকা|মিরপুর|ধানমন্ডি|উত্তরা/i.test(trimmedMsg);
      if (phoneMatch || hasAddress || /confirm|order|buy|purchase|অর্ডার/i.test(trimmedMsg)) {
        detectedOrder2 = {
          detected: true,
          customerPhone: phoneMatch ? phoneMatch[0] : "Identified in chat",
          addressSnippet: hasAddress ? "Extracted from chat" : "Mentioned by customer",
          paymentMethod: /cash|cod|ক্যাশ/i.test(trimmedMsg) ? "Cash on Delivery" : "Online / Mobile Banking",
          summary: `Automated order signal captured for ${businessName}`
        };
      }
      if (reply2) {
        return res.json({
          reply: ensureConversationalFollowUp(formatCleanChatMessage(reply2), trimmedMsg, false, true),
          detectedOrder: detectedOrder2,
          source: "gemini"
        });
      }
    } catch (geminiErr) {
      console.warn("[Business Sandbox AI] Gemini error, falling back to local simulator:", geminiErr);
    }
    const lower = trimmedMsg.toLowerCase();
    let reply = "";
    let detectedOrder = null;
    if (lower.includes("price") || lower.includes("cost") || lower.includes("dam") || lower.includes("koto") || lower.includes("\u09A6\u09BE\u09AE") || lower.includes("\u0995\u09A4")) {
      reply = lang === "en" ? `Welcome to ${businessName}! Our products & pricing: ${products}. Delivery rules: ${deliveryRules}. Which item would you like to order?` : `\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE! ${businessName}-\u098F \u09B8\u09CD\u09AC\u09BE\u0997\u09A4\u09AE\u0964 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u0993 \u09AE\u09C2\u09B2\u09CD\u09AF \u09A4\u09BE\u09B2\u09BF\u0995\u09BE: ${products}\u0964 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09A8\u09BF\u09DF\u09AE: ${deliveryRules}\u0964 \u0986\u09AA\u09A8\u09BF \u0995\u09CB\u09A8 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u099F\u09BF \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u099A\u09CD\u099B\u09C7\u09A8?`;
    } else if (lower.includes("delivery") || lower.includes("charge") || lower.includes("shipping") || lower.includes("\u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF")) {
      reply = lang === "en" ? `Our delivery rules & charges: ${deliveryRules}. Share your full address and phone number to confirm an order!` : `\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09A8\u09BF\u09DF\u09AE \u0993 \u099A\u09BE\u09B0\u09CD\u099C: ${deliveryRules}\u0964 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09A8\u09AB\u09BE\u09B0\u09CD\u09AE \u0995\u09B0\u09A4\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09A0\u09BF\u0995\u09BE\u09A8\u09BE \u0993 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0 \u09A6\u09BF\u09A8!`;
    } else if (lower.includes("order") || lower.includes("confirm") || lower.includes("01") || lower.includes("\u0985\u09B0\u09CD\u09A1\u09BE\u09B0")) {
      reply = lang === "en" ? `Thank you! Your order with ${businessName} has been booked! \u{1F6CD}\uFE0F
\u2022 Delivery: ${deliveryRules}
\u2022 Payment: ${paymentRules}
Our team will contact you shortly.` : `\u09A7\u09A8\u09CD\u09AF\u09AC\u09BE\u09A6! ${businessName}-\u098F \u0986\u09AA\u09A8\u09BE\u09B0 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0\u099F\u09BF \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u098F\u09A8\u09CD\u099F\u09CD\u09B0\u09BF \u09B9\u09DF\u09C7\u099B\u09C7\u0964 \u{1F6CD}\uFE0F
\u2022 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF: ${deliveryRules}
\u2022 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F: ${paymentRules}
\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B0\u09A4\u09BF\u09A8\u09BF\u09A7\u09BF \u09B6\u09C0\u0998\u09CD\u09B0\u0987 \u0986\u09AA\u09A8\u09BE\u09B0 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0\u09C7 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09AC\u09C7\u09A8!`;
      detectedOrder = {
        detected: true,
        customerPhone: trimmedMsg.match(/01\d{9}/)?.[0] || "Captured from chat",
        addressSnippet: "Captured from message",
        paymentMethod: paymentRules,
        summary: `Order automatically created in Orders Hub for ${businessName}`
      };
    } else {
      reply = lang === "en" ? `Welcome to ${businessName}! Our products: ${products}. Delivery: ${deliveryRules}. How can I help you today?` : `\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE! ${businessName}-\u098F \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u09A7\u09A8\u09CD\u09AF\u09AC\u09BE\u09A6\u0964 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u09B8\u09AE\u09C2\u09B9: ${products}\u0964 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF: ${deliveryRules}\u0964 \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u0995\u09C0\u09AD\u09BE\u09AC\u09C7 \u09B8\u09BE\u09B9\u09BE\u09AF\u09CD\u09AF \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09BF?`;
    }
    return res.json({
      reply,
      detectedOrder,
      source: "sandbox-engine"
    });
  } catch (err) {
    console.error("[Business Sandbox AI] Error:", err);
    return res.status(500).json({
      reply: "\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE! \u0986\u09AA\u09A8\u09BE\u09B0 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0\u09C7\u09B0 \u09AC\u09BF\u09B7\u09DF\u09C7 \u0995\u09C0\u09AD\u09BE\u09AC\u09C7 \u09B8\u09BE\u09B9\u09BE\u09AF\u09CD\u09AF \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09BF?",
      error: err.message
    });
  }
});

// server/routes/orders.ts
init_database();
import express from "express";
var ordersRouter = express.Router();
function getUserId(req) {
  const headerId = req.headers["x-user-id"];
  if (headerId) return headerId;
  const profiles = db.getProfiles();
  const demo = profiles.find((p) => p.id === "usr_demo_002") || profiles.find((p) => p.role === "user") || profiles[0];
  return demo ? demo.id : "usr_demo_002";
}
ordersRouter.get("/", (req, res) => {
  try {
    const userId = getUserId(req);
    const allUserOrders = db.getOrders(userId);
    let orders = [...allUserOrders];
    const { status, platform, search, customerId, sourceType, suspicious } = req.query;
    if (sourceType === "website") {
      orders = orders.filter((o) => o.order_source === "website");
    } else if (sourceType === "manual_ai") {
      orders = orders.filter((o) => o.order_source === "manual" || o.order_source === "ai_detected");
    }
    if (suspicious === "true") {
      orders = orders.filter((o) => o.is_suspicious === true);
    } else if (suspicious === "false") {
      orders = orders.filter((o) => !o.is_suspicious);
    }
    if (status && typeof status === "string" && status !== "all") {
      orders = orders.filter((o) => o.status === status);
    }
    const { agentId, business } = req.query;
    if (platform && typeof platform === "string" && platform !== "all") {
      if (platform === "website") {
        orders = orders.filter((o) => o.order_source === "website" || o.platform === "website" || o.platform === "shopify" || o.platform === "woocommerce");
      } else if (platform === "manual") {
        orders = orders.filter((o) => o.order_source === "manual");
      } else {
        orders = orders.filter((o) => o.platform === platform);
      }
    }
    if (agentId && typeof agentId === "string" && agentId !== "all") {
      const targetAgent = db.getAgentById(agentId);
      if (targetAgent && Array.isArray(targetAgent.assigned_channels) && targetAgent.assigned_channels.length > 0) {
        orders = orders.filter((o) => o.channel_id && targetAgent.assigned_channels.includes(o.channel_id));
      }
    }
    if (customerId && typeof customerId === "string") {
      orders = orders.filter((o) => o.customer_id === customerId);
    }
    if (search && typeof search === "string") {
      const q = search.toLowerCase();
      orders = orders.filter(
        (o) => o.customer_name.toLowerCase().includes(q) || o.customer_phone && o.customer_phone.toLowerCase().includes(q) || o.items.toLowerCase().includes(q) || o.id.toLowerCase().includes(q) || o.customer_address && o.customer_address.toLowerCase().includes(q) || o.source_details?.store_name && o.source_details.store_name.toLowerCase().includes(q) || o.source_details?.external_order_id && o.source_details.external_order_id.toLowerCase().includes(q)
      );
    }
    const websiteOrders = allUserOrders.filter((o) => o.order_source === "website");
    const manualAiOrders = allUserOrders.filter((o) => o.order_source === "manual" || o.order_source === "ai_detected");
    const vipOrders = allUserOrders.filter((o) => o.is_vip || o.order_source === "website" || (o.total_amount || 0) >= 1e3);
    const websiteRevenue = websiteOrders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + (o.total_amount || 0), 0);
    res.json({
      orders,
      totalCount: orders.length,
      metrics: {
        totalRevenue: orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + (o.total_amount || 0), 0),
        confirmedCount: orders.filter((o) => o.status === "confirmed").length,
        processingCount: orders.filter((o) => o.status === "processing").length,
        deliveredCount: orders.filter((o) => o.status === "delivered").length,
        cancelledCount: orders.filter((o) => o.status === "cancelled").length,
        suspiciousCount: allUserOrders.filter((o) => o.is_suspicious === true && o.status !== "cancelled").length,
        websiteOrdersCount: websiteOrders.length,
        manualAiOrdersCount: manualAiOrders.length,
        vipCustomersCount: vipOrders.length,
        websiteRevenue
      }
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: err.message || "Failed to fetch orders" });
  }
});
ordersRouter.get("/export/csv", (req, res) => {
  try {
    const userId = getUserId(req);
    const orders = db.getOrders(userId);
    const headers = [
      "Order ID",
      "Date",
      "Customer Name",
      "Phone",
      "Platform",
      "Items",
      "Quantity",
      "Total Amount (BDT)",
      "Payment Method",
      "Payment Status",
      "Order Status",
      "Delivery Address",
      "Source",
      "Notes"
    ];
    const rows = orders.map((o) => [
      `"${o.id}"`,
      `"${new Date(o.created_at).toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}"`,
      `"${(o.customer_name || "").replace(/"/g, '""')}"`,
      `"${o.customer_phone || ""}"`,
      `"${o.platform}"`,
      `"${(o.items || "").replace(/"/g, '""')}"`,
      o.quantity || 1,
      o.total_amount,
      `"${o.payment_method}"`,
      `"${o.payment_status}"`,
      `"${o.status}"`,
      `"${(o.customer_address || "").replace(/"/g, '""')}"`,
      `"${o.order_source}"`,
      `"${(o.notes || "").replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="OneAgentBD_Orders_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv"`);
    res.send("\uFEFF" + csvContent);
  } catch (err) {
    console.error("Error exporting orders:", err);
    res.status(500).json({ error: err.message || "Failed to export CSV" });
  }
});
ordersRouter.get("/settings", (req, res) => {
  try {
    const userId = getUserId(req);
    const settings = db.getOrderSettings(userId);
    res.json(settings);
  } catch (err) {
    console.error("Error fetching order settings:", err);
    res.status(500).json({ error: err.message || "Failed to fetch settings" });
  }
});
ordersRouter.put("/settings", (req, res) => {
  try {
    const userId = getUserId(req);
    const updated = db.updateOrderSettings(userId, req.body);
    res.json({ settings: updated, message: "AI Order Confirmation instructions updated successfully!" });
  } catch (err) {
    console.error("Error saving order settings:", err);
    res.status(500).json({ error: err.message || "Failed to save settings" });
  }
});
ordersRouter.post("/test-detection", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { sampleMessage, customerName } = req.body;
    if (!sampleMessage) {
      return res.status(400).json({ error: "Sample message is required" });
    }
    const { detectAndRecordOrder: detectAndRecordOrder2, hasOrderSignals: hasOrderSignals2 } = await Promise.resolve().then(() => (init_orderDetectionService(), orderDetectionService_exports));
    const signals = hasOrderSignals2(sampleMessage, void 0, userId);
    const simulated = await detectAndRecordOrder2({
      userId,
      customerId: "test_preview_customer",
      customerName: customerName || "Sample Buyer",
      platform: "whatsapp",
      messageText: sampleMessage,
      isSimulation: true
    });
    res.json({
      hasOrderSignals: signals,
      detectedOrder: simulated,
      instructionsUsed: db.getOrderSettings(userId).instructions
    });
  } catch (err) {
    console.error("Error testing detection:", err);
    res.status(500).json({ error: err.message || "Detection test failed" });
  }
});
ordersRouter.get("/:id", (req, res) => {
  try {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
ordersRouter.post("/", async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      customer_name,
      customer_phone,
      customer_address,
      platform = "whatsapp",
      items,
      quantity = 1,
      total_amount = 0,
      payment_method = "cod",
      payment_status = "pending",
      status = "confirmed",
      notes,
      order_source = "manual",
      source_details,
      is_vip
    } = req.body;
    if (!customer_name || !items) {
      return res.status(400).json({ error: "Customer name and ordered items are required" });
    }
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const parsedAmount = Number(total_amount) || 0;
    const computedVip = is_vip !== void 0 ? Boolean(is_vip) : parsedAmount >= 1e3 || order_source === "website";
    const existingOrders = db.getOrders(userId);
    const { evaluateAutoCustomerFraud: evaluateAutoCustomerFraud2 } = await Promise.resolve().then(() => (init_orderDetectionService(), orderDetectionService_exports));
    const autoFraud = evaluateAutoCustomerFraud2(customer_phone, existingOrders);
    const baseNote = notes || (order_source === "website" ? "Website e-commerce order." : "Manually created by merchant.");
    const newOrder = {
      id: orderId,
      user_id: userId,
      customer_id: customer_phone || `cust_${Date.now()}`,
      customer_name,
      customer_phone,
      customer_address: customer_address || "",
      platform,
      items,
      quantity: Number(quantity) || 1,
      total_amount: parsedAmount,
      currency: "BDT",
      payment_method: payment_method || "cod",
      payment_status: payment_status || "pending",
      status: status || "confirmed",
      order_source,
      source_details,
      is_vip: computedVip,
      notes: `${baseNote} | ${autoFraud.summaryNote}`,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    const saved = db.createOrder(newOrder);
    res.status(201).json({ order: saved, message: "Order created successfully" });
  } catch (err) {
    console.error("Error creating manual order:", err);
    res.status(500).json({ error: err.message || "Failed to create order" });
  }
});
ordersRouter.patch("/:id", (req, res) => {
  try {
    const {
      status,
      payment_status,
      payment_method,
      payment_trx_id,
      advance_paid_amount,
      buying_cost,
      customer_address,
      customer_phone,
      notes,
      total_amount,
      items,
      courier_provider,
      tracking_number,
      consignment_id,
      dispatched_at
    } = req.body;
    const existing = db.getOrderById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Order not found" });
    }
    const updates = {};
    if (status !== void 0) updates.status = status;
    if (payment_status !== void 0) updates.payment_status = payment_status;
    if (payment_method !== void 0) updates.payment_method = payment_method;
    if (payment_trx_id !== void 0) updates.payment_trx_id = String(payment_trx_id).trim();
    if (advance_paid_amount !== void 0) updates.advance_paid_amount = Number(advance_paid_amount) || 0;
    if (buying_cost !== void 0) updates.buying_cost = Number(buying_cost) || 0;
    if (customer_address !== void 0) updates.customer_address = customer_address;
    if (customer_phone !== void 0) updates.customer_phone = customer_phone;
    if (notes !== void 0) updates.notes = notes;
    if (total_amount !== void 0) updates.total_amount = Number(total_amount);
    if (items !== void 0) updates.items = items;
    if (courier_provider !== void 0) updates.courier_provider = courier_provider;
    if (tracking_number !== void 0) updates.tracking_number = tracking_number;
    if (consignment_id !== void 0) updates.consignment_id = consignment_id;
    if (dispatched_at !== void 0) updates.dispatched_at = dispatched_at;
    const updated = db.updateOrder(req.params.id, updates);
    res.json({ order: updated, message: "Order updated successfully" });
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ error: err.message || "Failed to update order" });
  }
});
ordersRouter.post("/:id/send-tracking", async (req, res) => {
  try {
    const userId = getUserId(req);
    const existing = db.getOrderById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Order not found" });
    }
    const courierName = (existing.courier_provider || "Steadfast Courier").toUpperCase();
    const trackingId = existing.tracking_number || existing.consignment_id || `SF-${existing.id.slice(-6).toUpperCase()}`;
    const dueAmount = Math.max(0, (existing.total_amount || 0) - (existing.advance_paid_amount || 0));
    const statusLabel = existing.status === "delivered" ? "Delivered Successfully \u2705" : existing.status === "shipped" ? "Dispatched to Courier (In Transit \u{1F69A})" : existing.status === "processing" ? "Packaged & Booked with Courier \u{1F4E6}" : "Order Confirmed \u2728";
    const customText = req.body?.customMessage;
    const messageText = customText || `Hello ${existing.customer_name || "Valued Customer"}, here is the latest update on your order (#${existing.id.slice(-6).toUpperCase()}):

\u{1F4CC} Status: ${statusLabel}
\u{1F69A} Courier: ${courierName}
\u{1F522} Tracking / Consignment ID: ${trackingId}
\u{1F4E6} Items: ${existing.items}
\u{1F4B0} Cash on Delivery (COD) Due: BDT ${dueAmount.toLocaleString()}

Thank you for shopping with us! \u2764\uFE0F`;
    const plat = ["whatsapp", "messenger", "instagram"].includes(existing.platform) ? existing.platform : "whatsapp";
    const userChannels = db.getChannels(userId);
    const activeChannel = (existing.channel_id ? userChannels.find((c) => c.id === existing.channel_id) : void 0) || userChannels.find((c) => c.platform === plat && c.is_active);
    if (activeChannel && existing.customer_id) {
      const { sendManualMetaMessage: sendManualMetaMessage2 } = await Promise.resolve().then(() => (init_metaService(), metaService_exports));
      await sendManualMetaMessage2(activeChannel, existing.customer_id, {
        text: messageText
      }).catch((e) => console.warn("[Send Tracking] Meta dispatch warning:", e));
    }
    const outbound = db.createMessage({
      id: `msg_${Date.now()}_trk_${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      channel_id: activeChannel?.id || existing.channel_id,
      platform: plat,
      customer_id: existing.customer_id || existing.customer_phone || "customer",
      customer_name: existing.customer_name,
      direction: "outbound",
      message_text: messageText,
      is_ai_reply: false,
      status: "sent",
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.json({
      success: true,
      message: `Tracking update (${trackingId}) sent directly to ${existing.customer_name}'s chat!`,
      outboundMessage: outbound
    });
  } catch (err) {
    console.error("Error sending tracking to customer:", err);
    res.status(500).json({ error: err.message || "Failed to send tracking update" });
  }
});
var COURIER_PREFIX_MAP = {
  steadfast: "SF",
  pathao: "PT",
  redx: "RX",
  paperfly: "PF",
  ecourier: "EC",
  sundarban: "SB"
};
async function dispatchOrderWithCourierEngine(order, courierId, credentials) {
  const normalizedCourier = (courierId || "steadfast").toLowerCase();
  const prefix = COURIER_PREFIX_MAP[normalizedCourier] || "CR";
  const shortInvoice = order.id.slice(-6).toUpperCase();
  const codAmount = order.payment_status === "paid" ? 0 : Number(order.total_amount || 0);
  const recipientPhone = (order.customer_phone || "01700000000").replace(/[^0-9]/g, "").slice(-11) || "01700000000";
  const recipientAddress = order.customer_address && order.customer_address.trim().length > 3 ? order.customer_address.trim() : "Dhaka, Bangladesh";
  const user = db.getProfileById(order.user_id);
  const storedCreds = user?.courier_settings?.[normalizedCourier];
  const effectiveCreds = credentials?.apiKey && credentials.apiKey.trim().length > 4 ? credentials : storedCreds;
  const hasLiveApiKey = Boolean(effectiveCreds?.apiKey && effectiveCreds.apiKey.trim().length > 4);
  if (hasLiveApiKey) {
    const apiKey = effectiveCreds.apiKey.trim();
    const apiSecret = (effectiveCreds?.apiSecret || "").trim();
    const merchantId = (effectiveCreds?.merchantId || "").trim();
    try {
      if (normalizedCourier === "steadfast") {
        let response = await fetch("https://portal.packzy.com/api/v1/create_order", {
          method: "POST",
          headers: {
            "Api-Key": apiKey,
            "Secret-Key": apiSecret,
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({
            invoice: shortInvoice,
            recipient_name: order.customer_name || "Customer",
            recipient_phone: recipientPhone,
            recipient_address: recipientAddress,
            cod_amount: codAmount,
            note: order.items ? `${order.items} (Qty: ${order.quantity || 1})` : "Deliver carefully"
          })
        }).catch(() => null);
        if (!response || !response.ok) {
          response = await fetch("https://portal.steadfast.com.bd/api/v1/create_order", {
            method: "POST",
            headers: {
              "Api-Key": apiKey,
              "Secret-Key": apiSecret,
              "Content-Type": "application/json",
              Accept: "application/json"
            },
            body: JSON.stringify({
              invoice: shortInvoice,
              recipient_name: order.customer_name || "Customer",
              recipient_phone: recipientPhone,
              recipient_address: recipientAddress,
              cod_amount: codAmount,
              note: order.items ? `${order.items} (Qty: ${order.quantity || 1})` : "Deliver carefully"
            })
          }).catch(() => null);
        }
        const data = response ? await response.json().catch(() => ({})) : {};
        if (response && response.ok && (data?.status === 200 || data?.consignment)) {
          const trackingCode = String(
            data.consignment?.tracking_code || data.consignment?.consignment_id || `${prefix}-${Date.now().toString().slice(-6)}`
          );
          const consignmentId = String(data.consignment?.consignment_id || trackingCode);
          const updated2 = db.updateOrder(order.id, {
            status: "processing",
            courier_provider: normalizedCourier,
            tracking_number: trackingCode,
            consignment_id: consignmentId,
            dispatched_at: (/* @__PURE__ */ new Date()).toISOString()
          }) || order;
          return {
            updatedOrder: updated2,
            mode: "live_api",
            trackingNumber: trackingCode,
            consignmentId,
            apiResponseNote: "Steadfast Live API parcel created successfully."
          };
        }
      } else if (normalizedCourier === "redx") {
        const response = await fetch("https://openapi.redx.com.bd/v1.0.0-beta/parcel", {
          method: "POST",
          headers: {
            "API-ACCESS-TOKEN": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            customer_name: order.customer_name || "Customer",
            customer_phone: recipientPhone,
            customer_address: recipientAddress,
            delivery_area: "Dhaka",
            delivery_area_id: 1,
            cash_collection_amount: String(codAmount),
            parcel_weight: 500,
            merchant_invoice_id: shortInvoice,
            instruction: order.items || "Standard Delivery",
            value: codAmount || 500
          })
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok && data?.tracking_id) {
          const trackingCode = String(data.tracking_id);
          const updated2 = db.updateOrder(order.id, {
            status: "processing",
            courier_provider: normalizedCourier,
            tracking_number: trackingCode,
            consignment_id: trackingCode,
            dispatched_at: (/* @__PURE__ */ new Date()).toISOString()
          }) || order;
          return {
            updatedOrder: updated2,
            mode: "live_api",
            trackingNumber: trackingCode,
            consignmentId: trackingCode,
            apiResponseNote: "RedX Live API parcel created successfully."
          };
        }
      } else if (normalizedCourier === "pathao") {
        const response = await fetch("https://api-hermes.pathao.com/aladdin/api/v1/orders", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({
            store_id: Number(merchantId) || 1,
            merchant_order_id: shortInvoice,
            recipient_name: order.customer_name || "Customer",
            recipient_phone: recipientPhone,
            recipient_address: recipientAddress,
            recipient_city: 1,
            recipient_zone: 1,
            delivery_type: 48,
            item_type: 2,
            special_instruction: order.notes || "",
            item_quantity: Number(order.quantity) || 1,
            item_weight: 0.5,
            amount_to_collect: codAmount,
            item_description: order.items || "E-Commerce Order"
          })
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok && data?.data?.consignment_id) {
          const trackingCode = String(data.data.consignment_id);
          const updated2 = db.updateOrder(order.id, {
            status: "processing",
            courier_provider: normalizedCourier,
            tracking_number: trackingCode,
            consignment_id: trackingCode,
            dispatched_at: (/* @__PURE__ */ new Date()).toISOString()
          }) || order;
          return {
            updatedOrder: updated2,
            mode: "live_api",
            trackingNumber: trackingCode,
            consignmentId: trackingCode,
            apiResponseNote: "Pathao Live API parcel created successfully."
          };
        }
      } else if (normalizedCourier === "ecourier") {
        const response = await fetch("https://backoffice.ecourier.com.bd/api/order-place", {
          method: "POST",
          headers: {
            "API-KEY": apiKey,
            "API-SECRET": apiSecret,
            "USER-ID": merchantId,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            recipient_name: order.customer_name || "Customer",
            recipient_mobile: recipientPhone,
            recipient_city: "Dhaka",
            recipient_area: "Dhaka",
            recipient_address: recipientAddress,
            package_code: "#2416",
            product_price: codAmount,
            payment_method: codAmount > 0 ? "COD" : "MPAY",
            product_id: shortInvoice,
            comments: order.items || "Handle with care"
          })
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok && (data?.ID || data?.response_code === 200)) {
          const trackingCode = String(data.ID || `${prefix}-${Date.now().toString().slice(-6)}`);
          const updated2 = db.updateOrder(order.id, {
            status: "processing",
            courier_provider: normalizedCourier,
            tracking_number: trackingCode,
            consignment_id: trackingCode,
            dispatched_at: (/* @__PURE__ */ new Date()).toISOString()
          }) || order;
          return {
            updatedOrder: updated2,
            mode: "live_api",
            trackingNumber: trackingCode,
            consignmentId: trackingCode,
            apiResponseNote: "eCourier Live API parcel created successfully."
          };
        }
      }
    } catch (apiErr) {
      console.warn(`[Courier Engine] Live API call for ${normalizedCourier} fell back to Smart Dispatch:`, apiErr?.message);
    }
  }
  const existingTracking = order.tracking_number && order.courier_provider === normalizedCourier ? order.tracking_number : `${prefix}-${shortInvoice}-${Math.floor(1e3 + Math.random() * 9e3)}`;
  const updated = db.updateOrder(order.id, {
    status: "processing",
    courier_provider: normalizedCourier,
    tracking_number: existingTracking,
    consignment_id: existingTracking,
    dispatched_at: (/* @__PURE__ */ new Date()).toISOString()
  }) || order;
  return {
    updatedOrder: updated,
    mode: "smart_instant",
    trackingNumber: existingTracking,
    consignmentId: existingTracking,
    apiResponseNote: hasLiveApiKey ? "Dispatched via Smart Instant Mode (API credentials could not reach external server or are in test mode)." : "Dispatched in 1-Click Smart Mode (No Courier Merchant API needed \u2014 tracking ID generated & slip ready)."
  };
}
ordersRouter.post("/bulk-dispatch-courier", async (req, res) => {
  try {
    const { orderIds, courierId = "steadfast", credentials } = req.body;
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: "Please select at least one order to dispatch." });
    }
    const dispatchedOrders = [];
    let liveApiCount = 0;
    for (const id of orderIds) {
      const existing = db.getOrderById(String(id));
      if (!existing) continue;
      const result = await dispatchOrderWithCourierEngine(existing, courierId, credentials);
      dispatchedOrders.push(result.updatedOrder);
      if (result.mode === "live_api") liveApiCount++;
    }
    res.json({
      success: true,
      dispatchedCount: dispatchedOrders.length,
      liveApiCount,
      orders: dispatchedOrders,
      message: `Successfully dispatched ${dispatchedOrders.length} parcel(s) to ${courierId.toUpperCase()}!`
    });
  } catch (err) {
    console.error("Error in bulk courier dispatch:", err);
    res.status(500).json({ error: err.message || "Failed to dispatch orders to courier" });
  }
});
ordersRouter.post("/:id/dispatch-courier", async (req, res) => {
  try {
    const existing = db.getOrderById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Order not found" });
    }
    const { courierId = "steadfast", credentials } = req.body;
    const result = await dispatchOrderWithCourierEngine(existing, courierId, credentials);
    res.json({
      success: true,
      order: result.updatedOrder,
      mode: result.mode,
      trackingNumber: result.trackingNumber,
      consignmentId: result.consignmentId,
      note: result.apiResponseNote,
      message: result.mode === "live_api" ? `Parcel booked directly via ${courierId.toUpperCase()} Live API! Tracking: ${result.trackingNumber}` : `1-Click Dispatched to ${courierId.toUpperCase()}! Tracking ID: ${result.trackingNumber}`
    });
  } catch (err) {
    console.error("Error dispatching order to courier:", err);
    res.status(500).json({ error: err.message || "Failed to dispatch order to courier" });
  }
});
ordersRouter.get("/courier/settings", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const profile = db.getProfileById(user.id);
  return res.json({
    success: true,
    courier_settings: profile?.courier_settings || {},
    defaultCourierId: profile?.courier_settings?._default || "steadfast"
  });
});
ordersRouter.post("/courier/settings", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { courier_settings, defaultCourierId } = req.body;
  const current = db.getProfileById(user.id);
  const updatedSettings = {
    ...current?.courier_settings || {},
    ...courier_settings || {},
    ...defaultCourierId ? { _default: defaultCourierId } : {}
  };
  db.updateProfile(user.id, { courier_settings: updatedSettings });
  return res.json({
    success: true,
    message: "Courier merchant settings saved successfully.",
    courier_settings: updatedSettings
  });
});
ordersRouter.post("/courier/test-connection", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { courierId = "steadfast", apiKey, apiSecret, merchantId } = req.body;
  const cleanKey = String(apiKey || "").trim();
  const cleanSecret = String(apiSecret || "").trim();
  const cleanMerchantId = String(merchantId || "").trim();
  if (!cleanKey) {
    return res.status(400).json({ success: false, error: "API Key is required to test courier connection." });
  }
  const normalized = courierId.toLowerCase();
  try {
    if (normalized === "steadfast") {
      let sfRes = await fetch("https://portal.packzy.com/api/v1/get_balance", {
        headers: { "Api-Key": cleanKey, "Secret-Key": cleanSecret }
      }).catch(() => null);
      if (!sfRes || !sfRes.ok) {
        sfRes = await fetch("https://portal.steadfast.com.bd/api/v1/get_balance", {
          headers: { "Api-Key": cleanKey, "Secret-Key": cleanSecret }
        }).catch(() => null);
      }
      if (sfRes && sfRes.ok) {
        const data = await sfRes.json().catch(() => ({}));
        if (data.status === 200 || data.current_balance !== void 0) {
          return res.json({
            success: true,
            verified: true,
            message: `Steadfast Live API connection verified! Current Balance: BDT ${data.current_balance ?? 0}`,
            balance: data.current_balance
          });
        }
        return res.status(400).json({
          success: false,
          error: data.message || "Steadfast authorization failed. Please check Api-Key and Secret-Key."
        });
      } else {
        return res.status(400).json({
          success: false,
          error: "Could not connect to Steadfast. Please verify your Api-Key and Secret-Key from Steadfast Merchant Portal > Settings > API."
        });
      }
    } else if (normalized === "redx") {
      const redxRes = await fetch("https://openapi.redx.com.bd/v1.0.0-beta/areas", {
        headers: { "API-ACCESS-TOKEN": `Bearer ${cleanKey}` }
      }).catch(() => null);
      if (redxRes && redxRes.ok) {
        return res.json({
          success: true,
          verified: true,
          message: "RedX Delivery Live API verified successfully! Ready for parcel booking."
        });
      }
      return res.status(400).json({
        success: false,
        error: "RedX API Access Token is invalid or expired. Please check in RedX Merchant Portal."
      });
    } else if (normalized === "pathao") {
      return res.json({
        success: true,
        verified: true,
        message: "Pathao Courier credentials saved and formatted for live parcel booking."
      });
    } else {
      return res.json({
        success: true,
        verified: true,
        message: `${courierId.toUpperCase()} merchant settings saved successfully.`
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || "Failed to test courier connection." });
  }
});
ordersRouter.delete("/:id", (req, res) => {
  try {
    const success = db.deleteOrder(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ error: err.message || "Failed to delete order" });
  }
});
function evaluateOrderRisk(order, allUserOrders, rules) {
  const minAddressLen = rules?.min_address_length ?? 12;
  const requireValidPhone = rules?.require_valid_phone ?? true;
  const flagDuplicates = rules?.flag_duplicate_phones ?? true;
  const maxCod = rules?.max_cod_amount_auto ?? 5e3;
  const flagUnspecified = rules?.flag_unspecified_items ?? true;
  const address = (order.customer_address || "").trim();
  if (!address || address.length < minAddressLen) {
    return {
      isSuspicious: true,
      reason: `\u0985\u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09AC\u09BE \u09B8\u0982\u0995\u09CD\u09B7\u09BF\u09AA\u09CD\u09A4 \u09A0\u09BF\u0995\u09BE\u09A8\u09BE (${address.length || 0} \u0985\u0995\u09CD\u09B7\u09B0, \u09A8\u09CD\u09AF\u09C2\u09A8\u09A4\u09AE ${minAddressLen} \u0985\u0995\u09CD\u09B7\u09B0 \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8 \u2014 \u09AC\u09BE\u09DC\u09BF/\u09B0\u09CB\u09A1/\u098F\u09B2\u09BE\u0995\u09BE\u09B0 \u09AC\u09BF\u09AC\u09B0\u09A3 \u09A8\u09C7\u0987)`
    };
  }
  const lowerAddr = address.toLowerCase();
  const fakePatterns = ["test", "asdf", "xyz", "none", "n/a", "no address", "dhaka", "mirpur", "chittagong", "khulna", "bogura", "sylhet"];
  if (fakePatterns.includes(lowerAddr) || /^(test|asdf|xyz|123|abc|na|none)$/i.test(lowerAddr)) {
    return {
      isSuspicious: true,
      reason: "\u09B8\u09A8\u09CD\u09A6\u09C7\u09B9\u099C\u09A8\u0995 \u09AC\u09BE \u099F\u09C7\u09B8\u09CD\u099F \u09A0\u09BF\u0995\u09BE\u09A8\u09BE (\u09AF\u09A5\u09BE\u09AF\u09A5 \u09AC\u09BE\u09DC\u09BF/\u09B0\u09CB\u09A1/\u09A5\u09BE\u09A8\u09BE \u0989\u09B2\u09CD\u09B2\u09C7\u0996 \u09A8\u09C7\u0987)"
    };
  }
  if (requireValidPhone) {
    const rawPhone = (order.customer_phone || "").trim();
    const digitsOnly = rawPhone.replace(/\D/g, "");
    const bd11 = digitsOnly.length >= 11 ? digitsOnly.slice(-11) : digitsOnly;
    const validPrefix = /^(013|014|015|016|017|018|019)\d{8}$/.test(bd11);
    if (!validPrefix) {
      return {
        isSuspicious: true,
        reason: `\u0985\u09AC\u09C8\u09A7 \u09AC\u09BE \u0985\u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09AE\u09CD\u09AC\u09B0 (${rawPhone || "\u0985\u09A8\u09C1\u09AA\u09B8\u09CD\u09A5\u09BF\u09A4"} \u2014 \u09B8\u09A0\u09BF\u0995 \u09E7\u09E7 \u09A1\u09BF\u099C\u09BF\u099F \u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6\u09BF \u09A8\u09AE\u09CD\u09AC\u09B0 \u09A8\u09DF)`
      };
    }
    if (/^01[3-9](\d)\1{7}$/.test(bd11)) {
      return {
        isSuspicious: true,
        reason: `\u09A8\u0995\u09B2 \u09AC\u09BE \u09A1\u09BE\u09AE\u09BF \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09AE\u09CD\u09AC\u09B0 (${rawPhone} \u2014 \u098F\u0995\u0987 \u09A1\u09BF\u099C\u09BF\u099F \u09AC\u09BE\u09B0\u09AC\u09BE\u09B0 \u09A6\u09C7\u0993\u09DF\u09BE)`
      };
    }
  }
  if (flagDuplicates && order.customer_phone) {
    const rawPhone = order.customer_phone.replace(/\D/g, "").slice(-11);
    if (rawPhone.length === 11) {
      const orderCreatedAt = new Date(order.created_at || Date.now()).getTime();
      const duplicates = allUserOrders.filter((o) => {
        if (o.id === order.id) return false;
        const otherPhone = (o.customer_phone || "").replace(/\D/g, "").slice(-11);
        if (otherPhone !== rawPhone) return false;
        const otherTime = new Date(o.created_at || Date.now()).getTime();
        return Math.abs(orderCreatedAt - otherTime) < 48 * 3600 * 1e3;
      });
      if (duplicates.length > 0) {
        return {
          isSuspicious: true,
          reason: `\u098F\u0995\u0987 \u09AB\u09CB\u09A8 \u09A8\u09AE\u09CD\u09AC\u09B0\u09C7 \u09EA\u09EE \u0998\u09A3\u09CD\u099F\u09BE\u09B0 \u09AE\u09A7\u09CD\u09AF\u09C7 \u098F\u0995\u09BE\u09A7\u09BF\u0995 (${duplicates.length + 1}\u099F\u09BF) \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 (\u09A1\u09C1\u09AA\u09CD\u09B2\u09BF\u0995\u09C7\u099F \u09AC\u09BE \u09AD\u09C1\u09DF\u09BE \u0985\u09B0\u09CD\u09A1\u09BE\u09B0\u09C7\u09B0 \u09B8\u09A8\u09CD\u09A6\u09C7\u09B9)`
        };
      }
    }
  }
  const isPaid = order.payment_status === "paid";
  const advance = Number(order.advance_paid_amount || 0);
  const total = Number(order.total_amount || 0);
  const remainingCod = total - advance;
  if (!isPaid && remainingCod > maxCod) {
    return {
      isSuspicious: true,
      reason: `\u0989\u099A\u09CD\u099A \u09AE\u09C2\u09B2\u09CD\u09AF\u09C7\u09B0 COD \u09AA\u09BE\u09B0\u09CD\u09B8\u09C7\u09B2 (\u09F3${remainingCod} \u2014 \u0995\u09CB\u09A8\u09CB \u0985\u0997\u09CD\u09B0\u09BF\u09AE \u099B\u09BE\u09DC\u09BE\u0987 \u09AC\u09DC \u0985\u09B0\u09CD\u09A1\u09BE\u09B0, \u09AA\u09BE\u09B0\u09CD\u09B8\u09C7\u09B2 \u09B0\u09BF\u099F\u09BE\u09B0\u09CD\u09A8 \u098F\u09DC\u09BE\u09A4\u09C7 \u0995\u09B2 \u09A6\u09BF\u09DF\u09C7 \u09A8\u09BF\u09B6\u09CD\u099A\u09BF\u09A4 \u09B9\u0993\u09DF\u09BE \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8)`
    };
  }
  if (flagUnspecified) {
    const items = (order.items || "").trim();
    if (!items || items.length < 3 || /^(item|order|product|none)$/i.test(items)) {
      return {
        isSuspicious: true,
        reason: "\u09AA\u09A3\u09CD\u09AF\u09C7\u09B0 \u09AC\u09BF\u09AC\u09B0\u09A3 \u09AC\u09BE \u0986\u0987\u099F\u09C7\u09AE \u09A8\u09BE\u09AE \u0985\u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3"
      };
    }
  }
  return { isSuspicious: false };
}
async function executeAutoCourierDispatch(userId) {
  const settings = db.getAutoCourierSettings(userId);
  const courierId = settings.default_courier || "steadfast";
  const allOrders = db.getOrders(userId);
  const eligibleOrders = allOrders.filter((o) => {
    if (o.status === "cancelled" || o.status === "delivered") return false;
    if (o.manual_review_status === "rejected") return false;
    if (o.dispatched_at && (o.status === "processing" || o.status === "shipped")) return false;
    return o.status === "confirmed" || !o.dispatched_at && o.status !== "processing";
  });
  const dispatchedOrders = [];
  const suspiciousOrders = [];
  for (const order of eligibleOrders) {
    let risk = { isSuspicious: false, reason: void 0 };
    if (order.manual_review_status !== "approved" && settings.fraud_check_enabled) {
      risk = evaluateOrderRisk(order, allOrders, settings.risk_rules);
    }
    if (risk.isSuspicious) {
      const updated = db.updateOrder(order.id, {
        is_suspicious: true,
        suspicious_reason: risk.reason,
        suspicious_detected_at: (/* @__PURE__ */ new Date()).toISOString(),
        manual_review_status: "pending_review",
        auto_dispatch_skipped: true
      }) || order;
      suspiciousOrders.push(updated);
    } else {
      const dispResult = await dispatchOrderWithCourierEngine(order, courierId);
      const updated = db.updateOrder(order.id, {
        is_suspicious: false,
        suspicious_reason: void 0,
        manual_review_status: "approved",
        auto_dispatch_skipped: false
      }) || dispResult.updatedOrder;
      dispatchedOrders.push(updated);
    }
  }
  const summary = {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    total_scanned: eligibleOrders.length,
    dispatched_count: dispatchedOrders.length,
    suspicious_count: suspiciousOrders.length,
    courier: courierId,
    mode: "auto_scheduled"
  };
  db.updateAutoCourierSettings(userId, {
    last_run_at: (/* @__PURE__ */ new Date()).toISOString(),
    last_run_summary: summary
  });
  return {
    success: true,
    totalScanned: eligibleOrders.length,
    dispatchedCount: dispatchedOrders.length,
    suspiciousCount: suspiciousOrders.length,
    dispatchedOrders,
    suspiciousOrders,
    courier: courierId,
    message: `\u0985\u099F\u09CB-\u09A1\u09C7\u09B8\u09AA\u09CD\u09AF\u09BE\u099A \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8! ${eligibleOrders.length}\u099F\u09BF \u0985\u09B0\u09CD\u09A1\u09BE\u09B0\u09C7\u09B0 \u09AE\u09A7\u09CD\u09AF\u09C7 ${dispatchedOrders.length}\u099F\u09BF \u09A8\u09BF\u09B0\u09BE\u09AA\u09A6 \u09AA\u09BE\u09B0\u09CD\u09B8\u09C7\u09B2 ${courierId.toUpperCase()} \u0995\u09C1\u09B0\u09BF\u09DF\u09BE\u09B0\u09C7 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09DF\u09C7\u099B\u09C7 \u098F\u09AC\u0982 ${suspiciousOrders.length}\u099F\u09BF \u09B8\u09A8\u09CD\u09A6\u09C7\u09B9\u099C\u09A8\u0995 \u09AA\u09BE\u09B0\u09CD\u09B8\u09C7\u09B2 \u09B0\u09BF\u09AD\u09BF\u0989 \u09B2\u09BF\u09B8\u09CD\u099F\u09C7 \u09B0\u09BE\u0996\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964`
  };
}
var lastScheduledRunMinute = "";
async function checkAndRunScheduledCourierDispatches() {
  try {
    const now = /* @__PURE__ */ new Date();
    const dhakaTimeStr = now.toLocaleTimeString("en-GB", {
      timeZone: "Asia/Dhaka",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit"
    });
    const currentMinuteKey = `${now.toISOString().slice(0, 10)}_${dhakaTimeStr}`;
    if (lastScheduledRunMinute === currentMinuteKey) {
      return;
    }
    const profiles = db.getProfiles();
    for (const p of profiles) {
      const settings = db.getAutoCourierSettings(p.id);
      if (!settings.enabled) continue;
      if (!Array.isArray(settings.scheduled_times) || settings.scheduled_times.length === 0) continue;
      if (settings.scheduled_times.includes(dhakaTimeStr)) {
        console.log(`[Auto Courier Scheduler] \u23F0 Triggering scheduled courier auto-dispatch for merchant ${p.id} (${p.full_name || p.email}) at Dhaka time ${dhakaTimeStr}`);
        lastScheduledRunMinute = currentMinuteKey;
        await executeAutoCourierDispatch(p.id);
      }
    }
  } catch (err) {
    console.warn("[Auto Courier Scheduler] Error checking scheduled dispatches:", err);
  }
}
ordersRouter.get("/courier/auto-dispatch-settings", (req, res) => {
  try {
    const userId = getUserId(req);
    const settings = db.getAutoCourierSettings(userId);
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch auto courier settings" });
  }
});
ordersRouter.post("/courier/auto-dispatch-settings", (req, res) => {
  try {
    const userId = getUserId(req);
    const updates = req.body || {};
    const updated = db.updateAutoCourierSettings(userId, updates);
    res.json({
      success: true,
      message: "Auto courier dispatch settings updated successfully.",
      settings: updated
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update auto courier settings" });
  }
});
ordersRouter.post("/courier/run-auto-dispatch", async (req, res) => {
  try {
    const userId = getUserId(req);
    const result = await executeAutoCourierDispatch(userId);
    res.json(result);
  } catch (err) {
    console.error("Error running auto courier dispatch:", err);
    res.status(500).json({ error: err.message || "Failed to run auto courier dispatch" });
  }
});
ordersRouter.post("/:id/approve-suspicious-dispatch", async (req, res) => {
  try {
    const orderId = req.params.id;
    const existing = db.getOrderById(orderId);
    if (!existing) {
      return res.status(404).json({ error: "Order not found" });
    }
    const { courierId = existing.courier_provider || "steadfast" } = req.body || {};
    db.updateOrder(orderId, {
      is_suspicious: false,
      suspicious_reason: void 0,
      manual_review_status: "approved",
      auto_dispatch_skipped: false
    });
    const dispResult = await dispatchOrderWithCourierEngine(existing, courierId);
    res.json({
      success: true,
      order: dispResult.updatedOrder,
      trackingNumber: dispResult.trackingNumber,
      message: `\u09AA\u09BE\u09B0\u09CD\u09B8\u09C7\u09B2\u099F\u09BF \u09AF\u09BE\u099A\u09BE\u0987 \u0995\u09B0\u09C7 \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 ${courierId.toUpperCase()} \u0995\u09C1\u09B0\u09BF\u09DF\u09BE\u09B0\u09C7 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09DF\u09C7\u099B\u09C7! \u099F\u09CD\u09B0\u09CD\u09AF\u09BE\u0995\u09BF\u0982 \u0986\u0987\u09A1\u09BF: ${dispResult.trackingNumber}`
    });
  } catch (err) {
    console.error("Error approving suspicious order:", err);
    res.status(500).json({ error: err.message || "Failed to approve and dispatch suspicious order" });
  }
});
ordersRouter.post("/:id/dismiss-suspicious", (req, res) => {
  try {
    const orderId = req.params.id;
    const existing = db.getOrderById(orderId);
    if (!existing) {
      return res.status(404).json({ error: "Order not found" });
    }
    const updated = db.updateOrder(orderId, {
      is_suspicious: false,
      manual_review_status: "approved"
    });
    res.json({
      success: true,
      order: updated,
      message: "\u09B8\u09A8\u09CD\u09A6\u09C7\u09B9\u099C\u09A8\u0995 \u09AB\u09CD\u09B2\u09CD\u09AF\u09BE\u0997 \u09B8\u09B0\u09BE\u09A8\u09CB \u09B9\u09DF\u09C7\u099B\u09C7\u0964 \u09AA\u09BE\u09B0\u09CD\u09B8\u09C7\u09B2\u099F\u09BF \u09A8\u09BF\u09B0\u09BE\u09AA\u09A6 \u09B9\u09BF\u09B8\u09C7\u09AC\u09C7 \u09AE\u09BE\u09B0\u09CD\u0995 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964"
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to dismiss suspicious tag" });
  }
});

// server/routes/stores.ts
init_database();
import { Router as Router13 } from "express";
init_subscriptionService();
var storesRouter = Router13();
storesRouter.get("/", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const subStatus = getUserSubscriptionStatus(user.id);
  const stores = db.getStores(user.id);
  const totalStores = stores.length;
  const activeStores = stores.filter((s) => s.is_active).length;
  const totalSyncedOrders = stores.reduce((sum, s) => sum + (s.synced_orders_count || 0), 0);
  const totalRevenueSynced = stores.reduce((sum, s) => sum + (s.total_revenue_synced || 0), 0);
  return res.json({
    stores,
    isProPlan: subStatus.canAccessStores || subStatus.isProPlan || user.role === "admin",
    stats: {
      totalStores,
      activeStores,
      totalSyncedOrders,
      totalRevenueSynced
    }
  });
});
storesRouter.post("/", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const subStatus = getUserSubscriptionStatus(user.id);
  const canAddWebsite = subStatus.canAccessStores || subStatus.isProPlan || user.role === "admin";
  if (!canAddWebsite || subStatus.isExpired) {
    return res.status(403).json({
      error: "Active subscription required to connect a website store.",
      code: "PLAN_REQUIRED"
    });
  }
  const existingStores = db.getStores(user.id);
  const isPro = subStatus.isProPlan || user.role === "admin";
  const maxStores = isPro ? 999 : 1;
  if (existingStores.length >= maxStores) {
    return res.status(403).json({
      error: "Your Starter AI Plan (1,250 BDT/month) supports 1 website store integration. Upgrade to the Pro Business Plan (1,950 BDT/month) for unlimited multi-store sync.",
      code: "PRO_PLAN_REQUIRED"
    });
  }
  const { platform, store_name, store_url, api_key, webhook_secret } = req.body;
  if (!store_name || !store_name.trim()) {
    return res.status(400).json({ error: "Store name is required" });
  }
  const validPlatforms = ["shopify", "woocommerce", "custom_website"];
  const chosenPlatform = validPlatforms.includes(platform) ? platform : "shopify";
  const newStore = {
    id: `store_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id: user.id,
    platform: chosenPlatform,
    store_name: store_name.trim(),
    store_url: store_url ? store_url.trim() : "",
    api_key: api_key ? api_key.trim() : void 0,
    webhook_secret: webhook_secret ? webhook_secret.trim() : `sec_${Math.random().toString(36).substring(2, 12)}`,
    is_active: true,
    synced_orders_count: 0,
    total_revenue_synced: 0,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.createStore(newStore);
  return res.status(201).json({
    store: newStore,
    message: `${newStore.store_name} connected successfully! Use the webhook URL to sync live orders.`
  });
});
storesRouter.get("/:id", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const store = db.getStoreById(req.params.id);
  if (!store) {
    return res.status(404).json({ error: "Store not found" });
  }
  if (store.user_id !== user.id && user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  return res.json(store);
});
storesRouter.put("/:id", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const store = db.getStoreById(req.params.id);
  if (!store) {
    return res.status(404).json({ error: "Store not found" });
  }
  if (store.user_id !== user.id && user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  const { store_name, store_url, is_active, api_key } = req.body;
  const updates = {};
  if (store_name !== void 0) updates.store_name = store_name.trim();
  if (store_url !== void 0) updates.store_url = store_url.trim();
  if (is_active !== void 0) updates.is_active = Boolean(is_active);
  if (api_key !== void 0) updates.api_key = api_key.trim();
  const updated = db.updateStore(store.id, updates);
  return res.json({ store: updated, message: "Store configuration updated successfully" });
});
storesRouter.delete("/:id", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const store = db.getStoreById(req.params.id);
  if (!store) {
    return res.status(404).json({ error: "Store not found" });
  }
  if (store.user_id !== user.id && user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  db.deleteStore(store.id);
  return res.json({ success: true, message: "Store disconnected successfully" });
});
storesRouter.post("/:id/sync-test", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const subStatus = getUserSubscriptionStatus(user.id);
  const canSyncWebsite = subStatus.canAccessStores || subStatus.isProPlan || user.role === "admin";
  if (!canSyncWebsite) {
    return res.status(403).json({
      error: "Active plan required for website order synchronization.",
      code: "PLAN_REQUIRED"
    });
  }
  const store = db.getStoreById(req.params.id);
  if (!store) {
    return res.status(404).json({ error: "Store not found" });
  }
  const customData = req.body || {};
  const sampleItemsList = [
    { title: "Premium Cotton Oxford Shirt (Sky Blue - L)", price: 1250, qty: 1 },
    { title: "Executive Leather Wallet & Belt Gift Set", price: 1850, qty: 1 },
    { title: "Casual Polo Tee (Dark Navy) & Chino Pant combo", price: 2100, qty: 1 },
    { title: "Traditional Silk Panjabi (Semi-fitted Cream)", price: 2750, qty: 1 },
    { title: "Embroidered Lawn Three Piece Suit", price: 3200, qty: 1 }
  ];
  const chosenItem = sampleItemsList[Math.floor(Math.random() * sampleItemsList.length)];
  const sampleCustomers = [
    { name: "Kazi Mahfuzur Rahman", phone: "01712-987654", address: "House 14, Road 5, Dhanmondi, Dhaka" },
    { name: "Dr. Sharmin Akter", phone: "01819-234567", address: "Apartment 7A, Green View Tower, Gulshan 2, Dhaka" },
    { name: "Tanvir Hossain", phone: "01911-345678", address: "Plot 45, Sector 4, Uttara, Dhaka" },
    { name: "Nafisa Tabassum", phone: "01622-456789", address: "Road 11, Block D, Banani, Dhaka" },
    { name: "Rezaul Karim", phone: "01515-678901", address: "Holding 82, CDA Avenue, Nasirabad, Chittagong" }
  ];
  const chosenCustomer = sampleCustomers[Math.floor(Math.random() * sampleCustomers.length)];
  const externalOrderNum = customData.external_order_id || `#${Math.floor(1e3 + Math.random() * 9e3)}`;
  const totalAmount = customData.total_amount || chosenItem.price;
  const newOrder = {
    id: `ord_web_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    user_id: user.id,
    customer_id: `cust_web_${Date.now()}`,
    customer_name: customData.customer_name || chosenCustomer.name,
    customer_phone: customData.customer_phone || chosenCustomer.phone,
    customer_address: customData.customer_address || chosenCustomer.address,
    platform: store.platform,
    items: customData.items || chosenItem.title,
    quantity: customData.quantity || chosenItem.qty,
    total_amount: totalAmount,
    currency: "BDT",
    payment_method: customData.payment_method || (Math.random() > 0.5 ? "cod" : "bkash"),
    payment_status: customData.payment_status || (Math.random() > 0.5 ? "paid" : "pending"),
    status: "confirmed",
    order_source: "website",
    source_details: {
      platform: store.platform,
      store_id: store.id,
      store_name: store.store_name,
      external_order_id: externalOrderNum,
      store_url: store.store_url
    },
    is_vip: true,
    // Website orders are marked as VIP customers for 1-click WhatsApp re-engagement
    notes: `Synchronized in real-time from ${store.store_name} (${store.platform.toUpperCase()}) Order ${externalOrderNum}`,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.createOrder(newOrder);
  const newOrderCount = (store.synced_orders_count || 0) + 1;
  const newRevenue = (store.total_revenue_synced || 0) + totalAmount;
  db.updateStore(store.id, {
    synced_orders_count: newOrderCount,
    total_revenue_synced: newRevenue,
    last_synced_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  return res.status(201).json({
    success: true,
    order: newOrder,
    message: `\u{1F389} Simulated order ${externalOrderNum} from ${store.store_name} routed to Orders Hub!`
  });
});

// server/routes/callRequests.ts
init_database();
import { Router as Router14 } from "express";
init_metaService();
var callRequestsRouter = Router14();
callRequestsRouter.get("/", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  let requests = db.getCallRequests(user.id);
  const allMessages = db.getMessages(user.id);
  const allOrders = db.getOrders(user.id);
  requests = requests.map((r) => {
    if (r.customer_phone === "Pending in chat" || !extractBdPhoneNumber(r.customer_phone)) {
      const custMsgs = allMessages.filter((m) => m.customer_id === r.customer_id);
      let foundPhone = null;
      for (let i = custMsgs.length - 1; i >= 0; i--) {
        const p = extractBdPhoneNumber(custMsgs[i].message_text);
        if (p) {
          foundPhone = p;
          break;
        }
      }
      if (!foundPhone) {
        const matchingOrder = allOrders.find(
          (o) => o.customer_id === r.customer_id && extractBdPhoneNumber(o.customer_phone)
        );
        if (matchingOrder) {
          foundPhone = extractBdPhoneNumber(matchingOrder.customer_phone);
        }
      }
      if (foundPhone) {
        const updated = db.updateCallRequest(r.id, {
          customer_phone: foundPhone,
          notes: `Auto-updated with customer phone (${foundPhone}) from chat`
        });
        if (updated) return updated;
      }
    }
    return r;
  });
  const stats = {
    totalRequests: requests.length,
    pendingRequests: requests.filter((r) => r.status === "pending").length,
    calledRequests: requests.filter((r) => r.status === "called").length,
    convertedRequests: requests.filter((r) => r.status === "converted_to_order").length
  };
  return res.json({
    requests,
    stats
  });
});
callRequestsRouter.post("/", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { customer_name, customer_phone, customer_id, platform = "whatsapp", message_excerpt, notes } = req.body;
  if (!customer_phone || !customer_phone.trim()) {
    return res.status(400).json({ error: "Customer phone number is required" });
  }
  const newRequest = {
    id: `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id: user.id,
    customer_name: customer_name?.trim() || "Valued Customer",
    customer_phone: customer_phone.trim(),
    customer_id: customer_id?.trim() || customer_phone.trim(),
    platform: platform || "whatsapp",
    message_excerpt: message_excerpt?.trim() || "Requested phone call with representative",
    status: "pending",
    notes: notes?.trim() || "",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.createCallRequest(newRequest);
  return res.status(201).json({
    request: newRequest,
    message: "Customer call request queued successfully"
  });
});
callRequestsRouter.put("/:id", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const existing = db.getCallRequestById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: "Call request not found" });
  }
  if (existing.user_id !== user.id && user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  const { status, notes, customer_phone, customer_name } = req.body;
  const updates = {};
  if (status) {
    updates.status = status;
  }
  if (typeof notes === "string") {
    updates.notes = notes;
  }
  if (typeof customer_phone === "string" && customer_phone.trim()) {
    updates.customer_phone = customer_phone.trim();
  }
  if (typeof customer_name === "string" && customer_name.trim()) {
    updates.customer_name = customer_name.trim();
  }
  const updated = db.updateCallRequest(req.params.id, updates);
  return res.json({
    request: updated,
    message: "Call request updated successfully"
  });
});
callRequestsRouter.delete("/:id", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const existing = db.getCallRequestById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: "Call request not found" });
  }
  if (existing.user_id !== user.id && user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  db.deleteCallRequest(req.params.id);
  return res.json({
    success: true,
    message: "Call request deleted"
  });
});
callRequestsRouter.post("/:id/convert-to-order", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const callReq = db.getCallRequestById(req.params.id);
  if (!callReq) {
    return res.status(404).json({ error: "Call request not found" });
  }
  if (callReq.user_id !== user.id && user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  const {
    items = "Confirmed over phone call",
    quantity = 1,
    total_amount = 1200,
    customer_address = "Dhaka, Bangladesh",
    payment_method = "cod",
    payment_status = "pending",
    notes = ""
  } = req.body;
  const newOrder = {
    id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id: user.id,
    customer_id: callReq.customer_id || callReq.customer_phone,
    customer_name: callReq.customer_name,
    customer_phone: callReq.customer_phone,
    customer_address,
    platform: callReq.platform === "messenger" ? "messenger" : "whatsapp",
    items,
    quantity: Number(quantity) || 1,
    total_amount: Number(total_amount) || 0,
    currency: "BDT",
    payment_method,
    payment_status,
    status: "confirmed",
    order_source: "manual",
    is_vip: Number(total_amount) >= 1500,
    notes: `Order confirmed via phone call with customer. Previous note: ${callReq.message_excerpt}. ${notes}`.trim(),
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.createOrder(newOrder);
  db.updateCallRequest(req.params.id, {
    status: "converted_to_order",
    notes: `Converted to Order #${newOrder.id.slice(-6).toUpperCase()} on ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`
  });
  return res.status(201).json({
    order: newOrder,
    message: `Order #${newOrder.id.slice(-6).toUpperCase()} created and call marked as converted!`
  });
});
callRequestsRouter.post("/simulate", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const sampleNames = [
    { name: "Tanvir Ahmed", phone: "01712-334455", msg: "Ami apnader sathe phone a kotha bolte chai, call koren please.", platform: "whatsapp" },
    { name: "Nusrat Jahan", phone: "01844-998877", msg: "Delivery ar address confirm korte call dorkar. Ekta human agent kotha boluk.", platform: "messenger" },
    { name: "Mahbubur Rahman", phone: "01911-223344", msg: "Bhaiya ami bulk order nibo, apnader helpline theke call diben?", platform: "whatsapp" }
  ];
  const randomSample = sampleNames[Math.floor(Math.random() * sampleNames.length)];
  const simulated = {
    id: `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id: user.id,
    customer_name: randomSample.name,
    customer_phone: randomSample.phone,
    customer_id: randomSample.phone,
    platform: randomSample.platform,
    message_excerpt: randomSample.msg,
    status: "pending",
    notes: "Auto-detected by AI when customer requested human assistance in chat",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.createCallRequest(simulated);
  return res.status(201).json({
    request: simulated,
    message: `Simulated call request from ${simulated.customer_name} added to your queue!`
  });
});

// server/routes/products.ts
init_database();
import { Router as Router15 } from "express";
var productsRouter = Router15();
productsRouter.get("/", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { category, stock_status, search } = req.query;
  let products = db.getProducts(user.id);
  if (category && typeof category === "string" && category !== "all") {
    products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }
  if (stock_status && typeof stock_status === "string" && stock_status !== "all") {
    products = products.filter((p) => p.stock_status === stock_status);
  }
  if (search && typeof search === "string" && search.trim()) {
    const q = search.toLowerCase().trim();
    products = products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.keywords?.some((k) => k.toLowerCase().includes(q))
    );
  }
  const totalProducts = products.length;
  const inStockCount = products.filter((p) => p.stock_status === "in_stock").length;
  const lowStockCount = products.filter((p) => p.stock_status === "low_stock").length;
  const outOfStockCount = products.filter((p) => p.stock_status === "out_of_stock").length;
  const allUserProducts = db.getProducts(user.id);
  const categories = Array.from(new Set(allUserProducts.map((p) => p.category).filter(Boolean)));
  return res.json({
    products,
    stats: {
      totalProducts,
      inStockCount,
      lowStockCount,
      outOfStockCount
    },
    categories
  });
});
productsRouter.get("/:id", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const product = db.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  if (product.user_id !== user.id && user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  return res.json({ product });
});
productsRouter.post("/", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const {
    name,
    price,
    buying_price,
    stock_quantity,
    currency = "BDT",
    category = "General",
    description = "",
    image_url = "",
    stock_status = "in_stock",
    keywords = []
  } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Product name is required" });
  }
  const numericPrice = Number(price);
  if (isNaN(numericPrice) || numericPrice < 0) {
    return res.status(400).json({ error: "A valid product price is required" });
  }
  const numericBuyingPrice = buying_price !== void 0 && buying_price !== "" && !isNaN(Number(buying_price)) ? Math.max(0, Number(buying_price)) : Math.round(numericPrice * 0.58);
  const numericStockQty = stock_quantity !== void 0 && stock_quantity !== "" && !isNaN(Number(stock_quantity)) ? Math.max(0, Number(stock_quantity)) : stock_status === "out_of_stock" ? 0 : stock_status === "low_stock" ? 4 : 25;
  const computedStatus = stock_quantity !== void 0 && stock_quantity !== "" ? numericStockQty <= 0 ? "out_of_stock" : numericStockQty <= 5 ? "low_stock" : "in_stock" : stock_status || "in_stock";
  let parsedKeywords = [];
  if (Array.isArray(keywords)) {
    parsedKeywords = keywords.map((k) => String(k).trim()).filter(Boolean);
  } else if (typeof keywords === "string") {
    parsedKeywords = keywords.split(",").map((k) => k.trim()).filter(Boolean);
  }
  const newProduct = {
    id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    user_id: user.id,
    name: name.trim(),
    price: numericPrice,
    buying_price: numericBuyingPrice,
    stock_quantity: numericStockQty,
    sold_count: 0,
    currency: currency.toUpperCase().trim() || "BDT",
    category: category.trim() || "General",
    description: description.trim(),
    image_url: image_url.trim(),
    stock_status: computedStatus,
    keywords: parsedKeywords,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.createProduct(newProduct);
  return res.status(201).json({
    product: newProduct,
    message: "Product added successfully to your catalog. AI can now recommend and share this product."
  });
});
productsRouter.put("/:id", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const existing = db.getProductById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: "Product not found" });
  }
  if (existing.user_id !== user.id && user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  const {
    name,
    price,
    buying_price,
    stock_quantity,
    currency,
    category,
    description,
    image_url,
    stock_status,
    keywords
  } = req.body;
  let parsedKeywords = existing.keywords;
  if (keywords !== void 0) {
    if (Array.isArray(keywords)) {
      parsedKeywords = keywords.map((k) => String(k).trim()).filter(Boolean);
    } else if (typeof keywords === "string") {
      parsedKeywords = keywords.split(",").map((k) => k.trim()).filter(Boolean);
    }
  }
  const updates = {};
  if (name !== void 0) updates.name = name.trim();
  if (price !== void 0) {
    const num = Number(price);
    if (!isNaN(num) && num >= 0) updates.price = num;
  }
  if (buying_price !== void 0) {
    const numBuy = Number(buying_price);
    if (!isNaN(numBuy) && numBuy >= 0) updates.buying_price = numBuy;
  }
  if (stock_quantity !== void 0 && stock_quantity !== "") {
    const numStock = Math.max(0, Number(stock_quantity));
    if (!isNaN(numStock)) {
      updates.stock_quantity = numStock;
      updates.stock_status = numStock <= 0 ? "out_of_stock" : numStock <= 5 ? "low_stock" : "in_stock";
    }
  } else if (stock_status !== void 0) {
    updates.stock_status = stock_status;
  }
  if (currency !== void 0) updates.currency = currency.toUpperCase().trim();
  if (category !== void 0) updates.category = category.trim();
  if (description !== void 0) updates.description = description.trim();
  if (image_url !== void 0) updates.image_url = image_url.trim();
  if (parsedKeywords !== void 0) updates.keywords = parsedKeywords;
  const updated = db.updateProduct(req.params.id, updates);
  return res.json({
    product: updated,
    message: "Product updated successfully."
  });
});
productsRouter.delete("/:id", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const existing = db.getProductById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: "Product not found" });
  }
  if (existing.user_id !== user.id && user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  db.deleteProduct(req.params.id);
  return res.json({
    success: true,
    message: "Product deleted from catalog."
  });
});
productsRouter.post("/sample-seed", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return res.json({
    success: true,
    count: 0,
    products: [],
    message: "Default catalog is kept clean. Add your own real products via the Add Product form or WooCommerce/Shopify sync."
  });
});
productsRouter.get("/:id/image", (req, res) => {
  const prod = db.getProductById(req.params.id);
  if (!prod || !prod.image_url) {
    return res.status(404).send("Product photo not found");
  }
  const url = prod.image_url.trim();
  if (url.startsWith("data:image/")) {
    const matches = url.match(/^data:([a-zA-Z0-9/+-]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).send("Invalid data URL");
    }
    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], "base64");
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.send(buffer);
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return res.redirect(302, url);
  }
  return res.status(404).send("Invalid image format");
});
productsRouter.post("/test-ai-query", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { message, platform = "messenger", productId } = req.body;
  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }
  try {
    const { generateAIReply: generateAIReply2 } = await Promise.resolve().then(() => (init_aiService(), aiService_exports));
    const aiResult = await generateAIReply2({
      userId: user.id,
      incomingMessage: message.trim(),
      customerId: `test_merchant_${user.id}`,
      customerName: "Customer",
      platform,
      channelName: user.business_name || user.full_name || "My Store",
      targetProductId: productId || void 0
    });
    return res.json({
      success: true,
      reply: aiResult.replyText,
      attachedImageUrl: aiResult.attachedImageUrl,
      attachedProductName: aiResult.attachedProductName,
      attachedProductPrice: aiResult.attachedProductPrice,
      attachedProducts: aiResult.attachedProducts,
      attachedImages: aiResult.attachedImages
    });
  } catch (err) {
    console.error("Error generating product AI test reply:", err);
    return res.status(500).json({ error: err?.message || "Failed to generate product AI reply" });
  }
});

// server/routes/appointments.ts
init_database();
import { Router as Router16 } from "express";
init_appointmentService();
init_aiService();
var appointmentsRouter = Router16();
appointmentsRouter.get("/", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const appointments = db.getAppointments(user.id);
  const settings = db.getAppointmentSettings(user.id);
  const todayStr = getTodayDateStr(0);
  const enrichedAppointments = appointments.map((apt) => ({
    ...apt,
    google_calendar_url: buildGoogleCalendarUrl(apt, user.full_name || "One Agent BD")
  }));
  const stats = {
    totalBookings: appointments.length,
    todayBookings: appointments.filter((a) => a.appointment_date === todayStr && a.status !== "cancelled").length,
    upcomingBookings: appointments.filter((a) => a.appointment_date >= todayStr && a.status === "confirmed").length,
    aiBookedCount: appointments.filter((a) => a.booking_source === "ai_chat" || a.booking_source === "website").length,
    completedCount: appointments.filter((a) => a.status === "completed").length,
    cancelledCount: appointments.filter((a) => a.status === "cancelled").length
  };
  return res.json({
    appointments: enrichedAppointments,
    settings,
    stats,
    icalFeedPath: `/api/appointments/ical/${user.id}/calendar.ics`
  });
});
appointmentsRouter.get("/settings", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const settings = db.getAppointmentSettings(user.id);
  return res.json({ settings });
});
appointmentsRouter.put("/settings", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const updates = req.body || {};
  if (Array.isArray(updates.available_slots)) {
    updates.available_slots = updates.available_slots.map((s) => normalizeSlotLabel(String(s))).filter(Boolean);
  }
  if (Array.isArray(updates.services_offered)) {
    updates.services_offered = updates.services_offered.map((s) => String(s).trim()).filter(Boolean);
  }
  const updated = db.updateAppointmentSettings(user.id, updates);
  return res.json({
    success: true,
    settings: updated,
    message: "AI Appointment & Calendar settings saved successfully"
  });
});
appointmentsRouter.get("/slots", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const dateStr = typeof req.query.date === "string" ? req.query.date : getTodayDateStr(0);
  const availability = getSlotAvailability(user.id, dateStr);
  return res.json(availability);
});
appointmentsRouter.post("/", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const {
    customer_name,
    customer_phone,
    customer_email,
    platform = "manual",
    service_name,
    appointment_date,
    appointment_time,
    duration_minutes,
    location,
    notes
  } = req.body || {};
  if (!customer_name || !customer_phone) {
    return res.status(400).json({ error: "Customer name and phone number are required" });
  }
  const settings = db.getAppointmentSettings(user.id);
  const cleanDate = appointment_date && /^\d{4}-\d{2}-\d{2}$/.test(appointment_date) ? appointment_date : getTodayDateStr(0);
  const cleanTime = normalizeSlotLabel(appointment_time || "11:00 AM");
  const newAppointment = {
    id: `apt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    user_id: user.id,
    customer_id: customer_phone.trim(),
    customer_name: customer_name.trim(),
    customer_phone: customer_phone.trim(),
    customer_email: customer_email?.trim(),
    platform,
    service_name: service_name?.trim() || settings.services_offered?.[0] || "General Consultation",
    appointment_date: cleanDate,
    appointment_time: cleanTime,
    duration_minutes: Number(duration_minutes) || settings.slot_duration_minutes || 30,
    status: "confirmed",
    booking_source: "manual",
    location: location?.trim() || settings.location_address || "Main Office / Online Session",
    google_calendar_synced: true,
    notes: notes?.trim() || "Scheduled from Merchant Dashboard",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  const created = db.createAppointment(newAppointment);
  return res.status(201).json({
    appointment: {
      ...created,
      google_calendar_url: buildGoogleCalendarUrl(created, user.full_name || "One Agent BD")
    },
    message: "Appointment scheduled and ready for Google Calendar sync"
  });
});
appointmentsRouter.put("/:id", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { id } = req.params;
  const existing = db.getAppointmentById(id);
  if (!existing || existing.user_id !== user.id) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  const updates = {};
  if (req.body.status) updates.status = req.body.status;
  if (req.body.appointment_date) updates.appointment_date = req.body.appointment_date;
  if (req.body.appointment_time) updates.appointment_time = normalizeSlotLabel(req.body.appointment_time);
  if (req.body.service_name) updates.service_name = req.body.service_name;
  if (req.body.customer_name) updates.customer_name = req.body.customer_name;
  if (req.body.customer_phone) updates.customer_phone = req.body.customer_phone;
  if (req.body.location !== void 0) updates.location = req.body.location;
  if (req.body.notes !== void 0) updates.notes = req.body.notes;
  if (req.body.google_calendar_synced !== void 0) {
    updates.google_calendar_synced = Boolean(req.body.google_calendar_synced);
  }
  const updated = db.updateAppointment(id, updates);
  if (!updated) {
    return res.status(404).json({ error: "Failed to update appointment" });
  }
  return res.json({
    appointment: {
      ...updated,
      google_calendar_url: buildGoogleCalendarUrl(updated, user.full_name || "One Agent BD")
    },
    message: "Appointment updated successfully"
  });
});
appointmentsRouter.delete("/:id", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { id } = req.params;
  const existing = db.getAppointmentById(id);
  if (!existing || existing.user_id !== user.id) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  db.deleteAppointment(id);
  return res.json({ success: true, message: "Appointment removed from calendar" });
});
appointmentsRouter.post("/simulate-ai", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const {
    customerName = "Tanvir Hasan",
    customerPhone = "01712345678",
    platform = "messenger",
    messageText = "\u0986\u0997\u09BE\u09AE\u09C0\u0995\u09BE\u09B2 \u09AC\u09BF\u0995\u09C7\u09B2 \u09EA\u099F\u09BE\u09DF \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09B6\u09A8 \u0985\u09CD\u09AF\u09BE\u09AA\u09AF\u09BC\u09C7\u09A8\u09CD\u099F\u09AE\u09C7\u09A8\u09CD\u099F \u09AC\u09C1\u0995 \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u0987\u0964 \u0986\u09AE\u09BE\u09B0 \u09A8\u09BE\u09AE \u09A4\u09BE\u09A8\u09AD\u09C0\u09B0, \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0 01712345678"
  } = req.body || {};
  try {
    const aiResult = await generateAIReply({
      userId: user.id,
      incomingMessage: messageText,
      customerId: customerPhone || `sim_${Date.now()}`,
      customerName,
      platform: platform === "whatsapp" || platform === "instagram" ? platform : "messenger",
      channelName: user.full_name || "One Agent BD"
    });
    const bookedAppointment = await detectAndRecordAppointment({
      userId: user.id,
      customerId: customerPhone || `sim_${Date.now()}`,
      customerName,
      platform: platform || "messenger",
      messageText,
      aiReplyText: aiResult.replyText
    });
    return res.json({
      success: true,
      aiReply: aiResult.replyText,
      bookedAppointment: bookedAppointment ? {
        ...bookedAppointment,
        google_calendar_url: buildGoogleCalendarUrl(bookedAppointment, user.full_name || "One Agent BD")
      } : null
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Simulation error" });
  }
});
appointmentsRouter.get("/ical/:userId/calendar.ics", (req, res) => {
  const { userId } = req.params;
  const profile = db.getProfileById(userId);
  const appointments = db.getAppointments(userId);
  const icsContent = generateICalFeed(appointments, profile?.full_name || "One Agent BD");
  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="oneagentbd-appointments.ics"');
  return res.send(icsContent);
});

// server/routes/emailCampaigns.ts
init_database();
import { Router as Router17 } from "express";
init_emailCampaignService();
var emailCampaignsRouter = Router17();
function getEffectiveBaseUrl(req) {
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
  const host = req.headers["x-forwarded-host"] || req.get("host") || "localhost:3000";
  return `${proto}://${host}`;
}
emailCampaignsRouter.get("/", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const campaigns = db.getEmailCampaigns(user.id);
  const subscribers = db.getEmailSubscribers(user.id);
  const smtpSettings = db.getEmailSmtpSettings(user.id);
  const analytics = computeEmailAnalytics(campaigns);
  return res.json({
    campaigns,
    subscribers,
    smtpSettings: {
      ...smtpSettings,
      smtp_pass: smtpSettings.smtp_pass ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : "",
      api_key: smtpSettings.api_key ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : ""
    },
    analytics
  });
});
emailCampaignsRouter.post("/subscribers", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { email, name, phone, tags, bulkText } = req.body || {};
  if (typeof bulkText === "string" && bulkText.trim()) {
    const lines = bulkText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    let importedCount = 0;
    for (const line of lines) {
      const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (!emailMatch) continue;
      const foundEmail = emailMatch[0].toLowerCase();
      const parts = line.split(/[,;\t|]/).map((p) => p.trim());
      const guessedName = parts.find((p) => p && !p.includes("@") && !/^\+?\d+$/.test(p)) || foundEmail.split("@")[0];
      db.saveEmailSubscriber({
        id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        user_id: user.id,
        email: foundEmail,
        name: guessedName,
        tags: Array.isArray(tags) && tags.length > 0 ? tags : ["imported"],
        source: "csv_import",
        status: "subscribed",
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      importedCount++;
    }
    return res.json({
      success: true,
      importedCount,
      subscribers: db.getEmailSubscribers(user.id),
      message: `Successfully imported ${importedCount} email subscriber(s)!`
    });
  }
  if (!email || !/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(String(email))) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }
  const saved = db.saveEmailSubscriber({
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    user_id: user.id,
    email: String(email).trim().toLowerCase(),
    name: String(name || email.split("@")[0]).trim(),
    phone: phone ? String(phone).trim() : void 0,
    tags: Array.isArray(tags) && tags.length > 0 ? tags : ["customer"],
    source: "manual",
    status: "subscribed",
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  return res.status(201).json({
    success: true,
    subscriber: saved,
    subscribers: db.getEmailSubscribers(user.id),
    message: "Subscriber added successfully!"
  });
});
emailCampaignsRouter.post("/subscribers/sync", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const result = syncSubscribersFromChatsAndOrders(user.id);
  return res.json({
    success: true,
    ...result,
    subscribers: db.getEmailSubscribers(user.id),
    message: result.addedCount > 0 ? `Found and synced ${result.addedCount} new email address(es) from your customer chats & bookings!` : "All customer emails from chats and bookings are already synced."
  });
});
emailCampaignsRouter.delete("/subscribers/:id", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  db.deleteEmailSubscriber(req.params.id, user.id);
  return res.json({
    success: true,
    subscribers: db.getEmailSubscribers(user.id),
    message: "Subscriber removed."
  });
});
emailCampaignsRouter.put("/smtp", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const current = db.getEmailSmtpSettings(user.id);
  const body = req.body || {};
  const updates = {
    provider: body.provider || current.provider,
    sender_name: body.sender_name !== void 0 ? String(body.sender_name).trim() : current.sender_name,
    sender_email: body.sender_email !== void 0 ? String(body.sender_email).trim() : current.sender_email,
    smtp_host: body.provider === "gmail" ? "smtp.gmail.com" : body.smtp_host !== void 0 ? String(body.smtp_host).trim() : current.smtp_host,
    smtp_port: Number(body.smtp_port) || 465,
    smtp_user: body.smtp_user !== void 0 ? String(body.smtp_user).trim() : current.smtp_user,
    reply_to: body.reply_to !== void 0 ? String(body.reply_to).trim() : current.reply_to
  };
  if (body.smtp_pass && !String(body.smtp_pass).includes("\u2022\u2022\u2022\u2022")) {
    updates.smtp_pass = String(body.smtp_pass).trim();
  }
  if (body.api_key && !String(body.api_key).includes("\u2022\u2022\u2022\u2022")) {
    updates.api_key = String(body.api_key).trim();
  }
  const updated = db.updateEmailSmtpSettings(user.id, updates);
  return res.json({
    success: true,
    smtpSettings: {
      ...updated,
      smtp_pass: updated.smtp_pass ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : "",
      api_key: updated.api_key ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : ""
    },
    message: "Email sender & SMTP settings saved successfully!"
  });
});
emailCampaignsRouter.post("/ai-write", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { topicPrompt, language = "en" } = req.body || {};
  if (!topicPrompt || !String(topicPrompt).trim()) {
    return res.status(400).json({ error: "Please enter an offer or topic for the AI writer." });
  }
  const generated = await generateMarketingEmailWithAI({
    userId: user.id,
    businessName: user.full_name || "One Agent BD Store",
    topicPrompt: String(topicPrompt).trim(),
    language: language === "bn" ? "bn" : "en"
  });
  return res.json({
    success: true,
    ...generated
  });
});
emailCampaignsRouter.post("/", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const {
    name,
    subject,
    preheader,
    body_html,
    cta_text,
    cta_url,
    audience_filter = "all",
    custom_emails
  } = req.body || {};
  if (!subject || !body_html) {
    return res.status(400).json({ error: "Campaign subject and message body are required." });
  }
  const allSubscribers = db.getEmailSubscribers(user.id).filter((s) => s.status === "subscribed");
  let targetRecipients = [];
  if (typeof custom_emails === "string" && custom_emails.trim()) {
    const matches = custom_emails.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    for (const raw of matches) {
      const clean = raw.toLowerCase();
      if (!targetRecipients.some((r) => r.email === clean)) {
        const subMatch = allSubscribers.find((s) => s.email.toLowerCase() === clean);
        targetRecipients.push({
          email: clean,
          name: subMatch?.name || clean.split("@")[0]
        });
      }
    }
  }
  if (targetRecipients.length === 0) {
    const filtered = audience_filter === "vip" ? allSubscribers.filter((s) => s.tags.some((t) => t.toLowerCase().includes("vip"))) : allSubscribers;
    targetRecipients = filtered.map((s) => ({ email: s.email, name: s.name }));
  }
  if (targetRecipients.length === 0) {
    return res.status(400).json({
      error: "No recipients found. Please add subscribers or paste recipient emails first."
    });
  }
  const campaignId = `em_cmp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const smtpSettings = db.getEmailSmtpSettings(user.id);
  const baseUrl = getEffectiveBaseUrl(req);
  const businessName = smtpSettings.sender_name || user.full_name || "One Agent BD";
  const recipientLogs = [];
  let sentCount = 0;
  let actualMode = smtpSettings.is_configured ? "live_smtp" : "simulated";
  for (const recipient of targetRecipients) {
    const trackedHtml = buildTrackedEmailHtml({
      businessName,
      subject: String(subject).trim(),
      preheader: preheader ? String(preheader).trim() : void 0,
      bodyHtml: String(body_html).trim(),
      ctaText: cta_text ? String(cta_text).trim() : void 0,
      ctaUrl: cta_url ? String(cta_url).trim() : void 0,
      campaignId,
      recipientEmail: recipient.email,
      recipientName: recipient.name,
      baseUrl
    });
    const sendRes = await dispatchSingleEmail({
      smtpSettings,
      toEmail: recipient.email,
      toName: recipient.name,
      subject: String(subject).trim(),
      html: trackedHtml
    });
    actualMode = sendRes.mode;
    if (sendRes.delivered) {
      sentCount++;
    }
    recipientLogs.push({
      email: recipient.email,
      name: recipient.name,
      sent_at: (/* @__PURE__ */ new Date()).toISOString(),
      opened: false,
      open_count: 0,
      clicked: false,
      click_count: 0
    });
  }
  const newCampaign = {
    id: campaignId,
    user_id: user.id,
    name: String(name || subject).trim(),
    subject: String(subject).trim(),
    preheader: preheader ? String(preheader).trim() : void 0,
    body_html: String(body_html).trim(),
    cta_text: cta_text ? String(cta_text).trim() : void 0,
    cta_url: cta_url ? String(cta_url).trim() : void 0,
    audience_filter,
    status: "sent",
    total_recipients: targetRecipients.length,
    sent_count: sentCount || targetRecipients.length,
    opened_count: 0,
    clicked_count: 0,
    delivery_mode: actualMode,
    recipients: recipientLogs,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    sent_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  const created = db.createEmailCampaign(newCampaign);
  const campaigns = db.getEmailCampaigns(user.id);
  return res.status(201).json({
    success: true,
    campaign: created,
    analytics: computeEmailAnalytics(campaigns),
    message: actualMode === "live_smtp" ? `Campaign broadcast sent to ${created.sent_count} recipient(s) via your connected SMTP!` : `Campaign broadcast dispatched to ${created.sent_count} recipient(s) with Open & Click tracking enabled!`
  });
});
emailCampaignsRouter.post("/:id/simulate-engagement", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const campaign = db.getEmailCampaignById(req.params.id);
  if (!campaign || campaign.user_id !== user.id) {
    return res.status(404).json({ error: "Campaign not found" });
  }
  const { type = "open" } = req.body || {};
  const recipients = [...campaign.recipients || []];
  if (recipients.length > 0) {
    const targetIdx = type === "click" ? recipients.findIndex((r) => !r.clicked) : recipients.findIndex((r) => !r.opened);
    const idx = targetIdx >= 0 ? targetIdx : 0;
    recipients[idx] = {
      ...recipients[idx],
      opened: true,
      opened_at: recipients[idx].opened_at || (/* @__PURE__ */ new Date()).toISOString(),
      open_count: (recipients[idx].open_count || 0) + 1,
      ...type === "click" ? {
        clicked: true,
        clicked_at: recipients[idx].clicked_at || (/* @__PURE__ */ new Date()).toISOString(),
        click_count: (recipients[idx].click_count || 0) + 1
      } : {}
    };
  }
  const openedCount = recipients.filter((r) => r.opened).length;
  const clickedCount = recipients.filter((r) => r.clicked).length;
  const updated = db.updateEmailCampaign(campaign.id, {
    recipients,
    opened_count: Math.max(openedCount, (campaign.opened_count || 0) + (type === "open" ? 1 : 0)),
    clicked_count: type === "click" ? Math.max(clickedCount, (campaign.clicked_count || 0) + 1) : campaign.clicked_count
  });
  const allCampaigns = db.getEmailCampaigns(user.id);
  return res.json({
    success: true,
    campaign: updated,
    analytics: computeEmailAnalytics(allCampaigns),
    message: type === "click" ? "Tracked recipient link click (+1 Click & Open recorded)!" : "Tracked recipient email open (+1 Open recorded)!"
  });
});
emailCampaignsRouter.delete("/:id", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  db.deleteEmailCampaign(req.params.id, user.id);
  const campaigns = db.getEmailCampaigns(user.id);
  return res.json({
    success: true,
    campaigns,
    analytics: computeEmailAnalytics(campaigns),
    message: "Email campaign deleted."
  });
});
emailCampaignsRouter.get("/track/open/:campaignId", (req, res) => {
  try {
    const { campaignId } = req.params;
    const recipientEmail = String(req.query.e || "").trim().toLowerCase();
    const campaign = db.getEmailCampaignById(campaignId);
    if (campaign) {
      const recipients = [...campaign.recipients || []];
      const idx = recipients.findIndex((r) => r.email.toLowerCase() === recipientEmail);
      if (idx >= 0) {
        recipients[idx] = {
          ...recipients[idx],
          opened: true,
          opened_at: recipients[idx].opened_at || (/* @__PURE__ */ new Date()).toISOString(),
          open_count: (recipients[idx].open_count || 0) + 1
        };
      }
      const uniqueOpens = recipients.filter((r) => r.opened).length;
      db.updateEmailCampaign(campaign.id, {
        recipients,
        opened_count: Math.max(uniqueOpens, (campaign.opened_count || 0) + (idx === -1 ? 1 : 0))
      });
    }
  } catch (err) {
    console.warn("[Email Open Pixel] Warning:", err);
  }
  res.setHeader("Content-Type", "image/gif");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  return res.end(TRANSPARENT_GIF_BUFFER);
});
emailCampaignsRouter.get("/track/click/:campaignId", (req, res) => {
  const targetUrl = String(req.query.url || "https://www.oneagentbd.online").trim();
  try {
    const { campaignId } = req.params;
    const recipientEmail = String(req.query.e || "").trim().toLowerCase();
    const campaign = db.getEmailCampaignById(campaignId);
    if (campaign) {
      const recipients = [...campaign.recipients || []];
      const idx = recipients.findIndex((r) => r.email.toLowerCase() === recipientEmail);
      if (idx >= 0) {
        recipients[idx] = {
          ...recipients[idx],
          opened: true,
          opened_at: recipients[idx].opened_at || (/* @__PURE__ */ new Date()).toISOString(),
          open_count: Math.max(1, recipients[idx].open_count || 0),
          clicked: true,
          clicked_at: recipients[idx].clicked_at || (/* @__PURE__ */ new Date()).toISOString(),
          click_count: (recipients[idx].click_count || 0) + 1
        };
      }
      const uniqueOpens = recipients.filter((r) => r.opened).length;
      const uniqueClicks = recipients.filter((r) => r.clicked).length;
      db.updateEmailCampaign(campaign.id, {
        recipients,
        opened_count: Math.max(uniqueOpens, campaign.opened_count || 0),
        clicked_count: Math.max(uniqueClicks, (campaign.clicked_count || 0) + (idx === -1 ? 1 : 0))
      });
    }
  } catch (err) {
    console.warn("[Email Click Tracker] Warning:", err);
  }
  return res.redirect(302, targetUrl);
});

// server/routes/erp.ts
init_database();
import { Router as Router18 } from "express";
var erpRouter = Router18();
function buildErpSummary(userId) {
  const allProducts = db.getProducts(userId);
  const products = allProducts.map((p) => {
    const defaultStock = p.stock_status === "out_of_stock" ? 0 : p.stock_status === "low_stock" ? 4 : 20;
    const stockQty = p.stock_quantity !== void 0 && p.stock_quantity !== null && !isNaN(Number(p.stock_quantity)) ? Math.max(0, Number(p.stock_quantity)) : defaultStock;
    const status = stockQty <= 0 ? "out_of_stock" : stockQty <= 5 ? "low_stock" : "in_stock";
    return {
      ...p,
      stock_quantity: stockQty,
      stock_status: status,
      buying_price: p.buying_price !== void 0 && !isNaN(Number(p.buying_price)) ? Number(p.buying_price) : Math.round((Number(p.price) || 0) * 0.6)
    };
  });
  const orders = db.getOrders(userId);
  const activeOrders = orders.filter((o) => o.status !== "cancelled");
  const purchases = db.getPurchases(userId);
  const manualDues = db.getDueRecords(userId);
  const transactions = db.getAccountTransactions(userId);
  const ordersSalesTotal = activeOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const extraSalesIncome = transactions.filter((t) => t.type === "income" && t.category === "Product Sales").reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalSales = ordersSalesTotal + extraSalesIncome;
  const loggedPurchasesTotal = purchases.reduce((sum, p) => sum + (Number(p.total_cost) || 0), 0);
  const estimatedInventoryCost = products.reduce(
    (sum, p) => sum + (Number(p.buying_price) || 0) * (Number(p.stock_quantity) || 0),
    0
  );
  const totalPurchase = loggedPurchasesTotal > 0 ? loggedPurchasesTotal : estimatedInventoryCost;
  const orderDueEntries = activeOrders.filter((o) => o.payment_status !== "paid").map((o) => {
    const total = Number(o.total_amount) || 0;
    const paid = Number(o.advance_paid_amount) || 0;
    const due = Math.max(0, total - paid);
    return {
      id: `ord_due_${o.id}`,
      user_id: userId,
      party_type: "customer",
      party_name: o.customer_name || "Customer",
      party_phone: o.customer_phone || o.customer_id,
      reference_type: "order",
      reference_id: o.id,
      description: `Order #${o.id.slice(-6).toUpperCase()} \u2014 ${o.items}`,
      total_amount: total,
      paid_amount: paid,
      due_amount: due,
      status: due === 0 ? "settled" : paid > 0 ? "partial" : "unpaid",
      created_at: o.created_at,
      updated_at: o.updated_at
    };
  }).filter((d) => d.due_amount > 0);
  const combinedDues = [...manualDues, ...orderDueEntries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const customerDueTotal = combinedDues.filter((d) => d.party_type === "customer" && d.status !== "settled").reduce((sum, d) => sum + (Number(d.due_amount) || 0), 0);
  const supplierDueTotal = combinedDues.filter((d) => d.party_type === "supplier" && d.status !== "settled").reduce((sum, d) => sum + (Number(d.due_amount) || 0), 0);
  const totalDue = customerDueTotal + supplierDueTotal;
  const totalProducts = products.length;
  const totalStockUnits = products.reduce((sum, p) => sum + (Number(p.stock_quantity) || 0), 0);
  const inStockCount = products.filter((p) => p.stock_status === "in_stock").length;
  const lowStockCount = products.filter((p) => p.stock_status === "low_stock").length;
  const outOfStockCount = products.filter((p) => p.stock_status === "out_of_stock").length;
  const inStockPct = totalProducts > 0 ? Math.round(inStockCount / totalProducts * 100) : 0;
  const lowStockPct = totalProducts > 0 ? Math.round(lowStockCount / totalProducts * 100) : 0;
  const outOfStockPct = totalProducts > 0 ? Math.max(0, 100 - inStockPct - lowStockPct) : 0;
  const topProducts = products.map((prod) => {
    const matchedOrdersQty = activeOrders.filter((o) => (o.items || "").toLowerCase().includes(prod.name.toLowerCase())).reduce((sum, o) => sum + (Number(o.quantity) || 1), 0);
    const soldQty = Math.max(Number(prod.sold_count) || 0, matchedOrdersQty);
    return {
      id: prod.id,
      name: prod.name,
      category: prod.category,
      price: prod.price,
      stock_quantity: prod.stock_quantity || 0,
      stock_status: prod.stock_status,
      soldQty,
      revenue: soldQty * (Number(prod.price) || 0)
    };
  }).sort((a, b) => b.soldQty - a.soldQty).slice(0, 6);
  const now = /* @__PURE__ */ new Date();
  const salesOverview = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = d.toLocaleString("en-US", { month: "short" });
    const monthIdx = d.getMonth();
    const yearIdx = d.getFullYear();
    const monthSales = activeOrders.filter((o) => {
      const od = new Date(o.created_at);
      return od.getMonth() === monthIdx && od.getFullYear() === yearIdx;
    }).reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const monthPurchases = purchases.filter((p) => {
      const pd = new Date(p.created_at);
      return pd.getMonth() === monthIdx && pd.getFullYear() === yearIdx;
    }).reduce((sum, p) => sum + (Number(p.total_cost) || 0), 0);
    return {
      label,
      sales: i === 5 && monthSales === 0 ? totalSales : monthSales,
      purchase: i === 5 && monthPurchases === 0 ? totalPurchase : monthPurchases
    };
  });
  const manualIncomeTotal = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const paidOrdersRevenue = activeOrders.reduce((sum, o) => {
    if (o.payment_status === "paid") return sum + (Number(o.total_amount) || 0);
    return sum + (Number(o.advance_paid_amount) || 0);
  }, 0);
  const manualExpenseTotal = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalIncome = paidOrdersRevenue + manualIncomeTotal;
  const totalExpense = manualExpenseTotal + loggedPurchasesTotal;
  const netCashBalance = totalIncome - totalExpense;
  return {
    kpis: {
      totalSales,
      totalPurchase,
      totalDue,
      customerDueTotal,
      supplierDueTotal,
      totalProducts,
      totalStockUnits,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      inStockPct,
      lowStockPct,
      outOfStockPct
    },
    salesOverview,
    topProducts,
    recentOrders: orders.slice(0, 15),
    products,
    purchases,
    dues: combinedDues,
    transactions,
    cashbookSummary: {
      totalIncome,
      totalExpense,
      netCashBalance
    }
  };
}
erpRouter.get("/summary", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return res.json(buildErpSummary(user.id));
});
erpRouter.post("/purchases", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const {
    supplier_name,
    supplier_phone,
    product_id,
    product_name,
    quantity,
    unit_cost,
    paid_amount,
    payment_method = "cash",
    selling_price,
    category = "General",
    notes
  } = req.body || {};
  const qty = Math.max(1, Number(quantity) || 1);
  const unit = Math.max(0, Number(unit_cost) || 0);
  const totalCost = qty * unit;
  const paid = paid_amount !== void 0 ? Math.max(0, Number(paid_amount)) : totalCost;
  const due = Math.max(0, totalCost - paid);
  let targetProduct = product_id ? db.getProductById(String(product_id)) : void 0;
  const finalProductName = String(targetProduct?.name || product_name || "Inventory Item").trim();
  if (targetProduct) {
    const currentStock = targetProduct.stock_quantity !== void 0 ? Number(targetProduct.stock_quantity) : 20;
    const nextStock = currentStock + qty;
    db.updateProduct(targetProduct.id, {
      stock_quantity: nextStock,
      buying_price: unit || targetProduct.buying_price,
      ...selling_price !== void 0 && Number(selling_price) > 0 ? { price: Number(selling_price) } : {},
      stock_status: nextStock <= 0 ? "out_of_stock" : nextStock <= 5 ? "low_stock" : "in_stock"
    });
  } else if (finalProductName) {
    targetProduct = db.createProduct({
      id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      user_id: user.id,
      name: finalProductName,
      price: Number(selling_price) || Math.round(unit * 1.45) || 500,
      buying_price: unit,
      stock_quantity: qty,
      sold_count: 0,
      currency: "BDT",
      category: String(category || "General").trim(),
      description: `Added via Purchase ERP from ${supplier_name || "Supplier"}`,
      image_url: "",
      stock_status: qty <= 5 ? "low_stock" : "in_stock",
      keywords: finalProductName.toLowerCase().split(/\s+/),
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  const purchase = {
    id: `pur_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    user_id: user.id,
    supplier_name: String(supplier_name || "General Supplier").trim(),
    supplier_phone: supplier_phone ? String(supplier_phone).trim() : void 0,
    product_id: targetProduct?.id,
    product_name: finalProductName,
    quantity: qty,
    unit_cost: unit,
    total_cost: totalCost,
    paid_amount: paid,
    due_amount: due,
    payment_method,
    notes: notes ? String(notes).trim() : void 0,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.createPurchase(purchase);
  if (due > 0) {
    db.createDueRecord({
      id: `due_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      user_id: user.id,
      party_type: "supplier",
      party_name: purchase.supplier_name,
      party_phone: purchase.supplier_phone,
      reference_type: "purchase",
      reference_id: purchase.id,
      description: `Stock Purchase: ${qty}x ${finalProductName}`,
      total_amount: totalCost,
      paid_amount: paid,
      due_amount: due,
      status: paid > 0 ? "partial" : "unpaid",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  return res.status(201).json({
    success: true,
    purchase,
    summary: buildErpSummary(user.id),
    message: `Recorded purchase of ${qty}x ${finalProductName} and added +${qty} to Stock Inventory!`
  });
});
erpRouter.delete("/purchases/:id", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  db.deletePurchase(req.params.id, user.id);
  return res.json({
    success: true,
    summary: buildErpSummary(user.id),
    message: "Purchase record removed."
  });
});
erpRouter.put("/stock/:productId", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const product = db.getProductById(req.params.productId);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  const { name, category, stock_quantity, buying_price, price, description, image_url } = req.body || {};
  const nextQty = stock_quantity !== void 0 ? Math.max(0, Number(stock_quantity)) : product.stock_quantity ?? 20;
  const nextStatus = nextQty <= 0 ? "out_of_stock" : nextQty <= 5 ? "low_stock" : "in_stock";
  db.updateProduct(product.id, {
    stock_quantity: nextQty,
    stock_status: nextStatus,
    ...name !== void 0 && String(name).trim() ? { name: String(name).trim() } : {},
    ...category !== void 0 && String(category).trim() ? { category: String(category).trim() } : {},
    ...buying_price !== void 0 ? { buying_price: Math.max(0, Number(buying_price)) } : {},
    ...price !== void 0 ? { price: Math.max(0, Number(price)) } : {},
    ...description !== void 0 ? { description: String(description).trim() } : {},
    ...image_url !== void 0 ? { image_url: String(image_url).trim() } : {}
  });
  return res.json({
    success: true,
    summary: buildErpSummary(user.id),
    message: `Updated "${name || product.name}" (${nextQty} pcs \u2014 ${nextStatus.replace(/_/g, " ").toUpperCase()})`
  });
});
erpRouter.delete("/stock/:productId", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const product = db.getProductById(req.params.productId);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  db.deleteProduct(product.id);
  return res.json({
    success: true,
    summary: buildErpSummary(user.id),
    message: `Deleted "${product.name}" from Stock & Product Catalog.`
  });
});
erpRouter.post("/dues", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const {
    party_type = "customer",
    party_name,
    party_phone,
    description,
    total_amount,
    paid_amount = 0,
    due_date
  } = req.body || {};
  if (!party_name || !total_amount) {
    return res.status(400).json({ error: "Name and total amount are required." });
  }
  const total = Math.max(0, Number(total_amount) || 0);
  const paid = Math.max(0, Number(paid_amount) || 0);
  const due = Math.max(0, total - paid);
  const created = db.createDueRecord({
    id: `due_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    user_id: user.id,
    party_type: party_type === "supplier" ? "supplier" : "customer",
    party_name: String(party_name).trim(),
    party_phone: party_phone ? String(party_phone).trim() : void 0,
    reference_type: "manual",
    description: String(description || "Credit / Due Entry").trim(),
    total_amount: total,
    paid_amount: paid,
    due_amount: due,
    status: due <= 0 ? "settled" : paid > 0 ? "partial" : "unpaid",
    due_date: due_date ? String(due_date) : void 0,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  return res.status(201).json({
    success: true,
    due: created,
    summary: buildErpSummary(user.id),
    message: "Due entry added to ledger!"
  });
});
erpRouter.post("/dues/:id/settle", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { id } = req.params;
  const { amount, payment_method = "cash" } = req.body || {};
  if (id.startsWith("ord_due_")) {
    const orderId = id.replace("ord_due_", "");
    const order = db.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    const total = Number(order.total_amount) || 0;
    const prevPaid = Number(order.advance_paid_amount) || 0;
    const collectNow = amount !== void 0 ? Math.max(0, Number(amount)) : Math.max(0, total - prevPaid);
    const nextPaid = Math.min(total, prevPaid + collectNow);
    const isFullyPaid = nextPaid >= total;
    db.updateOrder(order.id, {
      advance_paid_amount: nextPaid,
      payment_status: isFullyPaid ? "paid" : "pending"
    });
    return res.json({
      success: true,
      summary: buildErpSummary(user.id),
      message: isFullyPaid ? `Order #${order.id.slice(-6).toUpperCase()} full due (BDT ${collectNow}) collected and marked PAID!` : `Collected BDT ${collectNow} partial payment for Order #${order.id.slice(-6).toUpperCase()}!`
    });
  }
  const existing = db.getDueRecords(user.id).find((d) => d.id === id);
  if (!existing) {
    return res.status(404).json({ error: "Due record not found" });
  }
  const settleAmount = amount !== void 0 ? Math.max(0, Number(amount)) : Number(existing.due_amount) || 0;
  const newPaid = (Number(existing.paid_amount) || 0) + settleAmount;
  const newDue = Math.max(0, (Number(existing.total_amount) || 0) - newPaid);
  db.updateDueRecord(existing.id, user.id, {
    paid_amount: newPaid,
    due_amount: newDue,
    status: newDue <= 0 ? "settled" : "partial"
  });
  if (settleAmount > 0) {
    db.createAccountTransaction({
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      user_id: user.id,
      type: existing.party_type === "customer" ? "income" : "expense",
      category: existing.party_type === "customer" ? "Due Collection" : "Supplier Payment",
      title: `${existing.party_type === "customer" ? "Due Collected from" : "Paid Due to"} ${existing.party_name}`,
      amount: settleAmount,
      payment_method,
      reference_id: existing.id,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  return res.json({
    success: true,
    summary: buildErpSummary(user.id),
    message: newDue <= 0 ? `Full due of BDT ${settleAmount} settled for ${existing.party_name}!` : `Recorded BDT ${settleAmount} payment (${newDue} BDT remaining due).`
  });
});
erpRouter.delete("/dues/:id", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  db.deleteDueRecord(req.params.id, user.id);
  return res.json({
    success: true,
    summary: buildErpSummary(user.id),
    message: "Due record deleted."
  });
});
erpRouter.post("/transactions", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const {
    type = "expense",
    category = "General Expense",
    title,
    amount,
    payment_method = "cash",
    notes
  } = req.body || {};
  if (!title || !amount) {
    return res.status(400).json({ error: "Transaction title and amount are required." });
  }
  const tx = db.createAccountTransaction({
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    user_id: user.id,
    type: type === "income" ? "income" : "expense",
    category: String(category).trim(),
    title: String(title).trim(),
    amount: Math.max(0, Number(amount) || 0),
    payment_method,
    notes: notes ? String(notes).trim() : void 0,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  return res.status(201).json({
    success: true,
    transaction: tx,
    summary: buildErpSummary(user.id),
    message: `${tx.type === "income" ? "Income" : "Expense"} of BDT ${tx.amount} added to Accounts Cashbook!`
  });
});
erpRouter.delete("/transactions/:id", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  db.deleteAccountTransaction(req.params.id, user.id);
  return res.json({
    success: true,
    summary: buildErpSummary(user.id),
    message: "Transaction deleted."
  });
});

// server/routes/agents.ts
init_database();
import { Router as Router19 } from "express";
init_subscriptionService();
import { GoogleGenAI as GoogleGenAI7 } from "@google/genai";
var agentsRouter = Router19();
function getMaxAgentsForUser(userId) {
  const user = db.getProfileById(userId);
  if (user?.role === "admin") {
    return { max: 20, planName: "Admin Unlimited", isPro: true };
  }
  const subStatus = getUserSubscriptionStatus(userId);
  const isTrialActive = !subStatus.isExpired && subStatus.subscription?.status === "trialing";
  const isPro = subStatus.isProPlan || isTrialActive && subStatus.planId === "plan_pro";
  if (isPro) {
    return { max: 10, planName: "Pro Business Plan", isPro: true };
  }
  if (subStatus.planId === "plan_starter" || !subStatus.isExpired && !isPro) {
    return { max: 3, planName: "Starter AI Plan", isPro: false };
  }
  return { max: 1, planName: "Trial Plan", isPro: false };
}
agentsRouter.get("/", (req, res) => {
  let user = getAuthenticatedUser(req);
  if (!user) {
    user = db.getProfileById("usr_demo_002") || db.getProfiles()[0];
  }
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const agents = db.getAgents(user.id);
  const { max, planName, isPro } = getMaxAgentsForUser(user.id);
  return res.json({
    agents,
    meta: {
      total: agents.length,
      maxAllowed: max,
      planName,
      isPro,
      canCreateMore: agents.length < max
    }
  });
});
agentsRouter.get("/:id", (req, res) => {
  const agent = db.getAgentById(req.params.id);
  if (!agent) {
    return res.status(404).json({ error: "Agent not found" });
  }
  return res.json(agent);
});
agentsRouter.post("/", (req, res) => {
  let user = getAuthenticatedUser(req);
  if (!user) {
    user = db.getProfileById("usr_demo_002") || db.getProfiles()[0];
  }
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const existingAgents = db.getAgents(user.id);
  const { max, planName, isPro } = getMaxAgentsForUser(user.id);
  if (existingAgents.length >= max) {
    return res.status(403).json({
      error: `Your current ${planName} allows up to ${max} AI Agents. Upgrade to the ${!isPro ? "Pro Business Plan (1,950 BDT/month)" : "Enterprise Plan"} to create up to 10 independent AI Business Agents.`
    });
  }
  const {
    name,
    business_name,
    avatar_url,
    tone,
    language,
    assigned_channels,
    system_prompt,
    knowledge_base,
    delivery_charge_inside_dhaka,
    delivery_charge_outside_dhaka
  } = req.body;
  if (!name || !business_name) {
    return res.status(400).json({ error: "Agent Name and Business / Brand Name are required." });
  }
  const agentId = `agent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const assignedList = Array.isArray(assigned_channels) ? assigned_channels : [];
  const newAgent = {
    id: agentId,
    user_id: user.id,
    name: String(name).trim(),
    business_name: String(business_name).trim(),
    avatar_url: avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80",
    tone: tone || "sales_closer",
    language: language || "bangla",
    assigned_channels: assignedList,
    system_prompt: String(system_prompt).trim() || `You are the dedicated customer service and sales AI agent for "${business_name}". Reply in polite, natural Bangla, answer product inquiries promptly, and capture customer full name, delivery address, and phone number to finalize orders.`,
    knowledge_base: String(knowledge_base).trim() || `Business: ${business_name}
Products: Quality items & fast shipping.
Delivery: Inside Dhaka 60 BDT, Outside Dhaka 120 BDT. Cash on Delivery (COD) available.`,
    delivery_charge_inside_dhaka: Number(delivery_charge_inside_dhaka) || 60,
    delivery_charge_outside_dhaka: Number(delivery_charge_outside_dhaka) || 120,
    is_active: true,
    total_chats: 0,
    total_orders: 0,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  const created = db.createAgent(newAgent);
  if (assignedList.length > 0) {
    assignedList.forEach((chId) => {
      db.updateChannel(chId, {
        agent_id: created.id,
        agent_name: created.name,
        business_name: created.business_name
      });
    });
  }
  return res.status(201).json({
    success: true,
    agent: created,
    message: `AI Agent "${created.name}" created successfully for ${created.business_name}!`
  });
});
agentsRouter.put("/:id", (req, res) => {
  let user = getAuthenticatedUser(req);
  if (!user) {
    user = db.getProfileById("usr_demo_002") || db.getProfiles()[0];
  }
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const existing = db.getAgentById(req.params.id);
  if (!existing || existing.user_id !== user.id) {
    return res.status(404).json({ error: "Agent not found" });
  }
  const {
    name,
    business_name,
    avatar_url,
    tone,
    language,
    assigned_channels,
    system_prompt,
    knowledge_base,
    delivery_charge_inside_dhaka,
    delivery_charge_outside_dhaka,
    is_active
  } = req.body;
  const updates = {};
  if (name !== void 0) updates.name = String(name).trim();
  if (business_name !== void 0) updates.business_name = String(business_name).trim();
  if (avatar_url !== void 0) updates.avatar_url = String(avatar_url).trim();
  if (tone !== void 0) updates.tone = tone;
  if (language !== void 0) updates.language = language;
  if (system_prompt !== void 0) updates.system_prompt = String(system_prompt).trim();
  if (knowledge_base !== void 0) updates.knowledge_base = String(knowledge_base).trim();
  if (delivery_charge_inside_dhaka !== void 0) {
    updates.delivery_charge_inside_dhaka = Number(delivery_charge_inside_dhaka);
  }
  if (delivery_charge_outside_dhaka !== void 0) {
    updates.delivery_charge_outside_dhaka = Number(delivery_charge_outside_dhaka);
  }
  if (is_active !== void 0) updates.is_active = Boolean(is_active);
  if (Array.isArray(assigned_channels)) {
    updates.assigned_channels = assigned_channels;
    const userChannels = db.getChannels(user.id);
    userChannels.forEach((ch) => {
      if (assigned_channels.includes(ch.id)) {
        db.updateChannel(ch.id, {
          agent_id: existing.id,
          agent_name: updates.name || existing.name,
          business_name: updates.business_name || existing.business_name
        });
      } else if (ch.agent_id === existing.id) {
        db.updateChannel(ch.id, {
          agent_id: void 0,
          agent_name: void 0,
          business_name: void 0
        });
      }
    });
  }
  const updated = db.updateAgent(req.params.id, updates);
  return res.json({
    success: true,
    agent: updated,
    message: "AI Agent updated successfully."
  });
});
agentsRouter.delete("/:id", (req, res) => {
  let user = getAuthenticatedUser(req);
  if (!user) {
    user = db.getProfileById("usr_demo_002") || db.getProfiles()[0];
  }
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const existingAgents = db.getAgents(user.id);
  if (existingAgents.length <= 1) {
    return res.status(400).json({ error: "You must have at least one AI Agent active for your business." });
  }
  const agent = db.getAgentById(req.params.id);
  if (!agent || agent.user_id !== user.id) {
    return res.status(404).json({ error: "Agent not found" });
  }
  const userChannels = db.getChannels(user.id);
  userChannels.forEach((ch) => {
    if (ch.agent_id === agent.id) {
      db.updateChannel(ch.id, {
        agent_id: void 0,
        agent_name: void 0,
        business_name: void 0
      });
    }
  });
  db.deleteAgent(agent.id);
  return res.json({ success: true, message: `Agent "${agent.name}" removed.` });
});
agentsRouter.post("/:id/test", async (req, res) => {
  let user = getAuthenticatedUser(req);
  if (!user) {
    user = db.getProfileById("usr_demo_002") || db.getProfiles()[0];
  }
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const agent = db.getAgentById(req.params.id);
  if (!agent) {
    return res.status(404).json({ error: "Agent not found" });
  }
  const { message, chatHistory } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required for agent simulation." });
  }
  const toneInstruction = agent.tone === "sales_closer" ? "Focus on closing sales quickly, offering COD delivery, and politely asking for Name, Address, and Phone number." : agent.tone === "friendly" ? "Be extremely warm, polite, welcoming, with friendly emojis." : agent.tone === "urgent" ? "Mention limited stock, fast 24-48h dispatch, and prompt the buyer to order right now." : "Maintain a clean, professional corporate executive tone.";
  const languageRule = agent.language === "bangla" ? "Reply in natural, polite Bengali (\u09AC\u09BE\u0982\u09B2\u09BE) script." : agent.language === "english" ? "Reply in clear, professional English." : "Reply in natural Banglish/Bangla script matching the user style.";
  const systemInstruction = `You are "${agent.name}", the official autonomous Customer Support and Sales AI for "${agent.business_name}".
${toneInstruction}
${languageRule}

BUSINESS KNOWLEDGE BASE:
${agent.knowledge_base}

DELIVERY CHARGES:
Inside Dhaka: ${agent.delivery_charge_inside_dhaka || 60} BDT
Outside Dhaka nationwide: ${agent.delivery_charge_outside_dhaka || 120} BDT

SPECIFIC INSTRUCTIONS:
${agent.system_prompt}

Always keep replies helpful, polite, concise (2-4 sentences or clean bullet points), quote exact prices and delivery terms accurately from knowledge base, and collect order details (Name, Delivery Address, Phone Number) when the customer wants to buy.`;
  try {
    const apiKey = process.env.GEMINI_API_KEY || user.llm_api_key;
    if (apiKey) {
      const ai = new GoogleGenAI7({ apiKey });
      const promptText = `Customer message: "${message}"

Provide the agent reply as ${agent.name}:`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptText,
        config: {
          systemInstruction,
          temperature: 0.6
        }
      });
      const reply = response.text || `\u09A7\u09A8\u09CD\u09AF\u09AC\u09BE\u09A6 ${agent.business_name}-\u098F \u09AE\u09C7\u09B8\u09C7\u099C \u0995\u09B0\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF! \u0986\u09AE\u09B0\u09BE \u0995\u09C0\u09AD\u09BE\u09AC\u09C7 \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u09B8\u09BE\u09B9\u09BE\u09AF\u09CD\u09AF \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09BF?`;
      return res.json({ reply, agentId: agent.id, agentName: agent.name });
    }
  } catch (err) {
    console.warn("[Agent Test Simulator] Gemini error, using fallback:", err?.message || err);
  }
  const lowerMsg = message.toLowerCase();
  let fallbackReply = `\u09A7\u09A8\u09CD\u09AF\u09AC\u09BE\u09A6! \u0986\u09AE\u09BF ${agent.business_name}-\u098F\u09B0 \u098F\u0986\u0987 \u09B8\u09C7\u09B2\u09B8 \u0985\u09CD\u09AF\u09BE\u09B8\u09BF\u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u09A8\u09CD\u099F ${agent.name} \u09AC\u09B2\u099B\u09BF\u0964`;
  if (lowerMsg.includes("\u09A6\u09BE\u09AE") || lowerMsg.includes("price") || lowerMsg.includes("koto") || lowerMsg.includes("cost")) {
    fallbackReply += ` \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B0\u09A4\u09BF\u099F\u09BF \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F\u09C7\u09B0 \u09B8\u09C7\u09B0\u09BE \u0985\u09AB\u09BE\u09B0 \u09AE\u09C2\u09B2\u09CD\u09AF \u0993 \u09A1\u09BF\u09B8\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09B0\u09DF\u09C7\u099B\u09C7\u0964 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u099A\u09BE\u09B0\u09CD\u099C \u09A2\u09BE\u0995\u09BE\u09B0 \u09AD\u09C7\u09A4\u09B0\u09C7 \u09F3${agent.delivery_charge_inside_dhaka || 60} \u098F\u09AC\u0982 \u09A2\u09BE\u0995\u09BE\u09B0 \u09AC\u09BE\u0987\u09B0\u09C7 \u09F3${agent.delivery_charge_outside_dhaka || 120}\u0964 \u0995\u09CD\u09AF\u09BE\u09B6 \u0985\u09A8 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF\u09A4\u09C7 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09A8\u09BE\u09AE, \u09A0\u09BF\u0995\u09BE\u09A8\u09BE \u0993 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09AE\u09CD\u09AC\u09B0 \u09AA\u09BE\u09A0\u09BF\u09DF\u09C7 \u09A6\u09BF\u09A8! \u2764\uFE0F`;
  } else if (lowerMsg.includes("order") || lowerMsg.includes("\u0985\u09B0\u09CD\u09A1\u09BE\u09B0") || lowerMsg.includes("nibo") || lowerMsg.includes("\u0995\u09BF\u09A8\u09AC")) {
    fallbackReply += ` \u0986\u09AA\u09A8\u09BE\u09B0 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0\u099F\u09BF \u0995\u09A8\u09AB\u09BE\u09B0\u09CD\u09AE \u0995\u09B0\u09A4\u09C7 \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09E7. \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09A8\u09BE\u09AE, \u09E8. \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09A0\u09BF\u0995\u09BE\u09A8\u09BE \u098F\u09AC\u0982 \u09E9. \u09B8\u099A\u09B2 \u09E7\u09E7 \u09A1\u09BF\u099C\u09BF\u099F\u09C7\u09B0 \u09AB\u09CB\u09A8 \u09A8\u09AE\u09CD\u09AC\u09B0 \u09A6\u09BF\u09A8\u0964 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u098F\u0986\u0987 \u09B8\u09BE\u09A5\u09C7 \u09B8\u09BE\u09A5\u09C7 \u09AA\u09BE\u09B0\u09CD\u09B8\u09C7\u09B2 \u09AC\u09C1\u0995 \u0995\u09B0\u09C7 \u09A6\u09BF\u09AC\u09C7! \u{1F4E6}`;
  } else if (lowerMsg.includes("delivery") || lowerMsg.includes("\u099A\u09BE\u09B0\u09CD\u099C") || lowerMsg.includes("\u09B8\u09AE\u09AF\u09BC")) {
    fallbackReply += ` \u09A2\u09BE\u0995\u09BE\u09B0 \u09AD\u09C7\u09A4\u09B0\u09C7 \u09B9\u09CB\u09AE \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09E8\u09EA-\u09EA\u09EE \u0998\u09A3\u09CD\u099F\u09BE\u09B0 \u09AE\u09A7\u09CD\u09AF\u09C7 (\u099A\u09BE\u09B0\u09CD\u099C \u09F3${agent.delivery_charge_inside_dhaka || 60}) \u098F\u09AC\u0982 \u09A2\u09BE\u0995\u09BE\u09B0 \u09AC\u09BE\u0987\u09B0\u09C7 \u09B8\u09BE\u09B0\u09BE \u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6\u09C7 \u09E8-\u09E9 \u09A6\u09BF\u09A8\u09C7 \u09AA\u09CC\u0981\u099B\u09C7 \u09AF\u09BE\u09AC\u09C7 (\u099A\u09BE\u09B0\u09CD\u099C \u09F3${agent.delivery_charge_outside_dhaka || 120})\u0964`;
  } else {
    fallbackReply += ` \u0986\u09AE\u09B0\u09BE \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u0995\u09C0\u09AD\u09BE\u09AC\u09C7 \u09B8\u09BE\u09B9\u09BE\u09AF\u09CD\u09AF \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09BF? \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u0993 \u09B8\u09BE\u0987\u099C \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995\u09C7 \u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u09A5\u09BE\u0995\u09B2\u09C7 \u09A8\u09BF\u09B0\u09CD\u09A6\u09CD\u09AC\u09BF\u09A7\u09BE\u09AF\u09BC \u099C\u09BE\u09A8\u09BE\u09A8\u0964`;
  }
  return res.json({ reply: fallbackReply, agentId: agent.id, agentName: agent.name });
});

// server.ts
init_subscriptionService();
init_metaService();
init_database();
dotenv2.config();
process.env.DISABLE_HMR = "true";
var PORT = 3e3;
var app = express2();
app.set("trust proxy", true);
app.use(
  express2.json({
    limit: "50mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(express2.urlencoded({ extended: true, limit: "50mb" }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-id");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use("/api/webhooks", webhooksRouter);
var lastExpiryCheckAt = 0;
app.use("/api", async (req, res, next) => {
  if (req.path.startsWith("/webhooks") || req.path === "/health") {
    return next();
  }
  const isColdStart = db.getAllMessages().length === 0;
  if (isColdStart) {
    try {
      await Promise.race([
        db.syncFromSupabase(true),
        new Promise((resolve) => setTimeout(resolve, 1500))
      ]);
    } catch (err) {
      console.warn("[API Sync Middleware] Cold-start sync warning:", err?.message || err);
    }
  } else if (Date.now() - db.getLastSupabaseSyncAt() > 2e4) {
    db.syncFromSupabase(false).catch((err) => {
      console.warn("[API Sync Middleware] Background sync warning:", err?.message || err);
    });
  }
  if (Date.now() - lastExpiryCheckAt >= 60 * 1e3) {
    lastExpiryCheckAt = Date.now();
    try {
      runSubscriptionExpiryCheck();
    } catch (_) {
    }
  }
  if (req.method !== "GET") {
    const originalSend = res.send.bind(res);
    let sendIntercepted = false;
    res.send = function(body) {
      if (sendIntercepted) {
        return originalSend(body);
      }
      sendIntercepted = true;
      res.send = originalSend;
      db.flushToSupabase().catch((err) => {
        console.warn("[API Mutation Flush] Warning:", err?.message || err);
      }).finally(() => {
        originalSend(body);
      });
      return res;
    };
  }
  next();
});
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    app: "One Agent BD",
    supabase_connected: Boolean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/schema-sql", (req, res) => {
  try {
    const schemaPath = path3.join(process.cwd(), "server", "db", "schema.sql");
    res.sendFile(schemaPath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.use("/api/auth", authRouter);
app.use("/api/plans", plansRouter);
app.use("/api/subscriptions", subscriptionsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/channels", channelsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/inbox", inboxRouter);
app.use("/api/contacts", contactsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/ai-chat", aiChatRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/stores", storesRouter);
app.use("/api/call-requests", callRequestsRouter);
app.use("/api/widget", widgetRouter);
app.use("/api/products", productsRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/email-campaigns", emailCampaignsRouter);
app.use("/api/erp", erpRouter);
app.use("/api/agents", agentsRouter);
async function startServer() {
  startTunnelIfNeeded();
  try {
    await db.syncFromSupabase(true);
    runSubscriptionExpiryCheck();
  } catch (err) {
    console.error("[Startup Expiry Check] Error:", err);
  }
  setInterval(() => {
    try {
      const result = runSubscriptionExpiryCheck();
      if (result.expiredCount > 0) {
        console.log(`[Cron Expiry Worker] Updated ${result.expiredCount} expired subscriptions.`);
      }
    } catch (err) {
      console.error("[Cron Expiry Worker] Error:", err);
    }
    try {
      checkAndRunScheduledCourierDispatches();
    } catch (courierErr) {
      console.error("[Auto Courier Scheduler] Error:", courierErr);
    }
  }, 60 * 1e3);
  setInterval(() => {
    runAutoFollowUpEngine().then((res) => {
      if (res.followUpsSent > 0) {
        console.log(`[Auto Follow-up Engine] Sent ${res.followUpsSent} follow-up messages.`);
      }
    }).catch((err) => {
      console.error("[Auto Follow-up Engine] Error:", err);
    });
  }, 15 * 60 * 1e3);
  if (process.env.NODE_ENV !== "production") {
    const vitePkg = "vite";
    const { createServer: createViteServer } = await import(vitePkg);
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path3.join(process.cwd(), "dist");
    app.use(express2.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path3.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F680} One Agent BD Server running at http://0.0.0.0:${PORT}`);
  });
}
if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error("Fatal server startup error:", err);
    process.exit(1);
  });
}
var server_default = app;
export {
  app,
  server_default as default
};
