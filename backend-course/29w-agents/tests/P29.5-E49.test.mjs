import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { connect } from "./_mcp.mjs";

const { createFaqMcpServer } = await load(import.meta.url, "P29.5-E49.ts");
const FAQS = [
  { id: "ship", q: "כמה זמן לוקח משלוח?", a: "משלוח רגיל — 3 ימי עסקים. משלוח מהיר — יום אחד." },
  { id: "return", q: "איך מחזירים מוצר?", a: "תוך 30 יום, עם קבלה. משלוח ההחזרה עלינו." },
  { id: "warranty", q: "יש אחריות על מטחנות?", a: "שנתיים אחריות על כל מטחנה." },
  { id: "c40", q: "Is the C40 good for espresso?", a: "Yes, the C40 grinder handles espresso." },
];

test("listTools: שם, תיאור, readOnlyHint, סכמה", async (t) => {
  const { client } = await connect(t, createFaqMcpServer(FAQS));
  const { tools } = await client.listTools();
  assert.equal(tools.length, 1);
  const [s] = tools;
  assert.equal(s.name, "search_faq");
  assert.ok((s.description ?? "").length >= 20);
  assert.equal(s.annotations?.readOnlyHint, true);
  assert.deepEqual(Object.keys(s.inputSchema.properties).sort(), ["limit", "query"]);
  assert.deepEqual(s.inputSchema.required, ["query"]);
});
test("חיפוש: ציון, סדר, limit", async (t) => {
  const { call } = await connect(t, createFaqMcpServer(FAQS));
  let r = await call("search_faq", { query: "משלוח החזרה" });
  assert.equal(r.isError, false);
  assert.deepEqual(JSON.parse(r.text).map((x) => x.id), ["return", "ship"]);
  r = await call("search_faq", { query: "משלוח", limit: 1 });
  assert.deepEqual(JSON.parse(r.text), [{ id: "return", q: FAQS[1].q, a: FAQS[1].a }], "תיקו ← לפי id");
  r = await call("search_faq", { query: "ESPRESSO c40 c40" });
  assert.deepEqual(JSON.parse(r.text).map((x) => x.id), ["c40"]);
  r = await call("search_faq", { query: "אחריות מטחנה משלוח" });
  assert.deepEqual(JSON.parse(r.text).map((x) => x.id), ["warranty", "return", "ship"]);
});
test("אין תוצאות ← no results; קלט לא תקין ← שגיאה", async (t) => {
  const { call } = await connect(t, createFaqMcpServer(FAQS));
  assert.deepEqual(await call("search_faq", { query: "פיצה" }), { text: "no results", isError: false });
  assert.deepEqual(await call("search_faq", { query: "?!" }), { text: "no results", isError: false });
  for (const args of [{ query: "x" }, { query: "x".repeat(101) }, { query: "משלוח", limit: 0 }, { query: "משלוח", limit: 11 }, { query: "משלוח", limit: 1.5 }, {}]) {
    assert.equal((await call("search_faq", args)).isError, true, JSON.stringify(args).slice(0, 40));
  }
});
