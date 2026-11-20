import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { encodeCursor, decodeCursor, pageAfter } = await load(import.meta.url, "P27-E104.ts");

test("encode/decode — בטוח בכתובת, ו־null על זבל", () => {
  const c = { createdAt: "2026-11-20T10:00:00.000Z", id: 1023 };
  for (let id = 1; id < 300; id++) {
    const s = encodeCursor({ ...c, id, note: undefined });
    assert.match(s, /^[A-Za-z0-9_-]+$/, `cursor ${s} לא בטוח בכתובת — base64url`);
    assert.deepEqual(decodeCursor(s), { ...c, id });
  }
  for (const bad of ["", "%%%", "bm90LWpzb24", Buffer.from('{"id":"x"}').toString("base64url"), Buffer.from("[1]").toString("base64url")]) {
    assert.equal(decodeCursor(bad), null, `decodeCursor("${bad}") — צריך null, לא חריגה`);
  }
});
test("עמודים — כולל תיקו בזמן על הגבול", () => {
  const T1 = "2026-11-20T10:00:00.000Z";
  const T0 = "2026-11-20T09:00:00.000Z";
  const items = [{ createdAt: T1, id: 9 }, { createdAt: T1, id: 7 }, { createdAt: T1, id: 4 }, { createdAt: T0, id: 8 }, { createdAt: T0, id: 2 }];
  const seen = [];
  let cursor = null;
  for (let guard = 0; guard < 10; guard++) {
    const p = pageAfter(items, cursor, 2);
    seen.push(...p.items.map((i) => i.id));
    if (!p.nextCursor) break;
    cursor = decodeCursor(p.nextCursor);
  }
  assert.deepEqual(seen, [9, 7, 4, 8, 2], "כל פריט בדיוק פעם אחת, בסדר");
  const last = pageAfter(items, { createdAt: T0, id: 8 }, 5);
  assert.deepEqual(last, { items: [{ createdAt: T0, id: 2 }], nextCursor: null });
  assert.equal(pageAfter(items, null, 5).nextCursor, null, "בדיוק limit פריטים — אין עמוד הבא");
});
