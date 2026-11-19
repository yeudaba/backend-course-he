// P11-E84: groupBy עם טיפוס מדויק
export function groupBy<T, K extends keyof T>(items: T[], key: K): Map<T[K], T[]> {
  const groups = new Map<T[K], T[]>();
  for (const item of items) {
    const k = item[key];
    const list = groups.get(k);
    if (list) list.push(item);
    else groups.set(k, [item]);
  }
  return groups;
}

type Order = { id: number; status: "pending" | "paid"; total: number };
const orders: Order[] = [
  { id: 1, status: "paid", total: 120 },
  { id: 2, status: "pending", total: 80 },
  { id: 3, status: "paid", total: 45 },
];
const byStatus = groupBy(orders, "status");
console.log([...byStatus.keys()], byStatus.get("paid")?.map((o) => o.id));
