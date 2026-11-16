import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message } from "./_claude.mjs";

const { askJson } = await load(import.meta.url, "P29-E52.ts");
const Schema = z.object({ category: z.enum(["refund", "other"]) });
const P = { system: "classify", question: "רוצה החזר" };

test("הצלחה ראשונה", async () => {
  const { client, bodies } = fakeClaude(() => message(' {"category":"refund"} '));
  assert.deepEqual(await askJson(client, P, Schema), { ok: true, data: { category: "refund" }, attempts: 1 });
  assert.equal(bodies()[0].system, "classify");
  assert.deepEqual(bodies()[0].messages, [{ role: "user", content: "רוצה החזר" }]);
});
test("תיקון אחרי שגיאת סכמה", async () => {
  const { client, bodies } = fakeClaude((b, i) => message(i === 0 ? '{"category":"spam"}' : '{"category":"other"}'));
  const r = await askJson(client, P, Schema);
  assert.deepEqual(r, { ok: true, data: { category: "other" }, attempts: 2 });
  const second = bodies()[1].messages;
  assert.equal(second.length, 3);
  assert.deepEqual(second[1], { role: "assistant", content: '{"category":"spam"}' });
  assert.equal(second[2].role, "user");
  assert.match(second[2].content, /^Your reply was not valid JSON for the schema: category: .+\. Reply with the JSON only\.$/);
});
test("נכשל פעמיים; JSON שבור; maxAttempts", async () => {
  let f = fakeClaude(() => message("הנה: {"));
  assert.deepEqual(await askJson(f.client, P, Schema), { ok: false, attempts: 2, issues: ["invalid JSON"] });
  assert.match(f.bodies()[1].messages[2].content, /invalid JSON/);
  f = fakeClaude(() => message("nope"));
  assert.equal((await askJson(f.client, P, Schema, 3)).attempts, 3);
  assert.equal(f.bodies().length, 3);
  assert.equal(f.bodies()[2].messages.length, 5);
});
