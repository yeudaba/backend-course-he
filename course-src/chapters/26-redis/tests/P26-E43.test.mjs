import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { viewsApp } = await load(import.meta.url, "P26-E43.ts");

async function start(t) {
  const sb = await redisSandbox(t);
  const { base, close } = await listen(viewsApp(sb.redis));
  t.after(close);
  return { ...sb, base };
}
const post = (base, p) => fetch(base + p, { method: "POST" });

test("צפיות ודירוג", async (t) => {
  const { base, raw, prefix } = await start(t);
  for (const id of [3, 3, 3, 8, 8, 5]) await post(base, `/products/${id}/view`);
  const r = await post(base, "/products/5/view");
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { productId: 5, views: 2 });
  const two = await (await fetch(base + "/products/top?n=2")).json();
  assert.equal(two.length, 2);
  assert.deepEqual(two[0], { productId: 3, views: 3 });
  assert.equal(two[1].views, 2);
  const all = await (await fetch(base + "/products/top")).json();
  assert.equal(all.length, 3, "ברירת מחדל 5 — יש רק 3");
  assert.deepEqual(all[0], { productId: 3, views: 3 });
  assert.deepEqual(all.slice(1).map((x) => x.views), [2, 2]);
  assert.equal(await raw.hget(`${prefix}views`, "3"), "3", "hash בשם views");
  assert.equal(await raw.zscore(`${prefix}top`, "8"), "2", "sorted set בשם top");
});
test("קלט לא תקין ← 400, ושום דבר לא נכתב", async (t) => {
  const { base, raw, prefix } = await start(t);
  for (const id of ["0", "-1", "abc", "1.5"]) {
    const r = await post(base, `/products/${id}/view`);
    assert.equal(r.status, 400, `id=${id}`);
    assert.ok((await r.json()).error, "גוף { error }");
  }
  for (const n of ["0", "51", "abc", "2.5"]) assert.equal((await fetch(base + `/products/top?n=${n}`)).status, 400, `n=${n}`);
  assert.equal(await raw.exists(`${prefix}views`, `${prefix}top`), 0);
});
