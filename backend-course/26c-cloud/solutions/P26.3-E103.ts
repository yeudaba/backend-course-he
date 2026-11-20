// P26.3-E103: מיזוג values כמו Helm — מתוקן
type Values = Record<string, unknown>;
const isPlain = (x: unknown): x is Values => typeof x === "object" && x !== null && !Array.isArray(x);
const clone = (x: unknown): unknown => (Array.isArray(x) ? x.map(clone) : isPlain(x) ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, clone(v)])) : x);

export function mergeValues(base: Values, override: Values): Values {
  const out = clone(base) as Values;
  for (const [key, value] of Object.entries(override)) {
    if (value === null) delete out[key];
    else if (isPlain(value) && isPlain(out[key])) out[key] = mergeValues(out[key] as Values, value);
    else out[key] = clone(value);
  }
  return out;
}
