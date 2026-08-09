import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, AlertTriangle, ArrowRight, Download, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge, BadgeVariant } from '../../components/ui/Badge';
import { Order } from '../../services/mockData';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';

interface MyRentalsProps {
  onNavigate: (tab: string, orderId?: string) => void;
}

export const MyRentals: React.FC<MyRentalsProps> = ({ onNavigate }) => {
  const [filterTab, setFilterTab] = useState<'All' | 'Active' | 'Upcoming' | 'Past' | 'Overdue'>('All');
  const [orders, setOrders] = useState<Order[]>([]);
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleInitiateReturn = async (orderId: string) => {
    const updated = await api.updateOrder(orderId, { status: 'Return Requested' });
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      showToast('Return Request Sent!', 'Renter has been notified to collect the equipment.', 'success');
      try {
        const channel = new BroadcastChannel('rovia_orders_channel');
        channel.postMessage({ type: 'ORDER_UPDATED', orderId });
      } catch {}
    }
  };

  const loadOrders = () => {
    api.getOrders().then((allOrders) => {
      const myOrders = user?.email
        ? allOrders.filter(
            (o) =>
              o.customerEmail === user.email ||
              o.customerName === user.name ||
              o.customerEmail === 'customer@rovia-demo.com' ||
              o.customerEmail === 'elena.vance@studio-noir.com' ||
              o.customerEmail === 'karan@mumbai-cinematics.in'
          )
        : allOrders;
      setOrders(myOrders);
    });
  };

  useEffect(() => {
    loadOrders();

    // Cross-tab BroadcastChannel listener for instant live update
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('rovia_orders_channel');
      channel.onmessage = () => loadOrders();
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'rovia_orders' || !e.key) loadOrders();
    };
    const handleCustomSync = () => loadOrders();

    window.addEventListener('storage', handleStorage);
    window.addEventListener('rovia_order_updated', handleCustomSync);

    // 2s auto-refresh polling fallback
    const interval = setInterval(loadOrders, 2000);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('rovia_order_updated', handleCustomSync);
      clearInterval(interval);
    };
  }, [user]);

  const filteredOrders = orders.filter((o) => {
    if (filterTab === 'All') return true;
    return o.status === filterTab;
  });

  const getStatusBadgeVariant = (status: Order['status']): BadgeVariant => {
    switch (status) {
      case 'Active': return 'success';
      case 'Upcoming': case 'Pending Approval': return 'warning';
      case 'Past': case 'Completed': return 'neutral';
      case 'Overdue': case 'Cancelled': return 'danger';
      default: return 'warning';
    }
  };

  return (
    <div className="w-full space-y-8 page-transition pb-16">
      {/* Title & Filter Chips */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#D1D0D0]/40 dark:border-[#5C4E4E]/40 pb-4">
        <div>
          <span className="text-xs font-mono uppercase text-[#988686] tracking-widest">CUSTOMER DASHBOARD</span>
          <h1 className="font-heading text-4xl font-bold text-[#000000] dark:text-white mt-1">
            My Rentals &amp; Contracts
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

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-[#988686]/15 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-[#988686]" />
          </div>
          <h3 className="font-heading text-lg font-bold text-[#000000] dark:text-white mb-2">No Rentals Found</h3>
          <p className="text-sm text-[#988686]">
            {filterTab === 'All'
              ? 'You have no rental orders yet. Browse the catalog to get started.'
              : `No ${filterTab.toLowerCase()} rentals found.`}
          </p>
          {filterTab === 'All' && (
            <Button className="mt-4" onClick={() => onNavigate('catalog')}>
              Browse Catalog
            </Button>
          )}
        </div>
      )}

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

            {/* Penalty Invoice Banner */}
            {order.penaltyIssued && !order.penaltyPaid && (
              <div className="p-4 rounded-xl bg-[#A0524E]/15 border border-[#A0524E]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mb-3">
                <div className="flex items-center gap-3 text-[#A0524E]">
                  <FileText className="w-5 h-5 shrink-0 animate-pulse" />
                  <div>
                    <h4 className="font-bold text-sm">Penalty Invoice Issued</h4>
                    <p className="text-[11px] text-[#5C4E4E] dark:text-[#B5A9A9]">
                      A late fee penalty invoice of ₹{order.penaltyAmount?.toLocaleString()} has been issued against your account.
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="destructive" onClick={async () => {
                  const updated = await api.updateOrder(order.id, { penaltyPaid: true, timeline: [...order.timeline, { stage: 'Penalty Invoice Paid', timestamp: new Date().toISOString(), completed: true }] });
                  if (updated) {
                    showToast('Penalty Paid', 'Penalty invoice has been settled successfully.', 'success');
                    setOrders(prev => prev.map(o => o.id === order.id ? updated : o));
                  }
                }}>
                  Pay Penalty Now
                </Button>
              </div>
            )}

            {/* Active Handover Verified Banner with Return Product Button */}
            {order.status === 'Active' && (
              <div className="p-4 rounded-xl bg-[#5E7A63]/15 border border-[#5E7A63]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 text-[#5E7A63]">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Handover Verified &amp; Active in Rental Window</h4>
                    <p className="text-[11px] text-[#5C4E4E] dark:text-[#B5A9A9]">
                      QR code verified. Click "Return Product Now" when your rental period is finished.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-[#988686] hover:bg-[#877575] text-white font-bold"
                    onClick={() => handleInitiateReturn(order.id)}
                  >
                    Return Product Now 📦
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onNavigate('order-detail', order.id)}>
                    Audit Trail
                  </Button>
                </div>
              </div>
            )}

            {/* Return Requested Banner */}
            {order.status === 'Return Requested' && (
              <div className="p-4 rounded-xl bg-[#D97706]/15 border border-[#D97706]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 text-[#D97706]">
                  <ShieldCheck className="w-5 h-5 shrink-0 animate-pulse" />
                  <div>
                    <h4 className="font-bold text-sm">Return Requested — Awaiting Renter Collection</h4>
                    <p className="text-[11px] text-[#5C4E4E] dark:text-[#B5A9A9]">
                      Renter has been notified to collect the equipment &amp; inspect condition.
                    </p>
                  </div>
                </div>
                <Badge variant="warning">Awaiting Collection</Badge>
              </div>
            )}

            {/* Completed Banner */}
            {order.status === 'Completed' && (
              <div className="p-4 rounded-xl bg-[#5E7A63]/15 border border-[#5E7A63]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 text-[#5E7A63]">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Rental Finished &amp; Deposit Refunded!</h4>
                    <p className="text-[11px] text-[#5C4E4E] dark:text-[#B5A9A9]">
                      Renter collected product &amp; released 100% security deposit (₹{order.depositAmount?.toLocaleString()}).
                    </p>
                  </div>
                </div>
                <Badge variant="success">Completed</Badge>
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
                <span className="text-[#5E7A63] font-bold">✓ Ordered</span>
                <span className={order.status === 'Upcoming' || order.status === 'Active' || order.status === 'Completed' || order.status === 'Past' ? 'text-[#5E7A63] font-bold' : ''}>
                  {order.status === 'Upcoming' ? '✓ Renter Approved' : 'Renter Approved'}
                </span>
                <span className={order.status === 'Active' ? 'text-[#5E7A63] font-bold' : ''}>Picked Up</span>
                <span>Returned</span>
                <span>Deposit Settled</span>
              </div>
              <div className="w-full h-1.5 bg-[#988686]/20 rounded-full overflow-hidden flex">
                <div
                  className={`h-full bg-[#5E7A63] transition-all duration-500 ${
                    order.status === 'Past' || order.status === 'Completed'
                      ? 'w-full'
                      : order.status === 'Active'
                      ? 'w-3/5'
                      : order.status === 'Upcoming'
                      ? 'w-2/5'
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
                View Full Timeline &amp; Deposit Ledger
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
