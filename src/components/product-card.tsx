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
    isSample?: number;
  };
}

const fallbackImage = '/images/products/men-model.jpg';

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
      className="group flex h-full flex-col bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <Link to={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
          <div className="aspect-[4/5] overflow-hidden bg-[#f5f3f1]">
            <img
              src={isHovered && secondaryImage ? secondaryImage : mainImage}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.src = fallbackImage;
              }}
            />
          </div>
        </Link>
        {product.isSample === 1 && (
          <span className="absolute left-2 top-2 bg-white/95 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-gray-700">
            Sample · not for sale
          </span>
        )}
        <button
          type="button"
          onClick={toggleWishlist}
          disabled={wishlistLoading}
          aria-label={isInWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={isInWishlist}
          className={cn(
            'absolute right-2 top-2 rounded-full bg-white/95 p-2 text-gray-700 shadow-sm transition-colors hover:text-[#df713a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:opacity-50',
            isInWishlist && 'text-red-600',
          )}
        >
          <Heart className={cn('h-4 w-4', isInWishlist && 'fill-current')} />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-start pt-2.5">
        <Link to={`/products/${product.slug}`} className="line-clamp-2 min-h-9 text-left text-[11px] leading-4 text-gray-700 hover:text-[#d96831] sm:text-xs">
          {product.name}
        </Link>
        <p className="mt-1.5 text-sm font-bold text-gray-900">
          {product.basePrice.toLocaleString()} <span className="text-[10px] font-medium">ETB</span>
        </p>
        <Link
          to={`/products/${product.slug}`}
          className="mt-2 inline-flex items-center gap-1 border-b border-[#e77b43] pb-1 text-[8px] font-bold uppercase tracking-[0.12em] text-[#555] transition-colors hover:text-[#d96831] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
        >
          View details <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
