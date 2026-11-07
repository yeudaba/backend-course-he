// P12-E21: מתוקן
export class HttpError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = new.target.name;
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

export function respond(err: unknown): string {
  if (err instanceof NotFoundError) return `404 ${err.message}`;
  if (err instanceof ForbiddenError) return `403 ${err.message}`;
  if (err instanceof HttpError) return `${err.status} ${err.message}`;
  return "500 שגיאה פנימית";
}

console.log(respond(new ForbiddenError()), new NotFoundError("x").name);
