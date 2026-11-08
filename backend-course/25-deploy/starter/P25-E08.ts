// P25-E08: GET /version — מה רץ עכשיו בשרת
import express from "express";

export function createApp({ env = process.env, now = () => new Date(), pkg }: { env?: Record<string, string | undefined>; now?: () => Date; pkg: { name: string; version: string } }) {
  const app = express();
  // כתוב כאן
  return app;
}
