// P26.5-E59: POST /events ל־topic exchange
import express from "express";
import type { Channel } from "amqplib";
import { z } from "zod";

const schema = z.object({
  id: z.string().min(1),
  type: z.enum(["created", "paid", "shipped", "cancelled"]),
  orderId: z.number().int().positive(),
  country: z.string().regex(/^[A-Za-z]{2}$/),
});

export function eventsApp(ch: Channel, exchange: string) {
  const app = express();
  app.use(express.json());
  app.post("/events", (req, res) => {
    const r = schema.safeParse(req.body);
    if (!r.success) return res.status(400).json({ error: "אירוע לא תקין" });
    const e = r.data;
    const routingKey = `order.${e.type}.${e.country.toLowerCase()}`;
    ch.publish(exchange, routingKey, Buffer.from(JSON.stringify(e)), { persistent: true, contentType: "application/json", messageId: e.id });
    res.status(202).json({ routingKey });
  });
  return app;
}
