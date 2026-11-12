// P25-E94: הכתובת של Neon — לפני שמדביקים
export function neonUrlProblems(url: string): string[] {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return ["not-a-url"];
  }
  const problems: string[] = [];
  if (u.protocol !== "postgres:" && u.protocol !== "postgresql:") problems.push("protocol");
  if (!u.password) problems.push("password");
  if (!u.hostname.endsWith(".neon.tech")) problems.push("host");
  if (!u.pathname.slice(1)) problems.push("database");
  if (u.searchParams.get("sslmode") !== "require") problems.push("sslmode");
  return problems;
}

export function shellQuote(value: string): string {
  return "'" + value.replaceAll("'", "'\\''") + "'";
}
