import React from 'react';
import { useCart } from './cart-provider';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';

export function CartDrawer() {
  const { items, subtotal, removeItem, updateQuantity, isOpen, setIsOpen } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="flex items-center justify-between">
            <span className="font-serif text-xl">Shopping Cart</span>
            <span className="text-xs font-normal text-muted-foreground uppercase tracking-widest">
              {items.length} {items.length === 1 ? 'Item' : 'Items'}
            </span>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-8">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground font-medium">Your cart is empty</p>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex space-x-4">
                    <div className="h-24 w-20 flex-shrink-0 overflow-hidden bg-secondary">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/products/men-model.jpg';
                        }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium leading-none">{item.product.name}</h4>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.variant.size && `Size: ${item.variant.size}`}
                          {item.variant.size && item.variant.color && ' | '}
                          {item.variant.color && `Color: ${item.variant.color}`}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border rounded-sm">
                          <button
                            className="p-1 hover:bg-secondary transition-colors"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-xs font-medium">{item.quantity}</span>
                          <button
                            className="p-1 hover:bg-secondary transition-colors"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold">
                          {((item.variant.price || item.product.basePrice) * item.quantity).toLocaleString()} ETB
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <SheetFooter className="p-6 bg-secondary/50 border-t sm:flex-col space-y-4">
              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">{subtotal.toLocaleString()} ETB</span>
                </div>
                <p className="text-[10px] text-muted-foreground italic text-center">
                  Shipping and taxes calculated at checkout.
                </p>
              </div>
              <Button className="w-full py-6 uppercase tracking-widest font-bold text-xs" onClick={handleCheckout}>
                Checkout
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
