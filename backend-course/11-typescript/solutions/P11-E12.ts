// P11-E12
export function toNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const text = value.trim();
    if (text === "") {
      return null;
    }
    const n = Number(text);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

console.log(toNumber(" 12.5 "), toNumber(""), toNumber(true), toNumber(Infinity));
