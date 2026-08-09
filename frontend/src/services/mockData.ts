export interface RenterVendor {
  id: string;
  name: string;
  logo: string;
  rating: number;
  totalProducts: number;
  totalOrders: number;
  commissionRate: number; // e.g. 10% platform commission
  kycStatus: 'Approved' | 'Pending Approval' | 'Suspended';
  storeLocation: string;
  phone: string;
  email: string;
  joinedDate: string;
}

export interface RenterPayout {
  id: string;
  renterId: string;
  renterName: string;
  period: string;
  grossRentalRevenue: number;
  platformCommission: number;
  netPayout: number;
  status: 'Paid' | 'Processing' | 'Pending';
  payoutDate: string;
}

export interface MarketplaceDispute {
  id: string;
  orderNumber: string;
  customerName: string;
  renterName: string;
  issueType: 'Damage Claim' | 'Late Fee Penalty Dispute' | 'Non-Delivery';
  claimedAmount: number;
  status: 'Open' | 'Resolved' | 'Under Admin Review';
  createdAt: string;
}

export interface Product {
  id: string;
  renterId: string;
  renterName: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  color: string;
  dailyRate: number;
  securityDeposit: number;
  stock: number;
  available: number;
  rating: number;
  image: string;
  gallery: string[];
  description: string;
  specs: Record<string, string>;
  variants: string[];
}

export interface OrderTimeline {
  stage: string;
  timestamp: string;
  completed: boolean;
  notes?: string;
}

export interface Order {
  id: string;
  renterId: string;
  renterName: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAvatar: string;
  productName: string;
  productImage: string;
  variant: string;
  rentalWindow: {
    start: string;
    end: string;
    days: number;
  };
  rentalFee: number;
  depositAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: 'Active' | 'Upcoming' | 'Past' | 'Overdue' | 'Pending Approval' | 'Pending Return Inspection' | 'Return Requested' | 'Returning' | 'Completed' | 'Cancelled';
  depositStatus: 'Held' | 'Refunded' | 'Partially Deducted' | 'Deducted';
  deductionAmount?: number;
  deductionReason?: string;
  daysOverdue?: number;
  estimatedPenalty?: number;
  timeline: OrderTimeline[];
  pickupMethod: 'Delivery' | 'Store Pickup' | 'In-Store Pickup';
}

export interface DepositLedger {
  id: string;
  renterId: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerAvatar: string;
  collectedAmount: number;
  status: 'Held' | 'Refunded' | 'Partially Deducted';
  refundedAmount: number;
  deductedAmount: number;
  deductionReason?: string;
  approvedBy: string;
  updatedAt: string;
}

export interface InspectionItem {
  id: string;
  renterId: string;
  orderNumber: string;
  customerName: string;
  productName: string;
  productImage: string;
  scheduledTime: string;
  type: 'Pickup' | 'Return';
  status: 'Pending' | 'Completed' | 'In Progress';
  conditionRating?: 'Pristine' | 'Good' | 'Minor Wear' | 'Damaged';
  damageReported?: boolean;
  damageDescription?: string;
  damageCostEstimate?: number;
  checklist: { task: string; done: boolean }[];
}

export interface Quotation {
  id: string;
  renterId: string;
  quoteNumber: string;
  customerName: string;
  customerEmail: string;
  dateCreated: string;
  validUntil: string;
  status: 'Draft' | 'Sent' | 'Confirmed' | 'Expired';
  template: 'Standard Letterhead' | 'Gothic Luxury Event' | 'Corporate Film Production';
  items: { description: string; rate: number; days: number; deposit: number; total: number }[];
  subtotal: number;
  depositTotal: number;
  total: number;
}

