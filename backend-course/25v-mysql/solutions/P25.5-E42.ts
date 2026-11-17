// P25.5-E42: יכנס לעמודה? תווים, בתים ו־utf8mb3
export function mysqlLength(value: string) {
  return { chars: [...value].length, bytes: Buffer.byteLength(value, "utf8") };
}

export function columnProblems(value: string, { maxChars, charset }: { maxChars: number; charset: "utf8mb3" | "utf8mb4" }): string[] {
  const problems: string[] = [];
  if (mysqlLength(value).chars > maxChars) problems.push("too-long");
  if (charset === "utf8mb3" && [...value].some((c) => c.codePointAt(0)! > 0xffff)) problems.push("needs-utf8mb4");
  return problems;
}

console.log(mysqlLength("חם 🔥"), "חם 🔥".length);
console.log(columnProblems("קפה ☕", { maxChars: 5, charset: "utf8mb3" }), columnProblems("חם 🔥!", { maxChars: 5, charset: "utf8mb3" }));
