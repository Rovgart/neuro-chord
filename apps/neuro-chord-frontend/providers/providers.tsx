'use client';
import ModalManager from '@/features/dashboard/components/modals/ModalManager';
import { Toast } from '@heroui/react';
import ReduxProvider from './ReduxProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <ModalManager />
      <Toast.Provider placement="bottom end" />
      {children}
    </ReduxProvider>
  );
}
