import { test } from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { load } from "../../tools/load.mjs";

const { readJsonBody } = await load(import.meta.url, "P14-E17.mjs");

function fakeReq(chunks, type = "application/json") {
  const req = Readable.from(chunks.map((c) => Buffer.from(c)));
  req.headers = type ? { "content-type": type } : {};
  return req;
}

test("JSON תקין, גם כשאות נחתכת", async () => {
  const bytes = Buffer.from('{"name":"שלום עולם"}');
  const chunks = [bytes.subarray(0, 10), bytes.subarray(10, 13), bytes.subarray(13)];
  assert.deepEqual(await readJsonBody(fakeReq(chunks, "application/json; charset=utf-8")), { name: "שלום עולם" });
});
test("415", () => assert.rejects(readJsonBody(fakeReq(["{}"], "text/plain")), { status: 415, message: "Content-Type חייב להיות application/json" }));
test("415 בלי header", () => assert.rejects(readJsonBody(fakeReq(["{}"], null)), { status: 415 }));
test("413 — עוצרים מוקדם", async () => {
  let produced = 0;
  async function* endless() { while (true) { produced++; yield Buffer.alloc(100, 32); } }
  const req = Readable.from(endless());
  req.headers = { "content-type": "application/json" };
  await assert.rejects(readJsonBody(req, { limit: 1000 }), { status: 413, message: "הגוף גדול מדי" });
  assert.ok(produced < 50, "צריך להפסיק לקרוא ברגע שעברנו את המגבלה");
});
test("400", async () => {
  await assert.rejects(readJsonBody(fakeReq(["  "])), { status: 400, message: "גוף ריק" });
  await assert.rejects(readJsonBody(fakeReq(["{oops"])), { status: 400, message: "JSON לא תקין" });
});
