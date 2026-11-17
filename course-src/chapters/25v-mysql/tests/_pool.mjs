// pool "רגיל" של mysql2 (בלי decimalNumbers/dateStrings) על ה־database של הבדיקה
import mysql from "mysql2/promise";
export function plainPool(t, db, limit = 5) {
  const pool = mysql.createPool({ uri: db.url, connectionLimit: limit });
  t.after(() => pool.end());
  return pool;
}
export const busy = (pool) => pool.pool._allConnections.length - pool.pool._freeConnections.length;
