'use client';

import { neuroapi } from '@/services/api';
import { useAppStore } from '@/store';
import { ProfileResponseDto } from '../types/profile';

type Props = { data: ProfileResponseDto | null | undefined };

function ProfileHydrator({ data }: Props) {
  const store = useAppStore();
  if (data) {
    store.dispatch(neuroapi.util.upsertQueryData('getProfile', undefined, data));
  }
  return null;
}

export default ProfileHydrator;
