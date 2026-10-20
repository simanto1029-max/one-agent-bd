import React, { useState, useEffect } from 'react';
import {
  Shield,
  User,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
  KeyRound,
  RotateCcw
} from 'lucide-react';
import { api } from '../../api';
import { UserProfile, SubscriptionStatusInfo, Plan } from '../../types';
import { OFFICIAL_THREE_PLANS } from '../../utils/pricingPlans';

interface AuthPageProps {
  initialMode?: 'login' | 'signup';
  selectedPlan?: Plan | null;
  onSuccess: (user: UserProfile, subStatus: SubscriptionStatusInfo) => void;
  onBackToHome: () => void;
  onChangeMode: (mode: 'login' | 'signup') => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'signup',
  selectedPlan = null,
  onSuccess,
  onBackToHome,
  onChangeMode
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Form Fields matching ChatMakky & One Agent BD
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [chosenPlanId, setChosenPlanId] = useState<string>(selectedPlan?.id || 'plan_trial');

  // Password Recovery
  const [recoveryStep, setRecoveryStep] = useState<'email' | 'code' | 'reset'>('email');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    if (selectedPlan?.id) {
      setChosenPlanId(selectedPlan.id);
    }
    setError(null);
    setSuccessNotice(null);
  }, [initialMode, selectedPlan]);

  const switchTab = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setError(null);
    setSuccessNotice(null);
    setIsAdminMode(false);
    onChangeMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);
    setLoading(true);

    try {
      if (isAdminMode) {
        const res = await api.login(email.trim(), password, true);
        onSuccess(res.user, res.subscriptionStatus);
        return;
      }

      if (mode === 'forgot') {
        if (recoveryStep === 'email') {
          if (!email.trim()) {
            throw new Error('Please enter your registered email address.');
          }
          const res = await api.requestPasswordRecovery({ email: email.trim() });
          setRecoveryStep('code');
          setSuccessNotice(res.message || 'A 6-digit recovery code has been sent to your email.');
          return;
        } else if (recoveryStep === 'code') {
          if (!recoveryCode.trim()) {
            throw new Error('Please enter the 6-digit recovery code.');
          }
          const res = await api.verifyRecoveryCode({
            email: email.trim(),
            recoveryCode: recoveryCode.trim()
          });
          setRecoveryStep('reset');
          setSuccessNotice(res.message || 'Code verified! Now choose a new password.');
          return;
        } else {
          if (newPassword.length < 6) {
            throw new Error('Password must be at least 6 characters long.');
          }
          if (newPassword !== confirmNewPassword) {
            throw new Error('Passwords do not match.');
          }
          const res = await api.resetPassword({
            email: email.trim(),
            recoveryCode: recoveryCode.trim(),
            newPassword
          });
          onSuccess(res.user, res.subscriptionStatus);
          return;
        }
      }

      if (mode === 'login') {
        if (!email.trim() || !password) {
          throw new Error('Please enter both email and password.');
        }
        const res = await api.login(email.trim(), password, false);
        onSuccess(res.user, res.subscriptionStatus);
      } else {
        // Signup validation
        const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
        if (!firstName.trim()) {
          throw new Error('Please enter your first name.');
        }
        if (!email.trim()) {
          throw new Error('Please enter your email address.');
        }
        const cleanPhone = phone.trim().replace(/\D/g, '');
        if (!cleanPhone || cleanPhone.length < 10) {
          throw new Error('Please enter a valid 11-digit phone number (e.g., 017XXXXXXXX).');
        }
        if (!password || password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }

        const res = await api.signup({
          fullName,
          email: email.trim(),
          phone: cleanPhone,
          password
        });
        onSuccess(res.user, res.subscriptionStatus);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#070514] text-slate-900 dark:text-white flex flex-col justify-between selection:bg-[#7C3AED] selection:text-white transition-colors">
      
      {/* Top Bar with Back to Home & Clean Branding */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToHome}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#7C3AED] dark:hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </button>

        {/* Brand Name */}
        <button
          type="button"
          onClick={onBackToHome}
          className="font-black text-xl sm:text-2xl tracking-tight text-slate-900 dark:text-white cursor-pointer"
        >
          One Agent <span className="text-[#7C3AED] dark:text-[#A855F7]">BD</span>
        </button>

        <div className="w-20" aria-hidden="true" />
      </header>

      {/* Main Centered Content (Exact ChatMakky Structure, Clean White Layout) */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 relative z-10">
        
        {/* Header Title & Subtitle */}
        <div className="text-center mb-6 sm:mb-8 space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {mode === 'signup'
              ? 'Create your account'
              : mode === 'forgot'
              ? 'Reset your password'
              : isAdminMode
              ? 'Admin Security Portal'
              : 'Sign in to your account'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {mode === 'signup'
              ? 'Start your 2-Day Free Trial. Instant AI sales agent for WhatsApp, Messenger & Instagram.'
              : mode === 'forgot'
              ? 'Enter your email to receive a secure recovery code.'
              : 'Welcome back! Enter your login details to access your dashboard.'}
          </p>
        </div>

        {/* Centered Auth Card */}
        <div className="w-full max-w-[460px] bg-white dark:bg-[#0E0A24] border border-slate-200/90 dark:border-purple-500/25 rounded-2xl shadow-[0_12px_45px_rgba(15,23,42,0.08)] dark:shadow-[0_15px_50px_rgba(0,0,0,0.6)] p-6 sm:p-8 transition-all">
          
          {/* Segmented Tabs: Login vs Register (ChatMakky exact layout) */}
          {mode !== 'forgot' && !isAdminMode && (
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-white/5 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => switchTab('login')}
                className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white dark:bg-[#1A1238] text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => switchTab('signup')}
                className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {/* Error Notice */}
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs font-medium leading-relaxed">
              {error}
            </div>
          )}

          {/* Success Notice */}
          {successNotice && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* REGISTER FORM */}
            {mode === 'signup' && (
              <>
                {/* First Name & Last Name (Side by Side like ChatMakky) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Email *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all placeholder:text-slate-400"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Phone Number *
                    </label>
                    <span className="text-[10px] text-slate-400">11 digits (e.g. 017...)</span>
                  </div>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all placeholder:text-slate-400"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all placeholder:text-slate-400"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password (ChatMakky style) */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all placeholder:text-slate-400"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((p) => !p)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Plan Selection Badge */}
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-500/20 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#7C3AED] dark:text-purple-300">
                      ✓ 2-Day Free Trial Included
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#7C3AED]/15 text-[#7C3AED] dark:text-purple-300 font-bold text-[10px]">
                      ৳0.00
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                    Instant access to unlimited Messenger & Instagram AI replies. No credit card required.
                  </p>
                </div>
              </>
            )}

            {/* LOGIN FORM */}
            {mode === 'login' && (
              <>
                {/* Email Address */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all placeholder:text-slate-400"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] font-semibold text-[#7C3AED] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all placeholder:text-slate-400"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* PASSWORD RECOVERY FLOW */}
            {mode === 'forgot' && (
              <>
                {recoveryStep === 'email' && (
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Registered Email Address *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all placeholder:text-slate-400"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                )}

                {recoveryStep === 'code' && (
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Enter 6-Digit Verification Code *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value)}
                        placeholder="123456"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-center text-lg font-mono tracking-widest focus:outline-hidden focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all placeholder:text-slate-400"
                      />
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                )}

                {recoveryStep === 'reset' && (
                  <>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        New Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all placeholder:text-slate-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Confirm New Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-5"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : mode === 'signup' ? (
                <>
                  <span>Create Account (Start Free Trial)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : mode === 'forgot' ? (
                <span>
                  {recoveryStep === 'email'
                    ? 'Send Recovery Code'
                    : recoveryStep === 'code'
                    ? 'Verify Code'
                    : 'Reset Password & Sign In'}
                </span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/10 flex flex-col items-center gap-3 text-xs">
            {mode === 'signup' ? (
              <p className="text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  className="font-bold text-[#7C3AED] hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            ) : mode === 'login' ? (
              <p className="text-slate-500 dark:text-slate-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchTab('signup')}
                  className="font-bold text-[#7C3AED] hover:underline cursor-pointer"
                >
                  Create one now (Free Trial)
                </button>
              </p>
            ) : (
              <button
                type="button"
                onClick={() => switchTab('login')}
                className="font-bold text-[#7C3AED] hover:underline cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </button>
            )}

            {/* Admin Toggle */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAdminMode((prev) => !prev);
                  if (!isAdminMode) setMode('login');
                }}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Shield className="w-3 h-3 text-[#7C3AED]" />
                <span>{isAdminMode ? 'Switch back to Merchant Sign In' : 'Admin Security Sign In'}</span>
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* Clean Minimal Footer */}
      <footer className="w-full max-w-6xl mx-auto px-4 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} One Agent BD. All rights reserved.
      </footer>

    </div>
  );
};
