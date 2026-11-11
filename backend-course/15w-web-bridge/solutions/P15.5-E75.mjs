// P15.5-E75: מכתובת לקובץ — בבטחה
import path from "node:path";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

export function resolveStatic(root, urlPath) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(urlPath, "http://x").pathname);
  } catch {
    return null;
  }
  if (pathname.endsWith("/")) pathname += "index.html";
  const file = path.join(root, pathname);
  if (!file.startsWith(root + path.sep)) return null;
  return { file, type: TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream" };
}

const root = "/srv/web";
for (const u of ["/", "/app.JS?v=3", "/docs/", "/%2E%2E%2F.env", "/../web-backup/x.html", "/%E0%A4%A", "/logo.webp"]) {
  console.log(u.padEnd(22), resolveStatic(root, u));
}
