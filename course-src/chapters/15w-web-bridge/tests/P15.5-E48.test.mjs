import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const mod = () => exportsOf(import.meta.url, "P15.5-E48.mjs", ["hexToRgb", "rgbToHex"]);
test("hexToRgb", async () => {
  const { hexToRgb } = await mod();
  assert.deepEqual(hexToRgb("#d8dbe0"), { r: 216, g: 219, b: 224 });
  assert.deepEqual(hexToRgb("#FA0"), { r: 255, g: 170, b: 0 });
  assert.deepEqual(hexToRgb("#000000"), { r: 0, g: 0, b: 0 });
  assert.deepEqual(hexToRgb("#0969DA"), { r: 9, g: 105, b: 218 });
  for (const bad of ["#abcd", "red", "d8dbe0", "#ggg", "#fff ", "", "#12345"]) {
    assert.throws(() => hexToRgb(bad), { message: `צבע לא תקין: ${bad}` }, `"${bad}"`);
  }
});
test("rgbToHex", async () => {
  const { rgbToHex, hexToRgb } = await mod();
  assert.equal(rgbToHex({ r: 9, g: 105, b: 218 }), "#0969da");
  assert.equal(rgbToHex({ r: 0, g: 0, b: 0 }), "#000000");
  assert.equal(rgbToHex({ r: 255, g: 255, b: 255 }), "#ffffff");
  assert.equal(rgbToHex(hexToRgb("#ABC")), "#aabbcc");
  for (const bad of [{ r: 256, g: 0, b: 0 }, { r: -1, g: 0, b: 0 }, { r: 1.5, g: 0, b: 0 }, { r: "10", g: 0, b: 0 }, { r: 0, g: 0 }]) {
    assert.throws(() => rgbToHex(bad), { message: "ערך rgb לא תקין" }, JSON.stringify(bad));
  }
});
