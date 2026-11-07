import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";

const { listQuerySchema } = await load(import.meta.url, "P15-E12.ts");

test("ברירות מחדל", () => assert.deepEqual(listQuerySchema.parse({}), { page: 1, limit: 10 }));
test("המרות", () => assert.deepEqual(listQuerySchema.parse({ page: "3", limit: "50", sort: "-price", inStock: "false" }), { page: 3, limit: 50, sort: "-price", inStock: false }));
test("inStock=true", () => assert.equal(listQuerySchema.parse({ inStock: "true" }).inStock, true));
test("לא תקין", () => {
  for (const q of [{ page: "0" }, { page: "1.5" }, { page: "abc" }, { limit: "51" }, { limit: "0" }, { sort: "date" }, { inStock: "yes" }]) {
    assert.equal(listQuerySchema.safeParse(q).success, false, JSON.stringify(q));
  }
});
