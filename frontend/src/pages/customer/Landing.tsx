import React from 'react';
import { ArrowRight, Camera, Car, Wrench, Shirt, MapPin } from 'lucide-react';
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
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center rounded-3xl overflow-hidden bg-[#0D0B0B] border border-[#988686]/30 p-8 sm:p-16 my-4 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D0B0B]/95 via-[#161313]/90 to-[#5C4E4E]/80 z-0 pointer-events-none" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay z-0 pointer-events-none"
          style={{
            backgroundImage: `url('/landing-hero.jpg')`,
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="neutral" icon={true} className="px-4 py-1 text-xs bg-white/10 text-white border border-white/20">
            Universal Product & Property Rental Atelier
          </Badge>

          <h1 className="font-heading text-5xl sm:text-7xl font-bold tracking-tight text-white leading-tight drop-shadow-xl">
            Rent Anything, Anywhere <br />
            <span className="text-[#EDEBEB] italic font-normal text-3xl sm:text-5xl block mt-2 drop-shadow-md">
              From Tech & Vehicles to Verified Homes & Studios
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed font-normal drop-shadow-sm">
            Reserve apartments near Nadar Saraswathi College, Hasselblad camera rigs, luxury villas, and mobility fleets. Explore interactive radius search with nearby facility intelligence.
          </p>

          {/* CTAs — Explore Catalog, Map Discovery & Sign In */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Button
              size="lg"
              variant="primary"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              onClick={() => onNavigate('catalog')}
              className="px-6 py-4 text-base font-bold shadow-lg fk-btn-press"
            >
              Explore Products
            </Button>
            <button
              onClick={() => onNavigate('property-map')}
              className="px-6 py-3.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 text-base font-bold flex items-center gap-2 transition shadow-lg active:scale-95 fk-btn-press"
            >
              <MapPin className="w-5 h-5 text-rose-400" />
              <span>Find Properties on Map</span>
            </button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => onNavigate('auth')}
              className="px-6 py-4 text-base font-bold fk-btn-press text-white border-white/40 hover:bg-white/10"
            >
              Partner Portals
            </Button>
          </div>
          <span className="text-[#D1D0D0] text-xs font-mono tracking-widest text-center block font-medium">
            Customer · Renter · Admin Portals
          </span>

          <div className="pt-8 border-t border-white/20 flex items-center justify-center gap-8 text-xs font-mono text-[#D1D0D0] uppercase tracking-widest font-semibold">
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
