import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { blink } from '@/lib/blink';
import { toast } from 'sonner';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number; // camelCase
    images?: string[];
    imageUrl?: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { user, login } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkWishlist = async () => {
      if (!user || !product) return;
      try {
        const wishlist = await (blink.db as any).wishlist.list({
          where: { userId: user.id, productId: product.id }
        });
        setIsInWishlist(wishlist.length > 0);
      } catch (error) {
        // Silently fail
      }
    };
    checkWishlist();
  }, [user, product]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please sign in to save items');
      login(window.location.href);
      return;
    }

    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        const wishlist = await (blink.db as any).wishlist.list({
          where: { userId: user.id, productId: product.id }
        });
        if (wishlist.length > 0) {
          await (blink.db as any).wishlist.delete(wishlist[0].id);
        }
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await (blink.db as any).wishlist.create({
          userId: user.id,
          productId: product.id
        });
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };
  const displayImages = product.images && product.images.length > 0 
    ? product.images.filter(img => img && img.trim() !== '')
    : ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1020&auto=format&fit=crop'];
  
  const finalImages = displayImages.length > 0 ? displayImages : ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1020&auto=format&fit=crop'];
  const hasSecondaryImage = finalImages.length > 1;

  return (
    <div 
      className="group space-y-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${product.slug}`} className="block">
        <div className="aspect-[3/4] overflow-hidden bg-secondary relative">
          {/* Main Image */}
          <img 
            src={finalImages[0]} 
            alt={product.name} 
            className={cn(
              "h-full w-full object-cover transition-opacity duration-700",
              hasSecondaryImage && isHovered ? "opacity-0" : "opacity-100"
            )}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1020&auto=format&fit=crop';
            }}
          />
          
          {/* Secondary Image (shown on hover) */}
          {hasSecondaryImage && (
            <img 
              src={finalImages[1]} 
              alt={`${product.name} detail`} 
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
                isHovered ? "opacity-100 scale-105" : "opacity-0 scale-100"
              )}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1539109132314-34a77ae68c44?q=80&w=987&auto=format&fit=crop';
              }}
            />
          )}

          {/* Quick Add / View Overlay */}
          <div className="absolute bottom-4 left-4 right-4 translate-y-[120%] group-hover:translate-y-0 transition-transform duration-500 ease-out z-10">
            <Button 
              className="w-full bg-white text-black hover:bg-black hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest h-12 rounded-none shadow-xl border-none"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/products/${product.slug}`);
              }}
            >
              Quick View
            </Button>
          </div>

          {/* Badge for multiple colors/images if needed */}
          {displayImages.length > 2 && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 text-[8px] font-bold uppercase tracking-widest">
              +{displayImages.length - 1} Views
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={toggleWishlist}
            disabled={wishlistLoading}
            className={cn(
              "absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full transition-all",
              isInWishlist ? "text-red-500" : "text-muted-foreground hover:text-red-500",
              "opacity-0 group-hover:opacity-100"
            )}
          >
            <Heart className={cn("h-4 w-4", isInWishlist && "fill-current")} />
          </button>
        </div>
      </Link>

      <div className="space-y-1 text-center">
        <Link to={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium hover:text-accent transition-colors duration-300 tracking-tight">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm font-bold tracking-tighter">
          {product.basePrice.toLocaleString()} ETB
        </p>
      </div>
    </div>
  );
}