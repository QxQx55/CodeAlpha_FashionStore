import React, { createContext, useContext, useEffect, useState } from 'react';
import { blink } from '@/lib/blink';
import { useAuth } from './auth-provider';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  variantId: string;
  quantity: number;
  product: {
    name: string;
    image: string;
    basePrice: number;
  };
  variant: {
    size?: string;
    color?: string;
    price?: number;
    stock: number;
  };
}

interface CartContextType {
  items: CartItem[];
  addItem: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalCount: number;
  subtotal: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setItems([]);
      return;
    }

    try {
      const data = await (blink.db as any).cartItems.list({
        where: { userId: user.id }
      });

      const enrichedItems = await Promise.all(
        (data as any[]).map(async (item) => {
          const variantData = await (blink.db as any).productVariants.list({
            where: { id: item.variantId }
          });
          const v = variantData[0] as any;
          if (!v) return null;

          const productData = await (blink.db as any).products.list({
            where: { id: v.productId }
          });
          const p = productData[0] as any;
          if (!p) return null;

          let images = [];
          try {
            images = JSON.parse(v.imageUrls || '[]');
          } catch (e) {
            images = v.imageUrls ? [v.imageUrls] : [];
          }

          if (images.length === 0 && p.imageUrl) {
            images = [p.imageUrl];
          }

          return {
            id: item.id,
            variantId: item.variantId,
            quantity: item.quantity,
            product: {
              name: p.name,
              image: images[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1020&auto=format&fit=crop',
              basePrice: p.basePrice
            },
            variant: {
              size: v.size,
              color: v.color,
              price: v.price,
              stock: v.stock
            }
          };
        })
      );

      setItems(enrichedItems.filter(Boolean) as CartItem[]);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addItem = async (variantId: string, quantity: number) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      const existing = await (blink.db as any).cartItems.list({
        where: { userId: user.id, variantId: variantId }
      });

      if (existing.length > 0) {
        await (blink.db as any).cartItems.update(existing[0].id, {
          quantity: existing[0].quantity + quantity
        });
      } else {
        await (blink.db as any).cartItems.create({
          userId: user.id,
          variantId: variantId,
          quantity
        });
      }

      await fetchCart();
      setIsOpen(true);
      toast.success('Added to cart');
    } catch (error) {
      toast.error('Failed to add item to cart');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await (blink.db as any).cartItems.delete(itemId);
      await fetchCart();
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await (blink.db as any).cartItems.update(itemId, { quantity });
      await fetchCart();
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      const data = await (blink.db as any).cartItems.list({
        where: { userId: user.id }
      });
      await Promise.all(data.map((item: any) => (blink.db as any).cartItems.delete(item.id)));
      setItems([]);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const price = item.variant.price || item.product.basePrice;
    return sum + (price * item.quantity);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalCount,
        subtotal,
        isOpen,
        setIsOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}