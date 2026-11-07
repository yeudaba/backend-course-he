// P12-E09: היררכיית שגיאות
// AppError(message, status, code) — name = שם המחלקה בפועל
// NotFoundError(entity, id) → `${entity} ${id} לא נמצא`, 404, "NOT_FOUND"
// ValidationError(field, message) → 400, "VALIDATION", + field
// ConflictError(message) → 409, "CONFLICT"
export class AppError extends Error {}
export class NotFoundError extends AppError {}
export class ValidationError extends AppError {}
export class ConflictError extends AppError {}

// { status, body: { code, message, field? } } | לא AppError → 500, { code: "INTERNAL", message: "שגיאה פנימית" }
export function toHttp(err: unknown): { status: number; body: { code: string; message: string; field?: string } } {
  // כתוב כאן
}
