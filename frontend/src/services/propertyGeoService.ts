import { 
  GeoCoordinates, 
  Property, 
  PropertyFilterState, 
  LocalityAreaAnalytics,
  NearbyFacility 
} from '../types/propertyTypes';

// Earth radius in kilometers for Haversine calculations
const EARTH_RADIUS_KM = 6371;

/**
 * Calculates accurate geodesic distance between two points using the Haversine formula
 */
export function calculateDistanceKm(coord1: GeoCoordinates, coord2: GeoCoordinates): number {
  if (!coord1 || !coord2) return 0;
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * (Math.PI / 180)) *
      Math.cos(coord2.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((EARTH_RADIUS_KM * c).toFixed(2));
}

export interface GeocodedLocation {
  name: string;
  locality: string;
  city: string;
  pincode?: string;
  coordinates: GeoCoordinates;
  description?: string;
}

// Built-in benchmark locations for instant, zero-latency autocomplete & offline resilience
export const BENCHMARK_LOCATIONS: GeocodedLocation[] = [
  {
    name: 'Nadar Saraswathi College of Arts & Science',
    locality: 'Vadapudupatti',
    city: 'Theni',
    pincode: '625531',
    coordinates: { lat: 10.0242, lng: 77.4916 },
    description: 'Premier Women\'s Higher Educational Institution, Theni'
  },
  {
    name: 'Nadar Saraswathi College of Engineering & Technology',
    locality: 'Vadapudupatti',
    city: 'Theni',
    pincode: '625531',
    coordinates: { lat: 10.0215, lng: 77.4930 },
    description: 'Engineering Campus near Post Office, Theni'
  },
  {
    name: 'Theni New Bus Stand',
    locality: 'Allinagaram',
    city: 'Theni',
    pincode: '625531',
    coordinates: { lat: 10.0125, lng: 77.4789 },
    description: 'Central Transit Hub & Commercial Center'
  },
  {
    name: 'Theni Old Bus Stand & Market',
    locality: 'Theni Town',
    city: 'Theni',
    pincode: '625531',
    coordinates: { lat: 10.0094, lng: 77.4752 },
    description: 'Town Center, Bazaars & Retail Shops'
  },
  {
    name: 'Madurai Main Road',
    locality: 'Unjampatti',
    city: 'Theni',
    pincode: '625531',
    coordinates: { lat: 10.0180, lng: 77.4980 },
    description: 'National Highway Corridors, Tech & Residential Hub'
  },
  {
    name: 'Allinagaram Residential Enclave',
    locality: 'Allinagaram',
    city: 'Theni',
    pincode: '625531',
    coordinates: { lat: 10.0150, lng: 77.4710 },
    description: 'Peaceful Family Neighborhood & Independent Villas'
  },
  {
    name: 'Cumbum Road Bypass',
    locality: 'Palani Chettipatti',
    city: 'Theni',
    pincode: '625531',
    coordinates: { lat: 9.9980, lng: 77.4620 },
    description: 'Lush Green Belt with Luxury Independent Houses'
  },
  {
    name: 'Theni Government Medical College & Hospital',
    locality: 'K.Vilangudi',
    city: 'Theni',
    pincode: '625531',
    coordinates: { lat: 10.0380, lng: 77.5310 },
    description: 'Tertiary Care Hospital & Medical Campus'
  },
  {
    name: 'Forest Road Tech Corridor',
    locality: 'Theni Town',
    city: 'Theni',
    pincode: '625531',
    coordinates: { lat: 10.0130, lng: 77.4850 },
    description: 'Commercial & Rental Apartments Hub'
  },
  {
    name: 'Mattuthavani Integrated Bus Terminus',
    locality: 'Mattuthavani',
    city: 'Madurai',
    pincode: '625007',
    coordinates: { lat: 9.9325, lng: 78.1560 },
    description: 'Madurai Regional Transport Hub'
  },
  {
    name: 'Anna Nagar East',
    locality: 'Anna Nagar',
    city: 'Chennai',
    pincode: '600102',
    coordinates: { lat: 13.0850, lng: 80.2100 },
    description: 'Upscale Residential & Commercial Boulevard'
  },
  {
    name: 'HSR Layout Sector 1',
    locality: 'HSR Layout',
    city: 'Bangalore',
    pincode: '560102',
    coordinates: { lat: 12.9121, lng: 77.6446 },
    description: 'Startup Hub & Premium Gated Communities'
  },
  {
    name: 'Bandra Kurla Complex (BKC)',
    locality: 'Bandra East',
    city: 'Mumbai',
    pincode: '400051',
    coordinates: { lat: 19.0657, lng: 72.8686 },
    description: 'Financial District & Modern Serviced Apartments'
  }
];

