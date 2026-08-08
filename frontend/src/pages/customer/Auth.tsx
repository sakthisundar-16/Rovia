import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Phone, User, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';

export const Auth: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('elena.vance@studio-noir.com');
  const [password, setPassword] = useState('GothicNoir2026!');
  const [name, setName] = useState('Elena Vance');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [rememberMe, setRememberMe] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { login } = useAuth();
  const { showToast } = useToast();

  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = calculatePasswordStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!email || !email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (isSignUp) {
      if (!name) newErrors.name = 'Full name is required';
      if (!phone) newErrors.phone = 'Phone number is required';
      if (!termsAccepted) newErrors.terms = 'You must accept the terms of service';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    login(email, 'customer');
    showToast(
      isSignUp ? 'Account Created Successfully!' : 'Welcome Back to ROVIA!',
      `Logged in as ${email}`,
      'success'
    );
    onSuccess();
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center p-4 my-6 page-transition">
      <div className="w-full max-w-5xl glass-panel rounded-3xl overflow-hidden border border-[#988686]/30 shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        {/* Left 45% Styled Brand Panel */}
        <div className="lg:col-span-5 relative bg-[#0D0B0B] p-8 sm:p-12 flex flex-col justify-between overflow-hidden">
          {/* Moody Duotone Background Image Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-color-dodge pointer-events-none"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B0B] via-[#5C4E4E]/60 to-[#0D0B0B]/80 pointer-events-none" />

          {/* Logo Brand Header */}
          <div className="relative z-10 flex items-center gap-3">
            <img
              src="/rovia_logo.jpg"
              alt="ROVIA Logo"
              className="w-12 h-12 object-contain rounded-xl shadow-2xl border border-[#988686]/40"
            />
            <div className="flex flex-col">
              <span className="font-heading text-2xl font-bold tracking-tight text-white">ROVIA</span>
              <span className="text-[9px] uppercase tracking-widest text-[#988686] font-semibold">
                RENT • USE • RETURN • REUSE
              </span>
            </div>
          </div>

          {/* Brand Headline */}
          <div className="relative z-10 space-y-4 my-8">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white leading-tight">
              Access Editorial Cinema Gear & Luxury Sets
            </h2>
            <p className="text-xs text-[#D1D0D0] leading-relaxed font-light">
              Log in to manage your active rental period, download instant GST invoices, inspect security deposit ledgers, and request return pickups.
            </p>
          </div>

          {/* Bottom Security Trust Pill */}
          <div className="relative z-10 flex items-center gap-2 text-xs text-[#988686] font-mono border-t border-[#988686]/30 pt-4">
            <ShieldCheck className="w-4 h-4 text-[#5E7A63]" />
            <span>256-Bit Encrypted Authentication</span>
          </div>
        </div>

        {/* Right 55% Form Section */}
        <div className="lg:col-span-7 bg-[#FFFFFF] dark:bg-[#0D0B0B] p-8 sm:p-12 flex flex-col justify-center">
          {/* Header & Tabs */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 mb-2 lg:hidden">
              <img src="/rovia_logo.jpg" alt="ROVIA Logo" className="w-10 h-10 object-contain rounded" />
              <span className="font-heading text-xl font-bold text-[#000000] dark:text-white">ROVIA</span>
            </div>

            <h3 className="font-heading text-2xl sm:text-3xl font-bold text-[#000000] dark:text-[#F5F3F3]">
              {isSignUp ? 'Create Atelier Account' : 'Welcome Back'}
            </h3>

            {/* Toggle Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-[#988686]/15 max-w-xs">
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setErrors({}); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  !isSignUp
                    ? 'bg-[#000000] dark:bg-[#988686] text-white shadow-warm-sm'
                    : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setErrors({}); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  isSignUp
                    ? 'bg-[#000000] dark:bg-[#988686] text-white shadow-warm-sm'
                    : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <Input
                  label="Full Name"
                  placeholder="e.g. Elena Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                  leftIcon={<User className="w-4 h-4" />}
                />
                <Input
                  label="Phone Number"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  error={errors.phone}
                  leftIcon={<Phone className="w-4 h-4" />}
                />
              </>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <div className="space-y-1">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none text-[#988686]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              {/* Password Strength Meter for Sign Up */}
              {isSignUp && password.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center gap-1.5 h-1.5 w-full">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`flex-1 h-full rounded-full transition-colors ${
                          strength >= step
                            ? strength === 4
                              ? 'bg-[#5E7A63]'
                              : strength >= 2
                              ? 'bg-[#B08A4E]'
                              : 'bg-[#A0524E]'
                            : 'bg-[#988686]/20'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#988686]">
                    Password strength: {strength === 4 ? 'Strong (Gothic Secure)' : strength >= 2 ? 'Medium' : 'Weak'}
                  </span>
                </div>
              )}
            </div>

            {!isSignUp ? (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#5C4E4E] dark:text-[#B5A9A9]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#988686] text-[#988686] focus:ring-[#988686]"
                  />
                  <span>Remember me for 30 days</span>
                </label>
                <button type="button" className="text-[#988686] hover:underline font-semibold">
                  Forgot password?
                </button>
              </div>
            ) : (
              <div className="text-xs pt-1">
                <label className="flex items-start gap-2 cursor-pointer text-[#5C4E4E] dark:text-[#B5A9A9]">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="rounded border-[#988686] text-[#988686] focus:ring-[#988686] mt-0.5"
                  />
                  <span>
                    I accept the ROVIA Rental Terms, Security Deposit Conditions, and Damage Policy.
                  </span>
                </label>
                {errors.terms && <p className="text-[11px] text-[#A0524E] mt-1">{errors.terms}</p>}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full mt-4" rightIcon={<ArrowRight className="w-4 h-4" />}>
              {isSignUp ? 'Complete Registration' : 'Sign In to Account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
