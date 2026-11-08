// P19.5-E19
import type { Pool } from "mysql2/promise";

// כלי migrations בקטן. שני דברים שמיוחדים ל־MySQL:
// (1) DDL עושה COMMIT מרומז — אי אפשר לעטוף CREATE/ALTER בטרנזקציה ולבטל. migration שנכשל באמצע — נשאר באמצע.
// (2) GET_LOCK: נעילה בשם, לכל השרתים — כך שני שרתים שעולים יחד לא מריצים את אותו migration פעמיים
export async function migrate(pool: Pool, migrations: readonly { id: string; sql: string }[], { lockTimeoutSeconds = 10 } = {}): Promise<string[]> {
  const conn = await pool.getConnection();
  try {
    const [[lock]] = await conn.query<any[]>("SELECT GET_LOCK('schema_migrations', ?) AS ok", [lockTimeoutSeconds]);
    if (lock.ok !== 1) throw new Error("לא התקבלה נעילה ל־migrations");
    try {
      await conn.query("CREATE TABLE IF NOT EXISTS schema_migrations (id VARCHAR(100) PRIMARY KEY, applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3))");
      const [done] = await conn.query<any[]>("SELECT id FROM schema_migrations");
      const applied = new Set(done.map((r) => r.id));
      const ran: string[] = [];
      for (const m of [...migrations].sort((a, b) => (a.id < b.id ? -1 : 1))) {
        if (applied.has(m.id)) continue;
        await conn.query(m.sql);
        await conn.execute("INSERT INTO schema_migrations (id) VALUES (?)", [m.id]);
        ran.push(m.id);
      }
      return ran;
    } finally {
      await conn.query("SELECT RELEASE_LOCK('schema_migrations')");
    }
  } finally {
    conn.release();
  }
}
