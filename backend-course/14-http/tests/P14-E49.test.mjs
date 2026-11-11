import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P14-E49.mjs", ["parseStatusLine"])).parseStatusLine;

test("שורות תקינות", async () => {
  const f = await get();
  assert.deepEqual(f("HTTP/1.1 404 Not Found"), { version: "1.1", status: 404, text: "Not Found" });
  assert.deepEqual(f("HTTP/2 200"), { version: "2", status: 200, text: "" }, "בלי טקסט ← text ריק");
  assert.deepEqual(f("HTTP/1.1 503 Service Unavailable"), { version: "1.1", status: 503, text: "Service Unavailable" }, "הטקסט כולל רווחים");
  assert.deepEqual(f("HTTP/1.0 201 Created"), { version: "1.0", status: 201, text: "Created" });
  assert.deepEqual(f("HTTP/1.1 100 Continue"), { version: "1.1", status: 100, text: "Continue" });
  assert.deepEqual(f("HTTP/1.1 599 Weird"), { version: "1.1", status: 599, text: "Weird" });
});
test("שורות לא תקינות", async () => {
  const f = await get();
  for (const bad of ["404 Not Found", "HTTP/1.1 OK", "HTTP/1.1 99 Old", "HTTP/1.1 600 Nope", "HTTP/1.1 2000 Big", "HTTP/1.1 2O0 OK", "HTTP/1.1", "", "FTP/1.1 200 OK"]) {
    assert.throws(() => f(bad), { message: `שורת status לא תקינה: ${bad}` }, `"${bad}" צריך לזרוק`);
  }
});
