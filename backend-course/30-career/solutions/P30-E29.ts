// P30-E29
// עובר על diff (הפורמט של git diff) שעוזר AI הציע, ומסמן שינויים שחייבים עין אנושית
export interface Finding {
  file: string;
  line: number; // בשורה שנוספה — מספר השורה בקובץ החדש; בשורה שנמחקה — בקובץ הישן
  rule: "test-disabled" | "assertion-removed" | "new-dependency" | "dangerous-eval" | "type-escape";
}

export function reviewDiff(diff: string): Finding[] {
  const findings: Finding[] = [];
  let file = "";
  let oldLine = 0;
  let newLine = 0;
  for (const raw of diff.split("\n")) {
    if (raw.startsWith("diff --git")) continue;
    if (raw.startsWith("+++ ")) {
      file = raw.slice(4).replace(/^b\//, "");
      continue;
    }
    if (raw.startsWith("--- ")) continue;
    const hunk = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(raw);
    if (hunk) {
      oldLine = +hunk[1];
      newLine = +hunk[2];
      continue;
    }
    if (!file) continue;
    const add = (rule: Finding["rule"], line: number) => findings.push({ file, line, rule });
    if (raw.startsWith("+")) {
      const code = raw.slice(1);
      // AI "מתקן" בדיקה שנכשלת בכך שהוא מכבה אותה
      if (/\b(?:test|it|describe)\.(?:skip|only)\s*\(/.test(code)) add("test-disabled", newLine);
      if (/\beval\s*\(|\bnew Function\s*\(/.test(code)) add("dangerous-eval", newLine);
      if (/@ts-ignore|@ts-expect-error|\bas any\b/.test(code)) add("type-escape", newLine);
      // חבילה חדשה: לבדוק שהיא קיימת, מי מתחזק אותה, ושבאמת צריך אותה
      if (/(^|\/)package\.json$/.test(file) && /^\s*"(?!version")[^"]+"\s*:\s*"[\^~>=<]*\d/.test(code)) add("new-dependency", newLine);
      newLine++;
    } else if (raw.startsWith("-")) {
      // בדיקה שאיבדה assertion — "עוברת" כי היא כבר לא בודקת כלום
      if (/\bassert\b|\bexpect\s*\(/.test(raw.slice(1))) add("assertion-removed", oldLine);
      oldLine++;
    } else {
      oldLine++;
      newLine++;
    }
  }
  return findings;
}
