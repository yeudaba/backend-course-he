import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P02-E09.js";

test("ראשי תיבות ושם מלא", () => {
  sameOutput(run(import.meta.url, FILE), ["ראשי תיבות: D.L.", "שם מלא: Dana Levi"]);
});

test("האותיות הגדולות נוצרות בקוד (עם שם אחר)", () => {
  const r = run(import.meta.url, FILE, {
    changes: [
      [/(["'`])dana\1/, '"yoav"', 'את "dana"'],
      [/(["'`])levi\1/, '"mizrahi"', 'את "levi"'],
    ],
  });
  sameOutput(r, ["ראשי תיבות: Y.M.", "שם מלא: Yoav Mizrahi"]);
});
