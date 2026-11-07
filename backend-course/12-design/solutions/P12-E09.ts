// P12-E09
export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = new.target.name;
    this.status = status;
    this.code = code;
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id: string | number) {
    super(`${entity} ${id} לא נמצא`, 404, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  readonly field: string;
  constructor(field: string, message: string) {
    super(message, 400, "VALIDATION");
    this.field = field;
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

export function toHttp(err: unknown): { status: number; body: { code: string; message: string; field?: string } } {
  if (err instanceof AppError) {
    return {
      status: err.status,
      body: { code: err.code, message: err.message, ...(err instanceof ValidationError ? { field: err.field } : {}) },
    };
  }
  return { status: 500, body: { code: "INTERNAL", message: "שגיאה פנימית" } };
}

console.log(toHttp(new ValidationError("email", "לא תקין")), new NotFoundError("משתמש", 3).name);
