import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Calendar,
  SlidersHorizontal,
  ShoppingBag,
  Building,
  Star,
  LayoutGrid,
  List,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Tag,
  Truck,
  Camera,
  Laptop,
  Plane,
  Car,
  Headphones,
  HardHat,
  Wrench,
  Compass,
  Flame
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Product, RenterVendor } from '../../services/mockData';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/ui/Toast';
import { PageLoaderBar, ProductCardSkeleton, CategoryStripSkeleton } from '../../components/common/ShimmerSkeleton';
import { RoviaAssuredBadge } from '../../components/common/RoviaAssuredBadge';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=800';

interface CatalogProps {
  onNavigate: (tab: string, productId?: string) => void;
}

type SortOption = 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
type ViewMode = 'grid' | 'list';

export const Catalog: React.FC<CatalogProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [renters, setRenters] = useState<RenterVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);

  const FLIPKART_CATEGORIES = [
    { id: 'All', label: 'All Items', icon: <LayoutGrid className="w-5 h-5" /> },
    { id: 'Cameras & Lenses', label: 'Cameras', icon: <Camera className="w-5 h-5" /> },
    { id: 'Electronics & Tech', label: 'Electronics', icon: <Laptop className="w-5 h-5" /> },
    { id: 'Drones & Aerial', label: 'Drones', icon: <Plane className="w-5 h-5" /> },
    { id: 'Vehicles & Mobility', label: 'Vehicles', icon: <Car className="w-5 h-5" /> },
    { id: 'Audio & Sound', label: 'Audio Gear', icon: <Headphones className="w-5 h-5" /> },
    { id: 'Heavy Machinery', label: 'Machinery', icon: <HardHat className="w-5 h-5" /> },
    { id: 'Tools & Equipment', label: 'Tools', icon: <Wrench className="w-5 h-5" /> },
    { id: 'Designer Fashion', label: 'Fashion', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'Outdoor & Camping', label: 'Outdoors', icon: <Compass className="w-5 h-5" /> },
    { id: 'Home Appliances', label: 'Appliances', icon: <Flame className="w-5 h-5" /> },
  ];

  const handleSelectCategory = (catId: string) => {
    if (selectedCategory === catId) return;
    setTransitioning(true);
    setSelectedCategory(catId);
    setCurrentPage(1);
    setTimeout(() => {
      setTransitioning(false);
    }, 350);
  };

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedRenter, setSelectedRenter] = useState('All');
  const [priceMax, setPriceMax] = useState(50000);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [startDate, setStartDate] = useState('2026-08-10');
  const [endDate, setEndDate] = useState('2026-08-13');

  // View & Sort States (Amazon / Flipkart standard)
  const [sortOption, setSortOption] = useState<SortOption>('featured');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Pagination State (24 items per page across 300 products)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 24;

  const { addItem } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getProducts(), api.getRenters()]).then(([prods, rnts]) => {
      setProducts(prods);
      setRenters(rnts);
      setLoading(false);
    });
  }, []);

  // Compute unique categories and brands with counts
  const categoriesList = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      map.set(p.category, (map.get(p.category) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [products]);

  const brandsList = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      if (p.brand) {
        map.set(p.brand, (map.get(p.brand) || 0) + 1);
      }
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.sku.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        product.brand.toLowerCase().includes(q) ||
        product.renterName.toLowerCase().includes(q);

      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesBrand = selectedBrand === 'All' || product.brand === selectedBrand;
      const matchesRenter = selectedRenter === 'All' || product.renterId === selectedRenter || product.renterName === selectedRenter;
      const matchesPrice = product.dailyRate <= priceMax;
      const matchesRating = minRating === 0 || product.rating >= minRating;
      const matchesStock = !inStockOnly || product.available > 0;

      return matchesSearch && matchesCategory && matchesBrand && matchesRenter && matchesPrice && matchesRating && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, selectedBrand, selectedRenter, priceMax, minRating, inStockOnly]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortOption) {
      case 'price-low':
        return list.sort((a, b) => a.dailyRate - b.dailyRate);
      case 'price-high':
        return list.sort((a, b) => b.dailyRate - a.dailyRate);
      case 'rating':
        return list.sort((a, b) => b.rating - a.rating);
      case 'newest':
        return list.reverse();
      case 'featured':
      default:
        return list;
    }
  }, [filteredProducts, sortOption]);

  // Pagination slicing
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedBrand, selectedRenter, priceMax, minRating, inStockOnly, sortOption]);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.available <= 0) {
      showToast('Out of Stock', 'This asset is currently rented out.', 'error');
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      category: product.category,
      image: product.image,
      variant: product.variants[0] || 'Standard Package',
      dailyRate: product.dailyRate,
      securityDeposit: product.securityDeposit,
      startDate,
      endDate,
      quantity: 1,
      available: product.available,
    });
    showToast('Added to Rental Bag', `${product.name} booked from ${product.renterName}`, 'success');
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedBrand('All');
    setSelectedRenter('All');
    setPriceMax(50000);
    setMinRating(0);
    setInStockOnly(false);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'All' ||
    selectedBrand !== 'All' ||
    selectedRenter !== 'All' ||
    priceMax < 50000 ||
    minRating > 0 ||
    inStockOnly;

  const renderFilterContent = (onCloseMobile?: () => void) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#988686]/20 pb-3">
        <span className="font-heading text-sm font-bold text-[#000000] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-[#988686]" /> Filters
        </span>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="text-[11px] text-[#A0524E] font-bold hover:underline">
              Reset
            </button>
          )}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-[#988686] hover:text-white hover:bg-[#988686]/20 ml-2"
              title="Close Filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* In Stock Only Switch */}
      <div className="p-3 rounded-2xl bg-[#988686]/10 border border-[#988686]/20 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold block text-[#000000] dark:text-white">In Stock Only</span>
          <span className="text-[10px] text-[#988686]">Hide unavailable items</span>
        </div>
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="w-4 h-4 rounded text-[#5E7A63] cursor-pointer"
        />
      </div>

      {/* Categories Facet */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#5C4E4E] dark:text-[#B5A9A9] block">
          Category
        </label>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between ${
              selectedCategory === 'All'
                ? 'bg-[#000000] dark:bg-[#988686] text-white font-bold'
                : 'text-[#988686] hover:bg-[#988686]/10 hover:text-white'
            }`}
          >
            <span>All Categories</span>
            <span className="font-mono text-[10px]">{products.length}</span>
          </button>
          {categoriesList.map(([cat, count]) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between truncate ${
                selectedCategory === cat
                  ? 'bg-[#000000] dark:bg-[#988686] text-white font-bold'
                  : 'text-[#5C4E4E] dark:text-[#B5A9A9] hover:bg-[#988686]/10 hover:text-white'
              }`}
            >
              <span className="truncate">{cat}</span>
              <span className="font-mono text-[10px] text-[#988686] ml-2 shrink-0">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brand Filter Facet */}
      <div className="space-y-2 border-t border-[#988686]/20 pt-4">
        <label className="text-xs font-bold uppercase tracking-wider text-[#5C4E4E] dark:text-[#B5A9A9] block">
          Top Brands
        </label>
        <div className="space-y-1 max-h-40 overflow-y-auto pr-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedBrand('All')}
            className={`w-full text-left px-2.5 py-1 rounded-lg transition-all ${
              selectedBrand === 'All' ? 'bg-[#988686]/20 text-white font-bold' : 'text-[#988686]'
            }`}
          >
            All Brands
          </button>
          {brandsList.map(([brand, count]) => (
            <button
              key={brand}
              type="button"
              onClick={() => setSelectedBrand(brand)}
              className={`w-full text-left px-2.5 py-1 rounded-lg transition-all flex items-center justify-between ${
                selectedBrand === brand ? 'bg-[#988686]/20 text-white font-bold' : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
              }`}
            >
              <span className="truncate">{brand}</span>
              <span className="font-mono text-[10px] text-[#988686]">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Customer Ratings Facet */}
      <div className="space-y-2 border-t border-[#988686]/20 pt-4">
        <label className="text-xs font-bold uppercase tracking-wider text-[#5C4E4E] dark:text-[#B5A9A9] block">
          Customer Rating
        </label>
        <div className="space-y-1.5 text-xs">
          {[4.5, 4.0, 3.0].map((stars) => (
            <button
              key={stars}
              type="button"
              onClick={() => setMinRating(minRating === stars ? 0 : stars)}
              className={`w-full text-left px-3 py-1.5 rounded-xl border transition-all flex items-center justify-between ${
                minRating === stars
                  ? 'border-[#B08A4E] bg-[#B08A4E]/15 text-[#B08A4E] font-bold'
                  : 'border-[#988686]/20 text-[#5C4E4E] dark:text-[#B5A9A9] hover:border-[#988686]/40'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="font-bold">{stars}★</span>
                <span className="text-[11px]">& Above</span>
              </div>
              <div className="flex items-center text-[#B08A4E]">
                {[...Array(Math.floor(stars))].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-3 border-t border-[#988686]/20 pt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-[#5C4E4E] dark:text-[#B5A9A9]">Daily Rate Cap</span>
          <span className="font-mono font-bold text-[#000000] dark:text-white">Up to ₹{priceMax.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={500}
          max={50000}
          step={500}
          value={priceMax}
          onChange={(e) => setPriceMax(Number(e.target.value))}
          className="w-full accent-[#988686] cursor-pointer"
        />
        <div className="flex gap-2">
          {[2000, 8000, 25000].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setPriceMax(val)}
              className="flex-1 py-1 rounded-lg glass-panel border border-[#988686]/20 text-[10px] font-mono hover:border-[#988686]/50 text-[#988686]"
            >
              &lt; ₹{val / 1000}k
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-6 page-transition pb-20">
      <PageLoaderBar active={loading || transitioning} />

      {/* ========================================================================= */}
      {/* 1. TOP MARKETPLACE HEADER & SEARCH                                        */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#988686]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#988686]">
              MULTI-VENDOR EQUIPMENT RENTAL CATALOG
            </span>
            <Badge variant="info">{products.length} Products Live</Badge>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#000000] dark:text-white mt-1">
            Browse 300+ Verified Production & Asset Rentals
          </h1>
        </div>

        {/* Global Search Bar */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Input
            placeholder="Search products, cinema rigs, excavators, brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="w-full md:w-80"
          />
          <Button
            variant="outline"
            leftIcon={<SlidersHorizontal className="w-4 h-4" />}
            onClick={() => {
              setShowFilters(!showFilters);
              setMobileFiltersOpen(true);
            }}
            className="shrink-0 fk-btn-press"
          >
            <span className="hidden sm:inline">{showFilters ? 'Hide Filters' : 'Filters'}</span>
            <span className="sm:hidden">Filters</span>
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FLIPKART HORIZONTAL CIRCULAR CATEGORY STRIP                               */}
      {/* ========================================================================= */}
      <div className="glass-panel p-3 sm:p-4 rounded-2xl border border-[#988686]/25 shadow-warm-xs">
        {loading ? (
          <CategoryStripSkeleton />
        ) : (
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-1 no-scrollbar">
            {FLIPKART_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`flex flex-col items-center gap-1.5 shrink-0 px-2 py-1 rounded-xl transition-all fk-btn-press ${
                    isSelected
                      ? 'text-[#000000] dark:text-white font-bold scale-105'
                      : 'text-[#5C4E4E] dark:text-[#B5A9A9] opacity-75 hover:opacity-100 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#000000] text-white dark:bg-white dark:text-black shadow-warm-md ring-2 ring-[#988686]'
                        : 'bg-[#988686]/15 text-[#5C4E4E] dark:text-[#D1D0D0] hover:bg-[#988686]/30'
                    }`}
                  >
                    {cat.icon}
                  </div>
                  <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">
                    {cat.label}
                  </span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#000000] dark:bg-white -mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Flipkart-Style Deals & Trust Ticker */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#988686]/10 border border-[#988686]/20 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#000000] dark:text-white flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#B08A4E]" />
            Deals of the Day:
          </span>
          <span className="text-[#5C4E4E] dark:text-[#B5A9A9] hidden sm:inline">
            Up to 40% off security deposits on verified cinema & mobility gear.
          </span>
        </div>
        <div className="flex items-center gap-2.5 font-mono text-[11px] text-[#5E7A63] font-bold">
          <span>⏳ Ends in 11h : 42m : 18s</span>
          <RoviaAssuredBadge size="sm" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FLIPKART/AMAZON CONTROL STRIP: Sort, View Toggle, Rental Dates        */}
      {/* ========================================================================= */}
      <div className="glass-nav p-3.5 sm:p-4 rounded-2xl border border-[#988686]/30 shadow-warm-md flex flex-wrap items-center justify-between gap-4">
        {/* Availability Window Dates */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5 font-semibold text-[#000000] dark:text-white">
            <Calendar className="w-4 h-4 text-[#988686]" />
            <span className="hidden sm:inline">Rental Window:</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 glass-input px-2.5 py-1 rounded-lg">
              <span className="text-[#988686] font-mono text-[9px] uppercase">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent focus:outline-none text-[#000000] dark:text-white font-medium text-xs"
              />
            </div>
            <span className="text-[#988686]">→</span>
            <div className="flex items-center gap-1.5 glass-input px-2.5 py-1 rounded-lg">
              <span className="text-[#988686] font-mono text-[9px] uppercase">To:</span>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent focus:outline-none text-[#000000] dark:text-white font-medium text-xs"
              />
            </div>
          </div>
        </div>

        {/* Right Controls: Sort Dropdown & Grid/List View Switcher */}
        <div className="flex items-center gap-3 ml-auto text-xs">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[#988686] font-semibold hidden md:inline">Sort By:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="glass-input rounded-xl px-3 py-1.5 font-semibold text-[#000000] dark:text-white text-xs focus:outline-none cursor-pointer border border-[#988686]/30"
            >
              <option value="featured">Featured / Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating (High to Low)</option>
              <option value="newest">Newest Additions</option>
            </select>
          </div>

          {/* Grid vs List View Switcher (Amazon / Flipkart Standard) */}
          <div className="flex items-center p-1 rounded-xl bg-[#988686]/15 border border-[#988686]/20">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-[#000000] dark:bg-[#988686] text-white shadow-sm' : 'text-[#988686] hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-[#000000] dark:bg-[#988686] text-white shadow-sm' : 'text-[#988686] hover:text-white'
              }`}
              title="List View (Flipkart Style)"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ACTIVE FILTER CHIPS (Flipkart / Amazon Pill Tags)                      */}
      {/* ========================================================================= */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
          <span className="text-[#988686] font-semibold text-[11px]">Active Filters:</span>

          {selectedCategory !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#988686]/20 border border-[#988686]/30 text-[#000000] dark:text-white font-medium">
              Category: {selectedCategory}
              <button onClick={() => setSelectedCategory('All')}>
                <X className="w-3 h-3 text-[#988686] hover:text-white" />
              </button>
            </span>
          )}

          {selectedBrand !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#988686]/20 border border-[#988686]/30 text-[#000000] dark:text-white font-medium">
              Brand: {selectedBrand}
              <button onClick={() => setSelectedBrand('All')}>
                <X className="w-3 h-3 text-[#988686] hover:text-white" />
              </button>
            </span>
          )}

          {minRating > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B08A4E]/20 border border-[#B08A4E]/40 text-[#B08A4E] font-medium">
              {minRating}★ & Above
              <button onClick={() => setMinRating(0)}>
                <X className="w-3 h-3 hover:text-white" />
              </button>
            </span>
          )}

          {priceMax < 50000 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#988686]/20 border border-[#988686]/30 text-[#000000] dark:text-white font-medium">
              Under ₹{priceMax.toLocaleString()}/day
              <button onClick={() => setPriceMax(50000)}>
                <X className="w-3 h-3 text-[#988686] hover:text-white" />
              </button>
            </span>
          )}

          {inStockOnly && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5E7A63]/20 border border-[#5E7A63]/40 text-[#5E7A63] font-medium">
              In Stock Only
              <button onClick={() => setInStockOnly(false)}>
                <X className="w-3 h-3 hover:text-white" />
              </button>
            </span>
          )}

          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5E7286]/20 border border-[#5E7286]/40 text-[#5E7286] font-medium">
              Query: "{searchQuery}"
              <button onClick={() => setSearchQuery('')}>
                <X className="w-3 h-3 hover:text-white" />
              </button>
            </span>
          )}

          <button
            onClick={clearAllFilters}
            className="text-[11px] text-[#A0524E] hover:underline font-bold ml-1"
          >
            Clear All
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MAIN LAYOUT: Multi-Facet Sidebar Left + Products Grid/List Right       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Filters (Desktop Sticky) */}
        {showFilters && (
          <div className="hidden lg:block lg:col-span-3 glass-panel p-5 rounded-3xl border border-[#988686]/30 shadow-lg sticky top-24 max-h-[85vh] overflow-y-auto">
            {renderFilterContent()}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. PRODUCTS RESULTS: Grid View OR Flipkart List View                      */}
        {/* ========================================================================= */}
        <div className={`${showFilters ? 'lg:col-span-9' : 'lg:col-span-12'} space-y-6`}>
          {/* Results Summary Counter */}
          <div className="flex items-center justify-between text-xs text-[#988686]">
            <span>
              Showing <strong className="text-[#000000] dark:text-white">{sortedProducts.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> –{' '}
              <strong className="text-[#000000] dark:text-white">{Math.min(currentPage * ITEMS_PER_PAGE, sortedProducts.length)}</strong> of{' '}
              <strong className="text-[#000000] dark:text-white">{sortedProducts.length}</strong> items
            </span>
            <span className="hidden sm:inline font-mono text-[11px]">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {/* Empty State */}
          {sortedProducts.length === 0 && (
            <div className="p-12 rounded-3xl glass-panel border border-[#988686]/30 text-center space-y-4">
              <ShoppingBag className="w-12 h-12 text-[#988686] mx-auto opacity-50" />
              <h3 className="font-heading text-xl font-bold text-[#000000] dark:text-white">
                No matching rental products found
              </h3>
              <p className="text-xs text-[#988686] max-w-md mx-auto">
                Try adjusting your search filters, expanding the price slider, or searching for broader categories like "Cameras" or "Machinery".
              </p>
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. PRODUCTS RESULTS: Shimmer Skeletons, Grid View OR Flipkart List View   */}
          {/* ========================================================================= */}
          {(loading || transitioning) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!loading && !transitioning && viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProducts.map((product) => {
                const regularRate = Math.round(product.dailyRate * 1.22);
                const discount = Math.round(((regularRate - product.dailyRate) / regularRate) * 100);

                return (
                  <Card
                    key={product.id}
                    className="overflow-hidden group hover:border-[#988686] transition-all duration-300 flex flex-col cursor-pointer border-[#988686]/25 shadow-warm-sm hover:shadow-warm-lg fk-btn-press"
                    onClick={() => onNavigate('product-detail', product.id)}
                  >
                    {/* Card Media Header */}
                    <div className="relative aspect-[4/3] bg-black/40 overflow-hidden">
                      <img
                        src={product.image || FALLBACK_IMAGE}
                        alt={product.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* ROVIA Assured Badge */}
                      <div className="absolute top-2.5 left-2.5">
                        <RoviaAssuredBadge size="sm" />
                      </div>

                      {/* Stock Status Badge */}
                      <div className="absolute top-2.5 right-2.5">
                        {product.available === 0 ? (
                          <Badge variant="danger">Unavailable</Badge>
                        ) : product.available < 3 ? (
                          <Badge variant="warning">Only {product.available} Left</Badge>
                        ) : (
                          <Badge variant="neutral">{product.available} in stock</Badge>
                        )}
                      </div>

                      {/* 4 Gallery Angles Preview Indicator */}
                      {product.gallery && product.gallery.length > 1 && (
                        <div className="absolute bottom-2 left-2.5 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-full text-[9px] font-mono text-white">
                          <span>{product.gallery.length} Angles</span>
                        </div>
                      )}
                    </div>

                    {/* Card Content Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#988686]">
                          <span>{product.brand}</span>
                          <div className="flex items-center gap-1 text-[#B08A4E] font-bold">
                            <Star className="w-3 h-3 fill-current" />
                            <span>{product.rating}</span>
                          </div>
                        </div>

                        <h3 className="font-heading text-base font-bold text-[#000000] dark:text-white line-clamp-1 group-hover:text-[#988686] transition-colors">
                          {product.name}
                        </h3>

                        <p className="text-xs text-[#5C4E4E] dark:text-[#B5A9A9] line-clamp-2">
                          {product.description}
                        </p>
                      </div>

                      {/* Pricing & Booking Row */}
                      <div className="pt-3 border-t border-[#988686]/20 flex items-center justify-between">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-heading font-extrabold text-lg text-[#000000] dark:text-white">
                              ₹{product.dailyRate.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-[#988686] line-through font-mono">
                              ₹{regularRate.toLocaleString()}
                            </span>
                            <span className="text-[9px] font-bold text-[#5E7A63]">
                              {discount}% OFF
                            </span>
                          </div>
                          <span className="text-[10px] text-[#988686] block font-mono">
                            + ₹{product.securityDeposit.toLocaleString()} dep
                          </span>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={product.available === 0}
                          leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                          onClick={(e) => handleQuickAdd(e, product)}
                        >
                          {product.available === 0 ? 'Rented' : 'Quick Add'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* ========================================================================= */}
          {/* OPTION B: LIST VIEW (Flipkart Horizontal Search Results Style)            */}
          {/* ========================================================================= */}
          {!loading && !transitioning && viewMode === 'list' && (
            <div className="space-y-4">
              {paginatedProducts.map((product) => {
                const regularRate = Math.round(product.dailyRate * 1.22);
                const discount = Math.round(((regularRate - product.dailyRate) / regularRate) * 100);

                return (
                  <Card
                    key={product.id}
                    className="p-5 overflow-hidden group hover:border-[#988686] transition-all flex flex-col md:flex-row gap-6 cursor-pointer border-[#988686]/25 shadow-warm-sm hover:shadow-warm-lg fk-btn-press"
                    onClick={() => onNavigate('product-detail', product.id)}
                  >
                    {/* Media Left */}
                    <div className="relative w-full md:w-56 aspect-[4/3] rounded-2xl overflow-hidden bg-black/40 shrink-0">
                      <img
                        src={product.image || FALLBACK_IMAGE}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <RoviaAssuredBadge size="sm" />
                      </div>
                    </div>

                    {/* Middle Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase text-[#988686]">{product.brand}</span>
                        <span className="text-[#988686]">•</span>
                        <span className="text-[10px] font-mono text-[#988686]">{product.category}</span>
                        <div className="ml-auto flex items-center gap-1 bg-[#5E7A63] text-white px-2 py-0.5 rounded-md text-[11px] font-bold">
                          <span>{product.rating}</span>
                          <Star className="w-3 h-3 fill-current" />
                        </div>
                      </div>

                      <h3 className="font-heading text-lg font-bold text-[#000000] dark:text-white group-hover:text-[#988686] transition-colors">
                        {product.name}
                      </h3>

                      <p className="text-xs text-[#5C4E4E] dark:text-[#B5A9A9] line-clamp-2">
                        {product.description}
                      </p>

                      {/* Flipkart Feature Highlights Bullets */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] text-[#988686]">
                        {Object.entries(product.specs || {}).slice(0, 4).map(([k, v]) => (
                          <div key={k} className="flex items-center gap-1 truncate">
                            <span className="text-[#5E7A63] font-bold">•</span>
                            <span className="font-semibold text-[#000000] dark:text-white">{k}:</span>
                            <span className="truncate">{String(v)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 pt-2 text-[11px] text-[#5E7286]">
                        <span className="flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5" /> Express Dispatch by Tomorrow
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5" /> {product.renterName}
                        </span>
                      </div>
                    </div>

                    {/* Right Price & Actions */}
                    <div className="md:w-56 md:border-l md:border-[#988686]/20 md:pl-6 flex flex-col justify-between space-y-4 shrink-0">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-heading font-extrabold text-2xl text-[#000000] dark:text-white">
                            ₹{product.dailyRate.toLocaleString()}
                          </span>
                          <span className="text-xs text-[#988686] line-through font-mono">
                            ₹{regularRate.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#5E7A63]">
                          {discount}% OFF • Per Day
                        </span>
                        <span className="text-[10px] text-[#988686] block mt-1">
                          ₹{product.securityDeposit.toLocaleString()} 100% Refundable Deposit
                        </span>
                      </div>

                      <div className="space-y-2">
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          disabled={product.available === 0}
                          onClick={() => onNavigate('product-detail', product.id)}
                        >
                          Rent Now
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled={product.available === 0}
                          onClick={(e) => handleQuickAdd(e, product)}
                        >
                          Quick Add
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 6. FLIPKART/AMAZON PAGINATION CONTROLS (Browsing 300 Products)            */}
          {/* ========================================================================= */}
          {totalPages > 1 && (
            <div className="p-4 rounded-2xl glass-panel border border-[#988686]/20 flex flex-wrap items-center justify-between gap-4 text-xs">
              <span className="text-[#988686]">
                Page <strong className="text-[#000000] dark:text-white">{currentPage}</strong> of <strong className="text-[#000000] dark:text-white">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Previous
                </Button>

                {/* Page Number Pills */}
                <div className="flex items-center gap-1 mx-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (currentPage > 3 && totalPages > 5) {
                      pageNum = Math.min(currentPage - 2 + i, totalPages - 4 + i);
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-8 h-8 rounded-lg font-bold font-mono text-xs transition-all ${
                          currentPage === pageNum
                            ? 'bg-[#000000] dark:bg-[#988686] text-white shadow-sm'
                            : 'glass-panel text-[#988686] hover:text-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Slide-Over Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm h-full bg-[#1c1917] dark:bg-[#12100e] p-5 shadow-2xl border-l border-[#988686]/30 overflow-y-auto z-10 flex flex-col justify-between">
            {renderFilterContent(() => setMobileFiltersOpen(false))}
            <div className="pt-4 mt-6 border-t border-[#988686]/20 flex gap-3 shrink-0">
              <Button variant="outline" className="flex-1" onClick={clearAllFilters}>Reset</Button>
              <Button variant="primary" className="flex-1" onClick={() => setMobileFiltersOpen(false)}>
                Show {sortedProducts.length} Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
