import React from 'react';
import { ArrowRight, Camera, Car, Wrench, Shirt, MapPin, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { UNIVERSAL_PRODUCTS, Product } from '../../services/mockData';

interface LandingProps {
  onNavigate: (tab: string, productId?: string) => void;
}

export const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  return (
    <div className="w-full space-y-24 pb-16 page-transition">
      {/* Hero Section — Enhanced High-Contrast Luxury Atelier */}
      <section className="relative min-h-[85vh] flex items-center justify-center rounded-3xl overflow-hidden bg-[#0A0909] text-white border border-[#988686]/40 p-6 sm:p-12 lg:p-16 my-4 shadow-2xl">
        {/* Cinematic Backdrop Image with Smooth Ambient Scale */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45 scale-105 pointer-events-none"
          style={{
            backgroundImage: `url('/landing-hero.jpg')`,
          }}
        />

        {/* Multi-layer Dark Radial and Directional Scrim to Guarantee 100% Typography Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0909] via-[#0A0909]/85 to-[#0A0909]/60 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black/30 via-black/80 to-[#0A0909] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-7">
          {/* Atelier Verified Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/25 text-xs font-semibold text-white tracking-wide shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#5E7A63] animate-pulse" />
            <span>Universal Product & Property Rental Atelier</span>
            <span className="text-[#D1D0D0]">•</span>
            <span className="text-[#D1D0D0] font-mono">ROVIA Verified</span>
          </div>

          {/* Primary High-Contrast Heading */}
          <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.12] drop-shadow-2xl">
            Rent Anything, Anywhere
            <span className="block mt-3 text-2xl sm:text-3xl lg:text-4xl font-light text-[#EDEBEB] tracking-normal drop-shadow-lg">
              From Production Rigs & Supercars to Verified Homes & Studios
            </span>
          </h1>

          {/* High-Contrast Description */}
          <p className="text-base sm:text-lg text-[#EDEBEB] max-w-2xl mx-auto leading-relaxed font-normal drop-shadow-md">
            Reserve apartments near Nadar Saraswathi College, Hasselblad medium format cameras, luxury villas, and mobility fleets with interactive radius search and OpenCV verified return inspection.
          </p>

          {/* Trust Highlights Strip (Flipkart / Airbnb Style) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-3xl mx-auto pt-2 pb-1">
            <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white font-medium shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Escrow Refund</span>
            </div>
            <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white font-medium shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>OpenCV Damage AI</span>
            </div>
            <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white font-medium shadow-sm">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Property Map Radius</span>
            </div>
            <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white font-medium shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Razorpay Verified</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
            <button
              onClick={() => onNavigate('catalog')}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white text-black hover:bg-[#EDEBEB] font-bold text-base shadow-2xl flex items-center justify-center gap-2.5 fk-btn-press transition-all"
            >
              <span>Explore 300+ Products</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate('property-map')}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#5E7A63] hover:bg-[#4E6753] text-white font-bold text-base shadow-2xl flex items-center justify-center gap-2.5 fk-btn-press transition-all"
            >
              <MapPin className="w-5 h-5 text-white" />
              <span>Find Properties on Map</span>
            </button>
            <button
              onClick={() => onNavigate('auth')}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-md font-bold text-base flex items-center justify-center gap-2 fk-btn-press transition-all"
            >
              <span>Partner Portals</span>
            </button>
          </div>

          <span className="text-[#D1D0D0] text-xs font-mono tracking-widest text-center block pt-1">
            Customer · Renter · Admin Portals
          </span>

          {/* Lifecycle Flow Ribbon */}
          <div className="pt-6 border-t border-white/15 flex items-center justify-center gap-6 sm:gap-8 text-xs font-mono text-[#D1D0D0] uppercase tracking-[0.2em] font-semibold">
            <span>RENT</span>
            <span className="text-emerald-400">•</span>
            <span>USE</span>
            <span className="text-emerald-400">•</span>
            <span>RETURN</span>
            <span className="text-emerald-400">•</span>
            <span>REUSE</span>
          </div>
        </div>
      </section>

      {/* Universal Categories Showcase */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono uppercase text-[#988686] tracking-widest">MULTI-CATEGORY RENTAL SYSTEM</span>
          <h2 className="font-heading text-3xl font-bold text-[#000000] dark:text-white">
            Rent Across Any Product Category
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: <Camera className="w-8 h-8 text-[#988686] mx-auto mb-2" />, label: 'Cameras & Cinema', category: 'Cameras & Lenses' },
            { icon: <Wrench className="w-8 h-8 text-[#988686] mx-auto mb-2" />, label: 'Heavy Machinery', category: 'Heavy Machinery' },
            { icon: <Shirt className="w-8 h-8 text-[#988686] mx-auto mb-2" />, label: 'Designer Fashion', category: 'Designer Fashion' },
            { icon: <Car className="w-8 h-8 text-[#988686] mx-auto mb-2" />, label: 'Vehicles & Mobility', category: 'Vehicles & Mobility' },
          ].map((cat) => (
            <Card
              key={cat.label}
              className="p-4 text-center cursor-pointer hover:border-[#988686] hover:shadow-lg transition-all"
              onClick={() => onNavigate('catalog')}
            >
              {cat.icon}
              <h3 className="font-bold text-xs text-[#000000] dark:text-white">{cat.label}</h3>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Universal Inventory */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#D1D0D0]/40 dark:border-[#5C4E4E]/40 pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#988686] font-bold">UNIVERSAL COLLECTION</span>
            <h2 className="font-heading text-3xl font-bold text-[#000000] dark:text-white mt-1">
              Featured Rental Items
            </h2>
          </div>
          <Button variant="ghost" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={() => onNavigate('catalog')}>
            Explore All 300+ Products
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {UNIVERSAL_PRODUCTS.slice(0, 6).map((product: Product) => (
            <Card
              key={product.id}
              className="group cursor-pointer flex flex-col justify-between hover:border-[#988686] hover:shadow-xl transition-all"
              onClick={() => onNavigate('product-detail', product.id)}
            >
              <div className="space-y-4">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/40">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="success">Available Now</Badge>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-[#988686] uppercase tracking-wider">
                    {product.category}
                  </span>
                  <h3 className="font-heading text-lg font-bold text-[#000000] dark:text-white line-clamp-1 mt-0.5">
                    {product.name}
                  </h3>
                  <p className="text-xs text-[#5C4E4E] dark:text-[#B5A9A9] line-clamp-2 mt-1">
                    {product.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#D1D0D0]/30 dark:border-[#5C4E4E]/30 flex items-center justify-between mt-4">
                <div>
                  <span className="text-[10px] text-[#988686] uppercase block">Rate / Day</span>
                  <span className="text-base font-bold font-mono text-[#000000] dark:text-white">
                    ₹{product.dailyRate.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#5E7286] uppercase block">Refundable Deposit</span>
                  <span className="text-xs font-semibold font-mono text-[#5E7286]">
                    ₹{product.securityDeposit.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
