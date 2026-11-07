// הרצת Jest של פרויקט (פרק 22). Nest 12 הוא ESM, ו־Jest טוען אותו רק עם Node 24 ו־--experimental-vm-modules
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

export function nodeMajor() {
  return Number(process.versions.node.split(".")[0]);
}

export function runJest(projectDir, args = [], env = {}) {
  const jest = path.join(path.dirname(createRequire(path.join(projectDir, "package.json")).resolve("jest/package.json")), "bin", "jest.js");
  const r = spawnSync(process.execPath, ["--experimental-vm-modules", "--no-warnings", jest, "--ci", "--colors=false", ...args], {
    cwd: projectDir,
    encoding: "utf8",
    timeout: 180000,
    env: { ...process.env, ...env, NODE_TEST_CONTEXT: undefined, FORCE_COLOR: "0" },
  });
  const output = `${r.stdout}${r.stderr}`;
  const summary = /Tests:\s+([^\n]*)/.exec(output)?.[1] ?? "";
  return { ok: r.status === 0, output, summary };
}

// כל הקבצים שתואמים לתבנית, בתיקייה ובתתי־תיקיות (בלי node_modules ו־dist)
export function findFiles(dir, re, base = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", "dist", "coverage", "generated", ".git"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findFiles(full, re, base));
    else if (re.test(entry.name)) out.push(path.relative(base, full));
  }
  return out;
}

export function tail(text, lines = 30) {
  return text.split("\n").filter((l) => !/^\s+at /.test(l)).slice(-lines).join("\n");
}
