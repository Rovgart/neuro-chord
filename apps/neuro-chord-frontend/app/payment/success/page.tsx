'use client';

import { useRefreshTokenMutation } from '@/services/api';
import { setCredentials } from '@/store/slices/authSlice';
import { Button } from '@heroui/react';
import { CheckCircle, XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

type Status = 'loading' | 'success' | 'error';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<Status>('loading');
  const [refreshTokens] = useRefreshTokenMutation();

  useEffect(() => {
    // Rozwiązanie problemu set-state-in-effect:
    // Jeżeli nie ma sessionId, ustawiamy błąd w następnym cyklu event loopa (setTimeout 0)
    // lub pozwalamy na naturalny przepływ w asynchronicznej funkcji.
    if (!sessionId) {
      setTimeout(() => setStatus('error'), 0);
      return;
    }

    const verifyAndRefresh = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const result = await refreshTokens().unwrap();

        if (result?.accessToken) {
          dispatch(
            setCredentials({
              user: result.user,
              accessToken: result.accessToken,
            }),
          );
          setStatus('success');

          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Payment verification failed', error);
        setStatus('error');
      }
    };

    verifyAndRefresh();
  }, [sessionId, dispatch, refreshTokens]);

  return (
    <div
      className="flex items-center justify-center min-h-screen px-4"
      style={{ background: 'var(--color-bg)', fontFamily: 'var(--font-sans)' }}
    >
      <div
        className="flex flex-col items-center text-center gap-5 w-full max-w-sm p-10"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--card-radius)',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        {/* ── LOADING ──────────────────────────────────────── */}
        {status === 'loading' && (
          <>
            <div
              className="w-14 h-14 rounded-full border-2 border-t-transparent animate-spin"
              style={{
                borderColor: 'var(--color-border)',
                borderTopColor: 'var(--color-primary)',
              }}
            />

            <div className="flex flex-col gap-1.5">
              <p className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                Processing payment…
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                We&apos;re setting up your plan. This will only take a moment.
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{
                    background: 'var(--color-primary)',
                    animationDelay: `${i * 200}ms`,
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* ── SUCCESS ──────────────────────────────────────── */}
        {status === 'success' && (
          <>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: 'oklch(from var(--teal-500) l c h / 0.12)' }}
            >
              <CheckCircle size={28} strokeWidth={1.75} style={{ color: 'var(--teal-500)' }} />
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                Payment successful!
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                Thank you for your purchase. You&apos;ll be redirected to your dashboard in a moment…
              </p>
            </div>
            <div
              className="w-full h-1 rounded-full overflow-hidden"
              style={{ background: 'var(--color-border-subtle)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  background: 'var(--teal-500)',
                  width: '100%',
                  animation: 'shrink 2s linear forwards',
                }}
              />
            </div>

            <style>{`
              @keyframes shrink {
                from { transform: scaleX(1);   transform-origin: left; }
                to   { transform: scaleX(0);   transform-origin: left; }
              }
            `}</style>
          </>
        )}

        {/* ── ERROR ────────────────────────────────────────── */}
        {status === 'error' && (
          <>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: 'var(--color-danger-subtle)' }}
            >
              <XCircle size={28} strokeWidth={1.75} style={{ color: 'var(--color-danger)' }} />
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                Something went wrong
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                We couldn&apos;t verify your payment session. If you were charged, please contact support — we&apos;ll
                sort it out.
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <Button
                onPress={() => router.push('/pricing')}
                className="w-full h-10 text-sm font-semibold transition-colors"
                style={{
                  background: 'var(--button-bg)',
                  color: 'var(--button-text)',
                  borderRadius: 'var(--button-radius)',
                  boxShadow: 'var(--button-shadow)',
                }}
              >
                Back to Pricing
              </Button>

              <Button
                onPress={() => router.push('/support')}
                className="w-full h-10 text-sm font-medium transition-colors"
                style={{
                  background: 'var(--button-ghost-bg)',
                  color: 'var(--button-ghost-text)',
                  border: '1px solid var(--button-ghost-border)',
                  borderRadius: 'var(--button-radius)',
                }}
              >
                Contact Support
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
