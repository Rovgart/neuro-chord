'use client';
import { type AppStore, makeStore } from '@/store';
import { type ReactNode, useRef } from 'react';
import { Provider } from 'react-redux';
export default function ReduxProvider({ children }: { children: ReactNode }) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const storeRef = useRef<AppStore>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }
  // eslint-disable-next-line react/no-render-return-value
  const store = storeRef.current;
  return <Provider store={store}>{children}</Provider>;
}
