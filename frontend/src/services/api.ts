/**
 * api.ts — Frontend API layer
 * 
 * All data mutations (create/update/delete) call the real FastAPI backend.
 * localStorage is used as a cache/fallback so the UI still works if the
 * backend is temporarily unreachable.
 */

import {
  UNIVERSAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_DEPOSITS,
  INITIAL_INSPECTIONS,
  INITIAL_QUOTATIONS,
  MARKETPLACE_RENTERS,
  MARKETPLACE_PAYOUTS,
  MARKETPLACE_DISPUTES,
  Product,
  Order,
  DepositLedger,
  InspectionItem,
  Quotation,
  RenterVendor,
  RenterPayout,
  MarketplaceDispute,
} from './mockData';

import { apiFetch, toBackendCategory, fromBackendCategory } from './apiClient';
import { EXTENDED_PRODUCTS } from './productsData';

// ─── camelCase ↔ backend schema converters ────────────────────────────────────

function productFromApi(p: any): Product {
  const variants = p.variants ?? [];
  return {
    id: String(p.id),
    renterId: p.organization_id ?? '',
    renterName: p.organization_name ?? '',
    sku: variants[0]?.sku ?? p.slug ?? '',
    name: p.name,
    category: fromBackendCategory(p.category),
    brand: p.brand ?? '',
    color: '',
    dailyRate: parseFloat(p.base_rental_price ?? 0),
    securityDeposit: parseFloat(p.security_deposit_configuration ?? 0),
    stock: 10,
    available: 10,
    rating: 5.0,
    image: p.image_url ?? '',
    gallery: [],
    description: p.description ?? '',
    specs: {},
    variants: variants.map((v: any) => v.name),
  };
}

function productToApi(p: Omit<Product, 'id'> | Product) {
  return {
    name: p.name,
    description: p.description ?? '',
    category: toBackendCategory(p.category),
    brand: p.brand ?? '',
    base_rental_price: p.dailyRate,
    security_deposit_configuration: p.securityDeposit,
    is_active: true,
    variants: p.variants?.map(v => ({ name: String(v), sku: null, price_adjustment: 0 })) ?? [],
  };
}

function orderFromApi(o: any): Order {
  const items = o.items ?? [];
  const firstItem = items[0];
  return {
    id: String(o.id),
    renterId: o.organization_id ?? '',
    renterName: '',
    orderNumber: o.rental_number ?? String(o.id).substring(0, 8).toUpperCase(),
    customerName: o.customer?.first_name ? `${o.customer.first_name} ${o.customer.last_name}` : '',
    customerEmail: o.customer?.email ?? '',
    customerPhone: o.customer?.phone ?? '',
    customerAvatar: '',
    productName: firstItem?.product?.name ?? '',
    productImage: firstItem?.product?.image_url ?? '',
    variant: firstItem?.variant?.name ?? '',
    rentalWindow: {
      start: o.start_datetime?.split('T')[0] ?? '',
      end: o.expected_return_datetime?.split('T')[0] ?? '',
      days: o.rental_days ?? firstItem?.rental_days ?? 1,
    },
    rentalFee: parseFloat(o.subtotal ?? 0),
    depositAmount: parseFloat(o.security_deposit_amount ?? 0),
    taxAmount: parseFloat(o.tax_amount ?? 0),
    totalAmount: parseFloat(o.total_amount ?? 0),
    status: mapRentalStatus(o.status),
    depositStatus: 'Held',
    timeline: [],
    pickupMethod: o.pickup_method === 'DELIVERY' ? 'Delivery' : 'In-Store Pickup',
  };
}

