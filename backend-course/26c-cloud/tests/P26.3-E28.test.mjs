import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P26.3-E28.ts";
const get = () => exportsOf(import.meta.url, FILE, ["parsePods", "podSummary"]);
const OUTPUT = `NAME                         READY   STATUS             RESTARTS        AGE
coffee-api-7d9f8b6c4-2xkqp   1/1     Running            0               3d4h
coffee-api-7d9f8b6c4-9wzlm   1/1     Running            1 (2d ago)      3d4h
coffee-api-7d9f8b6c4-tq7rn   0/1     CrashLoopBackOff   14 (63s ago)    48m
worker-6c5d7f9b8-hk2vd       1/2     Running            3 (10m ago)     2h
postgres-0                   1/1     Running            0               12d
migrate-q8x2n                0/1     Completed          0               3d4h
`;

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("parsePods — שורה לכל pod, מספרים כמספרים", async () => {
  const { parsePods } = await get();
  const pods = parsePods(OUTPUT);
  assert.equal(pods.length, 6, "השורה הריקה בסוף לא נחשבת pod");
  assert.deepEqual(pods[0], { name: "coffee-api-7d9f8b6c4-2xkqp", ready: 1, total: 1, status: "Running", restarts: 0, age: "3d4h" });
  assert.deepEqual(pods[2], { name: "coffee-api-7d9f8b6c4-tq7rn", ready: 0, total: 1, status: "CrashLoopBackOff", restarts: 14, age: "48m" }, "‏\"14 (63s ago)\" ← 14; העמודות מופרדות בשני רווחים או יותר");
  assert.equal(pods[3].total, 2);
});
test("parsePods — לפי הכותרת (kubectl get pods -o wide מוסיף עמודות)", async () => {
  const { parsePods } = await get();
  const wide = `NAME         READY   STATUS    RESTARTS   AGE   IP           NODE
api-1        2/2     Running   5          1h    10.1.0.7     node-a
`;
  assert.deepEqual(parsePods(wide), [{ name: "api-1", ready: 2, total: 2, status: "Running", restarts: 5, age: "1h" }]);
  const reordered = `STATUS    NAME    AGE   RESTARTS   READY
Pending   job-x   5s    0          0/1`;
  assert.deepEqual(parsePods(reordered), [{ name: "job-x", ready: 0, total: 1, status: "Pending", restarts: 0, age: "5s" }]);
  assert.deepEqual(parsePods("NAME   READY   STATUS   RESTARTS   AGE\n"), [], "בלי pods");
});
test("podSummary — לפי סטטוס, לא מוכנים, ומי שקורס", async () => {
  const { parsePods, podSummary } = await get();
  assert.deepEqual(podSummary(parsePods(OUTPUT)), {
    byStatus: { Running: 4, CrashLoopBackOff: 1, Completed: 1 },
    notReady: ["coffee-api-7d9f8b6c4-tq7rn", "worker-6c5d7f9b8-hk2vd"],
    restarting: ["coffee-api-7d9f8b6c4-tq7rn (14)", "worker-6c5d7f9b8-hk2vd (3)"],
  }, "Completed (Job שהסתיים) לא נחשב 'לא מוכן'; restarting — 3 ומעלה, מהגבוה");
  const tie = [
    { name: "b", ready: 1, total: 1, status: "Running", restarts: 4, age: "1h" },
    { name: "a", ready: 1, total: 1, status: "Running", restarts: 4, age: "1h" },
    { name: "c", ready: 1, total: 1, status: "Running", restarts: 2, age: "1h" },
  ];
  assert.deepEqual(podSummary(tie).restarting, ["a (4)", "b (4)"], "בתיקו — לפי שם");
  assert.deepEqual(podSummary([]), { byStatus: {}, notReady: [], restarting: [] });
});
