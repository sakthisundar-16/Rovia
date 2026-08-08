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

const API_BASE_URL = 'http://localhost:8000/api/v1';

let localProducts: Product[] = [...UNIVERSAL_PRODUCTS];
let localOrders: Order[] = [...INITIAL_ORDERS];
let localDeposits: DepositLedger[] = [...INITIAL_DEPOSITS];
let localInspections: InspectionItem[] = [...INITIAL_INSPECTIONS];
let localQuotations: Quotation[] = [...INITIAL_QUOTATIONS];
let localRenters: RenterVendor[] = [...MARKETPLACE_RENTERS];
let localPayouts: RenterPayout[] = [...MARKETPLACE_PAYOUTS];
let localDisputes: MarketplaceDispute[] = [...MARKETPLACE_DISPUTES];

export const api = {
  // Marketplace Renters / Sellers API
  getRenters: async (): Promise<RenterVendor[]> => {
    return localRenters;
  },

  approveRenter: async (renterId: string): Promise<boolean> => {
    localRenters = localRenters.map((r) =>
      r.id === renterId ? { ...r, kycStatus: 'Approved' as const } : r
    );
    return true;
  },

  suspendRenter: async (renterId: string): Promise<boolean> => {
    localRenters = localRenters.map((r) =>
      r.id === renterId ? { ...r, kycStatus: 'Suspended' as const } : r
    );
    return true;
  },

  registerRenterKYC: async (data: { name: string; email: string; phone: string; storeLocation: string }): Promise<RenterVendor> => {
    const newRenter: RenterVendor = {
      id: 'rnt-' + Date.now(),
      name: data.name,
      logo: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400',
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

  // Marketplace Payouts API
  getPayouts: async (): Promise<RenterPayout[]> => {
    return localPayouts;
  },

  processPayout: async (payoutId: string): Promise<boolean> => {
    localPayouts = localPayouts.map((p) =>
      p.id === payoutId ? { ...p, status: 'Paid' as const, payoutDate: new Date().toISOString().split('T')[0] } : p
    );
    return true;
  },

  // Marketplace Disputes API
  getDisputes: async (): Promise<MarketplaceDispute[]> => {
    return localDisputes;
  },

  resolveDispute: async (disputeId: string): Promise<boolean> => {
    localDisputes = localDisputes.map((d) =>
      d.id === disputeId ? { ...d, status: 'Resolved' as const } : d
    );
    return true;
  },

  // Products API (Marketplace Aware: supports filtering by renterId)
  getProducts: async (renterId?: string): Promise<Product[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return renterId ? data.filter((p) => p.renterId === renterId) : data;
        }
      }
    } catch (err) {}

    return renterId ? localProducts.filter((p) => p.renterId === renterId) : localProducts;
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    return localProducts.find((p) => p.id === id);
  },

  createProduct: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const newProduct: Product = {
      ...productData,
      id: 'prod-' + Date.now(),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      if (response.ok) {
        const created = await response.json();
        localProducts.unshift(created);
        return created;
      }
    } catch (err) {}

    localProducts.unshift(newProduct);
    return newProduct;
  },

  // User Profile API
  updateUserProfile: async (userId: string, data: { name?: string; email?: string; phone?: string; avatar?: string; company?: string }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {}
    return data;
  },

  // Orders API (Marketplace Aware: scoped to renterId if present)
  getOrders: async (renterId?: string): Promise<Order[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/rentals`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return renterId ? data.filter((o) => o.renterId === renterId) : data;
        }
      }
    } catch (err) {}

    return renterId ? localOrders.filter((o) => o.renterId === renterId) : localOrders;
  },

  createOrder: async (orderData: Omit<Order, 'id'>): Promise<Order> => {
    const newOrder: Order = {
      ...orderData,
      id: 'ord-' + Date.now(),
    };
    localOrders.unshift(newOrder);
    return newOrder;
  },

  // Deposits API
  getDeposits: async (renterId?: string): Promise<DepositLedger[]> => {
    return renterId ? localDeposits.filter((d) => d.renterId === renterId) : localDeposits;
  },

  refundDeposit: async (depositId: string): Promise<boolean> => {
    localDeposits = localDeposits.map((d) =>
      d.id === depositId
        ? { ...d, status: 'Refunded' as const, refundedAmount: d.collectedAmount, updatedAt: 'Just now' }
        : d
    );
    return true;
  },

  // Inspections API
  getInspections: async (renterId?: string): Promise<InspectionItem[]> => {
    return renterId ? localInspections.filter((i) => i.renterId === renterId) : localInspections;
  },

  // Quotations API
  getQuotations: async (renterId?: string): Promise<Quotation[]> => {
    return renterId ? localQuotations.filter((q) => q.renterId === renterId) : localQuotations;
  },

  createQuotation: async (quote: Omit<Quotation, 'id'>): Promise<Quotation> => {
    const newQuote: Quotation = {
      ...quote,
      id: 'q-' + Date.now(),
    };
    localQuotations.unshift(newQuote);
    return newQuote;
  },

  // Dashboard Stats: Platform-Wide (Admin) vs Renter-Scoped (Renter)
  getDashboardStats: async (renterId?: string) => {
    const filteredOrders = renterId ? localOrders.filter((o) => o.renterId === renterId) : localOrders;
    const filteredDeposits = renterId ? localDeposits.filter((d) => d.renterId === renterId) : localDeposits;

    const totalRevenue = filteredOrders.reduce((acc, o) => acc + o.totalAmount, 0);
    const platformCommission = totalRevenue * 0.1; // 10% platform fee

    return {
      activeRentals: filteredOrders.filter((o) => o.status === 'Active').length + (renterId ? 4 : 12),
      dueToday: 3,
      revenueMonth: totalRevenue || 845000,
      platformCommission: platformCommission,
      netRenterRevenue: totalRevenue - platformCommission,
      revenueTrend: '+24.8% vs last month',
      depositsHeld: filteredDeposits.filter((d) => d.status === 'Held').reduce((acc, d) => acc + d.collectedAmount, 0),
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
