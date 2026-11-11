import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P03-E26.js";
const at = (hour, isSaturday = false) =>
  run(import.meta.url, FILE, {
    changes: [
      [/(hour\s*=\s*)14\b/, `$1${hour}`, "את השורה const hour = 14;"],
      [/(isSaturday\s*=\s*)false\b/, `$1${isSaturday}`, "את השורה const isSaturday = false;"],
    ],
  });

test("14:00 ביום חול — פתוח, נסגר בעוד 6 שעות", () => sameOutput(run(import.meta.url, FILE), ["14:00 — פתוח (נסגר בעוד 6 שעות)"]));
test("8:00 — פותחים בדיוק", () => sameOutput(at(8), ["8:00 — פתוח (נסגר בעוד 12 שעות)"]));
test("19:00 — נסגר בעוד שעה (לא '1 שעות')", () => sameOutput(at(19), ["19:00 — פתוח (נסגר בעוד שעה)"]));
test("20:00 — כבר סגור", () => sameOutput(at(20), ["20:00 — סגור"]));
test("7:00 — עוד סגור", () => sameOutput(at(7), ["7:00 — סגור"]));
test("שבת — סגור, גם ב־14:00", () => sameOutput(at(14, true), ["שבת — סגור"]));
