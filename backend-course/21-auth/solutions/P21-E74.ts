// P21-E74: applyPatch — רשימה מפורשת של שדות שמותר לשנות
export function applyPatch<T extends object>(entity: T, patch: unknown, allowed: readonly (keyof T & string)[]): T {
  if (typeof patch !== "object" || patch === null || Array.isArray(patch)) throw new Error("גוף לא תקין");
  const keys = Object.keys(patch);
  for (const key of keys) {
    if (!(allowed as readonly string[]).includes(key)) throw new Error(`שדה לא מותר: ${key}`);
  }
  const out: any = { ...entity };
  for (const key of keys) {
    const value = (patch as Record<string, unknown>)[key];
    if (value !== undefined) out[key] = value;
  }
  return out;
}
