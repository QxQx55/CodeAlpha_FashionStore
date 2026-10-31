import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ProductVariants } from './product-variants';
import { AdminLayout } from '@/features/admin/AdminLayout';
import { AdminOverview } from '@/features/admin/AdminOverview';
import { AdminProducts } from '@/features/admin/AdminProducts';
import { AdminCollections } from '@/features/admin/AdminCollections';
import { AdminOrders } from '@/features/admin/AdminOrders';
import { AdminReturns } from '@/features/admin/AdminReturns';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';

export function AdminDashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="py-40 text-center animate-pulse">Checking administrator access...</div>;
  }

  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto max-w-lg space-y-6 px-4 py-40 text-center">
        <h1 className="font-serif text-3xl font-bold uppercase">Administrator access required</h1>
        <p className="text-muted-foreground">
          Sign in with an administrator account to manage products, categories, and orders.
          Store owners can configure their email with the <code>ADMIN_EMAIL</code> environment variable.
        </p>
        <Button asChild>
          <Link to={user ? '/account' : '/login?redirectTo=%2Fadmin'}>{user ? 'Back to account' : 'Sign in'}</Link>
        </Button>
      </div>
    );
  }

  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminOverview />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/:productId/variants" element={<ProductVariants />} />
        <Route path="collections" element={<AdminCollections />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="returns" element={<AdminReturns />} />
      </Routes>
    </AdminLayout>
  );
}
