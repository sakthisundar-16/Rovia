import React from 'react';
import { ShoppingBag, User, LogIn, Shield, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

interface CustomerHeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({ currentTab, onNavigate }) => {
  const { items } = useCart();
  const { user, switchMode } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { id: 'landing', label: 'Home' },
    { id: 'catalog', label: 'Catalog' },
    { id: 'my-rentals', label: 'My Rentals' },
    { id: 'return-flow', label: 'Return Guide' },
  ];

  return (
    <header className="sticky top-0 z-40 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo with uploaded image */}
        <div
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img
            src="/rovia_logo.jpg"
            alt="ROVIA Logo"
            className="w-11 h-11 object-contain rounded-lg shadow-warm-sm group-hover:scale-105 transition-transform duration-300"
          />
          <div className="flex flex-col">
            <span className="font-heading text-2xl font-bold tracking-tight text-[#000000] dark:text-[#F5F3F3]">
              ROVIA
            </span>
            <span className="text-[9px] uppercase tracking-widest text-[#988686] font-semibold -mt-1">
              RENT • USE • RETURN • REUSE
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`text-sm font-medium transition-colors relative py-1 ${
                currentTab === link.id
                  ? 'text-[#988686] font-semibold'
                  : 'text-[#5C4E4E] dark:text-[#B5A9A9] hover:text-[#000000] dark:hover:text-white'
              }`}
            >
              {link.label}
              {currentTab === link.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#988686] rounded-full animate-fadeIn" />
              )}
            </button>
          ))}
        </nav>

        {/* Actions & Switch Mode */}
        <div className="hidden md:flex items-center gap-4">
          {/* Cart Icon */}
          <button
            onClick={() => onNavigate('cart')}
            className="relative p-2.5 rounded-lg glass-panel hover:bg-[#988686]/20 transition-colors text-[#000000] dark:text-white"
            title="Cart & Rental Period"
          >
            <ShoppingBag className="w-5 h-5 text-[#988686]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#5E7A63] text-white text-[10px] font-bold flex items-center justify-center shadow-warm-sm animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          {/* Sign In */}
          <button
            onClick={() => onNavigate('auth')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#000000] hover:bg-[#3D3333] text-white text-xs font-semibold shadow-warm-sm transition-all"
            title="Sign in as Customer, Renter or Admin"
          >
            <LogIn className="w-3.5 h-3.5 text-[#988686]" />
            <span>Sign In</span>
          </button>

          {/* User Account / Auth */}
          <button
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-panel hover:border-[#988686]/50 transition-all text-xs font-medium text-[#000000] dark:text-white"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-[#988686]" />
            )}
            <span className="truncate max-w-[100px]">{user?.name || 'Account'}</span>
          </button>

          {/* Portal Switcher Button */}
          <button
            onClick={() => switchMode('admin')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5C4E4E] hover:bg-[#3D3333] text-white text-xs font-semibold shadow-warm-sm transition-all"
          >
            <Shield className="w-3.5 h-3.5 text-[#988686]" />
            <span>Admin Ops Console</span>
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#000000] dark:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-[#988686]/30 px-4 py-4 flex flex-col gap-3 animate-fadeIn">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className="text-left text-sm font-semibold py-2 text-[#000000] dark:text-white border-b border-[#988686]/20"
            >
              {link.label}
            </button>
          ))}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                onNavigate('auth');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-xs font-semibold text-[#000000]"
            >
              <LogIn className="w-4 h-4 text-[#988686]" /> Sign In
            </button>
            <button
              onClick={() => {
                onNavigate('cart');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-xs font-semibold text-[#988686]"
            >
              <ShoppingBag className="w-4 h-4" /> Cart ({cartCount})
            </button>
            <button
              onClick={() => switchMode('admin')}
              className="px-3 py-1.5 rounded bg-[#5C4E4E] text-white text-xs font-semibold"
            >
              Admin Console
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
