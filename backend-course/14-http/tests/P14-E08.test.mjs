import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { parseHeaders } = await load(import.meta.url, "P14-E08.mjs");

test("שמות קטנים ורווחים", () => assert.deepEqual(parseHeaders(["Content-Type:   application/json  ", "X-Request-Id: abc"]), { "content-type": "application/json", "x-request-id": "abc" }));
test("נקודתיים בתוך הערך", () => assert.deepEqual(parseHeaders(["Authorization: Basic a:b", "Referer: http://x.co.il/p"]), { authorization: "Basic a:b", referer: "http://x.co.il/p" }));
test("header כפול", () => assert.deepEqual(parseHeaders(["Accept: text/html", "accept: application/json"]), { accept: "text/html, application/json" }));
test("שורה לא תקינה", () => assert.throws(() => parseHeaders(["Host: a", "broken"]), { message: "header לא תקין: broken" }));
test("מערך ריק", () => assert.deepEqual(parseHeaders([]), {}));
