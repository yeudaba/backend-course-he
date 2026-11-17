import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough } from "./_perf.mjs";

const { encodeCursor, decodeCursor, pageAfter } = await load(import.meta.url, "P27-E91.ts");

test("encode/decode", () => {
  const c = { createdAt: "2026-11-08T10:00:00.000Z", id: 42 };
  const s = encodeCursor(c);
  assert.match(s, /^[A-Za-z0-9_-]+$/, "base64url");
  assert.deepEqual(JSON.parse(Buffer.from(s, "base64url").toString()), c);
  assert.deepEqual(decodeCursor(s), c);
  for (const bad of ["", "!!!", Buffer.from("not json").toString("base64url"), Buffer.from('{"id":1}').toString("base64url"), Buffer.from('{"createdAt":"x","id":"1"}').toString("base64url")]) {
    assert.equal(decodeCursor(bad), null, bad);
  }
});
test("עמודים — כולל שוויון בזמן", () => {
  const items = [
    { id: 9, createdAt: "2026-11-08" }, { id: 8, createdAt: "2026-11-08" }, { id: 7, createdAt: "2026-11-08" },
    { id: 5, createdAt: "2026-11-07" }, { id: 6, createdAt: "2026-11-06" }, { id: 2, createdAt: "2026-11-06" },
  ];
  const ids = [];
  let cursor = null;
  for (let page = 0; page < 10; page++) {
    const r = pageAfter(items, cursor, 2);
    ids.push(r.items.map((x) => x.id));
    cursor = r.nextCursor;
    if (!cursor) break;
  }
  assert.deepEqual(ids, [[9, 8], [7, 5], [6, 2]]);
  assert.equal(pageAfter(items, null, 10).nextCursor, null, "אין עוד ← null");
  assert.deepEqual(pageAfter(items, encodeCursor({ createdAt: "2026-11-08", id: 8 }), 1).items.map((x) => x.id), [7]);
  assert.deepEqual(pageAfter(items, encodeCursor({ createdAt: "2026-11-07", id: 100 }), 5).items.map((x) => x.id), [5, 6, 2], "cursor שאינו פריט קיים");
});
test("חיפוש בינארי: 1,000,000 פריטים, 2,000 עמודים", () => {
  const items = Array.from({ length: 1_000_000 }, (_, i) => ({ id: 1_000_000 - i, createdAt: `2026-${String(12 - Math.floor(i / 100_000)).padStart(2, "0")}` }));
  const cursors = Array.from({ length: 2000 }, (_, k) => encodeCursor(items[(k * 499) % items.length]));
  fastEnough(() => { for (const c of cursors) pageAfter(items, c, 20); }, 300, "2,000 עמודים");
});
