// P10-E58: לקרוא את כל הקבצים במקביל
const fs = require("node:fs");

function readAll(files, callback) {
  if (files.length === 0) {
    setTimeout(() => callback(null, []), 0);
    return;
  }
  const texts = [];
  let left = files.length;
  let finished = false;
  files.forEach((file, i) => {
    fs.readFile(file, "utf8", (err, text) => {
      if (finished) return;
      if (err) {
        finished = true;
        callback(err);
        return;
      }
      texts[i] = text;
      left--;
      if (left === 0) {
        finished = true;
        callback(null, texts);
      }
    });
  });
}

const os = require("node:os");
const path = require("node:path");
const a = path.join(os.tmpdir(), "p10-e58-a.txt");
const b = path.join(os.tmpdir(), "p10-e58-b.txt");
fs.writeFileSync(a, "ראשון");
fs.writeFileSync(b, "שני");
readAll([a, b, a], (err, texts) => {
  console.log(err, texts);
  readAll([a, "/no/such.txt", b], (err) => console.log("נכשל:", err.code));
});

module.exports = { readAll };
