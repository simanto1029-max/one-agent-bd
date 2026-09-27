import { db, Payment } from '../db/database.js';
import { activateSubscription } from './subscriptionService.js';

export interface SubmitPaymentInput {
  userId: string;
  planId: string;
  amount: number;
  couponCode?: string;
  discountAmount?: number;
  durationDays?: number;
  durationLabel?: string;
  method: 'bkash' | 'nagad' | 'rocket' | 'upay' | 'bank' | 'manual' | 'stripe';
  transactionReference: string;
  senderNumber?: string;
  notes?: string;
}

export function submitManualPayment(input: SubmitPaymentInput): Payment {
  // Validate unique tx ref
  const existing = db.getPayments().find(
    (p) => p.transaction_reference.trim().toUpperCase() === input.transactionReference.trim().toUpperCase()
  );
  if (existing) {
    throw new Error(`Transaction ID '${input.transactionReference}' has already been submitted.`);
  }

  const payment: Payment = {
    id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id: input.userId,
    plan_id: input.planId,
    amount: Number(input.amount),
    coupon_code: input.couponCode ? input.couponCode.trim().toUpperCase() : undefined,
    discount_amount: input.discountAmount ? Number(input.discountAmount) : undefined,
    duration_days: input.durationDays ? Number(input.durationDays) : undefined,
    duration_label: input.durationLabel,
    method: input.method,
    transaction_reference: input.transactionReference.trim().toUpperCase(),
    sender_number: input.senderNumber?.trim(),
    status: 'pending',
    admin_notes: input.notes || 'Submitted via manual payment form',
    submitted_at: new Date().toISOString()
  };

  const created = db.createPayment(payment);

  // Mark subscription as pending_approval so user knows payment was registered
  const userSub = db.getSubscriptionByUserId(input.userId);
  if (userSub && userSub.status === 'expired') {
    db.updateSubscription(userSub.id, {
      status: 'pending_approval'
    });
  }

  return created;
}

export function approvePayment(paymentId: string, adminUserId?: string): { payment: Payment; message: string } {
  const payment = db.getPaymentById(paymentId);
  if (!payment) {
    throw new Error('Payment record not found.');
  }

  if (payment.status === 'approved') {
    return { payment, message: 'Payment was already approved.' };
  }

  // Update payment status
  const updatedPayment = db.updatePayment(paymentId, {
    status: 'approved',
    reviewed_at: new Date().toISOString(),
    reviewed_by: adminUserId || 'usr_admin_001'
  });

  // Increment coupon usage count if a coupon code was used on this payment
  if (payment.coupon_code) {
    const appliedCoupon = db.getCouponByCode(payment.coupon_code);
    if (appliedCoupon) {
      db.updateCoupon(appliedCoupon.id, {
        used_count: (appliedCoupon.used_count || 0) + 1
      });
    }
  }

  // Instantly activate or extend user subscription
  const plan = db.getPlanById(payment.plan_id);
  const durationDays = payment.duration_days || (plan ? plan.duration_days : 30);
  activateSubscription(payment.user_id, payment.plan_id, durationDays);

  return {
    payment: updatedPayment!,
    message: `Payment approved! Subscription activated for ${durationDays} days.`
  };
}

export function rejectPayment(paymentId: string, adminNotes?: string, adminUserId?: string): Payment {
  const payment = db.getPaymentById(paymentId);
  if (!payment) {
    throw new Error('Payment record not found.');
  }

  const updated = db.updatePayment(paymentId, {
    status: 'rejected',
    admin_notes: adminNotes || 'Rejected by administrator',
    reviewed_at: new Date().toISOString(),
    reviewed_by: adminUserId || 'usr_admin_001'
  });

  // If user's subscription was pending_approval, revert to expired or trialing
  const sub = db.getSubscriptionByUserId(payment.user_id);
  if (sub && sub.status === 'pending_approval') {
    db.updateSubscription(sub.id, {
      status: 'expired'
    });
  }

  return updated!;
}

/**
 * EXTENSION POINT: Automated Payment Verification Method
 *
 * Future integration point for SMS-forwarding companion apps (e.g. Android SMS
 * forwarder or Telco webhook) that parse incoming bKash/Nagad SMS text to match
 * pending payments and auto-approve without manual human intervention.
 *
 * Example incoming SMS:
 * "You have received Tk 1,450.00 from 017XXXXXXXX. Ref: 9J74HGF29K. Fee Tk 0.00. Balance Tk 15,400.00"
 */
export async function autoApprovePayment(params: {
  transactionReference: string;
  amount: number;
  method: 'bkash' | 'nagad';
  senderNumber?: string;
  rawSmsText?: string;
}): Promise<{ success: boolean; payment?: Payment; error?: string }> {
  const cleanRef = params.transactionReference.trim().toUpperCase();
  const pending = db
    .getPayments()
    .find((p) => p.status === 'pending' && p.transaction_reference.toUpperCase() === cleanRef);

  if (!pending) {
    return {
      success: false,
      error: `No pending payment found matching transaction reference ${cleanRef}`
    };
  }

  // Check amount tolerance
  if (Math.abs(pending.amount - params.amount) > 1.0) {
    return {
      success: false,
      error: `Amount mismatch: pending expected ${pending.amount}, but SMS payload reported ${params.amount}`
    };
  }

  // Auto approve
  const result = approvePayment(pending.id, 'system_sms_verifier');
  db.updatePayment(pending.id, {
    admin_notes: `Auto-approved by SMS Verification Companion: ${params.rawSmsText || 'Match verified'}`
  });

  return {
    success: true,
    payment: result.payment
  };
}
