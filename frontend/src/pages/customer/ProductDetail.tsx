import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShoppingBag,
  ArrowLeft,
  Check,
  Star,
  Info,
  Building,
  MapPin,
  Truck,
  Clock,
  Tag,
  Share2,
  Heart,
  Box,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  ThumbsUp,
  Calendar,
  Sparkles,
  Zap,
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Product, UNIVERSAL_PRODUCTS } from '../../services/mockData';
import { EXTENDED_PRODUCTS } from '../../services/productsData';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/ui/Toast';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=800';

interface ProductDetailProps {
  productId?: string;
  onNavigate: (tab: string, productId?: string) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ productId, onNavigate }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Gallery & Image State
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Rental Configuration
  const [selectedVariant, setSelectedVariant] = useState('Standard Edition');
  const [startDate, setStartDate] = useState('2026-08-10');
  const [endDate, setEndDate] = useState('2026-08-13');
  const [quantity, setQuantity] = useState(1);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'Delivery' | 'Store Pickup'>('Delivery');

  // Pincode & Delivery Checker State
  const [pincode, setPincode] = useState('400001');
  const [pincodeChecked, setPincodeChecked] = useState(true);
  const [deliveryEstimate, setDeliveryEstimate] = useState('Express Delivery by Tomorrow, 2:00 PM');

  // Active Specifications Tab
  const [activeTab, setActiveTab] = useState<'specs' | 'box' | 'insurance' | 'reviews'>('specs');

  const { addItem } = useCart();
  const { showToast } = useToast();

  // Load product across all 300+ items
  useEffect(() => {
    setLoading(true);
    if (!productId) {
      setProduct(UNIVERSAL_PRODUCTS[0]);
      setLoading(false);
      return;
    }

    // Check API / local state
    api.getProductById(productId).then((found) => {
      if (found) {
        setProduct(found);
        setSelectedVariant(found.variants?.[0] || 'Standard Edition');
      } else {
        // Fallback search across extended products
        const fallback = EXTENDED_PRODUCTS.find((p) => p.id === productId) || UNIVERSAL_PRODUCTS.find((p) => p.id === productId) || UNIVERSAL_PRODUCTS[0];
        setProduct(fallback);
        setSelectedVariant(fallback.variants?.[0] || 'Standard Edition');
      }
      setLoading(false);
    });
  }, [productId]);

  if (loading || !product) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#988686] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono uppercase text-[#988686] tracking-wider">Loading Product Details...</span>
      </div>
    );
  }

  // Gallery preparation: guaranteed 4 angles (Flipkart / Amazon style)
  const gallery = product.gallery && product.gallery.length > 0
    ? product.gallery
    : [product.image, product.image, product.image, product.image];

  const ANGLE_LABELS = ['Front / Main', 'Side Profile', 'Rear / Ports', 'Detail / Kit'];

  const calculateDays = (s: string, e: string) => {
    const diff = Math.max(1, Math.ceil((new Date(e).getTime() - new Date(s).getTime()) / (1000 * 60 * 60 * 24)));
    return diff;
  };

  const days = calculateDays(startDate, endDate);
  const rentalTotal = product.dailyRate * days * quantity;
  const depositTotal = product.securityDeposit * quantity;

  // Strikethrough rate calculation (approx 20% higher MRP)
  const regularRate = Math.round(product.dailyRate * 1.22);
  const discountPercent = Math.round(((regularRate - product.dailyRate) / regularRate) * 100);

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || pincode.trim().length < 6) {
      showToast('Invalid Pincode', 'Please enter a valid 6-digit postal code', 'error');
      return;
    }
    setPincodeChecked(true);
    setDeliveryEstimate('Express Delivery by Tomorrow, 2:00 PM • Cash on Delivery / Escrow Eligible');
    showToast('Delivery Available', `Direct dispatch available for PIN ${pincode}`, 'success');
  };

  const handleAddToCart = () => {
    if (product.available <= 0) {
      showToast('Out of Stock', 'This asset is currently rented out.', 'error');
      return;
    }
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
      available: product.available,
    });
    showToast('Added to Rental Bag', `${product.name} booked for ${days} days.`, 'success');
  };

  const handleRentNow = () => {
    handleAddToCart();
    onNavigate('cart');
  };

  // Recommended bundle product (Amazon "Frequently Rented Together")
  const bundleProduct = EXTENDED_PRODUCTS.find((p) => p.category === product.category && p.id !== product.id) || EXTENDED_PRODUCTS[0];

  const handleAddBundle = () => {
    handleAddToCart();
    if (bundleProduct) {
      addItem({
        productId: bundleProduct.id,
        name: bundleProduct.name,
        category: bundleProduct.category,
        image: bundleProduct.image,
        variant: bundleProduct.variants?.[0] || 'Standard Package',
        dailyRate: bundleProduct.dailyRate,
        securityDeposit: bundleProduct.securityDeposit,
        startDate,
        endDate,
        quantity: 1,
        available: bundleProduct.available,
      });
      showToast('Bundle Added!', `Added ${product.name} + ${bundleProduct.name} to your bag.`, 'success');
    }
  };

  return (
    <div className="w-full space-y-8 page-transition pb-24">
      {/* Breadcrumb Navigation (Flipkart/Amazon Standard) */}
      <div className="flex items-center justify-between border-b border-[#988686]/20 pb-3 text-xs">
        <div className="flex items-center gap-2 text-[#988686] flex-wrap">
          <button onClick={() => onNavigate('catalog')} className="hover:text-white transition-colors">
            Catalog
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="hover:text-white cursor-pointer">{product.category}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="hover:text-white cursor-pointer">{product.brand}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#000000] dark:text-white font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsWishlisted(!isWishlisted);
              showToast(isWishlisted ? 'Removed from Saved' : 'Saved for Later', product.name, 'info');
            }}
            className={`p-2 rounded-xl glass-panel border transition-all flex items-center gap-1.5 ${
              isWishlisted ? 'text-[#A0524E] border-[#A0524E]' : 'text-[#988686] hover:text-white border-[#988686]/30'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            <span className="text-[11px] font-semibold hidden sm:inline">{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              showToast('Link Copied', 'Product link copied to clipboard', 'success');
            }}
            className="p-2 rounded-xl glass-panel border border-[#988686]/30 text-[#988686] hover:text-white transition-all flex items-center gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-[11px] font-semibold hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Marketplace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Vertical Filmstrip + Main Image Zoom (Flipkart/Amazon Style) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-col-reverse sm:flex-row gap-4">
            {/* Vertical Thumbnail Strip on the Left */}
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible shrink-0 pb-2 sm:pb-0">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden glass-panel border transition-all shrink-0 group ${
                    activeImageIndex === idx
                      ? 'border-[#988686] ring-2 ring-[#988686]/60 shadow-warm-md scale-105'
                      : 'border-[#988686]/20 opacity-70 hover:opacity-100 hover:border-[#988686]/50'
                  }`}
                >
                  <img
                    src={img || FALLBACK_IMAGE}
                    alt={`${product.name} angle ${idx + 1}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                    }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/75 text-[8px] font-mono text-white text-center py-0.5 truncate">
                    {ANGLE_LABELS[idx] || `Angle ${idx + 1}`}
                  </div>
                </button>
              ))}
            </div>

            {/* Main Stage Image with Badges */}
            <div className="flex-1 relative aspect-[4/3] rounded-3xl overflow-hidden glass-panel border border-[#988686]/30 shadow-2xl bg-black/40 group">
              <img
                src={gallery[activeImageIndex] || product.image || FALLBACK_IMAGE}
                alt={product.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                }}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 cursor-zoom-in"
              />

              {/* ROVIA Assured Badge (Flipkart Assured / Amazon Prime style) */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-[#5E7A63] text-white shadow-xl">
                  <ShieldCheck className="w-4 h-4 text-[#5E7A63]" />
                  <span className="text-xs font-bold tracking-wide">ROVIA ASSURED</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-[#988686] font-mono border border-white/10">
                  <Sparkles className="w-3 h-3 text-[#B08A4E]" />
                  <span>OpenCV Anti-Damage Verified</span>
                </div>
              </div>

              {/* Stock Status Tag */}
              <div className="absolute top-4 right-4">
                {product.available === 0 ? (
                  <Badge variant="danger">Currently Unavailable</Badge>
                ) : product.available < 3 ? (
                  <Badge variant="warning">Only {product.available} Units Left</Badge>
                ) : (
                  <Badge variant="success">In Stock ({product.available} Available)</Badge>
                )}
              </div>

              {/* Angle Indicator Ribbon */}
              <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-xl text-xs font-mono border border-white/10">
                Viewing: <span className="font-bold text-[#B08A4E]">{ANGLE_LABELS[activeImageIndex] || `Photo ${activeImageIndex + 1}`}</span>
              </div>
            </div>
          </div>

          {/* Flipkart/Amazon Trust Badges Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl glass-panel border border-[#988686]/20 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#5E7A63] shrink-0" />
              <div className="text-xs">
                <span className="font-bold block text-[#000000] dark:text-white">100% Escrow</span>
                <span className="text-[10px] text-[#988686]">Refundable Deposit</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl glass-panel border border-[#988686]/20 flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-[#5E7286] shrink-0" />
              <div className="text-xs">
                <span className="font-bold block text-[#000000] dark:text-white">Same-Day Dispatch</span>
                <span className="text-[10px] text-[#988686]">Insured Transit</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl glass-panel border border-[#988686]/20 flex items-center gap-2.5">
              <RefreshCw className="w-5 h-5 text-[#B08A4E] shrink-0" />
              <div className="text-xs">
                <span className="font-bold block text-[#000000] dark:text-white">Free Replacement</span>
                <span className="text-[10px] text-[#988686]">In case of defect</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl glass-panel border border-[#988686]/20 flex items-center gap-2.5">
              <Box className="w-5 h-5 text-[#A0524E] shrink-0" />
              <div className="text-xs">
                <span className="font-bold block text-[#000000] dark:text-white">Complete Kit</span>
                <span className="text-[10px] text-[#988686]">Charger & Rig Included</span>
              </div>
            </div>
          </div>

          {/* Renter / Seller Vendor Card */}
          <div className="glass-panel p-5 rounded-3xl border border-[#988686]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-[#988686]/15 text-[#988686] border border-[#988686]/20">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-[#988686] tracking-wider">VERIFIED MARKETPLACE RENTER</span>
                <h4 className="font-bold text-base text-[#000000] dark:text-white">{product.renterName}</h4>
                <p className="text-xs text-[#5C4E4E] dark:text-[#B5A9A9] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#988686]" /> Store Pickup Hub: Mumbai HQ Atelier
                </p>
              </div>
            </div>
            <div className="flex items-center sm:flex-col items-end gap-2">
              <Badge variant="success">Top Rated Seller</Badge>
              <span className="text-xs font-mono font-bold text-[#B08A4E]">98.4% Positive Ratings</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TABBED SPECIFICATIONS & REVIEWS (Amazon / Flipkart Product Overview)     */}
          {/* ========================================================================= */}
          <div className="glass-panel rounded-3xl border border-[#988686]/30 overflow-hidden shadow-lg">
            {/* Tabs Header */}
            <div className="flex items-center border-b border-[#988686]/20 bg-[#988686]/10 overflow-x-auto">
              {[
                { id: 'specs', label: 'Technical Specifications' },
                { id: 'box', label: "What's In The Box" },
                { id: 'insurance', label: 'Security & Rental Escrow' },
                { id: 'reviews', label: `Customer Reviews (${Math.floor(product.rating * 18)})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'border-[#000000] dark:border-[#988686] text-[#000000] dark:text-white bg-transparent'
                      : 'border-transparent text-[#988686] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Body */}
            <div className="p-6">
              {activeTab === 'specs' && (
                <div className="space-y-4">
                  <h4 className="font-heading text-sm font-bold text-[#000000] dark:text-white uppercase tracking-wider">
                    General & Technical Attributes
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl glass-panel border border-[#988686]/20 flex justify-between">
                      <span className="text-[#988686]">Brand / Manufacturer</span>
                      <span className="font-bold text-[#000000] dark:text-white">{product.brand}</span>
                    </div>
                    <div className="p-3 rounded-xl glass-panel border border-[#988686]/20 flex justify-between">
                      <span className="text-[#988686]">Category</span>
                      <span className="font-bold text-[#000000] dark:text-white">{product.category}</span>
                    </div>
                    <div className="p-3 rounded-xl glass-panel border border-[#988686]/20 flex justify-between">
                      <span className="text-[#988686]">SKU Number</span>
                      <span className="font-mono font-bold text-[#000000] dark:text-white">{product.sku}</span>
                    </div>
                    <div className="p-3 rounded-xl glass-panel border border-[#988686]/20 flex justify-between">
                      <span className="text-[#988686]">Color / Finish</span>
                      <span className="font-bold text-[#000000] dark:text-white">{product.color || 'Matte Obsidian'}</span>
                    </div>

                    {/* Dynamic Product Specs */}
                    {Object.entries(product.specs || {}).map(([key, val]) => (
                      <div key={key} className="p-3 rounded-xl glass-panel border border-[#988686]/20 flex justify-between">
                        <span className="text-[#988686]">{key}</span>
                        <span className="font-bold text-[#000000] dark:text-white">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'box' && (
                <div className="space-y-4 text-xs">
                  <h4 className="font-heading text-sm font-bold text-[#000000] dark:text-white uppercase tracking-wider">
                    Standard Rental Package Accessories
                  </h4>
                  <ul className="space-y-2.5">
                    <li className="flex items-center gap-2 text-[#000000] dark:text-white">
                      <CheckCircle2 className="w-4 h-4 text-[#5E7A63]" />
                      <span>1x {product.name} (Pristine condition, calibrated)</span>
                    </li>
                    <li className="flex items-center gap-2 text-[#000000] dark:text-white">
                      <CheckCircle2 className="w-4 h-4 text-[#5E7A63]" />
                      <span>2x High-Capacity Batteries & Fast Dual Charger</span>
                    </li>
                    <li className="flex items-center gap-2 text-[#000000] dark:text-white">
                      <CheckCircle2 className="w-4 h-4 text-[#5E7A63]" />
                      <span>1x Heavy-Duty Pelican Shockproof Flight Case</span>
                    </li>
                    <li className="flex items-center gap-2 text-[#000000] dark:text-white">
                      <CheckCircle2 className="w-4 h-4 text-[#5E7A63]" />
                      <span>ROVIA QR Authentication Tag & Return Transit Label</span>
                    </li>
                  </ul>
                </div>
              )}

              {activeTab === 'insurance' && (
                <div className="space-y-3 text-xs text-[#5C4E4E] dark:text-[#B5A9A9]">
                  <h4 className="font-heading text-sm font-bold text-[#000000] dark:text-white uppercase tracking-wider">
                    Security Deposit & Insurance Policy
                  </h4>
                  <p>
                    Your security deposit of <strong>₹{product.securityDeposit.toLocaleString()}</strong> is held safely in escrow.
                    Upon return, our OpenCV Computer Vision system inspects the asset condition against handover photos.
                  </p>
                  <p>
                    If the asset is returned in pristine condition with no damage, the deposit is refunded 100% within 2 hours of check-in.
                  </p>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Rating Breakdown Bars (Flipkart / Amazon Standard) */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-4 rounded-2xl bg-[#988686]/10 border border-[#988686]/20">
                    <div className="text-center sm:text-left shrink-0">
                      <span className="text-4xl font-extrabold font-heading text-[#000000] dark:text-white">
                        {product.rating}
                      </span>
                      <div className="flex items-center justify-center sm:justify-start gap-1 text-[#B08A4E] my-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <span className="text-[11px] text-[#988686]">{Math.floor(product.rating * 18)} Verified Renters</span>
                    </div>

                    {/* Progress Bars */}
                    <div className="flex-1 space-y-1.5 text-xs">
                      {[
                        { stars: 5, pct: 84 },
                        { stars: 4, pct: 11 },
                        { stars: 3, pct: 3 },
                        { stars: 2, pct: 1 },
                        { stars: 1, pct: 1 },
                      ].map((bar) => (
                        <div key={bar.stars} className="flex items-center gap-2">
                          <span className="w-6 text-[10px] font-mono text-[#988686]">{bar.stars}★</span>
                          <div className="flex-1 h-2 rounded-full bg-[#988686]/20 overflow-hidden">
                            <div className="h-full bg-[#B08A4E] rounded-full" style={{ width: `${bar.pct}%` }} />
                          </div>
                          <span className="w-8 text-right text-[10px] font-mono text-[#988686]">{bar.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Review Items */}
                  <div className="space-y-3">
                    {[
                      {
                        name: 'Vikramaditya S.',
                        title: 'Absolute game changer for our 3-day commercial shoot!',
                        comment: 'Item arrived in brand new condition in a custom flight case. Battery life was flawless. OpenCV return scan cleared our deposit in 15 minutes!',
                        rating: 5,
                        date: '3 days ago',
                      },
                      {
                        name: 'Pooja R.',
                        title: 'Super smooth rental and verified handover',
                        comment: 'Everything as described. The delivery was right on time and support was responsive.',
                        rating: 5,
                        date: '1 week ago',
                      },
                    ].map((rev, i) => (
                      <div key={i} className="p-4 rounded-2xl glass-panel border border-[#988686]/20 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#000000] dark:text-white">{rev.name}</span>
                            <Badge variant="success">Verified Renter</Badge>
                          </div>
                          <span className="text-[10px] text-[#988686]">{rev.date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[#B08A4E]">
                          {[...Array(rev.rating)].map((_, idx) => (
                            <Star key={idx} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                        <h5 className="font-bold text-[#000000] dark:text-white">{rev.title}</h5>
                        <p className="text-[#5C4E4E] dark:text-[#B5A9A9]">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* FREQUENTLY RENTED TOGETHER BUNDLE (Amazon Cross-Sell Widget)             */}
          {/* ========================================================================= */}
          {bundleProduct && (
            <div className="glass-panel p-6 rounded-3xl border border-[#988686]/30 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#988686]">
                <Layers className="w-4 h-4 text-[#B08A4E]" />
                <span>Frequently Rented Together (Curated Production Bundle)</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Item 1 */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden glass-panel border border-[#988686]/30 shrink-0">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>

                  <span className="font-bold text-lg text-[#988686]">+</span>

                  {/* Item 2 */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden glass-panel border border-[#988686]/30 shrink-0">
                    <img src={bundleProduct.image} alt={bundleProduct.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="text-xs">
                    <span className="font-bold text-[#000000] dark:text-white block line-clamp-1">{bundleProduct.name}</span>
                    <span className="text-[#988686]">Recommended accessory addition</span>
                    <span className="font-mono font-bold text-[#5E7A63] block mt-0.5">+ ₹{bundleProduct.dailyRate.toLocaleString()}/day</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" leftIcon={<ShoppingBag className="w-4 h-4" />} onClick={handleAddBundle}>
                  Add Both to Bag
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Flipkart/Amazon Sticky Booking Box & Pricing               */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#988686]/30 shadow-2xl space-y-6 sticky top-24 bg-gradient-to-b from-transparent to-[#988686]/5">
            {/* Title & Brand */}
            <div>
              <span className="text-xs font-mono uppercase text-[#988686] tracking-widest">{product.brand}</span>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#000000] dark:text-white mt-1 leading-tight">
                {product.name}
              </h1>

              {/* Rating Star Badge (Flipkart/Amazon style) */}
              <div className="flex items-center gap-2 mt-2">
                <div className="inline-flex items-center gap-1 bg-[#5E7A63] text-white px-2 py-0.5 rounded-lg text-xs font-bold">
                  <span>{product.rating}</span>
                  <Star className="w-3 h-3 fill-current" />
                </div>
                <span className="text-xs text-[#988686]">
                  {Math.floor(product.rating * 18)} Ratings & {Math.floor(product.rating * 4)} Reviews
                </span>
              </div>
            </div>

            {/* Price Strip with Strikethrough (Flipkart / Amazon Standard) */}
            <div className="border-y border-[#988686]/20 py-4 space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-heading font-extrabold text-[#000000] dark:text-white">
                  ₹{product.dailyRate.toLocaleString()}
                </span>
                <span className="text-base text-[#988686] line-through font-mono">
                  ₹{regularRate.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-[#5E7A63] bg-[#5E7A63]/15 px-2 py-0.5 rounded-md">
                  {discountPercent}% OFF
                </span>
                <span className="text-xs text-[#988686] font-mono">/ day</span>
              </div>
              <p className="text-[11px] text-[#988686]">
                + ₹{product.securityDeposit.toLocaleString()} 100% Refundable Security Deposit
              </p>
            </div>

            {/* Bank / Promo Offers Card (Flipkart / Amazon Standard) */}
            <div className="p-4 rounded-2xl bg-[#B08A4E]/10 border border-[#B08A4E]/30 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#B08A4E]">
                <Tag className="w-3.5 h-3.5" />
                <span>Available Offers & Booking Discounts</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-[#5C4E4E] dark:text-[#B5A9A9]">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#B08A4E] font-bold">•</span>
                  <span><strong>Special Promo:</strong> 15% off on rentals over 3 days with code <span className="font-mono font-bold text-[#000000] dark:text-white">ROVIAVIP</span></span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#B08A4E] font-bold">•</span>
                  <span><strong>Card Perk:</strong> Instant ₹500 discount on escrow deposit using credit card</span>
                </li>
              </ul>
            </div>

            {/* Delivery Pincode Checker (Flipkart / Amazon Standard) */}
            <div className="space-y-2 border-b border-[#988686]/20 pb-4">
              <label className="text-xs font-bold uppercase text-[#5C4E4E] dark:text-[#B5A9A9] flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#988686]" />
                Check Delivery & Pickup Availability
              </label>
              <form onSubmit={handlePincodeCheck} className="flex gap-2">
                <Input
                  placeholder="Enter 6-digit Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="text-xs font-mono uppercase"
                />
                <Button type="submit" size="sm" variant="outline">
                  Check
                </Button>
              </form>
              {pincodeChecked && (
                <div className="flex items-center gap-2 text-[11px] text-[#5E7A63] font-medium pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{deliveryEstimate}</span>
                </div>
              )}
            </div>

            {/* Edition / Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-[#5C4E4E] dark:text-[#B5A9A9]">
                  Select Package Configuration
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-left transition-all ${
                        selectedVariant === v
                          ? 'border-[#000000] dark:border-[#988686] bg-[#988686]/15 shadow-warm-sm'
                          : 'glass-panel border-[#988686]/20 text-[#988686] hover:border-[#988686]/40'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Rental Window Date Range */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-[#5C4E4E] dark:text-[#B5A9A9] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#988686]" />
                Rental Window ({days} Days Selected)
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="glass-input p-2 rounded-xl">
                  <span className="text-[10px] font-mono uppercase text-[#988686] block">Start:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent text-[#000000] dark:text-white font-semibold focus:outline-none w-full"
                  />
                </div>
                <div className="glass-input p-2 rounded-xl">
                  <span className="text-[10px] font-mono uppercase text-[#988686] block">End:</span>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent text-[#000000] dark:text-white font-semibold focus:outline-none w-full"
                  />
                </div>
              </div>
            </div>

            {/* Quantity Selector with stock cap */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="font-bold uppercase text-[#5C4E4E] dark:text-[#B5A9A9]">Quantity</span>
              <div className="flex items-center gap-3 glass-input px-3 py-1.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className={`font-bold text-sm ${quantity <= 1 ? 'text-[#988686]/30 cursor-not-allowed' : 'text-[#988686]'}`}
                >
                  -
                </button>
                <span className="font-mono font-bold text-sm">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.available, quantity + 1))}
                  disabled={quantity >= product.available}
                  className={`font-bold text-sm ${quantity >= product.available ? 'text-[#988686]/30 cursor-not-allowed' : 'text-[#988686]'}`}
                >
                  +
                </button>
              </div>
            </div>

            {/* Live Calculation Summary */}
            <div className="p-4 rounded-2xl bg-[#988686]/10 border border-[#988686]/20 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#5C4E4E] dark:text-[#B5A9A9]">Rental Total ({days} days):</span>
                <span className="font-mono font-bold text-[#000000] dark:text-white">₹{rentalTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#5E7286]">
                <span>Escrow Security Deposit:</span>
                <span className="font-mono font-bold">₹{depositTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-[#988686]/20 pt-2 font-bold text-sm text-[#000000] dark:text-white">
                <span>Due Today:</span>
                <span className="font-mono text-[#5E7A63]">₹{(rentalTotal + depositTotal).toLocaleString()}</span>
              </div>
            </div>

            {/* Action CTAs (Flipkart / Amazon Yellow & Orange Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                variant="outline"
                size="lg"
                disabled={product.available === 0}
                leftIcon={<ShoppingBag className="w-4 h-4" />}
                onClick={handleAddToCart}
                className="w-full py-3"
              >
                Add to Bag
              </Button>
              <Button
                variant="primary"
                size="lg"
                disabled={product.available === 0}
                leftIcon={<Zap className="w-4 h-4" />}
                onClick={handleRentNow}
                className="w-full py-3 shadow-warm-lg font-bold"
              >
                Rent Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
