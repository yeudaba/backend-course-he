// P13-E11
import path from "node:path";

export function safeJoin(baseDir, userPath) {
  const base = path.resolve(baseDir);
  const full = path.resolve(base, userPath);
  if (full !== base && !full.startsWith(base + path.sep)) {
    throw new Error("נתיב לא מורשה");
  }
  return full;
}

console.log(safeJoin("/srv/uploads", "a/b.png"));
try {
  safeJoin("/srv/uploads", "../secrets.env");
} catch (err) {
  console.log(err.message);
}
