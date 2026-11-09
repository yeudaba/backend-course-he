// P24-E28
// middleware שמודד כל בקשה (RED: כמה, כמה נכשלו, כמה זמן) ו־handler ל־GET /metrics.
// מקבל registry מבחוץ (כמו E27, או prom-client) — כך אפשר להחליף אותו ולבדוק
import type { NextFunction, Request, Response } from "express";

type Labels = Record<string, string>;
export interface Registry {
  counter(opts: { name: string; help: string; labelNames: string[] }): { inc(labels: Labels, by?: number): void };
  histogram(opts: { name: string; help: string; labelNames: string[]; buckets: number[] }): { observe(labels: Labels, value: number): void };
  metrics(): string;
}

export const BUCKETS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5];

export function httpMetrics(registry: Registry, { now = () => performance.now() }: { now?: () => number } = {}) {
  const requests = registry.counter({ name: "http_requests_total", help: "HTTP requests", labelNames: ["method", "route", "status"] });
  const duration = registry.histogram({ name: "http_request_duration_seconds", help: "HTTP request duration in seconds", labelNames: ["method", "route"], buckets: BUCKETS });

  const middleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.path === "/metrics") return next(); // Prometheus קורא כל 15 שניות — לא רוצים שזה ימלא את הגרפים
    const start = now();
    // מודדים בסוף — רק אז ידועים ה־status והזמן
    res.on("finish", () => {
      // התבנית של ה־route, לא הכתובת: /tasks/:id ולא /tasks/42 — אחרת סדרה חדשה לכל מזהה
      // router על "/tasks" עם route "/" ← "/tasks" (בלי / בסוף). בלי route בכלל (404) ← "unmatched"
      const route = req.route ? (req.baseUrl && req.route.path === "/" ? req.baseUrl : req.baseUrl + req.route.path) : "unmatched";
      const method = req.method;
      requests.inc({ method, route, status: String(res.statusCode) });
      duration.observe({ method, route }, (now() - start) / 1000); // Prometheus: תמיד שניות
    });
    next();
  };

  const handler = (req: Request, res: Response) => {
    res.type("text/plain; version=0.0.4; charset=utf-8").send(registry.metrics());
  };

  return { middleware, handler };
}
