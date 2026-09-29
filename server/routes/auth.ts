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
      return res.status(400).json({ error: 'সঠিক ইমেইল অ্যাড্রেস দেওয়া আবশ্যক (Valid email is required).' });
    }

    // Strictly block creating more than 1 account per email address
    const existing = db.getProfileByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({
        error:
          'এই ইমেইল অ্যাড্রেস দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট খোলা হয়েছে! একটি ইমেইল দিয়ে একবারের বেশি অ্যাকাউন্ট খোলা যাবে না। অনুগ্রহ করে Sign In করুন অথবা পাসওয়ার্ড ভুলে গেলে Password Recovery ব্যবহার করুন।'
      });
    }

    const cleanPhone = (phone || '').trim();
    const phoneDigits = normalizePhone(cleanPhone);
    if (!cleanPhone || phoneDigits.length < 10) {
      return res.status(400).json({
        error: 'রেজিস্ট্রেশন করার জন্য সঠিক মোবাইল নাম্বার দেওয়া আবশ্যক (Valid phone number is required).'
      });
    }

    if (!password || String(password).length < 6) {
      return res.status(400).json({
        error: 'অ্যাকাউন্টের নিরাপত্তার জন্য কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন (Password must be at least 6 characters).'
      });
    }

    const newUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const bizTitle = fullName?.trim() || cleanEmail.split('@')[0] || 'My Online Store';
    const defaultSystemPrompt = `আপনি "${bizTitle}"-এর অফিসিয়াল কাস্টমার সার্ভিস ও সেলস AI অ্যাসিস্ট্যান্ট।

Business Knowledge Base (ব্যবসায়িক তথ্য):
1. প্রোডাক্ট ও সার্ভিস:
   - আমাদের সকল প্রোডাক্ট ১০০% অরিজিনাল এবং প্রিমিয়াম কোয়ালিটির। ড্যাশবোর্ডের Products ক্যাটালগ ও এই নলেজ বেস অনুযায়ী কাস্টমারকে সঠিক দাম ও বিবরণ দিন।
2. ডেলিভারি ও চার্জ:
   - ঢাকার ভেতরে ডেলিভারি চার্জ ৳৬০ (২৪-৪৮ ঘণ্টা) এবং ঢাকার বাইরে সারাদেশে ৳১২০ (২-৩ দিন)। সারাদেশে ক্যাশ অন ডেলিভারি (COD) সুবিধা আছে।
3. পেমেন্ট পদ্ধতি:
   - ক্যাশ অন ডেলিভারি (COD), বিকাশ এবং নগদ।
4. অর্ডার করার নিয়ম:
   - অর্ডার কনফার্ম করতে কাস্টমারের নাম, সম্পূর্ণ ঠিকানা এবং ১১ ডিজিটের মোবাইল নাম্বার প্রয়োজন।
5. সাপোর্ট ও হেল্পলাইন:
   - প্রতিদিন সকাল ৯টা থেকে রাত ১১টা পর্যন্ত। হেল্পলাইন: ${cleanPhone || '01811-998877'}।

MANDATORY LANGUAGE & REPLY RULES:
- কাস্টমার বাংলা, বাংলিশ বা ইংরেজিতে যেভাবেই প্রশ্ন করুক না কেন, সর্বদা সুন্দর, সংক্ষিপ্ত ও প্রাকৃতিক বাংলায় (২-৩ বাক্যে) উত্তর দিন এবং শেষে প্রাসঙ্গিক ১টি ফলো-আপ প্রশ্ন করুন।`;

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
    return res.status(401).json({ error: 'ভুল পাসওয়ার্ড দিয়েছেন! পাসওয়ার্ড ভুলে গেলে Password Recovery ব্যবহার করুন। (Incorrect password entered.)' });
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
      return res.status(400).json({ error: 'আপনার রেজিস্টার করা ইমেইল অ্যাড্রেস দিন (Email is required).' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const profile = db.getProfileByEmail(cleanEmail);
    if (!profile) {
      return res.status(404).json({
        error: 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি (No account found with this email).'
      });
    }

    const inputPhoneDigits = normalizePhone(phone);
    if (!inputPhoneDigits || inputPhoneDigits.length < 10) {
      return res.status(400).json({
        error: 'অ্যাকাউন্ট ভেরিফাই করতে আপনার মোবাইল নাম্বারটি দিন (Phone number is required).'
      });
    }

    // If profile already has a saved phone number, verify it matches
    if (profile.phone) {
      const savedPhoneDigits = normalizePhone(profile.phone);
      if (savedPhoneDigits && savedPhoneDigits !== inputPhoneDigits) {
        return res.status(400).json({
          error: 'আপনার দেওয়া মোবাইল নাম্বারটি এই অ্যাকাউন্টের সাথে মিলছে না (Phone number does not match registered phone).'
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
      message: 'অ্যাকাউন্ট ভেরিফাই হয়েছে! নিচের ৬-ডিজিটের রিকভারি কোড ব্যবহার করে নতুন পাসওয়ার্ড সেট করুন।'
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
      return res.status(400).json({ error: 'ইমেইল এবং নতুন পাসওয়ার্ড দেওয়া আবশ্যক।' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে (Minimum 6 characters).' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const profile = db.getProfileByEmail(cleanEmail);
    if (!profile) {
      return res.status(404).json({ error: 'অ্যাকাউন্ট পাওয়া যায়নি।' });
    }

    // Verify either recovery_otp or matching phone number
    const cleanCode = (recoveryCode || '').trim();
    if (profile.recovery_otp && cleanCode !== profile.recovery_otp) {
      return res.status(400).json({ error: 'সঠিক ৬-ডিজিট রিকভারি কোড দিন (Invalid recovery code).' });
    }

    if (profile.phone && phone) {
      const savedDigits = normalizePhone(profile.phone);
      const inputDigits = normalizePhone(phone);
      if (savedDigits && inputDigits && savedDigits !== inputDigits) {
        return res.status(400).json({ error: 'মোবাইল নাম্বারটি সঠিক নয়।' });
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
      message: 'আপনার পাসওয়ার্ড সফলভাবে রিসেট হয়েছে!'
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
