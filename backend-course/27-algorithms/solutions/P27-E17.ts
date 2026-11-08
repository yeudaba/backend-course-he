// P27-E17
// מיון טופולוגי (Kahn): מתחילים ממי שאין לו תלויות, ו"משחררים" את מי שחיכה לו.
// נשארו צמתים שלא שוחררו ← יש מעגל. בכל שלב — האלפביתי הראשון, כדי שהסדר יהיה קבוע
export function buildOrder(deps: Readonly<Record<string, readonly string[]>>): string[] {
  const names = new Set<string>(Object.keys(deps));
  for (const list of Object.values(deps)) for (const d of list) names.add(d);
  const waitingFor = new Map<string, number>();
  const dependents = new Map<string, string[]>();
  for (const name of names) {
    waitingFor.set(name, 0);
    dependents.set(name, []);
  }
  for (const [name, list] of Object.entries(deps)) {
    for (const d of new Set(list)) {
      waitingFor.set(name, waitingFor.get(name)! + 1);
      dependents.get(d)!.push(name);
    }
  }
  const ready = [...names].filter((n) => waitingFor.get(n) === 0).sort();
  const order: string[] = [];
  while (ready.length) {
    const next = ready.shift()!;
    order.push(next);
    for (const dep of dependents.get(next)!) {
      const left = waitingFor.get(dep)! - 1;
      waitingFor.set(dep, left);
      if (left === 0) {
        ready.push(dep);
        ready.sort();
      }
    }
  }
  if (order.length !== names.size) {
    const stuck = [...names].filter((n) => !order.includes(n)).sort();
    throw new Error(`יש מעגל בתלויות: ${stuck.join(", ")}`);
  }
  return order;
}
