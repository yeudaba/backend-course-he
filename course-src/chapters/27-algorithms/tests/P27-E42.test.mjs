import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen } from "../../tools/load.mjs";

const { usernamesApp } = await load(import.meta.url, "P27-E42.ts");

async function start(t, names) {
  const { base, close } = await listen(usernamesApp(names));
  t.after(close);
  return base;
}
const avail = async (base, name) => (await fetch(`${base}/available?name=${encodeURIComponent(name)}`)).json();

test("נרמול, הוספה ו־409", async (t) => {
  const base = await start(t, ["Dana", "yossi "]);
  assert.deepEqual(await avail(base, " DANA"), { available: false });
  assert.deepEqual(await avail(base, "noa"), { available: true });
  assert.equal((await fetch(`${base}/available`)).status, 400);
  assert.equal((await fetch(`${base}/available?name=%20`)).status, 400);
  const post = (name) => fetch(`${base}/usernames`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
  assert.equal((await post("Noa")).status, 201);
  assert.deepEqual(await avail(base, "noa"), { available: false });
  assert.equal((await post(" noa ")).status, 409);
  assert.equal((await post("")).status, 400);
});
test("100,000 שמות, 2,000 בקשות — מהר", async (t) => {
  const names = Array.from({ length: 100_000 }, (_, i) => `user${i}`);
  const base = await start(t, names);
  const t0 = performance.now();
  for (let i = 0; i < 2000; i += 50) {
    const r = await Promise.all(Array.from({ length: 50 }, (_, k) => avail(base, `user${(i + k) * 77}`)));
    for (const [k, x] of r.entries()) assert.equal(x.available, (i + k) * 77 >= 100_000);
  }
  const took = performance.now() - t0;
  assert.ok(took < 4000, `2,000 בקשות לקחו ${Math.round(took)}ms — Set נבנה פעם אחת?`);
});
