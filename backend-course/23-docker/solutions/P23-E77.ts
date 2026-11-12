// P23-E77: DATABASE_URL — עם קידוד
export type DbConfig = { user: string; password: string; host: string; port: number; database: string };

export function toDatabaseUrl(c: DbConfig): string {
  const e = encodeURIComponent;
  return `postgresql://${e(c.user)}:${e(c.password)}@${c.host}:${c.port}/${e(c.database)}`;
}

export function parseDatabaseUrl(url: string): DbConfig {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    throw new Error("DATABASE_URL לא תקין");
  }
  const database = decodeURIComponent(u.pathname.slice(1));
  if (!["postgresql:", "postgres:"].includes(u.protocol) || !database) throw new Error("DATABASE_URL לא תקין");
  return {
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    host: u.hostname,
    port: u.port ? Number(u.port) : 5432,
    database,
  };
}
