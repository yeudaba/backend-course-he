import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, code } from "./_ts.mjs";

const FILE = "P23-E28.ts";
const get = () => exportsOf(import.meta.url, FILE, ["parseSize", "formatSize", "totalSize"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("parseSize — יחידות עשרוניות", async () => {
  const { parseSize } = await get();
  assert.equal(parseSize("999B"), 999);
  assert.equal(parseSize("12.3kB"), 12300);
  assert.equal(parseSize("4KB"), 4000);
  assert.equal(parseSize("245MB"), 245_000_000, "MB = 1,000,000 (לא 1024 × 1024)");
  assert.equal(Math.round(parseSize("1.21GB")), 1_210_000_000);
  assert.equal(parseSize("2TB"), 2e12);
  for (const bad of ["12", "MB", "12 parsecs", "1.2.3MB", ""]) assert.throws(() => parseSize(bad), Error, `"${bad}" צריך לזרוק`);
});
test("formatSize — היחידה הגדולה, ספרה אחת אחרי הנקודה, בלי .0", async () => {
  const { formatSize } = await get();
  assert.equal(formatSize(0), "0B");
  assert.equal(formatSize(999), "999B");
  assert.equal(formatSize(1000), "1kB");
  assert.equal(formatSize(12_340), "12.3kB");
  assert.equal(formatSize(245_000_000), "245MB");
  assert.equal(formatSize(1_500_000_000), "1.5GB");
  assert.equal(formatSize(1_733_000_000), "1.7GB");
  assert.equal(formatSize(3e12), "3TB");
});
test("totalSize — לפי הכותרת, לא לפי מיקום", async () => {
  const { totalSize } = await get();
  const out = `REPOSITORY   TAG         IMAGE ID       CREATED        SIZE
tasks-api    latest      3f1c2a9b8e7d   2 hours ago    245MB
postgres     17-alpine   9a8b7c6d5e4f   3 weeks ago    278MB
node         24-slim     1a2b3c4d5e6f   4 weeks ago    1.21GB
`;
  assert.equal(totalSize(out), "1.7GB");
  const reordered = `SIZE      REPOSITORY   CREATED AT
80.5MB    nginx        2 days ago
19.5kB    hello        1 year ago`;
  assert.equal(totalSize(reordered), "80.5MB", "SIZE בעמודה הראשונה — חפש אותה בכותרת");
  assert.equal(totalSize("REPOSITORY   SIZE"), "0B", "בלי שורות — 0B");
});
test("switch ו־reduce", () => {
  const c = code(import.meta.url, FILE);
  assert.match(c, /\bswitch\s*\(/, "את היחידה בוחרים עם switch (פרק 4)");
  assert.match(c, /\.reduce\s*\(/, "את הסכום מחשבים עם reduce (פרק 6)");
});
