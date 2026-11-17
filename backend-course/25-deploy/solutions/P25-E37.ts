// P25-E37: DATABASE_URL מתוך services
export function databaseUrlFromService(service: { env?: Record<string, string>; ports?: string[] }): string {
  const env = service.env ?? {};
  const user = env.POSTGRES_USER ?? "postgres";
  const password = env.POSTGRES_PASSWORD;
  if (!password) throw new Error("חסר POSTGRES_PASSWORD");
  const db = env.POSTGRES_DB ?? user;
  let hostPort: string | undefined;
  for (const p of service.ports ?? []) {
    const parts = String(p).split(":"); // "55432:5432" או "5432"
    if (parts.at(-1) === "5432") hostPort = parts[0];
  }
  if (!hostPort) throw new Error("השירות לא חושף את 5432");
  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@localhost:${hostPort}/${db}`;
}
