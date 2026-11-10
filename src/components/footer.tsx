import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Linkedin, Mail, MessageCircle, Send, Youtube } from 'lucide-react';
import { storeApi, type StorefrontSettings } from '@/lib/store-api';

const socialLinks = [
  { label: 'Telegram', href: 'https://t.me/wendayew', icon: Send },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/wendayew-fkadu-451483440/', icon: Linkedin },
  { label: 'WhatsApp', href: 'https://wa.me/251947506440', icon: MessageCircle },
  { label: 'YouTube', href: 'https://www.youtube.com/@wendayewfkadu', icon: Youtube },
];

export function Footer() {
  const location = useLocation();
  const [settings, setSettings] = useState<StorefrontSettings>({
    shippingReturns: '',
    newsletterOffer: '',
  });
  const [settingsError, setSettingsError] = useState('');

  useEffect(() => {
    let active = true;
    storeApi.api.getStorefrontSettings()
      .then((data) => {
        if (active) setSettings(data);
      })
      .catch((error: unknown) => {
        console.error('Could not load footer content:', error);
        if (active) setSettingsError('Some store details are temporarily unavailable.');
      });

    return () => {
      active = false;
    };
  }, [location.pathname]);

  return (
    <footer className="border-t bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12 lg:px-8">
        <div className={`grid grid-cols-1 gap-12 md:grid-cols-2 ${settings.newsletterOffer ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
          <div className="space-y-4">
            <span className="text-2xl font-extrabold tracking-[0.12em]">WENDE BRAND</span>
            <p className="max-w-xs text-sm text-muted-foreground">Shop Wende Brand online.</p>
            <div className="flex space-x-4">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-muted-foreground transition-colors hover:text-accent"
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-medium uppercase tracking-wider">Shop</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/collections/all" className="transition-colors hover:text-foreground">All Products</Link></li>
              <li><Link to="/collections/women" className="transition-colors hover:text-foreground">Women</Link></li>
              <li><Link to="/collections/men" className="transition-colors hover:text-foreground">Men</Link></li>
              <li><Link to="/collections/traditional" className="transition-colors hover:text-foreground">Traditional Wear</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-medium uppercase tracking-wider">Support</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="mailto:wen1260h@gmail.com" className="inline-flex items-center gap-2 transition-colors hover:text-foreground">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  wen1260h@gmail.com
                </a>
              </li>
              {settings.shippingReturns && (
                <li><Link to="/shipping-returns" className="transition-colors hover:text-foreground">Shipping &amp; Returns</Link></li>
              )}
              <li><Link to="/privacy-policy" className="transition-colors hover:text-foreground">Privacy Policy (Draft)</Link></li>
              <li><Link to="/terms-of-service" className="transition-colors hover:text-foreground">Terms of Service (Draft)</Link></li>
            </ul>
            {settingsError && <p role="status" className="text-xs text-muted-foreground">{settingsError}</p>}
          </div>

          {settings.newsletterOffer && (
            <div className="space-y-4">
              <h2 className="text-xs font-medium uppercase tracking-wider">Offer</h2>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{settings.newsletterOffer}</p>
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between space-y-4 border-t pt-8 text-xs text-muted-foreground md:flex-row md:space-y-0">
          <p>© {new Date().getFullYear()} Wende Brand. All rights reserved.</p>
          <div className="flex space-x-8">
            <Link to="/privacy-policy" className="transition-colors hover:text-foreground">Privacy Policy (Draft)</Link>
            <Link to="/terms-of-service" className="transition-colors hover:text-foreground">Terms (Draft)</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
