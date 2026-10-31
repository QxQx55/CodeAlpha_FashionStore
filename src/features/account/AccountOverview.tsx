import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { storeApi } from '@/lib/store-api';

export function AccountOverview() {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const orders = await (storeApi.db as any).orders.list({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          limit: 3
        });
        setRecentOrders(orders);

        const wishlist = await (storeApi.db as any).wishlist.list({
          where: { userId: user.id }
        });
        setWishlistCount(wishlist.length);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [user]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 border rounded-sm bg-secondary/20 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <>
              <p className="text-xs text-muted-foreground">You haven't placed any orders yet.</p>
              <Button variant="link" asChild className="px-0 text-accent h-auto">
                <Link to="/collections/all">Start Shopping</Link>
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <Link 
                  key={order.id} 
                  to={`/account/orders/${order.id}`}
                  className="flex justify-between items-center text-xs hover:text-accent transition-colors"
                >
                  <span>Order #{order.id.slice(-8)}</span>
                  <Badge variant="secondary" className="text-[10px]">{order.status}</Badge>
                </Link>
              ))}
              <Button variant="link" asChild className="px-0 text-accent h-auto text-xs">
                <Link to="/account/orders">View all orders</Link>
              </Button>
            </div>
          )}
        </div>
        <div className="p-8 border rounded-sm bg-secondary/20 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest">Wishlist</h2>
          <p className="text-xs text-muted-foreground">
            {wishlistCount > 0 ? `${wishlistCount} items saved` : 'No items saved yet.'}
          </p>
          <Button variant="link" asChild className="px-0 text-accent h-auto">
            <Link to="/account/wishlist">{wishlistCount > 0 ? 'View Wishlist' : 'Browse Products'}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
