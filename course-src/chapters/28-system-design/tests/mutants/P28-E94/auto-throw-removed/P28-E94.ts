// P28-E94: ADR בקובץ
const STATUSES = ["proposed", "accepted", "superseded", "rejected"];

export function adrMarkdown(r: { number: number; title: string; status: string; date: string; context: string; decision: string; consequences: string[] }): string {
  if (!STATUSES.includes(r.status)) throw new Error(`סטטוס לא מוכר: ${r.status}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date)) throw new Error(`תאריך לא תקין: ${r.date}`);

  if (r.consequences.length === 0) throw new Error("צריך לפחות השלכה אחת");
  const lines = [
    `# ADR-${String(r.number).padStart(4, "0")}: ${r.title.trim()}`,
    "",
    `- סטטוס: ${r.status}`,
    `- תאריך: ${r.date}`,
    "",
    "## הקשר",
    r.context,
    "",
    "## החלטה",
    r.decision,
    "",
    "## השלכות",
    ...r.consequences.map((c) => `- ${c}`),
    "",
  ];
  return lines.join("\n");
}
