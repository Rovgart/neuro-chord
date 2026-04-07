'use client';
import ForgotPasswordForm from '@/components/forms/featurees/ForgotPasswordForm';
import { useSearchParams } from 'next/navigation';

function Page() {
  const searchPar = useSearchParams();

  return <ForgotPasswordForm />;
}

export default Page;
