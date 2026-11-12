// P25.7-E38: ממסמך ל־JSON של API
import { ObjectId } from "mongodb";

export function toApi(value: unknown): unknown {
  if (value instanceof ObjectId) return value.toHexString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(toApi);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, x]) => [k === "_id" ? "id" : k, toApi(x)]));
  }
  return value;
}
