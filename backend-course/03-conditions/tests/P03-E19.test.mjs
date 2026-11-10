import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P03-E19.js";
const ticket = (age, weekend, member) =>
  run(import.meta.url, FILE, {
    changes: [
      [/(const\s+age\s*=\s*)\d+/, `$1${age}`, "את const age = ..."],
      [/(isWeekend\s*=\s*)(true|false)/, `$1${weekend}`, "את const isWeekend = ..."],
      [/(isMember\s*=\s*)(true|false)/, `$1${member}`, "את const isMember = ..."],
    ],
  });

test("גמלאי בסופ״ש, חבר מועדון", () => {
  sameOutput(run(import.meta.url, FILE), ["גיל 70, סופ״ש, חבר מועדון", "מחיר בסיס: 25", "תוספת סופ״ש: 0", "הנחת מועדון: 5.00", "לתשלום: 20.00"]);
});

test("גיל 30 בסופ״ש, לא חבר", () => {
  sameOutput(ticket(30, true, false), ["גיל 30, סופ״ש, לא חבר", "מחיר בסיס: 45", "תוספת סופ״ש: 10", "הנחת מועדון: 0.00", "לתשלום: 55.00"]);
});

test("גיל 10 באמצע שבוע, חבר מועדון", () => {
  sameOutput(ticket(10, false, true), ["גיל 10, אמצע שבוע, חבר מועדון", "מחיר בסיס: 30", "תוספת סופ״ש: 0", "הנחת מועדון: 6.00", "לתשלום: 24.00"]);
});

test("גבולות הגיל: 12, 13, 64, 65", () => {
  for (const [age, base] of [
    [12, 30],
    [13, 45],
    [64, 45],
    [65, 25],
  ]) {
    sameOutput(ticket(age, false, false), [`גיל ${age}, אמצע שבוע, לא חבר`, `מחיר בסיס: ${base}`, "תוספת סופ״ש: 0", "הנחת מועדון: 0.00", `לתשלום: ${base}.00`]);
  }
});
