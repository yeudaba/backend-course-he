// P11-E14
export function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const key = keyFn(item);
    (result[key] ??= []).push(item);
  }
  return result;
}

export function indexBy<T, K>(items: T[], keyFn: (item: T) => K): Map<K, T> {
  return new Map(items.map((item) => [keyFn(item), item]));
}

export function sumBy<T>(items: T[], fn: (item: T) => number): number {
  return items.reduce((s, item) => s + fn(item), 0);
}

const orders = [{ id: 1, status: "paid", total: 10 }, { id: 2, status: "new", total: 5 }, { id: 3, status: "paid", total: 7 }];
console.log(Object.keys(groupBy(orders, (o) => o.status)), indexBy(orders, (o) => o.id).get(2)?.total, sumBy(orders, (o) => o.total));
