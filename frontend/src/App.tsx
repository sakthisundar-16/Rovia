import React, { useState } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';

// Navbars
import { CustomerNavbar } from './components/layout/CustomerNavbar';
import { RenterNavbar } from './components/layout/RenterNavbar';
import { AdminNavbar } from './components/layout/AdminNavbar';
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

const MainAppContent: React.FC = () => {
  const { mode, switchMode } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [customerTab, setCustomerTab] = useState('landing');
  const [adminTab, setAdminTab] = useState('dashboard');

  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(undefined);

  const viewStorefront = () => {
    setCustomerTab('catalog');
    switchMode('customer');
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Splash ──────────────────────────────────────────────
  if (showSplash) {
    return <Splash onFinish={() => setShowSplash(false)} />;
  }

  // ── ADMIN CONSOLE (dark navy navbar) ────────────────────
  if (mode === 'admin') {
    return (
      <div className="min-h-screen flex antialiased">
        <AdminNavbar currentTab={adminTab} onNavigate={handleAdminNavigate} />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
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
      <div className="min-h-screen flex antialiased">
        <RenterNavbar
          currentTab={adminTab}
          onNavigate={handleAdminNavigate}
          onViewStorefront={viewStorefront}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
            {adminTab === 'dashboard' && <Dashboard onNavigate={handleAdminNavigate} />}
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
