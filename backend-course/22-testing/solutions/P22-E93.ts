// P22-E93: applyMigrations — לפי סדר השמות, אחת אחרי השנייה
import fs from "node:fs";
import path from "node:path";

export async function applyMigrations(client: { query(sql: string): Promise<unknown> }, dir: string): Promise<string[]> {
  const names = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(dir, e.name, "migration.sql")))
    .map((e) => e.name)
    .sort();
  if (names.length === 0) throw new Error(`אין migrations ב־${dir}`);
  for (const name of names) {
    await client.query(fs.readFileSync(path.join(dir, name, "migration.sql"), "utf8"));
  }
  return names;
}
