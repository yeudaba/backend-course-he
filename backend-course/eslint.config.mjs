// הגדרות ESLint של הקורס (פרק 8). מסמן טעויות נפוצות עוד לפני שמריצים.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import globals from "globals";

// קובצי .js בפרקים 1–8 הם CommonJS (require). אבל תיקייה שיש בה package.json עם
// "type": "module" (למשל הפרויקט של 08p) — שם .js הוא ES module (import/export), כמו ש־Node מריץ אותו.
const here = path.dirname(fileURLToPath(import.meta.url));
function moduleDirs(dir = here, depth = 0, out = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  const pkg = path.join(dir, "package.json");
  if (depth > 0 && fs.existsSync(pkg)) {
    try {
      if (JSON.parse(fs.readFileSync(pkg, "utf8")).type === "module") out.push(path.relative(here, dir).split(path.sep).join("/"));
    } catch { /* package.json פגום — מדלגים */ }
  }
  if (depth < 4) {
    for (const e of entries) {
      if (e.isDirectory() && e.name !== "node_modules" && !e.name.startsWith(".")) moduleDirs(path.join(dir, e.name), depth + 1, out);
    }
  }
  return out;
}

export default [
  { ignores: ["**/node_modules/**"] },
  js.configs.recommended,
  {
    languageOptions: { ecmaVersion: "latest", globals: { ...globals.node } },
    rules: {
      eqeqeq: "error",
      "no-var": "error",
      "prefer-const": "warn",
      "no-unused-vars": "warn",
    },
  },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  ...moduleDirs().map((d) => ({ files: [`${d}/**/*.js`], languageOptions: { sourceType: "module" } })),
];
