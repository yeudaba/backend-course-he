// P13-E25: rotate(dir, name, maxFiles) → רשימת פעולות
// "delete app.log.3" | "app.log.2 -> app.log.3" | ... | "create app.log"
import fs from "node:fs/promises";
import path from "node:path";

export async function rotate(dir, name, maxFiles) {
  // כתוב כאן
}
