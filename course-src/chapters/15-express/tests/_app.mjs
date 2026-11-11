// עוזר לבדיקות של שאלות התרגול: מפעיל את האפליקציה שלך על פורט פנוי, ומחזיר פונקציה לשליחת בקשות.
// לא צריך להבין את הקובץ הזה עכשיו — נלמד על בדיקות בפרק 22.
import assert from "node:assert/strict";
import { listen, api } from "../../tools/load.mjs";
import { exportsOf, typecheck } from "./_ts.mjs";

export async function startApp(t, testUrl, file, ...args) {
  const { createApp } = await exportsOf(testUrl, file, ["createApp"]);
  const { base, close } = await listen(createApp(...args));
  t.after(close);
  const call = api(base);
  call.base = base;
  return call;
}

export function typesOk(testUrl, file) {
  const r = typecheck(testUrl, file);
  assert.ok(r.ok, r.output);
}
