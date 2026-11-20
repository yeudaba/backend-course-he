import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { sseMessage } = await load(import.meta.url, "P26-E123.ts");

// מפרק כמו הדפדפן: הודעה נגמרת בשורה ריקה; data משורות נפרדות מתחבר עם \n
function parse(stream) {
  const events = [];
  let cur = { data: [] };
  for (const line of stream.split("\n")) {
    if (line === "") {
      if (cur.data.length) events.push({ id: cur.id, event: cur.event ?? "message", data: cur.data.join("\n") });
      cur = { data: [] };
      continue;
    }
    const i = line.indexOf(":");
    const field = line.slice(0, i);
    const value = line.slice(i + 1).replace(/^ /, "");
    if (field === "data") cur.data.push(value);
    else if (field === "id" || field === "event") cur[field] = value;
  }
  return events;
}

test("הודעה נגמרת בשורה ריקה", () => {
  assert.equal(sseMessage({ data: "hi" }), "data: hi\n\n");
  assert.deepEqual(parse(sseMessage({ data: "a" }) + sseMessage({ data: "b" })), [{ id: undefined, event: "message", data: "a" }, { id: undefined, event: "message", data: "b" }], "בלי שורה ריקה הדפדפן לא מפעיל onmessage");
});
test("id (גם 0), event ו־JSON", () => {
  assert.equal(sseMessage({ id: 0, event: "order", data: { status: "paid" } }), 'id: 0\nevent: order\ndata: {"status":"paid"}\n\n', "id: 0 — האירוע הראשון");
  assert.deepEqual(parse(sseMessage({ id: 7, data: [1, 2] })), [{ id: "7", event: "message", data: "[1,2]" }]);
});
test("טקסט של כמה שורות", () => {
  const msg = sseMessage({ event: "note", data: "שורה 1\nשורה 2\n\nשורה 4" });
  assert.deepEqual(parse(msg), [{ id: undefined, event: "note", data: "שורה 1\nשורה 2\n\nשורה 4" }], "כל שורה צריכה data: משלה");
});
