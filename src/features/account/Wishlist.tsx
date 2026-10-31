import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Trash2
} from 'lucide-react';
import { storeApi } from '@/lib/store-api';
import { toast } from 'sonner';

export function Wishlist() {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    if (!user) return;
    try {
      const wishlist = await (storeApi.db as any).wishlist.list({
        where: { userId: user.id }
      });

      const items = await Promise.all(
        wishlist.map(async (item: any) => {
          const products = await (storeApi.db as any).products.list({
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
      await (storeApi.db as any).wishlist.delete(wishlistId);
      setWishlistItems(prev => prev.filter(item => item.id !== wishlistId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
      {[1,2,3].map(i => <div key={i} className="aspect-[3/4] bg-secondary" />)}
    </div>
  );

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
                  <p className="text-sm font-bold">{Number(item.product.basePrice).toLocaleString()} ETB</p>
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
