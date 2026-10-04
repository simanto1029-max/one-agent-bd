import React, { useState, useEffect } from 'react';
import {
  Truck,
  ExternalLink,
  Save,
  Check,
  Sparkles,
  MapPin,
  Phone,
  Key,
  ShieldCheck,
  Building,
  DollarSign,
  Clock,
  Copy,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  Send,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../api';
import {
  COURIER_PROVIDERS,
  CourierProvider,
  getDefaultCourierId,
  setDefaultCourierId,
  getCustomCourierUrl,
  setCustomCourierUrl,
  getCourierCredentials,
  saveCourierCredentials,
  getDeliveryFeeSettings,
  saveDeliveryFeeSettings,
  DeliveryFeeSettings,
  formatOrderForCourier
} from '../../utils/courierUtils';
import { Order } from '../../types';

interface DeliverySettingsSectionProps {
  onSyncDeliveryToAI?: (deliveryText: string) => void;
}

export const DeliverySettingsSection: React.FC<DeliverySettingsSectionProps> = ({
  onSyncDeliveryToAI
}) => {
  const [selectedCourierId, setSelectedCourierId] = useState<string>(() => getDefaultCourierId());
  const [customUrl, setCustomUrl] = useState<string>(() => getCustomCourierUrl());

  // Credentials for active courier
  const [merchantId, setMerchantId] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [apiSecret, setApiSecret] = useState<string>('');
  const [pickupAddress, setPickupAddress] = useState<string>('');
  const [pickupPhone, setPickupPhone] = useState<string>('');

  // Delivery Charges & Times
  const [feeSettings, setFeeSettings] = useState<DeliveryFeeSettings>(() => getDeliveryFeeSettings());

  // Statuses & Live Connection Testing
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedTestParcel, setCopiedTestParcel] = useState(false);
  const [aiSyncSuccess, setAiSyncSuccess] = useState(false);
  const [backendSettings, setBackendSettings] = useState<Record<string, any>>({});
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{
    success: boolean;
    verified: boolean;
    message: string;
    balance?: number;
    error?: string;
  } | null>(null);

  // Load saved credentials from backend profile on mount
  useEffect(() => {
    api.getCourierSettings()
      .then((res) => {
        if (res?.courier_settings) {
          setBackendSettings(res.courier_settings);
          const savedDefault = res.defaultCourierId || res.courier_settings._default;
          if (savedDefault) {
            setSelectedCourierId(savedDefault);
            setDefaultCourierId(savedDefault);
          }
          const savedForCurrent = res.courier_settings[savedDefault || selectedCourierId];
          if (savedForCurrent) {
            if (savedForCurrent.merchantId) setMerchantId(savedForCurrent.merchantId);
            if (savedForCurrent.apiKey) setApiKey(savedForCurrent.apiKey);
            if (savedForCurrent.apiSecret) setApiSecret(savedForCurrent.apiSecret);
            if (savedForCurrent.pickupAddress) setPickupAddress(savedForCurrent.pickupAddress);
            if (savedForCurrent.pickupPhone || savedForCurrent.notes) {
              setPickupPhone(savedForCurrent.pickupPhone || savedForCurrent.notes);
            }
          }
        }
      })
      .catch((err) => console.warn('Could not load backend courier settings:', err));
  }, []);

  useEffect(() => {
    const backendCred = backendSettings[selectedCourierId];
    const localCred = getCourierCredentials(selectedCourierId);
    setMerchantId(backendCred?.merchantId || localCred.merchantId || '');
    setApiKey(backendCred?.apiKey || localCred.apiKey || '');
    setApiSecret(backendCred?.apiSecret || localCred.apiSecret || '');
    setPickupAddress(backendCred?.pickupAddress || localCred.pickupAddress || '');
    setPickupPhone(backendCred?.pickupPhone || backendCred?.notes || localCred.notes || '');
    setConnectionResult(null);
  }, [selectedCourierId]);

  const activeCourier = COURIER_PROVIDERS.find((c) => c.id === selectedCourierId) || COURIER_PROVIDERS[0];
  const portalUrl = selectedCourierId === 'custom' ? (customUrl || 'https://steadfast.com.bd') : activeCourier.portalUrl;

  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setDefaultCourierId(selectedCourierId);
    setCustomCourierUrl(customUrl);

    const credObj = {
      merchantId,
      apiKey,
      apiSecret,
      pickupAddress,
      notes: pickupPhone,
      pickupPhone,
      customUrl
    };

    saveCourierCredentials(selectedCourierId, credObj);
    saveDeliveryFeeSettings(feeSettings);

    // Save directly to backend database for seamless Live API parcel dispatch
    try {
      await api.saveCourierSettings(
        { [selectedCourierId]: credObj },
        selectedCourierId
      );
      setBackendSettings((prev) => ({
        ...prev,
        [selectedCourierId]: credObj,
        _default: selectedCourierId
      }));
    } catch (saveErr) {
      console.warn('Backend save courier settings warning:', saveErr);
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTestCourierConnection = async () => {
    if (!apiKey) {
      setConnectionResult({
        success: false,
        verified: false,
        message: '',
        error: 'অনুগ্রহ করে API Key প্রবেশ করান।'
      });
      return;
    }

    setTestingConnection(true);
    setConnectionResult(null);
    try {
      const res = await api.testCourierConnection(
        selectedCourierId,
        apiKey,
        apiSecret,
        merchantId
      );
      setConnectionResult(res);
    } catch (err: any) {
      setConnectionResult({
        success: false,
        verified: false,
        message: '',
        error: err.message || 'কানেকশন টেস্ট ব্যর্থ হয়েছে।'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSyncWithAI = () => {
    const deliveryRuleText = `Physical parcel delivery inside Dhaka: ${feeSettings.insideDhaka} BDT (${feeSettings.insideDhakaTime}). Outside Dhaka nationwide: ${feeSettings.outsideDhaka} BDT (${feeSettings.outsideDhakaTime}). Sub-urban express: ${feeSettings.subUrban} BDT. Free delivery on orders above ${feeSettings.freeDeliveryThreshold} BDT. Cash on Delivery (COD) available nationwide via ${activeCourier.name}.`;
    
    if (onSyncDeliveryToAI) {
      onSyncDeliveryToAI(deliveryRuleText);
      setAiSyncSuccess(true);
      setTimeout(() => setAiSyncSuccess(false), 3500);
    }
  };

  // Mock demo order for testing courier dispatch
  const demoOrder: Order = {
    id: 'ord_demo_test_' + Date.now().toString().slice(-4),
    user_id: 'merchant_user',
    customer_id: '01711223344',
    currency: 'BDT',
    customer_name: 'Tanvir Rahman',
    customer_phone: '01711223344',
    customer_address: 'House 14, Road 5, Sector 11, Uttara, Dhaka-1230',
    platform: 'whatsapp',
    items: 'Premium Polo T-Shirt (Navy Blue, Size L) x 2',
    quantity: 2,
    total_amount: 1750,
    payment_method: 'cod',
    payment_status: 'pending',
    status: 'processing',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    order_source: 'ai_detected'
  };

  const formattedTestParcel = formatOrderForCourier(demoOrder);

  const handleCopyTestParcel = async () => {
    try {
      await navigator.clipboard.writeText(formattedTestParcel);
      setCopiedTestParcel(true);
      setTimeout(() => setCopiedTestParcel(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Notification Banner */}
      <div className="p-5 rounded-2xl bg-[#7F22FE]/5 border border-[#7F22FE]/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7F22FE] text-white flex items-center justify-center shadow-md shadow-[#7F22FE]/25 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-neutral-900 dark:text-white">
              Delivery Apps & Courier Integration Settings
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Connect your Steadfast, Pathao, RedX, Paperfly, or custom courier accounts. 1-click parcel booking and automatic delivery charge calculation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#7F22FE]" />
            <span>Open {activeCourier.name} Portal</span>
          </a>
          <button
            type="button"
            onClick={() => handleSaveAll()}
            className="px-4 py-2 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white text-xs font-black shadow-md shadow-[#7F22FE]/25 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Step 1: Select Default Courier Partner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#7F22FE]">
            Step 1
          </span>
          <h3 className="text-sm font-black text-neutral-900 dark:text-white">
            Select Your Primary Courier Partner
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Orders in the Orders Hub will automatically be dispatched to this courier with 1 click.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {COURIER_PROVIDERS.map((courier) => {
            const isSelected = selectedCourierId === courier.id;
            return (
              <div
                key={courier.id}
                onClick={() => {
                  setSelectedCourierId(courier.id);
                  setDefaultCourierId(courier.id);
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#7F22FE] bg-[#7F22FE]/5 shadow-md shadow-[#7F22FE]/10'
                    : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center font-black text-xs">
                        {courier.logoCode}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-neutral-900 dark:text-white">
                          {courier.name}
                        </h4>
                        <span className="text-[10px] text-neutral-400">
                          {courier.bengaliName}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#7F22FE] text-white flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" />
                        Active
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2">
                    {courier.tagline}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between text-[11px]">
                  <a
                    href={courier.portalUrl || courier.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[#7F22FE] hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Login Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-neutral-400 text-[10px]">Nationwide COD</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Credentials & Hub Configuration for Selected Courier */}
      <form onSubmit={handleSaveAll} className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#7F22FE]">
            Step 2
          </span>
          <h3 className="text-sm font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <span>{activeCourier.name} Merchant Credentials</span>
            <span className="text-xs font-normal text-neutral-500">
              (Used for automatic parcel sync & order label generation)
            </span>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Find your API key and Merchant ID from your {activeCourier.name} Merchant Dashboard Settings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-neutral-400" />
              <span>Merchant ID / Store Code</span>
            </label>
            <input
              type="text"
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              placeholder="e.g. SF-84920 or PATHAO-001"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-neutral-400" />
              <span>API Key / Client Token</span>
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="••••••••••••••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
              <span>API Secret / Password</span>
            </label>
            <input
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              placeholder="••••••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-neutral-400" />
              <span>Merchant Pickup Phone Number</span>
            </label>
            <input
              type="text"
              value={pickupPhone}
              onChange={(e) => setPickupPhone(e.target.value)}
              placeholder="e.g. 01711223344"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              <span>Default Warehouse / Pickup Location Address</span>
            </label>
            <input
              type="text"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="e.g. House 12, Road 4, Dhanmondi, Dhaka-1209"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Live Courier Connection Test & Feedback */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={testingConnection}
              onClick={handleTestCourierConnection}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
              <span>{testingConnection ? 'কানেকশন টেস্ট হচ্ছে...' : `${activeCourier.name} লাইভ টেস্ট`}</span>
            </button>
            <span className="text-[11px] text-neutral-400">এপিআই সক্রিয় আছে কিনা পরীক্ষা করুন</span>
          </div>

          {connectionResult && (
            <div
              className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                connectionResult.verified
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {connectionResult.verified ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {connectionResult.message || 'কুরিয়ার কানেকশন সফল! লাইভ পার্সেল বুকিং সক্রিয়।'}
                    {connectionResult.balance !== undefined ? ` (ব্যালেন্স: ৳${connectionResult.balance})` : ''}
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{connectionResult.error || 'কানেকশন ব্যর্থ হয়েছে। API Key ও Secret যাচাই করুন।'}</span>
                </>
              )}
            </div>
          )}
        </div>
      </form>

      {/* Step 3: Delivery Charges & COD Configuration */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#7F22FE]">
              Step 3
            </span>
            <h3 className="text-sm font-black text-neutral-900 dark:text-white">
              Delivery Rates & Cash on Delivery (COD) Rules
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              These rates will be displayed on your stores and quoted automatically by your AI Chatbot.
            </p>
          </div>

          {onSyncDeliveryToAI && (
            <button
              type="button"
              onClick={handleSyncWithAI}
              className="px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 hover:bg-violet-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-500" />
              <span>{aiSyncSuccess ? 'Synced to AI Prompt!' : 'Sync Rates to AI Knowledge Base'}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-neutral-900 dark:text-white">
                Inside Dhaka
              </span>
              <span className="text-[10px] font-bold text-neutral-500">
                {feeSettings.insideDhakaTime}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-500">BDT</span>
              <input
                type="number"
                value={feeSettings.insideDhaka}
                onChange={(e) =>
                  setFeeSettings({ ...feeSettings, insideDhaka: Number(e.target.value) || 0 })
                }
                className="w-full px-3 py-1.5 text-sm font-black rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-neutral-900 dark:text-white">
                Outside Dhaka (Nationwide)
              </span>
              <span className="text-[10px] font-bold text-neutral-500">
                {feeSettings.outsideDhakaTime}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-500">BDT</span>
              <input
                type="number"
                value={feeSettings.outsideDhaka}
                onChange={(e) =>
                  setFeeSettings({ ...feeSettings, outsideDhaka: Number(e.target.value) || 0 })
                }
                className="w-full px-3 py-1.5 text-sm font-black rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-neutral-900 dark:text-white">
                Free Delivery Above
              </span>
              <span className="text-[10px] font-bold text-emerald-600">
                Promo Rule
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-500">BDT</span>
              <input
                type="number"
                value={feeSettings.freeDeliveryThreshold}
                onChange={(e) =>
                  setFeeSettings({
                    ...feeSettings,
                    freeDeliveryThreshold: Number(e.target.value) || 0
                  })
                }
                className="w-full px-3 py-1.5 text-sm font-black rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step 4: Live Dispatch Test & Verification */}
      <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#7F22FE]">
              Step 4: Test & Verify
            </span>
            <h3 className="text-sm font-black text-neutral-900 dark:text-white">
              Live Test: How Orders are Dispatched to {activeCourier.name}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Click test dispatch to see how customer address, phone number, and COD amounts are copied for fast courier booking.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyTestParcel}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            {copiedTestParcel ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-black">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Parcel Info</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 font-mono text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-line leading-relaxed shadow-xs">
          {formattedTestParcel}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-neutral-500">
            Ready to dispatch live customer orders? Visit your <strong>Orders Hub</strong> to ship orders with 1 click.
          </span>
          <a
            href={portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#7F22FE]/20"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open {activeCourier.name} Merchant Portal</span>
          </a>
        </div>
      </div>
    </div>
  );
};
