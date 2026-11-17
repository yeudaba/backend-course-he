// P10-E52: שני קבצים, אחד אחרי השני
const fs = require("node:fs");

function joinFiles(fileA, fileB, callback) {
  fs.readFile(fileA, "utf8", (err, a) => {
    if (err) {
      callback(err);
      return;
    }
    fs.readFile(fileB, "utf8", (err, b) => {
      if (err) {
        callback(err);
        return;
      }
      callback(null, a + b);
    });
  });
}

const os = require("node:os");
const path = require("node:path");
const head = path.join(os.tmpdir(), "p10-e52-head.txt");
const body = path.join(os.tmpdir(), "p10-e52-body.txt");
fs.writeFileSync(head, "כותרת\n");
fs.writeFileSync(body, "גוף\n");
joinFiles(head, body, (err, text) => {
  console.log(err);
  console.log(text);
  joinFiles(head, "/no/such/file.txt", (err) => console.log("נכשל:", err.code));
});

module.exports = { joinFiles };
