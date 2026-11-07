// P15-E15
// validate({ body?, query?, params? }) → middleware
// נכשל → 400 { error: { code: "VALIDATION_ERROR", message: "קלט לא תקין", details: [{ path: "body.title", message }] } }
// הצליח → req.body, res.locals.query, res.locals.params
import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

type Part = "body" | "query" | "params";

export function validate(schemas: Partial<Record<Part, ZodType>>) {
  return (req: Request, res: Response, next: NextFunction) => {
    // כתוב כאן
  };
}
