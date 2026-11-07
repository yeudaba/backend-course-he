// שלב 2. מבוסס על תרגיל P15-E15 — אבל כאן, בכישלון, זורקים HttpError(400, "VALIDATION_ERROR", ...) עם details,
// וה־errorHandler מחזיר את התשובה.
import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { HttpError, type ErrorDetail } from "../errors.ts";

type Part = "body" | "query" | "params";

export function validate(schemas: Partial<Record<Part, ZodType>>) {
  return (req: Request, res: Response, next: NextFunction) => {
    // כתוב כאן
    next();
  };
}
