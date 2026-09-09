import React, { useState } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';

// Navbars
import { CustomerNavbar } from './components/layout/CustomerNavbar';
import { RenterNavbar } from './components/layout/RenterNavbar';
import { AdminNavbar } from './components/layout/AdminNavbar';
import { AdminTopbar } from './components/layout/AdminTopbar';
import { CustomerFooter } from './components/layout/CustomerFooter';

// Customer Pages
import { Splash } from './pages/customer/Splash';
import { Landing } from './pages/customer/Landing';
import { Auth } from './pages/customer/Auth';
import { Catalog } from './pages/customer/Catalog';
import { ProductDetail } from './pages/customer/ProductDetail';
import { Cart } from './pages/customer/Cart';
import { Checkout } from './pages/customer/Checkout';
import { MyRentals } from './pages/customer/MyRentals';
import { OrderDetail } from './pages/customer/OrderDetail';
import { Profile } from './pages/customer/Profile';
import { ReturnFlow } from './pages/customer/ReturnFlow';

// Admin / Renter Pages
import { Dashboard } from './pages/admin/Dashboard';
import { Renters } from './pages/admin/Renters';
import { Payouts } from './pages/admin/Payouts';
import { Disputes } from './pages/admin/Disputes';
import { Quotations } from './pages/admin/Quotations';
import { Orders } from './pages/admin/Orders';
import { PickupReturn } from './pages/admin/PickupReturn';
import { Deposits } from './pages/admin/Deposits';
import { LateFees } from './pages/admin/LateFees';
import { Products } from './pages/admin/Products';
import { Customers } from './pages/admin/Customers';
import { Reports } from './pages/admin/Reports';
import { Settings } from './pages/admin/Settings';

// Property Intelligence & Map Pages
import { PropertyDiscoveryMap } from './pages/customer/PropertyDiscoveryMap';
import { LandlordPortfolioMap } from './pages/renter/LandlordPortfolioMap';
import { AdminGeoAnalytics } from './pages/admin/AdminGeoAnalytics';

