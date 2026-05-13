import { decodeJwt } from 'jose';
import { UserRole } from './features/onboarding/types';
export const protectEmail = (email: string | null | undefined) => {
  if (!email || !email.includes('@')) return '********';

  const [localPart, domain] = email.split('@');

  if (localPart.length < 2) {
    return `*****@${domain}`;
  }

  return `${localPart[0]}****@${domain}`;
};

// utils/index.ts
export const getRoleFromToken = (token: string): UserRole | null => {
  // Zmień string na UserRole
  try {
    if (!token) return null; // Dodatkowe zabezpieczenie
    const payload = decodeJwt(token);

    const role =
      (payload?.role as UserRole) ||
      (payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] as UserRole);

    return role || null;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};
