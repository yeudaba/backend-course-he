import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { HttpError, type ErrorDetail } from "../errors.ts";

type Part = "body" | "query" | "params";

// בודק חלקים של הבקשה. body נקי ← req.body; query ו־params ← res.locals (ב־Express 5 אי אפשר לדרוס אותם)
export function validate(schemas: Partial<Record<Part, ZodType>>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const details: ErrorDetail[] = [];
    for (const part of ["params", "query", "body"] as const) {
      const schema = schemas[part];
      if (!schema) continue;
      const result = schema.safeParse(req[part]);
      if (!result.success) {
        for (const issue of result.error.issues) details.push({ path: [part, ...issue.path].join("."), message: issue.message });
      } else if (part === "body") {
        req.body = result.data;
      } else {
        res.locals[part] = result.data;
      }
    }
    if (details.length > 0) throw new HttpError(400, "VALIDATION_ERROR", "קלט לא תקין", details);
    next();
  };
}
