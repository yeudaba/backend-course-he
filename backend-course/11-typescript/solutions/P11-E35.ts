// P11-E35: ראשי תיבות
export function initials(fullName: string): string {
  return fullName
    .split(" ")
    .filter((w) => w !== "")
    .map((w) => w[0].toUpperCase() + ".")
    .join("");
}

console.log(initials("dana cohen"));
console.log(initials("  Omer   ben  ami "));
console.log(JSON.stringify(initials("")));
