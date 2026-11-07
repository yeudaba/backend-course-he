import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { parseRequest } = await load(import.meta.url, "P14-E13.mjs");

test("GET בלי גוף", () => assert.deepEqual(parseRequest("GET /products?maxPrice=100&q=a+b HTTP/1.1\r\nHost: localhost:4000\r\nAccept: */*\r\n\r\n"), {
  method: "GET", path: "/products", query: { maxPrice: "100", q: "a b" }, headers: { host: "localhost:4000", accept: "*/*" }, body: undefined,
}));
test("POST עם JSON מרובה שורות", () => {
  const r = parseRequest("POST /products HTTP/1.1\nContent-Type: application/json\n\n{\n  \"name\": \"מסך\"\n}");
  assert.equal(r.method, "POST");
  assert.deepEqual(r.body, { name: "מסך" });
});
test("גוף שאינו JSON נשאר מחרוזת", () => assert.equal(parseRequest("POST /f HTTP/1.1\r\nContent-Type: text/plain\r\n\r\nשלום\r\n\r\nעולם").body, "שלום\n\nעולם"));
test("שורה ראשונה לא תקינה", () => assert.throws(() => parseRequest("GET /\r\n\r\n"), { message: "שורת בקשה לא תקינה" }));
