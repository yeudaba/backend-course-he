// זמנים: הכול נשמר ב־UTC; "יום" הוא יום בשעון ישראל (כמו בפרק 24)
const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit" });

export const israelDay = (d: Date): string => dayFmt.format(d);

// DATETIME(3) של MySQL לא מקבל "Z" — "2026-11-08 10:00:00.000"
export const mysqlUtc = (d: Date): string => d.toISOString().replace("T", " ").replace("Z", "");

export const isDay = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && new Date(`${s}T00:00:00Z`).toISOString().startsWith(s);