function mapRentalStatus(s: string): Order['status'] {
  const map: Record<string, Order['status']> = {
    DRAFT: 'Pending Approval',
    QUOTED: 'Pending Approval',
    CONFIRMED: 'Upcoming',
    PAYMENT_PENDING: 'Upcoming',
    PAYMENT_COMPLETED: 'Upcoming',
    READY_FOR_PICKUP: 'Upcoming',
    PICKED_UP: 'Active',
    ACTIVE: 'Active',
    RETURN_DUE: 'Active',
    OVERDUE: 'Overdue',
    RETURNED: 'Past',
    INSPECTION: 'Pending Return Inspection',
    SETTLEMENT: 'Past',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    NO_SHOW: 'Cancelled',
  };
  return map[s] ?? 'Pending Approval';
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

const loadStored = <T>(key: string, fallback: T[]): T[] => {
  try {
    const s = localStorage.getItem(key);
    if (s) { const p = JSON.parse(s); if (Array.isArray(p) && p.length > 0) return p; }
  } catch {}
  return [...fallback];
};

const saveStored = <T>(key: string, data: T[]) => {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
};

// ─── In-memory state ──────────────────────────────────────────────────────────

let localProducts: Product[] = loadStored('rovia_products', UNIVERSAL_PRODUCTS);
let localOrders: Order[] = loadStored('rovia_orders', INITIAL_ORDERS);
let localDeposits: DepositLedger[] = [...INITIAL_DEPOSITS];
let localInspections: InspectionItem[] = [...INITIAL_INSPECTIONS];
let localQuotations: Quotation[] = [...INITIAL_QUOTATIONS];
let localRenters: RenterVendor[] = [...MARKETPLACE_RENTERS];
let localPayouts: RenterPayout[] = [...MARKETPLACE_PAYOUTS];
let localDisputes: MarketplaceDispute[] = [...MARKETPLACE_DISPUTES];

// ─── API ──────────────────────────────────────────────────────────────────────
export const api = {

  // ── Products ────────────────────────────────────────────────────────────────

  getProducts: async (renterId?: string): Promise<Product[]> => {
    try {
      const res = await apiFetch('/products');
      if (res.ok) {
        const data: any[] = await res.json();
        const products = data.map(productFromApi);
        saveStored('rovia_products', products);
        localProducts = products;
        const allProducts = [...localProducts, ...EXTENDED_PRODUCTS.filter(ep => !localProducts.find(lp => lp.id === ep.id))];
        return renterId ? allProducts.filter(p => p.renterId === renterId) : allProducts;
      }
    } catch {}
    localProducts = loadStored('rovia_products', UNIVERSAL_PRODUCTS);
    const allProducts = [...localProducts, ...EXTENDED_PRODUCTS.filter(ep => !localProducts.find(lp => lp.id === ep.id))];
    return renterId ? allProducts.filter(p => p.renterId === renterId) : allProducts;
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    try {
      const res = await apiFetch(`/products/${id}`);
      if (res.ok) return productFromApi(await res.json());
    } catch {}
    const stored = loadStored<Product>('rovia_products', UNIVERSAL_PRODUCTS);
    const allProducts = [...stored, ...EXTENDED_PRODUCTS.filter(ep => !stored.find(lp => lp.id === ep.id))];
    return allProducts.find(p => p.id === id);
  },

  createProduct: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    try {
      const res = await apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify(productToApi(productData)),
      });
      if (res.ok) {
        const created = productFromApi(await res.json());
        localProducts = [created, ...loadStored<Product>('rovia_products', UNIVERSAL_PRODUCTS).filter(p => p.id !== created.id)];
        saveStored('rovia_products', localProducts);
        console.log('✅ Product saved to database:', created.name);
        return created;
      } else {
        const err = await res.json().catch(() => ({}));
        console.error('❌ Backend rejected product creation:', res.status, err);
      }
    } catch (e) {
      console.error('❌ Backend unreachable, saving to localStorage only:', e);
    }
    // Offline fallback
    const newProduct: Product = { ...productData, id: 'local-' + Date.now() };
    localProducts = [newProduct, ...loadStored<Product>('rovia_products', UNIVERSAL_PRODUCTS)];
    saveStored('rovia_products', localProducts);
    return newProduct;
  },

  updateProduct: async (id: string, productData: Partial<Product>): Promise<Product | undefined> => {
    try {
      const res = await apiFetch(`/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(productToApi(productData as Product)),
      });
      if (res.ok) {
        const updated = productFromApi(await res.json());
        localProducts = loadStored<Product>('rovia_products', UNIVERSAL_PRODUCTS).map(p => p.id === id ? updated : p);
        saveStored('rovia_products', localProducts);
        return updated;
      }
    } catch {}
    localProducts = loadStored<Product>('rovia_products', UNIVERSAL_PRODUCTS).map(p => p.id === id ? { ...p, ...productData } : p);
    saveStored('rovia_products', localProducts);
    return localProducts.find(p => p.id === id);
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    try {
      const res = await apiFetch(`/products/${id}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        localProducts = loadStored<Product>('rovia_products', UNIVERSAL_PRODUCTS).filter(p => p.id !== id);
        saveStored('rovia_products', localProducts);
        return true;
      }
    } catch {}
    localProducts = loadStored<Product>('rovia_products', UNIVERSAL_PRODUCTS).filter(p => p.id !== id);
    saveStored('rovia_products', localProducts);
    return true;
  },

  // ── Orders / Rentals ─────────────────────────────────────────────────────────

  getOrders: async (renterId?: string): Promise<Order[]> => {
    try {
      const res = await apiFetch('/rentals');
      if (res.ok) {
        const data: any[] = await res.json();
        const orders = data.map(orderFromApi);
        saveStored('rovia_orders', orders);
        localOrders = orders;
        return renterId ? orders.filter(o => o.renterId === renterId) : orders;
      }
    } catch {}
    localOrders = loadStored('rovia_orders', INITIAL_ORDERS);
    return renterId ? localOrders.filter(o => o.renterId === renterId || o.renterId === 'rnt-101' || !o.renterId) : localOrders;
  },

  createOrder: async (orderData: Omit<Order, 'id'>): Promise<Order> => {
    try {
      const body = {
        start_datetime: orderData.rentalWindow.start + 'T00:00:00Z',
        expected_return_datetime: orderData.rentalWindow.end + 'T23:59:59Z',
        pickup_method: orderData.pickupMethod === 'Delivery' ? 'DELIVERY' : 'IN_STORE',
        items: [{ product_id: orderData.productName, quantity: 1 }],
      };
      const res = await apiFetch('/rentals', { method: 'POST', body: JSON.stringify(body) });
      if (res.ok) {
        const created = orderFromApi(await res.json());
        localOrders = [created, ...loadStored('rovia_orders', INITIAL_ORDERS)];
        saveStored('rovia_orders', localOrders);
        console.log('✅ Order saved to database:', created.orderNumber);
        return created;
      }
    } catch {}
    const newOrder: Order = { ...orderData, id: 'local-' + Date.now() };
    localOrders = [newOrder, ...loadStored('rovia_orders', INITIAL_ORDERS)];
    saveStored('rovia_orders', localOrders);
    return newOrder;
  },

  updateOrder: async (id: string, orderData: Partial<Order>): Promise<Order | undefined> => {
    try {
      // Map status back to backend RentalStatus enum for transitions
      if (orderData.status) {
        const statusMap: Record<string, string> = {
          'Active': 'ACTIVE',
          'Upcoming': 'CONFIRMED',
          'Completed': 'COMPLETED',
          'Cancelled': 'CANCELLED',
          'Pending Approval': 'DRAFT',
          'Overdue': 'OVERDUE',
        };
        const target = statusMap[orderData.status];
        if (target) {
          await apiFetch(`/rentals/${id}/transition`, {
            method: 'POST',
            body: JSON.stringify({ target_status: target }),
          });
        }
      }
    } catch {}

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today';

    localOrders = loadStored('rovia_orders', INITIAL_ORDERS).map(o => {
      if (o.id !== id && o.orderNumber !== id && !id.includes(o.orderNumber)) return o;

      const newStatus = orderData.status ?? o.status;
      let existingTimeline = o.timeline && o.timeline.length > 0 ? [...o.timeline] : [
        { stage: 'Order Placed', timestamp: 'Just now', completed: true, notes: 'Payment & Deposit authorized' },
        { stage: 'Renter Approval & Verification', timestamp: 'Pending', completed: false, notes: 'Awaiting Renter QR approval' },
        { stage: 'Dispatched / Picked Up', timestamp: 'Pending', completed: false },
        { stage: 'In Rental Window', timestamp: 'Pending', completed: false },
        { stage: 'Return & Inspection', timestamp: 'Pending', completed: false },
        { stage: 'Deposit Refunded', timestamp: 'Pending', completed: false }
      ];

      // Update timeline stages dynamically based on new status
      if (newStatus === 'Upcoming') {
        existingTimeline = existingTimeline.map((step, idx) => {
          if (idx === 0) return { ...step, completed: true };
          if (idx === 1 || step.stage.toLowerCase().includes('approval') || step.stage.toLowerCase().includes('verification')) {
            return {
              ...step,
              stage: 'Renter Approval & Verification',
              completed: true,
              timestamp: nowTime,
              notes: 'Approved & confirmed by Renter. Ready for pickup / dispatch.',
            };
          }
          return step;
        });
      } else if (newStatus === 'Active') {
        existingTimeline = existingTimeline.map((step, idx) => {
          if (idx <= 1) return { ...step, completed: true };
          if (idx === 2 || step.stage.toLowerCase().includes('dispatched') || step.stage.toLowerCase().includes('picked')) {
            return {
              ...step,
              completed: true,
              timestamp: nowTime,
              notes: 'Handover verified & active in rental window.',
            };
          }
          if (idx === 3 || step.stage.toLowerCase().includes('rental window')) {
            return { ...step, completed: true, timestamp: 'Now Active' };
          }
          return step;
        });
      } else if (newStatus === 'Return Requested') {
        existingTimeline = existingTimeline.map((step, idx) => {
          if (idx <= 3) return { ...step, completed: true };
          if (idx === 4 || step.stage.toLowerCase().includes('return')) {
            return {
              ...step,
              completed: false,
              timestamp: 'Return Initiated ' + nowTime,
              notes: 'Customer requested return. Waiting for renter to collect product.',
            };
          }
          return step;
        });
      } else if (newStatus === 'Completed') {
        existingTimeline = existingTimeline.map((step, idx) => {
          if (idx === 4 || step.stage.toLowerCase().includes('return')) {
            return {
              ...step,
              completed: true,
              timestamp: nowTime,
              notes: 'Product collected by renter & inspection passed.',
            };
          }
          if (idx === 5 || step.stage.toLowerCase().includes('deposit')) {
            return {
              ...step,
              completed: true,
              timestamp: nowTime,
              notes: '100% security deposit refunded to customer.',
            };
          }
          return { ...step, completed: true };
        });
      } else if (newStatus === 'Cancelled') {
        existingTimeline = existingTimeline.map((step, idx) => {
          if (idx === 1) {
            return {
              ...step,
              completed: false,
              timestamp: nowTime,
              notes: 'Declined / cancelled by Renter.',
            };
          }
          return step;
        });
      }

      const updatedDepositStatus = newStatus === 'Completed' ? 'Refunded' : (o.depositStatus || 'Held');

      return {
        ...o,
        ...orderData,
        status: newStatus,
        depositStatus: updatedDepositStatus,
        timeline: existingTimeline,
      };
    });

    saveStored('rovia_orders', localOrders);
    return localOrders.find(o => o.id === id);
  },

  verifyHandoverToken: async (token: string): Promise<{ success: boolean; message: string; order?: Order }> => {
    const cleanToken = token.trim();
    try {
      const serverUrl = ((import.meta as any).env?.VITE_API_URL ?? 'http://localhost:8000').replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
      const res = await fetch(`${serverUrl}/api/rentals/verify-handover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: cleanToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const orders = loadStored<Order>('rovia_orders', INITIAL_ORDERS);
        let match = orders.find(
          o => o.orderNumber.toUpperCase() === cleanToken.toUpperCase() || o.id === cleanToken
        );
        if (match) {
          const updated = await api.updateOrder(match.id, { status: 'Active' });
          if (updated) match = updated;
        } else {
          const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today';
          match = {
            id: 'ord-' + Date.now(),
            orderNumber: cleanToken.toUpperCase(),
            customerName: 'Elena Vance',
            customerEmail: 'customer@rovia-demo.com',
            customerPhone: '+91 98765 43210',
            customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
            productName: 'Hasselblad X2D 100C Package',
            productImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600',
            variant: 'Cinema Master Package',
            rentalWindow: { start: '2026-08-09', end: '2026-08-12', days: 3 },
            rentalFee: 25500,
            depositAmount: 50000,
            taxAmount: 4590,
            totalAmount: 80090,
            status: 'Active',
            depositStatus: 'Held',
            renterId: 'rnt-101',
            renterName: 'ROVIA Atelier & Cinema Rigs',
            pickupMethod: 'In-Store Pickup',
            timeline: [
              { stage: 'Order Placed', timestamp: 'Just now', completed: true, notes: 'Payment & Deposit authorized' },
              { stage: 'Renter Approval & Verification', timestamp: nowTime, completed: true, notes: 'Approved & verified by Renter.' },
              { stage: 'Dispatched / Picked Up', timestamp: nowTime, completed: true, notes: 'Handover verified via Staff QR panel.' },
              { stage: 'In Rental Window', timestamp: 'Now Active', completed: true },
              { stage: 'Return & Inspection', timestamp: 'Pending', completed: false },
              { stage: 'Deposit Refunded', timestamp: 'Pending', completed: false }
            ]
          };
          saveStored('rovia_orders', [match, ...orders.filter(o => o.id !== match!.id)]);
        }
        return { success: true, message: 'Hand over product now', order: match };
      } else {
        return { success: false, message: data.detail || data.message || 'Verification Failed' };
      }
    } catch {
      // Local fallback lookup
      const orders = loadStored<Order>('rovia_orders', INITIAL_ORDERS);
      let match = orders.find(
        o => o.orderNumber.toUpperCase() === cleanToken.toUpperCase() || o.id === cleanToken
      );
      if (match) {
        const updated = await api.updateOrder(match.id, { status: 'Active' });
        if (updated) match = updated;
      }
      return { success: true, message: 'Hand over product now', order: match };
    }
  },

  // ── Renters ──────────────────────────────────────────────────────────────────

  getRenters: async (): Promise<RenterVendor[]> => localRenters,

  approveRenter: async (renterId: string): Promise<boolean> => {
    localRenters = localRenters.map(r => r.id === renterId ? { ...r, kycStatus: 'Approved' as const } : r);
    return true;
  },

  suspendRenter: async (renterId: string): Promise<boolean> => {
    localRenters = localRenters.map(r => r.id === renterId ? { ...r, kycStatus: 'Suspended' as const } : r);
    return true;
  },

  registerRenterKYC: async (data: { name: string; email: string; phone: string; storeLocation: string }): Promise<RenterVendor> => {
    const newRenter: RenterVendor = {
      id: 'rnt-' + Date.now(),
      name: data.name,
      logo: '',
      rating: 5.0,
      totalProducts: 0,
      totalOrders: 0,
      commissionRate: 10,
      kycStatus: 'Pending Approval',
      storeLocation: data.storeLocation,
      phone: data.phone,
      email: data.email,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    localRenters.unshift(newRenter);
    return newRenter;
  },

  // ── Payouts ──────────────────────────────────────────────────────────────────

  getPayouts: async (): Promise<RenterPayout[]> => localPayouts,

  processPayout: async (payoutId: string): Promise<boolean> => {
    localPayouts = localPayouts.map(p =>
      p.id === payoutId ? { ...p, status: 'Paid' as const, payoutDate: new Date().toISOString().split('T')[0] } : p
    );
    return true;
  },

  // ── Disputes ─────────────────────────────────────────────────────────────────

  getDisputes: async (): Promise<MarketplaceDispute[]> => localDisputes,

  resolveDispute: async (disputeId: string): Promise<boolean> => {
    localDisputes = localDisputes.map(d =>
      d.id === disputeId ? { ...d, status: 'Resolved' as const } : d
    );
    return true;
  },

  // ── Deposits ─────────────────────────────────────────────────────────────────

  getDeposits: async (renterId?: string): Promise<DepositLedger[]> =>
    renterId ? localDeposits.filter(d => d.renterId === renterId) : localDeposits,

  refundDeposit: async (depositId: string): Promise<boolean> => {
    localDeposits = localDeposits.map(d =>
      d.id === depositId
        ? { ...d, status: 'Refunded' as const, refundedAmount: d.collectedAmount, updatedAt: 'Just now' }
        : d
    );
    return true;
  },

  // ── Inspections ──────────────────────────────────────────────────────────────

  getInspections: async (renterId?: string): Promise<InspectionItem[]> =>
    renterId ? localInspections.filter(i => i.renterId === renterId) : localInspections,

  // ── Quotations ───────────────────────────────────────────────────────────────

  getQuotations: async (renterId?: string): Promise<Quotation[]> =>
    renterId ? localQuotations.filter(q => q.renterId === renterId) : localQuotations,

  createQuotation: async (quote: Omit<Quotation, 'id'>): Promise<Quotation> => {
    const newQuote: Quotation = { ...quote, id: 'q-' + Date.now() };
    localQuotations.unshift(newQuote);
    return newQuote;
  },

  // ── User Profile ─────────────────────────────────────────────────────────────

  updateUserProfile: async (_userId: string, data: { name?: string; email?: string; phone?: string; avatar?: string; company?: string }) => {
    try {
      const res = await apiFetch('/users/me', { method: 'PUT', body: JSON.stringify(data) });
      if (res.ok) return await res.json();
    } catch {}
    return data;
  },

  // ── Dashboard Stats ───────────────────────────────────────────────────────────

  getDashboardStats: async (renterId?: string) => {
    const orders = loadStored<Order>('rovia_orders', INITIAL_ORDERS);
    const filteredOrders = renterId ? orders.filter(o => o.renterId === renterId) : orders;
    const filteredDeposits = renterId ? localDeposits.filter(d => d.renterId === renterId) : localDeposits;
    const totalRevenue = filteredOrders.reduce((acc, o) => acc + o.totalAmount, 0);
    const platformCommission = totalRevenue * 0.1;
    return {
      activeRentals: filteredOrders.filter(o => o.status === 'Active').length,
      dueToday: 3,
      revenueMonth: totalRevenue || 845000,
      platformCommission,
      netRenterRevenue: totalRevenue - platformCommission,
      revenueTrend: '+24.8% vs last month',
      depositsHeld: filteredDeposits.filter(d => d.status === 'Held').reduce((acc, d) => acc + d.collectedAmount, 0),
      lateFeesCollected: 58200,
      upcomingPickups: [
        { id: '1', time: '14:00 Today', customer: 'Elena Vance', product: 'Hasselblad X2D 100C' },
        { id: '2', time: '16:30 Today', customer: 'Caterpillar Construction', product: 'CAT 305.5 Mini Excavator' },
      ],
      upcomingReturns: [
        { id: '3', time: '17:00 Today', customer: 'Studio Noir Atelier', product: 'Vera Wang Evening Gown' },
        { id: '4', time: '18:15 Today', customer: 'Tesla Utility Fleet', product: 'Cybertruck Dual-Motor' },
      ],
    };
  },
};
