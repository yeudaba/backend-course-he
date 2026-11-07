import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { target } from "../../tools/load.mjs";
import { findFiles, nodeMajor, runJest, tail } from "../../tools/jest.mjs";

// פרויקט 2, שלב ה׳: הבדיקות שלך — (1) עוברות על הקוד שלך, (2) כוללות unit, e2e ו־integration,
// (3) עוברות גם על פתרון הקורס, ו־(4) נכשלות כשמכניסים לו באג (mutation testing).
const project = path.dirname(target(import.meta.url, "tasks-api/package.json"));
const chapterDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const reference = path.join(chapterDir, "solutions", "tasks-api");
const DB = process.env.COURSE_DATABASE_URL;

const MUTANTS = [
  { desc: "GET /tasks/:id מחזיר משימה של משתמש אחר", file: "src/tasks/tasks.repository.ts", from: "(t) => t.id === id && t.ownerId === ownerId);\n    return task && strip(task);", to: "(t) => t.id === id);\n    return task && strip(task);" },
  { desc: "dueDate של היום נדחה (צריך להיות מותר)", file: "src/tasks/tasks.service.ts", from: "input.dueDate < today(this.now())", to: "input.dueDate <= today(this.now())" },
  { desc: "refresh token ישן ממשיך לעבוד (אין rotation)", file: "src/auth/auth.service.ts", from: "    if (!(await this.refreshTokens.revoke(record.id, now))) throw invalidRefresh(); // בקשה מקבילה הקדימה\n", to: "" },
  { desc: "access token תקף שעה במקום 15 דקות", file: "src/auth/auth.service.ts", from: "{ expiresIn: accessTokenTtlSeconds, algorithm: \"HS256\" }", to: "{ expiresIn: accessTokenTtlSeconds * 4, algorithm: \"HS256\" }" },
  { desc: "ההרשמה מחזירה גם את passwordHash", file: "src/users/users.repository.ts", from: "export const toPublicUser = ({ passwordHash, ...user }: User): PublicUser => user;", to: "export const toPublicUser = (user: User): PublicUser => user;" },
  { desc: "/users פתוח לכל משתמש מחובר (בלי בדיקת תפקיד)", file: "src/auth/roles.guard.ts", from: "if (!user || !roles.includes(user.role))", to: "if (!user)" },
  { desc: "כניסה עם אימייל לא רשום מחזירה הודעה אחרת (user enumeration)", file: "src/auth/auth.service.ts", from: "      await this.passwords.verifyAgainstDummy(password);\n      throw invalidCredentials();", to: "      throw new HttpError(401, \"INVALID_CREDENTIALS\", \"המשתמש לא קיים\");" },
];

