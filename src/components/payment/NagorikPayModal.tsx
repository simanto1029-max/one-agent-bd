import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  ArrowLeft,
  Tag,
  Landmark
} from 'lucide-react';
import { api } from '../../api';
import { Plan } from '../../types';

interface OneAgentPayGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: Plan | null;
  selectedPlan?: Plan | null;
  customAmount?: number;
  durationDays?: number;
  durationLabel?: string;
  initialMethod?: PaymentMethodKey | null;
  onSuccess: () => void;
}

export type PaymentMethodKey = 'bkash' | 'nagad' | 'rocket' | 'upay' | 'bank' | string;

export interface MethodThemeConfig {
  id: string;
  name: string;
  subLabel: string;
  dialCode: string;
  logoUrl: string;
  headerGradient: string;
  buttonBg: string;
  buttonHover: string;
  cardBg: string;
  cardBorder: string;
  cardHoverBorder: string;
  accentText: string;
  ringFocus: string;
  recipientNumber: string;
}

const DEFAULT_RECIPIENT = '01601705804';

// Official NagorikPay (pay.oneagentbd.online) Brand Logos & Color Themes
export const METHOD_THEMES: Record<string, MethodThemeConfig> = {
  bkash: {
    id: 'bkash',
    name: 'bKash',
    subLabel: 'Send Money',
    dialCode: '*247#',
    logoUrl:
      'https://nagorikpay.com/public/uploads/admin/1b6453892473a467d07372d45eb05abc2031647a/1754463881_e897226e32d5813c61ab.png',
    headerGradient: 'from-[#E2136E] to-[#B80D57]',
    buttonBg: 'bg-[#E2136E]',
    buttonHover: 'hover:bg-[#C81061]',
    cardBg: 'bg-[#FDF2F7] dark:bg-[#E2136E]/10',
    cardBorder: 'border-[#FBCFE8] dark:border-[#E2136E]/30',
    cardHoverBorder: 'hover:border-[#E2136E] dark:hover:border-[#E2136E]',
    accentText: 'text-[#E2136E] dark:text-[#F472B6]',
    ringFocus: 'focus:border-[#E2136E]',
    recipientNumber: DEFAULT_RECIPIENT
  },
  nagad: {
    id: 'nagad',
    name: 'Nagad',
    subLabel: 'Send Money',
    dialCode: '*167#',
    logoUrl:
      'https://nagorikpay.com/public/uploads/admin/1b6453892473a467d07372d45eb05abc2031647a/1738840242_e7581c47ba12f3604dde.png',
    headerGradient: 'from-[#F7941D] to-[#ED1C24]',
    buttonBg: 'bg-gradient-to-r from-[#F7941D] to-[#ED1C24]',
    buttonHover: 'hover:opacity-95',
    cardBg: 'bg-[#FFF7ED] dark:bg-[#F7941D]/10',
    cardBorder: 'border-[#FED7AA] dark:border-[#F7941D]/30',
    cardHoverBorder: 'hover:border-[#F7941D] dark:hover:border-[#F7941D]',
    accentText: 'text-[#EA580C] dark:text-[#FB923C]',
    ringFocus: 'focus:border-[#F7941D]',
    recipientNumber: DEFAULT_RECIPIENT
  },
  rocket: {
    id: 'rocket',
    name: 'Rocket',
    subLabel: 'Send Money',
    dialCode: '*322#',
    logoUrl:
      'https://nagorikpay.com/public/uploads/admin/1b6453892473a467d07372d45eb05abc2031647a/1755241437_e2ae12493845ffdbdc5a.png',
    headerGradient: 'from-[#8C3494] to-[#5E1B66]',
    buttonBg: 'bg-[#8C3494]',
    buttonHover: 'hover:bg-[#762A7D]',
    cardBg: 'bg-[#FAF5FF] dark:bg-[#8C3494]/15',
    cardBorder: 'border-[#E9D5FF] dark:border-[#8C3494]/35',
    cardHoverBorder: 'hover:border-[#8C3494] dark:hover:border-[#A855F7]',
    accentText: 'text-[#8C3494] dark:text-[#C084FC]',
    ringFocus: 'focus:border-[#8C3494]',
    recipientNumber: DEFAULT_RECIPIENT
  },
  upay: {
    id: 'upay',
    name: 'Upay',
    subLabel: 'Send Money',
    dialCode: '*268#',
    logoUrl:
      'https://nagorikpay.com/public/uploads/admin/1b6453892473a467d07372d45eb05abc2031647a/1754463980_74ba77ec797eed4134c9.png',
    headerGradient: 'from-[#0054A6] to-[#003B75]',
    buttonBg: 'bg-[#0054A6]',
    buttonHover: 'hover:bg-[#004282]',
    cardBg: 'bg-[#EFF6FF] dark:bg-[#0054A6]/15',
    cardBorder: 'border-[#BFDBFE] dark:border-[#0054A6]/35',
    cardHoverBorder: 'hover:border-[#0054A6] dark:hover:border-[#38BDF8]',
    accentText: 'text-[#0054A6] dark:text-[#60A5FA]',
    ringFocus: 'focus:border-[#0054A6]',
    recipientNumber: DEFAULT_RECIPIENT
  },
  bank: {
    id: 'bank',
    name: 'Bank',
    subLabel: 'Bank Transfer',
    dialCode: 'Bank',
    logoUrl: '',
    headerGradient: 'from-[#059669] to-[#047857]',
    buttonBg: 'bg-[#059669]',
    buttonHover: 'hover:bg-[#047857]',
    cardBg: 'bg-[#ECFDF5] dark:bg-[#059669]/15',
    cardBorder: 'border-[#A7F3D0] dark:border-[#059669]/35',
    cardHoverBorder: 'hover:border-[#059669] dark:hover:border-[#34D399]',
    accentText: 'text-[#059669] dark:text-[#34D399]',
    ringFocus: 'focus:border-[#059669]',
    recipientNumber: ''
  }
};

