// P15-E23: מתוקן
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

  app.get("/orders/:id", async (req, res) => {
    const order = await repo.findOrder(Number(req.params.id));
    res.json(order);
  });

  app.get("/orders/:id/total", async (req, res) => {
    const order = await repo.findOrder(Number(req.params.id));
    const itemPrices = await Promise.all(order.itemIds.map((id) => repo.priceOf(id)));
    res.json({ total: itemPrices.reduce((a, b) => a + b, 0) });
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
