import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, LogOut, Menu, Search, Settings, ShoppingBag, UserRound, X } from 'lucide-react';
import { useCart } from './cart-provider';
import { useAuth } from './auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { storeApi } from '@/lib/store-api';

interface CollectionLink {
  id: string;
  name: string;
  slug: string;
}

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [collections, setCollections] = useState<CollectionLink[]>([]);
  const { totalCount, setIsOpen: setIsCartOpen } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    storeApi.db.collections.list({ where: { active: '1' } })
      .then(setCollections)
      .catch((error) => console.error('Failed to fetch collections:', error));
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setSearchQuery('');
  }, [location]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim().slice(0, 120);
    if (query) navigate(`/collections/all?q=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="bg-[#ef7056] px-4 py-2 text-center text-[11px] font-semibold tracking-[0.12em] text-white sm:text-xs">
        A NEW SEASON, A NEW STORY <span className="mx-2 opacity-70">·</span> DISCOVER WENDE
      </div>
      <div className="container mx-auto flex min-h-[76px] items-center gap-3 px-4 py-3 lg:gap-8 lg:px-8">
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
          <span className="text-[25px] font-black tracking-[0.1em] text-[#202020]">WENDE<span className="text-[#ef7056]">.</span></span>
          <span className="mt-1 text-[8px] font-semibold tracking-[0.28em] text-gray-500">FASHION WITH A STORY</span>
        </Link>

        <form onSubmit={handleSearch} role="search" className="order-last flex h-10 w-full overflow-hidden rounded-sm border border-gray-200 bg-white sm:order-none sm:ml-auto sm:w-auto sm:flex-1 lg:mx-8 lg:max-w-xl">
          <label htmlFor="store-search" className="sr-only">Search Wende</label>
          <Input
            id="store-search"
            type="search"
            placeholder="Search styles, shoes and more"
            value={searchQuery}
            maxLength={120}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-3 text-sm shadow-none focus-visible:ring-0"
          />
          <Button type="submit" variant="ghost" aria-label="Search" className="h-full rounded-none px-3 text-gray-700 hover:bg-[#fdf0ed] hover:text-[#d95e45]">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:ml-0 sm:gap-2">
          <Link
            to={isAuthenticated ? '/account' : '/login'}
            aria-label={user ? `Account for ${user.displayName}` : 'Sign in'}
            className="hidden items-center gap-2 rounded-sm px-2 py-2 text-gray-800 hover:bg-gray-50 sm:flex"
          >
            <UserRound className="h-5 w-5" />
            <span className="hidden text-left leading-tight md:block">
              <span className="block text-[10px] text-gray-500">{user ? `Hello, ${user.displayName.split(' ')[0]}` : 'Welcome'}</span>
              <span className="block text-xs font-semibold">{user ? 'My account' : 'Sign in'}</span>
            </span>
          </Link>
          <Link to="/account/wishlist" aria-label="Wishlist" className="hidden rounded-sm p-2 text-gray-800 hover:bg-gray-50 sm:block">
            <Heart className="h-5 w-5" />
          </Link>
          <button
            type="button"
            aria-label={`Open bag, ${totalCount} items`}
            onClick={() => setIsCartOpen(true)}
            className="relative rounded-sm p-2 text-gray-800 hover:bg-gray-50"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ef7056] px-1 text-[10px] font-bold text-white">
                {totalCount}
              </span>
            )}
          </button>
          {user?.isAdmin && (
            <Link to="/admin/products" aria-label="Manage products" title="Manage products" className="hidden rounded-sm p-2 text-gray-800 hover:bg-gray-50 md:block">
              <Settings className="h-5 w-5" />
            </Link>
          )}
          {isAuthenticated && (
            <button type="button" onClick={handleLogout} aria-label="Log out" title="Log out" className="hidden items-center gap-1 rounded-sm px-2 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 sm:flex">
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">Log out</span>
            </button>
          )}
        </div>
      </div>

      <nav aria-label="Shop categories" className="hidden border-t border-gray-100 lg:block">
        <div className="container mx-auto flex items-center justify-center gap-7 overflow-x-auto px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.13em] text-gray-700">
          <Link to="/collections/all" className="shrink-0 transition-colors hover:text-[#ef7056]">Shop all</Link>
          {collections.map((collection) => (
            <Link key={collection.id} to={`/collections/${collection.slug}`} className="shrink-0 transition-colors hover:text-[#ef7056]">
              {collection.name}
            </Link>
          ))}
          <Link to="/collections/all?sort=newest" className="shrink-0 transition-colors hover:text-[#ef7056]">New arrivals</Link>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <nav aria-label="Mobile shop menu" className="absolute left-0 top-full z-50 w-full border-t bg-white p-4 text-gray-900 shadow-lg lg:hidden">
          <div className="mb-3 border-b pb-3">
            <Link to={isAuthenticated ? '/account' : '/login'} className="flex items-center gap-2 font-semibold">
              <UserRound className="h-5 w-5" />
              {user ? `Hello, ${user.displayName}` : 'Sign in to your account'}
            </Link>
          </div>
          <Link to="/collections/all" className="block border-b py-3 font-semibold">Shop all</Link>
          {collections.map((collection) => (
            <Link key={collection.id} to={`/collections/${collection.slug}`} className="block border-b py-3">
              {collection.name}
            </Link>
          ))}
          {user?.isAdmin && <Link to="/admin/products" className="block border-b py-3 font-semibold">Manage products</Link>}
          {isAuthenticated ? (
            <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 border-t py-3 text-left font-semibold text-[#d95e45]">
              <LogOut className="h-4 w-4" /> Log out
            </button>
          ) : (
            <Link to="/login" className="block border-t py-3 font-semibold">Sign in</Link>
          )}
        </nav>
      )}
    </header>
  );
}
