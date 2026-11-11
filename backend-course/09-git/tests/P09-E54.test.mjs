import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_git.mjs";

const FILE = "P09-E54.js";
const get = () => exportsOf(import.meta.url, FILE, ["toExample"]);

test("מוחקת ערכים, שומרת הערות ושורות ריקות", async () => {
  const { toExample } = await get();
  assert.equal(toExample("# DB\nDATABASE_URL=postgres://u:p@h/db\nPORT=3000\n\nJWT_SECRET=abc=def", ["PORT"]), "# DB\nDATABASE_URL=\nPORT=3000\n\nJWT_SECRET=");
  assert.equal(toExample("A=1\nB=2"), "A=\nB=", "ברירת מחדל: keep ריק");
});
test("keep עם = בערך, ורווחים במפתח", async () => {
  const { toExample } = await get();
  assert.equal(toExample(" MODE =a=b\nX=1", ["MODE"]), "MODE=a=b\nX=");
});
test("שורה בלי = נזרקת", async () => {
  const { toExample } = await get();
  assert.equal(toExample("A=1\nbroken\nB=2"), "A=\nB=");
  assert.equal(toExample(""), "");
});
