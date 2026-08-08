import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  ShoppingBag,
  RotateCcw,
  ShieldAlert,
  Clock,
  Package,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Store,
  UserRound,
  Building,
  DollarSign,
  Scale,
} from 'lucide-react';
import { Role } from '../../context/AuthContext';

interface AdminSidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onViewStorefront: () => void;
  mode: Role;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentTab, onNavigate, onViewStorefront, mode }) => {
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = mode === 'admin';
  const isRenter = mode === 'renter';

  const navItems = [
    { id: 'dashboard', label: isAdmin ? 'Platform Dashboard' : 'Renter Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    ...(isAdmin ? [{ id: 'renters', label: 'Renters Governance', icon: <Building className="w-4 h-4" /> }] : []),
    { id: 'products', label: isRenter ? 'My Products & Rates' : 'All Marketplace Products', icon: <Package className="w-4 h-4" /> },
    { id: 'orders', label: isRenter ? 'My Rental Orders' : 'All Platform Orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'pickup-return', label: 'Pickup & Return', icon: <RotateCcw className="w-4 h-4" /> },
    { id: 'deposits', label: 'Security Deposits', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'late-fees', label: 'Late Fee Engine', icon: <Clock className="w-4 h-4" /> },
    { id: 'payouts', label: isAdmin ? 'Renter Payouts & Fees' : 'My Payouts & Earnings', icon: <DollarSign className="w-4 h-4" /> },
    ...(isAdmin ? [{ id: 'disputes', label: 'Dispute Arbitration', icon: <Scale className="w-4 h-4" /> }] : []),
    { id: 'quotations', label: 'Quotation Templates', icon: <FileText className="w-4 h-4" /> },
    ...(isAdmin ? [{ id: 'customers', label: 'Customer CRM', icon: <Users className="w-4 h-4" /> }] : []),
    ...(isAdmin ? [{ id: 'reports', label: 'Platform Analytics', icon: <BarChart3 className="w-4 h-4" /> }] : []),
    { id: 'settings', label: isRenter ? 'Renter Settings' : 'Platform Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'profile', label: 'My Account Profile', icon: <UserRound className="w-4 h-4" /> },
  ];

  const consoleLabel = isAdmin ? 'PLATFORM ADMIN' : 'RENTER SELLER CONSOLE';

  return (
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
          <img src="/rovia_logo.jpg" alt="ROVIA Logo" className="w-10 h-10 object-contain rounded shrink-0" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-heading text-lg font-bold tracking-tight text-[#000000] dark:text-white">ROVIA</span>
              <span className="text-[9px] uppercase tracking-widest text-[#988686] font-bold">{consoleLabel}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md bg-[#988686]/15 text-[#5C4E4E] hover:bg-[#988686]/30 hover:text-[#000000] transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-[#5C4E4E] text-white shadow-warm-sm font-bold'
                  : 'text-[#5C4E4E] dark:text-[#B5A9A9] hover:bg-[#988686]/10 hover:text-[#000000] dark:hover:text-white'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <span className={`shrink-0 ${isActive ? 'text-white' : 'text-[#988686]'}`}>{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.id === 'dashboard' && (
                <span className="ml-auto w-2 h-2 rounded-full bg-[#5E7A63] animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Customer Storefront Switcher */}
      <div className="p-3 border-t border-[#5C4E4E]/15">
        <button
          onClick={onViewStorefront}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#5C4E4E] hover:bg-[#3D3333] text-white text-xs font-semibold transition-colors"
        >
          <Store className="w-4 h-4 text-[#B5A9A9]" />
          {!collapsed && <span>Marketplace Storefront</span>}
        </button>
      </div>
    </aside>
  );
};
