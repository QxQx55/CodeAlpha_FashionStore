import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingBag, 
  Heart, 
  MapPin, 
  User, 
  LogOut, 
  Package, 
  Plus, 
  Trash2, 
  Edit2, 
  ArrowLeft,
  Truck,
  Check,
  Clock,
  X,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { blink } from '@/lib/blink';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

export function Account() {
  const { user, isAuthenticated, isLoading, logout, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
            <h1 className="font-serif text-2xl font-bold uppercase tracking-tight">{user?.displayName || 'My Account'}</h1>
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
          <Routes>
            <Route index element={<AccountOverview />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="addresses" element={<Addresses />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function AccountOverview() {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const orders = await (blink.db as any).orders.list({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          limit: 3
        });
        setRecentOrders(orders);

        const wishlist = await (blink.db as any).wishlist.list({
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

function OrderList() {
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
                <p className="text-xs font-bold">${Number(order.totalAmount).toFixed(2)}</p>
                <Badge variant="secondary" className="text-[10px] uppercase">{order.status}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderDetail() {
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
        const orders = await (blink.db as any).orders.list({
          where: { id, userId: user.id }
        });
        
        if (orders.length === 0) {
          navigate('/account/orders');
          return;
        }
        
        setOrder(orders[0]);

        const items = await (blink.db as any).orderItems.list({
          where: { orderId: id }
        });

        // Enrich with product/variant info
        const enrichedItems = await Promise.all(
          items.map(async (item: any) => {
            const variants = await (blink.db as any).productVariants.list({
              where: { id: item.variantId }
            });
            const variant = variants[0];
            
            if (!variant) return { ...item, product: null, variant: null };

            const products = await (blink.db as any).products.list({
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
      await (blink.db as any).returns.create({
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
                  src={item.variant?.images?.[0] || item.product?.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200'} 
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
              <p className="text-sm font-bold">${(Number(item.price) * item.quantity).toFixed(2)}</p>
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
              <span>${(Number(order.totalAmount) / 1.08 - (Number(order.totalAmount) > 150 ? 0 : 15)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{Number(order.totalAmount) > 162 ? 'Free' : '$15.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>${(Number(order.totalAmount) * 0.074).toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${Number(order.totalAmount).toFixed(2)}</span>
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

function Wishlist() {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    if (!user) return;
    try {
      const wishlist = await (blink.db as any).wishlist.list({
        where: { userId: user.id }
      });

      const items = await Promise.all(
        wishlist.map(async (item: any) => {
          const products = await (blink.db as any).products.list({
            where: { id: item.productId }
          });
          return products[0] ? { ...item, product: products[0] } : null;
        })
      );

      setWishlistItems(items.filter(Boolean));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const removeFromWishlist = async (wishlistId: string) => {
    try {
      await (blink.db as any).wishlist.delete(wishlistId);
      setWishlistItems(prev => prev.filter(item => item.id !== wishlistId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  if (loading) return <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">{[1,2,3].map(i => <div key={i} className="aspect-[3/4] bg-secondary" />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-sm font-bold uppercase tracking-widest">My Wishlist</h2>
      
      {wishlistItems.length === 0 ? (
        <div className="text-center py-20 border rounded-sm space-y-4">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground">Your wishlist is empty.</p>
          <Button asChild>
            <Link to="/collections/all">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="group relative">
              <Link to={`/products/${item.product.slug}`} className="block">
                <div className="aspect-[3/4] bg-secondary overflow-hidden">
                  <img 
                    src={item.product.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400'} 
                    alt={item.product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="mt-3 space-y-1 text-center">
                  <h3 className="text-sm font-medium">{item.product.name}</h3>
                  <p className="text-sm font-bold">${Number(item.product.basePrice).toFixed(2)}</p>
                </div>
              </Link>
              <button 
                onClick={() => removeFromWishlist(item.id)}
                className="absolute top-2 right-2 p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Addresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [formData, setFormData] = useState({
    label: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'United States',
    isDefault: false
  });

  // For simplicity, we'll store addresses in localStorage since there's no addresses table
  // In production, you'd create an addresses table
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`addresses_${user.id}`);
      if (stored) {
        setAddresses(JSON.parse(stored));
      }
    }
  }, [user]);

  const saveAddresses = (newAddresses: any[]) => {
    if (user) {
      localStorage.setItem(`addresses_${user.id}`, JSON.stringify(newAddresses));
      setAddresses(newAddresses);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAddress) {
      const updated = addresses.map(addr => 
        addr.id === editingAddress.id ? { ...formData, id: addr.id } : addr
      );
      if (formData.isDefault) {
        updated.forEach(addr => {
          if (addr.id !== editingAddress.id) addr.isDefault = false;
        });
      }
      saveAddresses(updated);
      toast.success('Address updated');
    } else {
      const newAddress = { ...formData, id: Date.now().toString() };
      let updated = [...addresses, newAddress];
      if (formData.isDefault || addresses.length === 0) {
        updated = updated.map(addr => ({
          ...addr,
          isDefault: addr.id === newAddress.id
        }));
      }
      saveAddresses(updated);
      toast.success('Address added');
    }
    
    setIsDialogOpen(false);
    setEditingAddress(null);
    setFormData({
      label: '',
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'United States',
      isDefault: false
    });
  };

  const handleEdit = (address: any) => {
    setEditingAddress(address);
    setFormData(address);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updated = addresses.filter(addr => addr.id !== id);
    if (updated.length > 0 && !updated.some(a => a.isDefault)) {
      updated[0].isDefault = true;
    }
    saveAddresses(updated);
    toast.success('Address removed');
  };

  const setAsDefault = (id: string) => {
    const updated = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }));
    saveAddresses(updated);
    toast.success('Default address updated');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold uppercase tracking-widest">Saved Addresses</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingAddress(null);
            setFormData({
              label: '',
              firstName: '',
              lastName: '',
              address: '',
              city: '',
              postalCode: '',
              country: 'United States',
              isDefault: false
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs uppercase tracking-widest">
              <Plus className="mr-2 h-4 w-4" /> Add Address
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
              <DialogDescription>
                {editingAddress ? 'Update your address details below.' : 'Enter your shipping address details.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="label" className="text-xs uppercase tracking-widest">Label (e.g., Home, Work)</Label>
                <Input 
                  id="label" 
                  value={formData.label}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Home"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs uppercase tracking-widest">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs uppercase tracking-widest">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-xs uppercase tracking-widest">Street Address</Label>
                <Input 
                  id="address" 
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-xs uppercase tracking-widest">City</Label>
                  <Input 
                    id="city" 
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-xs uppercase tracking-widest">Postal Code</Label>
                  <Input 
                    id="postalCode" 
                    value={formData.postalCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="h-4 w-4"
                />
                <Label htmlFor="isDefault" className="text-xs">Set as default address</Label>
              </div>
              <Button type="submit" className="w-full">
                {editingAddress ? 'Update Address' : 'Save Address'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-20 border rounded-sm space-y-4">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground">No addresses saved yet.</p>
          <p className="text-xs text-muted-foreground">Add an address for faster checkout.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div 
              key={address.id} 
              className={cn(
                "p-6 border rounded-sm relative",
                address.isDefault && "border-accent"
              )}
            >
              {address.isDefault && (
                <Badge className="absolute top-4 right-4 text-[10px]">Default</Badge>
              )}
              <div className="space-y-2">
                <h3 className="font-bold text-sm">{address.label}</h3>
                <p className="text-sm">{address.firstName} {address.lastName}</p>
                <p className="text-xs text-muted-foreground">{address.address}</p>
                <p className="text-xs text-muted-foreground">{address.city}, {address.postalCode}</p>
                <p className="text-xs text-muted-foreground">{address.country}</p>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-[10px] h-8"
                  onClick={() => handleEdit(address)}
                >
                  <Edit2 className="h-3 w-3 mr-1" /> Edit
                </Button>
                {!address.isDefault && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[10px] h-8"
                    onClick={() => setAsDefault(address.id)}
                  >
                    Set Default
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[10px] h-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Remove
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Address</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove this address?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(address.id)}>Remove</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