/**
 * Searches for geocoded locations via fuzzy matching against benchmark points,
 * with graceful fallback to OpenStreetMap Nominatim.
 */
export async function searchGeocodedLocations(query: string): Promise<GeocodedLocation[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  // 1. Fast match against benchmark locations
  const localMatches = BENCHMARK_LOCATIONS.filter(loc => 
    loc.name.toLowerCase().includes(trimmed) ||
    loc.locality.toLowerCase().includes(trimmed) ||
    loc.city.toLowerCase().includes(trimmed) ||
    (loc.pincode && loc.pincode.includes(trimmed)) ||
    (loc.description && loc.description.toLowerCase().includes(trimmed))
  );

  if (localMatches.length > 0) {
    return localMatches;
  }

  // 2. Fallback to OpenStreetMap Nominatim with strict 2.5s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ROVIA-Rental-Property-Intelligence/1.0'
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          name: item.display_name.split(',')[0],
          locality: item.display_name.split(',')[1]?.trim() || 'Central',
          city: item.display_name.split(',')[2]?.trim() || 'Tamil Nadu',
          coordinates: {
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
          },
          description: item.display_name
        }));
      }
    }
  } catch (err) {
    // Network timeout or offline - fallback to default Theni hub
  }

  // Fallback to default Theni College area if no matches
  return [BENCHMARK_LOCATIONS[0]];
}

