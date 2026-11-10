import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/auth-provider';
import { CartProvider } from './components/cart-provider';
import { Layout } from './components/layout';
import { Home } from './pages/home';
import { CollectionDetail } from './pages/collection-detail';
import { ProductDetail } from './pages/product-detail';
import { Account } from './pages/account';
import { Checkout } from './pages/checkout';
import { CheckoutComplete } from './pages/checkout-complete';
import { AdminDashboard } from './pages/admin/dashboard';
import { Login } from './pages/login';
import { Register } from './pages/register';
import { LegalPolicyDraft, ShippingReturns } from './pages/store-policy';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/collections/:slug" element={<CollectionDetail />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/account/*" element={<Account />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/complete" element={<CheckoutComplete />} />
              <Route path="/shipping-returns" element={<ShippingReturns />} />
              <Route path="/privacy-policy" element={<LegalPolicyDraft kind="privacy" />} />
              <Route path="/terms-of-service" element={<LegalPolicyDraft kind="terms" />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
            </Routes>
          </Layout>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
