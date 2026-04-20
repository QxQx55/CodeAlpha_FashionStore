import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { blink } from '@/lib/blink';
import { useCart } from '@/components/cart-provider';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Heart, Share2, Ruler, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_PRODUCTS, MOCK_VARIANTS } from '@/lib/mock-data';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { user, login } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const productData = await (blink.db as any).products.list({
          where: { slug }
        });

        if (productData.length === 0) {
          // Try mock data
          const mockProd = MOCK_PRODUCTS.find(p => p.slug === slug);
          if (mockProd) {
            setProduct(mockProd);
            const mockVars = MOCK_VARIANTS.filter(v => v.productId === mockProd.id).map(v => ({
              ...v,
              imageUrls: JSON.stringify(mockProd.images)
            }));
            setVariants(mockVars);
            setSelectedVariant(mockVars[0] || null);
            setLoading(false);
            return;
          }
        }

        if (productData.length > 0) {
          const p = productData[0];
          setProduct(p);

          const variantData = await (blink.db as any).productVariants.list({
            where: { productId: p.id }
          });
          setVariants(variantData);
          if (variantData.length > 0) {
            setSelectedVariant(variantData[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch product detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  // Check wishlist status
  useEffect(() => {
    const checkWishlist = async () => {
      if (!user || !product) return;
      try {
        const wishlist = await (blink.db as any).wishlist.list({
          where: { userId: user.id, productId: product.id }
        });
        setIsInWishlist(wishlist.length > 0);
      } catch (error) {
        console.error('Failed to check wishlist:', error);
      }
    };
    checkWishlist();
  }, [user, product]);

  const toggleWishlist = async () => {
    if (!user) {
      toast.error('Please sign in to save items to your wishlist');
      login(window.location.href);
      return;
    }
    if (!product) return;

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

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
    } catch (error) {
      // User cancelled or error
    }
  };

  let images = [];
  try {
    images = selectedVariant ? JSON.parse(selectedVariant.imageUrls || '[]') : [];
  } catch (e) {
    images = selectedVariant?.imageUrls ? [selectedVariant.imageUrls] : [];
  }
  
  if (images.length === 0 && product?.imageUrl) {
    images = [product.imageUrl];
  }

  if (loading) return <div className="py-40 text-center animate-pulse">Loading product...</div>;
  if (!product) return <div className="py-40 text-center">Product not found</div>;

  return (
    <div className="container mx-auto px-4 py-32 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Images Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[3/4] bg-secondary overflow-hidden group">
            {images.length > 0 ? (
              <img 
                src={images[currentImageIndex]} 
                alt={product.name} 
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1020&auto=format&fit=crop';
                }}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground italic">No image available</div>
            )}
            
            {images.length > 1 && (
              <>
                <button 
                  onClick={() => setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {images.map((img: string, i: number) => (
              <button 
                key={i} 
                onClick={() => setCurrentImageIndex(i)}
                className={cn(
                  "h-24 w-20 flex-shrink-0 bg-secondary overflow-hidden border-2 transition-all",
                  currentImageIndex === i ? "border-accent" : "border-transparent opacity-60"
                )}
              >
                <img 
                  src={img} 
                  alt={`Thumb ${i}`} 
                  className="h-full w-full object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=100&auto=format&fit=crop';
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Info Column */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-2">
            <h1 className="font-serif text-3xl md:text-4xl font-bold uppercase tracking-tight">{product.name}</h1>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold">{(selectedVariant?.price || product.basePrice).toLocaleString()} ETB</p>
              <div className="flex space-x-2">
                <button 
                  onClick={toggleWishlist}
                  disabled={wishlistLoading}
                  className={cn(
                    "p-2 transition-colors",
                    isInWishlist ? "text-red-500" : "hover:text-accent"
                  )}
                >
                  <Heart className={cn("h-5 w-5", isInWishlist && "fill-current")} />
                </button>
                <button onClick={handleShare} className="p-2 hover:text-accent transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Variants Selection */}
          <div className="space-y-6">
            {/* Color/Material Selection (visualized as circles if possible, or just text) */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Variant</label>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <Button
                    key={v.id}
                    variant={selectedVariant?.id === v.id ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedVariant(v);
                      setCurrentImageIndex(0);
                    }}
                    className="h-auto py-2 px-4 flex flex-col items-start gap-1"
                  >
                    <span className="text-xs font-bold">{v.size || 'N/A'}</span>
                    <span className="text-[10px] opacity-70 uppercase">{v.color || v.material || 'Default'}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <button 
                onClick={() => setShowSizeGuide(true)}
                className="flex items-center hover:text-accent transition-colors"
              >
                <Ruler className="mr-2 h-4 w-4" /> Size Guide
              </button>
              {selectedVariant && selectedVariant.stock < 5 && selectedVariant.stock > 0 && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-none">
                  Only {selectedVariant.stock} left
                </Badge>
              )}
            </div>

            {/* Size Guide Dialog */}
            <Dialog open={showSizeGuide} onOpenChange={setShowSizeGuide}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-serif uppercase tracking-tight">Size Guide</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {product.sizeGuide ? (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{product.sizeGuide}</p>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Use this guide to find your perfect fit. Measurements are in inches.
                      </p>
                      <div className="border rounded-sm overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-secondary">
                            <tr>
                              <th className="px-4 py-2 text-left font-bold">Size</th>
                              <th className="px-4 py-2 text-left">Chest</th>
                              <th className="px-4 py-2 text-left">Waist</th>
                              <th className="px-4 py-2 text-left">Hip</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            <tr><td className="px-4 py-2 font-bold">XS</td><td className="px-4 py-2">32-34</td><td className="px-4 py-2">26-28</td><td className="px-4 py-2">34-36</td></tr>
                            <tr><td className="px-4 py-2 font-bold">S</td><td className="px-4 py-2">34-36</td><td className="px-4 py-2">28-30</td><td className="px-4 py-2">36-38</td></tr>
                            <tr><td className="px-4 py-2 font-bold">M</td><td className="px-4 py-2">36-38</td><td className="px-4 py-2">30-32</td><td className="px-4 py-2">38-40</td></tr>
                            <tr><td className="px-4 py-2 font-bold">L</td><td className="px-4 py-2">38-40</td><td className="px-4 py-2">32-34</td><td className="px-4 py-2">40-42</td></tr>
                            <tr><td className="px-4 py-2 font-bold">XL</td><td className="px-4 py-2">40-42</td><td className="px-4 py-2">34-36</td><td className="px-4 py-2">42-44</td></tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs text-muted-foreground italic">
                        Still unsure? Our customer service team is happy to help with fit questions.
                      </p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              className="w-full h-14 uppercase tracking-widest font-bold text-sm"
              disabled={!selectedVariant || selectedVariant.stock === 0}
              onClick={() => addItem(selectedVariant.id, 1)}
            >
              {selectedVariant?.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
            </Button>
          </div>

          {/* Product Info Accordion */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="details">
              <AccordionTrigger className="text-xs font-bold uppercase tracking-widest">Details</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="fit">
              <AccordionTrigger className="text-xs font-bold uppercase tracking-widest">Fit & Sizing</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {product.fitNotes || 'Standard fit. Refer to size guide for measurements.'}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger className="text-xs font-bold uppercase tracking-widest">Shipping & Returns</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                Free standard shipping on orders over $150. Returns accepted within 30 days of purchase in original condition.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}