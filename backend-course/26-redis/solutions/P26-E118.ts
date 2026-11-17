// P26-E118: SSE בשני שרתים — POST ב־A, אירוע ב־B
import express from "express";
import type { Redis } from "ioredis";

export async function createLiveApp({ pub, sub, channel }: { pub: Redis; sub: Redis; channel: string }) {
  const clients = new Set<express.Response>();
  await sub.subscribe(channel);
  const onMessage = (ch: string, msg: string) => {
    if (ch !== channel) return;
    for (const c of clients) c.write(`data: ${msg}\n\n`);
  };
  sub.on("message", onMessage);

  const app = express();
  app.use(express.json());
  app.get("/events", (req, res) => {
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" });
    res.write(": connected\n\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
  });
  app.post("/events", async (req, res) => {
    await pub.publish(channel, JSON.stringify(req.body));
    res.status(202).end();
  });

  return {
    app,
    async close() {
      sub.off("message", onMessage);
      await sub.unsubscribe(channel);
    },
  };
}
