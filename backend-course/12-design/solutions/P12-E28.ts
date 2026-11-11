// P12-E28: דוח הלקוחות הגדולים
export type Order = { id: number; userId: number; total: number; status: "paid" | "cancelled" };
export type User = { id: number; name: string };

export interface OrderRepository {
  findAll(): Promise<Order[]>;
}
export interface UserRepository {
  findByIds(ids: number[]): Promise<User[]>;
}

export class ReportService {
  #orders: OrderRepository;
  #users: UserRepository;

  constructor(orders: OrderRepository, users: UserRepository) {
    this.#orders = orders;
    this.#users = users;
  }

  async topCustomers(n: number): Promise<{ name: string; total: number }[]> {
    const orders = await this.#orders.findAll();

    const totals = new Map<number, number>();
    for (const o of orders.filter((o) => o.status === "paid")) {
      totals.set(o.userId, (totals.get(o.userId) ?? 0) + o.total);
    }

    const top = [...totals].sort(([idA, a], [idB, b]) => b - a || idA - idB).slice(0, n);

    const users = await this.#users.findByIds(top.map(([id]) => id));
    const names = new Map(users.map((u) => [u.id, u.name]));

    return top.map(([id, total]) => ({ name: names.get(id) ?? "לא ידוע", total }));
  }
}

const orders: OrderRepository = {
  findAll: async () => [
    { id: 1, userId: 7, total: 100, status: "paid" },
    { id: 2, userId: 8, total: 300, status: "paid" },
    { id: 3, userId: 7, total: 250, status: "paid" },
    { id: 4, userId: 9, total: 999, status: "cancelled" },
  ],
};
const users: UserRepository = {
  findByIds: async (ids) => [{ id: 7, name: "דנה" }, { id: 8, name: "עומר" }].filter((u) => ids.includes(u.id)),
};

console.log(await new ReportService(orders, users).topCustomers(5));
