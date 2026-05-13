import { toast } from '@heroui/react';
import type { Middleware } from '@reduxjs/toolkit';
import { isRejectedWithValue } from '@reduxjs/toolkit';

/* =========================================================
   TYPES
   ========================================================= */

interface BackendErrorData {
  errors?: string[] | Record<string, string[]>;
  message?: string;
  statusCode?: number;
}

interface RTKQueryRejectedAction {
  payload: {
    status: number | 'FETCH_ERROR' | 'PARSING_ERROR' | 'TIMEOUT_ERROR';
    data?: BackendErrorData;
    error?: string;
  };
  meta: {
    arg: {
      endpointName: string;
    };
  };
}

const SILENT_ENDPOINTS = new Set(['logout']);
const SILENT_STATUSES = new Set([401]);

/* =========================================================
   MIDDLEWARE
   ========================================================= */

export const rtkQueryErrorLogger: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const { payload, meta } = action as RTKQueryRejectedAction;

    if (SILENT_STATUSES.has(payload.status as number)) return next(action);
    if (SILENT_ENDPOINTS.has(meta?.arg?.endpointName)) return next(action);

    const message = extractMessage(payload);
    toast.danger(message);
  }

  return next(action);
};

/* =========================================================
   HELPERS
   ========================================================= */

function extractMessage(payload: RTKQueryRejectedAction['payload']): string {
  if (payload.data) {
    const { errors, message } = payload.data;

    if (Array.isArray(errors) && errors.length > 0) {
      return errors[0];
    }

    if (errors && typeof errors === 'object') {
      const first = Object.values(errors)[0];
      return Array.isArray(first) ? first[0] : String(first);
    }

    if (message) {
      return message.includes(';') ? message.split(';')[0] : message;
    }
  }

  if (payload.error) {
    return payload.error;
  }

  return 'An unexpected error occurred';
}
