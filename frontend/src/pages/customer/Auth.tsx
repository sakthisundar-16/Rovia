import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Phone, User, ShieldCheck, ArrowRight, Building, UserCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';

export const Auth: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [role, setRole] = useState<'customer' | 'renter'>('customer');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Default pre-filled credentials for testing convenience
  const [email, setEmail] = useState('elena.vance@studio-noir.com');
  const [password, setPassword] = useState('GothicNoir2026!');
  const [name, setName] = useState('Elena Vance');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [company, setCompany] = useState('Studio Noir Atelier');

  const [rememberMe, setRememberMe] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { login } = useAuth();
  const { showToast } = useToast();

  const handleRoleChange = (selectedRole: 'customer' | 'renter') => {
    setRole(selectedRole);
    setErrors({});
    if (selectedRole === 'renter') {
      setEmail('marcus.sterling@rovia-ops.com');
      setName('Marcus Sterling');
      setCompany('ROVIA Central Operations');
    } else {
      setEmail('elena.vance@studio-noir.com');
      setName('Elena Vance');
      setCompany('Studio Noir Atelier');
    }
  };

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
    // Log in as selected role
    login(email, role === 'renter' ? 'admin' : 'customer');
    showToast(
      isSignUp ? 'Account & Profile Created!' : `Welcome Back, ${role === 'renter' ? 'Renter Admin' : 'Customer'}!`,
      `Logged in as ${name} (${role === 'renter' ? 'Operations Renter' : 'Portal User'})`,
      'success'
    );
    onSuccess();
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center p-4 my-6 page-transition">
      <div className="w-full max-w-5xl glass-panel rounded-3xl overflow-hidden border border-[#988686]/30 shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* Left Brand Panel */}
        <div className="lg:col-span-5 relative bg-[#0D0B0B] p-8 sm:p-12 flex flex-col justify-between overflow-hidden">
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

          {/* Dynamic Role Headline */}
          <div className="relative z-10 space-y-4 my-8">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white leading-tight">
              {role === 'renter'
                ? 'Renter Operations & Inventory Console'
                : 'Customer Rental Portal & Atelier'}
            </h2>
            <p className="text-xs text-[#D1D0D0] leading-relaxed font-light">
              {role === 'renter'
                ? 'Configure organization pricelists, time-bound rental periods, quotation templates, asset QR tracking, and late fee deposit deductions.'
                : 'Browse universal rental products, select delivery or store pickup, authorize 100% refundable deposits, and download tax invoices.'}
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-xs text-[#988686] font-mono border-t border-[#988686]/30 pt-4">
            <ShieldCheck className="w-4 h-4 text-[#5E7A63]" />
            <span>256-Bit Encrypted Dual-Role Portal</span>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="lg:col-span-7 bg-[#FFFFFF] dark:bg-[#0D0B0B] p-8 sm:p-12 flex flex-col justify-center">
          {/* Role Selector Tabs (Customer vs Renter) */}
          <div className="space-y-4 mb-6">
            <span className="text-[10px] font-mono text-[#988686] uppercase tracking-widest block font-bold">
              SELECT LOGIN ROLE PORTAL
            </span>
            <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-[#988686]/15">
              <button
                type="button"
                onClick={() => handleRoleChange('customer')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  role === 'customer'
                    ? 'bg-[#000000] dark:bg-[#988686] text-white shadow-warm-md'
                    : 'text-[#5C4E4E] dark:text-[#B5A9A9] hover:bg-[#988686]/10'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Customer (Portal User)</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('renter')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  role === 'renter'
                    ? 'bg-[#000000] dark:bg-[#988686] text-white shadow-warm-md'
                    : 'text-[#5C4E4E] dark:text-[#B5A9A9] hover:bg-[#988686]/10'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Renter (Admin / Ops)</span>
              </button>
            </div>

            <div className="flex items-center justify-between border-b border-[#D1D0D0]/30 dark:border-[#5C4E4E]/30 pb-3">
              <h3 className="font-heading text-2xl font-bold text-[#000000] dark:text-[#F5F3F3]">
                {isSignUp
                  ? role === 'renter'
                    ? 'Register Renter Business'
                    : 'Register Customer Profile'
                  : role === 'renter'
                  ? 'Renter Operations Sign In'
                  : 'Customer Sign In'}
              </h3>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-[#988686] font-bold hover:underline"
                >
                  {isSignUp ? 'Already registered? Sign In' : 'New user? Register'}
                </button>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {isSignUp && (
              <>
                <Input
                  label="Full Name"
                  placeholder={role === 'renter' ? 'e.g. Marcus Sterling' : 'e.g. Elena Vance'}
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
                {role === 'renter' && (
                  <Input
                    label="Rental Company / Organization Name"
                    placeholder="e.g. ROVIA Central Operations"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    leftIcon={<Building className="w-4 h-4" />}
                  />
                )}
              </>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              leftIcon={<Mail className="w-4 h-4" />}
            />

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

            {!isSignUp ? (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#5C4E4E] dark:text-[#B5A9A9]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#988686] text-[#988686] focus:ring-[#988686]"
                  />
                  <span>Remember session for 30 days</span>
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
                    I accept ROVIA Security Deposit Policy, Late Fee Penalty Rules, and Rental Conditions.
                  </span>
                </label>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full mt-4" rightIcon={<ArrowRight className="w-4 h-4" />}>
              {isSignUp ? `Create ${role === 'renter' ? 'Renter Admin' : 'Customer'} Account` : `Sign In as ${role === 'renter' ? 'Renter' : 'Customer'}`}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
