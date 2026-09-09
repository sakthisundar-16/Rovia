import React, { useState } from 'react';
import { 
  GraduationCap, 
  Stethoscope, 
  Bus, 
  ShoppingCart, 
  Landmark, 
  UtensilsCrossed, 
  Pill, 
  MapPin, 
  Clock 
} from 'lucide-react';
import { NearbyFacility, FacilityCategory } from '../../types/propertyTypes';

interface NearbyFacilitiesProps {
  facilities: NearbyFacility[];
  className?: string;
}

export const NearbyFacilities: React.FC<NearbyFacilitiesProps> = ({
  facilities,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FacilityCategory | 'all'>('all');

  const categoryMeta: Record<FacilityCategory, { label: string; icon: React.ReactNode; color: string }> = {
    colleges: { label: 'Colleges', icon: <GraduationCap className="w-3.5 h-3.5" />, color: 'text-purple-600 dark:text-purple-400' },
    schools: { label: 'Schools', icon: <GraduationCap className="w-3.5 h-3.5" />, color: 'text-indigo-600 dark:text-indigo-400' },
    hospitals: { label: 'Hospitals', icon: <Stethoscope className="w-3.5 h-3.5" />, color: 'text-rose-600 dark:text-rose-400' },
    transit: { label: 'Transit & Bus', icon: <Bus className="w-3.5 h-3.5" />, color: 'text-blue-600 dark:text-blue-400' },
    supermarkets: { label: 'Markets', icon: <ShoppingCart className="w-3.5 h-3.5" />, color: 'text-emerald-600 dark:text-emerald-400' },
    banks: { label: 'Banks & ATMs', icon: <Landmark className="w-3.5 h-3.5" />, color: 'text-amber-600 dark:text-amber-400' },
    restaurants: { label: 'Food & Dining', icon: <UtensilsCrossed className="w-3.5 h-3.5" />, color: 'text-orange-600 dark:text-orange-400' },
    pharmacies: { label: 'Pharmacies', icon: <Pill className="w-3.5 h-3.5" />, color: 'text-teal-600 dark:text-teal-400' }
  };

  const filtered = selectedCategory === 'all' 
    ? facilities 
    : facilities.filter(f => f.category === selectedCategory);

  // Group count
  const presentCategories = Array.from(new Set(facilities.map(f => f.category)));

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
          }`}
        >
          All Nearby ({facilities.length})
        </button>

        {presentCategories.map((cat) => {
          const meta = categoryMeta[cat];
          const count = facilities.filter(f => f.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition shrink-0 ${
                selectedCategory === cat
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
              }`}
            >
              <span className={selectedCategory === cat ? 'text-white dark:text-zinc-900' : meta.color}>
                {meta.icon}
              </span>
              <span>{meta.label}</span>
              <span className="text-[10px] opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Facilities Proximity List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
        {filtered.map((item) => {
          const meta = categoryMeta[item.category] || categoryMeta.transit;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 hover:border-zinc-300 dark:hover:border-zinc-600 transition"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-1.5 rounded-md bg-white dark:bg-zinc-700 shadow-xs shrink-0 ${meta.color}`}>
                  {meta.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-zinc-500 flex items-center gap-2">
                    <span className="capitalize">{meta.label}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      ~{item.travelTimeMin} min
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 ml-2">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-zinc-200/70 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200">
                  {item.distanceKm} km
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
