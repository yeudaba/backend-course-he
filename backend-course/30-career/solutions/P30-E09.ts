// P30-E09
// היסטוריית commits היא חלק מתיק העבודות: מראיין שפותח את ה־repo רואה "fix", "wip", "asdf" — או סיפור.
// הכללים המקובלים: שורת נושא קצרה שאומרת מה השתנה, בלי נקודה בסוף; שורה ריקה; גוף שמסביר למה
const VAGUE = /^(wip|fix(es|ed)?|update[sd]?|changes?|stuff|misc|asdf+|test|tmp|temp|\.+|commit|final|done|more)$/i;

export function lintCommit(message: string): string[] {
  const problems: string[] = [];
  const lines = message.replace(/\r\n/g, "\n").replace(/\n+$/, "").split("\n");
  const subject = (lines[0] ?? "").trim();
  if (!subject) return ["שורת נושא ריקה"];
  if (subject.length > 72) problems.push(`שורת נושא ארוכה (${subject.length} תווים, עד 72)`);
  if (/[.。]$/.test(subject)) problems.push("נקודה בסוף שורת הנושא");
  if (VAGUE.test(subject) || subject.split(/\s+/).length < 2) problems.push("שורת נושא לא אומרת מה השתנה");
  if (lines.length > 1 && lines[1].trim() !== "") problems.push("חסרה שורה ריקה בין הנושא לגוף");
  lines.slice(2).forEach((l, i) => {
    if (l.length > 100) problems.push(`שורה ${i + 3} בגוף ארוכה מ־100 תווים`);
  });
  return problems;
}
