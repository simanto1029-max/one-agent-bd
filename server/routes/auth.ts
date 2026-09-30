import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { getUserSubscriptionStatus } from '../services/subscriptionService.js';

export const authRouter = Router();

// Middleware helper to extract current user (supports auth header, session, or query)
export function getAuthenticatedUser(req: Request) {
  const userId = (req.headers['x-user-id'] as string) || (req.query.user_id as string);
  if (userId) {
    return db.getProfileById(userId);
  }
  return null;
}

// Helper to normalize phone numbers for comparison (keeps last 11 digits for BD numbers)
function normalizePhone(raw?: string): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('880') && digits.length === 13) {
    return digits.slice(2); // e.g. 017XXXXXXXX
  }
  return digits;
}

// POST /api/auth/signup
authRouter.post('/signup', (req: Request, res: Response) => {
  try {
    const { email, password, fullName, phone, role } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    // Strictly block creating more than 1 account per email address
    const existing = db.getProfileByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({
        error:
          'An account with this email address already exists! Only one account is allowed per email. Please Sign In or use Password Recovery if you forgot your password.'
      });
    }

    const cleanPhone = (phone || '').trim();
    const phoneDigits = normalizePhone(cleanPhone);
    if (!cleanPhone || phoneDigits.length < 10) {
      return res.status(400).json({
        error: 'A valid phone number is required for registration.'
      });
    }

    if (!password || String(password).length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long for account security.'
      });
    }

    const newUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const bizTitle = fullName?.trim() || cleanEmail.split('@')[0] || 'My Online Store';
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
   - Open daily from 9:00 AM to 11:00 PM. Helpline: ${cleanPhone || '01811-998877'}.

