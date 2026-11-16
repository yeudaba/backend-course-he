import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message, thinking } from "./_claude.mjs";

const { summarize } = await load(import.meta.url, "P29-E32.ts");

test("הצלחה בניסיון הראשון", async () => {
  const { client, bodies } = fakeClaude(() => message([thinking(), "  סיכום קצר. "]));
  assert.deepEqual(await summarize(client, "טקסט ארוך"), { ok: true, text: "סיכום קצר.", attempts: 1 });
  const b = bodies()[0];
  assert.equal(b.model, "claude-opus-5-5");
  assert.equal(b.max_tokens, 1024);
  assert.ok(typeof b.system === "string" && b.system.length > 0);
  assert.deepEqual(b.messages, [{ role: "user", content: "טקסט ארוך" }]);
});
test("נחתך ← ניסיון אחד עם פי 2", async () => {
  const { client, bodies } = fakeClaude((b, i) => (i === 0 ? message("חצי", { stop_reason: "max_tokens" }) : message("מלא")));
  assert.deepEqual(await summarize(client, "x", { maxTokens: 500 }), { ok: true, text: "מלא", attempts: 2 });
  assert.deepEqual(bodies().map((b) => b.max_tokens), [500, 1000]);
});
test("נחתך פעמיים ← too_long; סירוב ← בלי ניסיון נוסף", async () => {
  let f = fakeClaude(() => message("חצי", { stop_reason: "max_tokens" }));
  assert.deepEqual(await summarize(f.client, "x"), { ok: false, reason: "too_long" });
  assert.equal(f.bodies().length, 2);
  f = fakeClaude(() => message("", { stop_reason: "refusal" }));
  assert.deepEqual(await summarize(f.client, "x"), { ok: false, reason: "refusal" });
  assert.equal(f.bodies().length, 1);
});
