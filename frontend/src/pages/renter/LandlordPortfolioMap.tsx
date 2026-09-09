import React, { useState, useMemo } from 'react';
import { 
  Building, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  TrendingUp, 
  Phone, 
  Calendar, 
  DollarSign, 
  User, 
  MapPin, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Property, PropertyStatus } from '../../types/propertyTypes';
import { INITIAL_PROPERTIES } from '../../services/propertyGeoService';
import { MapView } from '../../components/map/MapView';
import { PropertyDetailModal } from '../../components/map/PropertyDetailModal';

export const LandlordPortfolioMap: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<'All' | PropertyStatus>('All');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [detailModalProperty, setDetailModalProperty] = useState<Property | null>(null);

  // Landlord's managed portfolio units
  const portfolio = INITIAL_PROPERTIES;

  const filteredPortfolio = useMemo(() => {
    if (statusFilter === 'All') return portfolio;
    return portfolio.filter(p => p.status === statusFilter);
  }, [portfolio, statusFilter]);

  // Portfolio KPIs
  const totalUnits = portfolio.length;
  const occupiedUnits = portfolio.filter(p => p.status === 'Occupied').length;
  const availableUnits = portfolio.filter(p => p.status === 'Available').length;
  const maintenanceUnits = portfolio.filter(p => p.status === 'Under Maintenance').length;
  const occupancyRate = Math.round((occupiedUnits / totalUnits) * 100);
  const totalMonthlyYield = portfolio
    .filter(p => p.status === 'Occupied')
    .reduce((sum, p) => sum + p.rentMonthly, 0);

  return (
    <div className="w-full space-y-5 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-700 text-white shadow-xs">
              Property Manager Console
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              Live Geographic Portfolio
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white tracking-tight">
            Portfolio Discovery &amp; Status Map
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
            Geographic overview of all your managed rental real estate assets across Theni and Tamil Nadu.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 overflow-x-auto no-scrollbar shrink-0">
          {(['All', 'Available', 'Occupied', 'Under Maintenance'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Assets</span>
            <Building className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-black text-zinc-950 dark:text-white mt-1">
            {totalUnits} Units
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {availableUnits} active listings
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Occupancy</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {occupancyRate}%
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {occupiedUnits} occupied leases
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Monthly Inflow</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-zinc-950 dark:text-white mt-1">
            ₹{totalMonthlyYield.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            From active verified tenants
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Maintenance</span>
            <Wrench className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {maintenanceUnits} Units
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Work orders in progress
          </div>
        </div>
      </div>

      {/* Main Map & Portfolio Units Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Interactive Portfolio Map */}
        <div className="lg:col-span-8 rounded-2xl overflow-hidden shadow-warm-md border border-zinc-200 dark:border-zinc-800 h-[500px] lg:h-[620px]">
          <MapView
            properties={filteredPortfolio}
            selectedProperty={selectedProperty}
            onSelectProperty={(p) => setSelectedProperty(p)}
            onViewDetails={(p) => setDetailModalProperty(p)}
            centerCoords={{ lat: 10.0242, lng: 77.4916 }} // Theni
            className="w-full h-full"
          />
        </div>

        {/* Right Column: Units Drawer / List */}
        <div className="lg:col-span-4 space-y-3 max-h-[620px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Units in View ({filteredPortfolio.length})
            </span>
            <span className="text-[11px] text-zinc-500">Tap to highlight</span>
          </div>

          {filteredPortfolio.map((prop) => {
            const isSelected = selectedProperty?.id === prop.id;

            return (
              <div
                key={prop.id}
                onClick={() => setSelectedProperty(prop)}
                className={`p-3.5 rounded-2xl border bg-white dark:bg-zinc-900 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-zinc-950 dark:border-white ring-2 ring-zinc-950/15 shadow-warm-md'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      {prop.propertyType} • {prop.bedrooms > 0 ? `${prop.bedrooms} BHK` : 'Studio'}
                    </span>
                    <h4 className="font-bold text-xs text-zinc-950 dark:text-white line-clamp-1">
                      {prop.title}
                    </h4>
                  </div>

                  {/* Status Pill */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      prop.status === 'Occupied'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : prop.status === 'Under Maintenance'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    {prop.status}
                  </span>
                </div>

                <div className="flex items-baseline justify-between text-xs py-1.5 border-y border-zinc-100 dark:border-zinc-800 mb-2">
                  <span className="font-black text-sm text-zinc-950 dark:text-white">
                    ₹{prop.rentMonthly.toLocaleString('en-IN')}/mo
                  </span>
                  <span className="text-zinc-500 text-[11px]">
                    Deposit: ₹{prop.securityDeposit.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Tenant / Maintenance Details */}
                {prop.status === 'Occupied' && prop.tenant && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-emerald-900 dark:text-emerald-200">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {prop.tenant.name}
                      </span>
                      <span className="text-[10px] font-normal uppercase bg-emerald-200/60 dark:bg-emerald-900 px-1.5 py-0.2 rounded">
                        Rent {prop.tenant.paymentStatus}
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-800/80 dark:text-emerald-300 flex items-center justify-between">
                      <span>Lease expires: {prop.tenant.leaseEnd}</span>
                      <a href={`tel:${prop.tenant.phone}`} className="underline font-semibold flex items-center gap-0.5">
                        <Phone className="w-2.5 h-2.5" /> Call
                      </a>
                    </div>
                  </div>
                )}

                {prop.status === 'Under Maintenance' && prop.maintenance && (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900 text-xs space-y-1">
                    <div className="flex items-center gap-1 font-bold text-amber-900 dark:text-amber-200">
                      <Wrench className="w-3 h-3" />
                      <span>{prop.maintenance.issue}</span>
                    </div>
                    <div className="text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between">
                      <span>Vendor: {prop.maintenance.contractorName}</span>
                      <span>Target: {prop.maintenance.scheduledDate}</span>
                    </div>
                  </div>
                )}

                {prop.status === 'Available' && (
                  <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500">
                    <span>Available immediately</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailModalProperty(prop);
                      }}
                      className="font-bold text-zinc-900 dark:text-white underline hover:opacity-80"
                    >
                      View Listing
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Property Detail Modal */}
      {detailModalProperty && (
        <PropertyDetailModal
          property={detailModalProperty}
          onClose={() => setDetailModalProperty(null)}
        />
      )}
    </div>
  );
};
