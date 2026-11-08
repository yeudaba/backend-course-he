// P25-E16: migration שלא שובר את הגרסה שעוד רצה
export interface Finding {
  line: number;
  rule: "drop-column" | "drop-table" | "rename" | "not-null-without-default" | "alter-type" | "index-without-concurrently";
  message: string;
}

export function checkMigration(sql: string): Finding[] {
  return []; // כתוב כאן
}
