import type { UserRole } from '@/features/onboarding/types';
import { decodeJwt } from 'jose';
import { cookies } from 'next/headers';
// features/auth/services/server-auth.ts
export const getServerAuth = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) return null;

  try {
    const payload = decodeJwt(token);
    return {
      token,
      role: payload.role as UserRole,
      userId: payload.sub, // sub to standardowe miejsce na ID użytkownika
    };
  } catch {
    return null;
  }
};
