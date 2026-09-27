// Official Gateway Service for pay.oneagentbd.online
// Uses the merchant's Brand Key to create payment sessions, fetch live wallet numbers,
// and verify Transaction IDs in real-time.

const BRAND_KEY =
  process.env.PAYMENT_GATEWAY_BRAND_KEY ||
  'hlE6za14GyScnLWj0GXYaQU1Czvl8UOIhCcmh36wEMztVncmHI';
const CREATE_ENDPOINT = 'https://secure-pay.nagorikpay.com/api/payment/create';
const VERIFY_ENDPOINT = 'https://secure-pay.nagorikpay.com/api/payment/verify';
const GATEWAY_ORIGIN = 'https://pay.oneagentbd.online';

export interface GatewayVerificationResult {
  verified: boolean;
  status: 'completed' | 'pending' | 'failed';
  message: string;
  gatewayResponse?: any;
}

export interface CreateGatewaySessionInput {
  userId?: string;
  planId?: string;
  customerName: string;
  customerEmail?: string;
  amount: number;
  successUrl: string;
  cancelUrl: string;
  webhookUrl: string;
  orderId: string;
}

export interface GatewayMethodInfo {
  id: string;
  name: string;
  logoUrl: string;
  recipientNumber: string;
  dialCode: string;
  type?: 'mobile' | 'bank';
}

const OFFICIAL_NAGORIKPAY_LOGOS: Record<string, string> = {
  bkash: 'https://nagorikpay.com/public/uploads/admin/1b6453892473a467d07372d45eb05abc2031647a/1754463881_e897226e32d5813c61ab.png',
  nagad: 'https://nagorikpay.com/public/uploads/admin/1b6453892473a467d07372d45eb05abc2031647a/1738840242_e7581c47ba12f3604dde.png',
  rocket: 'https://nagorikpay.com/public/uploads/admin/1b6453892473a467d07372d45eb05abc2031647a/1755241437_e2ae12493845ffdbdc5a.png',
  upay: 'https://nagorikpay.com/public/uploads/admin/1b6453892473a467d07372d45eb05abc2031647a/1754463980_74ba77ec797eed4134c9.png'
};

const DIAL_CODES: Record<string, string> = {
  bkash: '*247#',
  nagad: '*167#',
  rocket: '*322#',
  upay: '*268#'
};

const DISPLAY_NAMES: Record<string, string> = {
  bkash: 'bKash',
  nagad: 'Nagad',
  rocket: 'Rocket',
  upay: 'Upay'
};

export interface CreateGatewaySessionResult {
  success: boolean;
  paymentUrl?: string;
  orderId: string;
  tmpId?: string;
  recipientNumber?: string;
  methods?: GatewayMethodInfo[];
  error?: string;
}

interface CachedGatewaySession {
  orderId: string;
  userId?: string;
  planId?: string;
  amount: number;
  paymentUrl: string;
  tmpId: string;
  accTp: string;
  cookie: string;
  csrfToken: string;
  recipientNumber: string;
  methodRecipients?: Record<
    string,
    { number: string; accTp: string; logoUrl?: string; type: 'mobile' | 'bank' }
  >;
  createdAt: number;
}

const activeGatewaySessions = new Map<string, CachedGatewaySession>();

