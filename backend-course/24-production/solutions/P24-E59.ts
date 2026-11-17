// P24-E59: GET /today ב־Express
import { Router } from "express";

export function todayRouter({ now = () => new Date() }: { now?: () => Date } = {}) {
  const router = Router();
  router.get("/today", (req, res) => {
    const raw = req.query.tz === undefined ? "UTC" : req.query.tz;
    let tz: string;
    try {
      if (typeof raw !== "string" || raw === "") throw new RangeError("empty");
      tz = new Intl.DateTimeFormat("en", { timeZone: raw }).resolvedOptions().timeZone;
    } catch {
      res.status(400).json({ error: { code: "INVALID_TIME_ZONE", message: `אזור זמן לא מוכר: ${String(raw)}` } });
      return;
    }
    const at = now();
    const date = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(at);
    const time = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(at);
    res.json({ tz, date, time });
  });
  return router;
}
