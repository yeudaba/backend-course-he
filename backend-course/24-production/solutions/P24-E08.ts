// P24-E08
import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const VALID = /^[A-Za-z0-9._-]{1,64}$/;

export function requestId({ generate = randomUUID }: { generate?: () => string } = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const incoming = req.get("x-request-id");
    // מקבלים מזהה מבחוץ רק אם הוא "נקי" — הוא נכתב ללוגים, ושם אסור לתת להזריק תווים
    const id = incoming !== undefined && VALID.test(incoming) ? incoming : generate();
    res.locals.requestId = id;
    res.setHeader("X-Request-Id", id);
    next();
  };
}
