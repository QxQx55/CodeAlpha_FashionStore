import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { blink } from '@/lib/blink';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { MOCK_COLLECTIONS, MOCK_PRODUCTS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export function CollectionDetail() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [collection, setCollection] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Extract available sizes and colors from products
  const availableFilters = useMemo(() => {
    const sizes = new Set<string>();
    const colors = new Set<string>();
    let minPrice = Infinity;
    let maxPrice = 0;

    products.forEach(p => {
      const price = Number(p.basePrice);
      if (price < minPrice) minPrice = price;
      if (price > maxPrice) maxPrice = price;
    });

    // Typically you'd also fetch variants, but for now use common sizes
    ['XS', 'S', 'M', 'L', 'XL', 'XXL'].forEach(s => sizes.add(s));
    ['Black', 'White', 'Navy', 'Gray', 'Beige', 'Brown'].forEach(c => colors.add(c));

    return {
      sizes: Array.from(sizes),
      colors: Array.from(colors),
      priceRange: [Math.floor(minPrice || 0), Math.ceil(maxPrice || 1000)] as [number, number]
    };
  }, [products]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let collectionData = await (blink.db as any).collections.list({
          where: { slug }
        });
        
        if (collectionData.length === 0 && slug !== 'all') {
          // Try to find in mock data
          const mockColl = MOCK_COLLECTIONS.find(c => c.slug === slug);
          if (mockColl) {
            setCollection(mockColl);
            const mockProducts = MOCK_PRODUCTS.filter(p => p.collectionId === mockColl.id);
            setProducts(mockProducts);
            setLoading(false);
            return;
          }
        }

        if (slug === 'all') {
          const allProducts = await (blink.db as any).products.list({
            where: { active: "1" }
          });
          
          if (allProducts.length === 0) {
            setProducts(MOCK_PRODUCTS);
            setCollection({ name: 'All Products', description: 'Browse our entire catalog of premium fashion.' });
            setLoading(false);
            return;
          }

          const enriched = await Promise.all(
            allProducts.map(async (p: any) => {
              if (p.imageUrl) return { ...p, images: [p.imageUrl], imageUrl: p.imageUrl };
              const variants = await (blink.db as any).productVariants.list({ where: { productId: p.id }, limit: 1 });
              const v = variants[0];
              let imgs = [];
              try { imgs = JSON.parse(v?.imageUrls || '[]'); } catch { imgs = v?.imageUrls ? [v.imageUrls] : []; }
              return { ...p, images: imgs, imageUrl: imgs[0] || '' };
            })
          );
          setProducts(enriched);
          setCollection({ name: 'All Products', description: 'Browse our entire catalog of premium fashion.' });
          setLoading(false);
          return;
        }
        
        if (collectionData.length > 0) {
          const coll = collectionData[0];
          setCollection(coll);

          const productData = await (blink.db as any).products.list({
            where: { collectionId: coll.id, active: "1" }
          });

          // Use product's main image or fallback to first variant
          const enrichedProducts = await Promise.all(
            productData.map(async (p: any) => {
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
                images = firstVariant?.imageUrls ? [firstVariant.imageUrls] : [];
              }
              return { ...p, images, imageUrl: images[0] || '' };
            })
          );
          setProducts(enrichedProducts);
        }
      } catch (error) {
        console.error('Failed to fetch collection detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  // Get search query from URL params
  const searchQueryParam = searchParams.get('q') || '';

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filter by search query
    if (searchQueryParam) {
      const q = searchQueryParam.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Filter by price range
    result = result.filter(p => {
      const price = Number(p.basePrice);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort products
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => Number(a.basePrice) - Number(b.basePrice));
        break;
      case 'price-high':
        result.sort((a, b) => Number(b.basePrice) - Number(a.basePrice));
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
      default:
        // Assuming newer items have higher ids or later creation
        result.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
        break;
    }

    return result;
  }, [products, sortBy, priceRange, selectedSizes, selectedColors, searchQueryParam]);

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setSearchParams(prev => {
      prev.set('sort', newSort);
      return prev;
    });
  };

  const clearFilters = () => {
    setPriceRange([availableFilters.priceRange[0], availableFilters.priceRange[1]]);
    setSelectedSizes([]);
    setSelectedColors([]);
  };

  const hasActiveFilters = selectedSizes.length > 0 || selectedColors.length > 0 || 
    (priceRange[0] !== availableFilters.priceRange[0] || priceRange[1] !== availableFilters.priceRange[1]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 space-y-12">
        <div className="h-64 bg-secondary animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="aspect-[3/4] bg-secondary animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!collection) return <div className="py-40 text-center">Collection not found</div>;

  return (
    <div className="pb-20 pt-20">
      {/* Header */}
      <section className="container mx-auto px-4 py-12 text-center space-y-6">
        <h1 className="font-serif text-4xl md:text-6xl font-bold uppercase tracking-tighter">
          {searchQueryParam ? `Search: "${searchQueryParam}"` : collection.name}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {searchQueryParam ? `${filteredAndSortedProducts.length} results found` : collection.description}
        </p>
      </section>

      {/* Filters & Sort */}
      <section className="sticky top-[65px] z-40 bg-background/80 backdrop-blur-md border-y py-4 mb-12">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs uppercase tracking-widest font-bold">
                <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
                {hasActiveFilters && (
                  <span className="ml-2 h-2 w-2 rounded-full bg-accent" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle className="font-serif uppercase tracking-tight flex items-center justify-between">
                  Filters
                  {hasActiveFilters && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearFilters}
                      className="text-xs h-auto py-1 px-2"
                    >
                      Clear All
                    </Button>
                  )}
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-8 py-6">
                {/* Price Range Filter */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest">Price Range</h3>
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      min={availableFilters.priceRange[0]}
                      max={availableFilters.priceRange[1]}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Size Filter */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest">Size</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {availableFilters.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSizes(prev => 
                            prev.includes(size) 
                              ? prev.filter(s => s !== size)
                              : [...prev, size]
                          );
                        }}
                        className={cn(
                          "py-2 px-3 text-xs border rounded-sm transition-colors",
                          selectedSizes.includes(size)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "hover:border-accent"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Filter */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest">Color</h3>
                  <div className="space-y-2">
                    {availableFilters.colors.map((color) => (
                      <div key={color} className="flex items-center space-x-2">
                        <Checkbox
                          id={`color-${color}`}
                          checked={selectedColors.includes(color)}
                          onCheckedChange={(checked) => {
                            setSelectedColors(prev => 
                              checked 
                                ? [...prev, color]
                                : prev.filter(c => c !== color)
                            );
                          }}
                        />
                        <Label 
                          htmlFor={`color-${color}`}
                          className="text-sm cursor-pointer"
                        >
                          {color}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full uppercase tracking-widest text-xs font-bold"
                  onClick={() => setIsFilterOpen(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center space-x-4">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold hidden sm:block">
              {filteredAndSortedProducts.length} Products
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs uppercase tracking-widest font-bold">
                  Sort By <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => handleSortChange('newest')}
                  className={cn(sortBy === 'newest' && "font-bold text-accent")}
                >
                  Newest
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleSortChange('price-low')}
                  className={cn(sortBy === 'price-low' && "font-bold text-accent")}
                >
                  Price: Low to High
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleSortChange('price-high')}
                  className={cn(sortBy === 'price-high' && "font-bold text-accent")}
                >
                  Price: High to Low
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleSortChange('name-asc')}
                  className={cn(sortBy === 'name-asc' && "font-bold text-accent")}
                >
                  Name: A-Z
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleSortChange('name-desc')}
                  className={cn(sortBy === 'name-desc' && "font-bold text-accent")}
                >
                  Name: Z-A
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <section className="container mx-auto px-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Active Filters:</span>
            {selectedSizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSizes(prev => prev.filter(s => s !== size))}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-secondary rounded-sm hover:bg-secondary/80"
              >
                Size: {size} <X className="h-3 w-3" />
              </button>
            ))}
            {selectedColors.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColors(prev => prev.filter(c => c !== color))}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-secondary rounded-sm hover:bg-secondary/80"
              >
                {color} <X className="h-3 w-3" />
              </button>
            ))}
            {(priceRange[0] !== availableFilters.priceRange[0] || priceRange[1] !== availableFilters.priceRange[1]) && (
              <button
                onClick={() => setPriceRange([availableFilters.priceRange[0], availableFilters.priceRange[1]])}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-secondary rounded-sm hover:bg-secondary/80"
              >
                ${priceRange[0]} - ${priceRange[1]} <X className="h-3 w-3" />
              </button>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-accent hover:underline ml-2"
            >
              Clear All
            </button>
          </div>
        </section>
      )}

      {/* Product Grid */}
      <section className="container mx-auto px-4">
        {filteredAndSortedProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <p className="text-muted-foreground">
              {products.length === 0 
                ? "No products found in this collection."
                : "No products match your filters."}
            </p>
            {hasActiveFilters ? (
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link to="/">Back to Home</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 lg:gap-x-8">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
