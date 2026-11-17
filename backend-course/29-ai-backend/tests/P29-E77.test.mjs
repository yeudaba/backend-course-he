import { test } from "node:test";
import assert from "node:assert/strict";
import Anthropic from "@anthropic-ai/sdk";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message } from "./_claude.mjs";

const { classifyApiError } = await load(import.meta.url, "P29-E77.ts");
const params = { model: "claude-opus-5-5", max_tokens: 100, messages: [{ role: "user", content: "hi" }] };
const BUSY = "העוזר עמוס כרגע, נסה שוב בעוד דקה";
const OURS = "משהו השתבש אצלנו, כבר בודקים";

async function errorFor(status) {
  const { client } = fakeClaude(() => ({ error: status, message: "org-42 secret internal detail" }));
  try {
    await client.messages.create(params);
  } catch (err) {
    return err;
  }
  throw new Error("expected an error");
}

test("לפי status של שגיאות אמיתיות של ה־SDK", async () => {
  const cases = [
    [429, "rate_limited", true],
    [500, "overloaded", true],
    [529, "overloaded", true],
    [503, "overloaded", true],
    [401, "config", false],
    [403, "config", false],
    [400, "bad_request", false],
    [404, "bad_request", false],
    [413, "bad_request", false],
  ];
  for (const [status, kind, retryLater] of cases) {
    const r = classifyApiError(await errorFor(status));
    assert.deepEqual(r, { kind, status, retryLater, userMessage: retryLater ? BUSY : OURS }, String(status));
    assert.ok(!r.userMessage.includes("org-42"));
  }
});
test("timeout ורשת", async () => {
  const slow = new Anthropic({
    apiKey: "sk-test",
    maxRetries: 0,
    fetch: (url, init) => new Promise((resolve, reject) => {
      const t = setTimeout(() => resolve(Response.json(message("late"))), 2000);
      init.signal?.addEventListener("abort", () => { clearTimeout(t); reject(init.signal.reason ?? new Error("aborted")); });
    }),
  });
  const timeoutErr = await slow.messages.create(params, { timeout: 30 }).catch((e) => e);
  assert.deepEqual(classifyApiError(timeoutErr), { kind: "timeout", status: null, retryLater: true, userMessage: BUSY });
  const down = new Anthropic({ apiKey: "sk-test", maxRetries: 0, fetch: async () => { throw new TypeError("fetch failed"); } });
  const netErr = await down.messages.create(params).catch((e) => e);
  assert.deepEqual(classifyApiError(netErr), { kind: "network", status: null, retryLater: true, userMessage: BUSY });
});
test("כל השאר ← bug", () => {
  for (const e of [new TypeError("x is undefined"), new Error("rate limit"), "oops", null, { status: 429 }]) {
    assert.deepEqual(classifyApiError(e), { kind: "bug", status: null, retryLater: false, userMessage: OURS }, String(e));
  }
});
