import type { UserDto } from '@/features/auth/types';
import type { UserRole } from '@/features/onboarding/types';
import { getRoleFromToken } from '@/utils';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '..';
export type AuthState = {
  user: UserDto | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
};
const initState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  role: null,
};
const authSlice = createSlice({
  name: 'auth-slice',
  initialState: initState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: UserDto | null; accessToken: string | null }>) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.token = accessToken;
      state.isAuthenticated = true;
      state.role = getRoleFromToken(accessToken || '');
    },
    removeCredentials: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.role = null;
    },
  },
});
export const { setCredentials, removeCredentials } = authSlice.actions;
export default authSlice.reducer;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentToken = (state: RootState) => state.auth.token;
