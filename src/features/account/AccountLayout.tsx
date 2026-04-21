import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { 
  ShoppingBag, 
  Heart, 
  MapPin, 
  User, 
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccountLayoutProps {
  children: React.ReactNode;
}

export function AccountLayout({ children }: AccountLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Overview', path: '/account', icon: User },
    { label: 'Orders', path: '/account/orders', icon: ShoppingBag },
    { label: 'Wishlist', path: '/account/wishlist', icon: Heart },
    { label: 'Addresses', path: '/account/addresses', icon: MapPin },
  ];

  return (
    <div className="container mx-auto px-4 py-32 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 space-y-8">
          <div className="space-y-1">
            <h1 className="font-serif text-2xl font-bold uppercase tracking-tight">
              {user?.displayName || 'My Account'}
            </h1>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
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
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors whitespace-nowrap"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-h-[400px]">
          {children}
        </main>
      </div>
    </div>
  );
}
