import React, { useState, useEffect } from 'react';
import { Search, Bell, Building2, ChevronDown, QrCode, CheckCircle2 } from 'lucide-react';
import { useAuth, Role } from '../../context/AuthContext';
import { BarcodeScannerModal } from '../common/BarcodeScannerModal';
import { api } from '../../services/api';
import { Order } from '../../services/mockData';

interface AdminTopbarProps {
  title?: string;
  mode: Role;
  onNavigate: (tab: string) => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({ title = 'Operations Dashboard', mode, onNavigate }) => {
  const { user } = useAuth();
  const [branch, setBranch] = useState('Mumbai HQ Main Atelier');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Fetch pending orders for notifications
    api.getOrders().then(allOrders => {
      const myPending = allOrders.filter(
        o => o.status === 'Pending Approval' && (mode === 'admin' || o.renterId === user?.id)
      );
      setPendingOrders(myPending);
    });
  }, [user, mode]);

  const pendingOrdersCount = pendingOrders.length;

  const roleLabel = mode === 'admin' ? 'Platform Admin' : 'Renter Ops Manager';

  return (
    <header className="h-20 sticky top-0 z-20 glass-nav border-b border-[#5C4E4E]/20 px-6 flex items-center justify-between">
      {/* Title & Global Search */}
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-xl font-heading font-bold text-[#000000] tracking-tight">
            {title}
          </h1>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#988686]">
            {mode === 'admin' ? 'Platform Admin Console' : 'Renter Operations Console'}
          </span>
        </div>

        <div className="relative hidden md:flex items-center w-72">
          <Search className="absolute left-3 w-4 h-4 text-[#988686]" />
          <input
            type="text"
            placeholder="Search orders, SKUs, customers..."
            className="w-full glass-input rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#000000] placeholder-[#988686]"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Quick QR Scanner Button */}
        <button
          onClick={() => setShowQrModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#000000] text-white text-xs font-bold shadow-warm-sm hover:bg-[#988686] transition-all"
          title="Scan Customer QR Code to Approve Rental"
        >
          <QrCode className="w-4 h-4" />
          <span className="hidden sm:inline">Scan Customer QR</span>
        </button>

        {/* Branch Switcher */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg glass-panel text-xs text-[#000000]">
          <Building2 className="w-3.5 h-3.5 text-[#988686]" />
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="bg-transparent focus:outline-none cursor-pointer font-medium"
          >
            <option value="Mumbai HQ Main Atelier" className="bg-white">Mumbai HQ Main Atelier</option>
            <option value="Delhi Atelier Branch" className="bg-white">Delhi Atelier Branch</option>
            <option value="Bengaluru Logistics Hub" className="bg-white">Bengaluru Logistics Hub</option>
          </select>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-lg glass-panel hover:bg-[#988686]/20 transition-colors text-[#988686]"
          >
            <Bell className="w-4 h-4" />
            {pendingOrdersCount > 0 && (
              <>
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#5E7A63] animate-ping" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#5E7A63]" />
              </>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 glass-panel rounded-xl border border-[#988686]/30 shadow-2xl p-4 z-50 text-xs animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#5C4E4E]/20 pb-2 mb-3">
                <span className="font-bold text-[#000000] uppercase tracking-wider">Renter Notifications ({pendingOrdersCount})</span>
                <span className="text-[10px] text-[#988686]">Mark all read</span>
              </div>
              <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto">
                {pendingOrders.length === 0 ? (
                  <p className="text-center text-[#988686] py-4">No pending rental requests right now.</p>
                ) : (
                  pendingOrders.map(order => (
                    <div
                      key={order.id}
                      onClick={() => {
                        setNotificationsOpen(false);
                        setShowQrModal(true);
                      }}
                      className="p-2.5 rounded bg-[#5E7A63]/15 border border-[#5E7A63]/30 cursor-pointer hover:bg-[#5E7A63]/25 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-[#5E7A63]">New Rental Request!</p>
                        <span className="text-[9px] font-bold text-[#5E7A63] bg-white/80 px-1.5 py-0.5 rounded">Scan QR</span>
                      </div>
                      <p className="text-[11px] text-[#5C4E4E] mt-0.5">{order.customerName} requested {order.productName}. Tap to scan QR & approve.</p>
                    </div>
                  ))
                )}
                
                {/* Keep a sample overdue notification just for aesthetics if wanted, or we could filter overdue dynamically too */}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <button
          onClick={() => onNavigate('profile')}
          className="flex items-center gap-2 pl-2 border-l border-[#5C4E4E]/20 text-left hover:bg-[#988686]/10 rounded-lg py-1 px-1 transition-colors"
          title="View My Profile"
        >
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'}
            alt="Profile Avatar"
            className="w-8 h-8 rounded-full object-cover border border-[#988686]/50"
          />
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-[#000000] leading-tight">{user?.name}</span>
            <span className="text-[10px] text-[#988686] font-medium flex items-center gap-1">
              {roleLabel}
              <ChevronDown className="w-3 h-3" />
            </span>
          </div>
        </button>
      </div>

      <BarcodeScannerModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        onScanSuccess={() => onNavigate('orders')}
      />
    </header>
  );
};
