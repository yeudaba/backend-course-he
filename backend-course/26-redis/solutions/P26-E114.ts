// P26-E114: SSE של הזמנה — רק לבעלים
import type { EventEmitter } from "node:events";
import type express from "express";

type Deps = { authenticate(req: express.Request): number | null; ownerOf(orderId: number): Promise<number | null>; bus: EventEmitter };

export function orderEvents({ authenticate, ownerOf, bus }: Deps): express.RequestHandler {
  return async (req, res) => {
    const userId = authenticate(req);
    if (userId === null) return void res.status(401).json({ error: "נדרשת התחברות" });
    const orderId = Number(req.params.id);
    const owner = Number.isInteger(orderId) ? await ownerOf(orderId) : null;
    if (owner === null || owner !== userId) return void res.status(404).json({ error: "הזמנה לא נמצאה" });

    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" });
    res.write(": connected\n\n");
    const listener = (e: { orderId: number; status: string }) => {
      if (e.orderId === orderId) res.write(`event: status\ndata: ${JSON.stringify(e)}\n\n`);
    };
    bus.on("status", listener);
    req.on("close", () => bus.off("status", listener));
  };
}
