import React, { useState, useEffect } from 'react';
import {
  X,
  Truck,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  PackageCheck,
  ShieldCheck,
  ArrowRight,
  Globe,
  Settings2,
  Phone,
  MapPin,
  Clock
} from 'lucide-react';
import { Order } from '../../types';
import {
  COURIER_PROVIDERS,
  CourierProvider,
  getDefaultCourierId,
  setDefaultCourierId,
  getCustomCourierUrl,
  setCustomCourierUrl,
  formatOrderForCourier,
  sendOrderToCourier,
  getCourierCredentials,
  saveCourierCredentials,
  CourierCredentials
} from '../../utils/courierUtils';

interface CourierModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order | null;
  orders?: Order[];
  initialTab?: 'quick' | 'settings';
  onOrderShipped?: (orderId: string) => void;
}

export const CourierModal: React.FC<CourierModalProps> = ({
  isOpen,
  onClose,
  order: initialOrder,
  orders = [],
  initialTab = 'quick',
  onOrderShipped
}) => {
  const [selectedCourierId, setSelectedCourierId] = useState<string>(() => getDefaultCourierId());
  const [customUrl, setCustomUrl] = useState<string>(() => getCustomCourierUrl());
  const [merchantId, setMerchantId] = useState<string>(() => getCourierCredentials(getDefaultCourierId()).merchantId || '');
  const [apiKey, setApiKey] = useState<string>(() => getCourierCredentials(getDefaultCourierId()).apiKey || '');
  const [apiSecret, setApiSecret] = useState<string>(() => getCourierCredentials(getDefaultCourierId()).apiSecret || '');
  const [pickupAddress, setPickupAddress] = useState<string>(() => getCourierCredentials(getDefaultCourierId()).pickupAddress || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [markedShipped, setMarkedShipped] = useState(false);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [openedNotification, setOpenedNotification] = useState<{
    courierName: string;
    targetUrl: string;
    trackingNumber?: string;
    mode?: 'live_api' | 'smart_instant';
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'quick' | 'settings'>(initialTab);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(initialOrder || null);

  useEffect(() => {
    if (isOpen) {
      if (initialOrder) {
        setSelectedOrder(initialOrder);
      } else if (orders.length > 0 && !selectedOrder) {
        setSelectedOrder(orders[0]);
      }
      if (initialTab) {
        setActiveTab(initialTab);
      }
    }
  }, [isOpen, initialOrder, initialTab, orders]);

  useEffect(() => {
    const creds = getCourierCredentials(selectedCourierId);
    setMerchantId(creds.merchantId || '');
    setApiKey(creds.apiKey || '');
    setApiSecret(creds.apiSecret || '');
    setPickupAddress(creds.pickupAddress || '');
  }, [selectedCourierId]);

  if (!isOpen) return null;

  const currentOrder = selectedOrder || initialOrder;
  const currentCourier = COURIER_PROVIDERS.find(c => c.id === selectedCourierId) || COURIER_PROVIDERS[0];
  const parcelText = currentOrder ? formatOrderForCourier(currentOrder) : '';

  const handleCopyText = async () => {
    if (!parcelText) return;
    try {
      await navigator.clipboard.writeText(parcelText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenCourier = async (courierId?: string, openPortal = false) => {
    const targetId = courierId || selectedCourierId;
    const courierObj = COURIER_PROVIDERS.find(c => c.id === targetId) || COURIER_PROVIDERS[0];
    const targetUrl = (targetId === 'custom' && customUrl) ? customUrl : courierObj.portalUrl;

    if (currentOrder) {
      setDispatchingId(targetId);
      try {
        const res = await sendOrderToCourier(currentOrder, targetId, { openPortal });
        if (res.updatedOrder) {
          setSelectedOrder(res.updatedOrder);
        }
        setCopied(true);
        setOpenedNotification({
          courierName: res.courierName,
          targetUrl: res.targetUrl,
          trackingNumber: res.trackingNumber,
          mode: res.mode
        });
        setTimeout(() => setCopied(false), 4000);
        if (onOrderShipped && !markedShipped) {
          onOrderShipped(currentOrder.id);
          setMarkedShipped(true);
        }
      } finally {
        setDispatchingId(null);
      }
    } else {
      setOpenedNotification({
        courierName: courierObj.name,
        targetUrl
      });
      try {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      } catch (err) {
        console.warn('window.open fallback', err);
      }
    }
  };

  const handleSaveSettings = () => {
    setDefaultCourierId(selectedCourierId);
    setCustomCourierUrl(customUrl);
    saveCourierCredentials(selectedCourierId, {
      merchantId,
      apiKey,
      apiSecret,
      pickupAddress,
      customUrl
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setActiveTab('quick');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7F22FE]/10 text-[#7F22FE] flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
                Courier Parcel Booking
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                1-Click parcel entry and courier merchant portal access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-3 flex gap-2 border-b border-neutral-100 dark:border-neutral-800 text-xs">
          <button
            onClick={() => setActiveTab('quick')}
            className={`pb-2.5 font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'quick'
                ? 'border-[#7F22FE] text-[#7F22FE]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>1-Click Booking & Links</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-2.5 font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-[#7F22FE] text-[#7F22FE]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            <span>Default Courier Settings</span>
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {activeTab === 'quick' ? (
            <>
              {/* Order Info Banner */}
              {currentOrder ? (
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 space-y-2">
                  {orders.length > 1 && (
                    <div className="mb-2">
                      <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                        Select Order to Dispatch:
                      </label>
                      <select
                        value={currentOrder.id}
                        onChange={(e) => {
                          const o = orders.find(ord => ord.id === e.target.value);
                          if (o) setSelectedOrder(o);
                        }}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white font-semibold cursor-pointer"
                      >
                        {orders.map((o) => (
                          <option key={o.id} value={o.id}>
                            #{o.id.slice(-6).toUpperCase()} - {o.customer_name} ({o.items}) - BDT {o.total_amount}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-violet-600 dark:text-violet-400 text-xs">
                      Order #{currentOrder.id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      COD: BDT {currentOrder.payment_status === 'paid' ? 0 : (currentOrder.total_amount || 0)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-700 dark:text-neutral-300 pt-1">
                    <div>
                      <span className="text-neutral-400 text-[10px] block">Customer:</span>
                      <strong className="text-neutral-900 dark:text-white">{currentOrder.customer_name}</strong>
                      {currentOrder.customer_phone && (
                        <div className="text-[11px] text-neutral-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-neutral-400" />
                          {currentOrder.customer_phone}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px] block">Delivery Address:</span>
                      <div className="text-[11px] text-neutral-700 dark:text-neutral-300 line-clamp-2">
                        {currentOrder.customer_address || 'Address provided in customer chat'}
                      </div>
                    </div>
                  </div>

                  {/* Copy preview box */}
                  <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold text-neutral-500">
                        Formatted text ready for courier portal:
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyText}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7F22FE] hover:underline cursor-pointer"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Copied to Clipboard!' : 'Copy Text'}
                      </button>
                    </div>
                    <pre className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-[11px] font-mono text-neutral-800 dark:text-neutral-200 overflow-x-auto whitespace-pre-wrap max-h-24">
                      {parcelText}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
                  <div className="font-bold mb-1 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-amber-600" />
                    <span>Courier Merchant Portals Direct Access</span>
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300">
                    Click any courier provider below to open their login dashboard directly in a new tab. You can also configure your credentials in the <strong>Default Courier Settings</strong> tab.
                  </p>
                </div>
              )}

              {/* Opened notification banner */}
              {openedNotification && (
                <div className="p-3.5 rounded-2xl bg-[#7F22FE]/5 border border-[#7F22FE]/20 text-xs flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7F22FE] shrink-0 mt-0.5" />
                    <div className="text-neutral-800 dark:text-neutral-200 text-xs space-y-0.5">
                      <div>
                        Dispatched to <strong>{openedNotification.courierName}</strong> & parcel slip copied!
                      </div>
                      {openedNotification.trackingNumber && (
                        <div className="text-[11px] font-mono font-bold text-[#7F22FE]">
                          Tracking ID: {openedNotification.trackingNumber}{' '}
                          <span className="font-sans font-semibold text-[10px] text-neutral-500">
                            ({openedNotification.mode === 'live_api' ? 'Live Courier API' : 'Smart 1-Click Mode'})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <a
                    href={openedNotification.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-[#7F22FE] text-white font-bold text-xs flex items-center gap-1 hover:bg-[#6c1ce0] shrink-0"
                  >
                    <span>Open Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Courier Providers Grid */}
              <div>
                <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-2">
                  1-Click Courier Dispatch (Works with or without Merchant API):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {COURIER_PROVIDERS.map((c) => {
                    const isDefault = c.id === selectedCourierId;
                    const portalLink = (c.id === 'custom' && customUrl) ? customUrl : c.portalUrl;

                    return (
                      <div
                        key={c.id}
                        className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                          isDefault
                            ? 'border-[#7F22FE] bg-[#7F22FE]/5 shadow-xs ring-1 ring-[#7F22FE]/20'
                            : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/40 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center text-white ${
                                c.id === 'steadfast'
                                  ? 'bg-emerald-600'
                                  : c.id === 'pathao'
                                  ? 'bg-red-600'
                                  : c.id === 'redx'
                                  ? 'bg-rose-600'
                                  : c.id === 'paperfly'
                                  ? 'bg-blue-600'
                                  : c.id === 'ecourier'
                                  ? 'bg-amber-600'
                                  : 'bg-teal-600'
                              }`}
                            >
                              {c.logoCode}
                            </span>
                            <div>
                              <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1">
                                {c.name}
                                {isDefault && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-[#7F22FE] text-white font-bold">
                                    Default
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-neutral-400">{c.tagline}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={dispatchingId === c.id}
                            onClick={() => handleOpenCourier(c.id, false)}
                            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60 ${c.buttonClass}`}
                          >
                            <span>
                              {dispatchingId === c.id
                                ? 'Dispatching...'
                                : currentOrder
                                ? '1-Click Send Parcel'
                                : 'Open Portal'}
                            </span>
                            <Truck className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={portalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 transition-colors"
                            title={`Open ${c.name} link directly`}
                          >
                            <Globe className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Note */}
              <div className="p-3 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/50 flex items-start gap-2.5 text-neutral-700 dark:text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Tip:</strong> Clicking any courier button automatically opens their merchant portal in a new tab and copies the customer name, phone number, and address to your clipboard for instant pasting.
                </p>
              </div>
            </>
          ) : (
            /* Settings Tab */
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-2">
                  Select Default Courier:
                </label>
                <div className="space-y-2">
                  {COURIER_PROVIDERS.map((c) => (
                    <label
                      key={c.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-colors ${
                        selectedCourierId === c.id
                          ? 'border-[#7F22FE] bg-[#7F22FE]/5 ring-1 ring-[#7F22FE]/20'
                          : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="defaultCourier"
                          value={c.id}
                          checked={selectedCourierId === c.id}
                          onChange={(e) => setSelectedCourierId(e.target.value)}
                          className="w-4 h-4 text-[#7F22FE] focus:ring-[#7F22FE]"
                        />
                        <div>
                          <div className="font-bold text-neutral-900 dark:text-white">
                            {c.name}
                          </div>
                          <div className="text-[11px] text-neutral-400">{c.tagline}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {new URL(c.portalUrl).hostname}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                  Custom Courier Merchant Login URL (Optional):
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="e.g. https://portal.mycourier.com.bd"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  />
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">
                  If you use a custom logistics partner or local delivery service, enter their merchant portal link here.
                </p>
              </div>

              {/* Merchant Account / API Credentials */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    {currentCourier.name} Account Credentials
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">Saved locally</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      Merchant ID / Store Code:
                    </label>
                    <input
                      type="text"
                      value={merchantId}
                      onChange={(e) => setMerchantId(e.target.value)}
                      placeholder="e.g. SF-98421 or Store ID"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono text-neutral-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      API Key / Secret Token (Optional):
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="e.g. live_secret_..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                    Pickup Hub Address / Store Location:
                  </label>
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder="e.g. Dhanmondi, Dhaka, Bangladesh"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between">
                {savedSuccess && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Delivery settings saved successfully!
                  </span>
                )}
                {!savedSuccess && <div />}

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-5 py-2.5 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#7F22FE]/20 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Save Delivery App Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
