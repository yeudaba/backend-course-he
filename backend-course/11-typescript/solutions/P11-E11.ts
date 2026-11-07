// P11-E11
export function formatId(id: string | number): string {
  if (typeof id === "number") {
    return `#${String(id).padStart(4, "0")}`;
  }
  return id.toUpperCase();
}

export function toArray<T>(x: T | T[]): T[] {
  return Array.isArray(x) ? x : [x];
}

export function lengthOf(x: string | unknown[] | null): number {
  return x === null ? 0 : x.length;
}

console.log(formatId(42), formatId("ab-1"), toArray(5), toArray([1, 2]), lengthOf(null));
