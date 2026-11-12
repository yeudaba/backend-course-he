import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { parseSSE } = await load(import.meta.url, "P26-E111.ts");

test("הזרם מ־E106", () => {
  const text = ': connected\n\nretry: 5000\n\nid: 1\nevent: status\ndata: {"status":"received"}\n\ndata: שורה ראשונה\ndata: שורה שנייה\n\n: ping\n\nid: 2\nevent: status\ndata: {"status":"shipped"}\n';
  assert.deepEqual(parseSSE(text), [
    { event: "status", data: '{"status":"received"}', id: "1" },
    { event: "message", data: "שורה ראשונה\nשורה שנייה" },
  ], "האחרונה לא הסתיימה בשורה ריקה — לא נכנסת");
});
test("CRLF ו־CR, רווח אחד בלבד מוסר, נקודתיים בתוך הערך", () => {
  assert.deepEqual(parseSSE('data: {"a":1}\r\n\r\ndata:x\rdata:   y\r\r'), [
    { event: "message", data: '{"a":1}' },
    { event: "message", data: "x\n  y" },
  ]);
});
test("שדה בלי נקודתיים, data ריק, ו־id לכל הודעה בנפרד", () => {
  assert.deepEqual(parseSSE("data\n\nevent: a\ndata:\ndata\n\nid: 9\n\ndata: z\n\n"), [
    { event: "message", data: "" },
    { event: "a", data: "\n" },
    { event: "message", data: "z" },
  ], "הודעה עם id בלי data לא נכנסת, וה־id שלה לא 'דולף' להודעה הבאה");
  assert.deepEqual(parseSSE(""), []);
});
