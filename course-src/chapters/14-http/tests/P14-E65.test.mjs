import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P14-E65.mjs", ["parseVerbose"])).parseVerbose;

const sample = `* Host localhost:4000 was resolved.
*   Trying 127.0.0.1:4000...
> POST /products?x=1 HTTP/1.1
> Host: localhost:4000
> User-Agent: curl/8.5.0
> Content-Type: application/json
> 
} [29 bytes data]
< HTTP/1.1 201 Created
< Content-Type: application/json; charset=utf-8
< Location: /products/3
< Date: Wed, 11 Nov 2026 13:27:53 GMT
< 
{ [33 bytes data]
* Connection #0 to host localhost left intact
{"id":3,"name":"<b>מסך</b> > 2","price":899}`;

test("בקשה ותשובה", async () => {
  const f = await get();
  assert.deepEqual(f(sample), {
    request: { method: "POST", path: "/products?x=1", headers: { host: "localhost:4000", "user-agent": "curl/8.5.0", "content-type": "application/json" } },
    response: { status: 201, headers: { "content-type": "application/json; charset=utf-8", location: "/products/3", date: "Wed, 11 Nov 2026 13:27:53 GMT" } },
  });
});
test("\\r\\n ו־404", async () => {
  const f = await get();
  const text = "> GET /x HTTP/1.1\r\n> Accept: */*\r\n> \r\n< HTTP/1.1 404 Not Found\r\n< X-Request-Id: a:b:c\r\n< \r\n";
  assert.deepEqual(f(text), {
    request: { method: "GET", path: "/x", headers: { accept: "*/*" } },
    response: { status: 404, headers: { "x-request-id": "a:b:c" } },
  });
});
test("אין בקשה או תשובה ← null", async () => {
  const f = await get();
  assert.deepEqual(f("* Could not resolve host: nope.test"), { request: null, response: null });
  const onlyRequest = f("> GET / HTTP/1.1\n> Host: x\n* Recv failure: Connection reset by peer");
  assert.deepEqual(onlyRequest, { request: { method: "GET", path: "/", headers: { host: "x" } }, response: null });
});
