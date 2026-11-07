// P13-E19
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

export async function fileHash(file) {
  const hash = createHash("sha256");
  for await (const chunk of fs.createReadStream(file)) {
    hash.update(chunk);
  }
  return hash.digest("hex");
}

export async function findDuplicates(dir) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  const names = entries.filter((e) => e.isFile()).map((e) => e.name);
  const hashes = await Promise.all(names.map((n) => fileHash(path.join(dir, n))));
  const groups = new Map();
  names.forEach((name, i) => {
    const list = groups.get(hashes[i]) ?? [];
    list.push(name);
    groups.set(hashes[i], list);
  });
  return [...groups.values()]
    .filter((g) => g.length > 1)
    .map((g) => g.sort())
    .sort((a, b) => a[0].localeCompare(b[0]));
}

const tmp = await fsp.mkdtemp(path.join((await import("node:os")).tmpdir(), "dups-"));
for (const [name, text] of [["a.txt", "x"], ["b.txt", "y"], ["c.txt", "x"], ["d.txt", "y"], ["e.txt", "z"]]) {
  await fsp.writeFile(path.join(tmp, name), text);
}
console.log(await findDuplicates(tmp));