export const MARKETPLACE_RENTERS: RenterVendor[] = [
  {
    id: 'rnt-101',
    name: 'ROVIA Atelier & Cinema Rigs',
    logo: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400',
    rating: 4.95,
    totalProducts: 14,
    totalOrders: 182,
    commissionRate: 10,
    kycStatus: 'Approved',
    storeLocation: 'Suite 402, Lower Parel, Mumbai',
    phone: '+91 98201 11223',
    email: 'ops@rovia-atelier.com',
    joinedDate: '2025-11-10'
  },
  {
    id: 'rnt-102',
    name: 'Urban Gear Rentals & Heavy Tech',
    logo: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=400',
    rating: 4.88,
    totalProducts: 22,
    totalOrders: 240,
    commissionRate: 10,
    kycStatus: 'Approved',
    storeLocation: 'MIDC Industrial Zone, Goregaon East, Mumbai',
    phone: '+91 98300 22110',
    email: 'contact@urbangear-rentals.in',
    joinedDate: '2026-01-15'
  },
  {
    id: 'rnt-103',
    name: 'Haute Couture & Event Props Co.',
    logo: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=400',
    rating: 5.0,
    totalProducts: 9,
    totalOrders: 95,
    commissionRate: 12,
    kycStatus: 'Approved',
    storeLocation: 'Bandra West Fashion District, Mumbai',
    phone: '+91 98444 33221',
    email: 'rentals@haute-props.in',
    joinedDate: '2026-02-01'
  },
  {
    id: 'rnt-104',
    name: 'Apex Machinery & Mobility Fleet',
    logo: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=400',
    rating: 4.75,
    totalProducts: 6,
    totalOrders: 42,
    commissionRate: 10,
    kycStatus: 'Pending Approval',
    storeLocation: 'Thane Transport Hub, Mumbai',
    phone: '+91 98990 77665',
    email: 'dispatch@apex-mobility.com',
    joinedDate: '2026-08-02'
  }
];

export const MARKETPLACE_PAYOUTS: RenterPayout[] = [
  {
    id: 'pay-701',
    renterId: 'rnt-101',
    renterName: 'ROVIA Atelier & Cinema Rigs',
    period: 'July 2026',
    grossRentalRevenue: 450000,
    platformCommission: 45000,
    netPayout: 405000,
    status: 'Paid',
    payoutDate: '2026-08-01'
  },
  {
    id: 'pay-702',
    renterId: 'rnt-102',
    renterName: 'Urban Gear Rentals & Heavy Tech',
    period: 'July 2026',
    grossRentalRevenue: 680000,
    platformCommission: 68000,
    netPayout: 612000,
    status: 'Paid',
    payoutDate: '2026-08-01'
  },
  {
    id: 'pay-703',
    renterId: 'rnt-103',
    renterName: 'Haute Couture & Event Props Co.',
    period: 'August 1-7, 2026',
    grossRentalRevenue: 185000,
    platformCommission: 22200,
    netPayout: 162800,
    status: 'Processing',
    payoutDate: '2026-08-10'
  }
];

export const MARKETPLACE_DISPUTES: MarketplaceDispute[] = [
  {
    id: 'disp-801',
    orderNumber: 'ROV-2026-879',
    customerName: 'Karan Mehta',
    renterName: 'Urban Gear Rentals & Heavy Tech',
    issueType: 'Late Fee Penalty Dispute',
    claimedAmount: 45000,
    status: 'Under Admin Review',
    createdAt: '2026-08-06 11:20'
  }
];

