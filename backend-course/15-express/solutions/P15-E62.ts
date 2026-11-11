// P15-E62: מיון לפי כמה שדות
function compare(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

export function sortBy<T>(items: T[], sort: string, allowed: string[]): T[] {
  const keys = sort
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.startsWith("-") ? { field: s.slice(1), dir: -1 } : { field: s, dir: 1 }));
  for (const { field } of keys) {
    if (!allowed.includes(field)) throw new Error(`אי אפשר למיין לפי ${field}`);
  }
  return [...items].sort((a, b) => {
    for (const { field, dir } of keys) {
      const c = compare((a as Record<string, unknown>)[field], (b as Record<string, unknown>)[field]);
      if (c !== 0) return c * dir;
    }
    return 0;
  });
}

const tasks = [
  { id: 1, status: "open", priority: 2 },
  { id: 2, status: "done", priority: 5 },
  { id: 3, status: "open", priority: 9 },
  { id: 4, status: "done", priority: 5 },
];
const allowed = ["status", "priority", "id"];
console.log(sortBy(tasks, "status,-priority", allowed).map((t) => t.id));
console.log(sortBy(tasks, "-priority", allowed).map((t) => t.id));
console.log(sortBy(tasks, "", allowed).map((t) => t.id));
try {
  sortBy(tasks, "status,password", allowed);
} catch (err) {
  console.log((err as Error).message);
}
