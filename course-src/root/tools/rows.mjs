// עוזר לבודקי SQL (PostgreSQL, ‏MySQL, ‏DuckDB): משווה את השורות שלך לשורות של הפתרון לדוגמה,
// ואם יש הבדל — נותן רמז (מה חסר, מה עודף, איפה הסדר שגוי), בלי להציג את כל התשובה.
// לא צריך להבין את הקובץ הזה עכשיו — נלמד על בדיקות בפרק 22.
import assert from "node:assert/strict";
import { isDeepStrictEqual } from "node:util";

const norm = (v) => (typeof v === "bigint" ? Number(v) : v instanceof Date ? v.toISOString() : v);
const key = (row, cols) => JSON.stringify(cols.map((c) => norm(row[c])));
const show = (v) => (typeof v === "string" ? `'${v}'` : JSON.stringify(norm(v)) ?? String(v));
const showRow = (row, cols) => `{ ${cols.map((c) => `${c}: ${show(row[c])}`).join(", ")} }`;
const rowsWord = (n) => (n === 1 ? "שורה אחת" : `${n} שורות`);

function multisetDiff(a, b) {
  const counts = new Map();
  for (const k of b) counts.set(k, (counts.get(k) ?? 0) + 1);
  const left = [];
  for (const [i, k] of a.entries()) {
    if (counts.get(k)) counts.set(k, counts.get(k) - 1);
    else left.push(i);
  }
  return left; // אינדקסים ב־a שאין להם זוג ב־b
}

// מחזיר null אם השורות זהות, אחרת רמז בשורה אחת. ordered=false ← הסדר לא נבדק
export function rowsHint(got, expected, { gotColumns, expectedColumns, ordered = true } = {}) {
  const expCols = expectedColumns ?? Object.keys(expected[0] ?? got[0] ?? {});
  const gotCols = gotColumns ?? (got.length ? Object.keys(got[0]) : expCols);
  if (!isDeepStrictEqual(gotCols, expCols)) {
    const missing = expCols.filter((c) => !gotCols.includes(c));
    const extra = gotCols.filter((c) => !expCols.includes(c));
    if (!missing.length && !extra.length) return `העמודות נכונות אבל הסדר שלהן לא: ציפינו ל־(${expCols.join(", ")}), קיבלנו (${gotCols.join(", ")})`;
    return `שמות העמודות: ציפינו ל־(${expCols.join(", ")}), קיבלנו (${gotCols.join(", ")})${missing.length ? `. חסרה: ${missing.join(", ")}` : ""}${extra.length ? `. מיותרת: ${extra.join(", ")}` : ""}`;
  }
  const g = got.map((r) => key(r, expCols));
  const e = expected.map((r) => key(r, expCols));
  if (isDeepStrictEqual(g, e)) return null;
  const extra = multisetDiff(g, e);
  const missing = multisetDiff(e, g);
  if (!extra.length && !missing.length) {
    if (!ordered) return null;
    const i = g.findIndex((k, j) => k !== e[j]);
    return `כל השורות נכונות, אבל הסדר שלהן שגוי — החל משורה ${i + 1} (קיבלנו שם ${showRow(got[i], expCols)}). בדוק את ORDER BY`;
  }
  // אותו מספר שורות, ורק עמודה אחת או שתיים שונות באותה שורה ← כנראה חישוב שגוי בעמודה
  if (got.length === expected.length && extra.length === missing.length) {
    const i = g.findIndex((k, j) => k !== e[j]);
    const diff = expCols.filter((c) => !isDeepStrictEqual(norm(got[i][c]), norm(expected[i][c])));
    if (diff.length && diff.length < expCols.length) {
      const bad = got.filter((r, j) => g[j] !== e[j]).length;
      return `העמודה ${diff[0]} שונה מהצפוי בשורה ${i + 1} (קיבלנו ${show(got[i][diff[0]])} בשורה ${showRow(got[i], expCols)})${bad > 1 ? `. בסך הכול ${bad} שורות שונות` : ""}`;
    }
  }
  const parts = [];
  if (missing.length) parts.push(`חסרות ${rowsWord(missing.length)}`.replace("חסרות שורה אחת", "חסרה שורה אחת"));
  if (extra.length) parts.push(`יש ${rowsWord(extra.length)} שלא אמורות להופיע`.replace("שורה אחת שלא אמורות", "שורה אחת שלא אמורה"));
  return `${parts.join(" ו")} (קיבלנו ${rowsWord(got.length)})${extra.length ? `. למשל ${showRow(got[extra[0]], expCols)}` : ". בדוק את תנאי ה־WHERE / JOIN"}`;
}

// assert שמציג רמז במקום "ציפינו: <כל השורות>"
export function assertSameRows(got, expected, label = "", options = {}) {
  const hint = rowsHint(got ?? [], expected, options);
  if (hint) assert.fail(label ? `${label}: ${hint}` : hint);
}

// מפצל קובץ SQL לפקודות (מתעלם מ־; בתוך מחרוזות, הערות ו־$$...$$)
export function splitSql(text) {
  const out = [];
  let cur = "";
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === "-" && text[i + 1] === "-") {
      const end = text.indexOf("\n", i);
      i = end === -1 ? text.length : end;
      continue;
    }
    if (c === "/" && text[i + 1] === "*") {
      const end = text.indexOf("*/", i + 2);
      i = end === -1 ? text.length : end + 2;
      continue;
    }
    if (c === "'" || c === '"') {
      let j = i + 1;
      while (j < text.length && !(text[j] === c && text[j + 1] !== c)) j += text[j] === c ? 2 : 1;
      cur += text.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    if (c === "$") {
      const m = /^\$\w*\$/.exec(text.slice(i));
      if (m) {
        const end = text.indexOf(m[0], i + m[0].length);
        const stop = end === -1 ? text.length : end + m[0].length;
        cur += text.slice(i, stop);
        i = stop;
        continue;
      }
    }
    if (c === ";") {
      if (cur.trim()) out.push(cur.trim());
      cur = "";
      i++;
      continue;
    }
    cur += c;
    i++;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

// קובץ variants: קטעים שמתחילים בשורה "-- @variant" (מה שלפני הקטע הראשון — הערות)
export function parseVariants(text) {
  const parts = text.split(/^--\s*@variant.*$/m).slice(1);
  return parts.map((p) => p.trim()).filter(Boolean);
}
