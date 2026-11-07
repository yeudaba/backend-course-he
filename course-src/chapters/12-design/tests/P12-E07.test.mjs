import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { Temperature } = await load(import.meta.url, "P12-E07.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P12-E07.ts"); assert.ok(r.ok, r.output); });
test("fromFahrenheit ו־fahrenheit", () => { assert.equal(Temperature.fromFahrenheit(212).celsius, 100); assert.equal(new Temperature(21.5).fahrenheit, 70.7); });
test("isFreezing ו־toString", () => { assert.equal(new Temperature(0).isFreezing(), true); assert.equal(String(new Temperature(21.5)), "21.5°C"); });
test("אפס מוחלט", () => { assert.throws(() => new Temperature(-300), RangeError); assert.throws(() => Temperature.fromFahrenheit(-500), { message: "מתחת לאפס המוחלט" }); });
