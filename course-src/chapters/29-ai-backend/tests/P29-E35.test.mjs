import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { aiConfig } = await load(import.meta.url, "P29-E35.ts");
const KEY = "sk-ant-api03-abcDEF_123-xyz";

test("ברירות מחדל וערכים", () => {
  assert.deepEqual(aiConfig({ ANTHROPIC_API_KEY: KEY }), { apiKey: KEY, model: "claude-opus-5-5", maxRetries: 2, timeoutMs: 30000 });
  assert.deepEqual(aiConfig({ ANTHROPIC_API_KEY: KEY, AI_MODEL: "claude-haiku-5-5", AI_MAX_RETRIES: "0", AI_TIMEOUT_MS: "5000" }), { apiKey: KEY, model: "claude-haiku-5-5", maxRetries: 0, timeoutMs: 5000 });
  assert.equal(aiConfig({ ANTHROPIC_API_KEY: KEY, AI_MAX_RETRIES: "" }).maxRetries, 2);
});
test("מפתח חסר או שגוי — בלי לחשוף אותו", () => {
  assert.throws(() => aiConfig({}), /ANTHROPIC_API_KEY/);
  const wrong = "ghp_SECRETGITHUBTOKEN123";
  try {
    aiConfig({ ANTHROPIC_API_KEY: wrong });
    assert.fail("היה צריך לזרוק");
  } catch (e) {
    assert.ok(!String(e.message).includes("SECRETGITHUB"), "ההודעה כוללת את הערך שהתקבל");
  }
});
test("הגבולות עצמם תקינים", () => {
  assert.equal(aiConfig({ ANTHROPIC_API_KEY: KEY, AI_MAX_RETRIES: "5" }).maxRetries, 5);
  assert.equal(aiConfig({ ANTHROPIC_API_KEY: KEY, AI_MAX_RETRIES: "0" }).maxRetries, 0);
  assert.equal(aiConfig({ ANTHROPIC_API_KEY: KEY, AI_TIMEOUT_MS: "600000" }).timeoutMs, 600000);
  assert.equal(aiConfig({ ANTHROPIC_API_KEY: KEY, AI_TIMEOUT_MS: "1000" }).timeoutMs, 1000);
});
test("ערכים לא תקינים", () => {
  for (const [k, v] of [["AI_MODEL", "gpt-x"], ["AI_MAX_RETRIES", "6"], ["AI_MAX_RETRIES", "2.5"], ["AI_MAX_RETRIES", "abc"], ["AI_TIMEOUT_MS", "999"], ["AI_TIMEOUT_MS", "700000"]]) {
    assert.throws(() => aiConfig({ ANTHROPIC_API_KEY: KEY, [k]: v }), new RegExp(k), `${k}=${v}`);
  }
});
