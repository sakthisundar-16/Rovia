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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminSidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentTab, onNavigate }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { switchMode } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Operations Center', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'quotations', label: 'Quotations', icon: <FileText className="w-4 h-4" /> },
    { id: 'orders', label: 'Rental Contracts', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'pickup-return', label: 'Pickup & Return', icon: <RotateCcw className="w-4 h-4" /> },
    { id: 'deposits', label: 'Security Deposits', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'late-fees', label: 'Late Fee Engine', icon: <Clock className="w-4 h-4" /> },
    { id: 'products', label: 'Products & Rates', icon: <Package className="w-4 h-4" /> },
    { id: 'customers', label: 'Customers CRM', icon: <Users className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports & Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'System Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside
      className={`relative sticky top-0 h-screen bg-[#0D0B0B] text-[#F5F3F3] border-r border-[#5C4E4E]/40 flex flex-col transition-all duration-300 z-30 shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-between px-4 border-b border-[#5C4E4E]/40">
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 cursor-pointer overflow-hidden"
        >
          <img src="/rovia_logo.jpg" alt="ROVIA Logo" className="w-10 h-10 object-contain rounded shrink-0" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-heading text-lg font-bold tracking-tight text-white">ROVIA OPS</span>
              <span className="text-[9px] uppercase tracking-widest text-[#988686]">ADMIN CONSOLE</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md bg-[#211D1D] text-[#988686] hover:text-white transition-colors"
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
                  ? 'bg-[#988686] text-white shadow-warm-sm font-bold'
                  : 'text-[#B5A9A9] hover:bg-[#211D1D] hover:text-white'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <span className="shrink-0 text-[#D1D0D0]">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.id === 'dashboard' && (
                <span className="ml-auto w-2 h-2 rounded-full bg-[#5E7A63] animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Customer Storefront Switcher */}
      <div className="p-3 border-t border-[#5C4E4E]/40">
        <button
          onClick={() => switchMode('customer')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#5C4E4E]/50 hover:bg-[#5C4E4E] text-white text-xs font-semibold transition-colors"
        >
          <Store className="w-4 h-4 text-[#988686]" />
          {!collapsed && <span>View Storefront</span>}
        </button>
      </div>
    </aside>
  );
};
