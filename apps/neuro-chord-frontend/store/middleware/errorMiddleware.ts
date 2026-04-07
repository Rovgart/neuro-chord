import { toast } from '@heroui/react';
import type { Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import { isRejectedWithValue } from '@reduxjs/toolkit';

// 1. Definiujemy kształt błędu, który zwraca Twój Backend (np. NestJS)
interface ApiError {
  data?: {
    message?: string | string[];
    statusCode?: number;
  };
  status?: number;
}

export const rtkQueryErrorLogger: Middleware = (api: MiddlewareAPI) => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const payload = action.payload as ApiError;

    const errorMessage = payload?.data?.message;

    const finalMessage = Array.isArray(errorMessage)
      ? errorMessage[0]
      : errorMessage || 'Unexpected server error occurred';

    toast.danger(finalMessage);

    console.warn('Middleware przechwycił błąd:', finalMessage);
  }

  return next(action);
};
