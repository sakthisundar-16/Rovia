import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Phone, User, ShieldCheck, ArrowRight, Building, UserCheck, LayoutGrid } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth, Role } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';

interface AuthProps {
  onSuccess: (role: Role) => void;
}

const ROLE_META: Record<Role, { label: string; sub: string; icon: React.ReactNode; headline: string; description: string }> = {
  customer: {
    label: 'Customer',
    sub: 'Portal User',
    icon: <UserCheck className="w-4 h-4" />,
    headline: 'Customer Rental Portal & Atelier',
    description:
      'Browse universal rental products, select delivery or store pickup, authorize 100% refundable deposits, and download tax invoices.',
  },
  renter: {
    label: 'Renter',
    sub: 'Business Ops',
    icon: <Building className="w-4 h-4" />,
    headline: 'Renter Operations & Inventory Console',
    description:
      'Configure organization pricelists, time-bound rental periods, quotation templates, asset QR tracking, and late fee deposit deductions.',
  },
  admin: {
    label: 'Admin',
    sub: 'Platform',
    icon: <ShieldCheck className="w-4 h-4" />,
    headline: 'Platform Admin Console & Governance',
    description:
      'Full platform governance, customers CRM, reports & analytics, organization settings, and supervision across all renter businesses.',
  },
};

const DEMO_CREDENTIALS: Record<Role, { email: string; password: string; name: string; phone: string; company: string }> = {
  customer: {
    email: 'customer@rovia-demo.com',
    password: 'Customer@2026!',
    name: 'Elena Vance',
    phone: '+91 98765 43210',
    company: 'Studio Noir Atelier',
  },
  renter: {
    email: 'renter@rovia-demo.com',
    password: 'Renter@2026!',
    name: 'Ravi Kapoor',
    phone: '+91 98300 22110',
    company: 'Urban Gear Rentals',
  },
  admin: {
    email: 'admin@rovia-demo.com',
    password: 'Admin@2026!',
    name: 'Marcus Sterling',
    phone: '+91 99000 11223',
    company: 'ROVIA Operations HQ',
  },
};

export const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [role, setRole] = useState<Role>('customer');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState(DEMO_CREDENTIALS.customer.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.customer.password);
  const [name, setName] = useState(DEMO_CREDENTIALS.customer.name);
  const [phone, setPhone] = useState(DEMO_CREDENTIALS.customer.phone);
  const [company, setCompany] = useState(DEMO_CREDENTIALS.customer.company);

  const [rememberMe, setRememberMe] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { login } = useAuth();
  const { showToast } = useToast();

  const meta = ROLE_META[role];

  const handleRoleChange = (selectedRole: Role) => {
    setRole(selectedRole);
    setErrors({});
    const creds = DEMO_CREDENTIALS[selectedRole];
    setEmail(creds.email);
    setPassword(creds.password);
    setName(creds.name);
    setPhone(creds.phone);
    setCompany(creds.company);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    const roleLabel = role === 'customer' ? 'Customer' : role === 'renter' ? 'Renter' : 'Admin';
    // Pass password so AuthContext can attempt real backend login
    await login(email, role, password);
    showToast(
      isSignUp ? 'Account & Profile Created!' : `Welcome Back, ${roleLabel}!`,
      `Logged in as ${name || email} (${meta.label} ${meta.sub})`,
      'success'
    );
    onSuccess(role);
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center p-4 my-6 page-transition">
      <div className="w-full max-w-5xl glass-panel rounded-3xl overflow-hidden border border-[#988686]/30 shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* Left Brand Panel */}
        <div className="lg:col-span-5 relative bg-[#0D0B0B] p-8 sm:p-12 flex flex-col justify-between overflow-hidden">
          <div
            className="absolute inset-0 bg-site-image opacity-45 mix-blend-luminosity pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B0B] via-[#3D3333]/50 to-[#0D0B0B]/70 pointer-events-none" />

          {/* Logo Brand Header */}
          <div className="relative z-10 flex items-center gap-3">
            <img
              src="/rovia_logo.jpg"
              alt="ROVIA Logo"
              className="w-12 h-12 object-contain rounded-xl shadow-2xl border border-[#988686]/40"
            />
            <div className="flex flex-col">
              <span className="font-heading text-2xl font-bold tracking-tight text-white">ROVIA</span>
              <span className="text-[9px] uppercase tracking-widest text-[#B5A9A9] font-semibold">
                RENT • USE • RETURN • REUSE
              </span>
            </div>
          </div>

          {/* Dynamic Role Headline */}
          <div className="relative z-10 space-y-4 my-8">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white leading-tight">
              {meta.headline}
            </h2>
            <p className="text-xs text-[#D1D0D0] leading-relaxed font-light">
              {meta.description}
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-xs text-[#B5A9A9] font-mono border-t border-[#988686]/30 pt-4">
            <ShieldCheck className="w-4 h-4 text-[#5E7A63]" />
            <span>256-Bit Encrypted Tri-Role Portal</span>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-12 flex flex-col justify-center">
          {/* Role Selector Tabs */}
          <div className="space-y-4 mb-6">
            <span className="text-[10px] font-mono text-[#988686] uppercase tracking-widest block font-bold">
              SELECT LOGIN ROLE PORTAL
            </span>
            <div className="grid grid-cols-3 gap-3 p-1 rounded-2xl bg-[#988686]/15">
              {(Object.keys(ROLE_META) as Role[]).map((r) => {
                const m = ROLE_META[r];
                const isActive = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleChange(r)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-[#000000] text-white shadow-warm-md'
                        : 'text-[#5C4E4E] hover:bg-[#988686]/10'
                    }`}
                  >
                    {m.icon}
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#988686] font-mono">
              <LayoutGrid className="w-3 h-3" />
              <span>{meta.label} ({meta.sub})</span>
            </div>

            <div className="flex items-center justify-between border-b border-[#D1D0D0]/40 pb-3">
              <h3 className="font-heading text-2xl font-bold text-[#000000]">
                {isSignUp
                  ? role === 'admin'
                    ? 'Register Admin Access'
                    : role === 'renter'
                    ? 'Register Renter Business'
                    : 'Register Customer Profile'
                  : role === 'admin'
                  ? 'Platform Admin Sign In'
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
                  placeholder={role === 'renter' ? 'e.g. Ravi Kapoor' : role === 'admin' ? 'e.g. Marcus Sterling' : 'e.g. Elena Vance'}
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
                {role !== 'customer' && (
                  <Input
                    label={role === 'admin' ? 'Platform / Organization Name' : 'Rental Company / Organization Name'}
                    placeholder="e.g. ROVIA Operations HQ"
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
                <label className="flex items-center gap-2 cursor-pointer text-[#5C4E4E]">
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
                <label className="flex items-start gap-2 cursor-pointer text-[#5C4E4E]">
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
              {isSignUp
                ? `Create ${role === 'admin' ? 'Admin' : role === 'renter' ? 'Renter' : 'Customer'} Account`
                : `Sign In as ${role === 'admin' ? 'Admin' : role === 'renter' ? 'Renter' : 'Customer'}`}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
