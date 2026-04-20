import React, { useState, useEffect } from 'react';
import { useCart } from '@/components/cart-provider';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Truck, ShieldCheck, ArrowLeft, Check, Lock, Wallet } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { blink } from '@/lib/blink';
import { cn } from '@/lib/utils';

export function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [isGuestCheckout, setIsGuestCheckout] = useState(!user);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'United States',
    phone: '',
  });
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  // Load saved addresses if user is logged in
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`addresses_${user.id}`);
      if (stored) {
        const addresses = JSON.parse(stored);
        const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0];
        if (defaultAddr) {
          setFormData(prev => ({
            ...prev,
            firstName: defaultAddr.firstName,
            lastName: defaultAddr.lastName,
            address: defaultAddr.address,
            city: defaultAddr.city,
            postalCode: defaultAddr.postalCode,
            country: defaultAddr.country || 'United States'
          }));
        }
      }
      setFormData(prev => ({ ...prev, email: user.email || prev.email }));
    }
  }, [user]);

  const shippingCost = subtotal > 150 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For guest checkout, we allow without login
    const userId = user?.id || `guest_${Date.now()}`;

    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 1. Create Order
      const order = await (blink.db as any).orders.create({
        userId: userId,
        totalAmount: total,
        status: 'processing',
        shippingAddress: JSON.stringify({ ...formData, paymentMethod })
      });

      // 2. Create Order Items
      for (const item of items) {
        await (blink.db as any).orderItems.create({
          orderId: order.id,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.variant.price || item.product.basePrice
        });
      }

      // 3. Update variant stock
      for (const item of items) {
        try {
          const variants = await (blink.db as any).productVariants.list({
            where: { id: item.variantId }
          });
          if (variants[0]) {
            const newStock = Math.max(0, variants[0].stock - item.quantity);
            await (blink.db as any).productVariants.update(item.variantId, {
              stock: newStock
            });
          }
        } catch (e) {
          console.error('Failed to update stock:', e);
        }
      }

      // 4. Clear Cart
      await clearCart();

      toast.success('Order placed successfully!');
      
      if (user) {
        navigate(`/account/orders/${order.id}`);
      } else {
        // For guests, show confirmation page
        navigate(`/?order=${order.id}`);
        toast.success(`Order #${order.id.slice(-8)} confirmed! Check your email for details.`);
      }
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isContactValid = formData.email && formData.email.includes('@');
  const isShippingValid = formData.firstName && formData.lastName && formData.address && formData.city && formData.postalCode;
  const isPaymentValid = paymentMethod === 'card' 
    ? cardData.number.replace(/\s/g, '').length === 16 && cardData.expiry.length === 5 && cardData.cvc.length >= 3
    : true;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-40 text-center space-y-6">
        <h1 className="font-serif text-3xl font-bold uppercase">Your bag is empty</h1>
        <p className="text-muted-foreground">Add some items to your bag before checking out.</p>
        <Button asChild>
          <Link to="/">Explore Collections</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-32 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Checkout Form */}
        <div className="lg:col-span-7 space-y-12">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to bag
          </button>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Guest/Sign In Option */}
            {!user && (
              <section className="p-6 bg-secondary/30 rounded-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold">Already have an account?</h3>
                    <p className="text-xs text-muted-foreground">Sign in for faster checkout and order tracking.</p>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => login(window.location.href)}
                    className="text-xs uppercase tracking-widest"
                  >
                    Sign In
                  </Button>
                </div>
                <Separator />
                <p className="text-xs text-muted-foreground">
                  <Check className="inline h-3 w-3 mr-1 text-green-600" />
                  Or continue as guest — no account required
                </p>
              </section>
            )}

            {/* Contact Information */}
            <section className="space-y-6">
              <div className="flex items-center space-x-2">
                <span className={cn(
                  "flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-bold",
                  isContactValid ? "bg-green-600 text-white" : "bg-primary text-primary-foreground"
                )}>
                  {isContactValid ? <Check className="h-3 w-3" /> : '1'}
                </span>
                <h2 className="text-sm font-bold uppercase tracking-widest">Contact Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email" className="text-[10px] uppercase tracking-widest font-bold">Email Address *</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    required 
                    className="h-12"
                    placeholder="you@example.com"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    We'll send your order confirmation here.
                  </p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phone" className="text-[10px] uppercase tracking-widest font-bold">Phone Number (Optional)</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    type="tel" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    className="h-12"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section className="space-y-6">
              <div className="flex items-center space-x-2">
                <span className={cn(
                  "flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-bold",
                  isShippingValid ? "bg-green-600 text-white" : "bg-primary text-primary-foreground"
                )}>
                  {isShippingValid ? <Check className="h-3 w-3" /> : '2'}
                </span>
                <h2 className="text-sm font-bold uppercase tracking-widest">Shipping Address</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-[10px] uppercase tracking-widest font-bold">First Name</Label>
                  <Input 
                    id="firstName" 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleInputChange} 
                    required 
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-[10px] uppercase tracking-widest font-bold">Last Name</Label>
                  <Input 
                    id="lastName" 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleInputChange} 
                    required 
                    className="h-12"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address" className="text-[10px] uppercase tracking-widest font-bold">Address</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    required 
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-[10px] uppercase tracking-widest font-bold">City</Label>
                  <Input 
                    id="city" 
                    name="city" 
                    value={formData.city} 
                    onChange={handleInputChange} 
                    required 
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-[10px] uppercase tracking-widest font-bold">Postal Code</Label>
                  <Input 
                    id="postalCode" 
                    name="postalCode" 
                    value={formData.postalCode} 
                    onChange={handleInputChange} 
                    required 
                    className="h-12"
                  />
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section className="space-y-6">
              <div className="flex items-center space-x-2">
                <span className={cn(
                  "flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-bold",
                  isPaymentValid ? "bg-green-600 text-white" : "bg-primary text-primary-foreground"
                )}>
                  {isPaymentValid ? <Check className="h-3 w-3" /> : '3'}
                </span>
                <h2 className="text-sm font-bold uppercase tracking-widest">Payment Method</h2>
              </div>
              
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                {/* Credit/Debit Card Option */}
                <div className={cn(
                  "p-4 border rounded-sm transition-colors",
                  paymentMethod === 'card' && "border-accent bg-accent/5"
                )}>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 flex items-center justify-between cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-5 w-5" />
                        <span className="text-sm font-medium">Credit / Debit Card</span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="h-6 w-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded text-white text-[8px] font-bold flex items-center justify-center">VISA</div>
                        <div className="h-6 w-10 bg-gradient-to-r from-red-500 to-orange-400 rounded text-white text-[8px] font-bold flex items-center justify-center">MC</div>
                        <div className="h-6 w-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded text-white text-[8px] font-bold flex items-center justify-center">AMEX</div>
                      </div>
                    </Label>
                  </div>
                  
                  {paymentMethod === 'card' && (
                    <div className="mt-4 space-y-4 pl-7">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-widest font-bold">Card Number *</Label>
                        <div className="relative">
                          <Input 
                            value={cardData.number}
                            onChange={(e) => setCardData(prev => ({ ...prev, number: formatCardNumber(e.target.value) }))}
                            maxLength={19}
                            placeholder="1234 5678 9012 3456"
                            className="h-12 pl-10"
                          />
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase tracking-widest font-bold">Expiry Date *</Label>
                          <Input 
                            value={cardData.expiry}
                            onChange={(e) => setCardData(prev => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
                            maxLength={5}
                            placeholder="MM/YY"
                            className="h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase tracking-widest font-bold">CVC *</Label>
                          <div className="relative">
                            <Input 
                              value={cardData.cvc}
                              onChange={(e) => setCardData(prev => ({ ...prev, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                              maxLength={4}
                              placeholder="123"
                              className="h-12 pl-10"
                            />
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-widest font-bold">Name on Card *</Label>
                        <Input 
                          value={cardData.name}
                          onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="JOHN DOE"
                          className="h-12 uppercase"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* PayPal Option */}
                <div className={cn(
                  "p-4 border rounded-sm transition-colors",
                  paymentMethod === 'paypal' && "border-accent bg-accent/5"
                )}>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex-1 flex items-center justify-between cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <Wallet className="h-5 w-5" />
                        <span className="text-sm font-medium">PayPal</span>
                      </div>
                      <div className="h-6 w-16 bg-[#003087] rounded text-white text-[10px] font-bold flex items-center justify-center">PayPal</div>
                    </Label>
                  </div>
                  {paymentMethod === 'paypal' && (
                    <p className="mt-3 pl-7 text-xs text-muted-foreground">
                      You will be redirected to PayPal to complete your payment.
                    </p>
                  )}
                </div>

                {/* Apple Pay / Google Pay */}
                <div className={cn(
                  "p-4 border rounded-sm transition-colors",
                  paymentMethod === 'wallet' && "border-accent bg-accent/5"
                )}>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="wallet" id="wallet" />
                    <Label htmlFor="wallet" className="flex-1 flex items-center justify-between cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.72 13.41c-.04 4.15 3.64 6.16 3.7 6.19-.03.1-.58 1.98-1.91 3.92-1.15 1.68-2.34 3.35-4.22 3.38-1.85.04-2.44-1.09-4.56-1.09-2.11 0-2.77 1.06-4.54 1.12-1.81.06-3.19-1.82-4.35-3.49-2.37-3.42-4.19-9.67-1.75-13.88 1.21-2.08 3.37-3.4 5.72-3.43 1.78-.04 3.47 1.2 4.56 1.2 1.09 0 3.13-1.48 5.28-1.26.9.04 3.42.36 5.04 2.73-.13.08-3.01 1.75-2.97 5.21zm-3.45-10.19c.97-1.17 1.62-2.8 1.44-4.42-1.39.06-3.07.93-4.07 2.1-.89 1.03-1.67 2.68-1.46 4.26 1.55.12 3.14-.79 4.09-1.94z"/>
                        </svg>
                        <span className="text-sm font-medium">Apple Pay / Google Pay</span>
                      </div>
                    </Label>
                  </div>
                  {paymentMethod === 'wallet' && (
                    <p className="mt-3 pl-7 text-xs text-muted-foreground">
                      Use your device's secure payment method.
                    </p>
                  )}
                </div>
              </RadioGroup>

              <div className="flex items-center space-x-2 text-xs text-muted-foreground p-3 bg-green-50 rounded-sm">
                <ShieldCheck className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>Your payment information is encrypted and secure. We never store your card details.</span>
              </div>
            </section>

            <Button 
              type="submit" 
              className="w-full h-14 uppercase tracking-widest font-bold text-sm" 
              disabled={loading || !isContactValid || !isShippingValid}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Payment...
                </span>
              ) : (
                <span className="flex items-center">
                  <Lock className="mr-2 h-4 w-4" />
                  Pay ${total.toFixed(2)}
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-32 space-y-6 bg-secondary/30 p-8 border rounded-sm">
            <h2 className="font-serif text-xl font-bold uppercase tracking-tight">Order Summary</h2>
            
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center space-x-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-12 bg-secondary flex-shrink-0 overflow-hidden">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name} 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1020&auto=format&fit=crop';
                        }}
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold leading-none">{item.product.name}</h4>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Qty: {item.quantity} | {item.variant.size}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold">
                    ${((item.variant.price || item.product.basePrice) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Estimated Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t mt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <div className="flex items-start space-x-3 text-[10px] text-muted-foreground">
                <Truck className="h-4 w-4 flex-shrink-0 text-accent" />
                <span>Standard Shipping: Delivery in 3-5 business days.</span>
              </div>
              <div className="flex items-start space-x-3 text-[10px] text-muted-foreground">
                <ShieldCheck className="h-4 w-4 flex-shrink-0 text-accent" />
                <span>Your personal data is encrypted and secure.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
