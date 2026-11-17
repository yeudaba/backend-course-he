// P26.3-E39: terraform plan קטן
type Resource = { type: string; name: string; props: Record<string, unknown> };

const id = (r: Resource) => `${r.type}.${r.name}`;

export function plan(desired: Resource[], actual: Resource[]) {
  const have = new Map(actual.map((r) => [id(r), r]));
  const want = new Map(desired.map((r) => [id(r), r]));
  const create: string[] = [];
  const update: { id: string; changes: string[] }[] = [];
  let unchanged = 0;
  for (const [k, d] of want) {
    const a = have.get(k);
    if (!a) {
      create.push(k);
      continue;
    }
    const keys = new Set([...Object.keys(d.props), ...Object.keys(a.props)]);
    const changes = [...keys].filter((p) => JSON.stringify(d.props[p]) !== JSON.stringify(a.props[p])).sort();
    if (changes.length) update.push({ id: k, changes });
    else unchanged++;
  }
  const del = [...have.keys()].filter((k) => !want.has(k));
  return { create: create.sort(), update: update.sort((x, y) => (x.id < y.id ? -1 : 1)), delete: del.sort(), unchanged };
}