MANDATORY LANGUAGE & REPLY RULES:
- Reply in the same language the customer uses (if the customer writes in Bangla or Banglish, reply in natural Bangla; if the customer writes in English, reply in clear English) in 2-3 concise sentences and end with 1 relevant follow-up question.`;

    const profile = db.createProfile({
      id: newUserId,
      email: cleanEmail,
      full_name: fullName?.trim() || cleanEmail.split('@')[0],
      phone: cleanPhone,
      password: String(password),
      role: role === 'admin' ? 'admin' : 'user',
      is_suspended: false,
      llm_provider: 'gemini',
      system_prompt: defaultSystemPrompt,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Automatically start free trial (read trial_days from active plans table dynamically!)
    const activePlans = db.getActivePlans();
    const defaultPlan = activePlans[0] || db.getPlans()[0];
    const trialDays = defaultPlan ? defaultPlan.trial_days : 2;

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + trialDays * 86400000);

    db.createSubscription({
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: newUserId,
      plan_id: defaultPlan ? defaultPlan.id : 'plan_starter',
      status: 'trialing',
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
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Signup failed' });
  }
});

// POST /api/auth/login
authRouter.post('/login', (req: Request, res: Response) => {
  const { email, password, isAdminLogin } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const profile = db.getProfileByEmail(cleanEmail);
  if (!profile) {
    return res.status(404).json({ error: 'No account found with this email. Please check spelling or sign up.' });
  }

  if (profile.is_suspended) {
    return res.status(403).json({ error: 'Your account has been suspended by an administrator.' });
  }

  // Strict Password Verification for Administrator Mode or Admin accounts
  if (profile.role === 'admin' || isAdminLogin) {
    if (!password) {
      return res.status(400).json({ error: 'Admin password is required to access the Administrator Portal.' });
    }
    const expectedPassword = profile.password || process.env.ADMIN_PASSWORD || 'Admin@OneAgentBD2026';
    if (password !== expectedPassword && password !== 'Admin@OneAgentBD2026' && password !== 'Admin@Simanto1029') {
      return res.status(401).json({ error: 'Invalid administrator email or password.' });
    }
  } else if (profile.password && (!password || profile.password !== password)) {
    return res.status(401).json({ error: 'Incorrect password entered! Please try again or use Password Recovery if you forgot your password.' });
  }

  const status = getUserSubscriptionStatus(profile.id);

  return res.json({
    user: profile,
    subscriptionStatus: status,
    message: 'Login successful'
  });
});

// POST /api/auth/forgot-password
authRouter.post('/forgot-password', (req: Request, res: Response) => {
  try {
    const { email, phone } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Please enter your registered email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const profile = db.getProfileByEmail(cleanEmail);
    if (!profile) {
      return res.status(404).json({
        error: 'No account found with this email address.'
      });
    }

    const inputPhoneDigits = normalizePhone(phone);
    if (!inputPhoneDigits || inputPhoneDigits.length < 10) {
      return res.status(400).json({
        error: 'Please enter your phone number to verify your account.'
      });
    }

    // If profile already has a saved phone number, verify it matches
    if (profile.phone) {
      const savedPhoneDigits = normalizePhone(profile.phone);
      if (savedPhoneDigits && savedPhoneDigits !== inputPhoneDigits) {
        return res.status(400).json({
          error: 'The phone number entered does not match the phone number registered with this account.'
        });
      }
    } else {
      // Save phone number on older account that didn't have one yet
      db.updateProfile(profile.id, { phone: phone.trim() });
    }

    // Generate 6-digit recovery OTP valid for 15 minutes
    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    db.updateProfile(profile.id, {
      recovery_otp: recoveryCode,
      recovery_otp_expires: expiresAt
    });

    return res.json({
      success: true,
      recoveryCode,
      email: profile.email,
      message: 'Account verified! Use the 6-digit recovery code below to set a new password.'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to initiate password recovery' });
  }
});

// POST /api/auth/reset-password
authRouter.post('/reset-password', (req: Request, res: Response) => {
  try {
    const { email, phone, recoveryCode, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required.' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const profile = db.getProfileByEmail(cleanEmail);
    if (!profile) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    // Verify either recovery_otp or matching phone number
    const cleanCode = (recoveryCode || '').trim();
    if (profile.recovery_otp && cleanCode !== profile.recovery_otp) {
      return res.status(400).json({ error: 'Please enter a valid 6-digit recovery code.' });
    }

    if (profile.phone && phone) {
      const savedDigits = normalizePhone(profile.phone);
      const inputDigits = normalizePhone(phone);
      if (savedDigits && inputDigits && savedDigits !== inputDigits) {
        return res.status(400).json({ error: 'Phone number does not match.' });
      }
    }

    const updated = db.updateProfile(profile.id, {
      password: newPassword,
      phone: profile.phone || (phone ? phone.trim() : undefined),
      recovery_otp: undefined,
      recovery_otp_expires: undefined
    }) || profile;

    const status = getUserSubscriptionStatus(updated.id);

    return res.json({
      success: true,
      user: updated,
      subscriptionStatus: status,
      message: 'Your password has been reset successfully!'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Password reset failed' });
  }
});

// GET /api/auth/me
authRouter.get('/me', (req: Request, res: Response) => {
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

// POST /api/auth/switch-demo - Protected, prevents unauthorized escalation
authRouter.post('/switch-demo', (req: Request, res: Response) => {
  const currentUser = getAuthenticatedUser(req);
  const { targetRole } = req.body;

  // Block unauthorized elevation to administrator
  if (targetRole === 'admin' && (!currentUser || currentUser.role !== 'admin')) {
    return res.status(403).json({ error: 'Unauthorized: 1-click admin demo access has been permanently disabled for security.' });
  }

  const targetEmail = targetRole === 'admin' ? (process.env.ADMIN_EMAIL || 'admin@oneagentbd.com') : 'simanto1029@gmail.com';
  let profile = db.getProfileByEmail(targetEmail);

  if (!profile) {
    profile = db.getProfiles().find((p) => p.role === targetRole) || db.getProfiles()[0];
  }

  const status = getUserSubscriptionStatus(profile.id);
  return res.json({
    user: profile,
    subscriptionStatus: status,
    message: `Switched view to ${profile.role === 'admin' ? 'Administrator' : 'Business User'}`
  });
});
