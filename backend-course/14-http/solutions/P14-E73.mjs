// P14-E73: סיכום קובצי .http בתיקייה
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export async function summarizeHttpDir(dir) {
  let names;
  try {
    names = await fs.readdir(dir);
  } catch (err) {
    if (err.code === "ENOENT") throw new Error(`התיקייה לא קיימת: ${dir}`);
    throw err;
  }
  const files = names.filter((n) => n.endsWith(".http")).sort();
  return Promise.all(
    files.map(async (file) => {
      const text = await fs.readFile(path.join(dir, file), "utf8");
      const methods = {};
      let requests = 0;
      for (const line of text.split(/\r?\n/)) {
        const m = line.match(/^(GET|POST|PUT|PATCH|DELETE) /);
        if (!m) continue;
        requests++;
        methods[m[1]] = (methods[m[1]] ?? 0) + 1;
      }
      return { file, requests, methods };
    }),
  );
}

const dir = await fs.mkdtemp(path.join(os.tmpdir(), "http-"));
await fs.writeFile(path.join(dir, "products.http"), "### a\nGET http://x/products\n\n### b\nPOST http://x/products\n\n### c\nGET http://x/products/1\n");
await fs.writeFile(path.join(dir, "auth.http"), "### login\nPOST http://x/login\n");
await fs.writeFile(path.join(dir, "notes.txt"), "GET http://x/ignored\n");
console.log(await summarizeHttpDir(dir));
await fs.rm(dir, { recursive: true });
await summarizeHttpDir(dir).catch((err) => console.log(err.message.replace(dir, "<dir>")));
