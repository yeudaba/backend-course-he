import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { BlueGreen } = await load(import.meta.url, "P25-E25.ts");
function platform({ broken = [] } = {}) {
  const running = {};
  const log = [];
  return {
    log,
    running,
    start: async (c, v) => { log.push(`start ${c} ${v}`); running[c] = v; },
    healthy: async (c) => running[c] !== undefined && !broken.includes(running[c]),
    stop: async (c) => { log.push(`stop ${c}`); delete running[c]; },
  };
}

test("deploy ראשון ושני — מתחלפים", async () => {
  const p = platform();
  const bg = new BlueGreen(p);
  assert.equal(bg.live, null);
  assert.equal(await bg.deploy("v1"), true);
  assert.deepEqual(bg.live, { color: "blue", version: "v1" });
  assert.equal(await bg.deploy("v2"), true);
  assert.deepEqual(bg.live, { color: "green", version: "v2" });
  assert.deepEqual(p.running, { blue: "v1", green: "v2" }, "הישנה עוד רצה — rollback מיידי אפשרי");
  assert.deepEqual(bg.history, ["v1", "v2"]);
});
test("גרסה לא תקינה — התנועה לא זזה", async () => {
  const p = platform({ broken: ["v2"] });
  const bg = new BlueGreen(p);
  await bg.deploy("v1");
  assert.equal(await bg.deploy("v2", { attempts: 3 }), false);
  assert.deepEqual(bg.live, { color: "blue", version: "v1" });
  assert.deepEqual(p.log, ["start blue v1", "start green v2", "stop green"]);
  assert.deepEqual(bg.history, ["v1"]);
});
test("rollback", async () => {
  const bg = new BlueGreen(platform());
  assert.equal(await bg.rollback(), false, "אין לאן");
  await bg.deploy("v1");
  assert.equal(await bg.rollback(), false, "רק גרסה אחת");
  await bg.deploy("v2");
  assert.equal(await bg.rollback(), true);
  assert.deepEqual(bg.live, { color: "blue", version: "v1" });
  assert.deepEqual(bg.history, ["v1", "v2", "v1"]);
  assert.equal(await bg.rollback(), true, "ושוב קדימה");
  assert.deepEqual(bg.live, { color: "green", version: "v2" });
});
test("retireIdle — אחרי זה אין rollback", async () => {
  const p = platform();
  const bg = new BlueGreen(p);
  await bg.deploy("v1");
  await bg.deploy("v2");
  await bg.retireIdle();
  assert.deepEqual(p.running, { green: "v2" });
  assert.equal(await bg.rollback(), false);
  assert.equal(await bg.deploy("v3"), true);
  assert.deepEqual(bg.live, { color: "blue", version: "v3" }, "הסביבה הפנויה — שוב בשימוש");
});
