// P13-E12
import fs from "node:fs/promises";
import path from "node:path";

export async function dirStats(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = entries.filter((e) => e.isFile()).map((e) => e.name);
  const sizes = await Promise.all(files.map(async (name) => (await fs.stat(path.join(dir, name))).size));
  const byExtension = {};
  for (const name of files) {
    const ext = path.extname(name).slice(1).toLowerCase() || "(none)";
    byExtension[ext] = (byExtension[ext] ?? 0) + 1;
  }
  return { files: files.length, totalBytes: sizes.reduce((s, n) => s + n, 0), byExtension };
}

const tmp = await fs.mkdtemp(path.join((await import("node:os")).tmpdir(), "stats-"));
await fs.writeFile(path.join(tmp, "a.TXT"), "12345");
await fs.writeFile(path.join(tmp, "Makefile"), "x");
await fs.mkdir(path.join(tmp, "sub"));
console.log(await dirStats(tmp));
