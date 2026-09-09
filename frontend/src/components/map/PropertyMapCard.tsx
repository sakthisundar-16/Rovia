import React from 'react';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  ShieldCheck, 
  Navigation, 
  Eye, 
  CheckCircle,
  Phone,
  Zap,
  Sparkles
} from 'lucide-react';
import { Property } from '../../types/propertyTypes';
import { PropertyMatchScore } from './PropertyMatchScore';

interface PropertyMapCardProps {
  property: Property;
  isSelected?: boolean;
  onSelect: (property: Property) => void;
  onViewDetails: (property: Property) => void;
  compact?: boolean;
}

export const PropertyMapCard: React.FC<PropertyMapCardProps> = ({
  property,
  isSelected = false,
  onSelect,
  onViewDetails,
  compact = false
}) => {
  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${property.coordinates.lat},${property.coordinates.lng}`;
    window.open(url, '_blank');
  };

  if (compact) {
    // Ultra compact card for mobile horizontal carousel / preview drawer
    return (
      <div
        onClick={() => onSelect(property)}
        className={`flex items-center gap-3 p-2.5 rounded-xl border bg-white dark:bg-zinc-900 cursor-pointer transition shadow-xs ${
          isSelected 
            ? 'border-zinc-900 dark:border-white ring-2 ring-zinc-900/20' 
            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
        }`}
      >
        <img
          src={property.coverImage}
          alt={property.title}
          className="w-20 h-20 rounded-lg object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 truncate">
              {property.propertyType}
            </span>
            {property.matchScore && (
              <PropertyMatchScore score={property.matchScore} compact />
            )}
          </div>
          <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
            {property.title}
          </h4>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="font-extrabold text-sm text-zinc-950 dark:text-white">
              ₹{property.rentMonthly.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-zinc-400">/mo</span>
            {property.calculatedDistanceKm !== undefined && (
              <span className="ml-auto text-[10px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                <MapPin className="w-2.5 h-2.5" />
                {property.calculatedDistanceKm} km
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-500">
            <span>{property.bedrooms > 0 ? `${property.bedrooms} BHK` : 'Studio'}</span>
            <span>•</span>
            <span>{property.furnishing}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(property)}
      className={`group rounded-2xl border bg-white dark:bg-zinc-900 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected
          ? 'border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/15 shadow-warm-md'
          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
      }`}
    >
      {/* Image Banner */}
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={property.coverImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/80 backdrop-blur-sm text-white shadow-xs">
            {property.propertyType}
          </span>
          {property.verifiedListing && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-600/90 text-white flex items-center gap-1 shadow-xs">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>

        {/* Proximity Pill */}
        {property.calculatedDistanceKm !== undefined && (
          <div className="absolute top-2.5 right-2.5">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-white shadow-md flex items-center gap-1">
              <MapPin className="w-3 h-3 text-rose-500" />
              {property.calculatedDistanceKm} km away
            </span>
          </div>
        )}

        {/* Bottom Status & Match Score Overlay */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-900/70 backdrop-blur-md text-white">
            {property.availability}
          </span>
          {property.matchScore && (
            <PropertyMatchScore score={property.matchScore} compact />
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-3.5 sm:p-4 space-y-3">
        {/* Price & Security Deposit */}
        <div className="flex items-baseline justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white">
                ₹{property.rentMonthly.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-zinc-500">/ month</span>
            </div>
            <div className="text-[11px] text-zinc-400">
              Deposit: ₹{property.securityDeposit.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {property.areaSqFt} sq.ft
            </span>
            <div className="text-[10px] text-zinc-400">
              (₹{Math.round(property.rentMonthly / property.areaSqFt)}/sqft)
            </div>
          </div>
        </div>

        {/* Title & Locality */}
        <div>
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-950 leading-snug line-clamp-1">
            {property.title}
          </h3>
          <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5 truncate">
            <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
            <span>{property.locality}, {property.city}</span>
          </p>
        </div>

        {/* Key Specs Row */}
        <div className="grid grid-cols-3 gap-1.5 py-2 px-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-700 dark:text-zinc-300 font-medium">
          <div className="flex items-center gap-1">
            <Bed className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="truncate">{property.bedrooms > 0 ? `${property.bedrooms} BHK` : 'Studio'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="truncate">{property.bathrooms} Bath</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="truncate">{property.furnishing}</span>
          </div>
        </div>

        {/* Explainable Match Reason Preview */}
        {property.matchReasons && property.matchReasons.length > 0 && (
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-start gap-1.5 line-clamp-1">
            <Sparkles className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
            <span className="truncate">{property.matchReasons[0]}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleDirections}
            className="w-full py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition active:scale-98"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Directions</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(property);
            }}
            className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-98 shadow-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};
