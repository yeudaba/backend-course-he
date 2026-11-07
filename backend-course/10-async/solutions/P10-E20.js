// P10-E20: מתוקן
const fs = require("node:fs");

function loadSettings(file, cb) {
  fs.readFile(file, "utf8", (err, text) => {
    if (err) {
      cb(err);
      return;
    }
    let settings;
    try {
      settings = JSON.parse(text);
    } catch (parseErr) {
      cb(parseErr);
      return;
    }
    cb(null, { theme: "light", ...settings });
  });
}

module.exports = { loadSettings };
