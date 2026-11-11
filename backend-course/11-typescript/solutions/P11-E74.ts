// P11-E74: מערך של מחרוזות?
export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((x) => typeof x === "string");
}

export function tagsOf(value: unknown): string[] {
  if (isStringArray(value)) return value.map((t) => t.toLowerCase());
  return [];
}

console.log(isStringArray(["a", "b"]), isStringArray(["a", 1]), isStringArray([]), isStringArray("ab"));
console.log(tagsOf(["New", "SALE"]), tagsOf("new"));
