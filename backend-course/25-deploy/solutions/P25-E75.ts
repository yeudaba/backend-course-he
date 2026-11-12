// P25-E75: תעודה שעומדת לפוג
const DAY = 86_400_000;

export function parseCertDates(text: string) {
  const read = (name: string) => {
    const m = new RegExp(`^${name}=(.+)$`, "m").exec(text);
    const d = m ? new Date(m[1].trim()) : new Date(NaN);
    if (Number.isNaN(d.getTime())) throw new Error("פלט לא תקין");
    return d;
  };
  return { notBefore: read("notBefore"), notAfter: read("notAfter") };
}

export function certStatus(notAfter: Date, now: Date, warnDays = 21) {
  const ms = notAfter.getTime() - now.getTime();
  const daysLeft = Math.floor(ms / DAY);
  const status = ms <= 0 ? "expired" : daysLeft < warnDays ? "warn" : "ok";
  return { daysLeft, status } as { daysLeft: number; status: "ok" | "warn" | "expired" };
}

const { notAfter } = parseCertDates("notBefore=Nov  7 12:00:00 2026 GMT\nnotAfter=Feb  5 12:00:00 2027 GMT");
for (const now of ["2026-12-01T00:00:00Z", "2027-01-20T12:00:00Z", "2027-02-05T12:00:00Z"]) console.log(now.slice(0, 10), certStatus(notAfter, new Date(now)));
