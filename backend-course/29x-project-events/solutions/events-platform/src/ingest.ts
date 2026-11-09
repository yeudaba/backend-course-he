// שירות הקליטה: POST /v1/events ← אימות ← Kafka. לא נוגע במסד — רק מקבל מהר ומעביר הלאה
import http from "node:http";
import { z } from "zod";
import type { Producer } from "@platformatic/kafka";

const MAX_BODY = 1_000_000;
const MAX_FUTURE_MS = 5 * 60_000;
const MAX_AGE_MS = 7 * 24 * 3600_000;

const eventSchema = z.object({
  eventId: z.uuid(),
  name: z.string().regex(/^[a-z][a-z0-9_]{0,39}$/, "name: אותיות קטנות, ספרות ו־_, עד 40"),
  userId: z.string().min(1).max(64),
  ts: z.iso.datetime({ offset: true }),
  props: z.record(z.string(), z.unknown()).optional(),
});

export interface IngestOptions {
  producer: Producer<string, string, string, string>;
  topic: string;
  apiKeys: Record<string, string>; // key ← tenant
  maxBatch?: number;
  now?: () => number;
}

function readBody(req: http.IncomingMessage): Promise<string | null> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => {
      size += c.length;
      if (size > MAX_BODY) {
        resolve(null);
        req.resume(); // ממשיכים לקרוא (ולזרוק) כדי שהלקוח יקבל את ה־413
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(size > MAX_BODY ? null : Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

export function createIngestServer({ producer, topic, apiKeys, maxBatch = 500, now = Date.now }: IngestOptions): http.Server {
  const send = (res: http.ServerResponse, status: number, body: unknown) => {
    res.writeHead(status, { "content-type": "application/json" });
    res.end(JSON.stringify(body));
  };
  return http.createServer(async (req, res) => {
    try {
      if (req.method === "GET" && req.url === "/health") return send(res, 200, { ok: true });
      if (req.url !== "/v1/events") return send(res, 404, { error: { code: "NOT_FOUND" } });
      if (req.method !== "POST") return send(res, 405, { error: { code: "METHOD_NOT_ALLOWED" } });
      const tenant = apiKeys[String(req.headers["x-api-key"] ?? "")];
      if (!tenant) return send(res, 401, { error: { code: "INVALID_API_KEY" } });
      const raw = await readBody(req);
      if (raw === null) return send(res, 413, { error: { code: "PAYLOAD_TOO_LARGE" } });
      let body: any;
      try {
        body = JSON.parse(raw);
      } catch {
        return send(res, 400, { error: { code: "INVALID_JSON" } });
      }
      if (!Array.isArray(body?.events) || body.events.length === 0) return send(res, 400, { error: { code: "INVALID_BATCH", message: "events: מערך לא ריק" } });
      if (body.events.length > maxBatch) return send(res, 400, { error: { code: "BATCH_TOO_LARGE", message: `עד ${maxBatch} אירועים בבקשה` } });

      const t = now();
      const accepted: { key: string; value: string }[] = [];
      const rejected: { index: number; reason: string }[] = [];
      body.events.forEach((e: unknown, index: number) => {
        const p = eventSchema.safeParse(e);
        if (!p.success) return rejected.push({ index, reason: p.error.issues[0].message });
        const ts = Date.parse(p.data.ts);
        if (ts > t + MAX_FUTURE_MS) return rejected.push({ index, reason: "ts בעתיד" });
        if (ts < t - MAX_AGE_MS) return rejected.push({ index, reason: "ts ישן מ־7 ימים" });
        if (p.data.props && JSON.stringify(p.data.props).length > 2048) return rejected.push({ index, reason: "props גדול מ־2KB" });
        const value = { tenantId: tenant, ...p.data, ts: new Date(ts).toISOString(), receivedAt: new Date(t).toISOString() };
        accepted.push({ key: `${tenant}:${p.data.userId}`, value: JSON.stringify(value) }); // key ← כל האירועים של משתמש באותו partition, בסדר
      });
      // 202 רק אחרי ש־Kafka אישר: מה שאמרנו "התקבל" — לא יאבד
      if (accepted.length) await producer.send({ messages: accepted.map((m) => ({ topic, ...m })) });
      send(res, 202, { accepted: accepted.length, rejected });
    } catch {
      send(res, 503, { error: { code: "UNAVAILABLE" } }); // Kafka לא זמין ← הלקוח ינסה שוב (eventId שומר על אידמפוטנטיות)
    }
  });
}
