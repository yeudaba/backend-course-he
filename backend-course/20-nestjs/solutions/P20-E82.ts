// P20-E82: לקרוא מסמך OpenAPI בקוד
const ORDER = ["get", "post", "put", "patch", "delete"];

export function listEndpoints(doc: any): string[] {
  const rows = Object.entries(doc.paths ?? {}).flatMap(([path, ops]) =>
    Object.keys(ops as object)
      .filter((m) => ORDER.includes(m))
      .map((m) => ({ path, m })),
  );
  rows.sort((a, b) => (a.path === b.path ? ORDER.indexOf(a.m) - ORDER.indexOf(b.m) : a.path < b.path ? -1 : 1));
  return rows.map((r) => `${r.m.toUpperCase()} ${r.path}`);
}

export function requiredFields(doc: any, schema: string): string[] {
  const s = doc.components?.schemas?.[schema];
  if (!s) throw new Error(`אין סכמה ${schema}`);
  return [...(s.required ?? [])].sort();
}
