import React, { useState } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  DollarSign,
  ShieldAlert,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  Percent,
  Scale,
  Phone,
  Calculator,
  Sliders,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataTable, Column } from '../../components/ui/DataTable';
import { INITIAL_ORDERS, MARKETPLACE_RENTERS, Order, RenterVendor } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';

interface DashboardProps {
  onNavigate: (tab: string, itemNumber?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { mode } = useAuth();
  const isAdmin = mode === 'admin';

  const [revenuePeriod, setRevenuePeriod] = useState<'today' | 'week' | 'month'>('month');

  // KPI Data - Role Responsive
  const kpis = isAdmin
    ? [
        {
          title: 'Total Gross Marketplace Revenue',
          value: '₹13,15,000',
          trend: '+24.8% vs last month',
          isPositive: true,
          icon: <DollarSign className="w-5 h-5 text-[#5E7A63]" />,
          sparkline: [320, 390, 420, 480, 520],
        },
        {
          title: 'Platform Commission Collected (10%)',
          value: '₹1,31,500',
          trend: '10% Platform Share',
          isPositive: true,
          icon: <Percent className="w-5 h-5 text-[#5E7286]" />,
          sparkline: [32, 39, 42, 48, 52],
        },
        {
          title: 'Active Renters (Sellers)',
          value: '4 Vendors',
          trend: '3 Approved / 1 Pending',
          isPositive: true,
          icon: <Building className="w-5 h-5 text-[#988686]" />,
          sparkline: [1, 2, 3, 3, 4],
        },
        {
          title: 'Platform Security Deposits Held',
          value: '₹3,45,000',
          trend: 'Escrow Locked',
          isPositive: true,
          icon: <ShieldAlert className="w-5 h-5 text-[#B08A4E]" />,
          sparkline: [280, 310, 330, 340, 345],
        },
        {
          title: 'Active Disputes',
          value: '1 Open',
          trend: 'Requires Arbitration',
          isPositive: false,
          icon: <Scale className="w-5 h-5 text-[#A0524E]" />,
          sparkline: [0, 0, 1, 1, 1],
        },
      ]
    : [
        {
          title: 'My Active Rentals',
          value: '4 Rigs',
          trend: '+12.5% this week',
          isPositive: true,
          icon: <ShoppingBag className="w-5 h-5 text-[#988686]" />,
          sparkline: [2, 3, 3, 4, 4],
        },
        {
          title: 'Rentals Due Today',
          value: '1 Item',
          trend: 'Due by 18:00',
          isPositive: true,
          icon: <Clock className="w-5 h-5 text-[#B08A4E]" />,
          sparkline: [1, 1, 2, 1, 1],
        },
        {
          title: 'My Revenue (After 10% Fee)',
          value: '₹4,05,000',
          trend: 'Net Payout Ready',
          isPositive: true,
          icon: <DollarSign className="w-5 h-5 text-[#5E7A63]" />,
          sparkline: [280, 310, 350, 380, 405],
        },
        {
          title: 'Deposits Held for My Items',
          value: '₹1,05,000',
          trend: 'Escrow Protected',
          isPositive: true,
          icon: <ShieldAlert className="w-5 h-5 text-[#5E7286]" />,
          sparkline: [60, 80, 90, 100, 105],
        },
        {
          title: 'Late Fees Accrued',
          value: '₹45,000',
          trend: 'Pending Auto-Deduction',
          isPositive: false,
          icon: <AlertTriangle className="w-5 h-5 text-[#A0524E]" />,
          sparkline: [0, 15, 30, 40, 45],
        },
      ];

  const overdueOrders = INITIAL_ORDERS.filter((o) => o.status === 'Overdue');

  const overdueColumns: Column<Order>[] = [
    {
      key: 'orderNumber',
      header: 'Order #',
      render: (r) => <span className="font-mono font-bold text-[#A0524E]">#{r.orderNumber}</span>,
    },
    {
      key: 'customerName',
      header: 'Customer (Buyer)',
      render: (r) => (
        <div className="flex items-center gap-2">
          <img src={r.customerAvatar} alt={r.customerName} className="w-6 h-6 rounded-full object-cover" />
          <span className="font-medium text-xs text-[#000000] dark:text-white">{r.customerName}</span>
        </div>
      ),
    },
    {
      key: 'renterName',
      header: 'Renter (Seller)',
      render: (r) => <span className="text-xs text-[#988686]">{r.renterName}</span>,
    },
    {
      key: 'productName',
      header: 'Rented Item',
      render: (r) => <span className="text-xs truncate max-w-[180px] block">{r.productName}</span>,
    },
    {
      key: 'daysOverdue',
      header: 'Overdue',
      render: (r) => (
        <span className="font-mono font-bold text-[#A0524E] text-xs">
          {r.daysOverdue} Days
        </span>
      ),
    },
    {
      key: 'estimatedPenalty',
      header: 'Penalty Accrued',
      render: (r) => (
        <span className="font-mono font-bold text-[#000000] dark:text-white text-xs">
          ₹{r.estimatedPenalty?.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      render: (r) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Phone className="w-3 h-3" />}
            onClick={(e) => {
              e.stopPropagation();
              alert(`Contacting ${r.customerName} at ${r.customerPhone}`);
            }}
          >
            Contact
          </Button>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Calculator className="w-3 h-3" />}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('late-fees');
            }}
          >
            Penalty
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-8 page-transition pb-16">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#5C4E4E]/30 pb-4">
        <div>
          <span className="text-xs font-mono uppercase text-[#988686] tracking-widest">
            {isAdmin ? 'PLATFORM ADMIN DASHBOARD' : 'RENTER SELLER DASHBOARD'}
          </span>
          <h1 className="font-heading text-3xl font-bold text-[#000000] dark:text-white mt-1">
            {isAdmin ? 'Marketplace Logistics & Commission Operations' : 'My Renter Sales & Rental Logistics'}
          </h1>
        </div>

        <Button variant="outline" size="sm" leftIcon={<Sliders className="w-4 h-4" />}>
          Customize Dashboard
        </Button>
      </div>

      {/* Top Row: 5 KPI Cards with Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className="p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#5C4E4E] dark:text-[#B5A9A9] uppercase tracking-wider">
                {kpi.title}
              </span>
              <div className="p-1.5 rounded-lg bg-[#988686]/10">{kpi.icon}</div>
            </div>

            <div>
              <div className="font-heading text-xl font-bold font-mono text-[#000000] dark:text-white">
                {kpi.value}
              </div>
              <div className="flex items-center gap-1 text-[10px] font-medium mt-1">
                {kpi.isPositive ? (
                  <ArrowUpRight className="w-3 h-3 text-[#5E7A63]" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-[#A0524E]" />
                )}
                <span className={kpi.isPositive ? 'text-[#5E7A63]' : 'text-[#A0524E]'}>
                  {kpi.trend}
                </span>
              </div>
            </div>

            <div className="h-6 flex items-end gap-1 pt-1">
              {kpi.sparkline.map((val, sIdx) => {
                const maxVal = Math.max(...kpi.sparkline);
                const heightPct = Math.max(20, Math.round((val / maxVal) * 100));
                return (
                  <div
                    key={sIdx}
                    style={{ height: `${heightPct}%` }}
                    className="flex-1 bg-[#988686]/40 dark:bg-[#988686]/50 rounded-t transition-all"
                  />
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Overdue Rentals Queue */}
      <div className="glass-panel p-6 rounded-2xl border-2 border-[#A0524E]/60 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#A0524E]" />
            <h2 className="font-heading text-xl font-bold text-[#A0524E]">
              Overdue Rentals Action Queue ({overdueOrders.length})
            </h2>
          </div>
          <Button size="sm" variant="destructive" onClick={() => onNavigate('late-fees')}>
            Rules Engine & Config
          </Button>
        </div>

        <DataTable
          columns={overdueColumns}
          data={overdueOrders}
          onRowClick={(r) => onNavigate('orders', r.id)}
          emptyText="No overdue rentals — all inventory returned on time!"
        />
      </div>

      {/* Admin Renter Leaderboard vs Renter Pickups & Returns */}
      {isAdmin ? (
        <div className="glass-panel p-6 rounded-2xl border border-[#988686]/30 space-y-4">
          <div className="flex items-center justify-between border-b border-[#988686]/30 pb-3">
            <h3 className="font-heading text-lg font-bold text-[#000000] dark:text-white">
              Marketplace Renters (Sellers) Performance Leaderboard
            </h3>
            <Button size="sm" variant="outline" onClick={() => onNavigate('renters')}>
              Manage All Renters
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {MARKETPLACE_RENTERS.map((renter) => (
              <div key={renter.id} className="p-4 rounded-xl border border-[#988686]/30 glass-card space-y-2">
                <div className="flex items-center gap-3">
                  <img src={renter.logo} alt={renter.name} className="w-10 h-10 object-cover rounded-xl" />
                  <div>
                    <h4 className="font-bold text-sm text-[#000000] dark:text-white">{renter.name}</h4>
                    <span className="text-[10px] text-[#988686]">{renter.storeLocation}</span>
                  </div>
                </div>
                <div className="flex justify-between border-t border-[#988686]/20 pt-2 font-mono">
                  <span>Listings: {renter.totalProducts}</span>
                  <span className="font-bold text-[#5E7A63]">{renter.rating} ★ ({renter.totalOrders} rentals)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#5C4E4E]/30 pb-3">
              <h3 className="font-heading text-lg font-bold text-[#000000] dark:text-white">
                Upcoming Pickups Today (2)
              </h3>
              <Badge variant="info">Dispatch Ready</Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#988686]/10 border border-[#988686]/20 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#000000] dark:text-white block">Elena Vance (Studio Noir)</span>
                  <span className="text-[#988686]">Hasselblad X2D 100C Package</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-[#5E7A63] block">14:00 Today</span>
                  <Button size="sm" variant="outline" onClick={() => onNavigate('pickup-return')}>
                    Checklist
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#5C4E4E]/30 pb-3">
              <h3 className="font-heading text-lg font-bold text-[#000000] dark:text-white">
                Upcoming Returns Today (1)
              </h3>
              <Badge variant="warning">Inspection Scheduled</Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#988686]/10 border border-[#988686]/20 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#000000] dark:text-white block">Karan Mehta</span>
                  <span className="text-[#988686]">Caterpillar CAT 305 Excavator</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-[#B08A4E] block">17:00 Today</span>
                  <Button size="sm" variant="primary" onClick={() => onNavigate('pickup-return')}>
                    Start Inspection
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
