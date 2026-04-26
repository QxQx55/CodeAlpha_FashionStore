import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { blink } from '@/lib/blink';
import { ProductCard } from '@/components/product-card';
import { MOCK_COLLECTIONS, MOCK_PRODUCTS } from '@/lib/mock-data';

export function Home() {
  const [featuredCollections, setFeaturedCollections] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let collections = await (blink.db as any).collections.list({
          limit: 10,
          where: { active: "1" }
        });
        
        if (collections.length === 0) {
          collections = MOCK_COLLECTIONS;
        }
        setFeaturedCollections(collections);

        let products = await (blink.db as any).products.list({
          limit: 20,
          orderBy: { id: 'desc' },
          where: { active: "1" }
        });
        
        if (products.length === 0) {
          setNewArrivals(MOCK_PRODUCTS);
          return;
        }
        
        // Use product's main image or fallback to first variant
        const enrichedProducts = await Promise.all(
          products.map(async (p: any) => {
            if (p.imageUrl) {
              return { ...p, images: [p.imageUrl], imageUrl: p.imageUrl };
            }
            const variants = await (blink.db as any).productVariants.list({
              where: { productId: p.id },
              limit: 1
            });
            const firstVariant = variants[0];
            let images = [];
            try {
              images = JSON.parse(firstVariant?.imageUrls || '[]');
            } catch (e) {
              console.warn('Failed to parse variant images', e);
              images = firstVariant?.imageUrls ? [firstVariant.imageUrls] : [];
            }
            return { ...p, images, imageUrl: images[0] || '' };
          })
        );
        setNewArrivals(enrichedProducts);
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2071&auto=format&fit=crop" 
            alt="Hero Background" 
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop';
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 text-center text-white space-y-6">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase animate-slide-up">
            Habesha Elegance
          </h1>
          <p className="text-lg md:text-xl font-medium tracking-wide max-w-2xl mx-auto opacity-90 animate-fade-in delay-200">
            Authentic Ethiopian craftsmanship meets modern style. Discover our exclusive collection.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in delay-400">
            <Button size="lg" className="bg-white text-black hover:bg-white/90 px-10 uppercase tracking-widest text-xs font-bold h-14" asChild>
              <Link to="/collections/all">Shop Collection</Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-10 uppercase tracking-widest text-xs font-bold h-14" asChild>
              <Link to="/collections/traditional">Traditional Wear</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 space-y-4 md:space-y-0">
          <div className="space-y-2">
            <h2 className="font-serif text-3xl md:text-4xl font-bold uppercase tracking-tight">Shop by Category</h2>
            <p className="text-muted-foreground">Explore our curated Ethiopian fashion categories.</p>
          </div>
          <Link to="/collections/all" className="flex items-center text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors">
            View All Categories <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {featuredCollections.length > 0 ? (
            featuredCollections.map((collection) => (
              <Link 
                key={collection.id} 
                to={`/collections/${collection.slug}`}
                className="group relative aspect-[3/4] overflow-hidden bg-secondary"
              >
                <img 
                  src={collection.imageUrl || 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop'} 
                  alt={collection.name} 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 text-white space-y-2">
                  <h3 className="text-2xl font-bold uppercase tracking-tight">{collection.name}</h3>
                  <p className="text-sm opacity-80 line-clamp-2 max-w-xs">{collection.description}</p>
                </div>
              </Link>
            ))
          ) : (
            // Skeleton / Placeholder
            [1, 2, 3].map((i) => (
              <div key={i} className="aspect-[3/4] bg-secondary animate-pulse" />
            ))
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container mx-auto px-4">
        <div className="text-center space-y-2 mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold uppercase tracking-tight">New Arrivals</h2>
          <div className="w-20 h-1 bg-accent mx-auto" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 lg:gap-x-8">
          {newArrivals.length > 0 ? (
            newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4 animate-pulse">
                <div className="aspect-[3/4] bg-secondary" />
                <div className="h-4 bg-secondary w-3/4 mx-auto" />
                <div className="h-4 bg-secondary w-1/4 mx-auto" />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Editorial Section */}
      <section id="editorial-section" className="bg-secondary py-20 overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
            <div className="space-y-8 max-w-xl">
              <span className="text-accent text-xs font-bold uppercase tracking-widest">Our Story</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight uppercase tracking-tight">
                Crafted with intention, designed for the long haul.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We believe in clothing that lasts. Not just in durability, but in style. Our pieces are designed to be the backbone of your wardrobe, evolving with you through seasons and years.
              </p>
              <div className="pt-4">
                <Button variant="link" className="px-0 text-sm font-bold uppercase tracking-widest hover:text-accent group" asChild>
                  <Link to="/collections/all">Learn About Our Process <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] bg-background transform lg:translate-x-12 lg:-translate-y-8 z-10 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1539109132314-34a77ae68c44?q=80&w=987&auto=format&fit=crop" 
                  alt="Editorial" 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1490481651871-ab68de2b43d?q=80&w=2070&auto=format&fit=crop';
                  }}
                />
              </div>
              <div className="absolute top-12 right-12 bottom-12 left-12 border-2 border-accent/20 hidden lg:block -z-0" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
