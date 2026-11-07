// P13-E07
import fs from "node:fs/promises";
import path from "node:path";

// { prod: [...], dev: [...], total } — שמות ממוינים
export function depsReport(pkg) {
  // כתוב כאן
}

// ["npm start  →  node app.js", "npm run dev  →  ..."] — start/test בלי "run"
export function scriptLines(pkg) {
  // כתוב כאן
}

// קורא package.json מהתיקייה; אין קובץ → Error("לא נמצא package.json")
export async function readPackage(dir) {
  // כתוב כאן
}
