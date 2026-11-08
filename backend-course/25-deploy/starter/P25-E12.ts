// P25-E12: GET /ready — כמה בדיקות, במקביל, עם גבול זמן
import type { Request, Response } from "express";

type Check = () => Promise<unknown>;

export function readyHandler(checks: Record<string, Check>, { timeoutMs = 1000 }: { timeoutMs?: number } = {}) {
  return async (req: Request, res: Response) => {
    res.json({ status: "ok", checks: {} }); // כתוב כאן
  };
}
