// app/dashboard/(group)/layout.tsx

import { getMyProfile } from '@/features/auth/services/profile-server';
import { getServerAuth } from '@/features/auth/services/server-role-auth';
import Sidebar from '@/features/dashboard/components/sidebar/Sidebar';
import { UserRole } from '@/features/onboarding/types';
import ProfileHydrator from '@/features/profile/components/ProfileHydrator';
import { redirect } from 'next/dist/client/components/navigation';
export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerAuth();
  const allowedRoles = [UserRole.Teacher, UserRole.Student, UserRole.TeacherPending];
  if (!session || !allowedRoles.includes(session.role)) {
    redirect('/sign-in');
  }
  const profile = await getMyProfile(session.token);
  return (
    <div className="grid grid-cols-[280px_1fr] h-screen w-full bg-bg text-text overflow-hidden">
      <ProfileHydrator data={profile} />
      <Sidebar role={session.role} />

      <main className="flex flex-col h-full overflow-hidden">
        <header className="...">
          <p>NYCC</p>
        </header>

        <section className="flex-1 overflow-y-auto p-8 bg-bg scroll-smooth">
          <div className="max-w-7xl mx-auto">{children}</div>
        </section>
      </main>
    </div>
  );
}
