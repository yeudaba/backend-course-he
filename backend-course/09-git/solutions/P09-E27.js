// P09-E27: ניתוח של git log
function parseLog(text) {
  return text
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const i = line.indexOf(" ");
      return { hash: line.slice(0, i), message: line.slice(i + 1) };
    });
}

function typeOf(message) {
  const i = message.indexOf(":");
  if (i <= 0) return "other";
  const type = message.slice(0, i);
  return type.includes(" ") ? "other" : type.toLowerCase();
}

function countTypes(commits) {
  const counts = {};
  for (const { message } of commits) {
    const type = typeOf(message);
    counts[type] = (counts[type] ?? 0) + 1;
  }
  return counts;
}

const log = `a1b2c3d feat: add login
9f8e7d6 fix: wrong total
5a4b3c2 Update README
1122334 feat: add logout
`;
const commits = parseLog(log);
console.log(commits[2]);
console.log(countTypes(commits));

module.exports = { parseLog, countTypes };
