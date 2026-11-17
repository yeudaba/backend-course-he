import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { exportsOf } from "./_ts.mjs";
import { startApp, typesOk } from "./_app.mjs";

const FILE = "P15-E77.ts";
const mod = () => exportsOf(import.meta.url, FILE, ["toFieldErrors", "signupSchema", "createApp"]);

test("עובר בדיקת טיפוסים", () => typesOk(import.meta.url, FILE));
test("toFieldErrors על סכמה כלשהי", async () => {
  const { toFieldErrors } = await mod();
  const s = z.object({ items: z.array(z.object({ qty: z.number().min(1, "לפחות 1") })), name: z.string().min(2, "קצר").max(3, "ארוך").regex(/^a/, "a בהתחלה") });
  const r = s.safeParse({ items: [{ qty: 1 }, { qty: 0 }, { qty: -1 }], name: "b" });
  assert.deepEqual(toFieldErrors(r.error), { "items.1.qty": ["לפחות 1"], "items.2.qty": ["לפחות 1"], name: ["קצר", "a בהתחלה"] });
  assert.deepEqual(toFieldErrors(z.string().safeParse(5).error), { _root: [z.string().safeParse(5).error.issues[0].message] });
});
test("signupSchema", async () => {
  const { signupSchema, toFieldErrors } = await mod();
  assert.deepEqual(signupSchema.parse({ email: "a@b.co", password: "abcdefg1" }), { email: "a@b.co", password: "abcdefg1", tags: [] });
  const r = signupSchema.safeParse({ email: "dana", password: "abc", tags: ["ok", "", ""] });
  assert.deepEqual(toFieldErrors(r.error), {
    email: ["אימייל לא תקין"],
    password: ["לפחות 8 תווים", "חייבת ספרה"],
    "tags.1": ["תגית ריקה"],
    "tags.2": ["תגית ריקה"],
  });
  assert.deepEqual(toFieldErrors(signupSchema.safeParse({ email: "a@b.co", password: "abcdefgh" }).error), { password: ["חייבת ספרה"] });
});
test("POST /signup", async (t) => {
  const call = await startApp(t, import.meta.url, FILE);
  let r = await call("POST", "/signup", { email: "a@b.co", password: "secret123", tags: ["x"] });
  assert.deepEqual([r.status, r.body], [201, { email: "a@b.co", tags: ["x"] }], "בלי הסיסמה בתשובה");
  r = await call("POST", "/signup", { email: "a", password: "12345678" });
  assert.deepEqual([r.status, r.body], [400, { error: { code: "VALIDATION_ERROR", fields: { email: ["אימייל לא תקין"] } } }]);
  r = await call("POST", "/signup");
  assert.equal(r.status, 400);
  assert.ok(r.body.error.fields._root, "בלי גוף ← שגיאה בשורש (_root)");
});
