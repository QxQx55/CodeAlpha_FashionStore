import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Banknote, Check, CreditCard, ShieldCheck, Truck } from 'lucide-react';
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

const previewCatalog = import.meta.env.VITE_CATALOG_MODE !== 'live';
const demoPaymentOptions = [
  { id: 'telebirr', label: 'Telebirr (simulated)' },
  { id: 'cbe_birr', label: 'CBE Birr (simulated)' },
  { id: 'card', label: 'Credit/debit card (simulated)' },
] as const;

export function Checkout() {
  const { items, subtotal, clearCart, isLoading: isCartLoading } = useCart();
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ShippingAddress>(initialAddress);
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'chapa' | 'demo'>(
    previewCatalog ? 'demo' : 'cash_on_delivery',
  );
  const [demoChannel, setDemoChannel] = useState<'telebirr' | 'cbe_birr' | 'card'>('telebirr');
  const [chapaAvailable, setChapaAvailable] = useState(false);
  const [demoCheckoutAvailable, setDemoCheckoutAvailable] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Please sign in before placing your order.');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    setFormData((previous) => ({ ...previous, email: user?.email || previous.email }));
  }, [user]);

  useEffect(() => {
    storeApi.api.getChapaStatus()
      .then(({ available, demoCheckoutAvailable: demoAvailable }) => {
        setChapaAvailable(available);
        setDemoCheckoutAvailable(demoAvailable);
        if (previewCatalog && demoAvailable) setPaymentMethod('demo');
      })
      .catch((error) => {
        console.error('Failed to check demo checkout availability:', error);
      });
  }, []);

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
      const order = await storeApi.api.createOrder(
        formData,
        paymentMethod,
        paymentMethod === 'demo' ? demoChannel : undefined,
      );
      if ('paymentUrl' in order) {
        window.location.assign(order.paymentUrl);
        return;
      }
      await clearCart();
      toast.success(paymentMethod === 'demo'
        ? 'Demo checkout completed. No payment was taken.'
        : 'Order placed successfully!');
      navigate(`/account/orders/${order.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to place the order.');
      console.error('Failed to place order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || isCartLoading) return <div className="py-40 text-center animate-pulse">Loading...</div>;

  if (previewCatalog && !demoCheckoutAvailable) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-40 text-center">
        <h1 className="font-serif text-3xl font-bold uppercase">Demo checkout is unavailable</h1>
        <p className="text-muted-foreground">The demo checkout service is unavailable. Your sample cart is unchanged; no payment or order was made.</p>
        <Button asChild>
          <Link to="/collections/all">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

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
              {previewCatalog ? (
                <>
                  <p className="text-sm text-muted-foreground">Choose a simulated payment option to complete the demo checkout. These options do not contact Telebirr, CBE Birr, or a card provider.</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {demoPaymentOptions.map((option) => (
                      <label
                        key={option.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-sm border p-4 transition-colors ${demoChannel === option.id ? 'border-accent bg-accent/5' : 'border-border'}`}
                      >
                        <input
                          type="radio"
                          name="demoChannel"
                          value={option.id}
                          checked={demoChannel === option.id}
                          onChange={() => setDemoChannel(option.id)}
                          className="accent-[#b38b38]"
                        />
                        <span className="text-sm font-medium">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                    Demo only: a sample order will appear in your account for testing. No payment is taken, and sample inventory is unchanged.
                  </p>
                </>
              ) : (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className={`flex cursor-pointer items-start gap-3 rounded-sm border p-4 transition-colors ${paymentMethod === 'cash_on_delivery' ? 'border-accent bg-accent/5' : 'border-border'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash_on_delivery"
                        checked={paymentMethod === 'cash_on_delivery'}
                        onChange={() => setPaymentMethod('cash_on_delivery')}
                        className="mt-1 accent-[#b38b38]"
                      />
                      <Banknote className="mt-0.5 h-5 w-5 shrink-0" />
                      <span className="space-y-1">
                        <span className="block text-sm font-medium">Cash on delivery</span>
                        <span className="block text-xs text-muted-foreground">Pay when your order arrives.</span>
                      </span>
                    </label>
                    <label className={`flex items-start gap-3 rounded-sm border p-4 transition-colors ${chapaAvailable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'} ${paymentMethod === 'chapa' ? 'border-accent bg-accent/5' : 'border-border'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="chapa"
                        checked={paymentMethod === 'chapa'}
                        onChange={() => setPaymentMethod('chapa')}
                        disabled={!chapaAvailable}
                        className="mt-1 accent-[#b38b38]"
                      />
                      <CreditCard className="mt-0.5 h-5 w-5 shrink-0" />
                      <span className="space-y-1">
                        <span className="block text-sm font-medium">Pay securely with Chapa</span>
                        <span className="block text-xs text-muted-foreground">
                          {chapaAvailable
                            ? 'Continue to Chapa hosted checkout. Available methods depend on your merchant account.'
                            : 'Add the appropriate CHAPA_SECRET_KEY to the API server to enable online payments.'}
                        </span>
                      </span>
                    </label>
                  </div>
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                    {paymentMethod === 'chapa'
                      ? 'Payment details are entered on Chapa and are never stored by this store.'
                      : 'Your card details are never requested or stored by this store.'}
                  </p>
                </>
              )}
            </section>

            <Button
              type="submit"
              className="h-14 w-full text-sm font-bold uppercase tracking-widest"
              disabled={loading || !isContactValid || !isShippingValid}
            >
              {loading
                ? 'Processing...'
                : `${paymentMethod === 'demo' ? 'Complete demo checkout' : paymentMethod === 'chapa' ? 'Continue to Chapa' : 'Place order'} · ${total.toLocaleString()} ETB`}
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
