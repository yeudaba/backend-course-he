// P19-E62: "migrate diff" בזיכרון
export type Column = { table: string; name: string; type: string; nullable: boolean };

function byTable(cols: Column[]) {
  const m = new Map<string, Map<string, Column>>();
  for (const c of cols) {
    if (!m.has(c.table)) m.set(c.table, new Map());
    m.get(c.table)!.set(c.name, c);
  }
  return m;
}
const union = (a: Iterable<string>, b: Iterable<string>) => [...new Set([...a, ...b])].sort();

export function diffColumns(before: Column[], after: Column[]) {
  const b = byTable(before);
  const a = byTable(after);
  const steps: string[] = [];
  let destructive = false;
  for (const t of union(b.keys(), a.keys())) {
    const old = b.get(t);
    const cur = a.get(t);
    if (!old) { steps.push(`CREATE TABLE ${t}`); continue; }
    if (!cur) { steps.push(`DROP TABLE ${t}`); destructive = true; continue; }
    for (const name of union(old.keys(), cur.keys())) {
      const o = old.get(name);
      const c = cur.get(name);
      if (!o) steps.push(`ADD COLUMN ${t}.${name} ${c!.type}${c!.nullable ? "" : " NOT NULL"}`);
      else if (!c) { steps.push(`DROP COLUMN ${t}.${name}`); destructive = true; }
      else {
        if (o.type !== c.type) { steps.push(`ALTER COLUMN ${t}.${name} TYPE ${c.type}`); destructive = true; }
        if (o.nullable && !c.nullable) { steps.push(`ALTER COLUMN ${t}.${name} SET NOT NULL`); destructive = true; }
        if (!o.nullable && c.nullable) steps.push(`ALTER COLUMN ${t}.${name} DROP NOT NULL`);
      }
    }
  }
  return { steps, destructive };
}
