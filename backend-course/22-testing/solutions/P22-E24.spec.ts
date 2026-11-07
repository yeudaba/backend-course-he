// P22-E24 — הבדיקות
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { InventoryService, OutOfStockError, type Notifier } from "./P22-E24.ts";

function setup(threshold = 3) {
  let now = new Date("2026-11-04T10:00:00Z");
  const clock = { now: () => now, advance: (minutes: number) => (now = new Date(now.getTime() + minutes * 60_000)) };
  const notifier = { lowStock: mock.fn<Notifier["lowStock"]>() };
  const inventory = new InventoryService(clock, notifier, threshold);
  return { inventory, clock, notifier };
}

test("restock מוסיף", () => {
  const { inventory } = setup();
  inventory.restock("mug", 5);
  inventory.restock("mug", 3);
  assert.equal(inventory.available("mug"), 8);
  assert.equal(inventory.available("unknown"), 0);
});

test("כמויות לא תקינות", () => {
  const { inventory } = setup();
  inventory.restock("mug", 5);
  for (const qty of [0, -1, 1.5]) {
    assert.throws(() => inventory.restock("mug", qty), RangeError);
    assert.throws(() => inventory.reserve("mug", qty), RangeError);
  }
});

test("שמירה מורידה מהפנוי; release מחזיר", () => {
  const { inventory } = setup();
  inventory.restock("mug", 10);
  const id = inventory.reserve("mug", 4);
  assert.equal(inventory.available("mug"), 6);
  inventory.release(id);
  assert.equal(inventory.available("mug"), 10);
});

test("אי אפשר לשמור יותר מהפנוי — אבל בדיוק הפנוי כן", () => {
  const { inventory } = setup();
  inventory.restock("mug", 5);
  inventory.reserve("mug", 3);
  assert.throws(() => inventory.reserve("mug", 3), OutOfStockError);
  inventory.reserve("mug", 2);
  assert.equal(inventory.available("mug"), 0);
});

test("שמירה פגה אחרי 15 דקות", () => {
  const { inventory, clock } = setup();
  inventory.restock("mug", 5);
  const id = inventory.reserve("mug", 5);
  clock.advance(14);
  assert.equal(inventory.available("mug"), 0);
  clock.advance(1);
  assert.equal(inventory.available("mug"), 5);
  assert.throws(() => inventory.commit(id), /פג תוקפה/);
});

test("commit מוריד מהמלאי באמת", () => {
  const { inventory, clock } = setup();
  inventory.restock("mug", 5);
  const id = inventory.reserve("mug", 2);
  inventory.commit(id);
  clock.advance(60);
  assert.equal(inventory.available("mug"), 3, "גם אחרי שהשמירה הייתה פגה");
  assert.throws(() => inventory.commit(id), "commit פעמיים");
});

test("התראת מלאי נמוך — כשנשאר בדיוק הסף, עם מה שנשאר", () => {
  const { inventory, notifier } = setup(3);
  inventory.restock("mug", 10);
  inventory.reserve("mug", 6); // נשארו 4
  assert.equal(notifier.lowStock.mock.callCount(), 0);
  inventory.reserve("mug", 1); // נשארו 3
  assert.deepEqual(notifier.lowStock.mock.calls.map((c) => c.arguments), [["mug", 3]]);
});
