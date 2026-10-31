import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storeApi } from '@/lib/store-api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp,
  ShoppingBag,
  Package,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatCard({ title, value, icon: Icon, trend }: any) {
  return (
    <Card className="rounded-sm border-none shadow-elegant overflow-hidden">
      <CardContent className="p-6 space-y-2">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-secondary rounded-sm">
            <Icon className="h-4 w-4 text-accent" />
          </div>
          {trend && (
            <span className="text-[10px] font-bold text-green-600 flex items-center">
              {trend} <ArrowUpRight className="h-2 w-2 ml-1" />
            </span>
          )}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminOverview() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    activeProducts: 0,
    activeCollections: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [collectionSales, setCollectionSales] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const orders = await (storeApi.db as any).orders.list();
        const products = await (storeApi.db as any).products.list({ where: { active: "1" } });
        const collections = await (storeApi.db as any).collections.list({ where: { active: "1" } });

        const totalSales = (orders as any[]).reduce((sum, order) => sum + Number(order.totalAmount), 0);
        setRecentOrders(orders.slice(0, 5));

        // Calculate sales by collection
        const salesByCollection: Record<string, number> = {};
        for (const order of orders) {
          const orderItems = await (storeApi.db as any).orderItems.list({ where: { orderId: order.id } });
          for (const item of orderItems) {
            const variants = await (storeApi.db as any).productVariants.list({ where: { id: item.variantId } });
            if (variants[0]) {
              const prods = await (storeApi.db as any).products.list({ where: { id: variants[0].productId } });
              if (prods[0]) {
                const collId = prods[0].collectionId || 'uncategorized';
                salesByCollection[collId] = (salesByCollection[collId] || 0) + Number(item.price) * item.quantity;
              }
            }
          }
        }

        const collSalesArr = await Promise.all(
          Object.entries(salesByCollection).map(async ([collId, amount]) => {
            const coll = await (storeApi.db as any).collections.list({ where: { id: collId } });
            return {
              id: collId,
              name: coll[0]?.name || 'Uncategorized',
              amount
            };
          })
        );
        setCollectionSales(collSalesArr.sort((a, b) => b.amount - a.amount).slice(0, 5));

        setStats({
          totalSales,
          totalOrders: orders.length,
          activeProducts: products.length,
          activeCollections: collections.length
        });
      } catch (error) {
        console.error(error);
      }
    };
    fetchStats();
  }, []);

  const maxSales = Math.max(...collectionSales.map(c => c.amount), 1);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Sales" value={`${stats.totalSales.toLocaleString()} ETB`} icon={TrendingUp} trend="+12%" />
        <StatCard title="Orders" value={stats.totalOrders} icon={ShoppingBag} trend="+5%" />
        <StatCard title="Products" value={stats.activeProducts} icon={Package} />
        <StatCard title="Collections" value={stats.activeCollections} icon={Layers} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-sm border-none shadow-elegant">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center justify-between">
              Recent Orders
              <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2" asChild>
                <Link to="/admin/orders">View All</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No orders yet</p>
              ) : (
                recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between text-xs py-2 border-b last:border-0">
                    <div className="space-y-1">
                      <p className="font-bold">Order #{order.id.slice(-8)}</p>
                      <p className="text-muted-foreground">{Number(order.totalAmount).toLocaleString()} ETB</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{order.status}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-sm border-none shadow-elegant">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest">
              Sales by Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {collectionSales.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No sales data yet</p>
              ) : (
                collectionSales.map((c, idx) => (
                  <div key={c.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{c.name}</span>
                      <span className="font-bold">{c.amount.toLocaleString()} ETB</span>
                    </div>
                    <div className="w-full h-1 bg-secondary overflow-hidden">
                      <div 
                        className={cn("h-full", idx === 0 ? "bg-accent" : "bg-primary")} 
                        style={{ width: `${(c.amount / maxSales) * 100}%` }} 
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
