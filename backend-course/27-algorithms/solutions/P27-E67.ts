// P27-E67: משורות לעץ — עם זיהוי מעגל
type Row = { id: number; parentId: number | null; name: string };
type Node = { id: number; name: string; children: Node[] };

const byName = (a: Node, b: Node) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);

export function buildTree(rows: Row[]): Node[] {
  const nodes = new Map<number, Node>();
  for (const r of rows) nodes.set(r.id, { id: r.id, name: r.name, children: [] });
  const roots: Node[] = [];
  for (const r of rows) {
    const node = nodes.get(r.id)!;
    if (r.parentId === null) roots.push(node);
    else {
      const parent = nodes.get(r.parentId);
      if (!parent) throw new Error(`ORPHAN ${r.id}`);
      parent.children.push(node);
    }
  }
  let reached = 0;
  const queue = [...roots];
  for (let head = 0; head < queue.length; head++) {
    reached++;
    queue[head].children.sort(byName);
    queue.push(...queue[head].children);
  }
  if (reached !== rows.length) throw new Error("CYCLE");
  return roots.sort(byName);
}
