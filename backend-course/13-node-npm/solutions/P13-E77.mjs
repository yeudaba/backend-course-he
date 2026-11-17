// P13-E77: שם קובץ פנוי
import fs from "node:fs/promises";
import path from "node:path";

async function exists(p) {
  try {
    await fs.stat(p);
    return true;
  } catch (err) {
    if (err.code === "ENOENT") return false;
    throw err;
  }
}

export async function freeName(dir, name) {
  const safe = path.basename(name);
  if (!(await exists(path.join(dir, safe)))) return safe;
  const ext = path.extname(safe);
  const base = safe.slice(0, safe.length - ext.length);
  for (let i = 1; ; i++) {
    const candidate = `${base} (${i})${ext}`;
    if (!(await exists(path.join(dir, candidate)))) return candidate;
  }
}

import os from "node:os";
const dir = await fs.mkdtemp(path.join(os.tmpdir(), "p13-e77-"));
await fs.writeFile(path.join(dir, "report.pdf"), "");
await fs.writeFile(path.join(dir, "report (1).pdf"), "");
console.log(await freeName(dir, "report.pdf"), "|", await freeName(dir, "../../etc/notes.txt"), "|", await freeName(dir, "archive.tar.gz"));
