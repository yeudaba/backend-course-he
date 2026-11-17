// P26.3-E73: mergeValues כמו של Helm
type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => v !== null && typeof v === "object" && !Array.isArray(v);

function mergeTwo(base: Obj, over: Obj): Obj {
  const out: Obj = structuredClone(base);
  for (const [k, v] of Object.entries(over)) {
    if (v === null) delete out[k];
    else if (isObj(v) && isObj(out[k])) out[k] = mergeTwo(out[k] as Obj, v);
    else out[k] = structuredClone(v);
  }
  return out;
}

export function mergeValues(...layers: Obj[]): Obj {
  return layers.reduce(mergeTwo, {});
}
