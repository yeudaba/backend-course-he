// P29-E94: להקליט פעם אחת, להריץ תמיד
import { createHash } from "node:crypto";

function stable(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(stable);
  if (v && typeof v === "object") {
    return Object.fromEntries(Object.keys(v).sort().map((k) => [k, stable((v as Record<string, unknown>)[k])]));
  }
  return v;
}

export function recorded<I, O>(fn: (input: I) => Promise<O>, store: Map<string, O>, mode: "record" | "replay") {
  return async (input: I): Promise<O> => {
    const key = createHash("sha256").update(JSON.stringify(stable(input))).digest("hex");
    if (mode !== "replay") {
      if (!store.has(key)) throw new Error(`אין הקלטה לקלט הזה (${key.slice(0, 8)}) — הרץ פעם אחת במצב record`);
      return structuredClone(store.get(key) as O);
    }
    const out = await fn(input);
    store.set(key, out);
    return out;
  };
}
