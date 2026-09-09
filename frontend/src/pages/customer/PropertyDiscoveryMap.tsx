import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  MapPin, 
  SlidersHorizontal, 
  Map as MapIcon, 
  List, 
  Compass, 
  Sparkles, 
  RefreshCw, 
  CheckCircle,
  Building,
  AlertCircle
} from 'lucide-react';
import { 
  Property, 
  PropertyFilterState, 
  GeoCoordinates 
} from '../../types/propertyTypes';
import { 
  INITIAL_PROPERTIES, 
  filterAndScoreProperties, 
  calculateDistanceKm, 
  GeocodedLocation,
  BENCHMARK_LOCATIONS
} from '../../services/propertyGeoService';
import { MapView } from '../../components/map/MapView';
import { MapSearch } from '../../components/map/MapSearch';
import { MapFilters } from '../../components/map/MapFilters';
import { PropertyMapCard } from '../../components/map/PropertyMapCard';
import { PropertyDetailModal } from '../../components/map/PropertyDetailModal';

export const PropertyDiscoveryMap: React.FC = () => {
  // Default anchor: Nadar Saraswathi College, Theni
  const defaultLocation: GeocodedLocation = BENCHMARK_LOCATIONS[0];

  const [activeLocation, setActiveLocation] = useState<GeocodedLocation>(defaultLocation);
  const [userGeoCoords, setUserGeoCoords] = useState<GeoCoordinates | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [filters, setFilters] = useState<PropertyFilterState>({
    searchQuery: '',
    searchedLocation: {
      name: defaultLocation.name,
      coordinates: defaultLocation.coordinates
    },
    radiusKm: 5, // Default 5 km radius
    propertyTypes: [],
    minRent: 0,
    maxRent: 50000,
    bedrooms: [],
    furnishing: [],
    availability: [],
    amenities: [],
    verifiedOnly: false,
    sortBy: 'recommended'
  });

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [detailModalProperty, setDetailModalProperty] = useState<Property | null>(null);

  // Mobile view state: 'map' or 'list'
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');

  const propertyCardsRef = useRef<Record<string, HTMLDivElement | null>>({});

  // Computed & scored properties based on active location and filter state
  const filteredProperties = useMemo(() => {
    return filterAndScoreProperties(
      INITIAL_PROPERTIES,
      filters,
      activeLocation.coordinates
    );
  }, [filters, activeLocation]);

  // Handle Location Selection
  const handleSelectLocation = (loc: GeocodedLocation) => {
    setActiveLocation(loc);
    setFilters(prev => ({
      ...prev,
      searchedLocation: {
        name: loc.name,
        coordinates: loc.coordinates
      }
    }));
    setSelectedProperty(null);
  };

  // Browser Geolocation ("Use My Location")
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: GeoCoordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserGeoCoords(coords);
        const userLoc: GeocodedLocation = {
          name: 'Your Current Location',
          locality: 'Detected GPS Position',
          city: 'Tamil Nadu',
          coordinates: coords
        };
        setActiveLocation(userLoc);
        setFilters(prev => ({
          ...prev,
          searchedLocation: {
            name: userLoc.name,
            coordinates: coords
          }
        }));
        setIsLoadingLocation(false);
      },
      (error) => {
        setIsLoadingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location permission denied. You can search any city or landmark above.');
        } else {
          setLocationError('Could not retrieve GPS location. Showing Nadar Saraswathi College, Theni.');
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Bidirectional sync: clicking a marker scrolls the card into view
  const handleSelectFromMap = (property: Property) => {
    setSelectedProperty(property);
    const cardEl = propertyCardsRef.current[property.id];
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      searchedLocation: {
        name: defaultLocation.name,
        coordinates: defaultLocation.coordinates
      },
      radiusKm: 0,
      propertyTypes: [],
      minRent: 0,
      maxRent: 50000,
      bedrooms: [],
      furnishing: [],
      availability: [],
      amenities: [],
      verifiedOnly: false,
      sortBy: 'recommended'
    });
  };

  return (
    <div className="w-full space-y-4 pb-16 sm:pb-8">
      {/* Top Hero Banner & Discovery Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs">
              AI Property Intelligence
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              Real-time Geodesic Discovery
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white tracking-tight">
            Map-Based Property Discovery
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
            Discover verified apartments, independent houses, villas, and hostels with transparent proximity to colleges, transit, and healthcare.
          </p>
        </div>

        {/* Current Active Location Pill */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs shrink-0">
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-rose-500">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Anchor Location</span>
            <span className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[200px] block">
              {activeLocation.name}
            </span>
          </div>
        </div>
      </div>

      {/* Geolocation Notice / Alert */}
      {locationError && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{locationError}</span>
          </div>
          <button
            onClick={() => setLocationError(null)}
            className="text-[11px] font-bold text-amber-700 underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search Bar & Auto-Complete */}
      <MapSearch
        onSelectLocation={handleSelectLocation}
        onUseCurrentLocation={handleUseCurrentLocation}
        isLoadingLocation={isLoadingLocation}
        activeLocationName={activeLocation.name}
      />

      {/* Dynamic Filters Bar */}
      <MapFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        totalResultsCount={filteredProperties.length}
      />

      {/* Mobile Floating View Switcher (Map vs List) */}
      <div className="md:hidden flex items-center justify-center sticky top-20 z-30 pt-1 pb-1">
        <div className="flex items-center p-1 rounded-full bg-zinc-900/90 dark:bg-zinc-100/95 backdrop-blur text-white dark:text-zinc-900 shadow-xl border border-white/20">
          <button
            type="button"
            onClick={() => setMobileTab('map')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition ${
              mobileTab === 'map'
                ? 'bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-300 dark:text-zinc-700 hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('list')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition ${
              mobileTab === 'list'
                ? 'bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-300 dark:text-zinc-700 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List ({filteredProperties.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT: SPLIT LIST & MAP (Desktop) / SWITCHABLE (Mobile)           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Properties List */}
        <div className={`lg:col-span-5 space-y-3.5 ${mobileTab === 'list' ? 'block' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Verified Units within {filters.radiusKm > 0 ? `${filters.radiusKm} km` : 'Region'}
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              {filteredProperties.length} available
            </span>
          </div>

          {filteredProperties.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 text-center space-y-3 bg-white/40 dark:bg-zinc-900/40">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                  No properties match your current filters
                </h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Try widening the search radius (e.g. 10 km or 20 km) or adjusting the budget limit.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold inline-flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4 max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
              {filteredProperties.map((prop) => (
                <div
                  key={prop.id}
                  ref={(el) => (propertyCardsRef.current[prop.id] = el)}
                >
                  <PropertyMapCard
                    property={prop}
                    isSelected={selectedProperty?.id === prop.id}
                    onSelect={(p) => {
                      setSelectedProperty(p);
                      // On mobile switch to map view to show pin
                      if (window.innerWidth < 1024) {
                        setMobileTab('map');
                      }
                    }}
                    onViewDetails={(p) => setDetailModalProperty(p)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Sticky Interactive Map */}
        <div className={`lg:col-span-7 lg:sticky lg:top-20 ${mobileTab === 'map' ? 'block' : 'hidden lg:block'}`}>
          <div className="relative h-[480px] sm:h-[580px] lg:h-[calc(100vh-210px)] w-full rounded-2xl overflow-hidden shadow-warm-md border border-zinc-200 dark:border-zinc-800">
            <MapView
              properties={filteredProperties}
              selectedProperty={selectedProperty}
              onSelectProperty={handleSelectFromMap}
              onViewDetails={(p) => setDetailModalProperty(p)}
              centerCoords={activeLocation.coordinates}
              radiusKm={filters.radiusKm}
              userCoords={userGeoCoords}
              className="w-full h-full"
            />

            {/* Mobile Bottom Sheet Preview Card (Shows selected property when on Map view) */}
            {selectedProperty && (
              <div className="lg:hidden absolute bottom-3 left-3 right-3 z-[450] animate-slideUp">
                <div className="relative">
                  <PropertyMapCard
                    property={selectedProperty}
                    compact={true}
                    isSelected={true}
                    onSelect={() => setDetailModalProperty(selectedProperty)}
                    onViewDetails={() => setDetailModalProperty(selectedProperty)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Property Detail Inspector Modal */}
      {detailModalProperty && (
        <PropertyDetailModal
          property={detailModalProperty}
          onClose={() => setDetailModalProperty(null)}
          onBookVisit={(p) => {
            // Success handler
          }}
        />
      )}
    </div>
  );
};
