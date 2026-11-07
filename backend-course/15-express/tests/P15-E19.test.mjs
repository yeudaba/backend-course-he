import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";

const { createApp } = await load(import.meta.url, "P15-E19.ts");
async function start(t, app) {
  const { base, close } = await listen(app);
  t.after(close);
  return api(base);
}

async function getForecast(city) {
  if (city === "חיפה") return { tempC: 24, summary: "שמשי" };
  if (city === "אטלנטיס") return null;
  if (city === "איטית") return new Promise((r) => setTimeout(() => r({ tempC: 1, summary: "x" }), 1500));
  throw new Error("ECONNRESET");
}

test("מזג אוויר", async (t) => {
  const call = await start(t, createApp({ getForecast }));
  let res = await call("GET", "/weather/" + encodeURIComponent("חיפה"));
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { city: "חיפה", tempC: 24, summary: "שמשי" });
  res = await call("GET", "/weather/" + encodeURIComponent("אטלנטיס"));
  assert.equal(res.status, 404);
  assert.equal(res.body.error.code, "CITY_NOT_FOUND");

  const orig = console.error;
  console.error = () => {};
  try {
    res = await call("GET", "/weather/x");
  } finally {
    console.error = orig;
  }
  assert.equal(res.status, 502);
  assert.deepEqual(res.body, { error: { code: "UPSTREAM_ERROR", message: "שירות מזג האוויר לא זמין" } });

  const started = Date.now();
  res = await call("GET", "/weather/" + encodeURIComponent("איטית"));
  assert.equal(res.status, 504);
  assert.equal(res.body.error.code, "UPSTREAM_TIMEOUT");
  assert.ok(Date.now() - started < 1400, "צריך לענות אחרי כ־1000ms, לא לחכות לשירות");
});
