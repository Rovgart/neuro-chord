'use client';
import { useVerifyEmailMutation } from '@/services/api';
import { Button, Card, Spinner } from '@heroui/react';
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
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <Card.Content className="flex flex-col items-center text-center gap-3 py-10">
          {!token && (
            <>
              <p className="text-lg font-medium">Invalid link</p>
              <p className="text-default-500 text-sm">No verification token found.</p>
              <Button variant="outline" onPress={() => router.push('/sign-in')}>
                Back to sign in
              </Button>
            </>
          )}

          {token && isLoading && (
            <>
              <Spinner size="lg" />
              <p className="text-lg font-medium">Verifying your email...</p>
            </>
          )}

          {token && isSuccess && (
            <>
              <p className="text-lg font-medium">Email verified!</p>
              <p className="text-default-500 text-sm">Your account is ready.</p>
              <Button onPress={() => router.push('/sign-in')}>Sign in</Button>
            </>
          )}

          {token && isError && (
            <>
              <p className="text-lg font-medium">Verification failed</p>
              <p className="text-default-500 text-sm">This link may have expired.</p>
              <Button variant="ghost" onPress={() => router.push('/sign-in')}>
                Back to sign in
              </Button>
            </>
          )}
        </Card.Content>
      </Card>
    </div>
  );
}

export default Page;
