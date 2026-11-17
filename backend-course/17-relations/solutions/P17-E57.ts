// P17-E57: leftJoin גנרי
export function innerJoin<L, R>(left: L[], right: R[], on: (l: L, r: R) => boolean): { left: L; right: R }[] {
  const out: { left: L; right: R }[] = [];
  for (const l of left) for (const r of right) if (on(l, r)) out.push({ left: l, right: r });
  return out;
}

export function leftJoin<L, R>(left: L[], right: R[], on: (l: L, r: R) => boolean): { left: L; right: R | null }[] {
  const out: { left: L; right: R | null }[] = [];
  for (const l of left) {
    const matches = right.filter((r) => on(l, r));
    if (matches.length === 0) out.push({ left: l, right: null });
    else for (const r of matches) out.push({ left: l, right: r });
  }
  return out;
}

const customers = [{ id: 1, name: "Dana" }, { id: 4, name: "Avi" }];
const orders = [{ id: 1, customerId: 1 }, { id: 3, customerId: 1 }];
for (const { left, right } of leftJoin(customers, orders, (c, o) => o.customerId === c.id)) {
  console.log(left.name, right === null ? "-" : right.id);
}
