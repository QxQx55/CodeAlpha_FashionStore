import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-provider';
import { storeApi } from '@/lib/store-api';
import { toast } from 'sonner';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    images?: string[];
    imageUrl?: string;
  };
}

const fallbackImage = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1020&auto=format&fit=crop';

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const { user, login } = useAuth();

  useEffect(() => {
    let active = true;
    if (!user) {
      setIsInWishlist(false);
      return;
    }
    storeApi.db.wishlist.list({
      where: { userId: user.id, productId: product.id },
    }).then((wishlist) => {
      if (active) setIsInWishlist(wishlist.length > 0);
    }).catch((error) => {
      console.error('Failed to check wishlist:', error);
    });
    return () => {
      active = false;
    };
  }, [user, product.id]);

  const toggleWishlist = async () => {
    if (!user) {
      toast.error('Please sign in to save items');
      login(window.location.href);
      return;
    }

    setWishlistLoading(true);
    try {
      const wishlist = await storeApi.db.wishlist.list({
        where: { userId: user.id, productId: product.id },
      });
      if (wishlist.length > 0) {
        await storeApi.db.wishlist.delete(wishlist[0].id);
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await storeApi.db.wishlist.create({ userId: user.id, productId: product.id });
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const images = (product.images || []).filter((image) => image?.trim());
  const mainImage = images[0] || product.imageUrl || fallbackImage;
  const secondaryImage = images[1];

  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-md border border-gray-100 bg-white transition-shadow hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <Link to={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
          <div className="aspect-[4/5] overflow-hidden bg-[#f7f7f7]">
            <img
              src={isHovered && secondaryImage ? secondaryImage : mainImage}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.src = fallbackImage;
              }}
            />
          </div>
        </Link>
        <button
          type="button"
          onClick={toggleWishlist}
          disabled={wishlistLoading}
          aria-label={isInWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={isInWishlist}
          className={cn(
            'absolute right-2 top-2 rounded-full bg-white/95 p-2 text-gray-700 shadow-sm transition-colors hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:opacity-50',
            isInWishlist && 'text-red-600',
          )}
        >
          <Heart className={cn('h-4 w-4', isInWishlist && 'fill-current')} />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-start p-3">
        <Link to={`/products/${product.slug}`} className="line-clamp-2 min-h-10 text-left text-sm leading-5 text-gray-800 hover:text-[#176b73]">
          {product.name}
        </Link>
        <p className="mt-2 text-base font-bold text-gray-950">
          {product.basePrice.toLocaleString()} <span className="text-xs font-medium">ETB</span>
        </p>
        <p className="mt-1 text-xs text-gray-600">Delivery options at checkout</p>
        <Link
          to={`/products/${product.slug}`}
          className="mt-3 inline-flex min-h-9 w-full items-center justify-center rounded-full border border-[#d5d9d9] bg-[#ffd814] px-3 text-xs font-semibold text-gray-900 transition-colors hover:bg-[#f7ca00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
