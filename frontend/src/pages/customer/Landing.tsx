import React from 'react';
import { ArrowRight, ShieldCheck, Camera, Sparkles, Clock, Layers, Car, Wrench, Shirt, Laptop } from 'lucide-react';
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
      <section className="relative min-h-[85vh] flex items-center justify-center rounded-3xl overflow-hidden glass-panel border border-[#988686]/30 p-8 sm:p-16 my-4 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D0B0B]/90 via-[#161313]/70 to-[#5C4E4E]/20 z-0 pointer-events-none" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay z-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=1600')`,
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="neutral" icon={true} className="px-4 py-1 text-xs">
            Universal Product Rental Atelier
          </Badge>

          <h1 className="font-heading text-5xl sm:text-7xl font-bold tracking-tight text-white leading-tight">
            Rent Anything, Anytime <br />
            <span className="text-[#988686] italic font-normal">From Tech to Heavy Machinery & Luxury Goods</span>
          </h1>

          <p className="text-base sm:text-lg text-[#D1D0D0] max-w-2xl mx-auto leading-relaxed font-light">
            Reserve Hasselblad cameras, Caterpillar excavators, Vera Wang haute couture, Tesla Cybertrucks, and medical suites. Flexible rental windows with 100% refundable deposit protection.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              variant="primary"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              onClick={() => onNavigate('catalog')}
            >
              Explore Universal Catalog
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => onNavigate('return-flow')}
            >
              How Rentals Work
            </Button>
          </div>

          <div className="pt-8 border-t border-[#988686]/20 flex items-center justify-center gap-8 text-xs font-mono text-[#988686] uppercase tracking-widest">
            <span>RENT</span>
            <span>•</span>
            <span>USE</span>
            <span>•</span>
            <span>RETURN</span>
            <span>•</span>
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
          <Card className="p-4 text-center cursor-pointer hover:border-[#988686]" onClick={() => onNavigate('catalog')}>
            <Camera className="w-8 h-8 text-[#988686] mx-auto mb-2" />
            <h3 className="font-bold text-xs text-[#000000] dark:text-white">Cameras & Cinema</h3>
          </Card>

          <Card className="p-4 text-center cursor-pointer hover:border-[#988686]" onClick={() => onNavigate('catalog')}>
            <Wrench className="w-8 h-8 text-[#988686] mx-auto mb-2" />
            <h3 className="font-bold text-xs text-[#000000] dark:text-white">Heavy Machinery</h3>
          </Card>

          <Card className="p-4 text-center cursor-pointer hover:border-[#988686]" onClick={() => onNavigate('catalog')}>
            <Shirt className="w-8 h-8 text-[#988686] mx-auto mb-2" />
            <h3 className="font-bold text-xs text-[#000000] dark:text-white">Designer Fashion</h3>
          </Card>

          <Card className="p-4 text-center cursor-pointer hover:border-[#988686]" onClick={() => onNavigate('catalog')}>
            <Car className="w-8 h-8 text-[#988686] mx-auto mb-2" />
            <h3 className="font-bold text-xs text-[#000000] dark:text-white">Vehicles & Mobility</h3>
          </Card>
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
            View All Categories
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {UNIVERSAL_PRODUCTS.slice(0, 6).map((product: Product) => (
            <Card
              key={product.id}
              className="group cursor-pointer flex flex-col justify-between"
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
