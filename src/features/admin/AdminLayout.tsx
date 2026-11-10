import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  ShoppingBag, 
  RotateCcw,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard },
  { label: 'Products', path: '/admin/products', icon: Package },
  { label: 'Collections', path: '/admin/collections', icon: Layers },
  { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  { label: 'Returns', path: '/admin/returns', icon: RotateCcw },
  { label: 'Storefront Content', path: '/admin/storefront', icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="container mx-auto px-4 py-32 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Admin Sidebar */}
        <aside className="w-full lg:w-64 space-y-8">
          <div className="space-y-1">
            <h1 className="font-serif text-2xl font-bold uppercase tracking-tight">Admin Portal</h1>
            <p className="text-xs text-muted-foreground">Manage your boutique</p>
          </div>

          <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 space-x-4 lg:space-x-0 lg:space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors border-b-2 lg:border-b-0 lg:border-l-2 whitespace-nowrap",
                  location.pathname === item.path
                    ? "border-accent text-foreground bg-accent/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-h-[600px]">
          {children}
        </main>
      </div>
    </div>
  );
}
