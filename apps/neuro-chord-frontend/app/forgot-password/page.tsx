'use client';
import { useSearchParams } from 'next/navigation';
import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm';

function Page() {
  const searchPar = useSearchParams();
  const token = searchPar.get('token');

  return <ForgotPasswordForm />;
}

export default Page;
