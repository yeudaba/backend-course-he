// P30-E55: פרטים שלא שייכים לקורות חיים
const RULES: [string, RegExp][] = [
  ["age", /\bage\s*:?\s*\d{2}\b|\b\d{2}\s*years old\b|גיל\s*:?\s*\d{2}/i],
  ["birth", /\b(born|date of birth|dob)\b|תאריך לידה/i],
  ["marital", /\b(married|single|divorced)\b|נשוי|נשואה|רווק|רווקה/i],
  ["id", /(\bID\b|ת[.״"]ז)[\s:.]*\d{5,9}\b/i],
  ["photo", /!\[[^\]]*\]\([^)]*\)/],
];

export function personalInfo(text: string): string[] {
  return RULES.map(([kind]) => kind);
}
