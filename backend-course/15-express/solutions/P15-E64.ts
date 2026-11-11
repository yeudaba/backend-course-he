// P15-E64: פעולה שאינה CRUD — ביטול הזמנה
import express from "express";

export type Order = { id: number; status: "pending" | "paid" | "shipped" | "cancelled"; cancelledAt?: string; cancelReason?: string | null };

export function createApp(orders: Order[]) {
  const app = express();
  app.use(express.json());

  const find = (id: string) => orders.find((o) => o.id === Number(id));
  const notFound = { error: { code: "ORDER_NOT_FOUND", message: "ההזמנה לא נמצאה" } };

  app.get("/orders/:id", (req, res) => {
    const order = find(req.params.id);
    if (!order) {
      res.status(404).json(notFound);
      return;
    }
    res.json(order);
  });

  app.post("/orders/:id/cancel", (req, res) => {
    const order = find(req.params.id);
    if (!order) {
      res.status(404).json(notFound);
      return;
    }
    switch (order.status) {
      case "pending":
      case "paid":
        order.status = "cancelled";
        order.cancelledAt = new Date().toISOString();
        order.cancelReason = typeof req.body?.reason === "string" ? req.body.reason : null;
        break;
      case "cancelled":
        break;
      case "shipped":
        res.status(409).json({ error: { code: "ORDER_SHIPPED", message: "אי אפשר לבטל הזמנה שנשלחה" } });
        return;
    }
    res.json(order);
  });

  return app;
}

const orders: Order[] = [
  { id: 1, status: "paid" },
  { id: 2, status: "shipped" },
];
const server = createApp(orders).listen(0, async () => {
  const address = server.address();
  const base = `http://localhost:${typeof address === "object" && address ? address.port : 0}`;
  const cancel = (id: number) => fetch(`${base}/orders/${id}/cancel`, { method: "POST", headers: { "Content-Type": "application/json" }, body: '{"reason":"הזמנתי בטעות"}' });
  for (const id of [1, 1, 2, 9]) {
    const res = await cancel(id);
    const body = await res.json();
    console.log(id, res.status, body.status ?? body.error.code, body.cancelReason ?? "");
  }
  server.close();
});
