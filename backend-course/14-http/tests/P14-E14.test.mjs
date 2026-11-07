import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { buildResponse } = await load(import.meta.url, "P14-E14.mjs");

test("JSON עם עברית — אורך בבתים", () => assert.equal(buildResponse(200, { a: "שלום" }), 'HTTP/1.1 200 OK\r\nContent-Type: application/json; charset=utf-8\r\nContent-Length: 16\r\n\r\n{"a":"שלום"}'));
test("headers לפי הסדר", () => assert.equal(buildResponse(201, { id: 3 }, { Location: "/p/3" }), 'HTTP/1.1 201 Created\r\nLocation: /p/3\r\nContent-Type: application/json; charset=utf-8\r\nContent-Length: 8\r\n\r\n{"id":3}'));
test("גוף מחרוזת", () => assert.equal(buildResponse(404, "לא", { "Content-Type": "text/plain" }), "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\nContent-Length: 4\r\n\r\nלא"));
test("204 בלי גוף", () => assert.equal(buildResponse(204), "HTTP/1.1 204 No Content\r\n\r\n"));
test("שגיאות", () => {
  assert.throws(() => buildResponse(204, {}), { message: "204 לא יכול להכיל גוף" });
  assert.throws(() => buildResponse(418, {}), { message: "status לא מוכר: 418" });
});
