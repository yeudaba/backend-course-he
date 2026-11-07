// עוזר לבדיקות: טוען את הקובץ שלך (מתיקיית starter) או את קובץ הפתרון.
// לא צריך להבין את הקובץ הזה עכשיו — נלמד על בדיקות בפרק 22.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

export function target(testUrl, file) {
  // פרויקט בתיקייה משלו (npm run check PR2 -- --dir ~/dev/tasks-api): "tasks-api/src/app.ts" ← "<dir>/src/app.ts"
  if (process.env.CHECK_DIR && file.includes("/") && process.env.CHECK_TARGET !== "solutions") {
    return path.join(process.env.CHECK_DIR, ...file.split("/").slice(1));
  }
  const testsDir = path.dirname(fileURLToPath(testUrl));
  return path.join(testsDir, "..", process.env.CHECK_TARGET || "starter", file);
}

// מחזיר את מה שהקובץ ייצא (module.exports או export)
export async function load(testUrl, file) {
  const mod = await import(pathToFileURL(target(testUrl, file)).href);
  return { ...(mod.default ?? {}), ...mod };
}

// מריץ את הקובץ ומחזיר את מה שהודפס, שורה אחר שורה
export function runFile(testUrl, file, input = "") {
  const r = spawnSync(process.execPath, [target(testUrl, file)], { encoding: "utf8", input, timeout: 10000 });
  return { lines: r.stdout.replace(/\s+$/, "").split("\n"), stdout: r.stdout, stderr: r.stderr, status: r.status };
}

// מפעיל פונקציה ותופס את מה שהיא מדפיסה עם console.log
export async function captureLogs(fn) {
  const lines = [];
  const orig = console.log;
  console.log = (...a) => lines.push(a.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join(" "));
  try {
    const value = await fn();
    return { lines, value };
  } finally {
    console.log = orig;
  }
}

// מריץ את בודק הטיפוסים של TypeScript על הקובץ שלך (פרק 11 והלאה)
export function typecheck(testUrl, file) {
  const root = path.resolve(path.dirname(fileURLToPath(testUrl)), "..", "..");
  const tsc = process.env.TSC_PATH || path.join(root, "node_modules", "typescript", "bin", "tsc");
  if (!fs.existsSync(tsc)) {
    return { ok: false, output: "TypeScript לא מותקן. הרץ npm install בתיקיית הקורס (פרק 11, קופסת 🧰)." };
  }
  const args = [tsc, "--noEmit", "--strict", "--target", "es2022", "--module", "nodenext", "--allowImportingTsExtensions", "--skipLibCheck", "--pretty", "false", target(testUrl, file)];
  const r = spawnSync(process.execPath, args, { encoding: "utf8" });
  const output = (r.stdout + r.stderr).replaceAll(path.dirname(target(testUrl, file)) + path.sep, "");
  return { ok: r.status === 0, output: output.trim() };
}

// מפעיל שרת HTTP (או אפליקציית Express) על פורט פנוי (פרק 14 והלאה). מחזיר כתובת בסיס ופונקציית סגירה
export async function listen(target) {
  const server = typeof target === "function" && typeof target.handle === "function" ? http.createServer(target) : target;
  if (typeof server?.listen !== "function") throw new Error("הפונקציה לא החזירה שרת (http.Server) או אפליקציית Express");
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const close = () => new Promise((resolve) => { server.closeAllConnections?.(); server.close(() => resolve()); });
  return { base, close };
}

// לקוח קטן לבדיקות API: const call = api(base); const { status, body, headers } = await call("POST", "/tasks", { title: "x" })
export function api(base) {
  return async (method, urlPath, body, { headers = {}, raw } = {}) => {
    const hasBody = body !== undefined || raw !== undefined;
    const res = await fetch(base + urlPath, {
      method,
      headers: { ...(hasBody ? { "Content-Type": "application/json" } : {}), ...headers },
      body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
      signal: AbortSignal.timeout(3000),
    });
    const text = await res.text();
    let parsed = text;
    try { parsed = text === "" ? undefined : JSON.parse(text); } catch { /* נשאר טקסט */ }
    return { status: res.status, headers: res.headers, body: parsed };
  };
}
