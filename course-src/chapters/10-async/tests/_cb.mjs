// עוזר לבדיקות של callbacks: קורא לפונקציה, אוסף את כל הקריאות ל־callback,
// ומחכה עוד קצת אחרי הראשונה — כדי לתפוס callback שנקרא פעמיים.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export function calls(start, { after = 40, max = 1000 } = {}) {
  return new Promise((resolve) => {
    const got = [];
    let returned = false;
    start((...args) => {
      got.push({ args, sync: !returned });
      if (got.length === 1) setTimeout(() => resolve(got), after);
    });
    returned = true;
    setTimeout(() => resolve(got), max);
  });
}

// תיקייה זמנית עם קבצים: tmpFiles({ "a.txt": "..." }) ← { dir, p(name) }
export function tmpFiles(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "p10-"));
  for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), text);
  return { dir, p: (name) => path.join(dir, name) };
}
