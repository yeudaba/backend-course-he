import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P16-E40.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["formatTable"])).formatTable;
test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("שתי שורות", async () => {
  const f = await get();
  assert.equal(
    f([{ name: "Hand Grinder", price: "189.00" }, { name: "Electric Grinder Pro", price: "649.00" }]),
    [" name                 | price", "----------------------+--------", " Hand Grinder         | 189.00", " Electric Grinder Pro | 649.00", "(2 rows)"].join("\n"),
  );
});
test("כותרת ארוכה, null, שורה אחת, בלי שורות", async () => {
  const f = await get();
  assert.equal(f([{ full_name: "Yossi", phone: null, n: 7 }]), [" full_name | phone | n", "-----------+-------+---", " Yossi     |       | 7", "(1 row)"].join("\n"));
  assert.equal(f([]), "(0 rows)");
  assert.equal(f([{ a: true }, { a: false }]), [" a", "-------", " true", " false", "(2 rows)"].join("\n"));
});
