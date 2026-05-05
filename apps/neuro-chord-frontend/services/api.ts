import type { LoginSchema, RegisterSchema } from '@/schemas/auth';
import type { RootState } from '@/store';
import { selectCurrentToken, setCredentials } from '@/store/slices/authSlice';
import type { LoginResponseT, UserRegisterResponseT } from '@/types';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const getUserAgent = () => (typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown');

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:3000/api',
  prepareHeaders: (headers, { getState }) => {
    const token = selectCurrentToken(getState() as RootState);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (typeof window !== 'undefined') {
      headers.set('UserAgent', window.navigator.userAgent);
    }
    return headers;
  },
  credentials: 'include',
});

const baseQueryWithReauth: BaseQueryFn = async (args, api, options) => {
  let result = await baseQuery(args, api, options);
  if (result.error?.status === 401) {
    try {
      const refreshResult = await api.dispatch(neuroapi.endpoints.refreshToken.initiate({}));
      if (refreshResult.data) {
        result = await baseQuery(args, api, options);
      } else {
        await api.dispatch(neuroapi.endpoints.logout.initiate({}));
        api.dispatch(setCredentials({ user: null, accessToken: null }));
      }
    } catch (err: unknown) {
      console.error('Reauth error', err);
    }
  }
  return result;
};
export const neuroapi = createApi({
  reducerPath: 'neuroapi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponseT, LoginSchema>({
      query: (credentials) => ({
        url: 'auth/login/',
        method: 'POST',
        body: { ...credentials, userAgent: getUserAgent() },
      }),
    }),
    register: builder.mutation<UserRegisterResponseT, RegisterSchema>({
      query: (data) => ({
        url: 'auth/register',
        method: 'POST',
        body: { email: data.email, password: data.password },
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: 'logout/',
        method: 'POST',
      }),
    }),
    initRecoverAccount: builder.mutation({
      query: (data) => ({
        url: 'auth/init-recover-account',
        method: 'POST',
        body: data,
      }),
    }),
    verifyPin: builder.mutation({
      query: (data) => ({
        url: 'auth/verify-pin',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: 'auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    completeProfile: builder.mutation({
      query: (dto) => ({
        url: 'complete-profile/',
        method: 'POST',
        body: dto,
      }),
    }),
    verifyEmail: builder.mutation({
      query: (data) => {
        return {
          url: `auth/verify-email?token=${data}`,
          method: 'GET',
        };
      },
    }),
    getProfile: builder.query({
      query: () => ({
        url: 'get-profile/',
        method: 'GET',
      }),
    }),
    checkEmail: builder.query({
      query: (email) => ({
        url: `auth/check-email-availability?email=${encodeURIComponent(email)}`,
        method: 'GET',
      }),
    }),
    refreshToken: builder.query({
      query: () => ({
        url: `auth/me`,
        method: 'GET',
      }),
    }),
  }),
});
export const {
  useLoginMutation,
  useVerifyEmailMutation,
  useResetPasswordMutation,
  useLazyCheckEmailQuery,
  useLogoutMutation,
  useInitRecoverAccountMutation,
  useRegisterMutation,
  useVerifyPinMutation,
  useCompleteProfileMutation,
  useGetProfileQuery,
} = neuroapi;
