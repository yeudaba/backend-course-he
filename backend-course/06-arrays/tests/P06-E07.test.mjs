import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { joinQueue, serveNext, vipJoin } = await load(import.meta.url, "P06-E07.js");

test("joinQueue מחזירה את המקום בתור", () => { const q = []; assert.equal(joinQueue(q, "a"), 1); assert.equal(joinQueue(q, "b"), 2); assert.deepEqual(q, ["a", "b"]); });
test("serveNext", () => { const q = ["a", "b"]; assert.equal(serveNext(q), "a"); assert.deepEqual(q, ["b"]); });
test("serveNext על תור ריק → null", () => assert.equal(serveNext([]), null));
test("vipJoin מוסיפה להתחלה", () => { const q = ["a"]; vipJoin(q, "VIP"); assert.deepEqual(q, ["VIP", "a"]); });
