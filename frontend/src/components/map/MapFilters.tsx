import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  RotateCcw, 
  Check, 
  X, 
  ChevronDown, 
  Building, 
  Sparkles, 
  ShieldCheck, 
  Car, 
  Zap, 
  Wifi, 
  Shield 
} from 'lucide-react';
import { 
  PropertyFilterState, 
  PropertyType, 
  FurnishingStatus, 
  AvailabilityTimeline 
} from '../../types/propertyTypes';

interface MapFiltersProps {
  filters: PropertyFilterState;
  onChange: (updated: PropertyFilterState) => void;
  onReset: () => void;
  totalResultsCount: number;
}

export const MapFilters: React.FC<MapFiltersProps> = ({
  filters,
  onChange,
  onReset,
  totalResultsCount
}) => {
  const [isExpandedMobile, setIsExpandedMobile] = useState(false);

  const radiusOptions = [
    { label: 'All', value: 0 },
    { label: '1 km', value: 1 },
    { label: '2 km', value: 2 },
    { label: '5 km', value: 5 },
    { label: '10 km', value: 10 },
    { label: '20 km', value: 20 },
  ];

  const propertyTypeOptions: PropertyType[] = [
    'Apartment',
    'Independent House',
    'Villa',
    'Studio',
    'PG / Hostel',
    'Commercial Space'
  ];

  const bhkOptions = [
    { label: '1 BHK', value: 1 },
    { label: '2 BHK', value: 2 },
    { label: '3 BHK', value: 3 },
    { label: '4+ BHK', value: 4 },
  ];

  const furnishingOptions: FurnishingStatus[] = ['Furnished', 'Semi-Furnished', 'Unfurnished'];

  const availabilityOptions: AvailabilityTimeline[] = ['Available Now', 'Within 15 Days', 'Next Month'];

  const topAmenities = [
    'Power Backup',
    'Covered Parking',
    'Lift',
    '24/7 Security',
    'High-Speed WiFi',
    'RO Water',
    'Gym',
    'Swimming Pool'
  ];

  const togglePropertyType = (type: PropertyType) => {
    const exists = filters.propertyTypes.includes(type);
    const updated = exists 
      ? filters.propertyTypes.filter(t => t !== type)
      : [...filters.propertyTypes, type];
    onChange({ ...filters, propertyTypes: updated });
  };

  const toggleBhk = (bhk: number) => {
    const exists = filters.bedrooms.includes(bhk);
    const updated = exists 
      ? filters.bedrooms.filter(b => b !== bhk)
      : [...filters.bedrooms, bhk];
    onChange({ ...filters, bedrooms: updated });
  };

  const toggleFurnishing = (item: FurnishingStatus) => {
    const exists = filters.furnishing.includes(item);
    const updated = exists 
      ? filters.furnishing.filter(f => f !== item)
      : [...filters.furnishing, item];
    onChange({ ...filters, furnishing: updated });
  };

  const toggleAmenity = (amenity: string) => {
    const exists = filters.amenities.includes(amenity);
    const updated = exists 
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    onChange({ ...filters, amenities: updated });
  };

  const activeFiltersCount = 
    (filters.radiusKm > 0 ? 1 : 0) +
    filters.propertyTypes.length +
    filters.bedrooms.length +
    filters.furnishing.length +
    filters.amenities.length +
    (filters.maxRent < 50000 ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0);

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4 shadow-sm">
      {/* Top Header / Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
          <span className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-white">
            Discovery Filters
          </span>
          {activeFiltersCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-black text-white dark:bg-white dark:text-black">
              {activeFiltersCount}
            </span>
          )}
          <span className="text-[11px] text-zinc-500 ml-1">
            ({totalResultsCount} properties found)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          {/* Toggle Button on Mobile / Tablet */}
          <button
            onClick={() => setIsExpandedMobile(prev => !prev)}
            className="sm:hidden px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center gap-1"
          >
            <span>{isExpandedMobile ? 'Less' : 'More Filters'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpandedMobile ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Primary Radius Bar (Always visible) */}
      <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mr-1">
          Radius:
        </span>
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {radiusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ ...filters, radiusKm: opt.value })}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                filters.radiusKm === opt.value
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expandable Filter Grid (Always open on desktop, toggleable on mobile) */}
      <div className={`mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-4 ${isExpandedMobile ? 'block' : 'hidden sm:block'}`}>
        {/* Row 1: Property Type & BHK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Property Types */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Property Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {propertyTypeOptions.map((type) => {
                const active = filters.propertyTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => togglePropertyType(type)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                      active
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent shadow-xs'
                        : 'bg-transparent text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bedrooms / BHK */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Bedrooms (BHK)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {bhkOptions.map((opt) => {
                const active = filters.bedrooms.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleBhk(opt.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                      active
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent shadow-xs'
                        : 'bg-transparent text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 2: Rent Budget Slider & Furnishing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rent Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Monthly Rent Limit
              </label>
              <span className="text-xs font-bold text-zinc-900 dark:text-white">
                Up to ₹{filters.maxRent >= 50000 ? '50,000+' : filters.maxRent.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min={3000}
              max={50000}
              step={1000}
              value={filters.maxRent}
              onChange={(e) => onChange({ ...filters, maxRent: Number(e.target.value) })}
              className="w-full accent-zinc-900 dark:accent-zinc-100 cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
              <span>₹3,000</span>
              <span>₹25,000</span>
              <span>₹50,000+</span>
            </div>
          </div>

          {/* Furnishing Status */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Furnishing
            </label>
            <div className="flex flex-wrap gap-1.5">
              {furnishingOptions.map((opt) => {
                const active = filters.furnishing.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleFurnishing(opt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                      active
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent shadow-xs'
                        : 'bg-transparent text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 3: Amenities Chips */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
            Key Amenities
          </label>
          <div className="flex flex-wrap gap-1.5">
            {topAmenities.map((amenity) => {
              const active = filters.amenities.includes(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition border ${
                    active
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-semibold'
                      : 'bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  {active && <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                  <span>{amenity}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sorting & Verification */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.verifiedOnly}
              onChange={(e) => onChange({ ...filters, verifiedOnly: e.target.checked })}
              className="rounded accent-zinc-900 w-3.5 h-3.5"
            />
            <span className="text-zinc-700 dark:text-zinc-300 font-medium">Verified Landlords Only</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-[11px]">Sort By:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
              className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs py-1 px-2.5 rounded-lg border-none focus:ring-1 focus:ring-zinc-400 cursor-pointer font-medium"
            >
              <option value="recommended">Best Match</option>
              <option value="distance">Nearest Distance</option>
              <option value="price_low_high">Rent: Low to High</option>
              <option value="price_high_low">Rent: High to Low</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
