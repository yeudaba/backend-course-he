// P30-E29: סקירה של diff שעוזר AI הציע
export interface Finding {
  file: string;
  line: number;
  rule: "test-disabled" | "assertion-removed" | "new-dependency" | "dangerous-eval" | "type-escape";
}

export function reviewDiff(diff: string): Finding[] {
  return []; // כתוב כאן
}
