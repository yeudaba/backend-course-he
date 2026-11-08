import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { encodeCursor, decodeCursor, nextPage } = await load(import.meta.url, "P28-E11.ts");
const rows = [
  { id: 1, createdAt: "2026-11-01T10:00:00.000Z" },
  { id: 2, createdAt: "2026-11-01T11:00:00.000Z" },
  { id: 3, createdAt: "2026-11-01T11:00:00.000Z" },
  { id: 4, createdAt: "2026-11-02T09:00:00.000Z" },
  { id: 5, createdAt: "2026-11-03T08:00:00.000Z" },
];

test("cursor אטום שחוזר לאותו ערך", () => {
  const c = encodeCursor({ createdAt: "2026-11-01T11:00:00.000Z", id: 3 });
  assert.match(c, /^[A-Za-z0-9_-]+$/, "base64url — בטוח ב־URL");
  assert.deepEqual(decodeCursor(c), { createdAt: "2026-11-01T11:00:00.000Z", id: 3 });
});
test("cursor שגוי ← שגיאה ברורה", () => {
  for (const bad of ["", "%%%", Buffer.from("[1,2]").toString("base64url"), Buffer.from('["2026-11-01T00:00:00Z",-4]').toString("base64url"), Buffer.from("not json").toString("base64url")]) {
    assert.throws(() => decodeCursor(bad), /cursor/, bad);
  }
});
test("עמודים לפי createdAt ואז id (מהחדש), בלי כפילויות ובלי דילוגים", () => {
  const p1 = nextPage(rows, 2);
  assert.deepEqual(p1.data.map((r) => r.id), [5, 4]);
  const p2 = nextPage(rows, 2, p1.nextCursor);
  assert.deepEqual(p2.data.map((r) => r.id), [3, 2], "אותו createdAt — לפי id");
  const p3 = nextPage(rows, 2, p2.nextCursor);
  assert.deepEqual(p3.data.map((r) => r.id), [1]);
  assert.equal(p3.nextCursor, null, "עמוד אחרון ← null");
});
test("שורה חדשה בין העמודים לא גורמת לכפילות", () => {
  const p1 = nextPage(rows, 2);
  const withNew = [...rows, { id: 6, createdAt: "2026-11-04T00:00:00.000Z" }];
  assert.deepEqual(nextPage(withNew, 2, p1.nextCursor).data.map((r) => r.id), [3, 2], "עם OFFSET היה מגיע 4 שוב");
});
