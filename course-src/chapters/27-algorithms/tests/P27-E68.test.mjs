import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { crawl } = await load(import.meta.url, "P27-E68.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function site(graph, ms = 20) {
  const calls = [];
  let active = 0, max = 0;
  const getLinks = async (u) => {
    calls.push(u);
    active++; max = Math.max(max, active);
    await sleep(ms);
    active--;
    if (u === "/broken") throw new Error("500");
    return graph[u] ?? [];
  };
  return { getLinks, calls, max: () => max };
}

test("BFS ברמות, כל url פעם אחת, עד העומק", async () => {
  const s = site({ "/": ["/a", "/b", "/broken"], "/a": ["/c", "/b", "/"], "/b": ["/c", "/d"], "/c": ["/e"], "/d": [] });
  const r = await crawl("/", s.getLinks, 2);
  assert.deepEqual(r, [
    { url: "/", depth: 0 }, { url: "/a", depth: 1 }, { url: "/b", depth: 1 }, { url: "/broken", depth: 1 },
    { url: "/c", depth: 2 }, { url: "/d", depth: 2 },
  ]);
  assert.deepEqual(s.calls.sort(), ["/", "/a", "/b", "/broken"], "בעומק 2 (= maxDepth) לא קוראים ל־getLinks");
  assert.equal(s.max(), 3, "הרמה כולה במקביל");
});
test("maxDepth 0, ומקביליות חוסכת זמן", async () => {
  const s = site({ "/": ["/x"] });
  assert.deepEqual(await crawl("/", s.getLinks, 0), [{ url: "/", depth: 0 }]);
  assert.equal(s.calls.length, 0);
  const wide = { "/": Array.from({ length: 20 }, (_, i) => `/p${i}`) };
  const w = site(wide, 50);
  const t0 = Date.now();
  const r = await crawl("/", w.getLinks, 2);
  assert.equal(r.length, 21);
  assert.ok(Date.now() - t0 < 400, "20 דפים ברמה — במקביל, לא אחד אחרי השני");
});
