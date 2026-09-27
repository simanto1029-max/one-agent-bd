import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { getAuthenticatedUser } from './auth.js';
import {
  submitManualPayment,
  approvePayment,
  rejectPayment,
  autoApprovePayment
} from '../services/paymentService.js';
import {
  verifyTransactionWithGateway,
  createPaymentSessionWithGateway,
  submitAndVerifyGatewayTransaction
} from '../services/gatewayService.js';

export const paymentsRouter = Router();

// POST /api/payments/apply-coupon - Validate and calculate coupon discount for checkout
paymentsRouter.post('/apply-coupon', (req: Request, res: Response) => {
  try {
    const { code, amount } = req.body;
    const cleanCode = String(code || '').trim().toUpperCase();
    const baseAmount = Number(amount || 0);

    if (!cleanCode) {
      return res.status(200).json({ valid: false, error: 'Please enter a coupon code.' });
    }

    const coupon = db.getCouponByCode(cleanCode);
    if (!coupon) {
      return res.status(200).json({ valid: false, error: 'Invalid coupon code.' });
    }

    if (coupon.expires_at && new Date(coupon.expires_at).getTime() <= Date.now()) {
      if (coupon.is_active) {
        db.updateCoupon(coupon.id, { is_active: false });
      }
      return res.status(200).json({
        valid: false,
        error: coupon.code.startsWith('AI15-')
          ? 'This coupon code has expired (45-minute validity limit ended).'
          : 'This coupon code has expired and is no longer valid.'
      });
    }

    if (!coupon.is_active) {
      return res.status(200).json({ valid: false, error: 'This coupon code is no longer active.' });
    }

    if (coupon.max_uses && coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses) {
      return res.status(200).json({ valid: false, error: 'This coupon code has reached its usage limit.' });
    }

    if (coupon.min_amount && baseAmount < coupon.min_amount) {
      return res.status(200).json({
        valid: false,
        error: `Minimum order amount of ${coupon.min_amount.toLocaleString()} TK required for this coupon.`
      });
    }

    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.round((baseAmount * coupon.discount_value) / 100);
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
      message:
        coupon.discount_type === 'percentage'
          ? `Coupon ${coupon.code} applied! You saved ${coupon.discount_value}% (${discountAmount.toLocaleString()} TK).`
          : `Coupon ${coupon.code} applied! You saved ${discountAmount.toLocaleString()} TK.`
    });
  } catch (err: any) {
    return res.status(400).json({ valid: false, error: err.message || 'Failed to apply coupon' });
  }
});

// POST /api/payments/gateway-create - Initiate official payment session via pay.oneagentbd.online
paymentsRouter.post('/gateway-create', async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { planId, customAmount, durationDays, durationLabel } = req.body;
    if (!planId) {
      return res.status(400).json({ error: 'Plan ID is required' });
    }

    const plan = db.getPlanById(planId) || db.getPlans()[0];
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const finalAmount = customAmount ? Number(customAmount) : plan.price;
    const finalPlanName = durationLabel ? `${plan.name} (${durationLabel})` : plan.name;

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;

    const orderId = `OAB-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const session = await createPaymentSessionWithGateway({
      userId: user.id,
      planId: plan.id,
      customerName: user.full_name || 'Valued Merchant',
      customerEmail: user.email,
      amount: finalAmount,
      successUrl: `${baseUrl}/api/payments/gateway-callback?status=success&order_id=${encodeURIComponent(orderId)}&plan_id=${encodeURIComponent(plan.id)}&user_id=${encodeURIComponent(user.id)}`,
      cancelUrl: `${baseUrl}/api/payments/gateway-callback?status=cancel&order_id=${encodeURIComponent(orderId)}`,
      webhookUrl: `${baseUrl}/api/payments/gateway-webhook`,
      orderId
    });

    if (!session.success || !session.paymentUrl) {
      return res.status(400).json({
        error: session.error || 'Failed to generate pay.oneagentbd.online checkout session.'
      });
    }

    return res.json({
      success: true,
      paymentUrl: session.paymentUrl,
      orderId,
      tmpId: session.tmpId,
      recipientNumber: session.recipientNumber || '01601705804',
      methods: session.methods || [],
      amount: finalAmount,
      durationDays: durationDays ? Number(durationDays) : plan.duration_days,
      planName: finalPlanName
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Gateway checkout initiation failed' });
  }
});

// GET /api/payments/gateway-callback - Return redirect from pay.oneagentbd.online
paymentsRouter.get('/gateway-callback', async (req: Request, res: Response) => {
  const status = req.query.status as string;
  const orderId = req.query.order_id as string;
  const planId = req.query.plan_id as string;
  const userId = req.query.user_id as string;
  const tranId = (req.query.transaction_id || req.query.tran_id || req.query.transactionId) as string;

  const host = req.get('host') || 'localhost:3000';
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const baseUrl = `${protocol}://${host}`;

  if (status === 'cancel') {
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
      method: 'bkash',
      transactionReference: tranId || orderId || `TX-${Date.now()}`,
      notes: 'Auto-verified via pay.oneagentbd.online'
    });
  }

  if (payment) {
    approvePayment(payment.id, 'pay.oneagentbd.online_auto_approval');
    return res.redirect(
      `${baseUrl}/?tab=billing&payment_result=success&plan_id=${payment.plan_id}&tran_id=${encodeURIComponent(
        tranId || payment.transaction_reference
      )}`
    );
  }

  return res.redirect(`${baseUrl}/?tab=billing&payment_result=success`);
});

