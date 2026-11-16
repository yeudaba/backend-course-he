import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { sectionCheck } = await load(import.meta.url, "P30-E57.ts");
const cv = (...names) => "# Noa\nJunior Backend Developer\n" + names.map((n) => `## ${n}\n- x\n### sub\n`).join("");

test("תקין, עם ובלי אופציונליים", () => {
  assert.deepEqual(sectionCheck(cv("Summary", "Skills", "Projects", "Experience", "Education", "Languages")), { missing: [], outOfOrder: false, unknown: [] });
  assert.deepEqual(sectionCheck(cv("summary", "SKILLS", "Projects ", "Education")), { missing: [], outOfOrder: false, unknown: [] });
});
test("חסר, סדר, לא מוכר", () => {
  assert.deepEqual(sectionCheck(cv("Skills", "Summary", "Projects", "Education")), { missing: [], outOfOrder: true, unknown: [] });
  assert.deepEqual(sectionCheck(cv("Summary", "Projects", "Hobbies", "Education", "References")), { missing: ["Skills"], outOfOrder: false, unknown: ["Hobbies", "References"] });
  assert.deepEqual(sectionCheck(cv("Summary", "Skills", "Projects", "Education", "Experience")), { missing: [], outOfOrder: true, unknown: [] });
  assert.deepEqual(sectionCheck(cv("Summary", "Skills", "Skills", "Projects", "Education")), { missing: [], outOfOrder: true, unknown: [] }, "פעמיים");
  assert.deepEqual(sectionCheck("# x\n#Summary\n### Skills\n"), { missing: ["Summary", "Skills", "Projects", "Education"], outOfOrder: false, unknown: [] });
});
