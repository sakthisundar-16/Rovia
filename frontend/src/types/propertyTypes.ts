export type PropertyType = 
  | 'Apartment'
  | 'Independent House'
  | 'Villa'
  | 'Studio'
  | 'Commercial Space'
  | 'PG / Hostel';

export type FurnishingStatus = 'Furnished' | 'Semi-Furnished' | 'Unfurnished';

export type AvailabilityTimeline = 'Available Now' | 'Within 15 Days' | 'Next Month';

export type PropertyStatus = 'Available' | 'Occupied' | 'Under Maintenance';

export type FacilityCategory = 
  | 'colleges'
  | 'schools'
  | 'hospitals'
  | 'supermarkets'
  | 'transit'
  | 'banks'
  | 'restaurants'
  | 'pharmacies';

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface NearbyFacility {
  id: string;
  name: string;
  category: FacilityCategory;
  distanceKm: number;
  travelTimeMin: number;
  landmarkType?: string;
  address?: string;
}

export interface TenantInfo {
  name: string;
  phone: string;
  email: string;
  leaseStart: string;
  leaseEnd: string;
  monthlyRent: number;
  depositHeld: number;
  paymentStatus: 'Paid' | 'Due' | 'Overdue';
}

export interface MaintenanceTicket {
  id: string;
  issue: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Reported' | 'In Progress' | 'Scheduled';
  scheduledDate: string;
  contractorName: string;
}

export interface Property {
  id: string;
  title: string;
  tagline: string;
  propertyType: PropertyType;
  rentMonthly: number;
  securityDeposit: number;
  bedrooms: number; // 0 for studio / commercial
  bathrooms: number;
  areaSqFt: number;
  furnishing: FurnishingStatus;
  availability: AvailabilityTimeline;
  availableDate: string;
  status: PropertyStatus;
  
  // Location
  address: string;
  locality: string;
  city: string;
  pincode: string;
  coordinates: GeoCoordinates;
  
  // Specifications & Features
  floor: string;
  facing: 'North' | 'South' | 'East' | 'West' | 'North-East';
  parking: 'Covered Car + Bike' | 'Covered Car' | 'Bike Only' | 'Open' | 'None';
  amenities: string[];
  petFriendly: boolean;
  bachelorsAllowed: boolean;
  waterSupply: '24/7 Corporation & Borewell' | 'Corporation Water' | 'Borewell';
  powerBackup: '100% Full Backup' | 'Inverter Backup' | 'None';

  // Media & Info
  coverImage: string;
  gallery: string[];
  description: string;
  virtualTourUrl?: string;

  // Landlord / Management
  landlordId: string;
  landlordName: string;
  landlordPhone: string;
  landlordRating: number;
  verifiedListing: boolean;

  // Management (for Landlord / Admin views)
  tenant?: TenantInfo;
  maintenance?: MaintenanceTicket;

  // Intelligence
  nearbyFacilities: NearbyFacility[];
  calculatedDistanceKm?: number;
  matchScore?: number;
  matchReasons?: string[];
  unmatchedReasons?: string[];
}

export interface PropertyFilterState {
  searchQuery: string;
  searchedLocation?: {
    name: string;
    coordinates: GeoCoordinates;
  };
  radiusKm: number; // 1, 2, 5, 10, 20, or 0 for any
  propertyTypes: PropertyType[];
  minRent: number;
  maxRent: number;
  bedrooms: number[]; // e.g. [1, 2, 3, 4] where 4 means 4+
  furnishing: FurnishingStatus[];
  availability: AvailabilityTimeline[];
  amenities: string[];
  verifiedOnly: boolean;
  sortBy: 'recommended' | 'distance' | 'price_low_high' | 'price_high_low' | 'match_score';
}

export interface LocalityAreaAnalytics {
  locality: string;
  city: string;
  totalProperties: number;
  availableCount: number;
  occupiedCount: number;
  maintenanceCount: number;
  avgRent: number;
  avgPricePerSqFt: number;
  occupancyRate: number;
  coordinates: GeoCoordinates;
  topDemandBHK: string;
}
