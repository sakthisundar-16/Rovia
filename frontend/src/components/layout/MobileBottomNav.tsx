import React from 'react';
import { 
  Home, 
  LayoutGrid, 
  MapPin, 
  ClipboardList, 
  User, 
  ShoppingBag 
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

interface MobileBottomNavProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenCategories?: () => void;
}

/**
 * Flipkart-style Mobile Bottom Navigation Bar
 * Pinned to the bottom of the screen on smartphones (< md breakpoint)
 */
export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onNavigate,
  onOpenCategories
}) => {
  const { items } = useCart();
  const { user } = useAuth();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const tabs = [
    { id: 'catalog', label: 'Explore', icon: <Home className="w-5 h-5" /> },
    { id: 'categories', label: 'Categories', icon: <LayoutGrid className="w-5 h-5" /> },
    { id: 'property-map', label: 'Properties', icon: <MapPin className="w-5 h-5" /> },
    { id: 'my-rentals', label: 'Rentals', icon: <ClipboardList className="w-5 h-5" /> },
    { id: user && user.id !== 'guest' ? 'profile' : 'auth', label: 'Account', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0D0B0B]/95 backdrop-blur-lg border-t border-[#988686]/20 shadow-warm-lg py-1 px-2 flex items-center justify-around safe-bottom">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id || (tab.id === 'catalog' && currentTab === 'landing');

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              if (tab.id === 'categories' && onOpenCategories) {
                onOpenCategories();
              } else {
                onNavigate(tab.id);
              }
            }}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative fk-btn-press ${
              isActive
                ? 'text-[#000000] dark:text-white font-bold scale-105'
                : 'text-[#5C4E4E] dark:text-[#B5A9A9] opacity-75 hover:opacity-100'
            }`}
          >
            <div className="relative">
              {tab.icon}
              {tab.id === 'my-rentals' && cartCount > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-[#000000] text-white dark:bg-white dark:text-black text-[9px] font-black flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              {tab.label}
            </span>
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-[#000000] dark:bg-white mt-0.5" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
