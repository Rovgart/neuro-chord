import type { MaterialsListResponse } from '@/features/dashboard/types/materials';

// features/profiles/services/profile-server.ts
export const getMyMaterials = async (token: string): Promise<MaterialsListResponse | null> => {
  try {
    const response = await fetch('http://localhost:3000/api/materials/owned', {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error('Materials fetch failed:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Network error while fetching materials:', error);
    return null;
  }
};
