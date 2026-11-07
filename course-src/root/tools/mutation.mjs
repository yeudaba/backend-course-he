// בודק "בדיקות שהלומד כתב" (פרק 22): הבדיקות צריכות לעבור על הקוד התקין — ולהיכשל על כל "מוטנט".
// מוטנט = הקוד התקין עם באג אחד קטן. אם הבדיקות עדיין עוברות — הבאג "שרד", כלומר הבדיקות לא תופסות אותו.
//
// files/<id>/mutants.json:
//   { "subject": "P22-E06.ts",                         ← שם הקובץ שה־spec מייבא (import "./P22-E06.ts")
//     "extra": ["db-helper.ts"],                       ← (אופציונלי) קבצים נוספים מ־files/<id>/ שה־spec צריך
//     "dates": ["2026-12-31T23:30:00Z"],               ← (אופציונלי) להריץ גם כשהשעון של המחשב מזויף
//     "env": { "TZ": "Asia/Jerusalem" },               ← (אופציונלי) משתני סביבה להרצה
//     "variants": [{ "desc": "...", "replace": [["מה", "במה"]] }],   ← מימושים אחרים, תקינים — חייבים לעבור
//     "mutants":  [{ "desc": "...", "replace": [["מה", "במה"]] }] }  ← באגים — חייבים להיכשל
// והקוד התקין עצמו: files/<id>/<subject>
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { target } from "./load.mjs";

const major = Number(process.versions.node.split(".")[0]);
const tsFlags = major < 23 ? ["--experimental-strip-types", "--no-warnings"] : ["--no-warnings"];
const fakeNow = path.join(path.dirname(fileURLToPath(import.meta.url)), "fake-now.mjs");

function applyReplacements(code, replace, desc) {
  for (const [from, to] of replace) {
    if (!code.includes(from)) throw new Error(`תקלה בבודק: "${from}" לא נמצא בקוד (${desc})`);
    code = code.replace(from, to);
  }
  return code;
}

function tail(text, lines = 25) {
  return text.split("\n").filter((l) => !/^\s+at /.test(l)).slice(-lines).join("\n");
}

export function checkSpec(testUrl, id, specFile = `${id}.spec.ts`) {
  const chapterDir = path.join(path.dirname(fileURLToPath(testUrl)), "..");
  const filesDir = path.join(chapterDir, "files", id);
  const config = JSON.parse(fs.readFileSync(path.join(filesDir, "mutants.json"), "utf8"));
  const spec = target(testUrl, specFile);
  if (!fs.existsSync(spec)) throw new Error(`לא נמצא ${spec}`);
  const correct = fs.readFileSync(path.join(filesDir, config.subject), "utf8");
  // תיקייה זמנית בתוך תיקיית הפרק — כך import של חבילות (express, pg) מוצא את node_modules של הקורס
  const work = path.join(chapterDir, ".build", "mutation", `${id}-${process.pid}`);

  const run = (code, date) => {
    fs.rmSync(work, { recursive: true, force: true });
    fs.mkdirSync(work, { recursive: true });
    fs.copyFileSync(spec, path.join(work, specFile));
    for (const f of config.extra ?? []) fs.copyFileSync(path.join(filesDir, f), path.join(work, f));
    fs.writeFileSync(path.join(work, config.subject), code);
    const args = [...tsFlags, ...(date ? ["--import", fakeNow] : []), "--test", "--test-reporter=spec", path.join(work, specFile)];
    const r = spawnSync(process.execPath, args, {
      cwd: work,
      encoding: "utf8",
      timeout: 30000,
      env: { ...process.env, ...(config.env ?? {}), ...(date ? { FAKE_NOW: date } : {}), NODE_TEST_CONTEXT: undefined },
    });
    return { ok: r.status === 0, output: `${r.stdout}${r.stderr}` };
  };

  try {
    const dates = [undefined, ...(config.dates ?? [])];
    for (const date of dates) {
      const r = run(correct, date);
      assert.ok(r.ok, `הבדיקות שלך נכשלות על הקוד התקין${date ? ` (כשהשעה במחשב היא ${date})` : ""} — כנראה ציפית לתוצאה לא נכונה:\n\n${tail(r.output)}`);
    }
    for (const v of config.variants ?? []) {
      const r = run(applyReplacements(correct, v.replace, v.desc), undefined);
      assert.ok(r.ok, `הבדיקות שלך נכשלות על מימוש אחר שהוא תקין (${v.desc}) — הן בודקות "איך" ולא "מה":\n\n${tail(r.output)}`);
    }
    const survivors = [];
    for (const m of config.mutants) {
      const r = run(applyReplacements(correct, m.replace, m.desc), undefined);
      if (r.ok) survivors.push(m.desc);
    }
    assert.deepEqual(
      survivors,
      [],
      `הבדיקות שלך עוברות גם על קוד עם הבאגים האלה (${survivors.length} מתוך ${config.mutants.length}) — הוסף בדיקה שתתפוס כל אחד:\n${survivors.map((d) => `  • ${d}`).join("\n")}`,
    );
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}
