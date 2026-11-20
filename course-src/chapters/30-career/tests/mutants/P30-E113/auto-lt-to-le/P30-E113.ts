// P30-E113: טיוטה להודעת מעקב
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function followUpDraft(app: { company: string; role: string; appliedOn: string; contact?: string }, today: string): string | null {
  const days = (Date.parse(today) - Date.parse(app.appliedOn)) / 86_400_000;
  if (days <= 7) return null;
  const [y, m, d] = app.appliedOn.split("-").map(Number);
  const date = `${d} ${MONTHS[m - 1]} ${y}`;
  return [`Hi ${app.contact ?? "there"},`, `I applied for the ${app.role} role at ${app.company} on ${date} and wanted to follow up — I'm still very interested.`, "Thanks!"].join("\n");
}
