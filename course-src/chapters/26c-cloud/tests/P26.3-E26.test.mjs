import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P26.3-E26.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["matches"])).matches;
const web = { app: "web", tier: "frontend", env: "prod" };
const canary = { app: "web", tier: "frontend", env: "staging", canary: "true" };
const db = { app: "postgres", tier: "db", "app.kubernetes.io/name": "pg" };

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("שוויון: =, == ו־!=", async () => {
  const matches = await get();
  assert.equal(matches(web, "app=web"), true);
  assert.equal(matches(web, "app==web"), true, "== זהה ל־=");
  assert.equal(matches(web, "app = web"), true, "רווחים מסביב לאופרטור");
  assert.equal(matches(db, "app=web"), false);
  assert.equal(matches(web, "tier!=db"), true);
  assert.equal(matches(db, "tier!=db"), false);
  assert.equal(matches({ app: "x" }, "tier!=db"), true, "!= מתאים גם כשאין label כזה בכלל (כמו ב־Kubernetes)");
  assert.equal(matches({ app: "x" }, "tier=db"), false);
  assert.equal(matches(db, "app.kubernetes.io/name=pg"), true, "נקודות ו־/ בשם");
});
test("קבוצות: in ו־notin, עם פסיקים בתוך הסוגריים", async () => {
  const matches = await get();
  assert.equal(matches(web, "env in (prod, staging)"), true);
  assert.equal(matches(canary, "env in (prod,staging)"), true);
  assert.equal(matches(db, "env in (prod,staging)"), false, "אין env — in לא מתאים");
  assert.equal(matches(web, "tier notin (frontend,db)"), false);
  assert.equal(matches({ app: "api", tier: "backend" }, "tier notin (frontend,db)"), true);
  assert.equal(matches({ app: "api" }, "tier notin (frontend,db)"), true, "notin מתאים גם כשאין label");
});
test("קיום: key ו־!key, וכמה דרישות יחד (וגם)", async () => {
  const matches = await get();
  assert.equal(matches(web, "env"), true);
  assert.equal(matches(db, "env"), false);
  assert.equal(matches(web, "!canary"), true);
  assert.equal(matches(canary, "!canary"), false);
  assert.equal(matches(web, "env in (prod, staging),!canary,app=web"), true, "פסיק מחוץ לסוגריים = וגם");
  assert.equal(matches(canary, "env in (prod, staging),!canary"), false);
  assert.equal(matches(web, ""), true, "selector ריק מתאים לכל pod");
  assert.equal(matches({ env: "" }, "env="), true, "ערך ריק מותר");
});
test("selector שבור ← SyntaxError", async () => {
  const matches = await get();
  for (const bad of ["app in prod", "app in (prod", "=web", "app=web,", "!app=web", "app ~ web", "env in (prod,,dev)"]) {
    assert.throws(() => matches(web, bad), SyntaxError, bad);
  }
});
