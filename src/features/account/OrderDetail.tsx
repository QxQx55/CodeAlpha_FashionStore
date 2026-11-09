import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  Check,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { storeApi } from '@/lib/store-api';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user || !id) return;
      try {
        const orders = await (storeApi.db as any).orders.list({
          where: { id, userId: user.id }
        });
        
        if (orders.length === 0) {
          navigate('/account/orders');
          return;
        }
        
        setOrder(orders[0]);

        const items = await (storeApi.db as any).orderItems.list({
          where: { orderId: id }
        });

        // Enrich with product/variant info
        const enrichedItems = await Promise.all(
          items.map(async (item: any) => {
            const variants = await (storeApi.db as any).productVariants.list({
              where: { id: item.variantId }
            });
            const variant = variants[0];
            
            if (!variant) return { ...item, product: null, variant: null };

            const products = await (storeApi.db as any).products.list({
              where: { id: variant.productId }
            });
            const product = products[0];

            let images = [];
            try {
              images = JSON.parse(variant.imageUrls || '[]');
            } catch {
              images = variant.imageUrls ? [variant.imageUrls] : [];
            }

            return {
              ...item,
              product,
              variant: { ...variant, images }
            };
          })
        );

        setOrderItems(enrichedItems.filter(i => i.product));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, user, navigate]);

  const handleRequestReturn = async () => {
    if (!order || !user) return;
    try {
      await (storeApi.db as any).returns.create({
        orderId: order.id,
        userId: user.id,
        status: 'pending',
        reason: 'Customer requested return'
      });
      toast.success('Return request submitted');
    } catch (error) {
      toast.error('Failed to submit return request');
    }
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-secondary" /><div className="h-32 bg-secondary" /></div>;
  if (!order) return <div className="py-20 text-center">Order not found</div>;

  const shippingAddress = order.shippingAddress ? JSON.parse(order.shippingAddress) : {};

  const getStatusStep = () => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    return steps.indexOf(order.status);
  };
  const subtotal = orderItems.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0,
  );
  const shipping = subtotal > 5000 ? 0 : 250;
  const tax = subtotal * 0.15;

  return (
    <div className="space-y-8 animate-fade-in">
      <button 
        onClick={() => navigate('/account/orders')}
        className="flex items-center text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold uppercase tracking-tight">Order #{order.id.slice(-8)}</h1>
          <p className="text-xs text-muted-foreground">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <Badge className={cn(
          "text-xs uppercase",
          order.status === 'delivered' && "bg-green-100 text-green-800",
          order.status === 'shipped' && "bg-blue-100 text-blue-800",
          order.status === 'processing' && "bg-orange-100 text-orange-800",
          order.status === 'cancelled' && "bg-red-100 text-red-800"
        )}>
          {order.status}
        </Badge>
      </div>

      {/* Order Status Timeline */}
      {order.status !== 'cancelled' && (
        <div className="bg-secondary/30 p-6 rounded-sm">
          <div className="flex justify-between">
            {['Ordered', 'Processing', 'Shipped', 'Delivered'].map((step, idx) => (
              <div key={step} className="flex flex-col items-center flex-1">
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold",
                  idx <= getStatusStep() ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {idx < getStatusStep() ? <Check className="h-4 w-4" /> : idx + 1}
                </div>
                <span className="text-[10px] mt-2 text-center hidden sm:block">{step}</span>
              </div>
            ))}
          </div>
          <div className="flex mt-2">
            {[0, 1, 2].map(idx => (
              <div 
                key={idx} 
                className={cn(
                  "flex-1 h-1 mx-1",
                  idx < getStatusStep() ? "bg-accent" : "bg-muted"
                )} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest">Items</h2>
        <div className="border rounded-sm divide-y">
          {orderItems.map((item) => (
            <div key={item.id} className="flex items-center p-4 space-x-4">
              <div className="h-20 w-16 bg-secondary overflow-hidden flex-shrink-0">
                <img 
                  src={item.variant?.images?.[0] || item.product?.imageUrl || '/images/products/men-model.jpg'}
                  alt={item.product?.name} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product?.slug}`} className="text-sm font-bold hover:text-accent transition-colors">
                  {item.product?.name}
                </Link>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {item.variant?.size && `Size: ${item.variant.size}`}
                  {item.variant?.color && ` • ${item.variant.color}`}
                </p>
                <p className="text-[10px] text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-bold">{(Number(item.price) * item.quantity).toLocaleString()} ETB</p>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary & Shipping */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest">Shipping Address</h2>
          <div className="p-4 border rounded-sm text-sm space-y-1">
            <p className="font-bold">{shippingAddress.firstName} {shippingAddress.lastName}</p>
            <p className="text-muted-foreground">{shippingAddress.address}</p>
            <p className="text-muted-foreground">{shippingAddress.city}, {shippingAddress.postalCode}</p>
            <p className="text-muted-foreground">{shippingAddress.country}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest">Order Summary</h2>
          <div className="p-4 border rounded-sm space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{subtotal.toLocaleString()} ETB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping === 0 ? 'Free' : `${shipping.toLocaleString()} ETB`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{tax.toLocaleString()} ETB</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{Number(order.totalAmount).toLocaleString()} ETB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {order.status === 'delivered' && (
        <div className="flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-xs uppercase tracking-widest">
                <RotateCcw className="mr-2 h-4 w-4" /> Request Return
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Request a Return</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to request a return for this order? Our team will review your request and contact you within 2-3 business days.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRequestReturn}>Submit Request</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
