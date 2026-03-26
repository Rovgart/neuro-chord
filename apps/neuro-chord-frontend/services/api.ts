import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { LoginSchema, RegisterSchema } from '@/schemas/auth';
import type { LoginResponseT, UserRegisterResponseT } from '@/types';

const baseQuery = fetchBaseQuery({ baseUrl: 'http://localhost:3000/' });

const baseQueryWithReauth: BaseQueryFn = async (args, api, options) => {
  //  First call
  const result = await baseQuery(args, api, options);
  // If error === 401
  if (result.error?.status === 401) {
    try {
      // Try to refresh token
    } catch (err: unknown) {
      //  else logout user
    }
  }
};
export const neuroapi = createApi({
  reducerPath: 'neuroapi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000',
    prepareHeaders: (headers) => {
      const token = headers.getSetCookie();
      console.log(token);
    },
  }),
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
        url: `auth?email=${email}`,
        method: 'POST',
      }),
    }),
    refreshToken:builder.query({
      query:()=>P{}
    })
  }),
})
export const {
  useLoginMutation,
  useLazyCheckEmailQuery,
  useLogoutMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useCompleteProfileMutation,
  useGetProfileQuery,
} = neuroapi;
