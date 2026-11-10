import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P02-E13.js";
const withTotal = (n) => run(import.meta.url, FILE, { changes: [[/(totalItems\s*=\s*)47\b/, `$1${n}`, "את const totalItems = 47"]] });

test("47 תוצאות, 10 בעמוד", () => {
  sameOutput(run(import.meta.url, FILE), ["סה״כ תוצאות: 47", "עמודים: 5", "תוצאות בעמוד האחרון: 7", "עמוד 3 מציג את תוצאות 21 עד 30"]);
});

test("50 תוצאות — העמוד האחרון מלא (10, לא 0)", () => {
  sameOutput(withTotal(50), ["סה״כ תוצאות: 50", "עמודים: 5", "תוצאות בעמוד האחרון: 10", "עמוד 3 מציג את תוצאות 21 עד 30"]);
});

test("41 תוצאות — עמוד חמישי עם תוצאה אחת", () => {
  sameOutput(withTotal(41), ["סה״כ תוצאות: 41", "עמודים: 5", "תוצאות בעמוד האחרון: 1", "עמוד 3 מציג את תוצאות 21 עד 30"]);
});

test("גודל עמוד 20 — 3 עמודים, ועמוד 3 מתחיל ב־41", () => {
  const r = run(import.meta.url, FILE, { changes: [[/(pageSize\s*=\s*)10\b/, "$120", "את const pageSize = 10"]] });
  sameOutput(r, ["סה״כ תוצאות: 47", "עמודים: 3", "תוצאות בעמוד האחרון: 7", "עמוד 3 מציג את תוצאות 41 עד 60"]);
});
