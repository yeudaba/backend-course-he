import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P14-E85.mjs", ["jsonResponse"])).jsonResponse;
const show = (text) => JSON.stringify(text); // כך רואים \r\n בהודעה

test("שורות מופרדות ב־\\r\\n, ושורה ריקה לפני הגוף", async () => {
  const jsonResponse = await get();
  const text = jsonResponse(200, { ok: true });
  assert.ok(!/[^\r]\n/.test(text), `jsonResponse(200, { ok: true }) — כל שורה צריכה להסתיים ב־\\r\\n, לא ב־\\n לבד. קיבלנו: ${show(text)}`);
  assert.ok(text.includes("\r\n\r\n"), `jsonResponse(200, { ok: true }) — חסרה שורה ריקה (\\r\\n\\r\\n) בין ה־headers לגוף. קיבלנו: ${show(text)}`);
  assert.equal(text.split("\r\n\r\n")[1], '{"ok":true}', "הגוף — JSON.stringify של data, אחרי השורה הריקה");
});
test("Content-Length בבתים", async () => {
  const jsonResponse = await get();
  for (const data of [{ ok: true }, { name: "מסך" }, ["שלום", "abc"]]) {
    const body = JSON.stringify(data);
    const text = jsonResponse(201, data);
    const m = /Content-Length: (\d+)/.exec(text);
    assert.ok(m, `jsonResponse(201, ${body}) — חסר Content-Length`);
    assert.equal(Number(m[1]), Buffer.byteLength(body), `jsonResponse(201, ${body}) — הגוף הוא ${body.length} תווים, אבל ${Buffer.byteLength(body)} בתים`);
  }
});
test("התשובה המלאה", async () => {
  const jsonResponse = await get();
  assert.equal(
    jsonResponse(201, { id: 3, name: "מסך" }),
    'HTTP/1.1 201 Created\r\nContent-Type: application/json; charset=utf-8\r\nContent-Length: 24\r\n\r\n{"id":3,"name":"מסך"}',
    'jsonResponse(201, { id: 3, name: "מסך" })',
  );
  assert.equal(
    jsonResponse(404, { error: "לא נמצא" }),
    'HTTP/1.1 404 Not Found\r\nContent-Type: application/json; charset=utf-8\r\nContent-Length: 25\r\n\r\n{"error":"לא נמצא"}',
    'jsonResponse(404, { error: "לא נמצא" })',
  );
});
test("204 — בלי headers ובלי גוף", async () => {
  const jsonResponse = await get();
  assert.equal(jsonResponse(204), "HTTP/1.1 204 No Content\r\n\r\n", "jsonResponse(204)");
});