// Curated benchmark properties showcasing genuine addresses, rich specs, and nearby facilities
export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-theni-101',
    title: 'Emerald Palms Luxury 2 BHK Residency',
    tagline: 'Minutes from Nadar Saraswathi College with 24/7 Power Backup',
    propertyType: 'Apartment',
    rentMonthly: 12500,
    securityDeposit: 60000,
    bedrooms: 2,
    bathrooms: 2,
    areaSqFt: 1150,
    furnishing: 'Furnished',
    availability: 'Available Now',
    availableDate: 'Immediate',
    status: 'Available',
    address: 'Plot 14, Saraswathi Enclave, Vadapudupatti Road',
    locality: 'Near Nadar Saraswathi College',
    city: 'Theni',
    pincode: '625531',
    coordinates: { lat: 10.0255, lng: 77.4935 },
    floor: '2nd of 4 Floors',
    facing: 'East',
    parking: 'Covered Car + Bike',
    amenities: ['Power Backup', 'Lift', '24/7 Security', 'RO Water', 'CCTV', 'Balcony', 'Covered Parking'],
    petFriendly: true,
    bachelorsAllowed: true,
    waterSupply: '24/7 Corporation & Borewell',
    powerBackup: '100% Full Backup',
    coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000'
    ],
    description: 'Sunlit premium 2BHK flat situated just 400m from Nadar Saraswathi College campus. Features modular kitchen, imported vitrified tiling, teakwood doors, and dedicated covered car parking. Quiet academic atmosphere perfect for lecturers, students, and families.',
    landlordId: 'landlord-theni-01',
    landlordName: 'Senthil Murugan (Vadapudupatti Properties)',
    landlordPhone: '+91 94432 18765',
    landlordRating: 4.9,
    verifiedListing: true,
    nearbyFacilities: [
      { id: 'f-1', name: 'Nadar Saraswathi College of Arts & Science', category: 'colleges', distanceKm: 0.35, travelTimeMin: 4 },
      { id: 'f-2', name: 'Theni Govt Medical College & Hospital', category: 'hospitals', distanceKm: 2.8, travelTimeMin: 8 },
      { id: 'f-3', name: 'Reliance Smart Point Vadapudupatti', category: 'supermarkets', distanceKm: 0.6, travelTimeMin: 7 },
      { id: 'f-4', name: 'Theni New Bus Stand', category: 'transit', distanceKm: 2.1, travelTimeMin: 6 },
      { id: 'f-5', name: 'Canara Bank & ATM', category: 'banks', distanceKm: 0.4, travelTimeMin: 5 },
      { id: 'f-6', name: 'MedPlus Pharmacy', category: 'pharmacies', distanceKm: 0.5, travelTimeMin: 6 }
    ]
  },
  {
    id: 'prop-theni-102',
    title: 'Green Meadows 3 BHK Independent Villa',
    tagline: 'Private Garden, Gated Community, 100% Vasthu Compliant',
    propertyType: 'Villa',
    rentMonthly: 21000,
    securityDeposit: 100000,
    bedrooms: 3,
    bathrooms: 3,
    areaSqFt: 2200,
    furnishing: 'Semi-Furnished',
    availability: 'Available Now',
    availableDate: 'Immediate',
    status: 'Available',
    address: 'Villa 7, Green Meadows Boulevard, Allinagaram',
    locality: 'Allinagaram',
    city: 'Theni',
    pincode: '625531',
    coordinates: { lat: 10.0162, lng: 77.4725 },
    floor: 'Ground + 1 Floor',
    facing: 'North-East',
    parking: 'Covered Car + Bike',
    amenities: ['Power Backup', '24/7 Security', 'Private Garden', 'Solar Water Heater', 'CCTV', 'Kids Play Area'],
    petFriendly: true,
    bachelorsAllowed: false,
    waterSupply: '24/7 Corporation & Borewell',
    powerBackup: 'Inverter Backup',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1000'
    ],
    description: 'Sprawling duplex independent villa in serene Allinagaram enclave. Features landscaped garden, teakwood wardrobes, master bedroom with private terrace, and 24/7 guarded security.',
    landlordId: 'landlord-theni-02',
    landlordName: 'K. Rajagopal (Theni Estate Trust)',
    landlordPhone: '+91 98421 54321',
    landlordRating: 4.8,
    verifiedListing: true,
    nearbyFacilities: [
      { id: 'f-10', name: 'Nadar Saraswathi College of Arts & Science', category: 'colleges', distanceKm: 2.3, travelTimeMin: 7 },
      { id: 'f-11', name: 'Allinagaram Matriculation Higher Secondary School', category: 'schools', distanceKm: 0.7, travelTimeMin: 8 },
      { id: 'f-12', name: 'Theni City Hospital', category: 'hospitals', distanceKm: 1.2, travelTimeMin: 5 },
      { id: 'f-13', name: 'Theni New Bus Stand', category: 'transit', distanceKm: 0.9, travelTimeMin: 3 },
      { id: 'f-14', name: 'State Bank of India Allinagaram Branch', category: 'banks', distanceKm: 0.6, travelTimeMin: 7 }
    ]
  },
  {
    id: 'prop-theni-103',
    title: 'Heritage Heights Studio Apartment',
    tagline: 'Modern Compact Studio with High-Speed Wi-Fi for Professionals',
    propertyType: 'Studio',
    rentMonthly: 6500,
    securityDeposit: 25000,
    bedrooms: 1,
    bathrooms: 1,
    areaSqFt: 450,
    furnishing: 'Furnished',
    availability: 'Available Now',
    availableDate: 'Immediate',
    status: 'Available',
    address: 'Flat 304, Heritage Heights, Forest Road',
    locality: 'Theni Town',
    city: 'Theni',
    pincode: '625531',
    coordinates: { lat: 10.0118, lng: 77.4820 },
    floor: '3rd of 5 Floors',
    facing: 'North',
    parking: 'Bike Only',
    amenities: ['High-Speed WiFi', 'Power Backup', 'Lift', 'CCTV', 'RO Water'],
    petFriendly: false,
    bachelorsAllowed: true,
    waterSupply: 'Corporation Water',
    powerBackup: '100% Full Backup',
    coverImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1000'
    ],
    description: 'Fully furnished studio apartment on Forest Road with work desk, ergonomic chair, split AC, smart TV, and refrigerator. Ideal for single professionals, doctors, and students.',
    landlordId: 'landlord-theni-03',
    landlordName: 'P. Muthuraman',
    landlordPhone: '+91 97890 12345',
    landlordRating: 4.7,
    verifiedListing: true,
    nearbyFacilities: [
      { id: 'f-20', name: 'Nadar Saraswathi College of Arts & Science', category: 'colleges', distanceKm: 1.8, travelTimeMin: 6 },
      { id: 'f-21', name: 'Theni Old Bus Stand', category: 'transit', distanceKm: 0.8, travelTimeMin: 4 },
      { id: 'f-22', name: 'Forest Road Commercial Complex', category: 'supermarkets', distanceKm: 0.2, travelTimeMin: 2 },
      { id: 'f-23', name: 'Aryas Vegetarian Restaurant', category: 'restaurants', distanceKm: 0.3, travelTimeMin: 3 }
    ]
  },
  {
    id: 'prop-theni-104',
    title: 'Saraswathi Executive Girls PG & Hostel Suite',
    tagline: 'Homely Mess Food, High Security, CCTV & Wi-Fi',
    propertyType: 'PG / Hostel',
    rentMonthly: 4500,
    securityDeposit: 10000,
    bedrooms: 1,
    bathrooms: 1,
    areaSqFt: 300,
    furnishing: 'Furnished',
    availability: 'Available Now',
    availableDate: 'Immediate',
    status: 'Available',
    address: 'Near College Arch Gate, Vadapudupatti',
    locality: 'Near Nadar Saraswathi College',
    city: 'Theni',
    pincode: '625531',
    coordinates: { lat: 10.0235, lng: 77.4908 },
    floor: '1st of 3 Floors',
    facing: 'East',
    parking: 'Bike Only',
    amenities: ['High-Speed WiFi', 'Power Backup', '24/7 Security', 'RO Water', 'CCTV'],
    petFriendly: false,
    bachelorsAllowed: true,
    waterSupply: '24/7 Corporation & Borewell',
    powerBackup: '100% Full Backup',
    coverImage: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=1000'
    ],
    description: 'Safe, gated, warden-monitored accommodation located directly opposite Nadar Saraswathi College. Monthly rent includes 3 wholesome home-cooked South Indian meals, Wi-Fi, study table, and washing machine access.',
    landlordId: 'landlord-theni-01',
    landlordName: 'Senthil Murugan (Vadapudupatti Properties)',
    landlordPhone: '+91 94432 18765',
    landlordRating: 4.9,
    verifiedListing: true,
    nearbyFacilities: [
      { id: 'f-30', name: 'Nadar Saraswathi College Main Gate', category: 'colleges', distanceKm: 0.1, travelTimeMin: 1 },
      { id: 'f-31', name: 'Vadapudupatti Bus Stop', category: 'transit', distanceKm: 0.15, travelTimeMin: 2 },
      { id: 'f-32', name: 'Nadar Saraswathi Engineering College', category: 'colleges', distanceKm: 0.4, travelTimeMin: 5 }
    ]
  },
  {
    id: 'prop-theni-105',
    title: 'Vaigai Horizon 3 BHK Penthouse',
    tagline: 'Panoramic Western Ghats View, Rooftop Gazebo & Gym',
    propertyType: 'Apartment',
    rentMonthly: 26000,
    securityDeposit: 120000,
    bedrooms: 3,
    bathrooms: 3,
    areaSqFt: 1850,
    furnishing: 'Furnished',
    availability: 'Within 15 Days',
    availableDate: '15th of next month',
    status: 'Occupied',
    address: 'Penthouse 801, Vaigai Horizon Towers, Madurai Main Road',
    locality: 'Madurai Main Road',
    city: 'Theni',
    pincode: '625531',
    coordinates: { lat: 10.0205, lng: 77.4995 },
    floor: '8th of 8 Floors (Penthouse)',
    facing: 'North',
    parking: 'Covered Car + Bike',
    amenities: ['Gym', 'Swimming Pool', 'Power Backup', 'Lift', '24/7 Security', 'Balcony', 'Covered Parking'],
    petFriendly: true,
    bachelorsAllowed: true,
    waterSupply: '24/7 Corporation & Borewell',
    powerBackup: '100% Full Backup',
    coverImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1000'
    ],
    description: 'Breathtaking penthouse overlooking the Western Ghats range. Features Italian marble flooring, central air conditioning, private barbecue terrace, and access to the society clubhouse and infinity pool.',
    landlordId: 'landlord-theni-04',
    landlordName: 'V. Anand Kumar',
    landlordPhone: '+91 99440 98765',
    landlordRating: 4.9,
    verifiedListing: true,
    tenant: {
      name: 'Dr. Vigneshwaran MD',
      phone: '+91 98401 22334',
      email: 'vignesh.doc@thenihospital.org',
      leaseStart: '2025-10-01',
      leaseEnd: '2026-09-30',
      monthlyRent: 26000,
      depositHeld: 120000,
      paymentStatus: 'Paid'
    },
    nearbyFacilities: [
      { id: 'f-40', name: 'Nadar Saraswathi College of Arts & Science', category: 'colleges', distanceKm: 1.1, travelTimeMin: 4 },
      { id: 'f-41', name: 'Theni Govt Medical College & Hospital', category: 'hospitals', distanceKm: 2.2, travelTimeMin: 6 },
      { id: 'f-42', name: 'Theni New Bus Stand', category: 'transit', distanceKm: 2.4, travelTimeMin: 7 }
    ]
  },
  {
    id: 'prop-theni-106',
    title: 'Surabi Prime Commercial Showroom & Office Space',
    tagline: 'Prime Road Frontage on Cumbum Bypass with Heavy Footfall',
    propertyType: 'Commercial Space',
    rentMonthly: 38000,
    securityDeposit: 200000,
    bedrooms: 0,
    bathrooms: 2,
    areaSqFt: 2400,
    furnishing: 'Unfurnished',
    availability: 'Available Now',
    availableDate: 'Immediate',
    status: 'Available',
    address: 'Ground Floor, Surabi Arcade, Palani Chettipatti',
    locality: 'Cumbum Road Bypass',
    city: 'Theni',
    pincode: '625531',
    coordinates: { lat: 9.9965, lng: 77.4610 },
    floor: 'Ground Floor',
    facing: 'East',
    parking: 'Covered Car + Bike',
    amenities: ['Power Backup', '24/7 Security', 'CCTV', 'Covered Parking'],
    petFriendly: false,
    bachelorsAllowed: true,
    waterSupply: 'Corporation Water',
    powerBackup: '100% Full Backup',
    coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1000'
    ],
    description: 'High-visibility ground floor retail and corporate office space on Cumbum Main Road. Fitted with toughened glass facade, 3-phase heavy industrial power line, and dedicated parking for 6 cars.',
    landlordId: 'landlord-theni-02',
    landlordName: 'K. Rajagopal (Theni Estate Trust)',
    landlordPhone: '+91 98421 54321',
    landlordRating: 4.8,
    verifiedListing: true,
    nearbyFacilities: [
      { id: 'f-50', name: 'Palani Chettipatti Junction', category: 'transit', distanceKm: 0.3, travelTimeMin: 3 },
      { id: 'f-51', name: 'Indian Overseas Bank', category: 'banks', distanceKm: 0.2, travelTimeMin: 2 },
      { id: 'f-52', name: 'Theni New Bus Stand', category: 'transit', distanceKm: 1.8, travelTimeMin: 5 }
    ]
  },
  {
    id: 'prop-theni-107',
    title: 'Comfort Nest 2 BHK Family Home',
    tagline: 'Renovation Completed, Walking Distance to Daily Bazaar',
    propertyType: 'Independent House',
    rentMonthly: 9500,
    securityDeposit: 45000,
    bedrooms: 2,
    bathrooms: 2,
    areaSqFt: 1000,
    furnishing: 'Semi-Furnished',
    availability: 'Next Month',
    availableDate: '1st of next month',
    status: 'Under Maintenance',
    address: '18/4, Allinagaram Main Street',
    locality: 'Allinagaram',
    city: 'Theni',
    pincode: '625531',
    coordinates: { lat: 10.0138, lng: 77.4740 },
    floor: 'Ground Floor',
    facing: 'South',
    parking: 'Bike Only',
    amenities: ['Power Backup', 'RO Water'],
    petFriendly: false,
    bachelorsAllowed: false,
    waterSupply: '24/7 Corporation & Borewell',
    powerBackup: 'Inverter Backup',
    coverImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=1000'
    ],
    description: 'Ground floor independent house undergoing bathroom waterproofing and fresh premium emulsion painting. Very close to local markets, schools, and bus stops.',
    landlordId: 'landlord-theni-03',
    landlordName: 'P. Muthuraman',
    landlordPhone: '+91 97890 12345',
    landlordRating: 4.7,
    verifiedListing: true,
    maintenance: {
      id: 'maint-101',
      issue: 'Complete Interior Painting & Plumbing Upgrade',
      priority: 'Medium',
      status: 'In Progress',
      scheduledDate: '2026-09-18',
      contractorName: 'Sri Balaji Painters & Fittings'
    },
    nearbyFacilities: [
      { id: 'f-60', name: 'Theni New Bus Stand', category: 'transit', distanceKm: 0.7, travelTimeMin: 2 },
      { id: 'f-61', name: 'Nadar Saraswathi College', category: 'colleges', distanceKm: 2.1, travelTimeMin: 7 }
    ]
  },
  {
    id: 'prop-theni-108',
    title: 'Orchid Heights 1 BHK Furnished Flat',
    tagline: 'Near Theni Collectorate & Court Complex',
    propertyType: 'Apartment',
    rentMonthly: 7800,
    securityDeposit: 35000,
    bedrooms: 1,
    bathrooms: 1,
    areaSqFt: 620,
    furnishing: 'Furnished',
    availability: 'Available Now',
    availableDate: 'Immediate',
    status: 'Available',
    address: 'Flat 202, Orchid Heights, Unjampatti',
    locality: 'Madurai Main Road',
    city: 'Theni',
    pincode: '625531',
    coordinates: { lat: 10.0195, lng: 77.4960 },
    floor: '2nd of 4 Floors',
    facing: 'East',
    parking: 'Covered Car',
    amenities: ['Power Backup', 'Lift', 'High-Speed WiFi', 'CCTV'],
    petFriendly: true,
    bachelorsAllowed: true,
    waterSupply: '24/7 Corporation & Borewell',
    powerBackup: '100% Full Backup',
    coverImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1000'
    ],
    description: 'Clean, well-lit 1BHK apartment in Unjampatti on Madurai Main Road. Complete with wardrobe, double bed with mattress, refrigerator, and RO water purification.',
    landlordId: 'landlord-theni-01',
    landlordName: 'Senthil Murugan (Vadapudupatti Properties)',
    landlordPhone: '+91 94432 18765',
    landlordRating: 4.9,
    verifiedListing: true,
    nearbyFacilities: [
      { id: 'f-70', name: 'Nadar Saraswathi College of Arts & Science', category: 'colleges', distanceKm: 0.9, travelTimeMin: 3 },
      { id: 'f-71', name: 'District Collectorate Office', category: 'transit', distanceKm: 1.2, travelTimeMin: 4 }
    ]
  },
  {
    id: 'prop-madurai-201',
    title: 'Meenakshi Royal 3 BHK Gated Villa',
    tagline: 'Near Mattuthavani Bus Terminus & Apollo Hospital',
    propertyType: 'Villa',
    rentMonthly: 28000,
    securityDeposit: 150000,
    bedrooms: 3,
    bathrooms: 3,
    areaSqFt: 2400,
    furnishing: 'Furnished',
    availability: 'Available Now',
    availableDate: 'Immediate',
    status: 'Available',
    address: 'Villa 12, Royal Palms, KK Nagar',
    locality: 'Mattuthavani',
    city: 'Madurai',
    pincode: '625007',
    coordinates: { lat: 9.9340, lng: 78.1585 },
    floor: 'Ground + 1',
    facing: 'North',
    parking: 'Covered Car + Bike',
    amenities: ['Gym', 'Swimming Pool', 'Power Backup', '24/7 Security', 'Private Garden', 'Lift'],
    petFriendly: true,
    bachelorsAllowed: false,
    waterSupply: '24/7 Corporation & Borewell',
    powerBackup: '100% Full Backup',
    coverImage: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1000',
    gallery: ['https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1000'],
    description: 'High-end gated villa in Madurai with Italian marble flooring, 3 luxury bedrooms with en-suite baths, modular kitchen, and private lawn.',
    landlordId: 'landlord-madurai-01',
    landlordName: 'Dr. AL. Sundaram',
    landlordPhone: '+91 94430 55667',
    landlordRating: 4.9,
    verifiedListing: true,
    nearbyFacilities: [
      { id: 'f-80', name: 'Mattuthavani Bus Terminus', category: 'transit', distanceKm: 0.8, travelTimeMin: 3 },
      { id: 'f-81', name: 'Apollo Speciality Hospitals Madurai', category: 'hospitals', distanceKm: 1.4, travelTimeMin: 5 }
    ]
  },
  {
    id: 'prop-chennai-301',
    title: 'Skyline Azure 2 BHK High-Rise Flat',
    tagline: 'Heart of Anna Nagar with Metro Connectivity',
    propertyType: 'Apartment',
    rentMonthly: 35000,
    securityDeposit: 180000,
    bedrooms: 2,
    bathrooms: 2,
    areaSqFt: 1280,
    furnishing: 'Furnished',
    availability: 'Available Now',
    availableDate: 'Immediate',
    status: 'Available',
    address: '11th Floor, Skyline Azure, 2nd Avenue, Anna Nagar East',
    locality: 'Anna Nagar',
    city: 'Chennai',
    pincode: '600102',
    coordinates: { lat: 13.0862, lng: 80.2120 },
    floor: '11th of 18 Floors',
    facing: 'East',
    parking: 'Covered Car + Bike',
    amenities: ['Gym', 'Swimming Pool', 'Power Backup', 'Lift', '24/7 Security', 'High-Speed WiFi'],
    petFriendly: true,
    bachelorsAllowed: true,
    waterSupply: '24/7 Corporation & Borewell',
    powerBackup: '100% Full Backup',
    coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000',
    gallery: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000'],
    description: 'Executive apartment in Anna Nagar overlooking the Tower Park. 200m from metro station. Fully loaded with smart appliances.',
    landlordId: 'landlord-chennai-01',
    landlordName: 'Kavitha Ramachandran',
    landlordPhone: '+91 98409 87654',
    landlordRating: 4.95,
    verifiedListing: true,
    nearbyFacilities: [
      { id: 'f-90', name: 'Anna Nagar Tower Metro Station', category: 'transit', distanceKm: 0.3, travelTimeMin: 3 },
      { id: 'f-91', name: 'Anna Adarsh College for Women', category: 'colleges', distanceKm: 0.9, travelTimeMin: 4 }
    ]
  }
];

