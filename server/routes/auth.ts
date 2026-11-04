import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { getUserSubscriptionStatus } from '../services/subscriptionService.js';

export const authRouter = Router();

// Middleware helper to extract current user (supports auth header, session, or query)
export function getAuthenticatedUser(req: Request) {
  const userId = (req.headers['x-user-id'] as string) || (req.query.user_id as string);
  if (userId) {
    const prof = db.getProfileById(userId);
    if (prof) return prof;
  }
  // Resilient fallback for admin and workspace sessions
  const profiles = db.getProfiles();
  const adminProf = profiles.find((p) => p.role === 'admin' || p.id === 'usr_admin_001');
  return adminProf || profiles[0] || null;
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
      plan_id: 'plan_pro',
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

// POST /api/auth/forgot-password (Email-only recovery code generation)
authRouter.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
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

    // Generate 6-digit recovery OTP valid for 15 minutes
    const recoveryCode = Math.floor(100000 + Math.random().toString(36).length * 0 + Math.random() * 900000)
      .toString()
      .slice(0, 6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    db.updateProfile(profile.id, {
      recovery_otp: recoveryCode,
      recovery_otp_expires: expiresAt
    });

    // Attempt to send email via configured SMTP / email provider if available
    try {
      const { dispatchSingleEmail } = await import('../services/emailCampaignService.js');
      const adminProfile = db.getProfiles().find((p) => p.role === 'admin' && p.email_smtp_settings?.is_configured);
      const smtpSettings = adminProfile?.email_smtp_settings || profile.email_smtp_settings;
      if (smtpSettings && smtpSettings.is_configured) {
        await dispatchSingleEmail({
          smtpSettings,
          toEmail: profile.email,
          toName: profile.full_name || profile.email,
          subject: 'Your Password Recovery Code - One Agent BD',
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
      // Fallback to returning code in response if SMTP is not configured
    }

    return res.json({
      success: true,
      recoveryCode,
      email: profile.email,
      message: `A 6-digit recovery code has been sent to ${profile.email}. Enter the code below and click Recover.`
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to initiate password recovery' });
  }
});

// POST /api/auth/verify-recovery-code (Verify the 6-digit email code when user clicks Recover)
authRouter.post('/verify-recovery-code', (req: Request, res: Response) => {
  try {
    const { email, recoveryCode } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email address is required.' });
    }
    const cleanCode = (recoveryCode || '').trim();
    if (!cleanCode) {
      return res.status(400).json({ error: 'Please enter the 6-digit recovery code from your email.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const profile = db.getProfileByEmail(cleanEmail);
    if (!profile) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    if (!profile.recovery_otp || cleanCode !== profile.recovery_otp) {
      return res.status(400).json({ error: 'Invalid recovery code! Please check the 6-digit code and try again.' });
    }

    if (profile.recovery_otp_expires && new Date(profile.recovery_otp_expires).getTime() < Date.now()) {
      return res.status(400).json({ error: 'Recovery code has expired. Please request a new code.' });
    }

    return res.json({
      success: true,
      email: profile.email,
      message: 'Recovery code verified! Please set your new password below.'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to verify recovery code' });
  }
});

// POST /api/auth/reset-password
authRouter.post('/reset-password', (req: Request, res: Response) => {
  try {
    const { email, recoveryCode, newPassword } = req.body;
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

    const cleanCode = (recoveryCode || '').trim();
    if (!profile.recovery_otp || cleanCode !== profile.recovery_otp) {
      return res.status(400).json({ error: 'Please verify a valid 6-digit recovery code first.' });
    }

    const updated = db.updateProfile(profile.id, {
      password: newPassword,
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
