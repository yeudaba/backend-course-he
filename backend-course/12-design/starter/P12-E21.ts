// P12-E21: שלושה באגים
export class HttpError extends Error {
  status = 500;
  constructor(message: string, status: number) {
    super();
    this.status = status;
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "אין הרשאה") {
    super(message, 403);
  }
}

// "404 <message>" | "403 <message>" | אחר HttpError → `${status} ${message}` | אחרת "500 שגיאה פנימית"
export function respond(err: unknown): string {
  if (err instanceof HttpError) return `${err.status} ${err.message}`;
  if (err instanceof NotFoundError) return `404 ${err.message}`;
  if (err instanceof ForbiddenError) return `403 ${err.message}`;
  return "500 שגיאה פנימית";
}
