import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, CreditCard, Shield, Plus, Upload, Check, Camera, ShieldCheck, RefreshCw, Wallet } from 'lucide-react';
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
  const [avatar, setAvatar] = useState(user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  const [addresses, setAddresses] = useState([
    { id: 'addr-1', title: 'Studio Noir Atelier (HQ)', street: 'Suite 402, Lower Parel', city: 'Mumbai', pin: '400013', isDefault: true },
    { id: 'addr-2', title: 'Film City Stage 9', street: 'Goregaon East', city: 'Mumbai', pin: '400065', isDefault: false }
  ]);

  useEffect(() => {
    api.getOrders().then((all) => {
      const myOrders = user?.email
        ? all.filter((o) => o.customerEmail === user.email || o.customerName === user.name)
        : all;
      setUserOrders(myOrders);
    });
  }, [user]);

  const totalHeldDeposit = userOrders
    .filter((o) => o.depositStatus === 'Held')
    .reduce((sum, o) => sum + (o.depositAmount || 0), 0);

  const totalRefundedDeposit = userOrders
    .filter((o) => o.depositStatus === 'Refunded')
    .reduce((sum, o) => sum + (o.depositAmount || 0), 0);

  const totalDepositsAll = userOrders.reduce((sum, o) => sum + (o.depositAmount || 0), 0);

  const handleAvatarChange = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const newAvatarUrl = reader.result as string;
      setAvatar(newAvatarUrl);
      updateProfile({ avatar: newAvatarUrl });
      await api.updateUserProfile(user?.id || 'usr-8842', { avatar: newAvatarUrl });
      showToast('Profile Picture Updated!', 'New avatar applied across Customer & Admin views.', 'success');
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
      <div className="border-b border-[#D1D0D0]/40 dark:border-[#5C4E4E]/40 pb-4">
        <span className="text-xs font-mono uppercase text-[#988686] tracking-widest">UNIVERSAL MEMBER PROFILE</span>
        <h1 className="font-heading text-4xl font-bold text-[#000000] dark:text-white mt-1">
          Account Settings & Security Deposit Ledger
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Avatar & Deposit Summary */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="text-center space-y-4 p-6">
            <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-[#988686]/60 shadow-2xl group">
              <img src={avatar} alt={user?.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                <Camera className="w-6 h-6" />
              </div>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-[#000000] dark:text-white">{name}</h2>
              <p className="text-xs text-[#988686] font-mono mt-0.5">{user?.tier || 'Gothic Noir VIP Member'}</p>
            </div>

            <FileUpload label="Upload New Profile Picture" onFileSelect={handleAvatarChange} />
          </Card>

          {/* Security Deposit Amount Escrow Card */}
          <div className="glass-panel p-6 rounded-2xl border-2 border-[#5E7286]/50 shadow-xl space-y-4 bg-[#5E7286]/10">
            <div className="flex items-center justify-between border-b border-[#5E7286]/30 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#5E7286]" />
                <h3 className="font-heading text-base font-bold text-[#000000] dark:text-white">
                  Security Deposit Ledger
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5E7286]">Escrow Safe</span>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white/90 dark:bg-[#0D0B0B]/90 border border-[#5E7286]/30">
                <span className="text-[11px] text-[#988686] font-mono uppercase block">Active Escrow Held Deposit</span>
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
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSaveProfile} className="glass-panel p-6 rounded-2xl border border-[#988686]/30 space-y-4">
            <h3 className="font-heading text-lg font-bold text-[#000000] dark:text-white border-b border-[#988686]/30 pb-2">
              Personal & Company Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} leftIcon={<User className="w-4 h-4" />} />
              <Input label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} leftIcon={<Mail className="w-4 h-4" />} />
              <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} leftIcon={<Phone className="w-4 h-4" />} />
              <Input label="Company / Organization" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <Button type="submit">Save Profile & Sync Backend</Button>
          </form>

          {/* Saved Delivery Addresses */}
          <div className="glass-panel p-6 rounded-2xl border border-[#988686]/30 space-y-4">
            <div className="flex items-center justify-between border-b border-[#988686]/30 pb-2">
              <h3 className="font-heading text-lg font-bold text-[#000000] dark:text-white">Saved Dispatch Addresses</h3>
              <Button size="sm" variant="outline" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddressModal(true)}>
                Add Address
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {addresses.map((addr) => (
                <div key={addr.id} className="p-4 rounded-xl border border-[#988686]/30 glass-card space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#000000] dark:text-white">{addr.title}</span>
                    {addr.isDefault && <span className="text-[10px] text-[#5E7A63] font-bold">Default</span>}
                  </div>
                  <p className="text-[#5C4E4E] dark:text-[#B5A9A9]">{addr.street}, {addr.city} - {addr.pin}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showAddressModal} onClose={() => setShowAddressModal(false)} title="Add New Dispatch Address">
        <div className="space-y-3">
          <Input label="Address Title" placeholder="e.g. Studio Location B" />
          <Input label="Street Address" placeholder="123 Production Lane" />
          <Input label="City" placeholder="Mumbai" />
          <Button className="w-full mt-2" onClick={() => setShowAddressModal(false)}>Save Address</Button>
        </div>
      </Modal>
    </div>
  );
};
