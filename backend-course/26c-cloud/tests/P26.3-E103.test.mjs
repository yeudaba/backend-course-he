import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { mergeValues } = await load(import.meta.url, "P26.3-E103.ts");
const base = () => ({
  replicas: 1,
  image: { repository: "ghcr.io/noa/coffee", tag: "" },
  env: [{ name: "LOG_LEVEL", value: "debug" }, { name: "MODE", value: "dev" }],
  resources: { limits: { memory: "256Mi" } },
  ingress: { enabled: false, hosts: ["dev.local"] },
});

test("מיזוג לעומק, מערכים מוחלפים, null מוחק", () => {
  const prod = { replicas: 3, image: { tag: "1.5.0" }, env: [{ name: "LOG_LEVEL", value: "info" }], resources: null, ingress: { enabled: true } };
  assert.deepEqual(mergeValues(base(), prod), {
    replicas: 3,
    image: { repository: "ghcr.io/noa/coffee", tag: "1.5.0" },
    env: [{ name: "LOG_LEVEL", value: "info" }],
    ingress: { enabled: true, hosts: ["dev.local"] },
  });
});
test("base ו־override לא משתנים, ואין שיתוף הפניות", () => {
  const b = base();
  const o = { replicas: 3, ingress: { hosts: ["shop.co.il"] }, resources: null };
  const before = JSON.stringify([b, o]);
  const r = mergeValues(b, o);
  assert.equal(JSON.stringify([b, o]), before, "המיזוג שינה את ה־base או את ה־override");
  r.ingress.hosts.push("x");
  r.image.tag = "changed";
  assert.deepEqual(o.ingress.hosts, ["shop.co.il"], "התוצאה חולקת מערך עם ה־override");
  assert.equal(b.image.tag, "", "התוצאה חולקת אובייקט עם ה־base");
  assert.equal(mergeValues(b, { replicas: 2 }).replicas, 2);
  assert.equal(mergeValues(b, {}).replicas, 1, "מיזוג שני מאותו base — base לא השתנה");
});
test("מערך מחליף אובייקט ולהפך", () => {
  assert.deepEqual(mergeValues({ a: { x: 1 } }, { a: [1, 2] }), { a: [1, 2] });
  assert.deepEqual(mergeValues({ a: [1, 2] }, { a: { x: 1 } }), { a: { x: 1 } });
  assert.deepEqual(mergeValues({ a: 1 }, { b: null }), { a: 1 });
});
