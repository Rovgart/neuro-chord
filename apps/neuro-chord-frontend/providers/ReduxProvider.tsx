import { type AppStore, makeStore } from '@/store';
import { type ReactNode, useState } from 'react';
import { Provider } from 'react-redux';
import { type Persistor } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

type StoreInstance = { store: AppStore; persistor: Persistor };

export default function ReduxProvider({ children }: { children: ReactNode }) {
  const [{ store, persistor }] = useState<StoreInstance>(() => makeStore());

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
