import { Order } from '../types';

export interface CourierProvider {
  id: string;
  name: string;
  bengaliName: string;
  tagline: string;
  portalUrl: string;
  websiteUrl: string;
  trackingUrlTemplate?: string;
  colorClass: string;
  buttonClass: string;
  badgeBg: string;
  logoCode: string;
}

export const COURIER_PROVIDERS: CourierProvider[] = [
  {
    id: 'steadfast',
    name: 'Steadfast Courier',
    bengaliName: 'Steadfast Courier',
    tagline: 'Leading nationwide e-commerce parcel delivery service',
    portalUrl: 'https://steadfast.com.bd/user/login',
    websiteUrl: 'https://steadfast.com.bd',
    trackingUrlTemplate: 'https://steadfast.com.bd/tracking/{tracking_id}',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    logoCode: 'SF'
  },
  {
    id: 'pathao',
    name: 'Pathao Courier',
    bengaliName: 'Pathao Courier',
    tagline: 'Fast on-demand parcel delivery and merchant dashboard',
    portalUrl: 'https://merchant.pathao.com/login',
    websiteUrl: 'https://merchant.pathao.com',
    colorClass: 'text-red-600 dark:text-red-400',
    buttonClass: 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20',
    badgeBg: 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    logoCode: 'PT'
  },
  {
    id: 'redx',
    name: 'RedX Delivery',
    bengaliName: 'RedX Delivery',
    tagline: 'Doorstep parcel delivery with real-time tracking',
    portalUrl: 'https://merchant.redx.com.bd',
    websiteUrl: 'https://redx.com.bd',
    colorClass: 'text-rose-600 dark:text-rose-400',
    buttonClass: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    logoCode: 'RX'
  },
  {
    id: 'paperfly',
    name: 'Paperfly Courier',
    bengaliName: 'Paperfly Courier',
    tagline: 'Nationwide doorstep logistics and COD fulfillment',
    portalUrl: 'https://go.paperfly.com.bd',
    websiteUrl: 'https://paperfly.com.bd',
    colorClass: 'text-blue-600 dark:text-blue-400',
    buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    logoCode: 'PF'
  },
  {
    id: 'ecourier',
    name: 'eCourier',
    bengaliName: 'eCourier',
    tagline: 'Modern parcel tracking and reliable merchant fulfillment',
    portalUrl: 'https://ecourier.com.bd/merchant-login',
    websiteUrl: 'https://ecourier.com.bd',
    colorClass: 'text-amber-600 dark:text-amber-400',
    buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    logoCode: 'eC'
  },
  {
    id: 'sundarban',
    name: 'Sundarban Courier',
    bengaliName: 'Sundarban Courier Service',
    tagline: 'Extensive logistics and parcel distribution network',
    portalUrl: 'https://sundarbancourierltd.com',
    websiteUrl: 'https://sundarbancourierltd.com',
    colorClass: 'text-teal-600 dark:text-teal-400',
    buttonClass: 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20',
    badgeBg: 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    logoCode: 'SB'
  }
];

const LOCAL_STORAGE_COURIER_KEY = 'oneagent_default_courier_id';
const LOCAL_STORAGE_CUSTOM_URL_KEY = 'oneagent_custom_courier_url';
const LOCAL_STORAGE_COURIER_CREDS_PREFIX = 'oneagent_courier_creds_';
const LOCAL_STORAGE_DELIVERY_FEES_KEY = 'oneagent_delivery_fee_settings';

export interface DeliveryFeeSettings {
  insideDhaka: number;
  outsideDhaka: number;
  subUrban: number;
  freeDeliveryThreshold: number;
  codChargePercent: number;
  insideDhakaTime: string;
  outsideDhakaTime: string;
}

export const DEFAULT_DELIVERY_FEES: DeliveryFeeSettings = {
  insideDhaka: 60,
  outsideDhaka: 120,
  subUrban: 100,
  freeDeliveryThreshold: 2500,
  codChargePercent: 0,
  insideDhakaTime: '24-48 Hours',
  outsideDhakaTime: '48-72 Hours'
};

export function getDeliveryFeeSettings(): DeliveryFeeSettings {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_DELIVERY_FEES_KEY);
      if (raw) return { ...DEFAULT_DELIVERY_FEES, ...JSON.parse(raw) };
    } catch (e) {
      console.warn('Failed to parse delivery fee settings:', e);
    }
  }
  return DEFAULT_DELIVERY_FEES;
}

export function saveDeliveryFeeSettings(settings: DeliveryFeeSettings): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_DELIVERY_FEES_KEY, JSON.stringify(settings));
  }
}

