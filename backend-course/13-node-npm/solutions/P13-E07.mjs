// P13-E07
import fs from "node:fs/promises";
import path from "node:path";

export function depsReport(pkg) {
  const prod = Object.keys(pkg.dependencies ?? {}).sort();
  const dev = Object.keys(pkg.devDependencies ?? {}).sort();
  return { prod, dev, total: prod.length + dev.length };
}

export function scriptLines(pkg) {
  return Object.entries(pkg.scripts ?? {}).map(([name, cmd]) => {
    const run = ["start", "test"].includes(name) ? `npm ${name}` : `npm run ${name}`;
    return `${run}  →  ${cmd}`;
  });
}

export async function readPackage(dir) {
  try {
    return JSON.parse(await fs.readFile(path.join(dir, "package.json"), "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") throw new Error("לא נמצא package.json");
    throw err;
  }
}

const pkg = { scripts: { start: "node app.js", dev: "node --watch app.js" }, dependencies: { zod: "^3", express: "^5" } };
console.log(depsReport(pkg), scriptLines(pkg));
