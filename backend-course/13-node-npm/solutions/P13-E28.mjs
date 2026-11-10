// P13-E28: מיזוג קובצי הגדרות במקביל
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

async function readJson(file) {
  const text = await fs.readFile(file, "utf8");
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${path.basename(file)}: JSON לא תקין`);
  }
}

export async function loadConfigs(files) {
  const configs = await Promise.all(files.map(readJson));
  return configs.reduce((merged, config) => ({ ...merged, ...config }), {});
}

const dir = await fs.mkdtemp(path.join(os.tmpdir(), "cfg-"));
await fs.writeFile(path.join(dir, "default.json"), '{ "port": 3000, "logLevel": "info" }');
await fs.writeFile(path.join(dir, "local.json"), '{ "logLevel": "debug" }');
await fs.writeFile(path.join(dir, "broken.json"), "{ port: 1 }");

console.log(await loadConfigs([path.join(dir, "default.json"), path.join(dir, "local.json")]));
try {
  await loadConfigs([path.join(dir, "default.json"), path.join(dir, "broken.json")]);
} catch (err) {
  console.log(err.message);
}
