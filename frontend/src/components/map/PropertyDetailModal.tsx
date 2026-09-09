import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Phone, 
  ShieldCheck, 
  Calendar, 
  Check, 
  Compass, 
  Layers, 
  Car, 
  Droplets, 
  Zap, 
  Sparkles, 
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Property } from '../../types/propertyTypes';
import { NearbyFacilities } from './NearbyFacilities';
import { PropertyMatchScore } from './PropertyMatchScore';

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
  onBookVisit?: (property: Property) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onBookVisit
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'facilities' | 'landlord'>('overview');
  const [copiedLink, setCopiedLink] = useState(false);
  const [inquired, setInquired] = useState(false);

  if (!property) return null;

  const photos = property.gallery && property.gallery.length > 0 ? property.gallery : [property.coverImage];

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${property.coordinates.lat},${property.coordinates.lng}`;
    window.open(url, '_blank');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shrink-0">
              {property.propertyType}
            </span>
            <span className="text-xs text-zinc-500 truncate">
              {property.locality}, {property.city}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition"
              title="Share property link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Photo Gallery Carousel */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-zinc-950">
            <img
              src={photos[activePhotoIdx]}
              alt={property.title}
              className="w-full h-full object-cover"
            />

            {/* Previous / Next buttons */}
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition shadow-md"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition shadow-md"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Photo Counter */}
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold">
              {activePhotoIdx + 1} / {photos.length}
            </div>

            {/* Distance Pill */}
            {property.calculatedDistanceKm !== undefined && (
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 text-zinc-900 text-xs font-bold shadow-md flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>{property.calculatedDistanceKm} km from target</span>
              </div>
            )}
          </div>

          {/* Pricing & Key Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
                {property.title}
              </h2>
              <p className="text-sm text-zinc-500 flex items-center gap-1.5 mt-1">
                <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>{property.address}</span>
              </p>
            </div>

            <div className="sm:text-right shrink-0 bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-zinc-200/70 dark:border-zinc-700/60">
              <div className="flex items-baseline sm:justify-end gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white">
                  ₹{property.rentMonthly.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-zinc-500 font-medium">/ month</span>
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">
                Security Deposit: <span className="font-semibold text-zinc-800 dark:text-zinc-200">₹{property.securityDeposit.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Explainable Match Score */}
          {property.matchScore && (
            <PropertyMatchScore 
              score={property.matchScore} 
              reasons={property.matchReasons} 
              unmatched={property.unmatchedReasons} 
            />
          )}

          {/* Sub-Tabs: Overview, Facilities, Landlord */}
          <div className="border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2 text-xs sm:text-sm font-bold border-b-2 transition ${
                activeTab === 'overview'
                  ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-700'
              }`}
            >
              Property Overview & Specs
            </button>
            <button
              onClick={() => setActiveTab('facilities')}
              className={`pb-2 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'facilities'
                  ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-700'
              }`}
            >
              <span>Nearby Facilities</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                {property.nearbyFacilities.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('landlord')}
              className={`pb-2 text-xs sm:text-sm font-bold border-b-2 transition ${
                activeTab === 'landlord'
                  ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-700'
              }`}
            >
              Landlord & Lease Terms
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Core Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block">Bedrooms</span>
                  <span className="text-sm font-black text-zinc-900 dark:text-white">
                    {property.bedrooms > 0 ? `${property.bedrooms} BHK` : 'Studio'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block">Super Area</span>
                  <span className="text-sm font-black text-zinc-900 dark:text-white">{property.areaSqFt} sq.ft</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block">Furnishing</span>
                  <span className="text-sm font-black text-zinc-900 dark:text-white">{property.furnishing}</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block">Facing & Floor</span>
                  <span className="text-sm font-black text-zinc-900 dark:text-white">{property.facing} • {property.floor}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Description</h4>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {property.description}
                </p>
              </div>

              {/* Amenities Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                  Amenities & Facilities
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {property.amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Utility Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 text-xs">
                <div className="flex items-center gap-2.5">
                  <Droplets className="w-4 h-4 text-blue-500 shrink-0" />
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Water Supply</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">{property.waterSupply}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Power Backup</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">{property.powerBackup}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Car className="w-4 h-4 text-zinc-600 dark:text-zinc-300 shrink-0" />
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Parking Facility</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">{property.parking}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Nearby Facilities */}
          {activeTab === 'facilities' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-300 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Proximity map for colleges, transit, healthcare, and retail near this property.</span>
              </div>
              <NearbyFacilities facilities={property.nearbyFacilities} />
            </div>
          )}

          {/* Tab 3: Landlord Info */}
          {activeTab === 'landlord' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-black text-lg">
                    {property.landlordName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-zinc-900 dark:text-white">
                        {property.landlordName}
                      </span>
                      {property.verifiedListing && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                          Verified Partner
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Rating: ⭐ {property.landlordRating} / 5.0 • Fast responder
                    </p>
                  </div>
                </div>

                <a
                  href={`tel:${property.landlordPhone}`}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 transition shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {property.landlordPhone}</span>
                </a>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                <h4 className="font-bold text-zinc-900 dark:text-white">Standard Lease Terms:</h4>
                <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-400">
                  <li>Agreement Duration: 11-month renewable registered lease.</li>
                  <li>Notice Period: 1 month prior written notice before vacating.</li>
                  <li>Security deposit 100% refundable after digital OpenCV property verification.</li>
                  <li>Bachelors &amp; Family friendly policies per verified society guidelines.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 sm:px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleDirections}
            className="px-4 py-2.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-xs font-semibold flex items-center gap-2 transition"
          >
            <Navigation className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Get Directions (Maps)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={inquired}
              onClick={() => {
                setInquired(true);
                if (onBookVisit) onBookVisit(property);
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-sm ${
                inquired
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-900'
              }`}
            >
              {inquired ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Visit Scheduled! Landlord Alerted</span>
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  <span>Book Free Site Visit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
