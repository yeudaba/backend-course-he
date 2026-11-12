// P26-E84: POST /pay שעונה מיד ושולח לתור
import express from "express";
import type { Queue } from "bullmq";

export function payApp({ queue, markPaid }: { queue: Queue; markPaid: (orderId: number) => Promise<boolean> }) {
  const app = express();
  app.post("/orders/:id/pay", async (req, res) => {
    if (!/^[1-9]\d*$/.test(req.params.id)) return res.status(400).json({ error: "id לא תקין" });
    const orderId = Number(req.params.id);
    if (!(await markPaid(orderId))) return res.status(404).json({ error: "אין הזמנה שממתינה לתשלום" });
    await queue.add("order-confirmation", { orderId }, { jobId: `confirm-${orderId}`, attempts: 3, backoff: { type: "exponential", delay: 1000 } });
    res.status(202).json({ status: "paid" });
  });
  return app;
}
