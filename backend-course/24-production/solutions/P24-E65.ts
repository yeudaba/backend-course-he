// P24-E65: טביעת אצבע קנונית
import { createHash } from "node:crypto";

export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map((v) => (v === undefined ? "null" : canonicalJson(v))).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).filter((k) => obj[k] !== undefined).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(obj[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function fingerprint(method: string, path: string, body: unknown): string {
  return createHash("sha256").update(`${method.toUpperCase()} ${path}\n${canonicalJson(body)}`).digest("hex");
}

console.log(canonicalJson({ b: 1, a: { d: [3, { z: 1, y: 2 }], c: undefined } }));
console.log(fingerprint("post", "/tasks", { title: "חלב", priority: 1 }) === fingerprint("POST", "/tasks", { priority: 1, title: "חלב" }));