const MainAppContent: React.FC = () => {
  const { mode, switchMode } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [customerTab, setCustomerTab] = useState('landing');
  const [adminTab, setAdminTab] = useState('dashboard');

  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(undefined);

  const [adminMobileOpen, setAdminMobileOpen] = useState(false);

  const viewStorefront = () => {
    setCustomerTab('catalog');
    switchMode('customer');
    setAdminMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCustomerNavigate = (tab: string, id?: string) => {
    setCustomerTab(tab);
    if (id) {
      if (tab === 'product-detail') setSelectedProductId(id);
      if (tab === 'order-detail') setSelectedOrderId(id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminNavigate = (tab: string, id?: string) => {
    setAdminTab(tab);
    if (id) setSelectedOrderId(id);
    setAdminMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Splash ──────────────────────────────────────────────
  if (showSplash) {
    return <Splash onFinish={() => setShowSplash(false)} />;
  }

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Operations Dashboard';
      case 'orders': return 'Rental Orders & QR Approvals';
      case 'products': return 'Product & Rate Matrix';
      case 'pickup-return': return 'OpenCV Return Damage Verification';
      case 'deposits': return 'Security Deposits & Escrow';
      case 'late-fees': return 'Automated Late Fee Engine';
      case 'payouts': return 'Earnings & Bank Settlements';
      case 'quotations': return 'Rental Quotations';
      case 'renters': return 'Partner Renter Network';
      case 'customers': return 'Customer Directory & Trust Scores';
      case 'disputes': return 'Damage Claims & Resolution';
      case 'reports': return 'Financial & Inventory Analytics';
      case 'geo-analytics': return 'Geographic Oversight & Locality Analytics';
      case 'portfolio-map': return 'Portfolio Discovery & Status Map';
      case 'property-map': return 'Property Discovery & Intelligence Map';
      case 'settings': return 'Operations Settings';
      case 'profile': return 'My Account Profile';
      default: return 'Operations Console';
    }
  };

  // ── ADMIN CONSOLE (dark navy navbar) ────────────────────
  if (mode === 'admin') {
    return (
      <div className="min-h-screen flex antialiased w-full overflow-x-hidden">
        <AdminNavbar
          currentTab={adminTab}
          onNavigate={handleAdminNavigate}
          mobileOpen={adminMobileOpen}
          onCloseMobile={() => setAdminMobileOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0 w-full overflow-y-auto overflow-x-hidden">
          <AdminTopbar
            mode="admin"
            title={getTabTitle(adminTab)}
            onNavigate={handleAdminNavigate}
            onToggleMobileSidebar={() => setAdminMobileOpen(prev => !prev)}
          />
          <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {adminTab === 'dashboard' && <Dashboard onNavigate={handleAdminNavigate} />}
            {adminTab === 'renters' && <Renters />}
            {adminTab === 'payouts' && <Payouts />}
            {adminTab === 'disputes' && <Disputes />}
            {adminTab === 'quotations' && <Quotations />}
            {adminTab === 'orders' && <Orders selectedOrderId={selectedOrderId} />}
            {adminTab === 'pickup-return' && <PickupReturn />}
            {adminTab === 'deposits' && <Deposits />}
            {adminTab === 'late-fees' && <LateFees />}
            {adminTab === 'products' && <Products />}
            {adminTab === 'customers' && <Customers />}
            {adminTab === 'reports' && <Reports />}
            {adminTab === 'geo-analytics' && <AdminGeoAnalytics />}
            {adminTab === 'settings' && <Settings />}
            {adminTab === 'profile' && <Profile />}
          </main>
        </div>
      </div>
    );
  }

  // ── RENTER CONSOLE (dark charcoal amber navbar) ──────────
  if (mode === 'renter') {
    return (
      <div className="min-h-screen flex antialiased w-full overflow-x-hidden">
        <RenterNavbar
          currentTab={adminTab}
          onNavigate={handleAdminNavigate}
          onViewStorefront={viewStorefront}
          mobileOpen={adminMobileOpen}
          onCloseMobile={() => setAdminMobileOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0 w-full overflow-y-auto overflow-x-hidden">
          <AdminTopbar
            mode="renter"
            title={getTabTitle(adminTab)}
            onNavigate={handleAdminNavigate}
            onToggleMobileSidebar={() => setAdminMobileOpen(prev => !prev)}
          />
          <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {adminTab === 'dashboard' && <Dashboard onNavigate={handleAdminNavigate} />}
            {adminTab === 'portfolio-map' && <LandlordPortfolioMap />}
            {adminTab === 'products' && <Products />}
            {adminTab === 'orders' && <Orders selectedOrderId={selectedOrderId} />}
            {adminTab === 'pickup-return' && <PickupReturn />}
            {adminTab === 'deposits' && <Deposits />}
            {adminTab === 'late-fees' && <LateFees />}
            {adminTab === 'payouts' && <Payouts />}
            {adminTab === 'quotations' && <Quotations />}
            {adminTab === 'settings' && <Settings />}
            {adminTab === 'profile' && <Profile />}
          </main>
        </div>
      </div>
    );
  }

  // ── LANDING PAGE (no navbar — immersive) ─────────────────
  if (customerTab === 'landing') {
    return (
      <div className="min-h-screen flex flex-col justify-between transition-colors duration-300">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Landing onNavigate={handleCustomerNavigate} />
        </main>
        <CustomerFooter />
      </div>
    );
  }

  // ── CUSTOMER PORTAL (green-accent navbar) ────────────────
  return (
    <div className="min-h-screen flex flex-col justify-between transition-colors duration-300">
      <CustomerNavbar currentTab={customerTab} onNavigate={handleCustomerNavigate} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {customerTab === 'auth' && (
          <Auth
            onSuccess={(role) => {
              if (role === 'customer') {
                handleCustomerNavigate('catalog');
              } else {
                handleAdminNavigate('dashboard');
              }
            }}
          />
        )}
        {customerTab === 'catalog' && <Catalog onNavigate={handleCustomerNavigate} />}
        {customerTab === 'property-map' && <PropertyDiscoveryMap />}
        {customerTab === 'product-detail' && (
          <ProductDetail productId={selectedProductId} onNavigate={handleCustomerNavigate} />
        )}
        {customerTab === 'cart' && <Cart onNavigate={handleCustomerNavigate} />}
        {customerTab === 'checkout' && <Checkout onNavigate={handleCustomerNavigate} />}
        {customerTab === 'my-rentals' && <MyRentals onNavigate={handleCustomerNavigate} />}
        {customerTab === 'order-detail' && (
          <OrderDetail orderId={selectedOrderId} onNavigate={handleCustomerNavigate} />
        )}
        {customerTab === 'profile' && <Profile />}
        {customerTab === 'trust-score' && <Profile highlightTrustScore={true} />}
        {customerTab === 'return-flow' && <ReturnFlow onNavigate={handleCustomerNavigate} />}
      </main>
      <CustomerFooter />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <MainAppContent />
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
