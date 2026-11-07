// P11-E25: mini validation library
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };
export type Validator<T> = (value: unknown, path?: string) => Result<T>;

const fail = (path: string | undefined, msg: string): { ok: false; error: string } => ({
  ok: false,
  error: path ? `${path}: ${msg}` : msg,
});

export function string(opts: { min?: number; max?: number } = {}): Validator<string> {
  return (value, path) => {
    if (typeof value !== "string") return fail(path, "חייב להיות מחרוזת");
    if (opts.min !== undefined && value.length < opts.min) return fail(path, `לפחות ${opts.min} תווים`);
    if (opts.max !== undefined && value.length > opts.max) return fail(path, `לכל היותר ${opts.max} תווים`);
    return { ok: true, value };
  };
}

export function number(opts: { min?: number; max?: number; integer?: boolean } = {}): Validator<number> {
  return (value, path) => {
    if (typeof value !== "number" || !Number.isFinite(value)) return fail(path, "חייב להיות מספר");
    if (opts.integer && !Number.isInteger(value)) return fail(path, "חייב להיות מספר שלם");
    if (opts.min !== undefined && value < opts.min) return fail(path, `לפחות ${opts.min}`);
    if (opts.max !== undefined && value > opts.max) return fail(path, `לכל היותר ${opts.max}`);
    return { ok: true, value };
  };
}

export function boolean(): Validator<boolean> {
  return (value, path) => (typeof value === "boolean" ? { ok: true, value } : fail(path, "חייב להיות true או false"));
}

export function optional<T>(v: Validator<T>): Validator<T | undefined> {
  return (value, path) => (value === undefined ? { ok: true, value: undefined } : v(value, path));
}

export function array<T>(v: Validator<T>): Validator<T[]> {
  return (value, path) => {
    if (!Array.isArray(value)) return fail(path, "חייב להיות מערך");
    const out: T[] = [];
    for (let i = 0; i < value.length; i++) {
      const r = v(value[i], `${path ?? ""}[${i}]`);
      if (!r.ok) return r;
      out.push(r.value);
    }
    return { ok: true, value: out };
  };
}

export function object<S extends Record<string, Validator<unknown>>>(
  shape: S
): Validator<{ [K in keyof S]: S[K] extends Validator<infer T> ? T : never }> {
  return (value, path) => {
    if (typeof value !== "object" || value === null || Array.isArray(value)) return fail(path, "חייב להיות אובייקט");
    const input = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(shape)) {
      const r = shape[key](input[key], path ? `${path}.${key}` : key);
      if (!r.ok) return r;
      if (r.value !== undefined) out[key] = r.value;
    }
    return { ok: true, value: out as { [K in keyof S]: S[K] extends Validator<infer T> ? T : never } };
  };
}

const orderSchema = object({
  email: string({ min: 3 }),
  note: optional(string({ max: 20 })),
  items: array(object({ sku: string(), qty: number({ min: 1, integer: true }) })),
});
console.log(JSON.stringify(orderSchema({ email: "a@b.c", items: [{ sku: "A", qty: 2 }], hacker: true })));
console.log(JSON.stringify(orderSchema({ email: "a@b.c", items: [{ sku: "A", qty: 2 }, { sku: "B", qty: 1.5 }] })));
