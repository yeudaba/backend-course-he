// עזרים לבדיקות של פרק 23: ניתוח Dockerfile, בנייה והרצה של images, ו־docker compose.
import fs from "node:fs";
import { spawnSync } from "node:child_process";

export function dockerAvailable() {
  return spawnSync("docker", ["info"], { stdio: "ignore", timeout: 20000 }).status === 0;
}

export function docker(args, opts = {}) {
  const r = spawnSync("docker", args, { encoding: "utf8", timeout: opts.timeout ?? 300000, cwd: opts.cwd, env: { ...process.env, ...(opts.env ?? {}) } });
  return { ok: r.status === 0, stdout: r.stdout ?? "", stderr: r.stderr ?? "", output: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

// ---------- Dockerfile ----------
// מחזיר רשימת הוראות: { cmd: "FROM", args: "node:24-alpine AS build", stage: 0, line }
// (תומך בשורות שנמשכות עם \ ובהערות)
export function parseDockerfile(text) {
  const out = [];
  let stage = -1;
  const lines = text.replace(/\\\r?\n/g, " ").split(/\r?\n/);
  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    const m = /^(\w+)\s+([\s\S]*)$/.exec(line);
    if (!m) return;
    const cmd = m[1].toUpperCase();
    if (cmd === "FROM") stage++;
    out.push({ cmd, args: m[2].trim(), stage, line: i + 1 });
  });
  return out;
}

export function readText(file) {
  if (!fs.existsSync(file)) throw new Error(`לא נמצא הקובץ ${file}`);
  return fs.readFileSync(file, "utf8");
}

// ---------- רשת ----------
export async function waitForHttp(url, { timeoutMs = 60000 } = {}) {
  const until = Date.now() + timeoutMs;
  let last = "";
  while (Date.now() < until) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      last = `HTTP ${res.status}`;
    } catch (err) {
      last = err.cause?.code ?? err.message;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`${url} לא ענה תוך ${timeoutMs / 1000} שניות (${last})`);
}

export function freePort() {
  return 20000 + Math.floor(Math.random() * 20000);
}

export function tail(text, lines = 30) {
  return String(text).split("\n").slice(-lines).join("\n");
}

// ---------- בדיקות live ----------
import path from "node:path";
import os from "node:os";

// בונה image מתיקייה; מחזיר את ה־tag. נמחק בסוף הבדיקה
export function buildImage(t, dir, { tag = `p23-check-${process.pid}-${Math.random().toString(36).slice(2, 8)}`, plain = false } = {}) {
  const r = docker(["build", ...(plain ? ["--progress=plain"] : ["-q"]), "-t", tag, dir], { timeout: 600000 });
  if (!r.ok) throw new Error(`docker build נכשל:\n${tail(r.output, 40)}`);
  t.after(() => docker(["image", "rm", "-f", tag]));
  return { tag, output: r.output };
}

// מריץ קונטיינר ברקע עם port אקראי במחשב; מחזיר את הכתובת. נמחק בסוף הבדיקה
export function runContainer(t, tag, { port = 3000, env = {}, args = [] } = {}) {
  const envArgs = Object.entries(env).flatMap(([k, v]) => ["-e", `${k}=${v}`]);
  const r = docker(["run", "-d", "-p", `127.0.0.1::${port}`, ...envArgs, ...args, tag]);
  if (!r.ok) throw new Error(`docker run נכשל:\n${tail(r.output)}`);
  const id = r.stdout.trim();
  t.after(() => docker(["rm", "-f", id]));
  const mapped = docker(["port", id, String(port)]).stdout.trim().split("\n")[0];
  const hostPort = mapped.split(":").at(-1);
  return { id, url: `http://127.0.0.1:${hostPort}`, logs: () => docker(["logs", id]).output };
}

// מעתיק תיקייה לתיקייה זמנית (כדי להוסיף קבצים לבדיקה בלי לגעת בקבצים של הלומד)
export function copyToTemp(t, dir) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "p23-ctx-"));
  fs.cpSync(dir, tmp, { recursive: true });
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
  return tmp;
}

// docker compose בפרויקט מבודד (שם ייחודי), עם env. down -v בסוף הבדיקה
export function composeProject(t, dir, env = {}) {
  const name = `p23${process.pid}${Math.random().toString(36).slice(2, 6)}`;
  const run = (args, timeout = 600000) => docker(["compose", "-p", name, ...args], { cwd: dir, env, timeout });
  t.after(() => run(["down", "-v", "--rmi", "local"], 180000));
  return { name, run, config: () => JSON.parse(run(["config", "--format", "json"]).stdout || "{}") };
}

export function requireDocker() {
  if (!dockerAvailable()) throw new Error("Docker לא רץ. הפעל את Docker Desktop (או: docker info) ונסה שוב.");
}

export function randomPort() {
  return 30000 + Math.floor(Math.random() * 20000);
}
