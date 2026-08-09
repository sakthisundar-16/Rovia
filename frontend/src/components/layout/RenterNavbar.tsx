import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  RotateCcw,
  ShieldAlert,
  Clock,
  DollarSign,
  FileText,
  Settings,
  UserRound,
  Store,
  Bell,
  QrCode,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BarcodeScannerModal } from '../common/BarcodeScannerModal';
import { api } from '../../services/api';
import { Order } from '../../services/mockData';
import { useEffect } from 'react';

interface RenterNavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onViewStorefront: () => void;
}

export const RenterNavbar: React.FC<RenterNavbarProps> = ({ currentTab, onNavigate, onViewStorefront }) => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);

  useEffect(() => {
    api.getOrders().then(all => {
      setPendingOrders(all.filter(o => o.status === 'Pending Approval'));
    });
  }, [user]);

  const navItems = [
    { id: 'dashboard', label: 'Renter Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'products', label: 'My Products & Rates', icon: <Package className="w-4 h-4" /> },
    { id: 'orders', label: 'My Rental Orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'pickup-return', label: 'Pickup & Return', icon: <RotateCcw className="w-4 h-4" /> },
    { id: 'deposits', label: 'Security Deposits', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'late-fees', label: 'Late Fee Engine', icon: <Clock className="w-4 h-4" /> },
    { id: 'payouts', label: 'My Payouts & Earnings', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'quotations', label: 'Quotation Templates', icon: <FileText className="w-4 h-4" /> },
    { id: 'settings', label: 'Renter Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'profile', label: 'My Account Profile', icon: <UserRound className="w-4 h-4" /> },
  ];

  return (
    <>
      <aside
        className={`relative sticky top-0 h-screen bg-white/95 dark:bg-[#0D0B0B]/95 backdrop-blur-xl text-[#000000] dark:text-white border-r border-[#5C4E4E]/20 shadow-warm-sm flex flex-col transition-all duration-300 z-30 shrink-0 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-[#5C4E4E]/15">
          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 cursor-pointer overflow-hidden"
          >
            <img src="/rovia_logo.jpg" alt="ROVIA" className="w-10 h-10 object-contain rounded shrink-0" />
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-heading text-lg font-bold tracking-tight text-[#000000] dark:text-white">ROVIA</span>
                <span className="text-[9px] uppercase tracking-widest text-[#988686] font-bold">RENTER CONSOLE</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md bg-[#988686]/15 text-[#5C4E4E] hover:bg-[#988686]/30 hover:text-[#000000] transition-colors shrink-0"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Pending Requests Badge */}
        {pendingOrders.length > 0 && !collapsed && (
          <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-[#988686]/15 border border-[#988686]/30 flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-[#988686] shrink-0" />
            <span className="text-[10px] font-bold text-[#5C4E4E] dark:text-[#B5A9A9] truncate">
              {pendingOrders.length} pending rental request{pendingOrders.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#5C4E4E] text-white shadow-warm-sm font-bold'
                    : 'text-[#5C4E4E] dark:text-[#B5A9A9] hover:bg-[#988686]/10 hover:text-[#000000] dark:hover:text-white'
                }`}
              >
                <span className={`shrink-0 ${isActive ? 'text-white' : 'text-[#988686]'}`}>{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.id === 'orders' && pendingOrders.length > 0 && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-[#988686] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                    {pendingOrders.length}
                  </span>
                )}
                {!collapsed && item.id === 'dashboard' && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-[#5E7A63] animate-pulse shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-[#5C4E4E]/15 flex flex-col gap-2">
          {/* Scan QR */}
          <button
            onClick={() => setShowQrModal(true)}
            title={collapsed ? 'Scan Customer QR' : undefined}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#000000] hover:bg-[#3D3333] text-white text-xs font-semibold transition-colors"
          >
            <QrCode className="w-4 h-4 text-[#988686] shrink-0" />
            {!collapsed && <span>Scan Customer QR</span>}
          </button>

          {/* Storefront */}
          <button
            onClick={onViewStorefront}
            title={collapsed ? 'View Marketplace' : undefined}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#5C4E4E] hover:bg-[#3D3333] text-white text-xs font-semibold transition-colors"
          >
            <Store className="w-4 h-4 text-[#B5A9A9] shrink-0" />
            {!collapsed && <span>Marketplace Storefront</span>}
          </button>

          {/* Profile + Logout */}
          {!collapsed && (
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 text-xs text-[#5C4E4E] dark:text-[#B5A9A9] hover:text-[#000000] dark:hover:text-white transition-colors truncate"
              >
                {user?.avatar && (
                  <img src={user.avatar} alt={user?.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                )}
                <span className="truncate max-w-[110px] font-semibold">{user?.name}</span>
              </button>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-[#988686] hover:bg-[#988686]/10 hover:text-[#5C4E4E] transition-all shrink-0"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {collapsed && (
            <button
              onClick={logout}
              className="w-full flex items-center justify-center p-2 rounded-lg text-[#988686] hover:bg-[#988686]/10 transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      <BarcodeScannerModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        onScanSuccess={() => onNavigate('orders')}
      />
    </>
  );
};
