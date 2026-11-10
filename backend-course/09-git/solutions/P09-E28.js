// P09-E28: .gitignore קטן משלך
function matches(filePath, rule) {
  if (rule.endsWith("/")) {
    return filePath.startsWith(rule) || filePath.includes("/" + rule);
  }
  if (rule.startsWith("*.")) {
    return filePath.endsWith(rule.slice(1));
  }
  return filePath === rule || filePath.endsWith("/" + rule);
}

function isIgnored(filePath, gitignore) {
  const rules = gitignore
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "" && !line.startsWith("#"));
  return rules.some((rule) => matches(filePath, rule));
}

const gitignore = `
# תלויות
node_modules/
*.log
.env
`;
for (const p of ["node_modules/lodash/index.js", "src/app.log", "config/.env", ".env.example", "src/index.js"]) {
  console.log(p.padEnd(30), isIgnored(p, gitignore));
}

module.exports = { isIgnored };
