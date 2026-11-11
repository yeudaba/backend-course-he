import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P14-E66.mjs", ["toHttpFile"])).toHttpFile;

test("אותו origin ← @base", async () => {
  const f = await get();
  const text = f([
    { name: "כל המוצרים", method: "GET", url: "http://localhost:4000/products" },
    { name: "מוצר חדש", method: "POST", url: "http://localhost:4000/products", headers: { "Content-Type": "application/json" }, body: { name: "מסך" } },
  ]);
  assert.equal(
    text,
    "@base = http://localhost:4000\n\n### כל המוצרים\nGET {{base}}/products\n\n### מוצר חדש\nPOST {{base}}/products\nContent-Type: application/json\n\n{\n  \"name\": \"מסך\"\n}\n",
  );
});
test("בקשה אחת ← בלי @base, גוף מחרוזת כמו שהוא", async () => {
  const f = await get();
  assert.equal(f([{ name: "בריאות", method: "GET", url: "https://api.shop.test/health" }]), "### בריאות\nGET https://api.shop.test/health\n");
  assert.equal(
    f([{ name: "טופס", method: "POST", url: "http://x.test/f", headers: { A: "1", B: "2" }, body: "a=1&b=2" }]),
    "### טופס\nPOST http://x.test/f\nA: 1\nB: 2\n\na=1&b=2\n",
  );
});
test("origins שונים ← כתובות מלאות", async () => {
  const f = await get();
  const text = f([
    { name: "a", method: "GET", url: "http://localhost:4000/a" },
    { name: "b", method: "GET", url: "http://localhost:4001/b" },
  ]);
  assert.equal(text, "### a\nGET http://localhost:4000/a\n\n### b\nGET http://localhost:4001/b\n");
});
test("ה־origin מוחלף רק בהתחלה", async () => {
  const f = await get();
  const text = f([
    { name: "שורש", method: "GET", url: "https://api.test" },
    { name: "הפניה", method: "GET", url: "https://api.test/login?next=https://api.test/me" },
  ]);
  assert.equal(text, "@base = https://api.test\n\n### שורש\nGET {{base}}\n\n### הפניה\nGET {{base}}/login?next=https://api.test/me\n");
});