/**
 * Official Brand Logos directly from NagorikPay (pay.oneagentbd.online)
 */
export const GatewayBrandLogo: React.FC<{
  methodId: string;
  logoUrl?: string;
  size?: 'xs' | 'sm' | 'md';
}> = ({ methodId, logoUrl, size = 'md' }) => {
  const id = methodId.toLowerCase();
  const theme = METHOD_THEMES[id];
  const resolvedLogoUrl = logoUrl || theme?.logoUrl || '';

  const boxClass =
    size === 'xs'
      ? 'w-8 h-6 rounded-md p-0.5'
      : size === 'sm'
      ? 'w-11 h-9 rounded-xl p-1'
      : 'w-20 h-12 rounded-xl p-1.5';

  if (resolvedLogoUrl) {
    return (
      <div
        className={`${boxClass} bg-white border border-slate-200/80 dark:border-white/15 flex items-center justify-center shadow-2xs shrink-0 select-none overflow-hidden`}
      >
        <img
          src={resolvedLogoUrl}
          alt={theme?.name || id}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={`${boxClass} bg-gradient-to-br from-[#059669] to-[#047857] text-white flex items-center justify-center shadow-xs shrink-0 select-none`}
    >
      <Landmark className={size === 'xs' ? 'w-3.5 h-3.5' : 'w-5 h-5'} />
    </div>
  );
};

export const OneAgentPayGatewayModal: React.FC<OneAgentPayGatewayModalProps> = ({
  isOpen,
  onClose,
  plan,
  selectedPlan,
  customAmount,
  durationDays,
  durationLabel,
  initialMethod,
  onSuccess
}) => {
  const activePlan = plan || selectedPlan || null;

  const [step, setStep] = useState<'select' | 'pay' | 'success'>('select');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodKey>('bkash');
  const [transactionId, setTransactionId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    discountAmount: number;
    finalAmount: number;
    message: string;
  } | null>(null);

  // Live gateway session data synced 1:1 with NagorikPay (pay.oneagentbd.online)
  const [orderId, setOrderId] = useState<string>('');
  const [tmpId, setTmpId] = useState<string>('');
  const [recipientNumber, setRecipientNumber] = useState<string>(DEFAULT_RECIPIENT);
  const [methodNumbers, setMethodNumbers] = useState<Record<string, string>>({});
  const [methodLogos, setMethodLogos] = useState<Record<string, string>>({});
  // Only show the methods enabled in NagorikPay (currently bKash, Nagad, Rocket, Upay)
  const [dynamicMethods, setDynamicMethods] = useState<string[]>([
    'bkash',
    'nagad',
    'rocket',
    'upay'
  ]);

  // Verification status
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const baseAmount = customAmount || activePlan?.price || 1250;
  const effectiveAmount = appliedCoupon ? appliedCoupon.finalAmount : baseAmount;
  const effectiveDurationDays = durationDays || activePlan?.duration_days || 30;

  useEffect(() => {
    if (isOpen && activePlan) {
      if (initialMethod) {
        setSelectedMethod(initialMethod);
        setStep('pay');
      } else {
        setStep('select');
      }
      setTransactionId('');
      setErrorMsg(null);
      setCouponInput('');
      setCouponError(null);
      setAppliedCoupon(null);
      initGatewaySession(activePlan.id, customAmount || activePlan.price);
    }
  }, [isOpen, activePlan, customAmount, initialMethod]);

  const initGatewaySession = async (planId: string, amountToCharge: number) => {
    try {
      const res = await api.createGatewayCheckout(planId, {
        customAmount: amountToCharge,
        durationDays: effectiveDurationDays,
        durationLabel
      });
      if (res.orderId) setOrderId(res.orderId);
      if (res.tmpId) setTmpId(res.tmpId);
      if (res.recipientNumber) setRecipientNumber(res.recipientNumber);

      if (Array.isArray(res.methods) && res.methods.length > 0) {
        const numMap: Record<string, string> = {};
        const logoMap: Record<string, string> = {};
        const ids: string[] = [];
        for (const m of res.methods) {
          const key = String(m.id).toLowerCase();
          if (!ids.includes(key)) ids.push(key);
          if (m.recipientNumber) numMap[key] = m.recipientNumber;
          if (m.logoUrl) logoMap[key] = m.logoUrl;
        }
        setMethodNumbers(numMap);
        setMethodLogos(logoMap);
        // Strictly show ONLY the methods active in NagorikPay (pay.oneagentbd.online)
        setDynamicMethods(ids);
      }
    } catch {
      // Fallback to default active methods if gateway is unreachable
    }
  };

  if (!isOpen || !activePlan) return null;

  const getMethodTheme = (methodKey: string): MethodThemeConfig => {
    const clean = methodKey.toLowerCase();
    if (METHOD_THEMES[clean]) return METHOD_THEMES[clean];
    return {
      ...METHOD_THEMES.bank,
      id: clean,
      name: clean.toUpperCase()
    };
  };

  const activeConfig = getMethodTheme(selectedMethod);
  const displayRecipient =
    methodNumbers[selectedMethod.toLowerCase()] || recipientNumber || activeConfig.recipientNumber;

  const handleApplyCoupon = async () => {
    const clean = couponInput.trim().toUpperCase();
    if (!clean) {
      setCouponError('Enter a coupon code');
      return;
    }

    try {
      setApplyingCoupon(true);
      setCouponError(null);
      const res = await api.applyCoupon(clean, baseAmount, activePlan.id);
      if (res.valid) {
        setAppliedCoupon({
          code: res.coupon.code,
          discount_type: res.coupon.discount_type,
          discount_value: res.coupon.discount_value,
          discountAmount: res.discountAmount,
          finalAmount: res.finalAmount,
          message: res.message
        });
        await initGatewaySession(activePlan.id, res.finalAmount);
      } else {
        setAppliedCoupon(null);
        setCouponError((res as any).error || res.message || 'Invalid coupon code');
      }
    } catch (err: any) {
      setAppliedCoupon(null);
      setCouponError(err.message || 'Invalid coupon code');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
    await initGatewaySession(activePlan.id, baseAmount);
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(displayRecipient);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(String(effectiveAmount));
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleMethodPick = (method: PaymentMethodKey) => {
    setSelectedMethod(method);
    setErrorMsg(null);
    setStep('pay');
  };

  const handleVerifyPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTrx = transactionId.trim().toUpperCase();
    if (!cleanTrx || cleanTrx.length < 4) {
      setErrorMsg('Please enter a valid Transaction ID.');
      return;
    }

    try {
      setVerifying(true);
      setErrorMsg(null);

      const res = await api.verifyGatewayTransaction(cleanTrx, activePlan.id, {
        method: selectedMethod,
        orderId,
        tmpId,
        customAmount: effectiveAmount,
        durationDays: effectiveDurationDays,
        durationLabel,
        couponCode: appliedCoupon?.code,
        discountAmount: appliedCoupon?.discountAmount
      });

      if (res.verified) {
        setStep('success');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1600);
      } else {
        setErrorMsg(res.error || res.message || 'Invalid Transaction ID.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid Transaction ID.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-[400px] rounded-3xl bg-white dark:bg-[#130D2E] border border-slate-200 dark:border-purple-500/25 shadow-2xl overflow-hidden text-slate-900 dark:text-white">
        {/* Clean Minimal Top Bar */}
        <div
          className={`px-5 py-4 flex items-center justify-between ${
            step === 'pay'
              ? `bg-gradient-to-r ${activeConfig.headerGradient} text-white`
              : 'bg-slate-900 dark:bg-[#191138] text-white border-b border-slate-800 dark:border-purple-500/20'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {step === 'pay' && (
              <button
                type="button"
                onClick={() => {
                  setStep('select');
                  setErrorMsg(null);
                }}
                className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            {step === 'pay' ? (
              <GatewayBrandLogo
                methodId={selectedMethod}
                logoUrl={methodLogos[selectedMethod.toLowerCase()]}
                size="sm"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-[#7C3AED] flex items-center justify-center font-black text-xs">
                OA
              </div>
            )}
            <div>
              <h3 className="text-sm font-extrabold tracking-tight">
                {step === 'pay' ? `${activeConfig.name} Payment` : activePlan.name}
              </h3>
              <p className="text-[11px] text-white/80 font-medium">
                TK {effectiveAmount.toLocaleString()} {durationLabel ? `• ${durationLabel}` : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: LIVE NAGORIKPAY (pay.oneagentbd.online) SYNCED GATEWAY GRID */}
        {step === 'select' && (
          <div className="p-5 space-y-4">
            {/* Compact Amount + Coupon Row */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#191138] border border-slate-200/80 dark:border-purple-500/20">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Payable Amount
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    ৳{effectiveAmount.toLocaleString()}
                  </span>
                  {appliedCoupon && (
                    <span className="text-xs text-slate-400 line-through font-semibold">
                      ৳{baseAmount.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {!appliedCoupon ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      if (couponError) setCouponError(null);
                    }}
                    placeholder="Coupon"
                    className="w-24 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-purple-500/25 bg-white dark:bg-[#130D2E] text-xs font-bold uppercase text-slate-900 dark:text-white placeholder:normal-case placeholder:font-normal focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon || !couponInput.trim()}
                    className="px-3 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 text-white text-xs font-bold cursor-pointer"
                  >
                    {applyingCoupon ? '...' : 'Apply'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
                  <Tag className="w-3 h-3 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    {appliedCoupon.code}
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[10px] font-bold text-rose-500 ml-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {couponError && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold -mt-2 px-1">
                {couponError}
              </p>
            )}

            {/* Official NagorikPay Methods Grid (Synced 1:1 with pay.oneagentbd.online) */}
            <div className="grid grid-cols-2 gap-3">
              {dynamicMethods.map((key) => {
                const m = getMethodTheme(key);
                const liveLogo = methodLogos[key.toLowerCase()];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleMethodPick(key)}
                    className={`flex-col py-4 px-3 rounded-2xl border ${m.cardBg} ${m.cardBorder} ${m.cardHoverBorder} transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs hover:scale-[1.01]`}
                  >
                    <GatewayBrandLogo methodId={key} logoUrl={liveLogo} size="md" />
                    <span className={`text-sm font-black block ${m.accentText}`}>
                      {m.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: ULTRA-CLEAN BRAND-COLORED PAYMENT SCREEN */}
        {step === 'pay' && (
          <form onSubmit={handleVerifyPayment} className="p-5 space-y-4">
            {/* Number + Amount Copy Box in Method Brand Style */}
            <div
              className={`p-4 rounded-2xl border ${activeConfig.cardBg} ${activeConfig.cardBorder} space-y-3`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md ${activeConfig.buttonBg} text-white text-[11px] font-black uppercase tracking-wider shadow-2xs`}
                    >
                      Send Money
                    </span>
                    <span className={`text-xs font-extrabold ${activeConfig.accentText}`}>
                      {activeConfig.name} Number
                    </span>
                  </div>
                  <span className="text-xl font-black text-slate-900 dark:text-white tracking-wide block">
                    {displayRecipient}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className={`px-3 py-1.5 rounded-xl ${activeConfig.buttonBg} ${activeConfig.buttonHover} text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs`}
                >
                  {copiedNumber ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2.5 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Amount
                  </span>
                  <span className={`text-base font-black ${activeConfig.accentText}`}>
                    ৳{effectiveAmount.toLocaleString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAmount}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  {copiedAmount ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Amount</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Clean Transaction ID Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Transaction ID (TrxID)
              </label>
              <input
                type="text"
                required
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                placeholder="Enter TrxID"
                className={`w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-purple-500/25 bg-slate-50 dark:bg-[#191138] text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white placeholder:normal-case placeholder:font-normal placeholder:tracking-normal focus:outline-hidden ${activeConfig.ringFocus}`}
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/70 flex items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={verifying}
              className={`w-full py-3.5 px-5 rounded-2xl ${activeConfig.buttonBg} ${activeConfig.buttonHover} disabled:opacity-60 text-white font-extrabold text-xs tracking-wide shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer`}
            >
              {verifying ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify {activeConfig.name} Payment</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: SUCCESS SCREEN */}
        {step === 'success' && (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">
              Payment Verified!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your plan is now active.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
