// P23-E36: הרשאות — אותיות ↔ מספרים
export function toOctal(perms: string): string {
  if (!/^[-dl]([r-][w-][x-]){3}$/.test(perms)) throw new Error(`הרשאות לא תקינות: ${perms}`);
  let out = "";
  for (let i = 0; i < 3; i++) {
    const t = perms.slice(1 + i * 3, 4 + i * 3);
    out += (t[0] === "r" ? 4 : 0) + (t[1] === "w" ? 2 : 0) + (t[2] === "x" ? 1 : 0);
  }
  return out;
}

export function fromOctal(octal: string): string {
  if (!/^[0-7]{3}$/.test(octal)) throw new Error(`מספר לא תקין: ${octal}`);
  return [...octal]
    .map(Number)
    .map((d) => (d & 4 ? "r" : "-") + (d & 2 ? "w" : "-") + (d & 1 ? "x" : "-"))
    .join("");
}
