'use client';
import { Toast } from '@heroui/react';
import ReduxProvider from './ReduxProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <Toast.Provider placement="bottom end" />

      {children}
    </ReduxProvider>
  );
}
