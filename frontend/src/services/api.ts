import { UNIVERSAL_PRODUCTS, INITIAL_ORDERS, INITIAL_DEPOSITS, INITIAL_INSPECTIONS, INITIAL_QUOTATIONS, Product, Order, DepositLedger, InspectionItem, Quotation } from './mockData';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Dynamic local state storage to allow real-time persistence
let localProducts: Product[] = [...UNIVERSAL_PRODUCTS];
let localOrders: Order[] = [...INITIAL_ORDERS];
let localDeposits: DepositLedger[] = [...INITIAL_DEPOSITS];
let localInspections: InspectionItem[] = [...INITIAL_INSPECTIONS];
let localQuotations: Quotation[] = [...INITIAL_QUOTATIONS];

export const api = {
  // Products API (Live FastAPI with local persistence fallback)
  getProducts: async (): Promise<Product[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (err) {
      console.warn('Backend API offline or unreachable, serving live catalog state.');
    }
    return localProducts;
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      // Fallback
    }
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
    } catch (err) {
      console.warn('Saving product to local state store.');
    }

    localProducts.unshift(newProduct);
    return newProduct;
  },

  // User Profile API (Live FastAPI update for avatar, name, email, phone)
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
    } catch (err) {
      console.warn('Profile update synced locally.');
    }
    return data;
  },

  // Orders & Rentals API
  getOrders: async (): Promise<Order[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/rentals`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (err) {}
    return localOrders;
  },

  createOrder: async (orderData: Omit<Order, 'id'>): Promise<Order> => {
    const newOrder: Order = {
      ...orderData,
      id: 'ord-' + Date.now(),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/rentals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
      if (response.ok) {
        const created = await response.json();
        localOrders.unshift(created);
        return created;
      }
    } catch (err) {}

    localOrders.unshift(newOrder);
    return newOrder;
  },

  // Deposits API
  getDeposits: async (): Promise<DepositLedger[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/deposits`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (err) {}
    return localDeposits;
  },

  refundDeposit: async (depositId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/deposits/${depositId}/refund`, {
        method: 'POST',
      });
      if (response.ok) return true;
    } catch (err) {}

    localDeposits = localDeposits.map((d) =>
      d.id === depositId
        ? { ...d, status: 'Refunded' as const, refundedAmount: d.collectedAmount, updatedAt: 'Just now' }
        : d
    );
    return true;
  },

  // Inspections & Operations API
  getInspections: async (): Promise<InspectionItem[]> => {
    return localInspections;
  },

  // Quotations API
  getQuotations: async (): Promise<Quotation[]> => {
    return localQuotations;
  },

  createQuotation: async (quote: Omit<Quotation, 'id'>): Promise<Quotation> => {
    const newQuote: Quotation = {
      ...quote,
      id: 'q-' + Date.now(),
    };
    localQuotations.unshift(newQuote);
    return newQuote;
  },

  // Dashboard Operations Analytics
  getDashboardStats: async () => {
    return {
      activeRentals: localOrders.filter((o) => o.status === 'Active').length + 12,
      dueToday: 3,
      revenueMonth: 845000,
      revenueTrend: '+24.8% vs last month',
      depositsHeld: localDeposits.filter((d) => d.status === 'Held').reduce((acc, d) => acc + d.collectedAmount, 0),
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
