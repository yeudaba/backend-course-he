import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { formatEvent } = await load(import.meta.url, "P26-E27.ts");

test("data בלבד — מחרוזת", () => {
  assert.equal(formatEvent({ data: "hello" }), "data: hello\n\n");
});
test("אובייקט ← JSON", () => {
  assert.equal(formatEvent({ data: { id: 7, status: "paid" } }), 'data: {"id":7,"status":"paid"}\n\n');
});
test("id, event ו־retry — לפני data, בסדר הזה", () => {
  assert.equal(formatEvent({ data: 1, event: "order", id: 12, retry: 5000 }), "id: 12\nevent: order\nretry: 5000\ndata: 1\n\n");
});
test("ירידות שורה בתוך data — שורת data לכל שורה", () => {
  assert.equal(formatEvent({ data: "a\nb\r\nc" }), "data: a\ndata: b\ndata: c\n\n");
});
test("id: 0 הוא id", () => {
  assert.equal(formatEvent({ data: "x", id: 0 }), "id: 0\ndata: x\n\n");
});
