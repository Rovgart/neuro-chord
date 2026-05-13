import { AuthResponseDto } from '@/features/auth/types';
import { OnboardingDtoType } from '@/features/onboarding/types';
import { ProfileResponseDto } from '@/features/profile/types/profile';
import type { LoginSchema, RegisterSchema } from '@/schemas/auth';
import type { RootState } from '@/store';
import { removeCredentials, selectCurrentToken, setCredentials } from '@/store/slices/authSlice';
import type { UserRegisterResponseT } from '@/types';
import type { BaseQueryApi, BaseQueryFn } from '@reduxjs/toolkit/query';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const getUserAgent = () => (typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown');
interface RefreshTokenResponse {
  user: AuthResponseDto['user'];
  accessToken: string;
}

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:3000/api',
  prepareHeaders: (headers, { getState }) => {
    const token = selectCurrentToken(getState() as RootState);
    console.log('Full State', getState()); // Sprawdź to w konsoli przeglądarki
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
      const refreshResult = (await api
        .dispatch(neuroapi.endpoints.refreshToken.initiate({}))
        .unwrap()) as RefreshTokenResponse;

      if (refreshResult.accessToken) {
        api.dispatch(
          setCredentials({
            user: refreshResult.user,
            accessToken: refreshResult.accessToken,
          }),
        );
        result = await baseQuery(args, api, options);
      } else {
        await api.dispatch(neuroapi.endpoints.logout.initiate(undefined));
        handleLogout(api);
      }
    } catch (err: unknown) {
      console.error('Reauth failed', err);
      handleLogout(api);
    }
  }

  return result;
};

const handleLogout = (api: BaseQueryApi) => {
  api.dispatch(removeCredentials());
};
export const neuroapi = createApi({
  reducerPath: 'neuroapi',
  baseQuery: baseQueryWithReauth,
  extractRehydrationInfo(action, { reducerPath }) {
    if (
      action.type === 'persist/REHYDRATE' &&
      action.payload !== null &&
      typeof action.payload === 'object' &&
      reducerPath in (action.payload as Record<string, unknown>)
    ) {
      // biome-ignore lint/suspicious/noExplicitAny: RTK Query extractRehydrationInfo typing gap
      return (action.payload as Record<string, any>)[reducerPath];
    }
  },

  endpoints: (builder) => ({
    login: builder.mutation<AuthResponseDto, LoginSchema>({
      query: (credentials) => ({
        url: 'auth/login/',
        method: 'POST',
        body: { ...credentials, userAgent: getUserAgent() },
      }),
      transformResponse: (baseQueryReturnValue: { response: AuthResponseDto }) => baseQueryReturnValue.response,
    }),

    register: builder.mutation<UserRegisterResponseT, RegisterSchema>({
      query: (data) => ({
        url: 'auth/register',
        method: 'POST',
        body: { email: data.email, password: data.password },
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: 'auth/logout',
        method: 'POST',
      }),
      transformResponse: () => undefined,
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
    completeOnboarding: builder.mutation<AuthResponseDto, OnboardingDtoType>({
      query: (dto: OnboardingDtoType) => ({
        url: 'profile/onboarding/',
        method: 'POST',
        body: dto,
      }),
    }),
    verifyEmail: builder.mutation({
      query: (token: string) => {
        return {
          url: `auth/verify-email?token=${token}`,
          method: 'GET',
        };
      },
    }),
    getProfile: builder.query<ProfileResponseDto, void>({
      query: () => ({
        url: 'profile/me',
        method: 'GET',
      }),
    }),
    checkEmail: builder.query<{ isAvailable: boolean }, string>({
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
  useCompleteOnboardingMutation,
  useGetProfileQuery,
} = neuroapi;
