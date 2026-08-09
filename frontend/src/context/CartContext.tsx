import React, { createContext, useContext, useState, useMemo } from 'react';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  category: string;
  image: string;
  variant: string;
  dailyRate: number;
  securityDeposit: number;
  startDate: string;
  endDate: string;
  days: number;
  quantity: number;
  available: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id' | 'days'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  updateDates: (id: string, startDate: string, endDate: string) => void;
  clearCart: () => void;
  promoCode: string;
  setPromoCode: (code: string) => void;
  discount: number;
  applyPromo: (code: string) => boolean;
  rentalSubtotal: number;
  depositTotal: number;
  taxes: number;
  grandTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([
    {
      id: 'cart-1',
      productId: 'prod-1',
      name: 'Hasselblad X2D 100C Medium Format Camera',
      category: 'Photography & Cinema',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600',
      variant: '100MP Kit / Matte Obsidian',
      dailyRate: 4500,
      securityDeposit: 25000,
      startDate: '2026-08-10',
      endDate: '2026-08-13',
      days: 3,
      quantity: 1,
      available: 5,
    },
    {
      id: 'cart-2',
      productId: 'prod-3',
      name: 'Aputure LS 1200d Pro Daylight LED Stream',
      category: 'Lighting Systems',
      image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=600',
      variant: '1200W Bowens Mount',
      dailyRate: 2200,
      securityDeposit: 12000,
      startDate: '2026-08-10',
      endDate: '2026-08-13',
      days: 3,
      quantity: 1,
      available: 10,
    }
  ]);

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const calculateDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
    return diff;
  };

  const addItem = (item: Omit<CartItem, 'id' | 'days'>) => {
    const days = calculateDays(item.startDate, item.endDate);
    const id = 'cart-' + Date.now();
    setItems(prev => [...prev, { ...item, id, days }]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newQty = Math.max(1, Math.min(item.available || 100, item.quantity + delta));
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const updateDates = (id: string, startDate: string, endDate: string) => {
    const days = calculateDays(startDate, endDate);
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, startDate, endDate, days } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    setDiscount(0);
    setPromoCode('');
  };

  const applyPromo = (code: string) => {
    if (code.toUpperCase() === 'GOTHIC10' || code.toUpperCase() === 'ROVIAVIP') {
      setPromoCode(code.toUpperCase());
      setDiscount(0.15); // 15% discount on rental cost
      return true;
    }
    return false;
  };

  const rentalSubtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.dailyRate * item.days * item.quantity, 0);
  }, [items]);

  const depositTotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.securityDeposit * item.quantity, 0);
  }, [items]);

  const discountAmount = rentalSubtotal * discount;
  const taxes = (rentalSubtotal - discountAmount) * 0.18; // 18% GST/Tax on rental component
  const grandTotal = rentalSubtotal - discountAmount + taxes + depositTotal;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        updateDates,
        clearCart,
        promoCode,
        setPromoCode,
        discount: discountAmount,
        applyPromo,
        rentalSubtotal,
        depositTotal,
        taxes,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
