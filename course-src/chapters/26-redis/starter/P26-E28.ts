// P26-E28: רכזת SSE עם Last-Event-ID
import type { Request, Response } from "express";

export function eventHub({ bufferSize = 100 }: { bufferSize?: number } = {}) {
  function handler(req: Request, res: Response) {
    res.end(); // כתוב כאן
  }
  function publish(event: string, data: unknown): number {
    return 0; // כתוב כאן
  }
  return { handler, publish, size: () => 0 };
}
