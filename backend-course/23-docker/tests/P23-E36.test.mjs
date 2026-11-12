import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P23-E36.ts", ["toOctal", "fromOctal"]);

test("toOctal", async () => {
  const { toOctal } = await get();
  for (const [p, o] of [["-rwxr-xr-x", "755"], ["-rw-------", "600"], ["drwx------", "700"], ["-rw-r-----", "640"], ["----------", "000"], ["lrwxrwxrwx", "777"], ["-r--r--r--", "444"], ["--wx-w---x", "321"]]) {
    assert.equal(toOctal(p), o, p);
  }
  for (const bad of ["rwxr-xr-x", "-rwxr-xr-xx", "-rwxr-xr-y", "-wrxr-xr-x", "x---------", ""]) assert.throws(() => toOctal(bad), { message: `הרשאות לא תקינות: ${bad}` });
});
test("fromOctal", async () => {
  const { fromOctal } = await get();
  for (const [o, p] of [["755", "rwxr-xr-x"], ["640", "rw-r-----"], ["600", "rw-------"], ["000", "---------"], ["777", "rwxrwxrwx"], ["321", "-wx-w---x"]]) assert.equal(fromOctal(o), p, o);
  for (const bad of ["75", "7555", "758", "abc", ""]) assert.throws(() => fromOctal(bad), { message: `מספר לא תקין: ${bad}` });
});
test("הלוך ושוב", async () => {
  const { toOctal, fromOctal } = await get();
  for (let n = 0; n < 512; n += 37) {
    const o = n.toString(8).padStart(3, "0");
    assert.equal(toOctal("-" + fromOctal(o)), o);
  }
});
