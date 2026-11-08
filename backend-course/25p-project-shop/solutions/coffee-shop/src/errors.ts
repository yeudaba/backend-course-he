export interface ErrorDetail {
  path: string;
  message: string;
}

// שגיאה עסקית עם status ו־code. ה־HttpErrorFilter הופך אותה ל־{ error: { code, message, details? } }
export class HttpError extends Error {
  status: number;
  code: string;
  details?: unknown[];
  constructor(status: number, code: string, message: string, details?: unknown[]) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
