export type ActionErrorCode =
  | "VALIDATION"
  | "AUTH"
  | "DB_ERROR"
  | "RATE_LIMIT"
  | "UNKNOWN";

export type ActionResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      errorCode: ActionErrorCode;
      field?: string;
      shouldRetry?: boolean;
    };

export function ok<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function fail<T = never>(
  error: string,
  errorCode: ActionErrorCode,
  opts?: { field?: string; shouldRetry?: boolean },
): ActionResult<T> {
  return { success: false, error, errorCode, ...opts };
}
