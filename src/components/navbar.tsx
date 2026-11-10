import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Heart, LogOut, Menu, Search, Settings, ShoppingBag, UserRound, X } from 'lucide-react';
import { useCart } from './cart-provider';
import { useAuth } from './auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { storeApi } from '@/lib/store-api';
import { MOCK_COLLECTIONS } from '@/lib/mock-data';

interface CollectionLink {
  id: string;
  name: string;
  slug: string;
}

const collectionOrder = ['women', 'men', 'kids', 'shoes', 'traditional', 'accessories', 'outerwear', 'activewear'];

function sortCollections(collections: CollectionLink[]) {
  const uniqueCollections = [...new Map(collections.map((collection) => [collection.slug, collection])).values()];
  return uniqueCollections.sort((a, b) => {
    const aOrder = collectionOrder.indexOf(a.slug);
    const bOrder = collectionOrder.indexOf(b.slug);
    if (aOrder === -1 && bOrder === -1) return a.name.localeCompare(b.name);
    if (aOrder === -1) return 1;
    if (bOrder === -1) return -1;
    return aOrder - bOrder;
  });
}

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [collections, setCollections] = useState<CollectionLink[]>([]);
  const { totalCount, setIsOpen: setIsCartOpen } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    storeApi.db.collections.list({ where: { active: '1' } })
      .then((data) => setCollections(sortCollections(data.length > 0 ? data : MOCK_COLLECTIONS)))
      .catch((error) => {
        console.error('Failed to fetch collections:', error);
        setCollections(sortCollections(MOCK_COLLECTIONS));
      });
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setSearchQuery('');
    setSelectedCollection('');
  }, [location]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim().slice(0, 120);
    const collectionPath = selectedCollection ? `/collections/${selectedCollection}` : '/collections/all';
    navigate(query ? `${collectionPath}?q=${encodeURIComponent(query)}` : collectionPath);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const accountLabel = user ? `Hello, ${user.displayName.split(' ')[0]}` : 'Sign in';
  const accountPath = isAuthenticated ? '/account' : '/login';
  const navLinkClass = ({ isActive }: { isActive: boolean }) => (
    `shrink-0 rounded-sm px-2 py-1 transition-colors ${
      isActive ? 'bg-[#fff5ef] text-[#df713a]' : 'text-[#3d3d3d] hover:bg-[#fff5ef] hover:text-[#df713a]'
    }`
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      <div className="bg-[#f5f5f5] px-4 py-1.5 text-center text-[10px] tracking-wide text-[#555] sm:text-left">
        <div className="container mx-auto flex items-center justify-between">
          <span>Free delivery on orders over 5,000 ETB</span>
          <span className="hidden sm:inline">Thoughtful Ethiopian fashion · Welcome to Wende</span>
        </div>
      </div>

      <div className="container mx-auto grid min-h-[72px] grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2 sm:gap-6 sm:px-5 lg:grid-cols-[190px_minmax(250px,1fr)_auto] lg:px-8">
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded p-2 text-gray-800 hover:bg-gray-100 lg:hidden"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link to="/" className="flex shrink-0 flex-col leading-none" aria-label="Wende home">
            <span className="text-[22px] font-black tracking-[0.08em] text-[#222] sm:text-[27px]">WENDE<span className="text-[#e57c45]">.</span></span>
            <span className="mt-1 text-[7px] font-semibold tracking-[0.25em] text-gray-500 sm:text-[8px]">FASHION WITH A STORY</span>
          </Link>
        </div>

        <form onSubmit={handleSearch} role="search" className="col-span-3 order-last flex h-10 w-full overflow-hidden rounded-sm border border-[#dedede] bg-white sm:col-span-1 sm:order-none lg:mx-5">
          <label htmlFor="store-search-category" className="sr-only">Search category</label>
          <select
            id="store-search-category"
            aria-label="Search in category"
            value={selectedCollection}
            onChange={(event) => setSelectedCollection(event.target.value)}
            className="hidden max-w-[130px] border-r border-[#dedede] bg-[#f6f6f6] px-2 text-xs text-gray-700 outline-none sm:block"
          >
            <option value="">All Categories</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.slug}>{collection.name}</option>
            ))}
          </select>
          <label htmlFor="store-search" className="sr-only">Search Wende products</label>
          <Input
            id="store-search"
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            maxLength={120}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-3 text-xs shadow-none focus-visible:ring-0 sm:text-sm"
          />
          <Button type="submit" aria-label="Search" className="h-full rounded-none bg-[#e77b43] px-4 text-white hover:bg-[#d96831]">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex items-center justify-end gap-1 sm:gap-3">
          <Link to={accountPath} aria-label={accountLabel} className="flex items-center gap-2 text-gray-800 hover:text-[#d96831]">
            <UserRound className="h-[19px] w-[19px]" />
            <span className="hidden leading-tight md:block">
              <span className="block text-[10px] text-gray-500">{user ? accountLabel : 'Hello, welcome'}</span>
              <span className="block text-xs font-semibold">{user ? 'My account' : 'Sign in / Register'}</span>
            </span>
          </Link>
          <Link to="/account/wishlist" aria-label="Wishlist" className="hidden rounded p-2 text-gray-800 hover:text-[#d96831] sm:block">
            <Heart className="h-[19px] w-[19px]" />
          </Link>
          {user?.isAdmin && (
            <Link to="/admin/products" aria-label="Manage products" title="Manage products" className="hidden rounded p-2 text-gray-800 hover:text-[#d96831] md:block">
              <Settings className="h-[19px] w-[19px]" />
            </Link>
          )}
          {isAuthenticated && (
            <button type="button" onClick={handleLogout} aria-label="Log out" title="Log out" className="hidden rounded p-2 text-gray-700 hover:text-[#d96831] lg:block">
              <LogOut className="h-[19px] w-[19px]" />
            </button>
          )}
          <button
            type="button"
            aria-label={`Open bag, ${totalCount} items`}
            onClick={() => setIsCartOpen(true)}
            className="relative rounded p-2 text-gray-800 hover:text-[#d96831]"
          >
            <ShoppingBag className="h-[20px] w-[20px]" />
            {totalCount > 0 && (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e77b43] px-1 text-[10px] font-bold text-white">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <nav aria-label="Shop categories" className="border-y border-[#ededed] bg-[#fcfcfc]">
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.05em] sm:gap-x-5 sm:px-4 sm:text-[10px] sm:tracking-[0.08em] lg:gap-x-8">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          {collections.map((collection) => (
            <NavLink key={collection.slug} to={`/collections/${collection.slug}`} className={navLinkClass}>
              {collection.name}
            </NavLink>
          ))}
          <NavLink to="/collections/all?sort=newest" className={navLinkClass}>New arrivals</NavLink>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <nav aria-label="Mobile shop menu" className="absolute left-0 top-full z-50 max-h-[75vh] w-full overflow-y-auto border-t bg-white p-4 text-gray-900 shadow-lg lg:hidden">
          <Link to={accountPath} className="mb-3 flex items-center gap-2 border-b pb-3 font-semibold">
            <UserRound className="h-5 w-5" /> {user ? `Hello, ${user.displayName}` : 'Sign in to your account'}
          </Link>
          <Link to="/account/wishlist" className="block border-b py-3">Wishlist</Link>
          {user?.isAdmin && <Link to="/admin/products" className="block border-b py-3 font-semibold">Manage products</Link>}
          {isAuthenticated && (
            <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 py-3 text-left font-semibold text-[#d96831]">
              <LogOut className="h-4 w-4" /> Log out
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