export const UNIVERSAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    renterId: 'rnt-101',
    renterName: 'ROVIA Atelier & Cinema Rigs',
    sku: 'HAS-X2D-100',
    name: 'Hasselblad X2D 100C Medium Format Camera',
    category: 'Cameras & Lenses',
    brand: 'Hasselblad',
    color: 'Matte Obsidian',
    dailyRate: 4500,
    securityDeposit: 25000,
    stock: 5,
    available: 3,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=800'
    ],
    description: '100-megapixel BSI CMOS sensor with 15-stop dynamic range and 5-axis 7-stop in-body image stabilization.',
    specs: {
      'Sensor Type': '100MP Medium Format BSI CMOS',
      'Dynamic Range': '15 Stops',
      'Storage': '1TB SSD Built-In'
    },
    variants: ['100MP Kit / Matte Obsidian', 'XCD 38mm Lens Bundle']
  },
  {
    id: 'prod-2',
    renterId: 'rnt-102',
    renterName: 'Urban Gear Rentals & Heavy Tech',
    sku: 'CAT-305-EXCAV',
    name: 'Caterpillar CAT 305.5 Mini Hydraulic Excavator',
    category: 'Heavy Machinery',
    brand: 'Caterpillar',
    color: 'Cat Industrial Yellow',
    dailyRate: 15000,
    securityDeposit: 80000,
    stock: 2,
    available: 1,
    rating: 4.95,
    image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Compact excavator delivering maximum power and performance for site preparation, trenching, and construction.',
    specs: {
      'Engine Power': '45.0 HP C2.4 Turbo',
      'Operating Weight': '5,200 kg',
      'Max Dig Depth': '3.47 meters'
    },
    variants: ['Standard Bucket Kit', 'Hydraulic Breaker Attachment']
  },
  {
    id: 'prod-3',
    renterId: 'rnt-103',
    renterName: 'Haute Couture & Event Props Co.',
    sku: 'VERA-WANG-GOWN',
    name: 'Vera Wang Haute Couture Evening Gown & Silk Cape',
    category: 'Designer Fashion',
    brand: 'Vera Wang',
    color: 'Plum Velvet & Noir Silk',
    dailyRate: 6800,
    securityDeposit: 35000,
    stock: 3,
    available: 2,
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Handcrafted floor-length velvet evening gown with detachable silk cape designed for red carpet galas and luxury fashion shoots.',
    specs: {
      'Fabric': '100% Italian Silk Velvet',
      'Size Options': 'UK 8 / US 4 (Alterable waist)',
      'Care Included': 'Specialized dry cleaning included'
    },
    variants: ['Size UK 8 / Noir Silk', 'Size UK 10 / Plum Velvet']
  },
  {
    id: 'prod-4',
    renterId: 'rnt-104',
    renterName: 'Apex Machinery & Mobility Fleet',
    sku: 'TESLA-CYBERTRUCK',
    name: 'Tesla Cybertruck Dual-Motor AWD Utility Rig',
    category: 'Vehicles & Mobility',
    brand: 'Tesla',
    color: 'Stainless Steel Armor',
    dailyRate: 22000,
    securityDeposit: 100000,
    stock: 2,
    available: 1,
    rating: 4.85,
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'All-electric ultra-hard 30X cold-rolled stainless steel exoskeleton vehicle for commercial shoots and high-profile transport.',
    specs: {
      'Acceleration': '0-60 mph in 4.1s',
      'Towing Capacity': '11,000 lbs',
      'Onboard Power': '120V / 240V Outlets (11.5kW power export)'
    },
    variants: ['Dual Motor AWD', 'Full Self-Driving Package']
  },
  {
    id: 'prod-5',
    renterId: 'rnt-102',
    renterName: 'Urban Gear Rentals & Heavy Tech',
    sku: 'PHILIPS-OXY-RESP',
    name: 'Philips SimplyGo Portable Oxygen Concentrator',
    category: 'Medical Equipment',
    brand: 'Philips Respironics',
    color: 'Medical Slate White',
    dailyRate: 2800,
    securityDeposit: 15000,
    stock: 6,
    available: 4,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'FAA-approved lightweight medical oxygen concentrator delivering continuous flow and pulse dose delivery.',
    specs: {
      'Oxygen Output': 'Up to 2 LPM Continuous / 6 LPM Pulse',
      'Battery Life': 'Dual rechargeable lithium battery pack',
      'Weight': '4.5 kg carrying cart included'
    },
    variants: ['Dual Battery Mobile Kit', 'Home & Travel Suite']
  },
  {
    id: 'prod-6',
    renterId: 'rnt-101',
    renterName: 'ROVIA Atelier & Cinema Rigs',
    sku: 'MACBOOK-M3-MAX',
    name: 'Apple MacBook Pro 16" M3 Max 128GB Workstation',
    category: 'Electronics & Tech',
    brand: 'Apple',
    color: 'Space Black',
    dailyRate: 3500,
    securityDeposit: 20000,
    stock: 8,
    available: 6,
    rating: 4.95,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Flagship M3 Max 16-Core CPU, 40-Core GPU, 128GB Unified Memory, and 4TB SSD pre-loaded with DaVinci Resolve Studio & Premiere Pro.',
    specs: {
      'Processor': 'Apple M3 Max (16-Core CPU / 40-Core GPU)',
      'RAM': '128GB Unified Memory',
      'Display': '16.2" Liquid Retina XDR 120Hz'
    },
    variants: ['128GB RAM / 4TB SSD Editing Rig', 'DIT Cart Mobile Bundle']
  },
  {
    id: 'prod-7',
    renterId: 'rnt-102',
    renterName: 'Urban Gear Rentals & Heavy Tech',
    sku: 'MSR-CAMP-TENT',
    name: 'MSR Expedition 4-Season Geodesic Camping Rig',
    category: 'Outdoor & Camping',
    brand: 'MSR Mountaineering',
    color: 'Alpine Orange & Graphite',
    dailyRate: 1800,
    securityDeposit: 10000,
    stock: 10,
    available: 8,
    rating: 4.88,
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Extreme-weather 4-person geodesic expedition tent with titanium stakes, zero-degree sleeping bags, and portable stove.',
    specs: {
      'Season Rating': '4-Season Alpine Expedition',
      'Capacity': '4 Persons',
      'Included Gear': '2x Sleeping Pads, Titanium Stove, LED Lantern'
    },
    variants: ['4-Person Alpine Expedition Pack', '2-Person Ultralight Pack']
  },
  {
    id: 'prod-8',
    renterId: 'rnt-103',
    renterName: 'Haute Couture & Event Props Co.',
    sku: 'LUX-CHAIR-NOIR',
    name: 'Gothic Noir Editorial Lounge Armchair & Velvet Set',
    category: 'Event Supplies',
    brand: 'ROVIA Atelier',
    color: 'Velvet Noir / Antiqued Brass',
    dailyRate: 3200,
    securityDeposit: 15000,
    stock: 4,
    available: 3,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Handcrafted velvet lounge chair designed for luxury events, high-fashion photo shoots, and corporate galas.',
    specs: {
      'Material': 'High-Density Velvet & Hand-Forged Brass',
      'Dimensions': '90cm x 85cm x 110cm'
    },
    variants: ['Deep Velvet Noir', 'Burgundy Plum Velvet']
  }
];

