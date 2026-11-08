import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { storeApi } from '@/lib/store-api';

export function CheckoutComplete() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const txRef = searchParams.get('tx_ref') || '';

  useEffect(() => {
    let active = true;
    if (!/^[0-9a-f-]{36}$/i.test(txRef)) {
      setError('The payment reference is missing or invalid.');
      return () => {
        active = false;
      };
    }

    storeApi.api.verifyChapaPayment(txRef)
      .then((order) => {
        if (active) navigate(`/account/orders/${order.id}`, { replace: true });
      })
      .catch((verificationError) => {
        if (active) {
          setError(verificationError instanceof Error
            ? verificationError.message
            : 'We could not confirm your payment yet.');
        }
      });

    return () => {
      active = false;
    };
  }, [navigate, txRef]);

  return (
    <div className="container mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center gap-5 px-4 py-16 text-center">
      {error ? (
        <>
          <h1 className="text-2xl font-bold">Payment not confirmed</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">Your order will only be processed after Chapa confirms payment. You can try checking out again or contact store support.</p>
          <Button asChild><Link to="/checkout">Return to checkout</Link></Button>
        </>
      ) : (
        <>
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" role="status" aria-label="Verifying payment" />
          <h1 className="text-xl font-bold">Verifying your payment</h1>
          <p className="text-sm text-muted-foreground">Please wait while we confirm your payment securely with Chapa.</p>
        </>
      )}
    </div>
  );
}
