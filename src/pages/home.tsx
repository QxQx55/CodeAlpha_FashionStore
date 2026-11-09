import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Headset, ShieldCheck, Truck } from 'lucide-react';
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

const featuredCategorySlugs = ['women', 'men', 'traditional'];
const previewCatalog = import.meta.env.VITE_CATALOG_MODE !== 'live';
const categoryColors = ['bg-[#f6d23b]', 'bg-[#32bfca]', 'bg-[#ed9eaa]'];

export function Home() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadError, setLoadError] = useState('');

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
              fallbackImageUrl: categoryFallbacks.get(collection.id) || collection.imageUrl || '',
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
        if (active) {
          setCollections(MOCK_COLLECTIONS);
          setProducts(MOCK_PRODUCTS);
          setLoadError('Showing the demo catalog. Customer accounts, cart, and checkout need the store API.');
        }
      }
    };

    void fetchStorefront();
    return () => {
      active = false;
    };
  }, []);

  const featuredCollections = featuredCategorySlugs
    .map((slug) => collections.find((collection) => collection.slug === slug))
    .filter((collection): collection is Collection => Boolean(collection));
  const categoryCards = featuredCollections.length === 3 ? featuredCollections : collections.slice(0, 3);

  return (
    <main className="bg-white pb-14">
      <section className="container mx-auto px-3 pt-4 sm:px-5 lg:px-8 lg:pt-5">
        <div className="relative mx-auto grid min-h-[290px] max-w-[1240px] grid-cols-[0.88fr_1.12fr] overflow-hidden bg-[#adedef] sm:min-h-[350px] lg:min-h-[370px]">
          <div className="relative min-h-full overflow-hidden">
            <img
              src="/images/hero-fashion.jpg"
              alt="A model wearing a colorful contemporary fashion look"
              className="absolute inset-0 h-full w-full object-cover object-[center_25%]"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#adedef]/20" />
          </div>
          <div className="relative flex flex-col items-start justify-center px-3 py-6 sm:px-7 lg:px-12">
            <span className="absolute right-2 top-1 font-serif text-[48px] font-bold italic leading-none text-white/20 sm:right-6 sm:top-3 sm:text-8xl lg:text-[130px]">
              Wende
            </span>
            <p className="relative z-10 mb-2 text-[8px] font-bold uppercase tracking-[0.15em] text-[#377b7a] sm:mb-3 sm:text-[10px] sm:tracking-[0.23em]">
              New season · New expression
            </p>
            <h1 className="relative z-10 max-w-md font-serif text-[25px] font-bold italic leading-[1.05] text-[#202525] sm:text-4xl lg:text-[52px]">
              Best Fashion Style
            </h1>
            <p className="relative z-10 mt-2 max-w-xs text-[9px] leading-4 text-[#384e4d] sm:mt-3 sm:text-xs sm:leading-5 lg:text-sm">
              Discover expressive looks and timeless pieces, thoughtfully selected for your everyday style.
            </p>
            <Link
              to="/collections/all"
              className="relative z-10 mt-3 inline-flex min-h-8 items-center gap-3 bg-[#e77b43] px-3 text-[8px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#ca602d] sm:mt-5 sm:min-h-9 sm:px-5 sm:text-[10px]"
            >
              Shop the collection <ArrowRight className="h-3 w-3" />
            </Link>
            <div aria-label="Slide 1 of 3" className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 sm:bottom-4">
              <span className="h-1.5 w-4 rounded-full bg-[#e77b43]" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Shopping benefits" className="container mx-auto max-w-[1050px] px-3 py-4 sm:px-5 sm:py-5">
        <div className="grid grid-cols-3 divide-x divide-[#e6e6e6] border-y border-[#e6e6e6] py-3">
          <div className="flex items-center justify-center gap-2 px-1 text-center sm:gap-3">
            <Truck className="h-4 w-4 shrink-0 text-[#e77b43] sm:h-5 sm:w-5" />
            <div>
              <p className="text-[7px] font-bold uppercase tracking-[0.08em] text-[#333] sm:text-[9px] sm:tracking-[0.12em]">Free delivery</p>
              <p className="mt-0.5 hidden text-[9px] text-gray-500 sm:block">On qualifying orders</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 px-1 text-center sm:gap-3">
            <BadgeCheck className="h-4 w-4 shrink-0 text-[#e77b43] sm:h-5 sm:w-5" />
            <div>
              <p className="text-[7px] font-bold uppercase tracking-[0.08em] text-[#333] sm:text-[9px] sm:tracking-[0.12em]">Authentic style</p>
              <p className="mt-0.5 hidden text-[9px] text-gray-500 sm:block">Made with care</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 px-1 text-center sm:gap-3">
            <Headset className="h-4 w-4 shrink-0 text-[#e77b43] sm:h-5 sm:w-5" />
            <div>
              <p className="text-[7px] font-bold uppercase tracking-[0.08em] text-[#333] sm:text-[9px] sm:tracking-[0.12em]">Here to help</p>
              <p className="mt-0.5 hidden text-[9px] text-gray-500 sm:block">Friendly customer care</p>
            </div>
          </div>
        </div>
      </section>

      {(previewCatalog || loadError) && (
        <p role="status" className="container mx-auto max-w-[1050px] px-3 py-3 text-center text-sm text-red-700 sm:px-5">
          Preview catalog: {loadError || 'These are sample listings, not confirmed products or inventory. Shopping is disabled until your real catalog is loaded.'}
        </p>
      )}

      <section aria-label="Featured categories" className="container mx-auto max-w-[1050px] px-3 sm:px-5">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
          {categoryCards.map((collection, index) => (
            <Link
              key={collection.id}
              to={`/collections/${collection.slug}`}
              className={`group relative flex h-[145px] items-center overflow-hidden ${categoryColors[index]} sm:h-[165px]`}
            >
              <div className="relative z-10 w-[55%] pl-4 sm:pl-5">
                <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-black/60">Explore the edit</p>
                <h2 className="mt-1 font-serif text-xl font-bold leading-tight text-[#232323] sm:text-2xl">{collection.name}</h2>
                <span className="mt-3 inline-flex items-center gap-1 border-b border-black/60 pb-1 text-[8px] font-bold uppercase tracking-[0.12em] text-[#242424]">
                  Shop now <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
              <img
                src={collection.imageUrl || collection.fallbackImageUrl || '/images/products/accessories-flatlay.jpg'}
                alt={`${collection.name} collection`}
                loading="lazy"
                className="absolute right-0 h-full w-[45%] object-cover object-center mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.04]"
                onError={(event) => {
                  const fallbackImage = collection.fallbackImageUrl || collection.imageUrl || '/images/products/accessories-flatlay.jpg';
                  if (event.currentTarget.src !== fallbackImage) event.currentTarget.src = fallbackImage;
                }}
              />
            </Link>
          ))}
          {categoryCards.length === 0 && !loadError && [1, 2, 3].map((item) => (
            <div key={item} className="h-[150px] animate-pulse bg-[#f2eeeb] sm:h-[165px]" />
          ))}
        </div>
        <div className="mt-3 text-center">
          <Link to="/collections/all" className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-gray-600 hover:text-[#d96831]">
            Browse all categories <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>

      <section className="container mx-auto max-w-[1050px] px-3 pt-9 sm:px-5 sm:pt-12">
        <div className="mb-5 text-center sm:mb-6">
          <p className="mb-1 text-[8px] font-bold uppercase tracking-[0.22em] text-[#e77b43]">Picked for you</p>
          <h2 className="font-serif text-2xl font-bold uppercase tracking-[0.04em] text-[#222] sm:text-3xl">Featured products</h2>
          <span className="mx-auto mt-2 block h-[2px] w-10 bg-[#e77b43]" />
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">
          {products.length > 0 ? products.slice(0, 10).map((product) => (
            <ProductCard key={product.id} product={product} />
          )) : !loadError && [1, 2, 3, 4].map((item) => (
            <div key={item} className="animate-pulse space-y-3">
              <div className="aspect-[4/5] bg-[#f2eeeb]" />
              <div className="h-4 w-3/4 bg-[#f2eeeb]" />
              <div className="h-4 w-1/3 bg-[#f2eeeb]" />
            </div>
          ))}
        </div>

        <div className="mt-7 text-center">
          <Link
            to="/collections/all"
            className="inline-flex min-h-10 items-center gap-2 border border-[#df713a] px-6 text-[9px] font-bold uppercase tracking-[0.15em] text-[#d96831] transition-colors hover:bg-[#df713a] hover:text-white"
          >
            View all products <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      <section className="container mx-auto max-w-[1050px] px-3 pt-9 sm:px-5">
        <Link to="/collections/traditional" className="group relative flex min-h-28 items-center justify-between overflow-hidden bg-[#ecf8f6] px-5 py-5 sm:px-8">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#377b7a]">Wende signatures</p>
            <h2 className="mt-1 font-serif text-xl font-semibold text-[#242424] sm:text-2xl">Heritage, made for today.</h2>
            <span className="mt-2 inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.12em] text-[#d96831]">
              Explore traditional wear <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
          <ShieldCheck className="mr-3 h-12 w-12 text-[#5b9c99]/50 sm:mr-8 sm:h-16 sm:w-16" />
        </Link>
      </section>
    </main>
  );
}
