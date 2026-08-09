import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Shield,
  Plus,
  Upload,
  Check,
  Camera,
  ShieldCheck,
  RefreshCw,
  Wallet,
  Award,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { FileUpload } from '../../components/ui/FileUpload';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../services/api';
import { Order } from '../../services/mockData';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || 'Elena Vance');
  const [email, setEmail] = useState(user?.email || 'elena.vance@studio-noir.com');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [company, setCompany] = useState(user?.company || 'Studio Noir Atelier');
  const [avatar, setAvatar] = useState(
    user?.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
  );
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showTrustScoreInfoModal, setShowTrustScoreInfoModal] = useState(false);
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  const [addresses, setAddresses] = useState([
    {
      id: 'addr-1',
      title: 'Studio Noir Atelier (HQ)',
      street: 'Suite 402, Lower Parel',
      city: 'Mumbai',
      pin: '400013',
      isDefault: true,
    },
    {
      id: 'addr-2',
      title: 'Film City Stage 9',
      street: 'Goregaon East',
      city: 'Mumbai',
      pin: '400065',
      isDefault: false,
    },
  ]);

  useEffect(() => {
    api.getOrders().then((all) => {
      const myOrders = user?.email
        ? all.filter((o) => o.customerEmail === user.email || o.customerName === user.name)
        : all;
      setUserOrders(myOrders);
    });
  }, [user]);

  // ── TRUST SCORE CALCULATION ENGINE ──────────────────────────────────────────
  // Base starting score = 850
  // Completed / On-Time Return = +25 pts
  // Late Return = -50 pts
  const completedOrders = userOrders.filter((o) => o.status === 'Completed');
  const lateOrders = userOrders.filter(
    (o) =>
      o.status === 'Overdue' ||
      o.timeline?.some(
        (t) => t.stage.toLowerCase().includes('late') || t.notes?.toLowerCase().includes('late')
      )
  );

  const onTimeCount = Math.max(completedOrders.length, 3); // minimum 3 demo on-time returns
  const lateCount = lateOrders.length;
  const totalReturnEvaluations = onTimeCount + lateCount;

  const calculatedTrustScore = Math.min(
    1000,
    Math.max(300, 850 + onTimeCount * 25 - lateCount * 50)
  );

  const onTimeRate = Math.round((onTimeCount / totalReturnEvaluations) * 100);

  // Trust Score Tier Classification
  const getTrustTier = (score: number) => {
    if (score >= 900) {
      return {
        badge: '🌟 Platinum Elite Renter',
        color: 'text-amber-400 border-amber-400/40 bg-amber-500/10',
        barColor: 'bg-gradient-to-r from-amber-500 to-yellow-300',
        benefit: 'Zero-Deposit Privileges & Instant Dispatch Authorized',
      };
    } else if (score >= 750) {
      return {
        badge: '🛡️ Gold Verified Renter',
        color: 'text-[#5E7A63] border-[#5E7A63]/40 bg-[#5E7A63]/10',
        barColor: 'bg-gradient-to-r from-[#5E7A63] to-emerald-400',
        benefit: '50% Reduced Security Deposit Escrow & Priority Support',
      };
    } else if (score >= 600) {
      return {
        badge: '⚖️ Standard Silver Renter',
        color: 'text-[#5E7286] border-[#5E7286]/40 bg-[#5E7286]/10',
        barColor: 'bg-gradient-to-r from-blue-500 to-indigo-400',
        benefit: 'Standard Escrow Deposit Required',
      };
    } else {
      return {
        badge: '🚨 High Risk Alert',
        color: 'text-[#A0524E] border-[#A0524E]/40 bg-[#A0524E]/10',
        barColor: 'bg-gradient-to-r from-red-600 to-rose-400',
        benefit: 'Requires Identity Re-verification & Full Escrow Deposit',
      };
    }
  };

  const currentTier = getTrustTier(calculatedTrustScore);

  const totalHeldDeposit = userOrders
    .filter((o) => o.depositStatus === 'Held')
    .reduce((sum, o) => sum + (o.depositAmount || 0), 0);

  const totalRefundedDeposit = userOrders
    .filter((o) => o.depositStatus === 'Refunded')
    .reduce((sum, o) => sum + (o.depositAmount || 0), 0);

  const handleAvatarChange = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const newAvatarUrl = reader.result as string;
      setAvatar(newAvatarUrl);
      updateProfile({ avatar: newAvatarUrl });
      await api.updateUserProfile(user?.id || 'usr-8842', { avatar: newAvatarUrl });
      showToast(
        'Profile Picture Updated!',
        'New avatar applied across Customer & Admin views.',
        'success'
      );
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData = { name, email, phone, company, avatar };
    updateProfile(updatedData);
    await api.updateUserProfile(user?.id || 'usr-8842', updatedData);
    showToast('Profile Saved & Synced!', 'Updated details sent to FastAPI backend.', 'success');
  };

  return (
    <div className="w-full space-y-8 page-transition pb-16">
      {/* Header */}
      <div className="border-b border-[#D1D0D0]/40 dark:border-[#5C4E4E]/40 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-[#988686] tracking-widest">
            UNIVERSAL MEMBER PROFILE
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#000000] dark:text-white mt-1">
            Account Settings & Customer Trust Score
          </h1>
        </div>

        {/* Top Trust Score Badge summary */}
        <div
          onClick={() => setShowTrustScoreInfoModal(true)}
          className="cursor-pointer group glass-card px-4 py-2.5 rounded-2xl border border-[#988686]/30 flex items-center gap-3 hover:border-amber-400/50 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-extrabold text-lg">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">Trust Score:</span>
              <span className="font-mono text-sm font-black text-amber-400">
                {calculatedTrustScore} / 1000
              </span>
            </div>
            <span className="text-[10px] text-[#988686] block">
              {onTimeRate}% On-Time Return History
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Avatar & Trust Score Card */}
        <div className="lg:col-span-5 space-y-6">
          {/* Avatar Card */}
          <Card className="text-center space-y-4 p-6">
            <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-[#988686]/60 shadow-2xl group">
              <img src={avatar} alt={user?.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                <Camera className="w-6 h-6" />
              </div>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-[#000000] dark:text-white">
                {name}
              </h2>
              <p className="text-xs text-[#988686] font-mono mt-0.5">
                {user?.tier || 'Gothic Noir VIP Member'}
              </p>
            </div>

            <FileUpload label="Upload New Profile Picture" onFileSelect={handleAvatarChange} />
          </Card>

          {/* 🌟 DYNAMIC CUSTOMER TRUST SCORE CARD */}
          <div className="glass-panel p-6 rounded-2xl border-2 border-amber-500/40 shadow-2xl space-y-5 bg-gradient-to-b from-amber-500/10 via-transparent to-[#141212]">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading text-base font-bold text-white">
                  Customer Trust Score
                </h3>
              </div>
              <button
                onClick={() => setShowTrustScoreInfoModal(true)}
                className="text-amber-400 hover:text-amber-300 text-xs font-mono flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" /> How it Works
              </button>
            </div>

            {/* Main Meter Gauge */}
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-[11px] font-mono text-[#988686] uppercase block">
                    Verified Rating
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-4xl font-black text-white">
                      {calculatedTrustScore}
                    </span>
                    <span className="text-xs font-mono text-[#988686]">/ 1000 pts</span>
                  </div>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${currentTier.color}`}
                >
                  {currentTier.badge}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-[#090808] rounded-full overflow-hidden p-0.5 border border-[#988686]/30">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${currentTier.barColor}`}
                  style={{ width: `${(calculatedTrustScore / 1000) * 100}%` }}
                ></div>
              </div>

              <p className="text-xs text-[#D1D0D0] bg-[#090808]/60 p-3 rounded-xl border border-[#988686]/20 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Unlocked Privilege:</strong> {currentTier.benefit}
                </span>
              </p>
            </div>

            {/* Performance Breakdown Statistics */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-3 rounded-xl bg-[#090808]/80 border border-[#988686]/20 space-y-0.5">
                <span className="text-[10px] text-[#988686] font-mono uppercase block">
                  On-Time Return Rate
                </span>
                <span className="font-mono text-lg font-bold text-[#5E7A63]">
                  {onTimeRate}%
                </span>
                <span className="text-[9px] text-[#988686] block">Based on rental deadlines</span>
              </div>

              <div className="p-3 rounded-xl bg-[#090808]/80 border border-[#988686]/20 space-y-0.5">
                <span className="text-[10px] text-[#988686] font-mono uppercase block">
                  On-Time Dispatches
                </span>
                <span className="font-mono text-lg font-bold text-white">
                  {onTimeCount} Returns
                </span>
                <span className="text-[9px] text-[#5E7A63] block">
                  +{onTimeCount * 25} Trust Pts Earned
                </span>
              </div>
            </div>

            {/* Audit Log / Return History Entries */}
            <div className="space-y-2 pt-2 border-t border-[#988686]/20">
              <span className="text-[10px] font-mono uppercase text-[#988686] block">
                Recent Return Activity
              </span>
              <div className="space-y-1.5">
                <div className="p-2.5 rounded-lg bg-[#090808] border border-[#5E7A63]/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#5E7A63]" />
                    <div>
                      <span className="font-bold text-white block">ROV-2026-133 Handover Return</span>
                      <span className="text-[10px] text-[#988686]">Returned on schedule</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[#5E7A63] text-xs">+25 pts</span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#090808] border border-[#5E7A63]/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#5E7A63]" />
                    <div>
                      <span className="font-bold text-white block">ROV-2026-879 Cinema Camera</span>
                      <span className="text-[10px] text-[#988686]">Inspected & Approved</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[#5E7A63] text-xs">+25 pts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Deposit Amount Escrow Card */}
          <div className="glass-panel p-6 rounded-2xl border-2 border-[#5E7286]/50 shadow-xl space-y-4 bg-[#5E7286]/10">
            <div className="flex items-center justify-between border-b border-[#5E7286]/30 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#5E7286]" />
                <h3 className="font-heading text-base font-bold text-[#000000] dark:text-white">
                  Security Deposit Ledger
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5E7286]">
                Escrow Safe
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white/90 dark:bg-[#0D0B0B]/90 border border-[#5E7286]/30">
                <span className="text-[11px] text-[#988686] font-mono uppercase block">
                  Active Escrow Held Deposit
                </span>
                <span className="font-mono text-2xl font-bold text-[#5E7286]">
                  ₹{totalHeldDeposit > 0 ? totalHeldDeposit.toLocaleString() : '1,05,000'}
                </span>
                <p className="text-[10px] text-[#5C4E4E] dark:text-[#B5A9A9] mt-1">
                  Protected in bank-grade escrow. Auto-refunded upon return inspection.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-lg glass-panel border border-[#988686]/20">
                  <span className="text-[10px] text-[#988686] block">Lifetime Refunds</span>
                  <span className="font-mono font-bold text-[#5E7A63]">
                    ₹{totalRefundedDeposit > 0 ? totalRefundedDeposit.toLocaleString() : '4,85,000'}
                  </span>
                </div>
                <div className="p-3 rounded-lg glass-panel border border-[#988686]/20">
                  <span className="text-[10px] text-[#988686] block">Total Contracts</span>
                  <span className="font-mono font-bold text-[#000000] dark:text-white">
                    {userOrders.length > 0 ? userOrders.length : 3} Rentals
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Form & Addresses */}
        <div className="lg:col-span-7 space-y-6">
          <form
            onSubmit={handleSaveProfile}
            className="glass-panel p-6 rounded-2xl border border-[#988686]/30 space-y-4"
          >
            <h3 className="font-heading text-lg font-bold text-[#000000] dark:text-white border-b border-[#988686]/30 pb-2">
              Personal & Company Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
              />
              <Input
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />
              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
              />
              <Input
                label="Company / Organization"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            <Button type="submit">Save Profile & Sync Backend</Button>
          </form>

          {/* Saved Delivery Addresses */}
          <div className="glass-panel p-6 rounded-2xl border border-[#988686]/30 space-y-4">
            <div className="flex items-center justify-between border-b border-[#988686]/30 pb-2">
              <h3 className="font-heading text-lg font-bold text-[#000000] dark:text-white">
                Saved Dispatch Addresses
              </h3>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setShowAddressModal(true)}
              >
                Add Address
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-4 rounded-xl border border-[#988686]/30 glass-card space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#000000] dark:text-white">
                      {addr.title}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] text-[#5E7A63] font-bold">Default</span>
                    )}
                  </div>
                  <p className="text-[#5C4E4E] dark:text-[#B5A9A9]">
                    {addr.street}, {addr.city} - {addr.pin}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      <Modal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        title="Add New Dispatch Address"
      >
        <div className="space-y-3">
          <Input label="Address Title" placeholder="e.g. Studio Location B" />
          <Input label="Street Address" placeholder="123 Production Lane" />
          <Input label="City" placeholder="Mumbai" />
          <Button className="w-full mt-2" onClick={() => setShowAddressModal(false)}>
            Save Address
          </Button>
        </div>
      </Modal>

      {/* Trust Score Info Modal */}
      <Modal
        isOpen={showTrustScoreInfoModal}
        onClose={() => setShowTrustScoreInfoModal(false)}
        title="How Customer Trust Score Works"
      >
        <div className="space-y-4 text-xs text-[#D1D0D0]">
          <p>
            The <strong>ROVIA Customer Trust Score</strong> is an automated reputation scoring algorithm that measures on-time product returns and inspection quality.
          </p>

          <div className="space-y-2 font-mono">
            <div className="p-3 rounded-lg bg-[#5E7A63]/20 border border-[#5E7A63]/40 flex items-center justify-between">
              <span>On-Time Return</span>
              <span className="font-bold text-[#5E7A63]">+25 Points</span>
            </div>
            <div className="p-3 rounded-lg bg-[#A0524E]/20 border border-[#A0524E]/40 flex items-center justify-between">
              <span>Late Return</span>
              <span className="font-bold text-[#A0524E]">-50 Points</span>
            </div>
            <div className="p-3 rounded-lg bg-[#A0524E]/20 border border-[#A0524E]/40 flex items-center justify-between">
              <span>Disputed Item Damage</span>
              <span className="font-bold text-[#A0524E]">-100 Points</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#141212] border border-[#988686]/30 space-y-1">
            <span className="font-bold text-amber-400 block">🌟 Platinum Tier Benefit (900+ Pts):</span>
            <p className="text-[11px] text-[#988686]">
              Renting assets with zero security deposit requirement &amp; priority logistics queue.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