/**
 * Computes an explainable match score (0-100%) and generates structured positive
 * and negative rationale based on user filter criteria.
 */
export function calculateExplainableMatchScore(
  property: Property,
  filters: PropertyFilterState,
  referenceCoords?: GeoCoordinates
): { score: number; reasons: string[]; unmatched: string[] } {
  let score = 70; // baseline foundation
  const reasons: string[] = [];
  const unmatched: string[] = [];

  // 1. Budget Evaluation (+/- 15 pts)
  if (filters.maxRent && property.rentMonthly <= filters.maxRent) {
    score += 15;
    reasons.push(`Well within your budget of ₹${filters.maxRent.toLocaleString('en-IN')}/mo`);
  } else if (filters.maxRent && property.rentMonthly > filters.maxRent) {
    const diff = property.rentMonthly - filters.maxRent;
    score -= 15;
    unmatched.push(`₹${diff.toLocaleString('en-IN')}/mo above stated budget limit`);
  }

  // 2. Proximity Evaluation (+/- 20 pts)
  if (referenceCoords) {
    const dist = calculateDistanceKm(referenceCoords, property.coordinates);
    if (dist <= 1.0) {
      score += 20;
      reasons.push(`Super close: only ${dist} km away (walkable in <10 mins)`);
    } else if (dist <= (filters.radiusKm || 5)) {
      score += 10;
      reasons.push(`Within convenient ${dist} km commute distance`);
    } else {
      score -= 10;
      unmatched.push(`${dist} km from searched anchor point`);
    }
  }

  // 3. Bedroom / BHK Match (+/- 10 pts)
  if (filters.bedrooms && filters.bedrooms.length > 0) {
    if (filters.bedrooms.includes(property.bedrooms)) {
      score += 10;
      reasons.push(`Exact ${property.bedrooms} BHK match`);
    } else {
      score -= 8;
      unmatched.push(`Looking for ${filters.bedrooms.join('/')} BHK; this is ${property.bedrooms} BHK`);
    }
  }

  // 4. Furnishing Match (+/- 10 pts)
  if (filters.furnishing && filters.furnishing.length > 0) {
    if (filters.furnishing.includes(property.furnishing)) {
      score += 10;
      reasons.push(`Matches ${property.furnishing} preference`);
    } else {
      score -= 5;
      unmatched.push(`Furnished as ${property.furnishing}`);
    }
  }

  // 5. Amenities Match (+/- 15 pts)
  if (filters.amenities && filters.amenities.length > 0) {
    const matchedCount = filters.amenities.filter(a => property.amenities.includes(a)).length;
    const ratio = matchedCount / filters.amenities.length;
    if (ratio >= 0.75) {
      score += 15;
      reasons.push(`Includes ${matchedCount} of ${filters.amenities.length} requested amenities`);
    } else if (ratio >= 0.5) {
      score += 8;
      reasons.push(`Has key amenities including ${property.amenities.slice(0, 2).join(', ')}`);
    } else {
      unmatched.push(`Missing some requested amenities`);
    }
  }

  // 6. Verification and Rating Bonus
  if (property.verifiedListing) {
    score += 5;
    reasons.push('Verified ROVIA verified landlord listing');
  }

  // Cap between 25 and 99
  const finalScore = Math.max(25, Math.min(99, Math.round(score)));

  return {
    score: finalScore,
    reasons: reasons.slice(0, 3),
    unmatched: unmatched.slice(0, 2)
  };
}

