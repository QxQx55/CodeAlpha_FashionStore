import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { AccountLayout } from '@/features/account/AccountLayout';
import { AccountOverview } from '@/features/account/AccountOverview';
import { OrderList } from '@/features/account/OrderList';
import { OrderDetail } from '@/features/account/OrderDetail';
import { Wishlist } from '@/features/account/Wishlist';
import { Addresses } from '@/features/account/Addresses';

export function Account() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div className="py-40 text-center animate-pulse">Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-40 text-center space-y-6">
        <h1 className="font-serif text-3xl font-bold uppercase">Sign In</h1>
        <p className="text-muted-foreground">Sign in to view your orders, wishlist, and profile.</p>
        <Button asChild size="lg" className="px-10">
          <Link to="/login">Sign In / Create Account</Link>
        </Button>
      </div>
    );
  }

  return (
    <AccountLayout>
      <Routes>
        <Route index element={<AccountOverview />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="addresses" element={<Addresses />} />
      </Routes>
    </AccountLayout>
  );
}
