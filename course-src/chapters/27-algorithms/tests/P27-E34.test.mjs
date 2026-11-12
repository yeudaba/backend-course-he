import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough } from "./_perf.mjs";

const { attachUsers } = await load(import.meta.url, "P27-E34.ts");

test("מחבר, null כשאין, בלי לשנות", () => {
  const users = [{ id: 1, name: "dana" }, { id: 2, name: "yossi" }];
  const orders = [{ id: 10, userId: 2 }, { id: 11, userId: 9 }, { id: 12, userId: 1 }];
  const before = structuredClone(orders);
  assert.deepEqual(attachUsers(users, orders), [
    { id: 10, userId: 2, user: { id: 2, name: "yossi" } },
    { id: 11, userId: 9, user: null },
    { id: 12, userId: 1, user: { id: 1, name: "dana" } },
  ]);
  assert.deepEqual(orders, before);
});
test("100,000 ו־200,000 — מהר", () => {
  const users = Array.from({ length: 100_000 }, (_, i) => ({ id: i }));
  const orders = Array.from({ length: 200_000 }, (_, i) => ({ id: i, userId: (i * 7) % 120_000 }));
  const r = fastEnough(() => attachUsers(users, orders), 300, "attachUsers");
  assert.equal(r.filter((o) => o.user === null).length, orders.filter((o) => o.userId >= 100_000).length);
});
