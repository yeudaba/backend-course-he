// P10-E74: הגדרות עם ברירות מחדל
const fs = require("node:fs/promises");

function loadSettings(file, defaults) {
  return fs
    .readFile(file, "utf8")
    .then((text) => ({ ...defaults, ...JSON.parse(text) }))
    .catch((err) => {
      if (err.code === "ENOENT") return { ...defaults };
      throw err;
    });
}

const os = require("node:os");
const path = require("node:path");
const file = path.join(os.tmpdir(), "p10-e74.json");
require("node:fs").writeFileSync(file, '{"port": 8080, "name": "shop"}');
const defaults = { port: 3000, debug: false };
loadSettings(file, defaults)
  .then((s) => console.log(s))
  .then(() => loadSettings("/no/such.json", defaults))
  .then((s) => console.log(s, s === defaults))
  .then(() => loadSettings(os.tmpdir(), defaults))
  .catch((e) => console.log("נכשל:", e.code));

module.exports = { loadSettings };
