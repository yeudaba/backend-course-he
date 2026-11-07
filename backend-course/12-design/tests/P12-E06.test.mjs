import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { Counter } = await load(import.meta.url, "P12-E06.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P12-E06.ts"); assert.ok(r.ok, r.output); });
test("increment ושרשור עם max", () => { const c = new Counter(0, 2); assert.equal(c.increment().increment().increment().value, 2); });
test("reset ל־start", () => { const c = new Counter(5); c.increment(); c.reset(); assert.equal(c.value, 5); });
test("value קריאה בלבד, count פרטי", () => { const c = new Counter(); assert.throws(() => { c.value = 9; }); assert.equal(Object.keys(c).includes("count"), false); });
