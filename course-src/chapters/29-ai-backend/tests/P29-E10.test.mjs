import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message, toolUse, thinking, userText } from "./_claude.mjs";
import { z } from "zod";

const { parseJsonReply } = await load(import.meta.url, "P29-E10.ts");
const S = z.object({ category: z.enum(["a", "b"]), score: z.number() });

test("JSON נקי, בתוך גדר, ועם טקסט מסביב", () => {
  assert.deepEqual(parseJsonReply('{"category":"a","score":3}', S), { ok: true, data: { category: "a", score: 3 } });
  assert.deepEqual(parseJsonReply('הנה:\n```json\n{"category":"b","score":1}\n```\nבהצלחה', S), { ok: true, data: { category: "b", score: 1 } });
  assert.deepEqual(parseJsonReply('בטח! {"category":"a","score":0} — זה הכול.', S), { ok: true, data: { category: "a", score: 0 } });
});
test("לא JSON / JSON שבור / לא לפי הסכמה ← ok: false עם הסבר", () => {
  assert.equal(parseJsonReply("אין לי מושג", S).ok, false);
  assert.equal(parseJsonReply('{"category":"a",', S).ok, false);
  const r = parseJsonReply('{"category":"c","score":"x"}', S);
  assert.equal(r.ok, false);
  assert.match(r.error, /category/);
  assert.match(r.error, /score/);
});
