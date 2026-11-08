// P30-E23
export interface Application {
  company: string;
  stage: "applied" | "screen" | "interview" | "offer" | "rejected";
  appliedAt: string;
  lastUpdate: string;
}

export function followUps(apps: readonly Application[], now: Date, days = 7): string[] {
  return apps
    // תקלה 1: לא סיננו לפי stage ← "תזכורת" לחברה שכבר דחתה, או שכבר בראיון
    .filter((a) => a.stage === "applied")
    // תקלה 2: היה appliedAt ← מועמדות שקיבלה תגובה אתמול "צריכה מעקב"; מה שקובע הוא העדכון האחרון
    // תקלה 3: היה new Date(a.lastUpdate).getDate() — יום בחודש. ב־1 לחודש, עדכון מ־28 לחודש הקודם "חדש"
    .filter((a) => now.getTime() - Date.parse(a.lastUpdate) >= days * 86_400_000)
    .sort((a, b) => Date.parse(a.lastUpdate) - Date.parse(b.lastUpdate))
    .map((a) => a.company);
}
