// P11-E83: אילו שדות השתנו?
export function changedFields<T>(before: T, after: T, fields: (keyof T)[]): (keyof T)[] {
  return fields.filter((f) => before[f] !== after[f]);
}

type User = { id: number; name: string; email: string };
const before: User = { id: 1, name: "דנה", email: "d@x.com" };
const after: User = { id: 1, name: "דנה כהן", email: "d@x.com" };
console.log(changedFields(before, after, ["name", "email"]));
console.log(changedFields(before, { ...before, email: "dana@x.com", name: "נועה" }, ["id", "name", "email"]));
