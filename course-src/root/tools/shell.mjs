// הרצת סקריפט bash של הלומד (פרק 23). הפלט מנורמל: רווחים בתחילת/סוף שורה ורווחים כפולים לא משנים
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { target } from "./load.mjs";

export function scriptPath(testUrl, file) {
  const p = target(testUrl, file);
  if (!fs.existsSync(p)) throw new Error(`לא נמצא ${p}`);
  return p;
}

export function filesDir(testUrl) {
  return path.join(path.dirname(fileURLToPath(testUrl)), "..", "files");
}

export const norm = (text) => text.split("\n").map((l) => l.trim().replace(/\s+/g, " ")).filter((l) => l !== "");

export function runScript(testUrl, file, args = [], { cwd, env, cleanEnv = false, timeout = 30000 } = {}) {
  const base = cleanEnv ? { PATH: process.env.PATH, HOME: process.env.HOME, LANG: "C.UTF-8" } : process.env;
  const r = spawnSync("bash", [scriptPath(testUrl, file), ...args], { cwd, encoding: "utf8", timeout, env: { ...base, ...(env ?? {}) } });
  return { status: r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "", lines: norm(r.stdout ?? "") };
}

// כמו runScript, אבל לא חוסם — לבדיקות שמריצות שרת במקביל
export function runScriptAsync(testUrl, file, args = [], { cwd, env, timeout = 30000 } = {}) {
  return new Promise((resolve) => {
    const child = spawn("bash", [scriptPath(testUrl, file), ...args], { cwd, env: { ...process.env, ...(env ?? {}) } });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    const timer = setTimeout(() => child.kill("SIGKILL"), timeout);
    child.on("close", (status) => {
      clearTimeout(timer);
      resolve({ status, stdout, stderr, lines: norm(stdout) });
    });
  });
}

export function tempDir(t, prefix = "p23-") {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}
