import React from 'react';
import { Trash2, ShieldCheck, ArrowRight, ShoppingBag, Tag } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/ui/Toast';

export const Cart: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const {
    items,
    removeItem,
    updateQuantity,
    updateDates,
    promoCode,
    applyPromo,
    rentalSubtotal,
    depositTotal,
    taxes,
    grandTotal,
    discount,
  } = useCart();

  const [promoInput, setPromoInput] = React.useState('');
  const { showToast } = useToast();

  const handleApplyPromo = () => {
    if (applyPromo(promoInput)) {
      showToast('Promo Code Applied!', '15% discount applied on rental subtotal.', 'success');
    } else {
      showToast('Invalid Code', 'Try GOTHIC10 or ROVIAVIP', 'error');
    }
  };

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your Rental Cart is Empty"
        description="Explore our curated catalog of Hasselblad medium format cameras, RED 8K cinema rigs, and luxury editorial sets."
        actionText="Browse Inventory Catalog"
        onAction={() => onNavigate('catalog')}
      />
    );
  }

  return (
    <div className="w-full space-y-8 page-transition pb-16">
      {/* Header */}
      <div className="border-b border-[#D1D0D0]/40 dark:border-[#5C4E4E]/40 pb-4">
        <span className="text-xs font-mono uppercase text-[#988686] tracking-widest">RESERVATION BAG</span>
        <h1 className="font-heading text-4xl font-bold text-[#000000] dark:text-white mt-1">
          Rental Cart & Period Selection
        </h1>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="flex flex-col sm:flex-row items-center gap-5 p-5">
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl shrink-0"
              />

              <div className="flex-1 space-y-2 w-full">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#988686] uppercase">{item.category}</span>
                    <h3 className="font-heading text-base font-bold text-[#000000] dark:text-white line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[#988686]">{item.variant}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 rounded-lg text-[#988686] hover:text-[#A0524E] hover:bg-[#A0524E]/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Inline Rental Window Editor */}
                <div className="flex flex-wrap items-center gap-3 text-xs bg-[#988686]/10 p-2.5 rounded-xl border border-[#988686]/20">
                  <div className="flex items-center gap-1">
                    <span className="text-[#988686] font-mono text-[10px] uppercase">Window:</span>
                    <input
                      type="date"
                      value={item.startDate}
                      onChange={(e) => updateDates(item.id, e.target.value, item.endDate)}
                      className="bg-transparent text-[#000000] dark:text-white font-medium focus:outline-none"
                    />
                    <span className="text-[#988686]">→</span>
                    <input
                      type="date"
                      value={item.endDate}
                      min={item.startDate}
                      onChange={(e) => updateDates(item.id, item.startDate, e.target.value)}
                      className="bg-transparent text-[#000000] dark:text-white font-medium focus:outline-none"
                    />
                  </div>
                  <span className="font-bold text-[#988686] font-mono ml-auto">({item.days} Days)</span>
                </div>

                {/* Rates & Quantity */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#5C4E4E] dark:text-[#B5A9A9]">Qty:</span>
                    <div className="flex items-center gap-2 glass-input px-2 py-0.5 rounded">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)} 
                        disabled={item.quantity <= 1}
                        className={`font-bold ${item.quantity <= 1 ? 'text-[#988686]/30 cursor-not-allowed' : 'text-[#988686]'}`}
                      >-</button>
                      <span className="font-mono font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)} 
                        disabled={item.quantity >= (item.available || 100)}
                        className={`font-bold ${item.quantity >= (item.available || 100) ? 'text-[#988686]/30 cursor-not-allowed' : 'text-[#988686]'}`}
                      >+</button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-[#988686] block">Rental + Deposit:</span>
                    <span className="font-mono font-bold text-sm text-[#000000] dark:text-white">
                      ₹{(item.dailyRate * item.days * item.quantity).toLocaleString()}{' '}
                      <span className="text-xs text-[#5E7286] font-normal">+ ₹{(item.securityDeposit * item.quantity).toLocaleString()} dep</span>
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Right Column: Sticky Order Summary Card */}
        <div className="lg:col-span-4">
          <div className="glass-panel p-6 rounded-3xl border border-[#988686]/30 shadow-2xl space-y-6 sticky top-24">
            <h2 className="font-heading text-xl font-bold text-[#000000] dark:text-white border-b border-[#D1D0D0]/40 dark:border-[#5C4E4E]/40 pb-3">
              Order Summary
            </h2>

            {/* Promo Code Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-[#5C4E4E] dark:text-[#B5A9A9]">Promo Code</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Try GOTHIC10"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="text-xs uppercase"
                  leftIcon={<Tag className="w-3.5 h-3.5" />}
                />
                <Button size="sm" variant="outline" onClick={handleApplyPromo}>
                  Apply
                </Button>
              </div>
              {promoCode && (
                <span className="text-[11px] text-[#5E7A63] font-bold block">
                  ✓ Promo "{promoCode}" applied (-15%)
                </span>
              )}
            </div>

            {/* Price Breakdown Stack */}
            <div className="space-y-2.5 text-xs border-t border-b border-[#D1D0D0]/40 dark:border-[#5C4E4E]/40 py-4">
              <div className="flex justify-between">
                <span className="text-[#5C4E4E] dark:text-[#B5A9A9]">Rental Subtotal:</span>
                <span className="font-mono font-bold">₹{rentalSubtotal.toLocaleString()}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-[#5E7A63]">
                  <span>Promo Discount:</span>
                  <span className="font-mono font-bold">-₹{discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-[#5C4E4E] dark:text-[#B5A9A9]">Taxes (18% GST):</span>
                <span className="font-mono font-bold">₹{taxes.toLocaleString()}</span>
              </div>

              {/* Visually Distinct Deposit Callout */}
              <div className="flex justify-between p-2.5 rounded-xl bg-[#5E7286]/15 border border-[#5E7286]/30 text-[#5E7286]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span className="font-bold">Refundable Deposit:</span>
                </div>
                <span className="font-mono font-bold">₹{depositTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-[#988686] uppercase block">Grand Total Payable</span>
                <span className="text-[10px] text-[#5E7A63] font-medium">Includes 100% refundable deposit</span>
              </div>
              <span className="font-heading text-2xl font-bold font-mono text-[#000000] dark:text-white">
                ₹{grandTotal.toLocaleString()}
              </span>
            </div>

            <Button
              size="lg"
              variant="primary"
              className="w-full"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              onClick={() => onNavigate('checkout')}
            >
              Continue to Delivery & Payment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
