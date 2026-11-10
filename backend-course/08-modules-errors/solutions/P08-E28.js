// P08-E28: מפרש פקודות
function parseCommand(line) {
  const [word, ...rest] = line.trim().split(" ").filter((w) => w !== "");
  if (word === undefined) {
    throw new Error("לא הוקלדה פקודה");
  }

  switch (word.toLowerCase()) {
    case "add": {
      const amount = Number(rest[0]);
      if (rest.length === 0 || !Number.isFinite(amount) || amount <= 0) {
        throw new Error("סכום לא תקין");
      }
      return { cmd: "add", amount, note: rest.slice(1).join(" ") };
    }
    case "list":
      return { cmd: "list" };
    case "total":
      return { cmd: "total" };
    default:
      throw new Error(`פקודה לא מוכרת: "${word}"`);
  }
}

console.log(parseCommand("  add 25   קפה בבוקר "));
for (const line of ["add abc", "", "delete 3"]) {
  try {
    parseCommand(line);
  } catch (err) {
    console.log(err.message);
  }
}

module.exports = { parseCommand };
