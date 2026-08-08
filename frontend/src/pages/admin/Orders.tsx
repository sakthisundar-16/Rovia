import React, { useState } from 'react';
import { Search, Filter, Eye, Download, CheckCircle2, Edit, Save, Calendar, ShieldCheck, Tag } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge, BadgeVariant } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { DataTable, Column } from '../../components/ui/DataTable';
import { InvoicePreviewModal } from '../../components/common/InvoicePreviewModal';
import { INITIAL_ORDERS, Order } from '../../services/mockData';
import { useToast } from '../../components/ui/Toast';

export const Orders: React.FC<{ selectedOrderId?: string }> = ({ selectedOrderId }) => {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(
    INITIAL_ORDERS.find((o) => o.id === selectedOrderId) || null
  );
  
  // Edit Order Modal State
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editCustomerPhone, setEditCustomerPhone] = useState('');
  const [editStatus, setEditStatus] = useState<Order['status']>('Active');
  const [editDepositStatus, setEditDepositStatus] = useState<Order['depositStatus']>('Held');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editTotalAmount, setEditTotalAmount] = useState(0);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const { showToast } = useToast();

  const handleOpenEditModal = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    setEditingOrder(order);
    setEditCustomerName(order.customerName);
    setEditCustomerPhone(order.customerPhone);
    setEditStatus(order.status);
    setEditDepositStatus(order.depositStatus);
    setEditStartDate(order.rentalWindow.start);
    setEditEndDate(order.rentalWindow.end);
    setEditTotalAmount(order.totalAmount);
  };

  const handleSaveOrderChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    const updated: Order = {
      ...editingOrder,
      customerName: editCustomerName,
      customerPhone: editCustomerPhone,
      status: editStatus,
      depositStatus: editDepositStatus,
      rentalWindow: {
        ...editingOrder.rentalWindow,
        start: editStartDate,
        end: editEndDate,
      },
      totalAmount: Number(editTotalAmount),
    };

    setOrders((prev) => prev.map((o) => (o.id === editingOrder.id ? updated : o)));
    if (selectedOrder?.id === editingOrder.id) {
      setSelectedOrder(updated);
    }

    showToast('Contract Updated!', `Order #${editingOrder.orderNumber} updated successfully.`, 'success');
    setEditingOrder(null);
  };

  const handleMarkPickedUp = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Active' as const } : o))
    );
    showToast('Status Updated', 'Order marked as Picked Up / Dispatched', 'success');
  };

  const columns: Column<Order>[] = [
    { key: 'orderNumber', header: 'Contract #', render: (r) => <span className="font-mono font-bold">#{r.orderNumber}</span> },
    { key: 'customerName', header: 'Customer', render: (r) => <span className="font-semibold">{r.customerName}</span> },
    { key: 'productName', header: 'Rented Gear', render: (r) => <span className="truncate max-w-[200px] block">{r.productName}</span> },
    { key: 'rentalWindow', header: 'Window', render: (r) => <span className="text-xs font-mono">{r.rentalWindow.start} → {r.rentalWindow.end}</span> },
    { key: 'totalAmount', header: 'Total Value', render: (r) => <span className="font-mono font-bold">₹{r.totalAmount.toLocaleString()}</span> },
    { key: 'depositStatus', header: 'Deposit', render: (r) => <Badge variant={r.depositStatus === 'Refunded' ? 'success' : 'info'}>{r.depositStatus}</Badge> },
    { key: 'status', header: 'Status', render: (r) => <Badge variant={r.status === 'Active' ? 'success' : r.status === 'Overdue' ? 'danger' : 'neutral'}>{r.status}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" leftIcon={<Eye className="w-3.5 h-3.5" />} onClick={() => setSelectedOrder(r)}>
            View
          </Button>
          <Button size="sm" variant="primary" leftIcon={<Edit className="w-3.5 h-3.5" />} onClick={(e) => handleOpenEditModal(e, r)}>
            Edit Contract
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="w-full space-y-8 page-transition pb-16">
      <div className="flex items-center justify-between border-b border-[#5C4E4E]/30 pb-4">
        <div>
          <span className="text-xs font-mono uppercase text-[#988686] tracking-widest">CONTRACT MANAGEMENT</span>
          <h1 className="font-heading text-3xl font-bold text-[#000000] dark:text-white mt-1">
            Orders & Rental Contracts
          </h1>
        </div>
      </div>

      {selectedOrder ? (
        /* Order Detail View for Admin / Renter */
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <button onClick={() => setSelectedOrder(null)} className="text-xs font-bold text-[#988686] hover:underline">
              ← Back to Orders List
            </button>
            <Button size="sm" variant="outline" leftIcon={<Edit className="w-3.5 h-3.5" />} onClick={(e) => handleOpenEditModal(e, selectedOrder)}>
              Edit Order Contract
            </Button>
          </div>

          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#5C4E4E]/30 pb-4">
              <div>
                <span className="text-xs font-mono text-[#988686]">Contract #{selectedOrder.orderNumber}</span>
                <h2 className="font-heading text-2xl font-bold text-[#000000] dark:text-white">{selectedOrder.customerName}</h2>
              </div>

              <div className="flex items-center gap-3">
                <Button size="sm" variant="outline" leftIcon={<Download className="w-4 h-4" />} onClick={() => setShowInvoiceModal(true)}>
                  Invoice PDF
                </Button>
                <Button size="sm" variant="primary" leftIcon={<CheckCircle2 className="w-4 h-4" />} onClick={() => handleMarkPickedUp(selectedOrder.id)}>
                  Mark Picked Up
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-[#988686]/10 border border-[#988686]/20">
                <span className="text-[#988686] uppercase block font-bold">Equipment</span>
                <span className="font-bold text-sm text-[#000000] dark:text-white">{selectedOrder.productName}</span>
                <p>{selectedOrder.variant}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#988686]/10 border border-[#988686]/20">
                <span className="text-[#988686] uppercase block font-bold">Rental Window</span>
                <span className="font-bold text-sm text-[#000000] dark:text-white">{selectedOrder.rentalWindow.start} → {selectedOrder.rentalWindow.end}</span>
                <p>({selectedOrder.rentalWindow.days} Days)</p>
              </div>
              <div className="p-3 rounded-xl bg-[#988686]/10 border border-[#988686]/20">
                <span className="text-[#988686] uppercase block font-bold">Deposit Status</span>
                <span className="font-bold text-sm text-[#5E7286] font-mono">₹{selectedOrder.depositAmount.toLocaleString()} ({selectedOrder.depositStatus})</span>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <DataTable columns={columns} data={orders} onRowClick={(r) => setSelectedOrder(r)} />
      )}

      {/* Edit Order Modal */}
      <Modal isOpen={!!editingOrder} onClose={() => setEditingOrder(null)} title={`Edit Order Contract #${editingOrder?.orderNumber}`} maxWidth="lg">
        {editingOrder && (
          <form onSubmit={handleSaveOrderChanges} className="space-y-4 text-xs pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Customer Name" value={editCustomerName} onChange={(e) => setEditCustomerName(e.target.value)} required />
              <Input label="Customer Phone" value={editCustomerPhone} onChange={(e) => setEditCustomerPhone(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-[#5C4E4E] dark:text-[#B5A9A9] uppercase">Order Contract Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as Order['status'])}
                  className="glass-input rounded p-2 text-xs font-semibold text-[#000000] dark:text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Pending Return Inspection">Pending Return Inspection</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-[#5C4E4E] dark:text-[#B5A9A9] uppercase">Security Deposit Status</label>
                <select
                  value={editDepositStatus}
                  onChange={(e) => setEditDepositStatus(e.target.value as Order['depositStatus'])}
                  className="glass-input rounded p-2 text-xs font-semibold text-[#000000] dark:text-white"
                >
                  <option value="Held">Held in Escrow</option>
                  <option value="Refunded">Refunded to Customer</option>
                  <option value="Deducted">Deducted for Damage / Late Fee</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Rental Start Date" type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} />
              <Input label="Rental Return End Date" type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} />
            </div>

            <Input label="Total Order Value (₹)" type="number" value={editTotalAmount} onChange={(e) => setEditTotalAmount(Number(e.target.value))} />

            <div className="pt-4 border-t border-[#988686]/30">
              <Button type="submit" className="w-full py-3" leftIcon={<Save className="w-4 h-4" />}>
                Save Order Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <InvoicePreviewModal isOpen={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} order={selectedOrder} />
    </div>
  );
};