test("פרויקט 2 — בדיקות", { timeout: 600000 }, async (t) => {
  assert.ok(nodeMajor() >= 24, `צריך Node 24 ומעלה (Nest 12 הוא ESM, ו־Jest טוען אותו רק מ־Node 24). יש לך ${process.versions.node}`);
  assert.ok(fs.existsSync(path.join(project, "package.json")), `לא נמצא פרויקט ב־${project}`);
  assert.ok(fs.existsSync(path.join(project, "src", "generated", "prisma")), "לא נמצא src/generated/prisma — הרץ npx prisma generate בתיקיית הפרויקט");

  const specs = findFiles(project, /\.spec\.ts$/).filter((f) => f.startsWith("src" + path.sep));
  const e2e = findFiles(project, /\.e2e-spec\.ts$/);
  const integration = findFiles(project, /\.int-spec\.ts$/);

  await t.test("יש שלושה סוגי בדיקות", () => {
    assert.ok(specs.length >= 2, `צריך לפחות 2 קובצי unit (src/**/*.spec.ts), נמצאו ${specs.length}`);
    assert.ok(e2e.length >= 1, "צריך לפחות קובץ e2e אחד (test/*.e2e-spec.ts)");
    assert.ok(integration.length >= 1, "צריך לפחות קובץ integration אחד (test/*.int-spec.ts)");
  });

  await t.test("npm test עובר על הקוד שלך", () => {
    const r = runJest(project);
    assert.ok(r.ok, `Jest נכשל:\n${tail(r.output)}`);
    const passed = Number(/(\d+) passed/.exec(r.summary)?.[1] ?? 0);
    assert.ok(passed >= 20, `צריך לפחות 20 בדיקות (unit + e2e), יש ${passed}`);
  });

  await t.test("בדיקות ה־integration עוברות מול PostgreSQL", () => {
    assert.ok(DB, "חסר COURSE_DATABASE_URL ב־.env של תיקיית הקורס");
    const r = runJest(project, ["--config", "jest.int.json", "--runInBand"], { DATABASE_URL_TEST: DB });
    assert.ok(r.ok, `בדיקות ה־integration נכשלו (הן מקבלות DATABASE_URL_TEST):\n${tail(r.output)}`);
  });

  // הבדיקות שלך על עותק של פתרון הקורס — פעם כמו שהוא, ופעם עם כל באג
  const work = path.join(chapterDir, ".build", `pr2-tests-${process.pid}`);
  fs.rmSync(work, { recursive: true, force: true });
  t.after(() => fs.rmSync(work, { recursive: true, force: true }));
  const copy = (from, to) => fs.cpSync(from, to, { recursive: true, filter: (s) => !/[\\/](node_modules|dist|coverage|\.env)$/.test(s) });
  copy(reference, work);
  for (const f of findFiles(work, /\.(spec|e2e-spec|int-spec)\.ts$/)) fs.rmSync(path.join(work, f));
  fs.rmSync(path.join(work, "test"), { recursive: true, force: true });
  for (const f of [...specs, ...e2e, ...integration]) {
    fs.mkdirSync(path.dirname(path.join(work, f)), { recursive: true });
    fs.copyFileSync(path.join(project, f), path.join(work, f));
  }
  for (const f of findFiles(path.join(project, "test"), /\.ts$/)) {
    const to = path.join(work, "test", f);
    if (!fs.existsSync(to)) { fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(path.join(project, "test", f), to); }
  }
  if (!fs.existsSync(path.join(work, "src", "generated", "prisma"))) {
    const prisma = path.join(path.dirname(createRequire(path.join(work, "package.json")).resolve("prisma/package.json")), "build", "index.js");
    const g = spawnSync(process.execPath, [prisma, "generate"], { cwd: work, encoding: "utf8", env: { ...process.env, DATABASE_URL: DB ?? "postgresql://x@localhost/x" } });
    assert.equal(g.status, 0, `prisma generate נכשל בעותק לבדיקה:\n${g.stdout}${g.stderr}`);
  }

  await t.test("הבדיקות שלך עוברות על פתרון הקורס", () => {
    const r = runJest(work);
    assert.ok(r.ok, `הבדיקות שלך נכשלות על הפתרון של הקורס — אולי הן תלויות במשהו שקיים רק אצלך:\n${tail(r.output)}`);
  });

  await t.test("הבדיקות שלך תופסות באגים", () => {
    const survivors = [];
    for (const m of MUTANTS) {
      const file = path.join(work, m.file);
      const original = fs.readFileSync(file, "utf8");
      assert.ok(original.includes(m.from), `תקלה בבודק: לא נמצא הקוד למוטנט "${m.desc}"`);
      fs.writeFileSync(file, original.replace(m.from, m.to));
      try {
        if (runJest(work).ok) survivors.push(m.desc);
      } finally {
        fs.writeFileSync(file, original);
      }
    }
    assert.deepEqual(survivors, [], `הבדיקות שלך עוברות גם כשיש בקוד הבאגים האלה:\n${survivors.map((d) => `  • ${d}`).join("\n")}`);
  });
});
