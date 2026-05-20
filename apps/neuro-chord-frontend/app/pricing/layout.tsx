import type { ReactNode } from 'react';

export default function PricingLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: 'var(--color-bg)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {children}
    </div>
  );
}
