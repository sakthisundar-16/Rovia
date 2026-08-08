import React, { useState } from 'react';
import { Clock, ShieldCheck, AlertTriangle, ArrowRight, Download, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge, BadgeVariant } from '../../components/ui/Badge';
import { INITIAL_ORDERS, Order } from '../../services/mockData';

interface MyRentalsProps {
  onNavigate: (tab: string, orderId?: string) => void;
}

export const MyRentals: React.FC<MyRentalsProps> = ({ onNavigate }) => {
  const [filterTab, setFilterTab] = useState<'All' | 'Active' | 'Upcoming' | 'Past' | 'Overdue'>('All');

  const orders = INITIAL_ORDERS;

  const filteredOrders = orders.filter((o) => {
    if (filterTab === 'All') return true;
    return o.status === filterTab;
  });

  const getStatusBadgeVariant = (status: Order['status']): BadgeVariant => {
    switch (status) {
      case 'Active': return 'success';
      case 'Upcoming': return 'warning';
      case 'Past': return 'neutral';
      case 'Overdue': return 'danger';
    }
  };

  return (
    <div className="w-full space-y-8 page-transition pb-16">
      {/* Title & Filter Chips */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#D1D0D0]/40 dark:border-[#5C4E4E]/40 pb-4">
        <div>
          <span className="text-xs font-mono uppercase text-[#988686] tracking-widest">CUSTOMER DASHBOARD</span>
          <h1 className="font-heading text-4xl font-bold text-[#000000] dark:text-white mt-1">
            My Rentals & Contracts
          </h1>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center p-1 rounded-xl bg-[#988686]/15 max-w-md">
          {(['All', 'Active', 'Upcoming', 'Past', 'Overdue'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
                filterTab === tab
                  ? 'bg-[#000000] dark:bg-[#988686] text-white shadow-warm-sm'
                  : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="space-y-4 p-6 hover:border-[#988686]/50">
            {/* Persistent Non-Alarmist Overdue Banner */}
            {order.status === 'Overdue' && (
              <div className="p-4 rounded-xl bg-[#A0524E]/15 border border-[#A0524E]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 text-[#A0524E]">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Overdue Return Notice — {order.daysOverdue} Days Past Schedule</h4>
                    <p className="text-[11px] text-[#5C4E4E] dark:text-[#B5A9A9]">
                      Estimated penalty: ₹{order.estimatedPenalty?.toLocaleString()} (@ ₹9,800/day). Please return immediately or request an extension.
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="destructive" onClick={() => onNavigate('return-flow')}>
                  Return Instructions
                </Button>
              </div>
            )}

            {/* Header Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D1D0D0]/30 dark:border-[#5C4E4E]/30 pb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-[#000000] dark:text-white">{order.orderNumber}</span>
                <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
              </div>
              <div className="text-xs text-[#988686]">
                Window: <strong className="text-[#000000] dark:text-white">{order.rentalWindow.start} → {order.rentalWindow.end}</strong> ({order.rentalWindow.days} Days)
              </div>
            </div>

            {/* Product Body */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img src={order.productImage} alt={order.productName} className="w-16 h-16 object-cover rounded-xl shrink-0" />
                <div>
                  <h3 className="font-heading text-base font-bold text-[#000000] dark:text-white">{order.productName}</h3>
                  <p className="text-xs text-[#988686]">{order.variant}</p>
                </div>
              </div>

              {/* Deposit Status Pill */}
              <div className="text-left sm:text-right text-xs w-full sm:w-auto">
                <span className="text-[10px] text-[#988686] uppercase block">Security Deposit Status</span>
                <span className={`font-mono font-bold ${order.depositStatus === 'Refunded' ? 'text-[#5E7A63]' : 'text-[#5E7286]'}`}>
                  {order.depositStatus === 'Held' && `Held ₹${order.depositAmount.toLocaleString()}`}
                  {order.depositStatus === 'Refunded' && `Refunded ₹${order.depositAmount.toLocaleString()}`}
                  {order.depositStatus === 'Partially Deducted' && `₹${order.deductionAmount} Deducted`}
                </span>
              </div>
            </div>

            {/* Progress Mini-Timeline Indicator */}
            <div className="pt-3 border-t border-[#D1D0D0]/30 dark:border-[#5C4E4E]/30">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#988686] mb-2">
                <span>Ordered</span>
                <span>Picked Up</span>
                <span>In Use</span>
                <span>Returned</span>
                <span>Deposit Settled</span>
              </div>
              <div className="w-full h-1.5 bg-[#988686]/20 rounded-full overflow-hidden flex">
                <div
                  className={`h-full bg-[#5E7A63] transition-all duration-500 ${
                    order.status === 'Past'
                      ? 'w-full'
                      : order.status === 'Active'
                      ? 'w-3/5'
                      : order.status === 'Overdue'
                      ? 'w-4/5 bg-[#A0524E]'
                      : 'w-1/5'
                  }`}
                />
              </div>
            </div>

            {/* Footer Action */}
            <div className="flex justify-end pt-2">
              <Button
                size="sm"
                variant="outline"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => onNavigate('order-detail', order.id)}
              >
                View Full Timeline & Deposit Ledger
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
