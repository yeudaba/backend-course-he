// P19-E45: snake_case ל־camelCase
export function toCamel(name: string): string {
  return name.replace(/(?<=[^_])_([a-z0-9])/g, (_m, ch: string) => ch.toUpperCase());
}

export function camelize(row: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [toCamel(k), v]));
}

console.log(camelize({ id: 1, full_name: "Dana Levi", is_active: true, joined_on: "2025-11-02" }));
console.log(["_private", "a__b", "trailing_", "created_at_utc"].map(toCamel));
