// P24-E68: למצוא חיובים כפולים
export type Payment = { id: number; userId: number; amountCents: number; createdAt: string };

export function suspectedDuplicates(payments: Payment[], windowMs: number): number[][] {
  const byKey = new Map<string, Payment[]>();
  for (const p of payments) {
    const k = `${p.userId}:${p.amountCents}`;
    byKey.set(k, [...(byKey.get(k) ?? []), p]);
  }
  const groups: Payment[][] = [];
  for (const list of byKey.values()) {
    const sorted = [...list].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
    let current: Payment[] = [];
    for (const p of sorted) {
      const prev = current.at(-1);
      if (prev && Date.parse(p.createdAt) - Date.parse(prev.createdAt) < windowMs) current.push(p);
      else {
        if (current.length >= 2) groups.push(current);
        current = [p];
      }
    }
    if (current.length >= 2) groups.push(current);
  }
  return groups
    .sort((a, b) => Date.parse(a[0].createdAt) - Date.parse(b[0].createdAt))
    .map((g) => g.map((p) => p.id));
}

const t = (s: number) => new Date(Date.UTC(2026, 10, 7, 12, 0, s)).toISOString();
console.log(suspectedDuplicates([
  { id: 1, userId: 1, amountCents: 4990, createdAt: t(0) },
  { id: 2, userId: 1, amountCents: 4990, createdAt: t(40) },
  { id: 3, userId: 2, amountCents: 4990, createdAt: t(41) },
  { id: 4, userId: 1, amountCents: 4990, createdAt: t(59) },
], 60_000));
