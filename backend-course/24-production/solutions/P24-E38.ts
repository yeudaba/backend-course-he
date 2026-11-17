// P24-E38: השוואת רמות לוג
export type Level = "debug" | "info" | "warn" | "error";

const ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export function parseLevel(value: string | undefined): Level {
  const v = (value ?? "").trim().toLowerCase();
  return Object.hasOwn(ORDER, v) ? (v as Level) : "info";
}

export function isEnabled(level: Level, min: Level): boolean {
  return ORDER[level] >= ORDER[min]; // מספרים — לא מחרוזות
}

console.log(parseLevel(" WARN "), parseLevel("verbose"), isEnabled("error", "info"), isEnabled("debug", "info"));
