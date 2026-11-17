import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P17-E57.ts";
const get = async () => exportsOf(import.meta.url, FILE, ["innerJoin", "leftJoin"]);
const customers = [{ id: 1, name: "Dana" }, { id: 4, name: "Avi" }, { id: 2, name: "Yossi" }];
const orders = [{ id: 1, c: 1 }, { id: 2, c: 2 }, { id: 3, c: 1 }, { id: 9, c: 77 }];
const on = (c, o) => o.c === c.id;

test("עובר בדיקת טיפוסים, והטיפוס של leftJoin כולל null", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
  const p = typeProbe(import.meta.url, FILE, `import { innerJoin, leftJoin } from "FILE";
const a = [{ id: 1, name: "x" }];
const b = [{ id: 7, cid: 1 }];
const inner = innerJoin(a, b, (x, y) => y.cid === x.id);
const n1: number = inner[0].right.id;
const s1: string = inner[0].left.name;
const left = leftJoin(a, b, (x, y) => y.cid === x.id);
const s2: string = left[0].left.name;
const maybe: { id: number; cid: number } | null = left[0].right;
// @ts-expect-error — right יכול להיות null, אסור לגשת בלי בדיקה
const n2: number = left[0].right.id;
// @ts-expect-error — on מקבל שורה משמאל ושורה מימין, עם הטיפוסים שלהן
leftJoin(a, b, (x, y) => x.nope === y.cid);
`);
  assert.ok(p.ok, p.message);
});
test("innerJoin — כל זוג מתאים, לפי הסדר", async () => {
  const { innerJoin } = await get();
  assert.deepEqual(innerJoin(customers, orders, on).map(({ left, right }) => `${left.name}:${right.id}`), ["Dana:1", "Dana:3", "Yossi:2"]);
  assert.deepEqual(innerJoin([], orders, on), []);
  assert.deepEqual(innerJoin(customers, [], on), []);
});
test("leftJoin — גם בלי התאמה, עם null", async () => {
  const { leftJoin } = await get();
  const out = leftJoin(customers, orders, on);
  assert.deepEqual(out.map(({ left, right }) => `${left.name}:${right === null ? "null" : right.id}`), ["Dana:1", "Dana:3", "Avi:null", "Yossi:2"]);
  assert.equal(out[2].right, null);
  assert.equal(out[0].left, customers[0], "אותו אובייקט, לא עותק");
  assert.deepEqual(leftJoin(customers, [], on).map((x) => x.right), [null, null, null]);
  assert.deepEqual(leftJoin([], orders, on), []);
  const cross = leftJoin([1, 2], ["a", "b"], () => true);
  assert.deepEqual(cross.map(({ left, right }) => `${left}${right}`), ["1a", "1b", "2a", "2b"], "תנאי שתמיד true — כמו CROSS JOIN");
});
