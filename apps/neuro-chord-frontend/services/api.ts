import type { LoginSchema, RegisterSchema } from '@/schemas/auth';
import { setCredentials } from '@/store/slices/authSlice';
import type { LoginResponseT, UserRegisterResponseT } from '@/types';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({ baseUrl: 'http://localhost:3000' });

const baseQueryWithReauth: BaseQueryFn = async (args, api, options) => {
  //  First call
  let result = await baseQuery(args, api, options);
  // If error === 401
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
        body: credentials,
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
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: 'forget-password',
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
    getProfile: builder.query({
      query: () => ({
        url: 'get-profile/',
        method: 'GET',
      }),
    }),
    checkEmail: builder.query({
      query: (email) => ({
        url: `auth/check-email-availability?email=${email}`,
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
  useLazyCheckEmailQuery,
  useLogoutMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useCompleteProfileMutation,
  useGetProfileQuery,
} = neuroapi;
