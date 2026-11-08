import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message, toolUse, thinking, userText } from "./_claude.mjs";

const { classifyTicket } = await load(import.meta.url, "P29-E09.ts");
const json = (o) => message(JSON.stringify(o));

test("structured output: format עם סכמה, והתוצאה מאומתת", async () => {
  const { client, bodies } = fakeClaude(() => json({ category: "refund", urgency: "normal", summary: "רוצה החזר על מטחנה" }));
  const r = await classifyTicket(client, "המטחנה הגיעה שבורה, אני רוצה החזר");
  assert.deepEqual(r, { category: "refund", urgency: "normal", summary: "רוצה החזר על מטחנה", needsHuman: false });
  const b = bodies()[0];
  assert.equal(b.model, "claude-opus-5-5");
  assert.equal(b.output_config?.format?.type, "json_schema", "output_config.format מ־zodOutputFormat");
  assert.deepEqual(b.output_config.format.schema.required.sort(), ["category", "summary", "urgency"]);
  assert.match(userText(b.messages[0]), /המטחנה הגיעה שבורה/);
});
test("urgency high ← needsHuman", async () => {
  const { client } = fakeClaude(() => json({ category: "complaint", urgency: "high", summary: "x" }));
  assert.equal((await classifyTicket(client, "!!!")).needsHuman, true);
});
test("JSON שלא מתאים לסכמה, תשובה חתוכה, סירוב ← other + needsHuman", async () => {
  for (const reply of [json({ category: "spam", urgency: "low", summary: "x" }), message('{"category":"ref', { stop_reason: "max_tokens" }), message("", { stop_reason: "refusal" })]) {
    const { client } = fakeClaude(() => reply);
    const r = await classifyTicket(client, "טקסט ארוך של לקוח");
    assert.equal(r.category, "other");
    assert.equal(r.needsHuman, true);
  }
});
test("שגיאת API (500) — עולה, לא נבלעת", async () => {
  const { client } = fakeClaude(() => ({ error: 500 }));
  await assert.rejects(classifyTicket(client, "x"), (e) => e.status === 500);
});
