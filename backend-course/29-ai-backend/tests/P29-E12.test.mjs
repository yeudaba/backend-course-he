import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message, toolUse, thinking, userText } from "./_claude.mjs";

const { createWithFallback } = await load(import.meta.url, "P29-E12.ts");
const params = { model: "claude-opus-5-5", max_tokens: 1024, messages: [{ role: "user", content: "hi" }] };

test("מצליח — בלי fallback", async () => {
  const { client, bodies } = fakeClaude(() => message("ok"));
  const r = await createWithFallback(client, params, "claude-sonnet-5-5");
  assert.equal(r.usedFallback, false);
  assert.equal(bodies().length, 1);
});
test("500 / 529 ← אותה בקשה, במודל החלופי", async () => {
  for (const status of [500, 529]) {
    const { client, bodies } = fakeClaude((b) => (b.model === "claude-opus-5-5" ? { error: status } : message("from fallback", { model: b.model })));
    const r = await createWithFallback(client, params, "claude-sonnet-5-5");
    assert.equal(r.usedFallback, true);
    assert.equal(r.message.content[0].text, "from fallback");
    assert.deepEqual(bodies().map((b) => b.model), ["claude-opus-5-5", "claude-sonnet-5-5"]);
    assert.deepEqual(bodies()[1].messages, params.messages);
  }
});
test("400 / 401 / 429 — זורקים, בלי fallback", async () => {
  for (const status of [400, 401, 429]) {
    const { client, bodies } = fakeClaude(() => ({ error: status }));
    await assert.rejects(createWithFallback(client, params, "claude-sonnet-5-5"), (e) => e.status === status);
    assert.equal(bodies().length, 1, `status ${status}`);
  }
});
test("גם ה־fallback נכשל ← השגיאה שלו", async () => {
  const { client } = fakeClaude(() => ({ error: 529 }));
  await assert.rejects(createWithFallback(client, params, "claude-sonnet-5-5"), (e) => e.status === 529);
});
