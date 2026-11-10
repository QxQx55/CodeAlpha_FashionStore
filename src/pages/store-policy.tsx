import React, { useEffect, useState } from 'react';
import { storeApi } from '@/lib/store-api';

export function ShippingReturns() {
  const [policy, setPolicy] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    storeApi.api.getStorefrontSettings()
      .then(({ shippingReturns }) => {
        if (active) setPolicy(shippingReturns);
      })
      .catch((requestError: unknown) => {
        console.error('Could not load shipping and returns content:', requestError);
        if (active) setError('Shipping and returns information is temporarily unavailable.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <PolicyPage title="Shipping and Returns">
      {loading ? (
        <p className="animate-pulse text-muted-foreground">Loading store information...</p>
      ) : error ? (
        <p role="alert" className="text-destructive">{error}</p>
      ) : policy ? (
        <p className="whitespace-pre-wrap leading-7">{policy}</p>
      ) : (
        <p className="text-muted-foreground">Shipping and returns information has not been published yet.</p>
      )}
    </PolicyPage>
  );
}

export function LegalPolicyDraft({ kind }: { kind: 'privacy' | 'terms' }) {
  const isPrivacy = kind === 'privacy';
  return (
    <PolicyPage title={isPrivacy ? 'Privacy Policy' : 'Terms of Service'}>
      <div className="mb-8 border border-amber-500/40 bg-amber-500/5 p-4">
        <p className="font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
          Draft — owner review required
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          This is a working draft, not a final policy or legal advice. Wende Brand should review and complete it before relying on or publishing final terms.
        </p>
      </div>
      {isPrivacy ? (
        <div className="space-y-6 leading-7">
          <section>
            <h2 className="mb-2 font-semibold">Information to confirm</h2>
            <p>
              The store account and order flows can involve a customer name, email address, delivery details,
              cart or wishlist contents, order information, and payment status or transaction references.
              Confirm the complete list of information collected and any analytics or marketing tools before this draft is finalized.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-semibold">Use, sharing, and retention</h2>
            <p>
              Add the store&apos;s actual purposes for using customer information, which service providers receive it,
              how long it is retained, and how customers may request access, correction, or deletion. These details
              have not been confirmed for this draft.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-semibold">Contact</h2>
            <p>
              For privacy questions, contact <a className="underline underline-offset-4" href="mailto:wen1260h@gmail.com">wen1260h@gmail.com</a>.
            </p>
          </section>
        </div>
      ) : (
        <div className="space-y-6 leading-7">
          <section>
            <h2 className="mb-2 font-semibold">Details requiring owner approval</h2>
            <p>
              Before these terms can be final, Wende Brand must confirm its legal business details and applicable
              law, product and pricing terms, accepted payment methods, order cancellation rules, and any warranty
              or liability provisions.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-semibold">Shipping, returns, and customer support</h2>
            <p>
              Delivery areas, fees and timing, return eligibility and deadlines, refund handling, and other customer
              support commitments have not been provided. Do not treat this draft as setting those policies.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-semibold">Contact</h2>
            <p>
              For questions, contact <a className="underline underline-offset-4" href="mailto:wen1260h@gmail.com">wen1260h@gmail.com</a>.
            </p>
          </section>
        </div>
      )}
    </PolicyPage>
  );
}

function PolicyPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="container mx-auto max-w-3xl px-4 py-20 lg:px-8">
      <h1 className="mb-10 font-serif text-3xl font-bold uppercase tracking-tight">{title}</h1>
      {children}
    </article>
  );
}
