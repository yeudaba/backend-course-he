// P11-E62: מידות בגדים
export type Size = "S" | "M" | "L" | "XL";

export function parseSize(text: string): Size | null {
  const t = text.trim().toUpperCase();
  switch (t) {
    case "S":
    case "M":
    case "L":
    case "XL":
      return t;
    default:
      return null;
  }
}

export function surcharge(s: Size): number {
  switch (s) {
    case "S":
    case "M":
      return 0;
    case "L":
      return 5;
    case "XL":
      return 10;
    default: {
      const unhandled: never = s;
      throw new Error(`מידה לא מוכרת: ${unhandled}`);
    }
  }
}

for (const input of [" m ", "xl", "XXL"]) {
  const size = parseSize(input);
  console.log(JSON.stringify(input), size, size === null ? "-" : surcharge(size));
}
