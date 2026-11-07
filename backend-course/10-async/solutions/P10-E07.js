// P10-E07: callback בסגנון error-first
const fs = require("node:fs");

function readJson(file, callback) {
  fs.readFile(file, "utf8", (err, text) => {
    if (err) {
      callback(err);
      return;
    }
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      callback(parseError);
      return;
    }
    callback(null, data);
  });
}

readJson("/no/such.json", (err) => console.log(err.code));

module.exports = { readJson };
