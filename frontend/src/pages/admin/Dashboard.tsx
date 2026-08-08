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
  ChevronRight,
  CheckCircle2,
  Phone,
  Calculator,
  Sliders,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataTable, Column } from '../../components/ui/DataTable';
import { INITIAL_ORDERS, Order } from '../../services/mockData';

interface DashboardProps {
  onNavigate: (tab: string, itemNumber?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [revenuePeriod, setRevenuePeriod] = useState<'today' | 'week' | 'month'>('month');

  // KPI Data
  const kpis = [
    {
      title: 'Active Rentals',
      value: '14 Rigs',
      trend: '+12.5%',
      isPositive: true,
      icon: <ShoppingBag className="w-5 h-5 text-[#988686]" />,
      sparkline: [8, 10, 11, 12, 14],
    },
    {
      title: 'Rentals Due Today',
      value: '3 Items',
      trend: 'Due by 18:00',
      isPositive: true,
      icon: <Clock className="w-5 h-5 text-[#B08A4E]" />,
      sparkline: [2, 4, 3, 5, 3],
    },
    {
      title: 'Revenue (August)',
      value: '₹4,85,000',
      trend: '+18.4% vs July',
      isPositive: true,
      icon: <DollarSign className="w-5 h-5 text-[#5E7A63]" />,
      sparkline: [320, 390, 420, 450, 485],
    },
    {
      title: 'Security Deposits Held',
      value: '₹3,45,000',
      trend: '100% Escrow Locked',
      isPositive: true,
      icon: <ShieldAlert className="w-5 h-5 text-[#5E7286]" />,
      sparkline: [280, 310, 330, 340, 345],
    },
    {
      title: 'Late Fees Collected',
      value: '₹38,200',
      trend: 'Auto-Invoiced',
      isPositive: false,
      icon: <AlertTriangle className="w-5 h-5 text-[#A0524E]" />,
      sparkline: [12, 18, 25, 30, 38],
    },
  ];

  const overdueOrders = INITIAL_ORDERS.filter((o) => o.status === 'Overdue');

  const overdueColumns: Column<Order>[] = [
    {
      key: 'orderNumber',
      header: 'Order #',
      render: (r) => <span className="font-mono font-bold text-[#A0524E]">{r.orderNumber}</span>,
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (r) => (
        <div className="flex items-center gap-2">
          <img src={r.customerAvatar} alt={r.customerName} className="w-6 h-6 rounded-full object-cover" />
          <span className="font-medium text-xs text-[#000000] dark:text-white">{r.customerName}</span>
        </div>
      ),
    },
    {
      key: 'productName',
      header: 'Rented Gear',
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
      header: 'Quick Action',
      render: (r) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Phone className="w-3 h-3" />}
            onClick={(e) => {
              e.stopPropagation();
              alert(`Calling customer ${r.customerName} at ${r.customerPhone}`);
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
      {/* Header & Customize Affordance */}
      <div className="flex items-center justify-between border-b border-[#5C4E4E]/30 pb-4">
        <div>
          <span className="text-xs font-mono uppercase text-[#988686] tracking-widest">OPERATIONS CENTER</span>
          <h1 className="font-heading text-3xl font-bold text-[#000000] dark:text-white mt-1">
            Real-Time Logistics & Revenue Dashboard
          </h1>
        </div>

        <Button variant="outline" size="sm" leftIcon={<Sliders className="w-4 h-4" />}>
          Customize Dashboard Widgets
        </Button>
      </div>

      {/* Top Row: 5 KPI Cards with Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className="p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#5C4E4E] dark:text-[#B5A9A9] uppercase tracking-wider">
                {kpi.title}
              </span>
              <div className="p-1.5 rounded-lg bg-[#988686]/10">{kpi.icon}</div>
            </div>

            <div>
              <div className="font-heading text-2xl font-bold font-mono text-[#000000] dark:text-white">
                {kpi.value}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium mt-1">
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

            {/* Sparkline mini bar chart */}
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

      {/* Overdue Rentals Priority Panel (Danger Accent Border) */}
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

      {/* Priority Two-Column Panel: Upcoming Pickups vs Returns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Upcoming Pickups */}
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

            <div className="p-3.5 rounded-xl bg-[#988686]/10 border border-[#988686]/20 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#000000] dark:text-white block">Studio Noir Atelier</span>
                <span className="text-[#988686]">Gothic Noir Lounge Armchair</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-[#5E7A63] block">16:30 Today</span>
                <Button size="sm" variant="outline" onClick={() => onNavigate('pickup-return')}>
                  Checklist
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Column: Upcoming Returns */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#5C4E4E]/30 pb-3">
            <h3 className="font-heading text-lg font-bold text-[#000000] dark:text-white">
              Upcoming Returns Today (2)
            </h3>
            <Badge variant="warning">Inspection Scheduled</Badge>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#988686]/10 border border-[#988686]/20 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#000000] dark:text-white block">Aarav Sharma</span>
                <span className="text-[#988686]">ARRI Signature Prime 35mm Lens</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-[#B08A4E] block">17:00 Today</span>
                <Button size="sm" variant="primary" onClick={() => onNavigate('pickup-return')}>
                  Start Inspection
                </Button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#988686]/10 border border-[#988686]/20 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#000000] dark:text-white block">Rohan Kapoor</span>
                <span className="text-[#988686]">Sennheiser MKH 416 Shotgun Package</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-[#B08A4E] block">18:15 Today</span>
                <Button size="sm" variant="primary" onClick={() => onNavigate('pickup-return')}>
                  Start Inspection
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue & Deposits Palette Chart */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#5C4E4E]/30 pb-3">
          <div>
            <h3 className="font-heading text-lg font-bold text-[#000000] dark:text-white">
              Revenue, Deposits & Late Fees Stream
            </h3>
            <p className="text-xs text-[#988686]">Financial performance across active operational period</p>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#988686]/15 text-xs">
            <button
              onClick={() => setRevenuePeriod('today')}
              className={`px-3 py-1 rounded font-bold ${revenuePeriod === 'today' ? 'bg-[#988686] text-white' : 'text-[#B5A9A9]'}`}
            >
              Today
            </button>
            <button
              onClick={() => setRevenuePeriod('week')}
              className={`px-3 py-1 rounded font-bold ${revenuePeriod === 'week' ? 'bg-[#988686] text-white' : 'text-[#B5A9A9]'}`}
            >
              Week
            </button>
            <button
              onClick={() => setRevenuePeriod('month')}
              className={`px-3 py-1 rounded font-bold ${revenuePeriod === 'month' ? 'bg-[#988686] text-white' : 'text-[#B5A9A9]'}`}
            >
              Month
            </button>
          </div>
        </div>

        {/* Custom Visual Bar Chart using Palette Tokens */}
        <div className="h-48 flex items-end justify-between gap-4 pt-6 px-4 border-b border-[#5C4E4E]/20 pb-4">
          {[
            { label: 'Week 1', revenue: 95, deposits: 120, late: 5 },
            { label: 'Week 2', revenue: 120, deposits: 140, late: 12 },
            { label: 'Week 3', revenue: 145, deposits: 160, late: 18 },
            { label: 'Week 4', revenue: 180, deposits: 190, late: 29 },
          ].map((bar, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center gap-2 h-36">
                {/* Revenue Bar (Mauve) */}
                <div
                  style={{ height: `${(bar.revenue / 200) * 100}%` }}
                  className="w-1/3 bg-[#988686] rounded-t transition-all hover:bg-[#827171]"
                  title={`Revenue: ₹${bar.revenue * 1000}`}
                />
                {/* Deposits Bar (Plum) */}
                <div
                  style={{ height: `${(bar.deposits / 200) * 100}%` }}
                  className="w-1/3 bg-[#5C4E4E] rounded-t transition-all hover:bg-[#3D3333]"
                  title={`Deposits: ₹${bar.deposits * 1000}`}
                />
                {/* Late Fees Bar (Danger Brick) */}
                <div
                  style={{ height: `${(bar.late / 200) * 100}%` }}
                  className="w-1/3 bg-[#A0524E] rounded-t transition-all hover:bg-[#8A4340]"
                  title={`Late Fees: ₹${bar.late * 1000}`}
                />
              </div>
              <span className="text-[11px] font-mono text-[#988686]">{bar.label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-8 text-xs pt-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#988686]" />
            <span className="text-[#000000] dark:text-white font-medium">Rental Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#5C4E4E]" />
            <span className="text-[#000000] dark:text-white font-medium">Security Deposits Held</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#A0524E]" />
            <span className="text-[#000000] dark:text-white font-medium">Late Fees Accrued</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
