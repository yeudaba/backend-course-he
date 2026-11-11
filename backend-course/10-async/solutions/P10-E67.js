// P10-E67: קורא JSON עם then
const fs = require("node:fs/promises");

function readJson(file) {
  return fs.readFile(file, "utf8").then((text) => {
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`JSON לא תקין ב־${file}`);
    }
  });
}

const os = require("node:os");
const path = require("node:path");
const good = path.join(os.tmpdir(), "p10-e67.json");
const bad = path.join(os.tmpdir(), "p10-e67-bad.json");
require("node:fs").writeFileSync(good, '{"port": 8080}');
require("node:fs").writeFileSync(bad, "{port: 8080}");
readJson(good)
  .then((cfg) => console.log(cfg.port))
  .then(() => readJson(bad))
  .catch((e) => console.log(e.message.replace(os.tmpdir(), "<tmp>")))
  .then(() => readJson("/no/such.json"))
  .catch((e) => console.log(e.code));

module.exports = { readJson };
