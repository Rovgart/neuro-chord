import { toast } from '@heroui/react';
import type { Middleware, PayloadAction } from '@reduxjs/toolkit';
import { isRejectedWithValue } from '@reduxjs/toolkit';

interface BackendErrorData {
  errors?: string[] | Record<string, string[]>;
  message?: string;
  statusCode?: number;
}

interface RTKQueryErrorPayload {
  status: number | 'FETCH_ERROR' | 'PARSING_ERROR' | 'TIMEOUT_ERROR';
  data?: BackendErrorData;
  error?: string;
}

export const rtkQueryErrorLogger: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const apiAction = action as PayloadAction<RTKQueryErrorPayload>;

    if (apiAction.payload?.status === 401) return next(action);

    const payload = apiAction.payload;
    let finalMessage = '';

    if (payload?.data) {
      const { data } = payload;

      if (Array.isArray(data.errors) && data.errors.length > 0) {
        finalMessage = data.errors[0];
      } else if (data.errors && typeof data.errors === 'object') {
        const errorValues = Object.values(data.errors);
        const firstEntry = errorValues[0];
        finalMessage = Array.isArray(firstEntry) ? firstEntry[0] : String(firstEntry);
      } else if (data.message) {
        finalMessage = data.message.includes(';') ? data.message.split(';')[0] : data.message;
      }
    } else if (payload?.error) {
      finalMessage = typeof payload.error === 'string' ? payload.error : 'Network connection error';
    }

    const displayMessage = finalMessage || 'An unexpected error occurred';

    toast.danger(displayMessage);
  }

  return next(action);
};
