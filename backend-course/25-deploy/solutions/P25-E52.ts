// P25-E52: CORS_ORIGINS — מחמיר בפרודקשן
export function parseCorsOrigins(value: string | undefined, nodeEnv: "development" | "test" | "production"): string[] {
  const list = [...new Set((value ?? "").split(",").map((s) => s.trim()).filter(Boolean))];
  if (list.length === 0) {
    if (nodeEnv === "production") throw new Error("CORS_ORIGINS חובה בפרודקשן");
    return ["http://localhost:5500"];
  }
  const valid = nodeEnv === "production" ? /^https:\/\/[^/*\s]+$/ : /^https?:\/\/[^/*\s]+$/;
  const bad = list.filter((o) => !valid.test(o));
  if (bad.length) throw new Error(`CORS_ORIGINS לא תקין: ${bad.join(", ")}`);
  return list;
}
