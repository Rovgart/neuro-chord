import type { UserProfile } from '../types';

// features/profiles/services/profile-server.ts
export const getMyProfile = async (token: string): Promise<Partial<UserProfile> | null> => {
  try {
    const response = await fetch('http://localhost:3000/api/profile/me', {
      headers: { Authorization: `Bearer ${token}` },
      // Opcjonalnie: cache: 'no-store' jeśli dane zmieniają się często
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error('Profile fetch failed:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Network error while fetching profile:', error);
    return null;
  }
};
