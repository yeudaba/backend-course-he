// P25.5-E85: database זמני לבדיקות
import { randomUUID } from "node:crypto";
import mysql, { type Pool } from "mysql2/promise";

export async function withTempDatabase<T>(url: string, seedSql: string, fn: (pool: Pool) => Promise<T>): Promise<T> {
  const name = `test_${randomUUID().replaceAll("-", "").slice(0, 12)}`;
  const admin = await mysql.createConnection({ uri: url, multipleStatements: true });
  let pool: Pool | undefined;
  try {
    await admin.query(`CREATE DATABASE \`${name}\` CHARACTER SET utf8mb4`);
    pool = mysql.createPool({ uri: url, database: name, multipleStatements: true, connectionLimit: 5 });
    if (seedSql.trim()) await pool.query(seedSql);
    return await fn(pool);
  } finally {
    await pool?.end();
    await admin.query(`DROP DATABASE IF EXISTS \`${name}\``);
    await admin.end();
  }
}
