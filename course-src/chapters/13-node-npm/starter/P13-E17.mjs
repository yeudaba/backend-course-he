// P13-E17: storeUpload(baseDir, originalName, content)
// שם חדש: `${randomUUID()}${ext}` — ext רק מ־.png .jpg .jpeg .pdf (אחרת Error("סוג קובץ לא נתמך"))
// מחזירה { storedName, originalName: path.basename(originalName), size }
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export async function storeUpload(baseDir, originalName, content) {
  // כתוב כאן
}
