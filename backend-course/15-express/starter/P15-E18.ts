// P15-E18
// requireApiKey(keys) — אין X-Api-Key → 401 MISSING_API_KEY (+ WWW-Authenticate: ApiKey) | לא מוכר → 403 INVALID_API_KEY
// תקין → res.locals.client = שם הלקוח
import express, { type Request, type Response, type NextFunction } from "express";

export function requireApiKey(keys: Map<string, string>) {
  return (req: Request, res: Response, next: NextFunction) => {
    // כתוב כאן
  };
}

// GET /public (פתוח) | כל /api מוגן | GET /api/me → { client }
export function createApp(keys: Map<string, string>) {
  const app = express();
  // כתוב כאן
  return app;
}
