import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message } from "./_claude.mjs";

const { createWithPolicy, RefusalError, TruncatedError } = await load(import.meta.url, "P29.5-E17.ts");
const params = { model: "claude-opus-5-5", max_tokens: 1000, messages: [{ role: "user", content: "hi" }] };

test("מוסיף fallbacks: default ואת ה־beta header — ומשאיר את השאר", async () => {
  const { client, requests } = fakeClaude(() => message("שלום"));
  const r = await createWithPolicy(client, { ...params, system: "s" });
  assert.equal(r.content[0].text, "שלום");
  const { body, headers } = requests[0];
  assert.equal(body.fallbacks, "default");
  assert.match(headers["anthropic-beta"] ?? "", /server-side-fallback-2026-07-01/);
  assert.equal(body.system, "s");
  assert.equal(body.model, "claude-opus-5-5");
  assert.equal(body.betas, undefined, "betas הולך ל־header, לא לגוף");
});
test("refusal ← RefusalError עם הקטגוריה", async () => {
  const { client } = fakeClaude(() => ({ ...message([], { stop_reason: "refusal" }), stop_details: { type: "refusal", category: "cyber", explanation: "x" } }));
  await assert.rejects(createWithPolicy(client, params), (err) => err instanceof RefusalError && err.category === "cyber");
});
test("max_tokens ← TruncatedError", async () => {
  const { client } = fakeClaude(() => message("חצי", { stop_reason: "max_tokens" }));
  await assert.rejects(createWithPolicy(client, params), (err) => err instanceof TruncatedError);
});
test("betas קיימים נשמרים", async () => {
  const { client, requests } = fakeClaude(() => message("ok"));
  await createWithPolicy(client, { ...params, betas: ["context-management-2025-06-27"] });
  const h = requests[0].headers["anthropic-beta"];
  assert.match(h, /context-management-2025-06-27/);
  assert.match(h, /server-side-fallback-2026-07-01/);
});