export interface CourierCredentials {
  merchantId?: string;
  apiKey?: string;
  apiSecret?: string;
  pickupAddress?: string;
  customUrl?: string;
  notes?: string;
}

export function getCourierCredentials(courierId: string): CourierCredentials {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`${LOCAL_STORAGE_COURIER_CREDS_PREFIX}${courierId}`);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse courier creds:', e);
    }
  }
  return {};
}

export function saveCourierCredentials(courierId: string, creds: CourierCredentials): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${LOCAL_STORAGE_COURIER_CREDS_PREFIX}${courierId}`, JSON.stringify(creds));
  }
}

export function getDefaultCourierId(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(LOCAL_STORAGE_COURIER_KEY) || 'steadfast';
  }
  return 'steadfast';
}

export function setDefaultCourierId(courierId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_COURIER_KEY, courierId);
  }
}

export function getCustomCourierUrl(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(LOCAL_STORAGE_CUSTOM_URL_KEY) || '';
  }
  return '';
}

export function setCustomCourierUrl(url: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_CUSTOM_URL_KEY, url);
  }
}

export function getCourierById(id: string): CourierProvider {
  return COURIER_PROVIDERS.find(c => c.id === id) || COURIER_PROVIDERS[0];
}

/**
 * Format order details into a clean format ready to paste into courier portals
 */
export function formatOrderForCourier(order: Order): string {
  const shortId = order.id.slice(-6).toUpperCase();
  const address = order.customer_address && order.customer_address !== 'Address provided in chat'
    ? order.customer_address
    : 'Address provided in customer chat';
  const phone = order.customer_phone || 'N/A';
  const codAmount = order.payment_status === 'paid' ? 0 : (order.total_amount || 0);

  return `[One Agent BD Parcel Delivery Details]
Customer Name: ${order.customer_name}
Mobile Number: ${phone}
Delivery Address: ${address}
Cash on Delivery (COD): BDT ${codAmount} (Payment Method: ${order.payment_method?.toUpperCase() || 'COD'})
Items: ${order.items || 'Order item'} (Qty: ${order.quantity || 1})
Invoice / Order ID: #${shortId}
Date: ${new Date(order.created_at).toLocaleDateString('en-GB')}`;
}

/**
 * 1-Click Dispatch order to Courier:
 * 1. Sends parcel to backend Courier Engine (uses Live Courier API if credentials exist, or Smart 1-Click Instant Mode if merchant has no courier API account).
 * 2. Automatically updates order status to 'processing' (In Transit) & generates/assigns Tracking Number.
 * 3. Copies formatted parcel slip to clipboard and optionally opens courier portal.
 */
export async function sendOrderToCourier(
  order: Order,
  courierId?: string,
  options?: { openPortal?: boolean }
): Promise<{
  success: boolean;
  courierName: string;
  copiedText: string;
  targetUrl: string;
  trackingNumber?: string;
  mode?: 'live_api' | 'smart_instant';
  updatedOrder?: Order;
}> {
  const targetCourierId = courierId || getDefaultCourierId();
  const courier = getCourierById(targetCourierId);
  let targetUrl = courier.portalUrl || courier.websiteUrl;

  if (targetCourierId === 'custom') {
    const customUrl = getCustomCourierUrl();
    if (customUrl) {
      targetUrl = customUrl;
    }
  }

  const creds = getCourierCredentials(targetCourierId);
  let trackingNumber = order.tracking_number;
  let mode: 'live_api' | 'smart_instant' = 'smart_instant';
  let updatedOrder: Order | undefined;

  // Call backend 1-Click Courier Dispatch Engine
  try {
    const { api } = await import('../api');
    const dispatchRes = await api.dispatchOrderToCourier(order.id, targetCourierId, {
      merchantId: creds.merchantId,
      apiKey: creds.apiKey,
      apiSecret: creds.apiSecret,
      pickupAddress: creds.pickupAddress,
      pickupPhone: creds.notes
    });
    if (dispatchRes?.success) {
      trackingNumber = dispatchRes.trackingNumber;
      mode = dispatchRes.mode;
      updatedOrder = dispatchRes.order;
    }
  } catch (err) {
    console.warn('Backend courier dispatch fallback:', err);
  }

  const textToCopy = formatOrderForCourier(updatedOrder || order);

  // Copy to clipboard
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(textToCopy);
    }
  } catch (err) {
    console.warn('Clipboard write error:', err);
  }

  // Open courier website in new window/tab only if explicitly requested or if openPortal is true
  if (options?.openPortal && typeof window !== 'undefined') {
    try {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.warn('Could not open target window:', e);
    }
  }

  return {
    success: true,
    courierName: courier.name,
    copiedText: textToCopy,
    targetUrl,
    trackingNumber,
    mode,
    updatedOrder
  };
}
