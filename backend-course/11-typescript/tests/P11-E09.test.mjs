import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { displayName, cityOf, phoneCount } = await load(import.meta.url, "P11-E09.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P11-E09.ts"); assert.ok(r.ok, r.output); });
test("displayName", () => { assert.equal(displayName({ nickname: "", firstName: "דנה" }), "דנה"); assert.equal(displayName({ nickname: "D" }), "D"); assert.equal(displayName({}), "אורח"); });
test("cityOf", () => { assert.equal(cityOf({}), "לא ידוע"); assert.equal(cityOf({ address: { city: "חיפה" } }), "חיפה"); });
test("phoneCount", () => { assert.equal(phoneCount({}), 0); assert.equal(phoneCount({ phones: ["1", "2"] }), 2); });
test("בלי as ובלי !", async () => { const fs = await import("node:fs"); const path = await import("node:path"); const { fileURLToPath } = await import("node:url"); const file = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", process.env.CHECK_TARGET || "starter", "P11-E09.ts"); const src = fs.readFileSync(file, "utf8"); assert.ok(!/\bas\s+[A-Z{]/.test(src) && !/[\w)\]]!\./.test(src)); });
