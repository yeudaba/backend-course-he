import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { getCity, getFirstPhone, displayName } = await load(import.meta.url, "P07-E08.js");

test("getCity", () => {
  assert.equal(getCity({ address: { city: "חיפה" } }), "חיפה");
  assert.equal(getCity({ address: {} }), "לא ידוע");
  assert.equal(getCity({}), "לא ידוע");
  assert.equal(getCity(null), "לא ידוע");
});
test("getFirstPhone", () => { assert.equal(getFirstPhone({ phones: ["050"] }), "050"); assert.equal(getFirstPhone({ phones: [] }), null); assert.equal(getFirstPhone({}), null); });
test("displayName", () => {
  assert.equal(displayName({ nickname: "דנוש", firstName: "דנה" }), "דנוש");
  assert.equal(displayName({ nickname: "", firstName: "דנה" }), "דנה");
  assert.equal(displayName({}), "אורח");
  assert.equal(displayName(null), "אורח");
});
