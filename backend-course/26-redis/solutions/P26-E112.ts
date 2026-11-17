// P26-E112: SSE עם heartbeat וניקוי
import type express from "express";

export function sseWithHeartbeat({ intervalMs }: { intervalMs: number }) {
  let count = 0;
  const handler: express.RequestHandler = (req, res) => {
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "X-Accel-Buffering": "no" });
    res.write(": connected\n\n");
    count++;
    const timer = setInterval(() => res.write(": ping\n\n"), intervalMs);
    req.on("close", () => {
      clearInterval(timer);
      count--;
    });
  };
  return { handler, active: () => count };
}
