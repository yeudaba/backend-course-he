const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

function summaryLine(problems) {
  if (problems.length === 0) {
    return "";
  }
  const errors = problems.filter((p) => p.severity === "error").length;
  const warnings = problems.length - errors;
  return `✖ ${plural(problems.length, "problem")} (${plural(errors, "error")}, ${plural(warnings, "warning")})`;
}

console.log(summaryLine([{ severity: "error" }, { severity: "warning" }, { severity: "warning" }]));

module.exports = { summaryLine };
