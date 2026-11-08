// ספקי מסד בענן (Neon ודומיו) נותנים connection string עם ?sslmode=require.
// ה־Prisma CLI (migrate) מבין אותו. אבל ה־driver בזמן ריצה (pg) מדפיס עליו SECURITY WARNING,
// כי אצלו require = verify-full. אז בזמן ריצה מוציאים את sslmode מהכתובת ואומרים ל־pg במפורש:
// TLS, עם בדיקת תעודה (פרק 25, שיעור 2).
export function pgConnectionOptions(url: string): { connectionString: string; ssl?: { rejectUnauthorized: boolean } } {
  if (!url) return { connectionString: url }; // בלי מסד (למשל בדיקת עשן של ה־image) — Prisma מתחבר רק בשאילתה הראשונה
  const u = new URL(url);
  const mode = u.searchParams.get("sslmode");
  u.searchParams.delete("sslmode");
  u.searchParams.delete("channel_binding");
  if (!mode || mode === "disable") return { connectionString: u.toString() };
  return { connectionString: u.toString(), ssl: { rejectUnauthorized: true } };
}
