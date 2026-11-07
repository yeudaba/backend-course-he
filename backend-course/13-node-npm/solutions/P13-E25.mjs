// P13-E25: log rotation
import fs from "node:fs/promises";
import path from "node:path";

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

export async function rotate(dir, name, maxFiles) {
  const actions = [];
  const file = (i) => path.join(dir, i === 0 ? name : `${name}.${i}`);
  const label = (i) => (i === 0 ? name : `${name}.${i}`);

  if (await exists(file(maxFiles))) {
    await fs.rm(file(maxFiles));
    actions.push(`delete ${label(maxFiles)}`);
  }
  for (let i = maxFiles - 1; i >= 0; i--) {
    if (await exists(file(i))) {
      await fs.rename(file(i), file(i + 1));
      actions.push(`${label(i)} -> ${label(i + 1)}`);
    }
  }
  await fs.writeFile(file(0), "");
  actions.push(`create ${name}`);
  return actions;
}

const tmp = await fs.mkdtemp(path.join((await import("node:os")).tmpdir(), "rot-"));
for (const f of ["app.log", "app.log.1", "app.log.3"]) await fs.writeFile(path.join(tmp, f), f);
console.log(await rotate(tmp, "app.log", 3));
console.log((await fs.readdir(tmp)).sort());
