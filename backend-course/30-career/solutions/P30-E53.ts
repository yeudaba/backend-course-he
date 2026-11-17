// P30-E53: נקודה בקורות החיים — בדיקה מהירה
const VERBS = new Set(["built", "designed", "implemented", "added", "cut", "reduced", "improved", "prevented", "migrated", "wrote", "tested", "deployed", "automated", "replaced", "fixed", "measured"]);

export function bulletIssues(bullet: string): string[] {
  const issues: string[] = [];
  const text = bullet.trim();
  const words = text.split(/\s+/).filter(Boolean);
  if (/^(responsible for|worked on|worked with|helped|participated in|assisted)\b/i.test(text)) issues.push("weak_start");
  else if (!VERBS.has((words[0] ?? "").toLowerCase().replace(/[^a-z]/g, ""))) issues.push("no_verb");
  if (!/\d/.test(text)) issues.push("no_number");
  if (words.length > 30) issues.push("too_long");
  return issues;
}
