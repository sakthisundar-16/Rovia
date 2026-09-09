import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Crosshair, Loader2, X, Building2, GraduationCap, Navigation } from 'lucide-react';
import { 
  searchGeocodedLocations, 
  GeocodedLocation, 
  BENCHMARK_LOCATIONS 
} from '../../services/propertyGeoService';
import { GeoCoordinates } from '../../types/propertyTypes';

interface MapSearchProps {
  onSelectLocation: (loc: GeocodedLocation) => void;
  onUseCurrentLocation: () => void;
  isLoadingLocation?: boolean;
  activeLocationName?: string;
}

export const MapSearch: React.FC<MapSearchProps> = ({
  onSelectLocation,
  onUseCurrentLocation,
  isLoadingLocation = false,
  activeLocationName
}) => {
  const [query, setQuery] = useState(activeLocationName || '');
  const [suggestions, setSuggestions] = useState<GeocodedLocation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeLocationName) {
      setQuery(activeLocationName);
    }
  }, [activeLocationName]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Input Changes with debounce
  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchGeocodedLocations(query);
      setSuggestions(results);
      setIsSearching(false);
      setIsOpen(true);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handlePick = (loc: GeocodedLocation) => {
    setQuery(loc.name);
    setIsOpen(false);
    onSelectLocation(loc);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
  };

  // Curated benchmark chips for instant 1-tap filtering (especially on mobile)
  const quickPillLandmarks = [
    { label: '🎓 Nadar Saraswathi College', loc: BENCHMARK_LOCATIONS[0] },
    { label: '🚌 Theni New Bus Stand', loc: BENCHMARK_LOCATIONS[2] },
    { label: '🏘️ Allinagaram', loc: BENCHMARK_LOCATIONS[5] },
    { label: '🛣️ Madurai Main Rd', loc: BENCHMARK_LOCATIONS[4] },
    { label: '🌳 Cumbum Bypass', loc: BENCHMARK_LOCATIONS[6] },
  ];

  return (
    <div className="w-full space-y-2.5" ref={wrapperRef}>
      {/* Search Input Box */}
      <div className="relative flex items-center w-full">
        <div className="absolute left-3.5 text-zinc-400 pointer-events-none">
          <Search className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder="Search by college, city, landmark, or PIN code (e.g. Nadar Saraswathi, Theni, 625531)..."
          className="w-full pl-10 pr-28 py-2.5 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 placeholder:text-zinc-400 transition"
        />

        <div className="absolute right-2 flex items-center gap-1.5">
          {query && (
            <button
              onClick={handleClear}
              className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Use My Location GPS Button */}
          <button
            onClick={onUseCurrentLocation}
            disabled={isLoadingLocation}
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 transition shadow-xs active:scale-95"
            title="Use current GPS location"
          >
            {isLoadingLocation ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            ) : (
              <Crosshair className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            )}
            <span className="hidden sm:inline">Near Me</span>
          </button>
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-72 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              Searching locations...
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-1.5 divide-y divide-zinc-100 dark:divide-zinc-800">
              {suggestions.map((loc, idx) => (
                <button
                  key={`${loc.name}-${idx}`}
                  type="button"
                  onClick={() => handlePick(loc)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 flex items-start gap-3 transition"
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shrink-0">
                    {loc.name.toLowerCase().includes('college') || loc.name.toLowerCase().includes('school') ? (
                      <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <MapPin className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                      {loc.name}
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate">
                      {loc.locality}, {loc.city} {loc.pincode ? `• PIN ${loc.pincode}` : ''}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-zinc-500">
              No matching locations found. Try searching &quot;Theni&quot;, &quot;Nadar Saraswathi&quot;, or &quot;625531&quot;.
            </div>
          )}
        </div>
      )}

      {/* Quick Landmark Chips for Mobile & Quick Discovery */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 shrink-0 mr-1">
          Popular:
        </span>
        {quickPillLandmarks.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handlePick(item.loc)}
            className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition border border-zinc-200/50 dark:border-zinc-700/50"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};
