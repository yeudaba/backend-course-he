import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P02-E24.js";

test("הקבלה מהתרגיל", () => {
  sameOutput(run(import.meta.url, FILE), [
    "MOUSE...............   89.90",
    "KEYBOARD............  249.00",
    "USB CABLE...........   19.50",
    "----------------------------",
    "SUBTOTAL............  358.40",
    "COUPON (10%)........  -35.84",
    "VAT (18%)...........   58.06",
    "TOTAL...............  380.62",
  ]);
});

test("מחיר אחר למקלדת וקופון של 20%", () => {
  const r = run(import.meta.url, FILE, {
    changes: [
      [/(price2\s*=\s*)(["'`]) 249 \2/, '$1" 100 "', 'את const price2 = " 249 "'],
      [/(couponPercent\s*=\s*)(["'`])10\2/, '$1"20"', 'את const couponPercent = "10"'],
    ],
  });
  sameOutput(r, [
    "MOUSE...............   89.90",
    "KEYBOARD............  100.00",
    "USB CABLE...........   19.50",
    "----------------------------",
    "SUBTOTAL............  209.40",
    "COUPON (20%)........  -41.88",
    "VAT (18%)...........   30.15",
    "TOTAL...............  197.67",
  ]);
});