// POST /api/payments/gateway-webhook - IPN notification from pay.oneagentbd.online
paymentsRouter.post('/gateway-webhook', async (req: Request, res: Response) => {
  try {
    const { transactionId, transaction_id, tran_id, status, order_id } = req.body;
    const finalTranId = transactionId || transaction_id || tran_id;
    const isCompleted =
      status === 'completed' || status === 'success' || status === 1 || status === '1';

    if (finalTranId && isCompleted) {
      const existing = db
        .getPayments()
        .find(
          (p) =>
            p.transaction_reference === finalTranId || (order_id && p.transaction_reference === order_id)
        );

      if (existing && existing.status !== 'approved') {
        approvePayment(existing.id, 'pay.oneagentbd.online_ipn_webhook');
      }
    }

    return res.status(200).json({ status: 'ok', received: true });
  } catch (err: any) {
    console.error('[pay.oneagentbd.online] Webhook error:', err);
    return res.status(200).json({ status: 'error', error: err.message });
  }
});

// POST /api/payments/gateway-verify - Live Transaction ID verification & auto plan purchase
paymentsRouter.post('/gateway-verify', async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
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
      return res.status(400).json({ error: 'Please enter your Transaction ID (TrxID).' });
    }

    const cleanRef = String(transactionReference).trim().toUpperCase();

    // Prevent reuse of an already approved Transaction ID
    const alreadyUsed = db
      .getPayments()
      .find((p) => p.transaction_reference.toUpperCase() === cleanRef && p.status === 'approved');
    if (alreadyUsed) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'This Transaction ID has already been used. Please provide a valid new Transaction ID.'
      });
    }

    const targetPlan = db.getPlanById(planId) || db.getPlans()[0];
    const finalAmount = customAmount ? Number(customAmount) : targetPlan.price;
    const finalDurationDays = durationDays ? Number(durationDays) : targetPlan.duration_days;

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;

    const verification = await submitAndVerifyGatewayTransaction({
      orderId,
      tmpId,
      method: (method || 'bkash').toLowerCase() as any,
      transactionId: cleanRef,
      amount: finalAmount,
      customerName: user.full_name,
      customerEmail: user.email,
      baseUrl
    });

    if (verification.verified) {
      let payment = db.getPayments().find((p) => p.transaction_reference.toUpperCase() === cleanRef);
      const normalizedMethod = ['bkash', 'nagad', 'rocket', 'upay', 'bank'].includes(
        String(method || '').toLowerCase()
      )
        ? (String(method).toLowerCase() as 'bkash' | 'nagad' | 'rocket' | 'upay' | 'bank')
        : 'bkash';
      if (!payment) {
        payment = submitManualPayment({
          userId: user.id,
          planId: targetPlan.id,
          amount: finalAmount,
          couponCode: couponCode ? String(couponCode).trim().toUpperCase() : undefined,
          discountAmount: discountAmount ? Number(discountAmount) : undefined,
          durationDays: finalDurationDays,
          durationLabel,
          method: normalizedMethod,
          transactionReference: cleanRef,
          notes: `Auto-verified via pay.oneagentbd.online (${normalizedMethod.toUpperCase()})${
            durationLabel ? ` — ${durationLabel}` : ''
          }${couponCode ? ` [Coupon: ${couponCode}]` : ''}`
        });
      }

      const approval = approvePayment(payment.id, 'pay.oneagentbd.online_auto_verify');
      return res.json({
        success: true,
        verified: true,
        payment: approval.payment,
        message: 'Payment verified successfully and your subscription plan has been activated!'
      });
    }

    // Log as a pending payment so Admin can 1-click Approve it from Admin Panel if SMS sync was delayed
    const normalizedMethod = ['bkash', 'nagad', 'rocket', 'upay', 'bank'].includes(
      String(method || '').toLowerCase()
    )
      ? (String(method).toLowerCase() as 'bkash' | 'nagad' | 'rocket' | 'upay' | 'bank')
      : 'bkash';

    const existingPending = db
      .getPayments()
      .find((p) => p.transaction_reference.toUpperCase() === cleanRef && p.user_id === user.id);

    if (!existingPending) {
      submitManualPayment({
        userId: user.id,
        planId: targetPlan.id,
        amount: finalAmount,
        couponCode: couponCode ? String(couponCode).trim().toUpperCase() : undefined,
        discountAmount: discountAmount ? Number(discountAmount) : undefined,
        durationDays: finalDurationDays,
        durationLabel,
        method: normalizedMethod,
        transactionReference: cleanRef,
        notes: `Unmatched TrxID (${normalizedMethod.toUpperCase()}) — Available for Admin 1-Click Manual Approval${
          durationLabel ? ` [${durationLabel}]` : ''
        }`
      });
    }

    return res.status(200).json({
      success: false,
      verified: false,
      error:
        verification.message ||
        'Invalid Transaction ID! Could not verify your payment automatically. If you have already sent the money, please contact support or wait for admin approval.',
      message:
        verification.message ||
        'Invalid Transaction ID! Could not verify your payment automatically. If you have already sent the money, please contact support or wait for admin approval.'
    });
  } catch (err: any) {
    return res.status(200).json({
      success: false,
      verified: false,
      error: err.message || 'Verification failed'
    });
  }
});

