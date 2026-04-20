import React from 'react';
import { Navbar } from './navbar';
import { Footer } from './footer';
import { CartDrawer } from './cart-drawer';
import { Toaster } from '@/components/ui/sonner';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans antialiased">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <Toaster position="top-center" />
    </div>
  );
}
