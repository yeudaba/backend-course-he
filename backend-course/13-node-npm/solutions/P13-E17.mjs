// P13-E17
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const ALLOWED = [".png", ".jpg", ".jpeg", ".pdf"];

export async function storeUpload(baseDir, originalName, content) {
  const ext = path.extname(originalName).toLowerCase();
  if (!ALLOWED.includes(ext)) {
    throw new Error("סוג קובץ לא נתמך");
  }
  const storedName = `${randomUUID()}${ext}`;
  await fs.mkdir(baseDir, { recursive: true });
  await fs.writeFile(path.join(baseDir, storedName), content);
  return { storedName, originalName: path.basename(originalName), size: Buffer.byteLength(content) };
}

const dir = path.join((await import("node:os")).tmpdir(), "uploads-demo");
const r = await storeUpload(dir, "../../evil/Report.PDF", "hello");
console.log(r.storedName.endsWith(".pdf"), r.originalName, r.size);
