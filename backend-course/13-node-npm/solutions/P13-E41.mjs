// P13-E41: פרטי פרויקט מ־package.json
import fs from "node:fs/promises";
import path from "node:path";

export async function projectInfo(dir) {
  let text;
  try {
    text = await fs.readFile(path.join(dir, "package.json"), "utf8");
  } catch (err) {
    if (err.code === "ENOENT") throw new Error(`אין package.json ב־${dir}`);
    throw err;
  }
  let pkg;
  try {
    pkg = JSON.parse(text);
  } catch {
    throw new Error("package.json לא תקין");
  }
  return {
    name: pkg.name,
    version: pkg.version ?? "0.0.0",
    scripts: Object.keys(pkg.scripts ?? {}),
    deps: Object.keys(pkg.dependencies ?? {}).length,
    devDeps: Object.keys(pkg.devDependencies ?? {}).length,
  };
}

import os from "node:os";
const dir = await fs.mkdtemp(path.join(os.tmpdir(), "p13-e41-"));
await fs.writeFile(path.join(dir, "package.json"), JSON.stringify({ name: "shop", scripts: { start: "x", test: "y" }, dependencies: { zod: "^4" } }));
console.log(await projectInfo(dir));
await projectInfo(path.join(dir, "nope")).catch((e) => console.log(e.message.replace(dir, "<dir>")));
