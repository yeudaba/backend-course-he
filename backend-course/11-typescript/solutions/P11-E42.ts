// P11-E42: מספרים משורת CSV
export function parseNumbers(line: string): number[] {
  return line
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "")
    .map(Number)
    .filter((n) => !Number.isNaN(n));
}

export function sumLine(line: string): number {
  return parseNumbers(line).reduce((s, n) => s + n, 0);
}

console.log(parseNumbers("10, 2.5,abc,, -3 "));
console.log(sumLine("10, 2.5,abc,, -3 "), sumLine(""));
