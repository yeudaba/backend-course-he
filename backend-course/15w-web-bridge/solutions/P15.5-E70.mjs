// P15.5-E70: "היום", "מחר", "באיחור"
const day = (s) => Date.parse(s + "T00:00:00Z") / 86_400_000;

export function formatDue(dueDate, today) {
  if (dueDate === null || dueDate === undefined) return "בלי תאריך";
  const n = day(dueDate) - day(today);
  if (n === 0) return "היום";
  if (n === 1) return "מחר";
  if (n === -1) return "אתמול";
  return n > 0 ? `בעוד ${n} ימים` : `באיחור של ${-n} ימים`;
}

const today = "2026-10-24";
for (const d of ["2026-10-24", "2026-10-25", "2026-10-23", "2026-11-03", "2026-10-01", null]) console.log(d, "←", formatDue(d, today));