function extractCookies(res: Response, existingCookie = ''): string {
  const cookieMap = new Map<string, string>();
  if (existingCookie) {
    existingCookie.split(';').forEach((pair) => {
      const [k, ...v] = pair.trim().split('=');
      if (k && v.length > 0) cookieMap.set(k.trim(), v.join('=').trim());
    });
  }

  let setCookieHeaders: string[] = [];
  if (typeof (res.headers as any).getSetCookie === 'function') {
    setCookieHeaders = (res.headers as any).getSetCookie();
  } else {
    const raw = res.headers.get('set-cookie');
    if (raw) setCookieHeaders = [raw];
  }

  for (const hdr of setCookieHeaders) {
    const firstPart = hdr.split(';')[0];
    if (firstPart) {
      const [k, ...v] = firstPart.trim().split('=');
      if (k && v.length > 0) {
        cookieMap.set(k.trim(), v.join('=').trim());
      }
    }
  }

  return Array.from(cookieMap.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}

/**
 * Creates an official automated checkout session via pay.oneagentbd.online
 * and fetches the live merchant wallet number & session details.
 */
export async function createPaymentSessionWithGateway(
  input: CreateGatewaySessionInput
): Promise<CreateGatewaySessionResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 14000);

    const payload = {
      cus_name: input.customerName || 'Valued Merchant',
      cus_email: input.customerEmail || 'merchant@oneagentbd.online',
      amount: String(Math.round(input.amount)),
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      webhook_url: input.webhookUrl,
      order_id: input.orderId
    };

    const response = await fetch(CREATE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-KEY': BRAND_KEY
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data: any = await response.json().catch(() => null);

    if (data?.status === 1 && data?.payment_url) {
      const paymentUrl: string = data.payment_url;
      const tmpMatch = paymentUrl.match(/\/execute\/([a-zA-Z0-9]+)/);
      const tmpId = tmpMatch ? tmpMatch[1] : '';

      let cookie = '';
      let accTp = 'zobcyxkv';
      let csrfToken = '';
      let recipientNumber = '01601705804';
      const methodRecipients: Record<
        string,
        { number: string; accTp: string; logoUrl: string; type: 'mobile' | 'bank' }
      > = {};

      if (tmpId) {
        try {
          // 1. Load main execute page from pay.oneagentbd.online to discover ONLY the methods enabled in NagorikPay and their official logos
          const execRes = await fetch(paymentUrl, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          cookie = extractCookies(execRes);
          const execHtml = await execRes.text();

          const blockRegex =
            /execute_payment\/([a-zA-Z0-9_-]+)\/[a-zA-Z0-9]+\?acc_tp=([a-zA-Z0-9_]+)[\s\S]*?<img\s+src="([^"]+)"/g;
          const blockMatches = Array.from(execHtml.matchAll(blockRegex));

          if (blockMatches.length > 0) {
            for (const m of blockMatches) {
              const mSlug = m[1].toLowerCase();
              const mAccTp = m[2];
              const mLogo = m[3];
              if (!accTp || mSlug === 'bkash') {
                accTp = mAccTp;
              }
              const isBank =
                !['bkash', 'nagad', 'rocket', 'upay', 'tap', 'cellfin'].includes(mSlug) ||
                mSlug.includes('bank');
              methodRecipients[mSlug] = {
                number: '',
                accTp: mAccTp,
                logoUrl: mLogo || OFFICIAL_NAGORIKPAY_LOGOS[mSlug] || '',
                type: isBank ? 'bank' : 'mobile'
              };
            }
          } else {
            // Fallback regex if img tag order differs
            const allMatches = Array.from(
              execHtml.matchAll(
                /execute_payment\/([a-zA-Z0-9_-]+)\/[a-zA-Z0-9]+\?acc_tp=([a-zA-Z0-9_]+)/g
              )
            );
            for (const m of allMatches) {
              const mSlug = m[1].toLowerCase();
              const mAccTp = m[2];
              if (!accTp || mSlug === 'bkash') {
                accTp = mAccTp;
              }
              const isBank =
                !['bkash', 'nagad', 'rocket', 'upay', 'tap', 'cellfin'].includes(mSlug) ||
                mSlug.includes('bank');
              methodRecipients[mSlug] = {
                number: '',
                accTp: mAccTp,
                logoUrl: OFFICIAL_NAGORIKPAY_LOGOS[mSlug] || '',
                type: isBank ? 'bank' : 'mobile'
              };
            }
          }

          // 2. Fetch live recipient numbers for each discovered NagorikPay method in parallel
          const discoveredSlugs = Object.keys(methodRecipients);

          await Promise.allSettled(
            discoveredSlugs.map(async (slug) => {
              const targetAccTp = methodRecipients[slug]?.accTp || accTp;
              const methodUrl = `${GATEWAY_ORIGIN}/api/execute_payment/${slug}/${tmpId}?acc_tp=${targetAccTp}`;
              const methodRes = await fetch(methodUrl, {
                method: 'GET',
                headers: {
                  Cookie: cookie,
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
              });
              cookie = extractCookies(methodRes, cookie);
              const methodHtml = await methodRes.text();

              const numMatch = methodHtml.match(/data-clipboard-text="([^"]+)"/);
              const foundNum = numMatch && numMatch[1] ? numMatch[1].trim() : '';

              if (slug === 'bkash' && foundNum) {
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
          console.warn('[pay.oneagentbd.online] Session metadata fetch note:', scrapeErr);
        }

        const sessionObj: CachedGatewaySession = {
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

      // Build methods array strictly from what is active in NagorikPay (pay.oneagentbd.online)
      const discoveredSlugs = Object.keys(methodRecipients);
      const activeSlugs =
        discoveredSlugs.length > 0 ? discoveredSlugs : ['bkash', 'nagad', 'rocket', 'upay'];

      const methods: GatewayMethodInfo[] = activeSlugs.map((slug) => {
        const info = methodRecipients[slug];
        return {
          id: slug,
          name: DISPLAY_NAMES[slug] || slug.charAt(0).toUpperCase() + slug.slice(1),
          logoUrl: info?.logoUrl || OFFICIAL_NAGORIKPAY_LOGOS[slug] || '',
          recipientNumber: info?.number || recipientNumber,
          dialCode: DIAL_CODES[slug] || (info?.type === 'bank' ? 'Bank Transfer' : 'Mobile App'),
          type: info?.type || 'mobile'
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

    const errMsg = data?.message || 'Failed to initialize pay.oneagentbd.online payment session';
    return {
      success: false,
      orderId: input.orderId,
      error: errMsg
    };
  } catch (error: any) {
    console.error('[pay.oneagentbd.online] Payment creation failed:', error.message || error);
    return {
      success: false,
      orderId: input.orderId,
      error: error.message || 'Payment gateway connection error'
    };
  }
}

/**
 * Submits the user's Transaction ID to the active pay.oneagentbd.online session
 * and verifies whether the payment actually matches in real-time.
 */
export async function submitAndVerifyGatewayTransaction(params: {
  orderId?: string;
  tmpId?: string;
  method: 'bkash' | 'nagad' | 'rocket' | 'upay' | 'bank' | string;
  transactionId: string;
  amount: number;
  customerName?: string;
  customerEmail?: string;
  baseUrl?: string;
}): Promise<GatewayVerificationResult> {
  const cleanRef = params.transactionId.trim().toUpperCase();
  const method = params.method || 'bkash';
  const isBank = method === 'bank' || method.includes('bank');

  try {
    // 1. Find or create gateway session
    let session =
      (params.orderId && activeGatewaySessions.get(params.orderId)) ||
      (params.tmpId && activeGatewaySessions.get(params.tmpId));

    if (!session) {
      const fallbackOrderId = params.orderId || `OAB-${Date.now()}`;
      const base = params.baseUrl || 'https://pay.oneagentbd.online';
      const created = await createPaymentSessionWithGateway({
        customerName: params.customerName || 'Valued Merchant',
        customerEmail: params.customerEmail || 'merchant@oneagentbd.online',
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
      // Refresh CSRF token for the chosen method page
      const methodPageUrl = `${GATEWAY_ORIGIN}/api/execute_payment/${method}/${session.tmpId}?acc_tp=${targetAccTp}`;
      const pageRes = await fetch(methodPageUrl, {
        method: 'GET',
        headers: {
          Cookie: session.cookie,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
        t_type: isBank ? 'bank' : 'mobile',
        acc_tp: targetAccTp,
        screenshot: ''
      }).toString();

      const saveRes = await fetch(saveUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          Cookie: session.cookie,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: formBody
      });

      session.cookie = extractCookies(saveRes, session.cookie);
      const saveJson: any = await saveRes.json().catch(() => null);

      const isSaveSuccess =
        saveJson?.status === 'success' ||
        saveJson?.status === 'completed' ||
        saveJson?.status === 1 ||
        Boolean(saveJson?.redirect && !String(saveJson.redirect).includes('cancel'));

      if (isSaveSuccess) {
        return {
          verified: true,
          status: 'completed',
          message: 'পেমেন্ট সফলভাবে যাচাই হয়েছে! আপনার সাবস্ক্রিপশন প্ল্যান অটোমেটিক অ্যাক্টিভ হয়ে গেছে।',
          gatewayResponse: saveJson
        };
      }

      // Also double check with direct verify API in case the TrxID was already settled
      const directVerify = await verifyTransactionWithGateway(cleanRef, params.amount);
      if (directVerify.verified) {
        return directVerify;
      }

      return {
        verified: false,
        status: 'failed',
        message:
          saveJson?.message ||
          'দুঃখিত, আপনার Transaction ID টি খুঁজে পাওয়া যায়নি। সঠিক পরিমাণ টাকা সেন্ড মানি করে সঠিক Transaction ID দিয়ে আবার চেষ্টা করুন।',
        gatewayResponse: saveJson
      };
    }

    // Fallback to direct verify endpoint
    const directVerify = await verifyTransactionWithGateway(cleanRef, params.amount);
    if (directVerify.verified) {
      return directVerify;
    }

    return {
      verified: false,
      status: 'failed',
      message:
        'দুঃখিত, আপনার Transaction ID টি মেলেনি। দয়া করে সঠিক পরিমাণ টাকা পাঠিয়ে সঠিক Transaction ID দিন।'
    };
  } catch (error: any) {
    console.error('[pay.oneagentbd.online] Transaction verification error:', error);
    return {
      verified: false,
      status: 'failed',
      message: 'পেমেন্ট যাচাই করতে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।'
    };
  }
}

/**
 * Verifies a transaction reference with the payment gateway using the merchant's Brand Key.
 * Whitelabel: All client facing logs and outputs refer strictly to "pay.oneagentbd.online".
 */
export async function verifyTransactionWithGateway(
  transactionReference: string,
  amount?: number
): Promise<GatewayVerificationResult> {
  const cleanRef = transactionReference.trim().toUpperCase();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(VERIFY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-KEY': BRAND_KEY
      },
      body: JSON.stringify({
        transaction_id: cleanRef,
        tran_id: cleanRef,
        amount: amount ? Number(amount) : undefined
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data: any = await response.json().catch(() => null);

    // Check gateway status indicators
    const isCompleted =
      data?.status === 1 ||
      data?.status === 'completed' ||
      data?.status === 'success' ||
      data?.status === 'successful' ||
      data?.payment_status === 'completed' ||
      data?.data?.status === 'completed' ||
      data?.data?.status === 'success';

    if (isCompleted) {
      // If amount was specified and gateway returned an amount, verify it matches
      const gatewayAmount = Number(data?.amount || data?.paymentAmount || data?.data?.amount || 0);
      if (amount && gatewayAmount > 0 && Math.abs(gatewayAmount - Number(amount)) > 1) {
        return {
          verified: false,
          status: 'failed',
          message: `প্রদত্ত টাকার পরিমাণ মেলেনি (প্রয়োজন ৳${amount}, পাওয়া গেছে ৳${gatewayAmount})।`,
          gatewayResponse: data
        };
      }

      return {
        verified: true,
        status: 'completed',
        message: 'Payment verified and confirmed by pay.oneagentbd.online!',
        gatewayResponse: data
      };
    }

    return {
      verified: false,
      status: 'failed',
      message:
        data?.message && data.message !== 'failed'
          ? data.message
          : 'দুঃখিত, আপনার Transaction ID টি খুঁজে পাওয়া যায়নি। সঠিক Transaction ID দিয়ে আবার চেষ্টা করুন।',
      gatewayResponse: data
    };
  } catch (error: any) {
    console.warn('[pay.oneagentbd.online] Verification query note:', error.message || error);
    return {
      verified: false,
      status: 'failed',
      message: 'নেটওয়ার্ক সমস্যার কারণে যাচাই করা যায়নি। আবার চেষ্টা করুন।'
    };
  }
}
