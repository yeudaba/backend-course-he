import { test } from "node:test";
import assert from "node:assert/strict";
import { readStarter, parseCss, declsFor } from "./_html.mjs";

const rules = () => parseCss(readStarter(import.meta.url, "P15.5-E43.css"));
test(".cards", () => {
  const r = rules();
  const c = declsFor(r, ".cards");
  assert.equal(c.display, "flex");
  assert.equal(c["flex-wrap"], "wrap");
  assert.ok(c.gap, "gap");
  const card = declsFor(r, ".cards .card");
  assert.equal(card.flex, "1");
  const m = (card["min-width"] ?? "").match(/^(\d+)px$/);
  assert.ok(m && Number(m[1]) >= 180 && Number(m[1]) <= 320, "min-width בין 180px ל־320px");
});
test(".stack ו־.toolbar", () => {
  const r = rules();
  const s = declsFor(r, ".stack");
  assert.equal(s.display, "flex");
  assert.equal(s["flex-direction"], "column");
  assert.ok(s.gap, "gap");
  const t = declsFor(r, ".toolbar");
  assert.equal(t.display, "flex");
  assert.equal(t["justify-content"], "space-between");
  assert.equal(t["align-items"], "center");
});
