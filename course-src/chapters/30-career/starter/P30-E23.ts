// P30-E23: "קיבלתי תזכורת לשלוח מייל לחברה שכבר דחתה אותי, ובתחילת החודש לא קיבלתי אף תזכורת" — שלוש תקלות
export interface Application {
  company: string;
  stage: "applied" | "screen" | "interview" | "offer" | "rejected";
  appliedAt: string;
  lastUpdate: string;
}

export function followUps(apps: readonly Application[], now: Date, days = 7): string[] {
  return apps
    .filter((a) => now.getDate() - new Date(a.appliedAt).getDate() >= days)
    .sort((a, b) => Date.parse(a.lastUpdate) - Date.parse(b.lastUpdate))
    .map((a) => a.company);
}
