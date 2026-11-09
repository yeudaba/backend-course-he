// P24-E28: מדידה של כל בקשה + GET /metrics
import type { NextFunction, Request, Response } from "express";

type Labels = Record<string, string>;
export interface Registry {
  counter(opts: { name: string; help: string; labelNames: string[] }): { inc(labels: Labels, by?: number): void };
  histogram(opts: { name: string; help: string; labelNames: string[]; buckets: number[] }): { observe(labels: Labels, value: number): void };
  metrics(): string;
}

export function httpMetrics(registry: Registry, { now = () => performance.now() }: { now?: () => number } = {}) {
  const middleware = (req: Request, res: Response, next: NextFunction) => {
    next(); // כתוב כאן
  };
  const handler = (req: Request, res: Response) => {
    res.send(""); // כתוב כאן
  };
  return { middleware, handler };
}
