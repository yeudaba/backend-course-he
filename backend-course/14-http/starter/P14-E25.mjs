// P14-E25 — אתגר: rate limit
// createLimitedServer({ limit, windowMs, now }) → http.Server
// 200 { ok: true } + X-RateLimit-Remaining | 429 + Retry-After (שניות, עיגול למעלה)
import http from "node:http";

export function createLimitedServer({ limit, windowMs, now = Date.now }) {
  // כתוב כאן
}
