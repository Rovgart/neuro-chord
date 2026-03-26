'use client'
import ReduxProvider from "./ReduxProvider";
import { Toast, Button, toast } from '@heroui/react';



export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <Toast.Provider placement="bottom end" />
         
        {children}
    </ReduxProvider>
  )
}