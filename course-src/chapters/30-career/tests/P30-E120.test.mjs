import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { parseTrackerCsv } = await load(import.meta.url, "P30-E120.ts");

test("פירוק, מרכאות, שגיאות", () => {
  const csv = [
    "stage,company,notes,applied_on,role",
    'screen,"Acme, Inc.","said ""call me""",2026-11-03,Junior Backend',
    "applied,Brew Labs,,2026-11-04,Backend Developer",
    "",
    "applied,,x,2026-11-05,Dev",
    "interview,Cartly,x,2026-02-30,Dev",
    "hired,Datafy,x,2026-11-06,Dev",
    "applied,Edge,x,2026-11-07",
    '  offer , " Fintrix " ,  , 2026-11-08 , "Backend, Payments" ',
  ].join("\r\n");
  assert.deepEqual(parseTrackerCsv(csv), {
    rows: [
      { company: "Acme, Inc.", role: "Junior Backend", appliedOn: "2026-11-03", stage: "screen" },
      { company: "Brew Labs", role: "Backend Developer", appliedOn: "2026-11-04", stage: "applied" },
      { company: "Fintrix", role: "Backend, Payments", appliedOn: "2026-11-08", stage: "offer" },
    ],
    errors: [
      { line: 5, message: "company ריק" },
      { line: 6, message: "תאריך לא תקין: 2026-02-30" },
      { line: 7, message: "שלב לא מוכר: hired" },
      { line: 8, message: "4 שדות, צריך 5" },
    ],
  });
});
test("כותרות", () => {
  assert.throws(() => parseTrackerCsv("company,role,stage\nA,B,applied"), Error);
  assert.throws(() => parseTrackerCsv(""), Error);
  assert.deepEqual(parseTrackerCsv("company,role,applied_on,stage\n"), { rows: [], errors: [] });
});
