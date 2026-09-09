import React, { useState, useMemo } from 'react';
import { 
  Globe2, 
  MapPin, 
  TrendingUp, 
  Building2, 
  DollarSign, 
  Users, 
  BarChart2, 
  Layers, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import { INITIAL_PROPERTIES, calculateLocalityAnalytics } from '../../services/propertyGeoService';
import { MapView } from '../../components/map/MapView';
import { Property, LocalityAreaAnalytics } from '../../types/propertyTypes';

export const AdminGeoAnalytics: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedLocality, setSelectedLocality] = useState<string | null>(null);

  const properties = INITIAL_PROPERTIES;
  const analyticsList = useMemo(() => calculateLocalityAnalytics(properties), [properties]);

  // Overall platform statistics
  const totalProperties = properties.length;
  const totalOccupied = properties.filter(p => p.status === 'Occupied').length;
  const avgSystemRent = Math.round(properties.reduce((s, p) => s + p.rentMonthly, 0) / totalProperties);
  const systemOccupancyRate = Math.round((totalOccupied / totalProperties) * 100);

  const displayedProperties = useMemo(() => {
    if (!selectedLocality) return properties;
    return properties.filter(p => `${p.locality}, ${p.city}` === selectedLocality);
  }, [properties, selectedLocality]);

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black shadow-xs">
              Platform Governance
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              Geographic Intelligence &amp; Demand Index
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white tracking-tight">
            Geographic Oversight &amp; Area Analytics
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
            Macro analysis of rental density, average yields, and inventory vacancy across all managed regional clusters.
          </p>
        </div>

        {selectedLocality && (
          <button
            onClick={() => setSelectedLocality(null)}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition"
          >
            Clear Locality Filter
          </button>
        )}
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Listings</span>
            <Building2 className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-black text-zinc-950 dark:text-white mt-1">
            {totalProperties}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Across 5 regional hubs</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Overall Occupancy</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {systemOccupancyRate}%
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">{totalOccupied} leased out units</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Regional Avg Rent</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-zinc-950 dark:text-white mt-1">
            ₹{avgSystemRent.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Per active residential unit</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Hotspot Locality</span>
            <MapPin className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-sm font-black text-zinc-950 dark:text-white mt-1 truncate">
            Near Nadar Saraswathi College
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Highest rental inquiry velocity</div>
        </div>
      </div>

      {/* Regional Density Map */}
      <div className="rounded-2xl overflow-hidden shadow-warm-md border border-zinc-200 dark:border-zinc-800 h-[420px]">
        <MapView
          properties={displayedProperties}
          selectedProperty={selectedProperty}
          onSelectProperty={(p) => setSelectedProperty(p)}
          centerCoords={displayedProperties[0]?.coordinates || { lat: 10.0242, lng: 77.4916 }}
          className="w-full h-full"
        />
      </div>

      {/* Area Breakdown Table */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
        <div className="px-4 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-zinc-950 dark:text-white">
              Locality Performance &amp; Average Rent Analysis
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Comparative matrix of rental pricing, occupancy, and top demand configurations by locality.
            </p>
          </div>
          <span className="text-xs font-bold text-zinc-400">
            {analyticsList.length} Zones
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="py-3 px-4 sm:px-6">Locality &amp; City</th>
                <th className="py-3 px-3">Total Listings</th>
                <th className="py-3 px-3">Available / Leased</th>
                <th className="py-3 px-3">Average Rent</th>
                <th className="py-3 px-3">Rate / sq.ft</th>
                <th className="py-3 px-3">Occupancy</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {analyticsList.map((item) => {
                const isSelected = selectedLocality === `${item.locality}, ${item.city}`;

                return (
                  <tr
                    key={`${item.locality}-${item.city}`}
                    className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition cursor-pointer ${
                      isSelected ? 'bg-zinc-100/80 dark:bg-zinc-800/80' : ''
                    }`}
                    onClick={() => setSelectedLocality(`${item.locality}, ${item.city}`)}
                  >
                    <td className="py-3 px-4 sm:px-6">
                      <div className="font-bold text-zinc-950 dark:text-white">
                        {item.locality}
                      </div>
                      <div className="text-[11px] text-zinc-500">{item.city}</div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-zinc-800 dark:text-zinc-200">
                      {item.totalProperties} units
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-emerald-600 font-bold">{item.occupiedCount} occupied</span>
                        <span>•</span>
                        <span className="text-zinc-500">{item.availableCount} open</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-black text-zinc-900 dark:text-white">
                      ₹{item.avgRent.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-zinc-600 dark:text-zinc-400">
                      ₹{item.avgPricePerSqFt}/sqft
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${item.occupancyRate}%` }}
                          />
                        </div>
                        <span className="font-bold text-[11px] text-zinc-700 dark:text-zinc-300">
                          {item.occupancyRate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLocality(`${item.locality}, ${item.city}`);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-[11px] font-bold text-zinc-800 dark:text-zinc-200 transition"
                      >
                        {isSelected ? 'Focused' : 'Inspect Area'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
