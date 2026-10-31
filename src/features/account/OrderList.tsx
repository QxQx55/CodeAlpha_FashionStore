import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  Package, 
  Truck,
  Check,
  Clock,
  X
} from 'lucide-react';
import { blink } from '@/lib/blink';

export function OrderList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const data = await (blink.db as any).orders.list({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' }
        });
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (loading) return <div className="space-y-4 animate-pulse"><div className="h-20 bg-secondary" /><div className="h-20 bg-secondary" /></div>;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-blue-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-sm font-bold uppercase tracking-widest">Order History</h2>
      {orders.length === 0 ? (
        <div className="text-center py-20 border rounded-sm space-y-4">
          <Package className="h-12 w-12 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground">No orders found.</p>
          <Button asChild>
            <Link to="/collections/all">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link 
              key={order.id} 
              to={`/account/orders/${order.id}`}
              className="flex justify-between items-center p-6 border rounded-sm hover:border-accent transition-colors"
            >
              <div className="flex items-center space-x-4">
                {getStatusIcon(order.status)}
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-tight">Order #{order.id.slice(-8)}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs font-bold">{Number(order.totalAmount).toLocaleString()} ETB</p>
                <Badge variant="secondary" className="text-[10px] uppercase">{order.status}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
