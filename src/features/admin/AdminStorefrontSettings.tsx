import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { storeApi, type StorefrontSettings } from '@/lib/store-api';

const emptySettings: StorefrontSettings = {
  shippingReturns: '',
  newsletterOffer: '',
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'The storefront settings could not be saved.';
}

export function AdminStorefrontSettings() {
  const [settings, setSettings] = useState<StorefrontSettings>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    storeApi.api.getStorefrontSettings()
      .then((data) => {
        if (active) setSettings(data);
      })
      .catch((error: unknown) => {
        console.error('Could not load storefront settings:', error);
        if (active) setLoadError(getErrorMessage(error));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const saveSettings = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const saved = await storeApi.api.saveStorefrontSettings(settings);
      setSettings(saved);
      setLoadError('');
      toast.success('Storefront content saved.');
    } catch (error) {
      console.error('Could not save storefront settings:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-secondary" /><div className="h-64 bg-secondary" /></div>;

  return (
    <div className="max-w-3xl space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h2 className="font-serif text-2xl font-bold uppercase tracking-tight">Storefront Content</h2>
        <p className="text-sm text-muted-foreground">
          Add confirmed store information for the footer. Shipping and returns stay hidden until you provide text.
          Offer text is displayed as information only; newsletter signup is not connected.
        </p>
      </div>

      {loadError && (
        <p role="alert" className="border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Could not load saved storefront content: {loadError}
        </p>
      )}

      <form className="space-y-6" onSubmit={saveSettings}>
        <div className="space-y-2">
          <label htmlFor="shipping-returns" className="text-sm font-medium">Shipping and returns</label>
          <Textarea
            id="shipping-returns"
            value={settings.shippingReturns}
            onChange={(event) => setSettings({ ...settings, shippingReturns: event.target.value })}
            maxLength={5000}
            rows={8}
            placeholder="Add your confirmed shipping and returns details. Leave blank to keep this section hidden."
          />
          <p className="text-xs text-muted-foreground">{settings.shippingReturns.length}/5,000 characters</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="newsletter-offer" className="text-sm font-medium">Newsletter offer text (optional)</label>
          <Textarea
            id="newsletter-offer"
            value={settings.newsletterOffer}
            onChange={(event) => setSettings({ ...settings, newsletterOffer: event.target.value })}
            maxLength={1000}
            rows={4}
            placeholder="Add an offer only when its details are confirmed. Leave blank to hide it."
          />
          <p className="text-xs text-muted-foreground">{settings.newsletterOffer.length}/1,000 characters</p>
        </div>

        <Button type="submit" disabled={saving || Boolean(loadError)}>
          {saving ? 'Saving...' : 'Save storefront content'}
        </Button>
      </form>
    </div>
  );
}
