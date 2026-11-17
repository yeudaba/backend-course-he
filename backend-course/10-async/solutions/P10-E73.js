// P10-E73: סכום המספרים בקובץ
const fs = require("node:fs/promises");

function sumFile(file) {
  return fs.readFile(file, "utf8").then((text) => {
    const lines = text.split("\n");
    let sum = 0;
    for (let i = 0; i < lines.length; i++) {
      const t = lines[i].trim();
      if (t === "") continue;
      const n = Number(t);
      if (Number.isNaN(n)) throw new Error(`שורה ${i + 1}: "${t}" אינו מספר`);
      sum += n;
    }
    return sum;
  });
}

const os = require("node:os");
const path = require("node:path");
const file = path.join(os.tmpdir(), "p10-e73.txt");
require("node:fs").writeFileSync(file, "10\n 2.5\n\n7\n");
sumFile(file)
  .then(console.log)
  .then(() => {
    require("node:fs").writeFileSync(file, "10\nעשרים\n");
    return sumFile(file);
  })
  .catch((e) => console.log(e.message));

module.exports = { sumFile };
