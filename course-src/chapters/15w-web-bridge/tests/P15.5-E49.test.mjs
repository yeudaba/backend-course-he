import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const mod = () => exportsOf(import.meta.url, "P15.5-E49.mjs", ["luminance", "contrast", "readable"]);
test("luminance", async () => {
  const { luminance } = await mod();
  assert.equal(luminance("#000000"), 0);
  assert.ok(Math.abs(luminance("#ffffff") - 1) < 1e-9);
  assert.ok(Math.abs(luminance("#fff") - 1) < 1e-9, "#rgb מקוצר");
  assert.ok(Math.abs(luminance("#808080") - 0.2158605) < 1e-6, "#808080 ≈ 0.2159 (עם ההמרה, לא 0.5)");
  assert.ok(Math.abs(luminance("#ff0000") - 0.2126) < 1e-9);
  assert.ok(Math.abs(luminance("#0a0a0a") - 0.0030353) < 1e-6, "ערכים קטנים — s / 12.92");
});
test("contrast ו־readable", async () => {
  const { contrast, readable } = await mod();
  assert.equal(contrast("#000", "#fff"), 21);
  assert.equal(contrast("#fff", "#000"), 21, "הסדר לא משנה");
  assert.equal(contrast("#fff", "#fff"), 1);
  assert.equal(contrast("#777777", "#ffffff"), 4.48);
  assert.equal(contrast("#767676", "#ffffff"), 4.54);
  assert.equal(contrast("#0969da", "#ffffff"), 5.19);
  assert.equal(readable("#767676", "#fff"), true);
  assert.equal(readable("#777777", "#fff"), false, "4.48 < 4.5");
  assert.equal(readable("#000", "#000"), false);
});
