import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { withTimeout } = await load(import.meta.url, "P10-E15.js");
const sleep = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const failAfter = (ms, m) => new Promise((_, rej) => setTimeout(() => rej(new Error(m)), ms));

test("מהיר — עובר", async () => assert.equal(await withTimeout(sleep(5, "ok"), 100), "ok"));
test("איטי — timeout", async () => assert.rejects(withTimeout(sleep(200, "late"), 20), { message: "timeout after 20ms", code: "TIMEOUT" }));
test("שגיאה מקורית עוברת", async () => assert.rejects(withTimeout(failAfter(5, "boom"), 100), { message: "boom" }));
test("הטיימר מנוקה (לא משאיר את התוכנית ערה)", async () => {
  const before = process.getActiveResourcesInfo().filter((r) => r === "Timeout").length;
  await withTimeout(sleep(1, 1), 5000);
  await sleep(5);
  const after = process.getActiveResourcesInfo().filter((r) => r === "Timeout").length;
  assert.ok(after <= before, "נשאר טיימר פתוח של 5 שניות");
});
