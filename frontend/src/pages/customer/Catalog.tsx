import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, SlidersHorizontal, ShoppingBag, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Product } from '../../services/mockData';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/ui/Toast';

interface CatalogProps {
  onNavigate: (tab: string, productId?: string) => void;
}

export const Catalog: React.FC<CatalogProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [priceMax, setPriceMax] = useState(100000);
  const [startDate, setStartDate] = useState('2026-08-10');
  const [endDate, setEndDate] = useState('2026-08-13');
  const [showFilters, setShowFilters] = useState(true);

  const { addItem } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    api.getProducts().then((data) => setProducts(data));
  }, []);

  const categories = [
    'All',
    'Cameras & Lenses',
    'Heavy Machinery',
    'Designer Fashion',
    'Vehicles & Mobility',
    'Medical Equipment',
    'Electronics & Tech',
    'Outdoor & Camping',
    'Event Supplies',
  ];

  const brands = ['All', 'Hasselblad', 'Caterpillar', 'Vera Wang', 'Tesla', 'Philips Respironics', 'Apple', 'MSR Mountaineering', 'ROVIA Atelier'];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesBrand = selectedBrand === 'All' || product.brand === selectedBrand;
    const matchesPrice = product.dailyRate <= priceMax;

    return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
  });

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      category: product.category,
      image: product.image,
      variant: product.variants[0] || 'Standard Edition',
      dailyRate: product.dailyRate,
      securityDeposit: product.securityDeposit,
      startDate,
      endDate,
      quantity: 1,
    });
    showToast('Added to Rental Bag', `${product.name} booked for selected dates`, 'success');
  };

  return (
    <div className="w-full space-y-8 page-transition pb-16">
      {/* Catalog Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#D1D0D0]/40 dark:border-[#5C4E4E]/40 pb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#988686]">UNIVERSAL RENTAL PLATFORM</span>
          <h1 className="font-heading text-4xl font-bold text-[#000000] dark:text-white mt-1">
            Universal Product Rental Catalog
          </h1>
        </div>

        {/* Search & Toggle Filters Button */}
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search cameras, vehicles, machinery, gowns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="w-72"
          />
          <Button
            variant="outline"
            leftIcon={<SlidersHorizontal className="w-4 h-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Filter Options'}
          </Button>
        </div>
      </div>

      {/* Sticky Filter Bar & Rental Availability Window Picker */}
      <div className="sticky top-20 z-30 glass-nav p-4 rounded-2xl border border-[#988686]/30 shadow-warm-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#000000] dark:text-white">
          <Calendar className="w-4 h-4 text-[#988686]" />
          <span>Rental Availability Window:</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 glass-input px-3 py-1.5 rounded-lg">
            <span className="text-[#988686] font-mono text-[10px] uppercase">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent focus:outline-none text-[#000000] dark:text-white font-medium"
            />
          </div>
          <span className="text-[#988686]">→</span>
          <div className="flex items-center gap-1.5 glass-input px-3 py-1.5 rounded-lg">
            <span className="text-[#988686] font-mono text-[10px] uppercase">To:</span>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent focus:outline-none text-[#000000] dark:text-white font-medium"
            />
          </div>
        </div>
      </div>

      {/* Main Grid & Filters Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Filters Sidebar */}
        {showFilters && (
          <aside className="lg:col-span-3 space-y-6 glass-panel p-5 rounded-2xl border border-[#988686]/30 h-fit animate-fadeIn">
            {/* Category Filter */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C4E4E] dark:text-[#B5A9A9]">
                Rental Category
              </h3>
              <div className="flex flex-col gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-[#988686] text-white font-bold'
                        : 'text-[#5C4E4E] dark:text-[#B5A9A9] hover:bg-[#988686]/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2 border-t border-[#D1D0D0]/30 dark:border-[#5C4E4E]/30 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C4E4E] dark:text-[#B5A9A9]">
                Brand / Manufacturer
              </h3>
              <div className="flex flex-col gap-1">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedBrand === brand
                        ? 'bg-[#988686] text-white font-bold'
                        : 'text-[#5C4E4E] dark:text-[#B5A9A9] hover:bg-[#988686]/10'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Price Slider */}
            <div className="space-y-2 border-t border-[#D1D0D0]/30 dark:border-[#5C4E4E]/30 pt-4">
              <div className="flex justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-[#5C4E4E] dark:text-[#B5A9A9]">
                  Max Rate / Day
                </span>
                <span className="font-mono font-bold text-[#000000] dark:text-white">₹{priceMax.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="100000"
                step="1000"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-[#988686] cursor-pointer"
              />
            </div>
          </aside>
        )}

        {/* Product Grid */}
        <main className={`${showFilters ? 'lg:col-span-9' : 'lg:col-span-12'} space-y-6`}>
          {filteredProducts.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
              <p className="text-base font-bold text-[#000000] dark:text-white">No rental products match your filters</p>
              <p className="text-xs text-[#988686]">Try resetting category or price range filters.</p>
              <Button variant="outline" size="sm" onClick={() => { setSelectedCategory('All'); setSelectedBrand('All'); setPriceMax(100000); setSearchQuery(''); }}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="group cursor-pointer flex flex-col justify-between"
                  onClick={() => onNavigate('product-detail', product.id)}
                >
                  <div className="space-y-3">
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/40">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge variant={product.available > 0 ? 'success' : 'danger'}>
                          {product.available > 0 ? `${product.available} In Stock` : 'Booked Out'}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-[#988686] uppercase tracking-wider block">
                        {product.category} • {product.sku}
                      </span>
                      <h3 className="font-heading text-base font-bold text-[#000000] dark:text-white line-clamp-1 mt-0.5">
                        {product.name}
                      </h3>
                      <p className="text-xs text-[#5C4E4E] dark:text-[#B5A9A9] line-clamp-2 mt-1">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#D1D0D0]/30 dark:border-[#5C4E4E]/30 flex items-center justify-between mt-4">
                    <div>
                      <span className="text-[10px] text-[#988686] uppercase block">Rate / Day</span>
                      <span className="text-sm font-bold font-mono text-[#000000] dark:text-white">
                        ₹{product.dailyRate.toLocaleString()}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="primary"
                      leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                      onClick={(e) => handleQuickAdd(e, product)}
                    >
                      Quick Add
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
