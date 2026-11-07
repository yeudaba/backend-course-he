import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { priceWithShipping } = await load(import.meta.url, "P10-E21.js");
const sleep = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const failAfter = (ms, m) => new Promise((_, rej) => setTimeout(() => rej(new Error(m)), ms));

test("מחזירה Promise עם הסכום", async () => assert.equal(await priceWithShipping("KB-101"), 224));
test("מוצר לא קיים — נכשל", async () => assert.rejects(priceWithShipping("X"), { message: "מוצר לא קיים" }));
