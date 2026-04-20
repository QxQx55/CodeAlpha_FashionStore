import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Heart, Search, Menu, X } from 'lucide-react';
import { useCart } from './cart-provider';
import { useAuth } from './auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { blink } from '@/lib/blink';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [collections, setCollections] = useState<any[]>([]);
  const { totalCount, setIsOpen: setIsCartOpen } = useCart();
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const data = await (blink.db as any).collections.list({
          where: { active: "1" }
        });
        setCollections(data);
      } catch (error) {
        console.error('Failed to fetch collections:', error);
      }
    };
    fetchCollections();
  }, []);

  // Close mobile menu and search on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setSearchQuery('');
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/collections/all?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <nav
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        isScrolled ? 'bg-background/80 backdrop-blur-md border-b py-2' : 'bg-transparent py-4'
      )}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium hover:text-accent transition-colors">Home</Link>
            {collections.map((collection) => (
              <Link
                key={collection.id}
                to={`/collections/${collection.slug}`}
                className="text-sm font-medium hover:text-accent transition-colors"
              >
                {collection.name}
              </Link>
            ))}
          </div>

          {/* Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
            <span className="font-serif text-2xl font-bold tracking-tighter uppercase">Habesha</span>
          </Link>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button 
              className="hidden sm:block p-2 hover:text-accent transition-colors"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>
            <Link to="/account" className="p-2 hover:text-accent transition-colors">
              <User className="h-5 w-5" />
            </Link>
            <Link to="/account/wishlist" className="hidden sm:block p-2 hover:text-accent transition-colors">
              <Heart className="h-5 w-5" />
            </Link>
            <button 
              className="p-2 relative hover:text-accent transition-colors"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 w-full bg-background border-b animate-fade-in p-4">
            <form onSubmit={handleSearch} className="container mx-auto flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-none focus-visible:ring-0 text-sm bg-transparent"
                autoFocus
              />
              <Button type="submit" variant="ghost" size="sm" className="text-xs uppercase tracking-widest">
                Search
              </Button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-background border-b animate-fade-in p-4 space-y-4">
            <Link to="/" className="block text-lg font-medium border-b pb-2">Home</Link>
            {collections.map((collection) => (
              <Link
                key={collection.id}
                to={`/collections/${collection.slug}`}
                className="block text-lg font-medium border-b pb-2"
              >
                {collection.name}
              </Link>
            ))}
            <Link to="/account/wishlist" className="block text-lg font-medium border-b pb-2">Wishlist</Link>
            <Link to="/account" className="block text-lg font-medium border-b pb-2">Account</Link>
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="flex items-center space-x-2 border-b pb-2">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-none focus-visible:ring-0 text-sm bg-transparent h-8 p-0"
              />
              <Button type="submit" variant="ghost" size="sm" className="text-xs h-8">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
}
