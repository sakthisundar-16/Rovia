import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  UserRound,
  DollarSign,
  Scale,
  ShieldAlert,
  Clock,
  FileText,
  RotateCcw,
  Bell,
  Search,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminNavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ currentTab, onNavigate }) => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Platform Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'renters', label: 'Renters Governance', icon: <Building className="w-4 h-4" /> },
    { id: 'products', label: 'All Marketplace Products', icon: <Package className="w-4 h-4" /> },
    { id: 'orders', label: 'All Platform Orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'customers', label: 'Customer CRM', icon: <Users className="w-4 h-4" /> },
    { id: 'disputes', label: 'Dispute Arbitration', icon: <Scale className="w-4 h-4" /> },
    { id: 'payouts', label: 'Renter Payouts & Fees', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'pickup-return', label: 'Pickup & Return', icon: <RotateCcw className="w-4 h-4" /> },
    { id: 'deposits', label: 'Security Deposits', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'late-fees', label: 'Late Fee Engine', icon: <Clock className="w-4 h-4" /> },
    { id: 'quotations', label: 'Quotation Templates', icon: <FileText className="w-4 h-4" /> },
    { id: 'reports', label: 'Platform Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Platform Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'profile', label: 'My Account Profile', icon: <UserRound className="w-4 h-4" /> },
  ];

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
          <img src="/rovia_logo.jpg" alt="ROVIA" className="w-10 h-10 object-contain rounded shrink-0" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-heading text-lg font-bold tracking-tight text-[#000000] dark:text-white">ROVIA</span>
              <span className="text-[9px] uppercase tracking-widest text-[#988686] font-bold flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" /> PLATFORM ADMIN
              </span>
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

      {/* Search (only when expanded) */}
      {!collapsed && (
        <div className="px-3 pt-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#988686]" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full glass-input rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#000000] dark:text-white placeholder-[#988686] focus:outline-none focus:border-[#988686] transition-all"
            />
          </div>
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
              {!collapsed && item.id === 'dashboard' && (
                <span className="ml-auto w-2 h-2 rounded-full bg-[#5E7A63] animate-pulse shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer — Profile + Logout */}
      <div className="p-3 border-t border-[#5C4E4E]/15">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 text-xs text-[#5C4E4E] dark:text-[#B5A9A9] hover:text-[#000000] dark:hover:text-white transition-colors truncate"
            >
              {user?.avatar && (
                <img src={user.avatar} alt={user?.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
              )}
              <div className="text-left truncate">
                <p className="font-bold text-[#000000] dark:text-white truncate max-w-[110px]">{user?.name}</p>
                <p className="text-[9px] text-[#988686]">Platform Admin</p>
              </div>
            </button>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-[#988686] hover:bg-[#988686]/10 hover:text-[#5C4E4E] transition-all shrink-0"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
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
  );
};
