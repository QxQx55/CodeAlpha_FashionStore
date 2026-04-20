import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { toast } from 'sonner';

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground border-t">
      <div className="container mx-auto px-4 py-12 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <span className="font-serif text-2xl font-bold tracking-tighter uppercase">Vogue</span>
            <p className="text-muted-foreground text-sm max-w-xs">
              Redefining D2C fashion with a collection-first approach. Quality pieces designed for your everyday life.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-accent transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="hover:text-accent transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="hover:text-accent transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="hover:text-accent transition-colors"><Youtube className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h3 className="font-medium uppercase tracking-wider text-xs">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/collections/all" className="hover:text-foreground transition-colors">All Collections</Link></li>
              <li><Link to="/collections/new-arrivals" className="hover:text-foreground transition-colors">New Arrivals</Link></li>
              <li><Link to="/collections/best-sellers" className="hover:text-foreground transition-colors">Best Sellers</Link></li>
              <li><Link to="/collections/sale" className="hover:text-foreground transition-colors">Sale</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-medium uppercase tracking-wider text-xs">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button onClick={() => toast.info('Contact us at support@vogue.com')} className="hover:text-foreground transition-colors">Contact Us</button></li>
              <li><button onClick={() => toast.info('Free shipping on orders over $150. Returns accepted within 30 days.')} className="hover:text-foreground transition-colors">Shipping & Returns</button></li>
              <li><button onClick={() => toast.info('Check each product page for detailed size guides.')} className="hover:text-foreground transition-colors">Size Guide</button></li>
              <li><button onClick={() => toast.info('For questions, email support@vogue.com or visit your Account page.')} className="hover:text-foreground transition-colors">FAQs</button></li>
            </ul>
          </div>

          {/* Newsletter */}
          <NewsletterForm />
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground space-y-4 md:space-y-0">
          <p>© 2026 Vogue Commerce. All rights reserved.</p>
          <div className="flex space-x-8">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    // Simulate newsletter signup
    setTimeout(() => {
      toast.success('Welcome! Check your inbox for your 10% discount code.');
      setEmail('');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium uppercase tracking-wider text-xs">Newsletter</h3>
      <p className="text-sm text-muted-foreground">
        Join our community and get 10% off your first order.
      </p>
      <form className="flex space-x-2" onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Email address" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-background border px-4 py-2 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-accent"
          required
        />
        <button 
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? '...' : 'Join'}
        </button>
      </form>
    </div>
  );
}
