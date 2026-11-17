// P10-E68: העתק באותיות גדולות
const fs = require("node:fs/promises");

function copyUpper(src, dest) {
  return fs.readFile(src, "utf8").then((text) => {
    const upper = text.toUpperCase();
    return fs.writeFile(dest, upper).then(() => upper.length);
  });
}

const os = require("node:os");
const path = require("node:path");
const a = path.join(os.tmpdir(), "p10-e68-a.txt");
const b = path.join(os.tmpdir(), "p10-e68-b.txt");
require("node:fs").writeFileSync(a, "hello");
copyUpper(a, b)
  .then((n) => console.log(n, require("node:fs").readFileSync(b, "utf8")))
  .then(() => copyUpper("/no/such.txt", b))
  .catch((e) => console.log(e.code));

module.exports = { copyUpper };
