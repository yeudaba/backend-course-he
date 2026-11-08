import { test } from "node:test";
import assert from "node:assert/strict";
import { readDoc, assertNoPlaceholders } from "./_docs.mjs";

const raw = readDoc(import.meta.url, "P30-E07.json");
let repos;

test("JSON תקין: מערך של שני repos מוצמדים", () => {
  repos = JSON.parse(raw);
  assert.ok(Array.isArray(repos) && repos.length >= 2, "לפחות שני repos");
  assert.ok(repos.filter((r) => r.pinned === true).length >= 2, "שניים מוצמדים (pinned)");
  assert.equal(new Set(repos.map((r) => r.name)).size, repos.length, "שמות שונים");
  assertNoPlaceholders(raw, "פרטי ה־repos");
});
test("תיאור: 20–120 תווים, ובלי לחזור על השם", () => {
  for (const r of JSON.parse(raw)) {
    assert.ok(typeof r.description === "string" && r.description.length >= 20 && r.description.length <= 120, `${r.name}: תיאור של ${r.description?.length} תווים`);
    assert.notEqual(r.description.toLowerCase().trim(), r.name.toLowerCase(), r.name);
  }
});
test("topics: 3–8, באותיות קטנות עם מקפים", () => {
  for (const r of JSON.parse(raw)) {
    assert.ok(Array.isArray(r.topics) && r.topics.length >= 3 && r.topics.length <= 8, `${r.name}: ${r.topics?.length} topics`);
    for (const t of r.topics) assert.match(t, /^[a-z0-9][a-z0-9-]{0,49}$/, `${r.name}: topic "${t}"`);
  }
});
test("לפחות אחד עם homepage חי ב־https, וכולם עם רישיון", () => {
  const all = JSON.parse(raw);
  assert.ok(all.some((r) => /^https:\/\/\S+\.\S+/.test(r.homepage ?? "")), "קישור חי (homepage) לפרויקט הדגל");
  for (const r of all) assert.ok(typeof r.license === "string" && r.license.length > 0, `${r.name}: license`);
});
