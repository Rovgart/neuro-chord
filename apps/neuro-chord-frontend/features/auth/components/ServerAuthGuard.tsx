import { redirect } from 'next/navigation';
// components/auth/ServerRoleGuard.tsx
import { getServerAuth } from '@/features/auth/services/server-role-auth';
import type { UserRole } from '@/features/onboarding/types';

interface Props {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export async function ServerRoleGuard({ children, allowedRoles }: Props) {
  const role = await getServerAuth();
  console.log('ServerRoleGuard - role:', role);
  if (!role || !allowedRoles.includes(role.role)) {
    redirect('/sign-in');
  }

  return <>{children}</>;
}
