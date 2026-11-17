// P15-E41: סטטיסטיקה של הזמנות
import express from "express";

export type Order = { id: number; customer: string; status: "paid" | "shipped" | "cancelled"; totalAgorot: number; createdAt: string };
const DAY = /^\d{4}-\d{2}-\d{2}$/;

export function createApp(orders: Order[]) {
  const app = express();
  app.get("/stats", (req, res) => {
    const { from, to } = req.query;
    for (const value of [from, to]) {
      if (value !== undefined && (typeof value !== "string" || !DAY.test(value))) {
        res.status(400).json({ error: "תאריך לא תקין" });
        return;
      }
    }
    const list = orders.filter((o) => {
      const day = o.createdAt.slice(0, 10);
      return (from === undefined || day >= String(from)) && (to === undefined || day <= String(to));
    });

    const byStatus = { paid: 0, shipped: 0, cancelled: 0 };
    const byCustomer = new Map<string, number>();
    for (const o of list) {
      byStatus[o.status]++;
      if (o.status !== "cancelled") byCustomer.set(o.customer, (byCustomer.get(o.customer) ?? 0) + o.totalAgorot);
    }
    let topCustomer: string | null = null;
    let best = -1;
    for (const [customer, sum] of byCustomer) {
      if (sum > best) {
        best = sum;
        topCustomer = customer;
      }
    }
    const revenueAgorot = list.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.totalAgorot, 0);
    res.json({ count: list.length, byStatus, revenueAgorot, topCustomer });
  });
  return app;
}

const orders: Order[] = [
  { id: 1, customer: "דנה", status: "paid", totalAgorot: 5000, createdAt: "2026-11-01T09:00:00Z" },
  { id: 2, customer: "יוסי", status: "shipped", totalAgorot: 12000, createdAt: "2026-11-02T10:00:00Z" },
  { id: 3, customer: "דנה", status: "paid", totalAgorot: 8000, createdAt: "2026-11-03T23:30:00Z" },
  { id: 4, customer: "רון", status: "cancelled", totalAgorot: 90000, createdAt: "2026-11-03T08:00:00Z" },
];
const server = createApp(orders).listen(0, async () => {
  const address = server.address();
  const base = `http://localhost:${typeof address === "object" && address ? address.port : 0}`;
  for (const q of ["", "?from=2026-11-02", "?from=2026-11-02&to=2026-11-02", "?to=3.11.2026"]) {
    const res = await fetch(`${base}/stats${q}`);
    console.log(res.status, await res.text());
  }
  server.close();
});
