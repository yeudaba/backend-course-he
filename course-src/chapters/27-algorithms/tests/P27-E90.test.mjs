import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { load, listen } from "../../tools/load.mjs";

const { catalogApp } = await load(import.meta.url, "P27-E90.ts");

test("ETag, 304, ושינוי ← 200 חדש", async (t) => {
  let products = [{ id: 1, name: "V60" }];
  const { base, close } = await listen(catalogApp(() => products));
  t.after(close);
  const a = await fetch(base + "/products");
  assert.equal(a.status, 200);
  const etag = a.headers.get("etag");
  assert.equal(etag, `"${createHash("sha1").update(JSON.stringify(products)).digest("hex")}"`);
  assert.equal(a.headers.get("cache-control"), "no-cache");
  assert.deepEqual(await a.json(), products);
  const b = await fetch(base + "/products", { headers: { "If-None-Match": etag } });
  assert.equal(b.status, 304);
  assert.equal(await b.text(), "");
  products = [...products, { id: 2, name: "Chemex" }];
  const c = await fetch(base + "/products", { headers: { "If-None-Match": etag } });
  assert.equal(c.status, 200, "התוכן השתנה ← ETag חדש");
  assert.notEqual(c.headers.get("etag"), etag);
  assert.equal((await c.json()).length, 2);
  const d = await fetch(base + "/products", { headers: { "If-None-Match": '"nope"' } });
  assert.equal(d.status, 200);
});
