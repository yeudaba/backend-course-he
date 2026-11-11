// P10-E51: שורות מקובץ
const fs = require("node:fs");

function readLines(file, callback) {
  fs.readFile(file, "utf8", (err, text) => {
    if (err) {
      callback(err);
      return;
    }
    const lines = text.split("\n");
    if (lines[lines.length - 1] === "") lines.pop();
    callback(null, lines);
  });
}

const os = require("node:os");
const path = require("node:path");
const file = path.join(os.tmpdir(), "p10-e51.txt");
fs.writeFileSync(file, "קפה\nחלב\nלחם\n");
readLines(file, (err, lines) => {
  console.log(err, lines);
  readLines("/no/such/file.txt", (err) => console.log(err.code));
});

module.exports = { readLines };
