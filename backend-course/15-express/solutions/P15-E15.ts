// P15-E15
import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

type Part = "body" | "query" | "params";

export function validate(schemas: Partial<Record<Part, ZodType>>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const details: { path: string; message: string }[] = [];
    const clean: Partial<Record<Part, unknown>> = {};
    for (const part of ["body", "query", "params"] as const) {
      const schema = schemas[part];
      if (!schema) continue;
      const result = schema.safeParse(req[part]);
      if (result.success) clean[part] = result.data;
      else for (const i of result.error.issues) details.push({ path: [part, ...i.path].join("."), message: i.message });
    }
    if (details.length > 0) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "קלט לא תקין", details } });
      return;
    }
    if ("body" in clean) req.body = clean.body;
    if ("query" in clean) res.locals.query = clean.query;
    if ("params" in clean) res.locals.params = clean.params;
    next();
  };
}
