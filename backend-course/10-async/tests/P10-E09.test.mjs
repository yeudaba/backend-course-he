import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { orderCountText } = await load(import.meta.url, "P10-E09.js");
const sleep = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const failAfter = (ms, m) => new Promise((_, rej) => setTimeout(() => rej(new Error(m)), ms));

test("מחזירה Promise", () => assert.ok(orderCountText(1) instanceof Promise));
test("טקסט", async () => { assert.equal(await orderCountText(1), "דנה: 2 הזמנות"); assert.equal(await orderCountText(2), "עומר: 1 הזמנות"); });
test("לא קיים", async () => assert.rejects(orderCountText(9), { message: "משתמש לא נמצא" }));
