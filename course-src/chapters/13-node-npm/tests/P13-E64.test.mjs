import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P13-E64.mjs", ["envDiff"])).envDiff;

test("missing / empty / extra", async () => {
  const envDiff = await get();
  const example = "PORT=8080\nDATABASE_URL=\nJWT_SECRET=\nREDIS_URL=\n";
  const env = 'PORT=8080\nDATABASE_URL=postgres://localhost/shop\nJWT_SECRET=""\nOLD_FLAG=1\n';
  assert.deepEqual(envDiff(example, env), { missing: ["REDIS_URL"], empty: ["JWT_SECRET"], extra: ["OLD_FLAG"] });
});
test("הערות, רווחים, מירכאות וכפילויות", async () => {
  const envDiff = await get();
  const example = "# שרת\nPORT=\n  HOST = \nPORT=\nA=\nB=\nC=\n";
  const env = "# מקומי\n PORT = 3000 \nHOST=''\nA=   \nB='x'\nZ=1\nY=2\nZ=3\n";
  assert.deepEqual(envDiff(example, env), { missing: ["C"], empty: ["HOST", "A"], extra: ["Z", "Y"] });
});
test("הכול תואם", async () => {
  const envDiff = await get();
  assert.deepEqual(envDiff("A=\nB=1", "B=2\nA=1"), { missing: [], empty: [], extra: [] });
  assert.deepEqual(envDiff("", ""), { missing: [], empty: [], extra: [] });
});
