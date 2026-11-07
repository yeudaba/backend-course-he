// P10-E20: שלושה באגים. cb(err) או cb(null, settings) — בדיוק פעם אחת, בלי לקרוס.
// settings = { theme: "light", ...מה שבקובץ }
const fs = require("node:fs");

function loadSettings(file, cb) {
  fs.readFile(file, "utf8", (err, text) => {
    if (err) {
      cb(err);
    }
    const settings = JSON.parse(text);
    cb(null, { theme: "light", ...settings });
  });
}

module.exports = { loadSettings };
