// P25-E11
function parse(url: string): URL {
  try {
    const u = new URL(url);
    if (!/^postgres(ql)?:$/.test(u.protocol)) throw new Error();
    return u;
  } catch {
    // בלי הכתובת עצמה בהודעה: יש בה סיסמה, והודעות שגיאה מגיעות ללוגים
    throw new Error("DATABASE_URL לא תקין (צריך postgresql://user:password@host:port/db)");
  }
}

export function redactDatabaseUrl(url: string): string {
  const u = parse(url);
  if (u.password) u.password = "***";
  return u.toString();
}

export function describeDb(url: string) {
  const u = parse(url);
  const sslmode = u.searchParams.get("sslmode");
  return {
    host: u.hostname,
    port: Number(u.port || 5432),
    database: decodeURIComponent(u.pathname.slice(1)),
    user: decodeURIComponent(u.username),
    ssl: sslmode !== null && sslmode !== "disable",
  };
}
