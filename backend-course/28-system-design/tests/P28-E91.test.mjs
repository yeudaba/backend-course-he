import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { checkDesignDoc, REQUIRED } = await load(import.meta.url, "P28-E91.ts");

const full = `# תור למיילים

## הקשר
היום המייל נשלח בתוך הבקשה.

## מטרות ולא־מטרות
- p95 של הרשמה מתחת ל־200ms

## אומדנים
5,000 הרשמות ביום.

## פתרון
### תרשים
BullMQ.

## חלופות
SQS.

##  סיכונים וכשלים  
Redis נופל.

## איך נדע שזה עבד
מדד.
`;

test("REQUIRED", () => {
  assert.deepEqual(REQUIRED, ["הקשר", "מטרות", "אומדנים", "פתרון", "חלופות", "סיכונים", "איך נדע"]);
});
test("מסמך שלם", () => {
  assert.deepEqual(checkDesignDoc(full), { ok: true, missing: [], empty: [] });
});
test("חסרים וריקים", () => {
  const doc = full.replace("## חלופות\nSQS.\n", "").replace("5,000 הרשמות ביום.", "   ").replace("## הקשר\nהיום המייל נשלח בתוך הבקשה.\n", "## הקשר\n");
  assert.deepEqual(checkDesignDoc(doc), { ok: false, missing: ["חלופות"], empty: ["הקשר", "אומדנים"] });
  assert.deepEqual(checkDesignDoc(""), { ok: false, missing: REQUIRED, empty: [] });
});
test("### היא תוכן; # אחד אינו כותרת סעיף", () => {
  const doc = "## פתרון\n### תת־כותרת\n# פתרון\n";
  const r = checkDesignDoc(doc);
  assert.deepEqual(r.empty, []);
  assert.ok(r.missing.includes("הקשר") && !r.missing.includes("פתרון"));
  const r2 = checkDesignDoc("### הקשר\nטקסט\n");
  assert.ok(r2.missing.includes("הקשר"));
});
