import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P13-E26.mjs";
const get = async () => (await exportsOf(import.meta.url, FILE, ["parseAccessLine"])).parseAccessLine;

test("שורה רגילה", async () => {
  const parseAccessLine = await get();
  assert.deepEqual(parseAccessLine('203.0.113.7 - - [10/Nov/2026:13:05:01 +0000] "GET /api/users?page=2 HTTP/1.1" 200 512'), {
    ip: "203.0.113.7",
    time: "10/Nov/2026:13:05:01 +0000",
    method: "GET",
    path: "/api/users?page=2",
    status: 200,
    bytes: 512,
  });
});
test("משתמש מחובר, ובתים \"-\" ← 0", async () => {
  const parseAccessLine = await get();
  const r = parseAccessLine('10.0.0.1 - dana [10/Nov/2026:13:05:02 +0000] "DELETE /api/users/7 HTTP/1.1" 204 -');
  assert.ok(r, "השורה תקינה — במקום השדה השלישי יש שם משתמש (dana), ו־\\S+ מתאים גם לו");
  assert.equal(r.method, "DELETE");
  assert.equal(r.path, "/api/users/7");
  assert.equal(r.status, 204, "status צריך להיות מספר");
  assert.equal(r.bytes, 0, "כשהבתים הם \"-\" מחזירים 0");
});
test("רווחים בקצוות, HTTP/2.0 ו־POST", async () => {
  const parseAccessLine = await get();
  const r = parseAccessLine('  ::1 - - [01/Jan/2027:00:00:00 +0200] "POST /login HTTP/2.0" 401 23 \n');
  assert.ok(r, "רווחים בתחילת השורה ובסופה לא אמורים להפריע (trim)");
  assert.deepEqual(r, { ip: "::1", time: "01/Jan/2027:00:00:00 +0200", method: "POST", path: "/login", status: 401, bytes: 23 });
});
test("שורות שלא בפורמט ← null", async () => {
  const parseAccessLine = await get();
  const bad = [
    "",
    "משהו אחר לגמרי",
    'GET /api 200 12',
    '1.2.3.4 - - [10/Nov/2026:13:05:01 +0000] "GET /x HTTP/1.1" 200 512 extra',
    '1.2.3.4 - - [10/Nov/2026:13:05:01 +0000] "GET /x HTTP/1.1" 20 512',
    '1.2.3.4 - - 10/Nov/2026:13:05:01 "GET /x HTTP/1.1" 200 512',
  ];
  for (const line of bad) assert.equal(parseAccessLine(line), null, `parseAccessLine(${JSON.stringify(line)}) צריכה להחזיר null (^ ו־$ ב־regex?)`);
});
test("משתמשים ב־regex", () => {
  assert.match(code(import.meta.url, FILE), /\.(match|exec|test|matchAll)\(|new RegExp/, "התרגיל מתרגל ביטוי רגולרי: line.match(/.../) או REGEX.exec(line)");
});
