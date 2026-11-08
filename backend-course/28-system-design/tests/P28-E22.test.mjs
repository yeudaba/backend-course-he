import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createRing } = await load(import.meta.url, "P28-E22.ts");
const keys = Array.from({ length: 5000 }, (_, i) => `k${i}`);

test("כל מפתח מקבל שרת (גם אחרי הנקודה האחרונה)", () => {
  const r = createRing();
  r.add("a");
  r.add("b");
  for (const k of keys) assert.ok(["a", "b"].includes(r.get(k)), `${k} ← ${r.get(k)}`);
});
test("הסרה מוציאה את השרת לגמרי", () => {
  const r = createRing();
  for (const n of ["a", "b", "c"]) r.add(n);
  r.remove("b");
  assert.ok(keys.every((k) => r.get(k) !== "b"));
});
test("עקבי: הוספה מזיזה רק מפתחות לשרת החדש", () => {
  const r = createRing();
  for (const n of ["a", "b", "c"]) r.add(n);
  const before = new Map(keys.map((k) => [k, r.get(k)]));
  r.add("d");
  for (const k of keys) if (r.get(k) !== before.get(k)) assert.equal(r.get(k), "d");
});
