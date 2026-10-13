import {
  UserProfile,
  Plan,
  SubscriptionStatusInfo,
  Payment,
  Coupon,
  Channel,
  Conversation,
  ConversationSummaryResult,
  Message,
  ContactLead,
  AdminMetrics,
  SystemSettings,
  Order,
  OrderMetrics,
  OrderConfirmationSettings,
  AutoCourierDispatchSettings,
  StoreIntegration,
  CallRequest,
  Product
} from './types';

// Read or store active user ID
let currentUserId = localStorage.getItem('replay_user_id') || '';

export function getActiveUserId(): string {
  return currentUserId;
}

export function setActiveUserId(id: string): void {
  currentUserId = id;
  if (id) {
    localStorage.setItem('replay_user_id', id);
  } else {
    localStorage.removeItem('replay_user_id');
  }
}

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  if (currentUserId) {
    headers.set('x-user-id', currentUserId);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text || `HTTP ${response.status} ${response.statusText}` };
  }

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || (typeof data === 'string' ? data : `Request failed (${response.status})`);
    throw new Error(errorMsg);
  }
  return data as T;
}

export const api = {
  // Auth
  async signup(data: { email: string; password?: string; fullName?: string; phone: string; role?: string }) {
    const res = await fetchJson<{ user: UserProfile; subscriptionStatus: SubscriptionStatusInfo; message: string }>(
      '/api/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
    if (res.user?.id) {
      setActiveUserId(res.user.id);
    }
    return res;
  },

  async login(email: string, password?: string, isAdminLogin?: boolean) {
    const res = await fetchJson<{ user: UserProfile; subscriptionStatus: SubscriptionStatusInfo; message: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password, isAdminLogin })
      }
    );
    if (res.user?.id) {
      setActiveUserId(res.user.id);
    }
    return res;
  },

  async requestPasswordRecovery(data: { email: string }) {
    return fetchJson<{
      success: boolean;
      recoveryCode: string;
      email: string;
      message: string;
    }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async verifyRecoveryCode(data: { email: string; recoveryCode: string }) {
    return fetchJson<{
      success: boolean;
      email: string;
      message: string;
    }>('/api/auth/verify-recovery-code', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async resetPassword(data: {
    email: string;
    recoveryCode: string;
    newPassword: string;
  }) {
    const res = await fetchJson<{
      success: boolean;
      user: UserProfile;
      subscriptionStatus: SubscriptionStatusInfo;
      message: string;
    }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (res.user?.id) {
      setActiveUserId(res.user.id);
    }
    return res;
  },

  async updateAdminCredentials(newEmail?: string, newPassword?: string) {
    return fetchJson<{ success: boolean; message: string; user?: UserProfile }>(
      '/api/admin/security/credentials',
      {
        method: 'POST',
        body: JSON.stringify({ newEmail, newPassword })
      }
    );
  },

  async getMe() {
    return fetchJson<{ user: UserProfile; subscriptionStatus: SubscriptionStatusInfo }>('/api/auth/me');
  },

  async switchDemo(targetRole: 'admin' | 'user') {
    const res = await fetchJson<{ user: UserProfile; subscriptionStatus: SubscriptionStatusInfo; message: string }>(
      '/api/auth/switch-demo',
      {
        method: 'POST',
        body: JSON.stringify({ targetRole })
      }
    );
    if (res.user?.id) {
      setActiveUserId(res.user.id);
    }
    return res;
  },

  logout(): void {
    setActiveUserId('');
  },

  // Plans
  async getPlans(all = false): Promise<Plan[]> {
    return fetchJson<Plan[]>(`/api/plans${all ? '?all=true' : ''}`);
  },

  async createPlan(plan: Partial<Plan>): Promise<Plan> {
    return fetchJson<Plan>('/api/plans', {
      method: 'POST',
      body: JSON.stringify(plan)
    });
  },

  async updatePlan(id: string, plan: Partial<Plan>): Promise<Plan> {
    return fetchJson<Plan>(`/api/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(plan)
    });
  },

  async deletePlan(id: string): Promise<{ success: boolean; message: string }> {
    return fetchJson<{ success: boolean; message: string }>(`/api/plans/${id}`, {
      method: 'DELETE'
    });
  },

  // Subscriptions
  async getCurrentSubscription(): Promise<SubscriptionStatusInfo> {
    return fetchJson<SubscriptionStatusInfo>('/api/subscriptions/current');
  },

  async startFreeTrial(planId: string): Promise<{ status: SubscriptionStatusInfo; message: string }> {
    return fetchJson('/api/subscriptions/start-trial', {
      method: 'POST',
      body: JSON.stringify({ planId })
    });
  },

  async switchPlan(planId: 'plan_starter' | 'plan_pro' | 'trial'): Promise<{ status: SubscriptionStatusInfo; message: string }> {
    return fetchJson('/api/subscriptions/switch-plan', {
      method: 'POST',
      body: JSON.stringify({ planId })
    });
  },

  async getUpgradeQuote(targetPlanId: string = 'plan_pro'): Promise<{
    canUpgrade: boolean;
    currentPlanId: string;
    currentPlanName: string;
    targetPlanId: string;
    targetPlanName: string;
    daysRemaining: number;
    currentPlanPrice: number;
    targetPlanPrice: number;
    flatDifference: number;
    proratedDifference: number;
    unusedStarterCredit: number;
    renewWithCreditPrice: number;
    upgradeEndDate: string;
  }> {
    return fetchJson(`/api/subscriptions/upgrade-quote?targetPlanId=${encodeURIComponent(targetPlanId)}`);
  },

  // Payments & Coupons
  async applyCoupon(
    code: string,
    amount: number,
    planId?: string
  ): Promise<{
    valid: boolean;
    coupon: {
      id: string;
      code: string;
      discount_type: 'percentage' | 'fixed';
      discount_value: number;
    };
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
    message: string;
  }> {
    return fetchJson('/api/payments/apply-coupon', {
      method: 'POST',
      body: JSON.stringify({ code, amount, planId })
    });
  },

  async createGatewayCheckout(
    planId: string,
    options?: {
      customAmount?: number;
      durationDays?: number;
      durationLabel?: string;
    }
  ): Promise<{
    success: boolean;
    paymentUrl: string;
    orderId: string;
    tmpId?: string;
    recipientNumber?: string;
    methods?: Array<{
      id: 'bkash' | 'nagad' | 'rocket' | 'upay' | 'bank' | string;
      name: string;
      logoUrl?: string;
      recipientNumber: string;
      dialCode: string;
      type?: 'mobile' | 'bank';
    }>;
    amount: number;
    planName: string;
  }> {
    return fetchJson('/api/payments/gateway-create', {
      method: 'POST',
      body: JSON.stringify({
        planId,
        customAmount: options?.customAmount,
        durationDays: options?.durationDays,
        durationLabel: options?.durationLabel
      })
    });
  },

  async verifyGatewayPayment(
    transactionReference: string,
    planId?: string,
    options?: {
      method?: 'bkash' | 'nagad' | 'rocket' | 'upay' | 'bank' | string;
      orderId?: string;
      tmpId?: string;
      customAmount?: number;
      durationDays?: number;
      durationLabel?: string;
      couponCode?: string;
      discountAmount?: number;
    }
  ): Promise<{
    success: boolean;
    verified: boolean;
    payment: Payment;
    message: string;
  }> {
    return fetchJson('/api/payments/gateway-verify', {
      method: 'POST',
      body: JSON.stringify({
        transactionReference,
        planId,
        method: options?.method || 'bkash',
        orderId: options?.orderId,
        tmpId: options?.tmpId,
        customAmount: options?.customAmount,
        durationDays: options?.durationDays,
        durationLabel: options?.durationLabel,
        couponCode: options?.couponCode,
        discountAmount: options?.discountAmount
      })
    });
  },

  async submitPayment(data: {
    planId?: string;
    plan_id?: string;
    amount: number;
    method?: string;
    payment_method?: string;
    transactionReference?: string;
    transaction_id?: string;
    senderNumber?: string;
    sender_number?: string;
  }): Promise<{ payment: Payment; message: string }> {
    const payload = {
      planId: data.planId || data.plan_id || '',
      amount: data.amount,
      method: data.method || data.payment_method || 'bkash',
      transactionReference: data.transactionReference || data.transaction_id || '',
      senderNumber: data.senderNumber || data.sender_number
    };
    return fetchJson<{ payment: Payment; message: string }>('/api/payments', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getMyPayments(): Promise<Payment[]> {
    return fetchJson<Payment[]>('/api/payments/my');
  },

  async getAllPayments(): Promise<Payment[]> {
    return fetchJson<Payment[]>('/api/payments/all');
  },

  async approvePayment(id: string): Promise<{ payment: Payment; message: string }> {
    return fetchJson<{ payment: Payment; message: string }>(`/api/payments/${id}/approve`, {
      method: 'POST'
    });
  },

  async rejectPayment(id: string, notes?: string): Promise<{ payment: Payment; message: string }> {
    return fetchJson<{ payment: Payment; message: string }>(`/api/payments/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ notes })
    });
  },

  async autoVerifyPayment(data: {
    transactionReference: string;
    amount: number;
    method: string;
    senderNumber?: string;
    rawSmsText?: string;
  }) {
    return fetchJson<{ success: boolean; payment?: Payment; error?: string }>('/api/payments/auto-verify', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Channels
  async getChannels(): Promise<Channel[]> {
    return fetchJson<Channel[]>('/api/channels');
  },

  async getPublicUrl(): Promise<{ publicUrl: string | null }> {
    return fetchJson<{ publicUrl: string | null }>('/api/channels/public-url');
  },

  async addChannel(channel: {
    platform: 'whatsapp' | 'messenger' | 'instagram';
    name: string;
    identifier: string;
    access_token: string;
    app_secret?: string;
  }): Promise<Channel & { updatedExisting?: boolean; message?: string }> {
    return fetchJson<Channel & { updatedExisting?: boolean; message?: string }>('/api/channels', {
      method: 'POST',
      body: JSON.stringify(channel)
    });
  },

  async updateChannel(id: string, updates: {
    name?: string;
    identifier?: string;
    access_token?: string;
    app_secret?: string;
    is_active?: boolean;
  }): Promise<Channel> {
    return fetchJson<Channel>(`/api/channels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async toggleChannel(id: string): Promise<Channel> {
    return fetchJson<Channel>(`/api/channels/${id}/toggle`, {
      method: 'PATCH'
    });
  },

  async updateChannelAutomation(
    id: string,
    updates: { auto_comment_reply?: boolean; auto_followup_enabled?: boolean }
  ): Promise<Channel> {
    return fetchJson<Channel>(`/api/channels/${id}/automation`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  async runAutoFollowUps(): Promise<{
    success: boolean;
    checkedConversations: number;
    followUpsSent: number;
    details: Array<{ customerName: string; platform: string; followUpText: string }>;
  }> {
    return fetchJson('/api/channels/run-followups', {
      method: 'POST'
    });
  },

  async getAutomationSettings(): Promise<any> {
    return fetchJson('/api/channels/automation-settings');
  },

  async updateAutomationSettings(data: any): Promise<{
    success: boolean;
    settings: any;
  }> {
    return fetchJson('/api/channels/automation-settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async testCommentAutoReply(data?: {
    platform?: 'messenger' | 'instagram';
    customerName?: string;
    commentText?: string;
  }): Promise<{
    success: boolean;
    handled: boolean;
    reason?: string;
    publicReply?: string;
    privateInboxReply?: string;
  }> {
    return fetchJson('/api/channels/test-comment-reply', {
      method: 'POST',
      body: JSON.stringify(data || {})
    });
  },

  async deleteChannel(id: string): Promise<{ success: boolean; message: string }> {
    return fetchJson<{ success: boolean; message: string }>(`/api/channels/${id}`, {
      method: 'DELETE'
    });
  },

  // Meta Auto Connect & OAuth
  async getMetaConfig(): Promise<{
    configured: boolean;
    appId?: string;
    redirectUri?: string;
    configId?: string;
    webhookUrlWhatsApp?: string;
    webhookUrlMessenger?: string;
    webhookUrlInstagram?: string;
  }> {
    return fetchJson('/api/channels/meta/config');
  },

  async updateMetaConfig(data: { appId: string; appSecret: string; configId?: string }): Promise<{
    success: boolean;
    config: { configured: boolean; appId?: string; configId?: string; redirectUri?: string };
  }> {
    return fetchJson('/api/channels/meta/config', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getMetaAuthUrl(
    platform: 'messenger' | 'instagram' | 'whatsapp',
    onboarding: boolean = false
  ): Promise<{ isConfigured?: boolean; configured?: boolean; authUrl?: string; state?: string; message?: string }> {
    return fetchJson(`/api/channels/meta/auth-url?platform=${platform}${onboarding ? '&onboarding=true' : ''}`);
  },

  async exchangeMetaToken(
    accessToken: string,
    platform: 'messenger' | 'instagram' | 'whatsapp' = 'messenger'
  ): Promise<{
    success: boolean;
    platform: 'messenger' | 'instagram' | 'whatsapp';
    pages: Array<{
      id: string;
      name: string;
      category?: string;
      picture_url?: string;
      has_token?: boolean;
      token_preview?: string;
      instagram_business_account?: { id: string; username?: string; name?: string; profile_picture_url?: string };
    }>;
    whatsappNumbers?: Array<{
      id: string;
      waba_id: string;
      waba_name: string;
      display_phone_number: string;
      verified_name?: string;
      quality_rating?: string;
      has_token?: boolean;
      token_preview?: string;
    }>;
  }> {
    return fetchJson('/api/channels/meta/exchange-token', {
      method: 'POST',
      body: JSON.stringify({ accessToken, platform })
    });
  },

  async captureMetaSdkTokens(
    accessToken: string,
    options?: {
      platform?: 'messenger' | 'instagram' | 'whatsapp';
      autoConnectChannels?: boolean;
      grantedScopes?: string[];
    }
  ): Promise<{
    success: boolean;
    pages: Array<{
      id: string;
      name: string;
      category?: string;
      picture_url?: string;
      has_token?: boolean;
      token_preview?: string;
      instagram_business_account?: { id: string; username?: string; name?: string; profile_picture_url?: string };
    }>;
    whatsappNumbers: Array<{
      id: string;
      waba_id: string;
      waba_name: string;
      display_phone_number: string;
      verified_name?: string;
      quality_rating?: string;
      has_token?: boolean;
      token_preview?: string;
    }>;
    connectedChannels: Channel[];
    verificationReport?: {
      success: boolean;
      verified: boolean;
      checkedAt: string;
      totalChecked: number;
      healthyCount: number;
      failedCount: number;
      results: Array<{
        channelId?: string;
        assetId: string;
        name: string;
        platform: 'messenger' | 'instagram' | 'whatsapp';
        valid: boolean;
        graphId?: string;
        graphName?: string;
        category?: string;
        webhookSubscribed?: boolean;
        permissions?: string[];
        tokenPreview?: string;
        error?: string;
        latencyMs: number;
        verifiedAt: string;
      }>;
    };
  }> {
    return fetchJson('/api/channels/meta/sdk-capture', {
      method: 'POST',
      body: JSON.stringify({
        accessToken,
        platform: options?.platform || 'messenger',
        autoConnectChannels: options?.autoConnectChannels !== false,
        grantedScopes: options?.grantedScopes
      })
    });
  },

  async verifyMetaTokens(channelId?: string): Promise<{
    success: boolean;
    verified: boolean;
    checkedAt: string;
    totalChecked: number;
    healthyCount: number;
    failedCount: number;
    results: Array<{
      channelId?: string;
      assetId: string;
      name: string;
      platform: 'messenger' | 'instagram' | 'whatsapp';
      valid: boolean;
      graphId?: string;
      graphName?: string;
      category?: string;
      webhookSubscribed?: boolean;
      permissions?: string[];
      tokenPreview?: string;
      error?: string;
      latencyMs: number;
      verifiedAt: string;
    }>;
  }> {
    return fetchJson('/api/channels/meta/verify-tokens', {
      method: 'POST',
      body: JSON.stringify(channelId ? { channelId } : {})
    });
  },

  async getStoredMetaTokens(): Promise<{
    hasProfileToken: boolean;
    tokensUpdatedAt: string | null;
    grantedScopes: string[];
    facebookPages: Array<{
      id: string;
      name: string;
      category?: string;
      status: string;
      is_webhook_subscribed: boolean;
      has_token: boolean;
      token_preview?: string;
      updated_at: string;
    }>;
    instagramAccounts: Array<{
      id: string;
      username: string;
      name?: string;
      page_id?: string;
      status: string;
      has_token: boolean;
      token_preview?: string;
      updated_at: string;
    }>;
  }> {
    return fetchJson('/api/channels/meta/stored-tokens');
  },

  async getMetaPendingAssets(): Promise<{
    available: boolean;
    platform?: string;
    pages: Array<{
      id: string;
      name: string;
      category?: string;
      picture_url?: string;
      has_token?: boolean;
      token_preview?: string;
      instagram_business_account?: { id: string; username?: string; name?: string; profile_picture_url?: string };
    }>;
    whatsappNumbers?: Array<{
      id: string;
      waba_id: string;
      waba_name: string;
      display_phone_number: string;
      verified_name?: string;
      quality_rating?: string;
      has_token?: boolean;
      token_preview?: string;
    }>;
  }> {
    return fetchJson('/api/channels/meta/pending-assets');
  },

  async selectMetaPage(pageId: string, pageName: string, category?: string): Promise<{ success: boolean; channel: Channel }> {
    return fetchJson('/api/channels/meta/select-page', {
      method: 'POST',
      body: JSON.stringify({ pageId, pageName, category })
    });
  },

  async selectMetaInstagram(igAccountId: string, username?: string, pageId?: string): Promise<{ success: boolean; channel: Channel }> {
    return fetchJson('/api/channels/meta/select-instagram', {
      method: 'POST',
      body: JSON.stringify({ igAccountId, username, pageId })
    });
  },

  async autoConnectWhatsApp(data: {
    phoneNumberId: string;
    displayPhoneNumber?: string;
    verifiedName?: string;
    accessToken?: string;
    wabaId?: string;
  }): Promise<{ success: boolean; channel: Channel }> {
    return fetchJson('/api/channels/meta/whatsapp-onboarding', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async detectWhatsAppFromToken(data: {
    accessToken?: string;
    phoneNumberId?: string;
  }): Promise<{
    success: boolean;
    phoneNumberId?: string;
    displayPhoneNumber?: string;
    verifiedName?: string;
    qualityRating?: string;
    numbers?: Array<{
      id: string;
      waba_id: string;
      waba_name: string;
      display_phone_number: string;
      verified_name?: string;
      quality_rating?: string;
    }>;
  }> {
    return fetchJson('/api/channels/meta/whatsapp-detect', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async whatsappEmbeddedSignup(data: {
    code?: string;
    wabaId?: string;
    phoneNumberId?: string;
    accessToken?: string;
  }): Promise<{
    success: boolean;
    channel?: Channel;
    whatsappNumbers?: Array<{
      id: string;
      waba_id: string;
      waba_name: string;
      display_phone_number: string;
      verified_name?: string;
      quality_rating?: string;
      has_token?: boolean;
      token_preview?: string;
    }>;
  }> {
    return fetchJson('/api/channels/meta/whatsapp-embedded-signup', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getWhatsAppQR(): Promise<{
    success: boolean;
    sessionId: string;
    qrRaw: string;
    expiresInSeconds: number;
    timestamp: number;
  }> {
    return fetchJson('/api/channels/whatsapp/qr');
  },

  async pairWhatsAppQR(data: {
    phoneNumber: string;
    displayTitle?: string;
    sessionId?: string;
  }): Promise<{ success: boolean; channel: Channel }> {
    return fetchJson('/api/channels/whatsapp/pair-scan', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async simulateMetaOAuth(platform: 'messenger' | 'instagram' | 'whatsapp', options?: any): Promise<{ success: boolean; channel?: Channel; pages?: any[] }> {
    return fetchJson('/api/channels/meta/simulate-oauth', {
      method: 'POST',
      body: JSON.stringify({ platform, ...options })
    });
  },

  // LLM Settings
  async getLLMSettings(): Promise<{
    llm_provider: 'gemini' | 'openai' | 'anthropic';
    llm_api_key?: string;
    system_prompt: string;
    has_custom_key: boolean;
    masked_key: string | null;
    default_env_gemini_active: boolean;
  }> {
    return fetchJson('/api/settings/llm');
  },

  async updateLLMSettings(data: {
    llm_provider?: string;
    llm_api_key?: string;
    clear_api_key?: boolean;
    system_prompt?: string;
  }) {
    return fetchJson<{
      message: string;
      llm_provider: 'gemini' | 'openai' | 'anthropic';
      llm_api_key?: string;
      system_prompt: string;
      has_custom_key: boolean;
      masked_key: string | null;
    }>('/api/settings/llm', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Inbox
  async getInbox(params?: { channelId?: string; category?: string } | string): Promise<{
    conversations: Conversation[];
    allMessages: Message[];
    categoryCounts?: { all: number; orders: number; delivered: number; new_customer: number };
  }> {
    const channelId = typeof params === 'string' ? params : params?.channelId;
    const category = typeof params === 'object' ? params?.category : undefined;
    const query = new URLSearchParams();
    if (channelId) query.set('channel_id', channelId);
    if (category) query.set('category', category);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<{
      conversations: Conversation[];
      allMessages: Message[];
      categoryCounts?: { all: number; orders: number; delivered: number; new_customer: number };
    }>(`/api/inbox/messages${qs}`);
  },

  async getConversations(params?: { channelId?: string; category?: string } | string): Promise<Conversation[]> {
    const res = await this.getInbox(params);
    return res.conversations;
  },

  async sendManualReply(data: {
    customerId: string;
    customerName?: string;
    platform: 'whatsapp' | 'messenger' | 'instagram';
    channelId?: string;
    messageText?: string;
    imageBase64?: string;
    imageMimeType?: string;
    videoBase64?: string;
    videoMimeType?: string;
    audioBase64?: string;
    audioMimeType?: string;
  }): Promise<Message> {
    return fetchJson<Message>('/api/inbox/reply', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async sendReply(data: {
    customerId: string;
    customerName?: string;
    platform: 'whatsapp' | 'messenger' | 'instagram';
    channelId?: string;
    messageText?: string;
    imageBase64?: string;
    imageMimeType?: string;
    videoBase64?: string;
    videoMimeType?: string;
    audioBase64?: string;
    audioMimeType?: string;
  }): Promise<Message> {
    return this.sendManualReply(data);
  },

  async summarizeConversation(data: {
    customerId: string;
    customerName?: string;
    platform: 'whatsapp' | 'messenger' | 'instagram';
    channelId?: string;
  }): Promise<ConversationSummaryResult> {
    return fetchJson<ConversationSummaryResult>('/api/inbox/summarize', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async simulateInboundMessage(data: {
    platform: 'whatsapp' | 'messenger' | 'instagram';
    customerId?: string;
    customerName?: string;
    messageText?: string;
    channelId?: string;
    audioBase64?: string;
    audioMimeType?: string;
    imageBase64?: string;
    imageMimeType?: string;
    imageUrl?: string;
    overrideSystemPrompt?: string;
  }) {
    return fetchJson<{
      success: boolean;
      inboundMessage?: Message;
      aiReplyMessage?: Message;
      attachedImageUrl?: string;
      attachedImages?: string[];
      attachedProducts?: Array<{ id: string; name: string; price: number; image_url?: string }>;
      reason?: string;
    }>('/api/inbox/simulate-inbound', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Contacts & Smart Retargeting Broadcast
  async getContacts(): Promise<ContactLead[]> {
    return fetchJson<ContactLead[]>('/api/contacts');
  },

  async toggleCustomerControl(
    customerId: string,
    action: 'pause_ai' | 'resume_ai' | 'block' | 'unblock',
    platform?: string
  ): Promise<{
    success: boolean;
    customerId: string;
    isAiPaused: boolean;
    isBlocked: boolean;
    paused_customers: string[];
    blocked_customers: string[];
  }> {
    return fetchJson('/api/inbox/customer-control', {
      method: 'POST',
      body: JSON.stringify({ customerId, action, platform })
    });
  },

  async getBroadcastQuota(): Promise<{
    dailyLimit: number;
    perCustomerDailyLimit: number;
    enforce24hWindow: boolean;
    usedToday: number;
    remainingToday: number;
    isLimitReached: boolean;
    messagedCustomerIdsToday: string[];
    nextResetAt: string;
  }> {
    return fetchJson('/api/inbox/broadcast-quota');
  },

  async updateBroadcastQuota(data: {
    dailyLimit?: number;
    perCustomerDailyLimit?: number;
    enforce24hWindow?: boolean;
  }): Promise<{
    success: boolean;
    quota: {
      dailyLimit: number;
      perCustomerDailyLimit: number;
      enforce24hWindow: boolean;
      usedToday: number;
      remainingToday: number;
      isLimitReached: boolean;
      messagedCustomerIdsToday: string[];
      nextResetAt: string;
    };
    message: string;
  }> {
    return fetchJson('/api/inbox/broadcast-quota', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async sendSegmentBroadcast(data: {
    segment: 'all' | 'unordered' | 'vip' | 'ordered' | 'buyers';
    platform?: 'all' | 'whatsapp' | 'messenger' | 'instagram';
    platformFilter?: 'all' | 'whatsapp' | 'messenger' | 'instagram';
    messageText: string;
    targetCustomerId?: string;
  }): Promise<{
    success: boolean;
    sentCount: number;
    skippedCooldownCount?: number;
    cappedByDailyLimitCount?: number;
    segment: string;
    quota?: {
      dailyLimit: number;
      perCustomerDailyLimit: number;
      enforce24hWindow: boolean;
      usedToday: number;
      remainingToday: number;
      isLimitReached: boolean;
      messagedCustomerIdsToday: string[];
      nextResetAt: string;
    };
    message: string;
  }> {
    return fetchJson('/api/inbox/broadcast-segment', {
      method: 'POST',
      body: JSON.stringify({
        segment: data.segment,
        platform: data.platform || data.platformFilter || 'all',
        platformFilter: data.platform || data.platformFilter || 'all',
        messageText: data.messageText,
        messageTemplate: data.messageText,
        targetCustomerId: data.targetCustomerId
      })
    });
  },

  // Webhook Simulator
  async simulateWebhook(data: {
    platform: 'whatsapp' | 'messenger';
    identifier: string;
    customerId?: string;
    customerName?: string;
    messageText?: string;
    audioBase64?: string;
    audioMimeType?: string;
  }) {
    return fetchJson('/api/webhooks/simulate', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Admin
  async getAdminMetrics(): Promise<{
    metrics: AdminMetrics;
    recentPayments: any[];
    settings: SystemSettings;
  }> {
    return fetchJson('/api/admin/metrics');
  },

  async getAdminUsers(): Promise<any[]> {
    return fetchJson<any[]>('/api/admin/users');
  },

  async toggleSuspendUser(userId: string): Promise<{ success: boolean; message: string }> {
    return fetchJson<{ success: boolean; message: string }>(`/api/admin/users/${userId}/suspend`, {
      method: 'POST'
    });
  },

  async changeUserRole(userId: string, role: 'user' | 'admin'): Promise<{ success: boolean; message: string }> {
    return fetchJson<{ success: boolean; message: string }>(`/api/admin/users/${userId}/role`, {
      method: 'POST',
      body: JSON.stringify({ role })
    });
  },

  async getAdminSettings(): Promise<SystemSettings> {
    return fetchJson<SystemSettings>('/api/admin/settings');
  },

  async getPublicSettings(): Promise<Partial<SystemSettings>> {
    return fetchJson<Partial<SystemSettings>>('/api/settings/public');
  },

  async updatePromoVideo(data: {
    promo_video_url: string;
    promo_video_thumbnail: string;
  }): Promise<{
    success: boolean;
    promo_video_url: string;
    promo_video_thumbnail: string;
    settings: SystemSettings;
  }> {
    return fetchJson('/api/settings/promo-video', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async updateAdminSettings(settings: Partial<SystemSettings>): Promise<{ success: boolean; settings: SystemSettings }> {
    return fetchJson('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },

  async runExpiryCron(): Promise<{ success: boolean; expiredCount: number; message: string }> {
    return fetchJson('/api/admin/cron/run-expiry', {
      method: 'POST'
    });
  },

  // Aliases for component convenience
  async getCurrentUser(): Promise<UserProfile | null> {
    if (!currentUserId) return null;
    try {
      const res = await api.getMe();
      if (!res?.user) {
        setActiveUserId('');
        return null;
      }
      return res.user;
    } catch {
      setActiveUserId('');
      return null;
    }
  },

  async getSubscriptionStatus(): Promise<SubscriptionStatusInfo> {
    return api.getCurrentSubscription();
  },

  async getAdminOverview(): Promise<AdminMetrics> {
    const res = await api.getAdminMetrics();
    return res.metrics;
  },

  async getAdminPayments(): Promise<Payment[]> {
    return api.getAllPayments();
  },

  async getPayments(): Promise<Payment[]> {
    return api.getMyPayments();
  },

  async getSchemaSql(): Promise<string> {
    const res = await fetch('/api/schema-sql');
    return res.text();
  },

  async runSubscriptionCron(): Promise<any> {
    return api.runExpiryCron();
  },

  async updateUserStatus(userId: string, _status?: string): Promise<{ success: boolean; message: string }> {
    return api.toggleSuspendUser(userId);
  },

  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<{ success: boolean; message: string }> {
    return api.changeUserRole(userId, role);
  },

  async queryHeroChat(message: string, platform: 'whatsapp' | 'messenger', history?: any[]): Promise<{ reply: string; source?: string }> {
    return fetchJson<{ reply: string; source?: string }>('/api/ai-chat/hero-query', {
      method: 'POST',
      body: JSON.stringify({ message, platform, history })
    });
  },

  async testBusinessSandbox(data: {
    businessName: string;
    businessCategory?: string;
    products: string;
    deliveryRules: string;
    paymentRules: string;
    customTone?: string;
    message: string;
    platform?: 'whatsapp' | 'messenger';
    history?: any[];
  }): Promise<{ reply: string; detectedOrder?: any; source?: string }> {
    return fetchJson<{ reply: string; detectedOrder?: any; source?: string }>('/api/ai-chat/business-sandbox', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Orders Hub
  async getOrders(params?: {
    status?: string;
    platform?: string;
    search?: string;
    customerId?: string;
    sourceType?: 'website' | 'manual_ai' | 'all';
  }): Promise<{ orders: Order[]; totalCount: number; metrics: OrderMetrics }> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.platform) query.set('platform', params.platform);
    if (params?.search) query.set('search', params.search);
    if (params?.customerId) query.set('customerId', params.customerId);
    if (params?.sourceType) query.set('sourceType', params.sourceType);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<{ orders: Order[]; totalCount: number; metrics: OrderMetrics }>(`/api/orders${queryString}`);
  },

  async getOrder(id: string): Promise<Order> {
    return fetchJson<Order>(`/api/orders/${id}`);
  },

  async createOrder(order: Partial<Order>): Promise<{ order: Order; message: string }> {
    return fetchJson<{ order: Order; message: string }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(order)
    });
  },

  async updateOrder(id: string, updates: Partial<Order>): Promise<{ order: Order; message: string }> {
    return fetchJson<{ order: Order; message: string }>(`/api/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  async deleteOrder(id: string): Promise<{ success: boolean; message: string }> {
    return fetchJson<{ success: boolean; message: string }>(`/api/orders/${id}`, {
      method: 'DELETE'
    });
  },

  async dispatchOrderToCourier(
    orderId: string,
    courierId: string,
    credentials?: {
      merchantId?: string;
      apiKey?: string;
      apiSecret?: string;
      pickupAddress?: string;
      pickupPhone?: string;
    }
  ): Promise<{
    success: boolean;
    order: Order;
    mode: 'live_api' | 'smart_instant';
    trackingNumber: string;
    consignmentId: string;
    note: string;
    message: string;
  }> {
    return fetchJson(`/api/orders/${orderId}/dispatch-courier`, {
      method: 'POST',
      body: JSON.stringify({ courierId, credentials })
    });
  },

  async bulkDispatchOrdersToCourier(
    orderIds: string[],
    courierId: string,
    credentials?: {
      merchantId?: string;
      apiKey?: string;
      apiSecret?: string;
      pickupAddress?: string;
      pickupPhone?: string;
    }
  ): Promise<{
    success: boolean;
    dispatchedCount: number;
    liveApiCount: number;
    orders: Order[];
    message: string;
  }> {
    return fetchJson('/api/orders/bulk-dispatch-courier', {
      method: 'POST',
      body: JSON.stringify({ orderIds, courierId, credentials })
    });
  },

  async getCourierSettings(): Promise<{
    success: boolean;
    courier_settings: Record<string, any>;
    defaultCourierId: string;
  }> {
    return fetchJson('/api/orders/courier/settings');
  },

  async saveCourierSettings(
    courier_settings: Record<string, any>,
    defaultCourierId?: string
  ): Promise<{
    success: boolean;
    message: string;
    courier_settings: Record<string, any>;
  }> {
    return fetchJson('/api/orders/courier/settings', {
      method: 'POST',
      body: JSON.stringify({ courier_settings, defaultCourierId })
    });
  },

  async testCourierConnection(
    courierId: string,
    apiKey: string,
    apiSecret?: string,
    merchantId?: string
  ): Promise<{
    success: boolean;
    verified: boolean;
    message: string;
    balance?: number;
    error?: string;
  }> {
    return fetchJson('/api/orders/courier/test-connection', {
      method: 'POST',
      body: JSON.stringify({ courierId, apiKey, apiSecret, merchantId })
    });
  },

  async getAutoCourierSettings(): Promise<AutoCourierDispatchSettings> {
    const res = await fetchJson<{ success: boolean; settings: AutoCourierDispatchSettings }>('/api/orders/courier/auto-dispatch-settings');
    return res.settings;
  },

  async saveAutoCourierSettings(
    settings: Partial<AutoCourierDispatchSettings>
  ): Promise<{
    success: boolean;
    message: string;
    settings: AutoCourierDispatchSettings;
  }> {
    return fetchJson('/api/orders/courier/auto-dispatch-settings', {
      method: 'POST',
      body: JSON.stringify(settings)
    });
  },

  async runAutoCourierDispatch(): Promise<{
    success: boolean;
    totalScanned: number;
    dispatchedCount: number;
    suspiciousCount: number;
    dispatchedOrders: Order[];
    suspiciousOrders: Order[];
    courier: string;
    message: string;
  }> {
    return fetchJson('/api/orders/courier/run-auto-dispatch', {
      method: 'POST'
    });
  },

  async approveSuspiciousOrder(
    orderId: string,
    courierId?: string
  ): Promise<{
    success: boolean;
    order: Order;
    trackingNumber?: string;
    message: string;
  }> {
    return fetchJson(`/api/orders/${orderId}/approve-suspicious-dispatch`, {
      method: 'POST',
      body: JSON.stringify({ courierId })
    });
  },

  async dismissSuspiciousOrder(
    orderId: string
  ): Promise<{
    success: boolean;
    order: Order;
    message: string;
  }> {
    return fetchJson(`/api/orders/${orderId}/dismiss-suspicious`, {
      method: 'POST'
    });
  },

  async getOrderSettings(): Promise<OrderConfirmationSettings> {
    return fetchJson<OrderConfirmationSettings>('/api/orders/settings');
  },

  async updateOrderSettings(settings: Partial<OrderConfirmationSettings>): Promise<{ settings: OrderConfirmationSettings; message: string }> {
    return fetchJson<{ settings: OrderConfirmationSettings; message: string }>('/api/orders/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },

  async testOrderDetection(sampleMessage: string, customerName?: string): Promise<{
    hasOrderSignals: boolean;
    detectedOrder: Order | null;
    instructionsUsed: string;
  }> {
    return fetchJson<{
      hasOrderSignals: boolean;
      detectedOrder: Order | null;
      instructionsUsed: string;
    }>('/api/orders/test-detection', {
      method: 'POST',
      body: JSON.stringify({ sampleMessage, customerName })
    });
  },

  // Stores & Website Integrations (Shopify, WordPress, WooCommerce, Custom)
  async getStores(): Promise<{
    stores: StoreIntegration[];
    isProPlan: boolean;
    stats: {
      totalStores: number;
      activeStores: number;
      totalSyncedOrders: number;
      totalRevenueSynced: number;
    };
  }> {
    return fetchJson('/api/stores');
  },

  async connectStore(data: {
    platform: 'shopify' | 'woocommerce' | 'custom_website';
    store_name: string;
    store_url?: string;
    api_key?: string;
    webhook_secret?: string;
  }): Promise<{ store: StoreIntegration; message: string }> {
    return fetchJson('/api/stores', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateStore(id: string, updates: Partial<StoreIntegration>): Promise<{ store: StoreIntegration; message: string }> {
    return fetchJson(`/api/stores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteStore(id: string): Promise<{ success: boolean; message: string }> {
    return fetchJson(`/api/stores/${id}`, {
      method: 'DELETE'
    });
  },

  async testStoreSync(storeId: string, customData?: any): Promise<{ success: boolean; order: Order; message: string }> {
    return fetchJson(`/api/stores/${storeId}/sync-test`, {
      method: 'POST',
      body: JSON.stringify(customData || {})
    });
  },

  // Call Requests (Human Handover Queue)
  async getCallRequests(): Promise<{
    requests: CallRequest[];
    stats: {
      totalRequests: number;
      pendingRequests: number;
      calledRequests: number;
      convertedRequests: number;
    };
  }> {
    return fetchJson('/api/call-requests');
  },

  async createCallRequest(data: {
    customer_name: string;
    customer_phone: string;
    platform?: 'whatsapp' | 'messenger';
    message_excerpt?: string;
    notes?: string;
  }): Promise<{ request: CallRequest; message: string }> {
    return fetchJson('/api/call-requests', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateCallRequest(
    id: string,
    updates: { status?: CallRequest['status']; notes?: string; customer_phone?: string; customer_name?: string }
  ): Promise<{ request: CallRequest; message: string }> {
    return fetchJson(`/api/call-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteCallRequest(id: string): Promise<{ success: boolean; message: string }> {
    return fetchJson(`/api/call-requests/${id}`, {
      method: 'DELETE'
    });
  },

  async convertCallRequestToOrder(id: string, orderData: {
    items: string;
    quantity?: number;
    total_amount: number;
    customer_address: string;
    payment_method?: 'cod' | 'bkash' | 'nagad' | 'bank';
    notes?: string;
  }): Promise<{ order: Order; message: string }> {
    return fetchJson(`/api/call-requests/${id}/convert-to-order`, {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  async simulateCallRequest(): Promise<{ request: CallRequest; message: string }> {
    return fetchJson('/api/call-requests/simulate', {
      method: 'POST'
    });
  },

  // Website AI Chatbot Widget APIs
  async getWidgetConfig(agentId?: string): Promise<{ success: boolean; config: any }> {
    const q = agentId ? `?agentId=${encodeURIComponent(agentId)}` : '';
    return fetchJson(`/api/widget/config${q}`);
  },

  async updateWidgetConfig(data: any): Promise<{ success: boolean; message: string; config: any }> {
    return fetchJson('/api/widget/settings', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async sendWidgetChat(data: {
    agentId?: string;
    visitorId?: string;
    message: string;
    customerName?: string;
    customerPhone?: string;
    imageBase64?: string;
    imageMimeType?: string;
    audioBase64?: string;
    audioMimeType?: string;
    audioTranscript?: string;
    history?: Array<{ sender: 'user' | 'bot'; text: string }>;
  }): Promise<{
    success: boolean;
    reply: string;
    detectedLanguage?: 'bn' | 'en';
    conversationId: string;
    timestamp: string;
    orderCreated?: boolean;
    order?: any;
    attachedImageUrl?: string;
    imageUrl?: string;
  }> {
    return fetchJson('/api/widget/chat', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Products & Inventory Catalog
  async getProducts(params?: {
    category?: string;
    stock_status?: string;
    search?: string;
  }): Promise<{
    products: Product[];
    stats: {
      totalProducts: number;
      inStockCount: number;
      lowStockCount: number;
      outOfStockCount: number;
    };
    categories: string[];
  }> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.stock_status) query.set('stock_status', params.stock_status);
    if (params?.search) query.set('search', params.search);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return fetchJson(`/api/products${queryString}`);
  },

  async getProduct(id: string): Promise<{ product: Product }> {
    return fetchJson(`/api/products/${id}`);
  },

  async createProduct(data: Partial<Product>): Promise<{ product: Product; message: string }> {
    return fetchJson('/api/products', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<{ product: Product; message: string }> {
    return fetchJson(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    return fetchJson(`/api/products/${id}`, {
      method: 'DELETE'
    });
  },

  async seedSampleProducts(): Promise<{ products: Product[]; message: string }> {
    return fetchJson('/api/products/sample-seed', {
      method: 'POST'
    });
  },

  async testProductAiQuery(message: string, productId?: string): Promise<{
    success: boolean;
    reply: string;
    attachedImageUrl?: string;
    attachedProductName?: string;
    attachedProductPrice?: number;
    attachedProducts?: Array<{ id: string; name: string; price: number; image_url: string }>;
  }> {
    return fetchJson('/api/products/test-ai-query', {
      method: 'POST',
      body: JSON.stringify({ message, productId })
    });
  },

  async verifyGatewayTransaction(
    transactionReference: string,
    planId?: string,
    options?: {
      method?: 'bkash' | 'nagad' | 'rocket' | 'upay' | 'bank' | string;
      orderId?: string;
      tmpId?: string;
      customAmount?: number;
      durationDays?: number;
      durationLabel?: string;
      couponCode?: string;
      discountAmount?: number;
    }
  ) {
    return this.verifyGatewayPayment(transactionReference, planId, options);
  },

  // Admin Coupons Management
  async getAdminCoupons(): Promise<Coupon[]> {
    return fetchJson<Coupon[]>('/api/admin/coupons');
  },

  async createAdminCoupon(data: {
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_amount?: number;
    max_uses?: number;
    expires_at?: string | null;
    is_active?: boolean;
  }): Promise<Coupon> {
    return fetchJson<Coupon>('/api/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateAdminCoupon(
    id: string,
    data: Partial<{
      code: string;
      discount_type: 'percentage' | 'fixed';
      discount_value: number;
      min_amount: number;
      max_uses: number;
      expires_at: string | null;
      is_active: boolean;
    }>
  ): Promise<Coupon> {
    return fetchJson<Coupon>(`/api/admin/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteAdminCoupon(id: string): Promise<{ success: boolean; id: string }> {
    return fetchJson<{ success: boolean; id: string }>(`/api/admin/coupons/${id}`, {
      method: 'DELETE'
    });
  },

  // Customer Reviews (Public + Admin Moderation)
  async getPublicReviews(): Promise<{ reviews: any[] }> {
    return fetchJson<{ reviews: any[] }>('/api/settings/reviews');
  },

  async submitReview(data: {
    name: string;
    role?: string;
    business?: string;
    rating: number;
    review_text: string;
    avatar_url?: string;
  }): Promise<{ success: boolean; review: any; message: string }> {
    return fetchJson('/api/settings/reviews', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getAdminReviews(): Promise<{ reviews: any[] }> {
    return fetchJson<{ reviews: any[] }>('/api/admin/reviews');
  },

  async approveAdminReview(id: string): Promise<{ success: boolean; review: any; message: string }> {
    return fetchJson(`/api/admin/reviews/${id}/approve`, {
      method: 'POST'
    });
  },

  async deleteAdminReview(id: string): Promise<{ success: boolean; id: string; message: string }> {
    return fetchJson(`/api/admin/reviews/${id}`, {
      method: 'DELETE'
    });
  },

  // Broadcast Notifications (Merchant Banner + Admin Control)
  async getActiveNotifications(): Promise<{ notifications: any[] }> {
    return fetchJson<{ notifications: any[] }>('/api/settings/notifications');
  },

  async getAdminNotifications(): Promise<{ notifications: any[] }> {
    return fetchJson<{ notifications: any[] }>('/api/admin/notifications');
  },

  async createAdminNotification(data: {
    title: string;
    message: string;
    type: 'info' | 'promo' | 'warning' | 'maintenance';
    action_label?: string;
    action_tab?: string;
    is_active?: boolean;
  }): Promise<{ success: boolean; notification: any; message: string }> {
    return fetchJson('/api/admin/notifications', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateAdminNotification(
    id: string,
    updates: Partial<{
      title: string;
      message: string;
      type: 'info' | 'promo' | 'warning' | 'maintenance';
      action_label: string;
      action_tab: string;
      is_active: boolean;
    }>
  ): Promise<{ success: boolean; notification: any }> {
    return fetchJson(`/api/admin/notifications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  async deleteAdminNotification(id: string): Promise<{ success: boolean; id: string }> {
    return fetchJson(`/api/admin/notifications/${id}`, {
      method: 'DELETE'
    });
  },

  // AI Appointments & Google Calendar Sync
  async getAppointments(): Promise<{
    appointments: any[];
    settings: any;
    stats: any;
    icalFeedPath: string;
  }> {
    return fetchJson('/api/appointments');
  },

  async getAppointmentSettings(): Promise<{ settings: any }> {
    return fetchJson('/api/appointments/settings');
  },

  async updateAppointmentSettings(updates: any): Promise<{
    success: boolean;
    settings: any;
    message: string;
  }> {
    return fetchJson('/api/appointments/settings', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async getAppointmentSlots(date: string): Promise<any> {
    return fetchJson(`/api/appointments/slots?date=${encodeURIComponent(date)}`);
  },

  async createAppointment(data: {
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    platform?: 'whatsapp' | 'messenger' | 'instagram' | 'website' | 'manual';
    service_name?: string;
    appointment_date: string;
    appointment_time: string;
    duration_minutes?: number;
    location?: string;
    notes?: string;
  }): Promise<{ appointment: any; message: string }> {
    return fetchJson('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateAppointment(
    id: string,
    updates: Partial<{
      status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'rescheduled';
      appointment_date: string;
      appointment_time: string;
      service_name: string;
      customer_name: string;
      customer_phone: string;
      location: string;
      notes: string;
      google_calendar_synced: boolean;
    }>
  ): Promise<{ appointment: any; message: string }> {
    return fetchJson(`/api/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteAppointment(id: string): Promise<{ success: boolean; message: string }> {
    return fetchJson(`/api/appointments/${id}`, {
      method: 'DELETE'
    });
  },

  async simulateAppointmentBooking(data: {
    customerName: string;
    customerPhone: string;
    platform: 'whatsapp' | 'messenger' | 'instagram' | 'website';
    messageText: string;
  }): Promise<{
    success: boolean;
    aiReply: string;
    bookedAppointment: any;
  }> {
    return fetchJson('/api/appointments/simulate-ai', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Email Marketing & AI Campaign Broadcast + Open/Click Analytics
  async getEmailCampaignsHub(): Promise<{
    campaigns: any[];
    subscribers: any[];
    smtpSettings: any;
    analytics: any;
  }> {
    return fetchJson('/api/email-campaigns');
  },

  async addEmailSubscribers(data: {
    email?: string;
    name?: string;
    phone?: string;
    tags?: string[];
    bulkText?: string;
  }): Promise<{
    success: boolean;
    importedCount?: number;
    subscriber?: any;
    subscribers: any[];
    message: string;
  }> {
    return fetchJson('/api/email-campaigns/subscribers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async syncEmailSubscribers(): Promise<{
    success: boolean;
    addedCount: number;
    totalCount: number;
    subscribers: any[];
    message: string;
  }> {
    return fetchJson('/api/email-campaigns/subscribers/sync', {
      method: 'POST'
    });
  },

  async deleteEmailSubscriber(id: string): Promise<{
    success: boolean;
    subscribers: any[];
    message: string;
  }> {
    return fetchJson(`/api/email-campaigns/subscribers/${id}`, {
      method: 'DELETE'
    });
  },

  async updateEmailSmtpSettings(updates: any): Promise<{
    success: boolean;
    smtpSettings: any;
    message: string;
  }> {
    return fetchJson('/api/email-campaigns/smtp', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async generateMarketingEmailAI(data: {
    topicPrompt: string;
    language: 'en' | 'bn';
  }): Promise<{
    success: boolean;
    subject: string;
    preheader: string;
    body_html: string;
    cta_text: string;
  }> {
    return fetchJson('/api/email-campaigns/ai-write', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async createAndSendEmailCampaign(data: {
    name?: string;
    subject: string;
    preheader?: string;
    body_html: string;
    cta_text?: string;
    cta_url?: string;
    audience_filter?: 'all' | 'vip' | 'custom';
    custom_emails?: string;
  }): Promise<{
    success: boolean;
    campaign: any;
    analytics: any;
    message: string;
  }> {
    return fetchJson('/api/email-campaigns', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async simulateEmailEngagement(
    campaignId: string,
    type: 'open' | 'click'
  ): Promise<{
    success: boolean;
    campaign: any;
    analytics: any;
    message: string;
  }> {
    return fetchJson(`/api/email-campaigns/${campaignId}/simulate-engagement`, {
      method: 'POST',
      body: JSON.stringify({ type })
    });
  },

  async deleteEmailCampaign(id: string): Promise<{
    success: boolean;
    campaigns: any[];
    analytics: any;
    message: string;
  }> {
    return fetchJson(`/api/email-campaigns/${id}`, {
      method: 'DELETE'
    });
  },

  // Business Accounting, Purchase, Stock, Due & Reports ERP
  async getErpSummary(): Promise<any> {
    return fetchJson('/api/erp/summary');
  },

  async createErpPurchase(data: {
    supplier_name: string;
    supplier_phone?: string;
    product_id?: string;
    product_name?: string;
    quantity: number;
    unit_cost: number;
    paid_amount?: number;
    selling_price?: number;
    payment_method?: 'cash' | 'bkash' | 'nagad' | 'bank';
    notes?: string;
  }): Promise<{
    success: boolean;
    purchase: any;
    summary: any;
    message: string;
  }> {
    return fetchJson('/api/erp/purchases', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async deleteErpPurchase(id: string): Promise<{
    success: boolean;
    summary: any;
    message: string;
  }> {
    return fetchJson(`/api/erp/purchases/${id}`, {
      method: 'DELETE'
    });
  },

  async updateErpStock(
    productId: string,
    data: {
      name?: string;
      category?: string;
      stock_quantity?: number;
      buying_price?: number;
      price?: number;
      description?: string;
      image_url?: string;
    }
  ): Promise<{
    success: boolean;
    summary: any;
    message: string;
  }> {
    return fetchJson(`/api/erp/stock/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteErpStock(productId: string): Promise<{
    success: boolean;
    summary: any;
    message: string;
  }> {
    return fetchJson(`/api/erp/stock/${productId}`, {
      method: 'DELETE'
    });
  },

  async createErpDue(data: {
    party_type: 'customer' | 'supplier';
    party_name: string;
    party_phone?: string;
    description: string;
    total_amount: number;
    paid_amount?: number;
    due_date?: string;
  }): Promise<{
    success: boolean;
    due: any;
    summary: any;
    message: string;
  }> {
    return fetchJson('/api/erp/dues', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async settleErpDue(
    id: string,
    data?: {
      amount?: number;
      payment_method?: 'cash' | 'bkash' | 'nagad' | 'bank';
    }
  ): Promise<{
    success: boolean;
    summary: any;
    message: string;
  }> {
    return fetchJson(`/api/erp/dues/${id}/settle`, {
      method: 'POST',
      body: JSON.stringify(data || {})
    });
  },

  async deleteErpDue(id: string): Promise<{
    success: boolean;
    summary: any;
    message: string;
  }> {
    return fetchJson(`/api/erp/dues/${id}`, {
      method: 'DELETE'
    });
  },

  async createErpTransaction(data: {
    type: 'income' | 'expense';
    category: string;
    title: string;
    amount: number;
    payment_method?: 'cash' | 'bkash' | 'nagad' | 'bank';
    notes?: string;
  }): Promise<{
    success: boolean;
    transaction: any;
    summary: any;
    message: string;
  }> {
    return fetchJson('/api/erp/transactions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async deleteErpTransaction(id: string): Promise<{
    success: boolean;
    summary: any;
    message: string;
  }> {
    return fetchJson(`/api/erp/transactions/${id}`, {
      method: 'DELETE'
    });
  }
};


