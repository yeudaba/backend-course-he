import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { doublePrices, activeUsers, shout } = await load(import.meta.url, "P06-E21.js");

test("doublePrices", () => assert.deepEqual(doublePrices([5, 10]), [10, 20]));
test("activeUsers", () => assert.deepEqual(activeUsers(["active", "blocked", "active", "pending"]), ["active", "active"]));
test("shout", () => assert.deepEqual(shout(["hi", "bye"]), ["HI", "BYE"]));
