// עוזר לבדיקות של שאלות ה־schema בתרגול (E36 ואילך): ה־schema שלך ← SQL ← schema זמני במסד, ותיאור העמודות.
// לא צריך להבין את הקובץ הזה עכשיו — נלמד על בדיקות בפרק 22.
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { schemaToSql } from "./_schema.mjs";

const cache = new Map();
export function sqlOf(testUrl, file) {
  if (!cache.has(file)) cache.set(file, schemaToSql(testUrl, file));
  return cache.get(file);
}

// db עם הטבלאות מה־schema שלך
export async function fromSchema(t, testUrl, file) {
  const s = sqlOf(testUrl, file);
  assert.ok(s.ok, s.output);
  const db = await sandbox(t, testUrl);
  await db.query(s.sql);
  return db;
}

// { column: "type NOT NULL DEFAULT ..." } — לפי information_schema
export async function columns(db, table) {
  const rows = await db.rows(
    `SELECT column_name, data_type, numeric_precision, numeric_scale, is_nullable, column_default
     FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = $1 ORDER BY column_name`,
    [table],
  );
  if (rows.length === 0) assert.fail(`אין טבלה בשם ${table} — בדוק את ה־@@map`);
  return Object.fromEntries(
    rows.map((r) => {
      let type = r.data_type === "numeric" ? `numeric(${r.numeric_precision},${r.numeric_scale})` : r.data_type;
      let def = r.column_default ?? "";
      if (def.startsWith("nextval(")) def = "autoincrement";
      def = def.replace(/::[a-z" ]+$/i, "").replace(/^'(.*)'$/, "$1");
      if (def === "now()" || def === "CURRENT_TIMESTAMP") def = "now";
      return [r.column_name, `${type}${r.is_nullable === "NO" ? " NOT NULL" : ""}${def ? ` DEFAULT ${def}` : ""}`];
    }),
  );
}
