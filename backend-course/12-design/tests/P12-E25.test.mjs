import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { Container } = await load(import.meta.url, "P12-E25.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P12-E25.ts"); assert.ok(r.ok, r.output); });
test("singleton ותלויות", () => {
  const c = new Container(); let made = 0;
  c.register("repo", () => ({ n: ++made }));
  c.register("svc", (ct) => ({ repo: ct.resolve("repo") }));
  const s = c.resolve("svc");
  assert.equal(s, c.resolve("svc")); assert.equal(s.repo, c.resolve("repo")); assert.equal(made, 1);
});
test("שגיאות רישום", () => { const c = new Container(); c.register("a", () => 1); assert.throws(() => c.register("a", () => 2), { message: "השירות a כבר רשום" }); assert.throws(() => c.resolve("x"), { message: "השירות x לא רשום" }); });
test("תלות מעגלית", () => {
  const c = new Container();
  c.register("A", (ct) => ct.resolve("B")); c.register("B", (ct) => ct.resolve("C")); c.register("C", (ct) => ct.resolve("A"));
  assert.throws(() => c.resolve("A"), { message: "תלות מעגלית: A -> B -> C -> A" });
  c.register("D", () => "ok");
  assert.equal(c.resolve("D"), "ok");
});
