// P25.7-E71: GET /orders/:id — מסמך אחד, ושם מ־customers
import { Router } from "express";
import type { Db } from "mongodb";

type Order = { _id: string; customerId: string; status: string; createdAt: Date; total: number; items: { productId: string; name: string; price: number; qty: number }[] };

export function ordersRouter(db: Db) {
  const router = Router();
  router.get("/orders/:id", async (req, res) => {
    const o = await db.collection<Order>("orders").findOne({ _id: req.params.id });
    if (!o) {
      res.status(404).json({ error: { code: "NOT_FOUND" } });
      return;
    }
    const c = await db.collection<{ _id: string; name: string }>("customers").findOne({ _id: o.customerId }, { projection: { name: 1 } });
    res.json({
      id: o._id,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      total: o.total,
      customer: c ? { id: c._id, name: c.name } : null,
      items: o.items.map(({ productId, name, price, qty }) => ({ productId, name, price, qty })),
    });
  });
  return router;
}
