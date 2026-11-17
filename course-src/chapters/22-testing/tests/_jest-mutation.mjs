// כמו checkSpec של tools/mutation.mjs, אבל הבדיקות שלך כתובות ב־Jest (שיעור 4): הן רצות עם Jest ו־ts-jest,
// על הקוד התקין (חייבות לעבור) ועל כל מוטנט (חייבות להיכשל). files/<id>/mutants.json — אותו פורמט.
// לא צריך להבין את הקובץ הזה.
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { target } from "../../tools/load.mjs";

const CONFIG = JSON.stringify({
  transform: { "^.+\\.ts$": ["ts-jest", { tsconfig: { isolatedModules: true, module: "commonjs", target: "es2022", esModuleInterop: true } }] },
  testEnvironment: "node",
  testRegex: "\\.spec\\.ts$",
  moduleFileExtensions: ["ts", "js", "json"],
});

function tail(text, lines = 25) {
  return text.split("\n").filter((l) => !/^\s+at /.test(l)).slice(-lines).join("\n");
}

export function checkJestSpec(testUrl, id, specFile = `${id}.spec.ts`) {
  const chapterDir = path.join(path.dirname(fileURLToPath(testUrl)), "..");
  const filesDir = path.join(chapterDir, "files", id);
  const config = JSON.parse(fs.readFileSync(path.join(filesDir, "mutants.json"), "utf8"));
  const spec = target(testUrl, specFile);
  if (!fs.existsSync(spec)) throw new Error(`לא נמצא ${spec}`);
  const text = fs.readFileSync(spec, "utf8");
  if (!/\b(it|test)(\.each)?\s*[(`[]/.test(text)) assert.fail(`ב־${specFile} אין בדיקות (it(...) או test(...)) — כתוב בדיקות ב־Jest`);
  const correct = fs.readFileSync(path.join(filesDir, config.subject), "utf8");
  const jest = path.join(path.dirname(createRequire(testUrl).resolve("jest/package.json")), "bin", "jest.js");
  const work = path.join(chapterDir, ".build", "jest-mutation", `${id}-${process.pid}`);

  const run = (code) => {
    fs.rmSync(work, { recursive: true, force: true });
    fs.mkdirSync(work, { recursive: true });
    fs.copyFileSync(spec, path.join(work, specFile));
    fs.writeFileSync(path.join(work, config.subject), code);
    const r = spawnSync(process.execPath, ["--experimental-vm-modules", "--no-warnings", jest, "--ci", "--colors=false", "--rootDir", work, "--config", CONFIG], {
      cwd: work,
      encoding: "utf8",
      timeout: 60000,
      env: { ...process.env, NODE_TEST_CONTEXT: undefined, FORCE_COLOR: "0" },
    });
    return { ok: r.status === 0, output: `${r.stdout}${r.stderr}` };
  };

  try {
    const r = run(correct);
    assert.ok(r.ok, `הבדיקות שלך נכשלות על הקוד התקין — כנראה ציפית לתוצאה לא נכונה:\n\n${tail(r.output)}`);
    for (const v of config.variants ?? []) {
      let code = correct;
      for (const [from, to] of v.replace) code = code.replace(from, to);
      const rv = run(code);
      assert.ok(rv.ok, `הבדיקות שלך נכשלות על מימוש אחר שהוא תקין (${v.desc}):\n\n${tail(rv.output)}`);
    }
    const survivors = [];
    for (const m of config.mutants) {
      let code = correct;
      for (const [from, to] of m.replace) {
        if (!code.includes(from)) throw new Error(`תקלה בבודק: "${from}" לא נמצא בקוד (${m.desc})`);
        code = code.replace(from, to);
      }
      if (run(code).ok) survivors.push(m.desc);
    }
    assert.deepEqual(survivors, [], `הבדיקות שלך עוברות גם על קוד עם הבאגים האלה (${survivors.length} מתוך ${config.mutants.length}) — הוסף בדיקה שתתפוס כל אחד:\n${survivors.map((d) => `  • ${d}`).join("\n")}`);
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}
