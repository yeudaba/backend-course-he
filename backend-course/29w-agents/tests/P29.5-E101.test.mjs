import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { trimHistory } = await load(import.meta.url, "P29.5-E101.ts");
const big = "x".repeat(400);
const history = () => [
  { role: "user", content: "סכם את ההזמנות של אוקטובר" },
  { role: "assistant", content: [{ type: "tool_use", id: "t1", name: "list_orders", input: {} }] },
  { role: "user", content: [{ type: "tool_result", tool_use_id: "t1", content: big }] },
  { role: "assistant", content: [{ type: "tool_use", id: "t2", name: "get_order", input: { id: 7 } }] },
  { role: "user", content: [{ type: "tool_result", tool_use_id: "t2", content: "order 7: 3 items" }] },
];
const size = (ms) => ms.reduce((s, m) => s + JSON.stringify(m).length, 0);

test("מוחקים את הישנות, לא את החדשות", () => {
  const h = history();
  const r = trimHistory(h, size(h) - 100);
  assert.equal(r[0].content, "סכם את ההזמנות של אוקטובר", "המשימה נשארת");
  assert.deepEqual(r.at(-1), h.at(-1), "התוצאה האחרונה של כלי צריכה להישאר — מוחקים מההתחלה");
  assert.ok(size(r) <= size(h) - 100);
});
test("בלי tool_result יתום: השנייה היא assistant", () => {
  const h = history();
  const r = trimHistory(h, size(h) - 100);
  assert.equal(r[1].role, "assistant", "אחרי הקיצור, ההודעה השנייה חייבת להיות של assistant");
  const useIds = new Set(r.flatMap((m) => (Array.isArray(m.content) ? m.content.filter((b) => b.type === "tool_use").map((b) => b.id) : [])));
  for (const m of r) for (const b of Array.isArray(m.content) ? m.content : []) if (b.type === "tool_result") assert.ok(useIds.has(b.tool_use_id), `tool_result של ${b.tool_use_id} בלי tool_use`);
  assert.deepEqual(r.map((m) => m.role), ["user", "assistant", "user"]);
});
test("הקלט לא משתנה, ובלי צורך — אין שינוי", () => {
  const h = history();
  const before = JSON.stringify(h);
  trimHistory(h, 50);
  assert.equal(JSON.stringify(h), before, "המערך של ה־caller השתנה");
  assert.deepEqual(trimHistory(h, 1e6), h);
  assert.equal(trimHistory(h, 1).length, 2, "לפחות הראשונה והאחרונה");
});
