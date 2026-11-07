// P15-E25 — אתגר: Idempotency-Key
import express, { type Request, type Response, type NextFunction } from "express";

// בלי מפתח → 400 | חדש → ממשיך ושומר | חוזר עם אותו גוף → אותה תשובה + Idempotent-Replayed: true
// גוף אחר → 422 | הראשונה עוד רצה → 409
export function idempotency() {
  return (req: Request, res: Response, next: NextFunction) => {
    // כתוב כאן
  };
}

// POST /orders (מוגן, 50ms, 201 { id, ...body }) | GET /orders
export function createApp() {
  const app = express();
  // כתוב כאן
  return app;
}
