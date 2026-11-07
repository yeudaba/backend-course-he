// P15.5-E12 — אתגר: CORS לייצור (הפירוט בדף התרגילים)
// createCors({ allow: ["https://app.example.com", "https://*.preview.example.com"], credentials: true, maxAge: 600 })
import type { Request, Response, NextFunction } from "express";

export function createCors({ allow, credentials = false, maxAge = 600 }: { allow: string[]; credentials?: boolean; maxAge?: number }) {
  return (req: Request, res: Response, next: NextFunction) => {
    // כתוב כאן
    next();
  };
}
