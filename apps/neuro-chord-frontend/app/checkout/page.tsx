'use client';

import { useCreateCheckoutSessionsMutation } from '@/services/api';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const planId = searchParams.get('planId');
  const priceId = searchParams.get('priceId');

  const [createCheckoutSessions, { error: apiError }] = useCreateCheckoutSessionsMutation();

  // Sprawdzamy poprawność parametrów w locie, by użyć tej zmiennej w sekcji JSX
  const hasValidParams = !!planId && !!priceId;

  // Hook wywołuje się ZAWSZE na tym samym poziomie, bez żadnych warunków przed nim
  useEffect(() => {
    if (!hasValidParams) return;

    createCheckoutSessions({ planId, priceId })
      .unwrap()
      .then((response) => {
        if (response.url) {
          window.location.href = response.url;
        }
      })
      .catch((err) => {
        console.error('Stripe session creation failed:', err);
      });
  }, [hasValidParams, planId, priceId, createCheckoutSessions]);

  // 1. Obsługa błędu niepoprawnych parametrów URL
  if (!hasValidParams) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-xl font-bold text-red-600">Błąd transakcji</h2>
        <p className="text-gray-500 mt-2">Brak wymaganych parametrów subskrypcji w adresie URL.</p>
      </div>
    );
  }

  // 2. Obsługa błędu bezpośrednio z hooka RTK Query
  if (apiError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-xl font-bold text-red-600">Błąd transakcji</h2>
        <p className="text-gray-500 mt-2">Wystąpił błąd podczas łączenia z serwerem płatności.</p>
      </div>
    );
  }

  // 3. Ekran ładowania (stan domyślny)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
      <h2 className="text-lg font-semibold text-gray-700">Przygotowujemy bezpieczną płatność...</h2>
      <p className="text-sm text-gray-400 mt-1">Za chwilę zostaniesz przekierowany do systemu Stripe.</p>
    </div>
  );
}