export const INITIAL_PRODUCTS = UNIVERSAL_PRODUCTS;

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    renterId: 'rnt-101',
    renterName: 'ROVIA Atelier & Cinema Rigs',
    orderNumber: 'ROV-2026-881',
    customerName: 'Elena Vance',
    customerEmail: 'elena.vance@studio-noir.com',
    customerPhone: '+91 98765 43210',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    productName: 'Hasselblad X2D 100C Medium Format Camera',
    productImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600',
    variant: '100MP Kit / Matte Obsidian',
    rentalWindow: {
      start: '2026-08-08',
      end: '2026-08-11',
      days: 3
    },
    rentalFee: 13500,
    depositAmount: 25000,
    taxAmount: 2430,
    totalAmount: 40930,
    status: 'Active',
    depositStatus: 'Held',
    pickupMethod: 'Delivery',
    timeline: [
      { stage: 'Order Placed', timestamp: '2026-08-07 14:30', completed: true, notes: 'Payment & Deposit authorized' },
      { stage: 'Quality Inspection', timestamp: '2026-08-07 16:10', completed: true, notes: 'Pristine status confirmed' },
      { stage: 'Dispatched / Picked Up', timestamp: '2026-08-08 09:15', completed: true, notes: 'Courier tracking #RV-8812' },
      { stage: 'In Rental Window', timestamp: '2026-08-08 10:00', completed: true, notes: 'Due back on Aug 11, 2026' },
      { stage: 'Return & Inspection', timestamp: 'Pending', completed: false },
      { stage: 'Deposit Refunded', timestamp: 'Pending', completed: false }
    ]
  },
  {
    id: 'ord-1002',
    renterId: 'rnt-102',
    renterName: 'Urban Gear Rentals & Heavy Tech',
    orderNumber: 'ROV-2026-879',
    customerName: 'Karan Mehta',
    customerEmail: 'karan@mumbai-cinematics.in',
    customerPhone: '+91 98200 44556',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    productName: 'Caterpillar CAT 305.5 Mini Hydraulic Excavator',
    productImage: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=600',
    variant: 'Standard Bucket Kit',
    rentalWindow: {
      start: '2026-08-01',
      end: '2026-08-05',
      days: 4
    },
    rentalFee: 60000,
    depositAmount: 80000,
    taxAmount: 10800,
    totalAmount: 150800,
    status: 'Overdue',
    depositStatus: 'Held',
    daysOverdue: 3,
    estimatedPenalty: 45000,
    pickupMethod: 'Store Pickup',
    timeline: [
      { stage: 'Order Placed', timestamp: '2026-07-30 11:20', completed: true },
      { stage: 'Quality Inspection', timestamp: '2026-07-31 15:00', completed: true },
      { stage: 'Dispatched / Picked Up', timestamp: '2026-08-01 10:30', completed: true },
      { stage: 'In Rental Window', timestamp: '2026-08-01 11:00', completed: true },
      { stage: 'Return & Inspection', timestamp: 'OVERDUE (3 Days)', completed: false, notes: 'Customer notified via SMS/Email' },
      { stage: 'Deposit Refunded', timestamp: 'Pending', completed: false }
    ]
  }
];

