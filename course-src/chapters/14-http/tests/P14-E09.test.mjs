import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { buildQuery } = await load(import.meta.url, "P14-E09.mjs");

test("בסיסי ומערכים", () => assert.equal(buildQuery({ page: 2, tag: ["a", "b"] }), "?page=2&tag=a&tag=b"));
test("ריק", () => { assert.equal(buildQuery({}), ""); assert.equal(buildQuery({ a: undefined, b: null }), ""); });
test("0, false ומחרוזת ריקה נשמרים", () => assert.equal(buildQuery({ a: 0, b: false, c: "" }), "?a=0&b=false&c="));
test("קידוד", () => {
  const q = buildQuery({ q: "מסך & כבל", x: "a=b#c" });
  assert.ok(q.startsWith("?"), "צריך להתחיל ב־?");
  const back = new URLSearchParams(q.slice(1));
  assert.equal(back.get("q"), "מסך & כבל");
  assert.equal(back.get("x"), "a=b#c");
});
