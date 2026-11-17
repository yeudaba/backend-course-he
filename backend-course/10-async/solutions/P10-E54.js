// P10-E54: לעטוף readFile ב־Promise
const fs = require("node:fs");

function readText(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, "utf8", (err, text) => {
      if (err) {
        reject(err);
      } else {
        resolve(text);
      }
    });
  });
}

function readUpper(file) {
  return readText(file).then((t) => t.toUpperCase());
}

const os = require("node:os");
const path = require("node:path");
const file = path.join(os.tmpdir(), "p10-e54.txt");
fs.writeFileSync(file, "hello");
readText(file)
  .then((t) => console.log(t))
  .then(() => readUpper(file))
  .then((t) => console.log(t))
  .then(() => readText("/no/such.txt"))
  .catch((e) => console.log(e.code));

module.exports = { readText, readUpper };
