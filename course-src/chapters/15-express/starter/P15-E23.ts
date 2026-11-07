// P15-E23: שלוש תקלות
// GET /orders/1 → ההזמנה | GET /orders/1/total → { total: 85 } | GET /orders/99 → 404
import express, { type Request, type Response, type NextFunction } from "express";

class NotFoundError extends Error {}

const orders = new Map([[1, { id: 1, itemIds: [10, 11, 10] }]]);
const prices = new Map([[10, 30], [11, 25]]);
const delay = () => new Promise((r) => setTimeout(r, 5));

export const repo = {
  async findOrder(id: number) {
    await delay();
    const order = orders.get(id);
    if (!order) throw new NotFoundError(`הזמנה ${id} לא נמצאה`);
    return order;
  },
  async priceOf(itemId: number) {
    await delay();
    return prices.get(itemId) ?? 0;
  },
};

export function createApp() {
  const app = express();

  app.get("/orders/:id", (req, res) => {
    const order = repo.findOrder(Number(req.params.id));
    res.json(order);
  });

  app.get("/orders/:id/total", (req, res) => {
    repo.findOrder(Number(req.params.id)).then((order) => {
      let total = 0;
      order.itemIds.forEach(async (id) => {
        total += await repo.priceOf(id);
      });
      res.json({ total });
    });
  });

  app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
      return;
    }
    next(err);
  });

  return app;
}
