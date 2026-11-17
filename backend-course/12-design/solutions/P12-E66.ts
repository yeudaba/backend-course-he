// P12-E66: הכנסות לפי חודש
export type Order = { id: number; total: number; status: "paid" | "refunded" | "pending"; createdAt: string };

export interface OrderRepository {
  findAll(): Promise<Order[]>;
}

export class StatsService {
  #orders: OrderRepository;

  constructor(orders: OrderRepository) {
    this.#orders = orders;
  }

  async revenueByMonth(year: number): Promise<Map<string, number>> {
    const months = new Map<string, number>();
    for (let m = 1; m <= 12; m++) months.set(`${year}-${String(m).padStart(2, "0")}`, 0);
    for (const o of await this.#orders.findAll()) {
      const key = o.createdAt.slice(0, 7);
      const current = months.get(key);
      if (current === undefined || o.status === "pending") continue;
      const sign = o.status === "paid" ? 1 : -1;
      months.set(key, Math.round((current + sign * o.total) * 100) / 100);
    }
    return months;
  }
}

const repo: OrderRepository = {
  async findAll() {
    return [
      { id: 1, total: 100.1, status: "paid", createdAt: "2026-01-05T10:00:00Z" },
      { id: 2, total: 50.2, status: "paid", createdAt: "2026-01-20T10:00:00Z" },
      { id: 3, total: 30, status: "refunded", createdAt: "2026-03-01T10:00:00Z" },
      { id: 4, total: 999, status: "pending", createdAt: "2026-03-02T10:00:00Z" },
      { id: 5, total: 70, status: "paid", createdAt: "2025-12-31T10:00:00Z" },
    ];
  },
};
new StatsService(repo).revenueByMonth(2026).then((m) => console.log([...m].slice(0, 3)));
