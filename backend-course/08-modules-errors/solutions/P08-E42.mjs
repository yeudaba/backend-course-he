export function groupBy(list, keyFn) {
  const groups = new Map();
  for (const item of list) {
    const key = keyFn(item);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(item);
  }
  return groups;
}

export default function countByStatus(orders) {
  const groups = groupBy(orders, (o) => o.status);
  return Object.fromEntries([...groups].map(([status, list]) => [status, list.length]));
}

console.log(groupBy([1, 2, 3, 4], (n) => (n % 2 === 0 ? "even" : "odd")));
console.log(countByStatus([{ status: "paid" }, { status: "new" }, { status: "paid" }]));
