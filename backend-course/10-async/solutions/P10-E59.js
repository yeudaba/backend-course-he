// P10-E59: משתמשים מקובץ CSV
const fs = require("node:fs");

function loadUsers(file, callback) {
  fs.readFile(file, "utf8", (err, text) => {
    if (err) {
      callback(err);
      return;
    }
    const lines = text.split("\n");
    const users = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === "") continue;
      const parts = lines[i].split(",").map((p) => p.trim());
      const age = Number(parts[1]);
      if (parts.length !== 3 || parts[1] === "" || Number.isNaN(age)) {
        callback(new Error(`שורה ${i + 1} לא תקינה`));
        return;
      }
      users.push({ name: parts[0], age, city: parts[2] });
    }
    callback(null, users);
  });
}

const os = require("node:os");
const path = require("node:path");
const file = path.join(os.tmpdir(), "p10-e59.csv");
fs.writeFileSync(file, "name,age,city\nדנה, 31 ,חיפה\nעומר,27,תל אביב\n");
loadUsers(file, (err, users) => {
  console.log(users);
  fs.writeFileSync(file, "name,age,city\nדנה,31,חיפה\nעומר,זקן,תל אביב\n");
  loadUsers(file, (err) => console.log(err.message));
});

module.exports = { loadUsers };
