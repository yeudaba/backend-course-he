// P25-E36: האם ה־workflow ירוץ?
type Filter = { branches?: string[]; "branches-ignore"?: string[] } | null;
export type On = string | string[] | Record<string, Filter>;

const esc = (s: string) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
function toRegex(pattern: string): RegExp {
  const body = pattern
    .split("**")
    .map((part) => part.split("*").map(esc).join("[^/]*"))
    .join(".*");
  return new RegExp(`^${body}$`);
}
const matchesAny = (branch: string, patterns: string[]) => patterns.some((p) => toRegex(p).test(branch));

export function shouldTrigger(on: On, event: { name: string; branch: string }): boolean {
  if (typeof on === "string") return on === event.name;
  if (Array.isArray(on)) return on.includes(event.name);
  if (!Object.hasOwn(on, event.name)) return false;
  const filter = on[event.name];
  if (filter?.branches && !matchesAny(event.branch, filter.branches)) return false;
  if (filter?.["branches-ignore"] && matchesAny(event.branch, filter["branches-ignore"])) return false;
  return true;
}
