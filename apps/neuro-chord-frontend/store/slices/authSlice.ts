import type { User } from '@/types';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '..';
export type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
};

const initState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};
const authSlice = createSlice({
  name: 'auth-slice',
  initialState: initState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User | null; accessToken: string | null }>) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.token = accessToken;
      state.isAuthenticated = true;
    },
    removeCredentials: (state) => {
      // biome-ignore lint/complexity/noCommaOperator: <Implementing recommended pattern for Next.js >
      (state.isAuthenticated = false), (state.token = null), (state.user = null);
    },
  },
});
export const { setCredentials, removeCredentials } = authSlice.actions;
export default authSlice.reducer;
export const selectCurrentUser = (state: RootState) => state.auth?.user;
export const selectCurrentToken = (state: RootState) => state.auth?.token;
