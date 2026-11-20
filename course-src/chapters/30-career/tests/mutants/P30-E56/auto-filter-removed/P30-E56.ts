// P30-E56: Headline — בדיקה
export function headlineIssues(headline: string): string[] {
  const h = headline.trim();
  if (!h) return ["empty"];
  const issues: string[] = [];
  if (h.length > 220) issues.push("too_long");
  if (!/backend/i.test(h)) issues.push("no_backend");
  if (/looking for|seeking|open to work|מחפש/i.test(h)) issues.push("job_seeking");
  if (h.split(/[·|,]/).map((s) => s.trim()).length > 6) issues.push("too_many_items");
  return issues;
}
