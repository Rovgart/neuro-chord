'use client';

import { neuroapi } from '@/services/api';
import { useAppStore } from '@/store';
import type { MaterialsListResponse } from '../../types/materials';

type Props = { data: MaterialsListResponse | null | undefined };

function MaterialsHydrator({ data }: Props) {
  const store = useAppStore();

  if (data) {
    store.dispatch(neuroapi.util.upsertQueryData('getOwnedMaterials', undefined, data));
  }

  return null;
}

export default MaterialsHydrator;
