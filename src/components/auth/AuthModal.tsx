import React, { useState, useEffect } from 'react';
import { X, Shield, User, Lock, Mail, Phone, ArrowRight, CheckCircle2, KeyRound, RotateCcw } from 'lucide-react';
import { api } from '../../api';
import { UserProfile, SubscriptionStatusInfo, Plan } from '../../types';
import { BrandLogo } from '../common/BrandLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile, subStatus: SubscriptionStatusInfo) => void;
  defaultMode?: 'login' | 'signup';
  selectedPlan?: Plan | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultMode = 'signup',
  selectedPlan = null
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(defaultMode);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Password Recovery state
  const [recoveryStep, setRecoveryStep] = useState<'verify' | 'reset'>('verify');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setError(null);
      setSuccessNotice(null);
      setRecoveryStep('verify');
    }
  }, [isOpen, defaultMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);
    setLoading(true);

    try {
      if (isAdminMode) {
        const res = await api.login(email.trim(), password, true);
        onSuccess(res.user, res.subscriptionStatus);
        onClose();
        return;
      }

      if (mode === 'forgot') {
        if (recoveryStep === 'verify') {
          const cleanDigits = phone.replace(/\D/g, '');
          if (cleanDigits.length < 10) {
            throw new Error('অ্যাকাউন্ট ভেরিফাই করার জন্য সঠিক মোবাইল নাম্বার দিন (কমপক্ষে ১১ ডিজিট)।');
          }
          const res = await api.requestPasswordRecovery({
            email: email.trim(),
            phone: phone.trim()
          });
          setGeneratedCode(res.recoveryCode);
          setRecoveryCode(res.recoveryCode);
          setRecoveryStep('reset');
          setSuccessNotice(res.message || 'ভেরিফিকেশন সফল হয়েছে! এখন নতুন পাসওয়ার্ড দিন।');
          return;
        } else {
          if (newPassword.length < 6) {
            throw new Error('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
          }
          if (newPassword !== confirmNewPassword) {
            throw new Error('নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না!');
          }
          const res = await api.resetPassword({
            email: email.trim(),
            phone: phone.trim(),
            recoveryCode: recoveryCode.trim(),
            newPassword
          });
          onSuccess(res.user, res.subscriptionStatus);
          onClose();
          return;
        }
      }

      if (mode === 'signup') {
        const cleanDigits = phone.replace(/\D/g, '');
        if (!phone.trim() || cleanDigits.length < 10) {
          throw new Error('রেজিস্ট্রেশন করার জন্য আপনার মোবাইল নাম্বার (Phone Number) দেওয়া আবশ্যক।');
        }
        const res = await api.signup({
          email: email.trim(),
          password,
          phone: phone.trim(),
          fullName: fullName.trim() || 'Merchant Store'
        });
        onSuccess(res.user, res.subscriptionStatus);
        onClose();
      } else {
        const res = await api.login(email.trim(), password);
        onSuccess(res.user, res.subscriptionStatus);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div
        id="auth-modal-dialog"
        className="relative w-full max-w-md p-6 sm:p-8 bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 my-auto"
      >
        <button
          id="close-auth-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2.5 mb-2">
            <BrandLogo size="md" />
            <span className="font-extrabold text-xl tracking-tight">One Agent <span className="text-[#7F22FE]">BD</span></span>
          </div>

          <h2 className="text-2xl font-black tracking-tight">
            {isAdminMode
              ? 'Administrator Portal Sign In'
              : mode === 'forgot'
              ? 'পাসওয়ার্ড রিকভারি (Password Recovery)'
              : mode === 'signup'
              ? 'Start Your 2-Day Free Trial'
              : 'Welcome Back'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {isAdminMode
              ? 'Authorized platform administrators only. Verify payments and manage plans.'
              : mode === 'forgot'
              ? 'আপনার ইমেইল ও রেজিস্টার করা মোবাইল নাম্বার দিয়ে সহজেই নতুন পাসওয়ার্ড সেট করুন।'
              : mode === 'signup'
              ? 'Instant access to WhatsApp, Messenger, Instagram & Website AI Auto-Reply. Phone number required.'
              : 'Sign in to access your omnichannel inbox and manage AI agent settings.'}
          </p>
        </div>

        {/* Plan Selected Pill */}
        {selectedPlan && !isAdminMode && mode === 'signup' && (
          <div className="mb-4 p-3 rounded-2xl bg-[#7F22FE]/10 border border-[#7F22FE]/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-6 h-6 rounded-lg bg-[#7F22FE] text-white flex items-center justify-center font-bold text-[10px]">
                2D
              </div>
              <div>
                <span className="font-bold text-[#7F22FE] block">
                  {selectedPlan.name} Plan (2-Day Free Trial)
                </span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {selectedPlan.price.toLocaleString()} {selectedPlan.currency} / {selectedPlan.duration_days || 30} days after trial
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7F22FE]/20 text-[#7F22FE] uppercase tracking-wider">
              Selected
            </span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium space-y-2">
            <div>{error}</div>
            {mode === 'signup' && error.includes('ইতিমধ্যে একটি অ্যাকাউন্ট') && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#7F22FE] text-white font-bold text-[11px] hover:bg-[#6c1ce0] transition-colors cursor-pointer"
                >
                  Sign In করুন
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setRecoveryStep('verify');
                    setError(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-200 font-bold text-[11px] hover:bg-rose-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  Password Recovery করুন
                </button>
              </div>
            )}
          </div>
        )}

        {successNotice && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
            {successNotice}
          </div>
        )}

        {/* Tabs for Merchant: Create Account / Sign In / Forgot Password */}
        {!isAdminMode && (
          <div className="flex border-b border-neutral-200 dark:border-neutral-800 mb-5">
            <button
              type="button"
              className={`pb-2.5 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                mode === 'signup'
                  ? 'border-[#7F22FE] text-[#7F22FE]'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              onClick={() => {
                setMode('signup');
                setError(null);
                setSuccessNotice(null);
              }}
            >
              Register (Free Trial)
            </button>
            <button
              type="button"
              className={`pb-2.5 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'border-[#7F22FE] text-[#7F22FE]'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessNotice(null);
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`pb-2.5 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                mode === 'forgot'
                  ? 'border-[#7F22FE] text-[#7F22FE]'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              onClick={() => {
                setMode('forgot');
                setRecoveryStep('verify');
                setError(null);
                setSuccessNotice(null);
              }}
            >
              Password Recovery
            </button>
          </div>
        )}

        {/* Admin mode active banner */}
        {isAdminMode && (
          <div className="mb-4 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="font-semibold">Staff Administrative Access</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAdminMode(false)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && !isAdminMode && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Full Name / Business Name (নাম বা প্রতিষ্ঠানের নাম) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  id="auth-full-name-input"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Trendy Collections BD"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7F22FE]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Email Address (ইমেইল অ্যাড্রেস) *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAdminMode ? 'admin@oneagentbd.com' : 'you@business.com'}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7F22FE]"
              />
            </div>
          </div>

          {/* Phone Number field: required on Signup AND on Password Recovery */}
          {(mode === 'signup' || mode === 'forgot') && !isAdminMode && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Phone Number (মোবাইল নাম্বার) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  id="auth-phone-input"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX (১১ ডিজিট মোবাইল নাম্বার)"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7F22FE]"
                />
              </div>
            </div>
          )}

          {/* Standard Password field for Login & Signup */}
          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Password (পাসওয়ার্ড) *
                </label>
                {mode === 'login' && !isAdminMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setRecoveryStep('verify');
                      setError(null);
                      setSuccessNotice(null);
                    }}
                    className="text-xs font-bold text-[#7F22FE] hover:underline cursor-pointer"
                  >
                    পাসওয়ার্ড ভুলে গেছেন? (Forgot Password?)
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  id="auth-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7F22FE]"
                />
              </div>
            </div>
          )}

          {/* Password Recovery Step 2 Fields */}
          {mode === 'forgot' && recoveryStep === 'reset' && !isAdminMode && (
            <div className="space-y-3 pt-1 border-t border-neutral-100 dark:border-neutral-800">
              {generatedCode && (
                <div className="p-3 rounded-2xl bg-[#7F22FE]/10 border border-[#7F22FE]/25 flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                    আপনার ভেরিফিকেশন কোড (Recovery OTP):
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#7F22FE] text-white font-mono font-bold text-xs tracking-widest">
                    {generatedCode}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Recovery Code (৬-ডিজিট রিকভারি কোড) *
                </label>
                <input
                  type="text"
                  required
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value)}
                  placeholder="6-digit code"
                  className="w-full px-3 py-2.5 text-sm font-mono rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7F22FE]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  New Password (নতুন পাসওয়ার্ড দিন) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="কমপক্ষে ৬ অক্ষরের নতুন পাসওয়ার্ড"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7F22FE]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Confirm New Password (পুনরায় নতুন পাসওয়ার্ড দিন) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="পুনরায় নতুন পাসওয়ার্ড লিখুন"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7F22FE]"
                  />
                </div>
              </div>
            </div>
          )}

          {mode === 'signup' && !isAdminMode && (
            <div className="p-3 rounded-2xl bg-[#7F22FE]/10 border border-[#7F22FE]/20 text-xs text-neutral-800 dark:text-neutral-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#7F22FE]" />
              <span>
                Your <strong>2-Day Free Trial</strong> starts immediately. Live countdown timer will activate on your dashboard.
              </span>
            </div>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#7F22FE] hover:bg-[#6c1ce0] text-white font-bold text-sm shadow-md shadow-[#7F22FE]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : isAdminMode ? (
              <>
                Sign In as Admin <ArrowRight className="w-4 h-4" />
              </>
            ) : mode === 'forgot' ? (
              recoveryStep === 'verify' ? (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>অ্যাকাউন্ট ভেরিফাই করুন (Get Recovery Code)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>নতুন পাসওয়ার্ড সেভ ও লগইন করুন (Reset Password)</span>
                </>
              )
            ) : mode === 'signup' ? (
              <>
                Activate 2-Day Free Trial <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Sign In to Dashboard <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Discreet Staff Portal Link for Administrator only */}
        <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span>One Agent BD Secure Platform</span>
          {!isAdminMode ? (
            <button
              type="button"
              onClick={() => {
                setIsAdminMode(true);
                setEmail('');
                setPassword('');
                setError(null);
              }}
              className="hover:text-neutral-600 dark:hover:text-neutral-300 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <KeyRound className="w-3 h-3" />
              <span>Staff Login</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsAdminMode(false);
                setEmail('');
                setPassword('');
                setError(null);
              }}
              className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 text-[11px] font-medium transition-colors cursor-pointer"
            >
              ← Back to User Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
