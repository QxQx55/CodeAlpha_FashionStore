import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProductVariants } from './product-variants';
import { AdminLayout } from '@/features/admin/AdminLayout';
import { AdminOverview } from '@/features/admin/AdminOverview';
import { AdminProducts } from '@/features/admin/AdminProducts';
import { AdminCollections } from '@/features/admin/AdminCollections';
import { AdminOrders } from '@/features/admin/AdminOrders';
import { AdminReturns } from '@/features/admin/AdminReturns';

export function AdminDashboard() {
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
