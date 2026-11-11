// עוזר לבדיקות של פרק 9: מריץ את סקריפט ה־Git שלך בתיקייה ריקה וזמנית, ואז בודק את המאגר שנוצר.
// לא צריך להבין את הקובץ הזה עכשיו — נלמד על בדיקות בפרק 22.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { spawnSync, execFileSync } from "node:child_process";
import { load, target } from "../../tools/load.mjs";

// הגדרות Git קבועות לבדיקה (לא נוגעות בהגדרות שלך): שם, אימייל, ענף ראשי main, בלי עורך
function gitEnv(dir) {
  const cfg = path.join(dir, "..", path.basename(dir) + ".gitconfig");
  fs.writeFileSync(cfg, "[user]\n\tname = Course Check\n\temail = check@course.local\n[init]\n\tdefaultBranch = main\n");
  return { ...process.env, GIT_CONFIG_GLOBAL: cfg, GIT_EDITOR: "true", GIT_MERGE_AUTOEDIT: "no", LANG: "C" };
}

// מריץ את הסקריפט בתיקייה ריקה. מחזיר { status, output, git(...args) }
export function runGitScript(t, testUrl, file) {
  const script = target(testUrl, file);
  if (!fs.existsSync(script)) throw new Error(`לא מצאתי את הקובץ ${file} בתיקיית starter. האם הוא נמחק או שונה שמו?`);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "p09-"));
  const env = gitEnv(dir);
  t.after(() => {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.rmSync(dir + ".gitconfig", { force: true });
  });
  const r = spawnSync("bash", [script], { cwd: dir, env, encoding: "utf8", timeout: 20000 });
  const git = (...args) => {
    try {
      return execFileSync("git", args, { cwd: dir, env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).replace(/\n$/, "");
    } catch (err) {
      return null;
    }
  };
  const read = (name) => (fs.existsSync(path.join(dir, name)) ? fs.readFileSync(path.join(dir, name), "utf8") : null);
  return { dir, status: r.status, output: (r.stdout ?? "") + (r.stderr ?? ""), git, read };
}

// הסקריפט רץ עד הסוף ויצר מאגר
export function assertRepo(run) {
  const out = run.output.trim() ? ` הפלט של הסקריפט:\n${run.output}` : " (הסקריפט לא הדפיס כלום — הוא ריק?)";
  assert.ok(run.git("rev-parse", "--git-dir") !== null, `לא נוצר מאגר Git (חסר git init?).${out}`);
  assert.ok(run.git("rev-parse", "HEAD") !== null, `אין אף commit במאגר.${out}`);
}

// טוען קובץ JS ומוודא שכל השמות יוצאו
export async function exportsOf(testUrl, file, names) {
  const mod = await load(testUrl, file);
  for (const name of names) {
    if (mod[name] === undefined) assert.fail(`הקובץ ${file} לא מייצא את ${name}. בסוף הקובץ: module.exports = { ${names.join(", ")} };`);
  }
  return mod;
}
