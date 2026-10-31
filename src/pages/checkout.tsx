import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Banknote, Check, ShieldCheck, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth-provider';
import { useCart } from '@/components/cart-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { storeApi } from '@/lib/store-api';

type ShippingAddress = {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
};

const initialAddress: ShippingAddress = {
  email: '',
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'Ethiopia',
  phone: '',
};

export function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ShippingAddress>(initialAddress);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Please sign in before placing your order.');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    setFormData((previous) => ({ ...previous, email: user?.email || previous.email }));
  }, [user]);

  const shippingCost = subtotal > 5000 ? 0 : 250;
  const tax = subtotal * 0.15;
  const total = subtotal + shippingCost + tax;
  const isContactValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isShippingValid = Boolean(
    formData.firstName.trim()
    && formData.lastName.trim()
    && formData.address.trim()
    && formData.city.trim()
    && formData.postalCode.trim(),
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      toast.error('Please sign in before placing your order.');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }

    setLoading(true);
    try {
      const order = await storeApi.api.createOrder(formData);
      await clearCart();
      toast.success('Order placed successfully!');
      navigate(`/account/orders/${order.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to place the order.');
      console.error('Failed to place order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <div className="py-40 text-center animate-pulse">Loading...</div>;

  if (items.length === 0) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-40 text-center">
        <h1 className="font-serif text-3xl font-bold uppercase">Your bag is empty</h1>
        <p className="text-muted-foreground">Add some items to your bag before checking out.</p>
        <Button asChild>
          <Link to="/collections/all">Explore Collections</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-32 lg:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-7">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to bag
          </button>

          <form onSubmit={handleSubmit} className="space-y-10">
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">1</span>
                <h2 className="text-sm font-bold uppercase tracking-widest">Contact information</h2>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest">Email address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-12"
                  placeholder="you@example.com"
                />
                <p className="text-[10px] text-muted-foreground">Your order confirmation will be sent here.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest">Phone number (optional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="h-12"
                  placeholder="+251"
                />
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${isShippingValid ? 'bg-green-600 text-white' : 'bg-primary text-primary-foreground'}`}>
                  {isShippingValid ? <Check className="h-3 w-3" /> : '2'}
                </span>
                <h2 className="text-sm font-bold uppercase tracking-widest">Shipping address</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {([
                  ['firstName', 'First name'],
                  ['lastName', 'Last name'],
                  ['address', 'Street address'],
                  ['city', 'City'],
                  ['postalCode', 'Postal code'],
                ] as const).map(([name, label]) => (
                  <div key={name} className={`space-y-2 ${name === 'address' ? 'md:col-span-2' : ''}`}>
                    <Label htmlFor={name} className="text-[10px] font-bold uppercase tracking-widest">{label} *</Label>
                    <Input
                      id={name}
                      name={name}
                      autoComplete={name === 'address' ? 'street-address' : name}
                      value={formData[name]}
                      onChange={handleInputChange}
                      required
                      className="h-12"
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-[10px] font-bold uppercase tracking-widest">Country</Label>
                  <Input id="country" name="country" value={formData.country} disabled className="h-12" />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white">
                  <Check className="h-3 w-3" />
                </span>
                <h2 className="text-sm font-bold uppercase tracking-widest">Payment</h2>
              </div>
              <div className="flex items-start gap-4 rounded-sm border border-accent bg-accent/5 p-5">
                <Banknote className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Cash on delivery</p>
                  <p className="text-xs text-muted-foreground">Pay when your order arrives. Online payment is not enabled for this store yet.</p>
                </div>
              </div>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                Your card details are never requested or stored by this demo store.
              </p>
            </section>

            <Button
              type="submit"
              className="h-14 w-full text-sm font-bold uppercase tracking-widest"
              disabled={loading || !isContactValid || !isShippingValid}
            >
              {loading ? 'Placing order...' : `Place order · ${total.toLocaleString()} ETB`}
            </Button>
          </form>
        </div>

        <aside className="lg:col-span-5">
          <div className="space-y-6 rounded-sm border bg-secondary/30 p-8 lg:sticky lg:top-32">
            <h2 className="font-serif text-xl font-bold uppercase tracking-tight">Order summary</h2>
            <div className="max-h-96 space-y-4 overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="h-16 w-12 shrink-0 overflow-hidden bg-secondary">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold">{item.product.name}</p>
                      <p className="text-[10px] uppercase text-muted-foreground">
                        {item.variant.size} {item.variant.color && `· ${item.variant.color}`}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="shrink-0 text-xs font-bold">
                    {((item.variant.price || item.product.basePrice) * item.quantity).toLocaleString()} ETB
                  </p>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{subtotal.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : `${shippingCost.toLocaleString()} ETB`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (15% VAT)</span>
                <span>{tax.toLocaleString()} ETB</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{total.toLocaleString()} ETB</span>
              </div>
            </div>
            <div className="flex items-start gap-3 pt-2 text-[10px] text-muted-foreground">
              <Truck className="h-4 w-4 shrink-0 text-accent" />
              <span>Standard delivery in 3–5 business days. Free shipping on orders over 5,000 ETB.</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
