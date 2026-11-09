// P26-E28
// "רכזת" של SSE: כל לקוח מחובר מקבל כל אירוע, עם id עולה — ומי שהתנתק וחזר מקבל את מה שפספס
import type { Request, Response } from "express";

const format = (id: number, event: string, data: unknown) => `id: ${id}\nevent: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

export function eventHub({ bufferSize = 100 }: { bufferSize?: number } = {}) {
  const clients = new Set<Response>();
  const buffer: { id: number; text: string }[] = []; // האירועים האחרונים — בשביל Last-Event-ID
  let lastId = 0;

  function handler(req: Request, res: Response) {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // שלא יחזיק את ההודעות ב־proxy (nginx)
    });
    res.flushHeaders();
    // הדפדפן שולח Last-Event-ID לבד כשהוא מתחבר מחדש
    const since = Number(req.get("last-event-id"));
    if (Number.isInteger(since)) for (const e of buffer) if (e.id > since) res.write(e.text);
    clients.add(res);
    req.on("close", () => clients.delete(res)); // אחרת: דליפה, וכתיבה לחיבור סגור
  }

  function publish(event: string, data: unknown) {
    const text = format(++lastId, event, data);
    buffer.push({ id: lastId, text });
    if (buffer.length > bufferSize) buffer.shift();
    for (const res of clients) res.write(text);
    return lastId;
  }

  return { handler, publish, size: () => clients.size };
}
