import { configureStore } from '@reduxjs/toolkit';
import { neuroapi } from '@/services/api';
import authReducer from '@/store/slices/authSlice';
export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      [neuroapi.reducerPath]: neuroapi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(neuroapi.middleware),
  });
};
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
