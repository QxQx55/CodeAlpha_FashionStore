import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { storeApi } from '@/lib/store-api';
import { ProductCard } from '@/components/product-card';
import { MOCK_COLLECTIONS, MOCK_PRODUCTS } from '@/lib/mock-data';

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  fallbackImageUrl?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  images?: string[];
  imageUrl?: string;
  collectionId?: string;
}

export function Home() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;
    const fetchStorefront = async () => {
      try {
        const [collectionData, productData] = await Promise.all([
          storeApi.db.collections.list({ limit: 10, where: { active: '1' } }),
          storeApi.db.products.list({ limit: 200, orderBy: { id: 'desc' }, where: { active: '1' } }),
        ]);
        if (productData.length === 0) {
          if (active) {
            setCollections(collectionData.length > 0 ? collectionData : MOCK_COLLECTIONS);
            setProducts(MOCK_PRODUCTS);
          }
          return;
        }

        const visibleProductIds = new Set(productData.slice(0, 10).map((product: Product) => product.id));
        const categoryFallbacks = new Map<string, string>();
        productData.forEach((product: Product) => {
          if (product.collectionId && product.imageUrl && !visibleProductIds.has(product.id) && !categoryFallbacks.has(product.collectionId)) {
            categoryFallbacks.set(product.collectionId, product.imageUrl);
          }
        });
        if (active) {
          setCollections(collectionData.length > 0
            ? collectionData.map((collection: Collection) => ({
              ...collection,
              fallbackImageUrl: categoryFallbacks.get(collection.id) || `https://picsum.photos/seed/wende-category-${collection.slug}/900/1100`,
            }))
            : MOCK_COLLECTIONS);
        }

        const enrichedProducts = await Promise.all(productData.map(async (product: Product) => {
          if (product.imageUrl) return { ...product, images: [product.imageUrl] };
          const variants = await storeApi.db.productVariants.list({ where: { productId: product.id }, limit: 1 });
          let images: string[] = [];
          try {
            images = JSON.parse(variants[0]?.imageUrls || '[]');
          } catch (error) {
            console.warn('Failed to parse product variant images:', error);
            images = variants[0]?.imageUrls ? [variants[0].imageUrls] : [];
          }
          return { ...product, images, imageUrl: images[0] || '' };
        }));
        if (active) setProducts(enrichedProducts);
      } catch (error) {
        console.error('Failed to load storefront content:', error);
      }
    };

    void fetchStorefront();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="bg-white pb-16">
      <section className="container mx-auto px-4 pt-5 lg:px-8 lg:pt-8">
        <div className="relative grid min-h-[430px] overflow-hidden bg-[#c4eeee] sm:min-h-[500px] lg:min-h-[570px] lg:grid-cols-[0.88fr_1.12fr]">
          <div className="relative z-10 flex flex-col items-start justify-center px-7 py-12 sm:px-12 lg:px-16">
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.28em] text-[#356c6a] sm:text-xs">
              Ethiopian craft · Modern expression
            </p>
            <h1 className="max-w-xl text-[42px] font-medium leading-[0.98] tracking-[-0.06em] text-[#242625] sm:text-6xl lg:text-[76px]">
              Wear your
              <span className="mt-1 block font-serif italic text-[#db725a]">own story.</span>
            </h1>
            <p className="mt-6 max-w-sm text-sm leading-7 text-[#465b58] sm:text-base">
              Thoughtful pieces, expressive details, and timeless Ethiopian craftsmanship for the way you live now.
            </p>
            <Link
              to="/collections/all"
              className="group mt-8 inline-flex min-h-12 items-center gap-8 bg-[#202322] px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#db725a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#202322]"
            >
              Explore the collection
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#shop-by-category" className="mt-10 hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#526c68] lg:flex">
              Scroll to explore <ArrowDown className="h-3 w-3" />
            </a>
          </div>
          <div className="absolute inset-0 lg:relative">
            <img
              src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=85&w=1600&auto=format&fit=crop"
              alt="Contemporary fashion editorial from Wende"
              className="h-full w-full object-cover object-[center_30%] opacity-30 lg:absolute lg:inset-0 lg:opacity-100"
              fetchPriority="high"
              onError={(event) => {
                event.currentTarget.src = 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=85&w=1600&auto=format&fit=crop';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#c4eeee] via-[#c4eeee]/75 to-transparent lg:from-transparent lg:via-transparent lg:to-transparent" />
            <div className="absolute bottom-7 right-7 hidden border border-white/80 px-5 py-3 text-right text-white drop-shadow sm:block lg:bottom-10 lg:right-10">
              <span className="block text-[9px] font-semibold uppercase tracking-[0.24em]">The new edit</span>
              <span className="mt-1 block font-serif text-2xl italic">Made to move with you</span>
            </div>
          </div>
          <div className="absolute bottom-5 right-5 h-2 w-2 rounded-full bg-[#db725a] lg:hidden" />
        </div>
      </section>

      <section id="shop-by-category" className="container mx-auto scroll-mt-36 px-4 pt-16 lg:px-8 lg:pt-20">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#db725a]">Find your feeling</p>
            <h2 className="font-serif text-3xl font-medium text-[#222] sm:text-4xl">Shop by category</h2>
          </div>
          <Link to="/collections/all" className="inline-flex items-center gap-2 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#333] hover:text-[#db725a]">
            View all styles <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              to={`/collections/${collection.slug}`}
              className="group relative block aspect-[4/5] overflow-hidden bg-[#f2eeeb]"
            >
              <img
                src={collection.imageUrl || collection.fallbackImageUrl || `https://picsum.photos/seed/wende-category-${collection.slug}/900/1100`}
                alt={collection.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                onError={(event) => {
                  const fallbackImage = collection.fallbackImageUrl || `https://picsum.photos/seed/wende-category-${collection.slug}/900/1100`;
                  if (event.currentTarget.src !== fallbackImage) {
                    event.currentTarget.src = fallbackImage;
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 transition-colors group-hover:from-black/70" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-white sm:p-5">
                <div>
                  <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/75">Explore</p>
                  <h3 className="mt-1 font-serif text-xl sm:text-2xl">{collection.name}</h3>
                </div>
                <span className="grid h-8 w-8 place-items-center rounded-full border border-white/70 transition-all group-hover:border-[#db725a] group-hover:bg-[#db725a]">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
          {collections.length === 0 && [1, 2, 3, 4].map((item) => (
            <div key={item} className="aspect-[4/5] animate-pulse bg-[#f2eeeb]" />
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pt-16 lg:px-8 lg:pt-20">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#db725a]">Just arrived</p>
            <h2 className="font-serif text-3xl font-medium text-[#222] sm:text-4xl">The latest looks</h2>
          </div>
          <Link to="/collections/all?sort=newest" className="inline-flex items-center gap-2 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#333] hover:text-[#db725a]">
            Shop new arrivals <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
          {products.length > 0 ? products.slice(0, 10).map((product) => (
            <ProductCard key={product.id} product={product} />
          )) : [1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="animate-pulse space-y-3">
              <div className="aspect-[4/5] bg-[#f2eeeb]" />
              <div className="h-4 w-3/4 bg-[#f2eeeb]" />
              <div className="h-4 w-1/3 bg-[#f2eeeb]" />
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pt-16 lg:px-8 lg:pt-20">
        <div className="grid overflow-hidden bg-[#f6efea] sm:grid-cols-2">
          <div className="flex flex-col items-start justify-center px-7 py-12 sm:px-12 lg:px-16">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-[#db725a]">The Wende point of view</p>
            <h2 className="max-w-md font-serif text-3xl leading-tight text-[#242424] sm:text-4xl">
              Rooted in heritage. Made for today.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-gray-600">
              We bring Ethiopian craft and contemporary design together in pieces made to feel personal, comfortable, and entirely your own.
            </p>
            <Link to="/collections/traditional" className="mt-7 inline-flex items-center gap-3 border-b border-[#db725a] pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#262626] hover:text-[#db725a]">
              Discover traditional wear <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="min-h-64 overflow-hidden sm:min-h-[370px]">
            <img
              src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=85&w=1200&auto=format&fit=crop"
              alt="A contemporary look inspired by traditional craftsmanship"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