export const INITIAL_DEPOSITS: DepositLedger[] = [
  {
    id: 'dep-901',
    renterId: 'rnt-101',
    orderId: 'ord-1001',
    orderNumber: 'ROV-2026-881',
    customerName: 'Elena Vance',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    collectedAmount: 25000,
    status: 'Held',
    refundedAmount: 0,
    deductedAmount: 0,
    approvedBy: 'System Auto-Lock',
    updatedAt: '2026-08-07 14:30'
  },
  {
    id: 'dep-902',
    renterId: 'rnt-102',
    orderId: 'ord-1002',
    orderNumber: 'ROV-2026-879',
    customerName: 'Karan Mehta',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    collectedAmount: 80000,
    status: 'Held',
    refundedAmount: 0,
    deductedAmount: 0,
    deductionReason: 'Overdue Penalty Pending Calculation',
    approvedBy: 'Marcus Sterling',
    updatedAt: '2026-08-06 09:00'
  }
];

export const INITIAL_INSPECTIONS: InspectionItem[] = [
  {
    id: 'insp-501',
    renterId: 'rnt-101',
    orderNumber: 'ROV-2026-881',
    customerName: 'Elena Vance',
    productName: 'Hasselblad X2D 100C',
    productImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600',
    scheduledTime: '17:00 Today',
    type: 'Pickup',
    status: 'In Progress',
    checklist: [
      { task: 'Check lens element for scratches or dust', done: true },
      { task: 'Verify 1TB internal SSD format', done: true },
      { task: 'Include 2x batteries and dual charger', done: true },
      { task: 'Inspect pelican hard case seals', done: false }
    ]
  }
];

export const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'q-201',
    renterId: 'rnt-101',
    quoteNumber: 'Q-2026-044',
    customerName: 'Studio Noir Atelier',
    customerEmail: 'elena.vance@studio-noir.com',
    dateCreated: '2026-08-05',
    validUntil: '2026-08-15',
    status: 'Sent',
    template: 'Gothic Luxury Event',
    items: [
      { description: 'Hasselblad X2D 100C Package (4 Days)', rate: 4500, days: 4, deposit: 25000, total: 18000 },
      { description: 'Tesla Cybertruck Dual-Motor AWD (2 Days)', rate: 22000, days: 2, deposit: 100000, total: 44000 }
    ],
    subtotal: 62000,
    depositTotal: 125000,
    total: 187000
  }
];
