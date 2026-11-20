// עוזר לבדיקות של יחידה 28.5: DuckDB בזיכרון, עם view בשם orders על files/orders.parquet
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DuckDBInstance } from "@duckdb/node-api";
import { target } from "../../tools/load.mjs";
import { assertSameRows, parseVariants } from "../../tools/rows.mjs";

export const filesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "files");
export const ordersParquet = path.join(filesDir, "orders.parquet");

export async function duck(t) {
  const db = await DuckDBInstance.create(":memory:");
  const conn = await db.connect();
  await conn.run("SET TimeZone = 'UTC'");
  await conn.run(`CREATE VIEW orders AS SELECT * FROM read_parquet('${ordersParquet}')`);
  t.after(() => {
    conn.closeSync();
    db.closeSync();
  });
  const rows = async (sql, params) => (await conn.runAndReadAll(sql, params)).getRowObjectsJson();
  return {
    conn,
    rows,
    // מריץ את קובץ ה־SQL שלך (מ־starter) ומחזיר את השורות (מספרים כמחרוזות — כמו JSON)
    async fileRows(file) {
      const text = fs.readFileSync(target(import.meta.url.replace("_duck.mjs", "x.test.mjs"), file), "utf8");
      if (!text.replace(/--.*$/gm, "").trim()) throw new Error(`הקובץ ${file} ריק — כתוב בו את הפתרון שלך`);
      return rows(text);
    },
    async expectedRows(file) {
      return rows(fs.readFileSync(path.join(filesDir, "..", "solutions", file), "utf8"));
    },
  };
}

// הבודק הסטנדרטי לשאלות SQL ביחידה: מריץ את הקובץ שלך ואת הפתרון לדוגמה על orders.parquet, ועל כל קטע
// ב־files/orders.variants.sql (טבלה עם השורות בסדר מעורבב + שינויים). הבדל ← רמז, בלי להציג את כל התשובה.
async function runOn(text, variantSql) {
  const db = await DuckDBInstance.create(":memory:");
  const conn = await db.connect();
  try {
    await conn.run("SET TimeZone = 'UTC'");
    if (variantSql === null) await conn.run(`CREATE VIEW orders AS SELECT * FROM read_parquet('${ordersParquet}')`);
    else {
      await conn.run(`CREATE TABLE orders AS SELECT * FROM read_parquet('${ordersParquet}') ORDER BY hash(order_id)`);
      await conn.run(variantSql);
    }
    const reader = await conn.runAndReadAll(text);
    return { rows: reader.getRowObjectsJson(), columns: reader.columnNames() };
  } finally {
    conn.closeSync();
    db.closeSync();
  }
}
export async function sameAsSolution(file) {
  const mine = fs.readFileSync(target(import.meta.url.replace("_duck.mjs", "x.test.mjs"), file), "utf8");
  if (!mine.replace(/--.*$/gm, "").trim()) throw new Error(`הקובץ ${file} ריק — כתוב בו את הפתרון שלך`);
  const solution = fs.readFileSync(path.join(filesDir, "..", "solutions", file), "utf8");
  const vs = parseVariants(fs.readFileSync(path.join(filesDir, "orders.variants.sql"), "utf8"));
  const sets = [{ label: "על orders.parquet", sql: null }, ...vs.map((sql, i) => ({ label: `על נתונים נוספים שהבודק מוסיף (בדיקה נסתרת ${i + 1} מתוך ${vs.length})`, sql }))];
  for (const set of sets) {
    const got = await runOn(mine, set.sql);
    const exp = await runOn(solution, set.sql);
    assertSameRows(got.rows, exp.rows, set.label, { gotColumns: got.columns, expectedColumns: exp.columns });
  }
}
