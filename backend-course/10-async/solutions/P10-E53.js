// P10-E53: לשמור JSON
const fs = require("node:fs");

function saveJson(file, data, callback) {
  let text;
  try {
    text = JSON.stringify(data, null, 2);
  } catch (err) {
    setTimeout(() => callback(err), 0);
    return;
  }
  fs.writeFile(file, text, (err) => {
    if (err) {
      callback(err);
      return;
    }
    callback(null);
  });
}

const os = require("node:os");
const path = require("node:path");
const file = path.join(os.tmpdir(), "p10-e53.json");
saveJson(file, { theme: "dark", fonts: [12, 14] }, (err) => {
  console.log("נשמר?", err === null);
  console.log(fs.readFileSync(file, "utf8"));
  saveJson(file, { n: 10n }, (err) => console.log(err.message));
});

module.exports = { saveJson };
