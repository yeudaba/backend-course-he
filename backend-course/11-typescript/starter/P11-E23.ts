// P11-E23: החלף את ה־as בבדיקה אמיתית.
// חסר → ברירת מחדל (theme: "light", pageSize: 20)
// קיים ולא תקין (theme לא light/dark; pageSize לא שלם 1–100) → throw Error(`הגדרה לא תקינה: ${field}`)
// לא אובייקט → throw Error("הגדרה לא תקינה: root")
export type Settings = { theme: "light" | "dark"; pageSize: number };

export function loadSettings(json: string): Settings {
  const settings = JSON.parse(json) as Settings;
  return settings;
}
