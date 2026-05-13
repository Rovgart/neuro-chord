// app/dashboard/page.tsx

import { getServerAuth } from '@/features/auth/services/server-role-auth';
import { UserRole } from '@/features/onboarding/types';
import { redirect } from 'next/navigation';

export default async function DashboardRootPage() {
  const session = await getServerAuth();

  if (!session?.role) {
    redirect('/sign-in');
  }

  const routes: Record<string, string> = {
    [UserRole.Teacher]: '/dashboard/teacher',
    [UserRole.TeacherPending]: '/dashboard/teacher',
    [UserRole.Student]: '/dashboard/student',
  };

  const targetPath = routes[session.role];

  if (targetPath) {
    redirect(targetPath);
  }

  redirect('/sign-in');
}
