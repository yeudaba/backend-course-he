import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P02-E23-receipt.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["3 x מחברת = 36", "2 x עט = 14", "משלוח: 15", "סה״כ לתשלום: 65"]);
});

test("עובד גם עם כמויות ומחירים אחרים", () => {
  const r = run(import.meta.url, FILE, {
    changes: [
      [/penQty = 2\b/, "penQty = 4", "את השורה penQty = 2"],
      [/notebookPrice = 12\b/, "notebookPrice = 10", "את השורה notebookPrice = 12"],
    ],
  });
  sameOutput(r, ["3 x מחברת = 30", "4 x עט = 28", "משלוח: 15", "סה״כ לתשלום: 73"]);
});