/**
 * Filters and ranks properties based on location radius, filters, and dynamic match scores
 */
export function filterAndScoreProperties(
  properties: Property[],
  filters: PropertyFilterState,
  referenceCoords?: GeoCoordinates
): Property[] {
  return properties
    .map(p => {
      const distance = referenceCoords 
        ? calculateDistanceKm(referenceCoords, p.coordinates) 
        : undefined;
      
      const { score, reasons, unmatched } = calculateExplainableMatchScore(p, filters, referenceCoords);

      return {
        ...p,
        calculatedDistanceKm: distance,
        matchScore: score,
        matchReasons: reasons,
        unmatchedReasons: unmatched
      };
    })
    .filter(p => {
      // Radius limit
      if (filters.radiusKm > 0 && p.calculatedDistanceKm !== undefined) {
        if (p.calculatedDistanceKm > filters.radiusKm) return false;
      }

      // Property type
      if (filters.propertyTypes.length > 0 && !filters.propertyTypes.includes(p.propertyType)) {
        return false;
      }

      // Min rent
      if (filters.minRent > 0 && p.rentMonthly < filters.minRent) {
        return false;
      }

      // Max rent
      if (filters.maxRent > 0 && p.rentMonthly > filters.maxRent) {
        return false;
      }

      // Bedrooms
      if (filters.bedrooms.length > 0 && !filters.bedrooms.includes(p.bedrooms)) {
        return false;
      }

      // Furnishing
      if (filters.furnishing.length > 0 && !filters.furnishing.includes(p.furnishing)) {
        return false;
      }

      // Availability
      if (filters.availability.length > 0 && !filters.availability.includes(p.availability)) {
        return false;
      }

      // Verified only
      if (filters.verifiedOnly && !p.verifiedListing) {
        return false;
      }

      // Amenities (all requested amenities must be present)
      if (filters.amenities.length > 0) {
        const hasAll = filters.amenities.every(a => p.amenities.includes(a));
        if (!hasAll) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'distance') {
        return (a.calculatedDistanceKm ?? 999) - (b.calculatedDistanceKm ?? 999);
      }
      if (filters.sortBy === 'price_low_high') {
        return a.rentMonthly - b.rentMonthly;
      }
      if (filters.sortBy === 'price_high_low') {
        return b.rentMonthly - a.rentMonthly;
      }
      if (filters.sortBy === 'match_score') {
        return (b.matchScore ?? 0) - (a.matchScore ?? 0);
      }
      // Default: recommended (match score combined with proximity)
      return (b.matchScore ?? 0) - (a.matchScore ?? 0);
    });
}

