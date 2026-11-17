import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { adrMarkdown } = await load(import.meta.url, "P28-E94.ts");
const base = { number: 7, title: "תור למיילים", status: "accepted", date: "2026-03-01", context: "שליחת מייל בתוך ההרשמה לוקחת שנייה.", decision: "BullMQ על Redis הקיים.", consequences: ["עוד תהליך לנטר", "מייל יכול לצאת פעמיים"] };

test("הפורמט המדויק", () => {
  assert.equal(adrMarkdown(base), "# ADR-0007: תור למיילים\n\n- סטטוס: accepted\n- תאריך: 2026-03-01\n\n## הקשר\nשליחת מייל בתוך ההרשמה לוקחת שנייה.\n\n## החלטה\nBullMQ על Redis הקיים.\n\n## השלכות\n- עוד תהליך לנטר\n- מייל יכול לצאת פעמיים\n");
  const r = adrMarkdown({ ...base, number: 123, status: "superseded", consequences: ["אחת"] });
  assert.ok(r.startsWith("# ADR-0123: "));
  assert.ok(r.endsWith("## השלכות\n- אחת\n"));
});
test("שגיאות", () => {
  for (const bad of [{ status: "done" }, { date: "1.3.2026" }, { title: "  " }, { decision: "" }, { consequences: [] }]) {
    assert.throws(() => adrMarkdown({ ...base, ...bad }), Error, JSON.stringify(bad));
  }
});
