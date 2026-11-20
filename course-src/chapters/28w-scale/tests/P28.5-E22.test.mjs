import { test } from "node:test";
import assert from "node:assert/strict";
import { assertSameRows } from "../../tools/rows.mjs";
import { duck, sameAsSolution } from "./_duck.mjs";

test("זהה לפתרון (יום בישראל, לקוחות שונים, כמות × מחיר)", async (t) => {
  const d = await duck(t);
  const got = await d.fileRows("P28.5-E22.sql");
  const want = await d.expectedRows("P28.5-E22.sql");
  const col = (rows, c) => rows.map((r) => ({ [c]: r[c] }));
  assertSameRows(col(got, "day"), col(want, "day"), "באג 1: היום נחתך ב־UTC במקום בשעון ישראל");
  assertSameRows(col(got, "active_customers"), col(want, "active_customers"), "באג 2: סופרים הזמנות, לא לקוחות שונים");
  assertSameRows(col(got, "revenue"), col(want, "revenue"), "באג 3: ההכנסה לא כוללת כמות");
  await sameAsSolution("P28.5-E22.sql");
});
