// P26.3-E18: scheduler קטן — לאיזה node כל pod הולך (לפי requests)
export interface NodeSpec {
  name: string;
  cpu: string;
  memory: string;
}
export interface PodSpec {
  name: string;
  cpu: string;
  memory: string;
}

// מוכנות (מ־E14)
export const parseCpu = (q: string) => (q.endsWith("m") ? Number(q.slice(0, -1)) : Number(q) * 1000);
const UNITS: Record<string, number> = { Ki: 2 ** 10, Mi: 2 ** 20, Gi: 2 ** 30, k: 1e3, M: 1e6, G: 1e9 };
export const parseMemory = (q: string) => {
  const m = /^(\d+(?:\.\d+)?)(Ki|Mi|Gi|k|M|G)?$/.exec(q)!;
  return Math.round(Number(m[1]) * (m[2] ? UNITS[m[2]] : 1));
};

export function schedule(nodes: NodeSpec[], pods: PodSpec[]) {
  const free = new Map(nodes.map((n) => [n.name, { cpu: parseCpu(n.cpu), memory: parseMemory(n.memory) }]));
  const order = pods
    .map((p) => ({ name: p.name, cpu: parseCpu(p.cpu), memory: parseMemory(p.memory) }))
    .sort((a, b) => b.cpu - a.cpu || b.memory - a.memory || a.name.localeCompare(b.name)); // הגדולים קודם
  const placements: Record<string, string> = {};
  const pending: string[] = [];
  for (const pod of order) {
    const node = nodes.find((n) => {
      const f = free.get(n.name)!;
      return f.cpu >= pod.cpu && f.memory >= pod.memory;
    });
    if (!node) {
      pending.push(pod.name);
      continue;
    }
    const f = free.get(node.name)!;
    f.cpu -= pod.cpu;
    f.memory -= pod.memory;
    placements[pod.name] = node.name;
  }
  return { placements, pending, free: Object.fromEntries(free) };
}
