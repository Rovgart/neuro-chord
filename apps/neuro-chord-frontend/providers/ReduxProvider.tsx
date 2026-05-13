'use client';

import type { UserProfile } from '@/features/auth/types';
import { neuroapi } from '@/services/api';
import { type AppStore, makeStore } from '@/store';
import { type ReactNode, useState } from 'react';
import { Provider } from 'react-redux';
import type { Persistor } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

type StoreInstance = { store: AppStore; persistor: Persistor };

interface ReduxProviderProps {
  children: ReactNode;
  preloadedProfile?: UserProfile | null; // Tutaj trafiają dane z layout.tsx
}

export default function ReduxProvider({ children, preloadedProfile }: ReduxProviderProps) {
  // Inicjalizacja store i persystora
  const [{ store, persistor }] = useState<StoreInstance>(() => makeStore());

  // HYDRACJA: Wstrzykujemy dane profilu bezpośrednio do cache'u RTK Query
  // Robimy to wewnątrz useState (lub useRef), aby wykonało się to tylko raz przy inicjalizacji
  if (preloadedProfile) {
    store.dispatch(neuroapi.util.upsertQueryData('getProfile', undefined, preloadedProfile));
  }

  return (
    <Provider store={store}>
      {/* PersistGate dba o to, by auth z localStorage wróciło na miejsce */}
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
