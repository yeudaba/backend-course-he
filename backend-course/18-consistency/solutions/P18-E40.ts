// P18-E40: פנקס בזיכרון — הכול או כלום
export type Op = { from: string; to: string; amount: number };

export function applyAll(balances: Map<string, number>, ops: Op[]): Map<string, number> {
  const cents = new Map([...balances].map(([k, v]) => [k, Math.round(v * 100)] as [string, number]));
  for (const { from, to, amount } of ops) {
    for (const name of [from, to]) if (!cents.has(name)) throw new Error(`חשבון לא קיים: ${name}`);
    if (!(amount > 0)) throw new Error("סכום לא חוקי");
    const a = Math.round(amount * 100);
    if (cents.get(from)! < a) throw new Error(`אין מספיק כסף: ${from}`);
    cents.set(from, cents.get(from)! - a);
    cents.set(to, cents.get(to)! + a);
  }
  return new Map([...cents].map(([k, v]) => [k, v / 100] as [string, number]));
}
