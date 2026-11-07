import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { statusCategory, shouldRetry } = await load(import.meta.url, "P14-E07.mjs");

test("statusCategory", () => {
  const cases = { 200: "success", 299: "success", 301: "redirect", 400: "client-error", 499: "client-error", 500: "server-error", 599: "server-error", 99: "unknown", 600: "unknown" };
  for (const [code, expected] of Object.entries(cases)) assert.equal(statusCategory(Number(code)), expected, `status ${code}`);
  assert.equal(statusCategory(200.5), "unknown");
});
test("shouldRetry", () => {
  for (const c of [408, 429, 500, 502, 503, 504]) assert.equal(shouldRetry(c), true, `status ${c}`);
  for (const c of [200, 400, 401, 404, 501]) assert.equal(shouldRetry(c), false, `status ${c}`);
});
