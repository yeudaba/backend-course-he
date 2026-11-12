// "docker" מזויף לבדיקות של סקריפטים (פרק 23): הסקריפט שלך רץ עם PATH שבו docker הוא תוכנית קטנה
// שרושמת כל קריאה (הארגומנטים, בדיוק כמו שהגיעו), ומחזירה פלט קבוע לפי כללים. בלי Docker אמיתי.
// לא צריך להבין את הקובץ הזה.
import fs from "node:fs";
import path from "node:path";
import { tempDir } from "../../tools/shell.mjs";

const PROGRAM = `
const fs = require("fs"), path = require("path");
const dir = process.env.FAKE_DOCKER_DIR;
const args = process.argv.slice(2);
fs.appendFileSync(path.join(dir, "calls.jsonl"), JSON.stringify(args) + "\\n");
const rules = JSON.parse(fs.readFileSync(path.join(dir, "rules.json"), "utf8"));
const statePath = path.join(dir, "state.json");
const state = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, "utf8")) : {};
const line = args.join(" ");
for (let i = 0; i < rules.length; i++) {
  const r = rules[i];
  if (!new RegExp(r.match).test(line)) continue;
  let out = r;
  if (r.seq) {
    const k = state[i] ?? 0;
    out = r.seq[Math.min(k, r.seq.length - 1)];
    state[i] = k + 1;
    fs.writeFileSync(statePath, JSON.stringify(state));
  }
  if (out.stdout) process.stdout.write(out.stdout);
  if (out.stderr) process.stderr.write(out.stderr);
  process.exit(out.status ?? 0);
}
`;

// rules: [{ match: "regex על הארגומנטים מחוברים ברווח", stdout?, stderr?, status?, seq?: [{stdout, status}, ...] }]
export function fakeDocker(t, rules = []) {
  const dir = tempDir(t, "fake-docker-");
  const bin = path.join(dir, "docker");
  fs.writeFileSync(bin, `#!${process.execPath}\n${PROGRAM}`);
  fs.chmodSync(bin, 0o755);
  fs.writeFileSync(path.join(dir, "rules.json"), JSON.stringify(rules));
  return {
    dir,
    env: { PATH: `${dir}:${process.env.PATH}`, FAKE_DOCKER_DIR: dir },
    calls() {
      const f = path.join(dir, "calls.jsonl");
      return fs.existsSync(f) ? fs.readFileSync(f, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l)) : [];
    },
  };
}
