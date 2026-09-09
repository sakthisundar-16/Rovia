import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Property, GeoCoordinates, PropertyStatus } from '../../types/propertyTypes';
import { MapPin, Navigation, Eye } from 'lucide-react';

interface MapViewProps {
  properties: Property[];
  selectedProperty: Property | null;
  onSelectProperty: (property: Property) => void;
  onViewDetails?: (property: Property) => void;
  centerCoords?: GeoCoordinates;
  radiusKm?: number;
  userCoords?: GeoCoordinates | null;
  className?: string;
  zoomLevel?: number;
}

export const MapView: React.FC<MapViewProps> = ({
  properties,
  selectedProperty,
  onSelectProperty,
  onViewDetails,
  centerCoords = { lat: 10.0242, lng: 77.4916 }, // Default Theni
  radiusKm = 0,
  userCoords = null,
  className = 'h-full w-full min-h-[360px]',
  zoomLevel = 13
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerCoords.lat, centerCoords.lng],
        zoom: zoomLevel,
        zoomControl: false,
        attributionControl: false
      });

      // Standard OpenStreetMap tiles (100% Free, Global Coverage, ZERO API KEY required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      }).addTo(map);

      // Add Zoom control at bottom right for easy thumb access on mobile
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Add clean small attribution at bottom left
      L.control.attribution({ position: 'bottomleft', prefix: '© OpenStreetMap | ROVIA' }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      // Clean up map on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Center Coords
  useEffect(() => {
    if (!mapInstanceRef.current || !centerCoords) return;
    mapInstanceRef.current.setView([centerCoords.lat, centerCoords.lng], mapInstanceRef.current.getZoom());
  }, [centerCoords.lat, centerCoords.lng]);

  // Update Radius Circle
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
      radiusCircleRef.current = null;
    }

    if (radiusKm > 0 && centerCoords) {
      const circle = L.circle([centerCoords.lat, centerCoords.lng], {
        radius: radiusKm * 1000,
        color: '#5C4E4E',
        weight: 1.5,
        opacity: 0.8,
        dashArray: '4, 6',
        fillColor: '#988686',
        fillOpacity: 0.12
      }).addTo(mapInstanceRef.current);

      radiusCircleRef.current = circle;
    }
  }, [radiusKm, centerCoords.lat, centerCoords.lng]);

  // Update User Location Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userCoords) {
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-blue-500 opacity-60"></span>
            <span class="relative inline-flex h-4 w-4 rounded-full bg-blue-600 border-2 border-white shadow-md"></span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([userCoords.lat, userCoords.lng], {
        icon: userIcon,
        zIndexOffset: 1000
      }).addTo(mapInstanceRef.current);

      marker.bindTooltip('Your Current Location', { direction: 'top', offset: [0, -10] });
      userMarkerRef.current = marker;
    }
  }, [userCoords]);

  // Render Property Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const bounds = L.latLngBounds([]);

    properties.forEach((property) => {
      const isSelected = selectedProperty?.id === property.id;
      const formattedRent = property.rentMonthly >= 1000 
        ? `₹${(property.rentMonthly / 1000).toFixed(property.rentMonthly % 1000 === 0 ? 0 : 1)}k`
        : `₹${property.rentMonthly}`;

      // Color coding based on status
      let badgeBg = 'bg-[#1C1818] text-white';
      let borderStyle = 'border-white/80';
      if (property.status === 'Occupied') {
        badgeBg = 'bg-emerald-700 text-white';
        borderStyle = 'border-emerald-300';
      } else if (property.status === 'Under Maintenance') {
        badgeBg = 'bg-amber-600 text-white';
        borderStyle = 'border-amber-200';
      }

      if (isSelected) {
        badgeBg = 'bg-black text-amber-300 font-bold scale-110 ring-4 ring-black/40';
      }

      const markerHtml = `
        <div class="group relative cursor-pointer transform transition-all duration-200 hover:scale-110">
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-lg ${badgeBg} ${borderStyle} border text-xs font-semibold whitespace-nowrap">
            <span>${formattedRent}</span>
            <span class="text-[9px] uppercase tracking-wider opacity-80">${property.bedrooms > 0 ? `${property.bedrooms}BHK` : property.propertyType.slice(0, 4)}</span>
          </div>
          <div class="w-2 h-2 bg-black mx-auto rotate-45 -mt-1 shadow-sm"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-property-marker',
        html: markerHtml,
        iconSize: [80, 36],
        iconAnchor: [40, 32],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([property.coordinates.lat, property.coordinates.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 800 : 100
      });

      // Interactive Popup Content
      const popupHtml = document.createElement('div');
      popupHtml.className = 'p-1 max-w-[240px] text-zinc-900 font-sans';
      popupHtml.innerHTML = `
        <div class="rounded-lg overflow-hidden mb-2 relative">
          <img src="${property.coverImage}" alt="${property.title}" class="w-full h-24 object-cover rounded" />
          <span class="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/80 text-white">
            ${property.propertyType}
          </span>
          ${property.calculatedDistanceKm !== undefined ? `
            <span class="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/95 text-zinc-900 shadow">
              📍 ${property.calculatedDistanceKm} km
            </span>
          ` : ''}
        </div>
        <h4 class="font-bold text-xs text-zinc-900 leading-snug line-clamp-1 mb-1">${property.title}</h4>
        <div class="flex items-baseline gap-2 mb-2">
          <span class="font-black text-sm text-zinc-950">₹${property.rentMonthly.toLocaleString('en-IN')}</span>
          <span class="text-[10px] text-zinc-500">/ month</span>
        </div>
        <div class="flex items-center gap-1.5 text-[10px] text-zinc-600 mb-2.5">
          <span>${property.bedrooms > 0 ? `${property.bedrooms} BHK` : 'Studio'}</span>
          <span>•</span>
          <span>${property.furnishing}</span>
          <span>•</span>
          <span>${property.areaSqFt} sqft</span>
        </div>
        <div class="grid grid-cols-2 gap-1.5 pt-1 border-t border-zinc-200">
          <button id="btn-directions-${property.id}" class="w-full py-1 px-2 rounded bg-zinc-100 hover:bg-zinc-200 text-[11px] font-semibold text-zinc-800 flex items-center justify-center gap-1 transition">
            Directions
          </button>
          <button id="btn-details-${property.id}" class="w-full py-1 px-2 rounded bg-zinc-900 hover:bg-black text-[11px] font-semibold text-white flex items-center justify-center gap-1 transition">
            Details
          </button>
        </div>
      `;

      // Attach event listeners after popup opens
      marker.bindPopup(popupHtml, {
        closeButton: false,
        offset: [0, -28],
        className: 'rovia-property-popup'
      });

      marker.on('popupopen', () => {
        const btnDirections = document.getElementById(`btn-directions-${property.id}`);
        const btnDetails = document.getElementById(`btn-details-${property.id}`);

        if (btnDirections) {
          btnDirections.onclick = () => {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${property.coordinates.lat},${property.coordinates.lng}`;
            window.open(url, '_blank');
          };
        }

        if (btnDetails && onViewDetails) {
          btnDetails.onclick = () => {
            onViewDetails(property);
          };
        }
      });

      marker.on('click', () => {
        onSelectProperty(property);
      });

      markersLayerRef.current?.addLayer(marker);
      bounds.extend([property.coordinates.lat, property.coordinates.lng]);

      // If this is currently selected, open popup
      if (isSelected) {
        marker.openPopup();
      }
    });

    // If properties are loaded and none is explicitly selected, fit view smoothly
    if (properties.length > 0 && !selectedProperty && mapInstanceRef.current) {
      if (radiusKm === 0) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    }
  }, [properties, selectedProperty, radiusKm]);

  // Center on selected property when selected from list
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedProperty) return;
    mapInstanceRef.current.panTo([selectedProperty.coordinates.lat, selectedProperty.coordinates.lng], {
      animate: true,
      duration: 0.8
    });
  }, [selectedProperty]);

  return (
    <div className={`relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-warm-md ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full min-h-[320px] z-0" />
      
      {/* Visual Quick Status Legend */}
      <div className="absolute top-3 left-3 z-[400] hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-sm border border-zinc-200 dark:border-zinc-800 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-900"></span> Available
        </span>
        <span className="text-zinc-300 dark:text-zinc-700">|</span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Occupied
        </span>
        <span className="text-zinc-300 dark:text-zinc-700">|</span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Maintenance
        </span>
      </div>
    </div>
  );
};
