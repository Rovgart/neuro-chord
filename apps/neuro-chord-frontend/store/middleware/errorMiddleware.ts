import { toast } from '@heroui/react';
import type { Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import { isRejectedWithValue } from '@reduxjs/toolkit';

export const rtkQueryErrorLogger: Middleware = (api: MiddlewareAPI) => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const errorMessage = action.payload?.data?.message;

    const finalMessage = Array.isArray(errorMessage)
      ? errorMessage[0]
      : errorMessage || 'Unexpected server error occurred';

    toast.danger(finalMessage);

    console.warn('Middleware przechwycił błąd:', finalMessage);
  }

  return next(action);
};
