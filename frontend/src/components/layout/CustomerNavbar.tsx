import React, { useState } from 'react';
import {
  ShoppingBag,
  User,
  LogIn,
  Menu,
  X,
  ClipboardList,
  RotateCcw,
  Search,
  LogOut,
  Award,
  Bell,
  Check,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

interface CustomerNavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const CustomerNavbar: React.FC<CustomerNavbarProps> = ({ currentTab, onNavigate }) => {
  const { items } = useCart();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [customerNotifs, setCustomerNotifs] = useState([
    {
      id: 'cn-1',
      title: 'Order Status: Ready for Pickup',
      message: 'Your rental reservation has been verified. Pick up at Mumbai HQ Atelier.',
      time: '12m ago',
      read: false,
      tab: 'my-rentals',
    },
    {
      id: 'cn-2',
      title: 'OpenCV Damage Inspection: Pristine',
      message: '0 defects found during check-in. 100% deposit refund (₹25,000) processed.',
      time: '1h ago',
      read: false,
      tab: 'my-rentals',
    },
    {
      id: 'cn-3',
      title: 'Promotional Reward Unlocked',
      message: 'Use VIP promo code ROVIAVIP to get 15% discount on camera rigs.',
      time: '1d ago',
      read: true,
      tab: 'catalog',
    }
  ]);
  const unreadCustCount = customerNotifs.filter(n => !n.read).length;

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const isLoggedIn = user && user.id !== 'guest';

  const navLinks = [
    { id: 'catalog', label: 'Browse Catalog', icon: <Search className="w-3.5 h-3.5" /> },
    { id: 'my-rentals', label: 'My Rentals', icon: <ClipboardList className="w-3.5 h-3.5" /> },
    { id: 'trust-score', label: 'Trust Score', icon: <Award className="w-3.5 h-3.5" /> },
    { id: 'return-flow', label: 'Return Guide', icon: <RotateCcw className="w-3.5 h-3.5" /> },
  ];

  const handleLogout = () => {
    logout();
    onNavigate('landing');
  };

  return (
    <header className="sticky top-0 z-40 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Brand */}
        <div
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <img src="/rovia_logo.jpg" alt="ROVIA" className="w-9 h-9 object-contain rounded-lg shadow-warm-sm group-hover:scale-105 transition-transform duration-300" />
          <div className="flex flex-col leading-none">
            <span className="font-heading text-xl font-bold text-[#000000] dark:text-white tracking-tight">ROVIA</span>
            <span className="text-[8px] uppercase tracking-[0.18em] text-[#988686] font-bold">CUSTOMER PORTAL</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all relative ${
                currentTab === link.id
                  ? 'text-[#000000] dark:text-white font-bold'
                  : 'text-[#5C4E4E] dark:text-[#B5A9A9] hover:text-[#000000] dark:hover:text-white hover:bg-[#988686]/10'
              }`}
            >
              <span className={currentTab === link.id ? 'text-[#988686]' : 'text-[#988686]/60'}>
                {link.icon}
              </span>
              {link.label}
              {currentTab === link.id && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#988686] rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* Cart */}
          <button
            onClick={() => onNavigate('cart')}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#5C4E4E] dark:text-[#B5A9A9] hover:bg-[#988686]/10 hover:text-[#000000] dark:hover:text-white transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-[#988686]" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#5C4E4E] text-white text-[9px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Customer Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className={`relative flex items-center gap-1.5 p-2 rounded-lg text-xs font-semibold transition-all ${
                unreadCustCount > 0
                  ? 'text-[#A0524E] bg-[#A0524E]/10 border border-[#A0524E]/30'
                  : 'text-[#5C4E4E] dark:text-[#B5A9A9] hover:bg-[#988686]/10 hover:text-[#000000] dark:hover:text-white'
              }`}
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCustCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#A0524E] text-white text-[9px] font-bold flex items-center justify-center shadow-md animate-pulse">
                  {unreadCustCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl border border-[#988686]/40 shadow-2xl p-4 z-50 text-xs animate-fadeIn bg-white/95 dark:bg-[#161313]/95 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-[#5C4E4E]/20 pb-2.5 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-[#988686]" />
                    <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#000000] dark:text-white">
                      Rental Alerts ({unreadCustCount})
                    </span>
                  </div>
                  {unreadCustCount > 0 && (
                    <button
                      onClick={() => setCustomerNotifs(prev => prev.map(n => ({ ...n, read: true })))}
                      className="text-[10px] text-[#988686] hover:text-[#000000] dark:hover:text-white font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto">
                  {customerNotifs.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setCustomerNotifs(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                        setNotificationsOpen(false);
                        onNavigate(n.tab);
                      }}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        n.read
                          ? 'bg-[#988686]/5 border-[#988686]/15 opacity-70'
                          : 'bg-[#988686]/10 border-[#988686]/30 hover:border-[#988686]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-bold text-[11px] text-[#000000] dark:text-white">{n.title}</span>
                        <span className="text-[9px] text-[#988686] shrink-0 font-mono">{n.time}</span>
                      </div>
                      <p className="text-[10px] text-[#5C4E4E] dark:text-[#B5A9A9] mt-0.5 leading-tight">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Auth */}
          {isLoggedIn ? (
            <>
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-panel border border-[#988686]/30 hover:border-[#988686]/60 text-xs font-semibold text-[#000000] dark:text-white transition-all"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <User className="w-3.5 h-3.5 text-[#988686]" />
                )}
                <span className="max-w-[90px] truncate">{user.name}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 p-2 rounded-lg text-[#988686] hover:text-[#5C4E4E] hover:bg-[#988686]/10 transition-all"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => onNavigate('auth')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#000000] hover:bg-[#3D3333] text-white text-xs font-bold shadow-warm-sm transition-all"
            >
              <LogIn className="w-3.5 h-3.5 text-[#988686]" />
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-[#000000] dark:text-white">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden glass-panel border-t border-[#988686]/20 px-4 py-4 flex flex-col gap-2 animate-fadeIn">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => { onNavigate(link.id); setMobileOpen(false); }}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-all ${
                currentTab === link.id
                  ? 'bg-[#988686]/15 text-[#000000] dark:text-white'
                  : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
              }`}
            >
              {link.icon} {link.label}
            </button>
          ))}
          {/* Mobile Notifications Preview */}
          <div className="pt-2 border-t border-[#988686]/20">
            <div className="flex items-center justify-between text-xs font-bold text-[#5C4E4E] dark:text-[#B5A9A9] mb-2">
              <span className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-[#988686]" /> Notifications
              </span>
              {unreadCustCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#A0524E] text-white text-[9px] font-bold">
                  {unreadCustCount} new
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
              {customerNotifs.map(n => (
                <div
                  key={n.id}
                  onClick={() => { onNavigate(n.tab); setMobileOpen(false); }}
                  className="p-2 rounded-lg bg-[#988686]/10 text-left cursor-pointer hover:bg-[#988686]/20 transition-colors"
                >
                  <p className="text-[11px] font-bold text-[#000000] dark:text-white leading-tight">{n.title}</p>
                  <p className="text-[10px] text-[#5C4E4E] dark:text-[#B5A9A9] truncate">{n.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#988686]/20">
            <button
              onClick={() => { onNavigate('cart'); setMobileOpen(false); }}
              className="flex items-center gap-2 text-sm font-semibold text-[#5C4E4E] dark:text-[#B5A9A9]"
            >
              <ShoppingBag className="w-4 h-4 text-[#988686]" /> Cart ({cartCount})
            </button>
            {!isLoggedIn ? (
              <button
                onClick={() => { onNavigate('auth'); setMobileOpen(false); }}
                className="px-4 py-2 rounded-lg bg-[#000000] text-white text-xs font-bold"
              >
                Sign In
              </button>
            ) : (
              <button
                onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="px-4 py-2 rounded-lg bg-[#988686]/20 text-[#5C4E4E] dark:text-[#B5A9A9] text-xs font-bold"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
