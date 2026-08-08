import React, { useState } from 'react';
import { ShieldCheck, ShoppingBag, ArrowLeft, Check, Star, Info, Building, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { DateRangePicker } from '../../components/ui/DateRangePicker';
import { UNIVERSAL_PRODUCTS, Product } from '../../services/mockData';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/ui/Toast';

interface ProductDetailProps {
  productId?: string;
  onNavigate: (tab: string, productId?: string) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ productId, onNavigate }) => {
  const product = UNIVERSAL_PRODUCTS.find((p: Product) => p.id === productId) || UNIVERSAL_PRODUCTS[0];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0] || 'Default Edition');
  const [startDate, setStartDate] = useState('2026-08-10');
  const [endDate, setEndDate] = useState('2026-08-13');
  const [quantity, setQuantity] = useState(1);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'Delivery' | 'Store Pickup'>('Delivery');

  const { addItem } = useCart();
  const { showToast } = useToast();

  const calculateDays = (s: string, e: string) => {
    const diff = Math.max(1, Math.ceil((new Date(e).getTime() - new Date(s).getTime()) / (1000 * 60 * 60 * 24)));
    return diff;
  };

  const days = calculateDays(startDate, endDate);
  const rentalTotal = product.dailyRate * days * quantity;
  const depositTotal = product.securityDeposit * quantity;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      category: product.category,
      image: product.image,
      variant: selectedVariant,
      dailyRate: product.dailyRate,
      securityDeposit: product.securityDeposit,
      startDate,
      endDate,
      quantity,
    });
    showToast('Added to Rental Cart', `${product.name} booked from ${product.renterName}`, 'success');
  };

  const handleRentNow = () => {
    handleAddToCart();
    onNavigate('cart');
  };

  return (
    <div className="w-full space-y-12 page-transition pb-16">
      {/* Back Button */}
      <button
        onClick={() => onNavigate('catalog')}
        className="flex items-center gap-2 text-xs font-semibold text-[#988686] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </button>

      {/* Main Grid: Gallery Left, Sticky Booking Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Image Gallery & Seller Card */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden glass-panel border border-[#988686]/30 shadow-2xl">
            <img
              src={product.gallery[activeImageIndex] || product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute top-4 left-4">
              <Badge variant="success">Verified Inspection Checked</Badge>
            </div>
          </div>

          {/* Thumbnails */}
          {product.gallery.length > 1 && (
            <div className="flex items-center gap-3">
              {product.gallery.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden glass-panel border transition-all ${
                    activeImageIndex === idx
                      ? 'border-[#988686] ring-2 ring-[#988686]/40 scale-105'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Renter Seller Badge Card */}
          <div className="glass-panel p-5 rounded-2xl border border-[#988686]/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-[#988686]/20 text-[#988686]">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-[#988686]">MARKETPLACE SELLER / VENDOR</span>
                <h4 className="font-bold text-base text-[#000000] dark:text-white">{product.renterName}</h4>
                <p className="text-xs text-[#5C4E4E] dark:text-[#B5A9A9] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-[#988686]" /> Store Pickup Location: Mumbai HQ Atelier
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="success">Verified Seller</Badge>
              <div className="text-xs font-mono font-bold text-[#B08A4E] mt-1">4.9 ★ Rating</div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Booking Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#988686]/30 shadow-2xl space-y-6 sticky top-24">
            <div>
              <span className="text-xs font-mono uppercase text-[#988686] tracking-widest">{product.category} • SKU: {product.sku}</span>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#000000] dark:text-white mt-1">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-[#B08A4E]">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-xs font-bold ml-1">{product.rating}</span>
                </div>
                <span className="text-xs text-[#988686]">• 100% On-Time Return Deposit Protection</span>
              </div>
            </div>

            {/* Variant Selector */}
            {product.variants.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#5C4E4E] dark:text-[#B5A9A9]">
                  Configuration / Variant
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: string) => (
                    <button
                      key={v}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        selectedVariant === v
                          ? 'bg-[#988686] text-white border-[#988686] shadow-warm-sm'
                          : 'glass-panel text-[#5C4E4E] dark:text-[#B5A9A9] border-[#D1D0D0]/50 dark:border-[#5C4E4E]/30 hover:border-[#988686]'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Fulfillment Selector: Delivery vs Store Pickup */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5C4E4E] dark:text-[#B5A9A9]">
                Fulfillment Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFulfillmentMethod('Delivery')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    fulfillmentMethod === 'Delivery'
                      ? 'bg-[#988686] text-white border-[#988686] shadow-warm-sm'
                      : 'glass-panel text-[#5C4E4E] dark:text-[#B5A9A9] border-[#D1D0D0]/50 dark:border-[#5C4E4E]/30'
                  }`}
                >
                  🚚 Courier Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setFulfillmentMethod('Store Pickup')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    fulfillmentMethod === 'Store Pickup'
                      ? 'bg-[#988686] text-white border-[#988686] shadow-warm-sm'
                      : 'glass-panel text-[#5C4E4E] dark:text-[#B5A9A9] border-[#D1D0D0]/50 dark:border-[#5C4E4E]/30'
                  }`}
                >
                  🏬 Store Pickup
                </button>
              </div>
            </div>

            {/* Rental Window Picker Component */}
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={(s, e) => { setStartDate(s); setEndDate(e); }}
            />

            {/* Live Pricing Breakdown Box */}
            <div className="p-4 rounded-xl bg-[#988686]/10 border border-[#988686]/20 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#5C4E4E] dark:text-[#B5A9A9]">Daily Rate:</span>
                <span className="font-mono font-bold">₹{product.dailyRate.toLocaleString()} / day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C4E4E] dark:text-[#B5A9A9]">Duration ({days} Days):</span>
                <span className="font-mono font-bold">₹{rentalTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#5E7286] pt-1 border-t border-[#988686]/20">
                <span className="font-semibold">Refundable Security Deposit:</span>
                <span className="font-mono font-bold">₹{depositTotal.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-[#5E7A63] font-medium pt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Deposit is 100% refunded upon on-time return inspection.
              </p>
            </div>

            {/* Quantity Selector & CTAs */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-[#5C4E4E] dark:text-[#B5A9A9]">Quantity</span>
                <div className="flex items-center gap-3 glass-input px-3 py-1 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="font-bold text-sm text-[#988686]"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="font-bold text-sm text-[#988686]"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button variant="outline" size="lg" onClick={handleAddToCart} leftIcon={<ShoppingBag className="w-4 h-4" />}>
                  Add to Cart
                </Button>
                <Button variant="primary" size="lg" onClick={handleRentNow}>
                  Rent Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
