import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { mergeValues } = await load(import.meta.url, "P26.3-E73.ts");

test("הדוגמה מ־E68", () => {
  const base = { replicas: 1, image: { repository: "ghcr.io/x/coffee", tag: "" }, env: [{ name: "LOG_LEVEL", value: "info" }, { name: "PORT", value: "3000" }], resources: { requests: { cpu: "100m", memory: "128Mi" } }, nodeSelector: { disk: "ssd" } };
  const prod = { replicas: 3, image: { tag: "1.5.0" }, env: [{ name: "LOG_LEVEL", value: "warn" }], resources: { requests: { cpu: "250m" } }, nodeSelector: null };
  assert.deepEqual(mergeValues(base, prod), {
    replicas: 3,
    image: { repository: "ghcr.io/x/coffee", tag: "1.5.0" },
    env: [{ name: "LOG_LEVEL", value: "warn" }],
    resources: { requests: { cpu: "250m", memory: "128Mi" } },
  });
});
test("שלוש שכבות, ואובייקט שמחליף ערך פשוט ולהפך", () => {
  assert.deepEqual(mergeValues({ a: 1, b: { c: 1 } }, { a: { x: 1 }, b: 2 }, { a: { y: 2 } }), { a: { x: 1, y: 2 }, b: 2 });
  assert.deepEqual(mergeValues(), {});
  assert.deepEqual(mergeValues({ a: { b: { c: 1, d: 2 } } }, { a: { b: { d: null, e: 3 } } }), { a: { b: { c: 1, e: 3 } } });
});
test("לא משנה את השכבות, ואין הפניות משותפות", () => {
  const base = { image: { tag: "1" }, list: [1, 2] };
  const over = { image: { repo: "r" }, extra: { deep: [1] } };
  const out = mergeValues(base, over);
  assert.deepEqual(base, { image: { tag: "1" }, list: [1, 2] });
  assert.deepEqual(over, { image: { repo: "r" }, extra: { deep: [1] } });
  out.image.tag = "X"; out.list.push(3); out.extra.deep.push(9);
  assert.deepEqual(base, { image: { tag: "1" }, list: [1, 2] }, "שינוי בתוצאה לא נוגע בבסיס");
  assert.deepEqual(over.extra.deep, [1], "ולא בשכבה העליונה");
});