/**
 * Computes Area / Locality Geographic Analytics for Admin
 */
export function calculateLocalityAnalytics(properties: Property[]): LocalityAreaAnalytics[] {
  const map: Record<string, Property[]> = {};

  properties.forEach(p => {
    const key = `${p.locality}, ${p.city}`;
    if (!map[key]) map[key] = [];
    map[key].push(p);
  });

  return Object.entries(map).map(([key, list]) => {
    const locality = list[0].locality;
    const city = list[0].city;
    const totalProperties = list.length;
    const availableCount = list.filter(p => p.status === 'Available').length;
    const occupiedCount = list.filter(p => p.status === 'Occupied').length;
    const maintenanceCount = list.filter(p => p.status === 'Under Maintenance').length;
    
    const avgRent = Math.round(list.reduce((s, p) => s + p.rentMonthly, 0) / totalProperties);
    const avgPricePerSqFt = Math.round(
      list.reduce((s, p) => s + (p.rentMonthly / (p.areaSqFt || 1000)), 0) / totalProperties
    );
    const occupancyRate = Math.round((occupiedCount / totalProperties) * 100);

    return {
      locality,
      city,
      totalProperties,
      availableCount,
      occupiedCount,
      maintenanceCount,
      avgRent,
      avgPricePerSqFt,
      occupancyRate,
      coordinates: list[0].coordinates,
      topDemandBHK: `${list[0].bedrooms} BHK`
    };
  });
}
