// P25-E16
export interface Finding {
  line: number;
  rule: "drop-column" | "drop-table" | "rename" | "not-null-without-default" | "alter-type" | "index-without-concurrently";
  message: string;
}

// בזמן deploy, הגרסה הישנה של הקוד עדיין רצה כמה דקות מול המסד *החדש*.
// שינוי שהקוד הישן לא שורד אותו — שובר את הפרודקשן באמצע ה־deploy.
const RULES: { rule: Finding["rule"]; re: RegExp; message: string }[] = [
  { rule: "drop-column", re: /\bDROP\s+COLUMN\b/i, message: "הקוד הישן עוד קורא את העמודה. קודם deploy שמפסיק להשתמש בה, ורק בגרסה הבאה — DROP" },
  { rule: "drop-table", re: /\bDROP\s+TABLE\b/i, message: "הקוד הישן עוד משתמש בטבלה. מוחקים בשני שלבים" },
  { rule: "rename", re: /\bRENAME\s+(COLUMN\s+|TO\b)/i, message: "שינוי שם = הקוד הישן לא מוצא. מוסיפים חדש, מעתיקים, ומוחקים את הישן בהמשך" },
  { rule: "alter-type", re: /\bALTER\s+COLUMN\s+\S+\s+(SET\s+DATA\s+)?TYPE\b/i, message: "שינוי טיפוס כותב מחדש את כל הטבלה תחת נעילה" },
  { rule: "index-without-concurrently", re: /\bCREATE\s+(UNIQUE\s+)?INDEX\s+(?!CONCURRENTLY\b)/i, message: "CREATE INDEX נועל כתיבות לכל הטבלה. בטבלה גדולה — CONCURRENTLY" },
];

export function checkMigration(sql: string): Finding[] {
  const findings: Finding[] = [];
  const lines = sql.split("\n");
  lines.forEach((text, i) => {
    const code = text.replace(/--.*$/, ""); // הערות לא נחשבות
    for (const r of RULES) if (r.re.test(code)) findings.push({ line: i + 1, rule: r.rule, message: r.message });
    // NOT NULL על עמודה חדשה בלי DEFAULT: הקוד הישן מכניס שורות בלי העמודה ← נכשל
    if (/\bADD\s+COLUMN\b/i.test(code) && /\bNOT\s+NULL\b/i.test(code) && !/\bDEFAULT\b/i.test(code)) {
      findings.push({ line: i + 1, rule: "not-null-without-default", message: "עמודה חדשה NOT NULL בלי DEFAULT — ה־INSERT של הקוד הישן ייכשל" });
    }
  });
  return findings;
}
