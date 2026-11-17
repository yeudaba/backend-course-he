// עוזר לבודקים של קובצי SQL ביחידה 25.5: מריץ את הקובץ שלך ואת הפתרון לדוגמה, כל אחד על database נקי משלו
// עם אותם נתונים (ועם תוספת נתונים — כדי שתשובה "קבועה" לא תעבור), ומחזיר את שתי התוצאות להשוואה.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mysqlSandbox } from "../../tools/mysql.mjs";

function lastResult(result, fields) {
  if (Array.isArray(fields) && fields.some((f) => Array.isArray(f) || f === undefined)) {
    for (let i = result.length - 1; i >= 0; i--) if (Array.isArray(result[i])) return result[i];
    return result[result.length - 1];
  }
  return result;
}

export async function sameAsSolution(t, testUrl, file, { seed = "shop.sql", extra = "" } = {}) {
  const mine = await mysqlSandbox(t, testUrl, seed);
  const ref = await mysqlSandbox(t, testUrl, seed);
  if (extra) {
    await mine.query(extra);
    await ref.query(extra);
  }
  const got = await mine.runFile(file);
  const text = fs.readFileSync(path.join(path.dirname(fileURLToPath(testUrl)), "..", "solutions", file), "utf8");
  const [result, fields] = await ref.conn.query(text);
  return { got, expected: lastResult(result, fields), mine, ref };
}
