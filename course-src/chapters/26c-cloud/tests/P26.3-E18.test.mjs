import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { schedule } = await load(import.meta.url, "P26.3-E18.ts");
const nodes = [
  { name: "node-a", cpu: "2", memory: "4Gi" },
  { name: "node-b", cpu: "2", memory: "4Gi" },
];

test("הגדולים קודם, ל־node הראשון שיש בו מקום", () => {
  const pods = [
    { name: "web-1", cpu: "250m", memory: "256Mi" },
    { name: "api-1", cpu: "1", memory: "1Gi" },
    { name: "api-2", cpu: "1", memory: "1Gi" },
    { name: "worker", cpu: "1500m", memory: "2Gi" },
  ];
  const r = schedule(nodes, pods);
  assert.deepEqual(r.placements, { worker: "node-a", "api-1": "node-b", "api-2": "node-b", "web-1": "node-a" });
  assert.deepEqual(r.pending, []);
  assert.deepEqual(r.free["node-a"], { cpu: 250, memory: 4 * 2 ** 30 - 2 * 2 ** 30 - 256 * 2 ** 20 });
  assert.deepEqual(r.free["node-b"], { cpu: 0, memory: 2 * 2 ** 30 });
});
test("CPU יש, memory אין ← לא שם", () => {
  const r = schedule([{ name: "n", cpu: "4", memory: "1Gi" }], [
    { name: "big-mem", cpu: "100m", memory: "2Gi" },
    { name: "small", cpu: "100m", memory: "512Mi" },
  ]);
  assert.deepEqual(r.placements, { small: "n" });
  assert.deepEqual(r.pending, ["big-mem"], "Pending — כמו ב־kubectl get pods, עם 'Insufficient memory'");
});
test("אין מקום לכולם ← השאר Pending, והמשאבים לא יורדים מתחת ל־0", () => {
  const pods = Array.from({ length: 5 }, (_, i) => ({ name: `api-${i + 1}`, cpu: "1", memory: "1Gi" }));
  const r = schedule(nodes, pods);
  assert.equal(Object.keys(r.placements).length, 4);
  assert.deepEqual(r.pending, ["api-5"]);
  for (const f of Object.values(r.free)) assert.ok(f.cpu >= 0 && f.memory >= 0);
});
test("ה־requests נספרים, לא השמות: 500m + 500m + 1 = 2 ליבות בדיוק", () => {
  const r = schedule([{ name: "n", cpu: "2", memory: "8Gi" }], [
    { name: "a", cpu: "500m", memory: "1Gi" },
    { name: "b", cpu: "0.5", memory: "1Gi" },
    { name: "c", cpu: "1000m", memory: "1Gi" },
  ]);
  assert.deepEqual(r.pending, []);
  assert.equal(r.free.n.cpu, 0);
});