// POST /api/payments - User submits payment via pay.oneagentbd.online
paymentsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { planId, amount, method, transactionReference, senderNumber, notes } = req.body;
    if (!planId || !amount || !transactionReference) {
      return res.status(400).json({ error: 'Plan ID, amount, and Transaction ID are required' });
    }

    const payment = submitManualPayment({
      userId: user.id,
      planId,
      amount: Number(amount),
      method: method || 'bkash',
      transactionReference,
      senderNumber,
      notes: notes || 'Submitted via pay.oneagentbd.online'
    });

    // Attempt live auto-verification via gateway Brand Key
    const verification = await verifyTransactionWithGateway(transactionReference, Number(amount));

    if (verification.verified) {
      const approval = approvePayment(payment.id, 'pay.oneagentbd.online_auto_verify');
      return res.status(201).json({
        payment: approval.payment,
        verified: true,
        message: 'Payment verified and subscription activated instantly via pay.oneagentbd.online!'
      });
    }

    return res.status(201).json({
      payment,
      verified: false,
      message: 'Payment submitted successfully via pay.oneagentbd.online! Awaiting confirmation.'
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Payment submission failed' });
  }
});

// GET /api/payments/my - Current user payments
paymentsRouter.get('/my', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const payments = db.getPaymentsByUserId(user.id);
  return res.json(payments);
});

// GET /api/payments/all - Admin only
paymentsRouter.get('/all', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  const payments = db.getPayments().map((p) => {
    const profile = db.getProfileById(p.user_id);
    const plan = db.getPlanById(p.plan_id);
    return {
      ...p,
      user_email: profile?.email || 'Unknown User',
      user_name: profile?.full_name || 'Anonymous',
      plan_name: plan?.name || 'Standard Plan'
    };
  });

  return res.json(payments);
});

// POST /api/payments/:id/approve - Admin 1-click instant approval
paymentsRouter.post('/:id/approve', (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const result = approvePayment(req.params.id, user.id);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Payment approval failed' });
  }
});

// POST /api/payments/:id/reject - Admin reject
paymentsRouter.post('/:id/reject', (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { notes } = req.body;
    const payment = rejectPayment(req.params.id, notes, user.id);
    return res.json({ payment, message: 'Payment submission marked as rejected.' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Payment rejection failed' });
  }
});

// POST /api/payments/auto-verify - Extension point stub for SMS forwarder companion app
paymentsRouter.post('/auto-verify', async (req: Request, res: Response) => {
  try {
    const { transactionReference, amount, method, senderNumber, rawSmsText } = req.body;
    if (!transactionReference || !amount) {
      return res.status(400).json({ error: 'transactionReference and amount are required' });
    }

    const result = await autoApprovePayment({
      transactionReference,
      amount: Number(amount),
      method: method || 'bkash',
      senderNumber,
      rawSmsText
    });

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
