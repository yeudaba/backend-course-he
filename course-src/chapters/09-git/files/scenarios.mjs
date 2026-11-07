// יוצר מאגרי Git לתרגול במצבים מוכנים מראש.
// שימוש (מתוך ~/dev/backend-course):  node 09-git/files/scenarios.mjs <שם>
// השמות: history | conflict | secret | messy
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const name = process.argv[2];
const scenarios = { history, conflict, secret, messy };
if (!scenarios[name]) {
  console.log(`שימוש: node 09-git/files/scenarios.mjs <${Object.keys(scenarios).join(" | ")}>`);
  process.exit(1);
}

const dir = path.resolve("playground", "git-scenarios", name);
if (fs.existsSync(dir)) {
  console.log(`התיקייה כבר קיימת: ${dir}\nאם אתה רוצה להתחיל מחדש — מחק אותה (ב־Finder, לפח) והרץ שוב.`);
  process.exit(1);
}
fs.mkdirSync(dir, { recursive: true });

const env = { ...process.env, GIT_AUTHOR_NAME: "Course Bot", GIT_AUTHOR_EMAIL: "bot@course.local", GIT_COMMITTER_NAME: "Course Bot", GIT_COMMITTER_EMAIL: "bot@course.local" };
const git = (...args) => execFileSync("git", args, { cwd: dir, env, stdio: "pipe" }).toString();
const write = (file, text) => fs.writeFileSync(path.join(dir, file), text);
const commit = (message, date) => {
  git("add", "-A");
  execFileSync("git", ["commit", "-q", "-m", message], { cwd: dir, env: { ...env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date } });
};

git("init", "-q", "-b", "main");
scenarios[name]();
console.log(`✔ נוצר מאגר תרגול: ${path.relative(process.cwd(), dir)}`);

function history() {
  write("prices.js", "const VAT = 0.17;\nfunction withVat(p) {\n  return p * (1 + VAT);\n}\nmodule.exports = { withVat };\n");
  commit("Add VAT helper", "2026-10-01T10:00:00");
  write("README.md", "# Shop\n");
  commit("Add README", "2026-10-02T10:00:00");
  write("prices.js", "const VAT = 0.18;\nfunction withVat(p) {\n  return p * (1 + VAT);\n}\nmodule.exports = { withVat };\n");
  commit("Update VAT to 18%", "2026-10-03T10:00:00");
  write("prices.js", "const VAT = 0.18;\nfunction withVat(p) {\n  return Math.round(p * (1 + VAT) * 100) / 100;\n}\nmodule.exports = { withVat };\n");
  commit("Round prices to 2 decimals", "2026-10-04T10:00:00");
  write("discount.js", "function discount(p, percent) {\n  return p - p * percent;\n}\nmodule.exports = { discount };\n");
  commit("Add discount", "2026-10-05T10:00:00");
}

function conflict() {
  write("greeting.js", 'const greeting = "שלום";\nmodule.exports = { greeting };\n');
  commit("Add greeting", "2026-10-01T10:00:00");
  git("switch", "-q", "-c", "feature/english");
  write("greeting.js", 'const greeting = "Hello";\nmodule.exports = { greeting };\n');
  commit("Use English greeting", "2026-10-02T10:00:00");
  git("switch", "-q", "main");
  write("greeting.js", 'const greeting = "שלום וברכה";\nmodule.exports = { greeting };\n');
  commit("Make greeting warmer", "2026-10-03T10:00:00");
}

function secret() {
  write("config.js", 'module.exports = { port: 3000, apiKey: "sk_live_THIS_IS_A_FAKE_KEY_123" };\n');
  write("app.js", 'const config = require("./config");\nconsole.log(`listening on ${config.port}`);\n');
  commit("Initial app", "2026-10-01T10:00:00");
}

function messy() {
  write("app.js", 'console.log("app");\n');
  commit("Initial", "2026-10-01T10:00:00");
  fs.mkdirSync(path.join(dir, "node_modules", "left-pad"), { recursive: true });
  write("node_modules/left-pad/index.js", "module.exports = () => {};\n");
  write(".DS_Store", "binary-junk");
  write(".env", "DATABASE_URL=postgres://user:pass@localhost/db\n");
  write("app.js", 'console.log("app v2");\n');
  write("notes.txt", "todo: fix\n");
}
