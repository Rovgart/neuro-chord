'use client';

import { useVerifyEmailMutation } from '@/services/api';
import { Button } from '@heroui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

function Page() {
  const [verifyEmail, { isLoading, isError, isSuccess }] = useVerifyEmailMutation();
  const params = useSearchParams();
  const token = params.get('token');
  const router = useRouter();

  useEffect(() => {
    if (token) verifyEmail(token);
  }, [token, verifyEmail]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--color-bg)', fontFamily: 'var(--font-sans)' }}
    >
      <div
        className="w-full max-w-sm flex flex-col items-center text-center gap-5 py-10 px-8"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--card-radius)',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        {!token && (
          <>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'var(--color-danger-subtle)' }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M11 7V11M11 15H11.01M21 11C21 16.523 16.523 21 11 21C5.477 21 1 16.523 1 11C1 5.477 5.477 1 11 1C16.523 1 21 5.477 21 11Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ color: 'var(--color-danger)' }}
                />
              </svg>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                Invalid link
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                No verification token was found in this URL.
              </p>
            </div>

            <Button
              className="w-full h-10 text-sm font-medium transition-colors"
              style={{
                background: 'var(--button-ghost-bg)',
                color: 'var(--button-ghost-text)',
                border: '1px solid var(--button-ghost-border)',
                borderRadius: 'var(--button-radius)',
              }}
              onPress={() => router.push('/sign-in')}
            >
              Back to Sign In
            </Button>
          </>
        )}

        {token && isLoading && (
          <>
            <div
              className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
              style={{
                borderColor: 'var(--color-border)',
                borderTopColor: 'var(--color-primary)',
              }}
            />

            <div className="flex flex-col gap-1">
              <p className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                Verifying your email…
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                This will only take a moment.
              </p>
            </div>
          </>
        )}

        {token && isSuccess && (
          <>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'oklch(from var(--teal-500) l c h / 0.12)' }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: 'var(--teal-500)' }}
                />
              </svg>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                Email verified!
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Your account is ready. You can now sign in.
              </p>
            </div>

            <Button
              className="w-full h-10 text-sm font-semibold transition-colors"
              style={{
                background: 'var(--button-bg)',
                color: 'var(--button-text)',
                borderRadius: 'var(--button-radius)',
                boxShadow: 'var(--button-shadow)',
              }}
              onPress={() => router.push('/sign-in')}
            >
              Sign In
            </Button>
          </>
        )}

        {token && isError && (
          <>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'var(--color-danger-subtle)' }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  style={{ color: 'var(--color-danger)' }}
                />
              </svg>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                Verification failed
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                This link may have expired or already been used.
              </p>
            </div>

            <Button
              className="w-full h-10 text-sm font-medium transition-colors"
              style={{
                background: 'var(--button-ghost-bg)',
                color: 'var(--button-ghost-text)',
                border: '1px solid var(--button-ghost-border)',
                borderRadius: 'var(--button-radius)',
              }}
              onPress={() => router.push('/sign-in')}
            >
              Back to Sign In
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default Page;
