// P14-E55: משגיאה לתשובה
export class NotFoundError extends Error {
  name = "NotFoundError";
}
export class ConflictError extends Error {
  name = "ConflictError";
}
export class ValidationError extends Error {
  constructor(message, details) {
    super(message);
    this.name = "ValidationError";
    this.details = details;
  }
}

const reply = (status, code, message, extra = {}) => ({ status, body: { error: { code, message, ...extra } } });

export function toApiError(err) {
  if (err instanceof ValidationError) return reply(400, "VALIDATION", err.message, { details: err.details });
  if (err instanceof NotFoundError) return reply(404, "NOT_FOUND", err.message);
  if (err instanceof ConflictError) return reply(409, "CONFLICT", err.message);
  if (err instanceof SyntaxError) return reply(400, "INVALID_JSON", "JSON לא תקין");
  return reply(500, "INTERNAL", "שגיאה פנימית");
}

console.log(JSON.stringify(toApiError(new ValidationError("קלט לא תקין", ["price: חייב להיות מספר"]))));
console.log(JSON.stringify(toApiError(new NotFoundError("המוצר לא נמצא"))));
let parseError;
try {
  JSON.parse("{oops");
} catch (err) {
  parseError = err;
}
console.log(JSON.stringify(toApiError(parseError)));
console.log(JSON.stringify(toApiError(new Error("connect ECONNREFUSED 10.0.0.5:5432"))));
