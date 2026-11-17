// P22-E54: start — שרת אמיתי על פורט פנוי, ותשובה נוחה לבדיקה
import type { Express } from "express";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

export type Reply = { status: number; headers: Headers; body: unknown };

export async function start(t: { after(fn: () => void | Promise<void>): void }, app: Express) {
  const server = await new Promise<Server>((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  t.after(() => new Promise<void>((resolve) => server.close(() => resolve())));
  const base = `http://localhost:${(server.address() as AddressInfo).port}`;

  return async (method: string, path: string, body?: unknown): Promise<Reply> => {
    const res = await fetch(base + path, {
      method,
      headers: body === undefined ? {} : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    const parsed = text === "" ? null : (res.headers.get("content-type") ?? "").includes("json") ? JSON.parse(text) : text;
    return { status: res.status, headers: res.headers, body: parsed };
  };
}
