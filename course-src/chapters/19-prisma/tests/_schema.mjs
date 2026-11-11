// עוזר לבדיקה של P19-E26: הופך את קובץ ה־schema שלך ל־SQL עם prisma migrate diff (בלי מסד), כדי שהבודק יריץ אותו על schema זמני.
// לא צריך להבין את הקובץ הזה עכשיו — נלמד על בדיקות בפרק 22.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { target } from "../../tools/load.mjs";

export function schemaToSql(testUrl, file) {
  const src = target(testUrl, file);
  if (!fs.existsSync(src)) return { ok: false, output: `לא מצאתי את הקובץ ${file} בתיקיית starter. האם הוא נמחק או שונה שמו?` };
  const root = path.resolve(path.dirname(fileURLToPath(testUrl)), "..", "..");
  const cli = path.join(root, "node_modules", "prisma", "build", "index.js");
  if (!fs.existsSync(cli)) return { ok: false, output: "Prisma לא מותקן. הרץ npm install בתיקיית הקורס (פרק 19, קופסת 🧰)." };
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "schema-"));
  try {
    fs.copyFileSync(src, path.join(dir, "schema.prisma"));
    // ל־migrate diff צריך קובץ config עם datasource (גם בלי כתובת — הוא לא מתחבר למסד)
    fs.writeFileSync(path.join(dir, "prisma.config.mjs"), "export default { datasource: { url: undefined } };\n");
    const r = spawnSync(process.execPath, [cli, "migrate", "diff", "--from-empty", "--to-schema", "schema.prisma", "--script", "--config", "prisma.config.mjs"], {
      cwd: dir,
      encoding: "utf8",
      env: { ...process.env, CHECKPOINT_DISABLE: "1", PRISMA_HIDE_UPDATE_MESSAGE: "1" },
    });
    const sql = r.stdout.replace(/^Loaded Prisma config.*$/m, "").trim();
    if (r.status !== 0 || !/CREATE TABLE/.test(sql)) {
      const msg = (r.stderr + r.stdout).replace(/^Loaded Prisma config.*$/m, "").trim();
      return { ok: false, output: `prisma לא הצליח לקרוא את ה־schema שלך: ${msg.split("\n").filter(Boolean).slice(0, 6).join(" | ") || "לא נוצרה אף טבלה — האם כתבת datasource ו־model?"}` };
    }
    return { ok: true, sql };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
