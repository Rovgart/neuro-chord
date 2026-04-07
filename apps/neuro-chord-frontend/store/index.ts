import { neuroapi } from '@/services/api';
import authReducer from '@/store/slices/authSlice';
import { configureStore } from '@reduxjs/toolkit';
import { rtkQueryErrorLogger } from './middleware/errorMiddleware';
export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      [neuroapi.reducerPath]: neuroapi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(neuroapi.middleware, rtkQueryErrorLogger),
  });
};
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
