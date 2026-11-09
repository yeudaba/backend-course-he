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

// מוכנות (מ־E14) — millicores ובתים
export const parseCpu = (q: string) => (q.endsWith("m") ? Number(q.slice(0, -1)) : Number(q) * 1000);
const UNITS: Record<string, number> = { Ki: 2 ** 10, Mi: 2 ** 20, Gi: 2 ** 30, k: 1e3, M: 1e6, G: 1e9 };
export const parseMemory = (q: string) => {
  const m = /^(\d+(?:\.\d+)?)(Ki|Mi|Gi|k|M|G)?$/.exec(q)!;
  return Math.round(Number(m[1]) * (m[2] ? UNITS[m[2]] : 1));
};

export function schedule(nodes: NodeSpec[], pods: PodSpec[]): {
  placements: Record<string, string>;
  pending: string[];
  free: Record<string, { cpu: number; memory: number }>;
} {
  throw new Error("עוד לא כתבת את הפתרון");
}
