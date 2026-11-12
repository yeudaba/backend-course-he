// P26.5-E44: POST /orders שמפרסם ועונה 202
import express from "express";
import { z } from "zod";

type Event = { id: string; type: string; data: unknown };
const schema = z.object({
  email: z.string().includes("@"),
  items: z.array(z.object({ productId: z.number().int().positive(), qty: z.number().int().positive() })).min(1),
});

export function ordersApp({ publish, newId }: { publish: (e: Event) => Promise<void>; newId: () => string }) {
  const app = express();
  app.use(express.json());
  app.post("/orders", async (req, res) => {
    const r = schema.safeParse(req.body);
    if (!r.success) return res.status(400).json({ error: "הזמנה לא תקינה" });
    const id = newId();
    try {
      await publish({ id, type: "order.placed", data: { email: r.data.email, items: r.data.items } });
    } catch {
      return res.status(503).json({ error: "לא הצלחנו לקבל את ההזמנה, נסה שוב" });
    }
    res.status(202).json({ orderId: id });
  });
  return app;
}
