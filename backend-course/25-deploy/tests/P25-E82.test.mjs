import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25-E82.ts", ["redirectChain"])).redirectChain;
// "אינטרנט" מדומה: כתובת ← [status, location?]
function web(map) {
  const calls = [];
  const fetchFn = async (url, init) => {
    calls.push({ url, redirect: init?.redirect });
    const [status, location] = map[url] ?? [404];
    return new Response(status === 204 || (status >= 300 && status < 400) ? null : "body", { status, headers: location ? { location } : {} });
  };
  return { fetchFn, calls };
}

test("http ← https ← דומיין ראשי", async () => {
  const f = await get();
  const { fetchFn, calls } = web({
    "http://www.example.com/": [301, "https://www.example.com/"],
    "https://www.example.com/": [308, "https://example.com/"],
    "https://example.com/": [200],
  });
  assert.deepEqual(await f(fetchFn, "http://www.example.com"), [
    { url: "http://www.example.com/", status: 301 },
    { url: "https://www.example.com/", status: 308 },
    { url: "https://example.com/", status: 200 },
  ]);
  assert.ok(calls.every((c) => c.redirect === "manual"), 'redirect: "manual" בכל בקשה');
});
test("Location יחסי, והפניה בלי Location", async () => {
  const f = await get();
  const { fetchFn } = web({ "https://a.com/x/y": [302, "../login?next=1"], "https://a.com/login?next=1": [303] });
  assert.deepEqual(await f(fetchFn, "https://a.com/x/y"), [
    { url: "https://a.com/x/y", status: 302 },
    { url: "https://a.com/login?next=1", status: 303 },
  ]);
});
test("לולאה, ויותר מדי", async () => {
  const f = await get();
  const loop = web({ "https://a.com/": [301, "https://b.com/"], "https://b.com/": [301, "https://a.com/"] });
  await assert.rejects(f(loop.fetchFn, "https://a.com/"), { message: "REDIRECT_LOOP" });
  const chain = {};
  for (let i = 0; i < 10; i++) chain[`https://a.com/${i}`] = [302, `/${i + 1}`];
  chain["https://a.com/10"] = [200];
  await assert.rejects(f(web(chain).fetchFn, "https://a.com/0"), { message: "TOO_MANY_REDIRECTS" });
  const r = await f(web(chain).fetchFn, "https://a.com/5");
  assert.equal(r.length, 6, "5 הפניות — מותר");
  assert.equal(r.at(-1).status, 200);
  await assert.rejects(f(web(chain).fetchFn, "https://a.com/5", 4), { message: "TOO_MANY_REDIRECTS" });
});
