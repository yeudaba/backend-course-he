function formatProblem({ line, column, severity, message, rule }) {
  return `  ${line}:${column}  ${severity}  ${message}  ${rule}`;
}

console.log(formatProblem({ line: 1, column: 1, severity: "error", message: "Unexpected var, use let or const instead", rule: "no-var" }));

module.exports = { formatProblem };
