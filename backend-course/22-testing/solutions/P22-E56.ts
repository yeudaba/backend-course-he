// P22-E56: createTestDatabase — schema זמני לכל קובץ בדיקות
import { randomBytes } from "node:crypto";
import pg from "pg";

export async function createTestDatabase(url: string | undefined, migrations: string[]) {
  if (!url) throw new Error("חסר DATABASE_URL_TEST");
  const schema = `test_${randomBytes(4).toString("hex")}`;
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  await client.query(`CREATE SCHEMA "${schema}"`);
  await client.query(`SET search_path TO "${schema}"`);
  for (const sql of migrations) await client.query(sql);
  return {
    schema,
    client,
    async reset(tables: string[]) {
      await client.query(`TRUNCATE ${tables.join(", ")} RESTART IDENTITY CASCADE`);
    },
    async close() {
      await client.query(`DROP SCHEMA "${schema}" CASCADE`);
      await client.end();
    },
  };
}
