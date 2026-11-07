import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { statusLabel } = await load(import.meta.url, "P11-E22.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P11-E22.ts"); assert.ok(r.ok, r.output); });
test("כל התוויות", () => { assert.equal(statusLabel("pending"), "ממתין"); assert.equal(statusLabel("refunded"), "הוחזר"); });
test("שכחה של סטטוס הייתה נותנת שגיאת טיפוסים (יש never)", async () => {
  const fs = await import("node:fs"); const path = await import("node:path"); const { fileURLToPath } = await import("node:url");
  const src = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", process.env.CHECK_TARGET || "starter", "P11-E22.ts"), "utf8");
  assert.match(src, /never/);
  assert.match(src, /\):\s*string/);
});
